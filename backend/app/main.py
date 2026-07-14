"""FastAPI application entry point for FreightParse.

Wires up the app, CORS, the /health endpoint, and the /api/extract and
/api/export routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.routers import export, extract

app = FastAPI(
    title="FreightParse API",
    description="AI-powered freight document parser (CMR / AWB).",
    version=config.APP_VERSION,
)

# Allow the React frontend (different origin) to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    """Health check endpoint used by Railway deployment monitoring."""
    return {"status": "ok", "version": config.APP_VERSION}


app.include_router(extract.router, prefix="/api", tags=["extract"])
app.include_router(export.router, prefix="/api", tags=["export"])
