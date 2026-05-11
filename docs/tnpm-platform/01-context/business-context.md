# 01. Bối cảnh kinh doanh TNPM

> Nguồn: [`../99-source-archive/TNPM_HLD_v2.pdf`](../99-source-archive/TNPM_HLD_v2.pdf) (partner gửi 04/2026, TOGAF-aligned) + làm việc với team Reborn.

## 1. TNPM là ai

- **TNPM** thuộc nhóm **ROX Key** — đơn vị B2B chuyên vận hành bất động sản (property management as a service).
- Mô hình: **Chủ đầu tư (CĐT) thuê TNPM** vận hành end-to-end: dịch vụ + kỹ thuật + an ninh + thu phí + báo cáo P&L cho CĐT.
- Quy mô hiện tại theo HLD: **7+ loại hình bất động sản, nhiều dự án (site) song song**, mục tiêu hợp nhất tất cả trên **một platform multi-tenant duy nhất**.

## 2. 7 loại hình bất động sản TNPM vận hành

| # | Loại | Khách hàng | Đặc thù nghiệp vụ |
|---|---|---|---|
| 1 | Chung cư / Khu dân cư | B2C — cư dân | Phí dịch vụ định kỳ, gửi xe, điện/nước bậc thang |
| 2 | Văn phòng cho thuê | B2B — doanh nghiệp | Lease + phí dịch vụ, escalation theo CPI |
| 3 | Khu công nghiệp (IPC) | B2B sản xuất | Diện tích lớn, công nghiệp, hạ tầng riêng |
| 4 | Trung tâm thương mại (TTTM) | B2B — tenant bán lẻ | **Turnover rent (% doanh thu)** + Marketing Levy, POS integration |
| 5 | Nhà thấp tầng / Villa | B2C | Tương tự chung cư, ít cư dân/HĐ hơn |
| 6 | Khu liên cơ quan hành chính | B2G | **Workflow kho bạc**, ngân sách năm, chứng từ chuyên ngành |
| 7 | Tiện ích đơn lẻ | Khách vãng lai / HĐ ngắn hạn | Bán dịch vụ rời (gửi xe theo lượt, đặt phòng họp) |

## 3. Stakeholder & User Role

| Vai trò | Mô tả | Truy cập platform |
|---|---|---|
| **Chủ đầu tư (CĐT)** | Sở hữu dự án, thuê TNPM vận hành | Owner Portal — chỉ thấy dự án của mình, dashboard P&L, role-based row security |
| **TNPM Leadership** | Ban điều hành TNPM | Portfolio view tổng toàn hệ thống |
| **BQL / QLDA** | Ban quản lý / Quản lý dự án từng site | Phê duyệt chọn NCC, ký HĐ, nghiệm thu cuối |
| **KST / Kỹ thuật** | Kỹ sư trưởng, kỹ thuật viên | Phân công task NCC, theo dõi tiến độ, nghiệm thu hiện trường |
| **Kế toán** | Tài chính TNPM | Nhận invoice NCC, xác nhận 3-way match, thực hiện thanh toán |
| **Vendor / NCC** | Nhà cung cấp dịch vụ | Vendor Portal — nhận thông báo, cập nhật trạng thái, gửi invoice |
| **Khách hàng** | Cư dân (B2C), Doanh nghiệp thuê (B2B), Cơ quan NN (B2G), khách vãng lai | App Timi (mobile) + nhận thông báo / hoá đơn |

## 4. KPI & SLA mà HLD cam kết

### Thanh toán
- Tỷ lệ thanh toán đúng hạn **≥ 85%**.
- Xử lý giao dịch **< 3s**.
- Auto-debit success **≥ 90%**.

### Vendor
- SLA NCC met **≥ 95%**.
- Thời gian approve thanh toán NCC **< 5 ngày**.
- NCC rating trung bình **≥ 4/5**.

### Vận hành
- Xử lý Service Request **< 24h**.
- Hoàn thành SR **≥ 95%**.
- Uptime platform **99.5%**.

### Tài chính
- Báo cáo P&L **T+0 auto**.
- Chênh lệch đối soát **< 0.01%**.
- Giảm chi phí thủ công **60%**.

## 5. Tại sao không dùng được CRM retail có sẵn

Reborn đã có nền tảng CRM cho retail (Spa, F&B, Store, Mentor, Loyalty). Khác biệt chính khi sang TNPM:

| Khía cạnh | CRM retail | TNPM cần |
|---|---|---|
| Đơn vị tính phí | Sản phẩm/dịch vụ rời, voucher | **Chỉ số (kWh, m³, m², %DT, CPI escalation, CAM allocation)** |
| Hợp đồng | Đăng ký gói dịch vụ | **Lease với escalation schedule, deposit ledger, auto-renew** |
| Đối tác | Affiliate, partner sale | **Vendor full vòng đời: 3-way match (PO – Biên bản nghiệm thu – Invoice), approval đa cấp, KPI dashboard** |
| Compliance | Hoá đơn điện tử thường | **NHNN payment compliance + B2G workflow kho bạc** cho khu HC |
| Báo cáo | Doanh thu, voucher | **P&L per project cho CĐT, portfolio aggregate, vendor KPI** |
| Multi-tenant | 1 tenant = 1 spa/store | **1 tenant = 1 dự án bất động sản, scale 50+ dự án** |

Đây là lý do gần **60% endpoint là NEW** (xem [`../03-architecture/microservices.md`](../03-architecture/microservices.md)) dù bề ngoài có nhiều thứ "trông giống" CRM retail.

## 6. Risk lớn HLD đã flag

| Mức | Risk | Mitigation HLD đề xuất |
|---|---|---|
| CAO | Tenant TTTM khai gian doanh thu | POS integration + penalty clause trong HĐ |
| CAO | Multi-tenant data leak | Schema isolation hoặc RLS + pentest định kỳ |
| CAO | Vendor invoice gian lận | 3-way match bắt buộc + digital signature |
| TRUNG | B2G workflow kho bạc phức tạp | Workflow engine config-able (BPM) |
| TRUNG | Hiệu năng batch hàng loạt ngày mồng 1 | Distributed queue per project, idempotency key, DLQ |
| THẤP | KH B2B chậm adopt mobile app Timi | Giữ song song NET30 invoice |
