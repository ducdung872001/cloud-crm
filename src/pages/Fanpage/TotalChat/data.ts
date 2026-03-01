export type ConversationFilter = "all" | "unread" | "consulting";

export interface IConversationTag {
  label: string;
  tone: "vip" | "pricing" | "bought" | "potential";
}

export interface IConversationItem {
  id: number;
  customerName: string;
  phone: string;
  lastMessage: string;
  time: string;
  platform: "facebook" | "zalo" | "instagram";
  status: "online" | "consulting" | "offline";
  unread: boolean;
  tags: IConversationTag[];
}

export interface IMessageItem {
  id: number;
  sender: "customer" | "agent" | "system";
  content: string;
  time: string;
}

export interface ICartItem {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface IProductCatalogItem {
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface IQuickReplyTemplate {
  command: string;
  content: string;
}

export type OrderStatus = "draft" | "sent_to_customer" | "created" | "processing" | "shipping" | "completed" | "cancelled";

export interface IOrderActionData {
  address: string;
  customerTier: string;
  loyaltyPoints: number;
  voucherCode: string;
  orderNote: string;
  shippingFee: number;
  cartItems: ICartItem[];
  orderStatus: OrderStatus;
  hasSentOrderToCustomer: boolean;
  isOrderCreated: boolean;
}

export interface IConversationThread {
  conversation: IConversationItem;
  messages: IMessageItem[];
  orderAction: IOrderActionData;
}

export interface ITotalChatMockConfig {
  pageTitle: string;
  messageTimeJustNow: string;
  sendOrderPreviewSuccessMessage: string;
  createOrderSuccessMessage: string;
  createOrderWithoutSendConfirm: string;
  fallbackText: {
    emptyConversation: string;
    newCustomer: string;
    emptyPhone: string;
  };
}

export const filterOptionLabels: Record<ConversationFilter, string> = {
  all: "Tất cả",
  unread: "Chưa đọc",
  consulting: "Đang tư vấn",
};

export const conversationStatusLabels = {
  online: "Đang online",
  consulting: "Đang tư vấn",
  offline: "Ngoại tuyến",
};

export const quickReplies = ["/chao", "/banggia", "/stk"];

export const quickReplyTemplates: IQuickReplyTemplate[] = [
  {
    command: "/chao",
    content: "Xin chào chị, em đã tiếp nhận và sẽ hỗ trợ ngay ạ.",
  },
  {
    command: "/banggia",
    content: "Em gửi bảng giá và ưu đãi hiện tại để mình chọn nhanh nhé.",
  },
  {
    command: "/stk",
    content: "Em gửi thông tin thanh toán, mình chuyển khoản xong báo em xác nhận ạ.",
  },
];

export const platformText = {
  facebook: "Facebook Fanpage",
  zalo: "Zalo OA",
  instagram: "Instagram",
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  draft: "Đang soạn đơn",
  sent_to_customer: "Đã gửi khách",
  created: "Đã tạo đơn",
  processing: "Đang xử lý",
  shipping: "Đang giao hàng",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export const totalChatLabels = {
  channelInbox: {
    eyebrow: "Hộp thư hội tụ",
    title: "Chăm sóc khách hàng",
    searchPlaceholder: "Đang tìm hội thoại...",
  },
  chatWorkspace: {
    eyebrow: "Đang trò chuyện",
    quickReplyTitle: "Gửi nhanh",
    inputPlaceholder: "Nhập nội dung trả lời...",
    sendButton: "Gửi",
  },
  orderAction: {
    title: "Trung tâm hành động",
    customerInfoTitle: "Thông tin khách hàng",
    customerName: "Tên khách hàng",
    customerPhone: "Số điện thoại",
    customerAddress: "Địa chỉ",
    customerTier: "Loại thành viên",
    cartTitle: "Giỏ hàng",
    cartSubtitle: "Danh sách sản phẩm",
    cartCatalogTitle: "Thêm sản phẩm",
    cartAddButton: "Thêm",
    cartPickerTitle: "Chọn sản phẩm",
    cartPickerSearchPlaceholder: "Tìm sản phẩm...",
    cartRemoveButton: "Xóa",
    cartStockLabel: "Tồn kho",
    cartLowStockLabel: "Sắp hết",
    cartEmptyCatalog: "Không còn sản phẩm phù hợp",
    voucherTitle: "Voucher và loyalty",
    voucherPlaceholder: "Nhập mã voucher",
    loyaltyLabel: "Điểm tích lũy khả dụng",
    summaryTitle: "Tóm tắt đơn hàng",
    subtotalLabel: "Thành tiền",
    shippingFeeLabel: "Phí vận chuyển",
    discountLabel: "Giảm giá",
    totalLabel: "Tổng thanh toán",
    notePlaceholder: "Ghi chú đơn hàng",
    orderStatusLabel: "Trạng thái đơn hàng",
    sendToCustomerButton: "Gửi đơn cho khách",
    sentToCustomerLabel: "Đã gửi đơn cho khách",
    createdButton: "Đã tạo đơn",
    createOrderButton: "Tạo đơn",
  },
};

export const totalChatMockConfig: ITotalChatMockConfig = {
  pageTitle: "Omnichannel - Tổng hội thoại",
  messageTimeJustNow: "Vừa xong",
  sendOrderPreviewSuccessMessage: "Đã gửi thông tin đơn hàng cho khách.",
  createOrderSuccessMessage: "Đơn hàng đã được tạo thành công.",
  createOrderWithoutSendConfirm: "Bạn có chắc muốn tạo đơn mà không gửi đơn cho khách trước không?",
  fallbackText: {
    emptyConversation: "Chưa có hội thoại",
    newCustomer: "Khách hàng mới",
    emptyPhone: "Chưa có số điện thoại",
  },
};

export const conversationThreads: IConversationThread[] = [
  {
    conversation: {
      id: 1,
      customerName: "Nguyễn Thu Hà",
      phone: "0987 123 456",
      lastMessage: "Cho mình xin bảng giá combo chăm sóc da.",
      time: "09:12",
      platform: "facebook",
      status: "consulting",
      unread: true,
      tags: [
        { label: "VIP", tone: "vip" },
        { label: "Hỏi giá", tone: "pricing" },
      ],
    },
    messages: [
      { id: 1, sender: "system", content: "Khách được nhận diện từ Facebook Fanpage.", time: "09:05" },
      { id: 2, sender: "customer", content: "Cho mình xin bảng giá combo chăm sóc da.", time: "09:07" },
      { id: 3, sender: "agent", content: "Đã có combo 3 bước và combo nâng cao. Bạn muốn em gửi loại nào ạ?", time: "09:09" },
      { id: 4, sender: "customer", content: "Gửi mình combo nâng cao nhé.", time: "09:12" },
      // { id: 5, sender: "agent", content: "Dạ combo nâng cao gồm 1 sữa rửa mặt, 1 tinh chất vitamin C và 1 kem dưỡng ban đêm, giá 1.2 triệu đồng. Em gửi bảng giá chi tiết để mình tham khảo nhé.", time: "09:15" },
    ],
    orderAction: {
      address: "12 Nguyễn Huệ, Quận 1, TP.HCM",
      customerTier: "VIP / Trung thành",
      loyaltyPoints: 1250,
      voucherCode: "VIPCHAT",
      orderNote: "Gọi trước khi giao. Ưu tiên giao trong ngày.",
      shippingFee: 30000,
      cartItems: [
        { id: 1, name: "Combo chăm sóc da Premium", sku: "CB-001", price: 890000, quantity: 1 },
        { id: 2, name: "Serum phục hồi da 30ml", sku: "SR-030", price: 420000, quantity: 1 },
        { id: 3, name: "Mặt nạ cấp ẩm 5 miếng", sku: "MN-005", price: 180000, quantity: 2 },
      ],
      orderStatus: "draft",
      hasSentOrderToCustomer: false,
      isOrderCreated: false,
    },
  },
  {
    conversation: {
      id: 2,
      customerName: "Trần Minh Châu",
      phone: "0903 777 111",
      lastMessage: "Shop giao sớm giúp mình trước 5h nhé.",
      time: "08:45",
      platform: "zalo",
      status: "online",
      unread: false,
      tags: [{ label: "Đã mua", tone: "bought" }],
    },
    messages: [
      { id: 1, sender: "customer", content: "Shop giao sớm giúp mình trước 5h nhé.", time: "08:40" },
      { id: 2, sender: "agent", content: "Đã tiếp nhận. Em ưu tiên đơn của mình trong khung 14h-16h.", time: "08:45" },
    ],
    orderAction: {
      address: "89 Lê Lợi, Quận Hải Châu, Đà Nẵng",
      customerTier: "Khách cũ",
      loyaltyPoints: 480,
      voucherCode: "FREESHIP",
      orderNote: "Giao giờ hành chính, gọi trước khi tới.",
      shippingFee: 20000,
      cartItems: [
        { id: 1, name: "Sữa rửa mặt dịu nhẹ", sku: "SRM-010", price: 250000, quantity: 1 },
        { id: 2, name: "Kem chống nắng SPF50", sku: "KCN-050", price: 390000, quantity: 1 },
      ],
      orderStatus: "sent_to_customer",
      hasSentOrderToCustomer: true,
      isOrderCreated: false,
    },
  },
  {
    conversation: {
      id: 3,
      customerName: "Lê Mỹ Tiên",
      phone: "0911 222 888",
      lastMessage: "Màu son này còn màu đỏ đô không?",
      time: "Hôm nay",
      platform: "instagram",
      status: "online",
      unread: true,
      tags: [{ label: "Tiềm năng", tone: "potential" }],
    },
    messages: [
      { id: 1, sender: "customer", content: "Màu son này còn màu đỏ đô không?", time: "10:15" },
      { id: 2, sender: "agent", content: "Còn chị nhé, em gửi bảng màu để mình chọn nhanh.", time: "10:17" },
    ],
    orderAction: {
      address: "32 Võ Văn Tần, Quận 3, TP.HCM",
      customerTier: "Khách mới",
      loyaltyPoints: 0,
      voucherCode: "",
      orderNote: "Chốt màu trước khi tạo đơn.",
      shippingFee: 25000,
      cartItems: [
        { id: 1, name: "Son lì đỏ đô Velvet", sku: "SON-RED", price: 320000, quantity: 1 },
        { id: 2, name: "Son dưỡng bóng", sku: "SON-GLS", price: 190000, quantity: 1 },
      ],
      orderStatus: "processing",
      hasSentOrderToCustomer: true,
      isOrderCreated: true,
    },
  },
  {
    conversation: {
      id: 4,
      customerName: "Phạm Khánh Linh",
      phone: "0978 456 000",
      lastMessage: "Cho mình xin thông tin ưu đãi thành viên.",
      time: "Hôm qua",
      platform: "facebook",
      status: "offline",
      unread: false,
      tags: [{ label: "VIP", tone: "vip" }],
    },
    messages: [
      { id: 1, sender: "customer", content: "Cho mình xin thông tin ưu đãi thành viên.", time: "Hôm qua" },
      { id: 2, sender: "agent", content: "Hiện tại VIP được giảm 10% và miễn phí ship nội thành.", time: "Hôm qua" },
    ],
    orderAction: {
      address: "15 Trần Phú, Nha Trang, Khánh Hòa",
      customerTier: "VIP",
      loyaltyPoints: 2310,
      voucherCode: "VIP10",
      orderNote: "Giữ ưu đãi trong hôm nay.",
      shippingFee: 0,
      cartItems: [
        { id: 1, name: "Combo dưỡng trắng chuyên sâu", sku: "CB-WHT", price: 1250000, quantity: 1 },
      ],
      orderStatus: "completed",
      hasSentOrderToCustomer: true,
      isOrderCreated: true,
    },
  },
  {
    conversation: {
      id: 5,
      customerName: "Hoàng Gia Bảo",
      phone: "0934 555 222",
      lastMessage: "Mình vừa xác nhận màu rồi nhé.",
      time: "11:08",
      platform: "facebook",
      status: "consulting",
      unread: false,
      tags: [{ label: "Đã mua", tone: "bought" }],
    },
    messages: [
      { id: 1, sender: "customer", content: "Mình vừa xác nhận màu rồi nhé.", time: "10:58" },
      { id: 2, sender: "agent", content: "Em đã cập nhật và chuyển đơn sang kho rồi ạ.", time: "11:08" },
    ],
    orderAction: {
      address: "118 Lý Chính Thắng, Quận 3, TP.HCM",
      customerTier: "Khách cũ",
      loyaltyPoints: 820,
      voucherCode: "MIX15",
      orderNote: "Kho đã đóng gói, chờ bàn giao đơn vị vận chuyển.",
      shippingFee: 25000,
      cartItems: [
        { id: 1, name: "Bảng phấn mắt 9 ô", sku: "MP-009", price: 410000, quantity: 1 },
        { id: 2, name: "Mascara chống trôi", sku: "MS-022", price: 230000, quantity: 1 },
      ],
      orderStatus: "shipping",
      hasSentOrderToCustomer: true,
      isOrderCreated: true,
    },
  },
  {
    conversation: {
      id: 6,
      customerName: "Vũ Thanh Mai",
      phone: "0966 333 909",
      lastMessage: "Đơn này mình hủy giúp nhé.",
      time: "12:20",
      platform: "zalo",
      status: "offline",
      unread: false,
      tags: [{ label: "Tiềm năng", tone: "potential" }],
    },
    messages: [
      { id: 1, sender: "customer", content: "Đơn này mình hủy giúp nhé.", time: "12:12" },
      { id: 2, sender: "agent", content: "Em đã ghi nhận yêu cầu hủy đơn và cập nhật trạng thái.", time: "12:20" },
    ],
    orderAction: {
      address: "220 Phan Đình Phùng, Phú Nhuận, TP.HCM",
      customerTier: "Khách mới",
      loyaltyPoints: 0,
      voucherCode: "",
      orderNote: "Khách đổi nhu cầu, giữ lại hội thoại để chăm sóc sau.",
      shippingFee: 0,
      cartItems: [{ id: 1, name: "Má hồng kem tự nhiên", sku: "MH-013", price: 280000, quantity: 1 }],
      orderStatus: "cancelled",
      hasSentOrderToCustomer: true,
      isOrderCreated: true,
    },
  },
];

export const productCatalog: IProductCatalogItem[] = [
  { name: "Nước tẩy trang làm sạch sâu", sku: "TT-120", price: 210000, stock: 32 },
  { name: "Kem dưỡng phục hồi ban đêm", sku: "KD-220", price: 560000, stock: 14 },
  { name: "Tinh chất vitamin C sáng da", sku: "VC-030", price: 480000, stock: 21 },
  { name: "Sữa rửa mặt dịu nhẹ", sku: "SRM-010", price: 250000, stock: 44 },
  { name: "Xịt khoáng cấp ẩm", sku: "XK-150", price: 175000, stock: 18 },
];
