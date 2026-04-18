import { useState, useEffect } from "react";
import { Modal, Field, FieldRow, Input, Select, Textarea, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

export interface Endpoint {
  id: string;
  method: string;
  path: string;
  desc: string;
  auth: string;
  params: string;
  responseSchema: string;
  status: "ok" | "wip" | "deprecated";
}

interface Props {
  open: boolean;
  onClose: () => void;
  endpoint?: Endpoint | null;
  onSave: (e: Endpoint) => void;
}

export default function EndpointFormModal({ open, onClose, endpoint, onSave }: Props) {
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("");
  const [desc, setDesc] = useState("");
  const [auth, setAuth] = useState("jwt");
  const [params, setParams] = useState("");
  const [schema, setSchema] = useState("");
  const { submitting, submit } = useFormStub(endpoint ? "Đã cập nhật endpoint" : "Đã thêm endpoint");

  useEffect(() => {
    if (open) {
      setMethod(endpoint?.method ?? "GET");
      setPath(endpoint?.path ?? "");
      setDesc(endpoint?.desc ?? "");
      setAuth(endpoint?.auth ?? "jwt");
      setParams(endpoint?.params ?? "");
      setSchema(endpoint?.responseSchema ?? "");
    }
  }, [open, endpoint]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={endpoint ? `${method} ${path}` : "Thêm API endpoint"}
      kicker="STAGE 5 · API"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={submitting || !path || !desc}
            onClick={() =>
              submit(() => {
                onSave({
                  id: endpoint?.id ?? Date.now().toString(),
                  method,
                  path,
                  desc,
                  auth,
                  params,
                  responseSchema: schema,
                  status: endpoint?.status ?? "wip",
                });
                onClose();
              })
            }
          >
            {submitting ? "Đang lưu..." : "Lưu endpoint"}
          </button>
        </>
      }
    >
      <FieldRow>
        <Field label="Method" required>
          <Select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            options={["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => ({
              value: m,
              label: m,
            }))}
          />
        </Field>
        <Field label="Path" required help="Dùng {id} cho path param">
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/api/v1/screens/{id}"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </Field>
      </FieldRow>
      <Field label="Mô tả" required>
        <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Lấy chi tiết 1 screen theo ID" />
      </Field>
      <FieldRow>
        <Field label="Authentication">
          <Select
            value={auth}
            onChange={(e) => setAuth(e.target.value)}
            options={[
              { value: "public", label: "Public (không cần auth)" },
              { value: "jwt", label: "JWT bearer" },
              { value: "api-key", label: "API key" },
              { value: "oauth", label: "OAuth 2.0" },
              { value: "session", label: "Session cookie" },
            ]}
          />
        </Field>
        <Field label="Required role (RBAC)">
          <Input placeholder="content-manager,store-ops" />
        </Field>
      </FieldRow>
      <Field label="Parameters (query + body)">
        <Textarea
          className="mono"
          value={params}
          onChange={(e) => setParams(e.target.value)}
          placeholder={`city: string (HN, HCM, DN)
page: int (default 1)
size: int (default 20, max 100)`}
          style={{ minHeight: 80 }}
        />
      </Field>
      <Field label="Response schema (JSON)">
        <Textarea
          className="mono"
          value={schema}
          onChange={(e) => setSchema(e.target.value)}
          placeholder={`{
  "id": "uuid",
  "code": "SCR-0021",
  "status": "online|offline",
  "branch": { "id": "...", "name": "..." }
}`}
          style={{ minHeight: 140 }}
        />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "10px 0 6px" }}>Non-functional</div>
      <Checkbox label="Rate limit (100 req/phút)" defaultChecked />
      <Checkbox label="Cache response (60s)" />
      <Checkbox label="Idempotent (cho POST/PUT)" />
      <Checkbox label="Log toàn bộ request/response vào audit" />
    </Modal>
  );
}
