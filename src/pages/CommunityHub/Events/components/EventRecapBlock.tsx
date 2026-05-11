// Render block "Sau sự kiện" trên trang public detail. Hiển thị khi:
//   - event đã `ended` (now > endDate, hoặc status === "ended")
//   - VÀ recap.publishedAt được set (admin đã công bố)
//
// Layout: hero banner + stats → highlight gallery → videos → winners → bài viết → CTA next event.
// Theme: sáng, ấm, có gold accent — feel "kỷ niệm / yearbook" chứ không tối u tịch.

import React from "react";
import type { EventRecap } from "../types";
import ContentBlocksRenderer from "./ContentBlocksRenderer";

const THEME = {
  primary: "#00C9A7",
  primaryDark: "#0B2E2A",
  primarySoft: "#E4F7F3",
  accent: "#FF8A3C",
  gold: "#F59E0B",
  goldSoft: "#FEF3C7",
  border: "#D9E0DE",
  text: "#1A2B28",
  muted: "#6B8A85",
  white: "#FFFFFF",
};

interface Props {
  recap: EventRecap;
  /** Số đăng ký active (BE trả về). Dùng fallback khi admin chưa nhập `attendeeCount`. */
  fallbackAttendeeCount?: number;
  /** Khi user click "Sự kiện tiếp theo", gọi handler (vd navigate). */
  onOpenNextEvent?: (slug: string) => void;
}

