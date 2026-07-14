"""Extraction prompt for BOL (Bill of Lading) fields — deferred.

BOL support was removed for now: the document type isn't settled (US LTL road
bill vs. international ocean bill of lading). When it's revisited, define the
field list here (matching the chosen bol_template.xlsx named ranges), re-add
BOLExtraction to app/models/extraction.py, and wire it back into
DocType / EXTRACTION_MODELS / claude_service._PROMPTS.
"""
