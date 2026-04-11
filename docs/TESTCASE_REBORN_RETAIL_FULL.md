# Kich Ban Kiem Thu UAT — Reborn CRM Retail

> Du an: REBORN RETAIL CRM
> Phien ban: v2
> Ngay chuyen doi: 11/04/2026
> Trang thai: Day du — Hoan thien tu ban so bo cua Testers

---

## Danh Muc Kich Ban

| TT | Ma kich ban | Ten kich ban | So buoc | Trang thai |
|---|---|---|:---:|---|
| 1 | RT.01 | So kho | 66 | Co san — Da test |
| 2 | RT.02 | Quan ly kho | 21+ | Co san — Da test |
| 3 | RT.03 | Ban hang tai quay (POS) | 56 | Co san — Da test |
| 4 | RT.04 | Don hang online | 42 | Co san — Da test |
| 5 | RT.05 | Giao hang va van chuyen | 34 | Co san — Da test |
| 6 | RT.06 | So thu chi | 20 | **Bo sung day du** |
| 7 | RT.07 | Hoa don VAT | 49 | Co san — Da test |
| 8 | RT.08 | Quan ly san pham & Dich vu | 35 | **MOI** |
| 9 | RT.09 | Quan ly khach hang | 40 | **MOI** |
| 10 | RT.10 | Khuyen mai & Loyalty | 38 | **MOI** |
| 11 | RT.11 | Dashboard & Bao cao | 25 | **MOI** |
| 12 | RT.12 | Ca lam viec & Ket ca | 18 | **MOI** |
| 13 | RT.13 | Quan ly cong no | 22 | **MOI** |
| 14 | RT.14 | Quan ly quy | 16 | **MOI** |
| 15 | RT.15 | Khach tra hang | 15 | **MOI** |
| 16 | RT.16 | Doi soat thanh toan | 12 | **MOI** |
| 17 | RT.17 | Cai dat he thong | 30 | **MOI** |
| 18 | RT.18 | Dang nhap / Dang xuat / Bao mat | 18 | **MOI** |
| 19 | RT.19 | Nha cung cap | 14 | **MOI** |
| 20 | RT.20 | Phieu dieu chuyen kho | 16 | **MOI** |
| 21 | RT.21 | Phieu dieu chinh kho | 14 | **MOI** |
| 22 | RT.22 | Phieu xuat huy | 14 | **MOI** |
| 23 | RT.23 | Kiem ke kho | 12 | **MOI** |
| 24 | RT.24 | Don hang (Tao & Theo doi) | 20 | **MOI** |
| 25 | RT.25 | Thong bao | 8 | **MOI** |
| 26 | RT.26 | Lich su thanh toan | 10 | **MOI** |
| 27 | RT.27 | Dashboard tai chinh | 10 | **MOI** |
| 28 | RT.28 | Bao cao kho | 12 | **MOI** |
| 29 | RT.29 | Nguyen vat lieu | 12 | **MOI** |
| 30 | RT.30 | Cham cong | 10 | **MOI** |
| 31 | RT.31 | Bao hanh & Ho tro (Ticket) | 22 | **MOI** |
| 32 | RT.32 | Email / SMS / Zalo Marketing | 24 | **MOI** |
| 33 | RT.33 | Cham soc KH & Social CRM | 20 | **MOI** |
| 34 | RT.34 | Bao gia & Chao gia (Offer) | 16 | **MOI** |
| 35 | RT.35 | Chien dich Marketing | 18 | **MOI** |
| 36 | RT.36 | Phan tich KH nang cao | 14 | **MOI** |
| 37 | RT.37 | Hoa don ban hang (khong VAT) | 14 | **MOI** |
| 38 | RT.38 | POS — Luong nang cao | 16 | **MOI** |
| 39 | RT.39 | Lich hen & Lich cham soc | 12 | **MOI** |
| 40 | RT.40 | Quan ly to chuc & Goi dich vu | 10 | **MOI** |
| 41 | RT.41 | Quy trinh nghiep vu (BPM) | 22 | **MOI — Co trong menu chinh** |
| 42 | RT.42 | Marketing Automation | 14 | **MOI — Co route active** |
| 43 | RT.43 | Quy trinh ban hang (Sale Flow) | 12 | **MOI — Co trong menu** |

**Tong cong:** ~860+ buoc kiem thu

---

## NGUYEN TAC BAT BUOC KHI TEST CRUD

> **Moi thao tac Create/Update PHAI kiem tra DATA ROUND-TRIP:**
>
> 1. **Luu form** — ghi nhan TAT CA gia tri da nhap (ten, ma, dia chi, trang thai, gia, so luong...)
> 2. **Kiem tra DANH SACH** — moi truong da nhap phai hien dung tren bang list (khong bi "—", rong, hoac sai)
> 3. **Mo lai EDIT** — moi input phai hien dung gia tri da luu (khong bi mat, khong bi reset)
> 4. **Doi chieu API** — capture API response (GET/list) va verify tung field khop voi input
>
> Neu bat ky truong nao khong hien dung → **FAIL** — bao loi backend.
>
> *Ly do:* Backend co the tra "thanh cong" nhung khong luu du truong. Chi check "toast thanh cong" la KHONG DU.

---

## QUY UOC TRANG THAI

| Ky hieu | Y nghia |
|---------|---------|
| Pass | Dat |
| Failed | Loi |
| Pending | Chua test / Chua du dieu kien |
| Cancelled | Bo qua / Khong ap dung |
| — | Chua test |

---

# RT.01 — SO KHO

**Module:** Hang hoa va kho
**Duong dan:** Hang hoa va kho > So kho

> Ghi chu: RT.01 da duoc test truoc do (66 buoc, da co ket qua).
> Tham khao ban goc testcase_reborn_crm_retail.md de xem chi tiet.
> Cac loi chinh phat hien:
> - Huy phieu: Thong bao huy thanh cong nhung phieu KHONG bi huy (Failed — lap lai o tat ca tab: Tat ca, Nhap kho, Xuat kho, Chuyen kho, Dieu chinh, Hoan nhap NCC, Hoan xuat KH)
> - Ref tai chinh: Bo trang man (Failed — lap lai o tat ca tab)
> - Them phieu: Khong bam them phieu duoc (Failed — Xuat kho, Chuyen kho, Dieu chinh, Hoan nhap NCC, Hoan xuat KH)
> - Them san pham > Tao moi: Khong them duoc don vi tinh (Failed)
> - Tao don nhap: Khong chon duoc kho hang (Failed)

---

# RT.02 — QUAN LY KHO

**Module:** Hang hoa va kho
**Duong dan:** Hang hoa va kho > Quan ly kho

> Ghi chu: RT.02 da duoc test truoc do (21+ buoc).
> Tham khao ban goc.
> Cac loi chinh:
> - Tao phieu nhap: Khong bam duoc (Failed)
> - Xuat huy > Them san pham: Khong co nut chuyen trang, hien thi co dinh 10 san pham (Failed)

---

# RT.03 — BAN HANG TAI QUAY (POS)

**Module:** Ban hang va don hang
**Duong dan:** Ban hang va don hang > Ban hang tai quay

> Ghi chu: RT.03 da duoc test truoc do (56 buoc).
> Cac loi chinh:
> - Tim kiem theo ten/ma vach/SKU: Khong co gi xay ra (Failed)
> - Quet QR: Khong ket noi voi camera (Failed)
> - Voucher: Chua co man de them voucher (Failed)
> - Thanh toan tien mat: Khong cho nhap qua 4 chu so (Failed)
> - Don tam: Khong hien thong tin khach hang (Failed)
> - Don hang: Khong hien thong tin khach hang (Failed)
> - In bien lai / Xac nhan thanh toan: Khong co gi xay ra (Failed)
> - Dong bo online: Chi hien thong bao, khong goi API (Failed)
> - Xuat bao cao: Khong bam duoc (Failed)

---

# RT.04 — DON HANG ONLINE

**Module:** Ban hang va don hang
**Duong dan:** Ban hang va don hang > Don hang online

> Ghi chu: RT.04 da duoc test truoc do (42 buoc).
> Cac loi chinh:
> - Xuat bao cao / Xuat tat ca don: Khong co gi xay ra (Failed)
> - Xuat Excel: Khong co gi xay ra (Failed)
> - Loc theo trang thai: Khong co gi xay ra (Failed)
> - Xac nhan don: Chi hien thong bao, khong goi API (Failed)
> - In bien lai: Khong co gi xay ra (Failed)
> - Tu choi don: Khong co gi xay ra (Failed)

---

# RT.05 — GIAO HANG VA VAN CHUYEN

**Module:** Ban hang va don hang
**Duong dan:** Giao hang & Van chuyen

> Ghi chu: RT.05 da duoc test truoc do (34 buoc).
> Phan lon Failed — module van chuyen chua hoan thien.

---

# RT.06 — SO THU CHI (BO SUNG DAY DU)

**Module:** Tai chinh va thanh toan
**Duong dan:** Tai chinh & Thanh toan > So thu chi

---

## Buoc 1: So thu chi > Hien thi danh sach

- **Yeu cau:** He thong tra ra danh sach cac ban ghi thu/chi gom: ngay, ma phieu, loai (thu/chi), so tien, noi dung, quy, nguoi tao
- **Output:** He thong hien thi danh sach thu/chi day du thong tin
- **Trang thai:** Pass

---

## Buoc 2: So thu chi > Loc theo thu/chi

- **Input:** Chon tat ca / thu / chi
- **Yeu cau:** He thong tra ra ban ghi ve khoan thu/chi tuong ung
- **Output:** He thong hien thi ban ghi ve khoan thu/chi tuong ung
- **Trang thai:** Pass

---

## Buoc 3: So thu chi > Loc theo thang

- **Input:** Chon loc theo thang / toan bo
- **Yeu cau:** He thong tra ra ban ghi ve khoan thu/chi theo thoi gian duoc chon de loc
- **Output:** He thong hien thi ban ghi ve khoan thu/chi theo thoi gian duoc chon de loc
- **Trang thai:** Pass

---

## Buoc 4: So thu chi > Loc theo quy

- **Input:** Chon quy can loc
- **Yeu cau:** He thong tra ra ban ghi ve khoan thu/chi theo quy can loc
- **Output:** He thong tra ra ban ghi ve khoan thu/chi theo quy can loc
- **Trang thai:** Pass

---

## Buoc 5: So thu chi > Tim kiem

- **Input:** Nhap ma phieu / noi dung can tim
- **Yeu cau:** He thong loc ra cac ban ghi co ma phieu/noi dung tuong ung
- **Output:** He thong hien thi cac ban ghi trung khop
- **Trang thai:** —

---

## Buoc 6: So thu chi > Them phieu thu

- **Trang thai:** —

### 6.1: Them phieu thu > Nhap thieu truong bat buoc

- **Input:** Nhap thieu truong thong tin bat buoc (so tien, noi dung, quy)
- **Yeu cau:** He thong bao loi va khong cho phep luu
- **Output:** He thong bao loi yeu cau nhap du cac truong thong tin bat buoc
- **Trang thai:** —

### 6.2: Them phieu thu > Nhap du thong tin

- **Input:** Nhap du: loai thu/chi = Thu, so tien, noi dung, quy, ngay
- **Yeu cau:** He thong ghi nhan thong tin va tao phieu thu thanh cong
- **Output:** He thong thong bao them thanh cong, phieu thu moi xuat hien trong danh sach
- **Trang thai:** —

### 6.3: Them phieu thu > Nhap so tien am

- **Input:** Nhap so tien < 0
- **Yeu cau:** He thong bao loi, khong cho phep luu
- **Output:** He thong bao loi so tien phai > 0
- **Trang thai:** —

### 6.4: Them phieu thu > Nhap so tien = 0

- **Input:** Nhap so tien = 0
- **Yeu cau:** He thong bao loi, khong cho phep luu
- **Output:** He thong bao loi so tien phai > 0
- **Trang thai:** —

---

## Buoc 7: So thu chi > Them phieu chi

- **Trang thai:** —

### 7.1: Them phieu chi > Nhap du thong tin

- **Input:** Nhap du: loai = Chi, so tien, noi dung, quy, ngay
- **Yeu cau:** He thong ghi nhan va tao phieu chi thanh cong
- **Output:** Phieu chi moi xuat hien trong danh sach, so du quy giam tuong ung
- **Trang thai:** —

### 7.2: Them phieu chi > So tien chi vuot so du quy

- **Input:** Nhap so tien chi lon hon so du hien tai cua quy
- **Yeu cau:** He thong canh bao hoac khong cho phep
- **Output:** He thong canh bao so du khong du
- **Trang thai:** —

---

## Buoc 8: So thu chi > Xem chi tiet phieu

- **Input:** Click vao 1 phieu thu/chi trong danh sach
- **Yeu cau:** He thong hien thi chi tiet phieu gom: ma phieu, loai, so tien, noi dung, quy, ngay tao, nguoi tao
- **Output:** He thong hien thi day du thong tin chi tiet
- **Trang thai:** —

---

## Buoc 9: So thu chi > Sua phieu

- **Trang thai:** —

### 9.1: Sua phieu > Sua noi dung

- **Input:** Thay doi noi dung phieu
- **Yeu cau:** He thong cap nhat thong tin
- **Output:** Thong tin phieu duoc cap nhat thanh cong
- **Trang thai:** —

### 9.2: Sua phieu > Sua so tien

- **Input:** Thay doi so tien
- **Yeu cau:** He thong cap nhat so tien, so du quy thay doi tuong ung
- **Output:** So tien duoc cap nhat, so du quy tinh lai dung
- **Trang thai:** —

---

## Buoc 10: So thu chi > Xoa phieu

- **Trang thai:** —

### 10.1: Xoa phieu > Hop thoai xac nhan > Xoa

- **Yeu cau:** He thong xoa phieu khoi danh sach, so du quy duoc tinh lai
- **Output:** Phieu bi xoa, so du quy cap nhat
- **Trang thai:** —

