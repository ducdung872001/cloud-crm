# Tieu Chi Nghiem Thu - Reborn Retail CRM

> **Du an:** Reborn Retail CRM (Chuoi cua hang ban le)
> **Phien ban:** 1.0
> **Ngay lap:** 2026-04-16
> **Nguoi lap:** Project Manager

---

## Gioi thieu

Tai lieu nay dinh nghia cac tieu chi nghiem thu cho du an Reborn Retail CRM, chia thanh 3 giai doan trien khai. Moi tieu chi phai dat **Dat** de giai doan duoc nghiem thu thanh cong. Neu co tieu chi **Khong dat**, can ghi ro ly do va ke hoach khac phuc tai cot Ghi chu.

**Dieu kien nghiem thu tung giai doan:**
- Tat ca tieu chi bat buoc phai dat trang thai **Dat**
- Khong co loi nghiem trong (Critical/Blocker) chua duoc xu ly
- Tai lieu ban giao day du cho giai doan tuong ung
- Hai ben ky bien ban nghiem thu

---

## Giai doan 1: POS + Ban hang co ban (Thang 1-2)

**Muc tieu:** Trien khai POS tai 3-5 cua hang pilot, dam bao quy trinh ban hang co ban hoat dong on dinh.

| STT | Tieu chi | Mo ta | Phuong phap kiem tra | Ket qua | Ghi chu |
|-----|---------|-------|----------------------|---------|---------|
| 1.1 | **Deploy moi truong Production** | He thong duoc deploy thanh cong len moi truong production, truy cap duoc qua domain chinh thuc | Truy cap URL he thong, dang nhap thanh cong voi tai khoan admin. Kiem tra SSL certificate, response time < 3 giay | Dat / Khong | |
| 1.2 | **POS pilot 3-5 cua hang** | POS hoat dong on dinh tai it nhat 3 cua hang pilot trong 5 ngay lien tiep khong co loi Critical | Theo doi log va bao cao loi tu 3-5 cua hang pilot trong 5 ngay lam viec. Kiem tra so luong giao dich thanh cong / that bai | Dat / Khong | |
| 1.3 | **Mo ca / Dong ca (Shift)** | Nhan vien co the mo ca dau ngay (khai bao so du dau), dong ca cuoi ngay (doi soat tien mat, in bao cao ca) | (1) Mo ca voi so du dau 5.000.000d. (2) Thuc hien 10+ giao dich. (3) Dong ca - kiem tra tong tien khop voi giao dich. (4) In phieu dong ca | Dat / Khong | |
| 1.4 | **Tao hoa don ban hang** | Tao duoc hoa don ban hang voi 1+ san pham, ap dung dung gia ban, tinh dung tong tien (truoc thue, thue, giam gia, tong thanh toan) | (1) Tao hoa don 1 san pham - kiem tra tinh toan. (2) Tao hoa don 5+ san pham - kiem tra tinh toan. (3) Tao hoa don co giam gia % va giam gia tien. (4) Kiem tra lam tron so | Dat / Khong | |
| 1.5 | **In hoa don (receipt)** | In hoa don thanh cong qua may in nhiet (80mm), noi dung day du: ten cua hang, san pham, gia, tong tien, ma hoa don, ngay gio | (1) Ket noi may in nhiet. (2) In hoa don - kiem tra noi dung, layout, ma vach/QR. (3) In lai hoa don cu. (4) Kiem tra in khi mat ket noi may in (hien thong bao loi phu hop) | Dat / Khong | |
| 1.6 | **Thanh toan nhieu phuong thuc** | Khach hang co the thanh toan bang: tien mat, chuyen khoan, the, vi dien tu. Ho tro thanh toan ket hop (VD: 50% tien mat + 50% chuyen khoan) | (1) Thanh toan 100% tien mat - kiem tra tien thua. (2) Thanh toan 100% chuyen khoan. (3) Thanh toan ket hop 2 phuong thuc. (4) Kiem tra so quy ghi nhan dung theo tung phuong thuc | Dat / Khong | |
| 1.7 | **Tra cuu khach hang** | Tim kiem khach hang nhanh theo SDT, ten, ma khach hang. Gan khach hang vao hoa don de tich diem | (1) Tim theo SDT - ket qua < 1 giay. (2) Tim theo ten (ho tro khong dau). (3) Tao khach hang moi nhanh tai POS. (4) Gan khach hang vao hoa don - kiem tra lich su mua hang cap nhat | Dat / Khong | |
| 1.8 | **POS offline mode** | POS van hoat dong binh thuong khi mat internet: tao hoa don, thanh toan tien mat, in receipt. Du lieu dong bo lai khi co mang | (1) Ngat mang - tao 5 hoa don. (2) Bat mang lai - kiem tra 5 hoa don dong bo thanh cong. (3) Kiem tra khong trung lap du lieu. (4) Kiem tra bao cao sau dong bo | Dat / Khong | |
| 1.9 | **Quan ly san pham co ban** | Them/sua/xoa san pham, nhom san pham. San pham co: ten, ma, gia ban, don vi tinh, hinh anh | (1) Tao san pham moi voi day du thong tin. (2) Cap nhat gia ban - kiem tra POS cap nhat. (3) Ngung kinh doanh san pham - kiem tra khong hien tren POS. (4) Import san pham tu Excel | Dat / Khong | |
| 1.10 | **Bao cao ban hang co ban** | Bao cao doanh thu theo ngay/tuan/thang, theo cua hang, theo nhan vien. So lieu khop voi giao dich thuc te | (1) Bao cao doanh thu ngay - doi chieu voi tung hoa don. (2) Bao cao theo cua hang - tong cac cua hang = tong cong ty. (3) Export bao cao ra Excel | Dat / Khong | |

