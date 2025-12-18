import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddSettingProps } from "model/setting/PropsModel";
import { ISettingRequest } from "model/setting/SettingRequestModel";
import SettingService from "services/SettingService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from 'reborn-util';
import Icon from "components/icon";
import moment from "moment";

export default function AddSettingModal(props: AddSettingProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
    ({
      name: data?.name ?? "",
      value: data?.value ?? "",
      code: data?.code ?? "",
      type: data?.type ?? "",
      startDate: data?.startDate ?? "",
      endDate: data?.endDate ?? "",
    } as ISettingRequest),
    [data, onShow]
  );
  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "value",
      rules: "required",
    },
    {
      name: "code",
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
    {
      name: "type",
      rules: "required",
    },
  ];

  const listField: IFieldCustomize[] = [
    {
      label: "Tên cấu hình",
      name: "name",
      type: "text",
      fill: true,
      required: true,
    },
    {
      label: "Mã cấu hình",
      name: "code",
      type: "text",
      fill: true,
      required: true,
    },
    {
      label: "Kiểu giá trị",
      name: "type",
      type: "select",
      fill: true,
      required: true,
      options: [
        {
          value: "string",
          label: "String",
        },
        {
          value: "number",
          label: "Number",
        },
      ]
    },
    {
      label: "Ngày hiệu lực cấu hình",
      name: "startDate",
      type: "date",
      fill: true,
      required: true,
      icon: <Icon name="Calendar" />,
      iconPosition: "left",
      hasSelectTime: false,
      placeholder: "Nhập ngày bắt đầu",
      maxDate: new Date(formData?.values?.endDate),
    },
    {
      label: "Ngày kết thúc hiệu lực",
      name: "endDate",
      type: "date",
      fill: true,
      required: true,
      icon: <Icon name="Calendar" />,
      iconPosition: "left",
      hasSelectTime: false,
      placeholder: "Nhập ngày kết thúc",
      minDate: new Date(formData?.values?.startDate),
    },
    {
      label: "Giá trị cấu hình",
      name: "value",
      type: "text",
      fill: true,
      required: true,
    },
  ];

 

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
    const body: ISettingRequest = {
      ...(formData.values as ISettingRequest),
      ...(data ? { id: data.id } : {}),
      startDate: moment(formData.values.startDate).format('YYYY-MM-DDTHH:mm:ss'),
      endDate: moment(formData.values.endDate).format('YYYY-MM-DDTHH:mm:ss'),
    };

    const response = await SettingService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} biểu mẫu thành công`, "success");
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
            title: "Cập nhật",
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
        className="modal-add-setting"
      >
        <form className="form-setting-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} cấu hình`} toggle={() => !isSubmit && onHide(false)} />
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
