/* eslint-disable prefer-const */
import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IProductFilterRequest } from "model/product/ProductRequestModel";
import { AddProductImportModalProps } from "model/invoice/PropsModel";
import { IInvoiceDetailRequest } from "model/invoice/InvoiceRequestModel";
import { IInfoExpiryDateProductionDate } from "model/warehouse/WarehouseRequestModel";
import ProductImportService from "services/ProductImportService";
import ProductService from "services/ProductService";
import WarehouseService from "services/WarehouseService";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { useDebounce } from "utils/hookCustom";
import ImageThirdGender from "assets/images/third-gender.png";
import { isDifferenceObj } from "reborn-util";
import "./AddProductImportModal.scss";

interface IOptionData {
  value: string;
  label: string;
  unitId?: number;
  exchange?: number;
}

export default function AddProductImportModal(props: AddProductImportModalProps) {
  const { onShow, onHide, data, invoiceId } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [dataProduct, setDataProduct] = useState(null);
  const [idProduct, setIdProduct] = useState(null);
  const [listUnitProduct, setListUnitProduct] = useState<IOptionData[]>([]);

  const [valueBatchNo, setValueBatchNo] = useState<string>(null);
  const queryDebounce = useDebounce(valueBatchNo, 500);

  //! validate
  const [checkFieldProduct, setCheckFieldProduct] = useState<boolean>(false);
  const [checkFieldUnit, setCheckFieldUnit] = useState<boolean>(false);

  const loadedOptionProduct = async (search, loadedOptions, { page }) => {
    const param: IProductFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ProductService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items || [];

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

  //! đoạn này xử lý vấn đề hiển thị hình ảnh sản phẩm
  const formatOptionLabelProduct = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //! đoạn này xử lý thay đổi sản phẩm
  const handleChangeValueProduct = (e) => {
    setDataProduct(e);
    setIdProduct(e.value);
    setCheckFieldProduct(false);
    setFormData({ ...formData, values: { ...formData?.values, productId: e.value } });
  };

  //! đoạn này xử lý vấn đề update sản phẩm
  const getDetailProduct = async () => {
    const response = await ProductService.detail(data?.productId);

    if (response.code === 0) {
      const result = response.result;

      setDataProduct({ value: result.id, label: result.name, avatar: result.avatar });

      const dataOtherUnits = JSON.parse(result.otherUnits ? result.otherUnits : "[]");

      if (dataOtherUnits.length > 0) {
        onSelectOpenUnit(dataOtherUnits);
      }
    }
  };

  useEffect(() => {
    if (data?.productId) {
      getDetailProduct();
    }
  }, [data?.productId]);

  //! Từ idProduct xử lý lấy ra đơn vị sản phẩm tương ứng
  const onSelectOpenUnit = (dataOtherUnits: any) => {
    const dataOption = dataOtherUnits.map((item) => {
      return { value: item.unitId, label: item.unitName, exchange: item.exchange };
    });

    setListUnitProduct([...(dataOption.length > 0 ? dataOption : [])]);
  };

  const detailProduct = async () => {
    const response = await ProductService.detail(idProduct);

    if (response.code === 0) {
      const result = response.result;
      const dataOtherUnits = JSON.parse(result.otherUnits ? result.otherUnits : "[]");

      if (dataOtherUnits.length > 0) {
        onSelectOpenUnit(dataOtherUnits);
      }
    }
  };

  useEffect(() => {
    if (idProduct) {
      detailProduct();
    }
  }, [idProduct]);

  const handleChangeValueUnit = (e) => {
    setCheckFieldUnit(false);
    setFormData({ ...formData, values: { ...formData?.values, unitId: e.value } });
  };

  const values = useMemo(
    () =>
      ({
        customerId: -1,
        invoiceId: invoiceId,
        productId: data?.productId ?? null,
        batchNo: data?.batchNo ?? "",
        unitId: data?.unitId ?? null,
        exchange: data?.exchange ?? 1,
        mfgDate: data?.mfgDate ?? "",
        expiryDate: data?.expiryDate ?? "",
        quantity: data?.quantity?.toString() ?? "",
        mainCost: data?.mainCost?.toString() ?? "",
      } as IInvoiceDetailRequest),
    [data, onShow, invoiceId]
  );

  const validations: IValidation[] = [
    {
      name: "batchNo",
      rules: "required",
    },
    {
      name: "expiryDate",
      rules: "required",
    },
    {
      name: "quantity",
      rules: "required|min:0",
    },
    {
      name: "mainCost",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

  //! đoạn này xử lý vấn đề kiểm tra xem số lô có trong sản phẩm chưa để fill ra ngày sản xuất và ngày hết hạn
  const checkInputBatchNo = async () => {
    const param: IInfoExpiryDateProductionDate = {
      productId: formData?.values?.productId,
      batchNo: formData?.values?.batchNo,
    };

    const response = await WarehouseService.infoExpiryDateProductionDate(param);

    if (response && response.code === 0) {
      const result = response.result;

      setFormData({ ...formData, values: { ...formData?.values, mfgDate: result?.mfgDate, expiryDate: result?.expiryDate } });
    }
  };

  useEffect(() => {
    if (dataProduct?.value && queryDebounce) {
      //! đoạn này bh nghĩ cách tối ưu vì mỗi 1 lần gõ call api 1 lần không nhất thiết
      checkInputBatchNo();
    }
  }, [dataProduct?.value, queryDebounce]);

  const listField = useMemo(
    () =>
      [
        {
          type: "custom",
          name: "productId",
          snippet: (
            <SelectCustom
              fill={true}
              id="productId"
              name="productId"
              label="Sản phẩm"
              options={[]}
              required={true}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn sản phẩm"
              additional={{
                page: 1,
              }}
              value={dataProduct}
              onChange={(e) => handleChangeValueProduct(e)}
              loadOptionsPaginate={loadedOptionProduct}
              formatOptionLabel={formatOptionLabelProduct}
              error={checkFieldProduct}
              message="Sản phẩm không được bỏ trống"
            />
          ),
        },
        {
          label: "Số lô",
          name: "batchNo",
          type: "text",
          fill: true,
          required: true,
          onChange: (e) => setValueBatchNo(e.target.value),
        },
        {
          type: "custom",
          name: "unitId",
          snippet: (
            <SelectCustom
              fill={true}
              id="unitId"
              name="unitId"
              label="Đơn vị tính"
              options={listUnitProduct}
              required={true}
              value={formData?.values?.unitId}
              error={checkFieldUnit}
              placeholder="Chọn đơn vị tính"
              message="Đơn vị tính không được bỏ trống"
              onChange={(e) => handleChangeValueUnit(e)}
            />
          ),
        },
        {
          label: "Ngày sản xuất",
          name: "mfgDate",
          type: "date",
          fill: true,
          isMaxDate: true,
          placeholder: "Chọn ngày sản xuất",
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
        },
        {
          label: "Ngày hết hạn",
          name: "expiryDate",
          type: "date",
          fill: true,
          required: true,
          isMinDate: true,
          placeholder: "Chọn ngày hết hạn",
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
        },
        {
          label: "Số lượng",
          name: "quantity",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Giá nhập",
          name: "mainCost",
          type: "number",
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    [dataProduct, listUnitProduct, formData?.values, checkFieldProduct, checkFieldUnit]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (formData?.values?.productId == null) {
      setCheckFieldProduct(true);
      return;
    }

    if (formData?.values?.unitId == null) {
      setCheckFieldUnit(true);
      return;
    }

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: IInvoiceDetailRequest = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as IInvoiceDetailRequest),
    };

    // let arrExchange = (listUnitProduct || []).filter((item) => item.value == body.unitId.toString());

    // if (arrExchange.length > 0) {
    //   body.exchange = arrExchange[0].exchange;
    // }

    const response = await ProductImportService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} sản phẩm thành công`, "success");
      onHide(true);
      setValueBatchNo(null);
      setDataProduct(null);
      setIdProduct(null);
      setListUnitProduct([]);
    } else {
      showToast(response.error ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
    setValueBatchNo(null);
    setDataProduct(null);
    setIdProduct(null);
    setListUnitProduct([]);
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
              !isDifferenceObj(formData.values, values) ? handClearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              checkFieldProduct ||
              checkFieldUnit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldProduct, checkFieldUnit]
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
        onHide(false);
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-product--import"
      >
        <form className="form-product-import-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} sản phẩm nhập hàng`}
            toggle={() => {
              !isSubmit && onHide(false);
              !isSubmit && setValueBatchNo(null);
              !isSubmit && setDataProduct(null);
              !isSubmit && setIdProduct(null);
              !isSubmit && setListUnitProduct([]);
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
