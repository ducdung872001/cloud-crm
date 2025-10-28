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
import ContentFeedback from "./partials/ContentFeedback";
import { handDownloadFileOrigin, showToast } from "utils/common";
import "./index.scss";

export default function ChatFeedback() {
  const messageEndRef = useRef(null);

  const refContainerStatus = useRef();
  const refStatus = useRef();
  const refContainerChat = useRef();
  const refEditChat = useRef();

  const { setIsShowFeedback } = useContext(UserContext) as ContextType;
  const [activeStatus, setActiveStatus] = useState<number>(0);
  const [isChangeStatus, setIsChangeStatus] = useState<boolean>(false);
  const [isUnmount, setIsUnmount] = useState<boolean>(false);

  const [params, setParams] = useState({
    page: 1,
    limit: 10,
  });

  const [lstFeedback, setLstFeedback] = useState([]);
  const [dataFeedback, setDataFeedback] = useState(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditChat, setIsEditChat] = useState<boolean>(false);
  const [idFeedback, setIdFeedback] = useState(0);

  const lstStatus = [
    {
      label: "Tất cả",
      value: 0,
    },
    {
      label: "Đang xử lý",
      value: 1,
    },
    {
      label: "Đã xử lý",
      value: 2,
    },
  ];

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

    const response = await FeedbackService.list(changeParams);

    if (response.code === 0) {
      const result = response.result;
      setHasMore((params.page - 1) * 10 + (result.items.length || 0) < result.total);

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
  }, [params, activeStatus]);

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

  return (
    <div className="chat__feedback">
      <div className="chat__feedback--header">
        <div className="header__left" ref={refContainerStatus} onClick={() => setIsChangeStatus(!isChangeStatus)}>
          <div className="title__feedback">
            <span className="name">Góp ý cải tiến cho Reborn</span>
            <span className="status">
              {lstStatus.find((item) => item.value === activeStatus).label} <Icon name="ChevronDown" />
            </span>
          </div>
          {isChangeStatus && (
            <ul className="box__lst--status--feedback" ref={refStatus}>
              {lstStatus.map((item, idx) => {
                return (
                  <li
                    key={idx}
                    className={`item__status--feedback ${item.value === activeStatus ? "active__status" : ""}`}
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
          )}
        </div>
        <div className="header__right">
          <span className="action__hide" onClick={() => setIsShowFeedback(false)}>
            <Icon name="Times" />
          </span>
        </div>
      </div>
      <div className="chat__feedback--body">
        {lstFeedback && lstFeedback.length > 0 && (
          <div className="lst__content--feedback" key={lstFeedback.length} onScroll={handleScroll}>
            {lstFeedback.map((item, idx) => {
              return (
                <div key={idx} className="item__content--feedback">
                  

                  <div className="desc__content">
                    <div
                      className="desc__content--right"
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
                    </div>
                    <div className="desc__content--left">
                      <div className="--content">
                        <div className="content-res">{item.medias && item.medias.length > 0 ? boxContentMedia(item) : item.content}</div>
                      </div>
                      <span className="time-content">
                        {moment(item.createdTime).format("HH:mm")} <Icon name="Checked" />
                      </span>
                    </div>

                    
                  </div>
                  <div className="avatar-feedback">
                    <img src={ThirdGender} alt="" />
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
                Bạn có vấn đề cần góp ý cho <strong>Reborn</strong> hãy nhắn bên dưới nhé !
              </h2>
            </div>
          </div>
        )}
      </div>
      <div className="chat__feedback--footer">
        <ContentFeedback
          data={dataFeedback}
          onHide={(reload) => {
            if (reload) {
              dataFeedback ? handleGetFeedback(params) : setParams({ ...params, page: 1 });
              setDataFeedback(null);
              setIsUnmount(true);
            }
          }}
        />
      </div>
    </div>
  );
}
