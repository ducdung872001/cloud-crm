import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import urls from "configs/urls";
import { urlsApi } from "configs/urls";
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
import { IFundListItem } from "services/FundManagementService";
import { showToast } from "@/utils/common";
import "./index.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

type DebtKindFilter = "all" | "receivable" | "payable" | "overdue";

const FILTER_OPTIONS = [
  { value: "all"         as DebtKindFilter, label: "Tất cả" },
  { value: "receivable"  as DebtKindFilter, label: "Phải thu (KH)" },
  { value: "payable"     as DebtKindFilter, label: "Phải trả (NCC)" },
  { value: "overdue"     as DebtKindFilter, label: "Quá hạn" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysLabel(daysRemaining: number | undefined) {
  if (daysRemaining === undefined || daysRemaining === null)
    return { text: "—", className: "" };
  if (daysRemaining < 0)
    return { text: `Quá ${Math.abs(daysRemaining)} ngày`, className: "debt-days--overdue" };
  if (daysRemaining === 0)
    return { text: "Hôm nay", className: "debt-days--today" };
  if (daysRemaining <= 10)
    return { text: `Còn ${daysRemaining} ngày`, className: "debt-days--warning" };
  return { text: `Còn ${daysRemaining} ngày`, className: "debt-days--ok" };
}

function getStatusBadge(status: string): {
  label: string;
  tone: "success" | "danger" | "warning" | "neutral";
} {
  switch (status) {
    case "overdue":  return { label: "Quá hạn",       tone: "danger"  };
    case "upcoming": return { label: "Sắp đến hạn",   tone: "warning" };
    case "paid":     return { label: "Đã thanh toán", tone: "success" };
    default:         return { label: "Còn hạn",        tone: "neutral" };
  }
}

function parseVnd(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0;
}
function fmtVndInput(n: number): string {
  return n > 0 ? n.toLocaleString("vi") : "";
}

// ─── Share QR ─────────────────────────────────────────────────────────────────

async function shareQrCanvas(
  canvasEl: HTMLCanvasElement | null,
  debtName: string,
  amount: number
) {
  if (!canvasEl) { showToast("Không lấy được ảnh QR", "error"); return; }
  const dataUrl = canvasEl.toDataURL("image/png");

  // Web Share API — hoạt động trên mobile Chrome/Safari + Zalo in-app browser
  if (navigator.share) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "qr-thu-no.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `QR Thu nợ — ${debtName}`,
          text: `Vui lòng quét mã QR để thanh toán ${amount.toLocaleString("vi")} VND`,
          files: [file],
        });
        return;
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return; // user huỷ → không cần báo lỗi
    }
  }
  // Fallback: download ảnh về máy
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `qr-thu-no-${debtName}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("Đã tải ảnh QR về máy. Gửi cho khách qua Zalo/Messenger.", "success");
}

// ─── PayModal — Thu nợ (chọn quỹ + số tiền) ──────────────────────────────────

interface PayModalProps {
  debt: IDebtItem;
  funds: IFundListItem[];
  onClose: () => void;
  onSuccess: (debtId: number, remaining: number) => void;
}

function PayModal({ debt, funds, onClose, onSuccess }: PayModalProps) {
  const [amountStr, setAmountStr]   = useState(fmtVndInput(debt.amount));
  const [amount, setAmount]         = useState(debt.amount);
  const [fundId, setFundId]         = useState<number>(funds[0]?.id ?? 0);
  const [note, setNote]             = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handlePay() {
    if (!fundId)    { showToast("Vui lòng chọn quỹ nhận tiền", "error"); return; }
    if (amount <= 0){ showToast("Số tiền phải lớn hơn 0", "error"); return; }
    if (amount > debt.amount + 0.01) {
      showToast(`Số tiền vượt quá nợ còn lại (${formatCurrency(debt.amount)})`, "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await DebtManagementService.pay({
        debtId: debt.id,
        amount,
        fundId,
        note: note.trim() || undefined,
      });
      const remaining = typeof res === "number" ? res : 0;
      const isFullPaid = remaining <= 0;
      showToast(
        isFullPaid
          ? "✓ Gạch nợ thành công! Đã thu đủ."
          : `✓ Đã thu ${formatCurrency(amount)}. Còn lại: ${formatCurrency(remaining)}`,
        "success"
      );
      onSuccess(debt.id, remaining);
      onClose();
    } catch (e: any) {
      showToast(e?.message ?? "Có lỗi xảy ra khi thu tiền", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="finance-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="finance-modal__content debt-pay-modal">
        <div className="finance-panel__title">
          <h3>Xác nhận thu tiền</h3>
          <button type="button" className="fund-close-btn" onClick={onClose}>Đóng</button>
        </div>

        <div className="finance-summary-list">
          <div className="finance-summary-list__item">
            <span>Đối tượng</span>
            <strong>{debt.name}</strong>
          </div>
          <div className="finance-summary-list__item">
            <span>Còn nợ</span>
            <strong className="debt-amount-highlight">{formatCurrency(debt.amount)}</strong>
          </div>
        </div>

        <div className="debt-pay-form">
          {/* Số tiền */}
          <div className="debt-pay-form__field">
            <label>Số tiền thu lần này</label>
            <div className="debt-pay-form__input-row">
              <input
                type="text"
                className="finance-input"
                value={amountStr}
                onChange={(e) => {
                  const raw = parseVnd(e.target.value);
                  setAmount(raw);
                  setAmountStr(fmtVndInput(raw));
                }}
                placeholder="Nhập số tiền..."
                autoFocus
              />
              <button
                type="button"
                className="debt-pay-form__full-btn"
                onClick={() => {
                  setAmount(debt.amount);
                  setAmountStr(fmtVndInput(debt.amount));
                }}
              >
                Thu đủ
              </button>
            </div>
          </div>

          {/* Quỹ */}
          <div className="debt-pay-form__field">
            <label>Quỹ nhận tiền</label>
            {funds.length === 0 ? (
              <p className="debt-pay-form__no-fund">
                Chưa có quỹ nào. Vui lòng tạo quỹ trong Quản lý quỹ.
              </p>
            ) : (
              <select
                className="finance-filter-select debt-pay-form__select"
                value={fundId}
                onChange={(e) => setFundId(Number(e.target.value))}
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {formatCurrency(f.balance)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ghi chú */}
          <div className="debt-pay-form__field">
            <label>Ghi chú (tuỳ chọn)</label>
            <input
              type="text"
              className="finance-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Khách chuyển khoản qua app ngân hàng..."
            />
          </div>
        </div>

        <div className="debt-modal-actions">
          <button
            type="button"
            className="finance-action-btn finance-action-btn--outline"
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            type="button"
            className="finance-action-btn finance-action-btn--success"
            onClick={handlePay}
            disabled={submitting || funds.length === 0}
          >
            {submitting ? "Đang xử lý..." : "✓ Xác nhận thu tiền"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QRModal ──────────────────────────────────────────────────────────────────

interface QRModalProps {
  debt: IDebtItem;
  funds: IFundListItem[];
  onClose: () => void;
  onPaid: (id: number, remaining: number) => void;
}

function QRModal({ debt, funds, onClose, onPaid }: QRModalProps) {
  const [qrCode, setQrCode]           = useState<string | null>(null);
  const [qrLoading, setQrLoading]     = useState(true);
  const [qrError, setQrError]         = useState(false);
  const [sharing, setSharing]         = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const canvasRef                     = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setQrLoading(true);
    setQrError(false);
    QrCodeProService.generate({
      content: "THU NO " + debt.id,
      orderId: debt.id,
      amount:  debt.amount,
    })
      .then((res) => {
        if (cancelled) return;
        if (res.code === 0 && res?.result?.qrCode) setQrCode(res.result.qrCode);
        else setQrError(true);
      })
      .catch(() => { if (!cancelled) setQrError(true); })
      .finally(() => { if (!cancelled) setQrLoading(false); });
    return () => { cancelled = true; };
  }, [debt.id, debt.amount]);

  // Lấy canvas element thực sau khi QRCodeCanvas render
  const handleQrRef = useCallback((node: any) => {
    if (node) canvasRef.current = node?.canvas ?? node;
  }, []);

  async function handleShare() {
    setSharing(true);
    try {
      // Tìm canvas trong DOM nếu ref chưa capture được
      const canvas =
        canvasRef.current ??
        (document.querySelector(".debt-qr-canvas canvas") as HTMLCanvasElement | null);
      await shareQrCanvas(canvas, debt.name, debt.amount);
    } finally {
      setSharing(false);
    }
  }

  if (showPayModal) {
    return (
      <PayModal
        debt={debt}
        funds={funds}
        onClose={() => setShowPayModal(false)}
        onSuccess={(id, remaining) => {
          onPaid(id, remaining);
          onClose();
        }}
      />
    );
  }

  return (
    <div
      className="finance-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="finance-modal__content debt-qr-modal">
        <div className="finance-panel__title">
          <h3>QR Thu nợ</h3>
          <button type="button" className="fund-close-btn" onClick={onClose}>Đóng</button>
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

          {qrLoading && <div className="debt-qr-loading">Đang tạo mã QR...</div>}
          {!qrLoading && qrError && (
            <div className="debt-qr-error">
              Không tạo được mã QR.<br />Vui lòng thử lại.
            </div>
          )}
          {!qrLoading && !qrError && qrCode && (
            <div className="debt-qr-canvas">
              <QRCodeCanvas
                ref={handleQrRef as any}
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

        {!qrLoading && !qrError && qrCode && (
          <p className="debt-qr-share-hint">
            📲 Chia sẻ qua <b>Zalo</b>, <b>Facebook Messenger</b> hoặc lưu ảnh để gửi cho khách
          </p>
        )}

        <div className="debt-modal-actions">
          <button
            type="button"
            className="finance-action-btn finance-action-btn--primary"
            onClick={handleShare}
            disabled={sharing || qrLoading || qrError}
          >
            {sharing ? "Đang chia sẻ..." : "📤 Chia sẻ mã QR"}
          </button>
          <button
            type="button"
            className="finance-action-btn finance-action-btn--success"
            onClick={() => setShowPayModal(true)}
          >
            ✓ Xác nhận đã thu tiền
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinanceDebtManagement() {
  document.title = "Quản lý công nợ";
  const navigate = useNavigate();

  const [filter, setFilter]             = useState<DebtKindFilter>("all");
  const [debts, setDebts]               = useState<IDebtItem[]>([]);
  const [summary, setSummary]           = useState<IDebtSummary>({
    totalReceivable: 0, totalPayable: 0, totalCounterparty: 0,
  });
  const [loading, setLoading]           = useState(true);
  const [selectedDebt, setSelectedDebt] = useState<IDebtItem | null>(null);
  const [funds, setFunds]               = useState<IFundListItem[]>([]);
  const abortRef                        = useRef<AbortController | null>(null);

  // Load quỹ một lần
  useEffect(() => {
    fetch(urlsApi.fund.overview, { method: "GET" })
      .then((r) => r.json())
      .then((res) => { if (res.code === 0) setFunds(res.result?.funds ?? []); })
      .catch(() => {});
  }, []);

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
    } catch { /* ignore abort */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadData(filter);
    return () => abortRef.current?.abort();
  }, [filter, loadData]);

  // Sau khi thu (1 phần hoặc toàn bộ): cập nhật local state + reload KPI
  function handlePaid(id: number, remaining: number) {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        if (remaining <= 0) return { ...d, status: "paid" as const, amount: 0 };
        return { ...d, amount: remaining };
      })
    );
    loadData(filter);
  }

  const visibleDebts = debts.filter((d) => d.status !== "paid");

  return (
    <FinancePageShell title="Quản lý công nợ">
      {/* Header */}
      <div className="finance-screen-header">
        <h1>Quản lý công nợ</h1>
        <button
          className="finance-action-btn finance-action-btn--primary"
          onClick={() => navigate(urls.finance_management_debt_transaction)}
        >
          + Tạo giao dịch nợ
        </button>
      </div>

      {/* KPI */}
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

        {/* Table */}
        <div className="finance-grid__span-12">
          <section className="finance-panel">
            <div className="debt-filter-row">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as DebtKindFilter)}
                className="finance-filter-select"
              >
                {FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="debt-record-count">{visibleDebts.length} bản ghi</span>
            </div>

            {loading ? (
              <div className="debt-loading">
                {[1, 2, 3, 4].map((i) => <div key={i} className="debt-skeleton-row" />)}
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
                    const days  = getDaysLabel(item.daysRemaining);
                    return (
                      <tr key={item.id}>
                        <td className="debt-name">{item.name}</td>
                        <td className="debt-kind">
                          {item.kind === "receivable" ? "Phải thu" : "Phải trả"}
                        </td>
                        <td className="debt-amount">{formatCurrency(item.amount)}</td>
                        <td className="debt-due">{formatDate(item.dueDate)}</td>
                        <td>
                          <span className={`debt-days ${days.className}`}>{days.text}</span>
                        </td>
                        <td>
                          <FinanceBadge tone={badge.tone}>{badge.label}</FinanceBadge>
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
                              onClick={() => navigate(urls.finance_management_debt_transaction)}
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

      {selectedDebt && (
        <QRModal
          debt={selectedDebt}
          funds={funds}
          onClose={() => setSelectedDebt(null)}
          onPaid={handlePaid}
        />
      )}
    </FinancePageShell>
  );
}