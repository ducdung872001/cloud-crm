// [FitPro] F1 — Network Tree 7×7×7 prototype
// Hiển thị cây MLM 3 tầng: Master → 7 trạm trực tiếp → 49 vệ tinh → 343 bùng nổ
import React, { useState } from "react";
import { MOCK_NETWORK_NODES, NETWORK_SUMMARY, INetworkNode } from "@/mocks/community-hub/fitpro-network";
import { formatCurrency } from "reborn-util";

const ROLE_ICON: Record<string, string> = {
  office: "💼",
  entrepreneur: "🚀",
  trainer: "🏋️",
  ambassador: "💚",
};

const STATUS_COLOR: Record<string, string> = {
  active: "#00C9A7",
  setup: "#FFB340",
  inactive: "#8E9BAE",
};

function NodeCard({ node, onClick, selected }: { node: INetworkNode; onClick: () => void; selected: boolean }) {
  const color = STATUS_COLOR[node.status];
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: selected ? `2px solid #FF8C42` : `1.5px solid ${color}33`,
        borderRadius: 10,
        padding: 12,
        minWidth: 180,
        cursor: "pointer",
        boxShadow: selected ? "0 4px 16px rgba(255,140,66,.2)" : "0 2px 6px rgba(11,46,42,.06)",
        transition: "all .15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 20 }}>{ROLE_ICON[node.role]}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0B2E2A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {node.name}
          </div>
          <div style={{ fontSize: 10, color: "#6B8A85" }}>{node.station_code} · {node.city}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
        <span style={{ background: `${color}22`, color, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
          Tier {node.tier}
        </span>
        <span style={{ color: "#6B8A85" }}>
          {node.children_ids.length}/7 downline
        </span>
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: "#00C9A7", fontWeight: 600 }}>
        💰 {formatCurrency(node.monthly_commission_vnd, ".", "")}đ/tháng
      </div>
    </div>
  );
}

