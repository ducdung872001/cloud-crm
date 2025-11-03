import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportCustomExcel(listColumns: any[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");
  const numberExampleRow = 97;

  let colIndex = 1;

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

        // Đặt width cột là 110px (convert sang exceljs: 110/7 = ~15.7)
        worksheet.getColumn(colIdx).width = 15.7;

        const cell2 = worksheet.getCell(2, colIdx);
        cell2.value = child.key == "min" ? "min (or condition)" : child.key == "max" ? "max (or value)" : child.name;
        cell2.alignment = { horizontal: "center", vertical: "middle" };

        // Xác định giá trị cho hàng 3
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

          // Logic cho từng trường hợp
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

      colIndex += span;
    } else {
      worksheet.mergeCells(1, startCol, 2, startCol);
      worksheet.getColumn(startCol).width = 15.7; // width 110px

      worksheet.getCell(1, startCol).value = item.name;
      worksheet.getCell(1, startCol).alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getCell(2, startCol).alignment = { horizontal: "center", vertical: "middle" };

      const cell3 = worksheet.getCell(3, startCol);
      cell3.value = item.type;
      cell3.alignment = { horizontal: "center", vertical: "middle" };

      // Dropdown cho các dòng từ row 4 trở đi
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

      colIndex += 1;
    }
  });

  // Ẩn dòng số 3
  worksheet.getRow(3).hidden = true;

  worksheet.getRow(3).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFF2CC" }, // màu vàng nhạt
    };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "custom_columns.xlsx");
}
