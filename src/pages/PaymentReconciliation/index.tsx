import React, { useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Button from "components/button/button";
import QrCodeProService from "services/QrCodeProService";
import "./index.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

type BankStmt = {
  date: string;
  ref: string;
  desc: string;
  amount: number;
  type: "thu" | "chi";
  matched: boolean;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BANK_STMTS: BankStmt[] = [
  { date: "16/03", ref: "FT26075123", desc: "TT don hang SO2318",         amount: 31200000, type: "thu", matched: true  },
  { date: "16/03", ref: "FT26075234", desc: "KH Nguyen Lan chuyen khoan", amount: 8750000,  type: "thu", matched: true  },
  { date: "15/03", ref: "FT26074345", desc: "CHUYEN TIEN LUONG T3/2026",  amount: 28000000, type: "chi", matched: false },
  { date: "15/03", ref: "FT26074456", desc: "VNPAY QR giao dich online",  amount: 3500000,  type: "thu", matched: true  },
  { date: "14/03", ref: "FT26073567", desc: "TT nha cung cap Minh Hoang", amount: 12500000, type: "chi", matched: false },
];

const formatVnd = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + " VND";

// ─── Component ────────────────────────────────────────────────────────────────

const Reconcile: React.FC = () => {
  const [bankAccount, setBankAccount] = useState("Vietcombank ****1234");
  const [date, setDate]               = useState("2026-03-16");
  const [running, setRunning]         = useState(false);
  const [doneMsg, setDoneMsg]         = useState<string | null>(null);

  const matched  = useMemo(() => MOCK_BANK_STMTS.filter((b) => b.matched).length, []);
  const totalThu = useMemo(() => MOCK_BANK_STMTS.filter((b) => b.type === "thu").reduce((a, b) => a + b.amount, 0), []);
  const totalTx  = MOCK_BANK_STMTS.length;

  // ── QR Drawer ──────────────────────────────────────────────────────────────
  const [showQR,      setShowQR]      = useState(false);
  const [qrTarget,    setQrTarget]    = useState("");
  const [qrAmount,    setQrAmount]    = useState("");
  const [qrCode,      setQrCode]      = useState<string | null>(null);
  const [qrLoading,   setQrLoading]   = useState(false);
  const [qrConfirmed, setQrConfirmed] = useState(false);

  const handleOpenQR = () => {
    setShowQR(true);
    setQrCode(null);
    setQrTarget("");
    setQrAmount("");
    setQrConfirmed(false);
  };

  const handleCloseQR = () => {
    setShowQR(false);
    setQrCode(null);
    setQrConfirmed(false);
  };

  const handleGenerateQR = async () => {
    const amt = Number(qrAmount.replace(/\D/g, "") || 0);
    if (!qrTarget.trim() || amt <= 0) return;
    setQrLoading(true);
    try {
      const res = await QrCodeProService.generate({
        content: "THU NO " + qrTarget.trim(),
        orderId: Date.now(),
        amount: amt,
      });
      if (res.code === 0 && res?.result?.qrCode) {
        setQrCode(res.result.qrCode);
      }
    } catch {
      // ignore
    } finally {
      setQrLoading(false);
    }
  };

  const handleShareQR = () => {
    const canvas = document.querySelector(".reconcile-qr-display canvas") as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      link.download = `qr-thu-no-${qrTarget || "payment"}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const amtNumber  = Number(qrAmount.replace(/\D/g, "") || 0);
  const canGenerate = qrTarget.trim().length > 0 && amtNumber > 0;

  // ── Run reconcile ─────────────────────────────────────────────────────────
  const run = async () => {
    setRunning(true);
    setDoneMsg(null);
    await new Promise((r) => setTimeout(r, 1400));
    setRunning(false);
    setDoneMsg(`Đối soát hoàn thành! Đã khớp ${matched}/${totalTx} giao dịch. ${totalTx - matched} cần xử lý thủ công.`);
  };

  return (
    <div className="reconcile-page">
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Đối soát thanh toán</div>
          <div className="page-desc">Tự động khớp giao dịch ngân hàng với sổ thu chi</div>
        </div>
      </div>

      {/* ── Run banner ── */}
      <div className="banner mb16">
        <div className="banner-left">
          <div className="banner-title">Đối soát tự động với ngân hàng</div>
          <div className="banner-sub">Chọn tài khoản và ngày để chạy đối soát. Kết quả hiển thị bên dưới.</div>
        </div>
        <div className="banner-right">
          <select value={bankAccount} onChange={(e) => setBankAccount(e.target.value)}>
            <option>Vietcombank ****1234</option>
            <option>Techcombank ****5678</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button color="primary" onClick={run} disabled={running}>
            {running ? "⟳ Đang đối soát..." : "⟳ Chạy đối soát"}
          </Button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid3 mb16">
        <div className="stat">
          <div className="stat-lbl">Đã khớp tự động</div>
          <div className="stat-val c-gr">{matched}/{totalTx} GD</div>
          <div className="stat-chg c-gr">Tỷ lệ khớp {Math.round((matched / totalTx) * 100)}%</div>
          <div className="stat-bar stat-bar--gr" />
        </div>
        <div className="stat">
          <div className="stat-lbl">Chưa khớp</div>
          <div className="stat-val c-am">{totalTx - matched} GD</div>
          <div className="stat-chg c-t2">Cần xử lý thủ công</div>
          <div className="stat-bar stat-bar--am" />
        </div>
        <div className="stat">
          <div className="stat-lbl">Tổng thu trong kỳ</div>
          <div className="stat-val c-bl">{formatVnd(totalThu)}</div>
          <div className="stat-chg c-t2">{MOCK_BANK_STMTS.filter((b) => b.type === "thu").length} phát sinh</div>
          <div className="stat-bar stat-bar--bl" />
        </div>
      </div>

      {doneMsg && <div className="alert alert--success mb16">{doneMsg}</div>}

      {/* ── Table ── */}
      <div className="card mb16">
        <div className="card-title mb12">
          Bảng đối soát · {bankAccount} · {date}
        </div>
        <div className="table-wrap">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mã tham chiếu</th>
                <th>Nội dung ngân hàng</th>
                <th className="tr">Số tiền</th>
                <th>Kết quả</th>
                <th className="hide-m"></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BANK_STMTS.map((b, idx) => (
                <tr key={idx}>
                  <td className="muted">{b.date}</td>
                  <td className="mono blue">{b.ref}</td>
                  <td className="fw">{b.desc}</td>
                  <td className={`tr mono fw ${b.type === "thu" ? "c-gr" : "c-rd"}`}>
                    {b.type === "thu" ? "+ " : "- "}{formatVnd(b.amount)}
                  </td>
                  <td>
                    {b.matched
                      ? <span className="badge bg">Đã khớp</span>
                      : <span className="badge ba">Chưa khớp</span>}
                  </td>
                  <td className="hide-m">
                    {!b.matched && (
                      <Button color="secondary" variant="outline">Khớp thủ công</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── QR Pro banner ── */}
      <div className="banner banner--warn">
        <div className="banner-left">
          <div className="banner-title">📱 Thu tiền nhanh bằng QR Pro</div>
          <div className="banner-sub">
            QR động cho từng giao dịch. Khi khách quét &amp; thanh toán, hệ thống tự ghi nhận vào sổ thu chi và đối soát ngân hàng tức thì.
          </div>
          <div className="badges">
            <span className="badge bg">VietQR</span>
            <span className="badge bb">Napas 247</span>
            <span className="badge ba">Tức thì</span>
          </div>
        </div>
        <div className="banner-right">
          {/* ← Đây là nút mở drawer */}
          <Button color="primary" onClick={handleOpenQR}>
            Tạo QR thanh toán
          </Button>
        </div>
      </div>

      {/* ── QR Drawer ──────────────────────────────────────────────────────── */}
      {showQR && (
        <div
          className="reconcile-qr-overlay"
          onClick={(e) => e.target === e.currentTarget && handleCloseQR()}
        >
          <div className="reconcile-qr-drawer">
            {/* Header */}
            <div className="reconcile-qr-drawer__header">
              <h3>QR Thu nợ</h3>
              <button type="button" className="reconcile-qr-drawer__close" onClick={handleCloseQR}>
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="reconcile-qr-drawer__body">
              {/* Đối tượng */}
              <div className="reconcile-qr-field">
                <label>Đối tượng</label>
                <input
                  type="text"
                  value={qrTarget}
                  onChange={(e) => { setQrTarget(e.target.value); setQrCode(null); setQrConfirmed(false); }}
                  placeholder="Tên khách hàng / NCC..."
                  className="reconcile-qr-input"
                />
              </div>

              {/* Số tiền */}
              <div className="reconcile-qr-field">
                <label>Số tiền</label>
                <div className="reconcile-qr-input-wrap">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amtNumber > 0 ? new Intl.NumberFormat("vi-VN").format(amtNumber) : ""}
                    onChange={(e) => { setQrAmount(e.target.value.replace(/\D/g, "")); setQrCode(null); setQrConfirmed(false); }}
                    placeholder="0"
                    className="reconcile-qr-input"
                  />
                  <span className="reconcile-qr-suffix">VND</span>
                </div>
              </div>

              {/* QR display */}
              <div className="reconcile-qr-display">
                {qrCode ? (
                  <>
                    <QRCodeCanvas value={qrCode} size={180} />
                    <p className="reconcile-qr-hint">Quét để thanh toán</p>
                  </>
                ) : (
                  <div className="reconcile-qr-placeholder">
                    <div className="reconcile-qr-placeholder__icon">▣</div>
                    <p>Nhập thông tin và nhấn tạo QR</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {!qrCode ? (
                <button
                  className="reconcile-qr-btn reconcile-qr-btn--primary"
                  onClick={handleGenerateQR}
                  disabled={qrLoading || !canGenerate}
                >
                  {qrLoading ? "Đang tạo..." : "Tạo mã QR"}
                </button>
              ) : qrConfirmed ? (
                <p className="reconcile-qr-confirmed">✓ Đã xác nhận nhận tiền thành công!</p>
              ) : (
                <div className="reconcile-qr-actions">
                  <button className="reconcile-qr-btn reconcile-qr-btn--dark" onClick={handleShareQR}>
                    Chia sẻ mã QR
                  </button>
                  <button
                    className="reconcile-qr-btn reconcile-qr-btn--success"
                    onClick={() => setQrConfirmed(true)}
                  >
                    ✓ Xác nhận đã nhận tiền
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reconcile;