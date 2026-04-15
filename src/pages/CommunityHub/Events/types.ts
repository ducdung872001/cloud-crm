// Event types cho phân hệ Sự kiện — Community Hub.
// Prototype dùng localStorage; BE sau này thay bằng API calls (xem docs/events/backend-spec.md).

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
  isOnline?: boolean;
  onlineUrl?: string; // Zoom/Meet link
}

export interface EventContactPerson {
  name: string;
  phone: string;
  email?: string;
  role?: string; // VD: "Trưởng BTC"
}

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
  venue: EventVenue;
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
  totalRegistrations: number;
  pendingCount: number;
  confirmedCount: number;
  checkedInCount: number;
  cancelledCount: number;
  convertedToMemberCount: number;
  fillRate: number; // 0..1, so với maxAttendees
  conversionRate: number; // members / registrations
}
