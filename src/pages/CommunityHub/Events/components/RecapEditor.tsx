// Recap editor — admin nhập "Sau sự kiện": headline, số người, ảnh hot, video,
// winners, bài viết. Khi user nhấn "Công bố", `publishedAt` được set → trang
// public sẽ tự hiện block Recap thay cho CTA đăng ký.
//
// Reuse ContentBlocksBuilder cho phần bài viết (recap.blocks).

import React from "react";
import type { EventRecap, EventRecapWinner, ContentBlock } from "../types";
import { THEME } from "../shared";
import { uploadDocumentFormData } from "utils/document";
import { showToast } from "utils/common";
import ContentBlocksBuilder from "./ContentBlocksBuilder";

interface Props {
  recap: EventRecap;
  onChange: (recap: EventRecap) => void;
}

function genId(): string {
  return `win-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: `1px solid ${THEME.border}`,
  fontSize: 13,
  background: "#fff",
  color: THEME.textMain,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: THEME.primaryDark,
  marginBottom: 4,
};

export default function RecapEditor({ recap, onChange }: Props) {
  const patch = (p: Partial<EventRecap>) => onChange({ ...recap, ...p });

  const isPublished = !!recap.publishedAt;
  const togglePublish = () => {
    patch({ publishedAt: isPublished ? undefined : new Date().toISOString() });
  };

  // ── Highlight images ────────────────────────────────────────────────────
  const addHighlightImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      uploadDocumentFormData(
        file,
        (data: any) => {
          const url = data?.fileUrl ?? data?.url;
          if (url) {
            patch({ highlightImages: [...(recap.highlightImages ?? []), url] });
          }
        },
        () => showToast("Có lỗi khi upload ảnh", "error"),
      );
    });
  };
  const removeHighlightImage = (i: number) => {
    patch({ highlightImages: (recap.highlightImages ?? []).filter((_, j) => j !== i) });
  };

  // ── Video URLs ──────────────────────────────────────────────────────────
  const setVideo = (i: number, url: string) => {
    const list = [...(recap.videoUrls ?? [])];
    list[i] = url;
    patch({ videoUrls: list });
  };
  const addVideo = () => patch({ videoUrls: [...(recap.videoUrls ?? []), ""] });
  const removeVideo = (i: number) => patch({ videoUrls: (recap.videoUrls ?? []).filter((_, j) => j !== i) });

  // ── Winners ─────────────────────────────────────────────────────────────
  const winners = recap.winners ?? [];
  const setWinner = (i: number, p: Partial<EventRecapWinner>) => {
    const list = winners.map((w, j) => (j === i ? { ...w, ...p } : w));
    patch({ winners: list });
  };
  const addWinner = () =>
    patch({ winners: [...winners, { id: genId(), name: "", rank: "", achievement: "" }] });
  const removeWinner = (i: number) => patch({ winners: winners.filter((_, j) => j !== i) });
  const uploadWinnerImage = (i: number, file: File) => {
    uploadDocumentFormData(
      file,
      (data: any) => {
        const url = data?.fileUrl ?? data?.url;
        if (url) setWinner(i, { imageUrl: url });
      },
      () => showToast("Có lỗi khi upload ảnh", "error"),
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Publish toggle */}
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          background: isPublished ? "#E6FAF4" : "#FFF7ED",
          border: `1px solid ${isPublished ? THEME.primary : THEME.warning}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: THEME.primaryDark }}>
            {isPublished ? "✅ Recap đã công bố" : "📝 Recap đang ở nháp"}
          </div>
          <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
            {isPublished
              ? "Khách hàng đã thấy block Recap khi mở trang sự kiện."
              : "Chưa công bố — khách hàng vẫn thấy thông báo \"Sự kiện đã kết thúc\" mà chưa thấy nội dung recap."}
          </div>
        </div>
        <button
          type="button"
          onClick={togglePublish}
          style={{
            padding: "8px 14px",
            borderRadius: 6,
            border: "none",
            background: isPublished ? "#fff" : THEME.primary,
            color: isPublished ? THEME.danger : "#fff",
            borderColor: isPublished ? THEME.danger : THEME.primary,
            borderWidth: 1,
            borderStyle: "solid",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {isPublished ? "Huỷ công bố" : "Công bố recap"}
        </button>
      </div>

      {/* Summary đã chuyển ra EventFormPage Section 8 — render bằng RebornEditor
          (rich text) thay vì textarea, để admin chèn ảnh/link/bảng. */}

      {/* Stats + next event slug */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Số người tham gia thực tế</label>
          <input
            type="number"
            min={0}
            style={inputStyle}
            placeholder="VD: 250"
            value={recap.attendeeCount ?? ""}
            onChange={(e) => {
              const v = e.target.value.trim();
              patch({ attendeeCount: v === "" ? undefined : Math.max(0, Number(v)) });
            }}
          />
        </div>
        <div>
          <label style={labelStyle}>Slug sự kiện tiếp theo</label>
          <input
            style={inputStyle}
            placeholder="VD: hoi-thao-thang-6"
            value={recap.nextEventSlug ?? ""}
            onChange={(e) => patch({ nextEventSlug: e.target.value.trim() || undefined })}
          />
        </div>
      </div>

      {/* Highlight images */}
      <div>
        <label style={labelStyle}>🖼️ Ảnh nổi bật trong sự kiện</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {(recap.highlightImages ?? []).map((url, i) => (
            <div
              key={i}
              style={{
                width: 80,
                height: 80,
                borderRadius: 6,
                backgroundImage: `url(${url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                border: `1px solid ${THEME.border}`,
              }}
            >
              <button
                type="button"
                onClick={() => removeHighlightImage(i)}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: THEME.danger,
                  color: "#fff",
                  border: "none",
                  fontSize: 10,
                  cursor: "pointer",
                  lineHeight: "18px",
                  textAlign: "center",
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <label
          style={{
            display: "inline-block",
            padding: "6px 12px",
            background: THEME.primarySoft,
            color: THEME.primaryDark,
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          + Thêm ảnh
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              addHighlightImages(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {/* Video URLs */}
      <div>
        <label style={labelStyle}>🎬 Video (YouTube/Vimeo/Facebook URL)</label>
        {(recap.videoUrls ?? []).map((url, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setVideo(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeVideo(i)}
              style={{
                padding: "0 10px",
                background: "#fff",
                border: `1px solid ${THEME.danger}`,
                color: THEME.danger,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Xoá
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addVideo}
          style={{
            padding: "6px 12px",
            background: "#fff",
            border: `1px dashed ${THEME.border}`,
            color: THEME.textMain,
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          + Thêm video
        </button>
      </div>

      {/* Winners */}
      <div>
        <label style={labelStyle}>🏆 Danh sách đoạt giải / vinh danh</label>
        {winners.map((w, i) => (
          <div
            key={w.id}
            style={{
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              padding: 10,
              marginBottom: 8,
              background: "#fff",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10 }}>
              <div>
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    border: `1px dashed ${THEME.border}`,
                    backgroundImage: w.imageUrl ? `url(${w.imageUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    background: w.imageUrl ? undefined : THEME.primarySoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: THEME.textMuted,
                    overflow: "hidden",
                    marginBottom: 4,
                  }}
                >
                  {!w.imageUrl && "Chưa có ảnh"}
                </div>
                <label
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    background: THEME.primarySoft,
                    color: THEME.primaryDark,
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  📤 Upload
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadWinnerImage(i, f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <input
                  style={inputStyle}
                  placeholder='Giải / hạng — VD: "Giải nhất", "HCV", "Top 1"'
                  value={w.rank ?? ""}
                  onChange={(e) => setWinner(i, { rank: e.target.value })}
                />
                <input
                  style={inputStyle}
                  placeholder="Tên người / đội"
                  value={w.name}
                  onChange={(e) => setWinner(i, { name: e.target.value })}
                />
                <input
                  style={inputStyle}
                  placeholder="Thành tích / ghi chú (tuỳ chọn)"
                  value={w.achievement ?? ""}
                  onChange={(e) => setWinner(i, { achievement: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeWinner(i)}
                  style={{
                    alignSelf: "flex-end",
                    padding: "4px 10px",
                    background: "#fff",
                    border: `1px solid ${THEME.danger}`,
                    color: THEME.danger,
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 11,
                  }}
                >
                  Xoá
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addWinner}
          style={{
            padding: "6px 12px",
            background: "#fff",
            border: `1px dashed ${THEME.border}`,
            color: THEME.textMain,
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          + Thêm người đoạt giải
        </button>
      </div>

      {/* Recap blocks (rich content) */}
      <div>
        <label style={labelStyle}>📰 Bài viết / nội dung tự do</label>
        <p style={{ fontSize: 11, color: THEME.textMuted, margin: "0 0 6px" }}>
          Reuse kéo-thả block (ảnh + chữ + embed) — hiển thị bên dưới hero recap trên trang public.
        </p>
        <ContentBlocksBuilder
          blocks={recap.blocks ?? []}
          onChange={(blocks: ContentBlock[]) => patch({ blocks })}
        />
      </div>
    </div>
  );
}
