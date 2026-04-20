-- ═══════════════════════════════════════════════════════════════════════
-- SEED DATA: marketing_events + marketing_event_registrations
-- Module: Market > Events (Sự kiện)
-- Tenant: thay @TENANT_ID bằng tenant thực tế
-- Run sau khi đã tạo table theo schema trong events.md
-- ═══════════════════════════════════════════════════════════════════════

SET @TENANT_ID = 1;  -- ← Thay bằng tenant_id thực tế
SET @ADMIN_ID  = 1;  -- ← Thay bằng user_id admin

-- ═══ EVENTS ═══════════════════════════════════════════════════════════

INSERT INTO marketing_events (
  tenant_id, slug, title, description, content_html, cover_image_url,
  start_date, end_date, registration_open_date, registration_close_date,
  venue_name, venue_address, venue_city, venue_map_url, venue_is_online, venue_online_url,
  contact_name, contact_phone, contact_email, contact_role,
  max_attendees, ticket_price, status, published_at,
  category, tags,
  dynamic_fields, add_on_items, gallery_image_urls,
  require_payment_proof, selectable_dates,
  created_by, created_at, updated_at
) VALUES

-- ── Event 1: Workshop Yoga (có phí, có add-on, có dynamic fields) ────
(
  @TENANT_ID,
  'workshop-yoga-cho-nguoi-moi',
  'Workshop Yoga cho người mới bắt đầu',
  'Buổi hướng dẫn 3 giờ cho người chưa từng tập yoga. Trải nghiệm 7 asana cơ bản + breathwork. Có quà tặng cho 20 người đăng ký đầu tiên.',
  '<h2>Nội dung buổi workshop</h2>
<p>Trong 3 giờ, bạn sẽ được hướng dẫn:</p>
<ul>
  <li><strong>7 asana cơ bản</strong> — tư thế đúng cho người mới</li>
  <li><strong>Kỹ thuật thở Pranayama</strong> — 3 kiểu thở phổ biến</li>
  <li><strong>Thiền thư giãn 15 phút</strong> cuối buổi</li>
</ul>
<h3>Người hướng dẫn</h3>
<p>Huấn luyện viên Nguyễn Thu Hà — 8 năm kinh nghiệm, chứng chỉ Yoga Alliance RYT-500.</p>
<h3>Chuẩn bị gì?</h3>
<p>Mang thảm yoga (hoặc thuê tại chỗ 30k), quần áo thoải mái, chai nước.</p>',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
  -- Thời gian: 14 ngày nữa
  DATE_ADD(NOW(), INTERVAL 14 DAY) + INTERVAL 8 HOUR,
  DATE_ADD(NOW(), INTERVAL 14 DAY) + INTERVAL 11 HOUR,
  DATE_ADD(NOW(), INTERVAL -3 DAY),
  DATE_ADD(NOW(), INTERVAL 13 DAY) + INTERVAL 23 HOUR,
  -- Venue
  'Home FitPro Thảo Điền', '12 Thảo Điền, Q.2, TP.HCM', 'TP.HCM', NULL, 0, NULL,
  -- Contact
  'Nguyễn Thu Hà', '0971234567', 'ha.nguyen@reborn.vn', 'HLV trưởng',
  -- Capacity + price
  30, 150000,
  -- Status
  'published', DATE_ADD(NOW(), INTERVAL -2 DAY),
  -- Category + tags
  'workshop', '["yoga", "workshop", "beginner"]',
  -- Dynamic fields
  '[
    {"id":"df-size","label":"Size áo","type":"select","required":true,"options":["S","M","L","XL"],"order":0},
    {"id":"df-exp","label":"Bạn đã tập yoga bao lâu?","type":"select","required":false,"options":["Chưa từng","Dưới 6 tháng","6-12 tháng","Trên 1 năm"],"order":1},
    {"id":"df-health","label":"Vấn đề sức khoẻ cần lưu ý","type":"textarea","required":false,"placeholder":"VD: đau lưng, huyết áp cao...","order":2}
  ]',
  -- Add-on items
  '[
    {"id":"addon-mat","name":"Thuê thảm yoga","description":"Thảm PU cao cấp, vệ sinh sau mỗi buổi","unitPrice":30000,"unit":"lần","maxQty":1},
    {"id":"addon-lunch","name":"Bữa trưa healthy","description":"Set lunch dinh dưỡng sau buổi tập","unitPrice":65000,"unit":"suất","maxQty":1},
    {"id":"addon-drink","name":"Đồ uống detox","description":"Nước ép rau củ tươi","unitPrice":35000,"unit":"ly","maxQty":3}
  ]',
  -- Gallery
  '["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600","https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600","https://images.unsplash.com/photo-1575052814086-f385e2e2ad33?w=600"]',
  -- Payment proof required
  1,
  -- Selectable dates (single day → null)
  NULL,
  -- Created
  @ADMIN_ID, DATE_ADD(NOW(), INTERVAL -5 DAY), DATE_ADD(NOW(), INTERVAL -2 DAY)
),

