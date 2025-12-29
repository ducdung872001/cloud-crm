import React, { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { Pagination, PaginationProps } from "components/pagination/pagination";
import BulkAction, { BulkActionItemModel } from "components/bulkAction/bulkAction";
import "./boxTableAdvanced.scss";

interface IBoxTableAdvancedProps {
  isImage?: boolean;
  name?: string;
  columnDefs: any;
  dragColumnDefs?: boolean;
  rowData: any;
  isBulkAction?: boolean;
  bulkActionItems?: BulkActionItemModel[];
  listIdChecked?: number[];
  setListIdChecked?: (listId: number[], lstData?: any[]) => void;
  isPagination?: boolean;
  widthColumns?: any;
  setWidthColumns?: any;
  dataPagination?: PaginationProps;
  autoFill?: boolean;
  saveColumnName?: string;
}

export default function BoxTableAdvanced(props: IBoxTableAdvancedProps) {
  const {
    name,
    columnDefs,
    rowData,
    isBulkAction,
    bulkActionItems,
    listIdChecked,
    setListIdChecked,
    isPagination,
    dataPagination,
    autoFill,
    isImage,
    widthColumns,
    setWidthColumns,
    dragColumnDefs = true,
    saveColumnName,
  } = props;

  const gridApiRef = useRef(null);

  const defaultColDef = useMemo(() => {
    return {
      resizable: true,
    };
  }, []);

  const onSelectionChanged = () => {
    const selectedNodes = gridApiRef.current.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);

    const result = selectedData.map((item) => item.id);
    setListIdChecked(result, selectedData);
  };

  const onColumnResized = (params) => {
    const takeActualWidth = params.column;

    const changeTakeActualWidth = {
      width: takeActualWidth?.actualWidth,
      colId: takeActualWidth?.colId,
    };

    setWidthColumns([...widthColumns, changeTakeActualWidth]);
  };

  const onColumnMoved = (params) => {
    if(!saveColumnName) return;
    const columnOrder = params.columnApi
      .getColumnState()
      .map(col => col.colId);
    
    console.log('columnOrder', columnOrder);
    localStorage.setItem(
      saveColumnName,
      JSON.stringify(columnOrder)
    );
  };

  const onGridReady = (params) => {
    gridApiRef.current = params.api;
    params.api.addEventListener("selectionChanged", onSelectionChanged);
    if(!saveColumnName) return;
    const savedOrder = localStorage.getItem(saveColumnName);
    if (savedOrder) {
      params.columnApi.applyColumnState({
        state: JSON.parse(savedOrder).map((colId, index) => ({
          colId,
          order: index
        })),
        applyOrder: true
      });
    }
  };

  return (
    <div className="table__ag--template">
      <div className={`ag-theme-alpine ${isImage ? "ag-theme-alpine--image" : ""}`}>
        {isBulkAction && bulkActionItems && bulkActionItems?.length > 0 && listIdChecked && setListIdChecked && (
          <div className="view__info--action--bulk">
            <BulkAction name={name} selectedCount={listIdChecked?.length} bulkActionItems={bulkActionItems} />
          </div>
        )}
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={rowData}
          rowSelection={"multiple"}
          domLayout="autoHeight"
          suppressMovableColumns={dragColumnDefs}
          suppressRowClickSelection={true}
          // onGridReady={(params) => {
          //   gridApiRef.current = params.api;
          //   params.api.addEventListener("selectionChanged", onSelectionChanged);
          // }}
          onColumnResized={onColumnResized}
          onGridSizeChanged={(params) => (autoFill ? params.api.sizeColumnsToFit() : false)}
          onColumnMoved={onColumnMoved}
          onGridReady={onGridReady}
        />
      </div>
      {isPagination && (
        <div className="pagination__ag--grid">
          <Pagination
            name={dataPagination.name}
            displayNumber={dataPagination.displayNumber}
            page={dataPagination.page}
            setPage={(page) => dataPagination.setPage(page)}
            sizeLimit={dataPagination.sizeLimit}
            totalItem={dataPagination.totalItem}
            totalPage={dataPagination.totalPage}
            isChooseSizeLimit={dataPagination.isChooseSizeLimit}
            chooseSizeLimit={(limit) => dataPagination.chooseSizeLimit && dataPagination.chooseSizeLimit(limit)}
          />
        </div>
      )}
    </div>
  );
}
