import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { Checkbox, ConfirmDialog, Field, Modal, SelectField, TextField, useZodForm, v } from "../../components/ui";
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

const schema = z.object({
  url: z
    .string()
    .trim()
    .url(v.msg.url)
    .refine((u) => u.startsWith("https://"), "URL phải là HTTPS"),
  method: z.string(),
  events: z.array(z.string()).min(1, "Chọn ít nhất 1 event"),
});
type Values = z.infer<typeof schema>;

export default function WebhooksSettings() {
  const { showToast } = useApp();
  const [hooks, setHooks] = useState<Webhook[]>(INIT);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Webhook | null>(null);
  const [delId, setDelId] = useState<string | null>(null);

  const { submitting, submit } = useFormStub("Đã lưu webhook");
  const form = useZodForm<Values>({
    schema,
    defaultValues: { url: "", method: "POST", events: [] },
  });

  const events = form.watch("events");

  useEffect(() => {
    if (editOpen) {
      form.reset({
        url: editing?.url ?? "",
        method: "POST",
        events: editing?.events ?? [],
      });
    }
  }, [editOpen, editing, form]);

  const open = (h: Webhook | null) => {
    setEditing(h);
    setEditOpen(true);
  };

  const toggleEvent = (e: string) => {
    form.setValue("events", events.includes(e) ? events.filter((x) => x !== e) : [...events, e], { shouldValidate: true });
  };

  const onSave = form.handleSubmit((data) =>
    submit(() => {
      if (editing) {
        setHooks((prev) => prev.map((h) => (h.id === editing.id ? { ...h, url: data.url, events: data.events } : h)));
      } else {
        setHooks((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            url: data.url,
            events: data.events,
            secret: "whsec_" + Math.random().toString(36).slice(2, 10),
            active: true,
            lastStatus: 0,
          },
        ]);
      }
      setEditOpen(false);
    })
  );

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
            <button type="button" className="btn primary" onClick={onSave} disabled={submitting}>
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        }
      >
        <FormProvider {...form}>
          <form onSubmit={onSave} noValidate>
            <TextField<Values> name="url" label="Endpoint URL" required help="HTTPS only" type="url" placeholder="https://your-server.com/webhook" />
            <SelectField<Values>
              name="method"
              label="Method"
              options={[
                { value: "POST", label: "POST application/json" },
                { value: "PUT", label: "PUT application/json" },
              ]}
            />
            <Field
              label={
                <>
                  Events cần subscribe <span className="field-required">*</span>
                </>
              }
              error={form.formState.errors.events?.message as string | undefined}
            >
              <div>
                {EVENTS.map((e) => (
                  <Checkbox key={e} label={e} checked={events.includes(e)} onChange={() => toggleEvent(e)} />
                ))}
              </div>
            </Field>
            <button type="submit" style={{ display: "none" }} />
          </form>
        </FormProvider>
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
