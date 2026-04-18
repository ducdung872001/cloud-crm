import { Modal, Field, FieldRow, Input, Select, Toggle } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChunkingSettingsModal({ open, onClose }: Props) {
  const { submitting, submit } = useFormStub("Đã lưu chunking settings");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Audio chunking & tagging"
      kicker="STAGE 1 · LONG AUDIO"
      sub="Cho audio dài > 1 giờ, chia segments để AI xử lý song song"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang lưu..." : "Áp dụng"}
          </button>
        </>
      }
    >
      <FieldRow>
        <Field label="Chunk size (phút)">
          <Select
            defaultValue="15"
            options={[
              { value: "5", label: "5 phút" },
              { value: "10", label: "10 phút" },
              { value: "15", label: "15 phút (khuyến nghị)" },
              { value: "30", label: "30 phút" },
            ]}
          />
        </Field>
        <Field label="Overlap (giây)" help="Tránh cắt đứt câu">
          <Input type="number" defaultValue={10} />
        </Field>
      </FieldRow>

      <Toggle
        label="Auto-detect silence để cắt chính xác"
        help="Dùng voice activity detection (VAD) thay vì cắt theo thời gian cố định"
        defaultChecked
      />
      <Toggle label="Speaker diarization mỗi chunk" help="Nhận diện người nói — có thể rename sau" defaultChecked />
      <Toggle label="Parallel processing" help="Chạy song song các chunk qua Whisper (nhanh hơn, tốn quota)" defaultChecked />

      <Field label="Tag segments" help="Phân loại nội dung — giúp AI prompt đúng context">
        <Select
          defaultValue="auto"
          options={[
            { value: "auto", label: "AI tự tag" },
            { value: "manual", label: "Manual — team tự tag" },
            { value: "none", label: "Không tag" },
          ]}
        />
      </Field>

      <div
        style={{
          padding: 10,
          background: "var(--slate-50)",
          borderRadius: 8,
          fontSize: 11,
          color: "var(--slate-600)",
          marginTop: 8,
        }}
      >
        💡 Audio 1h → 4 chunks × 15 phút, parallel. Ước tính ~2 phút xử lý, ~$0.40 Whisper.
      </div>
    </Modal>
  );
}
