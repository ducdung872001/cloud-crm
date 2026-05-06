// Event types cho phân hệ Sự kiện — Community Hub.
// Prototype dùng localStorage; BE sau này thay bằng API calls (xem docs/events/backend-spec.md).
//
// ── CHUNG (generic) ─────────────────────────────────────────────────────────
// Tất cả types dưới đây là CHUNG — dùng cho mọi ngành.
// Types ĐẶC THÙ (fitness/spa) nằm ở types.industry.ts.

export type EventStatus = "draft" | "published" | "ongoing" | "ended" | "cancelled";

export type RegistrationStatus =
  | "pending" // mới đăng ký, chưa xác nhận
  | "confirmed" // admin đã duyệt / đã thanh toán
  | "checked_in" // đã check-in tại sự kiện
  | "cancelled" // huỷ đăng ký
  | "no_show"; // không đến

export interface EventVenue {
  name: string; // VD: "Trung tâm Hội nghị Quốc gia"
  address: string;
  city?: string;
  mapUrl?: string; // Google Maps share link
  latitude?: number;  // Toạ độ WGS84 — để embed Google Maps iframe
  longitude?: number;
  venueImages?: string[]; // URLs ảnh địa điểm (tách khỏi galleryImageUrls là ảnh hoạt động)
  isOnline?: boolean;
  onlineUrl?: string; // Zoom/Meet link
  // Nhãn điểm đến — chỉ dùng cho additionalVenues[] (bãi đỗ xe, chỗ chờ, lễ tân…).
  // Venue chính (EventEntity.venue) để trống, UI tự hiểu là "Địa điểm tổ chức".
  label?: string;
}

export interface EventBankAccount {
  holder: string;       // Tên chủ tài khoản
  bank: string;         // Tên ngân hàng hoặc viết tắt (VCB, TCB, MB, …)
  accountNumber: string;
  phone?: string;       // SĐT đối chiếu
  qrImageUrl?: string;  // QR ảnh tự upload (cho tenant chưa dùng VietQR auto-gen)
}

export interface EventContactPerson {
  name: string;
  phone: string;
  email?: string;
  role?: string; // VD: "Trưởng BTC"
}

// ── Dynamic Fields — admin tự cấu hình trường trên form đăng ký ────────────
export type DynamicFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multi_select" // Khách yc 5/5: "size áo / màu áo / multi-choice" — nhiều lựa chọn cùng lúc
  | "checkbox"
  | "date"
  | "email"
  | "phone";

export interface DynamicFieldDefinition {
  id: string; // unique trong event
  label: string; // nhãn hiển thị
  type: DynamicFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // cho type "select"
  defaultValue?: string;
  order: number; // thứ tự hiển thị
  // Giá option (VND) — dùng cho type "checkbox" (tick = +price) và "select"
  // (cộng theo từng option qua optionPrices). Tổng tiền đăng ký sẽ tự động
  // cập nhật khi khách thay đổi lựa chọn.
  price?: number;
  optionPrices?: Record<string, number>; // map option value → price (cho type "select")
}

// ── Add-on Line Item — sản phẩm/dịch vụ bổ sung khi đăng ký ──────────────
export interface EventAddOnItem {
  id: string;
  name: string;
  description?: string;
  unitPrice: number; // VND
  unit: string; // "lần", "suất", "cái"...
  maxQty?: number; // giới hạn mỗi người (để trống = không giới hạn)
  imageUrl?: string; // ảnh minh hoạ (data URL / URL)
  group?: string; // Nhóm hiển thị trên Registration tab multi-level header, VD "Cư trú 09/05"
}

// ── Payment Proof — bằng chứng thanh toán ─────────────────────────────────
export type PaymentStatus =
  | "not_required" // event miễn phí
  | "pending" // chưa upload
  | "submitted" // đã upload, chờ duyệt
  | "approved" // admin đã duyệt
  | "rejected"; // admin từ chối

export interface PaymentProof {
  imageUrl: string; // data URL (prototype) / URL (production)
  submittedAt: string; // ISO
  status: PaymentStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectReason?: string;
}

// ── Check-in / Check-out Record ───────────────────────────────────────────
export interface CheckInOutRecord {
  checkedInAt: string; // ISO
  checkedOutAt?: string; // ISO, null nếu chưa check-out
  checkedInBy?: string; // tên admin
  selectedDate?: string; // ngày nào của event multi-day (YYYY-MM-DD)
}

// ── Selected Add-on ───────────────────────────────────────────────────────
export interface SelectedAddOn {
  addOnId: string;
  qty: number;
}

