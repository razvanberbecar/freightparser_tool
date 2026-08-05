"""Extraction prompt for CMR (Scrisoare de trasura) fields.

Field names match the cmr_template.xlsx named ranges exactly (Section 8.2), so
openpyxl fills the template by name. Box numbers refer to the standard CMR form.
"""

from app.prompts import build_merge_prompt

CMR_FIELDS = """\
- shipper (box 1: sender's full details — name, address, country — as one string)
- consignee (box 2: consignee's full details — name, address, country)
- carrier (box 16: carrier / transport operator — name, address, country)
- delivery_place (box 3: place of delivery of the goods, incl. country)
- loading_place (box 4: place where the goods were taken over / loaded)
- loading_date (box 4: date goods were taken over / loaded, YYYY-MM-DD)
- attached_docs (box 5: documents attached)
- marks (box 6: marks and numbers)
- num_packages (box 7: number of packages, integer)
- packing_method (box 8: method of packing)
- cargo_description (box 9: nature of the goods)
- statistical_number (box 10: statistical number)
- gross_weight_kg (box 11: gross weight in kilograms, number)
- volume_m3 (box 12: volume in cubic metres, number)
- sender_instructions (box 13: sender's instructions)
- payment_instructions (box 14: e.g. "Franco / Carriage paid" or "Non franco / Carriage forward")
- cash_on_delivery (box 15: cash on delivery amount / remboursement)
- special_agreements (box 19: special agreements)
- established_place (box 21: place where the consignment note was established)
- established_date (box 21: date the consignment note was established, YYYY-MM-DD)
- adr_class (dangerous-goods ADR classification — class/number/letter — if any)"""

CMR_PROMPT = build_merge_prompt(CMR_FIELDS)
