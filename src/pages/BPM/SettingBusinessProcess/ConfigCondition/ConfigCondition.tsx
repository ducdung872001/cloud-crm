import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IEmailRequest } from "model/email/EmailRequestModel";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import { showToast } from "utils/common";
import { convertParamsToString, createArrayFromTo, createArrayFromToR, isDifferenceObj } from "reborn-util";
import CustomerService from "services/CustomerService";
import "./ConfigCondition.scss";
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
import ContractEformService from "services/ContractEformService";
import BusinessProcessService from "services/BusinessProcessService";
import BpmEformMappingService from "services/BpmEformMappingService";

export default function ConfigCondition(props: any) {
  const { onShow, onHide, dataNode, setDataNode, statusMA } = props;
  //console.log("dataNode", dataNode);
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
    dataEform: null,
    listEformAttribute: [],
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

  const [lstFieldEform, setFieldEform] = useState([]);

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
        dataEform: configData?.dataEform || null,
        listEformAttribute: configData?.listEformAttribute || [],
        rule: configData?.rule || [],
        blockRule: configData?.blockRule || [],
        logical: configData?.logical || "and",
      });
      // }
    } else {
      setData(null);
    }
  }, [dataNode, onShow]);

  const [isShowField, setIsShowField] = useState<boolean>(false);
  const [isShowFieldEform, setIsShowFieldEform] = useState<boolean>(false);

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
        logical: data ? data.logical : "and",
        dataEform: data ? data.dataEform : null,
        bfatId: data?.bfatId ?? null,
        listEformAttribute: data?.listEformAttribute || null,
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

  //Biểu mẫu
  const loadedOptionEform = async (search, loadedOptions, { page }) => {
    // const param = {
    //   name: search,
    //   page: page,
    //   limit: 10,
    // };

    // const response = await ContractEformService.list(param);

    const params = {
      processId: dataNode.processId,
      // nodeId: dataNode.id
      nodeId: 0,
    };
    const response = await BpmEformMappingService.listEform(params);

    if (response.code === 0) {
      const dataOption = response.result || [];

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  bfatId: item.bfatId,
                  // avatar: item.avatar,
                };
              })
            : []),
        ],
        // hasMore: response.result.loadMoreAble,
        // additional: {
        //   page: page + 1,
        // },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueEform = async (e) => {
    const params = {
      limit: 1000,
      eformId: e.value,
    };
    const response = await ContractEformService.listEformExtraInfo(params);
    if (response.code === 0) {
      const result = response.result;
      setFormData({ ...formData, dataEform: e, listEformAttribute: result });
    }
  };

  const handleChangeValueEformLv2 = async (e, idx) => {
    const params = {
      limit: 1000,
      eformId: e.value,
    };
    const response = await ContractEformService.listEformExtraInfo(params);
    if (response.code === 0) {
      const result = response.result;
      setFormData({
        ...formData,
        blockRule: [...formData.blockRule].map((el, index) => {
          if (index === idx) {
            return {
              ...el,
              dataEform: e,
              listEformAttribute: result,
            };
          }

          return el;
        }),
      });
    }
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
  const handlePushRule = (data, lstData) => {
    if (!data) return;

    let mergeData = [];

    const changeData = {
      ...data,
      operator: "eq",
      value: "",
      type: data.datatype,
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

    const changeData = {
      ...data,
      operator: "eq",
      value: "",
      type: data.datatype,
    };

    setFormData({
      ...formData,
      blockRule: [...formData.blockRule].map((el, index) => {
        if (index === idx) {
          return {
            ...el,
            rule: [...el.rule, ...[changeData]],
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
      rule: formData.rule,
      dataEform: formData.dataEform,
      listEformAttribute: formData.listEformAttribute,
      logical: formData.logical,
      blockRule: formData.blockRule,
    };

    console.log("configDataNew", configDataNew);

    // if(!_.isEqual(nodeName, dataNode?.name)){
    //   if(!nodeName){
    //     showToast("Vui lòng nhập tên điều kiện", "error");
    //     return;
    //   }
    // }

    const body: any = {
      ...dataNode,
      ...(!_.isEqual(nodeName, dataNode?.name) ? { name: nodeName } : {}),
      configData: configDataNew,
      // point: nodePoint,
    };

    const response = await BusinessProcessService.addNode(body);
    if (response.code === 0) {
      showToast(`Cập nhật điều kiện thành công`, "success");
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
      type: "email",
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
      rule: formData.rule,
      dataEform: formData.dataEform,
      logical: formData.logical,
      blockRule: formData.blockRule,
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

    const response = await BusinessProcessService.addNode(body);
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
        className="modal-condition-eform"
        size="lg"
      >
        <form className="form-condition-eform">
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
            <Button onClick={() => !isSubmit && handleClearForm()} type="button" className="btn-close" color="transparent" onlyIcon={true}>
              <Icon name="Times" />
            </Button>
          </div>

          <ModalBody>
            <div className="container-condition-eform">
              {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                        name="name_field"
                        value={nodeName}
                        fill={true}
                        disabled={editName}
                        onBlur={() => {
                          // setEditName(false);
                          // setNodeName(dataNode?.name)
                          if (!_.isEqual(nodeName, dataNode?.name)) {
                            changeNodeName();
                          } else {
                            setEditName(true);
                          }
                        }}
                        // iconPosition="right"
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
              </div> */}

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
                        {/* đoạn này là chọn các trường để fill xuống dưới */}
                        {/* <div className={`lst__option--group-eform`}>
                          <div
                            className={`choose-field ${isShowFieldEform ? "show__field--choose" : ""}`}
                            ref={refOptionFieldContainer}
                            onClick={() => {
                            //   setIsShowField(true);
                            }}
                          >
                            <div className="action__drop--field">
                              <span>Chọn biểu mẫu</span>
                              <Icon name="ChevronDown" />
                            </div>
                          </div>

                          {isShowFieldEform && (
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
                        </div> */}
                        <div style={{ marginBottom: "1rem", marginTop: "1rem" }}>
                          <SelectCustom
                            id="eformId"
                            name="eformId"
                            label="Chọn biểu mẫu"
                            options={[]}
                            fill={true}
                            value={formData.dataEform}
                            special={true}
                            required={true}
                            onChange={(e) => handleChangeValueEform(e)}
                            isAsyncPaginate={true}
                            isFormatOptionLabel={false}
                            placeholder="Chọn biểu mẫu"
                            additional={{
                              page: 1,
                            }}
                            loadOptionsPaginate={loadedOptionEform}
                            // formatOptionLabel={formatOptionLabelEmployee}
                            // error={checkFieldEform}
                            message="Biểu mẫu không được bỏ trống"
                          />
                        </div>

                        {formData.dataEform ? (
                          <div className={`lst__option--group-field`}>
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
                                {formData.listEformAttribute?.length > 0
                                  ? formData.listEformAttribute
                                      ?.filter((el) => {
                                        return !formData.rule.some((ul) => ul.fieldName === el.fieldName);
                                      })
                                      .map((ol, index) => {
                                        return (
                                          <li
                                            key={index}
                                            className="item__field--drop"
                                            onClick={() => {
                                              if (formData.dataEform) {
                                                handlePushRule(ol, formData.rule);
                                              }
                                            }}
                                          >
                                            {ol.name}
                                          </li>
                                        );
                                      })
                                  : null}
                              </ul>
                            )}
                          </div>
                        ) : null}

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
                                        ) : item.type === "select" || item.type === "dropdown" ? (
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
                                  {/* đoạn này là chọn các trường để fill xuống dưới */}
                                  <div style={{ marginBottom: "1rem", marginTop: "1rem" }}>
                                    <SelectCustom
                                      id="eformId"
                                      name="eformId"
                                      label="Chọn biểu mẫu"
                                      options={[]}
                                      fill={true}
                                      value={item.dataEform}
                                      special={true}
                                      required={true}
                                      onChange={(e) => handleChangeValueEformLv2(e, idx)}
                                      isAsyncPaginate={true}
                                      isFormatOptionLabel={false}
                                      placeholder="Chọn biểu mẫu"
                                      additional={{
                                        page: 1,
                                      }}
                                      loadOptionsPaginate={loadedOptionEform}
                                      // formatOptionLabel={formatOptionLabelEmployee}
                                      // error={checkFieldEform}
                                      message="Biểu mẫu không được bỏ trống"
                                    />
                                  </div>
                                  {item.dataEform ? (
                                    <div className={`lst__option--group-eform `}>
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
                                          {item.listEformAttribute?.length > 0
                                            ? item.listEformAttribute?.map((ol, index) => {
                                                return (
                                                  <li
                                                    key={index}
                                                    className="item__field--drop"
                                                    onClick={() => {
                                                      if (item.dataEform) {
                                                        handlePushRuleBlock(ol, idx, item.rule);
                                                      }
                                                    }}
                                                  >
                                                    {ol.name}
                                                  </li>
                                                );
                                              })
                                            : null}
                                        </ul>
                                      )}
                                    </div>
                                  ) : null}

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
                                                  ) : el.type === "select" || el.type === "dropdown" ? (
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
