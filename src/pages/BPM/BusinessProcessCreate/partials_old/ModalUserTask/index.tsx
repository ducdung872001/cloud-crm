import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId } from "reborn-util";

import "./index.scss";
import FormEditorComponent from "pages/BPM/BpmForm/FormEditor";
import FormViewerComponent from "pages/BPM/BpmForm/FormViewer";
import ModalMapping from "./partials/ModalMapping";
import ModalSetting from "./partials/ModalSetting";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";
import ModalSaveForm from "./partials/ModalSaveForm";
import ModalSelectForm from "./partials/ModalSelectForm";
import ModalBpmParticipant from "./partials/ModalBpmParticipant";
import ModalSelectNodeOther from "../ModalSelectNodeOther";
import ModalOLA from "./partials/ModalOLA";
import FormEditorComponentDisable from "pages/BPM/BpmForm/FormEditorDisable";
import ModalDebug from "./partials/ModalDebug";
import ModalTimer from "./partials/ModalTimer";
import _ from "lodash";
import Loading from "components/loading";

export default function ModalUserTask({ onShow, onHide, dataNode, processId, disable }) {
  const formRef = useRef(null);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
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

  useEffect(() => {
    if (dataNode && onShow) {
      getDetailTask(dataNode.id);
      if (dataNode?.businessObject?.$parent?.id && dataNode.businessObject?.$parent?.$type === "bpmn:SubProcess") {
        getDetailNode(dataNode?.id);
      }
    }
  }, [dataNode, onShow]);

  const getDetailTask = async (id) => {
    setIsLoading(true);
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
  }

  const addArtifactMetadata = async (nodeId, fieldName, link, type) => {
    const body = {
      nodeId: nodeId,
      fieldName: fieldName,
      link: link,
      type: type,
    };
    const response = await BusinessProcessService.updateArtifactMetadata(body);
    if (response.code === 0) {
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

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
          ...(disable
            ? []
            : ([
                {
                  title: "Cập nhật",
                  type: "submit",
                  color: "primary",
                  disabled: isSubmit,
                  // || !isDifferenceObj(formData, values),
                  is_loading: isSubmit,
                },
              ] as any)),
        ],
      },
    }),
    [
      // formData,
      // values,
      isSubmit,
      disable,
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

  const addNode = async () => {
    const body = {
      name: "",
      typeNode: dataNode.type,
      processId: processId,
      nodeId: dataNode.id,
    };
    const response = await BusinessProcessService.bpmAddNode(body);

    if (response.code == 0) {
      const result = response.result;
      showToast(`Lưu Node thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="full"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-user-task"
      >
        <form className="form-user-task" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Cấu hình biểu mẫu: ${dataNode?.businessObject?.name || ""}`} toggle={() => !isSubmit && handleClear(false)} />
          <ModalBody>
            <div>
              {!isLoading ? (
                <div>
                  {disable ? (
                    <FormEditorComponentDisable
                      initialSchema={initFormSchema}
                      onSchemaChange={handleSchemaChange}
                      onClickSelectForm={() => setIsModalSelectForm(true)}
                      onClickSaveForm={() => setIsModalSaveForm(true)}
                      disable={true}
                      callback={(type) => {
                        if (type === "mapping") {
                          setIsModalMapping(true);
                        }
                        if (type === "setting") {
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
                      }}
                    />
                  ) : (
                    <FormEditorComponent
                      initialSchema={initFormSchema}
                      onSchemaChange={handleSchemaChange}
                      onClickSelectForm={() => setIsModalSelectForm(true)}
                      onClickSaveForm={() => setIsModalSaveForm(true)}
                      dataNode={dataNode}
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
                          addNode();
                        }
                        if (type === "timer") {
                          setIsModalTimer(true);
                        }
                      }}
                    />
                  )}
                </div>
              ) : (
                <Loading />
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <ModalMapping
        onShow={isModalMapping}
        dataNode={dataNode}
        listComponent={listComponent}
        codeForm={formSchema?.id}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalMapping(false);
        }}
      />
      <ModalSetting
        onShow={isModalSetting}
        dataNode={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalSetting(false);
        }}
      />
      <ModalSaveForm
        onShow={isModalSaveForm}
        formSchema={formSchema}
        dataNode={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          setIsModalSaveForm(false);
        }}
      />
      <ModalSelectForm
        onShow={isModalSelectForm}
        dataNode={dataNode}
        onHide={(reload) => {
          setIsModalSelectForm(false);
        }}
        callBack={(e, formId) => {
          const newDataForm = {
            ...e,
            id: formSchema?.id
          }
          setInitFormSchema(newDataForm);
          setFormSchema(newDataForm);
        }}
      />
      <ModalBpmParticipant
        onShow={isBpmParticipant}
        dataNode={dataNode}
        formSchema={formSchema}
        processId={childProcessId || processId}
        disable={disable}
        onHide={(reload) => {
          setBpmParticipant(false);
        }}
      />

      <ModalSelectNodeOther
        onShow={isModalClone}
        data={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            getDetailTask(dataNode.id);
          }
          setIsModalClone(false);
        }}
      />

      <ModalOLA
        onShow={isModalOLA}
        dataNode={dataNode}
        processId={childProcessId || processId}
        disable={disable}
        onHide={(reload) => {
          if (reload) {
            // loadCampaignApproaches(campaignId);
          }
          setIsModalOLA(false);
        }}
      />

      <ModalTimer
        onShow={isModalTimer}
        dataNode={dataNode}
        disable={disable}
        onHide={(reload) => {
          if (reload) {
            getDetailTask(dataNode.id);
          }
          setIsModalTimer(false);
        }}
      />

      <ModalDebug
        onShow={isModalDebug}
        dataNode={dataNode}
        processId={childProcessId || processId}
        onHide={(reload) => {
          if (reload) {
            // getListOjectGroup(params);
          }
          setIsModalDebug(false);
        }}
      />
    </Fragment>
  );
}
