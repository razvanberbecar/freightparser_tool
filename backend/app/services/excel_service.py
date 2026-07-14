"""Excel generation with openpyxl.

``generate_export_workbook(doc_type, fields)`` loads the pre-built template for
the document type and fills each named range whose name matches a field key
(named ranges, never hardcoded cell coordinates — Section 8). If a template is
missing it falls back to a generic Field/Value sheet so /api/export still works.
"""

import io
import os

from openpyxl import Workbook, load_workbook

TEMPLATES_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "templates")
)

# Value types openpyxl can write directly; anything else is stringified.
_SCALAR = (str, int, float, bool)


def _template_path(doc_type: str) -> str:
    return os.path.join(TEMPLATES_DIR, f"{doc_type}_template.xlsx")


def _cell_value(value):
    """Coerce a field value to something a cell can hold."""
    return value if isinstance(value, _SCALAR) else str(value)


def _to_buffer(workbook) -> io.BytesIO:
    buffer = io.BytesIO()
    workbook.save(buffer)
    buffer.seek(0)
    return buffer


def _fill_template(doc_type: str, fields: dict) -> io.BytesIO:
    """Load the doc-type template and fill each field into its named range."""
    workbook = load_workbook(_template_path(doc_type))
    names = workbook.defined_names
    for name, value in fields.items():
        if value is None or name not in names:
            continue  # skip empties and keys that aren't template fields
        for sheet_title, coord in names[name].destinations:
            workbook[sheet_title][coord] = _cell_value(value)
    return _to_buffer(workbook)


def _generic_workbook(doc_type: str, fields: dict) -> io.BytesIO:
    """Fallback: a two-column Field/Value sheet when no template exists."""
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = doc_type.upper()
    sheet.append(["Field", "Value"])
    for name, value in fields.items():
        sheet.append([name, "" if value is None else _cell_value(value)])
    return _to_buffer(workbook)


def generate_export_workbook(doc_type: str, fields: dict) -> io.BytesIO:
    """Build a filled workbook and return it as an in-memory buffer.

    Uses ``templates/<doc_type>_template.xlsx`` when present (filled by named
    range); otherwise falls back to a generic Field/Value sheet.
    """
    if os.path.exists(_template_path(doc_type)):
        return _fill_template(doc_type, fields)
    return _generic_workbook(doc_type, fields)
