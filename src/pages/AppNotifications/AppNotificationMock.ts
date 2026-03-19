// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — AppNotification
// Dùng tạm khi API chưa sẵn sàng. Xóa file này và bỏ comment import service
// thật khi backend đã có endpoint.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IAppNotificationResponseModel {
  id: number;
  name: string;
  channel: "SMS" | "Zalo" | "Email" | "App";
  totalSent: number;
  openRate: number;       // phần trăm, VD: 81
  sendDate: string;       // ISO string
  status: 1 | 2 | 3;     // 1=Đang chạy | 2=Hoàn thành | 3=Đã hủy
  targetAudience: string;
  messageContent: string;
  promoCode?: string;
  createdBy: string;
  createdTime: string;    // ISO string
}

export interface IAppNotificationFilterRequest {
  query?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  channel?: string;
  status?: string;
}

export interface IAppNotificationListResponse {
  items: IAppNotificationResponseModel[];
  total: number;
  page: number;
}

export interface IAppNotificationStatsModel {
  running: number;
  totalSent: number;
  totalSentChange: number;   // % so với tháng trước
  openRate: number;          // %
  openRateChange: number;    // % so với tháng trước
  clickRate: number;         // %
}

// ── Mock list data ────────────────────────────────────────────────────────────

export const MOCK_APP_NOTIFICATION_LIST: IAppNotificationResponseModel[] = [
  {
    id: 1,
    name: "Chúc mừng sinh nhật tháng 3",
    channel: "SMS",
    totalSent: 245,
    openRate: 81,
    sendDate: "2026-03-01T08:00:00",
    status: 2,
    targetAudience: "Khách hàng có sinh nhật trong tháng 3",
    messageContent: "Chúc mừng sinh nhật! Nhân dịp đặc biệt này, bạn nhận được voucher giảm 20% cho đơn hàng tiếp theo.",
    promoCode: "BDAY20",
    createdBy: "Nguyễn Văn A",
    createdTime: "2026-02-28T10:30:00",
  },
  {
    id: 2,
    name: "Flash Sale cuối tuần",
    channel: "Zalo",
    totalSent: 1250,
    openRate: 71,
    sendDate: "2026-03-14T07:00:00",
    status: 1,
    targetAudience: "Tất cả thành viên",
    messageContent: "🔥 FLASH SALE cuối tuần! Giảm đến 50% hàng ngàn sản phẩm. Nhanh tay kẻo hết!",
    promoCode: "SALE50",
    createdBy: "Trần Thị B",
    createdTime: "2026-03-13T14:00:00",
  },
  {
    id: 3,
    name: "Thông báo sản phẩm mới",
    channel: "Email",
    totalSent: 3400,
    openRate: 46,
    sendDate: "2026-03-10T09:00:00",
    status: 2,
    targetAudience: "Khách hàng thân thiết",
    messageContent: "Chúng tôi vừa ra mắt bộ sưu tập mới nhất! Khám phá ngay hôm nay.",
    createdBy: "Lê Văn C",
    createdTime: "2026-03-09T16:45:00",
  },
  {
    id: 4,
    name: "Nhắc nhở điểm sắp hết hạn",
    channel: "App",
    totalSent: 456,
    openRate: 62,
    sendDate: "2026-03-12T10:00:00",
    status: 2,
    targetAudience: "Khách hàng có điểm sắp hết hạn",
    messageContent: "Điểm thưởng của bạn sẽ hết hạn vào cuối tháng. Hãy sử dụng trước khi mất nhé!",
    createdBy: "Phạm Thị D",
    createdTime: "2026-03-11T09:00:00",
  },
  {
    id: 5,
    name: "Ưu đãi khách hàng VIP",
    channel: "App",
    totalSent: 180,
    openRate: 88,
    sendDate: "2026-03-05T08:30:00",
    status: 2,
    targetAudience: "Khách hàng VIP",
    messageContent: "Dành riêng cho bạn - ưu đãi độc quyền VIP: Giảm 30% toàn bộ đơn hàng trong tuần này.",
    promoCode: "VIP30",
    createdBy: "Nguyễn Văn A",
    createdTime: "2026-03-04T11:00:00",
  },
  {
    id: 6,
    name: "Khảo sát trải nghiệm khách hàng",
    channel: "Email",
    totalSent: 2100,
    openRate: 38,
    sendDate: "2026-03-08T09:00:00",
    status: 2,
    targetAudience: "Khách hàng đã mua hàng trong 30 ngày qua",
    messageContent: "Chúng tôi muốn lắng nghe ý kiến của bạn! Hãy dành 2 phút hoàn thành khảo sát và nhận ngay voucher 50k.",
    promoCode: "SURVEY50",
    createdBy: "Trần Thị B",
    createdTime: "2026-03-07T15:30:00",
  },
  {
    id: 7,
    name: "Thông báo bảo trì hệ thống",
    channel: "SMS",
    totalSent: 5800,
    openRate: 55,
    sendDate: "2026-03-16T22:00:00",
    status: 3,
    targetAudience: "Tất cả thành viên",
    messageContent: "Hệ thống sẽ bảo trì từ 22:00 - 24:00 ngày 16/03. Xin lỗi vì sự bất tiện này.",
    createdBy: "Lê Văn C",
    createdTime: "2026-03-15T10:00:00",
  },
  {
    id: 8,
    name: "Chương trình giới thiệu bạn bè",
    channel: "Zalo",
    totalSent: 920,
    openRate: 74,
    sendDate: "2026-03-17T08:00:00",
    status: 1,
    targetAudience: "Khách hàng đã mua từ 3 đơn trở lên",
    messageContent: "Giới thiệu bạn bè và nhận ngay 100k vào tài khoản! Không giới hạn số lượt giới thiệu.",
    promoCode: "REFER100",
    createdBy: "Phạm Thị D",
    createdTime: "2026-03-16T14:00:00",
  },
];

