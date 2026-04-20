# TC-MIGRATE-CUSTOMER-API — Kiểm thử chuyển đổi đầu API mới `/customer`

**Nhánh:** `hotfix/migrate-customer-api-biz-reborn`
**Ngày tạo:** 2026-04-20
**Mục đích:** Đảm bảo 4 module Khách hàng / Phân quyền / Nhân viên / Phòng ban chạy đúng sau khi chuyển sang đầu API `https://biz.reborn.vn/customer/*` (thay `cloud.reborn.vn/adminapi/*`).

---

## 1. Phạm vi thay đổi

Một hằng số mới `prefixCustomer` được thêm trong [src/configs/urls.ts](../../src/configs/urls.ts):

```ts
const prefixCustomer = (process.env.APP_CUSTOMER_API_URL || "https://biz.reborn.vn") + "/customer";
```

Tổng **181 endpoint** đã chuyển từ `prefixAdmin` sang `prefixCustomer` trong các block sau (số lượng endpoint/block):

| Module (UI) | Block trong `urlsApi` | Số endpoint đổi |
|---|---|---|
| Khách hàng | `customer` | 87 |
| Khách hàng | `historySend` (SMS/Email/Zalo lịch sử) | 3 |
| Khách hàng | `customerGroup` | 3 |
| Khách hàng | `customerSource` | 3 |
| Khách hàng | `customerMarketingLead` | 3 |
| Khách hàng | `customerView` | 3 |
| Khách hàng | `customerField` | 3 |
| Khách hàng | `customerAttribute` | 5 |
| Khách hàng | `customerExtraInfo` | 1 |
| Khách hàng | `reportCustomer` (chỉ các endpoint `/customer/...`) | 4 |
| Nhân viên | `employee` | 17 |
| Nhân viên | `employeeAgent` | 4 |
| Nhân viên | `teamEmployee` (group nhân viên) | 7 |
| Phòng ban | `department` | 6 |
| Phân quyền | `role` | 6 |
| Phân quyền | `permission` | 13 |
| Phân quyền | `rolePermission` | 13 |
| **Tổng** | | **181** |

Các endpoint KHÔNG đổi (giữ `prefixAdmin`):
- `estimate.takeEstimate` (`/customer/estimate`) — thuộc block estimate
- `reportCustomer.*` phần `/contract/...` — thuộc module hợp đồng
- `callCenter.*`, `marketingAutomation.*`, `campaign.*`, `userTask.*`, v.v. — ngoài phạm vi 4 module
- `placeholder.customer` (`/customer/placeholder`) — là bảng placeholder chung

---

## 2. Yêu cầu chuẩn bị môi trường

### 2.1 Backend
- Xác nhận service `https://biz.reborn.vn/customer/*` đã triển khai và phục vụ ĐÚNG **tất cả 181 endpoint** theo danh sách trên.
- CORS: phải cho phép origin của CRM (dev: `http://localhost:4000/crm/`, prod: domain thật) và cho phép cookie/Authorization header (`Access-Control-Allow-Credentials: true`).
- Authentication: cùng cơ chế token/cookie với `/adminapi/*` cũ (nếu khác — cần điều chỉnh `RestService.ts`).

### 2.2 Frontend
```bash
# Checkout nhánh hotfix
git checkout hotfix/migrate-customer-api-biz-reborn

# (Tuỳ chọn) override host API nếu test với môi trường staging
echo "APP_CUSTOMER_API_URL=https://biz-staging.reborn.vn" >> .env.local

npm run dev
```

---

## 3. Test case đầu-cuối (happy path)

Mỗi test case cần:
- **Kiểm tra Network tab** DevTools: URL request phải là `https://biz.reborn.vn/customer/...` (không còn `/adminapi/...`).
- **Kiểm tra response** trả về đúng cấu trúc; không có lỗi 404/500/CORS.

