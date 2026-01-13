import React, { Fragment, useEffect, useMemo, useState } from "react";
import _, { set } from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { convertParamsToString, createArrayFromTo, createArrayFromToR } from "reborn-util";
import Icon from "components/icon";
import Input from "components/input/input";
import TextArea from "components/textarea/textarea";
import Button from "components/button/button";
import SelectCustom from "components/selectCustom/selectCustom";
import NummericInput from "components/input/numericInput";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import { showToast } from "utils/common";
import CustomerService from "services/CustomerService";
import { IActionModal } from "model/OtherModel";
import { ModalFooter } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import "./index.scss";
import { F } from "lodash/fp";

interface IAddCustomerSegmentProps {
  data: any;
  onShow: boolean;
  onReload: any;
  isView: boolean;
}

export default function AddCustomerSegment(props: IAddCustomerSegmentProps) {
  const { data, onShow, onReload, isView } = props;

  const disableFieldCommom = isView;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);


  /*
    [
      { value: "nin", label: "Nin" },
      { value: "eq", label: "Equal" },
      { value: "like", label: "Like" },
      { value: "ne", label: "Not_Equal" },
      { value: "gt", label: "Greater_Than" },
      { value: "lt", label: "Less_Than" },
      { value: "gte", label: "Greater_Than_Or_Equal" },
      { value: "lte", label: "Less_Than_Or_Equal" },
      { value: "none", label: "None" },
    ]
  */

  const lstConditionFieldText = [
    { value: "eq", label: "Equal" },
    { value: "like", label: "Like" },
    { value: "include", label: "Include" },
  ];

  const lstConditionFieldSpecialText = [
    { value: "like", label: "Like" },
    { value: "include", label: "Include" },
  ];

  const lstConditionFieldNumber = [
    { value: "nin", label: "Nin" },
    { value: "eq", label: "Equal" },
    { value: "in", label: "In" },
    { value: "ne", label: "Not_Equal" },
    { value: "gt", label: "Greater_Than" },
    { value: "lt", label: "Less_Than" },
    { value: "gte", label: "Greater_Than_Or_Equal" },
    { value: "lte", label: "Less_Than_Or_Equal" },
    { value: "include", label: "Include" },
  ];

  const lstConditionFieldSpecialNumber = [
    { value: "eq", label: "Equal" },
    { value: "in", label: "In" },
    { value: "gt", label: "Greater_Than" },
    { value: "lt", label: "Less_Than" },
    { value: "gte", label: "Greater_Than_Or_Equal" },
    { value: "lte", label: "Less_Than_Or_Equal" },
    { value: "include", label: "Include" },
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
    { value: "include", label: "Include" },
  ];

  const lstConditionFieldSelect = [
    { value: "nin", label: "Nin" },
    { value: "eq", label: "Equal" },
    { value: "in", label: "In" },
    { value: "ne", label: "Not_Equal" },
    { value: "include", label: "Include" },
  ];

  const defaultBlockRule = {
    logical: "and",
    rule: [],
    blockRule: [],
  };

  const normalizeOptions = (items = []) =>
    (items || []).map((e) => {
      const value = e?.value ?? e?.id ?? e?.code ?? e?.key ?? e;
      const label = e?.label ?? e?.name ?? `${e?.value ?? e?.id ?? e}`;
      return { value, label };
    });

  const capitalizeFirstLetter = (str) => {
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
  };

  const defaultFieldFilter = [
    {
      name: "Ngày mua cuối",
      fieldName: "last_bought_date",
      type: "date",
      dataType: "date",
      options: [],
      source: "",
    },
    {
      name: "Tổng doanh số",
      fieldName: "fee",
      type: "number",
      dataType: "number",
      options: [],
      source: "",
    },
    {
      name: "Tổng doanh thu",
      fieldName: "paid",
      type: "number",
      dataType: "number",
      options: [],
      source: "",
    },
    {
      name: "Công nợ",
      fieldName: "debt",
      type: "number",
      dataType: "number",
      options: [],
      source: "",
    },
    {
      name: "Mã chiến dịch",
      fieldName: "code_campaign",
      type: "text",
      dataType: "string",
      options: [],
      source: "",
    },
  ];

  const [lstFieldFilter, setLstFieldFilter] = useState([]);

  const handGetCustomerAttributes = async () => {
    const response = await CustomerService.customerAttributes();

    if (response.code === 0) {
      const result = response.result.items;
      const changeDataResult = result.map((item) => {
        // Xử lý options - swap giá trị cho trường giới tính
        let options = [];
        
        // Hardcode options cho giới tính nếu không có từ API
        if (item.name === "gender" || item.name === "sex") {
          options = [
            { value: 2, label: "Nam" },
            { value: 1, label: "Nữ" },
          ];
        } else if (item.source === "data") {
          options = normalizeOptions(item.data);
        } else if (item.data) {
          options = normalizeOptions(item.data);
        }

        return {
          name: capitalizeFirstLetter(item.title),
          fieldName: item.name,
          type:
            item.name === "birthday"
              ? ""
              : item.name === "source_id"
              ? "select"
              : item.name === "gender" || item.name === "sex"
              ? "select"
              : item.source
              ? "select"
              : item.type === "string"
              ? "text"
              : item.type,
          dataType: item.name === "birthday" ? "" : item.name === "source_id" ? "select" : item.type,
          options: options,
          source: item.source === "api" || item.name === "source_id" ? item.path : "",
          dataAttribute: item.attId ? true : false,
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

  const [isShowField, setIsShowField] = useState<boolean>(false);

  const [idxFieldBlock, setIdxFieldBlock] = useState<number>(null);
  const [isShowFieldBlock, setIsShowFieldBlock] = useState<boolean>(false);

  const [idxFieldChildrenBlock, setIdxFieldChildrenBlock] = useState<number>(null);
  const [isShowFieldChildrenBlock, setIsShowFieldChildrenBlock] = useState<boolean>(false);

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

        if (field && (field.type === "select" || field.type === "radio") && field.source) {
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

            const changeDataResult = normalizeOptions(data);

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
        } else if (field && (field.type === "select" || field.type === "radio")) {
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
        name: changeDataProps ? changeDataProps.name : "",
        description: changeDataProps ? changeDataProps.description : "",
        logical: changeDataProps ? changeDataProps.logical : "and",
        rule: changeDataProps ? changeDataProps.rule || [] : [],
        blockRule: changeDataProps ? changeDataProps.blockRule || [] : [],
        status: changeDataProps ? changeDataProps.status : "draft",
      } as any),
    [changeDataProps, onShow]
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

    const changeDataProps = {
      name: data.label,
      fieldName: data.value,
      dataType: data.dataType,
      options: data.chooses,
      source: data.source,
      type: data.type,
      dataAttribute: data.dataAttribute,
    };

    let mergeData = [];

    const changeData = {
      ...changeDataProps,
      operator: "eq",
      value: data.type === "boolean" ? "true" : "",
    };

    if (changeDataProps.fieldName === "district_id") {
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
    } else if (changeDataProps.fieldName === "subdistrict_id") {
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
    setValidateRule({ ...validateRule, rule: false });
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
    let label = null;
    if (type === "input") {
      value = e.target.value;
    } else if (type === "number") {
      value = e.floatValue;
    } else if (type === "date") {
      value = e;
    } else if (type === "select" || type === "radio") {
      value = e.value;
      label = e.label;
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
            ...(label ? { label: label } : {}),
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
    console.log("source", source);

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

      const changeDataResult = normalizeOptions(result);

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

    const changeDataProps = {
      name: data.label,
      fieldName: data.value,
      dataType: data.dataType,
      options: data.chooses,
      source: data.source,
      type: data.type,
      dataAttribute: data.dataAttribute,
    };

    let mergeData = [];

    const changeData = {
      ...changeDataProps,
      operator: "eq",
      value: data.type === "boolean" ? "true" : "",
    };

    if (changeDataProps.fieldName === "district_id") {
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
    } else if (changeDataProps.fieldName === "subdistrict_id") {
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
    let label = null;
    if (type === "input") {
      value = e.target.value;
    } else if (type === "number") {
      value = e.floatValue;
    } else if (type === "date") {
      value = e;
    } else if (type === "select" || type === "radio") {
      value = e.value;
      label = e.label;
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
                  ...(label ? { label: label } : {}),
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

      const changeDataResult = normalizeOptions(result);

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

    const changeDataProps = {
      name: data.label,
      fieldName: data.value,
      dataType: data.dataType,
      options: data.chooses,
      source: data.source,
      type: data.type,
      dataAttribute: data.dataAttribute,
    };

    let mergeData = [];

    const changeData = {
      ...changeDataProps,
      operator: "eq",
      value: data.type === "boolean" ? "true" : "",
    };

    if (changeDataProps.fieldName === "district_id") {
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
    } else if (changeDataProps.fieldName === "subdistrict_id") {
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
    let label = null;
    if (type === "input") {
      value = e.target.value;
    } else if (type === "number") {
      value = e.floatValue;
    } else if (type === "date") {
      value = e;
    } else if (type === "select" || type === "radio") {
      value = e.value;
      label = e.label;
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
                        ...(label ? { label: label } : {}),
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

      const changeDataResult = normalizeOptions(result);

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
        // if (key === "options" || key === "source") {
        //   continue; // Loại bỏ các trường "options" và "source"
        // }

        if (key === "rule" && data[key]?.length > 0) {
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
        } else if (key === "blockRule" && data[key]?.length > 0) {
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

  const [validateRule, setValidateRule] = useState({
    rule: false,
    blockRule: false,
    childrenRule: false,
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (formData.rule.length === 0) {
      setValidateRule({ ...validateRule, rule: true });
      return;
    }

    setIsSubmit(true);

    const changeFormData = _.cloneDeep(formData);
    const modifiedmodifiedData = transformData(changeFormData);

    const body = {
      ...modifiedmodifiedData,
      ...(data ? { id: data.id } : {}),
    };

    const response = await CustomerService.createFilterAdvanced(body);

    if (response.code === 0) {
      showToast(`${data ? "Chỉnh sửa" : "Thêm mới"} bộ lọc thành công`, "success");
      onReload(true);
      setChangeDataProps(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const handClearForm = () => {
    onReload(false);
    setChangeDataProps(null);
    setFormData(values);
    setValidateRule({
      rule: false,
      blockRule: false,
      childrenRule: false,
    });
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
              _.isEqual(formData, values) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          ...(!disableFieldCommom
            ? ([
                {
                  title: data ? "Cập nhật" : "Tạo mới",
                  type: "submit",
                  color: "primary",
                  disabled: isSubmit || _.isEqual(formData, values) || Object.values(validateRule).filter((item) => item === true).length > 0,
                  is_loading: isSubmit,
                },
              ] as any)
            : []),
        ],
      },
    }),
    [isSubmit, data, formData, values, disableFieldCommom, validateRule]
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
        handClearForm();
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const isOverLength = formData.name.length > 100;
  
  return (
    <div className="add__customer--segment">
      <form className="form__filter--advanced-group" onSubmit={(e) => onSubmit(e)}>
        <div
          className="box__content__filter--advanced"
          style={
            formData.blockRule.length >= 1 || formData.rule.length > 3
              ? {
                  maxHeight: "52rem",
                  overflow: "auto",
                }
              : {}
          }
        >
          <div className="form-group">
            <Input
              name="name"
              value={formData.name}
              label="Tên phân khúc"
              fill={true}
              required={true}
              disabled={disableFieldCommom}
              placeholder="Nhập tên phân khúc"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={isOverLength}
              message="Không được nhập quá 100 ký tự"
            />

          </div>
          <div className="form-group">
            <TextArea
              name="desc"
              value={formData.description}
              label="Mô tả phân khúc"
              fill={true}
              disabled={disableFieldCommom}
              placeholder="Nhập mô tả phân khúc"
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <span className="name-group">Điều kiện lọc</span>
            <div className={`desc__filter ${validateRule.rule ? "error__filter" : ""}`}>
              <div className="lv__item lv__1">
                {/* đoạn này là chọn các loại điều kiện */}
                <div className="action__choose--item action__choose--lv1">
                  <Button
                    color={formData.logical === "and" ? "primary" : "secondary"}
                    onClick={(e) => {
                      e.preventDefault();
                      setFormData({ ...formData, logical: "and" });
                    }}
                    disabled={disableFieldCommom}
                  >
                    AND
                  </Button>
                  <Button
                    color={formData.logical === "or" ? "primary" : "secondary"}
                    onClick={(e) => {
                      e.preventDefault();
                      setFormData({ ...formData, logical: "or" });
                    }}
                    disabled={disableFieldCommom}
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
                    disabled={disableFieldCommom}
                  >
                    <Icon name="PlusCircleFill" />
                  </Button>
                </div>

                <div className="including__conditions">
                  {/* đoạn này là chọn các trường để fill xuống dưới */}
                  <div className={`lst__option--group-field ${disableFieldCommom ? "dis__lst__option--group-field" : ""}`}>
                    <div
                      className={`choose-field ${isShowField ? "show__field--choose" : ""}`}
                      onClick={() => {
                        !disableFieldCommom && setIsShowField(true);
                      }}
                    >
                      <div className="action__drop--field">
                        <SelectCustom
                          name="chooseField"
                          fill={true}
                          options={lstFieldFilter
                            .filter((el) => {
                              return !formData.rule.some((ul) => ul.fieldName === el.fieldName);
                            })
                            .map((item) => {
                              return {
                                label: item.name,
                                value: item.fieldName,
                                dataType: item.dataType,
                                chooses: item.options,
                                source: item.source || item.path,
                                type: item.type,
                                dataAttribute: item.dataAttribute,
                              };
                            })}
                          onChange={(e) => handlePushRule(e, formData.rule)}
                          placeholder="Chọn trường"
                        />
                      </div>
                    </div>
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
                                    disabled={disableFieldCommom || item.type === "boolean"}
                                    onChange={(e) => handleChangeValueCondition(e, idx)}
                                  />
                                </div>

                                <div className="info-item">
                                  {item.type === "text" ? (
                                    <Input
                                      name={item.name}
                                      fill={true}
                                      value={item.value}
                                      disabled={disableFieldCommom}
                                      onChange={(e) => handChangeValueTypeItem(e, idx, "input")}
                                      placeholder={`Nhập ${item.name.toLowerCase()}`}
                                    />
                                  ) : item.type === "number" ? (
                                    <NummericInput
                                      name={item.name}
                                      fill={true}
                                      value={item.value}
                                      thousandSeparator={true}
                                      disabled={disableFieldCommom}
                                      onValueChange={(e) => handChangeValueTypeItem(e, idx, "number")}
                                      placeholder={`Nhập ${item.name.toLowerCase()}`}
                                    />
                                  ) : item.type === "date" ? (
                                    <DatePickerCustom
                                      name={item.name}
                                      fill={true}
                                      value={item.value}
                                      iconPosition="left"
                                      disabled={disableFieldCommom}
                                      icon={<Icon name="Calendar" />}
                                      onChange={(e) => handChangeValueTypeItem(e, idx, "date")}
                                      placeholder={`Chọn ${item.name.toLowerCase()}`}
                                    />
                                  ) : item.type === "boolean" ? (
                                    <SelectCustom
                                      name={item.name}
                                      fill={true}
                                      special={true}
                                      options={[
                                        {
                                          value: "true",
                                          label: "YES",
                                        },
                                        {
                                          value: "false",
                                          label: "NO",
                                        },
                                      ]}
                                      value={
                                        item.value === "true"
                                          ? { value: "true", label: "YES" }
                                          : item.value === "false"
                                          ? { value: "false", label: "NO" }
                                          : null
                                      }
                                      isLoading={isLoadingSource}
                                      onChange={(e) => handChangeValueTypeItem(e, idx, "select")}
                                      // onMenuOpen={() =>}
                                      placeholder={`Chọn ${item.name.toLowerCase()}`}
                                      disabled={disableFieldCommom}
                                    />
                                  ) : item.type === "select" || item.type === "dropdown" || item.type === "radio" ? (
                                    <SelectCustom
                                      name={item.name}
                                      fill={true}
                                      options={item.options || []}
                                      special={item.type === "dropdown" || item.type === "select" || item.type === "radio" ? true : false}
                                      value={
                                        item.value
                                          ? {
                                              value: +item.value,
                                              label: item.label
                                                ? item.label
                                                : item.options && item.options.find((el) => el.value === +item.value).label,
                                            }
                                          : null
                                      }
                                      onChange={(e) => handChangeValueTypeItem(e, idx, "select")}
                                      disabled={
                                        (item.fieldName === "district_id" &&
                                          !formData.rule.some((el) => el.fieldName === "city_id" && el.value !== "")) ||
                                        (item.fieldName === "subdistrict_id" &&
                                          (!formData.rule.some((el) => el.fieldName === "city_id" && el.value !== "") ||
                                            !formData.rule.some((el) => el.fieldName === "district_id" && el.value !== ""))) ||
                                        disableFieldCommom
                                      }
                                      onMenuOpen={() =>
                                        onSelectOpenApi(
                                          item.source || item.path,
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
                                        disabled={disableFieldCommom}
                                        options={days}
                                        onChange={(e) => handleChangeValueDay(e, idx)}
                                        className="founded__day"
                                      />

                                      <SelectCustom
                                        placeholder="Chọn tháng"
                                        name="foundingMonth"
                                        fill={true}
                                        value={+item.value.split("/")[1]}
                                        disabled={disableFieldCommom}
                                        options={months}
                                        onChange={(e) => handleChangeValueMonth(e, idx)}
                                        className="founded_month"
                                      />

                                      <SelectCustom
                                        placeholder="Chọn năm"
                                        name="foundingYear"
                                        fill={true}
                                        value={+item.value.split("/")[2]}
                                        disabled={disableFieldCommom}
                                        options={years}
                                        onChange={(e) => handleChangeValueYear(e, idx)}
                                        className="founded__day"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {!disableFieldCommom && (
                                <div className="action__delete--rule">
                                  <Tippy content="Xóa">
                                    <span className="icon__delete" onClick={() => !disableFieldCommom && handleDeleteItemField(idx)}>
                                      <Icon name="Trash" />
                                    </span>
                                  </Tippy>
                                </div>
                              )}
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
                              disabled={disableFieldCommom}
                            >
                              AND
                            </Button>
                            <Button
                              color={item.logical === "or" ? "primary" : "secondary"}
                              onClick={(e) => {
                                e.preventDefault();
                                handChangeLogical(idx, "or");
                              }}
                              disabled={disableFieldCommom}
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
                              disabled={disableFieldCommom}
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
                              disabled={disableFieldCommom}
                            >
                              <Icon name="Trash" />
                            </Button>
                          </div>

                          <div className="including__conditions">
                            {/* đoạn này là chọn các trường để fill xuống dưới */}
                            <div className={`lst__option--group-field ${disableFieldCommom ? "dis__lst__option--group-field" : ""}`}>
                              <div
                                className={`choose-field ${isShowFieldBlock && idx === idxFieldBlock ? "show__field--choose" : ""}`}
                                onClick={() => {
                                  if (!disableFieldCommom) {
                                    setIsShowFieldBlock(true);
                                    setIdxFieldBlock(idx);
                                  }
                                }}
                              >
                                <div className="action__drop--field">
                                  <SelectCustom
                                    name="chooseField"
                                    fill={true}
                                    options={filterBlockFieldRule.map((ol) => {
                                      return {
                                        label: ol.name,
                                        value: ol.fieldName,
                                        dataType: ol.dataType,
                                        chooses: ol.options,
                                        source: ol.source || item.path,
                                        type: ol.type,
                                        dataAttribute: ol.dataAttribute,
                                      };
                                    })}
                                    onChange={(e) => handlePushRuleBlock(e, idx, item.rule)}
                                    placeholder="Chọn trường"
                                  />
                                </div>
                              </div>
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
                                              disabled={disableFieldCommom || el.type === "boolean"}
                                              onChange={(e) => handleChangeValueBlockCondition(e, index, idx)}
                                            />
                                          </div>

                                          <div className="info-item">
                                            {el.type === "text" ? (
                                              <Input
                                                name={el.name}
                                                fill={true}
                                                value={el.value}
                                                disabled={disableFieldCommom}
                                                onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "input")}
                                                placeholder={`Nhập ${el.name.toLowerCase()}`}
                                              />
                                            ) : el.type === "number" ? (
                                              <NummericInput
                                                name={el.name}
                                                fill={true}
                                                value={el.value}
                                                thousandSeparator={true}
                                                disabled={disableFieldCommom}
                                                onValueChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "number")}
                                                placeholder={`Nhập ${el.name.toLowerCase()}`}
                                              />
                                            ) : el.type === "date" ? (
                                              <DatePickerCustom
                                                name={el.name}
                                                fill={true}
                                                value={el.value}
                                                iconPosition="left"
                                                disabled={disableFieldCommom}
                                                icon={<Icon name="Calendar" />}
                                                onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "date")}
                                                placeholder={`Chọn ${el.name.toLowerCase()}`}
                                              />
                                            ) : el.type === "boolean" ? (
                                              <SelectCustom
                                                name={el.name}
                                                fill={true}
                                                special={true}
                                                options={[
                                                  {
                                                    value: "true",
                                                    label: "YES",
                                                  },
                                                  {
                                                    value: "false",
                                                    label: "NO",
                                                  },
                                                ]}
                                                value={
                                                  el.value === "true"
                                                    ? { value: "true", label: "YES" }
                                                    : el.value === "false"
                                                    ? { value: "false", label: "NO" }
                                                    : null
                                                }
                                                isLoading={isLoadingSource}
                                                onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "select")}
                                                // onMenuOpen={() =>}
                                                placeholder={`Chọn ${el.name.toLowerCase()}`}
                                                disabled={disableFieldCommom}
                                              />
                                            ) : el.type === "select" || el.type === "dropdown" || el.type === "radio" ? (
                                              <SelectCustom
                                                name={el.name}
                                                fill={true}
                                                options={el.options || []}
                                                special={el.type === "dropdown" || el.type === "select" || el.type === "radio" ? true : false}
                                                value={
                                                  el.value
                                                    ? {
                                                        value: +el.value,
                                                        label: el.label
                                                          ? el.label
                                                          : el.options && el.options.find((i) => i.value === +el.value).label,
                                                      }
                                                    : null
                                                }
                                                isLoading={isLoadingSource}
                                                onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "select")}
                                                onMenuOpen={() =>
                                                  onSelectOpenBlockApi(
                                                    el.source || el.path,
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
                                                      !item.rule.some((il) => il.fieldName === "district_id" && il.value !== ""))) ||
                                                  disableFieldCommom
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
                                                  disabled={disableFieldCommom}
                                                  onChange={(e) => handleChangeValueBlockDay(e, index, idx)}
                                                  className="founded__day"
                                                />

                                                <SelectCustom
                                                  placeholder="Chọn tháng"
                                                  name="foundingMonth"
                                                  fill={true}
                                                  value={+el.value.split("/")[1]}
                                                  options={months}
                                                  disabled={disableFieldCommom}
                                                  onChange={(e) => handleChangeValueBlockMonth(e, index, idx)}
                                                  className="founded_month"
                                                />

                                                <SelectCustom
                                                  placeholder="Chọn năm"
                                                  name="foundingYear"
                                                  fill={true}
                                                  value={+el.value.split("/")[2]}
                                                  options={years}
                                                  disabled={disableFieldCommom}
                                                  onChange={(e) => handleChangeValueBlockYear(e, index, idx)}
                                                  className="founded__day"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {!disableFieldCommom && (
                                          <div className="action__delete--rule">
                                            <Tippy content="Xóa">
                                              <span
                                                className="icon__delete"
                                                onClick={() => !disableFieldCommom && handleDeleteBlockItemField(index, idx)}
                                              >
                                                <Icon name="Trash" />
                                              </span>
                                            </Tippy>
                                          </div>
                                        )}
                                      </div>
                                      {item.rule.length > 1 && (
                                        <span className="view__logical view__logical--rule--block">{item.logical === "and" ? "And" : "Or"}</span>
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
                                            disabled={disableFieldCommom}
                                          >
                                            AND
                                          </Button>
                                          <Button
                                            color={el.logical === "or" ? "primary" : "secondary"}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handChangeChildrenLogical(ids, idx, "or");
                                            }}
                                            disabled={disableFieldCommom}
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
                                            disabled={disableFieldCommom}
                                          >
                                            <Icon name="Trash" />
                                          </Button>
                                        </div>

                                        <div className="including__conditions">
                                          {/* đoạn này là chọn các trường để fill xuống dưới */}
                                          <div className={`lst__option--group-field ${disableFieldCommom ? "dis__lst__option--group-field" : ""}`}>
                                            <div
                                              className={`choose-field ${
                                                isShowFieldChildrenBlock && idx === idxFieldChildrenBlock ? "show__field--choose" : ""
                                              }`}
                                              onClick={() => {
                                                if (!disableFieldCommom) {
                                                  setIsShowFieldChildrenBlock(true);
                                                  setIdxFieldChildrenBlock(idx);
                                                }
                                              }}
                                            >
                                              <div className="action__drop--field">
                                                <SelectCustom
                                                  name="chooseField"
                                                  fill={true}
                                                  options={filterBlockChildrenFieldRule.map((il) => {
                                                    return {
                                                      label: il.name,
                                                      value: il.fieldName,
                                                      dataType: il.dataType,
                                                      chooses: il.options,
                                                      source: il.source,
                                                      type: il.type,
                                                      dataAttribute: il.dataAttribute,
                                                    };
                                                  })}
                                                  onChange={(e) => handlePushRuleChildrenBlock(e, ids, idx, el.rule)}
                                                  placeholder="Chọn trường"
                                                />
                                              </div>
                                            </div>
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
                                                            disabled={disableFieldCommom || ol.type === "boolean"}
                                                            onChange={(e) => handleChangeValueChildrenBlockCondition(e, index, ids, idx)}
                                                          />
                                                        </div>

                                                        <div className="info-item">
                                                          {ol.type === "text" ? (
                                                            <Input
                                                              name={ol.name}
                                                              fill={true}
                                                              value={ol.value}
                                                              disabled={disableFieldCommom}
                                                              onChange={(e) => handChangeValueChildrenTypeBlockItem(e, index, ids, idx, "input")}
                                                              placeholder={`Nhập ${ol.name.toLowerCase()}`}
                                                            />
                                                          ) : ol.type === "number" ? (
                                                            <NummericInput
                                                              name={ol.name}
                                                              fill={true}
                                                              value={ol.value}
                                                              thousandSeparator={true}
                                                              disabled={disableFieldCommom}
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
                                                              disabled={disableFieldCommom}
                                                              icon={<Icon name="Calendar" />}
                                                              onChange={(e) => handChangeValueChildrenTypeBlockItem(e, index, ids, idx, "date")}
                                                              placeholder={`Chọn ${ol.name.toLowerCase()}`}
                                                            />
                                                          ) : ol.type === "boolean" ? (
                                                            <SelectCustom
                                                              name={ol.name}
                                                              fill={true}
                                                              special={true}
                                                              options={[
                                                                {
                                                                  value: "true",
                                                                  label: "YES",
                                                                },
                                                                {
                                                                  value: "false",
                                                                  label: "NO",
                                                                },
                                                              ]}
                                                              value={
                                                                ol.value === "true"
                                                                  ? { value: "true", label: "YES" }
                                                                  : ol.value === "false"
                                                                  ? { value: "false", label: "NO" }
                                                                  : null
                                                              }
                                                              isLoading={isLoadingSource}
                                                              onChange={(e) => handChangeValueChildrenTypeBlockItem(e, index, ids, idx, "select")}
                                                              // onMenuOpen={() =>}
                                                              placeholder={`Chọn ${ol.name.toLowerCase()}`}
                                                              disabled={disableFieldCommom}
                                                            />
                                                          ) : ol.type === "select" || ol.type === "dropdown" || ol.type === "radio" ? (
                                                            <SelectCustom
                                                              name={ol.name}
                                                              fill={true}
                                                              options={ol.options || []}
                                                              special={ol.type === "dropdown" || ol.type === "select" || ol.type === "radio" ? true : false}
                                                              value={
                                                                ol.value
                                                                  ? {
                                                                      value: +ol.value,
                                                                      label: ol.label
                                                                        ? ol.label
                                                                        : ol.options && ol.options.find((i) => i.value === +ol.value).label,
                                                                    }
                                                                  : null
                                                              }
                                                              isLoading={isLoadingSource}
                                                              onChange={(e) => handChangeValueChildrenTypeBlockItem(e, index, ids, idx, "select")}
                                                              onMenuOpen={() =>
                                                                onSelectOpenChildrenBlockApi(
                                                                  ol.source || ol.path,
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
                                                                    !el.rule.some((li) => li.fieldName === "district_id" && li.value !== ""))) ||
                                                                disableFieldCommom
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
                                                                disabled={disableFieldCommom}
                                                                onChange={(e) => handleChangeValueChildrenBlockDay(e, index, ids, idx)}
                                                                className="founded__day"
                                                              />

                                                              <SelectCustom
                                                                placeholder="Chọn tháng"
                                                                name="foundingMonth"
                                                                fill={true}
                                                                value={+ol.value.split("/")[1]}
                                                                options={months}
                                                                disabled={disableFieldCommom}
                                                                onChange={(e) => handleChangeValueChildrenBlockMonth(e, index, ids, idx)}
                                                                className="founded_month"
                                                              />

                                                              <SelectCustom
                                                                placeholder="Chọn năm"
                                                                name="foundingYear"
                                                                fill={true}
                                                                value={+ol.value.split("/")[2]}
                                                                options={years}
                                                                disabled={disableFieldCommom}
                                                                onChange={(e) => handleChangeValueChildrenBlockYear(e, index, ids, idx)}
                                                                className="founded__day"
                                                              />
                                                            </div>
                                                          )}
                                                        </div>
                                                      </div>
                                                      {!disableFieldCommom && (
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
                                                      )}
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
            {validateRule.rule && <div className="mess__error">Bạn cần chọn ít nhất 1 trường</div>}
          </div>
        </div>

        <ModalFooter actions={actions} />
      </form>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
