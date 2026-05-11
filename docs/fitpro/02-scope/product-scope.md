# 02.1 — Phạm vi sản phẩm

> FitPro làm CÁI GÌ và KHÔNG làm cái gì?

---

## 2.1. 4 Trụ cột Sức khỏe Toàn diện

FitPro bứt phá khỏi mô hình "nhóm dinh dưỡng" truyền thống bằng giải pháp **4 trụ cột giao thoa hoàn hảo**:

| Trụ cột | Nội dung | Đối tác chính |
|---|---|---|
| **1. Vận động** | Bài tập kháng lực Y học 3.0, chỉ cần 2m² thảm tập | FitPro Coach |
| **2. Dinh dưỡng** | Cá nhân hóa, bổ sung tự nhiên theo cường độ vận động | Herbalife |
| **3. Ngủ nghỉ** | Nghệ thuật thư giãn sâu và phục hồi | (đào tạo nội bộ) |
| **4. Tâm thái tinh thần** | Năng lực Định-Buông, làm chủ nội tâm (Thiền/Zen) | Mr. Thắng & Mr. Linh — cố vấn văn hóa |

> Thiếu một trụ cột, cấu trúc không thể tồn tại bền vững.

---

## 2.2. 3 Không gian điểm chạm vật lý

| Mã | Tên | Quy mô | Đặc điểm |
|---|---|---|---|
| **C007** | **FitPro Center** | ~100–200m², 21 nhân sự (7 Co-Founder + 14 Coach) | Hub lõi chuyên nghiệp · lò đào tạo · chuẩn franchise |
| **I007** | **FitPro Inside** | Đặt trong văn phòng doanh nghiệp | Phục vụ nội bộ nhân sự DN — kênh B2B |
| **H007** | **FitPro Home** | 2m² thảm tập trong nhà gia đình | Hạt nhân lan tỏa · không kinh doanh thương mại |

**Vận hành tinh gọn 6h–9h sáng** (không phải cả ngày như co-working) — "3 giờ vàng" chính xác cho người đi làm.

### Quy mô vision 2027

```
        ┌─────────── 500 Hub lõi ───────────┐
        │   ~400 Center (C007)              │
        │   ~100 Inside (I007)              │
        └──────────────┬────────────────────┘
                       │ Mỗi Hub × 20 Home vệ tinh
                       ▼
        ┌──────── 10.000 FitPro Home ───────┐
        │   2m² × gia đình hạt nhân          │
        └────────────────────────────────────┘
```

→ Quy mô vĩ mô: **500 Center/Inside × 20 Home = 10.000 FitPro Home toàn quốc**.

---

## 2.3. Hệ thống Mã định danh trọn đời

| Mã | Khởi thủy | Ý nghĩa | Bất biến? |
|---|---|---|:---:|
| **Mã A** | A007 | Mã cá nhân (giữ trọn đời, không đổi khi thăng cấp) | ✅ |
| **Mã N** | N007 | Mã "Nhà" — tự khởi tạo khi 1 Elite bảo trợ dọc đủ 7 Elite (F1–F7) | ✅ |
| **Mã H** | H007 | Mã FitPro Home | ✅ |
| **Mã I** | I007 | Mã FitPro Inside | ✅ |
| **Mã C** | C007 | Mã FitPro Center | ✅ |

→ Tất cả là **định danh số trọn đời**, dùng làm khóa join trong Big Data lifecycle.

---

## 2.4. Phạm vi NẰM TRONG (In-Scope)

1. **Siêu ứng dụng FitPro** (đa tenant) — quản trị Member / Coach / Elite / Co-Founder, cây giới thiệu, Streak, Bảng vàng.
2. **Quản trị 3 loại không gian** Home / Inside / Center theo SOP đồng nhất.
3. **5 cấp độ chuyển hóa khách hàng** — xem [03-5-cap-do-khach-hang.md](customer-journey.md) *(file: customer-journey.md)*.
4. **Pricing 5 tier** (BASIC 80k → SUPER VIP 500k) — xem [03-architecture/business-model.md](../03-architecture/business-model.md).
5. **Cơ chế gửi khách vạn dặm** — Coach giữ 100% doanh thu gói VIP, trích 80k/buổi cho Coach trực tại Center sở tại.
6. **Big Data Lifecycle** — Đo chỉ số Before → Lột xác → Tracking → Nhân bản tự động.
7. **Gamification** — Streak (kiểu Duolingo), Bảng vàng Danh vọng tự động.
8. **SaaS billing FitPro Platform** — duy nhất 2 dòng thu: phí nhượng quyền one-time + phí SaaS recurring.

---

## 2.5. Phạm vi NẰM NGOÀI (Out-of-Scope)

| # | Hạng mục | Lý do |
|---:|---|---|
| 1 | **Quản lý dòng tiền Herbalife** (commission 37%) | Pháp lý đa cấp — App TUYỆT ĐỐI không can thiệp |
| 2 | **Federation với hệ thống Sopline khác** | Giai đoạn đầu đóng, whitelist tenant |
| 3 | **Tài sản vật lý** (camera, biển hiệu, thiết bị) | FitPro lo cơ sở vật chất; Reborn chỉ làm phần mềm |
| 4 | **Phần mềm thay thế hệ thống Herbalife** | Reborn không thay HBL; chỉ là "bể chứa" nuôi dưỡng KH |
| 5 | **Quản lý kho dinh dưỡng** (Herbalife) | Hãng tự quản kho, chủ trạm chỉ view dashboard |
| 6 | **Trả lương cứng** cho Coach/Leader | Ăn % theo khách → giảm áp lực skill out, tăng động lực |
