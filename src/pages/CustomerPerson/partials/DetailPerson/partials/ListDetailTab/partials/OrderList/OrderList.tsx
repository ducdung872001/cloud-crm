import React, { useState } from "react";
import ListBill from "./partials/ListBill/ListBill";
import ContractCustomer from "./partials/ContractCustomer";
import ServiceCardPurchased from "./partials/ServiceCardPurchased/ServiceCardPurchased";
import PurchasedProduct from "./partials/PurchasedProduct/PurchasedProduct";
import PurchasedService from "./partials/PurchasedService/PurchasedService";
import "./OrderList.scss";
import { getDomain } from "reborn-util";

export default function OrderList() {
  
  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNTECO = sourceDomain.includes("tnteco");

  const [tab, setTab] = useState<string>(checkSubdomainTNTECO ? "tab_five" : "tab_one");

  const listTabItems = [

    ...(checkSubdomainTNTECO ? [] : [
      {
        title: "Hóa đơn",
        is_active: "tab_one",
      },
      {
        title: "Thẻ dịch vụ đã mua",
        is_active: "tab_two",
      },
      {
        title: "Sản phẩm đã mua",
        is_active: "tab_three",
      },
      {
        title: "Dịch vụ đã mua",
        is_active: "tab_four",
      },
    ]),
    {
      title: "Hợp đồng",
      is_active: "tab_five",
    },
  ];

  return (
    <div className="wrapper__order--person">
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <ul className="action__option--title">
            {listTabItems.map((item, idx) => {
              return (
                <li
                  key={idx}
                  className={item.is_active == tab ? "active" : ""}
                  onClick={(e) => {
                    e && e.preventDefault();
                    setTab(item.is_active);
                  }}
                >
                  {item.title}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="details__tab--choose">
          {tab === "tab_one" ? (
            <ListBill tab={tab} />
          ) : tab == "tab_two" ? (
            <ServiceCardPurchased tab={tab} />
          ) : tab == "tab_three" ? (
            <PurchasedProduct tab={tab} />
          ) : tab === "tab_four" ? (
            <PurchasedService tab={tab} />
          ) : (
            <ContractCustomer tab={tab} />
          )}
        </div>
      </div>
    </div>
  );
}
