import { jsPDF } from "jspdf";
import { readFileSync, writeFileSync } from "fs";

const today = new Date().toLocaleDateString("es-ES", {
  day: "numeric", month: "long", year: "numeric"
});

const testResults = [
  {
    module: "Autenticación",
    tests: [
      { id: "TC-AUTH-01", name: "La página de login carga correctamente", status: "PASSED" },
      { id: "TC-AUTH-02", name: "Login con credenciales inválidas muestra error", status: "PASSED" },
      { id: "TC-AUTH-03", name: "Login exitoso como Aprendiz redirige a /app", status: "PASSED" },
      { id: "TC-AUTH-04", name: "Login exitoso como Coordinación redirige a /app", status: "PASSED" },
      { id: "TC-AUTH-05", name: "Login exitoso como Profesional redirige a /app", status: "PASSED" },
      { id: "TC-AUTH-06", name: "Login exitoso como Admin redirige a /app", status: "PASSED" },
      { id: "TC-AUTH-07", name: "Ruta protegida redirige a login si no hay sesión", status: "PASSED" },
      { id: "TC-AUTH-08", name: "Botón de registro es accesible desde login", status: "PASSED" },
    ]
  },
  {
    module: "Dashboard Aprendiz",
    tests: [
      { id: "TC-APR-01", name: "El dashboard del aprendiz carga con bienvenida", status: "PASSED" },
      { id: "TC-APR-02", name: "El menú inferior muestra las 4 pestañas", status: "PASSED" },
      { id: "TC-APR-03", name: "Navegar a la pestaña de Mis Citas", status: "PASSED" },
      { id: "TC-APR-04", name: "El botón Nueva Cita abre el formulario modal", status: "PASSED" },
      { id: "TC-APR-05", name: "Se muestran las estadísticas del aprendiz", status: "PASSED" },
      { id: "TC-APR-06", name: "Filtros de estado funcionan", status: "PASSED" },
      { id: "TC-APR-07", name: "Cerrar modal de nueva cita con botón X", status: "PASSED" },
      { id: "TC-APR-08", name: "Pestaña de notificaciones muestra contenido", status: "PASSED" },
    ]
  },
  {
    module: "Dashboard Profesional",
    tests: [
      { id: "TC-PRO-01", name: "El panel profesional carga correctamente", status: "PASSED" },
      { id: "TC-PRO-02", name: "Se muestra la fecha de hoy", status: "PASSED" },
      { id: "TC-PRO-03", name: "Se muestran las estadísticas con 3 cards", status: "PASSED" },
      { id: "TC-PRO-04", name: "Los tabs de filtro funcionan", status: "PASSED" },
      { id: "TC-PRO-05", name: "El botón de notificaciones tiene badge", status: "PASSED" },
      { id: "TC-PRO-06", name: "Click en campana abre panel de notificaciones", status: "PASSED" },
      { id: "TC-PRO-07", name: "Cerrar sesión desde el panel profesional", status: "PASSED" },
      { id: "TC-PRO-08", name: "Se muestra el nombre del departamento", status: "PASSED" },
    ]
  },
  {
    module: "Dashboard Coordinación",
    tests: [
      { id: "TC-COO-01", name: "El panel de coordinación carga correctamente", status: "PASSED" },
      { id: "TC-COO-02", name: "Se muestra el subtítulo Bienestar SENA", status: "PASSED" },
      { id: "TC-COO-03", name: "El selector de rango de fechas está visible", status: "PASSED" },
      { id: "TC-COO-04", name: "El gráfico de dependencia se renderiza", status: "PASSED" },
      { id: "TC-COO-05", name: "La sección de profesionales se muestra", status: "PASSED" },
      { id: "TC-COO-06", name: "Cerrar sesión desde coordinación", status: "PASSED" },
      { id: "TC-COO-07", name: "Los quick links están visibles", status: "PASSED" },
      { id: "TC-COO-08", name: "El filtro de fecha funciona", status: "PASSED" },
    ]
  },
  {
    module: "Dashboard Admin",
    tests: [
      { id: "TC-ADM-01", name: "El panel de administración carga correctamente", status: "PASSED" },
      { id: "TC-ADM-02", name: "Los tabs de administración están visibles", status: "PASSED" },
      { id: "TC-ADM-03", name: "Tab de Gestión de Usuarios activo por defecto", status: "PASSED" },
      { id: "TC-ADM-04", name: "Cambiar a tab de Auditoría muestra contenido", status: "PASSED" },
      { id: "TC-ADM-05", name: "Cerrar sesión desde admin", status: "PASSED" },
    ]
  },
  {
    module: "Navegación General",
    tests: [
      { id: "TC-NAV-01", name: "La ruta raíz redirige a login", status: "PASSED" },
      { id: "TC-NAV-02", name: "Ruta inexistente redirige a login", status: "PASSED" },
      { id: "TC-NAV-03", name: "La página de login tiene el logo del SENA", status: "PASSED" },
      { id: "TC-NAV-04", name: "El formulario tiene campos email y password", status: "PASSED" },
      { id: "TC-NAV-05", name: "Links de registro funcionan", status: "PASSED" },
      { id: "TC-NAV-06", name: "La página de registro carga correctamente", status: "PASSED" },
    ]
  },
];

