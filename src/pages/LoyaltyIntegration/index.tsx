// Trang Integration & API Docs — hướng dẫn tích hợp loyalty vào hệ thống bên ngoài
// Route: /loyalty_integration

import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";

const C = {
  primary: "#00C9A7",
  primaryDark: "#0B2E2A",
  primarySoft: "#E4F7F3",
  info: "#3B82F6",
  warning: "#F5A623",
  success: "#22C55E",
  textMain: "#1A2B28",
  textMuted: "#6B8A85",
  border: "#D9E0DE",
  bg: "#F5F9F8",
};

const BASE_URL = process.env.APP_BIZ_URL || "https://biz.reborn.vn";
const PREFIX = "/market";

type TabKey = "overview" | "auth" | "member" | "points" | "rewards" | "webhook" | "sdk";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "overview", label: "Tổng quan", icon: "📋" },
  { key: "auth", label: "Xác thực", icon: "🔑" },
  { key: "member", label: "Hội viên", icon: "👥" },
  { key: "points", label: "Tích / tiêu điểm", icon: "💰" },
  { key: "rewards", label: "Đổi thưởng", icon: "🎁" },
  { key: "webhook", label: "Webhook", icon: "🔔" },
  { key: "sdk", label: "SDK & Ví dụ", icon: "💻" },
];

