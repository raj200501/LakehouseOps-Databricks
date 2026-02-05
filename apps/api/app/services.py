from __future__ import annotations

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
from lineage_graph import LineageGraph
from ml_service import MLService
from pipeline import Asset, PipelineEngine
from quality_engine import evaluate_rules, profile_dataframe
from sqlmodel import Session, delete, select

from app.models import Dataset, LineageEdge, ModelRecord, PipelineRun, QualityResult

RULES = ["not_null_id", "amount_range", "email_format", "pk_unique"]


def run_demo_pipeline(session: Session, pipeline_name: str) -> PipelineRun:
    now = datetime.utcnow()
    run = PipelineRun(
        pipeline_name=pipeline_name,
        status="running",
        started_at=now,
        cost_estimate=round(random.uniform(2.5, 12.4), 2),
    )
    session.add(run)
    session.commit()
    session.refresh(run)

    raw_path = Path("data/raw/customers.csv")
    raw_path.parent.mkdir(parents=True, exist_ok=True)
    if not raw_path.exists():
        pd.DataFrame(
            [{"id": i, "name": f"cust_{i}", "amount": i * 10, "label": i % 2} for i in range(1, 21)]
        ).to_csv(raw_path, index=False)

    engine = PipelineEngine("data")
    engine.register(Asset(name="customers", layer="bronze", source_path=str(raw_path)))
    engine.register(
        Asset(
            name="customers_clean",
            layer="silver",
            depends_on=["customers"],
            transform=lambda df: df[df["amount"] > 20],
        )
    )
    engine.register(
        Asset(
            name="customer_features",
            layer="gold",
            depends_on=["customers_clean"],
            transform=lambda df: df.assign(amount_bucket=(df["amount"] / 10).astype(int)),
        )
    )
    completed = engine.run()

    silver_df = pd.read_parquet("data/silver/customers_clean.parquet")
    results = evaluate_rules(
        silver_df,
        [
            {"type": "not_null", "column": "id"},
            {"type": "range", "column": "amount", "min": 0, "max": 1000},
        ],
    )
    for item in results:
        session.add(
            QualityResult(
                run_id=run.id or 0,
                dataset="customers_clean",
                passed=item.passed,
                failures=item.failures,
                rule=item.rule,
                failing_rows_json=json.dumps([{"id": 21, "amount": -5}])
                if not item.passed
                else "[]",
            )
        )

    profile = profile_dataframe(silver_df)
    run.logs = f"completed assets={completed}; profile_rows={profile['rows']}"
    run.steps_json = json.dumps(
        [
            {"name": "ingest", "status": "completed"},
            {"name": "quality", "status": "completed"},
            {"name": "train", "status": "completed"},
        ]
    )
    run.artifacts_json = json.dumps(
        ["customers_clean.parquet", "customer_features.parquet", "model.pkl"]
    )

    for layer, name in [
        ("bronze", "customers"),
        ("silver", "customers_clean"),
        ("gold", "customer_features"),
    ]:
        session.add(
            Dataset(
                name=name,
                layer=layer,
                path=f"data/{layer}/{name}.parquet",
                row_count=len(silver_df),
                owner="lakehouse-team",
                schema_json=json.dumps({"columns": list(silver_df.columns)}),
            )
        )

    session.add(LineageEdge(source="customers", target="customers_clean", label="filter"))
    session.add(
        LineageEdge(source="customers_clean", target="customer_features", label="feature_eng")
    )

    gold_df = pd.read_parquet("data/gold/customer_features.parquet")
    trainer = MLService()
    train_result = trainer.train(
        gold_df[["id", "amount", "amount_bucket", "label"]], target="label"
    )
    session.add(
        ModelRecord(
            name="churn_baseline",
            stage="Production",
            accuracy=train_result.accuracy,
            path=train_result.model_path,
            drift_score=round(random.uniform(0.08, 0.22), 3),
            history_json=json.dumps(
                [
                    {
                        "ts": (now - timedelta(days=d)).isoformat(),
                        "accuracy": round(0.8 + random.random() * 0.15, 3),
                    }
                    for d in range(6, -1, -1)
                ]
            ),
        )
    )

    run.status = "succeeded"
    run.ended_at = datetime.utcnow()
    run.duration_ms = int((run.ended_at - run.started_at).total_seconds() * 1000)
    session.add(run)
    session.commit()
    session.refresh(run)
    return run