-- ── Event 2: Hội thảo Dinh dưỡng (miễn phí, không add-on) ───────────
(
  @TENANT_ID,
  'hoi-thao-dinh-duong-the-thao',
  'Hội thảo Dinh dưỡng cho người tập thể thao',
  'Chuyên gia dinh dưỡng chia sẻ phác đồ ăn uống tối ưu để tăng cơ/giảm mỡ. Miễn phí, giới hạn 50 người.',
  '<h2>Chương trình</h2>
<ul>
  <li>19:00 — Welcome check-in</li>
  <li>19:15 — Phần 1: Macro &amp; Calo cơ bản</li>
  <li>19:45 — Phần 2: Thực đơn mẫu 7 ngày</li>
  <li>20:15 — Q&amp;A với chuyên gia</li>
  <li>20:45 — Networking + nước ép miễn phí</li>
</ul>
<p><em>Event miễn phí — đăng ký trước để nhận tài liệu in.</em></p>',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
  DATE_ADD(NOW(), INTERVAL 21 DAY) + INTERVAL 19 HOUR,
  DATE_ADD(NOW(), INTERVAL 21 DAY) + INTERVAL 21 HOUR,
  DATE_ADD(NOW(), INTERVAL -1 DAY),
  DATE_ADD(NOW(), INTERVAL 20 DAY) + INTERVAL 23 HOUR,
  'Co-Working FitPro Đống Đa', '99 Láng Hạ, Đống Đa, Hà Nội', 'Hà Nội', NULL, 0, NULL,
  'Trần Minh Quân', '0988888888', 'quan.tran@reborn.vn', 'BTC',
  50, 0,
  'published', DATE_ADD(NOW(), INTERVAL -1 DAY),
  'hội thảo', '["dinh-duong", "hoi-thao", "mien-phi"]',
  -- Dynamic fields: chỉ 1 trường
  '[{"id":"df-goal","label":"Mục tiêu dinh dưỡng","type":"select","required":false,"options":["Tăng cơ","Giảm mỡ","Duy trì","Chưa rõ"],"order":0}]',
  NULL, -- no add-ons
  NULL, -- no gallery
  0,    -- no payment proof
  NULL, -- single day
  @ADMIN_ID, DATE_ADD(NOW(), INTERVAL -4 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY)
),

-- ── Event 3: Lớp Mindfulness (draft, online) ─────────────────────────
(
  @TENANT_ID,
  'lop-mindfulness-cuoi-tuan',
  'Lớp Mindfulness cuối tuần (miễn phí)',
  'Lớp thiền chánh niệm 90 phút mỗi sáng thứ 7, giới hạn 20 người.',
  '<p>Chương trình 4 tuần liên tiếp, mỗi buổi 90 phút.</p>
<ul>
  <li>Tuần 1: Nhận diện hơi thở</li>
  <li>Tuần 2: Body scan</li>
  <li>Tuần 3: Thiền đi bộ</li>
  <li>Tuần 4: Thiền từ bi</li>
</ul>',
  NULL, -- no cover
  DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 7 HOUR,
  DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 9 HOUR,
  DATE_ADD(NOW(), INTERVAL -2 DAY),
  DATE_ADD(NOW(), INTERVAL 6 DAY) + INTERVAL 23 HOUR,
  'Online', 'Zoom', NULL, NULL, 1, 'https://zoom.us/j/1234567890',
  'Lê Hoàng Anh', '0912345678', NULL, NULL,
  20, 0,
  'draft', NULL,
  'lớp học', '["mindfulness", "online", "mien-phi"]',
  NULL, NULL, NULL, 0,
  -- Multi-day: 4 ngày thứ 7 liên tiếp
  CONCAT('["',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 7 DAY), '%Y-%m-%d'), '","',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 14 DAY), '%Y-%m-%d'), '","',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 21 DAY), '%Y-%m-%d'), '","',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 28 DAY), '%Y-%m-%d'), '"]'),
  @ADMIN_ID, DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY)
),

