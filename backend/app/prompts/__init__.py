"""Claude extraction prompts, one per output document type.

`COMMON_RULES` holds the shared extraction rules (Section 7.3 of the architecture
doc). Each per-doc-type prompt combines it with its own field list.

The flow accepts MULTIPLE source documents about a SINGLE shipment (commercial
invoice, packing list, shipping instructions, emails, …) and merges them into
one field set, so `build_merge_prompt` frames the task as a merge and asks for a
`{fields, conflicts, confidence}` envelope. A single-document upload is just the
degenerate case: the conflicts array comes back empty.
"""

COMMON_RULES = """\
You are a freight document data extraction specialist.

You will receive one or MORE documents that all relate to a SINGLE shipment.
These may include commercial invoices, packing lists, shipping instructions,
purchase orders, or client emails, and each document may span several pages.

Rules:
- Use null for any field you cannot find in ANY document — never guess.
- The documents may be written in Romanian, English, German, or French
  (common in EU freight). Translate field labels as needed; keep proper nouns,
  names, and addresses in their original language.
- Normalize all dates to ISO 8601 format (YYYY-MM-DD).
- Normalize all weights to kilograms (numeric, kg) and all dimensions to
  centimetres (cm).
"""

MERGE_INSTRUCTIONS = """\
Your task:
1. Extract every field listed below from ALL of the provided documents.
2. MERGE the data into one complete field set:
   - When the same field appears in several documents, prefer the most complete
     and specific value.
   - Prefer official documents (invoice, packing list) over informal ones
     (email, handwritten note).
3. When a field genuinely CONFLICTS between documents — different values that
   cannot both be true (e.g. a gross weight of 450 kg vs 480 kg) — do NOT
   silently pick one. Put your best value in "fields" AND record the conflict in
   the "conflicts" array with every candidate value and the document it came
   from, so the user can decide.
4. Set "confidence" to "low" if the documents are hard to read or critical
   fields are missing, "medium" if some values are uncertain, otherwise "high".

Return ONLY valid JSON in EXACTLY this shape — no explanation, preamble, or
Markdown code fences:
{
  "fields": {
    <all of the fields listed below, using null when not found>
  },
  "conflicts": [
    {
      "field": "<field name>",
      "values": [
        {"value": <value>, "source": "<which document, e.g. 'invoice'>"},
        {"value": <value>, "source": "<which document, e.g. 'packing list'>"}
      ]
    }
  ],
  "confidence": "high" | "medium" | "low"
}

Include a "conflicts" entry ONLY for real disagreements; when nothing conflicts,
return an empty array. Never put the "confidence" key inside "fields"."""


def build_merge_prompt(field_lines: str) -> str:
    """Combine the shared rules, merge instructions, and a doc-type field list."""
    return (
        f"{COMMON_RULES}\n{MERGE_INSTRUCTIONS}\n\n"
        f"The fields to extract into \"fields\" are:\n{field_lines}\n"
    )
