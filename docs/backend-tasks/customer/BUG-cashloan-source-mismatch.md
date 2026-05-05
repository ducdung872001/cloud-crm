# BE BUG — `customer/list_paid` trả lệch khi lọc Cashloan "Forsign" + sourceId

> Ngày phát hiện: 2026-05-05
> Phát hiện trong quá trình test FE bug "Lọc Trạng thái khoản vay Cashloan bị mất lọc Nguồn khách hàng"
> (doc gốc: `1MiW5NeOqMk4FVTpexRqL5i96g7IL1xDyDKAdFW2cC3Y`).
> FE đã có fix `db13630e` (normalize `sourceId` → `sourceIds`), tester confirm pass case
> mà họ test. Doc này ghi case **còn lại** mà FE không cứu được — cần BE kiểm tra.

## Tóm tắt

Endpoint `/adminapi/customer/list_paid` trả về items không thoả CẢ HAI điều kiện
filter khi combine `Trạng thái khoản vay Cashloan = "Chờ KH ký hợp đồng (Forsign)"`
với `sourceId = 2495`. Đổi format `sourceId` (singular) ↔ `sourceIds` (plural JSON
array) ↔ cả hai đều cho kết quả lệch giống hệt → **không phải bug parser query
string, mà là bug logic query / join trong BE**.

## Môi trường

- Domain: `tnex.reborn.vn` (Hostname header tới BE)
- BE host thực tế: `https://cloud.reborn.vn`
- Endpoint: `GET /adminapi/customer/list_paid`
- Auth: Bearer JWT (cookie `token`)
- Tài khoản test: `0906942486` / role mặc định "Ban giám đốc"

## Cách repro (curl-style)

Login lấy `<TOKEN>` từ cookie `token` sau khi đăng nhập web.

```bash
curl -G "https://cloud.reborn.vn/adminapi/customer/list_paid" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Hostname: tnex.reborn.vn" \
  -H "Accept: application/json" \
  --data-urlencode "contactType=-1" \
  --data-urlencode "queryFromTnex=1" \
  --data-urlencode "branchId=260" \
  --data-urlencode "limit=100" \
  --data-urlencode "page=1" \
  --data-urlencode "sourceId=2495" \
  --data-urlencode 'customerExtraInfo=[{"fieldName":"Trangthaikhoanvaycashloan","attributeValue":"Chờ KH ký hợp đồng (Forsign)","datatype":"list_string","operator":"in"}]' \
  --data-urlencode "Trangthaikhoanvaycashloan=Chờ KH ký hợp đồng (Forsign)"
```

**Kỳ vọng**: tất cả `result.items[*].sourceId === 2495` AND
`result.items[*].lstCustomerExtraInfo` có entry `fieldName=Trangthaikhoanvaycashloan`
với `attributeValue="Chờ KH ký hợp đồng (Forsign)"`.

**Thực tế** (đo 2026-05-05 13:00 UTC+7): `total=103`, sample 100 items, **4 items
lệch**. Các items lệch có:
- `sourceId = 2491` (TnexTeleSale) — không phải 2495 (TnexProcess hay tên gì tương ứng)
- `lstCustomerExtraInfo` cashloan **rỗng** (`[]`) — không có status nào, càng không phải Forsign

| id | name | sourceId | sourceName | cashloan extraInfo |
|---:|------|---:|------|------|
| 5029658 | Trầm Thị Kiều My | 2491 | TnexTeleSale | `[]` |
| 5027930 | Võ Thị Yến | 2491 | TnexTeleSale | `[]` |
| 5033668 | Trần Thiên Vũ | 2491 | TnexTeleSale | `[]` |
| 5020704 | Nguyễn Ngọc Thanh Ngân | 2491 | TnexTeleSale | `[]` |

→ BE đang trả ra items không khớp **cả 2 điều kiện**.

## Chứng cứ thêm

### 1. Đổi format request không thay đổi kết quả

Cùng 4 items lệch xuất hiện ở cả 3 biến thể:

```
sourceId=2495         + customerExtraInfo=[Forsign]   → wrong=4/100
sourceIds=[2495]      + customerExtraInfo=[Forsign]   → wrong=4/100
sourceId=2495 & sourceIds=[2495] + customerExtraInfo=[Forsign]   → wrong=4/100
```

