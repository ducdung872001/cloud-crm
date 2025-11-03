import React, { useEffect, useRef, useState } from "react";
import Icon from "components/icon";
import Image from "components/image";
import { showToast } from "utils/common";
import ExcelIcon from "assets/images/img-excel.png";

interface IAddFileProps {
  code?: string;
  takeFileAdd: (data) => void;
}

/**
 * Tải mẫu file xuất báo cáo
 * @param props
 * @returns
 */
export default function AddFile(props: IAddFileProps) {
  const { takeFileAdd } = props;

  const refInputUpload = useRef<HTMLInputElement>();
  const [dragging, setDragging] = useState<boolean>(false);
  const [files, setFiles] = useState([]);

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
      takeFileAdd(files);
    }
  }, [files]);

  const handleChangeValueImport = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

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
      {files.length == 0 ? (
        <div className="__action-operation">
          <div className="action-content">
            <Icon name="CloudUpload" />
            <h3>Kéo và thả tệp tại đây</h3>
          </div>
          <span>Hoặc</span>
          <div className="btn-upload--file">
            <label htmlFor="uploadFile">Chọn tập tin</label>
            <input
              type="file"
              accept=".doc,.docx,.xls,.xlsx"
              className="d-none"
              id="uploadFile"
              ref={refInputUpload}
              onChange={(e) => handleChangeValueImport(e)}
            />
          </div>
        </div>
      ) : (
        <div className="show__file--upload">
          <div className="img__upload">
            <Image src={ExcelIcon} alt="File đã tải" />
          </div>
          <div className="actions__change-file">
            <span className="btn-change" onClick={() => refInputUpload.current.click()}>
              Chọn mẫu khác
            </span>
            <span className="btn-remove" onClick={() => setFiles([])}>
              Xóa mẫu
            </span>
          </div>
          <input type="file" accept=".doc,.docx,.xls,.xlsx" className="d-none" ref={refInputUpload} onChange={(e) => handleChangeValueImport(e)} />
        </div>
      )}
    </div>
  );
}