// ── Content Blocks — admin sửa giao diện trang sự kiện theo block ─────────
// Yc 5/5 mục 1: layout block linh hoạt (ảnh + chữ, kéo thả, vô hạn block).
// Mỗi block có thể là 1 trong các kiểu dưới; admin tự sắp xếp `order` để hiển
// thị. BE chỉ cần lưu mảng JSON này nguyên dạng.
export type ContentBlockType =
  | "text" // Chỉ chữ (rich text HTML)
  | "image" // Chỉ 1 ảnh full-width
  | "image_text" // Ảnh + chữ (layout: ảnh trên/dưới/trái/phải tuỳ `imagePosition`)
  | "gallery" // Lưới nhiều ảnh (carousel/grid)
  | "banner_ad" // Banner quảng cáo có link click
  | "embed" // iframe / video embed
  | "divider"; // Đường phân cách

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  order: number;
  // Content fields — chỉ dùng field tương ứng với type
  text?: string; // HTML từ RebornEditor (cho "text", "image_text")
  imageUrl?: string; // ảnh chính (cho "image", "image_text", "banner_ad")
  imageUrls?: string[]; // nhiều ảnh (cho "gallery")
  imagePosition?: "top" | "bottom" | "left" | "right"; // layout cho "image_text"
  linkUrl?: string; // click vào ảnh / banner sẽ mở (cho "image", "banner_ad", "image_text")
  linkLabel?: string; // text hiển thị nếu có link (cho "banner_ad")
  embedUrl?: string; // iframe src (cho "embed", VD YouTube/Vimeo/Facebook video)
  caption?: string; // chú thích nhỏ dưới ảnh
}

// ── Comments — kênh CSKH dưới mỗi sự kiện ─────────────────────────────────
// Yc 5/5 mục 1: bình luận giữ vĩnh viễn, không trôi như Facebook. Là kênh CSKH:
// khách hỏi → admin trả lời tại đây.
export type CommentAuthorRole = "guest" | "member" | "admin" | "moderator";

export interface EventComment {
  id: string;
  eventId: string;
  parentId?: string; // null = comment gốc; có giá trị = reply của comment cha
  authorName: string;
  authorPhone?: string; // để admin liên hệ lại nếu cần
  authorMemberCode?: string; // nếu user đã login bằng mã định danh
  authorRole: CommentAuthorRole;
  content: string; // plain text (escape HTML để chống XSS)
  createdAt: string; // ISO
  updatedAt?: string;
  isHidden?: boolean; // admin có thể ẩn (nhưng không xoá — giữ vĩnh viễn)
  hiddenReason?: string;
  // Moderation: nếu portal cấu hình duyệt trước → status="pending" cho đến khi admin duyệt
  status?: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT ENTITY
// ═══════════════════════════════════════════════════════════════════════════
export interface EventEntity {
  id: string;
  slug: string; // dùng cho share URL, unique
  title: string;
  description: string; // mô tả ngắn (plain text)
  content: string; // nội dung chi tiết HTML từ RebornEditor
  coverImageUrl?: string;

  // Thời gian sự kiện
  startDate: string; // ISO datetime
  endDate: string;

  // Thời gian mở đăng ký (có thể khác thời gian sự kiện)
  registrationOpenDate: string;
  registrationCloseDate: string;

  // Địa điểm + liên hệ
  venue: EventVenue; // Địa điểm chính (nơi tổ chức)
  additionalVenues?: EventVenue[]; // Các địa điểm phụ: bãi đỗ xe, chỗ chờ, lễ tân… (mỗi cái kèm label + toạ độ map)
  contactPerson: EventContactPerson;

  // Sức chứa + giá vé
  maxAttendees?: number; // để trống = không giới hạn
  ticketPrice?: number; // VND, 0 hoặc undefined = free

  // Trạng thái
  status: EventStatus;
  publishedAt?: string;

  // Metadata
  tags?: string[];
  category?: string; // VD: "workshop", "hội thảo", "lớp học", "networking"
  createdAt: string;
  updatedAt: string;
  createdBy?: string; // user id / tên

  // ── CHUNG: Mở rộng ────────────────────────────────
  dynamicFields?: DynamicFieldDefinition[]; // trường tùy biến trên form đăng ký
  addOnItems?: EventAddOnItem[]; // sản phẩm/dịch vụ bán thêm
  galleryImageUrls?: string[]; // ảnh giới thiệu hoạt động
  requirePaymentProof?: boolean; // bắt buộc upload bằng chứng thanh toán
  selectableDates?: string[]; // multi-day: ngày khách có thể chọn (YYYY-MM-DD)
  bankAccountOverride?: EventBankAccount; // override tenant default cho QR thanh toán

