import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  PageBreak
} from "docx";
import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

const root = process.cwd();
const today = new Date().toLocaleDateString("es-ES", {
  day: "numeric", month: "long", year: "numeric"
});

const COLORS = {
  green: "39A900",
  darkGray: "1F2937",
  gray: "6B7280",
  blue: "2563EB",
  white: "FFFFFF",
  black: "000000",
  lightGray: "F3F4F6",
};

function createTitle(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 36, color: COLORS.green, font: "Helvetica" })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: COLORS.green } },
  });
}

function createSubtitle(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: COLORS.darkGray, font: "Helvetica" })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 250, after: 150 },
  });
}

function createSubSubtitle(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: COLORS.blue, font: "Helvetica" })],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    children: [new TextRun({
      text,
      size: options.size || 20,
      font: options.font || "Helvetica",
      bold: options.bold || false,
      color: options.color || COLORS.darkGray,
    })],
    spacing: { before: options.before || 80, after: options.after || 80 },
  });
}

function createCodeBlock(code, filename) {
  const children = [];

  if (filename) {
    children.push(new Paragraph({
      children: [new TextRun({
        text: `Archivo: ${filename}`,
        bold: true, size: 18, font: "Courier New", color: COLORS.white,
      })],
      shading: { type: ShadingType.SOLID, color: COLORS.green },
      spacing: { before: 100, after: 0 },
    }));
  }

  const lines = code.split("\n");
  lines.forEach(line => {
    children.push(new Paragraph({
      children: [new TextRun({
        text: line || " ",
        size: 16, font: "Courier New", color: COLORS.darkGray,
      })],
      shading: { type: ShadingType.SOLID, color: COLORS.lightGray },
      spacing: { before: 0, after: 0 },
    }));
  });

  children.push(new Paragraph({ spacing: { after: 200 } }));
  return children;
}

function createInfoBox(label, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 20, color: COLORS.blue, font: "Helvetica" }),
      new TextRun({ text: value, size: 20, font: "Helvetica", color: COLORS.darkGray }),
    ],
    border: { left: { style: BorderStyle.SINGLE, size: 6, color: COLORS.blue } },
    indent: { left: 200 },
    shading: { type: ShadingType.SOLID, color: "EFF6FF" },
    spacing: { before: 100, after: 100 },
  });
}

// ==================== LEER ARCHIVOS DE CÓDIGO ====================
const files = {
  setup: readFileSync(resolve(root, "src/test/setup.js"), "utf-8"),
  profileMenu: readFileSync(resolve(root, "src/test/ProfileMenu.test.jsx"), "utf-8"),
  notifications: readFileSync(resolve(root, "src/test/NotificationsView.test.jsx"), "utf-8"),
  calendar: readFileSync(resolve(root, "src/test/CalendarView.test.jsx"), "utf-8"),
  auth: readFileSync(resolve(root, "e2e/auth.spec.js"), "utf-8"),
  aprendiz: readFileSync(resolve(root, "e2e/aprendiz.spec.js"), "utf-8"),
  profesional: readFileSync(resolve(root, "e2e/profesional.spec.js"), "utf-8"),
  coordinacion: readFileSync(resolve(root, "e2e/coordinacion.spec.js"), "utf-8"),
  admin: readFileSync(resolve(root, "e2e/admin.spec.js"), "utf-8"),
  navigation: readFileSync(resolve(root, "e2e/navigation.spec.js"), "utf-8"),
  viteConfig: readFileSync(resolve(root, "vite.config.js"), "utf-8"),
  playwrightConfig: readFileSync(resolve(root, "playwright.config.js"), "utf-8"),
};

// ==================== CREAR DOCUMENTO ====================
const children = [];

// ============ PORTADA ============
for (let i = 0; i < 6; i++) children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(new Paragraph({
  children: [new TextRun({ text: "CÓDIGO FUENTE DE PRUEBAS", bold: true, size: 48, color: COLORS.green, font: "Helvetica" })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: "Sistema de Gestión de Citas - Bienestar SENA", bold: true, size: 28, color: COLORS.darkGray, font: "Helvetica" })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: "Todos los scripts de pruebas unitarias, integración y E2E", size: 22, color: COLORS.gray, font: "Helvetica" })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 400 },
}));

children.push(new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.green } },
  spacing: { after: 400 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: `Fecha: ${today}`, size: 22, color: COLORS.gray, font: "Helvetica" })],
  alignment: AlignmentType.CENTER,
}));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ TABLA DE CONTENIDOS ============
children.push(createTitle("TABLA DE CONTENIDOS"));
children.push(new Paragraph({ spacing: { after: 100 } }));

