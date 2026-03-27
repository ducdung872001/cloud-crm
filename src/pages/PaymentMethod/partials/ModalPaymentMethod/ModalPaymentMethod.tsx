// Đặt tại: src/pages/PaymentMethod/partials/ModalPaymentMethod/ModalPaymentMethod.tsx
import React, { Fragment, useState, useEffect, useMemo, useCallback } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import SelectCustom from "components/selectCustom/selectCustom";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { useActiveElement } from "utils/hookCustom";
import {
  IStorePaymentConfigResponse,
  IStorePaymentConfigRequest,
  IPaymentMethodTemplate,
  PARTNER_META,
  STORE_FIELDS_BY_PARTNER,
  VIETNAM_BANKS,
} from "model/paymentMethod/PaymentMethodModel";
import { StorePaymentConfigService } from "services/PaymentMethodService";
import "./ModalPaymentMethod.scss";

interface Props {
  open: boolean;
  data: IStorePaymentConfigResponse | null; // null = thêm mới
  branchId?: number;
  onClose: (reload: boolean) => void;
}

const empty = (templateId = 0): IStorePaymentConfigRequest => ({
  templateId, displayName: "", bankName: "", accountNumber: "",
  accountHolderName: "", partnerCode: "", apiKey: "", clientSecret: "",
  paymentTimeout: undefined, isDefault: false, isActive: true, position: 0,
});

