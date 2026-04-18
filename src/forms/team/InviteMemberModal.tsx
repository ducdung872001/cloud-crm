import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { ChipsField, FieldRow, Modal, SelectField, TextareaField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";
import { ROLE_LABEL, type TeamRole } from "../../data/team";

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = z.object({
  emails: z.array(z.string().email(v.msg.email)).min(1, "Cần ít nhất 1 email"),
  role: z.string(),
  projects: z.array(z.string()),
  message: z.string().max(500, v.msg.max(500)).optional(),
});
type Values = z.infer<typeof schema>;

export default function InviteMemberModal({ open, onClose }: Props) {
  const { submitting, submit } = useFormStub("Đã gửi lời mời", "Invitation email được gửi đến các địa chỉ");
  const form = useZodForm<Values>({
    schema,
    defaultValues: { emails: [], role: "Dev", projects: [], message: "" },
  });
  const emails = form.watch("emails");
  const onSubmit = form.handleSubmit(() =>
    submit(() => {
      form.reset();
      onClose();
    })
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mời thành viên mới"
      kicker="TEAM · INVITE"
      sub="Có thể mời nhiều email cùng lúc. Mỗi người nhận link kích hoạt 7 ngày."
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Đang gửi..." : `Gửi lời mời (${emails.length})`}
          </button>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <ChipsField<Values> name="emails" label="Email (Enter để thêm)" required placeholder="email@reborn.vn" />
          <FieldRow>
            <SelectField<Values>
              name="role"
              label="Role"
              required
              options={(Object.keys(ROLE_LABEL) as TeamRole[]).map((r) => ({
                value: r,
                label: ROLE_LABEL[r],
              }))}
            />
            <ChipsField<Values> name="projects" label="Project scope" help="Bỏ trống = toàn tenant" placeholder="MEGAMART-DOOH..." />
          </FieldRow>
          <TextareaField<Values> name="message" label="Tin nhắn kèm theo (tùy chọn)" placeholder="Chào bạn, mời join workspace Reborn Forge..." />
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
