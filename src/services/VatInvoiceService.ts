/**
 * VatInvoiceService
 * Tích hợp API hóa đơn VAT điện tử (Viettel S-Invoice qua cloud-integration)
 * và lấy dữ liệu hóa đơn bán hàng từ cloud-sales.
 */

const PREFIX_INTEGRATION = "/bizapi/integration/sinvoice";
const PREFIX_SALES       = "/bizapi/sales";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VatItemInfo {
  lineNumber:                    number;
  itemCode?:                     string;
  itemName:                      string;
  unitName:                      string;
  unitPrice:                     number;
  quantity:                      number;
  itemTotalAmountWithoutTax:     number;
  /** -2=không chịu thuế, -1=KKKNT, 0/5/8/10 = % */
  taxPercentage:                 number;
  taxAmount:                     number;
  itemTotalAmountWithTax:        number;
  itemTotalAmountAfterDiscount:  number;
  discount?:                     number;
  discount2?:                    number;
  itemDiscount?:                 number;
}

export interface VatTaxBreakdown {
  taxPercentage:  number;
  taxableAmount:  number;
  taxAmount:      number;
}

export interface VatInvoiceRequest {
  supplierTaxCode: string;
  generalInvoiceInfo: {
    invoiceType:          string;   // "1"
    templateCode:         string;   // vd "1/6553"
    invoiceSeries:        string;   // vd "C26TNA"
    currencyCode:         string;   // "VND"
    exchangeRate:         number;   // 1
    adjustmentType:       string;   // "1"
    paymentStatus:        boolean;
    cusGetInvoiceRight:   boolean;    
    reservationCode?:     string;
    certificateSerial?:   string;
    transactionUuid?:     string;
    invoiceIssuedDate?:   number; // Unix ms (VD: Date("28/02/2026").getTime())
  };
  sellerInfo?: {
    sellerLegalName:    string;
    sellerTaxCode:      string;
    sellerAddressLine:  string;
    sellerPhoneNumber?: string;
    sellerBankName?:    string;
    sellerBankAccount?: string;
  };
  buyerInfo: {
    buyerName:         string;
    buyerLegalName?:   string;
    buyerTaxCode?:     string;
    buyerAddressLine:  string;
    buyerEmail?:       string;
  };
  payments: { paymentMethod?: string; paymentMethodName: string }[];
  itemInfo:       VatItemInfo[];
  taxBreakdowns:  VatTaxBreakdown[];
  summarizeInfo: {
    totalAmountWithoutTax:     number;
    totalTaxAmount:            number;
    totalAmountWithTax:        number;
    totalAmountAfterDiscount:  number;
    discountAmount?:           number;
    totalAmountInWords:        string;
  };
  customFields?: Record<string, string>;
}

export interface VatAdjustmentRequest {
  supplierTaxCode: string;
  generalInvoiceInfo: {
    invoiceType:        string;
    templateCode:       string;
    invoiceSeries:      string;
    currencyCode:       string;
    exchangeRate:       number;
    adjustmentType:     "5";          // 5 = điều chỉnh
    paymentStatus:      boolean;
    cusGetInvoiceRight: boolean;
    invoiceIssuedDate?: number;
    originalInvoiceId?: string;       // số hóa đơn gốc
    originalInvoiceIssueDate?: string; // ngày phát hành HĐ gốc (dd/MM/yyyy)
    additionalReferenceDesc?: string; // lý do điều chỉnh
    additionalReferenceDate?: number; // ngày biên bản thỏa thuận
  };
  buyerInfo: {
    buyerName:         string;
    buyerLegalName?:   string;
    buyerTaxCode?:     string;
    buyerAddressLine:  string;
    buyerEmail?:       string;
  };
  payments:        { paymentMethodName: string }[];
  itemInfo:        VatItemInfo[];
  taxBreakdowns:   VatTaxBreakdown[];
  summarizeInfo: {
    totalAmountWithoutTax:    number;
    totalTaxAmount:           number;
    totalAmountWithTax:       number;
    totalAmountAfterDiscount: number;
    totalAmountInWords:       string;
  };
  customFields?: Record<string, string>;
}

