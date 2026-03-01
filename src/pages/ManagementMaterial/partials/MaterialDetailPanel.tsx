import React, { useState } from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import "./MaterialDetailPanel.scss";
import { IMaterialResponse } from "@/model/material/MaterialResponseModel";

const GROUP_LABELS: Record<number, string> = {
  1: "Nguyên liệu khô",
  2: "Nguyên liệu tươi",
  3: "Nguyên liệu lỏng",
  4: "Hoá chất & Phụ gia",
};

const ICON_BG: Record<number, string> = {
  1: "#fef3c7",
  2: "#fce7f3",
  3: "#e0f2fe",
  4: "#ede9fe",
};

// Mock: tính tồn/trạng thái từ id để demo (khi có API thật sẽ thay bằng response)
function getMockStock(m: IMaterialResponse) {
  const threshold = m.minQuantity ?? 20;
  const current = ((m.id ?? 0) * 37 + 50) % 200;
  const pct = threshold > 0 ? Math.min(100, (current / threshold) * 100) : 100;
  const status = current <= 0 ? "out" : current <= threshold ? "low" : pct < 50 ? "warn" : "ok";
  return { current, threshold, pct, status };
}

// Mock lịch sử nhập
function getMockLogs(_m: IMaterialResponse) {
  return [
    { title: "Nhập tồn lô 05", date: "20/10/2023 · 09:15 · Kho A", qty: "+50", amount: "900,000 ₫", type: "in" },
    { title: "Nhập tồn lô 04", date: "08/10/2023 · 14:00 · Kho A", qty: "+75", amount: "1,350,000 ₫", type: "in" },
    { title: "Xuất dùng cho sản xuất", date: "15/10/2023 · 10:30 · Kho A", qty: "-30", amount: "–", type: "out" },
    { title: "Nhập tồn ban đầu", date: "01/09/2023 · 08:00 · Kho A", qty: "+100", amount: "1,700,000 ₫", type: "in" },
  ];
}

interface MaterialDetailPanelProps {
  material: IMaterialResponse;
  onClose: () => void;
  onStockIn: () => void;
  onEdit: () => void;
}

