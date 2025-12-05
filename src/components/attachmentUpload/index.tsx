import React, { useEffect, useRef, useState, Fragment } from "react";
import "./index.scss";

import FileService from "services/FileService";
import { uploadDocumentFormData } from "utils/document";
import Icon from "components/icon";
import ModalViewDocument from "pages/BPM/UploadDocument/ModalViewDocument/ModalViewDocument";
import { handDownloadFileOrigin } from "utils/common";
import ImgExcel from "assets/images/img-excel.png";
import ImgWord from "assets/images/img-word.png";
import ImgPowerpoint from "assets/images/img-powerpoint.png";

/**
 * AttachmentUploader (V9 logic preserved)
 * - Single click focuses the drop area (so Ctrl+V works)
 * - Double click opens the file selector (input click)
 * - Drag & drop uploads unchanged
 * - Uses FileService.uploadFile for images and uploadDocumentFormData for documents
 * - Controlled-friendly: accepts `value` and calls `onChange` only when user changes list
 */

/* Types */
export type UploadedItem = {
  url: string;
  type: string; // "image" | "pdf" | "docx" | "xlsx" | "pptx" | "txt" | "other"
  name?: string;
  size?: number;
};

type Props = {
  value?: UploadedItem[]; // controlled list
  onChange?: (list: UploadedItem[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  className?: string;
  placeholderLabel?: string;
  inputId?: string;
  showToast?: (message: string, type?: "error" | "success") => void;
};

const DEFAULT_ACCEPT = "image/*,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function inferTypeFromName(name: string) {
  const lower = (name || "").toLowerCase();
  if (lower.match(/\.(png|jpg|jpeg|gif|webp|bmp)$/)) return "image";
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "xlsx";
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "docx";
  if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) return "pptx";
  if (lower.endsWith(".txt")) return "txt";
  return "other";
}

/* shallow equality by url+type to avoid unnecessary setList */
function areListsEqual(a?: UploadedItem[], b?: UploadedItem[]) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].url !== b[i].url || a[i].type !== b[i].type) return false;
  }
  return true;
}

