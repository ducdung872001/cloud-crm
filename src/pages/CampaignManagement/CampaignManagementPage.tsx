import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import Badge from "components/badge/badge";
import "./CampaignManagementPage.scss";

interface Campaign {
  id: number;
  name: string;
  channels: string[];
  segment: string;
  status: "active" | "draft" | "completed" | "scheduled";
  sent: number;
  openRate: number;
  revenue: number;
  startDate: string;
  endDate?: string;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 1, name: "Flash Sale cuối tuần", channels: ["SMS", "Zalo"], segment: "Khách hàng VIP", status: "active", sent: 1495, openRate: 76, revenue: 32000000, startDate: "14/03/2026" },
  { id: 2, name: "Chào mừng hội viên mới", channels: ["Email", "App"], segment: "Hội viên mới", status: "active", sent: 620, openRate: 58, revenue: 4500000, startDate: "01/03/2026" },
  { id: 3, name: "Nhắc điểm sắp hết hạn", channels: ["App", "SMS"], segment: "Điểm sắp hết hạn", status: "completed", sent: 456, openRate: 72, revenue: 6300000, startDate: "12/03/2026" },
  { id: 4, name: "Khuyến mãi sinh nhật", channels: ["SMS", "Email"], segment: "Sinh nhật tháng 3", status: "scheduled", sent: 0, openRate: 0, revenue: 0, startDate: "25/03/2026" },
  { id: 5, name: "Tết Nguyên Đán 2026", channels: ["Zalo", "SMS", "Email"], segment: "Tất cả khách hàng", status: "completed", sent: 12450, openRate: 61, revenue: 98000000, startDate: "25/01/2026", endDate: "10/02/2026" },
];

const CHANNEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SMS:   { label: "SMS",   color: "#15803D", bg: "#DCFCE7" },
  Zalo:  { label: "Zalo",  color: "#1D4ED8", bg: "#DBEAFE" },
  Email: { label: "Email", color: "#C2410C", bg: "#FFEDD5" },
  App:   { label: "App",   color: "#7E22CE", bg: "#F3E8FF" },
};

const STATUS_CONFIG: Record<string, { label: string; variant: any }> = {
  active:    { label: "Đang chạy",  variant: "success" },
  completed: { label: "Hoàn thành", variant: "done" },
  draft:     { label: "Nháp",       variant: "warning" },
  scheduled: { label: "Đã lên lịch", variant: "info" },
};

type FormStep = "info" | "audience" | "channel" | "content" | "schedule";

interface CampaignForm {
  name: string;
  goal: string;
  segment: string;
  channels: string[];
  content: Record<string, string>;
  sendType: "now" | "schedule";
  scheduleDate: string;
  scheduleTime: string;
}

const defaultForm: CampaignForm = {
  name: "",
  goal: "",
  segment: "",
  channels: [],
  content: {},
  sendType: "now",
  scheduleDate: "",
  scheduleTime: "",
};

