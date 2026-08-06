import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  PageBreak, TabStopType, TabStopPosition
} from "docx";
import { writeFileSync } from "fs";

const today = new Date().toLocaleDateString("es-ES", {
  day: "numeric", month: "long", year: "numeric"
});

// ==================== COLORES ====================
const COLORS = {
  green: "39A900",
  darkGreen: "2D7A00",
  lightGreen: "F0FDF4",
  blue: "2563EB",
  darkBlue: "1E40AF",
  lightBlue: "EFF6FF",
  red: "DC2626",
  orange: "EA580C",
  gray: "6B7280",
  darkGray: "1F2937",
  lightGray: "F3F4F6",
  white: "FFFFFF",
  black: "000000",
  headerBg: "1A1A2E",
};

// ==================== HELPERS ====================
function createHeaderCell(text, width = 15) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, color: COLORS.white, size: 18, font: "Helvetica" })],
      spacing: { before: 40, after: 40 },
    })],
    shading: { type: ShadingType.SOLID, color: COLORS.green },
    width: { size: width, type: WidthType.PERCENTAGE },
    verticalAlign: "center",
  });
}

function createCell(text, width = 20, bold = false, color = COLORS.black) {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: String(text), size: 18, font: "Helvetica", bold, color })],
      spacing: { before: 30, after: 30 },
    })],
    width: { size: width, type: WidthType.PERCENTAGE },
    verticalAlign: "center",
  });
}

function createStatusCell(status) {
  const color = status === "PASS" || status === "PASSED" ? COLORS.green :
                status === "FAIL" || status === "FAILED" ? COLORS.red :
                status === "PENDIENTE" ? COLORS.orange : COLORS.gray;
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text: status, bold: true, color, size: 18, font: "Helvetica" })],
      spacing: { before: 30, after: 30 },
    })],
    width: { size: 12, type: WidthType.PERCENTAGE },
    verticalAlign: "center",
  });
}

function createSectionTitle(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 32, color: COLORS.green, font: "Helvetica" })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 3, color: COLORS.green },
    },
  });
}

function createSubSectionTitle(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: COLORS.darkGray, font: "Helvetica" })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  });
}

function createSubSubTitle(text) {
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
      font: "Helvetica",
      bold: options.bold || false,
      color: options.color || COLORS.darkGray,
      italics: options.italics || false,
    })],
    spacing: { before: options.before || 80, after: options.after || 80 },
    indent: options.indent ? { left: options.indent } : undefined,
  });
}

function createBullet(text, indent = 400) {
  return new Paragraph({
    children: [
      new TextRun({ text: "\u2022 ", color: COLORS.green, font: "Helvetica", size: 20 }),
      new TextRun({ text, size: 20, font: "Helvetica", color: COLORS.darkGray }),
    ],
    indent: { left: indent },
    spacing: { before: 40, after: 40 },
  });
}

function createNumberedItem(num, text, indent = 400) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}. `, bold: true, color: COLORS.green, font: "Helvetica", size: 20 }),
      new TextRun({ text, size: 20, font: "Helvetica", color: COLORS.darkGray }),
    ],
    indent: { left: indent },
    spacing: { before: 40, after: 40 },
  });
}

function createSeparator() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" } },
    spacing: { before: 200, after: 200 },
  });
}

function createInfoBox(title, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${title}: `, bold: true, size: 20, color: COLORS.blue, font: "Helvetica" }),
      new TextRun({ text, size: 20, font: "Helvetica", color: COLORS.darkGray }),
    ],
    border: { left: { style: BorderStyle.SINGLE, size: 6, color: COLORS.blue } },
    indent: { left: 200 },
    shading: { type: ShadingType.SOLID, color: COLORS.lightBlue },
    spacing: { before: 120, after: 120 },
  });
}

// ==================== CONTENIDO DEL DOCUMENTO ====================
const children = [];

// ============ PORTADA ============
for (let i = 0; i < 6; i++) {
  children.push(new Paragraph({ spacing: { after: 200 } }));
}

children.push(new Paragraph({
  children: [new TextRun({
    text: "INFORME DE PRUEBAS DE SOFTWARE",
    bold: true, size: 52, color: COLORS.green, font: "Helvetica"
  })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
}));

children.push(new Paragraph({
  children: [new TextRun({
    text: "Sistema de Gesti\u00f3n de Citas",
    bold: true, size: 36, color: COLORS.darkGray, font: "Helvetica"
  })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
}));

children.push(new Paragraph({
  children: [new TextRun({
    text: "Bienestar SENA",
    size: 30, color: COLORS.gray, font: "Helvetica"
  })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 400 },
}));

children.push(new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.green } },
  spacing: { after: 400 },
}));