export interface SendEmailRequest {
  supplierTaxCode:  string;
  transactionUuid:  string;
  buyerEmail:       string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

const VatInvoiceService = {

  /**
   * Lấy chi tiết hóa đơn bán hàng theo mã code (VD: HD-2026-0128)
   * để tự động điền danh sách hàng hóa vào form xuất HĐVAT.
   * Endpoint: GET /bizapi/sales/invoice/get-for-vat?code=...
   */
  getInvoiceByCode: (code: string): Promise<any> => {
    return fetch(`${PREFIX_SALES}/invoice/get-for-vat?code=${encodeURIComponent(code.trim())}`, {
      method: "GET",
    }).then(r => r.json());
  },

  /**
   * Xem trước hóa đơn nháp – trả về base64 PDF hoặc HTML preview.
   * POST /integration/sinvoice/query/preview-draft?supplierTaxCode=...
   */
  previewDraft: (supplierTaxCode: string, body: VatInvoiceRequest): Promise<any> => {
    return fetch(
      `${PREFIX_INTEGRATION}/query/preview-draft?supplierTaxCode=${encodeURIComponent(supplierTaxCode)}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      }
    ).then(r => r.json());
  },

  /**
   * Phát hành hóa đơn chính thức (CTS SERVER).
   * POST /integration/sinvoice/invoice/create
   * Response: { code: 0, result: { id, invoiceNo, transactionUuid, reservationCode, status } }
   */
  createInvoice: (body: VatInvoiceRequest): Promise<any> => {
    return fetch(`${PREFIX_INTEGRATION}/invoice/create`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    }).then(r => r.json());
  },

  /**
   * Gửi email hóa đơn cho khách hàng (cho phép truyền email).
   * POST /integration/sinvoice/ext/send-email-customer
   * Dùng sau khi createInvoice thành công và có transactionUuid.
   */
  sendEmailToCustomer: (body: SendEmailRequest): Promise<any> => {
    return fetch(`${PREFIX_INTEGRATION}/ext/send-email-customer`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    }).then(r => r.json());
  },

  /**
   * Phát hành hóa đơn điều chỉnh.
   * POST /integration/sinvoice/invoice/adjust
   * adjustmentType = "5" → điều chỉnh tăng/giảm.
   */
  adjustInvoice: (body: VatAdjustmentRequest): Promise<any> => {
    return fetch(`${PREFIX_INTEGRATION}/invoice/adjust`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    }).then(r => r.json());
  },

  /**
   * Lấy danh sách mẫu + ký hiệu hóa đơn của doanh nghiệp.
   * POST /integration/sinvoice/ext/all-templates
   */
  getAllTemplates: (taxCode: string): Promise<any> => {
    return fetch(`${PREFIX_INTEGRATION}/ext/all-templates`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ taxCode, invoiceType: "all" }),
    }).then(r => r.json());
  },

  /**
   * Lấy cấu hình VAT đã lưu.
   * GET /integration/sinvoice/config/get
   */
  getConfig: (): Promise<any> => {
    return fetch(`${PREFIX_INTEGRATION}/config/get`, { method: "GET" })
      .then(r => r.json());
  },

  /**
   * Lưu cấu hình VAT.
   * POST /integration/sinvoice/config/save
   */
  saveConfig: (body: VatConfig): Promise<any> => {
    return fetch(`${PREFIX_INTEGRATION}/config/save`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    }).then(r => r.json());
  },
};

export interface VatConfig {
  companyName: string;
  taxCode: string;
  phone: string;
  address: string;
  email: string;
  website: string;
  bankAccount: string;
  bankName: string;
  defaultTemplateCode: string;
  defaultInvoiceSeries: string;
  defaultTaxRate: number;
  currencyCode: string;
  autoIssueOnComplete: boolean;
  autoSendEmail: boolean;
  remindPendingSign: boolean;
  allowDeferredIssue: boolean;
}

export default VatInvoiceService;
