# Tiêu chí Nghiệm thu — Reborn-Tech B2B CRM

> Dự án: CRM doanh nghiệp lớn / công ty công nghệ (B2B)
> Ngày tạo: 2026-04-16
> Phiên bản: 1.0

---

## Mục lục

1. [Phase 1 — CRM Core (Tháng 1-2)](#phase-1--crm-core-tháng-1-2)
2. [Phase 2 — Contract + Finance (Tháng 2-3)](#phase-2--contract--finance-tháng-2-3)
3. [Phase 3 — Marketing + BPM + Bàn giao (Tháng 3-4)](#phase-3--marketing--bpm--bàn-giao-tháng-3-4)
4. [Ký xác nhận](#ký-xác-nhận)

---

## Phase 1 — CRM Core (Tháng 1-2)

**Mục tiêu:** Vận hành được quy trình quản lý khách hàng, liên hệ, cơ hội bán hàng, báo giá và phân quyền cơ bản.

| STT | Tiêu chí | Mô tả | Phương pháp kiểm tra | Kết quả | Ghi chú |
|-----|----------|-------|----------------------|---------|---------|
| 1.1 | CRUD Khách hàng (Customer) | Tạo, xem, sửa, xóa khách hàng doanh nghiệp với đầy đủ thông tin: tên công ty, MST, địa chỉ, ngành nghề, quy mô, nguồn | Tạo 10 khách hàng mẫu, verify hiển thị danh sách, filter theo ngành/quy mô, edit và kiểm tra lưu đúng | | |
| 1.2 | CRUD Liên hệ (Contact) | Quản lý người liên hệ thuộc khách hàng: họ tên, chức vụ, email, SĐT, ghi chú. Một khách hàng có nhiều liên hệ | Tạo 3 liên hệ cho 1 khách hàng, kiểm tra quan hệ 1-N, xóa liên hệ không ảnh hưởng khách hàng | | |
| 1.3 | Pipeline cơ hội bán hàng (Opportunity) | Kanban board với các giai đoạn: Tiềm năng → Liên hệ → Demo → Báo giá → Đàm phán → Thắng/Thua. Kéo thả chuyển giai đoạn | Tạo 5 cơ hội, kéo thả qua từng giai đoạn, kiểm tra lịch sử chuyển đổi, filter theo nhân viên/giai đoạn | | |
| 1.4 | Báo giá (Quotation) | Tạo báo giá từ cơ hội: danh sách sản phẩm/dịch vụ, đơn giá, số lượng, chiết khấu, thuế VAT, tổng tiền. Xuất PDF | Tạo báo giá 5 dòng sản phẩm, kiểm tra tính toán tổng, xuất PDF kiểm tra format, gửi email báo giá | | |
| 1.5 | Báo cáo cơ bản | Dashboard: tổng khách hàng, cơ hội theo giai đoạn, doanh thu dự kiến, top nhân viên. Biểu đồ cột + tròn | Verify dữ liệu dashboard khớp với danh sách thực tế, filter theo khoảng thời gian, export báo cáo | | |
| 1.6 | RBAC — Phân quyền theo vai trò | Roles: Admin, Manager, Sales, Viewer. Mỗi role có permission set khác nhau. Sales chỉ thấy khách hàng của mình | Đăng nhập 4 tài khoản khác role, verify menu/button hiển thị đúng, Sales không xem được data team khác | | |
| 1.7 | Import/Export dữ liệu | Import khách hàng từ Excel/CSV. Export danh sách khách hàng, cơ hội ra Excel | Import file 100 dòng, kiểm tra validate lỗi, duplicate detection. Export và verify đủ cột | | |
| 1.8 | Tìm kiếm và lọc nâng cao | Tìm kiếm toàn hệ thống (global search). Filter multi-field cho mỗi danh sách | Tìm khách hàng theo tên/MST/SĐT, filter cơ hội theo giai đoạn + nhân viên + khoảng tiền | | |
| 1.9 | Lịch sử hoạt động (Activity Log) | Ghi nhận mọi thao tác: gọi điện, email, gặp mặt, ghi chú trên từng khách hàng/cơ hội | Tạo 5 hoạt động khác loại, kiểm tra timeline hiển thị đúng thời gian, nội dung, người tạo | | |
| 1.10 | Responsive và UX cơ bản | Giao diện hoạt động trên desktop (1920x1080, 1366x768) và tablet (1024x768). Loading < 3s | Kiểm tra 3 resolution, verify layout không vỡ, form nhập liệu sử dụng được trên tablet | | |

**Tiêu chí đạt Phase 1:** 100% tiêu chí 1.1-1.6 PASS, tối thiểu 80% tiêu chí 1.7-1.10 PASS.

### Ký xác nhận Phase 1

| Vai trò | Họ tên | Chữ ký | Ngày |
|---------|--------|--------|------|
| Chủ đầu tư | | | |
| Project Manager | | | |
| Tech Lead | | | |
| QA Lead | | | |

---

## Phase 2 — Contract + Finance (Tháng 2-3)

**Mục tiêu:** Quản lý vòng đời hợp đồng, phê duyệt BPM, hóa đơn, sổ quỹ và theo dõi công nợ.

| STT | Tiêu chí | Mô tả | Phương pháp kiểm tra | Kết quả | Ghi chú |
|-----|----------|-------|----------------------|---------|---------|
| 2.1 | Quản lý hợp đồng (Contract lifecycle) | Tạo hợp đồng từ báo giá/cơ hội: thông tin bên A/B, điều khoản, giá trị, thời hạn, phụ lục. Trạng thái: Nháp → Chờ duyệt → Đã ký → Đang thực hiện → Hoàn thành/Hủy | Tạo hợp đồng đầy đủ, chuyển qua tất cả trạng thái, tạo phụ lục, kiểm tra lịch sử thay đổi | | |
| 2.2 | BPM phê duyệt hợp đồng | Workflow phê duyệt nhiều cấp: Sales → Manager → Director → CEO (tùy giá trị). Ủy quyền khi vắng mặt. Auto-escalation | Tạo hợp đồng 3 mức giá trị khác nhau, kiểm tra đúng luồng phê duyệt, test ủy quyền, test timeout escalation | | |
| 2.3 | Hóa đơn (Invoice) | Tạo hóa đơn từ hợp đồng: số HĐ, ngày, danh mục, thuế, tổng tiền. Trạng thái: Nháp → Đã gửi → Đã thanh toán một phần → Đã thanh toán | Tạo hóa đơn, ghi nhận thanh toán từng phần, kiểm tra số dư, liên kết ngược hợp đồng | | |
| 2.4 | Sổ quỹ (Cashbook) | Ghi nhận thu/chi: phiếu thu, phiếu chi, loại giao dịch, tài khoản. Số dư tự động cập nhật. Đối soát cuối kỳ | Tạo 10 phiếu thu/chi, kiểm tra số dư cộng dồn đúng, filter theo kỳ/loại, export báo cáo sổ quỹ | | |
| 2.5 | Theo dõi công nợ (Debt tracking) | Bảng công nợ theo khách hàng: tổng phải thu, đã thu, còn nợ, quá hạn. Cảnh báo nợ quá hạn 7/15/30 ngày | Tạo 5 hóa đơn khác kỳ hạn, kiểm tra bảng công nợ tổng hợp, verify cảnh báo quá hạn gửi đúng | | |
| 2.6 | Báo cáo tài chính | Báo cáo doanh thu theo tháng/quý, công nợ phải thu, hợp đồng sắp hết hạn. Export Excel/PDF | Verify số liệu báo cáo khớp dữ liệu thực, so sánh 2 kỳ, kiểm tra biểu đồ xu hướng | | |
| 2.7 | Template hợp đồng | Tạo/quản lý mẫu hợp đồng với biến tự động (tên KH, giá trị, ngày). Merge và xuất Word/PDF | Tạo 3 template, merge với dữ liệu thực, kiểm tra output đúng format, biến được thay thế đầy đủ | | |
| 2.8 | Nhắc nhở SLA hợp đồng | Tự động cảnh báo: hợp đồng sắp hết hạn (30/15/7 ngày), milestone trễ, thanh toán quá hạn | Tạo hợp đồng với deadline gần, verify email/notification gửi đúng thời điểm, đúng người nhận | | |
| 2.9 | Phân quyền dữ liệu tài chính | Chỉ Finance role xem được sổ quỹ, hóa đơn. Manager thấy hợp đồng team mình. Sales không thấy giá vốn | Đăng nhập Sales/Manager/Finance, verify dữ liệu hiển thị đúng phạm vi, không lộ thông tin nhạy cảm | | |
| 2.10 | Tích hợp chữ ký số (Viettel CA) | Ký số hợp đồng qua Viettel CA: upload file → ký → verify chữ ký hợp lệ | Ký 1 hợp đồng, kiểm tra chữ ký valid, file đã ký không bị sửa đổi, log audit đầy đủ | | |

**Tiêu chí đạt Phase 2:** 100% tiêu chí 2.1-2.5 PASS, tối thiểu 80% tiêu chí 2.6-2.10 PASS.

### Ký xác nhận Phase 2

| Vai trò | Họ tên | Chữ ký | Ngày |
|---------|--------|--------|------|
| Chủ đầu tư | | | |
| Project Manager | | | |
| Tech Lead | | | |
| QA Lead | | | |

---

## Phase 3 — Marketing + BPM + Bàn giao (Tháng 3-4)

**Mục tiêu:** Marketing automation, ticket/bảo hành, KPI, báo cáo nâng cao, đào tạo và bàn giao hệ thống.

| STT | Tiêu chí | Mô tả | Phương pháp kiểm tra | Kết quả | Ghi chú |
|-----|----------|-------|----------------------|---------|---------|
| 3.1 | Campaign Marketing | Tạo chiến dịch: đối tượng mục tiêu, kênh (email/SMS/Zalo), nội dung, lịch gửi. Tracking open/click/convert | Tạo campaign email 100 người, kiểm tra gửi đúng lịch, tracking số liệu, báo cáo hiệu quả | | |
| 3.2 | Marketing Automation | Workflow tự động: trigger khi lead mới → gửi welcome email → chờ 3 ngày → gửi giới thiệu → nếu open → tạo task cho Sales | Thiết lập workflow 4 bước, trigger bằng lead test, verify từng bước chạy đúng logic và timing | | |
| 3.3 | Ticket / Yêu cầu hỗ trợ | Tạo ticket từ email/form/manual: phân loại, ưu tiên, assign, SLA response/resolution. Kanban board ticket | Tạo 5 ticket khác mức ưu tiên, kiểm tra SLA countdown, escalation khi quá hạn, đóng ticket và đánh giá | | |
| 3.4 | Bảo hành (Warranty) | Quản lý bảo hành theo hợp đồng/sản phẩm: thời hạn, lịch sử bảo hành, chi phí. Cảnh báo hết hạn | Tạo 3 record bảo hành, ghi nhận lịch sử sửa chữa, kiểm tra cảnh báo hết hạn, báo cáo chi phí bảo hành | | |
| 3.5 | KPI nhân viên | Dashboard KPI: doanh số, số cơ hội, tỷ lệ chuyển đổi, thời gian xử lý. So sánh target vs actual | Thiết lập KPI target cho 3 nhân viên, nhập dữ liệu actual, kiểm tra dashboard hiển thị đúng, xếp hạng | | |
| 3.6 | Báo cáo nâng cao | Báo cáo tùy chỉnh: chọn dimension/measure, pivot table, drill-down. Lịch gửi báo cáo tự động | Tạo 3 báo cáo tùy chỉnh, kiểm tra drill-down, schedule gửi email hàng tuần, verify dữ liệu chính xác | | |
| 3.7 | Tích hợp Zalo OA | Gửi/nhận tin nhắn Zalo OA trong CRM, tự động tạo lead từ tin nhắn, template message | Kết nối Zalo OA test, gửi tin nhắn từ CRM, nhận tin nhắn và tạo lead, kiểm tra lịch sử hội thoại | | |
| 3.8 | Tích hợp VoIP | Click-to-call từ CRM, popup thông tin khách khi có cuộc gọi đến, ghi âm cuộc gọi, CDR log | Gọi đi từ CRM, nhận cuộc gọi và verify popup, kiểm tra ghi âm lưu đúng, CDR hiển thị trong activity | | |
| 3.9 | Đào tạo người dùng | Training 2 ngày cho từng nhóm vai trò (Admin, Manager, Sales). Tài liệu HDSD, video hướng dẫn | Kiểm tra tài liệu đầy đủ (12 phần), video cho 5 quy trình chính, bài test sau đào tạo đạt >= 80% | | |
| 3.10 | Bàn giao hệ thống | Bàn giao mã nguồn, tài liệu kỹ thuật (SA, URD, API docs), tài khoản admin, hướng dẫn vận hành, backup/restore procedure | Checklist bàn giao 20 mục, khách hàng tự thực hiện được: tạo user, backup, deploy, xem log | | |
| 3.11 | Data migration hoàn tất | Dữ liệu từ CRM cũ được migrate đầy đủ: khách hàng, liên hệ, hợp đồng, lịch sử. Đối chiếu số liệu | So sánh tổng record CRM cũ vs mới, spot-check 20 record ngẫu nhiên, verify quan hệ dữ liệu | | |
| 3.12 | UAT — User Acceptance Test | Khách hàng tự test 10 kịch bản nghiệp vụ chính trên môi trường staging với dữ liệu thực | 10 kịch bản UAT pass, bug severity Critical/High = 0, bug Medium <= 3 và có plan fix | | |

**Tiêu chí đạt Phase 3:** 100% tiêu chí 3.1-3.8 PASS, 100% tiêu chí 3.9-3.12 PASS (bàn giao bắt buộc).

### Ký xác nhận Phase 3 (Nghiệm thu cuối cùng)

| Vai trò | Họ tên | Chữ ký | Ngày |
|---------|--------|--------|------|
| Chủ đầu tư | | | |
| Đại diện phòng kinh doanh | | | |
| Đại diện phòng tài chính | | | |
| Project Manager | | | |
| Tech Lead | | | |
| QA Lead | | | |

---

## Điều kiện nghiệm thu tổng thể

1. **Tất cả Phase 1, 2, 3 đạt tiêu chí** như mô tả ở trên
2. **Không còn bug Critical/High** chưa được xử lý
3. **Hiệu năng đạt NFR:** API P95 < 500ms, trang load < 3s, hỗ trợ 200 concurrent users
4. **Bảo mật:** Không có lỗ hổng OWASP Critical/High chưa fix
5. **Tài liệu bàn giao đầy đủ:** mã nguồn, tài liệu kỹ thuật, HDSD, video training
6. **Đào tạo hoàn tất:** 100% nhóm người dùng được training, bài test đạt >= 80%

---

## Lịch sử cập nhật

| Ngày | Người cập nhật | Nội dung |
|------|----------------|----------|
| 2026-04-16 | Team Reborn | Khởi tạo tiêu chí nghiệm thu v1.0 — 3 phase, 32 tiêu chí |
