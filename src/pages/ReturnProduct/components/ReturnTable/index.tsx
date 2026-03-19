import React from "react";
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
}

const STATUS_MAP: Record<ReturnStatus, { label: string; cls: string }> = {
  done: { label: "Hoàn thành", cls: "rbadge--done" },
  pending: { label: "Chờ xử lý", cls: "rbadge--pending" },
  processing: { label: "Đang xử lý", cls: "rbadge--processing" },
  cancel: { label: "Đã hủy", cls: "rbadge--cancel" },
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
}) => {
  return (
    <div className="return-table-panel">
      {/* Panel header */}
      <div className="return-table-panel__header">
        <div className="return-table-panel__title">Danh sách phiếu trả / đổi hàng</div>
        <div className="return-table-panel__toolbar">
          <select className="rfilter" value={filterType} onChange={(e) => onFilterType(e.target.value)}>
            <option value="">Tất cả loại</option>
            <option value="return">Trả hàng</option>
            <option value="exchange">Đổi hàng</option>
          </select>

          <select className="rfilter" value={filterStatus} onChange={(e) => onFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="done">Hoàn thành</option>
            <option value="cancel">Đã hủy</option>
          </select>

          <div className="rsearch-wrap">
            <span className="rsearch-wrap__icon">🔍</span>
            <input placeholder="Tìm mã phiếu, khách hàng..." value={search} onChange={(e) => onSearch(e.target.value)} />
          </div>

          <button className="btn btn--lime btn--sm" onClick={onCreateClick}>
            + Tạo phiếu
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="return-table-panel__tbl-wrap">
        <table className="rtbl">
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Thời gian</th>
              <th>Khách hàng</th>
              <th>Đơn gốc</th>
              <th>Loại</th>
              <th>Sản phẩm</th>
              <th>Tiền hoàn</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="rtbl__empty">
                    <span>📋</span>
                    <p>Không có phiếu nào phù hợp</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const st = STATUS_MAP[row.status];
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
                        {row.type === "return" ? "Trả hàng" : "Đổi hàng"}
                      </span>
                    </td>
                    <td className="rtbl__ellipsis" title={row.productSummary}>
                      {row.productSummary}
                    </td>
                    <td className={`rtbl__amount${row.refundAmount > 0 ? " rtbl__amount--pos" : ""}`}>{fmt(row.refundAmount)}</td>
                    <td>
                      <span className={`rbadge ${st.cls}`}>{st.label}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(row);
                        }}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReturnTable;
