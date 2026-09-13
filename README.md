# National Unified Material Master (NUMM) · One Nation · One Material Code
### Ministry of Petroleum & Natural Gas (MoP&NG) · Problem Statement SIH26099

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org)
[![Vite 6](https://img.shields.io/badge/Vite-6.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org)
[![FAISS](https://img.shields.io/badge/FAISS-Vector--Search-blue?style=flat)](https://github.com/facebookresearch/faiss)
[![Tests Passing](https://img.shields.io/badge/Tests-63%2F63%20Passing-brightgreen?style=flat)]()

---

## 🎯 Project Overview

The **National Unified Material Master (NUMM)** is an enterprise AI-driven governance and harmonization platform developed to eliminate duplicate procurement across India's Central Public Sector Enterprises (CPSEs)—including **ONGC, IOCL, GAIL, BPCL, and HPCL**.

By unifying disparate ERP material catalogs into a single **Canonical National Material Code (CNMC)**, NUMM eliminates stockouts, prevents catastrophic plant safety mismatches, unlocks inter-CPSE inventory sharing, and saves hundreds of crores in duplicate capital expenditure.

---

## 📁 Repository Structure

The codebase is organized into 5 dedicated directories:

```text
├── frontend/             # Modern React 18 + Vite 6 + TypeScript + TailwindCSS application
│   ├── src/              # AppShell, 12 interactive screens, layout, components, context
│   ├── public/           # Favicon, assets, and diagrams
│   ├── legacy_vanilla/   # Archived vanilla HTML prototype
│   └── package.json      # Vite build configuration and frontend dependencies
│
├── backend/              # FastAPI high-performance Python backend (:8000)
│   ├── app/              # Routers, services, SQLAlchemy models, physics unit matrix
│   ├── sample_data/      # Catalogs for ONGC, IOCL, GAIL, BPCL (CSV/XLSX)
│   ├── models/           # custom-material-embedder local weights
│   └── tests/            # 63 automated pytest verification tests (100% passing)
│
├── aiml/                 # AI & Deep Learning Intelligence Hub
│   ├── models/           # Domain-trained SentenceTransformer model weights
│   ├── data/             # Contrastive training pairs and FAISS vector index binaries
│   ├── scripts/          # Fine-tuning, active learning loops, and stress test suites
│   ├── checkpoints/      # Model training epoch checkpoints
│   └── training_metrics.json  # Loss curves and Pearson correlation benchmarks
│
├── md/                   # Architecture Specifications & Markdown Documentation
│   ├── flow.md           # Detailed end-to-end execution flow
│   ├── context.md        # Technical specifications & mathematical formulation
│   ├── decision.md       # Architectural Decision Records (ADRs)
│   └── AI_ML_ENHANCEMENT_REQUIREMENTS.md  # Neuro-symbolic pipeline specification
│
├── run.py                # Standalone FastAPI server launcher
├── start-all.bat         # 1-Click launcher (starts Backend + Frontend + opens browser)
├── start-backend.bat     # Launches FastAPI on http://127.0.0.1:8000
├── start-frontend.bat    # Launches Vite on http://127.0.0.1:3000
└── package.json          # Root delegation script (runs npm commands into frontend/)
```

---

## ⚡ Quick Start Instructions

### 1. Launch Everything in 1 Click
Double-click `start-all.bat` on Windows.
- Starts FastAPI Backend on `http://127.0.0.1:8000`
- Starts React + Vite Frontend on `http://127.0.0.1:3000`
- Automatically opens `http://127.0.0.1:3000` in your default browser

### 2. Manual Startup

#### Backend
```bash
# Activate Python environment
.venv\Scripts\activate

# Start backend server
python run.py
# Or: uvicorn app.main:app --app-dir backend --reload --port 8000
```
- API Health Check: `http://127.0.0.1:8000/api/health`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://127.0.0.1:3000`

### 3. Run Automated Tests
```bash
# Run all 63 backend verification tests
python -m pytest backend/tests/
```

---

## 🛡️ The 7-Pillar Neuro-Symbolic Matching Engine

1. **Deterministic Physics Safety Bouncer:** 0.00% false merge rate on safety-critical contradiction cases (pressure class, metallurgy, flange facings).
2. **Category-Conditioned Attribute Extraction:** Normalizes 8 industrial dimensions across irregular procurement abbreviations.
3. **Physics-Aware Unit Conversion:** High-precision SI conversion (inches to mm, PSI to bar, schedule to wall thickness).
4. **Custom Petrochemical Embeddings:** 384-dimensional dense semantic vectors fine-tuned from `all-MiniLM-L6-v2` (Pearson correlation: 0.9676).
5. **Sub-3ms FAISS Vector Search:** Rapid candidate retrieval across hundreds of thousands of material records.
6. **Temperature-Calibrated Match Arbiter:** Computes epistemic uncertainty and routes borderline pairs to human stewards.
7. **Natural Language XAI Justification:** Generates two-sentence engineering rationales citing ASME B16.34, ASME B16.5, API 6D, and NACE MR0175 standards.

---

## 🏛 Supported CPSEs
- **ONGC** (Oil and Natural Gas Corporation)
- **IOCL** (Indian Oil Corporation Limited)
- **GAIL** (Gas Authority of India Limited)
- **BPCL** (Bharat Petroleum Corporation Limited)
- **HPCL** (Hindustan Petroleum Corporation Limited)
