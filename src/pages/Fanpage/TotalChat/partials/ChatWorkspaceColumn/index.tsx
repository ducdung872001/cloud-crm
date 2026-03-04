import React from "react";
import { IMessageItem, IProductCatalogItem } from "../../data";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import QuickReplyPanel from "./QuickReplyPanel";

interface ChatWorkspaceColumnProps {
  customerName: string;
  platformLabel: string;
  messages: IMessageItem[];
  quickReplies: string[];
  productCatalog: IProductCatalogItem[];
  labels: {
    eyebrow: string;
    quickReplyTitle: string;
    inputPlaceholder: string;
    sendButton: string;
  };
  isOrderPanelVisible: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onQuickReplySend: (value: string) => void;
  onQuickReplySelect: (value: string) => void;
  onProductSelect: (product: IProductCatalogItem, searchToken: string) => void;
  onToggleOrderPanel: () => void;
  onSend: () => void;
}

export default function ChatWorkspaceColumn(props: ChatWorkspaceColumnProps) {
  const {
    customerName,
    platformLabel,
    messages,
    quickReplies,
    productCatalog,
    labels,
    isOrderPanelVisible,
    draft,
    onDraftChange,
    onQuickReplySend,
    onQuickReplySelect,
    onProductSelect,
    onToggleOrderPanel,
    onSend,
  } = props;
  const normalizedDraft = draft.trimStart();
  const firstToken = normalizedDraft.split(/\s+/)[0] || "";
  const hasSelectedCommand = quickReplies.includes(firstToken);
  const lastMessage = messages[messages.length - 1] || null;
  const shouldShowQuickReplies = lastMessage?.sender === "customer";
  const isSlashPickerOpen = firstToken.startsWith("/") && !hasSelectedCommand;
  const editableDraft = hasSelectedCommand ? normalizedDraft.slice(firstToken.length).replace(/^\s+/, "") : draft;
  const productSearchToken = editableDraft.split(/\s+/).pop() || "";
  const isProductPickerOpen = productSearchToken.startsWith("\\");
  const hasBottomOverlay = shouldShowQuickReplies || isSlashPickerOpen || isProductPickerOpen;

  return (
    <section className="omni-panel omni-panel--workspace">
      <div className="omni-panel__header omni-panel__header--workspace">
        <div>
          <p className="eyebrow">{labels.eyebrow}</p>
          <h2>{customerName}</h2>
        </div>
        <div className="workspace-header__actions">
          <span className="workspace-source">{platformLabel}</span>
          <button
            type="button"
            className="workspace-toggle workspace-toggle--icon"
            onClick={onToggleOrderPanel}
            aria-label={isOrderPanelVisible ? "Ẩn trung tâm hành động" : "Hiện trung tâm hành động"}
            title={isOrderPanelVisible ? "Ẩn trung tâm hành động" : "Hiện trung tâm hành động"}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {isOrderPanelVisible ? (
                <path
                  d="M8.3 18.7a1 1 0 0 1 0-1.4L13.59 12 8.3 6.7a1 1 0 0 1 1.41-1.4l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.41 0Z"
                  fill="currentColor"
                />
              ) : (
                <path
                  d="M15.7 5.3a1 1 0 0 1 0 1.4L10.41 12l5.29 5.3a1 1 0 1 1-1.41 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.41 0Z"
                  fill="currentColor"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <MessageList messages={messages} hasBottomOverlay={hasBottomOverlay} />

      <QuickReplyPanel
        quickReplies={quickReplies}
        title={labels.quickReplyTitle}
        isVisible={shouldShowQuickReplies}
        onQuickReply={onQuickReplySend}
      />

      <MessageInput
        draft={draft}
        quickReplies={quickReplies}
        productCatalog={productCatalog}
        placeholder={labels.inputPlaceholder}
        sendLabel={labels.sendButton}
        onDraftChange={onDraftChange}
        onQuickReplySelect={onQuickReplySelect}
        onProductSelect={onProductSelect}
        onSend={onSend}
      />
    </section>
  );
}
