# Part 07 — Phạm vi Loyalty (Cross-brand & Scope)

## 1. Bài toán

Khách hàng có 2 thương hiệu. Câu hỏi cốt lõi: **Điểm/hạng/quà của 2 brand là CHUNG hay RIÊNG?** Quyết định này tác động:

- Trải nghiệm KH (1 thẻ hay 2 thẻ)
- Doanh thu cross-sell (KH tích A có lý do mua B không?)
- Brand identity (mỗi brand có DNA riêng?)
- Phức tạp kỹ thuật (data isolation vs sharing)
- Migration cost (KH cũ Brand A và Brand B có trùng không?)

## 2. Ba phương án scope

### 2.1. `chain_wide` — Toàn chuỗi dùng chung

```
        ┌─────────────────────────────┐
        │   CHAIN POINT POOL           │
        │   1 ledger, 1 tier system    │
        └──────┬──────────────────────┘
               │
        ┌──────┴───────┐
        ▼              ▼
    Brand A         Brand B
   (POS, store)   (POS, store)
```

- **Pro:** Đơn giản, KH có 1 thẻ; cross-sell tự nhiên
- **Con:** 2 brand không thể có rule khác (multiplier, tier, reward); brand identity loãng

### 2.2. `per_brand` — Mỗi brand pool riêng

```
   ┌──────────────┐         ┌──────────────┐
   │ BRAND A POOL │         │ BRAND B POOL │
   │ Ledger A     │         │ Ledger B     │
   │ Tier A       │         │ Tier B       │
   └──────────────┘         └──────────────┘
        │                          │
   ┌────┴────┐                ┌────┴────┐
   │ A1   A2 │                │ B1   B2 │ ... stores
   └─────────┘                └─────────┘

   Optional: cross_brand_transfer (1:0.8 ratio config)
```

- **Pro:** Mỗi brand giữ DNA; rule tách bạch; báo cáo P&L độc lập
- **Con:** KH có 2 thẻ; cần `cross_brand_transfer` để KH đỡ thiệt; migration phức tạp

### 2.3. `per_store_group` — Theo nhóm cửa hàng

```
   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
   │ GROUP NORTH     │  │ GROUP CENTRAL   │  │ GROUP SOUTH     │
   │ A+B north stores│  │ A+B central     │  │ A+B south       │
   └─────────────────┘  └─────────────────┘  └─────────────────┘
```

- **Pro:** Phù hợp khi có nhượng quyền vùng, mỗi vùng tự chủ
- **Con:** KH du lịch giữa vùng không dùng được điểm; ít gặp ở siêu thị bán lẻ

## 3. Khuyến nghị cho bài toán này

> Xem phân tích đầy đủ ở [`../06-analysis/cross-brand-strategy.md`](../06-analysis/cross-brand-strategy.md).
>
> **Khuyến nghị:** **`per_brand` + `cross_brand_transfer` bật mặc định** với tỷ giá 1:1 hoặc 1:0.8 (tuỳ chính sách khách).
>
> **Lý do:** Khách có 2 brand độc lập với DNA khác → cần rule riêng (multiplier, tier benefit). Nhưng KH cùng là người → cần cross-sell incentive. Pattern này dùng phổ biến: Sephora-Beauty Insider, Marriott Bonvoy multi-brand.

## 4. Yêu cầu

### UR-SCOPE-01 — Cấu hình scope (Must)

| | |
|---|---|
| **Actor** | Tenant Admin |
| **Mô tả** | UI chọn scope: chain_wide / per_brand / per_store_group. Mapping store → scope_id (brand_id hoặc group_id). Khi đổi scope: migration job phân chia điểm/tier theo logic predefine. |
| **AC** | • Preview migration tác động (số KH, tổng điểm bị split)<br>• Confirm dialog cảnh báo "không thể undo trong 24h"<br>• Audit log<br>• Migration job atomic per member |

### UR-SCOPE-02 — Brand & store group entities (Must)

| | |
|---|---|
| **Mô tả** | Bảng `brand`: code, name, logo, primary_color. Bảng `store_group`: code, name, parent_id (cho cây). Bảng `store` có FK `brand_id` + `store_group_id`. |
| **AC** | • UI quản lý cây brand/group<br>• Validate store thuộc đúng 1 brand |

