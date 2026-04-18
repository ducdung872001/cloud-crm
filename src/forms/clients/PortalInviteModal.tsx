import { useState } from "react";
import { Modal, Field, Input, Checkbox, Select } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { useFormStub } from "../../hooks/useFormStub";
import type { Client } from "../../data/clients";

interface Props {
  open: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function PortalInviteModal({ open, onClose, client }: Props) {
  const { showToast } = useApp();
  const [expiry, setExpiry] = useState("30");
  const [canSign, setCanSign] = useState(true);
  const [canComment, setCanComment] = useState(true);
  const [canDownload, setCanDownload] = useState(true);
  const { submitting, submit } = useFormStub("Đã gửi invite client portal", "Link có hiệu lực theo thời gian đã chọn");

  if (!client) return null;
  const link = `https://portal.reborn.vn/${client.code.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mời KH truy cập portal"
      kicker={`PORTAL · ${client.code}`}
      sub={`${client.name} sẽ xem được URD, prototype, sign CR / UAT.`}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang gửi..." : "Gửi invite"}
          </button>
        </>
      }
    >
      <Field label="Gửi đến contact" required>
        <Select
          options={client.contacts.map((c) => ({
            value: c.id,
            label: `${c.name} — ${c.email}`,
          }))}
        />
      </Field>
      <Field label="Thời hạn link">
        <Select
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          options={[
            { value: "7", label: "7 ngày" },
            { value: "30", label: "30 ngày" },
            { value: "90", label: "90 ngày" },
            { value: "365", label: "1 năm" },
            { value: "0", label: "Không hết hạn" },
          ]}
        />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Quyền trong portal</div>
      <Checkbox label="Xem URD + prototype" defaultChecked help="Luôn bật, không tắt được" />
      <Checkbox label="Comment / feedback" checked={canComment} onChange={setCanComment} />
      <Checkbox label="Ký CR / UAT điện tử" checked={canSign} onChange={setCanSign} />
      <Checkbox label="Download PDF/docx" checked={canDownload} onChange={setCanDownload} />

      <div
        style={{
          marginTop: 14,
          padding: 12,
          background: "var(--slate-50)",
          borderRadius: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
        }}
      >
        <div className="field-help">Preview link:</div>
        <div style={{ wordBreak: "break-all", marginTop: 4 }}>{link}</div>
        <button
          type="button"
          className="btn sm"
          style={{ marginTop: 8 }}
          onClick={() => showToast("success", "Đã copy link", "Paste vào email/Zalo")}
        >
          ⎘ Copy link
        </button>
      </div>

      <Input type="number" style={{ display: "none" }} value={expiry} readOnly />
    </Modal>
  );
}
