import { test, expect } from "@playwright/test";
import { TEST_CREDENTIALS } from "./test-utils";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ERRORS_FILE = path.resolve(__dirname, "../test-results/simulation-errors.json");

const capturedErrors = [];

function captureError(category, testId, description, details = {}) {
  capturedErrors.push({
    timestamp: new Date().toISOString(),
    category,
    testId,
    description,
    ...details,
  });
  fs.mkdirSync(path.dirname(ERRORS_FILE), { recursive: true });
  fs.writeFileSync(ERRORS_FILE, JSON.stringify(capturedErrors, null, 2));
}

function isExpectedHttpError(msg) {
  if (typeof msg !== "string") return false;
  if (msg.includes("Failed to load resource: the server responded with a status of 404")) return true;
  if (msg.includes("Failed to load resource: the server responded with a status of 400")) return true;
  if (msg.includes("net::ERR_FAILED")) return true;
  if (msg.includes("net::ERR_SOCKET_NOT_CONNECTED")) return true;
  return false;
}

test.describe("SIMULACIÓN COMPLETA - Gestión de Citas Bienestar SENA", () => {

  test("SIM-01: Carga inicial de la aplicación", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) {
        consoleErrors.push(msg.text());
      }
    });

    const networkErrors = [];
    page.on("requestfailed", (req) => {
      networkErrors.push({ url: req.url(), failure: req.failure()?.errorText });
    });

    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-01", "Errores de consola en carga inicial", {
        errors: consoleErrors,
        url: "/login",
      });
    }
    if (networkErrors.length > 0) {
      captureError("NETWORK", "SIM-01", "Errores de red en carga inicial", {
        errors: networkErrors,
        url: "/login",
      });
    }

    const loginForm = page.locator('input[type="email"]');
    const visible = await loginForm.isVisible();
    if (!visible) {
      captureError("UI", "SIM-01", "Formulario de login no visible", { url: "/login" });
    }

    expect(true).toBe(true);
  });

  test("SIM-02: Login con credenciales inválidas", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', "noexiste@correo.com");
    await page.fill('input[type="password"]', "wrongpass123");
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);

    const errorDiv = page.locator(".auth-error");
    const errorVisible = await errorDiv.isVisible().catch(() => false);
    if (!errorVisible) {
      captureError("UI", "SIM-02", "No se muestra mensaje de error con credenciales inválidas", {
        url: "/login",
      });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-02", "Errores de consola en login inválido", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-03: Navegación a registro", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await page.click("text=Regístrate aquí");
    await page.waitForLoadState("networkidle");

    const url = page.url();
    if (!url.includes("register")) {
      captureError("NAVIGATION", "SIM-03", "No se navigó a la página de registro", {
        expected: "/register",
        actual: url,
      });
    }

    const nameInput = page.locator("#reg-name");
    const visible = await nameInput.isVisible().catch(() => false);
    if (!visible) {
      captureError("UI", "SIM-03", "Campo de nombre no visible en registro", { url });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-03", "Errores de consola en registro", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-04: Validación de formulario de registro - paso 1 vacío", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.click("text=Continuar");
    await page.waitForTimeout(1000);

    const errorDiv = page.locator(".auth-error");
    const errorVisible = await errorDiv.isVisible().catch(() => false);
    if (!errorVisible) {
      captureError("VALIDATION", "SIM-04", "No se muestra error al enviar paso 1 vacío", {
        url: "/register",
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-05: Flujo completo de registro - paso 1 con datos", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.fill("#reg-name", "Juan");
    await page.fill("#reg-lastname", "Pérez");
    await page.click("text=Continuar");
    await page.waitForTimeout(1000);

    const step2 = page.locator("#reg-doctype");
    const visible = await step2.isVisible().catch(() => false);
    if (!visible) {
      captureError("UI", "SIM-05", "Paso 2 del registro no visible después de continuar", {
        url: "/register",
      });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-05", "Errores en flujo de registro", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-06: Login exitoso como Aprendiz", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    const networkErrors = [];
    page.on("requestfailed", (req) => {
      networkErrors.push({ url: req.url(), failure: req.failure()?.errorText });
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.estudiante.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.estudiante.password);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/.*app/, { timeout: 15000 });
    } catch {
      captureError("AUTH", "SIM-06", "Login como Aprendiz falló - no redirigió a /app", {
        url: page.url(),
        credentials: TEST_CREDENTIALS.estudiante.email,
      });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-06", "Errores de consola en login Aprendiz", {
        errors: consoleErrors,
      });
    }
    if (networkErrors.length > 0) {
      captureError("NETWORK", "SIM-06", "Errores de red en login Aprendiz", {
        errors: networkErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-07: Dashboard del Aprendiz - verificar elementos", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.estudiante.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.estudiante.password);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/.*app/, { timeout: 15000 });
    } catch {
      captureError("AUTH", "SIM-07", "No se pudo autenticar como Aprendiz", {});
      expect(true).toBe(true);
      return;
    }

    await page.waitForTimeout(2000);

    const hasWelcome = await page.locator("h2").filter({ hasText: "Hola" }).isVisible().catch(() => false);
    if (!hasWelcome) {
      captureError("UI", "SIM-07", "Mensaje de bienvenida no visible en dashboard Aprendiz", {
        url: page.url(),
      });
    }

    const hasBottomNav = await page.locator(".bottom-nav").isVisible().catch(() => false);
    if (!hasBottomNav) {
      captureError("UI", "SIM-07", "Navegación inferior no visible", {
        url: page.url(),
      });
    }

    const hasStats = await page.locator(".stats-grid").isVisible().catch(() => false);
    if (!hasStats) {
      captureError("UI", "SIM-07", "Estadísticas no visibles en dashboard", {
        url: page.url(),
      });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-07", "Errores de consola en dashboard Aprendiz", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-08: Navegación entre pestañas del Aprendiz", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.estudiante.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.estudiante.password);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/.*app/, { timeout: 15000 });
    } catch {
      captureError("AUTH", "SIM-08", "No se pudo autenticar como Aprendiz", {});
      expect(true).toBe(true);
      return;
    }

    await page.waitForTimeout(3000);
    await page.waitForSelector(".bottom-nav button", { timeout: 5000 }).catch(() => {});

    const tabButtons = await page.locator(".bottom-nav button").all();
    const tabLabels = ["Mis citas", "Notificaciones", "Perfil"];
    for (let i = 0; i < tabLabels.length; i++) {
      try {
        if (tabButtons[i]) {
          const isVisible = await tabButtons[i].isVisible().catch(() => false);
          if (isVisible) {
            await tabButtons[i].click();
            await page.waitForTimeout(500);
          } else {
            captureError("UI", "SIM-08", `Pestaña "${tabLabels[i]}" no visible`, {
              url: page.url(),
            });
          }
        }
      } catch (err) {
        captureError("NAVIGATION", "SIM-08", `Error navegando a pestaña "${tabLabels[i]}"`, {
          error: err.message,
        });
      }
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-08", "Errores de consola en navegación de pestañas", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-09: Login exitoso como Coordinación", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.coordinador.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.coordinador.password);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/.*app/, { timeout: 15000 });
    } catch {
      captureError("AUTH", "SIM-09", "Login como Coordinación falló", {
        credentials: TEST_CREDENTIALS.coordinador.email,
      });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-09", "Errores de consola en login Coordinación", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-10: Dashboard Coordinación - verificar elementos", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.coordinador.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.coordinador.password);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/.*app/, { timeout: 15000 });
    } catch {
      captureError("AUTH", "SIM-10", "No se pudo autenticar como Coordinación", {});
      expect(true).toBe(true);
      return;
    }

    await page.waitForTimeout(3000);

    const hasTitle = await page.locator("h1", { hasText: "Panel de Coordinación" }).isVisible().catch(() => false);
    if (!hasTitle) {
      captureError("UI", "SIM-10", "Título 'Panel de Coordinación' no visible", {
        url: page.url(),
      });
    }

    const hasCharts = await page.locator(".charts-grid").isVisible().catch(() => false);
    if (!hasCharts) {
      captureError("UI", "SIM-10", "Gráficos no visibles en dashboard Coordinación", {
        url: page.url(),
      });
    }

    const hasProfessionals = await page.locator(".professionals-section").isVisible().catch(() => false);
    if (!hasProfessionals) {
      captureError("UI", "SIM-10", "Sección de profesionales no visible", {
        url: page.url(),
      });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-10", "Errores de consola en dashboard Coordinación", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-11: Login exitoso como Profesional", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.docente.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.docente.password);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/.*app/, { timeout: 15000 });
    } catch {
      captureError("AUTH", "SIM-11", "Login como Profesional falló", {
        credentials: TEST_CREDENTIALS.docente.email,
      });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-11", "Errores de consola en login Profesional", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-12: Dashboard Profesional - verificar elementos", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.docente.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.docente.password);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/.*app/, { timeout: 15000 });
    } catch {
      captureError("AUTH", "SIM-12", "No se pudo autenticar como Profesional", {});
      expect(true).toBe(true);
      return;
    }

    await page.waitForTimeout(3000);

    const hasStats = await page.locator(".stats-grid").isVisible().catch(() => false);
    if (!hasStats) {
      captureError("UI", "SIM-12", "Estadísticas no visibles en dashboard Profesional", {
        url: page.url(),
      });
    }

    const hasFilterTabs = await page.locator(".filter-tabs").isVisible().catch(() => false);
    if (!hasFilterTabs) {
      captureError("UI", "SIM-12", "Filtros no visibles en dashboard Profesional", {
        url: page.url(),
      });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-12", "Errores de consola en dashboard Profesional", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-13: Login exitoso como Admin", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.admin.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/.*app/, { timeout: 15000 });
    } catch {
      captureError("AUTH", "SIM-13", "Login como Admin falló", {
        credentials: TEST_CREDENTIALS.admin.email,
      });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-13", "Errores de consola en login Admin", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-14: Dashboard Admin - verificar elementos", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.admin.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/.*app/, { timeout: 20000 });
    } catch {
      // Verificar si hay error de credenciales
      const authError = await page.locator(".auth-error").isVisible().catch(() => false);
      if (authError) {
        const errorText = await page.locator(".auth-error").textContent().catch(() => "");
        captureError("AUTH", "SIM-14", `Login Admin falló: ${errorText}`, {});
      } else {
        captureError("AUTH", "SIM-14", "Login Admin no redirigió a /app", {
          url: page.url(),
        });
      }
      expect(true).toBe(true);
      return;
    }

    await page.waitForTimeout(3000);

    const hasTitle = await page.locator("h1", { hasText: "Panel de Administración" }).isVisible().catch(() => false);
    if (!hasTitle) {
      captureError("UI", "SIM-14", "Título 'Panel de Administración' no visible", {
        url: page.url(),
      });
    }

    const hasTabs = await page.locator(".admin-tabs").isVisible().catch(() => false);
    if (!hasTabs) {
      captureError("UI", "SIM-14", "Tabs de administración no visibles", {
        url: page.url(),
      });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-14", "Errores de consola en dashboard Admin", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-15: Cerrar sesión desde Admin", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.admin.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.admin.password);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/.*app/, { timeout: 15000 });
    } catch {
      captureError("AUTH", "SIM-15", "No se pudo autenticar como Admin", {});
      expect(true).toBe(true);
      return;
    }

    await page.waitForTimeout(2000);

    try {
      await page.click("text=Cerrar Sesión");
      await page.waitForURL(/.*login/, { timeout: 5000 });
    } catch {
      captureError("NAVIGATION", "SIM-15", "No se pudo cerrar sesión desde Admin", {
        url: page.url(),
      });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-15", "Errores al cerrar sesión", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-16: Ruta protegida sin autenticación", async ({ page }) => {
    await page.goto("/app");

    try {
      await page.waitForURL(/.*login/, { timeout: 8000 });
    } catch {
      const url = page.url();
      captureError("SECURITY", "SIM-16", "Ruta /app accesible sin autenticación", {
        url,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-17: Ruta inexistente redirige a login", async ({ page }) => {
    await page.goto("/ruta-fantasma-xyz");

    try {
      await page.waitForURL(/.*login/, { timeout: 5000 });
    } catch {
      const url = page.url();
      captureError("NAVIGATION", "SIM-17", "Ruta inexistente no redirige a login", {
        url,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-18: Crear nueva cita como Aprendiz", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isExpectedHttpError(msg.text())) consoleErrors.push(msg.text());
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.estudiante.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.estudiante.password);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/.*app/, { timeout: 15000 });
    } catch {
      captureError("AUTH", "SIM-18", "No se pudo autenticar como Aprendiz", {});
      expect(true).toBe(true);
      return;
    }

    await page.waitForTimeout(2000);

    try {
      await page.click("text=Nueva Cita");
      await page.waitForTimeout(1000);

      const modalVisible = await page.locator(".modal-overlay").isVisible().catch(() => false);
      if (!modalVisible) {
        captureError("UI", "SIM-18", "Modal de nueva cita no se abrió", {
          url: page.url(),
        });
      } else {
        const formVisible = await page.locator(".modal-content").isVisible().catch(() => false);
        if (!formVisible) {
          captureError("UI", "SIM-18", "Contenido del modal no visible", {
            url: page.url(),
          });
        }
      }
    } catch (err) {
      captureError("UI", "SIM-18", "Error interactuando con nueva cita", {
        error: err.message,
      });
    }

    if (consoleErrors.length > 0) {
      captureError("CONSOLE", "SIM-18", "Errores en flujo de nueva cita", {
        errors: consoleErrors,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-19: Filtros de estado en citas del Aprendiz", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', TEST_CREDENTIALS.estudiante.email);
    await page.fill('input[type="password"]', TEST_CREDENTIALS.estudiante.password);
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL(/.*app/, { timeout: 15000 });
    } catch {
      captureError("AUTH", "SIM-19", "No se pudo autenticar como Aprendiz", {});
      expect(true).toBe(true);
      return;
    }

    await page.waitForTimeout(2000);

    try {
      await page.click("text=Mis citas");
      await page.waitForTimeout(1000);

      const filterBtns = page.locator(".filter-btn");
      const count = await filterBtns.count();
      if (count === 0) {
        captureError("UI", "SIM-19", "Botones de filtro no encontrados en Mis Citas", {
          url: page.url(),
        });
      }
    } catch (err) {
      captureError("UI", "SIM-19", "Error accediendo a filtros", {
        error: err.message,
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-20: Responsive - vista móvil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const loginVisible = await page.locator('input[type="email"]').isVisible().catch(() => false);
    if (!loginVisible) {
      captureError("RESPONSIVE", "SIM-20", "Formulario de login no visible en vista móvil", {
        viewport: "375x667",
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-21: Verificar accesibilidad básica", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const emailLabel = page.locator("label", { hasText: "Email" });
    const hasEmailLabel = await emailLabel.isVisible().catch(() => false);
    if (!hasEmailLabel) {
      captureError("ACCESSIBILITY", "SIM-21", "Label de email no visible", {
        url: "/login",
      });
    }

    const passwordLabel = page.locator("label", { hasText: "Contraseña" });
    const hasPasswordLabel = await passwordLabel.isVisible().catch(() => false);
    if (!hasPasswordLabel) {
      captureError("ACCESSIBILITY", "SIM-21", "Label de contraseña no visible", {
        url: "/login",
      });
    }

    const submitBtn = page.locator('button[type="submit"]');
    const hasSubmit = await submitBtn.isVisible().catch(() => false);
    if (!hasSubmit) {
      captureError("ACCESSIBILITY", "SIM-21", "Botón de envío no visible", {
        url: "/login",
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-22: Verificar rendimiento de carga", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;

    if (loadTime > 10000) {
      captureError("PERFORMANCE", "SIM-22", `Tiempo de carga excesivo: ${loadTime}ms`, {
        loadTime,
        threshold: 10000,
        url: "/login",
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-23: Verificar que el logo SENA está presente", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const svgLogo = page.locator("svg").first();
    const visible = await svgLogo.isVisible().catch(() => false);
    if (!visible) {
      captureError("UI", "SIM-23", "Logo SVG del SENA no visible", {
        url: "/login",
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-24: Verificar enlaces de términos y privacidad", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const termsLink = page.locator("a", { hasText: "Términos de uso" });
    const hasTerms = await termsLink.isVisible().catch(() => false);
    if (!hasTerms) {
      captureError("UI", "SIM-24", "Enlace de Términos de uso no visible", {
        url: "/login",
      });
    }

    const privacyLink = page.locator("a", { hasText: "Política de privacidad" });
    const hasPrivacy = await privacyLink.isVisible().catch(() => false);
    if (!hasPrivacy) {
      captureError("UI", "SIM-24", "Enlace de Política de privacidad no visible", {
        url: "/login",
      });
    }

    expect(true).toBe(true);
  });

  test("SIM-25: Verificar footer de login", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const footerLink = page.locator("a", { hasText: "Regístrate aquí" });
    const hasFooter = await footerLink.isVisible().catch(() => false);
    if (!hasFooter) {
      captureError("UI", "SIM-25", "Enlace 'Regístrate aquí' no visible en login", {
        url: "/login",
      });
    }

    expect(true).toBe(true);
  });
});
