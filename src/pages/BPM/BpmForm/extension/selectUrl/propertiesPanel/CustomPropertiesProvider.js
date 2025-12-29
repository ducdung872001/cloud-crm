import { get } from "min-dash";
import { h } from "preact";

const SELECT_URL_TYPE = "selectUrl";

// Inject 'modeling' để thực hiện update dữ liệu
export default function CustomPropertiesProvider(propertiesPanel, modeling) {
  this.propertiesPanel = propertiesPanel;
  this.modeling = modeling;
  propertiesPanel.registerProvider(this, 500);
}

CustomPropertiesProvider.$inject = ["propertiesPanel", "modeling"];

CustomPropertiesProvider.prototype.getGroups = function (field) {
  return (groups) => {
    // Chỉ xử lý nếu là component SelectUrl
    if (!field || field.type !== SELECT_URL_TYPE) {
      return groups;
    }

    const generalGroupIdx = findGroupIdx(groups, "general");

    let apiGroup = {
      id: "api-configuration",
      label: "API Configuration",
      entries: [],
    };

    // Lấy modeling từ instance
    const modeling = this.modeling;

    // 1. URL
    apiGroup.entries.push(createCustomEntryText(field, modeling, "url", "url", "API URL Endpoint"));
    // 2. Load All
    apiGroup.entries.push(createCustomEntryCheckbox(field, modeling, "isLoadAll", "isLoadAll", "Load All (Max 200)"));
    // 3. Multi Select
    apiGroup.entries.push(createCustomEntryCheckbox(field, modeling, "isMulti", "isMulti", "Multi Select"));
    // 4. Advanced Config Keys
    apiGroup.entries.push(createCustomEntryText(field, modeling, "labelKey", "labelKey", "Label Key (Default: name)"));
    apiGroup.entries.push(createCustomEntryText(field, modeling, "valueKey", "valueKey", "Value Key (Default: id)"));
    apiGroup.entries.push(createCustomEntryText(field, modeling, "searchKey", "searchKey", "Search Param (Default: name)"));

    // Chèn vào sau nhóm General
    if (generalGroupIdx !== -1) {
      groups.splice(generalGroupIdx + 1, 0, apiGroup);
    } else {
      groups.push(apiGroup);
    }

    return groups;
  };
};

// --- Helper Functions ---

function createCustomEntryText(field, modeling, id, key, label) {
  return {
    id,
    component: (props) => {
      const currentValue = get(field, ["properties", key]) || "";
      return h("div", { className: "bio-properties-panel-entry", "data-entry-id": id }, [
        h("label", { className: "bio-properties-panel-label", htmlFor: id }, label),
        h("div", { className: "bio-properties-panel-textfield" }, [
          h("input", {
            id,
            className: "bio-properties-panel-input",
            type: "text",
            value: currentValue,
            onInput: (evt) => props.setValue(evt.target.value),
            onChange: (evt) => props.setValue(evt.target.value),
          }),
        ]),
      ]);
    },
    getValue: () => get(field, ["properties", key]),
    setValue: (val) => {
      // Logic update chuẩn sử dụng modeling.editFormField
      const newProperties = { ...field.properties, [key]: val };
      modeling.editFormField(field, { properties: newProperties });
    },
    isEdited: () => false,
  };
}

function createCustomEntryCheckbox(field, modeling, id, key, label) {
  return {
    id,
    component: (props) => {
      const currentValue = get(field, ["properties", key]) || false;
      return h("div", { className: "bio-properties-panel-entry", "data-entry-id": id }, [
        h("div", { style: { display: "flex", alignItems: "center", height: "100%" } }, [
          h("input", {
            id,
            type: "checkbox",
            className: "bio-properties-panel-input",
            checked: currentValue,
            onChange: (evt) => props.setValue(evt.target.checked),
            style: { margin: "0 8px 0 0" },
          }),
          h("label", { className: "bio-properties-panel-label", htmlFor: id, style: { margin: 0 } }, label),
        ]),
      ]);
    },
    getValue: () => get(field, ["properties", key]),
    setValue: (val) => {
      const newProperties = { ...field.properties, [key]: val };
      modeling.editFormField(field, { properties: newProperties });
    },
  };
}

function findGroupIdx(groups, id) {
  return groups.findIndex((g) => g.id === id);
}
