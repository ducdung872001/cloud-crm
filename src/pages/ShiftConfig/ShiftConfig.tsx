/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import BoxTable from "components/boxTable/boxTable";
import Icon from "components/icon";
import Checkbox from "components/checkbox/checkbox";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Loading from "components/loading";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";
import { UserContext, ContextType } from "contexts/userContext";
import ShiftService from "services/ShiftService";
import EmployeeService from "services/EmployeeService";
import { RulesSettings } from "./partials/ShiftRulesNotify/ShiftRulesNotifyTab";
import ShiftRulesNotifyTab from "./partials/ShiftRulesNotify/ShiftRulesNotifyTab";
import "./ShiftConfig.scss";

type TabKey = "shift_config" | "staff_assign" | "rules_notify";

type ShiftConfigModel = {
  id: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  posDeviceName: string;
  defaultCash: number;
  minStaff: number;
  color: string;
};

// StaffRow: mỗi nhân viên + map assignments theo shiftConfigId
type StaffRow = {
  employeeId: number;
  name: string;
  role: string;        // "Thu ngân" | "Quản lý"
  avatar?: string;
  assignments: Record<number, boolean>; // key = shiftConfigId
};

const COLOR_LIST = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const ROLE_OPTIONS = ["Thu ngân", "Quản lý", "Hỗ trợ"];

const CHANNEL_MAP: Record<string, string> = {
  zalo_email: "ZALO+EMAIL",
  email: "EMAIL",
  zalo: "ZALO",
};

const DEFAULT_RULES: RulesSettings = {
  warningDiff: 50,
  requireReason: true,
  allowDenomination: true,
  maxOpenHours: 9,
  blockIfMissingStaff: false,
  managerConfirmClose: false,
  sendCloseReport: true,
  sendDiffWarning: true,
  remindOpenShift: false,
  shiftOverRule: true,
  receiver: "all_manager",
  channel: "zalo_email",
};

let _tmpId = -1;
const nextTmpId = () => _tmpId--;