### 10.2: Xoa phieu > Hop thoai xac nhan > Huy

- **Yeu cau:** He thong dung hanh dong, quay lai trang thai truoc do
- **Output:** Hop thoai bi dong, phieu van con
- **Trang thai:** —

---

## Buoc 11: So thu chi > Xuat Excel

- **Yeu cau:** He thong tao file Excel chua danh sach thu/chi theo bo loc hien tai
- **Output:** File Excel duoc tai ve thanh cong
- **Trang thai:** —

---

## Buoc 12: So thu chi > Hien thi so muc

- **Input:** Chon so luong muc muon hien thi (10/20/50)
- **Yeu cau:** He thong hien thi so luong ban ghi tuong ung
- **Output:** Danh sach hien thi dung so luong da chon
- **Trang thai:** —

---

## Buoc 13: So thu chi > Phan trang

- **Input:** Chuyen trang (Truoc / Sau / Chon trang cu the)
- **Yeu cau:** He thong hien thi dung du lieu cua trang duoc chon
- **Output:** Du lieu hien thi dung theo trang
- **Trang thai:** —

---

## Buoc 14: So thu chi > Loc theo khoang ngay

- **Input:** Chon ngay bat dau va ngay ket thuc
- **Yeu cau:** He thong loc cac phieu thu/chi trong khoang thoi gian
- **Output:** Danh sach chi hien thi phieu trong khoang ngay da chon
- **Trang thai:** —

---

## Buoc 15: So thu chi > Loc theo danh muc thu/chi

- **Input:** Chon danh muc (VD: Doanh thu ban hang, Chi phi nguyen lieu, Luong nhan vien...)
- **Yeu cau:** He thong loc theo danh muc
- **Output:** Danh sach chi hien thi phieu thuoc danh muc da chon
- **Trang thai:** —

---

## Buoc 16: So thu chi > Mau phieu thu chi

- **Yeu cau:** He thong hien thi danh sach cac mau phieu thu chi da tao
- **Output:** Danh sach mau phieu duoc hien thi
- **Trang thai:** —

---

## Buoc 17: So thu chi > Mau phieu > Tao mau moi

### 17.1: Tao mau > Nhap du thong tin

- **Input:** Nhap ten mau, loai (thu/chi), so tien mac dinh, noi dung mac dinh
- **Yeu cau:** Mau moi duoc tao thanh cong
- **Output:** Mau xuat hien trong danh sach mau
- **Trang thai:** —

### 17.2: Tao mau > Nhap thieu thong tin

- **Input:** Nhap thieu ten mau
- **Yeu cau:** He thong bao loi
- **Output:** He thong yeu cau nhap du thong tin bat buoc
- **Trang thai:** —

---

## Buoc 18: So thu chi > Mau phieu > Su dung mau

- **Input:** Chon 1 mau > Tao phieu tu mau
- **Yeu cau:** He thong dien san thong tin tu mau vao form them phieu
- **Output:** Form them phieu hien thi voi thong tin da dien san tu mau
- **Trang thai:** —

---

## Buoc 19: So thu chi > Mau phieu > Xoa mau

- **Yeu cau:** Mau bi xoa khoi danh sach
- **Output:** Mau khong con trong danh sach
- **Trang thai:** —

---

## Buoc 20: So thu chi > Tong hop

- **Yeu cau:** He thong hien thi tong thu, tong chi, so du theo bo loc hien tai
- **Output:** Tong thu/chi/so du duoc tinh dung
- **Trang thai:** —

---

# RT.07 — HOA DON VAT

> Ghi chu: RT.07 da duoc test truoc do (49 buoc).
> Tham khao ban goc.
> Cac loi chinh:
> - Xuat bao cao: Khong co gi xay ra (Failed)
> - Ky so / Thay the: Khong co gi xay ra (Failed)
> - Tai PDF: Hien thong bao dang tai nhung khong co file that (Failed)
> - Gui lai email: Hien thong bao nhung khong gui (Failed)
> - Dieu chinh HD: Hien thong bao tinh nang dang phat trien (Failed)
> - Xuat Excel: Khong co gi xay ra (Failed)
> - Bo loc nang cao / PDF / Email / Ky so / Thay the tren danh sach: Khong co gi xay ra (Failed)
> - Xem truoc: Hien du lieu khac voi da nhap — dang fix cung du lieu (Failed)
> - Ky so & Phat hanh ngay: Chi co thong bao (Failed)
> - NCC HDDT > Chon NCC: Khong co gi xay ra (Failed)
> - Kiem tra ket noi / Luu & Ket noi: Chi hien thong bao, khong goi API (Failed)
> - Luu cau hinh: Chi hien thong bao, khong goi API (Failed)
> - Tim kiem theo MST: Khong hien ket qua tuong ung (Failed)
> - Loc theo thoi gian xuat HD: Khong hien ket qua tuong ung (Failed)

---

# RT.08 — QUAN LY SAN PHAM & DICH VU (MOI)

**Module:** Hang hoa va kho > Cai dat ban hang
**Duong dan:** Cai dat > San pham / Dich vu

---

## Buoc 1: San pham > Hien thi danh sach

- **Yeu cau:** He thong hien thi danh sach san pham gom: hinh anh, ten, SKU, ma vach, nhom, gia ban, ton kho, trang thai
- **Output:** Danh sach san pham duoc hien thi day du
- **Trang thai:** —

---

## Buoc 2: San pham > Tim kiem

- **Input:** Nhap ten san pham / SKU / ma vach
- **Yeu cau:** He thong loc san pham theo tu khoa
- **Output:** Danh sach san pham trung khop
- **Trang thai:** —

---

## Buoc 3: San pham > Loc theo nhom san pham

- **Input:** Chon nhom san pham
- **Yeu cau:** He thong chi hien san pham thuoc nhom da chon
- **Output:** Danh sach san pham theo nhom
- **Trang thai:** —

---

## Buoc 4: San pham > Them san pham moi

- **Trang thai:** —

### 4.1: Them SP > Nhap thieu truong bat buoc

- **Input:** Nhap thieu ten san pham
- **Yeu cau:** He thong bao loi
- **Output:** Yeu cau nhap du truong bat buoc
- **Trang thai:** —

### 4.2: Them SP > Nhap du thong tin

- **Input:** Ten, SKU, ma vach, nhom, don vi tinh, gia ban, gia von, mo ta, hinh anh
- **Yeu cau:** San pham duoc tao thanh cong
- **Output:** San pham moi xuat hien trong danh sach
- **Trang thai:** —

### 4.3: Them SP > Nhap SKU trung

- **Input:** Nhap SKU da ton tai
- **Yeu cau:** He thong bao loi trung SKU
- **Output:** Khong cho phep tao
- **Trang thai:** —

### 4.4: Them SP > Them phan loai (variants)

- **Input:** Them thuoc tinh: Mau sac (Do, Xanh), Size (S, M, L)
- **Yeu cau:** He thong tao cac bien the tuong ung
- **Output:** Danh sach bien the duoc tao (Do-S, Do-M, Do-L, Xanh-S, Xanh-M, Xanh-L)
- **Trang thai:** —

### 4.5: Them SP > Upload hinh anh

- **Input:** Upload 1-5 hinh anh san pham
- **Yeu cau:** He thong tai len va hien thi hinh anh
- **Output:** Hinh anh duoc hien thi trong chi tiet san pham
- **Trang thai:** —

---

## Buoc 5: San pham > Xem chi tiet

- **Input:** Click vao san pham
- **Yeu cau:** He thong hien thi day du: thong tin co ban, hinh anh, phan loai, gia, ton kho, lich su nhap/xuat
- **Output:** Trang chi tiet san pham
- **Trang thai:** —

---

## Buoc 6: San pham > Sua thong tin

### 6.1: Sua ten, mo ta, gia ban

- **Input:** Thay doi ten, mo ta, gia ban
- **Yeu cau:** He thong cap nhat thanh cong
- **Output:** Thong tin duoc cap nhat
- **Trang thai:** —

### 6.2: Sua gia von

- **Input:** Thay doi gia von
- **Yeu cau:** Gia von duoc cap nhat, bao cao loi nhuan thay doi tuong ung
- **Output:** Gia von moi duoc luu
- **Trang thai:** —

---

## Buoc 7: San pham > Xoa san pham

### 7.1: Xoa SP khong co giao dich

- **Yeu cau:** San pham bi xoa khoi danh sach
- **Output:** San pham khong con ton tai
- **Trang thai:** —

### 7.2: Xoa SP da co giao dich

- **Yeu cau:** He thong canh bao hoac khong cho phep xoa
- **Output:** He thong bao loi san pham da co giao dich
- **Trang thai:** —

---

## Buoc 8: San pham > An/Hien san pham

- **Input:** Toggle trang thai an/hien
- **Yeu cau:** San pham bi an khong hien thi tren POS
- **Output:** San pham khong xuat hien khi ban hang
- **Trang thai:** —

---

## Buoc 9: San pham > Xuat Excel danh sach

- **Yeu cau:** File Excel chua danh sach san pham duoc tai ve
- **Output:** File Excel day du thong tin
- **Trang thai:** —

---

## Buoc 10: San pham > Nhap tu Excel

### 10.1: Nhap file dung dinh dang

- **Input:** Upload file Excel theo mau
- **Yeu cau:** San pham duoc import thanh cong
- **Output:** Cac san pham moi xuat hien trong danh sach
- **Trang thai:** —

### 10.2: Nhap file sai dinh dang

- **Input:** Upload file sai cot/du lieu
- **Yeu cau:** He thong bao loi, tra ve file loi
- **Output:** File loi co danh dau dong sai
- **Trang thai:** —

---

## Buoc 11: Nhom san pham > CRUD

### 11.1: Them nhom san pham

- **Input:** Ten nhom, mo ta
- **Yeu cau:** Nhom moi duoc tao
- **Output:** Nhom xuat hien trong danh sach
- **Trang thai:** —

### 11.2: Sua nhom san pham

- **Input:** Doi ten nhom
- **Yeu cau:** Ten nhom duoc cap nhat
- **Trang thai:** —

### 11.3: Xoa nhom san pham

- **Yeu cau:** Nhom bi xoa (neu khong co san pham)
- **Trang thai:** —

---

## Buoc 12: Dich vu > Hien thi danh sach

- **Yeu cau:** He thong hien thi danh sach dich vu gom: ten, gia, thoi luong, nhom, trang thai
- **Output:** Danh sach dich vu
- **Trang thai:** —

---

## Buoc 13: Dich vu > Them moi

### 13.1: Nhap du thong tin

- **Input:** Ten dich vu, gia, thoi luong, mo ta
- **Yeu cau:** Dich vu duoc tao thanh cong
- **Trang thai:** —

### 13.2: Nhap thieu

- **Yeu cau:** He thong bao loi
- **Trang thai:** —

---

## Buoc 14: Dich vu > Sua / Xoa

- **Tuong tu san pham**
- **Trang thai:** —

---

## Buoc 15: Don vi tinh > CRUD

### 15.1: Them don vi tinh moi

- **Input:** Ten don vi (Cai, Chiec, Kg, Lit, Hop...)
- **Yeu cau:** Don vi duoc tao
- **Trang thai:** —

### 15.2: Sua / Xoa don vi tinh

- **Trang thai:** —

---

# RT.09 — QUAN LY KHACH HANG (MOI)

**Module:** Khach hang
**Duong dan:** Khach hang > Danh sach khach hang

---

## Buoc 1: Khach hang > Hien thi danh sach

- **Yeu cau:** He thong hien thi danh sach khach hang gom: ten, SDT, email, nhom, nguon, tong chi tieu, so don
- **Output:** Danh sach khach hang
- **Trang thai:** —

---

## Buoc 2: Khach hang > Tim kiem

- **Input:** Nhap ten / SDT / email
- **Yeu cau:** He thong loc khach hang theo tu khoa
- **Output:** Danh sach khach hang trung khop
- **Trang thai:** —

---

## Buoc 3: Khach hang > Them khach hang moi

### 3.1: Nhap thieu truong bat buoc

- **Input:** Bo trong ten hoac SDT
- **Yeu cau:** He thong bao loi
- **Output:** Yeu cau nhap du thong tin bat buoc
- **Trang thai:** —

### 3.2: Nhap du thong tin

- **Input:** Ten, SDT, email, gioi tinh, ngay sinh, dia chi, nhom KH, nguon KH
- **Yeu cau:** Khach hang duoc tao thanh cong
- **Output:** Khach hang moi xuat hien trong danh sach
- **Trang thai:** —

### 3.3: Nhap SDT trung

- **Input:** SDT da ton tai
- **Yeu cau:** He thong canh bao trung SDT
- **Output:** Canh bao trung, cho phep tiep tuc hoac huy
- **Trang thai:** —

### 3.4: Nhap email sai dinh dang

- **Input:** Email khong hop le (vd: "abc@")
- **Yeu cau:** He thong bao loi dinh dang email
- **Output:** He thong bao loi
- **Trang thai:** —

### 3.5: Nhap SDT sai dinh dang

- **Input:** SDT qua ngan / qua dai / co ky tu chu
- **Yeu cau:** He thong bao loi dinh dang SDT
- **Output:** He thong bao loi
- **Trang thai:** —

---

## Buoc 4: Khach hang > Xem chi tiet

- **Input:** Click vao khach hang
- **Yeu cau:** He thong hien thi: thong tin ca nhan, lich su mua hang, lich su cham soc, diem tich luy, cong no
- **Output:** Trang chi tiet khach hang 360 do
- **Trang thai:** —

---

## Buoc 5: Khach hang > Sua thong tin

### 5.1: Sua ten, SDT, email, dia chi

- **Yeu cau:** Thong tin duoc cap nhat thanh cong
- **Trang thai:** —

### 5.2: Doi nhom khach hang

