// Render block "Sau sự kiện" trên trang public detail. Hiển thị khi:
//   - event đã `ended` (now > endDate, hoặc status === "ended")
//   - VÀ recap.publishedAt được set (admin đã công bố)
//
// Layout: hero stats + summary → highlight gallery → videos → winners → bài viết → CTA next event.

import React from "react";
import type { EventRecap } from "../types";
import ContentBlocksRenderer from "./ContentBlocksRenderer";

const THEME = {
  primary: "#00C9A7",
  primaryDark: "#0B2E2A",
  primarySoft: "#E4F7F3",
  accent: "#FF8A3C",
  border: "#D9E0DE",
  text: "#1A2B28",
  muted: "#6B8A85",
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
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  // Facebook video (plugin)
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

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0B2E2A 0%, #1A4540 100%)",
        color: "#fff",
        borderRadius: 16,
        padding: "28px 24px",
        marginBottom: 20,
        boxShadow: "0 12px 32px rgba(11,46,42,0.25)",
      }}
    >
      {/* ── Header banner ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 20,
          background: "rgba(0, 201, 167, 0.18)",
          border: "1px solid rgba(0, 201, 167, 0.4)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.5,
          color: THEME.primary,
          marginBottom: 14,
        }}
      >
        🎉 SỰ KIỆN ĐÃ HOÀN THÀNH
      </div>

      <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, letterSpacing: -0.3 }}>
        Cảm ơn bạn đã đồng hành!
      </h2>

      {recap.summary && (
        <div
          className="event-recap-summary"
          style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.92 }}
          // recap.summary là HTML từ RebornEditor — đã được editor whitelist tag/attr.
          // Trust nguồn admin tenant (cùng cấp với event.content render trên ShareEventPage).
          dangerouslySetInnerHTML={{ __html: recap.summary }}
        />
      )}

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      {(attendeeCount != null || (recap.winners?.length ?? 0) > 0 || images.length > 0) && (
        <div
          style={{
            display: "flex",
            gap: 22,
            marginTop: 18,
            flexWrap: "wrap",
          }}
        >
          {attendeeCount != null && (
            <Stat num={attendeeCount} label="Người tham gia" />
          )}
          {(recap.winners?.length ?? 0) > 0 && (
            <Stat num={recap.winners!.length} label="Người đoạt giải" />
          )}
          {images.length > 0 && (
            <Stat num={images.length} label={`Ảnh${videos.length ? " + " + videos.length + " video" : ""}`} />
          )}
        </div>
      )}

      {/* ── Highlight gallery ──────────────────────────────────────────── */}
      {images.length > 0 && (
        <div
          style={{
            marginTop: 22,
            display: "grid",
            gridTemplateColumns: images.length === 1 ? "1fr" : "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 8,
          }}
        >
          {images.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              data-fancybox="recap-gallery"
              style={{
                display: "block",
                aspectRatio: "4/3",
                borderRadius: 10,
                overflow: "hidden",
                background: `url(${url}) center/cover`,
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "zoom-in",
              }}
              aria-label={`Ảnh sự kiện ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── Videos ─────────────────────────────────────────────────────── */}
      {videos.length > 0 && (
        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: videos.length === 1 ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 10,
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
      )}

      {/* ── Winners ────────────────────────────────────────────────────── */}
      {winners.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: 16,
              fontWeight: 800,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🏆 Vinh danh
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            {winners.map((w) => (
              <div
                key={w.id}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: 12,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    flexShrink: 0,
                    backgroundImage: w.imageUrl ? `url(${w.imageUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    background: w.imageUrl ? undefined : "rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    border: "2px solid rgba(0, 201, 167, 0.5)",
                  }}
                >
                  {!w.imageUrl && "🏅"}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  {w.rank && (
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: THEME.primary,
                        letterSpacing: 0.3,
                        marginBottom: 2,
                      }}
                    >
                      {w.rank}
                    </div>
                  )}
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{w.name}</div>
                  {w.achievement && (
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{w.achievement}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Free-form blocks (bài viết) ─────────────────────────────────── */}
      {hasBlocks && (
        <div
          style={{
            marginTop: 22,
            padding: 16,
            background: "rgba(255,255,255,0.96)",
            color: THEME.text,
            borderRadius: 12,
          }}
        >
          <ContentBlocksRenderer blocks={recap.blocks!} />
        </div>
      )}

      {/* ── CTA next event ─────────────────────────────────────────────── */}
      {recap.nextEventSlug && (
        <div style={{ marginTop: 22, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => onOpenNextEvent?.(recap.nextEventSlug!)}
            style={{
              padding: "12px 28px",
              borderRadius: 999,
              border: "none",
              background: THEME.primary,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(0,201,167,0.45)",
            }}
          >
            🚀 Đăng ký sự kiện tiếp theo →
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ num, label }: { num: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, color: THEME.primary }}>
        {new Intl.NumberFormat("vi-VN").format(num)}
      </div>
      <div style={{ fontSize: 11, opacity: 0.78, letterSpacing: 0.2 }}>{label}</div>
    </div>
  );
}
