import React, { useState, useEffect, useRef } from "react";
import { Portal } from "react-overlays";
import Icon from "components/icon";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import StockInitImportService, { IStockInitUploadResponse } from "services/StockInitImportService";
import InventoryService from "services/InventoryService";
import "./ModalStockInitImport.scss";

interface IWarehouse {
  id: number;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoiceCode: string) => void;
}

type Step = "upload" | "preview" | "done";

export default function ModalStockInitImport({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const [uploadResult, setUploadResult] = useState<IStockInitUploadResponse | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [inventoryId, setInventoryId] = useState<number>(0);
  const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);
  const [doneResult, setDoneResult] = useState<{ invoiceCode: string; importedRows: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<string>("");

  useEffect(() => {
    if (isOpen) {
      resetState();
      loadWarehouses();
    }
    return () => {
      // Cleanup session khi đóng modal không confirm
      if (sessionRef.current && step !== "done") {
        StockInitImportService.cancel(sessionRef.current).catch(() => {});
      }
    };
  }, [isOpen]);

  const resetState = () => {
    setStep("upload");
    setFile(null);
    setUploadResult(null);
    setSessionId("");
    setInventoryId(0);
    setDoneResult(null);
    sessionRef.current = "";
  };

  const loadWarehouses = async () => {
    try {
      const res = await InventoryService.list({});
      if (res.code === 0 || res.status === 1) {
        const items = res.result?.items ?? res.result?.data ?? res.data ?? [];
        setWarehouses(items);
        if (items.length === 1) setInventoryId(items[0].id);
      }
    } catch {}
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && isExcelFile(dropped)) setFile(dropped);
    else showToast("Chỉ chấp nhận file Excel (.xlsx, .xls)", "error");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && isExcelFile(f)) setFile(f);
    else if (f) showToast("Chỉ chấp nhận file Excel (.xlsx, .xls)", "error");
  };

  const isExcelFile = (f: File) =>
    f.name.endsWith(".xlsx") || f.name.endsWith(".xls");

  // ── Step 1: Upload ─────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await StockInitImportService.uploadFile(file);
      if (res.code === 0 || res.status === 1) {
        const result = res.result!;
        setUploadResult(result);
        setSessionId(result.sessionId);
        sessionRef.current = result.sessionId;
        setStep("preview");
      } else {
        showToast(res.message ?? "Upload thất bại", "error");
      }
    } catch {
      showToast("Có lỗi khi upload file", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Step 2: Confirm ────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!sessionId || inventoryId <= 0) {
      showToast("Vui lòng chọn kho nhận hàng", "error");
      return;
    }
    setIsConfirming(true);
    try {
      const res = await StockInitImportService.confirm(sessionId, inventoryId);
      if (res.code === 0 || res.status === 1) {
        const result = res.result!;
        setDoneResult({ invoiceCode: result.invoiceCode, importedRows: result.importedRows });
        sessionRef.current = ""; // đã consumed
        setStep("done");
      } else {
        showToast(res.message ?? "Tạo phiếu thất bại", "error");
      }
    } catch {
      showToast("Có lỗi khi xác nhận import", "error");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDownloadErrors = () => {
    if (!uploadResult?.errorFileBytes) return;
    const byteStr = atob(uploadResult.errorFileBytes as unknown as string);
    const arr = new Uint8Array(byteStr.length);
    for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
    const blob = new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loi-import-ton-kho.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (step !== "done" && sessionRef.current) {
      StockInitImportService.cancel(sessionRef.current).catch(() => {});
      sessionRef.current = "";
    }
    onClose();
  };

  const handleDone = () => {
    if (doneResult) onSuccess(doneResult.invoiceCode);
    onClose();
  };

  const body = (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-stock-init" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-stock-init__header">
          <div className="modal-stock-init__header-left">
            <Icon name="Upload" style={{ width: 20 }} />
            <span>Import tồn kho ban đầu</span>
          </div>
          <button className="modal-stock-init__close" onClick={handleClose}>
            <Icon name="X" style={{ width: 18 }} />
          </button>
        </div>

        {/* Stepper */}
        <div className="modal-stock-init__stepper">
          {[
            { key: "upload",  label: "1. Tải file lên" },
            { key: "preview", label: "2. Xem trước" },
            { key: "done",    label: "3. Hoàn tất" },
          ].map(({ key, label }) => (
            <div key={key} className={`stepper__item ${step === key ? "active" : ""} ${isStepDone(key as Step) ? "done" : ""}`}>
              <div className="stepper__dot" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="modal-stock-init__body">

          {/* ── Step 1: Upload ─────────────────────────────────────────── */}
          {step === "upload" && (
            <div className="step-upload">
              <p className="step-upload__hint">
                Tải xuống file mẫu, điền SKU + số lượng tồn, sau đó upload lên hệ thống.
              </p>

              <button
                className="btn-download-template"
                onClick={StockInitImportService.downloadTemplate}
              >
                <Icon name="Download" style={{ width: 16 }} />
                Tải file mẫu (.xlsx)
              </button>

              {/* Drop zone */}
              <div
                className={`drop-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="drop-zone__file">
                    <Icon name="FileText" style={{ width: 28, color: "var(--primary-color)" }} />
                    <span className="drop-zone__filename">{file.name}</span>
                    <span className="drop-zone__size">{(file.size / 1024).toFixed(1)} KB</span>
                    <button
                      className="drop-zone__remove"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    >
                      <Icon name="X" style={{ width: 14 }} />
                    </button>
                  </div>
                ) : (
                  <div className="drop-zone__empty">
                    <Icon name="Upload" style={{ width: 32, opacity: 0.4 }} />
                    <span>Kéo thả file vào đây hoặc <strong>chọn file</strong></span>
                    <span className="drop-zone__sub">Hỗ trợ: .xlsx, .xls — Tối đa 3.000 dòng</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Preview ────────────────────────────────────────── */}
          {step === "preview" && uploadResult && (
            <div className="step-preview">
              {/* Summary cards */}
              <div className="preview__cards">
                <div className="preview__card preview__card--total">
                  <span className="preview__card-label">Tổng dòng</span>
                  <span className="preview__card-value">{uploadResult.totalRows.toLocaleString()}</span>
                </div>
                <div className="preview__card preview__card--valid">
                  <Icon name="CheckCircle" style={{ width: 16 }} />
                  <span className="preview__card-label">Hợp lệ</span>
                  <span className="preview__card-value">{uploadResult.validRows.toLocaleString()}</span>
                </div>
                <div className={`preview__card ${uploadResult.errorRows > 0 ? "preview__card--error" : "preview__card--valid"}`}>
                  <Icon name="AlertCircle" style={{ width: 16 }} />
                  <span className="preview__card-label">Lỗi</span>
                  <span className="preview__card-value">{uploadResult.errorRows.toLocaleString()}</span>
                </div>
              </div>

              {/* Error download */}
              {uploadResult.errorRows > 0 && (
                <div className="preview__error-banner">
                  <Icon name="AlertTriangle" style={{ width: 16 }} />
                  <span>{uploadResult.errorRows} dòng có lỗi sẽ bị bỏ qua.</span>
                  <button className="btn-link" onClick={handleDownloadErrors}>
                    Tải file lỗi về xem chi tiết
                  </button>
                </div>
              )}

              {uploadResult.validRows === 0 && (
                <div className="preview__no-valid">
                  <Icon name="XCircle" style={{ width: 32, opacity: 0.5 }} />
                  <span>Không có dòng hợp lệ nào để import.</span>
                  <button className="btn-link" onClick={() => setStep("upload")}>
                    Quay lại upload file khác
                  </button>
                </div>
              )}

              {/* Warehouse picker */}
              {uploadResult.validRows > 0 && (
                <div className="preview__warehouse">
                  <label className="preview__warehouse-label">
                    Kho nhận hàng <span className="required">*</span>
                  </label>
                  <select
                    className="preview__warehouse-select"
                    value={inventoryId}
                    onChange={(e) => setInventoryId(+e.target.value)}
                  >
                    <option value={0}>-- Chọn kho --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Info note */}
              {uploadResult.validRows > 0 && (
                <div className="preview__note">
                  <Icon name="Info" style={{ width: 14 }} />
                  <span>
                    Hệ thống sẽ tạo <strong>1 phiếu nhập tồn (IV5)</strong> chứa{" "}
                    <strong>{uploadResult.validRows} biến thể</strong> và duyệt tự động.
                    Tồn kho sẽ được cập nhật ngay sau khi xác nhận.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Done ───────────────────────────────────────────── */}
          {step === "done" && doneResult && (
            <div className="step-done">
              <div className="step-done__icon">
                <Icon name="CheckCircle" style={{ width: 56, color: "var(--success-color, #00b69b)" }} />
              </div>
              <h3>Import tồn kho thành công!</h3>
              <p>
                Đã nhập <strong>{doneResult.importedRows.toLocaleString()} biến thể</strong> vào kho.
              </p>
              <div className="step-done__invoice">
                <span>Mã phiếu nhập tồn:</span>
                <strong>{doneResult.invoiceCode}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-stock-init__footer">
          {step === "upload" && (
            <>
              <button className="btn-cancel" onClick={handleClose}>Hủy</button>
              <button
                className="btn-primary"
                disabled={!file || isUploading}
                onClick={handleUpload}
              >
                {isUploading ? (
                  <><span className="spinner" /> Đang kiểm tra...</>
                ) : (
                  <>Tiếp theo <Icon name="ChevronRight" style={{ width: 16 }} /></>
                )}
              </button>
            </>
          )}

          {step === "preview" && (
            <>
              <button className="btn-cancel" onClick={() => setStep("upload")}>
                <Icon name="ChevronLeft" style={{ width: 16 }} /> Quay lại
              </button>
              {uploadResult?.validRows > 0 && (
                <button
                  className="btn-primary"
                  disabled={isConfirming || inventoryId <= 0}
                  onClick={handleConfirm}
                >
                  {isConfirming ? (
                    <><span className="spinner" /> Đang tạo phiếu...</>
                  ) : (
                    <>
                      <Icon name="Check" style={{ width: 16 }} />
                      Xác nhận nhập {uploadResult.validRows.toLocaleString()} dòng
                    </>
                  )}
                </button>
              )}
            </>
          )}

          {step === "done" && (
            <button className="btn-primary" onClick={handleDone}>
              <Icon name="Check" style={{ width: 16 }} />
              Hoàn tất
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Portal container={document.getElementsByTagName("body")[0]}>
      {body}
    </Portal>
  );

  function isStepDone(s: Step): boolean {
    const order: Step[] = ["upload", "preview", "done"];
    return order.indexOf(s) < order.indexOf(step);
  }
}