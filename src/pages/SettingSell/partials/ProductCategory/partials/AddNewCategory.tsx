// AddProductCategoryModal.tsx
import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFormData, IValidation, IFieldCustomize } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";

export default function AddProductCategoryModal(props: any) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(() => ({
    name: data?.name ?? "",
    position: data?.position?.toString() ?? "0",
    status: data?.status ?? 1,
  }), [data, onShow]);

  const validations: IValidation[] = [
    { name: "name", rules: "required" },
    { name: "position", rules: "required" },
  ];

  const listStatus = [
    { value: 1, label: "Đang sử dụng" },
    { value: 0, label: "Ngừng sử dụng" },
  ];

  const listField: IFieldCustomize[] = [
    { label: "Tên nhóm sản phẩm", name: "name", type: "text", fill: true, required: true },
    { label: "Thứ tự hiển thị", name: "position", type: "number", fill: true },
    { label: "Trạng thái", name: "status", type: "select", fill: true, options: listStatus },
  ];

  const [formData, setFormData] = useState<IFormData>({ values });

  useEffect(() => {
    setFormData({ values, errors: {} });
    setIsSubmit(false);
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
      showToast(`${data ? "Cập nhật" : "Thêm mới"} nhóm sản phẩm thành công`, "success");
      onHide(true);
      setIsSubmit(false);
    }, 500);
  };

  const actions = useMemo<IActionModal>(() => ({
    actions_right: {
      buttons: [
        {
          title: "Hủy",
          color: "primary",
          variant: "outline",
          disabled: isSubmit,
          callback: () => {
            !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
          },
        },
        {
          title: data ? "Cập nhật" : "Tạo mới",
          type: "submit",
          color: "primary",
          disabled: isSubmit || !isDifferenceObj(formData.values, values),
          is_loading: isSubmit,
        },
      ],
    },
  }), [formData, values, isSubmit]);

  const showDialogConfirmCancel = () => {
    setContentDialog({
      color: "warning",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận",
      defaultAction: () => { onHide(false); setShowDialog(false); setContentDialog(null); },
    });
    setShowDialog(true);
  };

  return (
    <Fragment>
      <Modal isFade isOpen={onShow} isCentered staticBackdrop toggle={() => !isSubmit && onHide(false)}>
        <form onSubmit={onSubmit}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} nhóm sản phẩm`}
            toggle={() => !isSubmit && onHide(false)}
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