import { useRef, useState, useEffect } from "react";
import { Modal, Field, Input, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  sub?: string;
  docName?: string;
}

export default function SignatureModal({ open, onClose, title = "Ký xác nhận URD", sub, docName = "URD v1.3" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const [name, setName] = useState("");
  const [title2, setTitle2] = useState("");
  const [agree, setAgree] = useState(false);
  const { submitting, submit } = useFormStub("Đã ký thành công", "Chữ ký lưu vào audit log");

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0F172A";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    setHasSig(false);
  }, [open]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSig(true);
  };

  const onUp = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      kicker="LEGAL · E-SIGNATURE"
      sub={sub ?? `Chữ ký được đóng dấu thời gian và lưu bất biến vào audit log.`}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn" onClick={clear}>
            Xóa ký lại
          </button>
          <button type="button" className="btn primary" disabled={submitting || !hasSig || !name || !agree} onClick={() => submit(onClose)}>
            {submitting ? "Đang xác nhận..." : "✓ Xác nhận ký"}
          </button>
        </>
      }
    >
      <div
        style={{
          padding: 10,
          background: "var(--slate-50)",
          borderRadius: 8,
          fontSize: 12,
          marginBottom: 12,
        }}
      >
        <strong>Đang ký:</strong> {docName}
      </div>

      <Field label="Họ tên" required>
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <Field label="Chức danh">
        <Input value={title2} onChange={(e) => setTitle2(e.target.value)} />
      </Field>

      <Field label="Chữ ký tay (dùng chuột / cảm ứng)" required>
        <div
          style={{
            border: "1px dashed var(--slate-300)",
            borderRadius: 8,
            background: "#fff",
            touchAction: "none",
          }}
        >
          <canvas
            ref={canvasRef}
            width={500}
            height={160}
            style={{ display: "block", width: "100%", height: 160, cursor: "crosshair" }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          />
        </div>
      </Field>

      <Checkbox label="Tôi xác nhận đọc và đồng ý nội dung tài liệu trên" checked={agree} onChange={setAgree} />

      <div style={{ fontSize: 11, color: "var(--slate-500)", marginTop: 8 }}>IP / thiết bị / thời gian được ghi lại làm bằng chứng ký điện tử.</div>
    </Modal>
  );
}
