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
    schema_json: str = "{}"  # type: ignore[assignment]


class PipelineRun(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pipeline_name: str
    status: str = "pending"
    started_at: datetime
    ended_at: datetime | None = None
    logs: str = ""


class QualityResult(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    run_id: int
    dataset: str
    passed: bool
    failures: int
    rule: str


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
