/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import BoxTable from "components/boxTable/boxTable";
import Icon from "components/icon";
import Checkbox from "components/checkbox/checkbox";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IOption } from "model/OtherModel";
import Button from "components/button/button";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import { UserContext, ContextType } from "contexts/userContext";
import ShiftService from "services/ShiftService";
import { RulesSettings } from "./partials/ShiftRulesNotify/ShiftRulesNotifyTab";
import ShiftRulesNotifyTab from "./partials/ShiftRulesNotify/ShiftRulesNotifyTab";
import "./ShiftConfig.scss";

type TabKey = "shift_config" | "staff_assign" | "rules_notify";

type ShiftConfigModel = {
  id: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  posDevice: string;
  defaultCash: number;
  minStaff: number;
  color?: string;
};

const colorList = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const CHANNEL_MAP: Record<string, string> = {
  zalo_email: "ZALO+EMAIL",
  email: "EMAIL",
  zalo: "ZALO",
};

const POS_OPTIONS: IOption[] = [{ label: "POS Main Counter", value: "pos1" }];

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

export default function ShiftConfigTabs() {
  document.title = "Thiết lập Ca Vận hành";

  const { dataBranch } = useContext(UserContext) as ContextType;
  const branchId: number = dataBranch?.value ?? 0;

  const [tab, setTab] = useState<TabKey>("shift_config");
  const [saving, setSaving] = useState(false);

  // ── Cấu hình ca ──────────────────────────────────────────────────────
  const [shiftConfigs, setShiftConfigs] = useState<ShiftConfigModel[]>([
    { id: 1, shiftName: "Ca 1: Sáng",  startTime: "08:00", endTime: "15:00", posDevice: "pos1", defaultCash: 1000000, minStaff: 1, color: "#3b82f6" },
    { id: 2, shiftName: "Ca 2: Chiều", startTime: "15:00", endTime: "22:00", posDevice: "pos1", defaultCash: 1000000, minStaff: 1, color: "#8b5cf6" },
  ]);
  const [savedShiftConfigs, setSavedShiftConfigs] = useState<ShiftConfigModel[]>(shiftConfigs);
  const [listIdCheckedShift, setListIdCheckedShift] = useState<number[]>([]);

  // Dialog xóa — tách isOpen riêng để đúng với IDialog interface
  const [dialogContent, setDialogContent] = useState<IContentDialog | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // ── Phân công nhân viên ───────────────────────────────────────────────
  const [staffAssignment, setStaffAssignment] = useState([
    { id: 1, name: "Nguyễn Hân",    role: "Thu ngân", ca1: true,  ca2: false },
    { id: 2, name: "Nguyễn Dinh",   role: "Thu ngân", ca1: true,  ca2: true  },
    { id: 3, name: "Nguyễn Thông",  role: "Thu ngân", ca1: false, ca2: true  },
    { id: 4, name: "Nguyễn Phom",   role: "Thu ngân", ca1: false, ca2: false },
    { id: 5, name: "Nguyễn Phương", role: "Thu ngân", ca1: false, ca2: false },
    { id: 6, name: "Nguyễn Hòa",    role: "Thu ngân", ca1: false, ca2: false },
    { id: 7, name: "Nguyễn Long",   role: "Thu ngân", ca1: false, ca2: false },
  ]);
  const [savedStaffAssignment, setSavedStaffAssignment] = useState<typeof staffAssignment>(staffAssignment);
  const [listIdCheckedStaff, setListIdCheckedStaff] = useState<number[]>([]);

  // ── Quy tắc & Thông báo ──────────────────────────────────────────────
  const [rulesSettings, setRulesSettings] = useState<RulesSettings>(DEFAULT_RULES);
  const [savedRulesSettings, setSavedRulesSettings] = useState<RulesSettings>(DEFAULT_RULES);

  // ── Load config từ API khi mount ──────────────────────────────────────
  useEffect(() => {
    if (!branchId) return;
    ShiftService.getConfig(branchId)
      .then((res) => {
        const d = res?.data;
        if (!d) return;

        if (d.configs && d.configs.length > 0) {
          const mapped: ShiftConfigModel[] = d.configs.map((c: any, idx: number) => ({
            id:          c.id ?? idx + 1,
            shiftName:   c.name ?? `Ca ${idx + 1}`,
            startTime:   c.startTime ?? "",
            endTime:     c.endTime ?? "",
            posDevice:   "pos1",
            defaultCash: c.openingCashDefault ?? 0,
            minStaff:    c.minStaff ?? 1,
            color:       c.color ?? colorList[idx % colorList.length],
          }));
          setShiftConfigs(mapped);
          setSavedShiftConfigs(mapped);
        }

        if (d.rules?.id) {
          const r = d.rules;
          const channelReverse: Record<string, string> = {
            "ZALO+EMAIL": "zalo_email",
            "EMAIL":      "email",
            "ZALO":       "zalo",
          };
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
            channel:             channelReverse[r.notifyChannel ?? ""] ?? "zalo_email",
          };
          setRulesSettings(mapped);
          setSavedRulesSettings(mapped);
        }
      })
      .catch(() => {});
  }, [branchId]);

  const titleActions: ITitleActions = useMemo(() => ({ actions: [] }), []);

  // ── Hủy thay đổi ─────────────────────────────────────────────────────
  const onCancelSettings = () => {
    if (tab === "shift_config") {
      setShiftConfigs(savedShiftConfigs);
      setListIdCheckedShift([]);
      return;
    }
    if (tab === "staff_assign") {
      setStaffAssignment(savedStaffAssignment);
      setListIdCheckedStaff([]);
      return;
    }
    setRulesSettings(savedRulesSettings);
  };

  // ── Lưu cài đặt ──────────────────────────────────────────────────────
  const onSaveSettings = async () => {
    setSaving(true);
    try {
      if (tab === "shift_config") {
        const payload = shiftConfigs.map((c) => ({
          id:        c.id,
          name:      c.shiftName,
          color:     c.color ?? "#3b82f6",
          startTime: c.startTime,
          endTime:   c.endTime,
          minStaff:  c.minStaff,
        }));
        await ShiftService.saveConfigs(branchId, payload).catch(() => {});
        setSavedShiftConfigs(shiftConfigs);
        setListIdCheckedShift([]);
        return;
      }

      if (tab === "staff_assign") {
        const assignments: any[] = [];
        staffAssignment.forEach((s) => {
          shiftConfigs.forEach((cfg, idx) => {
            if (idx === 0 ? s.ca1 : s.ca2) {
              assignments.push({ shiftConfigId: cfg.id, employeeId: s.id, role: s.role });
            }
          });
        });
        await ShiftService.saveStaff(assignments).catch(() => {});
        setSavedStaffAssignment(staffAssignment);
        setListIdCheckedStaff([]);
        return;
      }

      // rules_notify
      const rulesPayload = {
        cashDiffThreshold:   rulesSettings.warningDiff,
        requireDiffReason:   rulesSettings.requireReason ? 1 : 0,
        allowDenomination:   rulesSettings.allowDenomination ? 1 : 0,
        maxShiftHours:       rulesSettings.maxOpenHours,
        blockOpenNoStaff:    rulesSettings.blockIfMissingStaff ? 1 : 0,
        requireManagerClose: rulesSettings.managerConfirmClose ? 1 : 0,
        notifyShiftReport:   rulesSettings.sendCloseReport ? 1 : 0,
        notifyCashDiff:      rulesSettings.sendDiffWarning ? 1 : 0,
        notifyOpenReminder:  rulesSettings.remindOpenShift ? 1 : 0,
        notifyOvertime:      rulesSettings.shiftOverRule ? 1 : 0,
        notifyRecipient:     rulesSettings.receiver,
        notifyChannel:       CHANNEL_MAP[rulesSettings.channel] ?? "ZALO+EMAIL",
      };
      await ShiftService.saveRules(branchId, rulesPayload).catch(() => {});
      setSavedRulesSettings(rulesSettings);
    } catch (e) {
      console.error("Lỗi lưu cài đặt:", e);
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  const updateShift = (id: number, patch: Partial<ShiftConfigModel>) => {
    setShiftConfigs((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addNewShift = () => {
    const newId = Math.max(0, ...shiftConfigs.map((s) => s.id)) + 1;
    setShiftConfigs((prev) => [
      ...prev,
      {
        id:          newId,
        shiftName:   `Ca ${newId}`,
        startTime:   "",
        endTime:     "",
        posDevice:   "pos1",
        defaultCash: 0,
        minStaff:    1,
        color:       colorList[(newId - 1) % colorList.length],
      },
    ]);
  };

  const openDeleteDialog = (item: ShiftConfigModel) => {
    setDialogContent({
      title:         "Xóa ca làm việc",
      message:       `Bạn có chắc chắn muốn xóa "${item.shiftName}" không?`,
      cancelText:    "Hủy",
      cancelAction:  () => setShowDialog(false),
      defaultText:   "Xóa",
      defaultAction: async () => {
        try {
          if (item.id > 0) await ShiftService.deleteConfig(item.id);
        } catch (_) {}
        setShiftConfigs((prev) => prev.filter((s) => s.id !== item.id));
        setShowDialog(false);
      },
      color: "error",
    });
    setShowDialog(true);
  };

  const shiftRowActions = (item: ShiftConfigModel): IAction[] => {
    const hasChecked = listIdCheckedShift.length > 0;
    return [
      {
        title:    "Xóa",
        icon:     <Icon name="Trash" className={hasChecked ? "icon-disabled" : "icon-error"} />,
        disabled: hasChecked,
        callback: () => { if (!hasChecked) openDeleteDialog(item); },
      },
    ];
  };

  const bulkActionShiftItems: BulkActionItemModel[] = useMemo(
    () => [
      {
        title:    "Xóa đã chọn",
        callback: () => {
          setShiftConfigs((prev) => prev.filter((s) => !listIdCheckedShift.includes(s.id)));
          setListIdCheckedShift([]);
        },
      },
    ],
    [listIdCheckedShift],
  );

  const bulkActionStaffItems: BulkActionItemModel[] = useMemo(
    () => [
      {
        title:    "Gán Ca 1",
        callback: () => {
          setStaffAssignment((prev) =>
            prev.map((s) => (listIdCheckedStaff.includes(s.id) ? { ...s, ca1: true } : s)),
          );
          setListIdCheckedStaff([]);
        },
      },
      {
        title:    "Gán Ca 2",
        callback: () => {
          setStaffAssignment((prev) =>
            prev.map((s) => (listIdCheckedStaff.includes(s.id) ? { ...s, ca2: true } : s)),
          );
          setListIdCheckedStaff([]);
        },
      },
      {
        title:    "Bỏ phân ca",
        callback: () => {
          setStaffAssignment((prev) =>
            prev.map((s) =>
              listIdCheckedStaff.includes(s.id) ? { ...s, ca1: false, ca2: false } : s,
            ),
          );
          setListIdCheckedStaff([]);
        },
      },
    ],
    [staffAssignment, listIdCheckedStaff],
  );

  const shiftTitles     = ["", "Ca làm việc", "Bắt đầu", "Kết thúc", "Thiết bị POS", "Tiền lẻ đầu ca", "NV tối thiểu", ""];
  const shiftDataFormat  = ["text-center", "", "", "", "", "", "text-center", "text-center"];
  const staffTitles     = ["", "Nhân viên", "Vai trò", ...shiftConfigs.map((c) => c.shiftName)];
  const staffDataFormat  = ["text-center", "", "", ...shiftConfigs.map(() => "text-center")];

  // ── JSX ───────────────────────────────────────────────────────────────
  return (
    <div className="page-content page-shift-config">
      <TitleAction title="Thiết lập Ca Vận hành" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">

        {/* Tab bar */}
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className={tab === "shift_config" ? "active" : ""} onClick={() => setTab("shift_config")}>
                Cấu hình ca
              </li>
              <li className={tab === "staff_assign" ? "active" : ""} onClick={() => setTab("staff_assign")}>
                Phân công nhân viên
              </li>
              <li className={tab === "rules_notify" ? "active" : ""} onClick={() => setTab("rules_notify")}>
                Quy tắc &amp; Thông báo
              </li>
            </ul>
          </div>
        </div>

        {/* Tab body */}
        <div className="tab-body p-24">

          {/* Tab 1 — Cấu hình ca */}
          {tab === "shift_config" && (
            <Fragment>
              <BoxTable
                name="ca làm việc"
                titles={shiftTitles}
                items={shiftConfigs}
                isBulkAction={listIdCheckedShift.length > 0}
                bulkActionItems={bulkActionShiftItems}
                dataFormat={shiftDataFormat}
                dataMappingArray={(item: ShiftConfigModel) => [
                  <Checkbox
                    key={`chk-${item.id}`}
                    checked={listIdCheckedShift.includes(item.id)}
                    onChange={(v) =>
                      setListIdCheckedShift((prev) =>
                        v ? [...prev, item.id] : prev.filter((id) => id !== item.id),
                      )
                    }
                  />,
                  <Input
                    key={`name-${item.id}`}
                    value={item.shiftName}
                    placeholder="Tên ca..."
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateShift(item.id, { shiftName: e.target.value })
                    }
                  />,
                  <Input
                    key={`start-${item.id}`}
                    value={item.startTime}
                    placeholder="HH:mm"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateShift(item.id, { startTime: e.target.value })
                    }
                  />,
                  <Input
                    key={`end-${item.id}`}
                    value={item.endTime}
                    placeholder="HH:mm"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateShift(item.id, { endTime: e.target.value })
                    }
                  />,
                  <SelectCustom
                    key={`pos-${item.id}`}
                    value={item.posDevice}
                    options={POS_OPTIONS}
                    onChange={(opt: IOption) =>
                      updateShift(item.id, { posDevice: String(opt?.value ?? "pos1") })
                    }
                  />,
                  <NummericInput
                    key={`cash-${item.id}`}
                    value={item.defaultCash}
                    thousandSeparator
                    placeholder="0"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateShift(item.id, {
                        defaultCash: Number(String(e.target.value).replace(/,/g, "")) || 0,
                      })
                    }
                  />,
                  <NummericInput
                    key={`staff-${item.id}`}
                    value={item.minStaff}
                    placeholder="1"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateShift(item.id, { minStaff: Number(e.target.value) || 1 })
                    }
                  />,
                  <div key={`act-${item.id}`} className="d-flex gap-8 justify-content-center">
                    {shiftRowActions(item).map((a, i) => (
                      <span
                        key={i}
                        role="button"
                        onClick={a.disabled ? undefined : a.callback}
                        style={{ cursor: a.disabled ? "not-allowed" : "pointer", opacity: a.disabled ? 0.4 : 1 }}
                      >
                        {a.icon}
                      </span>
                    ))}
                  </div>,
                ]}
              />
              <Button variant="outline" color="primary" className="mt-16" onClick={addNewShift}>
                <Icon name="Plus" className="mr-8" />
                Thêm ca mới
              </Button>
            </Fragment>
          )}

          {/* Tab 2 — Phân công nhân viên */}
          {tab === "staff_assign" && (
            <BoxTable
              name="nhân viên"
              titles={staffTitles}
              items={staffAssignment}
              isBulkAction={listIdCheckedStaff.length > 0}
              bulkActionItems={bulkActionStaffItems}
              dataFormat={staffDataFormat}
              dataMappingArray={(item: typeof staffAssignment[0]) => [
                <Checkbox
                  key={`chk-${item.id}`}
                  checked={listIdCheckedStaff.includes(item.id)}
                  onChange={(v) =>
                    setListIdCheckedStaff((prev) =>
                      v ? [...prev, item.id] : prev.filter((id) => id !== item.id),
                    )
                  }
                />,
                item.name,
                item.role,
                ...shiftConfigs.map((_, cfgIdx) => {
                  const caKey = cfgIdx === 0 ? "ca1" : "ca2";
                  return (
                    <Checkbox
                      key={`${item.id}-ca${cfgIdx}`}
                      checked={item[caKey as "ca1" | "ca2"]}
                      onChange={(v) =>
                        setStaffAssignment((prev) =>
                          prev.map((s) => (s.id === item.id ? { ...s, [caKey]: v } : s)),
                        )
                      }
                    />
                  );
                }),
              ]}
            />
          )}

          {/* Tab 3 — Quy tắc & Thông báo */}
          {tab === "rules_notify" && (
            <ShiftRulesNotifyTab value={rulesSettings} onChange={setRulesSettings} />
          )}
        </div>

        {/* Footer */}
        <div className="action-footer p-24 border-top d-flex justify-content-end gap-12">
          <p className="text-muted align-self-center">• Thay đổi áp dụng từ ca tiếp theo</p>
          <Button variant="outline" onClick={onCancelSettings}>Hủy</Button>
          <Button color="primary" disabled={saving} onClick={onSaveSettings}>
            {saving ? "Đang lưu..." : "Lưu cài đặt"}
          </Button>
        </div>
      </div>

      {/* Dialog xác nhận — isOpen tách riêng, content đúng IContentDialog */}
      {dialogContent && (
        <Dialog content={dialogContent} isOpen={showDialog} />
      )}
    </div>
  );
}