import { useEffect, useRef, useState } from "react";
import { Modal } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

function format(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function RecordAudioModal({ open, onClose }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "paused" | "done">("idle");
  const [sec, setSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { submitting, submit } = useFormStub("Đã lưu bản ghi", "Gửi sang Whisper...");

  useEffect(() => {
    if (state === "recording") {
      timerRef.current = setInterval(() => setSec((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  useEffect(() => {
    if (!open) {
      setState("idle");
      setSec(0);
    }
  }, [open]);

  const main =
    state === "idle" ? (
      <button
        type="button"
        className="btn ai"
        style={{ width: "100%", justifyContent: "center", padding: "16px 0" }}
        onClick={() => setState("recording")}
      >
        ● Bắt đầu ghi
      </button>
    ) : state === "recording" || state === "paused" ? (
      <>
        <div
          style={{
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontSize: 42,
            fontWeight: 600,
            color: state === "recording" ? "var(--rose-500)" : "var(--slate-500)",
            marginBottom: 14,
          }}
        >
          {state === "recording" ? "● " : "❚❚ "}
          {format(sec)}
        </div>

        <div className="waveform" style={{ marginBottom: 16 }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              style={{
                animationDelay: `${(i * 0.03) % 1}s`,
                animationPlayState: state === "paused" ? "paused" : "running",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {state === "recording" ? (
            <button type="button" className="btn" onClick={() => setState("paused")}>
              ❚❚ Pause
            </button>
          ) : (
            <button type="button" className="btn" onClick={() => setState("recording")}>
              ▶ Tiếp tục
            </button>
          )}
          <button type="button" className="btn danger" onClick={() => setState("done")}>
            ■ Dừng
          </button>
        </div>
      </>
    ) : (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, marginBottom: 8 }}>Đã ghi {format(sec)}</div>
        <div className="field-help" style={{ marginBottom: 14 }}>
          Click Lưu để gửi sang Whisper bóc tách
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setState("idle");
              setSec(0);
            }}
          >
            Ghi lại
          </button>
        </div>
      </div>
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ghi meeting trực tiếp"
      kicker="STAGE 1 · RECORD"
      sub="Dùng mic trình duyệt — ghi + upload tự động"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={state !== "done" || submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Lưu & xử lý"}
          </button>
        </>
      }
    >
      {main}
    </Modal>
  );
}
