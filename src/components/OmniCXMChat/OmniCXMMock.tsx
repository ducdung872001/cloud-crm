import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * OmniCXMMock – Giả lập OmniCXM Service Chat widget
 *
 * Dùng để test UI khi chưa có key từ South Telecom.
 * Khi có key thật → xóa component này, dùng OmniCXMChat thật.
 *
 * Cách dùng trong App.tsx:
 *   import OmniCXMMock from "./components/OmniCXMMock";
 *   ...
 *   {isLogin && <OmniCXMMock onEvent={(data) => console.log(data)} />}
 */

// ── Kiểu dữ liệu giả lập ─────────────────────────────────────────────────────
type ChatSource = "zalo" | "messenger" | "livechat";

interface MockMessage {
  id: string;
  text: string;
  sender: "customer" | "agent";
  time: string;
  source: ChatSource;
}

interface MockRoom {
  id: string;
  customer: string;
  phone: string;
  source: ChatSource;
  status: "waiting" | "active" | "solved";
  messages: MockMessage[];
  avatar: string;
}

interface OmniChatPayload {
  from: string;
  event: string;
  source: string;
  room_id: string;
  customernumber?: string;
  people_id?: string;
}

interface Props {
  onEvent?: (payload: OmniChatPayload) => void;
}

// ── Dữ liệu mock ─────────────────────────────────────────────────────────────
const SOURCE_COLORS: Record<ChatSource, string> = {
  zalo:       "#0068FF",
  messenger:  "#0099FF",
  livechat:   "#00C48C",
};

const SOURCE_ICONS: Record<ChatSource, string> = {
  zalo:      "Z",
  messenger: "M",
  livechat:  "💬",
};

const MOCK_ROOMS: MockRoom[] = [
  {
    id: "room_001", customer: "Nguyễn Văn An", phone: "0912345678",
    source: "zalo", status: "waiting", avatar: "A",
    messages: [
      { id: "m1", text: "Xin chào, tôi muốn hỏi về sản phẩm", sender: "customer", time: "09:12", source: "zalo" },
      { id: "m2", text: "Giá sản phẩm X hiện tại là bao nhiêu?", sender: "customer", time: "09:13", source: "zalo" },
    ],
  },
  {
    id: "room_002", customer: "Trần Thị Bình", phone: "0987654321",
    source: "messenger", status: "active", avatar: "B",
    messages: [
      { id: "m3", text: "Đơn hàng #4521 của tôi đã giao chưa?", sender: "customer", time: "09:30", source: "messenger" },
      { id: "m4", text: "Đơn hàng của bạn đang được vận chuyển, dự kiến 2-3 ngày", sender: "agent", time: "09:32", source: "messenger" },
      { id: "m5", text: "Cảm ơn bạn nhiều!", sender: "customer", time: "09:33", source: "messenger" },
    ],
  },
  {
    id: "room_003", customer: "Lê Minh Cường", phone: "0901234567",
    source: "livechat", status: "waiting", avatar: "C",
    messages: [
      { id: "m6", text: "Tôi cần hỗ trợ kỹ thuật gấp", sender: "customer", time: "09:45", source: "livechat" },
    ],
  },
];

