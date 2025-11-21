// extension/range/propertiesPanel/CustomPropertiesProvider.js
import { get } from "min-dash";
import { h } from "preact"; // create VNode, properties-panel can render this
import { useState, useEffect } from "preact/hooks";

/**
 * Provider class (export default so DI can instantiate it)
 */

// enableAddRow
// enableAddColumns
// enableExport
// enableImport
// enableAddCmtCell
// enableAddCmtCol
// enableEditCell
// enableSave

let listEnable = [
  { id: "enable-add-row", key: "enableAddRow", label: "Enable Add Row" },
  // { id: "enable-add-col", key: "enableAddCol", label: "Enable Add Column" },
  // { id: "enable-export", key: "enableExport", label: "Enable Export" },
  // { id: "enable-import", key: "enableImport", label: "Enable Import" },
  // { id: "enable-add-cmt-cell", key: "enableAddCmtCell", label: "Enable Add Comment Cell" },
  // { id: "enable-add-cmt-col", key: "enableAddCmtCol", label: "Enable Add Comment Column" },
  { id: "enable-edit-cell", key: "enableEditCell", label: "Enable Edit Cell" },
  // { id: "enable-save", key: "enableSave", label: "Enable Save" },
];
export default function CustomPropertiesProvider(propertiesPanel) {
  this.propertiesPanel = propertiesPanel;

  // register provider with a priority (500)
  propertiesPanel.registerProvider(this, 500);
}

CustomPropertiesProvider.$inject = ["propertiesPanel"];

/**
 * getGroups - middleware that modifies groups array
 */

CustomPropertiesProvider.prototype.getGroups = function (field, editField) {
  return (groups) => {
    // only care about our custom field type
    if (!field || field.type !== "grid") {
      return groups;
    }

    // find or create validation group
    let configurationIdx = findGroupIdx(groups, "configuration");

    if (configurationIdx === -1) {
      groups.push({ id: "configuration", label: "Configuration", entries: [] });
      configurationIdx = findGroupIdx(groups, "configuration");
    }

    const configurationGroup = groups[configurationIdx];

    // append our custom entries (using simple preact components)
    configurationGroup.entries.push(
      createCustomEntryFieldName(field, editField, "field-name", "fieldName", "Field Name"),
      createCustomEntry(field, editField, "header-table", "headerTable", "Header Table"),
      createCustomEntry(field, editField, "linking-config", "linkingConfig", "Linking Config")
    );
    listEnable.forEach((item) => {
      configurationGroup.entries.push(createCustomEntryEnable(field, editField, item.id, item.key, item.label));
    });

    return groups;
  };
};

/**
 * Helper to create an entry descriptor that uses a small custom component
 * component uses preact h() to create VNode and does not rely on PropertiesPanelContext/hooks
 */
function createCustomEntryFieldName(field, editField, id, key, label) {
  // Inline Preact functional component — no hooks, no context
  const SimpleTextEntry = (props) => {
    const { setValue } = props;
    const [inputValue, setInputValue] = useState();

    const currentValue = get(field, [key]);

    useEffect(() => {
      setInputValue(currentValue);
    }, [currentValue]);

    return h("div", { className: "bio-properties-panel-entry", "data-entry-id": id }, [
      h("label", { className: "bio-properties-panel-label", htmlFor: id }, label),
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            padding: "5px",
          },
        },
        [
          h("input", {
            id,
            className: "bio-properties-panel-input",
            value: inputValue,
            onInput: (evt) => setInputValue(evt.target.value),
            onBlur: (evt) => setValue(evt.target.value === "" ? undefined : evt.target.value),
            style: {
              width: "100%", // leave space for button
            },
          }),
        ]
      ),
    ]);
  };

  // Return entry descriptor for properties panel
  return {
    id,
    component: SimpleTextEntry,
    getValue: () => get(field, key),
    setValue: (val) => {
      editField(field, [key], val === "" ? undefined : val);
    },
    element: field,
    path: [key],
    label,
  };
}
function createCustomEntry(field, editField, id, key, label) {
  // Inline Preact functional component — no hooks, no context
  const SimpleTextEntry = (props) => {
    const { setValue } = props;
    const [inputValue, setInputValue] = useState();

    const currentValue = get(field, [key]);

    useEffect(() => {
      setInputValue(currentValue);
    }, [currentValue]);

    return h("div", { className: "bio-properties-panel-entry", "data-entry-id": id }, [
      h("label", { className: "bio-properties-panel-label", htmlFor: id }, label),
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            padding: "5px",
          },
        },
        [
          h("input", {
            id,
            className: "bio-properties-panel-input",
            value: inputValue,
            onInput: (evt) => setInputValue(evt.target.value),
            onBlur: (evt) => setValue(evt.target.value === "" ? undefined : evt.target.value),
          }),
          h(
            "button",
            {
              type: "button",
              onClick: () => {
                console.log("Open config modal for fieldId:", field.id);
                window.dispatchEvent(
                  new CustomEvent(key == "headerTable" ? "openConfigModal" : "openLinkingConfigModal", { detail: { fieldId: field.id } })
                );
              },
              style: {
                height: "28px",
                marginLeft: "5px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              },
            },
            "Config" /* just for testing */
          ),
        ]
      ),
    ]);
  };

  // Return entry descriptor for properties panel
  return {
    id,
    component: SimpleTextEntry,
    getValue: () => get(field, key),
    setValue: (val) => {
      editField(field, [key], val === "" ? undefined : val);
    },
    element: field,
    path: [key],
    label,
  };
}
function createCustomEntryEnable(field, editField, id, key, label) {
  // Inline Preact functional component — no hooks, no context
  const SimpleTextEntry = (props) => {
    const { setValue } = props;
    const [inputValue, setInputValue] = useState(false);

    const currentValue = get(field, [key]);

    useEffect(() => {
      setInputValue(currentValue);
    }, [currentValue]);

    return h("div", { className: "bio-properties-panel-entry", "data-entry-id": id }, [
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            padding: "5px",
            width: "100%",
          },
        },
        [
          h("input", {
            id,
            type: "checkbox",
            className: "bio-properties-panel-input",
            checked: inputValue, // boolean: true/false
            onChange: (evt) => {
              setInputValue(evt.target.checked);
              setValue(evt.target.checked);
            },
            style: {
              width: "16px",
              height: "16px",
              marginRight: "8px",
            },
          }),
          h(
            "label",
            {
              id,
              className: "bio-properties-panel-label",
            },
            label
          ),
        ]
      ),
    ]);
  };

  // Return entry descriptor for properties panel
  return {
    id,
    component: SimpleTextEntry,
    getValue: () => get(field, key),
    setValue: (val) => {
      editField(field, [key], val === "" ? undefined : val);
    },
    element: field,
    path: [key],
    label,
  };
}

/* helper */
function findGroupIdx(groups, id) {
  return groups.findIndex((g) => g.id === id);
}
