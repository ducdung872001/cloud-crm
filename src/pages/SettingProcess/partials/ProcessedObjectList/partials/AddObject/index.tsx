import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { convertToId, formatCurrency, isDifferenceObj } from "reborn-util";
import QuoteService from "services/QuoteService";
import FSQuoteService from "services/FSQuoteService";

import "./index.scss";
import SheetFieldQuoteFormService from "services/SheetFieldQuoteFormService";
import RadioList from "components/radio/radioList";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import { ContextType, UserContext } from "contexts/userContext";
import CustomerService from "services/CustomerService";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import ProductService from "services/ProductService";
import ServiceService from "services/ServiceService";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import EmployeeService from "services/EmployeeService";
import { IEmployeeResponse } from "model/employee/EmployeeResponseModel";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import ProcessedObjectService from "services/ProcessedObjectService";
import Input from "components/input/input";
import ObjectGroupService from "services/ObjectGroupService";
import ContractEformService from "services/ContractEformService";
import { SelectOptionData } from "utils/selectCommon";
import Checkbox from "components/checkbox/checkbox";
import CheckboxList from "components/checkbox/checkboxList";
import NummericInput from "components/input/numericInput";
import TextArea from "components/textarea/textarea";
import { Parser } from "formula-functionizer";
import moment from "moment";
import ObjectExtraInfoService from "services/ObjectExtraInfoService";
import ObjectAttributeService from "services/ObjectAttributeService";


interface IAddObjectProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data: any;
  contractId?: number;
}