export default function ShiftConfigTabs() {
  document.title = "Thiết lập Ca Vận hành";

  const { dataBranch } = useContext(UserContext) as ContextType;
  const branchId: number = dataBranch?.value ?? 0;

  const [tab, setTab]                 = useState<TabKey>("shift_config");
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Tab 1: Cấu hình ca ──────────────────────────────────────────────
  const [shiftConfigs, setShiftConfigs]           = useState<ShiftConfigModel[]>([]);
  const [savedShiftConfigs, setSavedShiftConfigs] = useState<ShiftConfigModel[]>([]);

  // ── Tab 2: Phân công nhân viên ──────────────────────────────────────
  const [staffRows, setStaffRows]             = useState<StaffRow[]>([]);
  const [savedStaffRows, setSavedStaffRows]   = useState<StaffRow[]>([]);
  const [checkedStaff, setCheckedStaff]       = useState<number[]>([]);
  const [loadingStaff, setLoadingStaff]       = useState(false);
  // searchKeyword để lọc nhân viên phía client
  const [staffSearch, setStaffSearch]         = useState("");

  // ── Tab 3: Quy tắc ──────────────────────────────────────────────────
  const [rulesSettings, setRulesSettings]           = useState<RulesSettings>(DEFAULT_RULES);
  const [savedRulesSettings, setSavedRulesSettings] = useState<RulesSettings>(DEFAULT_RULES);

  const [dialogContent, setDialogContent] = useState<IContentDialog | null>(null);
  const [showDialog, setShowDialog]       = useState(false);

  // ── Fetch shift config + assignments ────────────────────────────────
  const fetchConfig = useCallback(() => {
    if (!branchId) return;
    setLoading(true);
    ShiftService.getConfig(branchId)
      .then((res) => {
        const d = res?.result;
        if (!d) return;

        if (d.configs && d.configs.length > 0) {
          const mapped: ShiftConfigModel[] = d.configs.map((c: any, idx: number) => ({
            id:            c.id ?? nextTmpId(),
            shiftName:     c.name ?? `Ca ${idx + 1}`,
            startTime:     c.startTime ? String(c.startTime).substring(0, 5) : "",
            endTime:       c.endTime   ? String(c.endTime).substring(0, 5)   : "",
            posDeviceName: c.posDeviceName ?? "",
            defaultCash:   c.openingCashDefault ?? 0,
            minStaff:      c.minStaff ?? 1,
            color:         c.color ?? COLOR_LIST[idx % COLOR_LIST.length],
          }));
          setShiftConfigs(mapped);
          setSavedShiftConfigs(mapped);

          // Lưu assignments hiện tại để merge sau khi load employee list
          const existingAssignments: Record<number, Record<number, boolean>> = {}; // employeeId → {configId → bool}
          const existingRoles: Record<number, string> = {};
          const assignments: any[] = d.staffAssignments ?? [];
          assignments.forEach((a: any) => {
            if (!existingAssignments[a.employeeId]) existingAssignments[a.employeeId] = {};
            if (a.shiftConfigId) existingAssignments[a.employeeId][a.shiftConfigId] = true;
            if (a.role) existingRoles[a.employeeId] = a.role;
          });

          // Load danh sách nhân viên thực từ API
          setLoadingStaff(true);
          EmployeeService.list({ branchId, limit: 500 })
            .then((empRes: any) => {
              const items: any[] = empRes?.result?.items ?? empRes?.result ?? [];
              const rows: StaffRow[] = items.map((emp: any) => ({
                employeeId:  emp.id,
                name:        emp.name ?? `NV #${emp.id}`,
                role:        existingRoles[emp.id] ?? "Thu ngân",
                avatar:      emp.avatar,
                assignments: existingAssignments[emp.id] ?? {},
              }));
              setStaffRows(rows);
              setSavedStaffRows(rows);
            })
            .catch(() => {})
            .finally(() => setLoadingStaff(false));
        }

        if (d.rules?.id) {
          const r = d.rules;
          const chRev: Record<string, string> = { "ZALO+EMAIL": "zalo_email", "EMAIL": "email", "ZALO": "zalo" };
          const mapped: RulesSettings = {
            warningDiff:         r.cashDiffThreshold ?? 50,
            requireReason:       r.requireDiffReason === 1,
            allowDenomination:   r.allowDenomination === 1,
            maxOpenHours:        r.maxShiftHours ?? 9,
            blockIfMissingStaff: r.blockOpenNoStaff === 1,
            managerConfirmClose: r.requireManagerClose === 1,
            sendCloseReport:     r.notifyShiftReport === 1,
            sendDiffWarning:     r.notifyCashDiff === 1,
            remindOpenShift:     r.notifyOpenReminder === 1,
            shiftOverRule:       r.notifyOvertime === 1,
            receiver:            r.notifyRecipient ?? "all_manager",
            channel:             chRev[r.notifyChannel ?? ""] ?? "zalo_email",
          };
          setRulesSettings(mapped);
          setSavedRulesSettings(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [branchId]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const titleActions: ITitleActions = useMemo(() => ({ actions: [] }), []);

  // ── Hủy ──────────────────────────────────────────────────────────────
  const onCancel = () => {
    if (tab === "shift_config") { setShiftConfigs(savedShiftConfigs); return; }
    if (tab === "staff_assign") { setStaffRows(savedStaffRows); setCheckedStaff([]); return; }
    setRulesSettings(savedRulesSettings);
  };

  // ── Lưu ──────────────────────────────────────────────────────────────
  const onSave = async () => {
    setSaving(true); setSaveSuccess(false);
    try {
      if (tab === "shift_config") {
        const payload = shiftConfigs.map((c) => ({
          id: c.id > 0 ? c.id : undefined,
          name: c.shiftName, color: c.color,
          startTime: c.startTime, endTime: c.endTime,
          minStaff: c.minStaff,
          openingCashDefault: c.defaultCash,
          posDeviceName: c.posDeviceName,
        }));
        await ShiftService.saveConfigs(branchId, payload);
        setSavedShiftConfigs(shiftConfigs);
        setSaveSuccess(true);
        fetchConfig();
        return;
      }

      if (tab === "staff_assign") {
        // Build payload: chỉ gửi các row có ít nhất 1 assignment
        const assignments: any[] = [];
        staffRows.forEach((row) => {
          Object.entries(row.assignments).forEach(([cid, on]) => {
            if (on) {
              assignments.push({
                shiftConfigId: Number(cid),
                employeeId:    row.employeeId,
                role:          row.role,
              });
            }
          });
        });
        await ShiftService.saveStaff(assignments);
        setSavedStaffRows(staffRows);
        setCheckedStaff([]);
        setSaveSuccess(true);
        return;
      }

      // rules_notify
      const rulesPayload = {
        cashDiffThreshold: rulesSettings.warningDiff, requireDiffReason: rulesSettings.requireReason ? 1 : 0,
        allowDenomination: rulesSettings.allowDenomination ? 1 : 0, maxShiftHours: rulesSettings.maxOpenHours,
        blockOpenNoStaff: rulesSettings.blockIfMissingStaff ? 1 : 0, requireManagerClose: rulesSettings.managerConfirmClose ? 1 : 0,
        notifyShiftReport: rulesSettings.sendCloseReport ? 1 : 0, notifyCashDiff: rulesSettings.sendDiffWarning ? 1 : 0,
        notifyOpenReminder: rulesSettings.remindOpenShift ? 1 : 0, notifyOvertime: rulesSettings.shiftOverRule ? 1 : 0,
        notifyRecipient: rulesSettings.receiver, notifyChannel: CHANNEL_MAP[rulesSettings.channel] ?? "ZALO+EMAIL",
      };
      await ShiftService.saveRules(branchId, rulesPayload);
      setSavedRulesSettings(rulesSettings);
      setSaveSuccess(true);
    } catch (e) { console.error("Lỗi lưu:", e); }
    finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // ── Helpers ShiftConfig ──────────────────────────────────────────────
  const updateShift = (id: number, patch: Partial<ShiftConfigModel>) =>
    setShiftConfigs((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addShift = () => {
    const idx = shiftConfigs.length;
    setShiftConfigs((prev) => [...prev, {
      id: nextTmpId(), shiftName: `Ca ${idx + 1}`, startTime: "", endTime: "",
      posDeviceName: "", defaultCash: 0, minStaff: 1, color: COLOR_LIST[idx % COLOR_LIST.length],
    }]);
  };

  const confirmDelete = (item: ShiftConfigModel) => {
    setDialogContent({
      title: "Xóa ca làm việc", message: `Bạn có chắc muốn xóa "${item.shiftName}"?`,
      cancelText: "Hủy", cancelAction: () => setShowDialog(false),
      defaultText: "Xóa",
      defaultAction: async () => {
        if (item.id > 0) await ShiftService.deleteConfig(item.id).catch(() => {});
        setShiftConfigs((prev) => prev.filter((s) => s.id !== item.id));
        setShowDialog(false);
      },
      color: "error",
    });
    setShowDialog(true);
  };

  // ── Helpers Staff ────────────────────────────────────────────────────
  const toggleAssign = (empId: number, cfgId: number, val: boolean) =>
    setStaffRows((prev) => prev.map((r) =>
      r.employeeId === empId ? { ...r, assignments: { ...r.assignments, [cfgId]: val } } : r
    ));

  const updateRole = (empId: number, role: string) =>
    setStaffRows((prev) => prev.map((r) => r.employeeId === empId ? { ...r, role } : r));

  // Gán tất cả ca cho nhân viên đã check
  const assignAllShifts = (cfgId: number) => {
    setStaffRows((prev) => prev.map((r) =>
      checkedStaff.includes(r.employeeId) ? { ...r, assignments: { ...r.assignments, [cfgId]: true } } : r
    ));
    setCheckedStaff([]);
  };

  const clearAllAssignments = () => {
    setStaffRows((prev) => prev.map((r) =>
      checkedStaff.includes(r.employeeId) ? { ...r, assignments: {} } : r
    ));
    setCheckedStaff([]);
  };

  const bulkStaffItems: BulkActionItemModel[] = useMemo(() => [
    ...shiftConfigs.map((cfg) => ({
      title: `Gán ${cfg.shiftName}`,
      callback: () => assignAllShifts(cfg.id),
    })),
    { title: "Bỏ tất cả phân ca", callback: clearAllAssignments },
  ], [shiftConfigs, checkedStaff]);

  // Filter nhân viên theo search
  const filteredStaff = useMemo(() => {
    if (!staffSearch.trim()) return staffRows;
    const kw = staffSearch.toLowerCase();
    return staffRows.filter((r) => r.name.toLowerCase().includes(kw));
  }, [staffRows, staffSearch]);

  // Số nhân viên đã được phân ít nhất 1 ca
  const assignedCount = useMemo(
    () => staffRows.filter((r) => Object.values(r.assignments).some(Boolean)).length,
    [staffRows]
  );

  // Table definitions
  const staffTitles  = ["", "Nhân viên", "Vai trò", ...shiftConfigs.map((c) => c.shiftName)];
  const staffDataFmt = ["text-center", "", "", ...shiftConfigs.map(() => "text-center")];

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="page-content page-shift-config">
      <TitleAction title="Thiết lập Ca Vận hành" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">

        {/* Tab bar */}
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              {(["shift_config", "staff_assign", "rules_notify"] as TabKey[]).map((t) => (
                <li key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                  {t === "shift_config" ? "Cấu hình ca"
                   : t === "staff_assign" ? "Phân công nhân viên"
                   : "Quy tắc & Thông báo"}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {loading ? (
          <div className="shift-config-loading"><Loading /></div>
        ) : (
          <div className="tab-body">

            {/* ── Tab 1: Cấu hình ca ── */}
            {tab === "shift_config" && (
              <div className="shift-card-grid">
                {shiftConfigs.map((cfg) => (
                  <div key={cfg.id} className="shift-card-editable">
                    <div className="shift-card-editable__top" style={{ borderTopColor: cfg.color }}>
                      <input
                        className="name-input"
                        value={cfg.shiftName}
                        placeholder="Tên ca..."
                        onChange={(e) => updateShift(cfg.id, { shiftName: e.target.value })}
                      />
                      <button className="btn-delete" onClick={() => confirmDelete(cfg)} title="Xóa ca">
                        <Icon name="Trash" />
                      </button>
                    </div>
                    <div className="shift-card-editable__body">
                      <div className="sc-block">
                        <div className="sc-label">Màu hiển thị</div>
                        <div className="color-row">
                          {COLOR_LIST.map((c) => (
                            <button key={c} className={`color-dot${cfg.color === c ? " active" : ""}`}
                              style={{ background: c }} onClick={() => updateShift(cfg.id, { color: c })} />
                          ))}
                        </div>
                      </div>
                      <div className="sc-block">
                        <div className="sc-label">Khung giờ</div>
                        <div className="sc-grid-2">
                          <div className="sc-field">
                            <label className="sc-field__label">Bắt đầu</label>
                            <div className="sc-field__input-wrap">
                              <input type="time" className="sc-input" value={cfg.startTime}
                                onChange={(e) => updateShift(cfg.id, { startTime: e.target.value })} />
                              <span className="sc-ic"><Icon name="Clock" /></span>
                            </div>
                          </div>
                          <div className="sc-field">
                            <label className="sc-field__label">Kết thúc</label>
                            <div className="sc-field__input-wrap">
                              <input type="time" className="sc-input" value={cfg.endTime}
                                onChange={(e) => updateShift(cfg.id, { endTime: e.target.value })} />
                              <span className="sc-ic"><Icon name="Clock" /></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="sc-block sc-grid-2">
                        <div className="sc-field">
                          <label className="sc-field__label">Thiết bị POS</label>
                          <div className="sc-field__input-wrap">
                            <input type="text" className="sc-input" placeholder="VD: POS Quầy 1"
                              value={cfg.posDeviceName}
                              onChange={(e) => updateShift(cfg.id, { posDeviceName: e.target.value })} />
                            <span className="sc-ic"><Icon name="Monitor" /></span>
                          </div>
                        </div>
                        <div className="sc-field">
                          <label className="sc-field__label">NV tối thiểu</label>
                          <div className="sc-field__input-wrap">
                            <input type="number" className="sc-input" min={1} value={cfg.minStaff}
                              onChange={(e) => updateShift(cfg.id, { minStaff: Number(e.target.value) || 1 })} />
                            <span className="sc-ic"><Icon name="People" /></span>
                          </div>
                        </div>
                      </div>
                      <div className="sc-block">
                        <div className="sc-field">
                          <label className="sc-field__label">Tiền lẻ đầu ca (VNĐ)</label>
                          <NummericInput
                            className="sc-numeric"
                            value={cfg.defaultCash}
                            thousandSeparator
                            placeholder="0"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateShift(cfg.id, { defaultCash: Number(String(e.target.value).replace(/,/g, "")) || 0 })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="shift-card-add" onClick={addShift}>
                  <div className="add-inner">
                    <div className="plus">+</div>
                    <div className="add-text">Thêm ca mới</div>
                  </div>
                </button>
              </div>
            )}

            {/* ── Tab 2: Phân công nhân viên ── */}
            {tab === "staff_assign" && (
              <Fragment>
                {/* Header: tóm tắt + search */}
                <div className="staff-assign-header">
                  <div className="staff-assign-summary">
                    <span className="summary-count">
                      <strong>{assignedCount}</strong>/{staffRows.length} nhân viên được phân ca
                    </span>
                    {shiftConfigs.map((cfg) => {
                      const count = staffRows.filter((r) => r.assignments[cfg.id]).length;
                      return (
                        <span key={cfg.id} className="summary-badge" style={{ background: cfg.color + "18", color: cfg.color, borderColor: cfg.color + "40" }}>
                          <span className="badge-dot" style={{ background: cfg.color }} />
                          {cfg.shiftName}: {count} NV
                        </span>
                      );
                    })}
                  </div>
                  <div className="staff-assign-search">
                    <div className="sc-field__input-wrap">
                      <input
                        type="text"
                        className="sc-input"
                        placeholder="Tìm nhân viên..."
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                      />
                      <span className="sc-ic"><Icon name="Search" /></span>
                    </div>
                  </div>
                </div>

                {loadingStaff ? (
                  <div className="shift-config-loading" style={{ minHeight: "16rem" }}><Loading /></div>
                ) : filteredStaff.length === 0 ? (
                  <div className="shift-config-empty">
                    <Icon name="People" />
                    <p>{staffSearch ? "Không tìm thấy nhân viên phù hợp." : "Chi nhánh này chưa có nhân viên nào."}</p>
                  </div>
                ) : (
                  <BoxTable
                    name="nhân viên"
                    titles={staffTitles}
                    items={filteredStaff}
                    isBulkAction={checkedStaff.length > 0}
                    bulkActionItems={bulkStaffItems}
                    dataFormat={staffDataFmt}
                    dataMappingArray={(row: StaffRow) => [
                      // Checkbox chọn
                      <Checkbox
                        key={`chk-${row.employeeId}`}
                        checked={checkedStaff.includes(row.employeeId)}
                        onChange={(v) =>
                          setCheckedStaff((p) => v ? [...p, row.employeeId] : p.filter((x) => x !== row.employeeId))
                        }
                      />,
                      // Tên nhân viên + avatar
                      <div key={`nm-${row.employeeId}`} className="staff-name-cell">
                        <div className="staff-avatar-sm">
                          {row.avatar
                            ? <img src={row.avatar} alt={row.name} />
                            : getInitials(row.name)
                          }
                        </div>
                        <span>{row.name}</span>
                      </div>,
                      // Dropdown vai trò
                      <select
                        key={`role-${row.employeeId}`}
                        className="sc-role-select"
                        value={row.role}
                        onChange={(e) => updateRole(row.employeeId, e.target.value)}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>,
                      // Checkbox per ca
                      ...shiftConfigs.map((cfg) => (
                        <Checkbox
                          key={`${row.employeeId}-${cfg.id}`}
                          checked={!!row.assignments[cfg.id]}
                          onChange={(v) => toggleAssign(row.employeeId, cfg.id, v)}
                        />
                      )),
                    ]}
                  />
                )}
              </Fragment>
            )}

            {/* ── Tab 3: Quy tắc & Thông báo ── */}
            {tab === "rules_notify" && (
              <ShiftRulesNotifyTab value={rulesSettings} onChange={setRulesSettings} />
            )}

          </div>
        )}

        {/* Footer */}
        <div className="settings-footer">
          <div className="left-note">
            <span className="dot" />
            Thay đổi áp dụng từ ca tiếp theo
            {saveSuccess && (
              <span className="save-success-badge">
                <Icon name="CheckCircle" className="mr-4" />
                Đã lưu thành công
              </span>
            )}
          </div>
          <div className="right-actions">
            <Button variant="outline" onClick={onCancel} disabled={saving}>Hủy</Button>
            <Button color="primary" disabled={saving || loading} onClick={onSave}>
              {saving ? "Đang lưu..." : "Lưu cài đặt"}
            </Button>
          </div>
        </div>

      </div>

      {dialogContent && <Dialog content={dialogContent} isOpen={showDialog} />}
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  return ((parts[parts.length - 1]?.[0] ?? "") + (parts[0]?.[0] ?? "")).toUpperCase();
}