# VALIDATION AUDIT — Reborn Retail CRM

**Ngay:** 2026-04-11
**Ket qua:** 88% form KHONG validate du lieu truoc khi submit

---

## TINH HINH HIEN TAI

| Nhom | So luong | Ty le | Rui ro |
|------|:--------:|:-----:|--------|
| Form co validate day du | ~35 | 12% | Thap |
| Form co validations = [] (rong) | **245** | **84%** | **CAO** — du lieu sai lot ve backend |
| Form khong dung Validate() | 7 | 3% | CAO |

---

## CO CHE VALIDATE HIEN CO

### 1. Validate util (`src/utils/validate.ts`)
- `Validate(validations, formData, listField)` — kiem tra truoc submit
- `handleChangeValidate()` — validate field-level khi user nhap (realtime)

### 2. Rules ho tro
```
required          — bat buoc
nullable          — cho phep null (bo qua required)
max:100           — toi da 100 ky tu
min:5             — toi thieu 5 ky tu
regex             — match pattern (can set field.regex)
compare:fieldName — so sanh voi field khac
in:a,b,c          — gia tri phai thuoc danh sach
min_equal:10      — >= 10 (so)
max_equal:100     — <= 100 (so)
```

### 3. FieldCustomize component
- Hien loi tu `formData.errors[field.name]`
- Ho tro `required`, `maxLength`, `minValue`, `maxValue`
- Hien thi error state (vien do + message duoi field)

### 4. Pattern chuan (mau: ModalAddWarehouse)

```tsx
// 1. Dinh nghia validation rules
const validations: IValidation[] = [
  { name: "name",    rules: "required|max:100" },
  { name: "code",    rules: "nullable|max:50" },
  { name: "address", rules: "required|max:255" },
];

// 2. Dinh nghia fields voi maxLength, required
const listField: IFieldCustomize[] = [
  { label: "Ten kho", name: "name", type: "text", required: true, maxLength: 100 },
  { label: "Ma kho",  name: "code", type: "text", maxLength: 50 },
];

// 3. Wire handleChangeValidate cho moi field
<FieldCustomize
  field={field}
  formData={formData}
  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
/>

// 4. Validate truoc submit
const onSubmit = async (e) => {
  e.preventDefault();
  const errors = Validate(validations, formData, listField);
  if (Object.keys(errors).length > 0) {
    setFormData(prev => ({ ...prev, errors }));
    return;
  }
  // Goi API...
};

// 5. Xu ly error tu API response
const response = await SomeService.update(body);
if (response.code === 0) {
  showToast("Thanh cong", "success");
} else {
  showToast(response.message ?? response.error ?? "Co loi xay ra", "error");
}
```

---

## DANH SACH FORM CAN FIX (UU TIEN)

### Nhip 2 — Core Retail (uu tien cao nhat)

| # | Module | File | Truong can validate |
|---|--------|------|---------------------|
| 1 | **San pham** | SettingSell/Product/partials/AddProductModal.tsx | ten*, SKU (unique), gia (>0), ton kho (>=0) |
| 2 | **San pham** | SettingSell/Product/partials/AddProductPage.tsx | ten*, danh muc, gia*, don vi tinh |
| 3 | **Dich vu** | SettingSell/Service/partials/AddServiceModal/ | ten*, gia (>0), thoi luong |
| 4 | **Khach hang** | CustomerAndSupplier/partials/AddCustomerCompanyModal.tsx | ten*, SDT (regex), email (regex) |
| 5 | **Khach hang** | CustomerPerson/partials/AddCustomerCompanyModal.tsx | ten*, SDT (regex), email (regex) |
| 6 | **Don hang** | Sell/CreateOrderSales/ | KH, SP, so luong (>0), PTTT |
| 7 | **Phieu nhap** | ProductImport/CreateReceipt/CreateReceipt.tsx | kho*, SP, so luong (>0), ngay nhap |
| 8 | **NCC** | SupplierPage/partials/AddSupplierModal.tsx | ten* |
| 9 | **Thu chi** | Finance/CashBook/ | loai*, so tien (>0), noi dung*, quy |
| 10 | **Cong no** | Finance/DebtManagement/ | KH/NCC*, so tien, han tra |

### Nhip 3 — Marketing & CRM

| # | Module | File |
|---|--------|------|
| 11 | Khuyen mai | PromotionalProgram |
| 12 | Coupon | PromoCode |
| 13 | Chien dich | Campaign/AddCampaignModal |
| 14 | Bao gia | Offer/CreateOffers |
| 15 | Ticket | Ticket |
| 16 | Bao hanh | Warranty |

### Nhip 4 — Settings & Cai dat

| # | Module | File |
|---|--------|------|
| 17 | Nhan vien | SettingBasis/EmployeeList |
| 18 | Phong ban | SettingBasis/DepartmentDirectory |
| 19 | Vai tro | SettingBasis/RoleDirectory |
| 20 | Ca lam | ShiftConfig |
| 21 | PTTT | SettingPaymentMethod |

### Nhip 5 — BPM & Nang cao

| # | Module | File |
|---|--------|------|
| 22-40 | BPM modals | BusinessProcessCreate/partials/* |
| 41-50 | Marketing Automation | MarketingAutomation/* |

---

## VALIDATE RULES CHUAN CHO TUNG LOAI TRUONG

| Loai truong | Rules | Field props |
|-------------|-------|-------------|
| Ten (bat buoc) | `required\|max:100` | `required: true, maxLength: 100` |
| Ma/Code | `nullable\|max:50` | `maxLength: 50` |
| Email | `nullable\|regex` | `regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| SDT | `nullable\|regex` | `regex: /^(0[0-9]{9,10})$/` |
| Gia tien | `required\|min_equal:0` | `minValue: 0` |
| So luong | `required\|min_equal:1` | `minValue: 1` |
| Dia chi | `required\|max:255` | `required: true, maxLength: 255` |
| Ngay | `required` | `required: true` |
| Ghi chu | `nullable\|max:500` | `maxLength: 500` |

---

## THIEU TRONG CO CHE HIEN TAI

| # | Van de | Muc do | De xuat |
|---|--------|--------|---------|
| 1 | `unique` rule co nhung khong implement | HIGH | Backend validate, FE hien error tu response |
| 2 | API error dung `error` thay vi `message` | MEDIUM | FE doc ca 2: `response.message \|\| response.error` |
| 3 | `field.required = true` nhung khong tu tao rule | LOW | Document ro: phai them vao validations[] |
| 4 | Khong co async validation | LOW | Dung backend validate + hien error |
| 5 | Error messages chi co tieng Viet | LOW | Chua can i18n cho noi bo |

---

*Tai lieu nay la co so de fix validate theo tung nhip.*
*Moi nhip hoan thanh → re-test → bao cao.*
