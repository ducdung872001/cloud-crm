# Pricing — INTERNAL

> ⚠️ **TÀI LIỆU NỘI BỘ.** Chứa thông tin CAPEX allocation, chi phí–margin chi tiết. KHÔNG chia sẻ ra ngoài khách hàng/đối tác.

| Tài liệu | Mục đích | Định dạng nguồn |
|---|---|---|
| [`bao-gia-loyalty.md`](bao-gia-loyalty.md) | Báo giá khách hàng (có thể gửi) | Markdown |
| [`phan-tich-capex-allocation.md`](phan-tich-capex-allocation.md) | **INTERNAL** — Phân tích CAPEX | Markdown |
| [`phan-tich-chi-phi-margin.md`](phan-tich-chi-phi-margin.md) | **INTERNAL** — Phân tích chi phí, margin | Markdown |
| `../../_assets/pricing/Bao-gia-Loyalty-Platform.docx` | Báo giá DOCX gửi khách | DOCX |
| `../../_assets/pricing/Phan-tich-CAPEX-Allocation-INTERNAL.docx` | INTERNAL DOCX | DOCX |
| `../../_assets/pricing/Phan-tich-Chi-phi-Margin-INTERNAL.docx` | INTERNAL DOCX | DOCX |
| `../../_assets/pricing/Bao-gia-Loyalty-Platform-dukien.docx` | Bản dự kiến (snapshot) | DOCX |
| `../../_scripts/generate-bao-gia-docx.mjs` | Regenerate báo giá DOCX | Node.js |
| `../../_scripts/generate-capex-docx.mjs` | Regenerate CAPEX DOCX | Node.js |
| `../../_scripts/generate-phan-tich-docx.mjs` | Regenerate chi phí DOCX | Node.js |

## Workflow chỉnh báo giá

1. Sửa `.md` ở folder này
2. Chạy `node ../../_scripts/generate-bao-gia-docx.mjs` để regenerate DOCX
3. DOCX tự xuất ra `../../_assets/pricing/`
4. Commit cả `.md` và `.docx`
