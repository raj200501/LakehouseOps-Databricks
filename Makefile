PYTHON ?= python3.11
VENV_DIR ?= .venv
VENV_PY := $(VENV_DIR)/bin/python
VENV_PIP := $(VENV_PY) -m pip
PYTHONPATH_DEV := apps/api:packages/common/src:packages/ml/src:packages/quality/src:packages/lineage/src:packages/lakehouse/src

.venv:
	@python3.11 -V >/dev/null 2>&1 || (echo "Error: python3.11 is required to create .venv. Install python3.11 and ensure it is available on PATH." && exit 1)
	python3.11 -m venv $(VENV_DIR)
	$(VENV_PIP) install --upgrade pip

bootstrap: .venv
	$(VENV_PIP) install -e .[dev]
	cd apps/web && npm install --no-audit --no-fund

up:
	PYTHONPATH=$(PYTHONPATH_DEV):$${PYTHONPATH:-} $(VENV_PY) -m uvicorn app.main:app --app-dir apps/api --host 0.0.0.0 --port 8000

ui:
	@if [ ! -d apps/web/node_modules ]; then \
		echo "apps/web/node_modules not found; running npm install..."; \
		cd apps/web && npm install --no-audit --no-fund; \
	fi
	cd apps/web && npm run dev -- --host 0.0.0.0 --port 5173

docs:
	mkdocs serve -a 0.0.0.0:8001

docs-build:
	mkdocs build --strict

seed:
	PYTHONPATH=$(PYTHONPATH_DEV):$${PYTHONPATH:-} $(VENV_PY) scripts/seed.py

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
