# Part 12 — Cài đặt

## 1. Phạm vi phân hệ

Phân hệ Cài đặt tập trung mọi cấu hình vận hành của tenant Retail CRM: thông tin doanh nghiệp, cơ sở, tổ chức/phòng ban, vai trò & phân quyền, người dùng, kênh bán, phương thức thanh toán, sổ thu chi, loại ticket/warranty, tích hợp bên thứ ba, loyalty. Các route chính: `/settings`, `/setting_basis`, `/setting_org`, `/setting_customer`, `/setting_sales`, `/setting_sales_channel`, `/setting_cashbook`, `/setting_warranty`, `/setting_ticket`, `/setting_integrations`, `/setting_loyalty`, `/list_of_organizations`, `/user_administration`, `/user_task_list`, `/payment_method_setting`.

## 2. Actor liên quan

- **Tenant Admin** — toàn quyền cấu hình
- **Store Manager** — cấu hình phạm vi 1 cơ sở (nhân sự, sổ thu chi cơ sở)
- **System** — validate ràng buộc (không xoá dữ liệu có reference)

## 3. Yêu cầu chi tiết

### UR-SET-01 — Cấu hình thông tin tenant

| Trường | Nội dung |
|---|---|
| **ID** | UR-SET-01 |
| **Tên** | Cập nhật thông tin doanh nghiệp (tenant profile) |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/settings` cho phép nhập tên công ty, logo, mã số thuế, địa chỉ, số điện thoại, email, website, chữ ký số mặc định cho hoá đơn điện tử. |
| **Tiền điều kiện** | User có quyền `TENANT_SETTING_EDIT` |
| **Đầu vào** | Form profile + upload logo ≤ 2MB |
| **Đầu ra** | Tenant profile cập nhật, hiển thị ở header + hoá đơn in |
| **Tiêu chí chấp nhận** | - Validate MST theo format Việt Nam (10 hoặc 13 số)<br>- Đổi logo → áp dụng toàn hệ thống ngay, không cần reload<br>- Lưu vào bảng `tenant_profile` |
| **Ưu tiên** | **M** |

### UR-SET-02 — Quản lý cơ sở (branch)

| Trường | Nội dung |
|---|---|
| **ID** | UR-SET-02 |
| **Tên** | Tạo/sửa/đóng cơ sở |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/setting_basis` cho phép tạo cơ sở mới (tên, mã, địa chỉ, SĐT, thời gian hoạt động, manager), chỉnh sửa, đánh dấu đóng cửa. Mỗi cơ sở có 1 kho mặc định được tạo tự động. |
| **Đầu vào** | Form branch + chọn `defaultWarehouseId` |
| **Đầu ra** | Branch vào danh sách, dùng được ở POS/Inventory |
| **Tiêu chí chấp nhận** | - Không xoá cơ sở đã có giao dịch → chỉ cho đóng (soft close)<br>- Khi tạo, tự tạo 1 kho trùng tên<br>- Manager phải là user đã tồn tại trong tenant |
| **Ưu tiên** | **M** |

### UR-SET-03 — Tổ chức & phòng ban

