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
  time: z.string().regex(/^\d{2}:\d{2}$/, "Giờ không hợp lệ"),
  duration: z.string(),
  mode: z.enum(["onsite", "online", "hybrid"]),
  venue: v.requiredString("Địa điểm / link bắt buộc").max(300, v.msg.max(300)),
  trainer: v.requiredString("Chọn trainer"),
  attendees: z.array(z.string().email(v.msg.email)),
  sendDeck: z.boolean(),
  record: z.boolean(),
  qaForm: z.boolean(),
  calendarEvent: z.boolean(),
});
type Values = z.infer<typeof schema>;

export default function TrainingScheduleModal({ open, onClose }: Props) {
  const { submitting, submit } = useFormStub("Đã đặt lịch training", "Email invite + calendar event");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      title: "Training buổi 4 — Troubleshooting + Q&A",
      date: "",
      time: "",
      duration: "120",
      mode: "hybrid",
      venue: "",
      trainer: "chi-lan",
      attendees: [],
      sendDeck: true,
      record: true,
      qaForm: true,
      calendarEvent: true,
    },
  });
  const mode = form.watch("mode");
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
      title="Đặt lịch training cho khách hàng"
      kicker="STAGE 7 · TRAINING"
      size="wide"
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
          <TextField<Values> name="title" label="Tiêu đề buổi training" required />
          <FieldRow>
            <TextField<Values> name="date" label="Ngày" required type="date" />
            <TextField<Values> name="time" label="Giờ" required type="time" />
          </FieldRow>
          <FieldRow>
            <SelectField<Values>
              name="duration"
              label="Thời lượng (phút)"
              options={[
                { value: "60", label: "1 giờ" },
                { value: "120", label: "2 giờ" },
                { value: "180", label: "3 giờ" },
                { value: "240", label: "Nửa ngày" },
                { value: "480", label: "Cả ngày" },
              ]}
            />
            <SelectField<Values>
              name="mode"
              label="Hình thức"
              options={[
                { value: "onsite", label: "Onsite (tại văn phòng KH)" },
                { value: "online", label: "Online (Google Meet / Zoom)" },
                { value: "hybrid", label: "Hybrid (cả hai)" },
              ]}
            />
          </FieldRow>
          <TextField<Values>
            name="venue"
            label={mode === "online" ? "Meeting link" : "Địa điểm"}
            required
            placeholder={mode === "online" ? "https://meet.google.com/..." : "Tòa nhà Mega Mart HQ — Phòng 502"}
          />
          <SelectField<Values>
            name="trainer"
            label="Trainer"
            options={[
              { value: "chi-lan", label: "Chi Lan (PM)" },
              { value: "an-minh", label: "An Minh (BA)" },
              { value: "duc-a", label: "An Đức (Tech Lead)" },
            ]}
          />
          <ChipsField<Values> name="attendees" label="Attendees KH" help="Email, phân cách Enter" placeholder="minh.a@megamart.vn" />

          <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Tùy chọn</div>
          <CheckboxField<Values> name="sendDeck" labelText="Gửi Training Deck PDF trước buổi training" />
          <CheckboxField<Values> name="record" labelText="Record buổi training (với sự đồng ý KH)" />
          <CheckboxField<Values> name="qaForm" labelText="Gửi Q&A form sau buổi training" />
          <CheckboxField<Values> name="calendarEvent" labelText="Tạo calendar event + nhắc trước 1h" />
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
