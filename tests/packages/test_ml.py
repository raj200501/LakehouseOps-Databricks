import pandas as pd
from ml_service import MLService


def test_ml_train_predict(tmp_path):
    svc = MLService(str(tmp_path))
    df = pd.DataFrame({'a':[1,2,3,4,5,6],'b':[6,5,4,3,2,1],'label':[0,1,0,1,0,1]})
    result = svc.train(df, target='label')
    assert result.accuracy >= 0
    scores = svc.predict([{'a':1,'b':6},{'a':6,'b':1}])
    assert len(scores) == 2
