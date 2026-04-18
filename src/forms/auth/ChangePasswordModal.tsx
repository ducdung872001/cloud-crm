import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { Modal, TextField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = z
  .object({
    current: z.string().min(1, v.msg.required),
    next: v.passwordSchema,
    confirm: z.string(),
  })
  .superRefine(v.requireMatch("next", "confirm", "Mật khẩu nhập lại không khớp"));

type Values = z.infer<typeof schema>;

export default function ChangePasswordModal({ open, onClose }: Props) {
  const { submitting, submit } = useFormStub("Đã đổi mật khẩu", "Các session khác đã bị đăng xuất");
  const form = useZodForm<Values>({
    schema,
    defaultValues: { current: "", next: "", confirm: "" },
  });
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
      title="Đổi mật khẩu"
      kicker="SECURITY"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <TextField<Values> name="current" label="Mật khẩu hiện tại" required type="password" />
          <TextField<Values> name="next" label="Mật khẩu mới" required type="password" />
          <TextField<Values> name="confirm" label="Nhập lại mật khẩu mới" required type="password" />
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
