// Public events portal — không cần đăng nhập.
// URL public thân thiện SEO: /crm/events
// Khi click 1 event sẽ sang /crm/events/{slug} (fallback cũ: /crm/share_event?slug=...).
//
// BE: GET /market/events/public/list (fetchConfig tự bỏ token vì path chứa /public/)

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventService from "services/EventService";
import type { EventEntity } from "@/pages/CommunityHub/Events/types";
import { normalizeEvent } from "@/pages/CommunityHub/Events/storage";
import { formatVNDate, formatVNTime } from "@/pages/CommunityHub/Events/datetime";
import { portalSettings, type PortalSettings } from "@/pages/CommunityHub/Events/portalSettings";
import "./index.scss";

// ── Theme (đồng bộ ShareEventPage) ─────────────────────────────────────────
const THEME = {
  primary: "#00C9A7",
  primaryDark: "#0B2E2A",
  primarySoft: "#E4F7F3",
  accent: "#FF8A3C",
  danger: "#E85D4B",
  warning: "#F5A623",
  success: "#22C55E",
  textMain: "#1A2B28",
  textMuted: "#6B8A85",
  border: "#D9E0DE",
  bg: "#F5F9F8",
};

// ── Helpers ────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");

function formatVND(n?: number): string {
  if (!n || n <= 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
}

const formatDateShort = formatVNDate;
const formatTime = (iso: string) => (iso ? formatVNTime(iso) : "");

function formatDateLong(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  // Lấy thứ trong tuần theo giờ VN — Intl trả về tên ngày dài "Saturday"; map sang T2/T3/...
  const dayLong = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
  }).format(d); // "Sat", "Sun"...
  const DAY_VN: Record<string, string> = { Sun: "CN", Mon: "T2", Tue: "T3", Wed: "T4", Thu: "T5", Fri: "T6", Sat: "T7" };
  return `${DAY_VN[dayLong] ?? dayLong}, ${formatVNDate(iso)}`;
}

// Category badge mapping
const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  workshop:    { label: "Workshop",   icon: "🎓", color: "#8B5CF6" },
  seminar:     { label: "Hội thảo",   icon: "🎤", color: "#3B82F6" },
  class:       { label: "Lớp học",    icon: "📚", color: "#06B6D4" },
  networking:  { label: "Networking", icon: "🤝", color: "#F59E0B" },
  sport:       { label: "Thể thao",   icon: "🏃", color: "#10B981" },
  culture:     { label: "Văn hoá",    icon: "🎭", color: "#EC4899" },
  other:       { label: "Sự kiện",    icon: "✨", color: "#6366F1" },
};

function categoryMeta(cat?: string) {
  if (!cat) return CATEGORY_META.other;
  const k = cat.toLowerCase();
  for (const key of Object.keys(CATEGORY_META)) {
    if (k.includes(key)) return CATEGORY_META[key];
  }
  return { label: cat, icon: "✨", color: "#6366F1" };
}

// ── Countdown hook (cho ongoing/imminent events) ───────────────────────────
function useCountdown(targetIso: string): string | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000); // update mỗi phút
    return () => clearInterval(t);
  }, []);
  if (!targetIso) return null;
  const diff = new Date(targetIso).getTime() - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
  if (hours > 0) return `Còn ${hours} giờ ${mins} phút`;
  return `Còn ${mins} phút`;
}

// ── Tính filter hash cho tình trạng thực tế (không tin status field) ───────
function liveStatus(e: EventEntity): "ongoing" | "upcoming" | "ended" {
  const now = Date.now();
  const s = new Date(e.startDate).getTime();
  const en = new Date(e.endDate).getTime();
  if (now > en) return "ended";
  if (now >= s) return "ongoing";
  return "upcoming";
}

// ── SEO helpers ─────────────────────────────────────────────────────────────
function setSeoMeta(title: string, description: string) {
  document.title = title;
  const setMeta = (name: string, content: string) => {
    let m = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", name);
      document.head.appendChild(m);
    }
    m.setAttribute("content", content);
  };
  const setOg = (property: string, content: string) => {
    let m = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("property", property);
      document.head.appendChild(m);
    }
    m.setAttribute("content", content);
  };
  setMeta("description", description);
  setOg("og:title", title);
  setOg("og:description", description);
  setOg("og:type", "website");
}

