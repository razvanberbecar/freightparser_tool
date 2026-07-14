"""Extraction prompt for AWB (Air Waybill) fields.

Field names match the awb_template.xlsx named ranges exactly (Section 8.2), so
openpyxl fills the template by name.
"""

from app.prompts import build_prompt

AWB_FIELDS = """\
- shipper_name (shipper's name)
- shipper_address (shipper's address)
- consignee_name (consignee's name)
- consignee_address (consignee's address)
- airport_departure (airport of departure / address of first carrier)
- airport_destination (airport of destination)
- flight_number (flight number / by first carrier)
- flight_date (flight date, YYYY-MM-DD)
- agent_name (issuing carrier's agent name)
- agent_city (issuing carrier's agent city)
- declared_value_carriage (declared value for carriage; may be "NVD")
- declared_value_customs (declared value for customs; may be "NCV")
- insurance_amount (amount of insurance)
- num_pieces (number of pieces / RCP, integer)
- gross_weight_kg (gross weight in kilograms, number)
- rate_class (rate class / commodity item number)
- chargeable_weight (chargeable weight in kilograms, number)
- cargo_description (nature and quantity of the goods)
- cargo_dimensions (dimensions or volume of the goods)
- reference_number (reference number)
- handling_info (handling information)
- accounting_info (accounting information)
- total_prepaid (total prepaid charges)
- total_collect (total collect charges)
- other_charges (other charges)
- execution_date (executed on date, YYYY-MM-DD)
- execution_place (executed at place)
- confidence (one of: high, medium, low)"""

AWB_PROMPT = build_prompt(AWB_FIELDS)
