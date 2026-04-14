import React, { useState, useMemo } from "react";
import {
  MOCK_NOTIFICATION_TEMPLATES, MOCK_NOTIFICATION_SEGMENTS,
  MOCK_NOTIFICATION_CAMPAIGNS, MOCK_NOTIFICATION_RULES,
  MOCK_NOTIFICATION_HISTORY, MOCK_DEBTS, MOCK_PROJECTS,
} from "assets/mock/TNPMData";

const CHANNEL_META: Record<string, { label: string; icon: string; color: string }> = {
  sms: { label: "SMS", icon: "📱", color: "#1890ff" },
  email: { label: "Email", icon: "📧", color: "#722ed1" },
  zalo: { label: "Zalo OA", icon: "💬", color: "#0068ff" },
  push: { label: "Push FCM", icon: "🔔", color: "#faad14" },
};

const CAMPAIGN_STATUS_META: Record<string, { label: string; color: string }> = {
  draft: { label: "Nháp", color: "#8c8c8c" },
  scheduled: { label: "Đã lên lịch", color: "#1890ff" },
  sending: { label: "Đang gửi", color: "#faad14" },
  sent: { label: "Đã gửi", color: "#52c41a" },
  failed: { label: "Thất bại", color: "#ff4d4f" },
};

const CATEGORY_LABELS: Record<string, string> = {
  fee_notice: "📢 Thông báo phí",
  debt_reminder: "⏰ Nhắc nợ (trước hạn)",
  debt_overdue: "⚠️ Nhắc nợ (quá hạn)",
  renewal: "🔄 Gia hạn HĐ",
  operational: "🔧 Vận hành / SR",
};

// ─── Template Modal ───────────────────────────────────────────────────────
function TemplateModal({ template, onClose, onSave }: any) {
  const isEdit = !!template?.id;
  const [form, setForm] = useState<any>({
    code: "", name: "", category: "fee_notice",
    channels: ["sms"],
    subject: "", content: "", smsContent: "",
    enabled: true,
    ...template,
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const toggleChannel = (ch: string) =>
    set("channels", form.channels.includes(ch) ? form.channels.filter((c: string) => c !== ch) : [...form.channels, ch]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Sửa mẫu thông báo" : "📝 Thêm mẫu thông báo"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Mã mẫu</label>
              <input className="form-control" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="TPL-DEBT-XXX" />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select className="form-control" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Tên mẫu *</label>
              <input className="form-control" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Kênh áp dụng</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {Object.entries(CHANNEL_META).map(([key, meta]) => (
                  <label key={key} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                    borderRadius: 20, cursor: "pointer",
                    border: form.channels.includes(key) ? `2px solid ${meta.color}` : "1px solid #d9d9d9",
                    background: form.channels.includes(key) ? `${meta.color}11` : "#fff",
                  }}>
                    <input type="checkbox" checked={form.channels.includes(key)} onChange={() => toggleChannel(key)} style={{ display: "none" }} />
                    <span style={{ fontSize: 16 }}>{meta.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: form.channels.includes(key) ? 600 : 400, color: form.channels.includes(key) ? meta.color : "#595959" }}>
                      {meta.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Tiêu đề (Email / Zalo)</label>
              <input className="form-control" value={form.subject} onChange={(e) => set("subject", e.target.value)} />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Nội dung Email / Zalo / Push</label>
              <textarea className="form-control" rows={6} value={form.content} onChange={(e) => set("content", e.target.value)} style={{ fontFamily: "monospace", fontSize: 12 }} />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Nội dung SMS (ngắn, &lt; 160 ký tự)</label>
              <textarea className="form-control" rows={2} value={form.smsContent} onChange={(e) => set("smsContent", e.target.value)} maxLength={160} />
              <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4, textAlign: "right" }}>{form.smsContent?.length || 0}/160</div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: 12, background: "#e6f7ff", borderRadius: 6, fontSize: 12 }}>
            💡 <strong>Biến có sẵn:</strong> <code>{"{customerName}"}</code>, <code>{"{amount}"}</code>, <code>{"{dueDate}"}</code>, <code>{"{invoiceCode}"}</code>, <code>{"{daysOverdue}"}</code>, <code>{"{projectName}"}</code>, <code>{"{period}"}</code>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...form, id: form.id || Date.now() })}>💾 Lưu mẫu</button>
        </div>
      </div>
    </div>
  );
}

