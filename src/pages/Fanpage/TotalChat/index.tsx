import React, { useMemo, useState } from "react";
import { showToast } from "utils/common";
import ChannelInboxColumn from "./partials/ChannelInboxColumn";
import ChatWorkspaceColumn from "./partials/ChatWorkspaceColumn";
import OrderActionColumn from "./partials/OrderActionColumn";
import {
  conversationThreads,
  ConversationFilter,
  IConversationThread,
  IProductCatalogItem,
  orderStatusLabels,
  platformText,
  productCatalog,
  quickReplies,
  quickReplyTemplates,
  totalChatLabels,
  totalChatMockConfig,
} from "./data";
import "./index.scss";

export default function TotalChat() {
  document.title = totalChatMockConfig.pageTitle;

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>("all");
  const [threads, setThreads] = useState<IConversationThread[]>(conversationThreads);
  const [selectedConversationId, setSelectedConversationId] = useState<number>(conversationThreads[0]?.conversation.id || 0);
  const [draft, setDraft] = useState("");

  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      const item = thread.conversation;
      const matchesSearch =
        !searchValue ||
        item.customerName.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.lastMessage.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.phone.includes(searchValue);

      if (!matchesSearch) {
        return false;
      }

      if (activeFilter === "unread") {
        return item.unread;
      }

      if (activeFilter === "consulting") {
        return item.status === "consulting";
      }

      return true;
    });
  }, [threads, searchValue, activeFilter]);

  const selectedThread = useMemo(() => {
    return filteredThreads.find((item) => item.conversation.id === selectedConversationId) || filteredThreads[0] || threads[0] || null;
  }, [filteredThreads, selectedConversationId, threads]);

  const selectedConversation = selectedThread?.conversation || null;
  const messages = selectedThread?.messages || [];
  const selectedOrderAction = selectedThread?.orderAction || null;
  const cartItems = selectedOrderAction?.cartItems || [];
  const voucherCode = selectedOrderAction?.voucherCode || "";
  const orderNote = selectedOrderAction?.orderNote || "";
  const shippingFee = selectedOrderAction?.shippingFee || 0;
  const loyaltyPoints = selectedOrderAction?.loyaltyPoints || 0;
  const orderStatus = selectedOrderAction?.orderStatus || "draft";
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = voucherCode.trim() ? Math.min(120000, Math.round(subtotal * 0.08)) : 0;
  const total = subtotal + shippingFee - discount;

  const resolveMessageContent = (value: string) => {
    const trimmedValue = value.trim();
    const firstToken = trimmedValue.split(/\s+/)[0] || "";
    const remainingContent = trimmedValue.slice(firstToken.length).trim();
    const selectedTemplate = quickReplyTemplates.find((item) => item.command === firstToken);

    if (!selectedTemplate) {
      return value;
    }

    return remainingContent ? `${selectedTemplate.content} ${remainingContent}` : selectedTemplate.content;
  };

  const appendMessageToThread = (content: string) => {
    if (!selectedConversation || !content.trim()) {
      return;
    }

    const nextMessage = {
      id: Date.now(),
      sender: "agent" as const,
      content: content.trim(),
      time: totalChatMockConfig.messageTimeJustNow,
    };

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversation.id) {
          return thread;
        }

        return {
          ...thread,
          conversation: {
            ...thread.conversation,
            lastMessage: nextMessage.content,
            time: nextMessage.time,
            unread: false,
          },
          messages: [...thread.messages, nextMessage],
        };
      })
    );
  };

  const handleQuickReplySend = (value: string) => {
    appendMessageToThread(resolveMessageContent(value));
  };

  const handleQuickReplySelect = (value: string) => {
    setDraft(`${value} `);
  };

  const handleSend = () => {
    if (!selectedConversation || !draft.trim()) {
      return;
    }
    appendMessageToThread(resolveMessageContent(draft.trim()));
    setDraft("");
  };

  const handleQuantityChange = (id: number, delta: number) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversationId) {
          return thread;
        }

        return {
          ...thread,
          orderAction: {
            ...thread.orderAction,
            cartItems: thread.orderAction.cartItems.map((item) => {
              if (item.id !== id) {
                return item;
              }

              return {
                ...item,
                quantity: Math.max(1, item.quantity + delta),
              };
            }),
            orderStatus: "draft",
            hasSentOrderToCustomer: false,
            isOrderCreated: false,
          },
        };
      })
    );
  };

  const handleAddProduct = (product: IProductCatalogItem) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversationId) {
          return thread;
        }

        const existingItem = thread.orderAction.cartItems.find((item) => item.sku === product.sku);

        if (existingItem) {
          return {
            ...thread,
            orderAction: {
              ...thread.orderAction,
              cartItems: thread.orderAction.cartItems.map((item) =>
                item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
              ),
              orderStatus: "draft",
              hasSentOrderToCustomer: false,
              isOrderCreated: false,
            },
          };
        }

        const nextId = thread.orderAction.cartItems.reduce((max, item) => Math.max(max, item.id), 0) + 1;

        return {
          ...thread,
          orderAction: {
            ...thread.orderAction,
            cartItems: [
              ...thread.orderAction.cartItems,
              {
                id: nextId,
                name: product.name,
                sku: product.sku,
                price: product.price,
                quantity: 1,
              },
            ],
            orderStatus: "draft",
            hasSentOrderToCustomer: false,
            isOrderCreated: false,
          },
        };
      })
    );
  };

  const handleRemoveProduct = (id: number) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversationId) {
          return thread;
        }

        return {
          ...thread,
          orderAction: {
            ...thread.orderAction,
            cartItems: thread.orderAction.cartItems.filter((item) => item.id !== id),
            orderStatus: "draft",
            hasSentOrderToCustomer: false,
            isOrderCreated: false,
          },
        };
      })
    );
  };

  const handleVoucherChange = (value: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversationId) {
          return thread;
        }

        return {
          ...thread,
          orderAction: {
            ...thread.orderAction,
            voucherCode: value,
            orderStatus: "draft",
            hasSentOrderToCustomer: false,
            isOrderCreated: false,
          },
        };
      })
    );
  };

  const handleOrderNoteChange = (value: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversationId) {
          return thread;
        }

        return {
          ...thread,
          orderAction: {
            ...thread.orderAction,
            orderNote: value,
            orderStatus: "draft",
            hasSentOrderToCustomer: false,
            isOrderCreated: false,
          },
        };
      })
    );
  };

  const handleCustomerInfoSave = (data: { customerName: string; phone: string; address: string; customerTier: string }) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversationId) {
          return thread;
        }

        return {
          ...thread,
          conversation: {
            ...thread.conversation,
            customerName: data.customerName,
            phone: data.phone,
          },
          orderAction: {
            ...thread.orderAction,
            address: data.address,
            customerTier: data.customerTier,
            orderStatus: "draft",
            hasSentOrderToCustomer: false,
            isOrderCreated: false,
          },
        };
      })
    );
  };

  const buildOrderPreviewSummary = () => {
    const customerName = selectedConversation?.customerName || totalChatMockConfig.fallbackText.newCustomer;
    const phone = selectedConversation?.phone || totalChatMockConfig.fallbackText.emptyPhone;
    const address = selectedOrderAction?.address || "Chưa có địa chỉ";
    const cartSummary =
      cartItems.map((item) => `${item.name} x${item.quantity}`).join(", ") || "Chưa có sản phẩm";
    const totalText = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(total);

    return [
      "Thông tin đơn hàng xác nhận:",
      `Tên: ${customerName}`,
      `Sđt: ${phone}`,
      `Địa chỉ: ${address}`,
      `Giỏ hàng: ${cartSummary}`,
      `Thành tiền: ${totalText}`,
    ].join("\n");
  };

  const handleSendOrderToCustomer = () => {
    if (!selectedConversation || !selectedOrderAction) {
      return;
    }

    appendMessageToThread(buildOrderPreviewSummary());

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversationId) {
          return thread;
        }

        return {
          ...thread,
          orderAction: {
            ...thread.orderAction,
            orderStatus: "sent_to_customer",
            hasSentOrderToCustomer: true,
            isOrderCreated: false,
          },
        };
      })
    );

    showToast(totalChatMockConfig.sendOrderPreviewSuccessMessage, "success");
  };

  const handleCreateOrder = () => {
    if (!selectedConversation || !selectedOrderAction) {
      return;
    }

    if (!selectedOrderAction.hasSentOrderToCustomer) {
      const shouldCreateOrder = window.confirm(totalChatMockConfig.createOrderWithoutSendConfirm);

      if (!shouldCreateOrder) {
        return;
      }
    }

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.conversation.id !== selectedConversationId) {
          return thread;
        }

        const createdMessage = {
          id: Date.now(),
          sender: "system" as const,
          content: "Đơn hàng đã được tạo trên hệ thống.",
          time: totalChatMockConfig.messageTimeJustNow,
        };

        return {
          ...thread,
          conversation: {
            ...thread.conversation,
            lastMessage: createdMessage.content,
            time: createdMessage.time,
            unread: false,
          },
          messages: [...thread.messages, createdMessage],
          orderAction: {
            ...thread.orderAction,
            orderStatus: "created",
            hasSentOrderToCustomer: thread.orderAction.hasSentOrderToCustomer,
            isOrderCreated: true,
          },
        };
      })
    );

    showToast(totalChatMockConfig.createOrderSuccessMessage, "success");
  };

  return (
    <div className="page-content page-total-chat">
      <div className="omni-shell">
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
          platformLabel={selectedConversation ? platformText[selectedConversation.platform] : ""}
          messages={messages}
          quickReplies={quickReplies}
          labels={totalChatLabels.chatWorkspace}
          draft={draft}
          onDraftChange={setDraft}
          onQuickReplySend={handleQuickReplySend}
          onQuickReplySelect={handleQuickReplySelect}
          onSend={handleSend}
        />

        <OrderActionColumn
          customerName={selectedConversation?.customerName || totalChatMockConfig.fallbackText.newCustomer}
          phone={selectedConversation?.phone || totalChatMockConfig.fallbackText.emptyPhone}
          address={selectedOrderAction?.address || ""}
          customerTier={selectedOrderAction?.customerTier || ""}
          cartItems={cartItems}
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
          onRemoveProduct={handleRemoveProduct}
          onQuantityChange={handleQuantityChange}
          onVoucherChange={handleVoucherChange}
          onNoteChange={handleOrderNoteChange}
          onCreateOrder={handleCreateOrder}
        />
      </div>
    </div>
  );
}
