import React, { Fragment, useState, useEffect, useRef } from "react";
import { IWorkExchangeFilterRequest } from "model/workOrder/WorkOrderRequestModel";
import { IWorkExchangeResponseModal } from "model/workOrder/WorkOrderResponseModel";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ThirdGender from "assets/images/third-gender.png";
import ImageExcel from "assets/images/img-excel.png";
import ImageWord from "assets/images/img-word.png";
import ImagePowerPoint from "assets/images/img-powerpoint.png";
import ImagePdf from "assets/images/img-pdf.png";
// import Conversation from "assets/images/conversation.png";
import Conversation from "assets/images/img-NoChatHistory.png";

import { handDownloadFileOrigin, showToast } from "utils/common";
import { useOnClickOutside } from "utils/hookCustom";
import WorkOrderService from "services/WorkOrderService";
import MessageChatWork from "./partials/MessageChatWork";
import "./ContentExchangeWork.scss";
import Fancybox from "components/fancybox/fancybox";
import Image from "components/image";
import ImageAvatar from "assets/images/avatar-rox.png";
import Tippy from "@tippyjs/react";
import ImgRar from "assets/images/img-rar.png";
import ImgZip from "assets/images/img-zip.png";
import ImgFilePDF from "assets/images/img-pdf.png";
import ImgFileDoc from "assets/images/img-word.png";
import ImgFileExcel from "assets/images/img-excel.png";
import ImgFilePowerpoint from "assets/images/img-powerpoint.png";

interface IContentExchangeWorkProps {
  worId: number;
  dataEmployee: any;
  dataWork: any;
}

