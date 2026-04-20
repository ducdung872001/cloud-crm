# BACKEND-TASK: Tạo endpoint `list_paid` phiên bản MySQL-only (không qua Elasticsearch)

**Domain:** `customer` (microservice `biz.reborn.vn/customer/*`)
**Severity:** 🔴 HIGH — đang chặn toàn bộ màn Quản lý KH trên môi trường dùng đầu API mới
**Ngày tạo:** 2026-04-20
**Frontend liên quan:** [src/services/CustomerService.ts:104-111](../../../src/services/CustomerService.ts#L104-L111), [src/configs/urls.ts `customer.filter` / `customer.listshared`](../../../src/configs/urls.ts)

---

## 1. Bối cảnh & lý do

Endpoint hiện hành `POST /customer/customer/list_paid` thực hiện full-text search qua **Elasticsearch**. Trên deployment mới `biz.reborn.vn/customer/*`, ES index đang nằm trên server cũ chạy local **không public ra ngoài**, nên endpoint này chết.

Trước mắt FE đã **tạm trỏ** `customer.filter` sang `/customer/customer/list` (xem [src/configs/urls.ts:101-105](../../../src/configs/urls.ts#L101-L105)) để còn dùng được — nhưng output của `/customer/list` KHÔNG khớp với `list_paid` (thiếu trường aggregate như `fee/paid/debt/invoiceCount/invoiceChargeTotal/dayNotContact/lastBoughtDate/…`).

**Giải pháp dài hạn:** BE viết **endpoint mới** tương đương `list_paid` nhưng:
- Search **trong MySQL** (LIKE / FULLTEXT index) thay vì ES
- Giữ **output schema giống y hệt** `list_paid` → FE không đổi gì sau khi BE deploy
- Giữ **input đơn giản** như UI thật sự cần (bỏ các advanced filter chỉ ES làm được)

---

## 2. Đề xuất endpoint

### Tên gợi ý (BE quyết, FE sẽ cập nhật `urlsApi.customer.filter`)

| Phương án | URL | Nhận xét |
|---|---|---|
| **A. Khuyến nghị** | `POST /customer/customer/list_paid/basic` | Sub-path của `list_paid`, tên nói rõ "phiên bản basic, không ES". Dễ grep logs tách hai luồng. |
| B | `POST /customer/customer/list_paid_v2` | Versioning truyền thống. Nhược điểm: không gợi ý rõ khác biệt về storage engine. |
| C | `POST /customer/customer/search` | Ngắn gọn, nhưng dễ nhầm với search-by-id hiện đã dùng `/customer/list_by_id`. |

Tương tự cần tạo biến thể `shared` — FE hiện dùng `customer.listshared` cho KH chia sẻ với đối tác:
- `POST /customer/customer/list_paid/basic/shared` (tương ứng với `/customer/list_paid/shared` cũ)

### Method & Content-Type

Giữ **giống `list_paid` hiện tại** (kiểm tra gateway: có thể là POST JSON body hoặc GET query string — theo inspect Network tab hiện tại là **GET với query string**). Giữ y nguyên để FE không đổi helper `apiGet`.

---

## 3. Input — các param UI thật sự gửi

Dựa theo phân tích [useCustomerList.ts](../../../src/hooks/useCustomerList.ts), [CustomerPersonList.tsx:800-870](../../../src/pages/CustomerPerson/CustomerPersonList.tsx#L800-L870), [CustomerRequestModel.ts:51-60](../../../src/model/customer/CustomerRequestModel.ts#L51-L60):

### 3.1 Bắt buộc support

| Param | Type | Ý nghĩa | SQL logic đề xuất |
|---|---|---|---|
| `keyword` | string (optional) | Từ khoá search — có thể là **tên / SĐT / email** | `name LIKE '%kw%' OR phone LIKE '%kw%' OR email LIKE '%kw%'`. Nếu có FULLTEXT index trên `(name, phone, email)` ưu tiên dùng. |
| `page` | number, default 1 | Trang (1-based) | `OFFSET (page-1)*limit` |
| `limit` | number, default 20 | Số bản ghi / trang (UI hay dùng 10/20/50/200) | `LIMIT :limit` — cap ở 500 để tránh DoS |
| `contactType` | number, `-1` = tất cả, `0` = cá nhân, `1` = công ty | Tab phân loại | `-1` → bỏ điều kiện; `0/1` → `WHERE custType = :contactType` |
| `branchId` | number (optional) | ID chi nhánh đang chọn | `WHERE branch_id = :branchId` nếu có |
| `custType` | number (optional, legacy alias của contactType) | Một số màn cũ gửi cả hai | Nếu chỉ một trong hai có mặt thì dùng; nếu cả hai → ưu tiên `contactType`. |
| `checkDebt` | number 0/1 (optional) | Tab "Có nợ" | `checkDebt = 1` → `WHERE total_debt > 0` |
| `fmtStartOrderDate` / `fmtEndOrderDate` | string `YYYY-MM-DD` (optional) | Khoảng ngày mua gần nhất | `WHERE last_bought_date BETWEEN …` |

### 3.2 Nice-to-have (UI dùng ít hơn, không block release nếu bỏ)

| Param | Type | Ghi chú |
|---|---|---|
| `cgpId` | number | ID nhóm KH (customerGroup) |
| `sourceIds` | JSON array | Nguồn KH — UI gửi dưới dạng `JSON.stringify([1,2,3])` |
| `employeeIds` | JSON array | Nhân viên phụ trách |
| `relationshipId` | number | Quan hệ với đối tác |
| `callStatuses` | JSON array | Trạng thái cuộc gọi telesale |
| `customerExtraInfo` | JSON object | Filter theo extra info động |
| `queryFromTnex` | 0/1 | Flag cho tenant Tnex — chỉ filter KH do Tnex đồng bộ |
| `targetBsnId` | number | Dùng cho endpoint `listshared` (KH của đối tác mục tiêu) |

**Khuyến cáo:** implement 3.1 trước → đủ cho 95% UI. Các param 3.2 có thể trả về unfiltered và ignore silently, FE sẽ nhận thấy và raise bug chi tiết sau.

### 3.3 Không cần support (chỉ ES mới làm nổi, UI basic không cần)

- Fuzzy search (`~`/edit distance)
- Full-text với boost theo trường
- Aggregate facets (count theo group/source/branch) — nếu cần thì tạo endpoint `/stats` riêng, không nhồi vào list

---

## 4. Output — schema giữ y hệt `list_paid`

Response format chuẩn của project:

```json
{
  "code": 0,
  "message": "OK",
  "result": {
    "items": [ /* ICustomerResponse[] */ ],
    "total": 1234,
    "page": 1,
    "limit": 20,
    "loadMoreAble": true
  }
}
```

Mỗi phần tử `items[i]` phải đủ các field FE đang consume (xem [CustomerResponseModel.ts:1-87](../../../src/model/customer/CustomerResponseModel.ts#L1-L87)):

### Field tối thiểu (UI Quản lý KH render trực tiếp)

- Identity: `id`, `code`, `name`, `contactName`, `gender`, `age`, `avatar`, `custType`
- Liên lạc: `phone`, `phoneMasked`, `email`, `emailMasked`, `address`, `areaId`
- Phân loại: `cgpId`, `groupName`, `sourceId`, `sourceName`, `relationshipId`, `relationshipName`, `careerId`, `careerName`
- Nhân viên phụ trách: `employeeId`, `employeeName`, `employeeAvatar`, `departmentName`
- Chi nhánh: `branchId`
- **Aggregate (phần quan trọng không thể bỏ):**
  - `fee` — tổng chi phí
  - `paid` — đã thanh toán
  - `debt` — công nợ còn lại
  - `invoiceCount` — số hoá đơn
  - `invoiceChargeTotal` — tổng doanh thu
  - `contactCount` — số lần tương tác
  - `dayNotContact` — số ngày không tương tác
  - `lastBoughtDate`, `lastContactDate`
  - `serviceNum`, `serviceChargeTotal`, `productNum`, `productChargeTotal`
- Loyalty: `cardId`, `cardName`
- Extra: `customerExtraInfos` (array), `mapCustomerAttribute` (object), `relationIds`, `relations`

### Lưu ý về aggregate

Các field `fee/paid/debt/invoiceCount/invoiceChargeTotal/…` **không có sẵn** trên bảng `customer` — chúng là **join-aggregate** từ bảng `invoice`, `payment`, `service`, `product` v.v. Trong `list_paid` cũ chúng được **denormalize sẵn vào ES index** nên query nhanh.

Với MySQL phải dùng một trong:
1. **View materialized / bảng summary refresh định kỳ** (recommended nếu data > 100k rows) — daily/hourly cron cập nhật `customer_summary(customer_id, fee, paid, debt, invoice_count, …)` rồi LEFT JOIN khi list.
2. **JOIN inline với GROUP BY** khi list — đơn giản code nhưng chậm với > 50k rows, cần index `(customer_id, deleted_at)` trên các bảng con.
3. **Compute on-demand chỉ cho page hiện tại** — list 20 KH trước, rồi batch fetch aggregate cho 20 ID đó qua query riêng. Cân bằng nhất.

Khuyến nghị **phương án 3** cho first cut — nhanh, không cần infra mới.

---

## 5. Phân quyền & multi-tenant

Giữ y hệt `list_paid` hiện tại:
- Đọc `Hostname` header → map sang tenant → scope query bằng `tenant_id`
- Đọc JWT `Authorization` → kiểm permission `customer.view` (và `customer.view_debt` nếu response có field `debt`/`paid`)
- Nếu user không có `customer.view_phone` → trả về `phoneMasked`, set `phone = null`
- Nếu user không có `customer.view_email` → tương tự `emailMasked`
- Branch-level: filter theo `branch_id` mà user có quyền (nếu `branchId` param = null → lấy tất cả branch user được phép)

---

## 6. Performance target

- p95 < 500ms với tenant có 100k KH, `limit=20`, search theo keyword
- p95 < 1500ms với `limit=200` + aggregate
- Index bắt buộc:
  - `customer(tenant_id, branch_id, custType, deleted_at)`
  - `customer(tenant_id, name)` — nếu DB engine support, hoặc FULLTEXT
  - `customer(tenant_id, phone)`, `customer(tenant_id, email)`
- Query plan bắt buộc chạy `EXPLAIN` trước khi release — không được xuất hiện `type=ALL` trên bảng `customer`.

---

## 7. Kế hoạch rollout

1. **BE implement** endpoint `/customer/customer/list_paid/basic` + `/customer/customer/list_paid/basic/shared`.
2. **BE test** với dataset tenant lớn (Viettel Store, KCN) — đảm bảo p95 trong target.
3. **FE đổi** `urlsApi.customer.filter` và `urlsApi.customer.listshared` trỏ sang endpoint mới (1 commit nhỏ).
4. **FE revert** comment `TẠM ĐỔI` ở [src/configs/urls.ts:101-105](../../../src/configs/urls.ts#L101-L105).
5. **QA smoke** trên màn Quản lý KH với các tab: Tất cả / Cá nhân / Công ty / Có nợ / VIP / Mới.
6. Sau khi stable ~1 tuần → BE **deprecate** `/customer/list_paid` (ES) hoặc giữ lại cho admin tool nội bộ.

---

## 8. Checklist cho BE

- [ ] Tạo endpoint `POST/GET /customer/customer/list_paid/basic` với input schema ở mục 3.1
- [ ] Tạo biến thể `…/basic/shared` cho KH đối tác chia sẻ
- [ ] Output schema y hệt `ICustomerResponse` (mục 4), không rớt field aggregate
- [ ] Phân quyền + masking phone/email đúng như `list_paid`
- [ ] Multi-tenant scope theo `Hostname` header
- [ ] `EXPLAIN` plan không có `ALL` trên `customer`
- [ ] Test với dataset 100k+ KH, đo p95
- [ ] Document trong swagger/openapi của microservice customer
- [ ] Báo FE team sau khi deploy để swap endpoint

---

## 9. Tham chiếu nhanh (cho BE khi đọc code FE)

- Định nghĩa URL: [src/configs/urls.ts `customer.filter`, `customer.listshared`](../../../src/configs/urls.ts)
- Service wrapper: [src/services/CustomerService.ts:102-111](../../../src/services/CustomerService.ts#L102-L111)
- Request model (input types): [src/model/customer/CustomerRequestModel.ts:51-88](../../../src/model/customer/CustomerRequestModel.ts#L51-L88)
- Response model (output schema): [src/model/customer/CustomerResponseModel.ts:1-87](../../../src/model/customer/CustomerResponseModel.ts#L1-L87)
- Hook consume: [src/hooks/useCustomerList.ts](../../../src/hooks/useCustomerList.ts)
- Màn UI chính: [src/pages/CustomerPerson/CustomerPersonList.tsx:1986-2040](../../../src/pages/CustomerPerson/CustomerPersonList.tsx#L1986-L2040)
