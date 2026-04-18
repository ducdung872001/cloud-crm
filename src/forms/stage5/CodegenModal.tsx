import { useState } from "react";
import { Modal, Field, Checkbox, Select, Segmented } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CodegenModal({ open, onClose }: Props) {
  const [from, setFrom] = useState<"schema" | "openapi" | "model">("schema");
  const { submitting, submit } = useFormStub("Đã sinh code", "12 entity, 27 endpoint, 8 service, 14 DTO");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Code generator"
      kicker="STAGE 5 · CODEGEN"
      sub="Sinh entity, service, controller từ schema"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn ai" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang generate..." : "✦ Generate code"}
          </button>
        </>
      }
    >
      <Field label="Generate từ">
        <Segmented
          value={from}
          onChange={setFrom}
          options={[
            { value: "schema", label: "DB Schema → Entity" },
            { value: "openapi", label: "OpenAPI → DTO + Controller" },
            { value: "model", label: "Domain model → Service" },
          ]}
        />
      </Field>

      <Field label="Target language / framework">
        <Select
          defaultValue="java"
          options={[
            { value: "java", label: "Java (JOOQ + Spring)" },
            { value: "kotlin", label: "Kotlin (Ktor / Spring)" },
            { value: "typescript", label: "TypeScript (Prisma / NestJS)" },
            { value: "go", label: "Go (sqlc + Echo)" },
            { value: "python", label: "Python (SQLAlchemy + FastAPI)" },
          ]}
        />
      </Field>

      <Field label="Output directory">
        <Select
          defaultValue="src/main/java/vn/reborn"
          options={[
            { value: "src/main/java/vn/reborn", label: "src/main/java/vn/reborn/" },
            { value: "src/generated", label: "src/generated/ (gitignore)" },
          ]}
        />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Generate gì</div>
      <Checkbox label="Entity / Model class" defaultChecked />
      <Checkbox label="DTO (request + response)" defaultChecked />
      <Checkbox label="Repository / DAO" defaultChecked />
      <Checkbox label="Service layer" defaultChecked />
      <Checkbox label="Controller / REST handler" defaultChecked />
      <Checkbox label="Validator class" defaultChecked />
      <Checkbox label="Unit test (JUnit / Vitest)" defaultChecked />
      <Checkbox label="Integration test (Testcontainers)" />
      <Checkbox label="API documentation (Javadoc / JSDoc)" />

      <div
        style={{
          marginTop: 12,
          padding: 10,
          background: "rgba(20,184,166,0.05)",
          borderRadius: 8,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
        }}
      >
        Ước tính: ~10s · JOOQ gradle + Claude · 18k tokens output
      </div>
    </Modal>
  );
}
