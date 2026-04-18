import { useState } from "react";
import { Modal, Field, Select, Textarea } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
  testCode?: string;
}

export default function TestExecutionModal({ open, onClose, testCode = "TC-104" }: Props) {
  const [result, setResult] = useState<"pass" | "fail" | "blocked" | "skip">("pass");
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState("");
  const { submitting, submit } = useFormStub("Đã ghi kết quả test");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Ghi kết quả test · ${testCode}`}
      kicker="STAGE 6 · EXECUTION"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Ghi kết quả"}
          </button>
        </>
      }
    >
      <Field label="Kết quả" required>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {(["pass", "fail", "blocked", "skip"] as const).map((r) => {
            const bg = r === "pass" ? "emerald-500" : r === "fail" ? "rose-500" : r === "blocked" ? "amber-500" : "slate-500";
            return (
              <button
                key={r}
                type="button"
                onClick={() => setResult(r)}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: `2px solid ${result === r ? `var(--${bg})` : "var(--slate-200)"}`,
                  background: result === r ? `rgba(var(--${bg}-rgb), 0.05)` : "#fff",
                  color: result === r ? `var(--${bg})` : "var(--slate-700)",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
              >
                {r === "pass" ? "✓ Pass" : r === "fail" ? "✗ Fail" : r === "blocked" ? "⊘ Blocked" : "⏭ Skip"}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Duration (giây)">
        <input
          className="input"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="30"
          style={{ fontFamily: "var(--font-mono)" }}
        />
      </Field>

      <Field label="Ghi chú">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            result === "fail" ? "Bước 3 — sau khi click 'Lưu', hệ thống báo 500 Internal Server Error..." : "Thực thi OK, không có gì bất thường"
          }
        />
      </Field>

      <Field label="Screenshot / recording">
        <div className="upload-zone" style={{ padding: 14 }}>
          <div className="field-help">Kéo thả evidence</div>
        </div>
      </Field>

      {result === "fail" ? (
        <div
          style={{
            padding: 10,
            background: "rgba(225,29,72,0.05)",
            border: "1px solid rgba(225,29,72,0.3)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--rose-500)",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span>⚠</span>
          <div style={{ flex: 1 }}>Test fail — khuyến nghị tạo bug report luôn?</div>
          <button type="button" className="btn sm danger">
            + Tạo bug
          </button>
        </div>
      ) : null}

      <Field label="Tester">
        <Select
          defaultValue="qa-thao"
          options={[
            { value: "qa-thao", label: "Thảo QA" },
            { value: "ai-agent", label: "AI Agent (auto test)" },
          ]}
        />
      </Field>
    </Modal>
  );
}
