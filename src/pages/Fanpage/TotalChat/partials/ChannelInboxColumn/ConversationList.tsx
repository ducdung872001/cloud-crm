import React from "react";
import { conversationStatusLabels, IConversationThread } from "../../data";
import TagBadge from "./TagBadge";

interface ConversationListProps {
  threads: IConversationThread[];
  selectedId: number;
  onSelect: (id: number) => void;
}

const platformLabels = {
  facebook: "FB",
  zalo: "ZL",
  instagram: "IG",
};

export default function ConversationList(props: ConversationListProps) {
  const { threads, selectedId, onSelect } = props;

  return (
    <div className="conversation-list">
      {threads.map((thread) => {
        const item = thread.conversation;
        const lastMessage = thread.messages[thread.messages.length - 1];
        const messagePreview = lastMessage?.content || item.lastMessage;
        const messageTime = lastMessage?.time || item.time;
        const previewPrefix = lastMessage?.sender === "agent" ? "Me: " : "";

        return (
          <button
            key={item.id}
          type="button"
          className={`conversation-item${selectedId === item.id ? " is-active" : ""}`}
          onClick={() => onSelect(item.id)}
        >
          <div className="conversation-item__top">
            <div className="conversation-item__identity">
              <span className={`platform-badge ${item.platform}`}>{platformLabels[item.platform]}</span>
              <strong>{item.customerName}</strong>
              <div className="tag-list">
                {item.tags.map((tag) => (
                  <TagBadge key={`${item.id}-${tag.label}`} tag={tag} />
                ))}
              </div>
            </div>
            <div className="state-list">
              <span className={`presence ${item.status}`}>{conversationStatusLabels[item.status]}</span>
              {item.unread && <span className="unread-dot" />}
            </div>
          </div>

          <div className="conversation-item__bottom">
            <p className="conversation-item__message">
              {previewPrefix}
              {messagePreview}
            </p>
            <span className="conversation-item__time">{messageTime}</span>
          </div>
        </button>
        );
      })}
    </div>
  );
}
