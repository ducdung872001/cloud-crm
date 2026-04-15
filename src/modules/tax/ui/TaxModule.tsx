// Shell của tax module — header + tab nav + render từng trang con.
// Dùng đơn file routing nội bộ để dễ copy sang nhánh khác mà không đụng react-router.

import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { taxTheme as T } from "./theme";
import TaxDashboard from "./TaxDashboard";
import TaxpayerProfilePage from "./TaxpayerProfilePage";
import RevenueExpenseBook from "./RevenueExpenseBook";
import DeclarationWizard from "./DeclarationWizard";
import TaxCalendar from "./TaxCalendar";
import TaxAdvisory from "./TaxAdvisory";
import LicenseFeePage from "./LicenseFeePage";
import { fitproAdapter } from "../adapters/fitproAdapter";
import { communityHubAdapter } from "../adapters/communityHubAdapter";
import { retailAdapter } from "../adapters/retailAdapter";
import { mockAdapter } from "../adapters/mockAdapter";
import {
  registerDataSourceAdapter,
  setDefaultAdapter,
} from "../adapters/types";

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║ BRANCH CONFIG — 1 dòng duy nhất cần sửa khi port sang nhánh khác.     ║
// ║ Giá trị hợp lệ: "fitpro" | "community" | "retail" | "mock"            ║
// ╚═══════════════════════════════════════════════════════════════════════╝
const ACTIVE_BRANCH: "fitpro" | "community" | "retail" | "mock" = "fitpro";

// Đăng ký adapter — an toàn nếu gọi nhiều lần vì Map sẽ overwrite.
registerDataSourceAdapter(mockAdapter);
registerDataSourceAdapter(fitproAdapter);
registerDataSourceAdapter(communityHubAdapter);
registerDataSourceAdapter(retailAdapter);
setDefaultAdapter(ACTIVE_BRANCH);

type TabKey =
  | "dashboard"
  | "profile"
  | "book"
  | "declaration"
  | "licensefee"
  | "calendar"
  | "advisory";

const TABS: {
  key: TabKey;
  label: string;
  icon: string;
  path: string;
  title: string;
  desc: string;
}[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    icon: "📊",
    path: "/tax",
    title: "Dashboard thuế — 5 chỉ số sinh tồn",
    desc: "Xem nhanh doanh thu, thuế dự kiến và lợi nhuận ước tính của kỳ hiện tại",
  },
  {
    key: "profile",
    label: "Hồ sơ thuế",
    icon: "🪪",
    path: "/tax/profile",
    title: "T1 — Hồ sơ thuế HKD/CNKD",
    desc: "Đăng ký thông tin, chọn phương pháp tính thuế và ngành nghề",
  },
  {
    key: "book",
    label: "Sổ DT / CP",
    icon: "📒",
    path: "/tax/book",
    title: "T2 — Sổ doanh thu & chi phí theo kỳ thuế",
    desc: "Tổng hợp tự động từ các nguồn dữ liệu, đối chiếu & điều chỉnh",
  },
  {
    key: "declaration",
    label: "Lập tờ khai",
    icon: "📝",
    path: "/tax/declaration",
    title: "T3 — Lập tờ khai thuế 01/CNKD · 03/CNKD",
    desc: "Wizard 5 bước: chọn kỳ → tổng hợp → preview → ký số → nộp eTax",
  },
  {
    key: "licensefee",
    label: "Môn bài",
    icon: "🏷️",
    path: "/tax/license-fee",
    title: "Lệ phí môn bài — Mẫu 01/LPMB",
    desc: "Tờ khai môn bài hằng năm theo NĐ 139/2016, hạn 30/01",
  },
  {
    key: "calendar",
    label: "Lịch thuế",
    icon: "🗓️",
    path: "/tax/calendar",
    title: "T4 — Lịch & nghĩa vụ thuế",
    desc: "Lịch các kỳ khai trong năm, cảnh báo sắp đến hạn",
  },
  {
    key: "advisory",
    label: "Tư vấn",
    icon: "💡",
    path: "/tax/advisory",
    title: "T5 — Tư vấn & hỗ trợ thuế",
    desc: "FAQ, thông báo chính sách và kết nối đại lý thuế",
  },
];

export default function TaxModule() {
  const location = useLocation();
  const pathTab = TABS.find((t) => t.path === location.pathname) ?? TABS[0];
  const [tab, setTab] = useState<TabKey>(pathTab.key);

  useEffect(() => {
    setTab(pathTab.key);
    document.title = `Thuế — ${pathTab.label}`;
  }, [pathTab.key]);

  return (
    <div
      style={{
        padding: T.spacing.xl,
        background: T.colors.bg,
        minHeight: "calc(100vh - 60px)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: T.spacing.lg }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: T.font.tiny,
            color: T.colors.textMuted,
            marginBottom: 4,
          }}
        >
          <span>🧾</span>
          <span style={{ fontWeight: 600 }}>Phân hệ Thuế HKD/CNKD</span>
          <span>·</span>
          <span>TT 40/2021 · NĐ 70/2025</span>
        </div>
        <h1
          style={{
            margin: 0,
            color: T.colors.primaryDark,
            fontSize: T.font.h1,
          }}
        >
          {pathTab.icon} {pathTab.title}
        </h1>
        <p
          style={{
            margin: "4px 0 0 0",
            color: T.colors.textMuted,
            fontSize: T.font.body,
          }}
        >
          {pathTab.desc}
        </p>
      </div>

      {/* Tab pills */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: T.spacing.xl,
          borderBottom: `1px solid ${T.colors.border}`,
          paddingBottom: T.spacing.md,
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              to={t.path}
              style={{
                padding: "8px 16px",
                borderRadius: T.radius.pill,
                border: active
                  ? `2px solid ${T.colors.primary}`
                  : `1px solid ${T.colors.border}`,
                background: active ? T.colors.primarySoft : T.colors.cardBg,
                color: active ? T.colors.primaryDark : T.colors.textMuted,
                fontSize: T.font.small,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Body */}
      {tab === "dashboard" && <TaxDashboard />}
      {tab === "profile" && <TaxpayerProfilePage />}
      {tab === "book" && <RevenueExpenseBook />}
      {tab === "declaration" && <DeclarationWizard />}
      {tab === "licensefee" && <LicenseFeePage />}
      {tab === "calendar" && <TaxCalendar />}
      {tab === "advisory" && <TaxAdvisory />}
    </div>
  );
}
