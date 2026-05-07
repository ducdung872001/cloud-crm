# URD — Zoom Credit Pool & Peer Borrow (USP của MentorHub)

**Trạng thái:** v1.0 — chốt 2026-05-08
**Liên kết requirement gốc:** F4 trong [REQUIREMENTS_mentorhub.md](./REQUIREMENTS_mentorhub.md)
**Phase BE:** 6 (`backend-stubs/src/services/zoom-pool.ts`, `zoom-borrow.ts`, `credit-wallet.ts`)
**Route FE:** `/mh/zoom-pool` · `/mh/zoom-pool/bookings` · `/mh/wallet`

---

## 0. Tóm tắt 1 dòng

> **Mentor không cần mua Zoom Pro.** Pool credit chia sẻ Zoom giữa Reborn HQ + cộng đồng WIT + chính các mentor — đặt slot bằng credit, kiếm credit bằng cách góp Zoom rảnh hoặc thoả thuận trực tiếp peer-to-peer.

Đây là **USP cứng** của MentorHub vs các competitor (Teachable / Thinkific / Kajabi…). Không hệ thống nào trong segment có cơ chế này.

---

## 1. Bối cảnh nghiệp vụ

### 1.1 Tại sao có pool

| Pain | Hiện trạng | MentorHub giải |
|---|---|---|
| Mentor cá nhân không muốn trả 14$/tháng cho Zoom Pro chỉ để dạy 4-8 buổi | Họ dùng Zoom Basic 40 phút → bị cắt giữa buổi rất khó chịu, hoặc share từ bạn bè không track được | Pool licensed Zoom → 1 credit = 1 phút, mentor mới chỉ cần plan Pro ~99k/tháng |
| Mentor có Zoom Pro nhưng chỉ dùng 30%/tháng | Tiền lãng phí | Góp slot rảnh lên pool → earn credit (50% mặc định) đổi tiền hoặc trừ buổi học khác |
| Cộng đồng WIT (Women In Tech) có hàng nghìn người mua Zoom Pro nhưng dạy ít | Không có cách monetize hay đóng góp cộng đồng | WIT volunteer earn rate **70%** — vừa kiếm tiền vừa tạo legacy |
| Mentor muốn **chỉ định** ai được dùng Zoom của mình (không public lên pool) | Không có mechanism | Peer-to-peer borrow request — A duyệt từng case, có thể counter-offer |

### 1.2 Ai liên quan

- **Mentor C** (Borrower): cần Zoom giờ B để dạy nhưng không có/không đủ.
- **Mentor A** (Lender / Contributor): có Zoom rảnh giờ B, muốn cho mượn để earn credit/tiền.
- **Reborn HQ Pool**: pool platform-level (admin SaaS quản lý), licensed Zoom enterprise.
- **WIT Community Pool**: cộng đồng đối tác, contributor earn rate cao hơn (70%).
- **Reborn HQ Admin (P5)**: cấu hình rule (earn rate, swap rate, monthly grant per tier).
- **Finance / Billing (P6)**: đối soát credit ↔ tiền cuối tháng.

---

## 2. 2 mô hình song song

### 2.1 Mô hình A — Auto-Pool (publish + book ngay)

```
A (Contributor)              Pool                 C (Borrower)
       │                       │                       │
       │ publish account       │                       │
       ├──────────────────────>│                       │
       │ (set earn rate, e.g.  │                       │
       │  50%)                 │                       │
       │                       │ scanner cron tick     │
       │                       │ → sinh free slot      │
       │                       │   (theo Zoom Calendar)│
       │                       │                       │
       │                       │     GET /slots         │
       │                       │<──────────────────────┤
       │                       │ free slot list        │
       │                       │──────────────────────>│
       │                       │                       │
       │                       │     POST /book         │
       │                       │<──────────────────────┤
       │                       │ reserve→spend→confirm │
       │                       │ (atomic, TTL 5')      │
       │                       │ trừ X credit của C    │
       │                       │ cộng X*50% credit cho A│
       │                       │ booking confirmed     │
       │                       │──────────────────────>│
```

**Đặc điểm:**
- Không tương tác trực tiếp A↔C
- Earn rate cố định khi publish
- Pre-approval implicit qua việc publish account
- Phù hợp: A có nhiều slot rảnh nhàn rỗi, muốn standardize giá

**Edge:**
- Race-safe: reservation TTL 5' tránh double-book
- Refund: H-2 → 100%, H-0 → 50%, sau giờ → 0%

### 2.2 Mô hình B — Peer Borrow Request (thoả thuận case-by-case)

