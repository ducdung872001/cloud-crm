import { Modal, Toggle, Segmented } from "../../components/ui";
import { useState } from "react";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotifyPrefsModal({ open, onClose }: Props) {
  const [digest, setDigest] = useState<"instant" | "hourly" | "daily" | "off">("instant");
  const { submitting, submit } = useFormStub("Đã lưu preferences");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tùy chọn thông báo cá nhân"
      kicker="COMM · PREFS"
      sub="Tách biệt với rule của workspace. Áp dụng riêng cho tài khoản bạn."
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
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Tần suất digest email</div>
      <Segmented
        value={digest}
        onChange={setDigest}
        options={[
          { value: "instant", label: "Ngay lập tức" },
          { value: "hourly", label: "Gộp mỗi giờ" },
          { value: "daily", label: "Tóm tắt hàng ngày" },
          { value: "off", label: "Tắt" },
        ]}
      />

      <div style={{ fontWeight: 600, fontSize: 13, margin: "16px 0 6px" }}>Kênh nhận</div>
      <Toggle label="In-app notification" defaultChecked />
      <Toggle label="Email" defaultChecked />
      <Toggle label="Slack DM" defaultChecked />
      <Toggle label="Browser push" />
      <Toggle label="Mobile push (yêu cầu cài app)" />
      <Toggle label="SMS" help="Chỉ cho urgent alerts" />

      <div style={{ fontWeight: 600, fontSize: 13, margin: "16px 0 6px" }}>Không làm phiền</div>
      <Toggle label="DND 22:00 — 07:00 (theo timezone cá nhân)" defaultChecked />
      <Toggle label="DND thứ 7, chủ nhật" />
      <Toggle label="Vẫn notify nếu urgent (blocking)" defaultChecked />

      <div style={{ fontWeight: 600, fontSize: 13, margin: "16px 0 6px" }}>Mention</div>
      <Toggle label="Notify khi bị @mention trong comment / feedback" defaultChecked />
      <Toggle label="Notify khi được assign checkpoint / bug" defaultChecked />
      <Toggle label="Notify khi commit/PR được review" />
    </Modal>
  );
}
