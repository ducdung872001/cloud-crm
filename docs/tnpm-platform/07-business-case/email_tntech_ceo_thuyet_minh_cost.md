# Email gửi CEO TNTech — Thuyết minh chi phí nền tảng TNPM

> Phiên bản nháp 2026-05-11. User: Phan Dung — CEO Reborn JSC (ecosystem.reborn.vn).
> Đính kèm: `THUYET_MINH_CHI_PHI_NEN_TANG_TNPM.docx` + `COST_ESTIMATE.xlsx`.
> **Cần điền** trước khi gửi: tên người nhận, mức xưng hô (anh/chị), tên TNPM contact nếu có, thời gian đề xuất họp.

---

## Phương án 1 — Email chính thức (khuyến nghị)

**Subject:** [Reborn × TNTech] Thuyết minh chi phí nền tảng TNPM Property Management — đề xuất buổi align trước khi chào khách

**To:** [ceo@tntech.vn — tên CEO TNTech]
**Cc:** [danh sách lead Reborn + TNTech tham gia deal TNPM]
**Attachments:**
- `THUYET_MINH_CHI_PHI_NEN_TANG_TNPM.docx`
- `COST_ESTIMATE.xlsx`

---

Kính gửi Anh **[Tên CEO TNTech]**,

Như đã trao đổi về cơ hội cùng triển khai nền tảng Property Management cho TNPM (ROX Key) làm khách hàng đầu tiên, tôi xin gửi Anh **bản thuyết minh chi phí** mà team Reborn đã bóc tách dựa trên HLD v2.0 do TNPM cung cấp + đối chiếu prototype hiện có trên nhánh `reborn-tnpm`.

**Có hai con số then chốt cần Anh và team TNTech phân biệt rõ trước khi đi đến pricing với TNPM:**

| | Bản chất | Giá trị |
|---|---|---:|
| **5.63 tỷ VND** | Chi phí Reborn xây platform core thuần (Direct Labor — 143 man-month). Đây là IP creation, Reborn ghi nhận R&D investment. | ≈ $230k USD |
| **8.16 tỷ VND** | Tổng giá trị tạo ra cho TNPM trong lần rollout đầu — đã bao gồm TNTech consulting/rollout, infra build period, 3rd-party cert, contingency buffer, project overhead. | ≈ $333k USD |

Ý nghĩa thương mại:
- **5.63 tỷ** là khoản Reborn đầu tư tạo IP — không lặp lại cho khách hàng sau, sẽ amortize qua TNPM + 2-3 khách hàng tiếp theo.
- **8.16 tỷ** là cơ sở fair value để Reborn × TNTech cùng align tỉ lệ TNPM trả + phần chúng ta absorb như đầu tư mở thị trường.
- Đề xuất sơ bộ: TNPM trả **5.0-6.0 tỷ** (60-75% của 8.16 tỷ), Reborn + TNTech absorb 2.2-3.2 tỷ. Khoản absorb này thu hồi qua OPEX recurring TNPM (~17.4 tỷ/năm SaaS) + khách hàng tương lai.

**Phạm vi cụ thể** trong 8.16 tỷ (chi tiết trong docx):
- Web Admin 31+ trang nghiệp vụ + Owner/Vendor Portal.
- 12 microservice backend (152 endpoint, 62% phải build mới do đặc thù lease/CAM/turnover/vendor/B2G).
- Tích hợp MSB Pay, App Timi, VNPay, MoMo, sInvoice, SMS, Zalo OA, Email.
- Multi-tenant, audit log NHNN compliance, pentest 1 round, 30 ngày warranty.
- Áp dụng đủ cho 7 loại bất động sản TNPM đang vận hành.
- **Không** bao gồm: mobile cư dân (+1.5 tỷ), AI debt analytics (+800M), POS integration, data migration — tính riêng nếu TNPM yêu cầu.

**Timeline:** Build platform ~6-9 tháng calendar (team 9-11 người parallel). Sau khi build xong mới đi vào 4 phase × 20 tuần rollout theo HLD của TNPM.

**Đề xuất bước tiếp theo:**
1. Anh và team TNTech review bản thuyết minh + file xlsx (sheet `Effort_by_Module` và `OPEX_Summary` là 2 sheet quan trọng nhất).
2. Mời Anh dành cho team Reborn **1 buổi 90 phút trong tuần [tuần đề xuất]** để cùng chốt 3 câu hỏi:
   - Mức TNTech contribute effort (rate, role, timeline)?
   - Engagement model giữa Reborn và TNTech (Option A: Reborn 100% build–TNTech sale; Option B: Co-development; Option C: JV; Option D: License+Service)?
   - Mức TNPM trả mục tiêu (5.0 / 5.5 / 6.0 tỷ phần build) + chiến lược OPEX 3 năm?
