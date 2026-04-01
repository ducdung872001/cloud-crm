import React, { useMemo, useState, useCallback, useRef } from "react";
import { showToast } from "utils/common";
import ChannelInboxColumn from "./partials/ChannelInboxColumn";
import ChatWorkspaceColumn from "./partials/ChatWorkspaceColumn";
import OrderActionColumn from "./partials/OrderActionColumn";
import {
  ConversationFilter,
  IConversationThread,
  IProductCatalogItem,
  IQuickReplyTemplate,
  orderStatusLabels,
  platformText,
  productCatalog,
  quickReplyTemplates,
  totalChatLabels,
  totalChatMockConfig,
} from "./data";
import { useOmniCXM, OmniChatPayload, omniSendMessage } from "@/hooks/useOmniCXM";
import "./index.scss";

// ── Env key (set trong .env: REACT_APP_OMNICXM_KEY) ───────────────────────────
const OMNICXM_KEY = process.env.REACT_APP_OMNICXM_KEY || "";
const OMNICXM_ENV = process.env.REACT_APP_OMNICXM_ENV || "";

// ── Helper: tạo thread rỗng từ OmniCXM event ─────────────────────────────────
function threadFromOmniEvent(payload: OmniChatPayload, idx: number): IConversationThread {
  const platform =
    payload.source === "zalo"      ? "zalo"
    : payload.source === "instagram" ? "instagram"
    : "facebook";

  return {
    conversation: {
      id:           Date.now() + idx,
      customerName: payload.customerName || payload.customernumber || "Khách hàng mới",
      phone:        payload.customernumber || "",
      lastMessage:  "Hội thoại mới từ " + platform,
      time:         new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      platform,
      status:       "consulting",
      unread:       true,
      tags:         [],
      // Gắn room_id vào object để dùng khi gửi tin qua OmniCXM
      omniRoomId:   payload.room_id,
    } as any,
    messages: [
      {
        id:      Date.now(),
        sender:  "system",
        content: `Tiếp nhận hội thoại từ ${platform} · Room: ${payload.room_id}`,
        time:    new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      },
    ],
    orderAction: {
      address:               "",
      customerTier:          "Khách mới",
      loyaltyPoints:         0,
      voucherCode:           "",
      orderNote:             "",
      shippingFee:           0,
      cartItems:             [],
      pendingCartItems:      [],
      orderStatus:           "draft",
      hasSentOrderToCustomer: false,
      isOrderCreated:        false,
    },
  };
}

// ── Default orderAction cho thread mới ────────────────────────────────────────
const DEFAULT_ORDER_ACTION: IConversationThread["orderAction"] = {
  address:               "",
  customerTier:          "Khách mới",
  loyaltyPoints:         0,
  voucherCode:           "",
  orderNote:             "",
  shippingFee:           0,
  cartItems:             [],
  pendingCartItems:      [],
  orderStatus:           "draft",
  hasSentOrderToCustomer: false,
  isOrderCreated:        false,
};

