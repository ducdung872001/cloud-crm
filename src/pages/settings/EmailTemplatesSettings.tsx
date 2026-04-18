import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { Modal, TextField, TextareaField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Template {
  id: string;
  name: string;
  event: string;
  subject: string;
  body: string;
}

const INIT: Template[] = [
  {
    id: "urd-review",
    name: "Gửi URD cho KH review",
    event: "urd.published",
    subject: "[{{project.code}}] URD v{{urd.version}} — Mời review",
    body:
      "Chào {{client.name}},\n\n" +
      "Team Reborn đã sinh URD phiên bản v{{urd.version}} dựa trên buổi họp ngày {{meeting.date}}.\n" +
      "Xem và feedback tại: {{urd.link}}\n\n" +
      "Deadline review: {{deadline}}\n\nReborn Team",
  },
  {
    id: "uat-invite",
    name: "Mời UAT",
    event: "uat.scheduled",
    subject: "[{{project.code}}] Mời UAT — {{uat.date}}",
    body: "Chào {{client.name}},\n\nMời anh/chị UAT sản phẩm...",
  },
  {
    id: "release-note",
    name: "Release note",
    event: "release.published",
    subject: "[{{project.code}}] Release {{release.version}}",
    body: "Bản release mới đã deploy...",
  },
  {
    id: "cr-sign",
    name: "CR chờ ký",
    event: "cr.sign_requested",
    subject: "[{{project.code}}] Yêu cầu thay đổi {{cr.code}} — cần ký duyệt",
    body: "...",
  },
];

const schema = z.object({
  name: v.requiredString("Tên template bắt buộc").max(120, v.msg.max(120)),
  subject: v.requiredString("Subject bắt buộc").max(200, v.msg.max(200)),
  body: v.requiredString("Body bắt buộc").max(10_000, v.msg.max(10_000)),
});
type Values = z.infer<typeof schema>;

export default function EmailTemplatesSettings() {
  const [items, setItems] = useState<Template[]>(INIT);
  const [editing, setEditing] = useState<Template | null>(null);
  const { submitting, submit } = useFormStub("Đã lưu template");

  const form = useZodForm<Values>({
    schema,
    defaultValues: { name: "", subject: "", body: "" },
  });

  useEffect(() => {
    if (editing) {
      form.reset({ name: editing.name, subject: editing.subject, body: editing.body });
    }
  }, [editing, form]);

  const onSave = form.handleSubmit((data) =>
    submit(() => {
      if (editing) {
        setItems((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...data } : t)));
      }
      setEditing(null);
    })
  );

  return (
    <div>
      <div className="settings-section-title">Email templates</div>
      <div className="settings-section-sub">
        Template email gửi KH + team. Biến <code>{"{{var}}"}</code> được thay tự động khi gửi.
      </div>

      <div className="card">
        <div className="file-list">
          {items.map((t) => (
            <div key={t.id} className="file-item" onClick={() => setEditing(t)}>
              <div className="file-ico ico-doc">@</div>
              <div>
                <div className="file-name">{t.name}</div>
                <div className="file-sub">
                  Event: <code>{t.event}</code> · {t.subject}
                </div>
              </div>
              <button type="button" className="btn sm">
                Sửa
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.name ?? ""}
        kicker={`EMAIL · ${editing?.event ?? ""}`}
        size="wide"
        footer={
          <>
            <button type="button" className="btn" onClick={() => setEditing(null)}>
              Hủy
            </button>
            <button type="button" className="btn" onClick={() => setEditing(null)}>
              Preview
            </button>
            <button type="button" className="btn primary" disabled={submitting} onClick={onSave}>
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        }
      >
        <FormProvider {...form}>
          <form onSubmit={onSave} noValidate>
            <TextField<Values> name="name" label="Tên template" required />
            <TextField<Values> name="subject" label="Subject" required help="Có thể dùng biến {{project.code}}, {{client.name}}..." />
            <TextareaField<Values> name="body" label="Body" required mono style={{ minHeight: 200 }} />
            <div
              style={{
                padding: 10,
                background: "var(--slate-50)",
                borderRadius: 8,
                fontSize: 11,
                color: "var(--slate-600)",
              }}
            >
              <strong>Biến có sẵn:</strong> {"{{client.name}}"}, {"{{project.code}}"}, {"{{project.name}}"}, {"{{urd.version}}"}, {"{{urd.link}}"},{" "}
              {"{{meeting.date}}"}, {"{{deadline}}"}
            </div>
            <button type="submit" style={{ display: "none" }} />
          </form>
        </FormProvider>
      </Modal>
    </div>
  );
}
