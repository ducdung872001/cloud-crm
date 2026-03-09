import React, { useState, useMemo } from "react";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { handleChangeValidate } from "utils/validate";
import "./ViettelSettings.scss";

interface Props {
  onNavigate?: (tab: "overview" | "wizard" | "settings" | "analytics") => void;
}

export default function ViettelSettings({ onNavigate }: Props) {
  const [menu, setMenu] = useState<
    "general" | "sync" | "invoice" | "notif" | "tendoo" | "host" | "bhd" | "cloud"
  >("general");

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    sync_stock: true,
    sync_product: true,
    sync_price: true,
    sync_order: true,
    sync_image: false,
    invoice_auto: true,
    invoice_email: true,
    invoice_sms: false,
    notif_sync_fail: true,
    notif_token: true,
    notif_report: false,
    notif_invoice: true,
    tendoo_hide_price: true,
    tendoo_show_stock: false,
  });

  const tog = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const values = useMemo(
    () => ({
      syncFrequency: "15m",
      syncErrorAction: "retry3",
      invoiceTemplate: "m2",
      invoiceThreshold: "200000",
      tendooApiKey: "tmall_live_sk_••••••2f8a",
      tendooShopId: "SHOP-MH-00291",
      tendooCategory: "all",
      tendooDiscount: "5",
      hostDomain: "minhhoa-shop.tendoo.vn",
      hostPackage: "business50",
      bhdTaxCode: "0123456789",
      bhdToken: "",
    }),
    []
  );

  const validations: IValidation[] = [];

  const [formData, setFormData] = useState<IFormData>({ values: values, errors: {} });

  const listFieldSync = useMemo<IFieldCustomize[]>(
    () => [
      {
        label: "Tần suất đồng bộ",
        name: "syncFrequency",
        type: "select",
        fill: true,
        options: [
          { value: "5m", label: "Mỗi 5 phút" },
          { value: "15m", label: "Mỗi 15 phút (Khuyến nghị)" },
          { value: "30m", label: "Mỗi 30 phút" },
          { value: "1h", label: "Mỗi 1 giờ" },
        ],
      },
      {
        label: "Xử lý khi lỗi đồng bộ",
        name: "syncErrorAction",
        type: "select",
        fill: true,
        options: [
          { value: "retry3", label: "Thử lại 3 lần rồi gửi cảnh báo" },
          { value: "retry1", label: "Thử lại 1 lần rồi bỏ qua" },
          { value: "notify", label: "Gửi cảnh báo ngay lập tức" },
        ],
      },
    ],
    []
  );

  const listFieldInvoice = useMemo<IFieldCustomize[]>(
    () => [
      {
        label: "Mẫu hóa đơn",
        name: "invoiceTemplate",
        type: "select",
        fill: true,
        options: [
          { value: "m1", label: "Mẫu 1 - Cơ bản" },
          { value: "m2", label: "Mẫu 2 - Có Logo cửa hàng" },
          { value: "m3", label: "Mẫu 3 - Chuyên nghiệp" },
        ],
      },
      {
        label: "Ngưỡng phát HĐ tự động (đ)",
        name: "invoiceThreshold",
        type: "text",
        fill: true,
      },
    ],
    []
  );

  const listFieldTendoo1 = useMemo<IFieldCustomize[]>(
    () => [
      { label: "API Key", name: "tendooApiKey", type: "text", fill: true },
      { label: "Shop ID", name: "tendooShopId", type: "text", fill: true },
    ],
    []
  );

  const listFieldTendoo2 = useMemo<IFieldCustomize[]>(
    () => [
      {
        label: "Danh mục hiển thị",
        name: "tendooCategory",
        type: "select",
        fill: true,
        options: [
          { value: "all", label: "Tất cả danh mục" },
          { value: "top", label: "Danh mục nổi bật" },
          { value: "custom", label: "Tùy chỉnh" },
        ],
      },
      { label: "Chiết khấu sàn (%)", name: "tendooDiscount", type: "text", fill: true },
    ],
    []
  );

  const listFieldHost = useMemo<IFieldCustomize[]>(
    () => [
      { label: "Tên miền", name: "hostDomain", type: "text", fill: true },
      {
        label: "Gói hosting",
        name: "hostPackage",
        type: "select",
        fill: true,
        options: [
          { value: "starter", label: "Starter 10GB" },
          { value: "business50", label: "Business 50GB" },
          { value: "pro", label: "Pro 200GB" },
        ],
      },
    ],
    []
  );

  const listFieldBhd = useMemo<IFieldCustomize[]>(
    () => [
      { label: "MST", name: "bhdTaxCode", type: "text", fill: true },
      { label: "Token BHD Mới", name: "bhdToken", type: "text", fill: true, placeholder: "Dán token từ cổng BHD Hub..." },
    ],
    []
  );

  const renderRightContent = () => {
    switch (menu) {
      case "general":
        return (
          <div className="setting-card">
            <div className="sc-hdr">Trạng thái kết nối các dịch vụ</div>
            <div className="sc-desc">
              Quản lý và kiểm tra trạng thái kết nối tất cả hệ thống Viettel
            </div>
            <div className="svc-connection-card ok">
              <div className="svc-logo tendoo-bg">🛍️</div>
              <div className="scc-info">
                <div className="scc-name">Tendoo Mall</div>
                <div className="scc-detail">API Key hết hạn: 15/01/2024 · Shop ID: SHOP-MH-00291</div>
              </div>
              <div className="scc-actions">
                <span className="badge bd-green">Đang kết nối</span>
                <button className="scc-btn">Test</button>
              </div>
            </div>
            <div className="svc-connection-card ok">
              <div className="svc-logo host-bg">🖥️</div>
              <div className="scc-info">
                <div className="scc-name">Tendoo Host</div>
                <div className="scc-detail">Username: minhhoa_shop · SSL còn hiệu lực 89 ngày</div>
              </div>
              <div className="scc-actions">
                <span className="badge bd-green">Đang kết nối</span>
                <button className="scc-btn">Test</button>
              </div>
            </div>
            <div className="svc-connection-card warn">
              <div className="svc-logo bhd-bg">🧾</div>
              <div className="scc-info">
                <div className="scc-name">BHD Hub</div>
                <div className="scc-detail warn-text">Token hết hạn 25/10/2023 — cần cập nhật ngay</div>
              </div>
              <div className="scc-actions">
                <span className="badge bd-amber">Cảnh báo</span>
                <button className="scc-btn primary" onClick={() => setMenu("bhd")}>Cập nhật</button>
              </div>
            </div>
            <div className="svc-connection-card">
              <div className="svc-logo cloud-bg" style={{ opacity: 0.5 }}>☁️</div>
              <div className="scc-info">
                <div className="scc-name muted">Viettel Cloud</div>
                <div className="scc-detail">Chưa kết nối — nhấn để thiết lập</div>
              </div>
              <div className="scc-actions">
                <span className="badge bd-gray">Chưa kết nối</span>
                <button className="scc-btn primary" onClick={() => setMenu("cloud")}>Kết nối</button>
              </div>
            </div>
          </div>
        );
      case "sync":
        return (
          <div className="setting-card">
            <div className="sc-hdr">Quy tắc đồng bộ dữ liệu</div>
            <div className="sc-desc">
              Cấu hình tần suất và loại dữ liệu cần đồng bộ giữa RetailPro và Tendoo Mall
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Đồng bộ tồn kho realtime</div>
                <div className="tr-sub">Cập nhật số lượng tồn kho lên Tendoo Mall ngay khi có bán hàng tại quầy</div>
              </div>
              <div className={`toggle${toggles.sync_stock ? " on" : ""}`} onClick={() => tog("sync_stock")} />
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Tự động đẩy sản phẩm mới</div>
                <div className="tr-sub">Sản phẩm mới thêm vào RetailPro sẽ tự động xuất hiện trên Tendoo Mall</div>
              </div>
              <div className={`toggle${toggles.sync_product ? " on" : ""}`} onClick={() => tog("sync_product")} />
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Đồng bộ giá bán tự động</div>
                <div className="tr-sub">Khi thay đổi giá trong RetailPro, giá trên Tendoo Mall cập nhật theo</div>
              </div>
              <div className={`toggle${toggles.sync_price ? " on" : ""}`} onClick={() => tog("sync_price")} />
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Nhận đơn hàng từ Tendoo Mall</div>
                <div className="tr-sub">Đơn hàng Tendoo Mall tự động tạo trong hệ thống RetailPro để xử lý</div>
              </div>
              <div className={`toggle${toggles.sync_order ? " on" : ""}`} onClick={() => tog("sync_order")} />
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Đồng bộ hình ảnh sản phẩm</div>
                <div className="tr-sub">Hình ảnh và mô tả sản phẩm đặc động bộ lên Tendoo Mall và Tendoo Host</div>
              </div>
              <div className={`toggle${toggles.sync_image ? " on" : ""}`} onClick={() => tog("sync_image")} />
            </div>
            <div className="setting-2col">
              {listFieldSync.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldSync, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
          </div>
        );
      case "invoice":
        return (
          <div className="setting-card">
            <div className="sc-hdr">Cấu hình hóa đơn điện tử tự động (BHD Hub)</div>
            <div className="sc-desc">
              Thiết lập quy tắc phát hành hóa đơn điện tử tự động sau mỗi đơn hàng hoàn tất
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Tự động phát hành HĐ điện tử</div>
                <div className="tr-sub">Phát hành hóa đơn ngay khi đơn hàng được xác nhận thanh toán</div>
              </div>
              <div className={`toggle${toggles.invoice_auto ? " on" : ""}`} onClick={() => tog("invoice_auto")} />
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Gửi HĐ qua email cho khách</div>
                <div className="tr-sub">Email hóa đơn PDF được gửi tự động đến địa chỉ email của khách hàng</div>
              </div>
              <div className={`toggle${toggles.invoice_email ? " on" : ""}`} onClick={() => tog("invoice_email")} />
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Gửi HĐ qua SMS/Zalo</div>
                <div className="tr-sub">Link hóa đơn điện tử gửi qua SMS hoặc Zalo cho khách hàng</div>
              </div>
              <div className={`toggle${toggles.invoice_sms ? " on" : ""}`} onClick={() => tog("invoice_sms")} />
            </div>
            <div className="setting-2col">
              {listFieldInvoice.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldInvoice, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
          </div>
        );
      case "notif":
        return (
          <div className="setting-card">
            <div className="sc-hdr">Thông báo & cảnh báo</div>
            <div className="sc-desc">
              Cấu hình khi nào RetailPro gửi cảnh báo về trạng thái tích hợp
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Cảnh báo khi đồng bộ thất bại</div>
                <div className="tr-sub">
                  Nhận thông báo push khi có lỗi đồng bộ dữ liệu với Tendoo Mall
                </div>
              </div>
              <div className={`toggle${toggles.notif_sync_fail ? " on" : ""}`} onClick={() => tog("notif_sync_fail")} />
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Nhắc nhở token sắp hết hạn</div>
                <div className="tr-sub">
                  Gửi cảnh báo trước 7 ngày khi API Key hoặc Token chuẩn bị hết hạn
                </div>
              </div>
              <div className={`toggle${toggles.notif_token ? " on" : ""}`} onClick={() => tog("notif_token")} />
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Báo cáo đồng bộ hàng ngày</div>
                <div className="tr-sub">
                  Nhận báo cáo tóm tắt lúc 8:00 sáng về hoạt động tích hợp hôm qua
                </div>
              </div>
              <div className={`toggle${toggles.notif_report ? " on" : ""}`} onClick={() => tog("notif_report")} />
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Cảnh báo HĐ chờ phát hành</div>
                <div className="tr-sub">
                  Nhắc nhở khi có hóa đơn BHD Hub chờ phát hành quá 24 giờ
                </div>
              </div>
              <div className={`toggle${toggles.notif_invoice ? " on" : ""}`} onClick={() => tog("notif_invoice")} />
            </div>
          </div>
        );
      case "tendoo":
        return (
          <div className="setting-card">
            <div className="sc-hdr">Cấu hình Tendoo Mall</div>
            <div className="sc-desc">
              Quản lý kết nối và thiết lập hiển thị sản phẩm trên sàn B2B Viettel
            </div>
            <div className="setting-2col" style={{ marginTop: 0, paddingTop: 0, borderTop: "none", marginBottom: "1.2rem" }}>
              {listFieldTendoo1.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldTendoo1, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
            <div className="setting-2col" style={{ marginTop: 0, paddingTop: 0, borderTop: "none", marginBottom: "1.4rem" }}>
              {listFieldTendoo2.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldTendoo2, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Ẩn giá bán lẻ trên sàn B2B</div>
                <div className="tr-sub">Chỉ hiển thị giá buôn cho đối tác Tendoo Mall</div>
              </div>
              <div className={`toggle${toggles.tendoo_hide_price ? " on" : ""}`} onClick={() => tog("tendoo_hide_price")} />
            </div>
            <div className="toggle-row">
              <div className="tr-info">
                <div className="tr-label">Hiển thị tồn kho thực</div>
                <div className="tr-sub">Đối tác nhìn thấy số lượng tồn kho chính xác</div>
              </div>
              <div className={`toggle${toggles.tendoo_show_stock ? " on" : ""}`} onClick={() => tog("tendoo_show_stock")} />
            </div>
          </div>
        );
      case "host":
        return (
          <div className="setting-card">
            <div className="sc-hdr">Cấu hình Tendoo Host</div>
            <div className="sc-desc">Quản lý hosting website bán hàng trên hạ tầng Viettel</div>
            <div className="setting-2col" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
              {listFieldHost.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldHost, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
          </div>
        );
      case "bhd":
        return (
          <div className="setting-card">
            <div className="sc-hdr">Cấu hình BHD Hub</div>
            <div className="sc-desc">Hóa đơn điện tử theo chuẩn Tổng cục Thuế Việt Nam</div>
            <div className="sc-warning-banner">
              Token hết hạn 25/10/2023. Hãy vào cổng BHD Hub lấy token mới và dán vào đây.
            </div>
            <div className="setting-2col" style={{ marginTop: "1.2rem", paddingTop: 0, borderTop: "none" }}>
              {listFieldBhd.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBhd, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
          </div>
        );
      case "cloud":
        return (
          <div className="setting-card">
            <div className="sc-hdr">Kết nối Viettel Cloud</div>
            <div className="sc-desc">Chưa kết nối — nhấn để bắt đầu thiết lập backup tự động</div>
            <div className="sc-empty-state">
              <div className="sc-empty-icon">☁️</div>
              <div className="sc-empty-title">Chưa kết nối Viettel Cloud</div>
              <div className="sc-empty-sub">Bảo vệ toàn bộ dữ liệu của hàng với backup tự động mỗi ngày</div>
              <button className="sc-empty-btn" onClick={() => onNavigate?.("wizard")}>+ Thiết lập ngay</button>
            </div>
          </div>
        );
      default:
        return null;

    }
  };

  return (
    <div className="viettel-settings-layout">
      <div className="settings-nav">
        <div className="sn-title">Cấu hình chung</div>
        <div
          className={`sn-item ${menu === "general" ? "active" : ""}`}
          onClick={() => setMenu("general")}
        >
          Tổng quan kết nối
        </div>
        <div
          className={`sn-item ${menu === "sync" ? "active" : ""}`}
          onClick={() => setMenu("sync")}
        >
          Quy tắc đồng bộ
        </div>
        <div
          className={`sn-item ${menu === "invoice" ? "active" : ""}`}
          onClick={() => setMenu("invoice")}
        >
          Hóa đơn tự động
        </div>
        <div
          className={`sn-item ${menu === "notif" ? "active" : ""}`}
          onClick={() => setMenu("notif")}
        >
          Thông báo & cảnh báo
        </div>

        <div className="sn-title" style={{ marginTop: "1rem" }}>
          Dịch vụ Viettel
        </div>
        <div
          className={`sn-item ${menu === "tendoo" ? "active" : ""}`}
          onClick={() => setMenu("tendoo")}
        >
          Tendoo Mall
        </div>
        <div
          className={`sn-item ${menu === "host" ? "active" : ""}`}
          onClick={() => setMenu("host")}
        >
          Tendoo Host
        </div>
        <div
          className={`sn-item ${menu === "bhd" ? "active" : ""}`}
          onClick={() => setMenu("bhd")}
        >
          BHD Hub
        </div>
        <div
          className={`sn-item ${menu === "cloud" ? "active" : ""}`}
          onClick={() => setMenu("cloud")}
        >
          Viettel Cloud
        </div>
      </div>

      <div className="settings-body">{renderRightContent()}</div>
    </div>
  );
}
