import React, { useState, useEffect, useRef } from "react";
import { Portal } from "react-overlays";
import Icon from "components/icon";
import { showToast } from "utils/common";
import InventoryService from "services/InventoryService";
import "./ModalStockInitImport.scss";

const API_BASE = "/bizapi/inventory/stock-init/import";

interface IWarehouse { id: number; name: string; }
interface IUploadResult { sessionId: string; totalRows: number; validRows: number; errorRows: number; }
interface IConfirmResult { invoiceCode: string; importedRows: number; }
interface Props { isOpen: boolean; onClose: () => void; onSuccess: (code: string) => void; }
type Step = "upload" | "preview" | "done";

const STEPS: { key: Step; num: string; label: string }[] = [
  { key: "upload",  num: "1", label: "Tải file lên" },
  { key: "preview", num: "2", label: "Xem trước" },
  { key: "done",    num: "3", label: "Hoàn tất" },
];
const ORDER: Step[] = ["upload", "preview", "done"];

export default function ModalStockInitImport({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep]       = useState<Step>("upload");
  const [file, setFile]       = useState<File | null>(null);
  const [dragging, setDrag]   = useState(false);
  const [uploading, setUpl]   = useState(false);
  const [confirming, setCfm]  = useState(false);
  const [dlTemplate, setDlt]  = useState(false);
  const [result, setResult]   = useState<IUploadResult | null>(null);
  const [wId, setWId]         = useState(0);
  const [warehouses, setWH]   = useState<IWarehouse[]>([]);
  const [done, setDone]       = useState<IConfirmResult | null>(null);
  const fileRef  = useRef<HTMLInputElement>(null);
  const sessRef  = useRef("");

  const isDone = (s: Step) => ORDER.indexOf(s) < ORDER.indexOf(step);
  const isXlsx = (f: File) => f.name.endsWith(".xlsx") || f.name.endsWith(".xls");

  const handleDownloadTemplate = async () => {
    setDlt(true);
    try {
      const res = await fetch(`${API_BASE}/template`, { method: "GET" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mau-nhap-ton-kho.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("Không thể tải file mẫu", "error");
    } finally {
      setDlt(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setStep("upload"); setFile(null); setResult(null);
    setWId(0); setDone(null); sessRef.current = "";
    InventoryService.list({}).then((r: any) => {
      const items = r?.result?.items ?? r?.result?.data ?? r?.data ?? [];
      setWH(items);
      if (items.length === 1) setWId(items[0].id);
    }).catch(() => {});
  }, [isOpen]);

  const pickFile = (f: File) => { if (isXlsx(f)) setFile(f); else showToast("Chỉ nhận .xlsx hoặc .xls", "error"); };

  const handleUpload = async () => {
    if (!file) return;
    setUpl(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: fd,
        // KHÔNG set credentials, KHÔNG set Content-Type — browser tự set boundary
      });
      const d = await r.json();
      const res: IUploadResult = d?.result ?? d?.data;
      if ((d?.code === 0 || d?.status === 1) && res) {
        setResult(res); sessRef.current = res.sessionId; setStep("preview");
      } else showToast(d?.message ?? "Upload thất bại", "error");
    } catch { showToast("Lỗi upload file", "error"); }
    finally { setUpl(false); }
  };

  const handleConfirm = async () => {
    if (!sessRef.current || wId <= 0) { showToast("Vui lòng chọn kho nhận hàng", "error"); return; }
    setCfm(true);
    try {
      const p = new URLSearchParams({ sessionId: sessRef.current, inventoryId: String(wId) });
      const r = await fetch(`${API_BASE}/confirm?${p}`, { method: "POST" });
      const d = await r.json();
      const res: IConfirmResult = d?.result ?? d?.data;
      if ((d?.code === 0 || d?.status === 1) && res) {
        setDone(res); sessRef.current = ""; setStep("done");
      } else showToast(d?.message ?? "Tạo phiếu thất bại", "error");
    } catch { showToast("Lỗi xác nhận", "error"); }
    finally { setCfm(false); }
  };

  const handleClose = () => {
    if (step !== "done" && sessRef.current) {
      fetch(`${API_BASE}/cancel?sessionId=${sessRef.current}`, { method: "POST" }).catch(() => {});
      sessRef.current = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal container={document.getElementsByTagName("body")[0]}>
      <div className="modal-stock-init-overlay" onClick={handleClose}>
        <div className="modal-stock-init" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="msii-header">
            <div className="msii-header__left">
              <div className="msii-header__icon">
                <Icon name="Upload" />
              </div>
              <div>
                <p className="msii-header__title">Import tồn kho ban đầu</p>
                <p className="msii-header__sub">Nhập hàng loạt từ file Excel · Tối đa 3.000 dòng</p>
              </div>
            </div>
            <button className="msii-header__close" onClick={handleClose} title="Đóng">
              <Icon name="X" />
            </button>
          </div>

          {/* Stepper */}
          <div className="msii-stepper">
            {STEPS.map(({ key, num, label }) => (
              <div key={key} className={`msii-step ${step === key ? "msii-step--active" : ""} ${isDone(key) ? "msii-step--done" : ""}`}>
                <div className="msii-step__dot">
                  {isDone(key) ? <Icon name="Check" style={{ width: 11 }} /> : num}
                </div>
                <span className="msii-step__label">{label}</span>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="msii-body">

            {/* ── Step 1 ── */}
            {step === "upload" && (
              <div className="msii-upload">
                <p className="msii-upload__hint">
                  Tải file mẫu, điền <strong>SKU</strong> và <strong>số lượng tồn</strong> cho từng biến thể, rồi upload để hệ thống kiểm tra.
                </p>

                <button className="msii-template-btn" onClick={handleDownloadTemplate} disabled={dlTemplate}>
                  {dlTemplate
                    ? <><span className="msii-spinner" style={{ borderTopColor: "var(--primary-color)", borderColor: "var(--primary-color-30)" }} /> Đang tải...</>
                    : <><Icon name="Download" /> Tải file mẫu (.xlsx)</>}
                </button>

                <div
                  className={`msii-dropzone${dragging ? " msii-dropzone--dragging" : ""}${file ? " msii-dropzone--filled" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) pickFile(f); }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />

                  {file ? (
                    <div className="msii-dropzone__file">
                      <Icon name="FileText" style={{ width: 40, color: "var(--primary-color)" }} />
                      <span className="msii-dropzone__name">{file.name}</span>
                      <span className="msii-dropzone__size">{(file.size / 1024).toFixed(1)} KB</span>
                      <button className="msii-dropzone__remove"
                        onClick={e => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
                        <Icon name="X" /> Xóa file
                      </button>
                    </div>
                  ) : (
                    <div className="msii-dropzone__empty">
                      <Icon name="Upload" style={{ width: 38, opacity: 0.3 }} />
                      <span>Kéo thả vào đây hoặc <strong>chọn file</strong></span>
                      <span className="msii-dropzone__sub">Hỗ trợ .xlsx · .xls · Tối đa 3.000 dòng</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 2 ── */}
            {step === "preview" && result && (
              <div className="msii-preview">
                <div className="msii-stats">
                  <div className="msii-stat msii-stat--total">
                    <span className="msii-stat__label">Tổng dòng đọc được</span>
                    <span className="msii-stat__value">{result.totalRows.toLocaleString()}</span>
                  </div>
                  <div className="msii-stat msii-stat--ok">
                    <span className="msii-stat__label">Dòng hợp lệ</span>
                    <span className="msii-stat__value">{result.validRows.toLocaleString()}</span>
                  </div>
                  <div className={`msii-stat ${result.errorRows > 0 ? "msii-stat--err" : "msii-stat--ok"}`}>
                    <span className="msii-stat__label">Dòng có lỗi</span>
                    <span className="msii-stat__value">{result.errorRows.toLocaleString()}</span>
                  </div>
                </div>

                {result.errorRows > 0 && (
                  <div className="msii-warn">
                    <Icon name="AlertTriangle" />
                    <span>{result.errorRows} dòng lỗi sẽ bị bỏ qua khi import.</span>
                  </div>
                )}

                {result.validRows === 0 ? (
                  <div className="msii-empty">
                    <Icon name="XCircle" />
                    <span>Không có dòng hợp lệ.</span>
                    <button className="msii-btn-link" onClick={() => { setStep("upload"); setFile(null); }}>← Chọn file khác</button>
                  </div>
                ) : (
                  <>
                    <div className="msii-warehouse">
                      <label className="msii-warehouse__label">Kho nhận hàng <span className="req">*</span></label>
                      <select className="msii-warehouse__select" value={wId} onChange={e => setWId(+e.target.value)}>
                        <option value={0}>-- Chọn kho --</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div className="msii-note">
                      <Icon name="Info" />
                      <span>Hệ thống sẽ tạo <strong>1 phiếu nhập tồn (IV5)</strong> gồm <strong>{result.validRows.toLocaleString()} biến thể</strong> và duyệt tự động. Tồn kho cập nhật ngay sau khi xác nhận.</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Step 3 ── */}
            {step === "done" && done && (
              <div className="msii-done">
                <div className="msii-done__circle">
                  <Icon name="CheckCircle" />
                </div>
                <p className="msii-done__title">Import tồn kho thành công!</p>
                <p className="msii-done__sub">Đã nhập <strong>{done.importedRows.toLocaleString()} biến thể</strong> vào kho.</p>
                <div className="msii-done__badge">
                  <span>Mã phiếu nhập tồn:</span>
                  <strong>{done.invoiceCode}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="msii-footer">
            {step === "upload" && (<>
              <button className="msii-btn-cancel" onClick={handleClose}>Hủy</button>
              <button className="msii-btn-primary" disabled={!file || uploading} onClick={handleUpload}>
                {uploading ? <><span className="msii-spinner"/> Đang kiểm tra...</> : <>Tiếp theo <Icon name="ChevronRight"/></>}
              </button>
            </>)}

            {step === "preview" && (<>
              <button className="msii-btn-cancel" onClick={() => setStep("upload")}>
                <Icon name="ChevronLeft"/> Quay lại
              </button>
              {result?.validRows > 0 && (
                <button className="msii-btn-primary" disabled={confirming || wId <= 0} onClick={handleConfirm}>
                  {confirming ? <><span className="msii-spinner"/> Đang tạo phiếu...</> : <><Icon name="Check"/> Xác nhận {result.validRows.toLocaleString()} dòng</>}
                </button>
              )}
            </>)}

            {step === "done" && (
              <button className="msii-btn-primary" onClick={() => { if (done) onSuccess(done.invoiceCode); onClose(); }}>
                <Icon name="Check"/> Hoàn tất
              </button>
            )}
          </div>

        </div>
      </div>
    </Portal>
  );
}