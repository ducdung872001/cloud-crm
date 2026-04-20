# BACKEND-TASK — Finance Dashboard API trả 500

**Phát hiện**: smoke-nav test (`tests/test-smoke-nav.mjs`, run x69gym).
**Route FE**: `/finance_management/dashboard`
**Symptom**: Console browser log `Failed to load resource: the server responded with a status of 500 (Internal Server Error)` khi mở trang.

## Endpoint nghi vấn
- GET `${urlsApi.financeDashboard.full}` — hàm `FinanceDashboardService.full` trong `src/services/FinanceDashboardService.ts`
- GET `${urlsApi.financeDashboard.chart}` — hàm `FinanceDashboardService.chart`

Cần kiểm tra path cụ thể từ `src/configs/urls.ts` (mục `financeDashboard`), với tham số:
```
branchId=0
fromTime=dd/MM/yyyy (30 ngày trước)
toTime=dd/MM/yyyy (hôm nay)
```

## Yêu cầu BE
1. Reproduce với user test `0971234599` / role Ban giám đốc (id 10_43).
2. Kiểm tra log tại `/billing/finance/dashboard` (và `/chart`) — stacktrace nào?
3. Khả năng: NPE khi tenant chưa có quỹ/giao dịch nào, hoặc date parse sai format `dd/MM/yyyy`.
4. Dù dữ liệu rỗng BE vẫn phải trả 200 với `data: { totalFundBalance: 0, totalIncome: 0, totalExpense: 0, recentTransactions: [] }` thay vì 500.

## FE đã fix
- Thêm default `data ?? {}` trong `src/pages/Finance/Dashboard/index.tsx` để không crash UI khi API trả 500/rỗng. Không che lỗi BE — error vẫn log ra console.

## Độ ưu tiên
Cao — Finance Dashboard là trang chính của phân hệ Tài chính, đang hiển thị trắng khi có lỗi server.
