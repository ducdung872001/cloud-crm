# Compliance — NĐ 13/2023 (PDPA VN) & NĐ 91/2020

## TL;DR

> 3M KH × PII (phone, name, DOB, mua hàng) = data subject **NĐ 13/2023** áp dụng. Nghĩa vụ chính: (1) **consent** rõ ràng khi đăng ký, tách biệt service vs marketing; (2) **right-to-access / erasure** trong 30 ngày; (3) **breach notification** 72h; (4) **DPO** (Data Protection Officer) đăng ký với cơ quan; (5) **NĐ 91/2020** chống spam: opt-out link, frequency cap, gửi 7h-22h. **Hậu quả vi phạm:** fine 500M-1B VND + đình chỉ. Reborn cung cấp tooling, customer chịu trách nhiệm cuối cùng (DPO của customer).

## 1. NĐ 13/2023 — Bảo vệ dữ liệu cá nhân (PDPA Việt Nam)

### 1.1. Phạm vi áp dụng

Áp dụng cho:
- Mọi cá nhân/tổ chức xử lý dữ liệu cá nhân của người Việt Nam tại Việt Nam
- Bao gồm: phone, email, name, DOB, address, CCCD, hành vi tiêu dùng, vị trí, ...

→ Reborn Loyalty với 3M KHTV Việt Nam **100% áp dụng**.

### 1.2. Phân loại dữ liệu

| Loại | Định nghĩa | Áp dụng cho Reborn |
|---|---|---|
| **Dữ liệu cơ bản** | Phone, name, DOB, address, email | ✅ |
| **Dữ liệu nhạy cảm** | CCCD, sức khoẻ, tài khoản ngân hàng, vị trí, ... | ⚠️ Nếu thu CCCD cho KYC |

Dữ liệu nhạy cảm yêu cầu consent rõ ràng hơn + bảo mật cao hơn.

### 1.3. 6 quyền của data subject (KHTV)

| Quyền | Reborn cung cấp |
|---|---|
| **Right to know** | Trang Privacy Policy + Cookie banner |
| **Right to access** | API `/me/data-export` + admin export |
| **Right to rectification** | Edit profile self-service hoặc qua CSKH |
| **Right to deletion** | `/me/deletion-request` workflow |
| **Right to restrict processing** | Opt-out marketing toggle |
| **Right to data portability** | Export JSON/CSV format chuẩn |

### 1.4. Yêu cầu kỹ thuật & tổ chức

| Yêu cầu | Reborn implementation |
|---|---|
| **Consent management** | Form đăng ký separate checkbox: (1) Service terms (mandatory), (2) Marketing consent (optional) |
| **Audit log** | Mọi access PII + change ghi audit, retain 7 năm |
| **Encryption** | At rest (AES-256), in transit (TLS 1.3) |
| **Access control** | RBAC + scope, audit |
| **Breach notification** | < 72 giờ → cơ quan + KH bị ảnh hưởng |
| **DPO appointment** | Customer (chuỗi siêu thị) phải có DPO + đăng ký với MIC |
| **Vendor DPA** | Customer + Reborn ký Data Processing Agreement |
| **Cross-border transfer** | Cần consent + biện pháp bảo vệ (đề xuất: data stay in VN) |

### 1.5. Hậu quả vi phạm (NĐ 13/2023)

| Vi phạm | Mức phạt |
|---|---|
| Không có DPO / không đăng ký | 50-100M VND |
| Không có consent | 100-300M VND |
| Không thông báo breach 72h | 100-300M VND |
| Lộ data quy mô lớn (như 3M KH) | 500M-1B VND + đình chỉ hoạt động xử lý data |
| Tái phạm | Lên đến 5% doanh thu năm |

## 2. NĐ 91/2020 — Chống thư rác (anti-spam)

### 2.1. Phạm vi

Áp dụng cho gửi quảng cáo qua email, SMS, voice call.

### 2.2. Yêu cầu

| Yêu cầu | Reborn implementation |
|---|---|
| **Opt-in trước khi gửi marketing** | Consent toggle khi đăng ký (không pre-checked) |
| **Đường dẫn opt-out trong mọi message** | Email: footer "Hủy đăng ký" link; SMS: "TC TUDO gửi 8XXX" |
| **Frequency cap** | < 3 msg/KH/tuần |
| **Time window** | Gửi 7h-22h Asia/HCM, không gửi Chủ Nhật/Lễ |
| **Sender identification** | Hiển thị tên brand + contact rõ ràng |
| **Honoring opt-out** | Trong 24h xử lý opt-out |

### 2.3. Mức phạt

50M-100M VND mỗi vi phạm; tăng nặng nếu spam quy mô lớn.

## 3. TT 78/2021 & NĐ 123/2020 — e-Invoice

**Không applicable** trực tiếp cho Loyalty (e-invoice là responsibility của POS bán hàng).

Tuy nhiên, Reborn ledger entries có thể được link với e-invoice number (cho audit) — chỉ cần lưu reference, không xử lý e-invoice chính.

## 4. Consent management implementation

### 4.1. Granular consent

```
KH đăng ký:
☑ Tôi đồng ý điều khoản dịch vụ + chính sách bảo mật (mandatory)
☐ Tôi đồng ý nhận thông tin khuyến mãi qua SMS (optional)
☐ Tôi đồng ý nhận thông tin khuyến mãi qua Email (optional)
☐ Tôi đồng ý nhận thông tin khuyến mãi qua Zalo (optional)
☐ Tôi đồng ý chia sẻ dữ liệu với đối tác tin cậy (optional, mặc định OFF)
```

### 4.2. Consent log

