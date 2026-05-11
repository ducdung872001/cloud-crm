# Vincom Center 8 & 9 — Họp yêu cầu TNEX × Reborn CRM (2026-05-10)

> **Nguồn:** `Vincom Center 8.m4a` (31m42s) + `Vincom Center 9.m4a` (6m11s).
> **Transcript:** gộp trong `TRANSCRIPT.txt` (cùng thư mục); SRT bản gốc `Vincom Center 8.srt` / `Vincom Center 9.srt` giữ lại để đối chiếu timestamp. ASR bằng `faster-whisper medium` (Vietnamese).
> **Lưu ý:** ASR có sai sót (audio họp, nhiều người, nền ồn). Một số tên/thuật ngữ chỉ là phiên âm gần đúng — đã chú thích khi cần.
> **Bên tham gia:**
> - TNEX (khách hàng / business side): chị Lan, "anh", các bạn trụ bán tin / presale / marketing
> - Reborn (vendor): Dũng, Yến, "em" (sales/PM phía Reborn CRM), backend "Khương"

---

## 1. Tóm tắt nội dung

Cuộc họp xoay quanh **việc nâng cấp CRM cho TNEX** để phục vụ luồng tele-sale + marketing cho sản phẩm tài chính (đăng ký vay cashloan). Chia làm hai nhóm chủ đề:

### File 9 (mở đầu) — Quan điểm phía TNEX (chị Lan)
1. Đặt tên đợt upload dữ liệu (review / final / tâm trào ký = chờ ký hợp đồng) để dễ quản lý
2. Một khách hàng có thể được **nhiều sales chăm sóc đồng thời** (telesale, marketing, outsource) — ghi nhận theo "trị độ mở"
3. Rút ngắn thời gian thu hồi data: thay vì 30/60 ngày → reassign sớm hơn nếu sales chưa khai thác
4. **Chia data theo năng lực sales** (top performer → nhiều lead hơn) thay vì chia đều theo số điện thoại
5. Lo ngại budget upgrade: cần xin ngân sách định kỳ, không có sẵn

### File 8 (chính, 31 phút) — Yêu cầu kỹ thuật cụ thể
1. **Campaign batch (N campaign cho 1 đợt marketing):** TNEX muốn tạo 10 campaign mỗi đợt (CAM1…CAM10), đẩy list khách hàng có tên campaign + số điện thoại sang CRM Reborn cho team telesale gọi
2. **Webhook 2 chiều TNEX ↔ CM (Call Manager / CRM Reborn):**
   - CM đã có webhook cắm vào TNEX nhưng đang trả về "chung 1 khớp" → cần **tách webhook theo `campaign_name` (bên_name)**
   - Khi sales gọi, trạng thái (nghe / không nghe / TSC) phải tự động đẩy về TNEX
   - Hỗ trợ đăng ký nhiều webhook trên cùng 1 event (TNEX + Reborn cùng lắng nghe)
3. **Polling 3 phút** lấy trạng thái khách hàng từ TNEX → CR (CRM) để **vá lỗ hổng webhook bị miss** ("hệ thống đã có nhưng CR chưa cập nhật")
   - Lưu vết retry để debug
   - Cơ chế sliding window theo timestamp (không full scan 5M records)
4. **Báo cáo dashboard tự động cho team Trụ bán tin (presale):**
   - Filter theo campaign batch
   - Thống kê: tổng số nghe / tổng số không nghe / status mỗi ông
   - Có thể export ra Excel
5. **Bug "lọc theo trạng thái khoản vay" lệch trên CRM:**
   - Liên quan trực tiếp đến doc `docs/backend-tasks/customer/BUG-cashloan-source-mismatch.md` đã có sẵn
   - TNEX đề nghị Reborn tạo công cụ **claim manual** (gửi list ABA/số điện thoại → force resync) cho các ca "chống quản vai"
6. **Đa nguồn (multi-source) cho 1 khách hàng — yêu cầu lớn nhất về data model:**
   - Hiện tại: phone duplicate → ghi đè nguồn cuối cùng (override)
   - Mong muốn: ghi nhận **tất cả nguồn** (nguồn A trên mobile + nguồn B trên web cùng tồn tại) → filter được theo bất kỳ nguồn nào
   - Cần **"cơ chế mật nâng cao"** — định nghĩa field nào aggregate (append, không ghi đè), field nào vẫn theo logic merge cũ
7. **Thêm field + filter trên customer:** tương ứng cho "campaign name" / "bên name" — cần thêm attribute + bộ lọc, tương tự field "Nguồn" đang có
8. **Sheet/export data:** cho phép user chọn trường nào export ra (hiện chỉ có tên + SĐT)
9. **Import Excel (app file):** thêm cột "trạng thái" khi import, tận dụng API có sẵn

