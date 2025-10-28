import React, { memo } from "react";
import ListInValueInput from "../ListInValueInput";
import SelectCustom from "components/selectCustom/selectCustom";
import NummericInput from "components/input/numericInput";
import Checkbox from "components/checkbox/checkbox";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import Input from "components/input/input";
import "./index.scss";
import SelectLookupOla from "./partial/SelectLookupOla";
import ListInValueLookupInput from "../ListInValueLookupInput";
import SelectMultilDropdown from "./partial/SelectMultilDropdown";

interface ComponentInputProps {
  field: any;
  rowIndex: number;
  fieldIndex: number;
  handChangeValueItem: (
    rowIndex: number,
    fieldIndex: number,
    value: any,
    type: "compare" | "number" | "date" | "checkbox" | "input" | "select" | "select_multi" | "lookup"
  ) => void;
  setDataRow: (data: any) => void;
  //   listColumn: any[];
  //   setListColumn: (columns: any[]) => void;
  //   dataRow: any;
  lookupValues: any;
  loading: boolean;
}

const ComponentInput: React.FC<ComponentInputProps> = ({
  field,
  rowIndex,
  fieldIndex,
  handChangeValueItem,
  setDataRow,
  //   listColumn,
  //   setListColumn,
  //   dataRow,
  lookupValues,
  loading,
}) => {
  return (
    <div
      className={`component ${field?.compareType == "in" && (field.type == "lookup" || field.type == "select") ? "component-compare-in-lookup" : ""}`}
    >
      {field?.isOtherwise ? (
        <div className="italic-text">{field?.value}</div>
      ) : (
        <>
          {field?.compareType == "in" && field.columnType == "condition" ? (
            <>
              {field.type == "select" ? (
                <SelectMultilDropdown field={field} rowIndex={rowIndex} fieldIndex={fieldIndex} handChangeValueItem={handChangeValueItem} />
              ) : field.type != "lookup" ? (
                <ListInValueInput
                  field={field}
                  rowIndex={rowIndex}
                  fieldIndex={fieldIndex}
                  handChangeValueItem={handChangeValueItem}
                  setDataRow={setDataRow}
                />
              ) : (
                <ListInValueLookupInput
                  field={field}
                  rowIndex={rowIndex}
                  fieldIndex={fieldIndex}
                  handChangeValueItem={handChangeValueItem}
                  lookupValues={lookupValues}
                  loading={loading}
                />
              )}
            </>
          ) : (
            <>
              {field.columnType == "condition" && field.type != "checkbox" ? (
                <SelectCustom
                  name={field.name}
                  fill={true}
                  //   disabled={!true ? true : field.readOnly}
                  options={[
                    { label: "=", value: "=" },
                    { label: "!=", value: "!=" },
                    ...(field.type === "number" || field.type === "date"
                      ? [
                          { label: "<", value: "<" },
                          { label: ">", value: ">" },
                          { label: "<=", value: "<=" },
                          { label: ">=", value: ">=" },
                        ]
                      : []),
                  ]}
                  value={field?.compare || "="}
                  onChange={(e) => {
                    handChangeValueItem(rowIndex, fieldIndex, e, "compare");
                  }}
                />
              ) : null}
              {field.type === "number" ? (
                <NummericInput
                  name={field.name}
                  value={field.value}
                  //   disabled={!true ? true : field.readOnly}
                  thousandSeparator={true}
                  onValueChange={(e) => {
                    handChangeValueItem(rowIndex, fieldIndex, e, "number");
                  }}
                  placeholder={`Nhập ${field?.name}`}
                  isDecimalScale={false}
                />
              ) : field.type === "checkbox" ? (
                <Checkbox
                  checked={field.value}
                  //   disabled={!true ? true : field.readOnly}
                  onChange={(e) => {
                    handChangeValueItem(rowIndex, fieldIndex, e, "checkbox");
                  }}
                />
              ) : field.type === "date" ? (
                <DatePickerCustom
                  name={field.name}
                  fill={false}
                  value={field.value ? moment(field.value).format("DD/MM/YYYY") : ""}
                  iconPosition="left"
                  //   disabled={!true ? true : field.readOnly}
                  // icon={<Icon name="Calendar" />}
                  onChange={(e) => {
                    handChangeValueItem(rowIndex, fieldIndex, e, field.type);
                  }}
                  placeholder={`Chọn ${field?.name}`}
                />
              ) : field.type === "formula" ? (
                <NummericInput
                  name={field.name}
                  value={field.value}
                  //   disabled={true}
                  thousandSeparator={true}
                  placeholder={`Nhập ${field?.name}`}
                  isDecimalScale={false}
                />
              ) : field.type === "time_range" ? (
                <Input
                  name={field.name}
                  value={field.value}
                  //   readOnly={!true ? true : field.isBinding}
                  //   disabled={true}
                  onChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, "input")}
                  placeholder={`${field?.name}`}
                  error={field?.isRegexFalse}
                  message={field.name + " không hợp lệ"}
                />
              ) : field.type === "lookup" ? (
                <div
                  onDoubleClick={() => {
                    // handleShowDetail(rowIndex, fieldIndex);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="select-field">
                    <SelectLookupOla
                      name={field.name}
                      lookup={field.lookup}
                      bindingField={field.listBindingField}
                      bindingKey={field.key}
                      columnIndex={fieldIndex}
                      rowIndex={rowIndex}
                      value={field.value}
                      onChange={(e) => {
                        handChangeValueItem(rowIndex, fieldIndex, e, field.type);
                      }}
                      placeholder={`Chọn ${field?.name}`}
                      lookupValues={lookupValues}
                      loading={loading}
                    />
                  </div>
                </div>
              ) : field.type === "select" ? (
                <div className="select-field">
                  <SelectCustom
                    name={field.name}
                    //   disabled={!true ? true : field.readOnly}
                    options={field.options || []}
                    value={field.value}
                    onChange={(e) => {
                      handChangeValueItem(rowIndex, fieldIndex, e, "select");
                    }}
                    placeholder={`Chọn ${field?.name}`}
                  />
                </div>
              ) : (
                <Input
                  name={field.name}
                  value={field.value}
                  //   readOnly={!true ? true : field.isBinding}
                  //   disabled={true}
                  onChange={(e) => handChangeValueItem(rowIndex, fieldIndex, e, "input")}
                  placeholder={`${field?.name}`}
                  error={field?.isRegexFalse}
                  message={field.name + " không hợp lệ"}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default memo(ComponentInput);
