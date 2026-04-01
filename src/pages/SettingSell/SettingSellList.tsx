import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import ProductCategoryList from "./partials/ProductCategory";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingSellList() {
  document.title = "Cài đặt bán hàng";

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  // Khi navigate từ Global Search với ?tab=product_tab_one → tự mở đúng tab
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setTab(tabParam);
      setIsDetail(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const listTab = [
    {
      title: "Danh mục sản phẩm",
      is_tab: "product_tab_five",
      backgroundColor: "#E6F1FB",
      icon: "ProductCategoryMenu",
      des: "Tổ chức sản phẩm theo danh mục phân cấp, giúp tìm kiếm và quản lý nhanh hơn."
    },

    {
      title: "Danh sách sản phẩm",
      is_tab: "product_tab_one",
      backgroundColor: "#E1F5EE",
      icon: "ProductList",
      des: "Xem và quản lý toàn bộ sản phẩm, cập nhật thông tin, giá bán và trạng thái."
    },
    {
      title: "Danh sách nhóm sản phẩm",
      is_tab: "product_list_tab_one",
      backgroundColor: "#FAEEDA",
      icon: "ProductGroupList",
      des: "Gom nhóm sản phẩm liên quan để áp dụng chính sách giá và khuyến mãi chung."
    },
    {
      title: "Danh mục đơn vị sản phẩm",
      is_tab: "product_tab_two",
      backgroundColor: "#EEEDFE",
      icon: "ProductUnitCategory",
      des: "Định nghĩa các đơn vị tính như cái, hộp, kg, lít... dùng trong bán hàng và kho."
    },

    // {
    //   title: "Danh sách quà tặng",
    //   is_tab: "product_tab_four",
    // },

    {
      title: "Định nghĩa trường thông tin bổ sung sản phẩm",
      is_tab: "product_tab_three",
      backgroundColor: "#EAF3DE",
      icon: "AttributeFieldProduct",
      des: "Tạo thêm các trường dữ liệu tuỳ chỉnh để lưu thông tin đặc thù của sản phẩm."
    },

    // {
    //   title: "Cài đặt khuyến mãi",
    //   is_tab: "product_tab_promotion",
    //   des: "Cấu hình quy tắc giảm giá, chiết khấu theo sản phẩm, nhóm hàng hoặc đơn hàng."
    // },
  ];


  return (
    <div className="page-content page-setting-sell">
      {!isDetail && <TitleAction title="Cài đặt bán hàng" />}
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

      {isDetail && tab === "service_tab_three" ? (
        <CardServiceList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "service_tab_two" ? (
        <ServiceList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "service_tab_one" ? (
        <CategoryServiceList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "service_tab_four" ? (
        <ServiceAttributeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "product_tab_five" ? (
        <CategoryProductList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "product_tab_one" ? (
        <ProductList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "product_list_tab_one" ? (
        <ProductCategoryList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "product_tab_two" ? (
        <ProductUnitList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "product_tab_three" ? (
        <ProductAttributeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "product_tab_promotion" ? (
        <SettingPromotionList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : (
        isDetail && (
          <GiftList
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetail(false);
              }
            }}
          />
        )
      )}
    </div>
  );
}