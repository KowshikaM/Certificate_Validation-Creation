import struct
from typing import Tuple

from PIL import Image


def _bytes_to_bits(data: bytes) -> list[int]:
    bits: list[int] = []
    for byte in data:
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)
    return bits


def _bits_to_bytes(bits: list[int]) -> bytes:
    if len(bits) % 8 != 0:
        raise ValueError("Bit length must be a multiple of 8")
    out = bytearray()
    for i in range(0, len(bits), 8):
        byte = 0
        for b in bits[i : i + 8]:
            byte = (byte << 1) | (b & 1)
        out.append(byte)
    return bytes(out)


def _iter_pixels_rgb(img: Image.Image):
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA") if "A" in img.getbands() else img.convert("RGB")
    pixels = img.load()
    width, height = img.size
    has_alpha = img.mode == "RGBA"
    for y in range(height):
        for x in range(width):
            if has_alpha:
                r, g, b, a = pixels[x, y]
                yield x, y, (r, g, b), a
            else:
                r, g, b = pixels[x, y]
                yield x, y, (r, g, b), None


def _set_pixel_rgb(pix, x: int, y: int, rgb: Tuple[int, int, int], alpha):
    if alpha is None:
        pix[x, y] = (rgb[0], rgb[1], rgb[2])
    else:
        pix[x, y] = (rgb[0], rgb[1], rgb[2], alpha)


def embed_message(input_png_path: str, output_png_path: str, message: str) -> None:
    msg_bytes = message.encode("ascii")
    header = struct.pack(">I", len(msg_bytes))
    payload = header + msg_bytes
    bit_stream = _bytes_to_bits(payload)

    img = Image.open(input_png_path)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA") if "A" in img.getbands() else img.convert("RGB")

    width, height = img.size
    capacity_bits = width * height * 3  # 1 bit per R,G,B channel
    if len(bit_stream) > capacity_bits:
        raise ValueError(
            f"Message too large: need {len(bit_stream)} bits, capacity is {capacity_bits} bits"
        )

    pixels = img.load()
    bit_index = 0
    for y in range(height):
        for x in range(width):
            if bit_index >= len(bit_stream):
                break
            px = pixels[x, y]
            if img.mode == "RGBA":
                r, g, b, a = px
            else:
                r, g, b = px
                a = None

            r = (r & 0xFE) | (bit_stream[bit_index] if bit_index < len(bit_stream) else 0)
            bit_index += 1
            g = (g & 0xFE) | (bit_stream[bit_index] if bit_index < len(bit_stream) else 0)
            bit_index += 1
            b = (b & 0xFE) | (bit_stream[bit_index] if bit_index < len(bit_stream) else 0)
            bit_index += 1

            if a is None:
                pixels[x, y] = (r, g, b)
            else:
                pixels[x, y] = (r, g, b, a)
        if bit_index >= len(bit_stream):
            break

    img.save(output_png_path, format="PNG")


def extract_message(input_png_path: str) -> str:
    img = Image.open(input_png_path)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA") if "A" in img.getbands() else img.convert("RGB")

    pixels = img.load()
    width, height = img.size

    # First read 32-bit length header
    header_bits: list[int] = []
    bit_count_needed = 32
    for y in range(height):
        for x in range(width):
            px = pixels[x, y]
            if img.mode == "RGBA":
                r, g, b, _ = px
            else:
                r, g, b = px

            for comp in (r, g, b):
                header_bits.append(comp & 1)
                if len(header_bits) >= bit_count_needed:
                    break
            if len(header_bits) >= bit_count_needed:
                break
        if len(header_bits) >= bit_count_needed:
            break

    header_bytes = _bits_to_bytes(header_bits[:32])
    (msg_len,) = struct.unpack(">I", header_bytes)
    total_bits_needed = (32 + msg_len * 8)

    # Now read full payload bits
    payload_bits: list[int] = []
    for y in range(height):
        for x in range(width):
            px = pixels[x, y]
            if img.mode == "RGBA":
                r, g, b, _ = px
            else:
                r, g, b = px

            for comp in (r, g, b):
                payload_bits.append(comp & 1)
                if len(payload_bits) >= total_bits_needed:
                    break
            if len(payload_bits) >= total_bits_needed:
                break
        if len(payload_bits) >= total_bits_needed:
            break

    if len(payload_bits) < total_bits_needed:
        raise ValueError("Image does not contain enough data for the declared message length")

    payload_bytes = _bits_to_bytes(payload_bits[32:total_bits_needed])
    return payload_bytes.decode("ascii")


