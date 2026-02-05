PYTHON ?= python
PIP ?= pip

bootstrap:
	$(PIP) install -e .[dev]
	cd apps/web && npm install --no-audit --no-fund

up:
	uvicorn app.main:app --app-dir apps/api --host 0.0.0.0 --port 8000

ui:
	cd apps/web && npm run dev -- --host 0.0.0.0 --port 5173

docs:
	mkdocs serve -a 0.0.0.0:8001

docs-build:
	mkdocs build --strict

seed:
	$(PYTHON) scripts/seed.py

lint:
	ruff check .
	cd apps/web && npm run lint

typecheck:
	mypy --config-file mypy.ini apps/api packages tests
	cd apps/web && npm run typecheck

test:
	pytest
	cd apps/web && npm run test

build-ui:
	cd apps/web && npm run build

verify:
	bash scripts/verify.sh

down:
	pkill -f uvicorn || true
	pkill -f vite || true
