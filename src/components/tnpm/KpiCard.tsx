import React from "react";

export interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon?: string;
  status?: string; // optional "ĐẠT"/"CHƯA ĐẠT" corner badge
}

/**
 * Standardized KPI card used across TNPM pages.
 * Renders a white card with colored left border, icon, value, label, optional sub.
 */
export const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, color, icon, status }) => (
  <div style={{
    background: "#fff",
    borderRadius: 10,
    padding: "14px 14px",
    boxShadow: "0 2px 8px rgba(0,0,0,.06)",
    borderLeft: `4px solid ${color}`,
    position: "relative",
  }}>
    {status && (
      <span style={{
        position: "absolute", top: 8, right: 8,
        fontSize: 9, padding: "2px 6px", borderRadius: 8,
        background: `${color}22`, color, fontWeight: 700,
      }}>
        {status}
      </span>
    )}
    {icon && <div style={{ fontSize: 16 }}>{icon}</div>}
    <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    <div style={{ fontSize: 11, color: "#1a1a2e", fontWeight: 500, marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 2 }}>{sub}</div>}
  </div>
);

export interface KpiRowProps {
  items: KpiCardProps[];
  columns?: number;
}

/**
 * Grid container for KPI cards. Default 5 columns, can override.
 */
export const KpiRow: React.FC<KpiRowProps> = ({ items, columns = 5 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 12, marginBottom: 20 }}>
    {items.map((item, i) => <KpiCard key={i} {...item} />)}
  </div>
);
