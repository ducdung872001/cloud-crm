import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj } from "reborn-util";
import "./index.scss";
import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import Tippy from "@tippyjs/react";
import RadioList from "components/radio/radioList";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";
import ModalSetting from "../ModalUserTask/partials/ModalSetting";
import ModalSelectNodeOther from "../ModalSelectNodeOther";
import ModalDebug from "../ModalUserTask/partials/ModalDebug";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";

export default function ModalSignalIntermediateThrowEvent({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
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
    const response = await BusinessProcessService.detailSignalIntermediateThrowEvent(id);

    if (response.code == 0) {
      const result = response.result;

      const errorHandling = (result?.errorHandling && JSON.parse(result.errorHandling)) || null;
      setHandleErrorData(errorHandling?.config || null);

      let inputVarParsed: any = {};
      try {
        inputVarParsed = result.inputVar ? JSON.parse(result.inputVar) : {};
      } catch (error) {
        inputVarParsed = {};
      }

      const listInputVarData =
        inputVarParsed && typeof inputVarParsed === "object" && !Array.isArray(inputVarParsed)
          ? Object.entries(inputVarParsed).map(([key, value]) => {
              const valueString = typeof value === "string" ? value : value?.toString?.() || "";
              return {
                name: key,
                attributeMapping: valueString,
                attributeMappingId: valueString,
                mappingType: valueString.startsWith("var_") ? 2 : valueString.startsWith("frm_") ? 1 : 0,
                checkName: false,
                checkMapping: false,
              };
            })
          : [];

      if (listInputVarData && listInputVarData.length > 0) {
        setListInputVar(listInputVarData);
      } else {
        setListInputVar([
          {
            name: "",
            attributeMapping: null,
            attributeMappingId: "",
            mappingType: 1,
            checkName: false,
            checkMapping: false,
          },
        ]);
      }

      const arrayOut =
        (result.outputVar &&
          JSON.parse(result.outputVar) &&
          Object.entries(JSON.parse(result.outputVar)).map(([key, value]) => {
            return { [key]: value };
          })) ||
        [];
      const newListOutputVarData = Array.isArray(arrayOut) && arrayOut.length > 0 ? arrayOut : [];
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
        // const lastSlashIndex = str.lastIndexOf("-");
        // messagePath = str.substring(lastSlashIndex + 1);

        // tìm vị trí của "bpm-signal-intermediate-"
        const prefix = "bpm-signal-intermediate-";
        messagePath = str.startsWith(prefix) ? str.slice(prefix.length) : str;
      }

      const data = {
        ...result,
        errorHandling: errorHandling?.type || "Retry",
        ...(messagePath ? { messageId: messagePath } : {}),
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
      messageId: data?.messageId ?? "",
      endpoint: data?.endpoint ?? null,
      inputVar: "",
      outputVar: "",
      errorHandling: data?.errorHandling ?? "Retry",
      timeout: data?.timeout ?? "",
      signalRef: data?.signalRef ?? null,
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
    let hasErrorInput = false;

    const listInputVarValidated = listInputVarData.map((item) => {
      const isEmptyRow = !item.name && !item.attributeMapping && !item.attributeMappingId;
      let checkName = item.checkName;
      let checkMapping = item.checkMapping;

      if (isEmptyRow) {
        return {
          ...item,
          checkName: false,
          checkMapping: false,
        };
      }

      if (!item.name) {
        checkName = true;
        hasErrorInput = true;
      }

      if (item.mappingType === 0) {
        if (!item.attributeMapping) {
          checkMapping = true;
          hasErrorInput = true;
        }
      } else {
        if (!item.attributeMappingId) {
          checkMapping = true;
          hasErrorInput = true;
        }
      }

      return {
        ...item,
        checkName,
        checkMapping,
      };
    });

    if (hasErrorInput) {
      setListInputVar(listInputVarValidated);
      showToast("Vui lòng kiểm tra lại thông tin biến đầu vào", "error");
      return;
    }

    const listInputVarSubmit = listInputVarValidated
      .filter((item) => item.name && (item.mappingType === 0 ? item.attributeMapping : item.attributeMappingId))
      .map((item) => {
        const value = item.mappingType === 0 ? item.attributeMapping : item.attributeMappingId;

        return {
          [item.name]: value,
        };
      });

    const objInput = listInputVarSubmit.reduce((acc, curr) => {
      const key = Object.keys(curr)[0];
      acc[key] = curr[key];
      return acc;
    }, {});

    ///validate biến đầu ra
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

    ///validate Điều kiện nhận thông điệp
    const listMessageCorrelation = [...listCondition];

    const listMessageCorrelationSubmit = (listMessageCorrelation || []).map((item) => {
      return {
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
      messageId: `bpm-signal-intermediate-${formData?.messageId}`,
      endpoint: formData?.endpoint ?? "",
      inputVar: JSON.stringify(objInput || {}),
      outputVar: JSON.stringify(objOut),
      errorHandling: JSON.stringify(errorHandlingSubmit),
      signalRef: formData?.signalRef ?? "",
      messageCorrelation: listMessageCorrelationSubmit?.length > 0 ? JSON.stringify(listMessageCorrelationSubmit) : null,
      timeout: formData?.timeout ?? "",
      executionMode: formData?.executionMode ?? null,
      messageProcessing: formData?.messageProcessing,
      nodeId: dataNode?.id ?? null,
      processId: formData?.processId ?? null,
      workflowId: formData?.workflowId ?? null,
    };

    console.log("body", body);

    const response = await BusinessProcessService.updateSignalIntermediateThrowEvent(body);

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
        attributeMapping: null,
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
        className="modal-signal-intermediate-throw-event"
      >
        <form className="form-signal-intermediate-throw" onSubmit={(e) => onSubmit(e)}>
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
                  id="signalRef"
                  name="signalRef"
                  label="Tên tín hiệu"
                  fill={true}
                  required={true}
                  placeholder={"Tên tín hiệu"}
                  value={formData.signalRef}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, signalRef: value });
                  }}
                />
              </div>

              <div className="form-group">
                <Input
                  id="code"
                  name="code"
                  label="Mã nhiệm vụ"
                  fill={true}
                  required={true}
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

              <div className="form-group" style={{ width: "100%" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Định danh thông điệp (Topic)</span>
                </div>
                <div className="box-input-message">
                  <span style={{ fontSize: 14, fontWeight: "400" }}>bpm-signal-intermediate-</span>
                  <Input
                    name="messageId"
                    value={formData.messageId}
                    label=""
                    fill={false}
                    required={false}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, messageId: value });
                    }}
                    placeholder=""
                  />
                </div>
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
                            id="mappingNameInput"
                            name="mappingNameInput"
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
                                  name={`mapping-value-${index}`}
                                  fill={false}
                                  value={item.attributeMapping}
                                  error={item.checkMapping}
                                  message="Giá trị không được để trống"
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setListInputVar((current) =>
                                      current.map((obj, idx) => {
                                        if (index === idx) {
                                          return {
                                            ...obj,
                                            attributeMapping: value,
                                            attributeMappingId: value,
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
                                  key={`${index}-${item?.mappingType}`}
                                  id="inputMappingFieldName"
                                  name="inputMappingFieldName"
                                  fill={false}
                                  required={false}
                                  error={item.checkMapping}
                                  message="Giá trị không được để trống"
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
                                  placeholder={item.mappingType === 2 ? "Chọn biến" : "Chọn trường trong form"}
                                  additional={{
                                    page: 1,
                                  }}
                                  loadOptionsPaginate={item?.mappingType === 2 ? loadedOptionAttribute : loadedOptionForm}
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
                                onClick={() => {
                                  setListInputVar((current) =>
                                    current.map((obj, idx) => {
                                      if (index === idx) {
                                        const nextType = obj.mappingType === 0 ? 1 : obj.mappingType === 1 ? 2 : obj.mappingType === 2 ? 0 : 1;
                                        return {
                                          ...obj,
                                          mappingType: nextType,
                                          attributeMapping: "",
                                          attributeMappingId: "",
                                          checkMapping: false,
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
                                setListInputVar((current) => {
                                  const lastItem = current[current.length - 1];
                                  return [
                                    ...current,
                                    {
                                      name: "",
                                      attributeMapping: null,
                                      attributeMappingId: "",
                                      mappingType: lastItem ? lastItem.mappingType : 1,
                                      checkName: false,
                                      checkMapping: false,
                                    },
                                  ];
                                });
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
                            value={item.operator ? { value: item.operator, label: item.operator } : null}
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
                                placeholder={item.mappingType === 2 ? "Chọn biến" : "Chọn trường trong form"}
                                additional={{
                                  page: 1,
                                }}
                                loadOptionsPaginate={item?.mappingType === 2 ? loadedOptionAttribute : loadedOptionForm}
                              />
                            </div>
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
                <RadioList
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
                />

                {formData.errorHandling === "Retry" ? (
                  <div className="box-handleError">
                    <div className="item-times">
                      <NummericInput
                        // id="username"
                        // name="username"
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
              </div>

              <div className="form-group">
                <SelectCustom
                  id=""
                  name="name"
                  label={"Luồng công việc"}
                  fill={true}
                  required={false}
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
                />
              </div>

              <div className="form-group">
                <SelectCustom
                  id="executionMode"
                  name="executionMode"
                  label="Chế độ thực thi"
                  fill={true}
                  special={true}
                  required={true}
                  options={[
                    {
                      value: 1,
                      label: "Đồng bộ",
                    },
                    {
                      value: 2,
                      label: "Bất đồng bộ",
                    },
                  ]}
                  value={
                    formData.executionMode ? { value: formData.executionMode, label: formData.executionMode === 1 ? "Đồng bộ" : "Bất đồng bộ" } : null
                  }
                  onChange={(e) => {
                    setFormData({ ...formData, executionMode: e.value });
                  }}
                  isAsyncPaginate={false}
                  isFormatOptionLabel={false}
                  placeholder="Chọn chế độ thực thi"
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