-- ── Event 4: Bootcamp 3 ngày (có phí, multi-day, add-on) ─────────────
(
  @TENANT_ID,
  'bootcamp-fitness-3-ngay',
  'Bootcamp Fitness 3 ngày — Thử thách giới hạn',
  'Chương trình tập luyện cường độ cao 3 ngày. Cardio, strength, flexibility. Có HLV cá nhân hỗ trợ.',
  '<h2>Lịch trình 3 ngày</h2>
<ul>
  <li><strong>Ngày 1</strong>: Cardio HIIT + Core — 3 tiếng sáng</li>
  <li><strong>Ngày 2</strong>: Strength Training — Full body</li>
  <li><strong>Ngày 3</strong>: Flexibility + Recovery + Massage</li>
</ul>
<p>Mỗi ngày có bữa trưa healthy miễn phí cho người tham gia.</p>
<h3>Ai nên tham gia?</h3>
<p>Người đã có nền tảng tập luyện ít nhất 3 tháng. Không phù hợp cho người mới hoàn toàn.</p>',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
  DATE_ADD(NOW(), INTERVAL 30 DAY) + INTERVAL 6 HOUR,
  DATE_ADD(NOW(), INTERVAL 32 DAY) + INTERVAL 17 HOUR,
  NOW(),
  DATE_ADD(NOW(), INTERVAL 28 DAY) + INTERVAL 23 HOUR,
  'Home FitPro Thảo Điền', '12 Thảo Điền, Q.2, TP.HCM', 'TP.HCM', NULL, 0, NULL,
  'Nguyễn Văn Đức', '0909123456', 'duc.nguyen@reborn.vn', 'Trưởng BTC',
  25, 500000,
  'published', NOW(),
  'training', '["bootcamp", "fitness", "intensive"]',
  -- Dynamic fields
  '[
    {"id":"df-tshirt","label":"Size áo Bootcamp","type":"select","required":true,"options":["S","M","L","XL","XXL"],"order":0},
    {"id":"df-level","label":"Level tập luyện","type":"select","required":true,"options":["3-6 tháng","6-12 tháng","1-2 năm","Trên 2 năm"],"order":1},
    {"id":"df-injury","label":"Chấn thương cần lưu ý","type":"text","required":false,"placeholder":"VD: đau gối phải, vai trái...","order":2},
    {"id":"df-emergency","label":"SĐT người thân khẩn cấp","type":"phone","required":true,"order":3}
  ]',
  -- Add-ons
  '[
    {"id":"addon-pt","name":"HLV cá nhân kèm riêng","description":"1 HLV hỗ trợ riêng suốt 3 ngày","unitPrice":300000,"unit":"ngày","maxQty":3},
    {"id":"addon-massage","name":"Massage phục hồi","description":"60 phút massage sport sau buổi tập","unitPrice":250000,"unit":"lần","maxQty":3},
    {"id":"addon-photo","name":"Gói ảnh kỷ niệm","description":"Photographer chụp + chỉnh sửa 20 ảnh","unitPrice":200000,"unit":"gói","maxQty":1},
    {"id":"addon-towel","name":"Khăn tập gym","description":"Khăn cotton thêu tên","unitPrice":80000,"unit":"cái","maxQty":2}
  ]',
  -- Gallery
  '["https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600","https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600","https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600","https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600"]',
  -- Payment proof required
  1,
  -- Multi-day: 3 ngày
  CONCAT('["',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 30 DAY), '%Y-%m-%d'), '","',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 31 DAY), '%Y-%m-%d'), '","',
    DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 32 DAY), '%Y-%m-%d'), '"]'),
  @ADMIN_ID, DATE_ADD(NOW(), INTERVAL -3 DAY), NOW()
),

