import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { Customer } from "../../../types";
import "./index.scss";
import { useDebounce } from "@/hooks/useDebounce";
import { ICustomerListParams, useCustomerList } from "@/hooks/useCustomerList";

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (customer: Customer) => void;
}

export default function CustomerModal({ open, onClose, onSelect }: CustomerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const [params, setParams] = useState<ICustomerListParams>({
    keyword: "",
    limit: 10,
    page: 1,
  });

  const [listCustomerUse, setListCustomerUse] = useState<any[]>([]);

  const { listCustomer, isLoading, pagination } = useCustomerList({
    params,
    enabled: open, // ✅ chỉ fetch khi modal đang mở
  });

  // ── Khi listCustomer thay đổi ──────────────────────────────────────────────
  useEffect(() => {
    if (listCustomer.length === 0) return;

    let point = Math.floor(Math.random() * 10001);

    const mapped = listCustomer.map((item) => ({
      ...item,
      initial: item.name ? item.name.charAt(0).toUpperCase() : "?",
      points: point,
      tier: point > 8000 ? "Vàng" : point > 4000 ? "Bạc" : "Đồng",
      color: ["#059669", "#d97706", "#dc2626"][Math.floor(Math.random() * 3)],
      phone: item.phoneMasked || "0900 000 000",
    }));

    // ✅ Dùng pagination.page từ RESPONSE (không dùng params.page)
    // pagination.page = 1 nghĩa là server trả về trang 1 → replace
    // pagination.page > 1 nghĩa là server trả về trang tiếp → append
    if (pagination.page === 1) {
      setListCustomerUse(mapped);
    } else {
      // Dedup bằng id phòng trường hợp API trả về item trùng
      setListCustomerUse((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const newItems = mapped.filter((c) => !existingIds.has(c.id));
        return [...prev, ...newItems];
      });
    }
  }, [listCustomer, pagination]);

  // ── Debounce search ────────────────────────────────────────────────────────
  const debouncedSearch = useDebounce(search, 600);

  useEffect(() => {
    // setListCustomerUse([]);
    setParams((prev) => ({ ...prev, keyword: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  // ── Scroll to load more ────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || isLoading) return;

    const isNearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    const hasMore = pagination.page < pagination.totalPage;

    if (isNearBottom && hasMore) {
      setParams((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [isLoading, pagination]);

  // ── Reset khi modal đóng/mở lại ───────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setSearch("");
      // setListCustomerUse([]);
      setParams({ keyword: "", limit: 10, page: 1 });
    }
  }, [open]);

  const handleSelect = useCallback(
    (c: Customer) => {
      setSelectedId(c.id);
      onSelect?.(c);
      onClose();
      setParams((prev) => ({ keyword: "", limit: 10, page: 1 })); // Reset page về 1 sau khi chọn để lần mở sau luôn bắt đầu từ trang 1
    },
    [onClose, onSelect]
  );

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: onClose,
          },
          {
            title: "+ Thêm khách hàng mới",
            color: "primary",
            variant: "outline",
            callback: () => {},
          },
        ],
      },
    }),
    [onClose]
  );

  return (
    <Modal isFade={true} isOpen={open} isCentered={true} staticBackdrop={true} toggle={onClose} className="customer-modal">
      <ModalHeader title="Chọn khách hàng" toggle={onClose} />

      <ModalBody>
        {/* Search */}
        <div className="customer-modal__search">
          <span>🔍</span>
          <input type="text" placeholder="Tìm tên hoặc số điện thoại..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
        </div>

        {/* List */}
        <div className="customer-modal__list" ref={listRef} onScroll={handleScroll}>
          {listCustomerUse.length === 0 && !isLoading && <div className="customer-modal__empty">Không tìm thấy khách hàng</div>}

          {listCustomerUse.map((c) => {
            const isSelected = selectedId === c.id;
            return (
              <div key={c.id} className={`cust-item${isSelected ? " cust-item--selected" : ""}`} onClick={() => handleSelect(c)}>
                <div className="cust-item__av" style={{ background: c.color }}>
                  {c.initial}
                </div>
                <div className="cust-item__info">
                  <div className="cust-item__name">{c.name}</div>
                  <div className="cust-item__sub">
                    {c.phone} · {c.points.toLocaleString("vi")} điểm · Hạng {c.tier}
                  </div>
                </div>
                {isSelected && <span className="cust-item__check">✓</span>}
              </div>
            );
          })}

          {isLoading && (
            <div className="customer-modal__load-more">
              <span>⏳ Đang tải...</span>
            </div>
          )}

          {!isLoading && pagination.page >= pagination.totalPage && listCustomerUse.length > 0 && (
            <div className="customer-modal__end">
              <span>— Đã hiển thị tất cả {pagination.totalItem} khách hàng —</span>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}