```
C (Borrower)                                     A (Lender)
      │                                                │
      │ POST /borrow                                   │
      │ { toMentorId: A,                               │
      │   proposedStartsAt, durationMin,               │
      │   offeredCredits, courseTitle, reason }        │
      │ (BE pre-check wallet C đủ credit)              │
      │                                                │
      │                                  GET /borrow/inbox
      │                                  ┌─────────────┤
      │                                  └────────────>│
      │                                                │
      │                                  3 lựa chọn:   │
      │                                                │
      │                ┌────── approve ────────────────┤ (A ok luôn)
      │                │                               │
      │ <──────────────┤                               │
      │ BE auto:       │                               │
      │ - Tạo ZoomPoolAccount cho A (nếu chưa)         │
      │ - Tạo slot ad-hoc (status=free)                │
      │ - bookSlot() → trừ credit C, cộng A 100%       │
      │ - link bookingId vào request                   │
      │                                                │
      │                ┌────── decline ─────────────────┤
      │ <──────────────┤                               │
      │ kết thúc                                       │
      │                                                │
      │                ┌────── counter ─────────────────┤
      │ <──────────────┤ A đề xuất                     │
      │ status vẫn pending,                            │
      │ counterCredits / counterStartsAt set           │
      │                                                │
      │ C accept → A approve final (re-trigger)        │
      │ HOẶC C cancel                                  │
      │                                                │
      │ (TTL 24h — auto expire nếu A im lặng)          │
```

**Đặc điểm:**
- A duyệt từng case, có thể negotiate
- Earn rate 100% (private peer, A giữ trọn)
- Phù hợp: quan hệ thân, trust-based, A muốn kiểm soát ai dùng Zoom mình

**Khác biệt key vs auto-pool:**
| | Auto-pool | Peer-borrow |
|---|---|---|
| Pre-approval | Có (publish 1 lần) | Không (per-request) |
| Earn rate | 50% mặc định | 100% (private) |
| Negotiate | Không | Có (counter) |
| TTL | 5' reservation | 24h reply |
| Phù hợp khi | Slot nhiều, giá chuẩn | Quan hệ thân, kiểm soát |

---

## 3. State Machine — Borrow Request

```
        ┌─────────┐
        │ pending │ (24h TTL)
        └────┬────┘
             │
   ┌─────────┼─────────┬──────────┬──────────┐
   │         │         │          │          │
approve   decline   counter   cancel(C)   timeout
   │         │         │          │          │
   ▼         ▼         ▼          ▼          ▼
booked   declined  pending    cancelled  expired
(linked   (final)  (counter   (final)    (final)
 booking)          set,
                   chờ accept)
```

**Note:**
- `counter` không đổi status; chỉ set `counterCredits`/`counterStartsAt`. C nhận thấy → re-approve hoặc cancel.
- `approve` từ `counter` state → BE dùng counterCredits/counterStartsAt thay vì offer ban đầu.

---

## 4. Credit Rules (cấu hình admin per tenant)

| Rule | Default Trial | Pro | Master | Academy |
|---|---|---|---|---|
| `monthlyGrant` | 60 credit | 200 | 600 | 2000 |
| `rolloverEnabled` | false | true | true | true |
| `rolloverCap` | 0 | 100 | 300 | unlimited |
| `tierDiscountPct` (book cost discount) | 0 | 10 | 25 | 40 |
| `swapRatePct` (credit ↔ VND) | — | 0 | 5 | 10 |
| Earn `contribute_pool` per slot | 0 | 30 | 30 | 30 |
| Earn `refer_mentor` per success | 100 | 100 | 100 | 100 |

**Atomic invariant:** `wallet.balance == sum(transactions.amount)` lifetime — kiểm bằng `credit-reconcile.ts`.

---

## 5. Screen mapping (FE)

| Path | Screen | Mô tả |
|---|---|---|
| `/mh/zoom-pool` | Tab `Tìm slot` | Auto-pool browse + book ngay |
| `/mh/zoom-pool` | Tab `Yêu cầu mượn` | Peer-borrow form (đề xuất giờ tự do) |
| `/mh/zoom-pool` | Tab `Tôi cho mượn` | Mentor publish account, set earn rate |
| `/mh/zoom-pool` | Tab `Đơn nhận` | A inbox: approve / decline / counter |
| `/mh/zoom-pool` | Tab `Đơn đã gửi` | C tracking yêu cầu đã gửi |
| `/mh/zoom-pool/bookings` | Bookings list | Tất cả booking active/cancelled/completed + cancel với refund preview |
| `/mh/wallet` | Wallet | Balance + 3 KPI (balance/earn/spend) + transaction history filtered by type |

Sidebar: nhóm "Zoom Pool" với 3 entry (Tìm & mượn / Đặt lịch / Ví credit).

---

## 6. Endpoint API (BE)

