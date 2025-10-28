import React, { Fragment, useState, useEffect } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import HeadlessTippy from "@tippyjs/react/headless";
import { IMessageChatTicketProps } from "model/ticket/PropsModel";
import { ITicketExchangeUpdateRequestModel } from "model/ticket/TicketRequestModel";
import Icon from "components/icon";
import Input from "components/input/input";
import Button from "components/button/button";
import TicketService from "services/TicketService";
import "./MessageChatTicket.scss";

export default function MessageChatTicket(props: IMessageChatTicketProps) {
  const { idTicket, dataExchangeTicket, onReload } = props;

  const [showModalOption, setShowModalOption] = useState<boolean>(false);
  const [showEmojiChat, setShowEmojiChat] = useState<boolean>(false);

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

  const [messageChatTicket, setMessageChatTicket] = useState<ITicketExchangeUpdateRequestModel>({
    content: "",
    medias: "",
    ticketId: idTicket,
  });

  useEffect(() => {
    setMessageChatTicket({
      ...messageChatTicket,
      ticketId: idTicket,
      content: dataExchangeTicket?.content ?? "",
      id: dataExchangeTicket?.id ?? 0,
    });
  }, [idTicket, dataExchangeTicket]);

  const handleAddCustomEmoji = (emoji) => {
    const value = emoji.native;
    setMessageChatTicket({ ...messageChatTicket, content: messageChatTicket.content + value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const body: ITicketExchangeUpdateRequestModel = {
      ...(messageChatTicket as ITicketExchangeUpdateRequestModel),
    };

    const response = await TicketService.ticketExchangeUpdate(body);

    if (response.code === 0) {
      setMessageChatTicket({ ...messageChatTicket, content: "", id: 0 });
      onReload(true);
    } else {
      setMessageChatTicket({ ...messageChatTicket, content: "", id: 0 });
    }
  };

  const onClickOutside = () => {
    setShowModalOption(false);
  };

  return (
    <Fragment>
      <form className="message-chat-ticket" onSubmit={(e) => onSubmit(e)}>
        <div className={`icon-emotion ${showEmojiChat ? "isShowEmotion" : ""}`}>
          <Icon name="Happy" onClick={() => setShowEmojiChat(!showEmojiChat)} />
          {showEmojiChat && (
            <div className="emoji-chat">
              <Picker
                data={data}
                locale="en"
                previewPosition="none"
                onEmojiSelect={handleAddCustomEmoji}
                onClickOutside={() => setShowEmojiChat(false)}
              />
            </div>
          )}
        </div>
        <div className="content-message">
          <Input
            type="text"
            placeholder="Soạn tin"
            value={messageChatTicket.content}
            autoFocus={true}
            onChange={(e) => setMessageChatTicket({ ...messageChatTicket, content: e.target.value })}
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
        <div className="d-none submit-form">
          <Button type="submit" />
        </div>
      </form>
    </Fragment>
  );
}
