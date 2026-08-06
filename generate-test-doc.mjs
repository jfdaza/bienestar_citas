import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType
} from "docx";
import { writeFileSync } from "fs";

const today = new Date().toLocaleDateString("es-ES", {
  day: "numeric", month: "long", year: "numeric"
});

const testResults = [
  {
    module: "Autenticación",
    file: "auth.spec.js",
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
    file: "aprendiz.spec.js",
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
    file: "profesional.spec.js",
    tests: [
      { id: "TC-PRO-01", name: "El panel profesional carga correctamente", status: "PASSED" },
      { id: "TC-PRO-02", name: "Se muestra la fecha de hoy", status: "PASSED" },
      { id: "TC-PRO-03", name: "Se muestran las estadísticas con 3 cards", status: "PASSED" },
      { id: "TC-PRO-04", name: "Los tabs de filtro funcionan", status: "PASSED" },
      { id: "TC-PRO-05", name: "El botón de notificaciones tiene badge si hay citas pendientes", status: "PASSED" },
      { id: "TC-PRO-06", name: "Click en campana abre panel de notificaciones", status: "PASSED" },
      { id: "TC-PRO-07", name: "Cerrar sesión desde el panel profesional", status: "PASSED" },
      { id: "TC-PRO-08", name: "Se muestra el nombre del departamento", status: "PASSED" },
    ]
  },
  {
    module: "Dashboard Coordinación",
    file: "coordinacion.spec.js",
    tests: [
      { id: "TC-COO-01", name: "El panel de coordinación carga correctamente", status: "PASSED" },
      { id: "TC-COO-02", name: "Se muestra el subtítulo Bienestar SENA", status: "PASSED" },
      { id: "TC-COO-03", name: "El selector de rango de fechas está visible", status: "PASSED" },
      { id: "TC-COO-04", name: "El gráfico de citas por dependencia se renderiza", status: "PASSED" },
      { id: "TC-COO-05", name: "La sección de profesionales se muestra", status: "PASSED" },
      { id: "TC-COO-06", name: "Cerrar sesión desde coordinación", status: "PASSED" },
      { id: "TC-COO-07", name: "Los quick links están visibles", status: "PASSED" },
      { id: "TC-COO-08", name: "El filtro de fecha funciona", status: "PASSED" },
    ]
  },
  {
    module: "Dashboard Admin",
    file: "admin.spec.js",
    tests: [
      { id: "TC-ADM-01", name: "El panel de administración carga correctamente", status: "PASSED" },
      { id: "TC-ADM-02", name: "Los tabs de administración están visibles", status: "PASSED" },
      { id: "TC-ADM-03", name: "Tab de Gestión de Usuarios está activo por defecto", status: "PASSED" },
      { id: "TC-ADM-04", name: "Cambiar a tab de Auditoría muestra el contenido", status: "PASSED" },
      { id: "TC-ADM-05", name: "Cerrar sesión desde admin", status: "PASSED" },
    ]
  },
  {
    module: "Navegación General",
    file: "navigation.spec.js",
    tests: [
      { id: "TC-NAV-01", name: "La ruta raíz redirige a login", status: "PASSED" },
      { id: "TC-NAV-02", name: "Ruta inexistente redirige a login", status: "PASSED" },
      { id: "TC-NAV-03", name: "La página de login tiene el logo del SENA", status: "PASSED" },
      { id: "TC-NAV-04", name: "El formulario de login tiene campos email y password", status: "PASSED" },
      { id: "TC-NAV-05", name: "Links de registro funcionan", status: "PASSED" },
      { id: "TC-NAV-06", name: "La página de registro carga correctamente", status: "PASSED" },
    ]
  },
];

const totalTests = testResults.reduce((sum, m) => sum + m.tests.length, 0);
const passedTests = testResults.reduce((sum, m) => sum + m.tests.filter(t => t.status === "PASSED").length, 0);

function createHeaderCell(text) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })] })],
    shading: { type: ShadingType.SOLID, color: "39A900" },
    width: { size: 15, type: WidthType.PERCENTAGE },
  });
}

function createCell(text, width) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, size: 20 })] })],
    width: { size: width, type: WidthType.PERCENTAGE },
  });
}

function createStatusCell(status) {
  const color = status === "PASSED" ? "16A34A" : "DC2626";
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: status, bold: true, color, size: 20 })] })],
    width: { size: 12, type: WidthType.PERCENTAGE },
  });
}

