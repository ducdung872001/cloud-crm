import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { Modal, SelectField, TextField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Integration {
  id: string;
  name: string;
  ico: string;
  desc: string;
  connected: boolean;
  account?: string;
}

const INIT: Integration[] = [
  { id: "github", name: "GitHub", ico: "🐙", desc: "Commit, PR, issue tracking", connected: true, account: "reborn-jsc" },
  { id: "gitlab", name: "GitLab", ico: "🦊", desc: "Self-hosted repos", connected: false },
  { id: "jira", name: "Jira", ico: "J", desc: "Sync bug + CR", connected: true, account: "reborn.atlassian.net" },
  { id: "slack", name: "Slack", ico: "#", desc: "Thông báo CP + deploy", connected: true, account: "#reborn-forge" },
  { id: "zalo", name: "Zalo OA", ico: "Z", desc: "Chat KH qua OA", connected: false },
  { id: "gmail", name: "Gmail", ico: "✉", desc: "Gửi email URD/UAT", connected: true, account: "noreply@reborn.vn" },
  { id: "gcal", name: "Google Calendar", ico: "📅", desc: "Schedule meeting", connected: true, account: "team@reborn.vn" },
  { id: "notion", name: "Notion", ico: "N", desc: "Embed URD", connected: false },
];

const schema = z.object({
  account: z.string().max(120, v.msg.max(120)),
  token: z.string().min(8, "Token tối thiểu 8 ký tự").max(500, v.msg.max(500)),
  scope: z.string(),
});
type Values = z.infer<typeof schema>;

export default function IntegrationsSettings() {
  const [items, setItems] = useState<Integration[]>(INIT);
  const [configId, setConfigId] = useState<string | null>(null);
  const { submitting, submit } = useFormStub("Đã kết nối tích hợp");

  const form = useZodForm<Values>({
    schema,
    defaultValues: { account: "", token: "", scope: "rw" },
  });

  const current = items.find((i) => i.id === configId);

  useEffect(() => {
    if (configId) {
      form.reset({ account: current?.account ?? "", token: "", scope: "rw" });
    }
  }, [configId, current, form]);

  const onConnect = form.handleSubmit((data) =>
    submit(() => {
      setItems((prev) => prev.map((i) => (i.id === configId ? { ...i, connected: true, account: data.account } : i)));
      form.reset();
      setConfigId(null);
    })
  );

  const onDisconnect = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, connected: false, account: undefined } : i)));
  };

  return (
    <div>
      <div className="settings-section-title">Integrations</div>
      <div className="settings-section-sub">Kết nối Reborn Forge với các công cụ team đang dùng. OAuth khi có sẵn, còn lại dùng token.</div>

      <div className="grid-3">
        {items.map((i) => (
          <div key={i.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "var(--slate-100)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {i.ico}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{i.name}</div>
                <div style={{ fontSize: 11, color: "var(--slate-500)" }}>{i.desc}</div>
              </div>
              {i.connected ? <span className="tag tag-ok">✓ connected</span> : null}
            </div>
            {i.connected ? (
              <>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--slate-600)",
                    marginBottom: 10,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {i.account}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" className="btn sm" onClick={() => setConfigId(i.id)} style={{ flex: 1, justifyContent: "center" }}>
                    Cấu hình
                  </button>
                  <button type="button" className="btn sm danger" onClick={() => onDisconnect(i.id)}>
                    Ngắt
                  </button>
                </div>
              </>
            ) : (
              <button type="button" className="btn sm primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setConfigId(i.id)}>
                Kết nối
              </button>
            )}
          </div>
        ))}
      </div>

      <Modal
        open={!!configId}
        onClose={() => setConfigId(null)}
        title={`Kết nối ${current?.name ?? ""}`}
        kicker="INTEGRATION"
        footer={
          <>
            <button type="button" className="btn" onClick={() => setConfigId(null)}>
              Hủy
            </button>
            <button type="button" className="btn primary" disabled={submitting} onClick={onConnect}>
              {submitting ? "Đang kết nối..." : current?.connected ? "Cập nhật" : "Kết nối"}
            </button>
          </>
        }
      >
        <FormProvider {...form}>
          <form onSubmit={onConnect} noValidate>
            <TextField<Values>
              name="account"
              label={current?.id === "slack" ? "Channel" : "Account / Workspace"}
              help="Ví dụ: reborn-jsc, team@reborn.vn"
            />
            <TextField<Values> name="token" label="Token / API Key" required type="password" />
            <SelectField<Values>
              name="scope"
              label="Scope / Quyền hạn"
              options={[
                { value: "r", label: "Read only" },
                { value: "rw", label: "Read + Write" },
                { value: "admin", label: "Admin (không khuyến nghị)" },
              ]}
            />
            <button type="submit" style={{ display: "none" }} />
          </form>
        </FormProvider>
      </Modal>
    </div>
  );
}
