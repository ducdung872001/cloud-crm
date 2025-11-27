import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// inputData là tuỳ chọn, nếu có thì mới ghi dữ liệu từ dòng 5 trở đi
export async function exportCustomExcel(listColumns: any[], inputData?: any[], typeNo?: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  // Cột A (1): dùng để đánh dấu isFullWidthRow (giá trị là level nếu isFullWidthRow==true, rỗng nếu không)
  worksheet.getCell(1, 1).value = "Level tiêu đề";
  worksheet.getCell(2, 1).value = "level";
  worksheet.getCell(3, 1).value = "";
  worksheet.getCell(4, 1).value = "";
  worksheet.getColumn(1).width = 12;
  worksheet.getColumn(1).hidden = true; // Ẩn cột A

  // Cột B (2): stt header
  worksheet.getCell(1, 2).value = listColumns[0]?.name || "";
  worksheet.getCell(1, 2).alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getCell(2, 2).value = listColumns[0]?.key || "";
  worksheet.getCell(2, 2).alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getCell(3, 2).value = listColumns[0]?.isBinding ? listColumns[0]?.bindingField || "" : "";
  worksheet.getCell(3, 2).alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getCell(4, 2).value = listColumns[0]?.type || "";
  worksheet.getCell(4, 2).alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getColumn(2).width = 110 / 8;

  // Các cột header tiếp theo bắt đầu từ cột C (colIdx = 3)
  listColumns.slice(1).forEach((item, idx) => {
    const col = idx + 3; // cột C là 3
    worksheet.getCell(1, col).value = item.name;
    worksheet.getCell(1, col).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(2, col).value = item.key;
    worksheet.getCell(2, col).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(3, col).value = item.isBinding ? item.bindingField || "" : "";
    worksheet.getCell(3, col).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(4, col).value = item.type;
    worksheet.getCell(4, col).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getColumn(col).width = 110 / 8;
  });

  // Đổ màu cho dòng 3
  worksheet.getRow(3).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFF2CC" },
    };
  });

  // Ẩn dòng 2 và 3 và 4 (chỉ hiện dòng 1 là tên cột)
  worksheet.getRow(2).hidden = true;
  worksheet.getRow(3).hidden = true;
  worksheet.getRow(4).hidden = true;

  // Ghi dữ liệu từ dòng 5 nếu có inputData
  if (inputData && inputData.length > 0) {
    let dataRow = 5;
    inputData.forEach((rowObj, idx) => {
      if (rowObj.isFullWidthRow) {
        // Xác định style cho font theo level
        let fontSize = 11;
        let color = { argb: "FF000000" }; // Đen (default)
        // H1, H2, H3, H4 cỡ chữ: 20, 16, 14, 12
        if (rowObj.level == 1 || rowObj.level === "1") {
          fontSize = 20; // H1
          color = { argb: "FFFF0000" }; // Đỏ
        } else if (rowObj.level == 2 || rowObj.level === "2") {
          fontSize = 16; // H2
        } else if (rowObj.level == 3 || rowObj.level === "3") {
          fontSize = 14; // H3
        } else if (rowObj.level == 4 || rowObj.level === "4") {
          fontSize = 12; // H4
        }

        // Cột A: level
        worksheet.getCell(dataRow, 1).value = rowObj.level || "";
        worksheet.getCell(dataRow, 1).alignment = { vertical: "middle", horizontal: "center" };
        // worksheet.getCell(dataRow, 1).font = { bold: true, size: fontSize, color };

        // Cột B: no nếu có, nếu không thì là index của phần tử (bắt đầu từ 1 như bạn yêu cầu)
        let sttVal = typeNo == "input" ? rowObj.no : idx + 1;
        worksheet.getCell(dataRow, 2).value = sttVal;
        worksheet.getCell(dataRow, 2).alignment = { vertical: "middle", horizontal: "center" };
        worksheet.getCell(dataRow, 2).font = { bold: true, size: fontSize, color };

        // Merge từ cột C đến hết để hiển thị content
        if (listColumns.length > 1) {
          worksheet.mergeCells(dataRow, 3, dataRow, listColumns.length + 1);
          worksheet.getCell(dataRow, 3).value = rowObj.content || "";
          worksheet.getCell(dataRow, 3).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
          worksheet.getCell(dataRow, 3).font = { bold: true, size: fontSize, color };
        }
      } else {
        worksheet.getCell(dataRow, 1).value = ""; // Không phải full width row thì cột A rỗng
        // Ghi từng cột dữ liệu bắt đầu từ cột B (stt ở cột B)
        listColumns.forEach((col, idxCol) => {
          const colIdx = idxCol + 2;
          let value = rowObj[col.key];
          if (col.type === "date" && value) {
            value = new Date(value);
          }
          if (col.key === "stt") {
            value = typeNo == "input" ? rowObj.stt : idx + 1;
          }
          worksheet.getCell(dataRow, colIdx).value = value ?? "";
          worksheet.getCell(dataRow, colIdx).alignment = { vertical: "middle", horizontal: "center" };
        });
      }
      dataRow++;
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "custom_columns.xlsx");
}
