# Real Rails · User Acceptance Testing (UAT) Checklist

> **POC ID:** 56  
> **Project Title:** Digital Identity & KYC Flow  
> **Test Status:** 🟢 100% PASSED

---

## 🛠️ 1. Engineering Verification

| UAT Item ID | Feature Checked | Acceptance Criteria | Result | Status |
| :--- | :--- | :--- | :---: | :---: |
| **ENG-01** | Frontend Start | Next.js server starts on port `3000` via `npm run dev` or `npm run dev` under Turbopack. | Page loaded in browser | 🟢 PASS |
| **ENG-02** | Backend Start | FastAPI server starts on port `8000` via virtual environment `venv` and uvicorn. | Logs confirm server up | 🟢 PASS |
| **ENG-03** | Frontend Build | `npm run build` generates production bundle without TS/ESLint warnings. | Build completed in <10s | 🟢 PASS |
| **ENG-04** | Console Errors | Browser inspection console lists no JavaScript/React crash exceptions. | 0 errors found | 🟢 PASS |
| **ENG-05** | API Handshake | Frontend fetches stats and applicants dynamically from backend. | Initial stats populated | 🟢 PASS |
| **ENG-06** | Data Resilience | Frontend falls back to `mock_data.json` if FastAPI is unreachable. | Fallback console warning shown | 🟢 PASS |

---

## 🎨 2. Experience & Design Verification

| UAT Item ID | Feature Checked | Acceptance Criteria | Result | Status |
| :--- | :--- | :--- | :---: | :---: |
| **EXP-01** | Visual Theme | Curated, harmonious dark-mode palette using sleek grays, slate, and brand HSL colors. | Premium visual theme | 🟢 PASS |
| **EXP-02** | Micro-Animations | Active glowing nodes, pulsating live indicator, loading spinner, and CSV button bounce. | Interactions feel alive | 🟢 PASS |
| **EXP-03** | Visual Topology | Workflow tab visually maps current applicant audit path via React Flow hierarchy tree. | Interactive nodes render | 🟢 PASS |
| **EXP-04** | Interactive Simulator| Submitting a name runs a multi-second step-by-step compliance evaluation handshake. | Execution step text updates | 🟢 PASS |
| **EXP-05** | Live Search | Typing searches and filters applicants by ID, Name, or Country on the fly. | Live table updates | 🟢 PASS |
| **EXP-06** | Dropdown Filters | Filtering by Status, Data Source, or Date Range narrows records correctly. | Filters operate cleanly | 🟢 PASS |
| **EXP-07** | Intelligence Sidebar| Sidebar renders Key Metrics, compliance mapping, filter controls, and glossary definition glossary. | Clear storytelling layout | 🟢 PASS |

---

## 🏗️ 3. Architecture & Code Integrity

| UAT Item ID | Feature Checked | Acceptance Criteria | Result | Status |
| :--- | :--- | :--- | :---: | :---: |
| **ARC-01** | Code Separation | Clean segregation of FastAPI backend (ETL layer) and Next.js frontend (View layer). | Correct folder layout | 🟢 PASS |
| **ARC-02** | State Management| React hooks manage active applicant selections and filter values seamlessly. | Immediate state updates | 🟢 PASS |
| **ARC-03** | Data Ingestion | Post request creates and pre-evaluates new applicant and appends to Pandas DataFrame. | Applicant added to Stream | 🟢 PASS |
| **ARC-04** | CSV Streaming | Export endpoint streams data filtered to matching query arguments. | CSV downloads on click | 🟢 PASS |
| **ARC-05** | Deliverables | Root contains README.md, VAR_REPORT.md, UAT_CHECKLIST.md, and media assets under `delivery/`. | All documents present | 🟢 PASS |
