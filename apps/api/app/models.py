from __future__ import annotations

from datetime import datetime

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str
    password_hash: str
    role: str = "viewer"


class Dataset(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    layer: str
    path: str
    owner: str = "data-platform"
    row_count: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    schema_json: str = "{}"  # type: ignore[assignment]
    schema_drift: bool = False


class PipelineRun(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pipeline_name: str
    status: str = "pending"
    started_at: datetime
    ended_at: datetime | None = None
    duration_ms: int = 0
    cost_estimate: float = 0.0
    logs: str = ""
    steps_json: str = "[]"  # type: ignore[assignment]
    artifacts_json: str = "[]"  # type: ignore[assignment]


class QualityResult(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    run_id: int
    dataset: str
    passed: bool
    failures: int
    rule: str
    failing_rows_json: str = "[]"  # type: ignore[assignment]


class LineageEdge(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    source: str
    target: str
    label: str


class ModelRecord(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    stage: str = "Staging"
    accuracy: float = 0.0
    path: str
    last_trained_at: datetime = Field(default_factory=datetime.utcnow)
    drift_score: float = 0.0
    history_json: str = "[]"  # type: ignore[assignment]
