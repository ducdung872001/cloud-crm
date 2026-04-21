# Phân tích 3 tài liệu yêu cầu từ khách hàng W-House

**Ngày nhận:** 2026-04-21
**Nguồn:** [docs/requirements/](./)
**Khách hàng:** W-House (nhánh `community-hub`)
**Bối cảnh:** W-House đang dùng Google Form + Excel + ảnh chụp QR để quản lý sự kiện SQUAT Mentor. Cần port sang hệ thống CRM.

---

## Ba tài liệu gốc

| File | Nội dung | Mục đích gốc |
|---|---|---|
| [`event.jpg`](./event.jpg) | QR chuyển khoản + 2 map + ảnh cổng Vườn Thực Vật HN | Gửi người đăng ký: hướng dẫn chuyển tiền + địa điểm |
| [`other.jpg`](./other.jpg) | Header Excel "SQUAT NGÀY 10/05/2026" với multi-column nested | Admin tổng hợp: ai đăng ký gì, phí bao nhiêu, đã chuyển tiền chưa |
| [`Đăng Ký tham gia mở khớp offline tại Wit-House.xlsx`](./Đăng%20Ký%20tham%20gia%20mở%20khớp%20offline%20tại%20Wit-House%20(Câu%20trả%20lời).xlsx) | Google Form responses (32+ dòng, 13 cột) | Input: raw data từ form đăng ký |

---

## Bản đồ tổng: 3 tài liệu → 3 giai đoạn nghiệp vụ

```
                    ┌─────────────────────────────────────────┐
                    │ [1] TRƯỚC EVENT — Publish + Register   │
                    │                                         │
  event.jpg ──────▶ │  Event Detail public page              │
                    │    ├─ Cover image + gallery            │
                    │    ├─ Google Maps embed (lat/lng)      │
                    │    ├─ QR VietQR dynamic (amount=total) │
                    │    └─ Form đăng ký + add-ons           │
                    └─────────────────┬───────────────────────┘
                                      │ submit
                                      ▼
                    ┌─────────────────────────────────────────┐
  Excel form ─────▶ │ [2] TRONG EVENT — Collect + Store      │
                    │                                         │
                    │  customer/customer       ← entity       │
                    │    + customer/customerGroup (Mentor7)   │
                    │    + customer/customerAttribute (mã, nhà)│
                    │                                         │
                    │  market/event_registration ← hành vi    │
                    │    ├─ selectedAddOns[]                  │
                    │    ├─ paymentProofs[]                   │
                    │    └─ formResponses{}                   │
                    └─────────────────┬───────────────────────┘
                                      │ aggregate
                                      ▼
                    ┌─────────────────────────────────────────┐
  other.jpg ──────▶ │ [3] SAU ĐĂNG KÝ — Tổng hợp + Operate   │
                    │                                         │
                    │  Event Detail → Tab "Danh sách đăng ký" │
                    │    ├─ Multi-column header              │
                    │    ├─ Filter theo group/ngày/status    │
                    │    ├─ Export Excel đúng mẫu other.jpg  │
                    │    └─ Check-in + điểm danh add-ons     │
                    └─────────────────────────────────────────┘
```

---

## Tài liệu 1 — `event.jpg`: Thêm vào Event Detail page

### Các thành phần trong ảnh

| Góc ảnh | Nội dung | Chức năng tương ứng |
|---|---|---|
| Trái trên | QR + tên tk "Nguyễn Trọng Thế Anh" + SĐT 8866999311 | QR VietQR dynamic theo event + amount |
| Trái dưới | Ảnh cổng "Vườn Thực Vật Hà Nội" | Gallery ảnh địa điểm |
| Phải trên | Google Maps chỉ đường zoom gần | Embed Google Maps |
| Phải dưới | Google Maps zoom xa | Cùng embed Google Maps (user tự zoom) |
| Toàn ảnh | "ĐỊA ĐIỂM TỔ CHỨC SQUAT MENTOR 7" | Subtitle/section header |

### Gap phân tích (so với Event model hiện có)

FE types [`src/pages/CommunityHub/Events/types.ts`](../../src/pages/CommunityHub/Events/types.ts) đã có:
- ✅ `EventVenue.address`, `name`, `mapUrl` (share link)
- ✅ `EventEntity.galleryImageUrls`
- ✅ `EventEntity.requirePaymentProof`

**Thiếu:**
- ❌ `EventVenue.latitude` + `longitude` — để **embed Google Maps iframe** (không chỉ share link)
- ❌ `EventVenue.venueImages` — ảnh địa điểm riêng, tách khỏi `galleryImageUrls` (gallery là ảnh hoạt động/kỷ niệm)
- ❌ `EventEntity.bankAccountOverride` — override tài khoản nhận tiền, default từ tenant config
- ❌ Tenant config `bankAccount: { holder, phone, bank, accountNumber }` chung

