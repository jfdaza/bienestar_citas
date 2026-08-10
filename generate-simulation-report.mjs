import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  PageOrientation,
} from "docx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ERRORS_FILE = path.join(__dirname, "test-results", "simulation-errors.json");
const OUTPUT_FILE = path.join(__dirname, "test-results", "INFORME-ERRORES-SIMULACION.docx");

const PRIORITY_ORDER = [
  { key: "SECURITY", label: "SEGURIDAD", priority: "CRITICA" },
  { key: "AUTH", label: "AUTENTICACION", priority: "CRITICA" },
  { key: "CONSOLE", label: "CONSOLA / CORS / CSP", priority: "ALTA" },
  { key: "NETWORK", label: "RED", priority: "ALTA" },
  { key: "UI", label: "INTERFAZ DE USUARIO", priority: "MEDIA" },
  { key: "NAVIGATION", label: "NAVEGACION", priority: "MEDIA" },
  { key: "VALIDATION", label: "VALIDACION", priority: "BAJA" },
  { key: "RESPONSIVE", label: "RESPONSIVE", priority: "BAJA" },
  { key: "ACCESSIBILITY", label: "ACCESIBILIDAD", priority: "BAJA" },
  { key: "PERFORMANCE", label: "RENDIMIENTO", priority: "BAJA" },
];

function line(text, opts = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: opts.bold || false,
        size: opts.size || 22,
        color: opts.color || "1A1A2E",
        font: "Consolas",
      }),
    ],
    spacing: { after: opts.after || 40, before: opts.before || 0 },
    alignment: opts.align || AlignmentType.LEFT,
  });
}

function empty() {
  return new Paragraph({ children: [], spacing: { after: 20 } });
}

