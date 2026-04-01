// Đặt tại: src/pages/SettingPaymentMethod/index.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import Loading from "components/loading";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import { IPaymentMethodTemplate, PARTNER_META } from "model/paymentMethod/PaymentMethodModel";
import { PaymentTemplateService } from "services/PaymentMethodService";
import PaymentTemplateModal from "./partials/PaymentMethodModal";
import "./index.scss";

export default function SettingPaymentMethod({ onBackProps }: { onBackProps?: any }) {
  document.title = "Cài đặt phương thức thanh toán";
  const [permissions] = useState(getPermissions());
  const isMounted = useRef(false);
  const abort     = useRef(new AbortController());
  const [list, setList]         = useState<IPaymentMethodTemplate[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [keyword, setKeyword]   = useState("");
  const [editData, setEditData] = useState<IPaymentMethodTemplate | null>(null);
  const [showModal, setShowModal]         = useState(false);
  const [showDialog, setShowDialog]       = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await PaymentTemplateService.list({ keyword: keyword || undefined }, abort.current.signal);
      if (res.code === 0) setList(res.result ?? []);
      else if (res.code !== 400) showToast(res.message ?? "Có lỗi xảy ra", "error");
    } catch { /* aborted */ }
    finally { setLoading(false); }
  }, [keyword]);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    abort.current.abort();
    abort.current = new AbortController();
    fetchList();
  }, [fetchList]);

  useEffect(() => { fetchList(); }, []);

  const handleToggle = async (item: IPaymentMethodTemplate) => {
    const next = !item.isActive;
    setList((p) => p.map((x) => x.id === item.id ? { ...x, isActive: next } : x));
    const res = await PaymentTemplateService.toggle(item.id, next);
    if (res.code !== 0) {
      setList((p) => p.map((x) => x.id === item.id ? { ...x, isActive: item.isActive } : x));
      showToast(res.message ?? "Không thể thay đổi trạng thái", "error");
    }
  };

  const confirmDelete = (item: IPaymentMethodTemplate) => {
    setContentDialog({
      color: "error", isCentered: true, isLoading: true,
      title: <>Xóa phương thức thanh toán</>,
      message: <>Xóa template <strong>{item.systemName}</strong>? Các cửa hàng đang dùng sẽ bị ảnh hưởng.</>,
      cancelText: "Hủy", cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: async () => {
        const res = await PaymentTemplateService.delete(item.id);
        if (res.code === 0) { showToast("Đã xóa", "success"); fetchList(); }
        else showToast(res.message ?? "Có lỗi", "error");
        setShowDialog(false); setContentDialog(null);
      },
    });
    setShowDialog(true);
  };

  const titleActions = {
    actions: [
      permissions["CATEGORY_SERVICE_ADD"] == 1 && {
        title: "Thêm mới", callback: () => { setEditData(null); setShowModal(true); },
      },
    ],
  };

  const filtered = list.filter((p) =>
    !keyword || p.systemName.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="page-content spm-page">
      <HeaderTabMenu
        title="Cài đặt" titleBack="Phương thức thanh toán"
        onBackProps={onBackProps} titleActions={titleActions}
      />

      <div className="spm-role-notice">
        <span className="spm-role-notice__icon">🔑</span>
        <span>
          Trang này dành cho <strong>Admin hệ thống</strong> — định nghĩa danh sách PTTT
          khả dụng cho tất cả cửa hàng.
        </span>
      </div>

      <div className="spm-search-bar">
        <span className="spm-search-icon">🔍</span>
        <input className="spm-search-input" type="text" placeholder="Tìm kiếm..."
          value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </div>

      {isLoading ? <Loading /> : filtered.length === 0 ? (
        <SystemNotification
          type={list.length === 0 ? "no-item" : "no-result"}
          description={list.length === 0
            ? <span>Chưa có phương thức thanh toán nào. Thêm mới để bắt đầu!</span>
            : <span>Không có kết quả trùng khớp.</span>}
          titleButton={list.length === 0 ? "Thêm phương thức thanh toán" : undefined}
          action={list.length === 0 ? () => { setEditData(null); setShowModal(true); } : undefined}
        />
      ) : (
        <div className="spm-grid">
          {filtered.sort((a, b) => a.position - b.position).map((item) => {
            const meta = PARTNER_META[item.partner] ?? PARTNER_META.OTHER;
            return (
              <div key={item.id} className={`spm-card${item.isActive ? "" : " spm-card--off"}`}>
                <div className="spm-card__head">
                  <div className="spm-card__icon" style={{ background: meta.color + "18" }}>
                    <span>{meta.icon}</span>
                  </div>
                  <div className="spm-card__info">
                    <div className="spm-card__name">{item.systemName}</div>
                    <div className="spm-card__badges">
                      <span className="spm-badge" style={{ background: meta.color + "18", color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className={`spm-badge spm-badge--type ${item.processType === "AUTO" ? "auto" : "manual"}`}>
                        {item.processType === "AUTO" ? "⚡ Tự động" : "👆 Thủ công"}
                      </span>
                      {item.requiresKey && <span className="spm-badge spm-badge--key">🔑 Cần API key</span>}
                    </div>
                  </div>
                  <label className="spm-toggle">
                    <input type="checkbox" checked={item.isActive} onChange={() => handleToggle(item)} />
                    <span className="spm-toggle__track" />
                  </label>
                </div>
                {item.description && <div className="spm-card__desc">{item.description}</div>}
                <div className="spm-card__foot">
                  <span className="spm-card__order">Thứ tự #{item.position}</span>
                  <div className="spm-card__actions">
                    {permissions["CATEGORY_SERVICE_UPDATE"] == 1 && (
                      <button className="spm-btn spm-btn--edit"
                        onClick={() => { setEditData(item); setShowModal(true); }}>✏️ Sửa</button>
                    )}
                    {permissions["CATEGORY_SERVICE_DELETE"] == 1 && (
                      <button className="spm-btn spm-btn--del" onClick={() => confirmDelete(item)}>🗑️</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PaymentTemplateModal
        open={showModal} data={editData}
        onClose={(reload) => { setShowModal(false); if (reload) fetchList(); }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}