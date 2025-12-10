import classNames from "classnames";
// import IconGrid from "./icon-grid.svg?raw";
/*
 * NOTE:
 * Instead of importing the SVG in a way that your bundler may transform it into a React component,
 * we keep the SVG content as a string here and create a proper data URL:
 */
const IconGridSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-labelledby="title desc">
  <title id="title">3x3 grid inside square</title>
  <desc id="desc">Rounded square frame with a 3x3 grid. Grid cells are white and separated by thin black strokes.</desc>

  <!-- Rounded square frame (transparent fill to match other icons) -->
  <rect x="4" y="4" width="56" height="56" rx="6" fill="none" stroke="#111827" stroke-width="2"/>

  <!-- 3x3 grid centered in the square:
       Each cell is white with a thin black stroke to create the grid lines. -->
  <g transform="translate(32,32)" aria-hidden="false">
    <!-- Row 1 -->
    <rect x="-22" y="-22" width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/>
    <rect x="-4"  y="-22" width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/>
    <rect x="14"  y="-22" width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/>
    <!-- Row 2 -->
    <rect x="-22" y="-4"  width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/>
    <rect x="-4"  y="-4"  width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/>
    <rect x="14"  y="-4"  width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/>
    <!-- Row 3 -->
    <rect x="-22" y="14"  width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/>
    <rect x="-4"  y="14"  width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/>
    <rect x="14"  y="14"  width="8" height="8" rx="1.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/>
  </g>
</svg>`;

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
