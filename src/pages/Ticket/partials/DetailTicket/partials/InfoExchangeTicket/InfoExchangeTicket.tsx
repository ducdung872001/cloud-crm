import React, { Fragment, useState, useEffect, useContext, useRef } from "react";
import moment from "moment";
import Icon from "components/icon";
import Loading from "components/loading";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IInfoExchangeTicketProps } from "model/ticket/PropsModel";
import { ITicketExchangeListResponseModel } from "model/ticket/TicketResponseModel";
import { ITicketExchangeFilterRequestModel } from "model/ticket/TicketRequestModel";
import TicketService from "services/TicketService";
import { showToast } from "utils/common";
import ThirdGender from "assets/images/third-gender.png";
import { useOnClickOutside } from "utils/hookCustom";
import { ContextType, UserContext } from "contexts/userContext";
import MessageChatTicket from "./partials/MessageChatTicket";
import "./InfoExchangeTicket.scss";

export default function InfoExchangeTicket(props: IInfoExchangeTicketProps) {
  const { idTicket } = props;

  const refEditChat = useRef();
  const refContainerChat = useRef();
  const messageEndRef = useRef(null);

  const { id } = useContext(UserContext) as ContextType;

  const [listExchangeTicket, setListExchangeTicket] = useState<ITicketExchangeListResponseModel[]>([]);
  const [dataExchangeTicket, setDataExchangeTicket] = useState<ITicketExchangeListResponseModel>(null);
  const [idDetailExchange, setIdDetailExchange] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditChat, setIsEditChat] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  useOnClickOutside(refEditChat, () => setIsEditChat(false), ["option-action-chat"]);

  const params: ITicketExchangeFilterRequestModel = {
    ticketId: idTicket,
    page: page,
    limit: 10,
  };

  const getListExchangeTicket = async () => {
    setIsLoading(true);

    const response = await TicketService.ticketExchangeList(params);

    if (response.code === 0) {
      const result = response.result.lstTicketExchange;
      const totalItem = response.result.total;

      setHasMore((page - 1) * 10 + (result.length || 0) < totalItem);

      const newData = page == 1 ? [] : listExchangeTicket;

      (result || []).map((item) => {
        newData.unshift(item);
      });

      setListExchangeTicket(newData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getListExchangeTicket();
  }, [idTicket, page]);

  const scrollToLastMessage = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (page == 1) {
      scrollToLastMessage();
    }
  });

  // xóa đi một tin nhắn trò chuyện
  const onRemoveChat = async (id) => {
    const response = await TicketService.ticketExchangeDelete(id);

    if (response.code === 0) {
      showToast("Xóa tin nhắn thành công", "success");
      getListExchangeTicket();
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

  return (
    <div className="wrapper-info-exchange">
      <div className="info__exchange">
        <div className="info__exchange--header">
          <span className="title-exchange">Phản hồi</span>
        </div>
        <div className="info__exchange--body">
          {!isLoading && listExchangeTicket && listExchangeTicket.length > 0 ? (
            <CustomScrollbar width="100%" height="55rem" handleScroll={handleScroll}>
              <div className="content-chat">
                {listExchangeTicket.map((item, idx) => (
                  <div key={idx} className={`${item.userId === id ? "content__item--right" : "content__item--left"}`}>
                    <img src={item.employeeAvatar ? item.employeeAvatar : ThirdGender} alt="" />
                    <div className="info__content">
                      <div className="info__content--left">
                        <span className="username-person">{item.userId === id ? "" : item.employeeName}</span>
                        {item.content}
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
                        <ul className={`menu-action-chat`} ref={refEditChat}>
                          <li
                            className="edit-chat-item"
                            onClick={() => {
                              setIsEditChat(false);
                              setDataExchangeTicket(item);
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
          ) : isLoading ? (
            <Loading />
          ) : (
            <div className="message-notification">
              <h2>Bạn chưa có phản hồi nào!</h2>
            </div>
          )}
        </div>
        <div className="info__exchange--footer">
          <MessageChatTicket
            idTicket={idTicket}
            dataExchangeTicket={dataExchangeTicket}
            onReload={(reload) => {
              if (reload) {
                setPage(1);
                getListExchangeTicket();
              }
            }}
          />
        </div>
      </div>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
