import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import _ from "lodash";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Icon from "components/icon";
import moment from "moment";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import LoanInformationService from "services/fintech/LoanInformationService";
import { showToast } from "utils/common";

import "./ModalAddData.scss";

export default function ModalAddData({ onShow, onHide, dataProps, customerId }) {
  const focusedElement = useActiveElement();

  const [data, setData] = useState(null);  

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null); 
  
  useEffect(() => {
    if (onShow) {
      setData(dataProps ?? null);
    } else {
      setData(null);
    }
  }, [onShow, dataProps]);

  const values = useMemo(
    () =>
      ({
        contractNo: data?.contractNo ?? "",
        creditLimit: data?.creditLimit ?? "",
        creditRating: data?.creditRating ?? "",
        openingDate: data?.openingDate ?? "",
        dateDue: data?.dateDue ?? "",
        loan: data?.loan ?? "",
        currency: data?.currency ?? "",
        exchangeRate: data?.exchangeRate ?? "",
        interestRate: data?.interestRate ?? "",
        loanType: data?.loanType ?? "",
        status: data?.status ?? "",
        paymentHistory: data?.paymentHistory ?? "",
        collateral: data?.collateral ?? "",
        collateralAsset: data?.collateralAsset ?? "",
        groupDebt: data?.groupDebt ?? "",
        badDebtDate: data?.badDebtDate ?? "",
        badDebtAmount: data?.badDebtAmount ?? "",
        badDebtType: data?.badDebtType ?? "",
        customerId: data?.customerId ?? "",
      } as any),
    [onShow, data]
  );

  const validations: IValidation[] = [
    {
      name: "contractNo",
      rules: "required",
    },    
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]); 
  
  // Logic validate thời gian - dùng useMemo để tối ưu
  const openingMoment = useMemo(() => moment(formData.values.openingDate), [formData.values.openingDate]);
  const dueMoment = useMemo(() => moment(formData.values.dateDue), [formData.values.dateDue]);
  const badDebtMoment = useMemo(() => moment(formData.values.badDebtDate), [formData.values.badDebtDate]);
  const today = moment().startOf("day");

  const isOpeningAfterToday = openingMoment.isValid() && openingMoment.isAfter(today, "day");
  const isOpeningNotBeforeDue = openingMoment.isValid() && dueMoment.isValid() && !openingMoment.isBefore(dueMoment, "day");
  const isDueNotBeforeBadDebt = dueMoment.isValid() && badDebtMoment.isValid() && !dueMoment.isBefore(badDebtMoment, "day");

  // Áp dụng warning trực tiếp lên field
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (Object.keys(newErrors).length > 0) {
      setFormData(prev => ({
        ...prev,
        errors: { ...prev.errors, ...newErrors }
      }));
    } else {
      // Xóa lỗi nếu đã hợp lệ
      setFormData(prev => {
        const { openingDate, dateDue, badDebtDate, ...rest } = prev.errors || {};
        const hasTimeError = openingDate || dateDue || badDebtDate;
        return hasTimeError ? { ...prev, errors: rest } : prev;
      });
    }
  },);

  const listField = useMemo(
    () =>
      [
        {
          label: "Số hợp đồng vay",
          name: "contractNo",
          type: "number",
          fill: true,
          required: true,
        },
        {
          label: "Hạn mức tín dụng",
          name: "creditLimit",
          type: "number",
          fill: true,
        },
        {
          label: "Xếp hạng tín dụng",
          name: "creditRating",
          type: "select",
          fill: true,
          required: false,
          options: [
            {
              value: "AAA",
              label: "AAA",
            },
            {
              value: "AA",
              label: "AA",
            },
            {
              value: "A",
              label: "A",
            },
            {
              value: "BBB",
              label: "BBB",
            },
            {
              value: "BB",
              label: "BB",
            },
            {
              value: "B",
              label: "B",
            },
            {
              value: "CCC",
              label: "CCC",
            },
            {
              value: "CC",
              label: "CC",
            },
          ],
        },
        {
          label: "Ngày mở khoản vay",
          name: "openingDate",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập ngày mở khoản vay",
          isMinDate: true,
          isWarning: isOpeningAfterToday || isOpeningNotBeforeDue,
          messageWarning: isOpeningAfterToday
            ? "Không được lớn hơn ngày hiện tại"
            : isOpeningNotBeforeDue
            ? "Phải trước ngày đáo hạn"
            : "",
        },
        {
          label: "Ngày đáo hạn",
          name: "dateDue",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          placeholder: "Nhập ngày đáo hạn",
          isWarning: isOpeningNotBeforeDue || isDueNotBeforeBadDebt,
          messageWarning: isOpeningNotBeforeDue
            ? "Phải sau ngày mở khoản vay"
            : isDueNotBeforeBadDebt
            ? "Phải trước ngày phát sinh nợ xấu"
            : "",
        },
        {
          label: "Số tiền vay",
          name: "loan",
          type: "number",
          fill: true,
        },
        {
          label: "Loại tiền tệ",
          name: "currency",
          type: "text",
          fill: true,
        },
        {
          label: "Tỷ giá quy đổi",
          name: "exchangeRate",
          type: "number",
          fill: true,
        },
        {
          label: "Lãi suất",
          name: "interestRate",
          type: "number",
          fill: true,
        },
        {
          label: "Loại hình vay",
          name: "loanType",
          type: "select",
          fill: true,
          required: false,
          options: [
            {
              value: "1",
              label: "Vay ngắn hạn",
            },
            {
              value: "2",
              label: "Vay dài hạn",
            },
            {
              value: "3",
              label: "Vay thấu chi",
            },
            {
              value: "4",
              label: "Vay thế chấp",
            },            
          ],
        },
        {
          label: "Tình trạng",
          name: "status",
          type: "select",
          fill: true,
          required: false,
          options: [
            {
              value: "1",
              label: "Đang hoạt động",
            },
            {
              value: "2",
              label: "Đã hoàn tất",
            },
            {
              value: "3",
              label: "Bị trễ hạn",
            }
          ],
        },
        {
          label: "Lịch sử thanh toán khoản vay",
          name: "paymentHistory",
          type: "textarea",
          fill: true,
        },
        {
          label: "Tài sản đảm bảo",
          name: "collateral",
          type: "text",
          fill: true,
        },
        {
          label: "Giá trị tài sản đảm bảo",
          name: "collateralAsset",
          type: "number",
          fill: true,
        },
        {
          label: "Nhóm nợ",
          name: "groupDebt",
          type: "number",
          fill: true,
        },
        {
          label: "Ngày phát sinh nợ xấu",
          name: "badDebtDate",
          type: "date",
          fill: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          isWarning: isDueNotBeforeBadDebt,
          messageWarning: isDueNotBeforeBadDebt ? "Phải sau ngày đáo hạn" : "",
        },
        {
          label: "Số tiền nợ xấu",
          name: "badDebtAmount",
          type: "number",
          fill: true,
        },
        {
          label: "Phân loại nợ xấu",
          name: "badDebtType",
          type: "select",
          fill: true,
          required: false,
          options: [
            {
              value: "3",
              label: "Nhóm 3",
            },
            {
              value: "4",
              label: "Nhóm 4",
            },
            {
              value: "5",
              label: "Nhóm 5",
            }
          ],
        },
      ] as IFieldCustomize[],
    [
      formData,
      isOpeningAfterToday,
      isOpeningNotBeforeDue,
      isDueNotBeforeBadDebt,
    ]
  );

  const onSubmit = async (e) => {
    e && e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }   
    
    // Kiểm tra lại logic thời gian trước khi gửi (phòng thủ thêm lần nữa)
    if (isOpeningAfterToday || isOpeningNotBeforeDue || isDueNotBeforeBadDebt) {
      showToast("Vui lòng kiểm tra lại các trường ngày tháng", "warning");
      return;
    }

    setIsSubmit(true);

    const body: any = {
      ...(data ? { id: data?.id } : {}),
      ...(formData.values as any),
      openingDate: moment(formData.values.openingDate).format("YYYY-MM-DD HH:mm:ss"),
      dateDue: moment(formData.values.dateDue).format("YYYY-MM-DD HH:mm:ss"),
      badDebtDate: moment(formData.values.badDebtDate).format("YYYY-MM-DD HH:mm:ss"),
      customerId
    };

    const response = await LoanInformationService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} khoản vay tại LPBank thành công`, "success");
      setData(null);
      setFormData({ values: {} });
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const handleClearForm = (acc) => {
    onHide(acc);    
    setData(null);
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
              _.isEqual(formData.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: dataProps?.id ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit ||
              isOpeningAfterToday ||
              isOpeningNotBeforeDue ||
              isDueNotBeforeBadDebt ||
              !isDifferenceObj(formData.values, values) ||
              Object.keys(formData.errors || {}).length > 0,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit, isOpeningAfterToday, isOpeningNotBeforeDue, isDueNotBeforeBadDebt, formData.errors]
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
        handleClearForm(false);
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
          handleClearForm(false);
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
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-loan-information"
      >
        <form className="form-add-data" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${dataProps?.id ? "Chỉnh sửa" : "Thêm mới"} khoản vay tại LPBank`} toggle={() => !isSubmit && handleClearForm(false)} />
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
