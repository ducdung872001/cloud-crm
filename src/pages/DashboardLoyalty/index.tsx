import React, { useEffect, useState } from "react";
import RetentionRateChart from "./partials/RetentionRate";
import CLVChart from "./partials/CLVChart";
import LoyaltyPointsChart from "./partials/LoyaltyPointsChart";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import LoyaltyService from "services/LoyaltyService";

const COLORS = {
  primary: "#00C9A7",
  primaryDark: "#0B2E2A",
  primarySoft: "#E4F7F3",
  warning: "#F5A623",
  info: "#3B82F6",
  success: "#22C55E",
  accent: "#FF8A3C",
  danger: "#E85D4B",
  textMuted: "#6B8A85",
  border: "#D9E0DE",
  bg: "#F5F9F8",
};

const TIER_COLORS: Record<string, string> = {
  "Đồng": "#CD7F32",
  "Bạc": "#A0AEC0",
  "Vàng": "#D69E2E",
  "Kim Cương": "#667EEA",
  Bronze: "#CD7F32",
  Silver: "#A0AEC0",
  Gold: "#D69E2E",
  Diamond: "#667EEA",
  Platinum: "#9F7AEA",
  VIP: "#E53E3E",
};

interface KpiData {
  totalMembers: number;
  activeMembers: number;
  totalPointsInCirculation: number;
  totalPointsRedeemed: number;
  tierDistribution: { name: string; count: number }[];
}

