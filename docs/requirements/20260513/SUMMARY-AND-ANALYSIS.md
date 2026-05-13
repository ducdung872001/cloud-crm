# Vincom Center 10 — Họp định hướng FitPro (2026-05-13)

> **Nguồn:** `Vincom Center 10.m4a` — **toàn bộ 1h25m56s đều có nội dung**.
> **Lưu ý quan trọng:** Bản tóm tắt + transcript hiện tại là **kết quả lần ASR thứ 2** với `vad_filter=False`. Lần đầu (vad_filter mặc định) đã bỏ qua ~62 phút giọng nói thật (do âm bé/xa mic, VAD whisper coi là non-speech) → kết quả sai lệch trầm trọng. Lần 2 chạy 76 phút wall, ra 1494 segment (gấp đôi lần 1 = 723). Sau khi cắt 12 dòng hallucinate "đăng ký kênh…" + nén 40 dãy dòng trùng lặp → còn 1442 dòng.
> **ASR:** `faster-whisper medium`, Vietnamese, int8 CPU, `vad_filter=False`, `condition_on_previous_text=False`, beam=5, temperature fallback `[0.0, 0.2, 0.4, 0.6]`.
> **Cảnh báo chất lượng:** ASR mạnh hơn nhưng vẫn sai nhiều thuật ngữ. Một số phiên âm cần đối chiếu SRT/audio gốc khi đưa lên SOP:
>
> | Phiên âm ASR | Khả năng thực tế |
> |---|---|
> | cô coder / cô father / cô forward / phỏ founder | **Co-Founder** |
> | cốt / bốt / quốc / cô / code | **Coach** (HLV) |
> | Kipro / Fipro / Vipro / Bitpro / Kipro / KPRO | **FitPro** |
> | set-tơ / setter | **Center** (cơ sở vật lý) |
> | hap lai / hop lite / Plot lai / Apple Line / Hopper Lite / HubLine | **Herbalife** |
> | Nha lít / Element / Nha Liz | **Elite** (member tier) |
> | bắt lý / bắc lý | **pilot** |
> | mật băng | **PT đông cốt? (cần đối chiếu)** |
> | gò F người | **gò ép người vào** |
>
> **Bên tham gia (suy đoán từ ngữ cảnh):**
> - **Anh Dũng** — founder FitPro, có sẵn center vật lý ở Sài Gòn (~chục tỷ đầu tư), người vận hành chính.
> - **Anh Ngọc** — mentor chiến lược (nguyên lý: "xem trong nhân thức của mình", "phú thịnh / phú suy", "xây như không xây").
> - **Anh Thắng** — chuyên gia đào tạo (đã làm 10 trường cấp chính trị), sẽ phụ trách phần xây chương trình giáo dục cho Coach.
> - **"Em"** — đối thoại chính, phụ trách công nghệ (rất khả năng là CEO Reborn — ceo@reborn.vn).
> - **Cường** — chủ doanh nghiệp **Egypt** trong cộng đồng Quan, vừa trở thành khách hàng FitPro đầu tiên (đã chuyển 7.8 — đơn vị không rõ), cá nhân nhắm Ironman 2027 + xây "200 Ironman" trong Egypt.
> - **Đại Nga** — "ngôi đồng" (quản trị/định hướng); cùng anh em ngồi phần kết nối.
> - **Linh** — partner trong cộng đồng (nhà gần Egypt, có nhà với anh Ngọc xưa đi chơi uống).

---

## 1. Tóm tắt nội dung

Buổi này là **vision + architecture alignment** dài 1h25, có giá trị **rất cao về requirement** — vượt xa nhận định ban đầu (v1) là "chỉ vision không có tech". Nội dung tách thành 8 chủ đề lớn, sắp xếp theo trình tự thời gian gần đúng:

### 1.1. Bối cảnh founder + triết lý "sân chơi" (0–8 phút)

