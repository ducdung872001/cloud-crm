import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { CheckboxField, ChipsField, FieldRow, Modal, SegmentedField, SelectField, TextField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import { CLIENTS } from "../../data/clients";
import { MEMBERS } from "../../data/team";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4;

const schema = z
  .object({
    // Step 1
    name: v.requiredString("Tên project bắt buộc").max(120, v.msg.max(120)),
    code: v.projectCode,
    clientId: v.requiredString("Chọn khách hàng"),
    industry: z.string().max(80, v.msg.max(80)),
    projectType: z.enum(["new", "rewrite", "feature"]),
    // Step 2
    startDate: v.dateSchema,
    deadline: v.dateSchema,
    budgetUsd: v.positiveNumber(10_000_000),
    aiBudget: v.positiveNumber(1_000_000),
    tags: z.array(z.string()),
    // Step 3
    feStack: z.string(),
    beStack: z.string(),
    hostingEnv: z.enum(["reborn", "aws", "gcp", "azure", "onprem"]),
    repoAuto: z.boolean(),
    // Step 4
    team: z.array(z.string()).min(1, "Chọn ít nhất 1 thành viên"),
    pm: v.requiredString("Chọn PM"),
    techLead: v.requiredString("Chọn Tech Lead"),
  })
  .refine((d) => new Date(d.deadline) > new Date(d.startDate), {
    message: "Deadline phải sau ngày bắt đầu",
    path: ["deadline"],
  });

type Values = z.infer<typeof schema>;

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

const STEP_FIELDS: Record<Step, (keyof Values)[]> = {
  1: ["name", "code", "clientId", "industry", "projectType"],
  2: ["startDate", "deadline", "budgetUsd", "aiBudget", "tags"],
  3: ["feStack", "beStack", "hostingEnv", "repoAuto"],
  4: ["team", "pm", "techLead"],
};

export default function ProjectWizardModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const { submitting, submit } = useFormStub("Đã tạo project", "Workspace sẵn sàng — chuyển vào Stage 1");

  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      name: "",
      code: "",
      clientId: CLIENTS[0].id,
      industry: "Retail",
      projectType: "new",
      startDate: "",
      deadline: "",
      budgetUsd: 5000,
      aiBudget: 500,
      tags: [],
      feStack: STACKS[0].value,
      beStack: BACKENDS[0].value,
      hostingEnv: "reborn",
      repoAuto: true,
      team: [MEMBERS[0].id, MEMBERS[1].id],
      pm: MEMBERS[2].id,
      techLead: MEMBERS[4].id,
    },
  });

  const watchTeam = form.watch("team");
  const watchAll = form.watch();

  const nextStep = async () => {
    const ok = await form.trigger(STEP_FIELDS[step]);
    if (ok) setStep((s) => (s + 1) as Step);
  };

  const onCreate = form.handleSubmit(() =>
    submit(() => {
      setStep(1);
      form.reset();
      onClose();
    })
  );

  const toggleTeam = (id: string) => {
    const arr = watchTeam;
    form.setValue("team", arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id], {
      shouldValidate: true,
    });
  };

  const client = CLIENTS.find((c) => c.id === watchAll.clientId);

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
            <button type="button" className="btn primary" onClick={nextStep}>
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
          <button
            key={i}
            type="button"
            className={step === i + 1 ? "active" : ""}
            onClick={async () => {
              if (i + 1 > step) {
                const ok = await form.trigger(STEP_FIELDS[step]);
                if (!ok) return;
              }
              setStep((i + 1) as Step);
            }}
          >
            {i + 1}. {lbl}
          </button>
        ))}
      </div>

      <FormProvider {...form}>
        <form onSubmit={onCreate} noValidate>
          {step === 1 ? (
            <>
              <FieldRow>
                <TextField<Values> name="name" label="Tên project" required placeholder="Mega Mart DOOH" autoFocus />
                <TextField<Values>
                  name="code"
                  label="Code"
                  required
                  help="HOA + số + gạch (VD: MEGAMART-DOOH-2026)"
                  placeholder="MEGAMART-DOOH-2026"
                  style={{ textTransform: "uppercase" }}
                />
              </FieldRow>
              <SelectField<Values>
                name="clientId"
                label="Khách hàng"
                required
                options={CLIENTS.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
              />
              <TextField<Values> name="industry" label="Industry / domain" />
              <SegmentedField<Values>
                name="projectType"
                label="Loại project"
                options={[
                  { value: "new", label: "Hoàn toàn mới" },
                  { value: "rewrite", label: "Làm lại hệ thống cũ" },
                  { value: "feature", label: "Thêm feature hệ thống cũ" },
                ]}
              />
            </>
          ) : step === 2 ? (
            <>
              <FieldRow>
                <TextField<Values> name="startDate" label="Ngày bắt đầu" required type="date" />
                <TextField<Values> name="deadline" label="Deadline" required type="date" />
              </FieldRow>
              <FieldRow>
                <TextField<Values> name="budgetUsd" label="Ngân sách dự án (USD)" type="number" />
                <TextField<Values> name="aiBudget" label="AI budget cap (USD)" type="number" help="Giới hạn chi phí LLM cho project" />
              </FieldRow>
              <ChipsField<Values> name="tags" label="Tags" placeholder="Retail, DOOH..." />
            </>
          ) : step === 3 ? (
            <>
              <SelectField<Values> name="feStack" label="Frontend stack" options={STACKS} />
              <SelectField<Values> name="beStack" label="Backend stack" options={BACKENDS} />
              <SegmentedField<Values>
                name="hostingEnv"
                label="Hosting"
                options={[
                  { value: "reborn", label: "Reborn Cloud" },
                  { value: "aws", label: "AWS" },
                  { value: "gcp", label: "GCP" },
                  { value: "azure", label: "Azure" },
                  { value: "onprem", label: "On-prem KH" },
                ]}
              />
              <CheckboxField<Values>
                name="repoAuto"
                labelText="Tự động tạo Git repo + CI/CD + môi trường staging"
                help="Skip nếu KH đã có repo sẵn"
              />
            </>
          ) : (
            <>
              <SelectField<Values>
                name="pm"
                label="Project Manager"
                required
                options={MEMBERS.filter((m) => m.active).map((m) => ({
                  value: m.id,
                  label: `${m.name} (${m.role})`,
                }))}
              />
              <SelectField<Values>
                name="techLead"
                label="Tech Lead"
                required
                options={MEMBERS.filter((m) => m.active).map((m) => ({
                  value: m.id,
                  label: `${m.name} (${m.role})`,
                }))}
              />
              <div className="field">
                <div className="field-label">
                  Team members <span className="field-required">*</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {MEMBERS.filter((m) => m.active).map((m) => {
                    const picked = watchTeam.includes(m.id);
                    return (
                      <button key={m.id} type="button" className={`filter-chip ${picked ? "active" : ""}`} onClick={() => toggleTeam(m.id)}>
                        {m.initials} · {m.name} ({m.role})
                      </button>
                    );
                  })}
                </div>
                {form.formState.errors.team ? <div className="field-error">{form.formState.errors.team.message as string}</div> : null}
              </div>

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
                  <strong>{watchAll.name || "[tên project]"}</strong> · {watchAll.code || "[code]"}
                  <br />
                  KH: {client?.name} · Budget ${watchAll.budgetUsd} + AI ${watchAll.aiBudget}
                  <br />
                  Stack: {STACKS.find((s) => s.value === watchAll.feStack)?.label} / {BACKENDS.find((b) => b.value === watchAll.beStack)?.label}
                  <br />
                  Team: {watchTeam.length} người · PM + TL: 2 người
                </div>
              </div>
            </>
          )}
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
