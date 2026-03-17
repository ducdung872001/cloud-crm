import React from "react";
import Button from "components/button/button";
import Icon from "components/icon";
import "./NotOpenShiftTab.scss";

type StaffItem = {
  name: string;
  isMe?: boolean;
};

export default function NotOpenShiftTab() {
  const shift = {
    name: "Ca Chiều",
    time: "15:00 - 22:00",
    dateText: "15/03/2026",
    posName: "POS Main Counter",
    defaultCash: 1000000,
  };

  const staffs: StaffItem[] = [{ name: "Nguyễn Hân", isMe: true }, { name: "Nguyễn Dinh" }, { name: "Nguyễn Thông" }];

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ").filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    return (last + first).toUpperCase();
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
            onClick={() => {
              console.log("Mở ca làm việc");
            }}
          >
            <Icon name="ArrowRight" className="mr-8" />
            Mở ca làm việc
          </Button>

          <div className="note">
            Tiền lẻ đầu ca mặc định: <strong>{shift.defaultCash.toLocaleString()} VNĐ</strong> · Xác nhận ở bước tiếp theo
          </div>
        </div>
      </div>
    </div>
  );
}
