#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_DIR="$PROJECT_ROOT/.venv"

echo "🚀 Starting Opportunity Engine..."

# Check dependencies
if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 is not installed"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is not installed"
  exit 1
fi

# Create venv if not exists
if [ ! -d "$VENV_DIR" ]; then
  echo "📦 Creating virtual environment..."
  python3 -m venv "$VENV_DIR"
fi

# Activate venv
echo "⚙️ Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Install backend deps
echo "📦 Installing backend dependencies..."
pip install -r "$BACKEND_DIR/requirements.txt"

# Ensure frontend exists
if [ ! -f "$FRONTEND_DIR/package.json" ]; then
  echo "❌ frontend/package.json not found"
  exit 1
fi

# Create .env if missing
if [ ! -f "$FRONTEND_DIR/.env" ]; then
  echo "⚙️ Creating frontend .env..."
  echo "VITE_API_BASE_URL=http://localhost:8000" > "$FRONTEND_DIR/.env"
fi

# Install frontend deps
echo "📦 Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install

cd "$BACKEND_DIR"

# Cleanup function
cleanup() {
  echo ""
  echo "🛑 Stopping services..."
  if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Start backend
echo "🧠 Starting backend at http://localhost:8000 ..."
"$VENV_DIR/bin/uvicorn" app.main:app --reload &
BACKEND_PID=$!

sleep 3

# Start frontend
echo "🎨 Starting frontend at http://localhost:5173 ..."
cd "$FRONTEND_DIR"
npm run dev
