import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  BorderStyle,
  VerticalAlign,
  HeadingLevel
} from 'docx';

/**
 * Generates a clean, professional Word document (.docx)
 * representing the reimbursement claim form.
 */
export function generateReimbursementDocx(data) {
  const { employeeDetails, items, advance, totalReimbursement, totalInWords } = data;
  const subTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Border styles
  const singleBorder = { style: BorderStyle.SINGLE, size: 8, color: "CCCCCC" };
  const borderNone = { style: BorderStyle.NONE };
  const doubleBorderBottom = { style: BorderStyle.DOUBLE, size: 12, color: "0F5132" };

  const cellPadding = {
    top: 100,
    bottom: 100,
    left: 150,
    right: 150
  };

  // Helper to create paragraphs
  const createTitlePara = (text, size, bold = true, color = "1A1A1A", spacing = 100, align = AlignmentType.CENTER) => {
    return new Paragraph({
      alignment: align,
      spacing: { before: spacing, after: spacing },
      children: [
        new TextRun({
          text,
          bold,
          size: size * 2, // half-points
          font: "Inter",
          color
        })
      ]
    });
  };

  // 1. Metadata Table (Header Fields)
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: borderNone,
      bottom: borderNone,
      left: borderNone,
      right: borderNone,
      insideHorizontal: borderNone,
      insideVertical: borderNone
    },
    rows: [
      // Row 1: SI. NO | DATE
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "SI. NO / FY: ", bold: true, font: "Inter", size: 20 }),
                  new TextRun({ text: employeeDetails.title || "Reimbursement 26-27", font: "Inter", size: 20 })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "DATE: ", bold: true, font: "Inter", size: 20 }),
                  new TextRun({ text: employeeDetails.date || "", font: "Inter", size: 20 })
                ]
              })
            ]
          })
        ]
      }),
      // Row 2: NAME | CODE
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "NAME: ", bold: true, font: "Inter", size: 20 }),
                  new TextRun({ text: employeeDetails.name || "", font: "Inter", size: 20 })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "CODE: ", bold: true, font: "Inter", size: 20 }),
                  new TextRun({ text: employeeDetails.code || "", font: "Inter", size: 20 })
                ]
              })
            ]
          })
        ]
      }),
      // Row 3: Reimbursement No | DEPARTMENT
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Reimbursement No: ", bold: true, font: "Inter", size: 20 }),
                  new TextRun({ text: employeeDetails.reimbursementNo || "", font: "Inter", size: 20 })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "DEPARTMENT: ", bold: true, font: "Inter", size: 20 }),
                  new TextRun({ text: employeeDetails.department || "", font: "Inter", size: 20 })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // 2. Main Expense Table Header
  const headers = [
    { text: "Sl No", width: 5 },
    { text: "Date", width: 10 },
    { text: "Vendor Name", width: 12 },
    { text: "Mode", width: 8 },
    { text: "Nature Of Expense", width: 12 },
    { text: "From", width: 8 },
    { text: "To", width: 8 },
    { text: "Purpose", width: 13 },
    { text: "Cost Center", width: 8 },
    { text: "Work Assigned by", width: 8 },
    { text: "kms", width: 4 },
    { text: "Amount (Rs)", width: 8 }
  ];

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      width: { size: h.width, type: WidthType.PERCENTAGE },
      shading: { fill: "0F5132" }, // Forest green
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 120, bottom: 120, left: 80, right: 80 },
      borders: {
        top: singleBorder,
        bottom: singleBorder,
        left: singleBorder,
        right: singleBorder
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: h.text, bold: true, color: "FFFFFF", font: "Inter", size: 16 })
          ]
        })
      ]
    }))
  });

  // 3. Dynamic Items Rows
  const itemRows = items.map((item, index) => {
    const rowCells = [
      String(index + 1),
      item.date || "",
      item.vendorName || "",
      item.mode || "",
      item.natureOfExpense || "",
      item.from || "",
      item.to || "",
      item.purpose || "",
      item.costCenter || "",
      item.workAssignedBy || "",
      item.kms !== "" && item.kms !== undefined ? String(item.kms) : "",
      item.amount ? `${item.amount}/-` : "0/-"
    ];

    const isEven = index % 2 === 1;

    return new TableRow({
      children: rowCells.map((val, cellIndex) => new TableCell({
        width: { size: headers[cellIndex].width, type: WidthType.PERCENTAGE },
        shading: isEven ? { fill: "F8F9FA" } : undefined, // alternating rows
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 100, bottom: 100, left: 80, right: 80 },
        borders: {
          top: singleBorder,
          bottom: singleBorder,
          left: singleBorder,
          right: singleBorder
        },
        children: [
          new Paragraph({
            alignment: [0, 10, 11].includes(cellIndex) ? AlignmentType.CENTER : AlignmentType.LEFT,
            children: [
              new TextRun({ text: val, font: "Inter", size: 16 })
            ]
          })
        ]
      }))
    });
  });

  // 4. Totals Rows (Subtotal, Less Advance, Total Reimbursement)
  const createTotalRow = (label, value) => {
    return new TableRow({
      children: [
        // Merge first 11 cells
        new TableCell({
          columnSpan: 11,
          margins: cellPadding,
          borders: {
            top: singleBorder,
            bottom: singleBorder,
            left: singleBorder,
            right: singleBorder
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: label, bold: true, font: "Inter", size: 18 })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: cellPadding,
          borders: {
            top: singleBorder,
            bottom: singleBorder,
            left: singleBorder,
            right: singleBorder
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `${value}/-`, bold: true, font: "Inter", size: 18 })
              ]
            })
          ]
        })
      ]
    });
  };

  const totalRowObj = createTotalRow("Sub Total", subTotal);
  const advanceRowObj = createTotalRow("Less : Advance", advance || 0);
  const finalTotalRowObj = createTotalRow("Total Reimbursement", totalReimbursement);

  // Combine headers, items and totals
  const expenseTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow,
      ...itemRows,
      totalRowObj,
      advanceRowObj,
      finalTotalRowObj
    ]
  });

  // 5. Signature Section
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    spacing: { before: 200 },
    borders: {
      top: borderNone,
      bottom: borderNone,
      left: borderNone,
      right: borderNone,
      insideHorizontal: borderNone,
      insideVertical: borderNone
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 400, bottom: 100 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "_________________________\n", bold: true, font: "Inter", size: 18 }),
                  new TextRun({ text: "Signature of Employee", bold: true, font: "Inter", size: 18 })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 400, bottom: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "_________________________\n", bold: true, font: "Inter", size: 18 }),
                  new TextRun({ text: "Approval HR", bold: true, font: "Inter", size: 18 })
                ]
              })
            ]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 400, bottom: 100 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "_________________________\n", bold: true, font: "Inter", size: 18 }),
                  new TextRun({ text: "Approval HOD Signature", bold: true, font: "Inter", size: 18 })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 400, bottom: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "_________________________\n", bold: true, font: "Inter", size: 18 }),
                  new TextRun({ text: "Approval CEO", bold: true, font: "Inter", size: 18 })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // 6. Payment block (Bottom)
  const paymentTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: singleBorder,
      bottom: singleBorder,
      left: singleBorder,
      right: singleBorder,
      insideHorizontal: singleBorder,
      insideVertical: singleBorder
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [new Paragraph({ children: [new TextRun({ text: "Cheque/Cash/NEFT", bold: true, font: "Inter", size: 18 })] })]
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [new Paragraph({ children: [new TextRun({ text: "", font: "Inter", size: 18 })] })]
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            rowSpan: 3,
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "_________________________\n", bold: true, font: "Inter", size: 18 }),
                  new TextRun({ text: "SIGNATURE OF EMPLOYEE\n", bold: true, font: "Inter", size: 18 }),
                  new TextRun({ text: "(After Payment)", font: "Inter", size: 16 })
                ]
              })
            ]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [new Paragraph({ children: [new TextRun({ text: "Bank Name", bold: true, font: "Inter", size: 18 })] })]
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [new Paragraph({ children: [new TextRun({ text: "", font: "Inter", size: 18 })] })]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [new Paragraph({ children: [new TextRun({ text: "Amount", bold: true, font: "Inter", size: 18 })] })]
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: cellPadding,
            children: [new Paragraph({ children: [new TextRun({ text: `${totalReimbursement}/-`, font: "Inter", size: 18 })] })]
          })
        ]
      })
    ]
  });

  // Assemble document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header titles
          createTitlePara("MINIMINES CLEANTECH SOLUTIONS PRIVATE LIMITED", 16, true, "0F5132", 100),
          createTitlePara("BENGALURU", 11, false, "555555", 50),
          createTitlePara("EXPENSES FOR CONVEYANCE & REIMBURSEMENT", 13, true, "1A1A1A", 100),
          
          // Divider
          new Paragraph({
            spacing: { after: 200 },
            border: { bottom: doubleBorderBottom }
          }),

          // Metadata Table
          metaTable,
          new Paragraph({ spacing: { after: 200 } }),

          // Expense Table
          expenseTable,
          new Paragraph({ spacing: { after: 200 } }),

          // Total Rs in Words
          new Paragraph({
            spacing: { before: 100, after: 300 },
            children: [
              new TextRun({ text: "TOTAL Rs in Words: ", bold: true, font: "Inter", size: 18, color: "0F5132" }),
              new TextRun({ text: totalInWords, font: "Inter", size: 18, italic: true })
            ]
          }),

          // Signatures
          signatureTable,
          new Paragraph({ spacing: { after: 400 } }),

          // Payment Details Heading
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: "PAYMENT DETAILS (Office Use Only)", bold: true, font: "Inter", size: 18, color: "0F5132" })]
          }),

          // Payment block
          paymentTable
        ]
      }
    ]
  });

  return Packer.toBlob(doc);
}
