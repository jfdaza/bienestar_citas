import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TableRow, TableCell, Table, WidthType, BorderStyle, ShadingType } from "docx";
import { writeFileSync } from "fs";
import { resolve } from "path";

const root = process.cwd();

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } },
    },
  },
  sections: [
    {
      children: [
        // Title
        new Paragraph({
          children: [
            new TextRun({ text: "Plan de Correccion y Mejora", bold: true, size: 48, color: "39A900", font: "Calibri" }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Sistema de Gestion de Citas - SENA Bienestar", size: 24, color: "6B7280", font: "Calibri" }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Fecha: ${new Date().toLocaleDateString("es-CO")}  |  Estado: En Progreso`, size: 20, color: "9CA3AF", italics: true }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // FASE 1
        new Paragraph({
          children: [new TextRun({ text: "FASE 1: Bugs Criticos (rompen funcionalidad)", bold: true, size: 32, color: "DC2626" })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 },
        }),

        // 1.1
        new Paragraph({
          children: [new TextRun({ text: "1.1 - CalendarView.jsx: Import path roto", bold: true, size: 26, color: "1E40AF" })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        makeBullet("Archivo: src/features/appointments/components/CalendarView.jsx (linea 3)"),
        makeBullet("Problema: El import '../../../../lib/supabase' resuelve fuera del directorio src/."),
        makeBullet("Fix: Cambiar a '../../../lib/supabase' (tres niveles, no cuatro)."),
        makeBullet("Estado: PENDIENTE"),

        // 1.2
        new Paragraph({
          children: [new TextRun({ text: "1.2 - Register.jsx: Faltan inputs de email y contrasena", bold: true, size: 26, color: "1E40AF" })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        makeBullet("Archivo: src/features/auth/pages/Register.jsx"),
        makeBullet("Problema: El state inicializa email, password, confirmPassword pero no existen inputs en el JSX del Paso 2. El formulario siempre falla con 'La contrasena debe tener al menos 6 caracteres'."),
        makeBullet("Fix: Agregar campos email, password y confirmPassword al Step 2 del formulario."),
        makeBullet("Estado: PENDIENTE"),

        // 1.3
        new Paragraph({
          children: [new TextRun({ text: "1.3 - Register.jsx: Campos recolectados pero nunca guardados", bold: true, size: 26, color: "1E40AF" })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        makeBullet("Archivo: src/features/auth/pages/Register.jsx (lineas 125-128)"),
        makeBullet("Problema: document_type, ficha_number, training_program se recolectan en el form pero nunca se envian a signUp()."),
        makeBullet("Fix: Pasar estos campos en el objeto userData de signUp() y guardarlos en el perfil."),
        makeBullet("Estado: PENDIENTE"),

        // FASE 2
        new Paragraph({
          children: [new TextRun({ text: "FASE 2: Bugs de Validacion / UI", bold: true, size: 32, color: "D97706" })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        // 2.1
        new Paragraph({
          children: [new TextRun({ text: "2.1 - AppointmentForm: Razon 'opcional' pero requerida", bold: true, size: 26, color: "1E40AF" })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        makeBullet("Archivos: AppointmentForm.jsx (linea 284) + appointment.schema.js (lineas 39-42)"),
        makeBullet("Problema: El UI dice '(opcional)' pero Zod requiere min(10) caracteres. Tambien mismatch de max length (UI: 250, schema: 500)."),
        makeBullet("Fix: Hacer el campo reason opcional en Zod con .optional() y ajustar max length a 250."),
        makeBullet("Estado: PENDIENTE"),

        // FASE 3 (resumen)
        new Paragraph({
          children: [new TextRun({ text: "FASE 3: Funcionalidades Incompletas (pendientes)", bold: true, size: 32, color: "7C3AED" })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        makeBullet("3.1 - ProfileMenu: Editar perfil no persiste en BD"),
        makeBullet("3.2 - CoordinationDashboard: Filtros estaticos y valores hardcodeados"),
        makeBullet("3.3 - ProfessionalDashboard: Bottom nav placeholder sin handlers"),

        // FASE 4
        new Paragraph({
          children: [new TextRun({ text: "FASE 4: Infraestructura (pendientes)", bold: true, size: 32, color: "7C3AED" })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        makeBullet("4.1 - Falta MANUAL-USUARIO.md para scripts de generacion DOCX/PDF"),
        makeBullet("4.2 - README.md sigue siendo el generico de Vite"),
        makeBullet("4.1 - Crear .env.example"),

        // FASE 5
        new Paragraph({
          children: [new TextRun({ text: "FASE 5: Tests (pendientes)", bold: true, size: 32, color: "7C3AED" })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        makeBullet("Solo 3 de ~20+ componentes tienen tests (19 tests totales)"),
        makeBullet("Faltan: Login, Register, AppointmentForm, AppointmentEditForm, AppointmentCard, ProtectedRoute, AuthProvider, hooks, repositorios, admin, dashboard"),

        // Tabla resumen
        new Paragraph({
          children: [new TextRun({ text: "Resumen de Prioridad", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            headerRow(["#", "Tarea", "Prioridad", "Estado"]),
            dataRow(["1.1", "Fix import CalendarView", "Alta", "COMPLETADO"]),
            dataRow(["1.2", "Inputs email/password Register", "Alta", "COMPLETADO"]),
            dataRow(["1.3", "Guardar campos en registro", "Alta", "COMPLETADO"]),
            dataRow(["2.1", "Unificar reason opcional/requerido", "Media", "COMPLETADO"]),
            dataRow(["3.1", "Persistir edicion de perfil", "Media", "PENDIENTE"]),
            dataRow(["3.2", "Filtros CoordinationDashboard", "Media", "PENDIENTE"]),
            dataRow(["3.3", "Bottom nav ProfessionalDashboard", "Baja", "PENDIENTE"]),
            dataRow(["4.1", "Crear MANUAL-USUARIO.md", "Baja", "PENDIENTE"]),
            dataRow(["4.2", "Actualizar README.md", "Baja", "PENDIENTE"]),
            dataRow(["5.1", "Agregar tests criticos", "Media", "PENDIENTE"]),
          ],
        }),
      ],
    },
  ],
});

function makeBullet(text) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 22 })],
    spacing: { after: 60 },
    indent: { left: 720 },
  });
}

function headerRow(cells) {
  return new TableRow({
    tableHeader: true,
    children: cells.map(
      (text) =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: "39A900" },
          children: [
            new Paragraph({
              children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20, font: "Calibri" })],
              alignment: AlignmentType.CENTER,
            }),
          ],
        })
    ),
  });
}

function dataRow(cells) {
  return new TableRow({
    children: cells.map(
      (text) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text, size: 20, font: "Calibri" })],
              alignment: AlignmentType.CENTER,
            }),
          ],
        })
    ),
  });
}

const buffer = await Packer.toBuffer(doc);
const outPath = resolve(root, "PLAN-CORRECCION.docx");
writeFileSync(outPath, buffer);
console.log(`Plan generado: ${outPath}`);