- **Input:** Chuyen tu nhom A sang nhom B
- **Yeu cau:** He thong cap nhat nhom
- **Trang thai:** —

---

## Buoc 6: Khach hang > Xoa khach hang

### 6.1: Xoa KH khong co giao dich

- **Yeu cau:** Khach hang bi xoa
- **Trang thai:** —

### 6.2: Xoa KH da co giao dich

- **Yeu cau:** He thong canh bao khong cho xoa hoac chuyen trang thai
- **Trang thai:** —

---

## Buoc 7: Khach hang > Loc theo nhom

- **Input:** Chon nhom khach hang
- **Yeu cau:** Danh sach chi hien KH thuoc nhom da chon
- **Trang thai:** —

---

## Buoc 8: Khach hang > Loc theo nguon

- **Input:** Chon nguon (Facebook, Zalo, Walk-in, Website...)
- **Yeu cau:** Danh sach loc theo nguon
- **Trang thai:** —

---

## Buoc 9: Khach hang > Xuat Excel

- **Yeu cau:** File Excel chua danh sach khach hang
- **Output:** File duoc tai ve
- **Trang thai:** —

---

## Buoc 10: Khach hang > Nhap tu Excel

### 10.1: Nhap file dung mau

- **Yeu cau:** KH duoc import thanh cong
- **Trang thai:** —

### 10.2: Nhap file sai dinh dang

- **Yeu cau:** He thong tra file loi
- **Trang thai:** —

---

## Buoc 11: Khach hang > Thao tac hang loat

### 11.1: Chon nhieu KH > Doi nhom

- **Input:** Chon 5 KH > Doi sang nhom VIP
- **Yeu cau:** 5 KH duoc chuyen nhom thanh cong
- **Trang thai:** —

### 11.2: Chon nhieu KH > Doi nguon

- **Input:** Chon nhieu KH > Doi nguon
- **Yeu cau:** Nguon duoc cap nhat
- **Trang thai:** —

### 11.3: Chon nhieu KH > Xoa

- **Yeu cau:** Xoa thanh cong (neu khong co giao dich)
- **Trang thai:** —

---

## Buoc 12: Nhom khach hang > CRUD

### 12.1: Them nhom

- **Input:** Ten nhom, mo ta
- **Yeu cau:** Nhom moi duoc tao
- **Trang thai:** —

### 12.2: Sua nhom

- **Trang thai:** —

### 12.3: Xoa nhom

- **Trang thai:** —

---

## Buoc 13: Nguon khach hang > CRUD

### 13.1: Them nguon

- **Input:** Ten nguon
- **Yeu cau:** Nguon moi duoc tao
- **Trang thai:** —

### 13.2: Sua / Xoa nguon

- **Trang thai:** —

---

## Buoc 14: Phan tich khach hang

- **Yeu cau:** He thong hien thi: top KH theo doanh thu, theo so don, theo tan suat mua, phan bo theo nhom/nguon
- **Output:** Bieu do va bang phan tich KH
- **Trang thai:** —

---

## Buoc 15: Hien thi so muc / Phan trang

- **Tuong tu cac module khac**
- **Trang thai:** —

---

# RT.10 — KHUYEN MAI & LOYALTY (MOI)

**Module:** Marketing > Khuyen mai / Tich diem
**Duong dan:** Marketing

---

## Buoc 1: Chuong trinh khuyen mai > Hien thi danh sach

- **Yeu cau:** He thong hien thi danh sach CTKM gom: ten, loai, thoi gian, trang thai, so don ap dung
- **Output:** Danh sach CTKM
- **Trang thai:** —

---

## Buoc 2: CTKM > Them moi

### 2.1: Khuyen mai % giam gia

- **Input:** Ten KM, loai = % giam gia, gia tri = 10%, ap dung = Tat ca SP, thoi gian bat dau/ket thuc
- **Yeu cau:** CTKM duoc tao thanh cong
- **Trang thai:** —

### 2.2: Khuyen mai gia co dinh

- **Input:** Loai = Gia co dinh, gia tri = 199,000 VND, ap dung = SP cu the
- **Yeu cau:** CTKM duoc tao
- **Trang thai:** —

### 2.3: Mua X tang Y

- **Input:** Loai = BOGO, mua 2 tang 1, ap dung = Nhom SP
- **Yeu cau:** CTKM duoc tao
- **Trang thai:** —

### 2.4: Nhap thieu thong tin

- **Yeu cau:** He thong bao loi
- **Trang thai:** —

### 2.5: Thoi gian ket thuc < bat dau

- **Input:** Ngay ket thuc truoc ngay bat dau
- **Yeu cau:** He thong bao loi
- **Trang thai:** —

---

## Buoc 3: CTKM > Sua

- **Yeu cau:** Cap nhat thong tin CTKM
- **Trang thai:** —

---

## Buoc 4: CTKM > Kich hoat / Tam dung / Ket thuc

### 4.1: Kich hoat

- **Yeu cau:** CTKM chuyen trang thai "Dang hoat dong"
- **Trang thai:** —

### 4.2: Tam dung

- **Yeu cau:** CTKM chuyen "Tam dung", khong ap dung khi ban hang
- **Trang thai:** —

### 4.3: Ket thuc

- **Yeu cau:** CTKM chuyen "Da ket thuc"
- **Trang thai:** —

---

## Buoc 5: CTKM > Xoa

- **Yeu cau:** Xoa CTKM (chi xoa duoc khi chua co don ap dung)
- **Trang thai:** —

---

## Buoc 6: CTKM > Kiem tra ap dung tren POS

- **Input:** Tao don hang voi SP thuoc CTKM dang hoat dong
- **Yeu cau:** Gia ban duoc giam dung theo CTKM
- **Output:** Gia tren hoa don dung sau khi ap dung KM
- **Trang thai:** —

---

## Buoc 7: CTKM > Bao cao hieu qua

- **Yeu cau:** He thong hien thi: so don ap dung, doanh thu truoc/sau KM, ty le chuyen doi
- **Trang thai:** —

---

## Buoc 8: Ma khuyen mai (Coupon) > Hien thi danh sach

- **Yeu cau:** Danh sach ma KM gom: ma, loai giam gia, gia tri, so lan su dung, trang thai
- **Trang thai:** —

---

## Buoc 9: Coupon > Tao ma moi

### 9.1: Tao ma thu cong

- **Input:** Ma = SALE50, loai = %, gia tri = 50%, so lan su dung toi da = 100, thoi han
- **Yeu cau:** Ma KM duoc tao
- **Trang thai:** —

### 9.2: Tao ma tu dong (batch)

- **Input:** So luong = 50, prefix = VIP, loai = so tien co dinh = 100,000
- **Yeu cau:** He thong tao 50 ma tu dong
- **Trang thai:** —

---

## Buoc 10: Coupon > Ap dung tren POS

- **Input:** Nhap ma coupon khi thanh toan
- **Yeu cau:** Gia duoc giam dung, so lan su dung coupon tru 1
- **Trang thai:** —

---

## Buoc 11: Coupon > Ma het han / Het luot

- **Input:** Nhap ma da het han hoac da het luot su dung
- **Yeu cau:** He thong bao loi ma khong hop le
- **Trang thai:** —

---

## Buoc 12: Loyalty > Cai dat quy tac tich diem

- **Input:** Cau hinh: 10,000 VND = 1 diem, ap dung cho tat ca don hang
- **Yeu cau:** Quy tac duoc luu
- **Trang thai:** —

---

## Buoc 13: Loyalty > Tich diem tu dong khi ban hang

- **Input:** Tao don hang 500,000 VND cho KH co tai khoan
- **Yeu cau:** KH nhan 50 diem tu dong
- **Output:** Diem cong vao tai khoan KH
- **Trang thai:** —

---

## Buoc 14: Loyalty > So diem (Ledger)

- **Yeu cau:** He thong hien thi lich su cong/tru diem cua KH
- **Output:** Bang ghi: ngay, loai (cong/tru), so diem, ly do, so du
- **Trang thai:** —

---

## Buoc 15: Loyalty > Doi diem

- **Input:** KH doi 100 diem = giam 50,000 VND
- **Yeu cau:** Diem bi tru, gia don hang giam tuong ung
- **Trang thai:** —

---

## Buoc 16: Loyalty > Phan hang thanh vien

- **Yeu cau:** He thong tu dong phan hang KH theo tieu chi (diem, chi tieu)
- **Output:** KH duoc gan hang (Dong, Bac, Vang, Kim cuong)
- **Trang thai:** —

---

## Buoc 17: Loyalty > Vi thanh vien

- **Yeu cau:** He thong hien thi so du vi, lich su giao dich
- **Trang thai:** —

---

## Buoc 18: Loyalty > Bao cao

- **Yeu cau:** Tong diem da phat, da doi, con hieu luc. Phan bo theo hang thanh vien
- **Trang thai:** —

---

# RT.11 — DASHBOARD & BAO CAO (MOI)

**Module:** Dashboard / Bao cao
**Duong dan:** Dashboard, Bao cao

---

## Buoc 1: Dashboard > Hien thi tong quan

- **Yeu cau:** He thong hien thi: doanh thu hom nay, so don hom nay, so KH moi, gia tri trung binh/don
- **Output:** Dashboard voi cac KPI chinh
- **Trang thai:** —

---

## Buoc 2: Dashboard > Bieu do doanh thu

- **Yeu cau:** Bieu do doanh thu theo ngay/tuan/thang
- **Output:** Bieu do duoc hien thi chinh xac
- **Trang thai:** —

---

## Buoc 3: Dashboard > Loc theo thoi gian

- **Input:** Chon: Hom nay / 7 ngay / 30 ngay / Thang nay / Tuy chon
- **Yeu cau:** Dashboard cap nhat theo thoi gian da chon
- **Trang thai:** —

---

## Buoc 4: Dashboard > San pham ban chay

- **Yeu cau:** Top 10 san pham ban chay nhat (theo so luong va doanh thu)
- **Trang thai:** —

---

## Buoc 5: Dashboard > Phuong thuc thanh toan

- **Yeu cau:** Phan bo doanh thu theo PTTT (tien mat, chuyen khoan, QR, the)
- **Trang thai:** —

---

## Buoc 6: Bao cao doanh thu > Hien thi

- **Yeu cau:** Bao cao chi tiet: doanh thu theo ngay, theo san pham, theo nhan vien, theo khach hang
- **Output:** Bang bao cao voi tong hop
- **Trang thai:** —

---

## Buoc 7: Bao cao doanh thu > Loc

- **Input:** Loc theo khoang ngay, nhan vien, san pham, nhom SP
- **Yeu cau:** Du lieu loc chinh xac
- **Trang thai:** —

---

## Buoc 8: Bao cao doanh thu > Xuat Excel

- **Yeu cau:** File Excel chua du lieu bao cao
- **Trang thai:** —

---

## Buoc 9: Bao cao ton kho

- **Yeu cau:** Ton kho hien tai, gia tri ton, san pham sap het, san pham ton lau
- **Trang thai:** —

---

## Buoc 10: Bao cao khach hang

- **Yeu cau:** KH moi, KH quay lai, KH co gia tri nhat, phan bo theo nhom/nguon
- **Trang thai:** —

---

## Buoc 11: Bao cao khuyen mai

- **Yeu cau:** Hieu qua CTKM, so don ap dung, doanh thu tu KM
- **Trang thai:** —

---

## Buoc 12: Bao cao van chuyen

- **Yeu cau:** So don van chuyen, ty le giao thanh cong, thoi gian trung binh, chi phi
- **Trang thai:** —

---

# RT.12 — CA LAM VIEC & KET CA (MOI)

**Module:** Ban hang > Ca lam viec
**Duong dan:** Ban hang > Ca lam viec

---

## Buoc 1: Ca lam viec > Hien thi danh sach

- **Yeu cau:** Danh sach ca gom: ten ca, gio bat dau, gio ket thuc, nhan vien phu trach, trang thai
- **Trang thai:** —

---

## Buoc 2: Ca lam viec > Mo ca

- **Input:** Chon ca, nhap so tien dau ca, ghi chu
- **Yeu cau:** Ca duoc mo, POS san sang ban hang
- **Output:** Trang thai ca chuyen "Dang hoat dong"
- **Trang thai:** —

---

## Buoc 3: Ca lam viec > Ket ca

- **Input:** Nhap so tien cuoi ca thuc te (tien mat, chuyen khoan)
- **Yeu cau:** He thong tinh: doanh thu ca, so don, chenh lech tien mat thuc te vs he thong
- **Output:** Bao cao ket ca hien thi: tong thu, tong chi, chenh lech
- **Trang thai:** —

---

## Buoc 4: Ket ca > Chenh lech tien mat

- **Input:** So tien thuc te != so tien he thong
- **Yeu cau:** He thong hien thi chenh lech va yeu cau giai trinh
- **Output:** Ghi nhan chenh lech vao bao cao
- **Trang thai:** —

---

## Buoc 5: Ca lam viec > Cau hinh ca

### 5.1: Them ca moi

- **Input:** Ten ca, gio bat dau, gio ket thuc
- **Yeu cau:** Ca moi duoc tao
- **Trang thai:** —

### 5.2: Sua ca

- **Trang thai:** —

### 5.3: Xoa ca

- **Trang thai:** —

---

## Buoc 6: Ca lam viec > Bao cao theo ca

- **Yeu cau:** Doanh thu, so don, nhan vien theo tung ca
- **Trang thai:** —

---

## Buoc 7: Ca lam viec > Lich su ket ca

- **Yeu cau:** Danh sach tat ca lan ket ca, thoi gian, nhan vien, chenh lech
- **Trang thai:** —

---

# RT.13 — QUAN LY CONG NO (MOI)

**Module:** Tai chinh > Cong no
**Duong dan:** Tai chinh > Quan ly cong no

---

## Buoc 1: Cong no > Hien thi danh sach

