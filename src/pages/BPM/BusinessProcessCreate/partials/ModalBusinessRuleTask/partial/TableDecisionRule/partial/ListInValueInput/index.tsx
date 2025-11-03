import Tippy from "@tippyjs/react";
import SelectCustom from "components/selectCustom/selectCustom";
import React, { memo, useState } from "react";
import ModalEditValueIn from "../ModalEditValueIn";
import "./index.scss";

interface ListInValueInputProps {
  field: any;
  rowIndex: number;
  fieldIndex: number;
  handChangeValueItem: (rowIndex: number, fieldIndex: number, value: any, type: "compare" | "number" | "date") => void;
  setDataRow: (data: any) => void;
}

const ListInValueInput: React.FC<ListInValueInputProps> = ({ field, rowIndex, fieldIndex, handChangeValueItem, setDataRow }) => {
  const [showEditListValueIn, setShowEditListValueIn] = useState(false);
  const [dataFieldEdit, setDataFieldEdit] = useState({
    rowIndex: 0,
    fieldIndex: 0,
    value: [],
    type: "text",
  });

  function formatNumber(input: number): string {
    // Chuyển số thành chuỗi
    const inputStr = input.toString();

    // Tách phần nguyên và phần thập phân
    const [integerPart, decimalPart] = inputStr.split(".");

    // Định dạng phần nguyên: thêm dấu phẩy mỗi 3 chữ số
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Nếu có phần thập phân, ghép phần nguyên và phần thập phân với dấu chấm
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }

  return (
    <div className="comtainer-compare-in">
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
      <div className="component-compare-in">
        {field?.value && Array.isArray(field.value) && field.value.length > 0 ? (
          field.value.map((item, index) => {
            return (
              <div
                key={index}
                className="value-compare-in add-value-compare-in"
                onClick={() => {
                  setShowEditListValueIn(true);
                  setDataFieldEdit({
                    rowIndex: rowIndex,
                    fieldIndex: fieldIndex,
                    value: field.value,
                    type: field.type,
                  });
                }}
              >
                {field.type == "number" ? formatNumber(item) : item}
              </div>
            );
          })
        ) : (
          <Tippy content="Thêm giá trị">
            <div
              className="value-compare-in add-value-compare-in"
              onClick={() => {
                setShowEditListValueIn(true);
                setDataFieldEdit({
                  rowIndex: rowIndex,
                  fieldIndex: fieldIndex,
                  value: field.value,
                  type: field.type,
                });
              }}
            >
              +
            </div>
          </Tippy>
        )}
      </div>
      <ModalEditValueIn
        onShow={showEditListValueIn}
        dataFieldEdit={dataFieldEdit}
        setDataRow={setDataRow}
        handChangeValueItem={handChangeValueItem}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setShowEditListValueIn(false);
          setDataFieldEdit({
            rowIndex: 0,
            fieldIndex: 0,
            value: [],
            type: "text",
          });
        }}
      />
    </div>
  );
};

export default memo(ListInValueInput);
