import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import FileUpload from "components/fileUpload/fileUpload";
import { IActionModal, IOption } from "model/OtherModel";
import { AddGiftModalProps } from "model/gift/PropsModel";
import { IGiftRequest } from "model/gift/GiftRequestModel";
import TitleAction from "components/titleAction/titleAction";
import GiftService from "services/GiftService";
import { useActiveElement, useDebounce } from "utils/hookCustom";
import { SelectOptionData } from "utils/selectCommon";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./AddGiftModal.scss";

export default function AddGiftModal(props: AddGiftModalProps) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        cover: data?.cover ?? "",
        name: data?.name ?? "",
        objectId: data?.objectId ?? 0,
        objectType: data?.objectType.toString() ?? "1",
        startDate: data?.startDate ?? "",
        endDate: data?.endDate ?? "",
        content: data?.content ?? "",
      } as IGiftRequest),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "cover",
      rules: "required",
    },
    {
      name: "name",
      rules: "required",
    },
    {
      name: "objectType",
      rules: "required",
    },
    {
      name: "startDate",
      rules: "required",
    },
    {
      name: "endDate",
      rules: "required",
    },
  ];

  const listField: IFieldCustomize[] = [
    {
      label: "Tên quà tặng",
      name: "name",
      type: "text",
      fill: true,
      required: true,
    },
    {
      label: "Loại ưu đãi",
      name: "objectType",
      type: "radio",
      fill: true,
      required: true,
      options: [
        {
          value: "1",
          label: "Voucher",
        },
        {
          value: "2",
          label: "Dịch vụ giảm giá",
        },
        {
          value: "3",
          label: "Sự kiện",
        },
      ],
    },
    {
      label: "Ngày bắt đầu",
      name: "startDate",
      type: "date",
      fill: true,
      required: true,
    },
    {
      label: "Ngày kết thúc",
      name: "endDate",
      type: "date",
      fill: true,
      required: true,
    },
    {
      label: "Nội dung",
      name: "content",
      type: "editor",
      fill: true,
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

    const body: IGiftRequest = {
      ...(formData.values as IGiftRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await GiftService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} ưu đãi thành công`, "success");
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
      <div className="page-content page-add-gift">
        <TitleAction
          title="Danh sách quà tặng"
          isChildrenTitle={true}
          titleChildren={`${data ? "Chỉnh sửa" : "Thêm mới"} quà tặng`}
          callback={() => (!isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel())}
        />
        <div className="card-box">
          <form className="form-gift-group" onSubmit={(e) => onSubmit(e)}>
            <div className="list-form-group">
              <div className="upload-image">
                <FileUpload type="cover" label="Ảnh quà tặng" isRequired={true} formData={formData} setFormData={setFormData} />
              </div>
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
            <ModalFooter actions={actions} />
          </form>
        </div>
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
