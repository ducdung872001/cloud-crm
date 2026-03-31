import React, { useState, useCallback } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import ExcelIcon from "assets/images/img-excel.png";
import "./ModalImportMaterial.scss";

// ── API calls (inline — không cần service riêng) ───────────────
const BASE_URL = "/bizapi/inventory/material/import";

const materialImportApi = {
  downloadTemplate: () => fetch(`${BASE_URL}/template`, { method: "GET" }),

  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${BASE_URL}/uploadFile`, { method: "POST", body: form }).then((r) => r.json());
  },

  downloadErrorFile: (sessionId: string) =>
    fetch(`${BASE_URL}/error-file?sessionId=${encodeURIComponent(sessionId)}`, { method: "GET" }),

  confirm: (importSessionId: string) =>
    fetch(`${BASE_URL}/confirm`, {
      method: "POST",
      body: JSON.stringify({ importSessionId }),
    }).then((r) => r.json()),

  cancel: (sessionId: string) =>
    fetch(`${BASE_URL}/cancel?sessionId=${encodeURIComponent(sessionId)}`, {
      method: "POST",
    }).then((r) => r.json()),
};

// ── Types ──────────────────────────────────────────────────────
type Step = "upload" | "validating" | "result" | "confirm" | "done";

interface ValidateResult {
  importSessionId: string;
  totalRows:        number;
  validRows:        number;
  invalidRows:      number;
  hasErrors:        boolean;
  errorDownloadToken: string | null;
}

interface ConfirmResult {
  insertedRows: number;
  skippedRows:  number;
  errors:       string[];
}

interface Props {
  onShow:  boolean;
  onHide:  (isSuccess: boolean) => void;
}

// ── Component ──────────────────────────────────────────────────
export default function ModalImportMaterial({ onShow, onHide }: Props) {
  const [step, setStep]                       = useState<Step>("upload");
  const [selectedFile, setSelectedFile]       = useState<File | null>(null);
  const [isDragging, setIsDragging]           = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isDownloadingError, setIsDownloadingError]       = useState(false);
  const [validateResult, setValidateResult]   = useState<ValidateResult | null>(null);
  const [confirmResult, setConfirmResult]     = useState<ConfirmResult | null>(null);

  // ── Reset ──────────────────────────────────────────────────────
  const resetState = () => {
    setStep("upload");
    setSelectedFile(null);
    setValidateResult(null);
    setConfirmResult(null);
    setIsDragging(false);
  };

  const handleClose = () => {
    if (validateResult?.importSessionId && step === "result") {
      materialImportApi.cancel(validateResult.importSessionId).catch(() => {});
    }
    resetState();
    onHide(step === "done");
  };

  // ── Tải file mẫu ────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const res = await materialImportApi.downloadTemplate();
      if (!res.ok) { showToast("Không thể tải file mẫu", "error"); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "mau-import-nguyen-vat-lieu.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Lỗi kết nối khi tải file mẫu", "error");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // ── Chọn file ─────────────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      showToast("Chỉ chấp nhận file Excel (.xlsx, .xls)", "error");
      return;
    }
    setSelectedFile(file);
    setValidateResult(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

  const handleDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  // ── Upload & Validate ──────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile) return;
    setStep("validating");
    try {
      const res = await materialImportApi.upload(selectedFile);
      if (res.code !== 0) {
        showToast(res.message ?? "Lỗi khi xử lý file", "error");
        setStep("upload");
        return;
      }
      setValidateResult(res.result);
      setStep("result");
    } catch {
      showToast("Lỗi kết nối khi upload file", "error");
      setStep("upload");
    }
  };

  // ── Tải file lỗi ──────────────────────────────────────────────
  const handleDownloadErrorFile = async () => {
    if (!validateResult?.errorDownloadToken) return;
    setIsDownloadingError(true);
    try {
      const res = await materialImportApi.downloadErrorFile(validateResult.errorDownloadToken);
      if (!res.ok) { showToast("Không thể tải file lỗi", "error"); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "loi-import-nguyen-vat-lieu.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Lỗi kết nối khi tải file lỗi", "error");
    } finally {
      setIsDownloadingError(false);
    }
  };

  // ── Confirm ────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!validateResult?.importSessionId) return;
    setStep("confirm");
    try {
      const res = await materialImportApi.confirm(validateResult.importSessionId);
      if (res.code !== 0) {
        showToast(res.message ?? "Lỗi khi import", "error");
        setStep("result");
        return;
      }
      setConfirmResult(res.result);
      setStep("done");
    } catch {
      showToast("Lỗi kết nối khi import", "error");
      setStep("result");
    }
  };

  // ── Footer buttons ─────────────────────────────────────────────
  const footerActions = {
    actions_right: {
      buttons: [
        (step !== "done" && step !== "validating" && step !== "confirm")
          ? {
              title:    step === "result" ? "← Chọn file khác" : "Đóng",
              color:    "primary",
              variant:  "outline",
              callback: () => {
                if (step === "result") {
                  if (validateResult?.importSessionId)
                    materialImportApi.cancel(validateResult.importSessionId).catch(() => {});
                  setValidateResult(null);
                  setSelectedFile(null);
                  setStep("upload");
                } else {
                  handleClose();
                }
              },
            }
          : null,
        step === "upload"
          ? { title: "Kiểm tra dữ liệu →", color: "primary", disabled: !selectedFile, callback: handleUpload }
          : null,
        step === "result"
          ? {
              title:    `Xác nhận import ${validateResult?.validRows ?? 0} nguyên vật liệu`,
              color:    "primary",
              disabled: (validateResult?.validRows ?? 0) === 0,
              callback: handleConfirm,
            }
          : null,
        step === "done"
          ? { title: "Hoàn tất", color: "primary", callback: handleClose }
          : null,
      ].filter(Boolean),
    },
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={onShow}
      isCentered
      staticBackdrop
      toggle={step === "validating" || step === "confirm" ? undefined : handleClose}
      size={step === "result" ? "lg" : "md"}
    >
      <ModalHeader
        title="Import nguyên vật liệu"
        toggle={step === "validating" || step === "confirm" ? undefined : handleClose}
      />

      <ModalBody>

        {/* ──────────────────────────────
            STEP: Upload
        ────────────────────────────── */}
        {step === "upload" && (
          <div className="pimport-step">

            {/* Bước 1 — tải file mẫu */}
            <div className="pimport-guide">
              <div className="pimport-guide__left">
                <div className="pimport-guide__step-badge">Bước 1</div>
                <div className="pimport-guide__content">
                  <div className="pimport-guide__title">Tải file mẫu về điền dữ liệu</div>
                  <div className="pimport-guide__sub">
                    File Excel mẫu có sẵn cột hướng dẫn. Cột có dấu <strong>(*)</strong> là bắt buộc.
                    <br />
                    <span style={{ color: "#4b6a8a", fontSize: "1.1rem" }}>
                      Cột bắt buộc: <strong>Tên nguyên vật liệu</strong>, <strong>Đơn vị tính</strong>
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="pimport-btn pimport-btn--outline"
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
              >
                {isDownloadingTemplate ? (
                  <span className="pimport-spinner" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                Tải file mẫu (.xlsx)
              </button>
            </div>

            {/* Divider */}
            <div className="pimport-divider">
              <span>Bước 2 — Chọn file đã điền và upload</span>
            </div>

            {/* Drop zone */}
            <div
              className={`pimport-dropzone${isDragging ? " pimport-dropzone--active" : ""}${selectedFile ? " pimport-dropzone--has-file" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="pimport-dropzone__file">
                  <img src={ExcelIcon} alt="excel" className="pimport-dropzone__icon" />
                  <div className="pimport-dropzone__info">
                    <div className="pimport-dropzone__name">{selectedFile.name}</div>
                    <div className="pimport-dropzone__size">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    className="pimport-btn pimport-btn--ghost pimport-btn--sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Đổi file
                  </button>
                </div>
              ) : (
                <div className="pimport-dropzone__empty">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af"
                    strokeWidth="1.5" strokeLinecap="round">
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
                  </svg>
                  <div className="pimport-dropzone__title">Kéo & thả file vào đây</div>
                  <div className="pimport-dropzone__or">hoặc</div>
                  <label className="pimport-btn pimport-btn--primary pimport-btn--sm">
                    Chọn file Excel
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      style={{ display: "none" }}
                      onChange={handleInputChange}
                    />
                  </label>
                  <div className="pimport-dropzone__hint">Chấp nhận .xlsx, .xls · Tối đa 10MB</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────────────────────────────
            STEP: Đang xử lý
        ────────────────────────────── */}
        {(step === "validating" || step === "confirm") && (
          <div className="pimport-loading">
            <div className="pimport-loading__spinner" />
            <div className="pimport-loading__text">
              {step === "validating" ? "Đang kiểm tra dữ liệu..." : "Đang import nguyên vật liệu..."}
            </div>
            <div className="pimport-loading__sub">Vui lòng không đóng cửa sổ này</div>
          </div>
        )}

        {/* ──────────────────────────────
            STEP: Kết quả validate
        ────────────────────────────── */}
        {step === "result" && validateResult && (
          <div className="pimport-result">

            {/* Summary cards */}
            <div className="pimport-summary">
              <div className="pimport-summary__card">
                <div className="pimport-summary__num">{validateResult.totalRows}</div>
                <div className="pimport-summary__label">Tổng dòng</div>
              </div>
              <div className="pimport-summary__card pimport-summary__card--ok">
                <div className="pimport-summary__num">{validateResult.validRows}</div>
                <div className="pimport-summary__label">Hợp lệ ✓</div>
              </div>
              <div className={`pimport-summary__card${validateResult.invalidRows > 0 ? " pimport-summary__card--err" : ""}`}>
                <div className="pimport-summary__num">{validateResult.invalidRows}</div>
                <div className="pimport-summary__label">Lỗi ✗</div>
              </div>
            </div>

            {/* Tất cả OK */}
            {validateResult.invalidRows === 0 && (
              <div className="pimport-banner pimport-banner--ok">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a"
                  strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Tất cả <strong>{validateResult.validRows} nguyên vật liệu</strong> hợp lệ — sẵn sàng import!
              </div>
            )}

            {/* Có lỗi */}
            {validateResult.invalidRows > 0 && (
              <div className="pimport-banner pimport-banner--err">
                <div className="pimport-banner__row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626"
                    strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>
                    <strong>{validateResult.invalidRows} dòng có lỗi</strong> — tải file lỗi về để xem chi tiết và sửa lại
                  </span>
                  <button
                    className="pimport-btn pimport-btn--outline pimport-btn--sm"
                    onClick={handleDownloadErrorFile}
                    disabled={isDownloadingError}
                  >
                    {isDownloadingError ? (
                      <span className="pimport-spinner pimport-spinner--sm" />
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.2" strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    )}
                    Tải file lỗi
                  </button>
                </div>
              </div>
            )}

            {/* Vừa có hợp lệ vừa có lỗi */}
            {validateResult.validRows > 0 && validateResult.invalidRows > 0 && (
              <div className="pimport-banner pimport-banner--warn">
                ⚠️ Sẽ import <strong>{validateResult.validRows} nguyên vật liệu hợp lệ</strong>.{" "}
                {validateResult.invalidRows} dòng lỗi sẽ bị bỏ qua.
              </div>
            )}

            {/* Không có dòng hợp lệ */}
            {validateResult.validRows === 0 && (
              <div className="pimport-banner pimport-banner--block">
                ❌ Không có dòng nào hợp lệ để import. Vui lòng sửa file theo hướng dẫn và thử lại.
              </div>
            )}
          </div>
        )}

        {/* ──────────────────────────────
            STEP: Done
        ────────────────────────────── */}
        {step === "done" && confirmResult && (
          <div className="pimport-done">
            <div className="pimport-done__icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#16a34a"
                strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div className="pimport-done__title">Import thành công!</div>
            <div className="pimport-done__stats">
              <div className="pimport-done__stat pimport-done__stat--ok">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {confirmResult.insertedRows} nguyên vật liệu đã được thêm
              </div>
              {(confirmResult.skippedRows ?? 0) > 0 && (
                <div className="pimport-done__stat pimport-done__stat--skip">
                  ⊘ {confirmResult.skippedRows} dòng bỏ qua
                </div>
              )}
            </div>
            {confirmResult.errors?.length > 0 && (
              <div className="pimport-done__errors">
                {confirmResult.errors.slice(0, 5).map((e, i) => (
                  <div key={i} className="pimport-done__error-item">{e}</div>
                ))}
                {confirmResult.errors.length > 5 && (
                  <div className="pimport-done__error-more">
                    ...và {confirmResult.errors.length - 5} lỗi khác
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </ModalBody>

      <ModalFooter actions={footerActions as any} />
    </Modal>
  );
}
