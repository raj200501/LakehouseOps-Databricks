import { test, expect } from '@playwright/test'

test('loads dashboard shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('LakehouseOps')).toBeVisible()
  await expect(page.getByText('Overview')).toBeVisible()
})

test('start demo navigates to run details and shows known status', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Start demo' }).click()
  await expect(page).toHaveURL(/\/runs\/\d+/)
  await expect(page.getByText(/Run detail #/)).toBeVisible()
  const statuses = page.locator('.badge')
  await expect(statuses.first()).not.toContainText('unknown')
})
