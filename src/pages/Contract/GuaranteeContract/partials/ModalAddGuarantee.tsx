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
import CustomerService from "services/CustomerService";
import { convertToId } from "reborn-util";
import "./ModalAddGuarantee.scss";
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
import ContractGuaranteeService from "services/ContractGuaranteeService";
import ContractService from "services/ContractService";
import PartnerService from "services/PartnerService";
import { uploadDocumentFormData } from "utils/document";
import AddFile from "./partials/AddFile";
import GuaranteeAttributeService from "services/GuaranteeAttributeService";
import GuaranteeExtraInfoService from "services/GuaranteeExtraInfoService";

export default function ModalAddGuarantee(props: any) {
  const { onShow, data, onHide, takeInfoCustomer, lstDataOrigin } = props;

  const focusedElement = useActiveElement();
  const parser = new Parser();

  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [guaranteeExtraInfos, setGuaranteeExtraInfos] = useState<any>([]);

  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  useEffect(() => {
    if (data && onShow) {
      setDataGuaranteeType(data?.guaranteeType?.id ? { value: data?.guaranteeType?.id, label: data.guaranteeType?.name } : null);
      setDataCompetencyGuarantee(data?.competency?.id ? { value: data?.competency?.id, label: data.competency?.name } : null);
      setDataContract(data?.contract?.id ? { value: data?.contract?.id, label: data.contract?.name } : null);
      setDataCurrency(data.currency ? { value: data.currency, label: data.currency } : null);
      setDataBank(data.bank ? { value: data.bank?.id, label: data.bank?.name } : null);
      setDataIssuer(
        data.cusIssuerPartner
          ? { value: data.cusIssuerPartner?.id, label: data.cusIssuerPartner?.name }
          : data.issuerPartner
          ? { value: data.issuerPartner?.id, label: data.issuerPartner?.name }
          : null
      );

      setDataBeneficiary(
        data.cusBeneficialPartner
          ? { value: data.cusBeneficialPartner?.id, label: data.cusBeneficialPartner?.name }
          : data.beneficialPartner
          ? { value: data.beneficialPartner?.id, label: data.beneficialPartner?.name }
          : null
      );
      setDataStatus(data.status ? { value: data.status, label: data.status === 1 ? "Đang hoạt động" : "Không hoạt động" } : null);

      if (data.contractAppendixId) {
        setDataContractAppendix({ value: data.contractAppendixId, label: data.contractAppendixName });
      }
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

  //Người đại diện pháp luật
  const [listContact, setListContact] = useState<IOption[]>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);
  const [listContract, setListContract] = useState<IOption[]>(null);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);
  const [mapGuaranteeAttribute, setMapGuaranteeAttribute] = useState<any>(null);

  const getGuaranteeAttributes = async () => {
    if (!mapGuaranteeAttribute || mapGuaranteeAttribute.length === 0) {
      const response = await GuaranteeAttributeService.listAll(0);
      if (response.code === 0) {
        const dataOption = response.result;
        setMapGuaranteeAttribute(dataOption || {});
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
    getGuaranteeAttributes();
  }, [data, onShow]);

  useEffect(() => {
    //Lấy thông tin contractExtraInfos
    if (data?.id && mapGuaranteeAttribute) {
      getGuaranteeExtraInfos();
    }
  }, [data, mapGuaranteeAttribute]);

  const getGuaranteeExtraInfos = async () => {
    const response = await GuaranteeExtraInfoService.list(data?.id);
    setGuaranteeExtraInfos(response.code === 0 ? response.result : []);
  };

  const values = useMemo(
    () =>
      ({
        numberLetter: data?.numberLetter ?? "",
        competencyId: data?.competencyId ?? 0, // nghiệp vụ bảo lãnh
        contractId: data?.contractId ?? 0, //hợp đồng bảo lãnh
        contractAppendixId: data?.contractAppendix ?? 0, //Phụ lục hợp đồng
        guaranteeTypeId: data?.guaranteeTypeId ?? 0,
        bankId: data?.bankId ?? 0,
        beneficiaryId: data?.beneficiaryId ?? 0, //đơn vị thụ hưởng
        issuerId: data?.issuerId ?? 0, // đơn vị phát hành
        currencyValue: data?.currencyValue ?? 0, //giá trị bảo lãnh ngaoij tế
        currency: data?.currency ?? "VNĐ", //loại tiền tệ
        contractValue: data?.contractValue ?? 0, // giá trị hợp đồng
        value: data?.value ?? 0, //giá trị bảo lãnh
        exchangeRate: data?.exchangeRate ?? 1, //tỷ giá
        description: data?.description ?? "",
        status: data?.status ?? 1, //trạng thái
        startDate: data?.startDate ?? "", //ngày bắt đầu
        endDate: data?.endDate ?? "", //ngày kết thúc
        signDate: data?.signDate ?? "", //ngày kí quỹ
        establishDate: data?.establishDate ?? "", //ngày thành lập,
        signRate: data?.signRate ?? 0,
        attachments: "[]",
        beneficiaryType: data?.beneficiaryType?.toString() ?? "0", //0 - khách hàng, 1 - đối tác
        issuerType: data?.issuerType?.toString() ?? "0", //0 - khách hàng, 1 - đối tác
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

  const validations: IValidation[] = [
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

  // loại bảo lãnh
  const [dataGuaranteeType, setDataGuaranteeType] = useState(null);
  const [validateFieldGuaranteeType, setValidateFieldGuaranteeType] = useState(false);

  const loadedOptionGuaranteeType = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ContractGuaranteeService.guaranteeTypeList(param);

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

  const handleChangeValueGuaranteeType = (e) => {
    setValidateFieldGuaranteeType(false);
    setDataGuaranteeType(e);
    setFormData({ ...formData, values: { ...formData?.values, guaranteeTypeId: e.value } });
  };

  // nghiệp vụ bảo lãnh
  const [dataCompetencyGuarantee, setDataCompetencyGuarantee] = useState(null);
  const [validateFieldCompetencyGuarantee, setValidateFieldCompetencyGuarantee] = useState(false);

  const loadedOptionCompetencyGuarantee = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ContractGuaranteeService.competencyGuaranteeList(param);

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

  const handleChangeValueCompetencyGuarantee = (e) => {
    setValidateFieldCompetencyGuarantee(false);
    setDataCompetencyGuarantee(e);
    setFormData({ ...formData, values: { ...formData?.values, competencyId: e.value } });
  };

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
    setDataContractAppendix(null);
    setFormData({ ...formData, values: { ...formData?.values, contractId: e.value, contractValue: e.dealValue, contractAppendixId: 0 } });
  };

  //Phụ lục hợp đồng
  const [dataContractAppendix, setDataContractAppendix] = useState(null);

  const loadedOptionContractAppendix = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      contractId: dataContract?.value,
    };

    const response = await ContractService.contractAppendixList(param);
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

  useEffect(() => {
    loadedOptionContractAppendix("", undefined, { page: 1 });
  }, [dataContract]);

  const handleChangeValueContractAppendix = (e) => {
    setDataContractAppendix(e);
    setFormData({ ...formData, values: { ...formData?.values, contractAppendixId: e.value } });
  };

  // loại tiền tệ
  const [dataCurrency, setDataCurrency] = useState({ value: "VNĐ", label: "VNĐ" });
  const [validateFieldCurrency, setValidateFieldCurrency] = useState(false);
  const handleChangeValueCurrency = (e) => {
    setValidateFieldCurrency(false);
    setDataCurrency(e);
    if (e.value === "VNĐ") {
      setFormData({ ...formData, values: { ...formData?.values, currency: e.value, exchangeRate: 1, currencyValue: 0, value: 0 } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, currency: e.value, exchangeRate: 0, value: 0 } });
    }
  };

  // lấy thông tin ngày bắt đầu và ngày cuối cùng
  const startDay = new Date(formData.values.startDate).getTime();
  const endDay = new Date(formData.values.endDate).getTime();

  //Ngày lập
  const [checkFieldEstablishDate, setCheckFieldEstablishDate] = useState<boolean>(false);
  const handleChangeValueEstablishDate = (e) => {
    setCheckFieldEstablishDate(false);
    setFormData({ ...formData, values: { ...formData?.values, establishDate: e } });
  };

  //Ngày ký
  const [checkFieldSignDate, setCheckFieldSignDate] = useState<boolean>(false);
  const handleChangeValueSignDate = (e) => {
    setCheckFieldSignDate(false);
    setFormData({ ...formData, values: { ...formData?.values, signDate: e } });
  };

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

  // ngân hàng
  const [dataBank, setDataBank] = useState(null);
  const [validateFieldBank, setValidateFieldBank] = useState(false);

  const loadedOptionBank = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ContractGuaranteeService.bankList(param);

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

  const handleChangeValueBank = (e) => {
    setValidateFieldBank(false);
    setDataBank(e);
    setFormData({ ...formData, values: { ...formData?.values, bankId: e.value } });
  };

  // đơn vị phát hành
  const [dataIssuer, setDataIssuer] = useState(null);
  const [validateFieldIssuer, setValidateFieldIssuer] = useState(false);

  const loadedOptionIssuer = async (search, loadedOptions, { page }) => {
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

  const handleChangeValueIssuer = (e) => {
    setValidateFieldIssuer(false);
    setDataIssuer(e);
    setFormData({ ...formData, values: { ...formData?.values, issuerId: e.value } });
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

  //trạng thái
  const [dataStatus, setDataStatus] = useState({ value: "1", label: "Đang hoạt động" });
  const handleChangeValueStatus = (e) => {
    setDataStatus(e);
    setFormData({ ...formData, values: { ...formData?.values, status: e.value } });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // const errors = Validate(
    //   validations,
    //   formData,
    //   checkUserRoot == "1"
    //     ? [ ...listFieldInfoCustomer, ...listFieldInfoDetailCustomer]
    //     : [...listFieldInfoCustomer, ...listFieldInfoDetailCustomer]
    // );

    // if (Object.keys(errors).length > 0) {
    //   setFormData((prevState) => ({ ...prevState, errors: errors }));
    //   return;
    // }

    if (!dataGuaranteeType) {
      setValidateFieldGuaranteeType(true);
      return;
    }

    if (!dataCompetencyGuarantee) {
      setValidateFieldCompetencyGuarantee(true);
      return;
    }

    if (!dataContract) {
      setValidateFieldContract(true);
      return;
    }

    if (!dataCurrency) {
      setValidateFieldCurrency(true);
      return;
    }

    if (!formData.values?.establishDate) {
      setCheckFieldEstablishDate(true);
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

    if (!dataBank) {
      setValidateFieldBank(true);
      return;
    }

    if (!dataIssuer) {
      setValidateFieldIssuer(true);
      return;
    }

    if (!dataBeneficiary) {
      setValidateFieldBeneficiary(true);
      return;
    }

    // /check validate các trường động
    if (
      !lstDataOrigin &&
      mapGuaranteeAttribute &&
      Object.entries(mapGuaranteeAttribute) &&
      Array.isArray(Object.entries(mapGuaranteeAttribute)) &&
      Object.entries(mapGuaranteeAttribute).length > 0
    ) {
      const newArray = Object.entries(mapGuaranteeAttribute);
      let checkArray = [];

      newArray.map((lstCustomerAttribute: any, key: number) => {
        (lstCustomerAttribute[1] || []).map((item) => {
          if (item.required === 1 && item.parentId !== 0) {
            checkArray.push(item);
          }
        });
      });

      if (checkArray.length > 0) {
        if (guaranteeExtraInfos.length === 0) {
          showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
          return;
        } else {
          let check = false;
          checkArray.map((i) => {
            const index = guaranteeExtraInfos.findIndex((el) => el.attributeId === i.id);
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
      guaranteeExtraInfos: guaranteeExtraInfos,
    };

    const response = await ContractGuaranteeService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} bảo lãnh thành công`, "success");
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

  const updateCustomerMultiselectAttribute = (attributeId, e) => {
    let attributeValue = e ? e.split(",") : [];
    updateCustomerAttribute(attributeId, JSON.stringify(attributeValue));
  };

  const updateCustomerAttribute = (attributeId, attributeValue) => {
    let customerId = data?.id || 0;

    let found = false;
    (guaranteeExtraInfos || []).map((item, idx) => {
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
      guaranteeExtraInfos[guaranteeExtraInfos.length] = item;
    }

    setGuaranteeExtraInfos([...guaranteeExtraInfos]);
    setFormData({ ...formData, values: { ...formData?.values, timestamp: new Date().getTime() } });
  };

  const getCustomerAttributeValue = (attributeId) => {
    let attributeValue = "";
    (guaranteeExtraInfos || []).map((item, idx) => {
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
      // if (percent = 100) {
      //   setShowProgress(0);
      // }
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

  /**
   * Hiển thị giá trị theo công thức
   * @param attributes
   * @param isFormula
   */
  const getGuaranteeAttributeFormula = (attributes) => {
    let attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    let attrObj = {};
    (guaranteeExtraInfos || []).map((item, idx) => {
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
            value={getGuaranteeAttributeFormula(customerAttribute?.attributes)}
            placeholder={`Nhập ${customerAttribute.name.toLowerCase()}`}
            disabled={true}
          />
        );
        break;
    }

    return CustomControl;
  };

  const clearForm = (acc) => {
    onHide(acc);
    setInfoFile(null);
    setDataGuaranteeType(null);
    setValidateFieldGuaranteeType(false);

    setDataCompetencyGuarantee(null);
    setValidateFieldCompetencyGuarantee(false);

    setValidateFieldContract(false);
    setDataContract(null);
    setDataContractAppendix(null);

    setValidateFieldCurrency(false);
    setDataCurrency({ value: "VNĐ", label: "VNĐ" });

    setCheckFieldEstablishDate(false);
    setCheckFieldEstablishDate(false);

    setCheckFieldSignDate(false);
    setCheckFieldSignDate(false);

    setCheckFieldStartDate(false);
    setCheckFieldEndDate(false);

    setValidateFieldBank(false);
    setDataBank(null);

    setValidateFieldIssuer(false);
    setDataIssuer(null);

    setValidateFieldBeneficiary(false);
    setDataBeneficiary(null);

    setDataStatus({ value: "1", label: "Đang hoạt động" });

    setGuaranteeExtraInfos([]);
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
        className="modal-add-guarantee"
      >
        <form className="form-guarantee-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} bảo lãnh`}
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
                    label="Số thư bảo lãnh"
                    name="name"
                    fill={true}
                    required={true}
                    value={formData.values?.numberLetter}
                    placeholder="Nhập số thư bảo lãnh"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, values: { ...formData.values, numberLetter: value } });
                    }}
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id=""
                    name=""
                    label="Loại bảo lãnh"
                    fill={true}
                    required={true}
                    error={validateFieldGuaranteeType}
                    message="Loại bảo lãnh không được bỏ trống"
                    options={[]}
                    value={dataGuaranteeType}
                    onChange={(e) => handleChangeValueGuaranteeType(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn loại bảo lãnh"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionGuaranteeType}
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id=""
                    name=""
                    label="Nghiệp vụ bảo lãnh"
                    fill={true}
                    required={true}
                    error={validateFieldCompetencyGuarantee}
                    message="Nghiệp vụ bảo lãnh không được bỏ trống"
                    options={[]}
                    value={dataCompetencyGuarantee}
                    onChange={(e) => handleChangeValueCompetencyGuarantee(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn nghiệp vụ bảo lãnh"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionCompetencyGuarantee}
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
                  <NummericInput
                    label="Giá trị hợp đồng"
                    name="contractValue"
                    fill={true}
                    required={true}
                    thousandSeparator={true}
                    value={!formData.values.contractValue ? "" : formData.values.contractValue}
                    disabled={true}
                    placeholder=""
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, values: { ...formData?.values, contractValue: value.replace(/,/g, "") } });
                    }}
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    key={dataContract?.value}
                    id=""
                    name=""
                    label="Phụ lục hợp đồng"
                    fill={true}
                    required={false}
                    // error={validateFieldContract}
                    // message="Hợp đồng gốc không được bỏ trống"
                    options={[]}
                    value={dataContractAppendix}
                    onChange={(e) => handleChangeValueContractAppendix(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn phụ lục hợp đồng"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionContractAppendix}
                    disabled={dataContract ? false : true}
                  />
                </div>

                <div className="form-group">
                  <SelectCustom
                    id=""
                    name=""
                    label="Loại tiền tệ"
                    fill={true}
                    required={true}
                    special={true}
                    error={validateFieldCurrency}
                    message="Loại tiền tệ không được bỏ trống"
                    options={[
                      {
                        value: "VNĐ",
                        label: "VNĐ",
                      },
                      {
                        value: "USD",
                        label: "USD",
                      },
                    ]}
                    value={dataCurrency}
                    onChange={(e) => handleChangeValueCurrency(e)}
                    isAsyncPaginate={false}
                    placeholder="Chọn loại tiền tệ"
                    // additional={{
                    //     page: 1,
                    // }}
                    // loadOptionsPaginate={loadOptionCategory}
                  />
                </div>

                <div className="form-group">
                  <NummericInput
                    label="Tỷ giá"
                    name="exchangeRate"
                    fill={true}
                    required={true}
                    thousandSeparator={true}
                    value={!formData.values.exchangeRate ? "" : formData.values.exchangeRate}
                    placeholder="Nhập tỷ giá"
                    onValueChange={(e) => {
                      const value = +e.floatValue;
                      setFormData({
                        ...formData,
                        values: { ...formData?.values, exchangeRate: value, value: value * formData?.values.currencyValue },
                      });
                    }}
                    disabled={formData.values.currency === "VNĐ" ? true : false}
                  />
                </div>

                <div className="form-group">
                  <NummericInput
                    label="Giá trị bảo lãnh bằng ngoại tệ"
                    name="currencyValue"
                    fill={true}
                    required={true}
                    thousandSeparator={true}
                    value={!formData?.values.currencyValue ? "" : formData?.values.currencyValue}
                    placeholder="Nhập giá trị bảo lãnh bằng ngoại tệ"
                    onValueChange={(e) => {
                      const value = +e.floatValue;
                      setFormData({
                        ...formData,
                        values: { ...formData?.values, currencyValue: value, value: value * formData?.values.exchangeRate },
                      });
                    }}
                    disabled={formData.values.currency === "VNĐ" ? true : false}
                  />
                </div>

                <div className="form-group">
                  <NummericInput
                    label="Giá trị bảo lãnh (VNĐ)"
                    name="name"
                    fill={true}
                    required={true}
                    thousandSeparator={true}
                    value={!formData?.values.value ? "" : formData?.values.value}
                    placeholder="Nhập giá trị bảo lãnh (VNĐ)"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, values: { ...formData?.values, value: value.replace(/,/g, "") } });
                    }}
                    disabled={formData.values.currency === "USD" ? true : false}
                  />
                </div>

                <div className="form-group">
                  <NummericInput
                    label="Tỉ lệ ký quỹ (%)"
                    name="name"
                    fill={true}
                    required={true}
                    thousandSeparator={true}
                    isDecimalScale={false}
                    value={!formData?.values.signRate ? "" : formData?.values.signRate}
                    placeholder="Nhập tỉ lệ ký quỹ (%)"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, values: { ...formData?.values, signRate: value.replace(/,/g, "") } });
                    }}
                  />
                </div>

                <div className="form-group">
                  <DatePickerCustom
                    label="Ngày lập"
                    name="establishDate"
                    fill={true}
                    value={formData.values?.establishDate}
                    onChange={(e) => handleChangeValueEstablishDate(e)}
                    placeholder="Chọn ngày lập"
                    required={true}
                    iconPosition="left"
                    icon={<Icon name="Calendar" />}
                    isMaxDate={false}
                    error={checkFieldEstablishDate}
                    message="Vui lòng chọn ngày lập"
                  />
                </div>

                <div className="form-group">
                  <DatePickerCustom
                    label="Ngày ký"
                    name="signRate"
                    fill={true}
                    value={formData.values?.signDate}
                    onChange={(e) => handleChangeValueSignDate(e)}
                    placeholder="Chọn ngày ký"
                    required={true}
                    iconPosition="left"
                    icon={<Icon name="Calendar" />}
                    isMaxDate={false}
                    error={checkFieldSignDate}
                    message="Vui lòng chọn ngày ký"
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
                    label="Ngày hết hạn"
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
                  <SelectCustom
                    id="bankId"
                    name="bank"
                    label="Ngân hàng bảo lãnh"
                    fill={true}
                    required={true}
                    error={validateFieldBank}
                    message="Ngân hàng bảo lãnh không được bỏ trống"
                    options={[]}
                    value={dataBank}
                    onChange={(e) => handleChangeValueBank(e)}
                    isAsyncPaginate={true}
                    placeholder="Chọn ngân hàng bảo lãnh"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionBank}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "0.1rem" }}>
                    <div style={{ marginRight: "2rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: 14, fontWeight: "700" }}>
                        Đơn vị phát hành <span style={{ color: "red" }}>*</span>:
                      </span>
                    </div>
                    <div>
                      <RadioList
                        title=""
                        name="issuerType"
                        value={formData?.values.issuerType}
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
                            if (data.cusIssuerPartner) {
                              if (value === "1") {
                                setDataIssuer(null);
                                setFormData({ ...formData, values: { ...formData?.values, issuerType: value, issuerId: 0 } });
                              } else {
                                setDataIssuer({ value: data.cusIssuerPartner?.id, label: data.cusIssuerPartner?.name });
                                setFormData({ ...formData, values: { ...formData?.values, issuerType: value, issuerId: data.cusIssuerPartner?.id } });
                              }
                            }

                            if (data.issuerPartner) {
                              if (value === "0") {
                                setDataIssuer(null);
                                setFormData({ ...formData, values: { ...formData?.values, issuerType: value, issuerId: 0 } });
                              } else {
                                setDataIssuer({ value: data.issuerPartner?.id, label: data.issuerPartner?.name });
                                setFormData({ ...formData, values: { ...formData?.values, issuerType: value, issuerId: data.issuerPartner?.id } });
                              }
                            }
                          } else {
                            setDataIssuer(null);
                            setFormData({ ...formData, values: { ...formData?.values, issuerType: value, issuerId: 0 } });
                          }
                        }}
                      />
                    </div>
                  </div>
                  <SelectCustom
                    key={formData?.values.issuerType}
                    id=""
                    name=""
                    label=""
                    fill={true}
                    required={true}
                    error={validateFieldIssuer}
                    message="Đơn vị phát hành không được bỏ trống"
                    options={[]}
                    value={dataIssuer}
                    onChange={(e) => handleChangeValueIssuer(e)}
                    isAsyncPaginate={true}
                    placeholder="Đơn vị phát hành"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={formData?.values.issuerType === "0" ? loadedOptionCustomer : loadedOptionPartner}
                  />
                </div>

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

                <div className="form-group">
                  <SelectCustom
                    id=""
                    name=""
                    label="Trạng thái"
                    fill={true}
                    required={true}
                    special={true}
                    // error={validateFieldCurrency}
                    // message="Loại tiền tệ không được bỏ trống"
                    options={[
                      {
                        value: "1",
                        label: "Đang hoạt động",
                      },
                      {
                        value: "0",
                        label: "Không hoạt động",
                      },
                    ]}
                    value={dataStatus}
                    onChange={(e) => handleChangeValueStatus(e)}
                    isAsyncPaginate={false}
                    placeholder="Chọn trạng thái"
                    // additional={{
                    //     page: 1,
                    // }}
                    // loadOptionsPaginate={loadOptionCategory}
                  />
                </div>

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

                <div className="container_template_contract">
                  <TextArea
                    value={formData.values?.description}
                    label="Ghi chú"
                    placeholder="Nhập ghi chú"
                    fill={true}
                    required={false}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, values: { ...formData?.values, description: value.replace(/,/g, "") } });
                    }}
                  />
                </div>

                {mapGuaranteeAttribute ? (
                  <div className="list__guarantee--attribute">
                    {Object.entries(mapGuaranteeAttribute).map((lstGuaranteeAttribute: any, key: number) => (
                      <Fragment key={key}>
                        {(lstGuaranteeAttribute[1] || []).map((guaranteeAttribute, index: number) => (
                          <Fragment key={index}>
                            {!guaranteeAttribute.parentId ? (
                              <label className="label-title" key={`parent_${key}`}>
                                {guaranteeAttribute.name}
                              </label>
                            ) : null}
                            {guaranteeAttribute.parentId ? (
                              <div
                                className={`form-group ${
                                  guaranteeAttribute.name.length >= 38 || lstGuaranteeAttribute[1].length == 2 ? "special-case" : ""
                                }`}
                                id={`Field${convertToId(guaranteeAttribute.name)}`}
                                key={`index_${key}_${index}`}
                              >
                                {getControlByType(guaranteeAttribute)}
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
