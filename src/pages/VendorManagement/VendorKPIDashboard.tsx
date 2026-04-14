import React, { useMemo, useState } from "react";
import {
  MOCK_VENDORS, MOCK_VENDOR_CONTRACTS, MOCK_VENDOR_INVOICES,
  MOCK_SERVICE_REQUESTS, MOCK_MAINTENANCE_PLANS, MOCK_DEBTS,
  VENDOR_SERVICE_TYPES,
} from "assets/mock/TNPMData";

const fmtMoney = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

// Compute per-vendor KPI from all related data
function computeVendorKPI(vendor: any) {
  const contracts = MOCK_VENDOR_CONTRACTS.filter((c: any) => c.vendorId === vendor.id && c.status === "active");
  const contractValue = contracts.reduce((a: number, c: any) => a + (c.value || 0), 0);

  const srs = MOCK_SERVICE_REQUESTS.filter((sr: any) => sr.assignedVendorId === vendor.id);
  const srTotal = srs.length;
  const srResolved = srs.filter((sr: any) => sr.status === "resolved" || sr.status === "closed").length;
  const srOnTime = srs.filter((sr: any) => {
    if (sr.status !== "resolved" && sr.status !== "closed") return false;
    if (!sr.completedAt || !sr.dueAt) return false;
    return new Date(sr.completedAt) <= new Date(sr.dueAt);
  }).length;
  const slaMetPct = srResolved > 0 ? (srOnTime / srResolved * 100) : 100;
  const completionPct = srTotal > 0 ? (srResolved / srTotal * 100) : 0;

  const invoices = MOCK_VENDOR_INVOICES.filter((i: any) => i.vendorId === vendor.id);
  const paidInvoices = invoices.filter((i: any) => i.approvalStatus === "approved" && i.paidAt);
  const avgApproveDays = paidInvoices.length > 0
    ? paidInvoices.reduce((a: number, i: any) => {
        const submitted = new Date(i.submittedAt).getTime();
        const paid = new Date(i.paidAt).getTime();
        return a + (paid - submitted) / (1000 * 60 * 60 * 24);
      }, 0) / paidInvoices.length
    : 0;

  const threeWayOkPct = invoices.length > 0
    ? (invoices.filter((i: any) => i.matchPO && i.matchAcceptance).length / invoices.length * 100)
    : 100;

  const debts = MOCK_DEBTS.filter((d: any) => d.kind === "payable" && d.counterpartyType === "vendor" && d.counterpartyId === vendor.id);
  const totalDebt = debts.reduce((a: number, d: any) => a + d.amount, 0);

  const maintPlans = MOCK_MAINTENANCE_PLANS.filter((mp: any) => mp.vendorId === vendor.id).length;

  // Overall score: weighted (SLA 40% + Rating 30% + Completion 20% + 3way 10%)
  const score = (slaMetPct * 0.4 + vendor.rating * 20 * 0.3 + completionPct * 0.2 + threeWayOkPct * 0.1);

  return {
    ...vendor,
    contractCount: contracts.length, contractValue,
    srTotal, srResolved, srOnTime, slaMetPct, completionPct,
    invoiceCount: invoices.length, avgApproveDays, threeWayOkPct,
    totalDebt, debtCount: debts.length,
    maintPlans,
    overallScore: score,
  };
}

