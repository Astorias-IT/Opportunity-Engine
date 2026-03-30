#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_DIR="$PROJECT_ROOT/.venv"
BACKEND_PORT=8000
FRONTEND_PORT=5173

echo "Starting Opportunity Engine..."

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 is not installed."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed."
  exit 1
fi

if ! command -v lsof >/dev/null 2>&1; then
  echo "Error: lsof is not installed."
  exit 1
fi

if [ ! -d "$VENV_DIR" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv "$VENV_DIR"
fi

echo "Activating virtual environment..."
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

echo "Installing backend dependencies..."
pip install -r "$BACKEND_DIR/requirements.txt"

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
  echo "Error: frontend/package.json not found."
  exit 1
fi

if [ ! -f "$FRONTEND_DIR/.env" ]; then
  echo "Creating frontend/.env from default local backend..."
  printf 'VITE_API_BASE_URL=http://localhost:8000\n' > "$FRONTEND_DIR/.env"
fi

echo "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install

cd "$BACKEND_DIR"

kill_port() {
  local port="$1"
  local pids

  pids=$(lsof -ti :"$port" || true)

  if [ -n "$pids" ]; then
    echo "Port $port is in use. Stopping existing process(es): $pids"
    kill $pids 2>/dev/null || true
    sleep 2

    pids=$(lsof -ti :"$port" || true)
    if [ -n "$pids" ]; then
      echo "Force killing process(es) on port $port: $pids"
      kill -9 $pids 2>/dev/null || true
      sleep 1
    fi
  fi
}

cleanup() {
  echo
  echo "Stopping services..."

  if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

kill_port "$BACKEND_PORT"
kill_port "$FRONTEND_PORT"

echo "Starting backend on http://localhost:$BACKEND_PORT ..."
"$VENV_DIR/bin/uvicorn" app.main:app --reload --host 0.0.0.0 --port "$BACKEND_PORT" &
BACKEND_PID=$!

sleep 3

echo "Starting frontend on http://localhost:$FRONTEND_PORT ..."
cd "$FRONTEND_DIR"
npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT"
