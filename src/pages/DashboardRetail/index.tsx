import React, { useState, useContext, useEffect, useCallback } from "react";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "reborn-util";
import urls from "configs/urls";
import BoxTable from "components/boxTable/boxTable";
import { UserContext, ContextType } from "contexts/userContext";
import Icon from "@/components/icon";
import { useDashBoard } from "@/hooks/useDashBoard";
import { useShortcut } from "@/hooks/useShortcut";
import { SHORTCUT_OPTIONS, ShortcutKey } from "model/dashboard/DashboardModel";
import InventoryService from "services/InventoryService";

// Map key → metadata để render quick access items (ngoài component để tránh re-create)
const SHORTCUT_KEY_META: Record<ShortcutKey, { label: string; icon: React.ReactElement; path: string }> = {
  POS:          { label: "Tạo đơn",    icon: <Icon name="PlusCircleFill" />,  path: urls.create_sale_add },
  CUSTOMER:     { label: "Khách hàng", icon: <Icon name="Customer" />,        path: urls.customer_list },
  WAREHOUSE:    { label: "Kho hàng",   icon: <Icon name="ImportGoods" />,     path: urls.inventory },
  FINANCE:      { label: "Tài chính",  icon: <Icon name="CashBook" />,        path: urls.finance_management_cashbook },
  INVOICE:      { label: "Hóa đơn",   icon: <Icon name="Invoice" />,         path: urls.sale_invoice },
  TASK:         { label: "Công việc",  icon: <Icon name="ManageWork" />,      path: urls.middle_work },
  PROMO_REPORT: { label: "KM",         icon: <Icon name="Promotion" />,       path: urls.promotional_program },
};

