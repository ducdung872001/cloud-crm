import { useState } from "react";
import { Modal, Field, Select, Textarea } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
  crCode?: string;
}

type Step = "pm" | "client";

export default function CrApprovalModal({ open, onClose, crCode = "CR-003" }: Props) {
  const [step, setStep] = useState<Step>("pm");
  const [decision, setDecision] = useState<"approve" | "reject" | "request-change">("approve");
  const [note, setNote] = useState("");
  const { submitting, submit } = useFormStub("Đã ký CR");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Duyệt ${crCode}`}
      kicker={step === "pm" ? "CR · PM APPROVAL" : "CR · CLIENT SIGN"}
      sub={step === "pm" ? "PM duyệt nội bộ trước khi gửi KH ký" : "Gửi link portal cho KH ký điện tử"}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          {step === "pm" ? (
            <button
              type="button"
              className="btn primary"
              disabled={submitting}
              onClick={() =>
                submit(() => {
                  if (decision === "approve") setStep("client");
                  else onClose();
                })
              }
            >
              {decision === "approve" ? "Duyệt → gửi KH" : decision === "reject" ? "Reject" : "Request changes"}
            </button>
          ) : (
            <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
              {submitting ? "Đang gửi..." : "Gửi KH ký"}
            </button>
          )}
        </>
      }
    >
      {step === "pm" ? (
        <>
          <div
            style={{
              padding: 14,
              background: "var(--slate-50)",
              borderRadius: 10,
              marginBottom: 14,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Impact tóm tắt</div>
            <div style={{ fontSize: 12, color: "var(--slate-700)", lineHeight: 1.7 }}>
              Type: <strong style={{ color: "var(--amber-500)" }}>MAJOR</strong>
              <br />
              Timeline: +15 ngày · Cost: +$2,400
              <br />
              Stages: FE, BE, QA
            </div>
          </div>

          <Field label="Quyết định PM" required>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {(["approve", "request-change", "reject"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDecision(d)}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: `2px solid ${decision === d ? (d === "approve" ? "var(--emerald-500)" : d === "reject" ? "var(--rose-500)" : "var(--amber-500)") : "var(--slate-200)"}`,
                    background: decision === d ? "var(--slate-50)" : "#fff",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {d === "approve" ? "✓ Approve" : d === "reject" ? "✗ Reject" : "✎ Request change"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Ghi chú / lý do">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                decision === "reject" ? "Lý do từ chối..." : decision === "request-change" ? "Cần KH bổ sung..." : "Ghi chú thêm (tùy chọn)"
              }
            />
          </Field>
        </>
      ) : (
        <>
          <div
            style={{
              padding: 14,
              background: "rgba(20,184,166,0.05)",
              borderRadius: 10,
              marginBottom: 14,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13 }}>✓ PM đã duyệt</div>
            <div style={{ fontSize: 12, color: "var(--slate-600)", marginTop: 4 }}>
              Chi Lan · 18/04 15:10 · "OK thêm multi-language, cần báo timeline chính xác"
            </div>
          </div>

          <Field label="Gửi cho contact">
            <Select
              defaultValue="minh"
              options={[
                { value: "minh", label: "A. Minh (Marketing Director)" },
                { value: "lan", label: "C. Lan (IT Manager)" },
              ]}
            />
          </Field>

          <Field label="Deadline ký">
            <Select
              defaultValue="7"
              options={[
                { value: "3", label: "3 ngày" },
                { value: "7", label: "1 tuần" },
                { value: "14", label: "2 tuần" },
              ]}
            />
          </Field>

          <Field label="Ghi chú gửi kèm">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              defaultValue="Anh Minh vui lòng xem impact analysis đính kèm, ký điện tử trong portal để chính thức áp dụng CR này."
            />
          </Field>
        </>
      )}
    </Modal>
  );
}
