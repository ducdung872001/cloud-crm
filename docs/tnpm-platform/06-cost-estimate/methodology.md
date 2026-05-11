# Methodology — Cách tính CAPEX build-from-scratch

> File này tính **CAPEX (cost xây mới)** — chi phí một lần để có platform hoàn chỉnh sẵn sàng rollout.
> Cho OPEX (chi phí vận hành hàng năm) xem [`opex.md`](./opex.md).
>
> ## Phân biệt cốt lõi
> | | Build (file này) | Rollout (HLD) |
> |---|---|---|
> | **Mục đích** | Xây platform có **toàn bộ feature Phase 1-3** | Deploy + UAT cho 7 loại property dần dần |
> | **Timeline** | 6-9 tháng calendar | 20 tuần (chỉ bắt đầu sau khi build xong) |
> | **Loại chi phí** | CAPEX (1 lần) | OPEX (hàng năm) |
> | **Cost** | ~8.16 tỷ Standard | Xem [`opex.md`](./opex.md) per segment |
>
> Cost trong file này KHÔNG bao gồm rollout effort (rollout effort thuộc OPEX support team + L1/L2/L3).

## 1. Nguyên tắc

- **Bottom-up estimation theo man-month per module × per role.** Không dùng top-down LOC × $/LOC vì dễ bị challenge.
- **Đơn vị**: Man-Month (MM) — 1 MM = 1 người làm việc 22 ngày × 8 giờ = 176 giờ effective effort.
- **Currency**: VND. Quy đổi USD ở 1 USD = 24,500 VND (mid-rate 2026).
- **Rate**: Blended Vietnam mid-tier IT outsourcing 2026 (đối chiếu báo cáo TopDev / VietnamWorks / TalentNet 2025).
- **Scope**: Phase 1–3 HLD + Owner/Vendor Portal + Integration MSB/Timi/VNPay/MoMo. **Không** bao gồm mobile cư dân, AI debt, POS, data migration.

## 2. Role & Rate (VND/MM blended)

| Role | Rate VND/MM | Ghi chú |
|---|---:|---|
| **Tech Lead / Solution Architect** | 60,000,000 | 10+ yrs, decision maker kiến trúc |
| **Senior Backend Engineer** | 50,000,000 | 7-10 yrs, Java/Spring/Kafka |
| **Mid Backend Engineer** | 35,000,000 | 3-5 yrs |
| **Senior Frontend Engineer** | 45,000,000 | 5+ yrs, React/TS |
| **Mid Frontend Engineer** | 30,000,000 | 2-4 yrs |
| **DevOps / Platform Engineer** | 45,000,000 | K8s, Kafka, ES, monitoring |
| **Security Engineer** | 50,000,000 | Pentest, NHNN compliance review |
| **QA Lead / Test Architect** | 35,000,000 | Test strategy, automation lead |
| **QA Engineer (manual + automation)** | 22,000,000 | E2E, smoke, regression |
| **Project Manager** | 40,000,000 | Schedule, stakeholder, risk |
| **Business Analyst** | 35,000,000 | Spec, user story, UAT support |
| **UX/UI Designer** | 35,000,000 | Wireframe, design system, prototype |

> Rate ở mức blended Vietnam mid-tier 2026. Đây là **cost** (loaded cost cho công ty: lương + benefit + overhead + utilization 80%), **không phải lương net** của nhân sự.
> Vietnam outsourcing rate range hiện tại theo report TopDev 2025: Junior 18-25M, Mid 30-40M, Senior 45-65M, Tech Lead 60-80M/MM (loaded). Cost ở đây dùng giá trị trung vị.

## 3. Mix role per module (effort distribution)

Mỗi module BE giả định mix:
- 50% effort: Senior BE
- 50% effort: Mid BE

Mỗi module FE giả định mix:
- 30% effort: Senior FE
- 70% effort: Mid FE

