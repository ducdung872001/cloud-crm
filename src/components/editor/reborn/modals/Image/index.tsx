import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
import { IModalAddImageProps } from "model/editor/PropsModel";
import { showToast } from "utils/common";
import FileService from "services/FileService";
import "./index.scss";

type Tab = "upload" | "library";

export default function Image(props: IModalAddImageProps) {
  const { onShow, onHide } = props;
  const [tab, setTab] = useState<Tab>("upload");
  const [listSelectedImage, setListSelectedImage] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Không render gì nếu đóng — nhưng dùng Portal để thoát khỏi overflow:hidden
  if (!onShow) return null;

  const doUpload = async (file: File) => {
    if (file.size > 1048576 * 25) {
      showToast("Ảnh tải lên không được quá 25MB", "warning");
      return;
    }
    setUploading(true);
    await FileService.uploadFile({
      data: file,
      onSuccess: (data: any) => {
        const url = data?.fileUrl || data;
        if (url) setListSelectedImage(prev => [...prev, url]);
        setUploading(false);
      },
      onError: () => {
        showToast("Tải ảnh thất bại, vui lòng thử lại", "error");
        setUploading(false);
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) doUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) doUpload(file);
    else showToast("Vui lòng thả file ảnh (jpg, png, gif...)", "warning");
  };

  const handleRemove = (idx: number) => {
    setListSelectedImage(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = () => {
    if (listSelectedImage.length === 0) return;
    props.callback?.(listSelectedImage);
    onHide();
    setListSelectedImage([]);
  };

  const handleClose = () => {
    onHide();
    setListSelectedImage([]);
  };

  const modal = (
    <div className="img-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="img-modal">
        {/* Header */}
        <div className="img-modal__header">
          <div className="img-modal__title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Thêm hình ảnh
          </div>
          <button className="img-modal__close" onClick={handleClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="img-modal__tabs">
          <button className={`img-modal__tab${tab === "upload" ? " img-modal__tab--active" : ""}`} onClick={() => setTab("upload")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Tải ảnh lên
          </button>
          <button className={`img-modal__tab${tab === "library" ? " img-modal__tab--active" : ""}`} onClick={() => setTab("library")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Thư viện
          </button>
        </div>

        {/* Body */}
        <div className="img-modal__body">
          {tab === "upload" ? (
            <div className="img-modal__upload-panel">
              {/* Drop zone */}
              <div
                className={`img-modal__dropzone${dragOver ? " img-modal__dropzone--over" : ""}${uploading ? " img-modal__dropzone--loading" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && inputRef.current?.click()}
              >
                <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: "none" }} onChange={handleFileChange} />
                {uploading ? (
                  <div className="img-modal__dropzone-content">
                    <div className="img-modal__spinner" />
                    <p className="img-modal__dropzone-text">Đang tải ảnh lên...</p>
                  </div>
                ) : (
                  <div className="img-modal__dropzone-content">
                    <div className="img-modal__dropzone-icon">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <p className="img-modal__dropzone-text">
                      Kéo thả ảnh vào đây, hoặc <span>chọn file</span>
                    </p>
                    <p className="img-modal__dropzone-hint">JPG, PNG, GIF, WEBP · Tối đa 25MB</p>
                  </div>
                )}
              </div>

              {/* Preview */}
              {listSelectedImage.length > 0 && (
                <div className="img-modal__preview-section">
                  <div className="img-modal__preview-header">
                    <span className="img-modal__preview-label">Ảnh đã chọn</span>
                    <span className="img-modal__preview-count">{listSelectedImage.length} / 9</span>
                  </div>
                  <div className="img-modal__preview-grid">
                    {listSelectedImage.map((url, idx) => (
                      <div key={`${idx}-${url}`} className="img-modal__preview-item">
                        <img src={url} alt={`preview-${idx}`} />
                        {idx === 0 && <span className="img-modal__preview-main">Chính</span>}
                        <button className="img-modal__preview-remove" onClick={() => handleRemove(idx)}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                    {listSelectedImage.length < 9 && (
                      <div className="img-modal__preview-add" onClick={() => inputRef.current?.click()}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="img-modal__library-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p>Chưa có ảnh trong thư viện</p>
              <button onClick={() => setTab("upload")}>Tải ảnh lên ngay</button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="img-modal__footer">
          <button className="img-modal__btn img-modal__btn--cancel" onClick={handleClose}>Hủy</button>
          <button
            className="img-modal__btn img-modal__btn--confirm"
            disabled={listSelectedImage.length === 0 || uploading}
            onClick={handleConfirm}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Chèn {listSelectedImage.length > 0 ? `${listSelectedImage.length} ảnh` : "ảnh"}
          </button>
        </div>
      </div>
    </div>
  );

  // Dùng Portal để render ra ngoài editor (thoát overflow:hidden)
  return ReactDOM.createPortal(modal, document.body);
}