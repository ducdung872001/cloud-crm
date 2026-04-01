import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Input from "components/input/input";
import Loading from "components/loading";
import { showToast } from "utils/common";
// import ShippingService from "services/ShippingService"; // TODO: bật khi có API
import "./ShippingFeeConfig.scss";

// ---- Types ----
type TabType = "region" | "order_value";

interface RegionRow {
  id: number;
  name: string;
  fee: number | "";
  deliveryDays: number | "";
  freeShipThreshold: number | "";
}

interface OrderValueRow {
  id: number;
  minOrderValue: number | "";
  maxOrderValue: number | "";
  fee: number | "";
  deliveryDays: number | "";
}

const DEFAULT_REGION_ROWS: RegionRow[] = [
  { id: 1, name: "TP. Hồ Chí Minh", fee: 20000, deliveryDays: 1, freeShipThreshold: 200000 },
  { id: 2, name: "Miền Nam (khác)",  fee: 30000, deliveryDays: 2, freeShipThreshold: 350000 },
  { id: 3, name: "Miền Trung",       fee: 40000, deliveryDays: 3, freeShipThreshold: 500000 },
  { id: 4, name: "Miền Bắc",         fee: 50000, deliveryDays: 4, freeShipThreshold: 600000 },
];

const DEFAULT_ORDER_VALUE_ROWS: OrderValueRow[] = [
  { id: 1, minOrderValue: 0,      maxOrderValue: 199999, fee: 30000, deliveryDays: 3 },
  { id: 2, minOrderValue: 200000, maxOrderValue: 499999, fee: 15000, deliveryDays: 3 },
  { id: 3, minOrderValue: 500000, maxOrderValue: "",     fee: 0,     deliveryDays: 3 },
];

let nextRegionId   = 10;
let nextOrderValId = 10;

