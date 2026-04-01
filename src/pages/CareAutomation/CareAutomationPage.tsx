import React, { useState, useEffect, useCallback, useRef } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import { ITitleActions } from "components/titleAction/titleAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import CareScenarioService, {
  ICareScenario,
  ICareScenarioStats,
} from "services/CareScenarioService";
import "./CareAutomationPage.scss";

// ── Constants ─────────────────────────────────────────────────────────────────
type TriggerType = "birthday" | "post_purchase" | "vip_no_call" | "churn_risk" | "point_expiry";
type ActionType  = "sms" | "email" | "zalo" | "assign_staff" | "push";

const TRIGGER_CFG: Record<TriggerType, { label: string; icon: string; color: string; desc: string }> = {
  birthday:      { label: "Sinh nhật",         icon: "🎂", color: "#DB2777", desc: "Vào đúng ngày sinh nhật khách hàng" },
  post_purchase: { label: "Sau khi mua hàng",  icon: "🛍",  color: "#7C3AED", desc: "Sau khi đơn hàng được giao thành công" },
  vip_no_call:   { label: "VIP chưa được gọi", icon: "📞", color: "#D97706", desc: "KH hạng Vàng/Kim Cương chưa được liên hệ" },
  churn_risk:    { label: "Nguy cơ rời bỏ",    icon: "⚠️", color: "#DC2626", desc: "Khách không mua hàng trong thời gian dài" },
  point_expiry:  { label: "Điểm sắp hết hạn",  icon: "⭐", color: "#F97316", desc: "Điểm tích lũy sắp hết hạn sử dụng" },
};

const ACTION_CFG: Record<ActionType, { label: string; color: string; icon: string }> = {
  sms:          { label: "Gửi SMS",      color: "#15803D", icon: "💬" },
  email:        { label: "Gửi Email",    color: "#C2410C", icon: "📧" },
  zalo:         { label: "Gửi Zalo",     color: "#1D4ED8", icon: "💙" },
  assign_staff: { label: "Phân công NV", color: "#7C3AED", icon: "👤" },
  push:         { label: "Push App",     color: "#0369A1", icon: "🔔" },
};

const DELAY_TRIGGER_TYPES = ["post_purchase", "vip_no_call", "churn_risk", "point_expiry"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseActions(raw?: string): ActionType[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as ActionType[]; }
  catch { return []; }
}

function parseTriggerConfig(raw?: string): Record<string, any> {
  if (!raw) return {};
  try { return JSON.parse(raw); }
  catch { return {}; }
}

function getDelayLabel(triggerType: string): string {
  switch (triggerType) {
    case "post_purchase": return "Gửi sau bao nhiêu ngày kể từ khi giao hàng?";
    case "vip_no_call":   return "Cảnh báo sau bao nhiêu ngày chưa liên hệ?";
    case "churn_risk":    return "Không mua hàng trong bao nhiêu ngày?";
    case "point_expiry":  return "Nhắc trước bao nhiêu ngày khi điểm hết hạn?";
    default: return "Số ngày";
  }
}