### QR thanh toán: KHÔNG tạo endpoint riêng

Reuse sẵn `GET /billing/vietqr/api/generate_qr` đã có. Tham số:
- `amount` = `registration.totalAmount` (vé + add-ons)
- `addInfo` = `ticketCode` hoặc `EVENT-{eventId}-REG-{registrationId}` (để BE tự match khi bank webhook trả về)
- `accountNumber`, `accountName` = từ `event.bankAccountOverride ?? tenant.bankAccount`

### Google Maps embed — FE implementation

```tsx
// EventDetailPage.tsx — section mới
{venue.latitude && venue.longitude && (
  <iframe
    src={`https://www.google.com/maps/embed/v1/place?key=${GMAPS_KEY}&q=${venue.latitude},${venue.longitude}&zoom=15`}
    width="100%" height="320" style={{ border: 0, borderRadius: 8 }}
    loading="lazy" referrerPolicy="no-referrer-when-downgrade"
  />
)}
<a href={`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`}
   target="_blank" rel="noopener">
  📍 Chỉ đường tới đây
</a>
```

Cần env var `GMAPS_KEY` — báo DevOps provision Google Maps JavaScript API key.

---

## Tài liệu 2 — Excel Google Form: Field mapping

### Phân tích 13 cột

| # | Cột Excel | Nature | Lưu ở đâu (microservice + entity) | Field name |
|---|---|---|---|---|
| 1 | Dấu thời gian | System | market.event_registration | `createdAt` (BE tự set) |
| 2 | Họ Và Tên | Identity | customer.customer | `name` |
| 3 | Số Điện Thoại | Identity (unique key) | customer.customer | `phone` — **dùng để dedup + match member hiện có** |
| 4 | Bạn Thuộc nhóm nào? (Mentor7 / Khác / Hậu master k01 / Thấu hiểu nội tâm) | Segment | customer.customerGroup | `customerGroupId` (seed groups trước) |
| 5 | Mã số Mentor | Custom attribute | customer.customerAttribute | attribute code `mentorCode` (string) |
| 6 | Số nhà | Custom attribute | customer.customerAttribute | attribute code `houseNumber` (string) |
| 7 | Đăng ký tham gia ngày (07/04, 08/04, Cả 2) | Event-specific | market.event_registration | `selectedDates: string[]` |
| 8 | Mong muốn "Xoay hông giữ trục 5H" (Có / Đã hoàn thành / Online / Offline) | Dynamic field | market.event_registration | `dynamicFieldValues["desire_5h"]` |
| 9 | Bạn cần hỗ trợ? (Ăn 07/04, Ăn 08/04, multi-select) | Add-on items (multi) | market.event_registration | `selectedAddOns[{addOnId,qty}]` |
| 10 | Chi phí cụ thể (100k / 199k / Chỉ tập luyện) | **Derived — không lưu**, compute từ add-ons | — | computed `totalAmount` |
| 11–13 | Ảnh bill 1-4 | Payment proof (multi) | market.event_registration | `paymentProofs: PaymentProof[]` |

### Câu hỏi lớn: lưu `lead` hay `customer`?

**Kết luận: `customer` là chính, `market.lead` không dùng.**

Lý do:
- `market.lead` dành cho cold lead từ ads / landing page khi **chưa có cách contact xác thực** (thường chỉ có email hoặc UTM, chưa có phone)
- Ở đây form Google yêu cầu **SĐT bắt buộc** → đã có contact xác thực → pipeline đi thẳng vào `customer` với status "lead"
- Khi customer attend event → có thể upgrade `customerStatus` = "member"

### Pipeline đăng ký — backend logic

```
1. POST /market/events/{slug}/register
   Body: { fullName, phone, customerGroupKey, mentorCode, houseNumber,
           selectedDates, selectedAddOns, dynamicFieldValues, paymentProofs }

2. BE:
   a. Tìm customer theo phone (tenant scoped)
      - Nếu có → dùng customerId hiện tại, UPDATE tên/group/attribute nếu trống
      - Nếu không → tạo customer mới với status="lead"
   b. Tạo event_registration với customerId
   c. Compute totalAmount từ ticket_price + sum(add-on.unitPrice * qty)
   d. Sinh ticketCode nếu status="confirmed"
   e. Return { registration, qrPayload }  // qrPayload để FE render QR ngay
