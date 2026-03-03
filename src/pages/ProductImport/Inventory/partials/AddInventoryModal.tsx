// AddWarehouseBookModal.tsx
import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj, formatCurrency } from "reborn-util";
import { useActiveElement } from "utils/hookCustom";
// import { IWarehouseBook } from "assets/mock/WarehouseBook";

export default function AddWarehouseBookModal(props: any) {
  const { onShow, onHide, data } = props;
  const isViewMode = !!data;

  const [isSubmit, setIsSubmit] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const focusedElement = useActiveElement();

  const listType = [
    { value: "import", label: "Nhập kho" },
    { value: "export", label: "Xuất kho" },
    { value: "transfer", label: "Chuyển kho" },
    { value: "adjust", label: "Điều chỉnh" },
  ];

  const values = useMemo(
    () => ({
      type: data?.type ?? "import",
      productName: data?.productName ?? "",
      quantity: data?.quantity?.toString() ?? "",
      priceUnit: data?.priceUnit?.toString() ?? "",
      warehouseName: data?.warehouseName ?? "",
      warehouseFrom: data?.warehouseFrom ?? "",
      warehouseTo: data?.warehouseTo ?? "",
      note: data?.note ?? "",
    }),
    [data, onShow]
  );

  const validations: IValidation[] = [
    { name: "type", rules: "required" },
    { name: "productName", rules: "required" },
    { name: "quantity", rules: "required" },
    { name: "warehouseName", rules: "required" },
  ];

  const listField: IFieldCustomize[] = [
    { label: "Loại phiếu", name: "type", type: "select", fill: true, required: true, options: listType, className: "input-type" },
    { label: "Sản phẩm", name: "productName", type: "text", fill: true, required: true, className: "input-product" },
    { label: "Số lượng", name: "quantity", type: "number", fill: true, required: true, className: "input-quantity" },
    { label: "Đơn giá", name: "priceUnit", type: "number", fill: true, className: "input-price" },
    { label: "Kho", name: "warehouseName", type: "text", fill: true, required: true, className: "input-warehouse" },
    { label: "Kho nguồn", name: "warehouseFrom", type: "text", fill: true, className: "input-from" },
    { label: "Kho đích", name: "warehouseTo", type: "text", fill: true, className: "input-to" },
    { label: "Ghi chú", name: "note", type: "text", fill: true, className: "input-note" },
  ];

  const [formData, setFormData] = useState<IFormData>({ values });

  useEffect(() => {
    setFormData({ values, errors: {} });
    setIsSubmit(false);
    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }
    setIsSubmit(true);
    // TODO: gọi API thực tế
    setTimeout(() => {
      showToast("Thêm phiếu kho thành công", "success");
      onHide(true);
      setIsSubmit(false);
    }, 500);
  };

  const isReturnType = formData.values?.type === "return_from_supplier" || formData.values?.type === "return_to_customer";

  const listReturnField: IFieldCustomize[] = [
    {
      label: "Tên đối tác",
      name: "partnerName",
      type: "text",
      fill: true,
      required: true,
      className: "input-partner",
    },
    {
      label: "Mã phiếu gốc",
      name: "refCode",
      type: "text",
      fill: true,
      className: "input-ref",
    },
    {
      label: "Lý do hoàn trả",
      name: "returnReason",
      type: "text",
      fill: true,
      required: true,
      className: "input-reason",
    },
  ];

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: isViewMode ? "Đóng" : "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          ...(!isViewMode
            ? [
                {
                  title: "Tạo phiếu",
                  type: "submit" as const,
                  color: "primary" as const,
                  disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
                  is_loading: isSubmit,
                },
              ]
            : []),
        ],
      },
    }),
    [formData, values, isSubmit, isViewMode]
  );

  const showDialogConfirmCancel = () => {
    setContentDialog({
      color: "warning",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác thêm mới</Fragment>,
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
    });
    setShowDialog(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
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
        isFade
        isOpen={onShow}
        isCentered
        staticBackdrop
        size="lg"
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-warehouse-book"
      >
        <form className="form-warehouse-book" onSubmit={onSubmit}>
          <ModalHeader title={isViewMode ? `Chi tiết phiếu ${data?.code}` : "Thêm phiếu kho"} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            {isViewMode ? (
              <div className="warehouse__detail">
                {[
                  { label: "Mã phiếu", value: data.code, highlight: true },
                  { label: "Loại phiếu", value: listType.find((t) => t.value === data.type)?.label },
                  { label: "Sản phẩm", value: `${data.productName} (${data.productCode})` },
                  ...(data.partnerName
                    ? [
                        { label: "Đối tác", value: data.partnerName },
                        { label: "Loại đối tác", value: data.partnerType === "supplier" ? "Nhà cung cấp" : "Khách hàng" },
                      ]
                    : []),
                  ...(data.refCode ? [{ label: "Phiếu gốc", value: data.refCode }] : []),
                  ...(data.returnReason ? [{ label: "Lý do hoàn", value: data.returnReason }] : []),
                  { label: "Số lượng", value: `${data.quantity} ${data.unitName}` },
                  { label: "Đơn giá", value: `${formatCurrency(data.priceUnit)}đ` },
                  { label: "Thành tiền", value: `${formatCurrency(data.totalAmount)}đ`, highlight: true },
                  { label: "Kho", value: data.type === "transfer" ? `${data.warehouseFrom} → ${data.warehouseTo}` : data.warehouseName },
                  { label: "Tồn trước", value: data.stockBefore },
                  { label: "Tồn sau", value: data.stockAfter },
                  { label: "Người thực hiện", value: data.createdBy },
                  { label: "Ngày thực hiện", value: data.createdAt },
                  ...(data.note ? [{ label: "Ghi chú", value: data.note }] : []),
                ].map((row, i) => (
                  <div key={i} className="warehouse__detail-row">
                    <span className="label">{row.label}</span>
                    <span className={`value${row.highlight ? " highlight" : ""}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="list-form-group">
                {listField.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                    formData={formData}
                  />
                ))}

                {/* Chỉ hiện khi là phiếu hoàn trả */}
                {isReturnType &&
                  listReturnField.map((field, index) => (
                    <FieldCustomize
                      key={`return-${index}`}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listReturnField, setFormData)}
                      formData={formData}
                    />
                  ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
