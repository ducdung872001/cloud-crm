import React from "react";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import { CHANNEL_OPTIONS, VIEW_OPTIONS } from "../mockData";

interface Props {
  channel: string;
  setChannel: (value: string) => void;
  viewMode: string;
  setViewMode: (value: string) => void;
  dateRange: [string, string];
  setDateRange: (value: [string, string]) => void;
}

export default function MarketingFilterBar(props: Props) {
  const { channel, setChannel, viewMode, setViewMode, dateRange, setDateRange } = props;

  return (
    <div className="report-toolbar">
      <div className="report-toolbar__item">
        <label>Kênh</label>
        <SelectCustom id="marketingChannel" name="marketingChannel" options={CHANNEL_OPTIONS} fill value={channel} onChange={(option) => setChannel(option.value)} />
      </div>

      <div className="report-toolbar__item">
        <label>Chế độ xem</label>
        <SelectCustom id="marketingView" name="marketingView" options={VIEW_OPTIONS} fill value={viewMode} onChange={(option) => setViewMode(option.value)} />
      </div>

      <div className="report-toolbar__item report-toolbar__item--date">
        <label>Khoảng thời gian</label>
        <DatePickerCustom value={dateRange} onChange={(range) => setDateRange(range)} placeholder="Chọn khoảng ngày..." />
      </div>
    </div>
  );
}
