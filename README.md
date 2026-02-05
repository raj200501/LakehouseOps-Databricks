# LakehouseOps

LakehouseOps is a local-first Databricks-style lakehouse control plane with medallion pipelines, quality rules, lineage, ML, and a React dashboard.

## Quickstart

```bash
make bootstrap
make seed
# terminal 1
make up
# terminal 2
make ui
make verify
```

- API: http://localhost:8000/docs
- UI: http://localhost:5173
- Seed users: `admin/admin123`, `analyst/analyst123`

## 2-minute demo
1. Start API (`make up`) and UI (`make ui`).
2. Open dashboard and click **Runs → Run pipeline**.
3. Open Tables to inspect bronze/silver/gold assets.
4. Open Quality to review validation outcomes.
5. Open Lineage for interactive graph.
6. Open Models to see Production model and metrics.
