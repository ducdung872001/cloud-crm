import classNames from "classnames";
import React from "react";
import ReactDOM from "react-dom";

/*
 * NOTE:
 * Instead of importing the SVG in a way that your bundler may transform it into a React component,
 * we keep the SVG content as a string here and create a proper data URL:
 */
const IconMaskedInputSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-labelledby="title desc">
  <title id="title">Eye inside rectangle (right quarter)</title>
  <desc id="desc">Rounded rectangle (width 56, height 28). A smaller eye is positioned in the right quarter of the rectangle.</desc>

  <!-- Rounded rectangle: width 56, height 28 (height = 1/2 width), centered vertically in 64x64 viewBox -->
  <rect x="4" y="18" width="56" height="28" rx="2" fill="none" stroke="#111827" stroke-width="2"/>

  <!-- Smaller eye placed in the right quarter of the rectangle.
       Rectangle right quarter spans x = 46..60; center at x = 53. Vertical center of rect is y = 32. -->
  <g transform="translate(45,32)" fill="none" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="false">
    <!-- Eye outline (smaller than original) -->
    <path d="M -11 0 C -7 -5 7 -5 11 0 C 7 5 -7 5 -11 0 Z" fill="none"/>
    <!-- Pupil -->
    <circle cx="0" cy="0" r="2" fill="#111827" stroke="none"/>
  </g>
</svg>`;

export const iconDataUrl = `data:image/svg+xml,${encodeURIComponent(IconMaskedInputSvg)}`;

/*
 * Import components and utilities from our extension API. Warning: for demo experiments only.
 */
import { FormContext, Textfield } from "@bpmn-io/form-js";

import { html, useContext } from "diagram-js/lib/ui";

import "./styles.css";

import AttachmentUploader from "components/attachmentUpload";

export const maskedInputType = "maskedInput";

function isValidJSON(value) {
  if (typeof value !== "string") return false;
  try {
    JSON.parse(value);
    return true;
  } catch (e) {
    return false;
  }
}

export function MaskedInputRenderer(props) {
  const { disabled, errors = [], field, readonly, value, domId } = props;
  const { description, id, label } = field;
  const { formId } = useContext(FormContext);

  const errorMessageId = errors.length === 0 ? undefined : `${prefixId(domId, formId)}-error-message`;

  const containerId = `upload-file-container-${domId}`;

  // Khi MaskedInput thay đổi
  function handleMaskedInputChange(newValue) {
    console.log("handleMaskedInputChange", newValue);
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
      console.log("MaskedInputRenderer render", _value);
      ReactDOM.render(
        <AttachmentUploader
          value={_value}
          placeholderLabel=""
          onChange={handleMaskedInputChange}
          multiple={field.multiple ? field.multiple : false}
          maxFiles={field.maxFiles ? parseInt(field.maxFiles) : 0}
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
    <div class=${formFieldClasses("maskedInput", { errors, disabled, readonly })}>
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
MaskedInputRenderer.config = {
  /* we can extend the default configuration of existing fields */
  ...Textfield.config,
  type: maskedInputType,
  label: "Masked Input",
  name: "Masked Input",
  // iconUrl: `data:image/svg+xml,${encodeURIComponent(IconMaskedInput)}`,
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
