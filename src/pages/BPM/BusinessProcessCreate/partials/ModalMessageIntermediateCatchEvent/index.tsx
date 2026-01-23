import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId } from "reborn-util";
import "./index.scss";
import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import Tippy from "@tippyjs/react";
import RadioList from "components/radio/radioList";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";
import Button from "components/button/button";
import ModalSetting from "../ModalUserTask/partials/ModalSetting";
import ModalSelectNodeOther from "../ModalSelectNodeOther";
import ModalDebug from "../ModalUserTask/partials/ModalDebug";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";

const headerMeassageId = "bpm-message-intermediate-";

export default function ModalMessageIntermediateCatchEvent({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isModalClone, setIsModalClone] = useState(false);
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [isModalDebug, setIsModalDebug] = useState(false);
  const [data, setData] = useState(null);
  const [handleErrorData, setHandleErrorData] = useState(null);
  const [childProcessId, setChildProcessId] = useState(null);
  const [dataWorkflow, setDataWorkflow] = useState(null);

  const [listInputVar, setListInputVar] = useState([
    {
      name: "",
      attributeMapping: null,
      attributeMappingId: "",
      mappingType: "",
      checkName: false,
      checkMapping: false,
    },
  ]);

  const [listOutVar, setListOutVar] = useState([
    {
      name: "",
      attributeMapping: null,
      attributeMappingId: "",
      mappingType: 2,
      checkName: false,
      checkMapping: false,
    },
  ]);

  const [listCondition, setListCondition] = useState([
    // {
    //   parameter: "",
    //   value: "",
    //   checkKey: false,
    //   checkValue: false,
    //   operator: "EQUAL",
    // },
  ]);

  const dataHandleError = [
    {
      value: "Retry",
      label: "Retry",
    },
    {
      value: "Chuyển sang một luồng thay thế",
      label: "Chuyển sang một luồng thay thế",
    },
  ];

  useEffect(() => {
    if (dataNode && onShow) {
      getDetailTask(dataNode.id);
      if (dataNode?.businessObject?.$parent?.id && dataNode.businessObject?.$parent?.$type === "bpmn:SubProcess") {
        getDetailNode(dataNode?.id);
      }
    }
  }, [dataNode, onShow]);

  const getDetailNode = async (nodeId) => {
    const response = await BusinessProcessService.bpmDetailNode(nodeId);

    if (response.code == 0) {
      const result = response.result;
      setChildProcessId(result?.processId);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDetailTask = async (id) => {
    const response = await BusinessProcessService.detailMessageIntermediateCatchEvent(id);

    if (response.code == 0) {
      const result = response.result;

      const errorHandling = (result?.errorHandling && JSON.parse(result.errorHandling)) || null;
      setHandleErrorData(errorHandling?.config || null);

      const arrayInput =
        (result.inputVar &&
          JSON.parse(result.inputVar) &&
          Object.entries(JSON.parse(result.inputVar)).map(([key, value]) => {
            return { [key]: value };
          })) ||
        [];
      const newListInputVarData = Array.isArray(arrayInput) && arrayInput.length > 0 ? arrayInput : [];
      const listInputVarData = newListInputVarData.map((item) => {
        const name = Object.entries(item)[0][0];
        const attributeMapping: any = Object.entries(item)[0][1];

        return {
          name: name,
          attributeMapping: attributeMapping,
          attributeMappingId: attributeMapping,
          // mappingType: attributeMapping?.includes("var") ? 2 : 1,
          mappingType: attributeMapping,
          checkName: false,
          checkMapping: false,
        };
      });
      if (listInputVarData && listInputVarData.length > 0) {
        setListInputVar(
          listInputVarData || [
            {
              name: "",
              attributeMapping: "",
              attributeMappingId: "",
              mappingType: "",
              checkName: false,
              checkMapping: false,
            },
          ]
        );
      }

      const arrayOut =
        (result.outputVar &&
          JSON.parse(result.outputVar) &&
          Object.entries(JSON.parse(result.outputVar)).map(([key, value]) => {
            return { [key]: value };
          })) ||
        [];
      const newListOutputVarData = Array.isArray(arrayOut) && arrayInput.length > 0 ? arrayOut : [];
      const listOutputVarData = newListOutputVarData.map((item) => {
        const name = Object.entries(item)[0][0];
        const attributeMapping: any = Object.entries(item)[0][1];

        return {
          name: name,
          attributeMapping: attributeMapping,
          attributeMappingId: attributeMapping,
          // mappingType: attributeMapping?.includes("var") ? 2 : 1,
          mappingType: 2,
          checkName: false,
          checkMapping: false,
        };
      });
      if (listOutputVarData && listOutputVarData.length > 0) {
        setListOutVar(
          listOutputVarData || [
            {
              name: "",
              attributeMapping: "",
              attributeMappingId: "",
              mappingType: 2,
              checkName: false,
              checkMapping: false,
            },
          ]
        );
      }

      const newListConditionData =
        result?.messageCorrelation &&
        JSON.parse(result.messageCorrelation) &&
        Array.isArray(JSON.parse(result.messageCorrelation)) &&
        JSON.parse(result.messageCorrelation).length > 0
          ? JSON.parse(result.messageCorrelation)
          : [];
      const listConditionData = newListConditionData.map((item) => {
        // const key = Object.entries(item)[0][0];
        // const value = Object.entries(item)[0][1];

        return {
          parameter: item.parameter,
          value: item.value,
          checkKey: false,
          checkValue: false,
          operator: item.operator || "EQUAL",
        };
      });
      if (listConditionData && listConditionData.length > 0) {
        // setListCondition(listConditionData || [{ parameter: "", value: "", operator: "EQUAL", checkKey: false, checkValue: false }]);
        setListCondition(listConditionData || []);
      }

      let messagePath = "";
      if (result?.messageId) {
        const str = result?.messageId;
        const lastSlashIndex = str.lastIndexOf("-");
        messagePath = str.substring(lastSlashIndex + 1);
      }

      const data = {
        ...result,
        errorHandling: errorHandling?.type || "Retry",
        // ...(messagePath ? { messageId: messagePath } : {}),
      };
      setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
      setData(data);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const values = useMemo(
    () => ({
      id: null,
      name: data?.name ?? "",
      code: data?.code ?? "",
      description: data?.description ?? "",
      messageName: data?.messageName ?? "",
      messageId: data?.messageId?.replace(headerMeassageId, "") ?? "",
      endpoint: data?.endpoint ?? null,
      inputVar: "",
      outputVar: "",
      errorHandling: data?.errorHandling ?? "Retry",
      timeout: data?.timeout ?? "",
      messageCorrelation: "",
      executionMode: data?.executionMode ?? null,
      messageProcessing: data?.messageProcessing ?? null,
      nodeId: dataNode?.id ?? null,
      processId: childProcessId ?? processId ?? null,
      workflowId: data?.workflowId ?? null,
    }),
    [onShow, data, childProcessId, dataNode, processId]
  );

  const [formData, setFormData] = useState(values);
  //   // console.log('formData', formData);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  useEffect(() => {
    if (formData.errorHandling) {
      const errorHandling = formData.errorHandling;
      if (errorHandling === "Retry") {
        setHandleErrorData({ times: "", loopTime: "" });
      }
      if (errorHandling === "Chuyển sang một luồng thay thế") {
        setHandleErrorData({ nodeId: "" });
      }
    }
  }, [formData.errorHandling]);

  const onSubmit = async (e) => {
    e.preventDefault();

    ///validate biến đầu vào
    const listInputVarData = [...listInputVar];
    const checkEmptyInput = listInputVarData.map((item, index) => {
      if (!item.name) {
        return {
          ...item,
          checkName: true,
        };
      } else if (!item.attributeMapping) {
        return {
          ...item,
          checkMapping: true,
        };
      } else {
        return item;
      }
    });

    // if(checkEmptyInput && checkEmptyInput.length > 0 && checkEmptyInput.filter(el => el.checkName).length > 0){
    //   setListInputVar(checkEmptyInput);
    //   return;
    // }

    // if(checkEmptyInput && checkEmptyInput.length > 0 && checkEmptyInput.filter(el => el.checkMapping).length > 0){
    //   setListInputVar(checkEmptyInput);
    //   return;
    // }

    const listInputVarSubmit = (listInputVarData || []).map((item) => {
      return {
        // [item.name]: item.attributeMapping,
        [item.name]: item.mappingType,
      };
    });
    const objInput = listInputVarSubmit.reduce((acc, curr) => {
      const key = Object.keys(curr)[0];
      acc[key] = curr[key];
      return acc;
    });

    ///validate biến đầu ra
    const listOutVarData = [...listOutVar];
    const checkEmptyOut = listOutVarData.map((item, index) => {
      if (!item.name) {
        return {
          ...item,
          checkName: true,
        };
      } else if (!item.attributeMapping) {
        return {
          ...item,
          checkMapping: true,
        };
      } else {
        return item;
      }
    });

    // if(checkEmptyOut && checkEmptyOut.length > 0 && checkEmptyOut.filter(el => el.checkName).length > 0){
    //   setListOutVar(checkEmptyOut);
    //   return;
    // }

    // if(checkEmptyOut && checkEmptyOut.length > 0 && checkEmptyOut.filter(el => el.checkMapping).length > 0){
    //   setListOutVar(checkEmptyOut);
    //   return;
    // }

    const listOutVarSubmit = (listOutVarData || []).map((item) => {
      return {
        [item.name]: item.attributeMapping,
      };
    });
    const objOut = listOutVarSubmit.reduce((acc, curr) => {
      const key = Object.keys(curr)[0];
      acc[key] = curr[key];
      return acc;
    });

    ///validate Điều kiện nhận thông điệp
    const listMessageCorrelation = [...listCondition];
    const checkEmptyKey = listMessageCorrelation.map((item, index) => {
      if (!item.parameter) {
        return {
          ...item,
          checkKey: true,
        };
      } else if (!item.value) {
        return {
          ...item,
          checkValue: true,
        };
      } else {
        return item;
      }
    });

    // if(checkEmptyKey && checkEmptyKey.length > 0 && checkEmptyKey.filter(el => el.checkKey).length > 0){
    //   setListCondition(checkEmptyKey);
    //   return;
    // }

    // if(checkEmptyKey && checkEmptyKey.length > 0 && checkEmptyKey.filter(el => el.checkValue).length > 0){
    //     setListCondition(checkEmptyKey);
    //   return;
    // }

    const listMessageCorrelationSubmit = (listMessageCorrelation || []).map((item) => {
      return {
        // [item.parameter]: item.value,
        parameter: item.parameter,
        value: item.value,
        operator: item.operator,
      };
    });

    const errorHandlingSubmit = {
      type: formData.errorHandling,
      config: handleErrorData,
    };

    setIsSubmit(true);

    const body = {
      id: data?.id ?? null,
      name: formData.name ?? "",
      code: formData?.code ?? "",
      description: formData?.description ?? "",
      messageName: data?.messageName ?? "",
      messageId: formData?.messageId ? headerMeassageId + formData?.messageId : "",
      endpoint: formData?.endpoint ?? "",
      inputVar: JSON.stringify(objInput),
      outputVar: JSON.stringify(objOut),
      errorHandling: JSON.stringify(errorHandlingSubmit),
      messageCorrelation: listMessageCorrelationSubmit?.length > 0 ? JSON.stringify(listMessageCorrelationSubmit) : null,
      timeout: formData?.timeout ?? "",
      executionMode: formData?.executionMode ?? null,
      messageProcessing: formData?.messageProcessing,
      nodeId: dataNode?.id ?? null,
      processId: formData?.processId ?? null,
      workflowId: formData?.workflowId ?? null,
    };

    console.log("body", body);

    const response = await BusinessProcessService.updateMessageIntermediateCatchEvent(body);

    if (response.code === 0) {
      showToast(`Cập nhật biểu mẫu thành công`, "success");
      handleClear(false);
      changeNameNodeXML(dataNode, body.name);
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
            title: disable ? "Đóng" : "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData, values) ? handleClear(false) : showDialogConfirmCancel();
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
    [formData, values, isSubmit, disable]
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
        handleClear(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleClear = (acc) => {
    onHide(acc);
    setListInputVar([
      {
        name: "",
        attributeMapping: "",
        attributeMappingId: "",
        mappingType: "",
        checkName: false,
        checkMapping: false,
      },
    ]);
    setListOutVar([
      {
        name: "",
        attributeMapping: "",
        attributeMappingId: "",
        mappingType: 2,
        checkName: false,
        checkMapping: false,
      },
    ]);

    setListCondition([
      // {
      //   parameter: "",
      //   value: "",
      //   checkKey: false,
      //   checkValue: false,
      //   operator: "EQUAL",
      // },
    ]);
    setDataWorkflow(null);
  };

  const loadedOptionAttribute = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
      processId: childProcessId || processId,
    };
    const response = await BusinessProcessService.listVariableDeclare(params);

    if (response.code === 0) {
      const dataOption = response.result?.items;
      let listVar = [];
      dataOption &&
        dataOption.length > 0 &&
        dataOption.map((item) => {
          const body = (item.body && JSON.parse(item.body)) || [];
          body.map((el) => {
            listVar.push({
              value: `var_${item.name}.${el.name}`,
              label: `var_${item.name}.${el.name}`,
              nodeId: item.nodeId,
            });
          });
        });

      return {
        options: [
          ...(listVar.length > 0
            ? listVar.map((item) => {
                return {
                  value: item.value,
                  label: item.label,
                  nodeId: item.nodeId,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const loadedOptionForm = async (search, loadedOptions, { page }) => {
    const params = {
      code: search,
      page: page,
      limit: 10,
      processId: childProcessId || processId,
    };
    const response = await BusinessProcessService.listBpmForm(params);

    if (response.code === 0) {
      const dataOption = response.result?.filter((el) => el.code) || [];
      let listForm = [];
      dataOption &&
        dataOption.length > 0 &&
        dataOption.map((item) => {
          const components =
            (item.config && JSON.parse(item.config) && JSON.parse(item.config).components && JSON.parse(item.config).components) || [];
          components.map((el) => {
            if (el.key || el.path) {
              listForm.push({
                value: `frm_${item.code}.${el.key || el.path}`,
                label: `frm_${item.code}.${el.key || el.path}`,
                nodeId: item.nodeId,
                datatype: el.type || null,
              });
            } else {
              if (el.type === "group") {
                el.components.map((il) => {
                  if (il.key || il.path) {
                    listForm.push({
                      value: `frm_${item.code}.${el.type}.${il.key || il.path}`,
                      label: `frm_${item.code}.${el.type}.${il.key || il.path}`,
                      nodeId: item.nodeId,
                      datatype: il.type || null,
                    });
                  } else {
                    if (il.type === "group") {
                      il.components.map((ol) => {
                        if (ol.key || ol.path) {
                          listForm.push({
                            value: `frm_${item.code}.${el.type}.${il.type}.${ol.key || ol.path}`,
                            label: `frm_${item.code}.${el.type}.${il.type}.${ol.key || ol.path}`,
                            nodeId: item.nodeId,
                            datatype: ol.type || null,
                          });
                        } else {
                          if (ol.type === "group") {
                          }
                        }
                      });
                    }

                    if (il.type === "iframe") {
                      listForm.push({
                        value: `frm_${item.code}.${el.type}.${il.type}`,
                        label: `frm_${item.code}.${el.type}.${il.type}`,
                        nodeId: item.nodeId,
                        datatype: el.type || null,
                      });
                    }
                  }
                });
              }

              if (el.type === "iframe") {
                listForm.push({
                  value: `frm_${item.code}.${el.type}.${el.properties?.name}`,
                  label: `frm_${item.code}.${el.type}.${el.properties?.name}`,
                  nodeId: item.nodeId,
                  datatype: el.type || null,
                });
              }
            }
          });
        });

      return {
        options: [
          ...(listForm.length > 0
            ? listForm.map((item) => {
                return {
                  value: item.value,
                  label: item.label,
                  nodeId: item.nodeId,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const loadedOptionWorkflow = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
      processId: processId,
    };
    const response = await BusinessProcessService.listStep(params);

    if (response.code === 0) {
      const dataOption = response.result?.items || [];
      const options = dataOption.filter((el) => el.stepName);

      return {
        options: [
          ...(options.length > 0
            ? options.map((item) => {
                return {
                  value: item.id,
                  label: item.stepName,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const addNode = async () => {
    const body = {
      name: data?.name,
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

  const lstConditionField = [
    { value: "EQUAL", label: "EQUAL" },
    { value: "IN", label: "IN" },
    { value: "NOT_EQUAL", label: "NOT_EQUAL" },
    { value: "GREATER_THAN", label: "GREATER_THAN" },
    { value: "LESS_THAN", label: "LESS_THAN" },
    { value: "GREATER_THAN_OR_EQUAL", label: "GREATER_THAN_OR_EQUAL" },
    { value: "LESS_THAN_OR_EQUAL", label: "LESS_THAN_OR_EQUAL" },
    { value: "CONTAINS", label: "CONTAINS" },
  ];

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-message-intermediate-catch-event"
      >
        <form className="form-message-intermediate-catch-event" onSubmit={(e) => onSubmit(e)}>
          {/* <ModalHeader title={`Cài đặt biểu mẫu`} toggle={() => !isSubmit && handleClear(false)} /> */}
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt Message Intermediate Catch Event"}</h4>
            </div>

            <ListButtonHeader
              data={data}
              dataNode={dataNode}
              processId={processId}
              disable={disable}
              isSubmit={isSubmit}
              setIsModalClone={() => setIsModalClone(true)}
              setIsModalSetting={() => setIsModalSetting(true)}
              setIsModalDebug={() => setIsModalDebug(true)}
              handleClear={() => handleClear(false)}
            />
          </div>
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <Input
                  id="name"
                  name="name"
                  label="Tên nhiệm vụ"
                  fill={true}
                  required={true}
                  placeholder={"Tên nhiệm vụ"}
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, name: value });
                  }}
                />
              </div>

              <div className="form-group">
                <Input
                  id="code"
                  name="code"
                  label="Mã nhiệm vụ"
                  fill={true}
                  required={false}
                  placeholder={"Mã nhiệm vụ"}
                  value={formData.code}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, code: value });
                  }}
                />
              </div>

              <div className="form-group">
                <TextArea
                  name="note"
                  value={formData.description}
                  label="Mô tả nhiệm vụ"
                  fill={true}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, description: value });
                  }}
                  placeholder="Nhập mô tả"
                />
              </div>

              {/* <div className="form-group">
                <Input
                  name="messageName"
                  value={formData.messageName}
                  label="Tên thông điệp"
                  fill={true}
                  required={true}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, messageName: value });
                  }}
                  placeholder="Nhập tên quy tắc"
                />
              </div> */}

              <div className="form-group" style={{ width: "100%" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>
                    Định danh thông điệp (Topic)<span style={{ color: "red" }}>*</span>
                  </span>
                </div>
                <div className="box-input-message">
                  <span style={{ fontSize: 14, fontWeight: "400" }}>{headerMeassageId}</span>
                  <Input
                    name="messageId"
                    value={formData.messageId}
                    label=""
                    fill={false}
                    required={true}
                    onChange={(e) => {
                      // let fieldName = convertToId(e.target.value) || "";
                      // fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, 'g'), '');
                      // const value = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);

                      const value = e.target.value;
                      setFormData({ ...formData, messageId: value });
                    }}
                    placeholder=""
                  />
                </div>
              </div>

              {/* <div className="form-group">
                <Input
                  id="endpoint"
                  name="endpoint"
                  label="Endpoint gửi thông điệp"
                  fill={true}
                  required={true}
                  placeholder={"Endpoint gửi thông điệp"}
                  value={formData.endpoint}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, endpoint: value });
                  }}
                />
              </div> */}

              <div className="container-inputVar">
                <div>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Cấu trúc bản tin</span>
                </div>
                {listInputVar && listInputVar.length > 0
                  ? listInputVar.map((item, index) => (
                      <div key={index} className="list-item-inputVar">
                        <div className="item-inputVar">
                          <Input
                            id="nameInput"
                            name="nameInput"
                            label={index === 0 ? "Tên trường" : ""}
                            fill={true}
                            required={false}
                            error={item.checkName}
                            message="Tên trường không được để trống"
                            placeholder={"Tên trường"}
                            value={item.name}
                            onChange={(e) => {
                              const value = e.target.value;
                              setListInputVar((current) =>
                                current.map((obj, idx) => {
                                  if (index === idx) {
                                    return { ...obj, name: value, checkName: false };
                                  }
                                  return obj;
                                })
                              );
                            }}
                          />
                        </div>
                        <div className="item-inputVar">
                          {index === 0 ? (
                            <div>
                              <span style={{ fontSize: 14, fontWeight: "700" }}>Kiểu dữ liệu</span>
                            </div>
                          ) : null}
                          <div className={"container-select-mapping"}>
                            <div className="select-mapping">
                              <SelectCustom
                                id="type"
                                name="type"
                                // label={index === 0 ? "Kiểu dữ liệu" : ""}
                                fill={false}
                                special={true}
                                required={true}
                                options={[
                                  {
                                    value: "text",
                                    label: "Văn bản",
                                  },
                                  {
                                    value: "int",
                                    label: "Số nguyên",
                                  },
                                  {
                                    value: "float",
                                    label: "Số thực",
                                  },
                                  {
                                    value: "list",
                                    label: "Danh sách",
                                  },
                                  {
                                    value: "date",
                                    label: "Ngày tháng",
                                  },
                                  {
                                    value: "boolean",
                                    label: "Đúng/sai",
                                  },
                                ]}
                                value={
                                  item.mappingType === "text"
                                    ? { value: "text", label: "Văn bản" }
                                    : item.mappingType === "int"
                                    ? { value: "int", label: "Số nguyên" }
                                    : item.mappingType === "float"
                                    ? { value: "float", label: "Số thực" }
                                    : item.mappingType === "list"
                                    ? { value: "list", label: "Danh sách" }
                                    : item.mappingType === "date"
                                    ? { value: "date", label: "Ngày tháng" }
                                    : item.mappingType === "boolean"
                                    ? { value: "boolean", label: "Đúng/sai" }
                                    : null
                                }
                                onChange={(e) => {
                                  setListInputVar((current) =>
                                    current.map((obj, idx) => {
                                      if (index === idx) {
                                        return { ...obj, mappingType: e.value };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                                isAsyncPaginate={false}
                                isFormatOptionLabel={false}
                                placeholder="Chọn kiểu dữ liệu"
                              />
                              {/* <SelectCustom
                                key={item?.mappingType}
                                id="fielName"
                                name="fielName"
                                // label={index === 0 ? "Biến quy trình" : ''}
                                fill={false}
                                required={false}
                                error={item.checkMapping}
                                message="Biến quy trình không được để trống"
                                options={[]}
                                value={item.attributeMapping ? { value: item.attributeMappingId, label: item.attributeMapping } : null}
                                onChange={(e) => {
                                  setListInputVar((current) =>
                                    current.map((obj, idx) => {
                                      if (index === idx) {
                                        return { ...obj, attributeMapping: e.label, attributeMappingId: e.value, checkMapping: false };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                                isAsyncPaginate={true}
                                isFormatOptionLabel={false}
                                // placeholder={item.mappingType === 2 ? "Chọn biến" : 'Chọn trường trong form'}
                                placeholder={item.mappingType === 2 ? "Chọn biến" : "Chọn trường trong form"}
                                additional={{
                                  page: 1,
                                }}
                                loadOptionsPaginate={item?.mappingType === 2 ? loadedOptionAttribute : loadedOptionForm}
                                // formatOptionLabel={formatOptionLabelEmployee}
                                // error={checkFieldEform}
                                // message="Biểu mẫu không được bỏ trống"
                                // disabled={}
                              /> */}
                            </div>
                            {/* <Tippy content={item.mappingType === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}>
                              <div
                                className={"icon-change-select"}
                                onClick={(e) => {
                                  if (item.mappingType === 1) {
                                    setListInputVar((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, mappingType: "" };
                                        }
                                        return obj;
                                      })
                                    );
                                  } else {
                                    setListInputVar((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, mappingType: 1 };
                                        }
                                        return obj;
                                      })
                                    );
                                  }
                                }}
                              >
                                <Icon name="ResetPassword" style={{ width: 18 }} />
                              </div>
                            </Tippy> */}
                          </div>
                        </div>
                        <div className="add-attribute" style={index === 0 ? { marginTop: "3.2rem" } : {}}>
                          <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                            <span
                              className="icon-add"
                              onClick={() => {
                                setListInputVar([
                                  ...listInputVar,
                                  {
                                    name: "",
                                    attributeMapping: "",
                                    attributeMappingId: "",
                                    mappingType: "",
                                    checkName: false,
                                    checkMapping: false,
                                  },
                                ]);
                              }}
                            >
                              <Icon name="PlusCircleFill" />
                            </span>
                          </Tippy>
                        </div>

                        {listInputVar.length > 1 ? (
                          <div className="remove-attribute" style={index === 0 ? { marginTop: "3.2rem" } : {}}>
                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                              <span
                                className="icon-remove"
                                onClick={() => {
                                  const newList = [...listInputVar];
                                  newList.splice(index, 1);
                                  setListInputVar(newList);
                                }}
                              >
                                <Icon name="Trash" />
                              </span>
                            </Tippy>
                          </div>
                        ) : null}
                      </div>
                    ))
                  : null}
              </div>

              <div className="container-condition">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Điều kiện nhận thông điệp</span>
                  <div className="add-attribute">
                    <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                      <span
                        className="icon-add"
                        onClick={() => {
                          setListCondition([
                            ...listCondition,
                            {
                              parameter: "",
                              value: "",
                              checkKey: false,
                              checkValue: false,
                              operator: "EQUAL",
                            },
                          ]);
                        }}
                      >
                        <Icon name="PlusCircleFill" />
                      </span>
                    </Tippy>
                  </div>
                </div>
                {listCondition && listCondition.length > 0
                  ? listCondition.map((item, index) => (
                      <div key={index} className="list-item-condition">
                        <div className="item-condition">
                          <Input
                            id="parameter"
                            name="parameter"
                            // label={index === 0 ? "Tên tham số đầu ra" : ''}
                            fill={true}
                            required={false}
                            error={item.checkKey}
                            message="Parameter không được để trống"
                            placeholder={"Parameter"}
                            value={item.parameter}
                            onChange={(e) => {
                              const value = e.target.value;
                              setListCondition((current) =>
                                current.map((obj, idx) => {
                                  if (index === idx) {
                                    return { ...obj, parameter: value, checkKey: false };
                                  }
                                  return obj;
                                })
                              );
                            }}
                          />
                        </div>
                        <div className="item-condition">
                          <SelectCustom
                            name="condition"
                            fill={true}
                            special={true}
                            value={
                              item.operator ? { value: item.operator, label: item.operator } : null
                              // item.operator === 'eq' ? { value: "eq", label: "EQUAL" }
                              // : item.operator === 'ne' ? { value: "ne", label: "NOT_EQUAL" }
                              // : item.operator === 'in' ? { value: "in", label: "IN" }
                              // : item.operator === 'gt' ? { value: "gt", label: "GREATER_THAN" }
                              // : item.operator === 'lt' ? { value: "lt", label: "LESS_THAN" }
                              // : item.operator === 'gte' ? { value: "gte", label: "GREATER_THAN_OR_EQUAL" }
                              // : item.operator === 'lte' ? { value: "lte", label: "LESS_THAN_OR_EQUAL" }
                              // : item.operator === 'con' ? { value: "con", label: "CONTAINS" }
                              // : null
                            }
                            options={lstConditionField}
                            // disabled={disableFieldCommom}
                            onChange={(e) => {
                              setListCondition((current) =>
                                current.map((obj, idx) => {
                                  if (index === idx) {
                                    return { ...obj, operator: e.value, checkName: false };
                                  }
                                  return obj;
                                })
                              );
                            }}
                          />
                        </div>
                        <div className="item-condition">
                          {item.operator === "GREATER_THAN" ||
                          item.operator === "LESS_THAN" ||
                          item.operator === "GREATER_THAN_OR_EQUAL" ||
                          item.operator === "LESS_THAN_OR_EQUAL" ? (
                            <NummericInput
                              id="value"
                              name="value"
                              fill={true}
                              required={false}
                              error={item.checkValue}
                              message="Value không được để trống"
                              placeholder={"Value"}
                              value={item.value}
                              onValueChange={(e) => {
                                const value = e.floatValue;
                                setListCondition((current) =>
                                  current.map((obj, idx) => {
                                    if (index === idx) {
                                      return { ...obj, value: value, checkValue: false };
                                    }
                                    return obj;
                                  })
                                );
                              }}
                            />
                          ) : (
                            <Input
                              id="value"
                              name="value"
                              // label={index === 0 ? "Tên tham số đầu ra" : ''}
                              fill={true}
                              required={false}
                              error={item.checkValue}
                              message="Value không được để trống"
                              placeholder={"Value"}
                              value={item.value}
                              onChange={(e) => {
                                const value = e.target.value;
                                setListCondition((current) =>
                                  current.map((obj, idx) => {
                                    if (index === idx) {
                                      return { ...obj, value: value, checkValue: false };
                                    }
                                    return obj;
                                  })
                                );
                              }}
                            />
                          )}
                        </div>
                        {/* <div className="add-attribute">
                          <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                            <span
                              className="icon-add"
                              onClick={() => {
                                setListCondition([
                                  ...listCondition,
                                  {
                                    parameter: "",
                                    value: "",
                                    checkKey: false,
                                    checkValue: false,
                                    operator: "EQUAL",
                                  },
                                ]);
                              }}
                            >
                              <Icon name="PlusCircleFill" />
                            </span>
                          </Tippy>
                        </div> */}

                        {/* {listCondition.length > 1 ? ( */}
                        <div className="remove-attribute">
                          <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                            <span
                              className="icon-remove"
                              onClick={() => {
                                const newList = [...listCondition];
                                newList.splice(index, 1);
                                setListCondition(newList);
                              }}
                            >
                              <Icon name="Trash" />
                            </span>
                          </Tippy>
                        </div>
                        {/* ) : null} */}
                      </div>
                    ))
                  : null}
              </div>

              <div className="container-outVar">
                <div>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Biến đầu ra</span>
                </div>
                {listOutVar && listOutVar.length > 0
                  ? listOutVar.map((item, index) => (
                      <div key={index} className="list-item-outVar">
                        <div className="item-outVar">
                          <Input
                            id="name"
                            name="name"
                            label={index === 0 ? "Tên tham số đầu ra" : ""}
                            fill={true}
                            required={false}
                            error={item.checkName}
                            message="Tên tham số đầu ra không được để trống"
                            placeholder={"Tên tham số đầu ra"}
                            value={item.name}
                            onChange={(e) => {
                              const value = e.target.value;
                              setListOutVar((current) =>
                                current.map((obj, idx) => {
                                  if (index === idx) {
                                    return { ...obj, name: value, checkName: false };
                                  }
                                  return obj;
                                })
                              );
                            }}
                          />
                        </div>
                        <div className="item-outVar">
                          {index === 0 ? (
                            <div>
                              <span style={{ fontSize: 14, fontWeight: "700" }}>Biến quy trình</span>
                            </div>
                          ) : null}
                          <div className={"container-select-mapping"}>
                            <div className="select-mapping">
                              <SelectCustom
                                key={item?.mappingType}
                                id="fielName"
                                name="fielName"
                                // label={index === 0 ? "Biến quy trình" : ''}
                                fill={false}
                                required={false}
                                error={item.checkMapping}
                                message="Biến quy trình không được để trống"
                                options={[]}
                                value={item.attributeMapping ? { value: item.attributeMappingId, label: item.attributeMapping } : null}
                                onChange={(e) => {
                                  setListOutVar((current) =>
                                    current.map((obj, idx) => {
                                      if (index === idx) {
                                        return { ...obj, attributeMapping: e.label, attributeMappingId: e.value, checkMapping: false };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                                isAsyncPaginate={true}
                                isFormatOptionLabel={false}
                                // placeholder={item.mappingType === 2 ? "Chọn biến" : 'Chọn trường trong form'}
                                placeholder={item.mappingType === 2 ? "Chọn biến" : "Chọn trường trong form"}
                                additional={{
                                  page: 1,
                                }}
                                loadOptionsPaginate={item?.mappingType === 2 ? loadedOptionAttribute : loadedOptionForm}
                                // formatOptionLabel={formatOptionLabelEmployee}
                                // error={checkFieldEform}
                                // message="Biểu mẫu không được bỏ trống"
                                // disabled={}
                              />
                            </div>
                            {/* <Tippy content={item.mappingType === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}>
                              <div
                                className={"icon-change-select"}
                                onClick={(e) => {
                                  if (item.mappingType === 1) {
                                    setListOutVar((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, mappingType: 2 };
                                        }
                                        return obj;
                                      })
                                    );
                                  } else {
                                    setListOutVar((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return { ...obj, mappingType: 1 };
                                        }
                                        return obj;
                                      })
                                    );
                                  }
                                }}
                              >
                                <Icon name="ResetPassword" style={{ width: 18 }} />
                              </div>
                            </Tippy> */}
                          </div>
                        </div>
                        <div className="add-attribute" style={index === 0 ? { marginTop: "3.2rem" } : {}}>
                          <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                            <span
                              className="icon-add"
                              onClick={() => {
                                setListOutVar([
                                  ...listOutVar,
                                  {
                                    name: "",
                                    attributeMapping: "",
                                    attributeMappingId: "",
                                    mappingType: 2,
                                    checkName: false,
                                    checkMapping: false,
                                  },
                                ]);
                              }}
                            >
                              <Icon name="PlusCircleFill" />
                            </span>
                          </Tippy>
                        </div>

                        {listOutVar.length > 1 ? (
                          <div className="remove-attribute" style={index === 0 ? { marginTop: "3.2rem" } : {}}>
                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                              <span
                                className="icon-remove"
                                onClick={() => {
                                  const newList = [...listOutVar];
                                  newList.splice(index, 1);
                                  setListOutVar(newList);
                                }}
                              >
                                <Icon name="Trash" />
                              </span>
                            </Tippy>
                          </div>
                        ) : null}
                      </div>
                    ))
                  : null}
              </div>

              {/* <div className="container-handleError">
                <RadioList
                  options={dataHandleError}
                  required={true}
                  title="Xử lý lỗi"
                  name="errorHandling"
                  value={formData.errorHandling}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, errorHandling: value });
                  }}
                />

                {formData.errorHandling === "Retry" ? (
                  <div className="box-handleError">
                    <div className="item-times">
                      <NummericInput
    
                        label="Số lần"
                        fill={true}
                        required={true}
                        placeholder={"Số lần"}
                        value={handleErrorData?.times}
                        onValueChange={(e) => {
                          const value = e.floatValue || "";
                          setHandleErrorData({ ...handleErrorData, times: value });
                        }}
                      />
                    </div>
                    <div className="item-times">
                      <NummericInput

                        label="Thời gian lặp lại (giây)"
                        fill={true}
                        required={true}
                        placeholder={"Thời gian lặp lại (giây)"}
                        value={handleErrorData?.loopTime}
                        onValueChange={(e) => {
                          const value = e.floatValue || "";
                          setHandleErrorData({ ...handleErrorData, loopTime: value });
                        }}
                      />
                    </div>
                  </div>
                ) : null}

                {formData.errorHandling === "Chuyển sang một luồng thay thế" ? (
                  <div className="box-handleError">
                    <div className="item-next-node">
                      <SelectCustom
                        id="nodeId"
                        name="nodeId"
                        label="Chọn luồng thay thế"
                        fill={true}
                        required={true}
                        options={[]}
                        value={handleErrorData?.nodeId ? { value: handleErrorData.nodeId, label: handleErrorData.nodeName } : null}
                        onChange={(e) => {
                          setHandleErrorData({ ...handleErrorData, nodeId: e.value, nodeName: e.label });
                        }}
                        isAsyncPaginate={false}
                        isFormatOptionLabel={false}
                        placeholder="Chọn luồng thay thế"
                      />
                    </div>
                  </div>
                ) : null}
              </div> */}

              {/* <div className="form-group">
                <SelectCustom
                  id="executionMode"
                  name="executionMode"
                  label="Chế độ thực thi"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: "synchronous",
                      label: "Đồng bộ",
                    },
                    {
                      value: "asynchronous",
                      label: "Bất đồng bộ",
                    },
                  ]}
                  value={
                    formData.executionMode
                      ? { value: formData.executionMode, label: formData.executionMode === "synchronous" ? "Đồng bộ" : "Bất đồng bộ" }
                      : null
                  }
                  onChange={(e) => {
                    setFormData({ ...formData, executionMode: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn chế độ thực thi"
                />
              </div> */}

              {/* <div className="form-group">
                <NummericInput
                  id="timeout"
                  name="timeout"
                  label="Thời gian chờ (giây)"
                  fill={true}
                  required={true}
                  placeholder={"Thời gian chờ (giây)"}
                  value={formData.timeout}
                  onValueChange={(e) => {
                    const value = e.floatValue || "";
                    setFormData({ ...formData, timeout: value });
                  }}
                />
              </div> */}

              {/* <div className="form-group">
                <SelectCustom
                  id="messageProcessing"
                  name="messageProcessing"
                  label="Xử lý thông điệp nhận được"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: "Lưu trữ",
                      label: "Lưu trữ",
                    },
                    {
                      value: "Xác thực",
                      label: "Xác thực",
                    },
                    {
                      value: "Chuyển đổi dữ liệu",
                      label: "Chuyển đổi dữ liệu",
                    },
                  ]}
                  value={formData.messageProcessing ? { value: formData.messageProcessing, label: formData.messageProcessing } : null}
                  onChange={(e) => {
                    setFormData({ ...formData, messageProcessing: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn xử lý thông điệp nhận được"
                  // additional={{
                  //     page: 1,
                  // }}
                  // loadOptionsPaginate={loadOptionSaleflow}
                  // formatOptionLabel={formatOptionLabelCustomer}
                  // disabled={checkParamsUrl}
                />
              </div> */}

              <div className="form-group">
                <SelectCustom
                  // key={listAttribute.length}
                  id=""
                  name="name"
                  label={"Luồng công việc"}
                  fill={true}
                  required={false}
                  // error={item.checkMapping}
                  // message="Biến quy trình không được để trống"
                  options={[]}
                  value={dataWorkflow}
                  onChange={(e) => {
                    setDataWorkflow(e);
                    setFormData({ ...formData, workflowId: e.value });
                  }}
                  isAsyncPaginate={true}
                  placeholder="Chọn luồng công việc"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionWorkflow}
                  // formatOptionLabel={formatOptionLabelAttribute}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
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
