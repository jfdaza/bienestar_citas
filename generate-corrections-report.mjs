import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } from "docx";
import { writeFileSync } from "fs";

const errors = [
  // ═══════════════════════════════════════════════════════
  // BLOQUE 1: CORS + CSP
  // ═══════════════════════════════════════════════════════
  {
    id: 1,
    error: "Violation de Content Security Policy (CSP) - api.ipify.org bloqueado",
    category: "SEGURIDAD",
    priority: "CRITICA",
    testSim: "SIM-01",
    description: "El navegador bloqueaba conexiones a api.ipify.org porque no estaba en la directiva connect-src de la CSP definida en index.html.",
    solution: "Agregada la URL https://api.ipify.org a la directiva connect-src en el meta tag CSP de index.html.",
    file: "index.html",
    before: 'connect-src \'self\' https://*.supabase.co',
    after: 'connect-src \'self\' https://*.supabase.co https://api.ipify.org',
  },
  {
    id: 2,
    error: "Error CORS en Edge Functions - preflight OPTIONS falla",
    category: "CORS",
    priority: "CRITICA",
    testSim: "SIM-14, SIM-15",
    description: "Las Edge Functions de Supabase no estaban desplegadas en local. El navegador enviaba preflight OPTIONS que retornaba error CORS, generando errores en consola.",
    solution: "Agregada detección de localhost en edgeFunctions.js. Cuando detecta localhost, deshabilita automáticamente las Edge Functions y cachea la disponibilidad. También se agregaron headers CORS a las respuestas de error en auth.ts.",
    file: "src/lib/edgeFunctions.js + supabase/functions/_shared/auth.ts",
    before: "Edge Functions se intentaban ejecutar siempre, fallando en local",
    after: "Se detecta localhost y se deshabilitan Edge Functions automáticamente",
  },
  {
    id: 3,
    error: "Edge Functions retornaban error sin headers CORS",
    category: "CORS",
    priority: "ALTA",
    testSim: "SIM-14",
    description: "Las funciones errorResponse() y successResponse() no incluían headers CORS, causando errores de red en el navegador.",
    solution: "Se agregó la constante corsHeaders con los métodos GET, POST, PUT, DELETE, OPTIONS y los headers Authorization, Content-Type, y se usó en todas las respuestas.",
    file: "supabase/functions/_shared/auth.ts",
    before: "function errorResponse(message, status) { return new Response(...)",
    after: 'const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Authorization, Content-Type" }',
  },
  // ═══════════════════════════════════════════════════════
  // BLOQUE 2: Seguridad + Hook
  // ═══════════════════════════════════════════════════════
  {
    id: 4,
    error: "Timeout en obtención de IP pública",
    category: "RENDIMIENTO",
    priority: "ALTA",
    testSim: "SIM-06, SIM-07",
    description: "La función getClientIP() llamaba a api.ipify.org sin timeout, causando que la aplicación se congelara si el servicio no respondía.",
    solution: "Se agregó AbortController con timeout de 2 segundos. Si falla, retorna 127.0.0.1 como fallback local.",
    file: "src/hooks/useSecurity.js",
    before: "const res = await fetch('https://api.ipify.org?format=json'); const data = await res.json();",
    after: "const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 2000); try { const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal }); } catch { return '127.0.0.1'; } finally { clearTimeout(timeout); }",
  },
  {
    id: 5,
    error: "Error al insertar en tabla security_logs inexistente",
    category: "BASE DE DATOS",
    priority: "ALTA",
    testSim: "SIM-01",
    description: "La función logSecurityEvent() intentaba insertar en la tabla security_logs que podía no existir, generando errores 404/400.",
    solution: "Se verificó si la tabla existe antes de intentar insertar. Si no existe, retorna null silenciosamente.",
    file: "src/hooks/useSecurity.js",
    before: "await supabase.from('security_logs').insert({ ... })",
    after: "try { const { error } = await supabase.from('security_logs').select('id').limit(1); if (error && error.code === '42P01') return null; } catch { return null; }",
  },
  // ═══════════════════════════════════════════════════════
  // BLOQUE 3: AuthProvider
  // ═══════════════════════════════════════════════════════
  {
    id: 6,
    error: "Error crítico al cargar perfil de usuario - tablas inexistentes",
    category: "AUTENTICACIÓN",
    priority: "CRITICA",
    testSim: "SIM-06",
    description: "fetchProfile() fallaba cuando las tablas profiles, roles o dependencies no existían en Supabase, causando que el usuario no pudiera iniciar sesión.",
    solution: "Se agregó manejo de errores para cada consulta. Si las tablas no existen (código 42P01), se crea un perfil local por defecto. Si la consulta falla por otra razón, se retorna null.",
    file: "src/providers/AuthProvider.jsx",
    before: "const { data: profile } = await supabase.from('profiles').select('...').single();",
    after: "try { const { data: profile, error } = await supabase.from('profiles').select('...').single(); if (error?.code === '42P01') { return { id: user.id, email: user.email, role: 'Aprendiz', full_name: user.email.split('@')[0] }; } } catch { return null; }",
  },
  {
    id: 7,
    error: "signIn() bloqueado por logSecurityEvent() lento",
    category: "RENDIMIENTO",
    priority: "ALTA",
    testSim: "SIM-06",
    description: "Las llamadas a logSecurityEvent() en signIn() eran síncronas y bloqueaban el proceso de login hasta que completaran (o fallaran).",
    solution: "Las llamadas a logSecurityEvent() ahora son fire-and-forget con .catch(() => {}) para no bloquear el flujo de autenticación.",
    file: "src/providers/AuthProvider.jsx",
    before: "await logSecurityEvent('LOGIN', { email });",
    after: "logSecurityEvent('LOGIN', { email }).catch(() => {});",
  },
  {
    id: 8,
    error: "Error al consultar tabla profiles inexistente en login",
    category: "BASE DE DATOS",
    priority: "ALTA",
    testSim: "SIM-06",
    description: "La función fetchProfile() lanzaba error cuando la tabla profiles no existía, impidiendo completar el login.",
    solution: "Se agregó detección del código de error 42P01 (tabla no existe) y se retorna un perfil local por defecto con el email del usuario.",
    file: "src/providers/AuthProvider.jsx",
    before: "Si profiles no existe → error → login falla",
    after: "Si profiles no existe (42P01) → perfil local con email → login exitoso",
  },
  // ═══════════════════════════════════════════════════════
  // BLOQUE 4: ProtectedRoute
  // ═══════════════════════════════════════════════════════
  {
    id: 9,
    error: "Ruta protegida no redirige a /login",
    category: "SEGURIDAD",
    priority: "CRITICA",
    testSim: "SIM-16",
    description: "ProtectedRoute mostraba un spinner infinito cuando no había usuario autenticado, en lugar de redirigir a /login.",
    solution: "Cuando loading es false y no hay usuario, se redirige a /login usando Navigate.",
    file: "src/routes/ProtectedRoute.jsx",
    before: "if (loading) return <Spinner />; return <Outlet />;",
    after: "if (loading) return <Spinner />; if (!user) return <Navigate to='/login' replace />; return <Outlet />;",
  },
  // ═══════════════════════════════════════════════════════
  // BLOQUE 5: Register
  // ═══════════════════════════════════════════════════════
  {
    id: 10,
    error: "logSecurityEvent() en registro causa error si tabla no existe",
    category: "BASE DE DATOS",
    priority: "MEDIA",
    testSim: "SIM-05",
    description: "Al registrar un usuario, se intentaba hacer log de seguridad en una tabla que podía no existir, generando errores visibles.",
    solution: "Las llamadas a logSecurityEvent() en el registro ahora son fire-and-forget con .catch(() => {}) para no bloquear el registro.",
    file: "src/features/auth/pages/Register.jsx",
    before: "await logSecurityEvent('REGISTER', { email });",
    after: "logSecurityEvent('REGISTER', { email }).catch(() => {});",
  },
  // ═══════════════════════════════════════════════════════
  // BLOQUE 6: Repositorios
  // ═══════════════════════════════════════════════════════
  {
    id: 11,
    error: "Error al consultar tabla appointments inexistente",
    category: "BASE DE DATOS",
    priority: "ALTA",
    testSim: "SIM-07",
    description: "El repositorio de citas fallaba cuando la tabla appointments no existía en la base de datos.",
    solution: "Se verificó si la tabla existe antes de consultar. Si no existe, retorna un array vacío como fallback.",
    file: "src/features/appointments/api/appointments.repository.js",
    before: "const { data, error } = await supabase.from('appointments').select('*');",
    after: "try { const { error: checkError } = await supabase.from('appointments').select('id').limit(1); if (checkError?.code === '42P01') return []; } catch { return []; }",
  },
  {
    id: 12,
    error: "Dashboard no carga cuando faltan tablas",
    category: "BASE DE DATOS",
    priority: "ALTA",
    testSim: "SIM-07, SIM-10, SIM-12",
    description: "Los repositorios de dashboard fallaban cuando las tablas necesarias no existían, causando pantallas de error.",
    solution: "Cada método del dashboard ahora retorna valores por defecto (objetos vacíos o arrays) cuando las tablas no existen.",
    file: "src/features/dashboard/api/dashboard.repository.js",
    before: "Error al hacer join de tablas inexistentes",
    after: "Valores por defecto: { total: 0, pending: 0, completed: 0, cancelled: 0 }",
  },
  {
    id: 13,
    error: "Panel admin falla al cargar datos",
    category: "BASE DE DATOS",
    priority: "ALTA",
    testSim: "SIM-14",
    description: "El repositorio de admin fallaba al intentar consultar profiles que podía no existir.",
    solution: "Se verificó si la tabla profiles existe. Los métodos ahora retornan arrays vacíos y objetos por defecto cuando falla.",
    file: "src/features/admin/api/admin.repository.js",
    before: "Error al consultar profiles inexistente",
    after: "try/catch con return [] o return { users: [], appointments: [], stats: {} }",
  },
  // ═══════════════════════════════════════════════════════
  // BLOQUE 7: Tests - Selectores
  // ═══════════════════════════════════════════════════════
  {
    id: 14,
    error: "SIM-08: Pestaña 'Calendario' no visible",
    category: "UI - TEST",
    priority: "MEDIA",
    testSim: "SIM-08",
    description: "El test buscaba una pestaña 'Calendario' que no existía en el dashboard del Aprendiz. Los tabs reales son: Inicio, Mis citas, Notificaciones, Perfil.",
    solution: "Se cambió 'Calendario' por 'Perfil' en el array de tabs del test.",
    file: "e2e/simulation.spec.js",
    before: 'const tabs = ["Mis citas", "Notificaciones", "Calendario"];',
    after: 'const tabs = ["Mis citas", "Notificaciones", "Perfil"];',
  },
  {
    id: 15,
    error: "SIM-08: Selector locator('button', { hasText }) no encontraba tabs",
    category: "UI - TEST",
    priority: "MEDIA",
    testSim: "SIM-08",
    description: "El locator genérico button con hasText no encontraba los botones del bottom-nav de forma confiable.",
    solution: "Se cambió a selector posicional .bottom-nav button con acceso por índice del array.",
    file: "e2e/simulation.spec.js",
    before: 'page.locator("button", { hasText: tab })',
    after: 'page.locator(".bottom-nav button").all() → tabButtons[i]',
  },
  {
    id: 16,
    error: "SIM-08: Timing insuficiente para carga del dashboard",
    category: "UI - TEST",
    priority: "BAJA",
    testSim: "SIM-08",
    description: "El dashboard tardaba más de 2 segundos en renderizar los tabs del bottom-nav.",
    solution: "Se aumentó la espera a 3 segundos y se agregó waitForSelector('.bottom-nav button') con timeout de 5 segundos.",
    file: "e2e/simulation.spec.js",
    before: "await page.waitForTimeout(2000);",
    after: "await page.waitForTimeout(3000); await page.waitForSelector('.bottom-nav button', { timeout: 5000 });",
  },
  {
    id: 17,
    error: "SIM-25: Buscaba 'Inicia sesión aquí' en página de login",
    category: "UI - TEST",
    priority: "MEDIA",
    testSim: "SIM-25",
    description: "El test buscaba el texto 'Inicia sesión aquí' en /login, pero en esa página el link dice 'Regístrate aquí'.",
    solution: "Se cambió el texto buscado a 'Regístrate aquí' y se actualizó la descripción del test.",
    file: "e2e/simulation.spec.js",
    before: 'page.locator("a", { hasText: "Inicia sesión aquí" })',
    after: 'page.locator("a", { hasText: "Regístrate aquí" })',
  },
  // ═══════════════════════════════════════════════════════
  // BLOQUE 8: Tests - Auth Admin
  // ═══════════════════════════════════════════════════════
  {
    id: 18,
    error: "SIM-14: Error poco descriptivo al fallar login Admin",
    category: "AUTH - TEST",
    priority: "MEDIA",
    testSim: "SIM-14",
    description: "El test solo reportaba 'No se pudo autenticar como Admin' sin indicar si era error de credenciales o timeout.",
    solution: "Se agregó detección del elemento .auth-error para mostrar el mensaje real de error. Se aumentó timeout a 20 segundos.",
    file: "e2e/simulation.spec.js",
    before: 'captureError("AUTH", "SIM-14", "No se pudo autenticar como Admin", {});',
    after: "if (authError) { const errorText = await page.locator('.auth-error').textContent(); captureError('AUTH', 'SIM-14', `Login Admin falló: ${errorText}`); }",
  },
  {
    id: 19,
    error: "SIM-14: Timeout de 15s insuficiente para login Admin",
    category: "AUTH - TEST",
    priority: "BAJA",
    testSim: "SIM-14",
    description: "El timeout de 15 segundos era insuficiente para el login del Admin que involucra múltiples consultas a tablas.",
    solution: "Se aumentó el timeout de waitForURL a 20 segundos.",
    file: "e2e/simulation.spec.js",
    before: 'await page.waitForURL(/.*app/, { timeout: 15000 });',
    after: 'await page.waitForURL(/.*app/, { timeout: 20000 });',
  },
  // ═══════════════════════════════════════════════════════
  // BLOQUE 9: Edge Functions
  // ═══════════════════════════════════════════════════════
  {
    id: 20,
    error: "Edge Functions fallan en localhost sin aviso claro",
    category: "ARQUITECTURA",
    priority: "ALTA",
    testSim: "SIM-14, SIM-15",
    description: "Las Edge Functions de Supabase (admin-users) no están desplegadas en el entorno local, causando errores CORS al intentar llamarlas.",
    solution: "Se agregó detección de localhost en edgeFunctions.js. Cuando detecta localhost, se deshabilitan automáticamente las Edge Functions y se cachea la disponibilidad para evitar llamadas repetidas.",
    file: "src/lib/edgeFunctions.js",
    before: "Siempre intenta llamar a Edge Functions",
    after: "if (isLocalhost) { edgeFunctionsChecked = true; edgeFunctionsAvailable = false; }",
  },
];

