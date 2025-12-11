/* eslint-disable prefer-const */
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Icon from "components/icon";
import Input from "components/input/input";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddCustomerModalProps } from "model/customer/PropsModel";
import { ICustomerRequest } from "model/customer/CustomerRequestModel";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement, useOnClickOutside } from "utils/hookCustom";
import { EMAIL_REGEX, PHONE_REGEX } from "utils/constant";
import { SelectOptionData } from "utils/selectCommon";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { convertToId } from "reborn-util";
import "./ModalAddPartner.scss";
import { ContextType, UserContext } from "contexts/userContext";
import { Parser } from "formula-functionizer";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import CheckboxList from "components/checkbox/checkboxList";
import Checkbox from "components/checkbox/checkbox";
import RadioList from "components/radio/radioList";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import Tippy from "@tippyjs/react";
import PartnerService from "services/PartnerService";
import PartnerExtraInfoService from "services/PartnerExtraInfoService";
import PartnerAttributeService from "services/PartnerAttributeService";
import _ from "lodash";
import CodeService from "services/CodeService";

export default function ModalAddPartner(props: any) {
  const { onShow, data, onHide, takeInfoPartner, lstDataOrigin } = props;

  const focusedElement = useActiveElement();
  const parser = new Parser();
  const checkUserRoot = localStorage.getItem("user.root");

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [partnerExtraInfos, setPartnerExtraInfos] = useState<any>([]);
  const [isShowPhone, setIsShowPhone] = useState<boolean>(false);
  const [isShowEmail, setIsShowEmail] = useState<boolean>(false);
  const [activeCode, setActiveCode] = useState(false);
  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  //Người đại diện pháp luật
  const [listContact, setListContact] = useState<IOption[]>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);
  const [listContract, setListContract] = useState<IOption[]>(null);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);
  const [mapPartnerAttribute, setMapPartnerAttribute] = useState<any>(null);

  const getPartnerAttributes = async () => {
    if (!mapPartnerAttribute || mapPartnerAttribute.length === 0) {
      const response = await PartnerAttributeService.listAll(0);
      if (response.code === 0) {
        const dataOption = response.result;
        setMapPartnerAttribute(dataOption || {});
      }
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
    getPartnerAttributes();
    handleGetCode();
    if (data && onShow) {
      onSelectOpenEmployee();
      onSelectOpenContact();
      onSelectOpenContract();
      onSelectOpenCustomer();

      if (data?.bank) {
        const bankList = JSON.parse(data?.bank);
        setBankAccountList(bankList);
      }
    }
  }, [data, onShow]);

  useEffect(() => {
    //Lấy thông tin contractExtraInfos
    if (data?.id && mapPartnerAttribute && onShow) {
      getPartnerExtraInfos();
    }
  }, [data, mapPartnerAttribute, onShow]);

  const getPartnerExtraInfos = async () => {
    const response = await PartnerExtraInfoService.list(data?.id);
    setPartnerExtraInfos(response.code === 0 ? response.result : []);
  };

  const [dataOrg, setDataOrg] = useState(null);

  useEffect(() => {
    if (lstDataOrigin && lstDataOrigin.length > 0 && data) {
      const changeLstDataOrigin = lstDataOrigin.find((item) => item.duplicateId === data.id);
      setDataOrg(changeLstDataOrigin);
    }
  }, [lstDataOrigin, data, onShow]);

  const defaultDataDuplicate = {
    name: false,
    phone: false,
    code: false,
    email: false,
    address: false,
  };

  const [showDataDuplicate, setShowDataDuplicate] = useState(defaultDataDuplicate);

  const refOption = useRef();

  useOnClickOutside(refOption, () => setShowDataDuplicate(defaultDataDuplicate), ["change__duplicate--birthday"]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        phone: data?.phoneMasked ?? "",
        code: data?.code ?? "",
        email: data?.emailMasked ?? "",
        address: data?.address ?? "",
        avatar: data?.avatar ?? "",
        taxCode: data?.taxCode ?? "",
        contactId: data?.contactId ?? "",
        branchId: checkUserRoot == "1" ? data?.branchId ?? dataBranch.value ?? null : 0,
        bank: data?.bank ? JSON.parse(data?.bank) : "",
      } as AnimationPlaybackEventInit),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    ...(checkUserRoot !== "1"
      ? [
          {
            name: "branchId",
            rules: "required",
          },
        ]
      : []),
    {
      name: "name",
      rules: "required",
    },
    {
      name: "phone",
      rules: "nullable|regex",
    },
    {
      name: "email",
      rules: "regex",
    },
    {
      name: "recommenderPhone",
      rules: "regex",
    },
    {
      name: "gender",
      rules: "required",
    },
  ];

  const listFieldInfoCustomer = useMemo(
    () =>
      [
        {
          label: "Tên đối tác",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mã đối tác",
          name: "code",
          type: "text",
          fill: true,
          disabled: activeCode,
        },
      ] as IFieldCustomize[],
    [activeCode]
  );

  const listFieldInfoDetailCustomer = useMemo(
    () =>
      [
        {
          label: "Số điện thoại",
          name: "phone",
          type: "text",
          fill: true,
          regex: new RegExp(PHONE_REGEX),
          messageErrorRegex: "Số điện thoại không đúng định dạng",
          iconPosition: "right",
          icon: data?.id && (!isShowPhone ? <Icon name="EyeSlash" /> : <Icon name="Eye" />),
          iconClickEvent: () => setIsShowPhone(!isShowPhone),
          required: true,
        },
        {
          label: "Email",
          name: "email",
          type: "text",
          fill: true,
          regex: new RegExp(EMAIL_REGEX),
          iconPosition: "right",
          icon: data?.id && data?.emailMasked && (!isShowEmail ? <Icon name="EyeSlash" /> : <Icon name="Eye" />),
          iconClickEvent: () => setIsShowEmail(!isShowEmail),
          messageErrorRegex: "Email không đúng định dạng",
        },
        {
          label: "Mã số thuế",
          name: "taxCode",
          type: "text",
          fill: true,
          required: false,
        },
        {
          label: "Người đại diện pháp luật",
          name: "contactId",
          type: "select",
          fill: true,
          options: listContact,
          onMenuOpen: onSelectOpenContact,
          isLoading: isLoadingContact,
        },
        {
          label: "Địa chỉ (ĐKKD)",
          name: "address",
          type: "text",
          fill: true,
        },
      ] as IFieldCustomize[],
    [isShowPhone, isShowEmail, data, listContact, isLoadingContact]
  );

  const handleGetCode = async () => {
    const response = await CodeService.detailEntity("business_partner");

    if (response.code == 0) {
      const result = response.result;
      if (result?.id) {
        setActiveCode(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleShowPhone = async (id: number) => {
    const response = await PartnerService.viewPhone(id);

    if (response.code == 0) {
      const result = response.result;
      setFormData({ ...formData, values: { ...formData?.values, phone: result } });
    } else if (response.code == 400) {
      showToast("Bạn không có quyền xem số điện thoại !", "error");
    } else {
      showToast(response.message, "error");
    }
  };

  useEffect(() => {
    if (isShowPhone && data?.id) {
      handleShowPhone(data?.id);
    }
    if (!isShowPhone && data?.id) {
      setFormData({ ...formData, values: { ...formData?.values, phone: data?.phoneMasked } });
    }
  }, [isShowPhone, data]);

  const handleShowEmail = async (id: number) => {
    const response = await PartnerService.viewEmail(id);

    if (response.code == 0) {
      const result = response.result;
      setFormData({ ...formData, values: { ...formData?.values, email: result } });
    } else if (response.code == 400) {
      showToast("Bạn không có quyền xem email !", "error");
    } else {
      showToast(response.message, "error");
    }
  };

  useEffect(() => {
    if (isShowEmail && data?.id) {
      handleShowEmail(data?.id);
    }
    if (!isShowEmail && data?.id) {
      setFormData({ ...formData, values: { ...formData?.values, email: data?.emailMasked } });
    }
  }, [isShowEmail, data]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const [validateRegex, setValidateRegex] = useState({
    phone: false,
    email: false,
  });

  useEffect(() => {
    if (formData?.values && lstDataOrigin) {
      if (formData?.values?.phone && !new RegExp(PHONE_REGEX).test(formData?.values.phone)) {
        setValidateRegex({ ...validateRegex, phone: true });
      } else {
        setValidateRegex({ ...validateRegex, phone: false });
      }

      if (formData?.values?.email && !new RegExp(PHONE_REGEX).test(formData?.values.email)) {
        setValidateRegex({ ...validateRegex, email: true });
      } else {
        setValidateRegex({ ...validateRegex, email: false });
      }
    }
  }, [formData?.values, lstDataOrigin]);

  //Tài khoản hưởng thụ
  const [bankAccountList, setBankAccountList] = useState([
    {
      number: "",
      accountName: "",
      bankName: "",
    },
  ]);

  const handleRemoveBank = (index) => {
    const newListBank = [...bankAccountList];
    newListBank.splice(index, 1);
    setBankAccountList(newListBank);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(
      validations,
      formData,
      checkUserRoot == "1" ? [...listFieldInfoCustomer, ...listFieldInfoDetailCustomer] : [...listFieldInfoCustomer, ...listFieldInfoDetailCustomer]
    );

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (Object.values(validateRegex).filter((item) => item === true).length > 0) {
      return;
    }
    ///check validate các trường động
    if (
      !lstDataOrigin &&
      mapPartnerAttribute &&
      Object.entries(mapPartnerAttribute) &&
      Array.isArray(Object.entries(mapPartnerAttribute)) &&
      Object.entries(mapPartnerAttribute).length > 0
    ) {
      const newArray = Object.entries(mapPartnerAttribute);
      let checkArray = [];

      newArray.map((lstPartnerAttribute: any, key: number) => {
        (lstPartnerAttribute[1] || []).map((item) => {
          if (item.required === 1 && item.parentId !== 0) {
            checkArray.push(item);
          }
        });
      });

      if (checkArray.length > 0) {
        if (partnerExtraInfos.length === 0) {
          showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
          return;
        } else {
          let check = false;
          checkArray.map((i) => {
            const index = partnerExtraInfos.findIndex((el) => el.attributeId === i.id);
            if (index === -1) {
              check = true;
            }
          });

          if (check) {
            showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
            return;
          }
        }
      }
    }

    setIsSubmit(true);

    const body: any = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as any),
      bank: JSON.stringify(bankAccountList),
      businessPartnerExtraInfos: partnerExtraInfos,
    };

    const response = await PartnerService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} đối tác thành công`, "success");
      handleClear(true);
      takeInfoPartner && takeInfoPartner(response.result);
    } else {
      if (response.error) {
        showToast(response.error, "error");
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }

    setIsSubmit(false);
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
              !isDifferenceObj(formData.values, values) ? handleClear(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              (!isDifferenceObj(formData.values, values) && _.isEqual(formData.values.bank, bankAccountList)) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, bankAccountList]
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

  const updateCustomerMultiselectAttribute = (attributeId, e) => {
    let attributeValue = e ? e.split(",") : [];
    updateCustomerAttribute(attributeId, JSON.stringify(attributeValue));
  };

  const updateCustomerAttribute = (attributeId, attributeValue) => {
    let businessPartnerId = data?.id || 0;

    let found = false;
    (partnerExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        item.attributeValue = attributeValue;
        item.businessPartnerId = businessPartnerId;
        found = true;
      }
    });

    if (!found) {
      let item: any = {};
      item.attributeId = attributeId;
      item.attributeValue = attributeValue;
      item.businessPartnerId = businessPartnerId;
      partnerExtraInfos[partnerExtraInfos.length] = item;
    }

    setPartnerExtraInfos([...partnerExtraInfos]);
    setFormData({ ...formData, values: { ...formData?.values, timestamp: new Date().getTime() } });
  };

  const getCustomerAttributeValue = (attributeId) => {
    let attributeValue = "";
    (partnerExtraInfos || []).map((item, idx) => {
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
    (partnerExtraInfos || []).map((item, idx) => {
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

  const handleClear = (acc) => {
    onHide(acc);
    setBankAccountList([
      {
        number: "",
        accountName: "",
        bankName: "",
      },
    ]);
    setPartnerExtraInfos([]);
  };

  return (
    <Fragment>
      <Modal
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        size="xl"
        toggle={() => {
          if (!isSubmit) {
            handleClear(false);
          }
        }}
        className="modal-partner"
      >
        <form className="form-partner-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} đối tác`}
            toggle={() => {
              if (!isSubmit) {
                handleClear(false);
              }
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              <div className="basic-info">
                <label className="label-title">Thông tin cơ bản</label>

                <div className="wrapper__info">
                  <FileUpload type="avatar" label="Ảnh đối tác" formData={formData} setFormData={setFormData} />
                  <div className="info-custommer">
                    {listFieldInfoCustomer.map((field, index) => (
                      <FieldCustomize
                        field={field}
                        key={index}
                        handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldInfoCustomer, setFormData)}
                        formData={formData}
                      />
                    ))}
                  </div>
                </div>

                {listFieldInfoDetailCustomer.map((field, index) => (
                  <FieldCustomize
                    field={field}
                    key={index}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldInfoDetailCustomer, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>
              <div className="info-bank">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <label className="label-title">Tài khoản hưởng thụ</label>
                  </div>
                  <div
                    className="button-add-account"
                    onClick={() => {
                      setBankAccountList((oldArray) => [...oldArray, { number: "", accountName: "", bankName: "" }]);
                    }}
                  >
                    <Icon name="PlusCircleFill" />
                    <span style={{ fontSize: 14, fontWeight: "400" }}>Thêm tài khoản</span>
                  </div>
                </div>
                <div className="bank-acount-list">
                  {bankAccountList &&
                    bankAccountList.length > 0 &&
                    bankAccountList.map((item, index) => (
                      <div className="bank-account-item" key={index}>
                        <div className="form-accountNumber">
                          <NummericInput
                            label=""
                            name="accountNumber"
                            fill={true}
                            required={false}
                            value={item.number}
                            // thousandSeparator={true}
                            placeholder="Số tài khoản"
                            decimalScale={0}
                            onChange={(e) => {
                              const value = e.target.value;
                              setBankAccountList((current) =>
                                current.map((obj, ind) => {
                                  if (index === ind) {
                                    return { ...obj, number: value };
                                  }
                                  return obj;
                                })
                              );
                            }}
                          />
                        </div>

                        <div className="form-accountOwner">
                          <Input
                            label=""
                            name="accountOwner"
                            fill={true}
                            required={false}
                            value={item.accountName}
                            placeholder="Người hưởng thụ"
                            onChange={(e) => {
                              const value = e.target.value;
                              setBankAccountList((current) =>
                                current.map((obj, ind) => {
                                  if (index === ind) {
                                    return { ...obj, accountName: value };
                                  }
                                  return obj;
                                })
                              );
                            }}
                          />
                        </div>

                        <div className="form-bankName">
                          <Input
                            label=""
                            name="bankName"
                            fill={true}
                            required={false}
                            value={item.bankName}
                            placeholder="Ngân hàng"
                            onChange={(e) => {
                              const value = e.target.value;
                              setBankAccountList((current) =>
                                current.map((obj, ind) => {
                                  if (index === ind) {
                                    return { ...obj, bankName: value };
                                  }
                                  return obj;
                                })
                              );
                            }}
                          />
                        </div>
                        {bankAccountList.length === 1 ? null : (
                          <div>
                            <span className="remove-bank">
                              <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                <span className="icon-remove-bank" onClick={() => handleRemoveBank(index)}>
                                  <Icon name="Trash" />
                                </span>
                              </Tippy>
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Các trường thông tin động được hiển thị ở đây */}
              {!lstDataOrigin && mapPartnerAttribute ? (
                <div className="list__partner--attribute">
                  {Object.entries(mapPartnerAttribute).map((lstCustomerAttribute: any, key: number) => (
                    <Fragment key={key}>
                      {(lstCustomerAttribute[1] || []).map((customerAttribute, index: number) => (
                        <Fragment key={index}>
                          {!customerAttribute.parentId ? (
                            <label className="label-title" key={`parent_${key}`}>
                              {customerAttribute.name}
                            </label>
                          ) : null}
                          {customerAttribute.parentId ? (
                            <div
                              className={`form-group ${
                                customerAttribute.name.length >= 38 || lstCustomerAttribute[1].length == 2 ? "special-case" : ""
                              }`}
                              id={`Field${convertToId(customerAttribute.name)}`}
                              key={`index_${key}_${index}`}
                            >
                              {getControlByType(customerAttribute)}
                            </div>
                          ) : null}
                        </Fragment>
                      ))}
                    </Fragment>
                  ))}
                </div>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
