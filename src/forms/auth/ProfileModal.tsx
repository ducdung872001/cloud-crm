import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: Props) {
  const [name, setName] = useState("Phan Dũng");
  const [email] = useState("ceo@reborn.vn");
  const [phone, setPhone] = useState("0912 345 678");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [locale, setLocale] = useState("vi-VN");
  const { submitting, submit } = useFormStub("Profile đã cập nhật");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Hồ sơ cá nhân"
      kicker="PROFILE"
      sub="Thông tin hiển thị trong team và audit log"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--teal-400), var(--violet-500))",
            color: "#fff",
            fontWeight: 700,
            fontSize: 22,
            display: "grid",
            placeItems: "center",
          }}
        >
          PD
        </div>
        <div>
          <button type="button" className="btn sm">
            ↑ Upload avatar
          </button>
          <div className="field-help" style={{ marginTop: 4 }}>
            PNG/JPG tối đa 2 MB, khuyến nghị 256×256
          </div>
        </div>
      </div>

      <Field label="Họ tên" required>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <FieldRow>
        <Field label="Email" help="Không đổi được (SSO)">
          <Input value={email} disabled />
        </Field>
        <Field label="Điện thoại">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Timezone">
          <Select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            options={[
              { value: "Asia/Ho_Chi_Minh", label: "Hà Nội (GMT+7)" },
              { value: "Asia/Singapore", label: "Singapore (GMT+8)" },
              { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
              { value: "UTC", label: "UTC" },
            ]}
          />
        </Field>
        <Field label="Ngôn ngữ">
          <Select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            options={[
              { value: "vi-VN", label: "Tiếng Việt" },
              { value: "en-US", label: "English" },
            ]}
          />
        </Field>
      </FieldRow>
    </Modal>
  );
}
