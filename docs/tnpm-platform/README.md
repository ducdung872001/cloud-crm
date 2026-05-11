# TNPM Platform — Tài liệu chuẩn hoá

> Cập nhật: 2026-05-11
> Nhánh: `reborn-tnpm`
> Mục đích: Chuẩn hoá toàn bộ tài liệu nghiệp vụ + kỹ thuật + cost estimate cho nền tảng Property Management TNPM (ROX Key), phục vụ Reborn × TNTech lên Phương án Kinh doanh với TNPM là happy case đầu tiên.

---

## 1. Bối cảnh thư mục này

Trước đây tài liệu TNPM phân mảnh ở 5 chỗ. Sau khi chuẩn hoá ngày 2026-05-11:

| Vị trí cũ | Nội dung | Hành động đã làm |
|---|---|---|
| `docs/tnpm/` *(đã xoá)* | HLD summary, API spec, test strategy | API spec → `03-architecture/api-spec.md`; Test strategy → `05-current-state/test-strategy.md`; HLD summary cũ (2026-04-14) → **xoá** (out-of-date, đã merge vào `05-current-state/fe-be-coverage.md`) |
| `docs/urd/` *(đã xoá)* | TNPM_HLD_v2.pdf + pptx (partner gửi) | Move sang `99-source-archive/` |
| `docs/requirements/20260511/Phase1/` *(đã xoá)* | Dữ liệu mẫu KCT + VP&TTTM | Move sang `99-source-archive/sample-data/` |
| `docs/roadmap/` *(đã xoá)* | xlsx Kế hoạch triển khai CRM (3 version) | Giữ v2_enhanced trong `99-source-archive/`; **xoá** v0 + v1_filled (out-of-date) |
| `docs/handoff/` *(giữ)* | Audit FE↔BE, microservice map, backend setup | Cross-branch shared — link reference từ đây |
| `docs/backend-tasks/` *(giữ)* | Handoff microservice tasks | Cross-branch shared |
| `docs/forms/` *(giữ)* | Template form HĐ dịch vụ | Cross-branch shared |

Sau khi chuẩn hoá, **đây là single source of truth** cho mọi câu hỏi về nền tảng TNPM.

---

## 2. Navigation

| # | Folder | Nội dung | Đọc khi nào |
|---|---|---|---|
| 01 | [`01-context/`](./01-context/business-context.md) | Bối cảnh TNPM, 7 loại BĐS, stakeholder, KPI/SLA HLD | Bắt đầu từ đây nếu chưa biết TNPM là ai |
| 02 | [`02-scope/`](./02-scope/module-catalog.md) | 8 module nghiệp vụ + NFR + Out-of-scope | Để hiểu phạm vi nền tảng |
| 03 | [`03-architecture/`](./03-architecture/microservices.md) | 12 microservice, data model, integration MSB/Timi, multi-tenant | Khi cần thiết kế / estimate kỹ thuật |
| 04 | [`04-roadmap/`](./04-roadmap/phase-plan.md) | Phase 1–4 (T1–T20), deliverable từng phase | Khi lập kế hoạch sprint / billing milestone |
| 05 | [`05-current-state/`](./05-current-state/fe-be-coverage.md) | Trạng thái prototype hiện tại (22 trang FE đã build, audit BE gap) | Khi cần biết "đã có gì rồi" để khấu trừ effort |
| 06 | [`06-cost-estimate/`](./06-cost-estimate/README.md) | **CAPEX (build-from-scratch) + OPEX (vận hành) — VND, bottom-up** | Đầu vào chính cho Phương án Kinh doanh |
| 07 | [`07-business-case/`](./07-business-case/engagement-models.md) | Engagement model + pricing strategy (placeholder cho bước sau) | Sau khi Reborn × TNTech align cost |
| 99 | [`99-source-archive/`](./99-source-archive/) | File gốc partner gửi (PDF/PPTX/XLSX), không sửa | Khi cần đối chiếu tài liệu nguồn |

---

## 3. TL;DR cho người không có thời gian đọc hết

