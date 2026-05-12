# FitPro E2E Storyboard — 4 vai trò người dùng

> Storyboard này định nghĩa flow + caption cho từng role để Playwright capture screenshot + record video.
> Mỗi step = 1 slide trong HTML slideshow output (caption tiếng Việt hiển thị bên dưới).
> Chạy: `node tests/fitpro-e2e/capture-all.mjs` — sẽ sinh `tests/fitpro-e2e/output/<role>/{video.webm, slideshow.html, screenshots/*}`.

---

## Role 1 — Khách hàng / Member (90 ngày trải nghiệm)

Góc nhìn: hội viên Trần Thị Hương, gói VIP, ngày 73/90.
File: `role-customer.mjs`

| # | URL | Action | Caption (hiển thị dưới slide) |
|---|---|---|---|
| 1 | `/dashboard` | Mở dashboard (BO trưng demo) | Khách hàng đăng ký gói qua BO giới thiệu — App ghi nhận dưới Mã A của BO. Banner Dual Cash-Flow xác nhận App chỉ chạm Luồng 1 (SaaS/Direct), Luồng 2 (HBL) zero-touch. |
| 2 | `/ch_membership_plans` | Cuộn xem 5 tier | 5 tier chuẩn quốc gia: BASIC 80k → SUPER VIP 500k/buổi. Tier ≥ PRO mở quyền Elite Member; VIP+ đi kèm xét nghiệm Medlatec trước & sau 90 ngày. |
| 3 | `/ch_checkin` | Xem màn quét QR | Mỗi sáng 6–9h, hội viên check-in tại bất kỳ trạm FitPro nào (đặc quyền liên thông). Coach quét QR → trừ quota tự động. |
| 4 | `/fp_body_metrics` | Tab F4 — chỉ số cơ thể | Sau 73/90 ngày, hệ thống cho thấy tiến độ đạt 71% target. Bảng so sánh Baseline ↔ Hiện tại ↔ Target. AI Nutrition Engine gợi ý khẩu phần ngay sau check-out. |
| 5 | `/fp_body_metrics` (modal) | Bấm "Đặt lịch Medlatec" → modal mở | Modal đặt lịch xét nghiệm Medlatec D85 — chi phí 0đ (đã trong gói VIP). Notification gửi qua Zalo OA. |
| 6 | `/fp_journey` | Hành trình 90 ngày | Timeline 5 phase: intake → baseline → execution → re-test → outcome. Auto-trigger nhắc gia hạn D-15 và sinh báo cáo outcome D85. |
| 7 | `/fp_cross_card` | Thẻ liên thông | Thẻ liên thông cho phép check-in ở 3 trạm khác nhau trong 30 ngày qua — tiêu chuẩn đồng nhất, trừ quota tự động. |

**Voice-over key message**: "Luồng dịch vụ FitPro qua App. Sản phẩm HBL? Khách đặt thẳng dưới mã NPP — App không cầm tiền."

---

## Role 2 — Master BO / Founder (quản lý cả nhánh)

Góc nhìn: Nguyễn Master, Mã A007, vừa đạt mã N007 (đủ 7 Elite F1).
File: `role-master.mjs`

