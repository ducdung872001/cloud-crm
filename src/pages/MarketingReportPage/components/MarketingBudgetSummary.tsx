import React from "react";
import { formatCurrency } from "reborn-util";
import { CHANNEL_COLORS } from "../mockData";
import type { ChannelReport } from "../mockData";

interface Props {
  channels: ChannelReport[];
  totalSpend: number;
}

export default function MarketingBudgetSummary({ channels, totalSpend }: Props) {
  return (
    <div className="report-panel">
      <div className="report-panel__header">
        <div className="report-panel__title">Tóm tắt ngân sách</div>
        <div className="report-panel__sub">Phân bổ chi phí theo kênh</div>
      </div>
      <div className="channel-budget-list">
        {channels.map((item, index) => {
          const percentage = totalSpend ? Math.round((item.spend / totalSpend) * 100) : 0;
          return (
            <div key={item.channel} className="channel-budget-item">
              <div className="channel-budget-item__row">
                <strong>{item.channel}</strong>
                <span>{formatCurrency(item.spend)} đ</span>
              </div>
              <div className="channel-budget-item__bar">
                <div
                  className="channel-budget-item__fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
                  }}
                />
              </div>
              <div className="channel-budget-item__meta">
                <span>{percentage}% ngân sách</span>
                <span>{item.conversions} chuyển đổi</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
