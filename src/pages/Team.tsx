import { useState } from "react";
import InviteMemberModal from "../forms/team/InviteMemberModal";
import MemberDetailDrawer from "../forms/team/MemberDetailDrawer";
import RoleMatrixModal from "../forms/team/RoleMatrixModal";
import { MEMBERS as INITIAL, ROLE_LABEL, type Member } from "../data/team";

export default function Team() {
  const [members, setMembers] = useState<Member[]>(INITIAL);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [detail, setDetail] = useState<Member | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const shown = members.filter((m) => filter === "all" || (filter === "active" ? m.active : !m.active));

  const updateMember = (m: Member) => setMembers((prev) => prev.map((x) => (x.id === m.id ? m : x)));

  const deactivate = (id: string) => setMembers((prev) => prev.map((x) => (x.id === id ? { ...x, active: false, workload: 0 } : x)));

  return (
    <section>
      <div className="hero">
        <div>
          <div className="ribbon">👥 TEAM</div>
          <div className="kicker">Workspace · {members.filter((m) => m.active).length} active</div>
          <h1 className="title">Thành viên team</h1>
          <p className="desc">Danh sách BA, SA, Dev, QA, PM, Tech Lead. Mỗi người có role + permission + workload.</p>
        </div>
        <div className="actions">
          <button type="button" className="btn" onClick={() => setMatrixOpen(true)}>
            ⚙ Role matrix
          </button>
          <button type="button" className="btn primary" onClick={() => setInviteOpen(true)}>
            + Mời thành viên
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="segmented">
          <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            Tất cả ({members.length})
          </button>
          <button type="button" className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>
            Active ({members.filter((m) => m.active).length})
          </button>
          <button type="button" className={filter === "inactive" ? "active" : ""} onClick={() => setFilter("inactive")}>
            Inactive ({members.filter((m) => !m.active).length})
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Thành viên</th>
              <th>Role</th>
              <th>Workload</th>
              <th>Projects</th>
              <th>Skills</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((m) => (
              <tr key={m.id} onClick={() => setDetail(m)} style={{ cursor: "pointer" }}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: m.color,
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {m.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "var(--slate-500)" }}>{m.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="tag tag-info">{ROLE_LABEL[m.role]}</span>
                </td>
                <td style={{ minWidth: 120 }}>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>{m.workload}%</div>
                  <div className="bar">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${m.workload}%`,
                        background: m.workload > 90 ? "linear-gradient(90deg, var(--rose-500), var(--amber-500))" : undefined,
                      }}
                    />
                  </div>
                </td>
                <td>{m.projects.length}</td>
                <td style={{ fontSize: 11 }}>{m.skills.slice(0, 3).join(", ")}</td>
                <td>
                  <span className={`tag ${m.active ? "tag-ok" : "tag-warn"}`}>{m.active ? "Active" : "Inactive"}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetail(m);
                    }}
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <RoleMatrixModal open={matrixOpen} onClose={() => setMatrixOpen(false)} />
      <MemberDetailDrawer open={!!detail} onClose={() => setDetail(null)} member={detail} onSave={updateMember} onDelete={deactivate} />
    </section>
  );
}
