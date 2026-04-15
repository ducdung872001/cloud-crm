# Tài liệu Yêu cầu Người dùng — Reborn Retail CRM

**User Requirement Document (URD)** — biên soạn ngược (reverse-engineered) từ codebase và hành vi thực tế của hệ thống **Reborn Retail** — biến thể *Cửa hàng bán lẻ / Chuỗi / Multi-channel POS*.

> **Mục đích:** Đây là tài liệu **mô tả yêu cầu** mà hệ thống đã/đang đáp ứng. Khác với HDSD (hướng dẫn cách dùng), URD trả lời câu hỏi *"Hệ thống PHẢI làm được những gì?"* — dùng làm:
> - Cơ sở so sánh khi thay đổi nghiệp vụ.
> - Tài liệu bàn giao cho khách hàng / đội mới.
> - Đầu vào cho test case, kế hoạch QA, hợp đồng triển khai.
> - Tham chiếu khi lên scope cho phiên bản kế tiếp.

## Cấu trúc tài liệu

| Part | Tiêu đề | Nội dung |
|------|---------|----------|
| [Part 00](part-00-gioi-thieu.md) | Giới thiệu & Tổng quan | Mục đích, phạm vi, stakeholder, actor, glossary, MoSCoW |
| [Part 01](part-01-truy-cap.md) | Truy cập hệ thống | Đăng nhập SSO, phân quyền, giao diện, Dashboard retail |
| [Part 02](part-02-pos-ban-hang.md) | POS — Bán hàng tại quầy | Mở/đóng ca, tạo đơn, in bill, thanh toán, kiểm kê ca |
| [Part 03](part-03-khach-hang.md) | Quản lý Khách hàng | CRUD khách, phân khúc, chăm sóc, memberList, renewalList |
| [Part 04](part-04-don-hang-hoa-don.md) | Đơn hàng & Hoá đơn | Sales invoice, VAT, trả hàng, multi-channel sales |
| [Part 05](part-05-kho-san-pham.md) | Kho & Sản phẩm | Kho nhiều chi nhánh, kiểm kê, chuyển kho, điều chỉnh, NVL |
| [Part 06](part-06-mua-hang-ncc.md) | Mua hàng & Nhà cung cấp | Purchase order, nhập kho, công nợ NCC |
| [Part 07](part-07-van-chuyen.md) | Vận chuyển & Giao hàng | Shipping, đối tác vận chuyển, phí ship, dashboard logistic |
| [Part 08](part-08-tai-chinh.md) | Tài chính & Thanh toán | Sổ thu chi, quỹ, công nợ, đối soát, phương thức thanh toán |
| [Part 09](part-09-marketing-khuyen-mai.md) | Marketing & Khuyến mãi | Campaign, automation, email/SMS/Zalo, khuyến mãi |
| [Part 10](part-10-loyalty-cham-soc.md) | Loyalty & Chăm sóc khách | Điểm tích luỹ, hạng thẻ, ticket, warranty, survey |
| [Part 11](part-11-bao-cao-phan-tich.md) | Báo cáo & Phân tích | Doanh thu, khách hàng, kho, khuyến mãi, customer analysis |
| [Part 12](part-12-cai-dat.md) | Cài đặt | Tenant, cơ sở, tổ chức, phân quyền, tích hợp, kênh bán |
| [Part 13](part-13-bpm-automation.md) | BPM & Automation | Quy trình, business rules, service package, field management |
| [Part 14](part-14-nfr-tich-hop.md) | Yêu cầu phi chức năng & Tích hợp | Performance, security, usability, API/webhook, data model |

## Quy ước

### Mã định danh yêu cầu (Requirement ID)

```
UR-<MODULE>-<NN>
```

Trong đó:
- `UR` = User Requirement
- `<MODULE>` = mã viết tắt phân hệ (vd: `POS`, `CUST`, `ORDER`, `INV`, `PURCH`, `SHIP`, `FIN`, `MKT`, `LOY`, `REP`, `SET`, `BPM`, `NFR`)
- `<NN>` = số thứ tự 2 chữ số trong phân hệ

Ví dụ: `UR-POS-03` = Yêu cầu số 3 trong phân hệ POS (bán hàng tại quầy).

### Cấu trúc một yêu cầu

Mỗi yêu cầu được mô tả theo template:

| Trường | Ý nghĩa |
|--------|---------|
| **ID** | Mã định danh |
| **Tên yêu cầu** | Mô tả ngắn (≤ 1 dòng) |
| **Actor** | Vai trò người dùng / hệ thống ngoại vi liên quan |
| **Mô tả** | Mô tả chi tiết hành vi mong đợi |
| **Tiền điều kiện** | Điều kiện phải thỏa trước khi thực hiện |
| **Đầu vào** | Dữ liệu / ràng buộc cụ thể |
| **Đầu ra / Hậu điều kiện** | Trạng thái sau khi thực hiện |
| **Tiêu chí chấp nhận** | Cách kiểm chứng yêu cầu đã được đáp ứng |
| **Mức ưu tiên** | M (Must) / S (Should) / C (Could) / W (Won't) |

### MoSCoW ưu tiên

- **M (Must have)** — Bắt buộc phải có, không có là hệ thống không dùng được
- **S (Should have)** — Nên có, ưu tiên cao nhưng hệ thống vẫn chạy được nếu thiếu
- **C (Could have)** — Có thì tốt, không có cũng không sao
- **W (Won't have this time)** — Tạm thời chưa làm, để phiên bản sau

### Tham chiếu HDSD

Mỗi yêu cầu trong URD có thể tham chiếu đến **phần HDSD** tương ứng (cách thực hiện) — đó là tài liệu dành cho người dùng cuối, không thay thế URD.

## Nguồn biên soạn

- Codebase: `src/` (React/TypeScript, 167 page modules)
- Routes: [src/configs/routes.tsx](../../src/configs/routes.tsx)
- Menu labels: [src/i18n.ts](../../src/i18n.ts) hoặc `src/locales/vi.ts`
- Services: `src/services/*.ts` (240+ files)
- HDSD (nếu có): [docs/userguides/README.md](../userguides/README.md)

## Phân biệt với SAD

| URD | SAD |
|-----|-----|
| **Hệ thống LÀM GÌ** | **Hệ thống XÂY THẾ NÀO** |
| Người đọc: BA, PO, QA, Khách hàng | Người đọc: Dev, Architect, DevOps |
| Template yêu cầu có ID + acceptance | Template diagram + ADR + trade-off |
| Ví dụ: "Hệ thống phải cho phép mở ca" | Ví dụ: "Mở ca gọi API POST /shift" |

Xem [docs/sa/](../sa/) cho SAD.
