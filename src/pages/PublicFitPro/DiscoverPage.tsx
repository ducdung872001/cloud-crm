// [FitPro Phase 4.2] Public page — Discover & Book
// Truy cập không cần login. URL: /fp_discover (hoặc /discover, tuỳ mapping)
// URD: docs/urd/part-15-fitpro-phygital-roadmap.md#ur-fitpro-public
import React, { useState, useMemo } from "react";
import { MOCK_FITPRO_STATIONS, getStationTypeLabel, normalizeStationType } from "@/mocks/community-hub/fitpro-stations";

const THEME = {
  primary: "#00C9A7",
  primaryDark: "#0B2E2A",
  primarySoft: "#E4F7F3",
  accent: "#FF8A3C",
  text: "#1A2B28",
  textMuted: "#6B8A85",
  border: "#D9E0DE",
  bg: "#F5F9F8",
};

export default function DiscoverPage() {
  document.title = "Tìm trạm FitPro gần nhất | Đặt buổi tập thử miễn phí";
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "home" | "center" | "inside">("all");
  const [bookingStation, setBookingStation] = useState<typeof MOCK_FITPRO_STATIONS[number] | null>(null);

  const filteredStations = useMemo(() => {
    return MOCK_FITPRO_STATIONS
      .filter((s) => s.status === "active")
      .map((s) => ({ ...s, type: normalizeStationType(s.type) }))
      .filter((s) => selectedType === "all" || s.type === selectedType)
      .filter((s) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q)
        );
      });
  }, [query, selectedType]);

  return (
    <div style={{ minHeight: "100vh", background: THEME.bg, color: THEME.text }}>
      {/* Public header */}
      <div style={{ background: `linear-gradient(135deg, ${THEME.primaryDark} 0%, ${THEME.primary} 100%)`, color: "#fff", padding: "20px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🌱</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>FitPro</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Reborn JSC · Kiến tạo hạ tầng sức khỏe cho 100 triệu người Việt</div>
            </div>
          </div>
          <a href="/crm/login" style={{ color: "#fff", fontSize: 13, textDecoration: "underline" }}>Đăng nhập quản trị</a>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "#fff", padding: "50px 24px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "clamp(24px, 5vw, 40px)", color: THEME.primaryDark }}>
          Tìm Trạm FitPro gần bạn
        </h1>
        <p style={{ fontSize: 16, color: THEME.textMuted, marginTop: 10 }}>
          Khung giờ 6-9h sáng · Không cần đăng ký · Đặt buổi thử miễn phí chỉ qua SĐT
        </p>
        {/* Search bar */}
        <div style={{ maxWidth: 680, margin: "24px auto 0", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <input
            type="text"
            placeholder="🔍 Nhập địa chỉ, quận/huyện hoặc thành phố..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, minWidth: 280,
              padding: "14px 18px", borderRadius: 10,
              border: `1px solid ${THEME.border}`, fontSize: 15,
              boxShadow: "0 2px 8px rgba(11,46,42,.06)",
            }}
          />
          <button
            onClick={() => alert("📍 Yêu cầu quyền truy cập vị trí trình duyệt. Sẽ tìm 10 trạm gần nhất quanh bạn.")}
            style={{
              padding: "14px 20px", background: THEME.primary, color: "#fff",
              border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700,
            }}
          >
            📍 Dùng vị trí hiện tại
          </button>
        </div>

        {/* Type filter */}
        <div style={{ marginTop: 18, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "Tất cả", icon: "🔎" },
            { key: "home", label: "Home FitPro", icon: "🏠" },
            { key: "center", label: "FitPro CENTER", icon: "🏢" },
            { key: "inside", label: "FitPro INSIDE (Gym partner)", icon: "🔌" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key as any)}
              style={{
                padding: "8px 14px", borderRadius: 999,
                border: selectedType === t.key ? `2px solid ${THEME.primary}` : `1px solid ${THEME.border}`,
                background: selectedType === t.key ? THEME.primarySoft : "#fff",
                color: selectedType === t.key ? THEME.primaryDark : THEME.textMuted,
                fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Station list */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: THEME.primaryDark }}>
            {filteredStations.length} trạm đang hoạt động
          </h2>
          <div style={{ fontSize: 12, color: THEME.textMuted }}>
            Đã hiển thị theo khoảng cách (mock) · Thực tế dùng geolocation
          </div>
        </div>

        {filteredStations.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: THEME.textMuted, background: "#fff", borderRadius: 10 }}>
            Không tìm thấy trạm phù hợp. Thử đổi từ khóa hoặc chọn "Tất cả".
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {filteredStations.map((s) => {
              const typeColor = s.type === "home" ? "#4DE4C4" : s.type === "center" ? "#FF8C42" : "#2563EB";
              const typeIcon = s.type === "home" ? "🏠" : s.type === "center" ? "🏢" : "🔌";
              return (
                <div
                  key={s.id}
                  style={{
                    background: "#fff", borderRadius: 12, padding: 18,
                    border: `1px solid ${THEME.border}`,
                    boxShadow: "0 2px 12px rgba(11,46,42,.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{typeIcon}</span>
                    <div style={{
                      padding: "2px 10px", borderRadius: 999,
                      background: `${typeColor}22`, color: typeColor,
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    }}>
                      {getStationTypeLabel(s.type)}
                    </div>
                  </div>
                  <h3 style={{ margin: 0, color: THEME.primaryDark, fontSize: 16 }}>{s.name}</h3>
                  <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>📍 {s.address}, {s.city}</div>
                  <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>⏰ {s.operating_hours}</div>
                  {s.type !== "inside" && (
                    <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>
                      🧘 {s.total_mats} thảm · Hôm nay: {s.today_sessions} lượt tập
                    </div>
                  )}
                  {s.insidePlugin && (
                    <div style={{ fontSize: 12, color: "#1E40AF", marginTop: 4 }}>
                      🏋️‍♂️ Cấy trong: <strong>{s.insidePlugin.hostBrandName}</strong>
                    </div>
                  )}
                  <button
                    onClick={() => setBookingStation(s)}
                    style={{
                      marginTop: 14, width: "100%",
                      padding: "10px 16px", background: THEME.primary, color: "#fff",
                      border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700,
                    }}
                  >
                    🎟 Đặt buổi tập thử miễn phí
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking modal */}
      {bookingStation && (
        <BookingModal station={bookingStation} onClose={() => setBookingStation(null)} />
      )}

      {/* Footer */}
      <div style={{ background: THEME.primaryDark, color: "#fff", padding: "30px 24px", marginTop: 40 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>FitPro</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              Sản phẩm của <strong>Reborn JSC</strong><br />
              Công ty Cổ phần Công nghệ và Truyền thông Reborn<br />
              <a href="https://reborn.vn" style={{ color: "#4DE4C4" }}>reborn.vn</a>
            </div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, textAlign: "right", minWidth: 200 }}>
            © 2026 Reborn JSC · FitPro v0.7<br />
            Phygital Health Infrastructure
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingModal({ station, onClose }: { station: typeof MOCK_FITPRO_STATIONS[number]; onClose: () => void }) {
  const [step, setStep] = useState<"phone" | "otp" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,46,42,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: 480, maxWidth: "100%", overflow: "hidden" }}>
        <div style={{ background: "#0B2E2A", color: "#fff", padding: "18px 22px" }}>
          <div style={{ fontSize: 11, opacity: 0.8, textTransform: "uppercase" }}>Đặt buổi thử miễn phí</div>
          <div style={{ fontSize: 17, fontWeight: 800, marginTop: 3 }}>{station.name}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{station.address}</div>
        </div>
        <div style={{ padding: 22 }}>
          {step === "phone" && (
            <>
              <div style={{ fontSize: 13, color: "#6B8A85", marginBottom: 6 }}>
                Chỉ cần số điện thoại — không cần đăng ký, không thu tiền.
              </div>
              <input
                type="tel"
                placeholder="Số điện thoại của bạn (VD: 0912345678)"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                autoFocus
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid #D9E0DE", fontSize: 15, boxSizing: "border-box" }}
              />
              <button
                onClick={() => phone.length >= 9 && setStep("otp")}
                disabled={phone.length < 9}
                style={{
                  marginTop: 12, width: "100%", padding: "12px", background: "#00C9A7",
                  color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700,
                  cursor: phone.length >= 9 ? "pointer" : "not-allowed", opacity: phone.length >= 9 ? 1 : 0.5,
                }}
              >
                Gửi mã OTP
              </button>
              <div style={{ marginTop: 10, fontSize: 11, color: "#6B8A85", textAlign: "center" }}>
                Bằng việc nhập SĐT, bạn đồng ý để BTC FitPro liên hệ xác nhận lịch tập.
              </div>
            </>
          )}
          {step === "otp" && (
            <>
              <div style={{ fontSize: 13, color: "#6B8A85", marginBottom: 6 }}>
                Mã OTP đã được gửi tới <strong>{phone}</strong>. Nhập 6 số để xác nhận.
              </div>
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ""))}
                autoFocus
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #D9E0DE",
                  fontSize: 24, letterSpacing: 10, textAlign: "center", boxSizing: "border-box",
                }}
              />
              <button
                onClick={() => otp.length === 6 && setStep("done")}
                disabled={otp.length !== 6}
                style={{
                  marginTop: 12, width: "100%", padding: "12px", background: "#00C9A7",
                  color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700,
                  cursor: otp.length === 6 ? "pointer" : "not-allowed", opacity: otp.length === 6 ? 1 : 0.5,
                }}
              >
                Xác nhận đặt buổi thử
              </button>
            </>
          )}
          {step === "done" && (
            <>
              <div style={{ textAlign: "center", padding: "18px 0" }}>
                <div style={{ fontSize: 48 }}>🎉</div>
                <h3 style={{ color: "#00C9A7", margin: "8px 0" }}>Đặt buổi thử thành công!</h3>
                <div style={{ fontSize: 13, color: "#6B8A85" }}>
                  Chúng tôi sẽ gọi lại SĐT <strong>{phone}</strong> trong 30 phút để xác nhận khung giờ đến trạm.<br/>
                  Buổi thử đầu tiên hoàn toàn <strong>miễn phí</strong>.
                </div>
                <div style={{ marginTop: 14, padding: 12, background: "#E4F7F3", borderRadius: 8, fontSize: 12, color: "#0B2E2A", textAlign: "left" }}>
                  📌 <strong>{station.name}</strong><br/>
                  📍 {station.address}<br/>
                  ⏰ {station.operating_hours}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ width: "100%", padding: "12px", background: "#0B2E2A", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Đóng
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