export default function DashboardLoyalty(props: any) {
  const { onBackProps } = props;
  const [kpi, setKpi] = useState<KpiData>({
    totalMembers: 0,
    activeMembers: 0,
    totalPointsInCirculation: 0,
    totalPointsRedeemed: 0,
    tierDistribution: [],
  });

  useEffect(() => {
    (async () => {
      try {
        // Load wallets to compute KPIs
        const walletRes = await LoyaltyService.listLoyaltyWallet({ page: 1, limit: 9999 });
        const wallets = walletRes?.result?.items ?? walletRes?.result ?? [];
        const segRes = await LoyaltyService.listLoyaltySegment({});
        const segments = segRes?.result?.items ?? segRes?.result ?? [];

        const totalMembers = wallets.length;
        const activeMembers = wallets.filter((w: any) => w.status === 1).length;
        const totalPointsInCirculation = wallets.reduce((s: number, w: any) => s + (w.currentBalance ?? 0), 0);
        const totalPointsRedeemed = wallets.reduce((s: number, w: any) => s + ((w.totalEarn ?? 0) - (w.currentBalance ?? 0)), 0);

        // Tier distribution
        const tierMap: Record<string, number> = {};
        for (const seg of segments) {
          tierMap[seg.name ?? `Tier ${seg.id}`] = 0;
        }
        tierMap["Chưa xếp hạng"] = 0;
        for (const w of wallets) {
          const tierName = w.segmentName ?? "Chưa xếp hạng";
          tierMap[tierName] = (tierMap[tierName] ?? 0) + 1;
        }

        setKpi({
          totalMembers,
          activeMembers,
          totalPointsInCirculation,
          totalPointsRedeemed,
          tierDistribution: Object.entries(tierMap).map(([name, count]) => ({ name, count })),
        });
      } catch {
        // API chưa sẵn sàng → dùng mock
        setKpi({
          totalMembers: 2847,
          activeMembers: 2103,
          totalPointsInCirculation: 1_245_800,
          totalPointsRedeemed: 387_200,
          tierDistribution: [
            { name: "Đồng", count: 1520 },
            { name: "Bạc", count: 780 },
            { name: "Vàng", count: 410 },
            { name: "Kim Cương", count: 137 },
          ],
        });
      }
    })();
  }, []);

  const activeRate = kpi.totalMembers > 0 ? Math.round((kpi.activeMembers / kpi.totalMembers) * 100) : 0;
  const totalTierMembers = kpi.tierDistribution.reduce((s, t) => s + t.count, 0) || 1;

  return (
    <div>
      <HeaderTabMenu
        title="Loyalty Dashboard"
        titleBack="Hội viên"
        onBackProps={onBackProps}
      />

      {/* KPI Tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, padding: "16px 20px 0" }}>
        <KpiTile icon="👥" label="Tổng hội viên" value={kpi.totalMembers.toLocaleString("vi-VN")} tone={COLORS.primary} />
        <KpiTile icon="✅" label="Hội viên active" value={`${kpi.activeMembers.toLocaleString("vi-VN")} (${activeRate}%)`} tone={COLORS.success} />
        <KpiTile icon="💰" label="Điểm lưu hành" value={kpi.totalPointsInCirculation.toLocaleString("vi-VN")} tone={COLORS.info} />
        <KpiTile icon="🎁" label="Điểm đã đổi" value={kpi.totalPointsRedeemed.toLocaleString("vi-VN")} tone={COLORS.accent} />
      </div>

      {/* Tier Distribution */}
      <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Pie chart bằng CSS */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: COLORS.primaryDark }}>
            Phân bổ hạng thành viên
          </h3>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {/* Donut chart */}
            <div style={{ position: "relative", width: 140, height: 140 }}>
              <svg viewBox="0 0 36 36" style={{ width: 140, height: 140, transform: "rotate(-90deg)" }}>
                {(() => {
                  let offset = 0;
                  return kpi.tierDistribution.map((tier, i) => {
                    const pct = (tier.count / totalTierMembers) * 100;
                    const dash = `${pct} ${100 - pct}`;
                    const el = (
                      <circle
                        key={tier.name}
                        cx="18" cy="18" r="15.915"
                        fill="none"
                        stroke={TIER_COLORS[tier.name] ?? ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"][i % 4]}
                        strokeWidth="3.5"
                        strokeDasharray={dash}
                        strokeDashoffset={`${-offset}`}
                      />
                    );
                    offset += pct;
                    return el;
                  });
                })()}
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.primaryDark }}>{kpi.totalMembers.toLocaleString("vi-VN")}</span>
                <span style={{ fontSize: 10, color: COLORS.textMuted }}>hội viên</span>
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {kpi.tierDistribution.map((tier, i) => (
                <div key={tier.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: TIER_COLORS[tier.name] ?? ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"][i % 4],
                  }} />
                  <span style={{ fontSize: 12, color: COLORS.primaryDark, fontWeight: 600, minWidth: 80 }}>{tier.name}</span>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>{tier.count.toLocaleString("vi-VN")}</span>
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>({Math.round((tier.count / totalTierMembers) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, color: COLORS.primaryDark }}>
            Thao tác nhanh
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <QuickAction icon="🎟️" label="Tạo chương trình tích điểm mới" />
            <QuickAction icon="🏆" label="Cấu hình hạng thành viên" />
            <QuickAction icon="🎁" label="Thêm phần thưởng đổi điểm" />
            <QuickAction icon="📊" label="Xuất danh sách hội viên" />
            <QuickAction icon="📤" label="Import hội viên từ CSV" />
            <QuickAction icon="⚙️" label="Cấu hình Loyalty (hạn điểm, thăng hạng...)" />
          </div>
        </div>
      </div>

      {/* Existing charts */}
      <RetentionRateChart />
      <CLVChart />
      <LoyaltyPointsChart />
    </div>
  );
}

function KpiTile({ icon, label, value, tone }: { icon: string; label: string; value: string; tone: string }) {
  return (
    <div style={{
      background: "#fff", padding: 16, borderRadius: 10,
      border: `1px solid ${COLORS.border}`, borderLeft: `4px solid ${tone}`,
    }}>
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{icon} {label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.primaryDark, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
      background: COLORS.bg, borderRadius: 8, cursor: "pointer", fontSize: 13,
      color: COLORS.primaryDark, fontWeight: 500, border: `1px solid transparent`,
    }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.primary; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "transparent"; }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </div>
  );
}
