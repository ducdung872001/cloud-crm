import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Checkbox } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ShareLinkModal({ open, onClose }: Props) {
  const { showToast } = useApp();
  const [expiry, setExpiry] = useState("30");
  const [password, setPassword] = useState("");
  const [viewLimit, setViewLimit] = useState("0");
  const [requireAuth, setRequireAuth] = useState(false);
  const [canComment, setCanComment] = useState(true);
  const [canDownload, setCanDownload] = useState(false);
  const { submitting, submit } = useFormStub("Đã tạo share link", "Copy sẵn trong clipboard");

  const link = `https://share.forge.reborn.vn/p/megamart-v2-${Math.random().toString(36).slice(2, 10)}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share prototype với KH"
      kicker="STAGE 3 · SHARE"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang tạo..." : "Tạo link + copy"}
          </button>
        </>
      }
    >
      <Field label="Preview link" help="Link hiện tại (sẽ thay sau khi rotate)">
        <div style={{ display: "flex", gap: 6 }}>
          <Input value={link} readOnly style={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
          <button type="button" className="btn" onClick={() => showToast("success", "Đã copy", "Paste vào email / Zalo")}>
            ⎘
          </button>
        </div>
      </Field>

      <FieldRow>
        <Field label="Thời hạn">
          <Select
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            options={[
              { value: "1", label: "1 ngày" },
              { value: "7", label: "7 ngày" },
              { value: "30", label: "30 ngày" },
              { value: "90", label: "90 ngày" },
              { value: "0", label: "Không hết hạn" },
            ]}
          />
        </Field>
        <Field label="Giới hạn views">
          <Input type="number" value={viewLimit} onChange={(e) => setViewLimit(e.target.value)} placeholder="0 = không giới hạn" />
        </Field>
      </FieldRow>
      <Field label="Mật khẩu (tùy chọn)">
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Để trống = không cần mật khẩu" />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Quyền</div>
      <Checkbox label="Yêu cầu login client portal" help="Ai có link cũng xem được nếu tắt" checked={requireAuth} onChange={setRequireAuth} />
      <Checkbox label="Cho phép comment / pin feedback" checked={canComment} onChange={setCanComment} />
      <Checkbox label="Cho phép download HTML / ZIP" checked={canDownload} onChange={setCanDownload} />
      <Checkbox label="Watermark tên KH + timestamp" />
    </Modal>
  );
}
