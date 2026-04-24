# [BE · cloud-market-master] FitPro Phase 1 — Station type INSIDE + BO profile gym_partner

**Microservice:** `market/` (cloud-market-master)
**URL prefix:** `/bizapi/market/*`
**Host:** `fitpro.reborn.vn`
**Nguồn yêu cầu:** [docs/urd/part-15-fitpro-phygital-roadmap.md §3](../../urd/part-15-fitpro-phygital-roadmap.md#3-phase-1--nền-tảng-inside-quick-wins) — UR-FITPRO-01 và UR-FITPRO-02.

---

## 1. Bối cảnh

Reborn JSC quyết định triển khai mô hình **FitPro INSIDE** — plugin cấy vào gym/yoga có sẵn. FE đã mở rộng types + UI cho 3 loại trạm (HOME / CENTER / INSIDE) và 5 profile BO (thêm `gym_partner`). BE cần đồng bộ schema + API.

## 2. Yêu cầu BE

### 2.1. Station (venue/event) — mở rộng enum

**Bảng:** `event` (hoặc `station` tuỳ tên BE đang dùng trong `market`).

**Thay đổi schema:**

```sql
-- Bước 1: Mở rộng enum station_type (Postgres)
ALTER TYPE station_type ADD VALUE IF NOT EXISTS 'center';
ALTER TYPE station_type ADD VALUE IF NOT EXISTS 'inside';

-- Bước 2: Migration dữ liệu cũ (coworking → center)
UPDATE event SET station_type = 'center' WHERE station_type = 'coworking';

-- Bước 3: Thêm cột metadata cho INSIDE
ALTER TABLE event ADD COLUMN IF NOT EXISTS inside_plugin_meta JSONB NULL;
-- Shape JSON:
-- {
--   "hostBrandName": "California Gym",
--   "hostBrandLogoUrl": "https://...",
--   "hostPartnerBoId": "BO-PARTNER-001",
--   "revenueShareDigital": 20,
--   "pluginDeployDate": "2026-03-10",
--   "pluginStatus": "deployed"  -- pending | deployed | paused
-- }
```

Nếu BE dùng MySQL không có enum → chỉ cần VARCHAR + validation ở service layer.

### 2.2. Partner/BO — thêm profile `gym_partner`

**Bảng:** `business_owner` (hoặc `partner`).

**Thay đổi:**

```sql
-- Mở rộng enum bo_profile
ALTER TYPE bo_profile ADD VALUE IF NOT EXISTS 'gym_partner';

-- Không cần migration dữ liệu vì là value mới
```

**Lưu ý:** Hoa hồng mặc định của profile `gym_partner` = **20%** (khác với 4 profile cũ). Config này nên lưu ở `tenant_config` để chỉnh được theo tenant:

```sql
-- tenant_config table
INSERT INTO tenant_config (tenant_id, key, value) VALUES
  ('FITPRO', 'bo_default_commission_gym_partner', '20');
```

### 2.3. API contract

**3 endpoint ảnh hưởng trực tiếp:**

| Endpoint | Thay đổi |
|----------|----------|
| `POST /bizapi/market/events` (create station) | Accept field `stationType='inside'` + `insidePluginMeta` JSON |
| `POST /bizapi/market/events/update?id=...` (update station) | Tương tự |
| `GET /bizapi/market/events/list` (list) + `GET .../get?id=...` (detail) | Return `stationType` đúng enum mới + `insidePluginMeta` nếu có |
| `GET /bizapi/market/events/public?slug=...` (public share — **QUAN TRỌNG**) | Return `stationType` để public page render badge khác cho INSIDE |

**BO endpoints (`/bizapi/market/business_owners/*`):** accept + return `profile='gym_partner'`. 4 profile cũ giữ nguyên.

**Sample request — create trạm INSIDE:**

```json
POST /bizapi/market/events
{
  "name": "FitPro INSIDE @ California Gym Mỹ Đình",
  "code": "FP-INS-001",
  "stationType": "inside",
  "city": "Hà Nội",
  "address": "The Manor, Mỹ Đình 1, Nam Từ Liêm",
  "ownerBoId": "BO-005",
  "insidePluginMeta": {
    "hostBrandName": "California Gym",
    "hostPartnerBoId": "BO-PARTNER-001",
    "revenueShareDigital": 20,
    "pluginDeployDate": "2026-03-10",
    "pluginStatus": "deployed"
  }
}
```

**Sample response list trạm:**

```json
{
  "items": [
    {
      "id": "ST-006",
      "code": "FP-INS-001",
      "stationType": "inside",
      "insidePluginMeta": {
        "hostBrandName": "California Gym",
        "revenueShareDigital": 20,
        "pluginStatus": "deployed"
      },
      ...
    },
    {
      "id": "ST-002",
      "code": "FP-HN-002",
      "stationType": "center",  // ← đã migrate từ 'coworking'
      ...
    }
  ]
}
```

## 3. Validation

- `stationType='inside'` → bắt buộc có `insidePluginMeta.hostBrandName` và `insidePluginMeta.hostPartnerBoId`.
- `insidePluginMeta.revenueShareDigital` phải là số 0-100. Default 20 nếu không gửi.
- `stationType='home' | 'center'` → không nhận field `insidePluginMeta` (reject 400 nếu có).
- BO với `profile='gym_partner'` → phải có tối thiểu 1 station INSIDE liên kết (foreign key `inside_plugin_meta.host_partner_bo_id`).

## 4. Backward compatibility

FE đã có function `normalizeStationType()` tự chuyển `coworking → center` ở runtime cho các response cũ. BE migration SQL đảm bảo DB không còn value `coworking` sau deploy.

## 5. Test cases

| Test | Expected |
|------|----------|
| Gọi migration SQL → mọi station cũ type='coworking' chuyển thành 'center' | 0 record còn 'coworking' |
| POST tạo station `stationType='inside'` không có `insidePluginMeta` | 400 Bad Request |
| POST tạo BO `profile='gym_partner'` | 200 OK, commission_rate default=20 |
| GET public detail station INSIDE | Response có `stationType='inside'` + metadata |
| Tạo station INSIDE với `hostPartnerBoId` tới BO profile khác `gym_partner` | 400 Bad Request |

## 6. Deadline đề xuất

**1 tuần** — FE đã ready, BE deploy xong → test E2E ngay tuần sau.

## 7. Liên quan

- URD: [Part 15 §3](../../urd/part-15-fitpro-phygital-roadmap.md#3-phase-1--nền-tảng-inside-quick-wins)
- FE types: [src/mocks/community-hub/fitpro-stations.ts](../../../src/mocks/community-hub/fitpro-stations.ts)
- FE UI: [src/pages/CommunityHub/FitProModules/index.tsx](../../../src/pages/CommunityHub/FitProModules/index.tsx) + [src/pages/CommunityHub/Partners/index.tsx](../../../src/pages/CommunityHub/Partners/index.tsx)