export default function DashboardRetail() {
  document.title = "Bảng điều khiển";
  const navigate = useNavigate();
  const { dataBranch } = useContext(UserContext) as ContextType;
  const { dataTopProduct, dataRevenue } = useDashBoard({ enabled: !!dataBranch }); // fetch top products khi đã có dataBranch, nếu chưa có thì không fetch để tránh lỗi

  const [masked, setMasked] = useState(true);
  const [topTab, setTopTab] = useState("qty");
  const [showShortcutModal, setShowShortcutModal] = useState(false);

  const {
    activeKeys,
    isLoading: isShortcutLoading,
    isSaving,
    draftKeys,
    toggleDraftKey,
    saveShortcuts,
    resetDraft,
  } = useShortcut();

  const handleOpenModal = () => { resetDraft(); setShowShortcutModal(true); };
  const handleCancel    = () => { resetDraft(); setShowShortcutModal(false); };
  const handleSave      = async () => { await saveShortcuts(); setShowShortcutModal(false); };

  // ── Low stock API ─────────────────────────────────────────────────────────
  interface ILowStockItem {
    productId: number;
    variantId: number;
    productName: string;
    sku?: string;
    quantity: number;
    stockStatus: number; // 0: hết hàng, 1: sắp hết
  }

  const [lowStockData, setLowStockData] = useState<ILowStockItem[]>([]);
  const [isLowStockLoading, setIsLowStockLoading] = useState(false);

  const fetchLowStock = useCallback(async () => {
    setIsLowStockLoading(true);
    try {
      // Lấy cả sắp hết (stockStatus=1) và hết hàng (stockStatus=0)
      // Dùng stockStatus=-1 (all) rồi filter client, hoặc gọi 2 lần.
      // API hỗ trợ stockStatus: 0 = hết, 1 = sắp hết, 2 = còn hàng, -1 = tất cả
      const [nearlyOut, outOfStock] = await Promise.all([
        InventoryService.variantStockList({ stockStatus: 1, size: 10, sortBy: "quantity", sortDir: "asc" }),
        InventoryService.variantStockList({ stockStatus: 0, size: 5, sortBy: "quantity", sortDir: "asc" }),
      ]);

      const nearlyItems: ILowStockItem[] = (nearlyOut?.code === 0 ? nearlyOut.result?.data ?? nearlyOut.result ?? [] : [])
        .map((item: any) => ({ ...item, stockStatus: 1 }));
      const outItems: ILowStockItem[] = (outOfStock?.code === 0 ? outOfStock.result?.data ?? outOfStock.result ?? [] : [])
        .map((item: any) => ({ ...item, stockStatus: 0 }));

      // Hết hàng ưu tiên hiển thị trước, sau đó sắp hết
      setLowStockData([...outItems, ...nearlyItems].slice(0, 10));
    } catch {
      // silent — giữ rỗng
    } finally {
      setIsLowStockLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  // BoxTable config
  const lowStockTitles = ["Tên sản phẩm", "Mã sản phẩm", "Trạng thái", "Số lượng"];
  const lowStockMappingArray = (item: ILowStockItem) => {
    const isOut    = item.stockStatus === 0;
    const label    = isOut ? "Hết hàng" : "Sắp hết";
    const color    = isOut ? "#ef4444"  : "#f59e0b";
    return [
      item.productName ?? "—",
      item.sku ?? "—",
      <span className="status-badge" style={{ color, background: color + "18" }}>
        {label}
      </span>,
      item.quantity ?? 0,
    ];
  };

  const navTo = (path) => {
    if (path) navigate(path);
  };

  return (
    <div className="dashboard-retail-page">
      {/* STAT CARDS ROW */}
      <div className="stat-cards-row">
        {[
          {
            label: "Tổng số doanh thu",
            icon: <Icon name="MoneyFill" />,
            value: masked ? "••••••••••" : formatCurrency(dataRevenue.stats.totalRevenue || 0, ".", ""),
            unit: "VNĐ",
          },
          {
            label: "Tổng số đơn hàng",
            icon: <Icon name="CashBook" />,
            value: masked ? "••••••••••" : formatCurrency(dataRevenue.stats.totalOrder || 0, ".", ""),
            unit: "đơn",
          },
          {
            label: "Số đơn hàng hủy",
            icon: <Icon name="ReturnInvoice" />,
            value: formatCurrency(dataRevenue.stats.totalCancelOrder || 0, ".", ""),
            unit: "đơn",
            noMask: true,
          },
        ].map((card, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-card-icon ${i === 2 ? "danger" : "safe"}`}>{card.icon}</div>
            <div className="stat-card-content">
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-value-container">
                <span className={`stat-card-value ${i === 2 ? "danger" : "normal"} ${masked && !card.noMask ? "masked" : ""}`}>{card.value}</span>
                {!card.noMask && (
                  <button onClick={() => setMasked(!masked)} className="stat-card-toggle">
                    👁
                  </button>
                )}
                {card.noMask && <span className="stat-card-edit"></span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE ROW */}
      <div className="middle-row">
        {/* Revenue card */}
        <div className="revenue-card">
          <div className="revenue-card-title">Doanh thu và đơn hàng trong ngày</div>
          <div className="revenue-card-stats">
            <div className="revenue-card-stat">
              <div className="revenue-card-stat-icon">
                <Icon name="MoneyFill" />
              </div>
              <div>
                <div className="revenue-card-stat-label">Doanh thu trong ngày</div>
                <div className="revenue-card-stat-value">
                  {formatCurrency(dataRevenue.stats.todayRevenue || 0, ".", "")} VND
                  <span className="sync-icon">↻</span>
                </div>
              </div>
            </div>
            <div className="revenue-card-stat">
              <div className="revenue-card-stat-icon">
                <Icon name="CashBook" />
              </div>
              <div>
                <div className="revenue-card-stat-label">Đơn hàng</div>
                <div className="revenue-card-stat-value">
                  {formatCurrency(dataRevenue.stats.todayOrder || 0, ".", "")}
                  <span className="sync-icon">↻</span>
                </div>
              </div>
            </div>
          </div>
          {/* Mini chart bars */}
          {/* <div className="mini-chart">
            {[30, 50, 40, 70, 55, 80, 45, 65, 90, 60, 75, 85, 50, 70, 40].map((h, i) => (
              <div key={i} className={`mini-chart-bar ${i === 8 ? "active" : ""}`} style={{ height: `${h}%` }} />
            ))}
          </div> */}

          {/* Mini chart bars */}
          <div className="mini-chart">
            {dataRevenue.listOrderByHour?.map((value, i) => (
              <div key={i} className="mini-chart-bar-container">
                <div className="bar-value">{value}</div>
                <div className={`mini-chart-bar ${i === 8 ? "active" : ""}`} style={{ height: `${value}%` }} />
                <div className="bar-label">{i}:00</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick access */}
        <div className="retail-card quick-access">
          <div className="quick-access-title">Truy cập nhanh</div>
          <div className="quick-access-grid">
            {activeKeys.map((key) => {
              const meta = SHORTCUT_KEY_META[key];
              if (!meta) return null;
              return (
                <div key={key} className="quick-access-item" onClick={() => navTo(meta.path)}>
                  <div className="quick-access-item-icon">{meta.icon}</div>
                  <span className="quick-access-item-label">{meta.label}</span>
                </div>
              );
            })}
            <div className="quick-access-item" onClick={handleOpenModal}>
              <div className="quick-access-item-icon"><Icon name="Settings" /></div>
              <span className="quick-access-item-label">{"Tùy chỉnh\nlối tắt"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="bottom-row">
        {/* Low stock warning */}
        <div className="retail-card">
          <div className="section-header section-header-with-margin">
            <div className="title-group">
              <span className="warning-icon">⚠️</span>
              <span className="section-title">Cảnh báo sắp hết hàng</span>
            </div>
          </div>

          {isLowStockLoading ? (
            <div className="low-stock-loading">Đang tải...</div>
          ) : lowStockData.length === 0 ? (
            <div className="low-stock-empty">✅ Không có sản phẩm sắp hết hàng</div>
          ) : (
            <BoxTable
              name="low-stock"
              titles={lowStockTitles}
              items={lowStockData}
              dataMappingArray={lowStockMappingArray}
              striped={false}
            />
          )}

          <div className="reminder-box">
            <span>🔔</span>
            <span>Nhắc nhở: Kiểm tra kho cuối ngày!</span>
            <span className="view-more" onClick={() => navTo(urls.product_inventory)}>
              Xem thêm ▾
            </span>
          </div>
        </div>

        {/* Top products */}
        <div className="retail-card">
          <div className="section-header">
            <span className="section-title">Top sản phẩm</span>
          </div>
          <div className="top-product-list">
            {dataTopProduct.map((p, i) => {
              const isQtyTab   = topTab === "Theo số lượng";
              const barPct     = isQtyTab ? (p.pctQty ?? 0) : (p.pctRevenue ?? 0);
              const hasRevenue = p.revenue !== null && p.revenue > 0;
              return (
                <div key={i} className="top-product-item">
                  <div className="top-product-item-header">
                    <span className="top-product-item-name">{p.name}</span>
                    <div className="top-product-item-stats">
                      {!isQtyTab && hasRevenue && (
                        <span className="top-product-item-revenue">
                          {formatCurrency(p.revenue, ".", "")} đ
                        </span>
                      )}
                      <span className="top-product-item-pct">{p.qty ?? 0} SP</span>
                    </div>
                  </div>
                  <div className="top-product-item-bar-bg">
                    <div className="top-product-item-bar-fill" style={{ width: `${barPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="tabs">
            {["Theo số lượng", "Theo doanh thu"].map((tab) => (
              <button
                key={tab}
                onClick={() => setTopTab(tab)}
                className={`tabs-btn ${topTab === tab ? "active" : "inactive"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tùy chỉnh lối tắt Modal */}
      {showShortcutModal && (
        <div className="shortcut-modal" onClick={handleCancel}>
          <div className="shortcut-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="shortcut-modal-header">
              <h3>Tùy chỉnh truy cập nhanh</h3>
              <button onClick={handleCancel} className="close-btn">✕</button>
            </div>

            <p className="shortcut-modal-desc">
              Chọn các tính năng bạn muốn hiển thị trên thanh truy cập nhanh ở màn hình chính (Tối đa 5 tính năng).
            </p>

            <div className="shortcut-modal-options">
              {SHORTCUT_OPTIONS.map((opt) => {
                const isChecked = draftKeys.includes(opt.key);
                const isDisabled = !isChecked && draftKeys.length >= 5;
                return (
                  <label
                    key={opt.key}
                    className={`shortcut-modal-option${isChecked ? " checked" : ""}${isDisabled ? " disabled" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() => toggleDraftKey(opt.key)}
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="shortcut-modal-footer">
              <button onClick={handleCancel} className="btn-cancel" disabled={isSaving}>
                Hủy
              </button>
              <button onClick={handleSave} className="btn-save" disabled={isSaving || draftKeys.length === 0}>
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}