# Tiêu chí Nghiệm thu — Dự án Reborn Loyalty

> **Dự án:** Hệ thống Loyalty cho chuỗi siêu thị (2 thương hiệu, 100+ cửa hàng, 3 triệu khách hàng)
> **Ngân sách:** < 1 tỷ VND | **Thời gian:** 6 tháng
> **Ngày lập:** 16/04/2026

---

## Phase 1: Nền tảng (Tháng 1-2)

**Mục tiêu:** Hệ thống core hoạt động, pilot 5-10 cửa hàng Brand A, import thử 1.000 KH.

| STT | Tiêu chí | Mô tả | Phương pháp kiểm tra | Kết quả | Ghi chú |
|-----|----------|-------|----------------------|---------|---------|
| 1.1 | Deploy hệ thống thành công | Hệ thống Loyalty được deploy lên môi trường production, truy cập được qua domain chính thức | Truy cập URL production, đăng nhập bằng tài khoản admin, xác nhận tất cả module load thành công | Đạt / Không đạt | |
| 1.2 | Import pilot 1.000 khách hàng | Import thành công danh sách 1.000 KH từ file Excel/CSV, đúng thông tin: họ tên, SĐT, email, số dư điểm | Đối soát 100% bản ghi import với file gốc; kiểm tra random 50 KH trên giao diện admin | Đạt / Không đạt | |
| 1.3 | Admin dashboard hoạt động | Dashboard hiển thị đúng tổng KH, tổng điểm phát sinh, tổng điểm tiêu, biểu đồ theo ngày | Đăng nhập admin, kiểm tra số liệu dashboard khớp với dữ liệu thực tế đã import + giao dịch test | Đạt / Không đạt | |
| 1.4 | POS Brand A tích điểm thành công | Khi KH mua hàng tại POS Brand A, điểm được tích tự động đúng rule (VD: 1.000 VND = 1 điểm), hiển thị trên hóa đơn | Thực hiện 20 giao dịch mua hàng thực tế tại 3 store pilot; kiểm tra điểm tích đúng trên cả POS và hệ thống Loyalty | Đạt / Không đạt | |
| 1.5 | POS Brand A tiêu điểm thành công | KH có thể dùng điểm để giảm giá tại POS, số dư điểm trừ đúng, hóa đơn ghi nhận giảm giá | Thực hiện 10 giao dịch tiêu điểm; kiểm tra số dư trước/sau khớp; kiểm tra doanh thu ghi nhận đúng | Đạt / Không đạt | |
| 1.6 | Pilot 5-10 cửa hàng | Tối thiểu 5 cửa hàng Brand A sử dụng hệ thống Loyalty thực tế trong 1 tuần không lỗi nghiêm trọng | Thu thập log lỗi trong 7 ngày pilot; phỏng vấn nhân viên 5 store; đo tỷ lệ giao dịch thành công >= 98% | Đạt / Không đạt | |
| 1.7 | Quản lý rule tích điểm | Admin có thể tạo, sửa, bật/tắt rule tích điểm theo thương hiệu mà không cần can thiệp code | Tạo 3 rule khác nhau qua giao diện admin; xác nhận rule áp dụng đúng khi thực hiện giao dịch test | Đạt / Không đạt | |
| 1.8 | Phân quyền người dùng | Hệ thống phân quyền đúng: Admin toàn quyền, Manager xem báo cáo, Staff chỉ thao tác tích/tiêu | Đăng nhập 3 tài khoản với role khác nhau; xác nhận mỗi role chỉ truy cập được đúng chức năng cho phép | Đạt / Không đạt | |

---

## Phase 2: Mở rộng (Tháng 3-4)

**Mục tiêu:** Brand B tích hợp, rollout toàn bộ 100+ store, cross-brand hoạt động, chạy campaign đầu tiên.

| STT | Tiêu chí | Mô tả | Phương pháp kiểm tra | Kết quả | Ghi chú |
|-----|----------|-------|----------------------|---------|---------|
| 2.1 | Brand B tích hợp POS thành công | POS Brand B kết nối được với hệ thống Loyalty, tích/tiêu điểm hoạt động tương tự Brand A | Thực hiện 20 giao dịch tích + 10 giao dịch tiêu điểm tại 3 store Brand B; kiểm tra đúng rule riêng Brand B | Đạt / Không đạt | |
| 2.2 | Rollout 100+ cửa hàng | Tất cả 100+ store cả 2 brand đều kết nối và sử dụng hệ thống Loyalty | Kiểm tra dashboard: 100% store hiển thị trạng thái "Online"; chọn random 10 store kiểm tra giao dịch thực tế | Đạt / Không đạt | |
| 2.3 | Cross-brand points hoạt động | KH tích điểm tại Brand A có thể tiêu điểm tại Brand B và ngược lại (nếu bật tính năng) | Tạo 1 KH, tích 100 điểm tại Brand A, tiêu 50 điểm tại Brand B; kiểm tra số dư chung đúng | Đạt / Không đạt | |
| 2.4 | Campaign marketing đầu tiên | Chạy thành công 1 campaign (VD: x2 điểm cuối tuần), điểm tích đúng rule campaign, gửi thông báo KH | Tạo campaign qua admin; thực hiện giao dịch trong và ngoài thời gian campaign; kiểm tra điểm tích đúng hệ số | Đạt / Không đạt | |
| 2.5 | SLA đạt yêu cầu | Uptime >= 99.5%; API response time trung bình < 500ms; không có lỗi mất dữ liệu | Báo cáo monitoring 30 ngày liên tục: uptime, response time P95, số incident severity cao | Đạt / Không đạt | |
| 2.6 | Xử lý đồng thời cao điểm | Hệ thống xử lý được >= 100 giao dịch tích/tiêu điểm đồng thời không lỗi | Load test mô phỏng 100 concurrent transactions; kiểm tra 100% giao dịch thành công, không trùng/mất điểm | Đạt / Không đạt | |
| 2.7 | Thông báo KH | Hệ thống gửi SMS/push thông báo khi: tích điểm, tiêu điểm, điểm sắp hết hạn, campaign mới | Kiểm tra 4 loại thông báo với 10 KH test; đo delivery rate >= 95% | Đạt / Không đạt | |
| 2.8 | Báo cáo vận hành | Báo cáo doanh thu theo store, báo cáo điểm phát sinh/tiêu thụ theo ngày/tuần/tháng, export Excel | Tạo báo cáo cho 3 khoảng thời gian khác nhau; đối soát số liệu với raw data; export và kiểm tra file Excel | Đạt / Không đạt | |

