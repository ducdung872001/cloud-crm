import React, { useState } from "react";
import { Product, CartItem } from "../../types";
import Loading from "@/components/loading";
import "./index.scss";
import { useProductCategory } from "./useProductCategory";
import { IProductListParams, useProductList } from "./useProductList";
import { IProductFilterRequest } from "@/model/product/ProductRequestModel";
import { formatCurrency } from "reborn-util";
import VariantModal, { MOCK_IPHONE } from "../modals/VariantModal";

const PRODUCTS: Product[] = [
  // { id: "1", icon: "🥛", name: "Sữa TH True Milk 1L", priceLabel: "32,000 ₫", price: 32000, stock: 142, unit: "hộp" },
  // { id: "2", icon: "🥤", name: "Pepsi 330ml", priceLabel: "12,000 ₫", price: 12000, stock: 320, unit: "lon" },
  // { id: "3", icon: "🍜", name: "Mì Hảo Hảo Tôm Chua Cay", priceLabel: "4,500 ₫", price: 4500, stock: 8, unit: "gói", lowStock: true },
  // { id: "4", icon: "🍵", name: "Trà xanh 0 độ 500ml", priceLabel: "10,000 ₫", price: 10000, stock: 96, unit: "chai" },
  // { id: "5", icon: "🧻", name: "Giấy VS Bless You 10 cuộn", priceLabel: "42,000 ₫", price: 42000, stock: 85, unit: "gói" },
  // { id: "6", icon: "🍫", name: "KitKat 4 thanh", priceLabel: "25,000 ₫", price: 25000, stock: 44, unit: "cái" },
  // { id: "7", icon: "🧃", name: "Nước ép cam VinaFruta", priceLabel: "22,000 ₫", price: 22000, stock: 55, unit: "hộp" },
  // { id: "8", icon: "🧴", name: "Dầu gội Clear Men 380ml", priceLabel: "89,000 ₫", price: 89000, stock: 28, unit: "chai" },
];

interface ProductGridProps {
  onAddToCart: (item: Omit<CartItem, "qty">) => void;
  onQrScan: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onAddToCart, onQrScan }) => {
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [params, setParams] = useState<IProductListParams>({
    name: "",
    limit: 10,
    page: 1,
  });

  // ── Hook tách riêng ──
  const { categoryFiltered, isLoadingCategory, isPermissions } = useProductCategory();
  const { listProduct, isLoading, isNoItem, pagination } = useProductList({
    categoryId: activeCategory,
    params: params,
  });

  console.log("categoryFiltered", categoryFiltered);

  // const filtered = PRODUCTS.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  // const handleAddToCart = (prod: Product) => {
  //   onAddToCart({
  //     id: prod.id,
  //     icon: prod.icon,
  //     avatar: prod.avatar,
  //     name: prod.name,
  //     priceLabel: String(formatCurrency(prod.price, ".", "₫")),
  //     price: prod.price,
  //     unitName: prod.unitName || prod.unit,
  //   });
  // };

  // ── Permission guard ──
  if (isPermissions) {
    return (
      <div className="product-grid-wrap product-grid-wrap--empty">
        <span>🔒</span>
        <p>Bạn không có quyền xem danh mục sản phẩm</p>
      </div>
    );
  }

  // Khi bấm vào sản phẩm có biến thể
  const handleOpenVariant = (prod) => {
    setSelectedProduct(prod); // thay bằng data thực từ API
    setVariantModalOpen(true);
  };

  return (
    <div className="product-grid-wrap">
      {/* Search bar */}
      <div className="pg-searchbar">
        <div className="pg-search-input-wrap">
          <span className="pg-search-icon">🔍</span>
          <input type="text" placeholder="Tìm sản phẩm theo tên, mã vạch, SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="qr-pill" onClick={onQrScan}>
          📷 Quét QR
        </button>
        <button className="btn btn--outline btn--sm">+ Tạo SP nhanh</button>
      </div>

      {/* Category tabs */}
      <div className="pg-cattabs">
        {categoryFiltered.map((cat) => (
          <button key={cat.id} className={`ct${activeCategory === cat.id ? " active" : ""}`} onClick={() => setActiveCategory(cat.id)}>
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
            onClick={() => {
              // handleAddToCart(prod)
              handleOpenVariant;
            }}
          >
            <div className="pg-card__icon">
              {prod.avatar ? <img src={prod.avatar} alt={prod.name} /> : <span style={{ fontSize: "40px" }}>{prod.icon}</span>}
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
                // handleAddToCart(prod);
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
        onClick={() => {
          setParams((prev) => ({ ...prev, page: prev.page + 1 }));
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
    </div>
  );
};

export default ProductGrid;
