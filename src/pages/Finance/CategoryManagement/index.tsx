import React, { useCallback, useEffect, useState } from "react";
import CategoryService from "services/CategoryService";
import {
  FinancePageShell,
  FinanceBadge,
  FinanceEmptyState,
  FinanceSlideOver,
  useFinanceToast,
} from "../shared";
import "./index.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryItem {
  id:       number;
  name:     string;
  type:     number; // 1=thu, 2=chi
  position: number;
  code?:    string;
}

type ActiveTab = 1 | 2;

// ─── Category Slide-over form (tạo mới + chỉnh sửa) ──────────────────────────

interface CategoryFormState {
  name:     string;
  code:     string;
  position: string;
}

const FORM_INIT: CategoryFormState = { name: "", code: "", position: "0" };

interface CategorySlideOverProps {
  open:      boolean;
  type:      1 | 2;
  editItem?: CategoryItem | null;
  onClose:   () => void;
  onSaved:   (item: CategoryItem) => void;
}

function CategorySlideOver({ open, type, editItem, onClose, onSaved }: CategorySlideOverProps) {
  const isEdit = !!editItem;

  const [form,   setForm]   = useState<CategoryFormState>(FORM_INIT);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  // Khởi tạo form khi mở
  useEffect(() => {
    if (!open) return;
    if (editItem) {
      setForm({
        name:     editItem.name,
        code:     editItem.code ?? "",
        position: String(editItem.position ?? 0),
      });
    } else {
      setForm(FORM_INIT);
    }
    setError("");
  }, [open, editItem]);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSave = async () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) { setError("Vui lòng nhập tên khoản mục"); return; }

    setSaving(true);
    setError("");
    try {
      const payload = {
        id:       isEdit ? editItem!.id : 0,
        name:     trimmedName,
        type,
        code:     form.code.trim() || undefined,
        position: parseInt(form.position, 10) || 0,
        bsnId:    0,
      };
      const res = await CategoryService.update(payload as any);
      const ok  = res?.code === 0 || res?.code === 200;
      if (!ok) { setError(res?.message ?? "Lưu thất bại"); return; }

      const created = res?.result ?? res?.data ?? {};
      onSaved({
        id:       isEdit ? editItem!.id : Number(created.id ?? Date.now()),
        name:     trimmedName,
        type,
        code:     form.code.trim() || undefined,
        position: parseInt(form.position, 10) || 0,
      });
    } catch (e: any) {
      setError(e?.message ?? "Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const typeLabel = type === 1 ? "thu" : "chi";

  return (
    <FinanceSlideOver
      open={open}
      title={isEdit ? "Chỉnh sửa khoản mục" : `Thêm khoản mục ${typeLabel}`}
      onClose={handleClose}
      footer={
        <>
          <button
            type="button"
            className="finance-action-btn finance-action-btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <span className="finance-spinner" /> : (isEdit ? "Lưu thay đổi" : "Thêm khoản mục")}
          </button>
          <button
            type="button"
            className="finance-action-btn finance-action-btn--ghost"
            onClick={handleClose}
            disabled={saving}
          >
            Hủy
          </button>
        </>
      }
    >
      <div className="finance-form">

        {/* Loại */}
        <div className="finance-field">
          <label>Loại</label>
          <div>
            <FinanceBadge tone={type === 1 ? "success" : "danger"}>
              {type === 1 ? "Thu tiền" : "Chi tiền"}
            </FinanceBadge>
          </div>
        </div>

        {/* Tên khoản mục */}
        <div className="finance-field">
          <label>
            Tên khoản mục <span style={{ color: "#c54a37" }}>*</span>
          </label>
          <input
            type="text"
            placeholder={`VD: ${type === 1 ? "Thu tiền từ khách hàng" : "Chi phí thuê văn phòng"}`}
            value={form.name}
            autoFocus
            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(""); }}
          />
        </div>

        {/* Mã code */}
        <div className="finance-field">
          <label>Mã code</label>
          <input
            type="text"
            placeholder="VD: CUSTOMER, RENT_FEE, ..."
            value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
          />
          <span className="finance-field__hint">
            Dùng để phân loại tự động theo hệ thống. Để trống nếu không cần.
          </span>
        </div>

        {/* Thứ tự hiển thị */}
        <div className="finance-field">
          <label>Thứ tự hiển thị</label>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={form.position}
            onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
          />
          <span className="finance-field__hint">
            Số nhỏ hơn hiển thị lên trên. Mặc định = 0.
          </span>
        </div>

        {error && (
          <div className="finance-field__error">⚠ {error}</div>
        )}
      </div>
    </FinanceSlideOver>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

interface DeleteConfirmProps {
  item:      CategoryItem;
  onConfirm: () => Promise<void>;
  onCancel:  () => void;
}

function DeleteConfirm({ item, onConfirm, onCancel }: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
    } catch (e: any) {
      setError(e?.message ?? "Xóa thất bại");
      setLoading(false);
    }
  };

  return (
    <div className="catmgmt-modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="catmgmt-modal">
        <h3 className="catmgmt-modal__title">Xác nhận xóa</h3>
        <p className="catmgmt-modal__body">
          Bạn có chắc muốn xóa khoản mục <strong>"{item.name}"</strong>?
          <br />
          <span className="catmgmt-modal__warn">
            Hành động này không thể hoàn tác. Các phiếu thu/chi đã dùng khoản mục này sẽ không bị ảnh hưởng.
          </span>
        </p>
        {error && <div className="catmgmt-modal__error">⚠ {error}</div>}
        <div className="catmgmt-modal__footer">
          <button
            type="button"
            className="catmgmt-btn catmgmt-btn--delete"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <span className="finance-spinner finance-spinner--sm" /> : "Xóa khoản mục"}
          </button>
          <button
            type="button"
            className="catmgmt-btn catmgmt-btn--cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FinanceCategoryManagement() {
  document.title = "Quản lý khoản mục";

  const [categories,   setCategories]   = useState<CategoryItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState<ActiveTab>(1);
  const [slideOpen,    setSlideOpen]    = useState(false);
  const [editItem,     setEditItem]     = useState<CategoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);

  const { toast, ToastNode } = useFinanceToast();

  // ── Load danh sách ──────────────────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await CategoryService.list({ page: 1, limit: 500 } as any);
      const raw = res?.result?.content ?? res?.result ?? res?.data?.content ?? res?.data ?? [];
      setCategories(
        (Array.isArray(raw) ? raw : []).map((c: any) => ({
          id:       Number(c.id),
          name:     String(c.name ?? ""),
          type:     Number(c.type ?? 1),
          position: Number(c.position ?? 0),
          code:     c.code ?? undefined,
        }))
      );
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleOpenCreate = () => { setEditItem(null); setSlideOpen(true); };
  const handleOpenEdit   = (item: CategoryItem) => { setEditItem(item); setSlideOpen(true); };

  const handleSaved = useCallback((saved: CategoryItem) => {
    const isNew = !editItem;
    setCategories(prev => {
      const exists = prev.find(c => c.id === saved.id);
      return exists ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved];
    });
    setSlideOpen(false);
    setEditItem(null);
    toast(isNew ? `✓ Đã tạo khoản mục "${saved.name}"` : `✓ Đã cập nhật "${saved.name}"`);
  }, [editItem, toast]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const res = await CategoryService.delete(deleteTarget.id);
    const ok  = res?.code === 0 || res?.code === 200;
    if (!ok) throw new Error(res?.message ?? "Xóa thất bại");
    setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
    toast(`✓ Đã xóa khoản mục "${deleteTarget.name}"`);
    setDeleteTarget(null);
  }, [deleteTarget, toast]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const displayed = categories
    .filter(c => c.type === activeTab)
    .sort((a, b) => a.position - b.position || a.id - b.id);

  const incomeCount  = categories.filter(c => c.type === 1).length;
  const expenseCount = categories.filter(c => c.type === 2).length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <FinancePageShell title="Quản lý khoản mục">
      {ToastNode}

      {/* Header */}
      <div className="finance-screen-header">
        <div>
          <h1>Quản lý khoản mục</h1>
          <p className="catmgmt-subtitle">
            Danh mục thu/chi dùng để phân loại phiếu trong Sổ thu chi
          </p>
        </div>
        <button
          className="finance-action-btn finance-action-btn--primary"
          onClick={handleOpenCreate}
        >
          + Thêm khoản mục
        </button>
      </div>

      {/* Tabs */}
      <div className="catmgmt-tabs">
        <button
          className={`catmgmt-tab${activeTab === 1 ? " catmgmt-tab--active catmgmt-tab--income" : ""}`}
          onClick={() => setActiveTab(1)}
        >
          Thu tiền
          <span className="catmgmt-tab__count">{incomeCount}</span>
        </button>
        <button
          className={`catmgmt-tab${activeTab === 2 ? " catmgmt-tab--active catmgmt-tab--expense" : ""}`}
          onClick={() => setActiveTab(2)}
        >
          Chi tiền
          <span className="catmgmt-tab__count">{expenseCount}</span>
        </button>
      </div>

      {/* List */}
      <section className="finance-panel catmgmt-panel">
        {loading ? (
          <div className="catmgmt-loading">
            <span className="finance-spinner" />
            <span>Đang tải danh sách...</span>
          </div>
        ) : displayed.length === 0 ? (
          <FinanceEmptyState
            title={`Chưa có khoản mục ${activeTab === 1 ? "thu" : "chi"}`}
            description='Nhấn "+ Thêm khoản mục" để tạo mới.'
          />
        ) : (
          <div className="catmgmt-list">
            {displayed.map(item => (
              <div key={item.id} className="catmgmt-row">
                <div className="catmgmt-row__info">
                  <span className="catmgmt-row__label">{item.name}</span>
                  <div className="catmgmt-row__meta">
                    {item.code && (
                      <span className="catmgmt-row__code">{item.code}</span>
                    )}
                    <span className="catmgmt-row__position">Thứ tự: {item.position}</span>
                  </div>
                </div>
                <div className="catmgmt-row__actions">
                  <FinanceBadge tone={activeTab === 1 ? "success" : "danger"}>
                    {activeTab === 1 ? "Thu" : "Chi"}
                  </FinanceBadge>
                  <button
                    type="button"
                    className="catmgmt-btn catmgmt-btn--edit"
                    onClick={() => handleOpenEdit(item)}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="catmgmt-btn catmgmt-btn--delete"
                    onClick={() => setDeleteTarget(item)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Slide-over form */}
      <CategorySlideOver
        open={slideOpen}
        type={activeTab}
        editItem={editItem}
        onClose={() => { setSlideOpen(false); setEditItem(null); }}
        onSaved={handleSaved}
      />

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteConfirm
          item={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </FinancePageShell>
  );
}