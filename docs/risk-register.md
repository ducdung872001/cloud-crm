# Sổ Đăng Ký Rủi Ro - Reborn Retail CRM

> **Dự án:** Reborn Retail CRM (Chuỗi cửa hàng bán lẻ)
> **Phiên bản:** 1.0
> **Ngày cập nhật:** 2026-04-16
> **Người lập:** Project Manager

---

## 1. Ma trận rủi ro tổng quan

|                | **Tác động Thấp** | **Tác động TB** | **Tác động Cao** |
|----------------|:-----------------:|:---------------:|:----------------:|
| **Xác suất Cao**   | TB                | Cao             | Nghiêm trọng     |
| **Xác suất TB**    | Thấp              | TB              | Cao              |
| **Xác suất Thấp**  | Thấp              | Thấp            | TB               |

**Quy ước mức độ:**
- **Nghiêm trọng:** Cần xử lý ngay, báo cáo Ban giám đốc
- **Cao:** Ưu tiên xử lý trong sprint hiện tại
- **TB:** Lên kế hoạch xử lý trong 1-2 sprint tới
- **Thấp:** Theo dõi, xử lý khi có nguồn lực

---

## 2. Danh sách rủi ro

### 2.1. Rủi ro Kỹ thuật

| ID | Mô tả rủi ro | Xác suất | Tác động | Mức độ | Biện pháp giảm thiểu | Người chịu trách nhiệm | Trạng thái |
|----|-------------|----------|----------|--------|----------------------|----------------------|------------|
| KT-01 | **POS offline sync fail** - Mất dữ liệu giao dịch khi POS mất kết nối internet và đồng bộ lại thất bại | Cao | Cao | Nghiêm trọng | (1) Lưu toàn bộ giao dịch vào IndexedDB/local storage trước khi gửi server. (2) Retry queue tự động với exponential backoff. (3) Cảnh báo admin khi có giao dịch pending > 30 phút. (4) Công cụ đối soát sync thủ công | Tech Lead | Đang xử lý |
| KT-02 | **Multi-branch data conflict** - Xung đột dữ liệu khi nhiều chi nhánh cập nhật cùng sản phẩm (tồn kho, giá) đồng thời | Cao | Cao | Nghiêm trọng | (1) Áp dụng optimistic locking với version field. (2) Conflict resolution rule: last-write-wins cho giá, additive cho tồn kho. (3) Audit log mọi thay đổi. (4) Thông báo realtime khi có conflict | Tech Lead | Đang xử lý |
| KT-03 | **Payment gateway downtime** - Cổng thanh toán (VNPay, Momo, ZaloPay) ngừng hoạt động trong giờ bán hàng | TB | Cao | Cao | (1) Tích hợp tối thiểu 2 cổng thanh toán. (2) Tự động fallback sang cổng phụ khi cổng chính lỗi. (3) Cho phép thanh toán tiền mặt khi tất cả cổng lỗi. (4) Dashboard theo dõi trạng thái gateway | Tech Lead | Chưa bắt đầu |
| KT-04 | **API performance at scale** - API chậm khi số lượng cửa hàng và giao dịch tăng (>50 cửa hàng, >10K đơn/ngày) | TB | Cao | Cao | (1) Load test định kỳ với k6/Artillery. (2) Database indexing tối ưu. (3) Redis cache cho dữ liệu đọc nhiều (sản phẩm, giá). (4) Pagination + lazy loading. (5) Horizontal scaling plan | Backend Lead | Đang theo dõi |
| KT-05 | **E-invoice integration error** - Lỗi tích hợp hoá đơn điện tử (VNPT, Viettel, BKAV) gây sai lệch thuế, mất hoá đơn | TB | Cao | Cao | (1) Retry mechanism với dead letter queue. (2) Đối soát tự động giữa hệ thống và nhà cung cấp HĐĐT. (3) Fallback: lưu hoá đơn pending, phát hành lại khi hệ thống phục hồi. (4) Cảnh báo email/SMS khi phát hành thất bại | Backend Lead | Chưa bắt đầu |
| KT-06 | **Inventory stock mismatch** - Tồn kho thực tế không khớp với hệ thống do lỗi tính toán hoặc race condition | Cao | Cao | Nghiêm trọng | (1) Sử dụng database transaction với row-level locking cho mọi thay đổi tồn kho. (2) Kiểm kho định kỳ + đối soát tự động. (3) Audit trail mọi biến động kho. (4) Cảnh báo khi chênh lệch > ngưỡng cho phép | Backend Lead | Đang xử lý |

