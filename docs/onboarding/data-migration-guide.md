# Hướng dẫn nhập liệu / migrate dữ liệu lần đầu cho khách hàng mới

**Phiên bản:** 1.0 (2026-04-22)
**Đối tượng sử dụng:** nhân viên triển khai của TNTECH, hỗ trợ khách hàng W-House / TNPM / retail / spa / …
**Template Excel:** [templates/data-template.xlsx](./templates/data-template.xlsx)

---

## Nguyên tắc chung

Hệ thống CRM này là **multi-tenant**, dùng **chung BE** cho mọi ngành. Mỗi khách hàng (tenant) khi khởi tạo cần nhập dữ liệu theo **thứ tự phụ thuộc** — bỏ qua bước trước sẽ gặp lỗi khoá ngoại hoặc danh mục rỗng khi nhập bước sau.

**Quy tắc vàng:**
- ✅ **Luôn nhập theo đúng thứ tự 7 phase** dưới đây
- ✅ **Validate từng phase xong mới chuyển sang phase sau**
- ✅ **Backup Excel đã nhập** ở cloud drive trước khi import
- ❌ **KHÔNG** nhập Khách hàng trước khi tạo Nhóm KH (hoặc sẽ bị đổ vào "Không nhóm")
- ❌ **KHÔNG** nhập SP/DV trước khi có Danh mục + Đơn vị tính

---

## 7 Phase — thứ tự bắt buộc

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 0 — TENANT PROVISIONING (TNTECH làm, không cần khách)    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ Phase 1 — CƠ SỞ HẠ TẦNG                                        │
│   1.1 Chi nhánh           1.2 Kho           1.3 Phòng ban       │
│   1.4 Nhân viên + Role                                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ Phase 2 — DANH MỤC CHUNG                                       │
│   2.1 Nhóm KH            2.2 Nguồn KH       2.3 Trường bổ sung  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ Phase 3 — SẢN PHẨM & DỊCH VỤ                                   │
│   3.1 Danh mục SP        3.2 Đơn vị tính   3.3 Sản phẩm         │
│   3.4 Dịch vụ            3.5 Gói thành viên                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ Phase 4 — KHÁCH HÀNG / THÀNH VIÊN                              │
│   4.1 Khách hàng / Thành viên (+ attribute)                    │
│   4.2 Đối tác (KOL / PO)                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ Phase 5 — SỐ DƯ ĐẦU KỲ                                         │
│   5.1 Tồn kho đầu kỳ     5.2 Công nợ đầu kỳ                    │
│   5.3 Số dư quỹ/ngân hàng                                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ Phase 6 — MARKETING & KHUYẾN MÃI (optional)                    │
│   6.1 Coupon             6.2 Combo          6.3 CTKM           │
│   6.4 Sự kiện                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Chi tiết từng phase

### Phase 0 — Tenant provisioning

**Ai làm:** DevOps + Admin TNTECH.
**Không cần khách cung cấp data**, chỉ cần:

- Tên doanh nghiệp, domain sử dụng (ví dụ `<slug>.reborn.vn`)
- Ngành nghề (retail / spa / community-hub / tnpm / banking / …)
- Loại gói dịch vụ + số lượng user tối đa

Output của phase này: tenant đã được tạo, admin-user đầu tiên login được vào domain mới, `Hostname` header hoạt động.

### Phase 1 — Cơ sở hạ tầng

Phase này tạo **khung tổ chức** để mọi thứ sau gắn vào.

#### 1.1 Chi nhánh *(bắt buộc — tối thiểu 1 cái)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `name` | ✅ | Tên chi nhánh (VD: "Chi nhánh Trung tâm") |
| `address` | ✅ | Địa chỉ đầy đủ |
| `phone` |  | SĐT chi nhánh |
| `email` |  | Email liên hệ |
| `isHeadquarter` | ✅ | 1 = trụ sở, 0 = chi nhánh phụ (chỉ 1 HQ) |
| `managerName` |  | Tên người quản lý |

> **Lưu ý:** Phải có **ít nhất 1 chi nhánh là trụ sở** (`isHeadquarter=1`). Các nghiệp vụ báo cáo/phân quyền theo chi nhánh phụ thuộc vào trụ sở.

