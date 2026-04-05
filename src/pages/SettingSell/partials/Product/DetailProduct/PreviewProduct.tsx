// ProductPreview.tsx
import React from "react";
import DOMPurify from "dompurify";
import Image from "components/image";
import { formatCurrency } from "reborn-util";
import "./PreviewProduct.scss";

interface ProductPreviewProps {
  product: any;
  config: Record<string, boolean>;
}

export default function ProductPreview({ product, config }: ProductPreviewProps) {
  if (!product) return null;

  return (
    <div className="product-preview">
      <div className="product-preview__left">
        {config.showImage && (
          <div className="preview__main-image">
            <Image src={product.avatar} alt={product.name} />
          </div>
        )}
      </div>

      <div className="product-preview__right">
        {/* Tên */}
        <h2 className="preview__name">{product.name}</h2>
        <span className="preview__code">Mã: {product.code}</span>

        <div className="preview__divider" />

        {/* Giá */}
        {config.showPrice && (
          <div className="preview__price-wrap">
            <span className="preview__price">{formatCurrency(product.price)}</span>
          </div>
        )}

        {/* Giá khuyến mãi */}
        {config.showSalePrice && product.discount && (
          <div className="preview__row">
            <span className="preview__row-label">Khuyến mãi</span>
            <span className="preview__price--sale">
              {product.discountUnit === "percent"
                ? `${product.discount}%`
                : `${formatCurrency(product.discount)}đ`}
            </span>
          </div>
        )}

        <div className="preview__divider" />

        {/* Đơn vị */}
        {config.showUnit && (
          <div className="preview__row">
            <span className="preview__row-label">Đơn vị tính</span>
            <span className="preview__row-value">{product.unitName}</span>
          </div>
        )}

        {/* Phân loại */}
        {config.showCategory && product.categoryName && (
          <div className="preview__row">
            <span className="preview__row-label">Phân loại</span>
            <span className="preview__row-value">{product.categoryName}</span>
          </div>
        )}

        {/* Tồn kho */}
        {config.showStock && (
          <div className="preview__row">
            <span className="preview__row-label">Tồn kho tối thiểu</span>
            <span className="preview__row-value">{product.minQuantity}</span>
          </div>
        )}

        {/* Mã vạch */}
        {config.showBarcode && product.uid && (
          <div className="preview__row">
            <span className="preview__row-label">Mã vạch</span>
            <span className="preview__row-value">{product.uid}</span>
          </div>
        )}

        {/* Hạn sử dụng */}
        {config.showExpired && product.expiredPeriod > 0 && (
          <div className="preview__row">
            <span className="preview__row-label">Hạn sử dụng</span>
            <span className="preview__row-value">{product.expiredPeriod} ngày</span>
          </div>
        )}

        {/* Mô tả */}
        {config.showDesc && product.content && (
          <>
            <div className="preview__divider" />
            <div
              className="preview__desc"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.content) }}
            />
          </>
        )}

        {/* Hiển thị trên website */}
        {config.showProduct && (
          <>
            <div className="preview__divider" />
            <div className="preview__actions">
              <button className="preview__btn--cart">🛒 Thêm vào giỏ hàng</button>
              <button className="preview__btn--buy">Mua ngay</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}