| Trường | Nội dung |
|---|---|
| **ID** | UR-SET-03 |
| **Tên** | Quản lý cơ cấu tổ chức đa cấp |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/setting_org` và `/list_of_organizations` cho phép vẽ sơ đồ tổ chức dạng cây: công ty → phòng ban → tổ/nhóm. User được gán vào từng node. Dùng cho báo cáo và phân quyền. |
| **Đầu vào** | Thao tác kéo-thả trên tree, form thêm node |
| **Đầu ra** | Org tree lưu trong bảng `organization_unit` |
| **Tiêu chí chấp nhận** | - Tối đa 6 cấp<br>- Di chuyển node → user con theo<br>- Xoá node có user → hiện confirm và yêu cầu move user trước |
| **Ưu tiên** | **S** |

### UR-SET-04 — Vai trò & phân quyền

| Trường | Nội dung |
|---|---|
| **ID** | UR-SET-04 |
| **Tên** | Tạo role và gán tập permission |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang phân quyền cho phép tạo role (ví dụ: Cashier, Warehouse, Accountant) và tick chọn permission từ ma trận phân nhóm theo phân hệ. Clone role có sẵn để tạo nhanh. |
| **Đầu vào** | Role name, permission codes[] |
| **Đầu ra** | Role lưu vào `role` + `role_permission` |
| **Tiêu chí chấp nhận** | - Không xoá role đang gán cho user (phải move user trước)<br>- Có role preset: Admin, Manager, Cashier, Warehouse, Accountant<br>- Audit log mọi thay đổi permission |
| **Ưu tiên** | **M** |

### UR-SET-05 — Quản lý người dùng

| Trường | Nội dung |
|---|---|
| **ID** | UR-SET-05 |
| **Tên** | Mời user mới và gán role/branch |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/user_administration` cho phép mời user bằng SĐT/email. System gửi email/SMS invite, user click link đặt mật khẩu. Sau đó gán: role(s), branch(es), department. `/user_task_list` xem task được giao cho user. |
| **Đầu vào** | SĐT/email, tên, role, branch |
| **Đầu ra** | User được tạo trong SSO + đồng bộ qua CRM |
| **Tiêu chí chấp nhận** | - Link invite hết hạn sau 48h<br>- Có thể bulk import user từ Excel<br>- Disable user thay vì xoá (giữ lịch sử) |
| **Ưu tiên** | **M** |

### UR-SET-06 — Cấu hình kênh bán

| Trường | Nội dung |
|---|---|
| **ID** | UR-SET-06 |
| **Tên** | Khai báo các kênh bán hàng |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/setting_sales_channel` cho phép khai báo các kênh: POS tại quầy, Website/App, Shopee, Lazada, Tiki, TikTok Shop, Facebook, Zalo. Mỗi kênh có mã, tên, tỉ lệ phí, có tính vào doanh thu hay không. |
| **Đầu vào** | Form channel + chọn kênh preset |
| **Đầu ra** | Kênh xuất hiện trong dropdown tạo đơn + báo cáo |
| **Tiêu chí chấp nhận** | - Mỗi kênh có thể map với account tích hợp (Shopee shop_id)<br>- Bật/tắt kênh không mất dữ liệu cũ |
| **Ưu tiên** | **S** |

### UR-SET-07 — Phương thức thanh toán

| Trường | Nội dung |
|---|---|
| **ID** | UR-SET-07 |
| **Tên** | Cấu hình phương thức thanh toán |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/payment_method_setting` khai báo: Tiền mặt, Chuyển khoản (chọn ngân hàng, STK), QR code (VietQR), Thẻ (máy POS), Ví điện tử (Momo/VNPay/ZaloPay), Công nợ. Mỗi phương thức map vào 1 tài khoản sổ thu chi. |
| **Đầu vào** | Tên, loại, account mapping, trạng thái |
| **Đầu ra** | Danh sách phương thức hiện ở màn POS thanh toán |
| **Tiêu chí chấp nhận** | - Không xoá phương thức đang có phiếu thu sử dụng<br>- Có thể sắp xếp thứ tự hiển thị ở POS |
| **Ưu tiên** | **M** |

### UR-SET-08 — Cấu hình sổ thu chi

| Trường | Nội dung |
|---|---|
| **ID** | UR-SET-08 |
| **Tên** | Khoản mục thu/chi và tài khoản mặc định |
| **Actor** | Tenant Admin, Accountant |
| **Mô tả** | Trang `/setting_cashbook` cho phép khai báo cây khoản mục thu (doanh thu bán hàng, thu khác…) và khoản mục chi (lương, điện nước, thuê mặt bằng, marketing…). Định nghĩa tài khoản mặc định cho từng khoản mục. |
| **Đầu vào** | Cây khoản mục, account mapping |
| **Đầu ra** | Dropdown khoản mục ở form phiếu thu/chi |
| **Tiêu chí chấp nhận** | - Khoản mục đã có giao dịch không cho xoá<br>- Có preset theo ngành retail |
| **Ưu tiên** | **S** |

### UR-SET-09 — Cấu hình loại ticket