```

### Định dạng Excel không cần giữ nguyên

Form Google Sheets chỉ là **nguồn data thô**. Hệ thống cần:
1. **Standardized form builder** cho admin khi tạo event: thêm dynamic fields động
2. **Import wizard** khi có Excel cũ: column mapping UI (admin map "Họ Và Tên" → customer.name, v.v.)
3. **Public register page** `/public/events/:slug/register` thay thế Google Form

---

## Tài liệu 3 — `other.jpg`: Tab "Danh sách đăng ký" với multi-column

### Phân tích header Excel

```
[Single cols]                          [Group: Cư trú W-House 09/05]                         [Group: Phí tham gia 10/05]                  [Single cols]
┌─────┬──────────┬────────┬─────────┬────────┬─────────┬────────┬────────────────┬────────────────┬────────────────────┬────────┬──────────┐
│ Stt │ Họ tên   │ Mã     │ Số nhà  │ Ăn     │ Ăn tối │ Cư trú │ Xe di chuyển  │ Phí tham gia   │ Ăn full 7h-2h     │ Tổng   │ Ảnh CK   │
│     │          │        │         │ trưa    │         │        │ (→ VTV HN)     │                │                    │ tiền   │          │
│     │          │        │         │ 50k     │ 50k     │ 100k   │ 100k           │ 300k           │ 100k              │        │          │
└─────┴──────────┴────────┴─────────┴────────┴─────────┴────────┴────────────────┴────────────────┴────────────────────┴────────┴──────────┘
```

**Điểm chú ý:**
- Header 2 dòng: dòng 1 là group, dòng 2 là từng add-on + giá
- Các ô add-on dưới body là **checkbox / số lượng** (đánh dấu khách chọn)
- Cột tổng tiền compute từ add-ons đã chọn × giá
- Cột ảnh CK là thumbnail, click phóng to

### Feature tương ứng trong hệ thống

**Tab "Danh sách đăng ký" trong Event Detail** phải có:

| Feature | Chi tiết |
|---|---|
| Multi-level header | Dòng 1: label group (từ `EventAddOnGroup.name`); dòng 2: từng add-on |
| Cột động theo add-ons event | FE render columns động từ `event.addOnItems[]` group by `group` |
| Cell add-on | Hiện `qty × unitPrice` nếu khách chọn, trống nếu không; hover show giá gốc |
| Cột tổng tiền | Sum `registration.totalAmount` |
| Cột ảnh CK | Thumbnail stack nếu có nhiều bill, click xem full-screen |
| Filter | Group (Mentor7/Khác), selectedDates, paymentStatus |
| Export Excel | Xuất bảng đang xem — đúng định dạng multi-header như `other.jpg` |
| Check-in inline | Bấm vào 1 dòng → mark checked-in + chọn ngày (multi-day) |
| Điểm danh add-on | Ở cell add-on, sau check-in thì có thể tick "đã phục vụ" để kế toán đối chiếu |

### Gap vs state hiện tại

Hiện có `src/pages/CommunityHub/Events/components/CheckinServiceTracker.tsx` (service tracker). Thiếu:
- ❌ Multi-level header table
- ❌ Add-on grouping (cần `EventAddOnItem.group?: string` để group)
- ❌ Export Excel theo template multi-header
- ❌ Filter theo customerGroup + paymentStatus combined

---

## Tổng hợp gap để triển khai

| # | Gap | Nơi | Task doc |
|---|---|---|---|
| 1 | `venue.latitude/longitude + venueImages` trong Event | market microservice | [market/events.md](../backend-tasks/market/events.md) (cập nhật) |
| 2 | Tenant config `bankAccount + override per event` | `operation` hoặc `tenantConfig` | market/events.md |
| 3 | `EventAddOnItem.group` field + multi `paymentProofs` | market microservice | market/events.md |
| 4 | Seed 2 customerAttribute `mentorCode` + `houseNumber` cho W-House | customer microservice | [customer/attribute-seed-mentor.md](../backend-tasks/customer/attribute-seed-mentor.md) (tạo mới) |
| 5 | Pipeline register → auto-create customer với status="lead" | market + customer | market/events.md |
| 6 | Multi-level header table + Export template cho Registrations tab | FE | Phần UI spec dưới đây |

---

## UI Design Spec — Event Detail → Tab "Danh sách đăng ký"

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Event Detail: "SQUAT MENTOR 7 — Vườn Thực Vật HN"                               │
│                                                                                  │
│  [Tổng quan] [Danh sách đăng ký 32] [Check-in] [Thu chi] [Chỉnh sửa]            │
│  ─────────────────────────────────── ACTIVE ─────────                            │
│                                                                                  │
│  🔍 Tìm tên / SĐT / mã      [Group ▾] [Ngày ▾] [Thanh toán ▾]      [Export ▾]  │
│                                                                                  │
│  ┌───────┬──────────┬──────┬──────┬──────────────┬────────────────┬──────┬─────┐ │
│  │       │          │      │      │ Cư trú 09/05 │ Phí tham gia   │      │     │ │
│  │ Stt   │ Họ tên   │ Mã   │ Nhà  │ ĂT  ĂTối ... │ Phí  Ăn full   │ Tổng │ CK  │ │
│  │       │          │      │      │ 50k  50k ... │ 300k  100k     │      │     │ │
│  ├───────┼──────────┼──────┼──────┼──────────────┼────────────────┼──────┼─────┤ │
│  │ 1     │ Nguyễn V.│ 5021 │ 255  │ ✓   ✓   ...  │ ✓    ✓         │ 600k │ 📎1 │ │
│  │ 2     │ Phạm K.D │  —   │  —   │             ...             │    │ 300k │     │ │
│  │ ...                                                                            │ │
│  └───────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Component structure

```
EventDetailPage (route: /ch_events/:slug)
 └─ Tabs
     └─ RegistrationListTab          ← MỚI
         ├─ RegistrationToolbar (search + filters + export dropdown)
         ├─ RegistrationTable         ← dùng TanStack Table với `columns` động
         │   ├─ renderGroupedHeader(event.addOnGroups)
         │   ├─ renderCellAddOn(registration, addOnId)
         │   ├─ renderCellTotal(registration)
         │   └─ renderCellProofThumbnails(registration.paymentProofs)
         └─ PaymentProofLightbox (modal xem ảnh CK)
