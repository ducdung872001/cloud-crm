import moment from "moment";

const listEqual = ["equal", ">=", "<=", ">", "<", "!="];
const listEqualText = ["equal", "!="];
const listEqualIn = ["in", "not in"];
const listChekbox = [true, false, "FALSE", ""];
const listDecitionValue = ["Ngày", "Giờ", "Phút"];

function isValidDateString(str: string) {
  // Kiểm tra dạng DD/MM/YYYY hoặc D/M/YYYY
  return /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.test(str);
}

function toNumber(val: any) {
  if (typeof val === "number") return val;
  if (typeof val === "string" && !isNaN(Number(val))) return Number(val);
  return null;
}

function isValidNumberList(val: any) {
  // Kiểm tra chuỗi số ngăn cách bằng |, ví dụ: "1|2|3"
  if (typeof val === "number") return true;
  if (typeof val !== "string") return false;
  return val
    .split("|")
    .map((v) => v.trim())
    .every((v) => !isNaN(Number(v)));
}

// Hàm kiểm tra số serial Excel hợp lệ
function isValidExcelSerial(serial: number): boolean {
  return serial > 0; // Excel serial phải là số dương
}

function validateDateValue(value: any, fieldName: string): string | null {
  // Kiểm tra nếu là Date object hợp lệ
  if (value instanceof Date && !isNaN(value.getTime())) {
    return null;
  }

  // Kiểm tra nếu là string hợp lệ theo định dạng ngày
  if (typeof value === "string" && isValidDateString(value)) {
    return null;
  }

  // Kiểm tra nếu là number hợp lệ để chuyển đổi bằng excelDateToJSDate
  if (typeof value === "number" && isValidExcelSerial(value)) {
    return null;
  }

  // Kiểm tra nếu là string có thể chuyển đổi thành số hợp lệ
  if (typeof value === "string" && !isNaN(Number(value)) && isValidExcelSerial(Number(value))) {
    return null;
  }

  return `Giá trị cho ${fieldName} phải là ngày dạng DD/MM/YYYY, D/M/YYYY, số serial Excel hợp lệ hoặc trống`;
}

function excelDateToJSDate(serial) {
  // Excel date serial (start from 1/1/1900)
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info;
}

function parseDateValue(value: any): Date | null {
  // Kiểm tra nếu giá trị đã là đối tượng Date
  if (value instanceof Date) {
    return value; // Giữ nguyên nếu đã là đối tượng Date
  }

  // Kiểm tra nếu giá trị là số (Excel serial)
  if (typeof value === "number") {
    return excelDateToJSDate(value); // Chuyển đổi từ số serial
  }

  // Kiểm tra nếu giá trị là chuỗi ngày hợp lệ
  const dateValue = moment(value, "DD/MM/YYYY", true);
  return dateValue.isValid() ? dateValue.toDate() : null; // Trả về ngày hoặc null nếu không hợp lệ
}