---

## 2. Phân tích yêu cầu chuyên sâu

### 2.1. Phân loại theo bản chất

| # | Yêu cầu | Loại | Phạm vi | Ưu tiên (đề xuất) |
|---|--------|------|---------|-------------------|
| R1 | Tạo N campaign batch + đặt tên | UX/FE + Campaign API | Reborn CRM | ★★★ |
| R2 | Webhook tách theo campaign_name | Backend logic (CRM core) | **Cloud BE** | ★★★ |
| R3 | Polling sliding window 3' TNEX→CR | Cron / scheduler mới | **Cloud BE + tích hợp TNEX** | ★★ |
| R4 | Dashboard report presale | FE (mới page) + API | Reborn CRM | ★★ |
| R5 | Tool claim/resync "chống quản vai" | Internal admin tool | **Cloud BE** | ★ |
| R6 | Multi-source customer (aggregate) | **Data model migration** | **Cloud BE** lớn | ★★★ (rủi ro cao) |
| R7 | Field + filter "campaign name" | Tận dụng custom-attribute đã có | Reborn CRM | ★★★ |
| R8 | Tùy chọn cột khi export Excel | FE + API | Reborn CRM | ★ |
| R9 | App file thêm cột trạng thái | Tận dụng API có sẵn | Reborn CRM | ★ |
| R10 | Data recall 30 ngày + chia theo năng lực | Business rule + scheduler | **Cloud BE** | ★ (chưa rõ định nghĩa) |

### 2.2. Phụ thuộc & rủi ro

- **R6 (multi-source) là yêu cầu rủi ro nhất.** Hiện tại data model `customer.sourceId` là **1-1** (singular). Chuyển sang **N-N** cần migration toàn bộ bảng `customer` + ảnh hưởng:
  - Mọi API list/filter đang dùng `sourceId=` (đã có bug history — xem `BUG-cashloan-source-mismatch.md`)
  - Logic "merge khi trùng SĐT" — phía Cloud BE
  - Báo cáo, dashboard, export hiện đang group theo single source
  - **→ KHÔNG nên xử lý 1 PR. Cần phase riêng.**

- **R2 (webhook tách campaign) là chìa khoá** để nhiều luồng marketing chạy song song không lẫn data. Đây là yêu cầu cấp thiết nhất để TNEX bắt đầu vận hành đợt marketing 10 campaign.

- **R3 (polling reconcile) là workaround cho bug webhook miss đã tồn tại 2 năm** ("Cái này 2 năm kia vẫn chưa xử lý cho chị" — file 8, dòng ~334). Trước khi build polling, **cần đo lại tỷ lệ miss** — có thể nguyên nhân gốc là retry logic của TNEX hoặc xử lý lỗi của CR (đã thảo luận trong họp). Polling tốn tài nguyên 5M record × 480 lần/ngày.

- **R1, R7 có thể tận dụng infrastructure hiện có:**
  - `CampaignService.exportCustomer` đã tồn tại (`src/services/CampaignService.ts:129`)
  - Custom attribute / extra info đã có (`CustomerExtraInfoService`, `CustomerAttributeService`)
  - Bộ lọc `customerExtraInfo[]` đã được dùng (xem `BUG-cashloan-source-mismatch.md` curl example)

- **R10 (chia theo năng lực sales) chưa có định nghĩa rõ:** "năng lực" = conversion rate? Trong khung thời gian nào? Tỷ lệ phân chia thế nào? **Cần làm rõ với chị Lan trước khi estimate.**

### 2.3. Câu hỏi cần làm rõ với TNEX (trước khi bắt tay làm)

1. **R6:** Khi 1 KH có 2 nguồn (A mobile, B web), khi sales filter "Nguồn = A" → KH đó có xuất hiện không? Khi chia data theo nguồn A, B độc lập, nếu cùng 1 sales lọc theo A và lọc theo B đều thấy KH X, có conflict ownership không?
2. **R1:** "10 campaign" là số cố định hay tham số? Mỗi campaign có khác nhau gì ngoài tên (template tin nhắn, kịch bản, time window)?
3. **R3:** Tần suất 3 phút có chấp nhận được nếu đo thấy webhook miss thực tế chỉ ~0.1%? Có thể giảm xuống polling on-demand không?
4. **R5:** "Chống quản vai" định nghĩa chính xác là gì? Là `ownership conflict` khi KH bị 2 sales claim cùng lúc, hay state machine bị stuck?
5. **R10:** Định nghĩa "năng lực sales" — chốt cụ thể tham số tính (số đơn / số gọi / conversion / weighted)?

---

## 3. Đánh giá giải pháp

### 3.1. Cấu trúc đề xuất — chia 4 phase

