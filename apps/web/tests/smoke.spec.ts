import { test, expect } from '@playwright/test'

test('loads dashboard', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('LakehouseOps Dashboard')).toBeVisible()
})
