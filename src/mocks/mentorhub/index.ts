// [MH] MentorHub - Mock data for all mentor dashboard modules
// Cloud CRM v1 · Reborn JSC

export const MOCK_MENTOR = {
  id: "MT-001",
  name: "Nguyễn Trọng Khoa",
  shortName: "NT",
  title: "Principal Engineer, Ex-Grab",
  email: "khoa@mentorhub.vn",
  phone: "+84 987 654 321",
  avatarBg: "#134E4A",
  bio: "12 năm kinh nghiệm hệ thống quy mô lớn. Từng dẫn dắt team 20+ engineers tại Grab Indonesia. Chuyên mảng microservices, distributed systems, Kubernetes.",
};

export const MOCK_KPI = {
  revenueMonth: 48200000,
  revenueTrend: 12.4,
  transactions: 187,
  npsScore: 4.92,
  npsTotal: 423,
  openTickets: 5,
  activeStudents: 1240,
};

export const MOCK_NEXT_SESSION = {
  courseName: "Kiến trúc Microservices với Spring Boot & Kubernetes",
  sessionNumber: 5,
  sessionTitle: "Service Mesh & Istio",
  startTime: "2026-04-23T20:00:00+07:00",
  durationMin: 120,
  registered: 23,
  capacity: 30,
  zoomId: "892-4731-0028",
};

export const MOCK_REVENUE_30D = [
  1.2, 1.5, 1.8, 2.1, 1.9, 2.4, 2.7, 3.1, 2.8, 3.2,
  3.5, 3.1, 2.9, 3.4, 3.8, 4.1, 3.7, 3.9, 4.2, 4.5,
  4.1, 3.8, 4.3, 4.7, 5.1, 4.8, 5.2, 5.5, 5.8, 6.2,
];

export const MOCK_COURSES = [
  {
    id: "CRS-01",
    title: "Kiến trúc Microservices với Spring Boot & Kubernetes",
    status: "live",
    sessions: 8,
    sessionsDone: 4,
    price: 2400000,
    originalPrice: 3200000,
    registered: 23,
    capacity: 30,
    revenue: 55200000,
    nps: 4.92,
    icon: "⎈",
    iconBg: "linear-gradient(135deg, #134E4A, #0F766E)",
  },
  {
    id: "CRS-02",
    title: "System Design Deep Dive cho Senior Engineers",
    status: "upcoming",
    sessions: 12,
    sessionsDone: 0,
    price: 3500000,
    originalPrice: 3500000,
    registered: 24,
    capacity: 30,
    revenue: 0,
    nps: 0,
    icon: "∞",
    iconBg: "linear-gradient(135deg, #1E40AF, #3B82F6)",
  },
  {
    id: "CRS-03",
    title: "Domain-Driven Design căn bản",
    status: "ended",
    sessions: 8,
    sessionsDone: 8,
    price: 1800000,
    originalPrice: 1800000,
    registered: 28,
    capacity: 30,
    revenue: 50400000,
    nps: 4.85,
    icon: "◈",
    iconBg: "linear-gradient(135deg, #374151, #6B7280)",
  },
  {
    id: "CRS-04",
    title: "Event-Driven Architecture với Kafka",
    status: "live",
    sessions: 6,
    sessionsDone: 3,
    price: 2100000,
    originalPrice: 2800000,
    registered: 18,
    capacity: 25,
    revenue: 37800000,
    nps: 4.78,
    icon: "⚡",
    iconBg: "linear-gradient(135deg, #B45309, #F59E0B)",
  },
  {
    id: "CRS-05",
    title: "Leadership cho Engineering Managers mới",
    status: "draft",
    sessions: 10,
    sessionsDone: 0,
    price: 4200000,
    originalPrice: 4200000,
    registered: 0,
    capacity: 20,
    revenue: 0,
    nps: 0,
    icon: "★",
    iconBg: "linear-gradient(135deg, #0F766E, #5EEAD4)",
  },
];

