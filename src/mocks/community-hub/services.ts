// [CH] Community Hub - Mock data for services & booking module
export const MOCK_SERVICES = [
  { id: "SVC-01", name: "Đồ uống tự chọn", category: "fnb" as const, unit: "lần", icon: "coffee" },
  { id: "SVC-02", name: "Massage 60 phút", category: "spa" as const, unit: "lần", icon: "spa" },
  { id: "SVC-03", name: "Cắt tóc", category: "beauty" as const, unit: "lần", icon: "scissors" },
  { id: "SVC-04", name: "Phòng họp nhỏ", category: "space" as const, unit: "giờ", icon: "meeting" },
  { id: "SVC-05", name: "Co-working", category: "space" as const, unit: "ngày", icon: "desk" },
  { id: "SVC-06", name: "Yoga", category: "wellness" as const, unit: "buổi", icon: "yoga" },
  { id: "SVC-07", name: "Xông hơi", category: "spa" as const, unit: "lần", icon: "steam" },
  { id: "SVC-08", name: "Giặt là", category: "utility" as const, unit: "kg", icon: "laundry" },
];

export const MOCK_BOOKING_SLOTS = {
  date: "2026-04-08",
  service_id: "SVC-02",
  slots: [
    { time: "09:00", available: true, booked_by: null },
    { time: "10:00", available: false, booked_by: "Nguyễn Văn An" },
    { time: "11:00", available: true, booked_by: null },
    { time: "12:00", available: true, booked_by: null },
    { time: "13:00", available: false, booked_by: "Trần Thị Bình" },
    { time: "14:00", available: true, booked_by: null },
    { time: "15:00", available: true, booked_by: null },
    { time: "16:00", available: false, booked_by: "Lê Văn Cường" },
    { time: "17:00", available: true, booked_by: null },
  ],
};

export type ServiceCategory = "fnb" | "spa" | "beauty" | "space" | "wellness" | "utility";
