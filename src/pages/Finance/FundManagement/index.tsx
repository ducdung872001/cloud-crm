import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "components/button/button";
import {
  FinanceLoadMoreIndicator,
  FinancePageShell,
  FinanceStatCard,
  formatCurrency,
} from "../shared";
import FundManagementService, {
  IFundDetailResponse,
  IFundHistoryItem,
  IFundListItem,
  IFundSaveRequest,
} from "services/FundManagementService";
import "./index.scss";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDisplayTime(value?: string | null): string {
  if (!value) return "—";
  // backend trả dạng "1/3/2026 08:15" → hiển thị thẳng
  return value;
}

function parseVnd(raw: string): number {
  return Number(raw.replace(/\D/g, "") || "0");
}

function formatVndInput(raw: string): string {
  const num = Number(raw.replace(/\D/g, ""));
  return num > 0 ? new Intl.NumberFormat("vi-VN").format(num) : "";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface FundListRowProps {
  fund: IFundListItem;
  isSelected: boolean;
  onClick: (id: number) => void;
}

function FundListRow({ fund, isSelected, onClick }: FundListRowProps) {
  return (
    <button
      type="button"
      className={`finance-list__item finance-fund-list__item${isSelected ? " is-selected" : ""}`}
      onClick={() => onClick(fund.id)}
    >
      <div className="finance-fund-list__primary">
        <strong>{fund.name}</strong>
        <span className="finance-fund-list__meta-sub">
          {fund.typeLabel} · Cập nhật {formatDisplayTime(fund.updatedTime)}
        </span>
      </div>
      <div className="finance-fund-list__secondary">
        <div className="finance-fund-list__amount">{formatCurrency(fund.balance)}</div>
      </div>
    </button>
  );
}

// ─── Fund Detail Panel ────────────────────────────────────────────────────────

interface FundDetailPanelProps {
  detail: IFundDetailResponse;
  onClose: () => void;
  onEdit: (detail: IFundDetailResponse) => void;
  onViewHistory: (detail: IFundDetailResponse) => void;
}

function FundDetailPanel({ detail, onClose, onEdit, onViewHistory }: FundDetailPanelProps) {
  return (
    <section className="finance-panel fund-detail-panel">
      <div className="finance-panel__title">
        <h2>Chi tiết quỹ</h2>
        <button type="button" className="fund-close-btn" onClick={onClose}>
          Đóng
        </button>
      </div>

      <div className="finance-summary-list">
        <div className="finance-summary-list__item">
          <span>Tên quỹ</span>
          <strong>{detail.name}</strong>
        </div>
        <div className="finance-summary-list__item">
          <span>Số dư hiện tại</span>
          <strong className="fund-balance">{formatCurrency(detail.balance)}</strong>
        </div>
        <div className="finance-summary-list__item">
          <span>Cập nhật gần nhất</span>
          <strong>{formatDisplayTime(detail.updatedTime)}</strong>
        </div>
        <div className="finance-summary-list__item">
          <span>Loại quỹ</span>
          <strong>{detail.typeLabel}</strong>
        </div>
        <div className="finance-summary-list__item">
          <span>Số giao dịch liên kết</span>
          <strong>{detail.transactionCount ?? 0}</strong>
        </div>
        {detail.lastTransactionNote && (
          <div className="finance-summary-list__item">
            <span>Giao dịch gần nhất</span>
            <strong className="fund-last-tx">{detail.lastTransactionNote}</strong>
          </div>
        )}
      </div>

      <div className="finance-helper-box fund-quick-facts">
        <strong>Thông tin nhanh</strong>
        <ul>
          {detail.allowReceipt === 1 && <li>✓ Cho phép tạo phiếu thu/chi</li>}
          {detail.allowDebtLink === 1 && <li>✓ Liên kết giao dịch công nợ</li>}
          {detail.supportShift === 1 && <li>✓ Hỗ trợ đối soát ngân hàng</li>}
        </ul>
      </div>

      <div className="finance-inline-actions fund-panel-actions">
        <Button color="secondary" onClick={() => onEdit(detail)}>
          Chỉnh sửa quỹ
        </Button>
        <Button color="transparent" onClick={() => onViewHistory(detail)}>
          Xem lịch sử GD
        </Button>
      </div>
    </section>
  );
}

// ─── Fund Form (Drawer-style slide-in) ────────────────────────────────────────

interface FundFormProps {
  editData?: IFundDetailResponse | null;
  onClose: () => void;
  onSaved: () => void;
}

function FundForm({ editData, onClose, onSaved }: FundFormProps) {
  const isEdit = !!editData?.id;

  const [name, setName] = useState(editData?.name ?? "");
  const [type, setType] = useState<string>(editData?.type ?? "bank");
  const [initialBalance, setInitialBalance] = useState("");
  const [balanceOverride, setBalanceOverride] = useState(
    editData ? String(Math.round(editData.balance ?? 0)) : ""
  );
  const [description, setDescription] = useState(editData?.description ?? "");
  const [allowReceipt, setAllowReceipt] = useState(editData?.allowReceipt ?? 1);
  const [allowDebtLink, setAllowDebtLink] = useState(editData?.allowDebtLink ?? 1);
  const [supportShift, setSupportShift] = useState(editData?.supportShift ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isCashType = type === "cash" || type === "shift_cash";

  async function handleSave() {
    if (!name.trim()) {
      setError("Vui lòng nhập tên quỹ.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const req: IFundSaveRequest = {
        id: isEdit ? editData!.id : undefined,
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        initialBalance: isEdit ? parseVnd(balanceOverride) : parseVnd(initialBalance) || 0,
        allowReceipt,
        allowDebtLink,
        supportShift: isCashType ? supportShift : 0,
      };
      await FundManagementService.save(req);
      onSaved();
    } catch (err: any) {
      setError(err?.message ?? "Có lỗi xảy ra khi lưu quỹ.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fund-form-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fund-form-drawer">
        {/* Header */}
        <div className="fund-form-drawer__header">
          <h3>{isEdit ? "Chỉnh sửa quỹ" : "Thêm quỹ mới"}</h3>
          <button type="button" className="fund-form-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="fund-form-drawer__body">
          {/* Tên quỹ */}
          <div className="fund-form-field">
            <label>
              Tên quỹ <span className="fund-required">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên quỹ"
              className="fund-form-input"
            />
          </div>

          {/* Loại quỹ */}
          <div className="fund-form-field">
            <label>Loại quỹ</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                if (e.target.value === "bank") setSupportShift(0);
              }}
              className="fund-form-input"
            >
              <option value="bank">Tiền gửi ngân hàng</option>
              <option value="cash">Tiền mặt</option>
              <option value="shift_cash">Két ca bán hàng</option>
            </select>
          </div>

          {/* Số dư — hiện cả khi tạo mới lẫn chỉnh sửa */}
          <div className="fund-form-field">
            <label>{isEdit ? "Số dư hiện tại" : "Số dư ban đầu"}</label>
            <div className="fund-form-input-suffix">
              <input
                type="text"
                inputMode="numeric"
                value={isEdit ? formatVndInput(balanceOverride) : formatVndInput(initialBalance)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  isEdit ? setBalanceOverride(raw) : setInitialBalance(raw);
                }}
                placeholder="0"
                className="fund-form-input"
              />
              <span className="fund-form-suffix">VND</span>
            </div>
          </div>

          {/* Mô tả */}
          <div className="fund-form-field">
            <label>Mô tả (tùy chọn)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú về quỹ này..."
              rows={3}
              className="fund-form-input fund-form-textarea"
            />
          </div>

          {/* Tùy chọn nâng cao */}
          <div className="fund-form-options">
            <div className="fund-form-option">
              <input
                id="opt-receipt"
                type="checkbox"
                checked={allowReceipt === 1}
                onChange={(e) => setAllowReceipt(e.target.checked ? 1 : 0)}
              />
              <label htmlFor="opt-receipt">Cho phép tạo phiếu thu/chi</label>
            </div>
            <div className="fund-form-option">
              <input
                id="opt-debt"
                type="checkbox"
                checked={allowDebtLink === 1}
                onChange={(e) => setAllowDebtLink(e.target.checked ? 1 : 0)}
              />
              <label htmlFor="opt-debt">Liên kết giao dịch công nợ</label>
            </div>
            {isCashType && (
              <div className="fund-form-option">
                <input
                  id="opt-shift"
                  type="checkbox"
                  checked={supportShift === 1}
                  onChange={(e) => setSupportShift(e.target.checked ? 1 : 0)}
                />
                <label htmlFor="opt-shift">Hỗ trợ kiểm kê cuối ca</label>
              </div>
            )}
          </div>

          {error && <p className="fund-form-error">{error}</p>}
        </div>

        {/* Footer */}
        <div className="fund-form-drawer__footer">
          <Button color="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu quỹ"}
          </Button>
          <Button color="transparent" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Fund History Modal ───────────────────────────────────────────────────────

interface FundHistoryModalProps {
  fund: IFundDetailResponse;
  onClose: () => void;
}

function FundHistoryModal({ fund, onClose }: FundHistoryModalProps) {
  const [items, setItems] = useState<IFundHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const loadPage = useCallback(
    async (p: number, append = false) => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      if (!append) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await FundManagementService.getHistory(fund.id, p, 20, ctrl.signal);
        const newItems = res.items ?? [];
        setItems((prev) => (append ? [...prev, ...newItems] : newItems));
        setHasMore(newItems.length === 20);
      } catch {
        // ignore abort
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [fund.id]
  );

  useEffect(() => {
    loadPage(0);
    return () => abortRef.current?.abort();
  }, [loadPage]);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (
      !loadingMore &&
      hasMore &&
      el.scrollTop + el.clientHeight >= el.scrollHeight - 60
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPage(nextPage, true);
    }
  }

  return (
    <div className="fund-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fund-modal">

        {/* Header */}
        <div className="fund-modal__header">
          <div>
            <h3 className="fund-modal__title">Lịch sử giao dịch</h3>
            <p className="fund-modal__sub">
              <span className="fund-modal__fund-name">{fund.name}</span>
              <span className="fund-modal__balance">{formatCurrency(fund.balance)}</span>
            </p>
          </div>
          <button type="button" className="fund-form-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="fund-modal__body" onScroll={handleScroll}>
          {loading ? (
            <div className="fund-history-loading">
              <span className="fund-history-spinner" />
              Đang tải dữ liệu...
            </div>
          ) : items.length === 0 ? (
            <div className="fund-history-empty">
              <div className="fund-history-empty__icon">📋</div>
              <p>Chưa có giao dịch nào</p>
              <span>Các phiếu thu/chi ghi nhận vào quỹ này sẽ hiển thị ở đây.</span>
            </div>
          ) : (
            <div className="fund-history-list">
              {items.map((item) => (
                <div key={item.id} className={`fund-history-item fund-history-item--${item.type === 1 ? "income" : "expense"}`}>
                  {/* Left: type indicator + info */}
                  <div className="fund-history-item__left">
                    <div className={`fund-history-item__dot fund-history-item__dot--${item.type === 1 ? "income" : "expense"}`} />
                    <div className="fund-history-item__info">
                      <div className="fund-history-item__note">{item.note || "(Không có nội dung)"}</div>
                      <div className="fund-history-item__meta">
                        <span className={`fund-history-badge fund-history-badge--${item.type === 1 ? "income" : "expense"}`}>
                          {item.type === 1 ? "Thu" : "Chi"}
                        </span>
                        {item.categoryName && (
                          <span className="fund-history-item__category">{item.categoryName}</span>
                        )}
                        {item.empName && (
                          <>
                            <span className="fund-history-item__sep">·</span>
                            <span className="fund-history-item__emp">👤 {item.empName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Right: amount + date */}
                  <div className="fund-history-item__right">
                    <div className={`fund-history-item__amount fund-history-item__amount--${item.type === 1 ? "income" : "expense"}`}>
                      {item.type === 2 ? "−" : "+"}{formatCurrency(item.amount)}
                    </div>
                    <div className="fund-history-item__date">{item.transDate}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {loadingMore && (
            <div className="fund-history-loading">
              <span className="fund-history-spinner" />
              Đang tải thêm...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinanceFundManagement() {
  document.title = "Quản lý quỹ";

  // ── State ──
  const [overview, setOverview] = useState<{
    totalBalance: number;
    activeFundCount: number;
    funds: IFundListItem[];
  } | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const [selectedDetail, setSelectedDetail] = useState<IFundDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<IFundDetailResponse | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [historyFund, setHistoryFund] = useState<IFundDetailResponse | null>(null);

  const abortDetailRef = useRef<AbortController | null>(null);

  // ── Load overview ──
  const loadOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const data = await FundManagementService.getOverview(0);
      setOverview(data);
      // Tự chọn quỹ đầu tiên nếu chưa có selection
      if (!selectedId && data.funds.length > 0) {
        loadFundDetail(data.funds[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoadingOverview(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    loadOverview();
  }, []); // eslint-disable-line

  // ── Load fund detail ──
  async function loadFundDetail(id: number) {
    if (abortDetailRef.current) abortDetailRef.current.abort();
    const ctrl = new AbortController();
    abortDetailRef.current = ctrl;

    setSelectedId(id);
    setLoadingDetail(true);
    try {
      const detail = await FundManagementService.getDetail(id, ctrl.signal);
      setSelectedDetail(detail);
    } catch {
      // ignore abort
    } finally {
      setLoadingDetail(false);
    }
  }

  // ── Handlers ──
  function handleOpenCreate() {
    setEditData(null);
    setShowForm(true);
  }

  function handleEdit(detail: IFundDetailResponse) {
    setEditData(detail);
    setShowForm(true);
  }

  function handleFormSaved() {
    setShowForm(false);
    setEditData(null);
    // Reload overview + detail
    loadOverview();
    if (selectedId) loadFundDetail(selectedId);
  }

  function handleCloseDetail() {
    setSelectedDetail(null);
    setSelectedId(null);
  }

  function handleViewHistory(detail: IFundDetailResponse) {
    setHistoryFund(detail);
    setShowHistory(true);
  }

  // ── Render ──
  const funds = overview?.funds ?? [];
  const totalBalance = overview?.totalBalance ?? 0;
  const activeFundCount = overview?.activeFundCount ?? 0;

  return (
    <FinancePageShell title="Quản lý quỹ">
      {/* ── Header row ── */}
      <div className="finance-screen-header">
        <h1>Quản lý quỹ</h1>
        <button
          className="finance-action-btn finance-action-btn--primary"
          onClick={handleOpenCreate}
        >
          + Thêm quỹ mới
        </button>
      </div>

      {/* ── Summary card ── */}
      <FinanceStatCard
        label="Tổng quỹ toàn hệ thống"
        value={formatCurrency(totalBalance)}
        helper={`${activeFundCount} quỹ đang hoạt động`}
        tone="success"
      />

      {/* ── Main content ── */}
      <div className={`finance-grid${selectedDetail ? "" : ""}`}>
        {/* Fund list */}
        <div className={selectedDetail ? "finance-grid__span-8" : "finance-grid__span-12"}>
          <section className="finance-panel">
            <div className="finance-panel__title">
              <h2>Danh sách quỹ</h2>
              <span>Nhấn vào từng quỹ để xem chi tiết</span>
            </div>

            {loadingOverview && funds.length === 0 ? (
              <div className="fund-list-skeleton">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="fund-skeleton-row" />
                ))}
              </div>
            ) : (
              <div className="finance-fund-list">
                <div className="finance-list">
                  {funds.map((fund) => (
                    <FundListRow
                      key={fund.id}
                      fund={fund}
                      isSelected={selectedId === fund.id}
                      onClick={loadFundDetail}
                    />
                  ))}
                </div>
                {funds.length === 0 && !loadingOverview && (
                  <div className="fund-empty">
                    <p>Chưa có quỹ nào. Nhấn "Thêm quỹ mới" để bắt đầu.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Fund detail panel */}
        {(selectedDetail || loadingDetail) && (
          <div className="finance-grid__span-4">
            {loadingDetail && !selectedDetail ? (
              <section className="finance-panel">
                <div className="fund-detail-loading">Đang tải chi tiết...</div>
              </section>
            ) : selectedDetail ? (
              <FundDetailPanel
                detail={selectedDetail}
                onClose={handleCloseDetail}
                onEdit={handleEdit}
                onViewHistory={handleViewHistory}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* ── Modals / Drawers ── */}
      {showForm && (
        <FundForm
          editData={editData}
          onClose={() => {
            setShowForm(false);
            setEditData(null);
          }}
          onSaved={handleFormSaved}
        />
      )}

      {showHistory && historyFund && (
        <FundHistoryModal
          fund={historyFund}
          onClose={() => {
            setShowHistory(false);
            setHistoryFund(null);
          }}
        />
      )}
    </FinancePageShell>
  );
}