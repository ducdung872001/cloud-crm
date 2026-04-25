// [MH] MentorHub - Cài đặt mentor (với Zoom OAuth integration)
import React, { useEffect, useState } from "react";
import { MOCK_MENTOR } from "@/mocks/mentorhub";
import SubscriptionSection from "./SubscriptionSection";
import "../_shared/styles.scss";

type BankAccount = {
  id: string;
  bank: string;
  accountNumber: string;
  holderName: string;
  isPrimary: boolean;
};

const VN_BANKS = [
  "Vietcombank", "BIDV", "VietinBank", "Agribank", "Techcombank", "MB Bank", "ACB", "VPBank",
  "TPBank", "Sacombank", "HDBank", "OCB", "SHB", "VIB", "Eximbank", "SeABank", "MSB", "LienVietPostBank",
  "Nam A Bank", "PG Bank", "Bac A Bank", "Bao Viet Bank", "VietBank", "An Binh Bank", "Kienlongbank", "Khác",
];

interface ZoomStatus {
  connected: boolean;
  status?: "active" | "expired" | "revoked" | "error";
  zoomEmail?: string;
  zoomDisplayName?: string;
  zoomAccountType?: "basic" | "licensed" | "on_prem";
  connectedAt?: string;
}

const API = "/api/v1";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export default function MentorHubSettingsPage() {
  document.title = "MentorHub · Cài đặt";

  const [activeSection, setActiveSection] = useState("profile");
  const [zoom, setZoom] = useState<ZoomStatus | null>(null);
  const [zoomLoading, setZoomLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const z = params.get("zoom");
    if (z === "connected") {
      const email = params.get("email");
      setToast({ type: "success", msg: `✅ Đã kết nối Zoom${email ? ` với ${email}` : ""}` });
      setActiveSection("integrations");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (z === "error") {
      setToast({ type: "error", msg: `❌ Kết nối Zoom thất bại: ${params.get("reason") || "unknown"}` });
      setActiveSection("integrations");
      window.history.replaceState({}, "", window.location.pathname);
    }
    void loadZoomStatus();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  async function loadZoomStatus() {
    try {
      setZoomLoading(true);
      // TODO: replace MOCK mentorId with real JWT principal resolution
      const mentorId = 1;
      const s = await fetchJson<ZoomStatus>(`/zoom/oauth/status?mentorId=${mentorId}`);
      setZoom(s);
    } catch {
      setZoom({ connected: false });
    } finally {
      setZoomLoading(false);
    }
  }

  const [showZoomMock, setShowZoomMock] = useState(false);

  async function handleConnectZoom() {
    try {
      setZoomLoading(true);
      const mentorId = 1; // TODO: from auth context
      const currentUrl = window.location.origin + window.location.pathname;
      const { authorizeUrl } = await fetchJson<{ authorizeUrl: string }>(
        `/zoom/oauth/authorize?mentorId=${mentorId}&redirectAfter=${encodeURIComponent(currentUrl)}`
      );
      window.location.href = authorizeUrl;
    } catch {
      // BE chưa sẵn sàng — mở demo consent modal cho prototype
      setZoomLoading(false);
      setShowZoomMock(true);
    }
  }

  function completeZoomMock(account: { email: string; name: string; type: "basic" | "licensed" }) {
    setZoom({
      connected: true,
      status: "active",
      zoomEmail: account.email,
      zoomDisplayName: account.name,
      zoomAccountType: account.type,
      connectedAt: new Date().toISOString(),
    });
    setShowZoomMock(false);
    setToast({ type: "success", msg: `✅ Đã kết nối Zoom với ${account.email} (demo mode)` });
  }

  async function handleDisconnectZoom() {
    if (!window.confirm("Ngắt kết nối Zoom? Các buổi học đã lên lịch trên Zoom vẫn còn, nhưng MentorHub sẽ không tạo/cập nhật meeting nữa.")) return;
    try {
      setZoomLoading(true);
      const mentorId = 1; // TODO: from auth context
      await fetch(`${API}/zoom/oauth/disconnect?mentorId=${mentorId}`, { method: "DELETE" }).catch(() => {});
      setZoom({ connected: false });
      setToast({ type: "info", msg: "Đã ngắt kết nối Zoom" });
    } finally {
      setZoomLoading(false);
    }
  }

  const SECTIONS = [
    { key: "profile", label: "Hồ sơ" },
    { key: "subscription", label: "Gói đăng ký" },
    { key: "integrations", label: "Tích hợp", badge: zoom?.connected ? "✓" : undefined },
    { key: "payout", label: "Thanh toán" },
    { key: "ai", label: "AI settings" },
    { key: "security", label: "Bảo mật" },
  ];

  return (
    <div className="mh">
      <div className="mh__hero">
        <div className="mh__kicker">CÀI ĐẶT TÀI KHOẢN</div>
        <h1>Thông tin <em>mentor</em></h1>
      </div>

      {toast && (
        <div style={{
          padding: "14px 18px", borderRadius: 10, marginBottom: 20,
          background: toast.type === "success" ? "#D1FAE5" : toast.type === "error" ? "#FEE2E2" : "#DBEAFE",
          color: toast.type === "success" ? "#065F46" : toast.type === "error" ? "#991B1B" : "#1E40AF",
          fontSize: 14, fontWeight: 500,
        }}>{toast.msg}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        <div>
          <div className="mh__card" style={{ padding: 12, position: "sticky", top: 24 }}>
            {SECTIONS.map((s) => (
              <div key={s.key} onClick={() => setActiveSection(s.key)}
                style={{
                  padding: "10px 12px", borderRadius: 8, fontSize: 14, cursor: "pointer",
                  background: activeSection === s.key ? "var(--mh-ivory-2)" : "transparent",
                  fontWeight: activeSection === s.key ? 600 : 400,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                {s.label}
                {s.badge && <span style={{ fontSize: 11, color: "var(--mh-teal)" }}>{s.badge}</span>}
              </div>
            ))}
          </div>
        </div>

        <div>
          {activeSection === "profile" && (
            <div className="mh__card">
              <h3 style={{ marginBottom: 16 }}>Hồ sơ công khai</h3>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "start", marginBottom: 20 }}>
                <div className="mh__avatar mh__avatar--lg" style={{ background: MOCK_MENTOR.avatarBg, width: 80, height: 80, fontSize: 28 }}>{MOCK_MENTOR.shortName}</div>
                <div>
                  <label className="mh__kicker">HỌ TÊN</label>
                  <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{MOCK_MENTOR.name}</div>
                  <label className="mh__kicker" style={{ marginTop: 12, display: "block" }}>CHỨC DANH</label>
                  <div style={{ fontSize: 14, marginTop: 4 }}>{MOCK_MENTOR.title}</div>
                </div>
              </div>
              <label className="mh__kicker">BIO</label>
              <textarea defaultValue={MOCK_MENTOR.bio}
                style={{ width: "100%", minHeight: 80, padding: 12, border: "1px solid var(--mh-line)", borderRadius: 8, fontFamily: "inherit", fontSize: 14, marginTop: 6 }} />
              <button className="mh__btn" style={{ marginTop: 10, fontSize: 12, padding: "6px 12px" }}>✦ AI viết lại</button>
            </div>
          )}

          {activeSection === "integrations" && (
            <>
              <div className="mh__card" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "#2D8CFF", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20 }}>Z</div>
                    <div>
                      <h3 style={{ margin: 0 }}>Zoom</h3>
                      <div style={{ fontSize: 13, color: "var(--mh-ink-soft)", marginTop: 2 }}>
                        Kết nối tài khoản Zoom cá nhân để MentorHub tự tạo meeting, ghi hình và đồng bộ điểm danh.
                      </div>
                    </div>
                  </div>
                  {zoom?.connected ? (
                    <span className="mh__pill" style={{ background: "#D1FAE5", color: "#065F46" }}>● Đã kết nối</span>
                  ) : (
                    <span className="mh__pill mh__pill--draft">Chưa kết nối</span>
                  )}
                </div>

                {zoom?.connected ? (
                  <div style={{ padding: 16, background: "var(--mh-ivory-2)", borderRadius: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, fontSize: 13, marginBottom: 14 }}>
                      <div><div className="mh__kicker">EMAIL</div><div style={{ marginTop: 4 }}>{zoom.zoomEmail ?? "-"}</div></div>
                      <div>
                        <div className="mh__kicker">LOẠI TÀI KHOẢN</div>
                        <div style={{ marginTop: 4, textTransform: "capitalize" }}>
                          {zoom.zoomAccountType ?? "-"}
                          {zoom.zoomAccountType === "basic" && <span style={{ fontSize: 11, color: "var(--mh-amber)", marginLeft: 8 }}>(giới hạn 40 phút)</span>}
                        </div>
                      </div>
                      <div><div className="mh__kicker">TÊN HIỂN THỊ</div><div style={{ marginTop: 4 }}>{zoom.zoomDisplayName ?? "-"}</div></div>
                      <div><div className="mh__kicker">KẾT NỐI TỪ</div><div style={{ marginTop: 4 }} className="mh__mono">{zoom.connectedAt ? new Date(zoom.connectedAt).toLocaleString("vi-VN") : "-"}</div></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="mh__btn" onClick={loadZoomStatus} disabled={zoomLoading}>{zoomLoading ? "Đang tải..." : "↻ Refresh"}</button>
                      <button className="mh__btn" onClick={handleDisconnectZoom} disabled={zoomLoading} style={{ color: "var(--mh-red)", borderColor: "var(--mh-red)" }}>Ngắt kết nối</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ padding: 14, background: "var(--mh-ivory-2)", borderRadius: 10, marginBottom: 14, fontSize: 13, lineHeight: 1.6 }}>
                      <strong>Sau khi kết nối MentorHub sẽ có quyền:</strong>
                      <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                        <li>Tạo và cập nhật meeting trên tài khoản của bạn</li>
                        <li>Đọc danh sách recording của bạn</li>
                        <li>Nhận webhook khi buổi học bắt đầu/kết thúc để đồng bộ điểm danh</li>
                      </ul>
                      <div style={{ marginTop: 10, color: "var(--mh-ink-soft)" }}>Bạn có thể ngắt kết nối bất cứ lúc nào.</div>
                    </div>
                    <button className="mh__btn mh__btn--primary" onClick={handleConnectZoom} disabled={zoomLoading}
                      style={{ background: "#2D8CFF", borderColor: "#2D8CFF" }}>
                      {zoomLoading ? "Đang chuyển sang Zoom..." : "→ Connect Zoom"}
                    </button>
                  </div>
                )}
              </div>

              <ZaloIntegrationCard onToast={(t) => setToast(t)} />
            </>
          )}

          {activeSection === "subscription" && <SubscriptionSection />}

          {activeSection === "payout" && <PayoutSection />}

          {activeSection === "ai" && (
            <div className="mh__card">
              <h3>AI settings</h3>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {["Tự động sinh AI summary sau mỗi buổi", "AI Live Assistant (detect confused/pacing)", "AI gợi ý câu trả lời ticket hỗ trợ", "Cross-sell AI matching"].map((t, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                    <input type="checkbox" defaultChecked /> {t}
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="mh__card"><h3>Bảo mật</h3><label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, marginTop: 14 }}><input type="checkbox" /> Bật 2FA</label></div>
          )}
        </div>
      </div>

      {showZoomMock && <ZoomMockConsentModal onClose={() => setShowZoomMock(false)} onConnect={completeZoomMock} />}
    </div>
  );
}

// ── Zoom OAuth — mock consent modal (fallback khi BE chưa sẵn sàng) ──────────
function ZoomMockConsentModal({ onClose, onConnect }: { onClose: () => void; onConnect: (acc: { email: string; name: string; type: "basic" | "licensed" }) => void }) {
  const MOCK_ACCOUNTS: Array<{ email: string; name: string; type: "basic" | "licensed"; avatar: string }> = [
    { email: "khoa@mentorhub.vn", name: "Nguyễn Trọng Khoa", type: "licensed", avatar: "#0F766E" },
    { email: "khoa.nguyen@gmail.com", name: "Khoa Nguyen", type: "basic", avatar: "#B45309" },
  ];

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div style={{ background: "#2D8CFF", color: "#fff", margin: "-28px -28px 0", padding: "20px 28px", borderRadius: "16px 16px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", color: "#2D8CFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>Z</div>
            <div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: ".12em", opacity: 0.85 }}>DEMO · ZOOM OAUTH</div>
              <h3 style={{ margin: "2px 0 0", color: "#fff", fontFamily: "'Geist', sans-serif", fontSize: 18 }}>Cấp quyền cho MentorHub</h3>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 0" }}>
          <div style={{ padding: 14, background: "var(--mh-amber-soft)", borderRadius: 10, fontSize: 12, border: "1px solid rgba(180, 88, 9, 0.2)", marginBottom: 16 }}>
            ⚠️ <strong>Demo mode:</strong> BE Zoom OAuth chưa kết nối. Chọn 1 tài khoản giả lập để mô phỏng trạng thái đã kết nối.
          </div>

          <div className="mh__kicker" style={{ marginBottom: 10 }}>CHỌN TÀI KHOẢN ZOOM</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => onConnect(a)}
                style={{
                  display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 12, padding: 12,
                  border: "1px solid var(--mh-line)", borderRadius: 10, background: "#fff",
                  cursor: "pointer", textAlign: "left", alignItems: "center", fontFamily: "inherit",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--mh-teal)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--mh-line)")}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: a.avatar, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 14 }}>
                  {a.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                  <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>{a.email}</div>
                </div>
                <span className={"mh__pill " + (a.type === "licensed" ? "mh__pill--amber" : "mh__pill--draft")}>{a.type}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 12, background: "var(--mh-ivory-2)", borderRadius: 10, fontSize: 12, color: "var(--mh-ink-soft)" }}>
            Cấp những quyền sau:
            <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              <li>Tạo và cập nhật meeting</li>
              <li>Đọc danh sách recording</li>
              <li>Nhận webhook start/end meeting</li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
            <button type="button" className="mh__btn" onClick={onClose}>Huỷ</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Zalo Integration Card — 3 options ────────────────────────────────────────