/** Chuyển YouTube/Vimeo URL → embed URL. Fallback giữ nguyên nếu không khớp. */
function toEmbedUrl(url: string): string {
  if (!url) return url;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  if (/facebook\.com\/.+\/videos\//.test(url)) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  }
  return url;
}

export default function EventRecapBlock({ recap, fallbackAttendeeCount, onOpenNextEvent }: Props) {
  const attendeeCount = recap.attendeeCount ?? fallbackAttendeeCount;
  const winners = recap.winners ?? [];
  const images = recap.highlightImages ?? [];
  const videos = (recap.videoUrls ?? []).filter(Boolean);
  const hasBlocks = (recap.blocks?.length ?? 0) > 0;

  // Hero image: ưu tiên ảnh đầu tiên để làm cover spotlight, các ảnh còn lại grid bên dưới.
  const heroImage = images[0];
  const restImages = images.slice(1);

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        marginBottom: 20,
        overflow: "hidden",
        border: `1px solid ${THEME.border}`,
        boxShadow: "0 10px 30px rgba(11,46,42,0.10)",
      }}
    >
      {/* ── Banner đầu: teal sáng + gold accent ride along ──────────────── */}
      <div
        style={{
          position: "relative",
          padding: "26px 24px 22px",
          background: `linear-gradient(135deg, ${THEME.primary} 0%, #00B594 70%, ${THEME.primaryDark} 130%)`,
          color: THEME.white,
          overflow: "hidden",
        }}
      >
        {/* Gold ribbon trang trí góc phải */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 140,
            height: 140,
            background: `radial-gradient(circle, ${THEME.gold} 0%, transparent 65%)`,
            opacity: 0.45,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 12px",
            borderRadius: 999,
            background: THEME.goldSoft,
            color: "#92400E",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.8,
            marginBottom: 12,
            boxShadow: "0 2px 6px rgba(245,158,11,0.25)",
          }}
        >
          🎉 SỰ KIỆN ĐÃ HOÀN THÀNH
        </div>

        <h2
          style={{
            margin: "0 0 8px",
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: -0.4,
            color: THEME.white,
            lineHeight: 1.2,
            textShadow: "0 2px 12px rgba(0,0,0,0.18)",
          }}
        >
          Cảm ơn bạn đã đồng hành! 💚
        </h2>

        {recap.summary && (
          <div
            className="event-recap-summary"
            style={{
              fontSize: 14.5,
              lineHeight: 1.65,
              color: THEME.white,
              opacity: 0.95,
              maxWidth: 760,
            }}
            // recap.summary là HTML từ RebornEditor — admin tenant trust nguồn.
            dangerouslySetInnerHTML={{ __html: recap.summary }}
          />
        )}
      </div>

      {/* ── Stats row: card trắng nổi trên thân vàng nhạt ─────────────────── */}
      {(attendeeCount != null || winners.length > 0 || images.length > 0 || videos.length > 0) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10,
            padding: "16px 20px",
            background: "#FAFCFB",
            borderBottom: `1px solid ${THEME.border}`,
          }}
        >
          {attendeeCount != null && (
            <StatTile icon="👥" num={attendeeCount} label="Người tham gia" color={THEME.primary} />
          )}
          {winners.length > 0 && (
            <StatTile icon="🏆" num={winners.length} label="Người đoạt giải" color={THEME.gold} />
          )}
          {images.length > 0 && (
            <StatTile icon="📸" num={images.length} label="Ảnh kỷ niệm" color="#8B5CF6" />
          )}
          {videos.length > 0 && (
            <StatTile icon="🎬" num={videos.length} label="Video" color="#EF4444" />
          )}
        </div>
      )}

      {/* ── Body: gallery + videos + winners + bài viết ─────────────────── */}
      <div style={{ padding: "20px 22px 24px", color: THEME.text }}>
        {/* Hero gallery — 1 ảnh lớn + lưới thumbs */}
        {heroImage && (
          <div style={{ marginBottom: restImages.length > 0 ? 8 : 0 }}>
            <SectionLabel icon="📸" text="Khoảnh khắc đáng nhớ" />
            <a
              href={heroImage}
              target="_blank"
              rel="noopener noreferrer"
              data-fancybox="recap-gallery"
              style={{
                display: "block",
                aspectRatio: "16/9",
                borderRadius: 12,
                overflow: "hidden",
                background: `url(${heroImage}) center/cover`,
                border: `1px solid ${THEME.border}`,
                cursor: "zoom-in",
                marginTop: 10,
              }}
              aria-label="Ảnh nổi bật"
            />
          </div>
        )}
        {restImages.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 8,
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            {restImages.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                data-fancybox="recap-gallery"
                style={{
                  display: "block",
                  aspectRatio: "4/3",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: `url(${url}) center/cover`,
                  border: `1px solid ${THEME.border}`,
                  cursor: "zoom-in",
                }}
                aria-label={`Ảnh ${i + 2}`}
              />
            ))}
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <SectionLabel icon="🎬" text="Video sự kiện" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: videos.length === 1 ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 10,
                marginTop: 10,
              }}
            >
              {videos.map((url, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    paddingTop: "56.25%",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "#000",
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <iframe
                    src={toEmbedUrl(url)}
                    title={`Video ${i + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Winners */}
        {winners.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <SectionLabel icon="🏆" text="Vinh danh" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 10,
                marginTop: 10,
              }}
            >
              {winners.map((w) => (
                <div
                  key={w.id}
                  style={{
                    position: "relative",
                    background: `linear-gradient(135deg, ${THEME.goldSoft} 0%, #FFFFFF 60%)`,
                    border: `1px solid ${THEME.gold}`,
                    borderRadius: 12,
                    padding: 14,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    boxShadow: "0 4px 12px rgba(245,158,11,0.10)",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      flexShrink: 0,
                      backgroundColor: THEME.goldSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
                      border: `3px solid ${THEME.gold}`,
                      boxShadow: "0 2px 8px rgba(245,158,11,0.25)",
                      overflow: "hidden",
                    }}
                  >
                    {w.imageUrl ? (
                      <img
                        src={w.imageUrl}
                        alt={w.name || "Ảnh người đoạt giải"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      "🏅"
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    {w.rank && (
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#92400E",
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                          marginBottom: 2,
                        }}
                      >
                        {w.rank}
                      </div>
                    )}
                    <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.25, color: THEME.primaryDark }}>
                      {w.name}
                    </div>
                    {w.achievement && (
                      <div style={{ fontSize: 12, color: THEME.muted, marginTop: 2, lineHeight: 1.4 }}>
                        {w.achievement}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free-form bài viết */}
        {hasBlocks && (
          <div style={{ marginTop: 22 }}>
            <SectionLabel icon="📰" text="Bài viết về sự kiện" />
            <div style={{ marginTop: 10 }}>
              <ContentBlocksRenderer blocks={recap.blocks!} />
            </div>
          </div>
        )}

        {/* CTA next event */}
        {recap.nextEventSlug && (
          <div
            style={{
              marginTop: 24,
              padding: "16px 20px",
              borderRadius: 12,
              background: `linear-gradient(135deg, ${THEME.primarySoft} 0%, #FFFFFF 100%)`,
              border: `1px dashed ${THEME.primary}`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: THEME.primary, letterSpacing: 0.3, marginBottom: 2 }}>
                🚀 ĐỪNG BỎ LỠ
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: THEME.primaryDark }}>
                Sự kiện tiếp theo đang chờ bạn
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenNextEvent?.(recap.nextEventSlug!)}
              style={{
                padding: "11px 22px",
                borderRadius: 999,
                border: "none",
                background: THEME.primary,
                color: THEME.white,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(0,201,167,0.4)",
                whiteSpace: "nowrap",
              }}
            >
              Đăng ký ngay →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({
  icon,
  num,
  label,
  color,
}: {
  icon: string;
  num: number;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 10,
        padding: "12px 14px",
        border: `1px solid ${THEME.border}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 2px 6px rgba(11,46,42,0.05)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: `${color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1, color }}>
          {new Intl.NumberFormat("vi-VN").format(num)}
        </div>
        <div style={{ fontSize: 11, color: THEME.muted, marginTop: 3, letterSpacing: 0.2 }}>{label}</div>
      </div>
    </div>
  );
}

function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        background: THEME.primarySoft,
        color: THEME.primaryDark,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.3,
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
