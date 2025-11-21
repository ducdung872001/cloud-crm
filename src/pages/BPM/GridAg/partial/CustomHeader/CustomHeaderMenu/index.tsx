import React, { memo, useEffect, useRef, useState } from "react";
import Icon from "components/icon";
import "./index.scss";
import { useGridAg } from "pages/BPM/GridAg/GridAgContext";

const CustomHeaderMenu = ({
  position,
  onClose,
  // onEdit,
  // onDelete,
  colCode,
  showDialogConfirm,
}) => {
  const menuRef = useRef(null);
  const { setColCodeEdit } = useGridAg();

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

  return (
    <>
      {position.top && position.left ? (
        <div
          className="custom-header-menu"
          ref={menuRef}
          style={{
            position: "absolute",
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div
            className="custom-header-menu__item custom-header-menu__item--setting"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              setColCodeEdit(colCode);
            }}
          >
            <Icon name="Settings" />
            Sửa cột
          </div>
          <div
            className="custom-header-menu__item custom-header-menu__item--delete"
            onClick={(e) => {
              e.stopPropagation();
              showDialogConfirm(colCode);
              onClose();
            }}
          >
            <Icon name="Trash" />
            Xoá cột
          </div>
        </div>
      ) : null}
    </>
  );
};

export default memo(CustomHeaderMenu);
