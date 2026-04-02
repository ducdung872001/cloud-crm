// ═══════════════════════════════════════════════════════
// CRM BANKING – Mock Data
// ═══════════════════════════════════════════════════════

export const MOCK_LEADS = [
  { id: "LD001", name: "Nguyễn Minh Tuấn", sub: "0912 345 678 · Cầu Giấy, HN", product: "vay", productLabel: "Vay TS", value: "1.2 tỷ", source: "Web", rm: "Hà Thu", status: "hot", statusLabel: "Nóng", date: "15/03" },
  { id: "LD002", name: "Công ty CP Minh Long", sub: "Doanh nghiệp · Q3, HN", product: "sme", productLabel: "Vay DN", value: "5.8 tỷ", source: "Referral", rm: "Văn Đức", status: "hot", statusLabel: "Nóng", date: "16/03" },
  { id: "LD003", name: "Lê Thị Hương", sub: "0909 111 222 · Đống Đa, HN", product: "tk", productLabel: "Tiết kiệm", value: "800 tr", source: "Chi nhánh", rm: "Trần Nguyên", status: "warm", statusLabel: "Ấm", date: "17/03" },
  { id: "LD004", name: "Phạm Xuân Đức", sub: "0934 567 890 · Hoàn Kiếm, HN", product: "banca", productLabel: "Banca", value: "2.4 tỷ", source: "Telesale", rm: "Ngọc Anh", status: "warm", statusLabel: "Ấm", date: "18/03" },
  { id: "LD005", name: "TNHH Thái Bình Dương", sub: "Doanh nghiệp · Thanh Xuân, HN", product: "sme", productLabel: "Vay DN", value: "8.0 tỷ", source: "Web", rm: "Minh Quân", status: "cold", statusLabel: "Lạnh", date: "14/03" },
  { id: "LD006", name: "Hoàng Thị Lan", sub: "0965 432 100 · Ba Đình, HN", product: "the", productLabel: "Thẻ TD", value: "HM 500 tr", source: "App", rm: "Hà Thu", status: "hot", statusLabel: "Nóng", date: "19/03" },
  { id: "LD007", name: "Trần Văn Hùng", sub: "0978 234 567 · Hai Bà Trưng, HN", product: "vay", productLabel: "Vay MN", value: "2.8 tỷ", source: "Referral", rm: "Trần Nguyên", status: "warm", statusLabel: "Ấm", date: "13/03" },
  { id: "LD008", name: "GreenTech Vietnam JSC", sub: "Doanh nghiệp · Tây Hồ, HN", product: "sme", productLabel: "Vay DN", value: "15.2 tỷ", source: "Partner", rm: "Ngọc Anh", status: "hot", statusLabel: "Nóng", date: "20/03" },
];

