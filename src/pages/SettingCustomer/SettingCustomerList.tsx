import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import CustomerCardList from "./partials/CustomerCard/CustomerCardList";
import CustomerResourcesList from "./partials/CustomerResources/CustomerResourcesList";
import CustomerGroupList from "./partials/CustomerGroup/CustomerGroupList";
import CustomerCareerList from "./partials/CustomerCareer/CustomerCareerList";
import CustomerRelationshipList from "./partials/CustomerRelationship/CustomerRelationshipList";
import CustomerAttributeList from "./partials/CustomerAttribute/CustomerAttributeList";
import "./SettingCustomerList.scss";
import CustomerView from "./partials/CustomerView/CustomerView";
import CustomerMarketingLead from "./partials/CustomerMarketingLead/CustomerMarketingLead";
import { getDomain } from "reborn-util";
import CustomerLoyaltyPointLedger from "./partials/CustomerLoyaltyPointLedger";

export default function SettingCustomerList() {
  document.title = "Cài đặt khách hàng";

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNEX = sourceDomain.includes("tnex");

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategoryCustomer = [
    {
      title: "Danh sách thẻ khách hàng",
      is_tab: "tab_one",
    },
    {
      title: "Danh sách nguồn khách hàng",
      is_tab: "tab_two",
    },
    {
      title: "Danh sách nhóm khách hàng",
      is_tab: "tab_three",
    },
    {
      title: "Danh sách ngành nghề/nghề nghiệp",
      is_tab: "tab_four",
    },
    {
      title: "Danh sách mối quan hệ khách hàng",
      is_tab: "tab_five",
    },
    {
      title: "Định nghĩa trường thông tin bổ sung khách hàng",
      is_tab: "tab_six",
    }, 
    {
      title: "Định nghĩa cấu trúc xem thông tin",
      is_tab: "tab_seven",
    }, 
    {
      title: "Lịch sử điểm tích lũy của khách hàng",
      is_tab: "tab_nine",
    },
    ...(checkSubdomainTNEX ? [
      {
        title: "Nguồn Marketing gửi Lead",
        is_tab: "tab_eight",
      }, 
    ] : [])
    

  ];

  return (
    <div className="page-content page-setting-customer">
      {!isDetailCategory && <TitleAction title="Cài đặt khách hàng" />}
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
        <CustomerCardList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <CustomerResourcesList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <CustomerGroupList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_four" ? (
        <CustomerCareerList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_five" ? (
        <CustomerRelationshipList
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetailCategory(false);
              }
            }}
          />
      ) : isDetailCategory && tab === "tab_six" ? (
        <CustomerAttributeList
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetailCategory(false);
              }
            }}
          />
      ) : isDetailCategory && tab === "tab_seven" ? (
        <CustomerView
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetailCategory(false);
              }
            }}
          />
      ) : isDetailCategory && tab === "tab_eight" ? (
        <CustomerMarketingLead
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetailCategory(false);
              }
            }}
          />
      ) : isDetailCategory && tab === "tab_nine" ? (
        <CustomerLoyaltyPointLedger
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
