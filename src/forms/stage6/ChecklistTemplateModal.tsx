import { useState } from "react";
import { Modal, Field, Input, Select } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Item {
  id: string;
  text: string;
  required: boolean;
}

const INIT: Item[] = [
  { id: "1", text: "Smoke test staging env", required: true },
  { id: "2", text: "UX review với design", required: true },
  { id: "3", text: "Cross-browser test (Chrome, Safari, Edge, Firefox)", required: true },
  { id: "4", text: "Mobile responsive — iPhone / Android", required: true },
  { id: "5", text: "Performance audit (Lighthouse ≥ 90)", required: false },
  { id: "6", text: "Security scan OWASP top 10", required: true },
  { id: "7", text: "Accessibility audit (axe-core)", required: false },
  { id: "8", text: "Data migration dry-run", required: false },
];

export default function ChecklistTemplateModal({ open, onClose }: Props) {
  const { showToast } = useApp();
  const [items, setItems] = useState(INIT);
  const { submitting, submit } = useFormStub("Đã lưu template checklist");

  const update = (id: string, field: "text" | "required", v: string | boolean) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, [field]: v } : x)));

  const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

  const add = () => setItems((prev) => [...prev, { id: Date.now().toString(), text: "", required: false }]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="QA Checklist template"
      kicker="STAGE 6 · CHECKLIST"
      sub="Default checklist áp dụng cho mọi project — có thể override per-project"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn" onClick={() => showToast("info", "Import từ template khác")}>
            ↓ Import template
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Lưu template"}
          </button>
        </>
      }
    >
      <Field label="Tên template">
        <Input defaultValue="QA Checklist — Standard" />
      </Field>
      <Field label="Áp dụng cho">
        <Select
          defaultValue="all"
          options={[
            { value: "all", label: "Tất cả project" },
            { value: "web", label: "Web projects" },
            { value: "mobile", label: "Mobile projects" },
            { value: "api", label: "API-only projects" },
          ]}
        />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Items</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: 8,
              alignItems: "center",
              padding: 8,
              background: "var(--slate-50)",
              borderRadius: 6,
            }}
          >
            <Input value={it.text} onChange={(e) => update(it.id, "text", e.target.value)} style={{ background: "#fff" }} />
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "var(--slate-600)",
                cursor: "pointer",
              }}
            >
              <input type="checkbox" checked={it.required} onChange={(e) => update(it.id, "required", e.target.checked)} />
              Required
            </label>
            <button type="button" className="btn sm danger" onClick={() => remove(it.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn sm" style={{ marginTop: 10 }} onClick={add}>
        + Thêm item
      </button>
    </Modal>
  );
}
