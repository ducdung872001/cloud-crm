import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FileUpload from "components/fileUpload/fileUpload";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./AddMaterialModal.scss";
import MaterialService from "@/services/MaterialService";
import { AddMaterialProps } from "@/model/material/PropsModel";
import { IMaterialRequest } from "@/model/material/MaterialRequestModel";

export default function AddMaterialModal(props: AddMaterialProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit]         = useState<boolean>(false);
  const [showDialog, setShowDialog]     = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const focusedElement = useActiveElement();
  const source = data ?? null;

  const values = useMemo(
    () =>
      ({
        name:        source?.name        ?? "",
        code:        source?.code        ?? "",
        categoryId:  source?.categoryId  ?? null,
        unitId:      source?.unitId      ?? null,
        unitName:    source?.unitName    ?? "",
        supplierId:  source?.supplierId  ?? null,
        supplierName: source?.supplierName ?? source?.supplier ?? "",
        price:       source?.price       ?? "",
        minQuantity: source?.minQuantity ?? "",
        maxQuantity: source?.maxQuantity ?? "",
        note:        source?.note        ?? "",
        avatar:      source?.avatar      ?? "",
        status:      source?.status      ?? 1,
      } as IMaterialRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    { name: "name", rules: "required" },
  ];

  const listField: IFieldCustomize[] = [
    {
      label: "Mã nguyên vật liệu",
      name: "code",
      type: "text",
      fill: true,
      required: false,
      placeholder: "VD: NVL001",
    },
    {
      label: "Tên nguyên vật liệu",
      name: "name",
      type: "text",
      fill: true,
      required: true,
      placeholder: "Nhập tên nguyên vật liệu",
      maxLength: 300,
    },
    {
      label: "Danh mục",
      name: "categoryId",
      type: "select",
      fill: true,
      required: false,
      placeholder: "Chọn danh mục",
      options: [
        { value: "1", label: "Hoạt chất" },
        { value: "2", label: "Tá dược" },
        { value: "3", label: "Dung môi & Phụ gia" },
        { value: "4", label: "Muối & Điện giải" },
        { value: "5", label: "Bao bì" },
      ],
    },
    {
      label: "Đơn vị tính",
      name: "unitName",
      type: "text",
      fill: true,
      required: false,
      placeholder: "VD: Kg, Lít, Ml...",
    },
    {
      label: "Nhà cung cấp",
      name: "supplierName",
      type: "text",
      fill: true,
      required: false,
      placeholder: "Nhập tên nhà cung cấp",
      maxLength: 200,
    },
    {
      label: "Đơn giá (VNĐ)",
      name: "price",
      type: "number",
      fill: true,
      required: false,
      placeholder: "Nhập đơn giá",
    },
    {
      label: "Tồn tối thiểu (Min)",
      name: "minQuantity",
      type: "number",
      fill: true,
      required: false,
      placeholder: "Ngưỡng cảnh báo sắp hết",
    },
    {
      label: "Tồn tối đa (Max)",
      name: "maxQuantity",
      type: "number",
      fill: true,
      required: false,
      placeholder: "Giới hạn tồn kho tối đa",
    },
    {
      label: "Ghi chú",
      name: "note",
      type: "textarea",
      fill: true,
      required: false,
      placeholder: "Mô tả thêm về nguyên vật liệu...",
      maxLength: 500,
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values });

  useEffect(() => {
    setFormData({ ...formData, values, errors: {} });
    setIsSubmit(false);
    return () => { setIsSubmit(false); };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listField]);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }

    setIsSubmit(true);

    const v = formData.values as IMaterialRequest;

    // Map sang đúng body của API /inventory/material/update
    const body: IMaterialRequest = {
      ...(source?.id ? { id: source.id } : {}),
      name:         v.name,
      code:         v.code        || undefined,
      categoryId:   v.categoryId  ? Number(v.categoryId)  : undefined,
      unitId:       v.unitId      ? Number(v.unitId)      : undefined,
      unitName:     v.unitName    || undefined,
      supplierId:   v.supplierId  ? Number(v.supplierId)  : undefined,
      supplierName: v.supplierName || undefined,
      price:        v.price       ? Number(v.price)       : undefined,
      minQuantity:  v.minQuantity ? Number(v.minQuantity) : undefined,
      maxQuantity:  v.maxQuantity ? Number(v.maxQuantity) : undefined,
      note:         v.note        || undefined,
      avatar:       v.avatar      || undefined,
      status:       1,
    };

    const response = await MaterialService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} nguyên vật liệu thành công`, "success");
      onHide(true);
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
              !isDifferenceObj(formData.values, values)
                ? onHide(false)
                : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const dialog: IContentDialog = {
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
    setContentDialog(dialog);
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
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-category-material"
      >
        <form className="form-category-material" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} nguyên vật liệu`}
            toggle={() => !isSubmit && onHide(false)}
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
            <FileUpload
              type="avatar"
              label="Ảnh nguyên vật liệu"
              formData={formData}
              setFormData={setFormData}
            />
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}