#### **Phase 1 (Quick wins, 1-2 tuần) — Reborn CRM (repo này)**
Xử lý các yêu cầu thuần FE / tận dụng API có sẵn:
- **R1:** UI tạo nhiều campaign batch trong 1 step + đặt tên hàng loạt
- **R7:** Thêm field "campaign_name" / "bên_name" vào `CustomerExtraInfo` schema → reuse cơ chế custom attribute hiện có để hiển thị + filter (tương tự `Trangthaikhoanvaycashloan`)
- **R8:** Modal chọn cột khi export Excel (UI tick các trường, lưu preset)
- **R9:** Thêm cột "trạng thái" vào template import Excel + validate

#### **Phase 2 (Webhook + reporting, 2-3 tuần) — Cloud BE + Reborn CRM**
- **R2:** Webhook routing theo `campaign_name`. Cấu trúc: 1 endpoint `/webhook/customer-status`, payload có `campaign_name` → router fan-out đến subscribers theo filter rule. Cho phép đăng ký nhiều subscriber/event qua bảng `webhook_subscription`.
- **R4:** Dashboard report cho presale — page mới trên Reborn CRM, gọi API thống kê (mới ở Cloud BE), filter theo campaign, export Excel.

#### **Phase 3 (Reconcile + tooling, 1-2 tuần) — chỉ Cloud BE**
- **R3:** Sliding-window polling 3' theo `updated_at` của customer. Lưu cursor + retry queue. **Nên đo miss rate trước khi quyết tần suất.**
- **R5:** Internal admin endpoint `POST /admin/customer/force-resync` nhận list phone → tự sync từ TNEX. UI nhỏ trong setting page.

#### **Phase 4 (Data model overhaul, 4-6 tuần) — Cloud BE LỚN, cần planning riêng**
- **R6:** Multi-source customer.
  - Tách `customer_source` thành bảng N-N: `customer_source_link(customer_id, source_id, first_seen_at, last_seen_at, channel)`.
  - "Cơ chế mật nâng cao": định nghĩa `merge_strategy` cho từng field (`override` | `aggregate` | `keep_first`).
  - Migration: backfill từ `customer.sourceId` hiện tại → first link.
  - Update toàn bộ filter API (`/customer/list_paid` và bạn bè) để accept `sourceIds` (đã có), nhưng query logic phải JOIN qua bảng link.
  - **Cần code freeze nhánh customer 1 sprint để migration**, không thể vừa làm vừa merge feature.
- **R10:** Có thể song song với Phase 4 nếu chốt được công thức.

### 3.2. So sánh option (cho R2 — webhook routing)

| Option | Mô tả | Pros | Cons |
|--------|-------|------|------|
| A. Multi-webhook subscription | 1 event → N webhook subscribers, mỗi sub có filter rule (campaign_name in [...]) | Đúng tinh thần "đăng ký nhiều webhook" mà Yến nói trong họp (~dòng 416). Cho phép TNEX + Reborn cùng lắng nghe | Thêm bảng + admin UI để quản lý subscription |
| B. Per-campaign webhook URL | Mỗi campaign tự config 1 URL | Đơn giản | Quản lý URL bừa bãi, khó audit |
| C. 1 webhook nhưng payload có routing key | Receiver tự route theo `campaign_name` trong body | Không đụng infra | Đẩy phức tạp về phía receiver, không scale |

→ **Khuyến nghị Option A.**

### 3.3. So sánh option (cho R6 — multi-source)

| Option | Mô tả | Pros | Cons |
|--------|-------|------|------|
| A. Bảng link N-N (`customer_source_link`) | Chuẩn relational | Sạch, flexible | Migration nặng, breaking change cho filter API |
| B. Cột `source_ids[]` (array) trên customer | Đơn giản hơn | Migration nhẹ | Khó filter hiệu quả nếu source > 10 nguồn, mất history (first_seen/last_seen) |
| C. Giữ `sourceId` (latest) + thêm bảng `customer_source_history` (append-only) | "Mật nâng cao" theo tinh thần họp — current source vẫn override, lịch sử aggregate | Cân bằng — không breaking, vẫn đủ data | Filter "đa nguồn" phức tạp hơn (cần subquery sang history) |

→ **Khuyến nghị Option C** vì:
- Khớp với từ "**aggregate**" / "**append**" chị TNEX dùng trong họp (dòng ~617)
- Không phá vỡ filter `sourceId=` hiện tại — giảm rủi ro regression
- Có timeline nguồn (first_seen, last_seen) phục vụ business rule "data 30 ngày recall"

---

## 4. Plan thực hiện (chờ duyệt)

### Trước khi bắt đầu code

