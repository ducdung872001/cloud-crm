import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IEmailRequest } from "model/email/EmailRequestModel";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import { showToast } from "utils/common";
import { convertParamsToString, createArrayFromTo, createArrayFromToR, isDifferenceObj } from "reborn-util";
import CustomerService from "services/CustomerService";
import "./index.scss";
import moment from "moment";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import Button from "components/button/button";
import Tippy from "@tippyjs/react";
import _ from "lodash";
import ContractEformService from "services/ContractEformService";
import BusinessProcessService from "services/BusinessProcessService";
import BpmEformMappingService from "services/BpmEformMappingService";

export default function ModalSequenceFlow(props: any) {
  const { onShow, onHide, dataNode, processId, setDataNode, disable } = props;
  //console.log("dataNode", dataNode);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [data, setData] = useState(null);
  const [nodeName, setNodeName] = useState(null);

  const [typeAttributeLv1, setTypeAttributeLv1] = useState(1);
  const [typeAttributeLv2, setTypeAttributeLv2] = useState(1);
  const [childProcessId, setChildProcessId] = useState(null);

  useEffect(() => {
    // if (dataNode?.businessObject?.name && onShow) {
    //   setNodeName(dataNode?.businessObject?.name);
    // }
    if (dataNode && onShow) {
      const fromNodeId = dataNode?.businessObject?.sourceRef?.id;
      const toNodeId = dataNode?.businessObject?.targetRef?.id;
      getDetailLink(fromNodeId, toNodeId);
    }
  }, [dataNode, onShow]);

  const getDetailLink = async (fromNodeId, toNodeId) => {
    const params = {
      fromNodeId: fromNodeId,
      toNodeId: toNodeId,
    };
    const response = await BusinessProcessService.bpmGetLinkNode(params);

    if (response.code == 0) {
      const result = response.result;
      const config = result.config && JSON.parse(result.config);
      setNodeName(result?.name);
      setChildProcessId(result?.processId);
      if (config) {
        setData(config);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
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

  const defaultCondition = {
    logical: "and",
    rule: [],
  };

  const capitalizeFirstLetter = (str) => {
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
  };

  const [isShowField, setIsShowField] = useState<boolean>(false);

  const [idxFieldBlock, setIdxFieldBlock] = useState<number>(null);
  const [isShowFieldBlock, setIsShowFieldBlock] = useState<boolean>(false);

  const [idxFieldChildrenBlock, setIdxFieldChildrenBlock] = useState<number>(null);
  const [isShowFieldChildrenBlock, setIsShowFieldChildrenBlock] = useState<boolean>(false);

  const refOptionField = useRef();
  const refOptionFieldContainer = useRef();

  const refBlockOptionField = useRef();
  const refBlockOptionFieldContainer = useRef();

  const refChildrenBlockOptionField = useRef();
  const refChildrenBlockOptionFieldContainer = useRef();

  useOnClickOutside(refOptionField, () => setIsShowField(false), ["lst__option--group"]);

  useOnClickOutside(refBlockOptionField, () => setIsShowFieldBlock(false), ["lst__option--group"]);

  useOnClickOutside(refChildrenBlockOptionField, () => setIsShowFieldChildrenBlock(false), ["lst__option--group"]);

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
            setIsLoadingSource(true);

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

            setIsLoadingSource(false);

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

  const values = useMemo(
    () =>
      ({
        logical: data ? data.logical : "and",
        // listEformAttribute: data?.listEformAttribute || null,
        rule: data
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
        blockRule: data ? data.blockRule : [],
      } as any),
    [data, onShow]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  //Biểu mẫu
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
                  value: `frm_${item.code}.${el.type}`,
                  label: `frm_${item.code}.${el.type}`,
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
  const handlePushRule = (data, idx) => {
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
    setIsShowField(false);
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

  const handleChangeValueDay = (e, idx) => {
    const dayValue = e.value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      rule: prevFormData.rule.map((el, index) => {
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
    }));
  };

  const handleChangeValueMonth = (e, idx) => {
    const monthValue = e.value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      rule: prevFormData.rule.map((el, index) => {
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
    }));
  };

  const handleChangeValueYear = (e, idx) => {
    const yearValue = e.value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      rule: prevFormData.rule.map((el, index) => {
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
    }));
  };

  const [isLoadingSource, setIsLoadingSource] = useState<boolean>(false);

  const onSelectOpenApi = async (source, idx, param?: any) => {
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

      setFormData({
        ...formData,
        rule: [...formData.rule].map((el, index) => {
          if (idx === index) {
            return {
              ...el,
              options: changeDataResult,
            };
          }

          return el;
        }),
      });
    }

    setIsLoadingSource(false);
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

  const handAddItemBlock = (idx) => {
    setFormData({
      ...formData,
      blockRule: [...formData.blockRule].map((el, index) => {
        if (index === idx) {
          return {
            ...el,
            blockRule: [...el.blockRule, defaultBlockRule],
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

    // const changeData = {
    //   fieldName: data?.label,
    //   nodeId: data?.nodeId,
    //   operator: "eq",
    //   value: "",
    //   type: data.datatype
    // };

    // setFormData({
    //   ...formData,
    //   blockRule: [...formData.blockRule].map((el, index) => {
    //     if (index === idx) {
    //       return {
    //         ...el,
    //         rule: [...el.rule, ...([changeData])],
    //       };
    //     }

    //     return el;
    //   }),
    // });

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
    setIsShowFieldBlock(false);
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

  const handleChangeValueBlockDay = (e, ids, idx) => {
    const dayValue = e.value;

    setFormData({
      ...formData,
      blockRule: [...formData.blockRule].map((el, index) => {
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
    });
  };

  const handleChangeValueBlockMonth = (e, ids, idx) => {
    const monthValue = e.value;

    setFormData({
      ...formData,
      blockRule: [...formData.blockRule].map((el, index) => {
        if (index === idx) {
          return {
            ...el,
            rule: [...el.rule].map((ol, i) => {
              if (i === ids) {
                const currentValues = ol.value.split("/");
                const newValue = `${currentValues[0] || "null"}/${monthValue !== "" ? monthValue : currentValues[1]}/${currentValues[2] || "null"}`;
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
    });
  };

  const handleChangeValueBlockYear = (e, ids, idx) => {
    const yearValue = e.value;

    setFormData({
      ...formData,
      blockRule: [...formData.blockRule].map((el, index) => {
        if (index === idx) {
          return {
            ...el,
            rule: [...el.rule].map((ol, i) => {
              if (i === ids) {
                const currentValues = ol.value.split("/");
                const newValue = `${currentValues[0] || "null"}/${currentValues[1] || "null"}/${yearValue !== "" ? yearValue : currentValues[2]}`;
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

  const onSelectOpenBlockApi = async (source, ids, idx, param?: any) => {
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
                    options: changeDataResult,
                  };
                }

                return ol;
              }),
            };
          }

          return el;
        }),
      });
    }

    setIsLoadingSource(false);
  };

  //! Đoạn này xử lý lv-3
  const handChangeChildrenLogical = (ids, idx, type) => {
    setFormData({
      ...formData,
      blockRule: [...formData.blockRule].map((prev, index) => {
        if (index === idx) {
          return {
            ...prev,
            blockRule: prev.blockRule.map((el, i) => {
              if (i === ids) {
                return {
                  ...el,
                  logical: type,
                };
              }

              return el;
            }),
          };
        }

        return prev;
      }),
    });
  };

  const handDeleteChildrenItemBlock = (ids, idx) => {
    const groupBlockFilter = formData.blockRule[idx];
    const updatedBlockFilter = groupBlockFilter.blockRule.filter((field, i) => i !== ids);

    setFormData({
      ...formData,
      blockRule: formData.blockRule.map((prev, j) => {
        if (j === idx) {
          return {
            ...prev,
            blockRule: updatedBlockFilter,
          };
        }

        return prev;
      }),
    });
  };

  const handlePushRuleChildrenBlock = (data, ids, idx, lstData) => {
    if (!data) return;

    let mergeData = [];

    const changeData = {
      ...data,
      operator: "eq",
      value: "",
    };

    setFormData({
      ...formData,
      blockRule: [...formData.blockRule].map((prev, index) => {
        if (index === idx) {
          return {
            ...prev,
            blockRule: prev.blockRule.map((el, i) => {
              if (i === ids) {
                return {
                  ...el,
                  rule: [...el.rule, ...(mergeData.length > 0 ? mergeData : [changeData])],
                };
              }

              return el;
            }),
          };
        }

        return prev;
      }),
    });

    setIsShowFieldChildrenBlock(false);
  };

  const handleChangeValueChildrenBlockCondition = (e, index, ids, idx) => {
    const value = e.value;

    setFormData({
      ...formData,
      blockRule: formData.blockRule.map((prev, i) => {
        if (i === idx) {
          return {
            ...prev,
            blockRule: prev.blockRule.map((el, i) => {
              if (i === ids) {
                return {
                  ...el,
                  rule: el.rule.map((ol, j) => {
                    if (j === index) {
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

        return prev;
      }),
    });
  };

  const handChangeValueChildrenTypeBlockItem = (e, index, ids, idx, type) => {
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
      blockRule: formData.blockRule.map((prev, i) => {
        if (i === idx) {
          return {
            ...prev,
            blockRule: prev.blockRule.map((el, i) => {
              if (i === ids) {
                return {
                  ...el,
                  rule: el.rule.map((ol, j) => {
                    if (j === index) {
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

        return prev;
      }),
    });
  };

  const handleDeleteChildrenBlockItemField = (index, ids, idx) => {
    const groupRuleFilter = formData.blockRule[idx];
    const blockRuleFilter = groupRuleFilter.blockRule[ids];

    const updatedRuleFilter = blockRuleFilter.rule.filter((field, i) => i !== index);

    // Kiểm tra và xóa liên quan
    const deletedField = blockRuleFilter.rule[ids].fieldName;
    if (deletedField === "city_id") {
      // Nếu xóa "city_id", thì clear giá trị "district_id" và "subdistrict_id"
      updatedRuleFilter.forEach((item) => {
        if (item.fieldName === "district_id" || item.fieldName === "subdistrict_id") {
          item.value = "";
        }
      });
    } else if (deletedField === "district_id") {
      // Nếu xóa "district_id", thì clear giá trị "subdistrict_id"
      updatedRuleFilter.forEach((item) => {
        if (item.fieldName === "subdistrict_id") {
          item.value = "";
        }
      });
    }

    setFormData({
      ...formData,
      blockRule: formData.blockRule.map((prev, i) => {
        if (i === idx) {
          return {
            ...prev,
            blockRule: prev.blockRule.map((el, i) => {
              if (i === ids) {
                return {
                  ...el,
                  rule: updatedRuleFilter,
                };
              }

              return el;
            }),
          };
        }

        return prev;
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

  // Thực hiện gửi email
  const onSubmit = async (formData) => {
    // e.preventDefault();

    // setIsSubmit(true);
    const configDataNew = {
      rule: formData.rule,
      logical: formData.logical,
      blockRule: formData.blockRule,
    };

    const fromNodeId = dataNode?.businessObject?.sourceRef?.id;
    const toNodeId = dataNode?.businessObject?.targetRef?.id;

    const body = {
      // id: '',
      fromNodeId: fromNodeId,
      toNodeId: toNodeId,
      config: JSON.stringify(configDataNew),
      flowType: "condition",
    };
    const response = await BusinessProcessService.bpmAddLinkNodeConfig(body);

    if (response.code === 0) {
      showToast(`Cập nhật điều kiện thành công`, "success");
      handleClearForm(true);
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
              handleClearForm(false);
              // !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          ...(disable
            ? []
            : ([
                {
                  title: "Xác nhận",
                  // type: "submit",
                  color: "primary",
                  disabled: isSubmit,
                  is_loading: isSubmit,
                  callback: () => {
                    onSubmit(formData);
                  },
                },
              ] as any)),
        ],
      },
    }),
    [isSubmit, nodeName, dataNode, formData, disable]
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

  const [editName, setEditName] = useState(true);
  const handleClearForm = (acc) => {
    onHide(acc);
    setData(null);
    setTypeAttributeLv1(1);
    setTypeAttributeLv2(1);
    setNodeName(null);
  };

  const changeNodeName = async () => {
    const configDataNew = {
      rule: formData.rule,
      dataEform: formData.dataEform,
      logical: formData.logical,
      blockRule: formData.blockRule,
    };

    if (!nodeName) {
      showToast("Vui lòng nhập tên điều kiện", "error");
      return;
    }
    const body: any = {
      linkId: dataNode?.id,
      name: nodeName,
    };

    const response = await BusinessProcessService.bpmAddNameLinkNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật tên thành công`, "success");
      // onHide("not_close");
      setEditName(true);
      //   setDataNode({ ...dataNode, name: nodeName });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-sequence-flow"
        size="xl"
      >
        <form className="form-sequence-flow">
          {/* <ModalHeader title={`Điều kiện Email`} toggle={() => !isSubmit && onHide(false)} /> */}
          {/* <ModalHeader
            title={dataNode?.name}
            toggle={() => !isSubmit && handleClearForm()}
            // custom={true}
          /> */}
          <div className="container-header">
            {editName ? (
              <div className="box-title">
                <h4>{nodeName || ""}</h4>
                {disable ? null : (
                  <Tippy content="Đổi tên điều kiện">
                    <div
                      onClick={() => {
                        //edit name ngược true và false
                        setEditName(false);
                      }}
                    >
                      <Icon name="Pencil" style={{ width: 18, height: 18, fill: "#015aa4", cursor: "pointer", marginBottom: 3 }} />
                    </div>
                  </Tippy>
                )}
              </div>
            ) : (
              <div className="edit-name">
                <div style={{ flex: 1 }}>
                  <Input
                    name="search_field"
                    value={nodeName}
                    fill={true}
                    iconPosition="right"
                    icon={<Icon name="Times" />}
                    // onBlur={() => {
                    //   setEditName(false);
                    //   setNodeName(dataNode?.name)
                    // }}
                    iconClickEvent={() => {
                      //edit name ngược true và false
                      setEditName(true);
                      setNodeName(dataNode?.name);
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNodeName(value);
                    }}
                    placeholder="Nhập tên điều kiện"
                  />
                </div>
                <div
                  className={_.isEqual(nodeName, dataNode?.name) || !nodeName ? "button-save-inactive" : "button-save-active"}
                  onClick={() => {
                    if (!_.isEqual(nodeName, dataNode?.name)) {
                      changeNodeName();
                    }
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: "500" }}>Lưu</span>
                </div>
              </div>
            )}
            <Button onClick={() => !isSubmit && handleClearForm(false)} type="button" className="btn-close" color="transparent" onlyIcon={true}>
              <Icon name="Times" />
            </Button>
          </div>

          <ModalBody>
            <div className="container-sequence-flow">
              <div className="condition-customer-segment">
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
                                  onChange={(e) => handlePushRule(e, formData.rule)}
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
                          {formData.rule &&
                            formData.rule.length > 0 &&
                            formData.rule.map((item, idx) => {
                              return (
                                <Fragment key={idx}>
                                  <div className="item__rule">
                                    <div className="lst__info--rule">
                                      <div className="info-item" style={!item.fieldName ? { width: "100%" } : {}}>
                                        {/* <span className="name-field">{capitalizeFirstLetter(item.name)}</span> */}
                                        {/* <span className="name-field">{(item.fieldName)}</span> */}
                                        <div className={"container-select-mapping"}>
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
                                          <Tippy content={item.typeFieldName === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}>
                                            <div
                                              className={"icon-change-select"}
                                              onClick={(e) => {
                                                setFormData({
                                                  ...formData,
                                                  rule: [...formData.rule].map((el, index) => {
                                                    if (idx === index) {
                                                      return {
                                                        ...el,
                                                        typeFieldName: item.typeFieldName === 1 ? 2 : 1,
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
                                        <div className="info-item-caculate">
                                          <SelectCustom
                                            name="condition"
                                            fill={true}
                                            value={item.operator}
                                            options={
                                              item.fieldName === "name"
                                                ? lstConditionFieldSpecialText
                                                : item.type === "text" && item.fieldName === "email"
                                                ? [...lstConditionFieldText, { value: "ne", label: "Not_Equal" }]
                                                : item.type === "text" || item.type === "textfield"
                                                ? lstConditionFieldText
                                                : item.fieldName === "height" || item.fieldName === "weight"
                                                ? lstConditionFieldSpecialNumber
                                                : item.type === "number" || item.type === "int"
                                                ? lstConditionFieldNumber
                                                : item.type === "date"
                                                ? lstConditionFieldDate
                                                : lstConditionFieldSelect
                                            }
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
                                                  name={item.fieldName}
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

                                          {/* {item.type === "text" || item.type === "textfield" || item.type === "select" || item.type === "dropdown" ? (
                                            <Input
                                              name={item.fieldName}
                                              fill={true}
                                              value={item.value}
                                              // disabled={disableFieldCommom}
                                              onChange={(e) => handChangeValueTypeItem(e, idx, "input")}
                                              placeholder={`Nhập ${item.fieldName?.toLowerCase()}`}
                                            />
                                            ) : item.type === "number" || item.type === "int" ? (
                                              <NummericInput
                                                name={item.fieldName}
                                                fill={true}
                                                value={item.value}
                                                thousandSeparator={true}
                                                // disabled={disableFieldCommom}
                                                onValueChange={(e) => handChangeValueTypeItem(e, idx, "number")}
                                                placeholder={`Nhập ${item.fieldName?.toLowerCase()}`}
                                              />
                                            ) : item.type === "date" || item.type === "datetime" ? (
                                              <DatePickerCustom
                                                name={item.fieldName}
                                                fill={true}
                                                value={item.value}
                                                iconPosition="left"
                                                // disabled={disableFieldCommom}
                                                icon={<Icon name="Calendar" />}
                                                onChange={(e) => handChangeValueTypeItem(e, idx, "date")}
                                                placeholder={`Chọn ${item.fieldName?.toLowerCase()}`}
                                              />
                                            ) : item.type === "select" || item.type === "dropdown"  ? (
                                              <SelectCustom
                                                name={item.fieldName}
                                                fill={true}
                                                options={item.options || []}
                                                value={+item.value}
                                                onChange={(e) => handChangeValueTypeItem(e, idx, "select")}
                                                disabled={
                                                  (item.fieldName === "district_id" &&
                                                    !formData.rule.some((el) => el.fieldName === "city_id" && el.value !== "")) ||
                                                  (item.fieldName === "subdistrict_id" &&
                                                    (!formData.rule.some((el) => el.fieldName === "city_id" && el.value !== "") ||
                                                      !formData.rule.some((el) => el.fieldName === "district_id" && el.value !== "")))
                                                }
                                                onMenuOpen={() =>
                                                  onSelectOpenApi(
                                                    item.source,
                                                    idx,
                                                    item.fieldName == "city_id"
                                                      ? 0
                                                      : item.fieldName == "district_id"
                                                      ? formData.rule.find((el) => el.fieldName == "city_id").value
                                                      : item.fieldName == "subdistrict_id"
                                                      ? formData.rule.find((el) => el.fieldName == "district_id").value
                                                      : ""
                                                  )
                                                }
                                                isLoading={isLoadingSource}
                                                placeholder={`Chọn ${item.fieldName?.toLowerCase()}`}
                                              />
                                            ) : (
                                              <div className="field__special">
                                                <SelectCustom
                                                  placeholder="Chọn ngày"
                                                  name="foundingDay"
                                                  fill={true}
                                                  value={+item.value.split("/")[0]}
                                                  // disabled={disableFieldCommom}
                                                  options={days}
                                                  onChange={(e) => handleChangeValueDay(e, idx)}
                                                  className="founded__day"
                                                />

                                                <SelectCustom
                                                  placeholder="Chọn tháng"
                                                  name="foundingMonth"
                                                  fill={true}
                                                  value={+item.value.split("/")[1]}
                                                  // disabled={disableFieldCommom}
                                                  options={months}
                                                  onChange={(e) => handleChangeValueMonth(e, idx)}
                                                  className="founded_month"
                                                />

                                                <SelectCustom
                                                  placeholder="Chọn năm"
                                                  name="foundingYear"
                                                  fill={true}
                                                  value={+item.value.split("/")[2]}
                                                  // disabled={disableFieldCommom}
                                                  options={years}
                                                  onChange={(e) => handleChangeValueYear(e, idx)}
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
                                      handDeleteItemBlock(idx);
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
                                          onChange={(e) => handlePushRuleBlock(e, idx, item.rule)}
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
                                                    <Tippy content={el.typeFieldName === 2 ? "Chuyển chọn trường trong form" : "Chuyển chọn biến"}>
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
                                                                        typeFieldName: el.typeFieldName === 1 ? 2 : 1,
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
                                                      >
                                                        <Icon name="ResetPassword" style={{ width: 18 }} />
                                                      </div>
                                                    </Tippy>
                                                  </div>
                                                </div>

                                                {el.fieldName ? (
                                                  <div className="info-item-caculate">
                                                    <SelectCustom
                                                      name="condition"
                                                      fill={true}
                                                      value={el.operator}
                                                      options={
                                                        el.fieldName === "name"
                                                          ? lstConditionFieldSpecialText
                                                          : el.type === "text" && el.fieldName === "email"
                                                          ? [...lstConditionFieldText, { value: "ne", label: "Not_Equal" }]
                                                          : el.type === "text" || item.type === "textfield"
                                                          ? lstConditionFieldText
                                                          : el.fieldName === "height" || el.fieldName === "weight"
                                                          ? lstConditionFieldSpecialNumber
                                                          : el.type === "number"
                                                          ? lstConditionFieldNumber
                                                          : el.type === "date"
                                                          ? lstConditionFieldDate
                                                          : lstConditionFieldSelect
                                                      }
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

                                                                return el;
                                                              }),
                                                            });
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
                                                        onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "input")}
                                                        placeholder={`Nhập ${el.fieldName?.toLowerCase()}`}
                                                      />
                                                    ) : el.type === "number" || el.type === "int" ? (
                                                      <NummericInput
                                                        name={el.fieldName}
                                                        fill={true}
                                                        value={el.value}
                                                        thousandSeparator={true}
                                                        // disabled={disableFieldCommom}
                                                        onValueChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "number")}
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
                                                        onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "date")}
                                                        placeholder={`Chọn ${el.fieldName?.toLowerCase()}`}
                                                      />
                                                    )  : el.type === "select" || el.type === "dropdown" ? (
                                                      <SelectCustom
                                                        name={el.fieldName}
                                                        fill={true}
                                                        options={el.options || []}
                                                        value={+el.value}
                                                        isLoading={isLoadingSource}
                                                        onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "select")}
                                                        onMenuOpen={() =>
                                                          onSelectOpenBlockApi(
                                                            el.source,
                                                            index,
                                                            idx,
                                                            el.fieldName == "city_id"
                                                              ? 0
                                                              : el.fieldName == "district_id"
                                                              ? item.rule.find((el) => el.fieldName == "city_id").value
                                                              : el.fieldName == "subdistrict_id"
                                                              ? item.rule.find((el) => el.fieldName == "district_id").value
                                                              : ""
                                                          )
                                                        }
                                                        placeholder={`Chọn ${el.fieldName?.toLowerCase()}`}
                                                        disabled={
                                                          (el.fieldName === "district_id" &&
                                                            !item.rule.some((il) => il.fieldName === "city_id" && il.value !== "")) ||
                                                          (el.fieldName === "subdistrict_id" &&
                                                            (!item.rule.some((il) => il.fieldName === "city_id" && il.value !== "") ||
                                                              !item.rule.some((il) => il.fieldName === "district_id" && il.value !== "")))
                                                        }
                                                      />
                                                    ) : (
                                                      <div className="field__special">
                                                        <SelectCustom
                                                          placeholder="Chọn ngày"
                                                          name="foundingDay"
                                                          fill={true}
                                                          value={+el.value.split("/")[0]}
                                                          options={days}
                                                          // disabled={disableFieldCommom}
                                                          onChange={(e) => handleChangeValueBlockDay(e, index, idx)}
                                                          className="founded__day"
                                                        />

                                                        <SelectCustom
                                                          placeholder="Chọn tháng"
                                                          name="foundingMonth"
                                                          fill={true}
                                                          value={+el.value.split("/")[1]}
                                                          options={months}
                                                          // disabled={disableFieldCommom}
                                                          onChange={(e) => handleChangeValueBlockMonth(e, index, idx)}
                                                          className="founded_month"
                                                        />

                                                        <SelectCustom
                                                          placeholder="Chọn năm"
                                                          name="foundingYear"
                                                          fill={true}
                                                          value={+el.value.split("/")[2]}
                                                          options={years}
                                                          // disabled={disableFieldCommom}
                                                          onChange={(e) => handleChangeValueBlockYear(e, index, idx)}
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
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