export default function VendorKPIDashboard() {
  document.title = "Vendor KPI Dashboard – TNPM";

  const [filterService, setFilterService] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "sla" | "debt" | "rating">("score");

  const vendorsWithKPI = useMemo(() => {
    return MOCK_VENDORS.map(computeVendorKPI);
  }, []);

  const filtered = useMemo(() => {
    let list = vendorsWithKPI;
    if (filterService) list = list.filter((v: any) => v.serviceTypes.includes(filterService));
    list = [...list].sort((a: any, b: any) => {
      if (sortBy === "score") return b.overallScore - a.overallScore;
      if (sortBy === "sla") return b.slaMetPct - a.slaMetPct;
      if (sortBy === "debt") return b.totalDebt - a.totalDebt;
      return b.rating - a.rating;
    });
    return list;
  }, [vendorsWithKPI, filterService, sortBy]);

  // Portfolio-level KPI (match HLD p.17 targets)
  const avgSlaMet = filtered.length > 0 ? filtered.reduce((a: number, v: any) => a + v.slaMetPct, 0) / filtered.length : 0;
  const avgApproveDays = filtered.length > 0 ? filtered.reduce((a: number, v: any) => a + v.avgApproveDays, 0) / filtered.length : 0;
  const avgRating = filtered.length > 0 ? filtered.reduce((a: number, v: any) => a + v.rating, 0) / filtered.length : 0;
  const totalContractValue = filtered.reduce((a: number, v: any) => a + v.contractValue, 0);
  const totalDebtAll = filtered.reduce((a: number, v: any) => a + v.totalDebt, 0);

  // HLD targets
  const SLA_TARGET = 95;
  const APPROVE_TARGET = 5;
  const RATING_TARGET = 4;

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎯 Vendor KPI Dashboard</h1>
          <p className="page-sub">Đánh giá hiệu suất Nhà cung cấp theo SLA, thời gian phê duyệt, rating — bám KPI HLD p.17</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select className="filter-select" value={filterService} onChange={(e) => setFilterService(e.target.value)}>
            <option value="">Tất cả loại DV</option>
            {VENDOR_SERVICE_TYPES.map((t: any) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="score">Sắp xếp: Điểm tổng</option>
            <option value="sla">SLA met %</option>
            <option value="rating">Rating</option>
            <option value="debt">Công nợ cao nhất</option>
          </select>
        </div>
      </div>

      {/* Portfolio KPI vs HLD targets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          {
            label: "SLA met trung bình",
            value: `${avgSlaMet.toFixed(1)}%`,
            target: `Target ≥ ${SLA_TARGET}%`,
            color: avgSlaMet >= SLA_TARGET ? "#52c41a" : avgSlaMet >= 80 ? "#faad14" : "#ff4d4f",
            icon: "⏱️",
            status: avgSlaMet >= SLA_TARGET ? "ĐẠT" : "CHƯA ĐẠT",
          },
          {
            label: "Thời gian duyệt TT TB",
            value: `${avgApproveDays.toFixed(1)} ngày`,
            target: `Target < ${APPROVE_TARGET} ngày`,
            color: avgApproveDays <= APPROVE_TARGET ? "#52c41a" : "#ff4d4f",
            icon: "✅",
            status: avgApproveDays <= APPROVE_TARGET ? "ĐẠT" : "CHƯA ĐẠT",
          },
          {
            label: "Rating NCC trung bình",
            value: `${avgRating.toFixed(2)} ⭐`,
            target: `Target ≥ ${RATING_TARGET}/5`,
            color: avgRating >= RATING_TARGET ? "#52c41a" : "#faad14",
            icon: "⭐",
            status: avgRating >= RATING_TARGET ? "ĐẠT" : "CHƯA ĐẠT",
          },
          {
            label: "Tổng giá trị HĐ active",
            value: fmtMoney(totalContractValue),
            target: `${filtered.length} NCC`,
            color: "#1890ff",
            icon: "💼",
            status: "",
          },
          {
            label: "Công nợ phải trả NCC",
            value: fmtMoney(totalDebtAll),
            target: `${filtered.reduce((a: number, v: any) => a + v.debtCount, 0)} khoản`,
            color: totalDebtAll > 0 ? "#ff4d4f" : "#52c41a",
            icon: "💸",
            status: "",
          },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 14px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div style={{ fontSize: 16 }}>{s.icon}</div>
              {s.status && (
                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 8, background: `${s.color}22`, color: s.color, fontWeight: 700 }}>
                  {s.status}
                </span>
              )}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#1a1a2e", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 2 }}>{s.target}</div>
          </div>
        ))}
      </div>

      {/* Vendor KPI ranking table */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", fontWeight: 600, fontSize: 15, borderBottom: "1px solid #f0f0f0" }}>
          📋 Bảng xếp hạng NCC theo hiệu suất
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>NCC</th>
              <th>Loại DV chính</th>
              <th>HĐ active / Giá trị</th>
              <th>SLA met</th>
              <th>Hoàn thành</th>
              <th>Time approve TB</th>
              <th>3-way match</th>
              <th>Rating</th>
              <th>Công nợ</th>
              <th>Điểm tổng</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v: any, idx: number) => (
              <tr key={v.id}>
                <td style={{ textAlign: "center", fontWeight: 700 }}>
                  {idx < 3 ? ["🥇", "🥈", "🥉"][idx] : idx + 1}
                </td>
                <td style={{ fontWeight: 500 }}>
                  <div>{v.name}</div>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>{v.code}</div>
                </td>
                <td style={{ fontSize: 11 }}>
                  {v.serviceTypes.slice(0, 2).map((s: string) => VENDOR_SERVICE_TYPES.find((t: any) => t.value === s)?.label || s).join(", ")}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{v.contractCount}</div>
                  <div className="amount-text" style={{ fontSize: 11 }}>{fmtMoney(v.contractValue)}</div>
                </td>
                <td>
                  <div style={{ fontSize: 13, fontWeight: 700, color: v.slaMetPct >= 95 ? "#52c41a" : v.slaMetPct >= 80 ? "#faad14" : "#ff4d4f" }}>
                    {v.slaMetPct.toFixed(0)}%
                  </div>
                  <div style={{ height: 4, background: "#f0f0f0", borderRadius: 2, marginTop: 2 }}>
                    <div style={{ width: `${v.slaMetPct}%`, height: "100%", background: v.slaMetPct >= 95 ? "#52c41a" : "#faad14", borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#8c8c8c" }}>{v.srOnTime}/{v.srResolved}</div>
                </td>
                <td style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 600 }}>{v.completionPct.toFixed(0)}%</div>
                  <div style={{ fontSize: 10, color: "#8c8c8c" }}>{v.srResolved}/{v.srTotal}</div>
                </td>
                <td style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: v.avgApproveDays <= 5 ? "#52c41a" : "#ff4d4f" }}>
                    {v.avgApproveDays > 0 ? `${v.avgApproveDays.toFixed(1)}d` : "—"}
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 600, color: v.threeWayOkPct >= 95 ? "#52c41a" : v.threeWayOkPct >= 70 ? "#faad14" : "#ff4d4f" }}>
                    {v.threeWayOkPct.toFixed(0)}%
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color: "#faad14" }}>{v.rating} ⭐</div>
                </td>
                <td className="amount-text" style={{ color: v.totalDebt > 0 ? "#ff4d4f" : "#8c8c8c" }}>
                  {v.totalDebt > 0 ? fmtMoney(v.totalDebt) : "—"}
                </td>
                <td>
                  <div style={{
                    display: "inline-block", padding: "6px 12px", borderRadius: 20,
                    background: v.overallScore >= 90 ? "#f6ffed" : v.overallScore >= 75 ? "#fff7e6" : "#fff1f0",
                    color: v.overallScore >= 90 ? "#52c41a" : v.overallScore >= 75 ? "#faad14" : "#ff4d4f",
                    fontWeight: 700, fontSize: 13,
                  }}>
                    {v.overallScore.toFixed(1)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: "12px 20px", background: "#f0f7ff", borderTop: "2px solid #bfdbfe", fontSize: 12, color: "#1890ff" }}>
          💡 <strong>Công thức điểm tổng:</strong> SLA met × 40% + Rating × 30% + Hoàn thành × 20% + 3-way OK × 10%.
          Điểm ≥ 90 = xuất sắc, 75-90 = tốt, &lt; 75 = cần cải thiện.
        </div>
      </div>
    </div>
  );
}
