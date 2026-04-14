import React from "react";

export interface StatusBadgeProps {
  label: string;
  color: string;  // accepts HEX, will add 22 suffix for background
  icon?: string;
  style?: React.CSSProperties;
}

/**
 * Colored pill-shaped status badge used throughout TNPM pages.
 * Pattern: light background (color + 22 alpha), bold text in color.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, color, icon, style }) => (
  <span
    className="status-badge"
    style={{
      background: `${color}22`,
      color,
      ...style,
    }}
  >
    {icon && `${icon} `}{label}
  </span>
);
