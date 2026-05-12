// [FitPro] 9 FitPro-specific modules (F2, F4-F11) — each reachable via dedicated route.
// Kept in 1 file to avoid prototype churn; each sub-route locks its own tab and hides the tab pills.
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MOCK_FITPRO_STATIONS } from "@/mocks/community-hub/fitpro-stations";
import { formatCurrency } from "reborn-util";

// ── Toast nhỏ (replace alert()) ─────────────────────────────────────
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 2000,
      background: "#0B2E2A", color: "#fff", padding: "12px 20px",
      borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,.2)",
      fontSize: 13, maxWidth: 380, whiteSpace: "pre-line", lineHeight: 1.5,
    }}>
      {msg}
    </div>
  );
}

// ── Ledger HBL mock (6 kỳ) ─────────────────────────────────────────
interface ILedgerEntry {
  id: string;
  period: string;
  bo: string;
  file: string;
  paid: number;
  distributed: number;
  uploaded_at: string;
}
const INIT_LEDGER: ILedgerEntry[] = [
  { id: "L-006", period: "04/2026", bo: "Nguyễn Master (A007)", file: "HBL_commission_2026-04.xlsx", paid: 42_000_000, distributed: 41_200_000, uploaded_at: "2026-05-08 09:14" },
  { id: "L-005", period: "04/2026", bo: "Trần Thị B (A015)", file: "HBL_apr_TT-B.csv", paid: 18_400_000, distributed: 17_900_000, uploaded_at: "2026-05-07 16:42" },
  { id: "L-004", period: "03/2026", bo: "Nguyễn Master (A007)", file: "HBL_commission_2026-03.xlsx", paid: 38_500_000, distributed: 38_500_000, uploaded_at: "2026-04-08 10:30" },
  { id: "L-003", period: "03/2026", bo: "Trần Thị B (A015)", file: "HBL_mar_TT-B.csv", paid: 16_200_000, distributed: 16_200_000, uploaded_at: "2026-04-06 14:00" },
  { id: "L-002", period: "02/2026", bo: "Nguyễn Master (A007)", file: "HBL_commission_2026-02.xlsx", paid: 35_100_000, distributed: 35_100_000, uploaded_at: "2026-03-08 11:20" },
  { id: "L-001", period: "02/2026", bo: "Lê Văn C (A028)", file: "HBL_feb_LV-C.csv", paid: 12_800_000, distributed: 11_500_000, uploaded_at: "2026-03-07 09:55" },
];

type TabKey = "f2-station-type" | "f4-body-metrics" | "f5-cross-card" | "f6-sop" | "f7-finder" | "f8-commission" | "f9-funnel" | "f10-tax" | "f11-mf7";

const TABS: { key: TabKey; label: string; icon: string; priority: string; path: string; title: string }[] = [
  { key: "f2-station-type", label: "Cấu hình loại trạm", icon: "🏠", priority: "⭐⭐⭐", path: "/fp_station_type", title: "Cấu hình loại trạm" },
  { key: "f5-cross-card", label: "Thẻ liên thông", icon: "🎫", priority: "⭐⭐⭐", path: "/fp_cross_card", title: "Thẻ liên thông" },
  { key: "f4-body-metrics", label: "Chỉ số cơ thể", icon: "🩺", priority: "⭐⭐", path: "/fp_body_metrics", title: "Chỉ số cơ thể" },
  { key: "f6-sop", label: "SOP Compliance", icon: "✅", priority: "⭐⭐", path: "/fp_sop", title: "SOP Compliance" },
  { key: "f7-finder", label: "Tìm trạm", icon: "📍", priority: "⭐⭐", path: "/fp_finder", title: "Tìm trạm" },
  { key: "f8-commission", label: "Đối soát HBL", icon: "🧾", priority: "⭐⭐", path: "/fp_commission", title: "Đối soát HBL (zero-touch)" },
  { key: "f9-funnel", label: "Phễu marketing", icon: "📣", priority: "⭐⭐", path: "/fp_funnel", title: "Phễu marketing" },
  { key: "f10-tax", label: "Khai thuế", icon: "📋", priority: "⭐", path: "/fp_tax", title: "Khai thuế" },
  { key: "f11-mf7", label: "MF7 Onboarding", icon: "🎓", priority: "⭐", path: "/fp_mf7", title: "MF7 Onboarding" },
];

