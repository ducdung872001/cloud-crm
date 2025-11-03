import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Định nghĩa kiểu cho listColumns và dataRow (có thể tùy biến lại nếu cần chặt chẽ hơn)
export async function exportOlaExcel(listColumns: any[], dataRow: any[], listErrors: any[] = []) {
  console.log("Exporting to Excel with columns:", listColumns, "and data rows:", dataRow);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");
  //   const numberExampleRow = Math.max(dataRow.length, 97);
  const numberExampleRow = dataRow.length;

  let colIndex = 1;
  // Lưu các thông tin column để mapping dataRow
  const colMap: { key: string; children?: any[]; colStart: number; colSpan: number }[] = [];

  listColumns.forEach((item) => {
    let children = Array.isArray(item.children) ? [...item.children] : [];

    // Điều kiện bổ sung child
    if (children.length === 0 && item.key !== "stt" && item.type !== "checkbox") {
      children = [{ name: "condition" }, { name: "value" }];
    }

    const startCol = colIndex;

    if (children.length > 0) {
      const span = children.length;
      worksheet.mergeCells(1, startCol, 1, startCol + span - 1);
      worksheet.getCell(1, startCol).value = item.name;
      worksheet.getCell(1, startCol).alignment = { horizontal: "center", vertical: "middle" };

      children.forEach((child, idx) => {
        const colIdx = startCol + idx;
        worksheet.getColumn(colIdx).width = 15.7;

        const cell2 = worksheet.getCell(2, colIdx);
        cell2.value = child.key == "min" ? "min (or condition)" : child.key == "max" ? "max (or value)" : child.name;
        cell2.alignment = { horizontal: "center", vertical: "middle" };

        const cell3 = worksheet.getCell(3, colIdx);
        cell3.alignment = { horizontal: "center", vertical: "middle" };

        let cell3Value = "";
        if (item.type === "checkbox") {
          cell3Value = item.type;
        } else if (child.name === "condition") {
          cell3Value = item.compareType ?? "";
        } else if (child.name === "value") {
          if (item.type === "lookup") {
            cell3Value = "lookup-" + item.lookup;
          } else {
            cell3Value = child.type ?? item.type ?? "";
          }
        } else {
          cell3Value = child.type ?? item.type ?? "";
        }
        cell3.value = cell3Value;

        // Dropdown cho các dòng từ row 4 trở đi
        for (let row = 4; row <= numberExampleRow + 3; row++) {
          const dropdownCell = worksheet.getCell(row, colIdx);
          dropdownCell.alignment = { horizontal: "center", vertical: "middle" };

          if (item.type === "checkbox") {
            dropdownCell.dataValidation = {
              type: "list",
              allowBlank: true,
              formulae: ['"TRUE,FALSE"'],
            };
            dropdownCell.value = "FALSE";
          } else if (item.type === "select" && Array.isArray(item.options) && item.options.length > 0 && child.name === "value") {
            const optionsList = item.options.map((el) => el.value || el.label).join(",");
            dropdownCell.dataValidation = {
              type: "list",
              allowBlank: true,
              formulae: ['"' + optionsList + '"'],
            };
          } else if (child.name === "condition") {
            if (cell3Value === "in") {
              dropdownCell.dataValidation = {
                type: "list",
                allowBlank: true,
                formulae: ['"in,not in"'],
              };
              dropdownCell.value = "in";
            } else if (cell3Value === "equal") {
              if (item.type === "number" || item.type === "date") {
                dropdownCell.dataValidation = {
                  type: "list",
                  allowBlank: true,
                  formulae: ['"equal,<,>,>=,<=,!="'],
                };
                dropdownCell.value = "equal";
              } else {
                dropdownCell.dataValidation = {
                  type: "list",
                  allowBlank: true,
                  formulae: ['"equal,!="'],
                };
                dropdownCell.value = "equal";
              }
            }
          }
        }
      });

      colMap.push({ key: item.key, children, colStart: startCol, colSpan: span });
      colIndex += span;
    } else {
      worksheet.mergeCells(1, startCol, 2, startCol);
      worksheet.getColumn(startCol).width = 15.7;

      worksheet.getCell(1, startCol).value = item.name;
      worksheet.getCell(1, startCol).alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getCell(2, startCol).alignment = { horizontal: "center", vertical: "middle" };

      const cell3 = worksheet.getCell(3, startCol);
      cell3.value = item.type;
      cell3.alignment = { horizontal: "center", vertical: "middle" };

      for (let row = 4; row <= numberExampleRow + 3; row++) {
        const dropdownCell = worksheet.getCell(row, startCol);
        dropdownCell.alignment = { horizontal: "center", vertical: "middle" };
        if (item.type === "checkbox") {
          dropdownCell.dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: ['"TRUE,FALSE"'],
          };
          dropdownCell.value = "FALSE";
        }
      }

      colMap.push({ key: item.key, colStart: startCol, colSpan: 1 });
      colIndex += 1;
    }
  });

  // Ẩn dòng số 3
  worksheet.getRow(3).hidden = true;
  worksheet.getRow(3).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFF2CC" },
    };
  });

  // Gán dữ liệu từ dataRow vào các dòng từ row 4 trở đi
  for (let i = 0; i < dataRow.length; i++) {
    let rowData = dataRow[i];
    let excelRow = worksheet.getRow(i + 4);

    let currentCol = 1;
    colMap.forEach((col) => {
      if (col.children && col.children.length > 0) {
        // Nếu là các column có children

        let cellData = rowData[col.key] || {};
        col.children.forEach((child, idx) => {
          let value = cellData[child.key] ?? cellData[child.name] ?? "";
          excelRow.getCell(currentCol + idx).value = value;
        });
        currentCol += col.colSpan;
      } else {
        // Nếu là column đơn
        excelRow.getCell(currentCol).value = rowData[col.key] ?? "";
        currentCol += 1;
      }
    });
  }

  // Nếu có lỗi, thêm một sheet mới để liệt kê lỗi
  if (listErrors && listErrors.length > 0) {
    const errorSheet = workbook.addWorksheet("Errors");

    // Thêm tiêu đề cho sheet Errors
    errorSheet.addRow(["STT Lỗi", "Cột lỗi", "Lỗi"]);

    // Duyệt qua listErrors và thêm từng dòng lỗi
    listErrors.forEach((error) => {
      const { rowIndex, fieldName, colIndex, errorMessage } = error;
      errorSheet.addRow([
        rowIndex,
        fieldName.replace(/\./g, "-"), // Thay dấu "." bằng "-"
        errorMessage,
      ]);

      if (colIndex !== -1) {
        // Đặt nền đỏ và chữ trắng cho ô bị lỗi
        const cell = worksheet.getRow(rowIndex + 3).getCell(colIndex + 1); // +3 vì dữ liệu bắt đầu từ hàng 3
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF0000" }, // Màu đỏ
        };
        cell.font = {
          color: { argb: "FFFFFFFF" }, // Màu trắng
        };
      }
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "custom_export.xlsx");
}
