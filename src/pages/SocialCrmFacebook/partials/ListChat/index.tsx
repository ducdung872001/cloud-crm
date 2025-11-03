import React, { Fragment, useEffect, useRef, useState } from "react";
import moment from "moment";
import { IListChatProps } from "model/fanpageFacebook/PropsModel";
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
import Tippy from "@tippyjs/react";

export default function ListChat(props: IListChatProps) {
  const { dataFanpageDialog, tab, onClick } = props;

  const messageEndRef = useRef<HTMLDivElement>(null);

  const [listFanpageChat, setListFanpageChat] = useState<IFanpageChatResponse[]>([]);
  const [showBottomBtn, setShowBottomBtn] = useState<boolean>(false);
  const [pageChat, setPageChat] = useState<number>(1);
  const [hasMoreChat, setHasMoreChat] = useState<boolean>(false);
  const [calculatorHeight, setCalculatorHeight] = useState<number>(0);
  const [paramsFanpageChat, setParamsFanpageChat] = useState<IFanpageChatFilterRequest>({
    limit: 10,
  });

  useEffect(() => {
    if (dataFanpageDialog && tab.name == "tab_one") {
      setParamsFanpageChat({ ...paramsFanpageChat, fanpageId: dataFanpageDialog._fanpage_id, profileId: dataFanpageDialog._profile_id, page: 1 });
      setPageChat(1);
    }
  }, [dataFanpageDialog, tab.name]);

  useEffect(() => {
    if (pageChat > 1) {
      setParamsFanpageChat({ ...paramsFanpageChat, page: pageChat });
    }
  }, [pageChat]);

  const getListFanpageChat = async (paramsSearch: IFanpageChatFilterRequest) => {
    const response = await FanpageFacebookService.listFanpageChat(paramsSearch);

    if (response.code === 0) {
      const result = response.result.messages?.items;
      const totalItem = response.result.messages.total;
      setHasMoreChat((pageChat - 1) * 10 + (result.length || 0) < totalItem);

      const newData = pageChat == 1 ? [] : listFanpageChat;

      (result || []).map((item) => {
        newData.unshift(item);
      });

      setListFanpageChat(newData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (paramsFanpageChat && (paramsFanpageChat?.fanpageId || paramsFanpageChat?.profileId)) {
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

  return (
    <Fragment>
      {dataFanpageDialog && listFanpageChat && listFanpageChat.length > 0 ? (
        <Fragment>
          <div className="header__chat">
            {/* <div className="avatar-account">
              <Image src={dataFanpageDialog.avatar} imageError={ImageThirdGender} alt={dataFanpageDialog.name} />
            </div>
            <h3>{dataFanpageDialog.name}</h3> */}

              <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
                <div className="avatar-account">
                  <Image src={dataFanpageDialog.avatar} imageError={ImageThirdGender} alt={dataFanpageDialog.name} />
                </div>
                  <h3>{dataFanpageDialog.name}</h3>
              </div>  

              <Tippy content='Thêm vào danh sách khách hàng'>
                <div 
                  onClick={onClick}
                  style={{cursor: "pointer"}}
                >
                  <Icon name='UserAdd' style={{fill: '#1bc10d', width: 30, height: 30}} />
                </div>
              </Tippy>
          </div>

          <div className="box__chat">
            <div className="list__chats" onScroll={handleScroll} style={{ maxHeight: `${44 - calculatorHeight}rem` }}>
              {listFanpageChat.map((item, idx) => {
                return (
                  <div key={idx} className={`item-chat ${item.senderId === item._fanpage_id ? "item__chat--right" : "item__chat--left"}`}>
                    <div className={`${item.senderId !== item._fanpage_id ? "avatar-user" : "d-none"}`}>
                      <Image src={item.senderAvatar} imageError={ImageThirdGender} alt={item.senderName} />
                    </div>

                    {item.senderId !== item._fanpage_id ? (
                      <div className="info__user">
                        <h5>{item.senderName}</h5>
                        <p className="desc__content">{item.content}</p>
                        <span className="time-chat">{moment(item.publishedTime).format("HH:mm")}</span>
                      </div>
                    ) : (
                      <div className="info__owner">
                        <p
                          className={`desc__content ${
                            item.content.endsWith(".png") || item.content.endsWith(".jpg") || item.content.endsWith(".jpeg") ? "d-none" : ""
                          }`}
                        >
                          {item.content}
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
                          {moment(item.createdTime).format("HH:mm")} {item.senderId === item._fanpage_id ? <Icon name="Checked" /> : ""}
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
                    getListFanpageChat(paramsFanpageChat);
                  }
                }}
              />
            </div>

            <div className={`${pageChat > 1 && showBottomBtn ? "btn-to-bottom" : "d-none"}`}>
              <div className="icon-position icon-style" onClick={goToBottom}>
                <Icon name="ChevronDown" />
              </div>
            </div>
          </div>
        </Fragment>
      ) : (
        <div className="notify-chatbot">
          <div className="image-chatbot">
            <img src={NoImageChatBot} alt="" />
          </div>
          <h2>Chào mừng bạn đến với tính năng chat qua fanpage của Reborn !</h2>
        </div>
      )}
    </Fragment>
  );
}
