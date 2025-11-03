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
import CampaignService from "services/CampaignService";
import MarketingAutomationService from "services/MarketingAutomationService";
import _ from "lodash";

export default function ConfigSMS(props: any) {
  const { onShow, onHide, dataNode, setDataNode, statusMA } = props;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [data, setData] = useState(null);
  const [nodeName, setNodeName] = useState(null);
  const [nodePoint, setNodePoint] = useState(null);
  useEffect(() => {
    if (dataNode?.name) {
      setNodeName(dataNode.name);
    }

    if (dataNode?.point) {
      setNodePoint(dataNode.point);
    }
  }, [dataNode]);
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
    rule: [],
    blockRule: [],
  };

  const defaultCondition = {
    logical: "and",
    rule: [],
  };

  const capitalizeFirstLetter = (str) => {
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
  };

  const [lstFieldFilter, setLstFieldFilter] = useState([]);

  const handGetCustomerAttributes = async () => {
    const response = await CustomerService.customerAttributes();

    if (response.code === 0) {
      const result = response.result.items;
      const changeDataResult = result.map((item) => {
        return {
          name: capitalizeFirstLetter(item.title),
          fieldName: item.name,
          type: item.name === "birthday" ? "" : item.source ? "select" : item.type === "string" ? "text" : item.type,
          dataType: item.name === "birthday" ? "" : item.type,
          options:
            item.source === "data"
              ? [...item.data].map((el) => {
                  return {
                    value: el.id,
                    label: el.name,
                  };
                })
              : [],
          source: item.source === "api" ? item.path : "",
        };
      });

      setLstFieldFilter([...lstFieldFilter, ...changeDataResult]);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (onShow) {
      handGetCustomerAttributes();
    }
  }, [onShow]);

  useEffect(() => {
    if (dataNode?.configData && onShow) {
      const configData = dataNode.configData;
      // if(configData?.action){
      setData({
        action: configData?.action?.rule || [],
        conditionContact: configData?.action?.blockRule || [],
        logicalCondition: configData?.action?.logical || "and",
        rule: configData?.customer?.rule || [],
        blockRule: configData?.customer?.blockRule || [],
        logical: configData?.customer?.logical || "and",
      });
      // }
    } else {
      setData(null);
    }
  }, [dataNode, onShow]);

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

  const [changeDataProps, setChangeDataProps] = useState(null);

  useEffect(() => {
    if (!onShow) {
      setChangeDataProps(null);
    }
  }, [onShow]);

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

  useEffect(() => {
    const transformData = async () => {
      if (data && onShow) {
        const transformedSegment = await transformSegment(data, lstFieldFilter);
        setChangeDataProps(transformedSegment);
      }
    };

    transformData();
  }, [data, onShow, lstFieldFilter]);

  const values = useMemo(
    () =>
      ({
        logicalCondition: data ? data.logicalCondition : "and",
        conditionContact: data ? data.conditionContact : [],
        action: data ? data.action : [],
        logical: data ? data.logical : "and",
        rule: data ? data.rule : [],
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
  const handlePushRule = (data, lstData) => {
    if (!data) return;

    let mergeData = [];

    const changeData = {
      ...data,
      operator: "eq",
      value: "",
    };

    if (data.fieldName === "district_id") {
      const fill = lstFieldFilter
        .filter((item) => item.fieldName === "city_id")
        .map((el) => {
          return {
            ...el,
            operator: "eq",
            value: "",
          };
        });
      if (lstData.some((item) => item.fieldName === "city_id")) {
        mergeData.push(changeData);
      } else {
        mergeData.push(...fill, changeData);
      }
    } else if (data.fieldName === "subdistrict_id") {
      const filterField = lstData.some((item) => item.fieldName === "city_id") ? { fieldName: "district_id" } : { fieldName: "city_id" };

      const filter = lstFieldFilter
        .filter((item) => item.fieldName === filterField.fieldName || item.fieldName === "district_id")
        .map((el) => ({
          ...el,
          operator: "eq",
          value: "",
        }));

      if (lstData.some((item) => item.fieldName === "district_id" || item.fieldName === "subdistrict_id")) {
        mergeData.push(changeData);
      } else {
        mergeData.push(...filter, changeData);
      }
    } else {
      mergeData = [];
    }

    setFormData({ ...formData, rule: [...formData.rule, ...(mergeData.length > 0 ? mergeData : [changeData])] });
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
    } else if (type === "number") {
      value = e.floatValue;
    } else if (type === "date") {
      value = e;
    } else {
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

  const handlePushRuleBlock = (data, idx, lstData) => {
    if (!data) return;

    let mergeData = [];

    const changeData = {
      ...data,
      operator: "eq",
      value: "",
    };

    if (data.fieldName === "district_id") {
      const fill = lstFieldFilter
        .filter((item) => item.fieldName === "city_id")
        .map((el) => {
          return {
            ...el,
            operator: "eq",
            value: "",
          };
        });
      if (lstData.some((item) => item.fieldName === "city_id")) {
        mergeData.push(changeData);
      } else {
        mergeData.push(...fill, changeData);
      }
    } else if (data.fieldName === "subdistrict_id") {
      const filterField = lstData.some((item) => item.fieldName === "city_id") ? { fieldName: "district_id" } : { fieldName: "city_id" };

      const filter = lstFieldFilter
        .filter((item) => item.fieldName === filterField.fieldName || item.fieldName === "district_id")
        .map((el) => ({
          ...el,
          operator: "eq",
          value: "",
        }));

      if (lstData.some((item) => item.fieldName === "district_id" || item.fieldName === "subdistrict_id")) {
        mergeData.push(changeData);
      } else {
        mergeData.push(...filter, changeData);
      }
    } else {
      mergeData = [];
    }

    setFormData({
      ...formData,
      blockRule: [...formData.blockRule].map((el, index) => {
        if (index === idx) {
          return {
            ...el,
            rule: [...el.rule, ...(mergeData.length > 0 ? mergeData : [changeData])],
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

    if (data.fieldName === "district_id") {
      const fill = lstFieldFilter
        .filter((item) => item.fieldName === "city_id")
        .map((el) => {
          return {
            ...el,
            operator: "eq",
            value: "",
          };
        });
      if (lstData.some((item) => item.fieldName === "city_id")) {
        mergeData.push(changeData);
      } else {
        mergeData.push(...fill, changeData);
      }
    } else if (data.fieldName === "subdistrict_id") {
      const filterField = lstData.some((item) => item.fieldName === "city_id") ? { fieldName: "district_id" } : { fieldName: "city_id" };

      const filter = lstFieldFilter
        .filter((item) => item.fieldName === filterField.fieldName || item.fieldName === "district_id")
        .map((el) => ({
          ...el,
          operator: "eq",
          value: "",
        }));

      if (lstData.some((item) => item.fieldName === "district_id" || item.fieldName === "subdistrict_id")) {
        mergeData.push(changeData);
      } else {
        mergeData.push(...filter, changeData);
      }
    } else {
      mergeData = [];
    }

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

  const handleChangeValueChildrenBlockDay = (e, index, ids, idx) => {
    const dayValue = e.value;

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

        return prev;
      }),
    });
  };

  const handleChangeValueChildrenBlockMonth = (e, index, ids, idx) => {
    const monthValue = e.value;

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

        return prev;
      }),
    });
  };

  const handleChangeValueChildrenBlockYear = (e, index, ids, idx) => {
    const yearValue = e.value;

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

        return prev;
      }),
    });
  };

  const onSelectOpenChildrenBlockApi = async (source, index, ids, idx, param?: any) => {
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

          return prev;
        }),
      });
    }

    setIsLoadingSource(false);
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
      action: {
        rule: formData.action,
        logical: formData.logicalCondition,
        blockRule: formData.conditionContact,
      },
      customer: {
        rule: formData.rule,
        logical: formData.logical,
        blockRule: formData.blockRule,
      },
    };

    const body: IEmailRequest = {
      ...dataNode,
      ...(!_.isEqual(nodeName, dataNode?.name) ? { name: nodeName } : {}),
      configData: configDataNew,
      point: nodePoint,
    };

    console.log("body", body);

    const response = await MarketingAutomationService.addNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật điều kiện SMS thành công`, "success");
      onHide(true);
      setEditName(true);
      setNodePoint(null);
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
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              handleClearForm();
              // !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Xác nhận",
            // type: "submit",
            color: "primary",
            disabled: isSubmit || !nodeName || statusMA === 1,
            is_loading: isSubmit,
            callback: () => {
              if (_.isEqual(nodeName, dataNode?.name)) {
                onSubmit(formData);
              } else {
                onHide(true);
                setEditName(true);
                setTimeout(() => {
                  setNodePoint(null);
                }, 1000);
              }
            },
          },
        ],
      },
    }),
    [isSubmit, nodeName, dataNode, formData, nodePoint, statusMA]
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

  const [listActionEmail, setListActionEmail] = useState([]);

  const loadedOptionEmailAction = async (search, loadedOptions, { page }) => {
    const param: any = {
      type: "sms",
    };
    const response = await CampaignService.listActionScore(param);
    if (response.code === 0) {
      const dataOption = response.result;
      setListActionEmail(dataOption);

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  code: item.code,
                  actionLevels: item.actionLevels,
                };
              })
            : []),
        ],
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const [editName, setEditName] = useState(true);
  const handleClearForm = () => {
    onHide(false);
    setEditName(true);
    setNodeName(null);
    setNodePoint(null);
  };

  const changeNodeName = async () => {
    const configDataNew = {
      action: {
        rule: formData.action,
        logical: formData.logicalCondition,
        blockRule: formData.conditionContact,
      },
      customer: {
        rule: formData.rule,
        logical: formData.logical,
        blockRule: formData.blockRule,
      },
    };

    if (!nodeName) {
      showToast("Vui lòng nhập tên điều kiện", "error");
      return;
    }
    const body: IEmailRequest = {
      ...dataNode,
      name: nodeName,
      configData: configDataNew,
      point: nodePoint,
    };

    const response = await MarketingAutomationService.addNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật điều kiện thành công`, "success");
      onHide("not_close");
      setEditName(true);
      setDataNode({ ...dataNode, name: nodeName });
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
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-condition-sms"
        size="lg"
      >
        <form className="form-condition-sms">
          <ModalHeader title={dataNode?.name} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
            <div className="container-condition-sms">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="container-name">
                  <div className="box-name">
                    <span className="name-group">Tên điều kiện</span>
                    <Tippy content="Đổi tên điều kiện">
                      <div
                        onClick={() => {
                          if (statusMA !== 1) {
                            setEditName(false);
                          }
                        }}
                      >
                        <Icon
                          name="Pencil"
                          style={{
                            width: 18,
                            height: 18,
                            fill: statusMA === 1 ? "var(--extra-color-20)" : "#015aa4",
                            cursor: "pointer",
                            marginBottom: 3,
                          }}
                        />
                      </div>
                    </Tippy>
                  </div>

                  <div className="edit-name">
                    <div style={{ flex: 1 }}>
                      <Input
                        name="search_field"
                        value={nodeName}
                        fill={true}
                        iconPosition="right"
                        disabled={editName}
                        onBlur={() => {
                          if (!_.isEqual(nodeName, dataNode?.name)) {
                            changeNodeName();
                          } else {
                            setEditName(true);
                          }
                        }}
                        // icon={<Icon name="Times" />}
                        // iconClickEvent={() => {
                        //   setEditName(false);
                        //   setNodeName(dataNode?.name)
                        // }}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNodeName(value);
                        }}
                        placeholder="Nhập tên điều kiện"
                      />
                    </div>
                  </div>
                </div>

                <div className="container-point">
                  <div className="box-name">
                    <span className="name-group">Điểm điều kiện</span>
                  </div>

                  <div className="edit-point">
                    <div style={{ flex: 1 }}>
                      <NummericInput
                        name="point_field"
                        value={nodePoint}
                        fill={true}
                        // onBlur={() => {
                        //   if(!_.isEqual(nodeName, dataNode?.name)){
                        //     changeNodeName()
                        //   } else {
                        //     setEditName(true);
                        //   }
                        // }}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNodePoint(value);
                        }}
                        placeholder="Nhập điểm điều kiện"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="condition-contact">
                <span className="name-group">Điều kiện tương tác</span>
                <div className="desc-condition">
                  <div className="action__choose--item">
                    <Button
                      color={formData.logicalCondition === "and" ? "primary" : "secondary"}
                      onClick={(e) => {
                        e.preventDefault();
                        setFormData({ ...formData, logicalCondition: "and" });
                      }}
                      // disabled={disableFieldCommom}
                    >
                      AND
                    </Button>
                    <Button
                      color={formData.logicalCondition === "or" ? "primary" : "secondary"}
                      onClick={(e) => {
                        e.preventDefault();
                        setFormData({ ...formData, logicalCondition: "or" });
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
                        setFormData({ ...formData, conditionContact: [...formData.conditionContact, defaultCondition] });
                      }}
                      // disabled={disableFieldCommom}
                    >
                      <Icon name="PlusCircleFill" />
                    </Button>
                  </div>

                  <div>
                    <div className="box-condition">
                      <div className="setting">
                        <div style={{ width: "95%" }}>
                          <SelectCustom
                            id=""
                            name=""
                            label="Hành động"
                            options={[]}
                            fill={true}
                            special={true}
                            value={formData.action[0]}
                            required={false}
                            onChange={(e) => {
                              const newData = {
                                id: e.value,
                                type: "email",
                                name: e.label,
                                code: e.code,
                                actionLevels:
                                  e.actionLevels?.map((el) => {
                                    return { value: el.id, label: el.name };
                                  }) || [],
                                actionLevelId: null,
                                value: e.value,
                                label: e.label,
                              };
                              setFormData({ ...formData, action: [newData] });
                            }}
                            isAsyncPaginate={true}
                            isFormatOptionLabel={true}
                            placeholder="Chọn hành động"
                            loadOptionsPaginate={loadedOptionEmailAction}
                            additional={{
                              page: 1,
                            }}
                          />
                        </div>

                        {/* <div style={{width: '46%'}}>
                                                <SelectCustom
                                                    id=""
                                                    name=""
                                                    label="Thời gian"
                                                    options={formData.action[0]?.actionLevels?.length > 0  ? formData.action[0]?.actionLevels : [] }
                                                    fill={true}
                                                    special={true}
                                                    value={formData.action[0]?.time}
                                                    required={false}
                                                    onChange={(e) => {
                                                        // setFormData({ ...formData, action: {...formData.action, time: e}});

                                                        setFormData({
                                                          ...formData,
                                                          action: [...formData.action].map((el, idx) => {
                                                            if (idx === 0) {
                                                              return {
                                                                ...el,
                                                                time: e,
                                                                actionLevelId: e.value
                                                              };
                                                            }
                                                    
                                                            return el;
                                                          }),
                                                        });

                                                    }}
                                                    isAsyncPaginate={false}
                                                    isFormatOptionLabel={false}
                                                    placeholder="Chọn thời gian"
                                                    // additional={{
                                                    //     page: 1,
                                                    // }}
                                                />
                                            </div> */}
                      </div>

                      {formData.conditionContact &&
                        formData.conditionContact.length > 0 &&
                        formData.conditionContact.map((item, index) => (
                          <div key={index}>
                            <span className="view__logical">{formData.logicalCondition === "and" ? "And" : "Or"}</span>
                            <div className="setting_lv2">
                              <div style={{ width: "95%" }}>
                                <SelectCustom
                                  id=""
                                  name=""
                                  label=""
                                  options={[]}
                                  fill={true}
                                  special={true}
                                  value={item.rule[0]}
                                  required={false}
                                  onChange={(e) => {
                                    const newData = {
                                      id: e.value,
                                      type: "email",
                                      name: e.label,
                                      code: e.code,
                                      actionLevels:
                                        e.actionLevels?.map((el) => {
                                          return { value: el.id, label: el.name };
                                        }) || [],
                                      actionLevelId: null,
                                      value: e.value,
                                      label: e.label,
                                    };
                                    setFormData({
                                      ...formData,
                                      conditionContact: [...formData.conditionContact].map((el, idx) => {
                                        if (index === idx) {
                                          return {
                                            ...el,
                                            rule: [newData],
                                          };
                                        }

                                        return el;
                                      }),
                                    });
                                    // setFormData({ ...formData, action: newData});
                                  }}
                                  isAsyncPaginate={true}
                                  isFormatOptionLabel={true}
                                  placeholder="Chọn hành động"
                                  loadOptionsPaginate={loadedOptionEmailAction}
                                  additional={{
                                    page: 1,
                                  }}
                                />
                              </div>

                              {/* <div style={{width: '46%'}}>
                                                        <SelectCustom
                                                            id=""
                                                            name=""
                                                            label=""
                                                            options={item.rule[0]?.actionLevels?.length > 0  ? item.rule[0]?.actionLevels : [] }
                                                            fill={true}
                                                            special={true}
                                                            value={item.rule[0]?.time}
                                                            required={false}
                                                            onChange={(e) => {
                                                                setFormData({
                                                                  ...formData,
                                                                  conditionContact: [...formData.conditionContact].map((el, idx) => {
                                                                    if (index === idx) {
                                                                      return {
                                                                        ...el,
                                                                        rule: [...el.rule].map((el, idx) => {
                                                                          if (idx === 0) {
                                                                            return {
                                                                              ...el,
                                                                              time: e,
                                                                              actionLevelId: e.value
                                                                            };
                                                                          }
                                                                  
                                                                          return el;
                                                                        }),
                                                                      };
                                                                    }
                                                            
                                                                    return el;
                                                                  }),
                                                                });

                                                            }}
                                                            isAsyncPaginate={false}
                                                            isFormatOptionLabel={false}
                                                            placeholder="Chọn thời gian"
                                                            // additional={{
                                                            //     page: 1,
                                                            // }}
                                                        />
                                                    </div> */}

                              <div
                                className="action_remove_active"
                                title="Xóa"
                                onClick={() => {
                                  const newArray = [...formData.conditionContact];
                                  newArray.splice(index, 1);
                                  setFormData({ ...formData, conditionContact: newArray });
                                }}
                              >
                                <Icon name="Trash" />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="condition-customer-segment">
                <div className="form-group">
                  <span className="name-group">Điều kiện phân khúc khách hàng</span>
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

                      <div className="including__conditions">
                        {/* đoạn này là chọn các trường để fill xuống dưới */}
                        <div className={`lst__option--group-field `}>
                          <div
                            className={`choose-field ${isShowField ? "show__field--choose" : ""}`}
                            ref={refOptionFieldContainer}
                            onClick={() => {
                              setIsShowField(true);
                            }}
                          >
                            <div className="action__drop--field">
                              <span>Chọn trường</span>
                              <Icon name="ChevronDown" />
                            </div>
                          </div>

                          {isShowField && (
                            <ul className="lst__field--drop" ref={refOptionField}>
                              {lstFieldFilter
                                .filter((el) => {
                                  return !formData.rule.some((ul) => ul.fieldName === el.fieldName);
                                })
                                .map((ol, index) => {
                                  return (
                                    <li key={index} className="item__field--drop" onClick={() => handlePushRule(ol, formData.rule)}>
                                      {ol.name}
                                    </li>
                                  );
                                })}
                            </ul>
                          )}
                        </div>

                        {/* đoạn này là show lên các trường đã được chọn */}
                        <div className="lst__field--rule">
                          {formData.rule &&
                            formData.rule.length > 0 &&
                            formData.rule.map((item, idx) => {
                              return (
                                <Fragment key={idx}>
                                  <div className="item__rule">
                                    <div className="lst__info--rule">
                                      <div className="info-item">
                                        <span className="name-field">{capitalizeFirstLetter(item.name)}</span>
                                      </div>

                                      <div className="info-item">
                                        <SelectCustom
                                          name="condition"
                                          fill={true}
                                          value={item.operator}
                                          options={
                                            item.fieldName === "name"
                                              ? lstConditionFieldSpecialText
                                              : item.type === "text" && item.fieldName === "email"
                                              ? [...lstConditionFieldText, { value: "ne", label: "Not_Equal" }]
                                              : item.type === "text"
                                              ? lstConditionFieldText
                                              : item.fieldName === "height" || item.fieldName === "weight"
                                              ? lstConditionFieldSpecialNumber
                                              : item.type === "number"
                                              ? lstConditionFieldNumber
                                              : item.type === "date"
                                              ? lstConditionFieldDate
                                              : lstConditionFieldSelect
                                          }
                                          // disabled={disableFieldCommom}
                                          onChange={(e) => handleChangeValueCondition(e, idx)}
                                        />
                                      </div>

                                      <div className="info-item">
                                        {item.type === "text" ? (
                                          <Input
                                            name={item.name}
                                            fill={true}
                                            value={item.value}
                                            // disabled={disableFieldCommom}
                                            onChange={(e) => handChangeValueTypeItem(e, idx, "input")}
                                            placeholder={`Nhập ${item.name.toLowerCase()}`}
                                          />
                                        ) : item.type === "number" ? (
                                          <NummericInput
                                            name={item.name}
                                            fill={true}
                                            value={item.value}
                                            thousandSeparator={true}
                                            // disabled={disableFieldCommom}
                                            onValueChange={(e) => handChangeValueTypeItem(e, idx, "number")}
                                            placeholder={`Nhập ${item.name.toLowerCase()}`}
                                          />
                                        ) : item.type === "date" ? (
                                          <DatePickerCustom
                                            name={item.name}
                                            fill={true}
                                            value={item.value}
                                            iconPosition="left"
                                            // disabled={disableFieldCommom}
                                            icon={<Icon name="Calendar" />}
                                            onChange={(e) => handChangeValueTypeItem(e, idx, "date")}
                                            placeholder={`Chọn ${item.name.toLowerCase()}`}
                                          />
                                        ) : item.type === "select" ? (
                                          <SelectCustom
                                            name={item.name}
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
                                            placeholder={`Chọn ${item.name.toLowerCase()}`}
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
                                        )}
                                      </div>
                                    </div>

                                    {/* {!disableFieldCommom && ( */}
                                    <div className="action__delete--rule">
                                      <Tippy content="Xóa">
                                        <span className="icon__delete" onClick={() => handleDeleteItemField(idx)}>
                                          <Icon name="Trash" />
                                        </span>
                                      </Tippy>
                                    </div>
                                    {/* )} */}
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
                          const filterBlockFieldRule = lstFieldFilter.filter((ol) => {
                            return !item.rule.some((el) => el.fieldName === ol.fieldName);
                          });

                          return (
                            <div key={idx} className="box__block--rule">
                              <span className="view__logical">{formData.logical === "and" ? "And" : "Or"}</span>

                              <div className="block__rule">
                                {/* đoạn này là chọn các loại điều kiện */}
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
                                    color="success"
                                    className="icon__add"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handAddItemBlock(idx);
                                    }}
                                    // disabled={disableFieldCommom}
                                  >
                                    <Icon name="PlusCircleFill" />
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

                                <div className="including__conditions">
                                  {/* đoạn này là chọn các trường để fill xuống dưới */}
                                  <div className={`lst__option--group-field `}>
                                    <div
                                      className={`choose-field ${isShowFieldBlock && idx === idxFieldBlock ? "show__field--choose" : ""}`}
                                      ref={refBlockOptionFieldContainer}
                                      onClick={() => {
                                        // if (!disableFieldCommom) {
                                        setIsShowFieldBlock(true);
                                        setIdxFieldBlock(idx);
                                        // }
                                      }}
                                    >
                                      <div className="action__drop--field">
                                        <span>Chọn trường</span>
                                        <Icon name="ChevronDown" />
                                      </div>
                                    </div>

                                    {isShowFieldBlock && idx === idxFieldBlock && (
                                      <ul className="lst__field--drop" ref={refBlockOptionField}>
                                        {filterBlockFieldRule.map((ol, index) => {
                                          return (
                                            <li key={index} className="item__field--drop" onClick={() => handlePushRuleBlock(ol, idx, item.rule)}>
                                              {ol.name}
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    )}
                                  </div>

                                  {/* đoạn này là show lên các trường đã được chọn */}
                                  <div className="lst__field--rule">
                                    {item.rule &&
                                      item.rule.length > 0 &&
                                      item.rule.map((el, index) => {
                                        return (
                                          <Fragment key={index}>
                                            <div className="item__rule">
                                              <div className="lst__info--rule">
                                                <div className="info-item">
                                                  <span className="name-field">{capitalizeFirstLetter(el.name)}</span>
                                                </div>

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
                                                        : el.type === "text"
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

                                                <div className="info-item">
                                                  {el.type === "text" ? (
                                                    <Input
                                                      name={el.name}
                                                      fill={true}
                                                      value={el.value}
                                                      // disabled={disableFieldCommom}
                                                      onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "input")}
                                                      placeholder={`Nhập ${el.name.toLowerCase()}`}
                                                    />
                                                  ) : el.type === "number" ? (
                                                    <NummericInput
                                                      name={el.name}
                                                      fill={true}
                                                      value={el.value}
                                                      thousandSeparator={true}
                                                      // disabled={disableFieldCommom}
                                                      onValueChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "number")}
                                                      placeholder={`Nhập ${el.name.toLowerCase()}`}
                                                    />
                                                  ) : el.type === "date" ? (
                                                    <DatePickerCustom
                                                      name={el.name}
                                                      fill={true}
                                                      value={el.value}
                                                      iconPosition="left"
                                                      // disabled={disableFieldCommom}
                                                      icon={<Icon name="Calendar" />}
                                                      onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "date")}
                                                      placeholder={`Chọn ${el.name.toLowerCase()}`}
                                                    />
                                                  ) : el.type === "select" ? (
                                                    <SelectCustom
                                                      name={el.name}
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
                                                      placeholder={`Chọn ${el.name.toLowerCase()}`}
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
                                                  )}
                                                </div>
                                              </div>

                                              {/* {!disableFieldCommom && ( */}
                                              <div className="action__delete--rule">
                                                <Tippy content="Xóa">
                                                  <span className="icon__delete" onClick={() => handleDeleteBlockItemField(index, idx)}>
                                                    <Icon name="Trash" />
                                                  </span>
                                                </Tippy>
                                              </div>
                                              {/* )} */}
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

                                  {item.blockRule && item.blockRule.length > 0 && (
                                    <div className="lv__item lv__3">
                                      {item.blockRule.map((el, ids) => {
                                        const filterBlockChildrenFieldRule = lstFieldFilter.filter((il) => {
                                          return !el.rule.some((ol) => ol.fieldName === il.fieldName);
                                        });

                                        return (
                                          <div key={ids} className="box__children--block">
                                            <span className="view__logical view__logical--block">{item.logical === "and" ? "And" : "Or"}</span>

                                            <div className="block__children">
                                              <div className="action__choose--item action__choose--lv3">
                                                <Button
                                                  color={el.logical === "and" ? "primary" : "secondary"}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    handChangeChildrenLogical(ids, idx, "and");
                                                  }}
                                                  // disabled={disableFieldCommom}
                                                >
                                                  AND
                                                </Button>
                                                <Button
                                                  color={el.logical === "or" ? "primary" : "secondary"}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    handChangeChildrenLogical(ids, idx, "or");
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
                                                    handDeleteChildrenItemBlock(ids, idx);
                                                  }}
                                                  // disabled={disableFieldCommom}
                                                >
                                                  <Icon name="Trash" />
                                                </Button>
                                              </div>

                                              <div className="including__conditions">
                                                {/* đoạn này là chọn các trường để fill xuống dưới */}
                                                <div className={`lst__option--group-field `}>
                                                  <div
                                                    className={`choose-field ${
                                                      isShowFieldChildrenBlock && idx === idxFieldChildrenBlock ? "show__field--choose" : ""
                                                    }`}
                                                    ref={refChildrenBlockOptionFieldContainer}
                                                    onClick={() => {
                                                      // if (!disableFieldCommom) {
                                                      setIsShowFieldChildrenBlock(true);
                                                      setIdxFieldChildrenBlock(idx);
                                                      // }
                                                    }}
                                                  >
                                                    <div className="action__drop--field">
                                                      <span>Chọn trường</span>
                                                      <Icon name="ChevronDown" />
                                                    </div>
                                                  </div>

                                                  {isShowFieldChildrenBlock && idx === idxFieldChildrenBlock && (
                                                    <ul className="lst__field--drop" ref={refChildrenBlockOptionField}>
                                                      {filterBlockChildrenFieldRule.map((ol, index) => {
                                                        return (
                                                          <li
                                                            key={index}
                                                            className="item__field--drop"
                                                            onClick={() => handlePushRuleChildrenBlock(ol, ids, idx, el.rule)}
                                                          >
                                                            {ol.name}
                                                          </li>
                                                        );
                                                      })}
                                                    </ul>
                                                  )}
                                                </div>

                                                {/* đoạn này là show lên các trường đã được chọn */}
                                                <div className="lst__field--rule">
                                                  {el.rule &&
                                                    el.rule.length > 0 &&
                                                    el.rule.map((ol, index) => {
                                                      return (
                                                        <Fragment key={index}>
                                                          <div className="item__rule">
                                                            <div className="lst__info--rule">
                                                              <div className="info-item">
                                                                <span className="name-field">{capitalizeFirstLetter(ol.name)}</span>
                                                              </div>

                                                              <div className="info-item">
                                                                <SelectCustom
                                                                  name="condition"
                                                                  fill={true}
                                                                  value={ol.operator}
                                                                  options={
                                                                    ol.fieldName === "name"
                                                                      ? lstConditionFieldSpecialText
                                                                      : ol.type === "text" && ol.fieldName === "email"
                                                                      ? [...lstConditionFieldText, { value: "ne", label: "Not_Equal" }]
                                                                      : ol.type === "text"
                                                                      ? lstConditionFieldText
                                                                      : ol.fieldName === "height" || ol.fieldName === "weight"
                                                                      ? lstConditionFieldSpecialNumber
                                                                      : ol.type === "number"
                                                                      ? lstConditionFieldNumber
                                                                      : ol.type === "date"
                                                                      ? lstConditionFieldDate
                                                                      : lstConditionFieldSelect
                                                                  }
                                                                  // disabled={disableFieldCommom}
                                                                  onChange={(e) => handleChangeValueChildrenBlockCondition(e, index, ids, idx)}
                                                                />
                                                              </div>

                                                              <div className="info-item">
                                                                {ol.type === "text" ? (
                                                                  <Input
                                                                    name={ol.name}
                                                                    fill={true}
                                                                    value={ol.value}
                                                                    // disabled={disableFieldCommom}
                                                                    onChange={(e) =>
                                                                      handChangeValueChildrenTypeBlockItem(e, index, ids, idx, "input")
                                                                    }
                                                                    placeholder={`Nhập ${ol.name.toLowerCase()}`}
                                                                  />
                                                                ) : ol.type === "number" ? (
                                                                  <NummericInput
                                                                    name={ol.name}
                                                                    fill={true}
                                                                    value={ol.value}
                                                                    thousandSeparator={true}
                                                                    // disabled={disableFieldCommom}
                                                                    onValueChange={(e) =>
                                                                      handChangeValueChildrenTypeBlockItem(e, index, ids, idx, "number")
                                                                    }
                                                                    placeholder={`Nhập ${ol.name.toLowerCase()}`}
                                                                  />
                                                                ) : ol.type === "date" ? (
                                                                  <DatePickerCustom
                                                                    name={ol.name}
                                                                    fill={true}
                                                                    value={ol.value}
                                                                    iconPosition="left"
                                                                    // disabled={disableFieldCommom}
                                                                    icon={<Icon name="Calendar" />}
                                                                    onChange={(e) => handChangeValueChildrenTypeBlockItem(e, index, ids, idx, "date")}
                                                                    placeholder={`Chọn ${ol.name.toLowerCase()}`}
                                                                  />
                                                                ) : ol.type === "select" ? (
                                                                  <SelectCustom
                                                                    name={ol.name}
                                                                    fill={true}
                                                                    options={ol.options || []}
                                                                    value={+ol.value}
                                                                    isLoading={isLoadingSource}
                                                                    onChange={(e) =>
                                                                      handChangeValueChildrenTypeBlockItem(e, index, ids, idx, "select")
                                                                    }
                                                                    onMenuOpen={() =>
                                                                      onSelectOpenChildrenBlockApi(
                                                                        ol.source,
                                                                        index,
                                                                        ids,
                                                                        idx,
                                                                        ol.fieldName == "city_id"
                                                                          ? 0
                                                                          : ol.fieldName == "district_id"
                                                                          ? el.rule.find((li) => li.fieldName == "city_id").value
                                                                          : ol.fieldName == "subdistrict_id"
                                                                          ? el.rule.find((li) => li.fieldName == "district_id").value
                                                                          : ""
                                                                      )
                                                                    }
                                                                    placeholder={`Chọn ${ol.name.toLowerCase()}`}
                                                                    disabled={
                                                                      (ol.fieldName === "district_id" &&
                                                                        !el.rule.some((li) => li.fieldName === "city_id" && li.value !== "")) ||
                                                                      (ol.fieldName === "subdistrict_id" &&
                                                                        (!el.rule.some((li) => li.fieldName === "city_id" && li.value !== "") ||
                                                                          !el.rule.some((li) => li.fieldName === "district_id" && li.value !== "")))
                                                                    }
                                                                  />
                                                                ) : (
                                                                  <div className="field__special">
                                                                    <SelectCustom
                                                                      placeholder="Chọn ngày"
                                                                      name="foundingDay"
                                                                      fill={true}
                                                                      value={+ol.value.split("/")[0]}
                                                                      options={days}
                                                                      // disabled={disableFieldCommom}
                                                                      onChange={(e) => handleChangeValueChildrenBlockDay(e, index, ids, idx)}
                                                                      className="founded__day"
                                                                    />

                                                                    <SelectCustom
                                                                      placeholder="Chọn tháng"
                                                                      name="foundingMonth"
                                                                      fill={true}
                                                                      value={+ol.value.split("/")[1]}
                                                                      options={months}
                                                                      // disabled={disableFieldCommom}
                                                                      onChange={(e) => handleChangeValueChildrenBlockMonth(e, index, ids, idx)}
                                                                      className="founded_month"
                                                                    />

                                                                    <SelectCustom
                                                                      placeholder="Chọn năm"
                                                                      name="foundingYear"
                                                                      fill={true}
                                                                      value={+ol.value.split("/")[2]}
                                                                      options={years}
                                                                      // disabled={disableFieldCommom}
                                                                      onChange={(e) => handleChangeValueChildrenBlockYear(e, index, ids, idx)}
                                                                      className="founded__day"
                                                                    />
                                                                  </div>
                                                                )}
                                                              </div>
                                                            </div>
                                                            {/* {!disableFieldCommom && ( */}
                                                            <div className="action__delete--rule">
                                                              <Tippy content="Xóa">
                                                                <span
                                                                  className="icon__delete"
                                                                  onClick={() => handleDeleteChildrenBlockItemField(index, ids, idx)}
                                                                >
                                                                  <Icon name="Trash" />
                                                                </span>
                                                              </Tippy>
                                                            </div>
                                                            {/* )} */}
                                                          </div>
                                                          {el.rule.length > 1 && (
                                                            <span className="view__logical view__logical--rule--block--children">
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
