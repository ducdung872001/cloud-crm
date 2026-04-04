import React from "react";
import { useTranslation } from "react-i18next";
import { ReturnProduct, ReturnStatus, ReturnType } from "../../../../types/returnProduct";
import "./index.scss";

interface ReturnTableProps {
  data: ReturnProduct[];
  filterType: string;
  filterStatus: string;
  search: string;
  onFilterType: (v: string) => void;
  onFilterStatus: (v: string) => void;
  onSearch: (v: string) => void;
  onViewDetail: (item: ReturnProduct) => void;
  onCreateClick: () => void;
  /** Đang fetch data từ API */
  loading?: boolean;
  /** Tổng số bản ghi từ API (dùng để hiện "Tải thêm") */
  total?: number;
  /** Callback khi bấm "Tải thêm" */
  onLoadMore?: () => void;
}

const STATUS_KEYS: Record<ReturnStatus, { key: string; cls: string }> = {
  done:       { key: "pageReturnProduct.done",       cls: "rbadge--done" },
  pending:    { key: "pageReturnProduct.pending",    cls: "rbadge--pending" },
  processing: { key: "pageReturnProduct.processing", cls: "rbadge--processing" },
  cancel:     { key: "pageReturnProduct.cancel",     cls: "rbadge--cancel" },
};

const fmt = (n: number) => (n > 0 ? n.toLocaleString("vi") + " ₫" : "–");

const ReturnTable: React.FC<ReturnTableProps> = ({
  data,
  filterType,
  filterStatus,
  search,
  onFilterType,
  onFilterStatus,
  onSearch,
  onViewDetail,
  onCreateClick,
  loading = false,
  total,
  onLoadMore,
}) => {
  const { t } = useTranslation();
  const hasMore = total !== undefined && data.length < total;

  return (
    <div className="return-table-panel">
      {/* Panel header */}
      <div className="return-table-panel__header">
        <div className="return-table-panel__title">
          {t("pageReturnProduct.listTitle")}
          {total !== undefined && (
            <span className="return-table-panel__count"> ({total})</span>
          )}
        </div>

        <div className="return-table-panel__toolbar">
          <select className="rfilter" value={filterType} onChange={(e) => onFilterType(e.target.value)}>
            <option value="">{t("pageReturnProduct.allTypes")}</option>
            <option value="return">{t("pageReturnProduct.returnType")}</option>
            <option value="exchange">{t("pageReturnProduct.exchangeType")}</option>
          </select>

          <select className="rfilter" value={filterStatus} onChange={(e) => onFilterStatus(e.target.value)}>
            <option value="">{t("pageReturnProduct.allStatus")}</option>
            <option value="pending">{t("pageReturnProduct.pending")}</option>
            <option value="processing">{t("pageReturnProduct.processing")}</option>
            <option value="done">{t("pageReturnProduct.done")}</option>
            <option value="cancel">{t("pageReturnProduct.cancel")}</option>
          </select>

          <div className="rsearch-wrap">
            <span className="rsearch-wrap__icon">🔍</span>
            <input
              placeholder={t("pageReturnProduct.searchPlaceholder")}
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          <button className="btn btn--lime btn--sm" onClick={onCreateClick}>
            + {t("pageReturnProduct.createTicket")}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="return-table-panel__tbl-wrap">
        <table className="rtbl">
          <thead>
            <tr>
              <th>{t("pageReturnProduct.colCode")}</th>
              <th>{t("pageReturnProduct.colTime")}</th>
              <th>{t("pageReturnProduct.colCustomer")}</th>
              <th>{t("pageReturnProduct.colOriginalOrder")}</th>
              <th>{t("pageReturnProduct.colType")}</th>
              <th>{t("pageReturnProduct.colProduct")}</th>
              <th style={{ textAlign: "right" }}>{t("pageReturnProduct.colRefund")}</th>
              <th>{t("pageReturnProduct.colStatus")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && data.length === 0 ? (
              /* Skeleton rows khi chưa có data */
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`} className="rtbl__skeleton">
                  {Array.from({ length: 9 }).map((__, j) => (
                    <td key={j}>
                      <div className="rtbl__skeleton-bar" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="rtbl__empty">
                    <span>📋</span>
                    <p>{t("pageReturnProduct.noRecords")}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const st = STATUS_KEYS[row.status];
                return (
                  <tr key={row.id} onClick={() => onViewDetail(row)}>
                    <td>
                      <span className="rtbl__code-link">{row.code}</span>
                    </td>
                    <td className="rtbl__muted">{row.time}</td>
                    <td className="rtbl__bold">{row.customerName}</td>
                    <td className="rtbl__muted">{row.originalOrderCode}</td>
                    <td>
                      <span className={`rtype-dot rtype-dot--${row.type}`}>
                        <span className="rtype-dot__dot" />
                        {row.type === "return" ? t("pageReturnProduct.returnType") : t("pageReturnProduct.exchangeType")}
                      </span>
                    </td>
                    <td className="rtbl__ellipsis" title={row.productSummary}>
                      {row.productSummary}
                    </td>
                    <td className={`rtbl__amount${row.refundAmount > 0 ? " rtbl__amount--pos" : ""}`}>
                      {fmt(row.refundAmount)}
                    </td>
                    <td>
                      <span className={`rbadge ${st.cls}`}>{t(st.key)}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(row);
                        }}
                      >
                        {t("common.view")}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="return-table-panel__footer">
          <button
            className="btn btn--outline btn--sm"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? t("common.loading") : `${t("common.seeMore")} (${total - data.length} ${t("pageReturnProduct.loadMoreRemaining")})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReturnTable;