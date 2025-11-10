import React, { useContext, useEffect, useRef, useState } from "react";
import moment from "moment";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import Fancybox from "components/fancybox/fancybox";
import { ContextType, UserContext } from "contexts/userContext";
import { useOnClickOutside } from "utils/hookCustom";
import ThirdGender from "assets/images/third-gender.png";
import Conversation from "assets/images/conversation.png";
import ImageExcel from "assets/images/img-excel.png";
import ImageWord from "assets/images/img-word.png";
import ImagePowerPoint from "assets/images/img-powerpoint.png";
import ImagePdf from "assets/images/img-pdf.png";
import FeedbackService from "services/FeedbackService";
import { handDownloadFileOrigin, showToast } from "utils/common";
import "./index.scss";
import ContentChat from "./partials/ContentChat";
import NoImageChatBot from "assets/images/img-no-chatbot.png";
import Tippy from "@tippyjs/react";
import ChatBotService from "services/ChatBotService";
import EmployeeService from "services/EmployeeService";

export default function ChatBot() {
  const messageEndRef = useRef(null);

  const refContainerStatus = useRef();
  const refStatus = useRef();
  const refContainerChat = useRef();
  const refEditChat = useRef();

  const { setIsShowChatBot, isShowChatBot, isShowFeedback, avatar } = useContext(UserContext) as ContextType;

  useEffect(() => {
    if(isShowFeedback){
      setIsShowChatBot(false);
    }
  }, [isShowFeedback])

  const [infoEmployee, setInfoEmployee] = useState(null);

  const getDetailEmployeeInfo = async () => {
    const response = await EmployeeService.info();

    if (response.code == 0) {
      const result = response.result;
      setInfoEmployee({
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        departmentName: result.departmentName,
        branchName: result.branchName,
      });
    }
  };

  useEffect(() => {
    if (isShowChatBot) {
      getDetailEmployeeInfo();
    }
  }, [isShowChatBot]);

  const [activeStatus, setActiveStatus] = useState<number>(0);
  const [isChangeStatus, setIsChangeStatus] = useState<boolean>(false);
  const [isUnmount, setIsUnmount] = useState<boolean>(false);

  const [params, setParams] = useState({
    page: 1,
    limit: 10,
  });

  const [lstFeedback, setLstFeedback] = useState([]);
  // console.log('lstFeedback', lstFeedback);
  
  const [dataFeedback, setDataFeedback] = useState(null);  
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditChat, setIsEditChat] = useState<boolean>(false);
  const [idFeedback, setIdFeedback] = useState(0);


  useOnClickOutside(refStatus, () => setIsChangeStatus(false), ["header__left"]);

  const scrollToLastMessage = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGetFeedback = async (paramSearch) => {
    setIsLoading(true);

    const changeParams = {
      ...paramSearch,
      status: activeStatus,
    };


    const response = await ChatBotService.list(paramSearch);
    // const response = await FeedbackService.list(changeParams);


    if (response.code === 0) {
      const result = response.result;
      // setHasMore((params.page - 1) * 10 + (result.items.length || 0) < result.total);

      const newDataExchange = params.page === 1 ? [] : lstFeedback;

      (result.items || []).map((item) => {
        newDataExchange.unshift(item);
      });

      setLstFeedback(newDataExchange);
    }

    setIsLoading(false);
    params.page === 1 && scrollToLastMessage();
  };

  useEffect(() => {    
    handleGetFeedback(params);
  }, [params, activeStatus, isShowChatBot]);

  // xóa đi một góp ý
  const onRemoveChat = async (id) => {
    if (!id) return;

    const response = await FeedbackService.delete(id);

    if (response.code === 0) {
      showToast("Xóa góp ý thành công", "success");
      handleGetFeedback(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  // function xử lý cuộn trang
  const handleScroll = (event) => {
    const scrollTop = Math.round(event.target.scrollTop || 0);

    if (scrollTop == 0 && hasMore) {
      // Tăng lên rồi gọi API
      setParams({ ...params, page: params.page + 1 });
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
                      <span className="__name--download">
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

    //! đoạn này xử lý kéo thả Element sau này nhiều chỗ dùng có thể tách thành 1 component
    function dragElement(elmnt) {
      if (!elmnt) return;
      let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
  
      if (document.getElementById(elmnt.id + "header")) {
        /* if present, the header is where you move the DIV from */
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
      } else {
        /* otherwise, move the DIV from anywhere inside the DIV */
        elmnt.onmousedown = dragMouseDown;
      }
  
      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }
  
      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
  
        // set the element's new position:
        elmnt.style.top = `${elmnt.offsetTop - pos2}px`;
        elmnt.style.left = `${elmnt.offsetLeft - pos1}px`;
      }
  
      function closeDragElement() {
        /* stop moving when mouse button is released */
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }
  
    useEffect(() => {
   
      dragElement(document.getElementById("mydiv"));
    }, []);

  return (
    <div>
        {isShowChatBot ? 
            <div className="chat__bot">
                {/* thẻ div này để tách biệt, không cho di chuyển hội thoại chat */}
                <div></div>
                <div className="chat__bot--header">
                    <div className="header__left" ref={refContainerStatus} onClick={() => setIsChangeStatus(!isChangeStatus)}>
                        <div className="title__bot">
                            <span className="name">Trợ lý ảo Reborn</span>
                            {/* <span className="status">
                                {lstStatus.find((item) => item.value === activeStatus).label} <Icon name="ChevronDown" />
                            </span> */}
                        </div>
                        {/* {isChangeStatus && (
                            <ul className="box__lst--status--bot" ref={refStatus}>
                                {lstStatus.map((item, idx) => {
                                    return (
                                        <li
                                            key={idx}
                                            className={`item__status--bot ${item.value === activeStatus ? "active__status" : ""}`}
                                            onClick={() => {
                                                setIsChangeStatus(false);
                                                setActiveStatus(item.value);
                                            }}
                                        >
                                            {item.label}
                                        </li>
                                    );
                                })}
                            </ul>
                        )} */}
                    </div>
                    <div className="header__right">
                        <span className="action__hide" 
                          onClick={() => {
                            setIsShowChatBot(false);
                            setParams({ page: 1, limit: 10});
                          }}
                        >
                            <Icon name="Times" />
                        </span>
                    </div>
                </div>
                <div className="chat__bot--body">
                    {lstFeedback && lstFeedback.length > 0 && (
                        <div className="lst__content--bot" key={lstFeedback.length} onScroll={handleScroll}>
                            {lstFeedback.map((item, idx) => {
                                return (
                                  item.role === 'user' ?
                                    <div key={idx} className="item__content--bot">
                                        <div className="desc__content__send">
                                            {/* <div
                                                className="desc__content__send--right"
                                                onClick={() => {
                                                    setIsEditChat(!isEditChat);
                                                    setIdFeedback(item.id);
                                                }}
                                                ref={refContainerChat}
                                                style={isEditChat && item.id === idFeedback ? { display: "block" } : {}}
                                                >
                                                <span className="icon__option">
                                                    <Icon name="ThreeDotVertical" />
                                                </span>

                                                {isEditChat && item.id === idFeedback && (
                                                    <ul className="lst__action" ref={refEditChat}>
                                                        <li
                                                            className="item__action--edit"
                                                            onClick={(e) => {
                                                            e && e.preventDefault();
                                                            setDataFeedback(item);
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
                                            </div> */}
                                            <div className="desc__content__send--left">
                                                <div className="--content">
                                                    <div className="content-res">{item.medias && item.medias.length > 0 ? boxContentMedia(item) : item.content}</div>
                                                </div>
                                                <span className="time-content">
                                                    {moment(item.createdTime).format("HH:mm")} <Icon name="Checked" />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="avatar-bot">
                                            <img src={avatar || ThirdGender} alt="" />
                                        </div>
                                    </div>
                                    :
                                    <div key={idx} className="item__content--bot">
                                        <div className="avatar-bot">
                                            <img src={NoImageChatBot} alt="" />
                                        </div>
                                        <div className="desc__content__receive">
                                            <div className="desc__content__receive--left">
                                                <div className="--content">
                                                    <div className="content-res">{item.medias && item.medias.length > 0 ? boxContentMedia(item) : item.content}</div>
                                                </div>
                                                <span className="time-content">
                                                    {moment(item.createdTime).format("HH:mm")} <Icon name="Checked" />
                                                </span>
                                            </div>
                                            {/* <div
                                                className="desc__content__receive--right"
                                                onClick={() => {
                                                    setIsEditChat(!isEditChat);
                                                    setIdFeedback(item.id);
                                                }}
                                                ref={refContainerChat}
                                                style={isEditChat && item.id === idFeedback ? { display: "block" } : {}}
                                                >
                                                <span className="icon__option">
                                                    <Icon name="ThreeDotVertical" />
                                                </span>

                                                {isEditChat && item.id === idFeedback && (
                                                    <ul className="lst__action" ref={refEditChat}>
                                                        <li
                                                            className="item__action--edit"
                                                            onClick={(e) => {
                                                            e && e.preventDefault();
                                                            setDataFeedback(item);
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
                                            </div> */}
                                        </div>
                                        
                                    </div>
                                );
                            })}
                            <div ref={messageEndRef} />
                        </div>
                    )}

                    {isLoading && params.page === 1 && (
                        <div className={isUnmount ? "d-none" : ""}>
                            <Loading />
                        </div>
                    )}

                    {!isLoading && lstFeedback.length === 0 && (
                        <div className="notify__no--exchange">
                            <div className="img__message">
                                <img src={Conversation} alt="Hình ảnh góp ý" />
                            </div>
                            <div className="no__content--message">
                                <h2>
                                    Bạn có vấn đề cần hỏi <strong>Reborn</strong> hãy nhắn bên dưới nhé !
                                </h2>
                            </div>
                        </div>
                    )}
                </div>
                <div className="chat__bot--footer">
                    <ContentChat
                        data={dataFeedback}
                        onHide={(reload, newMessage) => {
                          console.log('newMessage', newMessage);
                          
                            if (reload) {
                                dataFeedback ? handleGetFeedback(params) : setParams({ ...params, page: 1 });
                                // setLstFeedback(oldArray => [...oldArray, ...newMessage]);
                                // requestAnimationFrame(() => {
                                //   const container = messageEndRef.current;
                                //   if (container) {
                                //     container.scrollTop = container.scrollHeight;
                                //   }
                                // });
                                setDataFeedback(null);
                                setIsUnmount(true);
                            }
                        }}
                    />
                </div>
            </div>
            :
            <div style={{border: '1px solid', bottom: 0}}>
              <div 
                id= {isShowChatBot ? '' : "mydiv" }
                className="notify-chatbot-icon"
                onDoubleClick={() => {
                  setIsShowChatBot(true)
                }}
              >
                <Tippy content='Trợ lý ảo Reborn'>
                  <div className="image-chatbot-icon">
                      <img src={NoImageChatBot} alt="" />
                  </div>
                </Tippy>
              </div>
            </div>
            
            // <div 
            //   id="mydiv"
            //   className="chat__icon"
            //   onDoubleClick={() => {
            //       setIsShowChatBot(true)
            //   }}
            // >
            //   <div style={{display: 'flex'}}>
            //     <Tippy content='Chat bot'>
            //       <div className="notify-chatbot-icon">
            //           <div className="image-chatbot-icon">
            //               <img src={NoImageChatBot} alt="" />
            //           </div>
            //       </div>
            //     </Tippy>
            //     <span className="icon-minus">
            //       <Icon name="Minus" />
            //     </span>
            //   </div>
            // </div>
        }
    </div>
  );
}