| Method | Path | Mục đích |
|---|---|---|
| GET | `/api/v1/zoom-pool/slots` | Tìm slot rảnh (auto-pool) |
| GET | `/api/v1/zoom-pool/accounts` | List public account info |
| POST | `/api/v1/zoom-pool/book` | Book slot (atomic) |
| GET | `/api/v1/zoom-pool/bookings` | List my bookings |
| DELETE | `/api/v1/zoom-pool/bookings/:id` | Cancel + refund theo H-2 rule |
| GET | `/api/v1/zoom-pool/my-accounts` | List accounts mentor đã publish |
| POST | `/api/v1/zoom-pool/my-accounts` | Publish 1 account lên pool |
| PATCH | `/api/v1/zoom-pool/my-accounts/:id` | Update earn rate / status |
| POST | `/api/v1/zoom-pool/my-accounts/:id/slots` | Add slot manually |
| **POST** | **`/api/v1/zoom-pool/borrow`** | **Peer C tạo borrow request** |
| GET | `/api/v1/zoom-pool/borrow/inbox` | A xem yêu cầu nhận được |
| GET | `/api/v1/zoom-pool/borrow/sent` | C xem đã gửi |
| POST | `/api/v1/zoom-pool/borrow/:id/approve` | A đồng ý → auto book |
| POST | `/api/v1/zoom-pool/borrow/:id/decline` | A từ chối |
| POST | `/api/v1/zoom-pool/borrow/:id/counter` | A counter-offer |
| POST | `/api/v1/zoom-pool/borrow/:id/cancel` | C huỷ pending |
| GET | `/api/v1/credit/wallet` | Số dư + rule |
| GET | `/api/v1/credit/transactions` | History filtered by type |

**Auth:** header `x-mentor-id`. Production cutover sang JWT.

---

## 7. Marketing pitch — quảng bá cho mentor

> **"Đừng mua Zoom Pro nữa. Cứ vào MentorHub, mượn Zoom giờ bạn cần dạy."**

### 7.1 3 message chính

**Cho mentor mới (không có Zoom Pro):**
> Trial MentorHub tặng bạn 60 credit (~ 1 buổi học 60 phút). Bạn vào tab **Zoom Pool** → tìm slot rảnh từ Reborn HQ hoặc cộng đồng WIT → book ngay. Không cần đăng ký Zoom riêng, không cần trả 14$/tháng.

**Cho mentor đã có Zoom Pro:**
> Bạn dùng Zoom 30% thời gian, 70% còn lại đang lãng phí. Vào **Zoom Pool → Tôi cho mượn** → publish account → mỗi giờ mentor khác mượn, bạn earn 50% credit. 1 tháng có thể tự bù chi phí Zoom Pro.

**Cho cộng đồng WIT:**
> Tham gia pool với rate earn **70%** — cao hơn mentor thường. Mỗi giờ bạn cho mượn, bạn vừa kiếm tiền vừa support nữ mentor mới vào nghề. Reborn HQ verify badge "WIT Contributor" trên public profile của bạn.

### 7.2 Channel quảng bá

- **In-app banner** trên Dashboard cho mentor có `subscription.usage.zoomCreditsUsed === 0` sau 7 ngày → push CTA "Khám phá Zoom Pool".
- **Onboarding step 6** (mới): sau khi connect Zoom cá nhân, hỏi "Có muốn góp slot rảnh lên pool kiếm credit không?" → 1-click publish.
- **Email tuần đầu trial**: subject "60 credit Zoom miễn phí — dạy ngay không cần mua Pro".
- **Landing page public** `/portal/zoom-pool` (chưa build, deferred): so sánh vs Zoom Pro standalone, calculator earn potential.
- **WIT partner microsite**: form invite WIT volunteer → 1 click join pool với pre-set earn rate 70%.

### 7.3 Metric thành công

| Metric | Mục tiêu Q3 2026 |
|---|---|
| % mentor active dùng pool ít nhất 1 lần/tháng | 40% |
| Tổng pool capacity (số slot/tuần) | 500 |
| Avg credit earn per contributor/tháng | 200 |
| % WIT volunteer onboarded vào pool | 30 trong 90 ngày |
| Borrow request approval rate | >70% |
| Borrow request avg response time | <6h |

---

## 8. Out-of-scope v1 (deferred)

- Search mentor theo tên/expertise trong tab "Yêu cầu mượn" — hiện FE stub gõ mentorId.
- Notification realtime cho A khi có request mới (Zalo OA push) — Phase 2 với notification microservice.
- Calculator earn potential tự động trên landing.
- Zoom Calendar API integration thật để scanner sync slot — hiện stub seed manual.
- Bargain multi-round: hiện chỉ 1 vòng counter; muốn nhiều vòng cần state machine phức tạp hơn.
- Cash-out flow (swap credit → tiền VND) — UI chưa build, BE service ready.
- Reputation score per contributor (avg rating sau buổi mượn) — defer Phase 8.

---

## 9. Liên kết handoff microservice

Khi BE port từ stub sang microservice production, các issue handoff đã sẵn:

- **integration#13** — `zoom-pool-accounts-slots` (port `zoom-pool.ts` + scanner)
- **billing#15** — `credit-wallet-rules-reconcile` (port wallet + rules + reconcile)
- **(NEW)** integration cần issue mới: **`zoom-borrow-request-state-machine`** — port peer-borrow flow
- **notification#7** (sẽ tạo) — push event "borrow_request_received" qua Zalo OA

---

**Phụ lục screen flow chi tiết:** xem trực tiếp ở deploy `https://mentorhub.uat.reborn.vn/crm/mh/zoom-pool` (mock data MT-001 ↔ MT-002 đã seed).
