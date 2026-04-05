import { test, expect } from '@playwright/test';

const URL_BASE = 'http://localhost:3000/';

test('Prueba E2E Front-ends del Grupo', async ({ page }) => {
   test.setTimeout(60000);

    await page.goto(URL_BASE, { waitUntil: 'networkidle' });

    const integrantes = [
        { nombre: 'Mario Ramírez García', path: '/water-productivities' },
        { nombre: 'Pablo Gamero García', path: '/renewable-energy-consumptions' },
        { nombre: 'Felipe Morgado Martinez', path: '/agriculture-land' }
    ];

    for (const persona of integrantes) {
        await page.goto(URL_BASE);

        const fila = page.locator(`tr:has-text("${persona.nombre}")`);
        const boton = fila.locator('a:has-text("Front-end")');
        
        await boton.click();
        await expect(page).toHaveURL(new RegExp(persona.path));

        const header = page.locator('h1, h2');
        await expect(header.first()).toBeVisible();
    }
});