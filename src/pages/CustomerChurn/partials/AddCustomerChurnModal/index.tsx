import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./index.scss";

/* ── Props ── */
interface IChurnCustomer {
  id?: number;
  name?: string;
  phone?: string;
  lastBuy?: string;
  days?: number;
  spent?: string;
  risk?: "high" | "medium" | "low";
}

interface IAddCustomerChurnModalProps {
  onShow: boolean;
  data: IChurnCustomer | null;
  onHide: (reload?: boolean) => void;
}

export default function AddCustomerChurnModal(props: IAddCustomerChurnModalProps) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  /* ── Form initial values ── */
  const values = useMemo(
    () => ({
      name: data?.name ?? "",
      phone: data?.phone ?? "",
      lastBuy: data?.lastBuy ?? "",
      days: data?.days?.toString() ?? "",
      spent: data?.spent ?? "",
      risk: data?.risk ?? "medium",
      campaignType: "sms",
      note: "",
    }),
    [data, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values });

  useEffect(() => {
    setFormData({ ...formData, values, errors: {} });
    setIsSubmit(false);
    return () => { setIsSubmit(false); };
  }, [values]);

  /* ── Validation ── */
  const validations: IValidation[] = [
    { name: "name", rules: "required" },
    { name: "phone", rules: "required" },
  ];

  /* ── List field ── */
  const listField: IFieldCustomize[] = [
    {
      label: "Tên khách hàng",
      name: "name",
      type: "text",
      fill: true,
      required: true,
      placeholder: "Nhập tên khách hàng",
      disabled: !!data,
    },
    {
      label: "Số điện thoại",
      name: "phone",
      type: "text",
      fill: true,
      required: true,
      placeholder: "Nhập số điện thoại",
      disabled: !!data,
    },
    {
      label: "Lần cuối mua hàng",
      name: "lastBuy",
      type: "text",
      fill: true,
      placeholder: "VD: 01/12/2025",
      disabled: !!data,
    },
    {
      label: "Số ngày không mua",
      name: "days",
      type: "number",
      fill: true,
      placeholder: "Số ngày không có giao dịch",
      disabled: !!data,
    },
    {
      label: "Tổng chi tiêu (VNĐ)",
      name: "spent",
      type: "text",
      fill: true,
      placeholder: "VD: 3.200.000",
      disabled: !!data,
    },
    {
      label: "Mức độ nguy cơ rời bỏ",
      name: "risk",
      type: "select",
      fill: true,
      options: [
        { label: "Nguy cơ cao  (> 90 ngày không mua)", value: "high" },
        { label: "Nguy cơ TB   (60 – 90 ngày không mua)", value: "medium" },
        { label: "Nguy cơ thấp (< 60 ngày không mua)", value: "low" },
      ],
    },
    {
      label: "Kênh tái kích hoạt",
      name: "campaignType",
      type: "select",
      fill: true,
      required: true,
      options: [
        { label: "SMS", value: "sms" },
        { label: "Zalo / OTT", value: "zalo" },
        { label: "Email", value: "email" },
        { label: "Thông báo App", value: "app" },
      ],
    },
    {
      label: "Nội dung tin nhắn / ghi chú",
      name: "note",
      type: "textarea",
      fill: true,
      placeholder: "Nhập nội dung tin nhắn tái kích hoạt hoặc ghi chú nội bộ...",
    },
  ];

  /* ── Submit ── */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return;
    }

    setIsSubmit(true);
    try {
      // TODO: replace with real API — e.g. CustomerChurnService.sendCampaign(formData.values)
      await new Promise((r) => setTimeout(r, 500));

      const channel = listField
        .find((f) => f.name === "campaignType")
        ?.options?.find((o) => o.value === formData.values?.campaignType)?.label ?? "";

      showToast(
        data
          ? `Đã gửi chiến dịch tái kích hoạt qua ${channel} đến ${data.name}`
          : "Đã lưu khách hàng vào danh sách rời bỏ",
        "success"
      );
      onHide(true);
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  /* ── Footer actions ── */
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
            title: data ? "Gửi chiến dịch" : "Lưu",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  /* ── Cancel confirm dialog ── */
  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "gửi chiến dịch" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Dữ liệu đã nhập sẽ không được lưu.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận",
      defaultAction: () => { onHide(false); setShowDialog(false); setContentDialog(null); },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  /* ── ESC key handler ── */
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

  /* ── Modal title ── */
  const modalTitle = data
    ? `Tái kích hoạt — ${data.name}`
    : "Thêm khách hàng rời bỏ";

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-customer-churn"
      >
        <form className="form-customer-churn" onSubmit={onSubmit}>
          <ModalHeader
            title={modalTitle}
            toggle={() => !isSubmit && onHide(false)}
          />
          <ModalBody>
            {/* Banner tóm tắt khi mở từ bảng */}
            {data && (
              <div className={`churn-modal-banner churn-modal-banner--${data.risk ?? "medium"}`}>
                <span className="churn-modal-banner__icon" style={{ color: data.risk === "high" ? "#dc2626" : data.risk === "medium" ? "#f59e0b" : "#16a34a" }}>
                  {data.risk === "high" ? "◉" : data.risk === "medium" ? "◉" : "◉"}
                </span>
                <div>
                  <p className="churn-modal-banner__name">{data.name}</p>
                  <p className="churn-modal-banner__detail">
                    Không mua hàng trong <strong>{data.days} ngày</strong>
                    &nbsp;·&nbsp;Lần cuối: <strong>{data.lastBuy}</strong>
                    &nbsp;·&nbsp;Chi tiêu: <strong>{data.spent}đ</strong>
                  </p>
                </div>
              </div>
            )}

            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) =>
                    handleChangeValidate(value, field, formData, validations, listField, setFormData)
                  }
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
