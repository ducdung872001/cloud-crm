# [BE · `nutrition` (MỚI)] FitPro Phase 2.3 — AI Nutrition Engine V1

**Microservice:** `nutrition` (⚠️ MỚI)
**URL prefix:** `/bizapi/nutrition/*`
**URD:** [docs/urd/part-15-fitpro-phygital-roadmap.md#ur-fitpro-ai-nut](../../urd/part-15-fitpro-phygital-roadmap.md#ur-fitpro-ai-nut)

## 1. Mục tiêu V1 (rule-based)

Không cần ML. V1 dùng **lookup table + công thức tính** theo profile.

## 2. Schema

```sql
-- Bảng công thức cho từng mục tiêu + giới tính
CREATE TABLE nutrition_formula (
  id SERIAL PRIMARY KEY,
  goal VARCHAR(16) NOT NULL,                 -- weight_loss | muscle_gain | health
  gender VARCHAR(8) NOT NULL,                 -- male | female
  protein_g_per_kg DECIMAL(3,1) NOT NULL,     -- VD 1.8g/kg cho muscle_gain
  kcal_per_kg_multiplier DECIMAL(4,2) NOT NULL, -- VD 26 kcal/kg/ngày cho weight_loss
  post_workout_protein_g INT NOT NULL,        -- 30-40g sau buổi tập
  post_workout_carb_g INT NOT NULL,
  suggested_sku_ids TEXT[] NOT NULL,          -- list SKU ưu tiên
  tenant_id VARCHAR(32)
);

-- Bảng recommendation (log) — mỗi lần check-out sinh 1 bản ghi
CREATE TABLE nutrition_recommendation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id VARCHAR(32) NOT NULL,
  checkin_id VARCHAR(32),                     -- tham chiếu check-in event từ market
  computed_at TIMESTAMPTZ DEFAULT now(),
  protein_g INT,
  kcal INT,
  recommended_skus TEXT[],
  rationale TEXT,
  pushed BOOLEAN DEFAULT false,               -- đã gửi notification chưa
  consumed_sku_ids TEXT[],                     -- update sau nếu member mua qua sales
  consumed_at TIMESTAMPTZ
);

CREATE INDEX idx_nutrition_rec_member ON nutrition_recommendation (member_id);
```

## 3. API

| Endpoint | Mô tả |
|----------|-------|
| `GET /bizapi/nutrition/recommendation/:memberId/latest` | Lấy gợi ý mới nhất |
| `POST /bizapi/nutrition/compute` | Compute + save 1 recommendation (triggered bởi event `market.member_checked_out`) |
| `GET /bizapi/nutrition/formula` | List formula |
| `PUT /bizapi/nutrition/formula/:id` | Admin chỉnh công thức |
| `POST /bizapi/nutrition/recommendation/:id/feedback` | Member rate hiệu quả khuyến nghị |

## 4. Algorithm V1

```typescript
function computeRecommendation(memberProfile, latestCheckinIntensity) {
  const formula = lookupFormula(memberProfile.goal, memberProfile.gender);

  const dailyProtein = Math.round(memberProfile.weightKg * formula.protein_g_per_kg);
  const dailyKcal = Math.round(memberProfile.weightKg * formula.kcal_per_kg_multiplier);

  // Điều chỉnh theo cường độ buổi tập
  const intensityBonus = latestCheckinIntensity === "high" ? 1.15
                       : latestCheckinIntensity === "medium" ? 1.05 : 1.0;

  const postWorkoutProtein = Math.round(formula.post_workout_protein_g * intensityBonus);
  const postWorkoutCarb = Math.round(formula.post_workout_carb_g * intensityBonus);

  // Gợi ý SKU dựa trên thiếu hụt
  const suggestedSkus = lookupSkus(memberProfile, formula);

  return { dailyProtein, dailyKcal, postWorkoutProtein, postWorkoutCarb, suggestedSkus };
}
```

## 5. Event flow

1. `market` emit `checkin.checked_out` sau buổi tập.
2. `nutrition` subscribe → gọi `POST /nutrition/compute` với memberId.
3. `nutrition` sinh recommendation, save DB.
4. Emit `nutrition.recommendation_ready` → `notification` service push Zalo/app.
5. Member mua qua `sales` → `sales.package_sold` với skuId → `nutrition` update `consumed_sku_ids`.

## 6. Integration với FE hiện có

FE mockup ở [FitProModules body_metrics panel](../../../src/pages/CommunityHub/FitProModules/index.tsx) — đang hiển thị cứng:
- "35g Whey Protein (Herbalife F1)"
- "450 kcal bữa chính"
- "Magnesium 400mg"

Sau khi BE live, FE sẽ gọi `GET /nutrition/recommendation/:memberId/latest` để lấy số động.

## 7. Dependencies

- `market`: profile member + check-in event + baseline/current body metrics.
- `inventory`: catalog Herbalife SKU.
- `sales`: event member-mua-SKU để tính compliance.
- `notification`: push tin khuyến nghị.

## 8. Timeline

**3 tuần** V1. V2 (ML) lên backlog sau 6 tháng data thu thập.
