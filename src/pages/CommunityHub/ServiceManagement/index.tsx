// [CH] Community Hub - Quản lý dịch vụ tập trung
import React, { useState } from "react";
import { MOCK_SERVICE_CATALOG, SERVICE_CATEGORIES, type ServiceCategory, type IServiceItem } from "@/mocks/community-hub/service-catalog";
import { formatCurrency } from "reborn-util";
import Icon from "@/components/icon";
import "./index.scss";

export default function ServiceManagement() {
  document.title = "Quản lý dịch vụ";
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");
  const [services, setServices] = useState(MOCK_SERVICE_CATALOG);
  const [showForm, setShowForm] = useState(false);

  const filtered = activeCategory === "all"
    ? services
    : services.filter((s) => s.category === activeCategory);

  const countByCategory = (cat: ServiceCategory) =>
    services.filter((s) => s.category === cat && s.status === "active").length;

  return (
    <div className="ch-service-mgmt">
      <div className="ch-service-mgmt__header">
        <div>
          <h2>Quản lý dịch vụ</h2>
          <p className="subtitle">Danh mục tất cả dịch vụ của Hub — dùng để cấu hình gói thành viên & bán lẻ tại POS</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          <Icon name="PlusCircleFill" />
          <span>Thêm dịch vụ</span>
        </button>
      </div>

      {/* Category tabs */}
      <div className="ch-service-mgmt__categories">
        <button
          className={`cat-tab ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          Tất cả <span className="count">{services.filter((s) => s.status === "active").length}</span>
        </button>
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`cat-tab ${activeCategory === cat.key ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            <span className="cat-icon">{cat.icon}</span>
            {cat.label}
            <span className="count">{countByCategory(cat.key)}</span>
          </button>
        ))}
      </div>

      {/* Services table */}
      <div className="ch-service-mgmt__table">
        <table>
          <thead>
            <tr>
              <th>Dịch vụ</th>
              <th>Nhóm ngành</th>
              <th>Đơn vị</th>
              <th>Giá bán lẻ</th>
              <th>Bán lẻ?</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((svc) => {
              const cat = SERVICE_CATEGORIES.find((c) => c.key === svc.category);
              return (
                <tr key={svc.id}>
                  <td>
                    <div className="svc-name">{svc.name}</div>
                    <div className="svc-desc">{svc.description}</div>
                  </td>
                  <td>
                    <span className="cat-badge">
                      <span className="cat-badge-icon">{cat?.icon}</span>
                      {cat?.label}
                    </span>
                  </td>
                  <td>{svc.unit}</td>
                  <td>{svc.price > 0 ? `${formatCurrency(svc.price, ".", "")}đ` : <span className="free">Miễn phí</span>}</td>
                  <td>
                    <span className={`sell-badge ${svc.sellable ? "yes" : "no"}`}>
                      {svc.sellable ? "Có" : "Chỉ trong gói"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-dot ${svc.status}`} />
                    {svc.status === "active" ? "Hoạt động" : "Tạm ngưng"}
                  </td>
                  <td>
                    <button className="btn-action" title="Sửa"><Icon name="Edit" /></button>
                    <button
                      className="btn-action toggle"
                      title={svc.status === "active" ? "Tạm ngưng" : "Kích hoạt"}
                      onClick={() => {
                        setServices((prev) =>
                          prev.map((s) =>
                            s.id === svc.id
                              ? { ...s, status: s.status === "active" ? "inactive" as const : "active" as const }
                              : s,
                          ),
                        );
                      }}
                    >
                      <Icon name={svc.status === "active" ? "EyeSlash" : "Eye"} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty">Không có dịch vụ nào trong nhóm này</div>
        )}
      </div>
    </div>
  );
}
