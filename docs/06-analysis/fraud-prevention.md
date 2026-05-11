# Fraud Prevention — Gian lận chương trình loyalty

## TL;DR

> Loyalty fraud thiệt hại 10–25% giá trị program nếu không có kiểm soát. 6 vector chính: (1) **insider abuse** — nhân viên cộng điểm gian; (2) **fake accounts** — 1 người tạo nhiều thẻ; (3) **chargeback abuse** — mua bằng credit card, refund nhưng tiêu điểm; (4) **POS hack** — không scan KH cũng tích; (5) **voucher resale** — bán code đổi quà; (6) **transfer laundering** — chuyển điểm A→B→A để qua mặt rule. Cần kết hợp: anomaly detection + 2-level approval + audit + cap + KYC light.

## 1. Threat categorization

### 1.1. Insider fraud (highest impact)

**Threat:** Nhân viên / Cashier / CSKH cộng điểm gian cho người quen, người thân, hoặc bán điểm.

**Scenarios:**
- Cashier không scan thẻ KH thật, dùng thẻ "phantom account" mình tạo → tích về account này → đổi quà bán
- CSKH manual adjust điểm cho người ngoài, chia hoa hồng
- Admin tạo voucher rồi tự đổi

**Mitigations:**
- **Cap per adjust:** Cashier không adjust được (chỉ via POS). CSKH max 5.000 điểm/adjust; > cap cần 2-level approval
- **Daily cap per agent:** 50.000 điểm/agent/ngày
- **Audit alert:** Pattern phát hiện 1 agent + N member adjusts trong 1 giờ → flag
- **Phantom account detection:** Account đăng ký từ store nhân viên, tích bằng thẻ store đó → flag
- **Periodic review:** Hàng quý audit top 100 adjusts > 1.000 điểm
- **Job rotation:** CSKH không xử lý ticket của chính mình tạo

### 1.2. Fake / multi-account fraud

**Threat:** 1 người tạo N account để hưởng welcome bonus, hoặc đổi quà tier-restricted.

**Scenarios:**
- Welcome bonus 500 điểm × tạo 100 account = 50.000 điểm
- Đăng ký 10 account, tích đủ cho mỗi account = Diamond (thay vì chia 1 account)

**Mitigations:**
- **OTP phone verification:** Phải verify phone qua OTP → khó tạo bulk
- **Device fingerprint:** Track device đăng ký nhiều account
- **IP rate limit:** > 5 đăng ký/IP/giờ → flag
- **Welcome bonus 1× lifetime cap** by phone (chính + similar phone within 1 digit difference)
- **DOB/name similarity check:** Nếu tên + DOB giống KH đã có nhưng phone khác → suspicious
- **Tier consolidation rule:** Nếu phát hiện multi-account, merge by phone (UR-MBR-06)

### 1.3. Chargeback abuse

**Threat:** KH mua bằng credit card, được tích điểm, sau đó chargeback (giả vờ không nhận hàng) → điểm vẫn còn → đổi quà → ngân hàng refund money.

**Scenarios:**
- KH order 10M VND, tích 1.000 điểm, sau 30 ngày chargeback → ngân hàng refund 10M, nhưng KH đã đổi quà 1.000 điểm

**Mitigations:**
- **Rollback on refund** (UR-PTS-06): khi refund order → trừ điểm tương ứng. Nếu balance không đủ → đi âm + block account
- **Delayed earn:** Có thể delay tích điểm 7 ngày sau order (chargeback window) — chấp nhận trade-off CX
- **Block chargeback abusers:** > 2 chargeback/năm → permanent block + flag fraud_history

### 1.4. POS not scanning

**Threat:** Cashier không scan thẻ KH (lười / quên), nhưng vẫn để KH "tích điểm" sau bằng cách giả lập, hoặc bán SP off-the-book.

