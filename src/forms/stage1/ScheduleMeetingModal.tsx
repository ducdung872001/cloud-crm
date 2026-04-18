import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Chips, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ScheduleMeetingModal({ open, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState("60");
  const [type, setType] = useState("review");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [sendInvite, setSendInvite] = useState(true);
  const [autoRecord, setAutoRecord] = useState(true);
  const { submitting, submit } = useFormStub("Đã đặt lịch meeting", "Email invite + Google Calendar event đã tạo");

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
          <button type="button" className="btn primary" disabled={submitting || !title || !date || !start} onClick={() => submit(onClose)}>
            {submitting ? "Đang đặt..." : "Đặt lịch"}
          </button>
        </>
      }
    >
      <Field label="Tiêu đề meeting" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review URD v1.3 với KH" />
      </Field>
      <FieldRow>
        <Field label="Ngày" required>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Giờ bắt đầu" required>
          <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Thời lượng (phút)">
          <Select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            options={[
              { value: "30", label: "30 phút" },
              { value: "45", label: "45 phút" },
              { value: "60", label: "1 giờ" },
              { value: "90", label: "1g30" },
              { value: "120", label: "2 giờ" },
            ]}
          />
        </Field>
        <Field label="Loại session">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: "kickoff", label: "Kickoff" },
              { value: "review", label: "Review" },
              { value: "change", label: "Change Request" },
              { value: "uat", label: "UAT" },
              { value: "internal", label: "Internal Sync" },
            ]}
          />
        </Field>
      </FieldRow>
      <Field label="Attendees" required help="Email phân cách bằng Enter">
        <Chips value={attendees} onChange={setAttendees} placeholder="minh.a@megamart.vn" />
      </Field>
      <Checkbox label="Gửi email invite + add to Google Calendar" checked={sendInvite} onChange={setSendInvite} />
      <Checkbox
        label="Tự động ghi âm + upload vào Stage 1 sau buổi họp"
        help="Cần bật quyền bot trong Google Meet"
        checked={autoRecord}
        onChange={setAutoRecord}
      />
    </Modal>
  );
}