#### 1.2 Kho *(bắt buộc nếu ngành có bán SP vật lý — retail / spa)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `name` | ✅ | Tên kho |
| `branchName` | ✅ | Chi nhánh chứa kho (đã khai ở 1.1) |
| `address` |  | Địa chỉ kho nếu khác chi nhánh |
| `isDefault` |  | 1 = kho mặc định cho POS xuất bán |

> Ngành **community-hub / tnpm** không bắt buộc — có thể bỏ qua.

#### 1.3 Phòng ban *(bắt buộc — để gán nhân viên)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `name` | ✅ | Tên phòng (VD: "Lễ tân", "Kế toán") |
| `parentName` |  | Phòng cha (nếu có cấu trúc cha-con) |
| `leadership` |  | 1 = phòng quản lý cấp cao (Ban giám đốc) |

#### 1.4 Nhân viên + Role

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `fullName` | ✅ | Họ tên đầy đủ |
| `phone` | ✅ | SĐT — dùng làm username login |
| `email` |  | Email (optional) |
| `role` | ✅ | `admin` / `manager` / `staff` / `cashier` / `accountant` |
| `departmentName` | ✅ | Phòng ban (đã khai ở 1.3) |
| `branchName` | ✅ | Chi nhánh (đã khai ở 1.1) |
| `password` |  | Mật khẩu khởi tạo. Để trống → default `123456` (user đổi sau) |

> **Role matrix:** `admin` thấy toàn bộ tenant; `manager` thấy theo CN; `staff/cashier` chỉ thấy dữ liệu mình; `accountant` thấy báo cáo tài chính.

---

### Phase 2 — Danh mục chung

Danh mục là **bảng lookup** — KH, SP, … sẽ tham chiếu tới. **Phải nhập trước** khi nhập dữ liệu gắn vào.

#### 2.1 Nhóm khách hàng

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `name` | ✅ | Tên nhóm (VD: "VIP", "Mentor7", "Khách vãng lai") |
| `color` |  | Màu hex (VD "#2D6A5A") cho badge |
| `description` |  | Mô tả |

**Ví dụ theo ngành:**
- Community Hub (W-House): `Mentor7`, `Hậu master k01`, `Thấu hiểu nội tâm`, `Khác`
- Retail: `VIP`, `Thân thiết`, `Mới`
- Spa: `Gold`, `Silver`, `Bronze`

#### 2.2 Nguồn khách hàng *(optional nhưng khuyến nghị)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `name` | ✅ | Tên nguồn (VD: "Facebook", "Zalo OA", "Giới thiệu", "Walk-in") |

#### 2.3 Trường bổ sung *(nếu ngành có field đặc thù)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `fieldName` | ✅ | Code (camelCase, VD `mentorCode`, `houseNumber`) |
| `name` | ✅ | Nhãn hiển thị (VD: "Mã số Mentor") |
| `datatype` | ✅ | `text` / `number` / `date` / `select` |
| `required` | ✅ | 1 / 0 |
| `displayOrder` |  | Thứ tự hiển thị trên form |
| `options` |  | Cho type `select` — phân tách bằng \|, VD: `Nam\|Nữ\|Khác` |

**Ngành community-hub W-House:** cần 2 trường `mentorCode` (Mã số Mentor) + `houseNumber` (Số nhà) như đã seed ở task `customer/attribute-seed-mentor`.

---

### Phase 3 — Sản phẩm & Dịch vụ

#### 3.1 Danh mục sản phẩm *(nếu có bán SP)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `name` | ✅ | Tên danh mục (VD: "Đồ uống", "Phụ kiện") |
| `parentName` |  | Danh mục cha (hỗ trợ cấu trúc cây) |

#### 3.2 Đơn vị tính *(nếu có bán SP)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `name` | ✅ | Tên đơn vị (VD: "Cái", "Lọ", "Hộp", "Lần") |
| `shortName` |  | Viết tắt |

