import { test } from '@playwright/test'
import fs from 'node:fs'

const pages = [
  ['/', 'overview'],
  ['/runs', 'runs'],
  ['/tables', 'tables'],
  ['/quality', 'quality'],
  ['/lineage', 'lineage'],
  ['/models', 'models'],
]

test('capture app screenshots', async ({ page }) => {
  fs.mkdirSync('../../docs/assets/screens', { recursive: true })
  await page.goto('/admin')
  await page.getByRole('button', { name: 'Seed demo data' }).click()
  for (const [path, name] of pages) {
    await page.goto(path)
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `../../docs/assets/screens/${name}.png`, fullPage: true })
  }
})
