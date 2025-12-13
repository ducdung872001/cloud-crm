/* eslint-disable prefer-const */
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Icon from "components/icon";
import Input from "components/input/input";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IActionModal, IOption } from "model/OtherModel";
import { ICustomerRequest } from "model/customer/CustomerRequestModel";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { convertToId, isDifferenceObj } from "reborn-util";
import CustomerService from "services/CustomerService";
import "./ModalAddWarranty.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import ContractService from "services/ContractService";
import PartnerService from "services/PartnerService";
import { uploadDocumentFormData } from "utils/document";
import AddFile from "./partials/AddFile";
import { IFormData } from "model/FormModel";
import ContractWarrantyService from "services/ContractWarrantyService";
import WarrantyAttributeService from "services/WarrantyAttributeService";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import CheckboxList from "components/checkbox/checkboxList";
import Checkbox from "components/checkbox/checkbox";
import RadioList from "components/radio/radioList";
import moment from "moment";
import { ContextType, UserContext } from "contexts/userContext";
import { SelectOptionData } from "utils/selectCommon";
import { Parser } from "formula-functionizer";
import WarrantyExtraInfoService from "services/WarrantyExtraInfoService";

export default function ModalAddWarranty(props: any) {
  const { onShow, data, onHide, takeInfoCustomer, lstDataOrigin } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  useEffect(() => {
    if (data && onShow) {
      setDataContract(data?.contract?.id ? { value: data?.contract?.id, label: data.contract?.name } : null);
      // setDataCompetency(data.competency ? { value: data.competency?.id, label: data.competency?.name } : null);
      setDataCompetency(
        data.cusCompetencyPartner
          ? { value: data.cusCompetencyPartner?.id, label: data.cusCompetencyPartner?.name }
          : data.competencyPartner
          ? { value: data.competencyPartner?.id, label: data.competencyPartner?.name }
          : null
      );
      setDataBeneficiary(
        data.cusBeneficialPartner
          ? { value: data.cusBeneficialPartner?.id, label: data.cusBeneficialPartner?.name }
          : data.beneficialPartner
          ? { value: data.beneficialPartner?.id, label: data.beneficialPartner?.name }
          : null
      );
      if (data.attachments && JSON.parse(data.attachments) && JSON.parse(data.attachments).length > 0) {
        const attachment = JSON.parse(data.attachments)[0];

        setInfoFile({
          fileUrl: attachment,
          extension: attachment.includes(".docx")
            ? "docx"
            : attachment.includes(".xlsx")
            ? "xlsx"
            : attachment.includes(".pdf")
            ? "pdf"
            : attachment.includes(".pptx")
            ? "pptx"
            : attachment.includes(".zip")
            ? "zip"
            : "rar",
        });
      }
    }
  }, [data, onShow]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        competencyId: data?.competencyId ?? 0, // đơn vị thực hiện bảo hành
        contractId: data?.contractId ?? 0, //hợp đồng bảo hành
        projectId: data?.contract?.projectId ?? 0, //dự án
        beneficiaryId: data?.beneficiaryId ?? 0, //đơn vị thủ hưởng
        description: data?.description ?? "",
        startDate: data?.startDate ?? "", //ngày bắt đầu
        endDate: data?.endDate ?? "", //ngày kết thúc
        attachments: data?.attachments || "[]", //tài liệu đính kèm
        beneficiaryType: data?.beneficiaryType?.toString() ?? "0", //0 - khách hàng, 1 - đối tác
        competencyType: data?.competencyType?.toString() ?? "0", //0 - khách hàng, 1 - đối tác
      } as any),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  // hợp đồng gốc
  const [dataContract, setDataContract] = useState(null);
  const [validateFieldContract, setValidateFieldContract] = useState(false);

  const loadedOptionContract = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ContractService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  dealValue: item.dealValue,
                  projectId: item.projectId,
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

  const handleChangeValueContract = (e) => {
    setValidateFieldContract(false);
    setDataContract(e);
    setFormData({ ...formData, values: { ...formData?.values, contractId: e.value, contractValue: e.dealValue, projectId: e.projectId } });
  };

  // lấy thông tin ngày bắt đầu và ngày cuối cùng
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

  const loadedOptionIssuer = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await PartnerService.list(param);

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

  // Đơn vị thực hiện bảo hành
  const [dataCompetency, setDataCompetency] = useState(null);
  const [validateFieldCompetency, setValidateFieldCompetency] = useState(false);

  const handleChangeValueCompetency = (e) => {
    setValidateFieldCompetency(false);
    setDataCompetency(e);
    setFormData({ ...formData, values: { ...formData?.values, competencyId: e.value } });
  };

  // đơn vị hưởng thụ
  const [dataBeneficiary, setDataBeneficiary] = useState(null);
  const [validateFieldBeneficiary, setValidateFieldBeneficiary] = useState(false);

  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: any = {
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

  const loadedOptionPartner = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 10,
    };

    const response = await PartnerService.list(param);

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

  const handleChangeValueBeneficiary = (e) => {
    setValidateFieldBeneficiary(false);
    setDataBeneficiary(e);
    setFormData({ ...formData, values: { ...formData?.values, beneficiaryId: e.value } });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.values?.contractId) {
      setValidateFieldContract(true);
      return;
    }

    if (!formData.values?.startDate) {
      setCheckFieldStartDate(true);
      return;
    }

    if (!formData.values?.endDate) {
      setCheckFieldEndDate(true);
      return;
    }

    if (!formData.values?.competencyId) {
      setValidateFieldCompetency(true);
      return;
    }

    if (!formData.values?.beneficiaryId) {
      setValidateFieldBeneficiary(true);
      return;
    }

    // /check validate các trường động
    if (
      !lstDataOrigin &&
      mapWarrantyAttribute &&
      Object.entries(mapWarrantyAttribute) &&
      Array.isArray(Object.entries(mapWarrantyAttribute)) &&
      Object.entries(mapWarrantyAttribute).length > 0
    ) {
      const newArray = Object.entries(mapWarrantyAttribute);
      let checkArray = [];

      newArray.map((lstCustomerAttribute: any, key: number) => {
        (lstCustomerAttribute[1] || []).map((item) => {
          if (item.required === 1 && item.parentId !== 0) {
            checkArray.push(item);
          }
        });
      });

      if (checkArray.length > 0) {
        if (contractWarrantyExtraInfos.length === 0) {
          showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
          return;
        } else {
          let check = false;
          checkArray.map((i) => {
            const index = contractWarrantyExtraInfos.findIndex((el) => el.attributeId === i.id);
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

    const body: ICustomerRequest = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as any),
          startDate: moment(formData.values.startDate).format('YYYY-MM-DDTHH:mm:ss'),
          endDate: moment(formData.values.endDate).format('YYYY-MM-DDTHH:mm:ss'),
      contractWarrantyExtraInfos: contractWarrantyExtraInfos,
    };

    const response = await ContractWarrantyService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} bảo hành thành công`, "success");
      clearForm(true);
      takeInfoCustomer && takeInfoCustomer(response.result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
              !isDifferenceObj(formData.values, values) ? clearForm(false) : showDialogConfirmCancel();
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
        clearForm(false);
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

  //Tải tài liệu báo giá
  const [infoFile, setInfoFile] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState(0);

  const takeFileAdd = (data) => {
    if (data) {
      setIsLoadingFile(true);
      uploadDocumentFormData(data, onSuccess, onError, onProgress);
    }
  };

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent.toFixed(0));
    }
  };

  //* Đoạn này nhận link file đã chọn
  const onSuccess = (data) => {
    if (data) {
      setInfoFile(data);
      setFormData({ ...formData, values: { ...formData.values, attachments: JSON.stringify([data.fileUrl]) } });
      setIsLoadingFile(false);
    }
  };

  //* Đoạn này nếu như mà lỗi không tải lên được thì bắn ra thông báo
  const onError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  useEffect(() => {
    if (isLoadingFile === false) {
      setShowProgress(0);
    }
  }, [isLoadingFile]);

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [listContact, setListContact] = useState<IOption[]>(null);
  const [mapWarrantyAttribute, setMapWarrantyAttribute] = useState<any>(null);
  const [contractWarrantyExtraInfos, setContractWarrantyExtraInfos] = useState<any>([]);
  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [listContract, setListContract] = useState<IOption[]>(null);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);

  const clearForm = (acc) => {
    onHide(acc);
    setInfoFile(null);

    setValidateFieldContract(false);
    setDataContract(null);

    setCheckFieldStartDate(false);
    setCheckFieldEndDate(false);

    setValidateFieldCompetency(false);
    setDataCompetency(null);

    setValidateFieldBeneficiary(false);
    setDataBeneficiary(null);

    setContractWarrantyExtraInfos([]);
  };

  const getWarrantyAttributes = async () => {
    if (!mapWarrantyAttribute || mapWarrantyAttribute.length === 0) {
      const response = await WarrantyAttributeService.listAll(0);
      if (response.code === 0) {
        const dataOption = response.result;
        setMapWarrantyAttribute(dataOption || {});
      }
    }
  };
  useEffect(() => {
    getWarrantyAttributes();
  }, [data, onShow]);

  useEffect(() => {
    //Lấy thông tin contractExtraInfos
    if (data?.id && mapWarrantyAttribute) {
      getWarrantyExtraInfos();
    }
  }, [data, mapWarrantyAttribute]);

  const getWarrantyExtraInfos = async () => {
    const response = await WarrantyExtraInfoService.list(data?.id);
    setContractWarrantyExtraInfos(response.code === 0 ? response.result : []);
  };

  const getCustomerAttributeValue = (attributeId) => {
    let attributeValue = "";
    (contractWarrantyExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        attributeValue = item.attributeValue;
      }
    });

    return attributeValue;
  };
  const updateCustomerAttribute = (attributeId, attributeValue) => {
    let customerId = data?.id || 0;

    let found = false;
    (contractWarrantyExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        item.attributeValue = attributeValue;
        item.customerId = customerId;
        found = true;
      }
    });

    if (!found) {
      let item: any = {};
      item.attributeId = attributeId;
      item.attributeValue = attributeValue;
      item.customerId = customerId;
      contractWarrantyExtraInfos[contractWarrantyExtraInfos.length] = item;
    }

    setContractWarrantyExtraInfos([...contractWarrantyExtraInfos]);
    setFormData({ ...formData, values: { ...formData?.values, timestamp: new Date().getTime() } });
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

  const updateCustomerMultiselectAttribute = (attributeId, e) => {
    let attributeValue = e ? e.split(",") : [];
    updateCustomerAttribute(attributeId, JSON.stringify(attributeValue));
  };

  const handleChangeValueCustomerItemC = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueEmployeeItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueContractItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const handleChangeValueContactItem = (e, contactAttribute) => {
    const value = e.value;
    updateCustomerAttribute(contactAttribute.id, value);
  };

  const parser = new Parser();

  /**
   * Hiển thị giá trị theo công thức
   * @param attributes
   * @param isFormula
   */
  const getWarrantyAttributeFormula = (attributes) => {
    let attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    let attrObj = {};
    (contractWarrantyExtraInfos || []).map((item, idx) => {
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
            value={getWarrantyAttributeFormula(customerAttribute?.attributes)}
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
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        size="xl"
        toggle={() => {
          if (!isSubmit) {
            clearForm(false);
          }
        }}
        className="modal-add-warranty-contract"
      >
        <form className="form-warranty-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} bảo hành`}
            toggle={() => {
              if (!isSubmit) {
                clearForm(false);
              }
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              <div className="basic-info">
                {/* <label className="label-title">Thông tin cơ bản</label> */}
                <div className="form-group">
                  <Input
                    label="Tên bảo hành"
                    name="name"
                    fill={true}
                    required={true}
                    value={formData.values?.name}
                    placeholder="Nhập tên bảo hành"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, values: { ...formData.values, name: value } });
                    }}
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id=""
                    name=""
                    label="Hợp đồng gốc"
                    fill={true}
                    required={true}
                    error={validateFieldContract}
                    message="Hợp đồng gốc không được bỏ trống"
                    options={[]}
                    value={dataContract}
                    onChange={(e) => handleChangeValueContract(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn hợp đồng gốc"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionContract}
                  />
                </div>

                <div className="form-group">
                  <DatePickerCustom
                    label="Ngày bắt đầu"
                    name="startDate"
                    fill={true}
                    value={formData.values?.startDate}
                    onChange={(e) => handleChangeValueStartDate(e)}
                    placeholder="Chọn ngày bắt đầu"
                    required={true}
                    iconPosition="left"
                    icon={<Icon name="Calendar" />}
                    isMaxDate={false}
                    error={checkFieldStartDate || startDay > endDay}
                    message={startDay > endDay ? "Ngày bắt đầu nhỏ hơn ngày kết thúc" : "Vui lòng chọn ngày bắt đầu"}
                  />
                </div>

                <div className="form-group">
                  <DatePickerCustom
                    label="Ngày ngày hết hạn"
                    name="endDate"
                    fill={true}
                    value={formData?.values?.endDate}
                    onChange={(e) => handleChangeValueEndDate(e)}
                    placeholder="Chọn ngày hết hạn"
                    required={true}
                    iconPosition="left"
                    icon={<Icon name="Calendar" />}
                    isMaxDate={false}
                    error={checkFieldEndDate || endDay < startDay}
                    message={endDay < startDay ? "Ngày kết thúc lớn hơn ngày bắt đầu" : "Vui lòng chọn ngày hết hạn"}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "0.1rem" }}>
                    <div style={{ marginRight: "2rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: 14, fontWeight: "700" }}>
                        Đơn vị thực hiện bảo hành <span style={{ color: "red" }}>*</span>:
                      </span>
                    </div>
                    <div>
                      <RadioList
                        title=""
                        name="competencyType"
                        value={formData?.values.competencyType}
                        options={[
                          {
                            value: "0",
                            label: "Khách hàng",
                          },
                          {
                            value: "1",
                            label: "Đối tác",
                          },
                        ]}
                        onChange={(e) => {
                          const value = e.target.value;
                          // setFormData({ ...formData, values: { ...formData?.values, beneficiaryType: value } });

                          if (data) {
                            if (data.cusCompetencyPartner) {
                              if (value === "1") {
                                setDataCompetency(null);
                                setFormData({ ...formData, values: { ...formData?.values, competencyType: value, competencyId: 0 } });
                              } else {
                                setDataBeneficiary({ value: data.cusCompetencyPartner?.id, label: data.cusCompetencyPartner?.name });
                                setFormData({
                                  ...formData,
                                  values: { ...formData?.values, competencyType: value, competencyId: data.cusCompetencyPartner?.id },
                                });
                              }
                            }

                            if (data.competencyPartner) {
                              if (value === "0") {
                                setDataCompetency(null);
                                setFormData({ ...formData, values: { ...formData?.values, competencyType: value, competencyId: 0 } });
                              } else {
                                setDataBeneficiary({ value: data.competencyPartner?.id, label: data.competencyPartner?.name });
                                setFormData({
                                  ...formData,
                                  values: { ...formData?.values, competencyType: value, competencyId: data.competencyPartner?.id },
                                });
                              }
                            }
                          } else {
                            setDataCompetency(null);
                            setFormData({ ...formData, values: { ...formData?.values, competencyType: value, competencyId: 0 } });
                          }
                        }}
                      />
                    </div>
                  </div>
                  <SelectCustom
                    key={formData?.values.competencyType}
                    id=""
                    name=""
                    label=""
                    fill={true}
                    required={true}
                    error={validateFieldCompetency}
                    message="Đơn vị thực hiện bảo hành không được bỏ trống"
                    options={[]}
                    value={dataCompetency}
                    onChange={(e) => handleChangeValueCompetency(e)}
                    isAsyncPaginate={true}
                    placeholder="Đơn vị thực hiện bảo hành"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={formData?.values.competencyType === "0" ? loadedOptionCustomer : loadedOptionPartner}
                  />
                </div>

                {/* <div className="form-group">
                  <SelectCustom
                    id=""
                    name=""
                    label="Đơn vị thực hiện bảo hành"
                    fill={true}
                    required={true}
                    error={validateFieldCompetency}
                    message="Đơn vị thực hiện bảo hành không được bỏ trống"
                    options={[]}
                    value={dataCompetency}
                    onChange={(e) => handleChangeValueCompetency(e)}
                    isAsyncPaginate={true}
                    placeholder="Đơn vị thực hiện bảo hành"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionIssuer}
                  />
                </div> */}

                <div className="form-group">
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "0.1rem" }}>
                    <div style={{ marginRight: "2rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: 14, fontWeight: "700" }}>
                        Đơn vị thụ hưởng <span style={{ color: "red" }}>*</span>:
                      </span>
                    </div>
                    <div>
                      <RadioList
                        title=""
                        name="beneficiaryType"
                        value={formData?.values.beneficiaryType}
                        options={[
                          {
                            value: "0",
                            label: "Khách hàng",
                          },
                          {
                            value: "1",
                            label: "Đối tác",
                          },
                        ]}
                        onChange={(e) => {
                          const value = e.target.value;
                          // setFormData({ ...formData, values: { ...formData?.values, beneficiaryType: value } });

                          if (data) {
                            if (data.cusBeneficialPartner) {
                              if (value === "1") {
                                setDataBeneficiary(null);
                                setFormData({ ...formData, values: { ...formData?.values, beneficiaryType: value, beneficiaryId: 0 } });
                              } else {
                                setDataBeneficiary({ value: data.cusBeneficialPartner?.id, label: data.cusBeneficialPartner?.name });
                                setFormData({
                                  ...formData,
                                  values: { ...formData?.values, beneficiaryType: value, beneficiaryId: data.cusBeneficialPartner?.id },
                                });
                              }
                            }

                            if (data.beneficialPartner) {
                              if (value === "0") {
                                setDataBeneficiary(null);
                                setFormData({ ...formData, values: { ...formData?.values, beneficiaryType: value, beneficiaryId: 0 } });
                              } else {
                                setDataBeneficiary({ value: data.beneficialPartner?.id, label: data.beneficialPartner?.name });
                                setFormData({
                                  ...formData,
                                  values: { ...formData?.values, beneficiaryType: value, beneficiaryId: data.beneficialPartner?.id },
                                });
                              }
                            }
                          } else {
                            setDataBeneficiary(null);
                            setFormData({ ...formData, values: { ...formData?.values, beneficiaryType: value, beneficiaryId: 0 } });
                          }
                        }}
                      />
                    </div>
                  </div>
                  <SelectCustom
                    key={formData?.values.beneficiaryType}
                    id=""
                    name=""
                    label=""
                    fill={true}
                    required={true}
                    error={validateFieldBeneficiary}
                    message="Đơn vị thụ hưởng không được bỏ trống"
                    options={[]}
                    value={dataBeneficiary}
                    onChange={(e) => handleChangeValueBeneficiary(e)}
                    isAsyncPaginate={true}
                    placeholder="Đơn vị thụ hưởng"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={formData?.values.beneficiaryType === "0" ? loadedOptionCustomer : loadedOptionPartner}
                  />
                </div>

                {/* <div className="form-group">
                  <SelectCustom
                    id=""
                    name=""
                    label="Đơn vị thụ hưởng"
                    fill={true}
                    required={true}
                    error={validateFieldBeneficiary}
                    message="Đơn vị thụ hưởng không được bỏ trống"
                    options={[]}
                    value={dataBeneficiary}
                    onChange={(e) => handleChangeValueBeneficiary(e)}
                    isAsyncPaginate={true}
                    placeholder="Đơn vị thụ hưởng"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionBeneficiary}
                  />
                </div> */}
                <div className="container_template_contract">
                  <div>
                    <span className="title_template">Tài liệu đính kèm</span>
                  </div>
                  <div className="box_template">
                    <div className="box__update--attachment">
                      {/* {isLoadingFile ? ( */}
                      <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                        <Icon name="Refresh" />
                        <span className="name-loading">Đang tải...{showProgress}%</span>
                      </div>
                      {/* ) : ( */}
                      <div className={isLoadingFile ? "d-none" : ""}>
                        <AddFile
                          takeFileAdd={takeFileAdd}
                          infoFile={infoFile}
                          setInfoFile={setInfoFile}
                          // setIsLoadingFile={setIsLoadingFile}
                          // dataAttachment={data}
                        />
                      </div>
                      {/* )} */}
                    </div>
                  </div>
                </div>
                {mapWarrantyAttribute ? (
                  <div className="list__warranty--attribute">
                    {Object.entries(mapWarrantyAttribute).map((lstWarrantyAttribute: any, key: number) => (
                      <Fragment key={key}>
                        {(lstWarrantyAttribute[1] || []).map((warrantyAttribute, index: number) => (
                          <Fragment key={index}>
                            {!warrantyAttribute.parentId ? (
                              <label className="label-title" key={`parent_${key}`}>
                                {warrantyAttribute.name}
                              </label>
                            ) : null}
                            {warrantyAttribute.parentId ? (
                              <div
                                className={`form-group ${
                                  warrantyAttribute.name.length >= 38 || lstWarrantyAttribute[1].length == 2 ? "special-case" : ""
                                }`}
                                id={`Field${convertToId(warrantyAttribute.name)}`}
                                key={`index_${key}_${index}`}
                              >
                                {getControlByType(warrantyAttribute)}
                              </div>
                            ) : null}
                          </Fragment>
                        ))}
                      </Fragment>
                    ))}
                  </div>
                ) : null}
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
