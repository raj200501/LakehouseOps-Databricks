from pathlib import Path

import pandas as pd
from pipeline import Asset, PipelineEngine


def test_pipeline_engine(tmp_path: Path):
    source = tmp_path / 'in.csv'
    pd.DataFrame({'x':[1,2,3]}).to_csv(source, index=False)
    eng = PipelineEngine(str(tmp_path))
    eng.register(Asset(name='base', layer='bronze', source_path=str(source)))
    eng.register(
        Asset(
            name='next',
            layer='silver',
            depends_on=['base'],
            transform=lambda df: df.assign(y=df.x * 2),
        )
    )
    done = eng.run()
    assert 'next' in done
    assert (tmp_path / 'silver' / 'next.parquet').exists()
