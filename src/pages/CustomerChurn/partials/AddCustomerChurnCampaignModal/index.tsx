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
import Icon from "components/icon";
import "./index.scss";

/* ── Props ── */
interface IAddCustomerChurnCampaignModalProps {
  onShow: boolean;
  onHide: (reload?: boolean) => void;
  selectedIds?: number[]; // Nếu chọn từ bảng
}

export default function AddCustomerChurnCampaignModal({ onShow, onHide, selectedIds = [] }: IAddCustomerChurnCampaignModalProps) {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  /* ── Form initial values ── */
  const values = useMemo(
    () => ({
      campaignName: "",
      targetGroup: selectedIds.length > 0 ? "selected" : "high_risk",
      campaignType: "sms",
      note: "",
    }),
    [selectedIds, onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values });

  useEffect(() => {
    setFormData({ ...formData, values, errors: {} });
    setIsSubmit(false);
    return () => { setIsSubmit(false); };
  }, [values]);

  /* ── Validation ── */
  const validations: IValidation[] = [
    { name: "campaignName", rules: "required" },
    { name: "note", rules: "required" },
  ];

  /* ── List field ── */
  const listField: IFieldCustomize[] = useMemo(() => [
    {
      label: "Tên chiến dịch",
      name: "campaignName",
      type: "text",
      fill: true,
      required: true,
      placeholder: "VD: Khuyến mãi giải cứu KH nguy cơ cao T12",
    },
    {
      label: "Đối tượng áp dụng",
      name: "targetGroup",
      type: "select",
      fill: true,
      required: true,
      options: [
        ...(selectedIds.length > 0 ? [{ label: `Khách hàng đang chọn (${selectedIds.length} KH)`, value: "selected" }] : []),
        { label: "Tất cả khách hàng Nguy cơ cao (> 90 ngày)", value: "high_risk" },
        { label: "Tất cả khách hàng Nguy cơ TB (60-90 ngày)", value: "medium_risk" },
        { label: "Toàn bộ danh sách rời bỏ", value: "all" },
      ],
    },
    {
      label: "Kênh gửi tin",
      name: "campaignType",
      type: "select",
      fill: true,
      required: true,
      options: [
        { label: "SMS Brandname", value: "sms" },
        { label: "Zalo ZNS / OTT", value: "zalo" },
        { label: "Email Marketing", value: "email" },
        { label: "Thông báo App (Push Notification)", value: "app" },
      ],
    },
    {
      label: "Nội dung tin nhắn",
      name: "note",
      type: "textarea",
      fill: true,
      required: true,
      placeholder: "Ví dụ: Chào {Ten_KH}, RebornCRM tặng bạn mã giảm giá 30% cho lần quay lại này. Mã: COMEBACK30...",
    },
  ], [selectedIds]);

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
      // TODO: replace with real API call
      await new Promise((r) => setTimeout(r, 800));

      const channel = listField
        .find((f) => f.name === "campaignType")
        ?.options?.find((o) => o.value === formData.values?.campaignType)?.label ?? "";

      showToast(`Đã khởi tạo và gửi chiến dịch qua ${channel}`, "success");
      onHide(true);
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau.", "error");
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
            title: "Gửi đồng loạt",
            type: "submit",
            color: "primary",
            icon: <Icon name="Send" />,
            disabled:
              isSubmit ||
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
      title: <Fragment>Hủy thao tác tạo chiến dịch</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy? Các thiết lập chiến dịch sẽ không được lưu.</Fragment>,
      cancelText: "Tiếp tục sửa",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Đồng ý hủy",
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

  return (
    <Fragment>
      <Modal
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-campaign-churn"
      >
        <form className="form-campaign-churn" onSubmit={onSubmit}>
          <ModalHeader
            title="Tạo chiến dịch tái kích hoạt"
            toggle={() => !isSubmit && onHide(false)}
          />
          <ModalBody>
            <div className="churn-campaign-banner">
              <div className="churn-campaign-banner__icon"><Icon name="Send" /></div>
              <div className="churn-campaign-banner__text">
                <strong>Chăm sóc hàng loạt</strong>
                <p>Khởi tạo luồng tin nhắn tự động đến các tệp khách hàng có nguy cơ rời bỏ cao để kéo họ quay lại.</p>
              </div>
            </div>

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

            <div className="churn-campaign-vars">
              <p className="churn-campaign-vars__title">Các biến nội dung có thể dùng:</p>
              <div className="churn-campaign-vars__list">
                <span className="churn-campaign-var">{"{Ten_KH}"}</span>
                <span className="churn-campaign-var">{"{So_dien_thoai}"}</span>
                <span className="churn-campaign-var">{"{Lan_cuoi_mua}"}</span>
                <span className="churn-campaign-var">{"{So_ngay_vang}"}</span>
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
