import React, { useRef, useState, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";
import "./index.scss";

interface Props {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const EmojiTextarea: React.FC<Props> = ({ value = "", placeholder = "Nhập nội dung...", onChange }) => {
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 🆕 Ref bọc toàn bộ khu vực emoji (button + picker)
  const emojiWrapperRef = useRef<HTMLDivElement>(null);

  // 🆕 Lắng nghe click bên ngoài
  useEffect(() => {
    if (!open) return; // Chỉ lắng nghe khi popup đang mở

    const handleClickOutside = (e: MouseEvent) => {
      if (emojiWrapperRef.current && !emojiWrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    // Dùng mousedown thay vì click để đóng sớm hơn, tránh conflict
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]); // 👈 Chỉ re-register khi open thay đổi

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onChange?.(e.target.value);
  };

  const insertEmoji = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + emoji + text.substring(end);

    setText(newText);
    onChange?.(newText);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="emoji-textarea">
      <textarea ref={textareaRef} value={text} placeholder={placeholder} onChange={handleChange} />

      {/* 🆕 Bọc button + picker chung 1 ref */}
      <div ref={emojiWrapperRef} style={{ position: "relative", display: "inline-block" }}>
        <button className="emoji-btn" onClick={() => setOpen((prev) => !prev)}>
          😀
        </button>

        {open && (
          <div className="emoji-picker">
            <EmojiPicker
              onEmojiClick={insertEmoji}
              width={300}
              height={350}
              previewConfig={{ showPreview: false }} // ✅ Ẩn preview
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiTextarea;
