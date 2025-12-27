import { get } from "min-dash";
import { h } from "preact";

// Import Type để check
// Lưu ý: Chuỗi này phải khớp với biến 'selectUrlType' bên render
const SELECT_URL_TYPE = "selectUrl";

export default function CustomPropertiesProvider(propertiesPanel) {
  this.propertiesPanel = propertiesPanel;
  propertiesPanel.registerProvider(this, 500);
}

CustomPropertiesProvider.$inject = ["propertiesPanel"];

CustomPropertiesProvider.prototype.getGroups = function (field, editField) {
  return (groups) => {
    // Chỉ xử lý nếu là component SelectUrlCustom
    if (!field || field.type !== SELECT_URL_TYPE) {
      return groups;
    }

    // Tìm hoặc tạo nhóm "Configuration" (thường gọi là General hoặc tạo nhóm riêng)
    // Ở đây ta dùng nhóm "general" có sẵn hoặc tạo nhóm mới tên "api-config"
    const generalGroupIdx = findGroupIdx(groups, "general");

    // Nếu muốn tạo nhóm riêng cho API
    let apiGroup = {
      id: "api-configuration",
      label: "API Configuration",
      entries: [],
    };

    // 1. Thêm ô nhập URL
    apiGroup.entries.push(createCustomEntryText(field, editField, "url", "url", "API URL Endpoint"));

    // 2. Thêm Checkbox Load All
    apiGroup.entries.push(createCustomEntryCheckbox(field, editField, "isLoadAll", "isLoadAll", "Load All (Max 200)"));

    // 3. Thêm Checkbox Multi Select
    apiGroup.entries.push(createCustomEntryCheckbox(field, editField, "isMulti", "isMulti", "Multi Select"));

    // 4. Cấu hình Key (Advanced)
    apiGroup.entries.push(createCustomEntryText(field, editField, "labelKey", "labelKey", "Label Key (Default: name)"));
    apiGroup.entries.push(createCustomEntryText(field, editField, "valueKey", "valueKey", "Value Key (Default: id)"));
    apiGroup.entries.push(createCustomEntryText(field, editField, "searchKey", "searchKey", "Search Param (Default: name)"));

    // Chèn nhóm API vào sau nhóm General (index 0)
    groups.splice(1, 0, apiGroup);

    return groups;
  };
};

// --- Helper Functions ---

// 1. Helper tạo Input Text (Sửa lại từ hàm createCustomEntryFieldName của bạn)
function createCustomEntryText(field, editField, id, key, label) {
  const SimpleTextEntry = (props) => {
    const { setValue } = props;
    // Lấy value từ properties (quan trọng: path là ['properties', key])
    const currentValue = get(field, ["properties", key]) || "";

    return h("div", { className: "bio-properties-panel-entry", "data-entry-id": id }, [
      h("label", { className: "bio-properties-panel-label", htmlFor: id }, label),
      h("div", { className: "bio-properties-panel-textfield" }, [
        h("input", {
          id,
          className: "bio-properties-panel-input",
          type: "text",
          value: currentValue,
          onInput: (evt) => setValue(evt.target.value), // Cập nhật tạm thời
          onChange: (evt) => setValue(evt.target.value), // Cập nhật khi blur/enter
        }),
      ]),
    ]);
  };

  return {
    id,
    component: SimpleTextEntry,
    getValue: () => get(field, ["properties", key]),
    setValue: (val) => {
      // Lưu vào field.properties.<key>
      // Lưu ý: form-js thường lưu custom config trong object `properties`
      const newProperties = { ...field.properties, [key]: val };
      editField(field, ["properties"], newProperties);
    },
    isEdited: () => false, // Đơn giản hóa
  };
}

// 2. Helper tạo Checkbox (Sửa lại từ createCustomEntryEnable)
function createCustomEntryCheckbox(field, editField, id, key, label) {
  const SimpleCheckboxEntry = (props) => {
    const { setValue } = props;
    const currentValue = get(field, ["properties", key]) || false;

    return h("div", { className: "bio-properties-panel-entry", "data-entry-id": id }, [
      h("div", { style: { display: "flex", alignItems: "center", height: "100%" } }, [
        h("input", {
          id,
          type: "checkbox",
          className: "bio-properties-panel-input",
          checked: currentValue,
          onChange: (evt) => setValue(evt.target.checked),
          style: { margin: "0 8px 0 0" },
        }),
        h("label", { className: "bio-properties-panel-label", htmlFor: id, style: { margin: 0 } }, label),
      ]),
    ]);
  };

  return {
    id,
    component: SimpleCheckboxEntry,
    getValue: () => get(field, ["properties", key]),
    setValue: (val) => {
      const newProperties = { ...field.properties, [key]: val };
      editField(field, ["properties"], newProperties);
    },
  };
}

/* helper */
function findGroupIdx(groups, id) {
  return groups.findIndex((g) => g.id === id);
}
