import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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

// Filter options labels are resolved at render time via useTranslation
const FILTER_OPTION_KEYS: { value: DebtKindFilter; key: string }[] = [
  { value: "all", key: "pageFinance.allDebts" },
  { value: "receivable", key: "pageFinance.receivable" },
  { value: "payable", key: "pageFinance.payable" },
  { value: "overdue", key: "pageFinance.overdue" },
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
    case "overdue": return { label: "Quá hạn", tone: "danger" };
    case "upcoming": return { label: "Sắp đến hạn", tone: "warning" };
    case "paid": return { label: "Đã thanh toán", tone: "success" };
    default: return { label: "Còn hạn", tone: "neutral" };
  }
}

function parseVnd(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0;
}
function fmtVndInput(n: number): string {
  return n > 0 ? n.toLocaleString("vi") : "";
}

// ─── Share QR ─────────────────────────────────────────────────────────────────

/** Lấy dataUrl từ canvas QR */
function getQrDataUrl(canvasEl: HTMLCanvasElement | null): string | null {
  if (!canvasEl) return null;
  return canvasEl.toDataURL("image/png");
}

/** Download ảnh QR về máy */
function downloadQr(dataUrl: string, name: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `qr-thu-no-${name}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── ShareSheet ───────────────────────────────────────────────────────────────

interface ShareSheetProps {
  dataUrl: string;
  debtName: string;
  amount: number;
  onClose: () => void;
}

function ShareSheet({ dataUrl, debtName, amount, onClose }: ShareSheetProps) {
  const text = encodeURIComponent(
    `Vui lòng quét mã QR để thanh toán ${amount.toLocaleString("vi")} VND cho ${debtName}`
  );

  const channels = [
    {
      id: "zalo",
      label: "Zalo",
      icon: "💬",
      color: "#0068ff",
      // Zalo deep link share: mở app Zalo với message, user tự chọn contact
      onClick: () => {
        // Thử mở Zalo share URL (hoạt động trong Zalo browser)
        const zaloUrl = `https://zalo.me/share?text=${text}`;
        window.open(zaloUrl, "_blank", "noopener");
      },
    },
    {
      id: "messenger",
      label: "Messenger",
      icon: "📨",
      color: "#0084ff",
      onClick: () => {
        // Facebook Messenger share dialog (cần app_id nếu trên web)
        const fbUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(window.location.href)}&app_id=&redirect_uri=${encodeURIComponent(window.location.href)}`;
        window.open(`fb-messenger://share?text=${text}`, "_blank");
        // Fallback nếu không có app
        setTimeout(() => {
          window.open(`https://m.me/`, "_blank", "noopener");
        }, 1500);
      },
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: "📘",
      color: "#1877f2",
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?quote=${text}`,
          "_blank",
          "width=600,height=400,noopener"
        );
      },
    },
    {
      id: "copy",
      label: "Sao chép link",
      icon: "🔗",
      color: "#5c7282",
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(
            `QR Thu nợ - ${debtName}: ${amount.toLocaleString("vi")} VND
