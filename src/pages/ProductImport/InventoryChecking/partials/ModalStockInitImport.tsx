import React, { useState, useEffect, useRef } from "react";
import { Portal } from "react-overlays";
import Icon from "components/icon";
import { showToast } from "utils/common";
import InventoryService from "services/InventoryService";
import "./ModalStockInitImport.scss";

const API_BASE = "/bizapi/inventory/stock-init/import";

interface IWarehouse { id: number; name: string; }
interface IUploadResult {
  sessionId: string; totalRows: number; validRows: number;
  errorRows: number; errorFileBytes?: number[];
}
interface IConfirmResult {
  invoiceId: number; invoiceCode: string; importedRows: number; skippedRows: number;
}
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoiceCode: string) => void;
}
type Step = "upload" | "preview" | "done";
const STEP_ORDER: Step[] = ["upload", "preview", "done"];
const STEPS = [
  { key: "upload"  as Step, num: "1", label: "Tải file lên" },
  { key: "preview" as Step, num: "2", label: "Xem trước" },
  { key: "done"    as Step, num: "3", label: "Hoàn tất" },
];

export default function ModalStockInitImport({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep]                 = useState<Step>("upload");
  const [file, setFile]                 = useState<File | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const [isUploading, setIsUploading]   = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [uploadResult, setUploadResult] = useState<IUploadResult | null>(null);
  const [inventoryId, setInventoryId]   = useState(0);
  const [warehouses, setWarehouses]     = useState<IWarehouse[]>([]);
  const [doneResult, setDoneResult]     = useState<{ invoiceCode: string; importedRows: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionRef   = useRef<string>("");

  const isStepDone = (s: Step) =>
    STEP_ORDER.indexOf(s) < STEP_ORDER.indexOf(step);

  useEffect(() => {
    if (!isOpen) return;
    setStep("upload"); setFile(null); setUploadResult(null);
    setInventoryId(0); setDoneResult(null); sessionRef.current = "";
    InventoryService.list({}).then((res: any) => {
      const items = res?.result?.items ?? res?.result?.data ?? res?.data ?? [];
      setWarehouses(items);
      if (items.length === 1) setInventoryId(items[0].id);
    }).catch(() => {});
  }, [isOpen]);

  const isExcelFile = (f: File) => f.name.endsWith(".xlsx") || f.name.endsWith(".xls");

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      const result: IUploadResult = data?.result ?? data?.data;
      if ((data?.code === 0 || data?.status === 1) && result) {
        setUploadResult(result); sessionRef.current = result.sessionId; setStep("preview");
      } else { showToast(data?.message ?? "Upload thất bại", "error"); }
    } catch { showToast("Có lỗi khi upload file", "error"); }
    finally { setIsUploading(false); }
  };

  const handleConfirm = async () => {
    if (!sessionRef.current || inventoryId <= 0) {
      showToast("Vui lòng chọn kho nhận hàng", "error"); return;
    }
    setIsConfirming(true);
    try {
      const params = new URLSearchParams({ sessionId: sessionRef.current, inventoryId: String(inventoryId) });
      const res = await fetch(`${API_BASE}/confirm?${params}`, { method: "POST", credentials: "include" });
      const data = await res.json();
      const result: IConfirmResult = data?.result ?? data?.data;
      if ((data?.code === 0 || data?.status === 1) && result) {
        setDoneResult({ invoiceCode: result.invoiceCode, importedRows: result.importedRows });
        sessionRef.current = ""; setStep("done");
      } else { showToast(data?.message ?? "Tạo phiếu thất bại", "error"); }
    } catch { showToast("Có lỗi khi xác nhận import", "error"); }
    finally { setIsConfirming(false); }
  };

  const handleClose = () => {
    if (step !== "done" && sessionRef.current) {
      fetch(`${API_BASE}/cancel?sessionId=${sessionRef.current}`, { method: "POST", credentials: "include" }).catch(() => {});
      sessionRef.current = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal container={document.getElementsByTagName("body")[0]}>
      <div className="modal-stock-init-overlay" onClick={handleClose}>
        <div className="modal-stock-init" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="modal-stock-init__header">
            <div className="modal-stock-init__header-left">
              <div className="header-icon">
                <Icon name="Upload" style={{ width: 20 }} />
              </div>
              <div className="header-text">
                <h2>Import tồn kho ban đầu</h2>
                <p>Nhập tồn kho hàng loạt từ file Excel</p>
              </div>
            </div>
            <button className="modal-stock-init__close" onClick={handleClose} title="Đóng">
              <Icon name="X" style={{ width: 16 }} />
            </button>
          </div>

          {/* ── Stepper ── */}
          <div className="modal-stock-init__stepper">
            {STEPS.map(({ key, num, label }) => (
              <div key={key} className={`stepper__item ${step === key ? "active" : ""} ${isStepDone(key) ? "done" : ""}`}>
                <div className="stepper__dot">
                  {isStepDone(key)
                    ? <Icon name="Check" style={{ width: 12 }} />
                    : num}
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* ── Body ── */}
          <div className="modal-stock-init__body">

            {/* Step 1: Upload */}
            {step === "upload" && (
              <div className="step-upload">
                <p className="step-upload__hint">
                  Tải file mẫu về, điền <strong>SKU</strong> và <strong>số lượng tồn kho</strong> cho từng biến thể, sau đó upload lên để hệ thống kiểm tra.
                </p>

                <button className="btn-download-template"
                  onClick={() => window.open(`${API_BASE}/template`, "_blank")}>
                  <Icon name="Download" style={{ width: 16 }} />
                  Tải file mẫu (.xlsx)
                </button>

                <div
                  className={`drop-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault(); setIsDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f && isExcelFile(f)) setFile(f);
                    else showToast("Chỉ chấp nhận file .xlsx hoặc .xls", "error");
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && isExcelFile(f)) setFile(f);
                    }} />

                  {file ? (
                    <div className="drop-zone__file">
                      <Icon name="FileText" style={{ width: 36, color: "var(--primary-color)" }} />
                      <span className="drop-zone__filename">{file.name}</span>
                      <span className="drop-zone__size">{(file.size / 1024).toFixed(1)} KB</span>
                      <button className="drop-zone__remove"
                        onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                        <Icon name="X" style={{ width: 12 }} /> Xóa file
                      </button>
                    </div>
                  ) : (
                    <div className="drop-zone__empty">
                      <Icon name="Upload" style={{ width: 36, opacity: 0.35 }} />
                      <span>Kéo thả file vào đây hoặc <strong>chọn file</strong></span>
                      <span className="drop-zone__sub">Hỗ trợ .xlsx, .xls · Tối đa 3.000 dòng</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Preview */}
            {step === "preview" && uploadResult && (
              <div className="step-preview">
                <div className="preview__cards">
                  <div className="preview__card preview__card--total">
                    <span className="preview__card-label">Tổng dòng đọc được</span>
                    <span className="preview__card-value">{uploadResult.totalRows.toLocaleString()}</span>
                  </div>
                  <div className="preview__card preview__card--valid">
                    <span className="preview__card-label">Dòng hợp lệ</span>
                    <span className="preview__card-value">{uploadResult.validRows.toLocaleString()}</span>
                  </div>
                  <div className={`preview__card ${uploadResult.errorRows > 0 ? "preview__card--error" : "preview__card--valid"}`}>
                    <span className="preview__card-label">Dòng có lỗi</span>
                    <span className="preview__card-value">{uploadResult.errorRows.toLocaleString()}</span>
                  </div>
                </div>

                {uploadResult.errorRows > 0 && (
                  <div className="preview__error-banner">
                    <Icon name="AlertTriangle" style={{ width: 16 }} className="banner-icon" />
                    <span>{uploadResult.errorRows} dòng có lỗi sẽ bị bỏ qua khi import.</span>
                  </div>
                )}

                {uploadResult.validRows === 0 ? (
                  <div className="preview__no-valid">
                    <Icon name="XCircle" style={{ width: 40, opacity: 0.4 }} />
                    <span>Không có dòng hợp lệ nào để import.</span>
                    <button className="btn-link" onClick={() => { setStep("upload"); setFile(null); }}>
                      ← Quay lại chọn file khác
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="preview__warehouse">
                      <label className="preview__warehouse-label">
                        Kho nhận hàng <span className="required">*</span>
                      </label>
                      <select className="preview__warehouse-select"
                        value={inventoryId}
                        onChange={(e) => setInventoryId(+e.target.value)}>
                        <option value={0}>-- Chọn kho --</option>
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="preview__note">
                      <Icon name="Info" style={{ width: 15 }} />
                      <span>
                        Hệ thống sẽ tạo <strong>1 phiếu nhập tồn (IV5)</strong> gồm{" "}
                        <strong>{uploadResult.validRows.toLocaleString()} biến thể</strong> và duyệt tự động.
                        Tồn kho sẽ được cập nhật ngay sau khi xác nhận.
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Done */}
            {step === "done" && doneResult && (
              <div className="step-done">
                <div className="step-done__icon">
                  <Icon name="CheckCircle" style={{ width: 40, color: "#0e9e06" }} />
                </div>
                <h3>Import tồn kho thành công!</h3>
                <p>Đã nhập <strong>{doneResult.importedRows.toLocaleString()} biến thể</strong> vào kho thành công.</p>
                <div className="step-done__invoice">
                  <span>Mã phiếu nhập tồn:</span>
                  <strong>{doneResult.invoiceCode}</strong>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="modal-stock-init__footer">
            {step === "upload" && (
              <>
                <button className="btn-cancel" onClick={handleClose}>Hủy</button>
                <button className="btn-primary" disabled={!file || isUploading} onClick={handleUpload}>
                  {isUploading
                    ? <><span className="spinner" /> Đang kiểm tra...</>
                    : <>Tiếp theo <Icon name="ChevronRight" style={{ width: 16 }} /></>}
                </button>
              </>
            )}

            {step === "preview" && (
              <>
                <button className="btn-cancel" onClick={() => setStep("upload")}>
                  <Icon name="ChevronLeft" style={{ width: 16 }} /> Quay lại
                </button>
                {uploadResult?.validRows > 0 && (
                  <button className="btn-primary"
                    disabled={isConfirming || inventoryId <= 0}
                    onClick={handleConfirm}>
                    {isConfirming
                      ? <><span className="spinner" /> Đang tạo phiếu...</>
                      : <><Icon name="Check" style={{ width: 16 }} /> Xác nhận nhập {uploadResult.validRows.toLocaleString()} dòng</>}
                  </button>
                )}
              </>
            )}

            {step === "done" && (
              <button className="btn-primary"
                onClick={() => { if (doneResult) onSuccess(doneResult.invoiceCode); onClose(); }}>
                <Icon name="Check" style={{ width: 16 }} /> Hoàn tất
              </button>
            )}
          </div>

        </div>
      </div>
    </Portal>
  );
}