#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  printf '%s\n' 'npm is required to start CA Buddy.' >&2
  exit 1
fi

if [[ ! -d node_modules ]]; then
  npm ci
fi

VITE_BASE_PATH="${VITE_BASE_PATH:-/}" npm run build

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-4173}"

exec npm run preview -- --host "$HOST" --port "$PORT" --strictPort
