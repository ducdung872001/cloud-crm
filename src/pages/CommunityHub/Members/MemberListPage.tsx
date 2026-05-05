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

export default function MemberListPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("members");
  const [members, setMembers] = useState<MemberEntity[]>([]);
  const [requests, setRequests] = useState<MemberSignupRequest[]>([]);
  const [keyword, setKeyword] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMembers(memberStorage.list());
    setRequests(memberStorage.listRequests());
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
                            onClick={() => {
                              const m = memberStorage.approveRequest(r.id, "admin");
                              if (m) {
                                alert(`Đã cấp mã ${m.memberCode} cho ${r.fullName}`);
                                setTick((t) => t + 1);
                              }
                            }}
                            style={{ ...btnGhostSm, color: T.primary }}
                          >
                            ✓ Duyệt
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Lý do từ chối:");
                              if (reason) {
                                memberStorage.rejectRequest(r.id, "admin", reason);
                                setTick((t) => t + 1);
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
    </div>
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
