"""Document preparation: turn an uploaded file into Claude-ready image blocks.

PDFs are rasterised page-by-page with PyMuPDF (max 3 pages, per Section 7.2).
Images that Claude's vision API already accepts are passed through unchanged;
other raster formats (e.g. TIFF) are converted to PNG.

Note: the PyMuPDF import is ``import fitz`` — not ``import PyMuPDF``.
"""

import base64

import fitz  # PyMuPDF

# Media types Claude's vision API accepts directly.
CLAUDE_IMAGE_TYPES = {"image/png", "image/jpeg", "image/gif", "image/webp"}

# Rasterisation settings for PDF pages.
MAX_PAGES = 3
RENDER_DPI = 150

# A prepared image is (media_type, base64_data).
PreparedImage = tuple[str, str]


def _encode(data: bytes) -> str:
    """Base64-encode bytes as an ASCII string with no newlines."""
    return base64.standard_b64encode(data).decode("ascii")


def pdf_to_images(file_bytes: bytes) -> list[PreparedImage]:
    """Render the first ``MAX_PAGES`` pages of a PDF to base64 PNG images."""
    images: list[PreparedImage] = []
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page_index in range(min(MAX_PAGES, doc.page_count)):
            page = doc.load_page(page_index)
            pixmap = page.get_pixmap(dpi=RENDER_DPI)
            images.append(("image/png", _encode(pixmap.tobytes("png"))))
    return images


def _raster_to_png(file_bytes: bytes) -> PreparedImage:
    """Convert an arbitrary raster image (e.g. TIFF) to a base64 PNG."""
    pixmap = fitz.Pixmap(file_bytes)
    try:
        # PNG cannot encode CMYK or alpha-with-colorspace combos directly; drop
        # to RGB when needed.
        if pixmap.colorspace and pixmap.colorspace.n >= 4:
            pixmap = fitz.Pixmap(fitz.csRGB, pixmap)
        return ("image/png", _encode(pixmap.tobytes("png")))
    finally:
        pixmap = None


def prepare_document_images(file_bytes: bytes, content_type: str) -> list[PreparedImage]:
    """Prepare an uploaded document for Claude vision.

    Args:
        file_bytes: Raw uploaded file contents.
        content_type: The upload's MIME type (e.g. ``application/pdf``).

    Returns:
        A list of ``(media_type, base64_data)`` image blocks.

    Raises:
        ValueError: If the content type is not a supported input format.
    """
    if content_type == "application/pdf":
        return pdf_to_images(file_bytes)
    if content_type in CLAUDE_IMAGE_TYPES:
        return [(content_type, _encode(file_bytes))]
    if content_type in ("image/tiff", "image/tif"):
        return [_raster_to_png(file_bytes)]
    raise ValueError(f"Unsupported document content type: {content_type!r}")
