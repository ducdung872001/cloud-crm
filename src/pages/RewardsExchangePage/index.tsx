// =============================================================================
// FILE: src/pages/RewardsExchangePage/index.tsx
// Phần thưởng & Đổi điểm — ghép API thật, thay thế mock data
// =============================================================================

import React, { useState, useEffect, useCallback, useRef, Fragment } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import { ITitleActions } from "components/titleAction/titleAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Icon from "components/icon";
import { showToast } from "utils/common";
import LoyaltyService from "@/services/LoyaltyService";
import { ILoyaltyRewardRequest } from "@/model/loyalty/RoyaltyRequest";
import "./index.scss";

// ── Constants ─────────────────────────────────────────────────────────────
const REWARD_TYPES = ["Voucher", "Dịch vụ", "Quà tặng", "Hạng TV"];

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  "Voucher":    { bg: "#FEF3C7", color: "#92400E" },
  "Dịch vụ":   { bg: "#E6F1FB", color: "#1D4ED8" },
  "Quà tặng":  { bg: "#FCE7F3", color: "#9D174D" },
  "Hạng TV":   { bg: "#EDE9FE", color: "#5B21B6" },
};

const EMPTY_FORM: ILoyaltyRewardRequest = {
  name: "",
  rewardType: "Voucher",
  pointsRequired: undefined,
  totalLimit: undefined,
  expiryDate: "",
  description: "",
  status: 1,
};

