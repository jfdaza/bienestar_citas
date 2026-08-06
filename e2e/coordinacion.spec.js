import { test, expect } from "@playwright/test";
import { TEST_CREDENTIALS } from "./test-utils";

async function loginAsCoordinacion(page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', TEST_CREDENTIALS.coordinador.email);
  await page.fill('input[type="password"]', TEST_CREDENTIALS.coordinador.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*app/, { timeout: 10000 });
}

test.describe("Dashboard Coordinación", () => {
  test("TC-COO-01: El panel de coordinación carga correctamente", async ({ page }) => {
    await loginAsCoordinacion(page);
    await expect(page.locator("h1", { hasText: "Panel de Coordinación" })).toBeVisible({ timeout: 8000 });
  });

  test("TC-COO-02: Se muestra el subtítulo Bienestar SENA", async ({ page }) => {
    await loginAsCoordinacion(page);
    await expect(page.locator("text=Bienestar SENA").first()).toBeVisible({ timeout: 8000 });
  });

  test("TC-COO-03: El selector de rango de fechas está visible", async ({ page }) => {
    await loginAsCoordinacion(page);
    await expect(page.locator(".date-filter")).toBeVisible({ timeout: 8000 });
  });

  test("TC-COO-04: El gráfico de citas por dependencia se renderiza", async ({ page }) => {
    await loginAsCoordinacion(page);
    await expect(page.locator(".charts-grid")).toBeVisible({ timeout: 8000 });
  });

  test("TC-COO-05: La sección de profesionales se muestra", async ({ page }) => {
    await loginAsCoordinacion(page);
    await expect(page.locator(".professionals-section")).toBeVisible({ timeout: 8000 });
  });

  test("TC-COO-06: Cerrar sesión desde coordinación", async ({ page }) => {
    await loginAsCoordinacion(page);
    await page.click('button[aria-label="Cerrar sesión"]');
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });

  test("TC-COO-07: Los quick links están visibles", async ({ page }) => {
    await loginAsCoordinacion(page);
    await expect(page.locator(".quick-links")).toBeVisible({ timeout: 8000 });
  });

  test("TC-COO-08: El filtro de fecha funciona", async ({ page }) => {
    await loginAsCoordinacion(page);
    const select = page.locator(".date-filter select").first();
    await expect(select).toBeVisible({ timeout: 8000 });
    await select.selectOption({ index: 1 });
    await expect(select).toHaveValue(/.+/);
  });
});
