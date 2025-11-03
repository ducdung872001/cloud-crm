import React, { useCallback, useEffect, useRef, useState } from "react";
import { headerHsmt } from "./GridConfigHsmt";
import "./index.scss";
import Icon from "components/icon";
import { useOnClickOutside } from "utils/hookCustom";
import Button from "components/button/button";
import ModalAddColumn from "./partial/ModalAddColumn";
import ModalAddDecision from "./partial/ModalAddDecision";
import { PHONE_REGEX, EMAIL_REGEX, PHONE_REGEX_NEW } from "utils/constant";
import { Parser } from "formula-functionizer";
import TableHeaderAdvanceOla from "./partial/TableHeaderAdvanceOla";
import TableBodyAdvanceOla from "./partial/TableBodyAdvanceOla";
import { v4 as uuidv4 } from "uuid";
import { fetchDataLookup } from "./Lookup";
import ModalImport from "./partial/ModalImport";
import { exportOlaExcel } from "./exportOla";
import { convertToDataRow } from "./convertToDataRow";

export default function TableOlaRule({ processId, childProcessId, dataConfigAdvance, setDataConfigAdvanceEdit, setHaveError }) {
  const [dataRow, setDataRow] = useState([]);
  const parser = new Parser();

  const refColumn = useRef();
  const [editColumn, setEditColumn] = useState([]);
  const [listColumn, setListColumn] = useState<any[]>(headerHsmt);

  const [listKeyColumn, setListKeyColumn] = useState<any[]>([]); // Danh sách các key của cột trong bảng
  const [listNameColumn, setListNameColumn] = useState<any[]>([]); // Danh sách các name của cột trong bảng
  const [baseRow, setBaseRow] = useState<any[]>([]);
  const [showPopoverEditColumn, setShowPopoverEditColumn] = useState<any[]>([]);

  const [showModalImport, setShowModalImport] = useState<boolean>(false);
  const [caclData, setCaclData] = useState<any>(false);
  const [dataExcel, setDataExcel] = useState<any>(null);
  const [lineSuccess, setLineSuccess] = useState<any>(0);
  const [dataImport, setDataImport] = useState<any>(null);
  const [dataImportHeader, setDataImportHeader] = useState<any>(null);

  useOnClickOutside(refColumn, () => setShowPopoverEditColumn(showPopoverEditColumn.map((item) => false)), ["index"]);

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
    setShowPopoverEditColumn(
      listColumn.map((item) => {
        return false;
      })
    );
    setListKeyColumn(
      listColumn.map((item) => {
        return item.key;
      })
    );
    setListNameColumn(
      listColumn.map((item) => {
        return item.name;
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
        setLookupLoading(true);
        fetchDataLookup(dataConfigAdvance?.rows)
          .then((result) => setLookupValues(result))
          .catch((err) => setLookupError(err))
          .finally(() => setLookupLoading(false));
      }
      setIsDataFetch(false);
    }
  }, [listColumn, isDataFetch]);

  const [lookupValues, setLookupValues] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

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
          value: item.type == "checkbox" ? false : "",
        });
      }
    });
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
          if (fieldBase) {
            let newField = {
              ...fieldBase,
              name: field.name, // Cho trường hợp đổi tên cột
              value: fieldBase.value,
              children:
                fieldBase?.children && fieldBase?.children?.length > 0
                  ? fieldBase.children.map((child) => {
                      return {
                        ...child,
                        value: child?.value || "",
                      };
                    })
                  : [],
            };
            newRow.push(newField);
          } else {
            let newField = {
              ...field,
              name: field.name, // Cho trường hợp đổi tên cột
              value: field.value,
              children:
                field?.children && field?.children?.length > 0
                  ? field.children.map((child) => {
                      return {
                        ...child,
                        value: child?.value || "",
                      };
                    })
                  : [],
            };
            newRow.push(newField);
          }
        }
        newDataRow.push(newRow);
      }
    }
    return newDataRow;
  };

  const [isShowModalAddColumn, setIsShowModalAddColumn] = useState(false);
  const [isShowModalDecision, setIsShowModalDecision] = useState(false);
  //Biến này dùng để kiểm tra xem các trường bắt buộc đã được điền đầy đủ chưa
  // const [checkRequired, setCheckRequired] = useState<boolean>(false);
  const [checkRegex, setCheckRegex] = useState<boolean>(false);

  const optionRegex = {
    phoneRegex: PHONE_REGEX_NEW,
    emailRegex: EMAIL_REGEX,
  };

  const handChangeValueItem = useCallback((rowIndex, fieldIndex, value, type, childIndex = undefined) => {
    // Lấy giá trị value đúng với type
    let valueData;
    switch (type) {
      case "checkbox":
        valueData = value.target.checked;
        break;
      case "select":
      case "compare":
      case "lookup":
        valueData = value.value;
        break;
      case "select_multi":
        valueData = value.map((item) => item.value);
        break;
      case "number":
        valueData = value.floatValue;
        break;
      case "date":
        valueData = value;
        break;
      case "value_in":
        valueData = value;
        break;
      default:
        valueData = value.target ? value.target.value : value;
    }

    setDataRow((prevDataRow) => {
      // Nếu update field con (child)
      if (typeof childIndex !== "undefined") {
        return prevDataRow.map((row, rIdx) => {
          if (rIdx !== rowIndex) return row;
          return row.map((field, fIdx) => {
            if (fIdx !== fieldIndex) return field;
            // Chỉ clone đúng child cần update
            const newChildren = field.children.map((child, idx) => (idx === childIndex ? { ...child, value: valueData } : child));
            return { ...field, children: newChildren };
          });
        });
      }

      // Nếu update field cha (không phải child)
      return prevDataRow.map((row, rIdx) => {
        if (rIdx !== rowIndex) return row;
        return row.map((field, fIdx) => {
          if (fIdx !== fieldIndex) return field;
          if (type === "compare") {
            return { ...field, compare: valueData };
          }
          return { ...field, value: valueData };
        });
      });
    });
  }, []);

  const [indexColumnEdit, setIndexColumnEdit] = useState(0);

  useEffect(() => {
    setDataConfigAdvanceEdit((prev) => ({
      ...prev,
      rows: dataRow,
      columns: listColumn,
    }));
  }, [dataRow, listColumn]);

  console.log("dataRow", dataRow);
  console.log("listColumn", listColumn);

  return (
    <div className="table-ola-rule">
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
            {/* <Button
              color="secondary"
              type="button"
              onClick={() => {
                setIsShowModalDecision(true);
              }}
            >
              <Icon name="PlusCircle" /> Thêm kết quả
            </Button> */}
            <Button
              color="secondary"
              type="button"
              className="button--left"
              onClick={() => {
                exportOlaExcel(listColumn, convertToDataRow(dataRow));
              }}
            >
              <Icon name="Upload" /> Xuất dữ liệu Excel
            </Button>
            <Button
              color="secondary"
              type="button"
              className="button--right"
              onClick={() => {
                setShowModalImport(true);
              }}
            >
              <Icon name="Download" /> Nhập dữ liệu Excel
            </Button>
          </>
        ) : null}
      </div>
      {listColumn.length > 1 ? (
        <div className="table-container">
          <table className="styled-table">
            <TableHeaderAdvanceOla
              listColumn={listColumn}
              setListColumn={setListColumn}
              setIsShowModalAddColumn={setIsShowModalAddColumn}
              setIsShowModalDecision={setIsShowModalDecision}
              setIndexColumnEdit={setIndexColumnEdit}
            />
            <TableBodyAdvanceOla
              dataRow={dataRow}
              setDataRow={setDataRow}
              handChangeValueItem={handChangeValueItem}
              baseRow={baseRow}
              lookupValues={lookupValues}
              loading={lookupLoading}
              // lookupValues={null}
              // loading={null}
              setHaveError={setHaveError}
            />
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
              let uuid = uuidv4();
              setDataRow((prevDataRow) => [
                ...prevDataRow,
                baseRow.map((item) => {
                  if (item.key === "stt") {
                    return {
                      ...item,
                      rowKey: uuid,
                    };
                  } else {
                    return item;
                  }
                }),
              ]);
            }}
          >
            <Icon name="PlusCircle" /> Thêm hàng
          </Button>
        ) : null}
      </div>
      <ModalAddColumn
        onShow={isShowModalAddColumn}
        indexColumn={indexColumnEdit}
        listColumn={listColumn}
        listKeyColumn={listKeyColumn}
        listNameColumn={listNameColumn}
        setListColumn={setListColumn}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
          }
          setIndexColumnEdit(0);
          setIsShowModalAddColumn(false);
        }}
      />
      <ModalAddDecision
        onShow={isShowModalDecision}
        processId={childProcessId || processId}
        indexColumn={indexColumnEdit}
        listColumn={listColumn}
        setListColumn={setListColumn}
        listKeyColumn={listKeyColumn}
        onHide={(reload) => {
          if (reload) {
          }
          setIndexColumnEdit(0);
          setIsShowModalDecision(false);
        }}
      />
      <ModalImport
        name={"Dữ liệu mẫu"}
        listColumn={listColumn}
        baseRow={baseRow}
        onShow={showModalImport}
        caclData={caclData}
        setDataRow={setDataRow}
        setLookupValues={setLookupValues}
        setLookupError={setLookupError}
        setLookupLoading={setLookupLoading}
        lineSuccess={lineSuccess}
        setDataImport={setDataImport}
        setDataImportHeader={setDataImportHeader}
        setDataExcel={setDataExcel}
        onHide={(reload) => {
          if (reload) {
            // getListCustomer(params, activeTitleHeader);
          }
          setShowModalImport(false);
        }}
        type="grid"
      />
    </div>
  );
}
