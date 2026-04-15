// eTax gateway — stub liên thông với Cổng thuế điện tử TCT.
// MVP chỉ mô phỏng; khi tích hợp thật chỉ cần thay implementation bên dưới,
// signature giữ nguyên để UI không phải sửa.

import type { TaxDeclaration } from "../domain/types";
import { ETAX_ENDPOINTS } from "../domain/constants";

export interface SignRequest {
  declaration: TaxDeclaration;
  signerCertificateSerial?: string;
  method: "usb_token" | "remote_signing" | "mock";
}

export interface SignResult {
  ok: boolean;
  signedAt: string;
  signatureBase64?: string;
  errorMessage?: string;
}

export interface SubmitResult {
  ok: boolean;
  submittedAt: string;
  receiptCode?: string; // mã tra cứu của TCT
  trackingUrl?: string;
  errorMessage?: string;
}

export const eTaxGateway = {
  /**
   * Ký số tờ khai.
   * MVP: mô phỏng ký bằng cách encode XML payload, không gọi HSM thật.
   * Khi tích hợp thật: thay bằng gọi ViettelCA/VNPT-CA/FPT-CA SDK.
   */
  async sign(req: SignRequest): Promise<SignResult> {
    const { declaration } = req;
    if (!declaration.xmlPayload) {
      return {
        ok: false,
        signedAt: new Date().toISOString(),
        errorMessage: "Tờ khai chưa có XML payload",
      };
    }
    // Mock: tạo chữ ký giả dựa trên hash ngắn của payload
    const signatureBase64 = btoa(
      `SIG|${req.method}|${req.signerCertificateSerial ?? "MOCK-CERT"}|${declaration.id}`
    );
    await delay(600);
    return {
      ok: true,
      signedAt: new Date().toISOString(),
      signatureBase64,
    };
  },

  /**
   * Nộp tờ khai đã ký lên Cổng TCT.
   * MVP: mô phỏng nhận về mã tra cứu. Khi tích hợp thật dùng SOAP tới eTax Gateway.
   */
  async submit(params: {
    declaration: TaxDeclaration;
    environment?: "production" | "test";
  }): Promise<SubmitResult> {
    const endpoint =
      params.environment === "production"
        ? ETAX_ENDPOINTS.mobileGateway
        : ETAX_ENDPOINTS.testGateway;
    // Ở đây thật sự sẽ POST XML SOAP tới endpoint
    // fetch(endpoint, { method: 'POST', headers: {...}, body: xmlSoapEnvelope })
    void endpoint;
    await delay(900);
    const receiptCode = `MOCK-${params.declaration.id}-${Date.now()
      .toString()
      .slice(-6)}`;
    return {
      ok: true,
      submittedAt: new Date().toISOString(),
      receiptCode,
      trackingUrl: `https://thuedientu.gdt.gov.vn/lookup?code=${receiptCode}`,
    };
  },

  /** Kiểm tra trạng thái sau khi nộp — polling biên lai của TCT */
  async checkStatus(receiptCode: string): Promise<{
    status: "pending" | "accepted" | "rejected";
    note?: string;
  }> {
    void receiptCode;
    await delay(400);
    return { status: "accepted", note: "Mock — đã ghi nhận" };
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
