import { test, expect } from '@playwright/test';

const URL_BASE = 'http://localhost:5173/agriculture-land'; 

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
        // 1. Cargar datos iniciales
        await page.click('.btn-load');
        // Esperamos a que la tabla tenga contenido real
        await page.waitForSelector('table tbody tr:not(.empty)');

        // 2. Buscamos el input de país usando tu placeholder exacto
        const searchInput = page.locator('input[placeholder="País (ej: Spain)"]');
        await searchInput.fill('argentina'); 
        
        // 3. Clic en buscar y esperar a que el servidor responda (200 OK)
        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('agriculture-land') && resp.status() === 200),
            page.click('.btn-search')
        ]);

        // 4. Verificación: La primera fila debe contener "argentina"
        // Usamos /argentina/i para que no importe si es mayúscula o minúscula
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
        await page.click('.btn-load');
        await page.waitForSelector('.btn-edit');
        await page.click('.btn-edit >> nth=0');
        await page.waitForURL(/\/agriculture-land\/.+\/\d+/);
        const inputEditable = page.locator('input:not([readonly])').first();
        await inputEditable.fill('EDITADO-CODE'); 
        await page.click('.btn-update'); 
        await expect(page.locator('.alert.success')).toBeVisible();
        await page.waitForURL(/\/agriculture-land/);
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