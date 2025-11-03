import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getSearchParameters, isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IContractAlertRequest } from "model/contract/ContractRequestModel";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import CheckboxList from "components/checkbox/checkboxList";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";

import "./ExpireTimeWarning.scss";
import { IExpireTimeRequestModel } from "model/contract/ContractResponseModel";
import Tippy from "@tippyjs/react";
import Input from "components/input/input";
import { SelectOptionData } from "utils/selectCommon";
import ContractService from "services/ContractService";
import Button from "components/button/button";
import CustomerService from "services/CustomerService";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import ImageThirdGender from "assets/images/third-gender.png";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import EmployeeService from "services/EmployeeService";
import _ from "lodash";

export default function ExpireTimeWarning(props: any) {
  const { onHide, dataContract } = props;

  const refOptionExpireTimeWarning = useRef();
  const refContainerExpireTimeWarning = useRef();

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [data, setData] = useState(null);

  const [validateExpireTimeWarning, setValidateExpireTimeWarning] = useState<boolean>(false);
  const [methodNotificationList, setMethodNotificationList] = useState([]);

  const [addFieldEmail, setAddFieldEmail] = useState<any[]>([]);
  // console.log('addFieldEmail', addFieldEmail);
  const [sendToData, setSendToData] = useState([]);

  const [detailCustomer, setDetailCustomer] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);

  const [addFieldPhone, setAddFieldPhone] = useState<any[]>([]);
  const [listTemplateEmail, setListTemplateEmail] = useState<any[]>([]);
  const [isLoadingTemplateEmail, setIsLoadingTemplateEmail] = useState<boolean>(false);

  const [listTemplateSMS, setListTemplateSMS] = useState<any[]>([]);
  const [isLoadingTemplateSms, setIsLoadingTemplateSms] = useState<boolean>(false);

  const getDetailWarning = async () => {
    const response = await ContractService.guaranteeAlertList();

    if (response.code === 0) {
      const result = response.result;
      const newData = result?.find((el) => el.alertType === "end_date") || null;
      const channelEmail = newData?.channels?.find((el) => el.type === "email") || null;
      const channelSms = newData?.channels?.find((el) => el.type === "sms") || null;

      //   if(channelEmail){
      //     const listEmail = []
      //     channelEmail.contacts && channelEmail.contacts.length > 0 && channelEmail.contacts.map(item => {
      //         listEmail.push({email: item})
      //     })

      //     setAddFieldEmail(listEmail)
      //   }

      //   if(channelSms){
      //     const listPhone = []
      //     channelSms.contacts && channelSms.contacts.length > 0 && channelSms.contacts.map(item => {
      //         listPhone.push({phone: item})
      //     })
      //     setAddFieldPhone(listPhone)
      //   }

      if (channelEmail && channelSms) {
        setMethodNotificationList(["email", "sms"]);
      } else if (channelEmail) {
        setMethodNotificationList(["email"]);
      } else if (channelSms) {
        setMethodNotificationList(["sms"]);
      }

      // const customerInfo = {
      //   value: newData?.target?.customer?.id || null,
      //   label: newData?.target?.customer?.name || null,
      // }

      // if(customerInfo.value){
      //   setDetailCustomer(customerInfo)
      // } else {
      //   setDetailCustomer(null)
      // }

      const employeeList =
        newData?.employees?.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        }) || [];

      setEmployeeList(employeeList);
      setSendToData(newData?.sendTo || []);

      // if(customerInfo.value && employeeList.length > 0){
      //   setSendToData(['customer', 'employee'])
      // } else if(customerInfo.value){
      //   setSendToData(['customer'])
      // } else if(employeeList?.length > 0){
      //   setSendToData(['employee'])
      // }

      setData({
        id: newData?.id,
        expireTimeWarning: newData?.unitValue ?? "",
        expireTimeWarningUnit: newData?.unitName ?? "day",
        templateEmailId: channelEmail?.templateId ?? 0,
        templateSmsId: channelSms?.templateId ?? 0,
        // customerId: newData?.target?.customerId ?? 0,
        employeeList: newData?.employeeIds ?? [],
      });
      //   setData(newData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };
  useEffect(() => {
    // if(dataContract?.id){
    getDetailWarning();
    // }
  }, [dataContract]);

  const onSelectOpenTemplateEmail = async () => {
    if (!listTemplateEmail || listTemplateEmail.length === 0) {
      setIsLoadingTemplateEmail(true);
      const dataOption = await SelectOptionData("templateEmailId");
      if (dataOption) {
        setListTemplateEmail([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingTemplateEmail(false);
    }
  };

  useEffect(() => {
    if (data?.templateEmailId) {
      onSelectOpenTemplateEmail();
    }

    if (data?.templateEmailId == null) {
      setListTemplateEmail([]);
    }
  }, [data]);

  const onSelectOpenTemplateSms = async () => {
    if (!listTemplateSMS || listTemplateSMS.length === 0) {
      setIsLoadingTemplateSms(true);
      const dataOption = await SelectOptionData("templateSmsId");
      if (dataOption) {
        setListTemplateSMS([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingTemplateSms(false);
    }
  };

  useEffect(() => {
    if (data?.templateSmsId) {
      onSelectOpenTemplateSms();
    }

    if (data?.templateSmsId == null) {
      setListTemplateSMS([]);
    }
  }, [data]);

  const listOptionExpireTimeWarning = [
    {
      value: "day",
      label: "Ngày",
    },
    {
      value: "hour",
      label: "Giờ",
    },
    {
      value: "minute",
      label: "Phút",
    },
  ];

  const listNotificationType = [
    {
      value: "email",
      label: "Email",
    },
    {
      value: "sms",
      label: "SMS",
    },
  ];

  const sendToList = [
    {
      value: "customer",
      label: "Khách hàng",
    },
    {
      value: "employee",
      label: "Nội bộ tổ chức",
    },
  ];

  const [isOptionExpireTimeWarning, setIsOptionExpireTimeWarning] = useState<boolean>(false);
  useOnClickOutside(refOptionExpireTimeWarning, () => setIsOptionExpireTimeWarning(false), ["option__time--time"]);

  const [dataExpireTimeWarning, setDataExpireTimeWarning] = useState({
    value: "day",
    label: "Ngày",
  });
  console.log("dataExpireTimeWarning", dataExpireTimeWarning);

  useEffect(() => {
    if (data) {
      setDataExpireTimeWarning({
        value: data?.expireTimeWarningUnit || "hour",
        label: data?.expireTimeWarningUnit === "hour" ? "Giờ" : data.expireTimeWarningUnit === "day" ? "Ngày" : "Phút",
      });

      //   if (data.emails && JSON.parse(data.emails) && JSON.parse(data.emails).length > 0) {
      //     setMethodNotificationList((oldArray) => [...oldArray, "email"]);
      //     setAddFieldEmail(JSON.parse(data.emails));
      //   }

      //   if (data.phoneNumbers && JSON.parse(data.phoneNumbers) && JSON.parse(data.phoneNumbers).length > 0) {
      //     setMethodNotificationList((oldArray) => [...oldArray, "sms"]);
      //     setAddFieldPhone(JSON.parse(data.phoneNumbers));
      //   }
    }
  }, [data]);

  const values = useMemo(
    () =>
      ({
        id: data?.id,
        // contractId: dataContract?.id,
        alertType: "end_date",
        // endDate: dataContract?.endDate,
        expireTimeWarning: data?.expireTimeWarning ?? "",
        expireTimeWarningUnit: data?.expireTimeWarningUnit ?? "day",
        templateEmailId: data?.templateEmailId ?? 0,
        templateSmsId: data?.templateSmsId ?? 0,
        // customerId: data?.customerId ?? 0,
        employeeList: data?.employeeList ?? [],
      } as any),
    [data, dataContract]
  );

  const validations: IValidation[] = [
    //   {
    //     name: "name",
    //     rules: "required",
    //   },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const listField = useMemo(
    () =>
      [
        {
          name: "expiretime",
          type: "custom",
          snippet: (
            <div className="wrapper__workload">
              <NummericInput
                id="expireTime"
                name="expireTime"
                label="Thời gian cảnh báo trước"
                value={formData?.values?.expireTimeWarning}
                fill={true}
                placeholder="Nhập thời gian"
                required={true}
                error={validateExpireTimeWarning || (formData?.values?.expireTimeWarning !== "" && formData?.values?.expireTimeWarning == 0)}
                message={`${
                  validateExpireTimeWarning
                    ? "Vui lòng nhập thời gian"
                    : formData?.values?.expireTimeWarning !== "" && formData?.values?.expireTimeWarning == 0
                    ? "Thời gian cần lớn hơn 0"
                    : ""
                }`}
                onValueChange={(e) => handleChangeValueTime(e)}
              />

              <div className="option__time" ref={refContainerExpireTimeWarning}>
                <div
                  className="selected__item--time"
                  onClick={() => {
                    setIsOptionExpireTimeWarning(!isOptionExpireTimeWarning);
                  }}
                >
                  {dataExpireTimeWarning.label}
                  <Icon name="ChevronDown" />
                </div>
                {isOptionExpireTimeWarning && (
                  <ul className="menu__time" ref={refOptionExpireTimeWarning}>
                    {listOptionExpireTimeWarning.map((item, idx) => (
                      <li
                        key={idx}
                        className={`item--time ${dataExpireTimeWarning.value === item.value ? "active__item--time" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setDataExpireTimeWarning(item);
                          setIsOptionExpireTimeWarning(false);
                        }}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ),
        },

        {
          name: "notification",
          type: "custom",
          snippet: (
            <div className="notification-calendar">
              <div className="info-notification">
                <div className="choose-notification">
                  <CheckboxList
                    title="Cảnh báo qua"
                    options={listNotificationType}
                    value={methodNotificationList.join()}
                    onChange={(e) => handleSelectMethod(e)}
                  />
                </div>
              </div>
            </div>
          ),
        },

        {
          label: "Chọn mẫu Email",
          name: "templateEmailId",
          type: "select",
          fill: true,
          required: true,
          options: listTemplateEmail,
          onMenuOpen: onSelectOpenTemplateEmail,
          isLoading: isLoadingTemplateEmail,
        },

        {
          label: "Chọn mẫu Sms",
          name: "templateSmsId",
          type: "select",
          fill: true,
          required: true,
          options: listTemplateSMS,
          onMenuOpen: onSelectOpenTemplateSms,
          isLoading: isLoadingTemplateSms,
        },

        {
          name: "sendTo",
          type: "custom",
          snippet: (
            <div className="notification-calendar">
              <div className="info-notification">
                <div className="choose-notification">
                  <CheckboxList title="Gửi đến" options={sendToList} value={sendToData.join()} onChange={(e) => handleSelectSendTo(e)} />
                </div>
              </div>
            </div>
          ),
        },
      ] as IFieldCustomize[],
    [
      listOptionExpireTimeWarning,
      isOptionExpireTimeWarning,
      dataExpireTimeWarning,
      validateExpireTimeWarning,
      formData?.values,
      listNotificationType,
      methodNotificationList,
      listTemplateEmail,
      listTemplateSMS,
      data,
      sendToList,
      sendToData,
    ]
  );

  const handleChangeValueTime = (e) => {
    oninput = () => {
      setValidateExpireTimeWarning(false);
    };
    const value = e.value;
    setFormData({ ...formData, values: { ...formData?.values, expireTimeWarning: +value } });
  };

  useEffect(() => {
    setFormData({ ...formData, values: { ...formData?.values, expireTimeWarningUnit: dataExpireTimeWarning.value } });
  }, [dataExpireTimeWarning]);

  const handleSelectMethod = (e) => {
    if (e) {
      setMethodNotificationList(e ? e.split(",") : []);

      if (e.split(",").includes("sms")) {
        if (addFieldPhone.length === 0) {
          setAddFieldPhone([{ phone: "" }]);
        }
      } else {
        setAddFieldPhone([]);
        setFormData({ ...formData, values: { ...formData?.values, templateSmsId: "" } });
      }

      if (e.split(",").includes("email")) {
        if (addFieldEmail.length === 0) {
          setAddFieldEmail([{ email: "" }]);
        }
      } else {
        setAddFieldEmail([]);
        setFormData({ ...formData, values: { ...formData?.values, templateEmailId: "" } });
      }
    } else {
      setMethodNotificationList([...methodNotificationList]);
      if (methodNotificationList.includes("email")) {
        setAddFieldEmail([...addFieldEmail]);
      }

      if (methodNotificationList.includes("sms")) {
        setAddFieldPhone([...addFieldPhone]);
      }
    }
  };

  useEffect(() => {
    setFormData({ ...formData, values: { ...formData?.values, methods: JSON.stringify(methodNotificationList) } });
  }, [methodNotificationList]);

  const handleSelectSendTo = (e) => {
    if (e) {
      setSendToData(e ? e.split(",") : []);

      if (!e.split(",").includes("customer")) {
        setDetailCustomer(null);
        setFormData({ ...formData, values: { ...formData?.values, customerId: 0 } });
      }

      if (!e.split(",").includes("employee")) {
        setEmployeeList([]);
        setFormData({ ...formData, values: { ...formData?.values, employeeList: [] } });
      }
    } else {
      setSendToData([...sendToData]);
      if (sendToData.includes("customer")) {
        setDetailCustomer(detailCustomer);
      }

      if (sendToData.includes("employee")) {
        setEmployeeList([...employeeList]);
      }
    }
  };

  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: ICustomerFilterRequest = {
      keyword: search,
      page: page,
      limit: 10,
    };

    const response = await CustomerService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: `${item.name} - ${item.phoneMasked}`,
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

  const formatOptionLabelCustomer = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueCustomer = (e) => {
    setDetailCustomer(e);
    setFormData({ ...formData, values: { ...formData?.values, customerId: e.value } });
  };

  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
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

  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueEmployee = (e) => {
    setEmployeeList(e);
    const employeeIds = e.map((item) => {
      return item.value;
    });
    setFormData({ ...formData, values: { ...formData?.values, employeeList: employeeIds } });
  };

  //! đoạn này xử lý vấn đề lấy giá trị của email khi thêm nhiều
  const handleChangeValueEmailItem = (e, idx) => {
    const value = e.target.value;

    setAddFieldEmail((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, email: value };
        }
        return obj;
      })
    );
  };

  //! xóa đi 1 item email
  const handleRemoveItemEmail = (idx) => {
    let result = [...addFieldEmail];
    result.splice(idx, 1);

    setAddFieldEmail(result);
  };

  //! đoạn này gom hết những trường emails mình mới add vào rồi gửi đi
  //   useEffect(() => {
  //     if (addFieldEmail.length > 0) {
  //       setFormData({ ...formData, values: { ...formData?.values, emails: JSON.stringify(addFieldEmail) } });
  //     } else {
  //       setFormData({ ...formData, values: { ...formData?.values, emails: JSON.stringify([]) } });
  //     }
  //   }, [addFieldEmail]);

  //! đoạn này xử lý vấn đề lấy giá trị của phone khi thêm nhiều
  const handleChangeValuePhoneItem = (e, idx) => {
    const value = e.target.value;

    setAddFieldPhone((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, phone: value };
        }
        return obj;
      })
    );
  };

  //! xóa đi 1 item phone
  const handleRemoveItemPhone = (idx) => {
    let result = [...addFieldPhone];
    result.splice(idx, 1);

    setAddFieldPhone(result);
  };

  //! đoạn này gom hết những trường phoneNumbers mình mới add vào rồi gửi đi
  //   useEffect(() => {
  //     if (addFieldPhone.length > 0) {
  //       setFormData({ ...formData, values: { ...formData?.values, phoneNumbers: JSON.stringify(addFieldPhone) } });
  //     } else {
  //       setFormData({ ...formData, values: { ...formData?.values, phoneNumbers: JSON.stringify([]) } });
  //     }
  //   }, [addFieldPhone]);

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (!formData.values.expireTimeWarning) {
      showToast("Vui lòng nhập thời gian cảnh báo trước", "error");
      return;
    }

    if (methodNotificationList.length === 0) {
      showToast("Vui lòng chọn cảnh báo qua Email hoặc SMS", "error");
      return;
    }

    if (methodNotificationList.length > 0 && methodNotificationList.includes("email") && !formData.values.templateEmailId) {
      showToast("Vui lòng nhập đủ thông tin Email", "error");
      return;
    }

    if (methodNotificationList.length > 0 && methodNotificationList.includes("sms") && !formData.values.templateSmsId) {
      showToast("Vui lòng nhập đủ thông tin SMS", "error");
      return;
    }

    if (sendToData.length === 0) {
      showToast("Vui lòng chọn gửi đến ai", "error");
      return;
    }

    // if(sendToData.length > 0 && sendToData.includes('customer') && !formData.values.customerId){
    //     showToast( "Vui lòng chọn khách hàng", "error");
    //     return;
    // }

    if (sendToData.length > 0 && sendToData.includes("employee") && formData.values.employeeList.length === 0) {
      showToast("Vui lòng chọn nhân viên", "error");
      return;
    }

    setIsSubmit(true);

    const methodList = [...methodNotificationList];
    let newChannels = [];
    if (methodList?.length > 0) {
      methodList.map((item) => {
        newChannels.push({
          type: item,
          templateId: item === "email" ? formData.values.templateEmailId : formData.values.templateSmsId,
          contacts:
            item === "email"
              ? addFieldEmail.map((el) => {
                  return el.email;
                })
              : addFieldPhone.map((el) => {
                  return el.phone;
                }),
        });
      });
    }

    // console.log('newChannels', newChannels);

    const body = {
      id: formData.values.id,
      alertType: "end_date",
      // contractId: formData.values.contractId,
      unitName: dataExpireTimeWarning.value,
      unitValue: formData.values.expireTimeWarning,
      channels: newChannels,
      // target: {
      //     customerId: formData.values.customerId,
      //     employeeIds: formData.values.employeeList,
      // },
      employeeIds: formData.values.employeeList,
      sendTo: sendToData,
    };

    console.log("body", body);
    const response = await ContractService.guaranteeAlertUpdate(body);

    if (response.code === 0) {
      showToast(`Cập nhật cảnh báo thành công`, "success");
      //   onHide(true);
      //   setAddFieldEmail([]);
      //   setAddFieldPhone([]);
      //   setMethodNotificationList([]);
      //   setDataExpireTimeWarning({ value: "D", label: "Ngày" });
      //   setData(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handleClearForm = () => {
    onHide(false);
    setDataExpireTimeWarning({ value: "D", label: "Ngày" });
    setData(null);
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
              !isDifferenceObj(formData.values, values) ? handleClearForm() : showDialogConfirmCancel();
            },
          },
          {
            //   title: id ? "Cập nhật" : "Tạo mới",
            title: "Lưu lại",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              validateExpireTimeWarning ||
              !formData?.values?.expireTimeWarning ||
              (formData?.values?.expireTimeWarning !== "" && formData?.values?.expireTimeWarning == 0) ||
              (methodNotificationList && methodNotificationList.length === 0) ||
              (methodNotificationList &&
                methodNotificationList.length > 0 &&
                methodNotificationList.includes("email") &&
                !formData?.values?.templateEmailId) ||
              (methodNotificationList &&
                methodNotificationList.length > 0 &&
                methodNotificationList.includes("sms") &&
                !formData?.values?.templateSmsId) ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, validateExpireTimeWarning]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác`}</Fragment>,
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
        onHide(false);
        setDataExpireTimeWarning({ value: "H", label: "Giờ" });
        setData(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  return (
    <div className="expireTime__form">
      <div className="list-form-group">
        {listField.map((field, index) =>
          field.name === "expiretime" || field.name === "notification" ? (
            <FieldCustomize
              key={index}
              field={field}
              handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
              formData={formData}
            />
          ) : null
        )}
      </div>

      {/* Thông tin email */}
      {methodNotificationList && methodNotificationList.length > 0 && methodNotificationList.includes("email") ? (
        <div className="list-form-template">
          {listField.map((field, index) =>
            field.name === "templateEmailId" ? (
              <FieldCustomize
                key={index}
                field={field}
                handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                formData={formData}
              />
            ) : null
          )}
        </div>
      ) : null}

      {/* {addFieldEmail && addFieldEmail.length > 0 ? (
            <div className="list__email">
                {addFieldEmail.map((item, idx) => {
                    return (
                        <div key={idx} className="email__item">
                            <div className="form-group-box">
                                <Input
                                    label={idx === 0 ? "Email" : ""}
                                    // options={listEmail || []}
                                    fill={true}
                                    required={true}
                                    value={item.email}
                                    placeholder="Nhập email"
                                    onChange={(e) => handleChangeValueEmailItem(e, idx)}
                                />
                            </div>
                            {idx == 0 ? (
                                <span className="add-email">
                                    <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                        <span
                                            className="icon-add"
                                            onClick={() => {
                                                setAddFieldEmail([...addFieldEmail, { email: "" }]);
                                            }}
                                            >
                                            <Icon name="PlusCircleFill" />
                                        </span>
                                    </Tippy>
                                </span>
                            ) : (
                                <span className="remove-email">
                                    <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                        <span className="icon-remove" onClick={() => handleRemoveItemEmail(idx)}>
                                            <Icon name="Trash" />
                                        </span>
                                    </Tippy>
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        ) : null} */}

      {/* {methodNotificationList && methodNotificationList.length === 2 ? <div style={{ border: "1px solid", borderColor: "#F2F2F2" }} /> : null} */}
      {/* Thông tin sdt  */}
      {methodNotificationList && methodNotificationList.length > 0 && methodNotificationList.includes("sms") ? (
        <div className="list-form-template">
          {listField.map((field, index) =>
            field.name === "templateSmsId" ? (
              <FieldCustomize
                key={index}
                field={field}
                handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                formData={formData}
              />
            ) : null
          )}
        </div>
      ) : null}

      {<div style={{ border: "1px solid", borderColor: "#F2F2F2", marginLeft: "1.6rem", marginRight: "1.6rem" }} />}

      <div className="list-form-group">
        {listField.map((field, index) =>
          field.name === "sendTo" ? (
            <FieldCustomize
              key={index}
              field={field}
              handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
              formData={formData}
            />
          ) : null
        )}

        {/* {sendToData.includes('customer') &&
                <div className="form-group">
                    <SelectCustom
                        id="customerId"
                        name="customerId"
                        label="Khách hàng"
                        options={[]}
                        fill={true}
                        value={detailCustomer}
                        required={true}
                        onChange={(e) => handleChangeValueCustomer(e)}
                        isAsyncPaginate={true}
                        isFormatOptionLabel={true}
                        placeholder="Chọn khách hàng"
                        additional={{
                            page: 1,
                        }}
                        loadOptionsPaginate={loadedOptionCustomer}
                        formatOptionLabel={formatOptionLabelCustomer}
                        // error={checkFieldCustomer}
                        // message="Khách hàng không được bỏ trống"
                        // isLoading={data?.customerId ? isLoadingCustomer : null}
                    />
                </div>
            } */}

        {sendToData.includes("employee") && (
          <div>
            <SelectCustom
              id="employeeId"
              name="employeeId"
              label="Nhân viên"
              options={[]}
              fill={true}
              value={employeeList}
              required={true}
              isMulti={true}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn nhân viên"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              // error={checkFieldEmployee}
              // message="Nhân viên thực hiện tư vấn không được bỏ trống"
              // isLoading={data?.consultantId ? isLoadingEmployee : null}
            />
          </div>
        )}
      </div>

      {/* <div className="list__email">
            {addFieldPhone.map((item, idx) => {
                return (
                    <div key={idx} className="email__item">
                        <div className="form-group-box">
                            <Input
                                label={idx === 0 ? "Số điện thoại" : ""}
                                fill={true}
                                required={true}
                                value={item.phone}
                                placeholder="Nhập số điện thoại"
                                onChange={(e) => handleChangeValuePhoneItem(e, idx)}
                            />
                        </div>
                        {idx == 0 ? (
                            <span className="add-email">
                                <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                <span
                                    className="icon-add"
                                    onClick={() => {
                                    setAddFieldPhone([...addFieldPhone, { phone: "" }]);
                                    }}
                                >
                                    <Icon name="PlusCircleFill" />
                                </span>
                                </Tippy>
                            </span>
                        ) : (
                        <span className="remove-email">
                            <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                <span className="icon-remove" onClick={() => handleRemoveItemPhone(idx)}>
                                    <Icon name="Trash" />
                                </span>
                            </Tippy>
                        </span>
                        )}
                    </div>
                );
            })}
        </div> */}

      <div style={{ justifyContent: "flex-end", display: "flex", marginRight: "1.2rem", marginBottom: "1.2rem" }}>
        <Button
          // type="submit"
          color="primary"
          disabled={_.isEqual(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0)}
          onClick={(e) => {
            onSubmit(e);
          }}
        >
          Xác nhận
        </Button>
      </div>
    </div>
  );
}
