import Icon from "components/icon";
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import CustomHeaderMenu from "./CustomHeaderNoMenu";
import CustomHeaderNoMenu from "./CustomHeaderNoMenu";

const CustomHeaderNo = (props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [sort, setSort] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

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

  return (
    <div className="ag-custom-header-cell-no">
      <div
        className="ag-custom-header-label"
        onClick={handleSort}
        title="Click to sort"
        style={{ flex: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "start" }}
      >
        {props.displayName}
      </div>
      {/* Filter icon */}
      {filterActive && (
        <div className={`ag-custom-header-filter-active`} title="Filter Active" onClick={handleFilter}>
          <Icon name="Filter2" />
        </div>
      )}
      <div className="ag-custom-header-sort-icon" style={{ flex: 1 }} onClick={handleSort}>
        {sort === "asc" ? <Icon name="CaretUp" /> : sort === "desc" ? <Icon name="CaretDown" /> : ""}
      </div>

      {/* Filter icon */}
      {/* <div className="ag-custom-header-filter-icon" onClick={handleFilter} title="Filter">
        <Icon name="Filter" />
      </div> */}

      {/* Menu icon */}
      <div className="ag-custom-header-menu-button">
        <div ref={buttonRef} onClick={toggleMenu} title="More" className="button-menu">
          <div className="button-content">⋮</div>
        </div>
      </div>

      {showMenu && ReactDOM.createPortal(<CustomHeaderNoMenu position={position} onClose={() => setShowMenu(false)} />, document.body)}
    </div>
  );
};

export default CustomHeaderNo;
