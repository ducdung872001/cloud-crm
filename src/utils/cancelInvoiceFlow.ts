/**
 * Helper — Hủy đơn bán (IV1) bằng cách tạo phiếu trả toàn bộ (IV2) + confirm.
 *
 * Dùng cho:
 *  1. Nút "Hủy đơn" ở SaleInvoiceList (POS > Đơn hàng)
 *  2. Auto-return khi hủy đơn vận chuyển trong ShippingList
 *
 * Flow:
 *  1. GET /sales/invoice/get/return?id=X → lấy items
 *  2. POST /sales/invoice/create/return với full items
 *  3. POST /sales/invoice/return/confirm?id=Y
 *
 * BE sẽ tự:
 *  - Hoàn stock
 *  - Tạo cashbook expense entry (refund)
 *  - Giảm fund balance
 */
import ReturnInvoiceService from "@/services/ReturnInvoiceService";

export interface CancelInvoiceResult {
  ok: boolean;
  returnInvoiceId?: number;
  refundAmount?: number;
  message?: string;
}

export async function cancelInvoiceByReturn(
  invoiceId: number,
  reason = "Hủy đơn hàng"
): Promise<CancelInvoiceResult> {
  try {
    // 1. Lấy items gốc của đơn
    const retItemsRes = await ReturnInvoiceService.getReturnItems(invoiceId);
    if (retItemsRes?.code !== 0) {
      return { ok: false, message: retItemsRes?.message || "Không lấy được thông tin đơn hàng" };
    }
    const result = retItemsRes.result || {};
    const lstBP: Record<string, unknown>[] = result.lstBoughtProduct || result.products || [];
    if (lstBP.length === 0) {
      return { ok: false, message: "Đơn hàng không có sản phẩm để hủy (có thể đã trả hết)" };
    }

    // 2. Tính tổng refund = sum(price * qty)
    const totalRefund = lstBP.reduce(
      (sum, p) => sum + Number(p.price || 0) * Number(p.quantity ?? p.qty ?? 0),
      0
    );

    // 3. Build body với ALL items (trả toàn bộ)
    const returnBody = {
      invoice: {
        referId:      invoiceId,
        customerId:   Number(result.customerId ?? -1),
        amount:       totalRefund,
        fee:          totalRefund,
        paid:         totalRefund,
        debt:         0,
        discount:     0,
        vatAmount:    0,
        paymentType:  1,
        reason,
        refundMethod: 1,
        note:         `Hủy đơn ${invoiceId} — auto return`,
      },
      lstBoughtProduct: lstBP.map((p) => ({
        productId:   Number(p.productId),
        variantId:   Number(p.variantId),
        unitId:      Number(p.unitId),
        quantity:    Number(p.quantity ?? p.qty ?? 0),
        qty:         Number(p.quantity ?? p.qty ?? 0),
        price:       Number(p.price || 0),
        fee:         Number(p.price || 0) * Number(p.quantity ?? p.qty ?? 0),
        discount:    0,
        discountUnit: 2,
        inventoryId: p.inventoryId,
        name:        p.name,
      })),
      lstService:     [],
      lstCardService: [],
    };

    // 4. Tạo phiếu trả
    const createRes = await ReturnInvoiceService.createReturn(returnBody as never);
    if (createRes?.code !== 0) {
      return { ok: false, message: createRes?.message || createRes?.error || "Tạo phiếu hủy thất bại" };
    }
    const returnInvoiceId: number =
      Number(createRes.result?.id ?? createRes.result?.invoice?.id ?? 0);
    if (!returnInvoiceId) {
      return { ok: false, message: "Phiếu trả không có ID" };
    }

    // 5. Confirm phiếu trả → BE hoàn stock + tạo cashbook chi
    const confRes = await ReturnInvoiceService.confirmReturn(returnInvoiceId);
    if (confRes?.code !== 0) {
      return {
        ok: false,
        returnInvoiceId,
        message: confRes?.message || "Xác nhận hủy đơn thất bại (phiếu trả đã tạo nhưng chưa duyệt)",
      };
    }

    return { ok: true, returnInvoiceId, refundAmount: totalRefund };
  } catch (e) {
    return { ok: false, message: (e as Error)?.message || "Lỗi kết nối khi hủy đơn" };
  }
}
