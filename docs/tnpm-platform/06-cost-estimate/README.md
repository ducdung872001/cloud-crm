# 06. Cost Estimate — Build TNPM Platform From Scratch

> **Mục đích**: Cung cấp cost basis (input chi phí xây mới) cho Reborn × TNTech lên Phương án Kinh doanh.
> **Đây KHÔNG phải pricing gửi khách hàng** — đây là **cost** (chi phí Reborn/TNTech bỏ ra). Pricing/quotation sẽ được build riêng ở [`../07-business-case/`](../07-business-case/engagement-models.md).

## 1. TL;DR

| Hạng mục | Giá trị |
|---|---:|
| **Scope** | Web Admin + 12 microservice BE (Phase 1–3) + Owner/Vendor Portal + Integration MSB/Timi/VNPay/MoMo |
| **Currency** | VND (blended Vietnam rate) |
| **Methodology** | Bottom-up theo man-month per module |
| **Direct labor** | **5.63 tỷ VND** |
| **Indirect (infra, tools, 3rd party)** | **0.90 tỷ VND** |
| **Contingency (15%) + Overhead (10%)** | **1.63 tỷ VND** |
| **TỔNG cost build-from-scratch (Standard)** | **~8.16 tỷ VND** (≈ $333k USD) |
| **Range theo scenario** | **7.16 – 9.05 tỷ VND** (Lean ↔ Safe) |
| **Effort tổng** | **143 man-month direct labor (gồm 10 MM onboarding/KT buffer)** |
| **BUILD timeline** *(xây platform mới, KHÔNG phải HLD rollout)* | **6-9 tháng calendar** với team 9-11 người parallel; 9-12 tháng với team gọn 7 người |
| **ROLLOUT timeline (HLD, OPEX)** | 20 tuần (4 phase × ~5 tuần) — chỉ bắt đầu **sau khi build xong**, là deploy + UAT cho 7 loại property |
| **Out-of-scope** (cộng riêng) | Mobile cư dân Timi-like (+1.5 tỷ), AI debt analytics (+800M), POS integration (variable), Data migration (variable) |
| **OPEX vận hành** | Xem [`opex.md`](./opex.md) — 4 segment S/M/L/XL. TNPM ROX Key likely L = **8.82 tỷ/năm PlatOps + 5.52 tỷ/năm Pass-through** |

## 2. Cấu trúc tài liệu cost

