import React, { useEffect, useRef } from "react";
import { IMessageItem } from "../../data";

interface MessageListProps {
  messages: IMessageItem[];
  hasBottomOverlay: boolean;
}

export default function MessageList(props: MessageListProps) {
  const { messages, hasBottomOverlay } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const renderMessageContent = (content: string) => {
    return content.split("\n").map((line, lineIndex) => {
      const parts: React.ReactNode[] = [];
      const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      let cursor = 0;
      let match = linkPattern.exec(line);

      while (match) {
        if (match.index > cursor) {
          parts.push(line.slice(cursor, match.index));
        }

        parts.push(
          <a key={`${lineIndex}-${match.index}`} href={match[2]} target="_blank" rel="noreferrer" className="message-link">
            {match[1]}
          </a>
        );
        cursor = match.index + match[0].length;
        match = linkPattern.exec(line);
      }

      if (cursor < line.length) {
        parts.push(line.slice(cursor));
      }

      return (
        <React.Fragment key={`line-${lineIndex}`}>
          {parts.length > 0 ? parts : line}
          {lineIndex < content.split("\n").length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

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
          <div className="message-bubble__content">{renderMessageContent(message.content)}</div>
          <span className="message-bubble__time">{message.time}</span>
        </div>
      ))}
    </div>
  );
}
