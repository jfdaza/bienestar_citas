import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TableRow, TableCell, Table, WidthType, BorderStyle, ShadingType } from "docx";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const root = process.cwd();

function parseMarkdownToDocx(mdContent) {
  const lines = mdContent.split("\n");
  const children = [];
  
  // Add title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Manual de Usuario",
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

  // Add subtitle
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Sistema de Gestión de Citas - SENA Bienestar",
          size: 24,
          color: "6B7280",
          font: "Helvetica",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Add green line
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

    // Empty line
    if (line.trim() === "") {
      children.push(new Paragraph({ spacing: { after: 100 } }));
      continue;
    }

    // Horizontal rule
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

      // Parse table
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
                        color: "39A900",
                      }
                    : rowIndex % 2 === 0
                    ? {
                        type: ShadingType.SOLID,
                        color: "F0FDF4",
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
          shading: {
            type: ShadingType.SOLID,
            color: "F3F4F6",
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
              color: "2563EB",
              font: "Helvetica",
            }),
          ],
          border: {
            left: {
              style: BorderStyle.SINGLE,
              size: 6,
              color: "2563EB",
            },
          },
          indent: { left: 400 },
          shading: {
            type: ShadingType.SOLID,
            color: "EFF6FF",
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
              color: "39A900",
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
                color: "39A900",
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
    // Add text before the match
    if (match.index > lastIndex) {
      runs.push(
        new TextRun({
          text: text.slice(lastIndex, match.index),
          size: 18,
          font: "Helvetica",
        })
      );
    }

    // Add bold text
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

    // Add code text
    if (match[2]) {
      runs.push(
        new TextRun({
          text: match[2],
          font: "Courier New",
          size: 18,
          shading: {
            type: ShadingType.SOLID,
            color: "F3F4F6",
          },
        })
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
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

async function createManualDOCX(mdContent, title, subtitle, outputPath) {
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
  console.log(`Generado: ${outputPath}`);
}

// Generate DOCX manual
const usuarioMd = readFileSync(resolve(root, "MANUAL-USUARIO.md"), "utf-8");

createManualDOCX(
  usuarioMd,
  "Manual de Usuario",
  "Sistema de Gestión de Citas - SENA Bienestar",
  resolve(root, "MANUAL-USUARIO.docx")
);
