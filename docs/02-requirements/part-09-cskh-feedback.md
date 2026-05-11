# Part 09 — CSKH gắn Loyalty

## 1. Bài toán

Khách hiện ghi khiếu nại trong **Supporter** tách rời profile KH ở **Goldmem**. Khi CSKH tiếp nhận, không biết KH này hạng gì, mua bao nhiêu, có vấn đề gì lịch sử. Cần **ticket gắn 360° profile** + workflow xử lý chuẩn ITIL.

## 2. Ticket entity

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `ticket_id` | UUID | PK |
| `ticket_code` | string(20) | Format `TK-YYYYMM-NNNN` |
| `member_id` | FK | (NULL nếu KH chưa member) |
| `walk_in_phone` | string | Khi member_id NULL |
| `walk_in_name` | string | Khi member_id NULL |
| `channel` | enum | phone/email/zalo/fanpage/walk_in/app |
| `category` | enum | complaint/inquiry/return_exchange/warranty/feedback |
| `subcategory` | string | VD: product_quality, staff_attitude, ... |
| `priority` | enum | urgent/high/normal/low (auto-set theo SLA) |
| `subject` | string(200) | |
| `description` | text | |
| `attachments` | JSON array | URLs |
| `status` | enum | new/assigned/in_progress/waiting_customer/resolved/closed/cancelled |
| `assigned_to_user_id` | FK user | CSKH agent |
| `created_by_user_id` | FK user | Ai tạo ticket |
| `store_id` | FK | Liên quan store nào |
| `brand_id` | FK | |
| `related_order_ref` | string | Đơn liên quan (nếu có) |
| `related_product_sku` | string | SP liên quan |
| `sla_deadline` | timestamp | Tính từ priority |
| `first_response_at` | timestamp | KPI metric |
| `resolved_at` | timestamp | |
| `resolution` | text | Cách giải quyết |
| `customer_satisfaction` | int 1-5 | KH đánh giá sau khi close |
| `compensation_points` | bigint | Điểm goodwill cộng cho KH (nếu có) |
| `tags` | JSON array | |

## 3. SLA theo priority

| Priority | First response | Resolution |
|---|---|---|
| Urgent | 30 phút | 4 giờ |
| High | 2 giờ | 24 giờ |
| Normal | 8 giờ | 72 giờ |
| Low | 24 giờ | 7 ngày |

Auto-set priority:
- VIP tier (Diamond, Gold) → minimum High
- Complaint về fraud/safety → Urgent
- Default → Normal

## 4. Yêu cầu

### UR-CARE-01 — Tạo ticket (Must)

| | |
|---|---|
| **Actor** | CSKH Agent, Store Manager, Cashier, KH self-service (app) |
| **Mô tả** | Form tạo ticket: chọn KH (link nếu member, không thì nhập walk-in info), channel, category, subject, description, attachments, related order/product. Auto-fill priority. Ticket → status `new`. |
| **AC** | • Mã ticket auto-gen<br>• SLA deadline tự tính<br>• Notification cho assign queue<br>• Hiển thị warning nếu KH đã có ticket open khác |

### UR-CARE-02 — Ticket gắn profile 360° (Must)

| | |
|---|---|
| **Mô tả** | Khi ticket có `member_id`, hiển thị side panel: tier, balance, lifetime spend, tickets history (open + closed), recent orders 5, segment tags. CSKH có context đầy đủ trước khi tương tác. |
| **AC** | • Side panel load < 1 s<br>• Click history ticket → mở chi tiết<br>• Hiển thị badge "VIP" nếu Diamond/Gold |

### UR-CARE-03 — Workflow status transitions (Must)

```
new ──► assigned ──► in_progress ──► resolved ──► closed
  │         │             │              │           │
  │         └─► waiting_customer ◄──────┘           │
  │                                                  │
  └──────────────────► cancelled ◄──────────────────┘
                                       (reopened if KH phản hồi trong 7 ngày)
```

| | |
|---|---|
| **AC** | • Transition matrix enforce: không cho new → closed trực tiếp<br>• Mỗi transition ghi `ticket_timeline` với actor + timestamp + note<br>• Hệ thống auto-close ticket `resolved` sau 7 ngày KH không phản hồi |

### UR-CARE-04 — Auto-assign (Should)

