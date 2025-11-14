import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IContractPipelineRequest } from "model/contractPipeline/ContractPipelineRequestModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./index.scss";
import ObjectGroupService from "services/ObjectGroupService";
import FormEditorComponent from "pages/BPM/BpmForm/FormEditor";

export default function ObjectSettingModal(props: any) {
  const { onShow, onHide } = props;

  const formRef = useRef(null);
  const [isModalMapping, setIsModalMapping] = useState(false);
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [isModalSaveForm, setIsModalSaveForm] = useState(false);
  const [isModalSelectForm, setIsModalSelectForm] = useState(false);
  const [isBpmParticipant, setBpmParticipant] = useState(false);
  const [isModalClone, setIsModalClone] = useState(false);
  const [childProcessId, setChildProcessId] = useState(null);
  const [isModalOLA, setIsModalOLA] = useState(false);
  const [isModalTimer, setIsModalTimer] = useState(false);
  const [isModalDebug, setIsModalDebug] = useState(false);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        id: data?.id ?? 0,
        name: data?.name ?? "",
        position: data?.position ?? 0,
      } as IContractPipelineRequest),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "position",
      rules: "required|min:0",
    },
  ];

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const handClearForm = () => {
    onHide(false);
  };

  //   const actions = useMemo<IActionModal>(
  //     () => ({
  //       actions_right: {
  //         buttons: [
  //           {
  //             title: "Hủy",
  //             color: "primary",
  //             variant: "outline",
  //             disabled: isSubmit,
  //             callback: () => {
  //               !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
  //             },
  //           },
  //           {
  //             title: data ? "Cập nhật" : "Tạo mới",
  //             type: "submit",
  //             color: "primary",
  //             disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
  //             is_loading: isSubmit,
  //           },
  //         ],
  //       },
  //     }),
  //     [formData, values, isSubmit]
  //   );

  //   const showDialogConfirmCancel = () => {
  //     const contentDialog: IContentDialog = {
  //       color: "warning",
  //       className: "dialog-cancel",
  //       isCentered: true,
  //       isLoading: false,
  //       title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
  //       message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
  //       cancelText: "Quay lại",
  //       cancelAction: () => {
  //         setShowDialog(false);
  //         setContentDialog(null);
  //       },
  //       defaultText: "Xác nhận",
  //       defaultAction: () => {
  //         onHide(false);
  //         setShowDialog(false);
  //         setContentDialog(null);
  //       },
  //     };
  //     setContentDialog(contentDialog);
  //     setShowDialog(true);
  //   };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  //   useEffect(() => {
  //     if (dataNode && onShow) {
  //       getDetailTask(dataNode.id);
  //       if (dataNode?.businessObject?.$parent?.id && dataNode.businessObject?.$parent?.$type === "bpmn:SubProcess") {
  //         getDetailNode(dataNode?.id);
  //       }
  //     }
  //   }, [dataNode, onShow]);

  const getDetailTask = async (id) => {
    setIsLoading(true);
    return;
    const response = await BusinessProcessService.detailUserTask(id);

    if (response.code == 0) {
      const result = response.result;
      const config = (result.config && JSON.parse(result.config)) || null;
      if (config) {
        // setInitFormSchema({
        //   type: "default",
        //   components: config
        // })
        // setFormSchema({
        //   type: "default",
        //   components: config
        // })
        setInitFormSchema(config);
        setFormSchema(config);
        setListComponent(config.components);
      }
      setIsLoading(false);
      setData(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsLoading(false);
    }
  };

  const getDetailNode = async (nodeId) => {
    return;
    const response = await BusinessProcessService.bpmDetailNode(nodeId);

    if (response.code == 0) {
      const result = response.result;
      setChildProcessId(result?.processId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };
  // const defaultSchema = {
  //   "type": "default",
  //   "components": [
  //     {
  //       "key": "firstName",
  //       "label": "First Name",
  //       "type": "textfield",
  //       "defaultValue": "",
  //       "validate": {
  //         "required": true
  //       }
  //     },
  //     {
  //       "key": "lastName",
  //       "label": "Last Name",
  //       "type": "textfield",
  //       "defaultValue": "",
  //       "validate": {
  //         "required": true
  //       }
  //     },
  //     {
  //       "key": "age",
  //       "label": "Age",
  //       "type": "number",
  //       "defaultValue": 18,
  //       "validate": {
  //         "required": true,
  //         "min": 18,
  //         "max": 100
  //       }
  //     },
  //     {
  //       "key": "gender",
  //       "label": "Gender",
  //       "type": "radio",
  //       "options": [
  //         { "label": "Male", "value": "male" },
  //         { "label": "Female", "value": "female" },
  //         { "label": "Other", "value": "other" }
  //       ],
  //       "defaultValue": "male"
  //     },
  //     {
  //       "key": "country",
  //       "label": "Country",
  //       "type": "select",
  //       "options": [
  //         { "label": "USA", "value": "usa" },
  //         { "label": "Canada", "value": "canada" },
  //         { "label": "UK", "value": "uk" }
  //       ],
  //       "defaultValue": "usa"
  //     },
  //     {
  //       "key": "acceptTerms",
  //       "label": "Accept Terms and Conditions",
  //       "type": "checkbox",
  //       "defaultValue": false,
  //       "validate": {
  //         "required": true
  //       }
  //     },
  //     {
  //       "key": "submit",
  //       "label": "Submit",
  //       "type": "button",
  //       "action": "submit"
  //     }
  //   ]
  // }

  const defaultSchema = {
    id: null,
    type: "default",
    components: [],
  };

  const [initFormSchema, setInitFormSchema] = useState(defaultSchema); // Lưu trữ schema
  const [formSchema, setFormSchema] = useState(defaultSchema); // Lưu trữ schema
  // console.log('formSchema', formSchema);
  const [listComponent, setListComponent] = useState([]);
  // console.log('listComponent', listComponent);

  // Callback để nhận schema khi người dùng thay đổi trong FormEditor
  const handleSchemaChange = (newSchema) => {
    setFormSchema(newSchema); // Cập nhật schema mới
    console.log("Schema mới:", newSchema);
    setListComponent(newSchema?.components);
  };

  const addArtifactMetadata = async (nodeId, fieldName, link, type) => {
    const body = {
      nodeId: nodeId,
      fieldName: fieldName,
      link: link,
      type: type,
    };
    return;
    const response = await BusinessProcessService.updateArtifactMetadata(body);
    if (response.code === 0) {
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const deleteArtifactMetadata = async (nodeId, fieldName) => {
    return;
    const response = await BusinessProcessService.deleteArtifactMetadata(nodeId, fieldName);
    if (response.code === 0) {
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    return;

    setIsSubmit(true);

    const body = {
      id: data.id,
      nodeId: dataNode?.id,
      code: formSchema?.id,
      config: JSON.stringify(formSchema),
    };

    console.log("formSchemaSubmit", formSchema);
    if (formSchema && formSchema.components?.length > 0) {
      const componentIframe = formSchema.components.filter((el) => el.type === "iframe");
      if (componentIframe && componentIframe.length > 0) {
        componentIframe.map((item) => {
          const properties = item.properties && item.properties;
          if (properties && properties.artifact === "grid") {
            addArtifactMetadata(body.nodeId, properties.name, item.url, properties.artifact);
            const iframeUrl = item.url?.includes("https://") ? item.url : `${process.env.APP_LINK}${item.url}`;
            // addArtifactMetadata(body.nodeId, properties.name, iframeUrl, properties.artifact);
          }
        });
      }
    }

    const response = await BusinessProcessService.updateUserTask(body);

    if (response.code === 0) {
      showToast(`Cập nhật biểu mẫu thành công`, "success");
      // handleClear(false);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
    setIsSubmit(false);
  };

  const handleClear = (acc) => {
    onHide(acc);
    setFormSchema(defaultSchema);
    setInitFormSchema(defaultSchema);
    setListComponent([]);
    setChildProcessId(null);
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
              handleClear(false);
              //   !isDifferenceObj(formData, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            // || !isDifferenceObj(formData, values),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [
      // formData,
      // values,
      isSubmit,
    ]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  //   const addNode = async () => {
  //     const body = {
  //       name: "",
  //       typeNode: dataNode.type,
  //       processId: processId,
  //       nodeId: dataNode.id,
  //     };
  //     const response = await BusinessProcessService.bpmAddNode(body);

  //     if (response.code == 0) {
  //       const result = response.result;
  //       showToast(`Lưu Node thành công`, "success");
  //     } else {
  //       showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //     }
  //   };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="full"
        toggle={() => !isSubmit && onHide(false)}
        className="modal-setting-object"
      >
        <form className="form-setting-object" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`Cài đặt đối tượng`}
            toggle={() => {
              !isSubmit && onHide(false);
            }}
          />
          <ModalBody>
            <FormEditorComponent
              initialSchema={initFormSchema}
              onSchemaChange={handleSchemaChange}
              onClickSelectForm={() => setIsModalSelectForm(true)}
              onClickSaveForm={() => setIsModalSaveForm(true)}
              dataNode={null}
              callback={(type) => {
                if (type === "mapping") {
                  setIsModalMapping(true);
                }
                if (type === "setting-var") {
                  setIsModalSetting(true);
                }
                if (type === "participant") {
                  setBpmParticipant(true);
                }
                if (type === "copy") {
                  setIsModalClone(true);
                }
                if (type === "OLA") {
                  setIsModalOLA(true);
                }
                if (type === "debug") {
                  setIsModalDebug(true);
                }
                if (type === "save") {
                  console.log("Lưu biểu mẫu");

                  // addNode();
                }
                if (type === "timer") {
                  setIsModalTimer(true);
                }
              }}
            />
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