export default function AddObject(props: IAddObjectProps) {
  const { onShow, onHide, data, contractId } = props;

  const { dataBranch } = useContext(UserContext) as ContextType;
  const parser = new Parser();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [detailObject, setDetailObject] = useState(null);
  const [validateFieldObject, setValidateFieldObject] = useState<boolean>(false);
  const [detailObjectType, setDetailObjectType] = useState(null);
  const [validateFieldObjectType, setValidateFieldObjectType] = useState<boolean>(false);
  const [detailEmployee, setDetailEmployee] = useState(null);
  const [validateFieldEmployee, setValidateFieldEmployee] = useState<boolean>(false);

  useEffect(() => {
    if(onShow && data){
      setDetailObjectType(data.groupId ? {value: data.groupId, label: data.groupName} : null)
    }
  }, [data, onShow])

  const values = useMemo(
    () =>
      ({
        // objectId: data?.objectId ?? null,
        // objectName: data?.objectName ?? '',
        groupId: data?.groupId ?? 0,
        name: data?.name ?? '',
        // employeeId: data?.employeeId ?? null,
        // startTime: data?.startTime ?? '',
        // endTime: data?.endTime ?? '',
        // processId: data?.processId ?? null,
        status: data?.status ?? null
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const loadOptionObjectType = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 10,
    };
    const response = await ObjectGroupService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: ICustomerResponse) => {
                return {
                  value: item.id,
                  label: item.name,
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

  const handleChangeValueObjectType = (e) => {
    setValidateFieldObjectType(false);
    setDetailObjectType(e);
    setFormData({ ...formData, values: {...formData.values, groupId: e.value }})
  };



  const handleChangeValueObject = (e) => {
    setValidateFieldObject(false);
    setDetailObject(e);
    setFormData({ ...formData, values: {...formData.values, objectId: e.value, objectName: e.label }})
  };


  const loadOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: ICustomerFilterRequest = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };
    const response = await CustomerService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: ICustomerResponse) => {
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

  // const formatOptionLabelCustomer = ({ label, avatar }) => {
  //   return (
  //     <div className="selected--item">
  //       <div className="avatar">
  //         <img src={avatar || ImageThirdGender} alt={label} />
  //       </div>
  //       {label}
  //     </div>
  //   );
  // };

  const loadOptionProduct = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };
    const response = await ProductService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: any) => {
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


  const loadOptionService = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };
    const response = await ServiceService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: any) => {
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

  const loadOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };
    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: IEmployeeResponse) => {
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

  //? đoạn này xử lý vấn đề thay đổi nhân viên phụ trách
  const handleChangeValueEmployee = (e) => {
    setValidateFieldEmployee(false);
    setDetailEmployee(e)
    setFormData({ ...formData, values: {...formData.values, employeeId: e.value }})

  };

  const startDay = new Date(formData.values.startDate).getTime();
  const endDay = new Date(formData.values.endDate).getTime();

  //* ngày bắt đầu
  const [checkFieldStartDate, setCheckFieldStartDate] = useState<boolean>(false);
  const handleChangeValueStartDate = (e) => {
    setCheckFieldStartDate(false);

    setFormData({ ...formData, values: { ...formData?.values, startDate: e } });
  };

  //* ngày kết thúc
  const [checkFieldEndDate, setCheckFieldEndDate] = useState<boolean>(false);
  const handleChangeValueEndDate = (e) => {
    setCheckFieldEndDate(false);

    setFormData({ ...formData, values: { ...formData?.values, endDate: e } });
  };



  const objectType = [
    {
      value: 1,
      label: 'Khách hàng'
    },
    {
      value: 2,
      label: 'Sản phẩm'
    },
    {
      value: 3,
      label: 'Dịch vụ'
    }

  ]

  const handleClearForm = (acc) => {
    onHide(acc);
    setDetailEmployee(null);
    setDetailObject(null);
    setCheckFieldEndDate(false);
    setCheckFieldStartDate(false);
    setValidateFieldEmployee(false);
    setValidateFieldObject(false);
    setMapObjectAttribute(null);
    setObjectExtraInfos([]);
    setDetailObjectType(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // const errors = Validate(validations, formData, listField);
    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    if(!setDetailObjectType){
      setValidateFieldObjectType(true);
      return;
    }

    // if(!detailEmployee){
    //   setValidateFieldEmployee(true);
    //   return;
    // }

    // if (!formData?.values?.startDate) {
    //   setCheckFieldStartDate(true);
    //   return;
    // }

    // if (!formData?.values?.endDate) {
    //   setCheckFieldEndDate(true);
    //   return;
    // }


    setIsSubmit(true);
    const body = {
      ...formData.values,
      ...(data ? { id: data.id } : {}),
      objectExtraInfos: objectExtraInfos,
    };

    const response = await ProcessedObjectService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} đối tượng thành công`, "success");
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
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
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
        handleClearForm(false);
        setShowDialog(false);
        setContentDialog(null);
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
          handleClearForm(false);
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

  const [objectExtraInfos, setObjectExtraInfos] = useState<any>([]);

  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);

  //Người đại diện pháp luật
  const [listContact, setListContact] = useState<IOption[]>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);
  const [listContract, setListContract] = useState<IOption[]>(null);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);
  const [mapObjectAttribute, setMapObjectAttribute] = useState<any>(null);

  console.log('mapObjectAttribute', mapObjectAttribute);
  
  const getObjectAttributes = async (groupId) => {
    // if (!mapObjectAttribute || mapObjectAttribute.length === 0) {
    //   const response = await ObjectAttributeService.listAll(groupId);
    //   if (response.code === 0) {
    //     const dataOption = response.result;
    //     setMapObjectAttribute(dataOption || {});
    //   }
    // }
    
    const response = await ObjectAttributeService.listAll(groupId);
      if (response.code === 0) {
        const dataOption = response.result;
        setMapObjectAttribute(dataOption || {});
      }
  };

  const onSelectOpenEmployee = async (data?: any) => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employeeId", { branchId: dataBranch.value });
      if (dataOption) {
        // setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
        setListEmployee([...(dataOption.length > 0 ? (data ? [data, ...dataOption] : dataOption) : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };

  const onSelectOpenContract = async () => {
    if (!listContact || listContact.length === 0) {
      setIsLoadingContract(true);
      const dataOption = await SelectOptionData("contractId");
      if (dataOption) {
        setListContract([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingContract(false);
    }
  };

  const onSelectOpenContact = async () => {
    if (!listContact || listContact.length === 0) {
      setIsLoadingContact(true);
      const dataOption = await SelectOptionData("contactId");
      if (dataOption) {
        setListContact([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingContact(false);
    }
  };

  useEffect(() => {
    if(detailObjectType?.value && onShow){
      getObjectAttributes(detailObjectType?.value);
    }
    

    if (data && onShow) {
      onSelectOpenEmployee();
      onSelectOpenContact();
      onSelectOpenContract();
      onSelectOpenCustomer();

    }
  }, [detailObjectType, onShow]);

  useEffect(() => {
    //Lấy thông tin objectExtraInfos
    if (data?.id && mapObjectAttribute) {
      getObjectExtraInfos(data?.id);
    }
  }, [data, mapObjectAttribute]);

  const getObjectExtraInfos = async (objectId) => {
    const response = await ObjectExtraInfoService.list(objectId);
    setObjectExtraInfos(response.code === 0 ? response.result : []);
  };

  const updateCustomerMultiselectAttribute = (attributeId, e) => {
    let attributeValue = e ? e.split(",") : [];
    updateCustomerAttribute(attributeId, JSON.stringify(attributeValue));
  };

  const updateCustomerAttribute = (attributeId, attributeValue) => {
    let objectId = data?.id || 0;

    let found = false;
    (objectExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        item.attributeValue = attributeValue;
        item.objectId = objectId;
        found = true;
      }
    });

    if (!found) {
      let item: any = {};
      item.attributeId = attributeId;
      item.attributeValue = attributeValue;
      item.objectId = objectId;
      objectExtraInfos[objectExtraInfos.length] = item;
    }

    setObjectExtraInfos([...objectExtraInfos]);
    setFormData({ ...formData, values: { ...formData?.values, timestamp: new Date().getTime() } });
  };

  const getCustomerAttributeValue = (attributeId) => {
    let attributeValue = "";
    (objectExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        attributeValue = item.attributeValue;
      }
    });

    return attributeValue;
  };

  const getDecimalScale = (attributes) => {
    attributes = attributes ? JSON.parse(attributes) : {};
    let numberFormat = attributes?.numberFormat || "";
    if (numberFormat.endsWith(".#")) {
      return 1;
    }

    if (numberFormat.endsWith(".##")) {
      return 2;
    }

    if (numberFormat.endsWith(".###")) {
      return 3;
    }

    return 0;
  };

  const onSelectOpenCustomer = async () => {
    if (!listCustomer || listCustomer.length === 0) {
      setIsLoadingCustomer(true);
      const dataOption = await SelectOptionData("customerId");

      if (dataOption) {
        setListCustomer([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCustomer(false);
    }
  };

  const handleChangeValueCustomerItemC = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueEmployeeItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueContactItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueContractItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };



  /**
   * Hiển thị giá trị theo công thức
   * @param attributes
   * @param isFormula
   */
   const getCustomerAttributeFormula = (attributes) => {
    let attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    let attrObj = {};
    (objectExtraInfos || []).map((item, idx) => {
      if (item.datatype == "number") {
        attrObj["customerAttribute_" + convertToId(item.attributeName)] = +item.attributeValue;
      }
    });
    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
  };

  /**
   * Trả về loại control theo kiểu dữ liệu tương ứng
   */
  const getControlByType = (customerAttribute) => {
    let CustomControl = (
      <Input
        id={`Id${customerAttribute.id}`}
        label={customerAttribute.name}
        fill={true}
        value={getCustomerAttributeValue(customerAttribute.id)}
        onChange={(e) => updateCustomerAttribute(customerAttribute.id, e.target.value)}
        placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
        required={!!customerAttribute.required}
      />
    );

    switch (customerAttribute.datatype) {
      case "textarea":
        CustomControl = (
          <TextArea
            label={customerAttribute.name}
            name={customerAttribute.name}
            value={getCustomerAttributeValue(customerAttribute.id)}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            fill={true}
            required={!!customerAttribute.required}
            readOnly={!!customerAttribute.readonly}
            onChange={(e) => updateCustomerAttribute(customerAttribute.id, e.target.value)}
            maxLength={459}
          />
        );
        break;
      case "number":
        CustomControl = (
          <NummericInput
            label={customerAttribute.name}
            name={customerAttribute.name}
            fill={true}
            required={!!customerAttribute.required}
            value={getCustomerAttributeValue(customerAttribute.id)}
            thousandSeparator={true}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            decimalScale={getDecimalScale(customerAttribute.attributes)}
            onChange={(e) => {
              const value = e.target.value;
              let valueNum = value?.replace(/,/g, "");
              updateCustomerAttribute(customerAttribute.id, valueNum);
            }}
          />
        );
        break;
      case "dropdown":
        CustomControl = (
          <SelectCustom
            name={customerAttribute.name}
            label={customerAttribute.name}
            fill={true}
            required={!!customerAttribute.required}
            readOnly={!!customerAttribute.readonly}
            // error={validateFieldPipeline}
            // message="Loại hợp đồng không được bỏ trống"
            options={customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : []}
            value={getCustomerAttributeValue(customerAttribute.id)}
            onChange={(e) => {
              updateCustomerAttribute(customerAttribute.id, e.value);
            }}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
          />
        );
        break;
      case "multiselect":
        let attris = getCustomerAttributeValue(customerAttribute.id);
        CustomControl = (
          <CheckboxList
            title={customerAttribute.name}
            required={!!customerAttribute.required}
            disabled={!!customerAttribute.readonly}
            options={customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : []}
            value={attris ? JSON.parse(attris).join(",") : ""}
            onChange={(e) => {
              updateCustomerMultiselectAttribute(customerAttribute.id, e);
            }}
          />
        );
        break;
      case "checkbox":
        CustomControl = (
          <Checkbox
            checked={!!getCustomerAttributeValue(customerAttribute.id)}
            label={customerAttribute.name}
            onChange={(e) => {
              updateCustomerAttribute(customerAttribute.id, e.target.checked);
            }}
          />
        );
        break;
      case "radio":
        CustomControl = (
          <RadioList
            name={customerAttribute.name}
            title={customerAttribute.name}
            options={customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : []}
            value={getCustomerAttributeValue(customerAttribute.id)}
            onChange={(e) => {
              updateCustomerAttribute(customerAttribute.id, e.target.value);
            }}
          />
        );
        break;
      case "date":
        CustomControl = (
          <DatePickerCustom
            label={customerAttribute.name}
            name={customerAttribute.name}
            fill={true}
            value={getCustomerAttributeValue(customerAttribute.id)}
            onChange={(e) => {
              const newDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
              updateCustomerAttribute(customerAttribute.id, newDate);
            }}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            required={!!customerAttribute.required}
            readOnly={!!customerAttribute.readonly}
            iconPosition="left"
            icon={<Icon name="Calendar" />}
            isMaxDate={false}
            // error={validateFieldSignDate}
            // message={`Vui lòng chọn ngày ký`}
          />
        );
        break;
      case "lookup":
        let attrs = customerAttribute.attributes ? JSON.parse(customerAttribute.attributes) : {};

        //1. Trường hợp là customer (khách hàng)
        //2. Trường hợp là employee (nhân viên)
        //3. Trường hợp là contract (hợp đồng)
        //4. Trường hợp là contact (người liên hệ)
        switch (attrs?.refType) {
          case "customer":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listCustomer || []}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItemC(e, customerAttribute)}
              />
            );
            break;
          case "employee":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listEmployee || []}
                onMenuOpen={onSelectOpenEmployee}
                isLoading={isLoadingEmployee}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueEmployeeItem(e, customerAttribute)}
              />
            );
            break;
          case "contract":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listContract || []}
                onMenuOpen={onSelectOpenContract}
                isLoading={isLoadingContract}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContractItem(e, customerAttribute)}
              />
            );
            break;
          case "contact":
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listContact || []}
                onMenuOpen={onSelectOpenContact}
                isLoading={isLoadingContact}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContactItem(e, customerAttribute)}
              />
            );
            break;
          default:
            CustomControl = (
              <SelectCustom
                label={customerAttribute.name}
                options={listCustomer || []}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!customerAttribute.required}
                readOnly={!!customerAttribute.readonly}
                value={+getCustomerAttributeValue(customerAttribute.id)}
                placeholder={`Chọn ${customerAttribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItemC(e, customerAttribute)}
              />
            );
        }
        break;
      case "formula":
        //Công thức được lấy từ trường động và trường tĩnh
        //{contract.dealValue + customerAttribute.xyz} => sẽ cần parser từ 2 đối tượng là contract và customerAttribute

        //Chỉ hiển thị chứ không lưu giá trị (nếu thêm mới thì không hiển thị?, sửa mới hiển thị)
        CustomControl = (
          <Input
            id={`Id${customerAttribute.id}`}
            label={customerAttribute.name}
            fill={true}
            value={getCustomerAttributeFormula(customerAttribute?.attributes)}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            disabled={true}
          />
        );
        break;
    }

    return CustomControl;
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-object"
        size="lg"
      >
        <form className="form-object-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} hồ sơ`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              {/* <RadioList
                title ='Loại đối tượng'
                name="object_type"
                options={objectType}
                value={formData.values?.objectType}
                onChange={(e) => {
                  setFormData({ ...formData, values: {...formData.values, objectType: +e.target.value, objectId: null, objectName: ''  }});
                  setDetailObject(null);
                }}
              /> */}

              {/* <div className="form-group">
                <SelectCustom
                  key={formData.values.objectType }
                  id="objectId"
                  name="objectId"
                  label="Chọn đối tượng"
                  fill={true}
                  required={true}
                  error={validateFieldObject}
                  message="Đối tượng không được bỏ trống"
                  options={[]}
                  value={detailObject}
                  onChange={(e) => handleChangeValueObject(e)}
                  isAsyncPaginate={true}
                  placeholder="Chọn đối tượng"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={formData.values.objectType === 1 ? loadOptionCustomer : formData.values.objectType === 2 ? loadOptionProduct : loadOptionService}
                />
              </div> */}

              <div className="form-group">
                <SelectCustom
                  key={formData.values.groupId }
                  id="groupId"
                  name="groupId"
                  label="Chọn loại hồ sơ"
                  fill={true}
                  required={true}
                  error={validateFieldObjectType}
                  message="Loại hồ sơ không được bỏ trống"
                  options={[]}
                  value={detailObjectType}
                  onChange={(e) => handleChangeValueObjectType(e)}
                  isAsyncPaginate={true}
                  placeholder="Chọn loại hồ sơ"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadOptionObjectType}
                />
              </div>

              <div className="form-group">
                <Input
                  label="Tên hồ sơ"
                  name="name"
                  fill={true}
                  required={true}
                  value={formData.values.name}
                  placeholder="Tên hồ sơ"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, values: {...formData.values, name: value }})
                  }}
                />
              </div>

              <div>
                {mapObjectAttribute ? (
                  <div className="list__object--attribute">
                    {Object.entries(mapObjectAttribute).map((lstEformAttribute: any, key: number) => (
                      <Fragment key={key}>
                        {(lstEformAttribute[1] || []).map((eformAttribute, index: number) => (
                          <Fragment key={index}>
                            {/* {!eformAttribute.parentId ? (
                              <label className="label-title" key={`parent_${key}`}>
                                {eformAttribute.name}
                              </label>
                            ) : null} */}
                            {/* {eformAttribute.parentId ? ( */}
                              <div
                                // className={`form-group ${eformAttribute.name.length >= 38 || lstEformAttribute[1].length == 2 ? "special-case" : ""}`}
                                className={`form-group `}
                                id={`Field${convertToId(eformAttribute.name)}`}
                                key={`index_${key}_${index}`}
                              >
                                {getControlByType(eformAttribute)}
                              </div>
                            {/* ) : null} */}
                          </Fragment>
                        ))}
                      </Fragment>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* <div className="form-group">
                <SelectCustom
                  id="employeeId"
                  name="employeeId"
                  label="Người phụ trách"
                  fill={true}
                  required={true}
                  error={validateFieldEmployee}
                  message="Người phụ trách không được bỏ trống"
                  options={[]}
                  value={detailEmployee}
                  onChange={(e) => handleChangeValueEmployee(e)}
                  isAsyncPaginate={true}
                  placeholder="Chọn người phụ trách"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadOptionEmployee}
                />
              </div>

              <div className="form-group">
                <DatePickerCustom
                  label="Bắt đầu"
                  name="startDate"
                  fill={true}
                  value={formData?.values?.startDate}
                  onChange={(e) => handleChangeValueStartDate(e)}
                  placeholder="Chọn ngày bắt đầu"
                  required={true}
                  iconPosition="left"
                  icon={<Icon name="Calendar" />}
                  error={checkFieldStartDate || startDay > endDay}
                  message={startDay > endDay ? "Ngày bắt đầu nhỏ hơn ngày kết thúc" : "Vui lòng chọn ngày bắt đầu"}
                />
              </div>

              <div className="form-group">
                <DatePickerCustom
                  label="Kết thúc"
                  name="endDate"
                  fill={true}
                  value={formData?.values?.endDate}
                  onChange={(e) => handleChangeValueEndDate(e)}
                  placeholder="Chọn ngày kết thúc"
                  required={true}
                  iconPosition="left"
                  icon={<Icon name="Calendar" />}
                  error={checkFieldEndDate || endDay < startDay}
                  message={endDay < startDay ? "Ngày kết thúc lớn hơn ngày bắt đầu" : "Vui lòng chọn ngày kết thúc"}
                />
              </div> */}

              
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
