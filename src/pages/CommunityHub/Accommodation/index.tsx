// [FitPro] Station Layout — sơ đồ thảm tập theo trạm
// Thay thế Accommodation (phòng/giường) của community-hub
import React, { useState } from "react";
import { MOCK_FITPRO_STATIONS, STATION_SUMMARY, IFitProStation, IFitProMat } from "@/mocks/community-hub/fitpro-stations";
import "./index.scss";

const fmtMoney = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)} tỷ` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} tr đ` : `${(n || 0).toLocaleString("vi-VN")} đ`;

const matStatusColor: Record<string, string> = {
  occupied: "#00C9A7",    // teal = đang tập
  available: "#E4F7F3",   // mint light = trống
  maintenance: "#FFB340", // amber = bảo trì
};

const matStatusLabel: Record<string, string> = {
  occupied: "Đang tập",
  available: "Trống",
  maintenance: "Bảo trì",
};

export default function StationLayoutPage() {
  document.title = "Sơ đồ trạm FitPro";
  const [selectedStation, setSelectedStation] = useState<IFitProStation | null>(MOCK_FITPRO_STATIONS[0]);
  const [selectedMat, setSelectedMat] = useState<IFitProMat | null>(null);
  const [filterType, setFilterType] = useState<"all" | "home" | "coworking">("all");

  const filtered = MOCK_FITPRO_STATIONS.filter((s) => filterType === "all" || s.type === filterType);

  const getOccupiedCount = (station: IFitProStation) =>
    station.mats.filter((m) => m.status === "occupied").length;

  return (
    <div className="ch-accommodation-page">
      <div className="ch-accommodation-page__header">
        <div>
          <h2>Sơ đồ thảm tập — Chuỗi trạm FitPro</h2>
          <p style={{ fontSize: 13, color: "#6B8A85", marginTop: 4 }}>
            Giám sát thời gian thực các thảm tập trong khung giờ vàng 6h–9h sáng
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { k: "all", l: "Tất cả" },
            { k: "home", l: "🏠 Home FitPro" },
            { k: "coworking", l: "🏢 Co-Working" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setFilterType(t.k as any)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: filterType === t.k ? "2px solid #00C9A7" : "1px solid #d9e0de",
                background: filterType === t.k ? "#E4F7F3" : "#fff",
                color: filterType === t.k ? "#0B2E2A" : "#6B8A85",
                fontWeight: filterType === t.k ? 600 : 500,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { l: "Trạm đang hoạt động", v: `${STATION_SUMMARY.active}/${STATION_SUMMARY.total}`, c: "#00C9A7", i: "🏋️" },
          { l: "Thảm tập", v: `${STATION_SUMMARY.occupied_mats}/${STATION_SUMMARY.total_mats}`, c: "#FF8C42", i: "🧘" },
          { l: "Buổi tập hôm nay", v: `${STATION_SUMMARY.today_sessions}`, c: "#722ed1", i: "🔥" },
          { l: "Trạm đang setup", v: `${STATION_SUMMARY.setup}`, c: "#FFB340", i: "🔧" },
          { l: "Doanh thu tháng", v: fmtMoney(STATION_SUMMARY.month_revenue), c: "#0B2E2A", i: "💰" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#fff",
            borderRadius: 10,
            padding: "14px 16px",
            boxShadow: "0 2px 8px rgba(11,46,42,.06)",
            borderLeft: `4px solid ${s.c}`,
          }}>
            <div style={{ fontSize: 18 }}>{s.i}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.c, marginTop: 4 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "#6B8A85", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
        {/* Station list */}
        <div className="ch-accommodation-page__rooms">
          <h3 style={{ fontSize: 14, color: "#0B2E2A", marginBottom: 10 }}>
            Danh sách trạm ({filtered.length})
          </h3>
          {filtered.map((station) => {
            const occupied = getOccupiedCount(station);
            const pct = Math.round((occupied / station.total_mats) * 100);
            return (
              <div
                key={station.id}
                className={`room-card ${selectedStation?.id === station.id ? "active" : ""}`}
                onClick={() => { setSelectedStation(station); setSelectedMat(null); }}
                style={{ cursor: "pointer" }}
              >
                <div className="room-card__header">
                  <h3 style={{ fontSize: 14 }}>{station.name}</h3>
                  <span
                    className="gender-badge"
                    style={{
                      background: station.type === "home" ? "#E4F7F3" : "#FFF0E3",
                      color: station.type === "home" ? "#00C9A7" : "#FF8C42",
                    }}
                  >
                    {station.type === "home" ? "🏠 Home" : "🏢 Co-Work"}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#6B8A85", marginTop: 4 }}>
                  📍 {station.address} · BO: {station.owner_name} (Tier {station.owner_tier})
                </div>
                <div className="room-card__stats" style={{ marginTop: 8 }}>
                  <div className="occupancy-bar">
                    <div className="occupancy-bar__fill" style={{
                      width: `${pct}%`,
                      background: station.status === "setup" ? "#FFB340" : "#00C9A7",
                    }} />
                  </div>
                  <span className="occupancy-text" style={{ fontSize: 11 }}>
                    {station.status === "setup" ? "🔧 Đang setup" : `${occupied}/${station.total_mats} thảm đang tập`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Station detail — mats grid */}
        {selectedStation && (
          <div style={{
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(11,46,42,.08)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, color: "#0B2E2A" }}>{selectedStation.name}</h3>
                <div style={{ fontSize: 12, color: "#6B8A85", marginTop: 4 }}>
                  ⏰ {selectedStation.operating_hours} · {selectedStation.typeLabel} · {selectedStation.total_mats} thảm
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#6B8A85" }}>Doanh thu tháng</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#00C9A7" }}>{fmtMoney(selectedStation.month_revenue_vnd)}</div>
              </div>
            </div>

            {/* Mat grid visualization */}
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(selectedStation.total_mats, 6)}, 1fr)`,
              gap: 12,
              padding: 16,
              background: "#F5F9F8",
              borderRadius: 10,
            }}>
              {selectedStation.mats.map((mat) => (
                <div
                  key={mat.mat_no}
                  onClick={() => setSelectedMat(mat)}
                  style={{
                    aspectRatio: "1 / 1.4",
                    background: matStatusColor[mat.status],
                    border: selectedMat?.mat_no === mat.mat_no ? "3px solid #FF8C42" : "2px solid #fff",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: mat.status === "occupied" ? "#fff" : "#0B2E2A",
                    fontWeight: 700,
                    transition: "transform .15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div style={{ fontSize: 20 }}>
                    {mat.status === "occupied" ? "🧘" : mat.status === "maintenance" ? "🔧" : "—"}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>#{mat.mat_no}</div>
                  {mat.session && (
                    <div style={{ fontSize: 9, opacity: 0.9, marginTop: 2 }}>
                      {mat.session.slot}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Selected mat detail */}
            {selectedMat && (
              <div style={{
                marginTop: 16,
                padding: 14,
                background: selectedMat.status === "occupied" ? "#E4F7F3" : "#FFF7E6",
                borderRadius: 8,
                borderLeft: `4px solid ${matStatusColor[selectedMat.status]}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>Thảm #{selectedMat.mat_no}</strong>
                  <span style={{ fontWeight: 600, color: matStatusColor[selectedMat.status] }}>
                    {matStatusLabel[selectedMat.status]}
                  </span>
                </div>
                {selectedMat.session ? (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 13 }}>👤 <strong>{selectedMat.session.member_name}</strong> ({selectedMat.session.member_id})</div>
                    <div style={{ fontSize: 12, color: "#6B8A85", marginTop: 4 }}>
                      🎯 Giáo trình: <strong>{selectedMat.session.program}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: "#6B8A85", marginTop: 2 }}>
                      ⏰ Slot: {selectedMat.session.slot} · Bắt đầu {new Date(selectedMat.session.started_at).toLocaleTimeString("vi-VN").slice(0, 5)}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#6B8A85" }}>
                    {selectedMat.status === "maintenance" ? "Thảm đang bảo trì / vệ sinh" : "Sẵn sàng cho buổi tập tiếp theo"}
                  </div>
                )}
              </div>
            )}

            {/* Legend */}
            <div style={{ marginTop: 16, display: "flex", gap: 16, fontSize: 12 }}>
              {Object.entries(matStatusLabel).map(([k, l]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: 3,
                    background: matStatusColor[k],
                    border: "1px solid #d9e0de",
                  }} />
                  <span style={{ color: "#6B8A85" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
