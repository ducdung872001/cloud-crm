import React from "react";
import { AppProvider, useApp } from "contexts/AppContext";
import Login from "pages/Login/Login";
import Header from "components/header/header";
import Sidebar from "components/sidebar/sidebar";
import Toast from "components/toast/Toast";
import Dashboard from "pages/Dashboard/Dashboard";
import LeadManagement from "pages/LeadManagement/LeadManagement";
import Pipeline from "pages/Pipeline/Pipeline";
import Campaigns from "pages/Campaigns/Campaigns";
import SalesProcess from "pages/SalesProcess/SalesProcess";
import { OrgManagement }   from "pages/OrgManagement/OrgManagement";
import { Incentive }       from "pages/Incentive/Incentive";
import {
  SalesDocs, Customer360, Tasks, Approval, KpiReport, NPS,
} from "pages/SharedPages";
import { AllModals } from "pages/AllModals";

function AppShell() {
  const { activePage, isCollapsedSidebar, isAuthenticated, login } = useApp();

  // ── AUTH GUARD ───────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Login onLogin={(userData) => login(userData, "")} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":    return <Dashboard />;
      case "leads":        return <LeadManagement />;
      case "pipeline":     return <Pipeline />;
      case "campaigns":    return <Campaigns />;
      case "salesprocess": return <SalesProcess />;
      case "salesdocs":    return <SalesDocs />;
      case "customers":    return <Customer360 />;
      case "tasks":        return <Tasks />;
      case "approval":     return <Approval />;
      case "kpi":          return <KpiReport />;
      case "nps":          return <NPS />;
      case "org":          return <OrgManagement />;
      case "incentive":    return <Incentive />;
      default:             return <Dashboard />;
    }
  };

  return (
    <div className={`app${isCollapsedSidebar ? " app--collapsed" : ""}`}>
      <Header />
      <Sidebar />
      <main className="main-content">
        {renderPage()}
      </main>
      <AllModals />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
