// Quản lý API Key + Webhook cho POS integration
// Phục vụ UR-POS-06 (API Key) + UR-POS-07 (Webhook signing) + UR-POS-08 (DLQ viewer)
import React, { useEffect, useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

type KeyStatus = "active" | "revoked" | "expired";
type WebhookStatus = "active" | "paused" | "failing";

interface ApiKey {
  id: string;
  name: string;
  prefix: string; // hiển thị 8 ký tự đầu
  scopes: string[];
  rateLimit: number; // req/min
  ipWhitelist: string[];
  status: KeyStatus;
  isSandbox: boolean;
  expiresAt?: string;
  lastUsedAt?: string;
  usageLast24h: number;
  createdAt: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  successRate: number;
  lastDeliveryAt?: string;
  deliveryStats: { sent: number; succeeded: number; failed: number };
}

interface DlqEntry {
  id: string;
  webhookId: string;
  event: string;
  orderRef?: string;
  retryCount: number;
  lastError: string;
  firstFailedAt: string;
}

const SAMPLE_KEYS: ApiKey[] = [
  {
    id: "k-001",
    name: "POS Brand A — Production",
    prefix: "rk_live_a1b2c3d4",
    scopes: ["lookup", "auto_earn", "consume", "refund"],
    rateLimit: 1000,
    ipWhitelist: ["203.162.10.0/24"],
    status: "active",
    isSandbox: false,
    expiresAt: "2027-05-11T00:00:00+07:00",
    lastUsedAt: "2026-05-11T15:23:42+07:00",
    usageLast24h: 142_350,
    createdAt: "2026-04-01T08:30:00+07:00",
  },
  {
    id: "k-002",
    name: "POS Brand B — Production",
    prefix: "rk_live_e5f6g7h8",
    scopes: ["lookup", "auto_earn", "consume", "refund"],
    rateLimit: 1000,
    ipWhitelist: ["116.99.5.0/24"],
    status: "active",
    isSandbox: false,
    lastUsedAt: "2026-05-11T15:25:01+07:00",
    usageLast24h: 89_120,
    createdAt: "2026-04-15T10:00:00+07:00",
  },
  {
    id: "k-003",
    name: "POS Brand A — Sandbox",
    prefix: "rk_test_i9j0k1l2",
    scopes: ["lookup", "auto_earn"],
    rateLimit: 100,
    ipWhitelist: [],
    status: "active",
    isSandbox: true,
    lastUsedAt: "2026-05-10T14:00:00+07:00",
    usageLast24h: 230,
    createdAt: "2026-03-20T09:00:00+07:00",
  },
  {
    id: "k-004",
    name: "Marketplace Shopee integration (deprecated)",
    prefix: "rk_live_m3n4o5p6",
    scopes: ["lookup"],
    rateLimit: 500,
    ipWhitelist: [],
    status: "revoked",
    isSandbox: false,
    lastUsedAt: "2026-02-15T11:00:00+07:00",
    usageLast24h: 0,
    createdAt: "2025-12-01T08:00:00+07:00",
  },
];

const SAMPLE_WEBHOOKS: Webhook[] = [
  {
    id: "wh-001",
    name: "POS Brand A — Tier change notifier",
    url: "https://pos-a.brand-a.vn/webhook/loyalty",
    events: ["member.tier_changed", "points.adjusted"],
    status: "active",
    successRate: 99.7,
    lastDeliveryAt: "2026-05-11T15:20:15+07:00",
    deliveryStats: { sent: 1240, succeeded: 1236, failed: 4 },
  },
  {
    id: "wh-002",
    name: "Marketing automation — Reward issued",
    url: "https://ma.brand-a.vn/hooks/voucher",
    events: ["voucher.issued", "reward.redeemed"],
    status: "active",
    successRate: 98.2,
    lastDeliveryAt: "2026-05-11T15:18:00+07:00",
    deliveryStats: { sent: 5320, succeeded: 5224, failed: 96 },
  },
  {
    id: "wh-003",
    name: "POS Brand B — Member merge sync",
    url: "https://pos-b.brand-b.vn/webhook/member",
    events: ["member.merged"],
    status: "failing",
    successRate: 42.0,
    lastDeliveryAt: "2026-05-11T14:55:00+07:00",
    deliveryStats: { sent: 50, succeeded: 21, failed: 29 },
  },
];

const SAMPLE_DLQ: DlqEntry[] = [
  {
    id: "dlq-001",
    webhookId: "wh-003",
    event: "member.merged",
    orderRef: "MEMBER-MERGE-9821",
    retryCount: 3,
    lastError: "504 Gateway Timeout (waited 5s)",
    firstFailedAt: "2026-05-11T14:23:00+07:00",
  },
  {
    id: "dlq-002",
    webhookId: "wh-003",
    event: "member.merged",
    orderRef: "MEMBER-MERGE-9823",
    retryCount: 3,
    lastError: "504 Gateway Timeout (waited 5s)",
    firstFailedAt: "2026-05-11T14:35:00+07:00",
  },
  {
    id: "dlq-003",
    webhookId: "wh-002",
    event: "voucher.issued",
    orderRef: "REWARD-RDM-44210",
    retryCount: 3,
    lastError: "Connection refused — endpoint down",
    firstFailedAt: "2026-05-11T11:10:00+07:00",
  },
];

const ALL_EVENTS = [
  "points.earned",
  "points.adjusted",
  "points.expired",
  "tier.upgraded",
  "tier.downgraded",
  "member.tier_changed",
  "member.merged",
  "reward.redeemed",
  "voucher.issued",
  "voucher.expired",
  "campaign.launched",
];

interface Props {
  onBackProps?: (v: boolean) => void;
}

export default function ApiKeyWebhookConfig({ onBackProps }: Props) {
  const [tab, setTab] = useState<"keys" | "webhooks" | "dlq">("keys");
  const [keys, setKeys] = useState(SAMPLE_KEYS);
  const [webhooks, setWebhooks] = useState(SAMPLE_WEBHOOKS);
  const [dlq, setDlq] = useState(SAMPLE_DLQ);
  const [showNewKey, setShowNewKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    document.title = "API Key & Webhook";
  }, []);

  const handleRevoke = (id: string) => {
    if (!window.confirm("Revoke API key này? Sau khi revoke, mọi request từ key sẽ trả 401 ngay lập tức.")) return;
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)));
  };

  const handleGenerateKey = () => {
    const newKey = `rk_live_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`;
    setGeneratedKey(newKey);
  };

  const handleRetryDlq = (id: string) => {
    setDlq((prev) => prev.filter((d) => d.id !== id));
    alert("Đã đẩy lại vào queue. Theo dõi delivery trong tab Webhooks.");
  };

  const handlePauseWebhook = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: w.status === "paused" ? "active" : "paused" } : w)),
    );
  };

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: "#F5F9F8" }}>
      {onBackProps && (
        <HeaderTabMenu
          title="API Key & Webhook"
          titleBack="Cấu hình Loyalty"
          onBackProps={onBackProps}
        />
      )}

      <div style={{ padding: "20px 24px" }}>
        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #E2E8F0" }}>
          {[
            { k: "keys" as const, label: "🔑 API Keys", count: keys.filter((k) => k.status === "active").length },
            { k: "webhooks" as const, label: "🔔 Webhooks", count: webhooks.filter((w) => w.status === "active").length },
            { k: "dlq" as const, label: "💀 Dead Letter Queue", count: dlq.length },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              style={{
                padding: "10px 18px",
                background: "transparent",
                border: "none",
                borderBottom: tab === t.k ? "2px solid #0E7490" : "2px solid transparent",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: tab === t.k ? 700 : 500,
                color: tab === t.k ? "#0E7490" : "#64748B",
              }}
            >
              {t.label}
              <span
                style={{
                  marginLeft: 8,
                  background: tab === t.k ? "#CFFAFE" : "#F1F5F9",
                  color: tab === t.k ? "#0E7490" : "#64748B",
                  padding: "1px 8px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* API KEYS TAB */}
        {tab === "keys" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button
                onClick={() => {
                  setShowNewKey(true);
                  handleGenerateKey();
                }}
                style={{
                  padding: "8px 16px",
                  background: "#0E7490",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ＋ Tạo API Key mới
              </button>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <Th>Tên</Th>
                    <Th>Prefix</Th>
                    <Th>Scopes</Th>
                    <Th style={{ width: 90 }}>Rate</Th>
                    <Th style={{ width: 130, textAlign: "right" }}>24h usage</Th>
                    <Th style={{ width: 110 }}>Trạng thái</Th>
                    <Th style={{ width: 100 }}>Hành động</Th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, color: "#0F172A" }}>
                          {k.name}
                          {k.isSandbox && (
                            <span
                              style={{
                                marginLeft: 8,
                                background: "#FEF3C7",
                                color: "#92400E",
                                padding: "2px 6px",
                                fontSize: 10,
                                borderRadius: 4,
                                fontWeight: 700,
                              }}
                            >
                              SANDBOX
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                          Tạo {formatDate(k.createdAt)}
                          {k.lastUsedAt && ` · Last used ${formatDateTime(k.lastUsedAt)}`}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "#475569" }}>
                        {k.prefix}...
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {k.scopes.map((s) => (
                            <span
                              key={s}
                              style={{
                                background: "#EEF2FF",
                                color: "#3730A3",
                                padding: "2px 6px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontFamily: "monospace",
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#475569" }}>{k.rateLimit}/min</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        {k.usageLast24h.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <StatusBadge status={k.status} />
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {k.status === "active" && (
                          <button
                            onClick={() => handleRevoke(k.id)}
                            style={{
                              padding: "4px 10px",
                              background: "#FEE2E2",
                              color: "#991B1B",
                              border: "1px solid #FECACA",
                              borderRadius: 6,
                              fontSize: 12,
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal-style new key generated */}
            {showNewKey && generatedKey && (
              <div
                style={{
                  marginTop: 16,
                  background: "#FFFBEB",
                  border: "2px solid #FBBF24",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div style={{ fontWeight: 700, color: "#78350F", marginBottom: 8 }}>
                  ⚠️ API Key mới — hiển thị 1 lần duy nhất
                </div>
                <div style={{ fontSize: 13, color: "#92400E", marginBottom: 12 }}>
                  Copy key này ngay. Sau khi đóng dialog, không thể xem lại — chỉ có thể tạo key mới.
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #FBBF24",
                    borderRadius: 6,
                    padding: "10px 12px",
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: "#0F172A",
                    wordBreak: "break-all",
                    marginBottom: 12,
                  }}
                >
                  {generatedKey}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(generatedKey);
                      alert("Đã copy vào clipboard");
                    }}
                    style={{
                      padding: "8px 14px",
                      background: "#0E7490",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => {
                      setShowNewKey(false);
                      setGeneratedKey(null);
                    }}
                    style={{
                      padding: "8px 14px",
                      background: "#fff",
                      color: "#475569",
                      border: "1px solid #CBD5E1",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* WEBHOOKS TAB */}
        {tab === "webhooks" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button
                onClick={() => alert("Form thêm webhook mới (URL, events subscribed, secret HMAC).")}
                style={{
                  padding: "8px 16px",
                  background: "#0E7490",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ＋ Đăng ký webhook
              </button>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <Th>Webhook</Th>
                    <Th>Events</Th>
                    <Th style={{ width: 120 }}>Success rate</Th>
                    <Th style={{ width: 160, textAlign: "right" }}>Delivery (sent / fail)</Th>
                    <Th style={{ width: 110 }}>Trạng thái</Th>
                    <Th style={{ width: 100 }}>Hành động</Th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks.map((w) => (
                    <tr key={w.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, color: "#0F172A" }}>{w.name}</div>
                        <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace", marginTop: 2 }}>
                          {w.url}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {w.events.map((e) => (
                            <span
                              key={e}
                              style={{
                                background: "#F0FDF4",
                                color: "#166534",
                                padding: "2px 6px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontFamily: "monospace",
                              }}
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontVariantNumeric: "tabular-nums", color: w.successRate < 90 ? "#DC2626" : "#16A34A", fontWeight: 600 }}>
                          {w.successRate}%
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontSize: 12 }}>
                        <span style={{ color: "#475569" }}>{w.deliveryStats.sent.toLocaleString()}</span>
                        {" / "}
                        <span style={{ color: "#DC2626" }}>{w.deliveryStats.failed}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <WebhookStatusBadge status={w.status} />
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          onClick={() => handlePauseWebhook(w.id)}
                          style={{
                            padding: "4px 10px",
                            background: "#fff",
                            color: "#475569",
                            border: "1px solid #CBD5E1",
                            borderRadius: 6,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          {w.status === "paused" ? "Resume" : "Pause"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* DLQ TAB */}
        {tab === "dlq" && (
          <>
            <div
              style={{
                padding: 12,
                background: dlq.length > 0 ? "#FEE2E2" : "#ECFDF5",
                border: `1px solid ${dlq.length > 0 ? "#FCA5A5" : "#86EFAC"}`,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
                color: dlq.length > 0 ? "#991B1B" : "#065F46",
              }}
            >
              {dlq.length > 0
                ? `⚠️ ${dlq.length} webhook delivery thất bại sau 3 lần retry. Investigate root cause + manual retry hoặc mark resolved.`
                : "✅ DLQ rỗng — không có delivery thất bại."}
            </div>

            {dlq.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                      <Th>Event</Th>
                      <Th>Order/Ref</Th>
                      <Th>Lỗi cuối</Th>
                      <Th style={{ width: 80, textAlign: "center" }}>Retries</Th>
                      <Th style={{ width: 140 }}>Đầu tiên fail</Th>
                      <Th style={{ width: 150 }}>Hành động</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {dlq.map((d) => (
                      <tr key={d.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "#475569" }}>
                          {d.event}
                        </td>
                        <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12 }}>
                          {d.orderRef || "—"}
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "#DC2626" }}>{d.lastError}</td>
                        <td style={{ padding: "10px 14px", textAlign: "center" }}>
                          <span
                            style={{
                              background: "#FEE2E2",
                              color: "#991B1B",
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {d.retryCount} / 3
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "#475569" }}>
                          {formatDateTime(d.firstFailedAt)}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <button
                            onClick={() => handleRetryDlq(d.id)}
                            style={{
                              padding: "4px 10px",
                              background: "#0E7490",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 12,
                              cursor: "pointer",
                              fontWeight: 500,
                              marginRight: 4,
                            }}
                          >
                            Retry
                          </button>
                          <button
                            onClick={() => setDlq((prev) => prev.filter((x) => x.id !== d.id))}
                            style={{
                              padding: "4px 10px",
                              background: "#fff",
                              color: "#475569",
                              border: "1px solid #CBD5E1",
                              borderRadius: 6,
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            Mark resolved
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 14px",
        fontSize: 12,
        fontWeight: 600,
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        ...style,
      }}
    >
      {children}
    </th>
  );
}

function StatusBadge({ status }: { status: KeyStatus }) {
  const map = {
    active: { bg: "#D1FAE5", fg: "#065F46", label: "Active" },
    revoked: { bg: "#FEE2E2", fg: "#991B1B", label: "Revoked" },
    expired: { bg: "#F3F4F6", fg: "#6B7280", label: "Expired" },
  };
  const m = map[status];
  return (
    <span
      style={{
        background: m.bg,
        color: m.fg,
        padding: "3px 10px",
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {m.label}
    </span>
  );
}

function WebhookStatusBadge({ status }: { status: WebhookStatus }) {
  const map = {
    active: { bg: "#D1FAE5", fg: "#065F46", label: "Active" },
    paused: { bg: "#F3F4F6", fg: "#6B7280", label: "Paused" },
    failing: { bg: "#FEE2E2", fg: "#991B1B", label: "Failing" },
  };
  const m = map[status];
  return (
    <span
      style={{
        background: m.bg,
        color: m.fg,
        padding: "3px 10px",
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {m.label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN");
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { hour12: false });
}
