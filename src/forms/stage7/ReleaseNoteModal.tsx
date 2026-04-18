import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { CheckboxField, FieldRow, Modal, TextField, TextareaField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = z.object({
  version: z
    .string()
    .trim()
    .regex(/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/, "Dùng semver, VD: 1.0.0 hoặc 1.0.0-beta.1"),
  date: v.dateSchema,
  highlights: z.string().max(500, v.msg.max(500)),
  features: z.string().max(5000, v.msg.max(5000)),
  bugfixes: z.string().max(5000, v.msg.max(5000)),
  known: z.string().max(2000, v.msg.max(2000)),
  breaking: z.string().max(2000, v.msg.max(2000)),
  bilingual: z.boolean(),
  broadcast: z.boolean(),
  migrationGuide: z.boolean(),
});
type Values = z.infer<typeof schema>;

export default function ReleaseNoteModal({ open, onClose }: Props) {
  const { submitting, submit } = useFormStub("Đã publish release note");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      version: "1.0.0",
      date: "",
      highlights: "",
      features:
        "- CMS quản lý 118 màn hình 3 thành phố\n- Campaign scheduler với multi-timezone\n- Dashboard uptime real-time\n- Export báo cáo PDF/Excel",
      bugfixes: "- Fix timezone DST edge case (BUG-106)\n- Fix export UTF-8 encoding (BUG-105)",
      known: "- Chưa hỗ trợ Safari 15 (upgrade lên 16+)",
      breaking: "",
      bilingual: true,
      broadcast: true,
      migrationGuide: false,
    },
  });
  const onSubmit = form.handleSubmit(() => submit(onClose));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Release note editor"
      kicker="STAGE 7 · RELEASE"
      sub="Changelog gửi KH — viết friendly, tránh jargon"
      size="xwide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn">
            Preview
          </button>
          <button type="button" className="btn">
            ↓ Export PDF
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Đang publish..." : "Publish"}
          </button>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <FieldRow>
            <TextField<Values> name="version" label="Version (semver)" required placeholder="1.0.0" />
            <TextField<Values> name="date" label="Ngày release" required type="date" />
          </FieldRow>
          <TextareaField<Values> name="highlights" label="Highlights (1-2 dòng tóm tắt)" style={{ minHeight: 60 }} />
          <TextareaField<Values> name="features" label="✨ Features mới" mono style={{ minHeight: 100 }} />
          <TextareaField<Values> name="bugfixes" label="🐛 Bug fixes" mono style={{ minHeight: 80 }} />
          <TextareaField<Values> name="known" label="⚠ Known issues" mono style={{ minHeight: 60 }} />
          <TextareaField<Values> name="breaking" label="💥 Breaking changes (cho API users)" mono style={{ minHeight: 60 }} />
          <CheckboxField<Values> name="bilingual" labelText="Viết song song tiếng Việt + tiếng Anh" />
          <CheckboxField<Values> name="broadcast" labelText="Gửi email broadcast cho users khi publish" />
          <CheckboxField<Values> name="migrationGuide" labelText="Đính kèm migration guide (cho breaking changes)" />
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