/* Local preview helper */
async function fileToLocalPreview(file: File): Promise<UploadedItem> {
  const type = inferTypeFromName(file.name);
  if (file.type.startsWith("image")) {
    const reader = new FileReader();
    return await new Promise<UploadedItem>((resolve, reject) => {
      reader.onload = () => resolve({ url: reader.result as string, type, name: file.name, size: file.size });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } else {
    const url = URL.createObjectURL(file);
    return { url, type, name: file.name, size: file.size };
  }
}

/* Component */
const AttachmentUploader: React.FC<Props> = ({
  value,
  onChange,
  multiple = true,
  maxFiles = 10,
  accept = DEFAULT_ACCEPT,
  className = "",
  placeholderLabel = "Tải tệp",
  inputId = "imageUpload",
  showToast,
}) => {
  const [list, setList] = useState<UploadedItem[]>(value ?? []);
  const [showProgress, setShowProgress] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // sync incoming value -> internal list only if content differs
  useEffect(() => {
    if (!value) return;
    setList((prev) => {
      if (areListsEqual(prev, value)) return prev;
      return value;
    });
  }, [value]);

  // skip emitting onChange on initial mount to avoid mount-loop
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onChange?.(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const safeShowToast = (msg: string) => {
    if (showToast) showToast(msg, "error");
    else console.warn(msg);
  };

  const processUploadSuccess = (data: any) => {
    console.log("processUploadSuccess data", data);

    if (!data) {
      safeShowToast("Upload thành công nhưng server không trả về data.");
      return;
    }
    const url = data.fileUrl ?? data.url ?? data.file?.fileUrl ?? data.fileUrl;
    const ext = data.extension ?? data.extensionName ?? inferTypeFromName(url ?? "");
    if (!url) {
      safeShowToast("Upload thành công nhưng server không trả về url.");
      return;
    }
    const result: UploadedItem = {
      url,
      type: ext ?? "image",
      name: data.fileName,
      size: data.fileSize,
    };
    setList((prev) => {
      const next = multiple ? [...prev, result] : [result];
      return next;
    });
  };

  const onError = (err: any) => {
    const text = err?.message ?? (typeof err === "string" ? err : "Có lỗi xảy ra. Vui lòng thử lại sau !");
    safeShowToast(text);
  };

  const onProgress = (percent: number) => {
    if (typeof percent === "number") {
      setShowProgress(percent);
      if (percent >= 99) {
        setTimeout(() => setShowProgress(0), 300);
      }
    }
  };

  /* Image upload via FileService.uploadFile */
  const handUploadFile = async (file: File) => {
    try {
      if (FileService && typeof (FileService as any).uploadFile === "function") {
        const maybe = (FileService as any).uploadFile({ data: file, onSuccess: processUploadSuccess, onError });
        if (maybe && typeof (maybe as Promise<any>).then === "function") {
          const resp = await maybe;
          if (resp && (resp.fileUrl || resp.url)) processUploadSuccess(resp);
        }
      } else {
        // fallback local preview
        const local = await fileToLocalPreview(file);
        setList((prev) => {
          const next = multiple ? [...prev, local] : [local];
          return next;
        });
      }
    } catch (err) {
      onError(err);
    }
  };

  /* Document upload via uploadDocumentFormData(file, onSuccess, onError, onProgress) */
  const uploadDocument = (file: File) => {
    try {
      if (typeof uploadDocumentFormData === "function") {
        uploadDocumentFormData(
          file,
          (data: any) => processUploadSuccess(data),
          (err: any) => onError(err),
          (p?: number) => onProgress(p ?? 0)
        );
      } else {
        fileToLocalPreview(file)
          .then((local) => setList((prev) => (multiple ? [...prev, local] : [local])))
          .catch(onError);
      }
    } catch (err) {
      onError(err);
    }
  };

  /* Unified incoming file handler (image -> handUploadFile, others -> uploadDocument) */
  const handleIncomingFile = (file: File) => {
    if (!file) return;
    const checkFile = file.type || "";
    if (checkFile.startsWith("image")) {
      handUploadFile(file);
    } else {
      uploadDocument(file);
    }
  };

  /* Input change / drop / paste handling */
  const handleUploadDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = maxFiles - list.length;
    const toProcess = multiple ? Array.from(files).slice(0, remaining) : [files[0]];
    toProcess.forEach((f) => handleIncomingFile(f));
    if (inputRef.current) inputRef.current.value = "";
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items);
      const hasFile = items.some((it) => it.kind === "file");
      if (!hasFile) return;
      const active = document.activeElement;
      if (!containerRef.current) return;
      if (containerRef.current.contains(active)) {
        e.preventDefault();
        const filesFromClipboard: File[] = [];
        for (const it of items) {
          if (it.kind === "file") {
            const file = it.getAsFile();
            if (file) filesFromClipboard.push(file);
          }
        }
        if (filesFromClipboard.length) {
          const remaining = maxFiles - list.length;
          const toProcess = multiple ? filesFromClipboard.slice(0, remaining) : [filesFromClipboard[0]];
          toProcess.forEach((f) => handleIncomingFile(f));
        }
      }
    };
    window.addEventListener("paste", onPaste as any);
    return () => window.removeEventListener("paste", onPaste as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, multiple, maxFiles]);

  const handleAddFiles = async (incoming: File[] | FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming as any as File[]);
    if (arr.length === 0) return;
    const remaining = maxFiles - list.length;
    const toProcess = multiple ? arr.slice(0, remaining) : [arr[0]];
    toProcess.forEach((f) => handleIncomingFile(f));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    containerRef.current?.classList.add("drag-over");
  };

  const handleDragLeave = () => {
    containerRef.current?.classList.remove("drag-over");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    containerRef.current?.classList.remove("drag-over");
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      handleAddFiles(dt.files);
    }
  };

  const handleRemoveImageItem = (idx: number) => {
    setList((prev) => {
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };

  /* click/dblclick behavior preserved: single click focus, double-click open input */
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    // allow clicks on delete or file-preview to behave normally
    if (target && target.closest && (target.closest(".icon-delete") || target.closest(".file-preview") || target.closest("button"))) {
      return;
    }
    // focus drop area so Paste (Ctrl+V) works
    containerRef.current?.focus();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    inputRef.current?.click();
  };
  const [isModalViewDocument, setIsModalViewDocument] = useState<boolean>(false);
  const [dataDoc, setDataDoc] = useState<{ fileUrl: string; fileName: string } | null>(null);
  const renderPreview = (item: UploadedItem, idx: number) => {
    const isImage = item.type === "image" || /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(item.url);
    return (
      <div key={item.url + String(idx)} className="image-item-attach">
        {isImage ? (
          <img src={item.url} alt={item.name ?? "image"} />
        ) : (
          <div className="file-preview">
            <div className="file-preview-top">
              <FileIcon type={item.type} />
              {typeof item.size === "number" && <div className="file-size">{formatBytes(item.size)}</div>}
            </div>
            <div className="file-name" title={item.name ?? item.url}>
              {item.name ?? item.url}
            </div>
            {/* <div className="file-name" title={item.name ?? item.url}>
              {"File type: " + (item.type ?? "Unknowm")}
            </div> */}
          </div>
        )}
        <span className="icon-delete-image" onClick={() => handleRemoveImageItem(idx)} title="Xoá">
          <Icon name="Trash" />
        </span>
        <a
          href={item.url}
          className="icon-download"
          onClick={() => {
            handDownloadFileOrigin(item.url, item.name ?? "Attachment");
          }}
          title="Tải xuống"
        >
          <Icon name="DownLoadNew" />
        </a>
        <span
          className="icon-view"
          onClick={() => {
            if (item?.url) {
              setIsModalViewDocument(true);
              setDataDoc({
                fileUrl: item.url,
                fileName: item?.name ? item.name : "Attachment",
              });
            }
          }}
          title="Xem"
        >
          <Icon name="Eye" />
        </span>
      </div>
    );
  };

  return (
    <div className={`attachments ${className} ${multiple ? "" : "attachments-single"}`}>
      <label className="title-attachment">{placeholderLabel}</label>
      <div
        ref={containerRef}
        className={list.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        tabIndex={0}
      >
        {list.length === 0 ? (
          // use a non-label element so single click only focuses (not open dialog)
          <div className="action-upload-image" role="button" aria-label="Tải tệp (double click để mở)">
            <div className="wrapper-upload">
              <IconUpload />
              Tải tệp lên
              {multiple ? <div className="hint">(Kéo thả hoặc dùng Ctrl+V; double-click để chọn file)</div> : null}
            </div>
          </div>
        ) : (
          <Fragment>
            <div className="d-flex align-items-center">
              {list.map((item, idx) => renderPreview(item, idx))}
              {list.length < maxFiles && multiple ? (
                // use non-label so single click won't open file dialog
                <div className="add-image" role="button" title="Thêm tệp (double click để mở)">
                  <IconPlus />
                </div>
              ) : null}
            </div>
          </Fragment>
        )}

        {showProgress > 0 && (
          <div className="upload-progress" aria-hidden>
            <div className="progress-bar" style={{ width: `${showProgress}%` }} />
            <span className="progress-text">{Math.round(showProgress)}%</span>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept={accept} className="d-none" id={inputId} onChange={handleUploadDocument} multiple={multiple} />
      <ModalViewDocument
        onShow={isModalViewDocument}
        dataDoc={dataDoc}
        onHide={(reload) => {
          if (reload) {
          }
          setIsModalViewDocument(false);
          setDataDoc(null);
        }}
      />
    </div>
  );
};

export default AttachmentUploader;

/* Helpers & Icons */

function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/* Basic icons */
const IconUpload: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="icon-svg" aria-hidden>
    <path d="M12 3v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M7 10l5-5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPlus: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="icon-plus" aria-hidden>
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* V3-like SVG file icons */
const SvgPdf: React.FC = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#e73f3f"></rect>
    <path d="M7 9h10" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"></path>
    <path d="M7 13h6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"></path>
    <path d="M7 17h4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"></path>
  </svg>
);

const SvgWord: React.FC = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#2b59c3"></rect>
    <path d="M7 8h10" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"></path>
    <path d="M7 12h10" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"></path>
    <path d="M7 16h6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"></path>
  </svg>
);

const SvgExcel: React.FC = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#1a8f1a"></rect>
    <path d="M7 7l3 5 3-5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"></path>
    <path d="M7 17h10" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"></path>
  </svg>
);

