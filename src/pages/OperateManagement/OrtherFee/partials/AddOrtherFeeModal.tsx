import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IBeautyBranchRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import "./AddOrtherFeeModal.scss";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import OperationProjectService from "services/OperationProjectService";
import ParkingFeeService from "services/ParkingFeeService";
import SelectCustom from "components/selectCustom/selectCustom";
import CustomerService from "services/CustomerService";
import OrtherFeeService from "services/OrtherFeeService";

export default function AddOrtherFeeModal(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        customerId: data?.customerId ?? "",
        feeDescription: data?.feeDescription ?? "",
        amount: data?.amount ?? "",
        billingPeriod: data?.billingPeriod ?? "",
        dueDate: data?.dueDate ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "customerId",
      rules: "required",
    },
    {
      name: "feeDescription",
      rules: "required",
    },
    {
      name: "amount",
      rules: "required",
    },
    {
      name: "billingPeriod",
      rules: "required",
    },
    {
      name: "dueDate",
      rules: "required",
    },
  ];

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Mô tả chi phí",
          name: "feeDescription",
          type: "textarea",
          fill: true,
          required: true,
        },
        {
          label: "Ghi nhận số tiền khách hàng phải trả (VNĐ)",
          placeholder: "Nhập số tiền khách hàng phải trả (VNĐ)",
          name: "amount",
          type: "number",
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    []
  );

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

    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);
    const body: IBeautyBranchRequest = {
      ...(formData.values as IBeautyBranchRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await OrtherFeeService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} chi phí khác thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

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

  // billingPeriod
  // dueDate
  //* ngày bắt đầu
  const [checkFieldStartDate, setCheckFieldStartDate] = useState<boolean>(false);
  const handleChangeValueStartDate = (e) => {
    setCheckFieldStartDate(false);

    setFormData({ ...formData, values: { ...formData?.values, billingPeriod: e } });
  };

  //* ngày kết thúc
  const [checkFieldEndDate, setCheckFieldEndDate] = useState<boolean>(false);
  const handleChangeValueEndDate = (e) => {
    setCheckFieldEndDate(false);

    setFormData({ ...formData, values: { ...formData?.values, dueDate: e } });
  };

  // lấy thông tin ngày bắt đầu chiến dịch, và ngày cuối cùng chiến dịch

  const [startDay, setStartDay] = useState<number>(new Date(formData.values.billingPeriod).getTime());
  const [endDay, setEndDay] = useState<number>(new Date(formData.values.dueDate).getTime());
  useEffect(() => {
    setStartDay(new Date(formData.values.billingPeriod).getTime());
    setEndDay(new Date(formData.values.dueDate).getTime());
  }, [formData.values.billingPeriod, formData.values.dueDate]);

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
            disabled:
              checkFieldStartDate ||
              checkFieldEndDate ||
              startDay > endDay ||
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, startDay, endDay, checkFieldStartDate, checkFieldEndDate]
  );

  // khách hàng
  const [dataCustomer, setDataCustomer] = useState(null);
  useEffect(() => {
    setDataCustomer(data?.customerId ? { value: data?.customerId, label: data?.customerName || null } : null);
  }, [data]);
  const [validateFieldCustomer, setValidateFieldCustomer] = useState(false);

  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

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
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueCustomer = (e) => {
    setValidateFieldCustomer(false);
    setDataCustomer(e);
    setFormData({ ...formData, values: { ...formData?.values, customerId: e.value } });
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-orther_fee"
      >
        <form className="form-orther_fee-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} chi phí khác`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic-info-orther_fee">
                <div className="form-group" id="FieldCustomerId">
                  <SelectCustom
                    id="customerId"
                    name="customerId"
                    label="Khách hàng"
                    fill={true}
                    required={true}
                    error={validateFieldCustomer}
                    message="Khách hàng không được bỏ trống"
                    options={[]}
                    value={dataCustomer}
                    onChange={(e) => handleChangeValueCustomer(e)}
                    isAsyncPaginate={true}
                    placeholder="Khách hàng"
                    additional={{
                      page: 1,
                    }}
                    loadOptionsPaginate={loadedOptionCustomer}
                  />
                </div>
                {listFieldBasic.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                    formData={formData}
                  />
                ))}
                <div className="form-group">
                  <DatePickerCustom
                    label="Kì thanh toán"
                    name="billingPeriod"
                    fill={true}
                    value={formData?.values?.billingPeriod}
                    onChange={(e) => handleChangeValueStartDate(e)}
                    placeholder="Chọn kì thanh toán"
                    required={true}
                    iconPosition="left"
                    icon={<Icon name="Calendar" />}
                    error={checkFieldStartDate || startDay > endDay}
                    message={startDay > endDay ? "Kì thanh toán nhỏ hơn ngày cần thanh toán" : "Vui lòng chọn kì thanh toán"}
                  />
                </div>
                <div className="form-group">
                  <DatePickerCustom
                    label="Ngày cần thanh toán"
                    name="dueDate"
                    fill={true}
                    value={formData?.values?.dueDate}
                    onChange={(e) => handleChangeValueEndDate(e)}
                    placeholder="Chọn ngày cần thanh toán"
                    required={true}
                    iconPosition="left"
                    icon={<Icon name="Calendar" />}
                    error={checkFieldEndDate || endDay < startDay}
                    message={endDay < startDay ? "Kì thanh toán nhỏ hơn ngày cần thanh toán" : "Vui lòng chọn kì thanh toán"}
                  />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
