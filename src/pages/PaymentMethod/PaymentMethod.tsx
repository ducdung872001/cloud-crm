// Đặt tại: src/pages/PaymentMethod/PaymentMethod.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import Loading from "components/loading";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { showToast } from "utils/common";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import { ITitleActions } from "components/titleAction/titleAction";
import { IStorePaymentConfigResponse, PARTNER_META } from "model/paymentMethod/PaymentMethodModel";
import { StorePaymentConfigService } from "services/PaymentMethodService";
import ModalPaymentMethod from "./partials/ModalPaymentMethod/ModalPaymentMethod";
import "./PaymentMethod.scss";

// Mask số tài khoản: hiện 4 ký tự cuối
const maskAccount = (s?: string) =>
  s && s.length > 4 ? "•".repeat(Math.min(s.length - 4, 6)) + s.slice(-4) : (s ?? "—");

export default function PaymentMethodList({ onBackProps }: { onBackProps?: any }) {
  document.title = "Lựa chọn Phương thức Thanh toán";
  const isMounted = useRef(false);
  const abort = useRef(new AbortController());

  const [list, setList] = useState<IStorePaymentConfigResponse[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [editData, setEditData] = useState<IStorePaymentConfigResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog | null>(null);

  // branchId: lấy từ URL hoặc context nếu cần; dùng 0 để backend lấy từ principal
  const branchId = 0;

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await StorePaymentConfigService.list(branchId, abort.current.signal);
      if (res.code === 0) setList(res.result ?? []);
      else if (res.code !== 400) showToast(res.message ?? "Có lỗi xảy ra", "error");
    } catch { /* aborted */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchList(); }, []);

  // Toggle bật/tắt — optimistic update
  const handleToggle = async (item: IStorePaymentConfigResponse) => {
    const next = !item.isActive;
    setList((p) => p.map((x) => x.id === item.id ? { ...x, isActive: next } : x));
    const res = await StorePaymentConfigService.toggle(item.id, next);
    if (res.code !== 0) {
      setList((p) => p.map((x) => x.id === item.id ? { ...x, isActive: item.isActive } : x));
      showToast(res.message ?? "Không thể thay đổi trạng thái", "error");
    }
  };

  // Đặt mặc định — optimistic
  const handleSetDefault = async (item: IStorePaymentConfigResponse) => {
    if (item.isDefault) return;
    setList((p) => p.map((x) => ({ ...x, isDefault: x.id === item.id })));
    const res = await StorePaymentConfigService.setDefault(item.id, branchId);
    if (res.code !== 0) {
      // Rollback
      fetchList();
      showToast(res.message ?? "Không thể đặt mặc định", "error");
    }
  };

  const confirmDelete = (item: IStorePaymentConfigResponse) => {
    setContentDialog({
      color: "error", isCentered: true, isLoading: true,
      title: <>Xóa phương thức thanh toán</>,
      message: <>Bạn có chắc muốn xóa <strong>{item.displayName}</strong> khỏi cửa hàng?</>,
      cancelText: "Hủy", cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: async () => {
        const res = await StorePaymentConfigService.delete(item.id);
        if (res.code === 0) { showToast("Đã xóa", "success"); fetchList(); }
        else showToast(res.message ?? "Có lỗi xảy ra", "error");
        setShowDialog(false); setContentDialog(null);
      },
    });
    setShowDialog(true);
  };

  const titleActions: ITitleActions = {
    actions: [{ title: "Thêm mới", callback: () => { setEditData(null); setShowModal(true); } }],
  };

  return (
    <div className="page-content page-payment-method">
      <HeaderTabMenu
        title="Lựa chọn" titleBack="Phương thức thanh toán"
        onBackProps={onBackProps} titleActions={titleActions}
      />

      {isLoading ? <Loading /> : list.length === 0 ? (
        <SystemNotification
          type="no-item"
          description={
            <span>Chưa có phương thức thanh toán nào được kích hoạt.<br />
              Thêm mới để bắt đầu nhận thanh toán!</span>
          }
          titleButton="Thêm phương thức thanh toán"
          action={() => { setEditData(null); setShowModal(true); }}
        />
      ) : (
        <div className="payment-grid-container">
          {list.sort((a, b) => a.position - b.position).map((item) => {
            const partner = item.template?.partner ?? "OTHER";
            const meta = PARTNER_META[partner] ?? PARTNER_META.OTHER;

            // Các dòng thông tin hiển thị trên card tuỳ theo partner
            const infoRows: { label: string; val: string }[] = [
              item.bankName ? { label: "Ngân hàng", val: item.bankName } : null,
              item.accountNumber ? { label: "Số tài khoản", val: maskAccount(item.accountNumber) } : null,
              item.accountHolderName ? { label: "Chủ tài khoản", val: item.accountHolderName } : null,
              item.partnerCode ? { label: "Partner code", val: item.partnerCode } : null,
              item.apiKey ? { label: "API Key", val: item.apiKey /* đã masked từ BE */ } : null,
              item.paymentTimeout ? { label: "Timeout", val: `${item.paymentTimeout} phút` } : null,
            ].filter(Boolean) as { label: string; val: string }[];

            return (
              <div
                key={item.id}
                className={`payment-card-item${item.isActive ? "" : " payment-card-item--off"}`}
              >
                {/* ── Header ── */}
                <div className="card-main-info">
                  <div className="icon-box" style={{ background: meta.color + "18" }}>
                    {item.template?.logoUrl
                      ? <img src={item.template.logoUrl} alt="" style={{ width: 26, height: 26, objectFit: "contain" }} />
                      : <span style={{ fontSize: 24 }}>{meta.icon}</span>}
                  </div>
                  <div className="info-text">
                    <span className="name">{item.displayName}</span>
                    <div className="badges">
                      <span className="badge-partner" style={{ background: meta.color + "18", color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className={`badge-type ${item.template?.processType === "AUTO" ? "auto" : "manual"}`}>
                        {item.template?.processType === "AUTO" ? "⚡ Tự động" : "👆 Thủ công"}
                      </span>
                      {item.isDefault && <span className="badge-default">⭐ Mặc định</span>}
                    </div>
                  </div>
                </div>

                {/* ── Chi tiết cấu hình ── */}
                {infoRows.length > 0 && (
                  <div className="card-config">
                    {infoRows.map((r) => (
                      <div key={r.label} className="config-row">
                        <span className="config-label">{r.label}</span>
                        <span className="config-val">{r.val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Footer actions ── */}
                <div className="card-actions">
                  <div className="switch-group">
                    <input
                      type="checkbox" className="base-switch"
                      checked={item.isActive}
                      onChange={() => handleToggle(item)}
                    />
                    {!item.isDefault && item.isActive && (
                      <button className="btn-default" onClick={() => handleSetDefault(item)}>
                        Đặt mặc định
                      </button>
                    )}
                  </div>
                  <div className="btn-group">
                    <button className="icon-btn" title="Cấu hình"
                      onClick={() => { setEditData(item); setShowModal(true); }}>
                      ✏️
                    </button>
                    <button className="icon-btn icon-btn--del" title="Xóa"
                      onClick={() => confirmDelete(item)}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ModalPaymentMethod
        open={showModal} data={editData} branchId={branchId}
        onClose={(reload) => { setShowModal(false); if (reload) fetchList(); }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}