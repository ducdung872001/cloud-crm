// Đặt tại: src/pages/SettingPaymentMethod/partials/PaymentMethodModal/index.tsx
import React, { Fragment, useState, useEffect, useMemo, useCallback } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import { useActiveElement } from "utils/hookCustom";
import {
    IPaymentMethodTemplate, IPaymentTemplateRequest,
    PaymentPartner, PaymentProcessType, PARTNER_META,
} from "model/paymentMethod/PaymentMethodModel";
import { PaymentTemplateService } from "services/PaymentMethodService";

const PARTNER_OPTIONS = (Object.entries(PARTNER_META) as [PaymentPartner, typeof PARTNER_META[PaymentPartner]][])
    .map(([value, meta]) => ({ value, label: `${meta.icon} ${meta.label}` }));

interface Props {
    open: boolean;
    data: IPaymentMethodTemplate | null;
    onClose: (reload: boolean) => void;
}

const empty = (): IPaymentTemplateRequest => ({
    partner: "CASH", processType: "MANUAL", systemName: "",
    description: "", logoUrl: "", requiresKey: false, position: 0, isActive: true,
});

export default function PaymentTemplateModal({ open, data, onClose }: Props) {
    const isEdit = !!data;
    const focusedElement = useActiveElement();
    const [isSubmit, setIsSubmit] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [contentDialog, setContentDialog] = useState<IContentDialog | null>(null);
    const [form, setForm] = useState<IPaymentTemplateRequest>(empty());
    const [errors, setErrors] = useState<Record<string, string>>({});

    const initialValues = useMemo((): IPaymentTemplateRequest => {
        if (!data) return empty();
        return {
            partner: data.partner, processType: data.processType, systemName: data.systemName,
            description: data.description ?? "", logoUrl: data.logoUrl ?? "",
            requiresKey: data.requiresKey, position: data.position, isActive: data.isActive,
        };
    }, [data, open]);

    useEffect(() => { setForm(initialValues); setErrors({}); setIsSubmit(false); }, [initialValues]);

    const handlePartnerChange = (partner: PaymentPartner) => {
        const meta = PARTNER_META[partner];
        setForm((p) => ({
            ...p, partner,
            processType: meta.processType,
            requiresKey: ["MOMO", "ZALOPAY", "VNPAY"].includes(partner),
            systemName: !isEdit && (!p.systemName || PARTNER_OPTIONS.some(
                (o) => o.label.replace(/^.{2}/, "").trim() === p.systemName
            )) ? meta.label : p.systemName,
        }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!form.systemName?.trim()) errs.systemName = "Vui lòng nhập tên hệ thống";
        if (!form.partner) errs.partner = "Vui lòng chọn đối tác";
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setIsSubmit(true);
        const res = await PaymentTemplateService.update({ ...form, ...(isEdit ? { id: data!.id } : {}) });
        if (res.code === 0) {
            showToast(`${isEdit ? "Cập nhật" : "Thêm mới"} thành công`, "success");
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
            defaultText: "Xác nhận", defaultAction: () => { onClose(false); setShowDialog(false); setContentDialog(null); },
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
                { title: "Hủy", color: "primary", variant: "outline", disabled: isSubmit, callback: handleClose },
                { title: isEdit ? "Cập nhật" : "Tạo mới", type: "submit", color: "primary", disabled: isSubmit, is_loading: isSubmit },
            ],
        },
    }), [isSubmit, isEdit]);

    const set = (key: string, val: any) => {
        setForm((p) => ({ ...p, [key]: val }));
        setErrors((p) => ({ ...p, [key]: undefined }));
    };

    return (
        <Fragment>
            <Modal isFade isOpen={open} isCentered staticBackdrop toggle={() => !isSubmit && handleClose()}
                className="modal-payment-template">
                <form onSubmit={onSubmit}>
                    <ModalHeader title={`${isEdit ? "Chỉnh sửa" : "Thêm mới"} phương thức thanh toán`}
                        toggle={() => !isSubmit && handleClose()} />
                    <ModalBody>
                        <div className="ptm-form">
                            {/* Đối tác */}
                            <div className={`ptm-field${errors.partner ? " ptm-field--err" : ""}`}>
                                <label className="ptm-label">Đối tác tích hợp <span className="ptm-req">*</span></label>
                                <div className="ptm-partner-grid">
                                    {PARTNER_OPTIONS.map((opt) => (
                                        <button key={opt.value} type="button"
                                            className={`ptm-chip${form.partner === opt.value ? " active" : ""}`}
                                            onClick={() => handlePartnerChange(opt.value as PaymentPartner)}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                {errors.partner && <span className="ptm-error">{errors.partner}</span>}
                            </div>

                            {/* Tên hệ thống */}
                            <div className={`ptm-field${errors.systemName ? " ptm-field--err" : ""}`}>
                                <label className="ptm-label">Tên hệ thống (nội bộ) <span className="ptm-req">*</span></label>
                                <input className="ptm-input" type="text"
                                    placeholder="VD: Ví điện tử MoMo, Chuyển khoản ngân hàng..."
                                    value={form.systemName}
                                    onChange={(e) => set("systemName", e.target.value)} />
                                {errors.systemName && <span className="ptm-error">{errors.systemName}</span>}
                            </div>

                            {/* Loại xử lý + Cần API key */}
                            <div className="ptm-row-2">
                                <div className="ptm-field">
                                    <label className="ptm-label">Loại xử lý</label>
                                    <div className="ptm-seg">
                                        {(["MANUAL", "AUTO"] as PaymentProcessType[]).map((t) => (
                                            <button key={t} type="button"
                                                className={`ptm-seg__btn${form.processType === t ? " active" : ""}`}
                                                onClick={() => set("processType", t)}>
                                                {t === "MANUAL" ? "👆 Thủ công" : "⚡ Tự động"}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="ptm-hint">
                                        {form.processType === "MANUAL" ? "Nhân viên xác nhận thủ công" : "Tự xác nhận qua API callback"}
                                    </span>
                                </div>
                                <div className="ptm-field">
                                    <label className="ptm-label">Cần API key từ cửa hàng</label>
                                    <div className="ptm-toggle-row">
                                        <label className="spm-toggle">
                                            <input type="checkbox" checked={form.requiresKey ?? false}
                                                onChange={(e) => set("requiresKey", e.target.checked)} />
                                            <span className="spm-toggle__track" />
                                        </label>
                                        <span className="ptm-toggle-label">
                                            {form.requiresKey ? "Có — Store Admin phải nhập key" : "Không cần"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Mô tả */}
                            <div className="ptm-field">
                                <label className="ptm-label">Mô tả / hướng dẫn cho Store Admin</label>
                                <textarea className="ptm-input ptm-input--ta" rows={3}
                                    placeholder="Hướng dẫn cấu hình cho quản trị cửa hàng..."
                                    value={form.description ?? ""}
                                    onChange={(e) => set("description", e.target.value)} />
                            </div>

                            {/* Thứ tự + Trạng thái */}
                            <div className="ptm-row-2">
                                <div className="ptm-field">
                                    <label className="ptm-label">Thứ tự hiển thị</label>
                                    <input className="ptm-input" type="number" min={0} placeholder="0"
                                        value={form.position ?? 0}
                                        onChange={(e) => set("position", Number(e.target.value))} />
                                </div>
                                <div className="ptm-field">
                                    <label className="ptm-label">Hiển thị với Store Admin</label>
                                    <div className="ptm-toggle-row">
                                        <label className="spm-toggle">
                                            <input type="checkbox" checked={form.isActive ?? true}
                                                onChange={(e) => set("isActive", e.target.checked)} />
                                            <span className="spm-toggle__track" />
                                        </label>
                                        <span className="ptm-toggle-label">{form.isActive ? "Đang hiển thị" : "Đang ẩn"}</span>
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