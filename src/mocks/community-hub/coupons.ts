// [CH] Community Hub - Mock coupon data cho chế độ "Xem trước" giao diện
// Chỉ dùng khi tenant chưa có dữ liệu thật + user bấm nút Xem trước.
// KHÔNG ghi localStorage để không ô nhiễm dữ liệu tenant thật.

import type { ICoupon } from "model/coupon/CouponModel";

export const MOCK_COUPONS: ICoupon[] = [
  {
    id: -1001,
    code: "WHOUSE10",
    discountType: 1,          // Phần trăm
    discountValue: 10,
    minOrder: 200_000,
    maxUses: 100,
    usedCount: 23,
    expiryDate: "2026-12-31",
    status: 1,                 // Đang chạy
    description: "Giảm 10% cho thành viên mới, đơn tối thiểu 200k",
  },
  {
    id: -1002,
    code: "FREESHIP",
    discountType: 3,          // Miễn ship
    discountValue: 0,
    minOrder: 300_000,
    maxUses: 500,
    usedCount: 178,
    expiryDate: "2026-06-30",
    status: 1,
    description: "Miễn phí giao hàng cho đơn >= 300k",
  },
  {
    id: -1003,
    code: "SUMMER50K",
    discountType: 2,          // Số tiền cố định
    discountValue: 50_000,
    minOrder: 500_000,
    maxUses: 200,
    usedCount: 200,
    expiryDate: "2026-04-01",
    status: 2,                 // Hết hạn
    description: "Ưu đãi mùa hè — đã hết hạn",
  },
  {
    id: -1004,
    code: "WELCOME25",
    discountType: 1,
    discountValue: 25,
    minOrder: 0,
    maxUses: 50,
    usedCount: 0,
    expiryDate: "2026-07-15",
    status: 0,                 // Chờ duyệt
    description: "Chào mừng thành viên Mentor7 mới — đang chờ duyệt",
  },
  {
    id: -1005,
    code: "EVENT300",
    discountType: 2,
    discountValue: 30_000,
    minOrder: 100_000,
    maxUses: 1000,
    usedCount: 412,
    expiryDate: "2026-05-31",
    status: 3,                 // Tạm dừng
    description: "Mã sự kiện Squat Mentor — đang tạm dừng",
  },
];