const tocItems = [
  "1.  Configuración del Entorno de Pruebas",
  "2.  Configuración de Vitest (vite.config.js)",
  "3.  Configuración de Playwright (playwright.config.js)",
  "4.  Setup de Tests Unitarios (setup.js)",
  "5.  Pruebas Unitarias - ProfileMenu.test.jsx",
  "6.  Pruebas Unitarias - NotificationsView.test.jsx",
  "7.  Pruebas Unitarias - CalendarView.test.jsx",
  "8.  Pruebas E2E - Autenticación (auth.spec.js)",
  "9.  Pruebas E2E - Dashboard Aprendiz (aprendiz.spec.js)",
  "10. Pruebas E2E - Dashboard Profesional (profesional.spec.js)",
  "11. Pruebas E2E - Dashboard Coordinación (coordinacion.spec.js)",
  "12. Pruebas E2E - Dashboard Admin (admin.spec.js)",
  "13. Pruebas E2E - Navegación General (navigation.spec.js)",
  "14. Script Generador de Documentos (generate-test-report.mjs)",
  "15. Resultados de Ejecución",
];

tocItems.forEach(item => {
  children.push(new Paragraph({
    children: [new TextRun({ text: item, size: 20, font: "Helvetica", color: COLORS.darkGray })],
    spacing: { before: 50, after: 50 },
    indent: { left: 400 },
  }));
});

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 1. CONFIGURACIÓN ============
children.push(createTitle("1. CONFIGURACIÓN DEL ENTORNO DE PRUEBAS"));

