# Microservice đề xuất: `nutrition`

**Trạng thái:** 🟡 Đề xuất mới — chờ Ban lãnh đạo duyệt.

**Domain:** AI Nutrition Engine — tính khẩu phần cá nhân hoá + recommend SKU + track compliance.

**Nguồn:** [docs/urd/part-15-fitpro-phygital-roadmap.md §8.3.3](../../urd/part-15-fitpro-phygital-roadmap.md#833-nutrition--ai-nutrition-engine)

## Responsibility

1. Công thức tính Protein/kcal/vi chất theo profile + chỉ số + mục tiêu.
2. Lookup table mapping ngưỡng → SKU Herbalife/phụ trợ phù hợp.
3. Track compliance: bao nhiêu % gợi ý được hội viên mua qua `sales` / tiêu thụ.
4. Feedback loop — điều chỉnh công thức theo kết quả re-test.

## URL prefix

`/bizapi/nutrition/*`

## Task list

| Task | Phase | File |
|------|:-----:|------|
| V1 rule-based engine + recommendation API + push to notification | 2 | [BACKEND-TASK-fitpro-ai-nutrition.md](./BACKEND-TASK-fitpro-ai-nutrition.md) |
| V2 ML model training (sau khi có đủ data) | 3+ | backlog |
