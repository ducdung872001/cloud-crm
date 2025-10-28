import React, { Fragment, useEffect, useRef, useState } from "react";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { IListChatProps, IListChatZaloProps } from "model/fanpageFacebook/PropsModel";
import { IFanpageChatResponse } from "model/fanpageFacebook/FanpageResponseModel";
import { IFanpageChatFilterRequest } from "model/fanpageFacebook/FanpageFacebookRequestModel";
import Icon from "components/icon";
import Image from "components/image";
import Fancybox from "components/fancybox/fancybox";
import { showToast, handleDownload } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import NoImageChatBot from "assets/images/img-no-chatbot.png";
import FanpageFacebookService from "services/FanpageFacebookService";
import MessageChat from "../MessageChat/MessageChat";
import "./index.scss";
import { IZaloChatFilterRequest } from "model/zaloOA/ZaloOARequest";
import ZaloOAService from "services/ZaloOAService";
import { IZaloChatResponse } from "model/zaloOA/ZaloOAResponse";

export default function ListChat(props: IListChatZaloProps) {
  const { dataFanpageDialog, onClick } = props;
  console.log("dataFanpageDialog", dataFanpageDialog?.id);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const [listFanpageChat, setListFanpageChat] = useState<IZaloChatResponse[]>([]);
  const [showBottomBtn, setShowBottomBtn] = useState<boolean>(false);
  const [pageChat, setPageChat] = useState<number>(1);
  const [hasMoreChat, setHasMoreChat] = useState<boolean>(false);
  const [calculatorHeight, setCalculatorHeight] = useState<number>(0);
  const [paramsFanpageChat, setParamsFanpageChat] = useState<IZaloChatFilterRequest>({
    limit: 10,
  });

  useEffect(() => {
    if (dataFanpageDialog) {
      setParamsFanpageChat({ ...paramsFanpageChat, oaId: dataFanpageDialog.oaId, userId: dataFanpageDialog.userId, page: 1 });
      setPageChat(1);
      setSocket(null);
    }
  }, [dataFanpageDialog]);

  useEffect(() => {
    if (pageChat > 1) {
      setParamsFanpageChat({ ...paramsFanpageChat, page: pageChat });
    }
  }, [pageChat]);

  const getListFanpageChat = async (paramsSearch: IZaloChatFilterRequest) => {
    ///data thật
    const response = await ZaloOAService.listZaloChat(paramsSearch);

    if (response.code === 0) {
      const result = response.result?.items;
      const totalItem = response.result.total;
      setHasMoreChat((pageChat - 1) * 10 + (result.length || 0) < totalItem);

      const newData = pageChat == 1 ? [] : listFanpageChat;

      (result || []).map((item) => {
        newData.unshift(item);
      });

      setListFanpageChat(newData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    //data fake

    //   setListFanpageChat([
    //     {
    //     id: 123,
    //     messageId: '123',
    //     src: 12,
    //     publishedTime:  new Date(),
    //     type: 'chat',
    //     message: 'xin chao moi nguoi',
    //     attachments: '',
    //     fromId: '123',
    //     toId: '234',
    //     fromDisplayName: 'trung nguyen',
    //     fromAvatar: '',
    //     toDisplayName: 'Tung',
    //     toAvatar: '',
    //     createdTime: new Date(),
    //     userIdByApp: '123',
    //   }
    // ])
  };

  useEffect(() => {
    if (paramsFanpageChat && (paramsFanpageChat?.oaId || paramsFanpageChat?.userId)) {
      getListFanpageChat(paramsFanpageChat);
    }
  }, [paramsFanpageChat]);

  // đoạn này là sử lí code luôn luôn cuộn xuống dưới mỗi khi mình có tin nhắn mới
  const scrollToLastMessage = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (pageChat == 1) {
      scrollToLastMessage();
    }
  }, [listFanpageChat, pageChat]);

  // xử lý cuộn lên thì call API
  const handleScroll = (e) => {
    const scrollTop = Math.round(e.target.scrollTop || 0);

    if (scrollTop === 0 && hasMoreChat) {
      setPageChat((prevState) => prevState + 1);
      setShowBottomBtn(true);
    }
  };

  //! đoạn này xử lý vấn đề lấy height của thẻ textarea để tính toán lại chiều cao
  const takeHeightTextarea = (height) => {
    if (height > 1 && height < 6) {
      const result = height * 2;
      setCalculatorHeight(result);
    } else if (height >= 6) {
      setCalculatorHeight(14);
    } else {
      setCalculatorHeight(0);
    }
  };

  //! đoạn này xử lý vấn đề nếu là page 2 thì ấn vào nút tự động cuộn xuống page 1
  const goToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // setShowBottomBtn(false);
  };

  //////////////////Socket ////////////////////////////////////////
  const [socket, setSocket] = useState(null);
  // console.log('socket', socket);

  const connectSocket = (id) => {
    // console.log('id', id);

    if (socket == null) {
      console.log("socket is null");
    } else {
      console.log("socket state =>");
    }
    if (id && (socket === null || socket.readyState == WebSocket.CLOSED)) {
      console.log("luong vao");
      setSocket(new WebSocket(`wss://cloud.reborn.vn/chat/ws/zalo/${id}`));
    }
  };

  useEffect(() => {
    if (socket != null) {
      console.log("socket.readyState", socket?.readyState, WebSocket.OPEN); //WebSocket.OPEN, WebSocket.CLOSED, WebSocket.CONNECTING, WebSocket.CLOSING
      // socket.onopen = () => {
      //     console.log('open');
      // };

      socket.onmessage = (e) => {
        const _data = JSON.parse(e.data);
        console.log("dataSocket", _data);
        const newData = [...listFanpageChat];
        // console.log('listFanpageChat', listFanpageChat);

        newData.push(_data);
        setListFanpageChat(newData);
        // dispatch(socialScreenActions.actions.addChatZalo(_data))
      };

      socket.onerror = (e) => {
        // an error occurred
        console.log("error", e);
      };

      socket.onclose = (e) => {
        // connection closed
        console.log("Onclose", e.code, e.reason);
      };
    }
  }, [socket, dataFanpageDialog?.id, listFanpageChat]);

  useEffect(() => {
    connectSocket(dataFanpageDialog?.id);
    return () => {
      console.log("close socket 1");
      if (socket != null && socket.readyState == WebSocket.OPEN) {
        console.log("close socket 2");
        socket.close();
      }
    };
  }, [socket, dataFanpageDialog?.id]);

  return (
    <Fragment>
      {/* {dataFanpageDialog && listFanpageChat && listFanpageChat.length > 0 ? ( */}
      {dataFanpageDialog ? (
        <Fragment>
          <div className="header__chat">
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <div className="avatar-account">
                <Image src={dataFanpageDialog.avatar} imageError={ImageThirdGender} alt={dataFanpageDialog.name} />
              </div>
              <h3>{dataFanpageDialog.displayName}</h3>
            </div>

            <Tippy content="Thêm vào danh sách khách hàng">
              <div onClick={onClick} style={{ cursor: "pointer" }}>
                <Icon name="UserAdd" style={{ fill: "#1bc10d", width: 30, height: 30 }} />
              </div>
            </Tippy>
          </div>
          <div className="box__chat">
            <div className="list__chats" onScroll={handleScroll} style={{ maxHeight: `${44 - calculatorHeight}rem` }}>
              {listFanpageChat.map((item, idx) => {
                return (
                  <div key={idx} className={`item-chat ${item?.fromId === dataFanpageDialog.oaId ? "item__chat--right" : "item__chat--left"}`}>
                    <div className={`${item?.fromId !== dataFanpageDialog.oaId ? "avatar-user" : "d-none"}`}>
                      <Image src={item.fromAvatar || dataFanpageDialog.avatar} imageError={ImageThirdGender} alt={item.fromDisplayName} />
                    </div>

                    {item?.fromId !== dataFanpageDialog.oaId ? (
                      <div className="info__user">
                        <h5>{item.fromDisplayName}</h5>
                        <p className="desc__content">{item.message}</p>
                        <span className="time-chat">{moment(item.publishedTime).format("HH:mm")}</span>
                      </div>
                    ) : (
                      <div className="info__owner">
                        <p
                          className={`desc__content ${
                            item.message?.endsWith(".png") || item.message?.endsWith(".jpg") || item.message?.endsWith(".jpeg") ? "d-none" : ""
                          }`}
                        >
                          {item.message}
                        </p>
                        <div className={`${item.attachments ? "avatar__content" : "d-none"}`}>
                          {JSON.parse(item.attachments || "[]").map((el, index) => {
                            return (
                              <Fancybox
                                key={index}
                                options={{
                                  Carousel: {
                                    infinite: true,
                                  },
                                }}
                              >
                                <a data-fancybox="gallery" data-src={el?.payload?.url}>
                                  <Image src={el?.payload?.url} alt="" onClick={(e) => handleDownload(e.target.src, "download")} />
                                </a>
                              </Fancybox>
                            );
                          })}
                        </div>
                        <span className="time-chat">
                          {moment(item.createdTime).format("HH:mm")} {item.fromId === dataFanpageDialog.oaId ? <Icon name="Checked" /> : ""}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            <div className="content__chats">
              <MessageChat
                data={dataFanpageDialog}
                takeHeightTextarea={takeHeightTextarea}
                onHide={(reload) => {
                  if (reload) {
                    setPageChat(1);
                    connectSocket(dataFanpageDialog?.id);
                    // getListFanpageChat(paramsFanpageChat);
                  }
                }}
              />
            </div>

            {/* <div className={`${pageChat > 1 && showBottomBtn ? "btn-to-bottom" : "d-none"}`}>
              <div className="icon-position icon-style" onClick={goToBottom}>
                <Icon name="ChevronDown" />
              </div>
            </div> */}
          </div>
        </Fragment>
      ) : (
        <div className="notify-chatbot">
          <div className="image-chatbot">
            <img src={NoImageChatBot} alt="" />
          </div>
          <h2>Chào mừng bạn đến với tính năng chat qua Zalo của Reborn !</h2>
        </div>
      )}
    </Fragment>
  );
}
