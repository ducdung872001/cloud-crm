# TESTCASE INDEX — Cloud CRM (Community Hub)

Nguồn: sidebar menu của app (`src/configs/routes.tsx`, `src/components/sidebar`).
Quy ước mã: `TC-{MODULE}-{NNN}`. Script tự động: `node tests/test-{module}-{type}.mjs`.

## Phạm vi (theo sidebar)

| # | Menu cấp 1 | Submenu | File TC | Script CRUD | Ưu tiên |
|---|---|---|---|---|---|
| 1 | Dashboard | — | TC-DASHBOARD.md | test-dashboard.mjs | P2 |
| 2 | Lễ tân | Bán hàng tại quầy | TC-POS.md | test-pos-flow.mjs | P1 |
| 2 | Lễ tân | Check-in / Cửa vào | TC-CHECKIN.md | test-checkin-crud.mjs | P1 |
| 2 | Lễ tân | Trừ quota dịch vụ | TC-SERVICE-BOOKING.md | test-service-booking-crud.mjs | P1 |
| 2 | Lễ tân | Quản lý ca làm việc | TC-SHIFT.md | test-shift-crud.mjs | P2 |
| 3 | Thành viên | Danh sách thành viên | TC-CUSTOMER.md | test-customer-crud.mjs | P1 |
| 3 | Thành viên | Cài đặt thành viên | TC-SETTING-CUSTOMER.md | test-setting-customer-crud.mjs | P2 |
| 4 | Giao dịch | Danh sách đơn | TC-SALE-INVOICE.md | test-sale-invoice-crud.mjs | P1 |
| 4 | Giao dịch | Hóa đơn VAT | TC-INVOICE-VAT.md | test-invoice-vat-crud.mjs | P2 |
| 5 | Lưu trú | — | TC-ACCOMMODATION.md | test-accommodation-crud.mjs | P2 |
| 6 | Tài chính | Tổng quan | TC-FINANCE-DASHBOARD.md | test-finance-dashboard.mjs | P3 |
| 6 | Tài chính | Sổ thu chi | TC-FINANCE-CASHBOOK.md | test-finance-cashbook-crud.mjs | P1 |
| 6 | Tài chính | Quản lý quỹ | TC-FINANCE-FUND.md | test-finance-fund-crud.mjs | P2 |
| 6 | Tài chính | Khoản mục | TC-FINANCE-CATEGORY.md | test-finance-category-crud.mjs | P2 |
| 6 | Tài chính | Công nợ | TC-FINANCE-DEBT.md | test-finance-debt-crud.mjs | P2 |
| 6 | Tài chính | Đối soát thanh toán | TC-PAYMENT-CONTROL.md | test-payment-control.mjs | P3 |
| 7 | Đối tác | — | TC-PARTNER.md | test-partner-crud.mjs | P2 |
| 8 | Phản hồi | — | TC-FEEDBACK.md | test-feedback-crud.mjs | P3 |
| 9 | Báo cáo | 6 tab | TC-REPORTS.md | test-reports.mjs | P3 |
| 10 | Ưu đãi & CS | Khuyến mãi & Voucher | TC-PROMOTION.md | test-promotion-crud.mjs | P1 |
| 10 | Ưu đãi & CS | Tích điểm hội viên | TC-LOYALTY.md | test-loyalty-crud.mjs | P2 |
| 10 | Ưu đãi & CS | Chiến dịch MKT | TC-MARKETING-CAMPAIGN.md | test-marketing-campaign-crud.mjs | P2 |
| 10 | Ưu đãi & CS | Chăm sóc thành viên | TC-CUSTOMER-CARE.md | test-customer-care-crud.mjs | P2 |
| 11 | Kho & NVL | Nguyên vật liệu | TC-MATERIAL.md | test-material-crud.mjs | P1 |
| 11 | Kho & NVL | Nhà cung cấp | TC-SUPPLIER.md | test-supplier-crud.mjs | P1 |
| 11 | Kho & NVL | Danh sách kho | TC-WAREHOUSE.md | test-warehouse-crud.mjs | P2 |
| 11 | Kho & NVL | Sổ kho | TC-INVENTORY.md | test-inventory.mjs | P2 |
| 11 | Kho & NVL | Quản lý kho (kiểm kê) | TC-INVENTORY-CHECK.md | test-inventory-check.mjs | P2 |
| 11 | Kho & NVL | Báo cáo kho | TC-WAREHOUSE-REPORT.md | test-warehouse-report.mjs | P3 |
| 12 | Cài đặt | Cấu hình toàn cục | TC-TENANT-CONFIG.md | test-tenant-config.mjs | P2 |
| 12 | Cài đặt | Danh mục dịch vụ | TC-SETTING-SELL.md | test-setting-sell-crud.mjs | P1 |
| 12 | Cài đặt | Gói thành viên | TC-MEMBERSHIP-PLAN.md | test-membership-plan-crud.mjs | P1 |
| 12 | Cài đặt | Vận hành cơ sở | TC-SETTING-BASIS.md | test-setting-basis.mjs | P2 |
| 12 | Cài đặt | Tổ chức & phân quyền | TC-SETTING-ORG.md | test-setting-org.mjs | P2 |
| 12 | Cài đặt | Kênh liên lạc | TC-SETTING-CHANNELS.md | test-setting-channels.mjs | P3 |
| 12 | Cài đặt | Tích hợp | TC-SETTING-INTEGRATIONS.md | test-setting-integrations.mjs | P3 |
| 12 | Cài đặt | Tài khoản & bảo mật | TC-SETTING-ACCOUNT.md | test-setting-account.mjs | P3 |
| 12 | Cài đặt | Hỗ trợ thành viên | TC-SETTING-TICKET.md | test-setting-ticket.mjs | P3 |

## Nhóm test E2E liên phân hệ

| Flow | Mô tả | Script |
|---|---|---|
| E2E-CHECKIN | Tạo member → mua gói → check-in → trừ quota dịch vụ → ghi nhận doanh thu | test-e2e-checkin-flow.mjs |
| E2E-POS-FINANCE | Tạo đơn POS → thanh toán → sinh bút toán sổ thu chi → công nợ → kho giảm | test-e2e-pos-finance-flow.mjs |
| E2E-MEMBERSHIP | Tạo gói → gán cho member → kiểm tra quota → hết hạn → auto-renewal | test-e2e-membership-flow.mjs |
| E2E-PROMOTION | Tạo voucher → áp dụng vào POS → doanh thu thực vs chiết khấu | test-e2e-promotion-flow.mjs |
| E2E-INVENTORY | Nhập kho NVL → sử dụng trong POS → kiểm kê → báo cáo | test-e2e-inventory-flow.mjs |
| E2E-FEEDBACK | Member gửi feedback → staff xử lý → báo cáo tổng hợp | test-e2e-feedback-flow.mjs |

## Mức ưu tiên

- **P1 (critical)**: chức năng core, dùng hằng ngày. Test trước, fix bug ngay.
- **P2 (important)**: chức năng quản trị/cấu hình, test sau.
- **P3 (nice-to-have)**: báo cáo, tích hợp phụ, test cuối.