---

## Phase 3: Tối ưu & Bàn giao (Tháng 5-6)

**Mục tiêu:** Import toàn bộ 3M KH, analytics hoàn chỉnh, training xong, bàn giao cho team IT khách hàng tự vận hành.

| STT | Tiêu chí | Mô tả | Phương pháp kiểm tra | Kết quả | Ghi chú |
|-----|----------|-------|----------------------|---------|---------|
| 3.1 | Import toàn bộ 3 triệu KH | Toàn bộ 3M KH từ hệ thống cũ được import thành công, đúng thông tin và số dư điểm | Đối soát tổng số KH, tổng điểm trước/sau import; random check 500 KH; kiểm tra không trùng lặp | Đạt / Không đạt | |
| 3.2 | Hiệu năng với 3M KH | Hệ thống hoạt động mượt mà với 3M KH: search KH < 1 giây, dashboard load < 3 giây, tích điểm < 500ms | Đo response time 100 thao tác phổ biến; load test với full data; kiểm tra không có query > 3 giây | Đạt / Không đạt | |
| 3.3 | Dashboard analytics | Dashboard phân tích: RFM segmentation, cohort analysis, tỷ lệ active member, top KH, trend tích/tiêu điểm | Kiểm tra 5 loại biểu đồ analytics hiển thị đúng; đối soát số liệu 1 biểu đồ với query DB trực tiếp | Đạt / Không đạt | |
| 3.4 | Training hoàn tất | 100% quản lý store + nhân viên IT khách hàng được training sử dụng và quản trị hệ thống | Danh sách training có chữ ký; bài test sau training đạt >= 80%; phỏng vấn random 5 người xác nhận hiểu rõ | Đạt / Không đạt | |
| 3.5 | Tài liệu bàn giao đầy đủ | Bao gồm: hướng dẫn sử dụng, hướng dẫn quản trị, tài liệu kỹ thuật API, runbook xử lý sự cố | Checklist tài liệu: kiểm tra từng loại có đủ, format rõ ràng, team IT khách review và xác nhận đọc hiểu | Đạt / Không đạt | |
| 3.6 | Team IT khách tự vận hành | Team IT khách hàng tự thực hiện được: tạo campaign, sửa rule điểm, xem báo cáo, xử lý lỗi cơ bản | Team IT khách thực hiện 5 thao tác vận hành độc lập không cần hỗ trợ từ Reborn; đánh giá pass/fail từng thao tác | Đạt / Không đạt | |
| 3.7 | Hệ thống loyalty cũ tắt hoàn toàn | Hệ thống cũ được ngưng hoạt động, không còn giao dịch nào chạy qua hệ thống cũ | Kiểm tra log hệ thống cũ: 0 giao dịch trong 7 ngày; tất cả store confirm chỉ dùng hệ thống mới | Đạt / Không đạt | |
| 3.8 | Bảo mật & compliance | Hệ thống pass pen-test, dữ liệu KH được mã hóa, audit log đầy đủ, backup hoạt động | Báo cáo pen-test không có lỗi severity cao; kiểm tra encryption tại DB; xác nhận backup restore thành công | Đạt / Không đạt | |
| 3.9 | Warranty & support | Có kế hoạch warranty rõ ràng: thời gian bảo hành, SLA response time, kênh hỗ trợ, quy trình escalation | Review tài liệu warranty; test gửi ticket support và đo response time; xác nhận team support sẵn sàng | Đạt / Không đạt | |

---

## Điều kiện Nghiệm thu Tổng thể

- Mỗi phase phải đạt **100% tiêu chí bắt buộc** mới được chuyển sang phase tiếp theo.
- Tiêu chí **Không đạt** phải có kế hoạch khắc phục với deadline cụ thể.
- Nghiệm thu cuối cùng (Phase 3) yêu cầu hệ thống chạy ổn định **tối thiểu 14 ngày liên tục** trước khi ký.

---

## Biên bản Nghiệm thu

| | Bên A (Khách hàng) | Bên B (Reborn) |
|--|-------------------|----------------|
| **Đại diện** | _________________________ | _________________________ |
| **Chức vụ** | _________________________ | _________________________ |
| **Chữ ký** | _________________________ | _________________________ |
| **Ngày ký** | _____/_____/_________ | _____/_____/_________ |

> **Ghi chú:** Biên bản này có giá trị pháp lý khi có đủ chữ ký đại diện hai bên. Mỗi bên giữ 01 bản gốc.
