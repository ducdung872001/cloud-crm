import React, { useEffect, useState } from "react";
import { CartItem } from "../../types";
import "./index.scss";
import { useProductCategory } from "./useProductCategory";
import { IProductListParams, useProductList } from "./useProductList";
import VariantModal from "../modals/VariantModal";
import QuickAddModal from "../modals/QuickAddModal";
import ServiceService from "@/services/ServiceService";
import { MOCK_MEMBERSHIP_PLANS } from "@/mocks/community-hub/membership-plans";
import { formatCurrency } from "reborn-util";

interface ProductGridProps {
  onAddToCart: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  onQrScan: () => void;
  warehouseId?: number;
}

// [CH] 3 tab chính trên POS
type PosGridTab = "products" | "services" | "membership";

const ProductGrid: React.FC<ProductGridProps> = ({ onAddToCart, onQrScan, warehouseId }) => {
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen]         = useState(false);
  const [selectedProduct, setSelectedProduct]   = useState(null);
  const [activeCategory, setActiveCategory]     = useState("");
  const [search, setSearch]                     = useState("");
  const [posTab, setPosTab]                     = useState<PosGridTab>("products");

  // [CH] Dịch vụ state
  const [serviceList, setServiceList]           = useState<Record<string, unknown>[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const [params, setParams] = useState<IProductListParams>({
    name: "",
    limit: 10,
    page: 1,
    ...(warehouseId ? { warehouseId } : {}),
  });

  useEffect(() => {
    setParams((prev) => {
      if (warehouseId) {
        return { ...prev, page: 1, warehouseId };
      }
      const next = { ...prev, page: 1 };
      delete next.warehouseId;
      return next;
    });
  }, [warehouseId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, name: search, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Hooks sản phẩm ──
  const { categoryFiltered, isPermissions } = useProductCategory();
  const { listProduct, isLoading, pagination } = useProductList({
    categoryId: activeCategory,
    params: params,
  });

  // [CH] Load danh sách dịch vụ khi chuyển tab
  useEffect(() => {
    if (posTab === "services" && serviceList.length === 0) {
      setIsLoadingServices(true);
      ServiceService.filter({ name: "", limit: 50 })
        .then((res) => {
          if (res?.code === 0) {
            const data = res.result?.data ?? res.result?.items ?? res.result;
            setServiceList(Array.isArray(data) ? data : []);
          }
        })
        .finally(() => setIsLoadingServices(false));
    }
  }, [posTab]);

  if (isPermissions) {
    return (
      <div className="product-grid-wrap product-grid-wrap--empty">
        <span>🔒</span>
        <p>Bạn không có quyền xem danh mục sản phẩm</p>
      </div>
    );
  }

  const handleOpenVariant = (prod) => {
    setSelectedProduct(prod);
    setVariantModalOpen(true);
  };

  // [CH] Thêm dịch vụ vào giỏ hàng
  const handleAddService = (svc: Record<string, unknown>) => {
    const svcPrice = Number(svc.discount) || Number(svc.price) || 0;
    onAddToCart({
      id: String(svc.id),
      variantId: String(svc.id),
      icon: "💆",
      avatar: svc.avatar as string || "",
      image: svc.avatar as string || "",
      name: svc.name as string,
      price: svcPrice,
      priceLabel: `${formatCurrency(svcPrice, ".", "")}đ`,
      unit: "lần",
      unitName: "lần",
      itemType: "service",
      qty: 1,
    } as any);
  };

  // [CH] Thêm gói thành viên vào giỏ hàng
  const handleAddMembership = (plan: typeof MOCK_MEMBERSHIP_PLANS[number]) => {
    onAddToCart({
      id: plan.id,
      variantId: plan.id,
      icon: "🎫",
      image: "",
      name: `Thẻ ${plan.name}`,
      price: plan.price,
      priceLabel: `${formatCurrency(plan.price, ".", "")}đ`,
      unit: `${plan.duration_months} tháng`,
      unitName: `${plan.duration_months} tháng`,
      itemType: "membership",
      durationMonths: plan.duration_months,
      qty: 1,
    } as any);
  };

  return (
    <div className="product-grid-wrap">
      {/* [CH] Tab chính: Sản phẩm / Dịch vụ / Thẻ thành viên */}
      <div className="pg-main-tabs">
        <button className={`pg-main-tab${posTab === "products" ? " active" : ""}`} onClick={() => setPosTab("products")}>
          📦 Sản phẩm
        </button>
        <button className={`pg-main-tab${posTab === "services" ? " active" : ""}`} onClick={() => setPosTab("services")}>
          💆 Dịch vụ
        </button>
        <button className={`pg-main-tab${posTab === "membership" ? " active" : ""}`} onClick={() => setPosTab("membership")}>
          🎫 Thẻ thành viên
        </button>
      </div>

      {/* ═══ TAB: SẢN PHẨM ═══ */}
      {posTab === "products" && (
        <>
          <div className="pg-searchbar">
            <div className="pg-search-input-wrap">
              <span className="pg-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên, mã vạch, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="qr-pill" onClick={onQrScan}>📷 Quét QR</button>
            <button className="quick-add-pill" onClick={() => setQuickAddOpen(true)}>⚡ Thêm nhanh SP</button>
          </div>

          <div className="pg-cattabs">
            {categoryFiltered.map((cat) => (
              <button
                key={cat.id}
                className={`ct${activeCategory === cat.id ? " active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="pg-grid">
            {isLoading && listProduct.length === 0 ? (
              <div className="pg-loading">Đang tải sản phẩm…</div>
            ) : listProduct.length === 0 ? (
              <div className="pg-empty">
                <div className="pg-empty__icon">{search ? "🔍" : "📦"}</div>
                <div className="pg-empty__title">
                  {search ? `Không tìm thấy "${search}"` : "Chưa có sản phẩm nào"}
                </div>
                <div className="pg-empty__desc">
                  {search
                    ? "Thử từ khóa khác, quét mã QR, hoặc thêm nhanh sản phẩm vào đơn."
                    : "Bắt đầu bằng cách thêm sản phẩm đầu tiên vào danh mục, hoặc thêm nhanh ngay cho đơn này."}
                </div>
                <div className="pg-empty__actions">
                  <button className="btn btn--primary btn--sm" onClick={() => setQuickAddOpen(true)}>
                    ⚡ Thêm nhanh SP
                  </button>
                  <button className="btn btn--outline btn--sm" onClick={onQrScan}>
                    📷 Quét QR
                  </button>
                </div>
              </div>
            ) : (
              listProduct.map((prod) => (
                <div
                  key={prod.id}
                  className={`pg-card${prod.lowStock ? " pg-card--low" : ""}`}
                  onClick={() => handleOpenVariant(prod)}
                >
                  <div className="pg-card__icon">
                    {prod.avatar ? (
                      <img loading="lazy" src={prod.avatar} alt={prod.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent && !parent.querySelector(".pg-img-fallback")) {
                            const fb = document.createElement("span");
                            fb.className = "pg-img-fallback";
                            fb.style.fontSize = "3.2rem";
                            fb.textContent = prod.icon || "📦";
                            parent.appendChild(fb);
                          }
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "3.2rem" }}>{prod.icon || "📦"}</span>
                    )}
                  </div>
                  <div className="pg-card__name">{prod.name}</div>
                  <div className="pg-card__price">{prod.priceLabel}</div>
                  <div className={`pg-card__stock${prod.lowStock ? " pg-card__stock--warn" : ""}`}>
                    Tồn: {prod.minQuantity} {prod.unitName || prod.unit} {prod.lowStock ? "⚠️" : ""}
                  </div>
                  <button className="pg-card__add" onClick={(e) => { e.stopPropagation(); handleOpenVariant(prod); }}>+</button>
                </div>
              ))
            )}
          </div>

          {listProduct.length > 0 && (
            <>
              <button className="btn btn--outline btn--sm pg-loadmore">
                {listProduct.length}/{pagination.totalItem} sản phẩm
              </button>
              <button
                className="btn btn--outline btn--sm pg-loadmore"
                disabled={isLoading || listProduct.length >= pagination.totalItem}
                onClick={() => setParams((prev) => ({ ...prev, page: Number(prev.page ?? 1) + 1 }))}
              >
                {isLoading ? <div>Đang tải...</div> : <>Hiển thị thêm</>}
              </button>
            </>
          )}
        </>
      )}

      {/* ═══ TAB: DỊCH VỤ ═══ */}
      {posTab === "services" && (
        <>
          <div className="pg-searchbar">
            <div className="pg-search-input-wrap">
              <span className="pg-search-icon">🔍</span>
              <input type="text" placeholder="Tìm dịch vụ..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="pg-grid">
            {isLoadingServices ? (
              <div className="pg-loading">Đang tải dịch vụ...</div>
            ) : (
              (Array.isArray(serviceList) ? serviceList : [])
                .filter((s) => !search || (s.name as string)?.toLowerCase().includes(search.toLowerCase()))
                .map((svc) => (
                  <div key={svc.id as string} className="pg-card pg-card--service" onClick={() => handleAddService(svc)}>
                    <div className="pg-card__icon">
                      {svc.avatar ? (
                        <img loading="lazy" src={svc.avatar as string} alt={svc.name as string}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <span style={{ fontSize: "3.2rem" }}>💆</span>
                      )}
                    </div>
                    <div className="pg-card__name">{svc.name as string}</div>
                    <div className="pg-card__price">
                      {Number(svc.price) > 0 ? `${formatCurrency(Number(svc.price), ".", "")}đ` : "Trong gói"}
                    </div>
                    <div className="pg-card__stock pg-card__stock--svc">
                      {Number(svc.discount) > 0 && <span className="pg-promo">Ưu đãi: {formatCurrency(Number(svc.discount), ".", "")}đ</span>}
                    </div>
                    <button className="pg-card__add" onClick={(e) => { e.stopPropagation(); handleAddService(svc); }}>+</button>
                  </div>
                ))
            )}
            {!isLoadingServices && serviceList.length === 0 && (
              <div className="pg-loading">Chưa có dịch vụ nào. Thêm dịch vụ trong Cài đặt → Danh mục dịch vụ</div>
            )}
          </div>
        </>
      )}

      {/* ═══ TAB: THẺ THÀNH VIÊN ═══ */}
      {posTab === "membership" && (
        <div className="pg-grid pg-grid--membership">
          {MOCK_MEMBERSHIP_PLANS.map((plan) => (
            <div key={plan.id} className="pg-membership-card" style={{ borderTopColor: plan.color }}>
              <div className="pg-membership-card__name" style={{ color: plan.color }}>{plan.name}</div>
              <div className="pg-membership-card__price">{formatCurrency(plan.price, ".", "")}đ</div>
              <div className="pg-membership-card__duration">{plan.duration_months} tháng</div>
              <p className="pg-membership-card__desc">{plan.description}</p>
              <ul className="pg-membership-card__includes">
                {plan.includes.map((inc, i) => (
                  <li key={i}>✓ {inc.service}: <strong>{inc.quota ? `${inc.quota} ${inc.unit}` : inc.unit}</strong></li>
                ))}
              </ul>
              <button className="pg-membership-card__btn" onClick={() => handleAddMembership(plan)}>
                + Thêm vào đơn
              </button>
            </div>
          ))}
        </div>
      )}

      <VariantModal
        open={variantModalOpen}
        productData={selectedProduct}
        onClose={() => setVariantModalOpen(false)}
        onAddToCart={(item) => { onAddToCart(item); setVariantModalOpen(false); }}
      />

      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default ProductGrid;
