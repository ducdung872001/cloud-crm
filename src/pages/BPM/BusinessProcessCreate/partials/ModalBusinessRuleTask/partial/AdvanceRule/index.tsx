import React, { Fragment, useEffect, useRef, useState } from "react";
import "./index.scss";
import Input from "components/input/input";
import SelectLookup from "pages/BPM/GridFormSetting/partials/SelectLookup/SelectLookup";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import Checkbox from "components/checkbox/checkbox";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import SelectCustom from "components/selectCustom/selectCustom";
import Popover from "components/popover/popover";
import ActionRow from "../ActionRowPopup/ActionRow";
import { useOnClickOutside } from "utils/hookCustom";
import Button from "components/button/button";
import ModalAddColumn from "./partial/ModalAddColumn";
import ModalAddDecision from "./partial/ModalAddDecision";
import { PHONE_REGEX, EMAIL_REGEX, PHONE_REGEX_NEW } from "utils/constant";
import { Parser } from "formula-functionizer";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ActionField from "../ActionField";
import Tippy from "@tippyjs/react";
import ModalEditValueIn from "./partial/ModalEditValueIn";

export default function AdvaceRule({ dataNode, processId, childProcessId, dataConfigAdvance, setDataConfigAdvanceEdit }) {
  const [dataRow, setDataRow] = useState([]);
  const parser = new Parser();

  const [refs, setRefs] = useState([]);
  const refColumn = useRef();
  const refField = useRef();
  const [editColumn, setEditColumn] = useState([]);
  const [height, setHeight] = useState([]);
  // const [listColumn, setListColumn] = useState<any[]>(headerHsmt);
  const [listColumn, setListColumn] = useState<any[]>([
    {
      key: "stt",
      name: "STT",
      type: "text",
      columnType: "stt",
      width: "50px",
    },
  ]);
  const [listKeyColumn, setListKeyColumn] = useState<any[]>([]); // Danh sách các key của cột trong bảng
  const [baseRow, setBaseRow] = useState<any[]>([]);
  const [showPopoverStatus, setShowPopoverStatus] = useState<boolean[]>([]);
  const [showPopoverStatusField, setShowPopoverStatusField] = useState<any[]>([]);

  useOnClickOutside(refColumn, () => setShowPopoverStatus(showPopoverStatus.map((item) => false)), ["index"]);

  useOnClickOutside(
    refField,
    () =>
      setShowPopoverStatusField(
        showPopoverStatusField.map((item) => {
          return item.map((field) => false);
        })
      ),
    ["index"]
  );

  const [isDataFetch, setIsDataFetch] = useState(false); // Biến này dùng để kiểm tra xem có phải là lần đầu tiên fetch dữ liệu hay không
  useEffect(() => {
    if (dataConfigAdvance?.columns?.length > 0) {
      setIsDataFetch(true); // Lần đầu tiên fetch dữ liệu
      setListColumn(dataConfigAdvance?.columns);
    }
  }, [dataConfigAdvance?.columns]);

  useEffect(() => {
    setEditColumn(
      listColumn.map((item) => {
        return {
          newPosition: item.position,
          isShowEdit: false,
        };
      })
    );
    setListKeyColumn(
      listColumn.map((item) => {
        return item.key;
      })
    );
    const newBaseRow = genNewBaseRow(listColumn);
    setBaseRow(newBaseRow);

    const newDataRow = genNewDataRow(dataRow, newBaseRow);
    if (!isDataFetch) {
      // Những lần thay đổi columns sau
      setDataRow(newDataRow);
    } else {
      //Lần đầu dataRow = dataConfigAdvance.rows (fetch từ api)
      if (dataConfigAdvance?.rows?.length > 0) {
        setDataRow(dataConfigAdvance?.rows);
      }
      setIsDataFetch(false);
    }
  }, [listColumn, isDataFetch]);

  const genNewBaseRow = (listColumn) => {
    let _baseRow = [];
    listColumn.forEach((item) => {
      if (item?.children && item?.children?.length > 0) {
        let _children = item.children.map((child) => {
          return {
            ...child,
            value: "",
          };
        });
        _baseRow.push({
          ...item,
          children: _children,
        });
      } else {
        _baseRow.push({
          ...item,
          compare: item.compareType == "in" ? "in" : item.compareType == "equal" ? "=" : "",
          value: "",
        });
      }
    });
    console.log("_baseRow", _baseRow);
    return _baseRow;
  };
  const genNewDataRow = (dataRow, newBaseRow) => {
    let newDataRow = [];
    //Lặp qua từng hàng trong dataRow và kiểm tra các hàng trong dataRow so với newBaseRow, nếu số trường trong dataRow không bằng số trường trong _baseRow thì thêm các trường còn thiếu vào dataRow và xoá bớt các trường thừa trong dataRow so với newBaseRow
    if (dataRow && dataRow.length > 0) {
      for (let i = 0; i < dataRow.length; i++) {
        let row = dataRow[i];
        let newRow = [];
        for (let j = 0; j < newBaseRow.length; j++) {
          let field = newBaseRow[j];
          let fieldBase = row.find((item) => item.key == field.key);
          const typeOrCompareChanged =
            field.type !== fieldBase?.type || field.compareType !== fieldBase?.compareType || field.compare !== fieldBase?.compare;
          const defaultValue = field.type === "number" ? 0 : "";
          if (fieldBase) {
            let newField = {
              ...field,
              value: typeOrCompareChanged ? defaultValue : fieldBase.value,
              children:
                field?.children && field?.children?.length > 0
                  ? field.children.map((child, cIdx) => {
                      const childBase = fieldBase?.children?.[cIdx];
                      const childTypeChanged = child.type !== childBase?.type;
                      const childDefault = child.type === "number" ? 0 : "";
                      return {
                        ...child,
                        value: typeOrCompareChanged || childTypeChanged ? childDefault : (childBase?.value ?? child?.value ?? ""),
                      };
                    })
                  : [],
            };
            newRow.push(newField);
          } else {
            let newField = {
              ...field,
              value: field.value,
              children:
                field?.children && field?.children?.length > 0
                  ? field.children.map((child) => ({
                      ...child,
                      value: child?.value || "",
                    }))
                  : [],
            };
            newRow.push(newField);
          }
        }
        newDataRow.push(newRow);
      }
    }
    console.log("newDataRow", newDataRow);
    return newDataRow;
  };

  useEffect(() => {
    if (dataRow && dataRow.length > 0) {
      setShowPopoverStatus(dataRow.map((item) => false));
      setHeight(dataRow.map((item) => 44));
      setRefs((refs) =>
        Array(dataRow.length)
          .fill(null)
          .map((_, i) => refs[i] || React.createRef())
      );
      setShowPopoverStatusField(
        dataRow.map((item) => {
          return item.map((field) => {
            return false;
          });
        })
      );
    }
    setDataConfigAdvanceEdit({
      rows: dataRow,
      columns: listColumn,
    });
  }, [dataRow]);

  const [isShowModalAddColumn, setIsShowModalAddColumn] = useState(false);
  const [isShowModalDecision, setIsShowModalDecision] = useState(false);
  const [editingColumn, setEditingColumn] = useState<any>(null);
  const [editingColumnIndex, setEditingColumnIndex] = useState<number>(-1);
  //Biến này dùng để kiểm tra xem các trường bắt buộc đã được điền đầy đủ chưa
  const [checkRequired, setCheckRequired] = useState<boolean>(false);
  const [checkRegex, setCheckRegex] = useState<boolean>(false);

  const optionRegex = {
    phoneRegex: PHONE_REGEX_NEW,
    emailRegex: EMAIL_REGEX,
  };

  const handChangeValueItem = (rowIndex, fieldIndex, value, type, childIndex: any = "undefined") => {
    if (childIndex == "undefined") {
      if (type === "binding") {
        let check_required = false;
        const updatedData = dataRow.map((row, rIdx) => {
          if (rIdx === rowIndex) {
            let new_field: any = [];
            for (let fIdx = 0; fIdx < row.length; fIdx++) {
              const element = row[fIdx];
              if (fIdx === fieldIndex) {
                if (element.required && !value.value) {
                  check_required = true;
                }
                new_field.push({
                  ...element,
                  value: value.value,
                });
              } else {
                new_field.push(element);
              }
            }
            new_field = new_field.map((field) => {
              if (typeof value[field.key] != "undefined") {
                if (value?.options_value?.length && field.key.includes("NguoiLienHe_")) {
                  return {
                    ...field,
                    value: value?.options_value ? value?.options_value.find((el) => el.isDefault)?.value : "",
                    options: value?.options_value,
                  };
                } else {
                  return {
                    ...field,
                    value: value[field.key],
                  };
                }
              } else {
                if (field.key.includes("_NguoiLienHe")) {
                  const firstKey = Object.keys(value).find((key) => key.includes("NguoiLienHe_"));
                  if (firstKey) {
                    let listContact = JSON.parse(value[firstKey]);
                    if (listContact.length) {
                      let defaultContact = listContact.find((el) => el.isDefault);
                      let valueKey =
                        field.key == "SoDienThoai_NguoiLienHe"
                          ? defaultContact?.phone
                          : field.key == "Email_NguoiLienHe"
                          ? defaultContact?.email
                          : field.key == "ChucVu_NguoiLienHe"
                          ? defaultContact?.position
                          : "";
                      return {
                        ...field,
                        value: valueKey,
                      };
                    } else {
                      return field;
                    }
                  } else {
                    return field;
                  }
                } else {
                  return field;
                }
              }
            });
            return new_field;
          }
          if (row.type == "title") {
            return row;
          }
          return row.map((field) => ({ ...field }));
        });
        setCheckRequired(check_required);
        setDataRow(updatedData);
      } else {
        const valueData =
          type == "checkbox"
            ? value.target.checked
            : type == "select"
            ? value.value
            : type == "compare"
            ? value.value
            : type == "lookup"
            ? value.value
            : type == "number"
            ? value.floatValue
            : type == "date"
            ? value
            : value.target.value;
        let check_required = false;
        let listMapKeyValue = [];
        const updatedData = dataRow.map((row, rIdx) => {
          const mapKeyValue = {};
          if (rIdx === rowIndex) {
            let rowMapReturn = row.map((field, fIdx) => {
              mapKeyValue[field.key] = fIdx === fieldIndex ? valueData : field.value;
              if (field?.required && !valueData) {
                check_required = true;
              }
              if (fIdx === fieldIndex) {
                return {
                  ...field,
                  ...(type == "compare"
                    ? {
                        compare: valueData,
                      }
                    : {
                        value: valueData,
                      }),

                  isRegexFalse: valueData && field?.regex && !valueData.match(optionRegex[field.regex]) ? true : false,
                };
              } else {
                if (field?.required && !field.value) {
                  check_required = true;
                }
                if (field.regex) {
                  return {
                    ...field,
                    isRegexFalse: field.value && field?.regex && !field.value.match(optionRegex[field.regex]) ? true : false,
                  };
                }
              }
              return field;
            });
            listMapKeyValue.push(mapKeyValue);
            return rowMapReturn;
          } else {
            if (row.type == "title") {
              return row;
            }
            let rowMapReturn = row.map((field) => {
              mapKeyValue[field.key] = field.value;
              if (rIdx != 0) {
                if (field?.required && !field.value) {
                  check_required = true;
                }
                if (field.regex) {
                  return {
                    ...field,
                    isRegexFalse: field.value && field?.regex && !field.value.match(optionRegex[field.regex]) ? true : false,
                  };
                }
              }
              return field;
            });
            listMapKeyValue.push(mapKeyValue);
            return rowMapReturn;
          }
        });
        //Tính toán giá trị cho các trường formula hoặc time_range
        const updatedDataNew = updatedData.map((row, rIdx) => {
          if (row.type == "title") {
            return row;
          }
          return row.map((field, fIdx) => {
            if (field.type == "formula" && field?.formula) {
              // Phân tích biểu thức thành một hàm
              const formula = parser.parse(JSON.parse(field.formula)?.formula);
              const result = formula(listMapKeyValue[rIdx]);
              return {
                ...field,
                value: result,
              };
            } else if (field.type == "time_range" && field?.timeRange) {
              let timeRange = JSON.parse(field.timeRange);
              const startDate = moment(new Date(listMapKeyValue[rIdx][timeRange.startDate]), "MM/DD/YYYY");
              const endDate = moment(new Date(listMapKeyValue[rIdx][timeRange.endDate]), "MM/DD/YYYY");

              let count = 0;
              let currentDate = startDate.clone();

              while (currentDate.isSameOrBefore(endDate)) {
                const dayOfWeek = currentDate.day();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                  // 0 là Chủ nhật, 6 là Thứ 7
                  count++;
                }
                currentDate.add(1, "days");
              }
              return {
                ...field,
                value: count + " ngày",
              };
            }
            return field;
          });
        });
        setCheckRequired(check_required);
        setDataRow(updatedDataNew);
      }
    } else {
      const valueData =
        type == "checkbox"
          ? value.target.checked
          : type == "select"
          ? value.value
          : type == "lookup"
          ? value.value
          : type == "number"
          ? value.floatValue
          : type == "date"
          ? value
          : value.target.value;
      let check_required = false;
      const updatedData = dataRow.map((row, rIdx) => {
        if (rIdx === rowIndex) {
          let rowMapReturn = row.map((field, fIdx) => {
            if (fIdx === fieldIndex) {
              let childNew = field.children.map((child, index) => {
                if (index == childIndex) {
                  if (child?.required && !valueData) {
                    check_required = true;
                  }
                  return {
                    ...child,
                    value: valueData,
                  };
                } else {
                  if (child?.required && !child.value) {
                    check_required = true;
                  }
                  if (child.regex) {
                    return {
                      ...child,
                    };
                  }
                }
                return child;
              });
              return {
                ...field,
                children: childNew,
              };
            }
            return field;
          });
          return rowMapReturn;
        }
        return row.map((field) => ({ ...field }));
      });
      setCheckRequired(check_required);
      setDataRow(updatedData);
    }
  };

  const hanhdleDeleteColumn = (columnIndex) => {
    // Xoá cột trong listColumn
    let newListColumn = listColumn.filter((item, index) => index != columnIndex);
    setListColumn(newListColumn);
  };

  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog | null>(null);

  const showDialogConfirm = (columnIndex) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Xoá cột`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn xoá cột? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        hanhdleDeleteColumn(columnIndex);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };
  const showDialogConfirmDeleteRow = (dataRow, rowIndex) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Xoá hàng`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn xoá hàng? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleDeleteRow(dataRow, rowIndex);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleDeleteRow = (dataRow, rowIndex) => {
    let _dataRow = [...dataRow];
    _dataRow.splice(rowIndex, 1);
    setDataRow(_dataRow);
  };

  const handleActionRow = (detailAction) => {
    switch (detailAction.action) {
      case "insert":
        let _baseRow = baseRow.map((field) => {
          return {
            ...field,
            value: "",
          };
        });
        if (detailAction?.rowIndex !== undefined) {
          let _dataRow = [...dataRow];
          _dataRow.splice(detailAction?.position == "top" ? detailAction.rowIndex : detailAction.rowIndex + 1, 0, _baseRow);
          setDataRow(_dataRow);
        }
        break;
      case "insertTitle":
        let titleRow = {
          style: "title-" + detailAction?.stype,
          content: "",
          indexTitle: "",
          type: "title",
          isShowEdit: true,
        };
        if (detailAction?.rowIndex !== undefined) {
          let _dataRow = [...dataRow];
          _dataRow.splice(detailAction?.position == "top" ? detailAction.rowIndex : detailAction.rowIndex + 1, 0, titleRow);
          setDataRow(_dataRow);
        }
        break;
      case "delete":
        showDialogConfirmDeleteRow(dataRow, detailAction?.rowIndex);
        break;
    }
  };
  const [showEditListValueIn, setShowEditListValueIn] = useState(false);
  const [dataFieldEdit, setDataFieldEdit] = useState({
    rowIndex: 0,
    fieldIndex: 0,
    value: [],
  });
  const handleActionField = (detailAction) => {
    switch (detailAction.action) {
      case "insertSpecialValue":
        setDataRow(
          dataRow.map((row, rIdx) => {
            if (rIdx === detailAction.rowIndex) {
              let rowMapReturn = row.map((field, fIdx) => {
                if (fIdx === detailAction.fieldIndex) {
                  return {
                    ...field,
                    isSpecialValue: true,
                    isOtherwise: false,
                    value: "",
                  };
                }
                return field;
              });
              return rowMapReturn;
            }
            return row.map((field) => ({ ...field }));
          })
        );
        break;
      case "cancelSpecialValue":
        setDataRow(
          dataRow.map((row, rIdx) => {
            if (rIdx === detailAction.rowIndex) {
              let rowMapReturn = row.map((field, fIdx) => {
                if (fIdx === detailAction.fieldIndex) {
                  return {
                    ...field,
                    isSpecialValue: false,
                    isOtherwise: false,
                    value: "",
                    compare: "",
                  };
                }
                return field;
              });
              return rowMapReturn;
            }
            return row.map((field) => ({ ...field }));
          })
        );
        break;
      case "insertOtherValue":
        setDataRow(
          dataRow.map((row, rIdx) => {
            if (rIdx === detailAction.rowIndex) {
              let rowMapReturn = row.map((field, fIdx) => {
                if (fIdx === detailAction.fieldIndex) {
                  return {
                    ...field,
                    isOtherwise: true,
                    isSpecialValue: false,
                    value: "OTHERWISE",
                  };
                }
                return field;
              });
              return rowMapReturn;
            }
            return row.map((field) => ({ ...field }));
          })
        );
        break;
      case "cancelOtherValue":
        setDataRow(
          dataRow.map((row, rIdx) => {
            if (rIdx === detailAction.rowIndex) {
              let rowMapReturn = row.map((field, fIdx) => {
                if (fIdx === detailAction.fieldIndex) {
                  return {
                    ...field,
                    isOtherwise: false,
                    isSpecialValue: false,
                    value: "",
                  };
                }
                return field;
              });
              return rowMapReturn;
            }
            return row.map((field) => ({ ...field }));
          })
        );
        break;
      case "editListValueIn":
        setShowEditListValueIn(true);
        setDataFieldEdit({
          rowIndex: detailAction.rowIndex,
          fieldIndex: detailAction.fieldIndex,
          value: detailAction.value,
        });
        break;
      case "delete":
        // showDialogConfirmDeleteRow(dataRow, detailAction?.rowIndex);
        break;
    }
  };

  console.log("dataRow", dataRow);

  return (
    <div className="advance-rule ">
      <div className="action-field-add">
        {listColumn.length > 1 ? (
          <>
            <Button
              color="secondary"
              type="button"
              onClick={() => {
                setIsShowModalAddColumn(true);
              }}
            >
              <Icon name="PlusCircle" /> Thêm điều kiện
            </Button>
            <Button
              color="secondary"
              type="button"
              onClick={() => {
                setIsShowModalDecision(true);
              }}
            >
              <Icon name="PlusCircle" /> Thêm kết quả
            </Button>
          </>
        ) : null}
      </div>
      {listColumn.length > 1 ? (
        <div className="table-container">
          <table className="styled-table">
            <thead>
              {/* Hàng 1 của tiêu đề*/}
              <tr>
                {listColumn.map((column, columnIndex) => {
                  return (
                    <th
                      key={columnIndex}
                      rowSpan={column?.children && column?.children?.length > 0 ? 1 : 2}
                      colSpan={column?.children && column?.children?.length > 0 ? column.children.length : 1}
                      className={`column-${column.columnType}`}
                    >
                      {/* {column.name}  */}
                      <div key={columnIndex} className={`form-field__header`}>
                        {editColumn[columnIndex]?.isShowEdit ? (
                          <div className="edit-position">
                            <NummericInput
                              name={"edit-position-" + columnIndex}
                              value={editColumn[columnIndex]?.newPosition}
                              autoFocus={true}
                              onValueChange={(e) => {
                                let newEditColumn = editColumn.map((item, index) => {
                                  return index == columnIndex ? { ...item, newPosition: e.floatValue } : item;
                                });
                                setEditColumn(newEditColumn);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  // handleUpdateColumn(columnIndex);
                                }
                              }}
                              onBlur={() => {
                                setEditColumn(
                                  editColumn.map((item, index) =>
                                    index == columnIndex
                                      ? {
                                          ...item,
                                          isShowEdit: false,
                                        }
                                      : item
                                  )
                                );
                              }}
                              placeholder={`Nhập thứ tự hiển thị`}
                            />
                          </div>
                        ) : (
                          <>
                            <div className={`${column.key == "stt" ? "column-stt-name" : "column-name"}`}>{column?.name}</div>
                            {column.key == "stt" ? null : (
                              <>
                                <div
                                  title={"Sửa vị trí cột"}
                                  className={"edit-column"}
                                  // onClick={() => {
                                  //   setEditColumn(
                                  //     editColumn.map((item, index) =>
                                  //       index == columnIndex
                                  //         ? {
                                  //             ...item,
                                  //             isShowEdit: true,
                                  //           }
                                  //         : item
                                  //     )
                                  //   );
                                  // }}
                                >
                                  {/* Thứ tự hiển thị: {listColumn[columnIndex]?.position || 0} */}
                                  {column?.name}
                                </div>
                                <div
                                  title={"Chỉnh sửa cột"}
                                  className={"editor-column"}
                                  onClick={() => {
                                    setEditingColumn(column);
                                    setEditingColumnIndex(columnIndex);
                                    if (column.columnType === "condition") {
                                      setIsShowModalAddColumn(true);
                                    } else if (column.columnType === "decision") {
                                      setIsShowModalDecision(true);
                                    }
                                  }}
                                >
                                  <Icon name="Pencil" />
                                </div>
                                <div
                                  title={"Xoá cột"}
                                  className={"delete-column"}
                                  onClick={() => {
                                    showDialogConfirm(columnIndex);
                                  }}
                                >
                                  <Icon name="Trash" />
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
              {/* Hàng 2 của tiêu đề*/}
              <tr>
                {listColumn.map((column) => {
                  return (
                    <>
                      {column?.children && column?.children?.length > 0 ? (
                        <>
                          {column.children.map((child) => {
                            return (
                              <th
                                className={`column-${column.columnType}`}
                                key={column.key + "_" + child.key}
                                style={column.key == "stt" ? { width: "5rem" } : { minWidth: "20rem" }}
                              >
                                {child.name}
                              </th>
                            );
                          })}
                        </>
                      ) : null}
                    </>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {dataRow && dataRow?.length > 0 ? (
                <>
                  {dataRow.map((row, rowIndex) => {
                    return (
                      <>
                        {row?.length > 0 ? (
                          <tr>
                            <>
                              {row.map((field, fieldIndex) => {
                                if (field?.children && field?.children?.length > 0) {
                                  // Nếu có children thì hiển thị children
                                  return (
                                    <td key={fieldIndex} className={`column-body-${field.columnType}`} colSpan={field.children.length}>
                                      {field?.isOtherwise ? (
                                        <div className="component">
                                          <div className="italic-text">{field?.value}</div>
                                        </div>
                                      ) : (
                                        <>
                                          {field?.isSpecialValue ? (
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
                                              <NummericInput
                                                name={field.name}
                                                value={field.value}
                                                //   disabled={!true ? true : child.readOnly}
                                                thousandSeparator={true}
                                                allowNegative={true}
                                                onValueChange={(e) => {
                                                  handChangeValueItem(rowIndex, fieldIndex, e, "number");
                                                }}
                                                placeholder={`Nhập ${field?.name}`}
                                                isDecimalScale={false}
                                              />
                                            </div>
                                          ) : (
                                            <div
                                              className={`${"td-multil-child"}`}
                                              // style={{ '--columns': field.children.length } as React.CSSProperties}
                                            >
                                              {field.children.map((child, index) => {
                                                return (
                                                  <div key={index} className="field-child">
                                                    <div className="component">
                                                      {child.type === "number" ? (
                                                        <NummericInput
                                                          name={child.name}
                                                          value={child.value}
                                                          //   disabled={!true ? true : child.readOnly}
                                                          thousandSeparator={true}
                                                          allowNegative={true}
                                                          onValueChange={(e) => {
                                                            handChangeValueItem(rowIndex, fieldIndex, e, "number", index);
                                                          }}
                                                          placeholder={`Nhập ${child?.name}`}
                                                          isDecimalScale={false}
                                                        />
                                                      ) : child.type === "checkbox" ? (
                                                        <Checkbox
                                                          checked={child.value}
                                                          //   disabled={!true ? true : field.readOnly}
                                                          onChange={(e) => {
                                                            handChangeValueItem(rowIndex, fieldIndex, e, "checkbox", index);
                                                          }}
                                                        />
                                                      ) : child.type === "date" ? (
                                                        <DatePickerCustom
                                                          name={child.name}
                                                          fill={false}
                                                          value={child.value ? moment(child.value).format("DD/MM/YYYY") : ""}
                                                          iconPosition="left"
                                                          //   disabled={!true ? true : field.readOnly}
                                                          // icon={<Icon name="Calendar" />}
                                                          onChange={(e) => {
                                                            handChangeValueItem(rowIndex, fieldIndex, e, field.type, index);
                                                          }}
                                                          placeholder={`Chọn ${child?.name}`}
                                                        />
                                                      ) : child.type === "formula" ? (
                                                        <NummericInput
                                                          name={child.name}
                                                          value={child.value}
                                                          //   disabled={true}
                                                          thousandSeparator={true}
                                                          allowNegative={true}
                                                          placeholder={`Nhập ${child?.name}`}
                                                          isDecimalScale={false}
                                                        />
                                                      ) : child.type === "time_range" ? (
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
                                                      ) : child.type === "lookup" || child.type === "binding" ? (
                                                        <div
                                                          onDoubleClick={() => {
                                                            // handleShowDetail(rowIndex, fieldIndex);
                                                          }}
                                                          style={{ cursor: "pointer" }}
                                                        >
                                                          <SelectLookup
                                                            name={child.name}
                                                            lookup={child.lookup}
                                                            bindingField={child.listBindingField}
                                                            bindingKey={child.key}
                                                            dataRow={dataRow}
                                                            listColumn={listColumn}
                                                            // disabled={!true ? true : field.readOnly}
                                                            setListColumn={setListColumn}
                                                            // setListLoadBindingField={setListLoadBindingField}
                                                            // listLoadBindingField={listLoadBindingField}
                                                            columnIndex={fieldIndex}
                                                            rowIndex={rowIndex}
                                                            value={child.value}
                                                            onChange={(e) => {
                                                              handChangeValueItem(rowIndex, fieldIndex, e, field.type, index);
                                                            }}
                                                            placeholder={`Chọn ${child?.name}`}
                                                          />
                                                        </div>
                                                      ) : child.type === "select" ? (
                                                        <SelectCustom
                                                          name={child.name}
                                                          //   disabled={!true ? true : field.readOnly}
                                                          options={child.options || []}
                                                          value={child.value}
                                                          onChange={(e) => {
                                                            handChangeValueItem(rowIndex, fieldIndex, e, "select", index);
                                                          }}
                                                          placeholder={`Chọn ${child?.name}`}
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
                                                      )}
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </>
                                      )}
                                      {field.key != "stt" && field.columnType == "condition" ? (
                                        <div
                                          className={`icon--pen`}
                                          onClick={() => {
                                            setShowPopoverStatusField(
                                              showPopoverStatusField.map((item, index) => {
                                                return item.map((field, fieldItemIndex) => {
                                                  return index == rowIndex && fieldItemIndex == fieldIndex ? !field : false;
                                                });
                                              })
                                            );
                                          }}
                                        >
                                          <Icon name="Pencil" />
                                        </div>
                                      ) : null}
                                      {showPopoverStatusField[rowIndex] && showPopoverStatusField[rowIndex][fieldIndex] ? (
                                        <Popover
                                          direction={"bottom"}
                                          alignment={"left"}
                                          isTriangle={true}
                                          className="popover-note"
                                          refContainer={null}
                                          refPopover={refField}
                                          forNote={true}
                                        >
                                          <ActionField
                                            onShow={true}
                                            rowIndex={rowIndex}
                                            fieldIndex={fieldIndex}
                                            field={field}
                                            callBack={(detailAction) => handleActionField(detailAction)}
                                          ></ActionField>
                                        </Popover>
                                      ) : null}
                                    </td>
                                  );
                                } else {
                                  // Nếu không có children thì hiển thị value
                                  return (
                                    <td key={fieldIndex} className={`column-body-${field.columnType}`}>
                                      {field.key === "stt" ? (
                                        <div className="component-stt">
                                          <div className={`index--number`}>{rowIndex + 1}</div>
                                          <div
                                            className={`icon--gear`}
                                            onClick={() => {
                                              setShowPopoverStatus(
                                                showPopoverStatus.map((item, index) => {
                                                  return index == rowIndex ? !item : false;
                                                })
                                              );
                                            }}
                                          >
                                            <Icon name="Settings" />
                                          </div>
                                          {showPopoverStatus[rowIndex] ? (
                                            <Popover
                                              direction={"bottom"}
                                              alignment={"left"}
                                              isTriangle={true}
                                              className="popover-note"
                                              refContainer={null}
                                              refPopover={refColumn}
                                              forNote={true}
                                            >
                                              <ActionRow
                                                onShow={true}
                                                rowIndex={rowIndex}
                                                callBack={(detailAction) => handleActionRow(detailAction)}
                                              ></ActionRow>
                                            </Popover>
                                          ) : null}
                                        </div>
                                      ) : (
                                        <div className="component">
                                          {field?.isOtherwise ? (
                                            <div className="italic-text">{field?.value}</div>
                                          ) : (
                                            <>
                                              {field?.compareType == "in" && field.columnType == "condition" ? (
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
                                                              });
                                                            }}
                                                          >
                                                            {item}
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
                                                            });
                                                          }}
                                                        >
                                                          +
                                                        </div>
                                                      </Tippy>
                                                    )}
                                                  </div>
                                                </div>
                                              ) : (
                                                <>
                                                  {field.columnType == "condition" ? (
                                                    <SelectCustom
                                                      name={field.name}
                                                      fill={true}
                                                      //   disabled={!true ? true : field.readOnly}
                                                      options={[
                                                        { label: "=", value: "=" },
                                                        { label: "!=", value: "!=" },
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
                                                      allowNegative={true}
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
                                                      allowNegative={true}
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
                                                  ) : field.type === "lookup" || field.type === "binding" ? (
                                                    <div
                                                      onDoubleClick={() => {
                                                        // handleShowDetail(rowIndex, fieldIndex);
                                                      }}
                                                      style={{ cursor: "pointer" }}
                                                    >
                                                      <SelectLookup
                                                        name={field.name}
                                                        lookup={field.lookup}
                                                        bindingField={field.listBindingField}
                                                        bindingKey={field.key}
                                                        dataRow={dataRow}
                                                        listColumn={listColumn}
                                                        // disabled={!true ? true : field.readOnly}
                                                        setListColumn={setListColumn}
                                                        // setListLoadBindingField={setListLoadBindingField}
                                                        // listLoadBindingField={listLoadBindingField}
                                                        columnIndex={fieldIndex}
                                                        rowIndex={rowIndex}
                                                        value={field.value}
                                                        onChange={(e) => {
                                                          handChangeValueItem(rowIndex, fieldIndex, e, field.type);
                                                        }}
                                                        placeholder={`Chọn ${field?.name}`}
                                                      />
                                                    </div>
                                                  ) : field.type === "select" ? (
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
                                      )}
                                      {field.key != "stt" && field.columnType == "condition" ? (
                                        <div
                                          className={`icon--pen`}
                                          onClick={() => {
                                            setShowPopoverStatusField(
                                              showPopoverStatusField.map((item, index) => {
                                                return item.map((field, fieldItemIndex) => {
                                                  return index == rowIndex && fieldItemIndex == fieldIndex ? !field : false;
                                                });
                                              })
                                            );
                                          }}
                                        >
                                          <Icon name="Pencil" />
                                        </div>
                                      ) : null}
                                      {showPopoverStatusField[rowIndex] && showPopoverStatusField[rowIndex][fieldIndex] ? (
                                        <Popover
                                          direction={"bottom"}
                                          alignment={"left"}
                                          isTriangle={true}
                                          className="popover-note"
                                          refContainer={null}
                                          refPopover={refField}
                                          forNote={true}
                                        >
                                          <ActionField
                                            onShow={true}
                                            rowIndex={rowIndex}
                                            fieldIndex={fieldIndex}
                                            field={field}
                                            callBack={(detailAction) => handleActionField(detailAction)}
                                          ></ActionField>
                                        </Popover>
                                      ) : null}
                                    </td>
                                  );
                                }
                              })}
                            </>
                          </tr>
                        ) : null}
                      </>
                    );
                  })}
                </>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <span>Không có dữ liệu bảng quyết định, Hãy thêm mới cột điều kiện đầu tiên nhé!</span>
          <Button
            color="secondary"
            type="button"
            onClick={() => {
              setIsShowModalAddColumn(true);
            }}
          >
            <Icon name="PlusCircle" /> Thêm điều kiện
          </Button>
        </div>
      )}
      <div className="action-field-add">
        {listColumn.length > 1 ? (
          <Button
            color="secondary"
            type="button"
            onClick={() => {
              setDataRow([...dataRow, baseRow]);
            }}
          >
            <Icon name="PlusCircle" /> Thêm hàng
          </Button>
        ) : null}
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalAddColumn
        onShow={isShowModalAddColumn}
        listKeyColumn={listKeyColumn}
        setListColumn={setListColumn}
        dataNode={dataNode}
        processId={childProcessId || processId}
        dataColumn={editingColumn}
        columnIndex={editingColumnIndex}
        onHide={(reload) => {
          if (reload) {
          }
          setIsShowModalAddColumn(false);
          setEditingColumn(null);
          setEditingColumnIndex(-1);
        }}
      />
      <ModalEditValueIn
        onShow={showEditListValueIn}
        dataFieldEdit={dataFieldEdit}
        setDataRow={setDataRow}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setShowEditListValueIn(false);
          setDataFieldEdit({
            rowIndex: 0,
            fieldIndex: 0,
            value: [],
          });
        }}
      />
      <ModalAddDecision
        onShow={isShowModalDecision}
        setListColumn={setListColumn}
        listKeyColumn={listKeyColumn}
        dataColumn={editingColumn}
        columnIndex={editingColumnIndex}
        onHide={(reload) => {
          if (reload) {
          }
          setIsShowModalDecision(false);
          setEditingColumn(null);
          setEditingColumnIndex(-1);
        }}
      />
    </div>
  );
}
