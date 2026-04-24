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
      {/* Responsive CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .fp-header { padding: 20px 0; }
            .fp-header__inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
            .fp-header__brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
            .fp-header__name { font-weight: 800; font-size: 20px; line-height: 1.2; }
            .fp-header__tagline { font-size: 11px; opacity: 0.85; line-height: 1.3; }
            .fp-header__login { color: #fff; font-size: 13px; text-decoration: underline; white-space: nowrap; flex-shrink: 0; }
            .fp-header__login-short { display: none; }

            @media (max-width: 768px) {
              .fp-header { padding: 14px 0; }
              .fp-header__inner { padding: 0 16px; }
              .fp-header__name { font-size: 18px; }
              .fp-header__tagline { font-size: 10px; }
            }
            @media (max-width: 520px) {
              .fp-header__tagline { display: none; }
              .fp-header__login-long { display: none; }
              .fp-header__login-short { display: inline; }
            }

            .fp-hero { background: #fff; padding: 50px 24px; text-align: center; }
            .fp-hero__title { margin: 0; font-size: clamp(22px, 5vw, 40px); color: ${THEME.primaryDark}; line-height: 1.2; }
            .fp-hero__sub { font-size: clamp(13px, 2.5vw, 16px); color: ${THEME.textMuted}; margin-top: 10px; line-height: 1.5; }
            @media (max-width: 600px) { .fp-hero { padding: 28px 14px; } }

            .fp-search { max-width: 680px; margin: 24px auto 0; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
            .fp-search__input { flex: 1; min-width: 240px; padding: 14px 18px; border-radius: 10px; border: 1px solid ${THEME.border}; font-size: 15px; box-shadow: 0 2px 8px rgba(11,46,42,.06); box-sizing: border-box; }
            .fp-search__btn { padding: 14px 20px; background: ${THEME.primary}; color: #fff; border: none; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 700; white-space: nowrap; }
            @media (max-width: 480px) {
              .fp-search { gap: 8px; margin-top: 16px; }
              .fp-search__input { min-width: 100%; padding: 12px 14px; font-size: 14px; }
              .fp-search__btn { width: 100%; padding: 12px 14px; }
            }

            .fp-filters { margin-top: 18px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
            .fp-filter-chip { padding: 8px 14px; border-radius: 999px; background: #fff; color: ${THEME.textMuted}; font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid ${THEME.border}; transition: all .15s; }
            .fp-filter-chip.active { border: 2px solid ${THEME.primary}; background: ${THEME.primarySoft}; color: ${THEME.primaryDark}; }
            @media (max-width: 480px) {
              .fp-filters { margin-top: 14px; gap: 6px; }
              .fp-filter-chip { padding: 6px 10px; font-size: 11px; }
            }

            .fp-list-wrap { max-width: 1200px; margin: 0 auto; padding: 30px 24px; }
            .fp-list-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
            .fp-list-head h2 { margin: 0; font-size: clamp(18px, 3vw, 24px); color: ${THEME.primaryDark}; }
            .fp-list-head__hint { font-size: 12px; color: ${THEME.textMuted}; }
            @media (max-width: 600px) { .fp-list-wrap { padding: 20px 14px; } .fp-list-head__hint { font-size: 11px; } }

            .fp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
            @media (max-width: 420px) { .fp-grid { gap: 12px; } }

            .fp-card { background: #fff; border-radius: 12px; padding: 18px; border: 1px solid ${THEME.border}; box-shadow: 0 2px 12px rgba(11,46,42,.05); }
            @media (max-width: 420px) { .fp-card { padding: 14px; } }
            .fp-card h3 { margin: 0; color: ${THEME.primaryDark}; font-size: 16px; line-height: 1.3; }

            .fp-footer { background: ${THEME.primaryDark}; color: #fff; padding: 30px 24px; margin-top: 40px; }
            .fp-footer__inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
            .fp-footer__meta { font-size: 12px; opacity: 0.85; text-align: right; min-width: 200px; }
            @media (max-width: 600px) {
              .fp-footer { padding: 20px 14px; }
              .fp-footer__meta { text-align: left; min-width: 100%; }
            }

            /* Booking modal mobile */
            .fp-modal-overlay { position: fixed; inset: 0; background: rgba(11,46,42,.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
            .fp-modal { background: #fff; border-radius: 14px; width: 480px; max-width: 100%; max-height: 90vh; overflow: auto; display: flex; flex-direction: column; }
            @media (max-width: 480px) {
              .fp-modal-overlay { padding: 10px; align-items: flex-end; }
              .fp-modal { border-radius: 14px 14px 0 0; }
            }
          `,
        }}
      />

      {/* Public header */}
      <div className="fp-header" style={{ background: `linear-gradient(135deg, ${THEME.primaryDark} 0%, ${THEME.primary} 100%)`, color: "#fff" }}>
        <div className="fp-header__inner">
          <div className="fp-header__brand">
            <span style={{ fontSize: 28, flexShrink: 0 }}>🌱</span>
            <div style={{ minWidth: 0 }}>
              <div className="fp-header__name">FitPro</div>
              <div className="fp-header__tagline">Reborn JSC · Kiến tạo hạ tầng sức khỏe cho 100 triệu người Việt</div>
            </div>
          </div>
          <a href="/crm/login" className="fp-header__login">
            <span className="fp-header__login-long">Đăng nhập quản trị</span>
            <span className="fp-header__login-short">🔐</span>
          </a>
        </div>
      </div>

      {/* Hero */}
      <div className="fp-hero">
        <h1 className="fp-hero__title">Tìm Trạm FitPro gần bạn</h1>
        <p className="fp-hero__sub">Khung giờ 6-9h sáng · Không cần đăng ký · Đặt buổi thử miễn phí chỉ qua SĐT</p>

        {/* Search bar */}
        <div className="fp-search">
          <input
            type="text"
            placeholder="🔍 Nhập địa chỉ, quận/huyện hoặc thành phố..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="fp-search__input"
          />
          <button
            onClick={() => alert("📍 Yêu cầu quyền truy cập vị trí trình duyệt. Sẽ tìm 10 trạm gần nhất quanh bạn.")}
            className="fp-search__btn"
          >
            📍 Dùng vị trí hiện tại
          </button>
        </div>

        {/* Type filter */}
        <div className="fp-filters">
          {[
            { key: "all", label: "Tất cả", icon: "🔎" },
            { key: "home", label: "Home FitPro", icon: "🏠" },
            { key: "center", label: "FitPro CENTER", icon: "🏢" },
            { key: "inside", label: "FitPro INSIDE", icon: "🔌" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key as any)}
              className={`fp-filter-chip ${selectedType === t.key ? "active" : ""}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Station list */}
      <div className="fp-list-wrap">
        <div className="fp-list-head">
          <h2>{filteredStations.length} trạm đang hoạt động</h2>
          <div className="fp-list-head__hint">
            Đã hiển thị theo khoảng cách (mock) · Thực tế dùng geolocation
          </div>
        </div>

        {filteredStations.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: THEME.textMuted, background: "#fff", borderRadius: 10 }}>
            Không tìm thấy trạm phù hợp. Thử đổi từ khóa hoặc chọn "Tất cả".
          </div>
        ) : (
          <div className="fp-grid">
            {filteredStations.map((s) => {
              const typeColor = s.type === "home" ? "#4DE4C4" : s.type === "center" ? "#FF8C42" : "#2563EB";
              const typeIcon = s.type === "home" ? "🏠" : s.type === "center" ? "🏢" : "🔌";
              return (
                <div key={s.id} className="fp-card">
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
                  <h3>{s.name}</h3>
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
      <div className="fp-footer">
        <div className="fp-footer__inner">
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>FitPro</div>
            <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.6 }}>
              Sản phẩm của <strong>Reborn JSC</strong><br />
              Công ty Cổ phần Công nghệ và Truyền thông Reborn<br />
              <a href="https://ecosystem.reborn.vn" style={{ color: "#4DE4C4" }}>ecosystem.reborn.vn</a>
            </div>
          </div>
          <div className="fp-footer__meta">
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
    <div onClick={onClose} className="fp-modal-overlay">
      <div onClick={(e) => e.stopPropagation()} className="fp-modal">
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
