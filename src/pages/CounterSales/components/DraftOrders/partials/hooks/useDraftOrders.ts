import { useMemo, useState } from "react";
import { DraftOrder } from "./../../types";

const MOCK_DATA: DraftOrder[] = [
  {
    id: "DT-001",
    tenDon: "Đơn tạm 1",
    thoiGian: "09:15",
    ngay: "17/03/2026",
    nhanVien: "Nguyễn Văn An",
    khachHang: "Khách lẻ",
    sanPhams: [
      { ten: "Nước ngọt Pepsi 330ml", maSP: "SP001", sl: 2, donGia: 15000 },
      { ten: "Bánh mì sandwich", maSP: "SP002", sl: 1, donGia: 25000 },
      { ten: "Sữa tươi Vinamilk 1L", maSP: "SP003", sl: 2, donGia: 32000 },
    ],
  },
  {
    id: "DT-002",
    tenDon: "Đơn tạm 2",
    thoiGian: "10:42",
    ngay: "17/03/2026",
    nhanVien: "Trần Thị Bình",
    khachHang: "Nguyễn Minh Tuấn",
    sanPhams: [
      { ten: "Áo thun nam basic", maSP: "SP010", sl: 2, donGia: 199000 },
      { ten: "Quần short kaki", maSP: "SP011", sl: 1, donGia: 299000 },
      { ten: "Dây thắt lưng da", maSP: "SP012", sl: 1, donGia: 189000 },
      { ten: "Tất thể thao", maSP: "SP013", sl: 3, donGia: 45000 },
      { ten: "Mũ lưỡi trai", maSP: "SP014", sl: 1, donGia: 129000 },
    ],
  },
  {
    id: "DT-003",
    tenDon: "Đơn tạm 3",
    thoiGian: "11:30",
    ngay: "17/03/2026",
    nhanVien: "Lê Văn Cường",
    khachHang: "Công ty ABC",
    sanPhams: [
      { ten: "Bút bi Thiên Long (hộp)", maSP: "SP020", sl: 5, donGia: 45000 },
      { ten: "Tập học sinh 200 trang", maSP: "SP021", sl: 10, donGia: 30000 },
    ],
  },
  {
    id: "DT-004",
    tenDon: "Đơn tạm 4",
    thoiGian: "13:05",
    ngay: "17/03/2026",
    nhanVien: "Nguyễn Văn An",
    khachHang: "Trần Thị Lan",
    sanPhams: [
      { ten: "Son môi MAC Ruby Woo", maSP: "SP030", sl: 1, donGia: 750000 },
      { ten: "Kem dưỡng da Innisfree", maSP: "SP031", sl: 2, donGia: 420000 },
      { ten: "Serum Vitamin C", maSP: "SP032", sl: 1, donGia: 510000 },
    ],
  },
  {
    id: "DT-005",
    tenDon: "Đơn tạm 5",
    thoiGian: "14:20",
    ngay: "17/03/2026",
    nhanVien: "Phạm Thị Dung",
    khachHang: "Lê Hoàng Nam",
    sanPhams: [
      { ten: "Cà phê Trung Nguyên 500g", maSP: "SP040", sl: 3, donGia: 120000 },
      { ten: "Trà Lipton hộp 100 gói", maSP: "SP041", sl: 2, donGia: 85000 },
      { ten: "Nước khoáng Lavie 20L", maSP: "SP042", sl: 1, donGia: 65000 },
    ],
  },
];

export function useDraftOrders() {
  const [query, setQuery] = useState("");
  const [list, setList] = useState<DraftOrder[]>(MOCK_DATA);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.tenDon.toLowerCase().includes(q) ||
        d.khachHang.toLowerCase().includes(q) ||
        d.nhanVien.toLowerCase().includes(q)
    );
  }, [list, query]);

  const selected = useMemo(() => list.find((x) => x.id === selectedId) ?? null, [list, selectedId]);

  const createDraft = () => {
    const nextNum = list.length + 1;
    const nextId = `DT-${String(nextNum).padStart(3, "0")}`;
    const newItem: DraftOrder = {
      id: nextId,
      tenDon: `Đơn tạm ${nextNum}`,
      thoiGian: "00:00",
      ngay: "18/03/2026",
      nhanVien: "Nhân viên",
      khachHang: "Khách lẻ",
      sanPhams: [],
    };
    setList((prev) => [newItem, ...prev]);
    setSelectedId(nextId);
  };

  const deleteDraft = (id: string) => {
    setList((prev) => prev.filter((x) => x.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  };

  return {
    query,
    setQuery,
    list,
    setList,
    filtered,
    selectedId,
    setSelectedId,
    selected,
    createDraft,
    deleteDraft,
    stats: { totalDrafts: list.length },
  };
}
