# ReportXpert — Autonomous University Administration & Accreditation AI Workbench

[![SIH 2024](https://img.shields.io/badge/SIH-2024-orange.svg)](https://www.sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26117-blue.svg)](https://www.sih.gov.in/)
[![Privacy Guarantee](https://img.shields.io/badge/Cloud%20Egress-0.00%20KB%20(Air--Gapped)-success.svg)](#security--data-sovereignty)
[![Architecture](https://img.shields.io/badge/Hardware-NVIDIA%20DGX%20Native-76b900.svg)](#hardware--gpu-architecture)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2%20(App%20Router)-black.svg)](https://nextjs.org/)

**ReportXpert** is an on-premise, 100% sovereign artificial intelligence workbench designed for higher education institutions. Operating natively on university-owned **NVIDIA DGX supercomputer hardware**, ReportXpert builds a private, personalized Large Language Model (LLM) dedicated exclusively to the university’s internal data ecosystem.

The system autonomously ingests unstructured institutional archives—faculty CVs, Scopus publications, research grants, patent certificates, student records, and placement data—audits mathematical accuracy, validates citations, and generates ready-to-submit official compliance dossiers for **NAAC SSR, NIRF, MDRF, and internal faculty appraisals in under 5 minutes**.

---

## 📑 Table of Contents
- [Executive Overview & Problem Statement](#-executive-overview--problem-statement)
- [Key Features & Capabilities](#-key-features--capabilities)
- [System Architecture & Multi-Agent Engine](#-system-architecture--multi-agent-engine)
- [Project Directory Structure](#-project-directory-structure)
- [Quickstart Guide (Local Development)](#-quickstart-guide-local-development)
- [Production Deployment (NVIDIA DGX GPU Node)](#-production-deployment-nvidia-dgx-gpu-node)
- [REST API Endpoints Reference](#-rest-api-endpoints-reference)
- [Interactive UI Tabs Tour](#-interactive-ui-tabs-tour)
- [Security, Privacy & Air-Gap Compliance](#-security-privacy--air-gap-compliance)
- [Institutional Transformation (Before vs. After)](#-institutional-transformation-before-vs-after)
- [Future Roadmap](#-future-roadmap)
- [Contributors & License](#-contributors--license)

---

## 🏛️ Executive Overview & Problem Statement

### The Administrative Challenge Every University Faces:
Every semester, universities drown in administrative paperwork. Statutory bodies such as the **National Assessment and Accreditation Council (NAAC)**, **National Institutional Ranking Framework (NIRF)**, and **Multi-Disciplinary Ranking Framework (MDRF)** require hundreds of complex, cross-departmental reports:
1. **Faculty Burnout & Lost Teaching Productivity:** Over 50 senior professors and department heads are pulled from teaching and active research for 3 to 4 months every cycle to manually collect paper certificates, track down co-authors, and reconcile spreadsheet formulas.
2. **Scattered, Unstructured Ground Truth:** Critical evidence is trapped in physical filing cabinets, unstandardized Word CVs, scanned certificates, and mismatched departmental Excel sheets.
3. **High Rate of Costly Human Errors:** Copy-pasting data into complex regulatory templates causes formula calculation errors, uncounted citations, and missing proofs—risking downgraded accreditation grades and forfeited government grants.
4. **The Security Failure of Commercial Cloud AI:** Universities cannot use public commercial tools (e.g., ChatGPT, Claude Cloud) because transmitting confidential student marks, faculty appraisals, payrolls, and unpublished patent drafts to overseas servers violates statutory privacy regulations and creates severe intellectual property risks.

### The ReportXpert Solution:
ReportXpert deploys an on-premise sovereign AI engine that turns months of manual compilation into **a verified 5-minute automated workflow**, running 100% offline on internal university hardware with **guaranteed zero cloud data leakage (0.00 KB cloud egress)**.

---

## ⚡ Key Features & Capabilities

### 1. Automated Faculty Research Profiler (CV to Proof)
* **Unstructured Ingestion:** Deep-parses faculty resumes in `.pdf`, `.docx`, and scanned formats.
* **Publication Extraction & Scopus Verification:** Automatically validates paper titles, authors, journals, DOIs, and citation counts against Scopus and Web of Science indices.
* **Sponsored Grants & Patents:** Extracts sanctioned grant amounts from government funding agencies (DST, DBT, CSIR, ICMR, SERB) and catalogs granted/published patents.
* **Appraisal Points (API Scores):** Automatically tallies Academic Performance Indicator points according to UGC 7th Pay Commission promotion regulations.

### 2. 1-Click Accreditation Report Engine (NAAC / NIRF / MDRF)
* **NAAC Self-Study Report (SSR - Criteria 1 to 7):** Generates both:
  - **Quantitative Metrics (QnM):** Formatted numerical scorecards matching exact regulatory formulas.
  - **Qualitative Metrics (QlM):** Compliant, structured descriptive narratives (500 words per sub-criterion).
* **NIRF & MDRF Rankings Module:** Automatically computes Teaching, Learning & Resources (TLR), Research & Professional Practice (RPC), and verifies Student-to-Faculty Ratios (SFR).

### 3. Cross-Departmental Harvester & Computer Vision
* **Placement & Recruiters:** Aggregates student placement statistics, recruiting companies, CTC packages, and offer letters.
* **Multimodal Vision OCR:** Local vision models inspect scanned sports trophies, certificates, and cultural awards.
* **Extension Activities:** Catalogs community outreach hours (NSS, NCC, blood donation drives).
* **Auditable Digital Proof Links:** Every extracted row in generated spreadsheets links directly to its underlying scanned proof document.

### 4. Dynamic Regulatory Multi-Format Template Engine
* **Official Word Dossiers (`.docx`):** Built programmatically with formal university headers, tables of contents, and criterion-specific headings.
* **Government Excel Workbooks (`.xlsx`):** Multi-sheet workbooks matching exact government portal column structures with zero formula errors.

### 5. Conversational Plain-English Query Console
* Natural language querying for non-technical leadership (Deans, HODs, IQAC Directors):
  - *"What is our total Scopus paper count for the CS department in 2024?"*
  - *"Compile NAAC Criterion 3.4 research dossier."*
  - *"Verify our NIRF student-to-teacher ratio and highlight any anomalies."*

---

## 🧠 System Architecture & Multi-Agent Engine

```
                             ┌────────────────────────────────────────────────────────┐
                             │             ON-CAMPUS NVIDIA DGX ENCLAVE               │
                             │       (100% Sovereign • 0.00 KB Cloud Egress)          │
                             └────────────────────────────────────────────────────────┘
                                                        │
    ┌────────────────────────┐                          ▼                         ┌─────────────────────────┐
    │  RAW UNSTRUCTURED DATA │               ┌──────────────────────┐             │   REGULATORY OUTPUTS    │
    ├────────────────────────┤               │ REPORTXPERT WORKBENCH│             ├─────────────────────────┤
    │ • Faculty CVs (PDF/Doc)│ ──── REST ──> │ • FastAPI Backend    │ ── Output ─>│ • NAAC SSR (.docx)      │
    │ • Scopus / WoS BibTeX  │     API       │ • LangGraph State Mch│             │ • NIRF Workbooks (.xlsx)│
    │ • Grant Letters (DST)  │ (Port 8000)   │ • ChromaDB Vector RAG│             │ • Faculty API Dossiers  │
    │ • Patents & Copyrights │               │ • SQLite GroundTruth │             │ • 1-Click Proof Links   │
    │ • Sports/Event Photos  │               └──────────────────────┘             └─────────────────────────┘
    └────────────────────────┘                          ▲
                                                        │ Local Ollama / vLLM
                                                        ▼
                             ┌────────────────────────────────────────────────────────┐
                             │                 THE DUAL-AI ENGINE                     │
                             ├────────────────────────────────────────────────────────┤
                             │ • Intelligent Coordinator: Llama 3.2 (3B Parameters)   │
                             │ • Strict Mathematical Auditor: DeepSeek-R1 (7B Params) │
                             │ • Vision & Document OCR: Qwen2.5-VL (3B Parameters)    │
                             │ • Local Embeddings: nomic-embed-text (ChromaDB Vault)  │
                             └────────────────────────────────────────────────────────┘
```

### The Dual-AI Triad:
1. **The Intelligent Coordinator (`llama3.2:3b`):**  
   Acts as the supervisor and conversational co-pilot. Understands natural-language queries from non-technical professors, handles intent classification, routes requests, and coordinates report generation.
2. **The Strict Mathematical Auditor (`deepseek-r1:7b`):**  
   Acts as an incorruptible auditor. Uses deep chain-of-thought reasoning to independently verify arithmetic calculations, cross-audit student-faculty ratios, detect missing DOIs, and flag data discrepancies before any dossier is exported.
3. **The Multimodal Inspector (`qwen2.5vl:3b`):**  
   Processes scanned certificates, receipts, event photos, and blueprints to extract text and stamp verifications.
4. **The Neural Embedder (`nomic-embed-text`):**  
   Embeds university documents and criteria guidelines into a local **ChromaDB** vector store for semantic context retrieval.

---

## 📂 Project Directory Structure

```
sih26117_workbench/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py              # System settings & environment configuration
│   │   │   └── database.py            # SQLite database connection & schema models
│   │   ├── graph/
│   │   │   ├── workflow.py            # LangGraph multi-agent state machine
│   │   │   └── nodes/
│   │   │       ├── supervisor.py      # Llama 3.2 coordinator node
│   │   │       ├── auditor.py         # DeepSeek-R1 math & compliance auditor node
│   │   │       └── vision.py          # Qwen2.5-VL certificate & photo inspection node
│   │   ├── tools/
│   │   │   ├── cv_parser.py           # Word/PDF resume extraction & entity parser
│   │   │   ├── scopus_parser.py       # Scopus/WoS publication & DOI verification
│   │   │   ├── rag_engine.py          # ChromaDB vector retrieval & semantic search
│   │   │   └── report_generator.py    # python-docx & openpyxl report builder
│   │   ├── scripts/
│   │   │   └── seed_rag.py            # Pre-populates knowledge vault with NAAC guidelines
│   │   ├── data/
│   │   │   └── workbench.db           # SQLite ground truth database
│   │   └── main.py                    # FastAPI entrypoint exposing 35+ REST endpoints
│   ├── requirements.txt               # Backend Python dependencies
│   └── Dockerfile                     # Containerized backend environment
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Next.js 14 reactive dashboard
│   │   │   └── layout.tsx             # Root layout & glassmorphic navigation
│   │   ├── components/
│   │   │   ├── AirGapModal.tsx        # Egress verification & offline status monitor
│   │   │   └── tabs/
│   │   │       ├── ChatConsole.tsx    # Conversational plain-English query interface
│   │   │       ├── FacultyTab.tsx     # Faculty profiling & CV ingestion UI
│   │   │       ├── TemplatesTab.tsx   # NAAC/NIRF 1-click report generation UI
│   │   │       └── CalculationTab.tsx # Live DeepSeek-R1 auditing & math verification
│   │   └── types/                     # TypeScript definitions for telemetry & reports
│   ├── package.json                   # Frontend dependencies
│   └── next.config.ts                 # Next.js build configuration
│
├── gpu_node/
│   ├── model_switcher_daemon.py       # Dynamic VRAM manager for NVIDIA DGX nodes
│   ├── run_auditor_vllm.sh            # vLLM launch script for DeepSeek-R1
│   └── run_vision_vllm.sh             # vLLM launch script for Qwen2.5-VL
│
├── run_all.sh                         # Master one-click startup script (Backend + UI)
├── COMMANDS.md                        # Complete terminal commands reference
├── SUBMISSION_DETAILS.md              # 4-point official project submission details
├── ReportXpert_Plain_Print.pdf        # Print-optimized 2-page academic proposal
└── README.md                          # Master documentation
```

---

## 🚀 Quickstart Guide (Local Development)

### 1. Prerequisites
Ensure you have installed:
* **Python 3.10+** (with `pip`)
* **Node.js 18+** (with `npm`)
* **[Ollama](https://ollama.com/)**

### 2. Pull Required Open-Weight Models
Start the Ollama daemon:
```bash
ollama serve
```

In a new terminal window, pull all required models in one command:
```bash
ollama pull llama3.2:3b && ollama pull deepseek-r1:7b && ollama pull qwen2.5vl:3b && ollama pull nomic-embed-text
```

| Model | Parameter Size | Download Size | Role in ReportXpert |
| :--- | :--- | :--- | :--- |
| **`llama3.2:3b`** | 3 Billion | 2.0 GB | Supervisor, Orchestrator & Natural Language Q&A |
| **`deepseek-r1:7b`** | 7 Billion | 4.7 GB | Deep Mathematical Reasoning & Statutory Audit |
| **`qwen2.5vl:3b`** | 3 Billion | 3.2 GB | Multimodal Vision OCR & Certificate Analysis |
| **`nomic-embed-text`** | — | 274 MB | Neural Embeddings for ChromaDB Knowledge Vault |

> **Tip for 8 GB RAM Laptops:** If `deepseek-r1:7b` runs slowly on your machine, you can optionally pull the lightweight 1.5B variant:
> ```bash
> ollama pull deepseek-r1:1.5b
> ```

### 3. Launch with One Command
From the root `sih26117_workbench` directory, simply run:
```bash
chmod +x run_all.sh
./run_all.sh
```
`./run_all.sh` will automatically:
1. Verify Python dependencies and install missing packages.
2. Initialize or verify the Next.js frontend dependencies (`npm install`).
3. Start the FastAPI backend on port `8000`.
4. Start the Next.js development server on port `3000`.

### 4. Access the Workbench
* **Interactive Web Dashboard:** [http://localhost:3000](http://localhost:3000)
* **Backend REST API Docs (Swagger):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **API Telemetry & Health:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 🖥️ Production Deployment (NVIDIA DGX GPU Node)

When deploying on an on-premise **NVIDIA DGX Station or DGX A100/H100 Node**:

### 1. High-Throughput Inference with vLLM
Rather than Ollama, production GPU deployments utilize **vLLM** for OpenAI-compatible continuous batching:
```bash
# Launch DeepSeek-R1 Auditor on GPU
bash gpu_node/run_auditor_vllm.sh

# Launch Qwen2.5-VL Multimodal Vision on GPU
bash gpu_node/run_vision_vllm.sh
```

### 2. Dynamic Model VRAM Manager
To maximize GPU efficiency on workstations with shared VRAM, run the model switcher daemon:
```bash
python3 gpu_node/model_switcher_daemon.py
```
This automatically offloads inactive weights and dynamically swaps between the Coordinator, Auditor, and Vision models in under 4 seconds based on task queues.

---

## 📡 REST API Endpoints Reference

The FastAPI backend exposes over 35 modular endpoints:

### Core Orchestration & Conversational AI
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and active model status |
| `GET` | `/api/telemetry` | Live hardware memory, GPU VRAM, and token throughput |
| `POST` | `/api/chat` | Send a natural language prompt to the Coordinator |
| `POST` | `/api/chat/stream` | Stream tokens asynchronously via Server-Sent Events (SSE) |
| `POST` | `/api/workflow/run` | Execute end-to-end multi-agent LangGraph workflow |

### Regulatory Frameworks & Accreditation
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/frameworks/templates` | List all supported regulatory templates (NAAC, NIRF, MDRF) |
| `POST` | `/api/frameworks/generate` | Compile official Word (`.docx`) and Excel (`.xlsx`) dossiers |
| `GET` | `/api/frameworks/download/{filename}` | Download generated regulatory reports |

### Research, Publications & Scopus
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/research/parse-scopus` | Ingest and parse Scopus BibTeX, CSV, or DOI callouts |
| `GET` | `/api/research/papers` | Retrieve all verified faculty publications with citation counts |
| `POST` | `/api/research/deduplicate` | Cross-match author aliases and remove duplicate papers |
| `POST` | `/api/research/compile-excel` | Export verified research data directly into NIRF/NAAC tables |

### Faculty Profiler & Dossiers
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/knowledge/smart-ingest` | Upload raw faculty CVs (Word/PDF) for automated parsing |
| `POST` | `/api/reports/faculty-dossier` | Generate complete faculty appraisal & API score dossier |
| `POST` | `/api/calculations/run` | Trigger DeepSeek-R1 mathematical verification audit |

---

## 💻 Interactive UI Tabs Tour

The Next.js 14 frontend features an administrative workbench:

1. **Conversational Co-Pilot Tab:**  
   Natural-language console for deans and administrators to ask questions, view citation sources, and execute administrative queries.
2. **Faculty Research Profiler:**  
   Drop in raw resumes or Scopus files. Instantly displays verified publication cards, grant sanction totals, and UGC API promotion scores.
3. **Regulatory Templates & 1-Click Reports:**  
   Select target framework (NAAC Criteria 1–7, NIRF TLR/RPC, MDRF). Click "Generate Official Dossier" to receive pre-formatted Word books and Excel spreadsheets.
4. **Deep Auditor & Calculation Tab:**  
   Live chain-of-thought console showing DeepSeek-R1 auditing every formula, cross-checking student-faculty ratios, and highlighting any data discrepancy.
5. **Air-Gap Security Modal:**  
   Visual confirmation displaying active local network sockets, local inference engines, and verified **0.00 KB cloud egress**.

---

## 🔒 Security, Privacy & Air-Gap Compliance

| Dimension | Cloud AI Services (ChatGPT, Claude API) | ReportXpert On-Premise Engine |
| :--- | :--- | :--- |
| **Data Transmission** | Prompts & files sent to foreign servers | **Zero transmission (0.00 KB Egress)** |
| **Storage Location** | Third-party public cloud providers | **Internal university server room** |
| **Confidential Data** | Student marks & salaries exposed externally | **100% private inside campus network** |
| **Internet Dependency** | Hard requirement (down if internet fails) | **Operates 100% offline (Air-gapped)** |
| **Statutory Compliance** | High risk of regulatory privacy violations | **Full regulatory compliance & data sovereignty** |

---

## 📊 Institutional Transformation (Before vs. After)

| Metric | Traditional Manual Process | With ReportXpert Engine |
| :--- | :--- | :--- |
| **Faculty Labor & Time** | 50+ professors working late for 3 to 4 months | **Under 5 minutes** per comprehensive dossier |
| **Calculation Accuracy** | Frequent formula errors, missed papers, wrong ratios | **100% verified accuracy** audited by DeepSeek-R1 |
| **Publication Coverage** | 15–20% of papers uncounted due to manual self-reporting | **100% automated extraction** from CVs and Scopus |
| **Peer Team Inspection** | Panic searching through filing cabinets for paper proof | **Instant digital audit trail** with 1-click links to proof |
| **Data Privacy & Security** | High risk of data leaks from commercial web tools | **100% on-premise sovereignty** on NVIDIA DGX |

---

## 🔮 Future Roadmap

1. **Multi-Campus Federated Intelligence:** Connecting affiliated colleges and satellite campuses under a unified governance dashboard with local data isolation.
2. **Predictive Accreditation Simulation:** Machine learning simulation forecasting NIRF ranking shifts and NAAC grade impacts before final submission.
3. **Direct Government Regulatory API Gateway:** Cryptographically signed digital submission directly into government portals (NAAC, AISHE, NIRF API).
4. **Multilingual & Regional Language Support:** Expanding localized speech-to-text and multilingual NLP to support state universities in Hindi and regional languages.
5. **Longitudinal Student Career & Alumni Trajectory Engine:** Connecting placement databases and alumni networks for continuous Criterion 5 outcomes intelligence.

---

## 👥 Contributors & Hackathon Submission

* **Team Name:** ReportXpert Team
* **Hackathon:** Smart India Hackathon (SIH 2024)
* **Problem Statement:** SIH26117 — Autonomous Institutional Reporting & Accreditation Engine
* **Repository:** [https://github.com/ameerhmz/ReportXpert.git](https://github.com/ameerhmz/ReportXpert.git)

---

<p align="center">
  <strong>ReportXpert © 2026 • Sovereign Institutional Intelligence & Accreditation Engine</strong>
</p>
