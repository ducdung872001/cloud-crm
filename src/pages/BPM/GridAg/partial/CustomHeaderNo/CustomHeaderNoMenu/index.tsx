import React, { memo, useEffect, useRef, useState } from "react";
import Icon from "components/icon";
import "./index.scss";
import RadioList from "components/radio/radioList";
import { useGridAg } from "pages/BPM/GridAg/GridAgContext";
import { getSearchParameters } from "reborn-util";
import { showToast } from "utils/common";
import GirdService from "services/GridService";

const CustomHeaderNoMenu = ({ position, onClose }) => {
  const menuRef = useRef(null);
  const { typeNo, setTypeNo, columnsConfig } = useGridAg();
  const params: any = getSearchParameters();

  // Đóng popup khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSaveTypeNo = async (typeNoChange) => {
    let dataSubmit = {
      nodeId: params?.nodeId || "Activity_0n3i8dv",
      processId: params?.processId || 380,
      fieldName: params?.fieldName || "boq",
      header: JSON.stringify(columnsConfig),
      typeNo: typeNoChange,
    };

    // return;
    const responseHeader = await GirdService.update(dataSubmit);
    if (responseHeader.code === 0) {
      showToast(`Thay đổi kiểu số thứ tự thành công`, "success");
    } else {
      showToast(responseHeader.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <>
      {position.top && position.left ? (
        <div
          className="custom-header-no-menu"
          ref={menuRef}
          style={{
            position: "absolute",
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <RadioList
            options={[
              { label: "STT tự tăng", value: "auto" },
              { label: "STT nhập vào", value: "input" },
            ]}
            className="form-group-number"
            title="Kiểu số thứ tự"
            name="typeNo"
            value={typeNo}
            onChange={(e) => {
              setTypeNo(e.target.value);
              handleSaveTypeNo(e.target.value);
              onClose();
            }}
          />
          {/* <div
            className="custom-header-menu__item custom-header-menu__item--setting"
            onClick={() => {
              // onEdit(colId);
              onClose();
              alert("Chức năng sửa cột chưa được triển khai!"); // Thay thế bằng logic sửa cột thực tế
            }}
          >
            <Icon name="Settings" />
            Sửa cột
          </div> */}
        </div>
      ) : null}
    </>
  );
};

export default memo(CustomHeaderNoMenu);
