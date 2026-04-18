interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange?: (n: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50, 100] }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        fontSize: 12,
        color: "var(--slate-600)",
      }}
    >
      <div>
        Hiển thị <strong>{from}</strong>–<strong>{to}</strong> / {total}
      </div>

      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {onPageSizeChange ? (
          <select
            className="select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{ width: "auto", marginRight: 10, padding: "4px 8px", fontSize: 12 }}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        ) : null}

        <button type="button" className="btn sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          ← Trước
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} style={{ padding: "0 6px", color: "var(--slate-400)" }}>
              …
            </span>
          ) : (
            <button
              key={i}
              type="button"
              className={`btn sm ${p === page ? "primary" : ""}`}
              onClick={() => onPageChange(p as number)}
              style={{ minWidth: 28, justifyContent: "center" }}
            >
              {p}
            </button>
          )
        )}
        <button type="button" className="btn sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          Sau →
        </button>
      </div>
    </div>
  );
}
