# Part 06 — Hướng dẫn Cashier tại quầy

> 🎯 **Đối tượng:** Nhân viên thu ngân (Cashier), Store Manager.
> Phần này hướng dẫn workflow tại POS bên ngoài (POS hiện tại của khách) **không phải qua admin Reborn**.

## 1. Workflow tại quầy

### 1.1. KH có thẻ thành viên — Hỏi trước thanh toán

```
Cashier: "Anh/chị có thẻ thành viên không ạ?"

  ┌─ Có ─► Tiếp tục §1.2 (Lookup KH)
  │
  └─ Không ─► §3 Mời đăng ký mới
```

### 1.2. Lookup KH

**Cách 1: Scan thẻ ảo (barcode/QR)**

1. KH mở app, hiển thị thẻ ảo
2. Cashier scan bằng máy scan POS
3. POS tự động tra cứu → hiển thị tên KH, hạng, balance

**Cách 2: Nhập SĐT**

1. Cashier nhập SĐT KH vào POS
2. POS gọi API Reborn → trả về thông tin

**Hiển thị trên POS sau lookup:**
```
┌──────────────────────────────────────┐
│ Khách hàng: Nguyễn Văn A             │
│ Hạng: 💎 Gold                        │
│ Số điểm: 1.500                       │
│ Voucher khả dụng: 2 cái              │
│                                      │
│ [Tiếp tục] [Đổi điểm] [Dùng voucher] │
└──────────────────────────────────────┘
```

### 1.3. KH dùng điểm giảm trực tiếp

KH muốn dùng N điểm để giảm trên hoá đơn:

1. Cashier bấm **[Đổi điểm]**
2. Nhập số điểm muốn dùng (tối đa = balance, min 500 điểm)
3. POS tính giảm giá: N điểm × tỷ giá (e.g., 500 điểm × 100đ = 50.000đ)
4. POS gọi API consume → trừ điểm trong Reborn → đợi confirm
5. Áp giảm giá vào tổng hoá đơn

**Lưu ý:**
- Min điểm/lần dùng: cấu hình per tenant (default 500)
- KH thanh toán phần còn lại bằng tiền/thẻ

### 1.4. KH dùng voucher

1. KH cung cấp voucher code (từ app/SMS/Email)
2. Cashier bấm **[Dùng voucher]** → nhập code
3. POS validate via API → check valid (chưa used, chưa expired, eligible amount)
4. Áp discount tương ứng
5. Sau thanh toán, POS mark voucher = used

### 1.5. Hoàn tất thanh toán

1. KH thanh toán bằng tiền mặt / thẻ
2. POS in hoá đơn (có ghi tên KH + điểm tích thêm + balance mới)
3. POS auto gửi data về Reborn (auto-earn)

**Trên hoá đơn cuối:**
```
======================
  HOÁ ĐƠN
======================
Mã: POS-001-202605110001
Ngày: 11/05/2026 15:30
Cashier: Trần B
----------------------
KH: Nguyễn Văn A
Phone: +849...4567
Hạng: 💎 Gold

Sữa tươi 1L           x2  70.000
Bánh mì sandwich      x3  45.000
...                       350.000
Giảm điểm (500 đ)         -50.000
----------------------
TỔNG:                     300.000

Tích thêm: +35 điểm
Số dư mới: 1.535 điểm
Hạng: 💎 Gold (giữ)
======================
```

## 2. Hiển thị tier-up message

Nếu sau giao dịch KH upgrade tier:

```
🎉 Chúc mừng Nguyễn Văn A!
Bạn đã lên hạng: Gold → 💎 Diamond
Quyền lợi mới: ưu tiên CSKH, personal shopper, gift box hàng tháng
======================
```

Cashier nhớ chúc mừng KH miệng. KH cũng nhận SMS/Zalo notification.

## 3. Đăng ký KH mới tại quầy

KH chưa có thẻ → mời đăng ký:

