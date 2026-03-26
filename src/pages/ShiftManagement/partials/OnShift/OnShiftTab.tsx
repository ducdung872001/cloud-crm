/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useEffect, useMemo, useState } from "react";
import Button from "components/button/button";
import Icon from "components/icon";
import Loading from "components/loading";
import ShiftService from "services/ShiftService";
import "./OnShiftTab.scss";

type StaffItem = {
  employeeId?: number;
  name: string;
  role: string;
  avatar?: string;
  badgeText: string;
  badgeType: "active" | "manager";
};

type ShiftInfoType = {
  shiftName: string;
  timeRange: string;
  cashierName: string;
  posDeviceName: string;
  elapsedSeconds: number;
};

type StatsType = {
  revenue:  { value: string; sub: string };
  cash:     { value: string; sub: string };
  online:   { value: string; sub: string };
  diff:     { value: string; sub: string; tone: "success" | "danger" | "neutral" };
};

const EMPTY_INFO: ShiftInfoType = {
  shiftName: "—", timeRange: "—", cashierName: "—",
  posDeviceName: "—", elapsedSeconds: 0,
};

const EMPTY_STATS: StatsType = {
  revenue: { value: "0",  sub: "0 đơn hàng" },
  cash:    { value: "0",  sub: "Đầu ca 0 · Thu 0" },
  online:  { value: "0",  sub: "QR: 0 · Thẻ: 0" },
  diff:    { value: "0",  sub: "", tone: "neutral" },
};

type Props = {
  shiftId: number | null;
  branchId: number;
  onEndShift?: () => void;
  onViewOrders?: () => void; // chuyển sang tab "Đơn trong ca"
};