export default function LoyaltyIntegration() {
  document.title = "Loyalty Integration & API Docs";
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <div style={{ background: C.bg, minHeight: "calc(100vh - 60px)" }}>
      <TitleAction title="Integration & API Docs" />

      <div style={{ display: "flex", gap: 0, padding: "0 20px 20px" }}>
        {/* Sidebar tabs */}
        <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "10px 14px",
                background: tab === t.key ? "#fff" : "transparent",
                border: tab === t.key ? `1px solid ${C.border}` : "1px solid transparent",
                borderRight: tab === t.key ? "none" : undefined,
                borderRadius: "8px 0 0 8px",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: tab === t.key ? 700 : 400,
                color: tab === t.key ? C.primaryDark : C.textMuted,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, background: "#fff", borderRadius: "0 12px 12px 12px", border: `1px solid ${C.border}`, padding: 24, overflow: "auto" }}>
          {tab === "overview" && <OverviewTab />}
          {tab === "auth" && <AuthTab />}
          {tab === "member" && <MemberTab />}
          {tab === "points" && <PointsTab />}
          {tab === "rewards" && <RewardsTab />}
          {tab === "webhook" && <WebhookTab />}
          {tab === "sdk" && <SdkTab />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TAB COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function OverviewTab() {
  return (
    <div>
      <H2>Tổng quan API Loyalty</H2>
      <P>API cho phép tích hợp hệ thống Loyalty của Reborn vào POS, app, website hoặc hệ thống bên thứ 3.</P>

      <H3>Base URL</H3>
      <Code>{BASE_URL}{PREFIX}</Code>

      <H3>Luồng tích hợp phổ biến</H3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FlowCard
          step="1"
          title="Tra cứu hội viên"
          desc="POS tra cứu khách bằng SĐT → lấy điểm, hạng, ưu đãi"
          method="GET"
          endpoint="/loyaltyWallet/getByCustomer"
        />
        <FlowCard
          step="2"
          title="Tích điểm sau thanh toán"
          desc="POS gửi hoá đơn → BE tự tính điểm theo rule"
          method="POST"
          endpoint="/loyaltyPointLedger/autoEarn"
        />
        <FlowCard
          step="3"
          title="Tiêu điểm tại quầy"
          desc="Khách dùng điểm trừ vào hoá đơn"
          method="POST"
          endpoint="/loyaltyPointLedger/consumePoint"
        />
        <FlowCard
          step="4"
          title="Đổi thưởng"
          desc="Khách đổi điểm lấy voucher, quà tặng"
          method="POST"
          endpoint="/loyaltyReward/redeem"
        />
      </div>

      <H3>Response format</H3>
      <CodeBlock>{`{
  "code": 0,          // 0 = success, != 0 = error
  "message": "OK",
  "result": { ... }   // data payload
}`}</CodeBlock>

      <H3>Rate limit</H3>
      <P>1000 request/phút/API key. Vượt quá → HTTP 429.</P>
    </div>
  );
}

function AuthTab() {
  return (
    <div>
      <H2>Xác thực API</H2>

      <H3>1. API Key (cho POS / hệ thống bên ngoài)</H3>
      <P>Gửi API key trong header mỗi request:</P>
      <CodeBlock>{`curl -X GET "${BASE_URL}${PREFIX}/loyaltyWallet/getByCustomer?customerId=123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Hostname: your-tenant.reborn.vn" \\
  -H "Content-Type: application/json"`}</CodeBlock>

      <InfoBox type="warning">
        <b>Hostname header</b> bắt buộc — xác định tenant (thương hiệu) của bạn.
        Liên hệ admin để lấy API key + hostname.
      </InfoBox>

      <H3>2. JWT Token (cho web/app nội bộ)</H3>
      <P>Dùng cho admin dashboard, lấy token qua login API:</P>
      <CodeBlock>{`POST /authenticator/login
{
  "username": "admin@company.vn",
  "password": "***"
}

→ Response: { "token": "eyJhbG..." }`}</CodeBlock>

      <H3>Headers bắt buộc</H3>
      <table style={tableStyle}>
        <thead><tr><th style={thStyle}>Header</th><th style={thStyle}>Giá trị</th><th style={thStyle}>Bắt buộc</th></tr></thead>
        <tbody>
          <tr><td style={tdStyle}><code>Authorization</code></td><td style={tdStyle}>Bearer {`{API_KEY hoặc JWT}`}</td><td style={tdStyle}>Có</td></tr>
          <tr><td style={tdStyle}><code>Hostname</code></td><td style={tdStyle}>{`{tenant}.reborn.vn`}</td><td style={tdStyle}>Có</td></tr>
          <tr><td style={tdStyle}><code>Content-Type</code></td><td style={tdStyle}>application/json</td><td style={tdStyle}>Có (POST/PUT)</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function MemberTab() {
  return (
    <div>
      <H2>API Hội viên (Member)</H2>

      <Endpoint method="GET" path="/loyaltyWallet/list" desc="Danh sách hội viên">
        <H4>Query params</H4>
        <ParamTable params={[
          ["page", "number", "1", "Trang"],
          ["limit", "number", "20", "Số bản ghi / trang"],
          ["customerName", "string", "", "Tìm theo tên"],
        ]} />
        <H4>Response</H4>
        <CodeBlock>{`{
  "code": 0,
  "result": {
    "items": [
      {
        "id": 1,
        "customerId": 42,
        "customerName": "Nguyễn Văn A",
        "currentBalance": 1250,
        "totalEarn": 3800,
        "segmentId": 2,
        "segmentName": "Bạc",
        "status": 1,
        "createdTime": "2026-01-15T08:30:00Z"
      }
    ],
    "total": 150,
    "page": 1
  }
}`}</CodeBlock>
      </Endpoint>

      <Endpoint method="GET" path="/loyaltyWallet/getByCustomer" desc="Tra cứu hội viên theo customer ID">
        <H4>Query params</H4>
        <ParamTable params={[["customerId", "number", "", "ID khách hàng (bắt buộc)"]]} />
        <H4>Response</H4>
        <CodeBlock>{`{
  "code": 0,
  "result": {
    "id": 1,
    "customerId": 42,
    "customerName": "Nguyễn Văn A",
    "currentBalance": 1250,
    "totalEarn": 3800,
    "segmentId": 2,
    "segmentName": "Bạc"
  }
}`}</CodeBlock>
      </Endpoint>

      <Endpoint method="POST" path="/loyaltyWallet/update" desc="Tạo / cập nhật hội viên">
        <CodeBlock>{`{
  "customerId": 42,
  "status": 1        // 1 = active
}`}</CodeBlock>
      </Endpoint>

      <Endpoint method="POST" path="/loyaltyWallet/import" desc="Import hội viên hàng loạt">
        <P>Content-Type: <code>multipart/form-data</code></P>
        <P>File CSV cột: Họ tên, SĐT, Email, Điểm, Hạng</P>
        <CodeBlock>{`{
  "code": 0,
  "result": {
    "total": 1500,
    "imported": 1480,
    "skipped": 20,
    "errors": [{ "row": 42, "reason": "DUPLICATE_PHONE" }]
  }
}`}</CodeBlock>
      </Endpoint>
    </div>
  );
}

function PointsTab() {
  return (
    <div>
      <H2>API Tích / Tiêu điểm</H2>

      <Endpoint method="POST" path="/loyaltyPointLedger/autoEarn" desc="Tích điểm tự động từ hoá đơn (POS gọi sau thanh toán)">
        <CodeBlock>{`{
  "phone": "0901234567",
  "orderAmount": 520000,
  "orderId": "INV-2026-001234",
  "orderDate": "2026-04-16T14:30:00Z",
  "branchId": 42,
  "items": [
    { "sku": "SP001", "categoryId": 5, "amount": 320000 },
    { "sku": "SP002", "categoryId": 8, "amount": 200000 }
  ]
}`}</CodeBlock>
        <H4>Response</H4>
        <CodeBlock>{`{
  "code": 0,
  "result": {
    "pointsEarned": 52,
    "newBalance": 1302,
    "walletId": 1
  }
}`}</CodeBlock>
        <InfoBox type="info">
          BE tự tính điểm theo loyalty rules đã cấu hình. FE/POS <b>không cần tính</b>.
        </InfoBox>
      </Endpoint>

      <Endpoint method="POST" path="/loyaltyPointLedger/fluctuatePoint" desc="Cộng / trừ điểm thủ công">
        <CodeBlock>{`{
  "walletId": 1,
  "customerId": 42,
  "point": 100,          // dương = cộng, âm = trừ
  "description": "Thưởng sinh nhật"
}`}</CodeBlock>
      </Endpoint>

      <Endpoint method="POST" path="/loyaltyPointLedger/consumePoint" desc="Tiêu điểm (khách dùng điểm thanh toán)">
        <CodeBlock>{`{
  "walletId": 1,
  "customerId": 42,
  "point": 50,
  "description": "Thanh toán đơn #INV-001234"
}`}</CodeBlock>
        <InfoBox type="warning">
          Kiểm tra <code>{"currentBalance >= point"}</code> trước khi gọi. BE sẽ reject nếu không đủ điểm.
        </InfoBox>
      </Endpoint>

      <Endpoint method="GET" path="/loyaltyPointLedger/list" desc="Lịch sử tích/tiêu điểm">
        <ParamTable params={[
          ["customerId", "number", "", "Lọc theo khách hàng"],
          ["page", "number", "1", ""],
          ["limit", "number", "20", ""],
        ]} />
      </Endpoint>
    </div>
  );
}

function RewardsTab() {
  return (
    <div>
      <H2>API Đổi thưởng</H2>

      <Endpoint method="GET" path="/loyaltyReward/list" desc="Danh sách phần thưởng khả dụng">
        <CodeBlock>{`{
  "code": 0,
  "result": {
    "items": [
      {
        "id": 1,
        "name": "Voucher giảm 50K",
        "pointsRequired": 200,
        "rewardType": "Voucher",
        "totalLimit": 100,
        "usedCount": 42,
        "expiryDate": "2026-12-31"
      }
    ]
  }
}`}</CodeBlock>
      </Endpoint>

      <Endpoint method="GET" path="/loyaltySegment/list" desc="Danh sách hạng thành viên">
        <CodeBlock>{`{
  "code": 0,
  "result": {
    "items": [
      { "id": 1, "name": "Đồng", "point": 0, "rate": "0.5%", "benefits": "[\\"Tích điểm 0.5%\\"]" },
      { "id": 2, "name": "Bạc", "point": 100, "rate": "1%", "benefits": "[\\"Tích điểm 1%\\",\\"Giảm 5% ngày sinh nhật\\"]" },
      { "id": 3, "name": "Vàng", "point": 450, "rate": "1.5%", "benefits": "[\\"Tích điểm 1.5%\\",\\"Free shipping\\"]" },
      { "id": 4, "name": "Kim Cương", "point": 800, "rate": "2%", "benefits": "[\\"Tích điểm 2%\\",\\"VIP lounge\\",\\"Ưu tiên CSKH\\"]" }
    ]
  }
}`}</CodeBlock>
      </Endpoint>

      <Endpoint method="GET" path="/loyaltyConfig/get" desc="Cấu hình loyalty (tỷ giá, hạn điểm, thăng hạng...)">
        <CodeBlock>{`{
  "code": 0,
  "result": {
    "exchangeRate": 1000,
    "extendedConfig": {
      "pointExpiry": { "expiryType": "end_of_year", "expiryAnnualDate": "12-31" },
      "tierEval": { "enabled": true, "evalPeriod": "quarterly" },
      "loyaltyScope": "chain_wide",
      "crossBrandPoints": true
    }
  }
}`}</CodeBlock>
      </Endpoint>
    </div>
  );
}

function WebhookTab() {
  return (
    <div>
      <H2>Webhook Events</H2>
      <P>Đăng ký webhook để nhận thông báo realtime khi có sự kiện loyalty. Cấu hình tại <b>Cài đặt → Tích hợp & kết nối</b>.</P>

      <H3>Events</H3>
      <table style={tableStyle}>
        <thead><tr><th style={thStyle}>Event</th><th style={thStyle}>Mô tả</th><th style={thStyle}>Payload</th></tr></thead>
        <tbody>
          <tr><td style={tdStyle}><code>loyalty.points.earned</code></td><td style={tdStyle}>Khách tích điểm</td><td style={tdStyle}>{`{ walletId, customerId, points, newBalance }`}</td></tr>
          <tr><td style={tdStyle}><code>loyalty.points.consumed</code></td><td style={tdStyle}>Khách tiêu điểm</td><td style={tdStyle}>{`{ walletId, customerId, points, newBalance }`}</td></tr>
          <tr><td style={tdStyle}><code>loyalty.points.expired</code></td><td style={tdStyle}>Điểm hết hạn</td><td style={tdStyle}>{`{ walletId, customerId, expiredPoints }`}</td></tr>
          <tr><td style={tdStyle}><code>loyalty.tier.changed</code></td><td style={tdStyle}>Thay đổi hạng</td><td style={tdStyle}>{`{ walletId, oldTier, newTier, direction }`}</td></tr>
          <tr><td style={tdStyle}><code>loyalty.member.created</code></td><td style={tdStyle}>Hội viên mới</td><td style={tdStyle}>{`{ walletId, customerId, customerName }`}</td></tr>
          <tr><td style={tdStyle}><code>loyalty.reward.redeemed</code></td><td style={tdStyle}>Đổi thưởng</td><td style={tdStyle}>{`{ walletId, rewardId, pointsUsed }`}</td></tr>
        </tbody>
      </table>

      <H3>Webhook request format</H3>
      <CodeBlock>{`POST https://your-system.com/webhook
Content-Type: application/json
X-Webhook-Secret: your_secret_key

{
  "event": "loyalty.points.earned",
  "timestamp": "2026-04-16T14:30:00Z",
  "tenantId": 1,
  "data": {
    "walletId": 1,
    "customerId": 42,
    "points": 52,
    "newBalance": 1302
  }
}`}</CodeBlock>
    </div>
  );
}

function SdkTab() {
  return (
    <div>
      <H2>SDK & Code mẫu</H2>

      <H3>cURL — Tra cứu hội viên</H3>
      <CodeBlock>{`curl -X GET "${BASE_URL}${PREFIX}/loyaltyWallet/getByCustomer?customerId=42" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Hostname: brand-a.reborn.vn"`}</CodeBlock>

      <H3>JavaScript / Node.js</H3>
      <CodeBlock>{`const API_KEY = "your_api_key";
const BASE = "${BASE_URL}${PREFIX}";
const HOSTNAME = "brand-a.reborn.vn";

// Tra cứu hội viên
async function getMember(customerId) {
  const res = await fetch(\`\${BASE}/loyaltyWallet/getByCustomer?customerId=\${customerId}\`, {
    headers: {
      Authorization: \`Bearer \${API_KEY}\`,
      Hostname: HOSTNAME,
    },
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.message);
  return data.result;
}

// Tích điểm sau thanh toán
async function earnPoints(phone, orderAmount, orderId) {
  const res = await fetch(\`\${BASE}/loyaltyPointLedger/autoEarn\`, {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${API_KEY}\`,
      Hostname: HOSTNAME,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone, orderAmount, orderId }),
  });
  const data = await res.json();
  return data.result; // { pointsEarned, newBalance }
}`}</CodeBlock>

      <H3>Python</H3>
      <CodeBlock>{`import requests

API_KEY = "your_api_key"
BASE = "${BASE_URL}${PREFIX}"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Hostname": "brand-a.reborn.vn",
    "Content-Type": "application/json",
}

# Tra cứu hội viên
def get_member(customer_id):
    r = requests.get(f"{BASE}/loyaltyWallet/getByCustomer",
                     params={"customerId": customer_id}, headers=HEADERS)
    return r.json()["result"]

# Tích điểm
def earn_points(phone, order_amount, order_id):
    r = requests.post(f"{BASE}/loyaltyPointLedger/autoEarn",
                      json={"phone": phone, "orderAmount": order_amount, "orderId": order_id},
                      headers=HEADERS)
    return r.json()["result"]`}</CodeBlock>

      <H3>Tích hợp POS — Flow đề xuất</H3>
      <div style={{ padding: 16, background: C.primarySoft, borderRadius: 10, fontSize: 13, lineHeight: 1.8 }}>
        <b>1.</b> Khách đưa SĐT / quét thẻ → <code>GET /loyaltyWallet/getByCustomer</code><br/>
        <b>2.</b> Hiện điểm + hạng trên màn hình POS<br/>
        <b>3.</b> Khách muốn dùng điểm → tính <code>pointsToUse * exchangeRate</code> trừ vào hoá đơn<br/>
        <b>4.</b> Thanh toán xong → <code>POST /loyaltyPointLedger/consumePoint</code> (trừ điểm)<br/>
        <b>5.</b> Sau đó → <code>POST /loyaltyPointLedger/autoEarn</code> (tích điểm từ hoá đơn mới)<br/>
        <b>6.</b> Hiện receipt: điểm đã dùng, điểm mới tích, số dư mới
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ margin: "0 0 12px", fontSize: 18, color: C.primaryDark }}>{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ margin: "20px 0 8px", fontSize: 14, color: C.primaryDark }}>{children}</h3>;
}
function H4({ children }: { children: React.ReactNode }) {
  return <h4 style={{ margin: "12px 0 6px", fontSize: 13, color: C.primaryDark }}>{children}</h4>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 13, color: C.textMain, lineHeight: 1.6, margin: "0 0 8px" }}>{children}</p>;
}
function Code({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "10px 14px", background: C.primaryDark, color: "#A7F3D0", borderRadius: 8, fontFamily: "monospace", fontSize: 13, marginBottom: 12 }}>
      {children}
    </div>
  );
}
function CodeBlock({ children }: { children: string }) {
  return (
    <pre style={{ padding: 14, background: "#1E293B", color: "#E2E8F0", borderRadius: 8, fontSize: 12, overflow: "auto", margin: "0 0 12px", lineHeight: 1.5, fontFamily: "'Fira Code', 'Consolas', monospace" }}>
      {children}
    </pre>
  );
}
function InfoBox({ children, type }: { children: React.ReactNode; type: "info" | "warning" }) {
  const colors = type === "info"
    ? { bg: "#EFF6FF", border: C.info, text: "#1E40AF" }
    : { bg: "#FFFBEB", border: C.warning, text: "#92400E" };
  return (
    <div style={{ padding: "10px 14px", background: colors.bg, borderLeft: `4px solid ${colors.border}`, borderRadius: 6, color: colors.text, fontSize: 12, margin: "8px 0 12px", lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

function Endpoint({ method, path, desc, children }: { method: string; path: string; desc: string; children: React.ReactNode }) {
  const methodColor = method === "GET" ? C.success : method === "POST" ? C.info : C.warning;
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: C.bg, display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ padding: "3px 10px", background: methodColor, color: "#fff", borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>{method}</span>
        <code style={{ fontSize: 13, fontWeight: 700, color: C.primaryDark }}>{PREFIX}{path}</code>
        <span style={{ fontSize: 12, color: C.textMuted, marginLeft: "auto" }}>{desc}</span>
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

function FlowCard({ step, title, desc, method, endpoint }: { step: string; title: string; desc: string; method: string; endpoint: string }) {
  return (
    <div style={{ padding: 14, border: `1px solid ${C.border}`, borderRadius: 10, background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ width: 24, height: 24, borderRadius: "50%", background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{step}</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: C.primaryDark }}>{title}</span>
      </div>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>{desc}</div>
      <code style={{ fontSize: 11, background: C.bg, padding: "3px 8px", borderRadius: 4, color: C.primaryDark }}>{method} {endpoint}</code>
    </div>
  );
}

function ParamTable({ params }: { params: string[][] }) {
  return (
    <table style={tableStyle}>
      <thead><tr><th style={thStyle}>Param</th><th style={thStyle}>Type</th><th style={thStyle}>Default</th><th style={thStyle}>Mô tả</th></tr></thead>
      <tbody>
        {params.map(([name, type, def, desc]) => (
          <tr key={name}><td style={tdStyle}><code>{name}</code></td><td style={tdStyle}>{type}</td><td style={tdStyle}>{def || "—"}</td><td style={tdStyle}>{desc}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 12 };
const thStyle: React.CSSProperties = { padding: "8px 10px", background: C.bg, textAlign: "left", fontWeight: 700, fontSize: 11, color: C.primaryDark, borderBottom: `1px solid ${C.border}` };
const tdStyle: React.CSSProperties = { padding: "8px 10px", borderBottom: `1px solid ${C.border}` };
