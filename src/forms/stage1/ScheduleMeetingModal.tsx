import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { CheckboxField, ChipsField, FieldRow, Modal, SelectField, TextField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = z.object({
  title: v.requiredString("Tiêu đề bắt buộc").max(200, v.msg.max(200)),
  date: v.dateSchema,
  start: z.string().regex(/^\d{2}:\d{2}$/, "Giờ không hợp lệ"),
  duration: z.string(),
  type: z.string(),
  attendees: z.array(z.string().email(v.msg.email)).min(1, "Cần ít nhất 1 attendee"),
  sendInvite: z.boolean(),
  autoRecord: z.boolean(),
});
type Values = z.infer<typeof schema>;

export default function ScheduleMeetingModal({ open, onClose }: Props) {
  const { submitting, submit } = useFormStub("Đã đặt lịch meeting", "Email invite + Google Calendar event đã tạo");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      title: "",
      date: "",
      start: "",
      duration: "60",
      type: "review",
      attendees: [],
      sendInvite: true,
      autoRecord: true,
    },
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
      title="Đặt lịch meeting"
      kicker="STAGE 1 · SCHEDULE"
      sub="Tích hợp Google Calendar, gửi email invite."
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Đang đặt..." : "Đặt lịch"}
          </button>
        </>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <TextField<Values> name="title" label="Tiêu đề meeting" required placeholder="Review URD v1.3 với KH" />
          <FieldRow>
            <TextField<Values> name="date" label="Ngày" required type="date" />
            <TextField<Values> name="start" label="Giờ bắt đầu" required type="time" />
          </FieldRow>
          <FieldRow>
            <SelectField<Values>
              name="duration"
              label="Thời lượng (phút)"
              options={[
                { value: "30", label: "30 phút" },
                { value: "45", label: "45 phút" },
                { value: "60", label: "1 giờ" },
                { value: "90", label: "1g30" },
                { value: "120", label: "2 giờ" },
              ]}
            />
            <SelectField<Values>
              name="type"
              label="Loại session"
              options={[
                { value: "kickoff", label: "Kickoff" },
                { value: "review", label: "Review" },
                { value: "change", label: "Change Request" },
                { value: "uat", label: "UAT" },
                { value: "internal", label: "Internal Sync" },
              ]}
            />
          </FieldRow>
          <ChipsField<Values> name="attendees" label="Attendees" required help="Email phân cách bằng Enter" placeholder="minh.a@megamart.vn" />
          <CheckboxField<Values> name="sendInvite" labelText="Gửi email invite + add to Google Calendar" />
          <CheckboxField<Values>
            name="autoRecord"
            labelText="Tự động ghi âm + upload vào Stage 1 sau buổi họp"
            help="Cần bật quyền bot trong Google Meet"
          />
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
