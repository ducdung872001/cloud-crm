import { Field, FieldRow, Input, Select } from "../../components/ui";
import { useApp } from "../../context/AppContext";

export default function BillingSettings() {
  const { showToast } = useApp();

  return (
    <div>
      <div className="settings-section-title">Billing & subscription</div>
      <div className="settings-section-sub">Plan, invoice, payment method.</div>

      <div
        className="card"
        style={{
          padding: 18,
          marginBottom: 18,
          background: "linear-gradient(135deg, rgba(20,184,166,0.05), rgba(139,92,246,0.05))",
          borderColor: "rgba(20,184,166,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="kicker">Current plan</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              Business — $499/month
            </div>
            <div style={{ fontSize: 12, color: "var(--slate-600)", marginTop: 4 }}>Unlimited projects · 20 team members · 5000 AI requests/mo</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn" onClick={() => showToast("info", "Downgrade plan", "Chuyển sang Starter")}>
              Downgrade
            </button>
            <button type="button" className="btn primary" onClick={() => showToast("info", "Upgrade plan", "Chuyển sang Enterprise")}>
              Upgrade →
            </button>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 18 }}>
        <div className="stat">
          <div className="stat-val">
            14<span className="stat-unit">/∞</span>
          </div>
          <div className="stat-label">Projects đang dùng</div>
        </div>
        <div className="stat">
          <div className="stat-val">
            12<span className="stat-unit">/20</span>
          </div>
          <div className="stat-label">Team members</div>
        </div>
        <div className="stat">
          <div className="stat-val">
            3,284<span className="stat-unit">/5000</span>
          </div>
          <div className="stat-label">AI requests tháng này</div>
        </div>
      </div>

      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Payment method</div>
      <FieldRow>
        <Field label="Card">
          <Input defaultValue="**** **** **** 4242" disabled />
        </Field>
        <Field label="Expiry">
          <Input defaultValue="12/27" disabled />
        </Field>
      </FieldRow>
      <button type="button" className="btn" onClick={() => showToast("info", "Cập nhật thẻ", "Mở form Stripe")}>
        Cập nhật thẻ
      </button>

      <div style={{ marginTop: 24, fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Hóa đơn gần đây</div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Tháng</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {["03/2026", "02/2026", "01/2026"].map((m) => (
              <tr key={m}>
                <td>{m}</td>
                <td>Business</td>
                <td>$499.00</td>
                <td>
                  <span className="tag tag-ok">Paid</span>
                </td>
                <td>
                  <button type="button" className="btn sm" onClick={() => showToast("info", "Download invoice", m)}>
                    ↓ PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 18 }}>
        <Field label="Billing contact email">
          <Input defaultValue="finance@reborn.vn" />
        </Field>
        <Field label="Tax ID (cho hóa đơn)">
          <Input defaultValue="0106-3-xxxxxx" />
        </Field>
        <Field label="Currency">
          <Select
            defaultValue="USD"
            options={[
              { value: "USD", label: "USD" },
              { value: "VND", label: "VND" },
            ]}
          />
        </Field>
      </div>
    </div>
  );
}