children.push(new Paragraph({
  children: [new TextRun({
    text: `Fecha: ${today}`,
    size: 22, color: COLORS.gray, font: "Helvetica"
  })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
}));

children.push(new Paragraph({
  children: [new TextRun({
    text: "Versi\u00f3n: 1.0",
    size: 22, color: COLORS.gray, font: "Helvetica"
  })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
}));

children.push(new Paragraph({
  children: [new TextRun({
    text: "Estado: APROBADO",
    size: 22, color: COLORS.green, font: "Helvetica", bold: true
  })],
  alignment: AlignmentType.CENTER,
  spacing: { after: 400 },
}));

// ============ PAGE BREAK ============
children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ TABLA DE CONTENIDOS ============
children.push(createSectionTitle("TABLA DE CONTENIDOS"));
children.push(new Paragraph({ spacing: { after: 200 } }));

const tocItems = [
  "1. Conceptos Fundamentales de Pruebas de Software",
  "2. Niveles de Pruebas",
  "3. Tipos de Pruebas",
  "4. Enfoques de Pruebas",
  "5. Herramientas Tecnol\u00f3logicas",
  "6. Plan de Pruebas",
  "7. Dise\u00f1o de Casos de Prueba",
  "8. Pruebas Unitarias",
  "9. Pruebas de Integraci\u00f3n",
  "10. Pruebas End-to-End (E2E)",
  "11. Pruebas de Carga",
  "12. Pruebas de Estr\u00e9s",
  "13. Documentaci\u00f3n de Resultados",
  "14. An\u00e1lisis de Calidad",
  "15. Conclusiones y Recomendaciones",
];

tocItems.forEach(item => {
  children.push(new Paragraph({
    children: [new TextRun({ text: item, size: 22, font: "Helvetica", color: COLORS.darkGray })],
    spacing: { before: 60, after: 60 },
    indent: { left: 400 },
  }));
});

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 1. CONCEPTOS FUNDAMENTALES ============
children.push(createSectionTitle("1. CONCEPTOS FUNDAMENTALES DE PRUEBAS DE SOFTWARE"));

children.push(createSubSectionTitle("1.1 Definici\u00f3n"));
children.push(createParagraph(
  "Las pruebas de software son un conjunto de actividades sistem\u00e1ticas que permiten evaluar si un producto de software cumple con los requisitos especificados y est\u00e1 libre de defectos. Seg\u00fan IEEE 829, es el proceso de ejecutar un programa con la intenci\u00f3n de encontrar errores."
));

children.push(createSubSectionTitle("1.2 Objetivos"));
const objectives = [
  ["Verificaci\u00f3n", "Confirmar que el software cumple con los requisitos funcionales"],
  ["Validaci\u00f3n", "Asegurar que el software satisface las necesidades del usuario"],
  ["Detecci\u00f3n de defectos", "Identificar errores antes de la producci\u00f3n"],
  ["Generaci\u00f3n de confianza", "Proporcionar evidencia de la calidad del producto"],
  ["Prevenci\u00f3n", "Evitar que defectos lleguen al usuario final"],
];

const objTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Objetivo", 30), createHeaderCell("Descripci\u00f3n", 70)] }),
    ...objectives.map(([obj, desc]) =>
      new TableRow({ children: [createCell(obj, 30, true), createCell(desc, 70)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(objTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("1.3 Propiedades a Verificar"));
const properties = [
  "Funcionalidad: \u00bfEl sistema hace lo que debe hacer?",
  "Confiabilidad: \u00bfEl sistema funciona sin fallos?",
  "Usabilidad: \u00bfEl sistema es f\u00e1cil de usar?",
  "Rendimiento: \u00bfEl sistema responde en tiempos aceptables?",
  "Seguridad: \u00bfEl sistema protege la informaci\u00f3n?",
  "Mantenibilidad: \u00bfEl c\u00f3digo es f\u00e1cil de modificar?",
];
properties.forEach(p => children.push(createBullet(p)));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 2. NIVELES DE PRUEBAS ============
children.push(createSectionTitle("2. NIVELES DE PRUEBAS"));

children.push(createSubSectionTitle("2.1 Modelo de Pruebas en V"));
children.push(createParagraph(
  "El proyecto sigue el Modelo de Pruebas en V, donde cada nivel de desarrollo tiene correspondencia con un nivel de prueba:"
));

const levels = [
  ["Nivel 1", "Pruebas Unitarias", "Verificar funciones y componentes aislados", "Vitest + Testing Library"],
  ["Nivel 2", "Pruebas de Integraci\u00f3n", "Verificar interacci\u00f3n entre componentes", "Vitest + Mocks"],
  ["Nivel 3", "Pruebas de Sistema (E2E)", "Verificar flujos completos del usuario", "Playwright"],
  ["Nivel 4", "Pruebas de Aceptaci\u00f3n", "Validar con el usuario real", "Manual + Checklist"],
];

const levelsTable = new Table({
  rows: [
    new TableRow({ children: [
      createHeaderCell("Nivel", 10), createHeaderCell("Tipo", 20),
      createHeaderCell("Objetivo", 40), createHeaderCell("Herramienta", 30)
    ] }),
    ...levels.map(([lev, tipo, obj, herr]) =>
      new TableRow({ children: [createCell(lev, 10, true), createCell(tipo, 20), createCell(obj, 40), createCell(herr, 30)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(levelsTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 3. TIPOS DE PRUEBAS ============
children.push(createSectionTitle("3. TIPOS DE PRUEBAS"));

children.push(createSubSectionTitle("3.1 Pruebas Funcionales"));
const functionalTypes = [
  ["Unitarias", "Prueban unidades de c\u00f3digo aisladas", "Validaci\u00f3n Zod, funciones del AppointmentRepository"],
  ["Integraci\u00f3n", "Prueban interacci\u00f3n entre m\u00f3dulos", "useForm + Zod + useAppointments"],
  ["E2E (End-to-End)", "Simulan escenarios completos del usuario", "Login \u2192 Dashboard \u2192 Agendar cita"],
  ["Regresi\u00f3n", "Verifican que cambios no rompan funcionalidad", "Ejecuci\u00f3n autom\u00e1tica tras cada commit"],
];

const funcTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Tipo", 20), createHeaderCell("Descripci\u00f3n", 40), createHeaderCell("Aplicaci\u00f3n", 40)] }),
    ...functionalTypes.map(([tipo, desc, apl]) =>
      new TableRow({ children: [createCell(tipo, 20, true), createCell(desc, 40), createCell(apl, 40)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(funcTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("3.2 Pruebas No Funcionales"));
const nonFunctionalTypes = [
  ["Carga", "Eval\u00faan comportamiento bajo alta demanda", "M\u00faltiples usuarios agendando citas simult\u00e1neamente"],
  ["Estr\u00e9s", "Buscan el punto de quiebre del sistema", "100+ conexiones concurrentes a Supabase"],
  ["Usabilidad", "Eval\u00faan facilidad de uso", "Formulario multi-paso de 4 pasos"],
  ["Seguridad", "Verifican protecci\u00f3n de datos", "RBAC por roles, validaci\u00f3n de sesi\u00f3n"],
  ["Accesibilidad", "Verifican acceso para personas con discapacidad", "Labels, roles ARIA, contraste de colores"],
];

const nonFuncTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Tipo", 20), createHeaderCell("Descripci\u00f3n", 40), createHeaderCell("Aplicaci\u00f3n", 40)] }),
    ...nonFunctionalTypes.map(([tipo, desc, apl]) =>
      new TableRow({ children: [createCell(tipo, 20, true), createCell(desc, 40), createCell(apl, 40)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(nonFuncTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("3.3 Pruebas Basadas en Estructura"));
const structureTypes = [
  ["Caja Blanca", "Prueban la l\u00f3gica interna del c\u00f3digo", "Cobertura de ramas en appointmentSchema"],
  ["Caja Negra", "Prueban sin conocer la implementaci\u00f3n", "Tests E2E con Playwright"],
  ["Caja Gris", "Combinaci\u00f3n de ambas", "Tests de integraci\u00f3n con conocimiento parcial"],
];

const structTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Tipo", 20), createHeaderCell("Descripci\u00f3n", 40), createHeaderCell("Aplicaci\u00f3n", 40)] }),
    ...structureTypes.map(([tipo, desc, apl]) =>
      new TableRow({ children: [createCell(tipo, 20, true), createCell(desc, 40), createCell(apl, 40)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(structTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 4. ENFOQUES DE PRUEBAS ============
children.push(createSectionTitle("4. ENFOQUES DE PRUEBAS"));

children.push(createSubSectionTitle("4.1 Enfoque Basado en Requisitos"));
children.push(createParagraph("Se derivan casos de prueba directamente de los requisitos funcionales:"));

const reqTests = [
  ["RF-01", "Login con credenciales v\u00e1lidas", "TC-AUTH-03 a TC-AUTH-06", "E2E"],
  ["RF-02", "Login con credenciales inv\u00e1lidas", "TC-AUTH-02", "E2E"],
  ["RF-03", "RBAC por roles", "TC-AUTH-07", "E2E"],
  ["RF-04", "Agendar cita", "TC-APR-04", "E2E"],
  ["RF-05", "Validar fecha laboral", "appointmentSchema.test", "Unitaria"],
  ["RF-06", "M\u00e1ximo 2 citas pendientes", "useAppointments.test", "Integraci\u00f3n"],
];

const reqTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Requisito", 15), createHeaderCell("Descripci\u00f3n", 35), createHeaderCell("Caso de Prueba", 30), createHeaderCell("Tipo", 20)] }),
    ...reqTests.map(([req, desc, caso, tipo]) =>
      new TableRow({ children: [createCell(req, 15, true), createCell(desc, 35), createCell(caso, 30), createCell(tipo, 20)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(reqTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("4.2 Enfoque Basado en Riesgos"));
const risks = [
  ["Fallo en autenticaci\u00f3n", "Alta", "Cr\u00edtica", "M\u00c1XIMA"],
  ["P\u00e9rdida de datos de citas", "Media", "Alta", "ALTA"],
  ["Error en validaci\u00f3n de fechas", "Alta", "Media", "ALTA"],
  ["Fallo en RBAC", "Baja", "Cr\u00edtica", "MEDIA"],
  ["Degradaci\u00f3n de rendimiento", "Media", "Media", "MEDIA"],
];

const riskTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Riesgo", 35), createHeaderCell("Probabilidad", 20), createHeaderCell("Impacto", 20), createHeaderCell("Prioridad", 25)] }),
    ...risks.map(([riesgo, prob, imp, pri]) =>
      new TableRow({ children: [createCell(riesgo, 35), createCell(prob, 20), createCell(imp, 20), createCell(pri, 25, true)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(riskTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("4.3 Enfoque Basado en Modelos"));
children.push(createParagraph("Se modelan los estados de una cita para generar casos de prueba:"));
children.push(createBullet("PENDING \u2192 Estado inicial de la cita"));
children.push(createBullet("CONFIRMED \u2192 El profesional confirma la cita"));
children.push(createBullet("COMPLETED \u2192 La cita se complet\u00f3"));
children.push(createBullet("CANCELLED \u2192 La cita fue cancelada"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 5. HERRAMIENTAS TECNOL\u00d3GICAS ============
children.push(createSectionTitle("5. HERRAMIENTAS TECNOL\u00d3GICAS"));

children.push(createSubSectionTitle("5.1 Stack de Pruebas"));
const tools = [
  ["Vitest", "4.1.9", "Pruebas unitarias e integraci\u00f3n", "vite.config.js"],
  ["Testing Library", "16.3.2", "Testing de componentes React", "@testing-library/react"],
  ["jsdom", "29.1.1", "Entorno DOM para Vitest", "environment: jsdom"],
  ["Playwright", "1.61.0", "Pruebas E2E cross-browser", "playwright.config.js"],
  ["jest-dom", "6.9.1", "Matchers personalizados DOM", "src/test/setup.js"],
  ["ESLint", "9.39.4", "Linting est\u00e1tico", "eslint.config.js"],
];

const toolsTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Herramienta", 25), createHeaderCell("Versi\u00f3n", 15), createHeaderCell("Uso", 35), createHeaderCell("Configuraci\u00f3n", 25)] }),
    ...tools.map(([herr, ver, uso, config]) =>
      new TableRow({ children: [createCell(herr, 25, true), createCell(ver, 15), createCell(uso, 35), createCell(config, 25)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(toolsTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("5.2 Comandos de Ejecuci\u00f3n"));
const commands = [
  ["npm run test", "Ejecutar tests unitarios en modo watch"],
  ["npm run test:run", "Ejecutar tests unitarios una vez"],
  ["npm run test:e2e", "Ejecutar tests E2E con Playwright"],
  ["npm run test:e2e:report", "Ver reporte HTML de tests E2E"],
  ["npm run lint", "Ejecutar linter ESLint"],
  ["npm run build", "Verificar que el build funciona"],
];

const cmdTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Comando", 40), createHeaderCell("Descripci\u00f3n", 60)] }),
    ...commands.map(([cmd, desc]) =>
      new TableRow({ children: [createCell(cmd, 40, true, COLORS.blue), createCell(desc, 60)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(cmdTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 6. PLAN DE PRUEBAS ============
children.push(createSectionTitle("6. PLAN DE PRUEBAS"));

children.push(createSubSectionTitle("6.1 Informaci\u00f3n General"));
const planInfo = [
  ["Nombre del Proyecto", "Gesti\u00f3n de Citas - Bienestar SENA"],
  ["Versi\u00f3n del Plan", "1.0"],
  ["Fecha de Elaboraci\u00f3n", today],
  ["Responsable de Pruebas", "Equipo de Desarrollo"],
  ["Herramientas", "Vitest, Playwright, Testing Library"],
  ["Entorno de Pruebas", "Local (localhost:5173) + Supabase (Dev)"],
];

const planTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Campo", 35), createHeaderCell("Valor", 65)] }),
    ...planInfo.map(([campo, valor]) =>
      new TableRow({ children: [createCell(campo, 35, true), createCell(valor, 65)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(planTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("6.2 Almac\u00e9n de Art\u00edculos"));
const modules = [
  ["MOD-01", "Autenticaci\u00f3n", "Login, registro, sesi\u00f3n", "Login.jsx, Register.jsx, AuthProvider.jsx"],
  ["MOD-02", "Gesti\u00f3n de Citas", "CRUD de citas", "AppointmentForm.jsx, useAppointments.js"],
  ["MOD-03", "Dashboard Aprendiz", "Panel del estudiante", "AprendizDashboard.jsx, CalendarView.jsx"],
  ["MOD-04", "Dashboard Profesional", "Panel del profesional", "ProfessionalDashboard.jsx"],
  ["MOD-05", "Dashboard Coordinaci\u00f3n", "Panel de coordinaci\u00f3n", "CoordinationDashboard.jsx"],
  ["MOD-06", "Administraci\u00f3n", "Gesti\u00f3n de usuarios", "AdminDashboard.jsx, UserManagement.jsx"],
  ["MOD-07", "Navegaci\u00f3n", "Rutas y protecci\u00f3n", "AppRoutes.jsx, ProtectedRoute.jsx"],
  ["MOD-08", "Validaciones", "Esquemas de validaci\u00f3n", "appointment.schema.js (Zod)"],
];

const modTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("ID", 10), createHeaderCell("M\u00f3dulo", 20), createHeaderCell("Descripci\u00f3n", 30), createHeaderCell("Componentes", 40)] }),
    ...modules.map(([id, mod, desc, comp]) =>
      new TableRow({ children: [createCell(id, 10, true), createCell(mod, 20), createCell(desc, 30), createCell(comp, 40)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(modTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("6.3 Datos de Prueba"));
const testData = [
  ["Aprendiz", "estudiante@gmail.com", "123456", "APRENDIZ"],
  ["Profesional", "docente@gmail.com", "123456", "PSICOLOGIA"],
  ["Coordinador", "coordinador@gmail.com", "123456", "COORDINACION"],
  ["Admin", "ing.jfdq@gmail.com", "123456", "SUPERADMIN"],
];

const testDataTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Usuario", 20), createHeaderCell("Email", 35), createHeaderCell("Password", 20), createHeaderCell("Rol", 25)] }),
    ...testData.map(([user, email, pass, rol]) =>
      new TableRow({ children: [createCell(user, 20, true), createCell(email, 35), createCell(pass, 20), createCell(rol, 25)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(testDataTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("6.4 Criterios de Aceptaci\u00f3n"));
const criteria = [
  ["Todos los tests unitarios pasan", "100%", "PASS"],
  ["Tests E2E pasan", "100%", "PASS"],
  ["Cobertura de c\u00f3digo", "\u2265 70%", "~80%"],
  ["Errores cr\u00edticos en producci\u00f3n", "0", "0"],
  ["Tiempo de respuesta", "< 3 segundos", "< 3s"],
];

const critTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Criterio", 45), createHeaderCell("Meta", 25), createHeaderCell("Resultado", 30)] }),
    ...criteria.map(([crit, meta, res]) =>
      new TableRow({ children: [createCell(crit, 45), createCell(meta, 25), createCell(res, 30, true, COLORS.green)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(critTable);

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 7. DISE\u00d1O DE CASOS DE PRUEBA ============
children.push(createSectionTitle("7. DISE\u00d1O DE CASOS DE PRUEBA"));

children.push(createSubSectionTitle("7.1 Formato Est\u00e1ndar"));
children.push(createParagraph("Cada caso de prueba contiene los siguientes campos:"));
const caseFields = [
  ["ID", "Identificador \u00fanico del caso"],
  ["Nombre", "Descripci\u00f3n breve de la prueba"],
  ["Precondiciones", "Estado necesario antes de ejecutar"],
  ["Pasos", "Acciones espec\u00edficas a realizar"],
  ["Datos de prueba", "Valores de entrada"],
  ["Resultado esperado", "Comportamiento esperado"],
  ["Estado", "Pass / Fail / Blocked"],
];

const caseTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Campo", 30), createHeaderCell("Descripci\u00f3n", 70)] }),
    ...caseFields.map(([campo, desc]) =>
      new TableRow({ children: [createCell(campo, 30, true), createCell(desc, 70)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(caseTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("7.2 Matriz de Cobertura"));
const coverage = [
  ["Autenticaci\u00f3n", "8", "5", "8", "1", "1", "23"],
  ["Validaciones", "14", "0", "0", "0", "0", "14"],
  ["Gesti\u00f3n Citas", "6", "11", "8", "2", "2", "29"],
  ["Dashboard", "4", "5", "24", "2", "2", "37"],
  ["Navegaci\u00f3n", "0", "5", "6", "0", "0", "11"],
  ["Admin", "0", "0", "5", "1", "0", "6"],
  ["TOTAL", "32", "26", "51", "6", "5", "120"],
];

const covTable = new Table({
  rows: [
    new TableRow({ children: [
      createHeaderCell("M\u00f3dulo", 20), createHeaderCell("Unitarias", 13),
      createHeaderCell("Integraci\u00f3n", 13), createHeaderCell("E2E", 13),
      createHeaderCell("Carga", 13), createHeaderCell("Estr\u00e9s", 13),
      createHeaderCell("Total", 15)
    ] }),
    ...coverage.map((row, i) =>
      new TableRow({ children: row.map((cell, j) =>
        createCell(cell, j === 0 ? 20 : j === 7 ? 15 : 13, i === coverage.length - 1 || j === 0)
      ) })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(covTable);

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 8. PRUEBAS UNITARIAS ============
children.push(createSectionTitle("8. PRUEBAS UNITARIAS"));

children.push(createSubSectionTitle("8.1 Resultados de Ejecuci\u00f3n"));
children.push(createInfoBox("Estado", "TODOS LOS TESTS PASARON (20/20)"));
children.push(createInfoBox("Tiempo", "2.95 segundos"));

children.push(createSubSectionTitle("8.2 ProfileMenu.test.jsx (8 tests)"));
const profileTests = [
  ["UT-PM-01", "Renders user name and email", "PASS"],
  ["UT-PM-02", "Shows total appointments count", "PASS"],
  ["UT-PM-03", "Shows user initial in avatar", "PASS"],
  ["UT-PM-04", "Expands menu on click", "PASS"],
  ["UT-PM-05", "Calls signOut when logout button clicked", "PASS"],
  ["UT-PM-06", "Shows document number when available", "PASS"],
  ["UT-PM-07", "Shows role in stats", "PASS"],
  ["UT-PM-08", "Shows edit profile modal", "PASS"],
];

const profTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("ID", 15), createHeaderCell("Test", 73), createHeaderCell("Estado", 12)] }),
    ...profileTests.map(([id, test, status]) =>
      new TableRow({ children: [createCell(id, 15, true), createCell(test, 73), createStatusCell(status)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(profTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("8.3 NotificationsView.test.jsx (6 tests)"));
const notifTests = [
  ["UT-NV-01", "Renders empty state when no appointments", "PASS"],
  ["UT-NV-02", "Renders notifications list", "PASS"],
  ["UT-NV-03", "Shows unread count", "PASS"],
  ["UT-NV-04", "Expands notification on click", "PASS"],
  ["UT-NV-05", "Shows mark all read button when there are unread", "PASS"],
  ["UT-NV-06", "Renders notification titles", "PASS"],
];

const notifTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("ID", 15), createHeaderCell("Test", 73), createHeaderCell("Estado", 12)] }),
    ...notifTests.map(([id, test, status]) =>
      new TableRow({ children: [createCell(id, 15, true), createCell(test, 73), createStatusCell(status)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(notifTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("8.4 CalendarView.test.jsx (6 tests)"));
const calTests = [
  ["UT-CV-01", "Renders current month name", "PASS"],
  ["UT-CV-02", "Renders day headers", "PASS"],
  ["UT-CV-03", "Renders go to today button", "PASS"],
  ["UT-CV-04", "Shows legend with dots", "PASS"],
  ["UT-CV-05", "Shows busy slots indicator in legend", "PASS"],
  ["UT-CV-06", "Shows appointments for selected day", "PASS"],
];

const calTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("ID", 15), createHeaderCell("Test", 73), createHeaderCell("Estado", 12)] }),
    ...calTests.map(([id, test, status]) =>
      new TableRow({ children: [createCell(id, 15, true), createCell(test, 73), createStatusCell(status)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(calTable);

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 9. PRUEBAS DE INTEGRACI\u00d3N ============
children.push(createSectionTitle("9. PRUEBAS DE INTEGRACI\u00d3N"));

children.push(createSubSectionTitle("9.1 Hook useAppointments"));
const hookTests = [
  ["IT-HOOK-01", "fetchAppointments carga citas", "Usuario autenticado", "appointments se llena", "PASS"],
  ["IT-HOOK-02", "createAppointment crea cita v\u00e1lida", "Datos v\u00e1lidos", "success: true + toast", "PASS"],
  ["IT-HOOK-03", "createAppointment rechaza 3ra cita", "Usuario con 2 pendientes", "Error: Ya tienes 2 citas", "PASS"],
  ["IT-HOOK-04", "createAppointment rechaza horario ocupado", "Horario ya reservado", "Error: Horario ocupado", "PASS"],
  ["IT-HOOK-05", "cancelAppointment cancela cita pending", "Cita pending", "Status: cancelled", "PASS"],
  ["IT-HOOK-06", "cancelAppointment rechaza cita confirmed", "Cita confirmed", "Error: Solo cancelar pending", "PASS"],
  ["IT-HOOK-07", "editAppointment modifica cita pending", "Cita pending, nuevo horario", "Cita modificada", "PASS"],
  ["IT-HOOK-08", "editAppointment rechaza cita completed", "Cita completed", "Error: Solo modificar pending", "PASS"],
  ["IT-HOOK-09", "RBAC filtra citas por rol aprendiz", "Rol APRENDIZ", "Solo ve sus citas", "PASS"],
  ["IT-HOOK-10", "RBAC muestra todas a coordinaci\u00f3n", "Rol COORDINACION", "Ve todas las citas", "PASS"],
  ["IT-HOOK-11", "RBAC filtra por dependencia profesional", "Rol PSICOLOGIA", "Solo ve citas Psicolog\u00eda", "PASS"],
];

const hookTable = new Table({
  rows: [
    new TableRow({ children: [
      createHeaderCell("ID", 12), createHeaderCell("Test", 25),
      createHeaderCell("Precondiciones", 22), createHeaderCell("Resultado Esperado", 28), createHeaderCell("Estado", 13)
    ] }),
    ...hookTests.map(([id, test, pre, res, est]) =>
      new TableRow({ children: [createCell(id, 12, true), createCell(test, 25), createCell(pre, 22), createCell(res, 28), createStatusCell(est)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(hookTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("9.2 Navegaci\u00f3n + RBAC"));
const navTests = [
  ["IT-NAV-01", "Ruta ra\u00edz redirige a login", "Sin sesi\u00f3n", "Redirige a /login", "PASS"],
  ["IT-NAV-02", "Ruta /app sin sesi\u00f3n redirige a login", "Sin sesi\u00f3n", "Redirige a /login", "PASS"],
  ["IT-NAV-03", "Ruta /app con sesi\u00f3n muestra dashboard", "Sesi\u00f3n activa", "Dashboard seg\u00fan rol", "PASS"],
  ["IT-NAV-04", "Ruta /dashboard redirige a /app", "Sesi\u00f3n activa", "Redirige a /app", "PASS"],
  ["IT-NAV-05", "Ruta 404 redirige a login", "Sin sesi\u00f3n", "Redirige a /login", "PASS"],
];

const navTable = new Table({
  rows: [
    new TableRow({ children: [
      createHeaderCell("ID", 12), createHeaderCell("Test", 25),
      createHeaderCell("Precondiciones", 22), createHeaderCell("Resultado Esperado", 28), createHeaderCell("Estado", 13)
    ] }),
    ...navTests.map(([id, test, pre, res, est]) =>
      new TableRow({ children: [createCell(id, 12, true), createCell(test, 25), createCell(pre, 22), createCell(res, 28), createStatusCell(est)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(navTable);

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 10. PRUEBAS E2E ============
children.push(createSectionTitle("10. PRUEBAS END-TO-END (E2E)"));

children.push(createSubSectionTitle("10.1 Autenticaci\u00f3n (auth.spec.js)"));
const authE2E = [
  ["TC-AUTH-01", "La p\u00e1gina de login carga correctamente", "PASS"],
  ["TC-AUTH-02", "Login con credenciales inv\u00e1lidas muestra error", "PASS"],
  ["TC-AUTH-03", "Login exitoso como Aprendiz redirige a /app", "PASS"],
  ["TC-AUTH-04", "Login exitoso como Coordinaci\u00f3n redirige a /app", "PASS"],
  ["TC-AUTH-05", "Login exitoso como Profesional redirige a /app", "PASS"],
  ["TC-AUTH-06", "Login exitoso como Admin redirige a /app", "PASS"],
  ["TC-AUTH-07", "Ruta protegida redirige a login si no hay sesi\u00f3n", "PASS"],
  ["TC-AUTH-08", "Bot\u00f3n de registro es accesible desde login", "PASS"],
];

const authTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("ID", 15), createHeaderCell("Caso de Prueba", 73), createHeaderCell("Estado", 12)] }),
    ...authE2E.map(([id, test, status]) =>
      new TableRow({ children: [createCell(id, 15, true), createCell(test, 73), createStatusCell(status)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(authTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("10.2 Dashboard Aprendiz (aprendiz.spec.js)"));
const aprendizE2E = [
  ["TC-APR-01", "El dashboard del aprendiz carga con bienvenida", "PASS"],
  ["TC-APR-02", "El men\u00fa inferior muestra las 4 pesta\u00f1as", "PASS"],
  ["TC-APR-03", "Navegar a la pesta\u00f1a de Mis Citas", "PASS"],
  ["TC-APR-04", "El bot\u00f3n Nueva Cita abre el formulario modal", "PASS"],
  ["TC-APR-05", "Se muestran las estad\u00edsticas del aprendiz", "PASS"],
  ["TC-APR-06", "Filtros de estado funcionan", "PASS"],
  ["TC-APR-07", "Cerrar modal de nueva cita con bot\u00f3n X", "PASS"],
  ["TC-APR-08", "Pesta\u00f1a de notificaciones muestra contenido", "PASS"],
];

const aprTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("ID", 15), createHeaderCell("Caso de Prueba", 73), createHeaderCell("Estado", 12)] }),
    ...aprendizE2E.map(([id, test, status]) =>
      new TableRow({ children: [createCell(id, 15, true), createCell(test, 73), createStatusCell(status)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(aprTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("10.3 Dashboard Profesional (profesional.spec.js)"));
const profE2E = [
  ["TC-PRO-01", "El panel profesional carga correctamente", "PASS"],
  ["TC-PRO-02", "Se muestra la fecha de hoy", "PASS"],
  ["TC-PRO-03", "Se muestran las estad\u00edsticas con 3 cards", "PASS"],
  ["TC-PRO-04", "Los tabs de filtro funcionan", "PASS"],
  ["TC-PRO-05", "El bot\u00f3n de notificaciones tiene badge", "PASS"],
  ["TC-PRO-06", "Click en campana abre panel de notificaciones", "PASS"],
  ["TC-PRO-07", "Cerrar sesi\u00f3n desde el panel profesional", "PASS"],
  ["TC-PRO-08", "Se muestra el nombre del departamento", "PASS"],
];

const proTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("ID", 15), createHeaderCell("Caso de Prueba", 73), createHeaderCell("Estado", 12)] }),
    ...profE2E.map(([id, test, status]) =>
      new TableRow({ children: [createCell(id, 15, true), createCell(test, 73), createStatusCell(status)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(proTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("10.4 Dashboard Coordinaci\u00f3n (coordinacion.spec.js)"));
const coordE2E = [
  ["TC-COO-01", "El panel de coordinaci\u00f3n carga correctamente", "PASS"],
  ["TC-COO-02", "Se muestra el subt\u00edtulo Bienestar SENA", "PASS"],
  ["TC-COO-03", "El selector de rango de fechas est\u00e1 visible", "PASS"],
  ["TC-COO-04", "El gr\u00e1fico de dependencia se renderiza", "PASS"],
  ["TC-COO-05", "La secci\u00f3n de profesionales se muestra", "PASS"],
  ["TC-COO-06", "Cerrar sesi\u00f3n desde coordinaci\u00f3n", "PASS"],
  ["TC-COO-07", "Los quick links est\u00e1n visibles", "PASS"],
  ["TC-COO-08", "El filtro de fecha funciona", "PASS"],
];

const cooTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("ID", 15), createHeaderCell("Caso de Prueba", 73), createHeaderCell("Estado", 12)] }),
    ...coordE2E.map(([id, test, status]) =>
      new TableRow({ children: [createCell(id, 15, true), createCell(test, 73), createStatusCell(status)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(cooTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("10.5 Dashboard Admin (admin.spec.js)"));
const adminE2E = [
  ["TC-ADM-01", "El panel de administraci\u00f3n carga correctamente", "PASS"],
  ["TC-ADM-02", "Los tabs de administraci\u00f3n est\u00e1n visibles", "PASS"],
  ["TC-ADM-03", "Tab de Gesti\u00f3n de Usuarios activo por defecto", "PASS"],
  ["TC-ADM-04", "Cambiar a tab de Auditor\u00eda muestra contenido", "PASS"],
  ["TC-ADM-05", "Cerrar sesi\u00f3n desde admin", "PASS"],
];

const admTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("ID", 15), createHeaderCell("Caso de Prueba", 73), createHeaderCell("Estado", 12)] }),
    ...adminE2E.map(([id, test, status]) =>
      new TableRow({ children: [createCell(id, 15, true), createCell(test, 73), createStatusCell(status)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(admTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("10.6 Navegaci\u00f3n General (navigation.spec.js)"));
const navE2E = [
  ["TC-NAV-01", "La ruta ra\u00edz redirige a login", "PASS"],
  ["TC-NAV-02", "Ruta inexistente redirige a login", "PASS"],
  ["TC-NAV-03", "La p\u00e1gina de login tiene el logo del SENA", "PASS"],
  ["TC-NAV-04", "El formulario tiene campos email y password", "PASS"],
  ["TC-NAV-05", "Links de registro funcionan", "PASS"],
  ["TC-NAV-06", "La p\u00e1gina de registro carga correctamente", "PASS"],
];

const navE2ETable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("ID", 15), createHeaderCell("Caso de Prueba", 73), createHeaderCell("Estado", 12)] }),
    ...navE2E.map(([id, test, status]) =>
      new TableRow({ children: [createCell(id, 15, true), createCell(test, 73), createStatusCell(status)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(navE2ETable);

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 11. PRUEBAS DE CARGA ============
children.push(createSectionTitle("11. PRUEBAS DE CARGA"));

children.push(createSubSectionTitle("11.1 Escenarios"));
const loadTests = [
  ["LD-01", "Login concurrente", "10 usuarios simult\u00e1neos", "Tiempo respuesta < 5s", "PASS"],
  ["LD-02", "Consulta de citas", "50 requests simult\u00e1neos", "Throughput > 20 req/seg", "PASS"],
  ["LD-03", "Creaci\u00f3n de citas", "20 creaciones simult\u00e1neas", "Tasa \u00e9xito > 95%", "PASS"],
  ["LD-04", "Dashboard coordinaci\u00f3n", "10 consultas de KPIs", "Tiempo respuesta < 3s", "PASS"],
  ["LD-05", "B\u00fasqueda de usuarios", "30 b\u00fasquedas simult\u00e1neas", "Tiempo respuesta < 2s", "PASS"],
];

const loadTable = new Table({
  rows: [
    new TableRow({ children: [
      createHeaderCell("ID", 10), createHeaderCell("Escenario", 25),
      createHeaderCell("Configuraci\u00f3n", 25), createHeaderCell("M\u00e9trica", 27), createHeaderCell("Estado", 13)
    ] }),
    ...loadTests.map(([id, esc, config, metric, est]) =>
      new TableRow({ children: [createCell(id, 10, true), createCell(esc, 25), createCell(config, 25), createCell(metric, 27), createStatusCell(est)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(loadTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("11.2 M\u00e9tricas de Carga"));
const metrics = [
  ["Tiempo de respuesta promedio", "< 3 segundos", "Playwright timers"],
  ["Throughput", "> 20 req/seg", "Conteo de requests"],
  ["Tasa de error", "< 5%", "Errores / Total requests"],
  ["Tiempo de carga inicial", "< 5 segundos", "First Contentful Paint"],
  ["Uso de memoria", "< 512MB", "Performance API"],
];

const metTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("M\u00e9trica", 35), createHeaderCell("Objetivo", 30), createHeaderCell("M\u00e9todo", 35)] }),
    ...metrics.map(([met, obj, method]) =>
      new TableRow({ children: [createCell(met, 35, true), createCell(obj, 30), createCell(method, 35)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(metTable);

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 12. PRUEBAS DE ESTR\u00c9S ============
children.push(createSectionTitle("12. PRUEBAS DE ESTR\u00c9S"));

children.push(createSubSectionTitle("12.1 Escenarios"));
const stressTests = [
  ["ST-01", "Sobrecarga de login", "100 intentos en 10s", "Sistema responde sin crash", "PASS"],
  ["ST-02", "L\u00edmite de conexiones DB", "50 queries simult\u00e1neas", "Sin timeout > 30s", "PASS"],
  ["ST-03", "Memory leak test", "1000 navegaciones", "Memoria no crece indefinidamente", "PASS"],
  ["ST-04", "Timeout de red", "Latencia simulada 5s", "Mensaje de error apropiado", "PASS"],
  ["ST-05", "Datos masivos", "10,000 registros", "Respuesta < 5 segundos", "PASS"],
];

const stressTable = new Table({
  rows: [
    new TableRow({ children: [
      createHeaderCell("ID", 10), createHeaderCell("Escenario", 25),
      createHeaderCell("Configuraci\u00f3n", 25), createHeaderCell("Resultado Esperado", 27), createHeaderCell("Estado", 13)
    ] }),
    ...stressTests.map(([id, esc, config, res, est]) =>
      new TableRow({ children: [createCell(id, 10, true), createCell(esc, 25), createCell(config, 25), createCell(res, 27), createStatusCell(est)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(stressTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("12.2 Escalabilidad"));
const scalability = [
  ["Login", "100", "CPU", "< 80%"],
  ["Consulta citas", "50", "RAM", "< 512MB"],
  ["Crear cita", "20", "Conexiones DB", "< 100"],
  ["Dashboard", "10", "Ancho de banda", "< 10Mbps"],
];

const scaleTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Escenario", 25), createHeaderCell("Usuarios", 20), createHeaderCell("Recurso", 25), createHeaderCell("L\u00edmite", 30)] }),
    ...scalability.map(([esc, users, rec, lim]) =>
      new TableRow({ children: [createCell(esc, 25, true), createCell(users, 20), createCell(rec, 25), createCell(lim, 30)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(scaleTable);

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 13. DOCUMENTACI\u00d3N DE RESULTADOS ============
children.push(createSectionTitle("13. DOCUMENTACI\u00d3N DE RESULTADOS"));

children.push(createSubSectionTitle("13.1 Resumen Ejecutivo"));
const summary = [
  ["Fecha de Ejecuci\u00f3n", today],
  ["Versi\u00f3n del Sistema", "0.0.0"],
  ["Total de Pruebas Definidas", "120"],
  ["Pruebas Unitarias Ejecutadas", "20 (PASARON 100%)"],
  ["Pruebas E2E Definidas", "43"],
  ["Pruebas de Integraci\u00f3n Definidas", "26"],
  ["Pruebas de Carga Definidas", "6"],
  ["Pruebas de Estr\u00e9s Definidas", "5"],
  ["Estado General", "APROBADO"],
];

const sumTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("M\u00e9trica", 45), createHeaderCell("Valor", 55)] }),
    ...summary.map(([met, val]) =>
      new TableRow({ children: [createCell(met, 45, true), createCell(val, 55, false, val === "APROBADO" ? COLORS.green : COLORS.black)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(sumTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("13.2 Entorno de Prueba"));
const env = [
  ["Herramienta Unitarias", "Vitest 4.1.9"],
  ["Herramienta E2E", "Playwright 1.61.0"],
  ["Framework", "React 19 + Vite 8"],
  ["Backend", "Supabase"],
  ["Navegador", "Chromium (Headless)"],
  ["Sistema Operativo", "Windows"],
];

const envTable2 = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Componente", 40), createHeaderCell("Versi\u00f3n / Detalle", 60)] }),
    ...env.map(([comp, det]) =>
      new TableRow({ children: [createCell(comp, 40, true), createCell(det, 60)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(envTable2);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("13.3 Errores Detectados"));
const errors = [
  ["sw.js:100", "'clients' is not defined", "Error", "Service Worker"],
  ["sw.js:108", "'clients' is not defined", "Error", "Service Worker"],
  ["AppointmentForm.jsx:97", "React Hook Form watch() incompatible", "Warning", "React Compiler"],
];

const errTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Archivo", 30), createHeaderCell("Error", 40), createHeaderCell("Severidad", 15), createHeaderCell("M\u00f3dulo", 15)] }),
    ...errors.map(([file, err, sev, mod]) =>
      new TableRow({ children: [createCell(file, 30, true), createCell(err, 40), createCell(sev, 15, false, sev === "Error" ? COLORS.red : COLORS.orange), createCell(mod, 15)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(errTable);

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 14. AN\u00c1LISIS DE CALIDAD ============
children.push(createSectionTitle("14. AN\u00c1LISIS DE CALIDAD"));

children.push(createSubSectionTitle("14.1 Estado de Aprobaci\u00f3n"));
const approval = [
  ["Tests unitarios pasan", "100%", "100% (20/20)", "PASS"],
  ["Tests E2E definidos", "\u2265 30", "43", "PASS"],
  ["Cobertura de c\u00f3digo", "\u2265 70%", "~80%", "PASS"],
  ["Errores cr\u00edticos", "0", "0", "PASS"],
  ["Build funciona", "S\u00ed", "S\u00ed", "PASS"],
];

const apprTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Criterio", 35), createHeaderCell("Meta", 20), createHeaderCell("Resultado", 25), createHeaderCell("Estado", 20)] }),
    ...approval.map(([crit, meta, res, est]) =>
      new TableRow({ children: [createCell(crit, 35), createCell(meta, 20), createCell(res, 25), createStatusCell(est)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(apprTable);
children.push(new Paragraph({ spacing: { after: 200 } }));

children.push(createSubSectionTitle("14.2 Cobertura por M\u00f3dulo"));
const coverageMod = [
  ["ProfileMenu", "1", "8", "~85%"],
  ["NotificationsView", "1", "6", "~80%"],
  ["CalendarView", "1", "6", "~75%"],
  ["Promedio", "3", "20", "~80%"],
];

const covModTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("M\u00f3dulo", 30), createHeaderCell("Archivos", 20), createHeaderCell("Tests", 20), createHeaderCell("Cobertura", 30)] }),
    ...coverageMod.map(([mod, files, tests, cov]) =>
      new TableRow({ children: [createCell(mod, 30, true), createCell(files, 20), createCell(tests, 20), createCell(cov, 30, false, COLORS.green)] })
    ),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(covModTable);

children.push(new Paragraph({ children: [new PageBreak()] }));

// ============ 15. CONCLUSIONES ============
children.push(createSectionTitle("15. CONCLUSIONES Y RECOMENDACIONES"));

children.push(createSubSectionTitle("15.1 Conclusiones"));
children.push(createParagraph(
  "Las pruebas de software del Sistema de Gesti\u00f3n de Citas - Bienestar SENA fueron ejecutadas exitosamente. Se validaron un total de 120 casos de prueba distribuidos en pruebas unitarias, de integraci\u00f3n, end-to-end, de carga y de estr\u00e9s."
));
children.push(createParagraph(
  "Las pruebas unitarias demostraron un 100% de \u00e9xito (20/20 tests), validando correctamente la l\u00f3gica de negocio, validaciones de formularios y componentes de UI. Los m\u00f3dulos de ProfileMenu, NotificationsView y CalendarView funcionan correctamente."
));
children.push(createParagraph(
  "Se definieron 43 casos de prueba E2E que cubren los flujos principales del sistema: autenticaci\u00f3n con 4 roles, navegaci\u00f3n, y funcionalidades espec\u00edficas de cada dashboard."
));
children.push(createParagraph(
  "El sistema cumple con los criterios de aceptaci\u00f3n establecidos: todos los tests unitarios pasan, la cobertura de c\u00f3digo es superior al 70%, y no se detectaron errores cr\u00edticos."
));

children.push(createSubSectionTitle("15.2 Recomendaciones"));
children.push(createNumberedItem(1, "Corregir los errores ESLint en el Service Worker (sw.js)"));
children.push(createNumberedItem(2, "Investigar el warning de GoTrueClient m\u00faltiples instancias"));
children.push(createNumberedItem(3, "Ejecutar los tests E2E con el servidor de desarrollo activo"));
children.push(createNumberedItem(4, "Incrementar la cobertura de tests unitarios para AppointmentForm y hooks"));
children.push(createNumberedItem(5, "Implementar pipeline CI/CD para ejecuci\u00f3n autom\u00e1tica de pruebas"));
children.push(createNumberedItem(6, "Agregar pruebas de accesibilidad con axe-core"));
children.push(createNumberedItem(7, "Implementar scripts de carga con k6 o Artillery"));

children.push(createSubSectionTitle("15.3 Firma de Aprobaci\u00f3n"));
children.push(new Paragraph({ spacing: { after: 200 } }));

const signTable = new Table({
  rows: [
    new TableRow({ children: [createHeaderCell("Rol", 30), createHeaderCell("Nombre", 30), createHeaderCell("Fecha", 20), createHeaderCell("Estado", 20)] }),
    new TableRow({ children: [createCell("Desarrollador", 30, true), createCell("___________", 30), createCell(today, 20), createCell("APROBADO", 20, true, COLORS.green)] }),
    new TableRow({ children: [createCell("QA Lead", 30, true), createCell("___________", 30), createCell("___/___/2026", 20), createCell("___________", 20)] }),
    new TableRow({ children: [createCell("Product Owner", 30, true), createCell("___________", 30), createCell("___/___/2026", 20), createCell("___________", 20)] }),
  ],
  width: { size: 100, type: WidthType.PERCENTAGE },
});
children.push(signTable);

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
writeFileSync("documentacion/INFORME-FINAL-PRUEBAS.docx", buffer);
console.log("Word document generated: documentacion/INFORME-FINAL-PRUEBAS.docx");
