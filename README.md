# ReportXpert — Sovereign University Administration & Accreditation AI Workbench

An on-premise, 100% air-gapped agentic intelligence workbench built for university accreditation auditing, statutory compliance reports (NAAC, NIRF, UGC, etc.), research repository analysis, and document inspection.

---

## 🚀 Quickstart Guide (For New Laptops / Collaborators)

### 1. Prerequisites
Ensure you have installed:
* **Python 3.10+** (with `pip`)
* **Node.js 18+** (with `npm`)
* **[Ollama](https://ollama.com/)**

---

### 2. Pull Required Open-Weight Models
Start the Ollama service:
```bash
ollama serve
```

In a new terminal window, pull all required models (including embeddings) in one command:
```bash
ollama pull llama3.2:3b && ollama pull deepseek-r1:7b && ollama pull qwen2.5vl:3b && ollama pull nomic-embed-text
```

| Model | Size | Role |
| :--- | :--- | :--- |
| **`llama3.2:3b`** | 2.0 GB | Supervisor, Orchestrator, & Conversational Q&A |
| **`deepseek-r1:7b`** | 4.7 GB | Deep Reasoning & Statutory Compliance Audit |
| **`qwen2.5vl:3b`** | 3.2 GB | Multimodal Vision OCR & Blueprint Analysis |
| **`nomic-embed-text`** | 274 MB | High-Precision Neural Embeddings (Knowledge Vault / RAG) |

> **Note for 8 GB RAM laptops**: If 7B is too slow on your laptop, you can optionally pull the lightweight `deepseek-r1:1.5b`:
> ```bash
> ollama pull deepseek-r1:1.5b
> ```

---

### 3. Install Dependencies & Launch

From the root project directory:

```bash
# 1. Install Python dependencies
pip3 install -r requirements.txt

# 2. Launch both FastAPI Backend (8000) & Next.js UI (3000)
./run_all.sh
```

> **Note**: `./run_all.sh` will also automatically verify python packages and run `npm install` for the frontend if `node_modules` is not yet present.

---

### 4. Access the Workbench
* **Interactive UI**: [http://localhost:3000](http://localhost:3000)
* **Backend API & OpenAPI Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Egress Verification**: Verified 0.00 KB cloud egress on-premise.
