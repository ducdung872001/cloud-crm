import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { Modal, FieldRow, SelectField, TextField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = z.object({
  name: v.requiredString().max(80, v.msg.max(80)),
  phone: v.phoneSchema,
  timezone: z.string(),
  locale: z.string(),
});
type Values = z.infer<typeof schema>;

export default function ProfileModal({ open, onClose }: Props) {
  const { submitting, submit } = useFormStub("Profile đã cập nhật");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      name: "Phan Dũng",
      phone: "0912 345 678",
      timezone: "Asia/Ho_Chi_Minh",
      locale: "vi-VN",
    },
  });
  const onSubmit = form.handleSubmit(() => submit(onClose));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Hồ sơ cá nhân"
      kicker="PROFILE"
      sub="Thông tin hiển thị trong team và audit log"
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
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--teal-400), var(--violet-500))",
            color: "#fff",
            fontWeight: 700,
            fontSize: 22,
            display: "grid",
            placeItems: "center",
          }}
        >
          PD
        </div>
        <div>
          <button type="button" className="btn sm">
            ↑ Upload avatar
          </button>
          <div className="field-help" style={{ marginTop: 4 }}>
            PNG/JPG tối đa 2 MB, khuyến nghị 256×256
          </div>
        </div>
      </div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <TextField<Values> name="name" label="Họ tên" required />
          <FieldRow>
            <div className="field">
              <div className="field-label">Email</div>
              <input className="input" value="ceo@reborn.vn" disabled />
              <div className="field-help">Không đổi được (SSO)</div>
            </div>
            <TextField<Values> name="phone" label="Điện thoại" />
          </FieldRow>
          <FieldRow>
            <SelectField<Values>
              name="timezone"
              label="Timezone"
              options={[
                { value: "Asia/Ho_Chi_Minh", label: "Hà Nội (GMT+7)" },
                { value: "Asia/Singapore", label: "Singapore (GMT+8)" },
                { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
                { value: "UTC", label: "UTC" },
              ]}
            />
            <SelectField<Values>
              name="locale"
              label="Ngôn ngữ"
              options={[
                { value: "vi-VN", label: "Tiếng Việt" },
                { value: "en-US", label: "English" },
              ]}
            />
          </FieldRow>
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