-- ── Event 5: Networking (đã kết thúc, có registrations) ──────────────
(
  @TENANT_ID,
  'networking-khoi-nghiep-thang-3',
  'Networking Khởi nghiệp tháng 3',
  'Gặp gỡ, chia sẻ kinh nghiệm khởi nghiệp. Cà phê & bánh miễn phí.',
  '<h2>Agenda</h2>
<ul>
  <li>18:30 — Check-in, nhận đồ uống</li>
  <li>19:00 — Pitch 5 phút x 4 startup</li>
  <li>19:40 — Panel: "Gọi vốn mùa khó"</li>
  <li>20:20 — Networking tự do</li>
</ul>',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
  DATE_ADD(NOW(), INTERVAL -10 DAY) + INTERVAL 18 HOUR,
  DATE_ADD(NOW(), INTERVAL -10 DAY) + INTERVAL 21 HOUR,
  DATE_ADD(NOW(), INTERVAL -30 DAY),
  DATE_ADD(NOW(), INTERVAL -11 DAY) + INTERVAL 23 HOUR,
  'Co-Working FitPro Đống Đa', '99 Láng Hạ, Đống Đa, Hà Nội', 'Hà Nội', NULL, 0, NULL,
  'Phạm Thanh Tùng', '0977777777', 'tung.pham@reborn.vn', 'Community Manager',
  40, 0,
  'published', DATE_ADD(NOW(), INTERVAL -25 DAY),
  'networking', '["networking", "startup", "mien-phi"]',
  NULL, NULL, NULL, 0, NULL,
  @ADMIN_ID, DATE_ADD(NOW(), INTERVAL -30 DAY), DATE_ADD(NOW(), INTERVAL -25 DAY)
);

-- Lưu ID event vừa insert
SET @EVT1 = (SELECT id FROM marketing_events WHERE slug = 'workshop-yoga-cho-nguoi-moi' AND tenant_id = @TENANT_ID LIMIT 1);
SET @EVT2 = (SELECT id FROM marketing_events WHERE slug = 'hoi-thao-dinh-duong-the-thao' AND tenant_id = @TENANT_ID LIMIT 1);
SET @EVT4 = (SELECT id FROM marketing_events WHERE slug = 'bootcamp-fitness-3-ngay' AND tenant_id = @TENANT_ID LIMIT 1);
SET @EVT5 = (SELECT id FROM marketing_events WHERE slug = 'networking-khoi-nghiep-thang-3' AND tenant_id = @TENANT_ID LIMIT 1);

-- ═══ REGISTRATIONS ═══════════════════════════════════════════════════

INSERT INTO marketing_event_registrations (
  tenant_id, event_id, event_slug,
  full_name, phone, email, company, note,
  status, ticket_code, confirmed_at, checked_in_at,
  dynamic_field_values, selected_add_ons, total_amount,
  selected_dates, payment_proof_status,
  source, utm_source, utm_campaign,
  created_at, updated_at
) VALUES

-- ── Registrations cho Event 1: Workshop Yoga ─────────────────────────
(@TENANT_ID, @EVT1, 'workshop-yoga-cho-nguoi-moi',
 'Nguyễn Thị Mai', '0901111111', 'mai.nguyen@gmail.com', 'Công ty ABC', NULL,
 'confirmed', 'WORKSHOP-A1B2C3', DATE_ADD(NOW(), INTERVAL -1 DAY), NULL,
 '{"df-size":"M","df-exp":"Dưới 6 tháng","df-health":"Không có"}',
 '[{"addOnId":"addon-mat","qty":1},{"addOnId":"addon-lunch","qty":1}]',
 245000, -- 150k vé + 30k thảm + 65k lunch
 NULL, 'approved',
 'public_portal', 'facebook', 'yoga-apr',
 DATE_ADD(NOW(), INTERVAL -2 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY)),

(@TENANT_ID, @EVT1, 'workshop-yoga-cho-nguoi-moi',
 'Trần Văn Hùng', '0902222222', 'hung.tran@gmail.com', NULL, 'Muốn biết có cần mang theo gì không',
 'confirmed', 'WORKSHOP-D4E5F6', DATE_ADD(NOW(), INTERVAL -1 DAY), NULL,
 '{"df-size":"L","df-exp":"Chưa từng"}',
 '[{"addOnId":"addon-drink","qty":2}]',
 220000, -- 150k vé + 70k 2 ly detox
 NULL, 'approved',
 'public_portal', NULL, NULL,
 DATE_ADD(NOW(), INTERVAL -2 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY)),

(@TENANT_ID, @EVT1, 'workshop-yoga-cho-nguoi-moi',
 'Lê Thị Hương', '0903333333', 'huong.le@outlook.com', 'Freelancer', NULL,
 'pending', NULL, NULL, NULL,
 '{"df-size":"S","df-exp":"6-12 tháng","df-health":"Đau lưng nhẹ"}',
 NULL,
 150000, -- chỉ vé
 NULL, 'submitted', -- đã upload bill, chờ duyệt
 'public_portal', 'zalo', NULL,
 DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY)),

