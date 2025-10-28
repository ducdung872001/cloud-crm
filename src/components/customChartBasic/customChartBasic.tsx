import React from "react";
import { formatCurrency } from "reborn-util";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import "./customChartBasic.scss";

interface ICustomChartBasicProps {
  totalMax: number;
  lstData: any[];
  isLoading: boolean;
  nameNotification: string;
}

export default function CustomChartBasic(props: ICustomChartBasicProps) {
  const { totalMax, lstData, isLoading, nameNotification } = props;

  return (
    <div className="custom__chart--basic">
      <div className="lst-data">
        {!isLoading && lstData && lstData.length > 0 ? (
          lstData.map((item, idx) => {
            return (
              <div key={idx} className={`data-item ${lstData.length == 2 ? "two-item" : lstData.length > 3 ? "three-item" : ""}`}>
                <div className="__left">
                  <span className="name">{item?.name}</span>
                </div>
                <div className="__right">
                  <div style={{ width: `${item.amount !== totalMax ? (item.amount / totalMax) * 100 : "100"}%` }} className="calculator-percent" />
                  <span className="amount">{formatCurrency(item.amount)}</span>
                </div>
              </div>
            );
          })
        ) : isLoading ? (
          <Loading />
        ) : (
          <SystemNotification description={<span>Hiện tại bạn chưa có top {nameNotification} nào!</span>} type="no-item" />
        )}
      </div>
    </div>
  );
}
