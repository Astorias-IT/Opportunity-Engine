Opportunity Engine

Opportunity Engine is a full-stack job aggregation and tracking system designed to collect, score, and manage job opportunities in a structured pipeline.

🚀 Project Overview
Backend: FastAPI (Python)
Frontend: Vite (Node.js + TypeScript)
Database: SQLite (jobs.db)
Purpose: Aggregate, score, filter, and track job opportunities efficiently

🔥 Features
Multi-source job scraping
Intelligent scoring system (role-based filtering)
Job pipeline tracking (new, applied, rejected, etc.)
Real-time dashboard (FastAPI + Vite)
SQLite persistence
Clean and modern UI

📦 Installation & Setup
1. Clone the Repository
git clone git@github.com:Astorias-IT/Opportunity-Engine.git
cd Opportunity-Engine

🧠 Backend Setup (FastAPI)
Create Virtual Environment
python3 -m venv .venv
Activate Environment
source .venv/bin/activate
Install Dependencies
pip install -r requirements.txt
Run Backend
uvicorn app.main:app --reload
Backend URLs
API: http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs

🎨 Frontend Setup (Vite)

Open a new terminal:

cd frontend
Install Dependencies
npm install
Run Frontend
npm run dev
Frontend URL
http://localhost:5173

🌐 Environment Variables

Create a .env file inside the frontend folder:

VITE_API_BASE_URL=http://127.0.0.1:8000

📡 API Endpoints
Method	Endpoint	Description
GET	/jobs	Retrieve jobs
POST	/fetch	Scrape and update jobs
POST	/jobs/{id}/apply	Mark job as applied
POST	/jobs/{id}/reject	Mark job as rejected
GET	/fetch-runs	Retrieve fetch history

🧪 How to Use
Start the backend
Start the frontend
Open http://localhost:5173
Click "Run Global Fetch"
Track and manage job opportunities

⚙️ Requirements

Make sure you have installed:

Python 3.x
pip
Node.js
npm
git
📁 Project Structure
Opportunity-Engine/
│
├── app/               # Backend logic (FastAPI)
│   ├── core/          # Scoring logic
│   ├── db/            # Database layer
│   ├── services/      # Scrapers / aggregators
│   └── main.py        # API entry point
│
├── frontend/          # Frontend (Vite)
│   ├── src/
│   └── index.html
│
├── requirements.txt   # Python dependencies
├── jobs.db            # SQLite database
├── cli.py             # CLI utilities
└── result/            # Output data (if used)

⚠️ Notes
Do not commit .venv, node_modules, or .env files
Ensure backend is running before using frontend
Restart frontend if .env changes
CORS is already configured in FastAPI for local development

🔥 Future Improvements
Production deployment (single origin backend + frontend)
Authentication system
Advanced job filtering and tagging
Notifications / automation
AI-assisted scoring improvements
👨‍💻 Author

Abel Tana

📄 License

This project is for personal and educational use.
