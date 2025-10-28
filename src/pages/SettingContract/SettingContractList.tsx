import React, { useState } from "react";
import ContractPipelineList from "./partials/ContractPipeline/ContractPipelineList";
import ContractAttributeList from "./partials/ContractAttribute/ContractAttributeList";
import TitleAction from "components/titleAction/titleAction";
import "./SettingContractList.scss";
import ContractCategoryList from "./partials/ContractCategory/ContractCategory";
import ContractEform from "./partials/ContractEform/ContractEform";
import ContractAttachment from "./partials/ContractAttactment/ContractAttachment";
import ContractGuaranteeList from "./partials/ContractGuarantee/ContractGuaranteeList";
import CompetencyGuaranteeList from "./partials/CompetencyGuarantee/CompetencyGuarantee";
import BankList from "./partials/BankList/BankList";
import GuaranteeAttributeList from "./partials/GuaranteeAttribute/GuaranteeAttributeList";
import WarrantyAttributeList from "./partials/WarrantyAttribute/WarrantyAttributeList";

export default function SettingContractList() {
  document.title = "Cài đặt hợp đồng";
  const isBeauty = localStorage.getItem("isBeauty");

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategorySMS = [
    {
      title: "Danh sách loại hợp đồng",
      is_tab: "tab_one",
    },
    {
      title: "Danh mục pha hợp đồng",
      is_tab: "tab_two",
    },
    // {
    //   title: "Danh sách biểu mẫu",
    //   is_tab: "tab_five",
    // },
    {
      title: "Danh mục tài liệu",
      is_tab: "tab_six",
    },

    {
      title: "Danh mục bảo lãnh",
      is_tab: "tab_seven",
    },
    {
      title: "Nghiệp vụ bảo lãnh",
      is_tab: "tab_nine",
    },
    {
      title: "Danh mục ngân hàng",
      is_tab: "tab_eight",
    },

    {
      title: "Định nghĩa trường thông tin bổ sung hợp đồng",
      is_tab: "tab_three",
    },
    {
      title: "Định nghĩa trường thông tin bổ sung bảo lãnh",
      is_tab: "tab_ten",
    },
    {
      title: "Định nghĩa trường thông tin bổ sung bảo hành",
      is_tab: "tab_eleven",
    },
  ];

  return (
    <div className="page-content page-setting-contract">
      {!isDetailCategory && <TitleAction title="Cài đặt hợp đồng" />}
      <div className="card-box d-flex flex-column">
        {!isDetailCategory && (
          <ul className="menu">
            {menuCategorySMS.map((item, idx) => {
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
        <ContractCategoryList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <ContractPipelineList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <ContractAttributeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_five" ? (
        <ContractEform
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_six" ? (
        <ContractAttachment
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_seven" ? (
        <ContractGuaranteeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_eight" ? (
        <BankList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_nine" ? (
        <CompetencyGuaranteeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_ten" ? (
        <GuaranteeAttributeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_eleven" ? (
        <WarrantyAttributeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : (
        []
      )}
    </div>
  );
}
