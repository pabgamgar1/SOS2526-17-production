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
        // Cargar datos iniciales
        await page.click('button:has-text("Cargar datos iniciales")');
        await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 8000 });

        // Borrar todo
        page.on('dialog', dialog => dialog.accept());
        await page.click('button:has-text("Borrar todo")');
        await expect(page.locator('[role="alert"]')).toContainText('eliminados');
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

        // Todos los años visibles deben estar en el rango indicado
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
        // Aseguramos que hay datos cargados
        await page.click('button:has-text("Cargar datos iniciales")');
        await page.waitForSelector('table tbody tr:not(:has(.vacio))', { timeout: 8000 });

        // Navegar a la vista de edición del primer registro
        await page.click('a:has-text("Editar") >> nth=0');

        await page.waitForURL(/\/renewable-energy-consumptions\/.+\/\d+/);

        // Modificar el campo código
        const inputCode = page.locator('#code');
        await inputCode.fill('NEWCODE');

        await page.click('button:has-text("Guardar cambios")');

        await expect(page.locator('[role="alert"]')).toContainText('éxito', { timeout: 8000 });
    });

    test('should delete a specific resource', async ({ page }) => {
        // Aseguramos datos disponibles
        await page.click('button:has-text("Cargar datos iniciales")');
        await page.waitForSelector('table tbody tr:not(:has(.vacio))', { timeout: 8000 });

        const initialRows = await page.locator('table tbody tr').count();

        if (initialRows > 0) {
            page.on('dialog', dialog => dialog.accept());
            await page.click('button:has-text("Eliminar") >> nth=0');

            await expect(page.locator('[role="alert"]')).toContainText('eliminado', { timeout: 8000 });

            const finalRows = await page.locator('table tbody tr').count();
            if (initialRows === 1) {
                await expect(page.locator('.vacio')).toBeVisible();
            } else {
                expect(finalRows).toBeLessThan(initialRows);
            }
        }
    });

    test('should search by country filter', async ({ page }) => {
        // Cargar datos para asegurar que hay algo que buscar
        await page.click('button:has-text("Cargar datos iniciales")');
        await page.waitForSelector('table tbody tr:not(:has(.vacio))', { timeout: 8000 });

        await page.fill('#filter-country', 'Afghanistan');
        await page.click('button:has-text("Aplicar filtros")');

        await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 8000 });

        const rows = page.locator('table tbody td.country');
        const count = await rows.count();
        for (let i = 0; i < count; i++) {
            await expect(rows.nth(i)).toContainText('Afghanistan');
        }
    });
});
