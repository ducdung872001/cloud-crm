import classNames from "classnames";
// import IconGrid from "./icon-grid.svg?raw";
import React from "react";
import ReactDOM from "react-dom";

/*
 * NOTE:
 * Instead of importing the SVG in a way that your bundler may transform it into a React component,
 * we keep the SVG content as a string here and create a proper data URL:
 */
const IconGridSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M312 80l0 88 88 0 0-72c0-8.8-7.2-16-16-16l-72 0zm-48 0l-80 0 0 88 80 0 0-88zM136 80L64 80c-8.8 0-16 7.2-16 16l0 72 88 0 0-88zM0 216L0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 216zm48 80l88 0 0-80-88 0 0 80zm0 48l0 72c0 8.8 7.2 16 16 16l72 0 0-88-88 0zm136 88l80 0 0-88-80 0 0 88zm128 0l72 0c8.8 0 16-7.2 16-16l0-72-88 0 0 88zm88-136l0-80-88 0 0 80 88 0zm-216 0l80 0 0-80-80 0 0 80z"/></svg>`;

export const iconDataUrl = `data:image/svg+xml,${encodeURIComponent(IconGridSvg)}`;

/*
 * Import components and utilities from our extension API. Warning: for demo experiments only.
 */
import { FormContext, Textfield } from "@bpmn-io/form-js";

import { html, useContext } from "diagram-js/lib/ui";

import "./styles.css";
import GridAg from "pages/BPM/GridAg";

export const gridType = "grid";

// helper deep clone (structuredClone nếu hỗ trợ, fallback JSON)
const deepClone = (obj) => {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(obj);
    } catch (e) {
      // fallback
    }
  }
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    return obj;
  }
};

let dataGrid = {
  // Phải khai báo bên ngoài hàm để giữ trạng thái, nếu khai báo bên trong thì sẽ bị reload liên tục
  // headerTable: JSON.stringify([]),
  // dataRow: JSON.stringify([]),
};
let configField = {};

// configFieldOrigin để lưu lại cấu hình gốc ban đầu của field, không bị thay đổi khi người dùng chỉnh sửa trong GridAg
let configFieldOrigin = {};