- **Yeu cau:** Danh sach cong no gom: ten KH/NCC, loai (phai thu/phai tra), so tien, han tra, trang thai
- **Trang thai:** —

---

## Buoc 2: Cong no > Loc phai thu

- **Yeu cau:** Chi hien cong no phai thu (KH no)
- **Trang thai:** —

---

## Buoc 3: Cong no > Loc phai tra

- **Yeu cau:** Chi hien cong no phai tra (no NCC)
- **Trang thai:** —

---

## Buoc 4: Cong no > Loc qua han

- **Yeu cau:** Chi hien cong no da qua han thanh toan
- **Trang thai:** —

---

## Buoc 5: Cong no > Tao cong no moi

- **Input:** KH/NCC, so tien, han tra, ghi chu
- **Yeu cau:** Cong no duoc tao
- **Trang thai:** —

---

## Buoc 6: Cong no > Ghi nhan thanh toan

- **Input:** Chon cong no > Nhap so tien da tra
- **Yeu cau:** So tien con lai giam, neu tra het → trang thai "Da thanh toan"
- **Trang thai:** —

---

## Buoc 7: Cong no > Thanh toan 1 phan

- **Input:** Cong no 10 trieu, tra 3 trieu
- **Yeu cau:** Con lai 7 trieu, trang thai "Con no"
- **Trang thai:** —

---

## Buoc 8: Cong no > QR thanh toan

- **Yeu cau:** He thong tao QR code de KH thanh toan
- **Output:** QR code duoc hien thi
- **Trang thai:** —

---

## Buoc 9: Cong no > Xuat Excel

- **Yeu cau:** File Excel chua danh sach cong no
- **Trang thai:** —

---

## Buoc 10: Cong no > Tim kiem

- **Input:** Nhap ten KH/NCC
- **Yeu cau:** Loc cong no theo KH/NCC
- **Trang thai:** —

---

# RT.14 — QUAN LY QUY (MOI)

**Module:** Tai chinh > Quan ly quy
**Duong dan:** Tai chinh > Quan ly quy

---

## Buoc 1: Quy > Hien thi danh sach

- **Yeu cau:** Danh sach quy gom: ten quy, so du, trang thai (mo/dong)
- **Trang thai:** —

---

## Buoc 2: Quy > Tao quy moi

- **Input:** Ten quy, so du ban dau, mo ta
- **Yeu cau:** Quy moi duoc tao
- **Trang thai:** —

---

## Buoc 3: Quy > Mo / Dong quy

### 3.1: Dong quy

- **Yeu cau:** Quy chuyen trang thai "Da dong", khong cho phep thu/chi tu quy nay
- **Trang thai:** —

### 3.2: Mo lai quy

- **Yeu cau:** Quy chuyen trang thai "Dang hoat dong"
- **Trang thai:** —

---

## Buoc 4: Quy > Xem lich su giao dich

- **Input:** Chon 1 quy
- **Yeu cau:** He thong hien thi lich su thu/chi cua quy
- **Trang thai:** —

---

## Buoc 5: Quy > Chuyen tien giua cac quy

- **Input:** Chuyen 1 trieu tu Quy A sang Quy B
- **Yeu cau:** So du Quy A giam 1 trieu, Quy B tang 1 trieu
- **Trang thai:** —

---

## Buoc 6: Quy > Xoa quy

### 6.1: Xoa quy rong (so du = 0, khong co giao dich)

- **Yeu cau:** Quy bi xoa
- **Trang thai:** —

### 6.2: Xoa quy co so du

- **Yeu cau:** He thong canh bao, khong cho xoa
- **Trang thai:** —

---

# RT.15 — KHACH TRA HANG (MOI)

**Module:** Ban hang > Khach tra hang
**Duong dan:** Ban hang > Khach tra hang

---

## Buoc 1: Tra hang > Hien thi danh sach

- **Yeu cau:** Danh sach phieu tra hang gom: ma phieu, KH, san pham, so tien hoan, ngay tra, trang thai
- **Trang thai:** —

---

## Buoc 2: Tra hang > Tao phieu tra hang

### 2.1: Chon don hang goc

- **Input:** Nhap ma don hang / chon tu danh sach
- **Yeu cau:** He thong hien thi thong tin don hang goc (SP, so luong, gia)
- **Trang thai:** —

### 2.2: Chon SP tra

- **Input:** Chon SP can tra, nhap so luong tra
- **Yeu cau:** He thong tinh so tien hoan lai
- **Trang thai:** —

### 2.3: Xac nhan tra hang

- **Input:** Chon ly do tra, ghi chu
- **Yeu cau:** Phieu tra hang duoc tao, ton kho tang lai, so tien hoan ghi nhan
- **Trang thai:** —

### 2.4: Tra so luong > so luong da mua

- **Input:** So luong tra = 5, so luong da mua = 3
- **Yeu cau:** He thong bao loi
- **Trang thai:** —

---

## Buoc 3: Tra hang > Xem chi tiet phieu tra

- **Yeu cau:** Thong tin don goc, SP tra, so tien hoan, ly do, trang thai
- **Trang thai:** —

---

## Buoc 4: Tra hang > Hoan tien

- **Yeu cau:** So tien hoan duoc ghi nhan vao so thu chi, vi KH, hoac tra mat
- **Trang thai:** —

---

## Buoc 5: Tra hang > Tim kiem / Loc

- **Input:** Tim theo ma phieu, ten KH, khoang ngay
- **Yeu cau:** Loc chinh xac
- **Trang thai:** —

---

## Buoc 6: Tra hang > Xuat Excel

- **Trang thai:** —

---

# RT.16 — DOI SOAT THANH TOAN (MOI)

**Module:** Tai chinh > Doi soat thanh toan
**Duong dan:** Tai chinh > Doi soat thanh toan

---

## Buoc 1: Doi soat > Hien thi danh sach

- **Yeu cau:** Danh sach giao dich can doi soat: ma GD, so tien, phuong thuc, trang thai (khop/chua khop/loi)
- **Trang thai:** —

---

## Buoc 2: Doi soat > Loc theo phuong thuc thanh toan

- **Input:** Chon: Tien mat / Chuyen khoan / QR Pro / The
- **Yeu cau:** Loc theo PTTT
- **Trang thai:** —

---

## Buoc 3: Doi soat > Loc theo trang thai

- **Input:** Chon: Tat ca / Khop / Chua khop / Loi
- **Yeu cau:** Loc theo trang thai doi soat
- **Trang thai:** —

---

## Buoc 4: Doi soat > Xac nhan doi soat

- **Input:** Chon giao dich > Xac nhan khop
- **Yeu cau:** Giao dich chuyen trang thai "Da doi soat"
- **Trang thai:** —

---

## Buoc 5: Doi soat > Xuat bao cao doi soat

- **Yeu cau:** File Excel chua chi tiet doi soat
- **Trang thai:** —

---

# RT.17 — CAI DAT HE THONG (MOI)

**Module:** Cai dat
**Duong dan:** Cai dat

---

## Buoc 1: Cai dat > Thong tin cua hang

- **Input:** Ten cua hang, dia chi, SDT, logo, website
- **Yeu cau:** Thong tin duoc luu
- **Output:** Thong tin hien thi tren hoa don, bien lai
- **Trang thai:** —

---

## Buoc 2: Cai dat > Phuong thuc thanh toan

### 2.1: Hien thi danh sach PTTT

- **Yeu cau:** Danh sach PTTT: Tien mat, Chuyen khoan, QR, The
- **Trang thai:** —

### 2.2: Bat / Tat PTTT

- **Input:** Toggle trang thai
- **Yeu cau:** PTTT hien/an tren man hinh thanh toan POS
- **Trang thai:** —

### 2.3: Cau hinh tai khoan ngan hang

- **Input:** Nhap ten NH, so TK, chu TK
- **Yeu cau:** Thong tin hien thi khi KH chon chuyen khoan
- **Trang thai:** —

---

## Buoc 3: Cai dat > Ca lam viec

- *Xem RT.12*
- **Trang thai:** —

---

## Buoc 4: Cai dat > Nhan vien

### 4.1: Hien thi danh sach nhan vien

- **Yeu cau:** Danh sach NV gom: ten, SDT, email, vi tri, trang thai
- **Trang thai:** —

### 4.2: Them nhan vien

- **Input:** Ten, SDT, email, vi tri, mat khau
- **Yeu cau:** NV duoc tao, tai khoan dang nhap san sang
- **Trang thai:** —

### 4.3: Sua thong tin NV

- **Trang thai:** —

### 4.4: Vo hieu hoa NV

- **Yeu cau:** NV khong the dang nhap
- **Trang thai:** —

---

## Buoc 5: Cai dat > Phan quyen

### 5.1: Hien thi danh sach nhom quyen

- **Yeu cau:** Danh sach nhom quyen (Admin, Quan ly, Nhan vien, Thu ngan...)
- **Trang thai:** —

### 5.2: Tao nhom quyen moi

- **Input:** Ten nhom, chon cac quyen (xem/them/sua/xoa theo module)
- **Yeu cau:** Nhom quyen duoc tao
- **Trang thai:** —

### 5.3: Gan nhom quyen cho NV

- **Input:** Chon NV > Gan nhom quyen
- **Yeu cau:** NV chi truy cap duoc cac chuc nang theo quyen
- **Trang thai:** —

### 5.4: Kiem tra phan quyen

- **Input:** Dang nhap voi NV chi co quyen "Ban hang"
- **Yeu cau:** NV khong thay menu: Cai dat, Tai chinh, Bao cao
- **Output:** Menu chi hien POS va don hang
- **Trang thai:** —

---

## Buoc 6: Cai dat > Phong ban

### 6.1: Them phong ban

- **Input:** Ten phong ban, mo ta
- **Yeu cau:** Phong ban duoc tao
- **Trang thai:** —

### 6.2: Sua / Xoa phong ban

- **Trang thai:** —

---

## Buoc 7: Cai dat > Nhom khach hang

- *Xem RT.09 > Buoc 12*
- **Trang thai:** —

---

## Buoc 8: Cai dat > Nguon khach hang

- *Xem RT.09 > Buoc 13*
- **Trang thai:** —

---

## Buoc 9: Cai dat > Nhom san pham

- *Xem RT.08 > Buoc 11*
- **Trang thai:** —

---

## Buoc 10: Cai dat > Kenh lien lac (Email/SMS/Zalo)

### 10.1: Cau hinh email

- **Input:** SMTP server, port, tai khoan, mat khau
- **Yeu cau:** He thong ket noi email thanh cong
- **Trang thai:** —

### 10.2: Gui email test

- **Input:** Gui email test
- **Yeu cau:** Email duoc gui thanh cong
- **Trang thai:** —

### 10.3: Cau hinh SMS

- **Input:** API key, brandname
- **Yeu cau:** He thong ket noi SMS thanh cong
- **Trang thai:** —

---

## Buoc 11: Cai dat > Tich hop & Ket noi

### 11.1: Ket noi Shopee

- **Trang thai:** —

### 11.2: Ket noi TikTok Shop

- **Trang thai:** —

### 11.3: Ket noi van chuyen (GHN, GHTK, Viettel Post)

- **Trang thai:** —

---

## Buoc 12: Cai dat > Tai khoan ca nhan

### 12.1: Doi mat khau

- **Input:** Mat khau cu, mat khau moi, xac nhan mat khau moi
- **Yeu cau:** Mat khau duoc doi thanh cong
- **Trang thai:** —

### 12.2: Doi mat khau > Mat khau cu sai

- **Input:** Nhap sai mat khau cu
- **Yeu cau:** He thong bao loi
- **Trang thai:** —

### 12.3: Doi mat khau > Xac nhan khong khop

- **Input:** Mat khau moi != xac nhan
- **Yeu cau:** He thong bao loi
- **Trang thai:** —

---

## Buoc 13: Cai dat > Hoa don VAT > NCC HDDT

- *Xem RT.07 > Buoc 44-47*
- **Trang thai:** —

---

## Buoc 14: Cai dat > Cau hinh Loyalty

- *Xem RT.10 > Buoc 12*
- **Trang thai:** —

---

# RT.18 — DANG NHAP / DANG XUAT / BAO MAT (MOI)

**Module:** Xac thuc
**Duong dan:** /login

---

## Buoc 1: Dang nhap > Nhap dung tai khoan va mat khau

- **Input:** Username + password dung
- **Yeu cau:** Dang nhap thanh cong, chuyen sang Dashboard
- **Output:** Man hinh Dashboard
- **Trang thai:** —

---

## Buoc 2: Dang nhap > Nhap sai mat khau

- **Input:** Username dung + password sai
- **Yeu cau:** He thong bao loi "Sai tai khoan hoac mat khau"
- **Trang thai:** —

---

## Buoc 3: Dang nhap > Nhap sai tai khoan

- **Input:** Username khong ton tai
- **Yeu cau:** He thong bao loi
- **Trang thai:** —

---

## Buoc 4: Dang nhap > Bo trong truong

- **Input:** Bo trong username hoac password
- **Yeu cau:** He thong bao loi yeu cau nhap
- **Trang thai:** —

---

## Buoc 5: Dang nhap > Chon vai tro (neu co nhieu vai tro)

- **Input:** Tai khoan co nhieu vai tro (Admin, Nhan vien...)
- **Yeu cau:** He thong hien modal chon vai tro
- **Output:** Sau khi chon, truy cap he thong voi quyen tuong ung
- **Trang thai:** —

---

## Buoc 6: Dang xuat

- **Yeu cau:** He thong xoa session, chuyen ve man hinh dang nhap
- **Output:** Man hinh login, khong truy cap duoc man hinh khac
- **Trang thai:** —

---

## Buoc 7: Truy cap URL khong dang nhap

- **Input:** Truy cap /dashboard khi chua dang nhap
- **Yeu cau:** He thong redirect ve /login
- **Trang thai:** —

---

## Buoc 8: Session het han

