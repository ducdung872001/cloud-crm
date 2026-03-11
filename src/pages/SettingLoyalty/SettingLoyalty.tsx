import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./SettingLoyalty.scss";
import { getDomain } from "reborn-util";
import SettingLoyaltyList from "@/pages/SettingLoyaltyList";
import LoyaltySegment from "@/pages/LoyaltySegment";
import LoyaltyReward from "@/pages/LoyaltyReward";

export default function SettingLoyalty() {
  document.title = "Cài đặt hệ thống tích điểm";

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNEX = sourceDomain.includes("tnex");

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategoryCustomer = [
    {
      title: "Cài đặt chương trình khách hàng thân thiết",
      is_tab: "tab_one",
    },
    {
      title: "Danh sách phần thưởng",
      is_tab: "tab_two",
    },
    {
      title: "Cài đặt hạng hội viên",
      is_tab: "tab_three",
    },
  ];

  return (
    <div className="page-setting-customer">
      {!isDetailCategory && <TitleAction title="Cài đặt hệ thống tích điểm" />}
      <div className="card-box d-flex flex-column">
        {!isDetailCategory && (
          <ul className="menu">
            {menuCategoryCustomer.map((item, idx) => {
              return (
                <li
                  key={idx}
                  className="menu__category"
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(item.is_tab);
                    setIsDetailCategory(true);
                  }}
                >
                  {item.title}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {isDetailCategory && tab === "tab_one" ? (
        <SettingLoyaltyList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <LoyaltyReward
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <LoyaltySegment
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}
