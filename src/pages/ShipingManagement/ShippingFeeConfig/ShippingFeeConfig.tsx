import React, { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Loading from "components/loading";
import { showToast } from "utils/common";
// import ShippingService from "services/ShippingService"; // TODO: bật khi có API
import "./ShippingFeeConfig.scss";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtNumber = (v: number | "") =>
  v === "" ? "" : Number(v).toLocaleString("vi-VN");

const parseLocale = (raw: string): number | "" => {
  const cleaned = raw.replace(/\./g, "").replace(/,/g, "").trim();
  if (cleaned === "") return "";
  const n = Number(cleaned);
  return isNaN(n) ? "" : n;
};

// ─── Subcomponents ────────────────────────────────────────────────────────────

/** Input tiền: hiển thị format có dấu chấm, lưu raw number */
function MoneyInput({
  value, onChange, placeholder = "0", suffix = "đ",
}: {
  value: number | ""; onChange: (v: number | "") => void;
  placeholder?: string; suffix?: string;
}) {
  const [display, setDisplay] = useState(fmtNumber(value));
  const [focused, setFocused] = useState(false);

  // sync khi value thay đổi từ bên ngoài
  useEffect(() => { if (!focused) setDisplay(fmtNumber(value)); }, [value, focused]);

  return (
    <div className="fee-input-wrap fee-input-wrap--money">
      <input
        className="fee-cell-input fee-cell-input--money"
        inputMode="numeric"
        value={focused ? display : fmtNumber(value)}
        placeholder={placeholder}
        onFocus={() => { setFocused(true); setDisplay(value === "" ? "" : String(value)); }}
        onChange={(e) => { setDisplay(e.target.value); onChange(parseLocale(e.target.value)); }}
        onBlur={() => { setFocused(false); setDisplay(fmtNumber(value)); }}
      />
      <span className="fee-input-suffix">{suffix}</span>
    </div>
  );
}

/** Input ngày: số nguyên nhỏ */
function DaysInput({
  value, onChange,
}: { value: number | ""; onChange: (v: number | "") => void }) {
  return (
    <div className="fee-input-wrap fee-input-wrap--days">
      <input
        className="fee-cell-input fee-cell-input--days"
        type="number"
        min={1}
        value={value}
        placeholder="1"
        onChange={(e) => onChange(e.target.value === "" ? "" : Math.max(1, +e.target.value))}
      />
      <span className="fee-input-suffix">ngày</span>
    </div>
  );
}

/** Nút xóa row — icon trash */
function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="fee-delete-btn" onClick={onClick} title="Xóa dòng này" type="button">
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 4a1 1 0 011-1h4a1 1 0 011 1v1H7V4z" fill="currentColor"/>
        <path d="M3 6h14l-1.3 10.4A2 2 0 0113.72 18H6.28a2 2 0 01-1.98-1.6L3 6z" fill="currentColor"/>
        <path d="M8 9v5M12 9v5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ShippingFeeConfig() {
  document.title = "Cấu hình phí vận chuyển";
  const navigate = useNavigate();

  const [isLoading, setIsLoading]         = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [activeTab, setActiveTab]         = useState<TabType>("region");
  const [hasUnsaved, setHasUnsaved]       = useState(false);

  const [regionRows, setRegionRows]         = useState<RegionRow[]>(DEFAULT_REGION_ROWS);
  const [orderValueRows, setOrderValueRows] = useState<OrderValueRow[]>(DEFAULT_ORDER_VALUE_ROWS);

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    setIsLoadingPage(true);
    await new Promise((r) => setTimeout(r, 200));
    // TODO: load from API
    setIsLoadingPage(false);
  };

  // ── Region handlers ──────────────────────────────────────────────────────────
  const updateRegionRow = (id: number, field: keyof RegionRow, value: string | number | "") => {
    setRegionRows(rows => rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    setHasUnsaved(true);
  };
  const addRegionRow = () => {
    setRegionRows(rows => [...rows, { id: nextRegionId++, name: "", fee: "", deliveryDays: "", freeShipThreshold: "" }]);
    setHasUnsaved(true);
  };
  const removeRegionRow = (id: number) => {
    setRegionRows(rows => rows.filter(r => r.id !== id));
    setHasUnsaved(true);
  };

  // ── Order value handlers ─────────────────────────────────────────────────────
  const updateOrderValueRow = (id: number, field: keyof OrderValueRow, value: string | number | "") => {
    setOrderValueRows(rows => rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    setHasUnsaved(true);
  };
  const addOrderValueRow = () => {
    setOrderValueRows(rows => [...rows, { id: nextOrderValId++, minOrderValue: "", maxOrderValue: "", fee: "", deliveryDays: "" }]);
    setHasUnsaved(true);
  };
  const removeOrderValueRow = (id: number) => {
    setOrderValueRows(rows => rows.filter(r => r.id !== id));
    setHasUnsaved(true);
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    // TODO: await ShippingService.saveFeeConfig(...)
    showToast("Lưu cấu hình thành công", "success");
    setHasUnsaved(false);
    setIsLoading(false);
  };

  const titleActions: ITitleActions = {
    actions: [
      { title: isLoading ? "Đang lưu..." : "Lưu cấu hình", callback: handleSave },
      { title: "Quay lại", callback: () => navigate("/shipping") },
    ],
    actions_extra: [],
  };

  if (isLoadingPage) return <div className="page-content"><Loading /></div>;

  return (
    <Fragment>
      <div className="page-content page-fee-config">
        <TitleAction title="Cấu hình Phí Vận chuyển" titleActions={titleActions} />

        {/* Unsaved banner */}
        {hasUnsaved && (
          <div className="fee-unsaved-banner">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            Bạn có thay đổi chưa lưu
            <button className="fee-unsaved-banner__save" onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Lưu ngay"}
            </button>
          </div>
        )}

        <div className="fee-config-card">

          {/* ── Card header ── */}
          <div className="fee-config-card__header">
            <div className="fee-config-card__icon">🚚</div>
            <div>
              <div className="fee-config-card__title">Quy tắc tính phí vận chuyển</div>
              <div className="fee-config-card__desc">
                Cấu hình mức phí ship theo từng khu vực hoặc theo giá trị đơn hàng
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="fee-tabs">
            <button
              className={`fee-tab ${activeTab === "region" ? "active" : ""}`}
              onClick={() => setActiveTab("region")}
              type="button"
            >
              <span className="fee-tab__icon">📍</span>
              <span className="fee-tab__body">
                <span className="fee-tab__label">Theo khu vực</span>
                <span className="fee-tab__desc">Phí ship khác nhau theo tỉnh/thành</span>
              </span>
              {activeTab === "region" && <span className="fee-tab__check">✓</span>}
            </button>
            <button
              className={`fee-tab ${activeTab === "order_value" ? "active" : ""}`}
              onClick={() => setActiveTab("order_value")}
              type="button"
            >
              <span className="fee-tab__icon">🔥</span>
              <span className="fee-tab__body">
                <span className="fee-tab__label">Theo giá trị đơn</span>
                <span className="fee-tab__desc">Miễn ship khi đơn đủ mức tối thiểu</span>
              </span>
              {activeTab === "order_value" && <span className="fee-tab__check">✓</span>}
            </button>
          </div>

          {/* ══════════ Tab: Theo khu vực ══════════ */}
          {activeTab === "region" && (
            <div className="fee-table-section">
              <table className="fee-table">
                <thead>
                  <tr>
                    <th className="col-region">
                      Khu vực giao hàng
                      <span className="th-hint">Tên tỉnh/thành hoặc vùng</span>
                    </th>
                    <th className="col-fee">
                      Phí vận chuyển
                      <span className="th-hint">Mặc định tính cho khách</span>
                    </th>
                    <th className="col-days">
                      Thời gian giao
                      <span className="th-hint">Ước tính số ngày</span>
                    </th>
                    <th className="col-free">
                      Miễn ship khi đơn ≥
                      <span className="th-hint">0 = không áp dụng</span>
                    </th>
                    <th className="col-action"></th>
                  </tr>
                </thead>
                <tbody>
                  {regionRows.map((row, idx) => (
                    <tr key={row.id} className={idx % 2 === 0 ? "row-even" : ""}>
                      <td className="col-region">
                        <input
                          className="fee-cell-input fee-cell-input--text"
                          value={row.name}
                          onChange={e => updateRegionRow(row.id, "name", e.target.value)}
                          placeholder="VD: TP. Hồ Chí Minh"
                        />
                      </td>
                      <td className="col-fee">
                        <MoneyInput
                          value={row.fee}
                          onChange={v => updateRegionRow(row.id, "fee", v)}
                        />
                      </td>
                      <td className="col-days">
                        <DaysInput
                          value={row.deliveryDays}
                          onChange={v => updateRegionRow(row.id, "deliveryDays", v)}
                        />
                      </td>
                      <td className="col-free">
                        <MoneyInput
                          value={row.freeShipThreshold}
                          onChange={v => updateRegionRow(row.id, "freeShipThreshold", v)}
                          placeholder="Không áp dụng"
                        />
                      </td>
                      <td className="col-action">
                        <DeleteBtn onClick={() => removeRegionRow(row.id)} />
                      </td>
                    </tr>
                  ))}
                  {regionRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="fee-empty-row">
                        Chưa có khu vực nào. Nhấn "+ Thêm khu vực mới" để bắt đầu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <button className="fee-add-btn" onClick={addRegionRow} type="button">
                <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Thêm khu vực mới
              </button>
            </div>
          )}

          {/* ══════════ Tab: Theo giá trị đơn ══════════ */}
          {activeTab === "order_value" && (
            <div className="fee-table-section">
              <div className="fee-info-box">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Đặt phí vận chuyển = <strong>0 đ</strong> để miễn ship hoàn toàn cho mức giá trị đơn đó.
                Để trống cột "Tối đa" nghĩa là không giới hạn.
              </div>

              <table className="fee-table">
                <thead>
                  <tr>
                    <th className="col-min">
                      Giá trị đơn từ
                      <span className="th-hint">Mức tối thiểu (≥)</span>
                    </th>
                    <th className="col-max">
                      Đến
                      <span className="th-hint">Mức tối đa (trống = ∞)</span>
                    </th>
                    <th className="col-fee">
                      Phí vận chuyển
                      <span className="th-hint">0 đ = miễn phí</span>
                    </th>
                    <th className="col-days">
                      Thời gian giao
                      <span className="th-hint">Ước tính số ngày</span>
                    </th>
                    <th className="col-action"></th>
                  </tr>
                </thead>
                <tbody>
                  {orderValueRows.map((row, idx) => (
                    <tr key={row.id} className={idx % 2 === 0 ? "row-even" : ""}>
                      <td className="col-min">
                        <MoneyInput
                          value={row.minOrderValue}
                          onChange={v => updateOrderValueRow(row.id, "minOrderValue", v)}
                          placeholder="0"
                        />
                      </td>
                      <td className="col-max">
                        <MoneyInput
                          value={row.maxOrderValue}
                          onChange={v => updateOrderValueRow(row.id, "maxOrderValue", v)}
                          placeholder="Không giới hạn"
                        />
                      </td>
                      <td className="col-fee">
                        <MoneyInput
                          value={row.fee}
                          onChange={v => updateOrderValueRow(row.id, "fee", v)}
                        />
                      </td>
                      <td className="col-days">
                        <DaysInput
                          value={row.deliveryDays}
                          onChange={v => updateOrderValueRow(row.id, "deliveryDays", v)}
                        />
                      </td>
                      <td className="col-action">
                        <DeleteBtn onClick={() => removeOrderValueRow(row.id)} />
                      </td>
                    </tr>
                  ))}
                  {orderValueRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="fee-empty-row">
                        Chưa có mức nào. Nhấn "+ Thêm mức giá trị mới" để bắt đầu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <button className="fee-add-btn" onClick={addOrderValueRow} type="button">
                <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Thêm mức giá trị mới
              </button>
            </div>
          )}

          {/* ── Card footer ── */}
          <div className="fee-config-card__footer">
            <button className="fee-btn-back" onClick={() => navigate("/shipping")} type="button">
              ← Quay lại danh sách
            </button>
            <button
              className="fee-btn-save"
              onClick={handleSave}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <>
                  <span className="fee-btn-save__spinner" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path d="M7.629 14.566c.186.127.431.073.561-.114l6-8.5a.4.4 0 00-.092-.558.4.4 0 00-.558.092l-5.7 8.074-2.643-1.98a.4.4 0 00-.56.067.4.4 0 00.068.56l2.924 2.359z"/>
                  </svg>
                  Lưu cấu hình
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </Fragment>
  );
}