// ── Mock stats data ───────────────────────────────────────────────────────────

export const MOCK_APP_NOTIFICATION_STATS: IAppNotificationStatsModel = {
  running: 2,
  totalSent: 5430,
  totalSentChange: 18,
  openRate: 71,
  openRateChange: 3,
  clickRate: 34,
};

// ── Mock service (thay thế AppNotificationService khi API chưa có) ─────────────

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const AppNotificationMockService = {
  /**
   * Lấy danh sách thông báo với filter + phân trang giả lập
   */
  list: async (
    params: IAppNotificationFilterRequest,
    signal?: AbortSignal
  ): Promise<{ code: number; result: IAppNotificationListResponse; message?: string }> => {
    await delay(400); // giả lập network latency

    if (signal?.aborted) {
      return { code: -1, result: null, message: "Aborted" };
    }

    let filtered = [...MOCK_APP_NOTIFICATION_LIST];

    // Filter by query
    if (params.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(q));
    }

    // Filter by channel
    if (params.channel) {
      filtered = filtered.filter(
        (item) => item.channel.toLowerCase() === params.channel.toLowerCase()
      );
    }

    // Filter by status
    if (params.status && params.status !== "-1") {
      filtered = filtered.filter((item) => item.status === +params.status);
    }

    // Filter by date range
    if (params.startDate) {
      filtered = filtered.filter(
        (item) => new Date(item.sendDate) >= new Date(params.startDate)
      );
    }
    if (params.endDate) {
      filtered = filtered.filter(
        (item) => new Date(item.sendDate) <= new Date(params.endDate)
      );
    }

    // Pagination
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      code: 0,
      result: {
        items,
        total: filtered.length,
        page,
      },
    };
  },

  /**
   * Lấy stats tổng quan
   */
  getStats: async (): Promise<{
    code: number;
    result: IAppNotificationStatsModel;
    message?: string;
  }> => {
    await delay(300);
    return { code: 0, result: { ...MOCK_APP_NOTIFICATION_STATS } };
  },

  /**
   * Xóa một thông báo theo id (mock — chỉ trả về success)
   */
  delete: async (id: number): Promise<{ code: number; message?: string }> => {
    await delay(300);
    const exists = MOCK_APP_NOTIFICATION_LIST.find((item) => item.id === id);
    if (!exists) {
      return { code: 1, message: "Không tìm thấy chiến dịch" };
    }
    return { code: 0 };
  },

  /**
   * Tạo mới (mock)
   */
  create: async (
    payload: Omit<IAppNotificationResponseModel, "id" | "createdTime" | "totalSent" | "openRate">
  ): Promise<{ code: number; result?: IAppNotificationResponseModel; message?: string }> => {
    await delay(500);
    const newItem: IAppNotificationResponseModel = {
      ...payload,
      id: Date.now(),
      totalSent: 0,
      openRate: 0,
      createdTime: new Date().toISOString(),
    };
    return { code: 0, result: newItem };
  },
};

export default AppNotificationMockService;