export default function MaterialDetailPanel({ material, onClose, onStockIn, onEdit }: MaterialDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"info" | "log">("info");
  const stock = getMockStock(material);
  const logs = getMockLogs(material);
  const categoryId = (material as IMaterialResponse & { categoryId?: number }).categoryId;
  const groupLabel = GROUP_LABELS[categoryId as number] ?? "Nguyên liệu";
  const iconBg = ICON_BG[categoryId as number] ?? "#f1f5f9";
  const unit = material.unitName ?? "kg";

  const stockClass =
    stock.status === "ok" ? "sn-ok" : stock.status === "warn" ? "sn-warn" : "sn-low";
  const stockColor =
    stock.status === "ok"
      ? "var(--success-color)"
      : stock.status === "warn"
        ? "var(--warning-color)"
        : "var(--error-color)";

  return (
    <div className="material-detail-panel">
      <div className="material-detail-panel__header">
        <div className="material-detail-panel__grad" style={{ background: `linear-gradient(135deg, #0f172a 0%, #0d9488 100%)` }}>
          <button type="button" className="material-detail-panel__close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
          <div className="material-detail-panel__name">{material.name}</div>
          <div className="material-detail-panel__code">
            {material.code ?? "—"} 
          </div>
        </div>
      </div>
      <div className="material-detail-panel__qs">
        <div className="material-detail-panel__qs-i">
          <div className={`material-detail-panel__qs-v ${stockClass}`} style={{ color: stockColor }}>
            {stock.current} {unit}
          </div>
          <div className="material-detail-panel__qs-l">Tồn kho</div>
        </div>
        <div className="material-detail-panel__qs-i">
          <div className="material-detail-panel__qs-v">{material.price != null ? `${Number(material.price).toLocaleString("vi")} ₫` : "—"}</div>
          <div className="material-detail-panel__qs-l">Giá nhập</div>
        </div>
        <div className="material-detail-panel__qs-i">
          <div className="material-detail-panel__qs-v" style={{ color: "var(--primary-color)" }}>
            8 lần
          </div>
          <div className="material-detail-panel__qs-l">Tổng nhập</div>
        </div>
      </div>
      <div className="material-detail-panel__tabs">
        <button
          type="button"
          className={`material-detail-panel__tab ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          Thông tin
        </button>
        <button
          type="button"
          className={`material-detail-panel__tab ${activeTab === "log" ? "active" : ""}`}
          onClick={() => setActiveTab("log")}
        >
          Lịch sử nhập
        </button>
      </div>
      <div className="material-detail-panel__body">
        {activeTab === "info" && (
          <>
            <div className="material-detail-panel__sec-h">Thông tin cơ bản</div>
            <div className="material-detail-panel__row">
              <span className="k">Tên NVL</span>
              <span className="v">{material.name}</span>
            </div>
            <div className="material-detail-panel__row">
              <span className="k">Mã NVL</span>
              <span className="v" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                {material.code ?? "—"}
              </span>
            </div>
            <div className="material-detail-panel__row">
              <span className="k">Nhóm</span>
              <span className="v">{groupLabel}</span>
            </div>
            <div className="material-detail-panel__row">
              <span className="k">Đơn vị tính</span>
              <span className="v">{unit}</span>
            </div>
            <div className="material-detail-panel__row">
              <span className="k">Quy chuẩn đóng gói</span>
              <span className="v">1 bao = 25 {unit}</span>
            </div>
            <div className="material-detail-panel__sec-h">Tồn kho & Cảnh báo</div>
            <div className="material-detail-panel__row">
              <span className="k">Tồn hiện tại</span>
              <span className="v" style={{ color: stockColor }}>
                {stock.current} {unit}
              </span>
            </div>
            <div className="material-detail-panel__row">
              <span className="k">Ngưỡng cảnh báo</span>
              <span className="v">{stock.threshold} {unit}</span>
            </div>
            <div className="material-detail-panel__row">
              <span className="k">Kho lưu trữ</span>
              <span className="v">Kho A - Tầng 1</span>
            </div>
            <div className="material-detail-panel__sec-h">Nhà cung cấp</div>
            <div className="material-detail-panel__row">
              <span className="k">NCC thường xuyên</span>
              <span className="v">Nhà thuốc An Khang</span>
            </div>
            <div className="material-detail-panel__row">
              <span className="k">Giá nhập gần nhất</span>
              <span className="v">
                {material.price != null ? `${Number(material.price).toLocaleString("vi")} ₫/${unit}` : "—"}
              </span>
            </div>
            <div className="material-detail-panel__sec-h">Mô tả</div>
            <div className="material-detail-panel__desc">
            Kem trị mụn là các sản phẩm chăm sóc da dạng bôi (kem, gel, lotion) được thiết kế đặc biệt để điều trị các vấn đề về mụn, bao gồm mụn trứng cá, mụn viêm, mụn mủ, mụn ẩn và mụn đầu đen/trắng. Chúng hoạt động dựa trên các hoạt chất mạnh, thấm sâu vào lỗ chân lông để loại bỏ vi khuẩn, giảm viêm và kiểm soát dầu thừa.
            </div>
            <div className="material-detail-panel__actions">
              <Button type="button" color="primary" className="material-detail-panel__btn-full" onClick={onStockIn}>
                <Icon name="Download" /> Nhập tồn
              </Button>
              <Button type="button" variant="outline" onClick={onEdit}>
                <Icon name="Pencil" /> Sửa
              </Button>
            </div>
          </>
        )}
        {activeTab === "log" && (
          <>
            <div className="material-detail-panel__sec-h">Lịch sử nhập tồn</div>
            {logs.map((log, idx) => (
              <div key={idx} className="material-detail-panel__log">
                <div
                  className="material-detail-panel__log-icon"
                  style={{
                    background: log.type === "in" ? "var(--success-color-light, #dcfce7)" : "var(--error-color-light, #fee2e2)",
                  }}
                >
                  {log.type === "in" ? <Icon name="Download" /> : <Icon name="Upload" />}
                </div>
                <div className="material-detail-panel__log-info">
                  <div className="material-detail-panel__log-title">{log.title}</div>
                  <div className="material-detail-panel__log-date">{log.date}</div>
                </div>
                <div className="material-detail-panel__log-qty-wrap">
                  <div
                    className="material-detail-panel__log-qty"
                    style={{ color: log.type === "in" ? "var(--success-color)" : "var(--error-color)" }}
                  >
                    {log.qty} {unit}
                  </div>
                  <div className="material-detail-panel__log-amount">{log.amount}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
