import React, { useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import { ITitleActions } from "components/titleAction/titleAction";
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
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 1, name: "Flash Sale cuối tuần",          channels: ["SMS", "Zalo"],   segment: "Khách hàng VIP",     status: "active",    sent: 1495, openRate: 76, revenue: 32000000, startDate: "14/03/2026" },
  { id: 2, name: "Chào mừng hội viên mới",        channels: ["Email", "App"],  segment: "Hội viên mới",       status: "active",    sent: 620,  openRate: 58, revenue: 4500000,  startDate: "01/03/2026" },
  { id: 3, name: "Nhắc điểm sắp hết hạn",         channels: ["App", "SMS"],    segment: "Điểm sắp hết hạn",   status: "completed", sent: 456,  openRate: 72, revenue: 6300000,  startDate: "12/03/2026" },
  { id: 4, name: "Khuyến mãi sinh nhật",           channels: ["SMS", "Email"],  segment: "Sinh nhật tháng 3",  status: "scheduled", sent: 0,    openRate: 0,  revenue: 0,        startDate: "25/03/2026" },
  { id: 5, name: "Tết Nguyên Đán 2026",            channels: ["Zalo","SMS","Email"], segment: "Tất cả KH",    status: "completed", sent: 12450,openRate: 61, revenue: 98000000, startDate: "25/01/2026" },
];

const CHANNEL_CFG: Record<string, { label: string; color: string; bg: string }> = {
  SMS:   { label: "SMS",   color: "#15803D", bg: "#DCFCE7" },
  Zalo:  { label: "Zalo",  color: "#1D4ED8", bg: "#DBEAFE" },
  Email: { label: "Email", color: "#C2410C", bg: "#FFEDD5" },
  App:   { label: "App",   color: "#7E22CE", bg: "#F3E8FF" },
};

const STATUS_CFG: Record<string, { label: string; variant: any }> = {
  active:    { label: "Đang chạy",   variant: "success"  },
  completed: { label: "Hoàn thành",  variant: "done"     },
  draft:     { label: "Nháp",        variant: "warning"  },
  scheduled: { label: "Đã lên lịch", variant: "info"     },
};

type FormStep = "info" | "audience" | "channel" | "content" | "schedule";

const STEPS: { key: FormStep; label: string }[] = [
  { key: "info",     label: "Thông tin" },
  { key: "audience", label: "Đối tượng" },
  { key: "channel",  label: "Kênh gửi"  },
  { key: "content",  label: "Nội dung"  },
  { key: "schedule", label: "Lịch gửi"  },
];

