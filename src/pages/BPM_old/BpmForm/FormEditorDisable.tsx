import React, { useEffect, useRef } from "react";
import { FormEditor } from "@bpmn-io/form-js-editor";
import { Form } from "@bpmn-io/form-js-viewer";

import i18n from "i18next";
import "./FormEditorDisable.scss";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";
import Button from "components/button/button";

const FormEditorComponentDisable = ({ initialSchema, onSchemaChange, callback, onClickSaveForm, onClickSelectForm, disable }) => {
  const editorContainerRef = useRef(null);
  const formEditorRef = useRef(null);

  useEffect(() => {
    // Khởi tạo Editor
    formEditorRef.current = new FormEditor({
      container: editorContainerRef.current,
    });

    formEditorRef.current.on("rendered", () => {
      // Thay đổi tên các thành phần bên trái
      // const componentLabels = {
      //   'Text field': 'Trường Văn Bản',
      //   'Number Field': 'Trường Số',
      //   'Checkbox': 'Ô Chọn',
      //   'Select Box': 'Hộp Chọn',
      // };
      // Tìm tất cả các thành phần trong thanh bên trái và thay đổi text
      // document.querySelectorAll('.fjs-palette-field-text').forEach(label => {
      //   const currentText = label.textContent.trim();
      //   if (componentLabels[currentText]) {
      //     label.textContent = componentLabels[currentText];
      //   }
      // });
    });

    // Import schema vào Editor
    formEditorRef.current
      .importSchema(initialSchema)
      .then(() => {})
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
      <div className="container-header">
        <div className="container-title">
          <h2>Trình tạo biểu mẫu</h2>
          {disable ? null : (
            <div className="button-save" onClick={() => onClickSelectForm()}>
              <span style={{ fontSize: 14 }}>Chọn mẫu</span>
            </div>
          )}
          {disable ? null : (
            <div
              className="button-save"
              onClick={() => {
                onClickSaveForm();
              }}
            >
              <span style={{ fontSize: 14 }}>Lưu mẫu</span>
            </div>
          )}
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

          {disable ? null : (
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
          )}

          {disable ? null : (
            <Tippy content="Cài đặt biến">
              <div
                className="button-setting"
                onClick={() => {
                  callback("setting");
                }}
              >
                <Icon name="Settings" style={{ width: 22 }} />
              </div>
            </Tippy>
          )}

          {disable ? null : (
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
          )}
        </div>
      </div>
      <div ref={editorContainerRef}></div> {/* Container cho editor */}
    </div>
  );
};

export default FormEditorComponentDisable;