async function generateReport() {
  if (!fs.existsSync(ERRORS_FILE)) {
    console.error("No se encontro el archivo de errores.");
    process.exit(1);
  }

  const errors = JSON.parse(fs.readFileSync(ERRORS_FILE, "utf-8"));

  const grouped = {};
  errors.forEach((e) => {
    if (!grouped[e.category]) grouped[e.category] = [];
    grouped[e.category].push(e);
  });

  const c = [];

  // Header
  c.push(line("═══════════════════════════════════════════════════════", { bold: true, size: 20, color: "2C3E50" }));
  c.push(line("       INFORME DE ERRORES - SIMULACION PLAYWRIGHT", { bold: true, size: 26, color: "1A1A2E", align: AlignmentType.CENTER }));
  c.push(line("       Gestion de Citas - Bienestar SENA", { size: 22, color: "555555", align: AlignmentType.CENTER }));
  c.push(line("═══════════════════════════════════════════════════════", { bold: true, size: 20, color: "2C3E50" }));
  c.push(empty());
  c.push(line(`Fecha: ${new Date().toLocaleString("es-CO")}`, { size: 20, color: "666666" }));
  c.push(line(`Total errores: ${errors.length}`, { bold: true, size: 22, color: errors.length > 0 ? "E74C3C" : "27AE60" }));
  c.push(empty());

  // Resumen
  c.push(line("───────────────────────────────────────────────────────", { color: "2C3E50" }));
  c.push(line("  RESUMEN POR PRIORIDAD", { bold: true, size: 24, color: "1A1A2E" }));
  c.push(line("───────────────────────────────────────────────────────", { color: "2C3E50" }));

  PRIORITY_ORDER.forEach((p) => {
    const errs = grouped[p.key];
    if (!errs || errs.length === 0) return;
    const bar = "█".repeat(Math.min(errs.length * 2, 20));
    c.push(line(`  [${p.priority.padEnd(8)}] ${p.label.padEnd(24)} ${String(errs.length).padStart(2)}  ${bar}`, { size: 20, color: "333333" }));
  });

  c.push(empty());

  // Detalle
  c.push(line("───────────────────────────────────────────────────────", { color: "2C3E50" }));
  c.push(line("  DETALLE DE ERRORES", { bold: true, size: 24, color: "1A1A2E" }));
  c.push(line("───────────────────────────────────────────────────────", { color: "2C3E50" }));

  let counter = 0;

  PRIORITY_ORDER.forEach((p) => {
    const errs = grouped[p.key];
    if (!errs || errs.length === 0) return;

    c.push(empty());
    c.push(line(`═══ ${p.label} (${p.priority}) ═══`, { bold: true, size: 22, color: "2C3E50", before: 100 }));

    errs.forEach((e) => {
      counter++;
      c.push(empty());
      c.push(line(`${counter}. ${e.description}`, { bold: true, size: 22, color: "1A1A2E" }));
      c.push(line(`   Test: ${e.testId}`, { size: 20, color: "555555" }));

      if (e.url) {
        c.push(line(`   URL:  ${e.url}`, { size: 20, color: "2980B9" }));
      }

      if (e.errors && e.errors.length > 0) {
        const unique = [...new Set(e.errors)];
        unique.forEach((err) => {
          let txt = err;
          if (txt.includes("Content Security Policy")) {
            txt = "CSP bloqueado: " + txt.split("violates the following")[0].trim();
          } else if (txt.includes("CORS policy")) {
            txt = "CORS bloqueado: " + txt.substring(0, 100);
          } else if (txt.includes("Failed to load resource")) {
            txt = "HTTP Error: " + txt;
          } else if (txt.includes("Fetch API cannot load")) {
            txt = "Fetch bloqueado: " + txt.substring(0, 100);
          }
          c.push(line(`     • ${txt.substring(0, 130)}`, { size: 18, color: "888888" }));
        });
      }

      if (e.error) {
        c.push(line(`     • ${e.error.substring(0, 130)}`, { size: 18, color: "888888" }));
      }
    });
  });

  c.push(empty());

  // Recomendaciones
  c.push(line("───────────────────────────────────────────────────────", { color: "2C3E50" }));
  c.push(line("  RECOMENDACIONES", { bold: true, size: 24, color: "1A1A2E" }));
  c.push(line("───────────────────────────────────────────────────────", { color: "2C3E50" }));
  c.push(empty());

  const recs = [
    "[CRITICA] Corregir proteccion de rutas: /app debe redirigir a /login si no hay sesion.",
    "[ALTA]    Configurar CORS en Edge Functions de Supabase para permitir origenes locales.",
    "[ALTA]    Actualizar politica CSP para permitir api.ipify.org o eliminar esa dependencia.",
    "[MEDIA]   Verificar que todos los componentes del dashboard cargan segun el rol.",
    "[MEDIA]   Revisar rutas catch-all para que redirijan a /login correctamente.",
  ];

  recs.forEach((r) => {
    c.push(line(`  • ${r}`, { size: 20, color: "333333" }));
  });

  c.push(empty());
  c.push(line("═══════════════════════════════════════════════════════", { color: "CCCCCC" }));
  c.push(line("  Informe generado automaticamente por Playwright", { size: 18, color: "AAAAAA" }));

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: c,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, buffer);

  // Tambien generar un archivo .txt para copiar facil
  const txtFile = path.join(__dirname, "test-results", "INFORME-ERRORES.txt");
  let txt = "";
  txt += "═══════════════════════════════════════════════════════\n";
  txt += "       INFORME DE ERRORES - SIMULACION PLAYWRIGHT\n";
  txt += "       Gestion de Citas - Bienestar SENA\n";
  txt += "═══════════════════════════════════════════════════════\n\n";
  txt += `Fecha: ${new Date().toLocaleString("es-CO")}\n`;
  txt += `Total errores: ${errors.length}\n\n`;

  txt += "───────────────────────────────────────────────────────\n";
  txt += "  RESUMEN POR PRIORIDAD\n";
  txt += "───────────────────────────────────────────────────────\n";

  PRIORITY_ORDER.forEach((p) => {
    const errs = grouped[p.key];
    if (!errs || errs.length === 0) return;
    const bar = "█".repeat(Math.min(errs.length * 2, 20));
    txt += `  [${p.priority.padEnd(8)}] ${p.label.padEnd(24)} ${String(errs.length).padStart(2)}  ${bar}\n`;
  });

  txt += "\n───────────────────────────────────────────────────────\n";
  txt += "  DETALLE DE ERRORES\n";
  txt += "───────────────────────────────────────────────────────\n";

  counter = 0;
  PRIORITY_ORDER.forEach((p) => {
    const errs = grouped[p.key];
    if (!errs || errs.length === 0) return;

    txt += `\n═══ ${p.label} (${p.priority}) ═══\n`;

    errs.forEach((e) => {
      counter++;
      txt += `\n${counter}. ${e.description}\n`;
      txt += `   Test: ${e.testId}\n`;
      if (e.url) txt += `   URL:  ${e.url}\n`;
      if (e.errors) {
        [...new Set(e.errors)].forEach((err) => {
          let t = err;
          if (t.includes("Content Security Policy")) t = "CSP bloqueado: " + t.split("violates the following")[0].trim();
          else if (t.includes("CORS policy")) t = "CORS bloqueado: " + t.substring(0, 100);
          else if (t.includes("Failed to load resource")) t = "HTTP Error: " + t;
          else if (t.includes("Fetch API cannot load")) t = "Fetch bloqueado: " + t.substring(0, 100);
          txt += `     • ${t.substring(0, 130)}\n`;
        });
      }
      if (e.error) txt += `     • ${e.error.substring(0, 130)}\n`;
    });
  });

  txt += "\n───────────────────────────────────────────────────────\n";
  txt += "  RECOMENDACIONES\n";
  txt += "───────────────────────────────────────────────────────\n\n";
  recs.forEach((r) => { txt += `  • ${r}\n`; });
  txt += "\n═══════════════════════════════════════════════════════\n";
  txt += "  Informe generado automaticamente por Playwright\n";

  fs.writeFileSync(txtFile, txt, "utf-8");

  console.log(`\nINFORMES GENERADOS:`);
  console.log(`  Word: ${OUTPUT_FILE}`);
  console.log(`  TXT:  ${txtFile}`);
  console.log(`\nTotal: ${errors.length} errores\n`);

  // Imprimir en consola para copiar directamente
  console.log(txt);
}

generateReport().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
