import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { isDifferenceObj } from 'reborn-util';
import { AddCaringEmployeeProps } from "model/treatment/PropsModel";
import { SelectOptionData } from "utils/selectCommon";
import { ITreamentUpdateCaringEmployeeRequest } from "model/treatment/TreamentRequestModel";
import TreamentService from "services/TreamentService";

export default function AddCaringEmployee(props: AddCaringEmployeeProps) {
  const { onShow, onHide, data, idScheduleNext, idEmployee } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const onSelectOpenEmployee = async () => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employee");
      if (dataOption) {
        setListEmployee([{ value: "", label: "Chọn nhân viên gọi điện" }, ...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };

  const values = useMemo(
    () =>
    ({
      id: idScheduleNext,
      caringEmployeeId: data?.caringEmployeeId,
    } as ITreamentUpdateCaringEmployeeRequest),
    [data, idScheduleNext, idEmployee, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "caringEmployeeId",
      rules: "required",
    },
  ];

  const listField: IFieldCustomize[] = useMemo(
    () => [
      {
        label: "Nhân viên gọi điện",
        name: "caringEmployeeId",
        type: "select",
        fill: true,
        required: true,
        options: listEmployee,
        onMenuOpen: onSelectOpenEmployee,
        isLoading: isLoadingEmployee,
      },
    ],
    [listEmployee, isLoadingEmployee, idEmployee]
  );

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

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

    const body: ITreamentUpdateCaringEmployeeRequest = {
      ...(formData.values as ITreamentUpdateCaringEmployeeRequest),
    };

    const response = await TreamentService.updateCaringEmployee(body);

    if (response.code === 0) {
      showToast("Đổi nhân viên phụ trách thành công", "success");
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
            title: "Tạo mới",
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
      title: <Fragment>Hủy bỏ thao tác thêm kết quả gọi</Fragment>,
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
        isOpen={onShow}
        className="modal-caring-employee"
        isFade={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        isCentered={true}
      >
        <form className="form-caring-employee-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Chọn nhân viên" toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  field={field}
                  key={index}
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
