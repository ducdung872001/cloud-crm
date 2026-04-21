# FE Spec — Tab "Danh sách đăng ký" trong Event Detail

**Version:** 1.0 (2026-04-21)
**Parent page:** `/ch_events/:slug` (Event Detail)
**Thuộc:** Community Hub — `src/pages/CommunityHub/Events/`
**Nguồn yêu cầu:** [docs/requirements/analysis.md](../requirements/analysis.md) — Tài liệu 3 (`other.jpg`)

---

## Mục tiêu

Thay thế workflow thủ công Excel tổng hợp đăng ký của khách hàng W-House bằng một tab trong Event Detail:

- **Input:** event_registrations lấy từ API `GET /market/events/:id/registrations`
- **Output:** bảng nested multi-column theo mẫu `docs/requirements/other.jpg`, có export Excel, filter, check-in, điểm danh add-ons

---

## Cấu trúc component

```
EventDetailPage
 └─ <Tabs>
     ├─ Tab "Tổng quan"       (đã có)
     ├─ Tab "Danh sách đăng ký" ← MỚI (RegistrationListTab)
     ├─ Tab "Check-in"        (đã có — CheckinBoard)
     └─ Tab "Thu chi"         (nếu có)

RegistrationListTab
 ├─ <RegistrationToolbar>                         // row trên cùng
 │   ├─ SearchInput                                // tìm tên/SĐT/mã
 │   ├─ Select "Nhóm thành viên"                   // Mentor7 / Khác / Hậu master / Tất cả
 │   ├─ Select "Ngày tham gia"                     // theo event.selectableDates
 │   ├─ Select "Trạng thái thanh toán"             // pending / submitted / approved / rejected
 │   └─ DropdownButton "Export"                    // Excel (mẫu other.jpg) / CSV / PDF
 ├─ <RegistrationSummaryStrip>                     // dải số liệu nhỏ
 │   ├─ Tổng đăng ký: 32
 │   ├─ Đã thanh toán: 20 (62.5%)
 │   ├─ Đã check-in: 15
 │   └─ Tổng thu dự kiến: 9.600.000đ
 ├─ <RegistrationTable>                            // TanStack Table
 │   ├─ Header nested 2 levels (group + detail)
 │   ├─ Sticky left: STT + Họ tên + Mã
 │   ├─ Sticky right: Tổng + Ảnh CK + Actions
 │   ├─ Body rows với cell add-on render tuỳ loại
 │   └─ Empty state <EmptyState> khi chưa có đăng ký
 └─ <PaymentProofLightbox>                         // modal xem bill to
```

---

## Data model FE

```ts
// Dùng types đã có ở src/pages/CommunityHub/Events/types.ts
import type { EventEntity, EventRegistration, EventAddOnItem, PaymentProof } from "./types";

// Extend EventRegistration với customer join (BE join ở endpoint /registrations):
interface RegistrationRow extends EventRegistration {
  customer?: {
    id: string;
    name: string;
    phone: string;
    customerGroup?: { id: string; name: string };  // Mentor7 / Khác...
    attributes?: Record<string, string>;            // { mentorCode: "5021", houseNumber: "255" }
  };
}
```

`customer.attributes` là map `attribute.code → value` — BE cần join sẵn, không để FE fetch lẻ từng attribute.

---

## Column strategy

### Fixed columns (luôn hiển thị)

| Position | id | Header | Cell render |
|---|---|---|---|
| Left 1 | `stt`         | STT          | `index + 1` |
| Left 2 | `fullName`    | Họ tên       | `r.customer?.name ?? r.fullName` |
| Left 3 | `mentorCode`  | Mã           | `r.customer?.attributes?.mentorCode ?? "—"` |
| Left 4 | `houseNumber` | Nhà          | `r.customer?.attributes?.houseNumber ?? "—"` |
| Right 1 | `totalAmount` | Tổng tiền    | `formatVND(r.totalAmount)` — màu xanh nếu paid, vàng nếu pending |
| Right 2 | `proofs`     | Ảnh CK       | `<ProofThumbs proofs={r.paymentProofs ?? []} />` — stack 1-4 ảnh nhỏ |
| Right 3 | `actions`    | (icon menu)  | Check-in / Duyệt TT / Từ chối / Xoá |

### Dynamic add-on columns (từ event.addOnItems)

FE group theo `addOn.group` thành header cấp 1, từng add-on thành header cấp 2:

```ts
function buildAddOnColumnGroups(addOns: EventAddOnItem[]): ColumnGroup[] {
  const byGroup = groupBy(addOns, (a) => a.group ?? "Khác");
  return Object.entries(byGroup).map(([groupName, items]) => ({
    header: groupName,
    columns: items.map((addOn) => ({
      id: `addon-${addOn.id}`,
      header: (
        <div className="ao-header">
          <div className="ao-name">{addOn.name}</div>
          <div className="ao-price">{formatVND(addOn.unitPrice)}</div>
        </div>
      ),
      cell: (row: RegistrationRow) => {
        const selected = row.selectedAddOns?.find((s) => s.addOnId === addOn.id);
        if (!selected) return <span className="ao-cell--empty">—</span>;
        return (
          <span className="ao-cell--checked" title={`${selected.qty} × ${formatVND(addOn.unitPrice)}`}>
            ✓ {selected.qty > 1 ? `×${selected.qty}` : ""}
          </span>
        );
      },
    })),
  }));
}
```

### Ví dụ header render cho event Squat Mentor

```
┌───┬──────────┬──────┬──────┬──────────────────────────────────┬────────────────────┬──────┬────┬────┐
│ # │ Họ tên   │ Mã   │ Nhà  │ Cư trú W-House 09/05             │ Phí tham gia 10/05 │ Tổng │ CK │ ⋮  │
│   │          │      │      ├──────┬──────┬──────┬─────────────┼──────┬─────────────┤      │    │    │
│   │          │      │      │ Ăn T │ Ăn Tối│ Cư trú│ Xe di chuyển│ Phí  │ Ăn full    │      │    │    │
│   │          │      │      │ 50k  │ 50k  │ 100k │ 100k        │ 300k │ 100k       │      │    │    │
├───┼──────────┼──────┼──────┼──────┼──────┼──────┼─────────────┼──────┼─────────────┼──────┼────┼────┤
│ 1 │ Bùi T.HG │ 5021 │ 255  │  ✓   │  —   │  ✓   │      ✓      │  ✓   │      ✓      │ 600k │ 📎1│ ⋮  │
└───┴──────────┴──────┴──────┴──────┴──────┴──────┴─────────────┴──────┴─────────────┴──────┴────┴────┘
```

---

## Filter & Search logic

```ts
const filtered = useMemo(() => {
  let list = [...registrations];

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((r) =>
      r.customer?.name.toLowerCase().includes(q) ||
      r.customer?.phone.includes(q) ||
      r.customer?.attributes?.mentorCode?.includes(q) ||
      r.ticketCode?.toLowerCase().includes(q)
    );
  }

  if (groupFilter && groupFilter !== "all") {
    list = list.filter((r) => r.customer?.customerGroup?.id === groupFilter);
  }

  if (dateFilter && dateFilter !== "all") {
    list = list.filter((r) => r.selectedDates?.includes(dateFilter));
  }

  if (paymentFilter && paymentFilter !== "all") {
    // Logic nested: registration có ít nhất 1 proof với status = paymentFilter
    list = list.filter((r) =>
      (r.paymentProofs ?? []).some((p) => p.status === paymentFilter) ||
      (paymentFilter === "not_required" && !r.paymentProofs?.length && !event.requirePaymentProof)
    );
  }

  return list.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
}, [registrations, search, groupFilter, dateFilter, paymentFilter, event]);
```

---

## Payment proof thumbnails

```tsx
function ProofThumbs({ proofs }: { proofs: PaymentProof[] }) {
  if (!proofs.length) return <span className="text-muted">—</span>;

  return (
    <div className="proof-thumbs">
      {proofs.slice(0, 3).map((p, i) => (
        <button
          key={i}
          className={`proof-thumb proof-thumb--${p.status}`}
          onClick={() => openLightbox(proofs, i)}
          title={`${STATUS_LABEL[p.status]} · ${formatDate(p.submittedAt)}`}
        >
          <img loading="lazy" src={p.imageUrl} alt="bill" />
        </button>
      ))}
      {proofs.length > 3 && (
        <span className="proof-thumb-more">+{proofs.length - 3}</span>
      )}
    </div>
  );
}
```

Status colors: `submitted=vàng`, `approved=xanh`, `rejected=đỏ`, `pending=xám`.

Click thumb → mở `<PaymentProofLightbox>` với actions: **Duyệt** / **Từ chối (có lý do)** / **Xoá**.

---

## Export Excel — match `other.jpg` format

Dùng `exceljs` (đã có trong deps). Tạo workbook 1 sheet:

