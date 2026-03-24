import React, { useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import { ITitleActions } from "components/titleAction/titleAction";
import "./CareAutomationPage.scss";

type TriggerType = "birthday" | "post_purchase" | "vip_no_call" | "churn_risk" | "point_expiry";
type ActionType  = "sms" | "email" | "zalo" | "assign_staff" | "push";

interface AutomationRule {
  id: number;
  name: string;
  trigger: TriggerType;
  action: ActionType[];
  isActive: boolean;
  runCount: number;
  lastRun: string;
  description: string;
}

const TRIGGER_LABELS: Record<TriggerType, { label: string; icon: string; color: string }> = {
  birthday:      { label: "Sinh nhật",           icon: "🎂", color: "#DB2777" },
  post_purchase: { label: "Sau khi mua hàng",    icon: "🛍", color: "#7C3AED" },
  vip_no_call:   { label: "VIP chưa được gọi",   icon: "📞", color: "#D97706" },
  churn_risk:    { label: "Nguy cơ rời bỏ",      icon: "⚠️", color: "#DC2626" },
  point_expiry:  { label: "Điểm sắp hết hạn",   icon: "⭐", color: "#F97316" },
};

const ACTION_LABELS: Record<ActionType, { label: string; color: string }> = {
  sms:          { label: "Gửi SMS",       color: "#15803D" },
  email:        { label: "Gửi Email",     color: "#C2410C" },
  zalo:         { label: "Gửi Zalo",      color: "#1D4ED8" },
  assign_staff: { label: "Phân công NV",  color: "#7C3AED" },
  push:         { label: "Push App",      color: "#0369A1" },
};

const MOCK_RULES: AutomationRule[] = [
  { id: 1, name: "Chúc mừng sinh nhật",           trigger: "birthday",      action: ["sms", "email"],       isActive: true,  runCount: 234, lastRun: "24/03/2026", description: "Gửi SMS + Email chúc mừng sinh nhật kèm voucher 15% vào đúng ngày" },
  { id: 2, name: "Follow-up sau mua",             trigger: "post_purchase", action: ["sms"],               isActive: true,  runCount: 1280,lastRun: "24/03/2026", description: "Gửi SMS cảm ơn và đề nghị đánh giá sau 2 ngày giao hàng thành công" },
  { id: 3, name: "Cảnh báo KH VIP chưa được gọi", trigger: "vip_no_call",  action: ["assign_staff"],      isActive: true,  runCount: 45,  lastRun: "20/03/2026", description: "Tạo task cho nhân viên khi KH Vàng/Kim Cương chưa được liên hệ trong 14 ngày" },
  { id: 4, name: "Nhắc điểm sắp hết hạn",         trigger: "point_expiry", action: ["push", "sms"],        isActive: true,  runCount: 89,  lastRun: "22/03/2026", description: "Gửi Push + SMS nhắc khi còn 7 ngày điểm tích lũy hết hạn" },
  { id: 5, name: "Tái kích hoạt khách rời bỏ",    trigger: "churn_risk",   action: ["zalo", "email"],      isActive: false, runCount: 67,  lastRun: "15/03/2026", description: "Gửi Zalo + Email ưu đãi đặc biệt cho khách không mua trong 60 ngày" },
];

export default function CareAutomationPage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Kịch bản chăm sóc";

  const [rules, setRules]       = useState<AutomationRule[]>(MOCK_RULES);
  const [showCreate, setCreate] = useState(false);
  const [form, setForm]         = useState({ name: "", trigger: "birthday" as TriggerType, delay: "0", actions: [] as ActionType[], description: "" });

  const titleActions: ITitleActions = {
    actions: [{ title: "+ Tạo kịch bản", color: "primary", callback: () => setCreate(true) }],
  };

  const toggleRule = (id: number) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));

  const toggleAction = (a: ActionType) =>
    setForm(f => ({ ...f, actions: f.actions.includes(a) ? f.actions.filter(x => x !== a) : [...f.actions, a] }));

  const stats = {
    active:    rules.filter(r => r.isActive).length,
    total:     rules.length,
    runToday:  47,
    rate:      94,
  };

  return (
    <div className="page-content">
      <HeaderTabMenu
        title="Kịch bản chăm sóc"
        titleBack="Chăm sóc khách hàng"
        titleActions={showCreate ? undefined : titleActions}
        onBackProps={onBackProps}
      />

      {/* Stats */}
      <div className="promo-stats-grid">
        {[
          { label: "Kịch bản đang chạy", value: String(stats.active),   color: "green"  },
          { label: "Tổng kịch bản",       value: String(stats.total),    color: "purple" },
          { label: "Đã chạy hôm nay",    value: String(stats.runToday), color: "blue"   },
          { label: "Tỷ lệ thành công",   value: `${stats.rate}%`,       color: "orange" },
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

      {/* Create form */}
      {showCreate && (
        <div className="ca-create-form">
          <div className="ca-create-form__title">Tạo kịch bản mới</div>
          <div className="cm-field" style={{ maxWidth: 400, marginBottom: 14 }}>
            <label>Tên kịch bản *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Chúc mừng sinh nhật hội viên Vàng" />
          </div>

          <div className="ca-section-label">Điều kiện kích hoạt (Trigger)</div>
          <div className="ca-trigger-grid">
            {(Object.entries(TRIGGER_LABELS) as [TriggerType, any][]).map(([key, cfg]) => (
              <div key={key}
                className={`ca-trigger-card ${form.trigger === key ? "ca-trigger-card--selected" : ""}`}
                onClick={() => setForm({ ...form, trigger: key })}>
                <span className="ca-trigger-icon">{cfg.icon}</span>
                <span className="ca-trigger-label">{cfg.label}</span>
                {form.trigger === key && <span className="ca-check">✓</span>}
              </div>
            ))}
          </div>

          {form.trigger === "post_purchase" && (
            <div className="cm-field" style={{ marginTop: 12, maxWidth: 220 }}>
              <label>Gửi sau bao nhiêu ngày?</label>
              <input type="number" value={form.delay} onChange={e => setForm({ ...form, delay: e.target.value })} placeholder="VD: 2" />
            </div>
          )}

          <div className="ca-section-label" style={{ marginTop: 14 }}>Hành động thực hiện</div>
          <div className="ca-action-grid">
            {(Object.entries(ACTION_LABELS) as [ActionType, any][]).map(([key, cfg]) => {
              const isSel = form.actions.includes(key);
              return (
                <div key={key}
                  className={`ca-action-pill ${isSel ? "ca-action-pill--selected" : ""}`}
                  style={isSel ? { background: cfg.color + "20", borderColor: cfg.color, color: cfg.color } : {}}
                  onClick={() => toggleAction(key)}>
                  {cfg.label}
                </div>
              );
            })}
          </div>

          <div className="cm-field" style={{ marginTop: 14 }}>
            <label>Mô tả</label>
            <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn về điều kiện và hành động..." />
          </div>

          <div className="ca-form-actions">
            <button className="cm-btn cm-btn--secondary" onClick={() => setCreate(false)}>Hủy</button>
            <button className="cm-btn cm-btn--primary" onClick={() => { alert("Đã lưu kịch bản (demo)"); setCreate(false); }}>Lưu kịch bản</button>
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="ca-rules-list">
        {rules.map(rule => {
          const trig = TRIGGER_LABELS[rule.trigger];
          return (
            <div key={rule.id} className={`ca-rule-card ${!rule.isActive ? "ca-rule-card--inactive" : ""}`}>
              <div className="ca-rule-card__left">
                <div className="ca-rule-card__header">
                  <span className="ca-trigger-badge" style={{ background: trig.color + "15", color: trig.color }}>
                    {trig.icon} {trig.label}
                  </span>
                  <span className="ca-rule-name">{rule.name}</span>
                </div>
                <div className="ca-rule-desc">{rule.description}</div>
                <div className="ca-rule-actions-list">
                  {rule.action.map(a => {
                    const ac = ACTION_LABELS[a];
                    return <span key={a} className="ca-action-tag" style={{ background: ac.color + "15", color: ac.color }}>{ac.label}</span>;
                  })}
                </div>
              </div>
              <div className="ca-rule-stats">
                <div className="ca-rule-stat"><div className="ca-rule-stat__val">{rule.runCount.toLocaleString()}</div><div className="ca-rule-stat__lbl">Lượt chạy</div></div>
                <div className="ca-rule-stat"><div className="ca-rule-stat__val">{rule.lastRun}</div><div className="ca-rule-stat__lbl">Lần cuối</div></div>
              </div>
              <div className="ca-rule-toggle">
                <div className={`ca-toggle ${rule.isActive ? "ca-toggle--on" : ""}`} onClick={() => toggleRule(rule.id)}>
                  <div className="ca-toggle__thumb" />
                </div>
                <div className="ca-toggle-label">{rule.isActive ? "Đang chạy" : "Tạm dừng"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
