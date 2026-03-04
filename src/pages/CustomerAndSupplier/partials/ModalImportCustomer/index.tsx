import React, { Fragment, useState, useMemo, useRef } from "react";
import { IActionModal } from "model/OtherModel";
import { IModalImportCustomerProps } from "model/customer/PropsModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import RadioList from "components/radio/radioList";
import { uploadDocumentDirectFormData } from "utils/document";
import { showToast } from "utils/common";
import "./index.scss";

export default function ModalImportCustomer(props: IModalImportCustomerProps) {
  const { onShow, onHide } = props;

  const refInputUpload = useRef<HTMLInputElement>();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

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
      if (!newFiles.find((f) => f.name === file.name)) {
        newFiles.push(file);
      }
    });

    setFiles(newFiles);
  }

  const [showModalDocument, setShowModalDocument] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState<number>(0);
  const [infoDocument, setInfoDocument] = useState({
    type: "",
    url: "",
    fileSize: 0,
    fileName: "",
  });

  const handleChangeValueImport = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      const typeUpload = e.target.files[0].type;
      if (typeUpload.startsWith("application")) {
        setShowModalDocument(true);
        uploadDocumentDirectFormData(e.target.files[0], onSuccessDocument, onErrorDocument, onProgressDocument);
      }
      e.target.value = null;
    }
  };

  //* Xử lý tài liệu
  const onSuccessDocument = (data) => {
    if (data) {
      //Dùng để hiển thị thông báo
      setInfoDocument({ type: data.extension, url: data.fileUrl, fileSize: data.fileSize, fileName: data.fileName });
    }

    //Đóng popup và load lại danh sách
    onHide(true);
  };

  const onErrorDocument = (message) => {
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    setShowModalDocument(false);
  };

  const onProgressDocument = (percent) => {
    if (percent) {
      setShowProgress(percent);

      if (percent >= 99) {
        setShowProgress(0);
      }
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              onHide();
            },
          },
          {
            title: "Tiếp tục",
            type: "submit",
            color: "primary",
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide()}
        className="modal-import-customer"
      >
        <div className="form-import-customer">
          <ModalHeader title={"Nhập danh sách khách hàng"} toggle={() => !isSubmit && onHide()} />
          <ModalBody>
            <div className="box-import-customer">
              <div
                className={`support__upload--file ${dragging ? "dragging" : ""}`}
                draggable="true"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
              >
                <div className="action-content">
                  <Icon name="CloudUpload" />
                  <h3>Kéo và thả tệp tại đây</h3>
                </div>
                <span>Hoặc</span>
                <div className="btn-upload--file">
                  <label htmlFor="uploadFile">Chọn tập tin</label>
                  <input
                    type="file"
                    accept=".xls,.xlsx" //Chỉ hỗ trợ định dạng xslx và xls
                    className="d-none"
                    id="uploadFile"
                    ref={refInputUpload}
                    onChange={(e) => handleChangeValueImport(e)}
                  />
                </div>
              </div>

              <div className="file__example">
                <h4>
                  Tải về file mẫu:
                  <a href="https://cdn.reborn.vn/2023/11/01/cf531fd5-b3e5-49e2-aa81-34f4f1434977-1698844548.xlsx">Excel file</a>
                </h4>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
