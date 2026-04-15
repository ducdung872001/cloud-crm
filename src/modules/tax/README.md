# Reborn Tax Module — Phân hệ thuế HKD/CNKD

Phân hệ **Thuế Hộ Kinh Doanh / Cá Nhân Kinh Doanh** — tuân thủ TT 40/2021/TT-BTC và NĐ 70/2025/NĐ-CP.

**Thiết kế portable**: copy nguyên thư mục `src/modules/tax/` sang nhánh sản phẩm khác (reborn-retail, community-hub, spa…) là dùng được. Chỉ cần viết 1 adapter mới + đăng ký routes.

---

## 📦 Cấu trúc

```
src/modules/tax/
├── domain/              ← PURE TypeScript, không phụ thuộc React/framework
│   ├── types.ts         ← Tất cả types (TaxpayerProfile, RevenueRecord, TaxDeclaration…)
│   ├── constants.ts     ← Tỷ lệ thuế, ngưỡng doanh thu, mã mẫu — sửa 1 chỗ khi luật đổi
│   └── engine.ts        ← TaxCalculator, ThresholdChecker, DeclarationBuilder, DeadlineHelper
│
├── adapters/            ← LỚP DỊCH từ nguồn dữ liệu của từng nhánh sang shape chuẩn
│   ├── types.ts         ← Interface DataSourceAdapter + registry
│   ├── mockAdapter.ts   ← Fallback demo data (dùng được cho mọi nhánh)
│   └── fitproAdapter.ts ← Mẫu adapter cho nhánh reborn-fitpro
│
├── services/
│   ├── taxStorage.ts    ← Persistence (localStorage trong MVP, thay API khi có BE)
│   └── eTaxGateway.ts   ← Stub liên thông eTax TCT (ký số + nộp tờ khai)
│
├── ui/                  ← React components — styled-neutral, dễ rebrand
│   ├── theme.ts         ← ⭐ Sửa file này để đổi toàn bộ look & feel theo nhánh
│   ├── common.tsx       ← Button, Card, Badge, KpiTile, Alert…
│   ├── hooks.ts
│   ├── TaxModule.tsx    ← Shell + tab nav
│   ├── TaxDashboard.tsx           (5 chỉ số sinh tồn)
│   ├── TaxpayerProfilePage.tsx    (T1 — wizard chọn phương pháp + ngành)
│   ├── RevenueExpenseBook.tsx     (T2 — sổ DT/CP theo kỳ)
│   ├── DeclarationWizard.tsx      (T3 — lập tờ khai 5 bước)
│   ├── DeclarationPreview.tsx     (preview layout mẫu 01/CNKD)
│   ├── TaxCalendar.tsx            (T4 — lịch thuế năm)
│   └── TaxAdvisory.tsx            (T5 — FAQ + chính sách)
│
├── routes.tsx           ← TAX_ROUTES + TAX_MENU_ITEM cho host app
└── index.ts             ← Barrel export duy nhất
```

---

## 🚀 Cách tích hợp vào host app (host = 1 nhánh sản phẩm)

### Bước 0 — Chọn branch adapter (1 dòng)

Mở [ui/TaxModule.tsx](./ui/TaxModule.tsx), tìm dòng `ACTIVE_BRANCH` ở đầu file và đổi giá trị:

```ts
const ACTIVE_BRANCH: "fitpro" | "community" | "retail" | "mock" = "fitpro";
```

- `"fitpro"` — dùng `fitproAdapter` (ServiceBooking, service_no_material 7%)
- `"community"` — dùng `communityHubAdapter` (checkin/service/event, 7%)
- `"retail"` — dùng `retailAdapter` (SaleOrder, distribution 1.5%)
- `"mock"` — fallback demo data, không lấy từ BE

Cả 3 adapter đều có sẵn trong module. Nếu chưa wire BE thì adapter tự fallback về mock data để UI demo ngay được.

### Bước 1 — Đăng ký routes

Trong `src/configs/routes.tsx` (hoặc nơi tương đương của host):

```tsx
import { TAX_ROUTES } from "@/modules/tax";

export const routes: IRouter[] = [
  // …các route hiện có
  ...TAX_ROUTES, // ← Thêm dòng này
];
```

### Bước 2 — Đăng ký menu (optional)

```tsx
import { TAX_MENU_ITEM } from "@/modules/tax";

export const menu: IMenuItem[] = [
  // …menu items hiện có
  TAX_MENU_ITEM, // hoặc map sang schema menu của host
];
```

### Bước 3 — Viết adapter cho nhánh (bắt buộc để có dữ liệu thật)

Ví dụ cho nhánh `reborn-retail`:

```ts
// src/adapters/retailTaxAdapter.ts
import type { DataSourceAdapter, RevenueRecord } from "@/modules/tax";
import { OrderService } from "@/services/OrderService";

export const retailAdapter: DataSourceAdapter = {
  name: "retail",
  displayName: "Reborn Retail",

  async getRevenueRecords({ startDate, endDate }) {
    const orders = await OrderService.list({ from: startDate, to: endDate });
    return orders.map<RevenueRecord>((o) => ({
      id: `retail-${o.id}`,
      occurredAt: o.createdAt,
      amount: o.totalAmount,
      industryGroup: "distribution", // Retail = phân phối hàng hoá (1.5%)
      description: `Đơn hàng #${o.code}`,
      sourceModule: "retail.order",
      sourceRefId: o.id,
      isTaxable: o.status === "paid",
      invoiceNo: o.invoiceNo,
    }));
  },
};
```

Đăng ký trong entry point của nhánh:

```ts
import {
  registerDataSourceAdapter,
  setDefaultAdapter,
} from "@/modules/tax";
import { retailAdapter } from "@/adapters/retailTaxAdapter";

