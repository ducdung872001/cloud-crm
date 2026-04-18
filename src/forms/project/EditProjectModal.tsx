import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { FieldRow, Modal, SelectField, TextField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import type { Project, ProjectState } from "../../data/projects";

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
}

const schema = z.object({
  name: v.requiredString().max(120, v.msg.max(120)),
  client: v.requiredString().max(120, v.msg.max(120)),
  days: z.coerce.number().int().min(-365, "Không nhỏ hơn -365 ngày").max(3650, "Không lớn hơn 10 năm"),
  state: z.string(),
});
type Values = z.infer<typeof schema>;

export default function EditProjectModal({ open, onClose, project }: Props) {
  const { submitting, submit } = useFormStub("Đã cập nhật project");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      name: project.name,
      client: project.client,
      days: project.days,
      state: project.state,
    },
  });
  const onSubmit = form.handleSubmit(() => submit(onClose));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sửa thông tin project"
      kicker={project.code}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <TextField<Values> name="name" label="Tên project" required />
          <TextField<Values> name="client" label="Khách hàng" required />
          <FieldRow>
            <TextField<Values> name="days" label="Deadline còn (ngày)" type="number" />
            <SelectField<Values>
              name="state"
              label="Trạng thái"
              options={(["normal", "warn", "danger", "done"] as ProjectState[]).map((s) => ({
                value: s,
                label: s,
              }))}
            />
          </FieldRow>
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
