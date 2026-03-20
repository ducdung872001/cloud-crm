import React, { useState, useMemo, useEffect } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { CartItem } from "../../../types";
import "./index.scss";
import { ProductVariant, useGetDetailProduct, VariantProduct } from "@/hooks/useGetDetailProduct";

// ── Types ─────────────────────────────────────────────────────────────────────

interface VariantModalProps {
  open: boolean;
  productData: any;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, "qty"> & { qty: number }) => void;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_IPHONE: VariantProduct = {
  id: "iphone14",
  name: "Iphone Test",
  icon: "📱",
  unit: "chiếc",
  variantGroups: [
    {
      id: "color",
      label: "Màu sắc",
      options: [
        { id: "pink", label: "Hồng" },
        { id: "black", label: "Đen" },
        { id: "white", label: "Trắng" },
        { id: "blue", label: "Xanh" },
      ],
    },
    {
      id: "ram",
      label: "RAM",
      options: [
        { id: "ram6", label: "6 GB" },
        { id: "ram8", label: "8 GB" },
        { id: "ram16", label: "16 GB" },
      ],
    },
    {
      id: "rom",
      label: "Bộ nhớ",
      options: [
        { id: "rom128", label: "128 GB" },
        { id: "rom256", label: "256 GB" },
        { id: "rom512", label: "512 GB" },
      ],
    },
  ],
  variants: [
    { id: "v1", sku: "IP14-PK-R6-128", price: 22990000, stock: 5, combination: { color: "pink", ram: "ram6", rom: "rom128" } },
    { id: "v2", sku: "IP14-PK-R8-128", price: 24990000, stock: 3, combination: { color: "pink", ram: "ram8", rom: "rom128" } },
    { id: "v3", sku: "IP14-PK-R8-256", price: 27990000, stock: 8, combination: { color: "pink", ram: "ram8", rom: "rom256" } },
    { id: "v4", sku: "IP14-PK-R16-256", price: 30990000, stock: 2, combination: { color: "pink", ram: "ram16", rom: "rom256" } },
    { id: "v5", sku: "IP14-PK-R16-512", price: 35990000, stock: 0, combination: { color: "pink", ram: "ram16", rom: "rom512" } },
    { id: "v6", sku: "IP14-BK-R6-128", price: 22990000, stock: 10, combination: { color: "black", ram: "ram6", rom: "rom128" } },
    { id: "v7", sku: "IP14-BK-R8-256", price: 27990000, stock: 6, combination: { color: "black", ram: "ram8", rom: "rom256" } },
    { id: "v8", sku: "IP14-BK-R16-512", price: 35990000, stock: 4, combination: { color: "black", ram: "ram16", rom: "rom512" } },
    { id: "v9", sku: "IP14-WH-R8-128", price: 24990000, stock: 7, combination: { color: "white", ram: "ram8", rom: "rom128" } },
    { id: "v10", sku: "IP14-BL-R16-256", price: 30990000, stock: 0, combination: { color: "blue", ram: "ram16", rom: "rom256" } },
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function VariantModal({ open, productData, onClose, onAddToCart }: VariantModalProps) {
  // selected: { groupId → optionId }
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<VariantProduct | null>(MOCK_IPHONE);

  const fmt = (n: number) => n.toLocaleString("vi") + " ₫";

  const { isLoading, dataProduct } = useGetDetailProduct({
    productId: Number(productData?.id) || 0,
    enabled: open,
  });
  useEffect(() => {
    if (dataProduct) {
      setProduct(dataProduct);
    }
    console.log("dataProduct>>>", dataProduct);
  }, [dataProduct]);

  // Reset khi mở modal hoặc đổi product
  useEffect(() => {
    if (open) {
      setSelected({});
      setQty(1);
    }
  }, [open, product?.id]);

  // ── Tìm variant khớp với lựa chọn hiện tại ──────────────────────────────
  const matchedVariant = useMemo<ProductVariant | null>(() => {
    if (!product) return null;
    const groupCount = product.variantGroups.length;
    const selectedCount = Object.keys(selected).length;
    if (selectedCount < groupCount) return null;

    return product.variants.find((v) => product.variantGroups.every((g) => v.combination[g.id] === selected[g.id])) ?? null;
  }, [selected, product]);

  // ── Kiểm tra option có khả dụng không (còn variant tồn tại với option đó) ──
  const isOptionAvailable = (groupId: string, optionId: string): boolean => {
    if (!product) return false;
    // Giữ nguyên các lựa chọn khác, thử thay optionId vào groupId
    const testSelected = { ...selected, [groupId]: optionId };
    return product.variants.some((v) => Object.entries(testSelected).every(([gId, oId]) => v.combination[gId] === oId));
  };

  const handleSelectOption = (groupId: string, optionId: string) => {
    setSelected((prev) => {
      // Bấm lại option đang chọn → bỏ chọn
      if (prev[groupId] === optionId) {
        const next = { ...prev };
        delete next[groupId];
        return next;
      }
      return { ...prev, [groupId]: optionId };
    });
    setQty(1); // reset qty khi đổi variant
  };

  const handleQty = (delta: number) => {
    if (!matchedVariant) return;
    setQty((prev) => Math.min(Math.max(1, prev + delta), matchedVariant.stock));
  };

  const handleAddToCart = () => {
    if (!product || !matchedVariant) return;

    // Tạo label từ các lựa chọn
    const variantLabel = product.variantGroups
      .map((g) => {
        const opt = g.options.find((o) => o.id === selected[g.id]);
        return opt ? `${g.label}: ${opt.label}` : "";
      })
      .filter(Boolean)
      .join(" · ");

    onAddToCart({
      id: product.id,
      variantId: matchedVariant.id,
      icon: product.icon ?? "📦",
      name: `${product.name} (${variantLabel})`,
      priceLabel: fmt(matchedVariant.price),
      price: matchedVariant.price,
      unit: product.unit,
      qty,
    });
    onClose();
  };

  const isAllSelected = product ? Object.keys(selected).length === product.variantGroups.length : false;
  const canAdd = isAllSelected && !!matchedVariant && matchedVariant.stock > 0;
  const selectedCount = Object.keys(selected).length;
  const totalGroupCount = product?.variantGroups.length ?? 0;

  const actions: IActionModal = {
    actions_right: {
      buttons: [
        {
          title: "Hủy",
          color: "primary",
          variant: "outline",
          callback: onClose,
        },
        {
          title: "🛒 Thêm vào giỏ hàng",
          color: "primary",
          disabled: !canAdd,
          callback: handleAddToCart,
        },
      ],
    },
  };

  if (!product) return null;

  return (
    <Modal isFade={true} isOpen={open} isCentered={true} staticBackdrop={true} toggle={onClose} className="variant-modal">
      <ModalHeader title="Chọn phân loại hàng" toggle={onClose} />

      <ModalBody>
        {!isLoading ? (
          <div>
            {/* Product info */}
            <div className="variant-modal__product">
              <div className="variant-modal__product-icon">
                {product.image ? <img src={product.image} alt={product.name} /> : product.icon ?? "📦"}
              </div>
              <div className="variant-modal__product-info">
                <div className="variant-modal__product-name">{product.name}</div>

                {/* Giá & tồn kho — hiện khi đã chọn đủ */}
                {matchedVariant ? (
                  <>
                    <div className="variant-modal__price">{fmt(matchedVariant.price)}</div>
                    <div
                      className={`variant-modal__stock${
                        matchedVariant.stock === 0 ? " variant-modal__stock--out" : matchedVariant.stock <= 5 ? " variant-modal__stock--low" : ""
                      }`}
                    >
                      {matchedVariant.stock === 0
                        ? "❌ Hết hàng"
                        : matchedVariant.stock <= 5
                        ? `⚠️ Còn ${matchedVariant.stock} ${product?.unit ?? ""} (sắp hết)`
                        : `✅ Còn ${matchedVariant.stock} ${product?.unit ?? ""}`}
                    </div>
                    <div className="variant-modal__sku">SKU: {matchedVariant.sku}</div>
                  </>
                ) : (
                  <div className="variant-modal__price variant-modal__price--placeholder">
                    {selectedCount < totalGroupCount ? `Vui lòng chọn (${selectedCount}/${totalGroupCount})` : "Không có biến thể phù hợp"}
                  </div>
                )}
              </div>
            </div>

            <div className="variant-modal__divider" />

            {/* Variant groups */}
            {product.variantGroups.map((group) => (
              <div key={group.id} className="variant-modal__group">
                <div className="variant-modal__group-label">
                  {group.label}
                  {selected[group.id] && (
                    <span className="variant-modal__group-selected">: {group.options.find((o) => o.id === selected[group.id])?.label}</span>
                  )}
                </div>
                <div className="variant-modal__options">
                  {group.options.map((opt) => {
                    const isSelected = selected[group.id] === opt.id;
                    const isAvailable = isOptionAvailable(group.id, opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={!isAvailable}
                        className={["variant-opt", isSelected ? "variant-opt--selected" : "", !isAvailable ? "variant-opt--unavailable" : ""]
                          .join(" ")
                          .trim()}
                        onClick={() => isAvailable && handleSelectOption(group.id, opt.id)}
                      >
                        {opt.label}
                        {!isAvailable && <span className="variant-opt__slash" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="variant-modal__divider" />

            {/* Quantity */}
            <div className="variant-modal__qty-row">
              <span className="variant-modal__qty-label">Số lượng</span>
              <div className="variant-modal__qty">
                <button type="button" className="vqb" onClick={() => handleQty(-1)} disabled={qty <= 1}>
                  −
                </button>
                <input
                  type="number"
                  className="vqi"
                  value={qty}
                  min={1}
                  max={matchedVariant?.stock ?? 1}
                  onChange={(e) => {
                    const v = Math.min(Math.max(1, Number(e.target.value)), matchedVariant?.stock ?? 1);
                    setQty(v);
                  }}
                />
                <button type="button" className="vqb" onClick={() => handleQty(1)} disabled={!matchedVariant || qty >= matchedVariant.stock}>
                  +
                </button>
              </div>
              {matchedVariant && matchedVariant.stock > 0 && (
                <span className="variant-modal__qty-max">
                  / {matchedVariant.stock} {product.unit}
                </span>
              )}
            </div>

            {/* Tổng tiền */}
            {matchedVariant && matchedVariant.stock > 0 && (
              <div className="variant-modal__total">
                <span>Thành tiền</span>
                <span className="variant-modal__total-val">{fmt(matchedVariant.price * qty)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="variant-modal__loading">Đang tải thông tin sản phẩm...</div>
        )}
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}
