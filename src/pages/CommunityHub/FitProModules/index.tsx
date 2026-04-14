// [FitPro] Prototype hub cho các module còn lại (F2, F4, F5, F6, F7, F8, F9, F10, F11)
// Wrap trong 1 page với tabs để demo — production sẽ split ra từng page riêng
import React, { useState } from "react";
import { MOCK_FITPRO_STATIONS } from "@/mocks/community-hub/fitpro-stations";
import { MOCK_NETWORK_NODES } from "@/mocks/community-hub/fitpro-network";
import { formatCurrency } from "reborn-util";

type TabKey = "f2-station-type" | "f4-body-metrics" | "f5-cross-card" | "f6-sop" | "f7-finder" | "f8-commission" | "f9-funnel" | "f10-tax" | "f11-mf7";

const TABS: { key: TabKey; label: string; icon: string; priority: string }[] = [
  { key: "f2-station-type", label: "Cấu hình loại trạm", icon: "🏠", priority: "⭐⭐⭐" },
  { key: "f5-cross-card", label: "Thẻ liên thông", icon: "🎫", priority: "⭐⭐⭐" },
  { key: "f4-body-metrics", label: "Chỉ số cơ thể", icon: "🩺", priority: "⭐⭐" },
  { key: "f6-sop", label: "SOP Compliance", icon: "✅", priority: "⭐⭐" },
  { key: "f7-finder", label: "Tìm trạm", icon: "📍", priority: "⭐⭐" },
  { key: "f8-commission", label: "Hoa hồng", icon: "💰", priority: "⭐⭐" },
  { key: "f9-funnel", label: "Phễu marketing", icon: "📣", priority: "⭐⭐" },
  { key: "f10-tax", label: "Khai thuế", icon: "📋", priority: "⭐" },
  { key: "f11-mf7", label: "MF7 Onboarding", icon: "🎓", priority: "⭐" },
];