### 2.2. Rủi ro Dự án

| ID | Mô tả rủi ro | Xác suất | Tác động | Mức độ | Biện pháp giảm thiểu | Người chịu trách nhiệm | Trạng thái |
|----|-------------|----------|----------|--------|----------------------|----------------------|------------|
| DA-01 | **Timeline delay** - Trễ tiến độ do ước lượng sai, dependency block, hoặc thay đổi yêu cầu | Cao | TB | Cao | (1) Buffer 20% cho mỗi milestone. (2) Sprint review 2 tuần/lần. (3) Dependency tracking board. (4) Escalation sớm khi trễ > 3 ngày | Project Manager | Đang theo dõi |
| DA-02 | **Scope creep** - Yêu cầu mở rộng phạm vi liên tục từ khách hàng hoặc stakeholder | Cao | TB | Cao | (1) Change request process chính thức. (2) Mỗi thay đổi phải có impact assessment (time, cost, risk). (3) Product backlog ưu tiên rõ ràng. (4) Sprint scope lock sau planning | Project Manager | Đang theo dõi |
| DA-03 | **Resource turnover** - Mất thành viên chủ chốt (dev, QA) giữa dự án | TB | Cao | Cao | (1) Documentation đầy đủ (code, API, architecture). (2) Cross-training giữa các thành viên. (3) Knowledge sharing session hàng tuần. (4) Code review bắt buộc để giảm bus factor | Project Manager | Đang theo dõi |
| DA-04 | **Training adoption** - Nhân viên cửa hàng không sử dụng được hệ thống mới, quay lại quy trình cũ | TB | TB | TB | (1) Tài liệu hướng dẫn HDSD đầy đủ bằng tiếng Việt. (2) Video training cho từng chức năng. (3) Hotline hỗ trợ 7 ngày đầu. (4) Super-user tại mỗi cửa hàng | BA Lead | Chưa bắt đầu |
| DA-05 | **Data migration from legacy POS** - Lỗi khi chuyển dữ liệu từ hệ thống POS cũ (sản phẩm, khách hàng, lịch sử giao dịch) | TB | Cao | Cao | (1) Migration script có dry-run mode. (2) Đối soát số lượng record trước/sau. (3) Rollback plan nếu lỗi. (4) Chạy migration ngoài giờ kinh doanh. (5) Giữ hệ thống cũ song song 1 tháng | Tech Lead | Chưa bắt đầu |

### 2.3. Rủi ro Nghiệp vụ

| ID | Mô tả rủi ro | Xác suất | Tác động | Mức độ | Biện pháp giảm thiểu | Người chịu trách nhiệm | Trạng thái |
|----|-------------|----------|----------|--------|----------------------|----------------------|------------|
| NV-01 | **Wrong promotion rules** - Cấu hình khuyến mãi sai dẫn đến giảm giá quá mức hoặc không áp dụng đúng điều kiện | Cao | Cao | Nghiêm trọng | (1) Preview/simulate khuyến mãi trước khi kích hoạt. (2) Giới hạn mức giảm tối đa. (3) Approval workflow cho khuyến mãi lớn. (4) Báo cáo realtime doanh thu khuyến mãi. (5) Có thể tạm dừng khuyến mãi ngay lập tức | BA Lead | Đang xử lý |
| NV-02 | **Cashbook reconciliation errors** - Sai lệch giữa sổ quỹ và thực thu/chi, không cân đối được cuối ngày | TB | Cao | Cao | (1) Tự động tạo bút toán khi có giao dịch. (2) Đối soát cuối ca tự động. (3) Báo cáo chênh lệch realtime. (4) Không cho phép đóng ca khi chênh lệch vượt ngưỡng | BA Lead | Đang xử lý |
| NV-03 | **Customer data privacy breach** - Lộ lọt thông tin khách hàng (SĐT, địa chỉ, lịch sử mua hàng) | Thấp | Cao | TB | (1) Mã hoá dữ liệu nhạy (AES-256). (2) RBAC phân quyền theo chi nhánh. (3) Audit log truy cập dữ liệu khách hàng. (4) Mask SĐT/email trên giao diện (chỉ hiện 4 số cuối). (5) Chính sách bảo mật và đào tạo nhân viên | Tech Lead | Đang theo dõi |
| NV-04 | **Wrong stock calculation** - Tính sai tồn kho do lỗi công thức (nhập, xuất, chuyển kho, trả hàng, huỷ) | TB | Cao | Cao | (1) Unit test đầy đủ cho mỗi loại phiếu kho. (2) Công thức tính tồn kho được review bởi BA + Dev. (3) Đối soát tồn kho theo lô/batch. (4) Kiểm kho đột xuất khi nghi ngờ sai lệch | Backend Lead | Đang xử lý |

