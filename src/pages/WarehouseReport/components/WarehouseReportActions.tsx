import React from "react";

interface Props {
  primary?: string;
  secondary?: string;
}

export default function WarehouseReportActions({ primary, secondary }: Props) {
  if (!primary && !secondary) return null;

  return (
    <div className="warehouse-report-actions">
      {secondary ? (
        <button className="btn" type="button">
          {secondary}
        </button>
      ) : null}
      {primary ? (
        <button className="btn btn-primary" type="button">
          {primary}
        </button>
      ) : null}
    </div>
  );
}
