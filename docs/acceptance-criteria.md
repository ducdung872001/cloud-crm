# Tiêu Chí Nghiệm Thu - Reborn Retail CRM

> **Dự án:** Reborn Retail CRM (Chuỗi cửa hàng bán lẻ)
> **Phiên bản:** 1.0
> **Ngày lập:** 2026-04-16
> **Người lập:** Project Manager

---

## Giới thiệu

Tài liệu này định nghĩa các tiêu chí nghiệm thu cho dự án Reborn Retail CRM, chia thành 3 giai đoạn triển khai. Mỗi tiêu chí phải đạt **Đạt** để giai đoạn được nghiệm thu thành công. Nếu có tiêu chí **Không đạt**, cần ghi rõ lý do và kế hoạch khắc phục tại cột Ghi chú.

**Điều kiện nghiệm thu từng giai đoạn:**
- Tất cả tiêu chí bắt buộc phải đạt trạng thái **Đạt**
- Không có lỗi nghiêm trọng (Critical/Blocker) chưa được xử lý
- Tài liệu bàn giao đầy đủ cho giai đoạn tương ứng
- Hai bên ký biên bản nghiệm thu

---

## Giai đoạn 1: POS + Bán hàng cơ bản (Tháng 1-2)

**Mục tiêu:** Triển khai POS tại 3-5 cửa hàng pilot, đảm bảo quy trình bán hàng cơ bản hoạt động ổn định.

| STT | Tiêu chí | Mô tả | Phương pháp kiểm tra | Kết quả | Ghi chú |
|-----|---------|-------|----------------------|---------|---------|
| 1.1 | **Deploy môi trường Production** | Hệ thống được deploy thành công lên môi trường production, truy cập được qua domain chính thức | Truy cập URL hệ thống, đăng nhập thành công với tài khoản admin. Kiểm tra SSL certificate, response time < 3 giây | Đạt / Không | |
| 1.2 | **POS pilot 3-5 cửa hàng** | POS hoạt động ổn định tại ít nhất 3 cửa hàng pilot trong 5 ngày liên tiếp không có lỗi Critical | Theo dõi log và báo cáo lỗi từ 3-5 cửa hàng pilot trong 5 ngày làm việc. Kiểm tra số lượng giao dịch thành công / thất bại | Đạt / Không | |
| 1.3 | **Mở ca / Đóng ca (Shift)** | Nhân viên có thể mở ca đầu ngày (khai báo số dư đầu), đóng ca cuối ngày (đối soát tiền mặt, in báo cáo ca) | (1) Mở ca với số dư đầu 5.000.000đ. (2) Thực hiện 10+ giao dịch. (3) Đóng ca - kiểm tra tổng tiền khớp với giao dịch. (4) In phiếu đóng ca | Đạt / Không | |
| 1.4 | **Tạo hoá đơn bán hàng** | Tạo được hoá đơn bán hàng với 1+ sản phẩm, áp dụng đúng giá bán, tính đúng tổng tiền (trước thuế, thuế, giảm giá, tổng thanh toán) | (1) Tạo hoá đơn 1 sản phẩm - kiểm tra tính toán. (2) Tạo hoá đơn 5+ sản phẩm - kiểm tra tính toán. (3) Tạo hoá đơn có giảm giá % và giảm giá tiền. (4) Kiểm tra làm tròn số | Đạt / Không | |
| 1.5 | **In hoá đơn (receipt)** | In hoá đơn thành công qua máy in nhiệt (80mm), nội dung đầy đủ: tên cửa hàng, sản phẩm, giá, tổng tiền, mã hoá đơn, ngày giờ | (1) Kết nối máy in nhiệt. (2) In hoá đơn - kiểm tra nội dung, layout, mã vạch/QR. (3) In lại hoá đơn cũ. (4) Kiểm tra in khi mất kết nối máy in (hiện thông báo lỗi phù hợp) | Đạt / Không | |
| 1.6 | **Thanh toán nhiều phương thức** | Khách hàng có thể thanh toán bằng: tiền mặt, chuyển khoản, thẻ, ví điện tử. Hỗ trợ thanh toán kết hợp (VD: 50% tiền mặt + 50% chuyển khoản) | (1) Thanh toán 100% tiền mặt - kiểm tra tiền thừa. (2) Thanh toán 100% chuyển khoản. (3) Thanh toán kết hợp 2 phương thức. (4) Kiểm tra sổ quỹ ghi nhận đúng theo từng phương thức | Đạt / Không | |
| 1.7 | **Tra cứu khách hàng** | Tìm kiếm khách hàng nhanh theo SĐT, tên, mã khách hàng. Gán khách hàng vào hoá đơn để tích điểm | (1) Tìm theo SĐT - kết quả < 1 giây. (2) Tìm theo tên (hỗ trợ không dấu). (3) Tạo khách hàng mới nhanh tại POS. (4) Gán khách hàng vào hoá đơn - kiểm tra lịch sử mua hàng cập nhật | Đạt / Không | |
| 1.8 | **POS offline mode** | POS vẫn hoạt động bình thường khi mất internet: tạo hoá đơn, thanh toán tiền mặt, in receipt. Dữ liệu đồng bộ lại khi có mạng | (1) Ngắt mạng - tạo 5 hoá đơn. (2) Bật mạng lại - kiểm tra 5 hoá đơn đồng bộ thành công. (3) Kiểm tra không trùng lặp dữ liệu. (4) Kiểm tra báo cáo sau đồng bộ | Đạt / Không | |
| 1.9 | **Quản lý sản phẩm cơ bản** | Thêm/sửa/xoá sản phẩm, nhóm sản phẩm. Sản phẩm có: tên, mã, giá bán, đơn vị tính, hình ảnh | (1) Tạo sản phẩm mới với đầy đủ thông tin. (2) Cập nhật giá bán - kiểm tra POS cập nhật. (3) Ngừng kinh doanh sản phẩm - kiểm tra không hiện trên POS. (4) Import sản phẩm từ Excel | Đạt / Không | |
| 1.10 | **Báo cáo bán hàng cơ bản** | Báo cáo doanh thu theo ngày/tuần/tháng, theo cửa hàng, theo nhân viên. Số liệu khớp với giao dịch thực tế | (1) Báo cáo doanh thu ngày - đối chiếu với từng hoá đơn. (2) Báo cáo theo cửa hàng - tổng các cửa hàng = tổng công ty. (3) Export báo cáo ra Excel | Đạt / Không | |