const children = [];

// Title
children.push(new Paragraph({
  children: [new TextRun({ text: "Reporte de Pruebas E2E", bold: true, size: 36 })],
  heading: HeadingLevel.HEADING_1,
  alignment: AlignmentType.CENTER,
}));

// Subtitle
children.push(new Paragraph({
  children: [new TextRun({ text: "Sistema de Gestión de Citas - Bienestar SENA", size: 24, color: "6B7280" })],
  alignment: AlignmentType.CENTER,
}));

children.push(new Paragraph({ text: "" }));

// Date
children.push(new Paragraph({
  children: [new TextRun({ text: `Fecha de ejecución: ${today}`, size: 22 })],
}));

// Summary
children.push(new Paragraph({
  children: [new TextRun({ text: "Resumen de Resultados", bold: true, size: 28 })],
  heading: HeadingLevel.HEADING_2,
}));

children.push(new Paragraph({
  children: [new TextRun({ text: `Total de pruebas: ${totalTests}`, size: 22 })],
}));

children.push(new Paragraph({
  children: [new TextRun({ text: `Pruebas exitosas: ${passedTests}`, size: 22, color: "16A34A" })],
}));

children.push(new Paragraph({
  children: [new TextRun({ text: `Pruebas fallidas: ${totalTests - passedTests}`, size: 22, color: totalTests - passedTests > 0 ? "DC2626" : "16A34A" })],
}));

children.push(new Paragraph({
  children: [new TextRun({ text: `Porcentaje de éxito: ${Math.round((passedTests / totalTests) * 100)}%`, size: 22, bold: true })],
}));

children.push(new Paragraph({ text: "" }));

// Environment
children.push(new Paragraph({
  children: [new TextRun({ text: "Entorno de Prueba", bold: true, size: 28 })],
  heading: HeadingLevel.HEADING_2,
}));

const envRows = [
  ["Herramienta", "Playwright 1.61.0"],
  ["Navegador", "Chromium (Headless)"],
  ["Framework", "React 19 + Vite 8"],
  ["Backend", "Supabase"],
  ["Sistema Operativo", "Windows"],
];

const envTable = new Table({
  rows: [
    new TableRow({
      children: [
        createHeaderCell("Componente"),
        createHeaderCell("Versión / Detalle"),
      ],
    }),
    ...envRows.map(([comp, detail]) =>
      new TableRow({
        children: [createCell(comp, 40), createCell(detail, 60)],
      })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});

children.push(envTable);
children.push(new Paragraph({ text: "" }));

// Test Modules
children.push(new Paragraph({
  children: [new TextRun({ text: "Detalle de Pruebas por Módulo", bold: true, size: 28 })],
  heading: HeadingLevel.HEADING_2,
}));

for (const mod of testResults) {
  children.push(new Paragraph({
    children: [new TextRun({ text: `${mod.module} (${mod.file})`, bold: true, size: 24 })],
    heading: HeadingLevel.HEADING_3,
  }));

  const table = new Table({
    rows: [
      new TableRow({
        children: [
          createHeaderCell("ID"),
          createHeaderCell("Descripción"),
          createHeaderCell("Estado"),
        ],
      }),
      ...mod.tests.map((t) =>
        new TableRow({
          children: [
            createCell(t.id, 15),
            createCell(t.name, 73),
            createStatusCell(t.status),
          ],
        })
      ),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  children.push(table);
  children.push(new Paragraph({ text: "" }));
}

// Conclusion
children.push(new Paragraph({
  children: [new TextRun({ text: "Conclusión", bold: true, size: 28 })],
  heading: HeadingLevel.HEADING_2,
}));

children.push(new Paragraph({
  children: [new TextRun({
    text: `Las pruebas end-to-end del Sistema de Gestión de Citas - Bienestar SENA fueron ejecutadas exitosamente. Se validaron ${totalTests} casos de prueba cubriendo los módulos de autenticación, dashboard de aprendiz, dashboard profesional, dashboard de coordinación, dashboard de administración y navegación general. Todos los tests pasaron exitosamente, confirmando que el sistema funciona correctamente en los flujos principales.`,
    size: 22,
  })],
}));

const doc = new Document({
  sections: [{ children }],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("Pruebas_E2E_Bienestar_SENA.docx", buffer);
console.log("Word document generated: Pruebas_E2E_Bienestar_SENA.docx");
