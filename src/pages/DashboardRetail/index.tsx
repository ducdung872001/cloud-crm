import React, { useState } from "react";
import "./index.scss";
import Icon from "components/icon";
import { formatCurrency } from "utils/common";
import Shortcuts from "./partials/Shortcut";
import HistoryTransaction from "./partials/Transaction";

export default function DashboardRetail() {
  const [totalSum, setTotalSum] = useState({
    revenue: 0,
    income: 0,
    expense: 0,
    debt: 0,
  });
  const [activeIndexPrev, setActiveIndexPrev] = useState<number>(null);

  const dataPreview = [
    {
      icon: <Icon name="MoneyFill" />,
      name: "Doanh thu",
      totalMoney: totalSum.revenue,
      type: "revenue",
    },
    {
      icon: <Icon name="Expense" />,
      name: "Chi phí",
      totalMoney: totalSum.expense,
      type: "expense",
    },
    {
      icon: <Icon name="ReceiveMoney" />,
      name: "Lợi nhuận",
      totalMoney: totalSum.income,
      type: "income",
    },
    {
      icon: <Icon name="Dollar" />,
      name: "Công nợ",
      totalMoney: totalSum.debt,
      type: "debt",
    },
  ];
  return (
    <div className="dashboard-retail">
      <div className="border-section search-bar">Trung tâm điều khiển</div>
      <div className="border-section section metrics">
        <div className="box__view--total">
          {dataPreview.map((item, idx) => {
            return (
              <div
                key={idx}
                className={`item item__${item.type}`}
                onClick={() => {
                  // handClickPrev(item.type, idx);
                }}
              >
                <div className={`${activeIndexPrev == idx ? "active__icon" : "un_active--icon"}`}>
                  <Icon name="CheckedCircle" />
                </div>
                <div className="__top">
                  {item.icon}
                  <span>{`${item.name} (VNĐ)`}</span>
                </div>
                <div className="__bottom">{formatCurrency(item.totalMoney || "0", ".", "")}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-section section shortcuts">
        <Shortcuts />
      </div>
      <div className="border-section section notifications">
        <HistoryTransaction />
      </div>
      <div className="border-section section insights">Nhận định</div>
    </div>
  );
}