---

## Giai đoạn 2: Kho + Tài chính + Đa kênh (Tháng 2-4)

**Mục tiêu:** Hoàn thiện quản lý kho hàng, tài chính (sổ quỹ, công nợ), và hỗ trợ bán hàng đa kênh.

| STT | Tiêu chí | Mô tả | Phương pháp kiểm tra | Kết quả | Ghi chú |
|-----|---------|-------|----------------------|---------|---------|
| 2.1 | **Quản lý tồn kho** | Xem tồn kho thực tế theo cửa hàng, theo kho. Tồn kho cập nhật tự động khi bán, nhập, chuyển, trả, huỷ | (1) Bán 5 SP A - kiểm tra tồn kho giảm 5. (2) Nhập 10 SP A - kiểm tra tồn kho tăng 10. (3) Chuyển kho 3 SP A từ CH1 sang CH2 - kiểm tra cả 2 kho. (4) Kiểm tra tồn kho âm (có cảnh báo) | Đạt / Không | |
| 2.2 | **Phiếu nhập kho** | Tạo phiếu nhập kho từ nhà cung cấp, nhập chuyển kho, nhập trả hàng. In phiếu nhập. Duyệt phiếu nhập theo workflow | (1) Tạo phiếu nhập từ NCC với 10 sản phẩm. (2) Duyệt phiếu nhập - kiểm tra tồn kho tăng. (3) Từ chối phiếu nhập - kiểm tra tồn kho không đổi. (4) In phiếu nhập kho | Đạt / Không | |
| 2.3 | **Phiếu xuất kho** | Tạo phiếu xuất bán hàng (tự động từ hoá đơn), xuất chuyển kho, xuất huỷ, xuất trả NCC | (1) Bán hàng - kiểm tra phiếu xuất tự động. (2) Tạo phiếu xuất chuyển kho - kiểm tra tồn 2 kho. (3) Xuất huỷ có lý do - kiểm tra tồn kho giảm. (4) Xuất trả NCC có phiếu nhập gốc | Đạt / Không | |
| 2.4 | **Sổ quỹ (Cashbook)** | Ghi nhận thu/chi tự động từ giao dịch bán hàng, nhập hàng. Hỗ trợ tạo phiếu thu/chi thủ công. Cân đối cuối ngày | (1) Bán hàng - kiểm tra bút toán thu tự động. (2) Nhập hàng - kiểm tra bút toán chi tự động. (3) Tạo phiếu thu/chi thủ công. (4) Đối soát sổ quỹ cuối ngày - số dư khớp | Đạt / Không | |
| 2.5 | **Quản lý công nợ** | Theo dõi công nợ khách hàng (bán chưa thu) và công nợ nhà cung cấp (mua chưa trả). Cảnh báo nợ quá hạn | (1) Bán hàng chưa thu tiền - công nợ KH tăng. (2) Thu tiền - công nợ KH giảm. (3) Nhập hàng chưa trả - công nợ NCC tăng. (4) Báo cáo công nợ quá hạn | Đạt / Không | |
| 2.6 | **Đơn hàng đa kênh** | Tiếp nhận đơn hàng từ website/app/Shopee/Lazada/TikTok Shop. Đơn hàng hiển thị tập trung trên hệ thống | (1) Tạo đơn từ website - kiểm tra hiển thị trên CRM. (2) Đồng bộ đơn từ Shopee (nếu có API). (3) Xử lý đơn: xác nhận, đóng gói, giao hàng. (4) Cập nhật trạng thái đồng bộ ngược lại kênh bán | Đạt / Không | |
| 2.7 | **Hoá đơn điện tử (VAT e-invoice)** | Phát hành hoá đơn điện tử theo quy định (Thông tư 78). Tích hợp VNPT/Viettel/BKAV. Huỷ, điều chỉnh, thay thế hoá đơn | (1) Phát hành HĐĐT từ hoá đơn bán hàng. (2) Kiểm tra thông tin HĐĐT đúng (mã số thuế, tên KH, sản phẩm, thuế suất). (3) Huỷ HĐĐT - kiểm tra trạng thái. (4) Điều chỉnh HĐĐT - kiểm tra hoá đơn gốc | Đạt / Không | |
| 2.8 | **Kiểm kho** | Tạo phiếu kiểm kho, nhân viên nhập số lượng thực tế, hệ thống tính chênh lệch và tạo phiếu điều chỉnh | (1) Tạo phiếu kiểm kho cho 20 SP. (2) Nhập số lượng thực tế (có chênh lệch). (3) Duyệt kiểm kho - kiểm tra tồn kho điều chỉnh. (4) Báo cáo chênh lệch kiểm kho | Đạt / Không | |
| 2.9 | **Trả hàng** | Khách hàng trả hàng: tạo phiếu trả, hoàn tiền (tiền mặt/chuyển khoản), cập nhật lại tồn kho và doanh thu | (1) Trả hàng 1 phần đơn - kiểm tra hoàn tiền đúng số tiền. (2) Trả hàng toàn bộ đơn. (3) Kiểm tra tồn kho tăng lại. (4) Kiểm tra báo cáo doanh thu trừ trả hàng | Đạt / Không | |
| 2.10 | **Quản lý nhà cung cấp** | CRUD nhà cung cấp (tên, MST, địa chỉ, liên hệ). Lịch sử nhập hàng, công nợ theo NCC | (1) Tạo NCC mới. (2) Tạo phiếu nhập từ NCC - kiểm tra lịch sử. (3) Xem công nợ theo NCC. (4) Báo cáo mua hàng theo NCC (số lượng, giá trị) | Đạt / Không | |