// ── Empty form ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  trigger: "birthday" as TriggerType,
  delayDays: "2",
  actions: [] as ActionType[],
  description: "",
  smsTemplate:   "",
  emailTemplate: "",
  zaloTemplate:  "",
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function CareAutomationPage(props: any) {
  document.title = "Kịch bản chăm sóc";

  const { onBackProps } = props;
  const handleBack = () => onBackProps(true);

  // ── Data state ──────────────────────────────────────────────────
  const [scenarios, setScenarios] = useState<ICareScenario[]>([]);
  const [stats, setStats]         = useState<ICareScenarioStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const sizeLimit = 20;

  // ── Filter ──────────────────────────────────────────────────────
  const [search, setSearch]             = useState("");
  const [filterActive, setFilterActive] = useState(-1);
  const [filterTrigger, setFilterTrigger] = useState("");

  // ── UI state ────────────────────────────────────────────────────
  const [showForm, setShowForm]         = useState(false);
  const [editItem, setEditItem]         = useState<ICareScenario | null>(null);
  const [isSubmit, setIsSubmit]         = useState(false);
  const [showDialog, setShowDialog]     = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [activeTab, setActiveTab]       = useState<"basic" | "template">("basic");

  // ── Form state ──────────────────────────────────────────────────
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const abortRef = useRef<AbortController | null>(null);

  // ── Load list ────────────────────────────────────────────────────
  const loadList = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    try {
      const res = await CareScenarioService.list(
        {
          ...(search.trim() ? { name: search.trim() } : {}),
          isActive:    filterActive,
          ...(filterTrigger ? { triggerType: filterTrigger } : {}),
          page, sizeLimit,
        },
        abortRef.current.signal
      );
      if (res?.code === 0) {
        setScenarios(res.result?.items ?? []);
        setTotal(res.result?.total ?? 0);
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") showToast("Lỗi tải dữ liệu", "error");
    } finally {
      setIsLoading(false);
    }
  }, [search, filterActive, filterTrigger, page, sizeLimit]);

  // ── Load stats ──────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await CareScenarioService.stats();
      if (res?.code === 0) setStats(res.result);
    } catch { /* silent */ }
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadStats(); }, []);

  // ── Toggle active ────────────────────────────────────────────────
  const handleToggle = async (item: ICareScenario) => {
    const newState = item.isActive === 1 ? 0 : 1;
    const res = await CareScenarioService.toggleActive(item.id!, newState);
    if (res?.code === 0) {
      setScenarios((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, isActive: newState } : s))
      );
      loadStats();
    } else showToast(res?.message ?? "Lỗi khi cập nhật trạng thái", "error");
  };

  // ── Delete ───────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setShowDialog(false); setContentDialog(null);
    const res = await CareScenarioService.delete(id);
    if (res?.code === 0) {
      showToast("Đã xóa kịch bản chăm sóc", "success");
      loadList(); loadStats();
    } else showToast(res?.message ?? "Xóa thất bại", "error");
  };

  const showConfirmDelete = (item: ICareScenario) => {
    setContentDialog({
      color: "error", isCentered: true, isLoading: true,
      title: <>Xóa kịch bản</>,
      message: <>Bạn có chắc muốn xóa kịch bản <strong>{item.name}</strong>? Không thể khôi phục.</>,
      cancelText: "Hủy",   cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",  defaultAction: () => handleDelete(item.id!),
    });
    setShowDialog(true);
  };

  // ── Open form ─────────────────────────────────────────────────────
  const openCreate = () => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM });
    setActiveTab("basic");
    setShowForm(true);
  };

  const openEdit = (item: ICareScenario) => {
    setEditItem(item);
    const tCfg = parseTriggerConfig(item.triggerConfig);
    const acts = parseActions(item.actions);
    const aCfg = item.actionConfig ? JSON.parse(item.actionConfig) : {};
    setForm({
      name:          item.name ?? "",
      trigger:       (item.triggerType ?? "birthday") as TriggerType,
      delayDays:     String(tCfg.delayDays ?? tCfg.thresholdDays ?? tCfg.inactiveDays ?? tCfg.beforeDays ?? "2"),
      actions:       acts,
      description:   item.description ?? "",
      smsTemplate:   aCfg.sms   ?? "",
      emailTemplate: aCfg.email ?? "",
      zaloTemplate:  aCfg.zalo  ?? "",
    });
    setActiveTab("basic");
    setShowForm(true);
  };

  // ── Submit form ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) { showToast("Vui lòng nhập tên kịch bản", "warning"); return; }
    if (form.actions.length === 0) { showToast("Vui lòng chọn ít nhất 1 hành động", "warning"); return; }

    setIsSubmit(true);

    // Build triggerConfig
    const tCfg: Record<string, number> = {};
    if (DELAY_TRIGGER_TYPES.includes(form.trigger)) {
      const days = Number(form.delayDays) || 2;
      if (form.trigger === "post_purchase") tCfg.delayDays     = days;
      if (form.trigger === "vip_no_call")   tCfg.thresholdDays = days;
      if (form.trigger === "churn_risk")    tCfg.inactiveDays  = days;
      if (form.trigger === "point_expiry")  tCfg.beforeDays    = days;
    }

    // Build actionConfig
    const aCfg: Record<string, string> = {};
    if (form.smsTemplate.trim()   && form.actions.includes("sms"))   aCfg.sms   = form.smsTemplate.trim();
    if (form.emailTemplate.trim() && form.actions.includes("email")) aCfg.email = form.emailTemplate.trim();
    if (form.zaloTemplate.trim()  && form.actions.includes("zalo"))  aCfg.zalo  = form.zaloTemplate.trim();

    const body: ICareScenario = {
      ...(editItem?.id ? { id: editItem.id } : {}),
      name:          form.name.trim(),
      description:   form.description.trim() || undefined,
      triggerType:   form.trigger,
      triggerConfig: Object.keys(tCfg).length ? JSON.stringify(tCfg) : undefined,
      actions:       JSON.stringify(form.actions),
      actionConfig:  Object.keys(aCfg).length ? JSON.stringify(aCfg) : undefined,
      isActive:      1,
    };

    const res = await CareScenarioService.update(body);
    if (res?.code === 0) {
      showToast(`${editItem ? "Cập nhật" : "Tạo"} kịch bản thành công`, "success");
      setShowForm(false);
      loadList(); loadStats();
    } else {
      showToast(res?.message ?? "Có lỗi xảy ra", "error");
    }
    setIsSubmit(false);
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const toggleAction = (a: ActionType) =>
    setForm((f) => ({
      ...f,
      actions: f.actions.includes(a) ? f.actions.filter((x) => x !== a) : [...f.actions, a],
    }));

  const totalPage = Math.ceil(total / sizeLimit) || 0;

  const titleActions: ITitleActions = {
    actions: [{ title: "+ Tạo kịch bản", color: "primary", callback: openCreate }],
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="page-content ca-page">
      <HeaderTabMenu
        title="Kịch bản chăm sóc"
        titleBack="Chăm sóc khách hàng"
        titleActions={showForm ? undefined : titleActions}
        onBackProps={handleBack}
      />

      {/* ── Stat cards ── */}
      <div className="ca-stats">
        {[
          { label: "Kịch bản đang chạy", value: statsLoading ? "…" : String(stats?.active ?? 0),    color: "green",  icon: "▶" },
          { label: "Tạm dừng",           value: statsLoading ? "…" : String(stats?.paused ?? 0),    color: "orange", icon: "⏸" },
          { label: "Đã chạy hôm nay",    value: statsLoading ? "…" : String(stats?.todayRuns ?? 0), color: "blue",   icon: "⚡" },
          { label: "Tỷ lệ thành công",   value: statsLoading ? "…" : `${stats?.successRate ?? 0}%`, color: "purple", icon: "✓" },
        ].map((s) => (
          <div key={s.label} className={`ca-stat ca-stat--${s.color}`}>
            <div className="ca-stat__icon">{s.icon}</div>
            <div className="ca-stat__body">
              <div className="ca-stat__val">{s.value}</div>
              <div className="ca-stat__lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Form tạo / chỉnh sửa ── */}
      {showForm && (
        <div className="ca-form-card">
          <div className="ca-form-card__header">
            <span className="ca-form-card__title">
              {editItem ? "✏️ Chỉnh sửa kịch bản" : "➕ Tạo kịch bản mới"}
            </span>
            <div className="ca-form-tabs">
              <button
                className={`ca-form-tab${activeTab === "basic" ? " ca-form-tab--active" : ""}`}
                onClick={() => setActiveTab("basic")}>
                Thiết lập cơ bản
              </button>
              <button
                className={`ca-form-tab${activeTab === "template" ? " ca-form-tab--active" : ""}`}
                onClick={() => setActiveTab("template")}
                disabled={form.actions.length === 0}>
                Nội dung gửi
              </button>
            </div>
          </div>

          {activeTab === "basic" && (
            <div className="ca-form-body">
              {/* Tên kịch bản */}
              <div className="ca-field">
                <label>Tên kịch bản <span className="ca-required">*</span></label>
                <input
                  className="ca-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Chúc mừng sinh nhật hội viên Vàng"
                />
              </div>

              {/* Trigger */}
              <div className="ca-field">
                <label>Điều kiện kích hoạt <span className="ca-required">*</span></label>
                <div className="ca-trigger-grid">
                  {(Object.entries(TRIGGER_CFG) as [TriggerType, any][]).map(([key, cfg]) => (
                    <div
                      key={key}
                      className={`ca-trigger-card${form.trigger === key ? " ca-trigger-card--active" : ""}`}
                      style={form.trigger === key ? { borderColor: cfg.color, background: cfg.color + "0f" } : {}}
                      onClick={() => setForm({ ...form, trigger: key })}>
                      <div className="ca-trigger-card__icon" style={{ color: cfg.color }}>{cfg.icon}</div>
                      <div className="ca-trigger-card__info">
                        <div className="ca-trigger-card__name">{cfg.label}</div>
                        <div className="ca-trigger-card__desc">{cfg.desc}</div>
                      </div>
                      {form.trigger === key && (
                        <div className="ca-trigger-card__check" style={{ background: cfg.color }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Delay input — chỉ hiện với các trigger có delay */}
              {DELAY_TRIGGER_TYPES.includes(form.trigger) && (
                <div className="ca-field ca-field--inline">
                  <label>{getDelayLabel(form.trigger)}</label>
                  <div className="ca-delay-input">
                    <input
                      type="number" min={1} max={365}
                      className="ca-input ca-input--short"
                      value={form.delayDays}
                      onChange={(e) => setForm({ ...form, delayDays: e.target.value })}
                    />
                    <span className="ca-delay-unit">ngày</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="ca-field">
                <label>Hành động thực hiện <span className="ca-required">*</span></label>
                <div className="ca-action-grid">
                  {(Object.entries(ACTION_CFG) as [ActionType, any][]).map(([key, cfg]) => {
                    const sel = form.actions.includes(key);
                    return (
                      <div
                        key={key}
                        className={`ca-action-chip${sel ? " ca-action-chip--selected" : ""}`}
                        style={sel ? { background: cfg.color + "18", borderColor: cfg.color, color: cfg.color } : {}}
                        onClick={() => toggleAction(key)}>
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                        {sel && <span className="ca-action-chip__check">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mô tả */}
              <div className="ca-field">
                <label>Mô tả ngắn</label>
                <textarea
                  className="ca-input ca-input--textarea"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả điều kiện và mục tiêu của kịch bản..."
                />
              </div>
            </div>
          )}

          {activeTab === "template" && (
            <div className="ca-form-body">
              <p className="ca-template-hint">
                💡 Có thể dùng biến: <code>{"{name}"}</code> — tên khách, <code>{"{phone}"}</code> — SĐT,
                <code>{"{points}"}</code> — điểm tích lũy, <code>{"{voucher}"}</code> — mã voucher
              </p>

              {form.actions.includes("sms") && (
                <div className="ca-field">
                  <label>💬 Nội dung SMS</label>
                  <textarea
                    className="ca-input ca-input--textarea"
                    rows={3}
                    value={form.smsTemplate}
                    onChange={(e) => setForm({ ...form, smsTemplate: e.target.value })}
                    placeholder="VD: Chúc mừng sinh nhật {name}! Tặng bạn voucher {voucher} giảm 15%..."
                  />
                  <span className="ca-char-count">{form.smsTemplate.length}/160 ký tự</span>
                </div>
              )}

              {form.actions.includes("email") && (
                <div className="ca-field">
                  <label>📧 Tiêu đề Email</label>
                  <input
                    className="ca-input"
                    value={form.emailTemplate}
                    onChange={(e) => setForm({ ...form, emailTemplate: e.target.value })}
                    placeholder="VD: 🎂 Chúc mừng sinh nhật {name} - Quà tặng đặc biệt từ chúng tôi"
                  />
                </div>
              )}

              {form.actions.includes("zalo") && (
                <div className="ca-field">
                  <label>💙 Nội dung Zalo OA</label>
                  <textarea
                    className="ca-input ca-input--textarea"
                    rows={3}
                    value={form.zaloTemplate}
                    onChange={(e) => setForm({ ...form, zaloTemplate: e.target.value })}
                    placeholder="VD: Xin chào {name}! Cảm ơn bạn đã mua hàng. Đánh giá trải nghiệm tại..."
                  />
                </div>
              )}

              {form.actions.every((a) => !["sms", "email", "zalo"].includes(a)) && (
                <div className="ca-template-empty">
                  Hành động đã chọn (<strong>{form.actions.map((a) => ACTION_CFG[a]?.label).join(", ")}</strong>)
                  không cần cấu hình nội dung — hệ thống sẽ tự động xử lý.
                </div>
              )}
            </div>
          )}

          <div className="ca-form-footer">
            <button className="ca-btn ca-btn--ghost" disabled={isSubmit}
              onClick={() => setShowForm(false)}>
              Hủy
            </button>
            {activeTab === "basic" && form.actions.some((a) => ["sms", "email", "zalo"].includes(a)) && (
              <button className="ca-btn ca-btn--outline" onClick={() => setActiveTab("template")}>
                Tiếp theo: Nội dung →
              </button>
            )}
            <button className="ca-btn ca-btn--primary" disabled={isSubmit} onClick={handleSubmit}>
              {isSubmit ? "Đang lưu..." : editItem ? "Cập nhật" : "Lưu kịch bản"}
            </button>
          </div>
        </div>
      )}

      {/* ── Toolbar filter ── */}
      {!showForm && (
        <div className="ca-toolbar">
          <div className="ca-search-wrap">
            <svg className="ca-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" className="ca-search-input" placeholder="Tìm kịch bản..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="ca-select" value={filterActive}
            onChange={(e) => { setFilterActive(Number(e.target.value)); setPage(1); }}>
            <option value={-1}>Tất cả trạng thái</option>
            <option value={1}>Đang chạy</option>
            <option value={0}>Tạm dừng</option>
          </select>
          <select className="ca-select" value={filterTrigger}
            onChange={(e) => { setFilterTrigger(e.target.value); setPage(1); }}>
            <option value="">Tất cả trigger</option>
            {(Object.entries(TRIGGER_CFG) as [TriggerType, any][]).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Scenario list ── */}
      {!showForm && (
        <>
          {isLoading ? (
            <div className="ca-loading">Đang tải kịch bản...</div>
          ) : scenarios.length === 0 ? (
            <div className="ca-empty">
              <div className="ca-empty__icon">🤖</div>
              <p className="ca-empty__title">Chưa có kịch bản nào</p>
              <p className="ca-empty__desc">Tạo kịch bản đầu tiên để tự động chăm sóc khách hàng 24/7</p>
              <button className="ca-btn ca-btn--primary" onClick={openCreate}>+ Tạo kịch bản đầu tiên</button>
            </div>
          ) : (
            <div className="ca-list">
              {scenarios.map((item) => {
                const trig = TRIGGER_CFG[item.triggerType as TriggerType];
                const acts = parseActions(item.actions);
                const isOn = item.isActive === 1;
                return (
                  <div key={item.id} className={`ca-card${isOn ? "" : " ca-card--off"}`}>

                    {/* Left: trigger badge + name + desc + actions */}
                    <div className="ca-card__main">
                      <div className="ca-card__top">
                        {trig ? (
                          <span className="ca-trig-badge"
                            style={{ background: trig.color + "18", color: trig.color }}>
                            {trig.icon} {trig.label}
                          </span>
                        ) : (
                          <span className="ca-trig-badge" style={{ background: "#f3f4f6", color: "#6b7280" }}>
                            {item.triggerType}
                          </span>
                        )}
                        <span className="ca-card__name">{item.name}</span>
                      </div>
                      {item.description && (
                        <p className="ca-card__desc">{item.description}</p>
                      )}
                      <div className="ca-card__actions">
                        {acts.map((a) => {
                          const ac = ACTION_CFG[a];
                          return ac ? (
                            <span key={a} className="ca-act-tag"
                              style={{ background: ac.color + "18", color: ac.color }}>
                              {ac.icon} {ac.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {/* Middle: stats */}
                    <div className="ca-card__stats">
                      <div className="ca-card__stat">
                        <div className="ca-card__stat-val">{(item.runCount ?? 0).toLocaleString("vi")}</div>
                        <div className="ca-card__stat-lbl">Lượt chạy</div>
                      </div>
                      <div className="ca-card__stat">
                        <div className="ca-card__stat-val">
                          {item.lastRunTime
                            ? new Date(item.lastRunTime).toLocaleDateString("vi-VN")
                            : "—"}
                        </div>
                        <div className="ca-card__stat-lbl">Lần cuối</div>
                      </div>
                    </div>

                    {/* Right: toggle + actions */}
                    <div className="ca-card__controls">
                      <div className="ca-toggle-wrap" onClick={() => handleToggle(item)}>
                        <div className={`ca-toggle ${isOn ? "ca-toggle--on" : ""}`}>
                          <div className="ca-toggle__thumb" />
                        </div>
                        <span className="ca-toggle-lbl">{isOn ? "Đang chạy" : "Tạm dừng"}</span>
                      </div>
                      <div className="ca-card__btns">
                        <button className="ca-icon-btn ca-icon-btn--edit" title="Chỉnh sửa"
                          onClick={() => openEdit(item)}>✏️</button>
                        <button className="ca-icon-btn ca-icon-btn--del" title="Xóa"
                          onClick={() => showConfirmDelete(item)}>🗑</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPage > 1 && (
            <div className="ca-pagination">
              <span className="ca-pagination__info">Trang {page}/{totalPage} · {total} kịch bản</span>
              <div className="ca-pagination__btns">
                <button disabled={page <= 1}         onClick={() => setPage((p) => p - 1)}>‹</button>
                <button disabled={page >= totalPage}  onClick={() => setPage((p) => p + 1)}>›</button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}