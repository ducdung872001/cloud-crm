# Backend Bugs — CRUD Test Toan Bo He Thong

**Ngay:** 2026-04-11
**Test script:** `node tests/test-crud-all.mjs`

---

## ~~BUG 1: API Don vi tinh — list tra sai truong `name`~~ → DA XAC NHAN KHONG PHAI BUG

**Ket luan:** Backend tra dung `name`. Loi do test script doc sai dong trong table (phan trang). Da fix test.

---

## BUG 2 (da bao truoc): API Kho hang — list khong tra `code`

**Da bao trong:** BACKEND-TASK-warehouse-bugs.md
**Trang thai lan nay:** DA FIX — code hien dung trong list va edit

---

## TOM TAT

| Module | Create | List | Edit | Update | Delete | Backend bug |
|--------|:------:|:----:|:----:|:------:|:------:|:-----------:|
| Kho hang | ✅ | ✅ | ✅ | ✅ | ✅ | (da fix code) |
| NCC | ❌ (FE) | — | — | — | — | — |
| Nhom KH | ✅ | ❌ (FE) | — | — | — | — |
| DM SP | ❌ (FE) | — | — | — | — | — |
| Don vi tinh | ✅ | ❌ name sai | ✅ | ✅ | ✅ | **list tra sai name** |
| Phong ban | ✅ | ❌ (FE) | — | — | — | — |

**FE issues:** NCC, Nhom KH, DM SP, Phong ban — can fix selector/tab navigation trong test script, khong phai bug app.
