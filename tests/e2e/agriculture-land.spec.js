import { test, expect } from '@playwright/test';

//const URL_BASE = 'http://localhost:5173/agriculture-land'; 
const URL_BASE = 'http://localhost:3000/agriculture-land'; 
test.describe('Agriculture Land E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(URL_BASE, { waitUntil: 'networkidle' });
    });

    test('should load initial data and then delete all', async ({ page }) => {
        await page.click('.btn-load');
        await expect(page.locator('.alert.success')).toBeVisible({ timeout: 10000 });
        
        page.on('dialog', dialog => dialog.accept()); 
        await page.click('.btn-danger');
        await expect(page.locator('.empty')).toBeVisible({ timeout: 10000 });
    });

    test('should search resources using filters (Argentina Case)', async ({ page }) => {
       
        await page.click('.btn-load');
      
        await page.waitForSelector('table tbody tr:not(.empty)');

        // 2. Buscamos el input de país usando tu placeholder exacto
        const searchInput = page.locator('input[placeholder="País (ej: Spain)"]');
        await searchInput.fill('argentina'); 
        
      
        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('agriculture-land') && resp.status() === 200),
            page.click('.btn-search')
        ]);

      
        const firstRow = page.locator('table tbody tr').first();
        await expect(firstRow).toContainText(/argentina/i, { timeout: 10000 });
    });

    test('should create a new agriculture resource', async ({ page }) => {
        await page.locator('aside input').nth(0).fill('Testland');
        await page.locator('aside input').nth(1).fill('2026');
        await page.locator('aside input').nth(2).fill('TLD');
        await page.locator('aside input').nth(3).fill('45.5');
        await page.click('.btn-add');
        await expect(page.locator('.alert.success')).toBeVisible();
        await expect(page.locator('table tbody')).toContainText('Testland');
    });

    test('should navigate to edit view and update', async ({ page }) => {
        // 1. Cargamos 
        await page.click('.btn-load');
        const btnEdit = page.locator('.btn-edit').first();
        await expect(btnEdit).toBeVisible({ timeout: 10000 });
        
        // 2. Click
        await btnEdit.click();
        await page.waitForURL(/\/agriculture-land\/.+\/\d+/, { timeout: 10000 });
        
        // 3. Esperamos 
        const inputEditable = page.locator('input:not([readonly])').first();
        await expect(inputEditable).not.toHaveValue('', { timeout: 10000 });
        
        // 4. Limpiamos 
        await inputEditable.click();
        await inputEditable.fill('EDITADO-ARG'); 
        
        // 5. Click en actualizar
        await page.click('.btn-update'); 
        
        // 6. Verificamos éxito y vuelta atrás
        await expect(page.locator('.alert.success')).toBeVisible();
        await page.waitForURL(/\/agriculture-land$/, { timeout: 10000 });
    });

    test('should delete a specific resource', async ({ page }) => {
        await page.click('.btn-load');
        await page.waitForSelector('.btn-del');
        const initialRows = await page.locator('table tbody tr:not(.empty)').count();
        page.on('dialog', dialog => dialog.accept());
        await page.click('.btn-del >> nth=0');
        await expect(page.locator('.alert.success')).toBeVisible();
        await page.waitForFunction((expected) => {
            return document.querySelectorAll('table tbody tr:not(.empty)').length < expected;
        }, initialRows);
    });
});