export default function ShippingFeeConfig() {
  document.title = "Cấu hình phí vận chuyển";
  const navigate = useNavigate();

  const [isLoading, setIsLoading]         = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [activeTab, setActiveTab]         = useState<TabType>("region");

  const [regionRows, setRegionRows]           = useState<RegionRow[]>(DEFAULT_REGION_ROWS);
  const [orderValueRows, setOrderValueRows]   = useState<OrderValueRow[]>(DEFAULT_ORDER_VALUE_ROWS);

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    setIsLoadingPage(true);
    await new Promise((r) => setTimeout(r, 200));
    // TODO: load from API
    setIsLoadingPage(false);
  };

  // ---- Region tab handlers ----
  const updateRegionRow = (id: number, field: keyof RegionRow, value: string | number) => {
    setRegionRows(rows => rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addRegionRow = () => {
    setRegionRows(rows => [...rows, {
      id: nextRegionId++,
      name: "",
      fee: "",
      deliveryDays: "",
      freeShipThreshold: "",
    }]);
  };

  const removeRegionRow = (id: number) => {
    setRegionRows(rows => rows.filter(r => r.id !== id));
  };

  // ---- Order value tab handlers ----
  const updateOrderValueRow = (id: number, field: keyof OrderValueRow, value: string | number) => {
    setOrderValueRows(rows => rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addOrderValueRow = () => {
    setOrderValueRows(rows => [...rows, {
      id: nextOrderValId++,
      minOrderValue: "",
      maxOrderValue: "",
      fee: "",
      deliveryDays: "",
    }]);
  };

  const removeOrderValueRow = (id: number) => {
    setOrderValueRows(rows => rows.filter(r => r.id !== id));
  };

  const numVal = (v: string) => v === "" ? "" : +v;

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    // TODO: await ShippingService.saveFeeConfig(...)
    showToast("Lưu cấu hình phí vận chuyển thành công (demo)", "success");
    setIsLoading(false);
  };

  const titleActions: ITitleActions = {
    actions: [
      { title: "Lưu cấu hình", callback: handleSave },
      { title: "Quay lại", callback: () => navigate("/shipping") },
    ],
    actions_extra: [],
  };

  if (isLoadingPage) return <div className="page-content"><Loading /></div>;

  return (
    <Fragment>
      <div className="page-content page-fee-config">
        <TitleAction title="Cấu hình Phí Vận chuyển" titleActions={titleActions} />

        <div className="fee-config-wrapper">
          {/* Header */}
          <div className="fee-config-header">
            <div className="fee-config-header__title">🚚 Cấu hình Phí vận chuyển</div>
            <div className="fee-config-header__desc">
              Thiết lập quy tắc tính phí ship cho từng khu vực hoặc theo giá trị đơn hàng
            </div>

            {/* Tabs */}
            <div className="fee-tabs">
              <button
                className={`fee-tab ${activeTab === "region" ? "active" : ""}`}
                onClick={() => setActiveTab("region")}
              >
                📍 Theo khu vực
                <span className="fee-tab__desc">Phí ship khác nhau theo tỉnh/thành</span>
              </button>
              <button
                className={`fee-tab ${activeTab === "order_value" ? "active" : ""}`}
                onClick={() => setActiveTab("order_value")}
              >
                🔥 Theo giá trị đơn
                <span className="fee-tab__desc">Miễn ship khi đơn đủ mức tối thiểu</span>
              </button>
            </div>
          </div>

          {/* ========== Tab: Theo khu vực ========== */}
          {activeTab === "region" && (
            <div className="fee-table-section">
              <table className="fee-table">
                <thead>
                  <tr>
                    <th>KHU VỰC GIAO HÀNG</th>
                    <th>PHÍ VẬN CHUYỂN (đ)</th>
                    <th>MIỄN SHIP KHI ĐƠN ≥</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {regionRows.map(row => (
                    <tr key={row.id}>
                      <td>
                        <input
                          className="fee-cell-input"
                          value={row.name}
                          onChange={e => updateRegionRow(row.id, "name", e.target.value)}
                          placeholder="Tên khu vực"
                        />
                      </td>
                      <td>
                        <input
                          className="fee-cell-input"
                          type="number"
                          value={row.fee}
                          onChange={e => updateRegionRow(row.id, "fee", numVal(e.target.value))}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          className="fee-cell-input"
                          type="number"
                          value={row.freeShipThreshold}
                          onChange={e => updateRegionRow(row.id, "freeShipThreshold", numVal(e.target.value))}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <button
                          className="fee-delete-btn"
                          onClick={() => removeRegionRow(row.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button className="fee-add-btn" onClick={addRegionRow}>
                + Thêm khu vực mới
              </button>
            </div>
          )}

          {/* ========== Tab: Theo giá trị đơn ========== */}
          {activeTab === "order_value" && (
            <div className="fee-table-section">
              <table className="fee-table">
                <thead>
                  <tr>
                    <th>GIÁ TRỊ ĐƠN TỐI THIỂU (đ)</th>
                    <th>GIÁ TRỊ ĐƠN TỐI ĐA (đ)</th>
                    <th>PHÍ VẬN CHUYỂN (đ)</th>
                    <th>THỜI GIAN GIAO (NGÀY)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orderValueRows.map(row => (
                    <tr key={row.id}>
                      <td>
                        <input
                          className="fee-cell-input"
                          type="number"
                          value={row.minOrderValue}
                          onChange={e => updateOrderValueRow(row.id, "minOrderValue", numVal(e.target.value))}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          className="fee-cell-input"
                          type="number"
                          value={row.maxOrderValue}
                          onChange={e => updateOrderValueRow(row.id, "maxOrderValue", numVal(e.target.value))}
                          placeholder="Không giới hạn"
                        />
                      </td>
                      <td>
                        <input
                          className="fee-cell-input"
                          type="number"
                          value={row.fee}
                          onChange={e => updateOrderValueRow(row.id, "fee", numVal(e.target.value))}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          className="fee-cell-input"
                          type="number"
                          value={row.deliveryDays}
                          onChange={e => updateOrderValueRow(row.id, "deliveryDays", numVal(e.target.value))}
                          placeholder="1"
                        />
                      </td>
                      <td>
                        <button
                          className="fee-delete-btn"
                          onClick={() => removeOrderValueRow(row.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button className="fee-add-btn" onClick={addOrderValueRow}>
                + Thêm mức giá trị mới
              </button>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
}