```

### Column config — derive từ event

```ts
function buildColumns(event: EventEntity): ColumnDef<EventRegistration>[] {
  const fixedLeft: ColumnDef[] = [
    { id: "stt",       header: "STT",     cell: (_, i) => i + 1 },
    { id: "fullName",  header: "Họ tên",  accessor: "fullName" },
    { id: "mentorCode",header: "Mã",      cell: r => r.customerAttributes?.mentorCode ?? "—" },
    { id: "houseNum",  header: "Nhà",     cell: r => r.customerAttributes?.houseNumber ?? "—" },
  ];

  // Group add-ons theo EventAddOnItem.group (string, undefined = "Khác")
  const addOnsByGroup = groupBy(event.addOnItems ?? [], a => a.group ?? "Khác");
  const addOnCols: ColumnDef[] = Object.entries(addOnsByGroup).flatMap(([groupName, items]) => [
    {
      id: `group-${groupName}`,
      header: groupName,
      columns: items.map(addOn => ({
        id: `addon-${addOn.id}`,
        header: `${addOn.name} ${formatVND(addOn.unitPrice)}`,
        cell: r => renderAddOnCell(r, addOn),
      })),
    },
  ]);

  const fixedRight: ColumnDef[] = [
    { id: "total",  header: "Tổng tiền", cell: r => formatVND(r.totalAmount) },
    { id: "proofs", header: "Ảnh CK",    cell: r => <ProofThumbs proofs={r.paymentProofs} /> },
  ];

  return [...fixedLeft, ...addOnCols, ...fixedRight];
}
```

### Export Excel

Dùng `exceljs` (đã có trong dependencies) để tạo workbook với:
- Row 1 = group headers (merge cell cho cột group)
- Row 2 = detail headers (add-on name + price)
- Row 3+ = data
- Conditional formatting cho cột Tổng (màu xanh nếu đã có CK, vàng nếu thiếu)
- Hyperlink cột Ảnh CK → URL trực tiếp

Template export match với `other.jpg` giúp admin gửi file cho team catering mà không phải format lại.

### Filter logic

```ts
const filtered = registrations
  .filter(r => !groupFilter    || r.customer?.customerGroup === groupFilter)
  .filter(r => !dateFilter     || r.selectedDates?.includes(dateFilter))
  .filter(r => !paymentFilter  || r.paymentProof?.status === paymentFilter)
  .filter(r => !search         || matchesSearch(r, search));
```

### Responsive

- Desktop (>1200px): full multi-header table
- Tablet (768–1200px): horizontal scroll giữ sticky cột "Họ tên"
- Mobile: chuyển sang card view (1 registration / card) với add-ons chip

---

## Thứ tự triển khai

1. ✅ **Phân tích** — file này (done)
2. ⏳ **Cập nhật BE task `market/events.md`** — thêm venue lat/lng, images, bankAccount, addOnGroup, multi-proof
3. ⏳ **Tạo BE task `customer/attribute-seed-mentor.md`** — seed mentorCode + houseNumber attribute
4. ⏳ **FE task riêng** — implement Registration tab với multi-column + export (có thể làm sau khi BE ra schema)
