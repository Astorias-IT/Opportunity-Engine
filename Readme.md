# Opportunity Engine

Opportunity Engine is a lightweight job aggregation and tracking system with a FastAPI backend, modern frontend, and Docker-based deployment.

---

## 🚀 Project Overview

* **Backend:** FastAPI (Python)
* **Frontend:** Vite (Node.js)
* **Reverse Proxy:** Nginx
* **Database:** SQLite (`jobs.db`)
* **Deployment:** Docker + Docker Compose

**Purpose:** Aggregate, filter, and track job opportunities efficiently.

---

## 📋 Requirements

To run this project you only need:

* Docker
* Docker Compose

Installation:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update

sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```


                                                          Next: 
```bash

sudo systemctl enable docker.socket

sudo systemctl start docker.socket

sudo systemctl enable docker.service

sudo systemctl start docker.service

```

## ⚡ Quick Start (Docker - Recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/Astorias-IT/Opportunity-Engine.git
cd Opportunity-Engine
```

### 2. Run the Application

```bash
docker compose up --build -d
```

### 3. Open in Browser

```
http://localhost
```

---

## 🛑 Stop the Application

```bash
docker compose down
```

---

## 🔍 Useful Commands

Check running containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Rebuild only backend:

```bash
docker compose build backend
```

Clean environment (simulate fresh machine):

```bash
docker compose down
docker system prune -f
docker compose up --build -d
```

---

## 🧠 How It Works

* Frontend is built inside Docker
* Nginx serves the frontend and proxies API requests
* Backend runs FastAPI on port `8000`
* SQLite database is persisted via volume

---

## 🧪 Healthcheck

The backend exposes:

```
http://localhost:8000/health
```

Docker automatically checks this endpoint to ensure the service is running correctly.

---

## 📁 Project Structure

```
Opportunity-Engine/
│
├── app/               # Backend (FastAPI)
├── frontend/          # Frontend source (Vite)
├── nginx/             # Nginx config + Dockerfile
│
├── Dockerfile         # Backend Dockerfile
├── docker-compose.yml # Orchestration
├── requirements.txt   # Python dependencies
├── jobs.db            # SQLite DB (auto-created)
│
└── .dockerignore
```

---

## ⚙️ Local Development (Optional)

### Backend (without Docker)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (without Docker)

```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 Customization

This project is optimized for roles such as:

* Technical Support
* IT Support / Helpdesk
* Infrastructure / Systems
* Entry-level Security

Modify behavior in:

```
app/services/aggregator.py
app/core/scoring.py
```

* `aggregator.py` → scraping logic
* `scoring.py` → filtering and ranking

---

## 🧹 Notes

* No need for `node_modules`, `.venv`, or `frontend/dist`
* Everything is built inside Docker
* Database is created automatically
* Fully portable across environments

---

## ⚠️ Troubleshooting

If something doesn’t work:

* Rebuild everything:

```bash
docker compose up --build -d
```

* Check logs:

```bash
docker compose logs -f
```

* Verify backend health:

```
http://localhost:8000/health
```

---

## 🔥 Future Improvements

* VPS / Cloud deployment
* Authentication system
* Job tracking enhancements
* Notifications / automation

---

## 👨‍💻 Author

Abel Tana

---

## 📄 License

This project is for personal and educational use.