```sql
TABLE consent_log
├─ consent_id PK
├─ member_id FK
├─ consent_type (service/marketing_sms/marketing_email/marketing_zalo/partner_share)
├─ granted (bool)
├─ granted_at timestamp
├─ source (registration_form / app_settings / admin_set / withdrawn)
├─ ip, user_agent
└─ document_version (link to T&C version at time of consent)
```

Mỗi thay đổi consent → ghi entry mới (append-only). Engine check latest entry to determine current state.

### 4.3. Honor opt-out

- Notification service check `consent_log` trước khi gửi
- Cache consent state (refresh 5 phút)
- Update propagate < 24h

## 5. Right-to-erasure workflow

```
KH requests deletion (qua app/web/CSKH)
   │
   ▼
Workflow: pending_review
   - KH receive confirmation email với link "cancel within 7 days"
   ├─ Cancelled within 7 days → workflow stops
   └─ No cancel → proceed to grace period
   ▼
Grace period 30 days
   - KH có thể restore account by login
   - After 30 days → execute deletion
   ▼
Execute:
   ├─ Update member.status = 'deleted'
   ├─ Anonymize PII:
   │    name → 'Khách đã xóa'
   │    phone → SHA256(phone)
   │    email → NULL
   │    national_id → NULL
   │    dob → NULL
   │    address → NULL
   ├─ Keep ledger entries (aggregate audit, anonymized member ref)
   ├─ Keep ticket history (anonymized)
   ├─ Audit log: deletion executed
   └─ Notify KH: "Tài khoản đã xoá thành công"
   ▼
5 năm sau (legal retention):
   └─ Hard delete: drop all rows, except aggregated analytics
```

## 6. Right-to-access (data export)

API `/v1/me/data-export`:
- Sinh ZIP file:
  - `profile.json` — thông tin cá nhân
  - `ledger.csv` — lịch sử điểm
  - `redemptions.csv` — đổi quà
  - `tickets.json` — khiếu nại
  - `consents.json` — consent history
- Gửi link tải qua email (link TTL 72h, signed URL)
- Rate limit 1 request / 30 ngày / KH

## 7. Breach notification procedure

```
Detection (alert from SIEM)
   ▼
Triage within 4h
   - Confirm breach
   - Scope: số KH affected, loại data
   - Severity assessment
   ▼
Contain within 24h
   - Block attacker
   - Patch vulnerability
   - Force reset credentials
   ▼
Notify within 72h
   ├─ Cơ quan Bộ Công An (PA05)
   ├─ Customer (chuỗi siêu thị) leadership + DPO
   └─ KH bị ảnh hưởng:
        - Email/SMS
        - Notification trên app
        - Press release nếu > 100K KH affected
   ▼
Post-mortem within 5 days
   ▼
Implement preventive controls
```

## 8. Vendor relationship — Customer vs Reborn

| Role | Definition | Trong dự án |
|---|---|---|
| **Controller** | Quyết định mục đích xử lý | **Customer (chuỗi siêu thị)** |
| **Processor** | Xử lý data theo chỉ thị của controller | **Reborn JSC** |
| **Sub-processor** | Vendor của processor (vd: cloud provider) | AWS/Azure/SMS gateway |

**Data Processing Agreement (DPA)** giữa customer và Reborn:
- Liệt kê purposes, data categories, retention
- Reborn cam kết technical/organizational measures
- Sub-processor list + customer approval
- Audit rights của customer
- Liability cap

## 9. Operational compliance

### 9.1. Training

- Toàn bộ nhân viên customer + Reborn: training annual về PDPA
- CSKH: training xử lý request data subject
- DPO: certification (nếu yêu cầu)

### 9.2. Tooling cung cấp

Reborn cung cấp customer:
- Consent management UI
- Data subject request portal
- Audit log viewer (immutable)
- Data export tool (per KH)
- Breach notification template
- Cookie banner generator
- Privacy policy template

### 9.3. Documentation maintenance

- Privacy Policy update annual (hoặc khi material change)
- ROPA (Record of Processing Activities) maintained by customer DPO, Reborn provides technical info
- DPIA (Data Protection Impact Assessment) khi launch major feature mới

## 10. Cross-border data transfer

NĐ 13/2023 cho phép transfer ra ngoài VN với điều kiện:
- Có consent của data subject HOẶC
- Implement biện pháp bảo vệ (encryption + DPA + certified destination)

**Khuyến nghị:** Data của customer chuỗi siêu thị **lưu hoàn toàn tại Việt Nam** (cloud VN hoặc on-prem) — đơn giản compliance + đảm bảo sovereignty.

## 11. Compliance KPI

| KPI | Target | Frequency |
|---|---|---|
| Consent capture rate at registration | ≥ 95% | Real-time |
| Right-to-access requests SLA (30d) | 100% | Monthly |
| Right-to-erasure requests SLA | 100% | Monthly |
| Audit log completeness | 100% | Weekly check |
| Breach incidents | 0 | Annually |
| Unauthorized data access alerts | 0 critical | Daily |
| DPA review | 1x/year | Annual |
| PDPA training completion (staff) | 100% | Annual |

## 12. Tham chiếu

- NĐ 13/2023: chinhphu.vn (full text)
- NĐ 91/2020: chinhphu.vn
- URD compliance settings: [`../02-requirements/part-11-settings-admin.md#ur-cfg-12-compliance-settings-must`](../02-requirements/part-11-settings-admin.md)
- URD soft delete: [`../02-requirements/part-02-membership-core.md#ur-mbr-10-soft-delete--retention-must-compliance`](../02-requirements/part-02-membership-core.md)
- SA security: [`../03-architecture/part-06-security.md`](../03-architecture/part-06-security.md)
- Fraud prevention overlap: [`fraud-prevention.md`](fraud-prevention.md)
