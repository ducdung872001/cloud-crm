import React from "react";
import moment from "moment";
import Icon from "components/icon";
import { formatCurrency } from "reborn-util";
import { RecentTransactionsCardProps } from "./types";

export default function InsightCard(props: RecentTransactionsCardProps) {
  const {
    insightTab,
    isLoading,
    isTabSwitching,
    tableMeta,
    displayTabType,
    panelRefresh,
    panelRefreshing,
    recentTransactions,
    recentPage,
    recentTotalPages,
    salesChannelAnalysis,
    onChangeInsightTab,
    onTriggerPanelRefresh,
    onRecentPageChange,
    getTransactionStatus,
  } = props;

  return (
    <div className="finance-report__card">
      <div className={`finance-report__card-body finance-report__card-body--enter${isTabSwitching ? " is-content-loading" : ""}`}>
        <div className="finance-report__table-head">
          <div className="finance-report__panel-tabs">
            <button className={`finance-report__panel-tab${insightTab === "transactions" ? " active" : ""}`} onClick={() => onChangeInsightTab("transactions")}>
              Giao dịch gần đây
            </button>
            <button className={`finance-report__panel-tab${insightTab === "channels" ? " active" : ""}`} onClick={() => onChangeInsightTab("channels")}>
              Kênh bán hàng
            </button>
          </div>
          <div className="finance-report__table-actions">
            <span className="finance-report__table-meta">{tableMeta}</span>
            <button
              className={`finance-report__reset-btn${
                insightTab === "transactions" ? (panelRefreshing.transactions ? " is-spinning" : "") : panelRefreshing.channels ? " is-spinning" : ""
              }`}
              type="button"
              onClick={() => {
                if (insightTab === "transactions") {
                  onRecentPageChange(() => 1);
                  onTriggerPanelRefresh("transactions");
                } else {
                  onTriggerPanelRefresh("channels");
                }
              }}
              title="Reset dữ liệu"
            >
              <Icon name="Refresh" />
            </button>
          </div>
        </div>
        {insightTab === "transactions" ? (
          <div key={`transactions-${displayTabType}-${panelRefresh.transactions}`} className="finance-report__content-enter">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Nội dung</th>
                    <th>Loại</th>
                    <th className="text-right">Số tiền</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && !isTabSwitching ? (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : recentTransactions.length > 0 ? (
                    recentTransactions.map((item) => {
                      const status = getTransactionStatus(item);
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="finance-report__txn-main">{item.note || item.categoryName || "Giao dịch tài chính"}</div>
                            <div className="finance-report__txn-sub">{item.empName || "Nhân viên thực hiện"}</div>
                          </td>
                          <td>{item.categoryName || (item.type === 1 ? "Thu" : "Chi")}</td>
                          <td className={`text-right ${+item.type === 1 ? "val-green" : "val-red"}`}>
                            {`${+item.type === 1 ? "+" : "-"}${formatCurrency(item.amount || 0)}`}
                          </td>
                          <td>{moment(item.transDate).format("DD/MM/YYYY HH:mm")}</td>
                          <td>
                            <span className={`badge ${status.className}`}>{status.label}</span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Chưa có giao dịch gần đây.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="finance-report__pager">
              <button className="finance-report__pager-btn" disabled={recentPage <= 1} onClick={() => onRecentPageChange((prev) => Math.max(1, prev - 1))}>
                Trước
              </button>
              <span className="finance-report__pager-info">
                Trang {recentPage}/{recentTotalPages}
              </span>
              <button
                className="finance-report__pager-btn"
                disabled={recentPage >= recentTotalPages}
                onClick={() => onRecentPageChange((prev) => Math.min(recentTotalPages, prev + 1))}
              >
                Sau
              </button>
            </div>
          </div>
        ) : (
          <div key={`channels-${displayTabType}-${panelRefresh.channels}`} className="finance-report__content-enter">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Kênh bán hàng</th>
                    <th className="text-right">Số đơn</th>
                    <th className="text-right">Doanh thu</th>
                    <th className="text-right">Giá trị TB</th>
                    <th className="text-right">Tỷ trọng</th>
                    <th>Xu hướng</th>
                  </tr>
                </thead>
                <tbody>
                  {salesChannelAnalysis.map((item) => (
                    <tr key={item.label}>
                      <td>{item.label}</td>
                      <td className="text-right">{item.orders}</td>
                      <td className="text-right val-green">{formatCurrency(item.revenue)}</td>
                      <td className="text-right">{formatCurrency(item.avgOrder)}</td>
                      <td className="text-right">{item.share}%</td>
                      <td>
                        <span className={`badge ${item.trend === "Tăng mạnh" ? "badge-green" : item.trend === "Theo dõi" ? "badge-amber" : "badge-blue"}`}>
                          {item.trend}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
