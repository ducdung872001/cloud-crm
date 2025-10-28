import React, { useEffect, useRef, useState } from "react";
import Icon from "components/icon";
import { handDownloadFileOrigin, showToast } from "utils/common";
import { convertToId, trimContent } from "reborn-util";
import Tippy from "@tippyjs/react";
import ImgRar from "assets/images/img-rar.png";
import ImgZip from "assets/images/img-zip.png";
import ImgFilePDF from "assets/images/img-pdf.png";
import ImgFileDoc from "assets/images/img-word.png";
import ImgFileExcel from "assets/images/img-excel.png";
import ImgFilePowerpoint from "assets/images/img-powerpoint.png";

interface IAddFileProps {
  code?: string;
  fileProps?: any;
  infoFile?: any;
  takeFileAdd: (data) => void;
  setInfoFile?: any;
  template?: string;
  setIsLoadingFile?: any
  dataAttachment?: any
}

/**
 * Tải mẫu file xuất báo cáo
 * @param props
 * @returns
 */
export default function AddFile(props: IAddFileProps) {
  const { takeFileAdd, infoFile, setInfoFile, dataAttachment } = props;

  const refInputUpload = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [files, setFiles] = useState([]);
  const [templateGetApi, setTemplateGetAoi] = useState(null);

  useEffect(() => {
    if (infoFile?.fileUrl) {
      setTemplateGetAoi(infoFile?.fileUrl);
    } 
  }, [infoFile?.fileUrl]);

  function handleDragStart(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);

    const newFiles = [...files];
    const droppedFiles: any = Array.from(e.dataTransfer.files);

    droppedFiles.forEach((file) => {
      const checkFile = file?.name.split("?")[0].split("#")[0].split(".").pop();

      if (checkFile !== "xlsx") {
        showToast("File không đúng định dạng. Vui lòng kiểm tra lại !", "warning");
        return;
      }

      if (!newFiles.find((f) => f.name === file.name)) {
        newFiles.push(file);
      }
    });

    setFiles(newFiles);
  }

  useEffect(() => {
    if (files.length > 0) {
      takeFileAdd(files[files.length - 1]);
    } else {
      takeFileAdd("");
    }
  }, [files]);

  const handleChangeValueImport = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      setTemplateGetAoi(null)
    }
  };


  const convetName = (name) => {
    let fieldName = convertToId(name) || "";
    fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, 'g'), '');    

    return fieldName || 'TaiLieu'
  } 

  const download = (link, name) => {
    
    const type =  link.includes('.docx') ? 'docx'
        : link.includes('.xlsx') ? 'xlsx'
        : (link.includes('.pdf') || link.includes('.PDF')) ? 'pdf'
        : link.includes('.pptx') ? 'pptx'
        : link.includes('.zip') ? 'zip'
        : 'rar'
    const nameDownload = `${name}.${type}`

    handDownloadFileOrigin(link, nameDownload)
  }

  return (
    <div
      className={`support__upload--file ${dragging ? "dragging" : ""}`}
      draggable="true"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragStart={handleDragStart}
    >
      {!infoFile?.fileUrl ? (
        <div className="__action-operation">
          <div className="action-content">
            <Icon name="CloudUpload" />
            <h3>Kéo và thả tệp tại đây</h3>
          </div>
          <span>Hoặc</span>
          <div className="btn-upload--file">
            <label htmlFor="uploadFile">Chọn tập tin</label>
            <input type="file" accept=".doc,.docx,.xls,.xlsx,.pdf" className="d-none" id="uploadFile" onChange={(e) => handleChangeValueImport(e)} />
          </div>
        </div>
      ) : (
        <div className="show__file--upload">
          <div className="img__upload">
            <img 
                src={
                    infoFile?.extension === "docx"
                      ? ImgFileDoc
                      : infoFile?.extension === "xlsx"
                      ? ImgFileExcel
                      : (infoFile?.extension === "pdf" || infoFile?.extension === "PDF")
                      ? ImgFilePDF
                      : infoFile?.extension === "pptx"
                      ? ImgFilePowerpoint
                      : infoFile?.extension === "zip"
                      ? ImgZip
                      : ImgRar
                  }
                alt="File đã tải" 
            />
            <div style={{width: '85%'}}>
                {/* <h5 style={{fontSize: 14}}>{files[0]?.name ? files[0]?.name : `${convetName(dataAttachment?.name)}.${infoFile?.extension}`}</h5> */}
                <h5 style={{fontSize: 14}}>{files[0]?.name ? files[0]?.name : `MauFS.${infoFile?.extension}`}</h5>
                {templateGetApi ? 
                    <Tippy content="Tải xuống">
                        <div className="download" onClick={() => download(infoFile?.fileUrl, 'MauHopDong')}>
                            {/* <a href={infoFile?.fileUrl} download> */}
                                <Icon name="Download" />
                            {/* </a> */}
                        </div>
                    </Tippy>
                : null}
            </div>
          </div>
          <div className="actions__change-file">
            <span className="btn-change" 
                onClick={() => {
                    refInputUpload.current?.click();
                }}>
              Chọn file khác
            </span>
            <span className="btn-remove" 
                onClick={() => {
                    setFiles([]);
                    setInfoFile(null);
                    setTemplateGetAoi(null)
                }}
            >
              Xóa file
            </span>
          </div>
          <input type="file" accept=".doc,.docx,.xls,.xlsx,.pdf" className="d-none" ref={refInputUpload} onChange={(e) => handleChangeValueImport(e)} />
        </div>
      )}
    </div>
  );
}
