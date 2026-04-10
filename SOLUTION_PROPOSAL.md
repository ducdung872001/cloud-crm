# DE XUAT GIAI PHAP TONG THE
# HE THONG QUAN LY TOA NHA DA DICH VU CONG DONG
## (Community Hub Platform — Reborn Community)

**Phien ban:** 1.0
**Ngay:** 2026-04-10
**Nhanh phat trien:** community-hub (fork tu Reborn Retail)
**Nguoi lap:** Team Reborn

---

## MUC LUC

1. [Tong quan du an](#1-tong-quan-du-an)
2. [Mo hinh kinh doanh](#2-mo-hinh-kinh-doanh)
3. [Kien truc giai phap](#3-kien-truc-giai-phap)
4. [Phan hoach chuc nang & GAP Analysis](#4-phan-hoach-chuc-nang--gap-analysis)
5. [Chi tiet cac module moi (GAP)](#5-chi-tiet-cac-module-moi-gap)
6. [Lo trinh trien khai](#6-lo-trinh-trien-khai)
7. [Chi phi dau tu](#7-chi-phi-dau-tu)
8. [Rui ro & Giai phap](#8-rui-ro--giai-phap)
9. [Phu luc](#9-phu-luc)

---

## 1. TONG QUAN DU AN

### 1.1. Boi canh

Reborn Retail la he thong CRM/Retail da duoc phat trien voi day du cac module: Quan ly khach hang, POS, Kho hang, Marketing, Loyalty, BPM, Tai chinh, Ticket/Warranty, Lich hen, va da co module Community Hub co ban. He thong hien tai phuc vu mo hinh ban le truyen thong.

Yeu cau moi la xay dung mot **nen tang quan ly toa nha da dich vu cong dong** — noi ket hop 4 linh vuc chinh: An uong & Khong gian sinh hoat, Luu tru, Suc khoe & Sac dep, va Dao tao/Ket noi cong dong — phuc vu khoang **~200 thanh vien** voi mo hinh thanh vien 24/7.

### 1.2. Tam nhin san pham

> Mot nen tang so hoa toan dien cho mo hinh "Toa nha da dich vu cong dong", noi moi thanh vien co the song, lam viec, hoc tap, ren luyen suc khoe, va ket noi co hoi nghe nghiep — tat ca trong mot he sinh thai so duy nhat.

### 1.3. Doi tuong su dung

| Vai tro | Mo ta |
|---------|-------|
| **Admin / Operator** | Quan ly toa nha, cau hinh dich vu, bao cao, tai chinh |
| **Nhan vien tiep tan** | Check-in/out, ban hang POS, xu ly dich vu |
| **Thanh vien (Member)** | Su dung dich vu, tich diem, chia se gia dinh, tuyen thanh vien moi |
| **KOL/KOC/Leader** | Tao khoa hoc, dan dat CLB, thu hut thanh vien |
| **PO (Product Owner)** | Quan ly noi dung, khoa hoc, du an |
| **Doi tac (Partner)** | Cung cap dich vu tai toa nha (spa, gym, F&B...) |

### 1.4. Quy mo

- ~200 thanh vien ban dau
- 4 linh vuc dich vu
- Mo hinh phi thanh vien theo thang
- Hoat dong 24/7

---

## 2. MO HINH KINH DOANH

### 2.1. Cac nguon doanh thu

```
+------------------------------------------------------------------+
|                    NGUON DOANH THU                                |
+------------------------------------------------------------------+
|                                                                    |
|  1. PHI THANH VIEN HANG THANG                                     |
|     - Goi co ban: Khong gian + Do uong + Wifi 24/7                |
|     - Goi nang cao: + Suc khoe + Luu tru                          |
|     - Goi gia dinh: Chia se cho 2-4 nguoi than                    |
|     - Goi doanh nghiep: Cho nhom/startup                          |
|                                                                    |
|  2. DICH VU TRA PHI (Pay-per-use)                                 |
|     - An uong (F&B) tai quay                                      |
|     - Dich vu suc khoe/spa/gym (ngoai goi)                        |
|     - Phong luu tru rieng                                          |
|     - Khoa hoc tra phi                                             |
|                                                                    |
|  3. HOA HONG & CHIA SE DOANH THU                                  |
|     - Hoa hong tu doi tac (spa, gym, F&B tenant)                  |
|     - Phi hoa hong tuyen thanh vien (referral)                    |
|     - Chia se doanh thu khoa hoc (KOL/PO)                         |
|                                                                    |
|  4. SU KIEN & HOP TAC                                             |
|     - Cho thue khong gian to chuc su kien                         |
|     - Tai tro/hop tac doanh nghiep                                |
|     - Quang cao noi bo                                             |
|                                                                    |
+------------------------------------------------------------------+
```

### 2.2. Mo hinh thanh vien (Membership Tiers)

| Hang | Phi/thang (VND) | Quyen loi |
|------|---------------:|-----------|
| **Basic** | 500,000 - 1,000,000 | Khong gian lam viec 24/7, do uong co ban, wifi |
| **Standard** | 1,500,000 - 2,500,000 | Basic + Suc khoe co ban (gym), 2 buoi massage/thang |
| **Premium** | 3,000,000 - 5,000,000 | Standard + Luu tru phong tap the, khoa hoc mien phi, uu dai F&B |
| **Family** | 4,000,000 - 7,000,000 | Premium x2-4 nguoi, phong gia dinh |
| **Enterprise** | Thoa thuan | Goi cho nhom startup/doanh nghiep, phong hop rieng |

> **Ghi chu:** Muc phi tham khao, can khao sat thi truong de dieu chinh.

### 2.3. He thong tich diem (Loyalty)

```
Hanh dong                              Diem
-----------------------------------------
Su dung dich vu (moi 10,000 VND)       1 diem
Check-in hang ngay                     2 diem
Tham gia khoa hoc                      5 diem
Tuyen thanh vien moi (Referral)       50 diem
Hoan thanh survey/feedback             3 diem
Tham gia su kien CLB                   5 diem
Leader tao khoa hoc thanh cong        20 diem

Doi diem:
- 100 diem = Giam 50,000 VND dich vu
- 200 diem = 1 buoi spa mien phi
- 500 diem = 1 thang nang cap hang
```

---

## 3. KIEN TRUC GIAI PHAP

### 3.1. Kien truc tong the

```
+---------------------------------------------------------------+
|                     REBORN COMMUNITY HUB                       |
+---------------------------------------------------------------+
|                                                                 |
|  +------------------+  +------------------+  +---------------+  |
|  |   MEMBER APP     |  |   ADMIN PORTAL   |  |   POS SYSTEM  |  |
|  |   (Mobile/Web)   |  |   (Web - React)  |  |  (Counter)    |  |
|  +--------+---------+  +--------+---------+  +-------+-------+  |
|           |                      |                    |          |
|  +--------+----------------------+--------------------+-------+  |
|  |                     API GATEWAY                            |  |
|  +----+--------+--------+--------+--------+--------+---------+  |
|       |        |        |        |        |        |            |
|  +----+--+ +---+--+ +---+--+ +---+--+ +---+--+ +--+---+       |
|  | Auth  | | CRM  | | POS  | | Luu  | | Khoa | | Loy- |       |
|  | Svc   | | Svc  | | Svc  | | tru  | | hoc  | | alty  |       |
|  +-------+ +------+ +------+ | Svc  | | Svc  | | Svc  |       |
|                               +------+ +------+ +------+       |
|  +--------+ +--------+ +--------+ +--------+ +--------+        |
|  | Thong  | | Tai    | | Bao    | | Ket    | | Phan   |        |
|  | bao    | | chinh  | | cao    | | noi    | | hoi    |        |
|  | Svc    | | Svc    | | Svc    | | Svc    | | Svc    |        |
|  +--------+ +--------+ +--------+ +--------+ +--------+        |
|                                                                 |
|  +-----------------------------------------------------------+  |
|  |              INFRASTRUCTURE LAYER                          |  |
|  |  PostgreSQL | Redis | Firebase | MinIO | Kafka             |  |
|  +-----------------------------------------------------------+  |
+---------------------------------------------------------------+

THIET BI VAT LY:
+------------------+  +------------------+  +------------------+
|   May POS        |  |  Dau doc the     |  |  May quet        |
|   (Touch Screen) |  |  (NFC/Chip)      |  |  QR/Barcode      |
+------------------+  +------------------+  +------------------+
```

### 3.2. Cong nghe su dung (ke thua tu Reborn Retail)

| Tang | Cong nghe | Ghi chu |
|------|-----------|---------|
| Frontend | React 18 + TypeScript + Vite | Ke thua |
| UI Components | AG Grid, Highcharts, Custom Components | Ke thua |
| State | React Context + React Query (moi) | Nang cap |
| API | RESTful + Fetch API | Ke thua |
| Auth | JWT + NFC/QR xac thuc | Mo rong |
| Realtime | Firebase FCM + WebSocket (moi) | Mo rong |
| Build | Vite + Docker + Nginx | Ke thua |

### 3.3. Tich hop phan cung

| Thiet bi | Muc dich | Giao thuc |
|----------|----------|-----------|
| May POS (touch screen) | Ban hang, check-in | USB/Network |
| Dau doc NFC/Chip | Xac thuc the thanh vien | HID/Serial |
| May quet QR/Barcode | Quet the/ma san pham | HID/Serial |
| May in hoa don | In bien lai | ESC/POS |
| Camera IP | Giam sat, nhan dien | RTSP (tuy chon) |

---

## 4. PHAN HOACH CHUC NANG & GAP ANALYSIS

### 4.1. Bang tong hop GAP

**Ky hieu:**
- **REUSE** = Tai su dung truc tiep tu Reborn Retail, khong can chinh sua
- **ADAPT** = Co san nhung can dieu chinh/mo rong cho phu hop
- **NEW** = Chua co, can phat trien moi hoan toan
- **REMOVE** = Co trong Reborn Retail nhung khong can cho Community Hub

### 4.2. CHI TIET GAP THEO TUNG LINH VUC

---

#### A. QUAN LY THANH VIEN (MEMBERSHIP MANAGEMENT)

| # | Chuc nang yeu cau | Module Reborn Retail | Trang thai | Chi tiet GAP |
|---|-------------------|---------------------|:----------:|--------------|
| A1 | Dang ky thanh vien | CustomerService, MemberCustomersPage | **ADAPT** | Co quan ly KH. Can them: loai thanh vien, goi dich vu, ngay het han, gia dinh lien ket |
| A2 | Phan hang thanh vien (Basic/Standard/Premium/Family) | MembershipClass, LoyaltySegment | **ADAPT** | Co loyalty tier. Can them: mapping goi → quyen loi cu the, auto nang/ha hang |
| A3 | Phi thanh vien hang thang (recurring billing) | — | **NEW** | Reborn Retail chi co ban le 1 lan. Can: recurring billing, auto gia han, nhac phi, hoa don dinh ky |
| A4 | Chia se goi thanh vien cho gia dinh | — | **NEW** | Chua co khai niem "gia dinh" hay chia se quyen loi. Can: lien ket thanh vien, quota chia se, theo doi su dung rieng |
| A5 | The thanh vien (chip/QR/barcode) | CardService, QrCodeProService | **ADAPT** | Co the dich vu (CardService). Can them: NFC chip ID, ma QR dong, barcode lien ket, in the |
| A6 | Xac thuc thanh vien (quet the) | — | **NEW** | Chua co module xac thuc vat ly. Can: API doc NFC, camera QR, middleware POS |
| A7 | Tru so lan su dung khi quet the | BoughtCardService (quota management) | **ADAPT** | Co theo doi quota the dich vu. Can them: tru tu dong khi quet, canh bao het luot, thong bao real-time |
| A8 | Canh bao het luot/het han | NotificationService | **ADAPT** | Co FCM notification. Can them: rule canh bao tu dong (con 3 luot, sap het han 7 ngay...) |
| A9 | Ho so thanh vien 360 do | DetailPerson, CustomerAnalysisPage | **ADAPT** | Co ho so KH day du. Can them: lich su check-in, dich vu da dung, diem tich luy, gia dinh lien ket |
| A10 | Tuyen thanh vien moi (Referral/Sponsor) | — | **NEW** | Chua co he thong referral. Can: ma gioi thieu, theo doi cay gioi thieu, tinh hoa hong/diem |

---

#### B. AN UONG & KHONG GIAN SINH HOAT (F&B & CO-WORKING)

| # | Chuc nang yeu cau | Module Reborn Retail | Trang thai | Chi tiet GAP |
|---|-------------------|---------------------|:----------:|--------------|
| B1 | Ban hang F&B tai quay (POS) | CounterSales | **REUSE** | Day du: gio hang, thanh toan, in hoa don, khuyen mai |
| B2 | Menu do uong/do an | ProductService, SettingSell | **REUSE** | Co quan ly san pham, danh muc, gia |
| B3 | Tru do uong mien phi (trong goi) | BoughtCardService | **ADAPT** | Co the dich vu voi quota. Can them: logic tru tu dong theo goi thanh vien, gioi han/ngay |
| B4 | Quan ly khong gian lam viec | — | **NEW** | Chua co. Can: so do mat bang, trang thai cho ngoi, dat cho, check-in/out cho |
| B5 | Dat cho/phong hop | ScheduleCommonService | **ADAPT** | Co lich hen. Can them: loai tai nguyen (phong hop, ban, pod), khe gio, so do truc quan |
| B6 | Quan ly kho nguyen lieu F&B | InventoryService, WarehouseService | **REUSE** | Day du: nhap/xuat kho, chuyen kho, kiem ke, bao cao ton kho |
| B7 | Bao cao doanh thu F&B | ReportService, DashboardRetail | **REUSE** | Co bao cao doanh thu theo san pham, nhan vien, thoi gian |

---

#### C. LUU TRU (ACCOMMODATION)

| # | Chuc nang yeu cau | Module Reborn Retail | Trang thai | Chi tiet GAP |
|---|-------------------|---------------------|:----------:|--------------|
| C1 | Quan ly phong tap the (nam/nu) | CHAccommodationPage | **ADAPT** | Co quan ly phong co ban. Can them: phan loai nam/nu, giuong/slot, trang thai tung giuong |
| C2 | Check-in/out phong | CHCheckinPage | **ADAPT** | Co check-in. Can them: gan phong/giuong cu the, thoi gian o, lich su |
| C3 | Tinh phi luu tru theo thang | — | **NEW** | Can: logic tinh phi theo goi hoac pay-per-night, tich hop recurring billing |
| C4 | Theo doi cong suat phong | CHReportCheckin | **ADAPT** | Co bao cao check-in. Can them: dashboard cong suat real-time, du bao |
| C5 | Quy dinh noi quy luu tru | — | **NEW** | Can: module noi quy dien tu, xac nhan dong y, vi pham & xu phat |

---

#### D. SUC KHOE & SAC DEP (HEALTH & BEAUTY)

| # | Chuc nang yeu cau | Module Reborn Retail | Trang thai | Chi tiet GAP |
|---|-------------------|---------------------|:----------:|--------------|
| D1 | Danh muc dich vu spa/gym/yoga | ServiceService, CHServiceManagement | **ADAPT** | Co quan ly dich vu. Can them: phan loai theo linh vuc, lich trinh, HLV/chuyen vien |
| D2 | Dat lich dich vu | CHServiceBookingPage, ScheduleTreatmentService | **ADAPT** | Co dat lich. Can them: chon HLV, chon phong, xac nhan tu dong, nhac lich |
| D3 | Theo doi lieu trinh | TreatmentHistoryService | **REUSE** | Co lich su lieu trinh day du |
| D4 | Quan ly phong dich vu (spa, gym, yoga) | TreatmentRoomService | **ADAPT** | Co quan ly phong. Can them: lich su dung phong, bao tri, so do |
| D5 | Tru luot dich vu trong goi | BoughtCardService, BoughtServiceService | **ADAPT** | Co quota. Can them: tru tu dong khi check-in phong, canh bao real-time |
| D6 | Doi tac cung cap dich vu (tenant spa, gym) | CHPartnersPage, PartnerService | **ADAPT** | Co quan ly doi tac. Can them: hop dong chia se doanh thu, bao cao doi tac, thanh toan |
| D7 | Danh gia chat luong dich vu | CHFeedbackPage, RateCustomerService | **ADAPT** | Co danh gia/feedback. Can them: rating theo dich vu cu the, theo nhan vien |

---

#### E. KHOA HOC & CLB (COURSES & CLUBS)

| # | Chuc nang yeu cau | Module Reborn Retail | Trang thai | Chi tiet GAP |
|---|-------------------|---------------------|:----------:|--------------|
| E1 | Danh muc khoa hoc (mien phi & tra phi) | CHCoursesPage | **ADAPT** | Co module khoa hoc co ban. Can them: phan loai mien phi/tra phi, noi dung online, lich hoc |
| E2 | Dang ky khoa hoc | — | **NEW** | Can: form dang ky, gioi han so luong, danh sach cho, thanh toan phi |
| E3 | Quan ly CLB sinh hoat | — | **NEW** | Can: tao CLB, quan ly thanh vien CLB, lich sinh hoat, leader CLB, tin tuc CLB |
| E4 | KOL/KOC tao noi dung & khoa hoc | — | **NEW** | Can: workflow de xuat khoa hoc → duyet → mo lop, chia se doanh thu, ho so KOL |
| E5 | Diem danh khoa hoc/CLB | — | **NEW** | Can: check-in theo buoi, thong ke tham du, chung chi hoan thanh |
| E6 | Danh gia khoa hoc | CxmSurveyService | **ADAPT** | Co khao sat. Can them: template danh gia khoa hoc, rating, nhan xet |

---

#### F. KET NOI CONG DONG (COMMUNITY CONNECTION)

| # | Chuc nang yeu cau | Module Reborn Retail | Trang thai | Chi tiet GAP |
|---|-------------------|---------------------|:----------:|--------------|
| F1 | Ket noi co hoi viec lam | — | **NEW** | Can: bang tin viec lam, dang tin, ung tuyen, loc theo ky nang |
| F2 | Ho tro khoi nghiep | — | **NEW** | Can: dang du an, tim co-founder, mentor matching, pitch deck |
| F3 | Tim kiem nhan luc chat luong | — | **NEW** | Can: ho so ky nang thanh vien, search/filter, gioi thieu |
| F4 | Leader/KOL system | — | **NEW** | Can: cap bac leader, thanh tich, anh huong, thuong/hoa hong |
| F5 | Bang tin cong dong (newsfeed) | — | **NEW** | Can: dang bai, binh luan, thich, chia se, quan tri noi dung |
| F6 | Su kien cong dong | ScheduleCommonService | **ADAPT** | Co lich. Can them: tao su kien, dang ky tham du, check-in su kien, bao cao |

---

#### G. TAI CHINH & THANH TOAN

| # | Chuc nang yeu cau | Module Reborn Retail | Trang thai | Chi tiet GAP |
|---|-------------------|---------------------|:----------:|--------------|
| G1 | Thu phi thanh vien dinh ky | — | **NEW** | Can: recurring billing engine, auto charge, nhac no, gia han/huy |
| G2 | Thanh toan tai quay (POS) | CounterSales, PaymentMethodService | **REUSE** | Day du |
| G3 | Vi dien tu thanh vien | LoyaltyWallet | **ADAPT** | Co vi diem. Can them: nap tien, thanh toan bang vi, lich su giao dich |
| G4 | Hoa hong referral | — | **NEW** | Can: tinh hoa hong, chi tra, bao cao hoa hong, thue (neu co) |
| G5 | Chia se doanh thu voi doi tac/KOL | — | **NEW** | Can: cau hinh ty le chia se, doi soat, thanh toan doi tac |
| G6 | Bao cao tai chinh | FinanceDashboard, CashbookService | **ADAPT** | Co bao cao. Can them: bao cao theo linh vuc (F&B, luu tru, khoa hoc), doi soat doi tac |
| G7 | Quan ly cong no | DebtManagementService | **REUSE** | Day du: cong no phai thu/tra, nhac no, QR thanh toan |

---

#### H. BAO CAO & PHAN TICH

| # | Chuc nang yeu cau | Module Reborn Retail | Trang thai | Chi tiet GAP |
|---|-------------------|---------------------|:----------:|--------------|
| H1 | Dashboard tong quan Community Hub | DashboardCH | **ADAPT** | Co dashboard co ban. Can them: KPI cong dong, hoat dong hom nay, canh bao |
| H2 | Bao cao thanh vien | CHReportMembers | **ADAPT** | Co bao cao. Can them: tang truong, retention rate, churn, referral |
| H3 | Bao cao doanh thu theo linh vuc | CHReportRevenue, CHReportFinance | **ADAPT** | Co. Can them: breakdown 4 linh vuc, so sanh, xu huong |
| H4 | Bao cao su dung dich vu | CHReportServices | **ADAPT** | Co. Can them: top dich vu, gio cao diem, cong suat, du bao |
| H5 | Bao cao doi tac | CHReportPartners | **ADAPT** | Co. Can them: doanh thu doi tac, hoa hong, rating |
| H6 | Bao cao KOL/Leader | — | **NEW** | Can: thanh tich KOL, khoa hoc da tao, hoc vien, doanh thu |

---

#### I. MODULES BO DI (REMOVE) — KHONG CAN CHO COMMUNITY HUB

| # | Module Reborn Retail | Ly do bo |
|---|---------------------|----------|
| I1 | Warehouse phuc tap (nhieu kho, chuyen kho) | Chi can 1 kho nho cho F&B, khong can multi-warehouse |
| I2 | Shipping / Van chuyen | Dich vu tai cho, khong giao hang |
| I3 | VAT Invoice phuc tap | Don gian hoa, chi can hoa don co ban |
| I4 | Multi-channel Sales (Lazada, Shopee...) | Ban truc tiep tai toa nha |
| I5 | Contract Management phuc tap | Thay bang hop dong thanh vien don gian |
| I6 | Social CRM (Facebook, Zalo OA) | Uu tien thap, co the them sau |
| I7 | Email/SMS Marketing mass | Thay bang thong bao trong app |
| I8 | Call Center / VoIP | Khong can cho mo hinh nay |
| I9 | Supplier/Purchase Order phuc tap | Don gian hoa cho F&B |
| I10 | Manufacturing/Material BOM | Khong ap dung |

---

### 4.3. TONG HOP GAP

```
+------------------------------------------------------------------+
|                    TONG HOP TRANG THAI                             |
+------------------------------------------------------------------+
|                                                                    |
|   REUSE (Tai su dung truc tiep)              12 chuc nang (18%)   |
|   ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░                       |
|                                                                    |
|   ADAPT (Can dieu chinh/mo rong)             28 chuc nang (42%)   |
|   ████████████████████████████░░░░░░░░░░░░                        |
|                                                                    |
|   NEW (Can phat trien moi)                   22 chuc nang (33%)   |
|   ██████████████████████░░░░░░░░░░░░░░░░░░                        |
|                                                                    |
|   REMOVE (Bo di)                             10 module    (—)     |
|   ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                       |
|                                                                    |
|   => ~60% codebase co the tai su dung/dieu chinh                  |
|   => ~33% can phat trien moi                                      |
+------------------------------------------------------------------+
```

---

## 5. CHI TIET CAC MODULE MOI (GAP)

### 5.1. MODULE: Recurring Billing (Phi dinh ky)

**Do uu tien:** CRITICAL
**Lien quan:** A3, C3, G1

**Mo ta:** He thong thu phi thanh vien tu dong hang thang, ho tro nhieu goi, gia han, nhac phi.

**Chuc nang chi tiet:**

| # | Chuc nang | Mo ta |
|---|-----------|-------|
| 1 | Tao goi thanh vien | Dinh nghia goi (ten, gia, quyen loi, thoi han, so luot dich vu) |
| 2 | Dang ky goi | Thanh vien chon goi, thanh toan lan dau, kich hoat |
| 3 | Tu dong gia han | Cron job kiem tra het han, gui nhac phi truoc 7 ngay, 3 ngay, 1 ngay |
| 4 | Xu ly thanh toan | Tru vi, chuyen khoan, tien mat tai quay |
| 5 | Tam dung / Huy goi | Freeze goi (giu quyen loi, dung tinh phi), huy vinh vien |
| 6 | Nang/Ha cap goi | Chuyen doi giua cac goi, tinh chenh lech phi |
| 7 | Lich su giao dich | Log moi giao dich phi thanh vien |
| 8 | Bao cao doanh thu dinh ky | Doanh thu theo thang, ty le gia han, ty le huy |

**Entities moi:**
```
MembershipSubscription {
  id, memberId, planId, status (active/paused/cancelled/expired)
  startDate, endDate, nextBillingDate
  paymentMethod, autoRenew
  familyMembers: MemberLink[]
}

BillingTransaction {
  id, subscriptionId, amount, type (charge/refund/upgrade)
  status (pending/paid/failed), paidAt, invoiceId
}
```

---

### 5.2. MODULE: Chia se gia dinh (Family Sharing)

**Do uu tien:** HIGH
**Lien quan:** A4

**Chuc nang chi tiet:**

| # | Chuc nang | Mo ta |
|---|-----------|-------|
| 1 | Lien ket thanh vien gia dinh | Thanh vien chinh moi nguoi than, xac nhan 2 chieu |
| 2 | Chia se quyen loi | Quota dich vu duoc chia (vd: 10 luot gym / gia dinh) |
| 3 | Theo doi su dung rieng | Moi nguoi co log su dung rieng, tong hop cho chu goi |
| 4 | Gioi han so luong | Toi da 2-4 thanh vien gia dinh tuy goi |
| 5 | The rieng cho tung nguoi | Moi nguoi co the/QR rieng de check-in |

---

### 5.3. MODULE: Xac thuc vat ly (Physical Authentication)

**Do uu tien:** CRITICAL
**Lien quan:** A6, A7

**Chuc nang chi tiet:**

| # | Chuc nang | Mo ta |
|---|-----------|-------|
| 1 | Doc the NFC/Chip | API nhan du lieu tu dau doc NFC, mapping voi memberId |
| 2 | Quet QR Code | Camera/scanner doc QR tren the hoac app thanh vien |
| 3 | Quet Barcode | Doc barcode tren the vat ly |
| 4 | Xac thuc & phan quyen | Kiem tra trang thai thanh vien, goi con hieu luc, quota con lai |
| 5 | Tru luot tu dong | Khi quet the tai dich vu → tru 1 luot → hien thi so luot con lai |
| 6 | Canh bao real-time | Toast/popup: "Con 2 luot gym", "The het han sau 5 ngay", "Het luot massage" |
| 7 | Log xac thuc | Ghi nhan moi lan quet the (thoi gian, dia diem, dich vu, ket qua) |

**Luong xu ly:**
```
Quet the → Doc chip/QR/barcode
  → Tra cuu memberId
    → Kiem tra subscription (con hieu luc?)
      → Kiem tra quota dich vu (con luot?)
        → OK: Tru luot + Hien thi "Chao [Ten]. Con X luot."
        → FAIL: Hien thi "Het luot" hoac "The het han"
  → Ghi log
  → Gui notification (neu can canh bao)
```

---

### 5.4. MODULE: Referral / Sponsor System

**Do uu tien:** HIGH
**Lien quan:** A10, G4

**Chuc nang chi tiet:**

| # | Chuc nang | Mo ta |
|---|-----------|-------|
| 1 | Ma gioi thieu ca nhan | Moi thanh vien co ma duy nhat (VD: REF-NGUYENVANA) |
| 2 | Theo doi cay gioi thieu | Ai gioi thieu ai, bao nhieu cap (1 cap hoac multi-level) |
| 3 | Tinh diem/hoa hong | Khi nguoi duoc gioi thieu dang ky thanh cong → X diem/tien cho nguoi gioi thieu |
| 4 | Dashboard referral | So nguoi da gioi thieu, tong diem/hoa hong, trang thai |
| 5 | Chi tra hoa hong | Tu dong hoac thu cong, tich hop tai chinh |
| 6 | Chinh sach referral | Admin cau hinh: diem/hoa hong/cap, dieu kien (phai duy tri 1 thang...) |

---

### 5.5. MODULE: KOL/KOC Leader System

**Do uu tien:** MEDIUM
**Lien quan:** E4, F4, H6

**Chuc nang chi tiet:**

| # | Chuc nang | Mo ta |
|---|-----------|-------|
| 1 | Ho so Leader/KOL | Tieu su, linh vuc chuyen mon, thanh tich, rating |
| 2 | De xuat khoa hoc | Leader tao de xuat → Admin duyet → Mo lop |
| 3 | Quan ly lop hoc | Danh sach hoc vien, diem danh, tai lieu, bai tap |
| 4 | Chia se doanh thu | Cau hinh ty le (VD: 70% Leader - 30% Platform) |
| 5 | Cap bac Leader | Rookie → Contributor → Expert → Master (dua tren thanh tich) |
| 6 | Dashboard Leader | Khoa hoc da tao, hoc vien, doanh thu, danh gia |

---

### 5.6. MODULE: Quan ly CLB (Club Management)

**Do uu tien:** MEDIUM
**Lien quan:** E3

**Chuc nang chi tiet:**

| # | Chuc nang | Mo ta |
|---|-----------|-------|
| 1 | Tao CLB | Ten, mo ta, linh vuc, lich sinh hoat, leader |
| 2 | Dang ky tham gia CLB | Thanh vien dang ky, admin/leader duyet |
| 3 | Lich sinh hoat | Lap lich dinh ky (hang tuan/thang), thong bao |
| 4 | Diem danh sinh hoat | Check-in moi buoi, tich diem |
| 5 | Tin tuc CLB | Dang bai, thong bao noi bo CLB |

---

### 5.7. MODULE: Khong gian lam viec (Co-working Space)

**Do uu tien:** HIGH
**Lien quan:** B4, B5

**Chuc nang chi tiet:**

| # | Chuc nang | Mo ta |
|---|-----------|-------|
| 1 | So do mat bang | Hien thi truc quan vi tri ban/phong, trang thai (trong/dang dung) |
| 2 | Check-in cho ngoi | Quet the tai khu vuc → gan cho |
| 3 | Dat phong hop | Chon phong, khe gio, so nguoi, thiet bi ho tro |
| 4 | Theo doi su dung | Thoi gian su dung, thong ke gio cao diem |
| 5 | Canh bao qua tai | Thong bao khi gan het cho |

---

### 5.8. MODULE: Bang tin cong dong (Community Board)

**Do uu tien:** LOW (Phase 3)
**Lien quan:** F1, F2, F3, F5

**Chuc nang chi tiet:**

| # | Chuc nang | Mo ta |
|---|-----------|-------|
| 1 | Bang tin viec lam | Dang tin tuyen dung, ung tuyen, lien he |
| 2 | Du an khoi nghiep | Dang du an, tim co-founder, mentor |
| 3 | Ho so ky nang | Thanh vien tu tao ho so, ky nang, kinh nghiem |
| 4 | Newsfeed | Dang bai, binh luan, tuong tac cong dong |
| 5 | Su kien | Tao su kien, dang ky, check-in, bao cao |

---

## 6. LO TRINH TRIEN KHAI

### 6.1. TONG QUAN TIMELINE

```
Thang:  1     2     3     4     5     6     7     8     9
        |-----|-----|-----|-----|-----|-----|-----|-----|
        
Phase 0 |████|
        Setup & Cleanup
        
Phase 1       |█████████████|
              Core Platform (MVP)
              
Phase 2                     |█████████████|
                            Mo rong dich vu
                            
Phase 3                                   |█████████████|
                                          Cong dong & Toi uu
                                          
Go-live        *MVP          *Full         *Complete
               T3            T6            T9
```

---

### 6.2. PHASE 0 — SETUP & CLEANUP (Thang 1 — 4 tuan)

**Muc tieu:** Chuan bi codebase, loai bo module khong can, thiet lap moi truong.

| Tuan | Cong viec | Output |
|------|-----------|--------|
| 1 | Tao nhanh `community-hub` tu Reborn Retail | Branch san sang |
| 1 | Loai bo 10 module REMOVE (Shipping, VAT phuc tap, Multi-channel, Call Center...) | Codebase gon hon |
| 2 | Cau hinh TenantConfig cho Community Hub | Toggle bat/tat tinh nang |
| 2 | Setup moi truong dev/staging | Server + CI/CD co ban |
| 3 | Thiet ke database schema cho cac entity moi | ERD document |
| 3 | Thiet ke API contracts cho module moi | API spec (OpenAPI) |
| 4 | Setup tich hop phan cung (dau doc NFC, may quet QR) | Hardware PoC |
| 4 | UI/UX wireframe cho cac man hinh moi | Figma/wireframe |

**Nhan su:** 1 Tech Lead + 1 Backend + 1 Frontend

---

### 6.3. PHASE 1 — CORE PLATFORM / MVP (Thang 2-3 — 8 tuan)

**Muc tieu:** Ra mat phien ban dau tien co the van hanh co ban.

**Sprint 1-2 (Tuan 1-4): Thanh vien & Xac thuc**

| # | Task | Do uu tien | Estimate |
|---|------|-----------|----------|
| 1 | Adapt module Membership (phan hang, goi dich vu) | CRITICAL | 5 ngay |
| 2 | Phat trien Recurring Billing engine | CRITICAL | 8 ngay |
| 3 | Phat trien module Xac thuc vat ly (NFC/QR/Barcode) | CRITICAL | 8 ngay |
| 4 | Adapt CardService cho tru luot tu dong + canh bao | CRITICAL | 5 ngay |
| 5 | Tich hop POS voi he thong xac thuc | CRITICAL | 3 ngay |
| 6 | The thanh vien (in the, gan chip, QR) | HIGH | 3 ngay |

**Sprint 3-4 (Tuan 5-8): Dich vu & Van hanh**

| # | Task | Do uu tien | Estimate |
|---|------|-----------|----------|
| 7 | Adapt Check-in system (gan phong/giuong) | HIGH | 3 ngay |
| 8 | Adapt Accommodation (phong tap the nam/nu) | HIGH | 5 ngay |
| 9 | Adapt Service Booking (dat lich spa/gym) | HIGH | 3 ngay |
| 10 | Adapt F&B POS (tru do uong trong goi) | HIGH | 3 ngay |
| 11 | Adapt Dashboard Community Hub | HIGH | 5 ngay |
| 12 | Adapt Bao cao (thanh vien, doanh thu, check-in) | HIGH | 5 ngay |
| 13 | Testing & bug fix MVP | CRITICAL | 5 ngay |
| 14 | Training nhan vien van hanh | HIGH | 3 ngay |

**Output Phase 1 (MVP):**
- Dang ky thanh vien, phan hang, thu phi hang thang
- Quet the NFC/QR check-in, tru luot dich vu
- Ban hang F&B tai POS, tru do uong trong goi
- Dat phong luu tru, dat lich dich vu
- Dashboard & bao cao co ban

**Nhan su:** 1 Tech Lead + 2 Backend + 2 Frontend + 1 QA

---

### 6.4. PHASE 2 — MO RONG DICH VU (Thang 4-6 — 12 tuan)

**Sprint 5-6 (Tuan 1-4): Gia dinh & Referral**

| # | Task | Estimate |
|---|------|----------|
| 1 | Phat trien Family Sharing module | 8 ngay |
| 2 | Phat trien Referral/Sponsor system | 8 ngay |
| 3 | Adapt Loyalty tich diem theo hanh dong | 5 ngay |
| 4 | Adapt Vi dien tu thanh vien | 3 ngay |

**Sprint 7-8 (Tuan 5-8): Khoa hoc & CLB**

| # | Task | Estimate |
|---|------|----------|
| 5 | Phat trien Dang ky khoa hoc (mien phi & tra phi) | 8 ngay |
| 6 | Phat trien CLB Management | 8 ngay |
| 7 | Phat trien diem danh khoa hoc/CLB | 3 ngay |
| 8 | Adapt Feedback/Survey cho khoa hoc | 3 ngay |

**Sprint 9-10 (Tuan 9-12): Doi tac & Tai chinh**

| # | Task | Estimate |
|---|------|----------|
| 9 | Phat trien chia se doanh thu doi tac | 5 ngay |
| 10 | Phat trien hoa hong referral (chi tra) | 5 ngay |
| 11 | Adapt bao cao tai chinh theo linh vuc | 5 ngay |
| 12 | Phat trien Co-working Space (so do, dat cho) | 8 ngay |
| 13 | Testing toan dien & UAT | 8 ngay |

**Output Phase 2:**
- Chia se goi gia dinh
- He thong referral va hoa hong
- Khoa hoc mien phi & tra phi
- CLB sinh hoat
- Chia se doanh thu doi tac
- Co-working space management

**Nhan su:** 1 Tech Lead + 2 Backend + 2 Frontend + 1 QA

---

### 6.5. PHASE 3 — CONG DONG & TOI UU (Thang 7-9 — 12 tuan)

**Sprint 11-12: KOL/Leader System**

| # | Task | Estimate |
|---|------|----------|
| 1 | Phat trien KOL/KOC Leader System | 10 ngay |
| 2 | Phat trien workflow de xuat khoa hoc | 5 ngay |
| 3 | Dashboard Leader/KOL | 5 ngay |

**Sprint 13-14: Ket noi cong dong**

| # | Task | Estimate |
|---|------|----------|
| 4 | Phat trien Bang tin viec lam | 8 ngay |
| 5 | Phat trien Ho so ky nang thanh vien | 5 ngay |
| 6 | Phat trien Su kien cong dong | 5 ngay |
| 7 | Newsfeed cong dong (co ban) | 8 ngay |

**Sprint 15-16: Toi uu & Hoan thien**

| # | Task | Estimate |
|---|------|----------|
| 8 | Toi uu hieu nang (React.memo, lazy loading, debounce) | 5 ngay |
| 9 | Bao mat (CSP, CSRF, HTTP-only cookie) | 5 ngay |
| 10 | Setup CI/CD pipeline hoan chinh | 3 ngay |
| 11 | Setup Sentry error tracking | 2 ngay |
| 12 | Testing toan dien, load test | 8 ngay |
| 13 | Documentation & training | 5 ngay |

**Output Phase 3:**
- He thong KOL/Leader day du
- Bang tin viec lam, ket noi cong dong
- Su kien cong dong
- He thong toi uu, bao mat, on dinh

**Nhan su:** 1 Tech Lead + 2 Backend + 2 Frontend + 1 QA

---

### 6.6. MILESTONES

| Milestone | Thoi diem | Tieu chi hoan thanh |
|-----------|-----------|---------------------|
| **M0: Setup** | Cuoi thang 1 | Branch san sang, schema thiet ke xong, PoC phan cung |
| **M1: MVP** | Cuoi thang 3 | 200 thanh vien co the dang ky, check-in, su dung dich vu, thanh toan |
| **M2: Full** | Cuoi thang 6 | Gia dinh, referral, khoa hoc, CLB, co-working hoat dong |
| **M3: Complete** | Cuoi thang 9 | KOL system, cong dong, toi uu, bao mat, san sang scale |

---

## 7. CHI PHI DAU TU

### 7.1. Chi phi phat trien phan mem

| Hang muc | So luong | Don gia/thang (VND) | Thoi gian | Thanh tien (VND) |
|----------|:--------:|--------------------:|:---------:|----------------:|
| Tech Lead / Architect | 1 | 45,000,000 | 9 thang | 405,000,000 |
| Backend Developer (Senior) | 2 | 35,000,000 | 8 thang | 560,000,000 |
| Frontend Developer (Senior) | 2 | 32,000,000 | 8 thang | 512,000,000 |
| QA Engineer | 1 | 22,000,000 | 6 thang | 132,000,000 |
| UI/UX Designer | 1 | 25,000,000 | 3 thang | 75,000,000 |
| **Tong phan mem** | | | | **1,684,000,000** |

> **Ghi chu:** Neu su dung team in-house da co, chi phi thuc te se thap hon dang ke (chi tinh overhead + co hoi cost). Du toan tren la truong hop thue ngoai/outsource.

### 7.2. Chi phi phan cung & Thiet bi

| Hang muc | So luong | Don gia (VND) | Thanh tien (VND) |
|----------|:--------:|-------------:|----------------:|
| May POS (touch screen + may in) | 2 | 15,000,000 | 30,000,000 |
| Dau doc NFC/Chip (USB HID) | 3 | 2,000,000 | 6,000,000 |
| May quet QR/Barcode | 3 | 1,500,000 | 4,500,000 |
| The NFC thanh vien (200 the) | 200 | 25,000 | 5,000,000 |
| May in the nhua (tuy chon) | 1 | 8,000,000 | 8,000,000 |
| **Tong phan cung** | | | **53,500,000** |

### 7.3. Chi phi ha tang & Van hanh

| Hang muc | Chi phi/thang (VND) | Chi phi/nam (VND) |
|----------|-------------------:|------------------:|
| Cloud Server (4 vCPU, 16GB RAM, 200GB SSD) | 3,500,000 | 42,000,000 |
| Database managed (PostgreSQL) | 2,000,000 | 24,000,000 |
| Redis Cache | 500,000 | 6,000,000 |
| Object Storage (MinIO/S3) | 500,000 | 6,000,000 |
| SSL Certificate | — | 500,000 |
| Domain | — | 500,000 |
| Firebase (Notification — Free tier) | 0 | 0 |
| **Tong ha tang/nam** | **6,500,000** | **79,000,000** |

### 7.4. Tong hop chi phi

| Hang muc | Chi phi (VND) | Ghi chu |
|----------|-------------:|---------|
| Phat trien phan mem | 1,684,000,000 | 1 lan (9 thang) |
| Phan cung & Thiet bi | 53,500,000 | 1 lan |
| Ha tang nam dau | 79,000,000 | Hang nam |
| Du phong (10%) | 181,650,000 | |
| **TONG DAU TU BAN DAU** | **1,998,150,000** | ~2 ty VND |

> **Phuong an toi uu chi phi:**
> - Neu su dung team in-house (da co luong): Chi phi phan mem giam con ~30% (chi phi co hoi + overtime)
> - Neu trien khai theo phase, MVP truoc: Chi phi Phase 0+1 khoang **~700 trieu VND**
> - Ha tang co the dung shared server voi Reborn Retail ban dau: Tiet kiem ~50% ha tang

### 7.5. Du kien doanh thu & Hoan von

| Chi so | Gia tri | Cach tinh |
|--------|---------|-----------|
| So thanh vien muc tieu | 200 | Yeu cau ban dau |
| Phi trung binh/thanh vien/thang | 2,000,000 VND | Trung binh cac goi |
| Doanh thu phi thanh vien/thang | 400,000,000 VND | 200 x 2,000,000 |
| Doanh thu dich vu them/thang (uoc) | 100,000,000 VND | F&B, khoa hoc, dich vu le |
| **Tong doanh thu/thang** | **500,000,000 VND** | |
| **Tong doanh thu/nam** | **6,000,000,000 VND** | |
| Chi phi van hanh (40%) | 2,400,000,000 VND | Nhan su, dien nuoc, nguyen lieu |
| **Loi nhuan gop/nam** | **3,600,000,000 VND** | |
| **Thoi gian hoan von phan mem** | **~7 thang** | 2 ty / (3.6 ty / 12 thang) |

> **Ghi chu:** Day la uoc tinh lac quan. Thuc te phu thuoc vao toc do tuyen thanh vien va chi phi van hanh cua toa nha.

---

## 8. RUI RO & GIAI PHAP

### 8.1. Rui ro ky thuat

| # | Rui ro | Muc do | Giai phap |
|---|--------|:------:|-----------|
| 1 | Tich hop phan cung (NFC, POS) gap van de tuong thich | CAO | PoC som (Phase 0), chon thiet bi co SDK/API tot, co phuong an du phong (QR thay NFC) |
| 2 | Performance khi scale (nhieu check-in dong thoi) | TRUNG BINH | Redis cache, database indexing, load testing tu Phase 1 |
| 3 | Codebase Reborn Retail qua lon, kho bao tri | CAO | Phase 0 cleanup ky, loai bo module REMOVE, refactor component lon |
| 4 | Khong co test tu dong | CAO | Setup Vitest + RTL tu Phase 0, viet test cho module moi |
| 5 | Bao mat (token localStorage, thieu CSP) | CAO | Chuyen HTTP-only cookie (Phase 3), them CSP headers |

### 8.2. Rui ro kinh doanh

| # | Rui ro | Muc do | Giai phap |
|---|--------|:------:|-----------|
| 1 | Khong du 200 thanh vien ban dau | CAO | MVP som (thang 3), marketing som, chuong trinh early-bird |
| 2 | Thanh vien huy sau 1-2 thang | TRUNG BINH | Tich diem, CLB, su kien, gia tri cong dong giu chan |
| 3 | Doi tac khong hop tac | TRUNG BINH | Mo hinh chia se doanh thu hap dan, ho tro marketing |
| 4 | Thay doi yeu cau lien tuc | CAO | Agile/Sprint 2 tuan, MVP → iterate, user feedback loop |

### 8.3. Rui ro van hanh

| # | Rui ro | Muc do | Giai phap |
|---|--------|:------:|-----------|
| 1 | Nhan vien chua quen he thong | TRUNG BINH | Training 2 tuan truoc go-live, tai lieu huong dan, support hotline |
| 2 | The/thiet bi hong | THAP | Du phong the, QR backup tren app, bao hanh thiet bi |
| 3 | Server down | THAP | Monitoring (Sentry), backup tu dong, SLA 99.5% |

---

## 9. PHU LUC

### 9.1. Bang doi chieu chuc nang Reborn Retail → Community Hub

| Module Reborn Retail | Trang thai | Module Community Hub |
|---------------------|:----------:|---------------------|
| CustomerService | ADAPT | MemberService |
| MembershipClass | ADAPT | MembershipPlanService |
| LoyaltyService | ADAPT | PointService |
| CardService | ADAPT | MemberCardService |
| CounterSales | REUSE | POS (F&B, dich vu) |
| ProductService | REUSE | Menu/Catalog (F&B) |
| InventoryService | REUSE (don gian) | Kho F&B |
| ServiceService | ADAPT | DichVuService (spa, gym, yoga) |
| ScheduleTreatment | ADAPT | BookingService |
| TreatmentHistory | REUSE | LichSuDichVu |
| CHAccommodation | ADAPT | PhongLuuTru |
| CHCheckin | ADAPT | CheckInService |
| CHCourses | ADAPT | KhoaHocService |
| CHPartners | ADAPT | DoiTacService |
| CHFeedback | ADAPT | PhanHoiService |
| CHReport* (6 loai) | ADAPT | BaoCaoService |
| CashbookService | REUSE | SoCaiTienMat |
| DebtManagement | REUSE | CongNo |
| PaymentMethod | REUSE | PhuongThucThanhToan |
| NotificationService | ADAPT | ThongBaoService |
| EmployeeService | REUSE | NhanVienService |
| ShiftService | REUSE | CaLamViec |
| TimekeepingService | REUSE | ChamCong |
| DashboardCH | ADAPT | DashboardCongDong |
| CxmSurvey | ADAPT | KhaoSatService |
| BPM (workflow) | REUSE | QuyTrinh (duyet khoa hoc, xu ly khieu nai) |
| — | **NEW** | RecurringBillingService |
| — | **NEW** | FamilySharingService |
| — | **NEW** | PhysicalAuthService |
| — | **NEW** | ReferralService |
| — | **NEW** | KOLLeaderService |
| — | **NEW** | ClubManagementService |
| — | **NEW** | CoWorkingSpaceService |
| — | **NEW** | CommunityBoardService |
| Shipping | REMOVE | — |
| MultiChannelSales | REMOVE | — |
| CallCenter | REMOVE | — |
| SocialCRM | REMOVE | — |
| ContractService (phuc tap) | REMOVE | — |
| SupplierService (phuc tap) | REMOVE | — |

### 9.2. Tech Stack tong hop

| Layer | Cong nghe | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 18.3 + 4.5 |
| Build | Vite | 7.x |
| UI Grid | AG Grid | 30.x |
| Charts | Highcharts | 9.x |
| Calendar | React Big Calendar (date-fns) | 1.x |
| Editor | Slate.js | 0.x |
| Workflow | BPMN.js | — |
| QR Code | QRCode.react | — |
| State | React Context + React Query (moi) | — |
| API | Fetch + fetch-intercept | — |
| Auth | JWT + NFC/QR | — |
| Notification | Firebase FCM | 9.x |
| i18n | i18next | — |
| Styling | SCSS + CSS Variables | — |

### 9.3. Doi ngu de xuat

| Vai tro | So luong | Thoi gian | Ghi chu |
|---------|:--------:|:---------:|---------|
| Product Owner | 1 | Full-time | Dinh huong san pham, uu tien backlog |
| Tech Lead / Architect | 1 | 9 thang | Thiet ke kien truc, code review, mentoring |
| Senior Backend Dev | 2 | 8 thang | API, database, business logic |
| Senior Frontend Dev | 2 | 8 thang | UI/UX implementation, tich hop POS |
| QA Engineer | 1 | 6 thang | Test plan, automation test, UAT |
| UI/UX Designer | 1 | 3 thang | Wireframe, UI design, user research |
| DevOps (ban thoi gian) | 1 | 3 thang | CI/CD, server, monitoring |

---

*Tai lieu nay duoc tao dua tren phan tich codebase Reborn Retail (nhanh community-hub) va yeu cau nghiep vu moi.*
*Moi thong tin chi phi la uoc tinh, can duoc xac nhan lai khi trien khai thuc te.*

*— Reborn Team, 2026-04-10*