| | |
|---|---|
| **Mô tả** | Khi ticket new: auto-assign cho CSKH agent theo load balancing (round-robin agents online) hoặc skill-routing (category match). Manual reassign cho phép. |
| **AC** | • Setting bật/tắt auto-assign<br>• Agent có thể reject ticket → re-queue<br>• Supervisor reassign override |

### UR-CARE-05 — SLA monitoring (Must)

| | |
|---|---|
| **Mô tả** | Dashboard "SLA at risk": tickets sắp quá hạn first response hoặc resolution. Notification 30 phút trước deadline. Tickets quá hạn → escalate cho Supervisor. |
| **AC** | • Real-time refresh<br>• Color code: green (<70% SLA used), yellow (70–90%), red (>90%)<br>• Notification qua bell + email |

### UR-CARE-06 — Compensation points (Should)

| | |
|---|---|
| **Mô tả** | Khi resolve ticket khiếu nại đúng, CSKH có thể cộng "goodwill points" cho KH. Cap: 5.000 điểm/ticket (= ~500k VND tại rate 1:100). > cap cần Supervisor approve. |
| **AC** | • Ghi ledger `adjust_in` với reference_type=ticket, reference_id=ticket_id<br>• Audit log<br>• Notification KH "Cảm ơn bạn — +N điểm bồi thường" |

### UR-CARE-07 — KH self-service ticket (Should)

| | |
|---|---|
| **Mô tả** | KH qua app/web có thể: tạo ticket mới, xem trạng thái ticket cũ, phản hồi, đính kèm ảnh, đánh giá sau khi close. |
| **AC** | • Throttle: 1 KH tạo tối đa 3 ticket/ngày<br>• Notification mỗi state change<br>• KH thấy chính xác status hiện tại + last update |

### UR-CARE-08 — Feedback (NPS) (Should)

| | |
|---|---|
| **Mô tả** | Sau resolve ticket, gửi NPS survey: "Bạn đánh giá xử lý vấn đề này ra sao? 1–5 sao + comment". Score tổng hợp vào dashboard CSKH performance. |
| **AC** | • Email/SMS với link 1-click rating<br>• Score < 3 → escalate cho Supervisor review<br>• Báo cáo per agent + per category |

### UR-CARE-09 — Knowledge base internal (Could)

| | |
|---|---|
| **Mô tả** | Database các "câu hỏi thường gặp" + "playbook xử lý" cho CSKH. Search trong side panel khi xử lý ticket. |
| **AC** | • CRUD KB articles<br>• Search semantic (nếu có thể)<br>• Quick-insert text vào ticket reply |

### UR-CARE-10 — Báo cáo CSKH (Must)

| | |
|---|---|
| **Mô tả** | Dashboard CSKH: total tickets, by status, by category, SLA compliance %, NPS score, top complaints, agents performance (volume + NPS). |
| **AC** | • Filter by period, agent, store, brand<br>• Export Excel<br>• Drill-down vào ticket detail |

## 5. Warranty (gắn KH)

Warranty là sub-flow của CSKH. Chỉ có yêu cầu loyalty-relevant:

### UR-CARE-11 — Warranty tra cứu KH (Should)

| | |
|---|---|
| **Mô tả** | Khi tiếp nhận warranty, tra cứu KH qua serial number → tự link với member_id (qua order_history). Hiển thị: KH có member, đơn gốc, hạn bảo hành còn lại. |
| **AC** | • Lookup serial < 1 s<br>• Auto-create warranty case linked to ticket<br>• Hiển thị tier để Supervisor decide priority |

## 6. Quy tắc nghiệp vụ

- **Mỗi ticket có 1 member_id duy nhất** (hoặc walk-in info). Nếu KH 2 brand qua cross-brand: ticket gắn brand context hiện tại
- **CSKH không tự assign cho mình** ticket VIP (Diamond) — phải qua queue + Supervisor approval
- **Reopen ticket** trong 7 ngày sau close miễn phí; sau 7 ngày → tạo ticket mới (link related_ticket)
- **Goodwill points cap toàn agent**: 50.000 điểm/ngày — tránh agent lạm dụng

## 7. Tham chiếu

- **Backend spec:** [`../05-backend-tasks/care/`](../05-backend-tasks/care/) — xem `ticket-complaint-fields.md`
- **Migration Supporter → Reborn ticket:** [`../06-analysis/data-migration-strategy.md`](../06-analysis/data-migration-strategy.md)
- **HDSD CSKH:** [`../09-userguides/part-06-pos-cashier.md`](../09-userguides/part-06-pos-cashier.md)
