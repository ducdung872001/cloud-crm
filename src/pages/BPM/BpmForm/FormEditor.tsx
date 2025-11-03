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

const FormEditorComponent = ({ initialSchema, onSchemaChange, callback, onClickSaveForm, onClickSelectForm, dataNode }) => {
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
        // RenderExtension,
        // PropertiesPanelExtension,
        // GridExtension,
        // PropertiesPanelGridPropertiesPanel,
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
      console.log('event', event);
      
      const schema = formEditorRef.current.getSchema();

      // So sánh schema mới với schema cũ để biết component nào thay đổi
      const oldSchema = schemaRef.current;
      const newSchema = schema;

      console.log('oldSchema', oldSchema);
      console.log('newSchema', newSchema);
      

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
        const field = schema.components.find((f) => f.id === fieldId);
        if (field) {
          setDataConfigGrid(field);
        }
      }
    };
    window.addEventListener("openConfigModal", handler as EventListener);
    return () => window.removeEventListener("openConfigModal", handler as EventListener);
  }, [formEditorRef]);

  const updateFieldLabel = (fieldId: string, data: any) => {
    const editor = formEditorRef.current;
    console.log("updateFieldLabel>>", fieldId, data);

    if (editor) {
      const schema = editor.getSchema();
      // Tìm field cần sửa
      const field = schema.components.find((f) => f.id === fieldId);
      if (field) {
        field.headerTable = JSON.stringify(data.headerTable);
        field.dataRow = JSON.stringify(data.dataRow);
        // Import lại schema đã sửa vào editor
        editor.importSchema(schema);
      }
    }
  };

  console.log("dataConfigGrid>>", dataConfigGrid);

  return (
    <div className="form-editor-container">
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
          <ButtonExportNode
            nodeId = {dataNode?.id}
          />

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
      <div ref={editorContainerRef}></div> {/* Container cho editor */}
     
    </div>
  );
};

export default FormEditorComponent;