Anh Dũng đã đầu tư hơn chục tỷ tự xây center vật lý, định bán → đã đào xong. Giờ chuyển hướng: thay vì kinh doanh đơn lẻ, **dùng center làm sân chơi** để anh em vào với tư thế chủ (mỗi người chỉ cần góp 10–30 triệu / cái). Triết lý "**bao la, nhu cầu xã hội nhiều, ai giải quyết được thì người đó kiếm**".

### 1.2. Lộ trình con người + 4 tầng mục tiêu (8–14 phút)

Anh Ngọc chốt lộ trình ưu tiên cho khách:

```
Sức khỏe thân thể  →  Mối quan hệ  →  Mũ tâm  →  Tài chính
   (gốc rễ)            (cọng cố)       (đỉnh)       (nếu cần)
```

- Hai tầng đầu tác động trực tiếp lên mũ tâm.
- Khách giàu sẵn → chỉ cần 3 tầng đầu.
- Sau khi cá nhân ổn → đẩy lên PT → Co-founder (mở hệ thống nhỏ riêng, ăn % từ doanh số).

### 1.3. Hình học center 7+14 + cô-founder dynamics (14–22 phút)

- Mỗi center có **21 nhà / 24 người**: 7 host trên (F1, "vùng bỏ chậm") + 14 con cháu (F2).
- 7 host **không cần có mặt** ở center hằng ngày — center vận hành **tự động** qua 14 coach.
- Khi 7 host thoát ra (center tự chạy) → họ ra mở center mới → vòng lặp.
- **Co-founder** = người sáng lập ra center, **không** phải người đến tập hàng ngày.
- Khác biệt với "phỏ-founder" giả tạo (3.6 triệu / 5 ngày học → cấp chứng nhận): Co-founder của FitPro phải có cộng đồng thật + nhà riêng + dây 7 người + center.

### 1.4. Building Mode + thay đổi thói quen (~22 phút, chen giữa các phần)

(Đã ghi trong v1 — vẫn đúng.) App phải nhắc liên tục, có avatar có cảm xúc khi miss (Duolingo-style). Pain point chính: **thay đổi thói quen sức khỏe**.

### 1.5. ★ HỆ THỐNG 5 CẤP MEMBERSHIP (32–60 phút) — TRỌNG TÂM TECH

Đây là **phần quan trọng nhất** mà v1 đã bỏ sót hoàn toàn. Anh Ngọc + Em cùng anh Dũng định nghĩa **5 cấp rõ ràng** với điều kiện chuyển cấp:

```
Trial (7 ngày miễn phí)
  ↓ thấy thích, muốn dùng tiếp
VIP Member (gói 30 ngày)  ← dùng được tất cả trung tâm FitPro toàn quốc, KHÔNG kinh doanh
  ↓ muốn kinh doanh / gửi khách
Elite Member                ← có mã kinh doanh, 2 mã: (1) FitPro core, (2) Herbalife optional
  ↓ có trải nghiệm + cơ thể đạt chuẩn + được qualify
Coach (HLV)                 ← Đào tạo + verify chứng chỉ; có thể nâng từ Elite hoặc tuyển ngoài
  ↓ + có dây 7 nhà (mã N) + có center
Co-Founder                  ← Người sáng lập center, vận hành tự động
```

**Quan trọng**:
- **Coach KHÔNG bắt buộc qua Elite** — có thể là người ngoài hoàn toàn được FitPro train + verify.
- **Co-Founder KHÔNG bắt buộc qua Coach** — một Elite có cộng đồng + nhà + center cũng có thể thành Co-Founder.
- Đây là **graph chuyển trạng thái** (state diagram), không phải linear ladder. CEO yêu cầu: anh Dũng phải vẽ rõ **4 hành trình** + **relationship giữa các role** (line 1056-1060):
  - Hành trình thành VIP Member
  - Hành trình thành Elite
  - Hành trình thành Coach
  - Hành trình thành Co-Founder

### 1.6. ★ Tách 2 luồng: Member vs Coach (60–70 phút)

Một quyết định kiến trúc lớn: **không gộp Customer + Coach vào 1 lùng**. Lý do:

