// MemberListPage — list/search/filter thành viên + view signup requests cần duyệt.
// Yc 5/5 mục 3: dùng để admin tra cứu mã định danh, cấp mã (luồng B), set pwd (luồng C).
//
// Route gợi ý: /ch_members

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { memberStorage } from "./storage";
import type { MemberEntity, MemberSignupRequest } from "./types";

const T = {
  primary: "#1B4D3E",
  primarySoft: "#E6F2EF",
  border: "#E5E7EB",
  bg: "#F9FAFB",
  textMain: "#111827",
  textMuted: "#6B7280",
  danger: "#DC2626",
};

type Tab = "members" | "requests";

/** State cho modal "Duyệt yêu cầu cấp mã" — pattern self-service first login:
 *  Admin chỉ duyệt + cấp memberCode, KHÔNG set password. User sẽ tự đặt pwd
 *  lần đầu qua flow "Quên mật khẩu" (Firebase OTP). Lợi:
 *  - Admin không cần biết pwd → security tốt hơn (không lộ qua chat/SMS).
 *  - Reuse Firebase OTP đã có, không cần wire SMS gateway riêng.
 *  - Admin tab gọn — chỉ duyệt + báo memberCode. */
interface ApproveModalState {
  request: MemberSignupRequest;
  /** Sau khi BE approve, hold result để show memberCode + hướng dẫn cho admin. */
  issued?: { memberCode: string };
  loading: boolean;
  error: string | null;
}

