import classNames from "classnames";
import React from "react";
import ReactDOM from "react-dom";

/*
 * NOTE:
 * Instead of importing the SVG in a way that your bundler may transform it into a React component,
 * we keep the SVG content as a string here and create a proper data URL:
 */
const IconUploadFileSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-labelledby="title desc">
  <title id="title">Upload file inside square</title>
  <desc id="desc">Rounded square frame (side = 56) with a slightly larger upload arrow and tray centered inside.</desc>

  <!-- Rounded square: side = 56 (same as previous rectangle width), centered in 64x64 viewBox -->
  <rect x="4" y="4" width="56" height="56" rx="6" fill="none" stroke="#111827" stroke-width="2"/>

  <!-- Larger upload symbol centered in the square -->
  <g transform="translate(32,32)" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="false">
    <!-- Arrow shaft (larger) -->
    <line x1="0" y1="14" x2="0" y2="-12"/>
    <!-- Arrow head (larger and filled for clarity) -->
    <path d="M -8 -3 L 0 -14 L 8 -3 Z" fill="#111827" stroke="none"/>
    <!-- Tray / base line (wider) -->
    <line x1="-18" y1="18" x2="18" y2="18" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Small downward flares to suggest a tray -->
    <path d="M -12 18 L -16 10" stroke="#111827" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M 12 18 L 16 10" stroke="#111827" stroke-width="2.2" stroke-linecap="round"/>
  </g>
</svg>`;

export const iconDataUrl = `data:image/svg+xml,${encodeURIComponent(IconUploadFileSvg)}`;

/*
 * Import components and utilities from our extension API. Warning: for demo experiments only.
 */
import { FormContext, Textfield } from "@bpmn-io/form-js";

import { html, useContext } from "diagram-js/lib/ui";

import "./styles.css";

import AttachmentUploader from "components/attachmentUpload";

export const uploadFileType = "uploadFile";

function isValidJSON(value) {
  if (typeof value !== "string") return false;
  try {
    JSON.parse(value);
    return true;
  } catch (e) {
    return false;
  }
}

export function UploadFileRenderer(props) {
  const { disabled, errors = [], field, readonly, value, domId } = props;
  const { description, id, label } = field;
  const { formId } = useContext(FormContext);

  const errorMessageId = errors.length === 0 ? undefined : `${prefixId(domId, formId)}-error-message`;

  const containerId = `upload-file-container-${domId}`;

  // Khi UploadFile thay đổi
  function handleUploadFileChange(newValue) {
    props.onChange({
      field: field, // object field từ props
      value: JSON.stringify(newValue),
    });
  }

  setTimeout(() => {
    const container = document.getElementById(containerId);
    if (container && props.onChange && field) {
      // Điều kiện container và props.onChange và field quan trọng
      let _value = [];
      if (isValidJSON(value)) {
        _value = JSON.parse(value);
      } else if (typeof value === "string" && value.length > 0) {
        _value = [
          {
            url: value,
            type: "",
            name: "",
            size: null,
          },
        ];
      }
      // ReactDOM.render(
      //   <AttachmentUploader
      //     value={_value}
      //     placeholderLabel=""
      //     onChange={handleUploadFileChange}
      //     multiple={field.multiple ? field.multiple : false}
      //     maxFiles={field.maxFiles ? parseInt(field.maxFiles) : 0}
      //   />,
      //   container
      // );

      // cleanup khi unmount
      container.__cleanup = () => {
        ReactDOM.unmountComponentAtNode(container);
      };
    }
  });

  return html`
    <div class=${formFieldClasses("uploadFile", { errors, disabled, readonly })}>
      <label id=${prefixId(id, formId)}>${label || ""}</label>
      <div id=${containerId}></div>
      ${description ? html`<div class="description">${description}</div>` : null}
      ${errors.length > 0 ? html`<div class="errors" id=${errorMessageId}>${errors.join(", ")}</div>` : null}
    </div>
  `;
}

/*
 * This is the configuration part of the custom field. It defines
 * the schema type, UI label and icon, palette group, properties panel entries
 * and much more.
 */
UploadFileRenderer.config = {
  /* we can extend the default configuration of existing fields */
  ...Textfield.config,
  type: uploadFileType,
  label: "Upload File",
  name: "Upload File",
  // iconUrl: `data:image/svg+xml,${encodeURIComponent(IconUploadFile)}`,
  iconUrl: iconDataUrl,
  propertiesPanelEntries: [
    // danh sách các thuộc tính có thể cấu hình trong properties panel
    "key",
    "label",
    "description",
    //  "min", "max",
    "disabled",
    "required",
    "readonly",
    "headerTable",
  ],
  // Ghi đè getValue để trả về giá trị gốc khi submit
  getValue: (field, data) => {
    const displayValue = data[field.key];
    if (!displayValue) return "";

    // Chuyển đổi giá trị hiển thị về giá trị gốc
    const [integerPart, decimalPart] = displayValue.toString().split(".");
    const cleanInteger = integerPart.replace(/,/g, "");
    let rawValue = cleanInteger;

    if (decimalPart !== undefined && decimalPart !== "") {
      rawValue += "." + decimalPart.replace(/\D/g, "");
    }

    if (rawValue) {
      return window.Number(rawValue);
    }

    return rawValue;
  },
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
