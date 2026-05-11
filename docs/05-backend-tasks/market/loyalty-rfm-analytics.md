# BACKEND TASK — Market: RFM analytics cho loyalty

**Discovered:** 2026-04-22 — Q&A khách hàng chuỗi siêu thị (GAP #5)
**Severity:** 🟡 MEDIUM (demo 2026-04-24, P1)
**Module:** `cloud-market-master`
**Prefix:** `/market/loyaltyReport/rfm`
**FE consumer:** Tab "Phân tích RFM" trong [src/pages/LoyaltyReportPage/index.tsx](../../../src/pages/LoyaltyReportPage/index.tsx)

---

## BỐI CẢNH

Q&A câu 2: "các dữ liệu liên quan KHTV đang rời rạc... thiếu công cụ phân tích". Khách hiện phải tổng hợp qua Excel + Access. RFM (Recency/Frequency/Monetary) là chuẩn vàng ngành bán lẻ để **tự động phân khúc 3M KH thành 11 nhóm hành động** — không cần phân tích thủ công.

---

## PHẦN 1: Tính RFM scores

Với mỗi KHTV:
- **R (Recency):** số ngày kể từ giao dịch gần nhất. Scale 1–5 bằng ntile (5 = mới nhất).
- **F (Frequency):** số giao dịch trong 12 tháng gần nhất. Scale 1–5 (5 = nhiều nhất).
- **M (Monetary):** tổng chi tiêu 12 tháng gần nhất. Scale 1–5 (5 = cao nhất).

**SQL mẫu (PostgreSQL):**
```sql
WITH base AS (
  SELECT
    customer_id,
    NOW() - MAX(created_at) AS recency,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '12 months') AS freq,
    COALESCE(SUM(total) FILTER (WHERE created_at >= NOW() - INTERVAL '12 months'), 0) AS monetary
  FROM invoice
  WHERE status = 'completed'
  GROUP BY customer_id
),
scored AS (
  SELECT
    customer_id,
    6 - ntile(5) OVER (ORDER BY recency ASC)    AS r,  -- đảo: recency nhỏ = score cao
    ntile(5) OVER (ORDER BY freq DESC)          AS f,
    ntile(5) OVER (ORDER BY monetary DESC)      AS m,
    monetary
  FROM base
)
SELECT r, f, COUNT(*) AS count, AVG(monetary) AS avg_monetary
FROM scored
GROUP BY r, f;
```

Job chạy mỗi **15 phút** — ghi snapshot vào bảng `customer_rfm_snapshot`:

```sql
CREATE TABLE customer_rfm_snapshot (
  customer_id   BIGINT PRIMARY KEY,
  r             SMALLINT NOT NULL,
  f             SMALLINT NOT NULL,
  m             SMALLINT NOT NULL,
  monetary      NUMERIC(18,2) NOT NULL,
  segment       VARCHAR(32) NOT NULL,
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_rfm_segment ON customer_rfm_snapshot(segment);
CREATE INDEX idx_rfm_rf      ON customer_rfm_snapshot(r, f);
```

---

## PHẦN 2: Mapping 25 ô (R × F) → 11 phân khúc

Dùng đúng mapping mà FE đã dựng (giữ nhất quán):

| R | F | Segment key |
|---|---|---|
| R≥4, F≥4 | `champions` |
| R≥3, F≥4 | `loyal` |
| R≥4, F=3 | `potential_loyalty` |
| R=5, F≤2 | `new_customer` |
| R=4, F≤2 | `promising` |
| R=3, F=3 | `need_attention` |
| R=3, F≤2 | `about_to_sleep` |
| R=2, F≥4 | `at_risk` |
| R=1, F≥4 | `cant_lose` |
| R=2, F≤3 | `hibernating` |
| còn lại | `lost` |

---

## PHẦN 3: API

### `GET /market/loyaltyReport/rfm`

Query params:
- `branchId` (optional, number — lọc theo cửa hàng) — **mặc định = all stores của tenant**

Response:
```json
{
  "code": 0,
  "result": {
    "totalCustomers": 2847523,
    "computedAt": "2026-04-22T10:15:00+07",
    "matrix": [
      { "r": 1, "f": 1, "count": 12450, "avgMonetary":    250000 },
      { "r": 1, "f": 2, "count":  8320, "avgMonetary":    480000 },
      ...
      { "r": 5, "f": 5, "count": 12045, "avgMonetary": 15200000 }
    ],
    "segments": [
      { "key": "champions",    "name": "Champions",             "count": 85400,  "description": "..." },
      { "key": "loyal",        "name": "Khách trung thành",     "count": 245000, "description": "..." },
      ...
      { "key": "lost",         "name": "Đã mất",                "count": 120000, "description": "..." }
    ]
  }
}
```

`matrix`: tất cả 25 ô (kể cả ô có count = 0). `segments`: 11 phân khúc (cũng kể cả count = 0).

---

## PHẦN 4: Performance

- 3M KH × quét `invoice` 12 tháng → ~450M rows cho query đầu. Chạy trên **replica** + dùng **index `(customer_id, created_at)`** + partial `WHERE status='completed'`.
- Job refresh mỗi 15 phút. Nếu tenant lớn, dùng **ClickHouse** với materialized view (xem `docs/architecture/SCALE-3M-CUSTOMERS-150K-TX.md` — section 3.3).
- Endpoint `GET rfm` chỉ đọc `customer_rfm_snapshot` + aggregate → **≤200ms**.

---

## PHẦN 5: Tương lai — auto-action theo segment

Khi đã có `customer_rfm_snapshot`, Marketing Automation có thể trigger:
- Segment `at_risk` → automation win-back (voucher 15% 30 ngày)
- Segment `champions` → automation VIP experience (tặng quà định kỳ)
- Segment `about_to_sleep` → SMS "chúng tôi nhớ bạn" + voucher nhỏ

Nối với `CareAutomation` hiện có — chỉ cần thêm `triggerType = 'rfm_segment_enter'` và reference `segment_key`.