export const MOCK_PIPELINE_DEALS = [
  { id: "PL001", name: "Nguyễn Minh Tuấn", meta: "RM: Hà Thu · HN-Q1", amount: "1.2 tỷ", product: "vay", productLabel: "Vay TS", rmInitials: "HT", rmColor: "#1565C0", date: "15/03", stage: "approach" },
  { id: "PL002", name: "Công ty CP Minh Long", meta: "RM: Văn Đức · HN-Q3", amount: "5.8 tỷ", product: "the", productLabel: "Thẻ TD", rmInitials: "VĐ", rmColor: "#5C6BC0", date: "16/03", stage: "approach" },
  { id: "PL003", name: "Hoàng Thị Lan", meta: "RM: Trần Nguyên · HN-Q2", amount: "1.8 tỷ", product: "tk", productLabel: "Tiết kiệm", rmInitials: "TN", rmColor: "#0097A7", date: "17/03", stage: "approach" },
  { id: "PL004", name: "Lê Thị Hương", meta: "RM: Trần Nguyên · HN-Q2", amount: "800 tr", product: "tk", productLabel: "Tiết kiệm", rmInitials: "TN", rmColor: "#0097A7", date: "17/03", stage: "consult" },
  { id: "PL005", name: "Phạm Xuân Đức", meta: "RM: Ngọc Anh · HN-Q4", amount: "2.4 tỷ", product: "banca", productLabel: "Banca", rmInitials: "NA", rmColor: "#7B1FA2", date: "18/03", stage: "consult" },
  { id: "PL006", name: "Trần Văn Hùng", meta: "RM: Trần Nguyên · HN-Q2", amount: "2.8 tỷ", product: "vay", productLabel: "Vay MN", rmInitials: "TN", rmColor: "#0097A7", date: "18/03", stage: "consult" },
  { id: "PL007", name: "TNHH Đức Thành", meta: "RM: Minh Quân · HN-Q1", amount: "12.5 tỷ", product: "sme", productLabel: "Vay DN", rmInitials: "MQ", rmColor: "#388E3C", date: "19/03", stage: "proposal" },
  { id: "PL008", name: "ABC Corp International", meta: "RM: Hà Thu · HN-Q1", amount: "4.8 tỷ", product: "sme", productLabel: "Vay DN", rmInitials: "HT", rmColor: "#1565C0", date: "19/03", stage: "proposal" },
  { id: "PL009", name: "GreenTech Vietnam", meta: "RM: Ngọc Anh · HN-Q2", amount: "15.2 tỷ", product: "sme", productLabel: "Vay DN", rmInitials: "NA", rmColor: "#7B1FA2", date: "20/03", stage: "appraisal", highlight: "pending" },
  { id: "PL010", name: "Trương Bảo Châu", meta: "RM: Hà Thu · HN-Q2", amount: "3.6 tỷ", product: "the", productLabel: "Thẻ VIP", rmInitials: "HT", rmColor: "#1565C0", date: "20/03", stage: "closing", highlight: "won" },
  { id: "PL011", name: "TNHH Thái Bình Dương", meta: "RM: Minh Quân · HN-Q1", amount: "8.0 tỷ", product: "sme", productLabel: "Vay DN", rmInitials: "MQ", rmColor: "#388E3C", date: "21/03", stage: "closing", highlight: "won" },
];

export const MOCK_APPROVALS = [
  { id: "PD-2851", customer: "TNHH Đức Thành", type: "Lãi suất ưu đãi 7.5%", value: "12.5 tỷ", rm: "Minh Quân", status: "pending", deadline: "22/03" },
  { id: "PD-2850", customer: "ABC Corp International", type: "Hạn mức tín dụng đặc biệt", value: "4.8 tỷ", rm: "Hà Thu", status: "reviewing", deadline: "23/03" },
  { id: "PD-2849", customer: "GreenTech Vietnam", type: "Phê duyệt nhanh khoản vay", value: "15.2 tỷ", rm: "Ngọc Anh", status: "pending", deadline: "21/03" },
  { id: "PD-2848", customer: "Phạm Xuân Đức", type: "Miễn phí năm đầu Banca", value: "2.4 tỷ phí", rm: "Ngọc Anh", status: "reviewing", deadline: "25/03" },
  { id: "PD-2847", customer: "Trương Bảo Châu", type: "Thẻ Infinity – Ưu đãi đặc biệt", value: "3.6 tỷ", rm: "Hà Thu", status: "approved", deadline: "20/03" },
  { id: "PD-2846", customer: "TNHH Thái Bình Dương", type: "Gia hạn khoản vay 12 tháng", value: "8.0 tỷ", rm: "Minh Quân", status: "approved", deadline: "19/03" },
  { id: "PD-2845", customer: "Lê Hải Nam", type: "Cơ cấu nợ", value: "450 tr", rm: "Trần Nguyên", status: "rejected", deadline: "18/03" },
];

