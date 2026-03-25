import React, { useContext, useEffect, useState } from "react";
import Button from "components/button/button";
import Icon from "components/icon";
import { UserContext } from "contexts/userContext";
import { ContextType } from "contexts/userContext";
import ShiftService from "services/ShiftService";
import "./NotOpenShiftTab.scss";

type StaffItem = {
  employeeId?: number;
  name: string;
  avatar?: string;
  role?: string;
  isMe?: boolean;
};

type ShiftInfo = {
  shiftConfigId: number;
  name: string;
  time: string;
  dateText: string;
  posName: string;
  defaultCash: number;
};

const EMPTY_SHIFT: ShiftInfo = {
  shiftConfigId: 0,
  name: "—",
  time: "—",
  dateText: new Date().toLocaleDateString("vi-VN"),
  posName: "—",
  defaultCash: 0,
};

type Props = {
  /** Khi bấm "Mở ca làm việc" → chuyển sang tab Vào ca với configId */
  onOpenShiftClick?: (shiftConfigId: number) => void;
  /** Nếu đang có ca active → tự động chuyển sang tab Đang ca */
  onActiveShiftFound?: (shiftId: number) => void;
};

type LoadState = "loading" | "ok" | "error";

export default function NotOpenShiftTab({ onOpenShiftClick, onActiveShiftFound }: Props) {
  const { dataBranch } = useContext(UserContext) as ContextType;
  const branchId: number = dataBranch?.value ?? 0;

  const [loadState, setLoadState]   = useState<LoadState>("loading");
  const [shift, setShift]           = useState<ShiftInfo>(EMPTY_SHIFT);
  const [staffs, setStaffs]         = useState<StaffItem[]>([]);
  const [noConfig, setNoConfig]     = useState(false);

  useEffect(() => {
    if (!branchId) return;
    setLoadState("loading");

    ShiftService.getOverview(branchId)
      .then((res) => {
        const d = res?.data;

        if (!d) {
          setLoadState("error");
          return;
        }

        // Nếu đang có ca active → báo lên parent chuyển luôn sang tab Đang ca
        if (d.hasActiveShift && d.activeShift?.shiftId && onActiveShiftFound) {
          onActiveShiftFound(d.activeShift.shiftId);
          return;
        }

        // Không có config ca nào → hiện thông báo cấu hình
        if (!d.shiftConfigId) {
          setNoConfig(true);
          setLoadState("ok");
          return;
        }

        setShift({
          shiftConfigId: d.shiftConfigId,
          name:         d.shiftName  ?? "Ca làm việc",
          time:         d.startTime && d.endTime
                          ? `${d.startTime} - ${d.endTime}`
                          : "—",
          dateText:     new Date().toLocaleDateString("vi-VN"),
          posName:      d.posDeviceName ?? "—",
          defaultCash:  d.openingCashDefault ?? 0,
        });

        if (d.assignedStaff && d.assignedStaff.length > 0) {
          setStaffs(
            d.assignedStaff.map((s: any, idx: number) => ({
              employeeId: s.employeeId,
              name:       s.employeeName ?? `Nhân viên #${s.employeeId ?? idx + 1}`,
              avatar:     s.avatar,
              role:       s.role,
              isMe:       idx === 0,
            }))
          );
        } else {
          setStaffs([]);
        }

        setLoadState("ok");
      })
      .catch(() => {
        setLoadState("error");
      });
  }, [branchId]);

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ").filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last  = parts[parts.length - 1]?.[0] ?? "";
    return (last + first).toUpperCase();
  };

  const handleOpenShift = () => {
    if (onOpenShiftClick) {
      onOpenShiftClick(shift.shiftConfigId);
    }
  };

  // ── Loading ──
  if (loadState === "loading") {
    return (
      <div className="not-open-shift-tab">
        <div className="not-open-shift-card not-open-shift-card--placeholder">
          <p className="text-muted">Đang tải thông tin ca...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (loadState === "error") {
    return (
      <div className="not-open-shift-tab">
        <div className="not-open-shift-card not-open-shift-card--error">
          <p className="text-danger">Không thể tải thông tin ca. Vui lòng thử lại.</p>
          <Button color="secondary" onClick={() => setLoadState("loading")}>
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // ── Chưa thiết lập ca ──
  if (noConfig) {
    return (
      <div className="not-open-shift-tab">
        <div className="not-open-shift-card not-open-shift-card--empty">
          <Icon name="Clock" />
          <p className="mt-12">Chưa có ca nào được cấu hình cho chi nhánh này.</p>
          <p className="text-muted">Vui lòng vào <strong>Thiết lập ca</strong> để tạo ca trước.</p>
        </div>
      </div>
    );
  }

  // ── Normal ──
  return (
    <div className="not-open-shift-tab">
      <div className="not-open-shift-card">
        <div className="shift-chip">
          <Icon name="Clock" />
          <span>{shift.name}</span>
        </div>

        <div className="shift-time">{shift.time}</div>

        <div className="shift-sub">
          <span>Hôm nay</span>
          <span className="dot">•</span>
          <span>{shift.dateText}</span>
          <span className="dot">•</span>
          <span>{shift.posName}</span>
        </div>

        {staffs.length > 0 && (
          <div className="staff-pills">
            {staffs.map((s, idx) => (
              <div key={s.employeeId ?? idx} className={`staff-pill${s.isMe ? " is-me" : ""}`}>
                <span className="avatar">{getInitials(s.name)}</span>
                <span className="name">
                  {s.name}
                  {s.isMe ? " (bạn)" : ""}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="actions">
          <Button
            color="primary"
            className="btn-open-shift"
            disabled={shift.shiftConfigId === 0}
            onClick={handleOpenShift}
          >
            <Icon name="ArrowRight" className="mr-8" />
            Mở ca làm việc
          </Button>

          {shift.defaultCash > 0 && (
            <div className="note">
              Tiền lẻ đầu ca mặc định:{" "}
              <strong>{shift.defaultCash.toLocaleString()} VNĐ</strong> · Xác nhận ở bước tiếp theo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}