// Cấu hình Earn Rule nâng cao qua BPM Engine
// Phục vụ UR-PTS-13 → UR-PTS-16 (Loyalty Quest, journey-based, multi-step workflow)
// Tham chiếu: docs/06-analysis/advanced-earn-rule-bpm-case-study.md
import React, { useEffect, useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

type WorkflowStatus = "draft" | "sandbox" | "production" | "deprecated";

interface BpmWorkflow {
  id: string;
  code: string;
  name: string;
  description: string;
  version: number;
  status: WorkflowStatus;
  activeInstances: number;
  totalEnrolled: number;
  completionRate: number; // %
  awardedPoints: number;
  startAt?: string;
  endAt?: string;
  updatedAt: string;
  updatedBy: string;
}

const SAMPLE_WORKFLOWS: BpmWorkflow[] = [
  {
    id: "wf-001",
    code: "quest_may_2026",
    name: "Loyalty Quest — Hành trình Thám hiểm Chuỗi tháng 5",
    description:
      "5 challenge (First Steps / Big Spender / Cross-brand / Diversity / Frequent) trong 30 ngày → +5.000 điểm bundle bonus + badge + voucher freeship",
    version: 1,
    status: "production",
    activeInstances: 1452830,
    totalEnrolled: 1500000,
    completionRate: 12.3,
    awardedPoints: 28450000,
    startAt: "2026-05-01T00:00:00+07:00",
    endAt: "2026-05-31T23:59:59+07:00",
    updatedAt: "2026-04-28T16:30:00+07:00",
    updatedBy: "marketing.dung",
  },
  {
    id: "wf-002",
    code: "family_pool_q2",
    name: "Family Plan — Pool điểm gia đình Q2/2026",
    description:
      "Tối đa 4 thành viên gia đình pool điểm chung. Mỗi tháng pool đạt 5.000 điểm → unlock voucher gia đình 500K.",
    version: 2,
    status: "production",
    activeInstances: 48230,
    totalEnrolled: 51200,
    completionRate: 8.7,
    awardedPoints: 4200000,
    startAt: "2026-04-01T00:00:00+07:00",
    endAt: "2026-06-30T23:59:59+07:00",
    updatedAt: "2026-04-15T10:00:00+07:00",
    updatedBy: "marketing.lan",
  },
  {
    id: "wf-003",
    code: "birthday_journey",
    name: "Birthday Journey — Tích điểm sinh nhật",
    description:
      "30 ngày quanh sinh nhật KH: bonus × 3, voucher quà sinh nhật khi mua, refer bạn cùng tích → cả 2 nhận thưởng.",
    version: 1,
    status: "sandbox",
    activeInstances: 0,
    totalEnrolled: 0,
    completionRate: 0,
    awardedPoints: 0,
    updatedAt: "2026-05-08T14:22:00+07:00",
    updatedBy: "marketing.dung",
  },
  {
    id: "wf-004",
    code: "b2b_large_order",
    name: "B2B Đơn lớn — Approval gate",
    description:
      "KH doanh nghiệp đặt đơn > 50M → Sales rep approve → tích theo contract rate + split điểm giữa tài khoản doanh nghiệp & người đại diện.",
    version: 1,
    status: "draft",
    activeInstances: 0,
    totalEnrolled: 0,
    completionRate: 0,
    awardedPoints: 0,
    updatedAt: "2026-05-10T09:15:00+07:00",
    updatedBy: "ba.minh",
  },
];

const STATUS_COLOR: Record<WorkflowStatus, { bg: string; fg: string; label: string }> = {
  draft: { bg: "#F3F4F6", fg: "#6B7280", label: "Bản nháp" },
  sandbox: { bg: "#FEF3C7", fg: "#92400E", label: "Sandbox" },
  production: { bg: "#D1FAE5", fg: "#065F46", label: "Production" },
  deprecated: { bg: "#FEE2E2", fg: "#991B1B", label: "Deprecated" },
};

interface Props {
  onBackProps?: (v: boolean) => void;
}

export default function AdvancedEarnConfig({ onBackProps }: Props) {
  const [workflows, setWorkflows] = useState<BpmWorkflow[]>(SAMPLE_WORKFLOWS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<WorkflowStatus | "all">("all");

  useEffect(() => {
    document.title = "Cấu hình Earn Rule nâng cao (BPM)";
  }, []);

  const filtered =
    filter === "all" ? workflows : workflows.filter((w) => w.status === filter);
  const selected = workflows.find((w) => w.id === selectedId);

  const totals = workflows.reduce(
    (acc, w) => {
      acc.activeInstances += w.activeInstances;
      acc.awardedPoints += w.awardedPoints;
      return acc;
    },
    { activeInstances: 0, awardedPoints: 0 },
  );

  const handleOpenStudio = (wf: BpmWorkflow) => {
    const bpmUrl = `${process.env.APP_BPM_URL || "https://bpm.reborn.vn"}/bpmapi/studio/process/${wf.code}/v${wf.version}`;
    window.open(bpmUrl, "_blank", "noopener,noreferrer");
  };

  const handleTerminate = (wf: BpmWorkflow) => {
    if (
      !window.confirm(
        `Chấm dứt toàn bộ ${wf.activeInstances.toLocaleString()} process instance của workflow "${wf.name}"?\n\nCẦN: lý do + audit log. Action không thể undo.`,
      )
    ) {
      return;
    }
    // Mock — gọi BPM API terminate
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === wf.id ? { ...w, activeInstances: 0, status: "deprecated" } : w,
      ),
    );
  };

  const handleNewWorkflow = () => {
    alert(
      "Mở Reborn BPM Studio để vẽ workflow mới.\n\n" +
        "Sau khi hoàn tất:\n" +
        "1. Test trong Sandbox\n" +
        "2. Submit Tenant Admin approve\n" +
        "3. Deploy Production\n\n" +
        "Xem case study: docs/06-analysis/advanced-earn-rule-bpm-case-study.md",
    );
  };

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: "#F5F9F8" }}>
      {onBackProps && (
        <HeaderTabMenu
          title="Earn Rule nâng cao (BPM workflow)"
          titleBack="Cấu hình Loyalty"
          onBackProps={onBackProps}
        />
      )}

      <div style={{ padding: "20px 24px" }}>
        {/* Banner — giải thích pattern */}
        <div
          style={{
            background: "linear-gradient(135deg, #ECFEFF 0%, #E0F2FE 100%)",
            border: "1px solid #67E8F9",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ fontSize: 24 }}>⚙️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#0E7490", marginBottom: 4 }}>
                Earn Rule nâng cao chạy trên BPM Engine
              </div>
              <div style={{ fontSize: 13, color: "#155E75", lineHeight: 1.6 }}>
                Phù hợp cho rule <b>stateful, multi-step, time-bound, multi-event correlation</b> — như Loyalty Quest đa
                bước, Family pooling, B2B approval gate, Journey-based. Rule đơn giản (tỷ lệ × hệ số) vẫn dùng tab{" "}
                <i>Quy tắc tích điểm</i> bình thường.
                <br />
                Decision tree:{" "}
                <a
                  href="https://github.com/anthropics/claude-code"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("docs/02-requirements/part-03-points-engine.md §1bis");
                  }}
                  style={{ color: "#0E7490", textDecoration: "underline" }}
                >
                  URD part-03 §1bis
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregate KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          <KpiCard label="Workflows production" value={workflows.filter((w) => w.status === "production").length.toString()} icon="🚀" />
          <KpiCard label="Active process instances" value={totals.activeInstances.toLocaleString()} icon="📦" />
          <KpiCard label="Điểm đã award qua BPM" value={totals.awardedPoints.toLocaleString()} icon="💎" />
          <KpiCard label="Workflows sandbox / draft" value={workflows.filter((w) => w.status === "sandbox" || w.status === "draft").length.toString()} icon="🧪" />
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "production", "sandbox", "draft", "deprecated"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k as WorkflowStatus | "all")}
                style={{
                  padding: "6px 12px",
                  background: filter === k ? "#0E7490" : "#fff",
                  color: filter === k ? "#fff" : "#475569",
                  border: "1px solid",
                  borderColor: filter === k ? "#0E7490" : "#E2E8F0",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {k === "all" ? "Tất cả" : STATUS_COLOR[k as WorkflowStatus].label}
              </button>
            ))}
          </div>

          <button
            onClick={handleNewWorkflow}
            style={{
              padding: "8px 16px",
              background: "#0E7490",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ＋ Tạo workflow mới
          </button>
        </div>

        {/* Workflow list */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <Th>Workflow</Th>
                <Th style={{ width: 100 }}>Version</Th>
                <Th style={{ width: 110 }}>Trạng thái</Th>
                <Th style={{ width: 130, textAlign: "right" }}>Instances</Th>
                <Th style={{ width: 110, textAlign: "right" }}>Completion</Th>
                <Th style={{ width: 130, textAlign: "right" }}>Điểm award</Th>
                <Th style={{ width: 180 }}>Hành động</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((wf) => (
                <tr
                  key={wf.id}
                  onClick={() => setSelectedId(wf.id === selectedId ? null : wf.id)}
                  style={{
                    borderBottom: "1px solid #F1F5F9",
                    cursor: "pointer",
                    background: selectedId === wf.id ? "#F0F9FF" : "transparent",
                  }}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>{wf.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace" }}>{wf.code}</div>
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#475569" }}>v{wf.version}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <Badge color={STATUS_COLOR[wf.status]} />
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {wf.activeInstances.toLocaleString()}
                    {wf.totalEnrolled > 0 && (
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>/ {wf.totalEnrolled.toLocaleString()}</div>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {wf.status === "production" ? `${wf.completionRate.toFixed(1)}%` : "—"}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#0F766E", fontWeight: 600 }}>
                    {wf.awardedPoints > 0 ? wf.awardedPoints.toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <ActionBtn onClick={(e) => { e.stopPropagation(); handleOpenStudio(wf); }} label="Studio" />
                      {wf.status === "production" && wf.activeInstances > 0 && (
                        <ActionBtn
                          onClick={(e) => { e.stopPropagation(); handleTerminate(wf); }}
                          label="Terminate"
                          danger
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>
                    Chưa có workflow nào trong nhóm này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <div
            style={{
              marginTop: 16,
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              padding: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{selected.name}</div>
              <button
                onClick={() => setSelectedId(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 20 }}
              >
                ×
              </button>
            </div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 16, lineHeight: 1.6 }}>{selected.description}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <DetailRow label="Process code" value={selected.code} mono />
              <DetailRow label="Version hiện tại" value={`v${selected.version}`} mono />
              <DetailRow label="Trạng thái" value={STATUS_COLOR[selected.status].label} />
              <DetailRow label="Hiệu lực từ" value={selected.startAt ? formatDate(selected.startAt) : "—"} />
              <DetailRow label="Hiệu lực đến" value={selected.endAt ? formatDate(selected.endAt) : "—"} />
              <DetailRow label="Cập nhật" value={`${formatDate(selected.updatedAt)} bởi ${selected.updatedBy}`} />
              <DetailRow label="Active instances" value={selected.activeInstances.toLocaleString()} />
              <DetailRow label="Tổng enrolled" value={selected.totalEnrolled.toLocaleString()} />
              <DetailRow label="Completion rate" value={`${selected.completionRate.toFixed(1)}%`} />
            </div>

            {selected.status === "production" && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: "#F0F9FF",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#0C4A6E",
                }}
              >
                💡 <b>Theo dõi instances:</b> mở Studio → mục "Process Instances" để inspect/terminate từng instance riêng.
                Audit log đầy đủ tại{" "}
                <code style={{ background: "#fff", padding: "2px 6px", borderRadius: 4 }}>biz.reborn.vn/bpmapi/audit</code>
              </div>
            )}
          </div>
        )}

        {/* Backlog note */}
        <div
          style={{
            marginTop: 24,
            padding: 14,
            background: "#FEF9E7",
            border: "1px solid #FDE68A",
            borderRadius: 10,
            fontSize: 12,
            color: "#78350F",
          }}
        >
          <b>📋 Phase 2 backlog:</b> Inline BPMN diagram viewer · A/B test split per workflow · Bulk enrollment scheduler ·
          Failed-instance retry batch · Per-instance variable inspector. Phase 1 này focus list + Studio handoff.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

function KpiCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 14px",
        fontSize: 12,
        fontWeight: 600,
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        ...style,
      }}
    >
      {children}
    </th>
  );
}

function Badge({ color }: { color: { bg: string; fg: string; label: string } }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        background: color.bg,
        color: color.fg,
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {color.label}
    </span>
  );
}

function ActionBtn({
  onClick,
  label,
  danger,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 10px",
        background: danger ? "#FEE2E2" : "#fff",
        color: danger ? "#991B1B" : "#0E7490",
        border: "1px solid",
        borderColor: danger ? "#FECACA" : "#CFFAFE",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#0F172A",
          fontFamily: mono ? "monospace" : "inherit",
          fontWeight: 500,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}
