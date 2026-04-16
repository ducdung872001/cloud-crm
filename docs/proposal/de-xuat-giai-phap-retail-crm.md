# ĐỀ XUẤT GIẢI PHÁP REBORN RETAIL CRM

> **Phiên bản:** 1.0  
> **Ngày:** 16/04/2026  
> **Đơn vị:** Reborn Technology  
> **Liên hệ:** ceo@reborn.vn  

---

## Mục lục

1. [Tóm tắt điều hành](#1-tom-tat-dieu-hanh)
2. [Bài toán ngành bán lẻ](#2-bai-toan-nganh-ban-le)
3. [Giải pháp tổng quan](#3-giai-phap-tong-quan)
4. [Kiến trúc hệ thống](#4-kien-truc-he-thong)
5. [Chi tiết phân hệ](#5-chi-tiet-phan-he)
6. [Điểm nổi bật](#6-diem-noi-bat)
7. [Tích hợp](#7-tich-hop)
8. [Lộ trình triển khai](#8-lo-trinh-trien-khai)
9. [SLA & Hỗ trợ](#9-sla--ho-tro)
10. [Phụ lục](#10-phu-luc)

---

## 1. Tóm tắt điều hành

**Reborn Retail CRM** là nền tảng quản lý toàn diện dành cho chuỗi cửa hàng bán lẻ tại Việt Nam. Hệ thống tích hợp đồng bộ các nghiệp vụ: **bán hàng (POS)**, **quản lý kho hàng**, **tài chính kế toán**, **quản lý khách hàng**, **loyalty** và **marketing** trên một dashboard duy nhất.

### Điểm nổi bật chính

| # | Đặc điểm | Mô tả |
|---|----------|-------|
| 1 | **Multi-branch** | Quản lý nhiều chi nhánh, nhiều kho trên cùng một hệ thống |
| 2 | **POS tích hợp** | Quầy bán hàng chuyên nghiệp, hỗ trợ offline, in hoá đơn |
| 3 | **Omnichannel** | Đồng bộ đơn hàng từ cửa hàng, website, Zalo, Facebook |
| 4 | **Loyalty tích hợp** | Tích điểm, hạng thẻ, đổi thưởng — không cần phần mềm riêng |
| 5 | **BPM Engine** | Tự động hoá quy trình nghiệp vụ theo luật riêng của doanh nghiệp |
| 6 | **API-first** | Tích hợp dễ dàng với hệ thống hoá đơn điện tử, vận chuyển, thanh toán |

**Đối tượng:** Chuỗi bán lẻ thời trang, điện tử, F&B, mỹ phẩm, siêu thị mini và các ngành bán lẻ khác.

---

## 2. Bài toán ngành bán lẻ

### 2.1 Thực trạng

Các chuỗi bán lẻ tại Việt Nam đang gặp phải nhiều thách thức khi mở rộng quy mô:

| # | Vấn đề | Hậu quả |
|---|--------|---------|
| 1 | **Quản lý đa kênh rời rạc** | Đơn hàng offline và online xử lý tách biệt, không đồng bộ trạng thái |
| 2 | **Tồn kho nhiều chi nhánh** | Không biết hàng còn ở kho nào, điều chuyển thủ công, mất cân đối |
| 3 | **Dữ liệu khách hàng phân tán** | Mỗi chi nhánh một danh sách, không nhận diện khách quay lại |
| 4 | **Loyalty riêng lẻ** | Dùng phần mềm thẻ thành viên riêng, không liên thông với bán hàng |
| 5 | **Báo cáo thủ công** | Xuất Excel, tổng hợp bằng tay, chậm và dễ sai |
| 6 | **Khó mở rộng** | Thêm chi nhánh phải cài đặt lại, không có chuẩn hoá quy trình |

### 2.2 Nhu cầu cốt lõi

- Một hệ thống duy nhất cho toàn chuỗi
- POS nhanh, ổn định, hỗ trợ offline
- Quản lý kho real-time qua nhiều chi nhánh
- Nhận diện khách hàng toàn chuỗi, tích điểm tự động
- Báo cáo tự động, dashboard real-time
- Tích hợp hoá đơn điện tử, vận chuyển, mạng xã hội

---

## 3. Giải pháp tổng quan

### 3.1 Nền tảng All-in-One

```
+-------------------------------------------------------------------+
|                    REBORN RETAIL CRM PLATFORM                      |
+-------------------------------------------------------------------+
|                                                                     |
|  +----------+  +---------+  +-----------+  +----------+            |
|  |   POS    |  |   KHO   |  | TÀI CHÍNH |  |  KHÁCH   |           |
|  | Bán hàng |  | Hàng hoá|  | Thu chi   |  |  HÀNG    |           |
|  | Quầy, Ca |  | Tồn kho |  | Công nợ   |  | Phân khúc|           |
|  +----------+  +---------+  +-----------+  +----------+            |
|                                                                     |
|  +----------+  +---------+  +-----------+  +----------+            |
|  | LOYALTY  |  |MARKETING|  | GIAO HÀNG |  | BÁO CÁO  |           |
|  | Tích điểm|  |Khuyến mãi| | Vận chuyển|  | Dashboard|           |
|  | Hạng thẻ |  | Coupon  |  | Tracking  |  | Xuất file|           |
|  +----------+  +---------+  +-----------+  +----------+            |
|                                                                     |
|  +----------+  +---------+  +-----------+                          |
|  |   BPM    |  |ĐƠN HÀNG |  |  CÀI ĐẶT  |                         |
|  | Quy trình|  | Hoá đơn |  | Chi nhánh |                         |
|  | Luật, Form| | Đổi trả |  | Phân quyền|                         |
|  +----------+  +---------+  +-----------+                          |
|                                                                     |
+-------------------------------------------------------------------+
|              1 DASHBOARD — TOÀN CHUỖI — REAL-TIME                  |
+-------------------------------------------------------------------+
```

### 3.2 Nguyên tắc thiết kế

| Nguyên tắc | Chi tiết |
|------------|----------|
| **Multi-tenant** | Mỗi chuỗi là một tenant độc lập, dữ liệu cách ly toàn bộ |
| **Multi-branch** | Mỗi tenant có nhiều chi nhánh, kho, quầy bán hàng |
| **API-first** | Mỗi chức năng là một API, dễ tích hợp và mở rộng |
| **Offline-capable** | POS hoạt động khi mất mạng, đồng bộ khi có kết nối |
| **Role-based** | Phân quyền theo vai trò: Giám đốc, Quản lý, Thu ngân, Kho |

---

## 4. Kiến trúc hệ thống

### 4.1 Công nghệ

| Tầng | Công nghệ |
|------|-----------|
| **Frontend** | React SPA, Ant Design, PWA (offline POS) |
| **Backend** | Java Spring Boot, microservices |
| **Database** | PostgreSQL (multi-tenant schema) |
| **Cache** | Redis |
| **Message Queue** | RabbitMQ / Kafka |
| **API Gateway** | Spring Cloud Gateway |
| **Auth** | OAuth 2.0 / JWT |

### 4.2 Microservices (12 dịch vụ)

| # | Service | Chức năng chính |
|---|---------|-----------------|
| 1 | **sales-service** | POS, đơn hàng, hoá đơn, đổi trả |
| 2 | **inventory-service** | Hàng hoá, biến thể, tồn kho, kiểm kê, điều chuyển |
| 3 | **billing-service** | Thu chi, công nợ, đối soát, phiếu thu/chi |
| 4 | **market-service** | Khuyến mãi, coupon, flash sale, combo, DMN rules |
| 5 | **customer-service** | Hồ sơ khách hàng, phân khúc, lịch sử mua, loyalty |
| 6 | **notification-service** | SMS, email, push, Zalo OA notification |
| 7 | **integration-service** | Hoá đơn điện tử, vận chuyển, payment gateway |
| 8 | **care-service** | CSKH, ticket, feedback, khiếu nại |
| 9 | **logistics-service** | Đối tác vận chuyển, phí, tracking, giao nhận |
| 10 | **finance-service** | Sổ quỹ, báo cáo tài chính, bảng cân đối |
| 11 | **operation-service** | BPM, quy trình, luật, form builder |
| 12 | **auth-service** | Đăng nhập, phân quyền, tenant, chi nhánh, nhân viên |

### 4.3 Sơ đồ kiến trúc

```
                        +------------------+
                        |   React SPA      |
                        |   (PWA / POS)    |
                        +--------+---------+
                                 |
                        +--------+---------+
                        |   API Gateway    |
                        |   (Auth + Rate)  |
                        +--------+---------+
                                 |
        +----------+-------------+-------------+----------+
        |          |             |             |          |
   +----+----+ +---+----+ +-----+-----+ +----+----+ +---+----+
   | sales   | |inventory| | billing   | | market  | |customer|
   | service | | service | | service   | | service | | service|
   +---------+ +---------+ +-----------+ +---------+ +--------+
        |          |             |             |          |
   +----+----+ +---+----+ +-----+-----+ +----+----+ +---+----+
   |notifica-| |integra- | |  care     | |logistics| |finance |
   |  tion   | |  tion   | |  service  | | service | | service|
   +---------+ +---------+ +-----------+ +---------+ +--------+
        |          |             |             |          |
        +----------+-------------+-------------+----------+
                                 |
                   +-------------+-------------+
                   |  operation  |    auth     |
                   |  service    |   service   |
                   +-------------+-------------+
                                 |
                   +-------------+-------------+
                   | PostgreSQL  |    Redis    |
                   +-------------+-------------+
```

---

## 5. Chi tiết phân hệ

### 5.1 POS Bán hàng

Quản lý quầy bán hàng, ca làm việc và quy trình thanh toán tại cửa hàng.

| Chức năng | Mô tả |
|-----------|-------|
| Quản lý quầy | Tạo nhiều quầy bán hàng, gán nhân viên theo ca |
| Ca làm việc | Mở/đóng ca, báo cáo doanh thu theo ca |
| Tìm kiếm sản phẩm | Theo tên, mã, barcode, danh mục |
| Giỏ hàng | Thêm, sửa, xoá sản phẩm, áp dụng khuyến mãi tự động |
| Thanh toán đa phương thức | Tiền mặt, chuyển khoản, thẻ, ví điện tử, QR |
| In hoá đơn | In hoá đơn nhiệt, hoá đơn A4/A5, gửi email |
| Offline mode | Lưu giao dịch local, đồng bộ khi có mạng |
| Nhận diện khách hàng | Tìm theo SĐT, tự động tích điểm loyalty |

### 5.2 Đơn hàng & Hoá đơn

Xử lý đơn hàng đa kênh và quản lý hoá đơn VAT.

| Chức năng | Mô tả |
|-----------|-------|
| Tạo đơn hàng | Từ POS, website, Zalo, Facebook |
| Trạng thái đơn | Mới → Xác nhận → Đang giao → Hoàn thành / Huỷ |
| Đổi trả hàng | Đổi sản phẩm, trả hàng hoàn tiền, ghi nhận lý do |
| Hoá đơn VAT | Liên thông hoá đơn điện tử Viettel (S-Invoice) |
| Đơn hàng đa kênh | Đồng bộ trạng thái giữa các kênh bán hàng |
| Lịch sử đơn hàng | Tra cứu, lọc, xuất Excel |

### 5.3 Khách hàng

Quản lý thông tin khách hàng toàn chuỗi, phân khúc và chăm sóc.

| Chức năng | Mô tả |
|-----------|-------|
| Hồ sơ khách hàng | Tên, SĐT, email, địa chỉ, ngày sinh, ghi chú |
| Phân khúc | Tự động phân khúc theo doanh thu, tần suất, sản phẩm |
| Lịch sử mua hàng | Toàn bộ giao dịch trên mọi chi nhánh |
| Tag & Nhãn | Gán tag tự do để phân loại (VIP, B2B, KOL, ...) |
| Hợp nhất | Gộp nhiều hồ sơ trùng thành một |
| Import/Export | Nhập danh sách từ Excel, xuất báo cáo |

### 5.4 Hàng hoá & Kho

Quản lý sản phẩm, biến thể, nhiều kho và nghiệp vụ kho.

| Chức năng | Mô tả |
|-----------|-------|
| Sản phẩm | Tên, mã SKU, barcode, đơn vị, danh mục, hình ảnh |
| Biến thể | Màu sắc, kích cỡ, phiên bản — mỗi biến thể có SKU riêng |
| Nhiều kho | Mỗi chi nhánh một kho, kho tổng, kho transit |
| Nhập kho | Phiếu nhập, nhà cung cấp, giá nhập, lô hàng |
| Xuất kho | Phiếu xuất bán, xuất điều chuyển, xuất huỷ |
| Điều chuyển | Chuyển hàng giữa các kho, theo dõi trạng thái |
| Kiểm kê | Tạo phiếu kiểm kê, đối chiếu, cân bằng tồn kho |
| Cảnh báo tồn | Thông báo khi tồn dưới mức tối thiểu |

### 5.5 Tài chính

Quản lý thu chi, sổ quỹ và công nợ.

| Chức năng | Mô tả |
|-----------|-------|
| Sổ thu chi | Ghi nhận mọi giao dịch thu/chi theo danh mục |
| Quản lý quỹ | Quỹ tiền mặt, quỹ ngân hàng, theo dõi số dư |
| Công nợ | Công nợ khách hàng, công nợ nhà cung cấp |
| Phiếu thu/chi | Tạo phiếu, duyệt phiếu, in phiếu |
| Đối soát | Đối soát doanh thu POS vs ngân hàng vs hoá đơn |
| Báo cáo tài chính | Báo cáo thu chi, lợi nhuận gộp, dòng tiền |

### 5.6 Marketing

Khuyến mãi, coupon và các chương trình bán hàng.

| Chức năng | Mô tả |
|-----------|-------|
| Chương trình khuyến mãi | Giảm giá %, giảm tiền, mua X tặng Y |
| Coupon / Voucher | Tạo mã, phát hành, theo dõi sử dụng, hạn sử dụng |
| Flash sale | Khuyến mãi theo khung giờ, giới hạn số lượng |
| Combo | Bán combo sản phẩm với giá ưu đãi |
| DMN Rules | Cấu hình luật khuyến mãi phức tạp bằng DMN engine |
| Thống kê hiệu quả | Doanh thu từ khuyến mãi, tỷ lệ sử dụng coupon |

### 5.7 Loyalty

Chương trình khách hàng thân thiết tích hợp trực tiếp với bán hàng.

| Chức năng | Mô tả |
|-----------|-------|
| Tích điểm | Tự động tích điểm khi mua hàng tại mọi chi nhánh |
| Hạng thẻ | Thiết lập nhiều hạng (Thành viên, Bạc, Vàng, Kim cương) |
| Điều kiện thăng hạng | Theo doanh thu tích luỹ hoặc điểm tích luỹ |
| Đổi thưởng | Đổi điểm lấy quà tặng, voucher, giảm giá |
| Hạn điểm | Cấu hình thời hạn hiệu lực của điểm |
| Báo cáo loyalty | Thống kê điểm phát sinh, sử dụng, hết hạn |

### 5.8 Giao hàng

Quản lý vận chuyển và đối tác giao hàng.

| Chức năng | Mô tả |
|-----------|-------|
| Đối tác vận chuyển | Tích hợp GHN, GHTK, Viettel Post |
| Tính phí | Tự động tính phí ship theo đối tác và địa chỉ |
| Tạo vận đơn | Gửi yêu cầu lấy hàng từ đơn hàng |
| Tracking | Theo dõi trạng thái giao hàng real-time |
| Đối soát COD | Đối soát tiền thu hộ với đối tác vận chuyển |
| Báo cáo giao hàng | Tỷ lệ giao thành công, thời gian trung bình |

### 5.9 Báo cáo

Dashboard và báo cáo toàn diện cho toàn chuỗi.

| Nhóm báo cáo | Nội dung |
|--------------|----------|
| **Doanh thu** | Theo ngày/tuần/tháng, theo chi nhánh, theo nhân viên, theo kênh bán |
| **Khách hàng** | Khách mới, khách quay lại, giá trị vòng đời (CLV), phân khúc |
| **Tồn kho** | Tồn hiện tại, hàng bán chạy, hàng tồn lâu, giá trị tồn |
| **Marketing** | Hiệu quả khuyến mãi, ROI coupon, tỷ lệ chuyển đổi |
| **Tài chính** | Thu chi, lợi nhuận, dòng tiền, công nợ |
| **Loyalty** | Điểm phát sinh, điểm sử dụng, tỷ lệ đổi thưởng |
| **Vận hành** | Doanh thu theo ca, hiệu suất nhân viên, thời gian phục vụ |

### 5.10 BPM (Quy trình nghiệp vụ)

Tự động hoá và chuẩn hoá quy trình vận hành.

| Chức năng | Mô tả |
|-----------|-------|
| Thiết kế quy trình | Kéo thả các bước, điều kiện, nhánh rẽ |
| Luật nghiệp vụ | If-then rules, DMN decision table |
| Form builder | Tạo form nhập liệu động cho từng bước |
| Phê duyệt | Cấu hình luồng duyệt nhiều cấp |
| Tự động hoá | Trigger tự động khi có sự kiện (đơn mới, trả hàng, ...) |
| Lịch sử | Ghi log toàn bộ quy trình đã chạy |

### 5.11 Cài đặt

Cấu hình hệ thống và quản lý truy cập.

| Chức năng | Mô tả |
|-----------|-------|
| Quản lý chi nhánh | Thêm, sửa, xoá chi nhánh, địa chỉ, giờ hoạt động |
| Phân quyền | Vai trò: Giám đốc, Quản lý, Thu ngân, Kho, Kế toán |
| Nhân viên | Hồ sơ, tài khoản, gán chi nhánh, gán vai trò |
| Tích hợp Viettel | Cấu hình S-Invoice (hoá đơn điện tử), eTax |
| Tích hợp Zalo OA | Gửi tin nhắn CSKH, thông báo đơn hàng |
| Tích hợp Facebook | Đồng bộ tin nhắn Fanpage, tạo đơn từ chat |
| Cấu hình chung | Logo, tên cửa hàng, mẫu hoá đơn, đơn vị tiền tệ |

---

## 6. Điểm nổi bật

### 6.1 Multi-branch Native

Thiết kế từ đầu cho chuỗi nhiều chi nhánh. Mỗi chi nhánh có kho, quầy, nhân viên, báo cáo riêng — nhưng tổng hợp trên một dashboard duy nhất. Không cần cài đặt riêng lẻ cho từng điểm bán.

### 6.2 POS Offline-Capable

Quầy bán hàng hoạt động bình thường ngay cả khi mất internet. Giao dịch được lưu tại local (PWA + IndexedDB) và tự động đồng bộ lên server khi có kết nối trở lại. Đảm bảo bán hàng không gián đoạn.

### 6.3 Omnichannel

Đồng bộ đơn hàng từ tất cả các kênh: cửa hàng, website, Zalo, Facebook. Khách hàng có thể đặt hàng online và nhận tại cửa hàng (BOPIS) hoặc giao tận nơi. Toàn bộ đơn hàng hiển thị trên cùng một màn hình quản lý.

### 6.4 Loyalty Tích hợp

Chương trình khách hàng thân thiết được tích hợp trực tiếp vào POS và đơn hàng. Thu ngân chỉ cần nhập SĐT — hệ thống tự động tích điểm, hiển thị hạng thẻ, gợi ý đổi thưởng. Không cần phần mềm loyalty riêng, không cần nhập liệu thủ công.

### 6.5 BPM Engine

Tự động hoá quy trình nghiệp vụ: duyệt đơn hàng lớn, xử lý đổi trả, phê duyệt xuất kho, nhắc lịch CSKH. Cấu hình luật bằng giao diện kéo thả, không cần lập trình. Phù hợp với các chuỗi có quy trình phức tạp hoặc muốn chuẩn hoá vận hành.

### 6.6 API-first

Mọi chức năng đều expose qua RESTful API có tài liệu đầy đủ. Doanh nghiệp có thể tích hợp với hệ thống ERP, kế toán, website, app riêng hoặc bất kỳ hệ thống nào khác. Hỗ trợ webhook để nhận sự kiện real-time.

---

## 7. Tích hợp

### 7.1 Hoá đơn điện tử & Thuế

| Đối tác | Dịch vụ | Mô tả |
|---------|---------|-------|
| **Viettel** | S-Invoice | Phát hành hoá đơn điện tử tự động từ đơn hàng |
| **Viettel** | eTax | Kê khai thuế điện tử, nộp tờ khai |

### 7.2 Mạng xã hội

| Kênh | Chức năng |
|------|-----------|
| **Zalo OA** | Gửi thông báo đơn hàng, CSKH, khuyến mãi qua Zalo |
| **Facebook Fanpage** | Đồng bộ tin nhắn, tạo đơn hàng từ conversation |

### 7.3 Vận chuyển

| Đối tác | Chức năng |
|---------|-----------|
| **GHN (Giao Hàng Nhanh)** | Tạo vận đơn, tính phí, tracking, đối soát COD |
| **GHTK (Giao Hàng Tiết Kiệm)** | Tạo vận đơn, tính phí, tracking, đối soát COD |
| **Viettel Post** | Tạo vận đơn, tính phí, tracking, đối soát COD |

### 7.4 Thanh toán

| Loại | Mô tả |
|------|-------|
| **VNPay / Momo / ZaloPay** | Thanh toán QR tại quầy, thanh toán online |
| **Chuyển khoản ngân hàng** | Đối soát tự động qua bank API |

---

## 8. Lộ trình triển khai

### Tổng quan: 3 giai đoạn — 4 đến 6 tháng

```
Tháng 1-2            Tháng 2-4            Tháng 4-6
+-----------+        +-----------+        +-----------+
| PHASE 1   |  --->  | PHASE 2   |  --->  | PHASE 3   |
| Setup &   |        | Rollout & |        | Marketing |
| POS Pilot |        | Kho + TC  |        | & Loyalty |
+-----------+        +-----------+        +-----------+
```

### Phase 1: Setup & POS Pilot (Tháng 1-2)

| Hạng mục | Chi tiết |
|----------|----------|
| Khảo sát & cấu hình | Thu thập yêu cầu, cấu hình tenant, chi nhánh, vai trò |
| Nhập dữ liệu | Import hàng hoá, danh mục, khách hàng từ hệ thống cũ |
| POS pilot | Triển khai POS tại 1-2 chi nhánh, đào tạo thu ngân |
| Tích hợp hoá đơn | Kết nối S-Invoice Viettel |
| Nghiệm thu Phase 1 | POS hoạt động ổn định, in hoá đơn, báo cáo doanh thu |

### Phase 2: Rollout & Kho + Tài chính (Tháng 2-4)

| Hạng mục | Chi tiết |
|----------|----------|
| Rollout POS | Mở rộng POS ra toàn bộ chi nhánh |
| Kho hàng | Cấu hình nhiều kho, nhập/xuất/điều chuyển, kiểm kê |
| Tài chính | Thu chi, sổ quỹ, công nợ, đối soát |
| Giao hàng | Tích hợp GHN/GHTK/Viettel Post |
| Omnichannel | Kết nối Zalo OA, Facebook Fanpage |
| Nghiệm thu Phase 2 | Toàn bộ chi nhánh online, kho & tài chính hoạt động |

### Phase 3: Marketing & Loyalty & Báo cáo (Tháng 4-6)

| Hạng mục | Chi tiết |
|----------|----------|
| Marketing | Thiết lập chương trình khuyến mãi, coupon, flash sale |
| Loyalty | Cấu hình tích điểm, hạng thẻ, đổi thưởng |
| BPM | Thiết kế quy trình duyệt, tự động hoá |
| Báo cáo | Dashboard tổng hợp, báo cáo tự động, xuất file |
| Đào tạo toàn diện | Đào tạo quản lý, kế toán, CSKH |
| Nghiệm thu toàn bộ | Hệ thống vận hành đầy đủ, bàn giao tài liệu |

---

## 9. SLA & Hỗ trợ

### 9.1 Cam kết dịch vụ

| Hạng mục | Cam kết |
|----------|---------|
| **Uptime** | 99.5% (tính theo tháng, trừ bảo trì đã thông báo) |
| **Thời gian hỗ trợ** | Trong giờ hành chính: 8:00-17:30, Thứ 2 — Thứ 7 |
| **Thời gian phản hồi** | Lỗi nghiêm trọng: 2 giờ — Lỗi bình thường: 8 giờ |
| **Kênh hỗ trợ** | Zalo OA, email, điện thoại, ticket system |

### 9.2 Đào tạo

| Buổi | Nội dung | Đối tượng |
|------|----------|-----------|
| Buổi 1 | POS bán hàng, đơn hàng, in hoá đơn | Thu ngân, nhân viên bán hàng |
| Buổi 2 | Kho hàng, tài chính, giao hàng | Quản lý kho, kế toán |
| Buổi 3 | Marketing, loyalty, báo cáo, cài đặt | Quản lý cửa hàng, giám đốc |

### 9.3 Bảo hành & Tài liệu

| Hạng mục | Chi tiết |
|----------|---------|
| **Bảo hành** | 6 tháng sau nghiệm thu — sửa lỗi miễn phí |
| **SA (Solution Architecture)** | 15 phần — kiến trúc từng module |
| **URD (User Requirement)** | 15 phần — đặc tả yêu cầu người dùng |
| **HDSD (Hướng dẫn sử dụng)** | 14 phần — hướng dẫn thao tác cho end-user |
| **Test suites** | 51 bộ test — kiểm thử toàn diện mọi chức năng |
| **API Documentation** | Swagger/OpenAPI cho toàn bộ 12 microservices |

---

## 10. Phụ lục

### 10.1 Feature Checklist

| # | Phân hệ | Chức năng | Có/Không |
|---|---------|-----------|----------|
| 1 | POS | Quản lý quầy bán hàng | Có |
| 2 | POS | Ca làm việc | Có |
| 3 | POS | Thanh toán đa phương thức | Có |
| 4 | POS | In hoá đơn nhiệt / A4 | Có |
| 5 | POS | Offline mode (PWA) | Có |
| 6 | Đơn hàng | Tạo đơn đa kênh | Có |
| 7 | Đơn hàng | Quản lý trạng thái đơn | Có |
| 8 | Đơn hàng | Đổi trả hàng | Có |
| 9 | Đơn hàng | Hoá đơn điện tử (S-Invoice) | Có |
| 10 | Khách hàng | CRUD hồ sơ khách hàng | Có |
| 11 | Khách hàng | Phân khúc tự động | Có |
| 12 | Khách hàng | Lịch sử mua hàng toàn chuỗi | Có |
| 13 | Khách hàng | Hợp nhất hồ sơ trùng | Có |
| 14 | Kho | Quản lý sản phẩm & biến thể | Có |
| 15 | Kho | Nhiều kho / nhiều chi nhánh | Có |
| 16 | Kho | Nhập kho / Xuất kho | Có |
| 17 | Kho | Điều chuyển kho | Có |
| 18 | Kho | Kiểm kê | Có |
| 19 | Kho | Cảnh báo tồn kho thấp | Có |
| 20 | Tài chính | Sổ thu chi | Có |
| 21 | Tài chính | Quản lý quỹ | Có |
| 22 | Tài chính | Công nợ KH / NCC | Có |
| 23 | Tài chính | Đối soát doanh thu | Có |
| 24 | Marketing | Chương trình khuyến mãi | Có |
| 25 | Marketing | Coupon / Voucher | Có |
| 26 | Marketing | Flash sale | Có |
| 27 | Marketing | Combo | Có |
| 28 | Loyalty | Tích điểm tự động | Có |
| 29 | Loyalty | Hạng thẻ (nhiều cấp) | Có |
| 30 | Loyalty | Đổi thưởng | Có |
| 31 | Loyalty | Hạn điểm | Có |
| 32 | Giao hàng | Tích hợp GHN / GHTK / Viettel Post | Có |
| 33 | Giao hàng | Tự động tính phí ship | Có |
| 34 | Giao hàng | Tracking real-time | Có |
| 35 | Giao hàng | Đối soát COD | Có |
| 36 | Báo cáo | Dashboard real-time | Có |
| 37 | Báo cáo | Báo cáo doanh thu | Có |
| 38 | Báo cáo | Báo cáo khách hàng | Có |
| 39 | Báo cáo | Báo cáo tồn kho | Có |
| 40 | Báo cáo | Xuất Excel / PDF | Có |
| 41 | BPM | Thiết kế quy trình | Có |
| 42 | BPM | Luật nghiệp vụ (DMN) | Có |
| 43 | BPM | Form builder | Có |
| 44 | Cài đặt | Quản lý chi nhánh | Có |
| 45 | Cài đặt | Phân quyền theo vai trò | Có |
| 46 | Tích hợp | Viettel S-Invoice | Có |
| 47 | Tích hợp | Viettel eTax | Có |
| 48 | Tích hợp | Zalo OA | Có |
| 49 | Tích hợp | Facebook Fanpage | Có |
| 50 | Tích hợp | Payment gateway (VNPay/Momo) | Có |

### 10.2 Danh mục tài liệu

| # | Loại tài liệu | Số lượng | Ghi chú |
|---|---------------|----------|---------|
| 1 | SA (Solution Architecture) | 15 phần | Kiến trúc từng module |
| 2 | URD (User Requirement) | 15 phần | Đặc tả yêu cầu |
| 3 | HDSD (Hướng dẫn sử dụng) | 14 phần | End-user guide |
| 4 | Test Suites | 51 bộ | Unit + Integration + E2E |
| 5 | API Docs | 12 services | Swagger/OpenAPI |
| 6 | Đề xuất giải pháp | 1 tài liệu | Tài liệu này |

---

> **Reborn Technology** — Giải pháp quản lý bán lẻ toàn diện cho chuỗi cửa hàng Việt Nam.  
> Liên hệ: ceo@reborn.vn
