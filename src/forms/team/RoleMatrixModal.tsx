import { Modal, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import { PERMISSIONS, ROLE_LABEL, ROLE_PERMS, type TeamRole } from "../../data/team";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ROLES: TeamRole[] = ["Admin", "PM", "TechLead", "BA", "SA", "Dev", "QA"];

export default function RoleMatrixModal({ open, onClose }: Props) {
  const { submitting, submit } = useFormStub("Đã lưu role matrix");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Role & Permission matrix"
      kicker="RBAC"
      sub="Tick vào ô để cho phép role được thực hiện action"
      size="xwide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Lưu matrix"}
          </button>
        </>
      }
    >
      <table className="table" style={{ marginTop: 8 }}>
        <thead>
          <tr>
            <th style={{ width: "32%" }}>Permission</th>
            {ROLES.map((r) => (
              <th key={r} style={{ textAlign: "center" }} title={ROLE_LABEL[r]}>
                {r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSIONS.map((p) => (
            <tr key={p.key}>
              <td>
                <div style={{ fontWeight: 500 }}>{p.label}</div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--slate-400)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {p.key}
                </div>
              </td>
              {ROLES.map((r) => (
                <td key={r} style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    defaultChecked={ROLE_PERMS[r]?.includes(p.key)}
                    disabled={r === "Admin"}
                    title={r === "Admin" ? "Admin luôn có toàn quyền" : undefined}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 14, padding: 12, background: "var(--slate-50)", borderRadius: 8, fontSize: 12 }}>
        <Checkbox label="Cho phép custom role bên cạnh 7 role mặc định" />
      </div>
    </Modal>
  );
}
