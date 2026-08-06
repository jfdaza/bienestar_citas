import { test, expect } from "@playwright/test";
import { TEST_CREDENTIALS } from "./test-utils";

async function loginAsAdmin(page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', TEST_CREDENTIALS.admin.email);
  await page.fill('input[type="password"]', TEST_CREDENTIALS.admin.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*app/, { timeout: 10000 });
}

test.describe("Dashboard Admin", () => {
  test("TC-ADM-01: El panel de administración carga correctamente", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator("h1", { hasText: "Panel de Administración" })).toBeVisible({ timeout: 8000 });
  });

  test("TC-ADM-02: Los tabs de administración están visibles", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator(".admin-tabs")).toBeVisible({ timeout: 8000 });
    await expect(page.locator(".tab-btn")).toHaveCount(2);
  });

  test("TC-ADM-03: Tab de Gestión de Usuarios está activo por defecto", async ({ page }) => {
    await loginAsAdmin(page);
    const usersTab = page.locator(".tab-btn", { hasText: "Gestión de Usuarios" });
    await expect(usersTab).toHaveClass(/active/, { timeout: 8000 });
  });

  test("TC-ADM-04: Cambiar a tab de Auditoría muestra el contenido", async ({ page }) => {
    await loginAsAdmin(page);
    await page.click(".tab-btn", { hasText: "Registro de Auditoría" });
    await expect(page.locator(".admin-content")).toBeVisible({ timeout: 5000 });
  });

  test("TC-ADM-05: Cerrar sesión desde admin", async ({ page }) => {
    await loginAsAdmin(page);
    await page.click("text=Cerrar Sesión");
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });
});
