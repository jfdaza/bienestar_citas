import { jsPDF } from "jspdf";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const root = process.cwd();

function createInformePDF(mdContent, outputPath) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = { top: 25, left: 20, right: 20, bottom: 25 };
  const contentWidth = pageWidth - margin.left - margin.right;

  let y = margin.top;

  // Header bar - Red for security
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("INFORME DE SEGURIDAD, RENDIMIENTO Y PRODUCCION", margin.left, 12);
  doc.text("SENA Bienestar", pageWidth - margin.right, 12, { align: "right" });

  y = 28;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(220, 38, 38);
  doc.setFont("helvetica", "bold");
  doc.text("Informe de Seguridad,", pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.text("Rendimiento y Puesta en Marcha", pageWidth / 2, y, { align: "center" });
  y += 8;

  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestion de Citas - SENA Bienestar", pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.text("Fecha: 08 de julio de 2026", pageWidth / 2, y, { align: "center" });
  y += 6;

  // Red line
  doc.setDrawColor(220, 38, 38);
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
    doc.text(
      `Pagina ${doc.internal.getNumberOfPages()}`,
      pageWidth - margin.right,
      footerY,
      { align: "right" }
    );
  };

  const wrapText = (text, maxWidth) => {
    return doc.splitTextToSize(text, maxWidth);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === "") {
      y += 3;
      continue;
    }

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
          r
            .split("|")
            .filter((c) => c.trim() !== "")
            .map((c) => c.trim().replace(/\*\*/g, "").replace(/`/g, ""))
        );

      if (rows.length > 0) {
        const colCount = Math.max(...rows.map((r) => r.length));
        const colWidth = contentWidth / colCount;
        const rowHeight = 7;
        const totalHeight = rows.length * rowHeight + 4;

        checkPageBreak(totalHeight);

        // Draw table header with red background
        doc.setFillColor(220, 38, 38);
        doc.rect(margin.left, y, contentWidth, rowHeight, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);

        rows[0].forEach((cell, ci) => {
          const cellX = margin.left + ci * colWidth + 3;
          const cellText = cell.substring(0, 30);
          doc.text(cellText, cellX, y + 5);
        });
        y += rowHeight;

        // Draw data rows
        doc.setFont("helvetica", "normal");
        doc.setTextColor(26, 26, 26);
        for (let ri = 1; ri < rows.length; ri++) {
          if (ri % 2 === 0) {
            doc.setFillColor(254, 242, 242);
            doc.rect(margin.left, y, contentWidth, rowHeight, "F");
          } else {
            doc.setFillColor(255, 255, 255);
            doc.rect(margin.left, y, contentWidth, rowHeight, "F");
          }

          rows[ri].forEach((cell, ci) => {
            const cellX = margin.left + ci * colWidth + 3;
            const cellText = cell.substring(0, 30);
            doc.text(cellText, cellX, y + 5);
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
      doc.setTextColor(220, 38, 38);
      doc.setFont("helvetica", "bold");
      const text = line.replace(/^# /, "").replace(/\*\*/g, "");
      const wrapped = wrapText(text, contentWidth);
      wrapped.forEach((lineText) => {
        doc.text(lineText, margin.left, y);
        y += 7;
      });
      y += 1;
      doc.setDrawColor(220, 38, 38);
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
      wrapped.forEach((lineText) => {
        doc.text(lineText, margin.left, y);
        y += 6;
      });
      y += 1;
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.3);
      doc.line(margin.left, y, margin.left + 40, y);
      y += 5;
      continue;
    }

    if (line.startsWith("### ")) {
      checkPageBreak(10);
      y += 4;
      doc.setFontSize(11);
      doc.setTextColor(185, 28, 28);
      doc.setFont("helvetica", "bold");
      const text = line.replace(/^### /, "").replace(/\*\*/g, "");
      const wrapped = wrapText(text, contentWidth);
      wrapped.forEach((lineText) => {
        doc.text(lineText, margin.left, y);
        y += 5;
      });
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

      doc.setFillColor(254, 242, 242);
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
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(margin.left, y - 3, contentWidth, 8, 1, 1, "F");
      doc.setFillColor(220, 38, 38);
      doc.rect(margin.left, y - 3, 1.5, 8, "F");
      doc.setFontSize(9);
      doc.setTextColor(220, 38, 38);
      doc.setFont("helvetica", "italic");
      const wrapped = wrapText(text, contentWidth - 8);
      wrapped.forEach((lineText) => {
        doc.text(lineText, margin.left + 6, y + 2);
        y += 4;
      });
      y += 4;
      doc.setFont("helvetica", "normal");
      continue;
    }

    // List items
    if (/^[-*]\s/.test(line.trim())) {
      checkPageBreak(6);
      const text = line.replace(/^[-*]\s/, "").replace(/\*\*/g, "").replace(/`/g, "");
      doc.setFillColor(220, 38, 38);
      doc.circle(margin.left + 3, y + 1, 1, "F");
      doc.setFontSize(9);
      doc.setTextColor(26, 26, 26);
      doc.setFont("helvetica", "normal");
      const wrapped = wrapText(text, contentWidth - 10);
      wrapped.forEach((lineText, li) => {
        if (li === 0) {
          doc.text(lineText, margin.left + 8, y + 2);
        } else {
          y += 4;
          doc.text(lineText, margin.left + 8, y + 2);
        }
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
        doc.setFillColor(220, 38, 38);
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(match[1], margin.left + 3, y + 1.5, { align: "center" });
        doc.setFontSize(9);
        doc.setTextColor(26, 26, 26);
        doc.setFont("helvetica", "normal");
        const wrapped = wrapText(text, contentWidth - 12);
        wrapped.forEach((lineText, li) => {
          if (li === 0) {
            doc.text(lineText, margin.left + 10, y + 2);
          } else {
            y += 4;
            doc.text(lineText, margin.left + 10, y + 2);
          }
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
      if (pi % 2 === 1) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }
      const splitText = doc.splitTextToSize(cleanPart, contentWidth - (x - margin.left));
      splitText.forEach((lineText, li) => {
        if (x === margin.left || li === 0) {
          doc.text(lineText, x, y + 2);
        } else {
          y += 4;
          doc.text(lineText, margin.left, y + 2);
        }
      });
      x += doc.getTextWidth(cleanPart);
    });
    y += 5;
  }

  // Add footers to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter();
  }

  doc.save(outputPath);
  console.log(`Generado PDF: ${outputPath}`);
}

// Generate PDF
const mdContent = readFileSync(resolve(root, "INFORME-SEGURIDAD-RENDIMIENTO-PRODUCCION.md"), "utf-8");

createInformePDF(
  mdContent,
  resolve(root, "INFORME-SEGURIDAD-RENDIMIENTO-PRODUCCION.pdf")
);
