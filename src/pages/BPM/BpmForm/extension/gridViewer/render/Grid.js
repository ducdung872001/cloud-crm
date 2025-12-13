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

function detectDynamicListInfo(props) {
  // 1) try fieldInstance.valuePath
  // Một số runtime truyền thông tin đường dẫn giá trị (valuePath) dưới fieldInstance hoặc trực tiếp props.valuePath.
  // valuePath thường là một mảng mô tả vị trí của giá trị trong expression context:
  // e.g. ["dynamiclist_abc", 0, "grid_xyz"] => nằm trong dynamiclist_abc, index = 0, key = grid_xyz
  const valuePath = props?.fieldInstance?.valuePath || props?.valuePath || props?.fieldInstance?.expressionContextInfo?.valuePath;

  // Nếu valuePath tồn tại và là mảng thì duyệt mảng để tìm pattern:
  // một phần tử là chuỗi bắt đầu bằng "dynamiclist_" tiếp theo là một number => tìm thấy dynamic list.
  if (Array.isArray(valuePath)) {
    for (let i = 0; i < valuePath.length; i++) {
      const seg = valuePath[i];

      // kiểm tra seg có phải string bắt đầu bằng "dynamiclist_" và phần tử tiếp theo tồn tại và là number
      if (typeof seg === "string" && /^dynamiclist_/.test(seg) && typeof valuePath[i + 1] === "number") {
        return {
          inDynamicList: true, // xác nhận là nằm trong dynamic list
          listId: String(seg), // id của dynamic list (ví dụ "dynamiclist_5rjmcs")
          index: Number(valuePath[i + 1]), // index instance trong list (0,1,2,...)
          source: "valuePath", // nguồn thông tin là valuePath
        };
      }
    }
  }

  // 2) try props.indexes (object mapping parentId => index)
  // Một số API truyền props.indexes là object: { "<parentFieldId>": <index> }
  // Đây là fallback nếu valuePath không có hoặc không cung cấp thông tin.
  const idxObj = props?.indexes;
  if (idxObj && typeof idxObj === "object" && Object.keys(idxObj).length) {
    const entries = Object.entries(idxObj);
    // chọn entry đầu tiên — thường chỉ có 1 parent liên quan
    const [parentId, idx] = entries[0];

    // nếu idx đã là number thì trả về luôn
    if (typeof idx === "number") {
      return {
        inDynamicList: true,
        listId: parentId, // parent field id (ví dụ "Field_1kllluo")
        index: idx,
        source: "indexes",
      };
    }
    // nếu idx là string chứa số, chuyển thành number và trả về
    if (!isNaN(Number(idx))) {
      return {
        inDynamicList: true,
        listId: parentId,
        index: Number(idx),
        source: "indexes",
      };
    }
  }

  // 3) heuristic: domId suffix _<n>
  // Nếu không có thông tin trên, dùng heuristic dựa trên domId.
  // domId thường có dạng "...-Field_abc_1" => phần đuôi _1 có thể là index instance.
  const domId = props?.domId;
  if (typeof domId === "string") {
    const m = domId.match(/_(\d+)$/);
    if (m) {
      return { inDynamicList: true, listId: null, index: Number(m[1]), source: "domId" };
    }
  }

  // nếu không phát hiện được dynamic list, trả về giá trị mặc định (không nằm trong list)
  return { inDynamicList: false, listId: null, index: null, source: null };
}

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
  // Chỉ lưu 1 lần cho mỗi instance id (trước khi có onChange)
  if (!configFieldOrigin[id]) {
    // props.field.dataRow có thể undefined => lưu [] nếu không có
    configFieldOrigin[id] = deepClone(props?.field?.dataRow ? props.field.dataRow : []);
  }
  // =====================================================

  const containerId = `gridag-container-${domId}`;
  if (!dataGrid[ids]) {
    dataGrid[ids] = {};
  }

  dataGrid[ids].headerTable = props?.field?.headerTable ? props?.field?.headerTable : [];
  if (!value || value === "undefined" || value === "") {
    // Nếu chưa có value, kiểm tra xem có phải Grid được clone trong dynamic list không ?
    let dynamicListInfo = detectDynamicListInfo(props);
    if (dynamicListInfo.inDynamicList && dynamicListInfo.index > 0) {
      //Tạo rowKey mới cho tất cả các dòng nếu đây là grid trong dynamic list (bản chất là clone của grid có indexes[_parent] == 0)
      // let _dataRow = props?.field?.dataRow ? props?.field?.dataRow : [];
      let id = null;
      let _dataRow = [];
      Object.keys(configFieldOrigin).forEach((key) => {
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
      // dataGrid[ids].headerTable = _dataGrid.headerTable ? JSON.parse(JSON.stringify(_dataGrid.headerTable)) : []; // clone sâu trước khi gán
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
