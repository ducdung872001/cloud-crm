import { useState } from "react";
import { Modal, Field, Input, Select, Checkbox, ConfirmDialog } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { useFormStub } from "../../hooks/useFormStub";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  lastStatus: number;
}

const EVENTS = [
  "checkpoint.approved",
  "cr.created",
  "cr.signed",
  "urd.published",
  "prototype.regenerated",
  "stage.transitioned",
  "deploy.completed",
  "bug.reported",
  "uat.signed",
];

const INIT: Webhook[] = [
  {
    id: "1",
    url: "https://hooks.reborn.vn/slack",
    events: ["checkpoint.approved", "cr.signed", "deploy.completed"],
    secret: "whsec_****Xk9",
    active: true,
    lastStatus: 200,
  },
  {
    id: "2",
    url: "https://api.reborn.vn/audit",
    events: ["cr.created", "urd.published", "uat.signed"],
    secret: "whsec_****a2D",
    active: true,
    lastStatus: 200,
  },
];

export default function WebhooksSettings() {
  const { showToast } = useApp();
  const [hooks, setHooks] = useState<Webhook[]>(INIT);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Webhook | null>(null);
  const [delId, setDelId] = useState<string | null>(null);

  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const { submitting, submit } = useFormStub("Đã lưu webhook");

  const open = (h: Webhook | null) => {
    setEditing(h);
    setUrl(h?.url ?? "");
    setSelected(h?.events ?? []);
    setEditOpen(true);
  };

  const toggleEvent = (e: string) => setSelected((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));

  const onSave = () =>
    submit(() => {
      if (editing) {
        setHooks((prev) => prev.map((h) => (h.id === editing.id ? { ...h, url, events: selected } : h)));
      } else {
        setHooks((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            url,
            events: selected,
            secret: "whsec_" + Math.random().toString(36).slice(2, 10),
            active: true,
            lastStatus: 0,
          },
        ]);
      }
      setEditOpen(false);
    });

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div>
          <div className="settings-section-title">Webhooks</div>
          <div className="settings-section-sub">POST JSON payload đến endpoint khi có event. Dùng cho custom automation.</div>
        </div>
        <button type="button" className="btn primary" onClick={() => open(null)}>
          + Thêm webhook
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>URL</th>
              <th>Events</th>
              <th>Last</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {hooks.map((h) => (
              <tr key={h.id}>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{h.url}</td>
                <td>
                  <span className="tag tag-info">{h.events.length} events</span>
                </td>
                <td>{h.lastStatus === 200 ? <span className="tag tag-ok">200 OK</span> : <span className="tag tag-warn">Chưa gọi</span>}</td>
                <td>
                  <span className={`tag ${h.active ? "tag-ok" : "tag-warn"}`}>{h.active ? "Active" : "Paused"}</span>
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="btn sm" onClick={() => showToast("info", "Test webhook", "Ping payload đã gửi")}>
                      Test
                    </button>
                    <button type="button" className="btn sm" onClick={() => open(h)}>
                      Sửa
                    </button>
                    <button type="button" className="btn sm danger" onClick={() => setDelId(h.id)}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={editing ? "Sửa webhook" : "Thêm webhook"}
        kicker="WEBHOOK"
        footer={
          <>
            <button type="button" className="btn" onClick={() => setEditOpen(false)}>
              Hủy
            </button>
            <button type="button" className="btn primary" onClick={onSave} disabled={submitting || !url || selected.length === 0}>
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        }
      >
        <Field label="Endpoint URL" required help="HTTPS only">
          <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-server.com/webhook" />
        </Field>
        <Field label="Method">
          <Select
            defaultValue="POST"
            options={[
              { value: "POST", label: "POST application/json" },
              { value: "PUT", label: "PUT application/json" },
            ]}
          />
        </Field>
        <Field label="Events cần subscribe" required>
          <div>
            {EVENTS.map((e) => (
              <Checkbox key={e} label={e} checked={selected.includes(e)} onChange={() => toggleEvent(e)} />
            ))}
          </div>
        </Field>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={() => {
          setHooks((prev) => prev.filter((h) => h.id !== delId));
          showToast("warn", "Đã xóa webhook");
        }}
        title="Xóa webhook?"
      />
    </div>
  );
}
