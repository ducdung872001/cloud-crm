# 08-Operations — Triển khai & Vận hành

Tài liệu vận hành cho **Reborn Loyalty Platform**, theo chuẩn **PMBOK 7th** (project mgmt) + **ITIL v4** (service mgmt).

## File trong folder

| File | Đối tượng | Mô tả |
|---|---|---|
| [`deployment-guide.md`](deployment-guide.md) | DevOps, SRE | Hướng dẫn triển khai từng môi trường |
| [`data-migration-plan.md`](data-migration-plan.md) | Migration PM, DBA | Kế hoạch chuyển đổi data từ Goldmem/Access/Excel/Supporter |
| [`operations-runbook.md`](operations-runbook.md) | Ops, SRE | Runbook xử lý sự cố, daily ops procedures |
| [`risk-register.md`](risk-register.md) | PM, BOD | Sổ rủi ro full project + mitigations |
| [`acceptance-criteria.md`](acceptance-criteria.md) | KH, PM | Tiêu chí nghiệm thu 3 phase |

## Vòng đời vận hành

```
   Plan (PMBOK)
       │
       ▼
   Deploy (CI/CD blue-green)
       │
       ▼
   Migrate data (Goldmem → Reborn)
       │
       ▼
   Run (ITIL: Incident, Problem, Change, Service Request)
       │
       ▼
   Monitor (Prometheus + alerts)
       │
       ▼
   Improve (post-mortem, retrospective)
```

## Key milestones (lộ trình 6 tháng)

| Phase | Tháng | Milestone |
|---|---|---|
| 1 | M1-M2 | Pilot 5-10 store Brand A, import 1.000 KH thử |
| 2 | M3-M4 | Brand B integrate, rollout 300 store, cross-brand bật |
| 3 | M5-M6 | Import full 3M, marketing automation, training, bàn giao |

Chi tiết tiêu chí: [`acceptance-criteria.md`](acceptance-criteria.md).

## Liên hệ ops

| Vai trò | Liên hệ |
|---|---|
| DevOps Lead Reborn | (TBD) |
| Customer Phòng CNTT&CĐS | (TBD) |
| Reborn 24/7 hotline | (TBD, go-live) |
| Email support | `support@reborn.vn` |

## Tham chiếu

- Architecture deployment: [`../03-architecture/part-08-deployment.md`](../03-architecture/part-08-deployment.md)
- Scalability: [`../03-architecture/part-07-scalability-3m-customers.md`](../03-architecture/part-07-scalability-3m-customers.md)
- Migration strategy chi tiết: [`../06-analysis/data-migration-strategy.md`](../06-analysis/data-migration-strategy.md)
