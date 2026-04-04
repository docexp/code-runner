import { test, expect } from '@playwright/test';

test.describe('GoRunner', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://go.dev/play/compile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Events: [{ Message: 'Hello from Go!\n', Kind: 'stdout', Delay: 0 }],
        }),
      });
    });
    await page.goto('/');
  });

  test('clicking Run calls go.dev playground and shows stdout', async ({ page }) => {
    const runner = page.locator('[data-lang="go"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toContainText('Hello from Go!');
  });

  test('output panel shows ok state after successful run', async ({ page }) => {
    const runner = page.locator('[data-lang="go"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toHaveClass(/ok/);
  });

  test('renders Open in Playground link pointing to go.dev', async ({ page }) => {
    const runner = page.locator('[data-lang="go"]');
    const link = runner.getByRole('link', { name: /playground/i });
    await expect(link).toHaveAttribute('href', 'https://go.dev/play/');
  });

  test('error state shown when playground returns compile errors', async ({ page }) => {
    await page.unroute('https://go.dev/play/compile');
    await page.route('https://go.dev/play/compile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ Errors: 'undefined: x' }),
      });
    });

    const runner = page.locator('[data-lang="go"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toHaveClass(/err/);
    await expect(runner.getByRole('log')).toContainText('undefined: x');
  });
});