1. **Hold meeting với chị Lan / anh TNEX** trong 30 phút để chốt 5 câu hỏi ở §2.3.
2. **Đo webhook miss rate hiện tại** trong 1 tuần (cần data từ Cloud BE) — quyết định Phase 3 polling có cần thiết / tần suất.
3. **Confirm phạm vi:** Repo này (`reborn-tnex`) là FE; phần BE phải làm trong repo `cloud/*` hoặc `crm-banking/*` — cần handoff issue cho team backend.

### Phase 1 — Quick wins (PR scope, FE-only) — repo `reborn-tnex`

| Task | File / vùng ảnh hưởng | Estimate |
|------|----------------------|----------|
| R1.1 Modal tạo bulk N campaign + đặt tên prefix (CAM1…CAMN) | `src/pages/CampaignMarketing/CampaignMarketingList.tsx`, mới `partials/ModalBulkCreateCampaign.tsx` | 1d |
| R1.2 Field "Tên đợt upload" khi import Excel + lưu vào campaign metadata | `src/pages/CampaignMarketing/...` + reuse `FileService.uploadFile` | 1d |
| R7.1 Thêm display column + filter cho `campaign_name` trong customer list | `src/pages/CustomerPerson/CustomerPersonList.tsx`, `src/services/CustomerService.ts` (extend `customerExtraInfo` filter — đã pattern sẵn cho cashloan) | 1d |
| R8.1 Modal "Chọn cột export Excel" | `src/pages/CustomerPerson/ModalExportCustomer/` (đã tồn tại — chỉ cần thêm cột picker) | 1d |
| R9.1 Template import Excel + cột "trạng thái" | tương tự, dùng `FileService` + thêm field validate | 0.5d |
| QA + regression test cho `customer/list_paid` (đã có bug history) | thủ công + checklist | 0.5d |

→ **Tổng Phase 1: ~5 ngày người (1 dev FE).**

### Phase 2 — Webhook + Dashboard report — repo `reborn-tnex` + handoff Cloud BE

| Task | Repo | Estimate |
|------|------|----------|
| R2 Webhook subscription model + routing theo campaign_name | **Cloud BE** (handoff issue) | 5d BE |
| R2 UI quản lý webhook subscription (Setting/Integration đã có sẵn) | `src/pages/SettingIntegration/Webhook/` | 1.5d FE |
| R4 API thống kê presale (tổng nghe / không nghe / status / filter campaign) | **Cloud BE** | 3d BE |
| R4 Page Dashboard Presale (mới) | `src/pages/Dashboard/...` | 3d FE |
| Integration test webhook E2E | cả 2 repo | 1d |

→ **Tổng Phase 2: ~5.5d FE + 8d BE.**

### Phase 3 — Reconcile polling + admin tool

| Task | Repo | Estimate |
|------|------|----------|
| R3 Cron 3' sliding window TNEX→CR (lưu cursor + retry table) | **Cloud BE only** | 4d BE |
| R3 Observability (Grafana panel webhook miss rate, retry queue depth) | infra | 1d |
| R5 Admin endpoint force-resync + UI nhỏ | Cloud BE 2d + FE 1d | 3d |

→ **Tổng Phase 3: ~7d BE + 1d FE.**

### Phase 4 — Multi-source customer (planning riêng)

Không estimate chi tiết ở doc này — **đề nghị họp design 1 buổi riêng** sau khi xong Phase 1-2, để có data thực tế từ R7 (campaign_name field) trước khi commit data model migration.

### Trật tự release đề xuất

```
W1-W2 : Phase 1 → release v1, demo cho TNEX
W3-W5 : Phase 2 → release v2 với webhook + dashboard
W4-W5 : Phase 3 (song song nửa cuối Phase 2)
W6+   : Phase 4 sau khi planning riêng
```

---

## 5. Việc cần CEO duyệt

1. **Phạm vi Phase 1** có đúng ý không? (5 task, ~5 ngày FE)
2. Có nên **bắt đầu Phase 1 ngay** trong khi chờ chốt câu hỏi cho Phase 4 (R6 multi-source)?
3. **Bug R6 multi-source** là yêu cầu lớn nhất nhưng rủi ro cao — có muốn:
   - (a) Đánh upfront vào ngay Phase 1 với option C (history table), hay
   - (b) Tách hẳn Phase 4 và chờ design meeting?
4. **Handoff Cloud BE**: dự án `reborn-tnex` này không sửa được BE → cần raise issue/handoff sang repo `cloud/*` hay `crm-banking/*`. Xác nhận team nào đảm nhận BE side?
5. **Câu hỏi cho TNEX (§2.3)**: CEO chốt giúp / chuyển cho PM hỏi chị Lan?

---

*Tài liệu này được tạo từ transcript audio bằng faster-whisper (medium model). ASR có thể có sai sót — vui lòng nghe lại audio gốc nếu chỗ nào nghi ngờ.*
