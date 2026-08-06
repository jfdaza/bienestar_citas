import { test, expect } from "@playwright/test";
import { TEST_CREDENTIALS } from "./test-utils";

async function loginAsAprendiz(page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', TEST_CREDENTIALS.estudiante.email);
  await page.fill('input[type="password"]', TEST_CREDENTIALS.estudiante.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*app/, { timeout: 10000 });
}

test.describe("Dashboard Aprendiz", () => {
  test("TC-APR-01: El dashboard del aprendiz carga con bienvenida", async ({ page }) => {
    await loginAsAprendiz(page);
    await expect(page.locator("h2")).toContainText("Hola", { timeout: 5000 });
    await expect(page.locator("text=Bienvenido a Bienestar SENA")).toBeVisible();
  });

  test("TC-APR-02: El menú inferior muestra las 4 pestañas", async ({ page }) => {
    await loginAsAprendiz(page);
    const nav = page.locator(".bottom-nav");
    await expect(nav.locator("button")).toHaveCount(4);
  });

  test("TC-APR-03: Navegar a la pestaña de Mis Citas", async ({ page }) => {
    await loginAsAprendiz(page);
    await page.click("text=Mis citas");
    await expect(page.locator("h2")).toContainText("Mis Citas");
  });

  test("TC-APR-04: El botón Nueva Cita abre el formulario modal", async ({ page }) => {
    await loginAsAprendiz(page);
    await page.click("text=Nueva Cita");
    await expect(page.locator(".modal-overlay")).toBeVisible();
    await expect(page.locator(".modal-content")).toBeVisible();
  });

  test("TC-APR-05: Se muestran las estadísticas del aprendiz", async ({ page }) => {
    await loginAsAprendiz(page);
    await expect(page.locator(".stats-grid")).toBeVisible({ timeout: 5000 });
  });

  test("TC-APR-06: Filtros de estado funcionan", async ({ page }) => {
    await loginAsAprendiz(page);
    await page.click("text=Mis citas");
    const filterBtns = page.locator(".filter-btn");
    await expect(filterBtns.first()).toBeVisible();
    await filterBtns.first().click();
    await expect(filterBtns.first()).toHaveClass(/active/);
  });

  test("TC-APR-07: Cerrar modal de nueva cita con botón X", async ({ page }) => {
    await loginAsAprendiz(page);
    await page.click("text=Nueva Cita");
    await expect(page.locator(".modal-overlay")).toBeVisible();
    await page.click(".modal-close");
    await expect(page.locator(".modal-overlay")).not.toBeVisible();
  });

  test("TC-APR-08: Pestaña de notificaciones muestra contenido", async ({ page }) => {
    await loginAsAprendiz(page);
    await page.click("text=Notificaciones");
    await expect(page.locator("text=Notificaciones").first()).toBeVisible();
  });
});