// ─── Campaign Modal ───────────────────────────────────────────────────────
function CampaignModal({ campaign, onClose, onSave }: any) {
  const isEdit = !!campaign?.id;
  const [form, setForm] = useState<any>({
    name: "",
    templateId: MOCK_NOTIFICATION_TEMPLATES[0]?.id || 1,
    segmentId: MOCK_NOTIFICATION_SEGMENTS[0]?.id || 1,
    channels: ["sms", "email"],
    scheduleType: "once",
    scheduledAt: "",
    recurringRule: "",
    note: "",
    ...campaign,
  });
  const [step, setStep] = useState(1);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const template = MOCK_NOTIFICATION_TEMPLATES.find((t: any) => t.id === +form.templateId);
  const segment = MOCK_NOTIFICATION_SEGMENTS.find((s: any) => s.id === +form.segmentId);

  const handleSave = (asDraft: boolean) => {
    if (!form.name) return alert("Vui lòng nhập tên chiến dịch");
    if (!template || !segment) return alert("Chưa chọn mẫu hoặc phân khúc");

    onSave({
      ...form,
      id: form.id || Date.now(),
      code: form.code || `CMP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      templateId: +form.templateId,
      segmentId: +form.segmentId,
      templateName: template.name,
      segmentName: segment.name,
      status: asDraft ? "draft" : "scheduled",
      recipientCount: segment.estimatedCount,
      successCount: 0, failCount: 0, openCount: 0, clickCount: 0,
      sentAt: null,
      createdBy: "Người dùng hiện tại",
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "✏️ Sửa chiến dịch" : "📨 Tạo chiến dịch thông báo"}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", padding: "14px 20px", background: "#fafafa", borderBottom: "1px solid #f0f0f0", gap: 8 }}>
          {[
            { n: 1, label: "Cơ bản" },
            { n: 2, label: "Mẫu + Phân khúc" },
            { n: 3, label: "Lịch gửi" },
            { n: 4, label: "Xem lại" },
          ].map((s) => (
            <div key={s.n} style={{
              flex: 1, padding: "8px 10px", textAlign: "center", borderRadius: 6, cursor: "pointer",
              background: step >= s.n ? "#1890ff" : "#e8e8e8",
              color: step >= s.n ? "#fff" : "#8c8c8c",
              fontSize: 12, fontWeight: step === s.n ? 700 : 500,
            }} onClick={() => setStep(s.n)}>
              {s.n}. {s.label}
            </div>
          ))}
        </div>

        <div className="modal-body">
          {/* STEP 1: Basic info */}
          {step === 1 && (
            <div>
              <div className="form-group">
                <label>Tên chiến dịch *</label>
                <input className="form-control" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="VD: Nhắc nợ quá hạn tháng 4" />
              </div>
              <div className="form-group">
                <label>Mô tả / Ghi chú</label>
                <textarea className="form-control" rows={3} value={form.note} onChange={(e) => set("note", e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 2: Template + Segment */}
          {step === 2 && (
            <div>
              <div className="form-group">
                <label>Mẫu thông báo *</label>
                <select className="form-control" value={form.templateId} onChange={(e) => set("templateId", +e.target.value)}>
                  {MOCK_NOTIFICATION_TEMPLATES.filter((t: any) => t.enabled).map((t: any) => (
                    <option key={t.id} value={t.id}>{CATEGORY_LABELS[t.category]} — {t.name}</option>
                  ))}
                </select>
                {template && (
                  <div style={{ marginTop: 10, padding: 12, background: "#f5f7fa", borderRadius: 6 }}>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>Tiêu đề</div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{template.subject}</div>
                    <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 8 }}>Nội dung preview</div>
                    <div style={{ fontSize: 12, whiteSpace: "pre-wrap", maxHeight: 120, overflow: "auto", padding: 8, background: "#fff", borderRadius: 4 }}>
                      {template.content}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Phân khúc khách hàng *</label>
                <select className="form-control" value={form.segmentId} onChange={(e) => set("segmentId", +e.target.value)}>
                  {MOCK_NOTIFICATION_SEGMENTS.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} — ước tính {s.estimatedCount} người nhận</option>
                  ))}
                </select>
                {segment && (
                  <div style={{ marginTop: 10, padding: 12, background: "#e6f7ff", borderRadius: 6 }}>
                    <div style={{ fontWeight: 600 }}>{segment.name}</div>
                    <div style={{ fontSize: 12, color: "#595959", marginTop: 4 }}>{segment.description}</div>
                    <div style={{ fontSize: 12, color: "#1890ff", fontWeight: 600, marginTop: 6 }}>
                      👥 Ước tính {segment.estimatedCount} người nhận
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Kênh gửi</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {(template?.channels || []).map((ch: string) => {
                    const meta = CHANNEL_META[ch];
                    if (!meta) return null;
                    const enabled = form.channels.includes(ch);
                    return (
                      <label key={ch} style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                        borderRadius: 20, cursor: "pointer",
                        border: enabled ? `2px solid ${meta.color}` : "1px solid #d9d9d9",
                        background: enabled ? `${meta.color}11` : "#fff",
                      }}>
                        <input type="checkbox" checked={enabled} onChange={() => {
                          set("channels", enabled ? form.channels.filter((c: string) => c !== ch) : [...form.channels, ch]);
                        }} style={{ display: "none" }} />
                        <span style={{ fontSize: 16 }}>{meta.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: enabled ? 600 : 400, color: enabled ? meta.color : "#595959" }}>{meta.label}</span>
                      </label>
                    );
                  })}
                </div>
                <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 6 }}>Chỉ hiển thị kênh mà mẫu đã được cấu hình.</div>
              </div>
            </div>
          )}

          {/* STEP 3: Schedule */}
          {step === 3 && (
            <div>
              <div className="form-group">
                <label>Kiểu gửi</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { v: "now", label: "🚀 Gửi ngay lập tức" },
                    { v: "once", label: "📅 Lên lịch 1 lần" },
                    { v: "recurring", label: "🔁 Định kỳ (Recurring)" },
                  ].map((opt) => (
                    <label key={opt.v} style={{
                      flex: 1, padding: 14, textAlign: "center",
                      border: form.scheduleType === opt.v ? "2px solid #1890ff" : "1px solid #d9d9d9",
                      borderRadius: 8, cursor: "pointer",
                      background: form.scheduleType === opt.v ? "#e6f7ff" : "#fff",
                    }}>
                      <input type="radio" checked={form.scheduleType === opt.v} onChange={() => set("scheduleType", opt.v)} style={{ display: "none" }} />
                      <div style={{ fontSize: 14, fontWeight: form.scheduleType === opt.v ? 600 : 400, color: form.scheduleType === opt.v ? "#1890ff" : "#595959" }}>
                        {opt.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {form.scheduleType === "once" && (
                <div className="form-group">
                  <label>Thời điểm gửi</label>
                  <input className="form-control" type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} />
                </div>
              )}

              {form.scheduleType === "recurring" && (
                <div className="form-group">
                  <label>Quy tắc định kỳ</label>
                  <select className="form-control" value={form.recurringRule} onChange={(e) => set("recurringRule", e.target.value)}>
                    <option value="">-- Chọn quy tắc --</option>
                    <option value="Hàng tháng, ngày 1, lúc 08:00">Hàng tháng, ngày 1, 08:00</option>
                    <option value="Hàng tháng, ngày 15, lúc 08:00">Hàng tháng, ngày 15, 08:00</option>
                    <option value="Hàng tháng, ngày 25, lúc 08:00">Hàng tháng, ngày 25, 08:00</option>
                    <option value="Hàng tuần, thứ 2, 09:00">Hàng tuần, thứ 2, 09:00</option>
                    <option value="Hàng ngày, 08:00">Hàng ngày, 08:00</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <div>
              <div style={{ background: "#fafafa", padding: 14, borderRadius: 8, marginBottom: 14 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>📋 Xem lại trước khi kích hoạt</div>
                {[
                  { l: "Tên chiến dịch", v: form.name },
                  { l: "Mẫu sử dụng", v: template?.name },
                  { l: "Phân khúc", v: segment?.name },
                  { l: "Số người nhận ước tính", v: `${segment?.estimatedCount || 0} người` },
                  { l: "Kênh gửi", v: form.channels.map((c: string) => `${CHANNEL_META[c]?.icon} ${CHANNEL_META[c]?.label}`).join(", ") },
                  { l: "Kiểu gửi", v: form.scheduleType === "now" ? "🚀 Gửi ngay" : form.scheduleType === "once" ? `📅 ${form.scheduledAt || "Chưa chọn thời điểm"}` : `🔁 ${form.recurringRule}` },
                ].map((i, idx) => (
                  <div key={idx} style={{ display: "flex", padding: "6px 0", borderBottom: "1px solid #e8e8e8", fontSize: 13 }}>
                    <span style={{ width: 180, color: "#8c8c8c" }}>{i.l}</span>
                    <span style={{ fontWeight: 500 }}>{i.v || "—"}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: 12, background: "#fff7e6", borderRadius: 6, fontSize: 12 }}>
                ⚠ Khi kích hoạt, chiến dịch sẽ gửi thông báo tới <strong>{segment?.estimatedCount || 0} người nhận</strong> qua {form.channels.length} kênh. Vui lòng kiểm tra kỹ trước khi xác nhận.
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
          <button className="btn btn-outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>← Bước trước</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline" onClick={onClose}>Hủy</button>
            {step < 4 && <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Bước tiếp →</button>}
            {step === 4 && (
              <>
                <button className="btn btn-outline" onClick={() => handleSave(true)}>💾 Lưu nháp</button>
                <button className="btn btn-primary" onClick={() => handleSave(false)}>🚀 Kích hoạt</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function FeeNotificationList() {
  document.title = "Thông báo & Nhắc nợ – TNPM";

  const [templates, setTemplates] = useState<any[]>(MOCK_NOTIFICATION_TEMPLATES);
  const [campaigns, setCampaigns] = useState<any[]>(MOCK_NOTIFICATION_CAMPAIGNS);
  const [rules, setRules] = useState<any[]>(MOCK_NOTIFICATION_RULES);
  const [activeTab, setActiveTab] = useState<"campaigns" | "templates" | "rules" | "history">("campaigns");

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editCampaign, setEditCampaign] = useState<any>(null);

  const handleSaveTemplate = (data: any) => {
    if (templates.find((t: any) => t.id === data.id)) {
      setTemplates((p: any) => p.map((t: any) => (t.id === data.id ? data : t)));
    } else {
      setTemplates((p: any) => [...p, data]);
    }
    setShowTemplateModal(false);
    setEditTemplate(null);
  };

  const handleSaveCampaign = (data: any) => {
    if (campaigns.find((c: any) => c.id === data.id)) {
      setCampaigns((p: any) => p.map((c: any) => (c.id === data.id ? data : c)));
    } else {
      setCampaigns((p: any) => [...p, data]);
    }
    setShowCampaignModal(false);
    setEditCampaign(null);
  };

  const toggleRule = (id: number) => {
    setRules((p: any) => p.map((r: any) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  // KPI
  const totalSentThisMonth = campaigns.filter((c: any) => c.status === "sent").reduce((a: number, c: any) => a + c.successCount, 0);
  const scheduledCount = campaigns.filter((c: any) => c.status === "scheduled").length;
  const activeRules = rules.filter((r: any) => r.enabled).length;
  const debtTargets = MOCK_DEBTS.filter((d: any) => d.kind === "receivable" && d.status !== "paid").length;

  return (
    <div className="tnpm-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📨 Thông báo phí & Nhắc nợ</h1>
          <p className="page-sub">Tạo chiến dịch thông báo phí, nhắc nợ, nhắc gia hạn — gửi tự động qua SMS/Email/Zalo/Push theo phân khúc khách hàng</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={() => { setEditTemplate(null); setShowTemplateModal(true); }}>📝 Thêm mẫu</button>
          <button className="btn btn-primary" onClick={() => { setEditCampaign(null); setShowCampaignModal(true); }}>+ Tạo chiến dịch</button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Đã gửi tháng này", value: `${totalSentThisMonth} msg`, sub: `${campaigns.filter((c: any) => c.status === "sent").length} chiến dịch`, color: "#52c41a", icon: "✅" },
          { label: "Đang lên lịch", value: `${scheduledCount} CD`, sub: "Sẵn sàng chạy", color: "#1890ff", icon: "📅" },
          { label: "Quy tắc tự động active", value: `${activeRules}/${rules.length}`, sub: `${rules.reduce((a: number, r: any) => a + r.totalSent, 0)} msg đã gửi`, color: "#722ed1", icon: "⚡" },
          { label: "KH đang nợ", value: `${debtTargets} người`, sub: "Cần nhắc nợ", color: "#ff4d4f", icon: "⚠️" },
          { label: "Mẫu thông báo", value: `${templates.filter((t: any) => t.enabled).length}/${templates.length}`, sub: "Active / tổng", color: "#faad14", icon: "📝" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 14px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 16 }}>{s.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#1a1a2e", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f0f0f0", background: "#fff", borderRadius: "12px 12px 0 0", padding: "0 16px" }}>
        {[
          { key: "campaigns", label: `📨 Chiến dịch (${campaigns.length})` },
          { key: "templates", label: `📝 Mẫu thông báo (${templates.length})` },
          { key: "rules", label: `⚡ Quy tắc tự động (${rules.length})` },
          { key: "history", label: `📜 Lịch sử gửi (${MOCK_NOTIFICATION_HISTORY.length})` },
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

      {/* CAMPAIGNS TAB */}
      {activeTab === "campaigns" && (
        <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên chiến dịch</th>
                <th>Mẫu</th>
                <th>Phân khúc</th>
                <th>Kênh</th>
                <th>Lịch</th>
                <th>Người nhận</th>
                <th>Tỉ lệ mở</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c: any) => {
                const statusMeta = CAMPAIGN_STATUS_META[c.status] || CAMPAIGN_STATUS_META.draft;
                const openRate = c.successCount > 0 ? (c.openCount / c.successCount * 100) : 0;
                return (
                  <tr key={c.id}>
                    <td><span className="code-text">{c.code}</span></td>
                    <td style={{ fontWeight: 500, maxWidth: 200 }}>
                      <div>{c.name}</div>
                      <div style={{ fontSize: 11, color: "#8c8c8c" }}>{c.note}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{c.templateName}</td>
                    <td style={{ fontSize: 12 }}>{c.segmentName}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {c.channels.map((ch: string) => (
                          <span key={ch} title={CHANNEL_META[ch]?.label} style={{ fontSize: 16 }}>
                            {CHANNEL_META[ch]?.icon}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize: 11 }}>
                      {c.scheduleType === "recurring" ? <>🔁 {c.recurringRule}</> : <>📅 {c.scheduledAt}</>}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.recipientCount}</div>
                      {c.status === "sent" && (
                        <div style={{ fontSize: 10, color: "#52c41a" }}>✓ {c.successCount} gửi</div>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {c.status === "sent" ? (
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1890ff" }}>{openRate.toFixed(0)}%</div>
                      ) : <span style={{ fontSize: 11, color: "#8c8c8c" }}>—</span>}
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: `${statusMeta.color}22`, color: statusMeta.color }}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button className="action-btn" onClick={() => { setEditCampaign(c); setShowCampaignModal(true); }} title="Sửa / Xem">✏️</button>
                        {c.status === "draft" && (
                          <button className="action-btn" title="Kích hoạt" onClick={() => alert("Kích hoạt chiến dịch (coming soon)")}>🚀</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TEMPLATES TAB */}
      {activeTab === "templates" && (
        <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 14 }}>
            {templates.map((t: any) => (
              <div key={t.id} style={{
                border: "1px solid #f0f0f0", borderRadius: 10, padding: 16,
                background: t.enabled ? "#fff" : "#fafafa", opacity: t.enabled ? 1 : 0.6,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#8c8c8c" }}>{CATEGORY_LABELS[t.category]}</div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>{t.code}</div>
                  </div>
                  <label>
                    <input type="checkbox" checked={t.enabled} onChange={() => {
                      setTemplates((p: any) => p.map((x: any) => (x.id === t.id ? { ...x, enabled: !x.enabled } : x)));
                    }} />
                  </label>
                </div>

                <div style={{ fontSize: 12, color: "#595959", background: "#fafafa", padding: 8, borderRadius: 4, marginBottom: 10, maxHeight: 60, overflow: "hidden" }}>
                  {t.subject && <div style={{ fontWeight: 600 }}>{t.subject}</div>}
                  <div style={{ color: "#8c8c8c", whiteSpace: "pre-wrap" }}>{(t.content || "").slice(0, 100)}...</div>
                </div>

                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {t.channels.map((ch: string) => {
                    const meta = CHANNEL_META[ch];
                    if (!meta) return null;
                    return (
                      <span key={ch} style={{ fontSize: 11, padding: "3px 8px", background: `${meta.color}22`, color: meta.color, borderRadius: 10 }}>
                        {meta.icon} {meta.label}
                      </span>
                    );
                  })}
                </div>

                <button className="btn btn-outline" style={{ width: "100%", padding: "6px 10px", fontSize: 12 }} onClick={() => { setEditTemplate(t); setShowTemplateModal(true); }}>
                  ✏️ Sửa mẫu
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RULES TAB */}
      {activeTab === "rules" && (
        <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          <div style={{ padding: 14, background: "#e6f7ff", borderLeft: "4px solid #1890ff", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
            ⚡ <strong>Quy tắc tự động</strong> chạy mỗi ngày lúc 08:00 — tự động phát hiện các khách hàng thỏa điều kiện và gửi thông báo theo mẫu đã chọn.
            Không cần tạo chiến dịch thủ công cho các case định kỳ.
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Tên quy tắc</th>
                <th>Điều kiện kích hoạt</th>
                <th>Mẫu áp dụng</th>
                <th>Kênh</th>
                <th>Lần chạy cuối</th>
                <th>Tổng đã gửi</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r: any) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td style={{ fontSize: 12 }}>{r.triggerLabel}</td>
                  <td style={{ fontSize: 12 }}>{r.templateName}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {r.channels.map((ch: string) => (
                        <span key={ch} title={CHANNEL_META[ch]?.label} style={{ fontSize: 14 }}>
                          {CHANNEL_META[ch]?.icon}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: 11 }}>{r.lastRunAt || "—"}</td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: "#722ed1" }}>{r.totalSent}</td>
                  <td>
                    <label className="switch" style={{ cursor: "pointer" }}>
                      <input type="checkbox" checked={r.enabled} onChange={() => toggleRule(r.id)} />
                      <span style={{ marginLeft: 6, fontSize: 12, color: r.enabled ? "#52c41a" : "#8c8c8c" }}>
                        {r.enabled ? "Active" : "Tắt"}
                      </span>
                    </label>
                  </td>
                  <td>
                    <button className="action-btn" title="Sửa" onClick={() => alert("Sửa quy tắc (coming soon)")}>✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === "history" && (
        <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã chiến dịch</th>
                <th>Người nhận</th>
                <th>Kênh</th>
                <th>Mẫu</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Gửi lúc</th>
                <th>Mở lúc</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_NOTIFICATION_HISTORY.map((h: any) => {
                const meta = CHANNEL_META[h.channel];
                return (
                  <tr key={h.id}>
                    <td><span className="code-text">{h.campaignCode}</span></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{h.recipientName}</div>
                      <div style={{ fontSize: 11, color: "#8c8c8c" }}>{h.recipientContact}</div>
                    </td>
                    <td>
                      <span style={{ padding: "3px 8px", background: `${meta?.color}22`, color: meta?.color, borderRadius: 10, fontSize: 11 }}>
                        {meta?.icon} {meta?.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{h.templateName}</td>
                    <td style={{ fontSize: 11, color: "#595959", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.content}</td>
                    <td>
                      <span className="status-badge" style={{
                        background: h.status === "delivered" ? "#f6ffed" : h.status === "failed" ? "#fff1f0" : "#fff7e6",
                        color: h.status === "delivered" ? "#52c41a" : h.status === "failed" ? "#ff4d4f" : "#faad14",
                      }}>
                        {h.status === "delivered" ? "Đã gửi" : h.status === "failed" ? "Lỗi" : "Pending"}
                      </span>
                    </td>
                    <td style={{ fontSize: 11 }}>{h.sentAt}</td>
                    <td style={{ fontSize: 11, color: h.openedAt ? "#52c41a" : "#8c8c8c" }}>{h.openedAt || "Chưa mở"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showTemplateModal && <TemplateModal template={editTemplate} onClose={() => { setShowTemplateModal(false); setEditTemplate(null); }} onSave={handleSaveTemplate} />}
      {showCampaignModal && <CampaignModal campaign={editCampaign} onClose={() => { setShowCampaignModal(false); setEditCampaign(null); }} onSave={handleSaveCampaign} />}
    </div>
  );
}
