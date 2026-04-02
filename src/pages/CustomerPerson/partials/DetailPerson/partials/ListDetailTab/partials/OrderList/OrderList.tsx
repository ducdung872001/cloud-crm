import React, { useState } from "react";
import ListBill from "./partials/ListBill/ListBill";
import PurchasedProduct from "./partials/PurchasedProduct/PurchasedProduct";
import PurchasedService from "./partials/PurchasedService/PurchasedService";
import "./OrderList.scss";

export default function OrderList() {
  const [tab, setTab] = useState<string>("tab_one");

  const listTabItems = [
    { title: "Hóa đơn",           is_active: "tab_one"   },
    { title: "Sản phẩm đã mua",   is_active: "tab_three" },
    { title: "Dịch vụ đã mua",    is_active: "tab_four"  },
  ];

  return (
    <div className="wrapper__order--person">
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <ul className="action__option--title">
            {listTabItems.map((item, idx) => (
              <li
                key={idx}
                className={item.is_active === tab ? "active" : ""}
                onClick={(e) => {
                  e && e.preventDefault();
                  setTab(item.is_active);
                }}
              >
                {item.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="details__tab--choose">
          {tab === "tab_one"   && <ListBill tab={tab} />}
          {tab === "tab_three" && <PurchasedProduct tab={tab} />}
          {tab === "tab_four"  && <PurchasedService tab={tab} />}
        </div>
      </div>
    </div>
  );
}