export default function TotalChat() {
  document.title = "Hội thoại khách hàng";

  const [searchValue,            setSearchValue]            = useState("");
  const [activeFilter,           setActiveFilter]           = useState<ConversationFilter>("all");

  // ── threads bắt đầu rỗng — sẽ được populate từ OmniCXM events ────────────
  // Nếu OMNICXM_KEY chưa set (dev / chưa cấu hình) → load mock để test UI
  const [threads, setThreads] = useState<IConversationThread[]>([]);
  const [usingMock, setUsingMock] = useState(false);

  const [selectedConversationId, setSelectedConversationId] = useState<number>(0);
  const [draft,                  setDraft]                  = useState("");
  const [isOrderPanelVisible,    setIsOrderPanelVisible]    = useState(true);
  const [quickReplyItems,        setQuickReplyItems]        = useState<IQuickReplyTemplate[]>(quickReplyTemplates);

  const quickReplies = useMemo(() => quickReplyItems.map((item) => item.command), [quickReplyItems]);

  // ── OmniCXM integration ───────────────────────────────────────────────────
  const omniEventCounter = useRef(0);

  const handleOmniPick = useCallback((payload: OmniChatPayload) => {
    setThreads((prev) => {
      // Nếu room này đã tồn tại → cập nhật status
      const exists = prev.find((t) => (t.conversation as any).omniRoomId === payload.room_id);
      if (exists) {
        return prev.map((t) =>
          (t.conversation as any).omniRoomId === payload.room_id
            ? { ...t, conversation: { ...t.conversation, status: "consulting", unread: true } }
            : t
        );
      }
      // Thread mới
      const newThread = threadFromOmniEvent(payload, omniEventCounter.current++);
      setSelectedConversationId(newThread.conversation.id);
      setUsingMock(false);
      return [newThread, ...prev];
    });
  }, []);

  const handleOmniSolved = useCallback((payload: OmniChatPayload) => {
    setThreads((prev) =>
      prev.map((t) =>
        (t.conversation as any).omniRoomId === payload.room_id
          ? {
              ...t,
              conversation: { ...t.conversation, status: "offline" },
              orderAction:  { ...t.orderAction, orderStatus: "completed" },
              messages:     [
                ...t.messages,
                {
                  id:      Date.now(),
                  sender:  "system" as const,
                  content: "Hội thoại đã kết thúc.",
                  time:    new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }
          : t
      )
    );
  }, []);

  const handleOmniReassigned = useCallback((payload: OmniChatPayload) => {
    setThreads((prev) =>
      prev.map((t) =>
        (t.conversation as any).omniRoomId === payload.room_id
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  id:      Date.now(),
                  sender:  "system" as const,
                  content: "Hội thoại đã được phân công lại.",
                  time:    new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }
          : t
      )
    );
  }, []);

  const handleOmniNewMessage = useCallback((payload: any) => {
    // OmniCXM có thể emit event tin nhắn mới (tuỳ version)
    if (!payload.room_id || !payload.message) return;
    setThreads((prev) =>
      prev.map((t) => {
        if ((t.conversation as any).omniRoomId !== payload.room_id) return t;
        const newMsg = {
          id:      Date.now(),
          sender:  "customer" as const,
          content: payload.message,
          time:    new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        };
        return {
          ...t,
          conversation: {
            ...t.conversation,
            lastMessage: payload.message,
            time:        newMsg.time,
            unread:      true,
          },
          messages: [...t.messages, newMsg],
        };
      })
    );
  }, []);

  // Khởi động OmniCXM (ẩn floating button vì UI đã tích hợp vào đây)
  useOmniCXM({
    secretKey:          OMNICXM_KEY,
    environment:        OMNICXM_ENV,
    enabled:            !!OMNICXM_KEY,
    hideFloatingButton: true,          // ← ẩn nút chat góc phải
    onPick:             handleOmniPick,
    onSolved:           handleOmniSolved,
    onReassigned:       handleOmniReassigned,
    onNewMessage:       handleOmniNewMessage,
  });

  // ── Nếu chưa cấu hình key → load mock để preview UI ─────────────────────
  React.useEffect(() => {
    if (!OMNICXM_KEY && threads.length === 0) {
      import("./data").then(({ conversationThreads }) => {
        setThreads(conversationThreads);
        setSelectedConversationId(conversationThreads[0]?.conversation.id || 0);
        setUsingMock(true);
      });
    }
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────
  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      const item = thread.conversation;
      const matchesSearch =
        !searchValue ||
        item.customerName.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.lastMessage.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.phone.includes(searchValue);
      if (!matchesSearch) return false;
      if (activeFilter === "unread")     return item.unread;
      if (activeFilter === "consulting") return item.status === "consulting";
      return true;
    });
  }, [threads, searchValue, activeFilter]);

  const selectedThread = useMemo(
    () =>
      filteredThreads.find((t) => t.conversation.id === selectedConversationId) ||
      filteredThreads[0] ||
      threads[0] ||
      null,
    [filteredThreads, selectedConversationId, threads]
  );

  const selectedConversation  = selectedThread?.conversation  || null;
  const messages              = selectedThread?.messages      || [];
  const selectedOrderAction   = selectedThread?.orderAction   || null;
  const cartItems             = selectedOrderAction?.cartItems        || [];
  const pendingCartItems      = selectedOrderAction?.pendingCartItems || [];
  const voucherCode           = selectedOrderAction?.voucherCode     || "";
  const orderNote             = selectedOrderAction?.orderNote       || "";
  const shippingFee           = selectedOrderAction?.shippingFee     || 0;
  const loyaltyPoints         = selectedOrderAction?.loyaltyPoints   || 0;
  const orderStatus           = selectedOrderAction?.orderStatus     || "draft";
  const subtotal              = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount              = voucherCode.trim() ? Math.min(120000, Math.round(subtotal * 0.08)) : 0;
  const total                 = subtotal + shippingFee - discount;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

  // ── Gửi tin nhắn: thử OmniCXM thật trước, fallback local state ───────────
  const appendMessageToThread = useCallback((content: string) => {
    if (!selectedConversation || !content.trim()) return;

    const omniRoomId = (selectedConversation as any).omniRoomId;
    const sentViaOmni = omniRoomId ? omniSendMessage(omniRoomId, content.trim()) : false;

    // Luôn cập nhật local state để UI phản hồi ngay
    const nextMessage = {
      id:      Date.now(),
      sender:  "agent" as const,
      content: content.trim(),
      time:    new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversation.id) return thread;
        return {
          ...thread,
          conversation: {
            ...thread.conversation,
            lastMessage: nextMessage.content,
            time:        nextMessage.time,
            unread:      false,
          },
          messages: [...thread.messages, nextMessage],
        };
      })
    );

    if (!sentViaOmni && omniRoomId) {
      console.warn("[OmniCXM] sendMessage không khả dụng, chỉ lưu local.");
    }
  }, [selectedConversation]);

  const resolveMessageContent = (value: string) => {
    const trimmedValue   = value.trim();
    const firstToken     = trimmedValue.split(/\s+/)[0] || "";
    const remainingContent = trimmedValue.slice(firstToken.length).trim();
    const selectedTemplate = quickReplyItems.find((item) => item.command === firstToken);
    if (!selectedTemplate) return value;
    return remainingContent ? `${selectedTemplate.content} ${remainingContent}` : selectedTemplate.content;
  };

  const handleQuickReplySend   = (value: string) => appendMessageToThread(resolveMessageContent(value));
  const handleQuickReplySelect = (value: string) => setDraft(`${value} `);
  const handleSend = () => {
    if (!selectedConversation || !draft.trim()) return;
    appendMessageToThread(resolveMessageContent(draft.trim()));
    setDraft("");
  };

  const handleSaveQuickReplyTemplate = (template: IQuickReplyTemplate, previousCommand?: string) => {
    setQuickReplyItems((prev) => {
      const targetCommand    = previousCommand || template.command;
      const withoutTarget    = prev.filter((item) => item.command !== targetCommand);
      const duplicateIndex   = withoutTarget.findIndex((item) => item.command === template.command);
      if (duplicateIndex >= 0) {
        return withoutTarget.map((item, index) => (index === duplicateIndex ? template : item));
      }
      return [...withoutTarget, template];
    });
  };

  const handleDeleteQuickReplyTemplate = (command: string) => {
    setQuickReplyItems((prev) => prev.filter((item) => item.command !== command));
    setDraft((prev) => (prev.trimStart().startsWith(command) ? "" : prev));
  };

  const handleProductSelect = (product: IProductCatalogItem, searchToken: string) => {
    const tokenIndex     = draft.lastIndexOf(searchToken);
    const productLinkText = `[${product.name}](${product.link || "#"})`;
    if (tokenIndex < 0) { setDraft(draft); return; }
    setDraft(`${draft.slice(0, tokenIndex)}${productLinkText}${draft.slice(tokenIndex + searchToken.length)}`);
  };

  // ── Order action handlers (giữ nguyên logic cũ) ───────────────────────────
  const updateOrderAction = useCallback((updater: (prev: IConversationThread["orderAction"]) => Partial<IConversationThread["orderAction"]>) => {
    if (!selectedConversationId) return;
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversationId) return thread;
        return {
          ...thread,
          orderAction: {
            ...thread.orderAction,
            ...updater(thread.orderAction),
            orderStatus:            "draft",
            hasSentOrderToCustomer: false,
            isOrderCreated:         false,
          },
        };
      })
    );
  }, [selectedConversationId]);

  const handleQuantityChange  = (id: number, delta: number) =>
    updateOrderAction((oa) => ({
      cartItems: oa.cartItems.map((item) =>
        item.id !== id ? item : { ...item, quantity: Math.max(1, item.quantity + delta) }
      ),
    }));

  const handleAddProduct = (product: IProductCatalogItem) =>
    updateOrderAction((oa) => {
      const existing = oa.pendingCartItems.find((i) => i.sku === product.sku);
      if (existing) {
        return {
          pendingCartItems: oa.pendingCartItems.map((i) =>
            i.sku === product.sku ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      const nextId = [...oa.cartItems, ...oa.pendingCartItems].reduce((m, i) => Math.max(m, i.id), 0) + 1;
      return {
        pendingCartItems: [
          ...oa.pendingCartItems,
          { id: nextId, name: product.name, sku: product.sku, price: product.price, quantity: 1 },
        ],
      };
    });

  const handleRemovePendingProduct  = (id: number) =>
    updateOrderAction((oa) => ({ pendingCartItems: oa.pendingCartItems.filter((i) => i.id !== id) }));

  const handleConfirmPendingProduct = (id: number) =>
    updateOrderAction((oa) => {
      const pending = oa.pendingCartItems.find((i) => i.id === id);
      if (!pending) return {};
      const existingCart = oa.cartItems.find((i) => i.sku === pending.sku);
      return {
        cartItems: existingCart
          ? oa.cartItems.map((i) => i.sku === pending.sku ? { ...i, quantity: i.quantity + pending.quantity } : i)
          : [...oa.cartItems, pending],
        pendingCartItems: oa.pendingCartItems.filter((i) => i.id !== id),
      };
    });

  const handleSendPendingProduct = (id: number) => {
    const pendingItem = pendingCartItems.find((item) => item.id === id);
    if (!pendingItem) return;
    appendMessageToThread(
      ["Shop gợi ý thêm sản phẩm:", `${pendingItem.name} (${pendingItem.sku})`, `Giá: ${formatCurrency(pendingItem.price)}`].join("\n")
    );
  };

  const handleRemoveProduct    = (id: number) =>
    updateOrderAction((oa) => ({ cartItems: oa.cartItems.filter((i) => i.id !== id) }));

  const handleVoucherChange    = (value: string) =>
    updateOrderAction(() => ({ voucherCode: value }));

  const handleOrderNoteChange  = (value: string) =>
    updateOrderAction(() => ({ orderNote: value }));

  const handleCustomerInfoSave = (data: { customerName: string; phone: string; address: string; customerTier: string }) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversationId) return thread;
        return {
          ...thread,
          conversation: { ...thread.conversation, customerName: data.customerName, phone: data.phone },
          orderAction:  { ...thread.orderAction, address: data.address, customerTier: data.customerTier, orderStatus: "draft", hasSentOrderToCustomer: false, isOrderCreated: false },
        };
      })
    );
  };

  const buildOrderPreviewSummary = () => {
    const customerName = selectedConversation?.customerName || totalChatMockConfig.fallbackText.newCustomer;
    const phone        = selectedConversation?.phone        || totalChatMockConfig.fallbackText.emptyPhone;
    const address      = selectedOrderAction?.address       || "Chưa có địa chỉ";
    const cartSummary  = cartItems.map((item) => `${item.name} x${item.quantity}`).join(", ") || "Chưa có sản phẩm";
    return [
      "Thông tin đơn hàng xác nhận:",
      `Tên: ${customerName}`, `Sđt: ${phone}`, `Địa chỉ: ${address}`,
      `Giỏ hàng: ${cartSummary}`, `Thành tiền: ${formatCurrency(total)}`,
    ].join("\n");
  };

  const handleSendOrderToCustomer = () => {
    if (!selectedConversation || !selectedOrderAction) return;
    appendMessageToThread(buildOrderPreviewSummary());
    setThreads((prev) =>
      prev.map((thread) =>
        thread.conversation.id !== selectedConversationId ? thread : {
          ...thread,
          orderAction: { ...thread.orderAction, orderStatus: "sent_to_customer", hasSentOrderToCustomer: true, isOrderCreated: false },
        }
      )
    );
    showToast(totalChatMockConfig.sendOrderPreviewSuccessMessage, "success");
  };

  const handleCreateOrder = () => {
    if (!selectedConversation || !selectedOrderAction) return;
    if (!selectedOrderAction.hasSentOrderToCustomer) {
      if (!window.confirm(totalChatMockConfig.createOrderWithoutSendConfirm)) return;
    }
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversationId) return thread;
        const createdMessage = {
          id: Date.now(), sender: "system" as const,
          content: "Đơn hàng đã được tạo trên hệ thống.",
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        };
        return {
          ...thread,
          conversation: { ...thread.conversation, lastMessage: createdMessage.content, time: createdMessage.time, unread: false },
          messages:     [...thread.messages, createdMessage],
          orderAction:  { ...thread.orderAction, orderStatus: "created", isOrderCreated: true },
        };
      })
    );
    showToast(totalChatMockConfig.createOrderSuccessMessage, "success");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-content page-total-chat">
      {usingMock && (
        <div style={{
          position: "fixed", top: "6rem", left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, background: "#fef3c7", color: "#92400e", padding: "0.5rem 1.6rem",
          borderRadius: "2rem", fontSize: "1.2rem", fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}>
          ⚠️ Chế độ Demo — Cấu hình <code>REACT_APP_OMNICXM_KEY</code> để kết nối thật
        </div>
      )}

      <div className={`omni-shell${isOrderPanelVisible ? "" : " is-order-collapsed"}`}>
        <ChannelInboxColumn
          threads={filteredThreads}
          selectedId={selectedConversation?.id || 0}
          searchValue={searchValue}
          activeFilter={activeFilter}
          onSelect={setSelectedConversationId}
          onSearchChange={setSearchValue}
          onFilterChange={setActiveFilter}
        />

        <ChatWorkspaceColumn
          customerName={selectedConversation?.customerName || totalChatMockConfig.fallbackText.emptyConversation}
          platformLabel={selectedConversation ? (platformText as any)[selectedConversation.platform] ?? selectedConversation.platform : ""}
          messages={messages}
          quickReplies={quickReplies}
          productCatalog={productCatalog}
          labels={totalChatLabels.chatWorkspace}
          isOrderPanelVisible={isOrderPanelVisible}
          draft={draft}
          onDraftChange={setDraft}
          onQuickReplySend={handleQuickReplySend}
          onQuickReplySelect={handleQuickReplySelect}
          onProductSelect={handleProductSelect}
          onToggleOrderPanel={() => setIsOrderPanelVisible((prev) => !prev)}
          onSend={handleSend}
        />

        <OrderActionColumn
          isVisible={isOrderPanelVisible}
          customerName={selectedConversation?.customerName || totalChatMockConfig.fallbackText.newCustomer}
          phone={selectedConversation?.phone || totalChatMockConfig.fallbackText.emptyPhone}
          address={selectedOrderAction?.address || ""}
          customerTier={selectedOrderAction?.customerTier || ""}
          cartItems={cartItems}
          pendingCartItems={pendingCartItems}
          quickReplyTemplates={quickReplyItems}
          productCatalog={productCatalog}
          voucherCode={voucherCode}
          orderNote={orderNote}
          shippingFee={shippingFee}
          loyaltyPoints={loyaltyPoints}
          subtotal={subtotal}
          discount={discount}
          total={total}
          orderStatus={orderStatus}
          orderStatusLabels={orderStatusLabels}
          hasSentOrderToCustomer={selectedOrderAction?.hasSentOrderToCustomer || false}
          isOrderCreated={selectedOrderAction?.isOrderCreated || false}
          labels={totalChatLabels.orderAction}
          onCustomerInfoSave={handleCustomerInfoSave}
          onSendOrderToCustomer={handleSendOrderToCustomer}
          onAddProduct={handleAddProduct}
          onRemovePendingProduct={handleRemovePendingProduct}
          onConfirmPendingProduct={handleConfirmPendingProduct}
          onSendPendingProduct={handleSendPendingProduct}
          onRemoveProduct={handleRemoveProduct}
          onQuantityChange={handleQuantityChange}
          onSaveQuickReplyTemplate={handleSaveQuickReplyTemplate}
          onDeleteQuickReplyTemplate={handleDeleteQuickReplyTemplate}
          onVoucherChange={handleVoucherChange}
          onNoteChange={handleOrderNoteChange}
          onCreateOrder={handleCreateOrder}
        />
      </div>
    </div>
  );
}