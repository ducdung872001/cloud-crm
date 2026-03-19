import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import MaterialList from "./MaterialList";
import MaterialImportPage from "./partials/MaterialImportPage";
import MaterialBomPage from "./partials/MaterialBomPage";

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

  return (
    <>
      {!tab && (
        <div className="page-content page-setting-sell">
          <TitleAction title="Nguyên vật liệu" />
          <div className="card-box d-flex flex-column">
            <ul className="menu">
              {MENU_ITEMS.map((item) => (
                <li
                  key={item.key}
                  className="menu__category"
                  onClick={() => setTab(item.key)}
                >
                  {item.title}
                </li>
              ))}
            </ul>
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
