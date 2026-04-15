# Backend Task: Loi phat hien tu auto test phan he Kho

## Muc tieu
Fix cac loi backend lien quan den phan he Kho, phat hien qua Playwright auto test.

## Loi 1: API tao kho hang khong phan hoi

**Hien trang:**
- Frontend click nut "Them kho" → Modal mo → Nhap ten kho → Click "Xac nhan/Luu"
- **Khong co API POST nao duoc goi** (browser Network tab khong thay request)
- Ket qua: Kho moi khong duoc tao

**Nguyen nhan co the:**
- Frontend co the goi API qua endpoint sai
- Hoac logic submit bi block boi condition check

**API lien quan:**
- `POST /bizapi/inventory/warehouse` hoac `POST /adminapi/warehouse`

**Cach verify:**
```bash
curl -s -X POST "https://biz.reborn.vn/inventory/warehouse" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test API","address":""}' | python -m json.tool
```

**Yeu cau:** Kiem tra API tao kho hoat dong, tra ve response dung format.

---

## Loi 2: API Dashboard Tai chinh tra ve 500

**Hien trang:**
- `GET /billing/finance/chart` → 500 Internal Server Error
- Frontend crash vi `data.totalFundBalance` la undefined

**Da fix frontend:** Them `if (!data) return;` trong `src/pages/Finance/Dashboard/index.tsx`

**Yeu cau BE:** Kiem tra API `/billing/finance/chart` — tra ve 500 khi nao? Thieu dieu kien gi?

---

## Loi 3: API Hoa don VAT tra ve 500

**Hien trang:**
- `GET /integration/sinvoice/query/usage-status` → 500

**Nguyen nhan:** Co the NCC HDDT chua duoc cau hinh/ket noi

**Yeu cau:** Kiem tra va tra loi dung cau truc khi chua co NCC (tra {} thay vi 500)

---

## Test Environment
- CRM: http://localhost:4000/crm
- SSO: http://localhost:8080
- API: https://biz.reborn.vn, https://cloud.reborn.vn
- Account test: 0971234599
- Branch: reborn-retail
