import { useState } from "react";
import { Field, FieldRow, Input, Select } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

export default function CompanySettings() {
  const [name, setName] = useState("Reborn JSC");
  const [taxId, setTaxId] = useState("0106-3-xxxxxx");
  const [address, setAddress] = useState("Tầng 5, Tòa nhà XYZ, Cầu Giấy, Hà Nội");
  const [currency, setCurrency] = useState("VND");
  const [fiscalYear, setFiscalYear] = useState("01-01");
  const { submitting, submit } = useFormStub("Đã lưu thông tin công ty");

  return (
    <div>
      <div className="settings-section-title">Thông tin công ty</div>
      <div className="settings-section-sub">Hiển thị trên URD, release note, báo cáo gửi KH.</div>

      <div
        style={{
          padding: 18,
          border: "1px solid var(--slate-200)",
          borderRadius: 10,
          marginBottom: 18,
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            background: "linear-gradient(135deg, var(--teal-400), var(--teal-500))",
            color: "var(--navy-900)",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 28,
            display: "grid",
            placeItems: "center",
          }}
        >
          R
        </div>
        <div>
          <button type="button" className="btn sm">
            ↑ Upload logo
          </button>
          <div className="field-help" style={{ marginTop: 4 }}>
            SVG hoặc PNG 512×512, nền trong suốt
          </div>
        </div>
      </div>

      <Field label="Tên công ty" required>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <FieldRow>
        <Field label="Mã số thuế">
          <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
        </Field>
        <Field label="Currency mặc định">
          <Select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={[
              { value: "VND", label: "₫ VND" },
              { value: "USD", label: "$ USD" },
              { value: "EUR", label: "€ EUR" },
            ]}
          />
        </Field>
      </FieldRow>
      <Field label="Địa chỉ">
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </Field>
      <Field label="Đầu năm tài chính (MM-DD)">
        <Input value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} />
      </Field>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="btn primary" disabled={submitting} onClick={() => submit()}>
          {submitting ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
