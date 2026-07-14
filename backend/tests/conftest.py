"""Shared pytest fixtures."""

import fitz  # PyMuPDF
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_pdf() -> bytes:
    """A tiny valid one-page PDF so pdf_service can rasterise it in tests."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Test freight document\nShipper: SC Exemplu SRL")
    data = doc.tobytes()
    doc.close()
    return data
