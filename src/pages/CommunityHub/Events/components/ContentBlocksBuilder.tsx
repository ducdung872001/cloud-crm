// Block-based content builder cho trang sự kiện. Yc 5/5 mục 1.
// Admin tự kéo-thả các block ảnh + chữ + banner để render trang sự kiện.
//
// Mỗi block là 1 unit độc lập, lưu thành JSON array `event.contentBlocks`.

import React, { useCallback, useRef, useState } from "react";
import type { ContentBlock, ContentBlockType } from "../types";
import { THEME } from "../shared";
import { uploadDocumentFormData } from "utils/document";
import { showToast } from "utils/common";

interface Props {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const TYPE_LABELS: { value: ContentBlockType; label: string; hint: string }[] = [
  { value: "text", label: "Văn bản", hint: "Đoạn chữ thuần (có thể HTML cơ bản)" },
  { value: "image", label: "Ảnh", hint: "1 ảnh full-width, optional click để mở link" },
  { value: "image_text", label: "Ảnh + chữ", hint: "Ảnh trên/dưới/trái/phải kết hợp đoạn chữ" },
  { value: "gallery", label: "Bộ sưu tập", hint: "Lưới nhiều ảnh" },
  { value: "banner_ad", label: "Banner quảng cáo", hint: "Treo banner click ra link" },
  { value: "embed", label: "Nhúng (video/iframe)", hint: "URL YouTube / Vimeo / Facebook video" },
  { value: "divider", label: "Đường phân cách", hint: "—" },
];

function genId(): string {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

function newBlockOfType(type: ContentBlockType, order: number): ContentBlock {
  const base: ContentBlock = { id: genId(), type, order };
  if (type === "image_text") base.imagePosition = "left";
  if (type === "gallery") base.imageUrls = [];
  return base;
}

export default function ContentBlocksBuilder({ blocks, onChange }: Props) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  const update = useCallback((idx: number, patch: Partial<ContentBlock>) => {
    const copy = sorted.map((b, i) => (i === idx ? { ...b, ...patch } : b));
    onChange(copy.map((b, i) => ({ ...b, order: i })));
  }, [sorted, onChange]);

  const remove = (idx: number) => {
    const copy = sorted.filter((_, i) => i !== idx).map((b, i) => ({ ...b, order: i }));
    onChange(copy);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const t = idx + dir;
    if (t < 0 || t >= sorted.length) return;
    const copy = [...sorted];
    [copy[idx], copy[t]] = [copy[t], copy[idx]];
    onChange(copy.map((b, i) => ({ ...b, order: i })));
  };

  const add = (type: ContentBlockType) => {
    onChange([...sorted, newBlockOfType(type, sorted.length)]);
  };

  return (
    <div>
      {sorted.length === 0 && (
        <div style={{ padding: 16, background: THEME.bg, border: `1px dashed ${THEME.border}`, borderRadius: 6, color: THEME.textMuted, fontSize: 13, marginBottom: 8 }}>
          Chưa có block nào. Nhấn nút bên dưới để thêm <b>ảnh</b> / <b>chữ</b> / <b>banner</b>… và sắp xếp theo ý.
        </div>
      )}

      {sorted.map((b, idx) => (
        <BlockEditor
          key={b.id}
          block={b}
          isFirst={idx === 0}
          isLast={idx === sorted.length - 1}
          onChange={(patch) => update(idx, patch)}
          onRemove={() => remove(idx)}
          onMoveUp={() => move(idx, -1)}
          onMoveDown={() => move(idx, 1)}
        />
      ))}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
        {TYPE_LABELS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => add(t.value)}
            title={t.hint}
            style={{
              padding: "6px 12px",
              background: "#fff",
              color: THEME.primaryDark,
              border: `1px dashed ${THEME.primary}`,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            + {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface BlockEditorProps {
  block: ContentBlock;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<ContentBlock>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function BlockEditor({ block, isFirst, isLast, onChange, onRemove, onMoveUp, onMoveDown }: BlockEditorProps) {
  const wrapper: React.CSSProperties = {
    border: `1px solid ${THEME.border}`,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    background: "#fff",
  };
  const headerStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 8, paddingBottom: 6, borderBottom: `1px dashed ${THEME.border}`,
  };

  return (
    <div style={wrapper}>
      <div style={headerStyle}>
        <span style={{ fontSize: 12, fontWeight: 600, color: THEME.textMain }}>
          {TYPE_LABELS.find((t) => t.value === block.type)?.label ?? block.type}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button type="button" onClick={onMoveUp} disabled={isFirst} style={ctrlBtn} title="Lên">↑</button>
          <button type="button" onClick={onMoveDown} disabled={isLast} style={ctrlBtn} title="Xuống">↓</button>
          <button type="button" onClick={onRemove} style={{ ...ctrlBtn, color: THEME.danger }} title="Xoá">✕</button>
        </div>
      </div>

      {block.type === "text" && (
        <RichTextArea
          value={block.text ?? ""}
          onChange={(html) => onChange({ text: html })}
          placeholder="Nội dung văn bản — có thể paste trực tiếp từ Word/Google Docs (giữ format đậm/nghiêng/danh sách)"
        />
      )}

      {block.type === "image" && (
        <ImageBlockEditor block={block} onChange={onChange} />
      )}

      {block.type === "image_text" && (
        <ImageTextBlockEditor block={block} onChange={onChange} />
      )}

      {block.type === "gallery" && (
        <GalleryBlockEditor block={block} onChange={onChange} />
      )}

      {block.type === "banner_ad" && (
        <BannerAdBlockEditor block={block} onChange={onChange} />
      )}

      {block.type === "embed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input
            value={block.embedUrl ?? ""}
            onChange={(e) => onChange({ embedUrl: e.target.value })}
            placeholder="URL nhúng (YouTube/Vimeo/Facebook iframe src)"
            style={input}
          />
          <input
            value={block.caption ?? ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Chú thích (optional)"
            style={input}
          />
        </div>
      )}

      {block.type === "divider" && (
        <div style={{ borderTop: `2px dashed ${THEME.border}`, margin: "8px 0", color: THEME.textMuted, fontSize: 12, textAlign: "center" }}>
          — Đường phân cách —
        </div>
      )}
    </div>
  );
}

function ImageBlockEditor({ block, onChange }: { block: ContentBlock; onChange: (p: Partial<ContentBlock>) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <ImageUploadField
        value={block.imageUrl ?? ""}
        onChange={(url) => onChange({ imageUrl: url })}
        placeholder="URL ảnh (https://…) hoặc bấm Upload để chọn từ máy"
      />
      <input
        value={block.linkUrl ?? ""}
        onChange={(e) => onChange({ linkUrl: e.target.value })}
        placeholder="Click ảnh sẽ mở (URL — optional)"
        style={input}
      />
      <input
        value={block.caption ?? ""}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Chú thích dưới ảnh (optional)"
        style={input}
      />
    </div>
  );
}

function ImageTextBlockEditor({ block, onChange }: { block: ContentBlock; onChange: (p: Partial<ContentBlock>) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: THEME.textMuted }}>Ảnh ở:</span>
        <select
          value={block.imagePosition ?? "left"}
          onChange={(e) => onChange({ imagePosition: e.target.value as ContentBlock["imagePosition"] })}
          style={{ ...input, width: 120 }}
        >
          <option value="left">Trái</option>
          <option value="right">Phải</option>
          <option value="top">Trên</option>
          <option value="bottom">Dưới</option>
        </select>
      </div>
      <ImageUploadField
        value={block.imageUrl ?? ""}
        onChange={(url) => onChange({ imageUrl: url })}
        placeholder="URL ảnh hoặc bấm Upload"
        preview={false}
      />
      <RichTextArea
        value={block.text ?? ""}
        onChange={(html) => onChange({ text: html })}
        placeholder="Đoạn chữ kế bên ảnh — paste từ Word/Docs giữ format"
      />
      <input
        value={block.linkUrl ?? ""}
        onChange={(e) => onChange({ linkUrl: e.target.value })}
        placeholder="Click khối sẽ mở (URL — optional)"
        style={input}
      />
    </div>
  );
}

function GalleryBlockEditor({ block, onChange }: { block: ContentBlock; onChange: (p: Partial<ContentBlock>) => void }) {
  const urls = block.imageUrls ?? [];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const handleMultiPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    const tasks = Array.from(files).map(
      (f) => new Promise<string | null>((resolve) => {
        uploadDocumentFormData(
          f,
          (data: any) => resolve(data?.fileUrl ?? data?.url ?? null),
          () => resolve(null),
        );
      }),
    );
    Promise.all(tasks).then((rs) => {
      const fresh = rs.filter((u): u is string => !!u);
      if (fresh.length) onChange({ imageUrls: [...urls, ...fresh] });
      else showToast("Upload thất bại", "error");
      setUploading(false);
    });
    e.target.value = "";
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 12, color: THEME.textMuted }}>Mỗi dòng 1 URL ảnh, hoặc bấm Upload để chọn nhiều file từ máy:</div>
      <textarea
        value={urls.join("\n")}
        onChange={(e) =>
          onChange({
            imageUrls: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
          })
        }
        rows={4}
        placeholder="https://...
https://..."
        style={input}
      />
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleMultiPick} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          alignSelf: "flex-start",
          padding: "6px 12px",
          fontSize: 12,
          background: uploading ? THEME.border : THEME.primarySoft,
          color: THEME.primaryDark,
          border: `1px solid ${THEME.primary}`,
          borderRadius: 4,
          cursor: uploading ? "wait" : "pointer",
          fontWeight: 600,
        }}
      >
        {uploading ? "Đang upload…" : "📎 Upload ảnh từ máy (nhiều)"}
      </button>
      {urls.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 4 }}>
          {urls.slice(0, 8).map((u, i) => (
            <img key={i} src={u} alt="" style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 4 }} />
          ))}
        </div>
      )}
    </div>
  );
}

