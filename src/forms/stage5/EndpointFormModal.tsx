import { useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { CheckboxField, FieldRow, Modal, SelectField, TextField, TextareaField, useZodForm, v } from "../../components/ui";
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

const schema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  path: z
    .string()
    .trim()
    .regex(/^\/[a-zA-Z0-9/_{}:.-]*$/, "Path phải bắt đầu bằng / và chỉ chứa ký tự hợp lệ")
    .min(2, v.msg.min(2))
    .max(200, v.msg.max(200)),
  desc: v.requiredString("Mô tả bắt buộc").max(300, v.msg.max(300)),
  auth: z.string(),
  role: z.string().max(200, v.msg.max(200)),
  params: z.string().max(2000, v.msg.max(2000)),
  responseSchema: z.string().max(4000, v.msg.max(4000)),
  rateLimit: z.boolean(),
  cache: z.boolean(),
  idempotent: z.boolean(),
  auditLog: z.boolean(),
});
type Values = z.infer<typeof schema>;

export default function EndpointFormModal({ open, onClose, endpoint, onSave }: Props) {
  const { submitting, submit } = useFormStub(endpoint ? "Đã cập nhật endpoint" : "Đã thêm endpoint");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      method: "GET",
      path: "",
      desc: "",
      auth: "jwt",
      role: "",
      params: "",
      responseSchema: "",
      rateLimit: true,
      cache: false,
      idempotent: false,
      auditLog: false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        method: (endpoint?.method as Values["method"]) ?? "GET",
        path: endpoint?.path ?? "",
        desc: endpoint?.desc ?? "",
        auth: endpoint?.auth ?? "jwt",
        role: "",
        params: endpoint?.params ?? "",
        responseSchema: endpoint?.responseSchema ?? "",
        rateLimit: true,
        cache: false,
        idempotent: false,
        auditLog: false,
      });
    }
  }, [open, endpoint, form]);

  const onSubmit = form.handleSubmit((data) =>
    submit(() => {
      onSave({
        id: endpoint?.id ?? Date.now().toString(),
        method: data.method,
        path: data.path,
        desc: data.desc,
        auth: data.auth,
        params: data.params,
        responseSchema: data.responseSchema,
        status: endpoint?.status ?? "wip",
      });
      onClose();
    })
  );

  const watchMethod = form.watch("method");
  const watchPath = form.watch("path");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={endpoint ? `${watchMethod} ${watchPath}` : "Thêm API endpoint"}
      kicker="STAGE 5 · API"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Đang lưu..." : "Lưu endpoint"}
          </button>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <FieldRow>
            <SelectField<Values>
              name="method"
              label="Method"
              required
              options={["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => ({ value: m, label: m }))}
            />
            <TextField<Values>
              name="path"
              label="Path"
              required
              help="Dùng {id} cho path param"
              placeholder="/api/v1/screens/{id}"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </FieldRow>
          <TextField<Values> name="desc" label="Mô tả" required placeholder="Lấy chi tiết 1 screen theo ID" />
          <FieldRow>
            <SelectField<Values>
              name="auth"
              label="Authentication"
              options={[
                { value: "public", label: "Public (không cần auth)" },
                { value: "jwt", label: "JWT bearer" },
                { value: "api-key", label: "API key" },
                { value: "oauth", label: "OAuth 2.0" },
                { value: "session", label: "Session cookie" },
              ]}
            />
            <TextField<Values> name="role" label="Required role (RBAC)" placeholder="content-manager,store-ops" />
          </FieldRow>
          <TextareaField<Values>
            name="params"
            label="Parameters (query + body)"
            mono
            style={{ minHeight: 80 }}
            placeholder={`city: string (HN, HCM, DN)\npage: int (default 1)\nsize: int (default 20, max 100)`}
          />
          <TextareaField<Values> name="responseSchema" label="Response schema (JSON)" mono style={{ minHeight: 140 }} />

          <div style={{ fontWeight: 600, fontSize: 13, margin: "10px 0 6px" }}>Non-functional</div>
          <CheckboxField<Values> name="rateLimit" labelText="Rate limit (100 req/phút)" />
          <CheckboxField<Values> name="cache" labelText="Cache response (60s)" />
          <CheckboxField<Values> name="idempotent" labelText="Idempotent (cho POST/PUT)" />
          <CheckboxField<Values> name="auditLog" labelText="Log toàn bộ request/response vào audit" />
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
