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
import CustomerService from "@/services/CustomerService";
import SelectCustom from "@/components/selectCustom/selectCustom";
import ImageThirdGender from "assets/images/third-gender.png";

export default function AddLoyaltyPointLedgerModal(props: AddLoyaltyPointLedgerModalProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  // Khách hàng
  const [listCustomer, setListCustomer] = useState<IOption[]>([]);
  const [customerData, setCustomerData] = useState<any>(null);

  // Ví điểm
  const [walletData, setWalletData] = useState<any>(null);

  // Chương trình loyalty
  const [loyaltyProgramData, setLoyaltyProgramData] = useState<any>(null);

  // Đổi thưởng
  const [loyaltyRewardData, setLoyaltyRewardData] = useState<any>(null);

  // Nhân viên
  const [employeeData, setEmployeeData] = useState<any>(null);

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
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  // Load nhân viên mặc định khi mở modal thêm mới
  const initDefaultEmployee = async () => {
    const response = await EmployeeService.info();
    if (response.code === 0) {
      const emp = response.result;
      setEmployeeData({ value: emp.id, label: emp.name });
      setFormData((prev) => ({ ...prev, values: { ...prev.values, employeeId: emp.id } }));
    }
  };

  useEffect(() => {
    if (onShow && !data) {
      // Reset tất cả state select khi mở modal thêm mới
      setCustomerData(null);
      setWalletData(null);
      setLoyaltyProgramData(null);
      setLoyaltyRewardData(null);
      setCountCheckAddCustomer((prev) => prev + 1);
      setCountCheckAddWallet((prev) => prev + 1);
      setCountCheckAddLoyaltyProgram((prev) => prev + 1);
      setCountCheckAddLoyaltyReward((prev) => prev + 1);
      setCountCheckAddEmployee((prev) => prev + 1);
      initDefaultEmployee();
    }
    if (onShow && data) {
      if (data.customerId) {
        setCustomerData({ value: data.customerId, label: data.customerName || "" });
        onOpenWallet(data.customerId);
      }
      if (data.walletId) {
        setWalletData({ value: data.walletId, label: `Ví ${data.walletId}` });
      }
      if (data.loyaltyProgramId) {
        setLoyaltyProgramData({ value: data.loyaltyProgramId, label: data.loyaltyProgramName || "" });
      }
      if (data.loyaltyRewardId) {
        setLoyaltyRewardData({ value: data.loyaltyRewardId, label: data.loyaltyRewardName || "" });
      }
      if (data.employeeId) {
        setEmployeeData({ value: data.employeeId, label: data.employeeName || "" });
      }
    }
  }, [onShow, data]);

  // Load khách hàng
  const [countCheckAddCustomer, setCountCheckAddCustomer] = useState(0);

  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param = { keyword: search, page: page, limit: 10 };
    const response = await CustomerService.filter(param);
    if (response.code === 0) {
      const dataOption = response.result.items;
      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
              return {
                value: item.id,
                label: item.name,
                avatar: item.avatar,
              };
            })
            : []),
        ],
        hasMore: response.result?.loadMoreAble ?? false,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false };
  };

  const formatOptionLabelCustomer = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueCustomer = (e) => {
    setCustomerData(e);
    setWalletData(null);
    setFormData((prev) => ({
      ...prev,
      values: { ...prev.values, walletId: null, customerId: e?.value },
    }));
    if (e?.value) {
      setCountCheckAddWallet((prev) => prev + 1);
    }
  };

  const [countCheckAddWallet, setCountCheckAddWallet] = useState(0);
  const loadedOptionWallet = async (search, loadedOptions, { page }) => {
    const cid = formData?.values?.customerId;
    if (!cid) return { options: [], hasMore: false };
    const param = { keyword: search, page: page, limit: 10, customerId: cid };
    const response = await LoyaltyService.listLoyaltyWallet(param);
    if (response.code === 0) {
      const dataOption = response.result.items || [];
      return {
        options: dataOption.map((item) => ({
          value: item.id,
          label: item.name || `Ví ${item.id}`,
        })),
        hasMore: response.result?.loadMoreAble ?? false,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false };
  };
  const handleChangeValueWallet = (e) => {
    setWalletData(e);
    setFormData({ ...formData, values: { ...formData.values, walletId: e?.value } });
  };
  const onOpenWallet = (cid?: number) => {
    setCountCheckAddWallet((prev) => prev + 1);
  };

  const [countCheckAddLoyaltyProgram, setCountCheckAddLoyaltyProgram] = useState(0);
  const loadedOptionLoyaltyProgram = async (search, loadedOptions, { page }) => {
    const param: any = { keyword: search, page: page, limit: 10 };
    const response = await LoyaltyService.list(param);
    if (response.code === 0) {
      const dataOption = response.result.items || [];
      return {
        options: dataOption.map((item) => ({
          value: item.id,
          label: item.name || item.title || `Chương trình ${item.id}`,
        })),
        hasMore: response.result?.loadMoreAble ?? false,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false };
  };
  const handleChangeValueLoyaltyProgram = (e) => {
    setLoyaltyProgramData(e);
    setFormData({ ...formData, values: { ...formData.values, loyaltyProgramId: e?.value } });
  };

  const [countCheckAddLoyaltyReward, setCountCheckAddLoyaltyReward] = useState(0);
  const loadedOptionLoyaltyReward = async (search, loadedOptions, { page }) => {
    const param: any = { keyword: search, page: page, limit: 10 };
    const response = await LoyaltyService.listLoyaltyReward(param);
    if (response.code === 0) {
      const dataOption = response.result.items || [];
      return {
        options: dataOption.map((item) => ({
          value: item.id,
          label: item.name || item.title || `Giao dịch ${item.id}`,
        })),
        hasMore: response.result?.loadMoreAble ?? false,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false };
  };
  const handleChangeValueLoyaltyReward = (e) => {
    setLoyaltyRewardData(e);
    setFormData({ ...formData, values: { ...formData.values, loyaltyRewardId: e?.value } });
  };

  const [countCheckAddEmployee, setCountCheckAddEmployee] = useState(0);
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param = { name: search, page: page, limit: 10 };
    const response = await EmployeeService.list(param);
    if (response.code === 0) {
      const dataOption = response.result.items || [];
      return {
        options: dataOption.map((item) => ({
          value: item.id,
          label: item.name,
          departmentName: item.departmentName,
        })),
        hasMore: response.result?.loadMoreAble ?? false,
        additional: { page: page + 1 },
      };
    }
    return { options: [], hasMore: false };
  };
  const handleChangeValueEmployee = (e) => {
    setEmployeeData(e);
    setFormData({ ...formData, values: { ...formData.values, employeeId: e?.value } });
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
          name: "customerId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheckAddCustomer}
              id="customerId"
              name="customerId"
              label="Khách hàng"
              fill={true}
              required={true}
              options={[]}
              value={customerData}
              onChange={(e) => handleChangeValueCustomer(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              loadOptionsPaginate={loadedOptionCustomer}
              placeholder="Chọn khách hàng"
              additional={{ page: 1 }}
              formatOptionLabel={formatOptionLabelCustomer}
            />
          ),
        },
        {
          name: "walletId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheckAddWallet}
              id="walletId"
              name="walletId"
              label="Ví điểm"
              fill={true}
              options={[]}
              value={walletData}
              onChange={(e) => handleChangeValueWallet(e)}
              isAsyncPaginate={true}
              loadOptionsPaginate={loadedOptionWallet}
              placeholder="Chọn ví điểm"
              additional={{ page: 1 }}
              disabled={!formData?.values?.customerId}
            />
          ),
        },
        {
          name: "loyaltyProgramId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheckAddLoyaltyProgram}
              id="loyaltyProgramId"
              name="loyaltyProgramId"
              label="Chương trình khách hàng thân thiết"
              fill={true}
              options={[]}
              value={loyaltyProgramData}
              onChange={(e) => handleChangeValueLoyaltyProgram(e)}
              isAsyncPaginate={true}
              loadOptionsPaginate={loadedOptionLoyaltyProgram}
              placeholder="Chọn chương trình"
              additional={{ page: 1 }}
            />
          ),
        },
        {
          name: "loyaltyRewardId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheckAddLoyaltyReward}
              id="loyaltyRewardId"
              name="loyaltyRewardId"
              label="Giao dịch đổi thưởng"
              fill={true}
              options={[]}
              value={loyaltyRewardData}
              onChange={(e) => handleChangeValueLoyaltyReward(e)}
              isAsyncPaginate={true}
              loadOptionsPaginate={loadedOptionLoyaltyReward}
              placeholder="Chọn giao dịch đổi thưởng"
              additional={{ page: 1 }}
            />
          ),
        },
        {
          name: "employeeId",
          type: "custom",
          snippet: (
            <SelectCustom
              key={countCheckAddEmployee}
              id="employeeId"
              name="employeeId"
              label="Nhân viên"
              fill={true}
              required={true}
              options={[]}
              value={employeeData}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              loadOptionsPaginate={loadedOptionEmployee}
              placeholder="Chọn nhân viên"
              additional={{ page: 1 }}
            />
          ),
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
      listCustomer,
      walletData, countCheckAddWallet,
      loyaltyProgramData, countCheckAddLoyaltyProgram,
      loyaltyRewardData, countCheckAddLoyaltyReward,
      employeeData, countCheckAddEmployee,
      formData, customerData, countCheckAddCustomer
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
      showToast(`${data ? "Cập nhật" : "Thêm mới"} nhật ký điểm hội viên thành công`, "success");
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
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} nhật ký điểm hội viên`} toggle={() => !isSubmit && onHide(false)} />
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
