import React, { useContext, useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import { UserContext, ContextType } from "contexts/userContext";
import { useOnboarding } from "hooks/useOnboarding";
import TourOverlay from "components/tourOverlay/TourOverlay";
import "./ShiftTabsPage.scss";

import NotOpenShiftTab from "./partials/NotOpenShift/NotOpenShiftTab";
import OpenShiftTab from "./partials/OpenShift/OpenShiftTab";
import OrdersInShiftTab from "./partials/OrdersInShift/OrdersInShiftTab";
import OnShiftTab from "./partials/OnShift/OnShiftTab";
import CloseShiftTab from "./partials/CloseShift/CloseShiftTab";
import ShiftReportTab from "./partials/ReportShift/ReportShiftTab";
import OverviewTab from "./partials/ReportOverview/OverviewTab";

type TabKey = "preopen" | "open" | "orders" | "onshift" | "close" | "report" | "overview";

export default function ShiftTabsPage() {
  document.title = "Quản lý ca";

  const { dataBranch, id: userId } = useContext(UserContext) as ContextType;
  const branchId: number = dataBranch?.value ?? 0;

  const [tab, setTab] = useState<TabKey>("preopen");
  const [activeShiftId, setActiveShiftId] = useState<number | null>(null);

  const [pendingConfigId,    setPendingConfigId]    = useState<number>(0);
  const [pendingShiftName,   setPendingShiftName]   = useState<string>("");
  const [pendingShiftTime,   setPendingShiftTime]   = useState<string>("");
  const [pendingDefaultCash, setPendingDefaultCash] = useState<number>(0);

  // ── Tour hướng dẫn ca ────────────────────────────────────────────────────
  const shiftTour = useOnboarding({
    userId:    userId ?? "guest",
    tourId:    "shift",
    autoStart: true,
  });

  return (
    <div className="page-content page-shift-tabs">
      {/* ── Tour hướng dẫn ca ── */}
      <TourOverlay
        active={shiftTour.active}
        step={shiftTour.currentStep}
        stepIdx={shiftTour.stepIdx}
        totalSteps={shiftTour.totalSteps}
        target={shiftTour.target}
        isFirst={shiftTour.isFirst}
        isLast={shiftTour.isLast}
        onNext={shiftTour.next}
        onPrev={shiftTour.prev}
        onSkip={shiftTour.skip}
      />
      <TitleAction
        title="Quản lý ca"
        actions={[{
          title: "❓ Hướng dẫn",
          callback: shiftTour.start,
          color: "default",
          variant: "outline",
        }]}
      />

      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className={tab === "preopen" ? "active" : ""} onClick={() => setTab("preopen")}>Chưa vào ca</li>
              <li className={tab === "open"    ? "active" : ""} onClick={() => setTab("open")}>Vào ca</li>
              <li className={tab === "onshift" ? "active" : ""} onClick={() => setTab("onshift")}>Đang ca</li>
              <li className={tab === "orders"  ? "active" : ""} onClick={() => setTab("orders")}>Đơn trong ca</li>
              <li className={tab === "close"   ? "active" : ""} onClick={() => setTab("close")}>Đóng ca</li>
              <li className={tab === "report"  ? "active" : ""} onClick={() => setTab("report")}>Báo cáo kết ca</li>
              <li className={tab === "overview"? "active" : ""} onClick={() => setTab("overview")}>Báo cáo tổng quan</li>
            </ul>
          </div>
        </div>

        <div className="tab-body">
          {tab === "preopen" && (
            <NotOpenShiftTab
              onOpenShiftClick={(configId, shiftName, shiftTime, defaultCash) => {
                setPendingConfigId(configId);
                setPendingShiftName(shiftName ?? "");
                setPendingShiftTime(shiftTime ?? "");
                setPendingDefaultCash(defaultCash ?? 0);
                setTab("open");
              }}
              onActiveShiftFound={(shiftId) => {
                setActiveShiftId(shiftId);
                setTab("onshift");
              }}
            />
          )}

          {tab === "open" && (
            <OpenShiftTab
              shiftConfigId={pendingConfigId}
              branchId={branchId}
              shiftName={pendingShiftName}
              shiftTime={pendingShiftTime}
              defaultCash={pendingDefaultCash}
              onShiftOpened={(shiftId) => {
                setActiveShiftId(shiftId);
                setTab("onshift");
              }}
            />
          )}

          {tab === "onshift" && (
            <OnShiftTab
              shiftId={activeShiftId}
              branchId={branchId}
              onEndShift={() => setTab("close")}
              onViewOrders={() => setTab("orders")}
            />
          )}

          {tab === "orders" && (
            <OrdersInShiftTab shiftId={activeShiftId} />
          )}

          {tab === "close" && (
            <CloseShiftTab shiftId={activeShiftId} branchId={branchId} onShiftClosed={() => setTab("report")} />
          )}

          {tab === "report" && (
            <ShiftReportTab shiftId={activeShiftId} branchId={branchId} />
          )}

          {tab === "overview" && (
            <OverviewTab branchId={branchId} />
          )}
        </div>
      </div>
    </div>
  );
}