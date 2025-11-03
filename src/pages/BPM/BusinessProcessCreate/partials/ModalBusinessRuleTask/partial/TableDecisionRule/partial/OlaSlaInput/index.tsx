import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import React, { memo } from "react";

interface RangeValueInputProps {
  child: any;
  index: number;
  rowIndex: number;
  fieldIndex: number;
  handChangeValueItem: (rowIndex: number, fieldIndex: number, value: any, type: "number" | "input", index: number) => void;
}

const OlaSlaInput: React.FC<RangeValueInputProps> = ({ child, index, rowIndex, fieldIndex, handChangeValueItem }) => {
  return child.type === "number" ? (
    <NummericInput
      name={child.name}
      value={child.value}
      //   disabled={!true ? true : child.readOnly}
      thousandSeparator={true}
      onValueChange={(e) => {
        handChangeValueItem(rowIndex, fieldIndex, e, "number", index);
      }}
      placeholder={`Nhập ${child?.name}`}
      isDecimalScale={false}
    />
  ) : (
    <Input
      name={child.name}
      value={child.value}
      //   readOnly={!true ? true : field.isBinding}
      //   disabled={true}
      onChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, "input", index)}
      placeholder={`${child?.name}`}
      error={child?.isRegexFalse}
      message={child.name + " không hợp lệ"}
    />
  );
};

export default memo(OlaSlaInput);
