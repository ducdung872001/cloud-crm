# TC-OTHERS — Các phân hệ P2/P3 (compact)

Mỗi module dùng bộ case CRUD chuẩn: 001 Mở list · 002 Tạo · 003 Validate · 004 Sửa · 005 Xoá safety · 006 Filter · 007 Phân quyền.
File này liệt kê đặc trưng riêng của từng module; các case chuẩn không lặp lại.

## TC-SERVICE-BOOKING — Trừ quota dịch vụ (`/ch_services`)
- Chọn member → chọn dịch vụ → Xác nhận
- Kỳ vọng: quota của member giảm đúng, API book code 0, tạo record lịch sử.
- Edge: member hết quota → chặn; dịch vụ không thuộc gói → cảnh báo.

## TC-SHIFT — Quản lý ca làm việc (`/shift_management`)
- Mở ca → Đóng ca → Đối chiếu tiền mặt → Bàn giao.
- Kỳ vọng: tiền đầu ca + thu trong ca = tiền cuối ca; chênh lệch báo đỏ.

## TC-SETTING-CUSTOMER — Cài đặt thành viên (`/setting_customer`)
- CRUD: Thuộc tính tuỳ chỉnh, danh mục, nguồn, nhóm.

## TC-INVOICE-VAT — Hoá đơn VAT (`/invoiceVAT`)
- Tạo hoá đơn VAT từ đơn bán; phát hành; huỷ; tra cứu.

## TC-ACCOMMODATION — Lưu trú (`/ch_accommodation`, tenant_config.accommodation_enabled)
- CRUD phòng, đặt phòng, check-in lưu trú, check-out, tính tiền theo đêm.

## TC-FINANCE-CASHBOOK — Sổ thu chi (`/finance_management/cashbook`)
- Ghi thu/chi, chọn quỹ + khoản mục, đính kèm chứng từ, đối chiếu.
- Kỳ vọng: số dư quỹ cập nhật đúng; filter theo khoản mục/quỹ/ngày.

## TC-FINANCE-FUND — Quản lý quỹ (`/finance_management/fund_management`)
- CRUD quỹ (tiền mặt, ngân hàng), số dư ban đầu, chuyển quỹ.

## TC-FINANCE-CATEGORY — Khoản mục (`/finance_management/category_management`)
- CRUD khoản mục thu/chi, nhóm phân cấp.

## TC-FINANCE-DEBT — Công nợ (`/finance_management/debt_management`)
- List công nợ theo customer/supplier, thanh toán, đối trừ, xuất file.

## TC-PAYMENT-CONTROL — Đối soát thanh toán (`/payment_control`)
- Match đơn ↔ giao dịch cổng thanh toán, phát hiện lệch.

## TC-PARTNER — Đối tác KOL/PO (`/ch_partners`)
- CRUD đối tác, tỉ lệ hoa hồng, gán vào chiến dịch.

## TC-FEEDBACK — Phản hồi (`/ch_feedback`)
- List feedback, chuyển trạng thái (new → processing → done), phản hồi lại khách.

## TC-REPORTS — Báo cáo (`/ch_report_*`)
- 6 tab: revenue, members, checkin, services, partners, finance.
- Kỳ vọng: số liệu khớp tab raw data; filter ngày không gây NaN; export đúng.

## TC-LOYALTY — Tích điểm hội viên (`/member_list`)
- Cộng/trừ điểm thủ công, quy đổi, lịch sử.

## TC-MARKETING-CAMPAIGN — Chiến dịch marketing (`/marketing_campaign`)
- CRUD chiến dịch, gửi SMS/Email/Zalo, xem analytics.

## TC-CUSTOMER-CARE — Chăm sóc thành viên (`/customer_care_page`)
- Lịch chăm sóc, ghi log tương tác, nhắc nhở.

## TC-WAREHOUSE — Danh sách kho (`/warehouse`)
- CRUD kho, gán sản phẩm/NVL vào kho.

## TC-INVENTORY — Sổ kho (`/inventory`)
- Xem tồn kho theo từng kho, filter ngày, export.
- Kỳ vọng: tồn = nhập − xuất + điều chỉnh; không âm (trừ khi cho phép).

## TC-INVENTORY-CHECK — Kiểm kê (`/inventory_checking`)
- Tạo phiếu kiểm kê, nhập số thực, cân bằng → tạo phiếu điều chỉnh.

## TC-WAREHOUSE-REPORT — Báo cáo kho (`/report_warehouse`)
- Báo cáo tồn, nhập xuất, giá vốn, giá trị kho.

## TC-TENANT-CONFIG — Cấu hình toàn cục (`/ch_tenant_config`)
- Bật/tắt feature flag (warehouse_enabled, accommodation_enabled…), cấu hình hệ thống.

## TC-SETTING-BASIS — Vận hành cơ sở (`/setting_basis`)
- Chi nhánh, phương thức thanh toán, ca làm việc, cấu hình chung.

## TC-SETTING-ORG — Tổ chức & phân quyền (`/setting_org`)
- Phòng ban, nhóm, vai trò, nhân viên, ma trận phân quyền.

## TC-SETTING-CHANNELS — Kênh liên lạc (`/setting_channels` + sub)
- Cấu hình SMS/Email/Zalo/Call, template, test gửi.

## TC-SETTING-INTEGRATIONS — Tích hợp (`/setting_integrations`)
- Viettel, apps, webhook monitoring.

## TC-SETTING-ACCOUNT — Tài khoản & bảo mật (`/setting_account`)
- API key, gói dịch vụ, audit log.

## TC-SETTING-TICKET — Hỗ trợ thành viên (`/setting_ticket`)
- Loại ticket, QR code, workflow.
