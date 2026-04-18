import { useState } from "react";
import { Modal, Field, FieldRow, Select, Chips } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import { ROLE_LABEL, type TeamRole } from "../../data/team";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({ open, onClose }: Props) {
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<TeamRole>("Dev");
  const [projects, setProjects] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const { submitting, submit } = useFormStub("Đã gửi lời mời", "Invitation email được gửi đến các địa chỉ");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mời thành viên mới"
      kicker="TEAM · INVITE"
      sub="Có thể mời nhiều email cùng lúc. Mỗi người nhận link kích hoạt 7 ngày."
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || emails.length === 0} onClick={() => submit(onClose)}>
            {submitting ? "Đang gửi..." : `Gửi lời mời (${emails.length})`}
          </button>
        </>
      }
    >
      <Field label="Email (Enter để thêm)" required>
        <Chips value={emails} onChange={setEmails} placeholder="email@reborn.vn" />
      </Field>
      <FieldRow>
        <Field label="Role" required>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value as TeamRole)}
            options={Object.entries(ROLE_LABEL).map(([v, l]) => ({ value: v, label: l }))}
          />
        </Field>
        <Field label="Project scope" help="Bỏ trống = toàn tenant">
          <Chips value={projects} onChange={setProjects} placeholder="MEGAMART-DOOH..." />
        </Field>
      </FieldRow>
      <Field label="Tin nhắn kèm theo (tùy chọn)">
        <textarea
          className="textarea"
          placeholder="Chào bạn, mời join workspace Reborn Forge..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Field>
    </Modal>
  );
}