export default function NetworkTreePage() {
  document.title = "Mạng lưới 7×7×7 — FitPro";
  const [nodes, setNodes] = useState<INetworkNode[]>(MOCK_NETWORK_NODES);
  const [selectedNode, setSelectedNode] = useState<INetworkNode | null>(nodes[0]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    role: "office" as INetworkNode["role"],
    station_code: "",
    city: "Hà Nội",
    parent_id: "BO-MASTER",
    phone: "",
    email: "",
  });

  const master = nodes.find((n) => n.parent_id === null);
  const tier1 = nodes.filter((n) => n.tier === 1 && n.parent_id !== null);
  const tier2 = nodes.filter((n) => n.tier === 2);

  const handleInvite = () => {
    if (!inviteForm.name.trim()) { alert("Vui lòng nhập tên BO mới"); return; }
    if (!inviteForm.station_code.trim()) { alert("Vui lòng nhập mã trạm"); return; }
    const parent = nodes.find((n) => n.id === inviteForm.parent_id);
    const newTier = parent ? (parent.parent_id === null ? 1 : parent.tier + 1) : 1;
    if (newTier > 3) { alert("Đã vượt quá 3 tầng của mạng lưới"); return; }
    if (parent && parent.children_ids.length >= 7) { alert("BO này đã đủ 7 downline — không thể thêm"); return; }

    const newId = `BO-T${newTier}-${String(nodes.length + 1).padStart(3, "0")}`;
    const newNode: INetworkNode = {
      id: newId,
      name: inviteForm.name,
      role: inviteForm.role,
      tier: newTier as 1 | 2 | 3,
      station_code: inviteForm.station_code,
      city: inviteForm.city,
      joined_date: new Date().toISOString().split("T")[0],
      stations_count: 0,
      monthly_revenue_vnd: 0,
      monthly_commission_vnd: 0,
      status: "setup",
      parent_id: inviteForm.parent_id,
      children_ids: [],
    };

    // Add newNode + update parent children_ids
    setNodes((prev) =>
      prev.map((n) => (n.id === inviteForm.parent_id ? { ...n, children_ids: [...n.children_ids, newId] } : n)).concat(newNode)
    );
    setShowInvite(false);
    setInviteForm({ name: "", role: "office", station_code: "", city: "Hà Nội", parent_id: "BO-MASTER", phone: "", email: "" });
    setSelectedNode(newNode);
  };

  return (
    <div style={{ padding: 20, background: "#F5F9F8", minHeight: "calc(100vh - 60px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: "#0B2E2A" }}>🌳 Mạng lưới 7×7×7</h2>
          <p style={{ fontSize: 13, color: "#6B8A85", marginTop: 4 }}>
            Hệ thống đòn bẩy MF7: 1 Master → 7 trực tiếp → 49 vệ tinh → 343 bùng nổ (mục tiêu 10.000 trạm 2027)
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          style={{
            background: "linear-gradient(135deg, #00C9A7 0%, #FF8C42 100%)",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Mời Business Owner mới
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { l: "Master BO (Tier 0)", v: "1", sub: "Bạn", c: "#E8473B", i: "👑" },
          { l: "Tier 1 — Trạm trực tiếp", v: `${NETWORK_SUMMARY.tier1_count}/${NETWORK_SUMMARY.tier1_max}`, sub: "Target 7", c: "#FF8C42", i: "7️⃣" },
          { l: "Tier 2 — Vệ tinh", v: `${NETWORK_SUMMARY.tier2_count}/${NETWORK_SUMMARY.tier2_max}`, sub: "Target 49", c: "#00C9A7", i: "🌱" },
          { l: "Tier 3 — Bùng nổ", v: `${NETWORK_SUMMARY.tier3_count}/${NETWORK_SUMMARY.tier3_max}`, sub: "Target 343", c: "#4DE4C4", i: "🚀" },
          { l: "Doanh thu hệ thống/tháng", v: `${(NETWORK_SUMMARY.total_monthly_revenue / 1e6).toFixed(0)} triệu`, sub: `Tiến độ ${NETWORK_SUMMARY.progress_to_goal}%`, c: "#722ed1", i: "💎" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            boxShadow: "0 2px 8px rgba(11,46,42,.06)",
            borderLeft: `4px solid ${s.c}`,
          }}>
            <div style={{ fontSize: 18 }}>{s.i}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.c, marginTop: 4 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "#1a1a2e", fontWeight: 500, marginTop: 2 }}>{s.l}</div>
            <div style={{ fontSize: 10, color: "#6B8A85", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tree visualization */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(11,46,42,.08)", marginBottom: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 12, color: "#6B8A85", marginBottom: 8 }}>TIER 0 — MASTER BO</div>
          {master && (
            <div style={{ display: "inline-block" }}>
              <NodeCard node={master} onClick={() => setSelectedNode(master)} selected={selectedNode?.id === master.id} />
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", color: "#00C9A7", fontSize: 20, marginBottom: 16 }}>
          ↓ ↓ ↓ ↓ ↓
        </div>

        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 12, color: "#6B8A85", marginBottom: 10, textAlign: "center" }}>
            TIER 1 — 7 TRẠM TRỰC TIẾP ({tier1.length}/7)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const node = tier1[i];
              if (!node) {
                return (
                  <div key={i} style={{
                    background: "#F5F9F8",
                    border: "2px dashed #d9e0de",
                    borderRadius: 10,
                    padding: 12,
                    minWidth: 100,
                    minHeight: 90,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8E9BAE",
                  }}>
                    <div style={{ fontSize: 18 }}>➕</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>Slot trống</div>
                  </div>
                );
              }
              return <NodeCard key={node.id} node={node} onClick={() => setSelectedNode(node)} selected={selectedNode?.id === node.id} />;
            })}
          </div>
        </div>

        <div style={{ textAlign: "center", color: "#00C9A7", fontSize: 18, marginBottom: 16 }}>
          ↓ ↓ ↓
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#6B8A85", marginBottom: 10, textAlign: "center" }}>
            TIER 2 — VỆ TINH ({tier2.length}/49)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {tier2.map((node) => (
              <NodeCard key={node.id} node={node} onClick={() => setSelectedNode(node)} selected={selectedNode?.id === node.id} />
            ))}
          </div>
        </div>
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(11,46,42,.08)" }}>
          <h3 style={{ margin: 0, color: "#0B2E2A" }}>
            {ROLE_ICON[selectedNode.role]} Chi tiết {selectedNode.name}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 14 }}>
            {[
              { l: "Mã trạm", v: selectedNode.station_code },
              { l: "Thành phố", v: selectedNode.city },
              { l: "Tier", v: `Tier ${selectedNode.tier}` },
              { l: "Tham gia", v: selectedNode.joined_date },
              { l: "Số trạm sở hữu", v: `${selectedNode.stations_count}` },
              { l: "Downline", v: `${selectedNode.children_ids.length}/7` },
              { l: "Doanh thu tháng", v: `${formatCurrency(selectedNode.monthly_revenue_vnd, ".", "")}đ` },
              { l: "Hoa hồng tháng", v: `${formatCurrency(selectedNode.monthly_commission_vnd, ".", "")}đ`, accent: true },
            ].map((i, k) => (
              <div key={k} style={{ padding: 12, background: "#F5F9F8", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "#6B8A85" }}>{i.l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: i.accent ? "#00C9A7" : "#0B2E2A", marginTop: 4 }}>
                  {i.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
