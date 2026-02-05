from app.main import app
from fastapi.testclient import TestClient


def test_health():
    c = TestClient(app)
    r = c.get('/health')
    assert r.status_code == 200


def test_run_pipeline_flow():
    c = TestClient(app)
    c.get('/health')
    run = c.post('/runs', json={'pipeline_name':'demo'})
    assert run.status_code == 200
    runs = c.get('/runs').json()
    assert len(runs) >= 1
    lineage = c.get('/lineage').json()
    assert lineage['nodes']