function BannerAdBlockEditor({ block, onChange }: { block: ContentBlock; onChange: (p: Partial<ContentBlock>) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <ImageUploadField
        value={block.imageUrl ?? ""}
        onChange={(url) => onChange({ imageUrl: url })}
        placeholder="URL ảnh banner hoặc bấm Upload"
      />
      <input
        value={block.linkUrl ?? ""}
        onChange={(e) => onChange({ linkUrl: e.target.value })}
        placeholder="URL click banner mở (https://…)"
        style={input}
      />
      <input
        value={block.linkLabel ?? ""}
        onChange={(e) => onChange({ linkLabel: e.target.value })}
        placeholder="Nhãn link (optional, VD: 'Xem chi tiết')"
        style={input}
      />
    </div>
  );
}

/**
 * Rich-text area dùng contentEditable — giữ format khi paste từ Word/Google Docs
 * (yc tester 2026-05-06: textarea cũ làm mất format, mất chữ, scroll về top).
 *
 * Strategy:
 *  - innerHTML khởi tạo = value (HTML đã sanitize sẵn).
 *  - onPaste: lấy clipboardData('text/html') nếu có, chạy sanitize đơn giản
 *    (drop <script>, on*=, javascript:, MS Office mso-* metadata) rồi
 *    document.execCommand('insertHTML', ...). Fallback: paste plain text.
 *  - onInput: emit innerHTML lên parent.
 *
 * Component KHÔNG remount theo `value` để tránh mất caret position khi gõ.
 * Parent prop `value` chỉ dùng làm initial. Nếu cần reset, đổi `key`.
 */
function RichTextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const initialized = useRef(false);

  if (!initialized.current && ref.current) {
    ref.current.innerHTML = value || "";
    initialized.current = true;
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const plain = e.clipboardData.getData("text/plain");
    let toInsert: string;
    if (html) {
      // Sanitize HTML từ Word/Docs
      toInsert = html
        // Drop script/style
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        // Drop MS Office xml/comment
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<\/?o:[^>]*>/gi, "")
        .replace(/<\/?w:[^>]*>/gi, "")
        // Drop on*= và javascript:
        .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
        .replace(/on\w+\s*=\s*'[^']*'/gi, "")
        .replace(/javascript:/gi, "")
        // Drop class="MsoNormal" và mso-* style
        .replace(/\s+class="?Mso[^"\s>]*"?/gi, "")
        .replace(/style="[^"]*mso-[^"]*"/gi, "")
        // Strip Word's <body>/html wrappers nhưng giữ inner
        .replace(/<\/?html[^>]*>/gi, "")
        .replace(/<\/?body[^>]*>/gi, "")
        .replace(/<\/?head[^>]*>/gi, "")
        .replace(/<meta[^>]*>/gi, "")
        .replace(/<link[^>]*>/gi, "")
        .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "");
    } else {
      // Plain text → preserve newlines as <br>
      toInsert = plain.replace(/\n/g, "<br>");
    }
    document.execCommand("insertHTML", false, toInsert);
  };

  const handleInput = () => {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  };

  return (
    <div
      ref={(el) => {
        ref.current = el;
        if (el && !initialized.current) {
          el.innerHTML = value || "";
          initialized.current = true;
        }
      }}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onPaste={handlePaste}
      onInput={handleInput}
      style={{
        minHeight: 80,
        padding: "8px 10px",
        border: `1px solid ${THEME.border}`,
        borderRadius: 4,
        fontSize: 13,
        outline: "none",
        background: "#fff",
        lineHeight: 1.5,
      }}
    />
  );
}

/**
 * Field nhập URL ảnh + nút upload từ máy (yc tester 2026-05-06).
 * Khi user chọn file → uploadDocumentFormData → set URL trả về.
 */
function ImageUploadField({
  value,
  onChange,
  placeholder,
  preview = true,
  accept = "image/*",
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder: string;
  preview?: boolean;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    uploadDocumentFormData(
      f,
      (data: any) => {
        const url = data?.fileUrl ?? data?.url;
        if (url) onChange(url);
        else showToast("Upload OK nhưng không có URL trả về", "error");
        setUploading(false);
      },
      () => {
        showToast("Upload thất bại", "error");
        setUploading(false);
      },
    );
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", gap: 4 }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...input, flex: 1 }}
        />
        <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={handlePick} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: "0 10px",
            fontSize: 11,
            background: uploading ? THEME.border : THEME.primarySoft,
            color: THEME.primaryDark,
            border: `1px solid ${THEME.primary}`,
            borderRadius: 4,
            cursor: uploading ? "wait" : "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
          title="Upload ảnh từ máy"
        >
          {uploading ? "..." : "📎 Upload"}
        </button>
      </div>
      {preview && value && (
        <img src={value} alt="" style={{ maxWidth: "100%", maxHeight: 160, objectFit: "contain", borderRadius: 4 }} />
      )}
    </div>
  );
}

const input: React.CSSProperties = {
  padding: "6px 8px",
  border: `1px solid ${THEME.border}`,
  borderRadius: 4,
  fontSize: 12,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const ctrlBtn: React.CSSProperties = {
  width: 26,
  height: 26,
  border: `1px solid ${THEME.border}`,
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
  fontSize: 12,
};
