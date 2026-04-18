import { useState } from "react";
import CompanySettings from "./settings/CompanySettings";
import ApiKeysSettings from "./settings/ApiKeysSettings";
import IntegrationsSettings from "./settings/IntegrationsSettings";
import BudgetSettings from "./settings/BudgetSettings";
import WebhooksSettings from "./settings/WebhooksSettings";
import EmailTemplatesSettings from "./settings/EmailTemplatesSettings";
import NotificationsSettings from "./settings/NotificationsSettings";
import AuditLogSettings from "./settings/AuditLogSettings";
import DataRetentionSettings from "./settings/DataRetentionSettings";
import BillingSettings from "./settings/BillingSettings";

type TabKey = "company" | "api" | "integrations" | "budget" | "webhooks" | "emails" | "notifications" | "audit" | "retention" | "billing";

const TABS: { key: TabKey; label: string }[] = [
  { key: "company", label: "Công ty" },
  { key: "api", label: "API Keys" },
  { key: "integrations", label: "Integrations" },
  { key: "budget", label: "AI Budget" },
  { key: "webhooks", label: "Webhooks" },
  { key: "emails", label: "Email templates" },
  { key: "notifications", label: "Notifications" },
  { key: "audit", label: "Audit log" },
  { key: "retention", label: "Data retention" },
  { key: "billing", label: "Billing" },
];

const PANES: Record<TabKey, () => JSX.Element> = {
  company: CompanySettings,
  api: ApiKeysSettings,
  integrations: IntegrationsSettings,
  budget: BudgetSettings,
  webhooks: WebhooksSettings,
  emails: EmailTemplatesSettings,
  notifications: NotificationsSettings,
  audit: AuditLogSettings,
  retention: DataRetentionSettings,
  billing: BillingSettings,
};

export default function Settings() {
  const [tab, setTab] = useState<TabKey>("company");
  const Pane = PANES[tab];

  return (
    <section>
      <div className="hero">
        <div>
          <div className="ribbon">⚙ SETTINGS</div>
          <div className="kicker">Workspace · Reborn JSC</div>
          <h1 className="title">Cài đặt</h1>
          <p className="desc">
            Cấu hình tenant: thông tin công ty, API keys, integrations, budget, webhooks, notifications, audit log, data retention, billing.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <nav className="settings-nav">
          {TABS.map((t) => (
            <button key={t.key} type="button" className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div>
          <Pane />
        </div>
      </div>
    </section>
  );
}
