import React, { Fragment, useEffect, useRef, useState } from "react";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import EmployeeService from "services/EmployeeService";
import { handDownloadFileOrigin, showToast } from "utils/common";
import ThirdGender from "assets/images/third-gender.png";
import Conversation from "assets/images/conversation.png";
import ContentChat from "./partials/ContentChat";
import "./index.scss";
import { useOnClickOutside } from "utils/hookCustom";
import MailboxService from "services/MailboxService";
// import { uploadImageFromFiles } from "utils/image";
import Image from "components/image";
import { uploadDocumentFormData } from "utils/document";
import UploadMedia from "./partials/UploadMedia";
import UploadDocument from "./partials/UploadDocument";
import ImageExcel from "assets/images/img-excel.png";
import ImageWord from "assets/images/img-word.png";
import ImagePowerPoint from "assets/images/img-powerpoint.png";
import ImagePdf from "assets/images/img-pdf.png";
import FileService from "services/FileService";
import Fancybox from "components/fancybox/fancybox";
import SaleflowInvoiceService from "services/SaleflowInvoiceService";
import Tippy from "@tippyjs/react";

interface IExchangeFastProps {
  dataCustomer: any;
  onHide: () => void;
}

export default function ExchangeFast(props: IExchangeFastProps) {
  const { dataCustomer, onHide } = props;

  const messageEndRef = useRef(null);
  const refContainerChat = useRef();
  const refEditChat = useRef();

  const capitalizeFirstLetter = (str) => {
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
  };

  const [dataEmployee, setDataEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [lstDataExchange, setLstDataExchange] = useState([]);
  const [isEditChat, setIsEditChat] = useState<boolean>(false);
  const [dataExchange, setDataExchange] = useState(null);
  const [idExchange, setIdExchange] = useState(0);

  //TODO: đoạn này là logic kéo thả file

  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState<boolean>(false);

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

  useEffect(() => {
    if (files && files.length > 0) {
      console.log("files : ", files);
    }
  }, [files]);

  useOnClickOutside(refEditChat, () => setIsEditChat(false), ["desc__content--right"]);

  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    sieId: null,
  });

  // lấy thông tin nhân viên
  const takeDataEmployee = async () => {
    const response = await EmployeeService.info();

    if (response.code === 0) {
      const result = response.result;
      setDataEmployee(result);
    }
  };

  const handLstExchangeContent = async (params) => {
    const response = await SaleflowInvoiceService.invoiceExchange(params);

    if (response.code === 0) {
      const result = response.result;

      setHasMore((params.page - 1) * 10 + (result.items.length || 0) < result.total);

      const newDataExchange = params.page === 1 ? [] : lstDataExchange;

      (result.items || []).map((item) => {
        newDataExchange.unshift(item);
      });

      setLstDataExchange(newDataExchange);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    takeDataEmployee();
  }, []);

  useEffect(() => {
    if (dataCustomer) {
      setParams({ ...params, sieId: dataCustomer.sieId });
    }
  }, [dataCustomer]);

  useEffect(() => {
    if (params.sieId) {
      handLstExchangeContent(params);
    }
  }, [params]);

  // function xử lý cuộn trang
  const handleScroll = (event) => {
    const scrollTop = Math.round(event.target.scrollTop || 0);

    if (scrollTop === 0 && hasMore) {
      //Tăng lên rồi gọi api
      setParams({ ...params, page: params.page + 1 });
    }
  };

  const scrollToLastMessage = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (params.page == 1) {
      scrollToLastMessage();
    }
  });

  // xóa đi một tin nhắn trò chuyện
  const onRemoveChat = async (id) => {
    const response = await SaleflowInvoiceService.deleteInvoiceExchange(id);

    if (response.code === 0) {
      showToast("Xóa tin nhắn thành công", "success");
      handLstExchangeContent(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const [checkType, setCheckType] = useState<string>(null);
  const [showProgress, setShowProgress] = useState<number>(0);
  const [showModalMedia, setShowModalMedia] = useState<boolean>(false);
  const [showModalDocument, setShowModalDocument] = useState<boolean>(false);

  const [infoMedia, setInfoMedia] = useState({
    type: "",
    url: "",
    fileName: "",
  });
  const [infoDocument, setInfoDocument] = useState({
    type: "",
    url: "",
    fileSize: 0,
    fileName: "",
  });

  //* Xử lý ảnh
  const showImage = (url) => {
    if (url) {
      console.log("");
      setInfoMedia({ ...infoMedia, type: "image", url: url, fileName: "" });
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

  //* Xử lý video
  let onSuccess = (data) => {
    if (data) {
      setInfoMedia({ type: data.fileType, url: data.fileUrl, fileName: "" });
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

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setInfoMedia({ ...infoMedia, type: "image", url: result, fileName: "" });
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

  const boxContentMedia = (item) => {
    const dataMedia = item.medias;

    return (
      <div className="box__content--media">
        <div className="lst-media">
          {dataMedia.map((item, idx) => {
            return (
              <div key={idx} className="item-media">
                {item.type == "image" ? (
                  <Fancybox>
                    <a key={item.id} data-fancybox="gallery" data-download-src={item.url} href={item.url}>
                      <Image src={item.url} alt={item.name} width={"64rem"} />
                    </a>
                  </Fancybox>
                ) : item.type == "video" ? (
                  <video controls>
                    <source src={item.url} />
                  </video>
                ) : (
                  <div className="img-document">
                    <div className="info-document">
                      <div className="__avatar--doc">
                        <img
                          src={item.type == "pdf" ? ImagePdf : item.type == "xlsx" ? ImageExcel : item.type == "docx" ? ImageWord : ImagePowerPoint}
                          alt={item.content}
                        />
                      </div>
                      <div className="__detail">
                        <span className="name-document">{item.fileName}</span>
                        <span className="size-document">
                          {item.fileSize > 1048576 ? `${(item.fileSize / 1048576).toFixed(2)} MB` : `${(item.fileSize / 1024).toFixed(1)} KB`}
                        </span>
                      </div>
                    </div>

                    <div className="action-download" onClick={() => handDownloadFileOrigin(item.url, item.fileName)}>
                      <span>
                        <Icon name="Download" />
                        Tải xuống
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="content-media">{item.content}</div>
      </div>
    );
  };

  const [actionHide, setActionHide] = useState<boolean>(false);

  if (!dataCustomer) return;

  return (
    <div className={`exchange__kanban__saleflow--fast ${actionHide ? "exchange__kanban__saleflow--fast--more" : ""}`}>
      {actionHide ? (
        <div className="item__small--exchange">
          <div className="icon-close-fast" onClick={() => onHide()}>
            <Icon name="TimesCircleFill" />
          </div>
          <Tippy content={`Thông tin trao đổi - ${dataCustomer.invoiceCode}`} placement="left">
            <span className="name__small" onClick={() => setActionHide(false)}>
              <Icon name="SupervisedUserCircle" />
            </span>
          </Tippy>
        </div>
      ) : (
        <Fragment>
          <div className="header__exchange">
            <h4 className="title">Thông tin trao đổi - {dataCustomer.invoiceCode}</h4>
            <div className="lst__action--exchange">
              <span className="action__hide" onClick={() => setActionHide(true)}>
                <Icon name="Minus" />
              </span>
              <span className="action__close" onClick={() => onHide()}>
                <Icon name="Times" />
              </span>
            </div>
          </div>
          <div
            className={`body__exchange ${dragging ? "dragging" : ""}`}
            draggable="true"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
          >
            {dataEmployee && lstDataExchange && lstDataExchange.length > 0 && (
              <div className="lst__content--exchange" key={lstDataExchange.length} onScroll={handleScroll}>
                {lstDataExchange.map((item, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`item__content ${item.employeeId === dataEmployee.id ? "item__content--right" : "item__content--left"}`}
                    >
                      <div className="avatar-employee">
                        <img src={item.employeeAvatar ? item.employeeAvatar : ThirdGender} alt={item.employeeName} />
                      </div>

                      <div className="desc__content">
                        <div className="desc__content--left">
                          <div className="--content">
                            <span className="username-person">{item.employeeId === dataEmployee.id ? "" : item.employeeName}</span>
                            <div className="content-res">{item.medias && item.medias.length > 0 ? boxContentMedia(item) : item.content}</div>
                          </div>
                          <span className="time-content">
                            {moment(item.createdTime).format("HH:mm")} {item.employeeId === dataEmployee.id ? <Icon name="Checked" /> : ""}
                          </span>
                        </div>

                        <div
                          className="desc__content--right"
                          onClick={() => {
                            setIsEditChat(!isEditChat);
                            setIdExchange(item.id);
                          }}
                          ref={refContainerChat}
                          style={isEditChat && item.id === idExchange ? { display: "block" } : {}}
                        >
                          <span className="icon__option">
                            <Icon name="ThreeDotVertical" />
                          </span>

                          {isEditChat && item.id === idExchange && (
                            <ul className="lst__action" ref={refEditChat}>
                              <li
                                className="item__action--edit"
                                onClick={(e) => {
                                  e && e.preventDefault();
                                  setIsEditChat(false);
                                  if (item.medias && item.medias.length > 0) {
                                    const condition = item.medias[0].type;
                                    const dataMedia = item.medias[0];

                                    if (condition === "image" || condition === "video") {
                                      setShowModalMedia(true);
                                      setInfoMedia({ type: dataMedia.type, url: dataMedia.url, fileName: "" });
                                    } else {
                                      setShowModalDocument(true);
                                      setInfoDocument({ ...infoDocument, type: dataMedia.type, url: dataMedia.url, fileName: dataMedia.fileName });
                                    }

                                    setDataExchange(item);
                                  } else {
                                    setDataExchange(item);
                                  }
                                }}
                              >
                                <Icon name="Pencil" />
                                Sửa
                              </li>
                              <li
                                className="item__action--remove"
                                onClick={() => {
                                  setIsEditChat(false);
                                  onRemoveChat(item.id);
                                }}
                              >
                                <Icon name="Trash" />
                                Xóa
                              </li>
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>
            )}

            {isLoading && params.page === 1 && <Loading />}

            {!isLoading && lstDataExchange.length === 0 && (
              <div className="notify__no--exchange">
                <div className="img__message">
                  <img src={Conversation} alt="Hình ảnh cuộc trao đổi" />
                </div>
                <div className="no__content--message">
                  <h2>Chưa có cuộc trao đổi công việc nào</h2>
                  <p>Hãy bắt đầu cuộc trao đổi đầu tiên nhé!</p>
                </div>
              </div>
            )}

            <div className="chat__exchange" style={lstDataExchange && lstDataExchange.length === 0 ? {} : {}}>
              <ContentChat
                dataMessage={dataExchange}
                sieId={dataCustomer.sieId}
                employeeId={dataEmployee ? dataEmployee.id : null}
                onHide={(reload) => {
                  if (reload) {
                    setParams({ ...params, page: 1 });
                    handLstExchangeContent(params);
                  }
                }}
              />
            </div>

            {dragging && (
              <div className="box__drag--drop">
                <span className="icon__support">
                  <Icon name="FingerTouch" />
                </span>
                <span className="name__support">Thả tệp tại đây</span>
              </div>
            )}
          </div>
        </Fragment>
      )}

      <UploadMedia
        checkType={checkType}
        infoMedia={infoMedia}
        onShow={showModalMedia}
        id={idExchange}
        sieId={dataCustomer ? dataCustomer.sieId : null}
        employeeId={dataEmployee ? dataEmployee.id : null}
        onHide={(reload) => {
          if (reload) {
            handLstExchangeContent(params);
          }

          setDataExchange(null);
          setShowModalMedia(false);
          setInfoMedia({ type: "", url: "", fileName: "" });
        }}
        content={dataExchange ? dataExchange.content : ""}
      />
      <UploadDocument
        onShow={showModalDocument}
        infoDocument={infoDocument}
        progress={showProgress}
        id={idExchange}
        sieId={dataCustomer ? dataCustomer.sieId : null}
        employeeId={dataEmployee ? dataEmployee.id : null}
        onHide={(reload) => {
          if (reload) {
            handLstExchangeContent(params);
          }

          setDataExchange(null);
          setShowModalDocument(false);
          setInfoDocument({ type: "", url: "", fileName: "", fileSize: 0 });
        }}
        content={dataExchange ? dataExchange.content : ""}
      />
    </div>
  );
}
