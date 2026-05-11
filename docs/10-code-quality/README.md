# 10-Code Quality — Báo cáo chất lượng codebase

Báo cáo audit chất lượng codebase Reborn Loyalty (FE React 18 + TypeScript).

| File | Mô tả |
|---|---|
| [`code-review.md`](code-review.md) | Code review report tổng hợp |
| [`dead-code-audit.md`](dead-code-audit.md) | Dead code phát hiện qua scan |
| [`frontend-review.md`](frontend-review.md) | Review FE chi tiết |
| [`tech-debt-inventory.md`](tech-debt-inventory.md) | Inventory tech debt (theo module) |
| [`scan-results.md`](scan-results.md) | Tóm tắt kết quả scan tự động |

## Khi nào cập nhật

| Trigger | File update |
|---|---|
| Sau release lớn | `code-review.md` |
| Sau scan tools (ESLint, depcheck, SonarQube) | `dead-code-audit.md`, `scan-results.md` |
| Khi phát hiện debt mới | Append vào `tech-debt-inventory.md` |
| Khi resolve debt | Mark resolved + archive |

## Auto-clean policy

Theo memory project: **sau mỗi test PASS** → auto-rà `tech-debt-inventory.md` để archive item đã resolve, không đợi user nhắc.

## Tham chiếu

- Quality attributes (architecture): [`../03-architecture/part-10-quality-attributes.md`](../03-architecture/part-10-quality-attributes.md)
- NFR maintainability: [`../02-requirements/part-12-nfr.md#5-maintainability`](../02-requirements/part-12-nfr.md)
- Testing strategy: [`../07-testing/test-strategy.md`](../07-testing/test-strategy.md)
