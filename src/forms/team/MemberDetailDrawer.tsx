import { useState } from "react";
import { Drawer, Field, FieldRow, Input, Select, Chips, ConfirmDialog } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { useFormStub } from "../../hooks/useFormStub";
import { ROLE_LABEL, type Member, type TeamRole } from "../../data/team";

interface Props {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  onSave: (m: Member) => void;
  onDelete: (id: string) => void;
}

export default function MemberDetailDrawer({ open, onClose, member, onSave, onDelete }: Props) {
  const { showToast } = useApp();
  const [role, setRole] = useState<TeamRole>(member?.role ?? "Dev");
  const [skills, setSkills] = useState<string[]>(member?.skills ?? []);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const { submitting, submit } = useFormStub("Đã cập nhật thành viên");

  if (!member) return null;

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={member.name}
        sub={`${ROLE_LABEL[member.role]} · ${member.email}`}
        wide
        footer={
          <>
            <button type="button" className="btn danger" onClick={() => setDeactivateOpen(true)}>
              {member.active ? "Deactivate" : "Xóa"}
            </button>
            <div style={{ flex: 1 }} />
            <button type="button" className="btn" onClick={onClose}>
              Hủy
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={submitting}
              onClick={() =>
                submit(() => {
                  onSave({ ...member, role, skills });
                  onClose();
                })
              }
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: member.color,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            {member.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "var(--slate-500)" }}>Joined {member.joinedAt}</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              Workload: {member.workload}%
              <div className="bar" style={{ marginTop: 4, width: 140 }}>
                <div className="bar-fill" style={{ width: `${member.workload}%` }} />
              </div>
            </div>
          </div>
          <span className={`tag ${member.active ? "tag-ok" : "tag-warn"}`}>{member.active ? "Active" : "Inactive"}</span>
        </div>

        <FieldRow>
          <Field label="Họ tên">
            <Input defaultValue={member.name} />
          </Field>
          <Field label="Email">
            <Input defaultValue={member.email} disabled />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Role">
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as TeamRole)}
              options={Object.entries(ROLE_LABEL).map(([v, l]) => ({ value: v, label: l }))}
            />
          </Field>
          <Field label="Workload limit (%)">
            <Input type="number" defaultValue={member.workload} />
          </Field>
        </FieldRow>
        <Field label="Skills / chuyên môn">
          <Chips value={skills} onChange={setSkills} />
        </Field>
        <Field label="Projects đang tham gia">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {member.projects.length === 0 ? (
              <div className="field-help">Chưa có project nào.</div>
            ) : (
              member.projects.map((p) => (
                <div
                  key={p}
                  style={{
                    padding: 8,
                    background: "var(--slate-50)",
                    borderRadius: 6,
                    fontSize: 12,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{p}</span>
                  <button type="button" className="btn sm" onClick={() => showToast("info", `Remove from ${p}`)}>
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </Field>
      </Drawer>

      <ConfirmDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={() => {
          onDelete(member.id);
          onClose();
          showToast("warn", `Đã ${member.active ? "deactivate" : "xóa"} ${member.name}`);
        }}
        title={member.active ? "Deactivate thành viên?" : "Xóa thành viên?"}
        message={member.active ? "Thành viên sẽ mất access nhưng dữ liệu (audit log, commit) được giữ lại." : "Xóa vĩnh viễn — không thể khôi phục."}
      />
    </>
  );
}
