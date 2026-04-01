import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Input from "components/input/input";
import Loading from "components/loading";
import Icon from "components/icon";
import { showToast } from "utils/common";
import ShippingPartnerService, {
  ICarrierPartnerMerged,
} from "services/ShippingPartnerService";
import "./ShippingPartnerSetup.scss";

// ---- Cấu hình hiển thị cứng theo carrier_code ----
// Chỉ dùng để hiển thị UI, không ảnh hưởng logic nghiệp vụ
const CARRIER_UI_META: Record<string, { avgTime: string; baseFee: string }> = {
  GHN:  { baseFee: "20.000 - 25.000đ", avgTime: "1-2 ngày" },
  GHTK: { baseFee: "18.000 - 22.000đ", avgTime: "1-3 ngày" },
  VTP:  { baseFee: "19.000 - 24.000đ", avgTime: "1-3 ngày" },
  JT:   { baseFee: "20.000 - 26.000đ", avgTime: "1-2 ngày" },
  SPX:  { baseFee: "15.000 - 20.000đ", avgTime: "2-3 ngày" },
  NJV:  { baseFee: "22.000 - 28.000đ", avgTime: "2-4 ngày" },
};

interface IConfigForm {
  apiKey: string;
  token: string;
  showApiKey: boolean;
  showToken: boolean;
}

const DEFAULT_FORM: IConfigForm = { apiKey: "", token: "", showApiKey: false, showToken: false };

