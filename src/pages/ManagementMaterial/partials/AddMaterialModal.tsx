import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
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
import "./AddMaterialModal.scss";
import ProductService from "@/services/ProductService";
import { AddMaterialProps } from "@/model/material/PropsModel";
import { IMaterialRequest } from "@/model/material/MaterialRequestModel";

export default function AddMaterialModal(props: AddMaterialProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const source = data ?? null;

  const values = useMemo(
    () =>
      ({
        name: source?.name ?? "",
        code: source?.code ?? "",
        productLine: source?.productLine ?? "",
        position: source?.position?.toString() ?? "0",
        status: source?.status?.toString() ?? "1",
        avatar: source?.avatar ?? "",
        categoryId: source?.categoryId ?? null,
        unitId: source?.unitId ?? null,
        price: source?.price ?? 0,
        exchange: 1,
        documents: JSON.parse(source?.documents || "[]") ?? [],
        expiredPeriod: source?.expiredPeriod ?? 0,
        otherUnits: JSON.parse(source?.otherUnits || "[]") ?? [],
        type: source?.status?.toString() ?? "1",
        minQuantity: source?.minQuantity ?? 0,
      } as IMaterialRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "position",
      rules: "required",
    },
  ];

  const listField: IFieldCustomize[] = [
    {
      label: "Mã nguyên vật liệu",
      name: "code",
      type: "text",
      fill: true,
      required: false,
      placeholder: "Nhập mã nguyên vật liệu",
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
      label: "Đơn vị tính",
      name: "unitId",
      type: "select",
      fill: true,
      required: false,
      placeholder: "Chọn đơn vị tính",
      options: [
        { value: "1", label: "Cái" },
        { value: "2", label: "Chiếc" },
        { value: "3", label: "Hộp" },
        { value: "4", label: "Thùng" },
      ],
    },
    {
      label: "Quy chuẩn đóng gói",
      name: "packageStandard",
      type: "text",
      fill: true,
      required: false,
      placeholder: "Chọn quy chuẩn đóng gói",
    },
    {
      label: "Kho lưu trữ",
      name: "warehouseId",
      type: "select",
      fill: true,
      required: false,
      placeholder: "Chọn kho lưu trữ",
      options: [
        { value: "1", label: "Kho Thành Phẩm Miền Bắc" },
        { value: "2", label: "Kho Vật Tư Sản Xuất 01" },
        { value: "3", label: "Kho Hóa Chất An Toàn" },
      ],
    },
    {
      label: "Ngưỡng cảnh báo sắp hết",
      name: "lowQuantity",
      type: "number",
      fill: true,
      required: false,
      placeholder: "Nhập ngưỡng cảnh báo sắp hết",
    },
    {
      label: "Nhà cung cấp",
      name: "supplierId",
      type: "select",
      fill: true,
      required: false,
      placeholder: "Chọn nhà cung cấp",
      options: [
        { value: "1", label: "Công ty TNHH Thép Minh Phát" },
        { value: "2", label: "Công ty TNHH Vật Tư Công Nghiệp Hoàng Long" },
      ],
    },
    {
      label: "Giá nhập",
      name: "price",
      type: "number",
      fill: true,
      required: false,
      placeholder: "Nhập giá nhập",
    },
    {
      label: "Nhóm nguyên vật liệu",
      name: "categoryId",
      type: "select",
      fill: true,
      required: false,
      placeholder: "Chọn nhóm nguyên vật liệu",
      options: [
        { value: "1", label: "Nguyên vật liệu chính" },
        { value: "2", label: "Nguyên vật liệu phụ" },
        { value: "3", label: "Nhiên liệu" },
        { value: "4", label: "Hóa chất" },
      ],
    },
    {
      label: "Mô tả",
      name: "description",
      type: "textarea",
      fill: true,
      required: false,
      placeholder: "Nhập mô tả",
      maxLength: 500,
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

    const errors = Validate(validations, formData, [...listField]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);
    const body: IMaterialRequest = {
      ...(formData.values as IMaterialRequest),
      ...(source ? { id: source.id } : {}),
    };

    const response = await ProductService.update(body);

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
        className="modal-add-category-material"
      >
        <form className="form-category-material" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} nguyên vật liệu`} toggle={() => !isSubmit && onHide(false)} />
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
            <FileUpload type="avatar" label="Ảnh nguyên vật liệu" formData={formData} setFormData={setFormData} />
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />{" "}
    </Fragment>
  );
}
