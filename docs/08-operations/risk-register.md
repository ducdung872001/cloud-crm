# Sổ Đăng ký Rủi ro — Dự án Reborn Loyalty

> **Dự án:** Hệ thống Loyalty cho chuỗi siêu thị (2 thương hiệu, 100+ cửa hàng, 3 triệu khách hàng)
> **Ngân sách:** < 1 tỷ VND | **Thời gian:** 6 tháng
> **Cập nhật lần cuối:** 16/04/2026

---

## 1. Rủi ro Kỹ thuật

| ID | Mô tả rủi ro | Xác suất | Tác động | Mức độ | Biện pháp giảm thiểu | Người chịu trách nhiệm | Trạng thái |
|----|--------------|-----------|----------|--------|----------------------|------------------------|------------|
| R-01 | POS API của Brand A không tương thích hoặc thiếu tài liệu, gây chậm tích hợp tích/tiêu điểm | Cao | Cao | Nghiêm trọng | Yêu cầu tài liệu API + sandbox từ tuần 1; chuẩn bị adapter layer trung gian; có fallback nhập tay nếu API chưa sẵn sàng | Tech Lead | Mở |
| R-02 | Hiệu năng hệ thống suy giảm khi xử lý 3 triệu bản ghi khách hàng (query chậm, timeout) | Cao | Cao | Nghiêm trọng | Thiết kế index tối ưu từ đầu; phân trang bắt buộc; load test với 3M records trước go-live; caching tầng Redis | Tech Lead | Mở |
| R-03 | Data migration từ hệ thống loyalty cũ bị lỗi (mất điểm, sai thông tin KH, trùng lặp) | TB | Cao | Nghiêm trọng | Chạy dry-run migration 3 lần trước khi chính thức; đối soát 100% số dư điểm; giữ backup hệ thống cũ song song 30 ngày | Tech Lead + DBA | Mở |
| R-04 | Lỗ hổng bảo mật: rò rỉ dữ liệu cá nhân 3 triệu KH (CCCD, SĐT, lịch sử mua) | Thấp | Cao | Nghiêm trọng | Mã hóa dữ liệu nhạy cảm at-rest và in-transit; phân quyền RBAC chặt; audit log mọi truy cập; pen-test trước go-live | Tech Lead + Security | Mở |
| R-05 | POS API của Brand B khác kiến trúc Brand A, phải viết lại integration | TB | TB | Đáng chú ý | Thiết kế adapter pattern từ đầu, mỗi brand 1 adapter riêng; khảo sát API Brand B song song với triển khai Brand A | Tech Lead | Mở |

## 2. Rủi ro Dự án

| ID | Mô tả rủi ro | Xác suất | Tác động | Mức độ | Biện pháp giảm thiểu | Người chịu trách nhiệm | Trạng thái |
|----|--------------|-----------|----------|--------|----------------------|------------------------|------------|
| R-06 | Timeline bị trễ do phụ thuộc vào tiến độ cung cấp API/data từ phía khách hàng | Cao | Cao | Nghiêm trọng | Đặt deadline rõ ràng cho từng deliverable từ phía khách; escalation path qua ban giám đốc; buffer 2 tuần mỗi phase | PM | Mở |
| R-07 | Scope creep: khách yêu cầu thêm tính năng ngoài phạm vi (gamification, app riêng, v.v.) | Cao | TB | Đáng chú ý | Ký xác nhận scope chi tiết từ đầu; mọi thay đổi qua Change Request có đánh giá effort + chi phí; PM kiểm soát chặt | PM | Mở |
| R-08 | Nhân sự chủ chốt nghỉ việc giữa dự án (dev chính, PM) | TB | Cao | Nghiêm trọng | Tài liệu kỹ thuật đầy đủ; code review chéo để chia sẻ kiến thức; có backup resource cho mỗi vị trí quan trọng | PM + HR | Mở |
| R-09 | Phụ thuộc vào khách cung cấp data đầu vào (danh sách KH, lịch sử giao dịch, rule tích điểm hiện tại) | Cao | TB | Đáng chú ý | Gửi template data + hướng dẫn chuẩn bị từ tuần 1; follow-up hàng tuần; chuẩn bị data mẫu để dev không bị block | PM + BA | Mở |
| R-10 | Ngân sách < 1 tỷ không đủ nếu phát sinh thêm hạ tầng hoặc license bên thứ ba | Thấp | TB | Đáng chú ý | Ưu tiên open-source stack; ước lượng chi phí cloud chi tiết theo tháng; dự phòng 10% ngân sách cho phát sinh | PM + CTO | Mở |