- **TNPM** vận hành **7 loại bất động sản** (chung cư, villa, văn phòng, KCN, TTTM, khu HC B2G, tiện ích đơn lẻ) — multi-tenant per project.
- **Phạm vi platform** = Web Admin (FE) + 12 microservice BE + Owner/Vendor Portal + integration MSB/Timi/VNPay/MoMo.
- **Khác CRM retail**: lease escalation, CAM allocation, turnover rent (% doanh thu), vendor 3-way match, B2G workflow kho bạc.
- **HLD roadmap 4 phase × 20 tuần là ROLLOUT timeline** (deploy + UAT cho 7 loại property dần dần), KHÔNG phải build timeline. Platform phải **build xong toàn bộ trước khi rollout** Phase 1 bắt đầu.
- **BUILD timeline**: ~6-9 tháng calendar với team 9-11 người (143 man-month effort).
- **CAPEX build-from-scratch (Phase 1–3 + Portal + Integration)** Standard ≈ **8.16 tỷ VND** (≈ $333k USD), range Lean–Safe **7.16 – 9.05 tỷ VND**.
- **OPEX vận hành** *(theo 4 segment S/M/L/XL — TNPM ROX Key likely L)*: PlatOps ~8.82 tỷ/năm + Pass-through ~5.52 tỷ/năm = **~14.34 tỷ/năm tổng OPEX L**. Xem [`06-cost-estimate/opex.md`](./06-cost-estimate/opex.md).
- **Prototype hiện tại**: 22 trang FE TNPM đã build (~15,600 LOC), 1 trang wire BE thật, còn lại MOCK — đây là cơ sở để Reborn chứng minh capability với TNTech.

---

## 4. Câu hỏi thường gặp khi đọc bộ tài liệu

**Q: Cost 8.16 tỷ này đã gồm mobile app cư dân chưa?**
Chưa. Mobile (Timi-like, React Native) ngoài scope đã chốt. Nếu cần, cộng thêm ~1.5 tỷ VND (xem sheet `Scenario_Comparison` trong xlsx).

**Q: 8.16 tỷ này build xong trong bao lâu?**
~6-9 tháng calendar với team 9-11 người (143 man-month effort). KHÔNG phải 20 tuần HLD — 20 tuần đó là rollout, chỉ bắt đầu sau khi platform build xong.

**Q: Vận hành platform một năm hết bao nhiêu?**
Tuỳ quy mô. TNPM ROX Key likely segment L (15-50 dự án, 3k-15k đơn vị): **~14.34 tỷ/năm tổng** (8.82 PlatOps + 5.52 Pass-through). Xem [`06-cost-estimate/opex.md`](./06-cost-estimate/opex.md) cho 3 segment khác.

**Q: Reborn có thể tái sử dụng bao nhiêu từ retail CRM?**
Theo audit `03-architecture/microservices.md`: **~35% REUSE + ~40% EXTEND + ~25% NEW** endpoint. Nhưng đếm thực tế từ spec → tỉ lệ NEW thực sự gần 60% (do lease/CAM/turnover/vendor/B2G đặc thù). Cost estimate đã phản ánh điều này.

**Q: TNTech và Reborn ăn chia thế nào trong phương án kinh doanh?**
Nội dung này thuộc `07-business-case/` — sẽ được build sau khi cost được TNTech align. Bộ tài liệu này chỉ cung cấp **cost basis** (input), không đưa pricing cho khách hàng.

**Q: Sao xoá `docs/tnpm/` + `docs/urd/` + `docs/roadmap/` + `docs/requirements/`?**
Vì đã merge nội dung còn dùng vào `docs/tnpm-platform/` (api-spec, test-strategy, HLD nguồn, sample data). Riêng `docs/handoff/` và `docs/backend-tasks/` được **giữ** vì cross-branch (nhiều nhánh dùng chung). HLD_IMPLEMENTATION_SUMMARY snapshot 2026-04-14 đã out-of-date và đã merge vào [`05-current-state/fe-be-coverage.md`](./05-current-state/fe-be-coverage.md), nên xoá.