export default function ContentExchangeWork(props: IContentExchangeWorkProps) {
  const { worId, dataEmployee, dataWork } = props;

  const refEditChat = useRef();
  const refContainerChat = useRef();
  const messageEndRef = useRef(null);

  const [params, setParams] = useState<IWorkExchangeFilterRequest>({
    page: 1,
    limit: 10,
    worId: worId,
  });

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isEditChat, setIsEditChat] = useState<boolean>(false);

  useOnClickOutside(refEditChat, () => setIsEditChat(false), ["option-action-chat"]);

  const [lstDataExchange, setLstDataExchange] = useState<IWorkExchangeResponseModal[]>([]);
  console.log("lstDataExchange", lstDataExchange);

  const [idExchange, setIdExchange] = useState<number>(0);
  const [dataExchange, setDataExchange] = useState<IWorkExchangeResponseModal>(null);

  const handLstExchangeContent = async () => {
    setIsLoading(true);

    const response = await WorkOrderService.workExchange(params);

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
    if (worId) {
      handLstExchangeContent();
    }
  }, [worId]);

  // đoạn này là sử lí code luôn luôn cuộn xuống dưới mỗi khi mình có tin nhắn mới
  const scrollToLastMessage = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (params.page == 1) {
      scrollToLastMessage();
    }
  });

  // function xử lý cuộn trang
  const handleScroll = (event) => {
    const scrollTop = Math.round(event.target.scrollTop || 0);

    //TODO: đoạn này là check đk, nếu như mà hết page rồi thì thôi ko phân trang nữa
    // console.log("cái mình cần : ", scrollTop === 0 && hasMore);

    if (scrollTop === 0 && hasMore) {
      //Tăng lên rồi gọi api
      setParams({ ...params, page: params.page + 1 });
    }
  };

  // xóa đi 1 trao đổi
  const onRemoveChat = async (id: number) => {
    if (!id) return;

    const response = await WorkOrderService.deleteWorkExchange(id);

    if (response.code === 0) {
      showToast("Xóa tin nhắn thành công", "success");
      handLstExchangeContent();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item: IWorkExchangeResponseModal) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn xóa tin nhắn. Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onRemoveChat(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  // lấy chiều cao của vùng soạn thảo tin nhắn
  const takeHeightTextarea = (height: number) => {
    // console.log("height chat : ", height);
  };

  // chỉnh sửa 1 hội thoại
  const handEditContent = async (id) => {
    if (!id) return;

    const response = await WorkOrderService.updateWorkExchange(id);

    if (response.code === 0) {
      const result = response.result;
      setDataExchange(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

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
                      <Image src={item.url} alt={item.content} width={"64rem"} />
                    </a>
                  </Fancybox>
                ) : item.type == "video" ? (
                  <video controls>
                    <source src={item.url} />
                  </video>
                ) : (
                  <div className="img-document">
                    <div
                      className="info-document"
                      onClick={() => {
                        window.open(
                          `${process.env.APP_CRM_LINK}/crm/view_document?name=${item.fileName}&url=${item.url}`,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                    >
                      <div className="__avatar--doc">
                        <img
                          // src={item.type == "pdf" ? ImagePdf : item.type == "xlsx" ? ImageExcel : item.type == "docx" ? ImageWord : ImagePowerPoint}
                          src={
                            item.type === "docx" || item.type === "doc"
                              ? ImgFileDoc
                              : item.type === "xlsx"
                              ? ImgFileExcel
                              : item.type === "pdf" || item.type === "PDF"
                              ? ImgFilePDF
                              : item.type === "pptx"
                              ? ImgFilePowerpoint
                              : item.type === "zip"
                              ? ImgZip
                              : ImgRar
                          }
                          alt={item.content}
                        />
                      </div>
                      <div className="__detail">
                        <span className="name-document">{item.fileName}</span>
                        <span className="size-document">
                          {item.fileSize > 1048576 ? `${(item.fileSize / 1048576).toFixed(2)} MB` : `${(item.fileSize / 1024).toFixed(1)} KB`}
                          <Tippy content="Tải File">
                            <div>
                              <Icon
                                name="Download"
                                onClick={() => {
                                  handDownloadFileOrigin(item.url, item.fileName);
                                }}
                              />
                            </div>
                          </Tippy>
                        </span>
                      </div>
                    </div>

                    {/* <div className="action-download">
                      <a href={item.url} download>
                        <Icon name="Download" />
                        Tải xuống
                      </a>
                    </div> */}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* <div className="content-media">{item.content}</div> */}
      </div>
    );
  };

  return (
    <div className="wrapper__content-exchange--work">
      <div className="box__exchange">
        <div className="content-exchange">
          {lstDataExchange && dataEmployee && lstDataExchange.length > 0 ? (
            <div onScroll={handleScroll} className="lst__data--exchange">
              {lstDataExchange.map((item: any, idx) => {
                return (
                  <div
                    key={idx}
                    // className={`${item.employeeId === dataEmployee.id ? "data__item--right" : "data__item--left"}`}
                    className={`${"data__item--left"}`}
                  >
                    <img src={item.employeeAvatar ? item.employeeAvatar : ImageAvatar} alt={item.employeeName} className="avatar-employee" />
                    <div className="info__content">
                      <div className="info__content--left">
                        <div className="username-person">
                          <span className="username">{item.employeeName}</span>

                          {dataWork?.managerId === item.employeeId && dataWork?.taskType === "assigned_task" ? (
                            <div className="role-assign">
                              <span className="role-name">Người giao việc</span>
                            </div>
                          ) : null}

                          {dataWork?.employeeId === item.employeeId ? (
                            <div className="role-receive">
                              <span className="role-name">Người nhận việc</span>
                            </div>
                          ) : null}

                          <div className="time-comment">
                            <span className="time">{item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY - HH:mm") : ""}</span>
                          </div>
                        </div>

                        <div>
                          <span className="content">{item.content}</span>
                        </div>

                        <div className="box__conversation">{item.medias && item.medias.length > 0 ? boxContentMedia(item) : ""}</div>
                      </div>
                      {/* <div className="info__content--right">
                        <span className="time-content">
                          {moment(item.createdTime).format("HH:mm")} {item.employeeId === dataEmployee.id ? <Icon name="Checked" /> : ""}
                        </span>
                      </div> */}
                      {/* <div
                        className={`${item.employeeId === dataEmployee.id ? "option-action-chat" : "d-none"}`}
                        onClick={() => {
                          setIsEditChat(!isEditChat);
                          setIdExchange(item.id);
                        }}
                        ref={refContainerChat}
                      >
                        <Icon name="ThreeDotVertical" />
                      </div> */}
                      {/* {isEditChat && item.id === idExchange && (
                        <ul className="menu-action-chat" ref={refEditChat}>
                          <li
                            className="edit-chat-item"
                            onClick={(e) => {
                              e && e.preventDefault();
                              setIsEditChat(false);
                              handEditContent(item.id);
                            }}
                          >
                            <Icon name="Pencil" />
                            Sửa
                          </li>
                          <li
                            className="remove-chat-item"
                            onClick={() => {
                              setIsEditChat(false);
                              showDialogConfirmDelete(item);
                            }}
                          >
                            <Icon name="Trash" />
                            Xóa
                          </li>
                        </ul>
                      )} */}
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>
          ) : isLoading && params.page === 1 ? (
            <Loading />
          ) : (
            <div className="message-notification">
              <div className="img__message">
                <img src={Conversation} alt="Hình ảnh cuộc trao đổi" />
                {/* <Icon name='NoChatHistory' /> */}
              </div>
              <div className="content-message">
                {/* <h2>Chưa có bình luận công việc nào</h2> */}
                <p>Chưa có bình luận công việc nào!</p>
              </div>
            </div>
          )}
        </div>
        <div className="chat-content">
          <MessageChatWork
            dataMessage={dataExchange}
            worId={worId}
            employeeId={dataEmployee?.id}
            takeHeightTextarea={takeHeightTextarea}
            onHide={(reload) => {
              if (reload) {
                setParams({ ...params, page: 1 });
                handLstExchangeContent();
                setDataExchange(null);
              }
            }}
          />
        </div>
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
