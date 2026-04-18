import { Modal, Field, Checkbox, Segmented } from "../../components/ui";
import { useState } from "react";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ExportUrdModal({ open, onClose }: Props) {
  const [format, setFormat] = useState<"docx" | "pdf" | "html" | "md">("docx");
  const { submitting, submit } = useFormStub("Đã export URD", "Tải xuống sẵn sàng");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export URD"
      kicker="STAGE 2 · EXPORT"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang export..." : `Export .${format}`}
          </button>
        </>
      }
    >
      <Field label="Định dạng">
        <Segmented
          value={format}
          onChange={setFormat}
          options={[
            { value: "docx", label: "DOCX" },
            { value: "pdf", label: "PDF" },
            { value: "html", label: "HTML" },
            { value: "md", label: "Markdown" },
          ]}
        />
      </Field>
      <Field label="Bao gồm">
        <Checkbox label="Table of contents" defaultChecked />
        <Checkbox label="Revision history" defaultChecked />
        <Checkbox label="Requirements list (có code + priority)" defaultChecked />
        <Checkbox label="Traceability matrix" defaultChecked />
        <Checkbox label="Diff chú thích với version trước" />
        <Checkbox label="Screenshot / prototype preview" defaultChecked />
        <Checkbox label="Signature block (cho KH ký)" defaultChecked />
      </Field>
      <Field label="Tùy chọn">
        <Checkbox label="Watermark DRAFT nếu chưa publish" defaultChecked />
        <Checkbox label="Mask nội dung confidential cho bản KH" />
      </Field>
    </Modal>
  );
}
