import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./CareAutomationPage.scss";

type TriggerType = "birthday" | "post_purchase" | "vip_no_call" | "churn_risk" | "point_expiry" | "custom";
type ActionType = "sms" | "email" | "zalo" | "assign_staff" | "push";

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
  birthday:      { label: "Sinh nhật",              icon: "🎂", color: "#DB2777" },
  post_purchase: { label: "Sau khi mua hàng",        icon: "🛍",  color: "#7C3AED" },
  vip_no_call:   { label: "VIP chưa được gọi",       icon: "📞", color: "#D97706" },
  churn_risk:    { label: "Nguy cơ rời bỏ",          icon: "⚠️", color: "#DC2626" },
  point_expiry:  { label: "Điểm sắp hết hạn",       icon: "⭐", color: "#F97316" },
  custom:        { label: "Điều kiện tùy chỉnh",    icon: "⚙️", color: "#6B7280" },
};

const ACTION_LABELS: Record<ActionType, { label: string; color: string }> = {
  sms:          { label: "Gửi SMS",         color: "#15803D" },
  email:        { label: "Gửi Email",       color: "#C2410C" },
  zalo:         { label: "Gửi Zalo",        color: "#1D4ED8" },
  assign_staff: { label: "Phân công NV",    color: "#7C3AED" },
  push:         { label: "Push App",        color: "#0369A1" },
};

const MOCK_RULES: AutomationRule[] = [
  {
    id: 1, name: "Chúc mừng sinh nhật",
    trigger: "birthday", action: ["sms", "email"],
    isActive: true, runCount: 234, lastRun: "24/03/2026",
    description: "Gửi SMS + Email chúc mừng sinh nhật kèm voucher 15% vào đúng ngày sinh nhật khách hàng",
  },
  {
    id: 2, name: "Follow-up sau mua",
    trigger: "post_purchase", action: ["sms"],
    isActive: true, runCount: 1280, lastRun: "24/03/2026",
    description: "Gửi SMS cảm ơn và yêu cầu đánh giá sau 2 ngày kể từ khi đơn hàng được giao thành công",
  },
  {
    id: 3, name: "Cảnh báo KH VIP chưa được gọi",
    trigger: "vip_no_call", action: ["assign_staff"],
    isActive: true, runCount: 45, lastRun: "20/03/2026",
    description: "Tự động tạo task cho nhân viên phụ trách khi khách hàng VIP (Vàng/Kim Cương) chưa được liên hệ trong 14 ngày",
  },
  {
    id: 4, name: "Nhắc điểm sắp hết hạn",
    trigger: "point_expiry", action: ["push", "sms"],
    isActive: true, runCount: 89, lastRun: "22/03/2026",
    description: "Gửi Push + SMS nhắc khách hàng khi còn 7 ngày nữa điểm tích lũy sẽ hết hạn",
  },
  {
    id: 5, name: "Tái kích hoạt khách rời bỏ",
    trigger: "churn_risk", action: ["zalo", "email"],
    isActive: false, runCount: 67, lastRun: "15/03/2026",
    description: "Gửi Zalo + Email ưu đãi đặc biệt cho khách hàng không mua trong 60 ngày",
  },
];