| # | URL | Action | Caption |
|---|---|---|---|
| 1 | `/dashboard` | Dashboard tổng quan | Master BO mở app, thấy ngay banner Dual Cash-Flow: Luồng 1 (App) vs Luồng 2 (HBL zero-touch). Stat cards click-able đi sâu vào từng phân hệ. |
| 2 | `/fp_network_tree` | Cây 7×7×7 | Cây mạng lưới hiển thị: tầng Master với mã `A007` + huy hiệu `🏠 N007` (vừa đủ 7 Elite F1-F7). 7 nhánh trực tiếp + 6 vệ tinh tầng 2. |
| 3 | `/fp_station_type` | F2 — 3 mô hình trạm | 3 loại trạm Phygital: Home (H###), Center (C###), Inside (I### plugin gym). Bấm "Tạo trạm" → wizard 72h. |
| 4 | `/fp_station_type` (modal) | Mở wizard tạo Home FitPro | Modal tạo Home FitPro: nhập tên, mã, thảm 3–7, ngày khai trương. Sau Save → tự dẫn tới sơ đồ thảm tập. |
| 5 | `/ch_accommodation` | Sơ đồ thảm tập | Sơ đồ thảm: chiếm/trống/bảo trì theo slot 6-7h / 7-8h / 8-9h. Mỗi mat hiện member đang tập. |
| 6 | `/fp_sop` | F6 — SOP Compliance | Master giám sát 5 trạm downline về vệ sinh, đúng giờ 6-9h, giáo trình chuẩn, feedback KH. 2 trạm điểm <85 cần audit. |
| 7 | `/fp_commission` | F8 — Đối soát HBL | Banner "Nguyên tắc thép" + sơ đồ Dual Cash-Flow zero-touch. Ledger 6 kỳ với cảnh báo lệch khi NPP khai phân phối ≠ HBL chuyển. |
| 8 | `/fp_commission` (modal) | Click 1 hàng lệch | Modal đối soát chi tiết: HBL chuyển 42tr, NPP phân phối 41,2tr → lệch 800k, NPP tự xử lý. App KHÔNG can thiệp. |
| 9 | `/fp_commission` (upload) | Upload CSV file mới | Upload file commission HBL → ledger entry mới (passthrough), không sinh giao dịch tiền. |
| 10 | `/ch_report_revenue` | Báo cáo doanh thu trạm | Báo cáo doanh thu toàn nhánh — Master thấy đóng góp từng trạm + tổng thu nhập Luồng 1 SaaS recurring. |

**Voice-over key message**: "Master vận hành cả nhánh qua App, nhưng tiền HBL về thẳng tài khoản — pháp lý đa cấp an toàn."

---

## Role 3 — Coach / Trainer (lễ tân + dạy)

Góc nhìn: Coach Vũ Minh G, mã A082, trực ca sáng 6-9h tại Trạm Cầu Giấy (C015).
File: `role-coach.mjs`

| # | URL | Action | Caption |
|---|---|---|---|
| 1 | `/dashboard` | Mở ca sáng | Coach mở dashboard trước 6h sáng để xem booking ngày: 34 buổi tập, doanh thu dự kiến. |
| 2 | `/create_sale_add` | POS lễ tân | Trạm bán: chốt gói cho khách mới tới — chọn 1 trong 5 tier (BASIC 80k → SUPER VIP 500k/buổi). |
| 3 | `/ch_checkin` | Quét QR check-in | Khách quét QR vào trạm → app trừ quota tự động + ghi nhận buổi tập. |
| 4 | `/ch_accommodation` | Sơ đồ thảm | Sơ đồ thảm trạm: Coach phân slot 6-7h / 7-8h / 8-9h, kéo thả khách vào mat trống. |
| 5 | `/fp_body_metrics` | Ghi nhận buổi tập | Sau check-out, ghi lại thời lượng, calo, bài tập đã chạy. AI Nutrition Engine gửi gợi ý qua Zalo OA. |
| 6 | `/fp_finder` | Tìm trạm gần (khi khách di chuyển) | Khi khách đi công tác, Coach giúp tìm trạm FitPro gần nhất → vẫn check-in được nhờ thẻ liên thông. |
| 7 | `/shift_management` | Kết ca | Kết ca 9h: Coach xem doanh thu ca, số buổi đã dạy, ca tới → đối soát tiền mặt + chuyển ca. |

**Voice-over key message**: "Coach trực 1 ca 6-9h, dạy theo SOP chuẩn, nhận 80k+/buổi trực tiếp — không KPI ép."

---

## Role 4 — Admin HQ FitPro (Reborn JSC)

Góc nhìn: Admin Reborn HQ cấu hình chuẩn quốc gia cho cả mạng FitPro.
File: `role-admin.mjs`

| # | URL | Action | Caption |
|---|---|---|---|
| 1 | `/dashboard` | Tổng quan HQ | Admin HQ mở dashboard — banner Dual Cash-Flow nhắc nguyên tắc thép, không bao giờ wire HBL commission vào App. |
| 2 | `/ch_tenant_config` | Cấu hình tenant FitPro | Bật/tắt module theo vertical. Tenant FitPro: bật Network, Journey, Cross-card; tắt Accommodation 24h, Warehouse. |
| 3 | `/ch_membership_plans` | Cấu hình 5 tier chuẩn quốc gia | Cấu hình giá 5 tier (80k/140k/260k/315k/500k) — chuẩn cho mọi center toàn quốc. Badge "⚡ Mở Elite" và "🩺 Medlatec" hiển thị quyền lợi. |
| 4 | `/ch_service_catalog` | Catalog dịch vụ FitPro | Catalog buổi tập + combo dinh dưỡng HBL — quản lý SKU chuẩn dùng chung mọi trạm. |
| 5 | `/fp_mf7` | Onboarding MF7 cho BO mới | Lộ trình 7 ngày đào tạo BO mới về triết lý 7×7×7 (Mastery / Force / Leverage). |
| 6 | `/fp_mf7` (modal) | Mở bài học ngày 4 | Bài học "Cấu hình trạm Home vs Co-Working" — video 18 phút + workbook in-app. |
| 7 | `/ch_report_revenue` | Báo cáo toàn mạng | Toàn cảnh GMV, member count, retention, NPS, doanh thu/Center, % Elite chuyển từ PRO. |
| 8 | `/fp_commission` | Audit HBL toàn mạng | Admin HQ rà toàn bộ ledger HBL các BO upload — cảnh báo BO có lệch >5% liên tiếp 2 kỳ. |

**Voice-over key message**: "Admin HQ điều phối chuẩn quốc gia: pricing, SOP, đào tạo. KHÔNG can thiệp luồng tiền HBL."

---

## Note kỹ thuật khi capture

- **Viewport**: 1440×900 (theo `tests/config.mjs`).
- **Auth**: tái dùng `tests/.auth-state.json` — không xóa giữa các run.
- **Tour dismiss**: gọi `helpers.dismissTour()` sau mỗi `goto`.
- **Video**: dùng `chromium.launchPersistentContext` hoặc `newContext({ recordVideo: { dir, size: 1440x900 } })`.
- **Screenshot fullPage=false** cho từng step (chỉ vùng viewport hiện tại).
- **Slide timing**: pause 2.5s trước mỗi screenshot để animation/modal kịp xuất hiện.
- **Slideshow**: HTML reveal-like, mỗi slide = ảnh + caption + STT, có nav arrows + auto-play (10s/slide).
