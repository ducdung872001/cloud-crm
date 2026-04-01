import React, { useEffect, useState } from "react";
import { CartItem } from "../../types";
import "./index.scss";
import { useProductCategory } from "./useProductCategory";
import { IProductListParams, useProductList } from "./useProductList";
import VariantModal from "../modals/VariantModal";
import QuickAddModal from "../modals/QuickAddModal";

interface ProductGridProps {
  onAddToCart: (item: Omit<CartItem, "qty">) => void;
  onQrScan: () => void;
  warehouseId?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onAddToCart, onQrScan, warehouseId }) => {
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen]         = useState(false);
  const [selectedProduct, setSelectedProduct]   = useState(null);
  const [activeCategory, setActiveCategory]     = useState("");
  const [search, setSearch]                     = useState("");
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

  // ── Hook tách riêng ──
  const { categoryFiltered, isPermissions } = useProductCategory();
  const { listProduct, isLoading, pagination } = useProductList({
    categoryId: activeCategory,
    params: params,
  });

  // ── Permission guard ──
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

  return (
    <div className="product-grid-wrap">
      {/* Search bar */}
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
        <button className="qr-pill" onClick={onQrScan}>
          📷 Quét QR
        </button>
        <button className="quick-add-pill" onClick={() => setQuickAddOpen(true)}>
          ⚡ Thêm nhanh SP
        </button>
      </div>

      {/* Category tabs */}
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

      {/* Products */}
      <div className="pg-grid">
        {listProduct.map((prod) => (
          <div
            key={prod.id}
            className={`pg-card${prod.lowStock ? " pg-card--low" : ""}`}
            onClick={() => handleOpenVariant(prod)}
          >
            <div className="pg-card__icon">
              {prod.avatar ? (
                <img
                  src={prod.avatar}
                  alt={prod.name}
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
            <button
              className="pg-card__add"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenVariant(prod);
              }}
            >
              +
            </button>
          </div>
        ))}
      </div>

      <button className="btn btn--outline btn--sm pg-loadmore">
        {listProduct.length}/{pagination.totalItem} sản phẩm
      </button>
      <button
        className="btn btn--outline btn--sm pg-loadmore"
        disabled={isLoading || listProduct.length >= pagination.totalItem}
        onClick={() => {
          setParams((prev) => ({ ...prev, page: Number(prev.page ?? 1) + 1 }));
        }}
      >
        {isLoading ? <div>Đang tải...</div> : <>Hiển thị thêm</>}
      </button>

      <VariantModal
        open={variantModalOpen}
        productData={selectedProduct}
        onClose={() => setVariantModalOpen(false)}
        onAddToCart={(item) => {
          onAddToCart(item);
          setVariantModalOpen(false);
        }}
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