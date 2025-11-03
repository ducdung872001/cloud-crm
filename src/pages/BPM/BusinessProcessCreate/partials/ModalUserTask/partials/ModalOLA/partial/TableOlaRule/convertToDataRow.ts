/**
 * Chuyển đổi dữ liệu mảng các dòng dạng array-of-arrays-of-cell thành dạng dataRow (array-of-objects theo từng dòng)
 * Đầu vào data kiểu: Array<Array<CellData>>
 * Đầu ra kiểu: Array<{
 *    [key: string]: any // có thể lồng object với các field cho các trường children
 * }>
 */

import moment from "moment";

type CellData = {
  key: string;
  value?: any;
  compare?: string;
  children?: CellData[];
  [k: string]: any; // bổ sung trường khác
};

export function convertToDataRow(rawTable: CellData[][]): any[] {
  return rawTable.map((row, index) => {
    // row là array các cell
    const result: Record<string, any> = {};
    row.forEach((cell) => {
      // Nếu có children (kiểu range/object/phức tạp)
      if (Array.isArray(cell.children) && cell.children.length > 0) {
        // Nếu là kiểu đơn vị thời gian, hoặc range min/max
        const childObj: Record<string, any> = {};

        cell.children.forEach((child) => {
          if (cell.type == "date" || cell.type == "number") {
            if (cell?.isOtherwise && (cell?.value == "OTHERWISE" || cell?.value == "Otherwise")) {
              childObj["min"] = "OTHERWISE";
              childObj["max"] = "OTHERWISE";
            } else {
              if (cell?.isSpecialValue) {
                // Nếu là kiểu date, đổi sang dạng "DD/MM/YYYY" bằng moment
                childObj["min"] = cell.compare;
                childObj["max"] = cell.value
                  ? cell.type == "date"
                    ? moment(cell.value).format("DD/MM/YYYY")
                    : cell.type == "number"
                    ? cell.value
                    : cell.value
                  : "";
              } else {
                // Nếu là kiểu date, đổi sang dạng "DD/MM/YYYY" bằng moment
                childObj[child.key ?? child.name ?? "value"] = child.value
                  ? cell.type == "date"
                    ? moment(child.value).format("DD/MM/YYYY")
                    : cell.type == "number"
                    ? child.value
                    : cell.value
                  : "";
              }
            }
          } else {
            childObj[child.key ?? child.name ?? "value"] = child.value;
          }
        });
        result[cell.key] = childObj;
      } else {
        if (cell?.isOtherwise && (cell?.value == "OTHERWISE" || cell?.value == "Otherwise")) {
          // Nếu là kiểu 'Otherwise', thì chỉ cần key và value là "OTHERWISE"
          // result[cell.key] = "OTHERWISE";
          if (cell.compareType === "in" || cell.compareType === "equal" || cell.compareType === "range") {
            // Nếu là kiểu condition/value, lưu cả compare và value
            if (cell.compareType === "range") {
              // đã xử lý ở children
              // Không cần gì thêm
            } else {
              if (cell.compareType === "equal" && cell.type == "checkbox") {
                result[cell.key] = "OTHERWISE";
              } else {
                result[cell.key] = {
                  condition: cell.compare ? (cell.compare == "not_in" ? "not in" : cell.compare == "=" ? "equal" : cell.compare) : "",
                  value: "OTHERWISE",
                };
              }
            }
          } else if (cell.type === "object") {
            // đã xử lý ở children
            // Không cần gì thêm
          } else if (cell.key === "stt") {
            result[cell.key] = cell.value && cell.value != "" ? cell.value : index + 1; // nếu không có giá trị thì mặc định là 0
          } else {
            // các loại khác thì value
            result[cell.key] = "OTHERWISE";
          }
        } else {
          // Nếu là cell thường
          // Nếu là kiểu 'condition', thì nên gộp cả compare và value
          if (cell.compareType === "in" || cell.compareType === "equal" || cell.compareType === "range") {
            // Nếu là kiểu condition/value, lưu cả compare và value
            if (cell.compareType === "range") {
              // đã xử lý ở children
              // Không cần gì thêm
            } else {
              if (cell.compareType === "equal" && cell.type == "checkbox") {
                result[cell.key] = cell.value;
              } else {
                if (cell.type === "date") {
                  // Nếu là kiểu date, đổi sang dạng "DD/MM/YYYY" bằng moment
                  result[cell.key] = {
                    condition: cell.compare ? (cell.compare == "not_in" ? "not in" : cell.compare == "=" ? "equal" : cell.compare) : "",
                    value: cell.value ? moment(cell.value).format("DD/MM/YYYY") : cell.value,
                  };
                } else {
                  result[cell.key] = {
                    condition: cell.compare ? (cell.compare == "not_in" ? "not in" : cell.compare == "=" ? "equal" : cell.compare) : "",
                    value:
                      cell.compareType === "in" && Array.isArray(cell.value)
                        ? cell.value.length > 1
                          ? cell.value.join("|")
                          : cell.value[0]
                        : cell.value ?? "",
                  };
                }
              }
            }
          } else if (cell.type === "object") {
            // đã xử lý ở children
            // Không cần gì thêm
          } else if (cell.type === "checkbox") {
            result[cell.key] = cell.value;
          } else if (cell.type === "date") {
            // Nếu là kiểu date, đổi sang dạng "DD/MM/YYYY" bằng monent
            result[cell.key] = cell.value ? moment(cell.value).format("DD/MM/YYYY") : cell.value;
          } else if (cell.key === "stt") {
            result[cell.key] = cell.value && cell.value != "" ? cell.value : index + 1; // nếu không có giá trị thì mặc định là 0
          } else {
            // các loại khác thì value
            result[cell.key] = cell.value ?? "";
          }
        }
      }
    });
    return result;
  });
}

// ======== Ví dụ sử dụng ========
/*
  import { convertToDataRow } from './convertToDataRow';
  
  const rawTable = [ ...DỮ LIỆU ĐẦU VÀO CỦA BẠN... ];
  
  const dataRow = convertToDataRow(rawTable);
  console.log(dataRow);
  */
