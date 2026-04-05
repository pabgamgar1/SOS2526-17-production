import { test, expect } from '@playwright/test';

const URL_BASE = 'http://localhost:5173/agriculture-land'; 

test.describe('Agriculture Land E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(URL_BASE, { waitUntil: 'networkidle' });
    });

    test('should list resources and show header', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Agriculture Land');
    });

    test('should load initial data and then delete all', async ({ page }) => {
        await page.click('.btn-load');
        await expect(page.locator('.alert.success')).toBeVisible({ timeout: 10000 });
        
        page.on('dialog', dialog => dialog.accept()); 
        await page.click('.btn-danger');
        
        await expect(page.locator('.empty')).toContainText('No hay datos', { timeout: 10000 });
    });

    test('should create a new agriculture resource', async ({ page }) => {
        // Rellenamos el formulario lateral (aside)
        await page.locator('aside input').nth(0).fill('Testland');
        await page.locator('aside input').nth(1).fill('2026');
        await page.locator('aside input').nth(2).fill('TLD');
        await page.locator('aside input').nth(3).fill('45.5');
        
        await page.click('.btn-add');
        
        await expect(page.locator('.alert.success')).toBeVisible();
        await expect(page.locator('table tbody')).toContainText('Testland');
    });

    test('should search resources using filters', async ({ page }) => {
        await page.click('.btn-load');
        await page.waitForSelector('table tbody tr:not(.empty)');

        // Usamos tu placeholder exacto: "País (ej: Spain)"
        const searchInput = page.locator('input[placeholder="País (ej: Spain)"]');
        await searchInput.fill('Spain');
        
        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('agriculture-land') && resp.status() === 200),
            page.click('.btn-search')
        ]);

        await expect(page.locator('table tbody tr').first()).toContainText('Spain');
    });

    test('should navigate to edit view and update', async ({ page }) => {
        await page.click('.btn-load');
        await page.waitForSelector('.btn-edit');
        
        await page.click('.btn-edit >> nth=0');
        
        await page.waitForURL(/\/agriculture-land\/.+\/\d+/);
        
        // Buscamos el primer input que no sea readonly (Código)
        const inputEditable = page.locator('input:not([readonly])').first();
        await inputEditable.fill('EDITADO-CODE'); 
        
        await page.click('.btn-update'); 
        
        await expect(page.locator('.alert.success')).toBeVisible();
        await page.waitForURL(/\/agriculture-land/);
    });

    test('should delete a specific resource from the table', async ({ page }) => {
        await page.click('.btn-load');
        await page.waitForSelector('.btn-del');
        
        const initialRows = await page.locator('table tbody tr:not(.empty)').count();
        
        page.on('dialog', dialog => dialog.accept());
        await page.click('.btn-del >> nth=0');
        
        await expect(page.locator('.alert.success')).toBeVisible();
        
        // Verificamos 
        await page.waitForFunction((expected) => {
            return document.querySelectorAll('table tbody tr:not(.empty)').length < expected;
        }, initialRows);
    });
});