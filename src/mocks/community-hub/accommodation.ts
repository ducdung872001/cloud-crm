// [CH] Community Hub - Mock data for accommodation module
export const MOCK_ROOMS = [
  {
    id: "ROOM-M",
    name: "Phong Nam",
    gender: "male" as const,
    capacity: 12,
    beds: [
      { bed_no: 1, status: "occupied" as const, member: { id: "M010", name: "Tran Van D", checkin: "2026-04-01", checkout: "2026-04-30" } },
      { bed_no: 2, status: "available" as const, member: null },
      { bed_no: 3, status: "occupied" as const, member: { id: "M011", name: "Nguyen Van E", checkin: "2026-03-15", checkout: "2026-04-15" } },
      { bed_no: 4, status: "occupied" as const, member: { id: "M012", name: "Le Van F", checkin: "2026-04-05", checkout: "2026-05-05" } },
      { bed_no: 5, status: "occupied" as const, member: { id: "M013", name: "Pham Van G", checkin: "2026-03-20", checkout: "2026-04-20" } },
      { bed_no: 6, status: "available" as const, member: null },
      { bed_no: 7, status: "occupied" as const, member: { id: "M014", name: "Hoang Van H", checkin: "2026-04-01", checkout: "2026-04-30" } },
      { bed_no: 8, status: "occupied" as const, member: { id: "M015", name: "Vo Van I", checkin: "2026-04-03", checkout: "2026-05-03" } },
      { bed_no: 9, status: "occupied" as const, member: { id: "M016", name: "Tran Van K", checkin: "2026-03-25", checkout: "2026-04-25" } },
      { bed_no: 10, status: "occupied" as const, member: { id: "M017", name: "Nguyen Van L", checkin: "2026-04-02", checkout: "2026-05-02" } },
      { bed_no: 11, status: "occupied" as const, member: { id: "M018", name: "Le Van M", checkin: "2026-04-06", checkout: "2026-05-06" } },
      { bed_no: 12, status: "occupied" as const, member: { id: "M019", name: "Pham Van N", checkin: "2026-04-01", checkout: "2026-04-30" } },
    ],
  },
  {
    id: "ROOM-F",
    name: "Phong Nu",
    gender: "female" as const,
    capacity: 10,
    beds: [
      { bed_no: 1, status: "occupied" as const, member: { id: "M020", name: "Nguyen Thi O", checkin: "2026-04-01", checkout: "2026-04-30" } },
      { bed_no: 2, status: "occupied" as const, member: { id: "M021", name: "Tran Thi P", checkin: "2026-03-20", checkout: "2026-04-20" } },
      { bed_no: 3, status: "available" as const, member: null },
      { bed_no: 4, status: "occupied" as const, member: { id: "M022", name: "Le Thi Q", checkin: "2026-04-05", checkout: "2026-05-05" } },
      { bed_no: 5, status: "occupied" as const, member: { id: "M023", name: "Pham Thi R", checkin: "2026-04-02", checkout: "2026-05-02" } },
      { bed_no: 6, status: "occupied" as const, member: { id: "M024", name: "Hoang Thi S", checkin: "2026-04-01", checkout: "2026-04-30" } },
      { bed_no: 7, status: "available" as const, member: null },
      { bed_no: 8, status: "occupied" as const, member: { id: "M025", name: "Vo Thi T", checkin: "2026-04-03", checkout: "2026-05-03" } },
      { bed_no: 9, status: "occupied" as const, member: { id: "M026", name: "Nguyen Thi U", checkin: "2026-04-06", checkout: "2026-05-06" } },
      { bed_no: 10, status: "occupied" as const, member: { id: "M027", name: "Tran Thi V", checkin: "2026-03-28", checkout: "2026-04-28" } },
    ],
  },
];

export type BedStatus = "occupied" | "available";
export type RoomGender = "male" | "female";