- **Input:** De he thong idle qua thoi gian timeout
- **Yeu cau:** He thong tu dong dang xuat, yeu cau dang nhap lai
- **Trang thai:** —

---

## Buoc 9: Dang nhap > Nho mat khau (Remember me)

- **Input:** Tick "Nho mat khau" > Dang nhap > Dong trinh duyet > Mo lai
- **Yeu cau:** Tu dong dien san tai khoan
- **Trang thai:** —

---

## Buoc 10: Quen mat khau

### 10.1: Nhap email hop le

- **Input:** Email da dang ky
- **Yeu cau:** He thong gui email dat lai mat khau
- **Trang thai:** —

### 10.2: Nhap email chua dang ky

- **Input:** Email khong ton tai
- **Yeu cau:** He thong bao loi
- **Trang thai:** —

### 10.3: Dat lai mat khau tu email

- **Input:** Click link trong email > Nhap mat khau moi
- **Yeu cau:** Mat khau duoc doi, dang nhap duoc voi mat khau moi
- **Trang thai:** —

---

## Buoc 11: Dang nhap nhieu tab dong thoi

- **Input:** Dang nhap 2 tab cung tai khoan
- **Yeu cau:** Ca 2 tab deu hoat dong binh thuong
- **Trang thai:** —

---

## Buoc 12: Dang nhap tu thiet bi khac

- **Input:** Dang nhap tren PC va mobile cung luc
- **Yeu cau:** Xac dinh chinh sach: cho phep hoac khoa session cu
- **Trang thai:** —

---

# RT.19 — NHA CUNG CAP (MOI)

**Module:** Khach hang > Nha cung cap
**Duong dan:** Khach hang > Nha cung cap

---

## Buoc 1: NCC > Hien thi danh sach

- **Yeu cau:** Danh sach NCC gom: ten, SDT, email, dia chi, nhom NCC, cong no
- **Trang thai:** —

---

## Buoc 2: NCC > Tim kiem

- **Input:** Nhap ten / SDT NCC
- **Yeu cau:** Loc NCC trung khop
- **Trang thai:** —

---

## Buoc 3: NCC > Them moi

### 3.1: Nhap du thong tin

- **Input:** Ten NCC, SDT, email, dia chi, nguoi lien he, MST
- **Yeu cau:** NCC duoc tao thanh cong
- **Trang thai:** —

### 3.2: Nhap thieu truong bat buoc

- **Yeu cau:** He thong bao loi
- **Trang thai:** —

### 3.3: Nhap MST trung

- **Yeu cau:** He thong canh bao
- **Trang thai:** —

---

## Buoc 4: NCC > Xem chi tiet

- **Yeu cau:** Thong tin NCC, lich su nhap hang, cong no
- **Trang thai:** —

---

## Buoc 5: NCC > Sua thong tin

- **Yeu cau:** Cap nhat thanh cong
- **Trang thai:** —

---

## Buoc 6: NCC > Xoa

### 6.1: Xoa NCC khong co giao dich

- **Yeu cau:** NCC bi xoa
- **Trang thai:** —

### 6.2: Xoa NCC da co phieu nhap

- **Yeu cau:** He thong canh bao khong cho xoa
- **Trang thai:** —

---

## Buoc 7: NCC > Xuat Excel

- **Trang thai:** —

---

## Buoc 8: NCC > Nhap tu Excel

- **Trang thai:** —

---

# RT.20 — PHIEU DIEU CHUYEN KHO (MOI)

**Module:** Hang hoa va kho > Quan ly kho > Chuyen kho
**Duong dan:** Hang hoa va kho > Quan ly kho > Chuyen kho

---

## Buoc 1: Chuyen kho > Hien thi danh sach

- **Yeu cau:** Danh sach phieu chuyen kho gom: ma phieu, kho xuat, kho nhan, ngay, trang thai, nhan vien
- **Trang thai:** —

---

## Buoc 2: Chuyen kho > Tao phieu moi

### 2.1: Chon kho xuat va kho nhan

- **Input:** Kho xuat = Kho A, Kho nhan = Kho B
- **Yeu cau:** He thong ghi nhan
- **Trang thai:** —

### 2.2: Chon kho xuat = kho nhan

- **Input:** Kho xuat = Kho A, Kho nhan = Kho A
- **Yeu cau:** He thong bao loi "Kho xuat va kho nhan phai khac nhau"
- **Trang thai:** —

### 2.3: Them san pham can chuyen

- **Input:** Chon SP, nhap so luong chuyen
- **Yeu cau:** SP duoc them vao danh sach chuyen
- **Trang thai:** —

### 2.4: So luong chuyen > ton kho

- **Input:** So luong chuyen = 100, ton kho = 50
- **Yeu cau:** He thong bao loi vuot ton kho
- **Trang thai:** —

### 2.5: Luu phieu chuyen kho

- **Yeu cau:** Phieu duoc tao o trang thai "Cho duyet"
- **Trang thai:** —

---

## Buoc 3: Chuyen kho > Duyet phieu

- **Input:** Chon phieu "Cho duyet" > Duyet
- **Yeu cau:** Ton kho Kho A giam, Kho B tang tuong ung. Trang thai = "Hoan thanh"
- **Trang thai:** —

---

## Buoc 4: Chuyen kho > Huy phieu

- **Yeu cau:** Phieu chuyen trang thai "Da huy", ton kho khong thay doi
- **Trang thai:** —

---

## Buoc 5: Chuyen kho > Xem chi tiet

- **Yeu cau:** Thong tin phieu, danh sach SP, so luong, kho xuat/nhan
- **Trang thai:** —

---

## Buoc 6: Chuyen kho > Tim kiem / Loc

- **Input:** Tim theo ma phieu, loc theo trang thai, kho
- **Trang thai:** —

---

# RT.21 — PHIEU DIEU CHINH KHO (MOI)

**Module:** Hang hoa va kho > Phieu dieu chinh
**Duong dan:** Hang hoa va kho > Phieu dieu chinh

---

## Buoc 1: Dieu chinh > Hien thi danh sach

- **Yeu cau:** Danh sach phieu dieu chinh gom: ma phieu, kho, ngay, ly do, trang thai
- **Trang thai:** —

---

## Buoc 2: Dieu chinh > Tao phieu moi

### 2.1: Chon kho va them SP

- **Input:** Chon kho, them SP can dieu chinh, nhap so luong thuc te
- **Yeu cau:** He thong tinh chenh lech (thuc te - he thong)
- **Trang thai:** —

### 2.2: Nhap ly do dieu chinh

- **Input:** Ly do: "Kiem ke phat hien chenh lech"
- **Yeu cau:** Ly do duoc ghi nhan
- **Trang thai:** —

### 2.3: Luu phieu

- **Yeu cau:** Phieu o trang thai "Cho duyet"
- **Trang thai:** —

---

## Buoc 3: Dieu chinh > Duyet phieu

- **Yeu cau:** Ton kho duoc cap nhat theo so luong thuc te. Trang thai = "Hoan thanh"
- **Trang thai:** —

---

## Buoc 4: Dieu chinh > Huy phieu

- **Trang thai:** —

---

## Buoc 5: Dieu chinh > Xem chi tiet / Tim kiem / Loc

- **Trang thai:** —

---

# RT.22 — PHIEU XUAT HUY (MOI)

**Module:** Hang hoa va kho > Xuat huy
**Duong dan:** Hang hoa va kho > Quan ly kho > Xuat huy

---

## Buoc 1: Xuat huy > Hien thi danh sach

- **Yeu cau:** Danh sach phieu xuat huy gom: ma, kho, ngay, SP, so luong, ly do, trang thai
- **Trang thai:** —

---

## Buoc 2: Xuat huy > Tao phieu moi

### 2.1: Chon kho va SP can huy

- **Input:** Chon kho, chon SP, nhap so luong huy, ly do huy
- **Yeu cau:** Phieu duoc tao
- **Trang thai:** —

### 2.2: So luong huy > ton kho

- **Yeu cau:** He thong bao loi
- **Trang thai:** —

### 2.3: Khong chon SP

- **Yeu cau:** He thong bao loi yeu cau chon SP
- **Trang thai:** —

---

## Buoc 3: Xuat huy > Duyet phieu

- **Yeu cau:** Ton kho giam theo so luong huy. Trang thai = "Hoan thanh"
- **Trang thai:** —

---

## Buoc 4: Xuat huy > Huy phieu / Xem chi tiet / Tim kiem

- **Trang thai:** —

---

# RT.23 — KIEM KE KHO (MOI)

**Module:** Hang hoa va kho > Kiem ke
**Duong dan:** Hang hoa va kho > Quan ly kho > Kiem ke

---

## Buoc 1: Kiem ke > Hien thi danh sach dot kiem ke

- **Yeu cau:** Danh sach dot kiem ke gom: ma, kho, ngay, trang thai, nguoi kiem ke
- **Trang thai:** —

---

## Buoc 2: Kiem ke > Tao dot kiem ke moi

- **Input:** Chon kho can kiem ke
- **Yeu cau:** He thong tai danh sach SP cua kho voi so luong he thong
- **Output:** Danh sach SP voi cot "SL he thong" va cot "SL thuc te" de nhap
- **Trang thai:** —

---

## Buoc 3: Kiem ke > Nhap so luong thuc te

- **Input:** Nhap so luong thuc te cho tung SP
- **Yeu cau:** He thong tinh chenh lech tu dong
- **Output:** Cot "Chenh lech" = SL thuc te - SL he thong
- **Trang thai:** —

---

## Buoc 4: Kiem ke > Can bang kho

- **Input:** Xac nhan can bang
- **Yeu cau:** He thong tu dong tao phieu dieu chinh, cap nhat ton kho theo so thuc te
- **Output:** Ton kho duoc cap nhat, phieu dieu chinh duoc tao
- **Trang thai:** —

---

## Buoc 5: Kiem ke > Xem lich su kiem ke

- **Yeu cau:** Danh sach cac dot kiem ke truoc, chenh lech, nguoi kiem ke
- **Trang thai:** —

---

## Buoc 6: Kiem ke > Xuat bao cao kiem ke

- **Yeu cau:** File Excel chi tiet dot kiem ke
- **Trang thai:** —

---

# RT.24 — DON HANG — TAO & THEO DOI (MOI)

**Module:** Ban hang > Don hang
**Duong dan:** Ban hang > Don hang

---

## Buoc 1: Don hang > Hien thi danh sach

- **Yeu cau:** Danh sach don hang gom: ma don, KH, tong tien, trang thai (Moi/Xac nhan/Dang giao/Hoan thanh/Huy), ngay tao, nguon don
- **Trang thai:** —

---

## Buoc 2: Don hang > Tao don hang moi

### 2.1: Chon khach hang

- **Input:** Tim va chon KH
- **Yeu cau:** Thong tin KH duoc gan vao don
- **Trang thai:** —

### 2.2: Them san pham

- **Input:** Chon SP, so luong
- **Yeu cau:** SP duoc them vao don, tong tien tinh dung
- **Trang thai:** —

### 2.3: Ap dung khuyen mai

- **Input:** Nhap ma KM hoac chon CTKM
- **Yeu cau:** Gia duoc giam dung
- **Trang thai:** —

### 2.4: Chon phuong thuc thanh toan

- **Input:** Tien mat / Chuyen khoan / QR
- **Yeu cau:** PTTT duoc ghi nhan
- **Trang thai:** —

### 2.5: Xac nhan tao don

- **Yeu cau:** Don hang duoc tao, trang thai "Moi"
- **Trang thai:** —

---

## Buoc 3: Don hang > Xac nhan don

- **Input:** Chon don "Moi" > Xac nhan
- **Yeu cau:** Trang thai chuyen "Da xac nhan"
- **Trang thai:** —

---

## Buoc 4: Don hang > Huy don

### 4.1: Huy don chua giao

- **Yeu cau:** Don chuyen "Da huy", ton kho hoan lai
- **Trang thai:** —

### 4.2: Huy don da giao

- **Yeu cau:** He thong khong cho huy, yeu cau lam phieu tra hang
- **Trang thai:** —

---

## Buoc 5: Don hang > Xem chi tiet

- **Yeu cau:** Thong tin KH, SP, tong tien, PTTT, trang thai, lich su thay doi
- **Trang thai:** —

---

## Buoc 6: Don hang > Loc theo trang thai / nguon don / ngay

- **Trang thai:** —

---

## Buoc 7: Don hang > Tim kiem

- **Input:** Tim theo ma don, ten KH, SDT
- **Trang thai:** —

---

## Buoc 8: Don hang > Xuat Excel

- **Trang thai:** —

---

## Buoc 9: Don hang > In bien lai

- **Yeu cau:** Bien lai hien thi dung thong tin don
- **Trang thai:** —

---

## Buoc 10: Don hang > Theo doi don hang

- **Yeu cau:** Hien thi trang thai van chuyen, timeline (Tao > Xac nhan > Dang giao > Da giao)
- **Trang thai:** —

---

# RT.25 — THONG BAO (MOI)

**Module:** Thong bao
**Duong dan:** Icon chuong tren header

---

## Buoc 1: Thong bao > Hien thi danh sach

- **Yeu cau:** Danh sach thong bao moi nhat, chua doc/da doc
- **Trang thai:** —

---

## Buoc 2: Thong bao > So luong chua doc

- **Yeu cau:** Badge tren icon chuong hien so luong thong bao chua doc
- **Trang thai:** —

---

## Buoc 3: Thong bao > Click doc thong bao

- **Input:** Click vao 1 thong bao
- **Yeu cau:** Thong bao chuyen trang thai "Da doc", badge giam 1
- **Trang thai:** —

---

## Buoc 4: Thong bao > Doc tat ca

- **Input:** Click "Doc tat ca"
- **Yeu cau:** Tat ca thong bao chuyen "Da doc", badge = 0
- **Trang thai:** —

---

