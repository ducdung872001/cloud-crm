import React, { Fragment, useState, useEffect, useRef, useContext } from "react";
import { IListMailboxExchangeResponseModel } from "model/mailBox/MailBoxResponseModel";
import { useOnClickOutside } from "utils/hookCustom";
import { showToast } from "utils/common";
import MessageChat from "../MessageChat/MessageChat";
import InfoConversation from "../InfoConversation/InfoConversation";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ThirdGender from "assets/images/third-gender.png";
import ImageExcel from "assets/images/img-excel.png";
import ImageWord from "assets/images/img-word.png";
import ImagePowerPoint from "assets/images/img-powerpoint.png";
import ImagePdf from "assets/images/img-pdf.png";
import { ContextType, UserContext } from "contexts/userContext";
import { IMailboxExchangeFilterRequest } from "model/mailBox/MailBoxRequestModel";
import MailboxService from "services/MailboxService";
import Conversation from "assets/images/conversation.png";
import { IExchangeContentListProps } from "model/mailBox/PropsModel";
import "./ExchangeContent.scss";
import Fancybox from "components/fancybox/fancybox";
import Image from "components/image";
import ImageThirdGender from "assets/images/third-gender.png";

export default function ExchangeContentList(props: IExchangeContentListProps) {
  const { dataMailbox, isBroadly } = props;

  const refEditChat = useRef();
  const refContainerChat = useRef();
  const messageEndRef = useRef(null);

  const { id } = useContext(UserContext) as ContextType;

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isEditChat, setIsEditChat] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [idDetailExchange, setIdDetailExchange] = useState<number>(0);
  const [detailExchange, setDetailExchange] = useState<IListMailboxExchangeResponseModel[]>([]);
  const [dataExchange, setDataExchange] = useState<IListMailboxExchangeResponseModel>(null);

  useOnClickOutside(refEditChat, () => setIsEditChat(false), ["option-action-chat"]);

  const params: IMailboxExchangeFilterRequest = {
    mailboxId: dataMailbox.id,
    page: page,
    limit: 10,
  };

  // call API danh sách trao đổi thư nội bộ
  const getDataDetailExchange = async () => {
    setIsLoading(true);

    const response = await MailboxService.mailboxExchangeList(params);

    if (response.code === 0) {
      const result = response.result;
      setHasMore((page - 1) * 10 + (result.lstMailboxExchange.length || 0) < result.total);

      const newDetailExchange = page == 1 ? [] : detailExchange;

      (result.lstMailboxExchange || []).map((item: any) => {
        newDetailExchange.unshift(item);
      });
      setDetailExchange(newDetailExchange);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    getDataDetailExchange();
  }, [dataMailbox, page]);

  useEffect(() => {
    setPage(1);
  }, [dataMailbox.id]);

  // đoạn này là sử lí code luôn luôn cuộn xuống dưới mỗi khi mình có tin nhắn mới
  const scrollToLastMessage = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (page == 1) {
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
      setPage((prevState) => prevState + 1);
    }
  };

  // xóa đi một tin nhắn trò chuyện
  const onRemoveChat = async (id) => {
    const response = await MailboxService.mailboxExchangeDelete(id);

    if (response.code === 0) {
      showToast("Xóa tin nhắn thành công", "success");
      getDataDetailExchange();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item: IListMailboxExchangeResponseModel) => {
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

  const takeHeightTextarea = (height) => {
    // console.log("cái mình cần : ", height);
  };

  const viewContentMedia = (data) => {
    const dataMedia = JSON.parse(data.medias || "[]");

    return (
      <div className="wrapper__content--media">
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
                    <div className="info-document">
                      <div className="__avatar">
                        <img
                          src={item.type == "pdf" ? ImagePdf : item.type == "xlsx" ? ImageExcel : item.type == "docx" ? ImageWord : ImagePowerPoint}
                          alt={item.content}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = ImageThirdGender; // Thay thế bằng ảnh mặc định nếu lỗi
                          }}
                        />
                      </div>
                      <div className="__detail">
                        <span className="name-document">{item?.fileName}</span>
                        <span className="size-document">
                          {/* {`${(item?.fileSize / 1024).toFixed(1)} MB`} */}
                          {item?.fileSize > 1024
                            ? item?.fileSize / 1024 > 1024
                              ? `${(item?.fileSize / 1024 / 1024).toFixed(1)} MB`
                              : `${(item?.fileSize / 1024).toFixed(1)} KB`
                            : `${item?.fileSize ? (item?.fileSize).toFixed(1) : 0} Byte`}
                        </span>
                      </div>
                    </div>

                    <div className="action-download">
                      <a href={item.url} download>
                        <Icon name="Download" />
                        Tải xuống
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="content-media">{data.content}</div>
      </div>
    );
  };

  return (
    <div className="wrapper-exchange-content">
      <div className={`wrapper-chat ${isBroadly ? "isActiveExtend" : ""}`}>
        <div className="content-messages">
          {detailExchange && detailExchange.length > 0 ? (
            <div onScroll={handleScroll} className={`list-content ${isBroadly ? "isActiveBroadly" : ""}`}>
              {detailExchange.map((item, idx) => (
                <div key={idx} className={`${item.userId === id ? "content__item--right" : "content__item--left"}`}>
                  <img
                    src={item.employeeAvatar ? item.employeeAvatar : ThirdGender}
                    alt={item.employeeName}
                    className="avatar-employee"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ImageThirdGender; // Thay thế bằng ảnh mặc định nếu lỗi
                    }}
                  />
                  <div className="info__content">
                    <div className="info__content--left">
                      <span className="username-person">{item.userId === id ? "" : item.employeeName}</span>
                      <div className="box__conversation">{JSON.parse(item.medias || "[]").length > 0 ? viewContentMedia(item) : item.content}</div>
                    </div>
                    <div className="info__content--right">
                      <span className="time-content">
                        {moment(item.createdTime).format("HH:mm")} {item.userId === id ? <Icon name="Checked" /> : ""}
                      </span>
                    </div>
                    <div
                      className="option-action-chat"
                      onClick={() => {
                        setIsEditChat(!isEditChat);
                        setIdDetailExchange(item.id);
                      }}
                      ref={refContainerChat}
                    >
                      <Icon name="ThreeDotVertical" />
                    </div>
                    {isEditChat && item.id === idDetailExchange && (
                      <ul className="menu-action-chat" ref={refEditChat}>
                        <li
                          className="edit-chat-item"
                          onClick={(e) => {
                            e && e.preventDefault();
                            setIsEditChat(false);
                            setDataExchange(item);
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
                    )}
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
          ) : isLoading && page == 1 ? (
            <Loading />
          ) : (
            <div className="message-notification">
              <div className="img__message">
                <img src={Conversation} alt="hình ảnh chưa có cuộc trò chuyện nào" />
              </div>
              <div className="content-message">
                <h2>Nhóm chưa có cuộc trò nào</h2>
                <p>Hãy bắt đầu trao đổi nhé !</p>
              </div>
            </div>
          )}
        </div>
        <div className="chat-content">
          <MessageChat
            mailboxId={dataMailbox.id}
            dataExchange={dataExchange}
            takeHeightTextarea={takeHeightTextarea}
            onHide={(reload) => {
              if (reload) {
                setPage(1);
                setDataExchange(null);
                getDataDetailExchange();
              }
            }}
          />
        </div>
      </div>
      <div className={`${isBroadly ? "wrapper-extend" : "d-none"}`}>
        <InfoConversation data={dataMailbox} />
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