  // ── Yc 5/5 ─────────────────────────────────────────
  /** Block-based editor: ảnh + chữ kéo thả. Nếu non-empty → render thay cho `content` HTML cũ. */
  contentBlocks?: ContentBlock[];
  /** Đánh dấu là sự kiện test/nội bộ. Mặc định false. Khi true: ẩn khỏi public portal
   *  ngay cả khi status=published — tránh khách thấy event test còn sót. */
  isTest?: boolean;
  /** Bật/tắt tính năng bình luận dưới sự kiện. */
  commentsEnabled?: boolean;
  /** Bình luận có cần admin duyệt trước khi public không. */
  commentsModerated?: boolean;
  /** 3 luồng đăng ký được bật: "guest" (A: tên+SĐT), "member_signup" (B: yêu cầu mã mới),
   *  "member_login" (C: login mã+mật khẩu). Mặc định: ["guest"]. */
  registrationFlows?: ("guest" | "member_signup" | "member_login")[];
  /** Số đăng ký đang giữ chỗ (status != cancelled). BE-2 yc tester 2026-05-06
   *  trả trên public response để FE public hiển thị "Còn N/M chỗ" mà không
   *  phải gọi admin /registrations/list. Optional vì legacy cache có thể chưa có. */
  activeRegistrations?: number;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventSlug: string; // để tra cứu

  // Thông tin người đăng ký
  fullName: string;
  phone: string;
  email?: string;
  company?: string;
  note?: string;

  // Trạng thái
  status: RegistrationStatus;
  ticketCode?: string; // sinh khi confirm
  registeredAt: string;
  confirmedAt?: string;
  checkedInAt?: string;

  // Chuyển thành customer/member
  convertedToCustomerId?: string; // id trong CustomerService
  convertedAt?: string;

  // Nguồn
  source: "public_portal" | "manual" | "import";
  utmSource?: string;
  utmCampaign?: string;

  // ── CHUNG: Mở rộng ────────────────────────────────
  dynamicFieldValues?: Record<string, string>; // fieldId → giá trị
  selectedAddOns?: SelectedAddOn[]; // sản phẩm/dịch vụ đã chọn
  totalAmount?: number; // tổng tiền (vé + add-on)
  paymentProof?: PaymentProof; // [legacy single-proof] — giữ để backward compat
  paymentProofs?: PaymentProof[]; // [mới] — hỗ trợ tối đa 4 ảnh bill (theo yêu cầu W-House)
  selectedDates?: string[]; // ngày tham gia (multi-day)
  checkInOutRecords?: CheckInOutRecord[]; // lịch sử check-in/out (thay thế checkedInAt đơn giản)

  // Custom attributes từ customer service (join sẵn khi list)
  customerAttributes?: Record<string, string>; // { mentorCode: "5021", houseNumber: "255" }
  customerGroup?: { id: string | number; name: string }; // Mentor7 / Khác / ...

  // ── Yc 5/5 mục 2: 3 luồng đăng ký ────────────────
  /** Luồng đăng ký mà reg này dùng. Để BE phân biệt cách xử lý/follow-up. */
  flow?: "guest" | "member_signup" | "member_login";
  /** Mã định danh thành viên (nếu reg đến từ luồng C — đã login). */
  memberCode?: string;
  /** Trạng thái yêu cầu cấp mã (nếu reg đến từ luồng B). */
  memberSignupStatus?: "requested" | "approved" | "rejected";
  /** Mã đã được admin cấp sau khi approve (luồng B → C). */
  issuedMemberCode?: string;
}

// Helper type cho form create/edit
export type EventFormData = Omit<
  EventEntity,
  "id" | "slug" | "createdAt" | "updatedAt" | "publishedAt" | "status"
> & {
  status?: EventStatus;
};

// Stat tổng quan cho dashboard event
export interface EventStats {
  totalRegistrations: number; // TẤT CẢ đăng ký, bao gồm cả đã huỷ
  activeRegistrations: number; // đăng ký còn hiệu lực (khác "cancelled")
  pendingCount: number;
  confirmedCount: number;
  checkedInCount: number;
  cancelledCount: number;
  convertedToMemberCount: number;
  fillRate: number; // 0..1, so với maxAttendees — dùng activeRegistrations
  conversionRate: number; // members / totalRegistrations

  // ── CHUNG: Mở rộng ────────────────────────────────
  expectedRevenue: number; // dự thu: tổng tiền của đăng ký còn hiệu lực (khác "cancelled")
  collectedRevenue: number; // đã thu: chỉ tính reg có paymentProof.status === "approved"
  /** @deprecated dùng collectedRevenue hoặc expectedRevenue */
  totalRevenue: number;
  paymentPendingCount: number; // chờ duyệt thanh toán (submitted)
  paymentApprovedCount: number; // đã duyệt thanh toán
}
