import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Segmented, Checkbox } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ExportReportModal({ open, onClose }: Props) {
  const [format, setFormat] = useState<"csv" | "xlsx" | "pdf">("xlsx");
  const [schedule, setSchedule] = useState<"once" | "daily" | "weekly" | "monthly">("once");
  const [emails, setEmails] = useState("finance@reborn.vn");
  const { submitting, submit } = useFormStub(
    schedule === "once" ? "Đã export" : "Đã lên lịch export",
    schedule === "once" ? "Tải xuống trong 30s" : "Email sẽ đến theo schedule"
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export báo cáo"
      kicker="ANALYTICS · EXPORT"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={() => submit(onClose)}>
            {submitting ? "Đang xử lý..." : schedule === "once" ? `Export .${format}` : "Đặt lịch"}
          </button>
        </>
      }
    >
      <Field label="Định dạng">
        <Segmented
          value={format}
          onChange={setFormat}
          options={[
            { value: "csv", label: "CSV" },
            { value: "xlsx", label: "Excel" },
            { value: "pdf", label: "PDF" },
          ]}
        />
      </Field>

      <Field label="Schedule">
        <Select
          value={schedule}
          onChange={(e) => setSchedule(e.target.value as typeof schedule)}
          options={[
            { value: "once", label: "Xuất 1 lần (tải xuống)" },
            { value: "daily", label: "Hàng ngày (gửi email)" },
            { value: "weekly", label: "Thứ 2 hàng tuần" },
            { value: "monthly", label: "Ngày 1 hàng tháng" },
          ]}
        />
      </Field>

      {schedule !== "once" ? (
        <Field label="Gửi email đến" required help="Phân cách dấu phẩy">
          <Input value={emails} onChange={(e) => setEmails(e.target.value)} />
        </Field>
      ) : null}

      {format === "pdf" ? (
        <FieldRow>
          <Field label="Page size">
            <Select
              defaultValue="a4"
              options={[
                { value: "a4", label: "A4" },
                { value: "letter", label: "Letter" },
              ]}
            />
          </Field>
          <Field label="Orientation">
            <Select
              defaultValue="landscape"
              options={[
                { value: "portrait", label: "Portrait" },
                { value: "landscape", label: "Landscape" },
              ]}
            />
          </Field>
        </FieldRow>
      ) : null}

      <Checkbox label="Bao gồm biểu đồ" defaultChecked />
      <Checkbox label="Bao gồm raw data (sheet riêng)" defaultChecked />
      <Checkbox label="Mask sensitive fields (cost, KH tên)" />
      <Checkbox label="Watermark công ty" defaultChecked />
    </Modal>
  );
}
