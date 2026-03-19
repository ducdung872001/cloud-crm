import React from "react";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import { GROUP_OPTIONS, WAREHOUSE_OPTIONS } from "../mockData";

interface Props {
  groupBy: string;
  setGroupBy: (value: string) => void;
  warehouseId: number;
  setWarehouseId: (value: number) => void;
  dateRange: [string, string];
  setDateRange: (value: [string, string]) => void;
}

export default function InventoryFilterBar(props: Props) {
  const { groupBy, setGroupBy, warehouseId, setWarehouseId, dateRange, setDateRange } = props;

  return (
    <div className="report-toolbar">
      <div className="report-toolbar__item">
        <label>Kho</label>
        <SelectCustom id="inventoryModernWarehouse" name="inventoryModernWarehouse" options={WAREHOUSE_OPTIONS} fill value={warehouseId} onChange={(option) => setWarehouseId(option.value)} />
      </div>
      <div className="report-toolbar__item">
        <label>Nhóm dữ liệu</label>
        <SelectCustom id="inventoryModernGroup" name="inventoryModernGroup" options={GROUP_OPTIONS} fill value={groupBy} onChange={(option) => setGroupBy(option.value)} />
      </div>
      <div className="report-toolbar__item report-toolbar__item--date">
        <label>Khoảng thời gian</label>
        <DatePickerCustom value={dateRange} onChange={(range) => setDateRange(range)} placeholder="Chọn khoảng ngày..." />
      </div>
    </div>
  );
}
