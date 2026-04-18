import { Modal, Field, Select, Toggle } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ContractSyncModal({ open, onClose }: Props) {
  const { submitting, submit } = useFormStub("Đã cấu hình sync");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Contract sync FE ↔ BE"
      kicker="STAGE 5 · CONTRACT"
      sub="OpenAPI spec là single source of truth cho cả FE + BE agent"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </>
      }
    >
      <Field label="Chiều sync">
        <Select
          defaultValue="be-to-fe"
          options={[
            { value: "be-to-fe", label: "BE → FE (BE là source of truth)" },
            { value: "fe-to-be", label: "FE → BE (FE mock-driven)" },
            { value: "bidirectional", label: "Bidirectional (tự resolve conflict)" },
          ]}
        />
      </Field>

      <Field label="Tần suất pull">
        <Select
          defaultValue="on-change"
          options={[
            { value: "on-change", label: "On-change (webhook trigger)" },
            { value: "5m", label: "Mỗi 5 phút" },
            { value: "hourly", label: "Mỗi giờ" },
            { value: "manual", label: "Manual only" },
          ]}
        />
      </Field>

      <Field label="FE target format">
        <Select
          defaultValue="ts-types"
          options={[
            { value: "ts-types", label: "TypeScript types (openapi-typescript)" },
            { value: "zod", label: "Zod schemas" },
            { value: "orval", label: "Orval (React Query hooks)" },
            { value: "hey-api", label: "@hey-api/openapi-ts" },
          ]}
        />
      </Field>

      <Field label="BE validation">
        <Select
          defaultValue="jackson"
          options={[
            { value: "jackson", label: "Jackson + Bean Validation (Java)" },
            { value: "zod", label: "Zod (TypeScript)" },
            { value: "pydantic", label: "Pydantic (Python)" },
          ]}
        />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Rules</div>
      <Toggle label="Fail CI khi breaking change trong contract" help="Detect qua swagger-diff" defaultChecked />
      <Toggle label="Auto-PR khi contract đổi" help="Cả FE và BE sẽ nhận PR regenerate code" defaultChecked />
      <Toggle label="Notify Slack khi sync fail" defaultChecked />
      <Toggle label="Cho phép field được deprecate (không xóa ngay)" defaultChecked />
    </Modal>
  );
}
