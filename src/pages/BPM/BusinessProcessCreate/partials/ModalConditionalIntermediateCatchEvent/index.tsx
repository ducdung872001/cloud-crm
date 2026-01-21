import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId, convertParamsToString } from "reborn-util";
import "./index.scss";
import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import TextArea from "components/textarea/textarea";
import Tippy from "@tippyjs/react";
import BusinessProcessService from "services/BusinessProcessService";
import { showToast } from "utils/common";
import Button from "components/button/button";
import ModalSetting from "../ModalUserTask/partials/ModalSetting";
import ModalSelectNodeOther from "../ModalSelectNodeOther";
import ModalDebug from "../ModalUserTask/partials/ModalDebug";
import Checkbox from "components/checkbox/checkbox";
import moment from "moment";
import ListButtonHeader from "../../components/ListButtonHeader/ListButtonHeader";

export default function ModalConditionalIntermediateCatchEvent({ onShow, onHide, dataNode, processId, changeNameNodeXML, disable }) {
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
    const response = await BusinessProcessService.detailConditionalCatchEventTask(id);

    if (response.code == 0) {
      const result = response.result;
      const config = result.config && JSON.parse(result.config);
      const data = {
        ...result,
        rule: config?.rule,
        logical: config?.logical,
        blockRule: config?.blockRule,
       
      };
    //   setDataWorkflow(result?.workflowId ? { value: result.workflowId, label: result.workflowName } : null);
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
      status: data?.status ?? 0,
      config: data?.config ?? '',
      nodeId: dataNode?.id ?? null,
    //   processId: childProcessId ?? processId ?? null,
    //   workflowId: data?.workflowId ?? null,

      logical: data?.logical ? data.logical : "and",
      blockRule: data?.blockRule ? data.blockRule : [],
      rule: data?.rule
        ? data.rule
        : [
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

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    const configDataNew = {
        rule: formData.rule,
        logical: formData.logical,
        blockRule: formData.blockRule,
    };

    const body = {
      id: data?.id ?? null,
      name: formData.name ?? "",
      code: formData?.code ?? "",
      description: formData?.description ?? "",
      status: formData?.status ?? 0,
      config: JSON.stringify(configDataNew),
      nodeId: dataNode?.id ?? null,
    //   processId: formData?.processId ?? null,
    //   workflowId: formData?.workflowId ?? null,
    };
    console.log("body", body);

    const response = await BusinessProcessService.updateConditionalCatchEventTask(body);

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
      const listForm = [];
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

  //điều kiện
  const lstConditionFieldText = [
    { value: "eq", label: "Equal" },
    { value: "like", label: "Like" },
  ];

  const lstConditionFieldSpecialText = [{ value: "like", label: "Like" }];

  const lstConditionField = [
    { value: "nin", label: "Nin" },
    { value: "eq", label: "Equal" },
    { value: "in", label: "In" },
    { value: "include", label: "Include" },
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

  const defaultBlockRule = {
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

  const refOptionField = useRef();
  const refBlockOptionField = useRef();
  const refChildrenBlockOptionField = useRef();

  const transformSegment = async (segment, fields) => {
    const transformedSegment = { ...segment };

    if (transformedSegment.rule) {
      transformedSegment.rule = await transformRule(transformedSegment.rule, fields);
    }

    if (transformedSegment.blockRule) {
      transformedSegment.blockRule = await transformSegmentArray(transformedSegment.blockRule, fields);
    }

    return transformedSegment;
  };

  const transformRule = async (rule, fields) => {
    const transformedConditions = await Promise.all(
      rule.map(async (condition) => {
        const field = fields.find((f) => f.fieldName === condition.fieldName);

        if (field && field.type === "select" && field.source) {
          try {
            const checkFieldSource = field.source.startsWith("https");

            const params = {
              ...(checkFieldSource
                ? {
                    parentId:
                      condition.fieldName == "city_id"
                        ? 0
                        : condition.fieldName == "district_id"
                        ? +rule.find((el) => el.fieldName === "city_id").value
                        : +rule.find((el) => el.fieldName === "district_id").value,
                  }
                : {}),
              limit: 1000,
            };

            const link = checkFieldSource ? field.source : process.env.APP_API_URL + field.source;
            // Call API to fetch data from source
            const response = await fetch(`${link}${convertParamsToString(params)}`, {
              method: "GET",
            }).then((res) => res.json());

            const data = response.result.items ? response.result.items : response.result;

            const changeDataResult = data.map((item) => {
              return {
                value: item.id,
                label: item.name,
              };
            });

            return {
              ...condition,
              type: field.type,
              options: changeDataResult,
              source: field.source,
            };
          } catch (error) {
            console.error(`Error fetching data from source: ${field.source}`, error);
            return condition;
          }
        } else if (field && field.type === "select") {
          return {
            ...condition,
            type: field.type,
            options: field.options || [],
            source: field.source || "",
          };
        }

        return condition;
      })
    );

    return transformedConditions;
  };

  const transformSegmentArray = async (segmentArray, fields) => {
    return await Promise.all(segmentArray.map(async (segment) => await transformSegment(segment, fields)));
  };

    //! Đoạn này xử lý lv-1
    const handlePushRule = (data, idx) => {
        console.log("data", data);
    
        if (!data) return;
    
        // const changeData = {
        //   fieldName: data?.label,
        //   nodeId: data?.nodeId,
        //   operator: "eq",
        //   value: "",
        //   type: data.datatype
        // };
    
        // setFormData({ ...formData, rule: [...formData.rule, ...([changeData])] });
    
        setFormData({
          ...formData,
          rule: [...formData.rule].map((el, index) => {
            if (idx === index) {
              return {
                ...el,
                fieldName: data?.label,
                nodeId: data?.nodeId,
                type: data.datatype,
              };
            }
    
            return el;
          }),
        });
      };
    
      const handleChangeValueCondition = (e, idx) => {
        const value = e.value;
    
        setFormData({
          ...formData,
          rule: [...formData.rule].map((el, index) => {
            if (idx === index) {
              return {
                ...el,
                operator: value,
              };
            }
    
            return el;
          }),
        });
      };
    
      const handChangeValueTypeItem = (e, idx, type) => {
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
    
        setFormData({
          ...formData,
          rule: [...formData.rule].map((el, index) => {
            if (idx === index) {
              return {
                ...el,
                value: value,
              };
            }
    
            return el;
          }),
        });
      };
    
      const handleDeleteItemField = (idx) => {
        const newData = [...formData.rule];
    
        newData.splice(idx, 1);
    
        // Kiểm tra và xóa liên quan
        const deletedField = formData.rule[idx].fieldName;
        if (deletedField === "city_id") {
          // Nếu xóa "city_id", thì clear giá trị "district_id" và "subdistrict_id"
          newData.forEach((item) => {
            if (item.fieldName === "district_id" || item.fieldName === "subdistrict_id") {
              item.value = "";
            }
          });
        } else if (deletedField === "district_id") {
          // Nếu xóa "district_id", thì clear giá trị "subdistrict_id"
          newData.forEach((item) => {
            if (item.fieldName === "subdistrict_id") {
              item.value = "";
            }
          });
        }
    
        setFormData({ ...formData, rule: newData });
      };

      //! Đoạn này xử lý lv-2
    const handChangeLogical = (idx, type) => {
        setFormData({
        ...formData,
        blockRule: [...formData.blockRule].map((el, index) => {
            if (index === idx) {
            return {
                ...el,
                logical: type,
            };
            }

            return el;
        }),
        });
    };

    const handDeleteItemBlock = (idx) => {
        const newData = [...formData.blockRule];
        newData.splice(idx, 1);
    
        setFormData({ ...formData, blockRule: newData });
      };
    
      const handlePushRuleBlock = (data, ids, idx) => {
        if (!data) return;
    
        setFormData({
          ...formData,
          blockRule: [...formData.blockRule].map((el, index) => {
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
        });
      };
    
      const handleChangeValueBlockCondition = (e, ids, idx) => {
        const value = e.value;
    
        setFormData({
          ...formData,
          blockRule: [...formData.blockRule].map((el, index) => {
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
        });
      };
    
      const handChangeValueTypeBlockItem = (e, ids, idx, type) => {
        let value = null;
        if (type === "input") {
          value = e.target.value;
        } else if (type === "number") {
          value = e.floatValue;
        } else if (type === "date") {
          value = e;
        } else {
          value = e.value;
        }
    
        setFormData({
          ...formData,
          blockRule: [...formData.blockRule].map((el, index) => {
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
        });
      };

      const handleDeleteBlockItemField = (ids, idx) => {
        const groupRuleFilter = formData.blockRule[idx];
        const ruleFilter = groupRuleFilter.rule.filter((field, i) => i !== ids);
    
        // Kiểm tra và xóa liên quan
        const deletedField = groupRuleFilter.rule[ids].fieldName;
        if (deletedField === "city_id") {
          // Nếu xóa "city_id", thì clear giá trị "district_id" và "subdistrict_id"
          ruleFilter.forEach((item) => {
            if (item.fieldName === "district_id" || item.fieldName === "subdistrict_id") {
              item.value = "";
            }
          });
        } else if (deletedField === "district_id") {
          // Nếu xóa "district_id", thì clear giá trị "subdistrict_id"
          ruleFilter.forEach((item) => {
            if (item.fieldName === "subdistrict_id") {
              item.value = "";
            }
          });
        }
    
        setFormData({
          ...formData,
          blockRule: [...formData.blockRule].map((el, index) => {
            if (index === idx) {
              return {
                ...el,
                rule: ruleFilter,
              };
            }
    
            return el;
          }),
        });
      };

      const transformData = (data) => {
        if (Array.isArray(data)) {
          return data.map(transformData);
        } else if (typeof data === "object") {
          const result = {};
          for (const key in data) {
            if (key === "options" || key === "source") {
              continue; // Loại bỏ các trường "options" và "source"
            }
    
            if (key === "rule" && data[key].length > 0) {
              result[key] = data[key].map((rule) => {
                if (rule.operator === "in" && rule.value !== undefined) {
                  if (rule.type === "date") {
                    rule.value = JSON.stringify([moment(rule.value).format("DD/MM/YYYY")]);
                  } else {
                    rule.value = JSON.stringify([rule.value]);
                  }
                } else if (rule.type === "date") {
                  // && typeof rule.value === "string"
                  rule.value = moment(rule.value).format("DD/MM/YYYY");
                }
    
                return transformData(rule);
              });
            } else if (key === "blockRule" && data[key].length > 0) {
              result[key] = data[key].map((block) => transformData(block));
            } else {
              result[key] = transformData(data[key]);
            }
          }
          return result;
        } else {
          return data;
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
        className="modal-intermediate-catch-event"
      >
        <form className="form-intermediate-catch-event" onSubmit={(e) => onSubmit(e)}>
          {/* <ModalHeader title={`Cài đặt biểu mẫu`} toggle={() => !isSubmit && handleClear(false)} /> */}
          <div className="container-header">
            <div className="box-title">
              <h4>{"Cài đặt Conditional Catch Event"}</h4>
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
                <div>
                  <span style={{ fontSize: 14, fontWeight: "700" }}>Kích hoạt node</span>
                </div>
                <div style={{ marginLeft: 10 }}>
                  <Checkbox
                    checked={formData.status === 1 ? true : false}
                    label="Kích hoạt"
                    onChange={() => {
                      setFormData({
                        ...formData,
                        status: formData.status === 1 ? 0 : 1,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="condition-segment">
                <div className="form-group">
                  <span className="name-group">Điều kiện</span>
                  <div className="desc__filter">
                    <div className="lv__item lv__1">
                      {/* đoạn này là chọn các loại điều kiện */}
                      <div className="action__choose--item action__choose--lv1">
                        <Button
                          color={formData.logical === "and" ? "primary" : "secondary"}
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData({ ...formData, logical: "and" });
                          }}
                          // disabled={disableFieldCommom}
                        >
                          AND
                        </Button>
                        <Button
                          color={formData.logical === "or" ? "primary" : "secondary"}
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData({ ...formData, logical: "or" });
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
                            setFormData({ ...formData, blockRule: [...formData.blockRule, defaultBlockRule] });
                          }}
                          // disabled={disableFieldCommom}
                        >
                          <Icon name="PlusCircleFill" />
                        </Button>
                      </div>

                      <div className="including__conditions__eform">
                        <div className="lst__field--rule">
                          {formData.rule &&
                            formData.rule.length > 0 &&
                            formData.rule.map((item, idx) => {
                              return (
                                <Fragment key={idx}>
                                  <div className="item__rule">
                                    <div className="lst__info--rule">
                                      <div className="info-item" style={!item.fieldName ? { width: "100%" } : {}}>
                                        <div className={"container-select-mapping"}>
                                          {!item.typeFieldName ? (
                                            <div className="input-text">
                                              <Input
                                                name={item.fieldName}
                                                fill={false}
                                                value={item.fieldName}
                                                // disabled={disableFieldCommom}
                                                onChange={(e) => {
                                                  setFormData({
                                                    ...formData,
                                                    rule: [...formData.rule].map((el, index) => {
                                                      if (idx === index) {
                                                        return {
                                                          ...el,
                                                          fieldName: e.target.value,
                                                        };
                                                      }
                                                      return el;
                                                    }),
                                                  });
                                                }}
                                                placeholder={`Nhập giá trị`}
                                              />
                                            </div>
                                          ) : (
                                            <div className="select-mapping">
                                              <SelectCustom
                                                key={item.typeFieldName}
                                                id=""
                                                name=""
                                                // label="Chọn biểu mẫu"
                                                options={[]}
                                                fill={false}
                                                value={item.fieldName ? { value: item.fieldName, label: item.fieldName } : null}
                                                special={true}
                                                required={true}
                                                onChange={(e) => handlePushRule(e, idx)}
                                                isAsyncPaginate={true}
                                                isFormatOptionLabel={false}
                                                placeholder={item.typeFieldName === 1 ? "Chọn trường trong form" : "Chọn biến"}
                                                additional={{
                                                  page: 1,
                                                }}
                                                loadOptionsPaginate={item.typeFieldName === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                // formatOptionLabel={formatOptionLabelEmployee}
                                                // error={checkFieldEform}
                                                // message="Biểu mẫu không được bỏ trống"
                                              />
                                            </div>
                                          )}
                                          <Tippy
                                            content={
                                              item.typeFieldName === 0
                                                ? "Chuyển chọn trường trong form"
                                                : item.typeFieldName === 1
                                                ? "Chuyển chọn biến"
                                                : "Chuyển nhập giá trị"
                                            }
                                          >
                                            <div
                                              className={"icon-change-select"}
                                              onClick={(e) => {
                                                setFormData({
                                                  ...formData,
                                                  rule: [...formData.rule].map((el, index) => {
                                                    if (idx === index) {
                                                      return {
                                                        ...el,
                                                        typeFieldName: item.typeFieldName === 0 ? 1 : item.typeFieldName === 1 ? 2 : 0,
                                                        // fieldName: '',
                                                        nodeId: "",
                                                        type: "",
                                                      };
                                                    }

                                                    return el;
                                                  }),
                                                });
                                              }}
                                            >
                                              <Icon name="ResetPassword" style={{ width: 18 }} />
                                            </div>
                                          </Tippy>
                                        </div>
                                      </div>
                                      {item.fieldName ? (
                                        <div className="info-item">
                                          <SelectCustom
                                            name="condition"
                                            fill={true}
                                            value={item.operator}
                                            options={lstConditionField}
                                            // disabled={disableFieldCommom}
                                            onChange={(e) => handleChangeValueCondition(e, idx)}
                                          />
                                        </div>
                                      ) : null}

                                      {item.fieldName ? (
                                        <div className="info-item">
                                          <div className={"container-select-mapping"}>
                                            {!item.typeValue ? (
                                              <div className="input-text">
                                                <Input
                                                  name={item.value}
                                                  fill={false}
                                                  value={item.value}
                                                  // disabled={disableFieldCommom}
                                                  onChange={(e) => handChangeValueTypeItem(e, idx, "input")}
                                                  // placeholder={`Nhập ${el.fieldName?.toLowerCase()}`}
                                                  placeholder={`Nhập giá trị`}
                                                />
                                              </div>
                                            ) : (
                                              <div className="select-mapping">
                                                <SelectCustom
                                                  key={item.typeValue}
                                                  id=""
                                                  name=""
                                                  // label="Chọn biểu mẫu"
                                                  options={[]}
                                                  fill={false}
                                                  value={item.value ? { value: item.value, label: item.value } : null}
                                                  special={true}
                                                  required={true}
                                                  onChange={(e) => handChangeValueTypeItem(e, idx, item.typeValue === 1 ? "form" : "var")}
                                                  isAsyncPaginate={true}
                                                  isFormatOptionLabel={false}
                                                  placeholder={item.typeValue === 1 ? "Chọn trường trong form" : "Chọn biến"}
                                                  additional={{
                                                    page: 1,
                                                  }}
                                                  loadOptionsPaginate={item.typeValue === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                />
                                              </div>
                                            )}
                                            <Tippy
                                              content={
                                                item.typeValue === 0
                                                  ? "Chuyển chọn trường trong form"
                                                  : item.typeValue === 1
                                                  ? "Chuyển chọn biến"
                                                  : "Chuyển nhập giá trị"
                                              }
                                            >
                                              <div
                                                className={"icon-change-select"}
                                                onClick={(e) => {
                                                  console.log("da vao step 1");

                                                  setFormData({
                                                    ...formData,
                                                    rule: [...formData.rule].map((el, index) => {
                                                      if (idx === index) {
                                                        return {
                                                          ...el,
                                                          typeValue: item.typeValue === 0 ? 1 : item.typeValue === 1 ? 2 : 0,
                                                          value: "",
                                                        };
                                                      }

                                                      return el;
                                                    }),
                                                  });
                                                }}
                                              >
                                                <Icon name="ResetPassword" style={{ width: 18 }} />
                                              </div>
                                            </Tippy>
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>

                                    <div className="action__add--rule">
                                      <Tippy content="Thêm">
                                        <span
                                          className="icon__add"
                                          onClick={() => {
                                            setFormData({
                                              ...formData,
                                              rule: [
                                                ...formData.rule,
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
                                            });
                                          }}
                                        >
                                          <Icon name="PlusCircleFill" />
                                        </span>
                                      </Tippy>
                                    </div>

                                    {formData.rule.length > 1 ? (
                                      <div className="action__delete--rule">
                                        <Tippy content="Xóa">
                                          <span className="icon__delete" onClick={() => handleDeleteItemField(idx)}>
                                            <Icon name="Trash" />
                                          </span>
                                        </Tippy>
                                      </div>
                                    ) : null}
                                  </div>
                                  {formData.rule.length > 1 && (
                                    <span className="view__logical view__logical--rule">{formData.logical === "and" ? "And" : "Or"}</span>
                                  )}
                                </Fragment>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    {formData.blockRule && formData.blockRule.length > 0 && (
                      <div className="lv__item lv__2">
                        {formData.blockRule.map((item, idx) => {
                          return (
                            <div key={idx} className="box__block--rule">
                              <span className="view__logical">{formData.logical === "and" ? "And" : "Or"}</span>

                              <div className="block__rule">
                                <div className="action__choose--item action__choose--lv2">
                                  <Button
                                    color={item.logical === "and" ? "primary" : "secondary"}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handChangeLogical(idx, "and");
                                    }}
                                    // disabled={disableFieldCommom}
                                  >
                                    AND
                                  </Button>
                                  <Button
                                    color={item.logical === "or" ? "primary" : "secondary"}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handChangeLogical(idx, "or");
                                    }}
                                    // disabled={disableFieldCommom}
                                  >
                                    OR
                                  </Button>
                                  <Button
                                    color="destroy"
                                    className="icon__detete"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handDeleteItemBlock(idx);
                                    }}
                                    // disabled={disableFieldCommom}
                                  >
                                    <Icon name="Trash" />
                                  </Button>
                                </div>

                                <div className="including__conditions__eform">
                                  {/* đoạn này là show lên các trường đã được chọn */}
                                  <div className="lst__field--rule">
                                    {item.rule &&
                                      item.rule.length > 0 &&
                                      item.rule.map((el, index) => {
                                        return (
                                          <Fragment key={index}>
                                            <div className="item__rule">
                                              <div className="lst__info--rule">
                                                <div className="info-item" style={!el.fieldName ? { width: "100%" } : {}}>
                                                  {/* <span className="name-field">{el.fieldName}</span> */}
                                                  <div className={"container-select-mapping"}>
                                                    {!el.typeFieldName ? (
                                                      <div className="input-text">
                                                        <Input
                                                          name={el.fieldName}
                                                          fill={false}
                                                          value={el.fieldName}
                                                          // disabled={disableFieldCommom}
                                                          onChange={(e) => {
                                                            setFormData({
                                                              ...formData,
                                                              blockRule: [...formData.blockRule].map((el, ids) => {
                                                                if (ids === idx) {
                                                                  return {
                                                                    ...el,
                                                                    rule: [...el.rule].map((ol, i) => {
                                                                      if (i === index) {
                                                                        return {
                                                                          ...ol,
                                                                          fieldName: e.target.value,
                                                                        };
                                                                      }
                                                                      return ol;
                                                                    }),
                                                                  };
                                                                }
                                                                return el;
                                                              }),
                                                            });
                                                          }}
                                                          placeholder={`Nhập giá trị`}
                                                        />
                                                      </div>
                                                    ) : (
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
                                                          onChange={(e) => handlePushRuleBlock(e, index, idx)}
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
                                                    )}
                                                    <Tippy
                                                      content={
                                                        el.typeFieldName === 0
                                                          ? "Chuyển chọn trường trong form"
                                                          : el.typeFieldName === 1
                                                          ? "Chuyển chọn biến"
                                                          : "Chuyển nhập giá trị"
                                                      }
                                                    >
                                                      <div
                                                        className={"icon-change-select"}
                                                        onClick={(e) => {
                                                          console.log("da vao");

                                                          setFormData({
                                                            ...formData,
                                                            blockRule: [...formData.blockRule].map((il, ids) => {
                                                              if (ids === idx) {
                                                                return {
                                                                  ...il,
                                                                  rule: [...il.rule].map((ol, i) => {
                                                                    if (i === index) {
                                                                      return {
                                                                        ...ol,
                                                                        typeFieldName: el.typeFieldName === 0 ? 1 : el.typeFieldName === 1 ? 2 : 0,
                                                                        nodeId: "",
                                                                        type: "",
                                                                      };
                                                                    }

                                                                    return ol;
                                                                  }),
                                                                };
                                                              }

                                                              return il;
                                                            }),
                                                          });
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
                                                      options={lstConditionField}
                                                      // disabled={disableFieldCommom}
                                                      onChange={(e) => handleChangeValueBlockCondition(e, index, idx)}
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
                                                            onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "input")}
                                                            // placeholder={`Nhập ${il.fieldName?.toLowerCase()}`}
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
                                                              handChangeValueTypeBlockItem(e, index, idx, el.typeValue === 1 ? "form" : "var")
                                                            }
                                                            isAsyncPaginate={true}
                                                            isFormatOptionLabel={false}
                                                            placeholder={el.typeValue === 1 ? "Chọn trường trong form" : "Chọn biến"}
                                                            additional={{
                                                              page: 1,
                                                            }}
                                                            loadOptionsPaginate={el.typeValue === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                            // formatOptionLabel={formatOptionLabelEmployee}
                                                            // error={checkFieldEform}
                                                            // message="Biểu mẫu không được bỏ trống"
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
                                                            setFormData({
                                                              ...formData,
                                                              blockRule: [...formData.blockRule].map((il, ids) => {
                                                                if (ids === idx) {
                                                                  return {
                                                                    ...il,
                                                                    rule: [...il.rule].map((ol, i) => {
                                                                      if (i === index) {
                                                                        return {
                                                                          ...ol,
                                                                          typeValue: el.typeValue === 0 ? 1 : el.typeValue === 1 ? 2 : 0,
                                                                          value: "",
                                                                        };
                                                                      }

                                                                      return ol;
                                                                    }),
                                                                  };
                                                                }

                                                                return il;
                                                              }),
                                                            });
                                                          }}
                                                        >
                                                          <Icon name="ResetPassword" style={{ width: 18 }} />
                                                        </div>
                                                      </Tippy>
                                                    </div>
                                                    
                                                  </div>
                                                ) : null}
                                              </div>

                                              <div className="action__add--rule">
                                                <Tippy content="Thêm">
                                                  <span
                                                    className="icon__add"
                                                    onClick={() => {
                                                      setFormData({
                                                        ...formData,
                                                        blockRule: [...formData.blockRule].map((el, index) => {
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
                                                      });
                                                    }}
                                                  >
                                                    <Icon name="PlusCircleFill" />
                                                  </span>
                                                </Tippy>
                                              </div>
                                              {item.rule.length > 1 ? (
                                                <div className="action__delete--rule">
                                                  <Tippy content="Xóa">
                                                    <span className="icon__delete" onClick={() => handleDeleteBlockItemField(index, idx)}>
                                                      <Icon name="Trash" />
                                                    </span>
                                                  </Tippy>
                                                </div>
                                              ) : null}
                                            </div>
                                            {item.rule.length > 1 && (
                                              <span className="view__logical view__logical--rule--block">
                                                {item.logical === "and" ? "And" : "Or"}
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
                  </div>
                </div>
              </div>

              {/* <div className="form-group">
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
              </div> */}

              
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
