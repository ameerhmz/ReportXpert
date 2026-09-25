### Option A: Recommended One-Click Launcher
```bash
./run_all.sh
```
*(Automatically verifies dependencies, builds Next.js, and launches both services).*





# 💻 ReportXpert — Master Terminal Commands Reference

This document contains every terminal command needed to setup, run, manage, and debug the ReportXpert Sovereign AI Workbench on any Mac or Linux machine.

---

## ⚡ 1. Fast Setup (Zero-To-Hero)

Run these commands in order on a fresh machine:

```bash
# 1. Clone repository
git clone https://github.com/ameerhmz/ReportXpert.git
cd ReportXpert

# 2. Start Ollama in background (or open Ollama app)
ollama serve &

# 3. Pull all 4 required open-weight models in one line
ollama pull llama3.2:3b && ollama pull deepseek-r1:7b && ollama pull qwen2.5vl:3b && ollama pull nomic-embed-text

# 4. Install backend Python dependencies
pip3 install -r requirements.txt

# 5. Launch the entire workbench (Boots FastAPI on :8000 & Next.js on :3000)
chmod +x run_all.sh
./run_all.sh
```

---

## 🧠 2. Ollama Model Commands

### Pull All Models in One Shot:
```bash
ollama pull llama3.2:3b && ollama pull deepseek-r1:7b && ollama pull qwen2.5vl:3b && ollama pull nomic-embed-text
```

### Pull Models Individually:
```bash
# Supervisor & Orchestration (Fast General Chat)
ollama pull llama3.2:3b

# Statutory Compliance & Audit (Chain-of-Thought Deep Reasoning)
ollama pull deepseek-r1:7b

# Multimodal Document OCR & Blueprints (Vision AI)
ollama pull qwen2.5vl:3b

# Vector Semantic Embeddings (Knowledge Vault / RAG)
ollama pull nomic-embed-text
```

### For Low-RAM Laptops (8 GB Shared Memory):
If `deepseek-r1:7b` is slow on an 8 GB machine, pull the lightweight 1.5B model instead:
```bash
ollama pull deepseek-r1:1.5b
```

### Check Installed Models:
```bash
ollama list
```

### Test Local Inference Directly in Terminal:
```bash
ollama run llama3.2:3b "Hello, report status."
```

---

## 🚀 3. Running Services

### Option A: Recommended One-Click Launcher
```bash
./run_all.sh
```
*(Automatically verifies dependencies, builds Next.js, and launches both services).*

---

### Option B: Running Services Manually in Separate Terminals

#### Terminal 1 — Backend (Port 8000):
```bash
cd backend
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* API Root: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### Terminal 2 — Frontend (Port 3000):
```bash
cd frontend
npm install   # (Only needed once)
npm run dev
```
* UI Dashboard: [http://localhost:3000](http://localhost:3000)

---

## 🧹 4. Troubleshooting & Process Cleanup

### Kill Stuck Processes on Ports 8000 & 3000:
If a previous session crashed or ports are busy:
```bash
lsof -ti :8000,3000 | xargs kill -9
```

### Clear Next.js Turbopack Cache:
```bash
rm -rf frontend/.next
```

### Test Backend Imports:
Verify that all Python dependencies load without errors:
```bash
PYTHONPATH=backend python3 -c "import app.main; print('Backend loaded successfully!')"
```

### Test RAG Embedding Model:
```bash
PYTHONPATH=backend python3 -c "from app.tools.rag_engine import rag_engine; print('Dimension:', len(rag_engine.encode(['test'])[0]))"
```

---

## 📦 5. Database & Seeding Commands

### Re-seed Complete Sovereign Knowledge Vault:
Populates 30-column Scopus papers, faculty records, student scholarships, and statutory standards:
```bash
PYTHONPATH=backend python3 -m app.scripts.seed_comprehensive_vault
```

### Inspect Local Database:
```bash
sqlite3 backend/app/data/workbench.db ".tables"
sqlite3 backend/app/data/workbench.db "SELECT count(*) FROM research_papers;"
sqlite3 backend/app/data/workbench.db "SELECT count(*) FROM scholarships;"
```

---

## 🐙 6. Git Workflow Commands

### Pull Latest Updates from GitHub:
```bash
git pull origin main
```

### Check Git Status:
```bash
git status
```

### Commit & Push Local Changes:
```bash
git add .
git commit -m "Update workbench features"
git push origin main
```

---

## 🐳 7. Docker (Alternative Deployment)

```bash
# Build and run all services (Backend, Frontend, Ollama)
docker-compose up --build

# Run in background (detached)
docker-compose up -d

# Stop all containers
docker-compose down
```
