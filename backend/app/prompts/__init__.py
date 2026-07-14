"""Claude extraction prompts, one per output document type.

`COMMON_RULES` holds the shared extraction rules (Section 7.3 of the architecture
doc); each per-doc-type prompt combines it with its own field list.
"""

COMMON_RULES = """\
You are a freight document data extraction specialist.
Extract the requested fields from the attached document image(s) and return
ONLY valid JSON. Do not include any explanation, preamble, or text outside the
JSON object, and do not wrap it in Markdown code fences.

Rules:
- Use null for any field you cannot find — never guess.
- The documents may be written in Romanian, English, German, or French
  (common in EU freight). Translate field labels as needed; keep proper nouns,
  names, and addresses in their original language.
- Normalize all dates to ISO 8601 format (YYYY-MM-DD).
- Normalize all weights to kilograms (numeric, kg) and all dimensions to
  centimetres (cm).
- Boolean fields must be true or false (not strings).
- Always include a "confidence" field with one of: "high", "medium", "low".
  Use "low" if the document is hard to read or critical fields are missing.
"""


def build_prompt(field_lines: str) -> str:
    """Combine the shared rules with a doc-type-specific field list."""
    return f"{COMMON_RULES}\nExtract exactly these fields:\n{field_lines}\n"