- Nếu gộp, mọi flow "lên Elite/Coach" sẽ trông như **ép user kinh doanh** → cảm giác đa cấp.
- Tách → mỗi luồng có game riêng. Coach có lộ trình huấn luyện/chứng chỉ/nguồn dữ liệu; Member có lộ trình kết quả (giảm cân, khỏe, đẹp).
- 2 luồng **giao thoa tự nhiên** thông qua "kinh doanh optional" — khi Coach thấy hiệu quả, có thể chuyển luồng thành Elite Member để kinh doanh.

### 1.7. ★ Herbalife là OPTIONAL, không phải lệ thuộc (50–65 phút xen kẽ)

Pain point cụ thể của anh Dũng: **không muốn lệ thuộc Herbalife** để cấp mã kinh doanh cho thành viên. Đây là **point-of-failure** đe doạ toàn hệ thống.

**Giải pháp kiến trúc**:
- FitPro **tự cấp mã kinh doanh** cho Elite (mã FitPro).
- Herbalife là **1 partner** — Elite có thể tích option để có thêm mã Herbalife, kinh doanh sản phẩm Herbalife song song.
- **2 dòng tiền độc lập**: doanh thu FitPro + doanh thu Herbalife.
- Sau này có thể plug-in **nhiều supplier khác** (A, B, C, …) — mỗi supplier là 1 partnership riêng.

### 1.8. ★ Marketplace cho Coach (cá nhân hoá sản phẩm) — 70–80 phút

Tầm nhìn xa hơn: khi Coach trưởng thành → cho phép **upload sản phẩm phù hợp** lên marketplace của FitPro. Mô hình "**phác đồ điều trị của bác sĩ**": mỗi Coach cá nhân hoá ladder sản phẩm cho khách. FitPro vẫn verify (gate) chất lượng sản phẩm và cấp mã, nhưng không bắt buộc 1 supplier.

### 1.9. ★ Coach Qualification + Education tách riêng (60–75 phút)

CEO khuyến nghị **không gánh cả 3** (Đào tạo + Vận hành + Công nghệ):

| Vai trò | Chủ trách | Output |
|---|---|---|
| Vận hành center | **Anh Dũng** | Center, scale chi nhánh, business |
| Đào tạo Coach + verify chứng chỉ | **Anh Thắng** + đội (PC?) | Curriculum, chương trình, chứng chỉ |
| Công nghệ + platform | **Em (Reborn)** | App, hệ thống quản trị, marketplace |
| B2B partnership + sự kiện | **Cường + Egypt** | Marathon, Ironman event, B2B onboard |
| Ngôi đồng (quản trị/định hướng) | **Đại Nga + ngôi đồng** | Định hướng tổng |

Lý do: nếu anh Dũng gánh cả Đào tạo + Vận hành + Code train + Live thì sẽ **gãy** ở Phase 1. Đào tạo có thể **outsource** một phần — kết nối **trường nutrition code** (nơi "em" đã học) để cấp chứng chỉ chính thức cho Coach (line 668-670).

### 1.10. ★ UAT thực tế ở FitClub (kế hoạch hành động cụ thể) — 32–40 phút

Quyết định hành động **trong tuần**:

- Anh Dũng tìm 1 center FitClub trong cộng đồng Quan (có sẵn ~1000 cơ sở) ở khu Quân Nhân, >100m².
- **Tối mai (T5/14)** hoặc tối T5 tuần này — cả nhóm đến trải nghiệm.
- Mục đích: nhìn bức tranh tổng thể + tìm điểm yếu của FitClub + làm "UAT thực tế" của mô hình FitPro.
- Anh Thắng + Em + (có thể Cường) cùng đi → ghi nhận quy trình hiện tại của FitClub → từ đó **đề xuất phần cần công nghệ vs phần để offline**.

### 1.11. Pay-flow + nền tảng fee (~58 phút)

