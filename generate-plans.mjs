import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TableRow, TableCell, Table, WidthType, BorderStyle, ShadingType } from "docx";
import { jsPDF } from "jspdf";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const root = process.cwd();
const outputDir = resolve(root, "documentacion");

// ========== DOCX GENERATION ==========

function parseMarkdownToDocx(mdContent, title, subtitle) {
  const lines = mdContent.split("\n");
  const children = [];
  
  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 48,
          color: "39A900",
          font: "Helvetica",
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Subtitle
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: subtitle,
          size: 24,
          color: "6B7280",
          font: "Helvetica",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Green line
  children.push(
    new Paragraph({
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 6,
          color: "39A900",
        },
      },
      spacing: { after: 400 },
    })
  );

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === "") {
      children.push(new Paragraph({ spacing: { after: 100 } }));
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      children.push(
        new Paragraph({
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: "E5E7EB",
            },
          },
          spacing: { before: 200, after: 200 },
        })
      );
      continue;
    }

    // Table handling
    if (line.trim().startsWith("|")) {
      const tableLines = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith("|")) {
        tableLines.push(lines[j]);
        j++;
      }
      i = j - 1;

      const rows = tableLines
        .filter((r) => !/^\|[-:\s|]+\|$/.test(r.trim()))
        .map((r) =>
          r
            .split("|")
            .filter((c) => c.trim() !== "")
            .map((c) => c.trim().replace(/\*\*/g, "").replace(/`/g, ""))
        );

      if (rows.length > 0) {
        const table = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: rows.map((row, rowIndex) =>
            new TableRow({
              children: row.map((cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell.substring(0, 50),
                          bold: rowIndex === 0,
                          size: 18,
                          font: "Helvetica",
                        }),
                      ],
                    }),
                  ],
                  shading: rowIndex === 0
                    ? { type: ShadingType.SOLID, color: "39A900" }
                    : rowIndex % 2 === 0
                    ? { type: ShadingType.SOLID, color: "F0FDF4" }
                    : undefined,
                })
              ),
            })
          ),
        });
        children.push(table);
        children.push(new Paragraph({ spacing: { after: 200 } }));
      }
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace(/^# /, "").replace(/\*\*/g, ""),
              bold: true,
              size: 36,
              color: "39A900",
              font: "Helvetica",
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
      continue;
    }

    if (line.startsWith("## ")) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace(/^## /, "").replace(/\*\*/g, ""),
              bold: true,
              size: 28,
              color: "1A1A1A",
              font: "Helvetica",
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
      continue;
    }

    if (line.startsWith("### ")) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace(/^### /, "").replace(/\*\*/g, ""),
              bold: true,
              size: 24,
              color: "2563EB",
              font: "Helvetica",
            }),
          ],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 250, after: 100 },
        })
      );
      continue;
    }

    if (line.startsWith("#### ")) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace(/^#### /, "").replace(/\*\*/g, ""),
              bold: true,
              size: 22,
              color: "6B7280",
              font: "Helvetica",
            }),
          ],
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 200, after: 100 },
        })
      );
      continue;
    }

    // Code block
    if (line.trim().startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: codeLines.join("\n"),
              font: "Courier New",
              size: 18,
            }),
          ],
          shading: { type: ShadingType.SOLID, color: "F3F4F6" },
          spacing: { before: 200, after: 200 },
        })
      );
      continue;
    }

    // Blockquote
    if (line.trim().startsWith("> ")) {
      const text = line.replace(/^> /, "").replace(/\*\*/g, "");
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: text,
              italics: true,
              size: 18,
              color: "2563EB",
              font: "Helvetica",
            }),
          ],
          border: {
            left: { style: BorderStyle.SINGLE, size: 6, color: "2563EB" },
          },
          indent: { left: 400 },
          shading: { type: ShadingType.SOLID, color: "EFF6FF" },
          spacing: { before: 200, after: 200 },
        })
      );
      continue;
    }

    // List items
    if (/^[-*]\s/.test(line.trim())) {
      const text = line.replace(/^[-*]\s/, "").replace(/\*\*/g, "").replace(/`/g, "");
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "• ", color: "39A900", font: "Helvetica" }),
            new TextRun({ text, size: 18, font: "Helvetica" }),
          ],
          indent: { left: 400 },
          spacing: { before: 100, after: 100 },
        })
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line.trim())) {
      const match = line.match(/^(\d+)\.\s(.+)/);
      if (match) {
        const text = match[2].replace(/\*\*/g, "").replace(/`/g, "");
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${match[1]}. `,
                bold: true,
                color: "39A900",
                font: "Helvetica",
              }),
              new TextRun({ text, size: 18, font: "Helvetica" }),
            ],
            indent: { left: 400 },
            spacing: { before: 100, after: 100 },
          })
        );
      }
      continue;
    }

    // Regular paragraph
    const paragraph = new Paragraph({
      children: parseInlineFormatting(line),
      spacing: { before: 100, after: 100 },
    });
    children.push(paragraph);
  }

  return children;
}

