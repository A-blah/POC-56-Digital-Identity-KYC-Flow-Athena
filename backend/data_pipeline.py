"""
Real Rails Intelligence Library — POC 56
Digital Identity & KYC Flow — Data Pipeline (ETL)
Rail Category: Governance & Trust
Sources: OpenBanking UK (simulated), OFAC Sanctions List (synthetic)
"""

import random
import uuid
from datetime import datetime, timedelta

# ── Sanctioned Jurisdictions (OFAC / FATF High-Risk) ─────────────────────────
SANCTIONED_COUNTRIES = ["Iran", "North Korea", "Syria", "Russia", "Belarus", "Myanmar"]
HIGH_RISK_COUNTRIES  = ["Venezuela", "Afghanistan", "Yemen", "Somalia", "Libya"]
CLEAN_COUNTRIES      = ["United Kingdom", "Germany", "France", "Netherlands",
                        "Sweden", "Norway", "Switzerland", "Canada", "Singapore"]

# ── Realistic name corpus ─────────────────────────────────────────────────────
FIRST_NAMES = [
    "James", "Olivia", "Mohammed", "Charlotte", "Wei", "Amara", "Lucas",
    "Aisha", "Ivan", "Sophie", "Daniel", "Priya", "Leon", "Elena", "Omar",
    "Isabella", "Ethan", "Yuki", "Marcus", "Fatima"
]
LAST_NAMES = [
    "Williams", "Müller", "Rahman", "Thompson", "Zhang", "Okafor", "Martinez",
    "Petrov", "Andersen", "Nakamura", "Ferreira", "Sharma", "van der Berg",
    "Kowalski", "Nguyen", "Al-Rashid", "Johansson", "Dlamini", "O'Brien", "Popescu"
]

FAILURE_REASONS = [
    "Document expired",
    "Biometric mismatch — liveness check failed",
    "OFAC SDN critical match (≥85% confidence)",
    "Document tampering detected (MRZ checksum failure)",
    "Invalid date of birth vs. registry record",
    "Jurisdiction on FATF high-risk list",
    "PEP screening — Politically Exposed Person flagged",
    "Address verification failed (PO box not permitted)",
    "Duplicate identity detected — existing record conflict",
]

DOCUMENT_TYPES = ["Passport", "National ID Card", "Driver Licence", "Residence Permit"]

# ── KYC Rule Engine ───────────────────────────────────────────────────────────

