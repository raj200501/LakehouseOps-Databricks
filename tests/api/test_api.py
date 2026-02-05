from app.main import app
from fastapi.testclient import TestClient


def test_health():
    c = TestClient(app)
    r = c.get('/health')
    assert r.status_code == 200


def test_run_pipeline_flow():
    c = TestClient(app)
    c.get('/health')
    run = c.post('/runs', json={'pipeline_name': 'demo'})
    assert run.status_code == 200
    runs = c.get('/runs').json()
    assert len(runs) >= 1
    lineage = c.get('/lineage').json()
    assert lineage['nodes']


def test_overview_and_demo_admin_endpoints():
    c = TestClient(app)
    seeded = c.post('/admin/demo/seed')
    assert seeded.status_code == 200
    metrics = c.get('/overview/metrics')
    assert metrics.status_code == 200
    body = metrics.json()
    assert 'kpis' in body
    assert len(body['runs_series']) > 0
    models = c.get('/models').json()
    promoted = c.post(f"/models/{models[0]['id']}/promote")
    assert promoted.status_code == 200
    reset = c.post('/admin/demo/reset')
    assert reset.status_code == 200
