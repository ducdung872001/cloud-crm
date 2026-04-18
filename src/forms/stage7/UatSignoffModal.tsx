import { FormProvider } from "react-hook-form";
import { z } from "zod";
import { CheckboxField, Modal, TextField, TextareaField, useZodForm, v } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

const UAT_ITEMS = [
  { id: "1", tc: "UAT-001 · Tạo màn hình mới", result: "pass" },
  { id: "2", tc: "UAT-002 · Filter campaign theo tuần", result: "pass" },
  { id: "3", tc: "UAT-003 · Export báo cáo đúng cột", result: "pass" },
  { id: "4", tc: "UAT-004 · Dashboard uptime đúng số liệu", result: "pass" },
  { id: "5", tc: "UAT-005 · RBAC Content Mgr không xóa được", result: "pass" },
  { id: "6", tc: "UAT-006 · Filter city mobile responsive", result: "conditional" },
  { id: "7", tc: "UAT-007 · Training deck đầy đủ", result: "pending" },
];

const schema = z.object({
  signerName: v.requiredString("Họ tên người ký bắt buộc").max(80, v.msg.max(80)),
  signerTitle: z.string().max(120, v.msg.max(120)),
  conditions: z.string().max(2000, v.msg.max(2000)),
  agree: z.literal(true, { error: "Phải xác nhận đồng ý" }),
});
type Values = z.infer<typeof schema>;

export default function UatSignoffModal({ open, onClose }: Props) {
  const { submitting, submit } = useFormStub("UAT đã ký", "Biên bản nghiệm thu tạo và lưu bất biến");
  const form = useZodForm<Values>({
    schema,
    defaultValues: {
      signerName: "",
      signerTitle: "",
      conditions: "1. Hoàn thiện filter city trên mobile trước 25/04.\n2. Training buổi 4 tổ chức trong tuần 22/04.",
      agree: undefined as unknown as true,
    },
  });
  const onSubmit = form.handleSubmit(() =>
    submit(() => {
      form.reset();
      onClose();
    })
  );

  const passed = UAT_ITEMS.filter((i) => i.result === "pass").length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="UAT Signoff — Ký nghiệm thu"
      kicker="STAGE 7 · LEGAL"
      sub={`${passed}/${UAT_ITEMS.length} test case pass · Checkpoint cuối cùng trước handover`}
      size="wide"
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting} onClick={onSubmit}>
            {submitting ? "Đang ký..." : "Ký & publish biên bản"}
          </button>
        </>
      }
    >
      <div
        style={{
          padding: 14,
          background: "var(--slate-50)",
          borderRadius: 10,
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Kết quả UAT</div>
        {UAT_ITEMS.map((i) => (
          <div
            key={i.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 110px",
              gap: 8,
              padding: "4px 0",
              fontSize: 12,
              borderBottom: "1px solid var(--slate-200)",
            }}
          >
            <div>{i.tc}</div>
            <span className={`tag ${i.result === "pass" ? "tag-ok" : i.result === "conditional" ? "tag-warn" : "tag-hu"}`}>
              {i.result === "pass" ? "✓ Pass" : i.result === "conditional" ? "~ Có điều kiện" : "⏳ Pending"}
            </span>
          </div>
        ))}
      </div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate>
          <TextareaField<Values> name="conditions" label="Điều kiện kèm theo (nếu ký có điều kiện)" style={{ minHeight: 80 }} />

          <div style={{ fontWeight: 600, fontSize: 13, margin: "14px 0 6px" }}>Đại diện khách hàng ký</div>
          <TextField<Values> name="signerName" label="Họ tên" required />
          <TextField<Values> name="signerTitle" label="Chức danh" placeholder="Marketing Director / CTO / ..." />
          <div className="field">
            <div className="field-label">
              Chữ ký / OTP <span className="field-required">*</span>
            </div>
            <div className="upload-zone" style={{ padding: 20 }}>
              <div className="field-help">Click để mở signature pad (placeholder)</div>
            </div>
          </div>
          <CheckboxField<Values>
            name="agree"
            labelText="Tôi xác nhận đã UAT toàn bộ test cases, chấp nhận nghiệm thu theo điều kiện trên. Biên bản có giá trị pháp lý và không thay đổi."
          />
          <button type="submit" style={{ display: "none" }} />
        </form>
      </FormProvider>
    </Modal>
  );
}
