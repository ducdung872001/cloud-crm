// [CH] Community Hub - Mock data for accommodation module
export const MOCK_ROOMS = [
  {
    id: "ROOM-M",
    name: "Phòng Nam",
    gender: "male" as const,
    capacity: 12,
    beds: [
      { bed_no: 1, status: "occupied" as const, member: { id: "M010", name: "Trần Văn Đạt", checkin: "2026-04-01", checkout: "2026-04-30" } },
      { bed_no: 2, status: "available" as const, member: null },
      { bed_no: 3, status: "occupied" as const, member: { id: "M011", name: "Nguyễn Văn Em", checkin: "2026-03-15", checkout: "2026-04-15" } },
      { bed_no: 4, status: "occupied" as const, member: { id: "M012", name: "Lê Văn Phúc", checkin: "2026-04-05", checkout: "2026-05-05" } },
      { bed_no: 5, status: "occupied" as const, member: { id: "M013", name: "Phạm Văn Giang", checkin: "2026-03-20", checkout: "2026-04-20" } },
      { bed_no: 6, status: "available" as const, member: null },
      { bed_no: 7, status: "occupied" as const, member: { id: "M014", name: "Hoàng Văn Hải", checkin: "2026-04-01", checkout: "2026-04-30" } },
      { bed_no: 8, status: "occupied" as const, member: { id: "M015", name: "Võ Văn Ích", checkin: "2026-04-03", checkout: "2026-05-03" } },
      { bed_no: 9, status: "occupied" as const, member: { id: "M016", name: "Trần Văn Khôi", checkin: "2026-03-25", checkout: "2026-04-25" } },
      { bed_no: 10, status: "occupied" as const, member: { id: "M017", name: "Nguyễn Văn Long", checkin: "2026-04-02", checkout: "2026-05-02" } },
      { bed_no: 11, status: "occupied" as const, member: { id: "M018", name: "Lê Văn Minh", checkin: "2026-04-06", checkout: "2026-05-06" } },
      { bed_no: 12, status: "occupied" as const, member: { id: "M019", name: "Phạm Văn Nam", checkin: "2026-04-01", checkout: "2026-04-30" } },
    ],
  },
  {
    id: "ROOM-F",
    name: "Phòng Nữ",
    gender: "female" as const,
    capacity: 10,
    beds: [
      { bed_no: 1, status: "occupied" as const, member: { id: "M020", name: "Nguyễn Thị Oanh", checkin: "2026-04-01", checkout: "2026-04-30" } },
      { bed_no: 2, status: "occupied" as const, member: { id: "M021", name: "Trần Thị Phương", checkin: "2026-03-20", checkout: "2026-04-20" } },
      { bed_no: 3, status: "available" as const, member: null },
      { bed_no: 4, status: "occupied" as const, member: { id: "M022", name: "Lê Thị Quỳnh", checkin: "2026-04-05", checkout: "2026-05-05" } },
      { bed_no: 5, status: "occupied" as const, member: { id: "M023", name: "Phạm Thị Rạng", checkin: "2026-04-02", checkout: "2026-05-02" } },
      { bed_no: 6, status: "occupied" as const, member: { id: "M024", name: "Hoàng Thị Sen", checkin: "2026-04-01", checkout: "2026-04-30" } },
      { bed_no: 7, status: "available" as const, member: null },
      { bed_no: 8, status: "occupied" as const, member: { id: "M025", name: "Võ Thị Tâm", checkin: "2026-04-03", checkout: "2026-05-03" } },
      { bed_no: 9, status: "occupied" as const, member: { id: "M026", name: "Nguyễn Thị Uyên", checkin: "2026-04-06", checkout: "2026-05-06" } },
      { bed_no: 10, status: "occupied" as const, member: { id: "M027", name: "Trần Thị Vân", checkin: "2026-03-28", checkout: "2026-04-28" } },
    ],
  },
];

export type BedStatus = "occupied" | "available";
export type RoomGender = "male" | "female";