---

## Giai đoạn 3: Marketing + Loyalty + Báo cáo + Bàn giao (Tháng 4-6)

**Mục tiêu:** Hoàn thiện các tính năng marketing, loyalty, báo cáo nâng cao. Bàn giao hệ thống và đào tạo đội ngũ tự vận hành.

| STT | Tiêu chí | Mô tả | Phương pháp kiểm tra | Kết quả | Ghi chú |
|-----|---------|-------|----------------------|---------|---------|
| 3.1 | **Promotion engine** | Cấu hình chương trình khuyến mãi: giảm giá %, giảm giá tiền, mua X tặng Y, combo, flash sale. Áp dụng tự động trên POS | (1) Tạo KM giảm 20% nhóm SP A - kiểm tra POS áp dụng đúng. (2) Tạo KM mua 2 tặng 1 - kiểm tra tính toán. (3) 2 KM chồng nhau - kiểm tra rule ưu tiên. (4) KM hết hạn - kiểm tra tự động ngừng | Đạt / Không | |
| 3.2 | **Loyalty points (Tích điểm)** | Khách hàng tích điểm theo giá trị mua hàng. Đổi điểm thành voucher hoặc giảm giá trực tiếp. Hạng thành viên (Silver/Gold/Platinum) | (1) Mua 1.000.000đ - kiểm tra điểm tích luỹ đúng tỉ lệ. (2) Đổi điểm - kiểm tra trừ đúng. (3) Nâng hạng tự động khi đủ điều kiện. (4) Báo cáo điểm tích luỹ, đổi điểm theo thời gian | Đạt / Không | |
| 3.3 | **Báo cáo nâng cao** | Dashboard tổng quan (doanh thu, đơn hàng, KH mới, top SP). Báo cáo lợi nhuận gộp, báo cáo tồn kho, báo cáo ABC, báo cáo KH | (1) Dashboard real-time - số liệu khớp với chi tiết. (2) Báo cáo lợi nhuận gộp = doanh thu - giá vốn. (3) Báo cáo ABC phân loại đúng SP theo doanh thu. (4) Export tất cả báo cáo ra Excel/PDF | Đạt / Không | |
| 3.4 | **BPM (Quy trình nghiệp vụ)** | Cấu hình workflow duyệt: phiếu nhập kho, phiếu xuất, phiếu chi, khuyến mãi. Phân quyền duyệt theo cấp bậc | (1) Tạo phiếu chi > 10 triệu - kiểm tra cần duyệt cấp 2. (2) Duyệt phiếu - kiểm tra trạng thái cập nhật. (3) Từ chối phiếu - kiểm tra lý do và thông báo. (4) Uỷ quyền duyệt khi người duyệt vắng | Đạt / Không | |
| 3.5 | **Đào tạo hoàn tất** | 100% nhân viên cửa hàng được đào tạo và có thể tự thao tác các chức năng cơ bản (POS, kiểm kho, báo cáo) | (1) Kiểm tra checklist đào tạo: 100% nhân viên hoàn thành. (2) Bài kiểm tra thực hành: đạt tối thiểu 80%. (3) Mỗi cửa hàng có ít nhất 1 super-user. (4) Tài liệu HDSD đã phát cho tất cả cửa hàng | Đạt / Không | |
| 3.6 | **Tài liệu bàn giao** | Đầy đủ tài liệu: HDSD, tài liệu kỹ thuật (API docs, DB schema, deployment guide), tài liệu vận hành (backup, monitoring) | (1) Kiểm tra danh mục tài liệu bàn giao. (2) Review nội dung HDSD - đầy đủ các chức năng. (3) Review tài liệu kỹ thuật - dev mới đọc hiểu được. (4) Review tài liệu vận hành - IT có thể tự deploy | Đạt / Không | |
| 3.7 | **Đội ngũ tự vận hành** | Đội IT/vận hành của khách hàng có khả năng: xử lý lỗi cơ bản, backup/restore, tạo user, cấu hình hệ thống | (1) Kịch bản test: server restart - đội IT tự xử lý. (2) Kịch bản: tạo cửa hàng mới + user + phân quyền. (3) Kịch bản: backup và restore database. (4) Kịch bản: xử lý hoá đơn lỗi | Đạt / Không | |
| 3.8 | **SMS/Zalo OA thông báo** | Gửi tin nhắn tự động cho khách hàng: xác nhận đơn, chúc mừng sinh nhật, nhắc lịch hẹn, thông báo khuyến mãi | (1) Đặt hàng - kiểm tra SMS/Zalo xác nhận gửi thành công. (2) Cấu hình tin nhắn sinh nhật - kiểm tra gửi đúng ngày. (3) Báo cáo số lượng tin gửi/thất bại. (4) Opt-out: KH huỷ nhận tin - kiểm tra không gửi nữa | Đạt / Không | |
| 3.9 | **Phân quyền và bảo mật** | RBAC phân quyền theo vai trò (admin, quản lý, thu ngân, kho). Phân quyền theo chi nhánh. Audit log đầy đủ | (1) Thu ngân không truy cập được báo cáo tài chính. (2) Quản lý CH1 không thấy dữ liệu CH2. (3) Admin thấy tất cả. (4) Kiểm tra audit log ghi nhận mọi thao tác quan trọng | Đạt / Không | |
| 3.10 | **Performance & Stability** | Hệ thống hoạt động ổn định 30 ngày liên tục. Response time API < 2s. Uptime > 99.5%. Không có lỗi Critical chưa fix | (1) Báo cáo uptime 30 ngày từ monitoring. (2) Báo cáo response time P95 < 2s. (3) Danh sách bug: 0 Critical, 0 Blocker. (4) Load test: 50 user đồng thời, không lỗi | Đạt / Không | |