// ── Component chính ───────────────────────────────────────────────────────────
export default function OmniCXMMock({ onEvent }: Props) {
  const [isOpen,      setIsOpen]      = useState(false);
  const [activeRoom,  setActiveRoom]  = useState<MockRoom | null>(null);
  const [rooms,       setRooms]       = useState<MockRoom[]>(MOCK_ROOMS);
  const [inputText,   setInputText]   = useState("");
  const [unread,      setUnread]      = useState(2);
  const [tab,         setTab]         = useState<"queue" | "active">("queue");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeRoom?.messages]);

  // Giả lập tin nhắn mới đến
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setUnread((u) => u + 1), 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Emit event giống OmniCXM thật
  const emitEvent = useCallback((eventName: string, room: MockRoom, extra?: Partial<OmniChatPayload>) => {
    const payload: OmniChatPayload = {
      from: "OmniCXM_EmbedServiceChat",
      event: eventName,
      source: room.source,
      room_id: room.id,
      customernumber: room.phone,
      ...extra,
    };
    // Gửi qua window.postMessage giống embed.js thật
    window.postMessage(payload, "*");
    // Gọi callback trực tiếp
    onEvent?.(payload);
    console.log(`[OmniCXM Mock] Event: ${eventName}`, payload);
  }, [onEvent]);

  const handlePick = (room: MockRoom) => {
    setRooms((prev) => prev.map((r) =>
      r.id === room.id ? { ...r, status: "active" } : r
    ));
    setActiveRoom({ ...room, status: "active" });
    setUnread((u) => Math.max(0, u - 1));
    emitEvent("pick", room);
    setTab("active");
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeRoom) return;
    const newMsg: MockMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "agent",
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      source: activeRoom.source,
    };
    const updatedRoom = { ...activeRoom, messages: [...activeRoom.messages, newMsg] };
    setActiveRoom(updatedRoom);
    setRooms((prev) => prev.map((r) => r.id === activeRoom.id ? updatedRoom : r));
    setInputText("");
  };

  const handleSolved = () => {
    if (!activeRoom) return;
    emitEvent("solved", activeRoom);
    setRooms((prev) => prev.map((r) =>
      r.id === activeRoom.id ? { ...r, status: "solved" } : r
    ));
    setActiveRoom(null);
    setTab("queue");
  };

  const handleSpam = () => {
    if (!activeRoom) return;
    emitEvent("spam", activeRoom);
    setRooms((prev) => prev.filter((r) => r.id !== activeRoom.id));
    setActiveRoom(null);
  };

  const waitingRooms = rooms.filter((r) => r.status === "waiting");
  const activeRooms  = rooms.filter((r) => r.status === "active");

  return (
    <>
      {/* ── Nút mở widget ─────────────────────────────────────────────────── */}
      <div
        onClick={() => { setIsOpen(!isOpen); setUnread(0); }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 99998,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0068FF, #00C48C)",
          boxShadow: "0 4px 20px rgba(0,104,255,0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          transition: "transform 0.2s",
          userSelect: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isOpen ? "✕" : "💬"}
        {unread > 0 && !isOpen && (
          <div style={{
            position: "absolute",
            top: -2, right: -2,
            width: 18, height: 18,
            borderRadius: "50%",
            background: "#ef4444",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #fff",
          }}>
            {unread}
          </div>
        )}
      </div>

      {/* ── Panel chính ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: 88,
          right: 24,
          zIndex: 99997,
          width: 360,
          height: 520,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Segoe UI', sans-serif",
          animation: "slideUp 0.25s ease",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #0068FF, #0099FF)",
            padding: "14px 16px",
            color: "#fff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {activeRoom ? (
                <>
                  <button
                    onClick={() => setActiveRoom(null)}
                    style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, padding: 0, marginRight: 4 }}
                  >←</button>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: SOURCE_COLORS[activeRoom.source],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 14, border: "2px solid rgba(255,255,255,0.4)",
                  }}>
                    {activeRoom.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{activeRoom.customer}</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>
                      {SOURCE_ICONS[activeRoom.source]} {activeRoom.source} · {activeRoom.phone}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button onClick={handleSpam} style={{
                      background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                      borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer",
                    }}>Spam</button>
                    <button onClick={handleSolved} style={{
                      background: "rgba(255,255,255,0.25)", border: "none", color: "#fff",
                      borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer",
                      fontWeight: 600,
                    }}>Kết thúc</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 20 }}>💬</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>OmniCXM</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>Service Chat · Mock</div>
                  </div>
                  <div style={{
                    marginLeft: "auto", fontSize: 11,
                    background: "rgba(255,255,255,0.2)",
                    padding: "3px 8px", borderRadius: 20,
                  }}>
                    {waitingRooms.length} chờ · {activeRooms.length} đang xử lý
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Body */}
          {activeRoom ? (
            /* ── Màn hình chat ───────────────────────────────────────────── */
            <>
              <div style={{
                flex: 1, overflowY: "auto", padding: "12px 14px",
                background: "#f8faff", display: "flex", flexDirection: "column", gap: 8,
              }}>
                {activeRoom.messages.map((msg) => (
                  <div key={msg.id} style={{
                    display: "flex",
                    justifyContent: msg.sender === "agent" ? "flex-end" : "flex-start",
                  }}>
                    <div style={{
                      maxWidth: "75%",
                      padding: "8px 12px",
                      borderRadius: msg.sender === "agent" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                      background: msg.sender === "agent" ? "#0068FF" : "#fff",
                      color: msg.sender === "agent" ? "#fff" : "#1a1a2e",
                      fontSize: 13,
                      lineHeight: 1.5,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    }}>
                      {msg.text}
                      <div style={{
                        fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: "right",
                      }}>{msg.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: "10px 12px",
                borderTop: "1px solid #e8edf5",
                display: "flex", gap: 8, alignItems: "flex-end",
                background: "#fff",
              }}>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Nhập tin nhắn..."
                  rows={1}
                  style={{
                    flex: 1, border: "1px solid #e0e7ff", borderRadius: 10,
                    padding: "8px 12px", fontSize: 13, resize: "none",
                    outline: "none", fontFamily: "inherit", background: "#f8faff",
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: inputText.trim() ? "#0068FF" : "#e0e7ff",
                    border: "none", cursor: inputText.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, transition: "background 0.2s", flexShrink: 0,
                  }}
                >
                  ➤
                </button>
              </div>
            </>
          ) : (
            /* ── Danh sách room ──────────────────────────────────────────── */
            <>
              {/* Tabs */}
              <div style={{
                display: "flex", borderBottom: "1px solid #e8edf5",
                background: "#fff",
              }}>
                {(["queue", "active"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      flex: 1, padding: "10px 0", border: "none",
                      background: "none", cursor: "pointer", fontSize: 13,
                      fontWeight: tab === t ? 600 : 400,
                      color: tab === t ? "#0068FF" : "#6b7280",
                      borderBottom: tab === t ? "2px solid #0068FF" : "2px solid transparent",
                      transition: "all 0.2s",
                    }}
                  >
                    {t === "queue" ? `Hàng chờ (${waitingRooms.length})` : `Đang xử lý (${activeRooms.length})`}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: "auto", background: "#f8faff" }}>
                {(tab === "queue" ? waitingRooms : activeRooms).map((room) => (
                  <div
                    key={room.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px", cursor: "pointer",
                      borderBottom: "1px solid #e8edf5", background: "#fff",
                      marginBottom: 4, transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f5ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                      background: SOURCE_COLORS[room.source],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, color: "#fff", fontSize: 15,
                      position: "relative",
                    }}>
                      {room.avatar}
                      <div style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: 16, height: 16, borderRadius: "50%",
                        background: SOURCE_COLORS[room.source],
                        border: "2px solid #fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8, color: "#fff", fontWeight: 700,
                      }}>
                        {SOURCE_ICONS[room.source]}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>
                        {room.customer}
                      </div>
                      <div style={{
                        fontSize: 12, color: "#6b7280",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {room.messages[room.messages.length - 1]?.text}
                      </div>
                    </div>

                    {/* Action */}
                    {tab === "queue" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePick(room); }}
                        style={{
                          background: "#0068FF", color: "#fff", border: "none",
                          borderRadius: 8, padding: "6px 12px", fontSize: 12,
                          cursor: "pointer", fontWeight: 600, flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Tiếp nhận
                      </button>
                    )}
                    {tab === "active" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveRoom(room); }}
                        style={{
                          background: "#f0f5ff", color: "#0068FF", border: "1px solid #c7d7ff",
                          borderRadius: 8, padding: "6px 12px", fontSize: 12,
                          cursor: "pointer", flexShrink: 0,
                        }}
                      >
                        Mở
                      </button>
                    )}
                  </div>
                ))}

                {(tab === "queue" ? waitingRooms : activeRooms).length === 0 && (
                  <div style={{
                    textAlign: "center", padding: "40px 20px",
                    color: "#9ca3af", fontSize: 13,
                  }}>
                    {tab === "queue" ? "Không có hội thoại nào đang chờ" : "Không có hội thoại nào đang xử lý"}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mock badge */}
          <div style={{
            padding: "4px 0", textAlign: "center",
            background: "#fef3c7", fontSize: 10, color: "#92400e",
          }}>
            ⚠️ MOCK – Chỉ dùng để test UI, chưa kết nối OmniCXM thật
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
