import React from "react";

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

export interface TabBarProps<T extends string = string> {
  tabs: TabItem[];
  active: T;
  onChange: (key: T) => void;
  rightSlot?: React.ReactNode;
  rounded?: boolean; // apply "12px 12px 0 0" border radius (container-like)
}

/**
 * Reusable tab bar — pattern: white background, bottom border,
 * active tab has 2px blue underline. rightSlot can hold filter inputs.
 */
export function TabBar<T extends string = string>({ tabs, active, onChange, rightSlot, rounded = true }: TabBarProps<T>) {
  return (
    <div style={{
      display: "flex", gap: 0,
      borderBottom: "1px solid #f0f0f0",
      background: "#fff",
      borderRadius: rounded ? "12px 12px 0 0" : 0,
      padding: "0 16px",
      flexWrap: "wrap",
    }}>
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key as T)}
            style={{
              padding: "12px 20px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#1890ff" : "#8c8c8c",
              borderBottom: isActive ? "2px solid #1890ff" : "2px solid transparent",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
            {t.count !== undefined && <span style={{ opacity: 0.7, marginLeft: 4 }}>({t.count})</span>}
          </button>
        );
      })}
      {rightSlot && (
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", padding: "8px 0" }}>
          {rightSlot}
        </div>
      )}
    </div>
  );
}
