import { useState, useEffect } from "react";
import { Modal, Field, FieldRow, Input, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import type { ClientContact } from "../../data/clients";

interface Props {
  open: boolean;
  onClose: () => void;
  contact?: ClientContact | null;
  onSave: (data: ClientContact) => void;
}

export default function ContactFormModal({ open, onClose, contact, onSave }: Props) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [primary, setPrimary] = useState(false);
  const { submitting, submit } = useFormStub("Đã lưu contact");

  useEffect(() => {
    if (open) {
      setName(contact?.name ?? "");
      setTitle(contact?.title ?? "");
      setEmail(contact?.email ?? "");
      setPhone(contact?.phone ?? "");
      setPrimary(contact?.primary ?? false);
    }
  }, [open, contact]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contact ? "Sửa contact" : "Thêm contact"}
      kicker="CLIENT · CONTACT"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={submitting || !name || !email}
            onClick={() =>
              submit(() => {
                onSave({
                  id: contact?.id ?? Date.now().toString(),
                  name,
                  title,
                  email,
                  phone,
                  primary,
                });
                onClose();
              })
            }
          >
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </>
      }
    >
      <FieldRow>
        <Field label="Họ tên" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Chức danh">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Email" required>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Điện thoại">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
      </FieldRow>
      <Checkbox label="Đặt làm liên hệ chính" help="Email URD, UAT sẽ gửi trực tiếp cho contact này" checked={primary} onChange={setPrimary} />
    </Modal>
  );
}