(@TENANT_ID, @EVT1, 'workshop-yoga-cho-nguoi-moi',
 'Phạm Đức Anh', '0904444444', NULL, NULL, NULL,
 'pending', NULL, NULL, NULL,
 '{"df-size":"XL","df-exp":"Chưa từng"}',
 '[{"addOnId":"addon-mat","qty":1},{"addOnId":"addon-lunch","qty":1},{"addOnId":"addon-drink","qty":1}]',
 280000, -- 150k + 30k + 65k + 35k
 NULL, 'pending', -- chưa upload bill
 'public_portal', NULL, NULL,
 NOW(), NOW()),

-- ── Registrations cho Event 2: Hội thảo Dinh dưỡng ──────────────────
(@TENANT_ID, @EVT2, 'hoi-thao-dinh-duong-the-thao',
 'Võ Minh Tuấn', '0905555555', 'tuan.vo@gmail.com', 'GymShark VN', NULL,
 'confirmed', 'HOITHAO-G7H8I9', DATE_ADD(NOW(), INTERVAL -1 DAY), NULL,
 '{"df-goal":"Tăng cơ"}',
 NULL, 0, NULL, 'not_required',
 'public_portal', NULL, NULL,
 DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY)),

(@TENANT_ID, @EVT2, 'hoi-thao-dinh-duong-the-thao',
 'Đặng Thị Lan', '0906666666', 'lan.dang@yahoo.com', NULL, 'Có ăn chay, mong có phần cho người ăn chay',
 'confirmed', 'HOITHAO-J1K2L3', DATE_ADD(NOW(), INTERVAL -1 DAY), NULL,
 '{"df-goal":"Giảm mỡ"}',
 NULL, 0, NULL, 'not_required',
 'public_portal', 'facebook', 'dinh-duong-apr',
 DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY)),

(@TENANT_ID, @EVT2, 'hoi-thao-dinh-duong-the-thao',
 'Hoàng Văn Nam', '0907777777', NULL, NULL, NULL,
 'pending', NULL, NULL, NULL,
 '{"df-goal":"Chưa rõ"}',
 NULL, 0, NULL, 'not_required',
 'public_portal', NULL, NULL,
 NOW(), NOW()),

-- ── Registrations cho Event 4: Bootcamp (multi-day) ──────────────────
(@TENANT_ID, @EVT4, 'bootcamp-fitness-3-ngay',
 'Bùi Thanh Sơn', '0908888888', 'son.bui@gmail.com', NULL, NULL,
 'confirmed', 'BOOTCAMP-M4N5O6', DATE_ADD(NOW(), INTERVAL -1 DAY), NULL,
 CONCAT('{"df-tshirt":"L","df-level":"1-2 năm","df-injury":"Không","df-emergency":"0911000111"}'),
 '[{"addOnId":"addon-pt","qty":3},{"addOnId":"addon-massage","qty":2}]',
 1900000, -- 500k vé + 900k PT 3 ngày + 500k massage 2 lần
 CONCAT('["',
   DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 30 DAY), '%Y-%m-%d'), '","',
   DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 31 DAY), '%Y-%m-%d'), '","',
   DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 32 DAY), '%Y-%m-%d'), '"]'),
 'approved',
 'public_portal', 'instagram', 'bootcamp-may',
 DATE_ADD(NOW(), INTERVAL -2 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY)),

(@TENANT_ID, @EVT4, 'bootcamp-fitness-3-ngay',
 'Ngô Thị Yến', '0909999999', 'yen.ngo@gmail.com', 'PT Studio Q7', 'Chỉ tham gia ngày 1 và 3',
 'pending', NULL, NULL, NULL,
 '{"df-tshirt":"S","df-level":"6-12 tháng","df-emergency":"0922000222"}',
 '[{"addOnId":"addon-photo","qty":1}]',
 700000, -- 500k vé + 200k photo
 CONCAT('["',
   DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 30 DAY), '%Y-%m-%d'), '","',
   DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 32 DAY), '%Y-%m-%d'), '"]'),
 'submitted',
 'public_portal', NULL, NULL,
 DATE_ADD(NOW(), INTERVAL -1 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY)),

