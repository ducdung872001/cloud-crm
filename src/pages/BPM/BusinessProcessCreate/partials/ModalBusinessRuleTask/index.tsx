import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, createArrayFromToR, createArrayFromTo, convertParamsToString } from "reborn-util";
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
import AdvanceRule from "./partial/AdvanceRule";
import { convertDataRow } from "./partial/AdvanceRule/ConvertDataRow";
import Reference from "./partial/Reference";
import BusinessRuleService from "services/BusinessRuleService";

export default function ModalBusinessRuleTask({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
  const endRef = useRef<HTMLDivElement>(null);
  const [typeNode, setTypeNode] = useState("");
  const [haveTypeNode, setHaveTypeNode] = useState(false);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isModalClone, setIsModalClone] = useState(false);
  const [isModalSetting, setIsModalSetting] = useState(false);
  const [isModalDebug, setIsModalDebug] = useState(false);
  const [isLoadingType, setIsLoadingType] = useState(false);
  const [isLoadingDataAdvance, setLoadingDataAdvance] = useState(false);
  const [data, setData] = useState(null);
  const [dataAdvance, setDataAdvance] = useState(null);
  const [dataComplex, setDataComplex] = useState(null);
  const [childProcessId, setChildProcessId] = useState(null);
  const [dataWorkflow, setDataWorkflow] = useState(null);
  const [dataBusinessRule, setDataBusinessRule] = useState(null);
  const [listMappingInput, setListMappingInput] = useState([]);
  const [listMappingOutput, setListMappingOutput] = useState([]);

  const [handleErrorData, setHandleErrorData] = useState(null);

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
      setIsLoadingType(true);
      if (dataNode?.businessObject?.$parent?.id && dataNode.businessObject?.$parent?.$type === "bpmn:SubProcess") {
        getDetailNode(dataNode?.id);
      }
      getTypeRuleTask(dataNode.id);
    }
    if (dataNode && typeof dataNode == "object") {
      setFormDataAdvance({
        ...formDataAdvance,
        nodeId: dataNode?.id ?? null,
      });
    }
  }, [dataNode, onShow]);

  useEffect(() => {
    if (dataNode?.id) {
      if (typeNode === "advance") {
        setLoadingDataAdvance(true);
        getDetailTaskAdvance(dataNode.id);
      } else if (typeNode === "basic") {
        getDetailTask(dataNode.id);
      } else if (typeNode === "complex") {
        getDetailTaskComplex(dataNode.id);
      }
    }
  }, [typeNode, dataNode]);

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
    const response = await BusinessProcessService.detailBusinessRuleTask(id);

    if (response.code == 0) {
      const result = response.result;

      const errorHandling = (result?.errorHandling && JSON.parse(result.errorHandling)) || null;
      setHandleErrorData(errorHandling?.config || null);

      const businessRule = (result?.businessRule && JSON.parse(result.businessRule)) || null;

      setConditionList(businessRule || [valuesCondition]);

      const data = {
        ...result,
        errorHandling: errorHandling?.type || "Retry",
      };

      setData(data);
      setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };
  const getDetailTaskAdvance = async (nodeId) => {
    const response = await BusinessProcessService.detailBusinessRuleTaskAdvance({ nodeId });

    if (response.code == 0) {
      const result = response.result;
      setDataAdvance({
        ...result,
        config: result?.config ? JSON.parse(result.config) : null,
      });

      setDataConfigAdvance({
        columns: result?.config ? JSON.parse(result.config)?.columns : [], //result?.config?.columns || [],
        rows: result?.config ? JSON.parse(result.config)?.rows : [], //result?.config?.rows || [],
      });
      setFormDataAdvance({
        id: result?.id ?? null,
        name: result?.name ?? "",
        description: result?.description ?? "",
        nodeId: dataNode?.id ?? null,
        config: {
          columns: result?.config ? JSON.parse(result.config)?.columns : [],
          rows: result?.config ? JSON.parse(result.config)?.rows : [],
        },
      });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setLoadingDataAdvance(false);
  };
  const getDetailTaskComplex = async (nodeId) => {
    const response = await BusinessProcessService.detailBusinessRuleTaskComplex(nodeId);

    if (response.code == 0) {
      const result = response.result;
      setDataComplex({
        ...result,
        config: result?.config ? JSON.parse(result.config) : null,
      });
      if (result.code && result.businessRuleName && result.businessRuleId) {
        setDataBusinessRule({
          value: result.code,
          label: result.businessRuleName,
          id: result.businessRuleId,
        });
      }

      if (result?.mappingInput && typeof JSON.parse(result?.mappingInput) == "object") {
        let listMapInput = [];
        Object.keys(JSON.parse(result?.mappingInput)).map((item) => {
          listMapInput.push({
            mappingType: JSON.parse(result?.mappingInput)[item].includes("frm_")
              ? 1
              : JSON.parse(result?.mappingInput)[item].includes("var_")
              ? 2
              : 0, // 0: input, 1: frm, 2: var
            ruleField: item,
            ruleFieldName: "",
            mappingField: JSON.parse(result?.mappingInput)[item],
            mappingFieldName: "",
          });
        });
        setListMappingInput(listMapInput);
      }

      if (result?.mappingOutput && typeof JSON.parse(result?.mappingOutput) == "object") {
        let listMapOutput = [];
        Object.keys(JSON.parse(result?.mappingOutput)).map((item) => {
          listMapOutput.push({
            mappingType: JSON.parse(result?.mappingOutput)[item].includes("frm_")
              ? 1
              : JSON.parse(result?.mappingOutput)[item].includes("var_")
              ? 2
              : 0, // 0: input, 1: frm, 2: var
            ruleField: JSON.parse(result?.mappingOutput)[item],
            ruleFieldName: "",
            mappingField: item,
            mappingFieldName: "",
          });
        });
        setListMappingOutput(listMapOutput);
      }

      setFormDataComplex({
        id: result?.id ?? null,
        nodeId: result?.nodeId ?? nodeId,
        name: result?.name ?? "",
        code: result?.code ?? "",
        description: result?.description ?? "",
        mappingInput: result?.mappingInput ?? "",
        mappingOutput: result?.mappingOutput ?? "",
      });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setLoadingDataAdvance(false);
  };

  const getTypeRuleTask = async (id) => {
    const response = await BusinessProcessService.checkType(id);

    if (response.code == 0) {
      const result = response.result;
      setTypeNode(result || "basic");
      setHaveTypeNode(result ? true : false);
      setIsLoadingType(false);
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
      businessRule: data?.businessRule ?? "",
      errorHandling: data?.errorHandling ?? "Retry",
      timeout: data?.timeout ?? "",
      ruleValidation: data?.ruleValidation ?? 0, //0 - thất bại, 1 - thành công
      nodeId: dataNode?.id ?? null,
      processId: childProcessId ?? processId ?? null,
      workflowId: data?.workflowId ?? null,
    }),
    [onShow, data, dataNode, processId, childProcessId]
  );
  const valuesAdvance = useMemo(
    () => ({
      id: null,
      name: dataAdvance?.name ?? "",
      description: dataAdvance?.description ?? "",
      nodeId: dataNode?.id ?? null,
      config: {
        columns: dataAdvance?.config?.columns || [],
        rows: dataAdvance?.config?.rows || [],
      },
    }),
    [onShow, dataAdvance, dataNode]
  );
  const valuesComplex = useMemo(
    () => ({
      id: null,
      name: dataComplex?.name ?? "",
      description: dataComplex?.description ?? "",
      nodeId: dataNode?.id ?? null,
      code: dataNode?.id ?? null,
      mappingInput: dataComplex?.mappingInput ?? "",
      mappingOutput: dataComplex?.mappingOutput ?? "",
    }),
    [onShow, dataComplex, dataNode]
  );

  const [formData, setFormData] = useState(values);
  const [dataConfigAdvance, setDataConfigAdvance] = useState({
    columns: [],
    rows: [],
  });
  const [dataConfigAdvanceEdit, setDataConfigAdvanceEdit] = useState({
    columns: [],
    rows: [],
  });
  const [formDataAdvance, setFormDataAdvance] = useState(valuesAdvance);
  const [formDataComplex, setFormDataComplex] = useState(valuesComplex);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  // useEffect(() => {
  //     if(formData.errorHandling){
  //         const errorHandling = formData.errorHandling;
  //         if(errorHandling === 'Retry'){
  //             setHandleErrorData({times: '', loopTime: ''});
  //         }
  //         if(errorHandling === 'Chuyển sang một luồng thay thế'){
  //             setHandleErrorData({nodeId: ''});
  //         }
  //     }
  // }, [formData.errorHandling])

  const onSubmit = async (e) => {
    e.preventDefault();
    // setIsSubmit(true);
    if (typeNode === "advance") {
      let dataConfig = convertDataRow(dataConfigAdvanceEdit, dataNode?.id);

      const body = {
        id: formDataAdvance.id ?? null,
        nodeId: dataNode?.id ?? null,
        name: formDataAdvance.name ?? "",
        type: "DT",
        description: formDataAdvance.description ?? "",
        inputs: dataConfig?.inputs ? JSON.stringify(dataConfig?.inputs) : null,
        outputs: dataConfig?.outputs ? JSON.stringify(dataConfig?.outputs) : null,
        config: dataConfig?.config ? JSON.stringify(dataConfig?.config) : null,
        rules: dataConfig?.rules || [],
      };
      console.log("dataConfig>>>>", dataConfig);
      // return;

      const response = await BusinessProcessService.updateBusinessRuleTaskAdvance(body);
      if (response.code === 0) {
        showToast(`Cập nhật biểu mẫu thành công`, "success");
        // handleClear(false);
        // changeNameNodeXML(dataNode, body.name);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        setIsSubmit(false);
      }

      return;
    }

    if (typeNode === "complex") {
      let mappingInput = {};
      if (listMappingInput?.length) {
        listMappingInput.forEach((item) => {
          mappingInput[item.ruleField] = item.mappingField;
        });
      }
      let mappingOutput = {};
      if (listMappingOutput?.length) {
        listMappingOutput.forEach((item) => {
          mappingOutput[item.mappingField] = item.ruleField;
        });
      }

      const body = {
        id: formDataComplex.id ?? null,
        nodeId: dataNode?.id ?? null,
        code: formDataComplex.code ?? null,
        name: formDataComplex.name ?? "",
        description: formDataComplex.description ?? "",
        mappingInput: JSON.stringify(mappingInput),
        mappingOutput: JSON.stringify(mappingOutput),
      };

      const response = await BusinessProcessService.updateBusinessRuleTaskComplex(body);
      if (response.code === 0) {
        showToast(`Cập nhật biểu mẫu thành công`, "success");
        handleClear(false);
        changeNameNodeXML(dataNode, body.name);
        setListMappingInput([]);
        setListMappingOutput([]);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        setIsSubmit(false);
      }

      return;
    }

    const errorHandlingSubmit = {
      type: formData.errorHandling,
      config: handleErrorData,
    };

    const body = {
      id: data?.id ?? null,
      name: formData.name ?? "",
      code: formData?.code ?? "",
      description: formData?.description ?? "",
      businessRule: JSON.stringify(conditionList),
      errorHandling: JSON.stringify(errorHandlingSubmit),
      timeout: formData?.timeout ?? "",
      nodeId: dataNode?.id ?? null,
      processId: formData?.processId ?? null,
      workflowId: formData?.workflowId ?? null,
    };

    const response = await BusinessProcessService.updateBusinessRuleTask(body);

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
    setData(null);
    setHandleErrorData(null);
    setConditionList([valuesCondition]);
    setDataWorkflow(null);
    setTypeNode("");
    setHaveTypeNode(false);
    setDataAdvance(null);
    setDataComplex(null);
    setListMappingInput([]);
    setListMappingOutput([]);
    setFormDataComplex({
      id: null,
      nodeId: dataNode?.id ?? null,
      name: "",
      code: "",
      description: "",
      mappingInput: "",
      mappingOutput: "",
    });
    setDataBusinessRule(null);

    // setDataConfigAdvance({
    //   columns: [],
    //   rows: [],
    // });
    // setFormDataAdvance({
    //   id: null,
    //   name: "",
    //   description: "",
    //   nodeId: null,
    //   config: {
    //     columns: [],
    //     rows: [],
    //   },
    // });
  };

  const lstConditionFieldText = [
    { value: "eq", label: "Equal" },
    { value: "like", label: "Like" },
  ];

  const lstConditionFieldSpecialText = [{ value: "like", label: "Like" }];

  const lstConditionFieldNumber = [
    { value: "nin", label: "Nin" },
    { value: "eq", label: "Equal" },
    { value: "in", label: "In" },
    { value: "ne", label: "Not_Equal" },
    { value: "gt", label: "Greater_Than" },
    { value: "lt", label: "Less_Than" },
    { value: "gte", label: "Greater_Than_Or_Equal" },
    { value: "lte", label: "Less_Than_Or_Equal" },
  ];

  const lstConditionFieldSpecialNumber = [
    { value: "eq", label: "Equal" },
    { value: "in", label: "In" },
    { value: "gt", label: "Greater_Than" },
    { value: "lt", label: "Less_Than" },
    { value: "gte", label: "Greater_Than_Or_Equal" },
    { value: "lte", label: "Less_Than_Or_Equal" },
  ];

  const lstConditionFieldDate = [
    { value: "nin", label: "Nin" },
    { value: "eq", label: "Equal" },
    { value: "in", label: "In" },
    { value: "ne", label: "Not_Equal" },
    { value: "gt", label: "Greater_Than" },
    { value: "lt", label: "Less_Than" },
    { value: "gte", label: "Greater_Than_Or_Equal" },
    { value: "lte", label: "Less_Than_Or_Equal" },
  ];

  const lstConditionFieldSelect = [
    { value: "nin", label: "Nin" },
    { value: "eq", label: "Equal" },
    { value: "in", label: "In" },
    { value: "ne", label: "Not_Equal" },
  ];

  const defaultValue = {
    logical: "and",
    rule: [
      {
        typeFieldName: 1, //1-chọn trường trong form, 2-chọn biến quy trình
        fieldName: null,
        nodeId: null,
        operator: "eq",
        value: "",
        typeValue: 0, // 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
        type: null,
      },
    ],
    blockRule: [],
  };

  const valuesCondition = useMemo(
    () =>
      ({
        logical: "and",
        // listEformAttribute: data?.listEformAttribute || null,
        rule: [
          {
            typeFieldName: 1, //1-chọn trường trong form, 2-chọn biến quy trình
            fieldName: null,
            nodeId: null,
            operator: "eq",
            value: "",
            typeValue: 0, // 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
            type: null,
          },
        ],
        blockRule: [],
        result: {
          resultType: 1,
          resultAttribute: null,
          resultValue: "",
        },
      } as any),
    [data, onShow]
  );

  const [typeAttributeLv1, setTypeAttributeLv1] = useState(1);
  const [typeAttributeLv2, setTypeAttributeLv2] = useState(1);

  const [conditionList, setConditionList] = useState([valuesCondition]);

  //! đoạn này xử lý lấy năm
  const [years] = useState<any[]>(
    createArrayFromToR(new Date().getFullYear(), 1963).map((item, idx) => {
      return {
        value: +item,
        label: item,
      };
    })
  );

  //! đoạn này xử lý lấy tháng
  const [months] = useState<any[]>(
    createArrayFromTo(1, 12).map((item, idx) => {
      if (item < 10) {
        return {
          value: +`0${item}`,
          label: `0${item}`,
        };
      }

      return {
        value: +item,
        label: item,
      };
    })
  );

  //! đoạn này xử lý lấy ngày
  const [days] = useState<any[]>(
    createArrayFromTo(1, 31).map((item, idx) => {
      if (item < 10) {
        return {
          value: +`0${item}`,
          label: `0${item}`,
        };
      }

      return {
        value: +item,
        label: item,
      };
    })
  );

  //! Đoạn này xử lý lv-1
  const handlePushRule = (data, idx, idxList) => {
    if (!data) return;

    // const changeData = {
    //   fieldName: data?.label,
    //   nodeId: data?.nodeId,
    //   operator: "eq",
    //   value: "",
    //   type: data.datatype
    // };

    // setConditionList((current) =>
    //   current.map((obj, index) => {
    //     if (index === idxList) {
    //       return { ...obj, rule: [...obj.rule, ...([changeData])] };
    //     }
    //     return obj;
    //   })
    // );

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            rule: [...obj.rule].map((el, index) => {
              if (idx === index) {
                return {
                  ...el,
                  fieldName: data?.value,
                  nodeId: data?.nodeId,
                  type: data.datatype,
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handleChangeValueCondition = (e, idx, idxList) => {
    const value = e.value;

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            rule: [...obj.rule].map((el, index) => {
              if (idx === index) {
                return {
                  ...el,
                  operator: value,
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handChangeValueTypeItem = (e, idx, type, idxList) => {
    let value = null;
    if (type === "input") {
      value = e.target.value;
    }
    if (type === "number") {
      value = e.floatValue;
    }
    if (type === "date") {
      value = e;
    }
    if (type === "form" || type === "var") {
      value = e.value;
    }

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            rule: [...obj.rule].map((el, index) => {
              if (idx === index) {
                return {
                  ...el,
                  value: value,
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handleDeleteItemField = (idx, idxList) => {
    const newData = [...conditionList[idxList].rule];

    newData.splice(idx, 1);

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return { ...obj, rule: newData };
        }
        return obj;
      })
    );
  };

  const handleChangeValueDay = (e, idx, idxList) => {
    const dayValue = e.value;

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            rule: obj.rule.map((el, index) => {
              if (idx === index) {
                const currentValues = el.value.split("/");
                const newValue = `${dayValue !== "" ? dayValue : currentValues[0]}/${currentValues[1] || "null"}/${currentValues[2] || "null"}`;
                return {
                  ...el,
                  value: newValue,
                };
              }
              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handleChangeValueMonth = (e, idx, idxList) => {
    const monthValue = e.value;

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            rule: obj.rule.map((el, index) => {
              if (idx === index) {
                const currentValues = el.value.split("/");
                const newValue = `${currentValues[0] || "null"}/${monthValue !== "" ? monthValue : currentValues[1]}/${currentValues[2] || "null"}`;
                return {
                  ...el,
                  value: newValue,
                };
              }
              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handleChangeValueYear = (e, idx, idxList) => {
    const yearValue = e.value;

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            rule: obj.rule.map((el, index) => {
              if (idx === index) {
                const currentValues = el.value.split("/");
                const newValue = `${currentValues[0] || "null"}/${currentValues[1] || "null"}/${yearValue !== "" ? yearValue : currentValues[2]}`;
                return {
                  ...el,
                  value: newValue,
                };
              }
              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const [isLoadingSource, setIsLoadingSource] = useState<boolean>(false);

  const onSelectOpenApi = async (source, idx, param?: any, idxList?) => {
    if (!source) return;

    const checkSource = source.startsWith("https");

    setIsLoadingSource(true);

    const params = {
      ...(checkSource
        ? {
            parentId: +param,
          }
        : {}),
      limit: 1000,
    };

    const link = checkSource ? source : process.env.APP_API_URL + source;

    const response = await fetch(`${link}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());

    if (response.code === 0) {
      const result = response.result.items ? response.result.items : response.result;

      const changeDataResult = result.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });

      setConditionList((current) =>
        current.map((obj, index) => {
          if (index === idxList) {
            return {
              ...obj,
              rule: [...obj.rule].map((el, index) => {
                if (idx === index) {
                  return {
                    ...el,
                    options: changeDataResult,
                  };
                }

                return el;
              }),
            };
          }
          return obj;
        })
      );
    }

    setIsLoadingSource(false);
  };

  //! Đoạn này xử lý lv-2
  const handChangeLogical = (idx, type, idxList) => {
    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            blockRule: [...obj.blockRule].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  logical: type,
                };
              }
              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handDeleteItemBlock = (idx, idxList) => {
    const newData = [...conditionList[idxList].blockRule];
    newData.splice(idx, 1);

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return { ...obj, blockRule: newData };
        }
        return obj;
      })
    );
  };

  const handlePushRuleBlock = (data, ids, idx, idxList) => {
    if (!data) return;

    // const changeData = {
    //   fieldName: data?.label,
    //   nodeId: data?.nodeId,
    //   operator: "eq",
    //   value: "",
    //   type: data.datatype
    // };

    // setConditionList((current) =>
    //   current.map((obj, index) => {
    //     if (index === idxList) {
    //       return { ...obj,
    //         blockRule: [...obj.blockRule].map((el, index) => {
    //             if (index === idx) {
    //               return {
    //                 ...el,
    //                 rule: [...el.rule, ...([changeData])],
    //               };
    //             }

    //             return el;
    //           }),
    //         };
    //     }
    //     return obj;
    //   })
    // );

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            blockRule: [...obj.blockRule].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  rule: [...el.rule].map((ol, i) => {
                    if (i === ids) {
                      return {
                        ...ol,
                        fieldName: data?.label,
                        nodeId: data?.nodeId,
                        type: data.datatype,
                      };
                    }

                    return ol;
                  }),
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handleChangeValueBlockCondition = (e, ids, idx, idxList) => {
    const value = e.value;

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            blockRule: [...obj.blockRule].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  rule: [...el.rule].map((ol, i) => {
                    if (i === ids) {
                      return {
                        ...ol,
                        operator: value,
                      };
                    }

                    return ol;
                  }),
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handChangeValueTypeBlockItem = (e, ids, idx, type, idxList) => {
    let value = null;
    if (type === "input") {
      value = e.target.value;
    }
    if (type === "number") {
      value = e.floatValue;
    }
    if (type === "date") {
      value = e;
    }
    if (type === "form" || type === "var") {
      value = e.value;
    }

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            blockRule: [...obj.blockRule].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  rule: [...el.rule].map((ol, i) => {
                    if (i === ids) {
                      return {
                        ...ol,
                        value: value,
                      };
                    }

                    return ol;
                  }),
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handleChangeValueBlockDay = (e, ids, idx, idxList) => {
    const dayValue = e.value;

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            blockRule: [...obj.blockRule].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  rule: [...el.rule].map((ol, i) => {
                    if (i === ids) {
                      const currentValues = ol.value.split("/");
                      const newValue = `${dayValue !== "" ? dayValue : currentValues[0]}/${currentValues[1] || "null"}/${currentValues[2] || "null"}`;
                      return {
                        ...ol,
                        value: newValue,
                      };
                    }

                    return ol;
                  }),
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handleChangeValueBlockMonth = (e, ids, idx, idxList) => {
    const monthValue = e.value;

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            blockRule: [...obj.blockRule].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  rule: [...el.rule].map((ol, i) => {
                    if (i === ids) {
                      const currentValues = ol.value.split("/");
                      const newValue = `${currentValues[0] || "null"}/${monthValue !== "" ? monthValue : currentValues[1]}/${
                        currentValues[2] || "null"
                      }`;
                      return {
                        ...ol,
                        value: newValue,
                      };
                    }

                    return ol;
                  }),
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handleChangeValueBlockYear = (e, ids, idx, idxList) => {
    const yearValue = e.value;

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            blockRule: [...obj.blockRule].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  rule: [...el.rule].map((ol, i) => {
                    if (i === ids) {
                      const currentValues = ol.value.split("/");
                      const newValue = `${currentValues[0] || "null"}/${currentValues[1] || "null"}/${
                        yearValue !== "" ? yearValue : currentValues[2]
                      }`;
                      return {
                        ...ol,
                        value: newValue,
                      };
                    }

                    return ol;
                  }),
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const handleDeleteBlockItemField = (ids, idx, idxList) => {
    const groupRuleFilter = conditionList[idxList].blockRule[idx];
    const ruleFilter = groupRuleFilter.rule.filter((field, i) => i !== ids);

    setConditionList((current) =>
      current.map((obj, index) => {
        if (index === idxList) {
          return {
            ...obj,
            blockRule: [...obj.blockRule].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  rule: ruleFilter,
                };
              }

              return el;
            }),
          };
        }
        return obj;
      })
    );
  };

  const onSelectOpenBlockApi = async (source, ids, idx, param?: any, idxList?) => {
    if (!source) return;

    const checkSource = source.startsWith("https");

    setIsLoadingSource(true);

    const params = {
      ...(checkSource
        ? {
            parentId: param,
          }
        : {}),
      limit: 1000,
    };

    const link = checkSource ? source : process.env.APP_API_URL + source;

    const response = await fetch(`${link}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());

    if (response.code === 0) {
      const result = response.result.items ? response.result.items : response.result;

      const changeDataResult = result.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });

      setConditionList((current) =>
        current.map((obj, index) => {
          if (index === idxList) {
            return {
              ...obj,
              blockRule: [...obj.blockRule].map((el, index) => {
                if (index === idx) {
                  return {
                    ...el,
                    rule: [...el.rule].map((ol, i) => {
                      if (i === ids) {
                        return {
                          ...ol,
                          options: changeDataResult,
                        };
                      }

                      return ol;
                    }),
                  };
                }

                return el;
              }),
            };
          }
          return obj;
        })
      );
    }

    setIsLoadingSource(false);
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
              datatype: el.type?.value || null,
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
                  datatype: item.datatype,
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

  const loadedOptionBusinesRule = async (search, loadedOptions, { page }) => {
    const params = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BusinessRuleService.list(params);

    if (response.code === 0) {
      const options = response.result?.items || [];

      return {
        options: [
          ...(options.length > 0
            ? options.map((item) => {
                return {
                  value: item.code,
                  label: item.name,
                  id: item.id,
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
        size={typeNode === "advance" ? "xxl" : "xl"}
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-bussiness-rule-task"
      >
        <form className="form-bussiness-rule-task" onSubmit={(e) => onSubmit(e)}>
          {/* <ModalHeader title={`Cài đặt biểu mẫu`} toggle={() => !isSubmit && handleClear(false)} /> */}
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt Business Rule"}</h4>
            </div>
            <div className="container-button">
              {disable ? null : (
                <Tippy content="Sao chép nhiệm vụ khác">
                  <div>
                    <Button
                      onClick={() => {
                        setIsModalClone(true);
                      }}
                      type="button"
                      className="btn-setting"
                      color="transparent"
                      onlyIcon={true}
                    >
                      <Icon name="Copy" />
                    </Button>
                  </div>
                </Tippy>
              )}
              {disable ? null : (
                <Tippy content="Cài đặt biến">
                  <div>
                    <Button
                      onClick={() => {
                        setIsModalSetting(true);
                      }}
                      type="button"
                      className="btn-setting"
                      color="transparent"
                      onlyIcon={true}
                    >
                      <Icon name="Settings" />
                    </Button>
                  </div>
                </Tippy>
              )}
              {disable ? null : (
                <Tippy content="Debug">
                  <div>
                    <Button
                      onClick={() => {
                        setIsModalDebug(true);
                      }}
                      type="button"
                      className="btn-setting"
                      color="transparent"
                      onlyIcon={true}
                    >
                      <Icon name="Debug" style={{ width: 20 }} />
                    </Button>
                  </div>
                </Tippy>
              )}
              {disable ? null : (
                <Tippy content="Lưu Node">
                  <div>
                    <Button
                      onClick={() => {
                        addNode();
                      }}
                      type="button"
                      className="btn-setting"
                      color="transparent"
                      onlyIcon={true}
                    >
                      <Icon name="CheckedCircle" style={{ width: 22 }} />
                    </Button>
                  </div>
                </Tippy>
              )}
              <Button onClick={() => !isSubmit && handleClear(false)} type="button" className="btn-close" color="transparent" onlyIcon={true}>
                <Icon name="Times" />
              </Button>
            </div>
          </div>
          <ModalBody>
            {!haveTypeNode && !isLoadingType ? (
              <div className="form-switch-type">
                <div className="form-group">
                  <RadioList
                    options={[
                      { value: "basic", label: "Cơ bản" },
                      { value: "advance", label: "Nâng cao" },
                      { value: "complex", label: "Tham chiếu" },
                    ]}
                    // className="options-auth"
                    // required={true}
                    title="Loại biểu mẫu: "
                    name="typeNode"
                    value={typeNode}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTypeNode(value);
                    }}
                  />
                </div>
              </div>
            ) : null}
            {typeNode == "basic" ? (
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
                      if (value === "Retry") {
                        setHandleErrorData({ times: "", loopTime: "" });
                      }
                      if (value === "Chuyển sang một luồng thay thế") {
                        setHandleErrorData({ nodeId: "" });
                      }
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
                      const value = e.floatValue || "";
                      setFormData({ ...formData, timeout: value });
                    }}
                  />
                </div>

                <div
                  className="button-check"
                  onClick={() => {
                    setFormData({ ...formData, ruleValidation: 1 });
                  }}
                >
                  <div className="icon-check">
                    <Icon
                      name={formData?.ruleValidation === 0 ? "Test" : "Checked"}
                      style={{ width: 20, height: 20, fill: "var(--primary-color)" }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: "700" }}>Kiểm tra xác nhận</span>
                  </div>
                </div>

                <div className="form-group-condition">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span className="name-group">Điều kiện</span>
                    </div>
                    <div
                      className="button-add"
                      onClick={() => {
                        setConditionList((oldArray) => [...oldArray, valuesCondition]);
                        endRef.current?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <div className="action__time--item action__time--add">
                        <Icon name="PlusCircleFill" />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: "500" }}>Thêm điều kiện</span>
                    </div>
                  </div>

                  {conditionList && conditionList.length > 0
                    ? conditionList.map((item, idxList) => (
                        <div key={idxList} className="desc__filter">
                          <div className="lv__item lv__1">
                            <div className="action__choose--item action__choose--lv1">
                              <Button
                                color={item.logical === "and" ? "primary" : "secondary"}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setConditionList((current) =>
                                    current.map((obj, index) => {
                                      if (index === idxList) {
                                        return { ...obj, logical: "and" };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                                // disabled={disableFieldCommom}
                              >
                                AND
                              </Button>
                              <Button
                                color={item.logical === "or" ? "primary" : "secondary"}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setConditionList((current) =>
                                    current.map((obj, index) => {
                                      if (index === idxList) {
                                        return { ...obj, logical: "or" };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                                // disabled={disableFieldCommom}
                              >
                                OR
                              </Button>
                              <Button
                                color="success"
                                className="icon__add"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setConditionList((current) =>
                                    current.map((obj, index) => {
                                      if (index === idxList) {
                                        return { ...obj, blockRule: [...obj.blockRule, defaultValue] };
                                      }
                                      return obj;
                                    })
                                  );
                                }}
                                // disabled={disableFieldCommom}
                              >
                                <Icon name="PlusCircleFill" />
                              </Button>
                              {conditionList.length > 1 ? (
                                <Button
                                  color="destroy"
                                  className="icon__detete"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const newConditionList = [...conditionList];
                                    newConditionList.splice(idxList, 1);
                                    setConditionList(newConditionList);
                                  }}
                                  // disabled={disableFieldCommom}
                                >
                                  <Icon name="Trash" />
                                </Button>
                              ) : null}
                            </div>

                            <div className="including__conditions__eform">
                              {/* <div className={`lst__option--group-field`}>
                                            <div className={"container-select-mapping"}>
                                                <div className="select-mapping">
                                                    <SelectCustom
                                                        key={typeAttributeLv1}
                                                        id=""
                                                        name=""
                                                        // label="Chọn biểu mẫu"
                                                        options={[]}
                                                        fill={false}
                                                        // value={formData.dataEform}
                                                        special={true}
                                                        required={true}
                                                        onChange={(e) => handlePushRule(e, item.rule, idxList)}
                                                        isAsyncPaginate={true}
                                                        isFormatOptionLabel={false}
                                                        placeholder={typeAttributeLv1 === 1 ? 'Chọn trường trong form' : 'Chọn biến'}
                                                        additional={{
                                                            page: 1,
                                                        }}
                                                        loadOptionsPaginate={typeAttributeLv1 === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                        // formatOptionLabel={formatOptionLabelEmployee}
                                                        // error={checkFieldEform}
                                                        // message="Biểu mẫu không được bỏ trống"
                                                    />
                                                </div>
                                                <Tippy  
                                                    content={typeAttributeLv1 === 2 ? 'Chuyển chọn trường trong form' : 'Chuyển chọn biến'}
                                                >
                                                    <div 
                                                        className={'icon-change-select'}
                                                        onClick={(e) => {
                                                            if(typeAttributeLv1 === 1){
                                                                setTypeAttributeLv1(2);
                                                            } else {
                                                                setTypeAttributeLv1(1)
                                                            }
                                                        }}
                                                    >
                                                        <Icon name="ResetPassword" style={{width: 18}} />
                                                    </div>
                                                </Tippy>
                                            </div>
                                        </div> */}

                              <div className="lst__field--rule">
                                {item.rule &&
                                  item.rule.length > 0 &&
                                  item.rule.map((el, idx) => {
                                    return (
                                      <Fragment key={idx}>
                                        <div className="item__rule">
                                          <div className="lst__info--rule">
                                            <div className="info-item" style={!el.fieldName ? { width: "100%" } : {}}>
                                              {/* <span className="name-field">{capitalizeFirstLetter(item.name)}</span> */}
                                              {/* <span className="name-field">{(el.fieldName)}</span> */}
                                              <div className={"container-select-mapping"}>
                                                <div className="select-mapping">
                                                  <SelectCustom
                                                    key={el.typeFieldName}
                                                    id=""
                                                    name=""
                                                    // label="Chọn biểu mẫu"
                                                    options={[]}
                                                    fill={false}
                                                    value={el.fieldName ? { value: el.fieldName, label: el.fieldName } : null}
                                                    special={true}
                                                    required={true}
                                                    onChange={(e) => handlePushRule(e, idx, idxList)}
                                                    isAsyncPaginate={true}
                                                    isFormatOptionLabel={false}
                                                    placeholder={el.typeFieldName === 1 ? "Chọn trường trong form" : "Chọn biến"}
                                                    additional={{
                                                      page: 1,
                                                    }}
                                                    loadOptionsPaginate={el.typeFieldName === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                    // formatOptionLabel={formatOptionLabelEmployee}
                                                    // error={checkFieldEform}
                                                    // message="Biểu mẫu không được bỏ trống"
                                                  />
                                                </div>
                                                <Tippy content={el.typeFieldName === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}>
                                                  <div
                                                    className={"icon-change-select"}
                                                    onClick={(e) => {
                                                      setConditionList((current) =>
                                                        current.map((obj, index) => {
                                                          if (index === idxList) {
                                                            return {
                                                              ...obj,
                                                              rule: [...obj.rule].map((el, index) => {
                                                                if (idx === index) {
                                                                  return {
                                                                    ...el,
                                                                    typeFieldName: el.typeFieldName === 1 ? 2 : 1,
                                                                  };
                                                                }

                                                                return el;
                                                              }),
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

                                            {el.fieldName ? (
                                              <div className="info-item">
                                                <SelectCustom
                                                  name="condition"
                                                  fill={true}
                                                  value={el.operator}
                                                  options={
                                                    el.fieldName === "name"
                                                      ? lstConditionFieldSpecialText
                                                      : el.type === "text" && el.fieldName === "email"
                                                      ? [...lstConditionFieldText, { value: "ne", label: "Not_Equal" }]
                                                      : el.type === "text" || el.type === "textfield"
                                                      ? lstConditionFieldText
                                                      : el.fieldName === "height" || el.fieldName === "weight"
                                                      ? lstConditionFieldSpecialNumber
                                                      : el.type === "number" || el.type === "int"
                                                      ? lstConditionFieldNumber
                                                      : el.type === "date"
                                                      ? lstConditionFieldDate
                                                      : lstConditionFieldSelect
                                                  }
                                                  // disabled={disableFieldCommom}
                                                  onChange={(e) => handleChangeValueCondition(e, idx, idxList)}
                                                />
                                              </div>
                                            ) : null}

                                            {el.fieldName ? (
                                              <div className="info-item">
                                                <div className={"container-select-mapping"}>
                                                  {!el.typeValue ? (
                                                    <div className="input-text">
                                                      <Input
                                                        name={el.fieldName}
                                                        fill={false}
                                                        value={el.value}
                                                        // disabled={disableFieldCommom}
                                                        onChange={(e) => handChangeValueTypeItem(e, idx, "input", idxList)}
                                                        // placeholder={`Nhập ${el.fieldName?.toLowerCase()}`}
                                                        placeholder={`Nhập giá trị`}
                                                      />
                                                    </div>
                                                  ) : (
                                                    <div className="select-mapping">
                                                      <SelectCustom
                                                        key={el.typeValue}
                                                        id=""
                                                        name=""
                                                        // label="Chọn biểu mẫu"
                                                        options={[]}
                                                        fill={false}
                                                        value={el.value ? { value: el.value, label: el.value } : null}
                                                        special={true}
                                                        required={true}
                                                        onChange={(e) =>
                                                          handChangeValueTypeItem(e, idx, el.typeValue === 1 ? "form" : "var", idxList)
                                                        }
                                                        isAsyncPaginate={true}
                                                        isFormatOptionLabel={false}
                                                        placeholder={el.typeValue === 1 ? "Chọn trường trong form" : "Chọn biến"}
                                                        additional={{
                                                          page: 1,
                                                        }}
                                                        loadOptionsPaginate={el.typeValue === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                      />
                                                    </div>
                                                  )}
                                                  <Tippy
                                                    content={
                                                      el.typeValue === 0
                                                        ? "Chuyển chọn trường trong form"
                                                        : el.typeValue === 1
                                                        ? "Chuyển chọn biến"
                                                        : "Chuyển nhập giá trị"
                                                    }
                                                  >
                                                    <div
                                                      className={"icon-change-select"}
                                                      onClick={(e) => {
                                                        setConditionList((current) =>
                                                          current.map((obj, index) => {
                                                            if (index === idxList) {
                                                              return {
                                                                ...obj,
                                                                rule: [...obj.rule].map((il, index) => {
                                                                  if (idx === index) {
                                                                    return {
                                                                      ...il,
                                                                      typeValue: el.typeValue === 0 ? 1 : el.typeValue === 1 ? 2 : 0,
                                                                      value: "",
                                                                    };
                                                                  }

                                                                  return il;
                                                                }),
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
                                                {/* {el.type === "text" || el.type === "textfield" || el.type === "select" || el.type === "dropdown" ? (
                                                                                <Input
                                                                                    name={el.fieldName}
                                                                                    fill={true}
                                                                                    value={el.value}
                                                                                    // disabled={disableFieldCommom}
                                                                                    onChange={(e) => handChangeValueTypeItem(e, idx, "input", idxList)}
                                                                                    placeholder={`Nhập ${el.fieldName?.toLowerCase()}`}
                                                                                />
                                                                              ) : el.type === "number" || el.type === "int" ? (
                                                                              <NummericInput
                                                                                  name={el.fieldName}
                                                                                  fill={true}
                                                                                  value={el.value}
                                                                                  thousandSeparator={true}
                                                                                  // disabled={disableFieldCommom}
                                                                                  onValueChange={(e) => handChangeValueTypeItem(e, idx, "number", idxList)}
                                                                                  placeholder={`Nhập ${el.fieldName?.toLowerCase()}`}
                                                                              />
                                                                              ) : el.type === "date" || el.type === "datetime" ? (
                                                                              <DatePickerCustom
                                                                                  name={el.fieldName}
                                                                                  fill={true}
                                                                                  value={el.value}
                                                                                  iconPosition="left"
                                                                                  // disabled={disableFieldCommom}
                                                                                  icon={<Icon name="Calendar" />}
                                                                                  onChange={(e) => handChangeValueTypeItem(e, idx, "date", idxList)}
                                                                                  placeholder={`Chọn ${el.fieldName?.toLowerCase()}`}
                                                                              />
                                                                              ) : el.type === "select" || el.type === "dropdown"  ? (
                                                                                  <SelectCustom
                                                                                      name={el.fieldName}
                                                                                      fill={true}
                                                                                      options={el.options || []}
                                                                                      value={+el.value}
                                                                                      onChange={(e) => handChangeValueTypeItem(e, idx, "select", idxList)}
                                                                                      // disabled={}
                                                                                      onMenuOpen={() =>
                                                                                          onSelectOpenApi(
                                                                                              el.source,
                                                                                              idx,
                                                                                              "",
                                                                                              idxList
                                                                                          )
                                                                                      }
                                                                                      isLoading={isLoadingSource}
                                                                                      placeholder={`Chọn ${el.fieldName?.toLowerCase()}`}
                                                                                  />
                                                                              ) : 
                                                                              (
                                                                              <div className="field__special">
                                                                                  <SelectCustom
                                                                                      placeholder="Chọn ngày"
                                                                                      name="foundingDay"
                                                                                      fill={true}
                                                                                      value={+el.value.split("/")[0]}
                                                                                      // disabled={disableFieldCommom}
                                                                                      options={days}
                                                                                      onChange={(e) => handleChangeValueDay(e, idx, idxList)}
                                                                                      className="founded__day"
                                                                                  />

                                                                                  <SelectCustom
                                                                                      placeholder="Chọn tháng"
                                                                                      name="foundingMonth"
                                                                                      fill={true}
                                                                                      value={+el.value.split("/")[1]}
                                                                                      // disabled={disableFieldCommom}
                                                                                      options={months}
                                                                                      onChange={(e) => handleChangeValueMonth(e, idx, idxList)}
                                                                                      className="founded_month"
                                                                                  />

                                                                                  <SelectCustom
                                                                                      placeholder="Chọn năm"
                                                                                      name="foundingYear"
                                                                                      fill={true}
                                                                                      value={+el.value.split("/")[2]}
                                                                                      // disabled={disableFieldCommom}
                                                                                      options={years}
                                                                                      onChange={(e) => handleChangeValueYear(e, idx, idxList)}
                                                                                      className="founded__day"
                                                                                  />
                                                                              </div>
                                                                              )
                                                                            } */}
                                              </div>
                                            ) : null}
                                          </div>

                                          <div className="action__add--rule">
                                            <Tippy content="Thêm">
                                              <span
                                                className="icon__add"
                                                onClick={() => {
                                                  setConditionList((current) =>
                                                    current.map((obj, index) => {
                                                      if (index === idxList) {
                                                        return {
                                                          ...obj,
                                                          rule: [
                                                            ...obj.rule,
                                                            {
                                                              typeFieldName: 1, //1-chọn trường trong form, 2-chọn biến quy trình
                                                              fieldName: null,
                                                              nodeId: null,
                                                              operator: "eq",
                                                              value: "",
                                                              typeValue: 0, // 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
                                                              type: null,
                                                            },
                                                          ],
                                                        };
                                                      }
                                                      return obj;
                                                    })
                                                  );
                                                }}
                                              >
                                                <Icon name="PlusCircleFill" />
                                              </span>
                                            </Tippy>
                                          </div>

                                          {item.rule.length > 1 ? (
                                            <div className="action__delete--rule">
                                              <Tippy content="Xóa">
                                                <span className="icon__delete" onClick={() => handleDeleteItemField(idx, idxList)}>
                                                  <Icon name="Trash" />
                                                </span>
                                              </Tippy>
                                            </div>
                                          ) : null}
                                        </div>
                                        {item.rule.length > 1 && (
                                          <span className="view__logical view__logical--rule">{item.logical === "and" ? "And" : "Or"}</span>
                                        )}
                                      </Fragment>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>

                          {item.blockRule && item.blockRule.length > 0 && (
                            <div className="lv__item lv__2">
                              {item.blockRule.map((el, idx) => {
                                return (
                                  <div key={idx} className="box__block--rule">
                                    <span className="view__logical">{item.logical === "and" ? "And" : "Or"}</span>

                                    <div className="block__rule">
                                      <div className="action__choose--item action__choose--lv2">
                                        <Button
                                          color={el.logical === "and" ? "primary" : "secondary"}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handChangeLogical(idx, "and", idxList);
                                          }}
                                          // disabled={disableFieldCommom}
                                        >
                                          AND
                                        </Button>
                                        <Button
                                          color={el.logical === "or" ? "primary" : "secondary"}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handChangeLogical(idx, "or", idxList);
                                          }}
                                          // disabled={disableFieldCommom}
                                        >
                                          OR
                                        </Button>
                                        {/* <Button
                                                            color="success"
                                                            className="icon__add"
                                                            onClick={(e) => {
                                                            e.preventDefault();
                                                            handAddItemBlock(idx);
                                                            }}
                                                            // disabled={disableFieldCommom}
                                                        >
                                                            <Icon name="PlusCircleFill" />
                                                        </Button> */}
                                        <Button
                                          color="destroy"
                                          className="icon__detete"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handDeleteItemBlock(idx, idxList);
                                          }}
                                          // disabled={disableFieldCommom}
                                        >
                                          <Icon name="Trash" />
                                        </Button>
                                      </div>

                                      <div className="including__conditions__eform">
                                        {/* <div className={`lst__option--group-field`}>
                                                                <div className={"container-select-mapping"}>
                                                                    <div className="select-mapping">
                                                                        <SelectCustom
                                                                            key={typeAttributeLv2}
                                                                            id=""
                                                                            name=""
                                                                            // label="Chọn biểu mẫu"
                                                                            options={[]}
                                                                            fill={false}
                                                                            // value={formData.dataEform}
                                                                            special={true}
                                                                            required={true}
                                                                            onChange={(e) => handlePushRuleBlock(e, idx, el.rule, idxList)}
                                                                            isAsyncPaginate={true}
                                                                            isFormatOptionLabel={false}
                                                                            placeholder={typeAttributeLv2 === 1 ? 'Chọn trường trong form' : 'Chọn biến'}
                                                                            additional={{
                                                                                page: 1,
                                                                            }}
                                                                            loadOptionsPaginate={typeAttributeLv2 === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                                            // formatOptionLabel={formatOptionLabelEmployee}
                                                                            // error={checkFieldEform}
                                                                            // message="Biểu mẫu không được bỏ trống"
                                                                        />
                                                                    </div>
                                                                    <Tippy  
                                                                        content={typeAttributeLv2 === 2 ? 'Chuyển chọn trường trong form' : 'Chuyển chọn biến'}
                                                                    >
                                                                        <div 
                                                                            className={'icon-change-select'}
                                                                            onClick={(e) => {
                                                                                if(typeAttributeLv2 === 1){
                                                                                setTypeAttributeLv2(2);
                                                                                } else {
                                                                                setTypeAttributeLv2(1)
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Icon name="ResetPassword" style={{width: 18}} />
                                                                        </div>
                                                                    </Tippy>
                                                                </div>
                                                            </div> */}

                                        <div className="lst__field--rule">
                                          {el.rule &&
                                            el.rule.length > 0 &&
                                            el.rule.map((il, index) => {
                                              return (
                                                <Fragment key={index}>
                                                  <div className="item__rule">
                                                    <div className="lst__info--rule">
                                                      <div className="info-item" style={!il.fieldName ? { width: "100%" } : {}}>
                                                        {/* <span className="name-field">{il.fieldName}</span> */}
                                                        <div className={"container-select-mapping"}>
                                                          <div className="select-mapping">
                                                            <SelectCustom
                                                              key={il.typeFieldName}
                                                              id=""
                                                              name=""
                                                              // label="Chọn biểu mẫu"
                                                              options={[]}
                                                              fill={false}
                                                              value={il.fieldName ? { value: il.fieldName, label: il.fieldName } : null}
                                                              special={true}
                                                              required={true}
                                                              onChange={(e) => handlePushRuleBlock(e, index, idx, idxList)}
                                                              isAsyncPaginate={true}
                                                              isFormatOptionLabel={false}
                                                              placeholder={il.typeFieldName === 1 ? "Chọn trường trong form" : "Chọn biến"}
                                                              additional={{
                                                                page: 1,
                                                              }}
                                                              loadOptionsPaginate={il.typeFieldName === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                              // formatOptionLabel={formatOptionLabelEmployee}
                                                              // error={checkFieldEform}
                                                              // message="Biểu mẫu không được bỏ trống"
                                                            />
                                                          </div>
                                                          <Tippy
                                                            content={il.typeFieldName === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}
                                                          >
                                                            <div
                                                              className={"icon-change-select"}
                                                              onClick={(e) => {
                                                                setConditionList((current) =>
                                                                  current.map((obj, ids) => {
                                                                    if (ids === idxList) {
                                                                      return {
                                                                        ...obj,
                                                                        blockRule: [...obj.blockRule].map((el, ids) => {
                                                                          if (ids === idx) {
                                                                            return {
                                                                              ...el,
                                                                              rule: [...el.rule].map((ol, i) => {
                                                                                if (i === index) {
                                                                                  return {
                                                                                    ...ol,
                                                                                    typeFieldName: il.typeFieldName === 1 ? 2 : 1,
                                                                                  };
                                                                                }

                                                                                return ol;
                                                                              }),
                                                                            };
                                                                          }

                                                                          return el;
                                                                        }),
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

                                                      {il.fieldName ? (
                                                        <div className="info-item">
                                                          <SelectCustom
                                                            name="condition"
                                                            fill={true}
                                                            value={il.operator}
                                                            options={
                                                              il.fieldName === "name"
                                                                ? lstConditionFieldSpecialText
                                                                : il.type === "text" && il.fieldName === "email"
                                                                ? [...lstConditionFieldText, { value: "ne", label: "Not_Equal" }]
                                                                : il.type === "text" || il.type === "textfield"
                                                                ? lstConditionFieldText
                                                                : il.fieldName === "height" || il.fieldName === "weight"
                                                                ? lstConditionFieldSpecialNumber
                                                                : il.type === "number"
                                                                ? lstConditionFieldNumber
                                                                : il.type === "date"
                                                                ? lstConditionFieldDate
                                                                : lstConditionFieldSelect
                                                            }
                                                            // disabled={disableFieldCommom}
                                                            onChange={(e) => handleChangeValueBlockCondition(e, index, idx, idxList)}
                                                          />
                                                        </div>
                                                      ) : null}

                                                      {il.fieldName ? (
                                                        <div className="info-item">
                                                          <div className={"container-select-mapping"}>
                                                            {!il.typeValue ? (
                                                              <div className="input-text">
                                                                <Input
                                                                  name={il.fieldName}
                                                                  fill={false}
                                                                  value={il.value}
                                                                  // disabled={disableFieldCommom}
                                                                  onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "input", idxList)}
                                                                  // placeholder={`Nhập ${il.fieldName?.toLowerCase()}`}
                                                                  placeholder={`Nhập giá trị`}
                                                                />
                                                              </div>
                                                            ) : (
                                                              <div className="select-mapping">
                                                                <SelectCustom
                                                                  key={il.typeValue}
                                                                  id=""
                                                                  name=""
                                                                  // label="Chọn biểu mẫu"
                                                                  options={[]}
                                                                  fill={false}
                                                                  value={il.value ? { value: il.value, label: il.value } : null}
                                                                  special={true}
                                                                  required={true}
                                                                  onChange={(e) =>
                                                                    handChangeValueTypeBlockItem(
                                                                      e,
                                                                      index,
                                                                      idx,
                                                                      il.typeValue === 1 ? "form" : "var",
                                                                      idxList
                                                                    )
                                                                  }
                                                                  isAsyncPaginate={true}
                                                                  isFormatOptionLabel={false}
                                                                  placeholder={il.typeValue === 1 ? "Chọn trường trong form" : "Chọn biến"}
                                                                  additional={{
                                                                    page: 1,
                                                                  }}
                                                                  loadOptionsPaginate={il.typeValue === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                                  // formatOptionLabel={formatOptionLabelEmployee}
                                                                  // error={checkFieldEform}
                                                                  // message="Biểu mẫu không được bỏ trống"
                                                                />
                                                              </div>
                                                            )}
                                                            <Tippy
                                                              content={
                                                                il.typeValue === 0
                                                                  ? "Chuyển chọn trường trong form"
                                                                  : il.typeValue === 1
                                                                  ? "Chuyển chọn biến"
                                                                  : "Chuyển nhập giá trị"
                                                              }
                                                            >
                                                              <div
                                                                className={"icon-change-select"}
                                                                onClick={(e) => {
                                                                  setConditionList((current) =>
                                                                    current.map((obj, ids) => {
                                                                      if (ids === idxList) {
                                                                        return {
                                                                          ...obj,
                                                                          blockRule: [...obj.blockRule].map((el, ids) => {
                                                                            if (ids === idx) {
                                                                              return {
                                                                                ...el,
                                                                                rule: [...el.rule].map((ol, i) => {
                                                                                  if (i === index) {
                                                                                    return {
                                                                                      ...ol,
                                                                                      typeValue: il.typeValue === 0 ? 1 : il.typeValue === 1 ? 2 : 0,
                                                                                      value: "",
                                                                                    };
                                                                                  }

                                                                                  return ol;
                                                                                }),
                                                                              };
                                                                            }

                                                                            return el;
                                                                          }),
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
                                                          {/* {il.type === "text" || il.type === "textfield" || il.type === "select" || il.type === "dropdown" ? (
                                                                                                <Input
                                                                                                    name={il.fieldName}
                                                                                                    fill={true}
                                                                                                    value={il.value}
                                                                                                    // disabled={disableFieldCommom}
                                                                                                    onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "input", idxList)}
                                                                                                    placeholder={`Nhập ${il.fieldName?.toLowerCase()}`}
                                                                                                />
                                                                                            ) : il.type === "number" || il.type === "int" ? (
                                                                                                <NummericInput
                                                                                                    name={il.fieldName}
                                                                                                    fill={true}
                                                                                                    value={il.value}
                                                                                                    thousandSeparator={true}
                                                                                                    // disabled={disableFieldCommom}
                                                                                                    onValueChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "number", idxList)}
                                                                                                    placeholder={`Nhập ${il.fieldName?.toLowerCase()}`}
                                                                                                />
                                                                                            ) : il.type === "date" || il.type === "datetime" ? (
                                                                                                <DatePickerCustom
                                                                                                    name={il.fieldName}
                                                                                                    fill={true}
                                                                                                    value={il.value}
                                                                                                    iconPosition="left"
                                                                                                    // disabled={disableFieldCommom}
                                                                                                    icon={<Icon name="Calendar" />}
                                                                                                    onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "date", idxList)}
                                                                                                    placeholder={`Chọn ${il.fieldName?.toLowerCase()}`}
                                                                                                />
                                                                                            ) : il.type === "select" || il.type === "dropdown" ? (
                                                                                                <SelectCustom
                                                                                                    name={il.fieldName}
                                                                                                    fill={true}
                                                                                                    options={il.options || []}
                                                                                                    value={+il.value}
                                                                                                    isLoading={isLoadingSource}
                                                                                                    onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "select", idxList)}
                                                                                                    onMenuOpen={() =>
                                                                                                        onSelectOpenBlockApi(
                                                                                                            il.source,
                                                                                                            index,
                                                                                                            idx,
                                                                                                            idxList
                                                                                                        )
                                                                                                    }
                                                                                                    placeholder={`Chọn ${il.fieldName?.toLowerCase()}`}
                                                                                                    // disabled={
                                                                                                    //     (el.fieldName === "district_id" &&
                                                                                                    //     !item.rule.some((il) => il.fieldName === "city_id" && il.value !== "")) ||
                                                                                                    //     (el.fieldName === "subdistrict_id" &&
                                                                                                    //     (!item.rule.some((il) => il.fieldName === "city_id" && il.value !== "") ||
                                                                                                    //         !item.rule.some((il) => il.fieldName === "district_id" && il.value !== "")))
                                                                                                    // }
                                                                                                />
                                                                                            ) : (
                                                                                                <div className="field__special">
                                                                                                    <SelectCustom
                                                                                                        placeholder="Chọn ngày"
                                                                                                        name="foundingDay"
                                                                                                        fill={true}
                                                                                                        value={+il.value.split("/")[0]}
                                                                                                        options={days}
                                                                                                        // disabled={disableFieldCommom}
                                                                                                        onChange={(e) => handleChangeValueBlockDay(e, index, idx, idxList)}
                                                                                                        className="founded__day"
                                                                                                    />

                                                                                                    <SelectCustom
                                                                                                        placeholder="Chọn tháng"
                                                                                                        name="foundingMonth"
                                                                                                        fill={true}
                                                                                                        value={+il.value.split("/")[1]}
                                                                                                        options={months}
                                                                                                        // disabled={disableFieldCommom}
                                                                                                        onChange={(e) => handleChangeValueBlockMonth(e, index, idx, idxList)}
                                                                                                        className="founded_month"
                                                                                                    />

                                                                                                    <SelectCustom
                                                                                                        placeholder="Chọn năm"
                                                                                                        name="foundingYear"
                                                                                                        fill={true}
                                                                                                        value={+il.value.split("/")[2]}
                                                                                                        options={years}
                                                                                                        // disabled={disableFieldCommom}
                                                                                                        onChange={(e) => handleChangeValueBlockYear(e, index, idx, idxList)}
                                                                                                        className="founded__day"
                                                                                                    />
                                                                                                </div>
                                                                                            )
                                                                                          } */}
                                                        </div>
                                                      ) : null}
                                                    </div>

                                                    <div className="action__add--rule">
                                                      <Tippy content="Thêm">
                                                        <span
                                                          className="icon__add"
                                                          onClick={() => {
                                                            setConditionList((current) =>
                                                              current.map((obj, index) => {
                                                                if (index === idxList) {
                                                                  return {
                                                                    ...obj,
                                                                    blockRule: [...obj.blockRule].map((el, index) => {
                                                                      if (index === idx) {
                                                                        return {
                                                                          ...el,
                                                                          rule: [
                                                                            ...el.rule,
                                                                            {
                                                                              typeFieldName: 1, //1-chọn trường trong form, 2-chọn biến quy trình
                                                                              fieldName: null,
                                                                              nodeId: null,
                                                                              operator: "eq",
                                                                              value: "",
                                                                              typeValue: 0, // 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
                                                                              type: null,
                                                                            },
                                                                          ],
                                                                        };
                                                                      }

                                                                      return el;
                                                                    }),
                                                                  };
                                                                }
                                                                return obj;
                                                              })
                                                            );
                                                          }}
                                                        >
                                                          <Icon name="PlusCircleFill" />
                                                        </span>
                                                      </Tippy>
                                                    </div>

                                                    {el.rule.length > 1 ? (
                                                      <div className="action__delete--rule">
                                                        <Tippy content="Xóa">
                                                          <span
                                                            className="icon__delete"
                                                            onClick={() => handleDeleteBlockItemField(index, idx, idxList)}
                                                          >
                                                            <Icon name="Trash" />
                                                          </span>
                                                        </Tippy>
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                  {el.rule.length > 1 && (
                                                    <span className="view__logical view__logical--rule--block">
                                                      {el.logical === "and" ? "And" : "Or"}
                                                    </span>
                                                  )}
                                                </Fragment>
                                              );
                                            })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="condition-result">
                            <div>
                              <span style={{ fontSize: 14, fontWeight: "700", color: "var(--success-color" }}>Kết quả</span>
                            </div>
                            <div className="list-item-result">
                              <div className="item-result">
                                <div className={"container-select-mapping"}>
                                  <div className="select-mapping">
                                    <SelectCustom
                                      key={item?.result?.resultType}
                                      id="fielName"
                                      name="fielName"
                                      // label={index === 0 ? "Biến quy trình" : ''}
                                      fill={false}
                                      required={false}
                                      // error={item.checkMapping}
                                      // message="Biến quy trình không được để trống"
                                      options={[]}
                                      value={
                                        item?.result?.resultAttribute
                                          ? { value: item?.result?.resultAttribute, label: item?.result?.resultAttribute }
                                          : null
                                      }
                                      onChange={(e) => {
                                        setConditionList((current) =>
                                          current.map((obj, idx) => {
                                            if (idxList === idx) {
                                              return { ...obj, result: { ...obj.result, resultAttribute: e.label } };
                                            }
                                            return obj;
                                          })
                                        );
                                      }}
                                      isAsyncPaginate={true}
                                      isFormatOptionLabel={false}
                                      placeholder={item?.result?.resultType === 2 ? "Chọn biến" : "Chọn trường trong form"}
                                      additional={{
                                        page: 1,
                                      }}
                                      loadOptionsPaginate={item?.result?.resultType === 2 ? loadedOptionAttribute : loadedOptionForm}
                                      // formatOptionLabel={formatOptionLabelEmployee}
                                      // disabled={}
                                    />
                                  </div>
                                  <Tippy content={item?.result?.resultType === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}>
                                    <div
                                      className={"icon-change-select"}
                                      onClick={(e) => {
                                        setConditionList((current) =>
                                          current.map((obj, idx) => {
                                            if (idxList === idx) {
                                              return { ...obj, result: { ...obj.result, resultType: item?.result?.resultType === 1 ? 2 : 1 } };
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
                              <div className="item-result">
                                <Input
                                  id="nameInput"
                                  name="nameInput"
                                  // label={index === 0 ? "Tên tham số đầu vào" : ''}
                                  fill={true}
                                  required={false}
                                  // error={item.checkName}
                                  // message="Tên tham số đầu vào không được để trống"
                                  placeholder={"Nhập giá trị"}
                                  value={item?.result?.resultValue}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setConditionList((current) =>
                                      current.map((obj, idx) => {
                                        if (idxList === idx) {
                                          return { ...obj, result: { ...obj.result, resultValue: value } };
                                        }
                                        return obj;
                                      })
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    : null}
                  <div ref={endRef} />
                </div>
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
            ) : typeNode == "advance" ? (
              <div className="advance-container">
                <div className="list-form-group">
                  <div className="form-group" style={{ width: "100%" }}>
                    <Input
                      id="name"
                      name="name"
                      label="Tên nhiệm vụ"
                      fill={true}
                      required={true}
                      placeholder={"Tên nhiệm vụ"}
                      value={formDataAdvance.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormDataAdvance({ ...formDataAdvance, name: value });
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ width: "100%" }}>
                    <TextArea
                      name="note"
                      value={formDataAdvance.description}
                      label="Mô tả nhiệm vụ"
                      row={1}
                      fill={true}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormDataAdvance({ ...formDataAdvance, description: value });
                      }}
                      placeholder="Nhập mô tả"
                    />
                  </div>
                </div>
                {isLoadingDataAdvance ? (
                  <div className="loading-type">
                    <div>
                      <Icon name="Loading" />
                    </div>
                  </div>
                ) : (
                  <AdvanceRule
                    dataNode={dataNode}
                    processId={processId}
                    childProcessId={childProcessId}
                    dataConfigAdvance={dataConfigAdvance}
                    setDataConfigAdvanceEdit={setDataConfigAdvanceEdit}
                  />
                )}
              </div>
            ) : typeNode == "complex" ? (
              <div className="complex-container">
                <div className="list-form-group">
                  <div className="form-group" style={{ width: "100%" }}>
                    <Input
                      id="name"
                      name="name"
                      label="Tên nhiệm vụ"
                      fill={true}
                      required={true}
                      placeholder={"Tên nhiệm vụ"}
                      value={formDataComplex.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormDataComplex({ ...formDataComplex, name: value });
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ width: "100%" }}>
                    <SelectCustom
                      // key={listAttribute.length}
                      id=""
                      name="name"
                      label={"Luật nghiệp vụ"}
                      fill={true}
                      required={true}
                      // error={item.checkMapping}
                      // message="Biến quy trình không được để trống"
                      options={[]}
                      value={dataBusinessRule}
                      onChange={(e) => {
                        setDataBusinessRule(e);
                        setListMappingInput([]);
                        setListMappingOutput([]);
                        setFormDataComplex({ ...formDataComplex, code: e.value });
                      }}
                      isAsyncPaginate={true}
                      placeholder="Chọn loại luật nghiệp vụ"
                      additional={{
                        page: 1,
                      }}
                      loadOptionsPaginate={loadedOptionBusinesRule}
                      // formatOptionLabel={formatOptionLabelAttribute}
                    />
                  </div>

                  <div className="form-group" style={{ width: "100%" }}>
                    <TextArea
                      name="note"
                      value={formDataComplex.description}
                      label="Mô tả nhiệm vụ"
                      row={1}
                      fill={true}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormDataComplex({ ...formDataComplex, description: value });
                      }}
                      placeholder="Nhập mô tả"
                    />
                  </div>
                </div>
                {!dataBusinessRule?.id ? null : (
                  <Reference
                    processId={processId}
                    dataBusinessRule={dataBusinessRule}
                    listMappingInput={listMappingInput}
                    setListMappingInput={setListMappingInput}
                    listMappingOutput={listMappingOutput}
                    setListMappingOutput={setListMappingOutput}
                  />
                )}
              </div>
            ) : (
              <div className="loading-type">
                {isLoadingType ? (
                  <div>
                    <Icon name="Loading" />
                  </div>
                ) : (
                  <div>Lỗi xác định loại biểu mẫu</div>
                )}
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
