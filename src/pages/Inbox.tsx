import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { INBOX_ITEMS, INBOX_TABS, type InboxCategory } from "../data/inbox";
import EmailComposeModal from "../forms/comms/EmailComposeModal";
import ChatSendModal from "../forms/comms/ChatSendModal";
import BroadcastModal from "../forms/comms/BroadcastModal";

type TabKey = "all" | InboxCategory;

export default function Inbox() {
  const navigate = useNavigate();
  const { setCurrentProject, showToast } = useApp();
  const [tab, setTab] = useState<TabKey>("all");
  const [emailOpen, setEmailOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const counts = useMemo(
    () => ({
      all: INBOX_ITEMS.length,
      cp: INBOX_ITEMS.filter((i) => i.cat === "cp").length,
      cr: INBOX_ITEMS.filter((i) => i.cat === "cr").length,
      fb: INBOX_ITEMS.filter((i) => i.cat === "fb").length,
    }),
    []
  );

  const filtered = useMemo(() => (tab === "all" ? INBOX_ITEMS : INBOX_ITEMS.filter((i) => i.cat === tab)), [tab]);

  return (
    <section>
      <div className="hero">
        <div>
          <div className="ribbon">✉ CROSS-PROJECT INBOX</div>
          <div className="kicker">Todo · Assigned to me</div>
          <h1 className="title">Việc chờ bạn xử lý</h1>
          <p className="desc">Tổng hợp tất cả checkpoint, feedback, change request từ mọi project bạn tham gia.</p>
        </div>
        <div className="actions">
          <button type="button" className="btn" onClick={() => setEmailOpen(true)}>
            ✉ Soạn email
          </button>
          <button type="button" className="btn" onClick={() => setChatOpen(true)}>
            💬 Gửi chat
          </button>
          <button type="button" className="btn" onClick={() => setBroadcastOpen(true)}>
            📢 Broadcast
          </button>
        </div>
      </div>

      <div className="tabs">
        {INBOX_TABS.map((t) => (
          <button key={t.key} type="button" className={`tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label} <span className="tab-count">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="inbox">
          {filtered.length === 0 ? (
            <div className="empty" style={{ padding: "40px 20px" }}>
              <div className="empty-ico">✉</div>
              <div className="empty-title">Không có mục nào</div>
              <div className="empty-desc">Tab này hiện không có item. Chọn tab khác xem.</div>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="inbox-item"
                onClick={() => {
                  setCurrentProject(item.action.project);
                  showToast("info", `Đã mở: ${item.title}`, `Workspace ${item.projectCode}`);
                  if (item.action.view?.startsWith("stage-")) {
                    const n = parseInt(item.action.view.split("-")[1]);
                    navigate(`/project/${item.action.project}/stage/${n}`);
                  } else if (item.action.view) {
                    navigate(`/project/${item.action.project}/${item.action.view}`);
                  } else {
                    navigate(`/project/${item.action.project}`);
                  }
                }}
              >
                <div className={`inbox-bar ${item.priority}`} />
                <div>
                  <div className="inbox-title">{item.title}</div>
                  <div className="inbox-sub">
                    <span className="inbox-proj">◦ {item.projectCode}</span>
                    <span>{item.meta}</span>
                  </div>
                </div>
                <button type="button" className={`btn sm ${item.btnPrimary ? "primary" : ""}`}>
                  {item.btn} →
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <EmailComposeModal open={emailOpen} onClose={() => setEmailOpen(false)} />
      <ChatSendModal open={chatOpen} onClose={() => setChatOpen(false)} />
      <BroadcastModal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} />
    </section>
  );
}