```ts
import ExcelJS from "exceljs";

async function exportRegistrationsToExcel(event: EventEntity, registrations: RegistrationRow[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(event.title.slice(0, 31));

  // Row 1-2: Title banner
  ws.mergeCells("A1:Z2");
  const title = ws.getCell("A1");
  title.value = `W-HOUSE\n${event.title.toUpperCase()} — NGÀY ${formatDate(event.startDate)}`;
  title.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  title.font = { size: 16, bold: true, color: { argb: "FF8B0000" } };

  // Row 3-4: Nested header
  const fixedLeft  = ["STT", "Họ và tên", "Mã số", "Số nhà"];
  const fixedRight = ["Tổng tiền đăng ký", "Ảnh chuyển khoản"];
  const addOnGroups = buildAddOnColumnGroups(event.addOnItems ?? []);

  // Header row 3 — groups
  let col = 1;
  fixedLeft.forEach((h) => { ws.getCell(3, col).value = h; ws.mergeCells(3, col, 4, col); col++; });
  addOnGroups.forEach(g => {
    ws.mergeCells(3, col, 3, col + g.columns.length - 1);
    ws.getCell(3, col).value = g.header;
    col += g.columns.length;
  });
  fixedRight.forEach((h) => { ws.getCell(3, col).value = h; ws.mergeCells(3, col, 4, col); col++; });

  // Header row 4 — detail
  col = fixedLeft.length + 1;
  addOnGroups.forEach(g => {
    g.columns.forEach(c => {
      ws.getCell(4, col).value = `${c.name}\n${formatVND(c.unitPrice)}`;
      col++;
    });
  });

  // Data rows
  registrations.forEach((r, i) => {
    const row = [
      i + 1,
      r.customer?.name ?? r.fullName,
      r.customer?.attributes?.mentorCode ?? "",
      r.customer?.attributes?.houseNumber ?? "",
      ...addOnGroups.flatMap(g => g.columns.map(c => {
        const sel = r.selectedAddOns?.find(s => s.addOnId === c.id);
        return sel ? `✓${sel.qty > 1 ? ` x${sel.qty}` : ""}` : "";
      })),
      formatVND(r.totalAmount ?? 0),
      r.paymentProofs?.map(p => p.imageUrl).join("\n") ?? "",
    ];
    ws.addRow(row);
  });

  // Styling
  ws.getRow(3).font = { bold: true };
  ws.getRow(4).font = { bold: true, size: 10 };
  ws.columns.forEach(c => { c.width = Math.max(c.width ?? 10, 14); });

  // Download
  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf]), `${event.slug}-dang-ky.xlsx`);
}
```

---

## Responsive

| Breakpoint | Hành vi |
|---|---|
| ≥ 1200px | Multi-header table full hiển thị |
| 768–1199px | Horizontal scroll, sticky cột "Họ tên" (left 2) + "Tổng" (right 1) |
| < 768px | Chuyển sang card view (1 registration / card) — group headers thành section title trong card |

---

## Accessibility

- Header nested: dùng `<thead>` với 2 `<tr>`, các `<th>` group có `colspan`, detail có `scope="col"`
- Sticky columns: `position: sticky` với `left: 0` và `background` để không bị transparent
- Lightbox: focus trap, Esc để close, arrow keys để nav giữa proofs
- Nút check-in: `aria-label="Check-in {fullName}"`

---

## Order triển khai FE (khi BE schema ready)

1. **Baseline** — build `RegistrationListTab` skeleton, dùng mock 3 registration để render
2. **Column builder** — implement `buildAddOnColumnGroups` + fixed cols
3. **Filter + search** — toolbar + filter state
4. **Payment proofs UI** — thumbs + lightbox + duyệt/từ chối actions
5. **Export Excel** — dùng exceljs theo template trên
6. **Check-in inline** — click row → modal check-in (multi-day chọn ngày)
7. **Service usage tracking** — tick điểm danh add-on (sau khi check-in)
8. **Responsive** — card view mobile

---

## Phụ thuộc BE (blockers)

Trước khi FE bắt đầu, cần BE làm xong:
- [market/events.md](../backend-tasks/market/events.md) Gap 3 (addOn.group) + Gap 4 (paymentProofs array)
- [market/events.md](../backend-tasks/market/events.md) Gap 5 (auto-link customer khi register)
- [customer/attribute-seed-mentor.md](../backend-tasks/customer/attribute-seed-mentor.md) (seed 2 attribute)
- Endpoint `GET /market/events/:id/registrations` trả về `EventRegistration[]` với `customer` joined (name, phone, customerGroup, attributes)

Nếu BE chưa ready, FE có thể mock bằng localStorage như hiện tại — để visual validate UI trước khi wire API.