export default function OnShiftTab({ shiftId, branchId, onEndShift, onViewOrders }: Props) {
  const [shiftInfo, setShiftInfo] = useState<ShiftInfoType>(EMPTY_INFO);
  const [stats, setStats]         = useState<StatsType>(EMPTY_STATS);
  const [staffs, setStaffs]       = useState<StaffItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [startedAt, setStartedAt] = useState<number>(Date.now());

  useEffect(() => {
    if (!branchId) return;
    setLoading(true);

    ShiftService.getActiveDashboard(branchId)
      .then((res) => {
        const d = res?.result;
        if (!d) return;

        setShiftInfo({
          shiftName:    d.shiftName    ?? "Ca làm việc",
          timeRange:    d.timeRange    ?? "—",
          cashierName:  d.cashierName  ?? "—",
          posDeviceName: d.posDeviceName ?? "—",
          elapsedSeconds: d.elapsedSeconds ?? 0,
        });

        setStartedAt(Date.now() - (d.elapsedSeconds ?? 0) * 1000);

        setStats({
          revenue: {
            value: formatCompact(d.totalRevenue ?? 0),
            sub:   `${d.totalOrders ?? 0} đơn hàng`,
          },
          cash: {
            value: formatCompact(d.currentCash ?? 0),
            sub:   `Đầu ca ${formatCompact(d.openingCash ?? 0)} · Thu ${formatCompact(d.totalCashSales ?? 0)}`,
          },
          online: {
            value: formatCompact(d.totalOnlinePayment ?? 0),
            sub:   `QR: ${formatCompact(d.totalQR ?? 0)} · Thẻ: ${formatCompact(d.totalCard ?? 0)}`,
          },
          diff: {
            value: formatCompact(d.cashDifference ?? 0),
            sub:   d.diffNote ?? "",
            tone:  (d.cashDifference ?? 0) < 0 ? "danger" : (d.cashDifference ?? 0) > 0 ? "success" : "neutral",
          },
        });

        if (d.activeStaff && d.activeStaff.length > 0) {
          setStaffs(d.activeStaff.map((s: any) => ({
            employeeId: s.employeeId,
            name:       s.employeeName ?? `NV #${s.employeeId}`,
            role:       s.role ?? "Thu ngân",
            avatar:     s.avatar,
            badgeText:  s.role === "Quản lý" ? "Manager" : "Active",
            badgeType:  s.role === "Quản lý" ? "manager" : "active",
          })));
        } else {
          setStaffs([]);
        }
      })
      .catch(() => {
        // Lỗi mạng — giữ empty state, không hiển thị mock
      })
      .finally(() => setLoading(false));
  }, [branchId, shiftId]);

  // Đồng hồ đếm giờ real-time
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const durationText = useMemo(() => {
    const diff = Math.max(0, now - startedAt);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, [now, startedAt]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ").filter(Boolean);
    return ((parts[parts.length - 1]?.[0] ?? "") + (parts[0]?.[0] ?? "")).toUpperCase();
  };

  const handleGoToPOS = () => {
    window.location.href = "/sell";
  };

  if (loading) {
    return (
      <div className="on-shift-tab on-shift-tab--loading">
        <Loading />
      </div>
    );
  }

  return (
    <div className="on-shift-tab">

      {/* Top bar: thông tin ca + đồng hồ + nút kết thúc */}
      <div className="shift-top-bar">
        <div className="left">
          <span className="dot-live" />
          <div className="info">
            <div className="line-1">
              <strong>{shiftInfo.shiftName} · {shiftInfo.timeRange}</strong>
            </div>
            <div className="line-2">
              Thu ngân: {shiftInfo.cashierName}
              {shiftInfo.posDeviceName && shiftInfo.posDeviceName !== "—"
                ? ` · ${shiftInfo.posDeviceName}` : ""}
            </div>
          </div>
        </div>

        <div className="center timer">{durationText}</div>

        <div className="right">
          <Button variant="outline" color="destroy" className="btn-end-shift" onClick={() => onEndShift?.()}>
            <Icon name="CloseSquare" className="mr-8" />
            Kết thúc ca
          </Button>
        </div>
      </div>

      {/* 4 stat cards */}
      <div className="shift-stat-grid">
        <div className="stat-card">
          <div className="label">DOANH THU CA</div>
          <div className="value text-success">{stats.revenue.value}</div>
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
          <div className={`value text-${stats.diff.tone === "neutral" ? "muted" : stats.diff.tone}`}>
            {stats.diff.value}
          </div>
          <div className={`sub${stats.diff.tone === "danger" ? " text-danger" : ""}`}>
            {stats.diff.sub || "Cân bằng"}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions-grid">
        {/* Bán hàng tại POS — navigate thực sự */}
        <div
          className="quick-action-card"
          role="button"
          tabIndex={0}
          onClick={handleGoToPOS}
          onKeyDown={(e) => e.key === "Enter" && handleGoToPOS()}
        >
          <div className="qa-icon qa-icon--pos"><Icon name="Monitor" /></div>
          <div className="qa-content">
            <div className="qa-title">Bán hàng tại POS</div>
            <div className="qa-sub">Tạo đơn hàng mới nhanh chóng</div>
          </div>
          <div className="qa-arrow"><Icon name="ChevronRight" /></div>
        </div>

        {/* Đơn trong ca — chuyển tab */}
        <div
          className="quick-action-card"
          role="button"
          tabIndex={0}
          onClick={() => onViewOrders?.()}
          onKeyDown={(e) => e.key === "Enter" && onViewOrders?.()}
        >
          <div className="qa-icon qa-icon--order"><Icon name="Document" /></div>
          <div className="qa-content">
            <div className="qa-title">Danh sách đơn trong ca</div>
            <div className="qa-sub">
              {stats.revenue.sub} · Xem, tìm kiếm, chỉnh sửa
            </div>
          </div>
          <div className="qa-arrow"><Icon name="ChevronRight" /></div>
        </div>
      </div>

      {/* Nhân viên đang ca */}
      {staffs.length > 0 && (
        <div className="staff-box">
          <div className="staff-box-header">NHÂN VIÊN ĐANG CA</div>
          <div className="staff-list">
            {staffs.map((s, idx) => (
              <div className="staff-row" key={s.employeeId ?? idx}>
                <div className="left">
                  <div className="avatar">
                    {s.avatar
                      ? <img src={s.avatar} alt={s.name} />
                      : getInitials(s.name)
                    }
                  </div>
                  <div className="info">
                    <div className="name">{s.name}</div>
                    <div className="meta">{s.role}</div>
                  </div>
                </div>
                <div className={`badge${s.badgeType === "manager" ? " badge-manager" : " badge-active"}`}>
                  {s.badgeText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function formatCompact(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (abs >= 1_000_000)     return sign + (abs / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1_000)         return sign + (abs / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return sign + String(abs);
}