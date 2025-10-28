import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import Popover from "components/popover/popover";
import React, { Fragment, memo, useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "utils/hookCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ActionColumn from "../ActionColumnDecisionTable";

interface TableHeaderAdvanceProps {
  listColumn: any[];
  setListColumn: (columns: any[]) => void;
  setIsShowModalAddColumn: (isShow: boolean) => void;
  setIndexColumnEdit: (index: number) => void;
  setIsShowModalDecision: (isShow: boolean) => void;
}

const TableHeaderAdvance: React.FC<TableHeaderAdvanceProps> = ({
  listColumn,
  setListColumn,
  setIsShowModalAddColumn,
  setIndexColumnEdit,
  setIsShowModalDecision,
}) => {
  const refColumn = useRef();
  const [editColumn, setEditColumn] = useState([]);
  const [showPopoverEditColumn, setShowPopoverEditColumn] = useState<any[]>([]);
  useOnClickOutside(refColumn, () => setShowPopoverEditColumn(showPopoverEditColumn.map((item) => false)), ["index"]);
  useEffect(() => {
    setEditColumn(
      listColumn.map((item) => {
        return {
          newPosition: item.position,
          isShowEdit: false,
        };
      })
    );
    setShowPopoverEditColumn(
      listColumn.map((item) => {
        return false;
      })
    );
    // setListKeyColumn(
    //   listColumn.map((item) => {
    //     return item.key;
    //   })
    // );
    // const newBaseRow = genNewBaseRow(listColumn);
    // setBaseRow(newBaseRow);

    // const newDataRow = genNewDataRow(dataRow, newBaseRow);
    // if (!isDataFetch) {
    //   // Những lần thay đổi columns sau
    //   setDataRow(newDataRow);
    // } else {
    //   //Lần đầu dataRow = dataConfigAdvance.rows (fetch từ api)
    //   if (dataConfigAdvance?.rows?.length > 0) {
    //     setDataRow(dataConfigAdvance?.rows);
    //   }
    //   setIsDataFetch(false);
    // }
  }, [listColumn]);

  const handleActionColumn = (detailAction, columnIndex) => {
    switch (detailAction.action) {
      case "editColumn":
        setIndexColumnEdit(columnIndex);
        if (detailAction.column.columnType == "condition") {
          setIsShowModalAddColumn(true);
        } else if (detailAction.column.columnType == "decision") {
          setIsShowModalDecision(true);
        }
        break;
      case "delete":
        showDialogConfirm(columnIndex);
        break;
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

  return (
    <thead>
      {/* Hàng 1 của tiêu đề*/}
      <tr key={"parent-row"}>
        {listColumn.map((column, columnIndex) => {
          return (
            <th
              key={column.key}
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
                          className={"edit-position-column"}
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
                        {/* <div
                        title={"Xoá cột"}
                        className={"delete-column"}
                        onClick={() => {
                          showDialogConfirm(columnIndex);
                        }}
                      >
                        <Icon name="Trash" />
                      </div> */}
                        <div
                          title={"Sửa cột"}
                          className={"edit-column"}
                          onClick={() => {
                            setShowPopoverEditColumn(showPopoverEditColumn.map((ell, indexll) => (indexll == columnIndex ? !ell : ell)));
                          }}
                        >
                          <Icon name="Pencil" />
                        </div>
                        {showPopoverEditColumn[columnIndex] ? (
                          <Popover
                            direction={"bottom"}
                            alignment={"left"}
                            isTriangle={true}
                            className="popover-note"
                            refContainer={null}
                            refPopover={refColumn}
                            forNote={true}
                          >
                            <ActionColumn
                              onShow={true}
                              columnIndex={columnIndex}
                              column={column}
                              callBack={(detailAction) => handleActionColumn(detailAction, columnIndex)}
                            ></ActionColumn>
                          </Popover>
                        ) : null}
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
      <tr key="child-row">
        {listColumn.map((column) =>
          column?.children && column?.children.length > 0
            ? column.children.map((child) => (
                <th
                  className={`column-${column.columnType}`}
                  key={column.key + "_" + child.key}
                  style={column.key == "stt" ? { width: "5rem" } : column.columnType == "decision" ? { minWidth: "10rem" } : { minWidth: "20rem" }}
                >
                  {child.name}
                </th>
              ))
            : null
        )}
      </tr>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </thead>
  );
};

export default memo(TableHeaderAdvance);
