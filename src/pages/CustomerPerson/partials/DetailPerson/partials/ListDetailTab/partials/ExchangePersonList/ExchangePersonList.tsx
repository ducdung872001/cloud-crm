import React, { Fragment, useState, useEffect, useContext, useRef } from "react";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IExchangePersonListProps } from "model/customer/PropsModel";
import { ICustomerExchangeFilterRequest } from "model/customer/CustomerRequestModel";
import { ICustomerExchangeResponseModel } from "model/customer/CustomerResponseModel";
import CustomerService from "services/CustomerService";
import { ContextType, UserContext } from "contexts/userContext";
import ThirdGender from "assets/images/third-gender.png";
import ImageExcel from "assets/images/img-excel.png";
import ImageWord from "assets/images/img-word.png";
import ImagePowerPoint from "assets/images/img-powerpoint.png";
import ImagePdf from "assets/images/img-pdf.png";
import { useOnClickOutside } from "utils/hookCustom";
import { showToast } from "utils/common";
import MessageChatExchangePerson from "./partials/MessageChatExchangePerson";
import "./ExchangePersonList.scss";
import Fancybox from "components/fancybox/fancybox";
import Image from "components/image";

export default function ExchangePersonList(props: IExchangePersonListProps) {
  const { idCustomer } = props;

  const refEditChat = useRef();
  const refContainerChat = useRef();
  const messageEndRef = useRef(null);

  const { id } = useContext(UserContext) as ContextType;

  const [listExchange, setListExchange] = useState<ICustomerExchangeResponseModel[]>([]);
  const [dataExchange, setDataExchange] = useState<ICustomerExchangeResponseModel>(null);
  const [idDetailExchange, setIdDetailExchange] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditChat, setIsEditChat] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  useOnClickOutside(refEditChat, () => setIsEditChat(false), ["option-action-chat"]);

  const getListExchange = async (pageProps?: number) => {
    const params: ICustomerExchangeFilterRequest = {
      customerId: idCustomer,
      type: 1,
      page: pageProps ? pageProps : page,
      limit: 10,
    };

    const response = await CustomerService.customerExchangeList(params);

    if (response.code === 0) {
      const result = response.result.items;
      const totalItem = response.result.total;
      setHasMore((page - 1) * 10 + (result.length || 0) < totalItem);

      const newData = pageProps || page == 1 ? [] : listExchange;

      (result || []).map((item) => {
        newData.unshift(item);
      });

      setListExchange(newData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (idCustomer && page) {
      getListExchange();
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
      getListExchange();
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
    <div className="wrapper-exchange">
      <div className="info__exchange">
        <div className="info__exchange--body">
          {listExchange && listExchange.length > 0 && (
            <div className="wrapper__content--chat-message" onScroll={handleScroll}>
              <div className="content-chat">
                {listExchange.map((item, idx) => (
                  <div key={idx} className={`${item.employeeUserId === id ? "content__item--right" : "content__item--left"}`}>
                    <img src={item.employeeAvatar ? item.employeeAvatar : ThirdGender} alt="" />
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
                          setIdDetailExchange(item.id);
                        }}
                        ref={refContainerChat}
                      >
                        <Icon name="ThreeDotVertical" />
                      </div>
                      {isEditChat && item.id === idDetailExchange && (
                        <ul className={`menu-action-chat`} ref={refEditChat}>
                          <li
                            className="edit-chat-item"
                            onClick={() => {
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
            </div>
          )}
          {isLoading && page == 1 && <Loading />}

          {!isLoading && listExchange.length === 0 && (
            <div className="message-notification--feedback">
              <h2>Bạn chưa có trao đổi nào!</h2>
            </div>
          )}
        </div>
        <div className="info__exchange--footer">
          <MessageChatExchangePerson
            idCustomer={idCustomer}
            dataExchange={dataExchange}
            onReload={(reload) => {
              if (reload) {
                setPage(1);
                getListExchange(1);
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
