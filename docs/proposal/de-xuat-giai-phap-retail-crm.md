# DE XUAT GIAI PHAP REBORN RETAIL CRM

> **Phien ban:** 1.0  
> **Ngay:** 16/04/2026  
> **Don vi:** Reborn Technology  
> **Lien he:** ceo@reborn.vn  

---

## Muc luc

1. [Tom tat dieu hanh](#1-tom-tat-dieu-hanh)
2. [Bai toan nganh ban le](#2-bai-toan-nganh-ban-le)
3. [Giai phap tong quan](#3-giai-phap-tong-quan)
4. [Kien truc he thong](#4-kien-truc-he-thong)
5. [Chi tiet phan he](#5-chi-tiet-phan-he)
6. [Diem noi bat](#6-diem-noi-bat)
7. [Tich hop](#7-tich-hop)
8. [Lo trinh trien khai](#8-lo-trinh-trien-khai)
9. [SLA & Ho tro](#9-sla--ho-tro)
10. [Phu luc](#10-phu-luc)

---

## 1. Tom tat dieu hanh

**Reborn Retail CRM** la nen tang quan ly toan dien danh cho chuoi cua hang ban le tai Viet Nam. He thong tich hop dong bo cac nghiep vu: **ban hang (POS)**, **quan ly kho hang**, **tai chinh ke toan**, **quan ly khach hang**, **loyalty** va **marketing** tren mot dashboard duy nhat.

### Diem noi bat chinh

| # | Dac diem | Mo ta |
|---|----------|-------|
| 1 | **Multi-branch** | Quan ly nhieu chi nhanh, nhieu kho tren cung mot he thong |
| 2 | **POS tich hop** | Quay ban hang chuyen nghiep, ho tro offline, in hoa don |
| 3 | **Omnichannel** | Dong bo don hang tu cua hang, website, Zalo, Facebook |
| 4 | **Loyalty tich hop** | Tich diem, hang the, doi thuong — khong can phan mem rieng |
| 5 | **BPM Engine** | Tu dong hoa quy trinh nghiep vu theo luat rieng cua doanh nghiep |
| 6 | **API-first** | Tich hop de dang voi he thong hoa don dien tu, van chuyen, thanh toan |

**Doi tuong:** Chuoi ban le thoi trang, dien tu, F&B, my pham, sieu thi mini va cac nganh ban le khac.

---

## 2. Bai toan nganh ban le

### 2.1 Thuc trang

Cac chuoi ban le tai Viet Nam dang gap phai nhieu thach thuc khi mo rong quy mo:

| # | Van de | Hau qua |
|---|--------|---------|
| 1 | **Quan ly da kenh roi rac** | Don hang offline va online xu ly tach biet, khong dong bo trang thai |
| 2 | **Ton kho nhieu chi nhanh** | Khong biet hang con o kho nao, dieu chuyen thu cong, mat can doi |
| 3 | **Du lieu khach hang phan tan** | Moi chi nhanh mot danh sach, khong nhan dien khach quay lai |
| 4 | **Loyalty rieng le** | Dung phan mem the thanh vien rieng, khong lien thong voi ban hang |
| 5 | **Bao cao thu cong** | Xuat Excel, tong hop bang tay, cham va de sai |
| 6 | **Kho mo rong** | Them chi nhanh phai cai dat lai, khong co chuan hoa quy trinh |

### 2.2 Nhu cau cot loi

- Mot he thong duy nhat cho toan chuoi
- POS nhanh, on dinh, ho tro offline
- Quan ly kho real-time qua nhieu chi nhanh
- Nhan dien khach hang toan chuoi, tich diem tu dong
- Bao cao tu dong, dashboard real-time
- Tich hop hoa don dien tu, van chuyen, mang xa hoi

---

## 3. Giai phap tong quan

### 3.1 Nen tang All-in-One

```
+-------------------------------------------------------------------+
|                    REBORN RETAIL CRM PLATFORM                      |
+-------------------------------------------------------------------+
|                                                                     |
|  +----------+  +---------+  +-----------+  +----------+            |
|  |   POS    |  |   KHO   |  | TAI CHINH |  |  KHACH   |           |
|  | Ban hang |  | Hang hoa|  | Thu chi   |  |  HANG    |           |
|  | Quay, Ca |  | Ton kho |  | Cong no   |  | Phan khuc|           |
|  +----------+  +---------+  +-----------+  +----------+            |
|                                                                     |
|  +----------+  +---------+  +-----------+  +----------+            |
|  | LOYALTY  |  |MARKETING|  | GIAO HANG |  | BAO CAO  |           |
|  | Tich diem|  |Khuyen mai| | Van chuyen|  | Dashboard|           |
|  | Hang the |  | Coupon  |  | Tracking  |  | Xuat file|           |
|  +----------+  +---------+  +-----------+  +----------+            |
|                                                                     |
|  +----------+  +---------+  +-----------+                          |
|  |   BPM    |  |DON HANG |  |  CAI DAT  |                         |
|  | Quy trinh|  | Hoa don |  | Chi nhanh |                         |
|  | Luat, Form| | Doi tra |  | Phan quyen|                         |
|  +----------+  +---------+  +-----------+                          |
|                                                                     |
+-------------------------------------------------------------------+
|              1 DASHBOARD — TOAN CHUOI — REAL-TIME                  |
+-------------------------------------------------------------------+
```

### 3.2 Nguyen tac thiet ke

| Nguyen tac | Chi tiet |
|------------|----------|
| **Multi-tenant** | Moi chuoi la mot tenant doc lap, du lieu cach ly toan bo |
| **Multi-branch** | Moi tenant co nhieu chi nhanh, kho, quay ban hang |
| **API-first** | Moi chuc nang la mot API, de tich hop va mo rong |
| **Offline-capable** | POS hoat dong khi mat mang, dong bo khi co ket noi |
| **Role-based** | Phan quyen theo vai tro: Giam doc, Quan ly, Thu ngan, Kho |

---

## 4. Kien truc he thong

### 4.1 Cong nghe

| Tang | Cong nghe |
|------|-----------|
| **Frontend** | React SPA, Ant Design, PWA (offline POS) |
| **Backend** | Java Spring Boot, microservices |
| **Database** | PostgreSQL (multi-tenant schema) |
| **Cache** | Redis |
| **Message Queue** | RabbitMQ / Kafka |
| **API Gateway** | Spring Cloud Gateway |
| **Auth** | OAuth 2.0 / JWT |

### 4.2 Microservices (12 dich vu)

| # | Service | Chuc nang chinh |
|---|---------|-----------------|
| 1 | **sales-service** | POS, don hang, hoa don, doi tra |
| 2 | **inventory-service** | Hang hoa, bien the, ton kho, kiem ke, dieu chuyen |
| 3 | **billing-service** | Thu chi, cong no, doi soat, phieu thu/chi |
| 4 | **market-service** | Khuyen mai, coupon, flash sale, combo, DMN rules |
| 5 | **customer-service** | Ho so khach hang, phan khuc, lich su mua, loyalty |
| 6 | **notification-service** | SMS, email, push, Zalo OA notification |
| 7 | **integration-service** | Hoa don dien tu, van chuyen, payment gateway |
| 8 | **care-service** | CSKH, ticket, feedback, khieu nai |
| 9 | **logistics-service** | Doi tac van chuyen, phi, tracking, giao nhan |
| 10 | **finance-service** | So quy, bao cao tai chinh, bang can doi |
| 11 | **operation-service** | BPM, quy trinh, luat, form builder |
| 12 | **auth-service** | Dang nhap, phan quyen, tenant, chi nhanh, nhan vien |

### 4.3 So do kien truc

```
                        +------------------+
                        |   React SPA      |
                        |   (PWA / POS)    |
                        +--------+---------+
                                 |
                        +--------+---------+
                        |   API Gateway    |
                        |   (Auth + Rate)  |
                        +--------+---------+
                                 |
        +----------+-------------+-------------+----------+
        |          |             |             |          |
   +----+----+ +---+----+ +-----+-----+ +----+----+ +---+----+
   | sales   | |inventory| | billing   | | market  | |customer|
   | service | | service | | service   | | service | | service|
   +---------+ +---------+ +-----------+ +---------+ +--------+
        |          |             |             |          |
   +----+----+ +---+----+ +-----+-----+ +----+----+ +---+----+
   |notifica-| |integra- | |  care     | |logistics| |finance |
   |  tion   | |  tion   | |  service  | | service | | service|
   +---------+ +---------+ +-----------+ +---------+ +--------+
        |          |             |             |          |
        +----------+-------------+-------------+----------+
                                 |
                   +-------------+-------------+
                   |  operation  |    auth     |
                   |  service    |   service   |
                   +-------------+-------------+
                                 |
                   +-------------+-------------+
                   | PostgreSQL  |    Redis    |
                   +-------------+-------------+
```

---

## 5. Chi tiet phan he

### 5.1 POS Ban hang

Quan ly quay ban hang, ca lam viec va quy trinh thanh toan tai cua hang.

| Chuc nang | Mo ta |
|-----------|-------|
| Quan ly quay | Tao nhieu quay ban hang, gan nhan vien theo ca |
| Ca lam viec | Mo/dong ca, bao cao doanh thu theo ca |
| Tim kiem san pham | Theo ten, ma, barcode, danh muc |
| Gio hang | Them, sua, xoa san pham, ap dung khuyen mai tu dong |
| Thanh toan da phuong thuc | Tien mat, chuyen khoan, the, vi dien tu, QR |
| In hoa don | In hoa don nhiet, hoa don A4/A5, gui email |
| Offline mode | Luu giao dich local, dong bo khi co mang |
| Nhan dien khach hang | Tim theo SĐT, tu dong tich diem loyalty |

### 5.2 Don hang & Hoa don

Xu ly don hang da kenh va quan ly hoa don VAT.

| Chuc nang | Mo ta |
|-----------|-------|
| Tao don hang | Tu POS, website, Zalo, Facebook |
| Trang thai don | Moi → Xac nhan → Dang giao → Hoan thanh / Huy |
| Doi tra hang | Doi san pham, tra hang hoan tien, ghi nhan ly do |
| Hoa don VAT | Lien thong hoa don dien tu Viettel (S-Invoice) |
| Don hang da kenh | Dong bo trang thai giua cac kenh ban hang |
| Lich su don hang | Tra cuu, loc, xuat Excel |

### 5.3 Khach hang

Quan ly thong tin khach hang toan chuoi, phan khuc va cham soc.

| Chuc nang | Mo ta |
|-----------|-------|
| Ho so khach hang | Ten, SĐT, email, dia chi, ngay sinh, ghi chu |
| Phan khuc | Tu dong phan khuc theo doanh thu, tan suat, san pham |
| Lich su mua hang | Toan bo giao dich tren moi chi nhanh |
| Tag & Nhan | Gan tag tu do de phan loai (VIP, B2B, KOL, ...) |
| Hop nhat | Gop nhieu ho so trung thanh mot |
| Import/Export | Nhap danh sach tu Excel, xuat bao cao |

### 5.4 Hang hoa & Kho

Quan ly san pham, bien the, nhieu kho va nghiep vu kho.

| Chuc nang | Mo ta |
|-----------|-------|
| San pham | Ten, ma SKU, barcode, don vi, danh muc, hinh anh |
| Bien the | Mau sac, kich co, phien ban — moi bien the co SKU rieng |
| Nhieu kho | Moi chi nhanh mot kho, kho tong, kho transit |
| Nhap kho | Phieu nhap, nha cung cap, gia nhap, lo hang |
| Xuat kho | Phieu xuat ban, xuat dieu chuyen, xuat huy |
| Dieu chuyen | Chuyen hang giua cac kho, theo doi trang thai |
| Kiem ke | Tao phieu kiem ke, doi chieu, can bang ton kho |
| Canh bao ton | Thong bao khi ton duoi muc toi thieu |

### 5.5 Tai chinh

Quan ly thu chi, so quy va cong no.

| Chuc nang | Mo ta |
|-----------|-------|
| So thu chi | Ghi nhan moi giao dich thu/chi theo danh muc |
| Quan ly quy | Quy tien mat, quy ngan hang, theo doi so du |
| Cong no | Cong no khach hang, cong no nha cung cap |
| Phieu thu/chi | Tao phieu, duyet phieu, in phieu |
| Doi soat | Doi soat doanh thu POS vs ngan hang vs hoa don |
| Bao cao tai chinh | Bao cao thu chi, loi nhuan gop, dong tien |

### 5.6 Marketing

Khuyen mai, coupon va cac chuong trinh ban hang.

| Chuc nang | Mo ta |
|-----------|-------|
| Chuong trinh khuyen mai | Giam gia %, giam tien, mua X tang Y |
| Coupon / Voucher | Tao ma, phat hanh, theo doi su dung, han su dung |
| Flash sale | Khuyen mai theo khung gio, gioi han so luong |
| Combo | Ban combo san pham voi gia uu dai |
| DMN Rules | Cau hinh luat khuyen mai phuc tap bang DMN engine |
| Thong ke hieu qua | Doanh thu tu khuyen mai, ty le su dung coupon |

### 5.7 Loyalty

Chuong trinh khach hang than thiet tich hop truc tiep voi ban hang.

| Chuc nang | Mo ta |
|-----------|-------|
| Tich diem | Tu dong tich diem khi mua hang tai moi chi nhanh |
| Hang the | Thiet lap nhieu hang (Thanh vien, Bac, Vang, Kim cuong) |
| Dieu kien thang hang | Theo doanh thu tich luy hoac diem tich luy |
| Doi thuong | Doi diem lay qua tang, voucher, giam gia |
| Han diem | Cau hinh thoi han hieu luc cua diem |
| Bao cao loyalty | Thong ke diem phat sinh, su dung, het han |

### 5.8 Giao hang

Quan ly van chuyen va doi tac giao hang.

| Chuc nang | Mo ta |
|-----------|-------|
| Doi tac van chuyen | Tich hop GHN, GHTK, Viettel Post |
| Tinh phi | Tu dong tinh phi ship theo doi tac va dia chi |
| Tao van don | Gui yeu cau lay hang tu don hang |
| Tracking | Theo doi trang thai giao hang real-time |
| Doi soat COD | Doi soat tien thu ho voi doi tac van chuyen |
| Bao cao giao hang | Ty le giao thanh cong, thoi gian trung binh |

### 5.9 Bao cao

Dashboard va bao cao toan dien cho toan chuoi.

| Nhom bao cao | Noi dung |
|--------------|----------|
| **Doanh thu** | Theo ngay/tuan/thang, theo chi nhanh, theo nhan vien, theo kenh ban |
| **Khach hang** | Khach moi, khach quay lai, gia tri vong doi (CLV), phan khuc |
| **Ton kho** | Ton hien tai, hang ban chay, hang ton lau, gia tri ton |
| **Marketing** | Hieu qua khuyen mai, ROI coupon, ty le chuyen doi |
| **Tai chinh** | Thu chi, loi nhuan, dong tien, cong no |
| **Loyalty** | Diem phat sinh, diem su dung, ty le doi thuong |
| **Van hanh** | Doanh thu theo ca, hieu suat nhan vien, thoi gian phuc vu |

### 5.10 BPM (Quy trinh nghiep vu)

Tu dong hoa va chuan hoa quy trinh van hanh.

| Chuc nang | Mo ta |
|-----------|-------|
| Thiet ke quy trinh | Keo tha cac buoc, dieu kien, nhanh re |
| Luat nghiep vu | If-then rules, DMN decision table |
| Form builder | Tao form nhap lieu dong cho tung buoc |
| Phe duyet | Cau hinh luong duyet nhieu cap |
| Tu dong hoa | Trigger tu dong khi co su kien (don moi, tra hang, ...) |
| Lich su | Ghi log toan bo quy trinh da chay |

### 5.11 Cai dat

Cau hinh he thong va quan ly truy cap.

| Chuc nang | Mo ta |
|-----------|-------|
| Quan ly chi nhanh | Them, sua, xoa chi nhanh, dia chi, gio hoat dong |
| Phan quyen | Vai tro: Giam doc, Quan ly, Thu ngan, Kho, Ke toan |
| Nhan vien | Ho so, tai khoan, gan chi nhanh, gan vai tro |
| Tich hop Viettel | Cau hinh S-Invoice (hoa don dien tu), eTax |
| Tich hop Zalo OA | Gui tin nhan CSKH, thong bao don hang |
| Tich hop Facebook | Dong bo tin nhan Fanpage, tao don tu chat |
| Cau hinh chung | Logo, ten cua hang, mau hoa don, don vi tien te |

---

## 6. Diem noi bat

### 6.1 Multi-branch Native

Thiet ke tu dau cho chuoi nhieu chi nhanh. Moi chi nhanh co kho, quay, nhan vien, bao cao rieng — nhung tong hop tren mot dashboard duy nhat. Khong can cai dat rieng le cho tung diem ban.

### 6.2 POS Offline-Capable

Quay ban hang hoat dong binh thuong ngay ca khi mat internet. Giao dich duoc luu tai local (PWA + IndexedDB) va tu dong dong bo len server khi co ket noi tro lai. Dam bao ban hang khong gian doan.

### 6.3 Omnichannel

Dong bo don hang tu tat ca cac kenh: cua hang, website, Zalo, Facebook. Khach hang co the dat hang online va nhan tai cua hang (BOPIS) hoac giao tan noi. Toan bo don hang hien thi tren cung mot man hinh quan ly.

### 6.4 Loyalty Tich hop

Chuong trinh khach hang than thiet duoc tich hop truc tiep vao POS va don hang. Thu ngan chi can nhap SDT — he thong tu dong tich diem, hien thi hang the, goi y doi thuong. Khong can phan mem loyalty rieng, khong can nhap lieu thu cong.

### 6.5 BPM Engine

Tu dong hoa quy trinh nghiep vu: duyet don hang lon, xu ly doi tra, phe duyet xuat kho, nhac lich CSKH. Cau hinh luat bang giao dien keo tha, khong can lap trinh. Phu hop voi cac chuoi co quy trinh phuc tap hoac muon chuan hoa van hanh.

### 6.6 API-first

Moi chuc nang deu expose qua RESTful API co tai lieu day du. Doanh nghiep co the tich hop voi he thong ERP, ke toan, website, app rieng hoac bat ky he thong nao khac. Ho tro webhook de nhan su kien real-time.

---

## 7. Tich hop

### 7.1 Hoa don dien tu & Thue

| Doi tac | Dich vu | Mo ta |
|---------|---------|-------|
| **Viettel** | S-Invoice | Phat hanh hoa don dien tu tu dong tu don hang |
| **Viettel** | eTax | Ke khai thue dien tu, nop to khai |

### 7.2 Mang xa hoi

| Kenh | Chuc nang |
|------|-----------|
| **Zalo OA** | Gui thong bao don hang, CSKH, khuyen mai qua Zalo |
| **Facebook Fanpage** | Dong bo tin nhan, tao don hang tu conversation |

### 7.3 Van chuyen

| Doi tac | Chuc nang |
|---------|-----------|
| **GHN (Giao Hang Nhanh)** | Tao van don, tinh phi, tracking, doi soat COD |
| **GHTK (Giao Hang Tiet Kiem)** | Tao van don, tinh phi, tracking, doi soat COD |
| **Viettel Post** | Tao van don, tinh phi, tracking, doi soat COD |

### 7.4 Thanh toan

| Loai | Mo ta |
|------|-------|
| **VNPay / Momo / ZaloPay** | Thanh toan QR tai quay, thanh toan online |
| **Chuyen khoan ngan hang** | Doi soat tu dong qua bank API |

---

## 8. Lo trinh trien khai

### Tong quan: 3 giai doan — 4 den 6 thang

```
Thang 1-2            Thang 2-4            Thang 4-6
+-----------+        +-----------+        +-----------+
| PHASE 1   |  --->  | PHASE 2   |  --->  | PHASE 3   |
| Setup &   |        | Rollout & |        | Marketing |
| POS Pilot |        | Kho + TC  |        | & Loyalty |
+-----------+        +-----------+        +-----------+
```

### Phase 1: Setup & POS Pilot (Thang 1-2)

| Hang muc | Chi tiet |
|----------|----------|
| Khao sat & cau hinh | Thu thap yeu cau, cau hinh tenant, chi nhanh, vai tro |
| Nhap du lieu | Import hang hoa, danh muc, khach hang tu he thong cu |
| POS pilot | Trien khai POS tai 1-2 chi nhanh, dao tao thu ngan |
| Tich hop hoa don | Ket noi S-Invoice Viettel |
| Nghiem thu Phase 1 | POS hoat dong on dinh, in hoa don, bao cao doanh thu |

### Phase 2: Rollout & Kho + Tai chinh (Thang 2-4)

| Hang muc | Chi tiet |
|----------|----------|
| Rollout POS | Mo rong POS ra toan bo chi nhanh |
| Kho hang | Cau hinh nhieu kho, nhap/xuat/dieu chuyen, kiem ke |
| Tai chinh | Thu chi, so quy, cong no, doi soat |
| Giao hang | Tich hop GHN/GHTK/Viettel Post |
| Omnichannel | Ket noi Zalo OA, Facebook Fanpage |
| Nghiem thu Phase 2 | Toan bo chi nhanh online, kho & tai chinh hoat dong |

### Phase 3: Marketing & Loyalty & Bao cao (Thang 4-6)

| Hang muc | Chi tiet |
|----------|----------|
| Marketing | Thiet lap chuong trinh khuyen mai, coupon, flash sale |
| Loyalty | Cau hinh tich diem, hang the, doi thuong |
| BPM | Thiet ke quy trinh duyet, tu dong hoa |
| Bao cao | Dashboard tong hop, bao cao tu dong, xuat file |
| Dao tao toan dien | Dao tao quan ly, ke toan, CSKH |
| Nghiem thu toan bo | He thong van hanh day du, ban giao tai lieu |

---

## 9. SLA & Ho tro

### 9.1 Cam ket dich vu

| Hang muc | Cam ket |
|----------|---------|
| **Uptime** | 99.5% (tinh theo thang, tru bao tri da thong bao) |
| **Thoi gian ho tro** | Trong gio hanh chinh: 8:00-17:30, Thu 2 — Thu 7 |
| **Thoi gian phan hoi** | Loi nghiem trong: 2 gio — Loi binh thuong: 8 gio |
| **Kenh ho tro** | Zalo OA, email, dien thoai, ticket system |

### 9.2 Dao tao

| Buoi | Noi dung | Doi tuong |
|------|----------|-----------|
| Buoi 1 | POS ban hang, don hang, in hoa don | Thu ngan, nhan vien ban hang |
| Buoi 2 | Kho hang, tai chinh, giao hang | Quan ly kho, ke toan |
| Buoi 3 | Marketing, loyalty, bao cao, cai dat | Quan ly cua hang, giam doc |

### 9.3 Bao hanh & Tai lieu

| Hang muc | Chi tiet |
|----------|---------|
| **Bao hanh** | 6 thang sau nghiem thu — sua loi mien phi |
| **SA (Solution Architecture)** | 15 phan — kien truc tung module |
| **URD (User Requirement)** | 15 phan — dac ta yeu cau nguoi dung |
| **HDSD (Huong dan su dung)** | 14 phan — huong dan thao tac cho end-user |
| **Test suites** | 51 bo test — kiem thu toan dien moi chuc nang |
| **API Documentation** | Swagger/OpenAPI cho toan bo 12 microservices |

---

## 10. Phu luc

### 10.1 Feature Checklist

| # | Phan he | Chuc nang | Co/Khong |
|---|---------|-----------|----------|
| 1 | POS | Quan ly quay ban hang | Co |
| 2 | POS | Ca lam viec | Co |
| 3 | POS | Thanh toan da phuong thuc | Co |
| 4 | POS | In hoa don nhiet / A4 | Co |
| 5 | POS | Offline mode (PWA) | Co |
| 6 | Don hang | Tao don da kenh | Co |
| 7 | Don hang | Quan ly trang thai don | Co |
| 8 | Don hang | Doi tra hang | Co |
| 9 | Don hang | Hoa don dien tu (S-Invoice) | Co |
| 10 | Khach hang | CRUD ho so khach hang | Co |
| 11 | Khach hang | Phan khuc tu dong | Co |
| 12 | Khach hang | Lich su mua hang toan chuoi | Co |
| 13 | Khach hang | Hop nhat ho so trung | Co |
| 14 | Kho | Quan ly san pham & bien the | Co |
| 15 | Kho | Nhieu kho / nhieu chi nhanh | Co |
| 16 | Kho | Nhap kho / Xuat kho | Co |
| 17 | Kho | Dieu chuyen kho | Co |
| 18 | Kho | Kiem ke | Co |
| 19 | Kho | Canh bao ton kho thap | Co |
| 20 | Tai chinh | So thu chi | Co |
| 21 | Tai chinh | Quan ly quy | Co |
| 22 | Tai chinh | Cong no KH / NCC | Co |
| 23 | Tai chinh | Doi soat doanh thu | Co |
| 24 | Marketing | Chuong trinh khuyen mai | Co |
| 25 | Marketing | Coupon / Voucher | Co |
| 26 | Marketing | Flash sale | Co |
| 27 | Marketing | Combo | Co |
| 28 | Loyalty | Tich diem tu dong | Co |
| 29 | Loyalty | Hang the (nhieu cap) | Co |
| 30 | Loyalty | Doi thuong | Co |
| 31 | Loyalty | Han diem | Co |
| 32 | Giao hang | Tich hop GHN / GHTK / Viettel Post | Co |
| 33 | Giao hang | Tu dong tinh phi ship | Co |
| 34 | Giao hang | Tracking real-time | Co |
| 35 | Giao hang | Doi soat COD | Co |
| 36 | Bao cao | Dashboard real-time | Co |
| 37 | Bao cao | Bao cao doanh thu | Co |
| 38 | Bao cao | Bao cao khach hang | Co |
| 39 | Bao cao | Bao cao ton kho | Co |
| 40 | Bao cao | Xuat Excel / PDF | Co |
| 41 | BPM | Thiet ke quy trinh | Co |
| 42 | BPM | Luat nghiep vu (DMN) | Co |
| 43 | BPM | Form builder | Co |
| 44 | Cai dat | Quan ly chi nhanh | Co |
| 45 | Cai dat | Phan quyen theo vai tro | Co |
| 46 | Tich hop | Viettel S-Invoice | Co |
| 47 | Tich hop | Viettel eTax | Co |
| 48 | Tich hop | Zalo OA | Co |
| 49 | Tich hop | Facebook Fanpage | Co |
| 50 | Tich hop | Payment gateway (VNPay/Momo) | Co |

### 10.2 Danh muc tai lieu

| # | Loai tai lieu | So luong | Ghi chu |
|---|---------------|----------|---------|
| 1 | SA (Solution Architecture) | 15 phan | Kien truc tung module |
| 2 | URD (User Requirement) | 15 phan | Dac ta yeu cau |
| 3 | HDSD (Huong dan su dung) | 14 phan | End-user guide |
| 4 | Test Suites | 51 bo | Unit + Integration + E2E |
| 5 | API Docs | 12 services | Swagger/OpenAPI |
| 6 | De xuat giai phap | 1 tai lieu | Tai lieu nay |

---

> **Reborn Technology** — Giai phap quan ly ban le toan dien cho chuoi cua hang Viet Nam.  
> Lien he: ceo@reborn.vn
