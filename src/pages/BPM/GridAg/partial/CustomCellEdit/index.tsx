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
import { genKeyLookupGrid } from "../../function/lookupGrid";

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

  // const handleChangeValue = (e) => {
  //   let newValue = null;
  //   if (type === "number") {
  //     newValue = e.floatValue;
  //     // Tìm xem có cột nào là formula và có liên quan đến cột hiện tại không
  //     const relatedFormulaColumns = columnsConfig.filter((col) => col.type === "formula" && col.formula && col.formula.includes(props.colDef.field));
  //     console.log("relatedFormulaColumns", relatedFormulaColumns);

  //     if (relatedFormulaColumns.length) {
  //       relatedFormulaColumns.forEach((col) => {
  //         try {
  //           // Phân tích biểu thức thành một hàm
  //           const formula = parser.parse(JSON.parse(col.formula)?.formula);
  //           const newPropsData = {
  //             ...props.data,
  //             [props.colDef.field]: newValue || 0,
  //           };
  //           const result = formula(newPropsData);
  //           console.log("relatedFormulaColumns>>", props.data);
  //           console.log("relatedFormulaColumns>>col.key", col.key);
  //           console.log("relatedFormulaColumns>>result", result);
  //           props.node.setDataValue(col.key, result);
  //         } catch (error) {
  //           console.error("Error evaluating formula:", error);
  //         }
  //       });
  //     }
  //   } else if (type === "select" || type === "lookup") {
  //     newValue = e ? e.value : null;
  //     props.api.stopEditing();
  //   } else if (type === "binding") {
  //     newValue = e ? e.value : null;

  //     if (e != null) {
  //       if (e?.bindingField.length) {
  //         e.bindingField.map((field) => {
  //           try {
  //             props.node.setDataValue(field.key, e[field.key]);
  //           } catch (error) {
  //             console.log("Error binding field Grid", error);
  //           }
  //         });
  //       }
  //     } else {
  //       if (props.colDef.cellEditorParams.listBindingField.length) {
  //         props.colDef.cellEditorParams.listBindingField.map((field) => {
  //           props.node.setDataValue(field.key, "");
  //         });
  //       }
  //     }
  //     props.api.stopEditing();
  //   } else if (type === "checkbox") {
  //     newValue = e ? (e.target.checked ? "true" : "false") : "false";
  //     // props.api.stopEditing();
  //   } else if (type === "date") {
  //     let _value = e ? new Date(e) : "";
  //     newValue = moment(_value).utc().toISOString();
  //     // Tìm xem có cột nào là dateRange và có liên quan đến cột hiện tại không
  //     const relatedDateRangeColumn = columnsConfig.filter(
  //       (col) =>
  //         col.type === "time_range" &&
  //         col.timeRange &&
  //         (JSON.parse(col.timeRange)?.startDate == props.colDef.field || JSON.parse(col.timeRange)?.endDate == props.colDef.field)
  //     );
  //     if (relatedDateRangeColumn.length) {
  //       relatedDateRangeColumn.forEach((col) => {
  //         const timeRange = JSON.parse(col.timeRange);
  //         const dataRow = props.data;
  //         const startDate =
  //           props.colDef.field == timeRange.startDate ? moment(_value, "MM/DD/YYYY") : moment(new Date(dataRow[timeRange.startDate]), "MM/DD/YYYY");
  //         const endDate =
  //           props.colDef.field == timeRange.endDate ? moment(_value, "MM/DD/YYYY") : moment(new Date(dataRow[timeRange.endDate]), "MM/DD/YYYY");
  //         let count = 0;
  //         const currentDate = startDate.clone();

  //         while (currentDate.isSameOrBefore(endDate)) {
  //           const dayOfWeek = currentDate.day();
  //           if (dayOfWeek !== 0 && dayOfWeek !== 6) {
  //             // 0 là Chủ nhật, 6 là Thứ 7
  //             count++;
  //           }
  //           currentDate.add(1, "days");
  //         }
  //         props.node.setDataValue(col.key, count + " ngày"); // 👈 cập nhật lại vào grid cho trường time_range
  //       });
  //     }
  //   } else {
  //     newValue = e.target.value;
  //   }

  //   props.node.setDataValue(props.colDef.field, newValue); // 👈 cập nhật lại vào grid
  //   setValue(newValue);
  // };

  const handleChangeValue = (e) => {
    const fieldKey = props.colDef.field;
    let newValue = null;

    // We'll prepare a newData copy when we need to update multiple fields at once.
    // By default don't mutate props.node.data directly.
    let newData = null;
    const markMultiUpdate = { value: false };

    // hàm để đảm bảo giữ nguyên các kiểu dữ liệu gốc (tránh ||)
    const safeGet = (obj: Record<string, unknown>, key: string, fallback: Record<string, unknown> = null) => (obj && key in obj ? obj[key] : fallback);

    if (type === "number") {
      // giữ nguyên kiểu số (ví dụ 0)
      newValue = safeGet(e, "floatValue", null);
      // prepare newData to potentially update formulas related to this column
      const relatedFormulaColumns = columnsConfig.filter((col) => col.type === "formula" && col.formula && col.formula.includes(fieldKey));

      if (relatedFormulaColumns.length) {
        newData = { ...props.node.data, [fieldKey]: newValue ?? 0 };
        relatedFormulaColumns.forEach((col) => {
          try {
            // parse formula (giữ nguyên cách bạn đang dùng parser)
            const formula = parser.parse(JSON.parse(col.formula)?.formula);
            const result = formula(newData);
            newData[col.key] = result;
          } catch (error) {
            console.error("Error evaluating formula:", error);
          }
        });
        markMultiUpdate.value = true;
      }
    } else if (type === "select" || type === "lookup") {
      newValue = safeGet(e, "value", null);
      // single-field update is OK here
      props.api.stopEditing();
    } else if (type === "binding") {
      newValue = safeGet(e, "value", null);
      // binding có thể thay đổi nhiều field => build newData
      newData = { ...props.node.data, [fieldKey]: newValue ?? "" };

      let changedFieldKeys: string[] = [];

      if (e != null) {
        if (Array.isArray(e.bindingField) && e.bindingField.length) {
          e.bindingField.forEach((field) => {
            try {
              // giữ nguyên kiểu của e[field.key]
              newData[field.key] = safeGet(e, field.key, "");
              changedFieldKeys.push(field.key);
            } catch (error) {
              console.log("Error binding field Grid", error);
            }
          });
        }
      } else {
        // clear bound fields if value null
        const listBinding = safeGet(props.colDef, "cellEditorParams", {}).listBindingField || [];
        if (Array.isArray(listBinding) && listBinding.length) {
          listBinding.forEach((field) => {
            newData[field.key] = "";
            changedFieldKeys.push(field.key);
          });
        }
      }

      // bây giờ kiểm tra các field vừa thay đổi: nếu field đó là number
      // và nằm trong bất kỳ formula column nào thì phải recalc formula đó
      const numberChangedKeys = changedFieldKeys.filter((k) => {
        const colInfo = columnsConfig.find((c) => c.key === k || c.field === k);
        return colInfo && colInfo.type === "number";
      });

      if (numberChangedKeys.length) {
        // tìm tất cả các formula column có tham chiếu tới ít nhất 1 trong numberChangedKeys
        const affectedFormulaCols = columnsConfig.filter(
          (col) => col.type === "formula" && col.formula && numberChangedKeys.some((changedKey) => col.formula.includes(changedKey))
        );

        if (affectedFormulaCols.length) {
          // evaluate these formulas iteratively because formulas có thể phụ thuộc lẫn nhau
          const formulaCols = affectedFormulaCols.slice();
          const maxIter = 5;
          for (let iter = 0; iter < maxIter; iter++) {
            let changed = false;
            for (const col of formulaCols) {
              try {
                const parsed = parser.parse(JSON.parse(col.formula)?.formula);
                const result = parsed(newData);
                if (newData[col.key] !== result) {
                  newData[col.key] = result;
                  changed = true;
                }
              } catch (error) {
                console.error("Error evaluating binding-related formula:", error);
              }
            }
            if (!changed) break;
          }
        }
      }

      markMultiUpdate.value = true;
      props.api.stopEditing();
    } else if (type === "checkbox") {
      newValue = e ? (e.target.checked ? "true" : "false") : "false";
    } else if (type === "date") {
      let _value = e ? new Date(e) : "";
      newValue = _value ? moment(_value).utc().toISOString() : "";
      // kiểm tra related time_range
      const relatedDateRangeColumn = columnsConfig.filter(
        (col) =>
          col.type === "time_range" &&
          col.timeRange &&
          (JSON.parse(col.timeRange)?.startDate === fieldKey || JSON.parse(col.timeRange)?.endDate === fieldKey)
      );

      if (relatedDateRangeColumn.length) {
        // prepare newData so calculations can read updated date
        newData = { ...props.node.data, [fieldKey]: newValue };
        relatedDateRangeColumn.forEach((col) => {
          const timeRange = JSON.parse(col.timeRange);
          const dataRow = newData;
          const startDate =
            fieldKey === timeRange.startDate
              ? moment(_value, "MM/DD/YYYY")
              : moment(new Date(safeGet(dataRow, timeRange.startDate, null)), "MM/DD/YYYY");
          const endDate =
            fieldKey === timeRange.endDate ? moment(_value, "MM/DD/YYYY") : moment(new Date(safeGet(dataRow, timeRange.endDate, null)), "MM/DD/YYYY");

          let count = -1;
          const currentDate = startDate.clone();
          while (currentDate.isSameOrBefore(endDate)) {
            // const dayOfWeek = currentDate.day();
            // if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            //   // 0 là Chủ nhật, 6 là Thứ 7, không tính ngày nghỉ
            //   count++;
            // }
            count++;
            currentDate.add(1, "days");
          }
          newData[col.key] = count + " ngày";
        });
        markMultiUpdate.value = true;
      }
    } else {
      // default: lấy giá trị từ event target, giữ nguyên kiểu nếu có
      newValue = safeGet(e, "target") ? e.target.value : safeGet(e, "value", e);
    }

    // Nếu đã chuẩn bị newData (multi-field update) thì setData cả row 1 lần
    if (markMultiUpdate.value && newData) {
      // props.node.setData(newData); // cách này cũng update cả row 1 lần được nhưng không trigger change từng field , nghĩ cách sử dụng sau
      Object.keys(newData).forEach((key) => {
        const col = props.columnApi.getColumn(key);
        if (col) {
          props.node.setDataValue(key, newData[key]);
        } else {
          // thêm field mới vào data mà không dùng setDataValue
          props.node.data = { ...(props.node.data || {}), [key]: newData[key].toString() };
          // nếu muốn thông báo, gọi props.api.dispatchEvent(...) hoặc props.onChange(...)
        }
      });
      // cập nhật local state giá trị hiển thị cho ô hiện tại
      setValue(newData[fieldKey]);
    } else {
      // chỉ cập nhật 1 field
      props.node.setDataValue(fieldKey, newValue);
      setValue(newValue);
    }
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
              value={value ?? null}
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
          let keyLookup = genKeyLookupGrid(props.colDef.cellRendererParams);
          return (
            <SelectLookupGrid
              onBlur={handleBlur}
              name={props.colDef.field}
              col={props.colDef}
              lookup={keyLookup}
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
