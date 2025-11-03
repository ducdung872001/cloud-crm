import { removeAccents } from "reborn-util";
import ExcelJS from "exceljs";
import moment from "moment";
import fs from "file-saver";
import { styles, columnFormat, columnWidth, formats } from "./config";
import { getCharByCode } from "utils/common";

const getRowData = {
  array: (item) => {
    return item;
  },
  object: (item, mapping) => {
    return mapping.map((field) => item[field]);
  },
};

export const worksheetAddRow = (worksheet: ExcelJS.Worksheet, data: any[], index?: number, isHorizontal?: boolean) => {
  let row = null;
  if (index === null || isNaN(index)) {
    row = worksheet.addRow(data);
  } else {
    row = worksheet.insertRow(index, data);
  }
  row.font = styles.font;
  if (isHorizontal) {
    row.horizontal = true;
  }
  return row;
};

export const excelEditCell = (cell, data = {}) => {
  Object.keys(data).forEach((key) => {
    if (data[key].constructor === {}.constructor) {
      cell[key] = { ...cell[key], ...data[key] };
    } else {
      cell[key] = data[key];
    }
  });
  return cell;
};

const createHeaderFooter = (
  worksheet: ExcelJS.Worksheet,
  currentRowIndex?: number,
  headerFooter?: any[],
  format?: any[],
  formatExcel?: string[],
  isBorder?: boolean,
  isBold?: boolean,
  isHorizontal?: boolean,
  isFillYellow?: boolean,
  checkNumberNegative?: boolean
) => {
  const rows = [];
  headerFooter.forEach((row) => {
    rows.push(worksheetAddRow(worksheet, row, null, true));
  });
  rows.forEach((row, rowIdx) => {
    const curRow = currentRowIndex + rowIdx + 1;
    const rowFormat = format[rowIdx] || [];
    row.eachCell((cell, cellIdx) => {
      if (cell.value !== "") {
        cell.alignment = { wrapText: true, vertical: "top", ...cell.alignment };
      }

      if (isBorder === true) {
        cell.border = styles.fullBorder;
      }

      if (isBold === true) {
        cell.font = { ...styles.font, bold: true };
      }

      if (row.horizontal && isHorizontal) {
        cell.alignment = {
          ...cell.alignment,
          horizontal: formatExcel[cellIdx - 1],
          vertical: "middle",
        };
      }

      if (isFillYellow) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "FFFFFF00",
          },
          bgColor: {
            argb: "FFFF0000",
          },
        };
      }

      if (typeof cell.value === "number") {
        cell.alignment = { ...cell.alignment, horizontal: "right" };
        cell.numFmt = formats.currency;
      }

      if (checkNumberNegative && typeof cell.value === "number" && cell.value < 0) {
        cell.value = Math.abs(cell.value);
        cell.font = { ...cell.font, color: { argb: "ffff0000" } };
      }

      const cellFormat = rowFormat[cellIdx - 1] || {};
      Object.keys(cellFormat).forEach((k) => {
        const v = cellFormat[k];
        switch (k) {
          case "merge":
            const mergeRow = v.row || 1;
            const mergeCol = v.col || 1;
            worksheet.mergeCells(curRow, cellIdx, curRow + mergeRow - 1, cellIdx + mergeCol - 1);
            break;
          case "fontBold":
            cell.font = { ...cell.font, bold: v };
            break;
          case "fontSize":
            cell.font = { ...cell.font, size: v };
            break;
          case "alignment":
            cell.alignment = { ...cell.alignment, horizontal: v };
            break;
          case "fontItalic":
            cell.font = { ...cell.font, italic: v };
            break;
          default:
            cell[k] = v;
            break;
        }
      });
    });
  });
  return rows;
};

const IntStream = (function () {
  function range(start, end, numbers = []) {
    if (start === end) {
      return numbers;
    }
    return range(start + 1, end, numbers.concat(start));
  }

  return {
    range,
  };
})();

const addRow = (ws, rowData, widths, options) => {
  const rowValues = [];
  if (widths === undefined) widths = rowData.map(() => 1);
  if (options === undefined) options = [];
  let pos = 1;
  for (let i = 0; i < rowData.length; i++) {
    rowValues[pos] = rowData[i];
    pos += widths[i];
  }
  const row = worksheetAddRow(ws, rowValues);

  const address = row.getCell(1)._address;
  const rowIdx = address.slice(1, address.length);
  let letter = "A";

  for (let i = 0; i < rowData.length; ++i) {
    const cell = ws.getCell(`${letter}${rowIdx}`);
    for (const key in options[i]) {
      if (key === "style") {
        cell.style = {
          ...cell.style,
          ...options[i][key],
        };
      } else {
        cell[key] = options[i][key];
      }
    }

    ws.mergeCells(`${letter}${rowIdx}:${getCharByCode(letter, widths[i] - 1)}${rowIdx}`);
    letter = getCharByCode(letter, widths[i]);
  }
};

