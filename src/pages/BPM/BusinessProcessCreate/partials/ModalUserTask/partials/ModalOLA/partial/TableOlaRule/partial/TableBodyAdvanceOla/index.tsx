import React, { Fragment, memo, useEffect, useRef, useState } from "react";
import SpecialInput from "../SpecialInput";
import RangeValueInput from "../RangeValueInput";
import OlaSlaInput from "../OlaSlaInput";
import Icon from "components/icon";
import Popover from "components/popover/popover";
import ActionField from "../../../ActionField";
import ActionRow from "../../../ActionRowPopup/ActionRow";
import ComponentInput from "../ComponentInput";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useOnClickOutside } from "utils/hookCustom";
import { DataRows } from "../../type";
import { set } from "lodash";

interface TableBodyAdvanceOlaProps {
  dataRow: DataRows;
  setDataRow: any;
  handChangeValueItem: (rowIndex: number, fieldIndex: number, value: any, type: string) => void;
  baseRow: any[]; // Assuming baseRow is passed as a prop, you might need to adjust this based on your actual implementation
  lookupValues: any;
  loading: boolean;
  setHaveError?: any;
}

const TableBodyAdvanceOla: React.FC<TableBodyAdvanceOlaProps> = ({
  dataRow,
  setDataRow,
  handChangeValueItem,
  baseRow,
  lookupValues,
  loading,
  setHaveError,
}) => {
  const refRow = useRef();
  const refField = useRef();
  const [refs, setRefs] = useState([]);
  const [height, setHeight] = useState([]);
  const [showPopoverStatus, setShowPopoverStatus] = useState<boolean[]>([]);
  const [showPopoverStatusField, setShowPopoverStatusField] = useState<any[]>([]);

  useOnClickOutside(refRow, () => setShowPopoverStatus(showPopoverStatus.map((item) => false)), ["index"]);
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
  }, [dataRow]);

  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog | null>(null);

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
        handleDeleteRow(rowIndex);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleDeleteRow = (rowIndex) => {
    setDataRow((prevDataRow) => {
      let _dataRow = [...prevDataRow];
      _dataRow.splice(rowIndex, 1);
      return _dataRow;
    });
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
          setDataRow((prevDataRow) => {
            let _dataRow = [...prevDataRow];
            _dataRow.splice(detailAction?.position == "top" ? detailAction.rowIndex : detailAction.rowIndex + 1, 0, _baseRow);
            return _dataRow;
          });
        }
        break;
      case "insertTitle":
        // let titleRow = {
        //   style: "title-" + detailAction?.stype,
        //   content: "",
        //   indexTitle: "",
        //   type: "title",
        //   isShowEdit: true,
        // };
        // if (detailAction?.rowIndex !== undefined) {
        //   let _dataRow = [...dataRow];
        //   _dataRow.splice(detailAction?.position == "top" ? detailAction.rowIndex : detailAction.rowIndex + 1, 0, titleRow);
        //   setDataRow(_dataRow);
        // }
        break;
      case "delete":
        showDialogConfirmDeleteRow(dataRow, detailAction?.rowIndex);
        break;
    }
  };

  const handleActionField = (detailAction) => {
    switch (detailAction.action) {
      case "insertSpecialValue":
        setDataRow((prevDataRow) =>
          prevDataRow.map((row, rIdx) => {
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
        setDataRow((prevDataRow) =>
          prevDataRow.map((row, rIdx) => {
            if (rIdx === detailAction.rowIndex) {
              return row.map((field, fIdx) => {
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
            }
            return row.map((field) => ({ ...field }));
          })
        );
        break;
      case "insertOtherValue":
        setDataRow((prevDataRow) =>
          prevDataRow.map((row, rIdx) => {
            if (rIdx === detailAction.rowIndex) {
              return row.map((field, fIdx) => {
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
            }
            return row.map((field) => ({ ...field }));
          })
        );
        break;
      case "cancelOtherValue":
        setDataRow((prevDataRow) =>
          prevDataRow.map((row, rIdx) => {
            if (rIdx === detailAction.rowIndex) {
              return row.map((field, fIdx) => {
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
            }
            return row.map((field) => ({ ...field }));
          })
        );
        break;
      case "editListValueIn":
        // setShowEditListValueIn(true);
        // setDataFieldEdit({
        //   rowIndex: detailAction.rowIndex,
        //   fieldIndex: detailAction.fieldIndex,
        //   value: detailAction.value,
        // });
        break;
      case "delete":
        // showDialogConfirmDeleteRow(dataRow, detailAction?.rowIndex);
        break;
    }
  };
  return (
    <tbody>
      {dataRow && dataRow?.length > 0 ? (
        <>
          {dataRow.map((row, rowIndex) => {
            const rowKey = row[0]?.rowKey || `row-${rowIndex}`;
            return row?.length > 0 ? (
              <tr key={rowKey}>
                {row.map((field, fieldIndex) => {
                  if (field?.children && field?.children?.length > 0) {
                    // Nếu có children thì hiển thị children
                    return (
                      <td key={field.key} className={`column-body-${field.columnType}`} colSpan={field.children.length}>
                        {field?.isOtherwise ? (
                          <div className="component">
                            <div className="italic-text">{field?.value}</div>
                          </div>
                        ) : (
                          <>
                            {field?.isSpecialValue ? (
                              <SpecialInput field={field} rowIndex={rowIndex} fieldIndex={fieldIndex} handChangeValueItem={handChangeValueItem} />
                            ) : (
                              <div
                                className={`${"td-multil-child"}`}
                                // style={{ '--columns': field.children.length } as React.CSSProperties}
                              >
                                {field?.columnType == "condition" ? (
                                  <RangeValueInput
                                    child={field.children}
                                    rowIndex={rowIndex}
                                    fieldIndex={fieldIndex}
                                    handChangeValueItem={handChangeValueItem}
                                    setHaveError={setHaveError}
                                  />
                                ) : (
                                  field.children.map((child, index) => {
                                    return (
                                      <div key={index} className="field-child">
                                        <div className="component">
                                          <OlaSlaInput
                                            child={child}
                                            rowIndex={rowIndex}
                                            fieldIndex={fieldIndex}
                                            index={index}
                                            handChangeValueItem={handChangeValueItem}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
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
                      <td key={field.key} className={`column-body-${field.columnType}`}>
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
                                refPopover={refRow}
                                forNote={true}
                              >
                                <ActionRow onShow={true} rowIndex={rowIndex} callBack={(detailAction) => handleActionRow(detailAction)}></ActionRow>
                              </Popover>
                            ) : null}
                          </div>
                        ) : (
                          <ComponentInput
                            field={field}
                            rowIndex={rowIndex}
                            fieldIndex={fieldIndex}
                            handChangeValueItem={handChangeValueItem}
                            setDataRow={setDataRow}
                            // listColumn={listColumn}
                            // setListColumn={setListColumn}
                            lookupValues={lookupValues}
                            loading={loading}
                          />
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
              </tr>
            ) : null;
          })}
        </>
      ) : null}
      <Dialog content={contentDialog} isOpen={showDialog} />
    </tbody>
  );
};

export default memo(TableBodyAdvanceOla);
