# Khảo sát Khách hàng — Loyalty

Folder này chỉ chứa README; file nguồn `.xlsx` nằm trong `../../_assets/survey/` để tách tài liệu markdown ra khỏi binary.

| File nguồn (trong `_assets/survey/`) | Mô tả |
|---|---|
| `Phieu-khao-sat-Loyalty.xlsx` | Phiếu khảo sát chính (cập nhật mới nhất) |
| `Phieu-khao-sat-Loyalty-old.xlsx` | Phiên bản cũ — giữ tham chiếu |
| `Phieu-khao-sat-Loyalty_v1776928472764.xlsx` | Phiên bản timestamped |
| `TNTech phiếu khảo sát BPM_QLCV1504.xlsx` | Phiếu khảo sát BPM của TNTech (đối chiếu) |
| `../../_scripts/generate-survey-loyalty.mjs` | Script sinh phiếu khảo sát |

## Tóm tắt 10 câu Q&A đã thu được

Đầy đủ trong [`../proposal/proposal-loyalty-banle.md`](../proposal/proposal-loyalty-banle.md#11-phụ-lục-b-đối-chiếu-qa-khảo-sát) §11. Highlight:

| Câu | Trả lời khách | Hệ quả thiết kế |
|---|---|---|
| Hệ thống đang dùng? | Goldmem + MS Access + MS Excel + Supporter | ETL migration 4 nguồn |
| Số KHTV? | ~3 triệu | Scale design, bulk import |
| Giao dịch/ngày? | ~150.000 (peak ~300.000) | 500 TPS sustained |
| Marketing? | Thuê agency ngoài | Build marketing automation nội bộ |
| Kế hoạch 1–3 năm? | 1.000–1.500 điểm bán | Multi-tenant/branch native |
| Hạ tầng on-prem/cloud? | Phòng CNTT&CĐS đang xác nhận | Đề xuất 3 phương án |
