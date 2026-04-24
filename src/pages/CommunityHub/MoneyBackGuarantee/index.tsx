// [FitPro Phase 2.1] Money-Back Guarantee dashboard
// URD: docs/urd/part-15-fitpro-phygital-roadmap.md#ur-fitpro-mbg
import React, { useState } from "react";
import { MOCK_MBG_CLAIMS, MOCK_MBG_RULE, MBG_STATS, MBGClaim, MBGClaimStatus } from "@/mocks/community-hub/mbg";
import { formatCurrency } from "reborn-util";

const STATUS_META: Record<MBGClaimStatus, { label: string; bg: string; color: string }> = {
  eligible:  { label: "Đủ điều kiện", bg: "#E0EBFF", color: "#1E40AF" },
  submitted: { label: "Đã submit",   bg: "#FEF3C7", color: "#92400E" },
  reviewing: { label: "Đang review", bg: "#FEF3C7", color: "#92400E" },
  approved:  { label: "Đã duyệt",    bg: "#D1FAE5", color: "#065F46" },
  rejected:  { label: "Từ chối",     bg: "#FEE2E2", color: "#991B1B" },
  refunded:  { label: "Đã hoàn tiền", bg: "#D1FAE5", color: "#065F46" },
};

export default function MoneyBackGuaranteePage() {
  document.title = "Cam kết hoàn tiền 30 ngày — FitPro";
  const [claims, setClaims] = useState<MBGClaim[]>(MOCK_MBG_CLAIMS);
  const [detailClaim, setDetailClaim] = useState<MBGClaim | null>(null);
  const [tab, setTab] = useState<"claims" | "rule">("claims");
  const [rule, setRule] = useState(MOCK_MBG_RULE);
  const f = (v: number) => formatCurrency(v, ".", "");

  const approve = (id: string, note: string) => {
    setClaims(claims.map((c) => c.id === id ? {
      ...c,
      status: "approved" as MBGClaimStatus,
      reviewerNote: note,
      reviewerId: "ADMIN-001",
      refundAmountVnd: c.packagePriceVnd,
      refundedAt: new Date().toISOString(),
    } : c));
    setDetailClaim(null);
    alert(`✓ Đã duyệt hoàn tiền. Phiếu chi được tạo ở quỹ "${rule.reserveFundId}". Xem Tài chính → Sổ thu chi.`);
  };

  const reject = (id: string, note: string) => {
    setClaims(claims.map((c) => c.id === id ? { ...c, status: "rejected" as MBGClaimStatus, reviewerNote: note, reviewerId: "ADMIN-001" } : c));
    setDetailClaim(null);
  };

  return (
    <div style={{ padding: 20, background: "#F5F9F8", minHeight: "calc(100vh - 60px)" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#0B2E2A" }}>💸 Cam kết hoàn tiền 30 ngày (MBG)</h2>
        <p style={{ fontSize: 13, color: "#6B8A85", marginTop: 4 }}>
          Hội viên không đạt kết quả trong 30 ngày → hệ thống bảo lãnh hoàn tiền 100%. Đây là USP sống còn của mô hình Phygital (PDF trang 7).
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Quỹ MBG dự phòng", value: `${f(MBG_STATS.reserveBalanceVnd)}đ`, color: "#00C9A7" },
          { label: "Hội viên đang bảo hiểm", value: `${MBG_STATS.memberActiveCount}`, color: "#2563EB" },
          { label: "Đủ điều kiện claim", value: `${MBG_STATS.eligibleCount}`, color: "#F59E0B" },
          { label: "Chờ review", value: `${MBG_STATS.pendingReviewCount}`, color: "#F59E0B" },
          { label: "Đã hoàn tháng này", value: `${MBG_STATS.thisMonthApprovedCount}`, color: "#E85D4B" },
          { label: "Tổng đã hoàn tháng này", value: `${f(MBG_STATS.thisMonthApprovedVnd)}đ`, color: "#E85D4B" },
        ].map((k) => (
          <div key={k.label} style={{ background: "#fff", borderRadius: 10, padding: 14, borderLeft: `4px solid ${k.color}`, boxShadow: "0 2px 8px rgba(11,46,42,0.05)" }}>
            <div style={{ fontSize: 11, color: "#6B8A85", textTransform: "uppercase", letterSpacing: 0.4 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0B2E2A", marginTop: 4 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setTab("claims")}
          style={{
            padding: "8px 16px", borderRadius: 999,
            border: tab === "claims" ? "2px solid #00C9A7" : "1px solid #d9e0de",
            background: tab === "claims" ? "#E4F7F3" : "#fff",
            color: tab === "claims" ? "#0B2E2A" : "#6B8A85",
            fontWeight: 700, cursor: "pointer",
          }}
        >
          📋 Danh sách claim ({claims.length})
        </button>
        <button
          onClick={() => setTab("rule")}
          style={{
            padding: "8px 16px", borderRadius: 999,
            border: tab === "rule" ? "2px solid #00C9A7" : "1px solid #d9e0de",
            background: tab === "rule" ? "#E4F7F3" : "#fff",
            color: tab === "rule" ? "#0B2E2A" : "#6B8A85",
            fontWeight: 700, cursor: "pointer",
          }}
        >
          ⚙️ Cấu hình rule
        </button>
      </div>

      {tab === "claims" && (
        <div style={{ background: "#fff", borderRadius: 10, padding: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F5F9F8", textAlign: "left" }}>
                <th style={thStyle}>Mã claim</th>
                <th style={thStyle}>Hội viên</th>
                <th style={thStyle}>Gói + Giá</th>
                <th style={thStyle}>Trạm</th>
                <th style={thStyle}>Chỉ số (baseline → hiện tại)</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => {
                const meta = STATUS_META[c.status];
                const weightDeltaPct = ((c.baselineWeightKg - c.currentWeightKg) / c.baselineWeightKg) * 100;
                const bfDelta = c.baselineBodyFatPct - c.currentBodyFatPct;
                return (
                  <tr key={c.id} style={{ borderTop: "1px solid #E0E8E5" }}>
                    <td style={tdStyle}><code>{c.id}</code></td>
                    <td style={tdStyle}>
                      <strong>{c.memberName}</strong>
                      <div style={{ fontSize: 11, color: "#6B8A85" }}>{c.memberId}</div>
                    </td>
                    <td style={tdStyle}>
                      {c.packageName}
                      <div style={{ fontSize: 11, color: "#6B8A85" }}>{f(c.packagePriceVnd)}đ</div>
                    </td>
                    <td style={tdStyle}>{c.stationCode}</td>
                    <td style={tdStyle} title="Giảm cân %, delta body fat">
                      <div>Cân: {c.baselineWeightKg} → {c.currentWeightKg}kg ({weightDeltaPct >= rule.thresholdWeightLossPct ? "✅" : "❌"} {weightDeltaPct.toFixed(1)}%)</div>
                      <div style={{ fontSize: 11, color: "#6B8A85" }}>BF: {c.baselineBodyFatPct} → {c.currentBodyFatPct}% ({bfDelta >= rule.thresholdBodyFatDropPct ? "✅" : "❌"} {bfDelta.toFixed(1)})</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ padding: "3px 10px", borderRadius: 999, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => setDetailClaim(c)}
                        style={{
                          padding: "4px 10px", background: "#00C9A7", color: "#fff",
                          border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
                        }}
                      >
                        👁 Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "rule" && (
        <div style={{ background: "#fff", borderRadius: 10, padding: 20, maxWidth: 720 }}>
          <h3 style={{ marginTop: 0, color: "#0B2E2A" }}>Rule MBG — ngưỡng xét hoàn tiền</h3>
          <p style={{ fontSize: 12, color: "#6B8A85" }}>
            Hội viên chỉ được hoàn tiền nếu <strong>không đạt bất kỳ</strong> trong 3 điều kiện dưới. Nếu đạt 1 điều kiện thôi là đã có kết quả → không eligibility.
          </p>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Ngưỡng giảm cân (%) — mặc định 3%</label>
            <input type="number" min={0} max={20} step={0.5} value={rule.thresholdWeightLossPct}
              onChange={(e) => setRule({ ...rule, thresholdWeightLossPct: Number(e.target.value) })}
              style={inputStyle} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Ngưỡng giảm body fat (điểm %) — mặc định 2</label>
            <input type="number" min={0} max={10} step={0.5} value={rule.thresholdBodyFatDropPct}
              onChange={(e) => setRule({ ...rule, thresholdBodyFatDropPct: Number(e.target.value) })}
              style={inputStyle} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Ngưỡng giảm BMI (đơn vị) — mặc định 1</label>
            <input type="number" min={0} max={5} step={0.1} value={rule.thresholdBmiDrop}
              onChange={(e) => setRule({ ...rule, thresholdBmiDrop: Number(e.target.value) })}
              style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Cửa sổ claim — từ ngày</label>
              <input type="number" value={rule.windowFromDay}
                onChange={(e) => setRule({ ...rule, windowFromDay: Number(e.target.value) })}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>đến ngày</label>
              <input type="number" value={rule.windowToDay}
                onChange={(e) => setRule({ ...rule, windowToDay: Number(e.target.value) })}
                style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>% giá gói trích vào quỹ MBG-Reserve mỗi khi bán</label>
            <input type="number" min={0} max={30} value={rule.reservePctOfPackage}
              onChange={(e) => setRule({ ...rule, reservePctOfPackage: Number(e.target.value) })}
              style={inputStyle} />
            <div style={{ fontSize: 11, color: "#6B8A85", marginTop: 4 }}>
              VD: bán gói 2.4tr, trích 10% = 240k vào quỹ. Dùng quỹ này chi khi có claim duyệt.
            </div>
          </div>

          <button
            onClick={() => alert("✓ Đã lưu rule MBG.\n(Prototype — BE service guarantee sẽ persist thực tế)")}
            style={{ padding: "10px 20px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
          >
            💾 Lưu rule
          </button>
        </div>
      )}

      {/* Modal review */}
      {detailClaim && (
        <ReviewModal
          claim={detailClaim}
          onClose={() => setDetailClaim(null)}
          onApprove={(note) => approve(detailClaim.id, note)}
          onReject={(note) => reject(detailClaim.id, note)}
        />
      )}
    </div>
  );
}

function ReviewModal({ claim, onClose, onApprove, onReject }: {
  claim: MBGClaim;
  onClose: () => void;
  onApprove: (note: string) => void;
  onReject: (note: string) => void;
}) {
  const [note, setNote] = useState(claim.reviewerNote || "");
  const f = (v: number) => formatCurrency(v, ".", "");
  const weightDeltaPct = ((claim.baselineWeightKg - claim.currentWeightKg) / claim.baselineWeightKg) * 100;
  const bfDelta = claim.baselineBodyFatPct - claim.currentBodyFatPct;
  const bmiDelta = claim.baselineBmi - claim.currentBmi;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,46,42,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: 640, maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E0E8E5" }}>
          <h3 style={{ margin: 0, color: "#0B2E2A" }}>💸 Review MBG claim — {claim.id}</h3>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <InfoRow label="Hội viên" value={`${claim.memberName} (${claim.memberId})`} />
            <InfoRow label="Gói" value={`${claim.packageName} — ${f(claim.packagePriceVnd)}đ`} />
            <InfoRow label="Trạm" value={claim.stationCode} />
            <InfoRow label="Ngày mua" value={claim.purchaseDate} />
          </div>

          <h4 style={{ marginTop: 20, color: "#0B2E2A" }}>Chỉ số — Baseline ↔ Hiện tại</h4>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#F5F9F8" }}>
              <th style={thStyle}>Chỉ số</th>
              <th style={thStyle}>Baseline</th>
              <th style={thStyle}>Hiện tại</th>
              <th style={thStyle}>Thay đổi</th>
              <th style={thStyle}>Đạt ngưỡng?</th>
            </tr></thead>
            <tbody>
              <tr style={{ borderTop: "1px solid #E0E8E5" }}>
                <td style={tdStyle}>Cân nặng (kg)</td>
                <td style={tdStyle}>{claim.baselineWeightKg}</td>
                <td style={tdStyle}>{claim.currentWeightKg}</td>
                <td style={tdStyle}>−{weightDeltaPct.toFixed(1)}%</td>
                <td style={tdStyle}>{claim.metWeightTarget ? "✅ Đạt (≥3%)" : "❌ Chưa (<3%)"}</td>
              </tr>
              <tr style={{ borderTop: "1px solid #E0E8E5" }}>
                <td style={tdStyle}>Body fat %</td>
                <td style={tdStyle}>{claim.baselineBodyFatPct}</td>
                <td style={tdStyle}>{claim.currentBodyFatPct}</td>
                <td style={tdStyle}>−{bfDelta.toFixed(1)}đ</td>
                <td style={tdStyle}>{claim.metBodyFatTarget ? "✅ Đạt (≥2đ)" : "❌ Chưa (<2đ)"}</td>
              </tr>
              <tr style={{ borderTop: "1px solid #E0E8E5" }}>
                <td style={tdStyle}>BMI</td>
                <td style={tdStyle}>{claim.baselineBmi}</td>
                <td style={tdStyle}>{claim.currentBmi}</td>
                <td style={tdStyle}>−{bmiDelta.toFixed(1)}</td>
                <td style={tdStyle}>{claim.metBmiTarget ? "✅ Đạt (≥1)" : "❌ Chưa (<1)"}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: 18, padding: 14, background: "#FEF3C7", borderRadius: 8, fontSize: 12 }}>
            <strong>Lý do hội viên:</strong> {claim.memberReason || "(không ghi)"}
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Ghi chú review (bắt buộc)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Xác nhận hội viên tập đủ buổi, Medlatec xét nghiệm tuần qua cho thấy chưa đạt ngưỡng. Duyệt hoàn tiền."
              style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} />
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #E0E8E5", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 18px", background: "#fff", border: "1px solid #d9e0de", borderRadius: 8, color: "#6B8A85", fontWeight: 600, cursor: "pointer" }}>Đóng</button>
          <button disabled={!note.trim()} onClick={() => onReject(note)} style={{ padding: "10px 18px", background: "#fff", color: "#E85D4B", border: "1px solid #E85D4B", borderRadius: 8, fontWeight: 700, cursor: "pointer", opacity: note.trim() ? 1 : 0.5 }}>❌ Từ chối claim</button>
          <button disabled={!note.trim()} onClick={() => onApprove(note)} style={{ padding: "10px 18px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", opacity: note.trim() ? 1 : 0.5 }}>✓ Duyệt hoàn tiền</button>
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: "8px 10px", fontSize: 11, color: "#6B8A85", textTransform: "uppercase", letterSpacing: 0.3, fontWeight: 700 };
const tdStyle: React.CSSProperties = { padding: "10px", fontSize: 13, color: "#0B2E2A", verticalAlign: "top" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, color: "#6B8A85", marginBottom: 4, fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 13, boxSizing: "border-box" };

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6B8A85" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#0B2E2A", marginTop: 2 }}>{value}</div>
    </div>
  );
}