---

## Giai doan 2: Kho + Tai chinh + Da kenh (Thang 2-4)

**Muc tieu:** Hoan thien quan ly kho hang, tai chinh (so quy, cong no), va ho tro ban hang da kenh.

| STT | Tieu chi | Mo ta | Phuong phap kiem tra | Ket qua | Ghi chu |
|-----|---------|-------|----------------------|---------|---------|
| 2.1 | **Quan ly ton kho** | Xem ton kho thuc te theo cua hang, theo kho. Ton kho cap nhat tu dong khi ban, nhap, chuyen, tra, huy | (1) Ban 5 SP A - kiem tra ton kho giam 5. (2) Nhap 10 SP A - kiem tra ton kho tang 10. (3) Chuyen kho 3 SP A tu CH1 sang CH2 - kiem tra ca 2 kho. (4) Kiem tra ton kho am (co canh bao) | Dat / Khong | |
| 2.2 | **Phieu nhap kho** | Tao phieu nhap kho tu nha cung cap, nhap chuyen kho, nhap tra hang. In phieu nhap. Duyet phieu nhap theo workflow | (1) Tao phieu nhap tu NCC voi 10 san pham. (2) Duyet phieu nhap - kiem tra ton kho tang. (3) Tu choi phieu nhap - kiem tra ton kho khong doi. (4) In phieu nhap kho | Dat / Khong | |
| 2.3 | **Phieu xuat kho** | Tao phieu xuat ban hang (tu dong tu hoa don), xuat chuyen kho, xuat huy, xuat tra NCC | (1) Ban hang - kiem tra phieu xuat tu dong. (2) Tao phieu xuat chuyen kho - kiem tra ton 2 kho. (3) Xuat huy co ly do - kiem tra ton kho giam. (4) Xuat tra NCC co phieu nhap goc | Dat / Khong | |
| 2.4 | **So quy (Cashbook)** | Ghi nhan thu/chi tu dong tu giao dich ban hang, nhap hang. Ho tro tao phieu thu/chi thu cong. Can doi cuoi ngay | (1) Ban hang - kiem tra but toan thu tu dong. (2) Nhap hang - kiem tra but toan chi tu dong. (3) Tao phieu thu/chi thu cong. (4) Doi soat so quy cuoi ngay - so du khop | Dat / Khong | |
| 2.5 | **Quan ly cong no** | Theo doi cong no khach hang (ban chua thu) va cong no nha cung cap (mua chua tra). Canh bao no qua han | (1) Ban hang chua thu tien - cong no KH tang. (2) Thu tien - cong no KH giam. (3) Nhap hang chua tra - cong no NCC tang. (4) Bao cao cong no qua han | Dat / Khong | |
| 2.6 | **Don hang da kenh** | Tiep nhan don hang tu website/app/Shopee/Lazada/TikTok Shop. Don hang hien thi tap trung tren he thong | (1) Tao don tu website - kiem tra hien thi tren CRM. (2) Dong bo don tu Shopee (neu co API). (3) Xu ly don: xac nhan, dong goi, giao hang. (4) Cap nhat trang thai dong bo nguoc lai kenh ban | Dat / Khong | |
| 2.7 | **Hoa don dien tu (VAT e-invoice)** | Phat hanh hoa don dien tu theo quy dinh (Thong tu 78). Tich hop VNPT/Viettel/BKAV. Huy, dieu chinh, thay the hoa don | (1) Phat hanh HDDT tu hoa don ban hang. (2) Kiem tra thong tin HDDT dung (ma so thue, ten KH, san pham, thue suat). (3) Huy HDDT - kiem tra trang thai. (4) Dieu chinh HDDT - kiem tra hoa don goc | Dat / Khong | |
| 2.8 | **Kiem kho** | Tao phieu kiem kho, nhan vien nhap so luong thuc te, he thong tinh chenh lech va tao phieu dieu chinh | (1) Tao phieu kiem kho cho 20 SP. (2) Nhap so luong thuc te (co chenh lech). (3) Duyet kiem kho - kiem tra ton kho dieu chinh. (4) Bao cao chenh lech kiem kho | Dat / Khong | |
| 2.9 | **Tra hang** | Khach hang tra hang: tao phieu tra, hoan tien (tien mat/chuyen khoan), cap nhat lai ton kho va doanh thu | (1) Tra hang 1 phan don - kiem tra hoan tien dung so tien. (2) Tra hang toan bo don. (3) Kiem tra ton kho tang lai. (4) Kiem tra bao cao doanh thu tru tra hang | Dat / Khong | |
| 2.10 | **Quan ly nha cung cap** | CRUD nha cung cap (ten, MST, dia chi, lien he). Lich su nhap hang, cong no theo NCC | (1) Tao NCC moi. (2) Tao phieu nhap tu NCC - kiem tra lich su. (3) Xem cong no theo NCC. (4) Bao cao mua hang theo NCC (so luong, gia tri) | Dat / Khong | |