| Trường | Nội dung |
|---|---|
| **ID** | UR-SET-09 |
| **Tên** | Loại ticket hỗ trợ khách hàng |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/setting_ticket` khai báo các loại ticket (Khiếu nại, Đổi trả, Hỗ trợ kỹ thuật, Tư vấn), SLA phản hồi, assignee mặc định, template phản hồi. |
| **Đầu vào** | Loại ticket, SLA (giờ), assignee, template |
| **Đầu ra** | Loại ticket dùng khi tạo ticket mới |
| **Tiêu chí chấp nhận** | - SLA tính theo giờ làm việc (cấu hình ở branch)<br>- Auto escalate khi quá SLA |
| **Ưu tiên** | **S** |

### UR-SET-10 — Cấu hình warranty

| Trường | Nội dung |
|---|---|
| **ID** | UR-SET-10 |
| **Tên** | Chính sách bảo hành theo nhóm SP |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/setting_warranty` khai báo: thời hạn bảo hành mặc định theo nhóm SP, điều kiện, loại trừ, quy trình đổi/sửa/trả tiền, phí dịch vụ ngoài bảo hành. |
| **Đầu vào** | Product category + policy |
| **Đầu ra** | Khi bán SP, warranty card được tạo tự động |
| **Tiêu chí chấp nhận** | - Có thể override policy ở cấp SP cụ thể<br>- In thẻ bảo hành kèm hoá đơn |
| **Ưu tiên** | **C** |

### UR-SET-11 — Tích hợp bên thứ ba

| Trường | Nội dung |
|---|---|
| **ID** | UR-SET-11 |
| **Tên** | Bật/tắt và cấu hình tích hợp |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/setting_integrations` liệt kê các integration: Payment (VNPay/Momo/ZaloPay), E-invoice (VNPT/MInvoice), SMS (esms/VietGuys), Email (SMTP/SendGrid), Zalo OA, Facebook, Shipping (GHN/GHTK/VNPost/J&T), Marketplace. Mỗi item có nút Connect, nhập API key/secret, test connection. |
| **Đầu vào** | API credentials cho từng provider |
| **Đầu ra** | Status: connected/disconnected/error |
| **Tiêu chí chấp nhận** | - Test connection trước khi lưu<br>- Credential mã hoá trong DB<br>- Log mọi call ra integration |
| **Ưu tiên** | **M** |

### UR-SET-12 — Cài đặt loyalty

| Trường | Nội dung |
|---|---|
| **ID** | UR-SET-12 |
| **Tên** | Cấu hình chương trình tích điểm |
| **Actor** | Tenant Admin |
| **Mô tả** | Trang `/setting_loyalty` cho phép định nghĩa: tỉ lệ tích điểm (VD 1 điểm = 10.000đ), thời hạn điểm, rule rank (Silver/Gold/Diamond), đặc quyền theo rank, quy tắc cộng điểm thêm theo campaign. |
| **Đầu vào** | Rules + ngưỡng rank |
| **Đầu ra** | Rule áp dụng ở POS khi tính điểm |
| **Tiêu chí chấp nhận** | - Thay đổi không làm mất điểm đã tích cũ<br>- Preview điểm tích cho 1 đơn mẫu |
| **Ưu tiên** | **S** |

## 4. Quy tắc nghiệp vụ liên quan

- **Không xoá cứng**: mọi entity có reference đều soft-delete hoặc disable.
- **Audit log**: tất cả thay đổi ở cấu hình đều ghi log (ai, khi nào, trước/sau).
- **Scope**: Store Manager chỉ sửa cấu hình scoped theo cơ sở; config tenant-wide chỉ Tenant Admin được đụng.
- **Đổi cấu hình không hồi tố**: thay đổi áp dụng cho giao dịch mới, không tính lại giao dịch cũ.

## 5. Non-functional ràng buộc

- **Performance**: Trang cấu hình load ≤ 2s, lưu ≤ 1s.
- **Security**: Mọi API setting yêu cầu permission riêng, credential lưu mã hoá AES-256.
- **Audit**: Log retention tối thiểu 1 năm.

---

*Hết Part 12. Xem tiếp [Part 13 — BPM & Automation](part-13-bpm-automation.md).*
