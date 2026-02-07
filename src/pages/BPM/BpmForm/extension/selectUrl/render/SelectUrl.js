import classNames from "classnames";
import React from "react";
import ReactDOM from "react-dom";
import { html, useContext } from "diagram-js/lib/ui";
import { FormContext, Textfield } from "@bpmn-io/form-js";
import SelectUrlCustom from "components/selectUrlCustom/selectUrlCustom";

export const selectUrlType = "selectUrl";

const IconSelectUrlSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" width="65" height="35" role="img" aria-labelledby="url-title url-desc">
  <title id="url-title">URL Input Selector</title>
  <rect x="2" y="2" width="64" height="36" rx="2" fill="none" stroke="#111827" stroke-width="2"/>
  <text x="30" y="21" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#111827" stroke="none">URL</text>
  <path d="M 48 16 L 56 16 L 52 23 Z" fill="#111827" stroke="none"/>
</svg>`;

export const iconSelectUrlDataUrl = `data:image/svg+xml,${encodeURIComponent(IconSelectUrlSvg)}`;

export function SelectUrlRenderer(props) {
  const { disabled, errors = [], field, readonly, value, domId } = props;
  const { description, id, label } = field;
  const { formId } = useContext(FormContext);

  const required = field?.validate?.required ?? false;
  const rawUrl = field?.properties?.url;
  const rawIsLoadAll = field?.properties?.isLoadAll;
  const rawIsMulti = field?.properties?.isMulti;
  const url = rawUrl ?? "";
  const isLoadAll = rawIsLoadAll === true || rawIsLoadAll === "true";
  const isMulti = rawIsMulti === true || rawIsMulti === "true";

  const labelKey = field?.properties?.labelKey ?? "name";
  const valueKey = field?.properties?.valueKey ?? "id";
  const searchKey = field?.properties?.searchKey ?? "name";
  const bindingField = field?.properties?.bindingField ?? "";

  const containerId = `select-url-container-${domId}`;
  const errorMessageId = errors.length === 0 ? undefined : `${prefixId(domId, formId)}-error-message`;

  // Giữ hành vi cũ: lưu value dưới dạng JSON string vào model
  function handleChange(option) {
    if (props.onChange) {
      props.onChange({
        field: field,
        value: JSON.stringify(option),
      });
    }
  }

  // Nếu model lưu JSON string thì parse để truyền xuống component
  let _value = null;
  try {
    if (value) {
      _value = JSON.parse(value);
    }
  } catch (error) {
    console.error("SelectUrlRenderer parse value error:", error);
  }

  // Mount / update React component (React 17 - đơn giản)
  const container = typeof document !== "undefined" ? document.getElementById(containerId) : null;

  if (container && props.onChange && field) {
    const nextRenderProps = {
      id: domId,
      label: "",
      placeholder: "Chọn dữ liệu...",
      disabled: disabled || readonly,
      required,
      fill: true,
      value: _value,
      url,
      isLoadAll,
      isMulti,
      labelKey,
      bindingField,
      valueKey,
      searchKey,
      onChange: handleChange,
    };

    // Lưu props trước đó trên container để tránh render thừa
    const prev = container.__selectUrlLastProps;

    const isSame =
      prev &&
      prev.disabled === nextRenderProps.disabled &&
      prev.required === nextRenderProps.required &&
      prev.isMulti === nextRenderProps.isMulti &&
      prev.url === nextRenderProps.url &&
      prev.labelKey === nextRenderProps.labelKey &&
      JSON.stringify(prev.value) === JSON.stringify(nextRenderProps.value);

    if (!isSame) {
      ReactDOM.render(<SelectUrlCustom {...nextRenderProps} />, container);

      // lưu last props để lần sau so sánh
      container.__selectUrlLastProps = nextRenderProps;

      // helper cleanup (unmount khi cần)
      container.__cleanup = () => {
        ReactDOM.unmountComponentAtNode(container);
        container.__selectUrlLastProps = undefined;
      };
    }
  }

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

SelectUrlRenderer.config = {
  ...Textfield.config,
  type: selectUrlType,
  label: "Select URL",
  name: "Select URL",
  iconUrl: iconSelectUrlDataUrl,
  group: "selection",
  propertiesPanelEntries: ["key", "label", "description", "disabled", "required", "readonly"],
};

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
