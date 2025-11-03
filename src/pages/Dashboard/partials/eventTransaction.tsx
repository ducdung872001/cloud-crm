import React, { useState } from "react";
import { eventTransactionDataFake, IEventTransaction } from "model/dashboard/DashboardModel";
import CustomScrollbar from "components/customScrollbar";

const eventType = {
  sale: "Bán hàng cho khách hàng",
  warehousing: "Nhập hàng từ nhà cung cấp",
  order: "Mua hàng từ nhà cung cấp",
  customer_return: "Khách hàng trả hàng",
  return_supplier: "Trả hàng nhà cung cấp",
};
interface EventTransactionProps {
  classNames?: string;
}

export default function EventTransaction(props: EventTransactionProps) {
  const { classNames } = props;
  const [totalInvoice] = useState<number>(792);
  const [eventTransaction] = useState<IEventTransaction[]>(eventTransactionDataFake);

  return (
    <div className={`card-box event-transaction${classNames ? ` ${classNames}` : ""}`}>
      <div className="title d-flex align-items-start justify-content-between">
        <h2>Lịch sử giao dịch</h2>
      </div>
      <span className="total-invoice">
        Tổng hóa đơn: <strong>{totalInvoice}</strong>
      </span>
      <CustomScrollbar width="100%" height={388} autoHide={false}>
        <ul className="d-flex flex-column">
          {eventTransaction.map((e, index) => (
            <li key={index} className="d-flex align-items-start">
              <span className={`type type-${["sale", "return_supplier"].includes(e.type) ? "in" : "out"}`}></span>
              <div className="info">
                <h3>{e.received}</h3>
                <span>{eventType[e.type]}</span>
                <time>{e.created_at}</time>
              </div>
            </li>
          ))}
        </ul>
      </CustomScrollbar>
    </div>
  );
}
