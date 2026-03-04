import React, { useState, useRef } from "react";
import TitleAction from "components/titleAction/titleAction";
import Dialog from "components/dialog/dialog";
import { IMenuTab } from "model/OtherModel";
import "./ViettelIntegration.scss";

// Partials
import ViettelOverview from "./partials/ViettelOverview/ViettelOverview";
import ViettelWizard from "./partials/ViettelWizard/ViettelWizard";
import ViettelSettings from "./partials/ViettelSettings/ViettelSettings";
import ViettelAnalytics from "./partials/ViettelAnalytics/ViettelAnalytics";

export default function ViettelIntegration(props: any) {
  document.title = "Tích hợp Viettel";

  const { onBackProps } = props;

  const isMounted = useRef(false);
  const [dataIntegration, setDataIntegration] = useState(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isSettingIntegration, setIsSettingIntegration] = useState<boolean>(false);
  const [isPreviewIntegration, setIsPreviewIntegration] = useState(false);

  const [activeTab, setActiveTab] = useState<"overview" | "wizard" | "settings" | "analytics">("overview");

  const titleItems: IMenuTab[] = [
    {
      title: "Tổng quan",
      is_active: "overview",
    },
    {
      title: "Thiết lập nhanh",
      is_active: "wizard",
    },
    {
      title: "Cấu hình",
      is_active: "settings",
    },
    {
      title: "Đồng bộ & nhật ký",
      is_active: "analytics",
    },
  ];

  return (
    <div className={`page-content page-viettel-integration page-viettel-integration${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              setIsSettingIntegration(false);
            }}
            className="title-first"
          >
            Hệ sinh thái Viettel
          </h1>
        </div>
        <TitleAction title="" />
      </div>

      <div className="card-box viettel-integration-container">
        {/* Tabs nội bộ của trang tích hợp Viettel – dùng chung UI action__header--title */}
        <div className="card-box viettel-tabs-wrapper">
          <div className="action__header">
            <ul className="action__header--title">
              {titleItems.map((item, idx) => (
                <li
                  key={idx}
                  className={item.is_active === activeTab ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(item.is_active as any);
                  }}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CÁC TAB NỘI DUNG */}
        {activeTab === "overview" && <ViettelOverview setActiveTab={setActiveTab} />}
        {activeTab === "wizard" && <ViettelWizard setActiveTab={setActiveTab} />}
        {activeTab === "settings" && (
          <div className="viettel-settings">
            <ViettelSettings onNavigate={setActiveTab} />
          </div>
        )}
        {activeTab === "analytics" && <ViettelAnalytics />}
      </div>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
