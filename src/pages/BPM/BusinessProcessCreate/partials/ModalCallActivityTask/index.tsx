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
import BpmnJS from "bpmn-js/dist/bpmn-modeler.production.min.js";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import BpmnViewer from "bpmn-js/lib/NavigatedViewer";
import Button from "components/button/button";
import ModalDebug from "../ModalUserTask/partials/ModalDebug";
import ModalSelectNodeOther from "../ModalSelectNodeOther";
import ModalSetting from "../ModalUserTask/partials/ModalSetting";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";

export default function ModalCallActivityTask({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
  const modelerRef = useRef(null);
  const bpmnModeler = useRef(null);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isModalClone, setIsModalClone] = useState(false);
  const [isModalDebug, setIsModalDebug] = useState(false);
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [data, setData] = useState(null);
  const [isViewProcess, setIsViewProcess] = useState(false);
  const [processReferData, setProcessReferData] = useState(null);
  const [handleErrorData, setHandleErrorData] = useState(null);
  const [dataWorkflow, setDataWorkflow] = useState(null);
  const [childProcessId, setChildProcessId] = useState(null);

  const [listInputVar, setListInputVar] = useState([
    {
      name: "",
      attributeMapping: "",
      attributeMappingId: "",
      mappingType: 1,
      checkName: false,
      checkMapping: false,
    },
  ]);

  const [listOutVar, setListOutVar] = useState([
    {
      name: "",
      attributeMapping: "",
      attributeMappingId: "",
      mappingType: 1,
      checkName: false,
      checkMapping: false,
    },
  ]);

  const [listTriggerCondition, setListTriggerCondition] = useState([
    {
      key: "",
      value: "",
      checkKey: false,
      checkValue: false,
    },
  ]);

  const [listCompletionConditions, setListCompletionConditions] = useState([
    {
      key: "",
      value: "",
      checkKey: false,
      checkValue: false,
    },
  ]);

  const [listParameterMapping, setListParameterMapping] = useState([
    {
      name: "",
      attributeMapping: "",
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
      value: "Chuyển sang một luồng thay thế",
      label: "Chuyển sang một luồng thay thế",
    },
  ];

  const dataProcessRefer = [
    {
      value: "Quy trình con",
      label: "Quy trình con",
    },
    {
      value: "Quy trình độc lập",
      label: "Quy trình độc lập",
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
    const response = await BusinessProcessService.detailCallActivityTask(id);

    if (response.code == 0) {
      const result = response.result;

      const errorHandling = (result?.errorHandling && JSON.parse(result.errorHandling)) || null;
      setHandleErrorData(errorHandling?.config || null);

      if (result.processRefer) {
        getDetailBusinessProcess(+result.processRefer);
      }

      /////
      const arrayInput =
        (result.inputParams &&
          JSON.parse(result.inputParams) &&
          Object.entries(JSON.parse(result.inputParams)).map(([key, value]) => {
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
          mappingType: attributeMapping?.includes("var") ? 2 : 1,
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

      ////////
      const arrayOut =
        (result.outputParams &&
          JSON.parse(result.outputParams) &&
          Object.entries(JSON.parse(result.outputParams)).map(([key, value]) => {
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
          mappingType: attributeMapping?.includes("var") ? 2 : 1,
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

      /////
      const newListTriggerConditionData =
        result?.triggerCondition &&
        JSON.parse(result.triggerCondition) &&
        Array.isArray(JSON.parse(result.triggerCondition)) &&
        JSON.parse(result.triggerCondition).length > 0
          ? JSON.parse(result.triggerCondition)
          : [];
      const listTriggerConditionData = newListTriggerConditionData.map((item) => {
        const key = Object.entries(item)[0][0];
        const value = Object.entries(item)[0][1];

        return {
          key: key,
          value: value,
          checkName: false,
          checkMapping: false,
        };
      });
      if (listTriggerConditionData && listTriggerConditionData.length > 0) {
        setListTriggerCondition(listTriggerConditionData || [{ key: "", value: "", checkKey: false, checkValue: false }]);
      }

      /////
      const newListCompletionConditionsData =
        result?.completionConditions &&
        JSON.parse(result.completionConditions) &&
        Array.isArray(JSON.parse(result.completionConditions)) &&
        JSON.parse(result.completionConditions).length > 0
          ? JSON.parse(result.completionConditions)
          : [];
      const listCompletionConditionsData = newListCompletionConditionsData.map((item) => {
        const key = Object.entries(item)[0][0];
        const value = Object.entries(item)[0][1];

        return {
          key: key,
          value: value,
          checkName: false,
          checkMapping: false,
        };
      });
      if (listCompletionConditionsData && listCompletionConditionsData.length > 0) {
        setListCompletionConditions(listCompletionConditionsData || [{ key: "", value: "", checkKey: false, checkValue: false }]);
      }

      /////
      const newListParameterMappingData =
        result?.parameterMapping &&
        JSON.parse(result.parameterMapping) &&
        Array.isArray(JSON.parse(result.parameterMapping)) &&
        JSON.parse(result.parameterMapping).length > 0
          ? JSON.parse(result.parameterMapping)
          : [];
      const listParameterMappingData = newListParameterMappingData.map((item) => {
        const name = Object.entries(item)[0][0];
        const attributeMapping = Object.entries(item)[0][1];

        return {
          name: name,
          attributeMapping: attributeMapping,
          checkName: false,
          checkMapping: false,
        };
      });
      if (listParameterMappingData && listParameterMappingData.length > 0) {
        setListParameterMapping(listParameterMappingData || [{ name: "", attributeMapping: "", checkName: false, checkMapping: false }]);
      }

      setValueNode(result?.startNodeId ? { value: result?.startNodeId, label: result?.startNodeName || result?.startNodeId } : null);

      const data = {
        ...result,
        // processRefer: processRefer?.type || null,
        errorHandling: errorHandling?.type || "Retry",
      };
      setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
      setData(data);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const getDetailBusinessProcess = async (id) => {
    const response = await BusinessProcessService.getDetailDiagram(id);

    if (response.code == 0) {
      const result = response.result;
      if (result) {
        setProcessReferData({
          value: result.id,
          label: result.name,
          config: result.config,
        });
      }
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
      processRefer: data?.processRefer ?? null,
      inputVar: "",
      outputVar: "",
      triggerCondition: "",
      parameterMapping: "",
      selectVersion: data?.selectVersion ?? "",
      errorHandling: data?.errorHandling ?? "Retry",
      timeout: data?.timeout ?? "",
      completionConditions: "",
      executionMode: data?.executionMode ?? null,
      nodeId: dataNode?.id ?? null,
      processId: childProcessId ?? processId ?? null,
      workflowId: data?.workflowId ?? null,
      startNodeId: data?.startNodeId ?? null,
    }),
    [onShow, data, dataNode, processId, childProcessId]
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
        [item.name]: item.attributeMapping,
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

    ///////
    const listTriggerConditionData = [...listTriggerCondition];
    const checkEmptyTriggerCondition = listTriggerConditionData.map((item, index) => {
      if (!item.key) {
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

    // if(checkEmptyTriggerCondition && checkEmptyTriggerCondition.length > 0 && checkEmptyTriggerCondition.filter(el => el.checkKey).length > 0){
    //   setListTriggerCondition(checkEmptyTriggerCondition);
    //   return;
    // }

    // if(checkEmptyTriggerCondition && checkEmptyTriggerCondition.length > 0 && checkEmptyTriggerCondition.filter(el => el.checkValue).length > 0){
    //   setListTriggerCondition(checkEmptyTriggerCondition);
    //   return;
    // }

    const listTriggerConditionsSubmit = (listTriggerConditionData || []).map((item) => {
      return {
        [item.key]: item.value,
      };
    });

    ////////
    const listCompletionConditionsData = [...listCompletionConditions];
    const checkEmptyCompletionConditions = listCompletionConditionsData.map((item, index) => {
      if (!item.key) {
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

    // if(checkEmptyCompletionConditions && checkEmptyCompletionConditions.length > 0 && checkEmptyCompletionConditions.filter(el => el.checkKey).length > 0){
    //   setListCompletionConditions(checkEmptyCompletionConditions);
    //   return;
    // }

    // if(checkEmptyCompletionConditions && checkEmptyCompletionConditions.length > 0 && checkEmptyCompletionConditions.filter(el => el.checkValue).length > 0){
    //   setListCompletionConditions(checkEmptyCompletionConditions);
    //   return;
    // }

    const listCompletionConditionsSubmit = (listCompletionConditionsData || []).map((item) => {
      return {
        [item.key]: item.value,
      };
    });

    //////
    const listParameterMappingData = [...listParameterMapping];
    const checkEmptyParameterMapping = listParameterMappingData.map((item, index) => {
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

    // if(checkEmptyParameterMapping && checkEmptyParameterMapping.length > 0 && checkEmptyParameterMapping.filter(el => el.checkName).length > 0){
    //   setListParameterMapping(checkEmptyParameterMapping);
    //   return;
    // }

    // if(checkEmptyParameterMapping && checkEmptyParameterMapping.length > 0 && checkEmptyParameterMapping.filter(el => el.checkMapping).length > 0){
    //   setListParameterMapping(checkEmptyParameterMapping);
    //   return;
    // }

    const listParameterMappingSubmit = (listParameterMappingData || []).map((item) => {
      return {
        [item.name]: item.attributeMapping,
      };
    });

    // const processReferSubmit = {
    //     type: formData.processRefer,
    //     config: processReferData
    // }

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
      processRefer: formData.processRefer,
      inputParams: JSON.stringify(objInput),
      outputParams: JSON.stringify(objOut),
      triggerCondition: JSON.stringify(listTriggerCondition),
      parameterMapping: JSON.stringify(listParameterMappingSubmit),
      selectVersion: formData?.selectVersion ?? "",
      errorHandling: JSON.stringify(errorHandlingSubmit),
      timeout: formData?.timeout ?? "",
      completionConditions: JSON.stringify(listCompletionConditions),
      executionMode: formData?.executionMode ?? null,
      nodeId: dataNode?.id ?? null,
      processId: formData?.processId ?? null,
      workflowId: formData?.workflowId ?? null,
      startNodeId: formData.startNodeId ?? null,
    };

    console.log("body", body);

    const response = await BusinessProcessService.updateCallActivityTask(body);

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
        buttons: isViewProcess
          ? [
              {
                title: "Quay lại",
                color: "primary",
                variant: "outline",
                disabled: isSubmit,
                callback: () => {
                  setIsViewProcess(false);
                },
              },
              {
                title: "Đóng",
                color: "primary",
                variant: "outline",
                disabled: isSubmit,
                callback: () => {
                  !isDifferenceObj(formData, values) ? handleClear(false) : showDialogConfirmCancel();
                },
              },
            ]
          : [
              {
                title: disable ? "Đóng" : "Hủy",
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
    [formData, values, isSubmit, isViewProcess, dataProcessRefer, disable]
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
    setIsViewProcess(false);
    setProcessReferData(null);
    setHandleErrorData(null);
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
        mappingType: 1,
        checkName: false,
        checkMapping: false,
      },
    ]);
    setListTriggerCondition([
      {
        key: "",
        value: "",
        checkKey: false,
        checkValue: false,
      },
    ]);
    setListCompletionConditions([
      {
        key: "",
        value: "",
        checkKey: false,
        checkValue: false,
      },
    ]);
    setListParameterMapping([
      {
        name: "",
        attributeMapping: "",
        checkName: false,
        checkMapping: false,
      },
    ]);
    setValueNode(null);
    setValidateFieldNode(false);
    setProcessReferData(null);
    setDataWorkflow(null);
  };

  const loadedOptionProcess = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BusinessProcessService.list(params);

    if (response.code === 0) {
      const dataOption = response.result?.items || [];
      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  config: item.config,
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

  const loadedOptionAttributeProcessRefer = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
      processId: processReferData.value,
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

  const loadedOptionFormProcessRefer = async (search, loadedOptions, { page }) => {
    const params = {
      code: search,
      page: page,
      limit: 10,
      processId: processReferData?.value,
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
              if (el.type === "group") {
                el.components.map((il) => {
                  listForm.push({
                    value: `frm_${item.code}.${el.key || el.path}.${il.key}`,
                    label: `frm_${item.code}.${el.key || el.path}.${il.key}`,
                    nodeId: item.nodeId,
                    datatype: el.type || null,
                  });
                });
              } else {
                listForm.push({
                  value: `frm_${item.code}.${el.key || el.path}`,
                  label: `frm_${item.code}.${el.key || el.path}`,
                  nodeId: item.nodeId,
                  datatype: el.type || null,
                });
              }
            } else {
              if (el.type === "group") {
                el.components.map((il) => {
                  listForm.push({
                    value: `frm_${item.code}.${el.type}.${il.key}`,
                    label: `frm_${item.code}.${el.type}.${il.key}`,
                    nodeId: item.nodeId,
                    datatype: el.type || null,
                  });
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

  const [validateFieldNode, setValidateFieldNode] = useState<boolean>(false);
  const [valueNode, setValueNode] = useState(null);

  const loadedOptionNode = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      status: 1,
      limit: 10,
      processId: processReferData?.value,
    };

    const response = await BusinessProcessService.bpmListNode(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.nodeId,
                  label: item.name || item.nodeId,
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

  const handleChangeValueNode = (e) => {
    setValueNode(e);
    setFormData({ ...formData, startNodeId: e.value });
    setValidateFieldNode(false);
  };

  useEffect(() => {
    if (processReferData?.value) {
      loadedOptionAttributeProcessRefer("", undefined, { page: 1 });
      loadedOptionFormProcessRefer("", undefined, { page: 1 });
      loadedOptionNode("", undefined, { page: 1 });
    }
  }, [processReferData?.value]);

  useEffect(() => {
    // Khởi tạo BpmnJS modeler

    bpmnModeler.current = new BpmnViewer({
      container: modelerRef.current,
      width: "100%",
      // height: '600px',
      height: " calc(100vh - 165px)",
    });

    const initialDiagram =
      processReferData?.config ||
      `<?xml version="1.0" encoding="UTF-8"?>
      <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
        <process id="Process_1" isExecutable="true">
          
        </process>
        <message id="Message_1" name="SendOrderMessage" />
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
          <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
            
            
          </bpmndi:BPMNPlane>
        </bpmndi:BPMNDiagram>
      </definitions>`;

    // Nhập quy trình vào modeler
    bpmnModeler.current
      .importXML(initialDiagram)
      .then(({ warnings }) => {
        if (warnings.length) {
          console.warn("Warnings", warnings);
        }
      })
      .catch((err) => {
        console.error("Error importing BPMN diagram", err);
      });

    return () => {
      // Cleanup khi component bị hủy
      bpmnModeler.current.destroy();
    };
  }, [isViewProcess, processReferData]);

  // Hàm phóng to
  const handleZoomIn = () => {
    const canvas = bpmnModeler.current.get("canvas");
    const currentZoom = canvas.zoom();
    canvas.zoom(currentZoom + 0.2); // Tăng tỷ lệ zoom
  };

  // Hàm thu nhỏ
  const handleZoomOut = () => {
    const canvas = bpmnModeler.current.get("canvas");
    const currentZoom = canvas.zoom();
    canvas.zoom(currentZoom - 0.2); // Giảm tỷ lệ zoom
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
        className="modal-call-activity-task"
      >
        <form className="form-call-activity-task" onSubmit={(e) => onSubmit(e)}>
          {/* <ModalHeader title={`Cài đặt biểu mẫu`} toggle={() => !isSubmit && handleClear(false)} /> */}
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt Call Activity"}</h4>
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
            {isViewProcess ? (
              <div className="view-process">
                <div
                  ref={modelerRef}
                  style={{
                    border: "1px solid #ccc",
                    height: "52rem",
                    backgroundColor: "white",
                  }}
                />
                <div className="zoom-buttons">
                  <div className="zoom-btn zoom-in" onClick={handleZoomIn}>
                    +
                  </div>
                  <div className="zoom-btn zoom-out" onClick={handleZoomOut}>
                    −
                  </div>
                </div>
              </div>
            ) : (
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
                  <div style={{ marginBottom: 2, display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: "700" }}>
                      Tham chiếu quy trình <span style={{ color: "red" }}>*</span>
                    </span>
                    {formData.processRefer ? (
                      <Tippy content="Xem quy trình">
                        <div
                          style={{ cursor: "pointer", marginLeft: 5 }}
                          onClick={() => {
                            setIsViewProcess(true);
                          }}
                        >
                          <Icon name="Eye" style={{ width: 20, fill: "var(--primary-color)" }} />
                        </div>
                      </Tippy>
                    ) : null}
                  </div>
                  <SelectCustom
                    id="processRefer"
                    name="processRefer"
                    // label="Tham chiếu quy trình"
                    fill={true}
                    required={true}
                    options={[]}
                    value={processReferData}
                    onChange={(e) => {
                      setProcessReferData(e);
                      setFormData({ ...formData, processRefer: e.value.toString() });
                    }}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={false}
                    placeholder="Chọn quy trình"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionProcess}
                    // formatOptionLabel={formatOptionLabelCustomer}
                    // disabled={checkParamsUrl}
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    key={processReferData?.value}
                    name="startNodeId"
                    value={valueNode}
                    label="Chọn Node bắt đầu"
                    fill={true}
                    required={false}
                    options={[]}
                    isAsyncPaginate={true}
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionNode}
                    placeholder="Chọn Node bắt đầu"
                    onChange={(e) => handleChangeValueNode(e)}
                    error={validateFieldNode}
                    message="Node bắt đầu không được bỏ trống"
                    // disabled={formData?.processId ? false : true}
                  />
                </div>

                {/* <div className="container-processRefer">
                        <RadioList
                            options={dataProcessRefer}
                            // className="options-auth"
                            required={true}
                            title="Tham chiếu quy trình"
                            name="authentication"
                            value={formData.processRefer}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData({...formData, processRefer: value})                            
                            }}
                        />

                        <div className="box-processRefer">
                            <div className="item-processRefer">
                                <Input
                                    name="processRefer"
                                    value={processReferData}
                                    label="Tên quy trình"
                                    fill={true}
                                    required={true}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setProcessReferData(value);
                                    }}
                                    placeholder="Nhập tên quy trình"
                                />
                        
                            </div>
                        </div>    

                    </div> */}

                <div className="container-inputVar">
                  <div>
                    <span style={{ fontSize: 14, fontWeight: "700" }}>Biến đầu vào</span>
                  </div>
                  {listInputVar && listInputVar.length > 0
                    ? listInputVar.map((item, index) => (
                        <div key={index} className="list-item-inputVar">
                          <div className="item-inputVar">
                            <SelectCustom
                              key={processReferData?.value}
                              id="fielName"
                              name="fielName"
                              label={index === 0 ? "Tên tham số đầu vào (Quy trình tham chiếu)" : ""}
                              fill={true}
                              required={false}
                              error={item.checkName}
                              message="Biến quy trình không được để trống"
                              options={[]}
                              value={item.name ? { value: item.name, label: item.name } : null}
                              onChange={(e) => {
                                setListInputVar((current) =>
                                  current.map((obj, idx) => {
                                    if (index === idx) {
                                      return { ...obj, name: e.value, checkName: false };
                                    }
                                    return obj;
                                  })
                                );
                              }}
                              isAsyncPaginate={true}
                              isFormatOptionLabel={false}
                              placeholder={"Chọn biến"}
                              additional={{
                                page: 1,
                              }}
                              loadOptionsPaginate={loadedOptionAttributeProcessRefer}
                              disabled={processReferData?.value ? false : true}
                              // formatOptionLabel={formatOptionLabelEmployee}
                              // error={checkFieldEform}
                              // message="Biểu mẫu không được bỏ trống"
                              // disabled={}
                            />
                            {/* <Input
                                          id="nameInput"
                                          name="nameInput"
                                          label={index === 0 ? "Tên tham số đầu vào" : ''}
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
                                      /> */}
                          </div>
                          <div className="item-inputVar">
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
                              <Tippy content={item.mappingType === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}>
                                <div
                                  className={"icon-change-select"}
                                  onClick={(e) => {
                                    if (item.mappingType === 1) {
                                      setListInputVar((current) =>
                                        current.map((obj, idx) => {
                                          if (index === idx) {
                                            return { ...obj, mappingType: 2 };
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
                                      mappingType: 1,
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
                            <SelectCustom
                              id="fielName"
                              name="fielName"
                              label={index === 0 ? "Tên tham số đầu ra" : ""}
                              fill={true}
                              required={false}
                              error={item.checkName}
                              message="Biến quy trình không được để trống"
                              options={[]}
                              value={item.name ? { value: item.name, label: item.name } : null}
                              onChange={(e) => {
                                setListOutVar((current) =>
                                  current.map((obj, idx) => {
                                    if (index === idx) {
                                      return { ...obj, name: e.value, checkName: false };
                                    }
                                    return obj;
                                  })
                                );
                              }}
                              isAsyncPaginate={true}
                              isFormatOptionLabel={false}
                              placeholder={"Chọn biến"}
                              additional={{
                                page: 1,
                              }}
                              loadOptionsPaginate={loadedOptionAttribute}
                              // formatOptionLabel={formatOptionLabelEmployee}
                              // error={checkFieldEform}
                              // message="Biểu mẫu không được bỏ trống"
                              // disabled={}
                            />
                            {/* <Input
                                          id="name"
                                          name="name"
                                          label={index === 0 ? "Tên tham số đầu ra" : ''}
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
                                      /> */}
                          </div>
                          <div className="item-outVar">
                            {index === 0 ? (
                              <div>
                                <span style={{ fontSize: 14, fontWeight: "700" }}>Biến quy trình (Quy trình tham chiếu)</span>
                              </div>
                            ) : null}
                            <div className={"container-select-mapping"}>
                              <div className="select-mapping">
                                <SelectCustom
                                  key={`${item?.mappingType}_${processReferData?.value}  `}
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
                                  loadOptionsPaginate={item?.mappingType === 2 ? loadedOptionAttributeProcessRefer : loadedOptionFormProcessRefer}
                                  disabled={processReferData?.value ? false : true}
                                  // formatOptionLabel={formatOptionLabelEmployee}
                                  // error={checkFieldEform}
                                  // message="Biểu mẫu không được bỏ trống"
                                  // disabled={}
                                />
                              </div>
                              <Tippy content={item.mappingType === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}>
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
                              </Tippy>
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
                                      mappingType: 1,
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

                {/* <div className="container-trigger-condition">
                        <div>
                            <span style={{fontSize: 14, fontWeight: '700'}}>Điều kiện nhận thông điệp <span style={{color: 'red'}}>*</span></span>
                        </div>
                        {listTriggerCondition && listTriggerCondition.length > 0 ? 
                            listTriggerCondition.map((item, index) => (
                                <div key={index} className="list-item-trigger-condition">
                                    <div className="item-trigger-condition">
                                        <Input
                                            id="key"
                                            name="key"
                                            // label={index === 0 ? "Tên tham số đầu ra" : ''}
                                            fill={true}
                                            required={true}
                                            error={item.checkKey}
                                            message="Key không được để trống"
                                            placeholder={"Key"}
                                            value={item.key}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setListTriggerCondition((current) =>
                                                        current.map((obj, idx) => {
                                                            if (index === idx) {
                                                                return { ...obj, key: value, checkKey: false };
                                                            }
                                                            return obj;
                                                        })
                                                    );
                                            }}
                                        />
                                    
                                    </div> 
                                    <div className="item-trigger-condition">
                                        <Input
                                            id="value"
                                            name="value"
                                            // label={index === 0 ? "Tên tham số đầu ra" : ''}
                                            fill={true}
                                            required={true}
                                            error={item.checkValue}
                                            message="Value không được để trống"
                                            placeholder={"Value"}
                                            value={item.value}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setListTriggerCondition((current) =>
                                                        current.map((obj, idx) => {
                                                            if (index === idx) {
                                                                return { ...obj, value: value, checkValue: false };
                                                            }
                                                            return obj;
                                                        })
                                                    );
                                            }}
                                        />
                                
                                    </div>
                                    <div className="add-attribute" >
                                        <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                            <span
                                            className="icon-add"
                                            onClick={() => {
                                                setListTriggerCondition([
                                                    ...listTriggerCondition,
                                                    { 
                                                        key: '',
                                                        value: '',
                                                        checkKey: false,
                                                        checkValue: false
                                                    },
                                                ]);
                                            }}
                                            >
                                            <Icon name="PlusCircleFill" />
                                            </span>
                                        </Tippy>
                                    </div>

                                    {listTriggerCondition.length > 1 ? 
                                        <div className="remove-attribute">
                                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                                <span className="icon-remove" 
                                                    onClick={() => {
                                                        const newList = [...listTriggerCondition];
                                                            newList.splice(index, 1);
                                                            setListTriggerCondition(newList);
                                                        }}
                                                    >
                                                    <Icon name="Trash" />
                                                </span>
                                            </Tippy>
                                        </div>
                                    : null}
                                </div>
                            ))
                        : null}
                    </div>

                    <div className="container-completion-condition">
                        <div>
                            <span style={{fontSize: 14, fontWeight: '700'}}>Điều kiện kết thúc <span style={{color: 'red'}}>*</span></span>
                        </div>
                        {listCompletionConditions && listCompletionConditions.length > 0 ? 
                            listCompletionConditions.map((item, index) => (
                                <div key={index} className="list-item-completion-condition">
                                    <div className="item-completion-condition">
                                        <Input
                                            id="key"
                                            name="key"
                                            // label={index === 0 ? "Tên tham số đầu ra" : ''}
                                            fill={true}
                                            required={true}
                                            error={item.checkKey}
                                            message="Key không được để trống"
                                            placeholder={"Key"}
                                            value={item.key}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setListCompletionConditions((current) =>
                                                        current.map((obj, idx) => {
                                                            if (index === idx) {
                                                                return { ...obj, key: value, checkKey: false };
                                                            }
                                                            return obj;
                                                        })
                                                    );
                                            }}
                                        />
                                    
                                    </div> 
                                    <div className="item-completion-condition">
                                        <Input
                                            id="value"
                                            name="value"
                                            // label={index === 0 ? "Tên tham số đầu ra" : ''}
                                            fill={true}
                                            required={true}
                                            error={item.checkValue}
                                            message="Value không được để trống"
                                            placeholder={"Value"}
                                            value={item.value}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setListCompletionConditions((current) =>
                                                        current.map((obj, idx) => {
                                                            if (index === idx) {
                                                                return { ...obj, value: value, checkValue: false };
                                                            }
                                                            return obj;
                                                        })
                                                    );
                                            }}
                                        />
                                
                                    </div>
                                    <div className="add-attribute" >
                                        <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                            <span
                                            className="icon-add"
                                            onClick={() => {
                                                setListCompletionConditions([
                                                    ...listCompletionConditions,
                                                    { 
                                                        key: '',
                                                        value: '',
                                                        checkKey: false,
                                                        checkValue: false
                                                    },
                                                ]);
                                            }}
                                            >
                                            <Icon name="PlusCircleFill" />
                                            </span>
                                        </Tippy>
                                    </div>

                                    {listCompletionConditions.length > 1 ? 
                                        <div className="remove-attribute">
                                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                                <span className="icon-remove" 
                                                    onClick={() => {
                                                        const newList = [...listCompletionConditions];
                                                            newList.splice(index, 1);
                                                            setListCompletionConditions(newList);
                                                        }}
                                                    >
                                                    <Icon name="Trash" />
                                                </span>
                                            </Tippy>
                                        </div>
                                    : null}
                                </div>
                            ))
                        : null}
                    </div>

                    <div className="container-parameter-mapping">
                        <div>
                            <span style={{fontSize: 14, fontWeight: '700'}}>Phạm vi tham số <span style={{color: 'red'}}>*</span></span>
                        </div>
                        {listParameterMapping && listParameterMapping.length > 0 ? 
                            listParameterMapping.map((item, index) => (
                                <div key={index} className="list-item-parameter-mapping">
                                    <div className="item-parameter-mapping">
                                        <Input
                                            id="name"
                                            name="name"
                                            label={index === 0 ? "Tên tham số" : ''}
                                            fill={true}
                                            required={true}
                                            placeholder={"Tên tham số"}
                                            value={item.name}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setListParameterMapping((current) =>
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
                                    <div className="item-parameter-mapping">
                                        <SelectCustom
                                            // key={listAttribute.length}
                                            id=""
                                            name="name"
                                            label={index === 0 ? "Biến quy trình" : ''}
                                            fill={true}
                                            required={true}
                                            error={item.checkMapping}
                                            message="Biến quy trình không được để trống"
                                            options={[]}
                                            value={item.attributeMapping ? {value: item.attributeMapping, label: item.attributeMapping} : null}
                                            onChange={(e) => {
                                                setListOutVar((current) =>
                                                        current.map((obj, idx) => {
                                                            if (index === idx) {
                                                                return { ...obj, attributeMapping: e.value, title: e.title, checkMapping: false };
                                                            }
                                                            return obj;
                                                        })
                                                    );
                                            }}
                                            isAsyncPaginate={true}
                                            placeholder="Chọn biến quy trình"
                                            additional={{
                                                page: 1,
                                            }}
                                            loadOptionsPaginate={loadedOptionAttribute}
                                            // formatOptionLabel={formatOptionLabelAttribute}
                                        />
                                
                                    </div>
                                    <div className="add-attribute" style={index === 0 ? {marginTop: '3.2rem'} : {}}>
                                        <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                            <span
                                            className="icon-add"
                                            onClick={() => {
                                                setListParameterMapping([
                                                    ...listParameterMapping,
                                                    { 
                                                        name: '',
                                                        attributeMapping: '',
                                                        checkName: false,
                                                        checkMapping: false
                                                    },
                                                ]);
                                            }}
                                            >
                                            <Icon name="PlusCircleFill" />
                                            </span>
                                        </Tippy>
                                    </div>

                                    {listParameterMapping.length > 1 ? 
                                        <div className="remove-attribute" style={index === 0 ? {marginTop: '3.2rem'} : {}}>
                                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                                <span className="icon-remove" 
                                                    onClick={() => {
                                                        const newList = [...listParameterMapping];
                                                            newList.splice(index, 1);
                                                            setListParameterMapping(newList);
                                                        }}
                                                    >
                                                    <Icon name="Trash" />
                                                </span>
                                            </Tippy>
                                        </div>
                                    : null}
                                </div>
                            ))
                        : null}
                    </div> */}

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
                          // id="username"
                          // name="username"
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
                          value={handleErrorData.nodeId ? { value: handleErrorData.nodeId, label: handleErrorData.nodeName } : null}
                          onChange={(e) => {
                            setHandleErrorData({ ...handleErrorData, nodeId: e.value, nodeName: e.label });
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

                {/* <div className="form-group">
                        <SelectCustom
                            id="selectVersion"
                            name="selectVersion"
                            label="Phiên bản"
                            fill={true}
                            special={true}
                            required={true}
                            options={[
                                {
                                    value: '1.2',
                                    label: '1.2',
                                },
                            ]}
                            value={formData.selectVersion ? {value: formData.selectVersion, label: formData.selectVersion} : null}
                            onChange={(e) => {
                                setFormData({...formData, selectVersion: e.value})
                            }}
                            isAsyncPaginate={false}
                            isFormatOptionLabel={false}
                            placeholder="Chọn phiên bản"
                        />
                    </div>

                    <div className="form-group">
                        <NummericInput
                            id="timeout"
                            name="timeout"
                            label="Thời gian chờ (giây)"
                            fill={true}
                            required={true}
                            placeholder={"Thời gian chờ (giây)"}
                            value={formData.timeout}
                            onValueChange={(e) => {
                                const value = e.floatValue || '';
                                setFormData({...formData, timeout: value})
                            }}
                        />
                    </div>

                    <div 
                        className="form-group" 
                        // style={{width: 'calc(38% - 1.6rem)'}}
                    >
                        <SelectCustom
                            id="executionMode"
                            name="executionMode"
                            label="Chế độ thực thi"
                            fill={true}
                            special={true}
                            required={true}
                            options={[
                                {
                                    value: 'synchronous',
                                    label: 'Đồng bộ'
                                },
                                {
                                    value: 'asynchronous',
                                    label: 'Bất đồng bộ'
                                },
                            ]}
                            value={formData.executionMode ? {value: formData.executionMode, label: formData.executionMode === 'synchronous' ? 'Đồng bộ' : 'Bất đồng bộ'} : null}
                            onChange={(e) => {
                                setFormData({...formData, executionMode: e.value})
                            }}
                            isAsyncPaginate={false}
                            isFormatOptionLabel={false}
                            placeholder="Chọn chế độ thực thi"
                            // additional={{
                            //     page: 1,
                            // }}
                            // loadOptionsPaginate={loadOptionSaleflow}
                            // formatOptionLabel={formatOptionLabelCustomer}
                            // disabled={checkParamsUrl}
                        />
                    </div>         */}

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
            )}
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
