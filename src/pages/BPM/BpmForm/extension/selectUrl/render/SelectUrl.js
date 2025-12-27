import classNames from "classnames";
import React from "react";
import ReactDOM from "react-dom";
import { html, useContext } from "diagram-js/lib/ui";
import { FormContext } from "@bpmn-io/form-js";
import SelectUrlCustom from "components/selectUrlCustom/selectUrlCustom";

// import "./styles.css";

// Định nghĩa Type
export const selectUrlType = "selectUrl";

// Icon hiển thị trên Palette
const IconSelectUrlSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z" fill="currentColor"/></svg>`;
export const iconSelectUrlDataUrl = `data:image/svg+xml,${encodeURIComponent(IconSelectUrlSvg)}`;

export function SelectUrlRenderer(props) {
  const { disabled, errors = [], field, readonly, value, domId } = props;
  const { description, id, label } = field;
  const { formId } = useContext(FormContext);

  const required = field?.validate?.required ?? false;

  // Lấy cấu hình từ properties
  const url = field?.properties?.url ?? "";
  const isLoadAll = field?.properties?.isLoadAll ?? false;
  const isMulti = field?.properties?.isMulti ?? false;
  const labelKey = field?.properties?.labelKey ?? "name";
  const valueKey = field?.properties?.valueKey ?? "id";
  const searchKey = field?.properties?.searchKey ?? "name";

  const containerId = `select-url-container-${domId}`;
  const errorMessageId = errors.length === 0 ? undefined : `${prefixId(domId, formId)}-error-message`;

  function handleChange(option) {
    props.onChange({
      field: field,
      value: option,
    });
  }

  // Render Component React
  setTimeout(() => {
    const container = document.getElementById(containerId);
    if (container && props.onChange && field) {
      ReactDOM.render(
        <SelectUrlCustom
          id={domId}
          label={""}
          placeholder="Chọn dữ liệu..."
          disabled={disabled || readonly}
          required={required}
          fill={true}
          value={value}
          url={url}
          isLoadAll={isLoadAll}
          isMulti={isMulti}
          labelKey={labelKey}
          valueKey={valueKey}
          searchKey={searchKey}
          onChange={handleChange}
        />,
        container
      );

      container.__cleanup = () => {
        ReactDOM.unmountComponentAtNode(container);
      };
    }
  });

  return html`
    <div class=${formFieldClasses(selectUrlType, { errors, disabled, readonly })}>
      <label id=${prefixId(id, formId)} class="fjs-form-field-label">
        ${label || ""} ${required ? html`<span style="color:red" aria-hidden="true" class="fjs-asterix">*</span>` : null}
      </label>
      <div id=${containerId} class="select-url-wrapper" style="width: 100%;"></div>
      ${description ? html`<div class="description">${description}</div>` : null}
      ${errors.length > 0 ? html`<div class="errors" id=${errorMessageId}>${errors.join(", ")}</div>` : null}
    </div>
  `;
}

// --- CẤU HÌNH QUAN TRỌNG ---
SelectUrlRenderer.config = {
  type: selectUrlType,
  label: "Select URL Custom",
  group: "selection",
  iconUrl: iconSelectUrlDataUrl,
  propertiesPanelEntries: ["key", "label", "description", "disabled", "required", "readonly"],

  // Hàm khởi tạo dữ liệu khi kéo thả
  create: function (fieldFactory, incomingProperties) {
    const type = selectUrlType;
    // Tự sinh ID
    const id = nextId(type);

    // Log ra console để debug xem ID có sinh ra không (F12 để xem)
    console.log("Creating SelectUrl with ID/Key:", id);

    // Trả về object định nghĩa field
    // LƯU Ý: Không spread `...incomingProperties` ở root để tránh bị ghi đè key rỗng
    return {
      id: id,
      key: id, // Bắt buộc phải có và không được rỗng
      type: type,
      label: "Select URL Custom",

      // Các custom properties nằm trong object properties
      properties: {
        url: "",
        isLoadAll: false,
        isMulti: false,
        labelKey: "name",
        valueKey: "id",
        searchKey: "name",
        // Nếu muốn lấy thêm props khác từ incoming thì nhét vào đây, nhưng cẩn thận
        ...(incomingProperties && incomingProperties.properties ? incomingProperties.properties : {}),
      },
    };
  },
};

// --- Helpers ---

// Hàm sinh ID đơn giản
function nextId(prefix) {
  return prefix + "_" + Math.random().toString(36).substring(2, 9);
}

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
