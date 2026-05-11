# Part 01 — System Context (C4 Level 1)

## 1. Context diagram

```
                           ┌──────────────────────────────────────┐
                           │                                       │
   ┌────────────┐          │   REBORN LOYALTY PLATFORM             │           ┌──────────────────┐
   │ KHTV (3M)  │──HTTPS──►│                                       │◄──HMAC───│ SSO Reborn       │
   │ Browser/App│          │   ┌─────────────────────────────┐    │  OAuth   │ (Identity central)│
   └────────────┘          │   │  Admin SPA / Member App     │    │           └──────────────────┘
                           │   └─────────────┬───────────────┘    │
                           │                 │ REST                │
   ┌────────────┐          │   ┌─────────────▼───────────────┐    │
   │ Admin /    │──HTTPS──►│   │  API Gateway + Auth         │    │
   │ Marketing  │          │   └─────────────┬───────────────┘    │
   │ (~50 users)│          │                 │                     │
   └────────────┘          │   ┌─────────────▼───────────────┐    │           ┌──────────────────┐
                           │   │  Loyalty Microservices      │◄───┼──────────│ POS Brand A      │
   ┌────────────┐          │   │  (market, customer, care,   │    │  Webhook │ (300 stores)     │
   │ Cashier    │──HTTPS──►│   │   notification, analytics)  │    │  REST    └──────────────────┘
   │ (3.000)    │          │   └─────────────┬───────────────┘    │           ┌──────────────────┐
   └────────────┘          │                 │                     │◄─────────│ POS Brand B      │
                           │   ┌─────────────▼───────────────┐    │           │ (different stack)│
   ┌────────────┐          │   │  Data Layer                 │    │           └──────────────────┘
   │ CSKH (30)  │──HTTPS──►│   │  (Postgres, Redis,          │    │
   └────────────┘          │   │   ClickHouse, S3)           │    │           ┌──────────────────┐
                           │   └─────────────────────────────┘    │──────────►│ SMS Gateway      │
                           │                                       │           │ (Viettel/VNPT)   │
                           │                                       │           └──────────────────┘
                           │                                       │           ┌──────────────────┐
                           │                                       │──────────►│ Zalo OA API      │
                           │                                       │           └──────────────────┘
                           │                                       │           ┌──────────────────┐
                           │                                       │──────────►│ Email (SES/SMTP) │
                           │                                       │           └──────────────────┘
                           │                                       │           ┌──────────────────┐
                           │                                       │◄─────────│ Legacy Goldmem   │
                           │                                       │ ETL once  │ Access/Excel/    │
                           │                                       │ migration │ Supporter        │
                           │                                       │           └──────────────────┘
                           └──────────────────────────────────────┘
```

## 2. External actors

| Actor | Quy mô | Tương tác | Auth |
|---|---|---|---|
| **KHTV (Khách hàng cuối)** | 3M | Đăng ký, xem điểm/hạng, đổi quà qua app/web | OTP + JWT |
| **Admin (HO)** | ~5 | Cấu hình toàn hệ thống | SSO + RBAC |
| **Marketing Mgr / BA / Brand Mgr** | ~15 | Tạo campaign, xem analytics | SSO + RBAC |
| **CSKH** | ~30 | Tra cứu KH, xử lý ticket | SSO + RBAC |
| **Cashier / Store Manager** | ~3.000 → 15.000 | Lookup KH tại quầy | SSO (qua POS pass-through) hoặc local creds |
| **External POS (Brand A + B)** | 300 → 1.500 endpoint | Auto-earn webhook, lookup | API Key + HMAC |

## 3. External systems

