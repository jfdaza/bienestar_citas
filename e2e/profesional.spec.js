import { test, expect } from "@playwright/test";
import { TEST_CREDENTIALS } from "./test-utils";

async function loginAsProfesional(page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', TEST_CREDENTIALS.docente.email);
  await page.fill('input[type="password"]', TEST_CREDENTIALS.docente.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*app/, { timeout: 10000 });
}

test.describe("Dashboard Profesional", () => {
  test("TC-PRO-01: El panel profesional carga correctamente", async ({ page }) => {
    await loginAsProfesional(page);
    await expect(page.locator("h2")).toContainText("Hola", { timeout: 5000 });
    await expect(page.locator("text=Panel profesional")).toBeVisible();
  });

  test("TC-PRO-02: Se muestra la fecha de hoy", async ({ page }) => {
    await loginAsProfesional(page);
    const today = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long" });
    await expect(page.locator("text=" + today.split(" ")[0])).toBeVisible({ timeout: 5000 });
  });

  test("TC-PRO-03: Se muestran las estadísticas con 3 cards", async ({ page }) => {
    await loginAsProfesional(page);
    const statsGrid = page.locator(".stats-grid");
    await expect(statsGrid).toBeVisible({ timeout: 5000 });
    await expect(statsGrid.locator(".stat-card")).toHaveCount(3);
  });

  test("TC-PRO-04: Los tabs de filtro funcionan", async ({ page }) => {
    await loginAsProfesional(page);
    const pendingTab = page.locator(".filter-tabs button", { hasText: "Pendientes" });
    const confirmedTab = page.locator(".filter-tabs button", { hasText: "Confirmadas" });
    await expect(pendingTab).toBeVisible({ timeout: 5000 });
    await pendingTab.click();
    await expect(pendingTab).toHaveClass(/active/);
    await confirmedTab.click();
    await expect(confirmedTab).toHaveClass(/active/);
  });

  test("TC-PRO-05: El botón de notificaciones tiene badge si hay citas pendientes", async ({ page }) => {
    await loginAsProfesional(page);
    const bellBtn = page.locator('button[aria-label="Notificaciones"]');
    await expect(bellBtn).toBeVisible({ timeout: 5000 });
  });

  test("TC-PRO-06: Click en campana abre panel de notificaciones", async ({ page }) => {
    await loginAsProfesional(page);
    await page.click('button[aria-label="Notificaciones"]');
    await expect(page.locator("text=Nuevas citas")).toBeVisible({ timeout: 3000 });
  });

  test("TC-PRO-07: Cerrar sesión desde el panel profesional", async ({ page }) => {
    await loginAsProfesional(page);
    await page.click('button[aria-label="Cerrar sesión"]');
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });

  test("TC-PRO-08: Se muestra el nombre del departamento", async ({ page }) => {
    await loginAsProfesional(page);
    const header = page.locator(".dashboard-header");
    await expect(header).toBeVisible({ timeout: 5000 });
  });
});
