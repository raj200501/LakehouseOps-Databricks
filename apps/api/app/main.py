from __future__ import annotations

from common import init_logging
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ml_service import MLService
from sqlmodel import Session, select

from app.db import get_session, init_db
from app.models import Dataset, ModelRecord, PipelineRun, QualityResult, User
from app.schemas import LoginRequest, PredictRequest, RunRequest, TokenResponse
from app.security import authenticate, create_token, hash_password
from app.services import build_lineage_graph, run_demo_pipeline

init_logging()
app = FastAPI(title="LakehouseOps API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def startup() -> None:
    init_db()
    with next(get_session()) as session:
        if not session.exec(select(User).where(User.username == "admin")).first():
            session.add(
                User(username="admin", password_hash=hash_password("admin123"), role="admin")
            )
            session.add(
                User(
                    username="analyst",
                    password_hash=hash_password("analyst123"),
                    role="analyst",
                )
            )
            session.commit()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, session: Session = Depends(get_session)) -> TokenResponse:
    user = authenticate(session, req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="invalid_credentials")
    return TokenResponse(access_token=create_token(user.username, user.role))


@app.post("/runs")
def run_pipeline(req: RunRequest, session: Session = Depends(get_session)) -> PipelineRun:
    return run_demo_pipeline(session, req.pipeline_name)


@app.get("/runs")
def list_runs(session: Session = Depends(get_session)) -> list[PipelineRun]:
    return list(session.exec(select(PipelineRun).order_by(PipelineRun.id.desc())).all())


@app.get("/datasets")
def list_datasets(session: Session = Depends(get_session)) -> list[Dataset]:
    return list(session.exec(select(Dataset)).all())


@app.get("/quality")
def quality(session: Session = Depends(get_session)) -> list[QualityResult]:
    return list(session.exec(select(QualityResult)).all())


@app.get("/lineage")
def lineage(session: Session = Depends(get_session)) -> dict:
    return build_lineage_graph(session)


@app.get("/models")
def models(session: Session = Depends(get_session)) -> list[ModelRecord]:
    return list(session.exec(select(ModelRecord)).all())


@app.post("/predict")
def predict(req: PredictRequest) -> dict[str, list[float]]:
    scores = MLService().predict(req.rows)
    return {"scores": scores}
