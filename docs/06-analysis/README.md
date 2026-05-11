# 06-Analysis — Phân tích chuyên sâu Loyalty

Folder này tập hợp **các phân tích chuyên sâu** về bài toán loyalty siêu thị bán lẻ — vượt ngoài phạm vi URD/SA thông thường. Mục đích: cung cấp **lý do kinh tế, behavioral, technical** cho các quyết định thiết kế quan trọng, có benchmark thị trường + công thức cụ thể.

## Danh mục

| # | Tài liệu | Trọng tâm |
|---|---|---|
| 1 | [`loyalty-economics.md`](loyalty-economics.md) | Cost-per-point, breakage, liability, redemption rate, NPV, sensitivity, P&L impact |
| 2 | [`rfm-clv-model.md`](rfm-clv-model.md) | Mô hình RFM 5×5×5, 11 personas, công thức CLV (BG/NBD + Gamma-Gamma), churn signal |
| 3 | [`point-expiry-strategy.md`](point-expiry-strategy.md) | So sánh 3 chế độ expire (never/after_months/end_of_year), tác động liability + behavior |
| 4 | [`cross-brand-strategy.md`](cross-brand-strategy.md) | Pool chung vs riêng, tỷ giá transfer, benchmark Sephora/Marriott/Starbucks |
| 5 | [`data-migration-strategy.md`](data-migration-strategy.md) | ETL Goldmem + Access + Excel + Supporter → 1 nguồn, dedupe, dry-run, cutover |
| 6 | [`fraud-prevention.md`](fraud-prevention.md) | Gian lận tích điểm, tài khoản ma, chargeback abuse, insider — phát hiện và chặn |
| 7 | [`compliance-pdpa.md`](compliance-pdpa.md) | NĐ 13/2023 (PDPA VN), NĐ 91/2020 (anti-spam), consent management, right-to-erasure |
| 8 | [`advanced-earn-rule-bpm-case-study.md`](advanced-earn-rule-bpm-case-study.md) | **Case study Loyalty Quest** — Advanced earn rule qua BPM Engine: workflow 5-challenge × 30 ngày, BPMN diagram, sequence flow, failure handling. Áp dụng pattern cho mọi quest/family/B2B nâng cao |

## Quy ước

- Mỗi file là **standalone** — có thể đọc độc lập
- Có **TL;DR** đầu mỗi file cho người ít thời gian
- Số liệu tham chiếu industry: chú thích nguồn
- Công thức kèm ví dụ tính toán + sensitivity table
- Khuyến nghị cuối mỗi file — actionable

## Đối tượng đọc

| Tài liệu | Ai nên đọc |
|---|---|
| economics | CFO, BOD, Marketing Director, Pricing PM |
| rfm-clv | Marketing analyst, Data scientist |
| expiry-strategy | Marketing + Finance |
| cross-brand | BOD, Marketing Director |
| migration | CTO, Tech Lead, Migration PM |
| fraud | Security, Operations, Finance |
| compliance | Legal, DPO, Compliance officer |
| advanced-earn-rule-bpm | Tech Lead, Architect, Marketing/BA (BPM Studio), Backend Dev (market-service) |