## Buoc 5: Thong bao > Click thong bao chuyen den man hinh lien quan

- **Input:** Click thong bao "Don hang moi #123"
- **Yeu cau:** He thong chuyen den chi tiet don hang #123
- **Trang thai:** —

---

## Buoc 6: Thong bao > Nhan thong bao realtime

- **Input:** Tao don hang tu POS (tab khac)
- **Yeu cau:** Thong bao xuat hien realtime (push notification)
- **Trang thai:** —

---

# RT.26 — LICH SU THANH TOAN (MOI)

**Module:** Tai chinh > Lich su thanh toan
**Duong dan:** Tai chinh > Lich su thanh toan

---

## Buoc 1: LSTT > Hien thi danh sach

- **Yeu cau:** Danh sach giao dich gom: ma GD, ma don, KH, so tien, PTTT, ngay, trang thai
- **Trang thai:** —

---

## Buoc 2: LSTT > Loc theo PTTT

- **Input:** Tien mat / Chuyen khoan / QR / The
- **Trang thai:** —

---

## Buoc 3: LSTT > Loc theo khoang ngay

- **Trang thai:** —

---

## Buoc 4: LSTT > Tim kiem

- **Input:** Ma don / ten KH
- **Trang thai:** —

---

## Buoc 5: LSTT > Xem chi tiet giao dich

- **Yeu cau:** Chi tiet: don hang lien quan, SP, so tien, PTTT, thoi gian
- **Trang thai:** —

---

## Buoc 6: LSTT > Xuat Excel

- **Trang thai:** —

---

# RT.27 — DASHBOARD TAI CHINH (MOI)

**Module:** Tai chinh > Dashboard
**Duong dan:** Tai chinh > Dashboard

---

## Buoc 1: Dashboard TC > Hien thi tong quan

- **Yeu cau:** Hien thi: tong thu, tong chi, loi nhuan, so du quy, cong no phai thu, cong no phai tra
- **Trang thai:** —

---

## Buoc 2: Dashboard TC > Bieu do thu chi theo thang

- **Yeu cau:** Bieu do cot/duong thu/chi 12 thang
- **Trang thai:** —

---

## Buoc 3: Dashboard TC > Loc theo thoi gian

- **Input:** Hom nay / 7 ngay / 30 ngay / Thang nay / Tuy chon
- **Trang thai:** —

---

## Buoc 4: Dashboard TC > Top khach hang no

- **Yeu cau:** Top 10 KH cong no cao nhat
- **Trang thai:** —

---

## Buoc 5: Dashboard TC > Cong no sap den han

- **Yeu cau:** Danh sach cong no den han trong 7 ngay toi
- **Trang thai:** —

---

# RT.28 — BAO CAO KHO (MOI)

**Module:** Bao cao > Bao cao kho
**Duong dan:** Bao cao > Bao cao kho

---

## Buoc 1: BC Kho > Ton kho hien tai

- **Yeu cau:** Bang: SP, ton dau ky, nhap trong ky, xuat trong ky, ton cuoi ky, gia tri ton
- **Trang thai:** —

---

## Buoc 2: BC Kho > Loc theo kho

- **Input:** Chon kho cu the
- **Trang thai:** —

---

## Buoc 3: BC Kho > Loc theo nhom SP

- **Trang thai:** —

---

## Buoc 4: BC Kho > Loc theo khoang ngay

- **Trang thai:** —

---

## Buoc 5: BC Kho > SP sap het hang

- **Yeu cau:** Danh sach SP co ton kho duoi muc toi thieu
- **Trang thai:** —

---

## Buoc 6: BC Kho > SP ton lau

- **Yeu cau:** Danh sach SP khong co giao dich > 30/60/90 ngay
- **Trang thai:** —

---

## Buoc 7: BC Kho > Xuat Excel

- **Trang thai:** —

---

# RT.29 — NGUYEN VAT LIEU (MOI)

**Module:** Hang hoa va kho > Nguyen vat lieu
**Duong dan:** Hang hoa va kho > Nguyen vat lieu

---

## Buoc 1: NVL > Hien thi danh sach

- **Yeu cau:** Danh sach NVL gom: ten, don vi, ton kho, gia, nhom
- **Trang thai:** —

---

## Buoc 2: NVL > Them moi

- **Input:** Ten NVL, don vi tinh, gia, nhom
- **Yeu cau:** NVL duoc tao
- **Trang thai:** —

---

## Buoc 3: NVL > Dinh muc (BOM)

- **Input:** SP "Tra sua" can: 200ml sua, 50g tra, 30g duong
- **Yeu cau:** Dinh muc duoc luu
- **Trang thai:** —

---

## Buoc 4: NVL > Tu dong tru NVL khi ban SP

- **Input:** Ban 1 ly "Tra sua"
- **Yeu cau:** Ton kho NVL giam theo dinh muc (200ml sua, 50g tra, 30g duong)
- **Trang thai:** —

---

## Buoc 5: NVL > Canh bao het NVL

- **Yeu cau:** Thong bao khi NVL duoi muc toi thieu
- **Trang thai:** —

---

## Buoc 6: NVL > Sua / Xoa / Tim kiem / Xuat Excel

- **Trang thai:** —

---

# RT.30 — CHAM CONG (MOI)

**Module:** Cai dat > Cham cong
**Duong dan:** Cai dat > Cham cong

---

## Buoc 1: Cham cong > Hien thi bang cham cong

- **Yeu cau:** Bang cham cong thang hien tai: NV, ngay, gio vao, gio ra, so gio lam
- **Trang thai:** —

---

## Buoc 2: Cham cong > Them ban ghi cham cong

- **Input:** Chon NV, ngay, gio vao, gio ra
- **Yeu cau:** Ban ghi duoc tao
- **Trang thai:** —

---

## Buoc 3: Cham cong > Sua ban ghi

- **Input:** Sua gio vao/ra
- **Yeu cau:** So gio lam duoc tinh lai
- **Trang thai:** —

---

## Buoc 4: Cham cong > Xoa ban ghi

- **Trang thai:** —

---

## Buoc 5: Cham cong > Loc theo thang / NV

- **Trang thai:** —

---

## Buoc 6: Cham cong > Tong hop gio lam

- **Yeu cau:** Tong so gio lam cua tung NV trong thang
- **Trang thai:** —

---

## Buoc 7: Cham cong > Xuat Excel

- **Trang thai:** —

---

# RT.31 — BAO HANH & HO TRO / TICKET (MOI)

**Module:** Bao hanh / Ticket ho tro
**Duong dan:** Bao hanh, Ho tro

---

## Buoc 1: Bao hanh > Hien thi danh sach phieu bao hanh

- **Yeu cau:** Danh sach phieu BH gom: ma phieu, KH, SP, ngay mua, han BH, trang thai, nhan vien xu ly
- **Trang thai:** —

---

## Buoc 2: Bao hanh > Tao phieu bao hanh

### 2.1: Nhap du thong tin

- **Input:** Chon KH, chon SP (tu don hang), mo ta loi, hinh anh loi
- **Yeu cau:** Phieu BH duoc tao, trang thai "Tiep nhan"
- **Trang thai:** —

### 2.2: SP het han bao hanh

- **Input:** Chon SP da het han BH
- **Yeu cau:** He thong canh bao "SP da het han bao hanh"
- **Trang thai:** —

### 2.3: Nhap thieu thong tin

- **Yeu cau:** Bao loi
- **Trang thai:** —

---

## Buoc 3: Bao hanh > Chuyen trang thai

### 3.1: Tiep nhan → Dang xu ly

- **Yeu cau:** Trang thai cap nhat, NV xu ly duoc gan
- **Trang thai:** —

### 3.2: Dang xu ly → Hoan thanh

- **Input:** Nhap ket qua xu ly, ghi chu
- **Yeu cau:** Phieu chuyen "Hoan thanh"
- **Trang thai:** —

### 3.3: Tu choi bao hanh

- **Input:** Nhap ly do tu choi
- **Yeu cau:** Phieu chuyen "Tu choi"
- **Trang thai:** —

---

## Buoc 4: Bao hanh > Xem chi tiet

- **Yeu cau:** Thong tin KH, SP, mo ta loi, hinh anh, lich su xu ly, trang thai
- **Trang thai:** —

---

## Buoc 5: Bao hanh > Tim kiem / Loc

- **Input:** Ma phieu, ten KH, trang thai, khoang ngay
- **Trang thai:** —

---

## Buoc 6: Bao hanh > Xuat Excel

- **Trang thai:** —

---

## Buoc 7: Ticket ho tro > Hien thi danh sach

- **Yeu cau:** Danh sach ticket gom: ma, tieu de, KH, danh muc, do uu tien, trang thai, NV xu ly
- **Trang thai:** —

---

## Buoc 8: Ticket > Tao ticket moi

- **Input:** Tieu de, mo ta, KH, danh muc, do uu tien
- **Yeu cau:** Ticket duoc tao
- **Trang thai:** —

---

## Buoc 9: Ticket > Chuyen trang thai

- **Tuong tu bao hanh:** Mo → Dang xu ly → Hoan thanh / Dong
- **Trang thai:** —

---

## Buoc 10: Ticket > Phan cong NV

- **Input:** Gan NV xu ly
- **Yeu cau:** NV nhan thong bao, ticket hien trong danh sach cua NV
- **Trang thai:** —

---

## Buoc 11: Ticket > Tim kiem / Loc / Xuat Excel

- **Trang thai:** —

---

# RT.32 — EMAIL / SMS / ZALO MARKETING (MOI)

**Module:** Marketing > Email / SMS / Zalo
**Duong dan:** Marketing

---

## Buoc 1: Email Marketing > Hien thi danh sach chien dich

- **Yeu cau:** Danh sach chien dich email gom: ten, so nguoi gui, da gui, ty le mo, ngay gui, trang thai
- **Trang thai:** —

---

## Buoc 2: Email > Tao chien dich moi

### 2.1: Chon mau email

- **Input:** Chon mau co san hoac tao mau moi
- **Yeu cau:** Mau duoc tai vao trinh soan thao
- **Trang thai:** —

### 2.2: Nhap noi dung email

- **Input:** Tieu de, noi dung (HTML editor), hinh anh
- **Yeu cau:** Noi dung duoc luu
- **Trang thai:** —

### 2.3: Chon danh sach nguoi nhan

- **Input:** Chon nhom KH hoac chon thu cong
- **Yeu cau:** Danh sach nguoi nhan duoc xac dinh
- **Trang thai:** —

### 2.4: Gui ngay

- **Yeu cau:** Email duoc gui den tat ca nguoi nhan
- **Trang thai:** —

### 2.5: Hen gio gui

- **Input:** Chon ngay/gio gui
- **Yeu cau:** Chien dich luu o trang thai "Da len lich"
- **Trang thai:** —

---

## Buoc 3: Email > Xem bao cao chien dich

- **Yeu cau:** So nguoi nhan, da gui, da mo, da click, ty le bounce
- **Trang thai:** —

---

## Buoc 4: Email > Quan ly mau email

### 4.1: Tao mau moi

- **Input:** Ten mau, noi dung HTML
- **Yeu cau:** Mau duoc luu
- **Trang thai:** —

### 4.2: Sua / Xoa mau

- **Trang thai:** —

---

## Buoc 5: SMS Marketing > Tao chien dich

### 5.1: Nhap noi dung SMS

- **Input:** Noi dung (toi da 160 ky tu), danh sach nguoi nhan
- **Yeu cau:** SMS duoc gui
- **Trang thai:** —

### 5.2: Noi dung vuot 160 ky tu

- **Yeu cau:** He thong canh bao (tinh 2 tin nhan)
- **Trang thai:** —

---

## Buoc 6: SMS > Quan ly mau SMS

- **Trang thai:** —

---

## Buoc 7: SMS > Bao cao gui

- **Yeu cau:** So SMS gui, thanh cong, that bai, chi phi
- **Trang thai:** —

---

## Buoc 8: Zalo Marketing > Tao chien dich

- **Input:** Chon mau ZNS, nhap tham so, chon nguoi nhan
- **Yeu cau:** Tin Zalo duoc gui
- **Trang thai:** —

---

## Buoc 9: Zalo > Bao cao gui

- **Trang thai:** —

---

## Buoc 10: Cau hinh kenh > Ket noi Email (SMTP/Gmail)

- **Input:** SMTP host, port, user, password
- **Yeu cau:** Ket noi thanh cong, gui test email OK
- **Trang thai:** —

---

## Buoc 11: Cau hinh kenh > Ket noi SMS (API)

- **Input:** API key, brandname
- **Yeu cau:** Ket noi thanh cong
- **Trang thai:** —

---

## Buoc 12: Cau hinh kenh > Ket noi Zalo OA

- **Input:** App ID, Secret Key
- **Yeu cau:** Ket noi Zalo OA thanh cong
- **Trang thai:** —

---

# RT.33 — CHAM SOC KH & SOCIAL CRM (MOI)

**Module:** Khach hang > Cham soc / Hoi thoai
**Duong dan:** Khach hang, Fanpage

---

## Buoc 1: Lich su cham soc > Hien thi

- **Yeu cau:** Danh sach lich su cham soc KH gom: KH, loai (goi/email/gap), noi dung, ngay, NV, ket qua
- **Trang thai:** —

---

## Buoc 2: Cham soc > Tao lich cham soc

- **Input:** Chon KH, loai cham soc, ngay hen, noi dung, NV phu trach
- **Yeu cau:** Lich cham soc duoc tao, nhac nho NV
- **Trang thai:** —

---

## Buoc 3: Cham soc > Ghi nhan ket qua

- **Input:** Nhap ket qua cham soc, trang thai KH
- **Yeu cau:** Ket qua duoc luu vao lich su
- **Trang thai:** —

---

## Buoc 4: Cham soc > Kich ban cham soc tu dong