export default function CareAutomationPage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Kịch bản chăm sóc";

  const [rules, setRules] = useState<AutomationRule[]>(MOCK_RULES);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    trigger: "birthday" as TriggerType,
    triggerDelay: "0",
    actions: [] as ActionType[],
    templateId: "",
    description: "",
  });

  const stats = {
    active: rules.filter(r => r.isActive).length,
    total: rules.length,
    runToday: 47,
    successRate: 94,
  };

  const toggleRule = (id: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleSave = () => {
    alert(`Kịch bản "${form.name}" đã được tạo (demo)`);
    setShowCreate(false);
    setForm({ name: "", trigger: "birthday", triggerDelay: "0", actions: [], templateId: "", description: "" });
  };

  return (
    <div className="page-content">
      <TitleAction
        title="Kịch bản chăm sóc"
        breadcrumb={[{ title: "Chăm sóc khách hàng", onClick: () => onBackProps(true) }]}
        listRightAction={[
          { title: "+ Tạo kịch bản", type: "primary", onClick: () => setShowCreate(true) },
        ]}
      />

      {/* Stats */}
      <div className="ca-stats-row">
        {[
          { label: "Kịch bản đang chạy", value: stats.active, icon: "▶️", color: "#059669" },
          { label: "Tổng kịch bản", value: stats.total, icon: "📋", color: "#7C3AED" },
          { label: "Đã chạy hôm nay", value: stats.runToday, icon: "⚡", color: "#2563EB" },
          { label: "Tỷ lệ thành công", value: `${stats.successRate}%`, icon: "✅", color: "#D97706" },
        ].map(s => (
          <div className="ca-stat-card" key={s.label}>
            <div className="ca-stat-card__icon">{s.icon}</div>
            <div>
              <div className="ca-stat-card__label">{s.label}</div>
              <div className="ca-stat-card__value" style={{ color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="ca-create-form">
          <div className="ca-create-form__title">Tạo kịch bản mới</div>

          <div className="ca-form-grid">
            <div className="cm-field">
              <label>Tên kịch bản *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VD: Chúc mừng sinh nhật Gold" />
            </div>
          </div>

          <div className="ca-section-title">Điều kiện kích hoạt (Trigger)</div>
          <div className="ca-trigger-grid">
            {(Object.entries(TRIGGER_LABELS) as [TriggerType, any][]).map(([key, cfg]) => (
              <div
                key={key}
                className={`ca-trigger-card ${form.trigger === key ? "ca-trigger-card--selected" : ""}`}
                onClick={() => setForm({...form, trigger: key})}
              >
                <span className="ca-trigger-icon">{cfg.icon}</span>
                <span className="ca-trigger-label">{cfg.label}</span>
                {form.trigger === key && <span className="ca-check">✓</span>}
              </div>
            ))}
          </div>

          {form.trigger === "post_purchase" && (
            <div className="cm-field" style={{ marginTop: 12 }}>
              <label>Chạy sau bao nhiêu ngày kể từ trigger?</label>
              <input type="number" value={form.triggerDelay} onChange={e => setForm({...form, triggerDelay: e.target.value})} placeholder="VD: 2 (ngày)" style={{ maxWidth: 200 }} />
            </div>
          )}

          <div className="ca-section-title" style={{ marginTop: 16 }}>Hành động thực hiện</div>
          <div className="ca-action-grid">
            {(Object.entries(ACTION_LABELS) as [ActionType, any][]).map(([key, cfg]) => {
              const isSelected = form.actions.includes(key);
              return (
                <div
                  key={key}
                  className={`ca-action-pill ${isSelected ? "ca-action-pill--selected" : ""}`}
                  style={isSelected ? { background: cfg.color + "20", borderColor: cfg.color, color: cfg.color } : {}}
                  onClick={() => {
                    const next = isSelected ? form.actions.filter(a => a !== key) : [...form.actions, key];
                    setForm({...form, actions: next});
                  }}
                >
                  {cfg.label}
                </div>
              );
            })}
          </div>

          <div className="cm-field" style={{ marginTop: 14 }}>
            <label>Mô tả kịch bản</label>
            <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Mô tả ngắn về điều kiện và hành động..." />
          </div>

          <div className="ca-form-actions">
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Hủy</button>
            <button className="btn-primary" onClick={handleSave}>Lưu kịch bản</button>
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="ca-rules-list">
        {rules.map(rule => {
          const trigCfg = TRIGGER_LABELS[rule.trigger];
          return (
            <div className={`ca-rule-card ${!rule.isActive ? "ca-rule-card--inactive" : ""}`} key={rule.id}>
              <div className="ca-rule-card__left">
                <div className="ca-rule-card__header">
                  <span className="ca-rule-trigger" style={{ background: trigCfg.color + "15", color: trigCfg.color }}>
                    {trigCfg.icon} {trigCfg.label}
                  </span>
                  <span className="ca-rule-name">{rule.name}</span>
                </div>
                <div className="ca-rule-desc">{rule.description}</div>
                <div className="ca-rule-actions-list">
                  {rule.action.map(a => {
                    const ac = ACTION_LABELS[a];
                    return (
                      <span key={a} className="ca-action-tag" style={{ background: ac.color + "15", color: ac.color }}>{ac.label}</span>
                    );
                  })}
                </div>
              </div>
              <div className="ca-rule-card__stats">
                <div className="ca-rule-stat">
                  <div className="ca-rule-stat__val">{rule.runCount.toLocaleString()}</div>
                  <div className="ca-rule-stat__lbl">Lượt chạy</div>
                </div>
                <div className="ca-rule-stat">
                  <div className="ca-rule-stat__val">{rule.lastRun}</div>
                  <div className="ca-rule-stat__lbl">Lần cuối</div>
                </div>
              </div>
              <div className="ca-rule-card__toggle">
                <div
                  className={`ca-toggle ${rule.isActive ? "ca-toggle--on" : ""}`}
                  onClick={() => toggleRule(rule.id)}
                >
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
