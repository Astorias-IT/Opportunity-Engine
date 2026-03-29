# Opportunity Engine

Opportunity Engine is a lightweight job aggregation and tracking system with a FastAPI backend and a modern frontend.

---

## 🚀 Project Overview

* **Backend:** FastAPI (Python)
* **Frontend:** Vite (Node.js)
* **Database:** SQLite (`jobs.db`)
* **Purpose:** Aggregate, filter, and track job opportunities efficiently

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone git@github.com:Astorias-IT/Opportunity-Engine.git
cd Opportunity-Engine
```

---

## 🧠 Backend Setup (FastAPI)

### Create Virtual Environment

```bash
python3 -m venv .venv
```

### Activate Environment

```bash
source .venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Backend

```bash
uvicorn app.main:app --reload
```

### Backend URLs

* API: http://127.0.0.1:8000
* Docs: http://127.0.0.1:8000/docs

---

## 🎨 Frontend Setup (Vite)

Open a new terminal:

```bash
cd frontend
```

### Install Dependencies

```bash
pnpm install
```

If `pnpm` is not installed:

```bash
npm install -g pnpm
pnpm install
```

### Run Frontend

```bash
pnpm run dev
```

### Frontend URL

* http://localhost:5173

---

## 🧪 How to Use

1. Start the backend
2. Start the frontend
3. Open the frontend URL in your browser
4. The frontend will communicate with the backend automatically

---

## ⚙️ Requirements

Make sure you have installed:

* Python 3.x
* pip
* Node.js
* npm
* pnpm
* git

---

## 📁 Project Structure

```
Opportunity-Engine/
│
├── app/               # Backend logic (FastAPI)
├── frontend/          # Frontend (Vite)
├── requirements.txt   # Python dependencies
├── jobs.db            # SQLite database
├── cli.py             # CLI utilities
└── result/            # Output data (if used)
```

---

## ⚠️ Notes

This project is optimized for a specific job search profile, currently focused on roles such as:
Technical Support
IT Support / Helpdesk
Infrastructure / Systems
Entry-level Security

The search keywords and filtering logic can be modified in:

app/services/aggregator.py
app/core/scoring.py
aggregator.py → controls where and how jobs are scraped
scoring.py → controls which roles are prioritized, filtered, or rejected
By adjusting these files, you can fully customize the engine for any role (e.g. DevOps, Data, Backend, etc.)
Do not commit .venv, node_modules, or .env files
Ensure backend is running before using frontend
If CORS issues appear, configure FastAPI middleware accordingly

---

## 🔥 Future Improvements

* Deployment (Render, Railway, VPS)
* Authentication system
* Job application tracking UI
* Notifications / automation

---

## 👨‍💻 Author

Abel Tana

---

## 📄 License

This project is for personal and educational use.
