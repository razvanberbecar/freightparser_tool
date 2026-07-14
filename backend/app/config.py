"""Application configuration loaded from environment variables.

Values are read from a local ``.env`` file (via python-dotenv) during
development, and from the platform's environment (Railway) in production.
"""

import os

from dotenv import load_dotenv

# Load variables from backend/.env into the process environment if present.
load_dotenv()

# --- Claude API ---
# Single model, per project decision — claude-sonnet-4-6 (the doc's original
# claude-haiku-4-5 primary + Sonnet fallback design was dropped). There is no
# model fallback: low-confidence or failed extractions return an error to the
# frontend instead.
ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
MODEL: str = os.getenv("MODEL", "claude-sonnet-4-6")

# --- Upload limits ---
MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))

# --- CORS ---
# Comma-separated list of allowed frontend origins.
ALLOWED_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173",
    ).split(",")
    if origin.strip()
]

APP_VERSION: str = "1.0.0"