type ZaloMode = "shared" | "own_oa" | "manual";

function ZaloIntegrationCard({ onToast }: { onToast: (t: { type: "success" | "error" | "info"; msg: string }) => void }) {
  const [mode, setMode] = useState<ZaloMode>("shared");
  const [active, setActive] = useState<ZaloMode | null>(null); // cách đã "Bật" thật sự
  const [showOAForm, setShowOAForm] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  type Plan = {
    key: ZaloMode;
    icon: string;
    title: string;
    tagline: string;
    priceBig: string;
    priceSub: string;
    ribbon?: { text: string; color: string };
    pros: string[];
    cons: string[];
    whoFor: string;
    ctaLabel: string;
    bg: string;
    accentColor: string;
  };

  const plans: Plan[] = [
    {
      key: "shared",
      icon: "⚡",
      title: "OA chung MentorHub",
      tagline: "Cắm là chạy. Không setup.",
      priceBig: "Miễn phí",
      priceSub: "500 tin/tháng · sau đó 300đ/tin",
      ribbon: { text: "KHUYÊN DÙNG", color: "var(--mh-green)" },
      whoFor: "Mentor mới, chưa có/không muốn nuôi OA riêng",
      pros: [
        "Bật trong 1 phút — không cần đăng ký Zalo OA",
        "Không cần Developer account, App ID, Secret Key",
        "Gửi từ tên mentor của anh/chị",
        "Học viên chỉ cần kết bạn OA hệ thống 1 lần",
      ],
      cons: [
        "Tin có footer “qua MentorHub”",
        "Giới hạn mẫu tin theo Zalo OA chung",
      ],
      ctaLabel: "→ Bật OA MentorHub",
      bg: "linear-gradient(180deg, #fff 0%, #F0F9FF 100%)",
      accentColor: "#0F766E",
    },
    {
      key: "own_oa",
      icon: "★",
      title: "OA riêng của mentor",
      tagline: "Brand cá nhân chuyên nghiệp.",
      priceBig: "từ 99k/th",
      priceSub: "miễn phí 30 ngày đầu · phí Zalo",
      ribbon: { text: "PRO · BRAND RIÊNG", color: "var(--mh-amber)" },
      whoFor: "Mentor đã có thương hiệu cá nhân, sẵn đầu tư branding",
      pros: [
        "Hiển thị logo + tên OA riêng của mentor",
        "Không có footer “qua MentorHub”",
        "Sử dụng mẫu tin Zalo OA không giới hạn",
        "Có thể dùng Zalo Ads song song",
      ],
      cons: [
        "Cần đăng ký OA tại oa.zalo.me (1-2 tuần duyệt)",
        "Cần lấy App ID + Secret Key tại developers.zalo.me",
        "Phí Zalo: từ 99k/th (Gold OA), hoặc 0đ nếu ở mức Silver",
      ],
      ctaLabel: "→ Kết nối OA riêng",
      bg: "linear-gradient(180deg, #fff 0%, #FFF9ED 100%)",
      accentColor: "#B45309",
    },
    {
      key: "manual",
      icon: "✉",
      title: "Không dùng Zalo",
      tagline: "Chỉ email & thông báo app.",
      priceBig: "Miễn phí",
      priceSub: "không giới hạn · không cần setup",
      ribbon: { text: "TỐI GIẢN", color: "var(--mh-ink-soft)" },
      whoFor: "Học viên chủ yếu dùng email/app, không cần Zalo",
      pros: [
        "Email 24h + 30 phút trước buổi học",
        "Push notification qua app (PWA)",
        "Không cần cấu hình gì",
      ],
      cons: [
        "Không có kênh Zalo (tỷ lệ đọc thấp hơn)",
        "Một số HV VN ít mở email",
      ],
      ctaLabel: "→ Chỉ dùng Email + App",
      bg: "linear-gradient(180deg, #fff 0%, #F4EFE6 100%)",
      accentColor: "#6B7A72",
    },
  ];

  const handleActivate = (plan: Plan) => {
    if (plan.key === "own_oa") {
      setShowOAForm(true);
    } else {
      setActive(plan.key);
      onToast({
        type: "success",
        msg: plan.key === "shared"
          ? "✅ Đã bật OA MentorHub. Học viên sẽ nhận hướng dẫn kết bạn OA trong email xác nhận đăng ký."
          : "✅ Chỉ dùng Email + Push notification. Zalo đã tắt.",
      });
    }
  };

  return (
    <div className="mh__card">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#0068FF", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20 }}>Z</div>
        <div>
          <h3 style={{ margin: 0 }}>Nhắc lịch qua Zalo</h3>
          <div style={{ fontSize: 13, color: "var(--mh-ink-soft)", marginTop: 2 }}>Chọn cách gửi tin nhắn cho học viên. Có thể đổi bất cứ lúc nào.</div>
        </div>
      </div>

      {/* Quick recommendation helper */}
      <div style={{ background: "var(--mh-amber-soft)", border: "1px solid rgba(180, 88, 9, 0.18)", borderRadius: 10, padding: 14, margin: "14px 0 20px", fontSize: 13, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <div>
          <strong>Không biết chọn cách nào?</strong> Nếu anh/chị <em>chưa có Zalo OA riêng</em> hoặc không muốn bận tâm đến cấu hình kỹ thuật → dùng <strong>"OA chung MentorHub"</strong> — gửi Zalo cho học viên ngay mà không cần đăng ký gì. Có thể nâng cấp lên OA riêng sau khi thương hiệu đã có dấu ấn.
        </div>
      </div>

      {/* Pricing-style cards */}
      <div className="mh-zalo-plans">
        {plans.map((p) => {
          const isActive = active === p.key;
          const isSelected = mode === p.key;
          return (
            <div
              key={p.key}
              className={"mh-zalo-plan" + (isSelected ? " is-selected" : "") + (isActive ? " is-active" : "")}
              onClick={() => setMode(p.key)}
              style={{
                background: p.bg,
                borderColor: isActive ? p.accentColor : isSelected ? "var(--mh-teal)" : "var(--mh-line)",
              }}
            >
              {p.ribbon && (
                <div className="mh-zalo-plan__ribbon" style={{ background: p.ribbon.color }}>{p.ribbon.text}</div>
              )}
              {isActive && <div className="mh-zalo-plan__active-badge">✓ Đang bật</div>}

              <div className="mh-zalo-plan__head">
                <div className="mh-zalo-plan__icon" style={{ background: p.accentColor }}>{p.icon}</div>
                <div>
                  <h4 style={{ fontSize: 18, margin: "0 0 4px" }}>{p.title}</h4>
                  <div style={{ fontSize: 12, color: "var(--mh-ink-soft)", fontStyle: "italic" }}>{p.tagline}</div>
                </div>
              </div>

              <div className="mh-zalo-plan__price">
                <div className="mh-zalo-plan__price-big" style={{ color: p.accentColor }}>{p.priceBig}</div>
                <div className="mh-zalo-plan__price-sub">{p.priceSub}</div>
              </div>

              <div className="mh-zalo-plan__whofor">
                <div className="mh__kicker">PHÙ HỢP CHO</div>
                <div>{p.whoFor}</div>
              </div>

              <ul className="mh-zalo-plan__pros">
                {p.pros.map((b, i) => <li key={i}><span className="mh-zalo-plan__check" style={{ color: p.accentColor }}>✓</span>{b}</li>)}
              </ul>

              <ul className="mh-zalo-plan__cons">
                {p.cons.map((b, i) => <li key={i}><span>•</span>{b}</li>)}
              </ul>

              <button
                className={"mh__btn" + (isSelected ? " mh__btn--primary" : "")}
                style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
                onClick={(e) => { e.stopPropagation(); handleActivate(p); }}
                disabled={isActive}
              >
                {isActive ? "✓ Đang sử dụng" : p.ctaLabel}
              </button>
            </div>
          );
        })}
      </div>

      {/* Compare toggle */}
      <button type="button" className="mh__btn" style={{ marginTop: 16 }} onClick={() => setShowCompare(!showCompare)}>
        {showCompare ? "▲ Ẩn bảng so sánh" : "▼ Xem bảng so sánh chi tiết"}
      </button>

      {showCompare && (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table className="mh__table">
            <thead>
              <tr>
                <th>Tiêu chí</th>
                <th>OA MentorHub</th>
                <th>OA riêng</th>
                <th>Không Zalo</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Chi phí đăng ký", "0đ", "0đ (free tier) / từ 99k/th", "0đ"],
                ["Phí tin nhắn", "500 free, sau 300đ/tin", "Theo gói Zalo OA", "—"],
                ["Thời gian setup", "1 phút", "1-2 tuần (chờ Zalo duyệt)", "0 giây"],
                ["Cần App ID / Secret", "❌ Không", "✅ Có (developers.zalo.me)", "❌ Không"],
                ["Tên hiển thị khi gửi", "Tên mentor + footer MH", "Tên OA riêng của mentor", "—"],
                ["Logo / branding", "MentorHub", "Logo OA mentor", "—"],
                ["Tỷ lệ đọc Zalo", "~85%", "~85%", "❌"],
                ["Email backup", "✅", "✅", "✅"],
                ["Push notification app", "✅", "✅", "✅"],
                ["Phù hợp mentor mới", "⭐ Tuyệt vời", "⚠️ Tạm ổn", "⚠️ Tạm ổn"],
                ["Phù hợp mentor có brand", "✅", "⭐ Tuyệt vời", "❌"],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{row[0]}</td>
                  <td className="mh__mono">{row[1]}</td>
                  <td className="mh__mono">{row[2]}</td>
                  <td className="mh__mono">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showOAForm && (
        <ZaloOAForm onClose={() => setShowOAForm(false)} onSave={(appId) => {
          setShowOAForm(false);
          setActive("own_oa");
          onToast({ type: "success", msg: `✅ Đã kết nối OA riêng (App ID: ${appId.slice(0, 6)}…). Gửi tin nhắn test để kiểm tra.` });
        }} />
      )}
    </div>
  );
}

function ZaloOAForm({ onClose, onSave }: { onClose: () => void; onSave: (appId: string) => void }) {
  const [oaName, setOaName] = useState("");
  const [appId, setAppId] = useState("");
  const [secret, setSecret] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!oaName.trim()) errs.oaName = "Nhập tên OA";
    if (!appId.trim()) errs.appId = "Nhập App ID";
    else if (!/^\d{10,}$/.test(appId.trim())) errs.appId = "App ID phải là chuỗi số ≥ 10 chữ số";
    if (!secret.trim()) errs.secret = "Nhập Secret Key";
    else if (secret.trim().length < 16) errs.secret = "Secret Key quá ngắn";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave(appId);
  };

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="mh__kicker">ZALO OA RIÊNG</div>
            <h3 style={{ marginTop: 4 }}>Kết nối Zalo OA</h3>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="mh__field">
            <label className="mh__label mh__label--req">Tên OA</label>
            <input className={"mh__input" + (errors.oaName ? " mh__input--error" : "")} value={oaName} onChange={(e) => { setOaName(e.target.value); if (errors.oaName) setErrors({ ...errors, oaName: "" }); }} placeholder="VD: Nguyễn Trọng Khoa · Mentor" />
            {errors.oaName && <div className="mh__error">⚠ {errors.oaName}</div>}
          </div>
          <div className="mh__field">
            <label className="mh__label mh__label--req">App ID</label>
            <input className={"mh__input mh__mono" + (errors.appId ? " mh__input--error" : "")} value={appId} onChange={(e) => { setAppId(e.target.value); if (errors.appId) setErrors({ ...errors, appId: "" }); }} placeholder="VD: 1234567890123" inputMode="numeric" />
            {errors.appId && <div className="mh__error">⚠ {errors.appId}</div>}
          </div>
          <div className="mh__field">
            <label className="mh__label mh__label--req">Secret Key</label>
            <input type="password" className={"mh__input mh__mono" + (errors.secret ? " mh__input--error" : "")} value={secret} onChange={(e) => { setSecret(e.target.value); if (errors.secret) setErrors({ ...errors, secret: "" }); }} placeholder="••••••••••••••••" />
            {errors.secret && <div className="mh__error">⚠ {errors.secret}</div>}
          </div>
          <div style={{ padding: 12, background: "var(--mh-amber-soft)", borderRadius: 10, fontSize: 12, color: "var(--mh-ink)", marginBottom: 16, border: "1px solid rgba(180, 88, 9, 0.2)" }}>
            🔒 Secret Key được mã hoá AES-256 trước khi lưu. Không hiển thị lại sau khi lưu.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="mh__btn" onClick={onClose}>Huỷ</button>
            <button type="submit" className="mh__btn mh__btn--primary">Kết nối & Test</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Payout section — tài khoản nhận tiền ─────────────────────────────────────
function PayoutSection() {
  const [accounts, setAccounts] = useState<BankAccount[]>([
    { id: "BA-001", bank: "Vietcombank", accountNumber: "0123456783847", holderName: "Nguyễn Trọng Khoa", isPrimary: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (text: string) => { setToast(text); setTimeout(() => setToast(null), 3000); };

  const save = (data: Omit<BankAccount, "id" | "isPrimary">) => {
    if (editing) {
      setAccounts((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...data } : a)));
      notify("✓ Đã cập nhật tài khoản");
    } else {
      const newAcc: BankAccount = { id: "BA-" + Math.random().toString(36).slice(2, 6).toUpperCase(), ...data, isPrimary: accounts.length === 0 };
      setAccounts((prev) => [...prev, newAcc]);
      notify("✓ Đã thêm tài khoản mới");
    }
    setShowForm(false);
    setEditing(null);
  };

  const setPrimary = (id: string) => {
    setAccounts((prev) => prev.map((a) => ({ ...a, isPrimary: a.id === id })));
    notify("✓ Đã đặt tài khoản chính để nhận payout");
  };

  const remove = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setConfirmDel(null);
    notify("✓ Đã xoá tài khoản");
  };

  const mask = (num: string) => num.length > 4 ? "****" + num.slice(-4) : num;

  return (
    <div className="mh__card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3>Tài khoản nhận tiền</h3>
          <p style={{ fontSize: 12, color: "var(--mh-ink-soft)", marginTop: 6 }} className="mh__mono">Phí nền tảng 10% · TNCN 5% · Auto-transfer cuối tháng</p>
        </div>
        <button className="mh__btn mh__btn--primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Thêm tài khoản</button>
      </div>

      {accounts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--mh-ink-soft)", background: "var(--mh-ivory-2)", borderRadius: 10 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🏦</div>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Chưa có tài khoản nhận tiền</div>
          <div style={{ fontSize: 12 }}>Thêm tài khoản để nhận payout khi học viên thanh toán.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {accounts.map((acc) => (
            <div key={acc.id} style={{ border: "1px solid var(--mh-line)", borderRadius: 10, padding: 16, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--mh-teal-d)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏦</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600 }}>{acc.bank}</span>
                  <span className="mh__mono" style={{ color: "var(--mh-ink-soft)", fontSize: 13 }}>{mask(acc.accountNumber)}</span>
                  {acc.isPrimary && <span className="mh__pill mh__pill--green">● Chính</span>}
                </div>
                <div className="mh__mono" style={{ fontSize: 12, color: "var(--mh-ink-soft)" }}>{acc.holderName}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {!acc.isPrimary && <button className="mh__btn" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setPrimary(acc.id)}>Đặt chính</button>}
                <button className="mh__btn" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => { setEditing(acc); setShowForm(true); }}>Sửa</button>
                {accounts.length > 1 && !acc.isPrimary && (
                  confirmDel === acc.id ? (
                    <>
                      <button className="mh__btn" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setConfirmDel(null)}>Huỷ</button>
                      <button className="mh__btn mh__btn--danger" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => remove(acc.id)}>Xác nhận xoá</button>
                    </>
                  ) : (
                    <button className="mh__btn mh__btn--danger" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setConfirmDel(acc.id)}>Xoá</button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, padding: 14, background: "var(--mh-amber-soft)", borderRadius: 10, border: "1px solid rgba(180, 88, 9, 0.2)", fontSize: 13 }}>
        💡 <strong>Lưu ý:</strong> Tài khoản được đánh dấu <em>Chính</em> sẽ nhận toàn bộ payout tháng. Có thể thêm tối đa 3 tài khoản dự phòng. Tên chủ tài khoản phải trùng với tên trên CCCD mentor.
      </div>

      {showForm && <BankAccountForm initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={save} />}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, padding: "14px 20px", background: "#166534", color: "#fff", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,.2)", zIndex: 300, fontSize: 14 }}>{toast}</div>
      )}
    </div>
  );
}

