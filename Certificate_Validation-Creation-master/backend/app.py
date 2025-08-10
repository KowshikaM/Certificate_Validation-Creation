import io
import os
import hashlib
import zipfile
from datetime import datetime

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from sqlalchemy import create_engine, Column, String, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
import pandas as pd
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


# Configuration
PUBLIC_VERIFY_BASE = os.environ.get('PUBLIC_VERIFY_BASE', 'https://mydomain.com/verify')
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///certificates.db')

app = Flask(__name__)
CORS(app, resources={r"/bulk_generate": {"origins": "*"}})


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


def build_certificate_pdf_bytes(data: dict, qr_img) -> bytes:
    # Prepare PDF in memory
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Title
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 100, data.get('Certificate Title') or 'Certificate of Completion')

    # Body text
    c.setFont("Helvetica", 12)
    c.drawString(80, height - 160, f"Recipient: {data.get('Recipient Name')}")
    c.drawString(80, height - 180, f"Course: {data.get('Course Name')}")
    c.drawString(80, height - 200, f"Date: {data.get('Certificate Date')}")
    c.drawString(80, height - 220, f"Issued by: {data.get('Issuing Organization')}")

    # Description paragraph (wrap naive)
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
    for line in lines[:8]:  # limit lines for layout safety
        c.drawString(80, y, line)
        y -= 16

    # QR code bottom-right
    qr_bytes = io.BytesIO()
    qr_img.save(qr_bytes, format='PNG')
    qr_bytes.seek(0)
    qr_reader = ImageReader(qr_bytes)
    qr_size = 120
    c.drawImage(qr_reader, width - 80 - qr_size, 60, qr_size, qr_size, mask='auto')

    # Hidden watermark using the cert hash
    draw_hidden_watermark(c, width, height, data['cert_hash'])

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.read()


@app.post('/bulk_generate')
def bulk_generate():
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

    # Validate columns
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        return jsonify({"error": f"Missing required columns: {', '.join(missing)}"}), 400

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
            }, qr_img)

            pdf_name = f"certificate_{idx + 1}.pdf"
            zf.writestr(pdf_name, pdf_bytes)
            created += 1

        session.commit()
    except Exception as e:
        session.rollback()
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


@app.get('/health')
def health():
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5000'))
    app.run(host='0.0.0.0', port=port)


