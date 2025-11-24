import React, { useState, memo, useCallback, useEffect } from "react";
import "./index.scss";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import Input from "components/input/input";
import SelectLookupGrid from "./partials/SelectLookupGrid";
import Checkbox from "components/checkbox/checkbox";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import { useGridAg } from "../../GridAgContext";
import { Parser } from "formula-functionizer";

const CustomCellEdit = (props) => {
  const { columnsConfig } = useGridAg();
  const { type } = props;
  const [value, setValue] = useState(props.value);

  const parser = new Parser();

  const handleBlur = () => {
    // Gửi giá trị đã chỉnh sửa ngược lại cho AG Grid
    // props.node.setDataValue(props.colDef.field, value);
    props.api.stopEditing();
  };

  const handleChangeValue = (e) => {
    // props.node.setDataValue("TenVaHo", "Năng Đình Hoàng");
    // props.node.setDataValue("GiaSanPham_BindingSanPham", 1111111);
    // console.log("e in handleChangeValue", props.data);
    // props.api.stopEditing();
    // return;
    let newValue = null;
    if (type === "number") {
      newValue = e.floatValue;
      // Tìm xem có cột nào là formula và có liên quan đến cột hiện tại không
      const relatedFormulaColumns = columnsConfig.filter((col) => col.type === "formula" && col.formula && col.formula.includes(props.colDef.field));

      if (relatedFormulaColumns.length) {
        relatedFormulaColumns.forEach((col) => {
          try {
            // Phân tích biểu thức thành một hàm
            const formula = parser.parse(JSON.parse(col.formula)?.formula);
            const result = formula({
              ...props.data,
              [props.colDef.field]: newValue || 0,
            });
            props.node.setDataValue(col.key, result);
          } catch (error) {
            console.error("Error evaluating formula:", error);
          }
        });
      }
    } else if (type === "select" || type === "lookup") {
      newValue = e ? e.value : null;
      props.api.stopEditing();
    } else if (type === "binding") {
      newValue = e ? e.value : null;
      console.log("e in binding", e);
      console.log("e in binding..props.columnsConfig..", columnsConfig);
      console.log("e in binding..props.props.node..", props.node);

      // GiaSanPham_BindingSanPham
      if (e != null) {
        if (e?.bindingField.length) {
          e.bindingField.map((field) => {
            console.log("e in binding>>field in binding", field.key, e[field.key]);

            props.node.setDataValue(field.key, e[field.key]);
            // props.node.setDataValue(field.key, "11111111");
            console.log("e in handleChangeValue", props.data);
          });
        }
      } else {
        if (props.colDef.cellEditorParams.listBindingField.length) {
          props.colDef.cellEditorParams.listBindingField.map((field) => {
            props.node.setDataValue(field.key, "");
          });
        }
      }
      props.api.stopEditing();
    } else if (type === "checkbox") {
      newValue = e ? (e.target.checked ? "true" : "false") : "false";
      // props.api.stopEditing();
    } else if (type === "date") {
      let _value = e ? new Date(e) : "";
      newValue = moment(_value).utc().toISOString();
      // Tìm xem có cột nào là dateRange và có liên quan đến cột hiện tại không
      const relatedDateRangeColumn = columnsConfig.filter(
        (col) =>
          col.type === "time_range" &&
          col.timeRange &&
          (JSON.parse(col.timeRange)?.startDate == props.colDef.field || JSON.parse(col.timeRange)?.endDate == props.colDef.field)
      );
      if (relatedDateRangeColumn.length) {
        relatedDateRangeColumn.forEach((col) => {
          const timeRange = JSON.parse(col.timeRange);
          const dataRow = props.data;
          const startDate =
            props.colDef.field == timeRange.startDate ? moment(_value, "MM/DD/YYYY") : moment(new Date(dataRow[timeRange.startDate]), "MM/DD/YYYY");
          const endDate =
            props.colDef.field == timeRange.endDate ? moment(_value, "MM/DD/YYYY") : moment(new Date(dataRow[timeRange.endDate]), "MM/DD/YYYY");
          let count = 0;
          const currentDate = startDate.clone();

          while (currentDate.isSameOrBefore(endDate)) {
            const dayOfWeek = currentDate.day();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              // 0 là Chủ nhật, 6 là Thứ 7
              count++;
            }
            currentDate.add(1, "days");
          }
          props.node.setDataValue(col.key, count + " ngày"); // 👈 cập nhật lại vào grid cho trường time_range
        });
      }
    } else {
      newValue = e.target.value;
    }
    console.log("props.colDef.field>>>", newValue);
    console.log("props.colDef.field>>>", props.colDef.field);

    props.node.setDataValue(props.colDef.field, newValue); // 👈 cập nhật lại vào grid
    setValue(newValue);
  };

  const [styleCustom, setStyleCustom] = useState({
    container: (provided) => ({
      ...provided,
      width: props.width ? props.width - 1 : "100%",
      minWidth: 0,
    }),
    control: (provided) => ({
      ...provided,
      width: props.width ? props.width - 1 : "100%",
      minWidth: 0,
      boxSizing: "border-box",
      paddingLeft: "18px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  });

  useEffect(() => {
    setStyleCustom({
      container: (provided) => ({
        ...provided,
        width: props.width ? props.width - 1 : "100%",
        minWidth: 0,
      }),
      control: (provided) => ({
        ...provided,
        width: props.width ? props.width - 1 : "100%",
        minWidth: 0,
        boxSizing: "border-box",
        paddingLeft: "18px",
      }),
      menu: (provided) => ({
        ...provided,
        zIndex: 9999,
      }),
    });
  }, [props.width]);

  console.log("value", value);

  const generateItemInput = useCallback(
    (type) => {
      switch (type) {
        case "checkbox":
          return <Checkbox checked={value} disabled={false} onChange={(e) => handleChangeValue(e)} />;
        case "number":
          return (
            <NummericInput
              name={props.colDef.field}
              value={value == 0 ? null : value}
              onBlur={handleBlur}
              disabled={false}
              placeholder={"Nhập " + props.colDef.headerName}
              thousandSeparator={true}
              onValueChange={(e) => {
                //Phát hiện nút Enter thì gọi handleBlur
                if (e.key === "Enter") {
                  handleBlur();
                }
                handleChangeValue(e);
              }}
              isDecimalScale={false}
            />
          );
        case "date":
          return (
            <DatePickerCustom
              name={props.colDef.field}
              fill={false}
              // value={field.value}
              value={value ? moment(value).format("DD/MM/YYYY") : ""}
              iconPosition="left"
              // icon={<Icon name="Calendar" />}
              onChange={(e) => handleChangeValue(e)}
              disabled={false}
              placeholder={"Chọn " + props.colDef.headerName}
            />
          );
        case "select":
          return (
            <SelectCustom
              styleCustom={styleCustom}
              onBlur={() => {
                handleBlur();
              }}
              name={props.colDef.field}
              options={props?.options || []}
              value={value}
              onChange={(e) => handleChangeValue(e)}
              disabled={false}
              placeholder={"Chọn " + props.colDef.headerName}
            />
          );
        case "lookup":
        case "binding":
          return (
            <SelectLookupGrid
              onBlur={handleBlur}
              name={props.colDef.field}
              col={props.colDef}
              lookup={props.lookup}
              bindingField={props.colDef.cellEditorParams.listBindingField}
              // bindingKey={field.key}
              // columnIndex={fieldIndex}
              // rowIndex={rowIndex}
              value={value}
              onChange={(e) => {
                handleChangeValue(e);
              }}
              placeholder={`Chọn ${props.colDef.headerName}`}
              // lookupValues={{
              //   field: {
              //     listValue: props?.options || [],
              //   },
              // }}
              loading={false}
              styleCustom={styleCustom}
            />
          );
        default:
          return (
            <Input
              name={props.colDef.field}
              // row={1}
              onBlur={handleBlur}
              value={value}
              readOnly={false}
              disabled={false}
              placeholder={"Nhập " + props.colDef.headerName}
              onChange={(e) => {
                //Phát hiện nút Enter thì gọi handleBlur
                if (e.key === "Enter") {
                  handleBlur();
                }
                handleChangeValue(e);
              }}
              error={false}
              message={props.colDef.headerName + " không hợp lệ"}
              // height={height[rowIndex] + "px"}
            />
          );
      }
    },
    [handleChangeValue, handleBlur, props, styleCustom, columnsConfig]
  ); // Thêm các dependencies nếu cần

  return <div className="custom-cell-edit">{generateItemInput(type)}</div>;
};

export default memo(CustomCellEdit);
