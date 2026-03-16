import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Input from "components/input/input";
import Button from "components/button/button";
import Loading from "components/loading";
import Icon from "components/icon";
import { showToast } from "utils/common";
import { IShippingPartnerResponse } from "model/shipping/ShippingResponseModel";
import { MOCK_PARTNERS } from "../ShippingMockData";
// import ShippingService from "services/ShippingService"; // TODO: bật khi có API
import "./ShippingPartnerSetup.scss";

// ---- Extended partner data (mock) ----
const PARTNER_META: Record<string, {
  code: string;
  fullName: string;
  logo: string;
  baseFee: string;
  avgTime: string;
  rating: number;
  activeOrders: number;
  statusLabel: string;   // "connected" | "disconnected" | "maintenance"
}> = {
  GHN: {
    code: "GHN",
    fullName: "Giao Hàng Nhanh",
    logo: "GHN",
    baseFee: "20.000 - 25.000đ",
    avgTime: "1-2 ngày",
    rating: 4.7,
    activeOrders: 812,
    statusLabel: "connected",
  },
  GHTK: {
    code: "GHTK",
    fullName: "Giao Hàng Tiết Kiệm",
    logo: "GHTK",
    baseFee: "18.000 - 22.000đ",
    avgTime: "1-3 ngày",
    rating: 4.5,
    activeOrders: 645,
    statusLabel: "connected",
  },
  "Viettel Post": {
    code: "VTP",
    fullName: "Viettel Post",
    logo: "Viettel Post",
    baseFee: "19.000 - 24.000đ",
    avgTime: "1-3 ngày",
    rating: 4.6,
    activeOrders: 278,
    statusLabel: "connected",
  },
  "J&T": {
    code: "J&T",
    fullName: "J&T Express",
    logo: "J&T",
    baseFee: "20.000 - 26.000đ",
    avgTime: "1-2 ngày",
    rating: 4.4,
    activeOrders: 157,
    statusLabel: "maintenance",
  },
  SPX: {
    code: "SPX",
    fullName: "SPX Express",
    logo: "SPX",
    baseFee: "15.000 - 20.000đ",
    avgTime: "2-3 ngày",
    rating: 4.2,
    activeOrders: 0,
    statusLabel: "disconnected",
  },
  "Ninja Van": {
    code: "NJV",
    fullName: "Ninja Van",
    logo: "Ninja Van",
    baseFee: "22.000 - 28.000đ",
    avgTime: "2-4 ngày",
    rating: 4.0,
    activeOrders: 0,
    statusLabel: "maintenance",
  },
};

// Extended partner list (more than mock)
const ALL_PARTNERS = [
  { id: 1,  name: "GHN",          status: 1, webhookUrl: "https://webhook.example.com/ghn",    connectedAt: "2024-01-15T10:00:00" },
  { id: 2,  name: "GHTK",         status: 1, webhookUrl: "https://webhook.example.com/ghtk",   connectedAt: "2024-02-10T10:00:00" },
  { id: 3,  name: "Viettel Post",  status: 1, webhookUrl: "https://webhook.example.com/vtp",    connectedAt: "2024-03-01T10:00:00" },
  { id: 4,  name: "J&T",          status: 2, webhookUrl: "",                                    connectedAt: "" },
  { id: 5,  name: "SPX",          status: 0, webhookUrl: "",                                    connectedAt: "" },
  { id: 6,  name: "Ninja Van",    status: 2, webhookUrl: "",                                    connectedAt: "" },
];

interface ConfigForm {
  apiKey:     string;
  token:      string;
  showApiKey: boolean;
  showToken:  boolean;
}

