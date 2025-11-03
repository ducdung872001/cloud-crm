import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import NummericInput from "components/input/numericInput";
import moment from "moment";
import React, { memo, useState, useEffect } from "react";
import "./index.scss";

interface RangeValueInputProps {
  child: any[];
  rowIndex: number;
  fieldIndex: number;
  handChangeValueItem: (rowIndex: number, fieldIndex: number, value: any, type: "number" | "date", index: number) => void;
  setHaveError?: any; // Hàm để cập nhật trạng thái lỗi, có thể là một hàm setState hoặc một hàm callback
}

const RangeValueInput: React.FC<RangeValueInputProps> = ({ child, rowIndex, fieldIndex, handChangeValueItem, setHaveError }) => {
  const type = child[0].type;

  // State lưu trạng thái lỗi
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (type === "number") {
      let haveError = false;
      const val0 = +child[0].value;
      const val1 = +child[1].value;

      if (child[0].value !== "" && child[1].value !== "" && val0 >= val1) {
        setError("Giá trị min phải nhỏ hơn giá trị max");
        haveError = true;
      } else {
        setError("");
      }
      setHaveError((prev) => {
        const newPrev = typeof prev === "object" && prev !== null ? { ...prev } : {}; // Đảm bảo prev là một object
        newPrev["rowIndex-" + type + "-" + rowIndex] = haveError;
        return newPrev;
      });
    } else if (type === "date") {
      let haveError = false;
      const val0 = child[0].value ? moment(child[0].value) : null;
      const val1 = child[1].value ? moment(child[1].value) : null;
      if (val0 && val1 && val0.isValid() && val1.isValid() && !val0.isBefore(val1)) {
        setError("Ngày min phải nhỏ hơn ngày max");
        haveError = true;
      } else {
        setError("");
      }
      setHaveError((prev) => {
        const newPrev = typeof prev === "object" && prev !== null ? { ...prev } : {}; // Đảm bảo prev là một object
        newPrev["rowIndex-" + type + "-" + rowIndex] = haveError;
        return newPrev;
      });
    } else {
      setError("");
    }
  }, [child, type]);

  return type === "number" ? (
    <>
      <div className={`field-child ${error ? "field-range-error" : ""}`}>
        <div className="component">
          <NummericInput
            name={child[0].name}
            value={child[0].value}
            thousandSeparator={true}
            onValueChange={(e) => {
              handChangeValueItem(rowIndex, fieldIndex, e, type, 0);
            }}
            placeholder={`Nhập ${child[0]?.name}`}
            isDecimalScale={false}
            error={error ? true : false}
            message={error ? error : ""}
          />
        </div>
      </div>
      <div className={`field-child ${error ? "field-range-error" : ""}`}>
        <div className="component">
          <NummericInput
            name={child[1].name}
            value={child[1].value}
            thousandSeparator={true}
            onValueChange={(e) => {
              handChangeValueItem(rowIndex, fieldIndex, e, type, 1);
            }}
            placeholder={`Nhập ${child[1]?.name}`}
            isDecimalScale={false}
            error={error ? true : false}
            message={error ? error : ""}
          />
        </div>
      </div>
    </>
  ) : type === "date" ? (
    <>
      <div className={`field-child ${error ? "field-range-error" : ""}`}>
        <div className="component">
          <DatePickerCustom
            name={child[0].name}
            fill={false}
            value={child[0].value ? moment(child[0].value).format("DD/MM/YYYY") : ""}
            iconPosition="left"
            onChange={(e) => {
              handChangeValueItem(rowIndex, fieldIndex, e, type, 0);
            }}
            placeholder={`Chọn ${child[0]?.name}`}
            error={error ? true : false}
            message={error ? error : ""}
          />
        </div>
      </div>
      <div className={`field-child ${error ? "field-range-error" : ""}`}>
        <div className="component">
          <DatePickerCustom
            name={child[1].name}
            fill={false}
            value={child[1].value ? moment(child[1].value).format("DD/MM/YYYY") : ""}
            iconPosition="left"
            onChange={(e) => {
              handChangeValueItem(rowIndex, fieldIndex, e, type, 1);
            }}
            placeholder={`Chọn ${child[1]?.name}`}
            error={error ? true : false}
            message={error ? error : ""}
          />
        </div>
      </div>
    </>
  ) : (
    <div>Không hỗ trợ kiểu dữ liệu này</div>
  );
};

export default memo(RangeValueInput);
