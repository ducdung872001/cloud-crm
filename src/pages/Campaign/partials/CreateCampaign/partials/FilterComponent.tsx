import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Tippy from "@tippyjs/react";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Input from "components/input/input";
import Button from "components/button/button";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import NummericInput from "components/input/numericInput";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import { useOnClickOutside } from "utils/hookCustom";
import "./FilterComponent.scss";
import BeautyBranchService from "services/BeautyBranchService";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import DepartmentService from "services/DepartmentService";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import EmployeeService from "services/EmployeeService";
import ImageThirdGender from "assets/images/third-gender.png";
import Checkbox from "components/checkbox/checkbox";
import { showToast } from "utils/common";
import Radio from "components/radio/radio";
import CustomerService from "services/CustomerService";
import { convertParamsToString, createArrayFromTo, createArrayFromToR } from "reborn-util";
import moment from "moment";

interface IFilterAdvancedModalProps {
  onShow: boolean;
  onHide: () => void;
}

interface IDataSales {
  employee: {
    value: number;
    label: string;
    avatar: string;
    departmentName?: string;
    branchName?: string;
  };
  rank: {
    value: number;
    label: string;
  };
}

export default function FilterComponent(props: any) {
  const { onShow, onHide, listRuleData, setListRuleData, dataRule, indexRule } = props;

  const refOptionSpecialize = useRef();
  const refContainerSpecialize = useRef();
  const [isOptionRank, setIsOptionRank] = useState<boolean>(false);
  useOnClickOutside(refOptionSpecialize, () => setIsOptionRank(false), ["option__rank"]);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  useEffect(() => {
    if (dataRule) {
      setFormData(dataRule);
      setListBranchValue(dataRule.listBranchValue);
      setDataDepartment(dataRule.dataDepartment);
      setDepartmentId(dataRule.departmentIds);

      if (dataRule.sales) {
        // const takeSales = JSON.parse(dataRule.sales || "[]");
        const takeSales = dataRule.sales || [];

        if (takeSales?.length > 0) {
          const result = takeSales.map((item) => {
            return {
              employee: {
                value: item.employeeId,
                label: item.employeeName,
                avatar: item.employeeAvatar,
                departmentName: item.departmentName,
                branchName: item.branchName,
              },

              rank: {
                value: item.rank,
                label: item.rank == 5 ? "Trung bình" : item.rank == 6 ? "Khá" : item.rank == 8 ? "Tốt" : "Xuất sắc",
              },
            };
          });

          setListSales(result);
        }
      }
    }
  }, [dataRule, onShow]);

  const optionDivisionMethod_2 = [
    {
      value: "1",
      label: "Phân chia theo năng lực bán hàng",
    },
    {
      value: "3",
      label: "Phân chia đều cơ hội",
    },
    {
      value: "2",
      label: "Phân chia theo tỉ lệ chốt đơn",
    },
  ];

  const lstConditionField = [
    // { value: "in", label: "In" },
    { value: "nin", label: "Nin" },
    { value: "eq", label: "Equal" },
    { value: "like", label: "Like" },
    { value: "ne", label: "Not_Equal" },
    { value: "gt", label: "Greater_Than" },
    { value: "lt", label: "Less_Than" },
    { value: "gte", label: "Greater_Than_Or_Equal" },
    { value: "lte", label: "Less_Than_Or_Equal" },
    { value: "none", label: "None" },
  ];

  const defaultBlockRule = {
    logical: "and",
    rule: [],
    blockRule: [],
  };

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
  ];

  const rankData = [
    {
      label: "Trung bình",
      value: 5,
    },
    {
      label: "Khá",
      value: 6,
    },
    {
      label: "Tốt",
      value: 8,
    },
    {
      label: "Xuất sắc",
      value: 10,
    },
  ];

  const [lstFieldFilter, setLstFieldFilter] = useState(defaultFieldFilter);

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
      if (dataRule && onShow) {
        const transformedSegment = await transformSegment(dataRule, lstFieldFilter);
        setChangeDataProps(transformedSegment);
      }
    };

    transformData();
  }, [dataRule, onShow, lstFieldFilter]);

  const defaultFormData = {
    name: "",
    divisionMethod: 1,
    logical: "and",
    rule: [],
    blockRule: [],

    branches0: [],
    branches1: [],
    branches2: [],
    branches3: [],
    branches4: [],
    listBranchValue: [],
    departmentIds: [],
    dataDepartment: [],
    isAllEmployee: 0,
    sales: [],
  };

  const [formData, setFormData] = useState(defaultFormData);

  //! đoạn này xử lý lấy năm
  const [years, setYears] = useState<any[]>(
    createArrayFromToR(new Date().getFullYear(), 1963).map((item, idx) => {
      return {
        value: +item,
        label: item,
      };
    })
  );

  //! đoạn này xử lý lấy tháng
  const [months, setMonths] = useState<any[]>(
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
  const [days, setDays] = useState<any[]>(
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
    setCheckFieldRule(false);

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
    setCheckFieldRule(false);
    
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
    setCheckFieldRule(false);
    
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
    setCheckFieldRule(false);

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
    setCheckFieldRule(false);
    
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
    setCheckFieldRule(false);

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
    setCheckFieldRule(false);
    
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

  ///chi nhánh

  const [listBranchId, setListBranchId] = useState({
    level0: [],
    level1: [],
    level2: [],
    level3: [],
    level4: [],
  });

  const [listBranchValue, setListBranchValue] = useState([
    {
      id: "level_0",
      value: [],
    },
  ]);

  useEffect(() => {
    setFormData({
      ...formData,
      branches0: listBranchId.level0,
      branches1: listBranchId.level1,
      branches2: listBranchId.level2,
      branches3: listBranchId.level3,
      branches4: listBranchId.level4,
      listBranchValue: listBranchValue,
    });
  }, [listBranchId, listBranchValue]);

  const [listBranchDeleted0, setListBranchDelete0] = useState([]);

  const [listBranchDeleted1, setListBranchDelete1] = useState([]);

  const [listBranchDeleted2, setListBranchDelete2] = useState([]);

  const [listBranchDeleted3, setListBranchDelete3] = useState([]);

  useEffect(() => {
    if (listBranchValue && listBranchValue.length > 0) {
      let idArray_0 = [];
      let idArray_1 = [];
      let idArray_2 = [];
      let idArray_3 = [];
      let idArray_4 = [];

      listBranchValue.map((item) => {
        if (item.id === "level_0") {
          idArray_0 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }
        if (item.id === "level_1") {
          idArray_1 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }
        if (item.id === "level_2") {
          idArray_2 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }
        if (item.id === "level_3") {
          idArray_3 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }
        if (item.id === "level_4") {
          idArray_4 =
            item.value.length > 0
              ? item.value.map((el) => {
                  return el.value;
                })
              : [];
        }

        setListBranchId({
          level0: idArray_0,
          level1: idArray_1,
          level2: idArray_2,
          level3: idArray_3,
          level4: idArray_4,
        });
      });
    }
  }, [listBranchValue]);

  const loadedOptionBranchLevel_0 = async (search, loadedOptions, { page }) => {
    const param: IBeautyBranchFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);
    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
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
  const loadedOptionBranchLevel_1 = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      lstId: listBranchId.level0,
    };
    const response = await BeautyBranchService.childList(param);
    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  parentId: item.parentId,
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
  const loadedOptionBranchLevel_2 = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      lstId: listBranchId.level1,
    };
    const response = await BeautyBranchService.childList(param);
    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  parentId: item.parentId,
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
  const loadedOptionBranchLevel_3 = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      lstId: listBranchId.level2,
    };
    const response = await BeautyBranchService.childList(param);
    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  parentId: item.parentId,
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
  const loadedOptionBranchLevel_4 = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      lstId: listBranchId.level3,
    };
    const response = await BeautyBranchService.childList(param);
    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  parentId: item.parentId,
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

  //reload lại danh sách option chi nhánh của các cấp
  useEffect(() => {
    if (listBranchId.level0.length > 0) {
      loadedOptionBranchLevel_1("", undefined, { page: 1 });
    }
    if (listBranchId.level1.length > 0) {
      loadedOptionBranchLevel_2("", undefined, { page: 1 });
    }
    if (listBranchId.level2.length > 0) {
      loadedOptionBranchLevel_3("", undefined, { page: 1 });
    }
    if (listBranchId.level3.length > 0) {
      loadedOptionBranchLevel_4("", undefined, { page: 1 });
    }
  }, [listBranchId]);

  const handleChangeValueBranch = (e, ind) => {
    // setValueBranch(e);
    setCheckFieldBranch(false);

    setListBranchValue((current) =>
      current.map((obj, index) => {
        if (index === ind) {
          return { ...obj, value: e };
        }
        return obj;
      })
    );

    //lấy ra branchId bị xoá đi
    const branchIdArray = e.map((item) => {
      return item.value;
    });

    const listBranch = [...listBranchValue];
    const arrayBranch = listBranch[ind];

    if (arrayBranch.value.length > 0) {
      arrayBranch.value.map((item) => {
        if (ind === 0 && !branchIdArray.includes(item.value)) {
          // setListBranchDelete0(item.value);
          setListBranchDelete0((oldArray) => [...oldArray, item.value]);
        }
        if (ind === 1 && !branchIdArray.includes(item.value)) {
          setListBranchDelete1((oldArray) => [...oldArray, item.value]);
        }
        if (ind === 2 && !branchIdArray.includes(item.value)) {
          setListBranchDelete2((oldArray) => [...oldArray, item.value]);
        }
        if (ind === 3 && !branchIdArray.includes(item.value)) {
          setListBranchDelete3((oldArray) => [...oldArray, item.value]);
        }
      });
    }
  };

  //Xoá 1 chi nhánh ở level 0
  useEffect(() => {
    if (listBranchDeleted0 && listBranchDeleted0.length > 0 && listBranchValue.length >= 2) {
      let newlistBranch1 = [...listBranchValue[1].value];

      let newListBranchDeleted1 = [];
      if (listBranchValue[1].value.length > 0) {
        listBranchDeleted0.map((item) => {
          const array = newlistBranch1.filter((el) => el.parentId !== item) || [];
          newlistBranch1 = array;

          const arrayDeleted = listBranchValue[1].value.filter((el) => el.parentId === item) || [];
          if (arrayDeleted.length > 0) {
            arrayDeleted.map((el) => {
              newListBranchDeleted1.push(el.value);
            });
          }
        });
      }

      setListBranchValue((current) =>
        current.map((obj, index) => {
          if (index === 1) {
            return { ...obj, value: newlistBranch1 };
          }
          return obj;
        })
      );
      if (listBranchValue.length > 2) {
        setListBranchDelete1(newListBranchDeleted1);
      }

      setTimeout(() => {
        setListBranchDelete0([]);
      }, 1000);
    }
  }, [listBranchDeleted0]);

  //Xoá 1 chi nhánh ở level 1
  useEffect(() => {
    if (listBranchDeleted1 && listBranchDeleted1.length > 0 && listBranchValue.length >= 3) {
      let newlistBranch2 = [...listBranchValue[2].value];
      let newListBranchDeleted2 = [];
      if (listBranchValue[2].value.length > 0) {
        listBranchDeleted1.map((item) => {
          const array = newlistBranch2.filter((el) => el.parentId !== item) || [];
          newlistBranch2 = array;

          const arrayDeleted = listBranchValue[2].value.filter((el) => el.parentId === item) || [];
          if (arrayDeleted.length > 0) {
            arrayDeleted.map((el) => {
              newListBranchDeleted2.push(el.value);
            });
          }
        });
      }

      setListBranchValue((current) =>
        current.map((obj, index) => {
          if (index === 2) {
            return { ...obj, value: newlistBranch2 };
          }
          return obj;
        })
      );
      if (listBranchValue.length > 3) {
        setListBranchDelete2(newListBranchDeleted2);
      }

      setTimeout(() => {
        setListBranchDelete1([]);
      }, 1000);
    }
  }, [listBranchDeleted1]);

  //Xoá 1 chi nhánh ở level 2
  useEffect(() => {
    if (listBranchDeleted2 && listBranchDeleted2.length > 0 && listBranchValue.length >= 4) {
      let newlistBranch3 = [...listBranchValue[3].value];
      let newListBranchDeleted3 = [];
      if (listBranchValue[3].value.length > 0) {
        listBranchDeleted2.map((item) => {
          const array = newlistBranch3.filter((el) => el.parentId !== item) || [];
          newlistBranch3 = array;

          const arrayDeleted = listBranchValue[3].value.filter((el) => el.parentId === item) || [];
          if (arrayDeleted.length > 0) {
            arrayDeleted.map((el) => {
              newListBranchDeleted3.push(el.value);
            });
          }
        });
      }
      setListBranchValue((current) =>
        current.map((obj, index) => {
          if (index === 3) {
            return { ...obj, value: newlistBranch3 };
          }
          return obj;
        })
      );
      if (listBranchValue.length > 4) {
        setListBranchDelete3(newListBranchDeleted3);
      }
      setTimeout(() => {
        setListBranchDelete2([]);
      }, 1000);
    }
  }, [listBranchDeleted2]);

  //Xoá 1 chi nhánh ở level 3
  useEffect(() => {
    if (listBranchDeleted3 && listBranchDeleted3.length > 0 && listBranchValue.length >= 5) {
      let newlistBranch4 = [...listBranchValue[4].value];
      if (listBranchValue[4].value.length > 0) {
        listBranchDeleted3.map((item) => {
          const array = newlistBranch4.filter((el) => el.parentId !== item) || [];
          newlistBranch4 = array;
        });
      }
      setListBranchValue((current) =>
        current.map((obj, index) => {
          if (index === 4) {
            return { ...obj, value: newlistBranch4 };
          }
          return obj;
        })
      );
      setTimeout(() => {
        setListBranchDelete3([]);
      }, 1000);
    }
  }, [listBranchDeleted3]);

  const handleRemoveBranch = (index) => {
    const newArray = [...listBranchValue];
    newArray.splice(index, 1);
    setListBranchValue(newArray);
  };

  // lấy phong ban
  const [dataDepartment, setDataDepartment] = useState([]);
  const [listDepartmentId, setDepartmentId] = useState([]);
  const [listDepartment, setListDeparment] = useState([]);

  useEffect(() => {
    setFormData({ ...formData, departmentIds: listDepartmentId, dataDepartment: dataDepartment });
  }, [listDepartmentId, dataDepartment]);

  const loadedOptionDepartment = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      // page: page,
      limit: 1000,
      // branchId: dataBranch.value,
      lstLevel0: listBranchId.level0,
      lstLevel1: listBranchId.level1,
      lstLevel2: listBranchId.level2,
      lstLevel3: listBranchId.level3,
      lstLevel4: listBranchId.level4,
    };

    const response = await DepartmentService.list_branch(param);

    if (response.code === 0) {
      const dataOption = response.result || [];
      let optionDepartment = [];

      if (dataOption.length > 0) {
        optionDepartment = [
          {
            value: -1,
            label: "Tất cả phòng ban",
            branchName: "",
          },
        ];

        dataOption.map((item) => {
          optionDepartment.push({
            value: item.id,
            label: item.name,
            branchName: item.branchName,
          });
        });
      }

      setListDeparment(optionDepartment);
      return {
        options: optionDepartment,
        // options: [
        //   ...(dataOption.length > 0
        //     ? dataOption.map((item) => {
        //       return {
        //         value: item.id,
        //         label: item.name,
        //         branchName: item.branchName
        //       };
        //     })
        //     : []),
        // ],
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const formatOptionLabelDepartment = ({ label, branchName }) => {
    return <div style={{ paddingTop: 0.5, paddingBottom: 0.5 }}>{branchName ? `${label} (${branchName})` : `${label}`}</div>;
  };

  useEffect(() => {
    loadedOptionDepartment("", undefined, { page: 1 });
  }, [listBranchId]);

  const handleChangeValueDepartment = (e, listDepartment) => {
    if (e.length > 0) {
      if (e[e.length - 1].value === -1) {
        const arrayDepartment = listDepartment.filter((el) => el.value !== -1) || [];
        if (arrayDepartment.length > 0) {
          const newDeptIdlist = arrayDepartment.map((item) => {
            return item.value;
          });
          setDepartmentId(newDeptIdlist);
        }
        // setDepartmentId([-1])
        setDataDepartment([
          {
            value: -1,
            label: "Tất cả phòng ban",
            branchName: "",
          },
        ]);
      } else {
        const arrayDepartment = e.filter((el) => el.value !== -1);
        const newDeptIdlist = arrayDepartment.map((item) => {
          return item.value;
        });
        setDepartmentId(newDeptIdlist);
        setDataDepartment(arrayDepartment);
      }
    } else {
      setDepartmentId([]);
      setDataDepartment(e);
    }
  };

  const [listSales, setListSales] = useState<IDataSales[]>([]);
  const [allSales, setAllSales] = useState([{ employeeId: -1, rank: -1 }]);
  const [selectAllSales, setSelectAllSales] = useState(false);
  const [checkFieldSales, setCheckFieldSales] = useState<boolean>(false);
  const [lstIdSale, setLstIdSale] = useState([]);
  const [indexSale, setIndexSale] = useState<number>(null);
  const [checkFieldRule, setCheckFieldRule] = useState<boolean>(false);
  const [checkFieldBranch, setCheckFieldBranch] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionSales = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      LstId: listDepartmentId,
    };

    const response = await EmployeeService.list_department(param);

    if (response.code === 0) {
      const dataOption = (response.result.items || []).filter((item) => {
        return !lstIdSale.some((el) => el === item.id);
      });

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                  departmentName: item.departmentName,
                  branchName: item.branchName,
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

  useEffect(() => {
    loadedOptionSales("", undefined, { page: 1 });
  }, [listDepartmentId]);

  const formatOptionLabelSales = ({ label, avatar, departmentName, branchName }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        <div>
          <div>{label}</div>
          <div>
            <span style={{ fontSize: 10, fontWeight: "200", marginTop: 3 }}>{`${departmentName} (${branchName})`}</span>
          </div>
        </div>
      </div>
    );
  };

  const handleChangeValueSales = (e, idx) => {
    setCheckFieldSales(false);

    setListSales((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, employee: e };
        }
        return obj;
      })
    );
  };

  useEffect(() => {
    if (listSales.length > 0) {
      const result = listSales.map((item) => {
        if (item.employee) {
          return item.employee?.value;
        } else {
          return [];
        }
      });
      setLstIdSale([...result]);
    }
  }, [listSales]);

  //! Xóa đi một người bán
  const handleRemoveSale = (idx) => {
    const result = [...listSales];
    result.splice(idx, 1);
    setListSales(result);
    setLstIdSale(() => {
      return result.map((item) => item.employee?.value);
    });
    setCheckFieldSales(false);
  };

  useEffect(() => {
    if (selectAllSales) {
      setFormData({ ...formData, sales: [] });
    } else {
      // if (listSales.length > 0) {
      const result = listSales.map((item) => {
        return {
          employeeId: item.employee?.value,
          employeeName: item.employee?.label,
          departmentName: item.employee?.departmentName,
          branchName: item.employee?.branchName,
          rank: item.rank?.value,
        };
      });

      setFormData({ ...formData, sales: result });
      // }
    }
  }, [listSales, selectAllSales]);

  // Hàm kiểm tra giá trị rule có hợp lệ không
  const validateRuleValue = (rule) => {
    if (rule.operator === "none") {
      return true;
    }
    
    if (!rule.value && rule.value !== 0) {
      return false;
    }
    if (typeof rule.value === "string" && rule.value.trim() === "") {
      return false;
    }
    if (Array.isArray(rule.value) && rule.value.length === 0) {
      return false;
    }
    return true;
  };

  // Hàm kiểm tra tất cả rules trong một mảng
  const validateRules = (rules) => {
    if (!rules || rules.length === 0) {
      return false;
    }
    return rules.every((rule) => validateRuleValue(rule));
  };

  const validateBlockRules = (blockRules) => {
    if (!blockRules || blockRules.length === 0) {
      return true; 
    }
    return blockRules.every((block) => {
      const rulesValid = validateRules(block.rule);
      const childrenValid = validateBlockRules(block.blockRule);
      return rulesValid && childrenValid;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Reset validation errors
    setCheckFieldRule(false);
    setCheckFieldBranch(false);

    // Validate điều kiện lọc
    const hasRules = formData.rule && formData.rule.length > 0;
    const rulesValid = hasRules && validateRules(formData.rule);
    const blockRulesValid = validateBlockRules(formData.blockRule);

    if (!hasRules || !rulesValid || !blockRulesValid) {
      setCheckFieldRule(true);
      showToast("Vui lòng thêm ít nhất một điều kiện lọc và điền đầy đủ giá trị", "error");
      return;
    }

    // Validate chi nhánh
    const hasBranchSelected =
      listBranchId.level0.length > 0 ||
      listBranchId.level1.length > 0 ||
      listBranchId.level2.length > 0 ||
      listBranchId.level3.length > 0 ||
      listBranchId.level4.length > 0;

    if (!hasBranchSelected) {
      setCheckFieldBranch(true);
      showToast("Vui lòng chọn ít nhất một chi nhánh", "error");
      return;
    }

    if (dataRule) {
      const newData = [...listRuleData];
      newData[indexRule] = formData;
      setListRuleData(newData);
    } else {
      setListRuleData((oldArray) => [...oldArray, formData]);
    }

    onHide(false);
    setFormData(defaultFormData);
    setDataDepartment([]);
    setDepartmentId([]);
    setListBranchValue([
      {
        id: "level_0",
        value: [],
      },
    ]);
    setListBranchId({
      level0: [],
      level1: [],
      level2: [],
      level3: [],
      level4: [],
    });
    setListBranchDelete0([]);
    setListBranchDelete1([]);
    setListBranchDelete2([]);
    setListBranchDelete3([]);
    setCheckFieldSales(false);
    setCheckFieldRule(false);
    setCheckFieldBranch(false);
    setLstIdSale([]);
    setListSales([]);
  };

  const handClearForm = () => {
    if (listRuleData.length === 0) {
      onHide(true);
    } else {
      onHide(false);
    }

    setFormData(defaultFormData);
    setDataDepartment([]);
    setDepartmentId([]);
    setListBranchValue([
      {
        id: "level_0",
        value: [],
      },
    ]);
    setListBranchId({
      level0: [],
      level1: [],
      level2: [],
      level3: [],
      level4: [],
    });
    setListBranchDelete0([]);
    setListBranchDelete1([]);
    setListBranchDelete2([]);
    setListBranchDelete3([]);
    setCheckFieldSales(false);
    setCheckFieldRule(false);
    setCheckFieldBranch(false);
    setLstIdSale([]);
    setListSales([]);
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
              handClearForm();
            },
          },
          {
            title: dataRule ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, dataRule]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="lg"
        toggle={() => !isSubmit && onHide()}
        className="modal__filter--advanced"
      >
        <form className="form__filter--advanced-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${dataRule ? "Chỉnh sửa" : "Tạo mới"} luật`} toggle={() => !isSubmit && handClearForm()} />
          <ModalBody>
            <div className="content__filter--advanced">
              <div className="form-group">
                <Input
                  name="name"
                  value={formData.name}
                  label="Tên luật"
                  fill={true}
                  required={true}
                  placeholder="Nhập tên luật"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <span className="name-group">Điều kiện lọc</span>
                {checkFieldRule && (
                  <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                    Vui lòng thêm ít nhất một điều kiện lọc và điền đầy đủ giá trị
                  </div>
                )}
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
                      >
                        AND
                      </Button>
                      <Button
                        color={formData.logical === "or" ? "primary" : "secondary"}
                        onClick={(e) => {
                          e.preventDefault();
                          setFormData({ ...formData, logical: "or" });
                        }}
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
                      >
                        <Icon name="PlusCircleFill" />
                      </Button>
                    </div>

                    <div className="including__conditions">
                      {/* đoạn này là chọn các trường để fill xuống dưới */}
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
                                        options={lstConditionField}
                                        onChange={(e) => handleChangeValueCondition(e, idx)}
                                      />
                                    </div>

                                    <div className="info-item">
                                      {item.type === "text" ? (
                                        <Input
                                          name={item.name}
                                          fill={true}
                                          value={item.value}
                                          onChange={(e) => handChangeValueTypeItem(e, idx, "input")}
                                          placeholder={`Nhập ${item.name.toLowerCase()}`}
                                        />
                                      ) : item.type === "number" ? (
                                        <NummericInput
                                          name={item.name}
                                          fill={true}
                                          value={item.value}
                                          thousandSeparator={true}
                                          onValueChange={(e) => handChangeValueTypeItem(e, idx, "number")}
                                          placeholder={`Nhập ${item.name.toLowerCase()}`}
                                        />
                                      ) : item.type === "date" ? (
                                        <DatePickerCustom
                                          name={item.name}
                                          fill={true}
                                          value={item.value}
                                          iconPosition="left"
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
                                            options={days}
                                            onChange={(e) => handleChangeValueDay(e, idx)}
                                            className="founded__day"
                                          />

                                          <SelectCustom
                                            placeholder="Chọn tháng"
                                            name="foundingMonth"
                                            fill={true}
                                            value={+item.value.split("/")[1]}
                                            options={months}
                                            onChange={(e) => handleChangeValueMonth(e, idx)}
                                            className="founded_month"
                                          />

                                          <SelectCustom
                                            placeholder="Chọn năm"
                                            name="foundingYear"
                                            fill={true}
                                            value={+item.value.split("/")[2]}
                                            options={years}
                                            onChange={(e) => handleChangeValueYear(e, idx)}
                                            className="founded__day"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="action__delete--rule">
                                    <Tippy content="Xóa">
                                      <span className="icon__delete" onClick={() => handleDeleteItemField(idx)}>
                                        <Icon name="Trash" />
                                      </span>
                                    </Tippy>
                                  </div>
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
                                >
                                  AND
                                </Button>
                                <Button
                                  color={item.logical === "or" ? "primary" : "secondary"}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handChangeLogical(idx, "or");
                                  }}
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
                                >
                                  <Icon name="Trash" />
                                </Button>
                              </div>

                              <div className="including__conditions">
                                {/* đoạn này là chọn các trường để fill xuống dưới */}
                                <div className={`lst__option--group-field`}>
                                  <div
                                    className={`choose-field ${isShowFieldBlock && idx === idxFieldBlock ? "show__field--choose" : ""}`}
                                    ref={refBlockOptionFieldContainer}
                                    onClick={() => {
                                      setIsShowFieldBlock(true);
                                      setIdxFieldBlock(idx);
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
                                                  options={lstConditionField}
                                                  onChange={(e) => handleChangeValueBlockCondition(e, index, idx)}
                                                />
                                              </div>

                                              <div className="info-item">
                                                {el.type === "text" ? (
                                                  <Input
                                                    name={el.name}
                                                    fill={true}
                                                    value={el.value}
                                                    onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "input")}
                                                    placeholder={`Nhập ${el.name.toLowerCase()}`}
                                                  />
                                                ) : el.type === "number" ? (
                                                  <NummericInput
                                                    name={el.name}
                                                    fill={true}
                                                    value={el.value}
                                                    thousandSeparator={true}
                                                    onValueChange={(e) => handChangeValueTypeBlockItem(e, index, idx, "number")}
                                                    placeholder={`Nhập ${el.name.toLowerCase()}`}
                                                  />
                                                ) : el.type === "date" ? (
                                                  <DatePickerCustom
                                                    name={el.name}
                                                    fill={true}
                                                    value={el.value}
                                                    iconPosition="left"
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
                                                      onChange={(e) => handleChangeValueBlockDay(e, index, idx)}
                                                      className="founded__day"
                                                    />

                                                    <SelectCustom
                                                      placeholder="Chọn tháng"
                                                      name="foundingMonth"
                                                      fill={true}
                                                      value={+el.value.split("/")[1]}
                                                      options={months}
                                                      onChange={(e) => handleChangeValueBlockMonth(e, index, idx)}
                                                      className="founded_month"
                                                    />

                                                    <SelectCustom
                                                      placeholder="Chọn năm"
                                                      name="foundingYear"
                                                      fill={true}
                                                      value={+el.value.split("/")[2]}
                                                      options={years}
                                                      onChange={(e) => handleChangeValueBlockYear(e, index, idx)}
                                                      className="founded__day"
                                                    />
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            <div className="action__delete--rule">
                                              <Tippy content="Xóa">
                                                <span className="icon__delete" onClick={() => handleDeleteBlockItemField(index, idx)}>
                                                  <Icon name="Trash" />
                                                </span>
                                              </Tippy>
                                            </div>
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
                                              >
                                                AND
                                              </Button>
                                              <Button
                                                color={el.logical === "or" ? "primary" : "secondary"}
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  handChangeChildrenLogical(ids, idx, "or");
                                                }}
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
                                                    setIsShowFieldChildrenBlock(true);
                                                    setIdxFieldChildrenBlock(idx);
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
                                                                options={lstConditionField}
                                                                onChange={(e) => handleChangeValueChildrenBlockCondition(e, index, ids, idx)}
                                                              />
                                                            </div>

                                                            <div className="info-item">
                                                              {ol.type === "text" ? (
                                                                <Input
                                                                  name={ol.name}
                                                                  fill={true}
                                                                  value={ol.value}
                                                                  onChange={(e) => handChangeValueChildrenTypeBlockItem(e, index, ids, idx, "input")}
                                                                  placeholder={`Nhập ${ol.name.toLowerCase()}`}
                                                                />
                                                              ) : ol.type === "number" ? (
                                                                <NummericInput
                                                                  name={ol.name}
                                                                  fill={true}
                                                                  value={ol.value}
                                                                  thousandSeparator={true}
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
                                                                  onChange={(e) => handChangeValueChildrenTypeBlockItem(e, index, ids, idx, "select")}
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
                                                                    onChange={(e) => handleChangeValueChildrenBlockDay(e, index, ids, idx)}
                                                                    className="founded__day"
                                                                  />

                                                                  <SelectCustom
                                                                    placeholder="Chọn tháng"
                                                                    name="foundingMonth"
                                                                    fill={true}
                                                                    value={+ol.value.split("/")[1]}
                                                                    options={months}
                                                                    onChange={(e) => handleChangeValueChildrenBlockMonth(e, index, ids, idx)}
                                                                    className="founded_month"
                                                                  />

                                                                  <SelectCustom
                                                                    placeholder="Chọn năm"
                                                                    name="foundingYear"
                                                                    fill={true}
                                                                    value={+ol.value.split("/")[2]}
                                                                    options={years}
                                                                    onChange={(e) => handleChangeValueChildrenBlockYear(e, index, ids, idx)}
                                                                    className="founded__day"
                                                                  />
                                                                </div>
                                                              )}
                                                            </div>
                                                          </div>
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

              <div className="option_select">
                {optionDivisionMethod_2.map((item, index) => (
                  <div key={index}>
                    <Radio
                      value={item.value}
                      label={item.label}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, divisionMethod: +value });
                      }}
                      checked={formData.divisionMethod === +item.value}
                    />
                  </div>
                ))}
              </div>

              <div className="container_branch_department_sale">
                <div style={{ marginTop: "2rem" }}>
                  <div style={{ marginBottom: "8px" }}>
                    {checkFieldBranch && (
                      <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                        Vui lòng chọn ít nhất một chi nhánh
                      </div>
                    )}
                  </div>
                  {listBranchValue.map((item, index) => {
                    return (
                      <div key={index} className="box_branch" style={index > 0 ? { marginTop: 20 } : {}}>
                        <div className="select_branch">
                          <SelectCustom
                            key={
                              index === 1
                                ? listBranchId.level0.length
                                : index === 2
                                ? listBranchId.level1.length
                                : index === 3
                                ? listBranchId.level2.length
                                : index === 4
                                ? listBranchId.level3.length
                                : "no"
                            }
                            id="branchId"
                            name="branchId"
                            label={index === 0 ? "Chi nhánh" : ""}
                            options={[]}
                            fill={true}
                            isMulti={true}
                            value={item.value}
                            required={true}
                            disabled={
                              index === 1
                                ? listBranchId.level0.length === 0
                                  ? true
                                  : false
                                : index === 2
                                ? listBranchId.level1.length === 0
                                  ? true
                                  : false
                                : index === 3
                                ? listBranchId.level2.length === 0
                                  ? true
                                  : false
                                : index === 4
                                ? listBranchId.level3.length === 0
                                  ? true
                                  : false
                                : false
                            }
                            onChange={(e) => handleChangeValueBranch(e, index)}
                            isAsyncPaginate={true}
                            isFormatOptionLabel={true}
                            placeholder="Chọn chi nhánh"
                            additional={{
                              page: 1,
                            }}
                            loadOptionsPaginate={
                              index === 0
                                ? loadedOptionBranchLevel_0
                                : index === 1
                                ? loadedOptionBranchLevel_1
                                : index === 2
                                ? loadedOptionBranchLevel_2
                                : index === 3
                                ? loadedOptionBranchLevel_3
                                : index === 4
                                ? loadedOptionBranchLevel_4
                                : ""
                            }
                            error={index === 0 && checkFieldBranch}
                          />
                        </div>

                        {index === 0 ? (
                          listBranchValue.length === 5 ? null : (
                            <div
                              className="action__add--branch_field"
                              onClick={() => {
                                setListBranchValue([
                                  ...listBranchValue,
                                  {
                                    id: `level_${listBranchValue.length}`,
                                    value: [],
                                  },
                                ]);
                              }}
                            >
                              <Icon name="PlusCircleFill" />
                            </div>
                          )
                        ) : index === listBranchValue.length - 1 ? (
                          <div className="action__remove--branch_field" title="Xóa" onClick={() => handleRemoveBranch(index)}>
                            <Icon name="Trash" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: "2rem" }}>
                  <SelectCustom
                    key={
                      listBranchId.level0.length ||
                      listBranchId.level1.length ||
                      listBranchId.level2.length ||
                      listBranchId.level3.length ||
                      listBranchId.level4.length
                    }
                    id="departmentId"
                    name="departmentId"
                    label="Phòng ban"
                    options={[]}
                    fill={true}
                    isMulti={true}
                    disabled={
                      listBranchId.level0.length === 0 &&
                      listBranchId.level1.length === 0 &&
                      listBranchId.level2.length === 0 &&
                      listBranchId.level3.length === 0 &&
                      listBranchId.level4.length === 0
                        ? true
                        : false
                    }
                    value={dataDepartment}
                    required={false}
                    onChange={(e) => handleChangeValueDepartment(e, listDepartment)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    placeholder="Chọn phòng ban"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionDepartment}
                    formatOptionLabel={formatOptionLabelDepartment}
                    // error={checkFieldEmployee}
                    // message="Người phụ trách không được bỏ trống"
                  />
                </div>

                <div className="wrapper__sales">
                  <h4>Danh sách người bán</h4>
                  {listDepartmentId.length > 0 ? (
                    <div>
                      <Checkbox
                        // value="-1"
                        label="Tất cả nhân viên"
                        onChange={(e) => {
                          if (selectAllSales === true) {
                            setSelectAllSales(false);
                            setFormData({ ...formData, isAllEmployee: 0 });
                          } else if (selectAllSales === false) {
                            setSelectAllSales(true);
                            setListSales([]);
                            setCheckFieldSales(false);
                            setFormData({ ...formData, isAllEmployee: 1 });
                          }
                        }}
                        checked={selectAllSales}
                      />
                    </div>
                  ) : null}
                  <div className="list__sales">
                    <div
                      className="action__add--sales"
                      onClick={() => {
                        if (listDepartmentId.length > 0) {
                          setListSales([...listSales, { employee: null, rank: { label: "Khá", value: 6 } }]);
                          setSelectAllSales(false);
                        } else {
                          showToast("Vui lòng chọn phòng ban", "error");
                        }
                      }}
                    >
                      <Icon
                        name="PlusCircleFill"
                        style={{ fill: listDepartmentId.length > 0 ? "var(--primary-color-90)" : "var(--extra-color-50)" }}
                      />
                      Thêm người bán
                    </div>

                    {listSales.map((item, idx) => {
                      return (
                        <div key={idx} className="item__sales">
                          <div className="info__detail--sale">
                            <SelectCustom
                              key={listDepartmentId.length}
                              id="saleId"
                              name="saleId"
                              options={[]}
                              fill={true}
                              disabled={listDepartmentId.length > 0 ? false : true}
                              value={item.employee}
                              required={true}
                              onChange={(e) => handleChangeValueSales(e, idx)}
                              isAsyncPaginate={true}
                              isFormatOptionLabel={true}
                              placeholder="Chọn người bán"
                              additional={{
                                page: 1,
                              }}
                              loadOptionsPaginate={loadedOptionSales}
                              formatOptionLabel={formatOptionLabelSales}
                              error={item.employee ? false : checkFieldSales}
                              message="Vui lòng chọn người bán"
                            />

                            <div
                              className={`option__rank ${isOptionRank && indexSale == idx ? "prioritize" : ""}`}
                              ref={refContainerSpecialize}
                              style={item.employee ? { height: "4.25rem" } : { height: "3.8rem" }}
                            >
                              <div
                                className="select__rank"
                                onClick={() => {
                                  setIsOptionRank(!isOptionRank);
                                  setIndexSale(idx);
                                }}
                              >
                                {item.rank?.label}
                                <Icon name="ChevronDown" />
                              </div>

                              {isOptionRank && indexSale == idx && (
                                <ul className="menu__option--rank" ref={refOptionSpecialize}>
                                  {rankData.map((el, index) => (
                                    <li
                                      key={index}
                                      className={`item--rank ${item.rank?.value === el.value ? "active__item--rank" : ""}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setListSales((current) =>
                                          current.map((obj, i) => {
                                            if (i === idx) {
                                              return { ...obj, rank: el };
                                            }
                                            return obj;
                                          })
                                        );
                                        setIsOptionRank(false);
                                      }}
                                    >
                                      {el.label}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>

                          {/* {listSales.length > 1 && ( */}
                          <div className="action__remove--sale" title="Xóa" onClick={() => handleRemoveSale(idx)}>
                            <Icon name="Trash" />
                          </div>
                          {/* )} */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