| System | Hướng | Protocol | Mục đích |
|---|---|---|---|
| **SSO Reborn** | Inbound (admin login) | OAuth2/OIDC | Authn cho admin |
| **POS Brand A** | Inbound (webhook) | REST/JSON + HMAC | Order completed events |
| **POS Brand B** | Inbound (webhook) | REST/JSON + HMAC | Order completed events (schema có thể khác → adapter) |
| **SMS Gateway** (Viettel/VNPT/EVN) | Outbound | REST API | Gửi OTP, notification |
| **Zalo OA API** | Outbound | REST + signed | Gửi ZNS notification |
| **Email (AWS SES / SMTP)** | Outbound | SMTP/REST | Email campaign + transactional |
| **Goldmem/Access/Excel/Supporter** | Inbound (one-time migration) | CSV / DB dump | Initial data load |
| **Optional: BI tool (Tableau/Metabase)** | Outbound | JDBC read-only | Khách hàng tự build BI |
| **Optional: Marketplace (Shopee/Lazada)** | Phase 2 | REST API | Sync member khi mua online |

## 4. System scope

```
                  ┌──────────────────────────────────┐
                  │   IN SCOPE — Reborn Loyalty       │
                  │                                   │
                  │ • Loyalty engine (points/tier/    │
                  │   reward/campaign/expire)         │
                  │ • Customer 360°                   │
                  │ • CSKH ticket workflow            │
                  │ • Notification engine             │
                  │ • Analytics (RFM/CLV/cohort)      │
                  │ • Admin web UI                    │
                  │ • Member-facing app/web           │
                  │ • API for POS integration         │
                  │ • Migration ETL pipeline          │
                  └────────────┬─────────────────────┘
                               │ integrates with
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
  │ OUT OF SCOPE │       │  REUSE       │       │  CHANGE-     │
  │ • POS bán    │       │  REBORN      │       │  REQUIRED    │
  │   hàng       │       │  PLATFORM    │       │  AT POS      │
  │ • Kho        │       │ • SSO Reborn │       │ • Webhook    │
  │ • Mua NCC    │       │ • Notification│       │   integration│
  │ • Vận chuyển │       │   service    │       │ • Lookup     │
  │ • E-invoice  │       │ • Auth       │       │   member     │
  │ • Tài chính  │       │ • BPM (gen.) │       │ • Voucher    │
  │   kế toán    │       │              │       │   validate   │
  └──────────────┘       └──────────────┘       └──────────────┘
```

## 5. Use case scenarios — TOP 5

| # | Scenario | Frequency | Latency target | Importance |
|---|---|---|---|---|
| 1 | KH mua tại POS, tự động tích điểm | 150K/ngày peak 300K | P95 < 500ms | 🔴 Critical |
| 2 | Cashier scan thẻ KH lookup | 150K/ngày | P95 < 300ms | 🔴 Critical |
| 3 | KH dùng điểm giảm giá tại POS | 20K/ngày | P95 < 400ms | 🔴 Critical |
| 4 | KH đổi reward qua app | 5K/ngày | P95 < 1s | 🟡 High |
| 5 | Admin tạo + launch campaign | 5/ngày | n/a (background) | 🟡 High |

Chi tiết sequence: [`part-05-api-integration.md`](part-05-api-integration.md).

## 6. Boundary

| | Trong | Ngoài |
|---|---|---|
| **Sở hữu** | Reborn JSC vận hành | Khách hàng vận hành hoặc third-party |
| **Code** | Reborn repo | Khách / vendor khác |
| **Data** | Loyalty DB, ledger, profile | Order data tại POS, kho tại WMS |
| **Auth** | Member auth, API key | SSO admin (delegate ra hệ SSO trung tâm) |
| **Failure isolation** | Reborn down → POS vẫn bán được (offline mode, sync sau) | POS down → loyalty không nhận events, DLQ accumulate |

> **Quan trọng:** Hệ thống thiết kế để POS có thể tiếp tục hoạt động khi Reborn Loyalty tạm down. POS lưu local queue, retry khi Reborn lên lại. KH có thể vẫn đăng ký/tích điểm offline → POS sync sau.

## 7. Tham chiếu

- Container view (next level C4): [`part-04-microservices.md`](part-04-microservices.md)
- API contract: [`part-05-api-integration.md`](part-05-api-integration.md)
- Migration từ Goldmem/Access/Excel: [`../06-analysis/data-migration-strategy.md`](../06-analysis/data-migration-strategy.md)
