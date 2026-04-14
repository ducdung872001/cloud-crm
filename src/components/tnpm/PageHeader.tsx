import React from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backLink?: { label: string; onClick: () => void };
}

/**
 * Standard page header used by TNPM pages.
 * Renders title + subtitle on the left, action buttons on the right.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, backLink }) => (
  <div className="page-header">
    <div>
      {backLink && (
        <button className="btn btn-outline" style={{ marginBottom: 8 }} onClick={backLink.onClick}>
          ← {backLink.label}
        </button>
      )}
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-sub">{subtitle}</p>}
    </div>
    {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
  </div>
);
