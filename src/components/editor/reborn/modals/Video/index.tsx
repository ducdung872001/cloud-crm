import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { IModalAddVideoProps } from "model/editor/PropsModel";
import { showToast } from "utils/common";
import { uploadVideoFromFiles } from "utils/videoBlob";
import "./index.scss";

type Tab = "upload" | "library";

export default function Video(props: IModalAddVideoProps) {
  const { onShow, onHide } = props;
  const [tab, setTab] = useState<Tab>("upload");
  const [videoLink, setVideoLink] = useState("");
  const [thumbnailLink, setThumbnailLink] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUploading = progress !== null;

  // Auto-insert khi có videoLink (giữ behaviour cũ)
  useEffect(() => {
    if (videoLink) {
      props.callback?.(videoLink, thumbnailLink);
      onHide();
      setVideoLink("");
      setThumbnailLink("");
    }
  }, [videoLink]);

  if (!onShow) return null;

  const doUpload = (file: File) => {
    if (file.size > 1048576 * 500) {
      showToast("Video không được quá 500MB", "warning");
      return;
    }
    uploadVideoFromFiles(
      [file],
      (url: string) => setVideoLink(url),
      (percent: number) => {
        setProgress(percent === 100 ? null : percent);
      },
      (url: string) => setThumbnailLink(url),
      () => {
        showToast("Tải video thất bại, vui lòng thử lại", "error");
        setProgress(null);
      }
    );
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
    if (file && file.type.startsWith("video/")) doUpload(file);
    else showToast("Vui lòng thả file video (mp4, mov...)", "warning");
  };

  const handleClose = () => {
    if (isUploading) return; // không cho đóng khi đang upload
    onHide();
    setVideoLink("");
    setThumbnailLink("");
    setProgress(null);
  };

  const modal = (
    <div className="vid-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="vid-modal">
        {/* Header */}
        <div className="vid-modal__header">
          <div className="vid-modal__title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            Thêm video
          </div>
          <button className="vid-modal__close" onClick={handleClose} disabled={isUploading}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="vid-modal__tabs">
          <button className={`vid-modal__tab${tab === "upload" ? " vid-modal__tab--active" : ""}`} onClick={() => setTab("upload")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Tải video lên
          </button>
          <button className={`vid-modal__tab${tab === "library" ? " vid-modal__tab--active" : ""}`} onClick={() => setTab("library")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Thư viện
          </button>
        </div>

        {/* Body */}
        <div className="vid-modal__body">
          {tab === "upload" ? (
            <div className="vid-modal__upload-panel">
              {/* Drop zone */}
              <div
                className={`vid-modal__dropzone${dragOver ? " vid-modal__dropzone--over" : ""}${isUploading ? " vid-modal__dropzone--loading" : ""}`}
                onDragOver={(e) => { e.preventDefault(); if (!isUploading) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !isUploading && inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="video/*,.mp4,.mov"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                {isUploading ? (
                  <div className="vid-modal__dropzone-content">
                    <div className="vid-modal__progress-ring">
                      <svg width="56" height="56" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e7eb" strokeWidth="4"/>
                        <circle
                          cx="28" cy="28" r="24"
                          fill="none"
                          stroke="var(--primary-color, #015aa4)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - (progress || 0) / 100)}`}
                          style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 0.3s" }}
                        />
                      </svg>
                      <span className="vid-modal__progress-pct">{Math.round(progress || 0)}%</span>
                    </div>
                    <p className="vid-modal__dropzone-text">Đang tải lên... vui lòng đợi</p>
                    <p className="vid-modal__dropzone-hint">Không đóng cửa sổ trong khi tải</p>
                  </div>
                ) : (
                  <div className="vid-modal__dropzone-content">
                    <div className="vid-modal__dropzone-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                      </svg>
                    </div>
                    <p className="vid-modal__dropzone-text">
                      Kéo thả video vào đây, hoặc <span>chọn file</span>
                    </p>
                    <p className="vid-modal__dropzone-hint">MP4, MOV · Tối đa 500MB · Video sẽ được chèn ngay sau khi tải xong</p>
                  </div>
                )}
              </div>

              {/* Format info */}
              <div className="vid-modal__formats">
                {["MP4", "MOV", "AVI", "MKV"].map(fmt => (
                  <span key={fmt} className="vid-modal__format-chip">{fmt}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="vid-modal__library-empty">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
              <p>Chưa có video trong thư viện</p>
              <button onClick={() => setTab("upload")}>Tải video lên ngay</button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="vid-modal__footer">
          <button
            className="vid-modal__btn vid-modal__btn--cancel"
            onClick={handleClose}
            disabled={isUploading}
          >
            Hủy
          </button>
          <div className="vid-modal__footer-info">
            {isUploading
              ? "Video đang tải, sẽ tự động chèn khi hoàn tất..."
              : "Chọn file để bắt đầu tải lên"}
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}