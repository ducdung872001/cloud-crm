import { urlsApi } from "configs/urls";

// ── URL constants (thêm vào configs/urls.ts → urlsApi.stockInitImport) ────────
// stockInitImport: {
//   template: prefixInventory + "/stock-init/import/template",
//   upload:   prefixInventory + "/stock-init/import/upload",
//   confirm:  prefixInventory + "/stock-init/import/confirm",
//   cancel:   prefixInventory + "/stock-init/import/cancel",
// }

export interface IStockInitUploadResponse {
  sessionId: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  errorFileBytes?: string; // base64
}

export interface IStockInitConfirmResponse {
  invoiceId: number;
  invoiceCode: string;
  importedRows: number;
  skippedRows: number;
}

const BASE = (urlsApi as any).stockInitImport ?? {
  template: "/biz/inventory/stock-init/import/template",
  upload:   "/biz/inventory/stock-init/import/upload",
  confirm:  "/biz/inventory/stock-init/import/confirm",
  cancel:   "/biz/inventory/stock-init/import/cancel",
};

const StockInitImportService = {
  /** Tải file XLSX mẫu */
  downloadTemplate(): void {
    window.open(BASE.template, "_blank");
  },

  /** Upload file Excel, nhận kết quả validate */
  async uploadFile(file: File): Promise<{ code: number; message?: string; result?: IStockInitUploadResponse }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(BASE.upload, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    return res.json();
  },

  /** Xác nhận tạo phiếu IV5 từ sessionId + inventoryId */
  async confirm(
    sessionId: string,
    inventoryId: number,
  ): Promise<{ code: number; message?: string; result?: IStockInitConfirmResponse }> {
    const params = new URLSearchParams({ sessionId, inventoryId: String(inventoryId) });
    const res = await fetch(`${BASE.confirm}?${params}`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  },

  /** Huỷ session */
  async cancel(sessionId: string): Promise<void> {
    await fetch(`${BASE.cancel}?sessionId=${sessionId}`, {
      method: "POST",
      credentials: "include",
    });
  },
};

export default StockInitImportService;