- Anh Ngọc gợi ý mô hình thu phí **per-center cho nền tảng**:
  - Nền tảng FitPro: **~4.5 triệu/tháng/setup** (cố định, biết trước).
  - Center: doanh thu cao hơn nhiều **(không kiểm soát được)**.
- Cấu trúc: 3 nguồn thu cho Coach (line 818-820):
  1. Tiền công bán sản phẩm (per-sale).
  2. Add-on (mặt bằng, công lao động).
  3. Doanh thu thêm khi tích vào supplier.

### 1.12. ★ Tham chiếu "ecosystem 2-node" (Platform Revolution) — 80–85 phút

CEO trích từ sách *Platform Revolution* (Networking Effect): hệ sinh thái chỉ cần **2 đối tượng tối thiểu** để tạo Network Effect:

- 2 đối tượng FitPro: **Coach ↔ Customer**.
- Khi 2 ông này gặp nhau → mọi vai trò xung quanh (Elite, Co-Founder, partner, supplier) tự đến.
- Đừng tập trung vào nhiều đối tượng — "**bệnh viện chỉ cần 2: bác sĩ ngồi + bệnh nhân**". Tương tự ở đây.

---

## 2. Phân loại ý tưởng: chiến lược vs kỹ thuật

### 2.1. Thuần chiến lược / kinh doanh

- Triết lý "phú thịnh / phú suy".
- Hình học 7+14 (đã là **quy ước nghiệp vụ** sẵn của Network Tree — không phải tính năng mới).
- Marathon → Ironman pathway (ý tưởng truyền thông).
- Cường + Egypt làm pilot B2B.
- "Xây như không xây", "đỉnh cao là tự động".

### 2.2. Có chiều kỹ thuật rõ — Bảng đánh giá

| # | Đề xuất | Trạng thái roadmap | Phạm vi tác động | Ưu tiên | Rủi ro |
|---|---------|--------------------|------------------|---------|--------|
| **P1** | "Building Mode" — avatar có cảm xúc + cadence | Mở rộng Phase 1.9 + Phase 3.3 | FE PWA + BE notification engine | ★★★ | Trung |
| **P2** | FitPro Insight (B2B in-company) | Trùng Phase 4.1–4.3 | BE corporate account | ★★ | Thấp |
| **P3** | HLV / Coach rotation pool + curriculum 10 buổi | **Mới** | Mới + tận dụng cloud-org | ★★ | Trung |
| **P4** | "Đua Nhà N vs H" leaderboard | Mở rộng Phase 3.3 | FE leaderboard + BE scoring | ★★ | Trung |
| **P5** | Marathon → Ironman pathway tracking | **Mới** | FE JourneyTracker + BE goal entity | ★ | Thấp |
| **P6** | **★ State graph Customer→VIP→Elite→Coach→Co-Founder** | **Mới — định nghĩa rõ hơn** | **BE schema lớn + FE 4 luồng + workflow approval** | **★★★** | **Cao** |
| **P7** | Wire `fitpro-network` mock → API thật | Trùng Phase 1.3 | FE + BE | ★★★ | Thấp |
| **P8** | Re-engagement sau 3–5 ngày inactive | Trùng (gộp P1) | (gộp) | ★★ | Trung |
| **P9** | **★ Supplier abstraction (Herbalife = optional)** | **Mới** | **BE product catalog + partner integration layer** | **★★★** | **Cao** |
| **P10** | **★ Coach Marketplace (cá nhân hoá sản phẩm)** | **Mới** | **BE marketplace + verify gate** | ★ (sau P9) | Cao |
| **P11** | **★ Coach qualification + chứng chỉ flow** | **Mới** | **BE workflow approval + integration trường đào tạo** | ★★ | Trung |
| **P12** | **★ Tách 2 luồng Member vs Coach (UX architecture)** | **Mới — design decision** | **FE 2 luồng + nav + state model** | **★★★** | Trung |

