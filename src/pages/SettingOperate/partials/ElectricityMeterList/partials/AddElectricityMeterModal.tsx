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
import "./AddElectricityMeterModal.scss";
import ElectricityRateService from "services/ElectricityRateService";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import ElectricityMeterService from "services/ElectricityMeterService";

export default function AddElectricityMeterModal(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        code: data?.code ?? "",
        priceType: data?.priceType ?? "",
        electricityType: data?.electricityType ?? "",
        meterType: data?.meterType ?? "",
        lossRate: data?.lossRate ?? "",
        tiRate: data?.tiRate ?? "",
        buildingId: data?.buildingId ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "code",
      rules: "required",
    },
    {
      name: "priceType",
      rules: "required",
    },
    {
      name: "electricityType",
      rules: "required",
    },
    {
      name: "meterType",
      rules: "required",
    },
    {
      name: "buildingId",
      rules: "required",
    },
  ];

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Mã công tơ",
          placeholder: "Nhập mã công tơ",
          name: "code",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Loại công tơ",
          placeholder: "Chọn loại công tơ",
          name: "meterType",
          type: "select",
          fill: true,
          required: true,
          options: [
            { value: "1", label: "Công tơ điện 1 pha" },
            { value: "2", label: "Công tơ điện 3 pha" },
          ] as IOption[],
        },
        {
          label: "Loại điện",
          placeholder: "Chọn loại điện",
          name: "electricityType",
          type: "select",
          fill: true,
          required: true,
          options: [
            { value: "1", label: "Điện sinh hoạt" },
            { value: "2", label: "Điện kinh doanh" },
          ] as IOption[],
        },
        {
          label: "Loại giá điện",
          placeholder: "Chọn loại giá điện",
          name: "priceType",
          type: "select",
          fill: true,
          required: true,
          options: [
            { value: "1", label: "Điện 1 giá" },
            { value: "2", label: "Giá theo giờ cao điểm" },
            { value: "3", label: "Giá điện bậc thang" },
          ] as IOption[],
        },
        {
          label: "Chỉ số TI",
          placeholder: "Nhập chỉ số TI",
          name: "tiRate",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Tỉ lệ hao tổn (%)",
          placeholder: "Nhập tỉ lệ hao tổn",
          name: "lossRate",
          type: "number",
          fill: true,
          required: true,
        },
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

    console.log("body", body);
    return;

    const response = await ElectricityMeterService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} công tơ điện thành công`, "success");
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
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} công tơ điện`} toggle={() => !isSubmit && onHide(false)} />
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
                {/* <div className="form-group">
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
                </div> */}
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
