import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ITipUserRequest } from "model/tipUser/TipUserRequestModel";
import { IAddTipUserModalProps } from "model/tipUser/PropsModel";
import TipUserService from "services/TipUserService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { SelectOptionData } from "utils/selectCommon";
import "./AddTipUserModal.scss";

export default function AddTipUserModal(props: IAddTipUserModalProps) {
  const { onShow, onHide, data, tipType } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);

  const onSelectOpenEmployee = async () => {
    setIsLoadingEmployee(true);
    // eslint-disable-next-line prefer-const
    let empParams = {
      tipType,
    };

    const dataOption = await SelectOptionData("employeeTip", empParams); //groupTip
    if (dataOption) {
      setListEmployee([{ value: "", label: "Chọn nhân viên" }, ...(dataOption.length > 0 ? dataOption : [])]);
    }
    setIsLoadingEmployee(false);
  };

  useEffect(() => {
    onSelectOpenEmployee();
  }, [data]);

  const validations: IValidation[] = [
    {
      name: "employeeId",
      rules: "required",
    },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Chọn nhân viên",
          name: "employeeId",
          type: "select",
          fill: true,
          required: true,
          options: listEmployee,
          onMenuOpen: onSelectOpenEmployee,
          isLoading: isLoadingEmployee,
        },
      ] as IFieldCustomize[],
    [listEmployee, isLoadingEmployee, data]
  );

  const values = useMemo(() => ({} as ITipUserRequest), [data, onShow]);

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
    const body: ITipUserRequest = {
      ...(formData.values as ITipUserRequest),
      ...(data ? { id: data.id } : {}),
      tipType,
    };

    const response = await TipUserService.update(body);

    if (response.code === 0) {
      showToast(`Thêm nhân viên thụ hưởng thành công`, "success");
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
            title: data ? "Cập nhật" : "Thêm mới",
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
        className="modal-add-tip-user"
      >
        <form className="form-tip-user" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Thêm nhân viên thụ hưởng`} toggle={() => !isSubmit && onHide(false)} />
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
