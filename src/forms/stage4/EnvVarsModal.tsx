import { useState } from "react";
import { Modal, Field, Input, Segmented } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Env = "dev" | "staging" | "prod";

interface Var {
  key: string;
  value: string;
  secret: boolean;
}

const INIT: Record<Env, Var[]> = {
  dev: [
    { key: "NEXT_PUBLIC_API_URL", value: "http://localhost:8080", secret: false },
    { key: "DATABASE_URL", value: "postgres://localhost/megamart_dev", secret: true },
    { key: "SENTRY_DSN", value: "", secret: false },
  ],
  staging: [
    { key: "NEXT_PUBLIC_API_URL", value: "https://api-staging.megamart.reborn.vn", secret: false },
    { key: "DATABASE_URL", value: "***masked***", secret: true },
    { key: "SENTRY_DSN", value: "https://xxx@sentry.io/123", secret: false },
  ],
  prod: [
    { key: "NEXT_PUBLIC_API_URL", value: "https://api.megamart.vn", secret: false },
    { key: "DATABASE_URL", value: "***masked***", secret: true },
    { key: "SENTRY_DSN", value: "https://yyy@sentry.io/456", secret: false },
  ],
};

export default function EnvVarsModal({ open, onClose }: Props) {
  const { showToast } = useApp();
  const [env, setEnv] = useState<Env>("staging");
  const [vars, setVars] = useState(INIT);
  const { submitting, submit } = useFormStub("Đã cập nhật env variables");

  const current = vars[env];

  const update = (i: number, field: "key" | "value" | "secret", v: string | boolean) => {
    setVars((prev) => ({
      ...prev,
      [env]: prev[env].map((x, j) => (j === i ? { ...x, [field]: v } : x)),
    }));
  };

  const add = () => {
    setVars((prev) => ({ ...prev, [env]: [...prev[env], { key: "", value: "", secret: false }] }));
  };

  const remove = (i: number) => {
    setVars((prev) => ({ ...prev, [env]: prev[env].filter((_, j) => j !== i) }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Environment variables"
      kicker="STAGE 4 · ENV"
      sub="Biến theo môi trường. Secret được mask và encrypted at-rest."
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn" onClick={() => showToast("info", "Import .env", "Upload file")}>
            ↑ Import .env
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : `Lưu ${env}`}
          </button>
        </>
      }
    >
      <div style={{ marginBottom: 12 }}>
        <Segmented
          value={env}
          onChange={setEnv}
          options={[
            { value: "dev", label: "Development" },
            { value: "staging", label: "Staging" },
            { value: "prod", label: "Production" },
          ]}
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th style={{ width: "35%" }}>Key</th>
            <th>Value</th>
            <th style={{ width: 80, textAlign: "center" }}>Secret</th>
            <th style={{ width: 60 }}></th>
          </tr>
        </thead>
        <tbody>
          {current.map((v, i) => (
            <tr key={i}>
              <td>
                <Input
                  value={v.key}
                  onChange={(e) => update(i, "key", e.target.value)}
                  placeholder="NEXT_PUBLIC_..."
                  style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
                />
              </td>
              <td>
                <Input
                  type={v.secret ? "password" : "text"}
                  value={v.value}
                  onChange={(e) => update(i, "value", e.target.value)}
                  style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
                />
              </td>
              <td style={{ textAlign: "center" }}>
                <input type="checkbox" checked={v.secret} onChange={(e) => update(i, "secret", e.target.checked)} />
              </td>
              <td>
                <button type="button" className="btn sm danger" onClick={() => remove(i)}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button type="button" className="btn sm" onClick={add}>
          + Thêm biến
        </button>
        {env !== "prod" ? (
          <Field label="">
            <button type="button" className="btn sm" onClick={() => showToast("info", `Copy từ ${env === "dev" ? "staging" : "dev"}`)}>
              ⎘ Copy từ env khác
            </button>
          </Field>
        ) : null}
      </div>
    </Modal>
  );
}
