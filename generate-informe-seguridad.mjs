import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TableRow, TableCell, Table, WidthType, BorderStyle, ShadingType } from "docx";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const root = process.cwd();

function parseMarkdownToDocx(mdContent) {
  const lines = mdContent.split("\n");
  const children = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Informe de Seguridad, Rendimiento y Puesta en Marcha",
          bold: true,
          size: 48,
          color: "DC2626",
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
          text: "Sistema de Gestion de Citas - SENA Bienestar",
          size: 24,
          color: "6B7280",
          font: "Helvetica",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // Date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Fecha: 08 de julio de 2026",
          size: 20,
          color: "6B7280",
          font: "Helvetica",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Red line
  children.push(
    new Paragraph({
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 6,
          color: "DC2626",
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
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: rows.map((row, rowIndex) =>
            new TableRow({
              children: row.map((cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell,
                          bold: rowIndex === 0,
                          size: 18,
                          font: "Helvetica",
                        }),
                      ],
                    }),
                  ],
                  shading: rowIndex === 0
                    ? {
                        type: ShadingType.SOLID,
                        color: "DC2626",
                      }
                    : rowIndex % 2 === 0
                    ? {
                        type: ShadingType.SOLID,
                        color: "FEF2F2",
                      }
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
              color: "DC2626",
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
              color: "B91C1C",
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
          shading: {
            type: ShadingType.SOLID,
            color: "FEF2F2",
          },
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
              color: "DC2626",
              font: "Helvetica",
            }),
          ],
          border: {
            left: {
              style: BorderStyle.SINGLE,
              size: 6,
              color: "DC2626",
            },
          },
          indent: { left: 400 },
          shading: {
            type: ShadingType.SOLID,
            color: "FEF2F2",
          },
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
            new TextRun({
              text: "• ",
              color: "DC2626",
              font: "Helvetica",
            }),
            new TextRun({
              text: text,
              size: 18,
              font: "Helvetica",
            }),
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
                color: "DC2626",
                font: "Helvetica",
              }),
              new TextRun({
                text: text,
                size: 18,
                font: "Helvetica",
              }),
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
          shading: {
            type: ShadingType.SOLID,
            color: "FEF2F2",
          },
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

async function createInformeDOCX(mdContent, outputPath) {
  const children = parseMarkdownToDocx(mdContent);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: children,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: "Helvetica",
            size: 22,
          },
        },
      },
    },
  });

  const buffer = await Packer.toBuffer(doc);
  writeFileSync(outputPath, buffer);
  console.log(`Generado DOCX: ${outputPath}`);
}

// Generate DOCX
const mdContent = readFileSync(resolve(root, "INFORME-SEGURIDAD-RENDIMIENTO-PRODUCCION.md"), "utf-8");

createInformeDOCX(
  mdContent,
  resolve(root, "INFORME-SEGURIDAD-RENDIMIENTO-PRODUCCION.docx")
);
