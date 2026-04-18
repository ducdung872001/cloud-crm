import { useState } from "react";
import { Modal, Field, FieldRow, Input, Select, Textarea, Segmented } from "../../components/ui";
import { useFormStub } from "../../hooks/useFormStub";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChatSendModal({ open, onClose }: Props) {
  const [channel, setChannel] = useState<"slack" | "zalo" | "telegram" | "discord">("slack");
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  const [mention, setMention] = useState<"" | "here" | "channel" | "role">("");
  const { submitting, submit } = useFormStub("Đã gửi tin nhắn");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gửi tin nhắn chat"
      kicker={`COMM · ${channel.toUpperCase()}`}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn primary" disabled={submitting || !target || !message} onClick={() => submit(onClose)}>
            {submitting ? "Đang gửi..." : "Gửi"}
          </button>
        </>
      }
    >
      <Field label="Channel">
        <Segmented
          value={channel}
          onChange={setChannel}
          options={[
            { value: "slack", label: "Slack" },
            { value: "zalo", label: "Zalo OA" },
            { value: "telegram", label: "Telegram" },
            { value: "discord", label: "Discord" },
          ]}
        />
      </Field>
      <FieldRow>
        <Field label={channel === "zalo" ? "Số điện thoại / OA" : "Channel / user"} required>
          <Input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={channel === "slack" ? "#reborn-forge hoặc @user" : channel === "zalo" ? "0912345678 hoặc OA" : "@username"}
          />
        </Field>
        <Field label="Mention">
          <Select
            value={mention}
            onChange={(e) => setMention(e.target.value as typeof mention)}
            options={[
              { value: "", label: "Không mention" },
              { value: "here", label: "@here (online members)" },
              { value: "channel", label: "@channel (all)" },
              { value: "role", label: "@dev-role" },
            ]}
          />
        </Field>
      </FieldRow>
      <Field label="Nội dung" required>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ minHeight: 120 }}
          placeholder="Team ơi, URD v1.3 vừa được duyệt, ..."
        />
      </Field>
      <div
        style={{
          padding: 10,
          background: "var(--slate-50)",
          borderRadius: 8,
          fontSize: 12,
          color: "var(--slate-600)",
        }}
      >
        Hỗ trợ Markdown: **bold**, *italic*, `code`, {`>quote`}, - list
      </div>
    </Modal>
  );
}
