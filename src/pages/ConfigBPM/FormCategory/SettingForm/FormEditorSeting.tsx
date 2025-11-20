import React, { useEffect, useRef } from "react";
import { FormEditor } from "@bpmn-io/form-js-editor";
import i18next from "i18next";
import "./FormEditorSeting.scss";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";
import Button from "components/button/button";
import ReactDOM from "react-dom";

//Range
// import RenderExtension from './extension/range/render';
// import PropertiesPanelExtension from './extension/range/propertiesPanel';

//Hidden
// import HiddenRenderExtension from './extension/hidden/render';
// import PropertiesPanelHiddenExtension from './extension/hidden/propertiesPanel';

//Number
// import NumberRenderExtension from './extension/number/render';
// import PropertiesPanelNumberExtension from './extension/number/propertiesPanel';

import "@bpmn-io/form-js/dist/assets/form-js.css";
import "@bpmn-io/form-js/dist/assets/form-js-editor.css";
import "@bpmn-io/form-js/dist/assets/form-js-playground.css";

const FormEditorSeting = ({ initialSchema, onSchemaChange, callback, onClickSaveForm, onClickSelectForm }) => {
  const editorContainerRef = useRef(null);
  const formEditorRef = useRef(null);

  useEffect(() => {
    // Khởi tạo Editor với palette provider tùy chỉnh
    formEditorRef.current = new FormEditor({
      container: editorContainerRef.current,
      // load rendering extension
      additionalModules: [
        // RenderExtension,
        // HiddenRenderExtension,
        // NumberRenderExtension
      ],

      // load properties panel extension
      editorAdditionalModules: [
        // PropertiesPanelExtension,
        // PropertiesPanelHiddenExtension,
        // PropertiesPanelNumberExtension
      ],
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

    // Lắng nghe sự kiện thay đổi và gọi callback
    formEditorRef.current.on("changed", () => {
      const schema = formEditorRef.current.getSchema();
      onSchemaChange(schema); // Gửi schema mới lên parent component
    });

    return () => {
      if (formEditorRef.current) {
        formEditorRef.current.destroy();
      }
    };
  }, [initialSchema]);

  return (
    <div className="form-editor-container">
      <div ref={editorContainerRef}></div> {/* Container cho editor */}
    </div>
  );
};

export default FormEditorSeting;
