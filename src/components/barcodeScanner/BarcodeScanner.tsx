/**
 * BarcodeScanner — modal quét mã vạch dùng camera, dùng chung toàn app.
 *
 * Strategy: ZXing UMD load qua CDN (không cần npm dep).
 * Hỗ trợ EAN-13, EAN-8, UPC-A, UPC-E, Code-39, Code-128, QR, Data Matrix, ...
 *
 * Cách dùng:
 *   const [open, setOpen] = useState(false);
 *   ...
 *   {open && <BarcodeScanner onScan={(code) => { setOpen(false); handleCode(code); }} onClose={() => setOpen(false)} />}
 *
 * Component đã có sẵn full UI (overlay + modal + reticle + scan-line + error states),
 * caller chỉ cần điều khiển open/close + handle kết quả.
 */

import React, { useEffect, useRef, useState } from "react";
import "./BarcodeScanner.scss";

const ZXING_CDN = "https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/index.min.js";

function loadZXingScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as Record<string, unknown>).ZXingBrowser) { resolve(); return; }
    const existing = document.querySelector(`script[src="${ZXING_CDN}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = ZXING_CDN;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Không tải được thư viện quét mã vạch. Vui lòng kiểm tra kết nối mạng."));
    document.head.appendChild(script);
  });
}

interface BarcodeScannerProps {
  /** Callback khi quét được mã. Component không tự đóng — caller tự gọi onClose. */
  onScan: (barcode: string) => void;
  /** Đóng modal (X / click overlay). */
  onClose: () => void;
  /** Tiêu đề tuỳ biến (mặc định: "Quét mã vạch") */
  title?: string;
}

export default function BarcodeScanner({ onScan, onClose, title = "Quét mã vạch" }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<Record<string, unknown>>(null);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        setStatus("loading");
        await loadZXingScript();
        if (cancelled) return;

        const ZXing = (window as Record<string, unknown>).ZXingBrowser;
        if (!ZXing?.BrowserMultiFormatReader) {
          throw new Error("Thư viện ZXing chưa sẵn sàng, vui lòng thử lại.");
        }

        const reader = new ZXing.BrowserMultiFormatReader();
        readerRef.current = reader;
        if (cancelled) return;

        setStatus("ready");
        await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result: Record<string, unknown>) => {
            if (cancelled || !result) return;
            reader.reset();
            onScan(result.getText());
          }
        );
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err?.message || String(err);
        if (msg.includes("NotAllowed") || msg.includes("Permission")) {
          setError("Bạn chưa cấp quyền camera. Vui lòng cho phép trong cài đặt trình duyệt rồi thử lại.");
        } else if (msg.includes("NotFound") || msg.includes("No camera")) {
          setError("Không tìm thấy camera. Vui lòng kết nối camera và thử lại.");
        } else {
          setError(msg);
        }
        setStatus("error");
      }
    };

    start();
    return () => {
      cancelled = true;
      try { readerRef.current?.reset(); } catch (_) {}
    };
  }, []);

  return (
    <div className="bs-overlay" onClick={onClose}>
      <div className="bs-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bs-modal__header">
          <span className="bs-modal__title">{title}</span>
          <button type="button" className="bs-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="bs-modal__body">
          {status === "error" ? (
            <div className="bs-modal__error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>{error}</p>
            </div>
          ) : (
            <div className="bs-modal__video-wrap">
              <video ref={videoRef} className="bs-modal__video" playsInline muted />
              <div className="bs-modal__reticle">
                <span className="bs-modal__reticle-corner bs-modal__reticle-corner--tl" />
                <span className="bs-modal__reticle-corner bs-modal__reticle-corner--tr" />
                <span className="bs-modal__reticle-corner bs-modal__reticle-corner--bl" />
                <span className="bs-modal__reticle-corner bs-modal__reticle-corner--br" />
                <div className="bs-modal__scan-line" />
              </div>
              <p className="bs-modal__hint">
                {status === "loading" ? "Đang tải thư viện quét..." : "Đưa mã vạch vào khung để quét tự động"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