function parseInlineFormatting(text) {
  const runs = [];
  const regex = /\*\*(.+?)\*\*|`(.+?)`/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(
        new TextRun({
          text: text.slice(lastIndex, match.index),
          size: 18,
          font: "Helvetica",
        })
      );
    }

    if (match[1]) {
      runs.push(
        new TextRun({
          text: match[1],
          bold: true,
          size: 18,
          font: "Helvetica",
        })
      );
    }

    if (match[2]) {
      runs.push(
        new TextRun({
          text: match[2],
          font: "Courier New",
          size: 18,
          shading: { type: ShadingType.SOLID, color: "F3F4F6" },
        })
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    runs.push(
      new TextRun({
        text: text.slice(lastIndex),
        size: 18,
        font: "Helvetica",
      })
    );
  }

  return runs;
}

async function createDOCX(mdContent, title, subtitle, outputPath) {
  const children = parseMarkdownToDocx(mdContent, title, subtitle);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: children,
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: "Helvetica", size: 22 },
        },
      },
    },
  });

  const buffer = await Packer.toBuffer(doc);
  writeFileSync(outputPath, buffer);
  console.log(`DOCX generado: ${outputPath}`);
}

// ========== PDF GENERATION ==========

function createPDF(mdContent, title, subtitle, outputPath) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = { top: 25, left: 20, right: 20, bottom: 25 };
  const contentWidth = pageWidth - margin.left - margin.right;

  let y = margin.top;

  // Header bar
  doc.setFillColor(57, 169, 0);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(title, margin.left, 12);
  doc.text("SENA Bienestar", pageWidth - margin.right, 12, { align: "right" });

  y = 28;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(57, 169, 0);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, y, { align: "center" });
  y += 8;

  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, pageWidth / 2, y, { align: "center" });
  y += 6;

  // Green line
  doc.setDrawColor(57, 169, 0);
  doc.setLineWidth(0.8);
  doc.line(margin.left, y, pageWidth - margin.right, y);
  y += 10;

  const lines = mdContent.split("\n");

  const checkPageBreak = (needed) => {
    if (y + needed > pageHeight - margin.bottom) {
      doc.addPage();
      y = margin.top;
      return true;
    }
    return false;
  };

  const drawFooter = () => {
    const footerY = pageHeight - 12;
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.setFont("helvetica", "normal");
    doc.text("Sistema de Gestion de Citas - SENA Bienestar", margin.left, footerY);
    doc.text(`Pagina ${doc.internal.getNumberOfPages()}`, pageWidth - margin.right, footerY, { align: "right" });
  };

  const wrapText = (text, maxWidth) => doc.splitTextToSize(text, maxWidth);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === "") { y += 3; continue; }

    if (/^---+$/.test(line.trim())) {
      checkPageBreak(8);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(margin.left, y, pageWidth - margin.right, y);
      y += 6;
      continue;
    }

    // Table handling
    if (line.trim().startsWith("|")) {
      const tableLines = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith("|")) {
        tableLines.push(lines[j]);
        j++;
      }
      i = j - 1;

      const rows = tableLines
        .filter((r) => !/^\|[-:\s|]+\|$/.test(r.trim()))
        .map((r) =>
          r.split("|").filter((c) => c.trim() !== "").map((c) => c.trim().replace(/\*\*/g, "").replace(/`/g, ""))
        );

      if (rows.length > 0) {
        const colCount = Math.max(...rows.map((r) => r.length));
        const colWidth = contentWidth / colCount;
        const rowHeight = 7;
        const totalHeight = rows.length * rowHeight + 4;

        checkPageBreak(totalHeight);

        doc.setFillColor(57, 169, 0);
        doc.rect(margin.left, y, contentWidth, rowHeight, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        
        rows[0].forEach((cell, ci) => {
          doc.text(cell.substring(0, 30), margin.left + ci * colWidth + 3, y + 5);
        });
        y += rowHeight;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(26, 26, 26);
        for (let ri = 1; ri < rows.length; ri++) {
          if (ri % 2 === 0) {
            doc.setFillColor(240, 253, 244);
            doc.rect(margin.left, y, contentWidth, rowHeight, "F");
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(margin.left, y, contentWidth, rowHeight, "F");
          }
          
          rows[ri].forEach((cell, ci) => {
            doc.text(cell.substring(0, 30), margin.left + ci * colWidth + 3, y + 5);
          });

          doc.setDrawColor(229, 231, 235);
          doc.setLineWidth(0.1);
          doc.line(margin.left, y + rowHeight, pageWidth - margin.right, y + rowHeight);
          y += rowHeight;
        }
        y += 4;
      }
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      checkPageBreak(14);
      y += 6;
      doc.setFontSize(18);
      doc.setTextColor(57, 169, 0);
      doc.setFont("helvetica", "bold");
      const text = line.replace(/^# /, "").replace(/\*\*/g, "");
      const wrapped = wrapText(text, contentWidth);
      wrapped.forEach((lt) => { doc.text(lt, margin.left, y); y += 7; });
      y += 1;
      doc.setDrawColor(57, 169, 0);
      doc.setLineWidth(0.5);
      doc.line(margin.left, y, margin.left + 40, y);
      y += 6;
      continue;
    }

    if (line.startsWith("## ")) {
      checkPageBreak(12);
      y += 5;
      doc.setFontSize(14);
      doc.setTextColor(26, 26, 26);
      doc.setFont("helvetica", "bold");
      const text = line.replace(/^## /, "").replace(/\*\*/g, "");
      const wrapped = wrapText(text, contentWidth);
      wrapped.forEach((lt) => { doc.text(lt, margin.left, y); y += 6; });
      y += 1;
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.3);
      doc.line(margin.left, y, margin.left + 40, y);
      y += 5;
      continue;
    }

    if (line.startsWith("### ")) {
      checkPageBreak(10);
      y += 4;
      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235);
      doc.setFont("helvetica", "bold");
      const text = line.replace(/^### /, "").replace(/\*\*/g, "");
      const wrapped = wrapText(text, contentWidth);
      wrapped.forEach((lt) => { doc.text(lt, margin.left, y); y += 5; });
      y += 2;
      continue;
    }

    if (line.startsWith("#### ")) {
      checkPageBreak(8);
      y += 3;
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.setFont("helvetica", "bold");
      const text = line.replace(/^#### /, "").replace(/\*\*/g, "");
      doc.text(text, margin.left, y);
      y += 5;
      continue;
    }

    // Code block
    if (line.trim().startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      const blockHeight = codeLines.length * 4 + 6;
      checkPageBreak(blockHeight);

      doc.setFillColor(243, 244, 246);
      doc.roundedRect(margin.left, y - 2, contentWidth, blockHeight, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(31, 41, 55);
      doc.setFont("courier", "normal");
      codeLines.forEach((cl) => {
        doc.text(cl.substring(0, 80), margin.left + 4, y + 2);
        y += 4;
      });
      y += 4;
      doc.setFont("helvetica", "normal");
      continue;
    }

    // Blockquote
    if (line.trim().startsWith("> ")) {
      checkPageBreak(8);
      const text = line.replace(/^> /, "").replace(/\*\*/g, "");
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(margin.left, y - 3, contentWidth, 8, 1, 1, "F");
      doc.setFillColor(37, 99, 235);
      doc.rect(margin.left, y - 3, 1.5, 8, "F");
      doc.setFontSize(9);
      doc.setTextColor(37, 99, 235);
      doc.setFont("helvetica", "italic");
      const wrapped = wrapText(text, contentWidth - 8);
      wrapped.forEach((lt) => { doc.text(lt, margin.left + 6, y + 2); y += 4; });
      y += 4;
      doc.setFont("helvetica", "normal");
      continue;
    }

    // List items
    if (/^[-*]\s/.test(line.trim())) {
      checkPageBreak(6);
      const text = line.replace(/^[-*]\s/, "").replace(/\*\*/g, "").replace(/`/g, "");
      doc.setFillColor(57, 169, 0);
      doc.circle(margin.left + 3, y + 1, 1, "F");
      doc.setFontSize(9);
      doc.setTextColor(26, 26, 26);
      doc.setFont("helvetica", "normal");
      const wrapped = wrapText(text, contentWidth - 10);
      wrapped.forEach((lt, li) => {
        if (li === 0) { doc.text(lt, margin.left + 8, y + 2); }
        else { y += 4; doc.text(lt, margin.left + 8, y + 2); }
      });
      y += 5;
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line.trim())) {
      checkPageBreak(6);
      const match = line.match(/^(\d+)\.\s(.+)/);
      if (match) {
        const text = match[2].replace(/\*\*/g, "").replace(/`/g, "");
        doc.setFillColor(57, 169, 0);
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(match[1], margin.left + 3, y + 1.5, { align: "center" });
        doc.setFontSize(9);
        doc.setTextColor(26, 26, 26);
        doc.setFont("helvetica", "normal");
        const wrapped = wrapText(text, contentWidth - 12);
        wrapped.forEach((lt, li) => {
          if (li === 0) { doc.text(lt, margin.left + 10, y + 2); }
          else { y += 4; doc.text(lt, margin.left + 10, y + 2); }
        });
        y += 5;
      }
      continue;
    }

    // Regular paragraph
    checkPageBreak(6);
    doc.setFontSize(9);
    doc.setTextColor(26, 26, 26);
    doc.setFont("helvetica", "normal");

    const boldParts = line.split(/\*\*(.+?)\*\*/);
    let x = margin.left;
    boldParts.forEach((part, pi) => {
      const cleanPart = part.replace(/`/g, "");
      if (pi % 2 === 1) { doc.setFont("helvetica", "bold"); }
      else { doc.setFont("helvetica", "normal"); }
      const splitText = doc.splitTextToSize(cleanPart, contentWidth - (x - margin.left));
      splitText.forEach((lt, li) => {
        if (x === margin.left || li === 0) { doc.text(lt, x, y + 2); }
        else { y += 4; doc.text(lt, margin.left, y + 2); }
      });
      x += doc.getTextWidth(cleanPart);
    });
    y += 5;
  }

  // Add footers
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter();
  }

  doc.save(outputPath);
  console.log(`PDF generado: ${outputPath}`);
}

