import { Modal } from "../../components/ui";
import { useApp } from "../../context/AppContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SESSIONS = [
  {
    id: "1",
    device: "MacBook Pro · Chrome 127",
    location: "Hà Nội, VN",
    ip: "117.6.x.x",
    active: "vừa xong",
    current: true,
  },
  {
    id: "2",
    device: "iPhone 15 · Safari",
    location: "Hà Nội, VN",
    ip: "117.6.x.x",
    active: "2 giờ trước",
    current: false,
  },
  {
    id: "3",
    device: "Windows · Edge 126",
    location: "TP.HCM, VN",
    ip: "14.166.x.x",
    active: "3 ngày trước",
    current: false,
  },
];

export default function SessionsModal({ open, onClose }: Props) {
  const { showToast } = useApp();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thiết bị đang đăng nhập"
      kicker="SECURITY · SESSIONS"
      sub="Tổng cộng 3 thiết bị hoạt động"
      size="wide"
    >
      <div className="file-list">
        {SESSIONS.map((s) => (
          <div key={s.id} className="file-item" style={{ cursor: "default" }}>
            <div className="file-ico" style={{ background: "#E0F2FE", color: "#075985" }}>
              {s.device.startsWith("iPhone") ? "📱" : "💻"}
            </div>
            <div>
              <div className="file-name">
                {s.device}
                {s.current ? (
                  <span className="tag tag-ok" style={{ marginLeft: 8 }}>
                    Hiện tại
                  </span>
                ) : null}
              </div>
              <div className="file-sub">
                {s.location} · IP {s.ip} · Hoạt động {s.active}
              </div>
            </div>
            {!s.current ? (
              <button type="button" className="btn sm danger" onClick={() => showToast("warn", "Đã đăng xuất thiết bị", `${s.device} đã bị revoke`)}>
                Revoke
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn danger"
          onClick={() => showToast("warn", "Đã đăng xuất tất cả thiết bị khác", "Chỉ giữ lại phiên hiện tại")}
        >
          Đăng xuất tất cả thiết bị khác
        </button>
      </div>
    </Modal>
  );
}
