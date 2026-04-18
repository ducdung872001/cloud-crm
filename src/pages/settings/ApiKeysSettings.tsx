import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { ConfirmDialog, Modal, SelectField, TextField, useZodForm, v } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { useFormStub } from "../../hooks/useFormStub";

interface Key {
  id: string;
  provider: string;
  name: string;
  key: string;
  quota: string;
  used: string;
  created: string;
}

const INITIAL: Key[] = [
  {
    id: "1",
    provider: "Anthropic",
    name: "Production — Opus 4.7",
    key: "sk-ant-api03-****7xHq",
    quota: "$5,000 / month",
    used: "$284.50",
    created: "01/04/2026",
  },
  {
    id: "2",
    provider: "OpenAI",
    name: "Whisper transcription",
    key: "sk-proj-****a2D1",
    quota: "$500 / month",
    used: "$42.80",
    created: "15/03/2026",
  },
  {
    id: "3",
    provider: "GitHub",
    name: "Claude Agent PAT",
    key: "ghp_****Xk9r",
    quota: "5000 req/h",
    used: "312 req",
    created: "22/03/2026",
  },
];

const schema = z.object({
  provider: z.string(),
  name: v.requiredString("Tên key bắt buộc").max(80, v.msg.max(80)),
  secret: z.string().min(12, "Secret key tối thiểu 12 ký tự"),
});
type Values = z.infer<typeof schema>;

export default function ApiKeysSettings() {
  const { showToast } = useApp();
  const [keys, setKeys] = useState<Key[]>(INITIAL);
  const [addOpen, setAddOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const { submitting, submit } = useFormStub("Đã thêm API key");
  const form = useZodForm<Values>({
    schema,
    defaultValues: { provider: "Anthropic", name: "", secret: "" },
  });

  const onAdd = form.handleSubmit((data) =>
    submit(() => {
      setKeys((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          provider: data.provider,
          name: data.name,
          key: data.secret.slice(0, 6) + "****" + data.secret.slice(-4),
          quota: "Chưa set",
          used: "—",
          created: new Date().toLocaleDateString("vi-VN"),
        },
      ]);
      form.reset();
      setAddOpen(false);
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
          <div className="settings-section-title">API Keys</div>
          <div className="settings-section-sub">Token gọi LLM provider (Claude/OpenAI), Git và các dịch vụ khác. Mã hóa at-rest.</div>
        </div>
        <button type="button" className="btn primary" onClick={() => setAddOpen(true)}>
          + Thêm key
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Tên</th>
              <th>Key</th>
              <th>Quota</th>
              <th>Đã dùng</th>
              <th>Tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id}>
                <td>
                  <span className="tag tag-info">{k.provider}</span>
                </td>
                <td style={{ fontWeight: 500 }}>{k.name}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{k.key}</td>
                <td>{k.quota}</td>
                <td>{k.used}</td>
                <td>{k.created}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="btn sm" onClick={() => showToast("info", "Rotate key", `Key ${k.name} sẽ được tạo mới`)}>
                      ↻ Rotate
                    </button>
                    <button type="button" className="btn sm danger" onClick={() => setDelId(k.id)}>
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
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Thêm API key"
        kicker="SETTINGS · API"
        footer={
          <>
            <button type="button" className="btn" onClick={() => setAddOpen(false)}>
              Hủy
            </button>
            <button type="button" className="btn primary" onClick={onAdd} disabled={submitting}>
              {submitting ? "Đang thêm..." : "Thêm"}
            </button>
          </>
        }
      >
        <FormProvider {...form}>
          <form onSubmit={onAdd} noValidate>
            <SelectField<Values>
              name="provider"
              label="Provider"
              required
              options={[
                { value: "Anthropic", label: "Anthropic (Claude)" },
                { value: "OpenAI", label: "OpenAI (GPT / Whisper)" },
                { value: "GitHub", label: "GitHub PAT" },
                { value: "GitLab", label: "GitLab Token" },
                { value: "Other", label: "Khác" },
              ]}
            />
            <TextField<Values> name="name" label="Tên key" required help="VD: Production — Opus 4.7" />
            <TextField<Values>
              name="secret"
              label="Secret key"
              required
              help="Giá trị sẽ được mask sau khi lưu — không hiển thị lại"
              type="password"
              placeholder="sk-ant-api03-..."
            />
            <button type="submit" style={{ display: "none" }} />
          </form>
        </FormProvider>
      </Modal>

      <ConfirmDialog
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={() => {
          setKeys((prev) => prev.filter((k) => k.id !== delId));
          showToast("warn", "Đã xóa API key");
        }}
        title="Xóa API key?"
        message="Hệ thống sẽ ngừng sử dụng key này ngay lập tức. Các agent đang chạy có thể fail."
        confirmLabel="Xóa"
      />
    </div>
  );
}
