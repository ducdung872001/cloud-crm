import { useState } from "react";
import { Modal, Field, Select, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

const STACKS = [
  {
    id: "spring",
    name: "Spring Boot + JOOQ",
    desc: "Java 21 · JOOQ codegen · PostgreSQL · Kafka · Redis",
    popular: true,
  },
  { id: "vertx", name: "Vert.x + Kotlin", desc: "Reactive · Coroutines · PostgreSQL" },
  { id: "nest", name: "NestJS", desc: "Node.js · TypeScript · Prisma · TypeORM" },
  { id: "go", name: "Go + Echo + sqlc", desc: "Go 1.22 · Echo · sqlc · pgx" },
  { id: "fastapi", name: "FastAPI", desc: "Python 3.12 · SQLAlchemy · Alembic" },
];

export default function BackendStackModal({ open, onClose }: Props) {
  const [stack, setStack] = useState("spring");
  const { submitting, submit } = useFormStub("Đã chọn backend stack");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chọn backend stack"
      kicker="STAGE 5 · STACK"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Xác nhận"}
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {STACKS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStack(s.id)}
            style={{
              padding: 14,
              border: `2px solid ${stack === s.id ? "var(--teal-500)" : "var(--slate-200)"}`,
              background: stack === s.id ? "rgba(20,184,166,0.05)" : "#fff",
              borderRadius: 10,
              textAlign: "left",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              {s.name}
              {s.popular ? <span className="tag tag-ok">Popular</span> : null}
            </div>
            <div style={{ fontSize: 11, color: "var(--slate-500)" }}>{s.desc}</div>
          </button>
        ))}
      </div>

      <Field label="Database">
        <Select
          defaultValue="pg"
          options={[
            { value: "pg", label: "PostgreSQL 16" },
            { value: "mysql", label: "MySQL 8" },
            { value: "mongodb", label: "MongoDB" },
            { value: "mssql", label: "SQL Server" },
          ]}
        />
      </Field>
      <Field label="Message broker">
        <Select
          defaultValue="kafka"
          options={[
            { value: "kafka", label: "Apache Kafka" },
            { value: "rabbitmq", label: "RabbitMQ" },
            { value: "redis-streams", label: "Redis Streams" },
            { value: "none", label: "Không dùng" },
          ]}
        />
      </Field>
      <Field label="Cache">
        <Select
          defaultValue="redis"
          options={[
            { value: "redis", label: "Redis" },
            { value: "memcached", label: "Memcached" },
            { value: "none", label: "Không dùng" },
          ]}
        />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Thiết lập sẵn</div>
      <Checkbox label="OpenAPI + Swagger UI" defaultChecked />
      <Checkbox label="JWT auth + RBAC" defaultChecked />
      <Checkbox label="Audit log via event sourcing" />
      <Checkbox label="Dockerfile + docker-compose.yml" defaultChecked />
      <Checkbox label="Helm chart (K8s)" />
      <Checkbox label="Integration test với Testcontainers" defaultChecked />
    </Modal>
  );
}