QA mix:
- 35% effort: QA Lead
- 65% effort: QA Engineer

Cross-cutting role (TL, PM, BA, UX, DevOps, Security): 1 người, full effort.

## 4. Công thức tổng

```
Cost_module = Σ (MM_role × Rate_role)
Direct_Labor = Σ Cost_module + Σ Cost_cross_cutting
Indirect = Infra + Tools + 3rd_party
Contingency = (Direct_Labor + Indirect) × contingency%
Overhead = (Direct_Labor + Indirect) × overhead%
TOTAL = Direct_Labor + Indirect + Contingency + Overhead
```

**Tham số mặc định (Standard scenario)**:
- contingency% = 15%
- overhead% (PM admin, infra share, license amortization) = 10%

## 5. Effort estimate per module (input chính của bottom-up)

> **Lưu ý**: Tên "Phase 1/2/3" dưới đây **mượn tên từ HLD rollout** để dễ tra cứu — đây là **gom nhóm module theo độ ưu tiên feature**, KHÔNG phải sprint phase. Toàn bộ phải được **build xong trước khi rollout** Phase 1 HLD bắt đầu.

### Module nhóm 1 (~46 MM) — nền tảng & feature B2C cơ bản (Foundation)

| Module / Service | BE Senior | BE Mid | FE Senior | FE Mid | QA Lead | QA Eng | Total MM |
|---|---:|---:|---:|---:|---:|---:|---:|
| iam-service (multi-tenant, RBAC, OAuth2) | 1.5 | 2.5 | — | — | — | — | 4.0 |
| portfolio-service (8 NEW endpoint) | 1.0 | 1.0 | — | — | — | — | 2.0 |
| customer-service (REUSE+extend) | 0.5 | 1.0 | — | — | — | — | 1.5 |
| contract-service P1 (service contract) | 1.0 | 1.5 | — | — | — | — | 2.5 |
| billing-service P1 (fee, rate, meter, invoice base) | 2.0 | 3.0 | — | — | — | — | 5.0 |
| payment-service P1 (cash, debt, MSB/Timi base) | 1.5 | 2.0 | — | — | — | — | 3.5 |
| operations-service P1 (SR, ticket) | 1.0 | 1.0 | — | — | — | — | 2.0 |
| notification-service P1 (template SMS/Email) | 0.5 | 1.0 | — | — | — | — | 1.5 |
| FE P1 (~12 page) | — | — | 2.5 | 5.5 | — | — | 8.0 |
| QA P1 (smoke + E2E + integration) | — | — | — | — | 1.5 | 4.5 | 6.0 |
| **Phase 1 subtotal** | **9.0** | **13.0** | **2.5** | **5.5** | **1.5** | **4.5** | **36.0** |

> Plus cross-cutting share P1 (TL 2.5 + PM 2.5 + BA 2 + UX 1.5 + DevOps 1.5) = **10.0 MM** → Phase 1 tổng **46 MM**.

### Module nhóm 2 (~30 MM) — Payment full + Vendor lifecycle

| Module / Service | BE Senior | BE Mid | FE Senior | FE Mid | QA Lead | QA Eng | Total MM |
|---|---:|---:|---:|---:|---:|---:|---:|
| payment-service full (gateway + auto-debit + webhook) | 1.5 | 1.5 | — | — | — | — | 3.0 |
| vendor-service (NEW 12 endpoint) | 3.5 | 4.5 | — | — | — | — | 8.0 |
| notification-service P2 (campaign + template engine) | 0.5 | 1.5 | — | — | — | — | 2.0 |
| report-service P2 (P&L per project) | 0.5 | 1.5 | — | — | — | — | 2.0 |
| FE P2 (~6 page vendor + invoice + KPI + gateway settings + partner) | — | — | 2.0 | 4.0 | — | — | 6.0 |
| QA P2 | — | — | — | — | 1.0 | 3.0 | 4.0 |
| **Phase 2 subtotal** | **6.0** | **9.0** | **2.0** | **4.0** | **1.0** | **3.0** | **25.0** |

