import { test, expect } from '@playwright/test';

const URL_BASE = 'http://localhost:3000/renewable-energy-consumptions';

test.describe('Renewable Energy Consumptions E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(URL_BASE, { waitUntil: 'networkidle' });
    });

    test('should list resources and show header', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Consumo de energías renovables');
    });

    test('should load initial data and then delete all', async ({ page }) => {
        await page.click('button:has-text("Cargar datos iniciales")');
        await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 8000 });

        page.on('dialog', dialog => dialog.accept());
        await page.click('button:has-text("Borrar todo")');
        await expect(page.locator('[role="alert"]')).toContainText('eliminados', { timeout: 8000 });
    });

    test('should create a new resource', async ({ page }) => {
        await page.fill('#country', 'TestCountry');
        await page.fill('#code', 'TST');
        await page.fill('#year', '2030');
        await page.fill('#wind', '12.5');
        await page.fill('#hydro', '8.3');
        await page.fill('#solar', '5.1');
        await page.fill('#other', '1.0');

        await page.click('button:has-text("Guardar registro")');

        await expect(page.locator('[role="alert"]')).toContainText('creado', { timeout: 8000 });
        await expect(page.locator('table')).toContainText('TestCountry');
    });

    test('should search resources using filters', async ({ page }) => {
        await page.fill('#filter-from', '1990');
        await page.fill('#filter-to', '2005');

        await page.click('button:has-text("Aplicar filtros")');

        await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 8000 });

        const yearCells = page.locator('table tbody td:nth-child(3)');
        const count = await yearCells.count();
        for (let i = 0; i < count; i++) {
            const yearText = await yearCells.nth(i).innerText();
            const year = parseInt(yearText);
            expect(year).toBeGreaterThanOrEqual(1990);
            expect(year).toBeLessThanOrEqual(2005);
        }
    });

    test('should navigate to edit view and update a resource', async ({ page }) => {
        await page.click('button:has-text("Cargar datos iniciales")');

        await expect(page.locator('a:has-text("Editar")').first()).toBeVisible({ timeout: 8000 });

        await page.click('a:has-text("Editar") >> nth=0');
        await page.waitForURL(/\/renewable-energy-consumptions\/.+\/\d+/);

        const inputCode = page.locator('#code');
        await inputCode.fill('NEWCODE');

        await page.click('button:has-text("Guardar cambios")');

        await expect(page.locator('[role="alert"]')).toContainText('éxito', { timeout: 8000 });
    });

    test('should delete a specific resource', async ({ page }) => {
        await page.click('button:has-text("Cargar datos iniciales")');

        await expect(page.locator('button:has-text("Eliminar")').first()).toBeVisible({ timeout: 8000 });

        const initialRows = await page.locator('table tbody tr').count();

        // Registrar el handler ANTES del click para no perder el dialog
        page.on('dialog', dialog => dialog.accept());

        const deleteBtn = page.locator('button:has-text("Eliminar")').first();
        await deleteBtn.waitFor({ state: 'visible' });
        await deleteBtn.click();

        await expect(page.locator('[role="alert"]')).toContainText('eliminado', { timeout: 10000 });

        await page.waitForTimeout(300);

        const finalRows = await page.locator('table tbody tr').count();
        if (initialRows === 1) {
            await expect(page.locator('.vacio')).toBeVisible();
        } else {
            expect(finalRows).toBeLessThan(initialRows);
        }
    });

    test('should search by country filter', async ({ page }) => {
        await page.click('button:has-text("Cargar datos iniciales")');

        await expect(page.locator('a:has-text("Editar")').first()).toBeVisible({ timeout: 8000 });

        await page.fill('#filter-country', 'Afghanistan');
        await page.click('button:has-text("Aplicar filtros")');

        await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 8000 });

        // Esperar a que la primera celda tenga el texto correcto antes de leer todo
        await expect(page.locator('table tbody td.country').first()).toContainText('Afghanistan', { timeout: 8000 });

        // Leer todos los textos de golpe para evitar condiciones de carrera al iterar con nth
        const countryTexts = await page.locator('table tbody td.country').allInnerTexts();
        expect(countryTexts.length).toBeGreaterThan(0);
        for (const text of countryTexts) {
            expect(text).toBe('Afghanistan');
        }
    });
});
