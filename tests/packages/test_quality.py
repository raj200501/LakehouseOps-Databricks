import pandas as pd
from quality_engine import evaluate_rules


def test_quality_rules():
    df = pd.DataFrame({'id': [1, 2, None], 'amount': [5, 10, 15]})
    res = evaluate_rules(
        df,
        [
            {'type': 'not_null', 'column': 'id'},
            {'type': 'range', 'column': 'amount', 'min': 0, 'max': 20},
        ],
    )
    assert res[0].failures == 1
    assert res[1].passed