---

## Giai doan 3: Marketing + Loyalty + Bao cao + Ban giao (Thang 4-6)

**Muc tieu:** Hoan thien cac tinh nang marketing, loyalty, bao cao nang cao. Ban giao he thong va dao tao doi ngu tu van hanh.

| STT | Tieu chi | Mo ta | Phuong phap kiem tra | Ket qua | Ghi chu |
|-----|---------|-------|----------------------|---------|---------|
| 3.1 | **Promotion engine** | Cau hinh chuong trinh khuyen mai: giam gia %, giam gia tien, mua X tang Y, combo, flash sale. Ap dung tu dong tren POS | (1) Tao KM giam 20% nhom SP A - kiem tra POS ap dung dung. (2) Tao KM mua 2 tang 1 - kiem tra tinh toan. (3) 2 KM chong nhau - kiem tra rule uu tien. (4) KM het han - kiem tra tu dong ngung | Dat / Khong | |
| 3.2 | **Loyalty points (Tich diem)** | Khach hang tich diem theo gia tri mua hang. Doi diem thanh voucher hoac giam gia truc tiep. Hang thanh vien (Silver/Gold/Platinum) | (1) Mua 1.000.000d - kiem tra diem tich luy dung ti le. (2) Doi diem - kiem tra tru dung. (3) Nang hang tu dong khi du dieu kien. (4) Bao cao diem tich luy, doi diem theo thoi gian | Dat / Khong | |
| 3.3 | **Bao cao nang cao** | Dashboard tong quan (doanh thu, don hang, KH moi, top SP). Bao cao loi nhuan gop, bao cao ton kho, bao cao ABC, bao cao KH | (1) Dashboard real-time - so lieu khop voi chi tiet. (2) Bao cao loi nhuan gop = doanh thu - gia von. (3) Bao cao ABC phan loai dung SP theo doanh thu. (4) Export tat ca bao cao ra Excel/PDF | Dat / Khong | |
| 3.4 | **BPM (Quy trinh nghiep vu)** | Cau hinh workflow duyet: phieu nhap kho, phieu xuat, phieu chi, khuyen mai. Phan quyen duyet theo cap bac | (1) Tao phieu chi > 10 trieu - kiem tra can duyet cap 2. (2) Duyet phieu - kiem tra trang thai cap nhat. (3) Tu choi phieu - kiem tra ly do va thong bao. (4) Uy quyen duyet khi nguoi duyet vang | Dat / Khong | |
| 3.5 | **Dao tao hoan tat** | 100% nhan vien cua hang duoc dao tao va co the tu thao tac cac chuc nang co ban (POS, kiem kho, bao cao) | (1) Kiem tra checklist dao tao: 100% nhan vien hoan thanh. (2) Bai kiem tra thuc hanh: dat toi thieu 80%. (3) Moi cua hang co it nhat 1 super-user. (4) Tai lieu HDSD da phat cho tat ca cua hang | Dat / Khong | |
| 3.6 | **Tai lieu ban giao** | Day du tai lieu: HDSD, tai lieu ky thuat (API docs, DB schema, deployment guide), tai lieu van hanh (backup, monitoring) | (1) Kiem tra danh muc tai lieu ban giao. (2) Review noi dung HDSD - day du cac chuc nang. (3) Review tai lieu ky thuat - dev moi doc hieu duoc. (4) Review tai lieu van hanh - IT co the tu deploy | Dat / Khong | |
| 3.7 | **Doi ngu tu van hanh** | Doi IT/van hanh cua khach hang co kha nang: xu ly loi co ban, backup/restore, tao user, cau hinh he thong | (1) Kich ban test: server restart - doi IT tu xu ly. (2) Kich ban: tao cua hang moi + user + phan quyen. (3) Kich ban: backup va restore database. (4) Kich ban: xu ly hoa don loi | Dat / Khong | |
| 3.8 | **SMS/Zalo OA thong bao** | Gui tin nhan tu dong cho khach hang: xac nhan don, chuc mung sinh nhat, nhac lich hen, thong bao khuyen mai | (1) Dat hang - kiem tra SMS/Zalo xac nhan gui thanh cong. (2) Cau hinh tin nhan sinh nhat - kiem tra gui dung ngay. (3) Bao cao so luong tin gui/that bai. (4) Opt-out: KH huy nhan tin - kiem tra khong gui nua | Dat / Khong | |
| 3.9 | **Phan quyen va bao mat** | RBAC phan quyen theo vai tro (admin, quan ly, thu ngan, kho). Phan quyen theo chi nhanh. Audit log day du | (1) Thu ngan khong truy cap duoc bao cao tai chinh. (2) Quan ly CH1 khong thay du lieu CH2. (3) Admin thay tat ca. (4) Kiem tra audit log ghi nhan moi thao tac quan trong | Dat / Khong | |
| 3.10 | **Performance & Stability** | He thong hoat dong on dinh 30 ngay lien tuc. Response time API < 2s. Uptime > 99.5%. Khong co loi Critical chua fix | (1) Bao cao uptime 30 ngay tu monitoring. (2) Bao cao response time P95 < 2s. (3) Danh sach bug: 0 Critical, 0 Blocker. (4) Load test: 50 user dong thoi, khong loi | Dat / Khong | |

