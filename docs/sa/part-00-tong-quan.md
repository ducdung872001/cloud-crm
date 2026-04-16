# Part 00 — Tong quan

> Tai lieu nay mo ta muc dich, pham vi va doi tuong cua bo tai lieu System Architecture
> cho nhanh **reborn-tech** — nen tang CRM B2B danh cho doanh nghiep cong nghe/IT.

---

## 1. Muc dich tai lieu

Tai lieu System Architecture (SA) phuc vu cac muc dich:

1. **Lam ro thiet ke tong the** — giup tat ca thanh vien hieu cach he thong hoat dong
   tu frontend den backend, tu database den message queue.
2. **Huong dan implement** — developer biet module nao thuoc microservice nao,
   API contract ra sao, data flow di nhu the nao.
3. **Ho tro ra quyet dinh** — khi can thay doi kien truc, tai lieu nay la co so
   de danh gia tac dong (impact analysis).
4. **Onboarding** — thanh vien moi doc SA de nam he thong trong 1-2 ngay
   thay vi mat 2-3 tuan doc code.

---

## 2. Pham vi he thong

### 2.1. San pham

**Reborn CRM** la nen tang SaaS multi-tenant, phuc vu nhieu nganh doc:
retail, spa, community-hub, tech, TNPM, fitpro, banking, ...

Tai lieu nay tap trung vao nhanh **reborn-tech** — B2B CRM cho doanh nghiep
cong nghe va dich vu IT, bao gom:

- Cong ty tu van cong nghe (IT consulting)
- Doanh nghiep SaaS (Software as a Service)
- Dich vu IT (IT services, managed services)
- Tich hop he thong (system integration)

### 2.2. Cac module chinh

```
+------------------------------------------------------------------+
|                      REBORN CRM — reborn-tech                    |
+------------------------------------------------------------------+
|                                                                  |
|  [Customer/Contact/Partner]  [Sales Pipeline]  [Project Mgmt]   |
|       Quan ly khach hang      Opportunity        Du an IT        |
|       Lien he, doi tac        → Quote            Task, milestone |
|       Phan khuc, nguon        → Contract         Timesheet       |
|                                → Invoice                         |
|                                                                  |
|  [BPM / Workflow]            [Ticketing & Warranty]              |
|       Business rule           Ticket CSKH                        |
|       Approval flow           Bao hanh san pham                  |
|       E-form mapping          SLA tracking                       |
|                                                                  |
|  [Marketing Automation]      [Multi-channel Comm]                |
|       Campaign                Email / SMS                        |
|       Voucher, CTKM           Zalo OA / ZNS                     |
|       Customer survey         Facebook Messenger                 |
|                                VoIP / SIP call center            |
|                                                                  |
|  [KPI Management]            [Finance]                           |
|       Chi tieu nhan vien      So thu chi (cashbook)              |
|       Dashboard KPI           Cong no (debt)                     |
|       Bao cao hieu suat       Quy (fund)                        |
|                                                                  |
|  [Reporting & Analytics]     [Inventory]                         |
|       Bao cao tong hop        Kho, san pham                     |
|       Dashboard               Nhap/xuat/ton                     |
|       Xuat Excel/PDF          Bien the, don vi                  |
|                                                                  |
+------------------------------------------------------------------+
```

### 2.3. Nhung gi KHONG nam trong pham vi

- Chi tiet nghiep vu **nganh khac** (retail POS, spa booking, banking finance)
- Source code level documentation (xem JSDoc / Javadoc trong code)
- Huong dan su dung cho end-user (xem `docs/userguides/`)

---

## 3. Doi tuong doc

| Doi tuong            | Doc phan nao                           | Muc do chi tiet |
|----------------------|----------------------------------------|-----------------|
| Product Owner        | Part 00, 01, 02                        | Tong quan        |
| Developer (FE)       | Part 00, 01, 06, 05, 07               | Chi tiet         |
| Developer (BE)       | Part 00, 01, 02, 03, 04, 05, 09, 10   | Chi tiet         |
| DevOps / SRE         | Part 00, 01, 11, 12, 13               | Chi tiet         |
| Tech Lead / Architect| Tat ca 15 phan                         | Day du           |
| QA / Tester          | Part 00, 01, 02, 08                   | Tong quan        |

---

## 4. Thuat ngu va viet tat

| Viet tat  | Day du                              | Giai thich                                |
|-----------|-------------------------------------|-------------------------------------------|
| CRM       | Customer Relationship Management    | Quan ly quan he khach hang                |
| B2B       | Business-to-Business                | Kinh doanh giua cac doanh nghiep          |
| SaaS      | Software as a Service               | Phan mem dich vu                          |
| SPA       | Single Page Application             | Ung dung trang don (React)                |
| BPM       | Business Process Management         | Quan ly quy trinh nghiep vu               |
| RBAC      | Role-Based Access Control           | Phan quyen theo vai tro                   |
| JWT       | JSON Web Token                      | Token xac thuc                            |
| SSO       | Single Sign-On                      | Dang nhap mot lan                         |
| MSAL      | Microsoft Authentication Library    | Thu vien xac thuc Azure AD                |
| ZNS       | Zalo Notification Service           | Gui thong bao qua Zalo                    |
| OA        | Official Account                    | Tai khoan chinh thuc (Zalo)               |
| SLA       | Service Level Agreement             | Cam ket muc dich vu                       |
| CTKM      | Chuong Trinh Khuyen Mai             | Promotion campaign                        |
| IV        | Invoice                             | Hoa don                                   |

---

## 5. Cach doc tai lieu

1. **Bat dau tu Part 00** (ban dang o day) — nam pham vi va thuat ngu
2. **Doc Part 01** — hieu kien truc tong the, nhin toan canh
3. **Chon phan lien quan** theo vai tro cua ban (xem bang o muc 3)
4. **Tham khao ADR** (Part 14) khi can hieu ly do dang sau quyet dinh thiet ke

---

## 6. Nguyen tac kien truc cot loi

1. **Multi-tenant isolation** — Du lieu cac tenant tach biet hoan toan
   qua row-level filtering (tenant_id). Khong co cross-tenant data leak.

2. **Backend trung lap nganh** — 12 microservice dung chung cho moi nganh.
   Khac biet nghiep vu xu ly qua tenant config va feature flag,
   KHONG hardcode `if (nganh == "tech")`.

3. **Domain-driven boundaries** — Moi microservice so huu mot domain ro rang.
   Giao tiep cross-service qua API hoac message queue (RabbitMQ).

4. **Config over code** — Business rule khac nhau giua cac nganh/tenant
   phai doc tu bang config, khong viet dieu kien trong code.

5. **API contract stability** — Breaking change phai bump version endpoint
   (`/v2/...`), giu legacy cho den khi moi FE migrate xong.

---

## 7. Lich su cap nhat tai lieu

| Ngay       | Phien ban | Nguoi cap nhat | Noi dung                    |
|------------|-----------|----------------|-----------------------------|
| 2026-04-16 | 1.0       | SA Team        | Tao tai lieu Part 00, 01    |
