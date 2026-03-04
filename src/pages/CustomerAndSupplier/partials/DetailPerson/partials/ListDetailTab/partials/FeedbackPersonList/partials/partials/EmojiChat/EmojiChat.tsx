import React, { Fragment } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { IEmojiChatProps } from "model/mailBox/PropsModel";
import "./EmojiChat.scss";

export default function EmojiChat(props: IEmojiChatProps) {
  const { onShow, onHide, dataMessage, setDataMessage } = props;

  const handleAddCustomEmoji = (emoji) => {
    const value = emoji.native;
    setDataMessage({ ...dataMessage, content: dataMessage.content + value });
  };

  return (
    <Fragment>
      {onShow === true ? (
        <div className="emoji-chat">
          <Picker data={data} locale="en" previewPosition="none" onEmojiSelect={handleAddCustomEmoji} onClickOutside={() => onHide(false)} />
        </div>
      ) : (
        ""
      )}
    </Fragment>
  );
}
