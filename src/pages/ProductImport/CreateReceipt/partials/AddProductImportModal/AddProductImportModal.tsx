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
import { urlsApi } from "configs/urls";
import "./AddProductImportModal.scss";
import moment from "moment";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IVariantOption {
  value: number;          // variantId
  label: string;          // "Intel i7 · 16GB · 512GB SSD"
  sku: string;
  unitId: number;
  unitName: string;
  quantity: number;       // tồn kho hiện tại
}

interface IProductOption {
  value: number;
  label: string;
  avatar?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Gộp selectedOptions thành chuỗi "Màu đỏ · Size L · 16GB" */
const buildVariantLabel = (selectedOptions: Array<{ optionName?: string; value?: string }> = []): string => {
  const parts = selectedOptions.map((o) => o.value).filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Mặc định";
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AddProductImportModal(props: AddProductImportModalProps) {
  const { onShow, onHide, data, invoiceId } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  // ── Bước 1: chọn sản phẩm ─────────────────────────────────────────────────
  const [selectedProduct, setSelectedProduct] = useState<IProductOption | null>(null);

  // ── Bước 2: chọn biến thể ─────────────────────────────────────────────────
  const [variantOptions, setVariantOptions] = useState<IVariantOption[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<IVariantOption | null>(null);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

  // ── Validate checks ────────────────────────────────────────────────────────
  const [checkFieldProduct, setCheckFieldProduct] = useState<boolean>(false);
  const [checkFieldVariant, setCheckFieldVariant] = useState<boolean>(false);

  const [valueBatchNo, setValueBatchNo] = useState<string>(null);
  const queryDebounce = useDebounce(valueBatchNo, 500);

  // ── Async load sản phẩm (giữ nguyên pattern cũ) ───────────────────────────
  const loadedOptionProduct = async (search: string, _loadedOptions: any, { page }: { page: number }) => {
    const param: IProductFilterRequest = { name: search, page, limit: 10 };
    const response = await ProductService.list(param);

    if (response.code === 0) {
      const items = response.result.items || [];
      return {
        options: items.map((item: any) => ({
          value: item.id,
          label: item.name,
          avatar: item.avatar,
        })),
        hasMore: response.result.loadMoreAble,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false };
  };

  const formatOptionLabelProduct = ({ label, avatar }: { label: string; avatar?: string }) => (
    <div className="selected--item">
      <div className="avatar">
        <img src={avatar || ImageThirdGender} alt={label} />
      </div>
      {label}
    </div>
  );

  // ── Load biến thể khi chọn sản phẩm ──────────────────────────────────────
  const loadVariants = async (productId: number) => {
    setIsLoadingVariants(true);
    setVariantOptions([]);
    setSelectedVariant(null);

    try {
      const res = await fetch(
        `${urlsApi.productImport.variantList}?productId=${productId}&limit=50&page=1`,
        { method: "GET" }
      ).then((r) => r.json());

      if (res.code === 0) {
        const items: any[] = res.result?.items ?? res.result ?? [];
        console.log("variant sample:", items[0]); 

        const opts: IVariantOption[] = items.map((v) => ({
          value: v.id,
          label: buildVariantLabel(v.selectedOptions ?? v.optionValues ?? []),
          sku: v.sku ?? "",
          unitId: v.baseUnit?? v.unitId ?? 0,
          unitName: v.baseUnitName ?? v.unitName ?? "",
          quantity: v.quantity ?? 0,
        }));
        setVariantOptions(opts);

        // Edit mode: tự chọn lại variant cũ
        if (data?.variantId) {
          const found = opts.find((o) => o.value === data.variantId);
          if (found) applyVariant(found);
        }
        // Nếu chỉ có 1 variant → auto-select
        else if (opts.length === 1) {
          applyVariant(opts[0]);
        }
      }
    } catch (_) {
      showToast("Không tải được danh sách biến thể", "error");
    } finally {
      setIsLoadingVariants(false);
    }
  };

  /** Áp dụng variant được chọn → tự fill unitId */
  const applyVariant = (variant: IVariantOption) => {
    setSelectedVariant(variant);
    setCheckFieldVariant(false);
    setFormData((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        variantId: variant.value,
        unitId: variant.unitId,
      },
    }));
  };

  const handleChangeProduct = (e: IProductOption) => {
    setSelectedProduct(e);
    setCheckFieldProduct(false);
    setCheckFieldVariant(false);
    setSelectedVariant(null);
    setVariantOptions([]);
    setFormData((prev) => ({
      ...prev,
      values: { ...prev.values, productId: e.value, variantId: undefined, unitId: null },
    }));
    loadVariants(e.value);
  };

  // ── Tự load lại khi edit ──────────────────────────────────────────────────
  useEffect(() => {
    if (!data?.productId) return;

    ProductService.detail(data.productId).then((res) => {
      if (res.code === 0) {
        const r = res.result;
        setSelectedProduct({ value: r.id, label: r.name, avatar: r.avatar });
        loadVariants(r.id);
      }
    });
  }, [data?.productId]);

  // ── Auto-fill ngày từ batch no ────────────────────────────────────────────
  const checkInputBatchNo = async () => {
    if (!formData?.values?.productId || !formData?.values?.batchNo) return;
    const param: IInfoExpiryDateProductionDate = {
      productId: formData.values.productId,
      batchNo: formData.values.batchNo,
    };
    const response = await WarehouseService.infoExpiryDateProductionDate(param);
    if (response?.code === 0) {
      const result = response.result;
      setFormData((prev) => ({
        ...prev,
        values: { ...prev.values, mfgDate: result?.mfgDate, expiryDate: result?.expiryDate },
      }));
    }
  };

  useEffect(() => {
    if (selectedProduct?.value && queryDebounce) {
      checkInputBatchNo();
    }
  }, [selectedProduct?.value, queryDebounce]);

  // ── Form values ───────────────────────────────────────────────────────────
  const values = useMemo(
    () =>
    ({
      customerId: -1,
      invoiceId: invoiceId,
      productId: data?.productId ?? null,
      variantId: data?.variantId ?? null,
      batchNo: data?.batchNo ?? "",
      unitId: data?.unitId ?? null,
      exchange: data?.exchange ?? 1,
      mfgDate: data?.mfgDate ?? "",
      expiryDate: data?.expiryDate ?? "",
      quantity: data?.quantity?.toString() ?? "",
      mainCost: data?.mainCost?.toString() ?? "",
      discount: (data as any)?.discount?.toString() ?? "0",
    } as IInvoiceDetailRequest & { discount?: string }),
    [data, onShow, invoiceId]
  );

  const validations: IValidation[] = [
    { name: "batchNo", rules: "required" },
    { name: "expiryDate", rules: "required" },
    { name: "quantity", rules: "required|min:0" },
    { name: "mainCost", rules: "required" },
  ];

  const [formData, setFormData] = useState<IFormData>({ values });

  useEffect(() => {
    setFormData({ values, errors: {} });
    setIsSubmit(false);
    return () => setIsSubmit(false);
  }, [values]);

  // ── Field list ────────────────────────────────────────────────────────────
  const listField = useMemo<IFieldCustomize[]>(
    () => [
      // ── Bước 1: Chọn sản phẩm ──
      {
        type: "custom",
        name: "productId",
        label: "Sản phẩm",
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
            placeholder="Tìm theo tên sản phẩm..."
            additional={{ page: 1 }}
            value={selectedProduct}
            onChange={(e) => handleChangeProduct(e)}
            loadOptionsPaginate={loadedOptionProduct}
            formatOptionLabel={formatOptionLabelProduct}
            error={checkFieldProduct}
            message="Sản phẩm không được bỏ trống"
          />
        ),
      },

      // ── Bước 2: Chọn biến thể ──
      {
        type: "custom",
        name: "variantId",
        label: "Biến thể",
        col: 12,
        snippet: (
          <SelectCustom
            fill={true}
            id="variantId"
            name="variantId"
            label="Biến thể"
            required={true}
            options={variantOptions.map((v) => ({
              value: v.value,
              label: v.label,
              sku: v.sku,
              quantity: v.quantity,
              unitName: v.unitName,
            }))}
            isFormatOptionLabel={true}
            formatOptionLabel={(opt: any) => (
              <div className="selected--item variant-option-item">
                <div className="variant-option-main">
                  <span>{opt.label}</span>
                  {opt.sku && (
                    <span className="variant-option-sku">{opt.sku}</span>
                  )}
                </div>
                <span className="variant-option-stock">
                  Tồn: {opt.quantity ?? 0} {opt.unitName}
                </span>
              </div>
            )}
            value={selectedVariant?.value ?? null}
            placeholder={
              !selectedProduct
                ? "Chọn sản phẩm trước"
                : isLoadingVariants
                  ? "Đang tải biến thể..."
                  : variantOptions.length === 0
                    ? "Sản phẩm không có biến thể"
                    : "Chọn biến thể"
            }
            disabled={!selectedProduct || isLoadingVariants || variantOptions.length === 0}
            onChange={(e: any) => {
              const found = variantOptions.find((v) => v.value === e.value);
              if (found) applyVariant(found);
            }}
            error={checkFieldVariant}
            message="Biến thể không được bỏ trống"
          />
        ),
      },

      // ── Thông tin lô hàng ──
      {
        label: "Số lô",
        name: "batchNo",
        type: "text",
        fill: true,
        required: true,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValueBatchNo(e.target.value),
      },
      {
        type: "custom",
        name: "unitId",
        label: "Đơn vị tính",
        snippet: (
          <SelectCustom
            fill={true}
            id="unitId"
            name="unitId"
            label="Đơn vị tính"            
            options={
              selectedVariant
                ? [{ value: selectedVariant.unitId, label: selectedVariant.unitName }]
                : []
            }
            value={formData?.values?.unitId ?? null}
            placeholder="Tự động điền từ biến thể"
            disabled={true}
            onChange={() => undefined}
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

      // ── Số lượng & Giá ──
      {
        label: "Số lượng",
        name: "quantity",
        type: "number",
        fill: true,
        required: true,
      },
      {
        label: "Giá nhập / đơn vị",
        name: "mainCost",
        type: "number",
        fill: true,
        required: true,
      },
      {
        label: "Chiết khấu (%)",
        name: "discount",
        type: "number",
        fill: true,
        placeholder: "0",
      },
    ],
    [selectedProduct, selectedVariant, variantOptions, isLoadingVariants, formData?.values, checkFieldProduct, checkFieldVariant]
  );

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      setCheckFieldProduct(true);
      return;
    }

    if (!selectedVariant) {
      setCheckFieldVariant(true);
      return;
    }

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }

    setIsSubmit(true);

    if (!invoiceId) {
      showToast("Vui lòng tạo phiếu nhập trước khi thêm sản phẩm", "warning");
      setIsSubmit(false);
      return;
    }

    const discountVal = parseFloat((formData.values as any).discount ?? "0") || 0;

    const body: IInvoiceDetailRequest = {
      ...(data ? { id: data.id } : {}),
      ...(formData.values as IInvoiceDetailRequest),
      invoiceId,
      // ✅ Truyền đúng variantId
      variantId: selectedVariant.value,
      productId: selectedProduct.value,
      unitId: selectedVariant.unitId,
      discount: discountVal,
      mfgDate: formData.values.mfgDate
        ? moment(formData.values.mfgDate).format("YYYY-MM-DDTHH:mm:ss")
        : null,
      expiryDate: moment(formData.values.expiryDate).format("YYYY-MM-DDTHH:mm:ss"),
    };

    const response = await ProductImportService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} sản phẩm thành công`, "success");
      onHide(true);
      clearForm();
    } else {
      showToast(response.error ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const clearForm = () => {
    setValueBatchNo(null);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setVariantOptions([]);
  };

  const handClearForm = () => {
    onHide(false);
    clearForm();
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
              checkFieldVariant ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, checkFieldProduct, checkFieldVariant]
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
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận",
      defaultAction: () => { onHide(false); setShowDialog(false); setContentDialog(null); },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const checkKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) focusedElement.blur();
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);
    return () => window.removeEventListener("keydown", checkKeyDown);
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
        <form className="form-product-import-group" onSubmit={onSubmit}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} sản phẩm nhập hàng`}
            toggle={() => {
              if (!isSubmit) {
                onHide(false);
                clearForm();
              }
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) =>
                    handleChangeValidate(value, field, formData, validations, listField, setFormData)
                  }
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