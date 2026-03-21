import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import {
  HEALTH_DATA,
  INVENTORY_KPIS,
  MOVEMENT_DATA,
  PRODUCT_ROWS,
  WAREHOUSE_DATA,
} from "./mockData";
import { createClosingOptions, createHealthOptions, createMovementOptions } from "./chartOptions";
import InventoryFilterBar from "./components/InventoryFilterBar";
import InventoryKpiGrid from "./components/InventoryKpiGrid";
import InventoryWarehouseSummary from "./components/InventoryWarehouseSummary";
import InventoryProductTable from "./components/InventoryProductTable";
import InventoryReportService, {
  formatInventoryDate,
  IInventoryHealth,
  IInventoryMovement,
  IInventoryProductDetail,
  IInventoryReportFull,
  IInventorySummary,
  IInventoryTrend,
  IInventoryWarehousePerf,
} from "services/InventoryReportService";
import "./InventoryReportModern.scss";

// ── Helpers chuyển mock → shape API ──────────────────────────────────────────

function mockToSummary(): IInventorySummary {
  return {
    totalImport:    9860,
    totalExport:    7325,
    closingQty:     4750,
    stockValue:     3155000000,
    belowThreshold: 34,
  };
}

function mockToMovement(): IInventoryMovement[] {
  return MOVEMENT_DATA.map((d) => ({
    label:         d.label,
    importQty:     d.importQty,
    exportQty:     d.exportQty,
    adjustmentQty: d.adjustmentQty,
    closingQty:    d.closingQty,
  }));
}

function mockToHealth(): IInventoryHealth[] {
  return HEALTH_DATA.map((d) => ({
    name:   d.name,
    status: d.name === "Ổn định" ? "STABLE" : d.name === "Cần theo dõi" ? "WATCH" : "LOW",
    y:      d.y,
    color:  d.color,
  }));
}

function mockToTrend(): IInventoryTrend[] {
  return MOVEMENT_DATA.map((d) => ({ label: d.label, closingQty: d.closingQty }));
}

function mockToWarehousePerf() {
  return WAREHOUSE_DATA.map((d, i) => ({
    warehouseId: i + 1,
    name:        d.name,
    closingQty:  d.closingQty,
    stockValue:  d.stockValue,
  }));
}

function mockToProductDetails(): IInventoryProductDetail[] {
  return PRODUCT_ROWS.map((d) => ({
    sku:           d.sku,
    productName:   d.productName,
    warehouseName: d.warehouseName,
    closingQty:    d.closingQty,
    availableQty:  d.availableQty,
    stockValue:    d.stockValue,
    turnoverDays:  d.turnoverDays,
    status:        d.status,
    color:         d.color,
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InventoryReportModern() {
  document.title = "Báo cáo tồn kho";

  // ── Filter state ──────────────────────────────────────────────────────────
  const [groupBy, setGroupBy]         = useState("month");
  const [warehouseId, setWarehouseId] = useState(0);
  const [dateRange, setDateRange]     = useState<[string, string]>([
    moment().subtract(5, "months").startOf("month").format("YYYY-MM-DD"),
    moment().endOf("month").format("YYYY-MM-DD"),
  ]);

  // ── Data state — khởi tạo bằng mock ──────────────────────────────────────
  const [summary,        setSummary]        = useState<IInventorySummary>(mockToSummary());
  const [movement,       setMovement]       = useState<IInventoryMovement[]>(mockToMovement());
  const [health,         setHealth]         = useState<IInventoryHealth[]>(mockToHealth());
  const [trend,          setTrend]          = useState<IInventoryTrend[]>(mockToTrend());
  const [warehousePerf,  setWarehousePerf]  = useState<IInventoryWarehousePerf[]>(mockToWarehousePerf());
  const [productDetails, setProductDetails] = useState<IInventoryProductDetail[]>(mockToProductDetails());
  const [isLoading,      setIsLoading]      = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch — dùng API full (1 call), fallback mock từng trường ────────────
  const fetchReport = async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    // Format ngày → "DD/MM/YYYY" theo backend
    const fromTime = dateRange[0] ? formatInventoryDate(new Date(dateRange[0])) : undefined;
    const toTime   = dateRange[1] ? formatInventoryDate(new Date(dateRange[1])) : undefined;

    const data: IInventoryReportFull | null = await InventoryReportService.full(
      { warehouseId, fromTime, toTime, groupBy: groupBy as any },
      controller.signal
    );

    if (data) {
      // Chỉ replace nếu API trả về có dữ liệu — giữ mock nếu trường rỗng
      if (data.summary)                      setSummary(data.summary);
      if (data.movement?.length)             setMovement(data.movement);
      if (data.health?.length)               setHealth(data.health);
      if (data.trend?.length)                setTrend(data.trend);
      if (data.warehousePerf?.length)        setWarehousePerf(data.warehousePerf);
      if (data.productDetails?.length)       setProductDetails(data.productDetails);
    }
    // data null → lỗi mạng/5xx, giữ nguyên mock hiện tại

    setIsLoading(false);
  };

  useEffect(() => {
    fetchReport();
    return () => abortRef.current?.abort();
  }, [warehouseId, groupBy, dateRange]);

  // ── Chart options — driven bởi state (real hoặc mock) ────────────────────
  const movementOptions = useMemo<Highcharts.Options>(
    () => createMovementOptions(movement),
    [movement]
  );
  const closingOptions = useMemo<Highcharts.Options>(
    () => createClosingOptions(trend),
    [trend]
  );
  const healthOptions = useMemo<Highcharts.Options>(
    () => createHealthOptions(health),
    [health]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Fragment>
      <div className="page-content page-inventory-report-modern">
        <TitleAction title="Báo cáo tồn kho" />

        <InventoryFilterBar
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <InventoryKpiGrid summary={summary} loading={isLoading} />

        <div className="report-grid">
          <div className="report-panel report-panel--wide">
            <div className="report-panel__header">
              <div className="report-panel__title">Biến động nhập xuất tồn</div>
              <div className="report-panel__sub">So sánh nhập, xuất và điều chỉnh trong kỳ</div>
            </div>
            <HighchartsReact highcharts={Highcharts} options={movementOptions} />
          </div>

          <div className="report-panel">
            <div className="report-panel__header">
              <div className="report-panel__title">Sức khỏe tồn kho</div>
              <div className="report-panel__sub">Phân loại theo mức cảnh báo</div>
            </div>
            <HighchartsReact highcharts={Highcharts} options={healthOptions} />
            <div className="report-legend">
              {health.map((item) => (
                <div key={item.name} className="report-legend__item">
                  <span className="report-legend__dot" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <strong>{item.y}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="report-panel report-panel--wide">
            <div className="report-panel__header">
              <div className="report-panel__title">Xu hướng tồn cuối kỳ</div>
              <div className="report-panel__sub">Theo dõi lượng tồn còn lại theo chu kỳ</div>
            </div>
            <HighchartsReact highcharts={Highcharts} options={closingOptions} />
          </div>

          <InventoryWarehouseSummary warehousePerf={warehousePerf} />
        </div>

        <InventoryProductTable productDetails={productDetails} />
      </div>
    </Fragment>
  );
}