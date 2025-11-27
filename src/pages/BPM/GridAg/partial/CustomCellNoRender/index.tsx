import React, { useState, memo, useCallback, useEffect, useRef } from "react";
import "./index.scss";
import ReactDOM from "react-dom";
import NoCellMenu from "./partials/NoCellMenu";
import { useGridAg } from "../../GridAgContext";

const CustomCellNoRender = (props) => {
  const { typeNo, rowData } = useGridAg();

  const { type } = props;
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  function formatNumber(input: number): string {
    // Chuyển số thành chuỗi
    const inputStr = input.toString();

    // Tách phần nguyên và phần thập phân
    const [integerPart, decimalPart] = inputStr.split(".");

    // Định dạng phần nguyên: thêm dấu phẩy mỗi 3 chữ số
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Nếu có phần thập phân, ghép phần nguyên và phần thập phân với dấu chấm
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }

  const generateItem = useCallback(
    (type) => {
      switch (type) {
        case "number":
          return (
            <div className="text-truncate" title={props?.value ? formatNumber(props?.value) : ""}>
              {props?.value ? formatNumber(props?.value) : ""}
            </div>
          );

        default:
          if (typeof props.value != "undefined") {
            const idx = rowData.findIndex((row) => row.rowKey === props.data.rowKey);
            return (
              <div className="text-truncate" title={typeNo === "input" ? props.value.toString() : idx + 1}>
                {typeNo === "input" ? props.value.toString() : idx + 1}
              </div>
            );
          }
      }
    },
    [props, typeNo, rowData]
  ); // Thêm các dependencies nếu cần

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.y + 4, left: rect.left });
    }
  }, [showMenu]);

  return (
    <div
      className={`custom-cell-no-render ${
        props.justifyContent
          ? "content-cell-render-" + props.justifyContent
          : type == "number"
          ? "content-cell-render-end"
          : "content-cell-render-start"
      }`}
    >
      {generateItem(type)}
      {/* Menu icon */}
      <div className="icon-popover">
        <div ref={buttonRef} onClick={toggleMenu} title="More" className="button-menu">
          <div className="button-content">⋮</div>
        </div>
      </div>
      {showMenu &&
        ReactDOM.createPortal(
          <NoCellMenu
            position={position}
            onClose={() => setShowMenu(false)}
            rowKey={props.data.rowKey}
            callBack={props.actionRow}
            // onEdit={handleEdit}
            // onDelete={handleDelete}
          />,
          document.body
        )}
    </div>
  );
};

export default memo(CustomCellNoRender);
