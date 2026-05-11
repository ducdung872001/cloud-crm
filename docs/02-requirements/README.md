# 02-Requirements — URD Loyalty-Focused

**User Requirement Document** — yêu cầu nghiệp vụ chi tiết cho **Reborn Loyalty Platform**, viết theo chuẩn **IEEE 830 / ISO/IEC 29148**.

> **Khác biệt với URD generic CRM:** Tài liệu này **chỉ tập trung loyalty** — hội viên, tích điểm, hạng, đổi thưởng, khuyến mãi gắn loyalty, tích hợp POS, CSKH liên quan loyalty, báo cáo loyalty. POS bán hàng / kho / mua NCC / vận chuyển generic được archive trong [`../_legacy/urd/`](../_legacy/urd/).

## Cấu trúc 12 phần

| Part | Tiêu đề | Phạm vi |
|---|---|---|
| [part-00](part-00-introduction.md) | Giới thiệu, phạm vi, glossary | Mục đích, scope, MoSCoW, thuật ngữ loyalty |
| [part-01](part-01-actors-roles.md) | Actor & Permission | 8 role + ma trận quyền |
| [part-02](part-02-membership-core.md) | Hội viên — Profile 360° | Đăng ký, lookup, dedupe, merge cross-brand |
| [part-03](part-03-points-engine.md) | Engine tích/tiêu điểm | Earn rules, FIFO consume, ledger, idempotency |
| [part-04](part-04-membership-tiers.md) | Hạng thành viên | Tier definition, auto evaluation, grace period |
| [part-05](part-05-rewards-redemption.md) | Catalog quà & Đổi thưởng | Voucher, hiện vật, dịch vụ; redemption flow |
| [part-06](part-06-promotions-campaigns.md) | Khuyến mãi & Campaign | Multiplier, buy-X-get-Y, time-based |
| [part-07](part-07-cross-brand-scope.md) | Phạm vi loyalty | Chain-wide / per-brand / per-store-group |
| [part-08](part-08-pos-integration.md) | Tích hợp POS | Webhook, API key, idempotency, sandbox |
| [part-09](part-09-cskh-feedback.md) | CSKH gắn loyalty | Ticket khiếu nại, feedback, warranty |
| [part-10](part-10-analytics-reports.md) | Dashboard & Báo cáo | KPI, RFM, CLV, retention, export |
| [part-11](part-11-settings-admin.md) | Cấu hình & Admin | Settings, audit log, module toggle |
| [part-12](part-12-nfr.md) | Phi chức năng | Performance, security, scalability cho 3M KH |

## Quy ước

### Mã yêu cầu

```
UR-<DOMAIN>-<NN>
```

| Domain | Phạm vi |
|---|---|
| `UR-MBR-NN` | Membership (Part 02) |
| `UR-PTS-NN` | Points engine (Part 03) |
| `UR-TIER-NN` | Tier (Part 04) |
| `UR-RWD-NN` | Rewards (Part 05) |
| `UR-PROMO-NN` | Promotion/campaign (Part 06) |
| `UR-SCOPE-NN` | Cross-brand scope (Part 07) |
| `UR-POS-NN` | POS integration (Part 08) |
| `UR-CARE-NN` | CSKH (Part 09) |
| `UR-RPT-NN` | Analytics (Part 10) |
| `UR-CFG-NN` | Settings (Part 11) |
| `UR-NFR-NN` | Phi chức năng (Part 12) |

### Template yêu cầu

| Trường | Ý nghĩa |
|---|---|
| **ID** | Mã định danh |
| **Tên** | Mô tả ngắn |
| **Actor** | Vai trò người dùng / hệ thống |
| **Mô tả** | Chi tiết hành vi |
| **Tiền điều kiện** | Điều kiện trước thực hiện |
| **Đầu vào** | Dữ liệu vào |
| **Đầu ra** | Trạng thái sau |
| **Tiêu chí chấp nhận** | Cách kiểm chứng |
| **Ưu tiên** | M (Must) / S (Should) / C (Could) / W (Won't) |

### MoSCoW priorities

- **M (Must)** — Bắt buộc, thiếu là hệ thống không vận hành được
- **S (Should)** — Cao, nhưng có thể hoãn 1–2 tháng
- **C (Could)** — Có thì tốt, không có không sao
- **W (Won't this phase)** — Hoãn phase sau