- [`THUYET_MINH_CHI_PHI_NEN_TANG_TNPM.docx`](./THUYET_MINH_CHI_PHI_NEN_TANG_TNPM.docx) — **★ Bản thuyết minh chi phí** bóc tách 5.63 tỷ (Reborn IP creation) vs 8.16 tỷ (rollout customer #1) + danh sách feature scope. Định dạng docx để gửi nội bộ Reborn × TNTech.
- [`methodology.md`](./methodology.md) — Cách tính CAPEX: role rate VND, công thức bottom-up, MM per module, assumption.
- [`opex.md`](./opex.md) — **OPEX vận hành**: 4 segment S/M/L/XL, PlatOps + Pass-through, TCO 3 năm.
- [`risk-buffer.md`](./risk-buffer.md) — Cách buffer rủi ro vào cost.
- [`COST_ESTIMATE.xlsx`](./COST_ESTIMATE.xlsx) — File xlsx tương tác — **9 sheet**:
  - CAPEX: `Assumptions` · `Effort_by_Module` · `Indirect_Costs` · `Summary` · `Scenario_Comparison`
  - OPEX: `OPEX_Segments` · `OPEX_PlatOps` · `OPEX_PassThrough` · `OPEX_Summary` (TCO 3 năm)

## 3. Cách dùng tài liệu này cho buổi làm việc với TNTech

1. **Mở [`COST_ESTIMATE.xlsx`](./COST_ESTIMATE.xlsx)** — 9 sheet, 2 cụm:

   **Cụm CAPEX (xây mới):**
   - `Assumptions` — Rate role + tham số global (contingency, overhead %).
   - `Effort_by_Module` — MM per module × role.
   - `Indirect_Costs` — Infra build period, tools, 3rd party.
   - `Summary` — Tổng hợp + 3 scenario (lean / standard / safe).
   - `Scenario_Comparison` — Sensitivity + out-of-scope add-ons.

   **Cụm OPEX (vận hành hàng năm):**
   - `OPEX_Segments` — Định nghĩa 4 segment S/M/L/XL (volume input).
   - `OPEX_PlatOps` — Platform Operating Cost / segment (Reborn gánh).
   - `OPEX_PassThrough` — Usage cost / segment (TNPM gánh).
   - `OPEX_Summary` — Tổng OPEX/năm + **TCO 3 năm cho TNPM** (CAPEX + 3 năm SaaS).

2. **TNTech align rate**: Nếu TNTech có rate sheet khác (ví dụ outsource Bangladesh thấp hơn, hoặc team senior cao hơn), chỉnh ở sheet `Assumptions` → các sheet khác tự update qua formula.

3. **Reborn × TNTech align scope**: Nếu một số module muốn TNTech làm hoặc Reborn làm → mark ownership trong sheet `Effort_by_Module` cột "Owner".

4. **Output cuối**: Sau khi align, sheet `Summary` cho ra **3 scenario** (lean / standard / safe) → chọn 1 làm baseline để build **Pricing** cho TNPM ở phase business case sau.

## 4. Tóm tắt 3 scenario

| Scenario | Direct Labor | Indirect | **Tổng** | Khi nào dùng |
|---|---:|---:|---:|---|
| **Lean** (DL −10%, contingency 10%, overhead 10%) | 5.06 tỷ | 0.90 tỷ | **~7.16 tỷ** | Khi Reborn cam kết reuse retail ≥60%, team senior đa năng, ít risk |
| **Standard** (contingency 15%, overhead 10%) | 5.63 tỷ | 0.90 tỷ | **~8.16 tỷ** | Baseline khuyến nghị để chào TNTech |
| **Safe** (contingency 25%, IC +20% infra buffer) | 5.63 tỷ | 1.08 tỷ | **~9.05 tỷ** | NHNN compliance + multi-tenant risk cao, có data migration |

Khuyến nghị: **dùng Standard ~8.16 tỷ** làm cost basis chính, có Lean/Safe để negotiate.

## 5. Quan hệ Cost ↔ Pricing (cho buổi sau)

Cost basis này là **chi phí Reborn + TNTech bỏ ra để xây**. Khi đi đến Pricing cho TNPM:

- **Cost-plus**: Pricing = Cost × (1 + margin). Margin thường 30-50% cho dự án custom build → giá chào TNPM ~10.6-12.2 tỷ (từ baseline Standard 8.16 tỷ).
- **Value-based**: Tham chiếu giá market property management platform tại VN (Yardi, MRI Software, Building Engines... cost license + impl 8-15 tỷ cho deployment tương đương).
- **Hybrid với revenue share**: License + % saving operational cost mà TNPM thu được.

Chi tiết engagement model + pricing strategy sẽ ở [`../07-business-case/`](../07-business-case/engagement-models.md) — bước tiếp theo sau khi cost align xong với TNTech.

## 6. Caveat & Assumption chính

1. Rate VND **blended Vietnam mid-tier** (mix 30-50% senior, 50-70% mid). Nếu team toàn senior → cost cao hơn 20-30%.
2. Cost **không bao gồm** mobile cư dân, AI debt, POS integration, data migration, hotline call center.
3. Cost **không bao gồm** annual maintenance fee — typically 15-20% cost build/năm, sẽ tính riêng trong pricing.
4. Cost **bao gồm** dev + QA + DevOps + PM + BA + UX/UI + security review + 30 ngày warranty post-go-live.
5. Cost **giả định** Reborn tái sử dụng được infra cloud hiện tại (K8s, monitoring stack). Nếu phải provisioning mới → cộng thêm ~200M setup.
6. Cost **giả định** team co-located Vietnam, không có chi phí travel/relocation.
7. Cost **giả định** TNPM cung cấp đầy đủ stakeholder để review/UAT đúng tiến độ — delay từ phía TNPM không tính vào cost.
