import React from "react";
import { formatCurrency } from "reborn-util";
import ReportPanel from "components/reportShared/ReportPanel";
import { STATUS_COLORS, STATUS_LABELS } from "../mockData";
import type { CampaignReport } from "../mockData";

interface Props {
  campaigns: CampaignReport[];
}

export default function MarketingCampaignTable({ campaigns }: Props) {
  return (
    <ReportPanel
      className="report-table-card"
      headerClassName="report-table-card__header"
      bodyClassName="report-table-wrap"
      titleClassName="report-panel__title"
      subtitleClassName="report-panel__sub"
      title="Bảng chiến dịch marketing"
      subtitle="Theo dõi ngân sách, lead và doanh thu từng chiến dịch"
    >
        <table className="report-table">
          <thead>
            <tr>
              <th>Chiến dịch</th>
              <th>Kênh</th>
              <th>Phụ trách</th>
              <th className="text-right">Chi phí</th>
              <th className="text-right">Lead</th>
              <th className="text-right">Chuyển đổi</th>
              <th className="text-right">Doanh thu</th>
              <th className="text-right">ROAS</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((item) => {
              const itemRoas = item.spend ? (item.revenue / item.spend).toFixed(2) : "0.00";
              return (
                <tr key={item.name}>
                  <td className="font-semibold">{item.name}</td>
                  <td>{item.channel}</td>
                  <td>{item.owner}</td>
                  <td className="text-right">{formatCurrency(item.spend)} đ</td>
                  <td className="text-right">{item.leads}</td>
                  <td className="text-right">{item.conversions}</td>
                  <td className="text-right">{formatCurrency(item.revenue)} đ</td>
                  <td className="text-right">{itemRoas}x</td>
                  <td>
                    <span
                      className={`report-status report-status--${item.status}`}
                      style={{ "--status-color": STATUS_COLORS[item.status] } as React.CSSProperties}
                    >
                      {STATUS_LABELS[item.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
    </ReportPanel>
  );
}
