import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Chips, Textarea } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ManualNoteModal({ open, onClose }: Props) {
  const [date, setDate] = useState("");
  const [type, setType] = useState("review");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const { submitting, submit } = useFormStub("Đã lưu meeting note", "AI sẽ phân tích để cập nhật URD");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nhập meeting note thủ công"
      kicker="STAGE 1 · MANUAL"
      sub="Dùng khi không có audio — nhập tóm tắt buổi họp"
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || !note} onClick={() => submit(onClose)}>
            {submitting ? "Đang xử lý..." : "Lưu & chạy AI"}
          </button>
        </>
      }
    >
      <FieldRow>
        <Field label="Ngày họp" required>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
      <Field label="Người tham dự">
        <Chips value={attendees} onChange={setAttendees} placeholder="A.Minh, C.Lan, team Reborn..." />
      </Field>
      <Field label="Nội dung meeting" required help="Viết càng chi tiết càng tốt. AI sẽ trích requirement.">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ minHeight: 240 }}
          placeholder="1. KH đồng ý scope v1.2, yêu cầu thêm...
2. Phản đối feature X vì ...
3. Deadline mới: ...
4. ..."
        />
      </Field>
    </Modal>
  );
}