**11 đề xuất có chiều kỹ thuật.** Trong đó:
- 3 trùng / mở rộng roadmap có sẵn (P1, P2, P4 + P7 + P8 gộp).
- **6 thực sự mới hoặc cần re-define lớn**: P3 (HLV rotation), P5 (Ironman pathway), **P6 (state graph 5 cấp)**, **P9 (supplier abstraction)**, **P10 (Coach marketplace)**, **P11 (Coach qualification)**, **P12 (dual-track UX)**.

---

## 3. Phân tích chi tiết các đề xuất kỹ thuật

> Mục tiêu: **chỉ đánh giá** tác động, chưa thực hiện. Mỗi mục: file/module ảnh hưởng, công sức ước lượng, dependency, decision-point cho CEO.

### 3.1. P6 — State Graph 5 cấp Membership (CHỦ ĐẠO)

Đây là **đề xuất cốt lõi nhất** của buổi họp này. Tất cả các đề xuất khác (P1, P3, P9-12) đều **phụ thuộc** vào việc chốt P6 trước.

**Cần xây**:
- BE: enum `member_tier`: `TRIAL` / `VIP_MEMBER` / `ELITE_MEMBER` / `COACH` / `CO_FOUNDER`.
- BE: bảng `tier_transition` log — ai chuyển từ tier nào sang tier nào, ai duyệt, khi nào.
- BE: workflow approval cho 3 transition cần qualify:
  - VIP → Elite: cần cấp **mã kinh doanh FitPro**.
  - Elite → Coach: cần verify (cơ thể, kết quả, chứng chỉ).
  - Coach → Co-Founder: cần verify (dây 7 nhà mã N + có center).
- FE: 4 trang lộ trình + 1 trang relationship/graph quản trị.

**File ảnh hưởng (FE)**:
- Mới: `src/pages/CommunityHub/MembershipJourney/` (chưa có).
- Sửa: `src/pages/CommunityHub/MembershipPlanSettings/` (hiện đang là plan, không phải tier — cần phân biệt rõ **plan = gói mua** vs **tier = vai trò**).
- Mới: `src/pages/CommunityHub/TierTransitionConsole/` (cho admin duyệt).
- Sửa: `src/mocks/community-hub/membership-plans.ts` → thêm field `requiredTier`, `unlocksRights`.

