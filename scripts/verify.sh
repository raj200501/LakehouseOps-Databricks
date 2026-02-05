#!/usr/bin/env bash
set -euo pipefail
ruff check .
mypy apps/api packages tests
pytest
(cd apps/web && npm run lint && npm run typecheck && npm run test && npm run build)
python scripts/loc_check.py