**Mitigations:**
- **Auto-earn webhook bắt buộc từ POS** (không cho phép manual entry tại Reborn)
- **Reconciliation:** Tổng points earned phải khớp với POS sales report ± 2%
- **Manual earn endpoint** chỉ cho Admin/Supervisor, với cap + audit
- **Customer-side proof:** Receipt có member_id + points earned → KH có thể dispute nếu thiếu

### 1.5. Voucher resale

**Threat:** Voucher code bán trên chợ đen, bị dùng bởi người không phải owner.

**Mitigations:**
- **Bind voucher to phone:** Khi dùng voucher tại POS, phải nhập phone match owner. (Optional, có thể off cho UX)
- **Voucher TTL ngắn:** 30 ngày max → giảm cơ hội resale
- **Single-use:** Mặc định không multi-use
- **Watermark voucher PDF:** Có watermark tên KH + barcode → khó share
- **Detect bulk redemption:** Nhiều voucher từ same source redeem tại 1 store trong 1 ngày → flag

### 1.6. Cross-brand transfer laundering

**Threat:** Lợi dụng tỷ giá transfer A↔B để launder điểm fraudulent.

**Scenarios:**
- KH có 10.000 điểm A (fraudulent earn), transfer → 8.000 B → transfer back → 6.400 A. Round-trip lose 36% nhưng đổi structure → khó audit
- 2 account swap để hide source

**Mitigations:**
- **Cooldown 7 ngày** sau mỗi transfer
- **Max 10.000 điểm/ngày/KH** transfer
- **Cap lifetime transfer:** 50.000 điểm/năm/KH (cấu hình)
- **Audit transfer log:** Pattern detect ping-pong

## 2. Anomaly detection model

### 2.1. Statistical rules

```python
# Pseudocode
def detect_anomaly(member, transaction):
    flags = []

    # Velocity check
    if recent_earns_24h(member) > P95_baseline:
        flags.append('high_velocity_earn')

    # Amount anomaly
    if transaction.points > 10 * member.avg_earn_per_order:
        flags.append('unusual_amount')

    # Geo anomaly
    if transaction.store_id not in member.usual_stores
       and not member.is_traveling:
        flags.append('unusual_location')

    # Time anomaly
    if transaction.hour < 6 or transaction.hour > 23:
        flags.append('off_hours')

    # Tier mismatch
    if member.tier == 'diamond' and member.tenure_months < 1:
        flags.append('suspicious_fast_tier')

    return flags
```

### 2.2. Action thresholds

| Flags count | Action |
|---|---|
| 0 | Process normally |
| 1 | Process, log for review |
| 2 | Process, alert Supervisor for next-day review |
| 3 | Hold transaction, immediate review |
| 4+ | Block transaction, escalate |

### 2.3. ML model (Year 2+)

- Train on labeled fraud cases (post-mortem analyses)
- Features: RFM + delta + velocity + device + transactions
- Algorithm: Isolation Forest hoặc XGBoost
- Output: fraud_score 0-1 per transaction

## 3. KYC (light) cho high-value KH

Đối với KH:
- Lifetime points earned > 100.000 (≈ 1B VND chi tiêu)
- Hoặc Diamond tier
- Hoặc redemption value > 5M VND lifetime

→ Yêu cầu light KYC: CCCD/CMND scan + DOB verify. Reborn không lưu CCCD raw, chỉ hash + verify.

## 4. Operational controls

### 4.1. Segregation of duties

| Role | Quyền | Không quyền |
|---|---|---|
| Cashier | Earn via POS (read-only thẻ KH) | Adjust manual |
| CSKH Agent | Tra cứu, tạo ticket | Adjust > 1.000 điểm |
| CSKH Supervisor | Approve adjust 1K-10K | Adjust > 10K |
| Tenant Admin | Adjust any (with audit) | Self-approve |
| Marketing | Tạo campaign, view RFM | Adjust điểm trực tiếp |

### 4.2. 4-eyes principle (high-impact actions)

