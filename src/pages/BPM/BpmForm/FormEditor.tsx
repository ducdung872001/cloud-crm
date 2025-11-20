import React, { useEffect, useRef, useState } from "react";
import { FormEditor } from "@bpmn-io/form-js-editor";
import i18next from "i18next";
import "./FormEditor.scss";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";
import Button from "components/button/button";

import "@bpmn-io/form-js/dist/assets/form-js.css";
import "@bpmn-io/form-js/dist/assets/form-js-editor.css";
import "@bpmn-io/form-js/dist/assets/form-js-playground.css";
import ButtonExportNode from "../BusinessProcessCreate/components/ButtonExportNode/ButtonExportNode";

// Grid
import GridExtension from "./extension/grid/render";
import PropertiesPanelGridPropertiesPanel from "./extension/grid/propertiesPanel";
import ModalConfigGrid from "./partials/ModalConfigGrid";
import ModalConfigLinkingGrid from "./partials/ModalConfigLinkingGrid";

interface FormEditorProps {
  initialSchema: any;
  onSchemaChange: (schema: any) => void;
  callback: (action: string) => void;
  onClickSaveForm: () => void;
  onClickSelectForm: () => void;
  dataNode?: any;
  disableHeader?: boolean;
}

const FormEditorComponent = ({
  initialSchema,
  onSchemaChange,
  callback,
  onClickSaveForm,
  onClickSelectForm,
  dataNode,
  disableHeader = false,
}: FormEditorProps) => {
  const editorContainerRef = useRef(null);
  const formEditorRef = useRef(null);
  const schemaRef = useRef<any>(null);
  useEffect(() => {
    // Khởi tạo Editor với palette provider tùy chỉnh
    formEditorRef.current = new FormEditor({
      container: editorContainerRef.current,
      // load rendering extension
      additionalModules: [
        // HiddenRenderExtension,
        // NumberRenderExtension
        // TreeSelectorEditorExtension,
        // Đóng tạm vì gây lỗi khi build lên môi trường production
        GridExtension,
        PropertiesPanelGridPropertiesPanel,
      ],

      // load properties panel extension
      // editorAdditionalModules: [
      //   // PropertiesPanelExtension,
      //   // PropertiesPanelHiddenExtension,
      //   // PropertiesPanelNumberExtension
      //   // TreeSelectorEditorPropertiesPanel,
      // ],
    });

    formEditorRef.current.on("rendered", () => {
      console.log("Editor rendered");

      // Debug: Kiểm tra các nhóm có sẵn trong palette
      const groups = document.querySelectorAll(".fjs-palette-group");
      groups.forEach((group) => {});
    });

    // Import schema vào Editor
    formEditorRef.current
      .importSchema(initialSchema)
      .then(() => {
        console.log("Form editor đã khởi tạo");
      })
      .catch((err) => {
        console.error("Lỗi khi tải form editor:", err);
        formEditorRef.current.importSchema({
          type: "default",
          components: [],
        });
      });

    schemaRef.current = initialSchema;
    // Lắng nghe sự kiện thay đổi và gọi callback
    formEditorRef.current.on("changed", (event) => {
      console.log("event", event);

      const schema = formEditorRef.current.getSchema();

      // So sánh schema mới với schema cũ để biết component nào thay đổi
      const oldSchema = schemaRef.current;
      const newSchema = schema;

      console.log("oldSchema", oldSchema);
      console.log("newSchema", newSchema);

      onSchemaChange(schema); // Gửi schema mới lên parent component
    });

    return () => {
      if (formEditorRef.current) {
        formEditorRef.current.destroy();
      }
    };
  }, [initialSchema]);

  // State để mở modal/handle event từ con
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [fieldId, setFieldId] = useState<string>("");
  const [dataConfigGrid, setDataConfigGrid] = useState(null);

  const walkFindGrid = (components, fieldId) => {
    if (!components || components.length === 0) return null;

    for (const comp of components) {
      if (comp.id === fieldId) {
        return comp;
      }

      if (Array.isArray(comp.components) && comp.components.length > 0) {
        const found = walkFindGrid(comp.components, fieldId);
        if (found) return found;
      }
    }

    // Nếu vòng lặp hoàn tất mà không tìm thấy
    return null;
  };

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { fieldId } = e.detail;
      // Xử lý với fieldId hoặc lưu vào state
      console.log("fieldId nhận được từ con:", fieldId);
      setFieldId(fieldId);
      setIsConfigOpen(true);
      const editor = formEditorRef.current;
      if (editor) {
        const schema = editor.getSchema();
        // Tìm field cần sửa
        // const field = schema.components.find((f) => f.id === fieldId);
        const field = walkFindGrid(schema.components, fieldId);
        if (field) {
          setDataConfigGrid(field);
        }
      }
    };
    window.addEventListener("openConfigModal", handler as EventListener);
    return () => window.removeEventListener("openConfigModal", handler as EventListener);
  }, [formEditorRef]);

  const [isConfigLinkingGridOpen, setIsConfigLinkingGridOpen] = useState(false);
  const [dataConfigLinkingGrid, setDataConfigLinkingGrid] = useState(null);
  const [listGridField, setListGridField] = useState([]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { fieldId } = e.detail;
      // Xử lý với fieldId hoặc lưu vào state
      console.log("fieldId nhận được từ con:", fieldId);
      setFieldId(fieldId);
      setIsConfigLinkingGridOpen(true);
      const editor = formEditorRef.current;
      if (editor) {
        const schema = editor.getSchema();
        // Tìm field cần sửa
        // const field = schema.components.find((f) => f.id === fieldId);
        const field = walkFindGrid(schema.components, fieldId);
        if (field) {
          setDataConfigLinkingGrid(field);
          setListGridField(
            schema.components
              .filter((c) => c.type === "grid" && c.id !== fieldId)
              .map((item) => ({
                id: item.id,
                label: item.label,
                fieldName: item.fieldName,
                dataRow: item.dataRow ? JSON.parse(item.dataRow) : [],
                headerTable: item.headerTable ? JSON.parse(item.headerTable) : [],
              }))
          );
        }
      }
    };
    window.addEventListener("openLinkingConfigModal", handler as EventListener);
    return () => window.removeEventListener("openLinkingConfigModal", handler as EventListener);
  }, [formEditorRef]);

  // const updateFieldLabel = (fieldId: string, data: any, location?: string) => {
  //   const editor = formEditorRef.current;
  //   console.log("schema.components>>updateFieldLabel>>", fieldId, data);

  //   if (editor) {
  //     const schema = editor.getSchema();
  //     // Tìm field cần sửa
  //     console.log("schema.components>>", schema.components);
  //     // walkAddIframGrid(schema.components, fieldId, location, data);

  //     const field = schema.components.find((f) => f.id === fieldId);
  //     if (field) {
  //       if (location && location == "linking") {
  //         field.linkingConfig = JSON.stringify(data.linkingConfig);
  //       } else {
  //         field.headerTable = JSON.stringify(data.headerTable);
  //         field.dataRow = JSON.stringify(data.dataRow);
  //       }
  //       // Import lại schema đã sửa vào editor
  //       editor.importSchema(schema);
  //       console.log("dataConfigGrid>>", dataConfigGrid);
  //       console.log("dataConfigGrid>>schema.components>>", formEditorRef.current.getSchema().components);
  //     }
  //   }
  // };

  // Trả về một bản mới của components với node đầu tiên có id khớp được cập nhật bởi updater
  function updateComponentByIdImmutable(
    components: any[] | undefined,
    id: string,
    updater: (node: any) => any,
    stopAfterFirst = true
  ): { components: any[] | undefined; updated: boolean } {
    if (!Array.isArray(components)) return { components, updated: false };

    let updated = false;

    const newComponents = components.map((comp) => {
      if (updated && stopAfterFirst) {
        // nếu đã cập nhật và stopAfterFirst, trả về bản sao shallow
        return comp;
      }

      if (comp && comp.id === id) {
        updated = true;
        // updater trả về node mới hoặc mutate node trước trả về comp
        return updater({ ...comp });
      }

      // nếu comp có children, đệ quy
      if (comp && Array.isArray(comp.components)) {
        const { components: newChildComponents, updated: childUpdated } = updateComponentByIdImmutable(comp.components, id, updater, stopAfterFirst);

        if (childUpdated) {
          updated = true;
          return { ...comp, components: newChildComponents };
        }
      }

      // không thay đổi
      return comp;
    });

    return { components: newComponents, updated };
  }

  const updateFieldLabel = (fieldId: string, data: any, location?: string): boolean => {
    const editor = formEditorRef.current;
    if (!editor) {
      console.warn("No editor instance");
      return false;
    }

    const schema = editor.getSchema();
    if (!schema || !Array.isArray(schema.components)) {
      console.warn("Invalid schema or missing components");
      return false;
    }

    // updater: nhận node cũ, trả node mới
    const updater = (node: any) => {
      const newNode = { ...node };
      try {
        if (location === "linking") {
          const linking = data && data.linkingConfig !== undefined ? data.linkingConfig : {};
          newNode.linkingConfig = typeof linking === "string" ? linking : JSON.stringify(linking);
        } else {
          const header = data && data.headerTable !== undefined ? data.headerTable : [];
          const row = data && data.dataRow !== undefined ? data.dataRow : [];
          newNode.headerTable = typeof header === "string" ? header : JSON.stringify(header);
          newNode.dataRow = typeof row === "string" ? row : JSON.stringify(row);
        }
      } catch (err) {
        console.error("Failed to serialize data for field", fieldId, err);
      }
      return newNode;
    };

    const { components: newComponents, updated } = updateComponentByIdImmutable(schema.components, fieldId, updater, true);

    if (!updated) {
      console.warn("Field id not found:", fieldId);
      return false;
    }

    // Build new schema (shallow copy) and import
    const newSchema = { ...schema, components: newComponents };

    try {
      editor.importSchema(newSchema);
      console.log("Schema updated for field", fieldId);
      return true;
    } catch (err) {
      console.error("importSchema failed", err);
      return false;
    }
  };

  console.log("dataConfigGrid>>", dataConfigGrid);

  return (
    <div className="form-editor-container">
      {disableHeader ? null : (
        <div className="container-header">
          <div className="container-title">
            <h2>Trình tạo biểu mẫu</h2>
            <div className="button-save" onClick={() => onClickSelectForm()}>
              <span style={{ fontSize: 14 }}>Chọn mẫu</span>
            </div>
            <div
              className="button-save"
              onClick={() => {
                onClickSaveForm();
              }}
            >
              <span style={{ fontSize: 14 }}>Lưu mẫu</span>
            </div>
          </div>
          <div className="container-button">
            <div
              className="button-OLA"
              onClick={() => {
                callback("OLA");
              }}
            >
              <span style={{ fontSize: 12, fontWeight: "600" }}>OLA</span>
            </div>
            <Tippy content="Người xử lý">
              <div
                className="button-setting"
                onClick={() => {
                  callback("participant");
                }}
              >
                <Icon name="Person" style={{ width: 20 }} />
              </div>
            </Tippy>
            <Tippy content="Sao chép biểu mẫu khác">
              <div
                className="button-setting"
                onClick={() => {
                  callback("copy");
                }}
              >
                <Icon name="Copy" style={{ width: 21 }} />
              </div>
            </Tippy>
            <Tippy content="Cài đặt biến">
              <div
                className="button-setting"
                onClick={() => {
                  callback("setting-var");
                }}
              >
                <Icon name="VarSetting" style={{ width: 22 }} />
              </div>
            </Tippy>
            <Tippy content="Dữ liệu vào/ra">
              <div
                className="button-setting"
                onClick={() => {
                  callback("mapping");
                }}
              >
                <Icon name="Mapping" style={{ width: 22 }} />
              </div>
            </Tippy>
            <Tippy content="Debug">
              <div
                className="button-setting"
                onClick={() => {
                  callback("debug");
                }}
              >
                <Icon name="Debug" style={{ width: 20 }} />
              </div>
            </Tippy>
            <Tippy content="Cài đặt Eform">
              <div
                className="button-setting"
                onClick={() => {
                  callback("timer");
                }}
              >
                <Icon name="Settings" style={{ width: 22 }} />
              </div>
            </Tippy>
            <ButtonExportNode nodeId={dataNode?.id} />

            {/* <Tippy content="Lưu Node">
            <div
              className='button-setting'
              onClick={() => {
                callback('save');
              }}
            >
              <Icon name="CheckedCircle" style={{ width: 22 }} />
            </div>
          </Tippy> */}
          </div>
        </div>
      )}
      <div ref={editorContainerRef}></div> {/* Container cho editor */}
      <ModalConfigGrid
        onShow={isConfigOpen}
        onHide={(reload) => {
          if (reload) {
            // getDataBpmFormArtifact(+dataNode.id, idTabConfig);
          }
          setIsConfigOpen(false);
          setDataConfigGrid(null);
        }}
        dataConfig={dataConfigGrid}
        callBack={(data) => {
          updateFieldLabel(fieldId, data);
          setIsConfigOpen(false);
        }}
      />
      <ModalConfigLinkingGrid
        onShow={isConfigLinkingGridOpen}
        onHide={(reload) => {
          if (reload) {
            // getDataBpmFormArtifact(+dataNode.id, idTabConfig);
          }
          setIsConfigLinkingGridOpen(false);
          setDataConfigLinkingGrid(null);
          setListGridField([]);
        }}
        listGridField={listGridField}
        dataConfig={dataConfigLinkingGrid}
        callBack={(data) => {
          updateFieldLabel(fieldId, data, "linking");
          setIsConfigLinkingGridOpen(false);
          setListGridField([]);
        }}
      />
    </div>
  );
};

export default FormEditorComponent;
