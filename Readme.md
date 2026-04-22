# Role Harbor

Role Harbor is a lightweight job aggregation and tracking system with a FastAPI backend, modern frontend, and Docker-based deployment.

---

## 🚀 Project Overview

- Backend: FastAPI (Python)  
- Frontend: Vite (Node.js)  
- Reverse Proxy: Nginx  
- Database: SQLite (data/jobs.db)  
- Deployment: Docker + Docker Compose  

Purpose: Aggregate, filter, and track job opportunities efficiently.

---

## 📋 Requirements

To run this project you only need:

- Docker Engine  
- Docker Compose (v2)  

---

## 🐳 Install Docker (Ubuntu)

bash sudo apt update sudo apt install -y ca-certificates curl gnupg  sudo install -m 0755 -d /etc/apt/keyrings  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \ sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg  sudo chmod a+r /etc/apt/keyrings/docker.gpg  echo \ "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \ https://download.docker.com/linux/ubuntu \ $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \ sudo tee /etc/apt/sources.list.d/docker.list > /dev/null  sudo apt update  sudo apt install -y docker-ce docker-ce-cli containerd.io \ docker-buildx-plugin docker-compose-plugin  sudo systemctl enable docker.socket sudo systemctl start docker.socket  sudo systemctl enable docker.service sudo systemctl start docker.service  sudo usermod -aG docker $USER newgrp docker 

---

## ⚡ Quick Start (Docker - Recommended)

### 1. Clone the Repository

bash git clone https://github.com/AbelT-IT/Role-Harbor cd Role-Harbor 

### 2. Run the Application

bash docker compose up --build -d 

### 3. Verify Containers

bash docker compose ps docker compose logs -f 

### 4. Open in Browser

http://localhost

---

## 🛑 Stop the Application

bash docker compose down 

---

## 🔍 Useful Commands

Check running containers:

bash docker compose ps 

View logs:

bash docker compose logs -f 

Rebuild backend only:

bash docker compose build backend 

Clean environment (simulate fresh machine):

bash docker compose down docker system prune -f docker compose up --build -d 

---

## 🧠 How It Works

- Nginx serves the frontend (static files)  
- Nginx proxies API requests to the backend via /api  
- Backend runs FastAPI on port 8000  
- SQLite database persists on the host via data/jobs.db  
- Docker Compose orchestrates backend and Nginx services  

---

## 🌐 API Routing

The frontend communicates with the backend using relative paths under /api.

Nginx acts as a reverse proxy:

- / → frontend  
- /api/* → backend  

This ensures the app works correctly in:

- localhost  
- LAN environments  
- Tailscale  
- production domains  

No hardcoded URLs (like localhost:8000) are used.

---

## 🧪 Health Endpoint

text http://localhost:8000/health 

---

## 📁 Project Structure

Role-Harbor/ │ ├── app/               # Backend (FastAPI) ├── frontend/          # Frontend source (Vite) ├── nginx/             # Nginx config ├── data/              # Persistent data directory │   └── jobs.db        # SQLite DB (auto-created) │ ├── Dockerfile         # Backend image ├── docker-compose.yml # Orchestration ├── requirements.txt   # Python dependencies │ └── .dockerignore

---

## ⚙️ Local Development (Optional)

### Backend (without Docker)

bash python3 -m venv .venv source .venv/bin/activate pip install -r requirements.txt uvicorn app.main:app --reload 

### Frontend (without Docker)

bash cd frontend npm install npm run dev 

---

## 🎯 Customization

Modify behavior in:

app/services/aggregator.py app/core/scoring.py

- aggregator.py → scraping logic  
- scoring.py → filtering and ranking  

---

## 🧹 Notes

- Database is created automatically at data/jobs.db  
- The data/ directory is mounted as a Docker volume  
- Data persists between restarts  
- To fully reset the data, delete data/jobs.db  
- Do NOT commit the data/ directory  
- Docker Compose uses docker compose (v2), not docker-compose  

---

## ⚠️ Persistence

The application uses a bind-mounted directory:

text ./data → /app/data 

This avoids fragile file-based mounts and ensures portability across environments.

---

## ⚠️ Troubleshooting

Rebuild everything:

bash docker compose up --build -d 

Check logs:

bash docker compose logs -f 

Verify backend:

text http://localhost:8000/health 

---

## 🔥 Future Improvements

- VPS / Cloud deployment  
- Authentication system  
- Job tracking enhancements  
- Notifications / automation  

---

## 👨‍💻 Author

Abel Tana  

---

## 📄 License

This project is for personal and educational
