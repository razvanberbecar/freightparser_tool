"""Claude API integration: send document images, return a merged field set.

All page images from every uploaded document (one shipment) go to Claude in a
single call; the model merges them and returns a ``{fields, conflicts,
confidence}`` envelope (see ``prompts.build_merge_prompt``).

Uses the ``anthropic`` SDK with a single model (``config.MODEL``,
``claude-sonnet-4-6``). There is no model fallback: if extraction fails or the
model reports low confidence / is missing a critical field, this raises an
error so the API layer can tell the frontend to re-upload a clearer document.
"""

import json

import anthropic

from app import config
from app.prompts.awb_prompt import AWB_PROMPT
from app.prompts.cmr_prompt import CMR_PROMPT
from app.services.pdf_service import PreparedImage

# System prompt per output document type.
_PROMPTS: dict[str, str] = {
    "cmr": CMR_PROMPT,
    "awb": AWB_PROMPT,
}

# Fields whose absence means the extraction is not usable, per document type.
# Names match each doc type's template/model fields.
_CRITICAL_FIELDS: dict[str, tuple[str, ...]] = {
    "cmr": ("shipper", "consignee", "cargo_description"),
    "awb": ("shipper_name", "consignee_name", "cargo_description"),
}

_MAX_TOKENS = 2000
_USER_TEXT = (
    "The images above are all the documents for one shipment. Extract and merge "
    "their fields, and flag any conflicts, per your instructions."
)

# User-facing message the frontend shows when a document can't be read reliably.
REUPLOAD_MESSAGE = (
    "We couldn't read this document reliably. Please re-upload a clearer, "
    "higher-quality scan or photo."
)


class ExtractionError(RuntimeError):
    """Extraction could not be completed.

    ``user_message`` is safe to show to the end user; ``str(exc)`` holds the
    technical detail for logs.
    """

    default_user_message = "We couldn't process this document. Please try again."

    def __init__(self, detail: str, user_message: str | None = None):
        super().__init__(detail)
        self.user_message = user_message or self.default_user_message


class LowQualityDocumentError(ExtractionError):
    """The document was unreadable or the model was not confident enough.

    The user should re-upload a better-quality file.
    """

    default_user_message = REUPLOAD_MESSAGE


def _client() -> anthropic.Anthropic:
    key = config.ANTHROPIC_API_KEY
    if not key or key == "sk-ant-REPLACE_ME":
        raise ExtractionError(
            "ANTHROPIC_API_KEY is not set. Add a real key to backend/.env.",
            user_message="Document extraction is not configured on the server.",
        )
    return anthropic.Anthropic(api_key=key)


def _build_content(images: list[PreparedImage]) -> list[dict]:
    """Build the user message content: image blocks followed by an instruction."""
    content: list[dict] = [
        {
            "type": "image",
            "source": {"type": "base64", "media_type": media_type, "data": data},
        }
        for media_type, data in images
    ]
    content.append({"type": "text", "text": _USER_TEXT})
    return content


def _parse_json_response(text: str) -> dict:
    """Parse a JSON object from the model's text, tolerating code fences.

    Unparseable output is treated as a low-quality result (re-upload).
    """
    cleaned = text.strip()
    if cleaned.startswith("```"):
        # Strip an opening ```json / ``` fence and the closing fence.
        cleaned = cleaned.split("\n", 1)[-1] if "\n" in cleaned else cleaned
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise LowQualityDocumentError(
            f"Claude did not return valid JSON: {exc}"
        ) from exc
    if not isinstance(result, dict):
        raise LowQualityDocumentError("Claude returned JSON that is not an object.")
    return result


def _normalize_envelope(result: dict) -> dict:
    """Coerce the model's JSON into a ``{fields, conflicts, confidence}`` shape.

    Tolerant of older / flat output: if the model returns bare fields without a
    ``fields`` wrapper, treat the whole object as the field set. ``confidence``
    is lifted to the top level whether the model put it there or inside
    ``fields``.
    """
    raw_fields = result.get("fields")
    if isinstance(raw_fields, dict):
        fields = dict(raw_fields)
    else:
        # Flat output — everything except the envelope keys is a field.
        fields = {
            k: v
            for k, v in result.items()
            if k not in ("fields", "conflicts", "confidence")
        }

    confidence = result.get("confidence")
    if confidence is None:
        confidence = fields.get("confidence")
    # Confidence lives on the envelope, not among the template fields.
    fields.pop("confidence", None)

    conflicts = result.get("conflicts")
    if not isinstance(conflicts, list):
        conflicts = []

    return {"fields": fields, "conflicts": conflicts, "confidence": confidence}


def _is_low_quality(fields: dict, confidence, doc_type: str) -> bool:
    """True if confidence is low or a critical field is missing/empty."""
    if str(confidence or "").lower() == "low":
        return True
    return any(not fields.get(name) for name in _CRITICAL_FIELDS[doc_type])


def extract_merged(images: list[PreparedImage], doc_type: str) -> dict:
    """Extract and merge freight fields from one shipment's document images.

    All images (every page of every uploaded document) are sent to Claude in a
    single call; the model merges them into one field set and flags conflicts.

    Args:
        images: ``(media_type, base64_data)`` blocks from ``pdf_service``,
            spanning every uploaded document for the shipment.
        doc_type: One of ``cmr``, ``awb``.

    Returns:
        ``{"fields": dict, "conflicts": list, "confidence": str | None}``.

    Raises:
        LowQualityDocumentError: If the model output is unreadable, low
            confidence, or missing a critical field — the user should re-upload.
        ExtractionError: On configuration or API failure.
        ValueError: If ``doc_type`` is unknown or ``images`` is empty.
    """
    if doc_type not in _PROMPTS:
        raise ValueError(f"Unknown doc_type: {doc_type!r}")
    if not images:
        raise ValueError("No document images to extract from.")

    client = _client()
    content = _build_content(images)

    try:
        message = client.messages.create(
            model=config.MODEL,
            max_tokens=_MAX_TOKENS,
            system=_PROMPTS[doc_type],
            messages=[{"role": "user", "content": content}],
        )
    except anthropic.APIError as exc:  # network / rate limit / server errors
        raise ExtractionError(f"Claude API request failed: {exc}") from exc

    text_blocks = [block.text for block in message.content if block.type == "text"]
    if not text_blocks:
        raise LowQualityDocumentError("Claude returned no text content.")

    envelope = _normalize_envelope(_parse_json_response("".join(text_blocks)))

    # No model fallback — a low-quality result is an error the user must act on.
    if _is_low_quality(envelope["fields"], envelope["confidence"], doc_type):
        raise LowQualityDocumentError(
            f"Low-confidence or incomplete extraction for doc_type={doc_type}."
        )

    return envelope