#### 3.3 Sản phẩm *(nếu có bán SP)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `sku` | ✅ | Mã SKU — unique |
| `name` | ✅ | Tên SP |
| `categoryName` | ✅ | Danh mục (từ 3.1) |
| `unitName` | ✅ | Đơn vị tính (từ 3.2) |
| `price` | ✅ | Giá bán lẻ |
| `costPrice` |  | Giá vốn (bình quân ban đầu) |
| `barcode` |  | Mã vạch |
| `description` |  | Mô tả |
| `imageUrl` |  | URL ảnh (hoặc để trống, upload sau) |

#### 3.4 Dịch vụ *(nếu ngành có dịch vụ — spa/community-hub)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `name` | ✅ | Tên dịch vụ |
| `category` | ✅ | `fnb` / `spa` / `beauty` / `space` / `wellness` / `utility` |
| `unit` | ✅ | `lần` / `suất` / `buổi` / `kg` / `ngày` |
| `price` | ✅ | Giá bán |
| `discount` |  | Giá ưu đãi |
| `description` |  | Mô tả dịch vụ |

#### 3.5 Gói thành viên *(chỉ cho ngành có membership — community-hub/spa/fitpro)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `name` | ✅ | Tên gói (VD "Standard", "Premium") |
| `price` | ✅ | Giá |
| `durationMonths` | ✅ | Thời hạn (tháng) |
| `description` |  | Mô tả |
| `includedServices` |  | Danh sách dịch vụ bao gồm, phân tách `\|` với format `tên:quota:unit` — VD `Đồ uống:30:lần\|Spa:4:lần` |
| `color` |  | Màu hex cho UI |

---

### Phase 4 — Khách hàng / Thành viên

#### 4.1 Khách hàng *(xương sống nghiệp vụ)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `fullName` | ✅ | Họ tên |
| `phone` | ✅ | SĐT — **unique key**, dùng để dedup khi import |
| `email` |  | Email |
| `dob` |  | Ngày sinh (YYYY-MM-DD) |
| `gender` |  | `male` / `female` / `other` |
| `address` |  | Địa chỉ |
| `groupName` | ✅ | Nhóm (từ 2.1) |
| `sourceName` |  | Nguồn (từ 2.2) |
| `status` | ✅ | `lead` / `active` / `vip` / `churned` |
| `assignedEmployeePhone` |  | SĐT nhân viên phụ trách (từ 1.4) |
| `<customField1>` |  | Giá trị cho trường bổ sung (từ 2.3). VD: cột `mentorCode`, `houseNumber` |
| `<customField2>` |  | Nhiều cột tuỳ số trường bổ sung |
| `note` |  | Ghi chú |

> Dedup: nếu 2 dòng cùng `phone`, hệ thống **merge** — giữ row đầu, cộng dồn thông tin không conflict.

#### 4.2 Đối tác (KOL/PO) *(optional)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `fullName` | ✅ | Họ tên |
| `phone` | ✅ | SĐT |
| `role` | ✅ | `KOL` / `KOC` / `PO` |
| `commissionPct` |  | % hoa hồng default |
| `description` |  | Mô tả |

---

### Phase 5 — Số dư đầu kỳ

**Bắt buộc nếu khách đã vận hành trước khi chuyển sang CRM** — để sổ sách chuẩn từ ngày cut-off.

#### 5.1 Tồn kho đầu kỳ *(nếu có kho)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `warehouseName` | ✅ | Kho (từ 1.2) |
| `productSku` | ✅ | SKU (từ 3.3) |
| `quantity` | ✅ | Số lượng tồn |
| `costPrice` | ✅ | Giá vốn/đơn vị |
| `batchCode` |  | Mã lô (nếu có) |
| `expiryDate` |  | Hạn sử dụng |

#### 5.2 Công nợ đầu kỳ *(bắt buộc nếu có công nợ)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `customerPhone` | ✅ | SĐT KH (từ 4.1) |
| `kind` | ✅ | `receivable` (phải thu) / `payable` (phải trả) |
| `amount` | ✅ | Số tiền |
| `dueDate` | ✅ | Ngày đáo hạn |
| `note` |  | Lý do (VD: "Còn nợ hoá đơn #HD123") |

#### 5.3 Số dư quỹ / ngân hàng

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `fundName` | ✅ | Tên quỹ (VD: "Tiền mặt quầy", "TK Vietcombank") |
| `type` | ✅ | `cash` / `bank` / `ewallet` |
| `balance` | ✅ | Số dư đầu kỳ |
| `bankName` |  | Tên ngân hàng nếu `type=bank` |
| `accountNumber` |  | Số tài khoản |

