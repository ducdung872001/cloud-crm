import React, { useState, useRef, useEffect, useCallback } from "react";
import ProductService from "services/ProductService";
import CustomerService from "services/CustomerService";
import InvoiceService from "services/InvoiceService";
import BoughtProductService from "@/services/BoughtProductService";
import { formatCurrency } from "reborn-util";
import { showToast } from "utils/common";

/**
 * OmniCXMMock – Giả lập OmniCXM Service Chat widget
 * + Tính năng "Lên đơn nhanh" ngay trong chat box
 */

type ChatSource = "zalo" | "messenger" | "livechat";
type PanelView = "rooms" | "chat" | "quick_order";

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

// ── Lên đơn nhanh types ──────────────────────────────────────────────────────

interface CartItem {
  variantId: number;
  productId: number;
  productName: string;
  variantLabel: string;
  price: number;
  qty: number;
  unitName: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const SOURCE_COLORS: Record<ChatSource, string> = {
  zalo:      "#0068FF",
  messenger: "#0099FF",
  livechat:  "#00C48C",
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
    source: "zalo", status: "active", avatar: "B",
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

// ── Styles dùng chung ────────────────────────────────────────────────────────

const btn = (bg: string, color = "#fff", extra: React.CSSProperties = {}): React.CSSProperties => ({
  border: "none", cursor: "pointer", borderRadius: 8, fontWeight: 600,
  fontSize: 12, padding: "6px 12px", background: bg, color, ...extra,
});

// ── Component chính ───────────────────────────────────────────────────────────

export default function OmniCXMMock({ onEvent }: Props) {
  const [isOpen,      setIsOpen]      = useState(false);
  const [activeRoom,  setActiveRoom]  = useState<MockRoom | null>(null);
  const [rooms,       setRooms]       = useState<MockRoom[]>(MOCK_ROOMS);
  const [inputText,   setInputText]   = useState("");
  const [unread,      setUnread]      = useState(2);
  const [tab,         setTab]         = useState<"queue" | "active">("queue");
  const [view,        setView]        = useState<PanelView>("rooms");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Quick Order state ────────────────────────────────────────────────────────
  const [productSearch,  setProductSearch]  = useState("");
  const [productResults, setProductResults] = useState<any[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [cart,           setCart]           = useState<CartItem[]>([]);
  const [foundCustomer,  setFoundCustomer]  = useState<any>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [paymentType,    setPaymentType]    = useState<"CASH" | "TRANSFER">("CASH");
  const [discount,       setDiscount]       = useState(0);
  const productSearchTimer = useRef<ReturnType<typeof setTimeout>>(null);

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

  // Khi mở quick order → tìm khách theo SĐT của room hiện tại
  useEffect(() => {
    if (view === "quick_order" && activeRoom) {
      setFoundCustomer(null);
      setCustomerLoading(true);
      CustomerService.filter({ keyword: activeRoom.phone, limit: 1 })
        .then((res: any) => {
          if (res.code === 0 && res.result?.items?.length > 0) {
            setFoundCustomer(res.result.items[0]);
          }
        })
        .catch(() => {})
        .finally(() => setCustomerLoading(false));
    }
  }, [view, activeRoom]);

  const emitEvent = useCallback((eventName: string, room: MockRoom, extra?: Partial<OmniChatPayload>) => {
    const payload: OmniChatPayload = {
      from: "OmniCXM_EmbedServiceChat",
      event: eventName,
      source: room.source,
      room_id: room.id,
      customernumber: room.phone,
      ...extra,
    };
    window.postMessage(payload, "*");
    onEvent?.(payload);
  }, [onEvent]);

  const handlePick = (room: MockRoom) => {
    setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, status: "active" } : r));
    setActiveRoom({ ...room, status: "active" });
    setUnread((u) => Math.max(0, u - 1));
    emitEvent("pick", room);
    setView("chat");
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
    setRooms((prev) => prev.map((r) => r.id === activeRoom.id ? { ...r, status: "solved" } : r));
    setActiveRoom(null);
    setView("rooms");
    setTab("queue");
  };

