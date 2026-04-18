import { useState } from "react";
import { Drawer, Select, Textarea } from "../../components/ui";
import { useApp } from "../../context/AppContext";

interface Reply {
  id: string;
  author: string;
  text: string;
  ts: string;
}

interface Feedback {
  id: string;
  author: string;
  title: string;
  body: string;
  severity: "blocking" | "major" | "minor" | "nit";
  status: "open" | "in-progress" | "resolved" | "rejected";
  category: string;
  assignee: string;
  page: string;
  replies: Reply[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  feedback: Feedback | null;
}

export default function FeedbackDrawer({ open, onClose, feedback }: Props) {
  const { showToast } = useApp();
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<Feedback["status"]>(feedback?.status ?? "open");

  if (!feedback) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={feedback.title}
      sub={`${feedback.author} · ${feedback.page} · ${feedback.category}`}
      footer={
        <>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as Feedback["status"])}
            options={[
              { value: "open", label: "Open" },
              { value: "in-progress", label: "In-progress" },
              { value: "resolved", label: "Resolved" },
              { value: "rejected", label: "Rejected" },
            ]}
            style={{ maxWidth: 140 }}
          />
          <div style={{ flex: 1 }} />
          <button type="button" className="btn" onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              showToast("success", `Feedback ${feedback.id} → ${status}`);
              onClose();
            }}
          >
            Cập nhật
          </button>
        </>
      }
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <span className={`tag tag-${feedback.severity === "blocking" || feedback.severity === "major" ? "hu" : "info"}`}>{feedback.severity}</span>
        <span
          className={`tag ${
            feedback.status === "resolved"
              ? "tag-ok"
              : feedback.status === "rejected"
                ? "tag-hu"
                : feedback.status === "in-progress"
                  ? "tag-info"
                  : "tag-warn"
          }`}
        >
          {feedback.status}
        </span>
      </div>

      <div
        style={{
          padding: 14,
          background: "var(--slate-50)",
          borderRadius: 10,
          fontSize: 13,
          color: "var(--slate-700)",
          marginBottom: 20,
          lineHeight: 1.55,
        }}
      >
        {feedback.body}
      </div>

      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Thảo luận ({feedback.replies.length})</div>
      {feedback.replies.map((r) => (
        <div
          key={r.id}
          style={{
            marginBottom: 10,
            paddingBottom: 10,
            borderBottom: "1px solid var(--slate-100)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <strong>{r.author}</strong>
            <span style={{ color: "var(--slate-500)" }}>{r.ts}</span>
          </div>
          <div style={{ fontSize: 13, marginTop: 4, color: "var(--slate-700)" }}>{r.text}</div>
        </div>
      ))}

      <Textarea placeholder="Trả lời / note..." value={reply} onChange={(e) => setReply(e.target.value)} style={{ marginTop: 8 }} />
      <button
        type="button"
        className="btn sm primary"
        style={{ marginTop: 8 }}
        disabled={!reply}
        onClick={() => {
          showToast("success", "Đã gửi reply");
          setReply("");
        }}
      >
        Gửi reply
      </button>
    </Drawer>
  );
}
