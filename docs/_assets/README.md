# _assets — File nguồn

Folder này chứa **file nguồn non-markdown** (PDF, PPTX, DOCX, XLSX, ảnh, ...). Tách ra khỏi tài liệu markdown để folder chính sạch.

## Cấu trúc

```
_assets/
├── proposal/                  PDF + PPTX đề xuất giải pháp
├── pricing/                   DOCX báo giá (INTERNAL có CAPEX/margin)
├── survey/                    XLSX phiếu khảo sát khách hàng
├── customer-requirements/     Ảnh chat yêu cầu + Q&A_FN.xlsx
└── bug-reports/               XLSX bugs + DOCX retest guide
```

## Quy ước

- Filename giữ nguyên (không rename) để dễ tra ngược
- File "INTERNAL" trong tên → không chia sẻ ra ngoài KH
- Các file `.md` tương ứng (source markdown) nằm trong [`../01-business/`](../01-business/), [`../07-testing/`](../07-testing/)
- Script regen các file này nằm trong [`../_scripts/`](../_scripts/)

## Workflow update file

1. Sửa file `.md` nguồn (trong 01-business hoặc 07-testing)
2. Chạy script regen tương ứng (trong _scripts)
3. File `.docx`/`.pptx` tự xuất ra đây
4. Commit cả `.md` và file output

> **Lưu ý:** Không edit file `.docx`/`.pptx` trực tiếp — sửa `.md` rồi regen, tránh diverge.
