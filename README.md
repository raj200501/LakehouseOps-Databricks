# LakehouseOps

LakehouseOps is a local-first Databricks-style lakehouse control plane with medallion pipelines, quality rules, lineage, ML, and a React dashboard.

## Quickstart

```bash
make bootstrap
make seed

# terminal 1: API
make up

# terminal 2: UI
make ui

# terminal 3: Docs preview
make docs
```

Preview URLs:
- UI: http://localhost:5173
- API Swagger: http://localhost:8000/docs
- Docs: http://localhost:8001

Verification:

```bash
make verify
```

Seed users: `admin/admin123`, `analyst/analyst123`

## 2-minute demo
1. Start API (`make up`) and UI (`make ui`).
2. Open dashboard and click **Runs → Run pipeline**.
3. Open Tables to inspect bronze/silver/gold assets.
4. Open Quality to review validation outcomes.
5. Open Lineage for interactive graph.
6. Open Models to see Production model and metrics.

## CI preview artifacts
- Web preview artifact: `web-dist` (built from `apps/web/dist`).
- Docs preview artifact: `docs-site` (built from `mkdocs build --strict` into `site/`).
