import { test, expect } from '@playwright/test';

test.describe('JsRunner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('clicking Run executes JavaScript and shows stdout', async ({ page }) => {
    const runner = page.locator('[data-lang="javascript"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toContainText('Hello from JavaScript!');
  });

  test('output panel shows ok state after successful run', async ({ page }) => {
    const runner = page.locator('[data-lang="javascript"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toHaveClass(/ok/);
  });

  test('Reset button restores original code', async ({ page }) => {
    const runner = page.locator('[data-lang="javascript"]');
    const textarea = runner.locator('textarea');
    await textarea.fill('console.log("modified")');
    await runner.getByRole('button', { name: /reset/i }).click();
    await expect(textarea).toHaveValue(`console.log('Hello from JavaScript!');`);
  });

  test('Reset clears output back to placeholder', async ({ page }) => {
    const runner = page.locator('[data-lang="javascript"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toContainText('Hello from JavaScript!');
    await runner.getByRole('button', { name: /reset/i }).click();
    await expect(runner.getByRole('log')).toContainText('(click ▶ Run)');
  });

  test('error state shown when code throws', async ({ page }) => {
    const runner = page.locator('[data-lang="javascript"]');
    const textarea = runner.locator('textarea');
    await textarea.fill('throw new Error("deliberate error")');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toHaveClass(/err/);
    await expect(runner.getByRole('log')).toContainText('deliberate error');
  });
});