export const MOCK_STUDENTS = [
  { id: "S-001", name: "Trần Văn Đức", short: "TĐ", company: "FPT Software", role: "Senior Engineer", email: "duc.tv@fpt.com", phone: "+84 912 xxx 456", avatarBg: "#0F766E", ltv: 5400000, nps: 5.0, segment: "VIP", courses: 2, lastActive: "2h" },
  { id: "S-002", name: "Phạm Thu Hà", short: "PH", company: "TPBank", role: "Product Manager", email: "ha.pham@tpbank.vn", phone: "+84 908 xxx 223", avatarBg: "#B45309", ltv: 8200000, nps: 4.9, segment: "VIP", courses: 3, lastActive: "1d" },
  { id: "S-003", name: "Nguyễn Hoàng Anh", short: "NH", company: "VNG", role: "Tech Lead", email: "anh.nh@vng.com.vn", phone: "+84 936 xxx 778", avatarBg: "#134E4A", ltv: 4600000, nps: 4.7, segment: "Active", courses: 2, lastActive: "3d" },
  { id: "S-004", name: "Lê Minh Tuấn", short: "LT", company: "Momo", role: "Backend", email: "tuan.lm@momo.vn", phone: "+84 965 xxx 112", avatarBg: "#7C2D12", ltv: 2200000, nps: 4.6, segment: "Active", courses: 1, lastActive: "5d" },
  { id: "S-005", name: "Vũ Hoàng Nam", short: "VN", company: "Shopee", role: "Staff Engineer", email: "nam.vh@shopee.com", phone: "+84 903 xxx 445", avatarBg: "#166534", ltv: 11800000, nps: 5.0, segment: "VIP", courses: 4, lastActive: "1h" },
  { id: "S-006", name: "Đặng Thùy Linh", short: "ĐL", company: "Vinhomes", role: "BA Lead", email: "linh.dt@vinhomes.vn", phone: "+84 919 xxx 667", avatarBg: "#991B1B", ltv: 2800000, nps: 4.0, segment: "Churn risk", courses: 1, lastActive: "14d" },
  { id: "S-007", name: "Bùi Đức Năng", short: "BN", company: "TNTech", role: "Solution Architect", email: "nang.bd@tnteco.vn", phone: "+84 945 xxx 990", avatarBg: "#0F766E", ltv: 3400000, nps: 4.8, segment: "Active", courses: 1, lastActive: "2d" },
  { id: "S-008", name: "Dương Văn Chung", short: "DC", company: "Tiki", role: "DevOps", email: "chung.dv@tiki.vn", phone: "+84 977 xxx 334", avatarBg: "#1E40AF", ltv: 1200000, nps: 0, segment: "New", courses: 1, lastActive: "now" },
  { id: "S-009", name: "Trần Kim Anh", short: "TK", company: "Tiki", role: "UX Lead", email: "kimanh.t@tiki.vn", phone: "+84 988 xxx 001", avatarBg: "#B45309", ltv: 5600000, nps: 4.9, segment: "Active", courses: 2, lastActive: "6h" },
];

export const MOCK_TICKETS = [
  { id: "TK-2341", student: "Đặng Thùy Linh", short: "ĐL", avatarBg: "#991B1B", subject: "Không nhận được link Zoom buổi 3", priority: "high", status: "open", slaHours: 2, createdAt: "2h trước", channel: "Email", aiContext: "DMARC bounce detected — email buổi học không gửi được do cấu hình DKIM của Vinhomes." },
  { id: "TK-2340", student: "Lê Minh Tuấn", short: "LT", avatarBg: "#7C2D12", subject: "Xin hoá đơn VAT cho khoá Microservices", priority: "medium", status: "open", slaHours: 12, createdAt: "5h trước", channel: "Zalo", aiContext: "Payment đã complete 01/04. Cần xuất hoá đơn điện tử theo MST công ty." },
  { id: "TK-2339", student: "Trần Văn Đức", short: "TĐ", avatarBg: "#0F766E", subject: "Hỏi thêm về recording buổi 2", priority: "low", status: "open", slaHours: 24, createdAt: "1d trước", channel: "In-app", aiContext: "Recording buổi 2 đã public từ 21/04. Có thể truy cập qua Session Library." },
  { id: "TK-2338", student: "Phạm Thu Hà", short: "PH", avatarBg: "#B45309", subject: "Đổi lịch buổi tư vấn 1:1", priority: "medium", status: "pending", slaHours: 8, createdAt: "8h trước", channel: "Email", aiContext: "Booking gốc 24/04 14:00. Calendar có slot trống 25/04 10:00 hoặc 26/04 15:30." },
  { id: "TK-2337", student: "Bùi Đức Năng", short: "BN", avatarBg: "#0F766E", subject: "Câu hỏi về homework buổi 4", priority: "low", status: "resolved", slaHours: 0, createdAt: "2d trước", channel: "In-app", aiContext: "Đã reply với hint về thuật toán consistent hashing." },
];

