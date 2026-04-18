import { useState } from "react";
import { Modal, Field, Input, Textarea, Segmented } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Section {
  id: string;
  num: string;
  title: string;
  content: string;
}

const INIT: Section[] = [
  {
    id: "1",
    num: "§ 1",
    title: "Tổng quan hệ thống",
    content: "Hệ thống DOOH cho chuỗi siêu thị Mega Mart, gồm:\n- 118 màn hình 3 thành phố\n- CMS quản lý nội dung...",
  },
  {
    id: "2.1",
    num: "§ 2.1",
    title: "Screen Inventory Management",
    content:
      "Hệ thống cho phép CRUD màn hình với metadata:\n- vị trí (GPS), resolution, orientation\n- store branch, trạng thái online/offline\n- nhóm phân loại (promotion/brand/info)\n- tag theo chiến dịch marketing.",
  },
  {
    id: "3.2",
    num: "§ 3.2",
    title: "Reporting",
    content: "FR-025: Xuất báo cáo định kỳ theo tuần/tháng\n- Format: PDF + Excel\n- Tự động gửi email cho Marketing Lead",
  },
];

export default function UrdEditorModal({ open, onClose }: Props) {
  const [sections, setSections] = useState<Section[]>(INIT);
  const [selected, setSelected] = useState<string>(INIT[0].id);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const { submitting, submit } = useFormStub("Đã lưu URD", "Tạo version v1.3-draft");

  const current = sections.find((s) => s.id === selected);

  const update = (field: "title" | "content", v: string) => {
    if (!current) return;
    setSections((prev) => prev.map((s) => (s.id === current.id ? { ...s, [field]: v } : s)));
  };

  const addSection = () => {
    const id = `new-${Date.now()}`;
    setSections((prev) => [...prev, { id, num: `§ ${prev.length + 1}`, title: "Section mới", content: "" }]);
    setSelected(id);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="URD editor"
      kicker="STAGE 2 · URD v1.3-draft"
      size="xwide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn">
            Publish as draft → KH review
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14, height: 440 }}>
        <aside
          style={{
            background: "var(--slate-50)",
            borderRadius: 8,
            padding: 10,
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s.id)}
                style={{
                  textAlign: "left",
                  background: selected === s.id ? "rgba(20,184,166,0.08)" : "none",
                  color: selected === s.id ? "var(--teal-500)" : "var(--slate-700)",
                  border: "none",
                  padding: "6px 8px",
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: selected === s.id ? 600 : 400,
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--slate-400)",
                  }}
                >
                  {s.num}
                </div>
                {s.title}
              </button>
            ))}
            <button type="button" className="btn sm" style={{ marginTop: 8, justifyContent: "center" }} onClick={addSection}>
              + Section
            </button>
          </div>
        </aside>

        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 11, color: "var(--slate-500)", fontFamily: "var(--font-mono)" }}>{current?.num}</div>
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: "edit", label: "Edit" },
                { value: "preview", label: "Preview" },
              ]}
            />
          </div>

          {mode === "edit" ? (
            <>
              <Field label="Tiêu đề section">
                <Input value={current?.title ?? ""} onChange={(e) => update("title", e.target.value)} />
              </Field>
              <Field label="Nội dung (Markdown)">
                <Textarea
                  className="mono"
                  value={current?.content ?? ""}
                  onChange={(e) => update("content", e.target.value)}
                  style={{ minHeight: 260 }}
                />
              </Field>
            </>
          ) : (
            <div
              style={{
                padding: 16,
                background: "#fff",
                border: "1px solid var(--slate-200)",
                borderRadius: 8,
                overflow: "auto",
                flex: 1,
              }}
            >
              <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>{current?.title}</h3>
              <pre
                style={{
                  fontFamily: "inherit",
                  fontSize: 13,
                  whiteSpace: "pre-wrap",
                  color: "var(--slate-700)",
                }}
              >
                {current?.content}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