1. Cashier hỏi: "Đăng ký thẻ thành viên miễn phí, anh/chị có được +500 điểm chào mừng (~50.000đ)?"
2. KH đồng ý → bấm **[Đăng ký]** trên POS
3. Nhập:
   - SĐT (KH đọc)
   - Tên (KH đọc)
   - DOB (optional, để được sinh nhật bonus)
4. POS gửi OTP đến SĐT KH → KH đọc mã → nhập vào POS
5. POS tạo member trong Reborn
6. Welcome bonus 500 điểm tự cộng
7. KH cài app sau (hoặc đợi SMS với link)

## 4. Tình huống edge

### 4.1. KH quên SĐT

- Hỏi tên đầy đủ + 4 số cuối SĐT
- Cashier nhập "4 số cuối" → POS tra cứu fuzzy → hiển thị candidates → KH confirm

### 4.2. KH không nhận được SMS điểm

- Cashier check: KH có phải member không? (lookup)
- Nếu đúng → đảm bảo phone đúng + chưa opt-out marketing
- Nếu vẫn không nhận → tạo ticket CSKH

### 4.3. KH khiếu nại "không thấy điểm tích"

- Cashier check trên POS lịch sử tích điểm trong ngày
- Nếu POS ghi nhận → có thể delay 5-10 phút mới hiện trên app
- Nếu POS không ghi nhận → có thể quên scan thẻ → goodwill adjust (cho Store Manager)

### 4.4. POS mất kết nối Reborn

- POS vẫn bán hàng bình thường (queue local)
- Hiển thị: "Chế độ offline — điểm sẽ cộng sau khi kết nối lại"
- Khi POS reconnect → auto sync queue
- Cashier không cần làm gì thêm

### 4.5. KH dùng điểm nhưng số dư không đủ

- POS hiển thị: "Bạn chỉ có 800 điểm. Vui lòng giảm số điểm hoặc dùng phương thức khác."
- Cashier hỏi KH muốn dùng bao nhiêu

### 4.6. Voucher invalid (đã dùng / hết hạn)

- POS hiển thị lý do: "Voucher VC-XXX đã được sử dụng vào 09/05" hoặc "Voucher đã hết hạn 05/05"
- Cashier báo KH

## 5. Store Manager — Các thao tác đặc biệt

### 5.1. Adjust điểm thủ công cho KH

Trường hợp KH khiếu nại đúng, cần goodwill:

1. Mở admin Reborn (nếu store có máy tính)
2. **Menu › Hội viên › [Profile KH] › [Adjust điểm]**
3. +N điểm, chọn lý do
4. Cap 1.000 điểm/adjust, audit log

⚠️ Cashier KHÔNG được adjust thủ công. Chỉ Store Manager + CSKH Sup.

### 5.2. Tạo ticket khi KH khiếu nại

1. Mở admin Reborn → **CSKH › Tạo ticket**
2. Link với member (nếu có) + nhập nội dung
3. Assign hoặc để queue tự assign
4. Save → CSKH agent xử lý sau

### 5.3. Xem dashboard store

**Menu › Báo cáo › Per store** filter store hiện tại:
- Daily active members
- Daily points earned
- Top KH thường xuyên
- Tickets open trong store

## 6. Cashier — Code of conduct

🔴 **CẤM:**
- Tích điểm vào thẻ riêng / người thân (insider fraud)
- Bỏ qua scan thẻ KH (dù KH đồng ý) — sai quy trình
- Tiết lộ thông tin KH (PII) cho người khác
- Adjust điểm thủ công (không có quyền)

✅ **KHUYẾN KHÍCH:**
- Mời KH đăng ký thẻ TV (KPI cho Cashier)
- Chúc mừng KH khi tier up
- Báo Store Manager khi gặp khiếu nại / vấn đề
- Đề xuất KH dùng app để xem balance + đổi quà

## 7. Tham chiếu

- URD POS integration: [`../02-requirements/part-08-pos-integration.md`](../02-requirements/part-08-pos-integration.md)
- SA API flow auto-earn: [`../03-architecture/part-05-api-integration.md`](../03-architecture/part-05-api-integration.md)
- Fraud prevention: [`../06-analysis/fraud-prevention.md`](../06-analysis/fraud-prevention.md)
