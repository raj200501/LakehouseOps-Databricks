from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

import pandas as pd


Transform = Callable[[pd.DataFrame], pd.DataFrame]


@dataclass
class Asset:
    name: str
    layer: str
    source_path: str | None = None
    depends_on: list[str] = field(default_factory=list)
    transform: Transform | None = None


class PipelineEngine:
    def __init__(self, root: str = "data") -> None:
        self.root = Path(root)
        self.assets: dict[str, Asset] = {}

    def register(self, asset: Asset) -> None:
        self.assets[asset.name] = asset

    def _path_for(self, asset: Asset) -> Path:
        return self.root / asset.layer / f"{asset.name}.parquet"

    def run(self) -> list[str]:
        completed: list[str] = []
        for asset in self.assets.values():
            if asset.depends_on:
                base = pd.read_parquet(self._path_for(self.assets[asset.depends_on[0]]))
            else:
                if asset.source_path and asset.source_path.endswith(".json"):
                    base = pd.read_json(asset.source_path)
                else:
                    base = pd.read_csv(asset.source_path or "")
            if asset.transform:
                base = asset.transform(base)
            out = self._path_for(asset)
            out.parent.mkdir(parents=True, exist_ok=True)
            base.to_parquet(out, index=False)
            completed.append(asset.name)
        return completed