export default function MemberListPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("members");
  const [members, setMembers] = useState<MemberEntity[]>([]);
  const [requests, setRequests] = useState<MemberSignupRequest[]>([]);
  const [keyword, setKeyword] = useState("");
  const [tick, setTick] = useState(0);
  const [approveModal, setApproveModal] = useState<ApproveModalState | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setMembers(memberStorage.list());
      // Admin tab — gọi BE list, fallback LS bên trong storage.
      const reqs = await memberStorage.listRequestsAsync();
      if (alive) setRequests(reqs);
    })();
    return () => { alive = false; };
  }, [tick]);

  const filteredMembers = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.memberCode.includes(q) ||
        (m.masterCode ?? "").includes(q),
    );
  }, [members, keyword]);

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, margin: 0, color: T.textMain }}>👥 Thành viên</h1>
        <button onClick={() => navigate("/ch_events")} style={btnGhost}>← Sự kiện</button>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        <button onClick={() => setTab("members")} style={tabBtn(tab === "members")}>
          Danh sách ({members.length})
        </button>
        <button onClick={() => setTab("requests")} style={tabBtn(tab === "requests")}>
          Yêu cầu cấp mã {pendingRequests.length > 0 && <span style={{ background: T.danger, color: "#fff", padding: "1px 6px", borderRadius: 8, fontSize: 11, marginLeft: 4 }}>{pendingRequests.length}</span>}
        </button>
      </div>

      {tab === "members" && (
        <>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên / SĐT / mã (5971-300, master-1)"
            style={{ ...inp, marginBottom: 12, maxWidth: 360 }}
          />
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: T.bg }}>
                <th style={th}>Mã</th>
                <th style={th}>Họ tên</th>
                <th style={th}>SĐT</th>
                <th style={th}>Hạng / Nhóm</th>
                <th style={th}>Trưởng nhóm</th>
                <th style={th}>Mã chức vụ</th>
                <th style={th}>Trạng thái</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr><td colSpan={8} style={{ ...td, textAlign: "center", color: T.textMuted, padding: 24 }}>Chưa có thành viên</td></tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={td}><code style={{ background: "#FEF3C7", padding: "2px 6px", borderRadius: 3 }}>{m.memberCode}</code></td>
                    <td style={td}>{m.fullName}</td>
                    <td style={td}>{m.phone}</td>
                    <td style={td}>Hạng {m.identity.rank} · N{m.identity.groupSeq}</td>
                    <td style={td}>{m.masterCode ?? "—"}</td>
                    <td style={td}>{m.roleCodes.length > 0 ? `${m.roleCodes.length} mã` : "—"}</td>
                    <td style={td}>
                      <span style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 8,
                        background: m.status === "active" ? "#DCFCE7" : "#FEE2E2",
                        color: m.status === "active" ? "#166534" : "#991B1B",
                      }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={td}>
                      <button onClick={() => navigate(`/ch_members/${m.id}`)} style={btnGhostSm}>Xem</button>
                      {!m.passwordSet && (
                        <button
                          onClick={() => {
                            const p = prompt(`Set mật khẩu cho ${m.memberCode}:`);
                            if (p && p.length >= 4) {
                              memberStorage.setPassword(m.id, p);
                              setTick((t) => t + 1);
                              alert(`Đã set mật khẩu. ${m.memberCode} có thể login.`);
                            }
                          }}
                          style={{ ...btnGhostSm, marginLeft: 4, color: T.danger }}
                        >
                          Set pwd
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {tab === "requests" && (
        <div>
          <h3 style={{ fontSize: 14, color: T.textMain }}>Yêu cầu cấp mã thành viên (luồng B)</h3>
          {requests.length === 0 ? (
            <p style={{ fontSize: 13, color: T.textMuted }}>Chưa có yêu cầu nào</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: T.bg }}>
                  <th style={th}>Họ tên</th>
                  <th style={th}>SĐT</th>
                  <th style={th}>Email</th>
                  <th style={th}>Công việc</th>
                  <th style={th}>Trạng thái</th>
                  <th style={th}>Mã đã cấp</th>
                  <th style={th}>Ngày tạo</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={td}>{r.fullName}</td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span>{r.phone}</span>
                        {r.phoneVerified ? (
                          <span
                            title="SĐT đã verify qua Firebase OTP"
                            style={{
                              fontSize: 10, padding: "1px 6px", borderRadius: 10,
                              background: "#DCFCE7", color: "#166534", fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >📱 verified</span>
                        ) : (
                          <span
                            title="Chưa verify SĐT — admin cần gọi điện xác minh"
                            style={{
                              fontSize: 10, padding: "1px 6px", borderRadius: 10,
                              background: "#FEF3C7", color: "#92400E", fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >⚠ chưa verify</span>
                        )}
                      </div>
                    </td>
                    <td style={td}>{r.email ?? "—"}</td>
                    <td style={td}>{r.occupation ?? "—"}</td>
                    <td style={td}>
                      <span style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 8,
                        background: r.status === "approved" ? "#DCFCE7" : r.status === "rejected" ? "#FEE2E2" : "#FEF3C7",
                        color: r.status === "approved" ? "#166534" : r.status === "rejected" ? "#991B1B" : "#92400E",
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={td}>{r.issuedMemberCode ? <code>{r.issuedMemberCode}</code> : "—"}</td>
                    <td style={{ ...td, fontSize: 11 }}>{new Date(r.createdAt).toLocaleString("vi-VN")}</td>
                    <td style={td}>
                      {r.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              setApproveModal({
                                request: r,
                                loading: false,
                                error: null,
                              })
                            }
                            style={{ ...btnGhostSm, color: T.primary }}
                          >
                            ✓ Duyệt
                          </button>
                          <button
                            onClick={async () => {
                              const reason = prompt("Lý do từ chối:");
                              if (!reason) return;
                              try {
                                await memberStorage.rejectRequestAsync(r.id, reason);
                                setTick((t) => t + 1);
                              } catch (e: any) {
                                alert(e?.message || "Từ chối thất bại");
                              }
                            }}
                            style={{ ...btnGhostSm, marginLeft: 4, color: T.danger }}
                          >
                            ✕ Từ chối
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {approveModal && (
        <ApproveRequestModal
          state={approveModal}
          onChange={setApproveModal}
          onDone={() => {
            setApproveModal(null);
            setTick((t) => t + 1);
          }}
        />
      )}
    </div>
  );
}

// ── Modal: Duyệt yêu cầu cấp mã ────────────────────────────────────────────
// Pattern self-service first login (yc anh Lợi 2026-05-12):
//   1) Admin xem info → bấm "Duyệt" → BE sinh memberCode (KHÔNG set pwd).
//   2) Modal hiện memberCode + hướng dẫn admin báo user.
//   3) User tự đặt pwd lần đầu qua "Quên mật khẩu" → Firebase OTP.
//
// Lợi ích: admin không lưu pwd ở Zalo/Excel, reuse OTP flow đã có, security hơn.
function ApproveRequestModal({
  state,
  onChange,
  onDone,
}: {
  state: ApproveModalState;
  onChange: (s: ApproveModalState) => void;
  onDone: () => void;
}) {
  const { request: r, issued, loading, error } = state;

  const handleApprove = async () => {
    onChange({ ...state, loading: true, error: null });
    try {
      const member = await memberStorage.approveRequestAsync(r.id);
      if (!member) {
        onChange({ ...state, loading: false, error: "Duyệt thất bại — không nhận được member info" });
        return;
      }
      onChange({ ...state, loading: false, issued: { memberCode: member.memberCode } });
    } catch (e: any) {
      onChange({ ...state, loading: false, error: e?.message || "Có lỗi xảy ra" });
    }
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => { /* silent */ },
      () => alert("Không copy được — trình duyệt chặn clipboard."),
    );
  };

  // Tin nhắn mẫu để admin copy gửi user
  const buildSampleMessage = (memberCode: string) =>
    `Chào ${r.fullName},\n\n` +
    `BTC đã duyệt yêu cầu cấp mã thành viên cho bạn.\n\n` +
    `🆔 Mã thành viên: ${memberCode}\n\n` +
    `Cách đặt mật khẩu lần đầu:\n` +
    `1. Vào https://hub.reborn.vn\n` +
    `2. Bấm "Đăng nhập"\n` +
    `3. Bấm "Quên mật khẩu?"\n` +
    `4. Nhập mã ${memberCode} + SĐT ${r.phone}\n` +
    `5. Nhận OTP qua SMS → đặt mật khẩu mới\n\n` +
    `Sau đó dùng mã + mật khẩu vừa đặt để đăng nhập.\n` +
    `Trân trọng.`;

  return (
    <div
      onClick={onDone}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 10, padding: 20, width: 520, maxWidth: "100%",
          maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        {!issued ? (
          <>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, color: T.textMain }}>Duyệt yêu cầu cấp mã</h3>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>
              BE sẽ tạo Member entity + sinh <code>memberCode</code> dạng <code>STT-nhóm</code>.
              <b> Không cần đặt mật khẩu</b> — user sẽ tự đặt lần đầu qua "Quên mật khẩu" (Firebase OTP).
            </div>

            <div style={{ background: T.bg, borderRadius: 6, padding: 10, marginBottom: 12, fontSize: 13 }}>
              <Row label="Họ tên" value={r.fullName} />
              <Row label="SĐT" value={r.phone} />
              <Row label="Email" value={r.email ?? "—"} />
              <Row label="Công việc" value={r.occupation ?? "—"} />
              <Row
                label="SĐT verify"
                value={r.phoneVerified ? "✅ Đã verify qua Firebase OTP" : "⚠ Chưa verify — gọi điện xác minh trước khi duyệt"}
              />
            </div>

            {error && (
              <div style={{ fontSize: 12, color: T.danger, marginBottom: 12 }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={onDone} disabled={loading} style={btnGhost}>Huỷ</button>
              <button
                onClick={handleApprove}
                disabled={loading}
                style={{
                  padding: "8px 16px", background: T.primary, color: "#fff",
                  border: "none", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Đang duyệt..." : "✓ Duyệt và cấp memberCode"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 36 }}>🎉</div>
              <h3 style={{ margin: "6px 0 4px", fontSize: 18, color: T.textMain }}>Đã cấp memberCode</h3>
              <div style={{ fontSize: 12, color: T.textMuted }}>
                Báo <b>{r.fullName}</b> ({r.phone}) mã + hướng dẫn đặt mật khẩu lần đầu:
              </div>
            </div>

            <div style={{ background: "#F0FDF4", border: `1px solid #BBF7D0`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <CredentialRow label="Mã thành viên" value={issued.memberCode} mono onCopy={copy} />
            </div>

            <div style={{
              background: "#FEF9C3", border: "1px solid #FDE047", borderRadius: 8, padding: 12, marginBottom: 12,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#854D0E", marginBottom: 4 }}>
                📋 Hướng dẫn user đặt mật khẩu lần đầu
              </div>
              <ol style={{ fontSize: 12, color: "#713F12", margin: "4px 0 0 18px", padding: 0, lineHeight: 1.6 }}>
                <li>Vào <code>hub.reborn.vn</code></li>
                <li>Bấm "Đăng nhập" → "Quên mật khẩu?"</li>
                <li>Nhập mã <code>{issued.memberCode}</code> + SĐT <code>{r.phone}</code></li>
                <li>Nhận OTP qua SMS → đặt mật khẩu mới</li>
                <li>Dùng mã + mật khẩu vừa đặt để đăng nhập</li>
              </ol>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textMain, marginBottom: 6 }}>
                Tin nhắn mẫu cho user
              </div>
              <textarea
                readOnly
                value={buildSampleMessage(issued.memberCode)}
                style={{
                  width: "100%", minHeight: 120, padding: 10, fontSize: 12, fontFamily: "inherit",
                  border: `1px solid ${T.border}`, borderRadius: 6, background: "#FAFAFA",
                  resize: "vertical", boxSizing: "border-box",
                }}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => copy(buildSampleMessage(issued.memberCode))}
                  style={{ ...btnGhostSm, padding: "6px 12px" }}
                >
                  📋 Copy tin nhắn
                </button>
                <StubSendButton icon="💬" label="Gửi qua Zalo" />
                <StubSendButton icon="📱" label="Gửi qua SMS" />
                <StubSendButton icon="📧" label="Gửi qua Email" disabled={!r.email} />
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>
                Tạm thời copy tin nhắn rồi gửi user qua Zalo/SMS thủ công. Auto-send đang phát triển.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={onDone} style={{
                padding: "8px 16px", background: T.primary, color: "#fff",
                border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600,
              }}>
                ✓ Đã gửi cho user / Xong
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "3px 0" }}>
      <span style={{ width: 80, color: T.textMuted, fontSize: 12 }}>{label}:</span>
      <span style={{ flex: 1 }}>{value}</span>
    </div>
  );
}

function CredentialRow({
  label, value, mono, onCopy,
}: { label: string; value: string; mono?: boolean; onCopy: (v: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
      <span style={{ width: 110, color: T.textMuted, fontSize: 12, fontWeight: 600 }}>{label}</span>
      <code style={{
        flex: 1, padding: "4px 8px", background: "#fff", borderRadius: 4,
        border: `1px solid ${T.border}`, fontFamily: mono ? "monospace" : "inherit",
        fontSize: 14, fontWeight: 700, color: "#166534",
      }}>{value}</code>
      <button
        onClick={() => onCopy(value)}
        style={{ ...btnGhostSm, padding: "4px 8px" }}
        title="Copy"
      >
        📋 Copy
      </button>
    </div>
  );
}

function StubSendButton({ icon, label, disabled }: { icon: string; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled
      title={disabled ? "Thiếu thông tin liên hệ" : "Tính năng đang phát triển — sắp có"}
      style={{
        padding: "6px 12px",
        background: "#F3F4F6",
        color: T.textMuted,
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        cursor: "not-allowed",
        fontSize: 12,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        opacity: disabled ? 0.5 : 0.8,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span style={{ fontSize: 9, padding: "1px 5px", background: "#FEF3C7", color: "#92400E", borderRadius: 4, marginLeft: 2 }}>SOON</span>
    </button>
  );
}

const inp: React.CSSProperties = { padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, outline: "none", width: "100%" };
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13 };
const th: React.CSSProperties = { padding: "8px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: T.textMuted, borderBottom: `1px solid ${T.border}` };
const td: React.CSSProperties = { padding: "10px 12px" };
const btnGhost: React.CSSProperties = { padding: "6px 12px", background: "transparent", color: T.primary, border: `1px solid ${T.primary}`, borderRadius: 6, cursor: "pointer", fontSize: 12 };
const btnGhostSm: React.CSSProperties = { padding: "3px 8px", background: "transparent", color: T.primary, border: `1px solid ${T.border}`, borderRadius: 4, cursor: "pointer", fontSize: 11 };
const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: "8px 16px", background: active ? T.primary : "#fff", color: active ? "#fff" : T.textMain,
  border: `1px solid ${active ? T.primary : T.border}`, borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600,
});