// ── Detail Modal ───────────────────────────────────────────────────────────
function RewardDetailModal({ reward, onClose }: { reward: ILoyaltyRewardRequest | null; onClose: () => void }) {
  if (!reward) return null;
  const cfg = TYPE_COLORS[reward.rewardType] || { bg: "#F3F4F6", color: "#374151" };
  const used = reward.usedCount ?? 0;
  const total = reward.totalLimit ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return (
    <div className="rew-overlay" onClick={onClose}>
      <div className="rew-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="rew-detail-modal__header">
          <div>
            <span className="rew-type-badge" style={{ background: cfg.bg, color: cfg.color }}>
              {reward.rewardType ?? "—"}
            </span>
            <h3 className="rew-detail-modal__name">{reward.name}</h3>
          </div>
          <button className="rew-close-btn" onClick={onClose}><Icon name="Times" /></button>
        </div>

        <div className="rew-detail-modal__body">
          <div className="rew-detail-grid">
            <div className="rew-detail-item">
              <span className="rew-detail-label">Điểm cần đổi</span>
              <span className="rew-detail-value rew-detail-value--points">
                {(reward.pointsRequired ?? 0).toLocaleString("vi-VN")} điểm
              </span>
            </div>
            <div className="rew-detail-item">
              <span className="rew-detail-label">Trạng thái</span>
              <span className={`rew-status-badge rew-status-badge--${reward.status === 1 ? "active" : "inactive"}`}>
                {reward.status === 1 ? "Đang hoạt động" : "Tạm dừng"}
              </span>
            </div>
            <div className="rew-detail-item">
              <span className="rew-detail-label">Hạn sử dụng</span>
              <span className="rew-detail-value">
                {reward.expiryDate ? new Date(reward.expiryDate).toLocaleDateString("vi-VN") : "Không giới hạn"}
              </span>
            </div>
            <div className="rew-detail-item">
              <span className="rew-detail-label">Tạo lúc</span>
              <span className="rew-detail-value">
                {reward.createdAt ? new Date(reward.createdAt).toLocaleDateString("vi-VN") : "—"}
              </span>
            </div>
          </div>

          {total > 0 && (
            <div className="rew-detail-progress">
              <div className="rew-detail-progress__header">
                <span>Đã đổi: <strong>{used.toLocaleString("vi-VN")}</strong> / {total.toLocaleString("vi-VN")}</span>
                <span className="rew-detail-progress__pct">{pct}%</span>
              </div>
              <div className="rew-progress-bar">
                <div className="rew-progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {reward.description && (
            <div className="rew-detail-desc">
              <p className="rew-detail-label">Mô tả</p>
              <p className="rew-detail-desc__text">{reward.description}</p>
            </div>
          )}
        </div>

        <div className="rew-detail-modal__footer">
          <button className="rew-btn rew-btn--secondary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ── Form Thêm/Sửa ─────────────────────────────────────────────────────────
function RewardForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial: ILoyaltyRewardRequest;
  onSave: (v: ILoyaltyRewardRequest) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ILoyaltyRewardRequest>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setForm(initial); setErrors({}); }, [initial]);

  const set = (k: keyof ILoyaltyRewardRequest, v: any) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim())        e.name = "Tên phần thưởng không được để trống";
    if (!form.pointsRequired)      e.pointsRequired = "Điểm cần đổi không được để trống";
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave(form);
  };

  const isEdit = !!initial.id;

  return (
    <div className="rew-form-card">
      <div className="rew-form-card__title">
        <Icon name={isEdit ? "Pencil" : "Plus"} style={{ width: 16 }} />
        {isEdit ? "Chỉnh sửa phần thưởng" : "Thêm phần thưởng mới"}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rew-form-grid">
          {/* Tên */}
          <div className={`rew-field rew-field--wide${errors.name ? " rew-field--error" : ""}`}>
            <label>Tên phần thưởng <span className="rew-required">*</span></label>
            <input type="text" value={form.name ?? ""}
              placeholder="VD: Voucher 50.000đ"
              onChange={e => set("name", e.target.value)} />
            {errors.name && <p className="rew-error-msg">{errors.name}</p>}
          </div>

          {/* Điểm + Loại */}
          <div className={`rew-field${errors.pointsRequired ? " rew-field--error" : ""}`}>
            <label>Điểm cần đổi <span className="rew-required">*</span></label>
            <input type="number" min={1} value={form.pointsRequired ?? ""}
              placeholder="VD: 500"
              onChange={e => set("pointsRequired", e.target.value ? Number(e.target.value) : undefined)} />
            {errors.pointsRequired && <p className="rew-error-msg">{errors.pointsRequired}</p>}
          </div>

          <div className="rew-field">
            <label>Loại</label>
            <select value={form.rewardType ?? "Voucher"} onChange={e => set("rewardType", e.target.value)}>
              {REWARD_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Giới hạn + HSD */}
          <div className="rew-field">
            <label>Giới hạn số lượng</label>
            <input type="number" min={1} value={form.totalLimit ?? ""}
              placeholder="Để trống = không giới hạn"
              onChange={e => set("totalLimit", e.target.value ? Number(e.target.value) : undefined)} />
          </div>

          <div className="rew-field">
            <label>Ngày hết hạn</label>
            <input type="date" value={form.expiryDate ?? ""}
              onChange={e => set("expiryDate", e.target.value)} />
          </div>

          {/* Mô tả */}
          <div className="rew-field rew-field--wide">
            <label>Mô tả</label>
            <textarea rows={2} value={form.description ?? ""}
              placeholder="Mô tả chi tiết phần thưởng..."
              onChange={e => set("description", e.target.value)} />
          </div>
        </div>

        <div className="rew-form-actions">
          <button type="button" className="rew-btn rew-btn--secondary" onClick={onCancel} disabled={isSaving}>
            Hủy
          </button>
          <button type="submit" className="rew-btn rew-btn--primary" disabled={isSaving}>
            {isSaving ? <><Icon name="Loading" style={{ width: 16 }} /> Đang lưu...</> : (isEdit ? "Cập nhật" : "Lưu phần thưởng")}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Reward Card ────────────────────────────────────────────────────────────
function RewardCard({
  reward,
  onEdit,
  onDelete,
  onViewDetail,
}: {
  reward: ILoyaltyRewardRequest;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetail: () => void;
}) {
  const cfg = TYPE_COLORS[reward.rewardType] || { bg: "#F3F4F6", color: "#374151" };
  const used = reward.usedCount ?? 0;
  const total = reward.totalLimit ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const isExpired = reward.expiryDate ? new Date(reward.expiryDate) < new Date() : false;

  return (
    <div className={`rew-card${isExpired ? " rew-card--expired" : ""}`}>
      {isExpired && <div className="rew-card__expired-badge">Hết hạn</div>}

      <div className="rew-card__header">
        <span className="rew-type-badge" style={{ background: cfg.bg, color: cfg.color }}>
          {reward.rewardType ?? "—"}
        </span>
        <span className="rew-card__points">
          {(reward.pointsRequired ?? 0).toLocaleString("vi-VN")}
          <span className="rew-card__points-unit"> điểm</span>
        </span>
      </div>

      <div className="rew-card__name">{reward.name}</div>

      {total > 0 ? (
        <div className="rew-card__progress">
          <div className="rew-progress-bar">
            <div className="rew-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="rew-card__progress-text">
            Đã đổi: {used.toLocaleString("vi-VN")}/{total.toLocaleString("vi-VN")} ({pct}%)
          </span>
        </div>
      ) : (
        <div className="rew-card__progress">
          <span className="rew-card__progress-text rew-card__progress-text--unlimited">
            {used > 0 ? `Đã đổi: ${used.toLocaleString("vi-VN")} lần` : "Không giới hạn"}
          </span>
        </div>
      )}

      {reward.expiryDate && (
        <div className={`rew-card__expiry${isExpired ? " rew-card__expiry--expired" : ""}`}>
          {isExpired ? "⚠ " : ""}HSD: {new Date(reward.expiryDate).toLocaleDateString("vi-VN")}
        </div>
      )}

      <div className="rew-card__status">
        <span className={`rew-status-badge rew-status-badge--${reward.status === 1 ? "active" : "inactive"}`}>
          {reward.status === 1 ? "Đang hoạt động" : "Tạm dừng"}
        </span>
      </div>

      <div className="rew-card__actions">
        <button className="rew-btn rew-btn--secondary rew-btn--sm" onClick={onEdit}>
          <Icon name="Pencil" style={{ width: 13 }} /> Chỉnh sửa
        </button>
        <button className="rew-btn rew-btn--primary rew-btn--sm" onClick={onViewDetail}>
          <Icon name="Eye" style={{ width: 13 }} /> Chi tiết
        </button>
        <button className="rew-btn rew-btn--danger rew-btn--sm rew-btn--icon" onClick={onDelete} title="Xóa">
          <Icon name="Trash" style={{ width: 13 }} />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function RewardsExchangePage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Phần thưởng & Đổi điểm";

  const [list, setList]           = useState<ILoyaltyRewardRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editData, setEditData]   = useState<ILoyaltyRewardRequest>(EMPTY_FORM);
  const [isSaving, setIsSaving]   = useState(false);
  const [detailItem, setDetailItem] = useState<ILoyaltyRewardRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [keyword, setKeyword]     = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch list ──────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    try {
      const res = await LoyaltyService.listLoyaltyReward(
        { keyword, limit: 50, page: 1 },
        abortRef.current.signal
      );
      if (res?.code === 0) {
        setList(res.result?.items ?? []);
      } else {
        showToast(res?.message ?? "Không thể tải danh sách phần thưởng", "error");
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") showToast("Lỗi kết nối", "error");
    } finally {
      setIsLoading(false);
    }
  }, [keyword]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── Stats ───────────────────────────────────────────────────────────────
  const totalUsed    = list.reduce((s, r) => s + (r.usedCount ?? 0), 0);
  const totalPoints  = list.reduce((s, r) => s + ((r.usedCount ?? 0) * (r.pointsRequired ?? 0)), 0);
  const avgPct       = list.length > 0
    ? Math.round(list.filter(r => (r.totalLimit ?? 0) > 0)
        .reduce((s, r) => s + Math.min(100, ((r.usedCount ?? 0) / (r.totalLimit!)) * 100), 0)
      / Math.max(1, list.filter(r => (r.totalLimit ?? 0) > 0).length))
    : 0;

  // ── Save (create / update) ──────────────────────────────────────────────
  const handleSave = async (form: ILoyaltyRewardRequest) => {
    setIsSaving(true);
    try {
      const res = await LoyaltyService.updateLoyaltyReward(form);
      if (res?.code === 0) {
        showToast(`${form.id ? "Cập nhật" : "Thêm"} phần thưởng thành công`, "success");
        setShowForm(false);
        setEditData(EMPTY_FORM);
        fetchList();
      } else {
        showToast(res?.message ?? "Lưu thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const confirmDelete = (item: ILoyaltyRewardRequest) => {
    setContentDialog({
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa phần thưởng</Fragment>,
      message: <Fragment>Bạn có chắc muốn xóa <strong>{item.name}</strong>? Thao tác không thể khôi phục.</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: async () => {
        setShowDialog(false);
        const res = await LoyaltyService.deleteLoyaltyReward(item.id!);
        if (res?.code === 0) {
          showToast("Đã xóa phần thưởng", "success");
          fetchList();
        } else {
          showToast(res?.message ?? "Xóa thất bại", "error");
        }
      },
    });
    setShowDialog(true);
  };

  // ── View detail ─────────────────────────────────────────────────────────
  const handleViewDetail = async (item: ILoyaltyRewardRequest) => {
    // Fetch fresh data từ get API
    try {
      const res = await LoyaltyService.getLoyaltyReward(item.id!);
      if (res?.code === 0) setDetailItem(res.result);
      else setDetailItem(item); // fallback
    } catch {
      setDetailItem(item);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = async (item: ILoyaltyRewardRequest) => {
    try {
      const res = await LoyaltyService.getLoyaltyReward(item.id!);
      setEditData(res?.code === 0 ? res.result : item);
    } catch {
      setEditData(item);
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const titleActions: ITitleActions = {
    actions: [{
      title: "+ Thêm phần thưởng",
      color: "primary",
      callback: () => { setEditData(EMPTY_FORM); setShowForm(true); },
    }],
  };

  return (
    <div className="page-content rew-page">
      <HeaderTabMenu
        title="Phần thưởng & Đổi điểm"
        titleBack="Khách hàng thành viên"
        titleActions={showForm ? undefined : titleActions}
        onBackProps={onBackProps}
      />

      {/* ── Stat cards ── */}
      <div className="promo-stats-grid">
        {[
          { label: "Phần thưởng",      value: list.length.toString(),                      color: "purple" },
          { label: "Đã đổi (tổng)",    value: totalUsed.toLocaleString("vi-VN"),            color: "green"  },
          { label: "Điểm đã tiêu",     value: totalPoints.toLocaleString("vi-VN"),          color: "orange" },
          { label: "Tỷ lệ đổi TB",     value: list.length ? `${avgPct}%` : "—",            color: "blue"   },
        ].map(s => (
          <div key={s.label} className={`promo-stat-card promo-stat-card--${s.color}`}>
            <div className="promo-stat-card__body">
              <div className="promo-stat-card__content">
                <p className="promo-stat-card__label">{s.label}</p>
                <p className="promo-stat-card__value">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Form thêm/sửa ── */}
      {showForm && (
        <RewardForm
          initial={editData}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditData(EMPTY_FORM); }}
          isSaving={isSaving}
        />
      )}

      {/* ── Toolbar ── */}
      <div className="rew-toolbar">
        <div className="rew-search-wrap">
          <Icon name="Search" style={{ width: 16, color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Tìm phần thưởng..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="rew-search-input"
          />
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="rew-loading">
          <Icon name="Loading" style={{ width: 28, height: 28 }} />
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && list.length === 0 && (
        <div className="rew-empty">
          <p>Chưa có phần thưởng nào.</p>
          <button className="rew-btn rew-btn--primary" onClick={() => { setEditData(EMPTY_FORM); setShowForm(true); }}>
            + Thêm phần thưởng đầu tiên
          </button>
        </div>
      )}

      {/* ── Card grid ── */}
      {!isLoading && list.length > 0 && (
        <div className="rew-grid">
          {list.map(r => (
            <RewardCard
              key={r.id}
              reward={r}
              onEdit={() => handleEdit(r)}
              onDelete={() => confirmDelete(r)}
              onViewDetail={() => handleViewDetail(r)}
            />
          ))}
        </div>
      )}

      {/* ── Detail modal ── */}
      {detailItem && (
        <RewardDetailModal reward={detailItem} onClose={() => setDetailItem(null)} />
      )}

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