---

## Điều kiện nghiệm thu tổng thể

| Hạng mục | Yêu cầu | Trạng thái |
|----------|---------|------------|
| Tất cả tiêu chí bắt buộc | 100% đạt "Đạt" | |
| Lỗi Critical / Blocker | 0 lỗi chưa xử lý | |
| Lỗi Major | Tối đa 3 lỗi, có kế hoạch fix trong 2 tuần | |
| Tài liệu bàn giao | Đầy đủ theo danh mục | |
| Đào tạo | 100% nhân viên hoàn thành | |
| Vận hành thử | Tối thiểu 2 tuần không sự cố nghiêm trọng | |

---

## Chữ ký nghiệm thu

### Giai đoạn 1: POS + Bán hàng cơ bản

| | Họ tên | Chức vụ | Chữ ký | Ngày |
|---|--------|---------|--------|------|
| **Bên A (Khách hàng)** | | | | |
| Đại diện 1 | _________________ | _________________ | _________________ | ____/____/2026 |
| Đại diện 2 | _________________ | _________________ | _________________ | ____/____/2026 |
| **Bên B (Reborn)** | | | | |
| Project Manager | _________________ | _________________ | _________________ | ____/____/2026 |
| Tech Lead | _________________ | _________________ | _________________ | ____/____/2026 |

