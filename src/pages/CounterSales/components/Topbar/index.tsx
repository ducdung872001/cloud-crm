import React, { useEffect, useMemo, useRef, useState } from "react";
import SelectCustom from "@/components/selectCustom/selectCustom";
import { IOption } from "@/model/OtherModel";
import { TabType } from "../../types";
import "./index.scss";

interface TopbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSync: () => void;
  draftCount?: number;
  orderCount?: number;
  warehouses?: IOption[];
  warehouseId?: number;
  onWarehouseChange?: (warehouseId?: number) => void;
  onStartTour?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({
  activeTab, onTabChange, onSync,
  draftCount = 0,
  orderCount = 0,
  warehouses = [],
  warehouseId,
  onWarehouseChange,
  onStartTour,
}) => {
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const tabs: { id: TabType; label: string; badge?: number }[] = [
    { id: "pos", label: "🛒 Bán hàng (POS)" },
    { id: "draft", label: "📋 Đơn tạm", badge: draftCount > 0 ? draftCount : undefined },
    { id: "orders", label: "📋 Đơn hàng", badge: orderCount > 0 ? orderCount : undefined },
    { id: "report", label: "📊 Báo cáo" },
  ];
  const warehouseOptions = useMemo<IOption[]>(
    () => [{ value: 0, label: "Tất cả kho" }, ...warehouses],
    [warehouses]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsWarehouseOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar__tabs">
        {tabs.map((tab) => (
          <div key={tab.id} className={`tb${activeTab === tab.id ? " active" : ""}`} onClick={() => onTabChange(tab.id)}>
            {tab.label}
            {tab.badge && <span className="tb__count">{tab.badge}</span>}
          </div>
        ))}
      </div>
      <div className="topbar__right">
        <span className="topbar__shift">
          Ca làm việc: <b>07:00 – 19:00</b>
        </span>
        <button className="btn btn--outline btn--sm" onClick={onSync}>
          🔄 Đồng bộ Online
        </button>
        {onStartTour && (
          <button
            className="topbar__help-btn"
            onClick={onStartTour}
            title="Xem lại hướng dẫn sử dụng"
          >
            ❓
          </button>
        )}
        <div ref={wrapperRef} className={`topbar__warehouse${isWarehouseOpen ? " is-open" : ""}`}>
          <button type="button" className="topbar__avatar" onClick={() => setIsWarehouseOpen((prev) => !prev)}>
            M
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