**File ảnh hưởng (BE — cloud-customer hoặc cloud-org)**:
- Schema migration: `customer.tier` enum + history table.
- Service mới: `MemberTierService` (transition + approval).
- API: `POST /customer/tier/request` + `POST /customer/tier/approve`.
- Phụ thuộc: **cloud-org migration** (notice #214) đã xong → có thể đặt vào cloud-org domain.

**Ước lượng**:
- Schema + migration + tests: 2 ngày BE.
- Workflow approval engine: 3 ngày BE.
- 4 trang FE journey + 1 trang admin: 5 ngày FE.
- **Tổng:** ~2 tuần cho 1 FE + 1 BE.

**Phụ thuộc**:
- Cần CEO **vẽ rõ 4 hành trình + relationship matrix** trước (line 1056-1060 đã yêu cầu). Đây là **business artifact**, không phải code.

**Rủi ro**:
- **Cao** — đụng trực tiếp tới phân chia hoa hồng. Một user lên Elite trước khi định nghĩa % hoa hồng cho Elite → đối soát tháng đầu sẽ vỡ. **Tuyệt đối phải định nghĩa rights matrix trước**.
- Nếu sửa enum sau khi đã có dữ liệu thật → migration đau.

**Decision-point CEO**:
1. Vẽ **state diagram** chính thức của 5 cấp (đề nghị workshop riêng).
2. Rights matrix: tier nào được làm gì (kinh doanh, gửi khách, mở center, ăn hoa hồng %, marketplace).
3. Có **giảm cấp** (downgrade) không? Khi nào? Ai duyệt?
4. Co-Founder có **expire** không (ví dụ center không hoạt động 6 tháng → revoke)?

---

### 3.2. P12 — Tách 2 luồng UX: Member vs Coach

Phụ thuộc P6. Ở mức UX, đây là **decision lớn về information architecture**:

**Cần xây**:
- FE: 2 root navigation tách biệt (`/member/*` và `/coach/*`), hoặc 1 root với context-switcher cho user vừa Coach vừa Member.
- BE: 1 user có thể có **đồng thời** 2 role active (Coach của FitPro + cá nhân là VIP Member).
- Logic: khi 1 user lên Elite + Coach đồng thời → app phải tự switch context.

**File ảnh hưởng**:
- FE: `src/router/`, `src/layouts/`, nav components.
- BE: `customer.tier` cho phép multi-active hay single-active? (decision).

**Ước lượng**: ~1 tuần FE + 2 ngày BE.

**Phụ thuộc**: P6 trước.

**Rủi ro**: Trung — chủ yếu UX design, không phải tech.

**Decision-point CEO**: 1 user có thể đồng thời là Coach + Co-Founder không? Yes, line 909 "Cô Father có cần về là Cốt không? Không cần" → cho phép multi.

---

### 3.3. P9 — Supplier Abstraction (Herbalife = 1 trong N)

Đây là **architectural cleanup** — đảm bảo Herbalife không phải hardcoded.

**Cần xây**:
- BE: bảng `supplier` (id, name, status, contract_terms, commission_rate).
- BE: bảng `product` linked to `supplier_id` (đã có ở `cloud-customer`?).
- BE: bảng `member_supplier_code` — 1 Elite có thể có N supplier codes (FitPro tự cấp + Herbalife + future).
- BE: API quản lý supplier (add new, deactivate, switch).
- FE: trang `/admin/suppliers` — CRUD supplier; FE `/coach/products` filter theo supplier.

**File ảnh hưởng**:
- Hiện không thấy `supplier` model trong FE — cần grep BE để xác nhận.
- Catalog đang dùng `inventory.product` (theo Phase 1.4) → cần audit schema có `supplierId` chưa.

**Ước lượng**:
- Schema + migration: 2 ngày BE.
- API + admin UI: 3 ngày FE+BE.
- Refactor catalog hiện tại để route qua supplier: 2 ngày.
- **Tổng:** ~1.5 tuần.

**Phụ thuộc**:
- Phụ thuộc P6 (vì cấp mã supplier phụ thuộc tier).
- Cần Phase 2 (hoa hồng engine) phối hợp để mỗi supplier có rule % riêng.

**Rủi ro**:
- **Cao** — nếu đã có data thật vào product/customer với Herbalife hardcoded, migration sẽ phức tạp.
- Khuyến nghị: làm sớm, **trước khi có data sản xuất**, kể cả khi v1 chỉ có 1 supplier (Herbalife).

**Decision-point CEO**:
1. Có cho phép multi-supplier ngay từ v1 không? (đề nghị có — chi phí thấp khi chưa có data).
2. Mỗi Coach được nhận mã của bao nhiêu supplier max?
3. Khi supplier rút lui (chấm dứt hợp đồng), data hiện hữu xử lý sao?

---

### 3.4. P10 — Coach Marketplace

**Phụ thuộc P9.** Khi đã có abstraction supplier → Coach có thể chính là 1 "supplier" cho sản phẩm cá nhân hoá.

**Cần xây**:
- BE: bảng `marketplace_listing` (coach_id, product_template, price, status: pending_verify / approved / suspended).
- BE: verify workflow (FitPro duyệt từng listing).
- FE: trang Coach upload product + trang Customer browse.

**Ước lượng**: ~2 tuần (Phase 4 trong roadmap hiện tại — phù hợp).

**Phụ thuộc**: P9 phải xong trước. P11 (qualification) song song.

**Rủi ro**:
- **Cao** — pháp lý + nội dung. Coach upload sản phẩm health/supplement → FitPro chịu trách nhiệm gì? Cần đội verify chuyên môn.
- Hoãn — đợi cá nhân hoá thực sự cần thiết (sau Phase 2).

**Decision-point CEO**: ai chịu trách nhiệm pháp lý cho sản phẩm trên marketplace?

---

### 3.5. P11 — Coach Qualification + Chứng chỉ

**Cần xây**:
- BE: bảng `coach_certification` (coach_id, program_id, status, issuer, valid_until).
- BE: workflow: đăng ký → hoàn thành chương trình → cấp chứng chỉ → re-verify định kỳ (line 1395-1396).
- BE: integration với **trường đào tạo bên ngoài** — API cấp chứng chỉ + verify.
- FE: trang Coach upload bằng cấp + trang FitPro admin duyệt.

**File ảnh hưởng**:
- Có thể tận dụng `src/pages/CommunityHub/Courses/` đã có mock.
- Mở rộng `customer` schema BE thêm `coach_attributes`.

**Ước lượng**:
- Schema + workflow: 3 ngày BE.
- UI upload + duyệt: 3 ngày FE.
- API integration trường nutrition code: 5–10 ngày (phụ thuộc bên kia).
- **Tổng:** ~2 tuần (không tính trường ngoài).

**Phụ thuộc**: P6 (tier).

**Rủi ro**:
- Trung — chủ yếu chậm vì phải đàm phán với trường nutrition code (đang có "em" có quan hệ — line 668).

**Decision-point CEO**:
1. Trường nutrition code có sẵn sàng cấp API/portal hợp tác?
2. Re-verify Coach mỗi 6 tháng / 1 năm? Tiêu chí?
3. Coach không qualify → suspend hay revoke?

---

### 3.6. P3 — HLV / Coach Rotation Pool + Curriculum 10 buổi

(Đã đánh giá trong summary v1 — vẫn đúng, **bổ sung thêm**:)

Buổi này chốt thêm: curriculum **10 buổi cố định** (line 442-450 cũ + line 1393-1395 mới) gắn với từng doanh nghiệp khách hàng:

> "Anh nói hôm nay là buổi đào tạo số 7 cho công ty Tien Tech" → HLV mới đến biết ngay nội dung phải giảng.

**Cần xây**:
- BE: `coach_curriculum` (10 lesson cố định, thay đổi version control), `coach_assignment` (HLV ↔ khách ↔ slot), `lesson_session` (buổi N của khách K, ai đã giảng).
- Logic substitution: HLV A nghỉ → HLV B tiếp đúng buổi `lesson_number=N` cho khách K (USP của transcript).

**Ước lượng**: ~1.5 tuần 1 FE + 1 BE.

**Phụ thuộc**: P11 (qualification — chỉ Coach qualified mới được assign).

**Rủi ro**: như summary v1.

**Decision-point CEO**:
- Curriculum 10 buổi **flat** (ai cũng học 1→10) hay **tier theo gói** (basic 5 buổi / premium 10)?
- HLV lương cố định hay theo buổi?

---

### 3.7. P1 — Building Mode (avatar emotion + cadence)

Không đổi so với summary v1. **Bổ sung**: bây giờ có tier system (P6) → cadence khác cho Trial vs VIP vs Elite vs Coach.

---

### 3.8. P2 — FitPro Insight B2B

Trùng Phase 4.1–4.3 + bổ sung **B2B với Egypt làm pilot**. Anh Cường có thể là **bridge** giữa FitPro + Egypt → đề xuất 1 hợp đồng thử nghiệm với Egypt cho 50 nhân viên là khả thi.

---

### 3.9. P4 — Đua Nhà N vs H

Không đổi so với summary v1.

---

### 3.10. P5 — Marathon → Ironman pathway

Không đổi so với summary v1. **Bổ sung**: Cường cam kết "200 Ironman" → đây là **pilot fitness target** đầu tiên để demo pathway.

---

### 3.11. P7 — Wire fitpro-network mock → API thật

Không đổi so với summary v1.

---

## 4. Đề xuất ưu tiên (cho CEO duyệt) — phiên bản v2

| Wave | Đề xuất | Lý do |
|------|---------|-------|
| **Wave 0 (workshop CEO trước khi build)** | Vẽ state diagram P6 + rights matrix + chốt decision-point | Block toàn bộ phía sau |
| **Wave A (Phase 0–1 hiện tại)** | P6 schema, P9 supplier abstraction, P7 wire network | Đặt nền móng đúng từ đầu, tránh re-migrate sau khi có data thật |
| **Wave B (Phase 1 cuối → Phase 2)** | P12 dual-track UX, P1 Building Mode v1 (notification + cadence), P11 Coach qualification v1 | UX + onboarding cho từng tier |
| **Wave C (Phase 3)** | P5 Ironman pathway, P4 Đua N vs H, P1 emotion avatar v2 | Cần dữ liệu user thật trước |
| **Wave D (Phase 4 hoặc sau)** | P2 B2B (Egypt pilot), P3 Coach rotation, P10 Marketplace | Cần chứng chỉ và supplier flow ổn định |

---

## 5. Việc cần CEO quyết trước khi bắt đầu (v2)

1. **★ State diagram 5 tier + rights matrix** (P6) — workshop riêng. **Block tất cả.**
2. **★ Curriculum 10 buổi**: ai soạn, version control, flat vs tier. Block P3.
3. **★ Multi-supplier ngay từ v1 hay sau?** Block P9, P10.
4. **★ Coach re-verify policy** (6 tháng / 1 năm / khác): block P11.
5. **PWA hay Zalo OA** member app (D1 Phase 1.7 đang treo) — block P1, P4, P5.
6. **% hoa hồng theo (tier × supplier × product)** — block hoa hồng engine + P6.
7. **Quy đổi điểm Đua nhà** + ngân sách giải thưởng — block P4.
8. **7+14 enforced hay guideline** — micro decision cho P7.
9. **Egypt làm B2B pilot** — chốt với Cường.
10. **Trường nutrition code** có sẵn sàng API/portal hợp tác không — block P11.

---

## 6. Action items cụ thể trong tuần

Từ transcript có **action item rõ trong tuần** — đây là cam kết của founder + đội:

| # | Việc | Owner | Deadline |
|---|------|-------|----------|
| A1 | Tìm 1 FitClub trong cộng đồng Quan ở Quân Nhân (>100m²) | Anh Dũng | T5/14 (tối mai) |
| A2 | Cả nhóm đến FitClub trải nghiệm + ghi nhận điểm yếu | Anh Dũng + Em + Thắng + (Cường?) | T5/14 hoặc T5/15 |
| A3 | Từ trải nghiệm UAT → kế hoạch quy trình tích hợp công nghệ | Em | Sau A2 |
| A4 | Vẽ state diagram 5 tier + 4 hành trình | Anh Dũng + Em | Trước Wave A |
| A5 | Tách role: Vận hành (Dũng) / Đào tạo (Thắng) / Công nghệ (Em) / B2B (Cường) | Tất cả | Đã chốt tại họp |

---

## 7. Cảnh báo + ghi chú

- **ASR sai nhiều thuật ngữ** — bảng phiên âm ở header chỉ cover phần chính. Khi đưa transcript này lên SOP, **bắt buộc biên tập viên review lại bản gốc** ít nhất 30 phút đầu (đoạn quan trọng nhất về tier + supplier ở phút 32-65).
- Buổi này **đã ra decision concrete** (khác summary v1 nhận định "không có quyết định ràng buộc"). Đề nghị anh Dũng + Em viết **biên bản chính thức** dựa trên file này + đối chiếu audio.
- Đề xuất P6 (state graph membership) thay đổi đáng kể nội dung Phase 1 của roadmap hiện tại (`docs/fitpro/04-roadmap/implementation-phases.md`) — cần **update implementation-phases.md** trong Phase 0 để chèn schema migration tier.
- Một số nội dung mô hình tiền có thể nhầm đơn vị: Cường chuyển "7.8" (có thể là 7.8 triệu / 78 triệu / 780 triệu / 7.8 tỷ — không rõ trong audio). Trước khi commit anywhere, **xác nhận với Cường**.
