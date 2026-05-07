// [MH] Wallet — credit balance + transaction history (Phase 6 USP)
import React, { useEffect, useState } from "react";
import { getWallet, listTransactions, type Wallet, type CreditTransaction } from "@/services/mentorhub/zoomPoolApi";
import "../_shared/styles.scss";
import "../ZoomPool/ZoomPool.scss";
import "./Wallet.scss";

const TYPE_LABEL: Record<CreditTransaction["type"], string> = {
  grant: "Cấp tháng",
  spend: "Chi tiêu",
  earn: "Earn",
  swap: "Swap",
  adjust: "Điều chỉnh",
  refund: "Hoàn",
};
const TYPE_TONE: Record<CreditTransaction["type"], string> = {
  grant: "upcoming",
  spend: "red",
  earn: "green",
  swap: "amber",
  adjust: "draft",
  refund: "green",
};

export default function MHWallet() {
  document.title = "Ví credit · MentorHub";
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txns, setTxns] = useState<CreditTransaction[]>([]);
  const [filter, setFilter] = useState<CreditTransaction["type"] | "all">("all");

  const load = async () => {
    try {
      const [w, t] = await Promise.all([
        getWallet(),
        listTransactions({ type: filter === "all" ? undefined : filter, limit: 100 }),
      ]);
      setWallet(w);
      setTxns(t);
    } catch (e) { /* mock fallback */ }
  };
  useEffect(() => { void load(); }, [filter]);

  return (
    <div className="mh">
      <div className="mh__hero">
        <div className="mh__kicker">CREDIT · VÍ</div>
        <h1>Ví <em>credit</em></h1>
        <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>
          1 credit ≈ 1 phút Zoom tiêu chuẩn. Tier cao có discount, có thể swap thành tiền hoặc ngược lại.
        </p>
      </div>

      {wallet && (
        <div className="mh__grid mh__grid--3" style={{ marginBottom: 32 }}>
          <div className="mh__kpi mh-wallet-kpi">
            <div className="mh__kpi-label">Số dư</div>
            <div className="mh__kpi-value">{wallet.balance.toLocaleString("vi-VN")}</div>
            <div className="mh__kpi-delta">credit</div>
          </div>
          <div className="mh__kpi">
            <div className="mh__kpi-label">Earn kỳ này</div>
            <div className="mh__kpi-value" style={{ color: "var(--mh-green)" }}>+{wallet.earnedThisPeriod}</div>
            <div className="mh__kpi-delta">grant + earn + refund</div>
          </div>
          <div className="mh__kpi">
            <div className="mh__kpi-label">Spend kỳ này</div>
            <div className="mh__kpi-value" style={{ color: "var(--mh-red)" }}>−{wallet.spentThisPeriod}</div>
            <div className="mh__kpi-delta">book + swap-out</div>
          </div>
        </div>
      )}

      {wallet && (
        <div className="mh__card mh-wallet-rules">
          <h3>Rule áp dụng cho tenant của bạn</h3>
          <ul>
            <li>Cấp hàng tháng: <strong>{wallet.rules.monthlyGrant}</strong> credit</li>
            <li>Rollover: {wallet.rules.rolloverEnabled ? `bật · cap ${wallet.rules.rolloverCap < 0 ? "không giới hạn" : wallet.rules.rolloverCap + " credit"}` : "không"}</li>
            <li>Swap rate: {wallet.rules.swapRatePct}%</li>
          </ul>
        </div>
      )}

      <h2 style={{ marginTop: 32, marginBottom: 16 }}>Lịch sử giao dịch</h2>
      <div className="mh-zp-filter-group" style={{ marginBottom: 16 }}>
        <button type="button" className={`mh-zp-chip${filter === "all" ? " is-active" : ""}`} onClick={() => setFilter("all")}>Tất cả</button>
        {(["grant", "earn", "spend", "refund", "swap", "adjust"] as const).map((t) => (
          <button key={t} type="button" className={`mh-zp-chip${filter === t ? " is-active" : ""}`} onClick={() => setFilter(t)}>{TYPE_LABEL[t]}</button>
        ))}
      </div>

      <div className="mh-wallet-table">
        {txns.length === 0 && <p style={{ color: "var(--mh-ink-soft)" }}>Chưa có giao dịch.</p>}
        {txns.map((t) => (
          <div key={t.id} className="mh-wallet-row">
            <span className={`mh__pill mh__pill--${TYPE_TONE[t.type]}`}>{TYPE_LABEL[t.type]}</span>
            <div className="mh-wallet-row__main">
              <div>{t.reason}</div>
              <small>{new Date(t.createdAt).toLocaleString("vi-VN")} · by {t.createdBy}</small>
            </div>
            <div className={`mh-wallet-row__amount${t.amount < 0 ? " is-neg" : ""}`}>
              {t.amount > 0 ? "+" : ""}{t.amount.toLocaleString("vi-VN")}
            </div>
            <div className="mh-wallet-row__balance">→ {t.balanceAfter.toLocaleString("vi-VN")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
