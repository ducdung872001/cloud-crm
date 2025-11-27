import classNames from "classnames";
// import IconGrid from "./icon-grid.svg?raw";
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

export const gridType = "grid";

/*
 * This is the rendering part of the custom field. We use `htm` to
 * to render our components without the need of extra JSX transpilation.
 */
export function GridRenderer(props) {
  const { disabled, errors = [], field, readonly, value: rawValue } = props;

  const { description, Number = {}, id, label } = field;

  const { formId } = useContext(FormContext);

  let listHeaderTable = field.headerTable
    ? typeof field.headerTable === "string"
      ? JSON.parse(field.headerTable)
      : field.headerTable
    : [
        {
          name: "STT",
          position: 1,
        },
      ];

  listHeaderTable = listHeaderTable.sort((a, b) => a.position - b.position);

  const errorMessageId = errors.length === 0 ? undefined : `${prefixId(id, formId)}-error-message`;

  // Thêm thẻ style vào đầu component
  const tableStyle = html`
    <style>
      .grid-group {
        max-width: 100%;
        overflow-x: scroll;
        margin-bottom: 8px;
      }
      .custom-grid-table {
        border-collapse: collapse;
        width: 100%;
        margin: 12px 0;
      }
      .custom-grid-table th,
      .custom-grid-table td {
        border: 1px solid #ccc;
        padding: 8px 12px;
        text-align: left;
      }
      .custom-grid-table th {
        background: #f5f5f5;
        font-weight: bold;
        width: 200px;
      }
      .header-item {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .custom-grid-table tr:nth-child(even) td {
        background: #fafafa;
      }
    </style>
  `;

  return html`
    <div class=${formFieldClasses("grid", { errors, disabled, readonly })}>
      ${tableStyle}
      <label id=${prefixId(id, formId)}>${label || ""}</label>
      <div class="grid-group">
        <table class="custom-grid-table">
          <thead>
            <tr>
              ${listHeaderTable.map(function (header) {
                return html`<th><div class="header-item">${header.name}</div></th>`;
              })}
            </tr>
          </thead>
          <tbody>
            <!-- dữ liệu dòng nếu có -->
          </tbody>
        </table>
      </div>
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
GridRenderer.config = {
  /* we can extend the default configuration of existing fields */
  ...Textfield.config,
  type: gridType,
  label: "Grid",
  name: "Grid",
  // iconUrl: `data:image/svg+xml,${encodeURIComponent(IconGrid)}`,
  iconUrl: iconDataUrl,
  propertiesPanelEntries: [
    "key",
    "label",
    "description",
    //  "min", "max",
    "disabled",
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
