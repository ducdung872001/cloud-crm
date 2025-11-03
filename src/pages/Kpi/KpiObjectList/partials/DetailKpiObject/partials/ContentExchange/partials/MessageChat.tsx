import React, { Fragment, useEffect, useRef, useState } from "react";
import HeadlessTippy from "@tippyjs/react/headless";
import Icon from "components/icon";
import { showToast } from "utils/common";
import EmojiChat from "./EmojiChat/EmojiChat";
import "./MessageChat.scss";
import { IMessageChatKpiProps, IMessageChatkpiRequestModal } from "model/kpiObject/KpiObjectRequestModel";
import KpiObjectService from "services/KpiObjectService";

export default function MessageChat(props: IMessageChatKpiProps) {
  const { kotId, employeeId, takeHeightTextarea, onHide, dataMessage } = props;

  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const [showModalOption, setShowModalOption] = useState<boolean>(false);
  const [showEmojiChat, setShowEmojiChat] = useState<boolean>(false);
  const [loadingSend, setLoadingSend] = useState<boolean>(false);

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

  const [messageChat, setMessageChat] = useState<IMessageChatkpiRequestModal>({
    content: "",
    kotId: kotId,
  });

  useEffect(() => {
    if (employeeId) {
      setMessageChat({ ...messageChat, employeeId: employeeId });
    }
  }, [employeeId]);

  useEffect(() => {
    if (dataMessage) {
      setMessageChat({
        id: dataMessage.id,
        content: dataMessage.content,
        kotId: dataMessage.kotId,
        employeeId: dataMessage.employeeId,
      });
    }
  }, [dataMessage]);

  // call api khi click vào icon send
  const handleSendChat = async (e) => {
    e.preventDefault();

    if (!messageChat.content) return;

    setLoadingSend(true);

    const body: IMessageChatkpiRequestModal = {
      ...(messageChat as IMessageChatkpiRequestModal),
    };

    const response = await KpiObjectService.addKpiExchange(body);
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

      const body: IMessageChatkpiRequestModal = {
        ...(messageChat as IMessageChatkpiRequestModal),
      };

      const response = await KpiObjectService.addKpiExchange(body);

      if (response.code === 0) {
        setMessageChat({ ...messageChat, content: "" });
        onHide(true);
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

  const onClickOutside = () => {
    setShowModalOption(false);
  };

  const [heightTagTextarea, setHeightTagTextarea] = useState(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [textareaRef.current?.value]);

  const handleTextareaChange = (e) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
      setHeightTagTextarea(textareaRef.current.scrollHeight);
    }

    const value = e.target.value;
    setMessageChat({ ...messageChat, content: value });
  };

  useEffect(() => {
    if (heightTagTextarea) {
      takeHeightTextarea(heightTagTextarea);
    }
  }, [heightTagTextarea]);

  const handleChangeUpload = (e) => {
    e.preventDefault();
  };

  return (
    <Fragment>
      <div className="box__message--chat-exchange">
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
            ref={textareaRef}
            rows={1}
            placeholder="Soạn tin"
            value={messageChat.content}
            autoFocus={true}
            onKeyDown={handleOnKeyDown}
            className="detail-message"
            onChange={handleTextareaChange}
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
                        setTimeout(() => setShowModalOption(item.is_show), 300);
                      }}
                    >
                      <label style={{ cursor: "pointer" }} htmlFor={`imageUpload-${item.action}`}>
                        <span className="icon-item">{item.icon}</span>
                        <span className="title-item">{item.name}</span>
                      </label>
                      <input
                        ref={inputRef}
                        type="file"
                        id={`imageUpload-${item.action}`}
                        accept={item.action === 2 ? "video/*,image/*" : ".xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"}
                        className="d-none"
                        onChange={(e) => handleChangeUpload(e)}
                      />
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