3. Sau buổi này, Reborn sẽ chuẩn bị bản proposal commercial chính thức để chúng ta cùng đi gặp TNPM.

Tôi đính kèm:
- **`THUYET_MINH_CHI_PHI_NEN_TANG_TNPM.docx`** — bản thuyết minh đầy đủ 7 phần + danh sách feature scope.
- **`COST_ESTIMATE.xlsx`** — 9 sheet tương tác (5 sheet CAPEX + 4 sheet OPEX). Anh và team TNTech có thể chỉnh tham số trực tiếp (rate role, contingency %, segment quy mô TNPM) và xem impact lên TCO ngay.

Rất mong nhận phản hồi sớm để chúng ta kịp chốt deal với TNPM trong quý này.

Trân trọng,

**Phan Dung**
CEO — Reborn JSC
ecosystem.reborn.vn
ceo@reborn.vn
[số điện thoại]

---

## Phương án 2 — Email ngắn (khi đã quen, gửi để mở thread)

**Subject:** TNPM cost — 5.63 tỷ vs 8.16 tỷ, cần Anh review trước buổi họp tuần sau

Anh [Tên],

Gửi Anh bản thuyết minh chi phí cho deal TNPM mà team Reborn vừa hoàn thành. Hai con số Anh nhớ:

- **5.63 tỷ** = Reborn xây platform thuần (143 man-month).
- **8.16 tỷ** = giá trị tạo ra cho TNPM lần rollout đầu (đã gồm TNTech effort + buffer + overhead).

Đề xuất TNPM trả **5.0-6.0 tỷ phần build** + ~17.4 tỷ/năm OPEX SaaS managed.

Anh review docx + xlsx đính kèm, tuần sau mình họp 90 phút để chốt:
1. TNTech contribute bao nhiêu effort?
2. Engagement model nào (4 option trong file 07-business-case)?
3. Số chốt chào TNPM?

Đính kèm:
- `THUYET_MINH_CHI_PHI_NEN_TANG_TNPM.docx`
- `COST_ESTIMATE.xlsx`

Cảm ơn Anh.

Phan Dung
CEO Reborn JSC

---

## Phương án 3 — Email follow-up (sau khi đã gặp lần 1, gửi tài liệu chi tiết)

**Subject:** Re: TNPM deal — bản thuyết minh chi phí chi tiết như đã trao đổi

Anh [Tên],

Như đã thống nhất trong buổi gặp [ngày X], em gửi Anh bản thuyết minh đầy đủ về cost basis cho deal TNPM.

Hai điểm quan trọng cần Anh và team TNTech nắm:

1. **Phân biệt 5.63 tỷ vs 8.16 tỷ** — chi tiết phần 3 và 4 trong docx. Đây là phân biệt cốt lõi để chúng ta align cách chia phí Reborn × TNTech và cách trình bày với TNPM.

2. **Cấu phần TNTech effort** đã được Reborn dự trù khoảng 1.5-2.0 tỷ trong nhóm Indirect + Cross-cutting (customer relationship, domain consulting, rollout management, training, local support). Anh xem giúp con số này đã hợp lý với kế hoạch nhân sự bên TNTech chưa, hoặc cần điều chỉnh.

3. **Open question** cần Anh trả lời:
   - TNTech sẵn sàng absorb bao nhiêu trong 2.2-3.2 tỷ first-customer subsidy?
   - Có muốn thêm scope ngoài 8.16 tỷ (mobile, AI debt, on-premise) ngay từ đầu hay phase sau?
   - Tỉ lệ chia OPEX margin năm 1-3?

Em đề xuất chúng ta có buổi follow-up **[ngày Y]** để chốt 3 câu trên + bắt đầu draft proposal commercial cho TNPM.

Đính kèm:
- `THUYET_MINH_CHI_PHI_NEN_TANG_TNPM.docx`
- `COST_ESTIMATE.xlsx`
- Link tài liệu navigation: `docs/tnpm-platform/README.md`

Trân trọng,

Phan Dung
CEO Reborn JSC
ceo@reborn.vn

---

## Lưu ý khi gửi

- **Format tốt nhất**: PDF hoá docx + xlsx giữ nguyên (Excel macro-free để TNTech mở dễ trên mọi máy).
- **Bcc**: nội bộ Reborn (legal + finance + delivery lead) để có audit trail.
- **Timing**: gửi sáng thứ Hai/Ba — tránh chiều thứ Sáu và cuối tuần.
- **Follow-up**: nếu không phản hồi trong 3 ngày làm việc, gọi điện trực tiếp thay vì email reminder.
- **Tránh**: nhắc giá chào TNPM trong email này — đó là nội dung buổi họp nội bộ, không nên ghi văn bản trước khi 2 bên align.
