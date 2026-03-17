/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useEffect, useMemo, useState } from "react";
import Button from "components/button/button";
import Icon from "components/icon";
import "./OnShiftTab.scss";

type StaffItem = {
  name: string;
  role: string;
  shiftName?: string;
  isMe?: boolean;
  badgeText: string;
  badgeType?: "active" | "manager";
};

export default function OnShiftTab() {
  const shiftInfo = useMemo(
    () => ({
      shiftName: "Ca Chiều",
      timeRange: "15:00 - 22:00",
      cashier: "Nguyễn Hân",
      posName: "POS Main Counter",
      startedAt: Date.now() - 4 * 60 * 60 * 1000 - 32 * 60 * 1000 - 15 * 1000,
    }),
    []
  );

  const stats = useMemo(
    () => ({
      revenue: { value: "5.3M", sub: "82 đơn hàng", tone: "success" as const },
      cash: { value: "6.8M", sub: "Đầu ca 1M · Thu 5.8M" },
      online: { value: "1.5M", sub: "QR: 1.2M · Thẻ: 0.3M" },
      diff: { value: "-50K", sub: "Ca Sáng · Đã giải trình", tone: "danger" as const },
    }),
    []
  );

  const staffs: StaffItem[] = useMemo(
    () => [
      { name: "Nguyễn Hân", role: "Thu ngân", shiftName: "Ca Chiều", isMe: true, badgeText: "Active", badgeType: "active" },
      { name: "Nguyễn Dinh", role: "Thu ngân", shiftName: "Ca Chiều", badgeText: "Active", badgeType: "active" },
      { name: "Nguyễn Phom", role: "Quản lý", shiftName: "Đang trực", badgeText: "Manager", badgeType: "manager" },
    ],
    []
  );

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ").filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    return (last + first).toUpperCase();
  };

  // timer
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const durationText = useMemo(() => {
    const diff = Math.max(0, now - shiftInfo.startedAt);
    const totalSec = Math.floor(diff / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, [now, shiftInfo.startedAt]);

  return (
    <div className="on-shift-tab">
      <div className="shift-top-bar">
        <div className="left">
          <span className="dot-live" />
          <div className="info">
            <div className="line-1">
              <strong>
                {shiftInfo.shiftName} · {shiftInfo.timeRange}
              </strong>
            </div>
            <div className="line-2">
              Thu ngân: {shiftInfo.cashier} · {shiftInfo.posName}
            </div>
          </div>
        </div>

        <div className="center timer">{durationText}</div>

        <div className="right">
          <Button
            variant="outline"
            color="destroy"
            className="btn-end-shift"
            onClick={() => {
              // TODO
              console.log("Kết thúc ca");
            }}
          >
            <Icon name="CloseSquare" className="mr-8" />
            Kết thúc ca
          </Button>
        </div>
      </div>

      <div className="shift-stat-grid">
        <div className="stat-card">
          <div className="label">DOANH THU CA</div>
          <div className={`value text-success`}>{stats.revenue.value}</div>
          <div className="sub">{stats.revenue.sub}</div>
        </div>

        <div className="stat-card">
          <div className="label">TIỀN MẶT HIỆN TẠI</div>
          <div className="value">{stats.cash.value}</div>
          <div className="sub">{stats.cash.sub}</div>
        </div>

        <div className="stat-card">
          <div className="label">THANH TOÁN ONLINE</div>
          <div className="value">{stats.online.value}</div>
          <div className="sub">{stats.online.sub}</div>
        </div>

        <div className="stat-card">
          <div className="label">CHÊNH LỆCH</div>
          <div className={`value text-danger`}>{stats.diff.value}</div>
          <div className="sub text-danger">{stats.diff.sub}</div>
        </div>
      </div>

      <div className="quick-actions-grid">
        <div className="quick-action-card" role="button" tabIndex={0} onClick={() => console.log("Bán hàng tại POS")} onKeyDown={() => {}}>
          <div className="qa-icon qa-icon--pos">
            <Icon name="Monitor" />
          </div>
          <div className="qa-content">
            <div className="qa-title">Bán hàng tại POS</div>
            <div className="qa-sub">Tạo đơn hàng mới nhanh chóng</div>
          </div>
          <div className="qa-arrow">
            <Icon name="ChevronRight" />
          </div>
        </div>

        <div className="quick-action-card" role="button" tabIndex={0} onClick={() => console.log("Danh sách đơn trong ca")} onKeyDown={() => {}}>
          <div className="qa-icon qa-icon--order">
            <Icon name="Document" />
          </div>
          <div className="qa-content">
            <div className="qa-title">Danh sách đơn trong ca</div>
            <div className="qa-sub">82 đơn · Xem, tìm kiếm, chỉnh sửa</div>
          </div>
          <div className="qa-arrow">
            <Icon name="ChevronRight" />
          </div>
        </div>
      </div>

      <div className="staff-box">
        <div className="staff-box-header">NHÂN VIÊN ĐANG CA</div>

        <div className="staff-list">
          {staffs.map((s, idx) => (
            <div className="staff-row" key={idx}>
              <div className="left">
                <div className={`avatar${s.isMe ? " is-me" : ""}`}>{getInitials(s.name)}</div>
                <div className="info">
                  <div className="name">
                    {s.name} {s.isMe ? <span className="me">(bạn)</span> : null}
                  </div>
                  <div className="meta">
                    {s.role}
                    {s.shiftName ? ` · ${s.shiftName}` : ""}
                  </div>
                </div>
              </div>

              <div className={`badge${s.badgeType === "manager" ? " badge-manager" : " badge-active"}`}>{s.badgeText}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
