// Mock data cho module Sự kiện — seed lần đầu vào localStorage.

import type { EventEntity } from "@/pages/CommunityHub/Events/types";

const now = new Date();
const iso = (daysFromNow: number, hour = 9): string => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const MOCK_EVENTS: EventEntity[] = [
  {
    id: "evt-seed-1",
    slug: "workshop-yoga-cho-nguoi-moi-bat-dau-demo",
    title: "Workshop Yoga cho người mới bắt đầu",
    description:
      "Buổi hướng dẫn 3 giờ cho người chưa từng tập yoga. Trải nghiệm 7 asana cơ bản + breathwork. Có quà tặng cho 20 người đăng ký đầu tiên.",
    content: `<h2>Nội dung buổi workshop</h2>
<p>Trong 3 giờ, bạn sẽ được hướng dẫn:</p>
<ul>
  <li><strong>7 asana cơ bản</strong> — tư thế đúng cho người mới</li>
  <li><strong>Kỹ thuật thở Pranayama</strong> — 3 kiểu thở phổ biến</li>
  <li><strong>Thiền thư giãn 15 phút</strong> cuối buổi</li>
</ul>
<h3>Người hướng dẫn</h3>
<p>Huấn luyện viên Nguyễn Thu Hà — 8 năm kinh nghiệm, chứng chỉ Yoga Alliance RYT-500.</p>
<h3>Chuẩn bị gì?</h3>
<p>Mang thảm yoga (hoặc thuê tại chỗ 30k), quần áo thoải mái, chai nước.</p>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800",
    startDate: iso(14, 8),
    endDate: iso(14, 11),
    registrationOpenDate: iso(-3, 0),
    registrationCloseDate: iso(13, 23),
    venue: {
      name: "Home FitPro Thảo Điền",
      address: "12 Thảo Điền, Q.2, TP.HCM",
      city: "TP.HCM",
      isOnline: false,
    },
    contactPerson: {
      name: "Nguyễn Thu Hà",
      phone: "0971234567",
      email: "ha.nguyen@reborn.vn",
      role: "HLV trưởng",
    },
    maxAttendees: 30,
    ticketPrice: 150_000,
    status: "published",
    publishedAt: iso(-2, 10),
    tags: ["yoga", "workshop", "beginner"],
    category: "workshop",
    createdAt: iso(-5, 14),
    updatedAt: iso(-2, 10),
    createdBy: "Admin Demo",
  },
  {
    id: "evt-seed-2",
    slug: "hoi-thao-dinh-duong-cho-nguoi-tap-demo",
    title: "Hội thảo Dinh dưỡng cho người tập thể thao",
    description:
      "Chuyên gia dinh dưỡng chia sẻ phác đồ ăn uống tối ưu để tăng cơ/giảm mỡ. Miễn phí, giới hạn 50 người.",
    content: `<h2>Chương trình</h2>
<ul>
  <li>19:00 — Welcome check-in</li>
  <li>19:15 — Phần 1: Macro & Calo cơ bản</li>
  <li>19:45 — Phần 2: Thực đơn mẫu 7 ngày</li>
  <li>20:15 — Q&amp;A với chuyên gia</li>
  <li>20:45 — Networking + nước ép miễn phí</li>
</ul>
<p><em>Event miễn phí — đăng ký trước để nhận tài liệu in.</em></p>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
    startDate: iso(21, 19),
    endDate: iso(21, 21),
    registrationOpenDate: iso(-1, 0),
    registrationCloseDate: iso(20, 23),
    venue: {
      name: "Co-Working FitPro Đống Đa",
      address: "99 Láng Hạ, Đống Đa, Hà Nội",
      city: "Hà Nội",
      isOnline: false,
    },
    contactPerson: {
      name: "Trần Minh Quân",
      phone: "0988888888",
      email: "quan.tran@reborn.vn",
      role: "BTC",
    },
    maxAttendees: 50,
    ticketPrice: 0,
    status: "published",
    publishedAt: iso(-1, 9),
    tags: ["dinh-duong", "hoi-thao", "mien-phi"],
    category: "hội thảo",
    createdAt: iso(-4, 11),
    updatedAt: iso(-1, 9),
    createdBy: "Admin Demo",
  },
  {
    id: "evt-seed-3",
    slug: "lop-mindfulness-mien-phi-demo",
    title: "Lớp Mindfulness cuối tuần (miễn phí)",
    description: "Lớp thiền chánh niệm 90 phút mỗi sáng thứ 7, giới hạn 20 người.",
    content: "<p>Chi tiết sẽ được cập nhật.</p>",
    startDate: iso(7, 7),
    endDate: iso(7, 8),
    registrationOpenDate: iso(-2, 0),
    registrationCloseDate: iso(6, 23),
    venue: {
      name: "Online",
      address: "Zoom",
      isOnline: true,
      onlineUrl: "https://zoom.us/j/0000000000",
    },
    contactPerson: {
      name: "Lê Hoàng Anh",
      phone: "0912345678",
    },
    maxAttendees: 20,
    ticketPrice: 0,
    status: "draft",
    tags: ["mindfulness", "online"],
    category: "lớp học",
    createdAt: iso(-1, 15),
    updatedAt: iso(-1, 15),
    createdBy: "Admin Demo",
  },
];