export default function CampaignManagementPage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Tạo & quản lý chiến dịch";

  const [view, setView] = useState<"list" | "create">("list");
  const [step, setStep] = useState<FormStep>("info");
  const [form, setForm] = useState<CampaignForm>(defaultForm);
  const [filterStatus, setFilterStatus] = useState("all");

  const steps: { key: FormStep; label: string }[] = [
    { key: "info",     label: "Thông tin" },
    { key: "audience", label: "Đối tượng" },
    { key: "channel",  label: "Kênh gửi" },
    { key: "content",  label: "Nội dung" },
    { key: "schedule", label: "Lịch gửi" },
  ];

  const stepIdx = steps.findIndex(s => s.key === step);

  const filteredCampaigns = filterStatus === "all"
    ? MOCK_CAMPAIGNS
    : MOCK_CAMPAIGNS.filter(c => c.status === filterStatus);

  const summaryStats = {
    total: MOCK_CAMPAIGNS.length,
    active: MOCK_CAMPAIGNS.filter(c => c.status === "active").length,
    totalSent: MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.sent, 0),
    avgOpen: Math.round(MOCK_CAMPAIGNS.filter(c => c.sent > 0).reduce((sum, c) => sum + c.openRate, 0) / MOCK_CAMPAIGNS.filter(c => c.sent > 0).length),
  };

  const handleSubmit = () => {
    alert(`Chiến dịch "${form.name}" đã được tạo thành công (demo)`);
    setView("list");
    setStep("info");
    setForm(defaultForm);
  };

  if (view === "create") {
    return (
      <div className="page-content">
        <TitleAction
          title="Tạo chiến dịch mới"
          breadcrumb={[
            { title: "Chiến dịch Marketing", onClick: () => onBackProps(true) },
            { title: "Tạo & quản lý chiến dịch", onClick: () => setView("list") },
          ]}
        />

        {/* Stepper */}
        <div className="cm-stepper">
          {steps.map((s, idx) => (
            <React.Fragment key={s.key}>
              <div
                className={`cm-step ${idx < stepIdx ? "cm-step--done" : ""} ${idx === stepIdx ? "cm-step--active" : ""}`}
                onClick={() => idx <= stepIdx && setStep(s.key)}
              >
                <div className="cm-step__circle">
                  {idx < stepIdx ? "✓" : idx + 1}
                </div>
                <span className="cm-step__label">{s.label}</span>
              </div>
              {idx < steps.length - 1 && <div className={`cm-step__line ${idx < stepIdx ? "cm-step__line--done" : ""}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Form body */}
        <div className="cm-form-body">
          {step === "info" && (
            <div className="cm-form-section">
              <h3>Thông tin chiến dịch</h3>
              <div className="cm-form-grid">
                <div className="cm-field">
                  <label>Tên chiến dịch *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VD: Flash Sale cuối tuần tháng 3" />
                </div>
                <div className="cm-field">
                  <label>Mục tiêu chiến dịch</label>
                  <select value={form.goal} onChange={e => setForm({...form, goal: e.target.value})}>
                    <option value="">-- Chọn mục tiêu --</option>
                    <option value="awareness">Tăng nhận thức thương hiệu</option>
                    <option value="retention">Giữ chân khách hàng</option>
                    <option value="reactivation">Tái kích hoạt khách rời bỏ</option>
                    <option value="upsell">Upsell / Cross-sell</option>
                    <option value="birthday">Chúc mừng sinh nhật</option>
                    <option value="promotion">Thông báo khuyến mãi</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === "audience" && (
            <div className="cm-form-section">
              <h3>Chọn đối tượng mục tiêu</h3>
              <p className="cm-form-hint">Chọn phân khúc khách hàng sẽ nhận chiến dịch này</p>
              <div className="cm-segment-grid">
                {[
                  { id: "vip", name: "Khách hàng VIP", count: 1200, desc: "Hạng Vàng & Kim Cương, chi tiêu cao" },
                  { id: "new", name: "Hội viên mới", count: 850, desc: "Đăng ký trong 30 ngày gần đây" },
                  { id: "birthday", name: "Sinh nhật tháng 3", count: 234, desc: "Khách hàng có sinh nhật trong tháng" },
                  { id: "churn_risk", name: "Nguy cơ rời bỏ", count: 175, desc: "Không mua trong 60+ ngày" },
                  { id: "all", name: "Tất cả khách hàng", count: 18500, desc: "Toàn bộ danh sách khách hàng" },
                  { id: "custom", name: "Phân khúc tùy chỉnh", count: null, desc: "Tạo điều kiện lọc theo nhu cầu" },
                ].map(seg => (
                  <div
                    key={seg.id}
                    className={`cm-segment-card ${form.segment === seg.id ? "cm-segment-card--selected" : ""}`}
                    onClick={() => setForm({...form, segment: seg.id})}
                  >
                    <div className="cm-segment-card__name">{seg.name}</div>
                    {seg.count !== null && (
                      <div className="cm-segment-card__count">{seg.count.toLocaleString()} khách hàng</div>
                    )}
                    <div className="cm-segment-card__desc">{seg.desc}</div>
                    {form.segment === seg.id && <div className="cm-segment-card__check">✓</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "channel" && (
            <div className="cm-form-section">
              <h3>Chọn kênh gửi</h3>
              <p className="cm-form-hint">Có thể chọn nhiều kênh. Nội dung mỗi kênh được cấu hình riêng ở bước tiếp theo.</p>
              <div className="cm-channel-grid">
                {Object.entries(CHANNEL_CONFIG).map(([key, cfg]) => {
                  const isSelected = form.channels.includes(key);
                  return (
                    <div
                      key={key}
                      className={`cm-channel-card ${isSelected ? "cm-channel-card--selected" : ""}`}
                      style={{ borderColor: isSelected ? cfg.color : undefined }}
                      onClick={() => {
                        const next = isSelected ? form.channels.filter(c => c !== key) : [...form.channels, key];
                        setForm({...form, channels: next});
                      }}
                    >
                      <div className="cm-channel-badge" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </div>
                      <div className="cm-channel-desc">
                        {key === "SMS" && "Tin nhắn ngắn, tỷ lệ mở 81%"}
                        {key === "Zalo" && "Zalo OA, tỷ lệ mở 71%"}
                        {key === "Email" && "Email marketing, tỷ lệ mở 46%"}
                        {key === "App" && "Push notification, tỷ lệ mở 68%"}
                      </div>
                      {isSelected && <div className="cm-channel-check" style={{ color: cfg.color }}>✓ Đã chọn</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === "content" && (
            <div className="cm-form-section">
              <h3>Nội dung chiến dịch</h3>
              {form.channels.length === 0 ? (
                <div className="cm-empty-hint">⚠ Bạn chưa chọn kênh nào. Quay lại bước trước để chọn kênh.</div>
              ) : (
                <div className="cm-content-tabs">
                  {form.channels.map(ch => {
                    const cfg = CHANNEL_CONFIG[ch];
                    return (
                      <div key={ch} className="cm-content-section">
                        <div className="cm-content-section__header" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </div>
                        <div className="cm-field">
                          <label>Nội dung tin nhắn *</label>
                          <textarea
                            rows={ch === "Email" ? 6 : 3}
                            value={form.content[ch] || ""}
                            onChange={e => setForm({...form, content: {...form.content, [ch]: e.target.value}})}
                            placeholder={`Nhập nội dung gửi qua ${cfg.label}...${ch === "SMS" ? "\n\nTối đa 160 ký tự/tin" : ""}`}
                          />
                          {ch === "SMS" && (
                            <div className="cm-char-count">{(form.content[ch] || "").length}/160 ký tự</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === "schedule" && (
            <div className="cm-form-section">
              <h3>Lịch gửi chiến dịch</h3>
              <div className="cm-schedule-options">
                {[
                  { value: "now", label: "Gửi ngay", desc: "Chiến dịch sẽ được gửi ngay sau khi xác nhận" },
                  { value: "schedule", label: "Lên lịch", desc: "Chọn ngày và giờ cụ thể để gửi" },
                ].map(opt => (
                  <div
                    key={opt.value}
                    className={`cm-schedule-opt ${form.sendType === opt.value ? "cm-schedule-opt--selected" : ""}`}
                    onClick={() => setForm({...form, sendType: opt.value as any})}
                  >
                    <div className="cm-schedule-opt__label">{opt.label}</div>
                    <div className="cm-schedule-opt__desc">{opt.desc}</div>
                  </div>
                ))}
              </div>

              {form.sendType === "schedule" && (
                <div className="cm-form-grid" style={{ marginTop: 16 }}>
                  <div className="cm-field">
                    <label>Ngày gửi</label>
                    <input type="date" value={form.scheduleDate} onChange={e => setForm({...form, scheduleDate: e.target.value})} />
                  </div>
                  <div className="cm-field">
                    <label>Giờ gửi</label>
                    <input type="time" value={form.scheduleTime} onChange={e => setForm({...form, scheduleTime: e.target.value})} />
                  </div>
                </div>
              )}

              {/* Preview summary */}
              <div className="cm-preview-summary">
                <div className="cm-preview-summary__title">Tóm tắt chiến dịch</div>
                <div className="cm-preview-row"><span>Tên:</span><strong>{form.name || "—"}</strong></div>
                <div className="cm-preview-row"><span>Đối tượng:</span><strong>{form.segment || "—"}</strong></div>
                <div className="cm-preview-row">
                  <span>Kênh:</span>
                  <strong>
                    {form.channels.length > 0
                      ? form.channels.map(ch => CHANNEL_CONFIG[ch]?.label).join(", ")
                      : "—"}
                  </strong>
                </div>
                <div className="cm-preview-row">
                  <span>Lịch gửi:</span>
                  <strong>{form.sendType === "now" ? "Gửi ngay" : `${form.scheduleDate} lúc ${form.scheduleTime}`}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="cm-form-nav">
          {stepIdx > 0 && (
            <button className="btn-secondary" onClick={() => setStep(steps[stepIdx - 1].key)}>← Quay lại</button>
          )}
          {stepIdx === 0 && (
            <button className="btn-secondary" onClick={() => setView("list")}>Hủy</button>
          )}
          <div style={{ flex: 1 }} />
          {stepIdx < steps.length - 1 ? (
            <button className="btn-primary" onClick={() => setStep(steps[stepIdx + 1].key)}>
              Tiếp theo →
            </button>
          ) : (
            <button className="btn-primary btn-success" onClick={handleSubmit}>
              🚀 Tạo chiến dịch
            </button>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="page-content">
      <TitleAction
        title="Tạo & quản lý chiến dịch"
        breadcrumb={[{ title: "Chiến dịch Marketing", onClick: () => onBackProps(true) }]}
        listRightAction={[
          { title: "+ Tạo chiến dịch", type: "primary", onClick: () => setView("create") },
        ]}
      />

      {/* Summary stats */}
      <div className="cm-stats-row">
        {[
          { label: "Tổng chiến dịch", value: summaryStats.total, color: "#7C3AED" },
          { label: "Đang chạy", value: summaryStats.active, color: "#059669" },
          { label: "Tổng tin đã gửi", value: summaryStats.totalSent.toLocaleString(), color: "#2563EB" },
          { label: "Tỷ lệ mở TB", value: `${summaryStats.avgOpen}%`, color: "#D97706" },
        ].map(s => (
          <div className="cm-stat-card" key={s.label}>
            <div className="cm-stat-card__label">{s.label}</div>
            <div className="cm-stat-card__value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="cm-filter-bar">
        {["all", "active", "scheduled", "completed", "draft"].map(status => (
          <button
            key={status}
            className={`cm-filter-btn ${filterStatus === status ? "cm-filter-btn--active" : ""}`}
            onClick={() => setFilterStatus(status)}
          >
            {status === "all" ? "Tất cả" : STATUS_CONFIG[status]?.label}
          </button>
        ))}
      </div>

      {/* Campaign list */}
      <div className="cm-campaign-list">
        {filteredCampaigns.map(c => {
          const statusCfg = STATUS_CONFIG[c.status];
          return (
            <div className="cm-campaign-card" key={c.id}>
              <div className="cm-campaign-card__left">
                <div className="cm-campaign-card__name">{c.name}</div>
                <div className="cm-campaign-card__meta">
                  <span className="cm-campaign-card__segment">👥 {c.segment}</span>
                  <span className="cm-campaign-card__date">📅 {c.startDate}{c.endDate ? ` → ${c.endDate}` : ""}</span>
                </div>
                <div className="cm-campaign-card__channels">
                  {c.channels.map(ch => {
                    const cfg = CHANNEL_CONFIG[ch];
                    return (
                      <span key={ch} className="cm-channel-pill" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    );
                  })}
                </div>
              </div>
              <div className="cm-campaign-card__stats">
                {c.sent > 0 && (
                  <>
                    <div className="cm-campaign-card__stat">
                      <div className="cm-campaign-card__stat-val">{c.sent.toLocaleString()}</div>
                      <div className="cm-campaign-card__stat-lbl">Đã gửi</div>
                    </div>
                    <div className="cm-campaign-card__stat">
                      <div className="cm-campaign-card__stat-val" style={{ color: c.openRate >= 60 ? "#059669" : "#D97706" }}>{c.openRate}%</div>
                      <div className="cm-campaign-card__stat-lbl">Tỷ lệ mở</div>
                    </div>
                    <div className="cm-campaign-card__stat">
                      <div className="cm-campaign-card__stat-val" style={{ color: "#F97316" }}>{(c.revenue / 1000000).toFixed(1)}M</div>
                      <div className="cm-campaign-card__stat-lbl">Doanh thu</div>
                    </div>
                  </>
                )}
              </div>
              <div className="cm-campaign-card__right">
                <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                <div className="cm-campaign-card__actions">
                  <button className="cm-action-btn">Xem</button>
                  {c.status === "draft" && <button className="cm-action-btn cm-action-btn--primary">Chỉnh sửa</button>}
                  {c.status === "scheduled" && <button className="cm-action-btn cm-action-btn--danger">Hủy lịch</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
