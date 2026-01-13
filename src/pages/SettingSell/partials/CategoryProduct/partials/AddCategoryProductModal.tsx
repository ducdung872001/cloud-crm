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
import { placeholder } from "lodash/fp";
import Icon from "components/icon";
import { name } from "jssip";

export default function AddCategoryProductModal(props: IAddCategoryServiceModelProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        position: data?.position?.toString() ?? "0",
        avatar: data?.avatar ?? "",
        parentId: 0,
        active: 1,
        featured: 0,
        type: 2
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

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const listFieldText: IFieldCustomize[] = useMemo(() => {
    return [
      {
      label: "Tên danh mục",
      name: "name",
      type: "text",
      fill: true,
      required: true,
      placeholder: "Nhập tên danh mục",
      icon: <Icon name="Edit" />,
      iconPosition: "left",
      validate: [
        {
          name: "required",
          message: "Không được bỏ trống",
        },
        {
          name: "maxLength",
          message: "Không được nhập quá 300 ký tự",
          value: 300,
        },
      ],

      messageWarning: "Không được nhập quá 300 ký tự",
      isWarning: formData?.values?.name?.length > 300 ? true : false,
    },

    {
      label: "Thứ tự hiển thị",
      name: "position",
      type: "number",
      fill: true,
      required: false,
    },
  ]
  }, [formData]);


  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldText]);
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
      showToast(`${data ? "Cập nhật" : "Thêm mới"} danh mục sản phẩm thành công`, "success");
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
        className="modal-add-category-product"
      >
        <form className="form-category-product" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} danh mục sản phẩm`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listFieldText.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldText, setFormData)}
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
