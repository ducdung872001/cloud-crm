import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { FormEditor } from "@bpmn-io/form-js-editor";
import i18next from "i18next";
import "./index.scss";
import Icon from "components/icon";
import Tippy from "@tippyjs/react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";

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
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IActionModal } from "model/OtherModel";
import FormEditorComponent from "pages/BPM/BpmForm/FormEditor";
import FormEditorSeting from "./FormEditorSeting";
import { stringify } from "uuid";
import FormCategoryService from "services/FormCategoryService";
import { showToast } from "utils/common";

const SettingForm = (props: any) => {
  const { onShow, onHide, dataForm } = props;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const defaultSchema = {
    id: null,
    type: "default",
    components: [],
  };
  const [formSchema, setFormSchema] = useState(defaultSchema); // Lưu trữ schema
  const [initFormSchema, setInitFormSchema] = useState(defaultSchema); // Lưu trữ schema

  useEffect(() => {
    if (dataForm?.id) {
      if (dataForm?.config) {
        setInitFormSchema(JSON.parse(dataForm?.config) || defaultSchema);
      } else {
        setInitFormSchema(defaultSchema);
      }
    } else {
      setInitFormSchema(defaultSchema);
    }
  }, [dataForm]);

  const handleClearForm = (acc) => {
    onHide(acc);
    setFormSchema(defaultSchema);
    setIsSubmit(false);
    setInitFormSchema(defaultSchema);
  };
  const saveForm = async () => {
    if (!dataForm?.id) {
      showToast(`Vui lòng chọn biểu mẫu`, "error");
      return;
    }
    setIsSubmit(true);

    const body: any = {
      ...dataForm,
      config: JSON.stringify(formSchema),
    };

    const response = await FormCategoryService.update(body);

    if (response.code === 0) {
      showToast(`Lưu biểu mẫu thành công`, "success");
      onHide(true);
      handleClearForm(false);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              handleClearForm(false);
            },
          },
          {
            title: "Lưu",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
            callback: () => {
              saveForm();
            },
          },
        ],
      },
    }),
    [isSubmit, dataForm, formSchema] // Chỉ định các biến mà bạn muốn theo dõi
  );

  const handleSchemaChange = (newSchema) => {
    setFormSchema(newSchema); // Cập nhật schema mới
    console.log("Schema mới:", newSchema);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => {
          if (!isSubmit) {
            handleClearForm(false);
          }
        }}
        className="modal-setting-form"
        size="full"
      >
        <form className="form-setting-form">
          <ModalHeader
            title={`Chỉnh sửa biểu mẫu ${dataForm?.name}`}
            toggle={() => {
              if (!isSubmit) {
                handleClearForm(false);
              }
            }}
          />
          <ModalBody>
            <FormEditorSeting
              initialSchema={initFormSchema}
              onSchemaChange={handleSchemaChange}
              onClickSelectForm={() => {}}
              onClickSaveForm={() => {}}
              callback={(type) => {}}
            />
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
};

export default SettingForm;
