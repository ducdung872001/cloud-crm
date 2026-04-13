# UNCERTAIN — Payment Control phát sinh số lượng console error rất lớn

**Phát hiện**: `tests/test-smoke-nav.mjs` ghi nhận route `/payment_control` tạo ra **464 console errors** trong một lần mở trang.

## Errors quan sát
```
Error fetching employee info: TypeError: Failed to fetch
```
(lặp lại hàng trăm lần)

## Giả thuyết
1. **Network retry loop**: `getDetailEmployeeInfo` trong `src/App.tsx:217` không có backoff/retry cap; nếu bị rate-limit hoặc CORS thì chạy vô hạn.
2. **Component re-render storm**: `src/pages/Reconcile/index.tsx` dùng `useReconciliationList({ params, enabled: true })` với useEffect deps `[enabled, params]` (`src/hooks/useReconciliationList.ts:102`). Object `params` là useState nên reference stable — về lý thuyết OK — nhưng nếu nào đó làm `setParams` trong callback cha thì sinh vòng lặp.
3. **Transient network blip** lặp đi lặp lại do một component cha subscribe timer / interval chưa cleanup.

## Cần xác nhận
- Chạy app thủ công, mở DevTools → Network panel, vào `/payment_control`, xem có request nào lặp vô hạn không?
- Nếu có → tìm component/hook gốc gây lặp.
- Nếu không (chỉ là transient vì test chạy nhiều tab song song) → giảm ưu tiên, chỉ cần fail-safe catch trong App.tsx: sau N lần thất bại liên tiếp thì dừng, không spam console.

## Tác động
- UX: UI treo, DevTools log flood, khó debug.
- Khả năng cao là FE bug, nhưng cần repro thủ công trước khi fix để tránh fix sai.