def seed_demo_data(session: Session) -> dict[str, int]:
    reset_demo_data(session)
    now = datetime.utcnow()

    layers = ["bronze", "silver", "gold"]
    for i in range(12):
        layer = layers[i % 3]
        name = f"{layer}_table_{i + 1}"
        session.add(
            Dataset(
                name=name,
                layer=layer,
                path=f"s3://demo/{layer}/{name}",
                owner=random.choice(["data-eng", "ml-platform", "analyst-team"]),
                row_count=random.randint(5_000, 3_000_000),
                updated_at=now - timedelta(hours=random.randint(1, 96)),
                schema_drift=(i % 5 == 0),
                schema_json=json.dumps(
                    {"columns": ["id", "event_ts", "country", "amount", "label"]}
                ),
            )
        )

    statuses = ["succeeded", "failed", "running"]
    for i in range(30):
        start = now - timedelta(hours=i * 9)
        status = statuses[0] if i % 5 else random.choice(statuses)
        duration = random.randint(40_000, 220_000)
        ended = start + timedelta(milliseconds=duration) if status != "running" else None
        run = PipelineRun(
            pipeline_name=random.choice(["daily_etl", "feature_refresh", "churn_training"]),
            status=status,
            started_at=start,
            ended_at=ended,
            duration_ms=duration,
            cost_estimate=round(random.uniform(1.2, 20.4), 2),
            logs=f"Run {i} executed in demo mode.",
            steps_json=json.dumps(
                [
                    {"name": "extract", "status": "completed"},
                    {
                        "name": "transform",
                        "status": "failed" if status == "failed" else "completed",
                    },
                    {
                        "name": "publish",
                        "status": "pending" if status == "running" else "completed",
                    },
                ]
            ),
            artifacts_json=json.dumps(["metrics.json", "dq_report.json", "lineage.json"]),
        )
        session.add(run)
        session.flush()
        for rule in RULES:
            passed = random.random() > 0.18
            failures = 0 if passed else random.randint(3, 200)
            session.add(
                QualityResult(
                    run_id=run.id or 0,
                    dataset=random.choice(["silver_table_2", "gold_table_3", "gold_table_9"]),
                    passed=passed,
                    failures=failures,
                    rule=rule,
                    failing_rows_json="[]"
                    if passed
                    else json.dumps([{"id": random.randint(100, 999), "rule": rule}]),
                )
            )

    nodes = (
        [f"bronze_table_{i}" for i in range(1, 5)]
        + [f"silver_table_{i}" for i in range(1, 5)]
        + [f"gold_table_{i}" for i in range(1, 5)]
        + ["model_churn_v1", "model_churn_v2"]
    )
    for i in range(len(nodes) - 1):
        session.add(
            LineageEdge(
                source=nodes[i],
                target=nodes[i + 1],
                label=random.choice(["transform", "aggregate", "train"]),
            )
        )

    for m in ["churn_xgb", "ltv_forecast", "fraud_detector"]:
        history = []
        for d in range(10, -1, -1):
            history.append(
                {
                    "ts": (now - timedelta(days=d)).isoformat(),
                    "accuracy": round(0.77 + random.random() * 0.2, 3),
                    "drift": round(random.uniform(0.05, 0.28), 3),
                }
            )
        session.add(
            ModelRecord(
                name=m,
                stage=random.choice(["Staging", "Production"]),
                accuracy=history[-1]["accuracy"],
                path=f"models://{m}",
                drift_score=history[-1]["drift"],
                last_trained_at=now - timedelta(days=random.randint(1, 8)),
                history_json=json.dumps(history),
            )
        )

    session.commit()
    return {"runs": 30, "datasets": 12, "models": 3}


def reset_demo_data(session: Session) -> None:
    for model in (QualityResult, LineageEdge, ModelRecord, PipelineRun, Dataset):
        session.execute(delete(model))
    session.commit()


def build_overview_metrics(session: Session) -> dict:
    runs = list(session.exec(select(PipelineRun).order_by(PipelineRun.started_at.desc())).all())
    quality = list(session.exec(select(QualityResult)).all())
    models = list(session.exec(select(ModelRecord)).all())
    success_count = len([r for r in runs if r.status == "succeeded"])
    success_rate = (success_count / len(runs) * 100) if runs else 0.0
    avg_duration = sum(r.duration_ms for r in runs) / len(runs) if runs else 0
    pass_rate = (len([q for q in quality if q.passed]) / len(quality) * 100) if quality else 0.0
    total_cost = sum(r.cost_estimate for r in runs[-8:]) if runs else 0.0
    drift = (sum(m.drift_score for m in models) / len(models)) if models else 0.0

    return {
        "kpis": {
            "runs_24h": len(
                [r for r in runs if (datetime.utcnow() - r.started_at).total_seconds() < 86400]
            ),
            "success_rate": round(success_rate, 1),
            "avg_duration_ms": int(avg_duration),
            "quality_pass_rate": round(pass_rate, 1),
            "cost_estimate": round(total_cost, 2),
            "drift_score": round(drift, 3),
        },
        "runs_series": [
            {"label": f"D-{i}", "runs": random.randint(3, 11)} for i in range(13, -1, -1)
        ],
        "quality_failures_series": [
            {"label": f"D-{i}", "failures": random.randint(0, 25)} for i in range(13, -1, -1)
        ],
    }


def build_lineage_graph(session: Session) -> dict:
    graph = LineageGraph()
    for ds in session.exec(select(Dataset)).all():
        graph.add_node(ds.name, "dataset", f"{ds.layer}:{ds.name}")
    for model in session.exec(select(ModelRecord)).all():
        graph.add_node(model.name, "model", model.stage)
    for edge in session.exec(select(LineageEdge)).all():
        graph.add_edge(edge.source, edge.target, edge.label)
    return graph.to_cytoscape()


def promote_model(session: Session, model_id: int) -> ModelRecord | None:
    model = session.get(ModelRecord, model_id)
    if not model:
        return None
    model.stage = "Production"
    session.add(model)
    session.commit()
    session.refresh(model)
    return model
