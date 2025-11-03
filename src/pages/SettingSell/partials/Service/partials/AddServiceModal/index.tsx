import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import _ from "lodash";
import Icon from "components/icon";
import { ModalFooter } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddServiceModalProps } from "model/service/PropsModel";
import { IServiceRequestModel } from "model/service/ServiceRequestModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { convertToId, isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import ServiceService from "services/ServiceService";
import AddPriceService from "./partials/AddPriceService";
import "./index.scss";
import ImgExcel from "assets/images/img-excel.png";
import ImgWord from "assets/images/img-word.png";
import ImgPowerpoint from "assets/images/img-powerpoint.png";
import { Parser } from "formula-functionizer";
import Input from "components/input/input";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import CheckboxList from "components/checkbox/checkboxList";
import Checkbox from "components/checkbox/checkbox";
import RadioList from "components/radio/radioList";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import ServiceAttributeService from "services/ServiceAttributeService";
import ServiceExtraInfoService from "services/ServiceExtraInfoService";
import CategoryServiceService from "services/CategoryServiceService";
import FileService from "services/FileService";
import { uploadDocumentFormData } from "utils/document";

export default function AddServiceModal(props: IAddServiceModalProps) {
  const { onShow, onHide, data } = props;

  const parser = new Parser();
  const focusedElement = useActiveElement();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [showModalAddPrice, setShowModalAddPrice] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề call api danh sách dịch vụ
  const [listCategoryService, setListCategoryService] = useState<IOption[]>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [serviceExtraInfos, setServiceExtraInfos] = useState<any>([]);
  // console.log("serviceExtraInfos", serviceExtraInfos);

  const [mapServiceAttribute, setMapServiceAttribute] = useState<any>(null);
  // console.log("mapServiceAttribute", mapServiceAttribute);

  //Dùng cho lookup
  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [listContract, setListContract] = useState<IOption[]>(null);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);
  const [listContact, setListContact] = useState<IOption[]>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);

  // const onSelectOpenCategoryService = async () => {
  //   if (!listCategoryService || listCategoryService.length === 0) {
  //     setIsLoading(true);

  //     const dataOption = await SelectOptionData("categoryServiceId");

  //     if (dataOption) {
  //       setListCategoryService([...(dataOption.length > 0 ? dataOption : [])]);
  //     }

  //     setIsLoading(false);
  //   }
  // };

  useEffect(() => {
    if (data?.categoryId) {
      // onSelectOpenCategoryService();
      // getAttributes(data?.categoryId);
      setDetailCategory(data?.categoryId ? { value: data?.categoryId, label: data?.categoryName } : null);
    }

    if (onShow) {
      getAttributes();
    }

    if (data?.categoryId === null) {
      setListCategoryService([]);
    }

    if (data?.id && onShow) {
      onSelectOpenEmployee();
      onSelectOpenContract();
      onSelectOpenCustomer();
      onSelectOpenContact();
    }

    if (onShow && data?.documents) {
      const result = JSON.parse(data.documents);
      setLstDocument(result);
    }
  }, [data, onShow]);

  useEffect(() => {
    //Lấy thông tin ExtraInfos
    if (data?.id && mapServiceAttribute) {
      getExtraInfos();
    }
  }, [data?.id, mapServiceAttribute]);

  const getExtraInfos = async () => {
    console.log("eerr");

    const response = await ServiceExtraInfoService.list(data?.id);
    // console.log("response =>", response);
    if (response.code === 0) {
      const result = response.result?.map((item) => {
        return {
          attributeId: item.attributeId,
          serviceId: item.serviceId,
          attributeValue: item.attributeValue,
        };
      });
      setServiceExtraInfos(result);
    }
  };

  const getAttributes = async () => {
    const response = await ServiceAttributeService.listAll();
    if (response.code === 0) {
      const dataOption = response.result;
      setMapServiceAttribute(dataOption || {});
    }
  };

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        avatar: data?.avatar ?? "",
        categoryId: data?.categoryId ?? null,
        categoryName: data?.categoryName ?? null,
        intro: data?.intro ?? "",
        discount: data?.discount ?? 0,
        priceVariation: data?.priceVariation ?? "[]",
        retail: data?.retail ?? 0,
        price: data?.price ?? 0,
        retailPrice: data?.retailPrice ?? 0,
        totalTime: data?.totalTime ?? 0,
        isCombo: data?.isCombo?.toString() ?? "0",
        treatmentNum: data?.treatmentNum ?? 0,
        featured: data?.featured ?? 1,
        active: data?.active ?? 1,
        position: data?.position?.toString() ?? "0",
        parentId: 0,
        syncStatus: 1,
        documents: JSON.parse(data?.documents || "[]") ?? [],
        code: data?.code ?? "",
      } as IServiceRequestModel),
    [onShow, data]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "avatar",
      rules: "required",
    },
    {
      name: "categoryId",
      rules: "required",
    },
    {
      name: "totalTime",
      rules: "required|min:0",
    },
    {
      name: "treatmentNum",
      rules: "required|min:0|max:100",
    },
    {
      name: "position",
      rules: "required",
    },
    {
      name: "price",
      rules: "required|min:0",
    },
  ];

  const [detailCategory, setDetailCategory] = useState(null);
  const [validateFieldCategory, setValidateFieldCategory] = useState<boolean>(false);

  const loadOptionCategory = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
      type: 1,
    };
    const response = await CategoryServiceService.list(param);

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

  //? đoạn này xử lý vấn đề thay đổi loại hợp đồng
  const handleChangeValueCategory = (e) => {
    setDetailCategory(e);
    setValidateFieldCategory(false);
    setFormData({ ...formData, values: { ...formData?.values, categoryId: e.value, categoryName: e.label } });
    // getAttributes(e.value)
  };

  const listFieldBasic = useMemo(
    () =>
      [
        // {
        //   label: "Danh mục dịch vụ",
        //   name: "categoryId",
        //   type: "select",
        //   fill: true,
        //   required: true,
        //   options: listCategoryService,
        //   onMenuOpen: onSelectOpenCategoryService,
        //   isLoading: isLoading,
        // },
        {
          name: "categoryId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="categoryId"
              name="categoryId"
              label="Danh mục dịch vụ"
              fill={true}
              required={true}
              error={validateFieldCategory}
              message="Danh mục dịch vụ không được bỏ trống"
              options={[]}
              value={detailCategory}
              onChange={(e) => handleChangeValueCategory(e)}
              isAsyncPaginate={true}
              placeholder="Chọn manh mục dịch vụ"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionCategory}
            />
          ),
        },
        {
          label: "Tên dịch vụ",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Mã dịch vụ",
          name: "code",
          type: "text",
          fill: true,
        },
      ] as IFieldCustomize[],
    [listCategoryService, isLoading, validateFieldCategory, detailCategory]
  );

  const isBeauty = localStorage.getItem("isBeauty");

  const listFieldAdvanced: IFieldCustomize[] = [
    // ...(isBeauty && isBeauty == "1"
    //   ? ([
    //       {
    //         label: "Thời gian thực hiện ( phút )",
    //         name: "totalTime",
    //         type: "number",
    //         fill: true,
    //         required: true,
    //         placeholder: "Nhập số phút thực hiện",
    //       },
    //       {
    //         label: "Số buổi thực hiện",
    //         name: "treatmentNum",
    //         type: "number",
    //         fill: true,
    //         required: true,
    //       },
    //     ] as any)
    //   : []),
    // {
    //   label: "Thứ tự hiển thị",
    //   name: "position",
    //   type: "number",
    //   fill: true,
    //   required: false,
    // },
  ];

  const listFieldPrice = useMemo(
    () =>
      [
        {
          label: "Thứ tự hiển thị",
          name: "position",
          type: "number",
          fill: true,
          required: false,
        },
        {
          label: "Giá gốc",
          name: "price",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Giá ưu đãi",
          name: "discount",
          type: "number",
          fill: true,
          isWarning: formData?.values?.discount > formData?.values?.price,
          messageWarning: "Giá ưu đãi phải nhỏ hơn hoặc giá gốc",
        },
        // ...(isBeauty && isBeauty == "1"
        //   ? [
        //       {
        //         label: "Dịch vụ bán theo combo",
        //         name: "isCombo",
        //         type: "radio",
        //         fill: true,
        //         options: [
        //           {
        //             value: "1",
        //             label: "Có",
        //           },
        //           {
        //             value: "0",
        //             label: "Không",
        //           },
        //         ],
        //       },
        //     ]
        //   : []),
      ] as IFieldCustomize[],
    [formData?.values, isBeauty]
  );

  const listFieldIntroduce: IFieldCustomize[] = [
    {
      label: "Giới thiệu",
      name: "intro",
      type: "textarea",
      fill: true,
    },
  ];

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  useEffect(() => {
    if (formData?.values?.isCombo == 0) {
      setFormData({ ...formData, values: { ...formData?.values, priceVariation: "[]" } });
    }
  }, [formData?.values?.isCombo]);

  //! đoạn này tạo ra 1 hàm để hứng giá trị của thêm bảng giá
  const handleTakePriceVariant = (data) => {
    setFormData({ ...formData, values: { ...formData?.values, priceVariation: JSON.stringify(data || []) } });
  };

  const [lstDocument, setLstDocument] = useState([]);

  const handleRemoveImageItem = (idx) => {
    const result = [...lstDocument];
    result.splice(idx, 1);
    setLstDocument(result);
  };

  const handleUploadDocument = (e) => {
    e.preventDefault();

    const file = e.target.files[0];

    const checkFile = file.type;

    if (checkFile.startsWith("image")) {
      handUploadFile(file);
    }

    if (checkFile.startsWith("application")) {
      uploadDocumentFormData(file, onSuccess, onError, onProgress);
    }
  };

  //* Xử lý tài liệu
  const [showProgress, setShowProgress] = useState<number>(0);

  const onSuccess = (data) => {
    if (data) {
      const result = {
        url: data.fileUrl,
        type: data.extension,
      };

      setLstDocument([...lstDocument, result]);
    }
  };

  const onError = (message) => {
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent);

      if (percent >= 99) {
        setShowProgress(0);
      }
    }
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    const changeResult = {
      url: result,
      type: data.extension,
    };

    setLstDocument([...lstDocument, changeResult]);
  };

  useEffect(() => {
    if (lstDocument && lstDocument.length > 0) {
      setFormData({ ...formData, values: { ...formData?.values, documents: lstDocument } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, documents: [] } });
    }
  }, [lstDocument]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldBasic, ...listFieldPrice, ...listFieldIntroduce]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (!detailCategory) {
      setValidateFieldCategory(true);
      showToast("Vui lòng chọn danh mục dịch vụ", "error");
      return;
    }

    ///check validate các trường động
    if (
      mapServiceAttribute &&
      Object.entries(mapServiceAttribute) &&
      Array.isArray(Object.entries(mapServiceAttribute)) &&
      Object.entries(mapServiceAttribute).length > 0
    ) {
      const newArray = Object.entries(mapServiceAttribute);
      const checkArray = [];

      newArray.map((lstContractAttribute: any, key: number) => {
        (lstContractAttribute[1] || []).map((item) => {
          if (item.required === 1 && item.parentId !== 0) {
            checkArray.push(item);
          }
        });
      });

      if (checkArray.length > 0) {
        if (serviceExtraInfos.length === 0) {
          showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
          return;
        } else {
          let check = false;
          checkArray.map((i) => {
            const index = serviceExtraInfos.findIndex((el) => el.attributeId === i.id);
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

    const body: IServiceRequestModel = {
      ...(formData.values as IServiceRequestModel),
      ...(data ? { id: data.id } : {}),
      documents: JSON.stringify(formData?.values?.documents),
      serviceExtraInfos: serviceExtraInfos,
    };

    const response = await ServiceService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} dịch vụ thành công`, "success");
      handleClear(true);
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
              _.isEqual(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              formData?.values?.discount > formData?.values?.price ||
              _.isEqual(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, data]
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
          handleClear(false);
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

  const handleClear = (acc) => {
    onHide(acc);
    setDetailCategory(null);
    setValidateFieldCategory(false);
    setLstDocument([]);
  };

  const getAttributeFormula = (attributes) => {
    const attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    const attrObj = {};
    (serviceExtraInfos || []).map((item, idx) => {
      if (item.datatype == "number") {
        // console.log(item);
        attrObj["serviceAttribute_" + convertToId(item.attributeName)] = +item.attributeValue;
      }
    });

    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
  };

  const getAttributeValue = (attributeId) => {
    let attributeValue = "";
    (serviceExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        attributeValue = item.attributeValue;
      }
    });

    return attributeValue;
  };

  const updateMultiselectAttribute = (attributeId, e) => {
    const attributeValue = e ? e.split(",") : [];
    updateAttribute(attributeId, JSON.stringify(attributeValue));
  };

  const updateAttribute = (attributeId, attributeValue) => {
    const serviceId = data?.id || 0;

    let found = false;
    (serviceExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        item.attributeValue = attributeValue;
        item.serviceId = serviceId;
        found = true;
      }
    });

    if (!found) {
      const item: any = {};
      item.attributeId = attributeId;
      item.attributeValue = attributeValue;
      item.serviceId = serviceId;
      serviceExtraInfos[serviceExtraInfos.length] = item;
    }

    setServiceExtraInfos([...serviceExtraInfos]);
    setFormData({ ...formData, values: { ...formData?.values, timestamp: new Date().getTime() } });
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

  const handleChangeValueCustomerItem = (e, attribute) => {
    const value = e.value;
    updateAttribute(attribute.id, value);
  };

  const onSelectOpenEmployee = async () => {
    if (!listCustomer || listCustomer.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employeeId");

      if (dataOption) {
        setListEmployee([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };

  const handleChangeValueEmployeeItem = (e, attribute) => {
    const value = e.value;
    updateAttribute(attribute.id, value);
  };

  const onSelectOpenContract = async () => {
    if (!listContract || listContract.length === 0) {
      setIsLoadingContract(true);
      const dataOption = await SelectOptionData("contractId");

      if (dataOption) {
        setListContract([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingContract(false);
    }
  };

  const handleChangeValueContractItem = (e, attribute) => {
    const value = e.value;
    updateAttribute(attribute.id, value);
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

  const handleChangeValueContactItem = (e, attribute) => {
    const value = e.value;
    updateAttribute(attribute.id, value);
  };

  const getDecimalScale = (attributes) => {
    attributes = attributes ? JSON.parse(attributes) : {};
    const numberFormat = attributes?.numberFormat || "";
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

  /**
   * Trả về loại control theo kiểu dữ liệu tương ứng
   */
  const getControlByType = (attribute) => {
    let CustomControl = (
      <Input
        id={`Id${attribute.id}`}
        label={attribute.name}
        fill={true}
        value={getAttributeValue(attribute.id)}
        onChange={(e) => updateAttribute(attribute.id, e.target.value)}
        placeholder={`Nhập ${attribute.name.toLowerCase()}`}
        required={!!attribute.required}
        readOnly={!!attribute.readonly}
      />
    );

    switch (attribute.datatype) {
      case "textarea":
        CustomControl = (
          <TextArea
            label={attribute.name}
            name={attribute.name}
            value={getAttributeValue(attribute.id)}
            placeholder={`Nhập ${attribute.name.toLowerCase()}`}
            fill={true}
            required={!!attribute.required}
            readOnly={!!attribute.readonly}
            onChange={(e) => updateAttribute(attribute.id, e.target.value)}
            maxLength={459}
          />
        );
        break;
      case "number":
        CustomControl = (
          <NummericInput
            label={attribute.name}
            name={attribute.name}
            fill={true}
            required={!!attribute.required}
            value={getAttributeValue(attribute.id)}
            thousandSeparator={true}
            placeholder={`Nhập ${attribute.name.toLowerCase()}`}
            decimalScale={getDecimalScale(attribute.attributes)}
            onChange={(e) => {
              const value = e.target.value;
              const valueNum = value?.replace(/,/g, "");
              updateAttribute(attribute.id, valueNum);
            }}
          />
        );
        break;
      case "dropdown":
        CustomControl = (
          <SelectCustom
            name={attribute.name}
            label={attribute.name}
            fill={true}
            required={!!attribute.required}
            readOnly={!!attribute.readonly}
            // error={validateFieldPipeline}
            // message="Loại hợp đồng không được bỏ trống"
            options={attribute.attributes ? JSON.parse(attribute.attributes) : []}
            value={getAttributeValue(attribute.id)}
            onChange={(e) => {
              updateAttribute(attribute.id, e.value);
            }}
            placeholder={`Nhập ${attribute.name.toLowerCase()}`}
          />
        );
        break;
      case "multiselect":
        const attris = getAttributeValue(attribute.id);
        CustomControl = (
          <CheckboxList
            title={attribute.name}
            required={!!attribute.required}
            disabled={!!attribute.readonly}
            options={attribute.attributes ? JSON.parse(attribute.attributes) : []}
            value={attris ? JSON.parse(attris).join(",") : ""}
            onChange={(e) => {
              updateMultiselectAttribute(attribute.id, e);
            }}
          />
        );
        break;
      case "checkbox":
        CustomControl = (
          <Checkbox
            checked={!!getAttributeValue(attribute.id)}
            label={attribute.name}
            onChange={(e) => {
              updateAttribute(attribute.id, e.target.checked);
            }}
          />
        );
        break;
      case "radio":
        CustomControl = (
          <RadioList
            name={attribute.name}
            title={attribute.name}
            options={attribute.attributes ? JSON.parse(attribute.attributes) : []}
            value={getAttributeValue(attribute.id)}
            onChange={(e) => {
              updateAttribute(attribute.id, e.target.value);
            }}
          />
        );
        break;
      case "date":
        CustomControl = (
          <DatePickerCustom
            label={attribute.name}
            name={attribute.name}
            fill={true}
            value={getAttributeValue(attribute.id)}
            onChange={(e) => {
              const newDate = new Date(moment(e).format("YYYY/MM/DD ") + moment(new Date()).format("HH:mm"));
              updateAttribute(attribute.id, newDate);
            }}
            placeholder={`Nhập ${attribute.name.toLowerCase()}`}
            required={!!attribute.required}
            readOnly={!!attribute.readonly}
            iconPosition="left"
            icon={<Icon name="Calendar" />}
            isMaxDate={false}
            // error={validateFieldSignDate}
            // message={`Vui lòng chọn ${contractAttribute.name.toLowerCase()}`}
          />
        );
        break;
      case "lookup":
        const attrs = attribute.attributes ? JSON.parse(attribute.attributes) : {};

        //1. Trường hợp là customer (khách hàng)
        //2. Trường hợp là employee (nhân viên)
        //3. Trường hợp là contract (hợp đồng)
        //4. Trường hợp là contact (người liên hệ)
        switch (attrs?.refType) {
          case "customer":
            CustomControl = (
              <SelectCustom
                label={attribute.name}
                options={listCustomer || []}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!attribute.required}
                readOnly={!!attribute.readonly}
                value={+getAttributeValue(attribute.id)}
                placeholder={`Chọn ${attribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItem(e, attribute)}
              />
            );
            break;
          case "employee":
            CustomControl = (
              <SelectCustom
                label={attribute.name}
                options={listEmployee || []}
                onMenuOpen={onSelectOpenEmployee}
                isLoading={isLoadingEmployee}
                fill={true}
                required={!!attribute.required}
                readOnly={!!attribute.readonly}
                value={+getAttributeValue(attribute.id)}
                placeholder={`Chọn ${attribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueEmployeeItem(e, attribute)}
              />
            );
            break;
          case "contract":
            CustomControl = (
              <SelectCustom
                label={attribute.name}
                options={listContract || []}
                onMenuOpen={onSelectOpenContract}
                isLoading={isLoadingContract}
                fill={true}
                required={!!attribute.required}
                readOnly={!!attribute.readonly}
                value={+getAttributeValue(attribute.id)}
                placeholder={`Chọn ${attribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContractItem(e, attribute)}
              />
            );
            break;
          case "contact":
            CustomControl = (
              <SelectCustom
                label={attribute.name}
                options={listContact || []}
                onMenuOpen={onSelectOpenContact}
                isLoading={isLoadingContact}
                fill={true}
                required={!!attribute.required}
                readOnly={!!attribute.readonly}
                value={+getAttributeValue(attribute.id)}
                placeholder={`Chọn ${attribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueContactItem(e, attribute)}
              />
            );
            break;
          default:
            CustomControl = (
              <SelectCustom
                label={attribute.name}
                options={listCustomer || []}
                onMenuOpen={onSelectOpenCustomer}
                isLoading={isLoadingCustomer}
                fill={true}
                required={!!attribute.required}
                readOnly={!!attribute.readonly}
                value={+getAttributeValue(attribute.id)}
                placeholder={`Chọn ${attribute.name.toLowerCase()}`}
                onChange={(e) => handleChangeValueCustomerItem(e, attribute)}
              />
            );
        }
        break;
      case "formula":
        //Công thức được lấy từ trường động và trường tĩnh
        //{contract.dealValue + contractAttribute.xyz} => sẽ cần parser từ 2 đối tượng là contract và contractAttribute

        //Chỉ hiển thị chứ không lưu giá trị (nếu thêm mới thì không hiển thị?, sửa mới hiển thị)
        CustomControl = (
          <Input
            id={`Id${attribute.id}`}
            label={attribute.name}
            fill={true}
            value={getAttributeFormula(attribute?.attributes)}
            placeholder={`Nhập ${attribute.name.toLowerCase()}`}
            disabled={true}
          />
        );

        break;
    }

    return CustomControl;
  };

  return (
    <div className="add__edit--service">
      <form className="form-service" onSubmit={(e) => onSubmit(e)}>
        <div className="list__form--service">
          <div className="list__field--basic">
            {listFieldBasic.map((field, index) => (
              <FieldCustomize
                key={index}
                field={field}
                handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                formData={formData}
              />
            ))}
          </div>

          <div className={`merge__field ${isBeauty && isBeauty != "1" ? "merge__field--special" : ""}`}>
            {/* <div className={`list__field--advanced`}>
              {listFieldAdvanced.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldAdvanced, setFormData)}
                  formData={formData}
                />
              ))}
            </div> */}

            <div className={`list__field--price`}>
              <div className="field__price--item">
                {listFieldPrice.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldPrice, setFormData)}
                    formData={formData}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* <div className={`list__field--advanced`}>
            {listFieldAdvanced.map((field, index) => (
              <FieldCustomize
                key={index}
                field={field}
                handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldAdvanced, setFormData)}
                formData={formData}
              />
            ))}
          </div>

          <div className={`list__field--price`}>
            <div className="field__price--item">
              {listFieldPrice.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldPrice, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
            {formData?.values?.isCombo == 1 && (
              <div className="add__table--price" onClick={() => setShowModalAddPrice(true)}>
                <Icon name="PlusCircleFill" />
                {JSON.parse(formData?.values?.priceVariation).length > 0 ? "Xem bảng giá" : "Thêm bảng giá"}
              </div>
            )}
          </div> */}

          <div className="list__field--introduce">
            <RadioList
              options={[
                {
                  value: "1",
                  label: "Có",
                },
                {
                  value: "0",
                  label: "Không",
                },
              ]}
              title={"Dịch vụ bán theo combo"}
              value={formData?.values?.isCombo ?? ""}
              name={"code"}
              onChange={(e) => {
                setFormData({ ...formData, values: { ...formData?.values, isCombo: e.target.value } });
              }}
            />
            {formData?.values?.isCombo == 1 && (
              <div className="add__table--price" onClick={() => setShowModalAddPrice(true)}>
                <Icon name="PlusCircleFill" />
                {JSON.parse(formData?.values?.priceVariation).length > 0 ? "Xem bảng giá" : "Thêm bảng giá"}
              </div>
            )}

            <FileUpload label="Ảnh dịch vụ" type="avatar" formData={formData} setFormData={setFormData} isRequired={false} />

            {listFieldIntroduce.map((field, index) => (
              <FieldCustomize
                key={index}
                field={field}
                handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldIntroduce, setFormData)}
                formData={formData}
              />
            ))}
          </div>

          <div className="lst__document--product">
            <label>Tải tài liệu</label>

            <div className={lstDocument.length >= 8 ? "lst__document--scroll" : "box__lst--document"}>
              {lstDocument.length === 0 ? (
                <label htmlFor="uploadDocument" className="action-upload-document">
                  <div className="wrapper-upload">
                    <Icon name="Upload" />
                    Tải tài liệu lên
                  </div>
                </label>
              ) : (
                <Fragment>
                  <div className="d-flex align-items-center">
                    {lstDocument.map((item, idx) => (
                      <div key={idx} className="image-item">
                        <img
                          src={item.type == "xlsx" ? ImgExcel : item.type === "docx" ? ImgWord : item.type === "pptx" ? ImgPowerpoint : item.url}
                          alt="image-document"
                        />
                        <span className="icon-delete" onClick={() => handleRemoveImageItem(idx)}>
                          <Icon name="Trash" />
                        </span>
                      </div>
                    ))}
                    <label htmlFor="uploadDocument" className="add-image">
                      <Icon name="PlusCircleFill" />
                    </label>
                  </div>
                </Fragment>
              )}
            </div>

            <input
              type="file"
              accept="image/*,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"
              className="d-none"
              id="uploadDocument"
              onChange={(e) => handleUploadDocument(e)}
            />
          </div>

          {mapServiceAttribute ? (
            <div className="list--attribute">
              {Object.entries(mapServiceAttribute).map((lstAttribute: any, key: number) => (
                <Fragment key={key}>
                  {(lstAttribute[1] || []).map((attribute, index: number) => (
                    <Fragment key={index}>
                      {!attribute.parentId ? (
                        <label className="label-title" key={`parent_${key}`}>
                          {attribute.name}
                        </label>
                      ) : null}
                      {attribute.parentId ? (
                        <div
                          className={`form-group ${attribute.name.length >= 38 || lstAttribute[1].length == 2 ? "special-case" : ""}`}
                          id={`Field${convertToId(attribute.name)}`}
                          key={`index_${key}_${index}`}
                        >
                          {getControlByType(attribute)}
                        </div>
                      ) : null}
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </div>
          ) : null}
        </div>
        <ModalFooter actions={actions} />
      </form>
      <AddPriceService
        onShow={showModalAddPrice}
        handleTakePriceVariant={handleTakePriceVariant}
        dataProps={formData?.values?.priceVariation}
        onHide={(reload) => {
          setShowModalAddPrice(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