export async function CustomExportReport(userOptions, name?: string, setFilebase64?, notDownload?) {
  const options = {
    title: "",
    fileName: "",
    isShowHeader: true,
    isShowFooter: true,
    infoHeader: [],
    header: [],
    footer: [],
    headerFormat: [],
    footerFormat: [],
    data: [],
    dataFormat: [],
    mapping: [],
    format: [],
    // đoạn này thêm mới để format hiển thị căn chỉnh các cột trong form
    formatExcel: [],
    footerBorder: true,
    footerBold: true,
    footerAlignment: false,
    formatMap: {},
    columnsWidth: [],
    generateInfo: true,
    generateSign: true,
    dropdownData: null,
    checkNumberNegative: false,
    callback: (f) => f,
    ...userOptions,
  };

  options.isMergedInfoHeader =
    userOptions.isMergedInfoHeader === undefined || userOptions.isMergedInfoHeader === null || userOptions.isMergedInfoHeader === true;

  if (options.header.length && Array.isArray(options.header[0]) === false) {
    options.header = [options.header];
  }
  if (options.footer.length && Array.isArray(options.footer[0]) === false) {
    options.footer = [options.footer];
  }

  const defaultInfo = [];
  const info = [...defaultInfo, ...options.infoHeader];
  options.formatMap = {
    ...columnFormat,
    ...options.formatMap,
  };

  if (options.header.length > 0) {
    options.header[options.header.length - 1].forEach((item, index) => {
      let itemName = "";
      if (typeof item === "object" && !Array.isArray(item) && item !== null) {
        itemName = item.name;
      } else {
        itemName = item;
      }

      let key = item === "" ? removeAccents(options.header[0][index]) : removeAccents(itemName);
      key = key.toLowerCase();
      if (options.columnsWidth.length - 1 < index) {
        options.columnsWidth.push(null);
      }
      if (!options.columnsWidth[index]) {
        options.columnsWidth[index] = columnWidth[key];
      }
      if (options.format.length - 1 < index) {
        options.format.push(null);
      }
      if (!options.format[index]) {
        options.format[index] = options.formatMap[key];
      }
    });
  }
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Reborn";

  workbook.created = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;

  const worksheet = workbook.addWorksheet(options.fileName || options.title);
  let curRowIdx = 0;
  // add row and formatting
  if (options.title) {
    const titleRow = worksheetAddRow(worksheet, [options.title]);
    curRowIdx++;
    worksheet.getCell("A1").font = {
      ...titleRow.font,
      underline: "none",
      bold: true,
      size: 18,
    };
    worksheet.getCell("A1").alignment = { ...titleRow.alignment, horizontal: "center" };
  }
  const infoHeaderCustomRows = createHeaderFooter(worksheet, curRowIdx, [], [], options.formatExcel, false, false, false, false);
  curRowIdx += infoHeaderCustomRows.length;

  info.forEach((rowData) => {
    const row = worksheetAddRow(worksheet, rowData);
    row.eachCell((cell) => {
      cell.alignment = { wrapText: true, vertical: "top" };
    });
    curRowIdx++;
  });

  worksheetAddRow(worksheet, []);
  curRowIdx++;

  const titleExtraRows = createHeaderFooter(worksheet, curRowIdx, [], [], options.formatExcel, false, true, true, false);
  curRowIdx += titleExtraRows.length;

  // header row
  if (options.header && options.header.length > 0) {
    options.header[options.header.length - 1] = options.header[options.header.length - 1].map((item) => {
      let itemName = "";
      if (typeof item === "object" && !Array.isArray(item) && item !== null) {
        itemName = item.name;
      } else {
        itemName = item;
      }
      return itemName;
    });
    const headerRows = createHeaderFooter(worksheet, curRowIdx, options.header, [], options.formatExcel, true, true, true);
    curRowIdx += headerRows.length;
  }

  const headerExtraRows = createHeaderFooter(worksheet, curRowIdx, [], [], options.formatExcel, true, true, true, true, true);
  curRowIdx += headerExtraRows.length;

  // data row
  let rowDataType = "object";
  if (Array.isArray(options.data[0])) {
    rowDataType = "array";
  }
  const colCount = worksheet.columnCount;
  if (options.title) {
    worksheet.mergeCells(1, 1, 1, colCount);
  }
  if (options.generateInfo || info) {
    if (options.isMergedInfoHeader) {
      for (let i = 2; i <= info.length + 1; i++) {
        worksheet.mergeCells(i, 2, i, colCount);
      }
    }
  }

  options.data.forEach((item, idx) => {
    const rowData = getRowData[rowDataType](item, options.mapping);

    const row = worksheetAddRow(
      worksheet,
      rowData.map((data) => {
        if (data instanceof Date) {
          return moment(data).utcOffset(0, true).toDate();
        }

        if (data === null || data === undefined) {
          return "";
        }

        return data;
      })
    );
    curRowIdx++;

    const rowFormat = options.dataFormat[idx] || [];
    row.eachCell((cell, index) => {
      //End handle validation eachCell isFormImport
      cell.border = styles.fullBorder;

      //!NOTE: Trong trường hợp là số sẽ căn dấu ","
      if (typeof cell.value === "number") {
        cell.numFmt = formats.currency;
      }

      cell.alignment = { wrapText: true, vertical: "middle", horizontal: options.formatExcel[index - 1] };

      if (options.checkNumberNegative && typeof cell.value === "number" && cell.value < 0) {
        cell.value = Math.abs(cell.value);
        cell.font = { ...cell.font, color: { argb: "ffff0000" } };
      }
      if (options.dataFormat && options.dataFormat.length > 0) {
        const cellFormat = rowFormat[index - 1] || {};
        Object.keys(cellFormat).forEach((k) => {
          const v = cellFormat[k];
          if (k === "merge") {
            const mergeRow = v.row || 1;
            const mergeCol = v.col || 1;
            worksheet.mergeCells(curRowIdx, index, curRowIdx + mergeRow - 1, index + mergeCol - 1);
          } else if (k === "fontBold") {
            cell.font = { ...cell.font, bold: v };
          } else if (k === "fontSize") {
            cell.font = { ...cell.font, size: v };
          } else {
            cell[k] = v;
          }
        });
      }
    });
  });

  const dataExtraRows = createHeaderFooter(worksheet, curRowIdx, [], [], options.formatExcel, true, true, true, true, true);
  curRowIdx += dataExtraRows.length;

  // footer row
  const footerRows = createHeaderFooter(
    worksheet,
    curRowIdx,
    options.footer,
    options.footerFormat,
    options.formatExcel,
    options.footerBorder,
    options.footerBold,
    options.footerAlignment
  );

  curRowIdx += footerRows.length;

  options.columnsWidth.forEach((item, index) => {
    if (item) {
      worksheet.getColumn(index + 1).width = item;
    }
  });
  if ((worksheet.getColumn(1).width || 0) < 13) {
    worksheet.getColumn(1).width = 13;
  }

  worksheetAddRow(worksheet, []);
  curRowIdx++;

  if (options.generateSign && options.isShowFooter) {
    const headerLength = options.header[0].length || 1;
    const pos = headerLength > 8 ? headerLength - 5 : headerLength > 4 ? headerLength - 3 : 1;
    worksheetAddRow(worksheet, []);
    addRow(
      worksheet,
      ["", "Người ký"],
      [pos, 3],
      [
        {},
        {
          alignment: {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          },
        },
      ]
    );

    worksheetAddRow(worksheet, []);
    worksheetAddRow(worksheet, []);
    worksheetAddRow(worksheet, []);
    worksheetAddRow(worksheet, []);
    curRowIdx += 4;

    // insert new row and return as row object
    addRow(
      worksheet,
      ["", options.info?.name],
      [pos, 3],
      [
        {},
        {
          style: { font: { bold: true } },
          alignment: {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          },
        },
      ]
    );
  }

  options.callback(workbook, curRowIdx);
  workbook.xlsx.writeBuffer().then((data) => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    if (notDownload) {
      let reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        let base64data: any = reader.result;
        setFilebase64(base64data.split(",")[1]);
      };
    }

    !notDownload && fs.saveAs(blob, (options.fileName || options.title) + "-" + moment().format("YYYYMMDDHHmm") + ".xlsx");
  });
}
