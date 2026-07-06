import { test, expect } from '@playwright/test';

test('la app arranca y muestra la marca (Fase 0)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Nova Cash' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Comenzar' })).toBeVisible();
});