(Ảnh QR đã được tải về máy)`
          );
          showToast("Đã sao chép nội dung", "success");
        } catch {
          showToast("Trình duyệt không hỗ trợ copy", "error");
        }
      },
    },
    {
      id: "download",
      label: "Tải ảnh QR",
      icon: "⬇️",
      color: "#133042",
      onClick: () => {
        downloadQr(dataUrl, debtName);
        showToast("Đã tải ảnh QR — gửi cho khách qua Zalo hoặc Messenger", "success");
      },
    },
  ];

  // Native share nếu available (mobile)
  async function handleNativeShare() {
    if (!navigator.share) return false;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "qr-thu-no.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `QR Thu nợ — ${debtName}`,
          text: `Vui lòng quét mã QR để thanh toán ${amount.toLocaleString("vi")} VND`,
          files: [file],
        });
        return true;
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return true;
    }
    return false;
  }

  return (
    <div
      className="share-sheet-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="share-sheet">
        <div className="share-sheet__header">
          <span>Chia sẻ mã QR thu nợ</span>
          <button type="button" onClick={onClose} className="share-sheet__close">✕</button>
        </div>

        {/* Preview ảnh QR */}
        <div className="share-sheet__preview">
          <img src={dataUrl} alt="QR thu nợ" className="share-sheet__qr-img" />
          <div className="share-sheet__amount">{amount.toLocaleString("vi")} VND</div>
          <div className="share-sheet__name">{debtName}</div>
        </div>

        <p className="share-sheet__hint">Chọn kênh để chia sẻ cho khách hàng:</p>

        {/* Channel buttons */}
        <div className="share-sheet__channels">
          {channels.map((ch) => (
            <button
              key={ch.id}
              type="button"
              className="share-sheet__channel-btn"
              onClick={() => { ch.onClick(); }}
              style={{ "--ch-color": ch.color } as React.CSSProperties}
            >
              <span className="share-sheet__channel-icon">{ch.icon}</span>
              <span className="share-sheet__channel-label">{ch.label}</span>
            </button>
          ))}
        </div>

        <p className="share-sheet__tip">
          💡 Gợi ý: Tải ảnh QR xuống → mở Zalo → gửi ảnh cho khách
        </p>
      </div>
    </div>
  );
}

// ─── PayModal — Thu nợ (chọn quỹ + số tiền) ──────────────────────────────────

interface PayModalProps {
  debt: IDebtItem;
  funds: IFundListItem[];
  onClose: () => void;
  onSuccess: (debtId: number, remaining: number) => void;
}

function PayModal({ debt, funds, onClose, onSuccess }: PayModalProps) {
  const [amountStr, setAmountStr] = useState(fmtVndInput(debt.amount));
  const [amount, setAmount] = useState(debt.amount);
  const [fundId, setFundId] = useState<number>(funds[0]?.id ?? 0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handlePay() {
    if (!fundId) { showToast("Vui lòng chọn quỹ nhận tiền", "error"); return; }
    if (amount <= 0) { showToast("Số tiền phải lớn hơn 0", "error"); return; }
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
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setQrLoading(true);
    setQrError(false);
    QrCodeProService.generate({
      content: "THU NO " + debt.id,
      orderId: debt.id,
      amount: debt.amount,
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

  // Lấy canvas element và extract dataUrl ngay sau khi render
  const handleQrRef = useCallback((node: any) => {
    const el: HTMLCanvasElement | null = node?.canvas ?? node ?? null;
    if (el) {
      canvasRef.current = el;
      // Lấy dataUrl ngay để dùng cho ShareSheet
      try { setQrDataUrl(el.toDataURL("image/png")); } catch { }
    }
  }, []);

  function handleShare() {
    // Thử lấy dataUrl từ canvas (fallback DOM query)
    let url = qrDataUrl;
    if (!url) {
      const el =
        canvasRef.current ??
        (document.querySelector(".debt-qr-canvas canvas") as HTMLCanvasElement | null);
      url = getQrDataUrl(el);
      if (url) setQrDataUrl(url);
    }
    if (!url) { showToast("Không lấy được ảnh QR", "error"); return; }
    setShowShareSheet(true);
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
            disabled={qrLoading || qrError}
          >
            📤 Chia sẻ mã QR
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

      {/* Share sheet — hiện khi bấm "Chia sẻ mã QR" trên desktop */}
      {showShareSheet && qrDataUrl && (
        <ShareSheet
          dataUrl={qrDataUrl}
          debtName={debt.name}
          amount={debt.amount}
          onClose={() => setShowShareSheet(false)}
        />
      )}
    </div>
  );
}

// ─── EditScheduleModal ────────────────────────────────────────────────────────

interface EditScheduleModalProps {
  debt: IDebtItem;
  onClose: () => void;
  onSaved: (id: number, dueDate: string, reminderDate: string) => void;
}

function EditScheduleModal({ debt, onClose, onSaved }: EditScheduleModalProps) {
  // Chuyển "dd/MM/yyyy" sang "yyyy-MM-dd" cho input[type=date]
  function toInputDate(ddmmyyyy: string): string {
    if (!ddmmyyyy) return "";
    const parts = ddmmyyyy.split("/");
    if (parts.length !== 3) return "";
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  // Chuyển "yyyy-MM-dd" sang "dd/MM/yyyy" để gửi backend
  function fromInputDate(yyyymmdd: string): string {
    if (!yyyymmdd) return "";
    const parts = yyyymmdd.split("-");
    if (parts.length !== 3) return "";
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const [dueDate, setDueDate] = useState(toInputDate(debt.dueDate ?? ""));
  const [reminderDate, setReminderDate] = useState(toInputDate(debt.dueDate ?? ""));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!dueDate) { showToast("Vui lòng chọn hạn thanh toán", "error"); return; }
    if (!reminderDate) { showToast("Vui lòng chọn ngày nhắc nhở", "error"); return; }
    setSaving(true);
    try {
      await DebtManagementService.updateSchedule({
        id: debt.id,
        dueDate: fromInputDate(dueDate),
        reminderDate: fromInputDate(reminderDate),
      });
      showToast("✓ Đã cập nhật hạn thanh toán & lịch nhắc nhở", "success");
      onSaved(debt.id, fromInputDate(dueDate), fromInputDate(reminderDate));
      onClose();
    } catch (e: any) {
      showToast(e?.message ?? "Cập nhật thất bại", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="finance-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="finance-modal__content debt-edit-schedule-modal">
        <div className="finance-panel__title">
          <h3>Chỉnh sửa hạn & nhắc nhở</h3>
          <button type="button" className="fund-close-btn" onClick={onClose}>Đóng</button>
        </div>

        <div className="finance-summary-list" style={{ marginBottom: "1.6rem" }}>
          <div className="finance-summary-list__item">
            <span>Đối tượng</span>
            <strong>{debt.name}</strong>
          </div>
          <div className="finance-summary-list__item">
            <span>Số nợ còn lại</span>
            <strong className="debt-amount-highlight">{formatCurrency(debt.amount)}</strong>
          </div>
        </div>

        <div className="debt-pay-form">
          <div className="debt-pay-form__field">
            <label>Hạn thanh toán</label>
            <input
              type="date"
              className="finance-input"
              value={dueDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="debt-pay-form__field" style={{ marginTop: "1.2rem" }}>
            <label>Ngày nhắc nhở</label>
            <input
              type="date"
              className="finance-input"
              value={reminderDate}
              min={new Date().toISOString().split("T")[0]}
              max={dueDate || undefined}
              onChange={(e) => setReminderDate(e.target.value)}
            />
            <p style={{ fontSize: "1.2rem", color: "#8a9eb0", marginTop: "0.4rem" }}>
              📱 Hệ thống sẽ gửi thông báo FCM lúc 08:00 ngày nhắc nhở
            </p>
          </div>
        </div>

        <div className="debt-modal-actions" style={{ marginTop: "2rem" }}>
          <button
            type="button"
            className="finance-action-btn finance-action-btn--outline"
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            type="button"
            className="finance-action-btn finance-action-btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinanceDebtManagement() {
  const { t } = useTranslation();
  document.title = t("pageFinance.debtManagement");
  const navigate = useNavigate();

  const [filter, setFilter] = useState<DebtKindFilter>("all");
  const [debts, setDebts] = useState<IDebtItem[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [summary, setSummary] = useState<IDebtSummary>({
    totalReceivable: 0, totalPayable: 0, totalCounterparty: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState<IDebtItem | null>(null);
  const [editTarget, setEditTarget] = useState<IDebtItem | null>(null);
  const [funds, setFunds] = useState<IFundListItem[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Load quỹ một lần
  useEffect(() => {
    fetch(urlsApi.fund.overview, { method: "GET" })
      .then((r) => r.json())
      .then((res) => { if (res.code === 0) setFunds(res.result?.funds ?? []); })
      .catch(() => { });
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
  function handleScheduleSaved(id: number, dueDate: string, reminderDate: string) {
    setDebts((prev) =>
      prev.map((d) => d.id !== id ? d : { ...d, dueDate })
    );
  }

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

  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const kindParam = filter === "all" ? undefined : filter;
      await DebtManagementService.exportExcel(kindParam, keyword || undefined);
      showToast("Xuất Excel thành công", "success");
    } catch (err: any) {
      showToast(err?.message ?? "Xuất Excel thất bại. Vui lòng thử lại", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const visibleDebts = debts.filter((d) => d.status !== "paid");

  return (
    <FinancePageShell title={t("pageFinance.debtManagement")}>
      {/* Header */}
      <div className="finance-screen-header">
        <h1>{t("pageFinance.debtManagement")}</h1>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            className="finance-action-btn finance-action-btn--outline"
            onClick={handleExportExcel}
            disabled={isExporting}
            title="Xuất danh sách công nợ theo bộ lọc hiện tại ra file Excel"
          >
            {isExporting ? "Đang xuất..." : "⬇ Xuất Excel"}
          </button>
          <button
            className="finance-action-btn finance-action-btn--primary"
            onClick={() => navigate(urls.finance_management_debt_transaction)}
          >
            + {t("pageFinance.createTransaction")}
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="finance-grid">
        <div className="finance-grid__span-4">
          <FinanceStatCard
            label={t("pageFinance.totalReceivable")}
            value={formatCurrency(summary.totalReceivable)}
            tone="success"
          />
        </div>
        <div className="finance-grid__span-4">
          <FinanceStatCard
            label={t("pageFinance.totalPayable")}
            value={formatCurrency(summary.totalPayable)}
            tone="danger"
          />
        </div>
        <div className="finance-grid__span-4">
          <FinanceStatCard
            label={t("pageFinance.counterpartyCount")}
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
                {FILTER_OPTION_KEYS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.key)}</option>
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
                    <th>{t("pageFinance.colCounterparty")}</th>
                    <th>{t("pageFinance.colDebtType")}</th>
                    <th>{t("pageFinance.colAmount")}</th>
                    <th>{t("pageFinance.colDueDate")}</th>
                    <th>{t("pageFinance.colRemaining")}</th>
                    <th>{t("pageFinance.colStatus")}</th>
                    <th>{t("pageFinance.colAction")}</th>
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
                          <span className={`debt-days ${days.className}`}>{days.text}</span>
                        </td>
                        <td>
                          <FinanceBadge tone={badge.tone}>{badge.label}</FinanceBadge>
                        </td>
                        <td>
                          {item.kind === "receivable" ? (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                className="finance-action-btn finance-action-btn--success-sm"
                                onClick={() => setSelectedDebt(item)}
                              >
                                {t("pageFinance.qrCollect")}
                              </button>
                              <button
                                className="finance-action-btn finance-action-btn--outline-sm"
                                onClick={() => setEditTarget(item)}
                                title={t("pageFinance.editSchedule")}
                              >
                                ✏ {t("pageFinance.editSchedule")}
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                className="finance-action-btn finance-action-btn--outline"
                                onClick={() => navigate(urls.finance_management_debt_transaction)}
                              >
                                {t("pageFinance.confirmPaid")}
                              </button>
                              <button
                                className="finance-action-btn finance-action-btn--outline-sm"
                                onClick={() => setEditTarget(item)}
                                title={t("pageFinance.editSchedule")}
                              >
                                ✏ {t("pageFinance.editSchedule")}
                              </button>
                            </div>
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

      {editTarget && (
        <EditScheduleModal
          debt={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleScheduleSaved}
        />
      )}

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