export default function FitProModulesPage() {
  document.title = "FitPro Modules";
  const [tab, setTab] = useState<TabKey>("f2-station-type");

  return (
    <div style={{ padding: 20, background: "#F5F9F8", minHeight: "calc(100vh - 60px)" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#0B2E2A" }}>🛠️ FitPro Modules (Prototype)</h2>
        <p style={{ fontSize: 13, color: "#6B8A85", marginTop: 4 }}>
          9 phân hệ FitPro-specific (F2, F4–F11) — prototype để duyệt trước khi tách page riêng và làm BE
        </p>
      </div>

      {/* Tab pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 14px",
              borderRadius: 20,
              border: tab === t.key ? "2px solid #00C9A7" : "1px solid #d9e0de",
              background: tab === t.key ? "#E4F7F3" : "#fff",
              color: tab === t.key ? "#0B2E2A" : "#6B8A85",
              fontSize: 12,
              fontWeight: tab === t.key ? 700 : 500,
              cursor: "pointer",
            }}
          >
            {t.icon} {t.label} <span style={{ fontSize: 9 }}>{t.priority}</span>
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(11,46,42,.06)", minHeight: 400 }}>
        {/* F2: Station Type config */}
        {tab === "f2-station-type" && (
          <div>
            <h3 style={{ marginTop: 0 }}>🏠 Cấu hình loại trạm (Home vs Co-Working)</h3>
            <p style={{ fontSize: 13, color: "#6B8A85" }}>Định nghĩa cấu hình mặc định cho 2 loại trạm theo slide 7</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
              {[
                {
                  type: "home", label: "Home FitPro", color: "#4DE4C4", icon: "🏠",
                  desc: "Riêng tư tuyệt đối — 100% khách VIP là người thân quen, tận dụng không gian sống",
                  mats: "3-7 thảm",
                  investment: "Tối thiểu — chỉ cần thảm",
                  hours: "6:00 - 9:00",
                  customers: "Gia đình, thân quen",
                  setup_cost: "< 10 triệu",
                },
                {
                  type: "coworking", label: "Co-Working FitPro", color: "#FF8C42", icon: "🏢",
                  desc: "Tối ưu chi phí — 5-7 BO thuê chung, phân bổ cost siêu rẻ 2-3tr/người/tháng",
                  mats: "5-20 thảm",
                  investment: "Chia sẻ với BO khác",
                  hours: "6:00 - 9:00",
                  customers: "Vãng lai + thân quen",
                  setup_cost: "~30-50 triệu (chia 5-7 BO)",
                },
              ].map((s) => (
                <div key={s.type} style={{ padding: 18, borderRadius: 12, border: `2px solid ${s.color}`, background: `${s.color}11` }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
                  <h4 style={{ margin: 0, color: s.color }}>{s.label}</h4>
                  <p style={{ fontSize: 12, color: "#6B8A85", marginTop: 6 }}>{s.desc}</p>
                  <div style={{ marginTop: 12, fontSize: 12 }}>
                    <div>🧘 Số thảm: <strong>{s.mats}</strong></div>
                    <div>💰 Đầu tư: <strong>{s.investment}</strong></div>
                    <div>⏰ Giờ mở: <strong>{s.hours}</strong></div>
                    <div>👥 Khách: <strong>{s.customers}</strong></div>
                    <div>💵 Setup cost: <strong>{s.setup_cost}</strong></div>
                  </div>
                  <button style={{ marginTop: 12, width: "100%", padding: "8px 14px", background: s.color, color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
                    Tạo trạm loại này
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* F4: Body metrics */}
        {tab === "f4-body-metrics" && (
          <div>
            <h3 style={{ marginTop: 0 }}>🩺 Chỉ số cơ thể + Medlatec integration</h3>
            <p style={{ fontSize: 13, color: "#6B8A85" }}>Kết nối xét nghiệm máu với Medlatec — lấy mẫu tại nhà trạm, scheduled 2 lần (trước & sau 90 ngày)</p>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 20 }}>
              <div style={{ padding: 18, background: "#F5F9F8", borderRadius: 10 }}>
                <h4 style={{ marginTop: 0 }}>Bảng đo mẫu cho thành viên "Trần Thị Hương" (Day 73/90)</h4>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#E4F7F3" }}>
                      <th style={{ padding: 10, textAlign: "left" }}>Chỉ số</th>
                      <th style={{ padding: 10 }}>Ngày 1 (Baseline)</th>
                      <th style={{ padding: 10 }}>Ngày 73 (Hiện tại)</th>
                      <th style={{ padding: 10 }}>Target ngày 90</th>
                      <th style={{ padding: 10 }}>Tiến độ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Cân nặng (kg)", 68, 62.5, 60, 73, "#00C9A7"],
                      ["BMI", 26.5, 24.3, 23.4, 71, "#00C9A7"],
                      ["Body Fat %", 32, 26, 22, 60, "#FF8C42"],
                      ["Cholesterol (mg/dL)", 240, 195, 180, 75, "#00C9A7"],
                      ["Huyết áp", "140/90", "128/82", "120/80", 68, "#00C9A7"],
                      ["Đường huyết", "110", "95", "< 100", 80, "#00C9A7"],
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #E0E8E5" }}>
                        <td style={{ padding: 10 }}><strong>{row[0]}</strong></td>
                        <td style={{ padding: 10, textAlign: "center" }}>{row[1]}</td>
                        <td style={{ padding: 10, textAlign: "center", color: "#00C9A7", fontWeight: 700 }}>{row[2]}</td>
                        <td style={{ padding: 10, textAlign: "center" }}>{row[3]}</td>
                        <td style={{ padding: 10, textAlign: "center" }}>
                          <div style={{ width: 60, height: 6, background: "#E0E8E5", borderRadius: 3, display: "inline-block" }}>
                            <div style={{ width: `${row[4]}%`, height: "100%", background: row[5] as string, borderRadius: 3 }} />
                          </div>
                          <span style={{ marginLeft: 8, fontSize: 11, color: row[5] as string, fontWeight: 600 }}>{row[4]}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <div style={{ padding: 14, background: "#FFF7E6", borderRadius: 10, marginBottom: 12 }}>
                  <h4 style={{ marginTop: 0, fontSize: 13 }}>📅 Lịch xét nghiệm Medlatec</h4>
                  <div style={{ fontSize: 11, marginBottom: 8 }}>
                    <div>✅ Baseline: 2026-02-03 (Done)</div>
                    <div>🔬 Re-test: 2026-04-28 (Upcoming)</div>
                  </div>
                  <button style={{ width: "100%", padding: "8px", background: "#FF8C42", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                    📞 Đặt lịch Medlatec
                  </button>
                </div>
                <div style={{ padding: 14, background: "#E4F7F3", borderRadius: 10 }}>
                  <h4 style={{ marginTop: 0, fontSize: 13 }}>🎯 Đánh giá</h4>
                  <div style={{ fontSize: 11, color: "#6B8A85" }}>
                    Thành viên đang đạt <strong style={{ color: "#00C9A7" }}>71% target</strong>, có khả năng cao hoàn thành 90 ngày với kết quả tốt. Khuyến nghị nhắc BO review kế hoạch dinh dưỡng.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* F5: Cross-station card */}
        {tab === "f5-cross-card" && (
          <div>
            <h3 style={{ marginTop: 0 }}>🎫 Thẻ liên thông cross-station</h3>
            <p style={{ fontSize: 13, color: "#6B8A85" }}>Check-in với tiêu chuẩn đồng nhất tại bất kỳ trạm FitPro nào trên toàn quốc — slide 8 "ĐẶC QUYỀN THẺ LIÊN THÔNG"</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20, marginTop: 20 }}>
              {/* Mock member card */}
              <div style={{ padding: 20, background: "linear-gradient(135deg, #00C9A7 0%, #FF8C42 100%)", borderRadius: 14, color: "#fff", boxShadow: "0 6px 20px rgba(0,201,167,.3)" }}>
                <div style={{ fontSize: 11, opacity: 0.8 }}>FITPRO MEMBER CARD</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>Trần Thị Hương</div>
                <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>Gói VIP · Card ID: FP-00012847</div>
                <div style={{ marginTop: 20, padding: 12, background: "rgba(255,255,255,.15)", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>ĐẶC QUYỀN LIÊN THÔNG</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>✓ Check-in mọi trạm FitPro</div>
                  <div style={{ fontSize: 13 }}>✓ Tiêu chuẩn đồng nhất</div>
                  <div style={{ fontSize: 13 }}>✓ Trừ quota tự động</div>
                </div>
                <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 10, opacity: 0.8 }}>HẠN DÙNG</div>
                    <div style={{ fontWeight: 600 }}>2026-05-01</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, opacity: 0.8 }}>SỐ BUỔI CÒN</div>
                    <div style={{ fontWeight: 600 }}>6/30</div>
                  </div>
                </div>
              </div>
              {/* Recent cross-station activity */}
              <div>
                <h4 style={{ marginTop: 0 }}>Hoạt động check-in 30 ngày gần nhất</h4>
                <div style={{ fontSize: 12, color: "#6B8A85", marginBottom: 12 }}>
                  Thành viên đã check-in ở <strong>3 trạm khác nhau</strong> — tận dụng tối đa đặc quyền liên thông
                </div>
                {[
                  { station: "FP-HN-001 (Home — Hà Đông)", count: 18, last: "2026-04-15 06:15" },
                  { station: "FP-HN-002 (Co-Work — Cầu Giấy)", count: 5, last: "2026-04-10 06:30" },
                  { station: "FP-DN-001 (Hải Châu — đi công tác)", count: 1, last: "2026-04-05 06:00" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: 12, marginBottom: 8, background: "#F5F9F8", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{s.station}</div>
                      <div style={{ fontSize: 11, color: "#6B8A85", marginTop: 4 }}>Check-in cuối: {s.last}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#00C9A7" }}>{s.count}</div>
                      <div style={{ fontSize: 10, color: "#6B8A85" }}>lượt</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* F6: SOP Compliance */}
        {tab === "f6-sop" && (
          <div>
            <h3 style={{ marginTop: 0 }}>✅ SOP Compliance — Giám sát chất lượng trạm</h3>
            <p style={{ fontSize: 13, color: "#6B8A85" }}>Master BO giám sát tất cả trạm downline tuân thủ SOP chuẩn thương hiệu FitPro</p>
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { l: "Tuân thủ 100%", v: "3", c: "#00C9A7" },
                  { l: "Cần cải thiện", v: "2", c: "#FF8C42" },
                  { l: "Vi phạm", v: "0", c: "#E8473B" },
                  { l: "Điểm TB", v: "87/100", c: "#722ed1" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: 14, background: "#fff", borderRadius: 10, border: `1.5px solid ${s.c}33` }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: "#6B8A85", marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#E4F7F3" }}>
                    <th style={{ padding: 10, textAlign: "left" }}>Trạm</th>
                    <th style={{ padding: 10 }}>BO</th>
                    <th style={{ padding: 10 }}>Vệ sinh</th>
                    <th style={{ padding: 10 }}>Đúng giờ 6-9h</th>
                    <th style={{ padding: 10 }}>Giáo trình chuẩn</th>
                    <th style={{ padding: 10 }}>Feedback KH</th>
                    <th style={{ padding: 10 }}>Tổng điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_FITPRO_STATIONS.slice(0, 5).map((s, i) => {
                    const scores = [92, 85, 75, 88, 70][i];
                    return (
                      <tr key={s.id} style={{ borderBottom: "1px solid #E0E8E5" }}>
                        <td style={{ padding: 10 }}><strong>{s.code}</strong></td>
                        <td style={{ padding: 10 }}>{s.owner_name}</td>
                        <td style={{ padding: 10, textAlign: "center" }}>{i % 2 === 0 ? "✅" : "⚠️"}</td>
                        <td style={{ padding: 10, textAlign: "center" }}>{i !== 3 ? "✅" : "❌"}</td>
                        <td style={{ padding: 10, textAlign: "center" }}>✅</td>
                        <td style={{ padding: 10, textAlign: "center" }}>{[4.8, 4.5, 4.0, 4.7, 3.9][i]} ⭐</td>
                        <td style={{ padding: 10, textAlign: "center" }}>
                          <strong style={{ color: scores >= 85 ? "#00C9A7" : scores >= 70 ? "#FF8C42" : "#E8473B" }}>
                            {scores}/100
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* F7: Station finder */}
        {tab === "f7-finder" && (
          <div>
            <h3 style={{ marginTop: 0 }}>📍 Tìm trạm gần nhất</h3>
            <p style={{ fontSize: 13, color: "#6B8A85" }}>Giúp thành viên tìm trạm FitPro gần nhất — dùng trong app mobile / map công khai</p>
            <div style={{ marginTop: 20 }}>
              <input type="text" placeholder="🔍 Nhập địa chỉ / quận / thành phố..." style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14, marginBottom: 16 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {MOCK_FITPRO_STATIONS.filter(s => s.status === "active").map((s, i) => (
                  <div key={s.id} style={{ padding: 14, background: "#F5F9F8", borderRadius: 10, borderLeft: `3px solid ${s.type === "home" ? "#4DE4C4" : "#FF8C42"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <strong style={{ fontSize: 13 }}>{s.name}</strong>
                        <div style={{ fontSize: 11, color: "#6B8A85", marginTop: 2 }}>📍 {s.address}</div>
                        <div style={{ fontSize: 11, color: "#6B8A85" }}>⏰ {s.operating_hours}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#00C9A7" }}>{[1.2, 3.5, 8.0, 12.4, 5.1][i]} km</div>
                        <button style={{ padding: "4px 10px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 4, fontSize: 11, marginTop: 4, cursor: "pointer" }}>
                          Chỉ đường
                        </button>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: "#6B8A85" }}>
                      Thảm trống: <strong style={{ color: "#00C9A7" }}>{s.mats.filter(m => m.status === "available").length}/{s.total_mats}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* F8: Commission dashboard */}
        {tab === "f8-commission" && (
          <div>
            <h3 style={{ marginTop: 0 }}>💰 Hoa hồng hệ thống (hãng tự trả)</h3>
            <p style={{ fontSize: 13, color: "#6B8A85" }}>Dashboard xem hoa hồng 5%/tầng × 3 tầng từ hãng Herbalife — BO chỉ view, không cần quản lý</p>
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { l: "Tháng này", v: "42 tr", c: "#00C9A7", i: "💰" },
                  { l: "Tầng 1 (5%)", v: "18 tr", c: "#4DE4C4", i: "1️⃣" },
                  { l: "Tầng 2 (5%)", v: "16 tr", c: "#FF8C42", i: "2️⃣" },
                  { l: "Tầng 3 (5%)", v: "8 tr", c: "#E8473B", i: "3️⃣" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: 14, background: "#fff", borderRadius: 10, border: `1.5px solid ${s.c}33` }}>
                    <div style={{ fontSize: 20 }}>{s.i}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.c, marginTop: 4 }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: "#6B8A85" }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: 14, background: "#FFF7E6", borderRadius: 8, fontSize: 12, color: "#8B5A00" }}>
                💡 <strong>Lưu ý:</strong> Hoa hồng do hãng tự tính và trả hàng tháng — chủ trạm không cần quản lý phần này. Dashboard này chỉ cho bạn **xem** để biết thu nhập hệ thống đang chảy về.
              </div>
              <div style={{ marginTop: 16 }}>
                <h4>Breakdown từ downline (6 BO)</h4>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#E4F7F3" }}>
                      <th style={{ padding: 10, textAlign: "left" }}>BO</th>
                      <th style={{ padding: 10 }}>Tier</th>
                      <th style={{ padding: 10 }}>DT tháng</th>
                      <th style={{ padding: 10 }}>% HH về Master</th>
                      <th style={{ padding: 10 }}>Thực nhận</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_NETWORK_NODES.filter(n => n.parent_id !== null).slice(0, 6).map((n) => (
                      <tr key={n.id} style={{ borderBottom: "1px solid #E0E8E5" }}>
                        <td style={{ padding: 10 }}>{n.name}</td>
                        <td style={{ padding: 10, textAlign: "center" }}>Tier {n.tier}</td>
                        <td style={{ padding: 10, textAlign: "right" }}>{formatCurrency(n.monthly_revenue_vnd, ".", "")}đ</td>
                        <td style={{ padding: 10, textAlign: "center", color: "#FF8C42" }}>5%</td>
                        <td style={{ padding: 10, textAlign: "right", color: "#00C9A7", fontWeight: 600 }}>
                          {formatCurrency(Math.round(n.monthly_revenue_vnd * 0.05), ".", "")}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* F9: Marketing funnel */}
        {tab === "f9-funnel" && (
          <div>
            <h3 style={{ marginTop: 0 }}>📣 Phễu marketing & Content</h3>
            <p style={{ fontSize: 13, color: "#6B8A85" }}>Chuyển khách lạnh → cộng đồng → thành viên. Thư viện video/bài viết + công cụ lan tỏa cho BO</p>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: 30, background: "#F5F9F8", borderRadius: 12, marginTop: 20 }}>
              {[
                { l: "Khách lạnh", v: "12,450", c: "#8E9BAE", i: "🌱", w: 240 },
                { l: "Cộng đồng", v: "2,180", c: "#4DE4C4", i: "👥", w: 180 },
                { l: "Warm lead", v: "650", c: "#00C9A7", i: "🔥", w: 130 },
                { l: "Thành viên", v: "247", c: "#FF8C42", i: "💎", w: 90 },
              ].map((s, i, arr) => (
                <React.Fragment key={i}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: s.w, height: 80,
                      background: s.c,
                      clipPath: "polygon(10% 0, 90% 0, 100% 100%, 0 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff",
                    }}>
                      <div>
                        <div style={{ fontSize: 22 }}>{s.i}</div>
                        <div style={{ fontWeight: 700 }}>{s.v}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#6B8A85", marginTop: 6 }}>{s.l}</div>
                  </div>
                  {i < arr.length - 1 && <div style={{ fontSize: 20, color: "#00C9A7" }}>→</div>}
                </React.Fragment>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <h4>📚 Thư viện content cho BO</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { title: "Video: Tại sao chọn FitPro?", type: "🎥 Video", shares: 345 },
                  { title: "Bài viết: 5 sai lầm khi giảm cân", type: "📄 Blog", shares: 182 },
                  { title: "Infographic: Hành trình 90 ngày", type: "📊 Image", shares: 567 },
                  { title: "Video: Testimonial Trần Thị Hương", type: "🎥 Video", shares: 421 },
                  { title: "Post FB: Khuyến mãi VIP gói", type: "📱 Social", shares: 289 },
                  { title: "Ebook: Dinh dưỡng Herbalife 101", type: "📘 PDF", shares: 134 },
                ].map((c, i) => (
                  <div key={i} style={{ padding: 12, background: "#F5F9F8", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: "#6B8A85" }}>{c.type}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{c.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: "#6B8A85" }}>📤 {c.shares} lượt lan tỏa</span>
                      <button style={{ padding: "4px 10px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>
                        Chia sẻ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* F10: Tax per station */}
        {tab === "f10-tax" && (
          <div>
            <h3 style={{ marginTop: 0 }}>📋 Khai thuế từng trạm (Hộ kinh doanh)</h3>
            <p style={{ fontSize: 13, color: "#6B8A85" }}>Mỗi trạm có thể là 1 hộ kinh doanh riêng — quản lý doanh thu, khai thuế hàng tháng</p>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", marginTop: 20 }}>
              <thead>
                <tr style={{ background: "#E4F7F3" }}>
                  <th style={{ padding: 10, textAlign: "left" }}>Trạm</th>
                  <th style={{ padding: 10 }}>MST HKD</th>
                  <th style={{ padding: 10 }}>DT tháng 03</th>
                  <th style={{ padding: 10 }}>Thuế khoán (1.5%)</th>
                  <th style={{ padding: 10 }}>Trạng thái nộp</th>
                  <th style={{ padding: 10 }}>Hạn nộp</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_FITPRO_STATIONS.map((s, i) => {
                  const taxPct = 0.015;
                  const taxAmount = Math.round(s.month_revenue_vnd * taxPct);
                  const statusColors = ["#00C9A7", "#00C9A7", "#FF8C42", "#00C9A7", "#8E9BAE"][i];
                  const statusText = ["Đã nộp", "Đã nộp", "Chưa nộp", "Đã nộp", "—"][i];
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #E0E8E5" }}>
                      <td style={{ padding: 10 }}><strong>{s.code}</strong><br /><span style={{ fontSize: 10, color: "#6B8A85" }}>{s.owner_name}</span></td>
                      <td style={{ padding: 10, fontFamily: "monospace", fontSize: 11 }}>HKD-{String(i + 1).padStart(4, "0")}</td>
                      <td style={{ padding: 10, textAlign: "right" }}>{formatCurrency(s.month_revenue_vnd, ".", "")}đ</td>
                      <td style={{ padding: 10, textAlign: "right", color: "#FF8C42", fontWeight: 600 }}>
                        {formatCurrency(taxAmount, ".", "")}đ
                      </td>
                      <td style={{ padding: 10, textAlign: "center" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 10, background: `${statusColors}22`, color: statusColors, fontSize: 11, fontWeight: 600 }}>
                          {statusText}
                        </span>
                      </td>
                      <td style={{ padding: 10, textAlign: "center", fontSize: 11, color: "#6B8A85" }}>20/04/2026</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* F11: MF7 Onboarding */}
        {tab === "f11-mf7" && (
          <div>
            <h3 style={{ marginTop: 0 }}>🎓 MF7 Onboarding cho BO mới</h3>
            <p style={{ fontSize: 13, color: "#6B8A85" }}>Giáo trình đào tạo BO mới về triết lý 7×7×7 và mindset Master-Force-Free</p>
            <div style={{ padding: 30, background: "linear-gradient(135deg, #E4F7F3 0%, #FFF0E3 100%)", borderRadius: 14, marginTop: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, textAlign: "center" }}>
                {[
                  { letter: "M", label: "Mastery", desc: "Làm chủ công việc, sức khỏe, vận mệnh", color: "#00C9A7" },
                  { letter: "F", label: "Force", desc: "Đứng trên vai người khổng lồ (Herbalife, Medlatec)", color: "#FF8C42" },
                  { letter: "7", label: "Leverage", desc: "Đòn bẩy nhân bản ×7", color: "#E8473B" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: 20, background: "#fff", borderRadius: 12, borderTop: `4px solid ${s.color}` }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: s.color }}>{s.letter}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0B2E2A", marginTop: 4 }}>{s.label}</div>
                    <p style={{ fontSize: 12, color: "#6B8A85", marginTop: 8 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, textAlign: "center", padding: 16, background: "#fff", borderRadius: 10 }}>
                <strong style={{ fontSize: 14, color: "#0B2E2A" }}>
                  "Sử dụng 1% nỗ lực của 10.000 trạm thay vì 100% nỗ lực của chính mình"
                </strong>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <h4>📚 Lộ trình onboarding 7 ngày cho BO mới</h4>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { day: 1, title: "Giới thiệu FitPro & triết lý MF7", done: true },
                  { day: 2, title: "Hiểu mô hình nhượng quyền phi chính thức", done: true },
                  { day: 3, title: "4 profile BO — bạn thuộc loại nào?", done: true },
                  { day: 4, title: "Cấu hình trạm Home vs Co-Working", done: false },
                  { day: 5, title: "Quản lý thành viên & giáo trình", done: false },
                  { day: 6, title: "Marketing funnel & lan tỏa hệ thống", done: false },
                  { day: 7, title: "Lễ tốt nghiệp BO — sẵn sàng setup trạm trong 72h", done: false },
                ].map((s) => (
                  <div key={s.day} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: 12,
                    background: s.done ? "#E4F7F3" : "#fff",
                    border: `1px solid ${s.done ? "#00C9A7" : "#d9e0de"}`,
                    borderRadius: 8,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: s.done ? "#00C9A7" : "#E0E8E5",
                      color: s.done ? "#fff" : "#8E9BAE",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700,
                    }}>
                      {s.done ? "✓" : s.day}
                    </div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: s.done ? "#0B2E2A" : "#6B8A85" }}>
                      Ngày {s.day}: {s.title}
                    </div>
                    {s.done && <span style={{ fontSize: 11, color: "#00C9A7" }}>✅ Hoàn thành</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
