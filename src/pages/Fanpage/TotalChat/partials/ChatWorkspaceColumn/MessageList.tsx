import React, { useEffect, useRef } from "react";
import { IMessageItem } from "../../data";

interface MessageListProps {
  messages: IMessageItem[];
  hasBottomOverlay: boolean;
}

export default function MessageList(props: MessageListProps) {
  const { messages, hasBottomOverlay } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div ref={containerRef} className={`message-list${hasBottomOverlay ? " has-bottom-overlay" : ""}`}>
      {messages.map((message) => (
        <div key={message.id} className={`message-bubble ${message.sender}`}>
          <div className="message-bubble__content">{message.content}</div>
          <span className="message-bubble__time">{message.time}</span>
        </div>
      ))}
    </div>
  );
}