### 2.4. Rủi ro Vận hành

| ID | Mô tả rủi ro | Xác suất | Tác động | Mức độ | Biện pháp giảm thiểu | Người chịu trách nhiệm | Trạng thái |
|----|-------------|----------|----------|--------|----------------------|----------------------|------------|
| VH-01 | **Server downtime during peak sales** - Server sập trong giờ cao điểm (11h-13h, 17h-21h) hoặc dịp lễ/Tết | Thấp | Cao | TB | (1) Auto-scaling policy cho giờ cao điểm. (2) Health check + auto-restart. (3) CDN cho static assets. (4) POS offline mode đảm bảo bán hàng không gián đoạn. (5) SLA 99.9% uptime | DevOps Lead | Đang theo dõi |
| VH-02 | **Backup failure** - Mất dữ liệu do backup thất bại hoặc không thể restore | Thấp | Cao | TB | (1) Backup tự động hàng ngày (daily) + hàng tuần (weekly full). (2) Backup lưu tại 2 vị trí (on-site + cloud). (3) Test restore hàng tháng. (4) Monitoring alert khi backup fail. (5) RPO < 1h, RTO < 4h | DevOps Lead | Đang theo dõi |
| VH-03 | **Redis cache corruption** - Cache bị sai dữ liệu dẫn đến hiển thị sai giá, tồn kho, thông tin sản phẩm | TB | TB | TB | (1) TTL hợp lý cho từng loại cache (giá: 5 phút, tồn kho: 1 phút). (2) Cache invalidation khi có write. (3) Fallback về database khi cache miss. (4) Redis Sentinel/Cluster cho HA. (5) Monitoring Redis memory + hit rate | DevOps Lead | Đang theo dõi |

---

## 3. Quy trình quản lý rủi ro

### 3.1. Nhận diện rủi ro
- Review danh sách rủi ro mỗi **2 tuần** trong Sprint Retrospective
- Bất kỳ thành viên nào đều có thể báo cáo rủi ro mới qua Jira/Slack
- Đánh giá rủi ro khi có thay đổi lớn (feature mới, thay đổi infrastructure, thêm chi nhánh)

### 3.2. Đánh giá và phân loại
- Sử dụng ma trận **Xác suất x Tác động** để xác định mức độ
- Rủi ro mức **Nghiêm trọng** và **Cao**: báo cáo trong daily standup
- Rủi ro mức **TB** và **Thấp**: review trong sprint planning

### 3.3. Xử lý rủi ro
- **Tránh (Avoid):** Thay đổi kế hoạch để loại bỏ rủi ro
- **Giảm thiểu (Mitigate):** Thực hiện biện pháp giảm xác suất hoặc tác động
- **Chuyển giao (Transfer):** Chuyển rủi ro cho bên thứ 3 (bảo hiểm, SLA vendor)
- **Chấp nhận (Accept):** Ghi nhận và theo dõi nếu chi phí xử lý > tác động

### 3.4. Theo dõi và báo cáo
- **Dashboard rủi ro:** Cập nhật trên Jira board riêng
- **Báo cáo tuần:** Tổng hợp rủi ro mới, rủi ro đã xử lý, rủi ro đang mở
- **Escalation:** Rủi ro Nghiêm trọng chưa xử lý sau 48h -> báo cáo Ban giám đốc

---

## 4. Lịch sử cập nhật

| Ngày | Người cập nhật | Nội dung thay đổi |
|------|---------------|-------------------|
| 2026-04-16 | Project Manager | Tạo phiên bản đầu tiên với 17 rủi ro |

---

> **Ghi chú:** Tài liệu này cần được review và cập nhật định kỳ mỗi 2 tuần hoặc khi có sự kiện ảnh hưởng đến dự án.
