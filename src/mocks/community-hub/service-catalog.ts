// [CH] Community Hub - Danh mục dịch vụ tập trung
// Tất cả dịch vụ của Hub, phân theo nhóm ngành

export interface IServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  unit: string;
  price: number;       // giá bán lẻ (0 = chỉ trong gói)
  sellable: boolean;   // có thể bán lẻ cho khách vãng lai?
  description: string;
  status: "active" | "inactive";
}

export type ServiceCategory =
  | "fnb_space"       // Ăn uống & Không gian sinh hoạt
  | "accommodation"   // Lưu trú
  | "health_beauty"   // Sức khỏe & Sắc đẹp
  | "education"       // Khóa học & CLB
  | "networking";     // Kết nối & Khởi nghiệp

export const SERVICE_CATEGORIES: { key: ServiceCategory; label: string; icon: string }[] = [
  { key: "fnb_space",     label: "Ăn uống & Không gian",       icon: "☕" },
  { key: "accommodation", label: "Lưu trú",                    icon: "🏠" },
  { key: "health_beauty", label: "Sức khỏe & Sắc đẹp",        icon: "💆" },
  { key: "education",     label: "Khóa học & CLB",             icon: "📚" },
  { key: "networking",    label: "Kết nối & Khởi nghiệp",     icon: "🤝" },
];

export const MOCK_SERVICE_CATALOG: IServiceItem[] = [
  // ── Ăn uống & Không gian ──
  { id: "SVC-01", name: "Đồ uống tự chọn",      category: "fnb_space",     unit: "lần",  price: 35000,  sellable: true,  description: "Trà, cà phê, nước ép tại quầy bar",       status: "active" },
  { id: "SVC-02", name: "Bữa trưa healthy",      category: "fnb_space",     unit: "suất", price: 65000,  sellable: true,  description: "Set lunch dinh dưỡng hàng ngày",           status: "active" },
  { id: "SVC-03", name: "Co-working (ngày)",      category: "fnb_space",     unit: "ngày", price: 150000, sellable: true,  description: "Chỗ ngồi làm việc chung cả ngày",         status: "active" },
  { id: "SVC-04", name: "Phòng họp nhỏ (4 người)",category: "fnb_space",    unit: "giờ",  price: 100000, sellable: true,  description: "Phòng họp 4 chỗ có màn chiếu",            status: "active" },
  { id: "SVC-05", name: "Phòng họp lớn (12 người)",category: "fnb_space",   unit: "giờ",  price: 250000, sellable: true,  description: "Phòng họp 12 chỗ, thiết bị hội nghị",     status: "active" },

  // ── Lưu trú ──
  { id: "SVC-10", name: "Giường KTX Nam",         category: "accommodation", unit: "đêm", price: 120000, sellable: true,  description: "Giường tầng phòng nam, locker riêng",      status: "active" },
  { id: "SVC-11", name: "Giường KTX Nữ",          category: "accommodation", unit: "đêm", price: 120000, sellable: true,  description: "Giường tầng phòng nữ, locker riêng",      status: "active" },
  { id: "SVC-12", name: "Giặt là",                category: "accommodation", unit: "kg",   price: 15000,  sellable: true,  description: "Dịch vụ giặt là hàng ngày",               status: "active" },

  // ── Sức khỏe & Sắc đẹp ──
  { id: "SVC-20", name: "Massage 60 phút",        category: "health_beauty", unit: "lần",  price: 250000, sellable: true,  description: "Massage body thư giãn",                   status: "active" },
  { id: "SVC-21", name: "Xông hơi",               category: "health_beauty", unit: "lần",  price: 80000,  sellable: true,  description: "Xông hơi khô + ướt 30 phút",              status: "active" },
  { id: "SVC-22", name: "Cắt tóc nam/nữ",         category: "health_beauty", unit: "lần",  price: 80000,  sellable: true,  description: "Cắt tóc cơ bản",                          status: "active" },
  { id: "SVC-23", name: "Yoga (buổi lẻ)",          category: "health_beauty", unit: "buổi", price: 50000,  sellable: true,  description: "Tham gia lớp yoga 1 buổi",                status: "active" },

  // ── Khóa học & CLB ──
  { id: "SVC-30", name: "Marketing 0 đồng",        category: "education",     unit: "khóa", price: 500000, sellable: true,  description: "Khóa 8 buổi, giảng viên KOL",             status: "active" },
  { id: "SVC-31", name: "Thiền & Mindfulness",      category: "education",     unit: "khóa", price: 0,      sellable: false, description: "Miễn phí cho thành viên, 12 buổi",        status: "active" },
  { id: "SVC-32", name: "Nấu ăn healthy",           category: "education",     unit: "khóa", price: 400000, sellable: true,  description: "6 buổi thực hành nấu ăn",                 status: "active" },
  { id: "SVC-33", name: "CLB Đọc sách (tháng)",     category: "education",     unit: "tháng",price: 0,      sellable: false, description: "Sinh hoạt 2 lần/tháng, miễn phí TV",      status: "active" },
  { id: "SVC-34", name: "CLB Chạy bộ (tháng)",      category: "education",     unit: "tháng",price: 0,      sellable: false, description: "Chạy cùng nhau mỗi sáng T3-T5-T7",       status: "active" },

  // ── Kết nối & Khởi nghiệp ──
  { id: "SVC-40", name: "Tư vấn khởi nghiệp 1:1",  category: "networking",    unit: "buổi", price: 300000, sellable: true,  description: "45 phút với mentor",                      status: "active" },
  { id: "SVC-41", name: "Kết nối nhân lực",          category: "networking",    unit: "lần",  price: 0,      sellable: false, description: "Giới thiệu việc làm qua mạng lưới Hub",   status: "active" },
  { id: "SVC-42", name: "Sự kiện Networking (lần)",  category: "networking",    unit: "lần",  price: 100000, sellable: true,  description: "Tham gia event kết nối hàng tháng",       status: "active" },
];
