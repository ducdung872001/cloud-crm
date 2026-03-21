import React, { useContext, useEffect, useState } from "react";
import Button from "components/button/button";
import Icon from "components/icon";
import { UserContext } from "contexts/userContext";
import { ContextType } from "contexts/userContext";
import ShiftService from "services/ShiftService";
import "./NotOpenShiftTab.scss";

type StaffItem = {
  name: string;
  isMe?: boolean;
};

// Mock data — dùng khi API chưa hoạt động hoặc trả về rỗng
const MOCK_SHIFT = {
  shiftConfigId: 0,
  name: "Ca Chiều",
  time: "15:00 - 22:00",
  dateText: new Date().toLocaleDateString("vi-VN"),
  posName: "POS Main Counter",
  defaultCash: 1000000,
};
const MOCK_STAFFS: StaffItem[] = [
  { name: "Nguyễn Hân", isMe: true },
  { name: "Nguyễn Dinh" },
  { name: "Nguyễn Thông" },
];

type Props = {
  /** Khi mở ca thành công, báo lên parent để chuyển tab "Vào ca" */
  onOpenShiftClick?: (shiftConfigId: number) => void;
};

export default function NotOpenShiftTab({ onOpenShiftClick }: Props) {
  const { dataBranch } = useContext(UserContext) as ContextType;
  const branchId: number = dataBranch?.value ?? 0;

  const [shift, setShift] = useState(MOCK_SHIFT);
  const [staffs, setStaffs] = useState<StaffItem[]>(MOCK_STAFFS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!branchId) return;
    ShiftService.getOverview(branchId)
      .then((res) => {
        // res.data là ShiftOverviewResponse từ backend
        const d = res?.data;
        if (!d) return; // API lỗi hoặc rỗng → giữ mock

        setShift({
          shiftConfigId: d.shiftConfigId ?? 0,
          name: d.shiftName ?? MOCK_SHIFT.name,
          time: d.startTime && d.endTime ? `${d.startTime} - ${d.endTime}` : MOCK_SHIFT.time,
          dateText: new Date().toLocaleDateString("vi-VN"),
          posName: d.posDeviceName ?? MOCK_SHIFT.posName,
          defaultCash: d.openingCashDefault ?? MOCK_SHIFT.defaultCash,
        });

        if (d.assignedStaff && d.assignedStaff.length > 0) {
          setStaffs(
            d.assignedStaff.map((s: any, idx: number) => ({
              name: s.employeeName ?? `NV ${idx + 1}`,
              isMe: idx === 0, // tạm: người đầu tiên là "bạn"
            }))
          );
        }
      })
      .catch(() => {
        // Mạng lỗi → giữ mock data
      });
  }, [branchId]);

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ").filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    return (last + first).toUpperCase();
  };

  const handleOpenShift = () => {
    if (onOpenShiftClick) {
      onOpenShiftClick(shift.shiftConfigId);
    }
  };

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

        <div className="staff-pills">
          {staffs.map((s, idx) => (
            <div key={idx} className={`staff-pill${s.isMe ? " is-me" : ""}`}>
              <span className="avatar">{getInitials(s.name)}</span>
              <span className="name">
                {s.name}
                {s.isMe ? " (bạn)" : ""}
              </span>
            </div>
          ))}
        </div>

        <div className="actions">
          <Button
            color="primary"
            className="btn-open-shift"
            disabled={loading}
            onClick={handleOpenShift}
          >
            <Icon name="ArrowRight" className="mr-8" />
            Mở ca làm việc
          </Button>

          <div className="note">
            Tiền lẻ đầu ca mặc định:{" "}
            <strong>{shift.defaultCash.toLocaleString()} VNĐ</strong> · Xác nhận ở bước tiếp theo
          </div>
        </div>
      </div>
    </div>
  );
}