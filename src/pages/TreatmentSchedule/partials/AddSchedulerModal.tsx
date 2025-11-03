import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { useActiveElement } from "utils/hookCustom";
import { SelectOptionData } from "utils/selectCommon";
import { IActionModal, IOption } from "model/OtherModel";
import { AddSchedulerModalProps } from "model/customer/PropsModel";
import { ICustomerSchedulerRequest } from "model/customer/CustomerRequestModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import Icon from "components/icon";
import CustomerService from "services/CustomerService";
import "./AddSchedulerModal.scss";

export default function AddSchedulerModal(props: AddSchedulerModalProps) {
  const { onShow, dataCustomer, dataScheduler, onHide } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const focusedElement = useActiveElement();
  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [listCustomer, setListCustomer] = useState<ICustomerResponse[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const onSelectOpenEmployee = async () => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);
      const dataOption = await SelectOptionData("employee");
      if (dataOption) {
        setListEmployee([{ value: "", label: "Chọn nhân viên tư vấn" }, ...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingEmployee(false);
    }
  };

  const onSelectOpenCustomer = async () => {
    if (!listCustomer || listCustomer.length === 0) {
      setIsLoadingCustomer(true);
      const response = await CustomerService.filter();
      if (response.code === 0) {
        setListCustomer(response.result.items);
      }
      setIsLoadingCustomer(false);
    }
  };

  useEffect(() => {
    if (dataScheduler?.customerId) {
      onSelectOpenEmployee();
    }
  }, [dataScheduler]);

  const values = useMemo(
    () =>
      ({
        name: `${dataCustomer?.name ?? dataScheduler?.customerName ?? ""} - ${dataCustomer?.phoneMasked ?? dataScheduler?.customerPhone ?? ""}`,
        address: dataCustomer?.address ?? dataScheduler?.customerAddress ?? "",
        customerId: dataCustomer?.id ?? dataScheduler?.customerId ?? null,
        consultantId: dataScheduler?.consultantId,
        fmtScheduleDate: dataScheduler?.scheduleDate ?? "",
        status: dataScheduler?.status?.toString() ?? "1",
        content: dataScheduler?.content ?? "",
        note: dataScheduler?.note ?? "",
      } as ICustomerSchedulerRequest),
    [dataCustomer, onShow, dataScheduler]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "customerId",
      rules: "required",
    },
    {
      name: "fmtScheduleDate",
      rules: "required",
    },
    {
      name: "consultantId",
      rules: "required",
    },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Khách hàng",
          name: !!dataCustomer || !!dataScheduler ? "name" : "customerId",
          type: !!dataCustomer || !!dataScheduler ? "text" : "select",
          fill: true,
          required: true,
          disabled: !!dataCustomer || !!dataScheduler,
          options: listCustomer?.map((item) => {
            return { value: item.id, label: `${item.name} - ${item.phoneMasked}` };
          }),
          onMenuOpen: onSelectOpenCustomer,
          isLoading: isLoadingCustomer,
        },
        {
          label: "Địa chỉ",
          name: "address",
          type: "text",
          fill: true,
          disabled: !!dataCustomer || !!dataScheduler,
        },
        {
          label: "Thời gian hẹn",
          name: "fmtScheduleDate",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          hasSelectTime: true,
          required: true,
        },
        {
          label: "Nhân viên tư vấn",
          name: "consultantId",
          type: "select",
          fill: true,
          required: true,
          options: listEmployee,
          onMenuOpen: onSelectOpenEmployee,
          isLoading: isLoadingEmployee,
        },
        {
          label: "Nội dung làm (dự kiến)",
          name: "content",
          type: "text",
          fill: true,
        },
        {
          label: "Trạng thái lịch",
          name: "status",
          type: "radio",
          options: [
            {
              value: "1",
              label: "Lịch đã chốt",
            },
            {
              value: "2",
              label: "Lịch dự kiến",
            },
          ],
          fill: true,
          required: true,
        },
        {
          label: "Lưu ý (dành cho KTV thực hiện)",
          name: "note",
          type: "text",
          fill: true,
        },
      ] as IFieldCustomize[],
    [dataCustomer, dataScheduler, listCustomer, isLoadingCustomer, listEmployee, isLoadingEmployee]
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

  useEffect(() => {
    if (formData?.values?.customerId) {
      setFormData({
        ...formData,
        values: { ...formData.values, address: listCustomer?.find((item) => item.id === formData?.values?.customerId)?.address ?? "" },
      });
    }
  }, [formData?.values?.customerId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);
    const body: ICustomerSchedulerRequest = {
      ...(dataScheduler ? { id: dataScheduler?.id } : {}),
      ...(formData.values as ICustomerSchedulerRequest),
    };
    const response = await CustomerService.updateScheduler(body);
    if (response.code === 0) {
      showToast(dataScheduler ? "Cập nhật lịch điều trị thành công" : "Thêm mới lịch điều trị thành công", "success");
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
            title: dataScheduler ? "Cập nhật" : "Tạo mới",
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

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác thêm mới lịch điều trị</Fragment>,
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
        className="modal-customer-add-scheduler"
        isFade={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        isCentered={true}
      >
        <form className="form-customer-scheduler-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${dataScheduler ? "Cập nhật" : "Thêm mới"} lịch điều trị`} toggle={() => !isSubmit && onHide(false)} />
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