> Plus cross-cutting P2 (TL 1.5 + PM 1.5 + BA 1 + UX 0.5 + DevOps 0.5) = **5.0 MM** → Phase 2 tổng **30 MM**.

### Module nhóm 3 (~30 MM) — Lease nâng cao + Retail (TTTM) + B2G

| Module / Service | BE Senior | BE Mid | FE Senior | FE Mid | QA Lead | QA Eng | Total MM |
|---|---:|---:|---:|---:|---:|---:|---:|
| contract-service lease nâng cao (escalation, deposit, auto-renew) | 1.5 | 1.5 | — | — | — | — | 3.0 |
| billing-service CAM + Turnover Rent | 2.0 | 2.0 | — | — | — | — | 4.0 |
| compliance-service B2G + audit log + tenant scan (NEW 10 endpoint) | 3.5 | 4.5 | — | — | — | — | 8.0 |
| operations-service Maintenance Plan + SLA | 1.0 | 1.0 | — | — | — | — | 2.0 |
| notification-service auto rule (12 NEW endpoint) | 0.5 | 1.0 | — | — | — | — | 1.5 |
| FE P3 (~10 page: lease 4 tab, CAM, turnover, B2G, maintenance, audit log) | — | — | 2.0 | 4.0 | — | — | 6.0 |
| QA P3 | — | — | — | — | 1.0 | 3.0 | 4.0 |
| **Phase 3 subtotal** | **8.5** | **10.0** | **2.0** | **4.0** | **1.0** | **3.0** | **28.5** |

> Plus cross-cutting P3 (TL 1.5 + PM 1.5 + BA 1.5 + UX 1 + DevOps 1) = **6.5 MM** → Phase 3 tổng **35 MM** (hơn 30 do B2G mới phức tạp). Round-up tổng 3 phase ≈ **111 MM** content + 20 MM cross-cutting baseline + 11.5 MM portal & integration → **142.5 MM**.

### Owner/Vendor Portal + Integration (11.5 MM, không thuộc 3 phase trên — chạy parallel)

| Hạng mục | BE Senior | BE Mid | FE Senior | FE Mid | Total MM |
|---|---:|---:|---:|---:|---:|
| Portal auth domain (separate IAM + magic link + OTP) | 1.0 | 1.0 | — | — | 2.0 |
| Owner Portal UI (read-only dashboard CĐT) | — | — | 0.5 | 1.5 | 2.0 |
| Vendor Portal UI (NCC submit invoice, approval status) | — | — | 0.5 | 1.5 | 2.0 |
| Integration adapter MSB/Timi/VNPay/MoMo (4 adapter + webhook + idempotency + HMAC) | 1.5 | 2.0 | — | — | 3.5 |
| Portal QA + integration test | — | — | — | — | 2.0 (QA) |
| **Subtotal** | **2.5** | **3.0** | **1.0** | **3.0** | **11.5** |

### Cross-cutting (toàn dự án, 20 MM)

| Role | MM | Mục đích |
|---|---:|---|
| Tech Lead / Architect | 7.0 | Decision kiến trúc, code review, mentoring |
| DevOps / Platform | 6.0 | Setup K8s, RabbitMQ/Kafka, ES, Prometheus, Grafana, CI/CD, secret mgmt |
| Security Engineer | 2.0 | Pentest, NHNN compliance review, audit log design, threat model |
| PM | 7.0 | Schedule, stakeholder, risk, billing milestone |
| BA | 6.0 | Refine spec, user story, UAT support, edge case |
| UX/UI Designer | 4.0 | Design system extension cho TNPM, wireframe vendor portal & owner portal |

**Tổng cross-cutting**: 32 MM (đã phân bổ một phần vào từng phase + có một phần overhead khắp dự án).

## 6. Tổng MM dự kiến