Loại trừ giả thuyết bug parsing param.

### 2. Bug đã có sẵn ở filter sourceId riêng cho source 2495

Chỉ lọc `sourceId=2495` (không có cashloan), `total=34518`, sample=200 items, cũng có
**2 items lệch sourceId** (sourceId trả về ≠ 2495). → Bug có sẵn ở pipeline filter
sourceId cho source 2495, không phải do combine với cashloan. Nhưng khi combine với
Forsign thì số lệch tăng từ 2 → 4 (Forsign khuếch đại).

### 3. Các status khác PASS

Probe 8 cashloan status × top sourceId tương ứng — chỉ "Forsign" + 2495 fail:

| Cashloan status | top sourceId | wrong |
|---|---:|---:|
| Đã giải ngân (CLOSED) | 2491 | 0/100 |
| Khoản vay bị từ chối (REJECTED) | 2490 | 0/100 |
| Đã khởi tạo đơn vay (AUTHENTICATE) | 2490 | 0/30 |
| Chờ thẩm định phê duyệt (APPRAISAL/APPROVAL) | 2490 | 0/15 |
| Khoản vay bị từ chối, cho đăng ký lại (TEMP_REJECT) | 2491 | 0/100 |
| Chờ giải ngân (For_Disbursement) | 2081 | 0/22 |
| **Chờ KH ký hợp đồng (Forsign)** | **2495** | **4/100** ❌ |
| Quá hạn ký hợp đồng (Expired) | 2491 | 0/100 |

### 4. Biến thể attributeValue

Test với `attributeValue` thay đổi case/trim — tất cả variant khác trả `total=0`,
chỉ chuỗi đúng `"Chờ KH ký hợp đồng (Forsign)"` mới trả 103 (kèm 4 lệch). → BE
đang match đúng chuỗi, không phải bug normalize.

## Hướng đề xuất BE check

1. **Xem query SQL/MongoDB sinh ra cho request này**. Nghi vấn lớn nhất: pipeline có
   1 LEFT JOIN/lookup tới `customer_extra_info` mà điều kiện join sai (vd. join trên
   `customer_id` nhưng không filter sub-record theo `fieldName`), khiến row trả về
   bao gồm cả KH không có cashloan.
2. **Kiểm tra source 2495 có gì đặc biệt**: cùng cây phân cấp với 2491 (TnexTeleSale)?
   Là sub-source, alias, hay được merge gần đây? `sourceId=2495` đứng riêng đã có 2
   item lệch sang 2491 → có thể có data source bị sai hoặc query inheritance lỗi.
3. **Verify với data 4 items kia**:
   - id=5029658 (Trầm Thị Kiều My) — KH thật có sourceId nào trong DB? Có thuộc
     cashloan record nào với status khác (REJECTED, CLOSED, ...)?
   - Nếu KH có cashloan record với status ≠ Forsign nhưng vẫn được trả ra → query
     filter cashloan đang sai (vd. dùng OR thay vì AND, hoặc miss WHERE clause).
4. **Check `total=103`**: có thể tổng của Forsign trong source 2495 thực là 99, BE
   đang cộng nhầm 4 KH không thuộc đâu vào.

## Test đối chiếu sau khi BE fix

Khi BE fix xong, chạy lại curl ở trên — kỳ vọng:

- `total` giảm xuống ≤ 103 (loại 4 items lệch)
- Mọi `items[*].sourceId === 2495`
- Mọi `items[*].lstCustomerExtraInfo` có entry `fieldName="Trangthaikhoanvaycashloan"`
  và `attributeValue="Chờ KH ký hợp đồng (Forsign)"`

Hoặc dùng script Playwright đã có sẵn:
`d:/tmp/probe-tester-url.mjs` (toàn bộ matrix 9 status × top source).

## Liên quan

- FE commit fix tester confirm pass: `db13630e fix(customer-list): không lọc đúng "Nguồn khách hàng" khi kết hợp với "Trạng thái khoản vay Cashloan"`
- Code path FE liên quan: [src/services/CustomerService.ts](../../../src/services/CustomerService.ts) (`normalizeCustomerListParams`)
