# docs/ — Index

> Cập nhật: 2026-05-11. Sau khi dọn dẹp + chuẩn hoá theo nhánh `reborn-tnpm`.

## 4 thư mục chính

| Folder | Mục đích | Scope |
|---|---|---|
| [`tnpm-platform/`](./tnpm-platform/README.md) | **Single source of truth cho TNPM Platform** — context, scope, architecture, roadmap, cost estimate build-from-scratch, business case | Branch-specific (reborn-tnpm) |
| [`backend-tasks/`](./backend-tasks/README.md) | Handoff task cho từng microservice BE (billing, care, contract, customer, finance, integration, inventory, logistics, market, notification, operation, sales) | Cross-branch shared |
| [`handoff/`](./handoff/) | Audit FE↔BE, microservice map ecosystem, backend setup | Cross-branch shared |
| [`forms/`](./forms/) | Template form / xlsx ràng buộc nghiệp vụ | Cross-branch shared |

## Bắt đầu từ đâu

- **Tổng quan TNPM Platform + Cost estimate**: vào [`tnpm-platform/README.md`](./tnpm-platform/README.md).
- **Cần tra endpoint backend cụ thể**: vào [`tnpm-platform/03-architecture/api-spec.md`](./tnpm-platform/03-architecture/api-spec.md).
- **Status hiện tại FE↔BE (audit)**: vào [`handoff/AUDIT_TNPM_API_INTEGRATION.md`](./handoff/AUDIT_TNPM_API_INTEGRATION.md).
- **Task handoff BE per service**: vào [`backend-tasks/`](./backend-tasks/).

## Lịch sử dọn dẹp 2026-05-11

Đã loại bỏ các thư mục sau (out-of-date hoặc đã merge vào `tnpm-platform/`):

- `docs/tnpm/` → BACKEND_API_SPEC + TEST_STRATEGY chuyển vào `tnpm-platform/03-architecture/` + `tnpm-platform/05-current-state/`. HLD_IMPLEMENTATION_SUMMARY.md (snapshot 2026-04-14) bị xoá.
- `docs/urd/` → PDF + PPTX gốc của HLD chuyển vào `tnpm-platform/99-source-archive/`.
- `docs/requirements/` → Sample data KCT + VP&TTTM chuyển vào `tnpm-platform/99-source-archive/sample-data/`.
- `docs/roadmap/` → Chỉ giữ `CRM_Roadmap_v2_enhanced.xlsx` trong `tnpm-platform/99-source-archive/`. v0 + v1_filled bị xoá.