export function makeValidateField(listColumns: any[]) {
  const validateFields: any[] = [];

  listColumns.forEach((item) => {
    // Bỏ qua trường "stt"
    if (item.key === "stt") return;

    let children = Array.isArray(item.children) ? [...item.children] : [];

    // Nếu không có children và type không phải 'checkbox', 'object' thì bổ sung mặc định
    if (children.length === 0 && item.type !== "checkbox" && item.type !== "object") {
      children = [
        { key: "condition", name: "condition", type: item.type },
        { key: "value", name: "value", type: item.type },
      ];
    }

    if (children.length > 0) {
      children.forEach((child) => {
        const fieldName = `${item.name}.${child.name}`;
        // Hàm validate cho từng field
        let validateValue: (value: any, allValues?: any) => string | null = () => null;

        // 1. Số hoặc ngày và child.name === "condition" điều kiện phải thuộc listEqual
        if ((item.type === "number" || item.type === "date") && child.name === "condition") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            return listEqual.includes(value) ? null : `Giá trị cho ${fieldName} phải nằm trong [${listEqual.join(", ")}]`;
          };
        }

        // 2. Text, điều kiện phải thuộc listEqualText
        if (item.type === "text" && child.name === "condition") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            return listEqualText.includes(value) ? null : `Giá trị cho ${fieldName} phải nằm trong [${listEqualText.join(", ")}]`;
          };
        }

        // 3. Date, value phải là date object hoặc string đúng format hoặc trống
        if (item.type === "date" && child.name === "value") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            // Sử dụng hàm validateDateValue để kiểm tra giá trị
            const validationResult = validateDateValue(value, fieldName);
            if (validationResult === null) {
              return null; // Giá trị hợp lệ
            }

            return validationResult; // Trả về thông báo lỗi từ validateDateValue
          };
        }

        // 4. Nếu compareType == "range", type == "number", child.name == "min"
        if (item.compareType === "range" && item.type === "number" && child.name === "min") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            if (listEqual.includes(value)) return null;
            const num = toNumber(value);
            if (num !== null) return null;
            return `Giá trị cho ${fieldName} phải là số hoặc thuộc ${listEqual.join(", ")}`;
          };
        }

        // 5. Nếu compareType == "range", type == "number", child.name == "max"
        if (item.compareType === "range" && item.type === "number" && child.name === "max") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            const num = toNumber(value);
            if (num !== null) return null;
            return `Giá trị cho ${fieldName} phải là số hợp lệ`;
          };
        }

        // 6. Nếu cả min/max đều có giá trị, min < max
        // Đưa vào validate của child "min", truyền allValues là object {min, max}
        if (item.compareType === "range" && item.type === "number" && (child.name === "min" || child.name === "max")) {
          const oldValidate = validateValue;
          validateValue = (value, allValues) => {
            const baseValid = oldValidate(value, allValues);
            if (baseValid) return baseValid;
            if (
              child.name === "min" &&
              allValues &&
              allValues[item.name + ".min"] !== undefined &&
              allValues[item.name + ".max"] !== undefined &&
              allValues[item.name + ".min"] !== "" &&
              allValues[item.name + ".max"] !== ""
            ) {
              const minNum = toNumber(allValues[item.name + ".min"]);
              const maxNum = toNumber(allValues[item.name + ".max"]);
              if (minNum !== null && maxNum !== null && minNum >= maxNum) {
                return `Giá trị min phải nhỏ hơn giá trị max!`;
              }
            }
            return null;
          };
        }

        // 7. Nếu compareType == "range", type == "number", child.name == "min"
        if (item.compareType === "range" && item.type === "date" && child.name === "min") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }

            // Sử dụng hàm validateDateValue để kiểm tra giá trị
            const validationResult = validateDateValue(value, fieldName);
            if (validationResult === null) {
              return null; // Giá trị hợp lệ
            } else {
              // Nếu giá trị không hợp lệ, kiểm tra xem có trong listEqual không
              if (listEqual.includes(value)) {
                return null;
              } else {
                return `Giá trị cho ${fieldName} phải là ngày dạng DD/MM/YYYY, D/M/YYYY, số serial Excel hợp lệ hoặc phải nằm trong [${listEqual.join(
                  ", "
                )}] hoặc trống`;
              }
            }
          };
        }

        // 8. Nếu compareType == "range", type == "number", child.name == "max"
        if (item.compareType === "range" && item.type === "date" && child.name === "max") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }

            // Sử dụng hàm validateDateValue để kiểm tra giá trị
            const validationResult = validateDateValue(value, fieldName);
            if (validationResult === null) {
              return null; // Giá trị hợp lệ
            }

            return validationResult; // Trả về thông báo lỗi từ validateDateValue
          };
        }

        // 9. Nếu cả min/max đều có giá trị, min < max (dành cho type == "date")
        // Đưa vào validate của child "min" hoặc "max", truyền allValues là object {min, max}
        if (item.compareType === "range" && item.type === "date" && (child.name === "min" || child.name === "max")) {
          const oldValidate = validateValue;
          validateValue = (value, allValues) => {
            const baseValid = oldValidate(value, allValues);
            if (baseValid) return baseValid;

            if (
              child.name === "min" &&
              allValues &&
              allValues[item.name + ".min"] !== undefined &&
              allValues[item.name + ".max"] !== undefined &&
              allValues[item.name + ".min"] !== "" &&
              allValues[item.name + ".max"] !== ""
            ) {
              const minDate = moment(parseDateValue(allValues[item.name + ".min"]), "DD/MM/YYYY", true);
              const maxDate = moment(parseDateValue(allValues[item.name + ".max"]), "DD/MM/YYYY", true);
              if (minDate.isValid() && maxDate.isValid() && minDate.isSameOrAfter(maxDate)) {
                return `Giá trị min phải nhỏ hơn giá trị max!`;
              }
            }

            return null;
          };
        }

        // 10. Nếu compareType == "in" và child.name == "condition"
        if (item.compareType === "in" && child.name === "condition") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            return listEqualIn.includes(value) ? null : `Giá trị cho ${fieldName} phải nằm trong [${listEqualIn.join(", ")}]`;
          };
        }

        // 11. Nếu compareType == "in", type == "number", child.name == "value"
        if (item.compareType === "in" && child.name === "value" && item.type === "number") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            if (typeof value === "number") return null;
            if (typeof value === "string") {
              // Chuỗi số ngăn cách bằng |
              if (isValidNumberList(value)) return null;
            }
            return `Giá trị cho ${fieldName} phải là số hoặc chuỗi các số ngăn cách bằng |`;
          };
        }

        // 12. Nếu compareType == "equal" và child.name == "condition" và item.type == "lookup"
        if (item.compareType === "equal" && child.name === "condition" && item.type === "lookup") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            return listEqualText.includes(value) ? null : `Giá trị cho ${fieldName} phải nằm trong [${listEqualText.join(", ")}]`;
          };
        }

        // 13. Nếu  child.name == "value" và item.type == "lookup"
        if (item.compareType === "equal" && child.name === "value" && item.type === "lookup") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            const num = toNumber(value);
            if (num !== null) return null;
            return `Giá trị cho ${fieldName} phải là số (ID của lookup) hoặc trống`;
          };
        }

        // 14. Nếu compareType == "in" và child.name == "condition" và item.type == "lookup"
        if (item.compareType === "in" && child.name === "condition" && item.type === "lookup") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            return listEqualIn.includes(value) ? null : `Giá trị cho ${fieldName} phải nằm trong [${listEqualIn.join(", ")}]`;
          };
        }

        // 15. Nếu item.compareType === "in"  child.name == "value" và item.type == "lookup"
        if (item.compareType === "in" && child.name === "value" && item.type === "lookup") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            if (typeof value === "number") return null;
            if (typeof value === "string") {
              // Chuỗi số ngăn cách bằng |
              if (isValidNumberList(value)) return null;
            }
            return `Giá trị cho ${fieldName} phải là số (ID của lookup) hoặc chuỗi các số ngăn cách bằng |`;
          };
        }

        // 16. Nếu compareType == "equal" và child.name == "condition" và item.type == "lookup"
        if (item.compareType === "equal" && child.name === "condition" && item.type === "select") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            return listEqualText.includes(value) ? null : `Giá trị cho ${fieldName} phải nằm trong [${listEqualText.join(", ")}]`;
          };
        }

        // 17. Nếu compareType == "equal" và child.name == "value" và item.type == "select"
        if (item.compareType === "equal" && child.name === "value" && item.type === "select") {
          let itemOptions = item.options.map((opt) => opt.value);
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            } else {
              return itemOptions.includes(value) ? null : `Giá trị cho ${fieldName} phải nằm trong [${itemOptions.join(", ")}]`;
            }
          };
        }

        // 18. Nếu item.columnType == "decision" và child.name == "Ngày" or "Giờ" or "Phút" và item.type == "number"
        if (item.columnType == "decision" && listDecitionValue.includes(child.name) && item.type === "object") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            const num = toNumber(value);
            if (num !== null) return null;
            return `Giá trị cho ${fieldName} phải là số hợp lệ`;
          };
        }

        // 19. Nếu compareType == "equal", type == "number", child.name == "value"
        if (item.compareType === "equal" && child.name === "value" && item.type === "number") {
          validateValue = (value) => {
            if (value === undefined || value === null || value === "") {
              return `Giá trị cho ${fieldName} không được để trống.`;
            }
            const num = toNumber(value);
            if (num !== null) return null;
            return `Giá trị cho ${fieldName} phải là số `;
          };
        }

        validateFields.push({
          name: fieldName,
          type: child.type || item.type,
          required: item.required || false,
          message: `Trường ${item.name}${child.name ? ` - ${child.name}` : ""} không được để trống`,
          validateValue,
        });
      });
    } else {
      let validateValue: (value: any, allValues?: any) => string | null = () => null;
      if (item.type == "checkbox") {
        // Trường hợp checkbox: chỉ cần kiểm tra giá trị là TRUE, FALSE hoặc trống
        validateValue = (value) => {
          return listChekbox.includes(value) ? null : `Giá trị cho ${item.name} phải là TRUE, FALSE hoặc trống`;
        };
      }
      // Trường hợp không có children: trường đơn lẻ
      validateFields.push({
        name: item.name,
        type: item.type,
        required: item.required || false,
        message: `Trường ${item.name} không được để trống`,
        validateValue,
      });
    }
  });

  return validateFields;
}
