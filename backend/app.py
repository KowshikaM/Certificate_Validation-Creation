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
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


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


def generate_qr_image(verification_url: str):
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M,
                       box_size=8, border=2)
    qr.add_data(verification_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    return img


def draw_hidden_watermark(c: canvas.Canvas, page_width: float, page_height: float, watermark_text: str):
    # Stealth watermark: draw very light grey hash characters across bottom area
    c.saveState()
    c.setFillGray(0.85)  # light grey
    c.setFont("Courier", 6)
    margin = 40
    y = margin
    repeated = (watermark_text + ' ')
    text = (repeated * 50)[:400]
    c.translate(margin, y)
    c.drawString(0, 0, text)
    c.restoreState()


def _scale_position(x: float, y: float, ref_width: float, ref_height: float, target_width: float, target_height: float):
    try:
        sx = max(target_width / float(ref_width), 0.0001)
        sy = max(target_height / float(ref_height), 0.0001)
        return x * sx, y * sy
    except Exception:
        return x, y


def build_certificate_pdf_bytes(data: dict, qr_img, layout: dict | None = None) -> bytes:
    # Prepare PDF in memory
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

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

        ref_dims = layout.get('referenceDimensions') or {'width': 800, 'height': 600}
        ref_w = float(ref_dims.get('width', 800))
        ref_h = float(ref_dims.get('height', 600))

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
            # We ignore textAlign for PDF anchoring because HTML positions are left-anchored.

            # Convert color hex to RGB
            try:
                color_hex = color_hex.lstrip('#')
                r, g, b = tuple(int(color_hex[i:i+2], 16) / 255 for i in (0, 2, 4))
            except Exception:
                r, g, b = 0, 0, 0

            c.setFillColorRGB(r, g, b)
            safe_font = "Helvetica-Bold" if font_weight == 'bold' else "Helvetica"
            c.setFont(safe_font, font_size)
            px, py_scaled = _scale_position(float(pos.get('x', 80)), float(pos.get('y', 80)), ref_w, ref_h, width, height)
            # Frontend positions are measured from the top-left corner with Y increasing downward.
            # ReportLab's coordinate system is bottom-left with Y increasing upward, so flip Y.
            py = max(height - py_scaled, 0)
            c.drawString(px, py, text)

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
            qx_scaled, qy_scaled = _scale_position(float(qpos.get('x', width - 160)), float(qpos.get('y', 60)), ref_w, ref_h, width, height)
            qy = max(height - qy_scaled, 0)
            qr_size = int(qr_el.get('size') or 120)
            qr_bytes = io.BytesIO()
            qr_img.save(qr_bytes, format='PNG')
            qr_bytes.seek(0)
            qr_reader = ImageReader(qr_bytes)
            c.drawImage(qr_reader, qx_scaled, qy, qr_size, qr_size, mask='auto')
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
            c.drawImage(qr_reader, width - 80 - qr_size, 60, qr_size, qr_size, mask='auto')
    except Exception:
        pass

    # Hidden watermark using the cert hash
    draw_hidden_watermark(c, width, height, data['cert_hash'])

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.read()


@app.post('/bulk_generate')
def bulk_generate():
    try:
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
                layout = json.loads(request.form['layout'] or '{}')
                print(f"Received layout with {len(layout.get('elements', {}))} elements")
            except Exception as e:
                print(f"Failed to parse layout JSON: {e}")
                layout = None

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

                pdf_bytes = build_certificate_pdf_bytes({
                    'Recipient Name': recipient,
                    'Course Name': course,
                    'Certificate Date': cert_date,
                    'Issuing Organization': issuer,
                    'Certificate Title': title,
                    'Certificate Description': desc,
                    'cert_hash': cert_hash,
                }, qr_img, layout)

                pdf_name = f"certificate_{idx + 1}.pdf"
                zf.writestr(pdf_name, pdf_bytes)
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5000'))
    app.run(host='0.0.0.0', port=port)


