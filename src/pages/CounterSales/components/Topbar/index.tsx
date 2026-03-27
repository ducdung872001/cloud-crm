import React, { useEffect, useMemo, useRef, useState } from "react";
import SelectCustom from "@/components/selectCustom/selectCustom";
import { IOption } from "@/model/OtherModel";
import { TabType } from "../../types";
import ShiftService from "services/ShiftService";
import { ContextType, UserContext } from "contexts/userContext";
import "./index.scss";

interface ShiftInfo {
  shiftName: string;
  timeRange: string;
  cashierNames: string[];
}

interface TopbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSync: () => void;
  draftCount?: number;
  orderCount?: number;
  warehouses?: IOption[];
  warehouseId?: number;
  onWarehouseChange?: (warehouseId?: number) => void;
}

const Topbar: React.FC<TopbarProps> = ({
  activeTab, onTabChange, onSync,
  draftCount = 0,
  orderCount = 0,
  warehouses = [],
  warehouseId,
  onWarehouseChange,
}) => {
  const { dataBranch, name: staffName } = React.useContext(UserContext) as ContextType;
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const [shiftInfo, setShiftInfo]       = useState<ShiftInfo | null>(null);
  const [shiftLoading, setShiftLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const tabs: { id: TabType; label: string; badge?: number }[] = [
    { id: "pos",    label: "🛒 Bán hàng (POS)" },
    { id: "draft",  label: "📋 Đơn tạm",  badge: draftCount  > 0 ? draftCount  : undefined },
    { id: "orders", label: "📋 Đơn hàng", badge: orderCount  > 0 ? orderCount  : undefined },
    { id: "report", label: "📊 Báo cáo" },
  ];

  const warehouseOptions = useMemo<IOption[]>(
    () => [{ value: 0, label: "Tất cả kho" }, ...warehouses],
    [warehouses]
  );

  // ── Fetch ca đang active ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const branchId = Number(dataBranch?.value ?? 0);
    if (!branchId) { setShiftLoading(false); return; }

    setShiftLoading(true);
    ShiftService.getActiveDashboard(branchId)
      .then((res: any) => {
        if (cancelled) return;
        const d = res?.result;

        // Shape 1: { shiftName, timeRange, cashierNames, ... }
        if (d?.shiftName) {
          setShiftInfo({
            shiftName:    d.shiftName    ?? "",
            timeRange:    d.timeRange    ?? "",
            cashierNames: d.cashierNames ?? [],
          });
          return;
        }
        // Shape 2: { shiftStatuses: [{ status, shiftName, timeRange, ... }] }
        if (Array.isArray(d?.shiftStatuses) && d.shiftStatuses.length > 0) {
          const open = d.shiftStatuses.find((s: any) => s.status === "OPEN");
          if (open) {
            setShiftInfo({
              shiftName:    open.shiftName    ?? "",
              timeRange:    open.timeRange    ?? "",
              cashierNames: open.cashierNames ?? [],
            });
            return;
          }
        }
        setShiftInfo(null);
      })
      .catch(() => { if (!cancelled) setShiftInfo(null); })
      .finally(() => { if (!cancelled) setShiftLoading(false); });

    return () => { cancelled = true; };
  }, [dataBranch]);

  // ── Click outside đóng dropdown kho ──────────────────────────────────────
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setIsWarehouseOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // ── Chip ca làm việc ──────────────────────────────────────────────────────
  const renderShift = () => {
    if (shiftLoading) {
      return <span className="topbar__shift topbar__shift--dim">⏳ Đang tải ca...</span>;
    }
    if (!shiftInfo) {
      return (
        <span className="topbar__shift topbar__shift--warn" title="Chưa có ca nào đang mở">
          ⚠️ Chưa vào ca
        </span>
      );
    }
    const displayName  = shiftInfo.cashierNames[0] ?? (staffName ?? "");
    const tooltipExtra = shiftInfo.cashierNames.length > 1
      ? `Nhân viên: ${shiftInfo.cashierNames.join(", ")}`
      : undefined;

    return (
      <span className="topbar__shift" title={tooltipExtra}>
        🕐 {shiftInfo.shiftName}
        {shiftInfo.timeRange && <> · <b>{shiftInfo.timeRange}</b></>}
        {displayName         && <> · {displayName}</>}
      </span>
    );
  };

  const avatarChar = staffName ? staffName.trim().charAt(0).toUpperCase() : "M";

  return (
    <div className="topbar">
      <div className="topbar__tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tb${activeTab === tab.id ? " active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {tab.badge && <span className="tb__count">{tab.badge}</span>}
          </div>
        ))}
      </div>

      <div className="topbar__right">
        {renderShift()}

        <button className="btn btn--outline btn--sm" onClick={onSync}>
          🔄 Đồng bộ Online
        </button>

        <div ref={wrapperRef} className={`topbar__warehouse${isWarehouseOpen ? " is-open" : ""}`}>
          <button
            type="button"
            className="topbar__avatar"
            onClick={() => setIsWarehouseOpen((prev) => !prev)}
            title={staffName ?? ""}
          >
            {avatarChar}
          </button>
          {isWarehouseOpen && (
            <div className="topbar__warehouse-menu">
              <div className="topbar__warehouse-title">Kho hàng</div>
              <SelectCustom
                id="counterSalesWarehouse"
                name="counterSalesWarehouse"
                fill
                options={warehouseOptions}
                value={warehouseId ?? 0}
                onChange={(option) => {
                  onWarehouseChange?.(option?.value ? Number(option.value) : undefined);
                  setIsWarehouseOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;