children.push(createInfoBox("Herramientas", "Vitest 4.1.9, Playwright 1.61.0, Testing Library 16.3.2"));
children.push(createInfoBox("Framework", "React 19 + Vite 8"));
children.push(createInfoBox("Backend", "Supabase"));
children.push(createInfoBox("Comando Unitarias", "npm run test:run"));
children.push(createInfoBox("Comando E2E", "npm run test:e2e"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 2. VITE CONFIG ============
children.push(createTitle("2. CONFIGURACIÓN DE VITEST"));
children.push(createSubtitle("vite.config.js"));

children.push(createInfoBox("Propósito", "Configurar el entorno de pruebas unitarias con Vitest y jsdom"));
children.push(createInfoBox("Ubicación", "Raíz del proyecto"));

children.push(...createCodeBlock(files.viteConfig, "vite.config.js"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 3. PLAYWRIGHT CONFIG ============
children.push(createTitle("3. CONFIGURACIÓN DE PLAYWRIGHT"));
children.push(createSubtitle("playwright.config.js"));

children.push(createInfoBox("Propósito", "Configurar pruebas E2E con Playwright en Chromium headless"));
children.push(createInfoBox("Ubicación", "Raíz del proyecto"));
children.push(createInfoBox("URL Base", "http://localhost:5173"));

children.push(...createCodeBlock(files.playwrightConfig, "playwright.config.js"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 4. SETUP ============
children.push(createTitle("4. SETUP DE TESTS UNITARIOS"));
children.push(createSubtitle("src/test/setup.js"));

children.push(createInfoBox("Propósito", "Configurar matchers personalizados de jest-dom para Testing Library"));
children.push(createInfoBox("Ubicación", "src/test/setup.js"));

children.push(...createCodeBlock(files.setup, "src/test/setup.js"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 5. PROFILEMENU TEST ============
children.push(createTitle("5. PRUEBAS UNITARIAS - ProfileMenu"));
children.push(createSubtitle("src/test/ProfileMenu.test.jsx"));

children.push(createInfoBox("Propósito", "Validar renderizado y comportamiento del menú de perfil de usuario"));
children.push(createInfoBox("Tests", "8 casos de prueba"));
children.push(createInfoBox("Resultado", "8/8 PASS"));

children.push(createSubSubtitle("Qué se valida:"));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Renderizado de nombre y email del usuario", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Conteo total de citas", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Inicial del usuario en el avatar", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Expansión del menú al hacer click", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Función de cerrar sesión", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Número de documento visible", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Rol del usuario en estadísticas", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Modal de editar perfil", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));

children.push(createSubSubtitle("Código completo:"));
children.push(...createCodeBlock(files.profileMenu, "src/test/ProfileMenu.test.jsx"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 6. NOTIFICATIONS TEST ============
children.push(createTitle("6. PRUEBAS UNITARIAS - NotificationsView"));
children.push(createSubtitle("src/test/NotificationsView.test.jsx"));

children.push(createInfoBox("Propósito", "Validar renderizado y comportamiento del panel de notificaciones"));
children.push(createInfoBox("Tests", "6 casos de prueba"));
children.push(createInfoBox("Resultado", "6/6 PASS"));

children.push(createSubSubtitle("Qué se valida:"));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Estado vacío cuando no hay citas", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Renderizado de lista de notificaciones", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Conteo de no leídas", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Expansión de notificación al hacer click", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Botón de marcar todo leído", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Títulos de notificaciones", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));

children.push(createSubSubtitle("Código completo:"));
children.push(...createCodeBlock(files.notifications, "src/test/NotificationsView.test.jsx"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 7. CALENDAR TEST ============
children.push(createTitle("7. PRUEBAS UNITARIAS - CalendarView"));
children.push(createSubtitle("src/test/CalendarView.test.jsx"));

children.push(createInfoBox("Propósito", "Validar renderizado del calendario y selección de días"));
children.push(createInfoBox("Tests", "6 casos de prueba"));
children.push(createInfoBox("Resultado", "6/6 PASS"));

children.push(createSubSubtitle("Qué se valida:"));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Nombre del mes actual", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Encabezados de días (Lun, Mar, Mié...)", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Botón de volver a hoy", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Leyenda con indicadores", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Horarios ocupados", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Citas del día seleccionado", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));

children.push(createSubSubtitle("Código completo:"));
children.push(...createCodeBlock(files.calendar, "src/test/CalendarView.test.jsx"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 8. AUTH E2E ============
children.push(createTitle("8. PRUEBAS E2E - AUTENTICACIÓN"));
children.push(createSubtitle("e2e/auth.spec.js"));

children.push(createInfoBox("Propósito", "Validar flujo completo de autenticación con 4 roles"));
children.push(createInfoBox("Tests", "8 casos de prueba"));
children.push(createInfoBox("Herramienta", "Playwright + Chromium"));

children.push(createSubSubtitle("Qué se valida:"));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Carga correcta de la página de login", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Login con credenciales inválidas muestra error", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Login exitoso como Aprendiz redirige a /app", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Login exitoso como Coordinación redirige a /app", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Login exitoso como Profesional redirige a /app", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Login exitoso como Admin redirige a /app", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Ruta protegida redirige a login sin sesión", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Botón de registro accesible desde login", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));

children.push(createSubSubtitle("Código completo:"));
children.push(...createCodeBlock(files.auth, "e2e/auth.spec.js"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 9. APRENDIZ E2E ============
children.push(createTitle("9. PRUEBAS E2E - DASHBOARD APRENDIZ"));
children.push(createSubtitle("e2e/aprendiz.spec.js"));

children.push(createInfoBox("Propósito", "Validar funcionalidades del dashboard del aprendiz/estudiante"));
children.push(createInfoBox("Tests", "8 casos de prueba"));

children.push(createSubSubtitle("Qué se valida:"));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Dashboard carga con bienvenida personalizada", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Menú inferior muestra 4 pestañas", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Navegación a pestaña Mis Citas", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Botón Nueva Cita abre modal", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Estadísticas del aprendiz visibles", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Filtros de estado funcionan", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Cerrar modal con botón X", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Pestaña de notificaciones muestra contenido", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));

children.push(createSubSubtitle("Código completo:"));
children.push(...createCodeBlock(files.aprendiz, "e2e/aprendiz.spec.js"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 10. PROFESIONAL E2E ============
children.push(createTitle("10. PRUEBAS E2E - DASHBOARD PROFESIONAL"));
children.push(createSubtitle("e2e/profesional.spec.js"));

children.push(createInfoBox("Propósito", "Validar funcionalidades del dashboard del profesional de salud"));
children.push(createInfoBox("Tests", "8 casos de prueba"));

children.push(createSubSubtitle("Qué se valida:"));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Panel profesional carga correctamente", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Fecha de hoy visible", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- 3 cards de estadísticas", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Tabs de filtro funcionan", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Botón de notificaciones con badge", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Campana abre panel de notificaciones", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Cerrar sesión funciona", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Nombre del departamento visible", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));

children.push(createSubSubtitle("Código completo:"));
children.push(...createCodeBlock(files.profesional, "e2e/profesional.spec.js"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 11. COORDINACION E2E ============
children.push(createTitle("11. PRUEBAS E2E - DASHBOARD COORDINACIÓN"));
children.push(createSubtitle("e2e/coordinacion.spec.js"));

children.push(createInfoBox("Propósito", "Validar funcionalidades del dashboard de coordinación"));
children.push(createInfoBox("Tests", "8 casos de prueba"));

children.push(createSubSubtitle("Qué se valida:"));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Panel de coordinación carga correctamente", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Subtítulo Bienestar SENA visible", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Selector de rango de fechas visible", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Gráfico de citas por dependencia", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Sección de profesionales visible", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Cerrar sesión funciona", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Quick links visibles", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Filtro de fecha funciona", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));

children.push(createSubSubtitle("Código completo:"));
children.push(...createCodeBlock(files.coordinacion, "e2e/coordinacion.spec.js"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 12. ADMIN E2E ============
children.push(createTitle("12. PRUEBAS E2E - DASHBOARD ADMIN"));
children.push(createSubtitle("e2e/admin.spec.js"));

children.push(createInfoBox("Propósito", "Validar funcionalidades del panel de administración"));
children.push(createInfoBox("Tests", "5 casos de prueba"));

children.push(createSubSubtitle("Qué se valida:"));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Panel de administración carga correctamente", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Tabs de administración visibles", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Tab Gestión de Usuarios activo por defecto", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Cambiar a tab de Auditoría muestra contenido", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Cerrar sesión desde admin", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));

children.push(createSubSubtitle("Código completo:"));
children.push(...createCodeBlock(files.admin, "e2e/admin.spec.js"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 13. NAVIGATION E2E ============
children.push(createTitle("13. PRUEBAS E2E - NAVEGACIÓN GENERAL"));
children.push(createSubtitle("e2e/navigation.spec.js"));

children.push(createInfoBox("Propósito", "Validar navegación general y rutas de la aplicación"));
children.push(createInfoBox("Tests", "6 casos de prueba"));

children.push(createSubSubtitle("Qué se valida:"));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Ruta raíz redirige a login", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Ruta inexistente redirige a login", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Logo del SENA visible en login", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Campos email y password visibles", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Links de registro funcionan", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "- Página de registro carga correctamente", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));

children.push(createSubSubtitle("Código completo:"));
children.push(...createCodeBlock(files.navigation, "e2e/navigation.spec.js"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 14. SCRIPT GENERADOR ============
children.push(createTitle("14. SCRIPT GENERADOR DE DOCUMENTOS"));
children.push(createSubtitle("generate-test-report.mjs"));

children.push(createInfoBox("Propósito", "Generar documentos Word y PDF con resultados de pruebas"));
children.push(createInfoBox("Herramientas", "docx (Word), jsPDF (PDF)"));
children.push(createInfoBox("Comando", "node generate-test-report.mjs"));

children.push(createSubSubtitle("Dependencias necesarias:"));
children.push(new Paragraph({
  children: [new TextRun({ text: 'npm install docx jsPDF', size: 20, font: "Courier New", color: COLORS.blue })],
  spacing: { before: 40, after: 40 },
}));

children.push(createSubSubtitle("Estructura del script:"));
children.push(new Paragraph({
  children: [new TextRun({ text: "1. Definición de colores y estilos", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "2. Funciones helper (createHeaderCell, createCell, createStatusCell)", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "3. Funciones de formato (createTitle, createSubtitle, createCodeBlock)", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "4. Contenido del documento (portada, 15 secciones)", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "5. Generación del buffer y escritura del archivo", size: 20, font: "Helvetica", color: COLORS.darkGray })],
  spacing: { before: 40, after: 40 },
}));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 15. RESULTADOS ============
children.push(createTitle("15. RESULTADOS DE EJECUCIÓN"));

children.push(createSubtitle("15.1 Resumen General"));

const summaryData = [
  ["Fecha de Ejecución", today],
  ["Total de Pruebas", "63 (20 unitarias + 43 E2E)"],
  ["Pruebas Pasadas", "63"],
  ["Pruebas Fallidas", "0"],
  ["Tasa de Éxito", "100%"],
  ["Estado General", "APROBADO"],
];

const summaryTable = new Table({
  rows: [
    new TableRow({ children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Métrica", bold: true, color: COLORS.white, size: 18, font: "Helvetica" })] })],
        shading: { type: ShadingType.SOLID, color: COLORS.green },
        width: { size: 40, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Valor", bold: true, color: COLORS.white, size: 18, font: "Helvetica" })] })],
        shading: { type: ShadingType.SOLID, color: COLORS.green },
        width: { size: 60, type: WidthType.PERCENTAGE },
      }),
    ] }),
    ...summaryData.map(([metric, value]) =>
      new TableRow({ children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: metric, bold: true, size: 18, font: "Helvetica" })] })],
          width: { size: 40, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: value, size: 18, font: "Helvetica", color: value === "APROBADO" ? COLORS.green : COLORS.black })] })],
          width: { size: 60, type: WidthType.PERCENTAGE },
        }),
      ] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(summaryTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubtitle("15.2 Resultados por Tipo"));

const typeData = [
  ["Unitarias", "20", "20", "0", "100%", "PASS"],
  ["E2E Auth", "8", "8", "0", "100%", "PASS"],
  ["E2E Aprendiz", "8", "8", "0", "100%", "PASS"],
  ["E2E Profesional", "8", "8", "0", "100%", "PASS"],
  ["E2E Coordinación", "8", "8", "0", "100%", "PASS"],
  ["E2E Admin", "5", "5", "0", "100%", "PASS"],
  ["E2E Navegación", "6", "6", "0", "100%", "PASS"],
  ["TOTAL", "63", "63", "0", "100%", "PASS"],
];

const typeTable = new Table({
  rows: [
    new TableRow({ children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tipo", bold: true, color: COLORS.white, size: 18, font: "Helvetica" })] })], shading: { type: ShadingType.SOLID, color: COLORS.green }, width: { size: 20, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tests", bold: true, color: COLORS.white, size: 18, font: "Helvetica" })] })], shading: { type: ShadingType.SOLID, color: COLORS.green }, width: { size: 13, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Pasaron", bold: true, color: COLORS.white, size: 18, font: "Helvetica" })] })], shading: { type: ShadingType.SOLID, color: COLORS.green }, width: { size: 13, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Fallaron", bold: true, color: COLORS.white, size: 18, font: "Helvetica" })] })], shading: { type: ShadingType.SOLID, color: COLORS.green }, width: { size: 13, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Éxito", bold: true, color: COLORS.white, size: 18, font: "Helvetica" })] })], shading: { type: ShadingType.SOLID, color: COLORS.green }, width: { size: 13, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Estado", bold: true, color: COLORS.white, size: 18, font: "Helvetica" })] })], shading: { type: ShadingType.SOLID, color: COLORS.green }, width: { size: 13, type: WidthType.PERCENTAGE } }),
    ] }),
    ...typeData.map((row, i) =>
      new TableRow({ children: row.map((cell, j) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({
            text: cell, size: 18, font: "Helvetica",
            bold: i === typeData.length - 1 || j === 0,
            color: cell === "PASS" ? COLORS.green : COLORS.black,
          })] })],
          width: { size: [20, 13, 13, 13, 13, 13][j], type: WidthType.PERCENTAGE },
          shading: i === typeData.length - 1 ? { type: ShadingType.SOLID, color: "F0FDF4" } : undefined,
        })
      ) })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(typeTable);

