import React, { useCallback, useContext, useEffect, useState } from "react";
import Button from "components/button/button";
import Icon from "components/icon";
import { UserContext, ContextType } from "contexts/userContext";
import ShiftService from "services/ShiftService";
import "./NotOpenShiftTab.scss";

type StaffItem = { employeeId?: number; name: string; avatar?: string; role?: string; isMe?: boolean; };

type ShiftInfo = {
  shiftConfigId: number; name: string; time: string;
  dateText: string; posName: string; defaultCash: number;
};

const EMPTY_SHIFT: ShiftInfo = {
  shiftConfigId: 0, name: "—", time: "—",
  dateText: new Date().toLocaleDateString("vi-VN"), posName: "—", defaultCash: 0,
};

type Props = {
  onOpenShiftClick?: (shiftConfigId: number, shiftName: string, shiftTime: string, defaultCash: number) => void;
  onActiveShiftFound?: (shiftId: number) => void;
};

type LoadState = "loading" | "ok" | "error";

export default function NotOpenShiftTab({ onOpenShiftClick, onActiveShiftFound }: Props) {
  const { dataBranch } = useContext(UserContext) as ContextType;
  const branchId: number = dataBranch?.value ?? 0;

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [shift, setShift]         = useState<ShiftInfo>(EMPTY_SHIFT);
  const [staffs, setStaffs]       = useState<StaffItem[]>([]);
  const [noConfig, setNoConfig]   = useState(false);

  const fetchData = useCallback(() => {
    if (!branchId) return;
    setLoadState("loading"); setNoConfig(false);
    ShiftService.getOverview(branchId)
      .then((res) => {
        const d = res?.result;
        if (!d) { setLoadState("error"); return; }
        if (d.hasActiveShift && d.activeShift?.shiftId && onActiveShiftFound) {
          onActiveShiftFound(d.activeShift.shiftId); return;
        }
        if (!d.shiftConfigId) { setNoConfig(true); setLoadState("ok"); return; }
        setShift({
          shiftConfigId: d.shiftConfigId,
          name:         d.shiftName ?? "Ca làm việc",
          time:         d.startTime && d.endTime ? `${d.startTime} - ${d.endTime}` : "—",
          dateText:     new Date().toLocaleDateString("vi-VN"),
          posName:      d.posDeviceName ?? "—",
          defaultCash:  d.openingCashDefault ?? 0,
        });
        setStaffs(
          d.assignedStaff?.map((s: any, idx: number) => ({
            employeeId: s.employeeId, name: s.employeeName ?? `NV #${s.employeeId ?? idx + 1}`,
            avatar: s.avatar, role: s.role, isMe: idx === 0,
          })) ?? []
        );
        setLoadState("ok");
      })
      .catch(() => setLoadState("error"));
  }, [branchId, onActiveShiftFound]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getInitials = (n: string) => {
    const p = n.trim().split(" ").filter(Boolean);
    return ((p[p.length - 1]?.[0] ?? "") + (p[0]?.[0] ?? "")).toUpperCase();
  };

  if (loadState === "loading") return (
    <div className="not-open-shift-tab">
      <div className="not-open-shift-card not-open-shift-card--placeholder"><p className="text-muted">Đang tải thông tin ca...</p></div>
    </div>
  );

  if (loadState === "error") return (
    <div className="not-open-shift-tab">
      <div className="not-open-shift-card not-open-shift-card--error">
        <p className="text-danger">Không thể tải thông tin ca. Vui lòng thử lại.</p>
        <Button color="secondary" onClick={fetchData}>Thử lại</Button>
      </div>
    </div>
  );

  if (noConfig) return (
    <div className="not-open-shift-tab">
      <div className="not-open-shift-card not-open-shift-card--empty">
        <Icon name="Clock" />
        <p className="mt-12">Chưa có ca nào được cấu hình cho chi nhánh này.</p>
        <p className="text-muted">Vui lòng vào <strong>Thiết lập ca</strong> để tạo ca trước.</p>
      </div>
    </div>
  );

  return (
    <div className="not-open-shift-tab">
      <div className="not-open-shift-card">
        <div className="shift-chip"><Icon name="Clock" /><span>{shift.name}</span></div>
        <div className="shift-time">{shift.time}</div>
        <div className="shift-sub">
          <span>Hôm nay</span><span className="dot">•</span>
          <span>{shift.dateText}</span><span className="dot">•</span>
          <span>{shift.posName}</span>
        </div>
        {staffs.length > 0 && (
          <div className="staff-pills">
            {staffs.map((s, i) => (
              <div key={s.employeeId ?? i} className={`staff-pill${s.isMe ? " is-me" : ""}`}>
                <span className="avatar">{getInitials(s.name)}</span>
                <span className="name">{s.name}{s.isMe ? " (bạn)" : ""}</span>
              </div>
            ))}
          </div>
        )}
        <div className="actions">
          <Button color="primary" className="btn-open-shift" disabled={shift.shiftConfigId === 0}
            onClick={() => onOpenShiftClick?.(shift.shiftConfigId, shift.name, shift.time, shift.defaultCash)}>
            <Icon name="ArrowRight" className="mr-8" />Mở ca làm việc
          </Button>
          {shift.defaultCash > 0 && (
            <div className="note">
              Tiền lẻ đầu ca mặc định: <strong>{shift.defaultCash.toLocaleString()} VNĐ</strong> · Xác nhận ở bước tiếp theo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}