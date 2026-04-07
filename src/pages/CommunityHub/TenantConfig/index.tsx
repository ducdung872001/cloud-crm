// [CH] Community Hub - Cấu hình toàn cục (Tenant Config)
import React, { useState, useEffect } from "react";
import TenantConfigService, { ITenantConfig } from "@/services/TenantConfigService";
import { showToast } from "utils/common";
import Icon from "@/components/icon";
import "./index.scss";

interface ConfigItem {
  key: keyof ITenantConfig;
  label: string;
  description: string;
  type: "toggle" | "select";
  options?: { value: string; label: string }[];
  group: string;
  dependsOn?: keyof ITenantConfig; // chỉ hiện khi config này = true
}

const CONFIG_ITEMS: ConfigItem[] = [
  // ── Phân hệ Kho ──
  {
    key: "warehouse_enabled", group: "Kho & Nguyên vật liệu", type: "toggle",
    label: "Sử dụng phân hệ Kho",
    description: "Bật để quản lý nhập/xuất kho, tồn kho, nguyên vật liệu. Tắt nếu chỉ cần bán hàng đơn giản không theo dõi kho.",
  },
  {
    key: "warehouse_auto_deduct", group: "Kho & Nguyên vật liệu", type: "toggle",
    label: "Tự động trừ kho khi bán hàng",
    description: "Khi bán sản phẩm tại POS, tự động trừ tồn kho tương ứng. Nếu tắt, cần xuất kho thủ công.",
    dependsOn: "warehouse_enabled",
  },

  // ── Hóa đơn điện tử ──
  {
    key: "einvoice_enabled", group: "Hóa đơn điện tử", type: "toggle",
    label: "Sử dụng hóa đơn điện tử",
    description: "Bật để kích hoạt chức năng xuất hóa đơn điện tử (HĐĐT) cho đơn hàng.",
  },
  {
    key: "einvoice_auto_issue", group: "Hóa đơn điện tử", type: "toggle",
    label: "Tự động xuất HĐĐT sau khi bán",
    description: "Sau khi hoàn thành đơn hàng tại POS, hệ thống tự động gửi yêu cầu xuất HĐĐT. Nếu tắt, nhân viên xuất thủ công từ trang Giao dịch → Hóa đơn VAT.",
    dependsOn: "einvoice_enabled",
  },
  {
    key: "einvoice_provider", group: "Hóa đơn điện tử", type: "select",
    label: "Nhà cung cấp HĐĐT",
    description: "Chọn đơn vị phát hành hóa đơn điện tử đã ký hợp đồng.",
    dependsOn: "einvoice_enabled",
    options: [
      { value: "", label: "-- Chưa chọn --" },
      { value: "viettel", label: "Viettel S-Invoice" },
      { value: "vnpt", label: "VNPT Invoice" },
      { value: "bkav", label: "BKAV eHoadon" },
      { value: "fpt", label: "FPT eInvoice" },
      { value: "misa", label: "MISA meInvoice" },
    ],
  },

  // ── Thành viên & Loyalty ──
  {
    key: "membership_enabled", group: "Thành viên", type: "toggle",
    label: "Quản lý thẻ/gói thành viên",
    description: "Bật để bán thẻ thành viên tại POS, quản lý quota dịch vụ, gia hạn gói.",
  },
  {
    key: "loyalty_enabled", group: "Thành viên", type: "toggle",
    label: "Tích điểm hội viên (Loyalty)",
    description: "Bật chương trình tích điểm, đổi thưởng, hạng thành viên.",
  },

  // ── Vận hành ──
  {
    key: "multi_branch", group: "Vận hành", type: "toggle",
    label: "Quản lý đa chi nhánh",
    description: "Bật nếu có nhiều cơ sở/chi nhánh. Mỗi chi nhánh có kho, ca làm việc, nhân viên riêng.",
  },
  {
    key: "shift_management", group: "Vận hành", type: "toggle",
    label: "Quản lý ca làm việc",
    description: "Bật để phân ca, mở/đóng ca, kiểm kê cuối ca tại POS.",
  },
  {
    key: "accommodation_enabled", group: "Vận hành", type: "toggle",
    label: "Phân hệ Lưu trú",
    description: "Bật để quản lý phòng/giường KTX, check-in/check-out lưu trú.",
  },
];

export default function TenantConfig() {
  document.title = "Cấu hình toàn cục";
  const [config, setConfig] = useState<ITenantConfig>(TenantConfigService.get());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: keyof ITenantConfig) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleSelect = (key: keyof ITenantConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await TenantConfigService.save(config);
    if (res.code === 0) {
      showToast("Đã lưu cấu hình thành công. Một số thay đổi cần reload trang để có hiệu lực.", "success");
      setHasChanges(false);
    }
    setIsSaving(false);
  };

  const handleReset = () => {
    TenantConfigService.reset();
    setConfig(TenantConfigService.get());
    setHasChanges(true);
    showToast("Đã khôi phục cấu hình mặc định", "info");
  };

  // Group items
  const groups = CONFIG_ITEMS.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, ConfigItem[]>);

  return (
    <div className="ch-tenant-config">
      <div className="ch-tenant-config__header">
        <div>
          <h2>Cấu hình toàn cục</h2>
          <p className="subtitle">Cấu hình chung cho toàn bộ tổ chức. Thay đổi ảnh hưởng tất cả chi nhánh và người dùng.</p>
        </div>
        <div className="header-actions">
          <button className="btn-reset" onClick={handleReset}>Khôi phục mặc định</button>
          <button className="btn-save" onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </div>
      </div>

      {Object.entries(groups).map(([groupName, items]) => (
        <div key={groupName} className="config-group">
          <h3 className="config-group__title">{groupName}</h3>
          <div className="config-group__items">
            {items.map((item) => {
              // Ẩn nếu phụ thuộc config khác đang tắt
              if (item.dependsOn && !config[item.dependsOn]) return null;

              return (
                <div key={item.key} className="config-item">
                  <div className="config-item__info">
                    <div className="config-item__label">{item.label}</div>
                    <div className="config-item__desc">{item.description}</div>
                  </div>
                  <div className="config-item__control">
                    {item.type === "toggle" && (
                      <button
                        className={`toggle-switch ${config[item.key] ? "on" : "off"}`}
                        onClick={() => handleToggle(item.key)}
                      >
                        <span className="toggle-switch__thumb" />
                        <span className="toggle-switch__label">{config[item.key] ? "Bật" : "Tắt"}</span>
                      </button>
                    )}
                    {item.type === "select" && item.options && (
                      <select
                        value={config[item.key] as string}
                        onChange={(e) => handleSelect(item.key, e.target.value)}
                      >
                        {item.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
