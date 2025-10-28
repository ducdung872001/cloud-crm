import React, { useState } from "react";
import "./OrderPartnerList.scss";
import PartnerContract from "./PartnerContract/PartnerContract";

export default function OrderPartnerList() {
  const [tab, setTab] = useState<string>("tab_one");

  const listTabItems = [
    
    {
      title: "Hợp đồng",
      is_active: "tab_one",
    },
  ];

  return (
    <div className="wrapper__order--partner">
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
            <PartnerContract tab={tab} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
