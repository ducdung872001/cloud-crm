import React, { useState } from "react";
import CardServiceList from "./partials/CardService/CardServiceList";
import ProductUnitList from "./partials/ProductUnit/ProductUnitList";
import ProductList from "./partials/Product/ProductList";
import ServiceList from "./partials/Service/ServiceList";
import CategoryServiceList from "./partials/CategoryService/CategoryServiceList";
import GiftList from "./partials/Gift/GiftList";
import TitleAction from "components/titleAction/titleAction";
import "./SettingSellList.scss";
import ProductAttributeList from "./partials/ProductAttributeList/ProductAttributeList";
import ServiceAttributeList from "./partials/ServiceAttributeList/ServiceAttributeList";
import CategoryProductList from "./partials/CategoryProduct/CategoryProductList";
import SettingPromotionList from "pages/SettingPromotion/SettingPromotionList";

export default function SettingSellList() {
  document.title = "Cài đặt bán hàng";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const productMenu = [
    {
      title: "Danh mục sản phẩm",
      is_tab: "product_tab_five",
    },

    {
      title: "Danh sách sản phẩm",
      is_tab: "product_tab_one",
    },
    {
      title: "Danh mục đơn vị sản phẩm",
      is_tab: "product_tab_two",
    },

    // {
    //   title: "Danh sách quà tặng",
    //   is_tab: "product_tab_four",
    // },

    {
      title: "Định nghĩa trường thông tin bổ sung sản phẩm",
      is_tab: "product_tab_three",
    },

    {
      title: "Cài đặt khuyến mãi",
      is_tab: "product_tab_promotion",
    },
  ];

  const serviceMenu = [
    {
      title: "Danh mục dịch vụ",
      is_tab: "service_tab_one",
    },
    {
      title: "Danh sách dịch vụ",
      is_tab: "service_tab_two",
    },
    {
      title: "Danh sách thẻ dịch vụ",
      is_tab: "service_tab_three",
    },

    {
      title: "Định nghĩa trường thông tin bổ sung dịch vụ",
      is_tab: "service_tab_four",
    },
  ];

  const menuCategorySMS = [
    {
      title: "Danh sách thẻ dịch vụ",
      is_tab: "tab_one",
    },
    {
      title: "Danh sách sản phẩm",
      is_tab: "tab_two",
    },
    {
      title: "Danh sách dịch vụ",
      is_tab: "tab_three",
    },
    {
      title: "Danh mục dịch vụ",
      is_tab: "tab_four",
    },
    {
      title: "Danh mục đơn vị",
      is_tab: "tab_five",
    },
    {
      title: "Danh sách quà tặng",
      is_tab: "tab_six",
    },
  ];

  return (
    <div className="page-content page-setting-sell">
      {!isDetailCategory && <TitleAction title="Cài đặt bán hàng" />}
      <div className="card-box d-flex flex-column">
        {!isDetailCategory && (
          <div style={{ display: "flex" }}>
            <ul className="product-menu">
              {productMenu.map((item, idx) => {
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
            <ul className="service-menu">
              {serviceMenu.map((item, idx) => {
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
          </div>
        )}
      </div>

      {isDetailCategory && tab === "service_tab_three" ? (
        <CardServiceList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "service_tab_two" ? (
        <ServiceList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "service_tab_one" ? (
        <CategoryServiceList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "service_tab_four" ? (
        <ServiceAttributeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "product_tab_five" ? (
        <CategoryProductList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "product_tab_one" ? (
        <ProductList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "product_tab_two" ? (
        <ProductUnitList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "product_tab_three" ? (
        <ProductAttributeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "product_tab_promotion" ? (
        <SettingPromotionList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : (
        isDetailCategory && (
          <GiftList
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetailCategory(false);
              }
            }}
          />
        )
      )}
    </div>
  );
}
