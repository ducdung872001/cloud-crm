import React from "react";
import "./index.scss";

const navItems = [
  { icon: "🏠", label: "Trang chủ" },
  { icon: "🛒", label: "Bán hàng", active: true },
  { icon: "📦", label: "Sản phẩm" },
  { icon: "🧱", label: "Nguyên liệu" },
  { icon: "🏪", label: "Kho hàng" },
  { icon: "👥", label: "Khách hàng & NCC", badge: 3 },
  { icon: "💰", label: "Sổ thu chi" },
  { icon: "🧾", label: "Công nợ" },
];

const Sidebar: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState(1);

  return (
    <aside className="sidebar">
      <div className="sb-logo">🛍️</div>
      {navItems.map((item, i) => (
        <div key={i} className={`sbi${activeIndex === i ? " active" : ""}`} onClick={() => setActiveIndex(i)}>
          <span>{item.icon}</span>
          <span className="tip">{item.label}</span>
          {item.badge && <span className="nb">{item.badge}</span>}
        </div>
      ))}
      <div className="sbi sbi--bottom">
        <span>⚙️</span>
        <span className="tip">Cài đặt</span>
      </div>
    </aside>
  );
};

export default Sidebar;