---

## Dieu kien nghiem thu tong the

| Hang muc | Yeu cau | Trang thai |
|----------|---------|------------|
| Tat ca tieu chi bat buoc | 100% dat "Dat" | |
| Loi Critical / Blocker | 0 loi chua xu ly | |
| Loi Major | Toi da 3 loi, co ke hoach fix trong 2 tuan | |
| Tai lieu ban giao | Day du theo danh muc | |
| Dao tao | 100% nhan vien hoan thanh | |
| Van hanh thu | Toi thieu 2 tuan khong su co nghiem trong | |

---

## Chu ky nghiem thu

### Giai doan 1: POS + Ban hang co ban

| | Ho ten | Chuc vu | Chu ky | Ngay |
|---|--------|---------|--------|------|
| **Ben A (Khach hang)** | | | | |
| Dai dien 1 | _________________ | _________________ | _________________ | ____/____/2026 |
| Dai dien 2 | _________________ | _________________ | _________________ | ____/____/2026 |
| **Ben B (Reborn)** | | | | |
| Project Manager | _________________ | _________________ | _________________ | ____/____/2026 |
| Tech Lead | _________________ | _________________ | _________________ | ____/____/2026 |

### Giai doan 2: Kho + Tai chinh + Da kenh

| | Ho ten | Chuc vu | Chu ky | Ngay |
|---|--------|---------|--------|------|
| **Ben A (Khach hang)** | | | | |
| Dai dien 1 | _________________ | _________________ | _________________ | ____/____/2026 |
| Dai dien 2 | _________________ | _________________ | _________________ | ____/____/2026 |
| **Ben B (Reborn)** | | | | |
| Project Manager | _________________ | _________________ | _________________ | ____/____/2026 |
| Tech Lead | _________________ | _________________ | _________________ | ____/____/2026 |

### Giai doan 3: Marketing + Loyalty + Bao cao + Ban giao

| | Ho ten | Chuc vu | Chu ky | Ngay |
|---|--------|---------|--------|------|
| **Ben A (Khach hang)** | | | | |
| Dai dien 1 | _________________ | _________________ | _________________ | ____/____/2026 |
| Dai dien 2 | _________________ | _________________ | _________________ | ____/____/2026 |
| **Ben B (Reborn)** | | | | |
| Project Manager | _________________ | _________________ | _________________ | ____/____/2026 |
| Tech Lead | _________________ | _________________ | _________________ | ____/____/2026 |

---

> **Ghi chu:** Bien ban nghiem thu chi co hieu luc khi co day du chu ky cua dai dien hai ben. Moi giai doan nghiem thu doc lap, giai doan sau chi bat dau khi giai doan truoc da duoc nghiem thu thanh cong.
