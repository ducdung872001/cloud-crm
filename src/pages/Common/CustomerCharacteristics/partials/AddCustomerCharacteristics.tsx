import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { convertParamsToString, createArrayFromTo, createArrayFromToR } from "reborn-util";
import Icon from "components/icon";
import Input from "components/input/input";
import Button from "components/button/button";
import SelectCustom from "components/selectCustom/selectCustom";
import NummericInput from "components/input/numericInput";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import { useOnClickOutside } from "utils/hookCustom";
import { showToast } from "utils/common";
import ObjectFeatureService from "services/ObjectFeatureService";
import CustomerService from "services/CustomerService";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import "./AddCustomerCharacteristics.scss";

interface IAddCustomerCharacteristicsProps {
  data: any;
  idProduct?: number;
  idService?: number;
  onShow: boolean;
  onReload: (reload: boolean) => void;
  disableFieldCommom: boolean;
  objectType: number;
  hasSubmitForm: boolean;
  handBackup: (isBackup) => void;
}

export default function AddCustomerCharacteristics(props: IAddCustomerCharacteristicsProps) {
  const { data, onShow, onReload, disableFieldCommom, objectType, hasSubmitForm, idProduct, idService, handBackup } = props;

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

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

  const [isShowField, setIsShowField] = useState<boolean>(false);
  const [idxFieldGrandchild, setIdxFieldGrandchild] = useState<number>(null);

  const [isShowFieldBlock, setIsShowFieldBlock] = useState<boolean>(false);

  const [idxFieldChildrenBlock, setIdxFieldChildrenBlock] = useState<number>(null);
  const [isShowFieldChildrenBlock, setIsShowFieldChildrenBlock] = useState<boolean>(false);

  const refOptionField = useRef();
  const refOptionFieldContainer = useRef();

  const refChildrenBlockOptionField = useRef();
  const refChildrenBlockOptionFieldContainer = useRef();

  useOnClickOutside(refOptionField, () => setIsShowField(false), ["lst__option--group"]);

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
        const changeData = {
          ...data,
          blockRule: JSON.parse(data.criteria),
        };

        delete changeData.criteria;

        const transformedSegment = await transformSegment(changeData, lstFieldFilter);
        setChangeDataProps(transformedSegment);
      }
    };

    transformData();
  }, [data, onShow, lstFieldFilter]);

  const values = useMemo(
    () =>
      ({
        objectId: idProduct || idService,
        name: changeDataProps ? changeDataProps.name : "",
        weight: changeDataProps ? changeDataProps.weight : "",
        objectType: objectType,
        blockRule: changeDataProps ? changeDataProps.blockRule : [defaultBlockRule],
        lastProcessId: 0,
      } as any),
    [changeDataProps, onShow, objectType, defaultBlockRule, idProduct, idService]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    if (changeDataProps) {
      setFormData(values);
    }
  }, [changeDataProps]);

  const handClearForm = () => {
    setChangeDataProps(null);
    setFormData(values);
  };

  // const showDialogConfirmCancel = () => {
  //   const contentDialog: IContentDialog = {
  //     color: "warning",
  //     className: "dialog-cancel",
  //     isCentered: true,
  //     isLoading: false,
  //     title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
  //     message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
  //     cancelText: "Quay lại",
  //     cancelAction: () => {
  //       setShowDialog(false);
  //       setContentDialog(null);
  //     },
  //     defaultText: "Xác nhận",
  //     defaultAction: () => {
  //       handClearForm();
  //       setShowDialog(false);
  //       setContentDialog(null);
  //     },
  //   };
  //   setContentDialog(contentDialog);
  //   setShowDialog(true);
  // };

  // check xem liệu có gì thay đổi không
  useEffect(() => {
    if (formData && values) {
      handBackup(_.isEqual(formData, values));
    }
  }, [formData, values]);

  const [isLoadingSource, setIsLoadingSource] = useState<boolean>(false);

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

  const handlePushRuleBlock = (data, idx, lstData) => {
    if (!data) return;

    const changeDataProps = {
      name: data.label,
      fieldName: data.value,
      dataType: data.dataType,
      options: data.chooses,
      source: data.source,
      type: data.type,
    };

    let mergeData = [];

    const changeData = {
      ...changeDataProps,
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

  const handAddChildrenItemBlock = (ids, idx) => {
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
                  blockRule: [...el.blockRule, defaultBlockRule],
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
    };

    let mergeData = [];

    const changeData = {
      ...changeDataProps,
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

  //! Đoạn này xử lý lv-4
  const handChangeGrandchildLogical = (idj, ids, idx, type) => {
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
                  blockRule: el.blockRule.map((k, l) => {
                    if (l === idj) {
                      return {
                        ...k,
                        logical: type,
                      };
                    }

                    return k;
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

  const handDeleteGrandchildItemBlock = (idj, ids, idx) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      blockRule: prevFormData.blockRule.map((groupBlock, i) => ({
        ...groupBlock,
        blockRule:
          i === idx
            ? groupBlock.blockRule.map((grandchildBlock, j) => ({
                ...grandchildBlock,
                blockRule: j === ids ? grandchildBlock.blockRule.filter((c4Block, k) => k !== idj) : grandchildBlock.blockRule,
              }))
            : groupBlock.blockRule,
      })),
    }));
  };

  const handlePushRuleGrandchildChildren = (data, idj, ids, idx, lstData) => {
    if (!data) return;

    const changeDataProps = {
      name: data.label,
      fieldName: data.value,
      dataType: data.dataType,
      options: data.chooses,
      source: data.source,
      type: data.type,
    };

    let mergeData = [];

    const changeData = {
      ...changeDataProps,
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
                  blockRule: el.blockRule.map((ol, j) => {
                    if (j === idj) {
                      return {
                        ...ol,
                        rule: [...ol.rule, ...(mergeData.length > 0 ? mergeData : [changeData])],
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

    setIsShowField(false);
  };

  const handleChangeValueGrandChildrenBlockCondition = (e, index, idj, ids, idx) => {
    const value = e.value;

    setFormData({
      ...formData,
      blockRule: formData.blockRule.map((prev, i) => {
        if (i === idx) {
          return {
            ...prev,
            blockRule: prev.blockRule.map((el, k) => {
              if (k === ids) {
                return {
                  ...el,
                  blockRule: el.blockRule.map((ol, j) => {
                    if (j === idj) {
                      return {
                        ...ol,
                        rule: ol.rule.map((ul, h) => {
                          if (h === index) {
                            return {
                              ...ul,
                              operator: value,
                            };
                          }

                          return ul;
                        }),
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

  const handChangeValueGrandChildrenTypeBlockItem = (e, index, idj, ids, idx, type) => {
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
                  blockRule: el.blockRule.map((ol, j) => {
                    if (j === idj) {
                      return {
                        ...ol,
                        rule: ol.rule.map((ul, h) => {
                          if (h === index) {
                            return {
                              ...ul,
                              value: value,
                            };
                          }

                          return ul;
                        }),
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

  const handleChangeValueGrandChildrenBlockDay = (e, index, idj, ids, idx) => {
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
                  blockRule: el.blockRule.map((ol, j) => {
                    if (j === idj) {
                      return {
                        ...ol,
                        rule: ol.rule.map((ul, h) => {
                          if (h === index) {
                            const currentValues = ul.value.split("/");
                            const newValue = `${dayValue !== "" ? dayValue : currentValues[0]}/${currentValues[1] || "null"}/${
                              currentValues[2] || "null"
                            }`;
                            return {
                              ...ul,
                              value: newValue,
                            };
                          }

                          return ul;
                        }),
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

  const handleChangeValueGrandChildrenBlockMonth = (e, index, idj, ids, idx) => {
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
                  blockRule: el.blockRule.map((ol, j) => {
                    if (j === idj) {
                      return {
                        ...ol,
                        rule: ol.rule.map((ul, h) => {
                          if (h === index) {
                            const currentValues = ul.value.split("/");
                            const newValue = `${monthValue !== "" ? monthValue : currentValues[0]}/${currentValues[1] || "null"}/${
                              currentValues[2] || "null"
                            }`;
                            return {
                              ...ul,
                              value: newValue,
                            };
                          }

                          return ul;
                        }),
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

  const handleChangeValueGrandChildrenBlockYear = (e, index, idj, ids, idx) => {
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
                  blockRule: el.blockRule.map((ol, j) => {
                    if (j === idj) {
                      return {
                        ...ol,
                        rule: ol.rule.map((ul, h) => {
                          if (h === index) {
                            const currentValues = ul.value.split("/");
                            const newValue = `${yearValue !== "" ? yearValue : currentValues[0]}/${currentValues[1] || "null"}/${
                              currentValues[2] || "null"
                            }`;
                            return {
                              ...ul,
                              value: newValue,
                            };
                          }

                          return ul;
                        }),
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

  const handleDeleteGrandChildrenBlockItemField = (index, idj, ids, idx) => {
    const groupRuleFilter = formData.blockRule[idx];
    const blockRuleFilter = groupRuleFilter.blockRule[ids];
    const grandRuleFilter = blockRuleFilter.blockRule[idj];

    const updatedGrandFilter = grandRuleFilter.rule.filter((field, i) => i !== index);

    // Kiểm tra và xóa liên quan
    const deletedField = grandRuleFilter.rule[idj].fieldName;
    if (deletedField === "city_id") {
      // Nếu xóa "city_id", thì clear giá trị "district_id" và "subdistrict_id"
      updatedGrandFilter.forEach((item) => {
        if (item.fieldName === "district_id" || item.fieldName === "subdistrict_id") {
          item.value = "";
        }
      });
    } else if (deletedField === "district_id") {
      // Nếu xóa "district_id", thì clear giá trị "subdistrict_id"
      updatedGrandFilter.forEach((item) => {
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
            blockRule: prev.blockRule.map((el, j) => {
              if (j === ids) {
                return {
                  ...el,
                  blockRule: el.blockRule.map((ol, k) => {
                    if (k === idj) {
                      return {
                        ...ol,
                        rule: updatedGrandFilter,
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

  const onSelectOpenGrandChildrenBlockApi = async (source, index, idj, ids, idx, param?: any) => {
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
              blockRule: prev.blockRule.map((el, j) => {
                if (j === ids) {
                  return {
                    ...el,
                    blockRule: el.blockRule.map((ul, k) => {
                      if (k === idj) {
                        return {
                          ...ul,
                          rule: ul.rule.map((ol, j) => {
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

                      return ul;
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

  const handleDeleteBlockItemField = (index, idx) => {
    const groupRuleFilter = formData.blockRule[idx];
    const updatedRuleFilter = groupRuleFilter.rule.filter((field, i) => i !== index);

    // Kiểm tra và xóa liên quan
    const deletedField = groupRuleFilter.rule[idx].fieldName;
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
            rule: updatedRuleFilter,
          };
        }

        return prev;
      }),
    });
  };

  const onSubmit = async () => {
    const changeFormData = _.cloneDeep(formData);
    const modifiedmodifiedData = transformData(changeFormData);

    const converData = {
      ...modifiedmodifiedData,
      criteria: JSON.stringify(modifiedmodifiedData.blockRule),
    };

    delete converData.blockRule;

    const body = {
      ...converData,
      ...(data ? { id: data.id } : {}),
    };

    const response = await ObjectFeatureService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Chỉnh sửa" : "Thêm mới"} đặc trưng khách hàng thành công`, "success");
      onReload(true);
      handClearForm();
    } else {
      onReload(false);
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (hasSubmitForm && onShow) {
      onSubmit();
    }
  }, [hasSubmitForm, onShow]);

  return (
    <Fragment>
      <div className="form__add__customer--characteristics">
        <div
          className="box__content__filter--advanced"
          style={
            formData.blockRule.length >= 1
              ? {
                  maxHeight: "42rem",
                  overflow: "auto",
                }
              : {}
          }
        >
          <div className="form-group">
            <Input
              name="name"
              value={formData.name}
              label="Tên tiêu chí"
              fill={true}
              required={true}
              disabled={disableFieldCommom}
              placeholder="Nhập tên phân khúc"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <NummericInput
              name="weight"
              value={formData.weight}
              label="Trọng số"
              fill={true}
              disabled={disableFieldCommom}
              isDecimalScale={false}
              placeholder="Nhập trọng số"
              onValueChange={(e) => setFormData({ ...formData, weight: e.floatValue })}
            />
          </div>
          <div className="form-group">
            <span className="name-group">Điều kiện lọc</span>
            <div className="desc__filter">
              {formData.blockRule && (
                <div className="lv__item lv__2">
                  {formData.blockRule.map((item, idx) => {
                    const filterBlockFieldRule = lstFieldFilter
                      .filter((ol) => {
                        return !item.rule.some((el) => el.fieldName === ol.fieldName);
                      })
                      .map((i) => {
                        return {
                          label: i.name,
                          value: i.fieldName,
                          dataType: i.dataType,
                          chooses: i.options,
                          source: i.source,
                          type: i.type,
                        };
                      });

                    return (
                      <div key={idx} className="box__block--rule">
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
                                    options={filterBlockFieldRule}
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
                                              disabled={disableFieldCommom}
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
                                  const filterBlockChildrenFieldRule = lstFieldFilter
                                    .filter((il) => {
                                      return !el.rule.some((ol) => ol.fieldName === il.fieldName);
                                    })
                                    .map((l) => {
                                      return {
                                        label: l.name,
                                        value: l.fieldName,
                                        dataType: l.dataType,
                                        chooses: l.options,
                                        source: l.source,
                                        type: l.type,
                                      };
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
                                            color="success"
                                            className="icon__add"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              handAddChildrenItemBlock(ids, idx);
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
                                              ref={refChildrenBlockOptionFieldContainer}
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
                                                  options={filterBlockChildrenFieldRule}
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
                                                            disabled={disableFieldCommom}
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

                                          {el.blockRule && el.blockRule.length > 0 && (
                                            <div className="lv__item lv__4">
                                              {el.blockRule.map((k, idj) => {
                                                const filterBlockGrandchildFieldRule = lstFieldFilter
                                                  .filter((il) => {
                                                    return !k.rule.some((ol) => ol.fieldName === il.fieldName);
                                                  })
                                                  .map((m) => {
                                                    return {
                                                      label: m.name,
                                                      value: m.fieldName,
                                                      dataType: m.dataType,
                                                      chooses: m.options,
                                                      source: m.source,
                                                      type: m.type,
                                                    };
                                                  });

                                                return (
                                                  <div key={idj} className="box__grandchild--block">
                                                    <span className="view__logical view__grandchild--block">
                                                      {el.logical === "and" ? "And" : "Or"}
                                                    </span>

                                                    <div className="block__grandchild">
                                                      <div className="action__choose--item action__choose--lv4">
                                                        <Button
                                                          color={k.logical === "and" ? "primary" : "secondary"}
                                                          onClick={(e) => {
                                                            e.preventDefault();
                                                            handChangeGrandchildLogical(idj, ids, idx, "and");
                                                          }}
                                                          disabled={disableFieldCommom}
                                                        >
                                                          AND
                                                        </Button>
                                                        <Button
                                                          color={k.logical === "or" ? "primary" : "secondary"}
                                                          onClick={(e) => {
                                                            e.preventDefault();
                                                            handChangeGrandchildLogical(idj, ids, idx, "or");
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
                                                            handDeleteGrandchildItemBlock(idj, ids, idx);
                                                          }}
                                                          disabled={disableFieldCommom}
                                                        >
                                                          <Icon name="Trash" />
                                                        </Button>
                                                      </div>

                                                      <div className="including__conditions">
                                                        {/* đoạn này là chọn các trường để fill xuống dưới */}
                                                        <div
                                                          className={`lst__option--group-field ${
                                                            disableFieldCommom ? "dis__lst__option--group-field" : ""
                                                          }`}
                                                        >
                                                          <div
                                                            className={`choose-field ${
                                                              isShowField && idj === idxFieldGrandchild ? "show__field--choose" : ""
                                                            }`}
                                                            ref={refOptionFieldContainer}
                                                            onClick={() => {
                                                              if (!disableFieldCommom) {
                                                                setIsShowField(true);
                                                                setIdxFieldGrandchild(idj);
                                                              }
                                                            }}
                                                          >
                                                            <div className="action__drop--field">
                                                              <SelectCustom
                                                                name="chooseField"
                                                                fill={true}
                                                                options={filterBlockGrandchildFieldRule}
                                                                onChange={(e) => handlePushRuleGrandchildChildren(e, idj, ids, idx, k.rule)}
                                                                placeholder="Chọn trường"
                                                              />
                                                            </div>
                                                          </div>
                                                        </div>

                                                        {/* đoạn này là show lên các trường đã được chọn */}
                                                        <div className="lst__field--rule">
                                                          {k.rule &&
                                                            k.rule.length > 0 &&
                                                            k.rule.map((ol, index) => {
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
                                                                          disabled={disableFieldCommom}
                                                                          onChange={(e) =>
                                                                            handleChangeValueGrandChildrenBlockCondition(e, index, idj, ids, idx)
                                                                          }
                                                                        />
                                                                      </div>

                                                                      <div className="info-item">
                                                                        {ol.type === "text" ? (
                                                                          <Input
                                                                            name={ol.name}
                                                                            fill={true}
                                                                            value={ol.value}
                                                                            disabled={disableFieldCommom}
                                                                            onChange={(e) =>
                                                                              handChangeValueGrandChildrenTypeBlockItem(
                                                                                e,
                                                                                index,
                                                                                idj,
                                                                                ids,
                                                                                idx,
                                                                                "input"
                                                                              )
                                                                            }
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
                                                                              handChangeValueGrandChildrenTypeBlockItem(
                                                                                e,
                                                                                index,
                                                                                idj,
                                                                                ids,
                                                                                idx,
                                                                                "number"
                                                                              )
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
                                                                            onChange={(e) =>
                                                                              handChangeValueGrandChildrenTypeBlockItem(
                                                                                e,
                                                                                index,
                                                                                idj,
                                                                                ids,
                                                                                idx,
                                                                                "date"
                                                                              )
                                                                            }
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
                                                                              handChangeValueGrandChildrenTypeBlockItem(
                                                                                e,
                                                                                index,
                                                                                idj,
                                                                                ids,
                                                                                idx,
                                                                                "select"
                                                                              )
                                                                            }
                                                                            onMenuOpen={() =>
                                                                              onSelectOpenGrandChildrenBlockApi(
                                                                                ol.source,
                                                                                index,
                                                                                idj,
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
                                                                                !el.rule.some(
                                                                                  (li) => li.fieldName === "city_id" && li.value !== ""
                                                                                )) ||
                                                                              (ol.fieldName === "subdistrict_id" &&
                                                                                (!el.rule.some(
                                                                                  (li) => li.fieldName === "city_id" && li.value !== ""
                                                                                ) ||
                                                                                  !el.rule.some(
                                                                                    (li) => li.fieldName === "district_id" && li.value !== ""
                                                                                  ))) ||
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
                                                                              onChange={(e) =>
                                                                                handleChangeValueGrandChildrenBlockDay(e, index, idj, ids, idx)
                                                                              }
                                                                              className="founded__day"
                                                                            />

                                                                            <SelectCustom
                                                                              placeholder="Chọn tháng"
                                                                              name="foundingMonth"
                                                                              fill={true}
                                                                              value={+ol.value.split("/")[1]}
                                                                              options={months}
                                                                              disabled={disableFieldCommom}
                                                                              onChange={(e) =>
                                                                                handleChangeValueGrandChildrenBlockMonth(e, index, idj, ids, idx)
                                                                              }
                                                                              className="founded_month"
                                                                            />

                                                                            <SelectCustom
                                                                              placeholder="Chọn năm"
                                                                              name="foundingYear"
                                                                              fill={true}
                                                                              value={+ol.value.split("/")[2]}
                                                                              options={years}
                                                                              disabled={disableFieldCommom}
                                                                              onChange={(e) =>
                                                                                handleChangeValueGrandChildrenBlockYear(e, index, idj, ids, idx)
                                                                              }
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
                                                                            onClick={() =>
                                                                              handleDeleteGrandChildrenBlockItemField(index, idj, ids, idx)
                                                                            }
                                                                          >
                                                                            <Icon name="Trash" />
                                                                          </span>
                                                                        </Tippy>
                                                                      </div>
                                                                    )}
                                                                  </div>
                                                                  {k.rule.length > 1 && (
                                                                    <span className="view__logical view__grandchild--rule--block--children">
                                                                      {k.logical === "and" ? "And" : "Or"}
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
