import { useState, type ReactNode } from "react";
import { Input } from "./Field";

interface Facet {
  key: string;
  label: string;
  options: { value: string; label: string; count?: number }[];
  multi?: boolean;
}

interface Props {
  search?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  facets?: Facet[];
  values?: Record<string, string[]>;
  onChange?: (v: Record<string, string[]>) => void;
  right?: ReactNode;
}

export default function ListFilterPanel({ search, onSearch, searchPlaceholder = "⌕ Tìm kiếm...", facets = [], values = {}, onChange, right }: Props) {
  const [local, setLocal] = useState<Record<string, string[]>>(values);

  const toggle = (facet: string, value: string, multi: boolean) => {
    setLocal((prev) => {
      const current = prev[facet] ?? [];
      const next = multi
        ? current.includes(value)
          ? current.filter((x) => x !== value)
          : [...current, value]
        : current.includes(value)
          ? []
          : [value];
      const result = { ...prev, [facet]: next };
      onChange?.(result);
      return result;
    });
  };

  const activeCount = Object.values(local).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="filter-bar">
      {onSearch ? (
        <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={searchPlaceholder} style={{ maxWidth: 320 }} />
      ) : null}

      {facets.map((f) => (
        <div key={f.key} style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span
            style={{
              fontSize: 11,
              color: "var(--slate-500)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
              marginRight: 4,
            }}
          >
            {f.label}:
          </span>
          {f.options.map((o) => {
            const active = (local[f.key] ?? []).includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                className={`filter-chip ${active ? "active" : ""}`}
                onClick={() => toggle(f.key, o.value, f.multi ?? false)}
              >
                {o.label}
                {o.count != null ? <span style={{ color: "var(--slate-400)", fontSize: 10 }}>({o.count})</span> : null}
              </button>
            );
          })}
        </div>
      ))}

      {activeCount > 0 ? (
        <button
          type="button"
          className="btn sm"
          onClick={() => {
            setLocal({});
            onChange?.({});
          }}
        >
          Clear ({activeCount})
        </button>
      ) : null}

      {right ? <div style={{ marginLeft: "auto" }}>{right}</div> : null}
    </div>
  );
}