export default function ShippingPartnerSetup() {
  document.title = "Quản lý Đơn vị Vận chuyển";
  const navigate  = useNavigate();

  const [partners, setPartners]   = useState(ALL_PARTNERS);
  const [openCard, setOpenCard]   = useState<number | null>(null);
  const [forms, setForms]         = useState<Record<number, ConfigForm>>({});
  const [savingId, setSavingId]   = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initForms: Record<number, ConfigForm> = {};
    ALL_PARTNERS.forEach((p) => {
      initForms[p.id] = { apiKey: "", token: "", showApiKey: false, showToken: false };
    });
    setForms(initForms);
  }, []);

  const setFormField = (partnerId: number, field: keyof ConfigForm) => (e: any) => {
    const value = typeof e === "boolean" ? e : e.target.value;
    setForms((prev) => ({ ...prev, [partnerId]: { ...prev[partnerId], [field]: value } }));
  };

  const togglePasswordField = (partnerId: number, field: "showApiKey" | "showToken") => {
    setForms((prev) => ({ ...prev, [partnerId]: { ...prev[partnerId], [field]: !prev[partnerId]?.[field] } }));
  };

  const handleConnect = async (partner: typeof ALL_PARTNERS[0]) => {
    const form = forms[partner.id];
    if (!form?.apiKey?.trim()) { showToast("Vui lòng nhập API Key", "warning"); return; }
    setSavingId(partner.id);
    await new Promise((r) => setTimeout(r, 600));
    showToast(`Kết nối ${partner.name} thành công! (demo)`, "success");
    setPartners((prev) => prev.map((p) => p.id === partner.id
      ? { ...p, status: 1, connectedAt: new Date().toISOString(), webhookUrl: "https://webhook.example.com/" + p.id }
      : p));
    setOpenCard(null);
    setSavingId(null);
  };

  const handleDisconnect = async (partner: typeof ALL_PARTNERS[0]) => {
    setSavingId(partner.id);
    await new Promise((r) => setTimeout(r, 400));
    showToast(`Đã ngắt kết nối ${partner.name} (demo)`, "success");
    setPartners((prev) => prev.map((p) => p.id === partner.id ? { ...p, status: 0, connectedAt: "", webhookUrl: "" } : p));
    setSavingId(null);
  };

  const titleActions: ITitleActions = {
    actions: [
      { title: "Quay lại", callback: () => navigate("/shipping") },
    ],
    actions_extra: [],
  };

  // ---- Stats ----
  const connectedCount    = partners.filter((p) => p.status === 1).length;
  const maintenanceCount  = partners.filter((p) => p.status === 2).length;
  const totalActiveOrders = Object.values(PARTNER_META).reduce((s, m) => s + m.activeOrders, 0);
  const avgRating         = (Object.values(PARTNER_META).reduce((s, m) => s + m.rating, 0) / Object.keys(PARTNER_META).length).toFixed(2);

  // ---- Table rows: only connected or maintenance ----
  const tableRows = partners.filter((p) => p.status === 1 || p.status === 2);

  const statusLabel = (status: number) => {
    if (status === 1) return <span className="ps-status ps-status--active">Hoạt động</span>;
    if (status === 2) return <span className="ps-status ps-status--maintenance">Bảo trì nhẹ</span>;
    return <span className="ps-status ps-status--inactive">Ngừng hoạt động</span>;
  };

  if (isLoading) return <div className="page-content"><Loading /></div>;

  return (
    <Fragment>
      <div className="page-content page-partner-setup">

        <TitleAction title="Quản lý Đơn vị Vận chuyển" titleActions={titleActions} />

        {/* ===== Stats bar ===== */}
        <div className="ps-stats-bar">
          <div className="ps-stat-card">
            <div className="ps-stat-card__label">Đơn vị đang kết nối</div>
            <div className="ps-stat-card__value">{connectedCount}</div>
          </div>
          <div className="ps-stat-card">
            <div className="ps-stat-card__label">Tổng đơn xử lý hôm nay</div>
            <div className="ps-stat-card__value">{totalActiveOrders.toLocaleString("vi-VN")}</div>
          </div>
          <div className="ps-stat-card">
            <div className="ps-stat-card__label">Đánh giá trung bình</div>
            <div className="ps-stat-card__value">{avgRating} ★</div>
          </div>
          <div className="ps-stat-card">
            <div className="ps-stat-card__label">Đơn vị bảo trì</div>
            <div className="ps-stat-card__value">{maintenanceCount}</div>
          </div>
        </div>

        {/* ===== Partner cards row ===== */}
        <div className="ps-partner-cards">
          {partners.map((partner) => {
            const meta     = PARTNER_META[partner.name];
            const isSaving = savingId === partner.id;
            const isOpen   = openCard === partner.id;
            const form     = forms[partner.id] || { apiKey: "", token: "", showApiKey: false, showToken: false };
            const isConnected   = partner.status === 1;
            const isMaintenance = partner.status === 2;

            return (
              <div key={partner.id} className={`ps-partner-card ${isConnected ? "is-connected" : ""} ${isMaintenance ? "is-maintenance" : ""}`}>
                {/* Logo placeholder */}
                <div className="ps-partner-card__logo">
                  <img src={`/assets/images/shipping/${meta?.logo}.png`} alt={partner.name}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="ps-partner-card__logo-fallback">{meta?.code || partner.name}</span>
                </div>

                <div className="ps-partner-card__name">{meta?.fullName || partner.name}</div>

                {/* Status */}
                <div className="ps-partner-card__status">
                  {isConnected   && <span className="ps-conn-badge ps-conn-badge--connected">Đã kết nối ✓</span>}
                  {isMaintenance && <span className="ps-conn-badge ps-conn-badge--maintenance">Tạm ngưng</span>}
                  {!isConnected && !isMaintenance && <span className="ps-conn-badge ps-conn-badge--none">Chưa kết nối</span>}
                </div>

                {/* Action button */}
                {isConnected ? (
                  <button className="ps-partner-card__btn ps-partner-card__btn--config"
                    onClick={() => setOpenCard(isOpen ? null : partner.id)}>
                    Cấu hình API
                  </button>
                ) : isMaintenance ? (
                  <button className="ps-partner-card__btn ps-partner-card__btn--activate"
                    onClick={() => showToast("Tính năng này đang phát triển (demo)", "warning")}>
                    Kích hoạt
                  </button>
                ) : (
                  <button className="ps-partner-card__btn ps-partner-card__btn--connect"
                    disabled={isSaving}
                    onClick={() => setOpenCard(isOpen ? null : partner.id)}>
                    {isSaving ? "Đang kết nối..." : "Kết nối ngay"}
                  </button>
                )}

                {/* Expand config form */}
                {isOpen && (
                  <div className="ps-config-form">
                    <div className="ps-config-form__field">
                      <label>API Key <span className="required">*</span></label>
                      <div className="ps-pw-wrap">
                        <Input name={`apiKey_${partner.id}`} fill
                          type={form.showApiKey ? "text" : "password"}
                          value={form.apiKey}
                          onChange={setFormField(partner.id, "apiKey")}
                          placeholder="Nhập API Key..." />
                        <button type="button" className="ps-pw-toggle"
                          onClick={() => togglePasswordField(partner.id, "showApiKey")}>
                          <Icon name={form.showApiKey ? "EyeSlash" : "Eye"} />
                        </button>
                      </div>
                    </div>
                    <div className="ps-config-form__field">
                      <label>Token <span className="optional">(nếu có)</span></label>
                      <div className="ps-pw-wrap">
                        <Input name={`token_${partner.id}`} fill
                          type={form.showToken ? "text" : "password"}
                          value={form.token}
                          onChange={setFormField(partner.id, "token")}
                          placeholder="Nhập Token..." />
                        <button type="button" className="ps-pw-toggle"
                          onClick={() => togglePasswordField(partner.id, "showToken")}>
                          <Icon name={form.showToken ? "EyeSlash" : "Eye"} />
                        </button>
                      </div>
                    </div>
                    <div className="ps-config-form__actions">
                      <button className="ps-btn-cancel" onClick={() => setOpenCard(null)}>Hủy</button>
                      {isConnected ? (
                        <button className="ps-btn-disconnect" disabled={isSaving}
                          onClick={() => handleDisconnect(partner)}>
                          {isSaving ? "Đang ngắt..." : "Ngắt kết nối"}
                        </button>
                      ) : (
                        <button className="ps-btn-save" disabled={isSaving}
                          onClick={() => handleConnect(partner)}>
                          {isSaving ? "Đang lưu..." : "Lưu & Kết nối"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ===== Table ===== */}
        <div className="ps-table-wrap">
          <table className="ps-table">
            <thead>
              <tr>
                <th>MÃ ĐV</th>
                <th>TÊN ĐƠN VỊ</th>
                <th>PHÍ CƠ BẢN (NỘI THÀNH)</th>
                <th>THỜI GIAN TB</th>
                <th>ĐÁNH GIÁ</th>
                <th>ĐƠN ĐANG XỬ LÝ</th>
                <th>TRẠNG THÁI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((partner) => {
                const meta = PARTNER_META[partner.name];
                if (!meta) return null;
                return (
                  <tr key={partner.id}>
                    <td className="ps-table__code">{meta.code}</td>
                    <td>{meta.fullName}</td>
                    <td>{meta.baseFee}</td>
                    <td>{meta.avgTime}</td>
                    <td>{meta.rating} ★</td>
                    <td>{meta.activeOrders}</td>
                    <td>{statusLabel(partner.status)}</td>
                    <td>
                      <button className="ps-btn-detail"
                        onClick={() => setOpenCard(openCard === partner.id ? null : partner.id)}>
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </Fragment>
  );
}