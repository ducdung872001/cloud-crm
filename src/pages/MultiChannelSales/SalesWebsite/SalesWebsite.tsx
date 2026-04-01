import React, { useState, useRef, useCallback } from "react";
import _ from "lodash";
import { QRCodeCanvas } from "qrcode.react";
import "./SalesWebsite.scss";
import Input from "@/components/input/input";
import TextArea from "@/components/textarea/textarea";
import ButtonOnOff from "@/components/ButtonOnOff/ButtonOnOff";
import { showToast } from "@/utils/common";

// ─── QR Modal ─────────────────────────────────────────────────────────────────

interface QRWebsiteModalProps {
  domain: string;
  storeName: string;
  onClose: () => void;
}

function QRWebsiteModal({ domain, storeName, onClose }: QRWebsiteModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const url = domain.startsWith("http") ? domain : `https://${domain}`;

  // Lấy canvas element sau khi render
  const handleRef = useCallback((node: any) => {
    const el: HTMLCanvasElement | null = node?.canvas ?? node ?? null;
    if (el) canvasRef.current = el;
  }, []);

  // Tải ảnh QR về máy
  function handleDownload() {
    const el = canvasRef.current
      ?? (document.querySelector(".sw-qr-canvas canvas") as HTMLCanvasElement | null);
    if (!el) { showToast("Không lấy được ảnh QR", "error"); return; }
    const dataUrl = el.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-website-${domain.replace(/[^a-z0-9]/gi, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Đã tải ảnh QR về máy", "success");
  }

  // Copy link website
  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Đã sao chép link website", "success");
    } catch {
      showToast("Trình duyệt không hỗ trợ copy", "error");
    }
  }

  // Share native (mobile)
  async function handleNativeShare() {
    const el = canvasRef.current
      ?? (document.querySelector(".sw-qr-canvas canvas") as HTMLCanvasElement | null);
    if (navigator.share && el) {
      try {
        const blob = await new Promise<Blob>((res) => el.toBlob((b) => res(b!), "image/png"));
        const file = new File([blob], "qr-website.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: `QR - ${storeName}`, url, files: [file] });
          return;
        }
      } catch {}
    }
    // fallback: copy link
    handleCopyLink();
  }

  return (
    <div className="sw-qr-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sw-qr-modal">
        {/* Header */}
        <div className="sw-qr-modal__header">
          <div>
            <span className="sw-qr-modal__title">Mã QR Website</span>
            <div className="sw-qr-modal__sub">Khách quét mã → chuyển đến cửa hàng trực tuyến</div>
          </div>
          <button type="button" className="sw-qr-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* QR */}
        <div className="sw-qr-canvas">
          <QRCodeCanvas
            ref={handleRef as any}
            value={url}
            size={220}
            level="M"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#1a2e3b"
          />
        </div>

        {/* URL label */}
        <div className="sw-qr-url">
          <span className="sw-qr-url__icon">🔗</span>
          <span className="sw-qr-url__text">{url}</span>
        </div>

        {/* Store name */}
        <div className="sw-qr-store">{storeName}</div>

        {/* Hint */}
        <p className="sw-qr-hint">
          Quét bằng camera điện thoại hoặc ứng dụng QR để truy cập website
        </p>

        {/* Actions */}
        <div className="sw-qr-actions">
          <button type="button" className="sw-qr-btn sw-qr-btn--outline" onClick={handleCopyLink}>
            📋 Sao chép link
          </button>
          <button type="button" className="sw-qr-btn sw-qr-btn--outline" onClick={handleNativeShare}>
            📤 Chia sẻ
          </button>
          <button type="button" className="sw-qr-btn sw-qr-btn--primary" onClick={handleDownload}>
            ⬇️ Tải ảnh QR
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SalesWebsite() {
  document.title = "Website bán hàng";

  const [dataInfo, setDataInfo] = useState({
    domain: "storefront.reborn.vn",
    storeName: "Minh Hoa",
    des: "Thực phẩm tươi ngon mỗi ngày tại nhà bạn. Giao hàng nhanh trong 2 giờ · Cam kết tươi ngon · 500+ sản phẩm",
    shipping_fee: "30.000₫",
    freeship_form: "500.000₫",
  });

  const [showQR, setShowQR] = useState(false);

  const [infoDisplay, setInfoDisplay] = useState([
    { lable: "Hiển thị số lượng bán",  des: "Hiện \"Đã bán X\" trên trang sản phẩm",  active: 1 },
    { lable: "Ẩn sản phẩm hết hàng",   des: "Tự động ẩn khi tồn kho = 0",             active: 1 },
    { lable: "Hiển thị giá sỉ",         des: "Hiện mức giá sỉ cho khách đăng ký",      active: 1 },
    { lable: "Danh mục nổi bật",        des: "Hiện section danh mục ở trang chủ",       active: 1 },
    { lable: "Video cửa hàng",          des: "Phát video giới thiệu ở trang chủ",       active: 0 },
  ]);

  return (
    <div className="sales-website-page">
      {/* Header */}
      <div className="conatiner-header">
        <div>
          <span style={{ fontSize: 24, fontWeight: "700", color: "var(--text-primary-color)" }}>
            Website bán hàng
          </span>
          <div>
            <span style={{ fontSize: 16, fontWeight: "500", color: "#939394", fontFamily: "none" }}>
              Cửa hàng trực tuyến của bạn
            </span>
          </div>
        </div>

        <div className="conatiner-button">
          {/* Nút QR mới */}
          <div
            className="button-export sw-btn-qr"
            onClick={() => setShowQR(true)}
            style={{ cursor: "pointer" }}
            title="Tạo mã QR trỏ đến website"
          >
            <span className="sw-btn-qr__icon">⬛</span>
            <span style={{ fontSize: 14, fontWeight: "500" }}>Mã QR Website</span>
          </div>

          <div
            className="button-export"
            onClick={() => {
              const url = dataInfo.domain.startsWith("http")
                ? dataInfo.domain
                : `https://${dataInfo.domain}`;
              window.open(url, "_blank");
            }}
            style={{ cursor: "pointer" }}
          >
            <span style={{ fontSize: 14, fontWeight: "500" }}>Xem Website</span>
          </div>

          <div className="button-connect">
            <span style={{ fontSize: 14, fontWeight: "500" }}>Lưu cài đặt</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
        {/* Left: info form */}
        <div className="info-web">
          <span style={{ fontSize: 14, fontWeight: "700" }}>Tên miền & Cửa hàng</span>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="input-group" style={{ width: "49%" }}>
              <Input
                label="Tên miền chính"
                name=""
                fill={true}
                required={false}
                value={dataInfo?.domain}
                placeholder=""
                onChange={(e) => setDataInfo({ ...dataInfo, domain: e.target.value })}
              />
            </div>
            <div className="input-group" style={{ width: "49%" }}>
              <Input
                label="Tên cửa hàng"
                name=""
                fill={true}
                required={false}
                value={dataInfo?.storeName}
                placeholder=""
                onChange={(e) => setDataInfo({ ...dataInfo, storeName: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <TextArea
              label="Mô tả cửa hàng"
              name="note"
              value={dataInfo?.des}
              fill={true}
              onChange={(e) => setDataInfo({ ...dataInfo, des: e.target.value })}
              placeholder="Nhập mô tả"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="input-group" style={{ width: "49%" }}>
              <Input
                label="Phí vận chuyển mặc định"
                name=""
                fill={true}
                required={false}
                value={dataInfo?.shipping_fee}
                placeholder=""
                onChange={(e) => setDataInfo({ ...dataInfo, shipping_fee: e.target.value })}
              />
            </div>
            <div className="input-group" style={{ width: "49%" }}>
              <Input
                label="Đơn miễn phí ship từ"
                name=""
                fill={true}
                required={false}
                value={dataInfo?.freeship_form}
                placeholder=""
                onChange={(e) => setDataInfo({ ...dataInfo, freeship_form: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Right: status */}
        <div className="status-web">
          <span style={{ fontSize: 14, fontWeight: "700" }}>Trạng thái website</span>

          <div className="box-status">
            <div className="dot-active" />
            <div>
              <span style={{ fontSize: 14, fontWeight: "600", color: "green" }}>
                Website đang hoạt động
              </span>
              <div>
                <span style={{ fontSize: 12, fontWeight: "600" }}>
                  {dataInfo.domain} · Uptime 99.9%
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: "1rem 0", display: "flex", justifyContent: "space-between", borderBottom: "0.5px solid" }}>
            <span style={{ fontSize: 14, fontWeight: "400" }}>Lượt truy cập hôm nay</span>
            <span style={{ fontSize: 14, fontWeight: "500" }}>1.234</span>
          </div>
          <div style={{ padding: "1rem 0", display: "flex", justifyContent: "space-between", borderBottom: "0.5px solid" }}>
            <span style={{ fontSize: 14, fontWeight: "400" }}>Tỷ lệ chuyển đổi</span>
            <span style={{ fontSize: 14, fontWeight: "500", color: "green" }}>2.8%</span>
          </div>
          <div style={{ padding: "1rem 0", display: "flex", justifyContent: "space-between", borderBottom: "0.5px solid" }}>
            <span style={{ fontSize: 14, fontWeight: "400" }}>Hết hạn SSL</span>
            <span style={{ fontSize: 14, fontWeight: "500" }}>28/02/2027</span>
          </div>
          <div style={{ padding: "1rem 0", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: "400" }}>Tên miền hết hạn</span>
            <span style={{ fontSize: 14, fontWeight: "500" }}>15/06/2026</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", alignItems: "flex-start" }}>
        {/* Left: display settings */}
        <div className="info-display">
          <span style={{ fontSize: 14, fontWeight: "700" }}>Giao diện & Trình bày</span>
          <div>
            {infoDisplay.map((item, index) => (
              <div key={index} className="item-display">
                <div>
                  <span style={{ fontSize: 14, fontWeight: "600" }}>{item.lable}</span>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: "400", color: "#939394" }}>{item.des}</span>
                  </div>
                </div>
                <ButtonOnOff
                  checked={item.active === 1}
                  onChange={(value) =>
                    setInfoDisplay((cur) =>
                      cur.map((obj, idx) => idx === index ? { ...obj, active: value ? 1 : 0 } : obj)
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: business card */}
        <div className="card-store">
          <span style={{ fontSize: 14, fontWeight: "700" }}>Danh thiếp cửa hàng</span>
          <div className="card">
            <div><span style={{ fontSize: 20, fontWeight: "600", color: "white" }}>{dataInfo.storeName}</span></div>
            <div><span style={{ fontSize: 14, fontWeight: "500", color: "white" }}>{dataInfo.domain}</span></div>
            <div><span style={{ fontSize: 14, fontWeight: "500", color: "white" }}>123 Nguyễn Trãi, Q.1, TP.HCM</span></div>
            <div><span style={{ fontSize: 14, fontWeight: "500", color: "white" }}>0901 234 567</span></div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <QRWebsiteModal
          domain={dataInfo.domain}
          storeName={dataInfo.storeName}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}