export default function CampaignManagementPage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Tạo & quản lý chiến dịch";

  const [view, setView]             = useState<"list" | "create">("list");
  const [step, setStep]             = useState<FormStep>("info");
  const [filterStatus, setFilter]   = useState("all");
  const [form, setForm]             = useState({ name: "", goal: "", segment: "", channels: [] as string[], content: {} as Record<string, string>, sendType: "now" as "now" | "schedule", scheduleDate: "", scheduleTime: "" });

  const stepIdx      = STEPS.findIndex(s => s.key === step);
  const filtered     = filterStatus === "all" ? MOCK_CAMPAIGNS : MOCK_CAMPAIGNS.filter(c => c.status === filterStatus);
  const summaryStats = {
    total:     MOCK_CAMPAIGNS.length,
    active:    MOCK_CAMPAIGNS.filter(c => c.status === "active").length,
    totalSent: MOCK_CAMPAIGNS.reduce((s, c) => s + c.sent, 0),
    avgOpen:   Math.round(MOCK_CAMPAIGNS.filter(c => c.sent > 0).reduce((s, c) => s + c.openRate, 0) / MOCK_CAMPAIGNS.filter(c => c.sent > 0).length),
  };

  const titleActionsCreate: ITitleActions = {
    actions: [{ title: "+ Tạo chiến dịch", color: "primary", callback: () => setView("create") }],
  };

  /* ── Create view ── */
  if (view === "create") {
    return (
      <div className="page-content">
        <HeaderTabMenu
          title="Tạo chiến dịch mới"
          titleBack="Tạo & quản lý chiến dịch"
          onBackProps={() => { setView("list"); setStep("info"); }}
        />

        {/* Stepper */}
        <div className="cm-stepper">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.key}>
              <div className={`cm-step ${idx < stepIdx ? "cm-step--done" : ""} ${idx === stepIdx ? "cm-step--active" : ""}`}
                onClick={() => idx <= stepIdx && setStep(s.key)}>
                <div className="cm-step__circle">{idx < stepIdx ? "✓" : idx + 1}</div>
                <span className="cm-step__label">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && <div className={`cm-step__line ${idx < stepIdx ? "cm-step__line--done" : ""}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="cm-form-body">
          {step === "info" && (
            <div className="cm-form-section">
              <h3>Thông tin chiến dịch</h3>
              <div className="cm-form-grid">
                <div className="cm-field"><label>Tên chiến dịch *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Flash Sale cuối tuần tháng 3" />
                </div>
                <div className="cm-field"><label>Mục tiêu</label>
                  <select value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
                    <option value="">-- Chọn mục tiêu --</option>
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
              <p className="cm-form-hint">Chọn từ danh sách đối tượng đã tạo trong mục "Đối tượng chiến dịch"</p>
              <div className="cm-segment-grid">
                {[
                  { id: "vip",       name: "Khách hàng VIP",         count: 875  },
                  { id: "new",       name: "Hội viên mới 30 ngày",   count: 612  },
                  { id: "birthday",  name: "Sinh nhật tháng 3",      count: 234  },
                  { id: "churn",     name: "Nguy cơ rời bỏ",         count: 175  },
                  { id: "all",       name: "Tất cả khách hàng",      count: 18500 },
                ].map(seg => (
                  <div key={seg.id}
                    className={`cm-segment-card ${form.segment === seg.id ? "cm-segment-card--selected" : ""}`}
                    onClick={() => setForm({ ...form, segment: seg.id })}>
                    <div className="cm-segment-card__name">{seg.name}</div>
                    <div className="cm-segment-card__count">{seg.count.toLocaleString()} KH</div>
                    {form.segment === seg.id && <div className="cm-segment-card__check">✓</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "channel" && (
            <div className="cm-form-section">
              <h3>Chọn kênh gửi</h3>
              <p className="cm-form-hint">Có thể chọn nhiều kênh. Nội dung từng kênh cấu hình ở bước tiếp theo.</p>
              <div className="cm-channel-grid">
                {Object.entries(CHANNEL_CFG).map(([key, cfg]) => {
                  const isSel = form.channels.includes(key);
                  return (
                    <div key={key}
                      className={`cm-channel-card ${isSel ? "cm-channel-card--selected" : ""}`}
                      style={{ borderColor: isSel ? cfg.color : undefined }}
                      onClick={() => setForm({ ...form, channels: isSel ? form.channels.filter(c => c !== key) : [...form.channels, key] })}>
                      <div className="cm-channel-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</div>
                      <div className="cm-channel-rate">
                        {key === "SMS" && "Tỷ lệ mở 81%"}
                        {key === "Zalo" && "Tỷ lệ mở 71%"}
                        {key === "Email" && "Tỷ lệ mở 46%"}
                        {key === "App" && "Tỷ lệ mở 68%"}
                      </div>
                      {isSel && <div className="cm-channel-check" style={{ color: cfg.color }}>✓ Đã chọn</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === "content" && (
            <div className="cm-form-section">
              <h3>Nội dung chiến dịch</h3>
              {form.channels.length === 0
                ? <div className="cm-empty-hint">⚠ Chưa chọn kênh. Quay lại bước trước.</div>
                : form.channels.map(ch => {
                  const cfg = CHANNEL_CFG[ch];
                  return (
                    <div key={ch} className="cm-content-section">
                      <div className="cm-content-section__header" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</div>
                      <div className="cm-field" style={{ padding: "12px 16px" }}>
                        <label>Nội dung *</label>
                        <textarea rows={ch === "Email" ? 6 : 3}
                          value={form.content[ch] || ""}
                          onChange={e => setForm({ ...form, content: { ...form.content, [ch]: e.target.value } })}
                          placeholder={`Nhập nội dung gửi qua ${cfg.label}...`}
                        />
                        {ch === "SMS" && <div className="cm-char-count">{(form.content[ch] || "").length}/160 ký tự</div>}
                      </div>
                    </div>
                  );
                })
              }
            </div>
          )}

          {step === "schedule" && (
            <div className="cm-form-section">
              <h3>Lịch gửi</h3>
              <div className="cm-schedule-options">
                {[
                  { value: "now",      label: "Gửi ngay",  desc: "Chiến dịch gửi ngay sau khi xác nhận" },
                  { value: "schedule", label: "Lên lịch",  desc: "Chọn ngày và giờ cụ thể để gửi" },
                ].map(opt => (
                  <div key={opt.value}
                    className={`cm-schedule-opt ${form.sendType === opt.value ? "cm-schedule-opt--selected" : ""}`}
                    onClick={() => setForm({ ...form, sendType: opt.value as any })}>
                    <div className="cm-schedule-opt__label">{opt.label}</div>
                    <div className="cm-schedule-opt__desc">{opt.desc}</div>
                  </div>
                ))}
              </div>
              {form.sendType === "schedule" && (
                <div className="cm-form-grid" style={{ marginTop: 14 }}>
                  <div className="cm-field"><label>Ngày gửi</label><input type="date" value={form.scheduleDate} onChange={e => setForm({ ...form, scheduleDate: e.target.value })} /></div>
                  <div className="cm-field"><label>Giờ gửi</label><input type="time" value={form.scheduleTime} onChange={e => setForm({ ...form, scheduleTime: e.target.value })} /></div>
                </div>
              )}
              <div className="cm-preview-summary">
                <div className="cm-preview-summary__title">Tóm tắt</div>
                <div className="cm-preview-row"><span>Tên:</span><strong>{form.name || "—"}</strong></div>
                <div className="cm-preview-row"><span>Đối tượng:</span><strong>{form.segment || "—"}</strong></div>
                <div className="cm-preview-row"><span>Kênh:</span><strong>{form.channels.map(c => CHANNEL_CFG[c]?.label).join(", ") || "—"}</strong></div>
                <div className="cm-preview-row"><span>Lịch gửi:</span><strong>{form.sendType === "now" ? "Gửi ngay" : `${form.scheduleDate} lúc ${form.scheduleTime}`}</strong></div>
              </div>
            </div>
          )}
        </div>

        <div className="cm-form-nav">
          {stepIdx > 0
            ? <button className="cm-btn cm-btn--secondary" onClick={() => setStep(STEPS[stepIdx - 1].key)}>← Quay lại</button>
            : <button className="cm-btn cm-btn--secondary" onClick={() => setView("list")}>Hủy</button>
          }
          <div style={{ flex: 1 }} />
          {stepIdx < STEPS.length - 1
            ? <button className="cm-btn cm-btn--primary" onClick={() => setStep(STEPS[stepIdx + 1].key)}>Tiếp theo →</button>
            : <button className="cm-btn cm-btn--success" onClick={() => { alert("Chiến dịch đã tạo (demo)"); setView("list"); setStep("info"); }}>🚀 Tạo chiến dịch</button>
          }
        </div>
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div className="page-content">
      <HeaderTabMenu
        title="Tạo & quản lý chiến dịch"
        titleBack="Chiến dịch Marketing"
        titleActions={titleActionsCreate}
        onBackProps={onBackProps}
      />

      <div className="promo-stats-grid">
        {[
          { label: "Tổng chiến dịch",   value: summaryStats.total,                 color: "purple" },
          { label: "Đang chạy",          value: summaryStats.active,                color: "green"  },
          { label: "Tổng tin đã gửi",   value: summaryStats.totalSent.toLocaleString(), color: "blue" },
          { label: "Tỷ lệ mở TB",       value: `${summaryStats.avgOpen}%`,         color: "orange" },
        ].map(s => (
          <div key={s.label} className={`promo-stat-card promo-stat-card--${s.color}`}>
            <div className="promo-stat-card__body">
              <div className="promo-stat-card__content">
                <p className="promo-stat-card__label">{s.label}</p>
                <p className="promo-stat-card__value">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cm-filter-bar">
        {["all", "active", "scheduled", "completed", "draft"].map(st => (
          <button key={st}
            className={`cm-filter-btn ${filterStatus === st ? "cm-filter-btn--active" : ""}`}
            onClick={() => setFilter(st)}>
            {st === "all" ? "Tất cả" : STATUS_CFG[st]?.label}
          </button>
        ))}
      </div>

      <div className="cm-campaign-list">
        {filtered.map(c => (
          <div className="cm-campaign-card" key={c.id}>
            <div className="cm-campaign-card__left">
              <div className="cm-campaign-card__name">{c.name}</div>
              <div className="cm-campaign-card__meta">
                <span>👥 {c.segment}</span>
                <span>📅 {c.startDate}</span>
              </div>
              <div className="cm-campaign-card__channels">
                {c.channels.map(ch => {
                  const cfg = CHANNEL_CFG[ch];
                  return <span key={ch} className="cm-channel-pill" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
                })}
              </div>
            </div>
            {c.sent > 0 && (
              <div className="cm-campaign-card__stats">
                <div className="cm-campaign-card__stat"><div className="cm-campaign-card__stat-val">{c.sent.toLocaleString()}</div><div className="cm-campaign-card__stat-lbl">Đã gửi</div></div>
                <div className="cm-campaign-card__stat"><div className="cm-campaign-card__stat-val" style={{ color: c.openRate >= 60 ? "#16a34a" : "#d97706" }}>{c.openRate}%</div><div className="cm-campaign-card__stat-lbl">Tỷ lệ mở</div></div>
                <div className="cm-campaign-card__stat"><div className="cm-campaign-card__stat-val" style={{ color: "#F97316" }}>{(c.revenue / 1000000).toFixed(1)}M</div><div className="cm-campaign-card__stat-lbl">Doanh thu</div></div>
              </div>
            )}
            <div className="cm-campaign-card__right">
              <Badge variant={STATUS_CFG[c.status].variant}>{STATUS_CFG[c.status].label}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
