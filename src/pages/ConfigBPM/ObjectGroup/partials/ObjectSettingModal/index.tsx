import React, { Fragment, useState, useEffect, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import "./index.scss";
import ObjectGroupService from "services/ObjectGroupService";
import FormEditorComponent from "pages/BPM/BpmForm/FormEditor";

export default function ObjectSettingModal(props: any) {
  const { onShow, onHide, dataObject } = props;
  const defaultSchema = {
    id: null,
    type: "default",
    components: [],
  };

  const [initFormSchema, setInitFormSchema] = useState(defaultSchema); // Lưu trữ schema
  const [formSchema, setFormSchema] = useState(defaultSchema); // Lưu trữ schema
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  useEffect(() => {
    if (onShow && dataObject?.id) {
      setFormSchema(dataObject?.config ? JSON.parse(dataObject?.config) : defaultSchema);
      setInitFormSchema(dataObject?.config ? JSON.parse(dataObject?.config) : defaultSchema);
    }
  }, [onShow, dataObject]);

  // Callback để nhận schema khi người dùng thay đổi trong FormEditor
  const handleSchemaChange = (newSchema) => {
    setFormSchema(newSchema); // Cập nhật schema mới
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!dataObject?.id) return;

    setIsSubmit(true);

    const body = {
      id: dataObject?.id,
      config: JSON.stringify(formSchema),
    };

    const response = await ObjectGroupService.updateConfig(body);

    if (response.code === 0) {
      showToast(`Cập nhật biểu mẫu thành công`, "success");
      setInitFormSchema(formSchema); 
      setIsSubmit(false);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handleClear = (acc) => {
    onHide(acc);
    setFormSchema(defaultSchema);
    setInitFormSchema(defaultSchema);
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
              handleClear(true);
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="full"
        toggle={() => {
          !isSubmit && onHide(false);
        }}
        className="modal-setting-object"
      >
        <form className="form-setting-object" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`Cài đặt đối tượng`}
            toggle={() => {
              !isSubmit && onHide(true);
            }}
          />
          <ModalBody>
            <FormEditorComponent
              initialSchema={initFormSchema}
              onSchemaChange={handleSchemaChange}
              onClickSelectForm={() => console.log("onClickSelectForm")}
              onClickSaveForm={() => console.log("onClickSaveForm")}
              dataNode={null}
              callback={(type) => {
                console.log("type", type);
              }}
              disableHeader={true}
            />
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
