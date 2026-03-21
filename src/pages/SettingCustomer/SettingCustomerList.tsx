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
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingCustomerList() {
  document.title = "Cài đặt khách hàng";

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNEX = sourceDomain.includes("tnex");

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Danh sách thẻ khách hàng",
      icon: "CardList",
      is_tab: "tab_one",
      backgroundColor: "#EEEDFE",
      des: "Quản lý các loại thẻ thành viên, thẻ tích điểm hoặc thẻ ưu đãi áp dụng cho khách hàng."
    },
    {
      title: "Danh sách nguồn khách hàng",
      icon: "CustomerSource",
      backgroundColor: "#E1F5EE",
      is_tab: "tab_two",
      des: "Định nghĩa các kênh tiếp cận khách hàng như mạng xã hội, giới thiệu, quảng cáo, v.v."
    },
    {
      title: "Danh sách nhóm khách hàng",
      icon: "CustomerGroup",
      backgroundColor: "#FAEEDA",
      is_tab: "tab_three",
      des: "Phân loại khách hàng thành các nhóm để áp dụng chính sách giá, ưu đãi riêng biệt."
    },
    {
      title: "Danh sách ngành nghề/nghề nghiệp",
      icon: "Industry",
      backgroundColor: "#E6F1FB",
      is_tab: "tab_four",
      des: "Cấu hình danh mục ngành nghề để phân tích và phân khúc tệp khách hàng hiệu quả hơn."
    },
    {
      title: "Danh sách mối quan hệ khách hàng",
      icon: "Relationship",
      backgroundColor: "#FAECE7",
      is_tab: "tab_five",
      des: "Định nghĩa các loại quan hệ như người giới thiệu, người thân, đối tác để theo dõi mạng lưới khách hàng."
    },
    {
      title: "Định nghĩa trường thông tin bổ sung khách hàng",
      icon: "CustomField",
      backgroundColor: "#EAF3DE",
      is_tab: "tab_six",
      des: "Tạo thêm các trường dữ liệu tuỳ chỉnh để lưu trữ thông tin đặc thù của khách hàng theo nhu cầu doanh nghiệp."
    }, 
    {
      title: "Định nghĩa cấu trúc xem thông tin",
      icon: "ViewStructure",
      backgroundColor: "#FBEAF0",
      is_tab: "tab_seven",
      des: "Tùy chỉnh bố cục hiển thị thông tin khách hàng trên màn hình chi tiết theo từng vai trò hoặc bộ phận."
    }, 
    {
      title: "Lịch sử điểm tích lũy của khách hàng",
      icon: "PointsHistory",
      backgroundColor: "#F1EFE8",
      is_tab: "tab_nine",
      des: "Tra cứu toàn bộ lịch sử cộng/trừ điểm, đổi thưởng của từng khách hàng theo thời gian."
    },
    ...(checkSubdomainTNEX ? [
      {
        title: "Nguồn Marketing gửi Lead",
        is_tab: "tab_eight",
      }, 
    ] : [])
    

  ];

  return (
    <div className="page-setting-customer">
      {!isDetail && <TitleAction title="Cài đặt khách hàng" />}
      
      <div className="d-flex flex-column">
        {!isDetail && (
            <TabMenuList
                listTab={listTab}
                onClick={(item) => {
                    setTab(item.is_tab);
                    setIsDetail(true);
                }}
            />
        )}
      </div>
      
      {isDetail && tab === "tab_one" ? (
        <CustomerCardList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_two" ? (
        <CustomerResourcesList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_three" ? (
        <CustomerGroupList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_four" ? (
        <CustomerCareerList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_five" ? (
        <CustomerRelationshipList
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetail(false);
              }
            }}
          />
      ) : isDetail && tab === "tab_six" ? (
        <CustomerAttributeList
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetail(false);
              }
            }}
          />
      ) : isDetail && tab === "tab_seven" ? (
        <CustomerView
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetail(false);
              }
            }}
          />
      ) : isDetail && tab === "tab_eight" ? (
        <CustomerMarketingLead
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetail(false);
              }
            }}
          />
      ) : isDetail && tab === "tab_nine" ? (
        <CustomerLoyaltyPointLedger
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetail(false);
              }
            }}
          />
      ) : null}
    </div>
  );
}
