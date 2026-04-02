import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { IListTabDetailProps } from "model/customer/PropsModel";
import WarrantyPersonList from "./partials/WarrantyPersonList/WarrantyPersonList";
import TicketPersonList from "./partials/TicketPersonList/TicketPersonList";
import OrderList from "./partials/OrderList/OrderList";
import InteractList from "./partials/InteractList";
import "./ListDetailTab.scss";

export default function ListDetailTab(props: IListTabDetailProps) {
  const { data } = props;
  const { type } = useParams();

  const [tab, setTab] = useState<string>("tab_invoice");

  const listTabItems = [
    { title: "Hóa đơn & Giao dịch", key: "tab_invoice" },
    { title: "Lịch sử tương tác",    key: "tab_interact" },
    { title: "Bảo hành",             key: "tab_warranty" },
    { title: "Hỗ trợ",               key: "tab_ticket"   },
  ];

  return (
    <div className="wrapper-tab retail-wrapper-tab">
      <div className="list-tab">
        <ul className="action__option--title">
          {listTabItems.map((item) => (
            <li
              key={item.key}
              className={item.key === tab ? "active" : ""}
              onClick={() => setTab(item.key)}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </div>

      <div className="details-tab">
        {tab === "tab_invoice"  && <OrderList />}
        {tab === "tab_interact" && <InteractList data={data} />}
        {tab === "tab_warranty" && <WarrantyPersonList idCustomer={data.id} />}
        {tab === "tab_ticket"   && <TicketPersonList   idCustomer={data.id} />}
      </div>
    </div>
  );
}