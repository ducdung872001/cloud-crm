import React from "react";
import "./reportShared.scss";

interface ReportFilterShellProps {
  className?: string;
  children: React.ReactNode;
}

export default function ReportFilterShell({ className = "", children }: ReportFilterShellProps) {
  return <div className={`report-shared-filter-shell ${className}`.trim()}>{children}</div>;
}
