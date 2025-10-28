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
import "./AddManagementFeeRateModal.scss";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Icon from "components/icon";
import ManagementFeeRateService from "services/ManagementFeeRateService";
import OperationProjectService from "services/OperationProjectService";

export default function AddManagementFeeRateModal(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        ratePerM2: data?.ratePerM2 ?? "",
        effectiveFrom: data?.effectiveFrom ?? "",
        effectiveTo: data?.effectiveTo ?? "",
        projectId: data?.projectId ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "ratePerM2",
      rules: "required",
    },
    {
      name: "effectiveFrom",
      rules: "required",
    },
    {
      name: "effectiveTo",
      rules: "required",
    },
    // {
    //   name: "createdTime",
    //   rules: "required",
    // },
    {
      name: "projectId",
      rules: "required",
    },
  ];

  const [listProject, setListProject] = useState<IOption[]>([]);
  const fetchDataProject = async () => {
    const response = await OperationProjectService.list();
    if (response.code === 0) {
      const data = response.result.items.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setListProject(data);
    }
  };

  useEffect(() => {
    fetchDataProject();
  }, []);

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Dự án",
          placeholder: "Chọn dự án/tòa nhà",
          name: "projectId",
          type: "select",
          options: listProject,
          // loadOptions: fetchDataProject(),
          fill: true,
          required: true,
        },
        // {
        //   label: "Ngày tạo",
        //   name: "createdTime",
        //   type: "date",
        //   fill: true,
        //   required: false,
        // },
        {
          label: "Phí quản lý dự án (VNĐ/m2/tháng)",
          placeholder: "Nhập phí quản lý dự án (VNĐ/m2/tháng)",
          name: "ratePerM2",
          type: "number",
          fill: true,
          required: true,
          // className: "rate-per-m2",
        },
        // {
        //   label: "Ngày hết hiệu lực",
        //   name: "expiredDate",
        //   type: "date",
        //   fill: true,
        //   required: true,
        //   className: "expired-date",
        // },
      ] as IFieldCustomize[],
    [listProject]
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

    const response = await ManagementFeeRateService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} biểu phí quản lý thành công`, "success");
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

    setFormData({ ...formData, values: { ...formData?.values, effectiveFrom: e } });
  };

  //* ngày kết thúc
  const [checkFieldEndDate, setCheckFieldEndDate] = useState<boolean>(false);
  const handleChangeValueEndDate = (e) => {
    setCheckFieldEndDate(false);

    setFormData({ ...formData, values: { ...formData?.values, effectiveTo: e } });
  };

  // lấy thông tin ngày bắt đầu chiến dịch, và ngày cuối cùng chiến dịch

  const [startDay, setStartDay] = useState<number>(new Date(formData.values.effectiveFrom).getTime());
  const [endDay, setEndDay] = useState<number>(new Date(formData.values.effectiveTo).getTime());
  useEffect(() => {
    setStartDay(new Date(formData.values.effectiveFrom).getTime());
    setEndDay(new Date(formData.values.effectiveTo).getTime());
  }, [formData.values.effectiveFrom, formData.values.effectiveTo]);

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
        className="modal-add-management_fee_rate"
      >
        <form className="form-management_fee_rate-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} biểu phí quản lý`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic-info-management_fee_rate">
                {/* <div className="form-group">
                  <DatePickerCustom
                    label="Ngày tạo"
                    name="createdTime"
                    fill={true}
                    value={formData?.values?.createdTime}
                    onChange={(e) => handleChangeValueCreateTime(e)}
                    placeholder="Chọn ngày tạo"
                    required={false}
                    iconPosition="left"
                    icon={<Icon name="Calendar" />}
                  />
                </div> */}
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
                    name="effectiveFrom"
                    fill={true}
                    value={formData?.values?.effectiveFrom}
                    onChange={(e) => handleChangeValueStartDate(e)}
                    placeholder="Chọn ngày hiệu lực"
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
                    name="effectiveTo"
                    fill={true}
                    value={formData?.values?.effectiveTo}
                    onChange={(e) => handleChangeValueEndDate(e)}
                    placeholder="Chọn ngày hết hiệu lực"
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