---

### Phase 6 — Marketing & Khuyến mãi *(optional, làm sau cũng được)*

#### 6.1 Coupon / Mã giảm giá

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `code` | ✅ | Mã coupon |
| `discountType` | ✅ | `percent` / `amount` / `freeship` |
| `discountValue` | ✅ | 10 (% hoặc số tiền) |
| `minOrder` |  | Đơn tối thiểu |
| `maxUses` |  | Số lần dùng tối đa |
| `expiryDate` | ✅ | Hạn sử dụng |

#### 6.2 Combo

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `name` | ✅ | Tên combo |
| `productSkus` | ✅ | Các SKU kèm theo, phân tách `\|` |
| `origPrice` | ✅ | Tổng giá gốc |
| `salePrice` | ✅ | Giá combo |

#### 6.3 CTKM

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `name` | ✅ | Tên chương trình |
| `type` | ✅ | `percent` / `amount` / `fixedPrice` |
| `startDate` | ✅ | |
| `endDate` | ✅ | |
| `conditions` |  | Mô tả điều kiện (free text) |

#### 6.4 Sự kiện *(community-hub)*

| Cột | Bắt buộc | Mô tả |
|---|:---:|---|
| `slug` | ✅ | URL slug (unique) |
| `title` | ✅ | Tên sự kiện |
| `startDate` | ✅ | |
| `endDate` | ✅ | |
| `venueName` |  | |
| `venueAddress` |  | |
| `venueLatitude` |  | Toạ độ (để embed Google Maps) |
| `venueLongitude` |  | |
| `ticketPrice` |  | 0 = miễn phí |
| `maxAttendees` |  | |
| `addOns` |  | Add-on nhiều dòng `name:price:unit:group`, phân tách `\|\|` |

---

## Checklist bàn giao cho khách hàng

Trước khi nhân viên hỗ trợ nhập liệu, khách cần chuẩn bị:

- [ ] **Phase 1** — Danh sách chi nhánh, kho, phòng ban, nhân viên (ai làm gì, role)
- [ ] **Phase 2** — Chốt tên nhóm KH / nguồn KH / trường bổ sung đặc thù
- [ ] **Phase 3** — Catalog SP & DV export từ hệ thống cũ (nếu có) + gói thành viên
- [ ] **Phase 4** — File Excel danh sách KH (từ OneS / Excel cá nhân / Google Form)
- [ ] **Phase 5** — Báo cáo tồn kho cuối ngày + sổ công nợ tại thời điểm cut-off
- [ ] **Phase 6** — Danh sách coupon / combo / event đang chạy (nếu migrate)

**Tips cho khách:**
- File Excel để **format chuẩn UTF-8** tránh vỡ tiếng Việt
- SĐT giữ dạng text, không để Excel auto-format thành số (mất số 0 đầu)
- Ngày tháng dùng `YYYY-MM-DD` không phải `DD/MM/YYYY`

---

## Thời gian ước lượng

| Phase | Thời gian (cho 1 cơ sở cỡ vừa) |
|---|---|
| Phase 0 — Provisioning | 1–2 giờ (TNTECH) |
| Phase 1 — Hạ tầng | 2–4 giờ |
| Phase 2 — Danh mục | 1–2 giờ |
| Phase 3 — SP/DV/Gói | 4–8 giờ (tùy số lượng SP) |
| Phase 4 — KH (≤ 1000) | 2–4 giờ |
| Phase 4 — KH (1000–10000) | 1–2 ngày |
| Phase 5 — Số dư đầu kỳ | 4–8 giờ |
| Phase 6 — Marketing | 2–4 giờ (nếu có) |

**Tổng ~3–5 ngày công** cho cơ sở cỡ vừa (1 CN, < 1000 KH, < 500 SP).

---

## Hỗ trợ

- Template Excel: [templates/data-template.xlsx](./templates/data-template.xlsx)
- Hỏi đáp migrate: zalo TNTECH Support
- BE task / FE bug report: [docs/backend-tasks/](../backend-tasks/) (nội bộ TNTECH)
