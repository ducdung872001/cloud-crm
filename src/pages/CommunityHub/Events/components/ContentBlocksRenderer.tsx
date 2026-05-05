// Render ContentBlock[] ra giao diện public sự kiện. Yc 5/5 mục 1.

import React from "react";
import type { ContentBlock } from "../types";

interface Props {
  blocks: ContentBlock[];
}

export default function ContentBlocksRenderer({ blocks }: Props) {
  if (!blocks?.length) return null;
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="event-content-blocks">
      {sorted.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: ContentBlock }) {
  if (block.type === "divider") {
    return <hr style={{ border: 0, borderTop: "1px dashed #D9E0DE", margin: "20px 0" }} />;
  }

  if (block.type === "text") {
    return (
      <div
        style={{ fontSize: 15, lineHeight: 1.7, margin: "12px 0", color: "#222" }}
        // text được admin tự gõ, escape XSS bằng cách KHÔNG cho HTML tự ý.
        // Nếu cần rich content thì dùng RebornEditor block riêng (tương lai).
        dangerouslySetInnerHTML={{ __html: sanitizeText(block.text ?? "") }}
      />
    );
  }

  if (block.type === "image") {
    const img = (
      <img
        src={block.imageUrl}
        alt={block.caption ?? ""}
        style={{ maxWidth: "100%", borderRadius: 8, display: "block", margin: "12px 0" }}
      />
    );
    return (
      <figure style={{ margin: 0 }}>
        {block.linkUrl ? (
          <a href={block.linkUrl} target="_blank" rel="noreferrer">{img}</a>
        ) : img}
        {block.caption && (
          <figcaption style={{ textAlign: "center", fontSize: 12, color: "#666", marginTop: 4 }}>
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "image_text") {
    const pos = block.imagePosition ?? "left";
    const isHorizontal = pos === "left" || pos === "right";
    const direction: React.CSSProperties["flexDirection"] =
      pos === "right" ? "row-reverse"
        : pos === "left" ? "row"
          : pos === "bottom" ? "column-reverse"
            : "column";
    const wrap = (
      <div
        style={{
          display: "flex",
          flexDirection: direction,
          gap: 16,
          alignItems: isHorizontal ? "flex-start" : "stretch",
          margin: "16px 0",
        }}
      >
        {block.imageUrl && (
          <img
            src={block.imageUrl}
            alt=""
            style={{
              maxWidth: isHorizontal ? "40%" : "100%",
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        )}
        {block.text && (
          <div
            style={{ flex: 1, fontSize: 15, lineHeight: 1.7, color: "#222" }}
            dangerouslySetInnerHTML={{ __html: sanitizeText(block.text) }}
          />
        )}
      </div>
    );
    return block.linkUrl
      ? <a href={block.linkUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>{wrap}</a>
      : wrap;
  }

  if (block.type === "gallery") {
    const urls = block.imageUrls ?? [];
    if (!urls.length) return null;
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 8,
          margin: "16px 0",
        }}
      >
        {urls.map((u, i) => (
          <img
            key={i}
            src={u}
            alt={`gallery-${i}`}
            style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 6 }}
          />
        ))}
      </div>
    );
  }

  if (block.type === "banner_ad") {
    return (
      <a
        href={block.linkUrl ?? "#"}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "block", margin: "16px 0", borderRadius: 8, overflow: "hidden",
          border: "1px solid #EFEFEF", textDecoration: "none", color: "inherit",
        }}
      >
        {block.imageUrl && (
          <img src={block.imageUrl} alt={block.linkLabel ?? "Banner"} style={{ width: "100%", display: "block" }} />
        )}
        {block.linkLabel && (
          <div style={{ padding: "6px 10px", background: "#FAFAFA", fontSize: 13, fontWeight: 600, color: "#1B4D3E" }}>
            {block.linkLabel} →
          </div>
        )}
      </a>
    );
  }

  if (block.type === "embed") {
    if (!block.embedUrl) return null;
    return (
      <div style={{ margin: "16px 0" }}>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 8 }}>
          <iframe
            src={block.embedUrl}
            title={block.caption ?? "embed"}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          />
        </div>
        {block.caption && (
          <div style={{ textAlign: "center", fontSize: 12, color: "#666", marginTop: 4 }}>{block.caption}</div>
        )}
      </div>
    );
  }

  return null;
}

/** Cho phép tag inline cơ bản, escape phần còn lại. Yêu cầu cao hơn → đổi sang DOMPurify. */
function sanitizeText(s: string): string {
  if (!s) return "";
  // KHÔNG cho <script>, on*=
  const stripped = s
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
  return stripped;
}
