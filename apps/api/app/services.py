from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from sqlmodel import Session

from app.models import Dataset, LineageEdge, ModelRecord, PipelineRun, QualityResult
from pipeline import Asset, PipelineEngine
from lineage_graph import LineageGraph
from ml_service import MLService
from quality_engine import evaluate_rules, profile_dataframe


def run_demo_pipeline(session: Session, pipeline_name: str) -> PipelineRun:
    run = PipelineRun(pipeline_name=pipeline_name, status="running", started_at=datetime.now(timezone.utc))
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
    results = evaluate_rules(silver_df, [{"type": "not_null", "column": "id"}, {"type": "range", "column": "amount", "min": 0, "max": 1000}])
    for item in results:
        session.add(QualityResult(run_id=run.id or 0, dataset="customers_clean", passed=item.passed, failures=item.failures, rule=item.rule))

    profile = profile_dataframe(silver_df)
    run.logs = f"completed assets={completed}; profile_rows={profile['rows']}"

    for layer, name in [("bronze", "customers"), ("silver", "customers_clean"), ("gold", "customer_features")]:
        session.add(Dataset(name=name, layer=layer, path=f"data/{layer}/{name}.parquet"))

    session.add(LineageEdge(source="customers", target="customers_clean", label="filter"))
    session.add(LineageEdge(source="customers_clean", target="customer_features", label="feature_eng"))

    gold_df = pd.read_parquet("data/gold/customer_features.parquet")
    trainer = MLService()
    train_result = trainer.train(gold_df[["id", "amount", "amount_bucket", "label"]], target="label")
    session.add(ModelRecord(name="churn_baseline", stage="Production", accuracy=train_result.accuracy, path=train_result.model_path))

    run.status = "succeeded"
    run.ended_at = datetime.now(timezone.utc)
    session.add(run)
    session.commit()
    session.refresh(run)
    return run


def build_lineage_graph(session: Session) -> dict:
    graph = LineageGraph()
    for ds in session.query(Dataset).all():
        graph.add_node(ds.name, "dataset", f"{ds.layer}:{ds.name}")
    for edge in session.query(LineageEdge).all():
        graph.add_edge(edge.source, edge.target, edge.label)
    return graph.to_cytoscape()
