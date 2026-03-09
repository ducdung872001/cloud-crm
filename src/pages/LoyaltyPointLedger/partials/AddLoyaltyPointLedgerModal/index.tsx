import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./index.scss";
import { AddLoyaltyPointLedgerModalProps } from "@/model/loyalty/PropsModal";
import { ILoyaltyPointLedgerRequest } from "@/model/loyalty/RoyaltyRequest";
import LoyaltyService from "@/services/LoyaltyService";
import { SelectOptionData } from "utils/selectCommon";
import EmployeeService from "@/services/EmployeeService";

export default function AddLoyaltyPointLedgerModal(props: AddLoyaltyPointLedgerModalProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  // Khách hàng
  const [listCustomer, setListCustomer] = useState<IOption[]>([]);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  // Ví điểm (phụ thuộc customerId)
  const [listWallet, setListWallet] = useState<IOption[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(false);

  // Chương trình loyalty
  const [listLoyaltyProgram, setListLoyaltyProgram] = useState<IOption[]>([]);
  const [isLoadingLoyaltyProgram, setIsLoadingLoyaltyProgram] = useState<boolean>(false);

  // Đổi thưởng
  const [listLoyaltyReward, setListLoyaltyReward] = useState<IOption[]>([]);
  const [isLoadingLoyaltyReward, setIsLoadingLoyaltyReward] = useState<boolean>(false);

  // Nhân viên
  const [listEmployee, setListEmployee] = useState<IOption[]>([]);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);

  const values = useMemo(
    () =>
    ({
      walletId: data?.walletId ?? null,
      customerId: data?.customerId ?? null,
      customerName: data?.customerName ?? "",
      point: data?.point ?? 0,
      description: data?.description ?? "",
      employeeId: data?.employeeId ?? null,
      loyaltyProgramId: data?.loyaltyProgramId ?? null,
      loyaltyRewardId: data?.loyaltyRewardId ?? null,
    } as ILoyaltyPointLedgerRequest),
    [data]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  // Load nhân viên mặc định khi mở modal thêm mới
  const initDefaultEmployee = async () => {
    const response = await EmployeeService.info();
    if (response.code === 0) {
      const emp = response.result;
      onOpenEmployee({ value: emp.id, label: emp.name });
      setFormData((prev) => ({ ...prev, values: { ...prev.values, employeeId: emp.id } }));
    }
  };

  useEffect(() => {
    if (onShow && !data) {
      initDefaultEmployee();
    }
    if (onShow && data) {
      if (data.customerId) {
        onOpenCustomer({ value: data.customerId, label: data.customerName || "" });
        onOpenWallet(data.customerId);
      }
      if (data.loyaltyProgramId) {
        onOpenLoyaltyProgram({ value: data.loyaltyProgramId, label: data.loyaltyProgramName || "" });
      }
      if (data.loyaltyRewardId) {
        onOpenLoyaltyReward({ value: data.loyaltyRewardId, label: data.loyaltyRewardName || "" });
      }
      if (data.employeeId) {
        onOpenEmployee({ value: data.employeeId, label: data.employeeName || "" });
      }
    }
  }, [onShow, data]);

  // Load khách hàng
  const onOpenCustomer = async (defaultOption?: IOption) => {
    if (listCustomer.length > 0) return;
    setIsLoadingCustomer(true);
    const options = await SelectOptionData("customerId");
    if (options) {
      const newOptions = defaultOption
        ? [defaultOption, ...options.filter(o => o.value !== defaultOption.value)]
        : options;

      setListCustomer(newOptions);
    }
    setIsLoadingCustomer(false);
  };

  // Load ví điểm theo customerId
  const onOpenWallet = async (selectedCustomerId?: number) => {
    const cid = selectedCustomerId ?? formData?.values?.customerId;
    if (!cid) return;

    setIsLoadingWallet(true);
    setListWallet([]);

    try {
      const options = await SelectOptionData("walletId", { customerId: cid });

      if (options) {
        const uniqueOptions = options.filter(
          (item, index, self) =>
            index === self.findIndex(o => o.value === item.value)
        );

        setListWallet(uniqueOptions);
      }
    } finally {
      setIsLoadingWallet(false);
    }
  };

  // Load chương trình loyalty
  const onOpenLoyaltyProgram = async (defaultOption?: IOption) => {
    if (listLoyaltyProgram.length > 0) return;
    setIsLoadingLoyaltyProgram(true);
    const options = await SelectOptionData("loyaltyProgramId");
    if (options) {
      const newOptions = defaultOption
        ? [defaultOption, ...options.filter(o => o.value !== defaultOption.value)]
        : options;
      setListLoyaltyProgram(newOptions);
    }
    setIsLoadingLoyaltyProgram(false);
  };

  // Load danh sách đổi thưởng
  const onOpenLoyaltyReward = async (defaultOption?: IOption) => {
    if (listLoyaltyReward.length > 0) return;
    setIsLoadingLoyaltyReward(true);
    const options = await SelectOptionData("loyaltyRewardId");
    if (options) {
      const newOptions = defaultOption
        ? [defaultOption, ...options.filter(o => o.value !== defaultOption.value)]
        : options;
      setListLoyaltyReward(newOptions);
    }
    setIsLoadingLoyaltyReward(false);
  };

  // Load nhân viên
  const onOpenEmployee = async (defaultOption?: IOption) => {
    if (listEmployee.length > 0) return;
    setIsLoadingEmployee(true);
    const options = await SelectOptionData("employeeId");
    if (options) {
      const newOptions = defaultOption
        ? [defaultOption, ...options.filter(o => o.value !== defaultOption.value)]
        : options;
      setListEmployee(newOptions);
    }
    setIsLoadingEmployee(false);
  };

  const validations: IValidation[] = [
    { name: "customerId", rules: "required" },
    { name: "point", rules: "required" },
    { name: "employeeId", rules: "required" },
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Khách hàng",
          name: "customerId",
          type: "select",
          fill: true,
          required: true,
          options: listCustomer,
          onMenuOpen: onOpenCustomer,
          isLoading: isLoadingCustomer,
          onChange: (selectedOption) => {
            // Reset ví khi đổi khách hàng
            setListWallet([]);
            setFormData((prev) => ({
              ...prev,
              values: { ...prev.values, walletId: null },
            }));
            if (selectedOption?.value) {
              onOpenWallet(selectedOption.value);
            }
          },
        },
        {
          label: "Ví điểm",
          name: "walletId",
          type: "select",
          fill: true,
          options: listWallet,
          onMenuOpen: onOpenWallet,
          isLoading: isLoadingWallet,
          disabled: !formData?.values?.customerId,
        },
        {
          label: "Chương trình loyalty",
          name: "loyaltyProgramId",
          type: "select",
          fill: true,
          options: listLoyaltyProgram,
          onMenuOpen: onOpenLoyaltyProgram,
          isLoading: isLoadingLoyaltyProgram,
        },
        {
          label: "Giao dịch đổi thưởng",
          name: "loyaltyRewardId",
          type: "select",
          fill: true,
          options: listLoyaltyReward,
          onMenuOpen: onOpenLoyaltyReward,
          isLoading: isLoadingLoyaltyReward,
        },
        {
          label: "Người phụ trách",
          name: "employeeId",
          type: "select",
          fill: true,
          required: true,
          options: listEmployee,
          onMenuOpen: onOpenEmployee,
          isLoading: isLoadingEmployee,
        },
        {
          label: "Số điểm",
          name: "point",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Mô tả",
          name: "description",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [
      listCustomer, isLoadingCustomer,
      listWallet, isLoadingWallet,
      listLoyaltyProgram, isLoadingLoyaltyProgram,
      listLoyaltyReward, isLoadingLoyaltyReward,
      listEmployee, isLoadingEmployee,
      formData,
    ]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);
    return () => { setIsSubmit(false); };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }
    setIsSubmit(true);
    const body: ILoyaltyPointLedgerRequest = {
      ...(formData.values as ILoyaltyPointLedgerRequest),
      ...(data ? { id: data.id } : {}),
    };
    const response = await LoyaltyService.updateLoyaltyPointLedger(body);
    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} nhật ký điểm thưởng thành công`, "success");
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
    const content: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận",
      defaultAction: () => { onHide(false); setShowDialog(false); setContentDialog(null); },
    };
    setContentDialog(content);
    setShowDialog(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) focusedElement.blur();
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);
    return () => { window.removeEventListener("keydown", checkKeyDown); };
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal isFade isOpen={onShow} isCentered staticBackdrop toggle={() => !isSubmit && onHide(false)} className="modal-add-payment-method">
        <form className="form-payment-method" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} nhật ký điểm thưởng`} toggle={() => !isSubmit && onHide(false)} />
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
