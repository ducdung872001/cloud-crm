# DE XUAT GIAI PHAP — REBORN B2B CRM

**Nganh:** Cong nghe / Dich vu IT / Tu van / System Integration  
**Phien ban:** 1.0 &mdash; Thang 04/2026  
**Bao mat:** Noi bo &mdash; Reborn Technology JSC

---

## Muc luc

1. [Tom tat dieu hanh](#1-tom-tat-dieu-hanh)
2. [Bai toan nganh cong nghe](#2-bai-toan-nganh-cong-nghe)
3. [Giai phap tong quan](#3-giai-phap-tong-quan)
4. [Kien truc he thong](#4-kien-truc-he-thong)
5. [Chi tiet phan he](#5-chi-tiet-phan-he)
6. [Diem noi bat](#6-diem-noi-bat)
7. [Tich hop](#7-tich-hop)
8. [Lo trinh trien khai](#8-lo-trinh-trien-khai)
9. [SLA & Ho tro](#9-sla--ho-tro)
10. [Phu luc — Danh sach tinh nang](#10-phu-luc--danh-sach-tinh-nang)

---

## 1. Tom tat dieu hanh

**Reborn B2B CRM** la nen tang quan ly khach hang doanh nghiep toan dien, thiet ke rieng cho cac cong ty cong nghe, dich vu IT, tu van va system integration tai Viet Nam.

Nen tang tich hop tren **mot giao dien duy nhat** toan bo quy trinh kinh doanh: quan ly khach hang &rarr; pipeline ban hang &rarr; bao gia &rarr; hop dong &rarr; hoa don &rarr; du an &rarr; ho tro sau ban hang &rarr; gia han. Moi vai tro (CEO, Sales Manager, PM, Support Lead) deu co dashboard rieng voi du lieu thoi gian thuc.

**Mo hinh:** Multi-tenant SaaS, trien khai cloud hoac on-premise.

| Chi so muc tieu | Gia tri |
|---|---|
| Giam thoi gian lap bao gia | 70 % |
| Tang ty le chuyen doi pipeline | 25 % |
| Giam thoi gian xu ly ticket | 50 % |
| Bao cao tu dong thay the Excel | 100 % |

---

## 2. Bai toan nganh cong nghe

Cac cong ty cong nghe tai Viet Nam dang gap **6 van de chinh**:

### 2.1 Pipeline ban hang thu cong
- Theo doi co hoi tren Excel, Google Sheets — khong co canh bao, khong forecast.
- Sales khong biet deal nao can follow-up, manager khong co buc tranh tong the.

### 2.2 Thong tin khach hang rai rac
- Du lieu nam tren email, Zalo, file cong ty, dau moi ca nhan.
- Nhan vien nghi viec = mat du lieu khach hang.

### 2.3 Bao gia & Hop dong khong chuan hoa
- Moi sales tu soan bao gia rieng, khong co approval workflow.
- Hop dong khong track duoc lifecycle: ky &rarr; thuc hien &rarr; nghiem thu &rarr; bao hanh &rarr; gia han.

### 2.4 Ticket support khong track SLA
- Khach hang gui yeu cau qua nhieu kenh (email, Zalo, phone) — khong co he thong tap trung.
- Khong do duoc thoi gian xu ly, khong co escalation tu dong.

### 2.5 Khong co KPI team
- Khong do duoc hieu suat sales, PM, support tren cung 1 he thong.
- Thuong/phat dua tren cam tinh, khong co data.

### 2.6 Bao cao thu cong
- Cuoi thang/quy: tong hop tu nhieu nguon, sai sot, tre deadline.
- CEO khong co dashboard real-time.

---

## 3. Giai phap tong quan

Reborn B2B CRM la he thong **all-in-one** bao phu toan bo vong doi khach hang doanh nghiep:

```
Pipeline ──► Quote ──► Contract ──► Invoice ──► Project ──► Support ──► Renew
   │                                    │            │           │
   └── Forecast                         └── Cashbook └── KPI     └── SLA
```

### Nguyen tac thiet ke

| Nguyen tac | Mo ta |
|---|---|
| **B2B-first** | Moi entity thiet ke cho quan he doanh nghiep: Company → Contact → Opportunity → Contract |
| **1 Dashboard** | CEO, Sales Manager, PM, Support Lead — moi vai tro co view rieng |
| **Process-driven** | Moi nghiep vu chay tren BPM workflow co the tuy chinh |
| **API-first** | Toan bo chuc nang expose qua REST API, de tich hop |
| **Multi-tenant** | Mot instance phuc vu nhieu cong ty, cach ly du lieu tuyet doi |

---

## 4. Kien truc he thong

### 4.1 Tong quan kien truc

```
                        ┌─────────────────────┐
                        │   React SPA (Vite)   │
                        │   Ant Design Pro      │
                        └─────────┬───────────┘
                                  │ REST / WebSocket
                        ┌─────────▼───────────┐
                        │   API Gateway        │
                        │   (Spring Cloud GW)  │
                        └─────────┬───────────┘
              ┌──────────┬────────┼────────┬──────────┐
              ▼          ▼        ▼        ▼          ▼
         ┌────────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌────────┐
         │  CRM   │ │ Sales  │ │ HRM  │ │ BPM  │ │  ...   │
         │Service │ │Service │ │Svc   │ │Engine│ │(12 svc)│
         └───┬────┘ └───┬────┘ └──┬───┘ └──┬───┘ └───┬────┘
             │          │         │        │         │
             └──────────┴─────────┴────────┴─────────┘
                        │   PostgreSQL / Redis  │
                        │   MinIO / Kafka       │
                        └───────────────────────┘
```

### 4.2 Stack cong nghe

| Tang | Cong nghe |
|---|---|
| Frontend | React 18, Vite, Ant Design 5, TailwindCSS |
| Backend | Java 17, Spring Boot 3, Spring Cloud |
| BPM | Camunda 7 / Flowable (tich hop) |
| Database | PostgreSQL 15 (multi-schema tenant) |
| Cache | Redis 7 |
| Message Broker | Apache Kafka |
| Storage | MinIO (S3-compatible) |
| Auth | Keycloak (OAuth 2.0 / OIDC) |
| CI/CD | GitLab CI, Docker, Kubernetes |

### 4.3 Danh sach 12 Microservices

| # | Service | Chuc nang chinh |
|---|---|---|
| 1 | `cloud-auth` | Xac thuc, phan quyen, tenant management |
| 2 | `cloud-crm` | Khach hang, lien he, interaction history |
| 3 | `cloud-sales` | Pipeline, opportunity, forecast |
| 4 | `cloud-quote` | Bao gia, approval, PDF export |
| 5 | `cloud-contract` | Hop dong, lifecycle, eForm, bao hanh |
| 6 | `cloud-finance` | Hoa don, so quy, cong no, quy |
| 7 | `cloud-project` | Du an, task, KPI, timesheet |
| 8 | `cloud-ticket` | Ticket, SLA, knowledge base |
| 9 | `cloud-marketing` | Campaign, automation workflow |
| 10 | `cloud-bpm` | BPM engine, DMN, business rules |
| 11 | `cloud-report` | Bao cao, dashboard, data warehouse |
| 12 | `cloud-notify` | Email, SMS, Zalo, push notification |

---

## 5. Chi tiet phan he

### 5.1 Khach hang & Lien he

Quan ly ho so doanh nghiep (B2B company profile) va cac dau moi lien he.

| Tinh nang | Mo ta |
|---|---|
| Company Profile | Ten, MST, dia chi, nganh nghe, quy mo, website |
| Contact Persons | Nhieu lien he / cong ty, vai tro, quyen ra quyet dinh |
| Interaction History | Timeline toan bo tuong tac: email, cuoc goi, cuoc hop, note |
| Segmentation | Phan loai theo nganh, quy mo, khu vuc, nguon |
| Duplicate Detection | Tu dong phat hien khach trung lap theo MST, email, phone |

### 5.2 Pipeline Ban hang

Quan ly co hoi kinh doanh tu lead den closed-won.

| Tinh nang | Mo ta |
|---|---|
| Opportunity Board | Kanban board theo stages, keo tha de chuyen trang thai |
| Stages tuy chinh | Tu dinh nghia pipeline stages theo quy trinh cong ty |
| Probability & Forecast | Xac suat thang theo stage, forecast doanh thu theo thang/quy |
| Activity Tracking | Lich su hoat dong: email, call, meeting gan voi co hoi |
| Auto-assignment | Tu dong phan co hoi theo khu vuc, nganh, round-robin |
| Loss Reason | Phan tich ly do mat deal de cai thien quy trinh |

### 5.3 Bao gia

Tao bao gia chuyen nghiep, phe duyet nhanh.

| Tinh nang | Mo ta |
|---|---|
| Quote Builder | Keo tha san pham/dich vu, tu tinh tong, thue, chiet khau |
| Template Library | Thu vien mau bao gia theo loai dich vu |
| PDF Export | Xuat PDF co logo, chu ky dien tu |
| Approval Workflow | Phe duyet nhieu cap theo gia tri bao gia |
| Version Control | Luu toan bo phien ban bao gia, so sanh thay doi |
| Quote-to-Contract | Chuyen bao gia thanh hop dong 1 click |

### 5.4 Hop dong

Quan ly toan bo vong doi hop dong.

| Tinh nang | Mo ta |
|---|---|
| Contract Lifecycle | Trang thai: Draft → Review → Approved → Active → Completed → Renewed |
| eForm Builder | Thiet ke mau hop dong dong voi cac truong tu dong dien |
| Approval Workflow | Phe duyet nhieu cap: Sales → Manager → Director → Legal |
| Bao lanh & Bao hanh | Theo doi bao lanh thuc hien, bao hanh san pham/dich vu |
| Phu luc | Quan ly phu luc hop dong, lien ket voi hop dong goc |
| Renewal Alert | Canh bao truoc khi hop dong het han de gia han |

### 5.5 Du an & Cong viec

Quan ly du an giao cho khach hang.

| Tinh nang | Mo ta |
|---|---|
| Project Dashboard | Tong quan tien do, ngan sach, nhan luc theo du an |
| Task Management | Cay cong viec (WBS), gan nguoi, deadline, dependency |
| KPI & Timesheet | Do hieu suat nhan vien, cham cong theo du an |
| Gantt Chart | Bieu do Gantt tuong tac, tu dong tinh duong gang |
| Resource Planning | Phan bo nhan luc, canh bao qua tai |
| Client Portal | Khach hang theo doi tien do du an online |

### 5.6 Tai chinh

Quan ly hoa don, cong no, so quy.

| Tinh nang | Mo ta |
|---|---|
| Invoice Management | Tao hoa don tu hop dong, theo doi trang thai thanh toan |
| Cashbook | So thu/chi, doi soat ngan hang |
| Debt Management | Cong no phai thu/phai tra, aging report |
| Fund Management | Quan ly quy, phan bo ngan sach theo du an |
| Revenue Recognition | Ghi nhan doanh thu theo tien do du an |
| Tax Report | Bao cao thue GTGT, TNDN theo quy dinh Viet Nam |

### 5.7 Ticket & Support

He thong ho tro khach hang da kenh.

| Tinh nang | Mo ta |
|---|---|
| Multi-channel Intake | Nhan ticket tu email, Zalo, portal, phone — 1 noi xu ly |
| SLA Management | Dinh nghia SLA theo loai khach, loai ticket; canh bao vi pham |
| Auto Routing | Tu dong phan ticket theo ky nang, workload |
| Warranty Tracking | Lien ket ticket voi hop dong bao hanh, tu dong kiem tra |
| Knowledge Base | Co so tri thuc noi bo, goi y giai phap tu dong |
| Customer Satisfaction | Khao sat CSAT sau khi dong ticket |

### 5.8 Marketing Automation

Tu dong hoa tiep thi da kenh.

| Tinh nang | Mo ta |
|---|---|
| Campaign Management | Tao chien dich email, SMS, Zalo OA |
| Audience Segmentation | Phan nhom khach hang theo hanh vi, nganh, quy mo |
| Automation Workflow | Chuoi tu dong: gui email → doi 3 ngay → gui nhac → chuyen sales |
| Template Editor | Thiet ke email/SMS bang trinh keo tha |
| A/B Testing | Thu nghiem tieu de, noi dung de toi uu open rate |
| Analytics | Do luong: open rate, click rate, conversion, ROI |

### 5.9 BPM Engine

Dong co quy trinh nghiep vu tuy chinh.

| Tinh nang | Mo ta |
|---|---|
| Visual Process Designer | Thiet ke quy trinh bang BPMN 2.0 keo tha |
| Business Rules | Dinh nghia luat nghiep vu: phe duyet, phan quyen, tinh toan |
| DMN Decisions | Bang quyet dinh DMN cho logic phuc tap |
| Form Builder | Thiet ke form dong gan voi quy trinh |
| Task Assignment | Tu dong phan viec theo role, org chart |
| Audit Trail | Ghi log toan bo hanh dong trong quy trinh |

### 5.10 Bao cao & Dashboard

Bao cao tu dong, dashboard thoi gian thuc.

| Tinh nang | Mo ta |
|---|---|
| Executive Dashboard | Doanh thu, pipeline, KPI — tong quan cho CEO |
| Sales Report | Doanh so theo sales/team/khu vuc/san pham |
| Pipeline Report | Funnel, conversion rate, deal velocity |
| Customer Report | Phan tich khach hang: LTV, churn, growth |
| Team Performance | Bang xep hang nhan vien theo KPI |
| Custom Report | Tu tao bao cao voi drag-and-drop builder |
| Scheduled Export | Tu dong gui bao cao dinh ky qua email (PDF/Excel) |

---

## 6. Diem noi bat

### B2B-Native
Thiet ke tu dau cho quan he doanh nghiep: Company → Contact → Opportunity → Contract. Khong phai CRM B2C "do lai".

### BPM Engine Tich hop
Moi quy trinh (phe duyet bao gia, hop dong, ticket escalation) deu chay tren BPM — thay doi khong can code.

### Da kenh (Multi-channel)
Tiep nhan va tuong tac khach hang qua Email, Zalo OA, Facebook, VoIP — tap trung 1 giao dien.

### API-first
Toan bo chuc nang expose qua REST API co tai lieu Swagger — de tich hop voi he thong san co.

### Phan quyen Chi tiet (RBAC Granular)
Phan quyen theo vai tro, phong ban, du an, khach hang. Ho tro data-level permission (chi thay du lieu cua minh/team).

### Tuan thu Phap luat Viet Nam
Ho tro hoa don dien tu, bao cao thue, mau hop dong Viet Nam, ngon ngu Tieng Viet.

---

## 7. Tich hop

| He thong | Muc dich | Giao thuc |
|---|---|---|
| **Email (SMTP/IMAP)** | Gui/nhan email tu CRM, tu dong tao ticket tu email | SMTP, IMAP |
| **Zalo OA** | Gui thong bao, nhan tin, cham soc khach hang | Zalo OA API |
| **Facebook** | Tiep nhan lead tu Fanpage, Messenger | Facebook Graph API |
| **VoIP / SIP** | Tong dai IP: click-to-call, ghi am, call log | SIP, WebRTC |
| **Viettel eInvoice** | Phat hanh hoa don dien tu tu CRM | Viettel S-Invoice API |
| **Azure AD / SSO** | Dang nhap mot lan cho doanh nghiep dung Microsoft 365 | OIDC, SAML 2.0 |
| **Ngan hang** | Doc so du, doi soat giao dich | Bank API / File import |
| **Google Workspace** | Dong bo lich, email, contacts | Google API |

---

## 8. Lo trinh trien khai

### Tong quan: 3 phase trong 3-4 thang

```
Thang 1          Thang 2          Thang 3          Thang 4
├── Phase 1 ────►├── Phase 2 ─────►├── Phase 3 ─────►│ Go-live
│  CRM Core      │  Contract       │  Marketing      │
│  Pipeline       │  Finance       │  BPM Advanced   │
│  Quote         │  Project        │  Reports        │
│  Setup         │  Ticket         │  Optimization   │
```

### Phase 1 — CRM Core & Pipeline (Thang 1)

| Hang muc | Chi tiet |
|---|---|
| Khach hang & Lien he | Company, Contact, Interaction, Import du lieu cu |
| Pipeline Ban hang | Kanban, Stages, Forecast |
| Bao gia | Quote builder, PDF, Approval cap 1 |
| Thiet lap | Tenant setup, user/role, data migration |
| Training | Sales team, Admin |

**Ket qua:** Sales team bat dau lam viec tren CRM, khong con Excel.

### Phase 2 — Contract, Finance, Project, Ticket (Thang 2-3)

| Hang muc | Chi tiet |
|---|---|
| Hop dong | Lifecycle, eForm, Approval da cap |
| Tai chinh | Invoice, Cashbook, Debt |
| Du an | Task, KPI, Timesheet |
| Ticket | Multi-channel, SLA, Knowledge base |
| Tich hop | Email, Zalo OA, eInvoice |

**Ket qua:** Toan bo quy trinh tu ban hang den ho tro deu tren CRM.

### Phase 3 — Marketing, BPM, Reports (Thang 3-4)

| Hang muc | Chi tiet |
|---|---|
| Marketing | Campaign, Automation, Analytics |
| BPM | Custom workflows, DMN |
| Bao cao | Dashboard CEO, Custom reports, Scheduled export |
| Toi uu | Performance tuning, UX improvement |

**Ket qua:** He thong hoan chinh, tu dong hoa marketing va quy trinh.

---

## 9. SLA & Ho tro

### Cam ket Dich vu

| Hang muc | Cam ket |
|---|---|
| Uptime | 99.5 % (khong tinh bao tri dinh ky) |
| Response Time — Critical | 1 gio |
| Response Time — High | 4 gio |
| Response Time — Normal | 8 gio lam viec |
| Resolution Time — Critical | 8 gio |
| Backup | Tu dong hang ngay, luu tru 30 ngay |

### Dao tao

| Doi tuong | Noi dung | Thoi luong |
|---|---|---|
| Admin | Quan tri he thong, phan quyen, cau hinh | 8 gio |
| Sales Team | Pipeline, bao gia, khach hang | 4 gio |
| PM Team | Du an, task, timesheet | 4 gio |
| Support Team | Ticket, SLA, knowledge base | 4 gio |
| CEO/Manager | Dashboard, bao cao | 2 gio |

### Bao hanh & Bao tri

- Bao hanh phan mem: **12 thang** sau go-live.
- Trong thoi gian bao hanh: sua loi mien phi, cap nhat bao mat.
- Sau bao hanh: hop dong bao tri hang nam (tuy chon).

### Tai lieu

- Tai lieu huong dan su dung (Tieng Viet).
- Tai lieu ky thuat API (Swagger / OpenAPI).
- Video huong dan cho tung phan he.

---

## 10. Phu luc — Danh sach tinh nang

### A. Khach hang & Lien he (5 tinh nang)

| # | Tinh nang | Mo ta |
|---|---|---|
| 1 | Quan ly cong ty | CRUD cong ty, MST, nganh nghe, quy mo |
| 2 | Quan ly lien he | Nhieu lien he / cong ty, vai tro |
| 3 | Lich su tuong tac | Timeline email, call, meeting, note |
| 4 | Phan nhom khach hang | Tag, segment theo tieu chi |
| 5 | Phat hien trung lap | Tu dong theo MST, email, SĐT |

### B. Pipeline Ban hang (5 tinh nang)

| # | Tinh nang | Mo ta |
|---|---|---|
| 6 | Kanban Board | Keo tha co hoi giua cac stage |
| 7 | Pipeline tuy chinh | Tu dinh nghia stages, truong du lieu |
| 8 | Forecast | Du bao doanh thu theo xac suat |
| 9 | Activity Log | Ghi nhan moi hoat dong ban hang |
| 10 | Auto-assign | Phan co hoi tu dong theo rule |

### C. Bao gia (4 tinh nang)

| # | Tinh nang | Mo ta |
|---|---|---|
| 11 | Quote Builder | Keo tha san pham, tu dong tinh |
| 12 | Mau bao gia | Thu vien template theo loai dich vu |
| 13 | Xuat PDF | PDF chuyen nghiep co logo, chu ky |
| 14 | Phe duyet bao gia | Workflow phe duyet nhieu cap |

### D. Hop dong (5 tinh nang)

| # | Tinh nang | Mo ta |
|---|---|---|
| 15 | Vong doi hop dong | Draft → Active → Completed → Renewed |
| 16 | eForm hop dong | Mau dong tu dong dien thong tin |
| 17 | Phe duyet hop dong | Workflow da cap theo gia tri |
| 18 | Bao lanh / Bao hanh | Theo doi nghia vu bao lanh, bao hanh |
| 19 | Canh bao gia han | Thong bao truoc khi het han |

### E. Du an & Cong viec (5 tinh nang)

| # | Tinh nang | Mo ta |
|---|---|---|
| 20 | Dashboard du an | Tong quan tien do, ngan sach |
| 21 | Quan ly task | WBS, assignee, deadline, dependency |
| 22 | Timesheet | Cham cong theo du an/task |
| 23 | Gantt Chart | Bieu do tien do, duong gang |
| 24 | KPI nhan vien | Do hieu suat theo task, du an |

### F. Tai chinh (4 tinh nang)

| # | Tinh nang | Mo ta |
|---|---|---|
| 25 | Hoa don | Tao tu hop dong, theo doi thanh toan |
| 26 | So quy | Thu/chi, doi soat ngan hang |
| 27 | Cong no | Phai thu/phai tra, aging report |
| 28 | Quy / Ngan sach | Phan bo theo du an, phong ban |

### G. Ticket & Support (5 tinh nang)

| # | Tinh nang | Mo ta |
|---|---|---|
| 29 | Ticket da kenh | Email, Zalo, portal, phone |
| 30 | SLA | Dinh nghia, theo doi, canh bao |
| 31 | Auto-routing | Phan ticket theo ky nang, workload |
| 32 | Knowledge Base | Co so tri thuc, goi y tu dong |
| 33 | CSAT | Khao sat hai long sau xu ly |

### H. Marketing Automation (4 tinh nang)

| # | Tinh nang | Mo ta |
|---|---|---|
| 34 | Chien dich | Email, SMS, Zalo campaign |
| 35 | Automation | Chuoi hanh dong tu dong theo trigger |
| 36 | Phan nhom | Audience segmentation |
| 37 | Analytics | Open rate, click, conversion, ROI |

### I. BPM Engine (3 tinh nang)

| # | Tinh nang | Mo ta |
|---|---|---|
| 38 | Process Designer | BPMN 2.0 truc quan |
| 39 | Business Rules | Luat nghiep vu, DMN |
| 40 | Audit Trail | Log toan bo hanh dong |

### J. Bao cao & Dashboard (4 tinh nang)

| # | Tinh nang | Mo ta |
|---|---|---|
| 41 | Dashboard CEO | Tong quan doanh thu, pipeline, KPI |
| 42 | Bao cao ban hang | Theo sales, team, khu vuc |
| 43 | Bao cao khach hang | LTV, churn, growth |
| 44 | Custom Report | Tu tao bao cao keo tha |

### K. He thong (2 tinh nang)

| # | Tinh nang | Mo ta |
|---|---|---|
| 45 | RBAC | Phan quyen vai tro, data-level |
| 46 | Audit Log | Ghi log toan bo thay doi du lieu |

**Tong cong: 46 tinh nang**

---

*Tai lieu nay la tai san tri tue cua Reborn Technology JSC. Vui long khong chia se khi chua duoc su dong y.*
