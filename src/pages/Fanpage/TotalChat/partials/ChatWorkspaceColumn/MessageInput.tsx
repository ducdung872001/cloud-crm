import React, { useEffect, useMemo, useRef, useState } from "react";

interface MessageInputProps {
  draft: string;
  quickReplies: string[];
  placeholder: string;
  sendLabel: string;
  onDraftChange: (value: string) => void;
  onQuickReplySelect: (value: string) => void;
  onSend: () => void;
}

export default function MessageInput(props: MessageInputProps) {
  const { draft, quickReplies, placeholder, sendLabel, onDraftChange, onQuickReplySelect, onSend } = props;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 22;
    const maxHeight = lineHeight * 15;

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [draft]);

  const normalizedDraft = draft.trimStart();
  const firstToken = normalizedDraft.split(/\s+/)[0] || "";
  const hasSelectedCommand = quickReplies.includes(firstToken);
  const trailingDraft = hasSelectedCommand ? normalizedDraft.slice(firstToken.length).replace(/^\s+/, "") : draft;
  const showQuickReplyPicker = firstToken.startsWith("/") && !hasSelectedCommand;
  const filteredQuickReplies = useMemo(
    () => quickReplies.filter((item) => item.toLowerCase().startsWith(firstToken.toLowerCase())),
    [firstToken, quickReplies]
  );

  useEffect(() => {
    setActiveCommandIndex(0);
  }, [draft]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showQuickReplyPicker && filteredQuickReplies.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveCommandIndex((prev) => (prev + 1) % filteredQuickReplies.length);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveCommandIndex((prev) => (prev - 1 + filteredQuickReplies.length) % filteredQuickReplies.length);
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onQuickReplySelect(filteredQuickReplies[activeCommandIndex]);
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        onQuickReplySelect(filteredQuickReplies[activeCommandIndex]);
        return;
      }
    }

    if (hasSelectedCommand && e.key === "Backspace" && !trailingDraft && textareaRef.current?.selectionStart === 0) {
      e.preventDefault();
      onDraftChange("");
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (draft.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="message-input">
      {showQuickReplyPicker && filteredQuickReplies.length > 0 && (
        <div className="message-command-picker">
          {filteredQuickReplies.map((item, index) => (
            <button
              key={item}
              type="button"
              className={`message-command-picker__item${index === activeCommandIndex ? " is-active" : ""}`}
              onClick={() => onQuickReplySelect(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
      <div className="message-input__composer">
        <div className="message-input__tools">
          <button type="button" className="message-tool" title="Thêm">
            +
          </button>
          <button type="button" className="message-tool" title="Đính kèm ảnh">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3l-1.2-1.6A1 1 0 0 0 14 4h-4a1 1 0 0 0-.8.4L8 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Zm0-2V8h4l1.2-1.6h3.6L15 8h4v10H5Zm7-1a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-2.2a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button type="button" className="message-tool" title="Biểu cảm">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-3.5-8.2c.8 1.1 2 1.7 3.5 1.7s2.7-.6 3.5-1.7a1 1 0 1 1 1.6 1.2c-1.2 1.6-3 2.5-5.1 2.5-2.1 0-3.9-.9-5.1-2.5a1 1 0 1 1 1.6-1.2ZM9 10a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 9 10Zm6 0a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 15 10Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div className="message-input__field">
          {hasSelectedCommand && (
            <button
              type="button"
              className="message-command-chip"
              onClick={() => onDraftChange(trailingDraft)}
              title="Bỏ lệnh nhanh"
            >
              {firstToken}
            </button>
          )}
          <textarea
            ref={textareaRef}
            value={hasSelectedCommand ? trailingDraft : draft}
            onChange={(e) => {
              const nextValue = e.target.value;
              onDraftChange(hasSelectedCommand ? `${firstToken}${nextValue ? ` ${nextValue}` : " "}` : nextValue);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
          />
        </div>

        <div className="message-input__actions">
          <button type="button" className="message-send" onClick={onSend} disabled={!draft.trim()} aria-label={sendLabel} title={sendLabel}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M21.4 11.1 4.8 3.3A1 1 0 0 0 3.4 4.5l2.4 6.4a1 1 0 0 0 .8.6l7.1.7-7.1.7a1 1 0 0 0-.8.6l-2.4 6.4a1 1 0 0 0 1.4 1.2l16.6-7.8a1 1 0 0 0 0-1.8Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
