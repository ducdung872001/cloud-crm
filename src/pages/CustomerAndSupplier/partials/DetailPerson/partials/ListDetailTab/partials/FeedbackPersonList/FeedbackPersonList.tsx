import React, { Fragment, useState, useEffect, useContext, useRef } from "react";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IFeedbackPersonListProps } from "model/customer/PropsModel";
import { ICustomerFeedbackResponseModel } from "model/customer/CustomerResponseModel";
import { ICustomerFeedbackFilterRequest } from "model/customer/CustomerRequestModel";
import CustomerService from "services/CustomerService";
import { ContextType, UserContext } from "contexts/userContext";
import ThirdGender from "assets/images/third-gender.png";
import ImageExcel from "assets/images/img-excel.png";
import ImageWord from "assets/images/img-word.png";
import ImagePowerPoint from "assets/images/img-powerpoint.png";
import ImagePdf from "assets/images/img-pdf.png";
import { useOnClickOutside } from "utils/hookCustom";
import { showToast } from "utils/common";
import MessageChatFeedbackPerson from "./partials/MessageChatFeedbackPerson";
import "./FeedbackPersonList.scss";
import Fancybox from "components/fancybox/fancybox";
import Image from "components/image";

export default function FeedbackPersonList(props: IFeedbackPersonListProps) {
  const { idCustomer } = props;

  const refEditChat = useRef();
  const refContainerChat = useRef();
  const messageEndRef = useRef(null);

  const { id } = useContext(UserContext) as ContextType;

  const [listFeedback, setListFeedback] = useState<ICustomerFeedbackResponseModel[]>([]);
  const [dataFeedback, setDataFeedback] = useState<ICustomerFeedbackResponseModel>(null);
  const [idDetailFeedback, setIdDetailFeedback] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditChat, setIsEditChat] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  useOnClickOutside(refEditChat, () => setIsEditChat(false), ["option-action-chat"]);

  const getListFeedback = async (pageProps?: number) => {
    const params: ICustomerFeedbackFilterRequest = {
      customerId: idCustomer,
      type: 2,
      page: pageProps ? pageProps : page,
      limit: 10,
    };

    const response = await CustomerService.customerExchangeList(params);

    if (response.code === 0) {
      const result = response.result.items;
      const totalItem = response.result.total;
      setHasMore((page - 1) * 10 + (result.length || 0) < totalItem);

      const newData = pageProps || page == 1 ? [] : listFeedback;

      (result || []).map((item) => {
        newData.unshift(item);
      });

      setListFeedback(newData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (idCustomer && page) {
      getListFeedback();
    }
  }, [idCustomer, page]);

  // đoạn này là sử lí code luôn luôn cuộn xuống dưới mỗi khi mình có tin nhắn mới
  const scrollToLastMessage = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (page === 1) {
      scrollToLastMessage();
    }
  });

  // xóa đi một tin nhắn trò chuyện
  const onRemoveChat = async (id) => {
    if (!id) return;

    const response = await CustomerService.customerExchangeDelete(id);

    if (response.code === 0) {
      showToast("Xóa tin nhắn thành công", "success");
      getListFeedback();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item) => {
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

  // xử lý cuộn lên thì call API
  const handleScroll = (e) => {
    const scrollTop = Math.round(e.target.scrollTop || 0);

    if (scrollTop === 0 && hasMore) {
      setPage((prevState) => prevState + 1);
    }
  };

  const viewContentMedia = (data) => {
    const medias = data.medias;

    return (
      <div className="wrapper__content--media">
        <div className="info__media">
          {medias &&
            medias.length > 0 &&
            medias.map((media, idx) => {
              return (
                <div key={idx} className="item--media">
                  {media.type === "image" ? (
                    // <div className="__media--image">
                    //   <img src={media.url} alt={data.content} />
                    //   <a href={media.url} download rel="noopener noreferrer" target="_blank" className="action__download--image">
                    //     Tải xuống
                    //   </a>
                    // </div>
                    <Fancybox>
                      <a key={media.id} data-fancybox="gallery" data-download-src={media.url} href={media.url}>
                        <Image src={media.url} alt={data.content} width={"64rem"} />
                      </a>
                    </Fancybox>
                  ) : media.type === "video" ? (
                    <video controls>
                      <source src={media.url} />
                    </video>
                  ) : (
                    <div className="img-document">
                      <div className="info-document">
                        <div className="__avatar">
                          <img
                            src={
                              media.type == "pdf" ? ImagePdf : media.type == "xlsx" ? ImageExcel : media.type == "docx" ? ImageWord : ImagePowerPoint
                            }
                            alt={data.content}
                          />
                        </div>
                        <div className="__detail">
                          <span className="name-document">{media?.fileName}</span>
                        </div>
                      </div>

                      <div className="action-download">
                        <a href={media.url} download>
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
    <div className="wrapper-feedback">
      <div className="info__feedback">
        <div className="info__feedback--body">
          {listFeedback && listFeedback.length > 0 && (
            <CustomScrollbar width="100%" height="52rem" handleScroll={handleScroll}>
              <div className="content-chat">
                {listFeedback.map((item, idx) => (
                  <div key={idx} className={`${item.employeeUserId === id ? "content__item--right" : "content__item--left"}`}>
                    <img
                      src={item.employeeAvatar ? item.employeeAvatar : ThirdGender}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.onerror = null; // Ngăn lặp vô hạn nếu ảnh mặc định cũng lỗi
                        e.currentTarget.src = ThirdGender; // Thay thế bằng ảnh mặc định
                      }}
                    />
                    <div className="info__content">
                      <div className="info__content--left">
                        <span className="username-person">{item.employeeUserId === id ? "" : item.employeeName}</span>
                        <div className="box__conversation--exchange">{item.medias ? viewContentMedia(item) : item.content}</div>
                      </div>
                      <div className="info__content--right">
                        <span className="time-content">
                          {moment(item.createdTime).format("HH:mm")} {item.employeeUserId === id ? <Icon name="Checked" /> : ""}
                        </span>
                      </div>
                      <div
                        className="option-action-chat"
                        onClick={() => {
                          setIsEditChat(!isEditChat);
                          setIdDetailFeedback(item.id);
                        }}
                        ref={refContainerChat}
                      >
                        <Icon name="ThreeDotVertical" />
                      </div>
                      {isEditChat && item.id === idDetailFeedback && (
                        <ul className={`menu-action-chat`} ref={refEditChat}>
                          <li
                            className="edit-chat-item"
                            onClick={() => {
                              setIsEditChat(false);
                              setDataFeedback(item);
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
            </CustomScrollbar>
          )}
          {/* đoạn này liên quan đến life của component thui */}
          {isLoading && page == 1 && <Loading />}

          {!isLoading && listFeedback.length === 0 && (
            <div className="message-notification">
              <h2>Bạn chưa có ý kiến khách hàng nào!</h2>
            </div>
          )}
        </div>
        <div className="info__feedback--footer">
          <MessageChatFeedbackPerson
            idCustomer={idCustomer}
            dataFeedback={dataFeedback}
            onReload={(reload) => {
              if (reload) {
                setPage(1);
                getListFeedback(1);
                scrollToLastMessage();
              }
            }}
          />
        </div>
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
