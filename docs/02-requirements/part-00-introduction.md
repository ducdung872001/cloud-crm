# Part 00 — Giới thiệu

## 1. Mục đích

Tài liệu URD này mô tả **yêu cầu nghiệp vụ chi tiết** của **Reborn Loyalty Platform** dùng cho chuỗi siêu thị bán lẻ 2 brand, ~300 cửa hàng, 3 triệu KHTV. Tài liệu trả lời câu hỏi: *Hệ thống PHẢI làm được những gì?*

URD KHÔNG mô tả:
- **Cách thực hiện kỹ thuật** (đó là SA — `../03-architecture/`)
- **Cách end user thao tác** (đó là HDSD — `../09-userguides/`)
- **Phân tích kinh tế** (đó là analysis — `../06-analysis/`)

## 2. Phạm vi

### 2.1. Trong phạm vi

- **Loyalty engine:** Hội viên, profile 360°, tích/tiêu điểm, hạng, đổi thưởng, hết hạn điểm
- **Promotion engine** gắn loyalty: multiplier, campaign theo segment, buy-X-get-Y
- **Cross-brand:** scope chain-wide / per-brand / per-store-group; tỷ giá chuyển đổi điểm
- **POS integration:** webhook auto-earn, API tra cứu, idempotency, sandbox
- **CSKH:** ticket khiếu nại gắn profile KH, feedback nâng cao, warranty (chỉ phần liên quan KH loyalty)
- **Analytics:** dashboard KPI, RFM, CLV, retention, churn signal, cohort
- **Settings & Admin:** cấu hình rule, scope, expiry mode; phân quyền; audit log
- **Bulk operations:** import 3M KH, dedupe by phone, merge cross-brand
- **Marketing automation:** Email/SMS/Zalo OA gửi thông báo điểm/hạng/campaign

### 2.2. Ngoài phạm vi (out-of-scope của dự án loyalty)

- POS bán hàng tại quầy — **giữ nguyên hệ thống hiện có của khách**
- Quản lý kho, NCC, mua hàng, vận chuyển — không thuộc loyalty
- Tài chính, kế toán, công nợ — không thuộc loyalty
- BPM workflow engine generic — chỉ dùng cho automation loyalty đơn giản
- e-invoice (VNPT, M-Invoice) — không thuộc loyalty

> Lưu ý: URD generic cho POS/kho/v.v. nằm trong [`../_legacy/urd/`](../_legacy/urd/) — chỉ tham chiếu, không cập nhật.

## 3. Stakeholder

| Vai trò | Tổ chức | Quan tâm chính |
|---|---|---|
| **Sponsor / BOD** | Khách hàng | ROI, lộ trình, tiến độ, rủi ro |
| **Phòng Marketing/CRM** | Khách hàng | Tính năng campaign, RFM, A/B test, automation |
| **Phòng CNTT&CĐS** | Khách hàng | Tích hợp POS, hạ tầng, security, vận hành |
| **Quản lý chuỗi** | Khách hàng | Dashboard tổng hợp, drill-down by brand/store |
| **Cashier / Store Staff** | Khách hàng (~3.000 nhân viên) | Quét thẻ KH < 1s, hiển thị tier/điểm |
| **CSKH** | Khách hàng | Tra cứu hồ sơ KH 360°, ticket khiếu nại |
| **Khách hàng cuối (KHTV)** | 3 triệu người | Tích điểm chính xác, đổi quà dễ, nhận thông báo đúng |
| **Reborn PM/Tech Lead** | Reborn JSC | Đảm bảo deliverable, SLA, bảo hành |

## 4. Glossary — Thuật ngữ Loyalty

| Thuật ngữ | Định nghĩa |
|---|---|
| **KHTV / Member** | Khách hàng thành viên đã đăng ký loyalty program |
| **Profile 360°** | Hồ sơ KH thống nhất gộp data từ Goldmem + Access + Excel + Supporter |
| **Points / Điểm** | Đơn vị tích luỹ, dùng để đổi thưởng hoặc giảm trực tiếp hoá đơn |
| **Ledger / Sổ cái điểm** | Lịch sử mọi biến động điểm: earn, redeem, expire, adjust, refund — append-only |
| **Earn rule** | Quy tắc tính điểm: theo amount, category, fixed-per-order, multiplier |
| **Tier / Hạng** | Cấp bậc thành viên: Bronze / Silver / Gold / Diamond (tên + ngưỡng + benefits cấu hình) |
| **Tier evaluation** | Quy trình rà soát định kỳ để upgrade/downgrade KH |
| **Grace period / Ân hạn** | Số kỳ KH được giữ tier dù không đạt ngưỡng duy trì, trước khi downgrade thực sự |
| **Expiry / Hết hạn** | Điểm tự động bị trừ sau N tháng hoặc cuối năm |
| **Breakage** | % điểm phát hành nhưng KH không bao giờ tiêu (lợi cho doanh nghiệp) |
| **Redemption rate** | % điểm phát hành đã được KH đổi thưởng |
| **Liability** | Tổng giá trị tiền của điểm chưa tiêu (ghi nhận làm nợ kế toán) |
| **Cost per point (CPP)** | Chi phí thực tế của 1 điểm khi quy đổi (VD: 1 điểm = 1.000đ thì CPP = 1.000đ giả định 100% breakage = 0%) |
| **Scope** | Phạm vi áp dụng loyalty: `chain_wide` / `per_brand` / `per_store_group` |
| **Cross-brand points** | Cho phép KH chuyển điểm giữa các brand theo tỷ giá cấu hình |
| **RFM** | Recency (mua gần đây), Frequency (tần suất), Monetary (giá trị) — phân khúc KH |
| **CLV / LTV** | Customer Lifetime Value — tổng giá trị KH mang lại trong vòng đời |
| **Churn** | Khách rời bỏ (không phát sinh giao dịch trong N tháng) |
| **Auto-earn** | Tự động cộng điểm khi POS gửi webhook order.completed |
| **Idempotency** | Webhook gửi trùng `order_ref` không cộng điểm lần 2 |
| **Webhook outbound** | Reborn gửi event ra cho hệ thống bên ngoài (POS, app, partner) khi `points.earned`, `tier.changed`, ... |

## 5. Tham chiếu

- **Bài toán & insight:** [`../01-business/gap-analysis.md`](../01-business/gap-analysis.md)
- **Đề xuất giải pháp:** [`../01-business/proposal/proposal-loyalty-banle.md`](../01-business/proposal/proposal-loyalty-banle.md)
- **Kiến trúc kỹ thuật:** [`../03-architecture/`](../03-architecture/)
- **Phân tích chuyên sâu:** [`../06-analysis/`](../06-analysis/)
- **OpenAPI:** [`../04-api/loyalty-openapi.yaml`](../04-api/loyalty-openapi.yaml)

## 6. Lịch sử phiên bản

| Version | Ngày | Tác giả | Thay đổi |
|---|---|---|---|
| 0.1 | 2026-04-16 | Reborn | Draft đầu tiên (mở rộng UR-LOY-01→20 từ URD retail generic) |
| 1.0 | 2026-05-11 | Reborn | Rewrite hoàn toàn theo bài toán loyalty siêu thị (12 parts, 80+ requirements) |
