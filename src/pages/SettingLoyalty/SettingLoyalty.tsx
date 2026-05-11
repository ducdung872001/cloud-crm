import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./SettingLoyalty.scss";
import { getDomain } from "reborn-util";
import SettingLoyaltyList from "@/pages/SettingLoyaltyList";
import LoyaltySegment from "@/pages/LoyaltySegment";
import LoyaltyReward from "@/pages/LoyaltyReward";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import ExchangeRatePanel from "./ExchangeRatePanel";
import PointExpiryConfig from "./PointExpiryConfig";
import AutoTierConfig from "./AutoTierConfig";
import LoyaltyScopeConfig from "./LoyaltyScopeConfig";
import ModuleToggleConfig from "./ModuleToggleConfig";
import AdvancedEarnConfig from "./AdvancedEarnConfig";
import NotificationTemplateConfig from "./NotificationTemplateConfig";
import ApiKeyWebhookConfig from "./ApiKeyWebhookConfig";
import AuditLogViewer from "./AuditLogViewer";

interface Props {
  onBackProps?: (v: boolean) => void;
}

export default function SettingLoyalty({ onBackProps }: Props = {}) {
  document.title = "Cấu hình Loyalty";

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNEX = sourceDomain.includes("tnex");

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Quy tắc tích điểm",
      is_tab: "tab_one",
      des: "Thiết lập quy tắc tích điểm và ưu đãi cho chương trình khách hàng thân thiết",
      icon: "AccumulatePoints",
      backgroundColor: "#E1F5EE",
      strokeColor: "#27ae60",
    },
    {
      title: "Phần thưởng & Đổi điểm",
      is_tab: "tab_two",
      des: "Quản lý phần thưởng và thiết lập chương trình đổi điểm lấy quà, voucher cho hội viên",
      icon: "ExchangePoints",
      backgroundColor: "#FAECE7",
      strokeColor: "#e17055",
    },
    {
      title: "Tỷ lệ quy đổi điểm",
      is_tab: "tab_exchange",
      des: "Cấu hình 1 điểm tích lũy tương đương bao nhiêu VND khi khách thanh toán bằng điểm",
      icon: "PointsSettingMenu",
      backgroundColor: "#EEF2FF",
      strokeColor: "#6c5ce7",
    },
    {
      title: "Hạn sử dụng điểm",
      is_tab: "tab_expiry",
      des: "Cấu hình điểm hết hạn sau bao lâu — cuối năm, sau X tháng, hoặc không hết hạn",
      icon: "CalendarTime",
      backgroundColor: "#FFF7ED",
      strokeColor: "#F5A623",
    },
    {
      title: "Thăng / hạ hạng tự động",
      is_tab: "tab_tier_eval",
      des: "Tự động đánh giá và thay đổi hạng thành viên theo chu kỳ (tháng/quý/năm)",
      icon: "ChartLine",
      backgroundColor: "#ECFDF5",
      strokeColor: "#22C55E",
    },
    {
      title: "Phạm vi áp dụng",
      is_tab: "tab_scope",
      des: "Loyalty áp dụng toàn chuỗi, theo thương hiệu, hoặc theo nhóm cửa hàng",
      icon: "BranchList",
      backgroundColor: "#EFF6FF",
      strokeColor: "#3B82F6",
    },
    {
      title: "Chế độ hiển thị",
      is_tab: "tab_modules",
      des: "Bật/tắt phân hệ — chế độ Loyalty thuần hoặc đầy đủ",
      icon: "SettingsMenu",
      backgroundColor: "#F3F4F6",
      strokeColor: "#6B7280",
    },
    {
      title: "Earn rule nâng cao (BPM)",
      is_tab: "tab_advanced_earn",
      des: "Quy trình tích điểm phức tạp — Loyalty Quest, Family Pool, Journey, B2B approval — chạy trên BPM Engine",
      icon: "BPMProcess",
      backgroundColor: "#ECFEFF",
      strokeColor: "#0E7490",
    },
    {
      title: "Thông báo gửi KH",
      is_tab: "tab_notification",
      des: "Cấu hình template SMS / Zalo / Email / Push cho 11 loại event loyalty",
      icon: "Bell",
      backgroundColor: "#FEF3C7",
      strokeColor: "#D97706",
    },
    {
      title: "API Key & Webhook",
      is_tab: "tab_integration",
      des: "Quản lý API key cho POS, đăng ký webhook, theo dõi Dead Letter Queue",
      icon: "ApiKey",
      backgroundColor: "#F0FDF4",
      strokeColor: "#15803D",
    },
    {
      title: "Audit Log",
      is_tab: "tab_audit",
      des: "Lịch sử mọi thay đổi config + manual action — append-only, retention 7 năm",
      icon: "AuditLog",
      backgroundColor: "#FAF5FF",
      strokeColor: "#7E22CE",
    },
  ];

  return (
    <div className="page-setting-customer">
      {!isDetail && (
        onBackProps
          ? <HeaderTabMenu title="Cấu hình Loyalty" titleBack="Hội viên" onBackProps={onBackProps} />
          : <TitleAction title="Cấu hình Loyalty" />
      )}
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
        <SettingLoyaltyList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_two" ? (
        <LoyaltyReward
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_exchange" ? (
        <ExchangeRatePanel
          onBackProps={(isBack) => {
            if (isBack) setIsDetail(false);
          }}
        />
      ) : isDetail && tab === "tab_expiry" ? (
        <PointExpiryConfig
          onBackProps={(isBack) => {
            if (isBack) setIsDetail(false);
          }}
        />
      ) : isDetail && tab === "tab_tier_eval" ? (
        <AutoTierConfig
          onBackProps={(isBack) => {
            if (isBack) setIsDetail(false);
          }}
        />
      ) : isDetail && tab === "tab_scope" ? (
        <LoyaltyScopeConfig
          onBackProps={(isBack) => {
            if (isBack) setIsDetail(false);
          }}
        />
      ) : isDetail && tab === "tab_modules" ? (
        <ModuleToggleConfig
          onBackProps={(isBack) => {
            if (isBack) setIsDetail(false);
          }}
        />
      ) : isDetail && tab === "tab_advanced_earn" ? (
        <AdvancedEarnConfig
          onBackProps={(isBack) => {
            if (isBack) setIsDetail(false);
          }}
        />
      ) : isDetail && tab === "tab_notification" ? (
        <NotificationTemplateConfig
          onBackProps={(isBack) => {
            if (isBack) setIsDetail(false);
          }}
        />
      ) : isDetail && tab === "tab_integration" ? (
        <ApiKeyWebhookConfig
          onBackProps={(isBack) => {
            if (isBack) setIsDetail(false);
          }}
        />
      ) : isDetail && tab === "tab_audit" ? (
        <AuditLogViewer
          onBackProps={(isBack) => {
            if (isBack) setIsDetail(false);
          }}
        />
      ) : isDetail && tab === "tab_three" ? (
        <LoyaltySegment
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