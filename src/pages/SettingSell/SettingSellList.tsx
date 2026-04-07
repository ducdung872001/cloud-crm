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

// [CH] Community Hub - Tách riêng Sản phẩm (có tồn kho) & Dịch vụ (không tồn kho)
export default function SettingSellList() {
  document.title = "Danh mục sản phẩm & dịch vụ";

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setTab(tabParam);
      setIsDetail(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const back = (isBack: boolean) => { if (isBack) setIsDetail(false); };

  // ── Sản phẩm: có tồn kho, nhập/xuất kho, lưu bảng product ──
  const productTabs = [
    {
      title: "Danh mục sản phẩm",
      is_tab: "product_tab_five",
      backgroundColor: "#E6F1FB",
      icon: "ProductCategoryMenu",
      des: "Tổ chức sản phẩm theo danh mục phân cấp. Sản phẩm có quản lý tồn kho, nhập/xuất kho."
    },
    {
      title: "Danh sách sản phẩm",
      is_tab: "product_tab_one",
      backgroundColor: "#E1F5EE",
      icon: "ProductList",
      des: "Quản lý toàn bộ sản phẩm, cập nhật thông tin, giá bán, mã vạch và trạng thái tồn kho."
    },
    {
      title: "Nhóm sản phẩm",
      is_tab: "product_list_tab_one",
      backgroundColor: "#FAEEDA",
      icon: "ProductGroupList",
      des: "Gom nhóm sản phẩm liên quan để áp dụng chính sách giá và khuyến mãi chung."
    },
    {
      title: "Đơn vị tính sản phẩm",
      is_tab: "product_tab_two",
      backgroundColor: "#EEEDFE",
      icon: "ProductUnitCategory",
      des: "Định nghĩa đơn vị tính: cái, hộp, kg, lít... dùng trong bán hàng và quản lý kho."
    },
    {
      title: "Trường bổ sung sản phẩm",
      is_tab: "product_tab_three",
      backgroundColor: "#EAF3DE",
      icon: "AttributeFieldProduct",
      des: "Tạo trường dữ liệu tuỳ chỉnh để lưu thông tin đặc thù của sản phẩm."
    },
  ];

  // ── Dịch vụ: không tồn kho, đa dạng nhóm ngành, lưu bảng service ──
  const serviceTabs = [
    {
      title: "Danh mục dịch vụ",
      is_tab: "service_tab_one",
      backgroundColor: "#E6F1FB",
      icon: "ProductCategoryMenu",
      des: "Phân loại dịch vụ theo nhóm ngành: F&B, Lưu trú, Sức khỏe, Khóa học, Kết nối..."
    },
    {
      title: "Danh sách dịch vụ",
      is_tab: "service_tab_two",
      backgroundColor: "#E1F5EE",
      icon: "ProductList",
      des: "Quản lý toàn bộ dịch vụ, giá bán lẻ, mã vạch, chia sẻ. Dịch vụ không có tồn kho."
    },
    {
      title: "Trường bổ sung dịch vụ",
      is_tab: "service_tab_four",
      backgroundColor: "#EAF3DE",
      icon: "AttributeFieldProduct",
      des: "Tạo trường dữ liệu tuỳ chỉnh để lưu thông tin đặc thù của dịch vụ."
    },
  ];

  return (
    <div className="page-content page-setting-sell">
      {!isDetail && <TitleAction title="Danh mục sản phẩm & dịch vụ" />}

      {!isDetail && (
        <div className="ch-catalog-sections">
          {/* ── Sản phẩm ── */}
          <div className="ch-catalog-section">
            <div className="ch-catalog-section__header">
              <h3>Sản phẩm</h3>
              <span className="ch-catalog-section__badge product">Có tồn kho</span>
            </div>
            <TabMenuList
              listTab={productTabs}
              onClick={(item) => { setTab(item.is_tab); setIsDetail(true); }}
            />
          </div>

          {/* ── Dịch vụ ── */}
          <div className="ch-catalog-section">
            <div className="ch-catalog-section__header">
              <h3>Dịch vụ</h3>
              <span className="ch-catalog-section__badge service">Không tồn kho</span>
            </div>
            <TabMenuList
              listTab={serviceTabs}
              onClick={(item) => { setTab(item.is_tab); setIsDetail(true); }}
            />
          </div>
        </div>
      )}

      {/* ── Render detail panels ── */}
      {isDetail && tab === "product_tab_five"     && <CategoryProductList  onBackProps={back} />}
      {isDetail && tab === "product_tab_one"      && <ProductList          onBackProps={back} />}
      {isDetail && tab === "product_list_tab_one"  && <ProductCategoryList  onBackProps={back} />}
      {isDetail && tab === "product_tab_two"       && <ProductUnitList      onBackProps={back} />}
      {isDetail && tab === "product_tab_three"     && <ProductAttributeList onBackProps={back} />}

      {isDetail && tab === "service_tab_one"       && <CategoryServiceList  onBackProps={back} />}
      {isDetail && tab === "service_tab_two"       && <ServiceList          onBackProps={back} />}
      {isDetail && tab === "service_tab_three"     && <CardServiceList      onBackProps={back} />}
      {isDetail && tab === "service_tab_four"      && <ServiceAttributeList onBackProps={back} />}
    </div>
  );
}
