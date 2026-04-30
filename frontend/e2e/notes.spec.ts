import { test, expect } from '@playwright/test';

test.describe('Notes — critical flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('create a note and see it in the list', async ({ page }) => {
    await page.getByRole('button', { name: /new note/i }).click();
    await page.getByPlaceholder(/title/i).fill('E2E Test Note');
    await page.getByPlaceholder(/content/i).fill('Written by Playwright');
    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.getByText('E2E Test Note')).toBeVisible();
  });

  test('archive a note — it disappears from active list', async ({ page }) => {
    await page.getByRole('button', { name: /new note/i }).click();
    await page.getByPlaceholder(/title/i).fill('Archive Me');
    await page.getByRole('button', { name: /save/i }).click();

    await page.getByText('Archive Me').click();
    await page.getByRole('button', { name: /archive/i }).click();

    await page.getByRole('link', { name: /active|notes/i }).click();
    await expect(page.getByText('Archive Me')).not.toBeVisible();
  });

  test('soft-delete a note — it moves to trash', async ({ page }) => {
    await page.getByRole('button', { name: /new note/i }).click();
    await page.getByPlaceholder(/title/i).fill('Delete Me');
    await page.getByRole('button', { name: /save/i }).click();

    await page.getByText('Delete Me').click();
    await page.getByRole('button', { name: /delete|trash/i }).click();

    await expect(page.getByText('Delete Me')).not.toBeVisible();

    await page.getByRole('link', { name: /trash/i }).click();
    await expect(page.getByText('Delete Me')).toBeVisible();
  });

  test('restore a note from trash — it returns to active list', async ({ page }) => {
    await page.getByRole('button', { name: /new note/i }).click();
    await page.getByPlaceholder(/title/i).fill('Restore Me');
    await page.getByRole('button', { name: /save/i }).click();

    await page.getByText('Restore Me').click();
    await page.getByRole('button', { name: /delete|trash/i }).click();

    await page.getByRole('link', { name: /trash/i }).click();
    await page.getByText('Restore Me').click();
    await page.getByRole('button', { name: /restore/i }).click();

    await page.getByRole('link', { name: /active|notes/i }).click();
    await expect(page.getByText('Restore Me')).toBeVisible();
  });
});