def evaluate_kyc_rules(full_name: str, country: str, applicant_id: str) -> dict:
    """
    Live rule evaluation for the onboarding simulator.
    Mirrors what the bulk pipeline produces for consistency.
    """
    timestamp = datetime.utcnow().isoformat()
    consent_token = f"OB-CONSENT-{random.randint(10000, 99999)}X"
    doc_type = random.choice(DOCUMENT_TYPES)

    if country == "United Kingdom":
        data_source = "OpenBanking UK"
    elif country in CLEAN_COUNTRIES:
        data_source = "OpenBanking UK"
    else:
        data_source = "Synthetic DB"

    if country in SANCTIONED_COUNTRIES:
        doc_status      = "Verified"
        bio_status      = "Verified"
        sanctions_match = "Critical Match"
        overall_status  = "Rejected"
        reason          = "OFAC SDN critical match (≥85% confidence)"
        risk_score      = round(random.uniform(0.90, 0.99), 2)
        ofac_match      = True
        match_conf      = round(random.uniform(0.87, 0.99), 2)
        watchlist_id    = f"OFAC-SDN-{random.randint(1000, 9999)}"

        steps_log = [
            {"step": "Onboarding Flow",       "status": "SUCCESS",  "msg": f"OB consent handshake completed. Token: {consent_token}."},
            {"step": "Document Check",         "status": "SUCCESS",  "msg": f"{doc_type} validated via MRZ OCR extraction and checksum."},
            {"step": "Biometric Match",        "status": "SUCCESS",  "msg": "Liveness check passed. Facial geometry verified."},
            {"step": "Sanctions Screening",    "status": "CRITICAL", "msg": f"OFAC SDN match at {match_conf*100:.0f}% confidence. Entity: {watchlist_id}."},
            {"step": "Decision Logic",         "status": "FAILED",   "msg": "Fail-closed enforced — critical sanctions hit blocks manual override."},
            {"step": "Final Outcome",          "status": "FAILED",   "msg": "Application rejected. Regulatory notification filed."},
        ]

    elif country in HIGH_RISK_COUNTRIES:
        doc_status      = "Verified"
        bio_status      = "Verified"
        sanctions_match = "Potential Match"
        overall_status  = "Pending Review"
        reason          = "Jurisdiction on FATF high-risk list"
        risk_score      = round(random.uniform(0.55, 0.75), 2)
        ofac_match      = False
        match_conf      = round(random.uniform(0.45, 0.70), 2)
        watchlist_id    = f"OFAC-SDN-{random.randint(5000, 8999)}"

        steps_log = [
            {"step": "Onboarding Flow",       "status": "SUCCESS",  "msg": f"OB consent handshake completed. Token: {consent_token}."},
            {"step": "Document Check",         "status": "SUCCESS",  "msg": f"{doc_type} validated via MRZ OCR extraction and checksum."},
            {"step": "Biometric Match",        "status": "SUCCESS",  "msg": "Liveness check passed."},
            {"step": "Sanctions Screening",    "status": "PENDING",  "msg": f"Potential FATF high-risk jurisdiction match ({country}). Secondary review required."},
            {"step": "Decision Logic",         "status": "PENDING",  "msg": "Escalated to compliance officer queue for manual resolution."},
            {"step": "Final Outcome",          "status": "PENDING",  "msg": "Pending compliance officer sign-off."},
        ]

    else:
        doc_status      = "Verified"
        bio_status      = "Verified"
        sanctions_match = "No Match"
        overall_status  = "Approved"
        reason          = "None"
        risk_score      = round(random.uniform(0.02, 0.18), 2)
        ofac_match      = False
        match_conf      = round(random.uniform(0.01, 0.10), 2)
        watchlist_id    = None

        steps_log = [
            {"step": "Onboarding Flow",       "status": "SUCCESS",  "msg": f"OB consent handshake completed. Token: {consent_token}."},
            {"step": "Document Check",         "status": "SUCCESS",  "msg": f"{doc_type} validated via MRZ OCR extraction and checksum."},
            {"step": "Biometric Match",        "status": "SUCCESS",  "msg": "Liveness check passed. Facial geometry verified."},
            {"step": "Sanctions Screening",    "status": "SUCCESS",  "msg": "No matches on OFAC SDN, EU Consolidated, or UN sanctions lists."},
            {"step": "Decision Logic",         "status": "SUCCESS",  "msg": "All compliance rules satisfied. Zero exceptions raised."},
            {"step": "Final Outcome",          "status": "SUCCESS",  "msg": "Identity verified. Platform access granted."},
        ]

    return {
        "applicant_id":           applicant_id,
        "timestamp":              timestamp,
        "full_name":              full_name,
        "country":                country,
        "document_type":          doc_type,
        "data_source":            data_source,
        "openbanking_uk_consent": consent_token,
        "document_status":        doc_status,
        "biometric_status":       bio_status,
        "sanctions_match":        sanctions_match,
        "overall_status":         overall_status,
        "reason_if_failed":       reason,
        "risk_score":             risk_score,
        "audit_trail":            steps_log,
        "sanctions_result": {
            "ofac_sanctions_match":   ofac_match,
            "threshold_configured":   0.85,
            "match_confidence":       match_conf,
            "watchlist_entity_id":    watchlist_id,
        },
    }


# ── Bulk Mock Data Generator ──────────────────────────────────────────────────