// ========== MAIN ==========

const documents = [
  {
    mdFile: "PLAN-MIGRACION-DATOS.md",
    title: "Plan de Migracion de Datos",
    subtitle: "Sistema de Gestion de Citas - SENA Bienestar",
    docxFile: "PLAN-MIGRACION-DATOS.docx",
    pdfFile: "PLAN-MIGRACION-DATOS.pdf",
  },
  {
    mdFile: "PLAN-BACKUP-DATOS.md",
    title: "Plan de Respaldo de Datos",
    subtitle: "Sistema de Gestion de Citas - SENA Bienestar",
    docxFile: "PLAN-BACKUP-DATOS.docx",
    pdfFile: "PLAN-BACKUP-DATOS.pdf",
  },
  {
    mdFile: "PLAN-INSTALACION.md",
    title: "Plan de Instalacion",
    subtitle: "Sistema de Gestion de Citas - SENA Bienestar",
    docxFile: "PLAN-INSTALACION.docx",
    pdfFile: "PLAN-INSTALACION.pdf",
  },
];

async function generateAll() {
  console.log("=== Generando documentos ===\n");

  for (const doc of documents) {
    const mdPath = resolve(root, doc.mdFile);
    
    if (!existsSync(mdPath)) {
      console.error(`Error: No se encontro ${doc.mdFile}`);
      continue;
    }

    const mdContent = readFileSync(mdPath, "utf-8");

    // Generate DOCX
    const docxPath = resolve(outputDir, doc.docxFile);
    await createDOCX(mdContent, doc.title, doc.subtitle, docxPath);

    // Generate PDF
    const pdfPath = resolve(outputDir, doc.pdfFile);
    createPDF(mdContent, doc.title, doc.subtitle, pdfPath);

    console.log("");
  }

  console.log("=== Todos los documentos generados ===");
}

generateAll().catch(console.error);
