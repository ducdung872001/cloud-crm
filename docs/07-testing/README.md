# 07-Testing — QA Documentation

Tài liệu kiểm thử cho **Reborn Loyalty Platform**, theo chuẩn **ISTQB Foundation**.

## File trong folder

| File | Mô tả |
|---|---|
| [`test-strategy.md`](test-strategy.md) | (TBD) Chiến lược test tổng thể: scope, levels, environments |
| [`testcases-legacy-retail.md`](testcases-legacy-retail.md) | Test cases kế thừa từ retail (~51 suites, ~895 steps). Cần lọc lại các test áp dụng cho loyalty |
| [`validation-audit.md`](validation-audit.md) | Validation audit (OWASP-based) |
| [`uncertain-bugs.md`](uncertain-bugs.md) | Bugs đang điều tra |
| [`bug-reports/`](bug-reports/) | Bug report từ tester thực tế (CSV + Excel trong `../_assets/bug-reports/`) |

## Test pyramid

```
        /\
       /  \ E2E (Playwright, ~5%)
      /----\
     /      \ Integration (~25%)
    /--------\
   /          \ Unit (~70%)
  /____________\
```

## Test environments

| Env | Mục đích | Data |
|---|---|---|
| Local dev | Developer write + run unit + integration | Synthetic, docker-compose |
| CI | Auto run on PR | Synthetic |
| Staging | Manual UAT + E2E + load test | Anonymized prod copy |
| Sandbox | KH UAT, POS integration test | Sandbox API key |
| Production | Smoke only post-deploy | Real |

## Test types

| Type | Target | Tool |
|---|---|---|
| Unit | Functions, validators | Jest / JUnit |
| Integration | Service + DB | Testcontainers |
| Contract | API contract | Pact / Spring Cloud Contract |
| E2E | Critical user journey | Playwright |
| Load | 500 TPS auto-earn | k6 / Locust |
| Security | OWASP, fuzzing | ZAP, Burp |
| Acceptance | UAT scenarios | Manual + Playwright |
| Smoke | Post-deploy basic flow | Playwright |
| Chaos | Resilience | Litmus (k8s) |

## KPI testing

| KPI | Target |
|---|---|
| Code coverage | ≥ 70% (target 80%) |
| Critical path E2E pass | 100% |
| Load test 500 TPS | Pass with P95 < 500ms |
| Security scan | 0 critical findings |
| Regression test (release) | 100% prior bugs not reopened |

## Test cases for Loyalty (next steps)

> ⚠️ `testcases-legacy-retail.md` chứa test cases cho retail generic (POS, kho, ...). Cần rewrite focused cho loyalty:
> - TC-LOY-* suites: membership, points, tier, rewards, campaigns, cross-brand, POS integration, CSKH
> - Estimated ~30 suites, 500+ steps cho loyalty

## Tham chiếu

- URD (input cho test design): [`../02-requirements/`](../02-requirements/)
- Acceptance criteria: [`../08-operations/acceptance-criteria.md`](../08-operations/acceptance-criteria.md)
- Quality attributes: [`../03-architecture/part-10-quality-attributes.md`](../03-architecture/part-10-quality-attributes.md)
