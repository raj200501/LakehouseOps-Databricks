import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:5173' },
  webServer: [
    {
      command: 'PYTHONPATH=../..:../../packages/common/src:../../packages/ml/src:../../packages/lakehouse/src:../../packages/quality/src:../../packages/lineage/src uvicorn app.main:app --app-dir ../api --host 127.0.0.1 --port 8000',
      port: 8000,
      reuseExistingServer: true,
    },
    { command: 'npm run dev -- --host 127.0.0.1 --port 5173', port: 5173, reuseExistingServer: true },
  ],
})
