export type DraftProduct = {
  ten: string;
  maSP: string;
  sl: number;
  donGia: number;
};

export type DraftOrder = {
  id: string;
  tenDon: string;
  thoiGian: string;
  ngay: string;
  nhanVien: string;
  khachHang: string;
  sanPhams: DraftProduct[];
};

export type DraftOrdersStats = {
  totalDrafts: number;
};

export function fmtVnd(n: number) {
  return `${n.toLocaleString("vi-VN")} đ`;
}

export function sumTotal(sp: DraftProduct[]) {
  return sp.reduce((a, b) => a + b.sl * b.donGia, 0);
}

export function sumQty(sp: DraftProduct[]) {
  return sp.reduce((a, b) => a + b.sl, 0);
}