| Action | Required approvers |
|---|---|
| Adjust > 10K điểm | CSKH Sup + Tenant Admin |
| Bulk import > 10K members | 2 Tenant Admin |
| Scope change | 2 Tenant Admin + Audit |
| Earn rule change (rate change) | 2 Tenant Admin |
| Tier benefit cost ↑ > 20% | Tenant Admin + Finance |

### 4.3. Audit cadence

| Activity | Frequency | Owner |
|---|---|---|
| Daily anomaly alerts review | Daily | Operations |
| Weekly top adjusts review | Weekly | CSKH Sup |
| Monthly fraud KPI report | Monthly | Compliance |
| Quarterly external audit | Quarterly | External auditor |
| Annual pen-test | Annual | Security |

## 5. Reporting & metrics

| Metric | Target | Alert |
|---|---|---|
| Manual adjusts / week | < 100 | > 200 → spike |
| Fraud cases detected | 0–5/month | > 10 |
| Account block rate | < 0.1% | > 0.5% (over-blocking) |
| Chargeback rate | < 0.1% of revenue | > 0.5% |
| Voucher abuse incidents | < 5/month | > 20 |
| Cross-brand transfer ping-pong | < 0.01% members | > 0.1% |

## 6. Incident response

### 6.1. Detection → Triage

```
Alert from anomaly detection
   ▼
Triage by Security/Operations (within 4h)
   ▼
Severity:
  P1 — Massive loss potential, immediate block
  P2 — Individual case, investigate within 24h
  P3 — Pattern, monitor, report monthly
```

### 6.2. Containment

| Severity | Action |
|---|---|
| P1 | Block account + freeze related accounts + escalate Reborn security |
| P2 | Soft block (hold transactions for review) + investigate |
| P3 | Tag for monitoring |

### 6.3. Recovery

- Reverse fraudulent earn entries (audit adjust_out với reason=fraud)
- Unblock legitimate KH if false positive
- Update detection rules to prevent recurrence

### 6.4. Communication

- Internal: incident report within 48h
- KH affected: notification 5 days
- Authorities (if data breach): per NĐ 13/2023, < 72h

## 7. Real-world fraud cases (industry)

| Case | Impact | Lesson |
|---|---|---|
| Starbucks 2017 China | $40M loss, mobile orders manipulated | Need device + behavioral fingerprint |
| Air Miles (Canada) 2017 | Class action over expire policy | Communicate expiry clearly |
| Macy's 2019 | Insider fraud, employee adjust > $1M | Cap per adjust + audit |
| Walmart 2020 | Coupon fraud, $1M+ resale | Bind to phone + watermark |
| 7-Eleven 2021 | Multi-account abuse | Phone verify + device |

## 8. Implementation phases

### Phase 1 (MVP)

- Cap per adjust + 2-level approval
- Audit log immutable
- Phone OTP for registration
- Idempotency for POS (prevents POS replay attack)

### Phase 2 (M3-M4)

- Anomaly detection (statistical rules)
- Cross-brand transfer cap
- KYC light for high-value
- Welcome bonus 1× cap

### Phase 3 (M5-M6)

- ML model fraud scoring
- Device fingerprint
- Bind voucher to phone (optional)
- Periodic external audit

### Year 2+

- Real-time fraud scoring
- Network analysis (cluster detection)
- Behavioral biometrics
- Bug bounty

## 9. Tham chiếu

- URD permission cap: [`../02-requirements/part-01-actors-roles.md#2-permission-matrix-ma-trận-quyền`](../02-requirements/part-01-actors-roles.md)
- SA security: [`../03-architecture/part-06-security.md`](../03-architecture/part-06-security.md)
- Audit log spec: [`../02-requirements/part-11-settings-admin.md#ur-cfg-05-audit-log-must`](../02-requirements/part-11-settings-admin.md)
- Compliance: [`compliance-pdpa.md`](compliance-pdpa.md)
