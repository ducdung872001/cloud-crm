import Icon from "components/icon";
import React, { useState, useEffect, useRef, Fragment } from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import CustomHeaderMenu from "./CustomHeaderMenu";
import { getSearchParameters } from "reborn-util";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import GridService from "services/GridService";
import { useGridAg } from "../../GridAgContext";

const CustomHeader = (props) => {
  const { columnsConfig, setColumnsConfig, setIsFetchData, setIsLoading } = useGridAg();
  const [showMenu, setShowMenu] = useState(false);
  const [sort, setSort] = useState(null);
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const params: any = getSearchParameters();
  const [isEditColumn, setIsEditColumn] = useState(false);

  const handleSort = () => {
    const currentSort = props.column.getSort(); // "asc", "desc", or undefined
    const nextSort = currentSort === "asc" ? "desc" : currentSort === "desc" ? null : "asc";
    props.setSort(nextSort);
    setSort(nextSort);
  };

  const handleFilter = (e) => {
    e.stopPropagation();
    if (buttonRef.current) {
      props.showColumnMenu(buttonRef.current); // 👈 mở filter popup
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [showMenu]);

  // Lắng nghe sự thay đổi filter
  const [filterActive, setFilterActive] = useState(props.column.isFilterActive());
  useEffect(() => {
    // Cần lấy gridApi từ props (truyền vào headerComponentParams hoặc props.api)
    const onFilterChanged = () => {
      setFilterActive(props.column.isFilterActive());
    };
    if (props.api) {
      props.api.addEventListener("filterChanged", onFilterChanged);
      // Lấy trạng thái filter lúc đầu
      setFilterActive(props.column.isFilterActive());
      return () => props.api.removeEventListener("filterChanged", onFilterChanged);
    }
  }, [props.api, props.column]);

  const onDeleteColumn = async (param) => {
    return;
    const response = await GridService.delete(param);
    if (response.code === 0) {
      // showToast("Xóa quy trình thành công", "success");
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const hanhdleDeleteColumn = async (key) => {
    const field = columnsConfig.find((item) => item.key === key);
    if (field.type == "binding") {
      const listDeleteField = [field.key];
      if (field?.listBindingField && field.listBindingField?.length) {
        field.listBindingField.map((bindingField) => {
          const fieldBinding = columnsConfig.find((el) => el.key == bindingField.key);
          if (fieldBinding) {
            listDeleteField.push(bindingField.key);
            if (fieldBinding?.listBindingField && fieldBinding.listBindingField?.length) {
              fieldBinding.listBindingField.map((bindingFieldContact) => {
                const fieldBindingContact = columnsConfig.find((el) => el.key == bindingFieldContact.key);
                if (fieldBindingContact) {
                  listDeleteField.push(bindingFieldContact.key);
                }
              });
            }
          }
        });
      }
      for (let index = 0; index < listDeleteField.length; index++) {
        const element = listDeleteField[index];
        await onDeleteColumn({
          key: element,
          nodeId: params?.nodeId || "Activity_0n3i8dv",
          fieldName: params?.fieldName || "boq",
        });
      }
      setColumnsConfig(columnsConfig.filter((item) => !listDeleteField.includes(item.key)));
    } else {
      await onDeleteColumn({
        key: field.key,
        nodeId: params?.nodeId || "Activity_0n3i8dv",
        fieldName: params?.fieldName || "boq",
      });
      setColumnsConfig(columnsConfig.filter((item) => item.name !== field.name));
    }
    // setIsFetchData(true);
    // setIsLoading(true);
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const showDialogConfirm = (field) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-error",
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
        // setIsChangeColumns(true);
        // setLoading(true);
        hanhdleDeleteColumn(field);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setShowDialog(true);
    setContentDialog(contentDialog);
  };

  return (
    <div className="ag-custom-header-cell">
      <div
        className="ag-custom-header-label"
        onClick={handleSort}
        title={props.column.colId !== "cot-lam-ro" ? "Click to sort" : ""}
        style={{ flex: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "start" }}
      >
        {props.displayName}
      </div>
      {props.column.colId !== "cot-lam-ro" ? (
        <>
          {/* Filter icon */}
          {filterActive && (
            <div className={`ag-custom-header-filter-active`} title="Filter Active" onClick={handleFilter}>
              <Icon name="Filter2" />
            </div>
          )}
          <div className="ag-custom-header-sort-icon" onClick={handleSort}>
            {sort === "asc" ? <Icon name="CaretUp" /> : sort === "desc" ? <Icon name="CaretDown" /> : ""}
          </div>

          {/* Filter icon */}
          <div className="ag-custom-header-filter-icon" onClick={handleFilter} title="Filter">
            <Icon name="Filter" />
          </div>

          {/* Menu icon */}
          <div className="ag-custom-header-menu-button">
            <div ref={buttonRef} onClick={toggleMenu} title="More" className="button-menu">
              <div className="button-content">⋮</div>
            </div>
          </div>
        </>
      ) : null}

      {showMenu &&
        ReactDOM.createPortal(
          <CustomHeaderMenu
            position={position}
            colCode={props.column.getColId()}
            onClose={() => setShowMenu(false)}
            showDialogConfirm={showDialogConfirm}
          />,
          document.body
        )}
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
};

export default CustomHeader;
