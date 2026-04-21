import React, { useState } from "react";
import { getPermissions, showToast } from "utils/common";
import AddPromotionBundleModal from "./AddPromotionBundleModal";
import { ITitleActions } from "components/titleAction/titleAction";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "components/icon";
import EmptyState, { PreviewBanner } from "@/components/EmptyState";
import { MOCK_COMBOS, MOCK_COMBO_STATS, type IComboItem } from "@/mocks/community-hub/combos";

import "./index.scss";

// TODO: wire up real API khi BE có endpoint combo.
// Hiện tại: tenant mới = combo rỗng. User bấm "Xem trước" để seed mock demo.

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: "orange" | "blue" | "green" | "purple" | "red";
  trend?: number;
}

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: "Đang chạy", className: "combo-badge combo-badge--active" },
  pending: { label: "Chờ duyệt", className: "combo-badge combo-badge--pending" },
  expired: { label: "Hết hạn", className: "combo-badge combo-badge--expired" },
};

export default function PromotionBundle(props: Record<string, unknown>) {
  document.title = "Combo khuyến mãi";

  const { onBackProps } = props;
  const [permissions] = useState(getPermissions());
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [dataCategoryService, setDataCategoryService] = useState<Record<string, unknown>>(null);
  // Chế độ "Xem trước" — không persist, refresh = về rỗng
  const [isPreview, setIsPreview] = useState(false);
  // TODO: replace bằng state từ API khi BE có endpoint combo
  const combos: IComboItem[] = isPreview ? MOCK_COMBOS : [];
  const stats = isPreview ? MOCK_COMBO_STATS : null;

  const titleActions: ITitleActions = {
    actions: [
      (permissions["CATEGORY_SERVICE_ADD"] == 1 || true) && {
        title: "Tạo combo mới",
        callback: () => {
          setDataCategoryService(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, color, trend }) => (
  <div className={`promo-stat-card promo-stat-card--${color}`}>
    <div className="promo-stat-card__body">
      <div className="promo-stat-card__content">
        <p className="promo-stat-card__label">{title}</p>
        <p className="promo-stat-card__value">{value}</p>
        {sub && <p className="promo-stat-card__sub">{sub}</p>}
        {trend !== undefined && (
          <p className={`promo-stat-card__trend ${trend >= 0 ? "promo-stat-card__trend--up" : "promo-stat-card__trend--down"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% so với tháng trước
          </p>
        )}
      </div>
      <div className="promo-stat-card__icon">{icon}</div>
    </div>
  </div>
);

  return (
    <div className="promo-page page-content">
      <HeaderTabMenu
        title="Combo khuyến mãi"
        titleBack="Khuyến mãi"
        titleActions={titleActions}
        onBackProps={onBackProps}
      />

      {isPreview && <PreviewBanner onExit={() => setIsPreview(false)} />}

      {/* Stats — chỉ hiện khi có data (preview hoặc real) */}
      {stats && (
        <div className="promo-stats-grid">
          <StatCard title="Combo đang bán"       value={String(stats.active)}       icon={<Icon name="Gift" />}            color="blue" />
          <StatCard title="Đã bán tháng này"     value={stats.soldThisMonth.toLocaleString("vi")} icon={<Icon name="ShoppingBagOpen" />} color="green" />
          <StatCard title="Doanh thu Combo"      value={stats.revenueVnd}           icon={<Icon name="MoneyFill" />}       color="purple" trend={stats.revenueTrendPct} />
          <StatCard title="Combo hiệu quả nhất"  value={stats.topComboName}         sub={`${stats.topComboSold} lượt mua`} icon={<Icon name="Star" />} color="orange" />
        </div>
      )}

      {/* Empty state khi chưa có combo nào */}
      {combos.length === 0 && !isPreview ? (
        <EmptyState
          variant="coming-soon"
          icon="🎁"
          title="Chưa có combo khuyến mãi nào"
          description="Tạo combo đầu tiên để bán nhiều sản phẩm với giá ưu đãi — tăng giá trị đơn hàng trung bình. Hoặc xem trước giao diện với 4 combo mẫu."
          action={
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => { setDataCategoryService(null); setShowModalAdd(true); }}
            >
              + Tạo combo mới
            </button>
          }
          secondaryAction={
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                setIsPreview(true);
                showToast("Đang ở chế độ xem trước với dữ liệu demo", "info");
              }}
            >
              👁️ Xem trước giao diện
            </button>
          }
          hint="Xem trước dùng 4 combo mẫu + số liệu mẫu. Đóng hoặc tải lại trang sẽ quay về trạng thái này."
        />
      ) : null}

      <div className="combo-grid">
        {combos.map((c) => {
          const badge = statusMap[c.status] || statusMap.pending;
          return (
            <div key={c.id} className="combo-card">
              <div className="combo-card__header">
                <div>
                  <h3 className="combo-card__title">{c.name}</h3>
                  <div className="combo-card__badge-wrap">
                    <span className={badge.className}>{badge.label}</span>
                  </div>
                </div>
                <div className="combo-card__prices">
                  <p className="combo-card__price-sale">{c.sale}đ</p>
                  <p className="combo-card__price-orig">{c.orig}đ</p>
                </div>
              </div>

              <div className="combo-card__products">
                {c.products.map((p, i) => (
                  <span key={i} className="combo-card__product-tag">{p}</span>
                ))}
              </div>

              <div className="combo-card__footer">
                <div className="combo-card__stats">
                  <div>
                    <p className="combo-card__stat-label">Tiết kiệm</p>
                    <p className="combo-card__stat-val combo-card__stat-val--green">{c.pct}</p>
                  </div>
                  <div>
                    <p className="combo-card__stat-label">Đã bán</p>
                    <p className="combo-card__stat-val">{c.sold} combo</p>
                  </div>
                </div>
                <div className="combo-card__actions">
                  <button className="combo-card__btn combo-card__btn--outline" onClick={() => {
                    if (isPreview) {
                      showToast("Đây là combo demo — thoát xem trước để chỉnh sửa combo thật.", "warning");
                      return;
                    }
                    setDataCategoryService(c);
                    setShowModalAdd(true);
                  }}>Sửa</button>
                  <button className="combo-card__btn combo-card__btn--solid" onClick={() => {
                    if (isPreview) {
                      showToast("Đây là combo demo — thoát xem trước để xem combo thật.", "warning");
                      return;
                    }
                    setDataCategoryService(c);
                    setShowModalAdd(true);
                  }}>Xem</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddPromotionBundleModal
        onShow={showModalAdd}
        data={dataCategoryService}
        onHide={() => setShowModalAdd(false)}
      />
    </div>
  );
}