export function GridRenderer(props) {
  const { disabled, errors = [], field, readonly, value, domId, indexes } = props;
  const { description, id, label, _parent } = field;
  const { formId } = useContext(FormContext);

  const errorMessageId = errors.length === 0 ? undefined : `${prefixId(domId, formId)}-error-message`;

  // Tạo 1 div placeholder
  // const ids = id + (typeof indexes[_parent] != "undefined" ? "_" + indexes[_parent] : "");
  const ids = domId ? domId : id + (indexes && typeof indexes[_parent] !== "undefined" ? "_" + indexes[_parent] : "");
  // === LƯU TRẠNG THÁI BAN ĐẦU (init) VÀO configFieldOrigin ===
  // Chỉ lưu 1 lần cho mỗi instance ids (trước khi có onChange)
  if (!configFieldOrigin[id]) {
    // props.field.dataRow có thể undefined => lưu [] nếu không có
    configFieldOrigin[id] = deepClone(props?.field?.dataRow ? props.field.dataRow : []);
  }
  // console.log("configFieldOrigin:", configFieldOrigin);
  // console.log("props:", props);
  // =====================================================
  const containerId = `gridag-container-${domId}`;
  if (!dataGrid[ids]) {
    dataGrid[ids] = {};
  }

  dataGrid[ids].headerTable = props?.field?.headerTable ? props?.field?.headerTable : [];
  if (!value || value === "undefined" || value === "") {
    console.log("Vào đây:");
    if (indexes && typeof indexes[_parent] != "undefined" && indexes[_parent]) {
      //Tạo rowKey mới cho tất cả các dòng nếu đây là grid trong dynamic list (bản chất là clone của grid có indexes[_parent] == 0)
      // let _dataRow = props?.field?.dataRow ? props?.field?.dataRow : [];
      let id = null;
      let _dataRow = [];
      Object.keys(configFieldOrigin).forEach((key) => {
        console.log("Found configFieldOrigin for ids:", ids, "key:", key);
        if (ids.includes(key)) {
          id = key;
        }
      });
      if (id) {
        _dataRow = configFieldOrigin[id];
      } else {
        _dataRow = props?.field?.dataRow ? JSON.parse(JSON.stringify(props.field.dataRow)) : []; // clone sâu trước khi gán
      }

      _dataRow = _dataRow.map((row, index) => {
        return { ...row, rowKey: `${ids}_row_${index}_${row.rowKey}` };
      });
      dataGrid[ids].dataRow = _dataRow;
    } else {
      dataGrid[ids].dataRow = props?.field?.dataRow ? props?.field?.dataRow : [];
    }
  } else {
    try {
      //Hiện tại chỉ cho sửa được dataRow, headerTable cố định từ đầu
      let _dataGrid = JSON.parse(value) ? JSON.parse(value) : {};
      // dataGrid[id].headerTable = _dataGrid.headerTable ? _dataGrid.headerTable : [];
      // dataGrid[ids].dataRow = _dataGrid.dataRow ? _dataGrid.dataRow : [];
      dataGrid[ids].dataRow = _dataGrid.dataRow ? JSON.parse(JSON.stringify(_dataGrid.dataRow)) : []; // clone sâu trước khi gán
    } catch (e) {
      console.error("Invalid JSON in grid value", e);
    }
  }

  // Khi GridAg thay đổi
  function handleGridChange(newValue) {
    props.onChange({
      field: field, // object field từ props
      value: JSON.stringify(newValue),
    });
  }

  // Khi GridAg thay đổi
  function handleOnAction(action) {
    console.log("GridAg Action:", field.label, action);
  }

  setTimeout(() => {
    const container = document.getElementById(containerId);
    if (container && props.onChange && field) {
      // Điều kiện container và props.onChange và field quan trọng
      configField[ids] = field;
      ReactDOM.render(
        <GridAg
          domId={domId}
          location={"viewAndHandle"}
          onChange={(e) => {
            handleGridChange(e);
          }}
          onAction={(action) => {
            handleOnAction(action);
          }}
          dataGrid={dataGrid[ids]}
          configField={configField[ids]}
        />,
        container
      );

      // cleanup khi unmount
      container.__cleanup = () => {
        ReactDOM.unmountComponentAtNode(container);
      };
    }
  });

  return html`
    <div class=${formFieldClasses("grid", { errors, disabled, readonly })}>
      <label id=${prefixId(id, formId)}>${label || ""}</label>
      <div id=${containerId}></div>
      ${description ? html`<div class="description">${description}</div>` : null}
      ${errors.length > 0 ? html`<div class="errors" id=${errorMessageId}>${errors.join(", ")}</div>` : null}
    </div>
  `;
}

// ⚡ gắn config (chỉ meta, không setValue/getValue ở đây)
GridRenderer.config = {
  ...Textfield.config,
  type: gridType,
  label: "Grid",
  name: "Grid",
  // iconUrl: `data:image/svg+xml,${encodeURIComponent(IconGrid)}`,
  iconUrl: iconDataUrl,
  propertiesPanelEntries: ["key", "label", "description", "disabled", "readonly", "headerTable"],
};

// helper //////////////////////

function formFieldClasses(type, { errors = [], disabled = false, readonly = false } = {}) {
  if (!type) {
    throw new Error("type required");
  }

  return classNames("fjs-form-field", `fjs-form-field-${type}`, {
    "fjs-has-errors": errors.length > 0,
    "fjs-disabled": disabled,
    "fjs-readonly": readonly,
  });
}

function prefixId(id, formId) {
  if (formId) {
    return `fjs-form-${formId}-${id}`;
  }

  return `fjs-form-${id}`;
}
