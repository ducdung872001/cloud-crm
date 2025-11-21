import React, { useMemo, useState, useRef, useEffect, Fragment } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { ColDef } from "ag-grid-community";
import { defaultNote, generateColumns, getDataConfig, getDataGrid, getListComment } from "./function/getDataGrid";
import "./GridAgTable.scss";
import FullWidthRenderer from "./partial/FullWidthRenderer";
import { sampleColumns, sampleData } from "./sampleData";
import { getSearchParameters } from "reborn-util";
import Button from "components/button/button";
import Icon from "components/icon";
import { v4 as uuidv4 } from "uuid";
import { showToast } from "utils/common";
import { useGridAg } from "./GridAgContext";
import ModalAddColumnAg from "./partial/ModalAddColumnAg";
import Loading from "components/loading";
import { saveDataGrid } from "./function/saveDataGrid";
import ModalImportGrid from "./partial/ModalImportGrid";
import { exportCustomExcel } from "./partial/ModalImportGrid/partials/exportExcel";
import ModalCommentAg from "./partial/ModalCommentAg";
import { filterData } from "./function/filterData";
import { IGridAgTable } from ".";

const GridAgTable = (
  props: IGridAgTable // location: "iframe" | "configViewer", setDataConfigGrid, dataConfig, onChange, configField
) => {
  const {
    typeNo,
    setTypeNo,
    setWidthNo,
    rowData,
    setRowData,
    columnsConfig,
    setColumnsConfig,
    isFetchData,
    setIsFetchData,
    isLoading,
    setIsLoading,
    colCodeEdit,
    setLookupValues,
    dataModalComment,
    setDataModalComment,
    setCheckComment,
    checkedMap,
    setCheckedMap,
  } = useGridAg();
  const gridRef = useRef<any>(null);
  const { location, setDataConfigGrid, dataConfig, onChange, configField, onAction } = props;
  console.log("configField", configField);
  console.log("dataConfig", dataConfig);
  const idGrid = configField?.fieldName || dataConfig?.fieldName || "";
  const COLUMN_WIDTH_STORAGE_KEY = "gridag_column_widths" + idGrid;
  const linkingConfig = configField?.linkingConfig ? JSON.parse(configField.linkingConfig) : null;
  console.log("linkingConfig", linkingConfig);
  console.log("linkingConfig>>idGrid", idGrid);
  const [linkingConfigDeparture, setLinkingConfigDeparture] = useState(null);
  useEffect(() => {
    if (linkingConfig && linkingConfig?.gridDeparture) {
      const handler = (event) => {
        // event là một CustomEvent, event.detail chứa data
        console.log("Grid >> ", linkingConfig?.gridDeparture, " đã bấm, nhận thông tin:", event.detail);
        // Ví dụ: sử dụng event.detail.message, event.detail.someValue, ...
        setLinkingConfigDeparture(event.detail);
      };
      window.addEventListener(linkingConfig?.gridDeparture + "-clicked", handler);
      return () => window.removeEventListener(linkingConfig?.gridDeparture + "-clicked", handler);
    }
  }, [idGrid, linkingConfig]);

  console.log("linkingConfigDeparture>>", idGrid, linkingConfigDeparture);

  useEffect(() => {
    //Bắt sự kiện từ grid khác gửi sang
    if (linkingConfigDeparture && linkingConfigDeparture?.params && linkingConfigDeparture?.idGrid == linkingConfig?.gridDeparture) {
      if (linkingConfigDeparture?.params) {
        if (linkingConfigDeparture?.params?.HoVaTen == "Hoàng Văn Lợi") {
          setDataFetch((prev) => ({ ...prev, data: [sampleData[0]] }));
        } else if (linkingConfigDeparture?.params?.HoVaTen == "Bùi Đức Năng") {
          console.log("setDataFetch Bùi Đức Năng");

          setDataFetch((prev) => ({ ...prev, data: [sampleData[1]] }));
        } else {
          setDataFetch((prev) => ({ ...prev, data: [sampleData[2]] }));
        }
      }
    }
  }, [linkingConfigDeparture]);

  const [loading, setLoading] = useState(false);
  const [dataFetch, setDataFetch] = useState(null);
  // const [columns, setColumns] = useState<ColDef[]>(sampleColumns);
  const [columns, setColumns] = useState<ColDef[]>([]);
  const columnsRef = useRef<ColDef[]>(columns);

  const [showModalAddColumn, setShowModalAddColumn] = useState<boolean>(false);
  const [dataColumnEdit, setDataColumnEdit] = useState<any>(null);
  const [isEditColumn, setIsEditColumn] = useState(false);
  const [isChangeColumns, setIsChangeColumns] = useState<boolean>(false);
  const [showModalImport, setShowModalImport] = useState<boolean>(false);

  const configFieldModal = {
    enableAddRow: "true",
    enableFilter: "true",
    enableAddColumns: "true",
    enableExport: "true",
    enableImport: "true",
    enableAddCmtCell: "true",
    enableAddCmtCol: "true",
    enableEditCell: "true",
    enableSave: "true",
    fieldName: "",
  };

  const params: any =
    location && location == "configViewer" ? configField : location && location == "configForm" ? configFieldModal : getSearchParameters();
  const enableAddRow = !params?.enableAddRow || params?.enableAddRow == "false" ? false : true;
  const enableFilter = !params?.enableFilter || params?.enableFilter == "false" ? false : true;
  const enableAddColumns = !params?.enableAddCol || params?.enableAddCol == "false" ? false : true;
  const enableExport = !params?.enableExport || params?.enableExport == "false" ? false : true;
  const enableImport = !params?.enableImport || params?.enableImport == "false" ? false : true;
  const enableAddCmtCell = !params?.enableAddCmtCell || params?.enableAddCmtCell == "false" ? false : true;
  const enableAddCmtCol = !params?.enableAddCmtCol || params?.enableAddCmtCol == "false" ? false : true;
  const enableEditCell = !params?.enableEditCell || params?.enableEditCell == "false" ? false : true;
  const enableSave = !params?.enableSave || params?.enableSave == "false" ? false : true;
  const fieldName = params?.fieldName || "";

  console.log("configField", configField);

  useEffect(() => {
    const fetchData = async () => {
      const config = await getDataGrid(actionRow, params); // gọi API lấy dữ liệu
      setDataFetch(config);
      setIsLoading(false);
    };
    if (location && location == "configViewer") {
      handleGetCheckComment();
    }
    if (isFetchData && location && location == "iframe") {
      fetchData();
      setIsFetchData(false);
    } else {
      setIsLoading(false);
      if (!(dataConfig && dataConfig?.headerTable && JSON.parse(dataConfig.headerTable))) {
        setDataFetch(getDataConfig(actionRow));
      }
    }
  }, [isFetchData, location, dataConfig]);

  useEffect(() => {
    let dataConfigHeader = dataConfig?.headerTable && JSON.parse(dataConfig.headerTable) ? JSON.parse(dataConfig.headerTable) : [];
    setColumnsConfig(dataConfigHeader);
    let dataConfigRow = dataConfig?.dataRow && JSON.parse(dataConfig.dataRow) ? JSON.parse(dataConfig.dataRow) : [];
    setRowData(dataConfigRow);
    // onChange && onChange({ headerTable: dataConfig.headerTable, dataRow: dataConfig.dataRow });
  }, [dataConfig]);

  useEffect(() => {
    setDataConfigGrid && setDataConfigGrid((prev) => ({ ...prev, dataRow: rowData }));
  }, [rowData]);

  useEffect(() => {
    onChange && onChange({ headerTable: JSON.stringify(columnsConfig), dataRow: JSON.stringify(rowData) });
    // onChange && onChange({ headerTable: columnsConfig, dataRow: rowData });
  }, [columnsConfig, rowData]);

  useEffect(() => {
    const newColumn = generateColumns(columnsConfig, actionRow, typeNo, params);
    columnsRef.current = newColumn;
    setColumns(newColumn);
    setDataConfigGrid && setDataConfigGrid((prev) => ({ ...prev, headerTable: columnsConfig }));
  }, [columnsConfig]);

  useEffect(() => {
    if (dataFetch?.data) {
      setRowData(dataFetch.data);
    }
    if (dataFetch?.columns) {
      setColumns(dataFetch.columns);
    }
    if (dataFetch?.typeNo) {
      setTypeNo(dataFetch.typeNo);
    }
    if (dataFetch?.columnsConfig) {
      setColumnsConfig(dataFetch.columnsConfig);
    }
    if (dataFetch?.dataLookup) {
      setLookupValues(dataFetch.dataLookup);
    }
    if (dataFetch?.dataComment) {
      setCheckComment(dataFetch.dataComment);
    }
    if (dataFetch?.checkedMap) {
      setCheckedMap(dataFetch.checkedMap);
    }
  }, [dataFetch]);

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  useEffect(() => {
    setColumns((prevCols) =>
      prevCols.map((col) => {
        if (col.field === "no" || col.field === "stt" || col.field === "STT") {
          return {
            ...col,
            editable: typeNo === "input",
          };
        }
        return col;
      })
    );
  }, [typeNo]);

  // THÊM: Lấy width từ localStorage nếu có
  const columnDefs = useMemo<ColDef[]>(() => {
    const cols = columns;
    const savedWidths = localStorage.getItem(COLUMN_WIDTH_STORAGE_KEY);
    let widths: { [key: string]: number } = {};
    if (savedWidths) {
      try {
        widths = JSON.parse(savedWidths);
        setWidthNo(widths["stt"] || undefined);
      } catch {}
    }
    // Gán width vào columnDefs nếu có
    return cols.map((col: ColDef) => ({
      ...col,
      ...(widths && widths[col.field] ? { width: widths[col.field] } : {}),
    }));
  }, [columns]);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      // editable: true,
      filter: true,
      suppressMenu: false, // menu cột được bật mặc định
      cellStyle: {
        borderRight: "1px solid #ccc", // Kẻ border bên phải của ô
        padding: "0", // Thêm padding cho ô
      },
    }),
    []
  );

  const getRowHeight = (params: any) => {
    if (params.data.isHeaderRow) return 50; // Chiều cao hàng header
    return 40; // Chiều cao mặc định
  };

  const isFullWidthRow = (params: any) => {
    return params?.rowNode?.data?.isFullWidthRow; // Xác định hàng toàn chiều rộng
  };

  const handleFullWidthEdit = (rowKey, newData) => {
    setRowData((prev) => prev.map((row) => (row.rowKey === rowKey ? { ...row, ...newData } : row)));
  };

  // THÊM: Hàm lưu width vào localStorage khi resize cột
  const handleColumnResized = () => {
    if (!gridRef.current) return;
    const columnApi = gridRef.current.columnApi;
    if (!columnApi) return;
    const allColumns = columnApi.getAllColumns();
    const widths: { [key: string]: number } = {};
    allColumns.forEach((col: any) => {
      const colDef = col.getColDef();
      if (colDef.field) {
        widths[colDef.field] = col.getActualWidth();
        if (colDef.field === "no" || colDef.field === "stt" || colDef.field === "STT") {
          setWidthNo && setWidthNo(col.getActualWidth());
        }
      }
    });
    localStorage.setItem(COLUMN_WIDTH_STORAGE_KEY, JSON.stringify(widths));
  };

  const actionRow = (detailAction) => {
    switch (detailAction.action) {
      case "insert":
        handleAddRow(detailAction?.rowKey, detailAction?.position);
        break;
      case "insertSum":
        showToast("Chức năng đang phát triển", "warning");
        break;
      case "insertTitleSum":
        showToast("Chức năng đang phát triển", "warning");
        break;
      case "insertTitle":
        handleAddRowTitle(detailAction?.stype, detailAction?.rowKey, detailAction?.position);
        break;
      case "delete":
        handleDeleteRow(detailAction?.rowKey);
        break;
    }
  };
  const handleDeleteRow = async (rowKey) => {
    setRowData((prev) => prev.filter((row) => row.rowKey !== rowKey));
  };

  // THÊM: Hàm thêm dòng mới
  const handleAddRow = (rowKey?: string, position?: "top" | "bottom") => {
    const cols = columnsRef.current;
    const uuid = uuidv4();
    const newRow: any = { rowKey: uuid };
    cols.forEach((col: ColDef) => {
      if (col.field && col.field !== "rowKey") {
        if (col.cellRendererParams.type === "number") {
          newRow[col.field] = 0; // Các ô dữ liệu trống
        } else {
          newRow[col.field] = ""; // Các ô dữ liệu trống
        }
      }
    });
    if (rowKey && position) {
      setRowData((prev) => {
        const rowIndex = prev.findIndex((row: any) => row.rowKey === rowKey);
        if (rowIndex === -1) {
          // Nếu không tìm thấy rowKey, thêm vào cuối
          showToast("Không tìm thấy dòng để thêm vào", "error");
          return [...prev, newRow];
        } else {
          const newData = [...prev];
          if (position === "top") {
            newData.splice(rowIndex, 0, newRow); // Chèn lên trên
          } else {
            newData.splice(rowIndex + 1, 0, newRow); // Chèn xuống dưới
          }
          return newData;
        }
      });
    } else {
      setRowData((prev) => [...prev, newRow]);
    }
  };
  // THÊM: Hàm thêm dòng mới
  const handleAddRowTitle = (stype: any, rowKey?: string, position?: "top" | "bottom") => {
    const uuid = uuidv4();
    const newRow: any = {
      rowKey: uuid,
      no: "",
      level: stype.split("")[1] || 1,
      content: "",
      isFullWidthRow: true,
    };

    if (rowKey && position) {
      setRowData((prev) => {
        const rowIndex = prev.findIndex((row: any) => row.rowKey === rowKey);
        if (rowIndex === -1) {
          // Nếu không tìm thấy rowKey, thêm vào cuối
          showToast("Không tìm thấy dòng để thêm vào", "error");
          return [...prev, newRow];
        } else {
          const newData = [...prev];
          if (position === "top") {
            newData.splice(rowIndex, 0, newRow); // Chèn lên trên
          } else {
            newData.splice(rowIndex + 1, 0, newRow); // Chèn xuống dưới
          }
          return newData;
        }
      });
    } else {
      setRowData((prev) => [...prev, newRow]);
    }
  };

  const handleSaveData = async () => {
    setLoading(true);

    const response = await saveDataGrid(columnsConfig, rowData, params, checkedMap);

    if (response.code === 0) {
      showToast("Lưu dữ liệu thành công", "success");
      // setIsFetchData(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setLoading(false);
  };

  const getLatestRowData = () => {
    //Lấy data mới nhất trên lưới
    const _rowData = [];
    gridRef.current.api.forEachNode((node) => _rowData.push(node.data));
    return _rowData;
  };

  const handleFilterData = () => {
    const _rowData = getLatestRowData();
    const paramFilter = filterData(_rowData, checkedMap, columnsConfig);
    onAction && onAction({ type: "filter", params: paramFilter });
  };

  const handleGetCheckComment = async () => {
    const checkCommentNew = await getListComment(params); // gọi API lấy dữ liệu
    if (checkCommentNew) {
      setCheckComment(checkCommentNew);
    }
  };
  const onCellValueChanged = () => {
    // params.data là dòng vừa được sửa
    // rowData là state, nhưng để chắc chắn, bạn nên lấy dữ liệu mới nhất từ gridRef
    if (location == "configViewer") {
      const updatedRowData = getLatestRowData();
      onChange && onChange({ headerTable: JSON.stringify(columnsConfig), dataRow: JSON.stringify(updatedRowData) });
    }
  };

  return (
    <div className="ag-grid-table">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {enableExport || enableImport ? (
            <div className="action-excel">
              {enableExport ? (
                <Button
                  color="secondary"
                  className="button--left"
                  type="button"
                  onClick={() => {
                    exportCustomExcel(columnsConfig, rowData, typeNo);
                  }}
                >
                  <Icon name="Upload" /> Xuất dữ liệu Excel
                </Button>
              ) : null}
              {enableImport ? (
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
              ) : null}
            </div>
          ) : null}
          <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              context={{ rowData }} // Truyền rowData vào context để các cellRenderer có thể dùng
              getRowId={(params) => params.data.rowKey} // Cấu hình khóa chính
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              getRowHeight={getRowHeight}
              // rowClassRules={rowClassRules}
              isFullWidthRow={isFullWidthRow}
              fullWidthCellRenderer={FullWidthRenderer}
              fullWidthCellRendererParams={{
                onEdit: handleFullWidthEdit,
                actionRow: actionRow,
              }}
              popupParent={document.body} // 👈 QUAN TRỌNG
              domLayout="autoHeight" // 👈 dòng sẽ co giãn theo nội dung
              // THÊM: Sự kiện resize cột
              onColumnResized={handleColumnResized}
              onCellValueChanged={onCellValueChanged}
            />
          </div>
          <div className="action-bottom">
            {enableAddRow ? (
              <Button
                color="secondary"
                type="button"
                onClick={() => {
                  handleAddRow();
                }}
              >
                <Icon name="PlusCircle" /> Thêm dòng
              </Button>
            ) : null}
            {enableAddColumns ? (
              <Button
                color="secondary"
                type="button"
                onClick={() => {
                  setShowModalAddColumn(true);
                }}
              >
                <Icon name="PlusCircle" /> Thêm cột
              </Button>
            ) : null}

            {enableSave && location == "iframe" ? (
              <Button
                color="secondary"
                type="button"
                onClick={() => {
                  handleSaveData();
                }}
                disabled={loading}
              >
                <Icon name="CheckedCircle" /> Lưu
              </Button>
            ) : null}
            {/* {enableFilter ? ( */}
            {linkingConfig && linkingConfig.gridDestination ? (
              <Button
                color="secondary"
                type="button"
                onClick={() => {
                  // handleFilterData();
                  const _rowData = getLatestRowData();
                  const paramFilter = filterData(_rowData, checkedMap, columnsConfig);
                  window.dispatchEvent(
                    new CustomEvent(idGrid + "-clicked", {
                      detail: {
                        message: "Hello from " + idGrid,
                        params: paramFilter,
                        linkingConfig: linkingConfig,
                        idGrid: idGrid,
                        objectData: { foo: "bar" },
                      },
                    })
                  );
                }}
                disabled={loading}
              >
                {/* <Icon name="Filter2" /> */}
                {linkingConfig?.buttonName || "Lọc dữ liệu"}
              </Button>
            ) : null}
          </div>
        </>
      )}

      <ModalAddColumnAg
        onShow={showModalAddColumn || colCodeEdit}
        data={colCodeEdit ? columnsConfig.find((item) => item.key == colCodeEdit) : null}
        listColumn={columnsConfig}
        location={location}
        typeNo={typeNo}
        isEdit={colCodeEdit ? true : false}
        setIsChangeColumns={setIsChangeColumns}
        onHide={(reload) => {
          if (reload) {
            setDataColumnEdit(null);
            setIsEditColumn(false);
          }
          setShowModalAddColumn(false);
        }}
      />
      <ModalImportGrid
        name={"Dữ liệu mẫu"}
        listColumn={columnsConfig}
        onShow={showModalImport}
        onHide={(reload) => {
          if (reload) {
          }
          setShowModalImport(false);
        }}
        type="grid"
      />
      <ModalCommentAg
        onShow={dataModalComment?.show || false}
        nodeId={params?.nodeId || defaultNote.noteId}
        potId={params?.potId || defaultNote.potId}
        fieldName={params?.fieldName || defaultNote.fieldName}
        workId={params?.workId || defaultNote.workId}
        rowKey={dataModalComment?.rowKey || null}
        columnKey={dataModalComment?.columnKey || null}
        onHide={(reload) => {
          setDataModalComment(null);
          if (reload) {
            handleGetCheckComment();
          }
        }}
      ></ModalCommentAg>
    </div>
  );
};

export default GridAgTable;
