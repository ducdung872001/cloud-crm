import React, {Fragment, useState, useEffect, useRef, memo} from "react";
import _ from "lodash";
import Icon from "components/icon";
import SearchBox from "components/searchBox/searchBox";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import "./HeaderFilter.scss";

function HeaderFilter(props: {
  params: Record<string, unknown>;
  setParams: (params: Record<string, unknown>) => void;
  listIdChecked?: number[];
  showDialogConfirmDelete?: () => void;
  titleActions?: ITitleActions;
  titleSearch?: string;
  exportExcel?: boolean;
  importExcel?: boolean;
  setOnShowModalExport?: () => void;
  setOnShowModalImport?: () => void;
  disableDeleteAll?: boolean;
  listSaveSearch?: Record<string, unknown>[];
}) {
  const {
    params,
    setParams,
    listIdChecked,
    showDialogConfirmDelete,
    titleActions,
    titleSearch,
    exportExcel,
    importExcel,
    setOnShowModalExport,
    setOnShowModalImport,
    disableDeleteAll,
    listSaveSearch,
  } = props;

  return (
    <div className="container-header-filter">
      <div className="header_top">
        {exportExcel ? (
          <div
            className="button_export"
            onClick={() => {
              setOnShowModalExport();
            }}
          >
            <Icon name="ExportRox" />
            <span className="label">Xuất file Excel</span>
          </div>
        ) : null}

        {importExcel ? (
          <div
            className="button_export"
            onClick={() => {
              setOnShowModalImport();
            }}
          >
            <Icon name="UploadExcel" />
            <span className="label">Nhập file Excel</span>
          </div>
        ) : null}
        {titleActions ? <TitleAction title="" titleActions={titleActions} disableIcon={true} /> : null}
      </div>
      <div className="header_bottom">
        {listIdChecked?.length > 0 ? (
          <div>
            <span style={{ fontSize: 14, fontWeight: "400" }}>Đang chọn {listIdChecked?.length}</span>
          </div>
        ) : null}

        {listIdChecked?.length > 0 && !disableDeleteAll ? (
          <div
            className="button_delete"
            onClick={() => {
              showDialogConfirmDelete();
            }}
          >
            <Icon name="TrashOutline" />
          </div>
        ) : null}

        <div className="box_search">
          <SearchBox
            name={titleSearch || ""}
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(HeaderFilter);
