import type { ReactNode } from "react";

interface Action {
  label: string;
  ico?: string;
  onClick: () => void;
  kind?: "default" | "primary" | "danger";
}

interface Props {
  count: number;
  total?: number;
  actions: Action[];
  onClear: () => void;
  extra?: ReactNode;
}

export default function BulkActionBar({ count, total, actions, onClear, extra }: Props) {
  if (count === 0) return null;

  return (
    <div
      style={{
        position: "sticky",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: "fit-content",
        margin: "16px auto 0",
        background: "var(--navy-900)",
        color: "#fff",
        borderRadius: 12,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "var(--shadow-lg)",
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingRight: 12,
          borderRight: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <span
          style={{
            background: "var(--teal-500)",
            color: "var(--navy-900)",
            fontWeight: 700,
            fontSize: 12,
            padding: "2px 8px",
            borderRadius: 10,
          }}
        >
          {count}
        </span>
        <span style={{ fontSize: 12 }}>đã chọn{total ? ` / ${total}` : ""}</span>
      </div>

      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={a.onClick}
          style={{
            background: a.kind === "primary" ? "var(--teal-500)" : a.kind === "danger" ? "var(--rose-500)" : "rgba(255,255,255,0.1)",
            color: a.kind === "primary" ? "var(--navy-900)" : a.kind === "danger" ? "#fff" : "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {a.ico ? <span>{a.ico}</span> : null}
          {a.label}
        </button>
      ))}

      {extra}

      <button
        type="button"
        onClick={onClear}
        style={{
          background: "none",
          border: "none",
          color: "var(--slate-400)",
          cursor: "pointer",
          padding: "4px 8px",
          fontSize: 16,
        }}
        title="Bỏ chọn tất cả"
      >
        ✕
      </button>
    </div>
  );
}