const SvgPpt: React.FC = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#b84b00"></rect>
    <circle cx="12" cy="12" r="3" fill="#fff"></circle>
  </svg>
);

const SvgTxt: React.FC = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#6c757d"></rect>
    <path d="M7 9h10" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"></path>
    <path d="M7 13h8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"></path>
  </svg>
);

const SvgFileGeneric: React.FC = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#6c757d"></rect>
    <path d="M7 8h10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"></path>
    <path d="M7 12h10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"></path>
  </svg>
);

const FileIcon: React.FC<{ type: string }> = ({ type }) => {
  const t = (type || "").toLowerCase();
  if (t === "xlsx" || t === "xls" || t === "docx" || t === "doc" || t === "pptx" || t === "ppt") {
    return (
      <div className={`file-icon`} aria-hidden>
        <img
          src={t == "xlsx" || t == "xls" ? ImgExcel : t === "docx" || t === "doc" ? ImgWord : t === "pptx" || t === "ppt" ? ImgPowerpoint : ""}
          alt="File Type"
          style={{ width: 25, height: 25 }}
        />
      </div>
    );
  } else if (t === "pdf") {
    return (
      <div className={`file-icon file-pdf`} aria-hidden>
        <SvgPdf />
      </div>
    );
  } else if (t === "txt") {
    return (
      <div className={`file-icon file-txt`} aria-hidden>
        <SvgTxt />
      </div>
    );
  } else {
    return (
      <div className={`file-icon file-other`} aria-hidden>
        <SvgFileGeneric />
      </div>
    );
  }
  if (t === "xlsx" || t === "xls") {
    return (
      <div className={`file-icon file-excel`} aria-hidden>
        <SvgExcel />
      </div>
    );
  }
  if (t === "docx" || t === "doc") {
    return (
      <div className={`file-icon file-word`} aria-hidden>
        <SvgWord />
      </div>
    );
  }
  if (t === "pptx" || t === "ppt") {
    return (
      <div className={`file-icon file-ppt`} aria-hidden>
        <SvgPpt />
      </div>
    );
  }
  if (t === "pdf") {
    return (
      <div className={`file-icon file-pdf`} aria-hidden>
        <SvgPdf />
      </div>
    );
  }
};