registerDataSourceAdapter(retailAdapter);
setDefaultAdapter("retail");
```

### Bước 4 — Rebrand UI (optional)

Sửa `src/modules/tax/ui/theme.ts`:

```ts
export const taxTheme = {
  colors: {
    primary: "#FF6B35",        // đổi sang màu retail
    primaryDark: "#2D1B0E",
    primarySoft: "#FFF1EB",
    // …
  },
  // …
};
```

1 phút là xong toàn bộ look & feel.

---

## 🧮 Công thức tính thuế

Theo **TT 40/2021/TT-BTC**, thuế = `Doanh thu × Tỷ lệ %` theo nhóm ngành:

| Nhóm ngành | GTGT | TNCN | Tổng |
|---|---|---|---|
| Phân phối, cung cấp hàng hoá | 1% | 0.5% | 1.5% |
| Dịch vụ, XD không bao thầu NVL | 5% | 2% | **7%** |
| Sản xuất, vận tải, XD có bao thầu NVL | 3% | 1.5% | 4.5% |
| Hoạt động kinh doanh khác | 2% | 1% | 3% |
| Cho thuê tài sản | — | 5% | 5% |

Ngưỡng quan trọng:
- **≤ 100 triệu/năm** → miễn GTGT+TNCN+môn bài
- **> 1 tỷ/năm** ngành F&B/bán lẻ → **bắt buộc máy tính tiền kết nối TCT** (NĐ 70/2025)
- **> 3 tỷ/năm** → buộc chuyển phương pháp kê khai

Môn bài theo bậc: 100–300tr = 300k · 300–500tr = 500k · >500tr = 1.000k.

---

## 📝 Mẫu tờ khai hỗ trợ

- `01/CNKD` — Tờ khai chính (HKD/CNKD, cho mọi phương pháp)
- `01-2/BK-HDKD` — Phụ lục bảng kê (khi chọn phương pháp kê khai)
- `03/CNKD` — Quyết toán kết quả kinh doanh thực tế *(chưa hỗ trợ ở MVP)*
- `01/LPMB` — Tờ khai lệ phí môn bài *(stub)*

## 🔌 Liên thông eTax

Module có sẵn `eTaxGateway` với 3 hàm:
- `sign(declaration)` — ký số tờ khai (USB Token / Remote Signing / SmartCA)
- `submit(declaration)` — POST XML lên Cổng thuế điện tử TCT
- `checkStatus(receiptCode)` — polling trạng thái chấp nhận

Hiện đang là **stub** — khi tích hợp thật chỉ cần thay implementation trong
`services/eTaxGateway.ts`, không cần sửa UI hay engine.

---

## ⚠️ Limitations của MVP

1. **Persistence** dùng localStorage — thay bằng API thật khi có BE.
2. **Ký số** hiện mock — chưa tích hợp VNPT-CA/FPT-CA SDK.
3. **Nộp eTax** hiện mock — chưa gọi endpoint thật của TCT.
4. **Mẫu 03/CNKD** chưa có (thiếu spec trong docs/taxes/).
5. **BPM workflow** đơn giản (state machine trong DeclarationWizard), chưa dùng Camunda/DMN.
6. **XML schema** mới theo bố cục mẫu giấy — khi có SOAP schema thật của TCT chỉ cần đổi tag names trong `DeclarationBuilder.buildXmlPayload()`.

---

## 📚 Văn bản tham khảo

- Luật Quản lý thuế 38/2019/QH14
- Thông tư 40/2021/TT-BTC
- Nghị định 70/2025/NĐ-CP
- Nghị định 123/2020/NĐ-CP (HĐĐT)
- Nghị định 139/2016/NĐ-CP (Lệ phí môn bài)

---

## 🧪 Test nhanh trong dev

1. Khởi động dev server.
2. Mở `/tax` — thấy Dashboard (dùng mock data nếu chưa có adapter thật).
3. Vào `/tax/profile` → chọn phương pháp + ngành + nhập MST → lưu.
4. Vào `/tax/declaration` → wizard 5 bước → preview mẫu 01/CNKD đúng layout.
5. Vào `/tax/calendar` → xem các kỳ trong năm + trạng thái.

Dữ liệu lưu trong `localStorage` key `reborn.tax.profile` và `reborn.tax.declarations`.

---

## 📮 Porting checklist

Khi bốc module sang nhánh mới:

- [ ] Copy thư mục `src/modules/tax/` nguyên vẹn
- [ ] Tạo adapter file theo template ở [adapters/fitproAdapter.ts](./adapters/fitproAdapter.ts)
- [ ] Đăng ký adapter + set default trong entry point của nhánh
- [ ] Thêm `...TAX_ROUTES` vào routes của host
- [ ] (Optional) Sửa `ui/theme.ts` để match brand
- [ ] (Optional) Map `industryGroup` phù hợp với từng loại giao dịch của nhánh
- [ ] Test flow: profile → book → declaration → calendar

**Không cần** đụng vào `domain/`, `services/`, các trang UI trừ khi muốn customize.
