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
import "./AddCategoryProductModal.scss";

const isSuccessResponse = (response: any) => response?.code === 0 || response?.status === 1;

const getCategoryIdFromResponse = (response: any, fallbackId?: number) => {
  if (fallbackId) {
    return fallbackId;
  }

  const result = response?.result ?? response?.data;

  if (typeof result === "number") {
    return result;
  }

  return result?.id ?? result?.categoryId ?? response?.id ?? response?.categoryId ?? null;
};

export default function AddCategoryProductModal(props: IAddCategoryServiceModelProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        name: data?.groupName ?? data?.name ?? "",
        position: data?.position?.toString() ?? "0",
        avatar: data?.avatar ?? "",
        parentId: 0,
        active: 1,
        featured: 0,
        type: 2,
      } as ICategoryServiceRequestModel),
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
      label: "Tên danh mục",
      name: "name",
      type: "text",
      fill: true,
      required: true,
      placeholder: "Nhập tên mẫu báo giá",
      maxLength: 300,
    },
    {
      label: "Thứ tự hiển thị",
      name: "position",
      type: "number",
      fill: true,
      required: false,
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ values: values, errors: {} });
    setIsSubmit(false);
    setSelectedAvatarFile(null);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const syncCategoryAvatar = async (categoryId: number) => {
    if (selectedAvatarFile) {
      return CategoryServiceService.mediaUpload(categoryId, selectedAvatarFile);
    }

    if (data?.avatar && !formData?.values?.avatar) {
      return CategoryServiceService.mediaDelete(categoryId);
    }

    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listField]);
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

    if (!isSuccessResponse(response)) {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
      return;
    }

    const categoryId = getCategoryIdFromResponse(response, data?.id);

    try {
      if (selectedAvatarFile && !categoryId) {
        showToast("Lưu danh mục thành công nhưng không lấy được ID để cập nhật ảnh", "warning");
        onHide(true);
        return;
      }

      if (categoryId) {
        const mediaResponse = await syncCategoryAvatar(categoryId);
        if (mediaResponse && !isSuccessResponse(mediaResponse)) {
          showToast(mediaResponse.message ?? "Lưu danh mục thành công nhưng cập nhật ảnh thất bại", "warning");
          onHide(true);
          return;
        }
      }

      showToast(`${data ? "Cập nhật" : "Thêm mới"} danh mục sản phẩm thành công`, "success");
      onHide(true);
    } catch (error) {
      showToast("Lưu danh mục thành công nhưng cập nhật ảnh thất bại", "warning");
      onHide(true);
    }
  };

  const hasChanged = isDifferenceObj(formData.values, values) || Boolean(selectedAvatarFile);

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
            disabled: isSubmit || !hasChanged || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, hasChanged]
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
        className="modal-add-category-product"
      >
        <form className="form-category-product" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} danh mục sản phẩm`} toggle={() => !isSubmit && onHide(false)} />
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
            <FileUpload type="avatar" label="Ảnh danh mục sản phẩm" formData={formData} setFormData={setFormData} />
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />{" "}
    </Fragment>
  );
}
