import React, { useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import { IAttachmentsListProps } from "model/customer/PropsModel";
import ImgRar from "assets/images/img-rar.png";
import ImgZip from "assets/images/img-zip.png";
import ImgFilePDF from "assets/images/img-pdf.png";
import ImgFileDoc from "assets/images/img-word.png";
import ImgFileExcel from "assets/images/img-excel.png";
import ImgFilePowerpoint from "assets/images/img-powerpoint.png";
import ThirdGender from "assets/images/third-gender.png";
import Icon from "components/icon";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import { uploadImageFromFiles } from "utils/image";
import FileService from "services/FileService";
import { uploadDocumentFormData } from "utils/document";
import { uploadVideoFormData } from "utils/videoFormData";
import UploadMediaModal from "./partials/UploadMedia/UploadMediaModal";
import UploadDocumentModal from "./partials/UploadDocument/UploadDocumentModal";
import "./AttachmentsList.scss";

export default function AttachmentsList(props: IAttachmentsListProps) {
  const { idCustomer } = props;

  const [dragging, setDragging] = useState<boolean>(false);
  const [files, setFiles] = useState([]);

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lstDataAttachments, setLstDataAttachments] = useState([]);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const [checkType, setCheckType] = useState<string>(null);
  const [showProgress, setShowProgress] = useState<number>(0);
  const [showModalMedia, setShowModalMedia] = useState<boolean>(false);
  const [showModalDocument, setShowModalDocument] = useState<boolean>(false);

  const [infoMedia, setInfoMedia] = useState({
    type: "",
    url: "",
  });
  const [infoDocument, setInfoDocument] = useState({
    type: "",
    url: "",
    fileSize: 0,
    fileName: "",
  });

  const params = {
    page: page,
    limit: 10,
    customerId: idCustomer,
  };

  const getDataAttachment = async (id: number) => {
    if (!id) return;

    setIsLoading(true);

    const response = await CustomerService.lstAttachments(params);

    if (response.code === 0) {
      const result = response.result.items;
      setHasMore(response.result.loadMoreAble);

      const newData = page == 1 ? [] : lstDataAttachments;

      (result || []).map((item) => {
        newData.push(item);
      });

      setLstDataAttachments(newData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (idCustomer && page) {
      getDataAttachment(idCustomer);
    }
  }, [idCustomer, page]);

  // xử lý cuộn lên thì call API
  const handleScroll = (e) => {
    const container = e.target;
    const isAtBottom = container.scrollHeight - Math.round(container.scrollTop) === container.clientHeight;

    if (isAtBottom && hasMore) {
      setPage((prevState) => prevState + 1);
    }
  };

  // đoạn này xử lý kéo thả file
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

  //* Xử lý ảnh
  const showImage = (url) => {
    if (url) {
      setInfoMedia({ ...infoMedia, type: "image", url: url });
    }
  };

  const getProgress = (percent) => {
    if (percent) {
      setShowProgress(percent);

      if (percent >= 99) {
        setShowProgress(0);
      }
    }
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setInfoMedia({ ...infoMedia, type: "image", url: result });
  };

  //* Xử lý video
  let onSuccess = (data) => {
    if (data) {
      setInfoMedia({ type: data.fileType, url: data.fileUrl });
    }
  };

  let onError = (message) => {
    showToast(message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  let onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent);

      if (percent >= 99) {
        setShowProgress(0);
      }
    }
  };

  //* Xử lý tài liệu
  const onSuccessDocument = (data) => {
    if (data) {
      setInfoDocument({ type: data.extension, url: data.fileUrl, fileSize: data.fileSize, fileName: data.fileName });
    }
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

  useEffect(() => {
    if (files.length > 0) {
      const lastFile = files[files.length - 1];
      const checkFile = lastFile?.type;

      if (checkFile.startsWith("video")) {
        setCheckType("video");
        setShowModalMedia(true);
        // uploadVideoFormData(lastFile, onSuccess, onError, onProgress);
      }

      if (checkFile.startsWith("image")) {
        setCheckType("image");
        setShowModalMedia(true);
        handUploadFile(lastFile);
        // uploadImageFromFiles([lastFile], showImage, false, getProgress);
      }

      if (checkFile.startsWith("application")) {
        setShowModalDocument(true);
        uploadDocumentFormData(lastFile, (onSuccess = onSuccessDocument), (onError = onErrorDocument), (onProgress = onProgressDocument));
      }
    }
  }, [files]);

  const handleChangeValueImport = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  return (
    <div className="wrapper__exchange--attachment" onScroll={handleScroll}>
      <div className="box__attachment">
        <div
          className={`upload__attachment ${dragging ? "dragging" : ""}`}
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
              accept=".xlsx,.doc,.docx,.ppt,.pptx,application/pdf,image/*,video/*,.zip,.rar"
              className="d-none"
              id="uploadFile"
              onChange={(e) => handleChangeValueImport(e)}
            />
          </div>
        </div>
        <div className="lst__info--attachment">
          {lstDataAttachments && lstDataAttachments.length > 0 && (
            <div className="lst__attachment">
              {lstDataAttachments.map((item, idx) => {
                return (
                  <div key={idx} className="content__attachment--left">
                    <div className="avatar_user">
                      <img src={item.employeeAvatar || ThirdGender} alt="avatar_user" />
                    </div>
                    <div className="box__desc--attachment">
                      <h4 className="name__user">{item.employeeName}</h4>

                      {item.medias.map((el, index) => {
                        return (
                          <div key={index} className="desc__attachment">
                            <div className="desc__attachment--left">
                              {el.type !== "image" ? (
                                <div className="img__file">
                                  <img
                                    src={
                                      el.type === "docx"
                                        ? ImgFileDoc
                                        : el.type === "xlsx"
                                        ? ImgFileExcel
                                        : el.type === "pdf"
                                        ? ImgFilePDF
                                        : el.type === "pptx"
                                        ? ImgFilePowerpoint
                                        : el.type === "zip"
                                        ? ImgZip
                                        : ImgRar
                                    }
                                    alt={el.type}
                                  />
                                </div>
                              ) : (
                                <div className="img__avatar">
                                  <img src={el.url} alt={el.type} />
                                  <a href={el.url} download rel="noopener noreferrer" target="_blank" className="action__download--image">
                                    Tải xuống
                                  </a>
                                </div>
                              )}
                            </div>
                            <div className="desc__attachment--right">
                              <h5 className="name_file">{el.fileName}</h5>
                              <div className="info_file">
                                {/* <span className="size-file">{item.size}</span> */}
                                {el.type !== "image" && (
                                  <div className="action__user">
                                    <Tippy content="Tải xuống">
                                      <div className="download">
                                        <a href={el.url} download>
                                          <Icon name="Download" />
                                        </a>
                                      </div>
                                    </Tippy>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="time__send--attachment">{item.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {isLoading && <Loading />}
        {!isLoading && lstDataAttachments.length === 0 && (
          <SystemNotification description={<span>Hiện tại chưa có tài liệu nào.</span>} type="no-item" titleButton="Gửi email" />
        )}
      </div>
      <UploadMediaModal
        checkType={checkType}
        infoMedia={infoMedia}
        onShow={showModalMedia}
        idCustomer={idCustomer}
        onHide={(reload) => {
          if (reload) {
            getDataAttachment(idCustomer);
          }

          setShowModalMedia(false);
          setInfoMedia({ type: "", url: "" });
        }}
      />
      <UploadDocumentModal
        onShow={showModalDocument}
        infoDocument={infoDocument}
        progress={showProgress}
        idCustomer={idCustomer}
        onHide={(reload) => {
          if (reload) {
            getDataAttachment(idCustomer);
          }

          setShowModalDocument(false);
          setInfoDocument({ type: "", url: "", fileName: "", fileSize: 0 });
        }}
      />
    </div>
  );
}
