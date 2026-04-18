import { useEffect, useRef, useState } from "react";
import { ConfirmDialog, Modal, Field, Select } from "../../components/ui";
import EditProjectModal from "./EditProjectModal";
import ProjectSettingsModal from "./ProjectSettingsModal";
import DuplicateProjectModal from "./DuplicateProjectModal";
import { useApp } from "../../context/AppContext";
import { useFormStub } from "../../hooks/useFormStub";
import { MEMBERS } from "../../data/team";
import type { Project } from "../../data/projects";

interface Props {
  project: Project;
}

export default function ProjectActionsMenu({ project }: Props) {
  const { showToast } = useApp();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dupeOpen, setDupeOpen] = useState(false);
  const [archOpen, setArchOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [newPm, setNewPm] = useState(MEMBERS[2].id);
  const { submitting, submit } = useFormStub("Đã chuyển ownership");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <div style={{ position: "relative" }} ref={ref}>
        <button type="button" className="btn sm" onClick={() => setOpen((v) => !v)} title="Actions">
          ⋮
        </button>
        {open ? (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 34,
              background: "#fff",
              border: "1px solid var(--slate-200)",
              borderRadius: 10,
              boxShadow: "var(--shadow-lg)",
              minWidth: 220,
              padding: 6,
              zIndex: 900,
            }}
          >
            {[
              { label: "Sửa thông tin", fn: () => setEditOpen(true) },
              { label: "Settings project", fn: () => setSettingsOpen(true) },
              { label: "Duplicate từ template", fn: () => setDupeOpen(true) },
              { label: "Chuyển PM khác", fn: () => setTransferOpen(true) },
              { label: "─", fn: () => {} },
              { label: "Archive", fn: () => setArchOpen(true), danger: false },
              { label: "Delete vĩnh viễn", fn: () => setDelOpen(true), danger: true },
            ].map((item, i) =>
              item.label === "─" ? (
                <div key={i} style={{ height: 1, background: "var(--slate-100)", margin: "4px 0" }} />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => run(item.fn)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "7px 12px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    borderRadius: 6,
                    color: item.danger ? "var(--rose-500)" : "var(--slate-700)",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--slate-50)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        ) : null}
      </div>

      <EditProjectModal open={editOpen} onClose={() => setEditOpen(false)} project={project} />
      <ProjectSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} project={project} />
      <DuplicateProjectModal open={dupeOpen} onClose={() => setDupeOpen(false)} project={project} />
      <ConfirmDialog
        open={archOpen}
        onClose={() => setArchOpen(false)}
        onConfirm={() => showToast("warn", `Đã archive ${project.name}`, "Khôi phục trong 30 ngày")}
        title="Archive project?"
        message="Project chuyển sang readonly. Team không edit được cho đến khi unarchive."
        kind="warn"
        confirmLabel="Archive"
      />
      <ConfirmDialog
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={() => showToast("warn", `Đã xóa ${project.name}`, "Không khôi phục được")}
        title="Xóa vĩnh viễn?"
        message={`Xóa toàn bộ URD, prototype, commits, deliverables của "${project.name}". Thao tác không hoàn tác.`}
        confirmLabel="Xóa vĩnh viễn"
      />

      <Modal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="Chuyển ownership"
        kicker={`PROJECT · ${project.code}`}
        sub="PM mới sẽ nhận full quyền quản lý project này."
        footer={
          <>
            <button type="button" className="btn" onClick={() => setTransferOpen(false)}>
              Hủy
            </button>
            <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(() => setTransferOpen(false))}>
              {submitting ? "Đang chuyển..." : "Chuyển"}
            </button>
          </>
        }
      >
        <Field label="Chọn PM mới" required>
          <Select
            value={newPm}
            onChange={(e) => setNewPm(e.target.value)}
            options={MEMBERS.filter((m) => m.active && (m.role === "PM" || m.role === "Admin")).map((m) => ({
              value: m.id,
              label: `${m.name} (${m.role})`,
            }))}
          />
        </Field>
      </Modal>
    </>
  );
}
