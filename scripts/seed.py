from fastapi.testclient import TestClient
from app.main import app

if __name__ == '__main__':
    c = TestClient(app)
    c.get('/health')
    c.post('/runs', json={'pipeline_name':'seed'})
    print('seeded')