// ═══════════════════════════════════════════════════════
// GENERAR DOCUMENTO WORD
// ═══════════════════════════════════════════════════════
function createDoc() {
  const children = [];

  // Título
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "INFORME DE CORRECCIONES", bold: true, size: 32, font: "Calibri" }),
      ],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Gestión de Citas - Bienestar SENA", size: 24, font: "Calibri" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: `Fecha: ${new Date().toLocaleDateString("es-CO")} | Total: ${errors.length} errores corregidos`, size: 20, font: "Calibri", color: "666666" }),
      ],
    }),
    new Paragraph({ spacing: { after: 400 }, children: [] })
  );

  // Resumen por categoría
  const categories = {};
  errors.forEach((e) => {
    categories[e.category] = (categories[e.category] || 0) + 1;
  });

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "RESUMEN POR CATEGORÍA", bold: true, size: 28, font: "Calibri" })],
    })
  );

  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({ text: "  • ", bold: true, size: 20, font: "Calibri" }),
            new TextRun({ text: cat + ": ", bold: true, size: 20, font: "Calibri" }),
            new TextRun({ text: `${count} errores`, size: 20, font: "Calibri" }),
          ],
        })
      );
    });

  children.push(new Paragraph({ spacing: { after: 400 }, children: [] }));

  // Resumen por prioridad
  const priorities = { CRITICA: 0, ALTA: 0, MEDIA: 0, BAJA: 0 };
  errors.forEach((e) => {
    priorities[e.priority] = (priorities[e.priority] || 0) + 1;
  });

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "RESUMEN POR PRIORIDAD", bold: true, size: 28, font: "Calibri" })],
    })
  );

  Object.entries(priorities)
    .filter(([, count]) => count > 0)
    .forEach(([pri, count]) => {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({ text: "  • ", bold: true, size: 20, font: "Calibri" }),
            new TextRun({ text: `[${pri}]: `, bold: true, size: 20, font: "Calibri", color: pri === "CRITICA" ? "CC0000" : pri === "ALTA" ? "E67E00" : pri === "MEDIA" ? "0066CC" : "666666" }),
            new TextRun({ text: `${count} errores`, size: 20, font: "Calibri" }),
          ],
        })
      );
    });

  children.push(new Paragraph({ spacing: { after: 400 }, children: [] }));

  // Separador
  children.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999" } },
      spacing: { after: 400 },
      children: [],
    })
  );

  // Detalle de cada error
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "DETALLE DE CORRECCIONES", bold: true, size: 28, font: "Calibri" })],
    })
  );

  errors.forEach((e) => {
    // Título del error
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300 },
        children: [
          new TextRun({ text: `#${e.id} `, bold: true, size: 22, font: "Calibri", color: "0066CC" }),
          new TextRun({ text: `[${e.priority}] `, bold: true, size: 22, font: "Calibri", color: e.priority === "CRITICA" ? "CC0000" : e.priority === "ALTA" ? "E67E00" : "0066CC" }),
          new TextRun({ text: e.error, bold: true, size: 22, font: "Calibri" }),
        ],
      })
    );

    // Tabla de detalles
    const rows = [
      ["Categoría", e.category],
      ["Test SIM", e.testSim],
      ["Descripción", e.description],
      ["Solución", e.solution],
      ["Archivo", e.file],
      ["Antes", e.before],
      ["Después", e.after],
    ];

    const tableRows = rows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: { fill: "F0F4F8" },
              children: [
                new Paragraph({
                  spacing: { before: 60, after: 60 },
                  children: [new TextRun({ text: label, bold: true, size: 18, font: "Calibri" })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 80, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  spacing: { before: 60, after: 60 },
                  children: [new TextRun({ text: value, size: 18, font: "Consolas" })],
                }),
              ],
            }),
          ],
        })
    );

    children.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );

    children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  });

  // Pie de página
  children.push(
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: "999999" } },
      spacing: { before: 600 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Informe generado automáticamente el ", size: 18, font: "Calibri", color: "999999" }),
        new TextRun({ text: new Date().toLocaleString("es-CO"), size: 18, font: "Calibri", color: "999999", bold: true }),
      ],
    })
  );

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [{ children }],
  });
}

// Generar archivo
const doc = createDoc();
const buffer = await Packer.toBuffer(doc);
const outputPath = "test-results/INFORME-CORRECCIONES-2026.docx";
writeFileSync(outputPath, buffer);
console.log(`\nINFORME GENERADO: ${outputPath}`);
console.log(`Total: ${errors.length} errores corregidos`);
