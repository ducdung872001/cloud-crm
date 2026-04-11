# Bugs Không Chắc Chắn - Cần Đánh Giá Thêm

Các bug dưới đây tôi không tự tin fix vì thiếu thông tin hoặc cần phối hợp FE+BE.

## 1. C.1.4 - Sản phẩm bán chạy hiển thị sai giá (Báo cáo POS)
- **Mô tả**: Trong tab Báo cáo của Bán hàng tại quầy, một số sản phẩm bán chạy hiển thị giá "0 đ"
- **Lý do không chắc**: Chưa rõ dữ liệu giá từ API response hay logic tính toán FE. Có thể là:
  - BE trả `sellingPrice = 0` cho sản phẩm có nhiều biến thể (giá khác nhau)
  - FE dùng field sai để hiển thị giá
- **Cần**: Kiểm tra API response của endpoint báo cáo sản phẩm bán chạy

## 2. C.1.5 - Mục trống trong bug report
- Tester chưa mô tả bug cụ thể

## 3. C.3.8 - Tên sản phẩm không hiện trên phiếu trả hàng (detail modal)
- **Mô tả**: Trong ReturnDetailModal, sản phẩm hiện "–" thay vì tên
- **Lý do không chắc**: FE parse `productSummary` từ danh sách. Nếu BE không trả `products` array, FE enrich sẽ fail → hiện "–". Cần BE fix trước
- **Phụ thuộc**: Bug C.3.3 BE fix xong → FE tự hiện đúng

## 4. D.1.1 - Quét mã QR chưa tìm được sản phẩm
- **Mô tả**: Trong danh sách sản phẩm, popup quét mã QR chưa hoạt động
- **Lý do không chắc**: Chưa xem chi tiết flow quét QR → gọi API tìm sản phẩm. Có thể:
  - Camera API chưa được implement đầy đủ
  - Sau khi scan, keyword tìm kiếm không được set đúng
  - API search by barcode chưa hoạt động
- **Cần**: Kiểm tra QrScanModal component và flow sau scan

## 5. F.6.2 - QR Thu nợ không chia sẻ được
- **Mô tả**: Không share được QR qua Zalo/FB/Messenger
- **Lý do không chắc**: 
  - Nếu dùng Web Share API → chỉ hoạt động trên mobile browser
  - Nếu dùng deep link → cần URL public, phụ thuộc BE
  - Copy link hiện text thay vì URL → có thể FE chưa implement đúng clipboard
- **Cần**: Kiểm tra share flow trong DebtManagement QR modal

## 6. C.2 / C.6-C.9 / D.2-D.3 / D.5-D.6 / E.2-E.4 / F.1-F.5 / F.7 / G-J
- Các mục này trong bug report không có mô tả bug cụ thể (chỉ có tiêu đề section)
- Có thể chưa test hoặc chưa phát hiện bug
