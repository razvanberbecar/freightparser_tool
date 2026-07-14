"""Tests for /api/extract — Claude is mocked, so no billed API calls."""

from app.services import claude_service

PDF = "application/pdf"


def _post(client, pdf, doc_type):
    return client.post(
        "/api/extract",
        files={"file": ("doc.pdf", pdf, PDF)},
        data={"doc_type": doc_type},
    )


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_extract_success(client, sample_pdf, monkeypatch):
    def fake_extract(images, doc_type):
        assert doc_type == "cmr"
        assert images  # pdf_service actually produced image blocks
        return {
            "shipper": "SC Exemplu SRL",
            "cargo_description": "Piese auto",
            "gross_weight_kg": 450,
            "confidence": "high",
        }

    monkeypatch.setattr(claude_service, "extract_fields", fake_extract)
    resp = _post(client, sample_pdf, "cmr")
    assert resp.status_code == 200
    body = resp.json()
    assert body["shipper"] == "SC Exemplu SRL"
    assert body["gross_weight_kg"] == 450.0  # coerced to float by the model
    assert body["confidence"] == "high"


def test_extract_bad_doc_type(client, sample_pdf):
    resp = _post(client, sample_pdf, "bol")  # BOL removed
    assert resp.status_code == 422
    assert "cmr" in resp.json()["detail"]


def test_extract_unsupported_content_type(client):
    resp = client.post(
        "/api/extract",
        files={"file": ("note.txt", b"hello", "text/plain")},
        data={"doc_type": "cmr"},
    )
    assert resp.status_code == 422


def test_extract_empty_file(client):
    resp = client.post(
        "/api/extract",
        files={"file": ("empty.pdf", b"", PDF)},
        data={"doc_type": "cmr"},
    )
    assert resp.status_code == 422


def test_extract_too_large(client):
    big = b"%PDF" + b"0" * (11 * 1024 * 1024)  # > 10 MB limit
    resp = _post(client, big, "cmr")
    assert resp.status_code == 413


def test_extract_low_quality_returns_422(client, sample_pdf, monkeypatch):
    def fake(images, doc_type):
        raise claude_service.LowQualityDocumentError("low confidence")

    monkeypatch.setattr(claude_service, "extract_fields", fake)
    resp = _post(client, sample_pdf, "awb")
    assert resp.status_code == 422
    assert "re-upload" in resp.json()["detail"].lower()


def test_extract_service_error_returns_500(client, sample_pdf, monkeypatch):
    def fake(images, doc_type):
        raise claude_service.ExtractionError(
            "boom", user_message="Extraction is not configured."
        )

    monkeypatch.setattr(claude_service, "extract_fields", fake)
    resp = _post(client, sample_pdf, "cmr")
    assert resp.status_code == 500
    assert resp.json()["detail"] == "Extraction is not configured."
