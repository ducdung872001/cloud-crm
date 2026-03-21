import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import MaterialList from "./MaterialList";
import MaterialImportPage from "./partials/MaterialImportPage";
import MaterialBomPage from "./partials/MaterialBomPage";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

type MaterialTab = "material" | "import" | "bom" | null;

const MENU_ITEMS: { key: MaterialTab; title: string }[] = [
  { key: "material", title: "Danh sách nguyên vật liệu" },
  { key: "import",   title: "Nhập nguyên vật liệu" },
  { key: "bom",      title: "Công thức (BOM)" },
];

export default function MaterialMenuPage() {
  document.title = "Nguyên vật liệu";

  const [tab, setTab] = useState<MaterialTab>(null);
  const goBack = () => setTab(null);

  const listTab = [
    {
      title: "Danh sách nguyên vật liệu",
      backgroundColor: "#E1F5EE",
      icon: "MasterialsList",
      tab: "material",
      des: "Quản lý toàn bộ danh mục nguyên vật liệu, tra cứu thông tin và theo dõi tồn kho từng loại."
    },

    {
      title: "Nhập nguyên vật liệu",
      backgroundColor: "#FAEEDA",
      icon: "ImportMasterials",
      tab: "import",
      des: "Tạo phiếu nhập kho nguyên vật liệu từ nhà cung cấp, ghi nhận số lượng và giá nhập."
    },
    {
      title: "Công thức (BOM)",
      backgroundColor: "#EEEDFE",
      icon: "RecipeMasterials",
      tab: "bom",
      des: "Định nghĩa Bill of Materials — cấu trúc nguyên vật liệu cần thiết để sản xuất từng sản phẩm."
    },
   
  ];

  return (
    <>
      {!tab && (
        <div className="page-content page-setting-sell">
          <TitleAction title="Nguyên vật liệu" />
          <div className="d-flex flex-column">
            <TabMenuList
              listTab={listTab}
              onClick={(item) => {
                  setTab(item.tab);
              }}
            />
          </div>
        </div>
      )}

      {tab === "material" && (
        <MaterialList onBackProps={(isBack) => { if (isBack) goBack(); }} />
      )}

      {tab === "import" && (
        <MaterialImportPage onBackProps={(isBack) => { if (isBack) goBack(); }} />
      )}

      {tab === "bom" && (
        <MaterialBomPage onBackProps={(isBack) => { if (isBack) goBack(); }} />
      )}
    </>
  );
}
