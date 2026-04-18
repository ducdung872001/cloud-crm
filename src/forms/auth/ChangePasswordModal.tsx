import { useState } from "react";
import { Modal, Field, Input } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const { submitting, submit } = useFormStub("Đã đổi mật khẩu", "Các session khác đã bị đăng xuất");

  const err = next && confirm && next !== confirm ? "Mật khẩu không khớp" : undefined;
  const weak = next && next.length < 8 ? "Tối thiểu 8 ký tự" : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Đổi mật khẩu"
      kicker="SECURITY"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={submitting || !!err || !!weak || !current || !next || !confirm}
            onClick={() => submit(onClose)}
          >
            {submitting ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </>
      }
    >
      <Field label="Mật khẩu hiện tại" required>
        <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </Field>
      <Field label="Mật khẩu mới" required error={weak}>
        <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
      </Field>
      <Field label="Nhập lại mật khẩu mới" required error={err}>
        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Field>
    </Modal>
  );
}