export const MOCK_CAMPAIGNS = [
  { id: "CP001", emoji: "🏦", name: "Vay Mua Nhà Lãi Suất Ưu Đãi Q1/2025", status: "active", statusLabel: "Đang chạy", period: "01/01/2025 – 31/03/2025", product: "Vay tài sản", scope: "Chi nhánh HN", targetRevenue: "80 tỷ", actualRevenue: "62.4 tỷ", targetCustomers: 200, actualCustomers: 247, contractsSigned: 84, pct: 78, pctColor: "var(--success)", borderColor: "rgba(33,150,243,0.2)", docs: ["📄 Script tư vấn vay mua nhà.pdf", "📊 Bảng lãi suất Q1-2025.xlsx", "🖼 Brochure ưu đãi.pptx"] },
  { id: "CP002", emoji: "💳", name: "Mở Thẻ Tín Dụng – Hoàn Tiền 10%", status: "active", statusLabel: "Đang chạy", period: "15/02/2025 – 15/04/2025", product: "Thẻ tín dụng", scope: "Toàn hệ thống", targetRevenue: "500 thẻ", actualRevenue: "312 thẻ", targetCustomers: 500, actualCustomers: 312, contractsSigned: 312, pct: 62, pctColor: "var(--gold)", borderColor: "rgba(245,166,35,0.2)", docs: ["📄 Script mở thẻ tín dụng.pdf", "📊 Biểu phí thẻ 2025.pdf"] },
  { id: "CP003", emoji: "🛡", name: "Bancassurance Mùa Hè 2025", status: "upcoming", statusLabel: "Sắp bắt đầu", period: "01/04/2025 – 30/06/2025", product: "Bancassurance", scope: "Chi nhánh + Digital", targetRevenue: "40 tỷ", actualRevenue: "—", targetCustomers: 300, actualCustomers: 0, contractsSigned: 0, pct: 0, pctColor: "var(--warning)", borderColor: "", docs: [] },
];

export const MOCK_DOCS = [
  { id: "D001", icon: "📄", name: "Script tư vấn Vay Mua Nhà", size: "PDF · 2.4 MB", updated: "01/03/2025", type: "script", product: "Vay tài sản", tagColor: "var(--accent-soft)", tagTextColor: "var(--accent-bright)", productColor: "var(--accent-soft)", productTextColor: "var(--accent-bright)" },
  { id: "D002", icon: "📊", name: "Bảng lãi suất Q1-2025", size: "XLSX · 380 KB", updated: "28/02/2025", type: "rate", product: "Vay tài sản", tagColor: "var(--success-soft)", tagTextColor: "var(--success)", productColor: "var(--accent-soft)", productTextColor: "var(--accent-bright)" },
  { id: "D003", icon: "🖼", name: "Brochure Vay Mua Nhà 2025", size: "PPTX · 5.1 MB", updated: "15/02/2025", type: "brochure", product: "Vay tài sản", tagColor: "rgba(195,155,211,0.15)", tagTextColor: "var(--purple)", productColor: "var(--accent-soft)", productTextColor: "var(--accent-bright)" },
  { id: "D004", icon: "📄", name: "Script mở Thẻ Tín Dụng", size: "PDF · 1.8 MB", updated: "05/03/2025", type: "script", product: "Thẻ tín dụng", tagColor: "var(--accent-soft)", tagTextColor: "var(--accent-bright)", productColor: "var(--gold-soft)", productTextColor: "var(--gold)" },
  { id: "D005", icon: "📊", name: "Biểu phí thẻ 2025", size: "PDF · 920 KB", updated: "01/01/2025", type: "rate", product: "Thẻ tín dụng", tagColor: "var(--success-soft)", tagTextColor: "var(--success)", productColor: "var(--gold-soft)", productTextColor: "var(--gold)" },
  { id: "D006", icon: "🖼", name: "Brochure Bancassurance 2025", size: "PDF · 4.2 MB", updated: "20/02/2025", type: "brochure", product: "Bancassurance", tagColor: "rgba(195,155,211,0.15)", tagTextColor: "var(--purple)", productColor: "rgba(195,155,211,0.15)", productTextColor: "var(--purple)" },
  { id: "D007", icon: "📄", name: "Script tư vấn Bancassurance", size: "PDF · 3.1 MB", updated: "15/02/2025", type: "script", product: "Bancassurance", tagColor: "var(--accent-soft)", tagTextColor: "var(--accent-bright)", productColor: "rgba(195,155,211,0.15)", productTextColor: "var(--purple)" },
  { id: "D008", icon: "📋", name: "Mẫu hồ sơ vay cá nhân", size: "DOCX · 280 KB", updated: "10/03/2025", type: "form", product: "Vay tài sản", tagColor: "var(--warning-soft)", tagTextColor: "var(--warning)", productColor: "var(--accent-soft)", productTextColor: "var(--accent-bright)" },
  { id: "D009", icon: "📋", name: "Mẫu hồ sơ vay doanh nghiệp", size: "DOCX · 320 KB", updated: "08/03/2025", type: "form", product: "Vay DN", tagColor: "var(--warning-soft)", tagTextColor: "var(--warning)", productColor: "rgba(0,200,150,0.1)", productTextColor: "var(--success)" },
  { id: "D010", icon: "📊", name: "Báo cáo KPI tháng 2/2025", size: "XLSX · 1.1 MB", updated: "03/03/2025", type: "rate", product: "Nội bộ", tagColor: "var(--success-soft)", tagTextColor: "var(--success)", productColor: "var(--surface)", productTextColor: "var(--text-secondary)" },
];

