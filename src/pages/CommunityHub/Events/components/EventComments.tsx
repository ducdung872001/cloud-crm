// Bình luận dưới sự kiện. Yc 5/5: kênh CSKH, GIỮ VĨNH VIỄN, không trôi.
//
// Pattern giống PaymentProof: API-first, fallback localStorage. UI:
//  - Public: list comment (gốc + reply 1 cấp), form thêm comment với name/phone
//  - Admin: thêm reply, ẩn (không xoá), duyệt (nếu commentsModerated=true)

import React, { useEffect, useMemo, useState } from "react";
import type { EventComment, CommentAuthorRole } from "../types";
import { THEME } from "../shared";

const KEY_COMMENTS = "reborn.community_hub.event_comments";

function readLS<T>(k: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const r = window.localStorage.getItem(k); return r ? JSON.parse(r) as T : fb; } catch { return fb; }
}
function writeLS<T>(k: string, v: T): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* */ }
}

function genId(): string {
  return `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const eventCommentsStorage = {
  list(eventId: string, opts?: { includeHidden?: boolean; status?: EventComment["status"] }): EventComment[] {
    const all = readLS<EventComment[]>(KEY_COMMENTS, []);
    let filt = all.filter((c) => c.eventId === eventId);
    if (!opts?.includeHidden) filt = filt.filter((c) => !c.isHidden);
    if (opts?.status) filt = filt.filter((c) => (c.status ?? "approved") === opts.status);
    return filt.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  },

  add(input: Omit<EventComment, "id" | "createdAt">): EventComment {
    const c: EventComment = {
      ...input,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    const all = readLS<EventComment[]>(KEY_COMMENTS, []);
    all.push(c);
    writeLS(KEY_COMMENTS, all);
    return c;
  },

  patch(id: string, patch: Partial<EventComment>): EventComment | null {
    const all = readLS<EventComment[]>(KEY_COMMENTS, []);
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return null;
    all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    writeLS(KEY_COMMENTS, all);
    return all[idx];
  },

  hide(id: string, by: string, reason?: string): EventComment | null {
    return this.patch(id, { isHidden: true, hiddenReason: reason, reviewedBy: by, reviewedAt: new Date().toISOString() });
  },

  unhide(id: string): EventComment | null {
    return this.patch(id, { isHidden: false, hiddenReason: undefined });
  },

  approve(id: string, by: string): EventComment | null {
    return this.patch(id, { status: "approved", reviewedBy: by, reviewedAt: new Date().toISOString() });
  },

  reject(id: string, by: string): EventComment | null {
    return this.patch(id, { status: "rejected", reviewedBy: by, reviewedAt: new Date().toISOString() });
  },
};

// ── UI ────────────────────────────────────────────────────────────────────
interface Props {
  eventId: string;
  /** Có cho user thêm comment không. Public portal = true, embedded admin tab có thể tắt. */
  canPost?: boolean;
  /** Hiển thị admin controls (ẩn / duyệt / reply with admin role). */
  isAdmin?: boolean;
  /** Bắt admin duyệt trước khi public. */
  moderated?: boolean;
  /** Tên / role mặc định khi post (vd admin đang login). */
  defaultAuthor?: { name: string; phone?: string; role: CommentAuthorRole; memberCode?: string };
}

export default function EventComments({
  eventId,
  canPost = true,
  isAdmin = false,
  moderated = false,
  defaultAuthor,
}: Props) {
  const [comments, setComments] = useState<EventComment[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    setComments(eventCommentsStorage.list(eventId, { includeHidden: isAdmin }));
  }, [eventId, refreshTick, isAdmin]);

  // Tách comment gốc & reply
  const { roots, repliesByParent } = useMemo(() => {
    const visible = isAdmin ? comments : comments.filter((c) => (c.status ?? "approved") === "approved");
    const r: EventComment[] = [];
    const m: Record<string, EventComment[]> = {};
    for (const c of visible) {
      if (c.parentId) {
        (m[c.parentId] ??= []).push(c);
      } else {
        r.push(c);
      }
    }
    return { roots: r, repliesByParent: m };
  }, [comments, isAdmin]);

  const refresh = () => setRefreshTick((t) => t + 1);

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 18, marginBottom: 12, color: THEME.textMain }}>
        💬 Bình luận ({roots.length})
      </h3>

      {canPost && (
        <CommentForm
          eventId={eventId}
          parentId={undefined}
          defaultAuthor={defaultAuthor}
          moderated={moderated}
          onPosted={refresh}
        />
      )}

      {roots.length === 0 && (
        <p style={{ color: THEME.textMuted, fontSize: 13, padding: "16px 0" }}>
          Chưa có bình luận. Hãy là người đầu tiên.
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        {roots.map((c) => (
          <CommentNode
            key={c.id}
            comment={c}
            replies={repliesByParent[c.id] ?? []}
            isAdmin={isAdmin}
            moderated={moderated}
            defaultAuthor={defaultAuthor}
            onChanged={refresh}
            eventId={eventId}
          />
        ))}
      </div>
    </div>
  );
}

function CommentNode({
  comment, replies, isAdmin, moderated, defaultAuthor, onChanged, eventId,
}: {
  comment: EventComment;
  replies: EventComment[];
  isAdmin: boolean;
  moderated: boolean;
  defaultAuthor?: Props["defaultAuthor"];
  onChanged: () => void;
  eventId: string;
}) {
  const [showReply, setShowReply] = useState(false);
  const isPending = (comment.status ?? "approved") === "pending";

  return (
    <div
      style={{
        padding: 12,
        marginBottom: 10,
        background: comment.isHidden ? "#F5F5F5" : "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 8,
        opacity: comment.isHidden ? 0.6 : 1,
      }}
    >
      <CommentHeader comment={comment} />
      {isPending && !isAdmin && (
        <div style={{ fontSize: 11, color: "#9A6700", marginBottom: 4 }}>⏳ Bình luận đang chờ admin duyệt</div>
      )}
      <div style={{ fontSize: 14, color: "#222", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
        {comment.content}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 6, fontSize: 12 }}>
        <button type="button" onClick={() => setShowReply((s) => !s)} style={linkBtn}>
          {showReply ? "Hủy" : "Trả lời"}
        </button>
        {isAdmin && (
          <>
            {comment.isHidden ? (
              <button type="button" onClick={() => { eventCommentsStorage.unhide(comment.id); onChanged(); }} style={linkBtn}>
                Hiện lại
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const reason = prompt("Lý do ẩn (optional)");
                  eventCommentsStorage.hide(comment.id, defaultAuthor?.name ?? "admin", reason ?? undefined);
                  onChanged();
                }}
                style={{ ...linkBtn, color: THEME.danger }}
              >
                Ẩn
              </button>
            )}
            {moderated && isPending && (
              <>
                <button type="button" onClick={() => { eventCommentsStorage.approve(comment.id, defaultAuthor?.name ?? "admin"); onChanged(); }} style={{ ...linkBtn, color: THEME.primary }}>
                  ✓ Duyệt
                </button>
                <button type="button" onClick={() => { eventCommentsStorage.reject(comment.id, defaultAuthor?.name ?? "admin"); onChanged(); }} style={{ ...linkBtn, color: THEME.danger }}>
                  ✕ Từ chối
                </button>
              </>
            )}
          </>
        )}
      </div>

      {showReply && (
        <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: `2px solid ${THEME.primarySoft}` }}>
          <CommentForm
            eventId={eventId}
            parentId={comment.id}
            defaultAuthor={defaultAuthor}
            moderated={moderated}
            onPosted={() => { setShowReply(false); onChanged(); }}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div style={{ marginTop: 8, paddingLeft: 16, borderLeft: `2px solid ${THEME.primarySoft}` }}>
          {replies.map((r) => (
            <div key={r.id} style={{ padding: 8, background: "#F8FBFA", border: `1px solid ${THEME.border}`, borderRadius: 6, marginBottom: 6 }}>
              <CommentHeader comment={r} />
              <div style={{ fontSize: 13, color: "#222", whiteSpace: "pre-wrap" }}>{r.content}</div>
              {isAdmin && !r.isHidden && (
                <button
                  type="button"
                  onClick={() => {
                    const reason = prompt("Lý do ẩn (optional)");
                    eventCommentsStorage.hide(r.id, defaultAuthor?.name ?? "admin", reason ?? undefined);
                    onChanged();
                  }}
                  style={{ ...linkBtn, color: THEME.danger, fontSize: 11, marginTop: 4 }}
                >
                  Ẩn
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentHeader({ comment }: { comment: EventComment }) {
  const roleLabel: Record<CommentAuthorRole, string> = {
    guest: "Khách",
    member: "Thành viên",
    admin: "Admin",
    moderator: "Mod",
  };
  const badgeColor: Record<CommentAuthorRole, string> = {
    guest: "#94A3B8",
    member: "#0EA5E9",
    admin: "#16A34A",
    moderator: "#D97706",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
      <strong style={{ fontSize: 13, color: "#1B4D3E" }}>{comment.authorName}</strong>
      {comment.authorMemberCode && (
        <code style={{ fontSize: 11, background: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: 3 }}>
          {comment.authorMemberCode}
        </code>
      )}
      <span
        style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: badgeColor[comment.authorRole], color: "#fff" }}
      >
        {roleLabel[comment.authorRole]}
      </span>
      <span style={{ fontSize: 11, color: "#94A3B8" }}>
        {formatRelativeTime(comment.createdAt)}
      </span>
      {comment.isHidden && (
        <span style={{ fontSize: 11, color: "#DC2626", fontStyle: "italic" }}>(đã ẩn)</span>
      )}
    </div>
  );
}

function CommentForm({
  eventId, parentId, defaultAuthor, moderated, onPosted,
}: {
  eventId: string;
  parentId?: string;
  defaultAuthor?: Props["defaultAuthor"];
  moderated: boolean;
  onPosted: () => void;
}) {
  const [name, setName] = useState(defaultAuthor?.name ?? "");
  const [phone, setPhone] = useState(defaultAuthor?.phone ?? "");
  const [content, setContent] = useState("");
  const role: CommentAuthorRole = defaultAuthor?.role ?? "guest";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    eventCommentsStorage.add({
      eventId,
      parentId,
      authorName: name.trim(),
      authorPhone: phone.trim() || undefined,
      authorMemberCode: defaultAuthor?.memberCode,
      authorRole: role,
      content: content.trim(),
      status: moderated && role === "guest" ? "pending" : "approved",
    });
    setContent("");
    onPosted();
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 6, padding: 8, background: "#F8FBFA", borderRadius: 6 }}>
      {!defaultAuthor?.name && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên bạn *" required style={inp} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="SĐT (để admin liên hệ lại)" style={inp} />
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Trả lời..." : "Viết bình luận hoặc câu hỏi..."}
        rows={2}
        required
        style={{ ...inp, resize: "vertical" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {moderated && role === "guest" && (
          <span style={{ fontSize: 11, color: "#9A6700" }}>⏳ Cần admin duyệt</span>
        )}
        <button
          type="submit"
          disabled={!name.trim() || !content.trim()}
          style={{
            padding: "6px 14px",
            background: THEME.primary,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            marginLeft: "auto",
          }}
        >
          {parentId ? "Trả lời" : "Gửi bình luận"}
        </button>
      </div>
    </form>
  );
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = (now - d) / 1000;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

const inp: React.CSSProperties = {
  padding: "6px 8px",
  border: `1px solid ${THEME.border}`,
  borderRadius: 4,
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: THEME.primary,
  cursor: "pointer",
  padding: 0,
  fontSize: 12,
  fontWeight: 500,
};
