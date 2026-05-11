# Risk Buffer — Cách đệm rủi ro vào cost

> Cost basis trong [methodology.md](./methodology.md) là **best estimate**. File này quy ra **buffer** cho từng risk lớn để giải thích minh bạch khi negotiate với TNTech.

## 1. Ma trận risk → buffer

| # | Risk | Xác suất | Tác động | Buffer đề xuất | Đã buffer ở đâu |
|---|---|---|---|---:|---|
| 1 | Permission/Operation BE blocker chưa giải quyết → delay wire FE-BE | CAO | TRUNG | +0.5 MM TL + 1 MM BA | Cross-cutting cũ có |
| 2 | Schema-per-tenant không scale, phải migrate sang RLS giữa dự án | TRUNG | CAO | +3 MM BE Senior + +0.5 MM TL | Contingency 15% |
| 3 | Batch invoice ngày mồng 1 bị nghẽn — phải redesign queue | TRUNG | CAO | +2 MM BE Senior + +1 MM DevOps | Contingency |
| 4 | Webhook MSB/Timi double-process, gạch nợ trùng — debug khó | TRUNG | TRUNG | +1 MM BE Senior + +0.5 MM QA Lead | Contingency |
| 5 | 3-way match tolerance chưa quyết, rework | THẤP | TRUNG | +0.5 MM BE | Contingency |
| 6 | Vendor portal auth flow chưa chốt (magic link vs username/pass) | TRUNG | THẤP | +0.5 MM FE Senior | Cross-cutting |
| 7 | Owner portal SSO/SAML cho CĐT lớn — case-by-case | TRUNG | CAO khi xảy ra | +3-5 MM/case | **Tính riêng** khi CĐT yêu cầu |
| 8 | NHNN payment compliance chưa rõ implementation | TRUNG | CAO | +1 MM Security + +0.5 MM BE Senior | Cross-cutting Security |
| 9 | Maintenance Plan domain mới — ERD operation chưa có | THẤP | TRUNG | +1 MM BE Senior | Đã tính trong P3 |
| 10 | B2G workflow kho bạc phức tạp hơn dự kiến (chứng từ chuyên ngành) | TRUNG | CAO | +2 MM BE + +1 MM BA | Đã tính trong P3 |
| 11 | Multi-FE coexistence trên cloud-crm — handoff label confusion | THẤP | THẤP | +0.3 MM PM | Cross-cutting PM |
| 12 | TNPM stakeholder review chậm → blocker UAT | TRUNG | TRUNG | Bilateral SLA trong HĐ — **không buffer cost**, tính phí delay riêng | T&M clause |
| 13 | Migration data lịch sử từ hệ thống cũ TNPM | KHÔNG ĐÁNH GIÁ ĐƯỢC | CAO khi xảy ra | **Out-of-scope** — tính riêng | — |
| 14 | TTTM POS integration | TRUNG | TRUNG | **Out-of-scope** — tính riêng | — |
| 15 | Audit retention 2 năm không đủ NHNN, phải dùng 5-10 năm | THẤP | TRUNG | Cloud storage cost cao hơn ~+50M | Indirect 3rd-party |

## 2. Tổng buffer

- **Buffer in-MM** đã include trong Phase estimate: ~10 MM (đã reflect trong tổng 143 MM).
- **Contingency 15%** trên direct + indirect: ~970M VND.
- **Project Overhead 10%**: ~650M VND.
- **Out-of-scope items** (không buffer, tính riêng nếu xảy ra): Mobile, AI, POS, data migration, hotline, on-premise.

Tổng buffer hiện tại đủ để cover **risk 1-11** (xác suất TRUNG/CAO). Risk 7 (Owner SSO) + 12 (TNPM delay) + 13-14 (migration/POS) là **conditional cost** không gộp vào baseline.

## 3. Khi nào dùng Lean / Standard / Safe

| Scenario | Khi nào chọn |
|---|---|
| **Lean (~7.16 tỷ)** | Reborn cam kết reuse retail 60%+; team toàn senior đa năng; TNPM chấp nhận risk; có experience build property mgmt trước đó. |
| **Standard (~8.16 tỷ)** | Mặc định. TNTech và Reborn chia sẻ risk. Trường hợp baseline để negotiate với TNPM. |
| **Safe (~9.05 tỷ)** | NHNN compliance scope đầy đủ; có CĐT lớn cần SSO; có data migration phức tạp; risk pentest tight. |

## 4. Đề xuất

Dùng **Standard 8.16 tỷ** làm cost basis chào TNTech. Trong nội bộ Reborn × TNTech align:
- Nếu TNTech contribute 30% effort (do TNTech có team) → Reborn cost basis còn ~5.71 tỷ.
- Nếu Reborn 100% effort (TNTech chỉ làm partner sale) → Reborn cost basis 8.16 tỷ, margin chia với TNTech theo % deal.

Chi tiết engagement model ở [`../07-business-case/engagement-models.md`](../07-business-case/engagement-models.md).
