import { test, expect } from '@playwright/test';

test.describe('RustRunner', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://play.rust-lang.org/execute', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          stdout: 'Hello from Rust!\n',
          stderr: '',
        }),
      });
    });
    await page.goto('/');
  });

  test('clicking Run calls Rust playground and shows stdout', async ({ page }) => {
    const runner = page.locator('[data-lang="rust"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toContainText('Hello from Rust!');
  });

  test('output panel shows ok state after successful run', async ({ page }) => {
    const runner = page.locator('[data-lang="rust"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toHaveClass(/ok/);
  });

  test('renders Open in Playground link pointing to play.rust-lang.org', async ({ page }) => {
    const runner = page.locator('[data-lang="rust"]');
    const link = runner.getByRole('link', { name: /playground/i });
    await expect(link).toHaveAttribute('href', 'https://play.rust-lang.org/');
  });

  test('error state shown when compilation fails', async ({ page }) => {
    await page.unroute('https://play.rust-lang.org/execute');
    await page.route('https://play.rust-lang.org/execute', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          stdout: '',
          stderr: 'error[E0308]: mismatched types',
        }),
      });
    });

    const runner = page.locator('[data-lang="rust"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toHaveClass(/err/);
    await expect(runner.getByRole('log')).toContainText('mismatched types');
  });
});
