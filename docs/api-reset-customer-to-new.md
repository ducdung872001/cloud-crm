# Spec API: Reset dữ liệu khách hàng về "New" để chia lại cho Telesale

## Mục đích
Tạo 1 API mới để "làm mới" một danh sách khách hàng, đưa họ trở về trạng thái dữ liệu mới (như lead vừa lên CRM), phục vụ mục đích chia lại data cho TLS call lại từ đầu.

## Endpoint đề xuất
`POST /adminapi/customer/reset_to_new`

## Request body
```json
{
  "customerIds": [425278, 537245]
}
```

## Logic xử lý (cho mỗi customerId trong danh sách)

### 1. Reset lịch sử cuộc gọi Follow 1-4
- Xoá (hoặc vô hiệu hoá) toàn bộ record trong bảng `telesale_call` liên quan tới `customerId` này.
- Mục tiêu: các cột Follow 1 / Follow 2 / Follow 3 / Follow 4 trên UI danh sách khách hàng trả về **rỗng (new)** — tức `telesaleCall = []` trong response `/customer/list_paid`.
- Lưu ý: trường `telesaleCall` trong response list_paid chính là nguồn dữ liệu hiển thị các cột Follow 1-4, nên cần clear đúng bảng này.

### 2. Reset các trường trên bảng `customer`

| Trường | Giá trị mới |
|---|---|
| `syncTime` (Ngày CRM nhận dữ liệu) | **NOW()** — ngày giờ hệ thống tại thời điểm gọi API |
| `employeeAssignDate` (Ngày nhận phụ trách) | **NULL** |
| `employeeId` (Người phụ trách) | **442** (Trần Minh Hiếu) |

### 3. Ghi log (nên có)
- Log lại hành động reset: ai thực hiện (userId từ token), thời điểm, danh sách customerIds đã reset — để trace về sau.

## Response
```json
{
  "code": 0,
  "message": "OK",
  "result": {
    "total": 2,
    "successIds": [425278, 537245],
    "failedIds": []
  }
}
```

## Ràng buộc / lưu ý
- Xử lý theo **batch/transaction** để đảm bảo atomic: nếu reset 1 customer fail thì customer đó rollback, không ảnh hưởng customer khác.
- Validate `customerIds` không rỗng, có giới hạn max (vd: 1000/lần) để tránh timeout.
- Check quyền: chỉ role admin/manager mới được gọi API này.
- Sau khi reset xong, khách hàng sẽ xuất hiện như "new lead" trong flow chia data cho TLS (giống như khách mới vừa import vào CRM).

## Xác minh sau khi chạy
Gọi lại `/customer/list_paid` và kiểm tra với `customerId` đã reset:
- `telesaleCall` = `[]`
- `syncTime` = thời điểm reset
- `employeeAssignDate` = `null`
- `employeeId` = `442`
- `employeeName` = "Trần Minh Hiếu"
