#!/usr/bin/env bash
set -euo pipefail

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required dependency: $1"
    echo "Run: make bootstrap"
    exit 1
  fi
}

require_cmd ruff
require_cmd mypy
require_cmd pytest
require_cmd npm
require_cmd mkdocs

ruff check .
mypy --config-file mypy.ini apps/api packages tests
pytest
(
  cd apps/web
  npm run lint
  npm run typecheck
  npm run test
  npm run build
)
mkdocs build --strict
python scripts/loc_check.py
