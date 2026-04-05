import { test, expect } from '@playwright/test';

const URL_BASE = 'http://localhost:3000/water-productivities'; 

test.describe('Water Productivities E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(URL_BASE, { waitUntil: 'networkidle' });
    });

    test('should list resources and show header', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Productividad de Agua');
    });

    test('should load initial data and then delete all', async ({ page }) => {
        await page.click('.btn-load');
        await expect(page.locator('.alert')).toContainText('ejemplo cargados');
        page.on('dialog', dialog => dialog.accept()); 
        await page.click('.btn-danger');
        await expect(page.locator('.empty')).toContainText('No hay datos');
    });

    test('should create a new resource', async ({ page }) => {
        await page.fill('input[placeholder="País"]', 'TestCountry');
        await page.fill('input[placeholder="Año"]', '2026');
        await page.fill('input[placeholder="Cód. País"]', 'TC');
        await page.fill('input[placeholder="Productividad"]', '55.5');
        await page.fill('input[placeholder="Estrés (%)"]', '10');
        await page.fill('input[placeholder="Agua Dulce"]', '1000');
        await page.click('.btn-add');
        await expect(page.locator('.success')).toBeVisible();
        await expect(page.locator('table')).toContainText('TestCountry');
    });

    test('should search resources using filters', async ({ page }) => {
        await page.fill('input[placeholder="País (ej: Spain)"]', 'TestCountry');
        await page.fill('input[placeholder="Desde (año)"]', '2025');
        await page.fill('input[placeholder="Hasta (año)"]', '2027');
        await page.click('.btn-search');
        await expect(page.locator('table tbody tr').first()).toContainText('TestCountry');
    });

    test('should navigate to edit view and update', async ({ page }) => {
        await page.click('.btn-load');
        
        // 1. Clic en editar y esperar a que la URL cambie realmente
        await page.click('.btn-edit >> nth=0');
        
        // Esperamos a que la URL contenga la estructura de edición (un número al final por el año)
        await page.waitForURL(/\/water-productivities\/.+\/\d+/);
        
        const inputCodigo = page.locator('input:not([readonly])').first();
        await inputCodigo.fill('NEWCODE123'); 
        await page.click('.btn-update'); 
        
        await expect(page.locator('.success')).toBeVisible();
    });

    test('should delete a specific resource', async ({ page }) => {
        await page.click('.btn-load');
        // Esperamos a que la tabla se llene tras la carga
        await page.waitForSelector('table tbody tr:not(.empty)');
        
        const initialRows = await page.locator('table tbody tr').count();
        
        if (initialRows > 0) {
            await page.click('.btn-del >> nth=0');
            
            // 2. CLAVE: Esperamos a que aparezca el mensaje de éxito 
            // Esto garantiza que el borrado ha terminado en el servidor y Svelte ha refrescado
            await expect(page.locator('.success')).toBeVisible();
            
            // Verificamos que ahora hay una fila menos
            const finalRows = await page.locator('table tbody tr').count();
            // Si solo había una, debería aparecer la fila con clase .empty
            if (initialRows === 1) {
                await expect(page.locator('.empty')).toBeVisible();
            } else {
                expect(finalRows).toBeLessThan(initialRows);
            }
        }
    });
});