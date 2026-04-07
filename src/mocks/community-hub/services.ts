// [CH] Community Hub - Mock data for services & booking module
export const MOCK_SERVICES = [
  { id: "SVC-01", name: "Do uong tu chon", category: "fnb" as const, unit: "lan", icon: "coffee" },
  { id: "SVC-02", name: "Massage 60 phut", category: "spa" as const, unit: "lan", icon: "spa" },
  { id: "SVC-03", name: "Cat toc", category: "beauty" as const, unit: "lan", icon: "scissors" },
  { id: "SVC-04", name: "Phong hop nho", category: "space" as const, unit: "gio", icon: "meeting" },
  { id: "SVC-05", name: "Co-working", category: "space" as const, unit: "ngay", icon: "desk" },
  { id: "SVC-06", name: "Yoga", category: "wellness" as const, unit: "buoi", icon: "yoga" },
  { id: "SVC-07", name: "Xong hoi", category: "spa" as const, unit: "lan", icon: "steam" },
  { id: "SVC-08", name: "Giat la", category: "utility" as const, unit: "kg", icon: "laundry" },
];

export const MOCK_BOOKING_SLOTS = {
  date: "2026-04-08",
  service_id: "SVC-02",
  slots: [
    { time: "09:00", available: true, booked_by: null },
    { time: "10:00", available: false, booked_by: "Nguyen Van A" },
    { time: "11:00", available: true, booked_by: null },
    { time: "12:00", available: true, booked_by: null },
    { time: "13:00", available: false, booked_by: "Tran Thi B" },
    { time: "14:00", available: true, booked_by: null },
    { time: "15:00", available: true, booked_by: null },
    { time: "16:00", available: false, booked_by: "Le Van C" },
    { time: "17:00", available: true, booked_by: null },
  ],
};

export type ServiceCategory = "fnb" | "spa" | "beauty" | "space" | "wellness" | "utility";
