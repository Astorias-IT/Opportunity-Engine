# Opportunity Engine

Opportunity Engine is a lightweight job aggregation and tracking system with a FastAPI backend and a modern frontend.

---

## 🚀 Project Overview

Backend: FastAPI (Python)
Frontend: Vite (Node.js)
Database: SQLite (jobs.db)
Purpose: Aggregate, filter, and track job opportunities efficiently

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Astorias-IT/Opportunity-Engine.git
cd Opportunity-Engine
```

---

## ⚡ Quick Start (Recommended)

Run everything with a single command:

```bash
chmod +x run.sh
./run.sh
```

This will automatically:

* Create virtual environment
* Install backend dependencies
* Install frontend dependencies
* Configure environment
* Start backend and frontend

---

## 🧠 Manual Setup (Optional)

### Backend

```bash
cd Opportunity-Engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend URLs:
API: http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:
http://localhost:5173

---

## ⚙️ Environment (Optional)

By default, the frontend connects to:

```
http://localhost:8000
```

To override:

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🧪 How to Use

1. Run the project (`./run.sh` recommended)
2. Open the frontend
3. Click **Run Global Fetch**
4. Browse and manage jobs (apply, reject, filter, track)

---

## 📁 Project Structure

```
Opportunity-Engine/
│
├── app/               # Backend logic (FastAPI)
├── frontend/          # Frontend (Vite)
├── requirements.txt   # Python dependencies
├── run.sh             # One-command runner
├── jobs.db            # SQLite database (auto-created)
├── cli.py             # CLI utilities
└── result/            # Output data (optional)
```

---

## ⚠️ Notes

* Works without `.env` (fallback included)
* Backend must be running (handled automatically by run.sh)
* Database is created automatically
* Do not commit `.venv`, `node_modules`, or `.env`
* If CORS issues appear, verify FastAPI middleware

---

## 🎯 Customization

This project is optimized for roles such as:

Technical Support
IT Support / Helpdesk
Infrastructure / Systems
Entry-level Security

Modify behavior in:

app/services/aggregator.py
app/core/scoring.py

* aggregator.py → scraping logic
* scoring.py → filtering and ranking

You can adapt it for any role (DevOps, Backend, Data, Cloud, etc.)

---

## 🔥 Future Improvements

Deployment (Render, Railway, VPS)
Authentication system
Job tracking improvements
Automation / notifications

---

## 👨‍💻 Author

Abel Tana

---

## 📄 License

This project is for personal and educational use.