- **Input:** Cau hinh: KH mua > 3 ngay khong quay lai → gui SMS nhac
- **Yeu cau:** He thong tu dong gui SMS
- **Trang thai:** —

---

## Buoc 5: Fanpage > Hien thi hoi thoai

- **Yeu cau:** Danh sach hoi thoai tu Facebook/Zalo gom: KH, kenh, tin nhan cuoi, thoi gian
- **Trang thai:** —

---

## Buoc 6: Fanpage > Tra loi tin nhan

- **Input:** Nhap noi dung tra loi
- **Yeu cau:** Tin nhan duoc gui qua Facebook/Zalo tuong ung
- **Trang thai:** —

---

## Buoc 7: Fanpage > Tao KH tu hoi thoai

- **Input:** Click "Tao khach hang" tu hoi thoai
- **Yeu cau:** KH moi duoc tao voi thong tin tu profile Facebook/Zalo
- **Trang thai:** —

---

## Buoc 8: Fanpage > Tao don hang tu hoi thoai

- **Yeu cau:** Don hang duoc tao va lien ket voi KH tu hoi thoai
- **Trang thai:** —

---

## Buoc 9: Call Center > Goi dien

- **Input:** Chon KH > Goi
- **Yeu cau:** Cuoc goi duoc thuc hien, ghi nhan lich su
- **Trang thai:** —

---

## Buoc 10: Call Center > Lich su cuoc goi

- **Yeu cau:** Danh sach cuoc goi: KH, thoi gian, thoi luong, NV, ghi chu
- **Trang thai:** —

---

## Buoc 11: Khao sat KH > Tao form khao sat

- **Input:** Tieu de, cau hoi, loai tra loi (chon 1, nhieu, tu luan)
- **Yeu cau:** Form khao sat duoc tao
- **Trang thai:** —

---

## Buoc 12: Khao sat > Gui link khao sat cho KH

- **Yeu cau:** KH nhan duoc link va tra loi duoc
- **Trang thai:** —

---

## Buoc 13: Khao sat > Xem ket qua khao sat

- **Yeu cau:** Thong ke tra loi, bieu do
- **Trang thai:** —

---

# RT.34 — BAO GIA & CHAO GIA / OFFER (MOI)

**Module:** Ban hang > Bao gia
**Duong dan:** Ban hang > Bao gia

---

## Buoc 1: Bao gia > Hien thi danh sach

- **Yeu cau:** Danh sach bao gia gom: ma, KH, tong tien, ngay, han hieu luc, trang thai
- **Trang thai:** —

---

## Buoc 2: Bao gia > Tao bao gia moi

### 2.1: Chon KH va them SP/DV

- **Input:** Chon KH, them SP voi gia, so luong, chiet khau
- **Yeu cau:** Bao gia duoc tao
- **Trang thai:** —

### 2.2: Nhap han hieu luc

- **Input:** Han hieu luc 30 ngay
- **Yeu cau:** He thong ghi nhan
- **Trang thai:** —

### 2.3: Nhap thieu thong tin

- **Yeu cau:** Bao loi
- **Trang thai:** —

---

## Buoc 3: Bao gia > Gui bao gia cho KH

- **Input:** Gui qua email
- **Yeu cau:** Email chua bao gia duoc gui
- **Trang thai:** —

---

## Buoc 4: Bao gia > In / Xuat PDF

- **Yeu cau:** File PDF bao gia duoc tao voi day du thong tin, logo, con dau
- **Trang thai:** —

---

## Buoc 5: Bao gia > Chuyen thanh don hang

- **Input:** Chon bao gia > "Tao don hang"
- **Yeu cau:** Don hang duoc tao tu bao gia voi du thong tin
- **Trang thai:** —

---

## Buoc 6: Bao gia > Sua / Huy / Tim kiem / Loc

- **Trang thai:** —

---

## Buoc 7: Bao gia > Bao gia het han

- **Yeu cau:** Bao gia qua han tu dong chuyen trang thai "Het han"
- **Trang thai:** —

---

# RT.35 — CHIEN DICH MARKETING (MOI)

**Module:** Marketing > Chien dich
**Duong dan:** Marketing > Chien dich

---

## Buoc 1: Chien dich > Hien thi danh sach

- **Yeu cau:** Danh sach CD gom: ten, thoi gian, ngan sach, so KH tham gia, trang thai, ket qua
- **Trang thai:** —

---

## Buoc 2: Chien dich > Tao moi

- **Input:** Ten CD, muc tieu, thoi gian, ngan sach, doi tuong (nhom KH), kenh (email/SMS/Zalo), noi dung
- **Yeu cau:** CD duoc tao o trang thai "Nhap"
- **Trang thai:** —

---

## Buoc 3: Chien dich > Kich hoat

- **Yeu cau:** CD chuyen "Dang chay", tu dong thuc hien theo cau hinh
- **Trang thai:** —

---

## Buoc 4: Chien dich > Tam dung / Ket thuc

- **Trang thai:** —

---

## Buoc 5: Chien dich > Bao cao hieu qua

- **Yeu cau:** So KH tiep can, ty le mo, ty le click, don hang tao tu CD, doanh thu, ROI
- **Trang thai:** —

---

## Buoc 6: Chien dich > Pipeline co hoi

- **Yeu cau:** Theo doi co hoi ban hang tu CD: Lead → Quan tam → Bao gia → Chot don
- **Trang thai:** —

---

## Buoc 7: Chien dich > Gan NV ban hang

- **Input:** Gan NV phu trach tung nhom KH trong CD
- **Yeu cau:** NV nhan danh sach KH can cham soc
- **Trang thai:** —

---

# RT.36 — PHAN TICH KH NANG CAO (MOI)

**Module:** Khach hang > Phan tich
**Duong dan:** Khach hang > Phan tich

---

## Buoc 1: Phan tich KH > Dashboard tong quan

- **Yeu cau:** Tong KH, KH moi thang nay, KH quay lai, ty le giu chan (retention), gia tri trung binh
- **Trang thai:** —

---

## Buoc 2: Phan tich > Top KH theo doanh thu

- **Yeu cau:** Top 10/20/50 KH chi tieu nhieu nhat
- **Trang thai:** —

---

## Buoc 3: Phan tich > Top KH theo tan suat mua

- **Yeu cau:** Top KH mua nhieu lan nhat
- **Trang thai:** —

---

## Buoc 4: Phan tich > KH co nguy co roi bo (Churn)

- **Yeu cau:** Danh sach KH khong mua > 30/60/90 ngay
- **Trang thai:** —

---

## Buoc 5: Phan tich > Gia tri vong doi KH (CLV)

- **Yeu cau:** Tinh CLV cho tung KH dua tren lich su mua
- **Trang thai:** —

---

## Buoc 6: Phan tich > Phan bo KH theo nhom / nguon / khu vuc / gioi tinh / do tuoi

- **Yeu cau:** Bieu do phan bo KH theo tung tieu chi
- **Trang thai:** —

---

## Buoc 7: Phan tich > Xuat bao cao phan tich

- **Trang thai:** —

---

# RT.37 — HOA DON BAN HANG THUONG (KHONG VAT) (MOI)

**Module:** Ban hang > Hoa don
**Duong dan:** Ban hang > Hoa don ban hang

---

## Buoc 1: Hoa don > Hien thi danh sach

- **Yeu cau:** Danh sach hoa don ban hang gom: ma HD, KH, tong tien, PTTT, ngay, NV ban, trang thai
- **Trang thai:** —

---

## Buoc 2: Hoa don > Xem chi tiet

- **Yeu cau:** Thong tin KH, danh sach SP, so luong, don gia, chiet khau, tong tien, PTTT, ghi chu
- **Trang thai:** —

---

## Buoc 3: Hoa don > Tim kiem

- **Input:** Ma HD, ten KH, SDT
- **Trang thai:** —

---

## Buoc 4: Hoa don > Loc

### 4.1: Loc theo trang thai (Hoan thanh / Huy / Cho thanh toan)

- **Trang thai:** —

### 4.2: Loc theo NV ban

- **Trang thai:** —

### 4.3: Loc theo khoang ngay

- **Trang thai:** —

### 4.4: Loc theo PTTT

- **Trang thai:** —

---

## Buoc 5: Hoa don > Huy hoa don

### 5.1: Huy HD chua thanh toan

- **Yeu cau:** HD chuyen "Da huy", ton kho hoan lai
- **Trang thai:** —

### 5.2: Huy HD da thanh toan

- **Yeu cau:** Yeu cau xac nhan, tao phieu hoan tien
- **Trang thai:** —

---

## Buoc 6: Hoa don > In hoa don

- **Yeu cau:** HD duoc in dung thong tin, dinh dang (A4 / K80)
- **Trang thai:** —

---

## Buoc 7: Hoa don > Xuat Excel

- **Trang thai:** —

---

## Buoc 8: Hoa don > Tao HD VAT tu HD thuong

- **Input:** Chon HD thuong > "Xuat HD VAT"
- **Yeu cau:** He thong chuyen sang man hinh xuat HD VAT voi thong tin dien san
- **Trang thai:** —

---

# RT.38 — POS — LUONG NANG CAO (MOI)

**Module:** Ban hang tai quay — Cac truong hop dac biet
**Duong dan:** Ban hang > Ban hang tai quay

> Ghi chu: Bo sung cac luong chua co trong RT.03

---

## Buoc 1: POS > Thanh toan ket hop nhieu PTTT

- **Input:** Don 500,000 → tra 300,000 tien mat + 200,000 chuyen khoan
- **Yeu cau:** He thong ghi nhan 2 PTTT, tong = 500,000, don hoan thanh
- **Trang thai:** —

---

## Buoc 2: POS > Luu don tam

- **Input:** Them SP vao gio > Click "Luu tam"
- **Yeu cau:** Don duoc luu, hien thi trong tab "Don tam"
- **Trang thai:** —

---

## Buoc 3: POS > Tiep tuc don tam

- **Input:** Chon don tam > "Tiep tuc"
- **Yeu cau:** Gio hang duoc khoi phuc dung SP va so luong
- **Trang thai:** —

---

## Buoc 4: POS > Ap dung khuyen mai tu dong

- **Input:** Them SP thuoc CTKM dang hoat dong
- **Yeu cau:** Gia duoc tu dong giam, popup hien "KM dang ap dung"
- **Trang thai:** —

---

## Buoc 5: POS > Kiem tra khuyen mai du dieu kien

- **Input:** Click "Kiem tra khuyen mai"
- **Yeu cau:** He thong hien danh sach CTKM du dieu kien va chua du dieu kien
- **Trang thai:** —

---

## Buoc 6: POS > Ban SP het ton kho

- **Input:** Them SP co ton kho = 0
- **Yeu cau:** He thong canh bao het hang, khong cho them (hoac cho phep tuy cau hinh)
- **Trang thai:** —

---

## Buoc 7: POS > Ban SP co nhieu bien the (variant)

- **Input:** Chon SP co variant (Size S/M/L, Mau Do/Xanh)
- **Yeu cau:** Modal chon variant hien, moi variant co ton kho rieng
- **Trang thai:** —

---

## Buoc 8: POS > Thay doi so luong bang cach nhap truc tiep

- **Input:** Click vao o so luong, nhap 10
- **Yeu cau:** So luong cap nhat = 10, tong tien tinh lai
- **Trang thai:** —

---

## Buoc 9: POS > Ap dung chiet khau theo dong

- **Input:** Chon SP > Nhap chiet khau % hoac so tien cho SP do
- **Yeu cau:** Gia SP giam, tong don tinh lai
- **Trang thai:** —

---

## Buoc 10: POS > Ap dung chiet khau toan don

- **Input:** Nhap chiet khau % cho toan don
- **Yeu cau:** Tong don giam dung %
- **Trang thai:** —

---

## Buoc 11: POS > Ghi chu cho don hang

- **Input:** Nhap ghi chu "Giao truoc 5h chieu"
- **Yeu cau:** Ghi chu duoc luu cung don
- **Trang thai:** —

---

## Buoc 12: POS > In bien lai sau thanh toan

- **Yeu cau:** Bien lai in dung: ten cua hang, SP, gia, tong, PTTT, ngay, ma don
- **Trang thai:** —

---

## Buoc 13: POS > Tra lai tien thua

- **Input:** Don 350,000, KH dua 500,000
- **Yeu cau:** He thong tinh tien thua = 150,000, hien thi ro rang
- **Trang thai:** —

---

# RT.39 — LICH HEN & LICH CHAM SOC (MOI)

**Module:** Lich hen
**Duong dan:** Lich hen / Calendar

---

## Buoc 1: Lich > Hien thi lich theo ngay / tuan / thang

- **Yeu cau:** Lich hien thi cac cuoc hen, su kien theo dang calendar
- **Trang thai:** —

---

## Buoc 2: Lich > Tao lich hen moi

- **Input:** KH, ngay/gio, dich vu/noi dung, NV phu trach
- **Yeu cau:** Lich hen duoc tao, hien tren calendar
- **Trang thai:** —

---

## Buoc 3: Lich > Trung lich

- **Input:** Tao lich hen trung gio voi lich da co
- **Yeu cau:** He thong canh bao trung lich
- **Trang thai:** —

---

## Buoc 4: Lich > Sua lich hen

- **Input:** Keo tha hoac sua thong tin
- **Yeu cau:** Lich duoc cap nhat
- **Trang thai:** —

---

## Buoc 5: Lich > Huy lich hen

- **Yeu cau:** Lich bi huy, KH nhan thong bao (neu cau hinh)
- **Trang thai:** —

---

## Buoc 6: Lich > Nhac lich (Notification)

- **Yeu cau:** Truoc 1 gio, he thong gui nhac nho cho NV va KH
- **Trang thai:** —

---

## Buoc 7: Lich > Loc theo NV / KH / Dich vu

- **Trang thai:** —

---

# RT.40 — QUAN LY TO CHUC & GOI DICH VU (MOI)