export const MOCK_REVIEWS = [
  { student: "Trần Văn Đức", short: "TĐ", course: "Microservices", nps: 5, comment: "Mentor Khoa giảng rất sâu, đi thẳng vào các case thực tế ở Grab. Recording và AI summary giúp ôn lại rất nhanh.", time: "2 ngày trước", anonymous: false },
  { student: "Phạm Thu Hà", short: "PH", course: "Microservices", nps: 5, comment: "Best course tôi từng tham gia. Nội dung chất lượng production, không phải lý thuyết suông.", time: "3 ngày trước", anonymous: false },
  { student: "(Ẩn danh)", short: "?", course: "Event-Driven", nps: 4, comment: "Nội dung tốt nhưng pacing hơi nhanh ở buổi 2. Cần thêm breathing room cho Q&A.", time: "1 tuần trước", anonymous: true },
  { student: "Nguyễn Hoàng Anh", short: "NH", course: "Microservices", nps: 5, comment: "AI meeting notes là game changer. Tiết kiệm hàng giờ review lại session.", time: "1 tuần trước", anonymous: false },
  { student: "Vũ Hoàng Nam", short: "VN", course: "DDD", nps: 5, comment: "Đã theo 4 khoá của anh Khoa. Chất lượng consistent và luôn update theo industry.", time: "2 tuần trước", anonymous: false },
];

export const MOCK_NPS_TREND = [4.65, 4.72, 4.78, 4.81, 4.88, 4.92];

export const MOCK_SESSION_REVIEW = {
  courseName: "Kiến trúc Microservices",
  sessionNumber: 3,
  sessionTitle: "Service Discovery & Load Balancing",
  date: "21/04/2026",
  duration: "1h 58m",
  attendance: { present: 21, late: 3, absent: 2, total: 26 },
  sentiment: { positive: 78, neutral: 18, negative: 4 },
  keyPoints: [
    { time: "02:14", text: "Mở đầu: giới thiệu service discovery pattern (client-side vs server-side)" },
    { time: "12:47", text: "Demo Eureka server setup với Spring Cloud Netflix" },
    { time: "28:30", text: "Thảo luận load balancing strategies: round-robin, weighted, least-connections" },
    { time: "45:15", text: "Case study: Grab's service mesh migration từ Consul sang Istio" },
    { time: "1:02:08", text: "Q&A: xử lý service failover trong multi-region setup" },
    { time: "1:18:33", text: "Homework walkthrough: implement health check endpoint" },
    { time: "1:34:22", text: "Lightning demo: circuit breaker với Resilience4j" },
    { time: "1:52:10", text: "Wrap-up + preview buổi 4: API Gateway patterns" },
  ],
  questions: [
    { time: "0:34:11", student: "Trần Văn Đức", q: "Làm sao handle split-brain trong Eureka?", a: "Dùng peer-awareness mode với quorum tối thiểu 3 nodes, kết hợp với self-preservation mode." },
    { time: "1:05:20", student: "Phạm Thu Hà", q: "So sánh Istio vs Linkerd cho team mới bắt đầu?", a: "Linkerd đơn giản hơn, Istio nhiều feature hơn. Team <10 nên bắt đầu Linkerd." },
    { time: "1:28:45", student: "(Ẩn danh)", q: "Consul có còn được khuyên dùng không?", a: "Còn, đặc biệt cho hybrid cloud và legacy systems. Không bắt buộc phải migrate sang Istio." },
  ],
  actionItems: [
    "Homework: Implement service discovery với Eureka, deadline Thứ Sáu 26/04",
    "Đọc trước: Istio Architecture chapter (doc đã share)",
    "Setup local K8s cluster với minikube cho buổi 4",
    "Review: circuit breaker demo code trên GitHub",
    "Optional: xem video talks của Netflix về Hystrix evolution",
  ],
};