export default function ShippingPartnerSetup() {
  document.title = "Quản lý Đơn vị Vận chuyển";
  const navigate = useNavigate();

  // ---- State ----
  const [carriers, setCarriers]   = useState<ICarrierPartnerMerged[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCard, setOpenCard]   = useState<string | null>(null); // carrierCode
  const [forms, setForms]         = useState<Record<string, IConfigForm>>({});
  const [savingCode, setSavingCode] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ---- Load data ----
  const loadData = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsLoading(true);
    try {
      // Gọi song song 2 API từ 2 service khác nhau
      const [carrierRes, configRes] = await Promise.all([
        ShippingPartnerService.getCarrierList(ctrl.signal),
        ShippingPartnerService.getCarrierConfigs(ctrl.signal),
      ]);

      if (ctrl.signal.aborted) return;

      const carrierList = carrierRes?.result ?? [];
      const configList  = configRes?.result  ?? [];

      const merged = ShippingPartnerService.mergeCarrierData(carrierList, configList);
      setCarriers(merged);

      // Khởi tạo form trống cho mỗi hãng
      const initForms: Record<string, IConfigForm> = {};
      merged.forEach((c) => { initForms[c.code] = { ...DEFAULT_FORM }; });
      setForms(initForms);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      showToast("Không thể tải danh sách đơn vị vận chuyển", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    return () => abortRef.current?.abort();
  }, [loadData]);

  // ---- Helpers ----
  const setFormField = (code: string, field: keyof IConfigForm) => (e: any) => {
    const value = typeof e === "boolean" ? e : e.target.value;
    setForms((prev) => ({ ...prev, [code]: { ...prev[code], [field]: value } }));
  };

  const togglePwField = (code: string, field: "showApiKey" | "showToken") => {
    setForms((prev) => ({
      ...prev,
      [code]: { ...prev[code], [field]: !prev[code]?.[field] },
    }));
  };

  // ---- Connect ----
  const handleConnect = async (carrier: ICarrierPartnerMerged) => {
    const form = forms[carrier.code];
    if (!form?.apiKey?.trim()) {
      showToast("Vui lòng nhập API Key", "warning");
      return;
    }
    setSavingCode(carrier.code);
    try {
      const res = await ShippingPartnerService.connectCarrier({
        carrierCode: carrier.code,
        apiKey: form.apiKey.trim(),
        token: form.token?.trim() || undefined,
      });

      if (res?.code !== 0) {
        showToast(res?.message || "Kết nối thất bại, vui lòng thử lại", "error");
        return;
      }

      showToast(`Kết nối ${carrier.name} thành công!`, "success");
      setOpenCard(null);
      // Refresh để lấy trạng thái mới nhất
      await loadData();
    } catch {
      showToast("Có lỗi xảy ra khi kết nối", "error");
    } finally {
      setSavingCode(null);
    }
  };

  // ---- Disconnect ----
  const handleDisconnect = async (carrier: ICarrierPartnerMerged) => {
    setSavingCode(carrier.code);
    try {
      const res = await ShippingPartnerService.disconnectCarrier(carrier.code);

      if (res?.code !== 0) {
        showToast(res?.message || "Ngắt kết nối thất bại", "error");
        return;
      }

      showToast(`Đã ngắt kết nối ${carrier.name}`, "success");
      setOpenCard(null);
      await loadData();
    } catch {
      showToast("Có lỗi xảy ra khi ngắt kết nối", "error");
    } finally {
      setSavingCode(null);
    }
  };

  // ---- Stats computed ----
  const connectedCount    = carriers.filter((c) => c.isConnected).length;
  const totalTodayOrders  = carriers.reduce((s, c) => s + (c.todayNewOrders ?? 0), 0);
  const avgRating         = carriers.length
    ? (carriers.reduce((s, c) => s + (c.rating ?? 0), 0) / carriers.length).toFixed(1)
    : "—";

  // Table: chỉ hiển thị hãng đang kết nối
  const tableRows = carriers.filter((c) => c.isConnected);

  // ---- Status label cho table ----
  const statusLabel = (c: ICarrierPartnerMerged) => {
    if (c.isConnected) return <span className="ps-status ps-status--active">Hoạt động</span>;
    return <span className="ps-status ps-status--inactive">Chưa kết nối</span>;
  };

  // ---- TitleAction ----
  const titleActions: ITitleActions = {
    actions: [{ title: "Quay lại", callback: () => navigate("/shipping") }],
    actions_extra: [],
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
            <div className="ps-stat-card__value">{totalTodayOrders.toLocaleString("vi-VN")}</div>
          </div>
          <div className="ps-stat-card">
            <div className="ps-stat-card__label">Đánh giá trung bình</div>
            <div className="ps-stat-card__value">{avgRating} ★</div>
          </div>
          <div className="ps-stat-card">
            <div className="ps-stat-card__label">Tổng đơn vị</div>
            <div className="ps-stat-card__value">{carriers.length}</div>
          </div>
        </div>

        {/* ===== Partner cards ===== */}
        <div className="ps-partner-cards">
          {carriers.map((carrier) => {
            const isSaving     = savingCode === carrier.code;
            const isOpen       = openCard === carrier.code;
            const form         = forms[carrier.code] ?? DEFAULT_FORM;
            const isConnected  = carrier.isConnected;

            return (
              <div
                key={carrier.code}
                className={`ps-partner-card${isConnected ? " is-connected" : ""}`}
              >
                {/* Logo */}
                <div className="ps-partner-card__logo">
                  {carrier.avatar ? (
                    <img
                      src={carrier.avatar}
                      alt={carrier.name}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : null}
                  <span className="ps-partner-card__logo-fallback">{carrier.code}</span>
                </div>

                <div className="ps-partner-card__name">{carrier.name}</div>

                {/* Trạng thái kết nối */}
                <div className="ps-partner-card__status">
                  {isConnected
                    ? <span className="ps-conn-badge ps-conn-badge--connected">Đã kết nối ✓</span>
                    : <span className="ps-conn-badge ps-conn-badge--none">Chưa kết nối</span>
                  }
                </div>

                {/* Action button */}
                {isConnected ? (
                  <button
                    className="ps-partner-card__btn ps-partner-card__btn--config"
                    onClick={() => setOpenCard(isOpen ? null : carrier.code)}
                  >
                    Cấu hình API
                  </button>
                ) : (
                  <button
                    className="ps-partner-card__btn ps-partner-card__btn--connect"
                    disabled={isSaving}
                    onClick={() => setOpenCard(isOpen ? null : carrier.code)}
                  >
                    {isSaving ? "Đang kết nối..." : "Kết nối ngay"}
                  </button>
                )}

                {/* Expand: form nhập API key ---- */}
                {isOpen && (
                  <div className="ps-config-form">
                    {/* Hiển thị API key đã mask nếu đã kết nối */}
                    {isConnected && carrier.apiKeyMasked && (
                      <div className="ps-config-form__masked">
                        <span className="ps-config-form__masked-label">API Key hiện tại:</span>
                        <span className="ps-config-form__masked-value">{carrier.apiKeyMasked}</span>
                        {carrier.hasToken && (
                          <span className="ps-config-form__masked-token">+ Token ✓</span>
                        )}
                      </div>
                    )}

                    <div className="ps-config-form__field">
                      <label>
                        {isConnected ? "API Key mới" : "API Key"}
                        <span className="required"> *</span>
                      </label>
                      <div className="ps-pw-wrap">
                        <Input
                          name={`apiKey_${carrier.code}`}
                          fill
                          type={form.showApiKey ? "text" : "password"}
                          value={form.apiKey}
                          onChange={setFormField(carrier.code, "apiKey")}
                          placeholder="Nhập API Key..."
                        />
                        <button
                          type="button"
                          className="ps-pw-toggle"
                          onClick={() => togglePwField(carrier.code, "showApiKey")}
                        >
                          <Icon name={form.showApiKey ? "EyeSlash" : "Eye"} />
                        </button>
                      </div>
                    </div>

                    <div className="ps-config-form__field">
                      <label>
                        Token <span className="optional">(nếu có)</span>
                      </label>
                      <div className="ps-pw-wrap">
                        <Input
                          name={`token_${carrier.code}`}
                          fill
                          type={form.showToken ? "text" : "password"}
                          value={form.token}
                          onChange={setFormField(carrier.code, "token")}
                          placeholder="Nhập Token..."
                        />
                        <button
                          type="button"
                          className="ps-pw-toggle"
                          onClick={() => togglePwField(carrier.code, "showToken")}
                        >
                          <Icon name={form.showToken ? "EyeSlash" : "Eye"} />
                        </button>
                      </div>
                    </div>

                    <div className="ps-config-form__actions">
                      <button className="ps-btn-cancel" onClick={() => setOpenCard(null)}>
                        Hủy
                      </button>
                      {isConnected ? (
                        <>
                          <button
                            className="ps-btn-save"
                            disabled={isSaving}
                            onClick={() => handleConnect(carrier)}
                          >
                            {isSaving ? "Đang lưu..." : "Cập nhật"}
                          </button>
                          <button
                            className="ps-btn-disconnect"
                            disabled={isSaving}
                            onClick={() => handleDisconnect(carrier)}
                          >
                            {isSaving ? "Đang ngắt..." : "Ngắt kết nối"}
                          </button>
                        </>
                      ) : (
                        <button
                          className="ps-btn-save"
                          disabled={isSaving}
                          onClick={() => handleConnect(carrier)}
                        >
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

        {/* ===== Table — chỉ hiển thị hãng đang kết nối ===== */}
        {tableRows.length > 0 && (
          <div className="ps-table-wrap">
            <table className="ps-table">
              <thead>
                <tr>
                  <th>MÃ ĐV</th>
                  <th>TÊN ĐƠN VỊ</th>
                  <th>PHÍ CƠ BẢN (NỘI THÀNH)</th>
                  <th>THỜI GIAN TB</th>
                  <th>ĐÁNH GIÁ</th>
                  <th>ĐƠN HÔM NAY</th>
                  <th>TRẠNG THÁI</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((carrier) => {
                  const uiMeta = CARRIER_UI_META[carrier.code] ?? {};
                  return (
                    <tr key={carrier.code}>
                      <td className="ps-table__code">{carrier.code}</td>
                      <td>{carrier.name}</td>
                      <td>{carrier.baseFeeLabel || uiMeta.baseFee || "—"}</td>
                      <td>{carrier.avgTimeLabel || uiMeta.avgTime || "—"}</td>
                      <td>{carrier.rating ? `${carrier.rating} ★` : "—"}</td>
                      <td>
                        {carrier.todayNewOrders != null
                          ? carrier.todayNewOrders.toLocaleString("vi-VN")
                          : "—"}
                      </td>
                      <td>{statusLabel(carrier)}</td>
                      <td>
                        <button
                          className="ps-btn-detail"
                          onClick={() =>
                            setOpenCard(openCard === carrier.code ? null : carrier.code)
                          }
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state khi chưa kết nối hãng nào */}
        {tableRows.length === 0 && !isLoading && (
          <div className="ps-empty-table">
            <p>Chưa có đơn vị vận chuyển nào được kết nối.</p>
            <p>Nhấn <strong>Kết nối ngay</strong> trên các thẻ bên trên để bắt đầu.</p>
          </div>
        )}
      </div>
    </Fragment>
  );
}