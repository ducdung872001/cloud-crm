import React from "react";

interface Props {
  leftLabel?: string;
  leftButtons?: string[];
  middleLabel?: string;
  middleButtons?: string[];
  selects?: string[];
  actionLabel?: string;
}

export default function WarehouseReportFilterBar(props: Props) {
  const { leftLabel, leftButtons, middleLabel, middleButtons, selects, actionLabel } = props;

  return (
    <div className="filter-bar">
      {leftLabel ? <span className="filter-label">{leftLabel}</span> : null}
      {leftButtons?.length ? (
        <div className="filter-group">
          {leftButtons.map((item, index) => (
            <button key={item} className={`f-btn ${index === 0 ? "on" : ""}`} type="button">
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {middleLabel || middleButtons?.length || selects?.length ? <div className="filter-sep" /> : null}

      {middleLabel ? <span className="filter-label">{middleLabel}</span> : null}
      {middleButtons?.length ? (
        <div className="filter-group">
          {middleButtons.map((item, index) => (
            <button key={item} className={`f-btn ${index === 0 ? "on" : ""}`} type="button">
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {selects?.map((item) => (
        <select key={item} className="f-select" defaultValue={item}>
          <option>{item}</option>
        </select>
      ))}

      <div className="filter-spacer" />

      {actionLabel ? (
        <button className="btn btn-primary" type="button">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