-- ── Registrations cho Event 5: Networking (đã kết thúc, có check-in) ─
(@TENANT_ID, @EVT5, 'networking-khoi-nghiep-thang-3',
 'Lý Minh Châu', '0910000001', 'chau.ly@startup.vn', 'Startup XYZ', NULL,
 'checked_in', 'NETWOR-P7Q8R9', DATE_ADD(NOW(), INTERVAL -12 DAY), DATE_ADD(NOW(), INTERVAL -10 DAY) + INTERVAL 18 HOUR + INTERVAL 15 MINUTE,
 NULL, NULL, 0, NULL, 'not_required',
 'public_portal', NULL, NULL,
 DATE_ADD(NOW(), INTERVAL -15 DAY), DATE_ADD(NOW(), INTERVAL -10 DAY)),

(@TENANT_ID, @EVT5, 'networking-khoi-nghiep-thang-3',
 'Đinh Quang Hải', '0910000002', 'hai.dinh@corp.vn', 'Corp Việt Nam', NULL,
 'checked_in', 'NETWOR-S1T2U3', DATE_ADD(NOW(), INTERVAL -13 DAY), DATE_ADD(NOW(), INTERVAL -10 DAY) + INTERVAL 18 HOUR + INTERVAL 30 MINUTE,
 NULL, NULL, 0, NULL, 'not_required',
 'public_portal', 'linkedin', 'networking-mar',
 DATE_ADD(NOW(), INTERVAL -14 DAY), DATE_ADD(NOW(), INTERVAL -10 DAY)),

(@TENANT_ID, @EVT5, 'networking-khoi-nghiep-thang-3',
 'Trịnh Thị Hoa', '0910000003', NULL, NULL, NULL,
 'no_show', 'NETWOR-V4W5X6', DATE_ADD(NOW(), INTERVAL -12 DAY), NULL,
 NULL, NULL, 0, NULL, 'not_required',
 'public_portal', NULL, NULL,
 DATE_ADD(NOW(), INTERVAL -15 DAY), DATE_ADD(NOW(), INTERVAL -10 DAY)),

(@TENANT_ID, @EVT5, 'networking-khoi-nghiep-thang-3',
 'Cao Văn Tâm', '0910000004', 'tam.cao@gmail.com', NULL, NULL,
 'cancelled', NULL, NULL, NULL,
 NULL, NULL, 0, NULL, 'not_required',
 'manual', NULL, NULL,
 DATE_ADD(NOW(), INTERVAL -20 DAY), DATE_ADD(NOW(), INTERVAL -12 DAY));

-- ═══ CHECK-IN RECORDS (cho event 5 đã diễn ra) ═══════════════════════

SET @REG_CHAU = (SELECT id FROM marketing_event_registrations WHERE phone = '0910000001' AND event_id = @EVT5 LIMIT 1);
SET @REG_HAI  = (SELECT id FROM marketing_event_registrations WHERE phone = '0910000002' AND event_id = @EVT5 LIMIT 1);

INSERT INTO marketing_event_checkins (
  tenant_id, registration_id, checked_in_at, checked_out_at, checked_in_by, selected_date
) VALUES
(@TENANT_ID, @REG_CHAU,
 DATE_ADD(NOW(), INTERVAL -10 DAY) + INTERVAL 18 HOUR + INTERVAL 15 MINUTE,
 DATE_ADD(NOW(), INTERVAL -10 DAY) + INTERVAL 20 HOUR + INTERVAL 45 MINUTE,
 @ADMIN_ID, DATE_FORMAT(DATE_ADD(NOW(), INTERVAL -10 DAY), '%Y-%m-%d')),
(@TENANT_ID, @REG_HAI,
 DATE_ADD(NOW(), INTERVAL -10 DAY) + INTERVAL 18 HOUR + INTERVAL 30 MINUTE,
 DATE_ADD(NOW(), INTERVAL -10 DAY) + INTERVAL 21 HOUR,
 @ADMIN_ID, DATE_FORMAT(DATE_ADD(NOW(), INTERVAL -10 DAY), '%Y-%m-%d'));

-- ═══ VERIFY ═══════════════════════════════════════════════════════════
SELECT
  'Events' AS entity,
  COUNT(*) AS total,
  SUM(status = 'published') AS published,
  SUM(status = 'draft') AS draft
FROM marketing_events WHERE tenant_id = @TENANT_ID;

SELECT
  'Registrations' AS entity,
  COUNT(*) AS total,
  SUM(status = 'confirmed') AS confirmed,
  SUM(status = 'pending') AS pending,
  SUM(status = 'checked_in') AS checked_in,
  SUM(status = 'cancelled') AS cancelled,
  SUM(status = 'no_show') AS no_show
FROM marketing_event_registrations WHERE tenant_id = @TENANT_ID;