### Giai đoạn 2: Kho + Tài chính + Đa kênh

| | Họ tên | Chức vụ | Chữ ký | Ngày |
|---|--------|---------|--------|------|
| **Bên A (Khách hàng)** | | | | |
| Đại diện 1 | _________________ | _________________ | _________________ | ____/____/2026 |
| Đại diện 2 | _________________ | _________________ | _________________ | ____/____/2026 |
| **Bên B (Reborn)** | | | | |
| Project Manager | _________________ | _________________ | _________________ | ____/____/2026 |
| Tech Lead | _________________ | _________________ | _________________ | ____/____/2026 |

### Giai đoạn 3: Marketing + Loyalty + Báo cáo + Bàn giao

| | Họ tên | Chức vụ | Chữ ký | Ngày |
|---|--------|---------|--------|------|
| **Bên A (Khách hàng)** | | | | |
| Đại diện 1 | _________________ | _________________ | _________________ | ____/____/2026 |
| Đại diện 2 | _________________ | _________________ | _________________ | ____/____/2026 |
| **Bên B (Reborn)** | | | | |
| Project Manager | _________________ | _________________ | _________________ | ____/____/2026 |
| Tech Lead | _________________ | _________________ | _________________ | ____/____/2026 |

---

> **Ghi chú:** Biên bản nghiệm thu chỉ có hiệu lực khi có đầy đủ chữ ký của đại diện hai bên. Mỗi giai đoạn nghiệm thu độc lập, giai đoạn sau chỉ bắt đầu khi giai đoạn trước đã được nghiệm thu thành công.
