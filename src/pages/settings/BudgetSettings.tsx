import { useState } from "react";
import { Field, FieldRow, Input, Select, Toggle } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

export default function BudgetSettings() {
  const [monthlyCap, setMonthlyCap] = useState("5000");
  const [projectCap, setProjectCap] = useState("500");
  const [alert80, setAlert80] = useState(true);
  const [alert95, setAlert95] = useState(true);
  const [hardStop, setHardStop] = useState(false);
  const [alertEmail, setAlertEmail] = useState("ceo@reborn.vn,finance@reborn.vn");
  const { submitting, submit } = useFormStub("Đã lưu budget cap");

  return (
    <div>
      <div className="settings-section-title">AI Budget & Alerts</div>
      <div className="settings-section-sub">Giới hạn chi phí AI tránh vượt quota. Áp dụng cho toàn bộ tenant (override tại project).</div>

      <FieldRow>
        <Field label="Trần chi phí tháng (USD)" required>
          <Input type="number" value={monthlyCap} onChange={(e) => setMonthlyCap(e.target.value)} />
        </Field>
        <Field label="Trần mặc định mỗi project (USD)">
          <Input type="number" value={projectCap} onChange={(e) => setProjectCap(e.target.value)} />
        </Field>
      </FieldRow>

      <Field label="Currency">
        <Select
          defaultValue="USD"
          options={[
            { value: "USD", label: "USD" },
            { value: "VND", label: "VND (convert theo rate hàng ngày)" },
          ]}
        />
      </Field>

      <div
        style={{
          padding: 14,
          background: "var(--slate-50)",
          borderRadius: 10,
          marginTop: 14,
          marginBottom: 14,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Cảnh báo</div>
        <Toggle label="Cảnh báo khi đạt 80% cap" help="Gửi email cho danh sách bên dưới" checked={alert80} onChange={setAlert80} />
        <Toggle label="Cảnh báo khi đạt 95% cap" checked={alert95} onChange={setAlert95} />
        <Toggle
          label="Hard stop khi vượt cap"
          help="Agent sẽ bị pause cho đến khi tăng cap hoặc sang tháng"
          checked={hardStop}
          onChange={setHardStop}
        />
      </div>

      <Field label="Email nhận cảnh báo" help="Phân cách bằng dấu phẩy">
        <Input value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} />
      </Field>

      <button type="button" className="btn primary" disabled={submitting} onClick={() => submit()}>
        {submitting ? "Đang lưu..." : "Lưu cấu hình"}
      </button>
    </div>
  );
}
