import React, { useState } from "react";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import WarrantyPersonList from "./partials/WarrantyPersonList/WarrantyPersonList";
import TicketPersonList from "./partials/TicketPersonList/TicketPersonList";
import OrderList from "./partials/OrderList/OrderList";
import InteractList from "./partials/InteractList";
import "./ListDetailTab.scss";

interface InvoiceStats {
  paid: number;
  debt: number;
  invoiceCount: number;
  completedCount: number;
  lastBoughtDate: string | null;
}

interface ListDetailTabProps {
  data: ICustomerResponse;
  onInvoiceStatsLoaded?: (stats: InvoiceStats) => void;
}

export default function ListDetailTab({ data, onInvoiceStatsLoaded }: ListDetailTabProps) {
  const [tab, setTab] = useState<string>("tab_invoice");

  const listTabItems = [
    { title: "Hóa đơn & Giao dịch", key: "tab_invoice"  },
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
        {tab === "tab_invoice"  && (
          <OrderList onInvoiceStatsLoaded={onInvoiceStatsLoaded} />
        )}
        {tab === "tab_interact" && <InteractList data={data} />}
        {tab === "tab_warranty" && <WarrantyPersonList idCustomer={data.id} />}
        {tab === "tab_ticket"   && <TicketPersonList   idCustomer={data.id} />}
      </div>
    </div>
  );
}