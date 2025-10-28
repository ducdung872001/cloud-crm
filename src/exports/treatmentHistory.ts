import ExcelJS from "exceljs";
import moment from "moment";
import fs from "file-saver";
import { removeAccents } from "reborn-util";
import { styles, columnFormat, columnWidth, formats } from "./config";
import { getCharByCode, getFileExtension } from "utils/common";

// khai báo sử dụng thư viện
const workbook = new ExcelJS.Workbook();

const IntStream = (function () {
  function range(start: number, end: any, numbers = []) {
    if (start === end) {
      return numbers;
    }
    return range(start + 1, end, numbers.concat(start));
  }

  return {
    range,
  };
})();

// đoạn này xử lý vấn đề thêm hàng
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

const addRow = (ws: ExcelJS.Worksheet, rowData: any[], widths: number[], options: { [x: string]: any }[]) => {
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

// đoạn này xử lý vấn đề chỉnh sửa ô
export const excelEditCell = (cell: { [x: string]: any }, data = {}) => {
  Object.keys(data).forEach((key) => {
    if (data[key].constructor === {}.constructor) {
      cell[key] = { ...cell[key], ...data[key] };
    } else {
      cell[key] = data[key];
    }
  });
  return cell;
};

const createHeader = (worksheet: ExcelJS.Worksheet, dataHeader?: any) => {
  if (dataHeader) {
    // nếu như mà có hình ảnh
    if (dataHeader.avatar) {
      const imageId = workbook.addImage({
        buffer: dataHeader.avatar,
        extension: getFileExtension(dataHeader.avatar),
      });

      worksheet.addImage(imageId, {
        tl: { col: 0, row: 1 }, // Vị trí top-left của hình ảnh
        ext: { width: 75, height: 55 }, // Chiều rộng và chiều cao của hình ảnh
        editAs: "oneCell", // Cách thể hiện hình ảnh
      });
    }
  }
};

interface IBeautySalonProps {
  avatar: string;
  name?: string;
}

export async function ExportTreatmentHistoryExcel(
  userOptions: { fileName: string; title: string; header: any[]; data: any[]; info: { name: string } },
  beautySalon?: IBeautySalonProps,
  name?: string
) {
  const options = {
    title: "",
    fileName: "",
    header: [],
    headerFormat: [],
    footer: [],
    footerFormat: [],
    data: [],
    dataFormat: [],
    columnsWidth: [], // đoạn này cấu hình chiều dài của 1 ô
    callback: (f: any) => f,
    ...userOptions,
  };

  // nếu như mà có header, và header là 1 mảng thì gán lại giá trị header bằng 1 mảng
  //   if (options.header.length) {
  //     options.header = [options.header];
  //   }
  // nếu như mà có footer, và footer là 1 mảng thì gán lại giá trị footer bằng 1 mảng
  //   if (options.footer.length) {
  //     options.footer = [options.footer];
  //   }

  const nameWeekday = `${moment().format("dddd").charAt(0).toUpperCase() + moment().format("dddd").slice(1)}`;

  const defaultInfoHeader = {
    avatar: beautySalon?.avatar,
    content: {
      name: beautySalon?.name || "Bảng theo dõi dịch vụ làm cho khách",
      time: `${nameWeekday} - ${moment().format("DD/MM/YYYY HH:mm:ss")}`,
      exporter: options.info?.name ?? name,
    },
  };

  // đoạn này là đặt tên 1 sheet dưới chân trang
  const worksheet = workbook.addWorksheet(options.fileName || options.title);

  // gọi hàm createHeader
  createHeader(worksheet, defaultInfoHeader);

  // xử lý download file
  workbook.xlsx.writeBuffer().then((data) => {
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    fs.saveAs(blob, (options.fileName || options.title) + "-" + moment().format("YYYYMMDDHHmm") + ".xlsx");
  });
}