export default function FitProModulesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathTab = TABS.find((t) => t.path === location.pathname);
  const isStandalone = Boolean(pathTab);
  document.title = pathTab ? `FitPro — ${pathTab.title}` : "FitPro Modules";
  const [tab, setTab] = useState<TabKey>(pathTab ? pathTab.key : "f2-station-type");
  React.useEffect(() => {
    if (pathTab) setTab(pathTab.key);
  }, [pathTab?.key]);
  const [createStationType, setCreateStationType] = useState<"home" | "center" | "inside" | null>(null);
  const [shareContent, setShareContent] = useState<{ title: string; type: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [ledger, setLedger] = useState<ILedgerEntry[]>(INIT_LEDGER);
  const [selectedLedger, setSelectedLedger] = useState<ILedgerEntry | null>(null);
  const [medlatecOpen, setMedlatecOpen] = useState(false);
  const [taxFiling, setTaxFiling] = useState<{ code: string; revenue: number; tax: number } | null>(null);
  const [mf7Lesson, setMf7Lesson] = useState<{ day: number; title: string } | null>(null);
  const [stationForm, setStationForm] = useState({
    name: "",
    code: "",
    address: "",
    city: "Hà Nội",
    total_mats: 5,
    owner_name: "",
    opening_date: new Date().toISOString().split("T")[0],
  });

  const showToast = (m: string) => setToast(m);

  const handleCreateStation = () => {
    if (!stationForm.name.trim()) { showToast("⚠️ Vui lòng nhập tên trạm"); return; }
    if (!stationForm.code.trim()) { showToast("⚠️ Vui lòng nhập mã trạm"); return; }
    const typeLabel = createStationType === "home" ? "Home FitPro"
      : createStationType === "center" ? "FitPro CENTER"
      : "FitPro INSIDE";
    showToast(`✓ Đã tạo ${typeLabel}: ${stationForm.name} (${stationForm.code})\nSetup 72h sẽ bắt đầu.\n→ Mở sơ đồ thảm tập...`);
    setCreateStationType(null);
    setStationForm({ name: "", code: "", address: "", city: "Hà Nội", total_mats: 5, owner_name: "", opening_date: new Date().toISOString().split("T")[0] });
    setTimeout(() => navigate("/ch_accommodation"), 1200);
  };

  const handleUploadHBL = (filename: string) => {
    const nextId = `L-${String(ledger.length + 1).padStart(3, "0")}`;
    const newEntry: ILedgerEntry = {
      id: nextId,
      period: "05/2026",
      bo: "Nguyễn Master (A007)",
      file: filename,
      paid: 44_500_000 + Math.round(Math.random() * 3_000_000),
      distributed: 43_900_000,
      uploaded_at: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setLedger((prev) => [newEntry, ...prev]);
    showToast(`✓ Đã import "${filename}"\n→ Tạo ledger entry ${nextId} (passthrough)\n→ Không sinh giao dịch tiền`);
  };

  return (
    <div style={{ padding: 20, background: "#F5F9F8", minHeight: "calc(100vh - 60px)" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#0B2E2A" }}>
          {pathTab ? `${pathTab.icon} ${pathTab.title}` : "🛠️ FitPro Modules (Prototype)"}
        </h2>
        <p style={{ fontSize: 13, color: "#6B8A85", marginTop: 4 }}>
          {pathTab
            ? "Phân hệ FitPro-specific — truy cập qua menu bên trái hoặc link trực tiếp"
            : "9 phân hệ FitPro-specific (F2, F4–F11) — prototype hub, mỗi phân hệ cũng có menu + URL riêng"}
        </p>
      </div>

      {/* Tab pills — chỉ hiện ở hub, ẩn khi truy cập route riêng */}
      {!isStandalone && (
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
      )}

      <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(11,46,42,.06)", minHeight: 400 }}>
        {/* F2: Station Type config — 3 loại: HOME / CENTER / INSIDE */}
        {tab === "f2-station-type" && (
          <div>
            <h3 style={{ marginTop: 0 }}>🏠 Cấu hình loại trạm (3 mô hình Phygital)</h3>
            <p style={{ fontSize: 13, color: "#6B8A85" }}>
              Theo định vị của Reborn JSC trong tài liệu chiến lược "Kiến tạo hạ tầng sức khỏe cho 100 triệu người Việt": 3 loại trạm tương ứng 3 mô hình triển khai khác nhau — từ nhà tại gia, hub cộng đồng, đến plugin cấy vào gym/yoga có sẵn.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 20 }}>
              {[
                {
                  type: "home", label: "Home FitPro", color: "#4DE4C4", icon: "🏠",
                  desc: "Mạch máu — biến ngôi nhà thành điểm kinh doanh qua mạng lưới quan hệ thân quen",
                  mats: "3-7 thảm",
                  investment: "CapEx gần bằng 0 — chỉ cần thảm",
                  hours: "6:00 - 9:00",
                  customers: "Gia đình, thân quen",
                  setup_cost: "< 10 triệu",
                },
                {
                  type: "center", label: "FitPro CENTER", color: "#FF8C42", icon: "🏢",
                  desc: "Hub cộng đồng — điểm tập chuyên nghiệp địa phương, loại bỏ máy móc hạng nặng, tối ưu ROI trên m²",
                  mats: "10-20 thảm",
                  investment: "Chia sẻ với 5-7 BO khác",
                  hours: "6:00 - 9:00",
                  customers: "Vãng lai + thân quen",
                  setup_cost: "~30-50 triệu (chia 5-7 BO)",
                },
                {
                  type: "inside", label: "FitPro INSIDE", color: "#2563EB", icon: "🔌",
                  desc: "Cánh tay nối dài — plugin hệ điều hành Phygital cấy vào Gym/Yoga có sẵn. Tích hợp 0 đồng, cộng hưởng lưu lượng khách, chuẩn hóa dinh dưỡng cho thị trường cũ",
                  mats: "Dùng thảm của gym chủ",
                  investment: "0 đồng OpEx — hợp tác liên minh",
                  hours: "Theo giờ gym chủ",
                  customers: "Toàn bộ hội viên gym chủ",
                  setup_cost: "0 đồng (chia sẻ doanh thu digital)",
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
                  <button
                    onClick={() => {
                      const typ = s.type as "home" | "center" | "inside";
                      setCreateStationType(typ);
                      setStationForm({
                        ...stationForm,
                        total_mats: typ === "home" ? 5 : typ === "center" ? 12 : 0,
                      });
                    }}
                    style={{ marginTop: 12, width: "100%", padding: "8px 14px", background: s.color, color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}
                  >
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 20 }}>
              <div style={{ padding: 18, background: "#F5F9F8", borderRadius: 10 }}>
                <h4 style={{ marginTop: 0 }}>Bảng đo mẫu cho thành viên "Trần Thị Hương" (Day 73/90)</h4>
                <div style={{ overflowX: "auto" }}><table style={{ width: "100%", minWidth: 560, fontSize: 12, borderCollapse: "collapse" }}>
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
                </table></div>
              </div>
              <div>
                <div style={{ padding: 14, background: "#FFF7E6", borderRadius: 10, marginBottom: 12 }}>
                  <h4 style={{ marginTop: 0, fontSize: 13 }}>📅 Lịch xét nghiệm Medlatec</h4>
                  <div style={{ fontSize: 11, marginBottom: 8 }}>
                    <div>✅ Baseline: 2026-02-03 (Done)</div>
                    <div>🔬 Re-test: 2026-04-28 (Upcoming)</div>
                  </div>
                  <button
                    onClick={() => setMedlatecOpen(true)}
                    style={{ width: "100%", padding: "8px", background: "#FF8C42", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
                  >
                    📞 Đặt lịch Medlatec
                  </button>
                </div>
                <div style={{ padding: 14, background: "#E4F7F3", borderRadius: 10 }}>
                  <h4 style={{ marginTop: 0, fontSize: 13 }}>🎯 Đánh giá</h4>
                  <div style={{ fontSize: 11, color: "#6B8A85" }}>
                    Thành viên đang đạt <strong style={{ color: "#00C9A7" }}>71% target</strong>, có khả năng cao hoàn thành 90 ngày với kết quả tốt. Khuyến nghị nhắc BO review kế hoạch dinh dưỡng.
                  </div>
                </div>

                {/* ── Phase 2.3 — AI Nutrition Engine recommendation ── */}
                <div style={{ marginTop: 12, padding: 14, background: "#EEF3FF", borderRadius: 10, border: "1px solid #B8C9E8" }}>
                  <h4 style={{ marginTop: 0, fontSize: 13, color: "#1E3A8A" }}>🤖 AI Nutrition Engine — gợi ý khẩu phần sau buổi tập</h4>
                  <div style={{ fontSize: 11, color: "#1E3A8A", lineHeight: 1.7 }}>
                    Dựa trên dữ liệu Medlatec + cân nặng + mục tiêu → gợi ý tự động sau mỗi check-out:<br/>
                    🥤 <strong>35g Whey Protein</strong> (Herbalife F1 Nutritional Shake)<br/>
                    🍽️ <strong>450 kcal</strong> bữa chính — ưu tiên rau xanh + gà/cá + tinh bột phức hợp<br/>
                    💊 Bổ sung <strong>Magnesium 400mg</strong> (hỗ trợ phục hồi cơ)<br/>
                    <div style={{ marginTop: 8, fontSize: 10, color: "#6B7280" }}>
                      → Push notification tới app hội viên trong 5 phút sau check-out. (UR-FITPRO-AI-NUT)
                    </div>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <h3 style={{ marginTop: 0 }}>✅ SOP Compliance — Giám sát chất lượng trạm</h3>
                <p style={{ fontSize: 13, color: "#6B8A85" }}>Master BO giám sát tất cả trạm downline tuân thủ SOP chuẩn thương hiệu FitPro</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => showToast("📊 Đã xuất báo cáo SOP compliance → Excel\n5 trạm · điểm TB 87/100")}
                  style={{ padding: "8px 14px", background: "#fff", color: "#00C9A7", border: "1px solid #00C9A7", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  📊 Xuất báo cáo
                </button>
                <button onClick={() => showToast("📝 Đã lên lịch audit đột xuất\n→ 2 trạm điểm < 85 sẽ được kiểm tra trong 7 ngày")}
                  style={{ padding: "8px 14px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  ⚡ Lên lịch audit
                </button>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
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
              <div style={{ overflowX: "auto" }}><table style={{ width: "100%", minWidth: 560, fontSize: 12, borderCollapse: "collapse" }}>
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
                        <td style={{ padding: 10 }}>
                          <strong>{s.code}</strong>
                          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#2563EB", marginTop: 2 }}>📍 {s.location_code}</div>
                        </td>
                        <td style={{ padding: 10 }}>
                          {s.owner_name}
                          {s.owner_affiliate_code && (
                            <div style={{ fontFamily: "monospace", fontSize: 10, color: "#FF8C42", marginTop: 2 }}>{s.owner_affiliate_code}</div>
                          )}
                        </td>
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
              </table></div>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {MOCK_FITPRO_STATIONS.filter(s => s.status === "active").map((s, i) => (
                  <div key={s.id} style={{ padding: 14, background: "#F5F9F8", borderRadius: 10, borderLeft: `3px solid ${s.type === "home" ? "#4DE4C4" : "#FF8C42"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <strong style={{ fontSize: 13 }}>{s.name}</strong>
                        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#2563EB", marginTop: 2 }}>{s.location_code} · {s.code}</div>
                        <div style={{ fontSize: 11, color: "#6B8A85", marginTop: 2 }}>📍 {s.address}</div>
                        <div style={{ fontSize: 11, color: "#6B8A85" }}>⏰ {s.operating_hours}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#00C9A7" }}>{[1.2, 3.5, 8.0, 12.4, 5.1][i]} km</div>
                        <button
                          onClick={() => {
                            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address + ", " + s.city)}`;
                            window.open(mapsUrl, "_blank", "noopener");
                          }}
                          style={{ padding: "4px 10px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 4, fontSize: 11, marginTop: 4, cursor: "pointer" }}
                        >
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

        {/* F8: Đối soát HBL (zero-touch) — App KHÔNG cầm tiền, KHÔNG hiển thị commission thực */}
        {tab === "f8-commission" && (
          <div>
            {/* Banner Nguyên tắc thép Dual Cash-Flow */}
            <div style={{
              padding: "14px 18px",
              marginBottom: 18,
              background: "linear-gradient(90deg, #FEF3C7 0%, #FFFBEB 100%)",
              border: "1.5px solid #F59E0B",
              borderLeft: "6px solid #F59E0B",
              borderRadius: 10,
              fontSize: 12.5,
              color: "#7C2D12",
              lineHeight: 1.7,
            }}>
              ⚖️ <strong>Nguyên tắc thép — Dual Cash-Flow:</strong> Hoa hồng 37% Herbalife thuộc <strong>Luồng 2</strong> — đi thẳng từ HBL về tài khoản cá nhân NPP, <strong>zero-touch với App FitPro</strong>. App không cầm tiền, không tính, không phân phối, không hiển thị commission thực. Module này chỉ <strong>đối soát file</strong> NPP xuất từ portal HBL với phân phối anh ấy ghi nhận xuống nhánh, để cảnh báo chênh lệch nội bộ. <em>(Tuân thủ pháp lý đa cấp VN — xem business-model.md)</em>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ marginTop: 0 }}>🧾 Đối soát commission HBL (NPP tự nhập)</h3>
                <p style={{ fontSize: 13, color: "#6B8A85", margin: 0 }}>Upload file commission xuất từ portal Herbalife → so sánh với phân phối nội bộ → cảnh báo lệch. <strong>Không tính, không chi.</strong></p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <label style={{ padding: "8px 14px", background: "#fff", color: "#0B2E2A", border: "1px solid #00C9A7", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  📤 Upload file HBL (CSV/Excel)
                  <input type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadHBL(f.name);
                    }}
                  />
                </label>
                <button onClick={() => showToast(`📑 Xuất báo cáo đối soát → Excel\n• ${ledger.length} entry\n• Tổng HBL chuyển: ${formatCurrency(ledger.reduce((a, e) => a + e.paid, 0), ".", "")}đ\n• Tổng phân phối: ${formatCurrency(ledger.reduce((a, e) => a + e.distributed, 0), ".", "")}đ`)}
                  style={{ padding: "8px 14px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  📑 Xuất báo cáo đối soát
                </button>
              </div>
            </div>

            {/* Sơ đồ Dual Cash-Flow */}
            <div style={{ marginTop: 18, padding: 16, background: "#F5F9F8", borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0B2E2A", marginBottom: 10 }}>📊 Luồng tiền HBL — zero-touch với App</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 8, alignItems: "center", fontSize: 11 }}>
                <div style={{ padding: 10, background: "#fff", borderRadius: 6, textAlign: "center", border: "1px dashed #d9e0de" }}>
                  <div style={{ fontSize: 22 }}>👤</div>
                  <div style={{ fontWeight: 600 }}>Khách hàng</div>
                  <div style={{ color: "#6B8A85", marginTop: 2 }}>Đặt hàng dưới mã NPP</div>
                </div>
                <div style={{ color: "#00C9A7", fontWeight: 700 }}>→</div>
                <div style={{ padding: 10, background: "#fff", borderRadius: 6, textAlign: "center", border: "1px solid #FF8C42" }}>
                  <div style={{ fontSize: 22 }}>🏭</div>
                  <div style={{ fontWeight: 600 }}>Herbalife VN</div>
                  <div style={{ color: "#6B8A85", marginTop: 2 }}>Tính 37% trên 73% lợi nhuận NPP</div>
                </div>
                <div style={{ color: "#00C9A7", fontWeight: 700 }}>→</div>
                <div style={{ padding: 10, background: "#fff", borderRadius: 6, textAlign: "center", border: "1px solid #00C9A7" }}>
                  <div style={{ fontSize: 22 }}>💳</div>
                  <div style={{ fontWeight: 600 }}>TK cá nhân NPP</div>
                  <div style={{ color: "#6B8A85", marginTop: 2 }}>HBL chuyển trực tiếp</div>
                </div>
              </div>
              <div style={{ marginTop: 10, padding: 8, background: "#FEE2E2", borderRadius: 6, fontSize: 11, color: "#991B1B" }}>
                ❌ App FitPro KHÔNG xuất hiện trong chuỗi trên. Mọi nỗ lực ghi nhận commission HBL trong App → vi phạm Dual Cash-Flow.
              </div>
            </div>

            {/* Ledger các file HBL đã upload */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h4 style={{ margin: 0 }}>📁 Ledger — file commission HBL đã upload (passthrough)</h4>
                <span style={{ fontSize: 11, color: "#6B8A85" }}>{ledger.length} entry · click 1 hàng để xem chi tiết đối soát</span>
              </div>
              {ledger.length === 0 ? (
                <div style={{ padding: 30, textAlign: "center", background: "#F5F9F8", borderRadius: 10, color: "#6B8A85", fontSize: 13 }}>
                  📭 Chưa có file commission nào được upload. Bấm "Upload file HBL" ở trên để bắt đầu đối soát.
                </div>
              ) : (
              <div style={{ overflowX: "auto" }}><table style={{ width: "100%", minWidth: 720, fontSize: 12, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#E4F7F3" }}>
                    <th style={{ padding: 10, textAlign: "left" }}>Kỳ</th>
                    <th style={{ padding: 10, textAlign: "left" }}>NPP (BO upload)</th>
                    <th style={{ padding: 10, textAlign: "left" }}>File gốc HBL</th>
                    <th style={{ padding: 10, textAlign: "right" }}>HBL chuyển về TK NPP</th>
                    <th style={{ padding: 10, textAlign: "right" }}>NPP khai phân phối</th>
                    <th style={{ padding: 10, textAlign: "right" }}>Chênh lệch</th>
                    <th style={{ padding: 10, textAlign: "center" }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((row) => {
                    const diff = row.paid - row.distributed;
                    const ok = diff === 0;
                    return (
                      <tr key={row.id} onClick={() => setSelectedLedger(row)} style={{ borderBottom: "1px solid #E0E8E5", cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F9F8")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: 10, fontWeight: 600 }}>{row.period}</td>
                        <td style={{ padding: 10 }}>{row.bo}</td>
                        <td style={{ padding: 10, fontFamily: "monospace", fontSize: 11, color: "#6B8A85" }}>{row.file}</td>
                        <td style={{ padding: 10, textAlign: "right" }}>{formatCurrency(row.paid, ".", "")}đ</td>
                        <td style={{ padding: 10, textAlign: "right" }}>{formatCurrency(row.distributed, ".", "")}đ</td>
                        <td style={{ padding: 10, textAlign: "right", color: ok ? "#00C9A7" : "#E8473B", fontWeight: 700 }}>
                          {ok ? "✓ Khớp" : `−${formatCurrency(Math.abs(diff), ".", "")}đ`}
                        </td>
                        <td style={{ padding: 10, textAlign: "center" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 10, background: ok ? "#E4F7F3" : "#FEE2E2", color: ok ? "#00C9A7" : "#E8473B", fontSize: 11, fontWeight: 600 }}>
                            {ok ? "Đã đối soát" : "Cảnh báo lệch"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table></div>
              )}
            </div>

            {/* Reference — % cấu hình tenant (read-only display) */}
            <div style={{ marginTop: 20, padding: 14, background: "#EEF3FF", border: "1px solid #B8C9E8", borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1E3A8A", marginBottom: 8 }}>
                ⚙️ Cấu hình % tham chiếu phân phối nhánh (tenant setting — F5.3)
              </div>
              <div style={{ fontSize: 11, color: "#1E3A8A", lineHeight: 1.7 }}>
                Hệ thống chỉ <strong>so sánh tham chiếu</strong>: NPP khai phân phối có khớp tỷ lệ chuẩn không. Cấu hình tại{" "}
                <a href="/ch_tenant_config" style={{ color: "#0B2E2A", fontWeight: 700 }}>/ch_tenant_config</a>. <strong>App không tự động chi trả.</strong>
              </div>
            </div>
          </div>
        )}

        {/* F9: Marketing funnel */}
        {tab === "f9-funnel" && (
          <div>
            <h3 style={{ marginTop: 0 }}>📣 Phễu marketing & Content</h3>
            <p style={{ fontSize: 13, color: "#6B8A85" }}>Chuyển khách lạnh → cộng đồng → thành viên. Thư viện video/bài viết + công cụ lan tỏa cho BO</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around", alignItems: "center", gap: 12, padding: 30, background: "#F5F9F8", borderRadius: 12, marginTop: 20 }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
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
                      <button
                        onClick={() => setShareContent({ title: c.title, type: c.type })}
                        style={{ padding: "4px 10px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer" }}
                      >
                        Chia sẻ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* F10: Tax per station — prototype view. Full module nằm ở /tax (src/modules/tax) */}
        {tab === "f10-tax" && (
          <div>
            <div style={{ padding: 12, marginBottom: 16, background: "#FFFBEB", borderLeft: "4px solid #F59E0B", borderRadius: 6, fontSize: 12, color: "#92400E" }}>
              ℹ️ Đây là prototype view cấp trạm. Phân hệ Thuế HKD/CNKD đầy đủ (TT 40/2021, NĐ 70/2025) đã có tại{" "}
              <a href="/tax" style={{ color: "#0B2E2A", fontWeight: 700 }}>/tax</a>
              {" — "}portable, dùng chung cho mọi nhánh sản phẩm.
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 0 }}>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 4 }}>📋 Khai thuế từng trạm (Hộ kinh doanh)</h3>
                <p style={{ fontSize: 13, color: "#6B8A85", margin: 0 }}>Mỗi trạm có thể là 1 hộ kinh doanh riêng — quản lý doanh thu, khai thuế hàng tháng</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => showToast("💰 Đã gửi khai thuế hàng loạt 03/2026 → Chi cục Thuế\n• 4 trạm đã nộp · 1 trạm chưa phát sinh DT")}
                  style={{ padding: "8px 14px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                >
                  💰 Khai thuế hàng loạt
                </button>
                <button
                  onClick={() => showToast("📑 Đã xuất báo cáo thuế 03/2026 → Excel")}
                  style={{ padding: "8px 14px", background: "#fff", color: "#00C9A7", border: "1px solid #00C9A7", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                >
                  📑 Xuất báo cáo
                </button>
              </div>
            </div>
            <div style={{ overflowX: "auto", marginTop: 20 }}><table style={{ width: "100%", minWidth: 700, fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#E4F7F3" }}>
                  <th style={{ padding: 10, textAlign: "left" }}>Trạm</th>
                  <th style={{ padding: 10, textAlign: "center" }}>MST HKD</th>
                  <th style={{ padding: 10, textAlign: "right" }}>DT tháng 03</th>
                  <th style={{ padding: 10, textAlign: "right" }}>Thuế khoán (1.5%)</th>
                  <th style={{ padding: 10, textAlign: "center" }}>Trạng thái nộp</th>
                  <th style={{ padding: 10, textAlign: "center" }}>Hạn nộp</th>
                  <th style={{ padding: 10, textAlign: "center" }}>Hành động</th>
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
                      <td style={{ padding: 10 }}>
                        <strong>{s.code}</strong>
                        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#2563EB", marginTop: 2 }}>{s.location_code}</div>
                        <span style={{ fontSize: 10, color: "#6B8A85" }}>{s.owner_name}</span>
                      </td>
                      <td style={{ padding: 10, fontFamily: "monospace", fontSize: 11, textAlign: "center" }}>HKD-{String(i + 1).padStart(4, "0")}</td>
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
                      <td style={{ padding: 10, textAlign: "center" }}>
                        <button
                          onClick={() => setTaxFiling({ code: s.code, revenue: s.month_revenue_vnd, tax: taxAmount })}
                          style={{ padding: "4px 10px", background: statusText === "Chưa nộp" ? "#FF8C42" : "#E4F7F3", color: statusText === "Chưa nộp" ? "#fff" : "#00C9A7", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                        >
                          {statusText === "Chưa nộp" ? "Khai ngay" : "Xem"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
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
                    {s.done ? (
                      <span style={{ fontSize: 11, color: "#00C9A7" }}>✅ Hoàn thành</span>
                    ) : (
                      <button
                        onClick={() => setMf7Lesson({ day: s.day, title: s.title })}
                        style={{ padding: "6px 12px", background: "#00C9A7", color: "#fff", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                      >
                        ▶ Bắt đầu
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Chia sẻ content ── */}
      {shareContent && (
        <div
          onClick={() => setShareContent(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(11,46,42,.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 14, width: 480, maxWidth: "90vw",
              boxShadow: "0 20px 60px rgba(11,46,42,.3)",
            }}
          >
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E0E8E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#0B2E2A" }}>📤 Chia sẻ nội dung</h3>
              <button
                onClick={() => setShareContent(null)}
                style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#6B8A85" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ padding: 14, background: "#F5F9F8", borderRadius: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#6B8A85" }}>{shareContent.type}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0B2E2A", marginTop: 4 }}>{shareContent.title}</div>
              </div>

              <div style={{ fontSize: 12, color: "#6B8A85", marginBottom: 10 }}>Chọn kênh chia sẻ tới khách hàng tiềm năng:</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
                {[
                  { key: "zalo", icon: "💬", label: "Zalo", color: "#0068ff" },
                  { key: "fb", icon: "📘", label: "Facebook", color: "#1877f2" },
                  { key: "messenger", icon: "📨", label: "Messenger", color: "#0084ff" },
                  { key: "sms", icon: "📱", label: "SMS", color: "#00C9A7" },
                  { key: "email", icon: "📧", label: "Email", color: "#722ed1" },
                  { key: "qr", icon: "🔳", label: "QR Code", color: "#0B2E2A" },
                  { key: "copy", icon: "🔗", label: "Copy link", color: "#6B8A85" },
                  { key: "download", icon: "⬇️", label: "Tải về", color: "#FF8C42" },
                ].map((ch) => (
                  <button
                    key={ch.key}
                    onClick={() => {
                      if (ch.key === "copy") {
                        try {
                          navigator.clipboard.writeText(`https://fitpro.vn/content/${shareContent.title.toLowerCase().replace(/\s+/g, "-")}`);
                          showToast("✓ Đã copy link vào clipboard");
                        } catch {
                          showToast("⚠️ Trình duyệt không hỗ trợ copy");
                        }
                      } else {
                        showToast(`✓ Đã gửi "${shareContent.title}" qua ${ch.label}`);
                      }
                      setShareContent(null);
                    }}
                    style={{
                      padding: "14px 8px",
                      border: `1px solid ${ch.color}44`,
                      background: "#fff",
                      borderRadius: 8,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${ch.color}11`; e.currentTarget.style.borderColor = ch.color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = `${ch.color}44`; }}
                  >
                    <span style={{ fontSize: 22 }}>{ch.icon}</span>
                    <span style={{ fontSize: 11, color: ch.color, fontWeight: 600 }}>{ch.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ padding: 12, background: "#FFF7E6", borderRadius: 8, fontSize: 11, color: "#8B5A00" }}>
                💡 Mỗi lượt chia sẻ được tracking để tính KPI lan tỏa của BO. Link chia sẻ có UTM gắn mã BO của bạn để tính hoa hồng khi khách chuyển đổi.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Tạo trạm mới ── */}
      {createStationType && (
        <div
          onClick={() => setCreateStationType(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(11,46,42,.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 14, width: 560, maxWidth: "90vw",
              maxHeight: "90vh", display: "flex", flexDirection: "column",
              boxShadow: "0 20px 60px rgba(11,46,42,.3)",
            }}
          >
            <div style={{
              padding: "18px 24px",
              borderBottom: "1px solid #E0E8E5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: createStationType === "home"
                ? "linear-gradient(135deg, #E4F7F3 0%, #fff 100%)"
                : createStationType === "center"
                ? "linear-gradient(135deg, #FFF0E3 0%, #fff 100%)"
                : "linear-gradient(135deg, #E0EBFF 0%, #fff 100%)",
              borderRadius: "14px 14px 0 0",
              flexShrink: 0,
            }}>
              <h3 style={{ margin: 0, color: "#0B2E2A" }}>
                {createStationType === "home" ? "🏠 Tạo Home FitPro"
                  : createStationType === "center" ? "🏢 Tạo FitPro CENTER"
                  : "🔌 Tạo FitPro INSIDE (plugin cấy vào gym có sẵn)"}
              </h3>
              <button
                onClick={() => setCreateStationType(null)}
                style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#6B8A85" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
              <div style={{ padding: 12, background: "#F5F9F8", borderRadius: 8, marginBottom: 16, fontSize: 12, color: "#6B8A85" }}>
                {createStationType === "inside" ? (
                  <>🔌 <strong>Model INSIDE:</strong> plugin cấy vào gym/yoga có sẵn · 0 đồng đầu tư · chia sẻ doanh thu digital với chủ gym partner</>
                ) : (
                  <>
                    ⏰ Giờ vận hành: <strong>6:00 - 9:00</strong> sáng ·
                    🧘 Số thảm: <strong>{createStationType === "home" ? "3-7" : "10-20"}</strong> ·
                    ⚡ Sẵn sàng đón khách sau <strong>72 giờ</strong> setup
                  </>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Tên trạm *</label>
                <input
                  autoFocus
                  type="text"
                  value={stationForm.name}
                  onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
                  placeholder={
                    createStationType === "home" ? "VD: Trạm Nguyễn Văn A (Hà Đông)"
                    : createStationType === "center" ? "VD: Trạm Cầu Giấy CENTER"
                    : "VD: FitPro INSIDE @ California Gym Mỹ Đình"
                  }
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Mã trạm *</label>
                  <input
                    type="text"
                    value={stationForm.code}
                    onChange={(e) => setStationForm({ ...stationForm, code: e.target.value })}
                    placeholder="FP-HN-XXX"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Thành phố</label>
                  <input
                    type="text"
                    value={stationForm.city}
                    onChange={(e) => setStationForm({ ...stationForm, city: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>Địa chỉ</label>
                <input
                  type="text"
                  value={stationForm.address}
                  onChange={(e) => setStationForm({ ...stationForm, address: e.target.value })}
                  placeholder="Số nhà, đường, quận..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                {createStationType !== "inside" && (
                  <div>
                    <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>
                      Số thảm tập ({createStationType === "home" ? "3-7" : "10-20"})
                    </label>
                    <input
                      type="number"
                      min={createStationType === "home" ? 3 : 10}
                      max={createStationType === "home" ? 7 : 20}
                      value={stationForm.total_mats}
                      onChange={(e) => setStationForm({ ...stationForm, total_mats: Number(e.target.value) })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }}
                    />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>
                    {createStationType === "inside" ? "Ngày deploy plugin" : "Ngày khai trương"}
                  </label>
                  <input
                    type="date"
                    value={stationForm.opening_date}
                    onChange={(e) => setStationForm({ ...stationForm, opening_date: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }}
                  />
                </div>
              </div>

              {/* Fields đặc thù cho INSIDE — gym chủ + % share */}
              {createStationType === "inside" && (
                <div style={{
                  padding: 14, background: "#EEF3FF", borderRadius: 10,
                  border: "1px solid #B8C9E8", marginBottom: 14,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1E3A8A", marginBottom: 10 }}>
                    🔌 Thông tin Gym chủ nhà (host brand)
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12, color: "#4B5563", marginBottom: 4, display: "block" }}>
                      Tên thương hiệu gym chủ *
                    </label>
                    <input
                      type="text"
                      value={(stationForm as any).host_brand_name || ""}
                      onChange={(e) => setStationForm({ ...stationForm, host_brand_name: e.target.value } as any)}
                      placeholder="VD: California Gym, Fit24, Elite Yoga..."
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #B8C9E8", fontSize: 14 }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, color: "#4B5563", marginBottom: 4, display: "block" }}>
                        BO partner (Chủ gym phụ trách — profile "Chủ Gym Partner")
                      </label>
                      <input
                        type="text"
                        value={(stationForm as any).host_partner_bo_id || ""}
                        onChange={(e) => setStationForm({ ...stationForm, host_partner_bo_id: e.target.value } as any)}
                        placeholder="Chọn BO profile=gym_partner..."
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #B8C9E8", fontSize: 14 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "#4B5563", marginBottom: 4, display: "block" }}>
                        % chia doanh thu digital (0-100)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={20}
                        value={(stationForm as any).revenue_share_digital ?? 20}
                        onChange={(e) => setStationForm({ ...stationForm, revenue_share_digital: Number(e.target.value) } as any)}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #B8C9E8", fontSize: 14 }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 11, color: "#6B7280" }}>
                    💡 BO partner sẽ nhận % doanh thu digital (subscription, nutrition) để bù chi phí chia sẻ không gian + khách hàng. Mặc định 20%.
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#6B8A85", marginBottom: 4, display: "block" }}>
                  {createStationType === "inside" ? "BO FitPro quản lý plugin" : "Chủ trạm (BO phụ trách)"}
                </label>
                <input
                  type="text"
                  value={stationForm.owner_name}
                  onChange={(e) => setStationForm({ ...stationForm, owner_name: e.target.value })}
                  placeholder={createStationType === "inside" ? "Tên BO FitPro chăm sóc plugin này..." : "Tên BO chịu trách nhiệm..."}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d9e0de", fontSize: 14 }}
                />
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #E0E8E5", display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0, background: "#fff", borderRadius: "0 0 14px 14px" }}>
              <button
                onClick={() => setCreateStationType(null)}
                style={{
                  padding: "10px 20px", borderRadius: 8, border: "1px solid #d9e0de", background: "#fff",
                  color: "#6B8A85", fontWeight: 600, cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateStation}
                disabled={!stationForm.name.trim() || !stationForm.code.trim()}
                style={{
                  padding: "10px 20px", borderRadius: 8, border: "none",
                  background: createStationType === "home" ? "#4DE4C4"
                    : createStationType === "center" ? "#FF8C42"
                    : "#2563EB",
                  color: "#fff", fontWeight: 700, cursor: "pointer",
                  opacity: !stationForm.name.trim() || !stationForm.code.trim() ? 0.5 : 1,
                }}
              >
                {createStationType === "inside" ? "✓ Cấy plugin & Kích hoạt" : "✓ Tạo trạm & Bắt đầu setup 72h"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Medlatec đặt lịch xét nghiệm ── */}
      {medlatecOpen && (
        <div onClick={() => setMedlatecOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(11,46,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 14, width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(11,46,42,.3)" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E0E8E5", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, #FFF0E3 0%, #fff 100%)" }}>
              <h3 style={{ margin: 0, color: "#0B2E2A" }}>🩺 Đặt lịch xét nghiệm Medlatec</h3>
              <button onClick={() => setMedlatecOpen(false)} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#6B8A85" }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ padding: 12, background: "#FFF7E6", borderRadius: 8, marginBottom: 16, fontSize: 12, color: "#8B5A00" }}>
                ℹ️ Member <strong>Trần Thị Hương</strong> · Gói VIP · Day 73/90 · Re-test scheduled
              </div>
              <div style={{ display: "grid", gap: 12, fontSize: 13 }}>
                <div><strong>Gói xét nghiệm:</strong> Tổng quát 12 chỉ số (kèm gói VIP)</div>
                <div><strong>Ngày đề xuất:</strong> 2026-04-28 (D85, trước khi outcome)</div>
                <div><strong>Giờ:</strong> 08:00 — lấy mẫu tại nhà trạm FitPro</div>
                <div><strong>Chi phí:</strong> <span style={{ color: "#00C9A7", fontWeight: 700 }}>0đ — đã bao gồm trong gói VIP</span></div>
              </div>
              <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setMedlatecOpen(false)} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #d9e0de", background: "#fff", color: "#6B8A85", fontWeight: 600, cursor: "pointer" }}>Hủy</button>
                <button onClick={() => { setMedlatecOpen(false); showToast("📞 Đã đặt lịch Medlatec 2026-04-28 08:00\n→ Notification đã gửi tới member qua Zalo OA"); }}
                  style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#FF8C42", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  ✓ Xác nhận đặt lịch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Tax Filing chi tiết theo trạm ── */}
      {taxFiling && (
        <div onClick={() => setTaxFiling(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(11,46,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 14, width: 520, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(11,46,42,.3)" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E0E8E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#0B2E2A" }}>📋 Khai thuế HKD trạm {taxFiling.code}</h3>
              <button onClick={() => setTaxFiling(null)} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#6B8A85" }}>✕</button>
            </div>
            <div style={{ padding: 24, fontSize: 13 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #E0E8E5" }}><td style={{ padding: 8, color: "#6B8A85" }}>Doanh thu 03/2026</td><td style={{ padding: 8, textAlign: "right", fontWeight: 600 }}>{formatCurrency(taxFiling.revenue, ".", "")}đ</td></tr>
                  <tr style={{ borderBottom: "1px solid #E0E8E5" }}><td style={{ padding: 8, color: "#6B8A85" }}>Tỷ lệ khoán</td><td style={{ padding: 8, textAlign: "right" }}>1,5%</td></tr>
                  <tr style={{ borderBottom: "1px solid #E0E8E5" }}><td style={{ padding: 8, color: "#6B8A85" }}>Thuế phải nộp</td><td style={{ padding: 8, textAlign: "right", color: "#FF8C42", fontWeight: 700 }}>{formatCurrency(taxFiling.tax, ".", "")}đ</td></tr>
                  <tr><td style={{ padding: 8, color: "#6B8A85" }}>Hạn nộp</td><td style={{ padding: 8, textAlign: "right" }}>20/04/2026</td></tr>
                </tbody>
              </table>
              <div style={{ marginTop: 14, padding: 10, background: "#EEF3FF", borderRadius: 6, fontSize: 11, color: "#1E3A8A" }}>
                💡 Sang module <a href="/tax" style={{ color: "#0B2E2A", fontWeight: 700 }}>/tax</a> để khai TT 40/2021 + NĐ 70/2025 đầy đủ.
              </div>
              <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setTaxFiling(null)} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #d9e0de", background: "#fff", color: "#6B8A85", fontWeight: 600, cursor: "pointer" }}>Đóng</button>
                <button onClick={() => { setTaxFiling(null); showToast(`✓ Đã gửi tờ khai HKD trạm ${taxFiling.code} → Chi cục Thuế`); }}
                  style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#00C9A7", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  ✓ Gửi tờ khai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal MF7 Lesson ── */}
      {mf7Lesson && (
        <div onClick={() => setMf7Lesson(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(11,46,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 14, width: 520, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(11,46,42,.3)" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E0E8E5", background: "linear-gradient(135deg, #E4F7F3 0%, #FFF0E3 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#0B2E2A" }}>🎓 Bài học ngày {mf7Lesson.day} — MF7 Onboarding</h3>
              <button onClick={() => setMf7Lesson(null)} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#6B8A85" }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <h4 style={{ marginTop: 0 }}>{mf7Lesson.title}</h4>
              <div style={{ padding: 18, background: "#000", borderRadius: 8, color: "#fff", textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>▶</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Video giảng giải · 18 phút · HD</div>
              </div>
              <ul style={{ fontSize: 13, color: "#0B2E2A", lineHeight: 1.7, paddingLeft: 18 }}>
                <li>Mục tiêu bài học · 4 trang slide PDF kèm</li>
                <li>Quiz cuối bài (3 câu) — đạt 2/3 mới sang ngày kế</li>
                <li>Workbook in-app: ghi chú riêng theo nhánh</li>
              </ul>
              <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setMf7Lesson(null)} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #d9e0de", background: "#fff", color: "#6B8A85", fontWeight: 600, cursor: "pointer" }}>Đóng</button>
                <button onClick={() => { setMf7Lesson(null); showToast(`✓ Đã đánh dấu hoàn thành ngày ${mf7Lesson.day}`); }}
                  style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#00C9A7", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  ✓ Hoàn thành bài học
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Ledger Detail (HBL đối soát chi tiết) ── */}
      {selectedLedger && (
        <div onClick={() => setSelectedLedger(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(11,46,42,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 14, width: 600, maxWidth: "92vw", boxShadow: "0 20px 60px rgba(11,46,42,.3)" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #E0E8E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#0B2E2A" }}>🧾 Đối soát chi tiết — {selectedLedger.id}</h3>
              <button onClick={() => setSelectedLedger(null)} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#6B8A85" }}>✕</button>
            </div>
            <div style={{ padding: 24, fontSize: 13 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 12, background: "#F5F9F8", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "#6B8A85" }}>Kỳ</div>
                  <div style={{ fontWeight: 700 }}>{selectedLedger.period}</div>
                </div>
                <div style={{ padding: 12, background: "#F5F9F8", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "#6B8A85" }}>NPP</div>
                  <div style={{ fontWeight: 700 }}>{selectedLedger.bo}</div>
                </div>
                <div style={{ padding: 12, background: "#FFF7E6", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "#8B5A00" }}>HBL chuyển về TK NPP</div>
                  <div style={{ fontWeight: 700, color: "#FF8C42" }}>{formatCurrency(selectedLedger.paid, ".", "")}đ</div>
                </div>
                <div style={{ padding: 12, background: "#E4F7F3", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "#00C9A7" }}>NPP khai phân phối</div>
                  <div style={{ fontWeight: 700, color: "#00C9A7" }}>{formatCurrency(selectedLedger.distributed, ".", "")}đ</div>
                </div>
              </div>
              {selectedLedger.paid !== selectedLedger.distributed ? (
                <div style={{ padding: 14, background: "#FEE2E2", borderRadius: 8, color: "#991B1B", fontSize: 12 }}>
                  ⚠️ <strong>Cảnh báo lệch:</strong> {formatCurrency(selectedLedger.paid - selectedLedger.distributed, ".", "")}đ chưa được phân phối.
                  Đề nghị NPP rà lại danh sách downline kỳ này — hệ thống <strong>không tự xử lý</strong> chênh lệch.
                </div>
              ) : (
                <div style={{ padding: 14, background: "#E4F7F3", borderRadius: 8, color: "#00C9A7", fontSize: 12 }}>
                  ✅ Đã đối soát khớp 100%. Không có chênh lệch.
                </div>
              )}
              <div style={{ marginTop: 16, fontSize: 11, color: "#6B8A85" }}>
                File gốc: <code style={{ fontFamily: "monospace" }}>{selectedLedger.file}</code><br />
                Upload lúc: {selectedLedger.uploaded_at}
              </div>
              <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setSelectedLedger(null)} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #d9e0de", background: "#fff", color: "#6B8A85", fontWeight: 600, cursor: "pointer" }}>Đóng</button>
                <button onClick={() => { showToast(`📥 Đã tải file gốc: ${selectedLedger.file}`); }}
                  style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#00C9A7", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  📥 Tải file gốc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast nhỏ thay alert() */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
