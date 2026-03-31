import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import urls from "configs/urls";
import { QRCodeCanvas } from "qrcode.react";
import QrCodeProService from "@/services/QrCodeProService";
import {
  FinanceBadge,
  FinancePageShell,
  FinanceStatCard,
  formatCurrency,
  formatDate,
} from "../shared";
import DebtManagementService, {
  IDebtItem,
  IDebtSummary,
} from "services/DebtManagementService";
import "./index.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

type DebtKindFilter = "all" | "receivable" | "payable" | "overdue";

interface FilterOption {
  value: DebtKindFilter;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: "all",        label: "Tất cả" },
  { value: "receivable", label: "Phải thu (KH)" },
  { value: "payable",    label: "Phải trả (NCC)" },
  { value: "overdue",    label: "Quá hạn" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysLabel(daysRemaining: number | undefined): {
  text: string;
  className: string;
} {
  if (daysRemaining === undefined || daysRemaining === null) {
    return { text: "—", className: "" };
  }
  if (daysRemaining < 0) {
    return {
      text: `Quá ${Math.abs(daysRemaining)} ngày`,
      className: "debt-days--overdue",
    };
  }
  if (daysRemaining === 0) {
    return { text: "Hôm nay", className: "debt-days--today" };
  }
  if (daysRemaining <= 10) {
    return {
      text: `Còn ${daysRemaining} ngày`,
      className: "debt-days--warning",
    };
  }
  return {
    text: `Còn ${daysRemaining} ngày`,
    className: "debt-days--ok",
  };
}

function getStatusBadge(status: string): { label: string; tone: "success" | "danger" | "warning" | "neutral" } {
  switch (status) {
    case "overdue":  return { label: "Quá hạn",       tone: "danger" };
    case "upcoming": return { label: "Sắp đến hạn",   tone: "warning" };
    case "paid":     return { label: "Đã thanh toán", tone: "success" };
    default:         return { label: "Còn hạn",       tone: "neutral" };
  }
}

// ─── QR Modal ─────────────────────────────────────────────────────────────────

interface QRModalProps {
  debt: IDebtItem;
  onClose: () => void;
  onPaid: (id: number) => void;
}

function QRModal({ debt, onClose, onPaid }: QRModalProps) {
  const [paying, setPaying]     = useState(false);
  const [paid, setPaid]         = useState(false);
  const [qrCode, setQrCode]     = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError]   = useState(false);

  // Gọi VietQR giống POS khi modal mở
  useEffect(() => {
    let cancelled = false;
    setQrLoading(true);
    setQrError(false);
    QrCodeProService.generate({
      content: "THU NO " + debt.id,
      orderId: debt.id,
      amount:  debt.amount,
    }).then((res) => {
      if (cancelled) return;
      if (res.code === 0 && res?.result?.qrCode) {
        setQrCode(res.result.qrCode);
      } else {
        setQrError(true);
      }
    }).catch(() => {
      if (!cancelled) setQrError(true);
    }).finally(() => {
      if (!cancelled) setQrLoading(false);
    });
    return () => { cancelled = true; };
  }, [debt.id, debt.amount]);

  async function handleMarkPaid() {
    setPaying(true);
    try {
      await DebtManagementService.markPaid(debt.id);
      setPaid(true);
      setTimeout(() => {
        onPaid(debt.id);
        onClose();
      }, 1200);
    } catch {
      // ignore
    } finally {
      setPaying(false);
    }
  }

  return (
    <div
      className="finance-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="finance-modal__content debt-qr-modal">
        <div className="finance-panel__title">
          <h3>QR Thu nợ</h3>
          <button type="button" className="fund-close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>

        <div className="finance-summary-list">
          <div className="finance-summary-list__item">
            <span>Đối tượng</span>
            <strong>{debt.name}</strong>
          </div>
          <div className="finance-summary-list__item">
            <span>Số tiền còn nợ</span>
            <strong className="debt-amount-highlight">{formatCurrency(debt.amount)}</strong>
          </div>
          <div className="finance-summary-list__item">
            <span>Hạn thanh toán</span>
            <strong>{formatDate(debt.dueDate)}</strong>
          </div>
        </div>

        <div className="debt-qr-box">
          <p className="debt-qr-label">Quét mã QR để thanh toán</p>

          {qrLoading && (
            <div className="debt-qr-loading">Đang tạo mã QR...</div>
          )}

          {!qrLoading && qrError && (
            <div className="debt-qr-error">
              Không tạo được mã QR.<br />Vui lòng thử lại.
            </div>
          )}

          {!qrLoading && !qrError && qrCode && (
            <div className="debt-qr-canvas">
              <QRCodeCanvas
                value={qrCode}
                size={200}
                level="M"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          )}

          <p className="debt-qr-amount">{formatCurrency(debt.amount)}</p>
        </div>

        {paid ? (
          <p className="debt-paid-msg">✓ Đã ghi nhận thanh toán thành công!</p>
        ) : (
          <div className="finance-inline-actions">
            <button className="finance-action-btn finance-action-btn--primary">
              Chia sẻ mã QR
            </button>
            <button
              className="finance-action-btn finance-action-btn--success"
              onClick={handleMarkPaid}
              disabled={paying}
            >
              {paying ? "Đang xử lý..." : "Xác nhận đã thu tiền"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinanceDebtManagement() {
  document.title = "Quản lý công nợ";
  const navigate = useNavigate();

  const [filter, setFilter] = useState<DebtKindFilter>("all");
  const [debts, setDebts] = useState<IDebtItem[]>([]);
  const [summary, setSummary] = useState<IDebtSummary>({
    totalReceivable: 0,
    totalPayable: 0,
    totalCounterparty: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState<IDebtItem | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async (kindFilter: DebtKindFilter) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await DebtManagementService.list(
        { kind: kindFilter === "all" ? undefined : kindFilter },
        ctrl.signal
      );
      setDebts(res.items ?? []);
      if (res.summary) setSummary(res.summary);
    } catch {
      // ignore abort
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(filter);
    return () => abortRef.current?.abort();
  }, [filter, loadData]);

  function handlePaid(id: number) {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "paid" } : d))
    );
    loadData(filter); // reload summary
  }

  const visibleDebts = debts.filter((d) => d.status !== "paid");

  return (
    <FinancePageShell title="Quản lý công nợ">
      {/* ── Header ── */}
      <div className="finance-screen-header">
        <h1>Quản lý công nợ</h1>
        <button
          className="finance-action-btn finance-action-btn--primary"
          onClick={() => navigate(urls.finance_management_debt_transaction)}
        >
          + Tạo giao dịch nợ
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="finance-grid">
        <div className="finance-grid__span-4">
          <FinanceStatCard
            label="Tổng nợ phải thu"
            value={formatCurrency(summary.totalReceivable)}
            tone="success"
          />
        </div>
        <div className="finance-grid__span-4">
          <FinanceStatCard
            label="Tổng nợ phải trả"
            value={formatCurrency(summary.totalPayable)}
            tone="danger"
          />
        </div>
        <div className="finance-grid__span-4">
          <FinanceStatCard
            label="Số đối tượng còn nợ"
            value={String(summary.totalCounterparty)}
            tone="warning"
          />
        </div>

        {/* ── Table section ── */}
        <div className="finance-grid__span-12">
          <section className="finance-panel">
            {/* Filter toolbar */}
            <div className="debt-filter-row">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as DebtKindFilter)}
                className="finance-filter-select"
                aria-label="Lọc công nợ"
              >
                {FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="debt-record-count">
                {visibleDebts.length} bản ghi
              </span>
            </div>

            {/* Table */}
            {loading ? (
              <div className="debt-loading">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="debt-skeleton-row" />
                ))}
              </div>
            ) : visibleDebts.length === 0 ? (
              <div className="debt-empty">
                <p>Không có công nợ nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <table className="finance-table debt-table">
                <thead>
                  <tr>
                    <th>Đối tượng</th>
                    <th>Loại</th>
                    <th>Số nợ</th>
                    <th>Hạn thanh toán</th>
                    <th>Thời hạn nợ</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDebts.map((item) => {
                    const badge = getStatusBadge(item.status);
                    const days = getDaysLabel(item.daysRemaining);
                    return (
                      <tr key={item.id}>
                        <td className="debt-name">{item.name}</td>
                        <td className="debt-kind">
                          {item.kind === "receivable" ? "Phải thu" : "Phải trả"}
                        </td>
                        <td className="debt-amount">{formatCurrency(item.amount)}</td>
                        <td className="debt-due">{formatDate(item.dueDate)}</td>
                        <td>
                          <span className={`debt-days ${days.className}`}>
                            {days.text}
                          </span>
                        </td>
                        <td>
                          <FinanceBadge tone={badge.tone}>
                            {badge.label}
                          </FinanceBadge>
                        </td>
                        <td>
                          {item.kind === "receivable" ? (
                            <button
                              className="finance-action-btn finance-action-btn--success-sm"
                              onClick={() => setSelectedDebt(item)}
                            >
                              QR Thu nợ
                            </button>
                          ) : (
                            <button
                              className="finance-action-btn finance-action-btn--outline"
                              onClick={() =>
                                navigate(urls.finance_management_debt_transaction)
                              }
                            >
                              Thanh toán
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>

      {/* ── QR Modal ── */}
      {selectedDebt && (
        <QRModal
          debt={selectedDebt}
          onClose={() => setSelectedDebt(null)}
          onPaid={handlePaid}
        />
      )}
    </FinancePageShell>
  );
}