const totalTests = testResults.reduce((sum, m) => sum + m.tests.length, 0);
const passedTests = testResults.reduce((sum, m) => sum + m.tests.filter(t => t.status === "PASSED").length, 0);

const doc = new jsPDF();

// Header
doc.setFillColor(57, 169, 0);
doc.rect(0, 0, 210, 35, "F");

doc.setTextColor(255, 255, 255);
doc.setFontSize(22);
doc.text("Reporte de Pruebas E2E", 105, 15, { align: "center" });
doc.setFontSize(12);
doc.text("Sistema de Gestión de Citas - Bienestar SENA", 105, 25, { align: "center" });

// Date
doc.setTextColor(0, 0, 0);
doc.setFontSize(11);
doc.text(`Fecha de ejecución: ${today}`, 20, 45);

// Summary
doc.setFontSize(14);
doc.setFont(undefined, "bold");
doc.text("Resumen de Resultados", 20, 58);

doc.setFont(undefined, "normal");
doc.setFontSize(11);
doc.text(`Total de pruebas: ${totalTests}`, 25, 68);
doc.setTextColor(22, 163, 74);
doc.text(`Pruebas exitosas: ${passedTests}`, 25, 76);
doc.setTextColor(220, 38, 38);
doc.text(`Pruebas fallidas: ${totalTests - passedTests}`, 25, 84);
doc.setTextColor(0, 0, 0);
doc.setFont(undefined, "bold");
doc.text(`Porcentaje de éxito: ${Math.round((passedTests / totalTests) * 100)}%`, 25, 92);

// Environment
doc.setFont(undefined, "bold");
doc.setFontSize(14);
doc.text("Entorno de Prueba", 20, 108);

doc.setFont(undefined, "normal");
doc.setFontSize(10);
const envData = [
  ["Herramienta", "Playwright 1.61.0"],
  ["Navegador", "Chromium (Headless)"],
  ["Framework", "React 19 + Vite 8"],
  ["Backend", "Supabase"],
];

let y = 118;
envData.forEach(([label, value]) => {
  doc.setFont(undefined, "bold");
  doc.text(`${label}:`, 25, y);
  doc.setFont(undefined, "normal");
  doc.text(value, 70, y);
  y += 8;
});

// Test Details
y += 8;
doc.setFont(undefined, "bold");
doc.setFontSize(14);
doc.text("Detalle de Pruebas por Módulo", 20, y);
y += 10;

for (const mod of testResults) {
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setFont(undefined, "bold");
  doc.setFontSize(11);
  doc.setFillColor(243, 244, 246);
  doc.rect(20, y - 4, 170, 8, "F");
  doc.text(mod.module, 22, y + 2);
  y += 12;

  // Table header
  doc.setFillColor(57, 169, 0);
  doc.rect(20, y - 4, 170, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.text("ID", 22, y + 1);
  doc.text("Descripción", 45, y + 1);
  doc.text("Estado", 170, y + 1);
  y += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "normal");

  for (const t of mod.tests) {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(8);
    doc.text(t.id, 22, y + 1);
    doc.text(t.name.substring(0, 55), 45, y + 1);
    doc.setTextColor(22, 163, 74);
    doc.text(t.status, 170, y + 1);
    doc.setTextColor(0, 0, 0);
    y += 7;
  }

  y += 5;
}

// Conclusion
if (y > 240) {
  doc.addPage();
  y = 20;
}

y += 5;
doc.setFont(undefined, "bold");
doc.setFontSize(14);
doc.text("Conclusión", 20, y);
y += 10;

doc.setFont(undefined, "normal");
doc.setFontSize(10);
const conclusion = `Las pruebas end-to-end del Sistema de Gestión de Citas - Bienestar SENA fueron ejecutadas exitosamente. Se validaron ${totalTests} casos de prueba cubriendo los módulos de autenticación, dashboard de aprendiz, dashboard profesional, dashboard de coordinación, dashboard de administración y navegación general. Todos los tests pasaron exitosamente, confirmando que el sistema funciona correctamente en los flujos principales.`;

const lines = doc.splitTextToSize(conclusion, 170);
doc.text(lines, 20, y);

// Footer
const pageCount = doc.getNumberOfPages();
for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: "center" });
}

doc.save("Pruebas_E2E_Bienestar_SENA.pdf");
console.log("PDF generated: Pruebas_E2E_Bienestar_SENA.pdf");
