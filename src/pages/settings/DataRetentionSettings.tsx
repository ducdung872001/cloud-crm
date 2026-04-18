import { Field, FieldRow, Input, Select, Toggle } from "../../components/ui";
import { useApp } from "../../context/AppContext";
import { useFormStub } from "../../hooks/useFormStub";

export default function DataRetentionSettings() {
  const { showToast } = useApp();
  const { submitting, submit } = useFormStub("Đã lưu retention policy");

  return (
    <div>
      <div className="settings-section-title">Data retention & GDPR</div>
      <div className="settings-section-sub">Quy tắc lưu trữ dữ liệu, tự động xóa khi hết hạn. Áp dụng sau 24h khi thay đổi.</div>

      <FieldRow>
        <Field label="Audit log (ngày)">
          <Input type="number" defaultValue={365} />
        </Field>
        <Field label="Meeting audio (ngày)" help="Audio gốc — transcript giữ vĩnh viễn">
          <Input type="number" defaultValue={180} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="AI request log (ngày)" help="Input/output LLM để debug">
          <Input type="number" defaultValue={30} />
        </Field>
        <Field label="Archived projects (năm)">
          <Input type="number" defaultValue={7} />
        </Field>
      </FieldRow>

      <div style={{ marginTop: 16, padding: 14, background: "var(--slate-50)", borderRadius: 10 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Privacy</div>
        <Toggle label="Anonymize PII trong transcript tự động" help="Mask tên, số điện thoại, email trong log export" defaultChecked />
        <Toggle label="Cho phép KH request export dữ liệu (GDPR Article 15)" defaultChecked />
        <Toggle label="Cho phép KH request delete (GDPR Article 17)" defaultChecked />
        <Toggle label="Residency: EU-only storage" help="Chỉ áp dụng cho EU clients" />
      </div>

      <FieldRow>
        <Field label="Data processing location">
          <Select
            defaultValue="ap-se-1"
            options={[
              { value: "ap-se-1", label: "Singapore (AWS ap-southeast-1)" },
              { value: "eu-west-1", label: "Ireland (AWS eu-west-1)" },
              { value: "us-east-1", label: "N. Virginia (AWS us-east-1)" },
            ]}
          />
        </Field>
        <Field label="Backup location">
          <Select
            defaultValue="ap-se-3"
            options={[
              { value: "ap-se-3", label: "Jakarta (AWS ap-southeast-3)" },
              { value: "ap-northeast-1", label: "Tokyo (AWS ap-northeast-1)" },
            ]}
          />
        </Field>
      </FieldRow>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="btn primary" disabled={submitting} onClick={() => submit()}>
          {submitting ? "Đang lưu..." : "Lưu policy"}
        </button>
        <button type="button" className="btn" onClick={() => showToast("info", "Export data", "Đang chuẩn bị bundle — email khi sẵn sàng")}>
          ↓ Export toàn bộ dữ liệu
        </button>
      </div>
    </div>
  );
}
