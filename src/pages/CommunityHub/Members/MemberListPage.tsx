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

/** Sinh mật khẩu tạm 8 ký tự dễ đọc (loại bỏ 0/O/1/I/l). Admin show cho user
 *  qua điện thoại — user nên đổi sau khi có UI OTP. */
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/** State cho modal "Duyệt + cấp tài khoản". */
interface ApproveModalState {
  request: MemberSignupRequest;
  password: string;
  /** Sau khi BE approve, hold result để show "Mã + mật khẩu" cho admin copy. */
  issued?: { memberCode: string; password: string };
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
                    <td style={td}>{r.phone}</td>
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
                                password: generateTempPassword(),
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

// ── Modal: Duyệt + cấp tài khoản ────────────────────────────────────────────
// Flow 2 bước:
//   1) Admin xem info, đặt mật khẩu tạm (auto-generated, có thể đổi) → bấm "Duyệt".
//      → approveRequestAsync (BE sinh memberCode) → setPasswordAsync (BE bcrypt).
//   2) Hiện màn "Đã cấp" với mã + mật khẩu để admin copy / gọi user.
//      Có 2 button stub "Gửi qua Zalo" / "Gửi qua SMS" — chưa implement, hiện toast.
function ApproveRequestModal({
  state,
  onChange,
  onDone,
}: {
  state: ApproveModalState;
  onChange: (s: ApproveModalState) => void;
  onDone: () => void;
}) {
  const { request: r, password, issued, loading, error } = state;

  const handleApprove = async () => {
    if (!password.trim() || password.length < 6) {
      onChange({ ...state, error: "Mật khẩu tạm phải ít nhất 6 ký tự" });
      return;
    }
    onChange({ ...state, loading: true, error: null });
    try {
      const member = await memberStorage.approveRequestAsync(r.id);
      if (!member) {
        onChange({ ...state, loading: false, error: "Duyệt thất bại — không nhận được member info" });
        return;
      }
      const pwdRes = await memberStorage.setPasswordAsync(member.memberCode, password);
      if (!pwdRes.ok) {
        onChange({
          ...state,
          loading: false,
          error: `Đã cấp mã ${member.memberCode} nhưng đặt mật khẩu thất bại: ${pwdRes.reason}. Vào trang chi tiết để đặt lại.`,
        });
        return;
      }
      onChange({
        ...state,
        loading: false,
        issued: { memberCode: member.memberCode, password },
      });
    } catch (e: any) {
      onChange({ ...state, loading: false, error: e?.message || "Có lỗi xảy ra" });
    }
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => { /* silent — admin tự thấy đã copy */ },
      () => alert("Không copy được — trình duyệt chặn clipboard."),
    );
  };

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
          background: "#fff", borderRadius: 10, padding: 20, width: 480, maxWidth: "100%",
          maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        {!issued ? (
          <>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, color: T.textMain }}>Duyệt yêu cầu cấp mã</h3>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>
              Tạo MemberEntity mới + đặt mật khẩu tạm. Bạn sẽ thấy mã + mật khẩu sau khi duyệt để gọi cho user.
            </div>

            <div style={{ background: T.bg, borderRadius: 6, padding: 10, marginBottom: 12, fontSize: 13 }}>
              <Row label="Họ tên" value={r.fullName} />
              <Row label="SĐT" value={r.phone} />
              <Row label="Email" value={r.email ?? "—"} />
              <Row label="Công việc" value={r.occupation ?? "—"} />
            </div>

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textMain, marginBottom: 4 }}>
              Mật khẩu tạm (admin tự đặt, gọi báo user)
            </label>
            <div style={{ display: "flex", gap: 6, marginBottom: error ? 8 : 14 }}>
              <input
                style={{ ...inp, flex: 1, fontFamily: "monospace" }}
                value={password}
                onChange={(e) => onChange({ ...state, password: e.target.value, error: null })}
              />
              <button
                type="button"
                onClick={() => onChange({ ...state, password: generateTempPassword(), error: null })}
                style={btnGhostSm}
                title="Sinh mật khẩu mới"
              >
                🎲
              </button>
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
                {loading ? "Đang xử lý..." : "✓ Duyệt và cấp tài khoản"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 36 }}>🎉</div>
              <h3 style={{ margin: "6px 0 4px", fontSize: 18, color: T.textMain }}>Đã cấp tài khoản</h3>
              <div style={{ fontSize: 12, color: T.textMuted }}>
                Liên hệ <b>{r.fullName}</b> ({r.phone}) để báo thông tin đăng nhập:
              </div>
            </div>

            <div style={{ background: "#F0FDF4", border: `1px solid #BBF7D0`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <CredentialRow label="Mã thành viên" value={issued.memberCode} mono onCopy={copy} />
              <CredentialRow label="Mật khẩu tạm" value={issued.password} mono onCopy={copy} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textMain, marginBottom: 6 }}>
                Gửi tự động (sắp ra mắt)
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <StubSendButton icon="💬" label="Gửi qua Zalo" />
                <StubSendButton icon="📱" label="Gửi qua SMS" />
                <StubSendButton icon="📧" label="Gửi qua Email" disabled={!r.email} />
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>
                Tạm thời gọi điện trực tiếp cho user để báo. Tính năng gửi tự động đang phát triển.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={onDone} style={{
                padding: "8px 16px", background: T.primary, color: "#fff",
                border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600,
              }}>
                ✓ Đã gọi báo / Xong
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
