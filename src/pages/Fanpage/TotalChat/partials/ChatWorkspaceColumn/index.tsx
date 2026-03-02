import React from "react";
import { IMessageItem } from "../../data";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import QuickReplyPanel from "./QuickReplyPanel";

interface ChatWorkspaceColumnProps {
  customerName: string;
  platformLabel: string;
  messages: IMessageItem[];
  quickReplies: string[];
  labels: {
    eyebrow: string;
    quickReplyTitle: string;
    inputPlaceholder: string;
    sendButton: string;
  };
  draft: string;
  onDraftChange: (value: string) => void;
  onQuickReplySend: (value: string) => void;
  onQuickReplySelect: (value: string) => void;
  onSend: () => void;
}

export default function ChatWorkspaceColumn(props: ChatWorkspaceColumnProps) {
  const { customerName, platformLabel, messages, quickReplies, labels, draft, onDraftChange, onQuickReplySend, onQuickReplySelect, onSend } = props;
  const normalizedDraft = draft.trimStart();
  const firstToken = normalizedDraft.split(/\s+/)[0] || "";
  const hasSelectedCommand = quickReplies.includes(firstToken);
  const lastMessage = messages[messages.length - 1] || null;
  const shouldShowQuickReplies = lastMessage?.sender === "customer";
  const isSlashPickerOpen = firstToken.startsWith("/") && !hasSelectedCommand;
  const hasBottomOverlay = shouldShowQuickReplies || isSlashPickerOpen;

  return (
    <section className="omni-panel omni-panel--workspace">
      <div className="omni-panel__header omni-panel__header--workspace">
        <div>
          <p className="eyebrow">{labels.eyebrow}</p>
          <h2>{customerName}</h2>
        </div>
        <span className="workspace-source">{platformLabel}</span>
      </div>

      <MessageList messages={messages} hasBottomOverlay={hasBottomOverlay} />

      <QuickReplyPanel quickReplies={quickReplies} isVisible={shouldShowQuickReplies} onQuickReply={onQuickReplySend} />

      <MessageInput
        draft={draft}
        quickReplies={quickReplies}
        placeholder={labels.inputPlaceholder}
        sendLabel={labels.sendButton}
        onDraftChange={onDraftChange}
        onQuickReplySelect={onQuickReplySelect}
        onSend={onSend}
      />
    </section>
  );
}
