Thiết kế hệ thống Chat Omnichannel tích hợp Fanpage Facebook, Zalo OA, Instagram
theo triết lý ALL-IN-ONE với giao diện 3 cột tối ưu chốt đơn ngay trong khung chat.

========================
I. TRIẾT LÝ GIAO DIỆN
========================

- Tất cả thao tác trong một màn hình duy nhất.
- Không chuyển tab.
- Không chuyển sang phần mềm bán hàng khác.
- Mọi quy trình từ tư vấn → thêm sản phẩm → tạo đơn → giao vận → theo dõi
đều diễn ra trong cùng không gian làm việc.

Giao diện gồm 3 cột:

-----------------------------------
CỘT 1: HỘI TỤ ĐA KÊNH (Inbox Hub)
-----------------------------------

Chức năng:
- Gom toàn bộ tin nhắn từ:
    + Facebook Fanpage
    + Zalo OA
    + Instagram
- Hiển thị chung trong 1 danh sách hội thoại duy nhất.

Tính năng:
- Tìm kiếm hội thoại
- Bộ lọc:
    + Tất cả
    + Chưa đọc
    + Đang tư vấn
- Gắn tag:
    + VIP
    + Hỏi giá
    + Đã mua
    + Tiềm năng
- Hiển thị trạng thái:
    + Online
    + Đang tư vấn
    + Đã đọc / chưa đọc
- Hiển thị nguồn nền tảng (icon Facebook/Zalo/Instagram)

Mục tiêu:
- Nhân viên không cần biết khách đang ở nền tảng nào.
- Không bỏ sót tin nhắn.
- Phân loại khách ngay từ đầu.

-----------------------------------
CỘT 2: KHÔNG GIAN GIAO TIẾP (Chat Workspace)
-----------------------------------

Chức năng:
- Hiển thị toàn bộ lịch sử hội thoại.
- Trả lời trực tiếp trong khung chat.

Tính năng:
- Soạn tin nhắn nhanh.
- Gửi file / hình ảnh.
- Trợ lý kịch bản tự động:
    + Gợi ý câu trả lời theo ngữ cảnh.
    + Gọi nhanh mẫu câu có sẵn.
    + Ví dụ:
        /chao
        /banggia
        /stk

Mục tiêu:
- Tăng tốc phản hồi.
- Chuẩn hóa nội dung tư vấn.
- Giảm phụ thuộc vào kỹ năng cá nhân.

-----------------------------------
CỘT 3: TRUNG TÂM HÀNH ĐỘNG (Order Action Center)
-----------------------------------

Chức năng:
Biến cuộc trò chuyện thành doanh thu.

Bao gồm:

1) Thông tin khách hàng
    - Tên khách
    - Số điện thoại
    - Địa chỉ
    - Tự động truy xuất nếu là khách cũ
    - Gợi ý khi nhập số điện thoại
    - Hiển thị hạng khách hàng (VIP, Loyalty)

2) Giỏ hàng & sản phẩm
    - Tìm kiếm sản phẩm (Elastic search)
    - Thêm sản phẩm vào giỏ
    - Tăng/giảm số lượng
    - Hiển thị giá
    - Áp dụng voucher
    - Tự động tính tổng tiền

3) Tóm tắt đơn hàng
    - Tổng tiền
    - Phí vận chuyển
    - Voucher giảm giá
    - Ghi chú đơn hàng

4) Nút "Tạo đơn"
    - One-click tạo đơn
    - Đồng bộ trực tiếp sang:
        + Hệ thống quản lý đơn
        + API đơn vị vận chuyển

-----------------------------------
II. LUỒNG TẠO ĐƠN
-----------------------------------

Chat → Thêm sản phẩm → Nhập thông tin → Click tạo đơn → 
→ Đồng bộ hệ thống quản lý → Gửi sang đơn vị vận chuyển

Không cần nhập lại dữ liệu.

-----------------------------------
III. QUẢN LÝ SAU BÁN HÀNG
-----------------------------------

- Ghi chú đơn hàng trực tiếp trong hệ thống.
- Theo dõi trạng thái vận chuyển ngay trong không gian làm việc.
- Thông báo:
    + Đã tạo đơn
    + Đã chuyển vận chuyển
    + Giao thành công

-----------------------------------
IV. XỬ LÝ BÌNH LUẬN MẠNG XÃ HỘI
-----------------------------------

- Gom bình luận từ bài viết & quảng cáo.
- Trả lời trực tiếp.
- Chuyển bình luận thành tin nhắn để tư vấn riêng.

-----------------------------------
V. TÍCH HỢP LOYALTY
-----------------------------------

- Xem điểm tích lũy khách hàng.
- Hiển thị hạng khách.
- Cho phép sử dụng điểm khi tạo đơn.
- Thông báo thưởng trực tiếp qua chat.

-----------------------------------
VI. KPI & LỢI ÍCH
-----------------------------------

Mục tiêu hệ thống:

- Rút ngắn 70% thời gian xử lý đơn.
- Giảm sai sót khi đẩy đơn vận chuyển.
- Tăng tỷ lệ chốt đơn.
- Giảm phân mảnh dữ liệu.
- Tối ưu trải nghiệm nhân viên.

-----------------------------------
VII. CẤU TRÚC COMPONENT UI
-----------------------------------

OmniChatPage
 ├── ChannelInboxColumn
 │     ├── ConversationList
 │     ├── FilterBar
 │     └── TagBadge
 │
 ├── ChatWorkspaceColumn
 │     ├── MessageList
 │     ├── QuickReplyPanel
 │     └── MessageInput
 │
 └── OrderActionColumn
       ├── CustomerInfoCard
       ├── CartManager
       ├── VoucherSection
       ├── OrderSummary
       └── CreateOrderButton

-----------------------------------
VIII. YÊU CẦU UX
-----------------------------------

- Real-time cập nhật tin nhắn.
- Không reload trang.
- Không chuyển màn hình.
- Responsive.
- Tối ưu thao tác bàn phím.
- Thiết kế tối giản, tập trung vào hiệu suất.