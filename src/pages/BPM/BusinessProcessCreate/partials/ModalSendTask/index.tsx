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
import CheckboxList from "components/checkbox/checkboxList";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";

export default function ModalSendTask({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isModalClone, setIsModalClone] = useState(false);
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [isModalDebug, setIsModalDebug] = useState(false);
  const [data, setData] = useState(null);
  const [recipientData, setRecipientData] = useState(null);
  const [handleErrorData, setHandleErrorData] = useState(null);

  const [childProcessId, setChildProcessId] = useState(null);
  const [dataWorkflow, setDataWorkflow] = useState(null);

  const [listInputVar, setListInputVar] = useState([
    {
      name: "",
      attributeMapping: null,
      attributeMappingId: "",
      mappingType: 1,
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

  const dataHandleError = [
    {
      value: "Retry",
      label: "Retry",
    },
    {
      value: "Fallback",
      label: "Chuyển sang một luồng thay thế",
    },
  ];

  const dataRecipient = [
    // {
    //   value: "Người dùng",
    //   label: "Người dùng",
    // },
    {
      value: "Hệ thống khác",
      label: "Hệ thống khác",
    },
    {
      value: "Dịch vụ",
      label: "Dịch vụ",
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
    const response = await BusinessProcessService.detailSendTask(id);

    if (response.code == 0) {
      const result = response.result;

      const recipient = (result?.recipient && JSON.parse(result.recipient)) || null;
      setRecipientData(recipient?.config || null);

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
          mappingType: attributeMapping?.includes("var") ? 2 : attributeMapping?.includes("frm") ? 1 : 0,
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
              mappingType: 1,
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
        // getVarSetup(attributeMapping)
        return {
          name: name,
          attributeMapping: attributeMapping,
          attributeMappingId: attributeMapping,
          mappingType: attributeMapping?.includes("var") ? 2 : attributeMapping?.includes("frm") ? 1 : 0,
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
              mappingType: 1,
              checkName: false,
              checkMapping: false,
            },
          ]
        );
      }

      const data = {
        ...result,
        recipient: recipient?.type || "Người dùng",
        errorHandling: errorHandling?.type || "Retry",
      };

      setData(data);
      setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const values = useMemo(
    () => ({
      id: null,
      name: data?.name ?? "",
      code: data?.code ?? "",
      host: data?.host ?? "",
      port: data?.port ?? "",
      description: data?.description ?? "",
      messageName: data?.messageName ?? "",
      messageId: data?.messageId ?? "",
      recipient: data?.recipient ?? "Hệ thống khác",
      endpoint: data?.endpoint ?? null,
      inputVar: data?.inputVar ?? "",
      messageFormat: data?.messageFormat ?? "",
      method: data?.method ?? "",
      ackRequired: data?.ackRequired ?? 0,
      errorHandling: data?.errorHandling ?? "",
      nodeId: dataNode?.id ?? null,
      processId: childProcessId ?? processId ?? null,
      workflowId: data?.workflowId ?? null,
    }),
    [onShow, data, dataNode, processId, childProcessId]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  // useEffect(() => {
  //   if (formData.errorHandling) {
  //     const errorHandling = formData.errorHandling;
  //     if (errorHandling.split(",").includes("Retry")) {
  //       setHandleErrorData({retry: {enabled: true, times: "", loopTime: "" }});
  //       // listError.push({retry: {enabled: true, times: "", loopTime: "" }})
  //     }
  //     if (errorHandling.split(",").includes("Chuyển sang một luồng thay thế")) {
  //       setHandleErrorData({fallback: {enabled: true, nodeId: "", workflowId: "" }});
  //     }
  //     if (errorHandling.split(",").includes("Retry") && errorHandling.split(",").includes("Chuyển sang một luồng thay thế") ) {
  //       if(handleErrorData.retry){
  //         setHandleErrorData(
  //           {
  //             ...handleErrorData,
  //             fallback: {enabled: true, nodeId: "", workflowId: "" }
  //           }
  //         );
  //       }

  //       if(handleErrorData.retry){
  //         setHandleErrorData(
  //           {
  //             ...handleErrorData,
  //             retry: {enabled: true, times: "", loopTime: "" },
  //           }
  //         );
  //       }

  //     }
  //   }
  // }, [formData.errorHandling]);

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
        [item.name]: item.attributeMapping,
      };
    });

    const objInput = listInputVarSubmit.reduce((acc, curr) => {
      const key = Object.keys(curr)[0];
      acc[key] = curr[key];
      return acc;
    });

    const listOutVarData = [...listOutVar];
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

    const recipientSubmit = {
      type: formData.recipient,
      config: recipientData,
    };

    const errorHandlingSubmit = {
      type: formData.errorHandling,
      config: handleErrorData,
    };

    setIsSubmit(true);

    const body = {
      id: data?.id ?? null,
      name: formData.name ?? "",
      code: formData?.code ?? "",
      host: formData?.host ?? "",
      port: formData?.port ?? "",
      description: formData?.description ?? "",
      messageName: formData?.messageName ?? "",
      messageId: formData?.messageId ?? "",
      endpoint: formData?.endpoint ?? "",
      method: formData?.method ?? null,
      recipient: JSON.stringify(recipientSubmit),
      inputVar: JSON.stringify(objInput),
      outputVar: JSON.stringify(objOut),
      messageFormat: formData?.messageFormat ?? "",
      errorHandling: JSON.stringify(errorHandlingSubmit),
      ackRequired: formData?.ackRequired ?? 0,
      nodeId: dataNode?.id ?? null,
      processId: formData?.processId ?? null,
      workflowId: formData?.workflowId ?? null,
    };
    console.log("body", body);

    const response = await BusinessProcessService.updateSendTask(body);

    if (response.code === 0) {
      showToast(`Cập nhật biểu mẫu thành công`, "success");
      handleClear(false);
      changeNameNodeXML(dataNode, body.name);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

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
    setData(null);
    setRecipientData(null);
    setListInputVar([
      {
        name: "",
        attributeMapping: "",
        attributeMappingId: "",
        mappingType: 1,
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-send-task"
      >
        <form className="form-send-task" onSubmit={(e) => onSubmit(e)}>
          {/* <ModalHeader title={`Cài đặt biểu mẫu`} toggle={() => !isSubmit && handleClear(false)} /> */}
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt biểu mẫu"}</h4>
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

              <div className="form-group">
                <Input
                  id="host"
                  name="host"
                  label="Host"
                  fill={true}
                  required={false}
                  placeholder={"Nhập Host"}
                  value={formData.host}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, host: value });
                  }}
                />
              </div>

              <div className="form-group">
                <NummericInput
                  id="port"
                  name="port"
                  label="Port"
                  fill={true}
                  required={false}
                  placeholder={"Nhập Port"}
                  value={formData.port}
                  onValueChange={(e) => {
                    const value = e.floatValue || "";
                    setFormData({ ...formData, port: value });
                  }}
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
                  placeholder="Nhập tên thông điệp"
                />
              </div> */}

              <div className="form-group" style={{ width: "100%" }}>
                <Input
                  name="messageId"
                  value={formData.messageId}
                  label="Định danh thông điệp"
                  fill={true}
                  required={true}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, messageId: value });
                  }}
                  placeholder="Định danh tên thông điệp"
                />
              </div>

              <div className="container-inputVar">
                <div>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Biến đầu vào</span>
                </div>
                {listInputVar && listInputVar.length > 0
                  ? listInputVar.map((item, index) => (
                      <div key={index} className="list-item-inputVar">
                        <div className="item-inputVar">
                          <Input
                            id="nameInput"
                            name="nameInput"
                            label={index === 0 ? "Tên tham số đầu vào" : ""}
                            fill={true}
                            required={false}
                            error={item.checkName}
                            message="Tên tham số đầu vào không được để trống"
                            placeholder={"Tên tham số đầu vào"}
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
                              <span style={{ fontSize: 14, fontWeight: "700" }}>Biến quy trình</span>
                            </div>
                          ) : null}
                          <div className={"container-select-mapping"}>
                            {!item.mappingType ? (
                              <div className="input-text">
                                <Input
                                  name={item.attributeMapping}
                                  fill={false}
                                  value={item.attributeMapping}
                                  onChange={(e) => {
                                    setListInputVar((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return {
                                            ...obj,
                                            attributeMapping: e.target.value,
                                            attributeMappingId: e.target.value,
                                            checkMapping: false,
                                          };
                                        }
                                        return obj;
                                      })
                                    );
                                  }}
                                  placeholder={`Nhập giá trị`}
                                />
                              </div>
                            ) : (
                              <div className="select-mapping">
                                <SelectCustom
                                  key={item?.mappingType}
                                  id="fieldName"
                                  name="fieldName"
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
                                />
                              </div>
                            )}

                            <Tippy
                              content={
                                item.mappingType === 0
                                  ? "Chuyển chọn trường trong form"
                                  : item.mappingType === 1
                                  ? "Chuyển chọn biến"
                                  : "Chuyển nhập giá trị"
                              }
                            >
                              <div
                                className={"icon-change-select"}
                                onClick={(e) => {
                                  setListInputVar((current) =>
                                    current.map((obj, idx) => {
                                      if (index === idx) {
                                        return {
                                          ...obj,
                                          mappingType: item.mappingType === 0 ? 1 : item.mappingType === 1 ? 2 : 0,
                                          attributeMapping: "",
                                          attributeMappingId: "",
                                        };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                              >
                                <Icon name="ResetPassword" style={{ width: 18 }} />
                              </div>
                            </Tippy>
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
                                    mappingType: listInputVar.length > 0 ? listInputVar[listInputVar.length - 1].mappingType : 1,
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

              <div className="container-handleError">
                {/* <RadioList
                  options={dataHandleError}
                  // className="options-auth"
                  required={true}
                  title="Xử lý lỗi"
                  name="errorHandling"
                  value={formData.errorHandling}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, errorHandling: value });
                  }}
                /> */}

                <CheckboxList
                  title="Xử lý lỗi"
                  options={dataHandleError}
                  value={formData.errorHandling}
                  onChange={(e) => {
                    console.log("e", e);
                    setFormData({ ...formData, errorHandling: e });
                    // if(e){
                    //   setListNotifyType(e);
                    // } else {
                    //   setListNotifyType(listNofifyType);
                    // }
                    if (e.split(",").includes("Retry") && e.split(",").includes("Fallback")) {
                      if (handleErrorData?.retry) {
                        setHandleErrorData({
                          ...handleErrorData,
                          fallback: { nodeId: "", workflowId: "" },
                        });
                      }

                      if (handleErrorData?.fallback) {
                        setHandleErrorData({
                          ...handleErrorData,
                          retry: { times: "", loopTime: "" },
                        });
                      }
                    } else if (e.split(",").includes("Retry")) {
                      if (handleErrorData?.retry) {
                        setHandleErrorData({ retry: { ...handleErrorData.retry } });
                      } else {
                        setHandleErrorData({ retry: { times: "", loopTime: "" } });
                      }
                    } else if (e.split(",").includes("Fallback")) {
                      // setHandleErrorData({fallback: {nodeId: "", workflowId: "" }});
                      if (handleErrorData?.fallback) {
                        setHandleErrorData({ fallback: { ...handleErrorData.fallback } });
                      } else {
                        setHandleErrorData({ fallback: { nodeId: "", workflowId: "" } });
                      }
                    }
                  }}
                />

                {formData.errorHandling.split(",").includes("Retry") ? (
                  <div className="box-handleError">
                    <div className="item-times">
                      <NummericInput
                        // id="username"
                        // name="username"
                        label="Số lần"
                        fill={true}
                        required={true}
                        placeholder={"Số lần"}
                        value={handleErrorData?.retry?.times}
                        onValueChange={(e) => {
                          const value = e.floatValue || "";
                          setHandleErrorData({ ...handleErrorData, retry: { ...handleErrorData?.retry, times: value } });
                        }}
                      />
                    </div>
                    <div className="item-times">
                      <NummericInput
                        // id="username"
                        // name="username"
                        label="Thời gian lặp lại (giây)"
                        fill={true}
                        required={true}
                        placeholder={"Thời gian lặp lại (giây)"}
                        value={handleErrorData?.retry?.loopTime}
                        onValueChange={(e) => {
                          const value = e.floatValue || "";
                          setHandleErrorData({ ...handleErrorData, retry: { ...handleErrorData?.retry, loopTime: value } });
                        }}
                      />
                    </div>
                  </div>
                ) : null}
                {formData.errorHandling.split(",").includes("Fallback") ? (
                  <div className="box-handleError">
                    <div className="item-next-node">
                      <SelectCustom
                        id="nodeId"
                        name="nodeId"
                        label="Chọn luồng thay thế"
                        fill={true}
                        required={true}
                        options={[]}
                        value={
                          handleErrorData?.fallback?.nodeId
                            ? { value: handleErrorData?.fallback?.nodeId, label: handleErrorData?.fallback?.nodeName }
                            : null
                        }
                        onChange={(e) => {
                          setHandleErrorData({ ...handleErrorData, fallback: { ...handleErrorData?.fallback, nodeId: e.value, nodeName: e.label } });
                          // setHandleErrorData({ ...handleErrorData, nodeId: e.value, nodeName: e.label });
                        }}
                        isAsyncPaginate={false}
                        isFormatOptionLabel={false}
                        placeholder="Chọn luồng thay thế"
                        // additional={{
                        //     page: 1,
                        // }}
                        // loadOptionsPaginate={loadOptionSaleflow}
                        // formatOptionLabel={formatOptionLabelCustomer}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* <div
                className="form-group"
                // style={{width: 'calc(38% - 1.6rem)'}}
              >
                <SelectCustom
                  id="messageFormat"
                  name="messageFormat"
                  label="Định dạng thông điệp"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: "JSON",
                      label: "JSON",
                    },
                    {
                      value: "XML",
                      label: "XML",
                    },
                    {
                      value: "Plain Text",
                      label: "Plain Text",
                    },
                  ]}
                  value={formData.messageFormat ? { value: formData.messageFormat, label: formData.messageFormat } : null}
                  onChange={(e) => {
                    setFormData({ ...formData, messageFormat: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn định dạng thông điệp"
                />
              </div> */}

              {/* <div
                className="form-group"
                // style={{width: 'calc(38% - 1.6rem)'}}
              >
                <SelectCustom
                  id="method"
                  name="method"
                  label="Phương thức gửi"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: "HTTP POST",
                      label: "HTTP POST",
                    },
                    {
                      value: "HTTP GET",
                      label: "HTTP GET",
                    },
                    {
                      value: "SOAP",
                      label: "SOAP",
                    },
                  ]}
                  value={formData.method ? { value: formData.method, label: formData.method } : null}
                  onChange={(e) => {
                    setFormData({ ...formData, method: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn phương thức gửi"
                  // additional={{
                  //     page: 1,
                  // }}
                  // loadOptionsPaginate={loadOptionSaleflow}
                  // formatOptionLabel={formatOptionLabelCustomer}
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
              <div
                className="button-check"
                onClick={() => {
                  setFormData({ ...formData, ackRequired: 1 });
                }}
              >
                <div className="icon-check">
                  <Icon name={formData?.ackRequired === 0 ? "Test" : "Checked"} style={{ width: 20, height: 20, fill: "var(--primary-color)" }} />
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Xác nhận gửi</span>
                </div>
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
