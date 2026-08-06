import { test, expect } from "@playwright/test";

test.describe("Navegación General", () => {
  test("TC-NAV-01: La ruta raíz redirige a login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });

  test("TC-NAV-02: Ruta inexistente redirige a login", async ({ page }) => {
    await page.goto("/ruta-que-no-existe");
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });

  test("TC-NAV-03: La página de login tiene el logo del SENA", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("svg").first()).toBeVisible();
  });

  test("TC-NAV-04: El formulario de login tiene campos email y password", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
  });

  test("TC-NAV-05: Links de registro funcionan", async ({ page }) => {
    await page.goto("/login");
    await page.click("text=Regístrate aquí");
    await expect(page).toHaveURL(/.*register/, { timeout: 5000 });
  });

  test("TC-NAV-06: La página de registro carga correctamente", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1").last()).toBeVisible({ timeout: 5000 });
  });
});
