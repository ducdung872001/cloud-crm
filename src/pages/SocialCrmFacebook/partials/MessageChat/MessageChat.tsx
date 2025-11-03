import React, { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import HeadlessTippy from "@tippyjs/react/headless";
import { IMessageChatProps } from "model/fanpageFacebook/PropsModel";
import Icon from "components/icon";
import { showToast } from "utils/common";
import FanpageFacebookService from "services/FanpageFacebookService";
import EmojiChat from "./partials/EmojiChat/EmojiChat";
import { IReplyFanpageChatRequest } from "model/fanpageFacebook/FanpageFacebookRequestModel";
import "./MessageChat.scss";

export default function MessageChat(props: IMessageChatProps) {
  const { data, onHide, takeHeightTextarea } = props;

  const refTextarea = useRef<HTMLTextAreaElement>(null);

  const [showModalOption, setShowModalOption] = useState<boolean>(false);
  const [showEmojiChat, setShowEmojiChat] = useState<boolean>(false);
  const [loadingSend, setLoadingSend] = useState<boolean>(false);
  const [totalHeight, setTotalHeight] = useState<number>(1);
  const [optionUploadFile] = useState([
    {
      icon: <Icon name="Document" />,
      name: "Tài liệu",
      is_show: false,
      action: 1,
    },
    {
      icon: <Icon name="Image" />,
      name: "Ảnh hoặc video",
      is_show: false,
      action: 2,
    },
  ]);

  const [messageChat, setMessageChat] = useState<IReplyFanpageChatRequest>({
    content: "",
    _fanpage_id: data?._fanpage_id,
    receiverId: data?._profile_id,
  });

  useEffect(() => {
    setMessageChat({ ...messageChat, _fanpage_id: data?._fanpage_id, receiverId: data?._profile_id, content: "" });
  }, [data]);

  const onClickOutside = () => {
    setShowModalOption(false);
  };

  // call api khi click vào icon send
  const handleSendChat = async (e) => {
    e.preventDefault();

    setLoadingSend(true);

    const body: IReplyFanpageChatRequest = {
      ...(messageChat as IReplyFanpageChatRequest),
    };

    const response = await FanpageFacebookService.replyFanpageChat(body);

    if (response.code === 0) {
      setMessageChat({ ...messageChat, content: "" });
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setLoadingSend(false);
  };

  // call api khi ấn nút enter trên bàn phím khi nhập nội dung
  const handleEnterSendChat = async () => {
    if (messageChat.content) {
      setLoadingSend(true);

      const body: IReplyFanpageChatRequest = {
        ...(messageChat as IReplyFanpageChatRequest),
      };

      const response = await FanpageFacebookService.replyFanpageChat(body);

      if (response.code === 0) {
        setMessageChat({ ...messageChat, content: "" });
        onHide(true);
        setTotalHeight(1);
        takeHeightTextarea(0);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }

      setLoadingSend(false);
    }
  };

  const handleOnKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEnterSendChat();
    }
  };

  useEffect(() => {
    if (!messageChat.content) {
      takeHeightTextarea(0);
    }
  }, [messageChat.content]);

  //! đoạn này xử lý vấn đề thay đổi nội dung
  const handleChangeValueContent = (e) => {
    const value = e.target.value;

    if (!value.startsWith(" ")) {
      setMessageChat({ ...messageChat, content: value });
    }
  };

  //! đoạn này xử lý vấn đề thay đổi chiều cao của nội dung
  const handleOnInput = () => {
    const textarea = refTextarea.current;
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
    const numLines = Math.round(textarea.scrollHeight / lineHeight);
    setTotalHeight(numLines);
  };

  useLayoutEffect(() => {
    refTextarea.current.style.height = "inherit";
    // Set height
    refTextarea.current.style.height = messageChat.content.length >= 73 ? `${Math.max(refTextarea.current.scrollHeight, 34)}px` : "34px";

    if (totalHeight > 1 && totalHeight < 6) {
      takeHeightTextarea(totalHeight);
    } else if (totalHeight >= 6) {
      takeHeightTextarea(6);
    } else {
      refTextarea.current.style.height = "34px";
      takeHeightTextarea(0);
    }
  }, [totalHeight, messageChat.content]);

  return (
    <Fragment>
      <div className="message-chat">
        <div className={`icon-emotion ${showEmojiChat ? "isShowEmotion" : ""}`}>
          <Icon name="Happy" onClick={() => setShowEmojiChat(!showEmojiChat)} />
          <EmojiChat
            onShow={showEmojiChat}
            dataMessage={messageChat}
            setDataMessage={setMessageChat}
            onHide={() => {
              setShowEmojiChat(false);
            }}
          />
        </div>
        <div className="content-message">
          <textarea
            ref={refTextarea}
            placeholder="Soạn tin"
            value={messageChat.content}
            autoFocus={true}
            className="desc-message"
            onKeyDown={handleOnKeyDown}
            onInput={handleOnInput}
            onChange={(e) => handleChangeValueContent(e)}
          />
        </div>
        <div className={`file-document ${showModalOption ? "active" : ""}`}>
          <HeadlessTippy
            interactive
            visible={showModalOption}
            render={(attrs) => (
              <div className="popover-option" {...attrs}>
                <ul className="menu-item">
                  {optionUploadFile.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setShowModalOption(item.is_show);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="icon-item">{item.icon}</span>
                      <span className="title-item">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            offset={[0, 18]}
            onClickOutside={onClickOutside}
          >
            <span className="icon-attach--file" onClick={() => setShowModalOption(!showModalOption)}>
              <Icon name="AttachFile" />
            </span>
          </HeadlessTippy>
        </div>
        <div className={`${messageChat.content ? "active__send--message" : "hide__send--message"}`} onClick={(e) => handleSendChat(e)}>
          {loadingSend ? <Icon name="Refresh" className="icon-refresh" /> : <Icon name="Send" />}
        </div>
      </div>
    </Fragment>
  );
}