export const MOCK_TASKS = [
  { id: "T001", name: "Gọi điện KH Nguyễn Minh Tuấn – Follow up vay 1.2 tỷ", meta: "09:00 · Hotline · Hà Thu phụ trách", priority: "high", done: false, day: "today" },
  { id: "T002", name: "Họp review đề xuất TNHH Đức Thành – Vay DN 12.5 tỷ", meta: "10:30 · Phòng họp B2 · Credit team", priority: "high", done: false, day: "today" },
  { id: "T003", name: "Gửi đề xuất thẻ Infinity cho KH Trương Bảo Châu", meta: "08:00 · Email · Hoàn thành", priority: "low", done: true, day: "today" },
  { id: "T004", name: "Nhắc gia hạn bảo hiểm – KH Lê Thị Hương", meta: "14:00 · SMS tự động · Đáo hạn 25/04", priority: "med", done: false, day: "today" },
  { id: "T005", name: "Tư vấn KH Phạm Xuân Đức – Banca package 2.4 tỷ", meta: "15:30 · Gặp trực tiếp · CN Cầu Giấy", priority: "high", done: false, day: "today" },
  { id: "T006", name: "Gặp mặt KH mới từ Referral – TNHH Thái Bình Dương", meta: "09:00 · Trụ sở KH · Minh Quân", priority: "med", done: false, day: "tomorrow" },
  { id: "T007", name: "Review KPI tháng với Branch Manager", meta: "16:00 · Phòng họp A1", priority: "med", done: false, day: "tomorrow" },
  { id: "T008", name: "Submit hồ sơ GreenTech Vietnam lên Credit", meta: "EOD · Portal · Ngọc Anh", priority: "high", done: false, day: "tomorrow" },
];

