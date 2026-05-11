# Tài liệu Yêu cầu Người dùng — Reborn CRM

**User Requirement Document (URD)** — biên soạn ngược (reverse-engineered) từ codebase và hành vi thực tế của hệ thống Reborn CRM (biến thể Cửa hàng / Spa / Cộng đồng).

> **Mục đích:** Đây là tài liệu **mô tả yêu cầu** mà hệ thống đã/đang đáp ứng. Khác với HDSD (hướng dẫn cách dùng), URD trả lời câu hỏi *"Hệ thống PHẢI làm được những gì?"* — dùng làm:
> - Cơ sở so sánh khi thay đổi nghiệp vụ.
> - Tài liệu bàn giao cho khách hàng / đội mới.
> - Đầu vào cho test case, kế hoạch QA, hợp đồng triển khai.
> - Tham chiếu khi lên scope cho phiên bản kế tiếp.

## Cấu trúc tài liệu

| Part | Tiêu đề | Nội dung |
|------|---------|----------|
| [Part 00](part-00-gioi-thieu.md) | Giới thiệu & Tổng quan | Mục đích, phạm vi, stakeholder, actor, glossary, MoSCoW |
| [Part 01](part-01-truy-cap.md) | Truy cập hệ thống | Đăng nhập SSO, phân quyền, giao diện, Dashboard |
| [Part 02](part-02-le-tan.md) | Lễ tân | Quản lý ca, POS, Check-in, Trừ quota |
| [Part 03](part-03-thanh-vien.md) | Quản lý Thành viên | CRUD khách, trường tùy chỉnh, danh mục liên quan |
| [Part 04](part-04-giao-dich.md) | Giao dịch | Đơn hàng, hóa đơn VAT, vận chuyển, trả hàng |
| [Part 05](part-05-luu-tru.md) | Lưu trú | Booking, check-in/out phòng, công suất |
| [Part 06](part-06-tai-chinh.md) | Tài chính & Thanh toán | Sổ thu chi, quỹ, công nợ, đối soát |
| [Part 07](part-07-doi-tac-phan-hoi.md) | Đối tác & Phản hồi | KOL/PO, hoa hồng, ticket phản hồi |
| [Part 08](part-08-bao-cao.md) | Báo cáo | 6 loại báo cáo + xuất / lịch tự động |
| [Part 09](part-09-uu-dai-cham-soc.md) | Ưu đãi & Chăm sóc | Khuyến mãi, loyalty, marketing automation |
| [Part 10](part-10-kho.md) | Kho & Nguyên vật liệu | Tồn kho, NCC, kiểm kê, báo cáo kho |
| [Part 11](part-11-cai-dat-co-ban.md) | Cài đặt cơ bản | Tenant config, danh mục SP/DV, gói TV, vận hành |
| [Part 12](part-12-cai-dat-nang-cao.md) | Cài đặt nâng cao | Phân quyền, kênh, tích hợp, bảo mật, ticket |
| [Part 13](part-13-phi-chuc-nang.md) | Yêu cầu phi chức năng | Performance, security, usability, reliability, i18n |
| [Part 14](part-14-tich-hop-du-lieu.md) | Tích hợp & Dữ liệu | API, webhook, import/export, mô hình dữ liệu |

## Quy ước

### Mã định danh yêu cầu (Requirement ID)

```
UR-<MODULE>-<NN>
```

Trong đó:
- `UR` = User Requirement
- `<MODULE>` = mã viết tắt phân hệ (vd: `RECEPTION`, `MEMBER`, `SALE`, `FIN`, `INV`, `MKT`, `SET`, `NFR`)
- `<NN>` = số thứ tự 2 chữ số trong phân hệ

Ví dụ: `UR-RECEPTION-03` = Yêu cầu số 3 trong phân hệ Lễ tân.

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
| **Ghi chú** | Phụ thuộc, ràng buộc kỹ thuật, rủi ro |

### Mức ưu tiên (MoSCoW)

| Ký hiệu | Ý nghĩa | Hành vi nếu không có |
|---------|---------|----------------------|
| **M** — Must have | Bắt buộc, thiếu là không launch được | Hệ thống không thể vận hành đúng nghiệp vụ chính |
| **S** — Should have | Quan trọng, nên có ngay từ phiên bản đầu | Có thể hoạt động nhưng giảm hiệu quả đáng kể |
| **C** — Could have | Có thì tốt, không có cũng được | Trải nghiệm kém hơn, không chặn nghiệp vụ |
| **W** — Won't have *(this release)* | Đồng ý không làm trong phiên bản hiện tại | Chuyển sang backlog |

### Phân loại yêu cầu

- **FR** (Functional Requirement) — yêu cầu chức năng (mặc định ở Part 01–12)
- **NFR** (Non-Functional Requirement) — yêu cầu phi chức năng (Part 13)
- **IR** (Integration Requirement) — yêu cầu tích hợp (Part 14)
- **DR** (Data Requirement) — yêu cầu dữ liệu (Part 14)

## Tài liệu tham chiếu

- **HDSD** (Hướng dẫn sử dụng): `docs/userguides/HDSD-full-final.md` — viết từ góc nhìn người dùng, nội dung của HDSD chính là implementation của các yêu cầu trong URD này.
- **Codebase**: `src/pages/`, `src/services/`, `src/components/` — source code phản ánh hành vi thực tế.

## Đối tượng đọc tài liệu này

| Đối tượng | Sử dụng URD để |
|-----------|----------------|
| **Khách hàng / Chủ doanh nghiệp** | Hiểu hệ thống đáp ứng nghiệp vụ gì, kiểm tra trước khi nghiệm thu |
| **PM / BA** | Trao đổi yêu cầu với khách, lên scope phiên bản tiếp theo |
| **Dev / Architect** | Bám yêu cầu khi refactor / thêm tính năng |
| **QA / Tester** | Sinh test case từ Tiêu chí chấp nhận |
| **DevOps / SRE** | Hiểu yêu cầu phi chức năng (Part 13) để cấu hình hạ tầng |
| **Đối tác triển khai** | Nắm scope khi nhận dự án |