// ── Countdown Chip (component nhỏ, dùng cho card ongoing) ──────────────────
function CountdownChip({ iso, label }: { iso: string; label: string }) {
  const countdown = useCountdown(iso);
  if (!countdown) return null;
  return (
    <span className="pe-chip pe-chip--countdown" title={label}>
      ⏱ {countdown}
    </span>
  );
}

// ── Card component ─────────────────────────────────────────────────────────
function EventCard({
  event,
  variant = "regular",
  onOpen,
}: {
  event: EventEntity;
  variant?: "featured" | "regular" | "mini";
  onOpen: (slug: string) => void;
}) {
  const live = liveStatus(event);
  const cat = categoryMeta(event.category);
  const price = event.ticketPrice ?? 0;
  const isFree = price <= 0;

  const cover = event.coverImageUrl || event.galleryImageUrls?.[0];
  const gallery = (event.galleryImageUrls ?? []).slice(0, 3);

  return (
    <article
      className={`pe-card pe-card--${variant} pe-card--${live}`}
      onClick={() => onOpen(event.slug)}
    >
      <div className="pe-card__cover">
        {cover ? (
          <img src={cover} alt={event.title} loading="lazy" />
        ) : (
          <div className="pe-card__cover-placeholder" style={{ background: cat.color + "22" }}>
            <span style={{ fontSize: variant === "featured" ? 72 : 48 }}>{cat.icon}</span>
          </div>
        )}

        {/* Top-left badges */}
        <div className="pe-card__badges">
          <span className="pe-chip pe-chip--cat" style={{ background: cat.color }}>
            {cat.icon} {cat.label}
          </span>
          {live === "ongoing" && (
            <span className="pe-chip pe-chip--live">
              <span className="pe-live-dot" /> ĐANG DIỄN RA
            </span>
          )}
          {isFree && variant === "featured" && <span className="pe-chip pe-chip--free">MIỄN PHÍ</span>}
        </div>

        {/* Countdown ribbon */}
        {live === "upcoming" && <CountdownChip iso={event.startDate} label="Đến giờ bắt đầu" />}
      </div>

      <div className="pe-card__body">
        <h2 className="pe-card__title">{event.title}</h2>

        <p className="pe-card__desc">{event.description}</p>

        <div className="pe-card__meta">
          <div className="pe-meta-row">
            <span className="pe-meta-ico">📅</span>
            <span>
              <strong>{formatDateLong(event.startDate)}</strong>
              {event.startDate && event.endDate && formatTime(event.startDate) && (
                <> — {formatTime(event.startDate)}</>
              )}
            </span>
          </div>
          <div className="pe-meta-row">
            <span className="pe-meta-ico">📍</span>
            <span>
              {event.venue?.isOnline ? "Sự kiện online" : event.venue?.name || "TBA"}
              {event.venue?.city && !event.venue?.isOnline && <> · {event.venue.city}</>}
            </span>
          </div>
        </div>

        {variant === "featured" && gallery.length > 0 && (
          <div className="pe-card__gallery">
            {gallery.map((url, i) => (
              <img key={i} src={url} alt={`${event.title} ${i + 1}`} loading="lazy" />
            ))}
          </div>
        )}

        <div className="pe-card__footer">
          <div className="pe-price">
            <span className={`pe-price-val ${isFree ? "pe-price-val--free" : ""}`}>
              {formatVND(price)}
            </span>
            {!!event.maxAttendees && (
              <span className="pe-capacity">· tối đa {event.maxAttendees} người</span>
            )}
          </div>
          <button
            type="button"
            className="pe-cta"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(event.slug);
            }}
          >
            Đăng ký ngay <span className="pe-cta-arrow">→</span>
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PublicEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "ongoing" | "upcoming" | "free">("all");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  // ── SEO ──
  useEffect(() => {
    setSeoMeta(
      "Sự kiện sắp diễn ra — Đăng ký tham gia miễn phí",
      "Khám phá các sự kiện, workshop, hội thảo đang mở đăng ký. Cập nhật lịch sự kiện hàng tuần, đăng ký nhanh chỉ trong 30 giây.",
    );
  }, []);

  // ── Load events ──
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await EventService.listPublic({ limit: 100 }, ctrl.signal);
        if (res?.code === 0) {
          const raw = res.result?.items ?? res.result ?? [];
          // BE trả một số field (galleryImageUrls, tags, dynamicFields, addOnItems, venue…)
          // dạng JSON string — phải normalize trước khi render, nếu không EventCard sẽ
          // crash ở gallery.map vì .slice trên string trả về string (không có .map).
          const items: EventEntity[] = (Array.isArray(raw) ? raw : []).map(normalizeEvent);
          // Chỉ giữ published + ongoing (không show draft/ended/cancelled cho public)
          // Yc 5/5: ẩn luôn các sự kiện đánh dấu isTest dù đã published.
          const visible = items.filter(e => (e.status === "published" || e.status === "ongoing") && !e.isTest);
          setEvents(visible);
        } else {
          setError(res?.message ?? "Không thể tải danh sách sự kiện");
        }
      } catch (e: unknown) {
        const err = e as { name?: string };
        if (err?.name !== "AbortError") setError("Lỗi kết nối máy chủ");
      } finally {
        setIsLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // ── Derive: categories có sẵn + filtered list ──
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    events.forEach(e => {
      if (e.category) map.set(e.category, (map.get(e.category) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter(e => {
      const live = liveStatus(e);
      if (live === "ended") return false;
      if (activeFilter === "ongoing" && live !== "ongoing") return false;
      if (activeFilter === "upcoming" && live !== "upcoming") return false;
      if (activeFilter === "free" && (e.ticketPrice ?? 0) > 0) return false;
      if (activeCat && e.category !== activeCat) return false;
      if (q) {
        const hay = `${e.title} ${e.description} ${e.tags?.join(" ") ?? ""} ${e.venue?.name ?? ""} ${e.venue?.city ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, query, activeFilter, activeCat]);

  // ── Chọn featured: ưu tiên ongoing, fallback nearest upcoming ──
  const featuredEvent = useMemo<EventEntity | null>(() => {
    if (filtered.length === 0) return null;
    const ongoing = filtered.find(e => liveStatus(e) === "ongoing");
    if (ongoing) return ongoing;
    // Nearest upcoming
    const upcoming = [...filtered]
      .filter(e => liveStatus(e) === "upcoming")
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return upcoming[0] ?? filtered[0];
  }, [filtered]);

  const rest = useMemo(
    () => filtered.filter(e => e.id !== featuredEvent?.id),
    [filtered, featuredEvent],
  );

  const openEvent = (slug: string) => {
    navigate(`/events/${encodeURIComponent(slug)}`);
  };

  // ── Stats cho hero ──
  const stats = useMemo(() => {
    const ongoing = events.filter(e => liveStatus(e) === "ongoing").length;
    const upcoming = events.filter(e => liveStatus(e) === "upcoming").length;
    return { total: events.length, ongoing, upcoming };
  }, [events]);

  // ── Decide layout density: few (<=3 visible) vs many (>=4) ──
  const layoutDensity: "few" | "many" = filtered.length <= 3 ? "few" : "many";

  // ── Banner config (per-tenant, có thể override hero default) ──
  const [settings, setSettings] = useState<PortalSettings>(() => portalSettings.get());
  useEffect(() => {
    // Reload nếu admin vừa cập nhật (cùng tab)
    const onStorage = () => setSettings(portalSettings.get());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="pe-page" style={{ "--pe-primary": THEME.primary, "--pe-primary-dark": THEME.primaryDark, "--pe-primary-soft": THEME.primarySoft, "--pe-accent": THEME.accent, "--pe-text": THEME.textMain, "--pe-muted": THEME.textMuted, "--pe-border": THEME.border, "--pe-bg": THEME.bg } as React.CSSProperties}>
      {/* ═══ BANNER ẢNH (tuỳ chọn — admin cấu hình per-tenant) ═══════════════ */}
      {/* Render dạng <img> thay vì text để tránh trình duyệt auto-translate. */}
      {settings.bannerImageUrl && (
        settings.bannerLinkUrl ? (
          <a href={settings.bannerLinkUrl} className="pe-banner-img-wrap" aria-label="Banner sự kiện">
            <img src={settings.bannerImageUrl} alt="" className="pe-banner-img" translate="no" />
          </a>
        ) : (
          <div className="pe-banner-img-wrap">
            <img src={settings.bannerImageUrl} alt="" className="pe-banner-img" translate="no" />
          </div>
        )
      )}

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <header className="pe-hero" role="banner">
        <div className="pe-hero__bg">
          <div className="pe-hero__orb pe-hero__orb--1" />
          <div className="pe-hero__orb pe-hero__orb--2" />
          <div className="pe-hero__orb pe-hero__orb--3" />
        </div>

        <div className="pe-hero__inner">
          {/* Khi tenant đã upload banner ảnh có text branding (vd "W.HOUSE — NÂNG
              TẦM GIÁ TRỊ SỐNG"), ẩn dòng kicker text vì (a) tránh trùng nội dung
              với banner ngay phía trên, (b) tránh trình duyệt auto-translate
              sai branding. Default tenant vẫn show kicker như cũ. */}
          {!settings.bannerImageUrl && (
            <span className="pe-hero__kicker">Cộng đồng · Sự kiện · Kết nối</span>
          )}
          <h1 className="pe-hero__title">
            Sự kiện sắp tới
            <br/>
            <span className="pe-hero__title-hl">cho bạn & cộng đồng</span>
          </h1>
          <p className="pe-hero__sub">
            Cập nhật danh sách workshop, hội thảo và hoạt động cộng đồng mới nhất. Đăng ký trong 30 giây — nhận vé qua tin nhắn ngay.
          </p>

          {!isLoading && events.length > 0 && (
            <div className="pe-hero__stats">
              <div className="pe-stat">
                <div className="pe-stat__num">{stats.total}</div>
                <div className="pe-stat__lbl">Sự kiện</div>
              </div>
              <div className="pe-stat-divider" />
              <div className="pe-stat">
                <div className="pe-stat__num pe-stat__num--live">
                  {stats.ongoing > 0 && <span className="pe-live-dot" />}
                  {stats.ongoing}
                </div>
                <div className="pe-stat__lbl">Đang diễn ra</div>
              </div>
              <div className="pe-stat-divider" />
              <div className="pe-stat">
                <div className="pe-stat__num">{stats.upcoming}</div>
                <div className="pe-stat__lbl">Sắp diễn ra</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ═══ FILTERS ═══════════════════════════════════════════════════════ */}
      <section className="pe-filters" aria-label="Bộ lọc sự kiện">
        <div className="pe-filters__inner">
          <div className="pe-search">
            <span className="pe-search__ico">🔍</span>
            <input
              type="search"
              placeholder="Tìm theo tên, chủ đề, địa điểm…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Tìm kiếm sự kiện"
            />
          </div>

          <div className="pe-chips" role="group" aria-label="Lọc trạng thái">
            {([
              { k: "all",      l: "Tất cả" },
              { k: "ongoing",  l: "Đang diễn ra" },
              { k: "upcoming", l: "Sắp tới" },
              { k: "free",     l: "Miễn phí" },
            ] as const).map(opt => (
              <button
                key={opt.k}
                type="button"
                className={`pe-chip-btn ${activeFilter === opt.k ? "pe-chip-btn--on" : ""}`}
                onClick={() => setActiveFilter(opt.k)}
              >
                {opt.l}
              </button>
            ))}
          </div>

          {categories.length > 1 && (
            <div className="pe-chips pe-chips--cat" role="group" aria-label="Lọc danh mục">
              <button
                type="button"
                className={`pe-chip-btn pe-chip-btn--ghost ${activeCat === null ? "pe-chip-btn--on" : ""}`}
                onClick={() => setActiveCat(null)}
              >
                Mọi danh mục
              </button>
              {categories.map(([c, count]) => {
                const m = categoryMeta(c);
                return (
                  <button
                    key={c}
                    type="button"
                    className={`pe-chip-btn pe-chip-btn--ghost ${activeCat === c ? "pe-chip-btn--on" : ""}`}
                    onClick={() => setActiveCat(activeCat === c ? null : c)}
                  >
                    {m.icon} {m.label} <span className="pe-chip-count">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══ CONTENT ═══════════════════════════════════════════════════════ */}
      <main className="pe-main" role="main">
        {isLoading && (
          <div className="pe-skeleton-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="pe-skel-card">
                <div className="pe-skel-cover" />
                <div className="pe-skel-line pe-skel-line--title" />
                <div className="pe-skel-line" />
                <div className="pe-skel-line pe-skel-line--short" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="pe-empty pe-empty--error">
            <div className="pe-empty__icon">⚠️</div>
            <h3>Không tải được danh sách</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="pe-cta">
              Thử lại
            </button>
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && events.length === 0 && (
          <div className="pe-empty">
            <div className="pe-empty__icon">📅</div>
            <h3>Chưa có sự kiện nào đang mở đăng ký</h3>
            <p>Hãy quay lại sớm — chúng tôi đang chuẩn bị những sự kiện thú vị cho bạn.</p>
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && events.length > 0 && (
          <div className="pe-empty">
            <div className="pe-empty__icon">🔎</div>
            <h3>Không tìm thấy sự kiện phù hợp</h3>
            <p>Thử bỏ bớt bộ lọc hoặc đổi từ khoá tìm kiếm.</p>
            <button
              className="pe-cta pe-cta--ghost"
              onClick={() => {
                setQuery("");
                setActiveFilter("all");
                setActiveCat(null);
              }}
            >
              Xoá bộ lọc
            </button>
          </div>
        )}

        {/* ─── LAYOUT "FEW" (<= 3 events) — spotlight + tall info ─── */}
        {!isLoading && !error && layoutDensity === "few" && featuredEvent && (
          <section className="pe-few">
            <div className="pe-few__headline">
              <span className="pe-few__eyebrow">
                {liveStatus(featuredEvent) === "ongoing" ? "🔴 Sự kiện đang diễn ra" : "✨ Sự kiện nổi bật tuần này"}
              </span>
              <h2 className="pe-few__h2">Đừng bỏ lỡ</h2>
            </div>
            <EventCard event={featuredEvent} variant="featured" onOpen={openEvent} />

            {rest.length > 0 && (
              <>
                <div className="pe-few__divider">
                  <span>Và {rest.length} sự kiện khác đang chờ bạn</span>
                </div>
                <div className="pe-grid pe-grid--cozy">
                  {rest.map(e => (
                    <EventCard key={e.id} event={e} variant="regular" onOpen={openEvent} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* ─── LAYOUT "MANY" (>=4 events) — hero + dense grid ─── */}
        {!isLoading && !error && layoutDensity === "many" && featuredEvent && (
          <>
            <section className="pe-spotlight">
              <div className="pe-spotlight__label">
                {liveStatus(featuredEvent) === "ongoing" ? "🔴 Đang diễn ra" : "⭐ Nổi bật"}
              </div>
              <EventCard event={featuredEvent} variant="featured" onOpen={openEvent} />
            </section>

            {rest.length > 0 && (
              <section className="pe-section">
                <h2 className="pe-section__title">
                  Tất cả sự kiện <span className="pe-section__count">({rest.length})</span>
                </h2>
                <div className="pe-grid">
                  {rest.map(e => (
                    <EventCard key={e.id} event={e} variant="regular" onOpen={openEvent} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="pe-footer">
        <div className="pe-footer__inner">
          <p>© {new Date().getFullYear()} · Cổng sự kiện cộng đồng</p>
          <p className="pe-footer__muted">Powered by Reborn Community Hub</p>
        </div>
      </footer>
    </div>
  );
}