### 3.1 Module Khách hàng
| # | Màn hình | Thao tác | Endpoint expect |
|---|---|---|---|
| 1 | Danh sách khách hàng | Mở trang, tìm kiếm, phân trang | `POST /customer/customer/list_paid` |
| 2 | Chi tiết khách hàng | Mở 1 KH, sửa trường, lưu | `POST /customer/customer/get`, `POST /customer/customer/update` |
| 3 | Xem SĐT/email ẩn | Bấm mắt | `POST /customer/customer/get/phone`, `/email` |
| 4 | Thêm người xem cùng | Thêm và xoá viewer | `POST /customer/customerViewer/update`, `/delete` |
| 5 | Gửi SMS/Email/Zalo | Gửi thử 1 tin | `POST /customer/customer/send/sms` v.v. |
| 6 | Lịch điều trị | CRUD scheduler | `POST /customer/customerScheduler/update/list/cancel/get` |
| 7 | Trao đổi (exchange) | Thêm/xoá trao đổi | `POST /customer/customerExchange/update/list/delete` |
| 8 | Import khách hàng | Upload file, chạy auto | `POST /customer/customer/import/autoProcess` |
| 9 | Bộ lọc nâng cao | Tạo/xoá filter | `POST /customer/filter-setting/update/list/delete` |
| 10 | Chia dữ liệu KH | Chia KH cho nhân viên | `POST /customer/customer/assign` |
| 11 | Phân tích chân dung | Mở các biểu đồ classify | `POST /customer/api/v1/customer/classify/*` |
| 12 | Dashboard KH | Mở báo cáo khách hàng | `POST /customer/customer/dashboard/getTotal` |
| 13 | Nhóm KH / Nguồn KH / Lead MKT / Dạng xem | CRUD trong Setting | `/customerGroup`, `/customerSource`, `/marketingSource`, `/customerView` |
| 14 | Thuộc tính / Trường động / Extra info | CRUD | `/customerAttribute`, `/customerField`, `/customerExtraInfo` |

### 3.2 Module Nhân viên
| # | Màn hình | Thao tác | Endpoint expect |
|---|---|---|---|
| 15 | Danh sách nhân viên | Mở, tìm | `POST /customer/employee/list` |
| 16 | Thêm/sửa NV | Lưu, gán role | `POST /customer/employee/update`, `/roleEmployee/insert-batch` |
| 17 | Link user ↔ employee | Link | `POST /customer/employee/link_user` |
| 18 | Reset pass / Random pass | Sinh mật khẩu | `POST /customer/employee/random_pass` |
| 19 | Kiểm tra kết nối email | Bấm check | `POST /customer/employee/check_email_connection` |
| 20 | Nhóm nhân viên (team) | CRUD group | `POST /customer/group/*`, `/customer/groupEmployee/*` |
| 21 | Employee Agent (tổng đài) | CRUD | `POST /customer/employeeAgent/*` |

### 3.3 Module Phòng ban
| # | Màn hình | Thao tác | Endpoint expect |
|---|---|---|---|
| 22 | Cây phòng ban | Mở, sửa, kéo-thả parent | `POST /customer/department/list/update/update/parent` |
| 23 | Xoá phòng ban | Xoá 1 node | `POST /customer/department/delete` |

### 3.4 Module Phân quyền
| # | Màn hình | Thao tác | Endpoint expect |
|---|---|---|---|
| 24 | Nhóm quyền (role) | CRUD role | `POST /customer/role/list/update/delete` |
| 25 | Phân quyền theo phòng ban | Thêm/xoá quyền | `POST /customer/permission/info/add/remove` |
| 26 | Phân quyền theo role | Thêm/xoá quyền cho role | `POST /customer/rolePermission/info/add/remove` |
| 27 | Clone quyền | Sao chép quyền từ role khác | `POST /customer/permission/clone` |
| 28 | Yêu cầu cấp quyền | Tạo/duyệt/từ chối | `POST /customer/requestPermission/update/approved/rejected` |

---

## 4. Kịch bản lỗi (regression & edge)

| # | Kịch bản | Kỳ vọng |
|---|---|---|
| R1 | Token hết hạn khi gọi API mới | Vẫn nhận 401 và redirect login như cũ |
| R2 | CORS preflight | Request `OPTIONS` trả 200 với đầy đủ header |
| R3 | Offline/chậm mạng | Hiển thị toast lỗi thống nhất, không crash |
| R4 | Mở trang ngoài 4 module (ví dụ Campaign, Invoice) | Vẫn gọi `/adminapi/...` bình thường |
| R5 | Dashboard có cả `/customer/dashboard` và `/contract/dashboard` | Cả 2 endpoint đều chạy song song không lỗi |

---

## 5. Báo cáo lỗi

- Ghi bug vào `docs/bugs/bug-report-tester.csv` theo format chuẩn với cột `Module`, `API`, `Expected`, `Actual`, `Screenshot`.
- Đặt prefix mô tả: `[API-MIGRATE]` để dễ lọc.
- Screenshot đặt tại `tests/screenshots/migrate-customer-api/<ddmm>_<case>.png`.

---

## 6. Tiêu chí release (DoD)

- [ ] 28 happy-path case trên PASS trên môi trường staging.
- [ ] 5 regression case (R1-R5) PASS.
- [ ] Không còn request nào tới `/adminapi/customer`, `/adminapi/employee`, `/adminapi/department`, `/adminapi/role`, `/adminapi/permission`, `/adminapi/rolePermission`, `/adminapi/groupEmployee`, `/adminapi/roleEmployee` trong Network tab.
- [ ] Lint/Typecheck không phát sinh lỗi mới so với `reborn-retail`.
- [ ] PR review đã approve.
