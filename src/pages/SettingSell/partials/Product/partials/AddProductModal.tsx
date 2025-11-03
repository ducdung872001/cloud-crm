import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import { AddProductProps } from "model/product/PropsModel";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IProductRequest } from "model/product/ProductRequestModel";
import { IProductResponse } from "model/product/ProductResponseModel";
import ProductService from "services/ProductService";
import Icon from "components/icon";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { convertToId, isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import FileUpload from "components/fileUpload/fileUpload";
import SelectCustom from "components/selectCustom/selectCustom";
import NummericInput from "components/input/numericInput";
import ImgExcel from "assets/images/img-excel.png";
import ImgWord from "assets/images/img-word.png";
import ImgPowerpoint from "assets/images/img-powerpoint.png";
import "tippy.js/animations/scale-extreme.css";
import "./AddProductModal.scss";
import ProductExtraInfoService from "services/ProductExtraInfoService";
import ProductAttributeService from "services/ProductAttributeService";
import CategoryServiceService from "services/CategoryServiceService";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import moment from "moment";
import RadioList from "components/radio/radioList";
import Checkbox from "components/checkbox/checkbox";
import CheckboxList from "components/checkbox/checkboxList";
import TextArea from "components/textarea/textarea";
import Input from "components/input/input";
import { Parser } from "formula-functionizer";
import { uploadDocumentFormData } from "utils/document";
import FileService from "services/FileService";

export default function AddProductModal(props: AddProductProps) {
  const { onShow, onHide, idProduct, data } = props;
  //

  const parser = new Parser();

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [detailProduct, setDetailProduct] = useState<IProductResponse>(null);

  const [listUnit, setListUnit] = useState<IOption[]>(null);
  const [isLoadingUnit, setIsLoadingUnit] = useState<boolean>(false);

  const [addFieldExchange, setAddFieldExchange] = useState<any[]>([]);

  const [productExtraInfos, setProductExtraInfos] = useState<any>([]);
  // console.log("productExtraInfos", productExtraInfos);

  const [mapProductAttribute, setMapProductAttribute] = useState<any>(null);
  // console.log("mapProductAttribute", mapProductAttribute);

  //Dùng cho lookup
  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [listContract, setListContract] = useState<IOption[]>(null);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);
  const [listContact, setListContact] = useState<IOption[]>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);

  //! đoạn này callapi chi tiết sản phẩm
  const getDetailProduct = async () => {
    const response = await ProductService.detail(idProduct);

    if (response.code === 0) {
      const result = response.result;
      setDetailProduct(result);
    }
  };

  useEffect(() => {
    if (onShow && idProduct !== null) {
      getDetailProduct();
    }

    if (onShow) {
      getAttributes();
    }

    if (data?.categoryId) {
      // getAttributes(data?.categoryId);
      setDetailCategory(data?.categoryId ? { value: data?.categoryId, label: data?.categoryName } : null);
    }

    if (data?.id && onShow) {
      onSelectOpenEmployee();
      onSelectOpenContract();
      onSelectOpenCustomer();
      onSelectOpenContact();
    }
  }, [onShow, idProduct, data]);

  useEffect(() => {
    //Lấy thông tin ExtraInfos
    if (data?.id && mapProductAttribute) {
      getExtraInfos();
    }
  }, [data?.id, mapProductAttribute]);

  const getExtraInfos = async () => {
    // console.log("eerr");

    const response = await ProductExtraInfoService.list(data?.id);
    // console.log("response =>", response);
    if (response.code === 0) {
      const result = response.result?.map((item) => {
        return {
          attributeId: item.attributeId,
          productId: item.productId,
          attributeValue: item.attributeValue,
        };
      });
      setProductExtraInfos(result);
    }
  };

  const getAttributes = async () => {
    const response = await ProductAttributeService.listAll();
    if (response.code === 0) {
      const dataOption = response.result;
      setMapProductAttribute(dataOption || {});
    }
  };

  const onSelectOpenUnit = async () => {
    if (!listUnit || listUnit.length === 0) {
      setIsLoadingUnit(true);
      const dataOption = await SelectOptionData("unit");

      if (dataOption) {
        setListUnit([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingUnit(false);
    }
  };

  useEffect(() => {
    if (detailProduct?.unitId) {
      onSelectOpenUnit();
    }

    if (detailProduct?.unitId === null) {
      setListUnit([]);
    }
  }, [detailProduct]);

  const values = useMemo(
    () =>
      ({
        name: detailProduct?.name ?? "",
        code: detailProduct?.code ?? "",
        productLine: detailProduct?.productLine ?? "",
        position: detailProduct?.position?.toString() ?? "0",
        status: detailProduct?.status?.toString() ?? "1",
        avatar: detailProduct?.avatar ?? "",
        categoryId: data?.categoryId ?? null,
        unitId: detailProduct?.unitId ?? null,
        price: detailProduct?.price ?? 0,
        exchange: 1,
        documents: JSON.parse(detailProduct?.documents || "[]") ?? [],
        expiredPeriod: detailProduct?.expiredPeriod ?? 0,
        otherUnits: JSON.parse(detailProduct?.otherUnits || "[]") ?? [],
        type: detailProduct?.status?.toString() ?? "1",
        minQuantity: detailProduct?.minQuantity ?? 0,
      } as IProductRequest),
    [detailProduct, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },

    {
      name: "status",
      rules: "required",
    },
    {
      name: "type",
      rules: "required",
    },

    {
      name: "unitId",
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
      type: 2,
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
    setFormData({ ...formData, values: { ...formData?.values, categoryId: e.value } });
    // getAttributes(e.value)
  };

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

  const listFieldBasic = useMemo(
    () =>
      [
        {
          name: "categoryId",
          type: "custom",
          snippet: (
            <SelectCustom
              id="categoryId"
              name="categoryId"
              label="Danh mục sản phẩm"
              fill={true}
              required={true}
              error={validateFieldCategory}
              message="Danh mục sản phẩm không được bỏ trống"
              options={[]}
              value={detailCategory}
              onChange={(e) => handleChangeValueCategory(e)}
              isAsyncPaginate={true}
              placeholder="Chọn manh mục sản phẩm"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionCategory}
            />
          ),
        },
        {
          name: "groupForm",
          type: "custom",
          snippet: (
            <div className="group__form">
              <div className="group__form--left">
                <FileUpload type="avatar" label="Ảnh sản phẩm" formData={formData} setFormData={setFormData} />
              </div>
              <div className="group__form--right">
                <div className="form-group">
                  <Input
                    name="name"
                    label="Tên sản phẩm"
                    fill={true}
                    required={true}
                    value={formData?.values?.name}
                    placeholder="Nhập tên sản phẩm"
                    onChange={(e) => setFormData({ ...formData, values: { ...formData.values, name: e.target.value } })}
                  />
                </div>
                <div className="form-group">
                  <Input
                    name="code"
                    label="Mã sản phẩm"
                    fill={true}
                    value={formData?.values?.code}
                    placeholder="Nhập mã sản phẩm"
                    onChange={(e) => setFormData({ ...formData, values: { ...formData.values, code: e.target.code } })}
                  />
                </div>
              </div>
            </div>
          ),
        },
        {
          label: "Dòng sản phẩm",
          name: "productLine",
          type: "text",
          fill: true,
          required: false,
        },
        {
          label: "Thứ tự",
          name: "position",
          type: "number",
          fill: true,
        },
        {
          label: "Tồn kho tối thiểu",
          name: "minQuantity",
          type: "number",
          fill: true,
          required: false,
        },
        {
          label: "Cảnh báo hết hạn",
          name: "expiredPeriod",
          type: "number",
          fill: true,
          required: false,
          suffixes: "Ngày",
        },
      ] as IFieldCustomize[],
    [validateFieldCategory, detailCategory, formData?.values]
  );

  const listFieldOption: IFieldCustomize[] = [
    {
      label: "Trạng thái kinh doanh",
      name: "status",
      type: "radio",
      fill: true,
      required: true,
      options: [
        {
          value: "1",
          label: "Đang kinh doanh",
        },
        {
          value: "2",
          label: "Ngừng kinh doanh",
        },
      ],
    },
    {
      label: "Phân loại",
      name: "type",
      type: "radio",
      fill: true,
      required: true,
      options: [
        {
          value: "1",
          label: "Thành phẩm",
        },
        {
          value: "2",
          label: "Vật tư tiêu hao",
        },
      ],
    },
  ];

  const listFieldAdvanced = useMemo(
    () =>
      [
        {
          label: "Đơn vị tính nhỏ nhất",
          name: "unitId",
          type: "select",
          fill: true,
          required: true,
          options: listUnit,
          onMenuOpen: onSelectOpenUnit,
          isLoading: isLoadingUnit,
        },
        {
          label: "Hệ số quy đổi",
          name: "exchange",
          type: "text",
          fill: true,
          disabled: true,
        },
        {
          label: "Giá bán",
          name: "price",
          type: "number",
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [listUnit, isLoadingUnit]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  //! đoạn này xử lý vấn đề lấy giá trị của unit khi thêm nhiều
  const handleChangeValueUnitItem = (e, idx) => {
    const value = e.value;

    setAddFieldExchange((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, unitId: value };
        }
        return obj;
      })
    );
  };

  //! đoạn này xử lý vấn đề lấy giá trị của hệ số quy đổi
  const handleChangeValueExchangeItem = (e, idx) => {
    const value = e.value;

    setAddFieldExchange((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, exchange: +value };
        }
        return obj;
      })
    );
  };

  //! đoạn này xử lý vấn đề lấy giá trị của giá khi thêm nhiều
  const handleChangePriceItem = (e, idx) => {
    const value = e.value;

    setAddFieldExchange((current) =>
      current.map((obj, index) => {
        if (index === idx) {
          return { ...obj, price: +value };
        }
        return obj;
      })
    );
  };

  //! xóa đi 1 item exchange
  const handleRemoveItemExchange = (idx) => {
    const result = [...addFieldExchange];
    result.splice(idx, 1);

    setAddFieldExchange(result);
  };

  //! đoạn này gom hết những trường exchange mình mới add vào rồi gửi đi
  useEffect(() => {
    if (addFieldExchange.length > 0) {
      setFormData({ ...formData, values: { ...formData?.values, otherUnits: addFieldExchange } });
    } else {
      setFormData({ ...formData, values: { ...formData?.values, otherUnits: [] } });
    }
  }, [addFieldExchange]);

  //! đoạn này xử lý vấn đề chỉnh sửa lấy hết dữ liệu fill ra
  useEffect(() => {
    if (detailProduct !== null) {
      if (detailProduct.otherUnits) {
        const fillData = JSON.parse(detailProduct?.otherUnits);
        const result = fillData.filter((item) => item.isBasis !== 1);
        setAddFieldExchange(result);
      }

      if (detailProduct.documents) {
        const changeDocuments = JSON.parse(detailProduct?.documents);
        setLstDocument(changeDocuments);
      }
    }
  }, [detailProduct]);

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

    const errors = Validate(validations, formData, [...listFieldBasic, ...listFieldAdvanced, ...listFieldOption]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    if (!detailCategory) {
      setValidateFieldCategory(true);
      showToast("Vui lòng chọn danh mục sản phẩm", "error");
      return;
    }

    ///check validate các trường động
    if (
      mapProductAttribute &&
      Object.entries(mapProductAttribute) &&
      Array.isArray(Object.entries(mapProductAttribute)) &&
      Object.entries(mapProductAttribute).length > 0
    ) {
      const newArray = Object.entries(mapProductAttribute);
      const checkArray = [];

      newArray.map((lstContractAttribute: any, key: number) => {
        (lstContractAttribute[1] || []).map((item) => {
          if (item.required === 1 && item.parentId !== 0) {
            checkArray.push(item);
          }
        });
      });

      if (checkArray.length > 0) {
        if (productExtraInfos.length === 0) {
          showToast(`Các trường thông tin bổ sung bắt buộc không được để trống:`, "error");
          return;
        } else {
          let check = false;
          checkArray.map((i) => {
            const index = productExtraInfos.findIndex((el) => el.attributeId === i.id);
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

    const body: IProductRequest = {
      ...(detailProduct ? { id: detailProduct?.id } : {}),
      ...(formData.values as IProductRequest),
      otherUnits: JSON.stringify(formData?.values?.otherUnits),
      documents: JSON.stringify(formData?.values?.documents),
      productExtraInfos: productExtraInfos,
    };

    const response = await ProductService.update(body);

    if (response.code === 0) {
      showToast(`${detailProduct ? "Cập nhật" : "Thêm mới"} sản phẩm thành công`, "success");
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
              _.isEqual(formData?.values, values) ? handleClear(false) : showDialogConfirmCancel();
            },
          },
          {
            title: idProduct ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || _.isEqual(formData?.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, idProduct]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${detailProduct ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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

  const handleClear = (acc) => {
    onHide(acc);
    setDetailCategory(null);
    setValidateFieldCategory(false);
    setDetailProduct(null);
    setAddFieldExchange([]);
    setMapProductAttribute([]);
    setProductExtraInfos([]);
    setLstDocument([]);
  };

  const getAttributeFormula = (attributes) => {
    const attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    const attrObj = {};
    (productExtraInfos || []).map((item, idx) => {
      if (item.datatype == "number") {
        // console.log(item);
        attrObj["serviceAttribute_" + convertToId(item.attributeName)] = +item.attributeValue;
      }
    });

    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
  };

  const getAttributeValue = (attributeId) => {
    let attributeValue = "";
    (productExtraInfos || []).map((item, idx) => {
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
    const productId = data?.id || 0;

    let found = false;
    (productExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        item.attributeValue = attributeValue;
        item.productId = productId;
        found = true;
      }
    });

    if (!found) {
      const item: any = {};
      item.attributeId = attributeId;
      item.attributeValue = attributeValue;
      item.productId = productId;
      productExtraInfos[productExtraInfos.length] = item;
    }

    setProductExtraInfos([...productExtraInfos]);
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
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-add-product"
        size="lg"
      >
        <form className="form-product-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${detailProduct !== null ? "Chỉnh sửa" : "Thêm mới"} sản phẩm`}
            toggle={() => {
              !isSubmit && handleClear(false);
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              {listFieldBasic.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                  formData={formData}
                />
              ))}
              <div className="option__field--lst">
                {listFieldOption.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldOption, setFormData)}
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
              <div className="options__exchange">
                <div className="exchange__default">
                  {listFieldAdvanced.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldAdvanced, setFormData)}
                      formData={formData}
                    />
                  ))}
                </div>
                <span className="add-exchange">
                  <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                    <span
                      className="icon-add"
                      onClick={() => {
                        setAddFieldExchange([...addFieldExchange, { id: 0, unitId: null, exchange: 1, price: 0 }]);
                      }}
                    >
                      <Icon name="PlusCircleFill" />
                    </span>
                  </Tippy>
                </span>
              </div>
              <div className="list__exchange">
                {addFieldExchange.map((item, idx) => {
                  return (
                    <div key={idx} className="exchange__item">
                      <div className="list-field-exchange">
                        <div className="form-group">
                          <SelectCustom
                            label="Đơn vị tính"
                            options={listUnit || []}
                            onMenuOpen={onSelectOpenUnit}
                            isLoading={isLoadingUnit}
                            fill={true}
                            required={true}
                            value={item.unitId}
                            placeholder="Chọn đơn vị tính"
                            onChange={(e) => handleChangeValueUnitItem(e, idx)}
                          />
                        </div>
                        <div className="form-group">
                          <NummericInput
                            label="Hệ số quy đổi"
                            name="exchange"
                            fill={true}
                            thousandSeparator={true}
                            value={item.exchange}
                            placeholder="Nhập hệ số quy đổi"
                            onValueChange={(e) => handleChangeValueExchangeItem(e, idx)}
                          />
                        </div>
                        <div className="form-group">
                          <NummericInput
                            label="Giá bán"
                            name="price"
                            fill={true}
                            required={true}
                            thousandSeparator={true}
                            value={item.price}
                            onValueChange={(e) => handleChangePriceItem(e, idx)}
                            minValue={1}
                          />
                        </div>
                      </div>
                      <span className="remove-exchange">
                        <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                          <span className="icon-remove" onClick={() => handleRemoveItemExchange(idx)}>
                            <Icon name="Trash" />
                          </span>
                        </Tippy>
                      </span>
                    </div>
                  );
                })}
              </div>

              {mapProductAttribute ? (
                <div className="list--attribute">
                  {Object.entries(mapProductAttribute).map((lstAttribute: any, key: number) => (
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
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
