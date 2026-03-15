import React from "react";
import Badge from "components/badge/badge";
import "./StaffActive.scss";

export default function StaffActive() {
  const activeStaff = [
    {
      id: 1,
      name: "Nguyễn Dinh",
      role: "Thu ngân",
      shift: "Ca Chiều",
      initials: "DI",
      color: "#3b82f6",
      status: "Active",
    },
    {
      id: 2,
      name: "Nguyễn Thông",
      role: "Thu ngân",
      shift: "Ca Chiều",
      initials: "TH",
      color: "#f59e0b",
      status: "Active",
    },
    {
      id: 3,
      name: "Nguyễn Phom",
      role: "Quản lý",
      shift: "Đang trực",
      initials: "PH",
      color: "#8b5cf6",
      status: "Manager",
    },
  ];

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
              <Badge variant={staff.status === "Manager" ? "primary" : "success"} text={staff.status} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
