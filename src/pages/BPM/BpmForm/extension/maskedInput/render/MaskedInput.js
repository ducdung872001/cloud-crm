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

import MaskedInput from "components/maskedInput";

export const maskedInputType = "maskedInput";

let originalValue = {};
export function MaskedInputRenderer(props) {
  const { disabled, errors = [], field, readonly, value, domId } = props;
  const { description, id, label } = field;
  const { formId } = useContext(FormContext);

  const required = field?.validate?.required ?? false;
  let key = field?.properties?.key ?? ""; // lấy key từ properties
  let url = field?.properties?.url ?? ""; // lấy url từ properties
  let valueOfKey = props?.fieldInstance?.expressionContextInfo?.data?.[key] ?? "";

  if (!originalValue[id]) {
    originalValue[id] = value;
  }

  const errorMessageId = errors.length === 0 ? undefined : `${prefixId(domId, formId)}-error-message`;

  const containerId = `upload-file-container-${domId}`;

  // Khi MaskedInput thay đổi
  function handleMaskedInputChange(newValue) {
    props.onChange({
      field: field, // object field từ props
      value: newValue,
    });
  }

  setTimeout(() => {
    const container = document.getElementById(containerId);
    if (container && props.onChange && field) {
      // Điều kiện container và props.onChange và field quan trọng
      // ReactDOM.render(
      //   <MaskedInput
      //     field={{
      //       label: "",
      //       name: "phone",
      //       type: "text",
      //       fill: true,
      //       // regex: new RegExp(PHONE_REGEX),
      //       // messageErrorRegex: "Số điện thoại không đúng định dạng",
      //       iconPosition: "right",
      //       required: required,
      //     }}
      //     handleUpdate={(e) => {
      //       handleMaskedInputChange(e);
      //     }}
      //     originalValue={originalValue[id]}
      //     value={value}
      //     valueOfKey={valueOfKey}
      //     url={url}
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
    <div class=${formFieldClasses("maskedInput", { errors, disabled, readonly })}>
      <label id=${prefixId(id, formId)}>${label || ""}</label>
      ${required ? html`<span style="color:red" aria-hidden="true" class="fjs-asterix">*</span>` : null}
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
