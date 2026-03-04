import React, { useEffect, useState } from "react";
import { IQuickReplyTemplate } from "../data";

interface QuickReplySettingsPageProps {
  quickReplyTemplates: IQuickReplyTemplate[];
  onSaveTemplate: (template: IQuickReplyTemplate, previousCommand?: string) => void;
  onDeleteTemplate: (command: string) => void;
}

export default function QuickReplySettingsPage(props: QuickReplySettingsPageProps) {
  const { quickReplyTemplates, onSaveTemplate, onDeleteTemplate } = props;
  const [editingCommand, setEditingCommand] = useState<string | null>(null);
  const [commandInput, setCommandInput] = useState("");
  const [contentInput, setContentInput] = useState("");

  useEffect(() => {
    if (editingCommand && !quickReplyTemplates.some((item) => item.command === editingCommand)) {
      setEditingCommand(null);
      setCommandInput("");
      setContentInput("");
    }
  }, [editingCommand, quickReplyTemplates]);

  const resetForm = () => {
    setEditingCommand(null);
    setCommandInput("");
    setContentInput("");
  };

  const handleEdit = (template: IQuickReplyTemplate) => {
    setEditingCommand(template.command);
    setCommandInput(template.command);
    setContentInput(template.content);
  };

  const handleSubmit = () => {
    const normalizedCommand = commandInput.trim();
    const normalizedContent = contentInput.trim();

    if (!normalizedCommand || !normalizedContent) {
      return;
    }

    onSaveTemplate(
      {
        command: normalizedCommand.startsWith("/") ? normalizedCommand : `/${normalizedCommand}`,
        content: normalizedContent,
      },
      editingCommand || undefined
    );

    resetForm();
  };

  const minimumVisibleItems = Math.max(3, quickReplyTemplates.length);

  return (
    <div className="quick-reply-editor quick-reply-editor--standalone">
      <div className="quick-reply-editor__list">
        {Array.from({ length: minimumVisibleItems }).map((_, index) => {
          const item = quickReplyTemplates[index];

          return item ? (
            <div key={item.command} className="quick-reply-editor__item">
              <div className="quick-reply-editor__meta">
                <strong>{item.command}</strong>
                <span>{item.content}</span>
              </div>
              <div className="quick-reply-editor__actions">
                <button type="button" onClick={() => handleEdit(item)}>
                  Sửa
                </button>
                <button type="button" className="is-danger" onClick={() => onDeleteTemplate(item.command)}>
                  Xóa
                </button>
              </div>
            </div>
          ) : (
            <div
              key={`quick-reply-placeholder-${index}`}
              className="quick-reply-editor__item quick-reply-editor__item--placeholder"
              aria-hidden="true"
            >
              <div className="quick-reply-editor__meta">
                <strong>/{`lenh-${index + 1}`}</strong>
                <span>Thêm nội dung chat nhanh để hiển thị tại đây.</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="quick-reply-editor__form">
        <input value={commandInput} onChange={(e) => setCommandInput(e.target.value)} placeholder="/lenh" />
        <textarea value={contentInput} onChange={(e) => setContentInput(e.target.value)} placeholder="Nội dung chat nhanh" rows={3} />
        <div className="quick-reply-editor__form-actions">
          {editingCommand && (
            <button type="button" className="is-muted" onClick={resetForm}>
              Hủy sửa
            </button>
          )}
          <button type="button" onClick={handleSubmit} disabled={!commandInput.trim() || !contentInput.trim()}>
            {editingCommand ? "Lưu thay đổi" : "Thêm lệnh"}
          </button>
        </div>
      </div>
    </div>
  );
}
