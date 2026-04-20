# Hướng dẫn chuyển HDSD sang DOCX bằng Claude web

Tài liệu HDSD đã hoàn tất với 12 Part và 1 file tổng hợp. Dưới đây là cách bạn chuyển sang **bản DOCX đẹp** bằng cách dùng chính Claude web.

## Cấu trúc thư mục hiện tại

```
docs/userguides/
├── README.md                       # Mục lục các part
├── README-upload.md                # File này
├── HDSD-full.md                    # ★ File tổng hợp toàn bộ 12 Part (đã ghép)
├── part-01-bat-dau.md              # Phần 1: Đăng nhập + Dashboard
├── part-02-le-tan.md               # Phần 2: Lễ tân (4 module)
├── part-03-thanh-vien.md           # Phần 3: Thành viên
├── part-04-giao-dich.md            # Phần 4: Giao dịch
├── part-05-luu-tru.md              # Phần 5: Lưu trú
├── part-06-tai-chinh.md            # Phần 6: Tài chính
├── part-07-doi-tac-phan-hoi.md     # Phần 7: Đối tác & Phản hồi
├── part-08-bao-cao.md              # Phần 8: Báo cáo
├── part-09-uu-dai-cham-soc.md      # Phần 9: Ưu đãi & Chăm sóc
├── part-10-kho.md                  # Phần 10: Kho & NVL
├── part-11-cai-dat-co-ban.md       # Phần 11: Cài đặt cơ bản
├── part-12-cai-dat-nang-cao.md     # Phần 12: Cài đặt nâng cao
├── images/
│   ├── part-01-bat-dau/            # 10 ảnh
│   ├── part-02-le-tan/             # 33 ảnh
│   ├── part-03-thanh-vien/         # 27 ảnh
│   ├── part-04-giao-dich/          # 8 ảnh
│   ├── part-05-luu-tru/            # 2 ảnh
│   ├── part-06-tai-chinh/          # 12 ảnh
│   ├── part-07-doi-tac-phan-hoi/   # 4 ảnh
│   ├── part-08-bao-cao/            # 12 ảnh
│   ├── part-09-uu-dai-cham-soc/    # 8 ảnh
│   ├── part-10-kho/                # 12 ảnh
│   ├── part-11-cai-dat-co-ban/     # 8 ảnh
│   └── part-12-cai-dat-nang-cao/   # 10 ảnh
└── tooling/                         # Script Playwright để re-capture nếu cần
```

**Tổng cộng:** 13 file markdown + 146 ảnh PNG.

## 3 cách chuyển sang DOCX

### Cách 1 (khuyến nghị) — Dùng Claude web với từng Part

Vì 1 lần upload cho Claude web có giới hạn ~25 file, bạn nên chuyển **từng Part một**:

1. Mở https://claude.ai
2. Tạo cuộc trò chuyện mới.
3. Nhấp **+** → upload **1 file markdown** (vd `part-01-bat-dau.md`) **+ toàn bộ ảnh trong thư mục `images/part-01-bat-dau/`**.
4. Gửi prompt:

   > Hãy chuyển file markdown này thành file DOCX với:
   > - Bìa đầu trang: tên tài liệu, logo (nếu có), ngày
   > - Mục lục tự động
   > - Heading có hierarchy rõ ràng
   > - Ảnh chèn đúng vị trí với caption
   > - Bảng có viền, header in đậm
   > - Code block dùng font monospace
   > - Style phù hợp với tài liệu kỹ thuật chuyên nghiệp
   >
   > Sau đó cho tôi tải về.

5. Claude sẽ trả về file `.docx` để bạn tải về.
6. Lặp lại cho 11 Part còn lại.
7. Cuối cùng dùng Word để **gộp 12 file DOCX** (Insert → Object → Text from File).

### Cách 2 — Dùng HDSD-full.md với prompt phân page

1. Upload `HDSD-full.md` + zip toàn bộ thư mục `images/` (Claude web có thể nhận file zip).
2. Prompt:

   > Đây là tài liệu HDSD đầy đủ (3600+ dòng). Hãy chuyển toàn bộ thành 1 file DOCX với:
   > - Bìa, mục lục
   > - Mỗi Part bắt đầu trang mới (page break)
   > - Header chứa tên Part hiện tại
   > - Footer có số trang
   > - Ảnh giải nén từ thư mục images/ và chèn theo đường dẫn tương đối
   >
   > Tạo file DOCX hoàn chỉnh.

> **Cảnh báo:** Cách này có thể vượt giới hạn token / file size của Claude web. Nếu báo lỗi, dùng Cách 1.

### Cách 3 — Dùng Pandoc (offline, không cần Claude)

Nếu máy bạn có cài [Pandoc](https://pandoc.org/), chạy:

```bash
cd docs/userguides
pandoc HDSD-full.md -o HDSD-full.docx \
  --toc --toc-depth=3 \
  --reference-doc=template.docx \
  --resource-path=.:images
```

Cách này tạo DOCX **rất nhanh** nhưng style không đẹp như Claude web (cần `template.docx` riêng để custom style).

## Mẹo có DOCX đẹp nhất

1. **Dùng Cách 1** với từng Part — Claude xử lý tốt khi nội dung vừa phải.
2. Trong prompt, **mô tả style cụ thể**: "font Times New Roman 12pt cho text, font Arial cho heading, màu xanh navy cho heading 1...".
3. Nếu cần **logo** và **bìa**, gửi kèm ảnh logo trong cùng request.
4. **Review từng Part** trước khi gộp → phát hiện lỗi sớm.

## Sau khi có DOCX

- Mở Word → kiểm tra mục lục, ảnh, bảng.
- Chỉnh sửa thêm nếu cần.
- **Bảo mật**: nếu gửi cho khách hàng, nên xóa các thông tin dev (URL `localhost:4000`, tên tenant test "Viettel Store").
- **Đổi tên file** theo từng khách hàng nếu phục vụ nhiều khách: `HDSD-Reborn-CRM-<TenKhach>.docx`.

---

*Hết hướng dẫn upload.*
