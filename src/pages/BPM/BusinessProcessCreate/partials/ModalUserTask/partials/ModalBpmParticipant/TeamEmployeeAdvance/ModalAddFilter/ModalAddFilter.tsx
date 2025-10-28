import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IEmailRequest } from "model/email/EmailRequestModel";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import { showToast } from "utils/common";
import { convertParamsToString, createArrayFromTo, createArrayFromToR, isDifferenceObj } from "reborn-util";
import CustomerService from "services/CustomerService";
import "./ModalAddFilter.scss";
import moment from "moment";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import Button from "components/button/button";
import Tippy from "@tippyjs/react";
import _ from "lodash";
import BusinessProcessService from "services/BusinessProcessService";
import EmployeeService from "services/EmployeeService";
import SegmentFilterService from "services/SegmentFilterService";

export default function ModalAddFilter(props: any) {
  const { onShow, onHide, dataNode, processId, setDataNode, disable } = props;
  console.log("dataNode2222", dataNode);
  console.log('processId', processId);
  
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [data, setData] = useState(null);
  const [nodeName, setNodeName] = useState(null);
  const [childProcessId, setChildProcessId] = useState(null);
  const [pickMode, setPickMode] = useState(null);

  useEffect(() => {
    if(dataNode && onShow){
      // getDetailLink(fromNodeId, toNodeId)
    }

  }, [dataNode, onShow]);

  const getDetailLink = async (fromNodeId, toNodeId) => {
    const params = {
      fromNodeId: fromNodeId,
      toNodeId: toNodeId
    }
    const response = await BusinessProcessService.bpmGetLinkNode(params);

    if (response.code == 0) {
      const result = response.result;
      const config = result.config && JSON.parse(result.config);
      setNodeName(result?.name);
      setChildProcessId(result?.processId);
      if(config){
        setData(config);
      }
      
      
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  }
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
        typeFieldName: 1,//1-chọn trường trong form, 2-chọn biến quy trình
        fieldName: null,
        nodeId: null,
        operator: "eq",
        value: "",
        typeValue: 0,// 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
        type: null
      }
    ],
    blockRule: [],
  };

  const defaultCondition = {
    logical: "and",
    rule: [],
  };


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


  const values = useMemo(
    () =>
      ({
        logical: data ? data.logical : "and",
        // listEformAttribute: data?.listEformAttribute || null,
        rule: data ? data.rule 
          : [
            {
              typeFieldName: 1,//1-chọn trường trong form, 2-chọn biến quy trình
              fieldName: null,
              nodeId: null,
              operator: "eq",
              value: "",
              typeValue: 0, // 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
              type: null
            }
          ],
        blockRule: data ? data.blockRule : [],
      } as any),
    [data, onShow]
  );

  const [namePot, setNamePot] = useState('');
  const [formData, setFormData] = useState(values);
  console.log("formData", formData);



  //Biểu mẫu 
  const loadedOptionAttribute = async (search, loadedOptions, { page }) => {
    const params = {
        name: search,
        page: page,
        limit: 10,
        processId: childProcessId || processId
    }
    const response = await BusinessProcessService.listVariableDeclare(params);

    if (response.code === 0) {
      const dataOption = response.result?.items;
      let listVar = []
      dataOption && dataOption.length > 0 && dataOption.map(item => {
        const body = item.body && JSON.parse(item.body) || [];
        body.map(el => {
          listVar.push({
            value: `var_${item.name}.${el.name}`,
            label: `var_${item.name}.${el.name}`,
            nodeId: item.nodeId,
            datatype: el.type?.value || null
          });
        })
      
      })         
      
      return {
        options: [
          ...(listVar.length > 0
            ? listVar.map((item) => {
                return {
                  value: item.value,
                  label: item.label,
                  nodeId: item.nodeId,
                  datatype: item.datatype
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

  const loadedOptionObject = async (search, loadedOptions, { page }) => {
    const params = {
        name: search,
        page: page,
        limit: 10,
        processId: processId 
    }
    const response = await BusinessProcessService.listObjectAttribute(params);

    if (response.code === 0) {
      const dataOption = response.result;

      let listData = [];      

      if (dataOption) {
        Object.entries(dataOption).map((lstEformAttribute: any, key: number) => {
          (lstEformAttribute[1] || []).map((eformAttribute, index: number) => {
            console.log('eformAttribute', eformAttribute);
            
            listData.push({
              value: eformAttribute.id,
              label: eformAttribute.name,
              datatype: eformAttribute.datatype
            })
          })
        })
      }

      console.log('listData', listData);
      
     
      return {
        options: listData,
        // hasMore: response.result.loadMoreAble,
        // additional: {
        //   page: page + 1,
        // },
      };
    }

    return { options: [], hasMore: false };
  };

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      // branchId: dataBranch.value,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
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

  const dataEmployee = [
    {
      value: 'branch',
      label: 'Chi nhánh'
    },
    {
      value: 'department',
      label: 'Phòng ban'
    },
    {
      value: 'role',
      label: 'Chức vụ'
    },
  ]


  //! Đoạn này xử lý lv-1
  const handlePushRule = (data, idx) => {
    console.log('data', data);  
    if (!data) return;

    setFormData({
      ...formData,
      rule: [...formData.rule].map((el, index) => {
        if (idx === index) {
          return {
            ...el,
            fieldName: data?.label,
            nodeId: data?.nodeId,
            type: data.datatype
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
    if(type === 'form' || type === 'var'){
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
                  type: data.datatype
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

  const onSubmit = async (formData) => {
    // e.preventDefault();
    if(!pickMode){
      showToast(`Phương pháp lọc không được để trống`, "warning");
      return;
    }

    const bodyPot = {
      name: namePot,
      type: "pot",
      config: JSON.stringify(formData),
      nodeId: dataNode?.id
    }

    const bodyEmployee = {
      name: nameEmployee,
      type: "employee",
      config: JSON.stringify(formDataEmployee),
      nodeId: dataNode?.id
    }

    // setIsSubmit(true);

    const responsePot = await SegmentFilterService.updateSegment(bodyPot);
    const responseEmployee = await SegmentFilterService.updateSegment(bodyEmployee);

    if (responsePot.code === 0 && responseEmployee.code === 0) {
      // showToast(`Cập nhật điều kiện thành công`, "success");
      // handleClearForm(true);
     
      const potSegmentId = responsePot?.result.id;
      const employeeSegmentId = responseEmployee?.result.id;
      updateSegmentMapping(potSegmentId, employeeSegmentId);

    } else {
      showToast(responsePot.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      showToast(responseEmployee.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const updateSegmentMapping = async (potSegmentId, employeeSegmentId) => {
    // e.preventDefault();

    const body = {
      potSegmentId: potSegmentId,
      employeeSegmentId: employeeSegmentId,
      pickMode: pickMode.value,
      nodeId: dataNode?.id
    }

    setIsSubmit(true);

    const response = await SegmentFilterService.updateSegmentMapping(body);

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
            title: disable ? 'Đóng' : "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              handleClearForm(false);
              // !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          ...disable ? [] : ([
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
          ] as any)
        ],
      },
    }),
    [isSubmit, nodeName, dataNode, formData, disable, pickMode]
  );


  const valuesEmployee = useMemo(
    () =>
      ({
        logical: data ? data.logical : "and",
        rule: data ? data.rule 
          : [
            {
              typeFieldName: 1,//1-chọn trường trong form, 2-chọn biến quy trình
              fieldName: null,
              nodeId: null,
              operator: "eq",
              value: "",
              typeValue: 0, // 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
              type: null
            }
          ],
        blockRule: data ? data.blockRule : [],
      } as any),
    [data, onShow]
  );

  const [nameEmployee, setNameEmployee] = useState('');
  const [formDataEmployee, setFormDataEmployee] = useState(valuesEmployee);

    //! Đoạn này xử lý lv-1
  const handlePushRuleEmployee = (data, idx) => {
    console.log('data', data);  
    if (!data) return;

    setFormDataEmployee({
      ...formDataEmployee,
      rule: [...formDataEmployee.rule].map((el, index) => {
        if (idx === index) {
          return {
            ...el,
            fieldName: data?.label,
            nodeId: data?.nodeId,
            type: data.datatype
          };
        }

        return el;
      }),
    });
  };

  const handleChangeValueConditionEmployee = (e, idx) => {
    const value = e.value;

    setFormDataEmployee({
      ...formDataEmployee,
      rule: [...formDataEmployee.rule].map((el, index) => {
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

  const handChangeValueTypeItemEmployee = (e, idx) => {
    let value = e.value;

    setFormDataEmployee({
      ...formDataEmployee,
      rule: [...formDataEmployee.rule].map((el, index) => {
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

  const handleDeleteItemFieldEmployee = (idx) => {
    const newData = [...formDataEmployee.rule];

    newData.splice(idx, 1);

    // Kiểm tra và xóa liên quan
    const deletedField = formDataEmployee.rule[idx].fieldName;
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

    setFormDataEmployee({ ...formDataEmployee, rule: newData });
  };

  //! Đoạn này xử lý lv-2
  const handChangeLogicalEmployee = (idx, type) => {
    setFormDataEmployee({
      ...formDataEmployee,
      blockRule: [...formDataEmployee.blockRule].map((el, index) => {
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

  const handDeleteItemBlockEmployee = (idx) => {
    const newData = [...formDataEmployee.blockRule];
    newData.splice(idx, 1);

    setFormDataEmployee({ ...formDataEmployee, blockRule: newData });
  };

  const handlePushRuleBlockEmployee = (data, ids, idx) => {
    if (!data) return;

    setFormDataEmployee({
      ...formDataEmployee,
      blockRule: [...formDataEmployee.blockRule].map((el, index) => {
        if (index === idx) {
          return {
            ...el,
            rule: [...el.rule].map((ol, i) => {
              if (i === ids) {
                return {
                  ...ol,
                  fieldName: data?.label,
                  nodeId: data?.nodeId,
                  type: data.datatype
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

  const handleChangeValueBlockConditionEmployee = (e, ids, idx) => {
    const value = e.value;

    setFormDataEmployee({
      ...formDataEmployee,
      blockRule: [...formDataEmployee.blockRule].map((el, index) => {
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

  const handChangeValueTypeBlockItemEmployee = (e, ids, idx, type) => {
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

    setFormDataEmployee({
      ...formDataEmployee,
      blockRule: [...formDataEmployee.blockRule].map((el, index) => {
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

  const handleDeleteBlockItemFieldEmployee = (ids, idx) => {
    const groupRuleFilter = formDataEmployee.blockRule[idx];
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

    setFormDataEmployee({
      ...formDataEmployee,
      blockRule: [...formDataEmployee.blockRule].map((el, index) => {
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

  useEffect(() => {
    setFormData(values);
    setFormDataEmployee(valuesEmployee);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values, valuesEmployee]);

  const handleClearForm = (acc) => {
    onHide(acc);
    setData(null);
    setNodeName(null);
    setNameEmployee("");
    setNamePot("");
    setPickMode(null)
  };


  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-filter"
        size="xl"
      >
        <form className="form-add-filter">
          <div className="container-header">
            <div className="box-title">
              <h4>Cài đặt điều kiện</h4>
            </div>
              <div style={{display:'flex', alignItems:'center'}}>
                <Button onClick={() => !isSubmit && handleClearForm(false)} type="button" className="btn-close" color="transparent" onlyIcon={true}>
                  <Icon name="Times" />
                </Button>
              </div>
          </div>

          <ModalBody>
            <div className="container-sequence-flow">
              <div className="condition-customer-segment">
                <div className="form-group">
                  <span className="name-group">Điều kiện hồ sơ</span>
                  <div style={{marginBottom: '1.6rem'}}>
                    <Input
                      id="name"
                      name="name"
                      label=""
                      fill={true}
                      required={true}
                      placeholder={"Tên điều kiện"}
                      value={namePot}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNamePot(value);
                      }}
                    />
                  </div>
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
                                      <div className="info-item" style={!item.fieldName ? {width: '100%' } : {}}>
                                        {/* <span className="name-field">{capitalizeFirstLetter(item.name)}</span> */}
                                        {/* <span className="name-field">{(item.fieldName)}</span> */}
                                        <div className={"container-select-mapping"}>
                                          {!item.typeFieldName ? 
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
                                            :
                                            <div className="select-mapping">
                                                <SelectCustom
                                                    id=""
                                                    name=""
                                                    // label="Chọn biểu mẫu"
                                                    options={[]}
                                                    fill={false}
                                                    value={item.fieldName ? {value: item.fieldName, label: item.fieldName} : null}
                                                    // special={true}
                                                    required={true}
                                                    onChange={(e) => handlePushRule(e, idx)}
                                                    isAsyncPaginate={true}
                                                    isFormatOptionLabel={false}
                                                    placeholder={'Chọn trường'}
                                                    additional={{
                                                        page: 1,
                                                    }}
                                                    loadOptionsPaginate={loadedOptionObject}
                                                    // formatOptionLabel={formatOptionLabelEmployee}
                                                    // error={checkFieldEform}
                                                    // message="Biểu mẫu không được bỏ trống"
                                                />
                                            </div>
                                          }
                                            <Tippy  
                                                content={item.typeFieldName === 0 ? 'Chuyển chọn trường trong form' : item.typeFieldName === 1 ? 'Chuyển chọn biến' : 'Chuyển nhập giá trị'}
                                            >
                                                <div 
                                                    className={'icon-change-select'}
                                                    onClick={(e) => {
                                                      setFormData({
                                                        ...formData,
                                                        rule: [...formData.rule].map((el, index) => {
                                                          if (idx === index) {
                                                            return {
                                                              ...el,
                                                              typeFieldName: item.typeFieldName === 0 ? 1 : item.typeFieldName === 1 ? 2 : 0,
                                                              // fieldName: '',
                                                              nodeId: '',
                                                              type: ''
                                                            };
                                                          }
                                                  
                                                          return el;
                                                        }),
                                                      });
                                                    }}
                                                >
                                                    <Icon name="ResetPassword" style={{width: 18}} />
                                                </div>
                                            </Tippy>
                                        </div>
                                      </div>
                                      {item.fieldName ? 
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
                                                : (item.type === "text" || item.type === "textfield")
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
                                      : null}

                                      {item.fieldName ? 
                                        <div className="info-item">
                                          <div className={"container-select-mapping"}>
                                            {!item.typeValue ? 
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
                                              :
                                              <div className="select-mapping">
                                                <SelectCustom
                                                  key={item.typeValue}
                                                  id=""
                                                  name=""
                                                  // label="Chọn biểu mẫu"
                                                  options={[]}
                                                  fill={false}
                                                  value={item.value ? {value: item.value, label: item.value} : null}
                                                  special={true}
                                                  required={true}
                                                  onChange={(e) => handChangeValueTypeItem(e, idx, item.typeValue === 1 ? 'form' : 'var')}
                                                  isAsyncPaginate={true}
                                                  isFormatOptionLabel={false}
                                                  placeholder={item.typeValue === 1 ? 'Chọn trường trong form' : 'Chọn biến'}
                                                  additional={{
                                                      page: 1,
                                                  }}
                                                  loadOptionsPaginate={item.typeValue === 1 ? loadedOptionForm : loadedOptionAttribute}
                                                />
                                              </div>
                                            }
                                            <Tippy  
                                                content={item.typeValue === 0 ? 'Chuyển chọn trường trong form' : item.typeValue === 1 ? 'Chuyển chọn biến' : 'Chuyển nhập giá trị'}
                                            >
                                                <div 
                                                    className={'icon-change-select'}
                                                    onClick={(e) => {
                                                      console.log('da vao step 1');
                                                      
                                                      setFormData({
                                                        ...formData,
                                                        rule: [...formData.rule].map((el, index) => {
                                                          if (idx === index) {
                                                            return {
                                                              ...el,
                                                              typeValue: item.typeValue === 0 ? 1 : item.typeValue === 1 ? 2 : 0,
                                                              value: ''
                                                            };
                                                          }
                                                  
                                                          return el;
                                                        }),
                                                      });
                                                    }}
                                                >
                                                    <Icon name="ResetPassword" style={{width: 18}} />
                                                </div>
                                            </Tippy>
                                          </div>
                                        </div>
                                      : null}
                                    </div>

                                    <div className="action__add--rule">
                                        <Tippy content="Thêm">
                                            <span className="icon__add" 
                                                onClick={() => {
                                                  setFormData({ 
                                                    ...formData, 
                                                    rule: [
                                                      ...formData.rule, 
                                                      {
                                                        typeFieldName: 1,//1-chọn trường trong form, 2-chọn biến quy trình
                                                        fieldName: null,
                                                        nodeId: null,
                                                        operator: "eq",
                                                        value: "",
                                                        typeValue: 0,// 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
                                                        type: null
                                                      }
                                                    ]})
                                                }}
                                            >
                                                <Icon name="PlusCircleFill" />
                                            </span>
                                        </Tippy>
                                    </div>

                                    {formData.rule.length > 1 ?
                                      <div className="action__delete--rule">
                                        <Tippy content="Xóa">
                                          <span className="icon__delete" onClick={() => handleDeleteItemField(idx)}>
                                            <Icon name="Trash" />
                                          </span>
                                        </Tippy>
                                      </div>
                                    : null}
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
                                  {/* đoạn này là show lên các trường đã được chọn */}
                                  <div className="lst__field--rule">
                                    {item.rule &&
                                      item.rule.length > 0 &&
                                      item.rule.map((el, index) => {
                                        return (
                                          <Fragment key={index}>
                                            <div className="item__rule">
                                              <div className="lst__info--rule">
                                                <div className="info-item" style={!el.fieldName ? {width: '100%' } : {}}>
                                                  {/* <span className="name-field">{el.fieldName}</span> */}
                                                  <div className={"container-select-mapping"}>
                                                    {!el.typeFieldName ? 
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
                                                      :
                                                      <div className="select-mapping">
                                                          <SelectCustom
                                                              key={el.typeFieldName}
                                                              id=""
                                                              name=""
                                                              // label="Chọn biểu mẫu"
                                                              options={[]}
                                                              fill={false}
                                                              value={el.fieldName ? {value: el.fieldName, label: el.fieldName} : null}
                                                              special={true}
                                                              required={true}
                                                              onChange={(e) =>handlePushRuleBlock(e, index, idx)}
                                                              isAsyncPaginate={true}
                                                              isFormatOptionLabel={false}
                                                              placeholder={'Chọn trường'}
                                                              additional={{
                                                                  page: 1,
                                                              }}
                                                              loadOptionsPaginate={loadedOptionObject}
                                                              // formatOptionLabel={formatOptionLabelEmployee}
                                                              // error={checkFieldEform}
                                                              // message="Biểu mẫu không được bỏ trống"
                                                          />
                                                      </div>
                                                    }
                                                      <Tippy  
                                                          content={el.typeFieldName === 0 ? 'Chuyển chọn trường trong form' : el.typeFieldName === 1 ? 'Chuyển chọn biến' : 'Chuyển nhập giá trị'}
                                                      >
                                                          <div 
                                                              className={'icon-change-select'}
                                                              onClick={(e) => {
                                                                console.log('da vao');
                                                                
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
                                                                              nodeId: '',
                                                                              type: ''
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
                                                              <Icon name="ResetPassword" style={{width: 18}} />
                                                          </div>
                                                      </Tippy>
                                                  </div>
                                                </div>

                                                {el.fieldName ? 
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
                                                : null}

                                                {el.fieldName ? 
                                                  <div className="info-item">
                                                    <div className={"container-select-mapping"}>
                                                      {!el.typeValue ? 
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
                                                        :
                                                        <div className="select-mapping">
                                                          <SelectCustom
                                                              key={el.typeValue}
                                                              id=""
                                                              name=""
                                                              // label="Chọn biểu mẫu"
                                                              options={[]}
                                                              fill={false}
                                                              value={el.value ? {value: el.value, label: el.value} : null}
                                                              special={true}
                                                              required={true}
                                                              onChange={(e) => handChangeValueTypeBlockItem(e, index, idx, el.typeValue === 1 ? 'form' : 'var')}
                                                              isAsyncPaginate={true}
                                                              isFormatOptionLabel={false}
                                                              placeholder={el.typeValue === 1 ? 'Chọn trường trong form' : 'Chọn biến'}
                                                              additional={{
                                                                  page: 1,
                                                              }}
                                                              loadOptionsPaginate={el.typeValue === 1 ? loadedOptionObject : loadedOptionAttribute}
                                                              // formatOptionLabel={formatOptionLabelEmployee}
                                                              // error={checkFieldEform}
                                                              // message="Biểu mẫu không được bỏ trống"
                                                          />
                                                        </div>
                                                      }
                                                      <Tippy  
                                                        content={el.typeValue === 0 ? 'Chuyển chọn trường trong form' : el.typeValue === 1 ? 'Chuyển chọn biến' : 'Chuyển nhập giá trị'}
                                                      >
                                                        <div 
                                                          className={'icon-change-select'}
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
                                                                          value: ''
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
                                                            <Icon name="ResetPassword" style={{width: 18}} />
                                                        </div>
                                                      </Tippy>
                                                    </div>
                                                    
                                                  </div>
                                                : null}
                                              </div>

                                              <div className="action__add--rule">
                                                  <Tippy content="Thêm">
                                                      <span className="icon__add" 
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
                                                                        typeFieldName: 1,//1-chọn trường trong form, 2-chọn biến quy trình
                                                                        fieldName: null,
                                                                        nodeId: null,
                                                                        operator: "eq",
                                                                        value: "",
                                                                        typeValue: 0,// 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
                                                                        type: null
                                                                      }
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
                                              {item.rule.length > 1 ?
                                                <div className="action__delete--rule">
                                                  <Tippy content="Xóa">
                                                    <span className="icon__delete" onClick={() => handleDeleteBlockItemField(index, idx)}>
                                                      <Icon name="Trash" />
                                                    </span>
                                                  </Tippy>
                                                </div>
                                               : null}
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

                <div className="form-group">
                  <span className="name-group">Điều kiện nhóm nhân viên</span>
                  <div style={{marginBottom: '1.6rem'}}>
                    <Input
                      id="name"
                      name="name"
                      label=""
                      fill={true}
                      required={true}
                      placeholder={"Tên điều kiện"}
                      value={nameEmployee}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNameEmployee(value);
                      }}
                    />
                  </div>
                  <div className="desc__filter">
                    <div className="lv__item lv__1">
                      {/* đoạn này là chọn các loại điều kiện */}
                      <div className="action__choose--item action__choose--lv1">
                        <Button
                          color={formDataEmployee.logical === "and" ? "primary" : "secondary"}
                          onClick={(e) => {
                            e.preventDefault();
                            setFormDataEmployee({ ...formDataEmployee, logical: "and" });
                          }}
                          // disabled={disableFieldCommom}
                        >
                          AND
                        </Button>
                        <Button
                          color={formDataEmployee.logical === "or" ? "primary" : "secondary"}
                          onClick={(e) => {
                            e.preventDefault();
                            setFormDataEmployee({ ...formDataEmployee, logical: "or" });
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
                            setFormDataEmployee({ ...formDataEmployee, blockRule: [...formDataEmployee.blockRule, defaultBlockRule] });
                          }}
                          // disabled={disableFieldCommom}
                        >
                          <Icon name="PlusCircleFill" />
                        </Button>
                      </div>

                      <div className="including__conditions__eform">
                        
                        <div className="lst__field--rule">
                          {formDataEmployee.rule &&
                            formDataEmployee.rule.length > 0 &&
                            formDataEmployee.rule.map((item, idx) => {
                              return (
                                <Fragment key={idx}>
                                  <div className="item__rule">
                                    <div className="lst__info--rule">
                                      <div className="info-item" style={!item.fieldName ? {width: '100%' } : {}}>
                                        <div className={"container-select-mapping"}>
                                          {!item.typeFieldName ? 
                                            <div className="input-text">
                                              <Input
                                                name={item.fieldName}
                                                fill={false}
                                                value={item.fieldName}
                                                // disabled={disableFieldCommom}
                                                onChange={(e) => {
                                                  setFormDataEmployee({
                                                    ...formDataEmployee,
                                                    rule: [...formDataEmployee.rule].map((el, index) => {
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
                                            :
                                            <div className="select-mapping">
                                                <SelectCustom
                                                    id=""
                                                    name=""
                                                    // label="Chọn biểu mẫu"
                                                    options={dataEmployee}
                                                    fill={false}
                                                    special={true}
                                                    value={item.fieldName ? {value: item.fieldName, label: item.fieldName} : null}
                                                    // special={true}
                                                    required={true}
                                                    onChange={(e) => handlePushRuleEmployee(e, idx)}
                                                    isAsyncPaginate={false}
                                                    isFormatOptionLabel={false}
                                                    placeholder={'Chọn trường'}
                                                    additional={{
                                                        page: 1,
                                                    }}
                                                    loadOptionsPaginate={loadedOptionEmployee}
                                                    // formatOptionLabel={formatOptionLabelEmployee}
                                                    // error={checkFieldEform}
                                                    // message="Biểu mẫu không được bỏ trống"
                                                />
                                            </div>
                                          }
                                        </div>
                                      </div>
                                      {item.fieldName ? 
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
                                                : (item.type === "text" || item.type === "textfield")
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
                                            onChange={(e) => handleChangeValueConditionEmployee(e, idx)}
                                          />
                                        </div>
                                      : null}

                                      {item.fieldName ? 
                                        <div className="info-item">
                                          <div className={"container-select-mapping"}>
                                            <div className="input-text">
                                              <Input
                                                name={item.value}
                                                fill={false}
                                                value={item.value}
                                                // disabled={disableFieldCommom}
                                                onChange={(e) => handChangeValueTypeItemEmployee(e, idx)}
                                                // placeholder={`Nhập ${el.fieldName?.toLowerCase()}`}
                                                placeholder={`Nhập giá trị`}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      : null}
                                    </div>

                                    <div className="action__add--rule">
                                        <Tippy content="Thêm">
                                            <span className="icon__add" 
                                                onClick={() => {
                                                  setFormDataEmployee({ 
                                                    ...formDataEmployee, 
                                                    rule: [
                                                      ...formDataEmployee.rule, 
                                                      {
                                                        typeFieldName: 1,//1-chọn trường trong form, 2-chọn biến quy trình
                                                        fieldName: null,
                                                        nodeId: null,
                                                        operator: "eq",
                                                        value: "",
                                                        typeValue: 0,// 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
                                                        type: null
                                                      }
                                                    ]})
                                                }}
                                            >
                                                <Icon name="PlusCircleFill" />
                                            </span>
                                        </Tippy>
                                    </div>

                                    {formDataEmployee.rule.length > 1 ?
                                      <div className="action__delete--rule">
                                        <Tippy content="Xóa">
                                          <span className="icon__delete" onClick={() => handleDeleteItemFieldEmployee(idx)}>
                                            <Icon name="Trash" />
                                          </span>
                                        </Tippy>
                                      </div>
                                    : null}
                                  </div>
                                  {formDataEmployee.rule.length > 1 && (
                                    <span className="view__logical view__logical--rule">{formDataEmployee.logical === "and" ? "And" : "Or"}</span>
                                  )}
                                </Fragment>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    {formDataEmployee.blockRule && formDataEmployee.blockRule.length > 0 && (
                      <div className="lv__item lv__2">
                        {formDataEmployee.blockRule.map((item, idx) => {
                          return (
                            <div key={idx} className="box__block--rule">
                              <span className="view__logical">{formDataEmployee.logical === "and" ? "And" : "Or"}</span>

                              <div className="block__rule">
                                <div className="action__choose--item action__choose--lv2">
                                  <Button
                                    color={item.logical === "and" ? "primary" : "secondary"}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handChangeLogicalEmployee(idx, "and");
                                    }}
                                    // disabled={disableFieldCommom}
                                  >
                                    AND
                                  </Button>
                                  <Button
                                    color={item.logical === "or" ? "primary" : "secondary"}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handChangeLogicalEmployee(idx, "or");
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
                                      handDeleteItemBlockEmployee(idx);
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
                                                <div className="info-item" style={!el.fieldName ? {width: '100%' } : {}}>
                                                  {/* <span className="name-field">{el.fieldName}</span> */}
                                                  <div className={"container-select-mapping"}>
                                                    {!el.typeFieldName ? 
                                                      <div className="input-text">
                                                        <Input
                                                          name={el.fieldName}
                                                          fill={false}
                                                          value={el.fieldName}
                                                          // disabled={disableFieldCommom}
                                                          onChange={(e) => {
                                                            setFormDataEmployee({
                                                              ...formDataEmployee,
                                                              blockRule: [...formDataEmployee.blockRule].map((el, ids) => {
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
                                                      :
                                                      <div className="select-mapping">
                                                          <SelectCustom
                                                              key={el.typeFieldName}
                                                              id=""
                                                              name=""
                                                              // label="Chọn biểu mẫu"
                                                              options={[]}
                                                              fill={false}
                                                              value={el.fieldName ? {value: el.fieldName, label: el.fieldName} : null}
                                                              special={true}
                                                              required={true}
                                                              onChange={(e) =>handlePushRuleBlockEmployee(e, index, idx)}
                                                              isAsyncPaginate={true}
                                                              isFormatOptionLabel={false}
                                                              placeholder={el.typeFieldName === 1 ? 'Chọn trường trong form' : 'Chọn biến'}
                                                              additional={{
                                                                  page: 1,
                                                              }}
                                                              loadOptionsPaginate={el.typeFieldName === 1 ? loadedOptionEmployee : loadedOptionAttribute}
                                                              // formatOptionLabel={formatOptionLabelEmployee}
                                                              // error={checkFieldEform}
                                                              // message="Biểu mẫu không được bỏ trống"
                                                          />
                                                      </div>
                                                    }
                                                      <Tippy  
                                                          content={el.typeFieldName === 0 ? 'Chuyển chọn trường trong form' : el.typeFieldName === 1 ? 'Chuyển chọn biến' : 'Chuyển nhập giá trị'}
                                                      >
                                                          <div 
                                                              className={'icon-change-select'}
                                                              onClick={(e) => {
                                                                console.log('da vao');
                                                                
                                                                setFormDataEmployee({
                                                                  ...formDataEmployee,
                                                                  blockRule: [...formDataEmployee.blockRule].map((il, ids) => {
                                                                    if (ids === idx) {
                                                                      return {
                                                                        ...il,
                                                                        rule: [...il.rule].map((ol, i) => {
                                                                          if (i === index) {
                                                                            return {
                                                                              ...ol,
                                                                              typeFieldName: el.typeFieldName === 0 ? 1 : el.typeFieldName === 1 ? 2 : 0,
                                                                              nodeId: '',
                                                                              type: ''
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
                                                              <Icon name="ResetPassword" style={{width: 18}} />
                                                          </div>
                                                      </Tippy>
                                                  </div>
                                                </div>

                                                {el.fieldName ? 
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
                                                      onChange={(e) => handleChangeValueBlockConditionEmployee(e, index, idx)}
                                                    />
                                                  </div>
                                                : null}

                                                {el.fieldName ? 
                                                  <div className="info-item">
                                                    <div className={"container-select-mapping"}>
                                                      {!el.typeValue ? 
                                                        <div className="input-text">
                                                          <Input
                                                            name={el.fieldName}
                                                            fill={false}
                                                            value={el.value}
                                                            // disabled={disableFieldCommom}
                                                            onChange={(e) => handChangeValueTypeBlockItemEmployee(e, index, idx, "input")}
                                                            // placeholder={`Nhập ${il.fieldName?.toLowerCase()}`}
                                                            placeholder={`Nhập giá trị`}
                                                          />
                                                        </div>
                                                        :
                                                        <div className="select-mapping">
                                                          <SelectCustom
                                                              key={el.typeValue}
                                                              id=""
                                                              name=""
                                                              // label="Chọn biểu mẫu"
                                                              options={[]}
                                                              fill={false}
                                                              value={el.value ? {value: el.value, label: el.value} : null}
                                                              special={true}
                                                              required={true}
                                                              onChange={(e) => handChangeValueTypeBlockItemEmployee(e, index, idx, el.typeValue === 1 ? 'form' : 'var')}
                                                              isAsyncPaginate={true}
                                                              isFormatOptionLabel={false}
                                                              placeholder={el.typeValue === 1 ? 'Chọn trường trong form' : 'Chọn biến'}
                                                              additional={{
                                                                  page: 1,
                                                              }}
                                                              loadOptionsPaginate={el.typeValue === 1 ? loadedOptionObject : loadedOptionAttribute}
                                                              // formatOptionLabel={formatOptionLabelEmployee}
                                                              // error={checkFieldEform}
                                                              // message="Biểu mẫu không được bỏ trống"
                                                          />
                                                        </div>
                                                      }
                                                      <Tippy  
                                                        content={el.typeValue === 0 ? 'Chuyển chọn trường trong form' : el.typeValue === 1 ? 'Chuyển chọn biến' : 'Chuyển nhập giá trị'}
                                                      >
                                                        <div 
                                                          className={'icon-change-select'}
                                                          onClick={(e) => {
                                                            setFormDataEmployee({
                                                              ...formDataEmployee,
                                                              blockRule: [...formDataEmployee.blockRule].map((il, ids) => {
                                                                if (ids === idx) {
                                                                  return {
                                                                    ...il,
                                                                    rule: [...il.rule].map((ol, i) => {
                                                                      if (i === index) {
                                                                        return {
                                                                          ...ol,
                                                                          typeValue: el.typeValue === 0 ? 1 : el.typeValue === 1 ? 2 : 0,
                                                                          value: ''
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
                                                            <Icon name="ResetPassword" style={{width: 18}} />
                                                        </div>
                                                      </Tippy>
                                                    </div>
                                                    
                                                  </div>
                                                : null}
                                              </div>

                                              <div className="action__add--rule">
                                                  <Tippy content="Thêm">
                                                      <span className="icon__add" 
                                                          onClick={() => {
                                                            setFormDataEmployee({
                                                              ...formDataEmployee,
                                                              blockRule: [...formDataEmployee.blockRule].map((el, index) => {
                                                                if (index === idx) {
                                                                  return {
                                                                    ...el,
                                                                    rule: [
                                                                      ...el.rule, 
                                                                      {
                                                                        typeFieldName: 1,//1-chọn trường trong form, 2-chọn biến quy trình
                                                                        fieldName: null,
                                                                        nodeId: null,
                                                                        operator: "eq",
                                                                        value: "",
                                                                        typeValue: 0,// 0- nhập text, 1-chọn trường trong form, 2-chọn biến quy trình
                                                                        type: null
                                                                      }
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
                                              {item.rule.length > 1 ?
                                                <div className="action__delete--rule">
                                                  <Tippy content="Xóa">
                                                    <span className="icon__delete" onClick={() => handleDeleteBlockItemFieldEmployee(index, idx)}>
                                                      <Icon name="Trash" />
                                                    </span>
                                                  </Tippy>
                                                </div>
                                               : null}
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

                <div className="form-group">
                  <SelectCustom
                    id=""
                    name=""
                    label="Phương pháp lọc"
                    options={[
                      {
                        value: 'NONE',
                        label: 'NONE'
                      },
                      {
                        value: 'BALANCE',
                        label: 'BALANCE'
                      },
                      {
                        value: 'ROUND_ROBIN',
                        label: 'ROUND_ROBIN'
                      },

                    ]}
                    fill={true}
                    value={pickMode}
                    special={true}
                    required={true}
                    onChange={(e) => {
                      setPickMode(e);
                    }}
                    isAsyncPaginate={false}
                    isFormatOptionLabel={false}
                    placeholder={'Chọn phương pháp'}
                    additional={{
                        page: 1,
                    }}
                    // loadOptionsPaginate={item.typeValue === 1 ? loadedOptionEmployee : loadedOptionAttribute}
                  />
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
