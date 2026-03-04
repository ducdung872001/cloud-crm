import React, { useState } from "react";
import CustomerEmailList from "./partials/CustomerEmailList/CustomerEmailList";
import CustomerSMSList from "./partials/CustomerSMSList/CustomerSMSList";
import CustomerZaloList from "./partials/CustomerZaloList/CustomerZaloList";
import CustomerInteraction from "./partials/CustomerInteraction/CustomerInteraction";
import Tippy from "@tippyjs/react";
import Button from "components/button/button";
import Icon from "components/icon";
import "./index.scss";

export default function InteractList(props) {
  const { data } = props;

  const [tab, setTab] = useState<string>("tab_one");
  const [title, setTitle] = useState<string>("Gửi email");
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  const listTabItems = [
    {
      title: "Tổng quan",
      is_active: "tab_one",
    },
    {
      title: "Gửi Email",
      is_active: "tab_two",
    },
    {
      title: "Gửi SMS",
      is_active: "tab_three",
    },
    {
      title: "Gửi Zalo",
      is_active: "tab_four",
    },
  ];

  return (
    <div className="wrapper__interact--person">
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="action-header--left">
            <ul className="action__option--title">
              {listTabItems.map((item, idx) => {
                return (
                  <li
                    key={idx}
                    className={item.is_active == tab ? "active" : ""}
                    onClick={(e) => {
                      e && e.preventDefault();
                      setTitle(item.title);
                      setTab(item.is_active);
                    }}
                  >
                    {item.title}
                  </li>
                );
              })}
            </ul>
          </div>

          {tab !== "tab_one" && (
            <div className="action-header--right">
              <Tippy content={title} delay={[100, 0]} animation="scale-extreme">
                <div className="add-email">
                  <Button
                    color="success"
                    onClick={() => {
                      setShowModalAdd(true);
                    }}
                  >
                    <Icon name="PlusCircle" />
                  </Button>
                </div>
              </Tippy>
            </div>
          )}
        </div>

        <div className="details__tab--choose">
          {tab === "tab_one" ? (
            <CustomerInteraction idCustomer={data.id} />
          ) : tab == "tab_two" ? (
            <CustomerEmailList dataCustomer={data} onShow={showModalAdd} callBack={() => setShowModalAdd(false)} />
          ) : tab == "tab_three" ? (
            <CustomerSMSList idCustomer={data.id} onShow={showModalAdd} callBack={() => setShowModalAdd(false)} />
          ) : (
            <CustomerZaloList idCustomer={data.id} customerName={data.name} onShow={showModalAdd} callBack={() => setShowModalAdd(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