### UR-SCOPE-03 — Per-brand earn/redeem isolation (Must)

| | |
|---|---|
| **Mô tả** | Khi scope = per_brand: ledger có cột `scope_id = brand_id`. Mọi query points balance, lookup KH context phải filter theo scope hiện tại. KH có thể là member ở cả 2 brand với 2 balance riêng. |
| **AC** | • Test isolation: tạo KH X có 1.000đ Brand A và 500đ Brand B. Lookup ở context A trả 1.000đ, context B trả 500đ<br>• Không leak data cross-brand trong query |

### UR-SCOPE-04 — Cross-brand transfer (Should)

| | |
|---|---|
| **Mô tả** | Khi cross_brand_enabled = true: KH có thể transfer điểm A→B với tỷ giá `ratio_a_to_b`, B→A với `ratio_b_to_a`. Tự khoá 30 ngày sau transfer (chống lạm dụng). |
| **AC** | • Tỷ giá > 0, validation 2 chiều<br>• Audit transfer in/out với linked_id<br>• Limit: 10.000 điểm/ngày/KH<br>• UI trên app KH có wizard transfer |

### UR-SCOPE-05 — Cross-brand profile (Must)

| | |
|---|---|
| **Mô tả** | Khi `cross_brand_recognition = true`: phone duplicate giữa brand không tạo 2 member mà link về 1 `customer_id` (super-customer), giữ 2 member entity riêng cho mỗi brand. Profile 360° hiển thị data của cả 2. |
| **AC** | • Lookup phone: nếu super-customer link → trả về context brand hiện tại<br>• Profile 360° toggle: "Xem cả 2 brand" cho CSKH<br>• Khi disable feature: separate hoàn toàn (không tự gộp) |

### UR-SCOPE-06 — Tier per brand (Should)

| | |
|---|---|
| **Mô tả** | Tier có thể khác giữa brand: KH có thể là Diamond ở Brand A, Silver ở Brand B (do mức chi tiêu khác nhau). Hiển thị badge tier theo context. |
| **AC** | • Profile 360° hiển thị tier mỗi brand<br>• Notification "tier-up" gửi đúng context brand |

### UR-SCOPE-07 — Báo cáo theo scope (Must)

| | |
|---|---|
| **Mô tả** | Dashboard có toggle: chuỗi tổng / brand A / brand B / group. Số liệu auto filter. Báo cáo chuỗi vẫn tổng hợp cả 2 brand. |
| **AC** | • Filter chip persistent trong session<br>• Export Excel theo scope đã chọn |

### UR-SCOPE-08 — Migration scope change (Should)

| | |
|---|---|
| **Mô tả** | Khi đổi scope (chain_wide → per_brand): split ledger và tier theo store mỗi giao dịch xảy ra. Khi đổi ngược (per_brand → chain_wide): merge tất cả vào pool chung, giữ history. |
| **AC** | • Background job với progress<br>• Dry-run preview<br>• Backup snapshot trước khi apply<br>• Rollback được trong 24h |

## 5. Quy tắc nghiệp vụ

- **Default scope** khi tenant tạo mới = `chain_wide` (đơn giản nhất)
- **Đổi scope là quyết định kinh doanh** — không cho phép thay đổi tự động bằng API, chỉ qua UI có 2-level approval
- **Cross-brand transfer ratio** thông thường < 1 (1:0.8) để khuyến khích tiêu tại brand gốc
- **Per-brand tier không có nghĩa là 2 customer khác nhau** — chỉ phân định pool điểm/tier; PII profile vẫn share qua super-customer
- **Migration scope không xoá ledger cũ** — chỉ re-assign scope_id; ledger entries vẫn có timestamp và amount nguyên gốc

## 6. Tham chiếu

- **Phân tích chiến lược 3 phương án + benchmark thị trường:** [`../06-analysis/cross-brand-strategy.md`](../06-analysis/cross-brand-strategy.md)
- **Migration spec:** [`../08-operations/data-migration-plan.md`](../08-operations/data-migration-plan.md)
- **Multi-tenant data isolation kỹ thuật:** [`../03-architecture/part-03-data-architecture.md`](../03-architecture/part-03-data-architecture.md)