// ── Bank account form modal ──────────────────────────────────────────────────
function BankAccountForm({ initial, onClose, onSave }: { initial: BankAccount | null; onClose: () => void; onSave: (data: Omit<BankAccount, "id" | "isPrimary">) => void }) {
  const [bank, setBank] = useState(initial?.bank || VN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState(initial?.accountNumber || "");
  const [holderName, setHolderName] = useState(initial?.holderName || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!bank) errs.bank = "Chọn ngân hàng";
    const numOnly = accountNumber.replace(/\s/g, "");
    if (!numOnly) errs.accountNumber = "Nhập số tài khoản";
    else if (!/^\d{6,20}$/.test(numOnly)) errs.accountNumber = "Số tài khoản chỉ gồm chữ số (6-20 ký tự)";
    if (!holderName.trim()) errs.holderName = "Nhập tên chủ tài khoản";
    else if (holderName.trim().length < 3) errs.holderName = "Tên quá ngắn";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({ bank, accountNumber: numOnly, holderName: holderName.trim().toUpperCase() });
  };

  return (
    <div className="mh__modal-backdrop" onClick={onClose}>
      <div className="mh__modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="mh__kicker">TÀI KHOẢN NGÂN HÀNG</div>
            <h3 style={{ marginTop: 4 }}>{initial ? "Sửa tài khoản" : "Thêm tài khoản nhận tiền"}</h3>
          </div>
          <button className="mh__btn mh__btn--ghost" onClick={onClose} style={{ padding: 4 }}>✕</button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="mh__field">
            <label className="mh__label mh__label--req">Ngân hàng</label>
            <select className="mh__select" value={bank} onChange={(e) => setBank(e.target.value)}>
              {VN_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="mh__field">
            <label className="mh__label mh__label--req">Số tài khoản</label>
            <input
              className={"mh__input mh__mono" + (errors.accountNumber ? " mh__input--error" : "")}
              value={accountNumber}
              onChange={(e) => { setAccountNumber(e.target.value); if (errors.accountNumber) setErrors({ ...errors, accountNumber: "" }); }}
              placeholder="VD: 0123456789"
              inputMode="numeric"
              maxLength={24}
            />
            {errors.accountNumber && <div className="mh__error">⚠ {errors.accountNumber}</div>}
          </div>

          <div className="mh__field">
            <label className="mh__label mh__label--req">Tên chủ tài khoản</label>
            <input
              className={"mh__input" + (errors.holderName ? " mh__input--error" : "")}
              value={holderName}
              onChange={(e) => { setHolderName(e.target.value); if (errors.holderName) setErrors({ ...errors, holderName: "" }); }}
              placeholder="VD: NGUYEN TRONG KHOA"
              style={{ textTransform: "uppercase" }}
            />
            <div className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)", marginTop: 4 }}>Không dấu, in hoa, trùng với tên trên CCCD</div>
            {errors.holderName && <div className="mh__error">⚠ {errors.holderName}</div>}
          </div>

          <div style={{ padding: 12, background: "var(--mh-ivory-2)", borderRadius: 10, fontSize: 12, color: "var(--mh-ink-soft)", marginBottom: 16 }}>
            🔒 Thông tin ngân hàng được mã hoá. Chỉ hiển thị 4 chữ số cuối sau khi lưu.
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="mh__btn" onClick={onClose}>Huỷ</button>
            <button type="submit" className="mh__btn mh__btn--primary">{initial ? "Lưu thay đổi" : "Thêm tài khoản"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
