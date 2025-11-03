//SelectMultilDropdown

import SelectCustom from "components/selectCustom/selectCustom";
import React, { memo } from "react";
import "./index.scss";

interface SelectMultilDropdownProps {
  field: any;
  rowIndex: number;
  fieldIndex: number;
  handChangeValueItem: (rowIndex: number, fieldIndex: number, value: any, type: "compare" | "number" | "date" | "select_multi") => void;
}

const SelectMultilDropdown: React.FC<SelectMultilDropdownProps> = ({ field, rowIndex, fieldIndex, handChangeValueItem }) => {
  return (
    <div className="comtainer-compare-in-dropdown-input">
      <SelectCustom
        name={field.name}
        fill={true}
        //   disabled={!true ? true : field.readOnly}
        options={[
          { label: "in", value: "in" },
          { label: "not in", value: "not_in" },
        ]}
        value={field?.compare || "in"}
        onChange={(e) => {
          handChangeValueItem(rowIndex, fieldIndex, e, "compare");
        }}
      />
      <div
        onDoubleClick={() => {
          // handleShowDetail(rowIndex, fieldIndex);
        }}
        style={{ cursor: "pointer" }}
      >
        <div className="select-field">
          <SelectCustom
            name={field.name}
            //   disabled={!true ? true : field.readOnly}
            isMulti={true}
            special={true}
            options={field.options || []}
            value={
              field?.value
                ? field.value.map((item: any) => ({
                    label: item,
                    value: item,
                  }))
                : []
            }
            onChange={(e) => {
              handChangeValueItem(rowIndex, fieldIndex, e, "select_multi");
            }}
            placeholder={`Chọn ${field?.name}`}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(SelectMultilDropdown);
