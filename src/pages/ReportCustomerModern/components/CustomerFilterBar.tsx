import React from "react";
import SelectCustom from "components/selectCustom/selectCustom";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import ReportFilterShell from "components/reportShared/ReportFilterShell";
import { formatDate, formatDateCustom } from "utils/dateUtils";

import { RANGE_OPTIONS, SOURCE_OPTIONS } from "../mockData";

interface Props {
  activeRange: string;
  setActiveRange: (value: string) => void;
  source: string;
  setSource: (value: string) => void;
  dateRange: [string, string];
  setDateRange: (value: [string, string]) => void;
}

export default function CustomerFilterBar(props: Props) {
  const { activeRange, setActiveRange, source, setSource, dateRange, setDateRange } = props;

  return (
    <ReportFilterShell className="report-topbar">
      <div className="report-topbar__left">
        <div className="report-topbar__title">Toàn cảnh khách hàng</div>
        <div className="report-topbar__subtitle">Cập nhật lúc {formatDateCustom(new Date(), "HH:mm")} · {formatDate(new Date())}</div>
      </div>

      <div className="report-topbar__filters">
        <div className="quick-range">
          {RANGE_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`quick-range__btn ${activeRange === item.id ? "active" : ""}`}
              onClick={() => setActiveRange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="report-topbar__select">
          <SelectCustom id="customerSourceModern" name="customerSourceModern" options={SOURCE_OPTIONS} fill value={source} onChange={(option) => setSource(option.value)} />
        </div>

        <div className="report-topbar__date">
          <DatePickerCustom value={dateRange} onChange={(range) => setDateRange(range)} placeholder="Chọn khoảng ngày..." />
        </div>
      </div>
    </ReportFilterShell>
  );
}
