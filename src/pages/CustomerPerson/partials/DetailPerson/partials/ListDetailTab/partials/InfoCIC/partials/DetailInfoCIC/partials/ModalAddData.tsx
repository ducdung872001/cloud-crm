import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import _ from "lodash";
import moment from "moment";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Icon from "components/icon";
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
    () => ({
      contractNo: data?.contractNo ?? "",
      creditLimit: data?.creditLimit ?? "",
      creditRating: data?.creditRating ?? "",
      openingDate: data?.openingDate ? moment(data?.openingDate) : "",
      dateDue: data?.dateDue ? moment(data?.dateDue) : "",
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
      badDebtDate: data?.badDebtDate ? moment(data?.badDebtDate) : "",
      badDebtAmount: data?.badDebtAmount ?? "",
      badDebtType: data?.badDebtType ?? "",
      customerId: data?.customerId ?? customerId ?? "",
    }),
    [data, customerId]
  );

  const [formData, setFormData] = useState<IFormData>({ values });

  useEffect(() => {
    setFormData({ values, errors: {} });
    setIsSubmit(false);
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
      setFormData((prev) => ({
        ...prev,
        errors: { ...prev.errors, ...newErrors },
      }));
    } else {
      // Xóa lỗi nếu đã hợp lệ
      setFormData((prev) => {
        const { openingDate, dateDue, badDebtDate, ...rest } = prev.errors || {};
        const hasTimeError = openingDate || dateDue || badDebtDate;
        return hasTimeError ? { ...prev, errors: rest } : prev;
      });
    }
  });

  const validations: IValidation[] = [
    { name: "contractNo", rules: "required" },
    { name: "openingDate", rules: "required" },
    { name: "dateDue", rules: "required" },
  ];

  const listField = useMemo<IFieldCustomize[]>(
    () => [
      {
        label: "Số hợp đồng vay",
        name: "contractNo",
        type: "text",
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
        placeholder: "Chọn ngày mở khoản vay",
        isMaxDate: true,
        isWarning: isOpeningAfterToday || isOpeningNotBeforeDue,
        messageWarning: isOpeningAfterToday ? "Không được lớn hơn ngày hiện tại" : isOpeningNotBeforeDue ? "Phải trước ngày đáo hạn" : "",
      },
      {
        label: "Ngày đáo hạn",
        name: "dateDue",
        type: "date",
        fill: true,
        required: true,
        icon: <Icon name="Calendar" />,
        iconPosition: "left",
        placeholder: "Chọn ngày đáo hạn",
        isWarning: isOpeningNotBeforeDue || isDueNotBeforeBadDebt,
        messageWarning: isOpeningNotBeforeDue ? "Phải sau ngày mở khoản vay" : isDueNotBeforeBadDebt ? "Phải trước ngày phát sinh nợ xấu" : "",
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
          },
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
          },
        ],
      },
    ],
    [isOpeningAfterToday, isOpeningNotBeforeDue, isDueNotBeforeBadDebt]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }

    // Kiểm tra lại logic thời gian trước khi gửi (phòng thủ thêm lần nữa)
    if (isOpeningAfterToday || isOpeningNotBeforeDue || isDueNotBeforeBadDebt) {
      showToast("Vui lòng kiểm tra lại các trường ngày tháng", "warning");
      return;
    }

    setIsSubmit(true);

    const body = {
      ...(dataProps?.id ? { id: dataProps.id } : {}),
      ...formData.values,
      openingDate: moment(formData.values.openingDate).format("YYYY-MM-DD[T]HH:mm:ss"),
      dateDue: moment(formData.values.dateDue).format("YYYY-MM-DD[T]HH:mm:ss"),
      badDebtDate: moment(formData.values.badDebtDate).format("YYYY-MM-DD[T]HH:mm:ss"),
      customerId: customerId,
    };

    const response = await LoanInformationService.update(body);

    if (response.code === 0) {
      showToast(`${dataProps?.id ? "Cập nhật" : "Thêm mới"} khoản vay thành công`, "success");
      // Reset data và form state
      setData(null);
      setFormData({ values: {} });
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra", "error");
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
              isDifferenceObj(formData.values, values) ? showDialogConfirmCancel() : onHide(false);
            },
          },
          {
            title: dataProps?.id ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
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
    [formData.values, values, isSubmit, isOpeningAfterToday, isOpeningNotBeforeDue, isDueNotBeforeBadDebt, formData.errors]
  );

  const showDialogConfirmCancel = () => {
    setContentDialog({
      color: "warning",
      title: `Hủy bỏ thao tác ${dataProps?.id ? "chỉnh sửa" : "thêm mới"}`,
      message: "Bạn có chắc chắn muốn hủy? Dữ liệu chưa lưu sẽ bị mất.",
      cancelText: "Quay lại",
      cancelAction: () => setShowDialog(false),
      defaultText: "Xác nhận hủy",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
      },
    });
    setShowDialog(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      if (e.keyCode === 27 && !showDialog) {
        isDifferenceObj(formData.values, values) ? showDialogConfirmCancel() : onHide(false);
      }
    },
    [formData.values, values, showDialog]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);
    return () => window.removeEventListener("keydown", checkKeyDown);
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal isFade isOpen={onShow} isCentered staticBackdrop toggle={() => !isSubmit && onHide(false)} className="modal-cic-info">
        <form className="form-add-data" onSubmit={onSubmit}>
          <ModalHeader title={`${dataProps?.id ? "Chỉnh sửa" : "Thêm mới"} khoản vay tại các TCTD`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, idx) => (
                <FieldCustomize
                  key={idx}
                  field={field}
                  handleUpdate={(val) => handleChangeValidate(val, field, formData, validations, listField, setFormData)}
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