| Bucket | MM |
|---|---:|
| Module nhóm 1 (Foundation) | 36 |
| Module nhóm 2 (Payment + Vendor) | 25 |
| Module nhóm 3 (Lease + Retail + B2G) | 28.5 |
| Portal + Integration | 11.5 |
| Cross-cutting (TL + DevOps + Sec + PM + BA + UX) | 32 |
| Knowledge transfer + onboarding + ramp-up buffer | 10 |
| **TỔNG MM** | **143** |

**Quy đổi sang calendar time**:
- Team 9-11 người parallel (~7-8 FTE effective): 143 / 8 ≈ **18 tháng-người ÷ 8 song song ≈ 6-9 tháng calendar** tuỳ overlap.
- Team gọn 7 người: ≈ 9-12 tháng calendar.
- Critical path không cho phép parallel hơn 11 người (vì có dependency IAM → portfolio → contract → billing).

## 7. Indirect costs

| Hạng mục | Giá trị | Ghi chú |
|---|---:|---|
| Cloud infra dev/staging/prod (18 tháng) | 600,000,000 | K8s, DB, Redis, ES, RabbitMQ, monitoring |
| Tools & License | 100,000,000 | Jira/Confluence, Figma Pro, GitLab Premium, security scanning (Snyk/SonarQube) |
| 3rd-party (pentest, MSB cert, Timi API access, sInvoice license) | 200,000,000 | Pentest 1 round 80M + MSB onboarding 50M + Timi 30M + sInvoice 40M |
| **Subtotal Indirect** | **900,000,000** | |

## 8. Buffer & Overhead

| Hạng mục | Mức | Giá trị (VND) |
|---|---:|---:|
| Direct Labor (xem [`COST_ESTIMATE.xlsx`](./COST_ESTIMATE.xlsx) sheet `Effort_by_Module`) | — | 5,625,250,000 |
| Indirect Costs | — | 900,000,000 |
| **Subtotal trước buffer** | — | **6,525,250,000** |
| Contingency (Standard 15%) | 15% × subtotal | 978,787,500 |
| Project Overhead (10%) | 10% × subtotal | 652,525,000 |
| **TỔNG cost build-from-scratch (Standard)** | — | **~8,156,562,500** |

> Round: **~8.16 tỷ VND** (≈ $333k USD). Đây là số canonical, đồng bộ với xlsx.

## 9. So sánh 3 scenario

| Scenario | Contingency | Overhead | Direct Labor adj | Indirect adj | TỔNG |
|---|---:|---:|---:|---:|---:|
| **Lean** | 10% | 10% | −10% (reuse mạnh tay) | base | ~7.16 tỷ |
| **Standard** | 15% | 10% | base | base | ~8.16 tỷ |
| **Safe** | 25% | 10% | base | +20% (infra/security buffer) | ~9.05 tỷ |

## 10. Assumption ghi rõ

1. **Team co-located Vietnam**. Không có chi phí travel/relocation/H1B.
2. **Productive utilization 80%** đã được tính vào rate VND/MM.
3. **Reborn tái sử dụng infra cloud hiện tại** (K8s namespace, monitoring stack). Chỉ provision thêm cho TNPM tenant.
4. **TNPM cung cấp đầy đủ stakeholder review/UAT** đúng tiến độ. Delay từ phía TNPM tính phí riêng theo T&M.
5. **Bao gồm 30 ngày warranty** post-go-live. Annual maintenance fee (15-20% cost build/năm) sẽ tính riêng trong pricing.
6. **Không bao gồm** mobile cư dân (+1.5 tỷ), AI debt (+800M), POS integration (variable), data migration (variable), hotline (variable).
7. **TNTech contribute** một phần effort hay không sẽ ảnh hưởng cost actual — cost basis này tính toàn bộ effort, sau đó Reborn × TNTech sẽ chia phần theo engagement model ở `07-business-case/`.