**Module:** To chuc / Goi dich vu
**Duong dan:** Cai dat > To chuc, Goi dich vu

---

## Buoc 1: To chuc > Hien thi thong tin to chuc

- **Yeu cau:** Ten cong ty, MST, dia chi, SDT, email, logo
- **Trang thai:** —

---

## Buoc 2: To chuc > Sua thong tin

- **Input:** Doi ten, dia chi
- **Yeu cau:** Thong tin cap nhat, hien thi tren hoa don
- **Trang thai:** —

---

## Buoc 3: Goi dich vu > Xem goi hien tai

- **Yeu cau:** Ten goi, han su dung, so user, tinh nang duoc phep
- **Trang thai:** —

---

## Buoc 4: Goi dich vu > Gia han

- **Input:** Chon goi gia han
- **Yeu cau:** He thong xu ly thanh toan, gia han
- **Trang thai:** —

---

## Buoc 5: Goi dich vu > Nang cap

- **Input:** Chon goi cao hon
- **Yeu cau:** Tinh chenh lech phi, nang cap
- **Trang thai:** —

---

## Buoc 6: Extension / Plugin > Hien thi danh sach

- **Yeu cau:** Cac ung dung mo rong (tinh nang bo sung)
- **Trang thai:** —

---

## Buoc 7: Extension > Cai dat / Go bo

- **Input:** Cai dat extension
- **Yeu cau:** Extension hoat dong, menu/tinh nang duoc them
- **Trang thai:** —

---

# RT.41 — QUY TRINH NGHIEP VU / BPM (MOI)

**Module:** Quy trinh nghiep vu
**Duong dan:** Quy trinh (menu chinh)
**Ghi chu:** Module nay CO TRONG MENU CHINH cua Reborn Retail, gom 6 muc

---

## Buoc 1: Quan ly quy trinh > Hien thi danh sach

- **Yeu cau:** Danh sach quy trinh da tao gom: ten, trang thai, ngay tao, nguoi tao, phien ban
- **Trang thai:** —

---

## Buoc 2: Quy trinh > Tao quy trinh moi

- **Input:** Ten quy trinh, mo ta, nhom
- **Yeu cau:** Quy trinh duoc tao, mo trinh soan thao BPMN
- **Output:** Man hinh thiet ke quy trinh (keo tha)
- **Trang thai:** —

---

## Buoc 3: Quy trinh > Thiet ke buoc (nodes)

### 3.1: Them buoc Start → Task → End

- **Input:** Keo tha Start Event, User Task, End Event
- **Yeu cau:** Cac node duoc tao va lien ket
- **Trang thai:** —

### 3.2: Cau hinh User Task

- **Input:** Ten task, nguoi thuc hien, SLA, form nhap lieu
- **Yeu cau:** Task duoc cau hinh day du
- **Trang thai:** —

### 3.3: Cau hinh dieu kien re nhanh (Gateway)

- **Input:** Them Exclusive Gateway voi 2 nhanh dieu kien
- **Yeu cau:** Dieu kien duoc luu
- **Trang thai:** —

---

## Buoc 4: Quy trinh > Luu va phat hanh

- **Input:** Click "Phat hanh"
- **Yeu cau:** Quy trinh chuyen trang thai "Dang hoat dong"
- **Trang thai:** —

---

## Buoc 5: Quy trinh > Mo phong (Simulation)

- **Input:** Chay mo phong voi du lieu test
- **Yeu cau:** He thong chay qua cac buoc, hien thi ket qua
- **Trang thai:** —

---

## Buoc 6: Quy trinh > Cau hinh luat nghiep vu (Business Rule)

### 6.1: Tao luat moi

- **Input:** Ten luat, dieu kien (neu...thi...), hanh dong
- **Yeu cau:** Luat duoc tao
- **Trang thai:** —

### 6.2: Tao bang quyet dinh (Decision Table)

- **Input:** Cac cot dieu kien va cot ket qua
- **Yeu cau:** Bang quyet dinh duoc luu
- **Trang thai:** —

---

## Buoc 7: Quy trinh > Sua / Xoa / Nhan ban quy trinh

- **Trang thai:** —

---

## Buoc 8: Quy trinh > Danh sach cong viec (Task List)

- **Yeu cau:** Hien thi cac task duoc gan cho user hien tai, trang thai, han hoan thanh
- **Trang thai:** —

---

## Buoc 9: Task > Xu ly cong viec

- **Input:** Mo task, dien form, bam "Hoan thanh"
- **Yeu cau:** Task chuyen trang thai, quy trinh chuyen sang buoc tiep theo
- **Trang thai:** —

---

## Buoc 10: Quy trinh > Cau hinh mac dinh

- **Yeu cau:** Gan quy trinh mac dinh cho module (VD: duyet phieu nhap kho, duyet don hang)
- **Trang thai:** —

---

## Buoc 11: Quan ly ho so (Object Management)

- **Yeu cau:** Hien thi cac ho so/doi tuong da chay qua quy trinh, trang thai hien tai
- **Trang thai:** —

---

# RT.42 — MARKETING AUTOMATION (MOI)

**Module:** Marketing > Tu dong hoa
**Duong dan:** Marketing > Tu dong hoa

---

## Buoc 1: Automation > Hien thi danh sach

- **Yeu cau:** Danh sach kich ban tu dong gom: ten, trigger, hanh dong, trang thai, so lan chay
- **Trang thai:** —

---

## Buoc 2: Automation > Tao kich ban moi

### 2.1: Cau hinh trigger (khi nao chay)

- **Input:** Trigger: "Khi KH mua hang lan dau"
- **Yeu cau:** Trigger duoc luu
- **Trang thai:** —

### 2.2: Cau hinh hanh dong (lam gi)

- **Input:** Hanh dong: "Gui email chao mung sau 1 ngay"
- **Yeu cau:** Hanh dong duoc luu
- **Trang thai:** —

### 2.3: Cau hinh dieu kien (loc doi tuong)

- **Input:** Dieu kien: "KH thuoc nhom VIP"
- **Yeu cau:** Dieu kien duoc luu
- **Trang thai:** —

---

## Buoc 3: Automation > Kich hoat / Tam dung

### 3.1: Kich hoat

- **Yeu cau:** Kich ban bat dau chay tu dong
- **Trang thai:** —

### 3.2: Tam dung

- **Yeu cau:** Kich ban ngung chay
- **Trang thai:** —

---

## Buoc 4: Automation > Kiem tra trigger hoat dong

- **Input:** Tao don hang cho KH moi (trigger "KH mua lan dau")
- **Yeu cau:** Sau 1 ngay, email chao mung duoc gui tu dong
- **Trang thai:** —

---

## Buoc 5: Automation > Bao cao

- **Yeu cau:** So lan trigger, so email/SMS da gui, ty le mo, ty le click
- **Trang thai:** —

---

## Buoc 6: Automation > Sua / Xoa / Nhan ban kich ban

- **Trang thai:** —

---

## Buoc 7: Cac kich ban pho bien

### 7.1: Chao mung KH moi

- **Trigger:** KH dang ky → **Hanh dong:** Gui email chao mung
- **Trang thai:** —

### 7.2: Nhac KH quay lai

- **Trigger:** KH khong mua > 30 ngay → **Hanh dong:** Gui SMS voi ma giam gia
- **Trang thai:** —

### 7.3: Chuc mung sinh nhat

- **Trigger:** Ngay sinh KH → **Hanh dong:** Gui email + tang diem
- **Trang thai:** —

### 7.4: Nhac thanh toan cong no

- **Trigger:** Cong no sap den han → **Hanh dong:** Gui SMS nhac
- **Trang thai:** —

---

# RT.43 — QUY TRINH BAN HANG / SALE FLOW (MOI)

**Module:** Quy trinh ban hang
**Duong dan:** Quy trinh > Quy trinh ban

---

## Buoc 1: Sale Flow > Hien thi danh sach quy trinh ban

- **Yeu cau:** Danh sach quy trinh ban gom: ten, so buoc, trang thai, ngay tao
- **Trang thai:** —

---

## Buoc 2: Sale Flow > Tao quy trinh ban moi

- **Input:** Ten quy trinh, cac buoc (VD: Lead → Tiep can → Bao gia → Dam phan → Chot don → Hoan thanh)
- **Yeu cau:** Quy trinh duoc tao voi pipeline dang kanban
- **Trang thai:** —

---

## Buoc 3: Sale Flow > Cau hinh buoc

### 3.1: Them buoc moi

- **Input:** Ten buoc, mau sac, thu tu
- **Yeu cau:** Buoc moi duoc them vao pipeline
- **Trang thai:** —

### 3.2: Sua ten / Xoa buoc

- **Trang thai:** —

### 3.3: Sap xep lai thu tu buoc

- **Input:** Keo tha de doi thu tu
- **Yeu cau:** Thu tu duoc cap nhat
- **Trang thai:** —

---

## Buoc 4: Sale Flow > Them co hoi ban hang vao pipeline

- **Input:** Ten co hoi, KH, gia tri du kien, buoc hien tai, NV phu trach
- **Yeu cau:** Co hoi hien thi dung buoc tren kanban
- **Trang thai:** —

---

## Buoc 5: Sale Flow > Chuyen buoc (keo tha)

- **Input:** Keo co hoi tu "Tiep can" sang "Bao gia"
- **Yeu cau:** Co hoi chuyen buoc, lich su duoc ghi nhan
- **Trang thai:** —

---

## Buoc 6: Sale Flow > Chot don / That bai

### 6.1: Chot don thanh cong

- **Yeu cau:** Co hoi chuyen "Hoan thanh", tao don hang tu dong (neu cau hinh)
- **Trang thai:** —

### 6.2: That bai

- **Input:** Chon ly do that bai
- **Yeu cau:** Co hoi chuyen "That bai", ghi nhan ly do
- **Trang thai:** —

---

## Buoc 7: Sale Flow > Bao cao pipeline

- **Yeu cau:** So co hoi theo buoc, gia tri tong, ty le chuyen doi, thoi gian trung binh moi buoc
- **Trang thai:** —

---

## Buoc 8: Sale Flow > Loc / Tim kiem co hoi

- **Input:** Loc theo NV, KH, gia tri, buoc, thoi gian
- **Trang thai:** —

---

# DANH SACH MODULE KHONG THUOC RETAIL — KHONG CAN TEST

> Cac module sau ton tai trong codebase nhung **KHONG co route** hoac **KHONG co trong menu** Reborn Retail.
> Chung la tinh nang enterprise/CRM tong quat, khong ap dung cho ban le.

| Module | Ly do loai bo |
|--------|---------------|
| Contracts (Hop dong) | Khong co page, khong co route trong routes.tsx |
| Membership Class | Page ton tai nhung khong import vao routes |
| Exchange Points / Rewards Exchange | Khong import vao routes |
| Fixed Price Page | Khong import vao routes |
| PromoCode / SharePromo / ShareCoupon | Page co logic nhung khong duoc route |
| Promotion Bundle | Khong import vao routes |
| Checkout | Khong import — CounterSales duoc dung thay |
| ChatBot / ChatFeedback | Code day du nhung khong import vao routes |
| Content Template / Template Category | Khong import vao routes |
| Customer Review | Khong import vao routes |
| HandleTask | Khong import vao routes |
| Customer Churn (rieng) | Route ton tai nhung khong co trong menu retail |
| Customer Value (rieng) | Route ton tai nhung khong co trong menu retail |

---

# TONG HOP LOI DA PHAT HIEN (TU BAN TEST TRUOC)

## Loi lap lai (Cross-module)

| # | Mo ta loi | Module bi anh huong | Muc do |
|---|-----------|---------------------|--------|
| 1 | Thong bao thanh cong nhung hanh dong khong thuc su thuc hien (khong goi API) | So kho (huy phieu), Don hang online (xac nhan don), Hoa don VAT (ky so, gui email, tai PDF, doi soat), Giao hang (day don) | **CRITICAL** |
| 2 | Khong hien thi thong tin khach hang | POS (don tam, don hang, chi tiet don), Don hang online | **HIGH** |
| 3 | Xuat Excel / Xuat bao cao khong hoat dong | POS (bao cao), Don hang online, Hoa don VAT | **HIGH** |
| 4 | Khong bam duoc nut Them phieu / Tao phieu | So kho (xuat kho, chuyen kho, dieu chinh, hoan nhap, hoan xuat), Quan ly kho (phieu nhap) | **HIGH** |
| 5 | Tim kiem khong hoat dong dung | POS (tim kiem SP, tim KH theo SDT), Don tam (tim theo ten KH) | **MEDIUM** |
| 6 | Khong ket noi camera / QR scan | POS | **MEDIUM** |
| 7 | Truong nhap bi gioi han (4 chu so tien mat) | POS thanh toan | **HIGH** |
| 8 | Bo trang man | So kho > Ref tai chinh (tat ca tab) | **HIGH** |
| 9 | Phan trang bi loi | Quan ly kho > Xuat huy (chi hien 10 SP, khong co nut chuyen trang) | **MEDIUM** |

---

*Tai lieu nay duoc hoan thien dua tren:*
*1. Ban test goc cua Testers (RT.01-RT.07)*
*2. Phan tich codebase Reborn Retail CRM*
*3. Bo sung cac module con thieu (RT.08-RT.40)*
*4. Ra soat lan 2: bo sung RT.31-RT.40 (Bao hanh, Marketing, Social CRM, Bao gia, Chien dich, Phan tich KH, Hoa don thuong, POS nang cao, Lich hen, To chuc)*
*5. Ra soat lan 3: kiem tra routes.tsx — bo sung RT.41-RT.43 (BPM, Marketing Automation, Sale Flow) — cac module CO TRONG MENU nhung chua test. Xac nhan 13 module KHONG thuoc retail (khong co route/menu)*

*Tong cong: 43 kich ban, ~860+ buoc kiem thu*

*— Reborn Team, 11/04/2026*
