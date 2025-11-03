import Tippy from "@tippyjs/react";
import SelectCustom from "components/selectCustom/selectCustom";
import React, { memo, useState } from "react";
import ModalEditValueIn from "../ModalEditValueIn";
import "./index.scss";
import SelectLookupOla from "../ComponentInput/partial/SelectLookupOla";
import SelectMultiLookupOla from "../ComponentInput/partial/SelectMultiLookupOla";

interface ListInValueLookupInputProps {
  field: any;
  rowIndex: number;
  fieldIndex: number;
  handChangeValueItem: (rowIndex: number, fieldIndex: number, value: any, type: "compare" | "number" | "date") => void;
  lookupValues: any;
  loading: boolean;
}

const ListInValueLookupInput: React.FC<ListInValueLookupInputProps> = ({
  field,
  rowIndex,
  fieldIndex,
  handChangeValueItem,
  lookupValues,
  loading,
}) => {
  return (
    <div className="comtainer-compare-in-lookup-input">
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
          <SelectMultiLookupOla
            name={field.name}
            lookup={field.lookup}
            bindingField={field.listBindingField}
            bindingKey={field.key}
            isMulti={true}
            columnIndex={fieldIndex}
            rowIndex={rowIndex}
            value={field.value}
            onChange={(e) => {
              console.log("onChange-ListInValueLookupInput", e);
              const value = {
                value: e.map((item: any) => item.value),
              };

              handChangeValueItem(rowIndex, fieldIndex, value, field.type);
            }}
            placeholder={`Chọn ${field?.name}`}
            lookupValues={lookupValues}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(ListInValueLookupInput);
