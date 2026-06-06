"""
Real Rails Intelligence Library — POC 56
Digital Identity & KYC Flow — FastAPI Backend
Rail Category: Governance & Trust
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
import json
import io
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from dotenv import load_dotenv
from data_pipeline import generate_mock_kyc_data, evaluate_kyc_rules

load_dotenv()

# ── App Initialization ────────────────────────────────────────────────────────
app = FastAPI(
    title="Real Rails — Digital Identity & KYC Flow ETL Engine",
    description="POC 56 · Governance & Trust Rail · OpenBanking UK + OFAC Sanctions",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-Memory Dataset (Pandas DataFrame) ─────────────────────────────────────
RAW_DATA   = generate_mock_kyc_data(50)
df_kyc     = pd.DataFrame(RAW_DATA)

# ── Request Models ────────────────────────────────────────────────────────────
class OnboardingRequest(BaseModel):
    full_name: str
    country:   str


# ── Filter Helper ─────────────────────────────────────────────────────────────
def _apply_filters(
    status:      Optional[str] = None,
    data_source: Optional[str] = None,
    date_range:  Optional[str] = None,
    search:      Optional[str] = None,
) -> pd.DataFrame:
    filtered = df_kyc.copy()

    if status:
        # Normalise incoming status values
        mapping = {
            "approved": "Approved", "passed": "Approved",
            "rejected": "Rejected", "failed":  "Rejected",
            "pending":  "Pending Review", "pending_review": "Pending Review",
            "pending review": "Pending Review",
        }
        norm = mapping.get(status.lower(), status)
        filtered = filtered[filtered["overall_status"] == norm]

    if data_source:
        filtered = filtered[filtered["data_source"] == data_source]

    if date_range:
        now = datetime.utcnow()
        cutoff_map = {"24h": now - timedelta(hours=24), "7d": now - timedelta(days=7), "30d": now - timedelta(days=30)}
        cutoff = cutoff_map.get(date_range)
        if cutoff:
            filtered["_ts"] = pd.to_datetime(filtered["timestamp"])
            filtered = filtered[filtered["_ts"] >= cutoff].drop(columns=["_ts"])

    if search:
        mask = (
            filtered["full_name"].str.contains(search, case=False, na=False) |
            filtered["applicant_id"].str.contains(search, case=False, na=False) |
            filtered["country"].str.contains(search, case=False, na=False)
        )
        filtered = filtered[mask]

    return filtered


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "ok", "service": "Real Rails KYC ETL Engine", "poc": "56"}


@app.get("/api/kyc/applicants")
def get_applicants(
    status:      Optional[str] = Query(None),
    data_source: Optional[str] = Query(None, alias="data_source"),
    date_range:  Optional[str] = Query(None),
    search:      Optional[str] = Query(None),
):
    filtered = _apply_filters(status, data_source, date_range, search)
    return json.loads(filtered.to_json(orient="records"))


@app.post("/api/kyc/applicants")
def create_applicant(req: OnboardingRequest):
    global df_kyc
    try:
        existing_ids = df_kyc["applicant_id"].str.replace("ID-", "").astype(int)
        next_id = int(existing_ids.max()) + 1
    except Exception:
        next_id = 46000

    applicant_id  = f"ID-{next_id}"
    new_applicant = evaluate_kyc_rules(req.full_name, req.country, applicant_id)

    new_df = pd.DataFrame([new_applicant])
    df_kyc = pd.concat([new_df, df_kyc], ignore_index=True)

    return new_applicant


@app.get("/api/kyc/stats")
def get_stats(
    status:      Optional[str] = Query(None),
    data_source: Optional[str] = Query(None),
    date_range:  Optional[str] = Query(None),
    search:      Optional[str] = Query(None),
):
    filtered = _apply_filters(status, data_source, date_range, search)
    total    = len(filtered)
    passed   = len(filtered[filtered["overall_status"] == "Approved"])
    failed   = len(filtered[filtered["overall_status"] == "Rejected"])
    pending  = len(filtered[filtered["overall_status"] == "Pending Review"])
    ofac_alerts = len(filtered[filtered["sanctions_match"] == "Critical Match"])

    return {
        "total_processed":      total,
        "passed":               passed,
        "failed":               failed,
        "pending_review":       pending,
        "ofac_alerts":          ofac_alerts,
        "pass_rate_percentage": round((passed / total) * 100, 1) if total > 0 else 0,
        "avg_risk_score":       round(float(filtered["risk_score"].mean()), 3) if total > 0 else 0,
    }


@app.get("/api/kyc/applicants/export")
def export_csv(
    status:      Optional[str] = Query(None),
    data_source: Optional[str] = Query(None),
    date_range:  Optional[str] = Query(None),
    search:      Optional[str] = Query(None),
):
    """Download filtered dataset as CSV (guardrail: always returns data)."""
    filtered = _apply_filters(status, data_source, date_range, search)
    export_cols = [
        "applicant_id", "timestamp", "full_name", "country", "document_type",
        "data_source", "document_status", "biometric_status", "sanctions_match",
        "overall_status", "reason_if_failed", "risk_score",
    ]
    csv_df  = filtered[export_cols].copy()
    buffer  = io.StringIO()
    csv_df.to_csv(buffer, index=False)
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=kyc_applicants_export.csv"},
    )
