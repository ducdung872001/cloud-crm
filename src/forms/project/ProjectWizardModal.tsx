import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Chips, Checkbox, Segmented } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import { CLIENTS } from "../../data/clients";
import { MEMBERS } from "../../data/team";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4;

const STACKS = [
  { value: "next-shadcn", label: "Next.js 14 + shadcn/ui + Tailwind" },
  { value: "vite-mui", label: "Vite + MUI + React Query" },
  { value: "remix-tailwind", label: "Remix + Tailwind" },
  { value: "svelte-kit", label: "SvelteKit" },
  { value: "custom", label: "Tự chọn (setup thủ công)" },
];

const BACKENDS = [
  { value: "spring", label: "Spring Boot + JOOQ + PostgreSQL" },
  { value: "vertx", label: "Vert.x + Kotlin + PostgreSQL" },
  { value: "nest", label: "NestJS + Prisma" },
  { value: "go", label: "Go + Echo + sqlc" },
  { value: "none", label: "FE-only (không BE riêng)" },
];

export default function ProjectWizardModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [clientId, setClientId] = useState(CLIENTS[0].id);
  const [industry, setIndustry] = useState("Retail");
  const [projectType, setProjectType] = useState<"new" | "rewrite" | "feature">("new");

  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budgetUsd, setBudgetUsd] = useState("5000");
  const [aiBudget, setAiBudget] = useState("500");

  const [feStack, setFeStack] = useState(STACKS[0].value);
  const [beStack, setBeStack] = useState(BACKENDS[0].value);
  const [hostingEnv, setHostingEnv] = useState<"reborn" | "aws" | "gcp" | "azure" | "onprem">("reborn");
  const [repoAuto, setRepoAuto] = useState(true);

  const [team, setTeam] = useState<string[]>([MEMBERS[0].id, MEMBERS[1].id]);
  const [pm, setPm] = useState(MEMBERS[2].id);
  const [techLead, setTechLead] = useState(MEMBERS[4].id);
  const [tags, setTags] = useState<string[]>([]);

  const { submitting, submit } = useFormStub("Đã tạo project", "Workspace sẵn sàng — chuyển vào Stage 1");

  const reset = () => {
    setStep(1);
    setName("");
    setCode("");
  };

  const onCreate = () =>
    submit(() => {
      reset();
      onClose();
    });

  const client = CLIENTS.find((c) => c.id === clientId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Tạo project mới · Bước ${step}/4`}
      kicker="PROJECT WIZARD"
      size="wide"
      footer={
        <>
          {step > 1 ? (
            <button type="button" className="btn" onClick={() => setStep((s) => (s - 1) as Step)}>
              ← Quay lại
            </button>
          ) : (
            <button type="button" className="btn" onClick={onClose}>
              Hủy
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 4 ? (
            <button type="button" className="btn primary" disabled={step === 1 && (!name || !code)} onClick={() => setStep((s) => (s + 1) as Step)}>
              Tiếp theo →
            </button>
          ) : (
            <button type="button" className="btn primary" disabled={submitting} onClick={onCreate}>
              {submitting ? "Đang tạo..." : "Tạo project"}
            </button>
          )}
        </>
      }
    >
      <div className="segmented" style={{ marginBottom: 18 }}>
        {["Cơ bản", "Kế hoạch", "Stack", "Team"].map((lbl, i) => (
          <button key={i} type="button" className={step === i + 1 ? "active" : ""} onClick={() => setStep((i + 1) as Step)}>
            {i + 1}. {lbl}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <>
          <FieldRow>
            <Field label="Tên project" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mega Mart DOOH" autoFocus />
            </Field>
            <Field label="Code" required help="Hiện trên URD, Git repo, Jira">
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="MEGAMART-DOOH-2026" />
            </Field>
          </FieldRow>
          <Field label="Khách hàng" required>
            <Select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              options={CLIENTS.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
            />
          </Field>
          <Field label="Industry / domain">
            <Input value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </Field>
          <Field label="Loại project">
            <Segmented
              value={projectType}
              onChange={setProjectType}
              options={[
                { value: "new", label: "Hoàn toàn mới" },
                { value: "rewrite", label: "Làm lại hệ thống cũ" },
                { value: "feature", label: "Thêm feature hệ thống cũ" },
              ]}
            />
          </Field>
        </>
      ) : step === 2 ? (
        <>
          <FieldRow>
            <Field label="Ngày bắt đầu" required>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="Deadline" required>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Ngân sách dự án (USD)">
              <Input type="number" value={budgetUsd} onChange={(e) => setBudgetUsd(e.target.value)} />
            </Field>
            <Field label="AI budget cap (USD)" help="Giới hạn chi phí LLM cho project">
              <Input type="number" value={aiBudget} onChange={(e) => setAiBudget(e.target.value)} />
            </Field>
          </FieldRow>
          <Field label="Tags">
            <Chips value={tags} onChange={setTags} placeholder="Retail, DOOH, Multi-tenant..." />
          </Field>
        </>
      ) : step === 3 ? (
        <>
          <Field label="Frontend stack">
            <Select value={feStack} onChange={(e) => setFeStack(e.target.value)} options={STACKS} />
          </Field>
          <Field label="Backend stack">
            <Select value={beStack} onChange={(e) => setBeStack(e.target.value)} options={BACKENDS} />
          </Field>
          <Field label="Hosting">
            <Segmented
              value={hostingEnv}
              onChange={setHostingEnv}
              options={[
                { value: "reborn", label: "Reborn Cloud" },
                { value: "aws", label: "AWS" },
                { value: "gcp", label: "GCP" },
                { value: "azure", label: "Azure" },
                { value: "onprem", label: "On-prem KH" },
              ]}
            />
          </Field>
          <Checkbox
            label="Tự động tạo Git repo + CI/CD + môi trường staging"
            help="Skip nếu KH đã có repo sẵn"
            checked={repoAuto}
            onChange={setRepoAuto}
          />
        </>
      ) : (
        <>
          <Field label="Project Manager" required>
            <Select
              value={pm}
              onChange={(e) => setPm(e.target.value)}
              options={MEMBERS.filter((m) => m.active).map((m) => ({
                value: m.id,
                label: `${m.name} (${m.role})`,
              }))}
            />
          </Field>
          <Field label="Tech Lead" required>
            <Select
              value={techLead}
              onChange={(e) => setTechLead(e.target.value)}
              options={MEMBERS.filter((m) => m.active).map((m) => ({
                value: m.id,
                label: `${m.name} (${m.role})`,
              }))}
            />
          </Field>
          <Field label="Team members" help="Click để chọn / bỏ chọn">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MEMBERS.filter((m) => m.active).map((m) => {
                const picked = team.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`filter-chip ${picked ? "active" : ""}`}
                    onClick={() => setTeam((prev) => (prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id]))}
                  >
                    {m.initials} · {m.name} ({m.role})
                  </button>
                );
              })}
            </div>
          </Field>

          <div
            style={{
              marginTop: 14,
              padding: 14,
              background: "rgba(20,184,166,0.05)",
              borderRadius: 10,
              border: "1px solid rgba(20,184,166,0.2)",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Sẵn sàng tạo</div>
            <div style={{ fontSize: 12, color: "var(--slate-700)", lineHeight: 1.8 }}>
              <strong>{name || "[tên project]"}</strong> · {code || "[code]"}
              <br />
              KH: {client?.name} · Budget ${budgetUsd} + AI ${aiBudget}
              <br />
              Stack: {STACKS.find((s) => s.value === feStack)?.label} / {BACKENDS.find((b) => b.value === beStack)?.label}
              <br />
              Team: {team.length} người · PM + TL: 2 người
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
