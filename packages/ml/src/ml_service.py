from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split


@dataclass
class TrainResult:
    model_path: str
    accuracy: float


class MLService:
    def __init__(self, model_dir: str = "data/models") -> None:
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)

    def train(self, df: pd.DataFrame, target: str) -> TrainResult:
        x = df.drop(columns=[target])
        y = df[target]
        x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)
        model = RandomForestClassifier(n_estimators=30, random_state=42)
        model.fit(x_train, y_train)
        score = accuracy_score(y_test, model.predict(x_test))
        path = self.model_dir / "production.joblib"
        joblib.dump(model, path)
        return TrainResult(model_path=str(path), accuracy=float(score))

    def predict(self, rows: list[dict[str, Any]]) -> list[float]:
        model = joblib.load(self.model_dir / "production.joblib")
        df = pd.DataFrame(rows)
        return [float(v) for v in model.predict_proba(df)[:, 1]]
