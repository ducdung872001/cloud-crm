// [MH] Settings · Gói đăng ký — trial, usage, upgrade, gia hạn, huỷ, billing history
import React, { useEffect, useState } from "react";
import {
  PLANS, CYCLES, MOCK_SUBSCRIPTION, MOCK_INVOICES, TRIAL_FEATURES,
  computeCyclePrice, daysRemaining, formatVND,
  getFeaturesFor, getPlanById,
  type PlanId, type BillingCycle, type PlanTier, type MentorSubscription,
} from "@/mocks/subscription";
import "../_shared/styles.scss";
import "./subscription.scss";

type Toast = { text: string; kind?: "ok" | "warn" | "info" } | null;

export default function SubscriptionSection() {
  const [sub, setSub] = useState<MentorSubscription>(MOCK_SUBSCRIPTION);
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [preselectPlan, setPreselectPlan] = useState<PlanId>("pro");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const notify = (text: string, kind: Toast["kind"] = "ok") => {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 4000);
  };

  const currentPlan = sub.plan === "trial" ? null : getPlanById(sub.plan);
  const features = getFeaturesFor(sub.plan);
  const isTrial = sub.status === "trial";
  const trialDays = isTrial && sub.trialEndsAt ? daysRemaining(sub.trialEndsAt) : 0;
  const trialUrgent = isTrial && trialDays <= 7;
  const canceledAtEnd = sub.status === "canceled_at_period_end";

  const handleUpgrade = (plan: PlanId, cycle: BillingCycle) => {
    const planTier = getPlanById(plan)!;
    const { total, effectiveMonthly } = computeCyclePrice(planTier.monthlyPriceVND, cycle);
    const now = new Date();
    const months = CYCLES.find((c) => c.cycle === cycle)!.months;
    const periodEnd = new Date(now); periodEnd.setMonth(periodEnd.getMonth() + months);

    setSub((prev) => ({
      ...prev,
      plan,
      cycle,
      status: "active",
      trialStartedAt: undefined,
      trialEndsAt: undefined,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      nextBillingAt: periodEnd.toISOString(),
      nextBillingAmountVND: total,
      autoRenew: true,
      usage: { ...prev.usage },
    }));

    setInvoices((prev) => [{
      id: "INV-" + Date.now(),
      issuedAt: now.toISOString().split("T")[0],
      periodLabel: `${now.toLocaleDateString("vi-VN")} → ${periodEnd.toLocaleDateString("vi-VN")}`,
      plan,
      cycle,
      amountVND: total,
      status: "paid" as const,
      method: "VNPay" as const,
    }, ...prev]);

    setShowUpgrade(false);
    notify(`✓ Đã kích hoạt gói ${planTier.name} (${cycle}) · ${formatVND(total)} (≈ ${formatVND(effectiveMonthly)}/tháng)`);
  };

  const cancelRenewal = () => {
    setSub((prev) => ({ ...prev, status: "canceled_at_period_end", autoRenew: false, nextBillingAt: null, nextBillingAmountVND: undefined }));
    setShowCancelConfirm(false);
    notify("Đã huỷ tự động gia hạn. Gói vẫn hoạt động đến hết chu kỳ hiện tại.", "warn");
  };

  const exportCsv = () => {
    if (invoices.length === 0) { notify("Chưa có hoá đơn để xuất", "warn"); return; }
    const header = ["Ma hoa don", "Ngay", "Chu ky", "Goi", "So tien (VND)", "Phuong thuc", "Trang thai"];
    const rows = invoices.map((iv) => [iv.id, iv.issuedAt, iv.periodLabel, iv.plan, iv.amountVND, iv.method, iv.status]);
    const csv = [header, ...rows].map((r) => r.map((cell) => {
      const s = String(cell ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")).join("\n");
    // Prepend UTF-8 BOM để Excel đọc tiếng Việt đúng
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mentorhub-invoices-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify(`✓ Đã xuất ${invoices.length} hoá đơn ra CSV`);
  };

  const downloadInvoicePdf = (iv: typeof invoices[number]) => {
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Hoá đơn ${iv.id} — MentorHub</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Geist', -apple-system, sans-serif; color: #0E1713; margin: 0; padding: 40px; max-width: 760px; margin: 0 auto; background: #fff; }
  h1, h2 { font-family: 'Fraunces', serif; font-weight: 400; margin: 0; }
  h1 { font-size: 32px; margin-bottom: 4px; }
  .mono { font-family: 'Geist Mono', monospace; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #0E1713; margin-bottom: 30px; }
  .brand__logo { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 500; }
  .brand__mark { color: #0F766E; margin-right: 6px; }
  .brand__sub { font-size: 11px; color: #6B7A72; margin-top: 4px; font-family: 'Geist Mono', monospace; letter-spacing: .06em; }
  .meta { text-align: right; font-size: 12px; color: #6B7A72; font-family: 'Geist Mono', monospace; line-height: 1.7; }
  .meta__label { letter-spacing: .08em; text-transform: uppercase; font-size: 10px; }
  .meta__value { color: #0E1713; font-size: 13px; font-weight: 600; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
  .party__label { font-family: 'Geist Mono', monospace; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #6B7A72; margin-bottom: 6px; }
  .party__name { font-weight: 600; font-size: 14px; }
  .party__line { font-size: 12px; color: #6B7A72; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { text-align: left; padding: 12px 14px; background: #F4EFE6; font-family: 'Geist Mono', monospace; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #6B7A72; font-weight: 600; }
  td { padding: 14px; border-bottom: 1px solid #E0D8C8; font-size: 13px; }
  .amt { text-align: right; font-family: 'Geist Mono', monospace; font-weight: 600; }
  .totals { margin-left: auto; width: 320px; margin-top: 10px; }
  .totals__row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
  .totals__row.grand { font-family: 'Fraunces', serif; font-size: 22px; color: #0F766E; border-top: 2px solid #0E1713; padding-top: 14px; margin-top: 10px; font-weight: 400; }
  .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-family: 'Geist Mono', monospace; font-size: 11px; letter-spacing: .06em; font-weight: 700; text-transform: uppercase; }
  .status.paid { background: #DCFCE7; color: #166534; }
  .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #E0D8C8; font-size: 10px; color: #6B7A72; line-height: 1.7; }
  @media print { body { padding: 20px; } .no-print { display: none; } }
</style>
</head>
<body>
  <div class="head">
    <div>
      <div class="brand__logo"><span class="brand__mark">◐</span>MentorHub · Reborn JSC</div>
      <div class="brand__sub">PHIẾU THU · VAT INVOICE</div>
    </div>
    <div class="meta">
      <div class="meta__label">Mã hoá đơn</div>
      <div class="meta__value">${iv.id}</div>
      <div style="height: 10px"></div>
      <div class="meta__label">Ngày phát hành</div>
      <div class="meta__value">${new Date(iv.issuedAt).toLocaleDateString("vi-VN")}</div>
      <div style="height: 10px"></div>
      <div class="meta__label">Trạng thái</div>
      <div><span class="status ${iv.status}">${iv.status}</span></div>
    </div>
  </div>

  <div class="parties">
    <div>
      <div class="party__label">Bên cung cấp</div>
      <div class="party__name">Công ty Cổ phần Reborn JSC</div>
      <div class="party__line">Toà Metro Star, Thủ Đức, TP. HCM</div>
      <div class="party__line">MST: 0313xxxxxx</div>
      <div class="party__line">hello@mentorhub.vn · (028) 3812 3456</div>
    </div>
    <div>
      <div class="party__label">Khách hàng</div>
      <div class="party__name">${MOCK_SUBSCRIPTION.mentorId} · Nguyễn Trọng Khoa</div>
      <div class="party__line">khoa@mentorhub.vn</div>
      <div class="party__line">Mentor ID: ${MOCK_SUBSCRIPTION.mentorId}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Mô tả dịch vụ</th>
        <th>Chu kỳ</th>
        <th class="amt">Số tiền</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div style="font-weight: 600;">MentorHub · Gói ${iv.plan.toUpperCase()}</div>
          <div style="font-size: 11px; color: #6B7A72; margin-top: 4px;">${iv.periodLabel}</div>
        </td>
        <td class="mono" style="font-size: 12px;">${iv.cycle}</td>
        <td class="amt">${iv.amountVND.toLocaleString("vi-VN")}₫</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals__row"><span>Tạm tính</span><span class="mono">${iv.amountVND.toLocaleString("vi-VN")}₫</span></div>
    <div class="totals__row"><span>VAT (đã gồm)</span><span class="mono">0₫</span></div>
    <div class="totals__row grand"><span>Tổng</span><span>${iv.amountVND.toLocaleString("vi-VN")}₫</span></div>
  </div>

  <div class="footer">
    <strong>Phương thức thanh toán:</strong> ${iv.method}<br />
    Hoá đơn này được tạo tự động bởi hệ thống MentorHub. Mọi thắc mắc liên hệ hello@mentorhub.vn.<br />
    © 2026 Reborn JSC · mentorhub.vn
  </div>

  <script>
    window.addEventListener("load", () => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => setTimeout(() => window.print(), 300));
      } else {
        setTimeout(() => window.print(), 500);
      }
    });
  </script>
</body>
</html>`;
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) { notify("✕ Popup bị chặn. Cho phép popup để xem PDF.", "warn"); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
    notify(`📄 Cửa sổ in mở — chọn 'Save as PDF' để tải hoá đơn ${iv.id}.`, "info");
  };

  const resumeRenewal = () => {
    const planTier = currentPlan;
    if (!planTier) return;
    const { total } = computeCyclePrice(planTier.monthlyPriceVND, sub.cycle);
    setSub((prev) => ({ ...prev, status: "active", autoRenew: true, nextBillingAt: prev.currentPeriodEnd, nextBillingAmountVND: total }));
    notify("✓ Đã bật lại gia hạn tự động");
  };

  const openUpgrade = (plan: PlanId = "pro") => {
    setPreselectPlan(plan);
    setShowUpgrade(true);
  };

  return (
    <div className="mh-sub">
      {/* ── Hero: current plan + trial countdown ─────────────────────────── */}
      <div className={"mh-sub__hero" + (trialUrgent ? " is-urgent" : "") + (isTrial ? " is-trial" : "")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="mh__kicker" style={{ color: isTrial ? "var(--mh-amber)" : "var(--mh-teal)" }}>
              {isTrial ? "🎁 BẢN DÙNG THỬ 1 THÁNG" : canceledAtEnd ? "⚠ ĐÃ HUỶ GIA HẠN" : `GÓI ${sub.plan.toUpperCase()}`}
            </div>
            <h3 style={{ fontSize: 28, margin: "6px 0 4px" }}>
              {isTrial ? <>Đang dùng thử · <em>{trialDays} ngày còn lại</em></> : currentPlan ? currentPlan.name : sub.plan}
            </h3>
            {isTrial ? (
              <p style={{ color: "var(--mh-ink-soft)", fontSize: 14, margin: 0 }}>
                Đã có đủ thời gian làm quen. Hết ngày {new Date(sub.trialEndsAt!).toLocaleDateString("vi-VN")} sẽ bắt đầu tính phí theo gói bạn chọn.
              </p>
            ) : canceledAtEnd ? (
              <p style={{ color: "var(--mh-red)", fontSize: 14, margin: 0 }}>
                Gói sẽ hết hạn ngày {new Date(sub.currentPeriodEnd).toLocaleDateString("vi-VN")}. Sau đó chuyển về trial hạn chế.
              </p>
            ) : (
              <p style={{ color: "var(--mh-ink-soft)", fontSize: 14, margin: 0 }}>
                Chu kỳ hiện tại: {new Date(sub.currentPeriodStart).toLocaleDateString("vi-VN")} → {new Date(sub.currentPeriodEnd).toLocaleDateString("vi-VN")}
                {sub.nextBillingAt && ` · Tự động gia hạn ${new Date(sub.nextBillingAt).toLocaleDateString("vi-VN")}: ${formatVND(sub.nextBillingAmountVND!)}`}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {isTrial && <button className="mh__btn mh__btn--primary" onClick={() => openUpgrade("pro")}>→ Nâng cấp ngay</button>}
            {sub.status === "active" && <button className="mh__btn mh__btn--primary" onClick={() => openUpgrade()}>⇪ Đổi gói / Gia hạn</button>}
            {canceledAtEnd && <button className="mh__btn mh__btn--primary" onClick={resumeRenewal}>↻ Bật lại gia hạn</button>}
            {sub.status === "active" && <button className="mh__btn" onClick={() => setShowCancelConfirm(true)}>Huỷ gia hạn</button>}
          </div>
        </div>

        {/* Progress bar for trial */}
        {isTrial && (
          <div style={{ marginTop: 20 }}>
            <div style={{ height: 8, background: "rgba(255,255,255,.4)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${((30 - trialDays) / 30) * 100}%`,
                height: "100%",
                background: trialUrgent ? "var(--mh-red)" : "var(--mh-amber)",
                transition: "width .3s",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, fontFamily: "'Geist Mono', monospace", color: "var(--mh-ink-soft)" }}>
              <span>Ngày 1</span>
              <span>Ngày 30 (hết trial)</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Usage progress bars ─────────────────────────────────────────── */}
      <div className="mh__card" style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 20 }}>Sử dụng tháng này</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          <UsageBar label="Buổi AI Meeting Note" used={sub.usage.aiSessionsUsed} total={features.aiSessions} unit="buổi" onUpgrade={openUpgrade} />
          <UsageBar label="Tin Zalo nhắc lịch" used={sub.usage.zaloSent} total={features.zaloMessages} unit="tin" onUpgrade={openUpgrade} />
          <UsageBar label="Dung lượng lưu trữ" used={sub.usage.storageUsedMB} total={features.storageGB * 1024} unit="MB" formatVal={(v) => v >= 1024 ? (v / 1024).toFixed(1) + " GB" : v + " MB"} onUpgrade={openUpgrade} />
          <UsageBar label="Khoá đang mở" used={sub.usage.coursesActive} total={features.coursesLimit} unit="khoá" onUpgrade={openUpgrade} />
          <UsageBar label="Học viên" used={sub.usage.studentsActive} total={features.studentsLimit} unit="HV" onUpgrade={openUpgrade} />
        </div>
      </div>

      {/* ── Plans comparison (always visible for quick upgrade) ──────────── */}
      <div className="mh__card" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3>Các gói có sẵn</h3>
            <p style={{ fontSize: 13, color: "var(--mh-ink-soft)", marginTop: 4 }}>Có thể đổi bất cứ lúc nào. Thanh toán linh hoạt theo tháng/quý/6 tháng/năm.</p>
          </div>
          <button className="mh__btn mh__btn--primary" onClick={() => openUpgrade()}>Xem chi tiết & Nâng cấp</button>
        </div>
        <div className="mh-sub__plans-mini">
          {PLANS.map((p) => {
            const isCurrent = sub.plan === p.id && sub.status !== "trial";
            return (
              <div key={p.id} className={"mh-sub__plan-mini" + (p.popular ? " is-popular" : "") + (isCurrent ? " is-current" : "")}>
                {p.popular && <span className="mh-sub__ribbon" style={{ background: "var(--mh-amber)" }}>PHỔ BIẾN</span>}
                {isCurrent && <span className="mh-sub__ribbon" style={{ background: "var(--mh-green)" }}>ĐANG DÙNG</span>}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div className="mh-sub__plan-dot" style={{ background: p.color }} />
                  <div>
                    <div style={{ fontSize: 18, fontFamily: "'Fraunces', serif", fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--mh-ink-soft)", fontStyle: "italic" }}>{p.tagline}</div>
                  </div>
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: p.color }}>{formatVND(p.monthlyPriceVND)}<span style={{ fontSize: 12, color: "var(--mh-ink-soft)", marginLeft: 4 }}>/tháng</span></div>
                <ul className="mh-sub__plan-mini-list">
                  {p.highlights.slice(0, 4).map((h, i) => <li key={i}><span style={{ color: p.color }}>✓</span>{h}</li>)}
                </ul>
                <button
                  className={"mh__btn" + (isCurrent ? "" : " mh__btn--primary")}
                  disabled={isCurrent}
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => openUpgrade(p.id)}
                >
                  {isCurrent ? "✓ Đang dùng" : sub.plan === "trial" ? "Chọn gói" : p.monthlyPriceVND > (currentPlan?.monthlyPriceVND || 0) ? "Nâng cấp" : "Đổi sang"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Billing history ─────────────────────────────────────────────── */}
      <div className="mh__card" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3>Lịch sử thanh toán</h3>
          <button className="mh__btn" style={{ padding: "6px 12px", fontSize: 12 }} onClick={exportCsv}>Xuất CSV</button>
        </div>
        {invoices.length === 0 ? (
          <p style={{ color: "var(--mh-ink-soft)", fontSize: 13 }}>Chưa có hoá đơn nào.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="mh__table">
              <thead>
                <tr>
                  <th>Mã hoá đơn</th>
                  <th>Ngày</th>
                  <th>Chu kỳ</th>
                  <th>Gói</th>
                  <th style={{ textAlign: "right" }}>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((iv) => (
                  <tr key={iv.id}>
                    <td className="mh__mono" style={{ fontSize: 12 }}>{iv.id}</td>
                    <td className="mh__mono" style={{ fontSize: 12 }}>{iv.issuedAt}</td>
                    <td style={{ fontSize: 12 }}>{iv.periodLabel}</td>
                    <td><span className="mh__pill mh__pill--draft">{iv.plan}</span></td>
                    <td className="mh__mono" style={{ textAlign: "right", fontWeight: 600 }}>{iv.amountVND === 0 ? "—" : formatVND(iv.amountVND)}</td>
                    <td className="mh__mono" style={{ fontSize: 12 }}>{iv.method}</td>
                    <td><span className={"mh__pill " + (iv.status === "paid" ? "mh__pill--green" : iv.status === "pending" ? "mh__pill--amber" : "mh__pill--red")}>{iv.status}</span></td>
                    <td style={{ textAlign: "right" }}>
                      {iv.status === "paid" && iv.amountVND > 0 && <button className="mh__btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => downloadInvoicePdf(iv)}>Tải PDF</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUpgrade && (
        <UpgradeModal
          currentPlan={sub.plan}
          preselect={preselectPlan}
          onClose={() => setShowUpgrade(false)}
          onConfirm={handleUpgrade}
        />
      )}

      {showCancelConfirm && (
        <CancelConfirmModal
          currentPlan={currentPlan!}
          periodEnd={sub.currentPeriodEnd}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={cancelRenewal}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, padding: "14px 22px", background: toast.kind === "warn" ? "var(--mh-amber)" : toast.kind === "info" ? "var(--mh-ink)" : "#166534", color: "#fff", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,.2)", zIndex: 300, fontSize: 14, maxWidth: 460 }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}

// ── Single usage bar ─────────────────────────────────────────────────────────
function UsageBar({
  label, used, total, unit, formatVal, onUpgrade,
}: { label: string; used: number; total: number; unit: string; formatVal?: (v: number) => string; onUpgrade: () => void }) {
  const unlimited = total === -1;
  const pct = unlimited ? 0 : Math.min(100, (used / total) * 100);
  const warning = !unlimited && pct >= 80;
  const critical = !unlimited && pct >= 100;
  const fmt = (v: number) => formatVal ? formatVal(v) : `${v.toLocaleString("vi-VN")} ${unit}`;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--mh-ink-soft)", fontFamily: "'Geist Mono', monospace", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
        <span className="mh__mono" style={{ fontSize: 12, fontWeight: 600, color: critical ? "var(--mh-red)" : warning ? "var(--mh-amber)" : "var(--mh-ink)" }}>
          {fmt(used)} {!unlimited && `/ ${fmt(total)}`}
          {unlimited && <span style={{ color: "var(--mh-green)" }}>∞ không giới hạn</span>}
        </span>
      </div>
      {!unlimited && (
        <div style={{ height: 8, background: "var(--mh-ivory-2)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            width: `${pct}%`,
            height: "100%",
            background: critical ? "var(--mh-red)" : warning ? "var(--mh-amber)" : "var(--mh-teal)",
            transition: "width .3s",
          }} />
        </div>
      )}
      {warning && (
        <div style={{ marginTop: 6, fontSize: 11, color: critical ? "var(--mh-red)" : "var(--mh-amber)" }}>
          {critical ? "⚠ Đã hết quota — " : "⚠ Sắp hết quota — "}
          <a onClick={onUpgrade} style={{ color: "inherit", textDecoration: "underline", cursor: "pointer" }}>nâng cấp để tiếp tục dùng</a>
        </div>
      )}
    </div>
  );
}

// ── Upgrade / Change plan modal ──────────────────────────────────────────────
type PaymentMethod = "vietqr" | "vnpay" | "card";

function UpgradeModal({ currentPlan, preselect, onClose, onConfirm }: { currentPlan: PlanId; preselect: PlanId; onClose: () => void; onConfirm: (plan: PlanId, cycle: BillingCycle) => void }) {
  const [step, setStep] = useState<"select" | "payment">("select");
  const [plan, setPlan] = useState<PlanId>(preselect);
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [method, setMethod] = useState<PaymentMethod>("vietqr");
  const planTier = getPlanById(plan)!;
  const { total, effectiveMonthly, saved } = computeCyclePrice(planTier.monthlyPriceVND, cycle);
  const cycleObj = CYCLES.find((c) => c.cycle === cycle)!;

  if (step === "payment") {
    return (
      <PaymentStep
        plan={plan}
        cycle={cycle}
        total={total}
        method={method}
        onMethodChange={setMethod}
        onBack={() => setStep("select")}
        onClose={onClose}
        onConfirm={() => onConfirm(plan, cycle)}
      />
    );
  }

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="mh__kicker">{currentPlan === "trial" ? "KÍCH HOẠT GÓI" : "ĐỔI GÓI"}</div>
            <h3 style={{ marginTop: 4 }}>Chọn gói phù hợp</h3>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        {/* Plan selection */}
        <div className="mh__kicker" style={{ marginBottom: 8 }}>1. CHỌN GÓI</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }} className="mh-sub__plans-picker">
          {PLANS.map((p) => {
            const selected = plan === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                style={{
                  padding: 16, textAlign: "left",
                  border: "2px solid " + (selected ? p.color : "var(--mh-line)"),
                  background: selected ? "var(--mh-ivory-2)" : "#fff",
                  borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                  position: "relative",
                }}
              >
                {p.popular && <span style={{ position: "absolute", top: -10, right: 10, padding: "3px 10px", background: "var(--mh-amber)", color: "#fff", borderRadius: 999, fontFamily: "'Geist Mono', monospace", fontSize: 9, letterSpacing: ".1em", fontWeight: 700 }}>PHỔ BIẾN</span>}
                <div style={{ fontSize: 16, fontFamily: "'Fraunces', serif", fontWeight: 500, color: p.color }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--mh-ink-soft)", fontStyle: "italic", marginTop: 2 }}>{p.tagline}</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, marginTop: 10, color: "var(--mh-ink)" }}>{formatVND(p.monthlyPriceVND)}<span style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>/tháng</span></div>
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                  {p.highlights.slice(0, 3).map((h, i) => <div key={i} style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>• {h}</div>)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Cycle selection */}
        <div className="mh__kicker" style={{ marginBottom: 8 }}>2. CHỌN CHU KỲ THANH TOÁN</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }} className="mh-sub__cycle-picker">
          {CYCLES.map((c) => {
            const selected = cycle === c.cycle;
            const { total: ct, effectiveMonthly: em } = computeCyclePrice(planTier.monthlyPriceVND, c.cycle);
            return (
              <button
                key={c.cycle}
                type="button"
                onClick={() => setCycle(c.cycle)}
                style={{
                  padding: 14, textAlign: "center",
                  border: "2px solid " + (selected ? "var(--mh-teal)" : "var(--mh-line)"),
                  background: selected ? "var(--mh-ivory-2)" : "#fff",
                  borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                  position: "relative",
                }}
              >
                {c.discountPct > 0 && <span style={{ position: "absolute", top: -8, right: 8, padding: "2px 8px", background: "var(--mh-green)", color: "#fff", borderRadius: 999, fontFamily: "'Geist Mono', monospace", fontSize: 9, fontWeight: 700 }}>-{c.discountPct}%</span>}
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "var(--mh-teal)", marginTop: 6 }}>{formatVND(em)}<span style={{ fontSize: 10, color: "var(--mh-ink-soft)" }}>/th</span></div>
                <div className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)", marginTop: 4 }}>
                  Tổng {formatVND(ct)}
                </div>
                <div style={{ fontSize: 10, color: "var(--mh-ink-soft)", marginTop: 2, fontStyle: "italic" }}>{c.sublabel}</div>
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div style={{ padding: 18, background: "linear-gradient(135deg, var(--mh-ivory-2), var(--mh-amber-soft))", borderRadius: 12, border: "1px solid var(--mh-line)", marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "baseline" }}>
            <span style={{ fontSize: 14 }}>Gói <strong>{planTier.name}</strong> · {cycleObj.label}</span>
            <span className="mh__mono" style={{ fontSize: 14 }}>{formatVND(planTier.monthlyPriceVND * cycleObj.months)}</span>
          </div>
          {saved > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "baseline", marginTop: 6, color: "var(--mh-green)" }}>
              <span style={{ fontSize: 14 }}>Giảm giá chu kỳ {cycleObj.discountPct}%</span>
              <span className="mh__mono" style={{ fontSize: 14 }}>−{formatVND(saved)}</span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "baseline", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--mh-line)" }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Tổng thanh toán hôm nay</span>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: "var(--mh-teal)" }}>{formatVND(total)}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--mh-ink-soft)", marginTop: 4, textAlign: "right" }}>≈ {formatVND(effectiveMonthly)}/tháng</div>
        </div>

        <div style={{ padding: 12, background: "var(--mh-ivory-2)", borderRadius: 8, fontSize: 12, color: "var(--mh-ink-soft)", marginBottom: 16 }}>
          🔒 Thanh toán qua VNPay QR / Thẻ tín dụng / Chuyển khoản. Có thể huỷ tự động gia hạn bất cứ lúc nào, gói vẫn dùng đến hết chu kỳ đã trả.
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="mh__btn" onClick={onClose}>Huỷ</button>
          <button className="mh__btn mh__btn--primary" onClick={() => setStep("payment")}>Tiếp → Thanh toán {formatVND(total)}</button>
        </div>
      </div>
    </div>
  );
}

// ── Payment step — VietQR / VNPay / Card ────────────────────────────────────
const REBORN_BANK = {
  bankCode: "VCB", // Vietcombank
  bankName: "Vietcombank · CN TP. HCM",
  accountNo: "0971123456789",
  accountName: "CONG TY CO PHAN REBORN JSC",
};

function PaymentStep({ plan, cycle, total, method, onMethodChange, onBack, onClose, onConfirm }: {
  plan: PlanId;
  cycle: BillingCycle;
  total: number;
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  onBack: () => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [copied, setCopied] = useState<string>("");
  const [countdown, setCountdown] = useState(15 * 60); // 15 phút

  // Mã đơn unique — mentor paste vào nội dung chuyển khoản để BE auto-match
  const orderId = React.useMemo(() => `MH${plan.toUpperCase()}${cycle.charAt(0).toUpperCase()}${Date.now().toString().slice(-6)}`, [plan, cycle]);
  const transferContent = `NANGCAP ${plan.toUpperCase()} ${orderId}`;
  const planTier = getPlanById(plan)!;
  const cycleObj = CYCLES.find((c) => c.cycle === cycle)!;

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const expired = countdown === 0;

  // VietQR image URL — https://vietqr.io docs
  // Format: https://img.vietqr.io/image/{BANK}-{ACCOUNT}-{TEMPLATE}.png?amount=&addInfo=&accountName=
  const vietQrUrl = `https://img.vietqr.io/image/${REBORN_BANK.bankCode}-${REBORN_BANK.accountNo}-compact2.png?amount=${total}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(REBORN_BANK.accountName)}`;

  const copy = (text: string, tag: string) => {
    navigator.clipboard.writeText(text);
    setCopied(tag);
    setTimeout(() => setCopied(""), 2500);
  };

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="mh__btn mh__btn--ghost" onClick={onBack} style={{ padding: 6 }}>←</button>
            <div>
              <div className="mh__kicker">THANH TOÁN</div>
              <h3 style={{ marginTop: 4 }}>Gói {planTier.name} · {cycleObj.label}</h3>
            </div>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        {/* Method picker */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }} className="mh-pay-methods">
          {[
            { v: "vietqr" as const, icon: "🏦", title: "Chuyển khoản", sub: "VietQR · khuyên dùng" },
            { v: "vnpay" as const, icon: "💳", title: "VNPay QR", sub: "QR đa ngân hàng" },
            { v: "card" as const, icon: "💳", title: "Thẻ tín dụng", sub: "Visa/Master/JCB" },
          ].map((o) => {
            const selected = method === o.v;
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => onMethodChange(o.v)}
                style={{
                  padding: 14, textAlign: "center", fontFamily: "inherit",
                  border: "2px solid " + (selected ? "var(--mh-teal)" : "var(--mh-line)"),
                  background: selected ? "var(--mh-ivory-2)" : "#fff",
                  borderRadius: 10, cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{o.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{o.title}</div>
                <div className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)", marginTop: 2 }}>{o.sub}</div>
              </button>
            );
          })}
        </div>

        {method === "vietqr" && (
          <>
            {/* Countdown */}
            <div style={{ padding: "10px 14px", background: expired ? "#FEE2E2" : "var(--mh-amber-soft)", borderRadius: 8, border: "1px solid " + (expired ? "#FCA5A5" : "rgba(180, 88, 9, 0.2)"), fontSize: 13, marginBottom: 16, display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
              <span>{expired ? "⏱ Đơn đã hết hạn. Bấm Huỷ và tạo lại." : "⏱ QR có hiệu lực trong"}</span>
              <span className="mh__mono" style={{ fontSize: 16, fontWeight: 700, color: expired ? "var(--mh-red)" : "var(--mh-amber)" }}>{expired ? "HẾT HẠN" : timeLabel}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, marginBottom: 16 }} className="mh-pay-vietqr">
              {/* QR image */}
              <div style={{ background: "#fff", padding: 12, borderRadius: 14, border: "2px solid var(--mh-line)", textAlign: "center" }}>
                <img
                  src={vietQrUrl}
                  alt="VietQR Reborn JSC"
                  style={{ width: 220, height: 220, display: "block", opacity: expired ? 0.3 : 1 }}
                  onError={(e) => {
                    // Fallback nếu vietqr.io không truy cập được — dùng placeholder
                    (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml;charset=utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><rect width='220' height='220' fill='#F4EFE6'/><text x='50%' y='50%' font-family='monospace' font-size='12' fill='#6B7A72' text-anchor='middle'>VietQR (preview)</text><text x='50%' y='58%' font-family='monospace' font-size='10' fill='#6B7A72' text-anchor='middle'>${total.toLocaleString()} VND</text></svg>`);
                  }}
                />
                <div className="mh__mono" style={{ fontSize: 10, color: "var(--mh-ink-soft)", marginTop: 8 }}>Quét bằng app Momo/Viettel/BIDV/VCB/…</div>
              </div>

              {/* Bank info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div className="mh__mono" style={{ fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--mh-ink-soft)" }}>Ngân hàng</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{REBORN_BANK.bankName}</div>
                </div>
                <BankRow label="Số tài khoản" value={REBORN_BANK.accountNo} copied={copied === "acc"} onCopy={() => copy(REBORN_BANK.accountNo, "acc")} mono />
                <BankRow label="Chủ tài khoản" value={REBORN_BANK.accountName} copied={copied === "name"} onCopy={() => copy(REBORN_BANK.accountName, "name")} />
                <BankRow label="Số tiền" value={formatVND(total)} copied={copied === "amt"} onCopy={() => copy(String(total), "amt")} accent mono />
                <BankRow label="Nội dung chuyển khoản" value={transferContent} copied={copied === "ct"} onCopy={() => copy(transferContent, "ct")} mono warning />
              </div>
            </div>

            <div style={{ padding: 12, background: "#FEE2E2", borderRadius: 8, fontSize: 12, color: "var(--mh-red)", marginBottom: 16, border: "1px solid #FCA5A5" }}>
              ⚠ <strong>Quan trọng:</strong> Ghi đúng <em>nội dung chuyển khoản</em> trên để hệ thống tự động khớp lệnh. Thiếu nội dung này có thể kích hoạt chậm 24h.
            </div>

            <div style={{ padding: 12, background: "var(--mh-ivory-2)", borderRadius: 8, fontSize: 12, color: "var(--mh-ink-soft)", marginBottom: 20 }}>
              💡 <strong>Cách nhanh nhất:</strong> Mở app banking/Momo → Quét QR → số tiền + nội dung đã tự điền → xác nhận. Gói sẽ kích hoạt trong vòng 1-5 phút sau khi nhận tiền.
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <span className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>Mã đơn: {orderId}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="mh__btn" onClick={onClose}>Huỷ</button>
                <button className="mh__btn mh__btn--primary" onClick={onConfirm} disabled={expired}>✓ Tôi đã chuyển khoản</button>
              </div>
            </div>
          </>
        )}

        {method === "vnpay" && (
          <div style={{ padding: 40, textAlign: "center", background: "var(--mh-ivory-2)", borderRadius: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
            <h3 style={{ marginBottom: 8 }}>Chuyển đến VNPay</h3>
            <p style={{ fontSize: 13, color: "var(--mh-ink-soft)", marginBottom: 20 }}>Sẽ chuyển qua trang VNPay để quét QR bằng app ngân hàng/ví điện tử của bạn. Hỗ trợ 40+ ngân hàng + Momo + ZaloPay.</p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Số tiền:</span>
              <strong>{formatVND(total)}</strong>
            </div>
            <button className="mh__btn mh__btn--primary" style={{ marginTop: 20, width: "100%", justifyContent: "center" }} onClick={onConfirm}>→ Tiếp tục với VNPay</button>
          </div>
        )}

        {method === "card" && (
          <div style={{ padding: 40, textAlign: "center", background: "var(--mh-ivory-2)", borderRadius: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
            <h3 style={{ marginBottom: 8 }}>Thẻ tín dụng / ghi nợ quốc tế</h3>
            <p style={{ fontSize: 13, color: "var(--mh-ink-soft)", marginBottom: 20 }}>Visa / Mastercard / JCB / Amex. Xử lý qua Stripe hoặc Onepay. Phí xử lý 2.9% + 2.000đ sẽ được cộng vào tổng.</p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Số tiền:</span>
              <strong>{formatVND(total)}</strong>
            </div>
            <button className="mh__btn mh__btn--primary" style={{ marginTop: 20, width: "100%", justifyContent: "center" }} onClick={onConfirm}>→ Nhập thông tin thẻ</button>
          </div>
        )}

        {method !== "vietqr" && (
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="mh__btn" onClick={onClose}>Huỷ</button>
          </div>
        )}
      </div>
    </div>
  );
}

function BankRow({ label, value, copied, onCopy, mono, accent, warning }: { label: string; value: string; copied: boolean; onCopy: () => void; mono?: boolean; accent?: boolean; warning?: boolean }) {
  return (
    <div>
      <div className="mh__mono" style={{ fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: warning ? "var(--mh-red)" : "var(--mh-ink-soft)", marginBottom: 3 }}>
        {label}{warning && " ⚠"}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px",
        background: accent ? "var(--mh-ivory-2)" : warning ? "#FFF9ED" : "#fff",
        border: "1px solid " + (warning ? "rgba(180, 88, 9, 0.3)" : "var(--mh-line)"),
        borderRadius: 8,
      }}>
        <span style={{
          flex: 1,
          fontFamily: mono ? "'Geist Mono', monospace" : "inherit",
          fontSize: accent ? 18 : 13,
          fontWeight: accent ? 600 : 500,
          color: accent ? "var(--mh-teal)" : "var(--mh-ink)",
          wordBreak: "break-all",
        }}>
          {value}
        </span>
        <button
          type="button"
          className="mh__btn"
          style={{ padding: "4px 10px", fontSize: 11 }}
          onClick={onCopy}
        >
          {copied ? "✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}

// ── Cancel renewal confirm ──────────────────────────────────────────────────
function CancelConfirmModal({ currentPlan, periodEnd, onClose, onConfirm }: { currentPlan: PlanTier; periodEnd: string; onClose: () => void; onConfirm: () => void }) {
  const endDate = new Date(periodEnd).toLocaleDateString("vi-VN");

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEE2E2", color: "var(--mh-red)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>⚠</div>
          <div>
            <h3 style={{ marginBottom: 6 }}>Huỷ gia hạn gói {currentPlan.name}?</h3>
            <p style={{ fontSize: 14, color: "var(--mh-ink-soft)", lineHeight: 1.5, margin: 0 }}>
              Gói vẫn hoạt động đến hết <strong>{endDate}</strong>. Sau đó sẽ tự động chuyển về <strong>trial hạn chế</strong> (5 buổi AI/tháng, 100 tin Zalo).
            </p>
          </div>
        </div>

        <div style={{ padding: 14, background: "#FEF2F2", borderRadius: 10, fontSize: 13, marginBottom: 16, border: "1px solid #FCA5A5" }}>
          <strong>Điều bạn sẽ mất sau {endDate}:</strong>
          <ul style={{ margin: "6px 0 0", paddingLeft: 20 }}>
            <li>Quota {currentPlan.features.aiSessions} buổi AI/tháng → còn 5</li>
            <li>Quota {currentPlan.features.zaloMessages === -1 ? "không giới hạn" : currentPlan.features.zaloMessages} tin Zalo → còn 100</li>
            {currentPlan.features.customBranding && <li>Bị hiện lại footer "qua MentorHub"</li>}
            {currentPlan.features.prioritySupport && <li>Mất priority support</li>}
          </ul>
        </div>

        <div style={{ padding: 12, background: "var(--mh-ivory-2)", borderRadius: 8, fontSize: 12, color: "var(--mh-ink-soft)", marginBottom: 16 }}>
          💡 Có thể bật lại gia hạn bất cứ lúc nào trước {endDate} mà không bị tính thêm phí.
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="mh__btn" onClick={onClose}>Giữ gói</button>
          <button className="mh__btn mh__btn--danger" onClick={onConfirm}>Xác nhận huỷ gia hạn</button>
        </div>
      </div>
    </div>
  );
}
