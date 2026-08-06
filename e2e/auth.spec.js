import { test, expect } from "@playwright/test";
import { TEST_CREDENTIALS } from "./test-utils";

test.describe("Autenticación", () => {
  test("TC-AUTH-01: La página de login carga correctamente", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator("h1").last()).toContainText("Inicia sesión");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText("Iniciar Sesión");
  });

  test("TC-AUTH-02: Login con credenciales inválidas muestra error", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "invalido@gmail.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator(".auth-error")).toBeVisible({ timeout: 5000 });
  });

  test("TC-AUTH-03: Login exitoso como Aprendiz redirige a /app", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.estudiante.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.estudiante.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/, { timeout: 10000 });
  });

  test("TC-AUTH-04: Login exitoso como Coordinación redirige a /app", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.coordinador.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.coordinador.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/, { timeout: 10000 });
  });

  test("TC-AUTH-05: Login exitoso como Profesional redirige a /app", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.docente.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.docente.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/, { timeout: 10000 });
  });

  test("TC-AUTH-06: Login exitoso como Admin redirige a /app", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.admin.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/, { timeout: 10000 });
  });

  test("TC-AUTH-07: Ruta protegida redirige a login si no hay sesión", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });

  test("TC-AUTH-08: Botón de registro es accesible desde login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("a", { hasText: "Regístrate aquí" })).toBeVisible();
  });
});