export default function ModalPaymentMethod({ open, data, branchId = 0, onClose }: Props) {
  const isEdit = !!data;
  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog | null>(null);
  const [form, setForm] = useState<IStorePaymentConfigRequest>(empty());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<IPaymentMethodTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Template đang được chọn/edit → biết partner → show đúng fields
  const selectedTemplate: IPaymentMethodTemplate | undefined =
    isEdit ? data!.template : templates.find((t) => t.id === form.templateId);
  const partner = selectedTemplate?.partner ?? "OTHER";
  const visibleFields = STORE_FIELDS_BY_PARTNER[partner] ?? [];

  // Giá trị khởi tạo form
  const initialValues = useMemo((): IStorePaymentConfigRequest => {
    if (!data) return empty();
    return {
      templateId: data.templateId,
      displayName: data.displayName,
      bankName: data.bankName ?? "",
      accountNumber: data.accountNumber ?? "",
      accountHolderName: data.accountHolderName ?? "",
      partnerCode: data.partnerCode ?? "",
      apiKey: "",           // Không pre-fill — user phải nhập lại nếu muốn đổi
      clientSecret: "",
      paymentTimeout: data.paymentTimeout,
      isDefault: data.isDefault,
      isActive: data.isActive,
      position: data.position,
    };
  }, [data, open]);

  useEffect(() => { setForm(initialValues); setErrors({}); setIsSubmit(false); }, [initialValues]);

  // Fetch available templates khi thêm mới
  useEffect(() => {
    if (!open || isEdit) return;
    setLoadingTemplates(true);
    StorePaymentConfigService.availableTemplates(branchId)
      .then((res) => { if (res.code === 0) setTemplates(res.result ?? []); })
      .catch(() => { })
      .finally(() => setLoadingTemplates(false));
  }, [open, isEdit, branchId]);

  const templateOptions = templates.map((t) => {
    const meta = PARTNER_META[t.partner] ?? PARTNER_META.OTHER;
    return { value: t.id, label: `${meta.icon} ${t.systemName}` };
  });

  const handleTemplateChange = (templateId: number) => {
    const t = templates.find((x) => x.id === templateId);
    setForm((p) => ({
      ...p,
      templateId,
      displayName: !p.displayName ? (t?.systemName ?? "") : p.displayName,
    }));
    setErrors((p) => ({ ...p, templateId: undefined }));
  };

  // Submit
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.templateId) errs.templateId = "Vui lòng chọn phương thức thanh toán";
    if (!form.displayName?.trim()) errs.displayName = "Vui lòng nhập tên hiển thị";
    if (visibleFields.includes("accountNumber") && partner === "BANK_TRANSFER" && !form.accountNumber?.trim())
      errs.accountNumber = "Vui lòng nhập số tài khoản";
    if (visibleFields.includes("bankName") && !form.bankName?.trim())
      errs.bankName = "Vui lòng chọn ngân hàng";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSubmit(true);

    // Chỉ gửi fields liên quan đến partner, bỏ các field không liên quan
    const body: IStorePaymentConfigRequest = {
      ...form,
      ...(isEdit ? { id: data!.id } : {}),
      bankName: visibleFields.includes("bankName") ? form.bankName : undefined,
      accountNumber: visibleFields.includes("accountNumber") ? form.accountNumber : undefined,
      accountHolderName: visibleFields.includes("accountHolderName") ? form.accountHolderName : undefined,
      partnerCode: visibleFields.includes("partnerCode") ? form.partnerCode : undefined,
      // Chỉ gửi nếu user có nhập — tránh ghi đè bằng chuỗi rỗng
      apiKey: visibleFields.includes("apiKey") && form.apiKey?.trim() ? form.apiKey.trim() : undefined,
      clientSecret: visibleFields.includes("clientSecret") && form.clientSecret?.trim() ? form.clientSecret.trim() : undefined,
      paymentTimeout: visibleFields.includes("paymentTimeout") ? form.paymentTimeout : undefined,
    };

    const res = await StorePaymentConfigService.update(body, branchId);
    if (res.code === 0) {
      showToast(`${isEdit ? "Cập nhật" : "Thêm"} phương thức thanh toán thành công`, "success");
      onClose(true);
    } else {
      showToast(res.message ?? "Có lỗi xảy ra", "error");
      setIsSubmit(false);
    }
  };

  const showCancelDialog = () => {
    setContentDialog({
      color: "warning", isCentered: true, isLoading: false,
      title: <>Hủy bỏ thao tác</>,
      message: <>Thay đổi chưa lưu sẽ bị mất. Xác nhận hủy?</>,
      cancelText: "Quay lại", cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận hủy",
      defaultAction: () => { onClose(false); setShowDialog(false); setContentDialog(null); },
    });
    setShowDialog(true);
  };

  const handleClose = () => {
    if (isDifferenceObj(form, initialValues)) showCancelDialog(); else onClose(false);
  };

  const checkKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.keyCode === 27 && !showDialog) {
      if (isDifferenceObj(form, initialValues)) showCancelDialog(); else onClose(false);
    }
  }, [form, showDialog]);

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);
    return () => window.removeEventListener("keydown", checkKeyDown);
  }, [checkKeyDown]);

  const actions = useMemo<IActionModal>(() => ({
    actions_right: {
      buttons: [
        { title: "Hủy bỏ", color: "primary", variant: "outline", disabled: isSubmit, callback: handleClose },
        { title: "Lưu cấu hình", type: "submit", color: "primary", disabled: isSubmit, is_loading: isSubmit },
      ],
    },
  }), [isSubmit]);

  const set = (key: string, val: any) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const meta = PARTNER_META[partner] ?? PARTNER_META.OTHER;

  return (
    <Fragment>
      <Modal isFade isOpen={open} isCentered staticBackdrop toggle={() => !isSubmit && handleClose()}
        className="modal-payment-method">
        <form onSubmit={onSubmit}>
          <ModalHeader title="Cấu hình Phương thức Thanh toán"
            toggle={() => !isSubmit && handleClose()} />
          <ModalBody>
            <div className="mpm-form">

              {/* Chọn template (chỉ khi thêm mới) */}
              {!isEdit && (
                <div className={`mpm-field${errors.templateId ? " mpm-field--err" : ""}`}>
                  <label className="mpm-label">
                    Phương thức thanh toán <span className="mpm-req">*</span>
                  </label>
                  {loadingTemplates ? (
                    <div className="mpm-loading">⏳ Đang tải danh sách...</div>
                  ) : templateOptions.length === 0 ? (
                    <div className="mpm-empty">
                      Tất cả phương thức đã được thêm. Liên hệ Admin hệ thống để bổ sung thêm.
                    </div>
                  ) : (
                    <SelectCustom
                      id="pm-template" name="pm-template"
                      options={templateOptions}
                      placeholder="Chọn phương thức..."
                      value={form.templateId || null}
                      fill
                      onChange={(opt: any) => handleTemplateChange(opt?.value ?? 0)}
                    />
                  )}
                  {errors.templateId && <span className="mpm-error">{errors.templateId}</span>}
                </div>
              )}

              {/* Info banner khi edit */}
              {isEdit && selectedTemplate && (
                <div className="mpm-template-info" style={{ borderLeftColor: meta.color }}>
                  <span style={{ fontSize: 22 }}>{meta.icon}</span>
                  <div>
                    <div className="mpm-template-name">{selectedTemplate.systemName}</div>
                    <div className="mpm-template-type">
                      {meta.label} · {selectedTemplate.processType === "AUTO" ? "⚡ Tự động" : "👆 Thủ công"}
                    </div>
                    {selectedTemplate.description && (
                      <div className="mpm-template-desc">{selectedTemplate.description}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Tên hiển thị */}
              <div className={`mpm-field${errors.displayName ? " mpm-field--err" : ""}`}>
                <label className="mpm-label">
                  Tên hiển thị tại quầy <span className="mpm-req">*</span>
                </label>
                <input className="mpm-input" type="text"
                  placeholder="VD: Chuyển khoản MB Bank, Tiền mặt..."
                  value={form.displayName}
                  onChange={(e) => set("displayName", e.target.value)} />
                {errors.displayName && <span className="mpm-error">{errors.displayName}</span>}
              </div>

              {/* Ngân hàng (BANK_TRANSFER + QR_PRO) */}
              {visibleFields.includes("bankName") && (
                <div className={`mpm-field${errors.bankName ? " mpm-field--err" : ""}`}>
                  <label className="mpm-label">
                    Ngân hàng{" "}
                    {["BANK_TRANSFER", "QR_PRO"].includes(partner) && <span className="mpm-req">*</span>}
                  </label>
                  <SelectCustom
                    id="pm-bank" name="pm-bank"
                    options={VIETNAM_BANKS}
                    placeholder="Chọn ngân hàng..."
                    value={form.bankName}
                    fill
                    onChange={(opt: any) => set("bankName", opt?.value ?? "")}
                  />
                  {errors.bankName && <span className="mpm-error">{errors.bankName}</span>}
                </div>
              )}

              {/* Số tài khoản */}
              {visibleFields.includes("accountNumber") && (
                <div className={`mpm-field${errors.accountNumber ? " mpm-field--err" : ""}`}>
                  <label className="mpm-label">
                    Số tài khoản / SĐT ví
                    {partner === "BANK_TRANSFER" && <span className="mpm-req"> *</span>}
                  </label>
                  <input className="mpm-input mpm-input--mono" type="text"
                    placeholder="Nhập số tài khoản hoặc SĐT ví..."
                    value={form.accountNumber ?? ""}
                    onChange={(e) => set("accountNumber", e.target.value)} />
                  {errors.accountNumber && <span className="mpm-error">{errors.accountNumber}</span>}
                </div>
              )}

              {/* Tên chủ tài khoản */}
              {visibleFields.includes("accountHolderName") && (
                <div className="mpm-field">
                  <label className="mpm-label">Tên chủ tài khoản</label>
                  <input className="mpm-input" type="text"
                    placeholder="Nhập tên chủ tài khoản..."
                    value={form.accountHolderName ?? ""}
                    onChange={(e) => set("accountHolderName", e.target.value)} />
                </div>
              )}

              {/* Partner Code */}
              {visibleFields.includes("partnerCode") && (
                <div className="mpm-field">
                  <label className="mpm-label">Partner Code</label>
                  <input className="mpm-input mpm-input--mono" type="text"
                    placeholder="Nhập partner code từ cổng thanh toán..."
                    value={form.partnerCode ?? ""}
                    onChange={(e) => set("partnerCode", e.target.value)} />
                </div>
              )}

              {/* API Key */}
              {visibleFields.includes("apiKey") && (
                <div className="mpm-field">
                  <label className="mpm-label">
                    API Key
                    {isEdit && <span className="mpm-hint-inline"> (để trống nếu không muốn thay đổi)</span>}
                  </label>
                  <input className="mpm-input mpm-input--mono" type="password"
                    placeholder={isEdit ? "Nhập để cập nhật API key mới..." : "Nhập API key được cấp..."}
                    value={form.apiKey ?? ""}
                    onChange={(e) => set("apiKey", e.target.value)}
                    autoComplete="new-password" />
                </div>
              )}

              {/* Client Secret */}
              {visibleFields.includes("clientSecret") && (
                <div className="mpm-field">
                  <label className="mpm-label">
                    Client Secret
                    {isEdit && <span className="mpm-hint-inline"> (để trống nếu không muốn thay đổi)</span>}
                  </label>
                  <input className="mpm-input mpm-input--mono" type="password"
                    placeholder={isEdit ? "Nhập để cập nhật client secret mới..." : "Nhập client secret..."}
                    value={form.clientSecret ?? ""}
                    onChange={(e) => set("clientSecret", e.target.value)}
                    autoComplete="new-password" />
                </div>
              )}

              {/* Timeout */}
              {visibleFields.includes("paymentTimeout") && (
                <div className="mpm-field">
                  <label className="mpm-label">Thời gian chờ thanh toán (phút)</label>
                  <input className="mpm-input" type="number" min={1} max={60} placeholder="VD: 15"
                    value={form.paymentTimeout ?? ""}
                    onChange={(e) => set("paymentTimeout", e.target.value ? Number(e.target.value) : undefined)} />
                </div>
              )}

              {/* Thứ tự + Mặc định + Trạng thái */}
              <div className="mpm-row-3">
                <div className="mpm-field">
                  <label className="mpm-label">Thứ tự hiển thị</label>
                  <input className="mpm-input" type="number" min={0}
                    value={form.position ?? 0}
                    onChange={(e) => set("position", Number(e.target.value))} />
                </div>
                <div className="mpm-field">
                  <label className="mpm-label">Mặc định</label>
                  <div className="mpm-toggle-row">
                    <input type="checkbox" className="base-switch"
                      checked={form.isDefault ?? false}
                      onChange={(e) => set("isDefault", e.target.checked)} />
                    <span className="mpm-toggle-label">{form.isDefault ? "Có" : "Không"}</span>
                  </div>
                </div>
                <div className="mpm-field">
                  <label className="mpm-label">Trạng thái</label>
                  <div className="mpm-toggle-row">
                    <input type="checkbox" className="base-switch"
                      checked={form.isActive ?? true}
                      onChange={(e) => set("isActive", e.target.checked)} />
                    <span className="mpm-toggle-label">{form.isActive ? "Bật" : "Tắt"}</span>
                  </div>
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