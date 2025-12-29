import classNames from "classnames";
import React from "react";
import ReactDOM from "react-dom";
import { html, useContext } from "diagram-js/lib/ui";
import { FormContext, Select } from "@bpmn-io/form-js";
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

SelectUrlRenderer.config = {
  ...Select.config,
  type: selectUrlType,
  label: "Select URL",
  iconUrl: iconSelectUrlDataUrl,
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
