import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IAddCategoryServiceModelProps } from "model/categoryService/PropsModel";
import { ICategoryServiceRequestModel } from "model/categoryService/CategoryServiceRequestModel";
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
import CategoryServiceService from "services/CategoryServiceService";
import "./index.scss";

export default function AddPointModal(props: IAddCategoryServiceModelProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  7;

  const values = useMemo(
    () => {
      const d = data as any;
      return {
        title: d?.title ?? "",
        type: d?.type ?? "Voucher",
        cost: d?.cost ?? 0,
        limit: d?.limit ?? 0,
        status: d?.status ?? "active",
        id: d?.id,
      } as any;
    },
    [data, onShow]
  );

  const validations: IValidation[] = [
    { name: "title", rules: "required" },
    { name: "type", rules: "required" },
    { name: "cost", rules: "required" },
    { name: "limit", rules: "required" },
    { name: "status", rules: "required" },
  ];

  const listField: IFieldCustomize[] = [
    {
      label: "Tên phần thưởng",
      name: "title",
      type: "text",
      fill: true,
      required: true,
      placeholder: "VD: Voucher 50.000đ, Quà tặng bí ẩn...",
    },
    {
      label: "Loại phần thưởng",
      name: "type",
      type: "select",
      fill: true,
      options: [
        { label: "Voucher", value: "Voucher" },
        { label: "Dịch vụ", value: "Dịch vụ" },
        { label: "Quà tặng", value: "Quà tặng" },
        { label: "Hạng thành viên", value: "Hạng thành viên" },
      ],
      required: true,
    },
    {
      label: "Điểm quy đổi",
      name: "cost",
      type: "number",
      fill: true,
      required: true,
      placeholder: "VD: 500",
    },
    {
      label: "Số lượng tối đa",
      name: "limit",
      type: "number",
      fill: true,
      required: true,
      placeholder: "VD: 100",
    },
    {
      label: "Trạng thái hiển thị",
      name: "status",
      type: "select",
      fill: true,
      options: [
        { label: "Đang chạy", value: "active" },
        { label: "Chờ duyệt", value: "pending" },
        { label: "Hết hạn", value: "expired" },
      ],
      required: true,
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);
    const body: ICategoryServiceRequestModel = {
      ...(formData.values as ICategoryServiceRequestModel),
      ...(data ? { id: data.id } : {}),
    };

    const response = await CategoryServiceService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} phần thưởng đổi điểm thành công`, "success");
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
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
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
        className="modal-add-payment-method"
      >
        <form className="form-payment-method" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} phần thưởng đổi điểm`} toggle={() => !isSubmit && onHide(false)} />
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
      <Dialog content={contentDialog} isOpen={showDialog} />{" "}
    </Fragment>
  );
}
