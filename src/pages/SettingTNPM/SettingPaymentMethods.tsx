import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_PAYMENT_METHODS, MOCK_PAYMENT_GATEWAYS } from "assets/mock/TNPMData";

const fmtDate = (s: string | null) => (s ? s : "Chưa đồng bộ");

// ─── Edit Method Modal ───────────────────────────────────────────────────
function EditMethodModal({ method, onClose, onSave }: any) {
  const [form, setForm] = useState({ ...method });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2 className="modal-title">✏️ Cấu hình phương thức — {method.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Tên hiển thị</label>
              <input className="form-control" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Mã</label>
              <input className="form-control" value={form.code} disabled />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Mô tả</label>
              <input className="form-control" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Quỹ/Tài khoản mặc định</label>
              <input className="form-control" value={form.fundMapping || ""} onChange={(e) => set("fundMapping", e.target.value)} placeholder="Tên quỹ / STK" />
            </div>
            <div className="form-group">
              <label>Phí giao dịch (%)</label>
              <input className="form-control" type="number" step={0.1} value={form.fee} onChange={(e) => set("fee", +e.target.value)} />
            </div>
            {form.type === "bank" && form.bankInfo && (
              <>
                <div className="form-group">
                  <label>Ngân hàng</label>
                  <input className="form-control" value={form.bankInfo.bankName} onChange={(e) => set("bankInfo", { ...form.bankInfo, bankName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Số tài khoản</label>
                  <input className="form-control" value={form.bankInfo.accountNumber} onChange={(e) => set("bankInfo", { ...form.bankInfo, accountNumber: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Tên chủ tài khoản</label>
                  <input className="form-control" value={form.bankInfo.accountName} onChange={(e) => set("bankInfo", { ...form.bankInfo, accountName: e.target.value })} />
                </div>
              </>
            )}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>
                <input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} /> Kích hoạt phương thức này
              </label>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>
                <input type="radio" checked={form.isDefault} onChange={(e) => set("isDefault", e.target.checked)} /> Đặt làm mặc định
              </label>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>💾 Lưu</button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Gateway Modal ──────────────────────────────────────────────────
function EditGatewayModal({ gateway, onClose, onSave }: any) {
  const [form, setForm] = useState({ ...gateway });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult(form.apiKey && form.merchantId ? "success" : "error");
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🔌 Tích hợp cổng thanh toán — {gateway.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Môi trường</label>
              <select className="form-control" value={form.environment} onChange={(e) => set("environment", e.target.value)}>
                <option value="sandbox">Sandbox (Test)</option>
                <option value="production">Production (Live)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="active">Đang kích hoạt</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>API Base URL</label>
              <input className="form-control" value={form.apiBaseUrl} onChange={(e) => set("apiBaseUrl", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Merchant ID</label>
              <input className="form-control" value={form.merchantId} onChange={(e) => set("merchantId", e.target.value)} />
            </div>
            <div className="form-group">
              <label>API Key / Secret</label>
              <input className="form-control" type="password" value={form.apiKey} onChange={(e) => set("apiKey", e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Webhook URL</label>
              <input className="form-control" value={form.webhookUrl} onChange={(e) => set("webhookUrl", e.target.value)} placeholder="https://tnpm.rox.vn/webhooks/..." />
              <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>
                🔔 NCC/cổng TT sẽ gọi URL này để đẩy trạng thái giao dịch — gạch nợ auto.
              </div>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>
                <input type="checkbox" checked={form.autoReconcile} onChange={(e) => set("autoReconcile", e.target.checked)} />
                {" "}Tự động đối soát & gạch nợ khi nhận callback
              </label>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Tính năng hỗ trợ</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {form.supportedFeatures?.map((f: string, i: number) => (
                  <span key={i} style={{ padding: "4px 10px", background: "#e6f7ff", color: "#1890ff", borderRadius: 12, fontSize: 12 }}>{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Test connection */}
          <div style={{ marginTop: 16, padding: 14, background: "#f5f7fa", borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>Test kết nối</strong>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>Kiểm tra API key và môi trường hiện tại</div>
              </div>
              <button className="btn btn-outline" onClick={handleTest} disabled={testing}>
                {testing ? "⏳ Đang test..." : "⚡ Test kết nối"}
              </button>
            </div>
            {testResult === "success" && <div style={{ marginTop: 10, color: "#52c41a" }}>✓ Kết nối thành công! Merchant {form.merchantId} đã xác thực.</div>}
            {testResult === "error" && <div style={{ marginTop: 10, color: "#ff4d4f" }}>✗ Thiếu API Key hoặc Merchant ID — chưa thể test.</div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>💾 Lưu cấu hình</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function SettingPaymentMethods() {
  document.title = "Cấu hình Phương thức & Cổng thanh toán – TNPM";
  const navigate = useNavigate();

  const [methods, setMethods] = useState<any[]>(MOCK_PAYMENT_METHODS);
  const [gateways, setGateways] = useState<any[]>(MOCK_PAYMENT_GATEWAYS);
  const [activeTab, setActiveTab] = useState<"methods" | "gateways">("methods");
  const [editMethod, setEditMethod] = useState<any>(null);
  const [editGateway, setEditGateway] = useState<any>(null);

  const toggleMethod = (id: number) => {
    setMethods((prev: any) => prev.map((m: any) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const setDefaultMethod = (id: number) => {
    setMethods((prev: any) => prev.map((m: any) => ({ ...m, isDefault: m.id === id })));
  };

  const handleSaveMethod = (data: any) => {
    setMethods((prev: any) => {
      let next = prev.map((m: any) => (m.id === data.id ? data : m));
      if (data.isDefault) next = next.map((m: any) => (m.id === data.id ? m : { ...m, isDefault: false }));
      return next;
    });
    setEditMethod(null);
  };

  const handleSaveGateway = (data: any) => {
    setGateways((prev: any) => prev.map((g: any) => (g.id === data.id ? data : g)));
    setEditGateway(null);
  };

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <button className="btn btn-outline" style={{ marginBottom: 8 }} onClick={() => navigate("/setting")}>← Cài đặt</button>
          <h1 className="page-title">💳 Phương thức & Cổng thanh toán</h1>
          <p className="page-sub">Cấu hình các phương thức thu phí và tích hợp cổng thanh toán (MSB Pay, App Timi, VNPay…)</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f0f0f0", background: "#fff", borderRadius: "12px 12px 0 0", padding: "0 16px", marginTop: 20 }}>
        {[
          { key: "methods", label: `Phương thức (${methods.length})` },
          { key: "gateways", label: `Cổng tích hợp (${gateways.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              padding: "14px 22px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 14, fontWeight: activeTab === t.key ? 600 : 400,
              color: activeTab === t.key ? "#1890ff" : "#8c8c8c",
              borderBottom: activeTab === t.key ? "2px solid #1890ff" : "2px solid transparent",
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Methods tab */}
      {activeTab === "methods" && (
        <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
            {methods.map((m: any) => (
              <div key={m.id} style={{
                border: m.enabled ? "1.5px solid #52c41a" : "1px solid #f0f0f0",
                borderRadius: 10, padding: 16,
                background: m.enabled ? "#f6ffed" : "#fafafa",
                opacity: m.enabled ? 1 : 0.7,
                position: "relative",
              }}>
                {m.isDefault && (
                  <span style={{ position: "absolute", top: 8, right: 8, background: "#1890ff", color: "#fff", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                    MẶC ĐỊNH
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 30 }}>{m.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>Mã: {m.code} · {m.type}</div>
                  </div>
                  <label style={{ cursor: "pointer" }}>
                    <input type="checkbox" checked={m.enabled} onChange={() => toggleMethod(m.id)} />
                  </label>
                </div>
                <div style={{ fontSize: 12, color: "#595959", marginTop: 10, minHeight: 32 }}>{m.description}</div>
                <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 6 }}>
                  🏦 Quỹ: {m.fundMapping || "—"}
                  {m.fee > 0 && <> · Phí: {m.fee}%</>}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <button className="btn btn-outline" style={{ flex: 1, padding: "6px 10px", fontSize: 12 }} onClick={() => setEditMethod(m)}>✏️ Sửa</button>
                  {!m.isDefault && m.enabled && (
                    <button className="btn btn-outline" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => setDefaultMethod(m.id)}>⭐ Đặt mặc định</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gateways tab */}
      {activeTab === "gateways" && (
        <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 16 }}>
            {gateways.map((g: any) => (
              <div key={g.id} style={{
                border: g.status === "active" ? "1.5px solid #1890ff" : "1px solid #f0f0f0",
                borderRadius: 10, padding: 18, background: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,.04)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>{g.provider} · {g.environment === "production" ? "🟢 LIVE" : "🟡 SANDBOX"}</div>
                  </div>
                  <span className="status-badge" style={{ background: g.status === "active" ? "#f6ffed" : "#fff1f0", color: g.status === "active" ? "#52c41a" : "#8c8c8c" }}>
                    {g.status === "active" ? "Đang hoạt động" : "Tạm dừng"}
                  </span>
                </div>

                <div style={{ marginTop: 12, padding: 12, background: "#f5f7fa", borderRadius: 6, fontSize: 12 }}>
                  <div style={{ marginBottom: 4 }}><strong>Merchant:</strong> {g.merchantId || "—"}</div>
                  <div style={{ marginBottom: 4 }}><strong>API Base:</strong> <span style={{ color: "#595959" }}>{g.apiBaseUrl}</span></div>
                  <div><strong>Webhook:</strong> <span style={{ color: "#595959" }}>{g.webhookUrl || "—"}</span></div>
                </div>

                {g.status === "active" && (
                  <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 11 }}>
                    <div><span style={{ color: "#8c8c8c" }}>Tỉ lệ thành công:</span> <strong style={{ color: "#52c41a" }}>{g.successRate}%</strong></div>
                    <div><span style={{ color: "#8c8c8c" }}>Latency:</span> <strong>{g.avgResponseMs}ms</strong></div>
                    <div><span style={{ color: "#8c8c8c" }}>Sync cuối:</span> {fmtDate(g.lastSyncAt)}</div>
                  </div>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                  {g.supportedFeatures?.map((f: string, i: number) => (
                    <span key={i} style={{ padding: "3px 8px", background: "#e6f7ff", color: "#1890ff", borderRadius: 10, fontSize: 11 }}>{f}</span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: "8px 12px", fontSize: 13 }} onClick={() => setEditGateway(g)}>⚙️ Cấu hình</button>
                  <button className="btn btn-outline" style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => alert(`Mở dashboard giao dịch ${g.name} (coming soon)`)}>📊 Log</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 16, background: "#fffbe6", borderRadius: 8, border: "1px dashed #faad14" }}>
            <strong style={{ color: "#ad6800" }}>💡 Ghi chú tích hợp:</strong>
            <ul style={{ margin: "8px 0 0 18px", fontSize: 12, color: "#595959" }}>
              <li>Webhook URL phải HTTPS + whitelist IP của cổng TT.</li>
              <li>Bật "Tự động đối soát" để hệ thống gạch nợ ngay khi nhận callback.</li>
              <li>Sandbox dùng cho dev/QA, Production cho môi trường thật — API key khác nhau.</li>
              <li>MSB Pay & App Timi đã được cấu hình sẵn theo hợp đồng với TNPM.</li>
            </ul>
          </div>
        </div>
      )}

      {editMethod && <EditMethodModal method={editMethod} onClose={() => setEditMethod(null)} onSave={handleSaveMethod} />}
      {editGateway && <EditGatewayModal gateway={editGateway} onClose={() => setEditGateway(null)} onSave={handleSaveGateway} />}
    </div>
  );
}
