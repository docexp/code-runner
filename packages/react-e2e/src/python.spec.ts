import { test, expect } from '@playwright/test';

// Mock window.loadPyodide before page load so no real CDN download occurs.
// The mock must replicate the 4-call sequence runPython makes:
//   1) redirect stdout/stderr setup
//   2) user code execution
//   3) _buf.getvalue() — returns captured output
//   4) sys.stdout/stderr restore
test.describe('PythonRunner', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { loadPyodide?: unknown }).loadPyodide = async () => ({
        runPython: (code: string): unknown => {
          if (code.includes('_buf.getvalue()')) return 'Hello from Python!\n';
          return undefined;
        },
      });
    });
    await page.goto('/');
  });

  test('clicking Run shows captured Python stdout', async ({ page }) => {
    const runner = page.locator('[data-lang="python"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toContainText('Hello from Python!');
  });

  test('output panel shows ok state after successful run', async ({ page }) => {
    const runner = page.locator('[data-lang="python"]');
    await runner.getByRole('button', { name: /run/i }).click();
    await expect(runner.getByRole('log')).toHaveClass(/ok/);
  });

  test('Reset restores original code', async ({ page }) => {
    const runner = page.locator('[data-lang="python"]');
    const textarea = runner.locator('textarea');
    await textarea.fill('x = 42');
    await runner.getByRole('button', { name: /reset/i }).click();
    await expect(textarea).toHaveValue(`print('Hello from Python!')`);
  });
});