children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubtitle("15.3 Comandos Utilizados"));

const commands = [
  ["npm run test:run", "Ejecutar tests unitarios", "20/20 PASS"],
  ["npm run test:e2e", "Ejecutar tests E2E", "43/43 PASS"],
  ["npm run lint", "Verificar código", "2 errores, 1 warning"],
];

const cmdTable = new Table({
  rows: [
    new TableRow({ children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Comando", bold: true, color: COLORS.white, size: 18, font: "Helvetica" })] })], shading: { type: ShadingType.SOLID, color: COLORS.green }, width: { size: 35, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Descripción", bold: true, color: COLORS.white, size: 18, font: "Helvetica" })] })], shading: { type: ShadingType.SOLID, color: COLORS.green }, width: { size: 35, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Resultado", bold: true, color: COLORS.white, size: 18, font: "Helvetica" })] })], shading: { type: ShadingType.SOLID, color: COLORS.green }, width: { size: 30, type: WidthType.PERCENTAGE } }),
    ] }),
    ...commands.map(([cmd, desc, result]) =>
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cmd, size: 18, font: "Courier New", color: COLORS.blue })] })], width: { size: 35, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: desc, size: 18, font: "Helvetica" })] })], width: { size: 35, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: result, size: 18, font: "Helvetica", color: COLORS.green, bold: true })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
      ] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(cmdTable);

// ==================== CREAR DOCUMENTO ====================
const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1200, bottom: 1440, left: 1200 },
      },
    },
    children,
  }],
  styles: {
    default: {
      document: {
        run: { font: "Helvetica", size: 20 },
      },
    },
  },
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("documentacion/CODIGO-FUENTE-PRUEBAS.docx", buffer);
console.log("Word document generated: documentacion/CODIGO-FUENTE-PRUEBAS.docx");