  // ── Quick Order: tìm sản phẩm ─────────────────────────────────────────────
  const handleProductSearch = (kw: string) => {
    setProductSearch(kw);
    clearTimeout(productSearchTimer.current);
    if (!kw.trim()) { setProductResults([]); return; }
    productSearchTimer.current = setTimeout(async () => {
      setProductLoading(true);
      try {
        const res: any = await ProductService.wList({ name: kw, limit: 6, page: 1 });
        if (res.code === 0) setProductResults(res.result?.items || []);
      } catch {}
      finally { setProductLoading(false); }
    }, 300);
  };

  const handleAddToCart = async (product: any) => {
    // Nếu không có biến thể → dùng defaultVariantId
    const variantId = product.defaultVariantId;
    if (!variantId) {
      showToast("Sản phẩm chưa có biến thể", "error");
      return;
    }
    const existing = cart.find((c) => c.variantId === variantId);
    if (existing) {
      setCart((prev) => prev.map((c) => c.variantId === variantId ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart((prev) => [...prev, {
        variantId,
        productId:    product.id,
        productName:  product.name,
        variantLabel: product.name,
        price:        product.originalPrice || 0,
        qty:          1,
        unitName:     product.unitName || "",
      }]);
    }
    setProductSearch("");
    setProductResults([]);
  };

  const updateQty = (variantId: number, delta: number) => {
    setCart((prev) => prev
      .map((c) => c.variantId === variantId ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
    );
  };

  const removeFromCart = (variantId: number) => {
    setCart((prev) => prev.filter((c) => c.variantId !== variantId));
  };

  const totalAmount = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const finalAmount = Math.max(0, totalAmount - discount);

  // ── Quick Order: tạo đơn ──────────────────────────────────────────────────
  const handleSubmitOrder = async () => {
    if (cart.length === 0) { showToast("Chưa có sản phẩm trong đơn", "error"); return; }
    setSubmitting(true);
    try {
      // Bước 1: Tạo đơn tạm → lấy invoiceId
      const draftRes: any = await InvoiceService.createInvoice({
        customerId: foundCustomer?.id ?? -1,
      });
      if (draftRes.code !== 0 || !draftRes?.result?.invoiceId) {
        throw new Error(draftRes.message || "Tạo đơn tạm thất bại");
      }
      const invoiceId: number = draftRes.result.invoiceId;

      // Bước 2: Thêm sản phẩm vào đơn tạm
      const items = cart.map((c) => ({
        productId:  c.productId,
        variantId:  c.variantId,
        price:      c.price,
        qty:        c.qty,
        name:       c.productName,
        avatar:     "",
        unitName:   c.unitName,
        fee:        c.price * c.qty,
        customerId: foundCustomer?.id ?? -1,
      }));
      const insertRes: any = await BoughtProductService.insert(items, { invoiceId });
      if (insertRes.code !== 0) {
        throw new Error(insertRes.message || "Thêm sản phẩm vào đơn thất bại");
      }

      // Bước 3: Xác nhận thanh toán / hoàn tất đơn
      const createBody = {
        id:          invoiceId,
        invoiceType: draftRes.result.invoice?.invoiceType ?? "IV1",
        customerId:  foundCustomer?.id ?? -1,
        paymentType: paymentType === "CASH" ? 1 : 2,
        amount:      finalAmount,
        discount,
        paid:        finalAmount,
        debt:        0,
        fee:         0,
        vatAmount:   0,
        amountCard:  0,
        account:     "[]",
        receiptDate: new Date().toISOString(),
        branchId:    draftRes.result.invoice?.branchId ?? -1,
        bsnId:       draftRes.result.invoice?.bsnId ?? -1,
        customerName: foundCustomer?.name || activeRoom?.customer || "",
      };
      const createRes: any = await InvoiceService.create(createBody);
      if (createRes.code !== 0) throw new Error(createRes.message || "Thanh toán thất bại");

      const code = createRes.result?.invoiceCode || createRes.result?.code || `#${invoiceId}`;
      showToast(`✅ Tạo đơn thành công: ${code}`, "success");

      // Gửi tin nhắn xác nhận vào chat
      if (activeRoom) {
        const confirmMsg: MockMessage = {
          id: Date.now().toString(),
          text: `📦 Đã tạo đơn hàng ${code} · ${formatCurrency(finalAmount)} cho ${foundCustomer?.name || activeRoom.customer}`,
          sender: "agent",
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          source: activeRoom.source,
        };
        const updated = { ...activeRoom, messages: [...activeRoom.messages, confirmMsg] };
        setActiveRoom(updated);
        setRooms((prev) => prev.map((r) => r.id === activeRoom.id ? updated : r));
      }

      // Reset và quay về chat
      setCart([]);
      setDiscount(0);
      setProductSearch("");
      setView("chat");
    } catch (err: any) {
      showToast(err.message || "Có lỗi xảy ra", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const waitingRooms = rooms.filter((r) => r.status === "waiting");
  const activeRooms  = rooms.filter((r) => r.status === "active");

  // ── Render ────────────────────────────────────────────────────────────────

  const renderHeader = () => (
    <div style={{ background: "var(--primary-bg-color)", padding: "12px 14px", color: "#fff", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Back button */}
        {(view === "chat" || view === "quick_order") && (
          <button
            onClick={() => {
              if (view === "quick_order") { setView("chat"); return; }
              setActiveRoom(null); setView("rooms");
            }}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, padding: 0, marginRight: 2 }}
          >←</button>
        )}

        {view === "rooms" && (
          <>
            <div style={{ fontSize: 20 }}>💬</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Reborn CRM</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Service Chat · Mock</div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 11, background: "rgba(255,255,255,0.2)", padding: "3px 8px", borderRadius: 20 }}>
              {waitingRooms.length} chờ · {activeRooms.length} xử lý
            </div>
          </>
        )}

        {(view === "chat" || view === "quick_order") && activeRoom && (
          <>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: SOURCE_COLORS[activeRoom.source],
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13, border: "2px solid rgba(255,255,255,0.35)",
            }}>
              {activeRoom.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{activeRoom.customer}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>
                {SOURCE_ICONS[activeRoom.source]} {activeRoom.source} · {activeRoom.phone}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {view === "chat" && (
                <>
                  <button
                    onClick={() => { setCart([]); setView("quick_order"); }}
                    style={btn("rgba(255,255,255,0.25)", "#fff", { fontSize: 11 })}
                  >
                    🛒 Tạo đơn hàng
                  </button>
                  <button
                    onClick={handleSolved}
                    style={btn("rgba(255,255,255,0.15)", "#fff", { fontSize: 11 })}
                  >
                    Kết thúc
                  </button>
                </>
              )}
              {view === "quick_order" && (
                <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>Lên đơn nhanh</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderRooms = () => (
    <>
      <div style={{ display: "flex", background: "#fff", flexShrink: 0 }}>
        {(["queue", "active"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px 0", border: "none", background: "none",
            cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 600 : 400,
            color: tab === t ? "var(--primary-bg-color)" : "#6b7280",
            borderBottom: tab === t ? "2px solid var(--primary-bg-color)" : "2px solid transparent",
            transition: "all 0.2s",
          }}>
            {t === "queue" ? `Hàng chờ (${waitingRooms.length})` : `Đang xử lý (${activeRooms.length})`}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", background: "#f8faff" }}>
        {(tab === "queue" ? waitingRooms : activeRooms).map((room) => (
          <div key={room.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", cursor: "pointer",
            borderBottom: "1px solid #e8edf5", background: "#fff", marginBottom: 4,
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f5ff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <div style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: SOURCE_COLORS[room.source],
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, color: "#fff", fontSize: 15, position: "relative",
            }}>
              {room.avatar}
              <div style={{
                position: "absolute", bottom: 0, right: 0,
                width: 16, height: 16, borderRadius: "50%",
                background: SOURCE_COLORS[room.source], border: "2px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, color: "#fff", fontWeight: 700,
              }}>
                {SOURCE_ICONS[room.source]}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>{room.customer}</div>
              <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {room.messages[room.messages.length - 1]?.text}
              </div>
            </div>
            {tab === "queue" && (
              <button onClick={(e) => { e.stopPropagation(); handlePick(room); }}
                style={btn("#0068FF", "#fff", { whiteSpace: "nowrap" })}>
                Tiếp nhận
              </button>
            )}
            {tab === "active" && (
              <button onClick={(e) => { e.stopPropagation(); setActiveRoom(room); setView("chat"); }}
                style={btn("#f0f5ff", "#0068FF", { border: "1px solid #c7d7ff" })}>
                Mở
              </button>
            )}
          </div>
        ))}
        {(tab === "queue" ? waitingRooms : activeRooms).length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af", fontSize: 13 }}>
            {tab === "queue" ? "Không có hội thoại nào đang chờ" : "Không có hội thoại nào đang xử lý"}
          </div>
        )}
      </div>
    </>
  );

  const renderChat = () => (
    <>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", background: "#f8faff", display: "flex", flexDirection: "column", gap: 8 }}>
        {activeRoom?.messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender === "agent" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "75%", padding: "8px 12px", fontSize: 13, lineHeight: 1.5,
              borderRadius: msg.sender === "agent" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
              background: msg.sender === "agent" ? "var(--primary-bg-color)" : "#fff",
              color: msg.sender === "agent" ? "#fff" : "#1a1a2e",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}>
              {msg.text}
              <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: "right" }}>{msg.time}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: "10px 12px", borderTop: "1px solid #e8edf5", display: "flex", gap: 8, alignItems: "flex-end", background: "#fff", flexShrink: 0 }}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Nhập tin nhắn..."
          rows={1}
          style={{ flex: 1, border: "1px solid #e0e7ff", borderRadius: 10, padding: "8px 12px", fontSize: 13, resize: "none", outline: "none", fontFamily: "inherit", background: "#f8faff" }}
        />
        <button onClick={handleSend} disabled={!inputText.trim()} style={{
          width: 36, height: 36, borderRadius: 10, border: "none", flexShrink: 0,
          background: inputText.trim() ? "#0068FF" : "#e0e7ff",
          cursor: inputText.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>➤</button>
      </div>
    </>
  );

  const renderQuickOrder = () => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8faff" }}>

      {/* Khách hàng */}
      <div style={{ background: "#fff", padding: "10px 14px", borderBottom: "1px solid #e8edf5", flexShrink: 0 }}>
        {customerLoading ? (
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Đang tìm khách hàng...</div>
        ) : foundCustomer ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0068FF", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
              {foundCustomer.name?.[0] || "K"}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{foundCustomer.name}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{foundCustomer.phone} · {foundCustomer.totalPoint ? `${foundCustomer.totalPoint} điểm` : "Chưa có điểm"}</div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 11, color: "#22c55e", fontWeight: 600 }}>✓ Đã tìm thấy</div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                {activeRoom?.customer} · {activeRoom?.phone}
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Khách vãng lai (chưa có trong hệ thống)</div>
            </div>
          </div>
        )}
      </div>

      {/* Tìm sản phẩm */}
      <div style={{ padding: "10px 14px", background: "#fff", borderBottom: "1px solid #e8edf5", flexShrink: 0, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e0e7ff", borderRadius: 8, padding: "6px 10px", background: "#f8faff" }}>
          <span style={{ fontSize: 14, color: "#9ca3af" }}>🔍</span>
          <input
            value={productSearch}
            onChange={(e) => handleProductSearch(e.target.value)}
            placeholder="Tìm sản phẩm để thêm..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13, background: "transparent", fontFamily: "inherit" }}
          />
          {productLoading && <span style={{ fontSize: 11, color: "#9ca3af" }}>...</span>}
        </div>

        {/* Kết quả tìm kiếm */}
        {productResults.length > 0 && (
          <div style={{
            position: "absolute", left: 14, right: 14, top: "100%",
            background: "#fff", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 100, border: "1px solid #e0e7ff", overflow: "hidden",
          }}>
            {productResults.map((p) => (
              <div
                key={p.id}
                onClick={() => handleAddToCart(p)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f5ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                {p.avatar
                  ? <img src={p.avatar} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                  : <div style={{ width: 32, height: 32, borderRadius: 6, background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📦</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    {formatCurrency(p.originalPrice)} · Tồn: {p.stockQuantity ?? "—"}
                  </div>
                </div>
                <span style={{ fontSize: 16, color: "#0068FF", fontWeight: 700 }}>+</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Giỏ hàng */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "#9ca3af", fontSize: 12 }}>
            🛒 Chưa có sản phẩm nào<br />
            <span style={{ fontSize: 11 }}>Tìm và thêm sản phẩm phía trên</span>
          </div>
        ) : cart.map((item) => (
          <div key={item.variantId} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#fff", borderRadius: 10, padding: "8px 10px",
            border: "1px solid #e8edf5",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.productName}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{formatCurrency(item.price)}</div>
            </div>
            {/* Qty control */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => updateQty(item.variantId, -1)} style={btn("#f3f4f6", "#374151", { width: 22, height: 22, padding: 0, borderRadius: 6, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" })}>−</button>
              <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
              <button onClick={() => updateQty(item.variantId, 1)} style={btn("#0068FF", "#fff", { width: 22, height: 22, padding: 0, borderRadius: 6, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" })}>+</button>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0068FF", minWidth: 60, textAlign: "right" }}>
              {formatCurrency(item.price * item.qty)}
            </div>
            <button onClick={() => removeFromCart(item.variantId)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 14, padding: "0 2px" }}>✕</button>
          </div>
        ))}
      </div>

      {/* Footer: tổng tiền + thanh toán */}
      {cart.length > 0 && (
        <div style={{ background: "#fff", borderTop: "1px solid #e8edf5", padding: "10px 14px", flexShrink: 0 }}>
          {/* Giảm giá */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#6b7280", flex: 1 }}>Giảm giá:</span>
            <input
              type="number"
              value={discount || ""}
              onChange={(e) => setDiscount(Math.max(0, +e.target.value || 0))}
              placeholder="0"
              style={{ width: 90, border: "1px solid #e0e7ff", borderRadius: 6, padding: "3px 8px", fontSize: 12, textAlign: "right", outline: "none" }}
            />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>₫</span>
          </div>

          {/* Tổng */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#374151" }}>Tổng cộng:</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#0068FF" }}>{formatCurrency(finalAmount)}</span>
          </div>

          {/* Thanh toán */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {(["CASH", "TRANSFER"] as const).map((pt) => (
              <button
                key={pt}
                onClick={() => setPaymentType(pt)}
                style={{
                  flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: paymentType === pt ? "2px solid #0068FF" : "2px solid #e0e7ff",
                  background: paymentType === pt ? "#e8f0ff" : "#f8faff",
                  color: paymentType === pt ? "#0068FF" : "#6b7280",
                  cursor: "pointer",
                }}
              >
                {pt === "CASH" ? "💵 Tiền mặt" : "🏦 Chuyển khoản"}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={submitting || cart.length === 0}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 10, border: "none",
              background: submitting ? "#93c5fd" : "#0068FF", color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {submitting ? "Đang tạo đơn..." : `✅ Tạo đơn · ${formatCurrency(finalAmount)}`}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Nút mở widget ─────────────────────────────────────────────────── */}
      <div
        onClick={() => { setIsOpen(!isOpen); setUnread(0); }}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 99998,
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--primary-bg-color)",
          boxShadow: "0 4px 20px rgba(0,104,255,0.4)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, transition: "transform 0.2s", userSelect: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isOpen ? <div style={{ color: "#FFFFFF" }}>✕</div> : "💬"}
        {unread > 0 && !isOpen && (
          <div style={{
            position: "absolute", top: -2, right: -2,
            width: 18, height: 18, borderRadius: "50%",
            background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #fff",
          }}>{unread}</div>
        )}
      </div>

      {/* ── Panel chính ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: 88, right: 24, zIndex: 99997,
          width: 360, height: 540,
          background: "#fff", borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          fontFamily: "'Segoe UI', sans-serif",
          animation: "slideUp 0.25s ease",
        }}>
          {renderHeader()}

          {view === "rooms"       && renderRooms()}
          {view === "chat"        && renderChat()}
          {view === "quick_order" && renderQuickOrder()}

          {/* Mock badge */}
          <div style={{ padding: "4px 0", textAlign: "center", background: "#fef3c7", fontSize: 10, color: "#92400e", flexShrink: 0 }}>
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