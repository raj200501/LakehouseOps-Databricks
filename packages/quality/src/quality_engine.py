from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

import pandas as pd


@dataclass
class RuleResult:
    rule: str
    passed: bool
    failures: int


def evaluate_rules(df: pd.DataFrame, rules: list[dict[str, Any]]) -> list[RuleResult]:
    results: list[RuleResult] = []
    for rule in rules:
        kind = rule["type"]
        column = rule["column"]
        if kind == "not_null":
            failures = int(df[column].isna().sum())
        elif kind == "unique":
            failures = int(df[column].duplicated().sum())
        elif kind == "range":
            failures = int(((df[column] < rule["min"]) | (df[column] > rule["max"])).sum())
        elif kind == "regex":
            pattern = re.compile(rule["pattern"])
            matches = df[column].fillna("").astype(str).map(pattern.match).astype(bool)
            failures = int((~matches).sum())
        else:
            failures = 0
        results.append(RuleResult(rule=kind, passed=failures == 0, failures=failures))
    return results


def profile_dataframe(df: pd.DataFrame) -> dict[str, Any]:
    profile: dict[str, Any] = {"rows": int(len(df)), "columns": {}}
    for col in df.columns:
        s = df[col]
        info: dict[str, Any] = {"null_rate": float(s.isna().mean())}
        if pd.api.types.is_numeric_dtype(s):
            info.update({"min": float(s.min()), "max": float(s.max()), "avg": float(s.mean())})
        else:
            info["top_values"] = s.astype(str).value_counts().head(5).to_dict()
        profile["columns"][col] = info
    return profile
