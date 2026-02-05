import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const pages = [
  ['/', 'overview', 'Overview'],
  ['/runs', 'runs', 'Pipeline Runs'],
  ['/tables', 'tables', 'Tables'],
  ['/quality', 'quality', 'Data Quality'],
  ['/lineage', 'lineage', 'Lineage'],
  ['/models', 'models', 'Models'],
] as const

test('capture app screenshots', async ({ page }) => {
  fs.mkdirSync('../../docs/assets/screens', { recursive: true })

  await page.request.post('http://localhost:8000/admin/demo/seed')
  await page.goto('/')
  await expect(page.getByText('Overview')).toBeVisible()

  for (const [path, name, heading] of pages) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: `../../docs/assets/screens/${name}.png`, fullPage: true })
  }
})
