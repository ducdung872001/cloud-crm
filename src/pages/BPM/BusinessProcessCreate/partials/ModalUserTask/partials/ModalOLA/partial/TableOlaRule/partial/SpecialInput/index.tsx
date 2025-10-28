import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import moment from "moment";
import React, { memo } from "react";
import "./index.scss";

interface SpecialInputProps {
  field: any;
  rowIndex: number;
  fieldIndex: number;
  handChangeValueItem: (rowIndex: number, fieldIndex: number, value: any, type: "compare" | "number" | "date") => void;
}

// const areEqual = (prevProps: SpecialInputProps, nextProps: SpecialInputProps) => {
//   return (
//     prevProps.rowIndex === nextProps.rowIndex &&
//     prevProps.fieldIndex === nextProps.fieldIndex &&
//     prevProps.field.value === nextProps.field.value &&
//     prevProps.field.isOtherwise === nextProps.field.isOtherwise &&
//     prevProps.field.isSpecialValue === nextProps.field.isSpecialValue &&
//     prevProps.field.compareType === nextProps.field.compareType &&
//     prevProps.field.key === nextProps.field.key &&
//     // JSON.stringify(prevProps.field) === JSON.stringify(nextProps.field) &&
//     prevProps.handChangeValueItem === nextProps.handChangeValueItem
//   );
// };

const SpecialInput: React.FC<SpecialInputProps> = ({ field, rowIndex, fieldIndex, handChangeValueItem }) => {
  return (
    <div className="component component_special">
      <SelectCustom
        name={field.name}
        fill={true}
        //   disabled={!true ? true : field.readOnly}
        options={[
          { label: ">", value: ">" },
          { label: "<", value: "<" },
          { label: ">=", value: ">=" },
          { label: "<=", value: "<=" },
          { label: "=", value: "=" },
          { label: "!=", value: "!=" },
        ]}
        value={field?.compare || ""}
        onChange={(e) => {
          handChangeValueItem(rowIndex, fieldIndex, e, "compare");
        }}
        placeholder={`Chọn so sánh`}
      />
      {field.type === "date" ? (
        <DatePickerCustom
          name={field.name}
          fill={false}
          value={field?.value ? moment(field.value).format("DD/MM/YYYY") : ""}
          iconPosition="left"
          onChange={(e) => {
            handChangeValueItem(rowIndex, fieldIndex, e, field.type);
          }}
          placeholder={`Chọn ${field?.name}`}
        />
      ) : (
        <NummericInput
          name={field.name}
          value={field.value}
          //   disabled={!true ? true : child.readOnly}
          thousandSeparator={true}
          onValueChange={(e) => {
            handChangeValueItem(rowIndex, fieldIndex, e, field.type);
          }}
          placeholder={`Nhập ${field?.name}`}
          isDecimalScale={false}
        />
      )}
    </div>
  );
};

export default memo(SpecialInput);
// export default memo(SpecialInput, areEqual);
