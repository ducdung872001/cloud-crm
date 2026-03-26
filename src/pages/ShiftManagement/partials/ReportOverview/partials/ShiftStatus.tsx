import React, { useEffect, useState } from "react";
import Badge from "components/badge/badge";
import Icon from "components/icon";
import ShiftService from "services/ShiftService";
import "./ShiftStatus.scss";

type ShiftStatusItem = {
  shiftId: number;
  shiftName: string;
  timeRange: string;
  status: string;
  cashierNames: string[];
  orderCount: number;
  revenue: number;
  elapsedSeconds: number;
};

// Mock data — giữ khi API chưa hoạt động
const MOCK_SHIFTS: ShiftStatusItem[] = [
  {
    shiftId: 1,
    shiftName: "Ca 2: Chiều",
    timeRange: "15:00 - 22:00",
    status: "OPEN",
    cashierNames: ["Nguyễn Dinh", "Nguyễn Thông"],
    orderCount: 82,
    revenue: 5300000,
    elapsedSeconds: 4 * 3600 + 32 * 60 + 15,
  },
  {
    shiftId: 2,
    shiftName: "Ca 1: Sáng",
    timeRange: "08:00 - 15:00",
    status: "CLOSED",
    cashierNames: ["Nguyễn Hân", "Nguyễn Dinh"],
    orderCount: 45,
    revenue: 3200000,
    elapsedSeconds: 0,
  },
];

type Props = { branchId: number };

export default function ShiftStatus({ branchId }: Props) {
  const [shifts, setShifts] = useState<ShiftStatusItem[]>([]);
  // Đồng hồ đếm giây cho ca đang active
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!branchId) return;
    ShiftService.getGeneralReport(branchId)
      .then((res) => {
        console.log("[ShiftStatus] API response:", res);
        const d = res?.result;
        if (!d || !d.shiftStatuses || d.shiftStatuses.length === 0) {
          console.warn("[ShiftStatus] No data:", d);
          return;
        }
        setShifts(
          d.shiftStatuses.map((s: any) => ({
            shiftId: s.shiftId ?? 0,
            shiftName: s.shiftName ?? "Ca",
            timeRange: s.timeRange ?? "",
            status: s.status ?? "CLOSED",
            cashierNames: s.cashierNames ?? [],
            orderCount: s.orderCount ?? 0,
            revenue: s.revenue ?? 0,
            elapsedSeconds: s.elapsedSeconds ?? 0,
          }))
        );
      })
      .catch(() => {});
  }, [branchId]);

  const formatElapsed = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const formatCompact = (v: number): string => {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (v >= 1_000) return (v / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(v);
  };

  return (
    <div className="shift-management">
      <h3 className="sub-title mb-16">Trạng thái vận hành ca</h3>
      <div className="shift-list">
        {shifts.map((shift) => {
          const isActive = shift.status === "OPEN";
          // Cộng thêm tick để đồng hồ chạy
          const displaySeconds = isActive ? shift.elapsedSeconds + tick : 0;

          return (
            <div
              key={shift.shiftId}
              className={`shift-card-item ${isActive ? "active-shift" : "disabled-shift"} mb-16`}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h4 className="fw-700">
                    {shift.shiftName} ({shift.timeRange})
                  </h4>
                  {shift.cashierNames.length > 0 && (
                    <p className="text-muted mt-4">
                      Thu ngân: {shift.cashierNames.join(", ")}
                    </p>
                  )}
                </div>
                <span className="text-center">
                  {isActive ? (
                    <Badge variant="success" text="Đang hoạt động" />
                  ) : (
                    <Badge variant="done" text="Đã kết ca" />
                  )}
                </span>
              </div>

              <div className="shift-stats">
                <span>
                  <Icon name="FileText" /> {shift.orderCount} đơn
                </span>
                <span>
                  <Icon name="CreditCard" /> {formatCompact(shift.revenue)} VNĐ
                </span>
                {isActive ? (
                  <span className="text-primary">
                    <Icon name="Clock" /> {formatElapsed(displaySeconds)}
                  </span>
                ) : (
                  // Ca đã đóng — hiển thị chênh lệch nếu có
                  <span className="text-danger">
                    <Icon name="WarningCircle" /> Đã kết ca
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}