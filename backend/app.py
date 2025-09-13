import io
import os
import hashlib
import zipfile
from datetime import datetime
import base64
import json
import requests

from flask import Flask, request, jsonify, send_file, render_template_string, redirect
from flask_cors import CORS
from sqlalchemy import create_engine, Column, String, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
import pandas as pd
import qrcode # type: ignore # type: ignore
from PIL import Image, ImageDraw, ImageFont
import tempfile
import hmac

try:
    # When running as a package (python -m backend.app)
    from .stego_lsb import embed_message, extract_message
except Exception:
    # When running as a script from the backend directory (python app.py)
    from stego_lsb import embed_message, extract_message
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader # type: ignore
from reportlab.pdfgen import canvas # type: ignore


# Configuration
PUBLIC_VERIFY_BASE = os.environ.get('PUBLIC_VERIFY_BASE', 'http://127.0.0.1:5000/verify')
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///certificates.db')

app = Flask(__name__)
# Allow frontend to call API from any origin (adjust to your domain in production)
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Disposition"],
)

# Increase maximum request size to handle large files and data
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB limit


# Database setup
Base = declarative_base()
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Certificate(Base):
    __tablename__ = 'certificates'

    cert_hash = Column(String(64), primary_key=True)
    recipient_name = Column(String(255), nullable=False)
    course_name = Column(String(255), nullable=False)
    certificate_date = Column(String(64), nullable=False)
    issuing_organization = Column(String(255), nullable=False)
    certificate_title = Column(String(255), nullable=True)
    certificate_description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


REQUIRED_COLUMNS = [
    'Recipient Name',
    'Course Name',
    'Certificate Date',
    'Issuing Organization',
    'Certificate Title',
    'Certificate Description',
]


def compute_cert_hash(recipient_name: str, course_name: str, certificate_date: str, issuing_org: str) -> str:
    raw = f"{recipient_name}{course_name}{certificate_date}{issuing_org}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()


def normalize_username(raw: str) -> str:
    # Preserve case; trim and collapse internal whitespace to a single space
    s = (raw or '').strip()
    parts = s.split()
    return ' '.join(parts)


