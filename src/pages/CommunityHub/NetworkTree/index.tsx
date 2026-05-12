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
          <div style={{ fontSize: 10, color: "#6B8A85", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span title="Mã định danh bất biến trọn đời" style={{ fontFamily: "monospace", fontWeight: 700, color: "#FF8C42", background: "#FFF0E3", padding: "1px 6px", borderRadius: 4 }}>
              {node.affiliate_code}
            </span>
            {node.house_code && (
              <span title="Mã Nhà — đủ 7 Elite F1-F7" style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563EB", background: "#E0EBFF", padding: "1px 6px", borderRadius: 4 }}>
                🏠 {node.house_code}
              </span>
            )}
            <span>· {node.station_code} · {node.city}</span>
          </div>
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
    // Mint mã định danh A### bất biến — lấy số kế tiếp lớn nhất hiện có + jitter
    const maxA = Math.max(0, ...nodes.map((n) => parseInt(n.affiliate_code.replace(/^A/, ""), 10) || 0));
    const newAffiliateCode = `A${String(maxA + Math.ceil(Math.random() * 13)).padStart(3, "0")}`;
    const newNode: INetworkNode = {
      id: newId,
      name: inviteForm.name,
      affiliate_code: newAffiliateCode,
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
                  <div key={i}
                    onClick={() => { setInviteForm({ ...inviteForm, parent_id: "BO-MASTER" }); setShowInvite(true); }}
                    style={{
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
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00C9A7"; e.currentTarget.style.background = "#E4F7F3"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d9e0de"; e.currentTarget.style.background = "#F5F9F8"; }}
                  >
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
          {tier2.length === 0 ? (
            <div style={{ padding: 30, background: "#fff", borderRadius: 10, textAlign: "center", border: "1.5px dashed #d9e0de" }}>
              <div style={{ fontSize: 36, opacity: 0.3 }}>🌱</div>
              <div style={{ fontSize: 13, color: "#6B8A85", marginTop: 8 }}>
                Chưa có BO tầng 2 nào — mời tầng 1 nhân bản để lan tỏa tới tầng 2
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              {tier2.map((node) => (
                <NodeCard key={node.id} node={node} onClick={() => setSelectedNode(node)} selected={selectedNode?.id === node.id} />
              ))}
            </div>
          )}
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

      {/* ── Modal Mời BO mới ── */}
      {showInvite && (
        <div
          onClick={() => setShowInvite(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(11,46,42,.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 14, width: 520, maxWidth: "90vw",
              boxShadow: "0 20px 60px rgba(11,46,42,.3)",
            }}
          >
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E0E8E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#0B2E2A" }}>🎯 Mời Business Owner mới</h3>
              <button
                onClick={() => setShowInvite(false)}
                style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#6B8A85" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Họ và tên *</label>
                <input
                  autoFocus
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="Nguyễn Văn BO..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Profile BO *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {([
                    { k: "office", l: "💼 Dân VP" },
                    { k: "entrepreneur", l: "🚀 Chủ DN" },
                    { k: "trainer", l: "🏋️ PT/Yoga" },
                    { k: "ambassador", l: "💚 Đại sứ lối sống" },
                  ] as const).map((o) => {
                    const active = inviteForm.role === o.k;
                    return (
                      <button
                        key={o.k}
                        type="button"
                        onClick={() => setInviteForm({ ...inviteForm, role: o.k })}
                        style={{
                          padding: "10px 12px",
                          border: active ? "2px solid #00C9A7" : "1px solid #d9e0de",
                          background: active ? "#E4F7F3" : "#fff",
                          color: active ? "#0B2E2A" : "#6B8A85",
                          borderRadius: 8,
                          fontWeight: active ? 700 : 500,
                          fontSize: 12,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        {o.l}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Mã trạm *</label>
                  <input
                    type="text"
                    value={inviteForm.station_code}
                    onChange={(e) => setInviteForm({ ...inviteForm, station_code: e.target.value })}
                    placeholder="FP-HN-XXX"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Thành phố</label>
                  <input
                    type="text"
                    value={inviteForm.city}
                    onChange={(e) => setInviteForm({ ...inviteForm, city: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Upline (BO cha)</label>
                <select
                  value={inviteForm.parent_id}
                  onChange={(e) => setInviteForm({ ...inviteForm, parent_id: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14, background: "#fff" }}
                >
                  {nodes
                    .filter((n) => n.tier < 3 && n.children_ids.length < 7)
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} (Tier {n.tier === 1 && n.parent_id === null ? 0 : n.tier}, {n.children_ids.length}/7 downline)
                      </option>
                    ))}
                </select>
                <div style={{ fontSize: 11, color: "#6B8A85", marginTop: 4 }}>
                  BO mới sẽ trở thành downline của BO upline chọn. Tối đa 7 downline mỗi BO.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Số điện thoại</label>
                  <input
                    type="tel"
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                    placeholder="090..."
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Email</label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="bo@fitpro.vn"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }}
                  />
                </div>
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #E0E8E5", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowInvite(false)}
                style={{
                  padding: "10px 20px", borderRadius: 8, border: "1px solid #d9e0de", background: "#fff",
                  color: "#6B8A85", fontWeight: 600, cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteForm.name.trim() || !inviteForm.station_code.trim()}
                style={{
                  padding: "10px 20px", borderRadius: 8, border: "none",
                  background: "linear-gradient(135deg, #00C9A7 0%, #FF8C42 100%)",
                  color: "#fff", fontWeight: 700, cursor: "pointer",
                  opacity: !inviteForm.name.trim() || !inviteForm.station_code.trim() ? 0.5 : 1,
                }}
              >
                🎯 Gửi lời mời BO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
