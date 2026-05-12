// Members module — schema mã định danh + lịch sử thành viên.
//
// Yc 5/5 mục 3 (CORE): mã định danh cố định + mã chức vụ song song.
// Format: <HẠNG><STT cá nhân>-<STT nhóm>  vd: 5971-300, 6676-334
//   - HẠNG: 1 chữ số đầu của STT cá nhân (đang dùng "6" = thành viên chính thức)
//   - STT cá nhân: tăng dần theo thời gian gia nhập (~6.000+)
//   - STT nhóm: tăng dần, mỗi nhóm 20 người
//   - KHÔNG phân theo địa lý — chỉ theo thời gian
// Trưởng nhóm có mã thêm: master-<N>
//
// Mã chức vụ / khoá học: cấp khi user tham gia khoá mới (Mentor 7, Master,
// Nhà giáo dục gia đình…). Không sửa cột cũ — luôn tạo cột mới. Đời 1 user có
// thể tích ~10 mã loại này.

/** Mã định danh cố định — cấp 1 lần, đi suốt đời, vai trò = số CCCD. */
export interface MemberIdentityCode {
  /** Số thứ tự cá nhân (chuỗi để giữ leading zero nếu có). VD "5971" */
  personalSeq: string;
  /** Số nhóm (nguyên dương). 20 người/nhóm. */
  groupSeq: number;
  /** Hạng = 1 chữ số đầu của personalSeq, derived. Hiện đang lên đầu 6. */
  rank: string;
}

/** Mã chức vụ / khóa học — append column, không sửa cột cũ. */
export interface MemberRoleCode {
  id: string;
  /** Mã đầy đủ. VD "mentor-7", "master-1", "ngd-12" (Nhà Giáo Dục Gia Đình thứ 12) */
  code: string;
  /** Loại role để filter / report. */
  category: "mentor" | "master" | "educator" | "course" | "other";
  /** Tên hiển thị. VD "Mentor 7", "Master Group 1" */
  label: string;
  /** Khi nào được cấp. ISO. */
  issuedAt: string;
  /** Ai cấp. */
  issuedBy?: string;
  /** Khoá học / lớp / event link. */
  refEventId?: string;
  refCourseId?: string;
}

/** Trạng thái thành viên. */
export type MemberStatus = "active" | "suspended" | "graduated" | "inactive";

/** Thành viên chính. */
export interface MemberEntity {
  id: string; // UUID nội bộ BE
  identity: MemberIdentityCode;
  /** Mã hiển thị canonical: `${personalSeq}-${groupSeq}`. Derived từ identity. */
  memberCode: string;
  /** Mã trưởng nhóm nếu có. VD "master-1". null = không phải trưởng nhóm. */
  masterCode?: string | null;
  /** Mã chức vụ / khóa học song song, append-only. */
  roleCodes: MemberRoleCode[];

  // Hồ sơ cơ bản
  fullName: string;
  phone: string;
  email?: string;
  occupation?: string; // "công việc hiện tại" — Ngọc note
  avatarUrl?: string;
  birthday?: string;
  gender?: "male" | "female" | "other";
  address?: string;

  // Auth (luồng C)
  passwordSet: boolean; // false = admin chưa cấp pwd / chưa setup
  lastLoginAt?: string;

  // Trạng thái
  status: MemberStatus;
  joinedAt: string;
  // Tạo mới qua hệ thống nào
  source?: "event_signup" | "manual" | "import" | "api";

  createdAt: string;
  updatedAt: string;
}

/** Yêu cầu cấp mã (luồng B). Admin duyệt → tạo MemberEntity. */
export interface MemberSignupRequest {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  occupation?: string;
  /** Sự kiện gốc dẫn user đến đăng ký mã (nếu có). */
  fromEventId?: string;
  fromRegistrationId?: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
  /** Mã được cấp khi approve. */
  issuedMemberCode?: string;
  /** SĐT đã được verify qua Firebase OTP lúc submit signup-request (yc BE 2026-05-12).
   *  Phase 2 OTP-first: form bắt user verify trước khi gửi request. Admin thấy
   *  badge "📱 SĐT đã verify" trong list để skip gọi điện xác minh. */
  phoneVerified?: boolean;
  /** Firebase UID extract từ idToken (BE lưu để tránh dual-verify). */
  firebaseUid?: string;
  createdAt: string;
}

/** Nhóm 20 người — tự động tạo khi đủ. */
export interface MemberGroup {
  id: string;
  groupSeq: number; // 1, 2, 3, ...
  name?: string; // optional admin label, vd "Nhóm Hà Nội T5/2026"
  /** Mã trưởng nhóm. */
  masterCode?: string;
  /** Member id của trưởng nhóm. */
  leaderMemberId?: string;
  memberIds: string[]; // tối đa 20
  createdAt: string;
  closedAt?: string; // khi đủ 20 người → đóng nhóm, mở nhóm tiếp theo
}

// ── Lịch sử thành viên — timeline ─────────────────────────────────────────
// Yc 5/5 mục 3.3: mọi sự kiện trong đời thành viên đều link về mã định danh.
// Click tháng → hoạt động trong tháng; click ngày → chi tiết ngày.
export type MemberHistoryKind =
  | "event_checkin" // tham dự sự kiện
  | "service_used" // dùng dịch vụ (cà phê, làm da mặt, ngâm chân…)
  | "product_bought" // mua sản phẩm
  | "course_completed" // hoàn thành khoá học
  | "role_issued" // được cấp mã chức vụ mới
  | "payment_in" // chuyển tiền vào
  | "debt_recorded" // ghi nợ
  | "debt_settled" // tất toán nợ
  | "rating_given" // được đánh giá / cho sao
  | "note"; // ghi chú admin

export interface MemberHistoryItem {
  id: string;
  memberId: string;
  memberCode: string;
  kind: MemberHistoryKind;
  /** Mô tả ngắn hiển thị trên timeline. */
  title: string;
  /** Chi tiết hơn (optional). */
  description?: string;
  /** Số tiền liên quan (VND): payment_in, debt_*, product_bought… */
  amountVnd?: number;
  /** Đánh giá / sao (1-5). */
  rating?: number;
  /** Tham chiếu chéo. */
  refEventId?: string;
  refRegistrationId?: string;
  refServiceId?: string;
  refProductId?: string;
  /** Variant / size / màu (cho product_bought). */
  variant?: string;
  /** Trạng thái sản phẩm/dịch vụ: "đã đăng ký" / "đã mua" / "đã hủy" — Ngọc note. */
  refStatus?: string;
  /** Khi nào xảy ra. ISO. */
  occurredAt: string;
  createdAt: string;
  createdBy?: string;
}

/** Stats quick cho member detail page. */
export interface MemberStats {
  totalEvents: number;
  totalSpent: number;
  totalDebt: number; // dương = còn nợ
  totalServices: number;
  averageRating?: number;
  memberSince: string; // joinedAt
}