## 3. Rủi ro Nghiệp vụ

| ID | Mô tả rủi ro | Xác suất | Tác động | Mức độ | Biện pháp giảm thiểu | Người chịu trách nhiệm | Trạng thái |
|----|--------------|-----------|----------|--------|----------------------|------------------------|------------|
| R-11 | User adoption thấp: nhân viên cửa hàng không sử dụng hoặc sử dụng sai hệ thống mới | TB | Cao | Nghiêm trọng | Training on-site cho từng cụm cửa hàng; video hướng dẫn ngắn; hotline hỗ trợ 2 tuần đầu; đo adoption rate theo tuần | BA + Trainer | Mở |
| R-12 | Rule tích điểm cấu hình sai dẫn đến tích thừa/thiếu điểm cho KH, gây thiệt hại tài chính | TB | Cao | Nghiêm trọng | UAT kỹ với 50+ kịch bản tích/tiêu điểm; khách ký xác nhận rule trước khi go-live; alert khi tổng điểm phát sinh bất thường | BA + QA | Mở |
| R-13 | Xung đột cross-brand: KH dùng điểm Brand A tại Brand B gây tranh chấp nội bộ | TB | TB | Đáng chú ý | Xác nhận rõ chính sách cross-brand từ ban giám đốc khách hàng; thiết kế hệ thống hỗ trợ bật/tắt cross-brand linh hoạt | BA + PM | Mở |
| R-14 | Chạy song song hệ thống loyalty cũ và mới gây nhầm lẫn cho KH và nhân viên | TB | TB | Đáng chú ý | Kế hoạch cutover rõ ràng theo từng cụm store; thông báo KH qua SMS/app trước 2 tuần; đồng bộ số dư điểm realtime trong giai đoạn song song | PM + BA | Mở |

## 4. Rủi ro Vận hành

| ID | Mô tả rủi ro | Xác suất | Tác động | Mức độ | Biện pháp giảm thiểu | Người chịu trách nhiệm | Trạng thái |
|----|--------------|-----------|----------|--------|----------------------|------------------------|------------|
| R-15 | Downtime hệ thống vào giờ cao điểm gây gián đoạn tích/tiêu điểm tại 100+ store | Thấp | Cao | Đáng chú ý | SLA uptime 99.5%; auto-scaling; health check mỗi 30 giây; POS có chế độ offline queue khi mất kết nối | DevOps | Mở |
| R-16 | Mất dữ liệu do lỗi hạ tầng hoặc thao tác sai (xóa nhầm DB, corrupt storage) | Thấp | Cao | Đáng chú ý | Backup tự động hàng ngày; point-in-time recovery; replica DB; kiểm tra restore backup hàng tháng | DevOps + DBA | Mở |
| R-17 | Cron job tính điểm/hết hạn điểm chạy fail âm thầm, không ai phát hiện | TB | TB | Đáng chú ý | Monitoring + alert khi cron fail hoặc không chạy đúng lịch; log chi tiết mỗi lần chạy; dashboard hiển thị trạng thái job | DevOps | Mở |
| R-18 | Webhook gửi thông báo KH (SMS, push) bị fail/delay, KH không nhận được xác nhận tích điểm | TB | Thấp | Chấp nhận được | Retry mechanism 3 lần với exponential backoff; dead-letter queue cho message fail; báo cáo delivery rate hàng ngày | Tech Lead | Mở |

---

## Ma trận Rủi ro Tổng hợp

|  | **Tác động Cao** | **Tác động TB** | **Tác động Thấp** |
|--|------------------|-----------------|-------------------|
| **Xác suất Cao** | R-01, R-02, R-06 | R-07, R-09 | — |
| **Xác suất TB** | R-03, R-04, R-08, R-11, R-12 | R-05, R-13, R-14, R-17 | R-18 |
| **Xác suất Thấp** | R-15, R-16 | R-10 | — |

---

## Quy trình Quản lý Rủi ro

1. **Review định kỳ:** Họp review rủi ro 2 tuần/lần trong buổi sprint review
2. **Escalation:** Rủi ro mức Nghiêm trọng phải báo cáo ban giám đốc cả hai bên trong 24h
3. **Cập nhật:** PM cập nhật trạng thái rủi ro sau mỗi sprint
4. **Đóng rủi ro:** Chỉ đóng khi biện pháp đã triển khai và được xác nhận hiệu quả
