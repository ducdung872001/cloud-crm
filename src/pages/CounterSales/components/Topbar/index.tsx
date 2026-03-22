import React from "react";
import { TabType } from "../../types";
import "./index.scss";

interface TopbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSync: () => void;
  draftCount?: number;
  orderCount?: number;
}

const Topbar: React.FC<TopbarProps> = ({
  activeTab, onTabChange, onSync,
  draftCount = 0,
  orderCount = 0,
}) => {
  const tabs: { id: TabType; label: string; badge?: number }[] = [
    { id: "pos", label: "🛒 Bán hàng (POS)" },
    { id: "draft", label: "📋 Đơn tạm", badge: draftCount > 0 ? draftCount : undefined },
    { id: "orders", label: "📋 Đơn hàng", badge: orderCount > 0 ? orderCount : undefined },
    { id: "report", label: "📊 Báo cáo" },
  ];

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
        <div className="topbar__avatar">M</div>
      </div>
    </div>
  );
};

export default Topbar;