def generate_mock_kyc_data(num_records: int = 50) -> list[dict]:
    """
    Produces realistic synthetic KYC applicant records for the demo pipeline.
    Pinned records ensure consistent demo narrative at the top of the list.
    """
    data = []

    # ── Pinned demo records (always at top for demo narrative) ────────────────
    data.append({
        "applicant_id": "ID-45734",
        "timestamp": (datetime.utcnow() - timedelta(minutes=8)).isoformat(),
        "full_name": "Vladimir Petrov",
        "country": "Russia",
        "document_type": "Passport",
        "data_source": "OpenBanking UK",
        "openbanking_uk_consent": "OB-CONSENT-9921X",
        "document_status": "Verified",
        "biometric_status": "Verified",
        "sanctions_match": "Critical Match",
        "overall_status": "Rejected",
        "reason_if_failed": "OFAC SDN critical match (≥85% confidence)",
        "risk_score": 0.98,
        "audit_trail": [
            {"step": "Onboarding Flow",    "status": "SUCCESS",  "msg": "OB consent handshake completed. Token: OB-CONSENT-9921X."},
            {"step": "Document Check",     "status": "SUCCESS",  "msg": "Passport validated via MRZ OCR. Checksum intact."},
            {"step": "Biometric Match",    "status": "SUCCESS",  "msg": "Facial liveness verification passed."},
            {"step": "Sanctions Screening","status": "CRITICAL", "msg": "Fuzzy hit at 98% confidence on OFAC SDN Entity OFAC-SDN-10412."},
            {"step": "Decision Logic",     "status": "FAILED",   "msg": "Fail-closed enforced — critical sanctions hit."},
            {"step": "Final Outcome",      "status": "FAILED",   "msg": "Application rejected. Regulatory notification filed."},
        ],
        "sanctions_result": {
            "ofac_sanctions_match": True,
            "threshold_configured": 0.85,
            "match_confidence": 0.98,
            "watchlist_entity_id": "OFAC-SDN-10412",
        },
    })

    data.append({
        "applicant_id": "ID-45678",
        "timestamp": (datetime.utcnow() - timedelta(hours=1, minutes=22)).isoformat(),
        "full_name": "Amelia Smith",
        "country": "United Kingdom",
        "document_type": "Passport",
        "data_source": "OpenBanking UK",
        "openbanking_uk_consent": "OB-CONSENT-4421X",
        "document_status": "Verified",
        "biometric_status": "Verified",
        "sanctions_match": "No Match",
        "overall_status": "Approved",
        "reason_if_failed": "None",
        "risk_score": 0.04,
        "audit_trail": [
            {"step": "Onboarding Flow",    "status": "SUCCESS", "msg": "OB consent handshake completed. Token: OB-CONSENT-4421X."},
            {"step": "Document Check",     "status": "SUCCESS", "msg": "Passport validated. MRZ checksum confirmed."},
            {"step": "Biometric Match",    "status": "SUCCESS", "msg": "Liveness check passed. No spoofing indicators."},
            {"step": "Sanctions Screening","status": "SUCCESS", "msg": "No OFAC, EU, or UN sanctions list matches found."},
            {"step": "Decision Logic",     "status": "SUCCESS", "msg": "All compliance rules satisfied."},
            {"step": "Final Outcome",      "status": "SUCCESS", "msg": "Identity verified. Platform access granted."},
        ],
        "sanctions_result": {
            "ofac_sanctions_match": False,
            "threshold_configured": 0.85,
            "match_confidence": 0.02,
            "watchlist_entity_id": None,
        },
    })

    data.append({
        "applicant_id": "ID-98765",
        "timestamp": (datetime.utcnow() - timedelta(hours=3, minutes=5)).isoformat(),
        "full_name": "Marcus Johnson",
        "country": "Russia",
        "document_type": "National ID Card",
        "data_source": "Synthetic DB",
        "openbanking_uk_consent": "OB-CONSENT-1123Y",
        "document_status": "Failed",
        "biometric_status": "Verified",
        "sanctions_match": "Potential Match",
        "overall_status": "Rejected",
        "reason_if_failed": "Document expired; Jurisdiction on FATF high-risk list",
        "risk_score": 0.89,
        "audit_trail": [
            {"step": "Onboarding Flow",    "status": "SUCCESS", "msg": "Synthetic DB ingestion. Token: OB-CONSENT-1123Y."},
            {"step": "Document Check",     "status": "FAILED",  "msg": "National ID expired 14 months ago. MRZ checksum mismatch."},
            {"step": "Biometric Match",    "status": "SUCCESS", "msg": "Liveness check passed despite document failure."},
            {"step": "Sanctions Screening","status": "PENDING", "msg": "Potential watchlist proximity match — secondary screening initiated."},
            {"step": "Decision Logic",     "status": "FAILED",  "msg": "Multi-axis failure: expired document + potential sanctions exposure."},
            {"step": "Final Outcome",      "status": "FAILED",  "msg": "Application rejected."},
        ],
        "sanctions_result": {
            "ofac_sanctions_match": False,
            "threshold_configured": 0.85,
            "match_confidence": 0.76,
            "watchlist_entity_id": "OFAC-SDN-8821",
        },
    })

    data.append({
        "applicant_id": "ID-45771",
        "timestamp": (datetime.utcnow() - timedelta(hours=5, minutes=41)).isoformat(),
        "full_name": "Fatima Al-Rashid",
        "country": "Iran",
        "document_type": "Passport",
        "data_source": "Synthetic DB",
        "openbanking_uk_consent": "OB-CONSENT-6632A",
        "document_status": "Verified",
        "biometric_status": "Verified",
        "sanctions_match": "Critical Match",
        "overall_status": "Rejected",
        "reason_if_failed": "OFAC SDN critical match (≥85% confidence)",
        "risk_score": 0.94,
        "audit_trail": [
            {"step": "Onboarding Flow",    "status": "SUCCESS",  "msg": "Synthetic DB ingestion. Token: OB-CONSENT-6632A."},
            {"step": "Document Check",     "status": "SUCCESS",  "msg": "Passport validated. MRZ checksum intact."},
            {"step": "Biometric Match",    "status": "SUCCESS",  "msg": "Liveness check passed."},
            {"step": "Sanctions Screening","status": "CRITICAL", "msg": "Critical OFAC SDN match at 92% confidence. Entity: OFAC-SDN-9912."},
            {"step": "Decision Logic",     "status": "FAILED",   "msg": "Fail-closed — jurisdiction Iran is sanctioned."},
            {"step": "Final Outcome",      "status": "FAILED",   "msg": "Application rejected. Notification filed."},
        ],
        "sanctions_result": {
            "ofac_sanctions_match": True,
            "threshold_configured": 0.85,
            "match_confidence": 0.92,
            "watchlist_entity_id": "OFAC-SDN-9912",
        },
    })

    data.append({
        "applicant_id": "ID-77102",
        "timestamp": (datetime.utcnow() - timedelta(hours=7)).isoformat(),
        "full_name": "Sophie Andersen",
        "country": "Germany",
        "document_type": "National ID Card",
        "data_source": "OpenBanking UK",
        "openbanking_uk_consent": "OB-CONSENT-7812B",
        "document_status": "Verified",
        "biometric_status": "Verified",
        "sanctions_match": "No Match",
        "overall_status": "Approved",
        "reason_if_failed": "None",
        "risk_score": 0.07,
        "audit_trail": [
            {"step": "Onboarding Flow",    "status": "SUCCESS", "msg": "OB consent handshake completed. Token: OB-CONSENT-7812B."},
            {"step": "Document Check",     "status": "SUCCESS", "msg": "National ID validated. MRZ integrity confirmed."},
            {"step": "Biometric Match",    "status": "SUCCESS", "msg": "Facial liveness verification passed."},
            {"step": "Sanctions Screening","status": "SUCCESS", "msg": "No OFAC, EU, or UN list matches."},
            {"step": "Decision Logic",     "status": "SUCCESS", "msg": "All rules satisfied. Clean profile."},
            {"step": "Final Outcome",      "status": "SUCCESS", "msg": "Identity verified. Access granted."},
        ],
        "sanctions_result": {
            "ofac_sanctions_match": False,
            "threshold_configured": 0.85,
            "match_confidence": 0.03,
            "watchlist_entity_id": None,
        },
    })

    # ── Bulk generated records ────────────────────────────────────────────────
    used_ids = {int(d["applicant_id"].replace("ID-", "")) for d in data}

    for _ in range(num_records - len(data)):
        fname = random.choice(FIRST_NAMES)
        lname = random.choice(LAST_NAMES)
        full_name = f"{fname} {lname}"

        status_choice = random.choices(
            ["Approved", "Rejected", "Pending Review"],
            weights=[55, 25, 20],
            k=1
        )[0]

        doc_type = random.choice(DOCUMENT_TYPES)

        if status_choice == "Approved":
            country         = random.choice(CLEAN_COUNTRIES)
            data_source     = random.choice(["OpenBanking UK", "OpenBanking UK", "Synthetic DB"])
            doc_status      = "Verified"
            bio_status      = "Verified"
            sanctions_match = "No Match"
            overall_status  = "Approved"
            reason          = "None"
            risk_score      = round(random.uniform(0.01, 0.20), 2)
            ofac_match      = False
            match_conf      = round(random.uniform(0.01, 0.12), 2)
            watchlist_id    = None

            steps_log = [
                {"step": "Onboarding Flow",    "status": "SUCCESS", "msg": f"Ingestion handshake success. Source: {data_source}."},
                {"step": "Document Check",     "status": "SUCCESS", "msg": f"{doc_type} validated via OCR and MRZ checksum."},
                {"step": "Biometric Match",    "status": "SUCCESS", "msg": "Liveness verification passed."},
                {"step": "Sanctions Screening","status": "SUCCESS", "msg": "No sanctions list matches. Profile clean."},
                {"step": "Decision Logic",     "status": "SUCCESS", "msg": "All compliance rules satisfied."},
                {"step": "Final Outcome",      "status": "SUCCESS", "msg": "Identity verified. Access granted."},
            ]

        elif status_choice == "Rejected":
            country         = random.choice(SANCTIONED_COUNTRIES + HIGH_RISK_COUNTRIES[:2])
            data_source     = random.choice(["OpenBanking UK", "Synthetic DB"])
            doc_status      = random.choice(["Verified", "Verified", "Failed"])
            bio_status      = "Verified" if doc_status == "Verified" else random.choice(["Verified", "Failed"])
            sanctions_match = "Critical Match" if country in SANCTIONED_COUNTRIES else "Potential Match"
            overall_status  = "Rejected"
            reason          = random.choice(FAILURE_REASONS[:5])
            risk_score      = round(random.uniform(0.70, 0.99), 2)
            ofac_match      = sanctions_match == "Critical Match"
            match_conf      = round(random.uniform(0.85, 0.99), 2) if ofac_match else round(random.uniform(0.60, 0.84), 2)
            watchlist_id    = f"OFAC-SDN-{random.randint(1000, 9999)}" if sanctions_match in ["Critical Match", "Potential Match"] else None

            steps_log = [
                {"step": "Onboarding Flow",    "status": "SUCCESS",                                                      "msg": f"Ingestion handshake. Source: {data_source}."},
                {"step": "Document Check",     "status": "SUCCESS" if doc_status == "Verified" else "FAILED",            "msg": f"{doc_type} status: {doc_status}."},
                {"step": "Biometric Match",    "status": "SUCCESS" if bio_status == "Verified" else "FAILED",            "msg": "Liveness check " + ("passed." if bio_status == "Verified" else "failed.")},
                {"step": "Sanctions Screening","status": "CRITICAL" if sanctions_match == "Critical Match" else "PENDING","msg": f"Watchlist evaluation: {sanctions_match}. Conf: {match_conf*100:.0f}%."},
                {"step": "Decision Logic",     "status": "FAILED",                                                       "msg": "Fail-closed due to sanctions or document failure."},
                {"step": "Final Outcome",      "status": "FAILED",                                                       "msg": f"Rejected: {reason}."},
            ]

        else:  # Pending Review
            country         = random.choice(HIGH_RISK_COUNTRIES + ["United States", "Canada"])
            data_source     = random.choice(["OpenBanking UK", "Synthetic DB"])
            doc_status      = "Verified"
            bio_status      = "Verified"
            sanctions_match = "Potential Match"
            overall_status  = "Pending Review"
            reason          = "Secondary Review Required"
            risk_score      = round(random.uniform(0.40, 0.69), 2)
            ofac_match      = False
            match_conf      = round(random.uniform(0.45, 0.75), 2)
            watchlist_id    = f"OFAC-SDN-{random.randint(5000, 9000)}"

            steps_log = [
                {"step": "Onboarding Flow",    "status": "SUCCESS", "msg": f"Ingestion handshake. Source: {data_source}."},
                {"step": "Document Check",     "status": "SUCCESS", "msg": f"{doc_type} validated."},
                {"step": "Biometric Match",    "status": "SUCCESS", "msg": "Liveness check passed."},
                {"step": "Sanctions Screening","status": "PENDING", "msg": f"Proximity match detected. Manual review required."},
                {"step": "Decision Logic",     "status": "PENDING", "msg": "Escalated to compliance officer queue."},
                {"step": "Final Outcome",      "status": "PENDING", "msg": "Pending sign-off."},
            ]

        # Generate unique applicant ID
        while True:
            app_num = 44000 + random.randint(1000, 9999)
            if app_num not in used_ids:
                used_ids.add(app_num)
                break

        mock_ts = (datetime.utcnow() - timedelta(
            days=random.randint(0, 29),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )).isoformat()

        data.append({
            "applicant_id":           f"ID-{app_num}",
            "timestamp":              mock_ts,
            "full_name":              full_name,
            "country":                country,
            "document_type":          doc_type,
            "data_source":            data_source,
            "openbanking_uk_consent": f"OB-CONSENT-{random.randint(10000,99999)}X",
            "document_status":        doc_status,
            "biometric_status":       bio_status,
            "sanctions_match":        sanctions_match,
            "overall_status":         overall_status,
            "reason_if_failed":       reason,
            "risk_score":             risk_score,
            "audit_trail":            steps_log,
            "sanctions_result": {
                "ofac_sanctions_match": ofac_match,
                "threshold_configured": 0.85,
                "match_confidence":     match_conf,
                "watchlist_entity_id":  watchlist_id,
            },
        })

    return data


if __name__ == "__main__":
    print("=" * 60)
    print("Real Rails Intelligence Library — POC 56")
    print("Digital Identity & KYC Flow — Data Pipeline (ETL) Demo")
    print("=" * 60)
    
    print("\n[1] Evaluating live KYC rules for test applicant:")
    test_result = evaluate_kyc_rules("John Doe", "United Kingdom", "ID-TEST-001")
    print(f"Name:           {test_result['full_name']}")
    print(f"Country:        {test_result['country']}")
    print(f"Overall Status: {test_result['overall_status']}")
    print(f"Risk Score:     {test_result['risk_score']}")
    print("Audit Trail Steps:")
    for step in test_result['audit_trail']:
        print(f"  - [{step['status']}] {step['step']}: {step['msg']}")
    
    print("\n[2] Generating 5 sample mock KYC records:")
    mock_records = generate_mock_kyc_data(5)
    for record in mock_records:
        print(f"  ID: {record['applicant_id']} | Name: {record['full_name']:<18} | Country: {record['country']:<15} | Status: {record['overall_status']}")
    print("=" * 60)

