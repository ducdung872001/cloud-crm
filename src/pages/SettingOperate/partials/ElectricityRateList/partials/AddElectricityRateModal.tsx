import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IBeautyBranchRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { showToast } from "utils/common";
import { createArrayFromTo, getMaxDay, isDifferenceObj } from "reborn-util";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import "./AddElectricityRateModal.scss";
import ElectricityRateService from "services/ElectricityRateService";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";

export default function AddElectricityRateModal(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        minUsage: data?.minUsage ?? "",
        maxUsage: data?.maxUsage ?? "",
        ratePerKwh: data?.ratePerKwh ?? "",
        effectiveDate: data?.effectiveDate ?? "",
        expiredDate: data?.expiredDate ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "minUsage",
      rules: "required",
    },
    {
      name: "maxUsage",
      rules: "required",
    },
    {
      name: "ratePerKwh",
      rules: "required",
    },
    {
      name: "effectiveDate",
      rules: "required",
    },
    {
      name: "expiredDate",
      rules: "required",
    },
  ];

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Giới hạn dưới của mức tiêu thụ (kWh)",
          placeholder: "Giới hạn dưới (kWh)",
          name: "minUsage",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Giới hạn trên của mức tiêu thụ (kWh)",
          placeholder: "Giới hạn trên (kWh)",
          name: "maxUsage",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Giá mỗi kWh trong khoảng này (VNĐ)",
          placeholder: "Nhập giá mỗi kWh trong khoảng này (VNĐ/kWh)",
          name: "ratePerKwh",
          type: "number",
          fill: true,
          required: true,
          className: "rate_per_kwh",
        },
        // {
        //   label: "Ngày hiệu lực",
        //   name: "effectiveDate",
        //   type: "date",
        //   fill: true,
        //   required: true,
        //   className: "effective-date",
        // },
        // {
        //   label: "Ngày hết hiệu lực",
        //   name: "expiredDate",
        //   type: "date",
        //   fill: true,
        //   required: true,
        //   className: "expired-date",
        // },
      ] as IFieldCustomize[],
    []
  );

  //! đoạn này xử lý lấy ngày
  const [days, setDays] = useState<any[]>(
    createArrayFromTo(1, 28).map((item, idx) => {
      if (item < 10) {
        return {
          value: +`0${item}`,
          label: `0${item}`,
        };
      }

      return {
        value: +item,
        label: item,
      };
    })
  );
  const [formData, setFormData] = useState<IFormData>({ values: values });

  //* Nếu như mà đã chọn tháng hoặc năm rồi thì fill lại lựa chọn ngày theo tháng hoặc năm đó
  useEffect(() => {
    if (+formData?.values?.foundingMonth > 0 || formData.values.foundingYear > 0) {
      const result = createArrayFromTo(1, getMaxDay(+formData?.values?.foundingYear, +formData?.values?.foundingMonth)).map((item, idx) => {
        if (item < 10) {
          return {
            value: +`0${item}`,
            label: `0${item}`,
          };
        }

        return {
          value: +item,
          label: item,
        };
      });

      setDays(result);
    }
  }, [formData.values.foundingMonth, formData?.values?.foundingYear]);

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

    const response = await ElectricityRateService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} thang bậc giá điện thành công`, "success");
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

  //* ngày bắt đầu
  const [checkFieldStartDate, setCheckFieldStartDate] = useState<boolean>(false);
  const handleChangeValueStartDate = (e) => {
    setCheckFieldStartDate(false);

    setFormData({ ...formData, values: { ...formData?.values, effectiveDate: e } });
  };

  //* ngày kết thúc
  const [checkFieldEndDate, setCheckFieldEndDate] = useState<boolean>(false);
  const handleChangeValueEndDate = (e) => {
    setCheckFieldEndDate(false);

    setFormData({ ...formData, values: { ...formData?.values, expiredDate: e } });
  };

  // lấy thông tin ngày bắt đầu chiến dịch, và ngày cuối cùng chiến dịch

  const [startDay, setStartDay] = useState<number>(new Date(formData.values.effectiveDate).getTime());
  const [endDay, setEndDay] = useState<number>(new Date(formData.values.expiredDate).getTime());
  useEffect(() => {
    setStartDay(new Date(formData.values.effectiveDate).getTime());
    setEndDay(new Date(formData.values.expiredDate).getTime());
  }, [formData.values.effectiveDate, formData.values.expiredDate]);

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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-electricity_rate"
      >
        <form className="form-electricity_rate-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} thang bậc giá điện`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic-info-electricity_rate">
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
                    label="Ngày hiệu lực"
                    name="effectiveDate"
                    fill={true}
                    value={formData?.values?.effectiveDate}
                    onChange={(e) => handleChangeValueStartDate(e)}
                    placeholder="Chọn ngày bắt đầu"
                    required={true}
                    iconPosition="left"
                    icon={<Icon name="Calendar" />}
                    error={checkFieldStartDate || startDay > endDay}
                    message={startDay > endDay ? "Ngày bắt đầu nhỏ hơn ngày kết thúc" : "Vui lòng chọn ngày bắt đầu"}
                  />
                </div>
                <div className="form-group">
                  <DatePickerCustom
                    label="Ngày hết hiệu lực"
                    name="expiredDate"
                    fill={true}
                    value={formData?.values?.expiredDate}
                    onChange={(e) => handleChangeValueEndDate(e)}
                    placeholder="Chọn ngày kết thúc"
                    required={true}
                    iconPosition="left"
                    icon={<Icon name="Calendar" />}
                    error={checkFieldEndDate || endDay < startDay}
                    message={endDay < startDay ? "Ngày kết thúc lớn hơn ngày bắt đầu" : "Vui lòng chọn ngày kết thúc"}
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