export const MOCK_CUSTOMERS = [
  {
    id: "KH001", initials: "TC", name: "Trương Bảo Châu", type: "vip", typeLabel: "VIP Platinum",
    phone: "0912 888 999", email: "t.bchau@gmail.com", address: "Cầu Giấy, HN",
    rm: "Hà Thu", rmCode: "HN-Q2",
    products: [
      { label: "Tiền gửi CKH", value: "2.1 tỷ", color: "var(--success)" },
      { label: "Dư nợ vay", value: "850 tr", color: "var(--accent-bright)" },
      { label: "Thẻ tín dụng", value: "2 thẻ", color: "" },
      { label: "Bảo hiểm", value: "3 HĐ", color: "" },
    ],
    signals: [
      { type: "upsell", title: "Upsell", desc: "Đủ điều kiện thẻ Infinity" },
      { type: "renew", title: "Tái tục", desc: "Bảo hiểm đáo hạn 25/04" },
      { type: "alert", title: "Cảnh báo", desc: "Chưa thanh toán thẻ 15 ngày" },
    ],
  },
  {
    id: "KH002", initials: "NT", name: "Nguyễn Minh Tuấn", type: "sme", typeLabel: "Cá nhân",
    phone: "0912 345 678", email: "nm.tuan@email.com", address: "Cầu Giấy, HN",
    rm: "Hà Thu", rmCode: "HN-Q1",
    products: [
      { label: "Tiền gửi", value: "420 tr", color: "var(--success)" },
      { label: "Dư nợ vay", value: "1.2 tỷ", color: "var(--accent-bright)" },
      { label: "Thẻ tín dụng", value: "1 thẻ", color: "" },
      { label: "Bảo hiểm", value: "—", color: "" },
    ],
    signals: [
      { type: "upsell", title: "Cross-sell", desc: "Chưa có sản phẩm bảo hiểm" },
      { type: "alert", title: "Nhắc", desc: "Đến hạn thanh toán khoản vay 28/03" },
    ],
  },
  {
    id: "KH003", initials: "DT", name: "Công ty TNHH Đức Thành", type: "corp", typeLabel: "Doanh nghiệp",
    phone: "024 3232 8888", email: "info@ducthanh.com", address: "Hoàn Kiếm, HN",
    rm: "Minh Quân", rmCode: "HN-Q1",
    products: [
      { label: "Tài khoản TT", value: "8.4 tỷ", color: "var(--success)" },
      { label: "Dư nợ vay", value: "12.5 tỷ", color: "var(--accent-bright)" },
      { label: "LC/Bảo lãnh", value: "3 HĐ", color: "" },
      { label: "Banca DN", value: "—", color: "" },
    ],
    signals: [
      { type: "upsell", title: "Upsell", desc: "Đủ điều kiện gói Cash Management" },
      { type: "renew", title: "Gia hạn", desc: "Hợp đồng vay đến hạn 01/06" },
    ],
  },
];

export const MOCK_NOTIFICATIONS = [
  { id: "N001", title: "KH Lê Hải Nam sắp đáo hạn thẻ tín dụng", sub: "Hạn thanh toán còn 2 ngày · 22/03/2025", time: "2p", color: "var(--danger)", read: false },
  { id: "N002", title: "Đề xuất #PD-2847 đã được phê duyệt cấp 3", sub: "Công ty ABC Corp · Vay 4.8 tỷ", time: "15p", color: "var(--success)", read: false },
  { id: "N003", title: "Lead mới từ Website: TNHH Thái Bình Dương", sub: "Vay doanh nghiệp · 8 tỷ · Chờ phân công RM", time: "32p", color: "var(--gold)", read: false },
  { id: "N004", title: "Trương Bảo Châu gửi NPS 10 điểm", sub: "RM rất nhiệt tình, tư vấn chuyên nghiệp", time: "1g", color: "var(--border-hover)", read: true },
  { id: "N005", title: "Nhắc nhở: Họp KPI tháng 3 lúc 16:00", sub: "Ngày mai 21/03 · Phòng họp A1", time: "3g", color: "var(--border-hover)", read: true },
];

// ── Aliases for backward compatibility ──────────────────
export const MOCK_DEALS = MOCK_PIPELINE_DEALS;

export const LEADERBOARD = [
  { rank: 1, initials: "HT", name: "Nguyễn Hà Thu", branch: "HN – Quận 1", value: "4.2 tỷ", pct: 100, gradFrom: "#F5A623", gradTo: "#F57C00", barColor: "var(--gold)" },
  { rank: 2, initials: "TN", name: "Trần Nguyên", branch: "HN – Quận 2", value: "3.8 tỷ", pct: 90, gradFrom: "#1565C0", gradTo: "#2196F3", barColor: "var(--success)" },
  { rank: 3, initials: "NA", name: "Vũ Ngọc Anh", branch: "HN – Quận 4", value: "3.1 tỷ", pct: 74, gradFrom: "#7B1FA2", gradTo: "#9C27B0", barColor: "var(--success)" },
  { rank: 4, initials: "MQ", name: "Lê Minh Quân", branch: "HN – Quận 1", value: "2.7 tỷ", pct: 64, gradFrom: "#388E3C", gradTo: "#4CAF50", barColor: "var(--success)" },
  { rank: 5, initials: "VĐ", name: "Hoàng Văn Đức", branch: "HN – Quận 3", value: "2.3 tỷ", pct: 55, gradFrom: "#0097A7", gradTo: "#00BCD4", barColor: "var(--success)" },
];
