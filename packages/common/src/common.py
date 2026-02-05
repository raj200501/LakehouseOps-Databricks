from __future__ import annotations

import logging
import os
from collections.abc import Iterable
from dataclasses import dataclass
from datetime import datetime, timezone
from functools import lru_cache


@dataclass
class Settings:
    app_name: str = "LakehouseOps"
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./lakehouseops.db")
    jwt_secret: str = os.getenv("JWT_SECRET", "lakehouseops-dev-secret")
    data_root: str = os.getenv("DATA_ROOT", "./data")
    mlflow_uri: str = os.getenv("MLFLOW_TRACKING_URI", "file:./data/mlruns")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def init_logging() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


def paginate(items: Iterable[object], offset: int = 0, limit: int = 50) -> list[object]:
    chunk = list(items)
    return chunk[offset : offset + limit]
