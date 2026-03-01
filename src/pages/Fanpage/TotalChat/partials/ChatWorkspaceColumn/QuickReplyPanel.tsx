import React from "react";

interface QuickReplyPanelProps {
  quickReplies: string[];
  isVisible: boolean;
  onQuickReply: (value: string) => void;
}

export default function QuickReplyPanel(props: QuickReplyPanelProps) {
  const { quickReplies, isVisible, onQuickReply } = props;

  return (
    <div className={`quick-reply-panel${isVisible ? " is-visible" : " is-hidden"}`}>
      <div className="quick-reply-panel__actions">
        {quickReplies.map((item) => (
          <button key={item} type="button" onClick={() => onQuickReply(item)}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
