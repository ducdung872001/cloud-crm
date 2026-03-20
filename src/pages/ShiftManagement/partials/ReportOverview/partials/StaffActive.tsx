import React, { useEffect, useState } from "react";
import Badge from "components/badge/badge";
import ShiftService from "services/ShiftService";
import "./StaffActive.scss";

type StaffItem = {
  id: number;
  name: string;
  role: string;
  shift: string;
  initials: string;
  color: string;
  status: string;
};

// Bảng màu xoay vòng cho avatar
const AVATAR_COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444", "#06b6d4"];

// Mock data — giữ khi API chưa hoạt động
const MOCK_STAFF: StaffItem[] = [
  { id: 1, name: "Nguyễn Dinh", role: "Thu ngân", shift: "Ca Chiều", initials: "DI", color: "#3b82f6", status: "Active" },
  { id: 2, name: "Nguyễn Thông", role: "Thu ngân", shift: "Ca Chiều", initials: "TH", color: "#f59e0b", status: "Active" },
  { id: 3, name: "Nguyễn Phom", role: "Quản lý", shift: "Đang trực", initials: "PH", color: "#8b5cf6", status: "Manager" },
];

type Props = { branchId: number };

export default function StaffActive({ branchId }: Props) {
  const [activeStaff, setActiveStaff] = useState<StaffItem[]>(MOCK_STAFF);

  useEffect(() => {
    if (!branchId) return;
    ShiftService.getGeneralReport(branchId)
      .then((res) => {
        const d = res?.data;
        if (!d || !d.activeStaff || d.activeStaff.length === 0) return; // giữ mock

        const mapped: StaffItem[] = d.activeStaff.map((s: any, idx: number) => ({
          id: s.employeeId ?? idx + 1,
          name: s.employeeName ?? `NV ${idx + 1}`,
          role: s.role ?? "Thu ngân",
          shift: s.shiftName ?? "Ca",
          initials: getInitials(s.employeeName ?? ""),
          color: AVATAR_COLORS[idx % AVATAR_COLORS.length],
          status: s.role === "Quản lý" ? "Manager" : "Active",
        }));

        setActiveStaff(mapped);
      })
      .catch(() => {});
  }, [branchId]);

  return (
    <div className="staff-active-management">
      <h3 className="sub-title mb-16" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
        Nhân viên đang ca
      </h3>
      <div className="staff-list">
        {activeStaff.map((staff) => (
          <div key={staff.id} className="staff-item-card mb-12">
            <div className="staff-info-wrapper">
              <div className="staff-avatar" style={{ backgroundColor: staff.color }}>
                {staff.initials}
              </div>
              <div className="staff-text">
                <span className="staff-name">{staff.name}</span>
                <span className="staff-detail">
                  {staff.role} • {staff.shift}
                </span>
              </div>
            </div>
            <span className="text-center">
              <Badge
                variant={staff.status === "Manager" ? "primary" : "success"}
                text={staff.status}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (last + first).toUpperCase();
}