def generate_qr_image(verification_url: str):
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M,
                       box_size=8, border=2)
    qr.add_data(verification_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    return img


def draw_hidden_watermark(*args, **kwargs):
    # Deprecated: visible/printed watermark removed as per requirements
    return


def _scale_position(x: float, y: float, ref_width: float, ref_height: float, target_width: float, target_height: float):
    try:
        # Calculate scaling factors
        sx = max(target_width / float(ref_width), 0.0001)
        sy = max(target_height / float(ref_height), 0.0001)
        
        # Scale the coordinates
        scaled_x = x * sx
        scaled_y = y * sy
        
        return scaled_x, scaled_y
    except Exception as e:
        print(f"Error in _scale_position: {e}")
        return x, y


def build_certificate_pdf_bytes(data: dict, qr_img, layout: dict | None = None) -> bytes:
    # Prepare PDF in memory
    buffer = io.BytesIO()

    ref_w = 800.0
    ref_h = 600.0

    # Determine page size based on certificate reference dimensions from the layout
    if layout:
        ref_dims = layout.get('referenceDimensions') or {'width': 800, 'height': 600}
        try:
            ref_w = float(ref_dims.get('width', 800))
            ref_h = float(ref_dims.get('height', 600))
        except Exception:
            ref_w, ref_h = 800.0, 600.0

    # Make PDF page size exactly match the preview reference dimensions to avoid rounding errors
    width, height = ref_w, ref_h
    c = canvas.Canvas(buffer, pagesize=(width, height))

    if layout:
        # Optional border image as background (prefer embedded DataURL; fallback to URL fetch)
        border_data_url = layout.get('borderImageDataUrl') or ''
        if isinstance(border_data_url, str) and border_data_url.startswith('data:image'):
            try:
                header, b64 = border_data_url.split(',', 1)
                img_bytes = io.BytesIO(base64.b64decode(b64))
                img_reader = ImageReader(img_bytes)
                c.drawImage(img_reader, 0, 0, width, height, mask='auto')
            except Exception:
                pass
        else:
            border_url = layout.get('borderImageUrlAbsolute') or layout.get('borderImageUrl')
            if border_url:
                try:
                    resp = requests.get(border_url, timeout=10)
                    if resp.ok:
                        img_reader = ImageReader(io.BytesIO(resp.content))
                        c.drawImage(img_reader, 0, 0, width, height, mask='auto')
                except Exception:
                    pass

        elements = layout.get('elements') or {}

        def draw_text(el_key: str, text: str, fallback_font=("Helvetica", 12)):
            el = elements.get(el_key) or {}
            pos = el.get('position') or {'x': 80, 'y': height - 160}
            style = el.get('style') or {}
            # ReportLab supports a limited set of built-in fonts. To avoid KeyErrors when
            # a web font (e.g., Roboto) is selected in the UI, we always fall back to
            # Helvetica / Helvetica-Bold here.
            font_size = int(str(style.get('fontSize', fallback_font[1])).replace('px', '')) if isinstance(style.get('fontSize'), (str, int)) else fallback_font[1]
            font_weight = style.get('fontWeight', 'normal')
            color_hex = style.get('color', '#000000')
            text_align = style.get('textAlign', 'left')

            # Optional container width from layout for proper centering (matches preview box width)
            box_width = el.get('boxWidth')
            # Reasonable defaults if not provided
            default_box_widths = {
                'title': 400, 'intro': 300, 'name': 200, 'paragraph': 400,
                'course': 300, 'date': 200, 'issuer': 240
            }
            if not isinstance(box_width, (int, float)):
                box_width = default_box_widths.get(el_key, 300)

            # Convert color hex to RGB
            try:
                color_hex = color_hex.lstrip('#')
                r, g, b = tuple(int(color_hex[i:i+2], 16) / 255 for i in (0, 2, 4))
            except Exception:
                r, g, b = 0, 0, 0

            c.setFillColorRGB(r, g, b)
            safe_font = "Helvetica-Bold" if str(font_weight).lower() == 'bold' or str(font_weight) == '700' else "Helvetica"
            c.setFont(safe_font, font_size)

            # Get position from element (left/top anchor in preview coordinates)
            px = float(pos.get('x', 80))
            py = float(pos.get('y', 80))

            # Scale coordinates to PDF dimensions (now 1:1 with reference dims)
            px_scaled = (px / ref_w) * width
            py_scaled = (py / ref_h) * height

            # Frontend Y is top-down; PDF Y is bottom-up
            py_final = height - py_scaled

            # Compute alignment within the container box
            container_width_scaled = (float(box_width) / ref_w) * width

            # Determine anchor X based on alignment
            if text_align == 'center':
                anchor_x = px_scaled + (container_width_scaled / 2)
                draw_fn = 'center'
            elif text_align == 'right':
                anchor_x = px_scaled + container_width_scaled
                draw_fn = 'right'
            else:  # left
                anchor_x = px_scaled
                draw_fn = 'left'

            # Apply small padding away from edges
            anchor_x = max(min(anchor_x, width - 10), 10)

            # Draw text using appropriate alignment function
            if draw_fn == 'center':
                c.drawCentredString(anchor_x, py_final, text)
            elif draw_fn == 'right':
                c.drawRightString(anchor_x, py_final, text)
            else:
                c.drawString(anchor_x, py_final, text)

        draw_text('title', data.get('Certificate Title') or 'Certificate of Completion', ("Helvetica-Bold", 22))
        draw_text('intro', 'This is to certify that', ("Helvetica", 14))
        draw_text('name', data.get('Recipient Name') or '', ("Helvetica-Bold", 24))
        # paragraph will use description
        draw_text('paragraph', data.get('Certificate Description') or '', ("Helvetica", 12))
        draw_text('course', data.get('Course Name') or '', ("Helvetica", 14))
        draw_text('date', data.get('Certificate Date') or '', ("Helvetica", 12))
        draw_text('issuer', f"Issued by: {data.get('Issuing Organization') or ''}", ("Helvetica", 12))

        # QR placement according to preview position
        qr_drawn = False
        qr_el = (elements.get('qr') or elements.get('QR') or elements.get('qrcode'))
        if qr_el:
            qpos = qr_el.get('position') or {'x': width - 160, 'y': 60}
            qx = float(qpos.get('x', width - 160))
            qy = float(qpos.get('y', 60))

            # Scale coordinates to PDF dimensions using the same logic as text
            qx_scaled = (qx / ref_w) * width
            qy_scaled = (qy / ref_h) * height

            # Flip Y coordinate for PDF coordinate system
            qy_final = height - qy_scaled

            qr_size = int(qr_el.get('size') or 120)
            qr_size_scaled = (qr_size / ref_w) * width

            qr_bytes = io.BytesIO()
            qr_img.save(qr_bytes, format='PNG')
            qr_bytes.seek(0)
            qr_reader = ImageReader(qr_bytes)
            c.drawImage(qr_reader, qx_scaled, qy_final, qr_size_scaled, qr_size_scaled, mask='auto')
            qr_drawn = True
    else:
        # Default simple layout
        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(width / 2, height - 100, data.get('Certificate Title') or 'Certificate of Completion')
        c.setFont("Helvetica", 12)
        c.drawString(80, height - 160, f"Recipient: {data.get('Recipient Name')}")
        c.drawString(80, height - 180, f"Course: {data.get('Course Name')}")
        c.drawString(80, height - 200, f"Date: {data.get('Certificate Date')}")
        c.drawString(80, height - 220, f"Issued by: {data.get('Issuing Organization')}")
        desc = data.get('Certificate Description') or ''
        max_width = width - 160
        lines = []
        current = ''
        for word in desc.split():
            trial = (current + ' ' + word).strip()
            if c.stringWidth(trial, "Helvetica", 12) <= max_width:
                current = trial
            else:
                lines.append(current)
                current = word
        if current:
            lines.append(current)
        y = height - 260
        for line in lines[:8]:
            c.drawString(80, y, line)
            y -= 16

    # If no QR was drawn in the layout block, draw a fallback bottom-right QR once
    try:
        if not locals().get('qr_drawn', False):
            qr_bytes = io.BytesIO()
            qr_img.save(qr_bytes, format='PNG')
            qr_bytes.seek(0)
            qr_reader = ImageReader(qr_bytes)
            qr_size = 120
            # Position in bottom-right corner
            c.drawImage(qr_reader, width - qr_size - 40, 40, qr_size, qr_size, mask='auto')
    except Exception as e:
        print(f"Error drawing fallback QR code: {e}")
        pass

    # Visible watermark removed; no-op

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.read()


def _load_border_image_from_layout(layout: dict | None, width: int, height: int) -> Image.Image | None:
    if not layout:
        return None
    border_data_url = layout.get('borderImageDataUrl') or ''
    if isinstance(border_data_url, str) and border_data_url.startswith('data:image'):
        try:
            header, b64 = border_data_url.split(',', 1)
            img_bytes = io.BytesIO(base64.b64decode(b64))
            img = Image.open(img_bytes).convert('RGBA')
            return img.resize((width, height), Image.LANCZOS)
        except Exception:
            pass
    else:
        border_url = layout.get('borderImageUrlAbsolute') or layout.get('borderImageUrl')
        if border_url:
            try:
                resp = requests.get(border_url, timeout=10)
                if resp.ok:
                    img = Image.open(io.BytesIO(resp.content)).convert('RGBA')
                    return img.resize((width, height), Image.LANCZOS)
            except Exception:
                pass
    return None


def build_certificate_png_bytes(data: dict, qr_img, layout: dict | None = None) -> bytes:
    # Determine reference dimensions
    ref_w = 800
    ref_h = 600
    if layout:
        ref_dims = layout.get('referenceDimensions') or {'width': 800, 'height': 600}
        try:
            ref_w = int(float(ref_dims.get('width', 800)))
            ref_h = int(float(ref_dims.get('height', 600)))
        except Exception:
            ref_w, ref_h = 800, 600

    width, height = ref_w, ref_h

    # Base image (RGBA for compositing)
    base = Image.new('RGBA', (width, height), (255, 255, 255, 255))

    # Background/border
    bg = _load_border_image_from_layout(layout, width, height)
    if bg is not None:
        base.alpha_composite(bg)

    draw = ImageDraw.Draw(base)

    def _safe_font(bold: bool, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
        # Try common fonts; fall back to default bitmap font
        candidates = [
            ("arialbd.ttf" if bold else "arial.ttf", size),
            ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf", size),
        ]
        for name, sz in candidates:
            try:
                return ImageFont.truetype(name, sz)
            except Exception:
                continue
        return ImageFont.load_default()

    if layout:
        elements = layout.get('elements') or {}

        def draw_text(el_key: str, text: str, fallback=(False, 12)):
            el = elements.get(el_key) or {}
            pos = el.get('position') or {'x': 80, 'y': height - 160}
            style = el.get('style') or {}
            font_size = int(str(style.get('fontSize', fallback[1])).replace('px', '')) if isinstance(style.get('fontSize'), (str, int)) else fallback[1]
            font_weight = str(style.get('fontWeight', 'normal')).lower()
            color_hex = style.get('color', '#000000')
            text_align = style.get('textAlign', 'left')

            box_width = el.get('boxWidth')
            default_box_widths = {
                'title': 400, 'intro': 300, 'name': 200, 'paragraph': 400,
                'course': 300, 'date': 200, 'issuer': 240
            }
            if not isinstance(box_width, (int, float)):
                box_width = default_box_widths.get(el_key, 300)

            try:
                color_hex_str = str(color_hex).lstrip('#')
                r = int(color_hex_str[0:2], 16)
                g = int(color_hex_str[2:4], 16)
                b = int(color_hex_str[4:6], 16)
                color = (r, g, b, 255)
            except Exception:
                color = (0, 0, 0, 255)

            bold = font_weight == 'bold' or font_weight == '700'
            font = _safe_font(bold, font_size)

            px = float(pos.get('x', 80))
            py = float(pos.get('y', 80))
            px_scaled = (px / ref_w) * width
            py_scaled = (py / ref_h) * height
            py_final = py_scaled  # PIL uses top-left origin

            container_width_scaled = (float(box_width) / ref_w) * width

            # Compute text x based on alignment
            text_w, _ = draw.textbbox((0, 0), text, font=font)[2:4]
            if text_align == 'center':
                anchor_x = px_scaled + (container_width_scaled / 2)
                text_x = anchor_x - (text_w / 2)
            elif text_align == 'right':
                anchor_x = px_scaled + container_width_scaled
                text_x = anchor_x - text_w
            else:
                text_x = px_scaled

            text_x = max(min(text_x, width - 10), 10)
            draw.text((text_x, py_final), text, fill=color, font=font)

        draw_text('title', data.get('Certificate Title') or 'Certificate of Completion', (True, 22))
        draw_text('intro', 'This is to certify that', (False, 14))
        draw_text('name', data.get('Recipient Name') or '', (True, 24))
        draw_text('paragraph', data.get('Certificate Description') or '', (False, 12))
        draw_text('course', data.get('Course Name') or '', (False, 14))
        draw_text('date', data.get('Certificate Date') or '', (False, 12))
        draw_text('issuer', f"Issued by: {data.get('Issuing Organization') or ''}", (False, 12))

        # QR placement
        qr_drawn = False
        qr_el = (elements.get('qr') or elements.get('QR') or elements.get('qrcode'))
        if qr_el:
            qpos = qr_el.get('position') or {'x': width - 160, 'y': 60}
            qx = float(qpos.get('x', width - 160))
            qy = float(qpos.get('y', 60))
            qx_scaled = int((qx / ref_w) * width)
            qy_scaled = int((qy / ref_h) * height)
            qr_size = int(qr_el.get('size') or 120)
            qr_size_scaled = int((qr_size / ref_w) * width)

            qr_bytes = io.BytesIO()
            qr_img.save(qr_bytes, format='PNG')
            qr_bytes.seek(0)
            qr_pil = Image.open(qr_bytes).convert('RGBA').resize((qr_size_scaled, qr_size_scaled), Image.NEAREST)
            base.alpha_composite(qr_pil, dest=(qx_scaled, qy_scaled))
            qr_drawn = True
        if not qr_drawn:
            qr_size = 120
            qr_pil = qr_img.convert('RGBA').resize((qr_size, qr_size), Image.NEAREST)
            base.alpha_composite(qr_pil, dest=(width - qr_size - 40, height - qr_size - 40))
    else:
        # Simple default layout
        title_font = _safe_font(True, 22)
        body_font = _safe_font(False, 12)
        draw.text((width / 2 - 180, 40), data.get('Certificate Title') or 'Certificate of Completion', fill=(0, 0, 0, 255), font=title_font)
        draw.text((80, 100), f"Recipient: {data.get('Recipient Name')}", fill=(0, 0, 0, 255), font=body_font)
        draw.text((80, 120), f"Course: {data.get('Course Name')}", fill=(0, 0, 0, 255), font=body_font)
        draw.text((80, 140), f"Date: {data.get('Certificate Date')}", fill=(0, 0, 0, 255), font=body_font)
        draw.text((80, 160), f"Issued by: {data.get('Issuing Organization')}", fill=(0, 0, 0, 255), font=body_font)

        qr_pil = qr_img.convert('RGBA').resize((120, 120), Image.NEAREST)
        base.alpha_composite(qr_pil, dest=(width - 160, height - 160))

    # Export to PNG bytes (without stego)
    out = io.BytesIO()
    base.convert('RGB').save(out, format='PNG')
    out.seek(0)
    return out.read()


@app.post('/generate_png')
def generate_png():
    try:
        payload = request.get_json(silent=True) or {}
        data = payload.get('data') or {}
        layout = payload.get('layout')

        recipient = str(data.get('Recipient Name', '')).strip()
        course = str(data.get('Course Name', '')).strip()
        cert_date = str(data.get('Certificate Date', '')).strip()
        issuer = str(data.get('Issuing Organization', '')).strip()
        title = str(data.get('Certificate Title', '')).strip()
        desc = str(data.get('Certificate Description', '')).strip()

        # Compute verification hash as before to create QR code URL
        cert_hash = compute_cert_hash(recipient, course, cert_date, issuer)
        verify_url = f"{PUBLIC_VERIFY_BASE}?cert_id={cert_hash}"
        qr_img = generate_qr_image(verify_url)

        # Build base PNG bytes
        png_bytes = build_certificate_png_bytes({
            'Recipient Name': recipient,
            'Course Name': course,
            'Certificate Date': cert_date,
            'Issuing Organization': issuer,
            'Certificate Title': title,
            'Certificate Description': desc,
        }, qr_img, layout)

        # Compute SHA-256 of normalized username (recipient name)
        username_string = normalize_username(recipient)
        sha = hashlib.sha256(username_string.encode('utf-8')).hexdigest()

        # Write to temp, embed stego, return
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_in:
            tmp_in.write(png_bytes)
            tmp_in.flush()
            in_path = tmp_in.name
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_out:
            out_path = tmp_out.name
        try:
            embed_message(in_path, out_path, sha)
            with open(out_path, 'rb') as f:
                final_png = f.read()
        finally:
            try:
                os.remove(in_path)
            except Exception:
                pass
            try:
                os.remove(out_path)
            except Exception:
                pass

        return send_file(io.BytesIO(final_png), mimetype='image/png', as_attachment=True, download_name='certificate.png')
    except Exception as e:
        return jsonify({"error": f"Failed to generate PNG: {str(e)}"}), 500


@app.post('/bulk_generate')
def bulk_generate():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Debug form data
        print(f"=== FORM DATA DEBUG ===")
        print(f"Form keys: {list(request.form.keys())}")
        print(f"Files keys: {list(request.files.keys())}")
        if 'layout' in request.form:
            print(f"Layout data present: {len(request.form['layout'])} characters")
        else:
            print("Layout data NOT present in form")
        print(f"=== END FORM DATA DEBUG ===")

        filename = file.filename.lower()
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(file)
            elif filename.endswith('.xlsx'):
                # openpyxl is the default modern engine for .xlsx
                df = pd.read_excel(file, engine='openpyxl')
            else:
                return jsonify({"error": "Unsupported file type. Please upload .csv or .xlsx"}), 400
        except Exception as e:
            return jsonify({"error": f"Failed to read file: {str(e)}"}), 400

        # Optional layout JSON (from preview) to replicate styling
        layout = None
        if 'layout' in request.form:
            try:
                layout_data = request.form['layout'] or '{}'
                print(f"Raw layout data: {layout_data[:200]}...")  # Show first 200 chars
                layout = json.loads(layout_data)
                
                # Check if layout is empty or has no elements
                if not layout or not layout.get('elements'):
                    print("WARNING: Layout is empty or has no elements, using default layout")
                    layout = None
                else:
                    print(f"=== LAYOUT DEBUG INFO ===")
                    print(f"Received layout with {len(layout.get('elements', {}))} elements")
                    print(f"Layout reference dimensions: {layout.get('referenceDimensions')}")
                    print(f"Layout elements: {list(layout.get('elements', {}).keys())}")
                    print(f"Full layout data: {json.dumps(layout, indent=2)}")
                    print(f"=== END LAYOUT DEBUG ===")
            except Exception as e:
                print(f"Failed to parse layout JSON: {e}")
                print(f"Raw layout data that failed: {request.form['layout'][:500]}...")
                layout = None
        else:
            print("ERROR: No layout data found in form")
            print(f"Available form keys: {list(request.form.keys())}")
            print(f"Available files keys: {list(request.files.keys())}")

        # Validate columns
        missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing:
            return jsonify({"error": f"Missing required columns: {', '.join(missing)}"}), 400

        print(f"Processing {len(df)} rows for bulk generation")

        # Prepare ZIP in memory
        zip_mem = io.BytesIO()
        zf = zipfile.ZipFile(zip_mem, mode='w', compression=zipfile.ZIP_DEFLATED)

        created = 0
        session = SessionLocal()
        try:
            for idx, row in df.iterrows():
                recipient = str(row['Recipient Name']).strip()
                course = str(row['Course Name']).strip()
                cert_date = str(row['Certificate Date']).strip()
                issuer = str(row['Issuing Organization']).strip()
                title = str(row['Certificate Title']).strip() if not pd.isna(row['Certificate Title']) else ''
                desc = str(row['Certificate Description']).strip() if not pd.isna(row['Certificate Description']) else ''

                cert_hash = compute_cert_hash(recipient, course, cert_date, issuer)

                # Upsert into DB
                existing = session.get(Certificate, cert_hash)
                if not existing:
                    session.add(Certificate(
                        cert_hash=cert_hash,
                        recipient_name=recipient,
                        course_name=course,
                        certificate_date=cert_date,
                        issuing_organization=issuer,
                        certificate_title=title,
                        certificate_description=desc,
                    ))
                else:
                    # Update fields without changing key
                    existing.recipient_name = recipient
                    existing.course_name = course
                    existing.certificate_date = cert_date
                    existing.issuing_organization = issuer
                    existing.certificate_title = title
                    existing.certificate_description = desc

                verify_url = f"{PUBLIC_VERIFY_BASE}?cert_id={cert_hash}"
                qr_img = generate_qr_image(verify_url)

                # Build PNG and embed steganographic username hash
                png_bytes = build_certificate_png_bytes({
                    'Recipient Name': recipient,
                    'Course Name': course,
                    'Certificate Date': cert_date,
                    'Issuing Organization': issuer,
                    'Certificate Title': title,
                    'Certificate Description': desc,
                }, qr_img, layout)

                username_string = normalize_username(recipient)
                sha = hashlib.sha256(username_string.encode('utf-8')).hexdigest()

                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_in:
                    tmp_in.write(png_bytes)
                    tmp_in.flush()
                    in_path = tmp_in.name
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_out:
                    out_path = tmp_out.name
                try:
                    embed_message(in_path, out_path, sha)
                    with open(out_path, 'rb') as f:
                        final_png = f.read()
                finally:
                    try:
                        os.remove(in_path)
                    except Exception:
                        pass
                    try:
                        os.remove(out_path)
                    except Exception:
                        pass

                # Debug: Check if layout was used for this certificate
                if idx == 0:  # Only print for first certificate to avoid spam
                    print(f"=== CERTIFICATE GENERATION SUMMARY ===")
                    print(f"Certificate {idx + 1}: {recipient}")
                    print(f"Layout provided: {layout is not None}")
                    if layout:
                        print(f"Layout elements: {list(layout.get('elements', {}).keys())}")
                        print(f"Layout dimensions: {layout.get('referenceDimensions')}")
                    print(f"=== END SUMMARY ===")

                png_name = f"certificate_{idx + 1}.png"
                zf.writestr(png_name, final_png)
                created += 1

            session.commit()
            print(f"Successfully generated {created} certificates")
        except Exception as e:
            session.rollback()
            print(f"Error during certificate generation: {e}")
            return jsonify({"error": f"Failed to generate certificates: {str(e)}"}), 500
        finally:
            zf.close()
            session.close()

        zip_mem.seek(0)
        return send_file(
            zip_mem,
            mimetype='application/zip',
            as_attachment=True,
            download_name=f'certificates_{created}.zip'
        )
    except Exception as e:
        print(f"Unexpected error in bulk_generate: {e}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@app.post('/bulk_preview_sample')
def bulk_preview_sample():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    filename = file.filename.lower()
    try:
        if filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif filename.endswith('.xlsx'):
            df = pd.read_excel(file, engine='openpyxl')
        else:
            return jsonify({"error": "Unsupported file type. Please upload .csv or .xlsx"}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to read file: {str(e)}"}), 400

    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        return jsonify({"error": f"Missing required columns: {', '.join(missing)}"}), 400

    if df.empty:
        return jsonify({"error": "No rows found in the file"}), 400

    r0 = df.iloc[0]
    sample = {
        'Recipient Name': str(r0['Recipient Name']).strip(),
        'Course Name': str(r0['Course Name']).strip(),
        'Certificate Date': str(r0['Certificate Date']).strip(),
        'Issuing Organization': str(r0['Issuing Organization']).strip(),
        'Certificate Title': str(r0['Certificate Title']).strip() if not pd.isna(r0['Certificate Title']) else '',
        'Certificate Description': str(r0['Certificate Description']).strip() if not pd.isna(r0['Certificate Description']) else '',
    }
    return jsonify({"sample": sample})


@app.get('/health')
def health():
    return jsonify({"status": "ok"})


VERIFY_TEMPLATE = """
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Certificate Verification</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background:#f7f9fc; margin:0; padding:24px; }
      .card { max-width: 720px; margin: 24px auto; background: #fff; border:1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
      .ok { color: #059669; font-weight: 700; }
      .bad { color: #dc2626; font-weight: 700; }
      dt { color:#6b7280; }
      dd { margin: 0 0 12px 0; font-weight:600; }
      code { background:#f3f4f6; padding:2px 6px; border-radius:6px; }
    </style>
  </head>
  <body>
    <div class="card">
      {% if cert %}
        <h2 class="ok">Certificate Verified</h2>
        <p>This certificate is valid. Details:</p>
        <dl>
          <dt>Recipient Name</dt><dd>{{ cert.recipient_name }}</dd>
          <dt>Course Name</dt><dd>{{ cert.course_name }}</dd>
          <dt>Certificate Date</dt><dd>{{ cert.certificate_date }}</dd>
          <dt>Issuing Organization</dt><dd>{{ cert.issuing_organization }}</dd>
          <dt>Title</dt><dd>{{ cert.certificate_title }}</dd>
          <dt>Description</dt><dd>{{ cert.certificate_description }}</dd>
          <dt>Hash</dt><dd><code>{{ cert.cert_hash }}</code></dd>
        </dl>
      {% else %}
        <h2 class="bad">Certificate Not Found</h2>
        <p>We could not verify the certificate with ID <code>{{ cert_id }}</code>.</p>
      {% endif %}
    </div>
  </body>
  </html>
"""


@app.get('/verify')
def verify():
    cert_id = request.args.get('cert_id', '').strip()
    if not cert_id:
        return render_template_string(VERIFY_TEMPLATE, cert=None, cert_id=''), 400
    session = SessionLocal()
    try:
        cert = session.get(Certificate, cert_id)
        return render_template_string(VERIFY_TEMPLATE, cert=cert, cert_id=cert_id), (200 if cert else 404)
    finally:
        session.close()


@app.post('/verify')
def verify_png():
    # Stego verification for uploaded PNG and username
    if 'file' not in request.files:
        return jsonify({"status": "error", "valid": False, "reason": "no_file"}), 400
    file = request.files['file']
    username = normalize_username(request.form.get('username') or '')
    if not username:
        return jsonify({"status": "error", "valid": False, "reason": "missing_username"}), 400
    if not file.filename.lower().endswith('.png'):
        return jsonify({"status": "error", "valid": False, "reason": "invalid_file_type"}), 400

    try:
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
            file.save(tmp)
            tmp.flush()
            path = tmp.name
        try:
            extracted = extract_message(path)
        finally:
            try:
                os.remove(path)
            except Exception:
                pass
    except Exception:
        return jsonify({"status": "error", "valid": False, "reason": "no_embedded_hash"}), 200

    extracted_hex = (extracted or '').strip().lower()
    # Validate payload looks like a SHA-256 hex (64 hex chars)
    if len(extracted_hex) != 64 or any(c not in '0123456789abcdef' for c in extracted_hex):
        return jsonify({"status": "error", "valid": False, "reason": "no_embedded_hash"}), 200
    expected_hex = hashlib.sha256(username.encode('utf-8')).hexdigest()
    is_match = hmac.compare_digest(extracted_hex, expected_hex)

    resp = {
        "status": "success",
        "valid": bool(is_match),
        "method": "stego",
        "extracted_hash": extracted_hex,
        "expected_hash": expected_hex,
        "normalized_username": username,
    }
    if not is_match:
        resp["reason"] = "name_mismatch"
    return jsonify(resp)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5000'))
    app.run(host='0.0.0.0', port=port)


