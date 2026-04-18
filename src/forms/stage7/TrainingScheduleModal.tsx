import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Chips, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TrainingScheduleModal({ open, onClose }: Props) {
  const [title, setTitle] = useState("Training buổi 4 — Troubleshooting + Q&A");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("120");
  const [mode, setMode] = useState<"onsite" | "online" | "hybrid">("hybrid");
  const [venue, setVenue] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [trainer, setTrainer] = useState("chi-lan");
  const { submitting, submit } = useFormStub("Đã đặt lịch training", "Email invite + calendar event");

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
          <button type="button" className="btn primary" disabled={submitting || !title || !date} onClick={() => submit(onClose)}>
            {submitting ? "Đang đặt..." : "Đặt lịch"}
          </button>
        </>
      }
    >
      <Field label="Tiêu đề buổi training" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <FieldRow>
        <Field label="Ngày" required>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Giờ" required>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Thời lượng (phút)">
          <Select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            options={[
              { value: "60", label: "1 giờ" },
              { value: "120", label: "2 giờ" },
              { value: "180", label: "3 giờ" },
              { value: "240", label: "Nửa ngày" },
              { value: "480", label: "Cả ngày" },
            ]}
          />
        </Field>
        <Field label="Hình thức">
          <Select
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
            options={[
              { value: "onsite", label: "Onsite (tại văn phòng KH)" },
              { value: "online", label: "Online (Google Meet / Zoom)" },
              { value: "hybrid", label: "Hybrid (cả hai)" },
            ]}
          />
        </Field>
      </FieldRow>
      <Field label={mode === "online" ? "Meeting link" : "Địa điểm"} required>
        <Input
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder={mode === "online" ? "https://meet.google.com/..." : "Tòa nhà Mega Mart HQ — Phòng 502"}
        />
      </Field>
      <Field label="Trainer">
        <Select
          value={trainer}
          onChange={(e) => setTrainer(e.target.value)}
          options={[
            { value: "chi-lan", label: "Chi Lan (PM)" },
            { value: "an-minh", label: "An Minh (BA)" },
            { value: "duc-a", label: "An Đức (Tech Lead)" },
          ]}
        />
      </Field>
      <Field label="Attendees KH" help="Email, phân cách Enter">
        <Chips value={attendees} onChange={setAttendees} placeholder="minh.a@megamart.vn" />
      </Field>

      <div style={{ fontWeight: 600, fontSize: 13, margin: "12px 0 6px" }}>Tùy chọn</div>
      <Checkbox label="Gửi Training Deck PDF trước buổi training" defaultChecked />
      <Checkbox label="Record buổi training (với sự đồng ý KH)" defaultChecked />
      <Checkbox label="Gửi Q&A form sau buổi training" defaultChecked />
      <Checkbox label="Tạo calendar event + nhắc trước 1h" defaultChecked />
    </Modal>
  );
}
