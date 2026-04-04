import { test, expect } from '@playwright/test';

test.describe('JavaRunner', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://emkc.org/api/v2/piston/execute', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          run: { code: 0, stdout: 'Hello from Java!\n', stderr: '', signal: null },
        }),
      });
    });
    await page.goto('/');
  });

  test('clicking Run calls Piston API and shows stdout', async ({ page }) => {
    const runner = page.locator('[data-lang="java"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toContainText('Hello from Java!');
  });

  test('output panel shows ok state after successful run', async ({ page }) => {
    const runner = page.locator('[data-lang="java"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toHaveClass(/ok/);
  });

  test('error state shown when JVM exits with non-zero code', async ({ page }) => {
    await page.unroute('https://emkc.org/api/v2/piston/execute');
    await page.route('https://emkc.org/api/v2/piston/execute', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          run: {
            code: 1,
            stdout: '',
            stderr: 'Exception in thread "main" java.lang.RuntimeException',
            signal: null,
          },
        }),
      });
    });

    const runner = page.locator('[data-lang="java"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toHaveClass(/err/);
    await expect(runner.getByRole('log')).toContainText('RuntimeException');
  });
});
