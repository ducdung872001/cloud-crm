import React, { useState } from "react";
import DetailInfoCIC from "./partials/DetailInfoCIC";
import LoanInformation from "./partials/LoanInformation";
import Tippy from "@tippyjs/react";
import Button from "components/button/button";
import Icon from "components/icon";

import "./index.scss";

export default function InfoCIC({ data }) {
  const [tab, setTab] = useState<string>("tab_one");
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  const listTabItems = [
    {
      title: "Các khoản vay tại các TCTD",
      is_active: "tab_one",
    }, 
    {
      title: "Thông tin khoản vay tại LPBank",
      is_active: "tab_two",
    },
  ];

  return (
    <div className={`page-content info__cic`}>
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
          <Tippy
            content={`${tab === "tab_one" ? "Thêm mới thông tin CIC" : "Thêm mới thông tin khoản vay tại Liên Việt"}`}
            delay={[100, 0]}
            animation="scale-extreme"
            placement="left"
          >
            <div className="add-item">
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

        <div className="details__tab--choose">
          {tab === "tab_one" ? (
            <DetailInfoCIC
              data={data}
              onShow={showModalAdd}
              callBack={(isShow) => {
                if (isShow) {
                  setShowModalAdd(true);
                } else {
                  setShowModalAdd(false);
                }
              }}
            />
          ) : (
            <LoanInformation
              data={data}
              onShow={showModalAdd}
              callBack={(isShow) => {
                if (isShow) {
                  setShowModalAdd(true);
                } else {
                  setShowModalAdd(false);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
