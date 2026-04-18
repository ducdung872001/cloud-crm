import { Toggle } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

const EVENTS = [
  { key: "cp.assigned", label: "Checkpoint được gán cho tôi" },
  { key: "cp.overdue", label: "Checkpoint của tôi quá hạn" },
  { key: "cr.new", label: "CR mới trong project tôi" },
  { key: "cr.signed", label: "CR đã được KH ký" },
  { key: "feedback.new", label: "KH comment feedback mới" },
  { key: "deploy.failed", label: "Deploy fail" },
  { key: "ai.budget", label: "AI budget cảnh báo" },
  { key: "stage.transition", label: "Project chuyển stage" },
  { key: "uat.signed", label: "UAT đã ký" },
];

const CHANNELS = [
  { key: "inapp", label: "In-app" },
  { key: "email", label: "Email" },
  { key: "slack", label: "Slack" },
  { key: "push", label: "Push" },
];

export default function NotificationsSettings() {
  const { submitting, submit } = useFormStub("Đã lưu notification rules");

  return (
    <div>
      <div className="settings-section-title">Notification rules</div>
      <div className="settings-section-sub">Chọn channel nhận thông báo cho từng loại event. Per-user.</div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Event</th>
              {CHANNELS.map((c) => (
                <th key={c.key} style={{ width: 80, textAlign: "center" }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((e) => (
              <tr key={e.key}>
                <td>{e.label}</td>
                {CHANNELS.map((c) => (
                  <td key={c.key} style={{ textAlign: "center" }}>
                    <Toggle defaultChecked={c.key === "inapp" || c.key === "email"} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16 }}>
        <button type="button" className="btn primary" disabled={submitting} onClick={() => submit()}>
          {submitting ? "Đang lưu..." : "Lưu rules"}
        </button>
      </div>
    </div>
  );
}
