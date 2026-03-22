import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { Customer } from "../../../types";
import "./index.scss";
import { useDebounce } from "@/hooks/useDebounce";
import { ICustomerListParams, useCustomerList } from "@/hooks/useCustomerList";
import CustomerService from "@/services/CustomerService";
import { showToast } from "utils/common";
import { urlsApi } from "configs/urls";

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (customer: Customer) => void;
  onQuickAdd?: (search: string) => void;
  /** Chọn khách vãng lai — bỏ qua không lưu thông tin */
  onSelectWalkIn?: () => void;
}

export default function CustomerModal({
  open, onClose, onSelect, onQuickAdd, onSelectWalkIn,
}: CustomerModalProps) {
  const [search,     setSearch]     = useState("");
  const [selectedId, setSelectedId] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const [params, setParams] = useState<ICustomerListParams>({
    keyword: "", limit: 10, page: 1,
  });

  // ── Đăng ký hội viên nhanh ────────────────────────────────────────────────
  const [newName,       setNewName]       = useState("");
  const [newPhone,      setNewPhone]      = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerMode,  setRegisterMode]  = useState(false);

  // useCustomerList đã tự quản lý accumulated list (page=1→replace, page>1→append)
  // listCustomer = danh sách đã accumulated từ hook
  const { listCustomer, isLoading, isNoItem, pagination } = useCustomerList({
    params,
    enabled: open,
  });

  // ── Debounce search ───────────────────────────────────────────────────────
  const debouncedSearch = useDebounce(search, 600);

  useEffect(() => {
    setParams((prev) => ({ ...prev, keyword: debouncedSearch, page: 1 }));
    setRegisterMode(false);
  }, [debouncedSearch]);

  // ── Scroll to load more ───────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || isLoading) return;
    const isNearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    const hasMore      = pagination.page < pagination.totalPage;
    if (isNearBottom && hasMore) {
      setParams((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [isLoading, pagination]);

  // ── Reset khi modal đóng/mở lại ──────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setSearch(""); setNewName(""); setNewPhone("");
      setRegisterMode(false);
      setParams({ keyword: "", limit: 10, page: 1 });
    }
  }, [open]);

  // ── Chọn khách ───────────────────────────────────────────────────────────
  const handleSelect = useCallback((c: Customer) => {
    setSelectedId(c.id);
    onSelect?.(c);
    onClose();
    setParams({ keyword: "", limit: 10, page: 1 });
  }, [onClose, onSelect]);

  // ── Đăng ký hội viên nhanh ────────────────────────────────────────────────
  const handleQuickRegister = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    setIsRegistering(true);
    try {
      const createRes = await CustomerService.update({
        id: 0, name: newName.trim(), phone: newPhone.trim(),
      } as any);
      if (createRes.code !== 0 || !createRes.result) {
        showToast(createRes.message ?? "Không thể tạo khách hàng", "error");
        return;
      }
      const newCustomerId = createRes.result.id;
      // Tạo loyalty wallet → trở thành hội viên ngay
      await fetch(urlsApi.ma.createLoyaltyWallet, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: newCustomerId, status: 1 }),
      }).catch(() => {});
      // Auto-select
      const newCustomer: Customer = {
        id: String(newCustomerId), name: newName.trim(),
        initial: newName.trim().charAt(0).toUpperCase(),
        phone: newPhone.trim(), points: 0, tier: "Đồng", color: "#059669",
      };
      onSelect?.(newCustomer);
      onClose();
      showToast(`Đã đăng ký hội viên: ${newName.trim()}`, "success");
    } catch {
      showToast("Lỗi kết nối khi đăng ký hội viên", "error");
    } finally {
      setIsRegistering(false);
    }
  };

  // Map listCustomer → có thêm các field UI cần (initial, color, phone)
  const displayList = useMemo(() => listCustomer.map((item) => ({
    ...item,
    initial: item.name ? item.name.charAt(0).toUpperCase() : "?",
    points:  item.totalPoint ?? item.points ?? 0,
    tier:    item.segmentName ?? "—",
    color:   item.color ?? ["#059669", "#d97706", "#dc2626"][item.id % 3],
    phone:   item.phoneMasked || item.phone || "—",
  })), [listCustomer]);

  const actions = useMemo<IActionModal>(() => ({
    actions_right: {
      buttons: [
        { title: "Đóng", color: "primary", variant: "outline", callback: onClose },
        {
          title: "+ Thêm khách hàng mới", color: "primary", variant: "outline",
          callback: () => { onQuickAdd?.(search); },
        },
      ],
    },
  }), [onClose, onQuickAdd, search]);

  // Empty state: không có kết quả VÀ đã load xong (isNoItem từ hook)
  const showEmpty = isNoItem && !isLoading;

  return (
    <Modal isFade={true} isOpen={open} isCentered={true}
      staticBackdrop={true} toggle={onClose} className="customer-modal">
      <ModalHeader title="Chọn khách hàng" toggle={onClose} />

      <ModalBody>
        {/* ── Tầng 1: Khách vãng lai ── */}
        <div
          className="cust-item"
          style={{ background: "var(--paper)", borderRadius: "0.8rem", marginBottom: 10, cursor: "pointer" }}
          onClick={() => { onSelectWalkIn?.(); onClose(); }}
        >
          <div className="cust-item__av" style={{ background: "#64748b", fontSize: 18 }}>👤</div>
          <div className="cust-item__info">
            <div className="cust-item__name" style={{ fontWeight: 700 }}>Khách vãng lai</div>
            <div className="cust-item__sub" style={{ color: "var(--muted)" }}>Không lưu thông tin · Bỏ qua nhanh</div>
          </div>
          <span style={{ color: "var(--muted)", fontSize: 18 }}>→</span>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          color: "var(--muted)", fontSize: 11, fontWeight: 600,
          marginBottom: 10, textTransform: "uppercase", letterSpacing: 1,
        }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          Hoặc chọn / tìm khách hàng
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Search */}
        <div className="customer-modal__search">
          <span>🔍</span>
          <input type="text" placeholder="Tìm tên hoặc số điện thoại..."
            value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
        </div>

        {/* List */}
        <div className="customer-modal__list" ref={listRef} onScroll={handleScroll}>

          {/* Empty state — dùng isNoItem từ hook, tránh stale state */}
          {showEmpty && (
            <div>
              <div className="customer-modal__empty">
                {debouncedSearch
                  ? `Không tìm thấy "${debouncedSearch}"`
                  : "Không tìm thấy khách hàng"}
              </div>

              {/* Form đăng ký hội viên nhanh — hiện khi có từ khóa tìm */}
              {debouncedSearch && !registerMode && (
                <div style={{
                  marginTop: 10, padding: "12px 14px",
                  background: "var(--lime-l)", borderRadius: "0.9rem",
                  border: "1.5px dashed var(--lime)",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    ⭐ Đăng ký hội viên nhanh
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                    Khách đồng ý để lại thông tin và tham gia tích điểm
                  </div>
                  <button className="btn btn--lime btn--sm" style={{ width: "100%" }}
                    onClick={() => {
                      const isPhone = /^\d+$/.test(debouncedSearch);
                      setNewName(isPhone ? "" : debouncedSearch);
                      setNewPhone(isPhone ? debouncedSearch : "");
                      setRegisterMode(true);
                    }}>
                    ⭐ Đăng ký hội viên cho khách này
                  </button>
                </div>
              )}

              {registerMode && (
                <div style={{
                  marginTop: 10, padding: "14px",
                  background: "var(--lime-l)", borderRadius: "0.9rem",
                  border: "1.5px solid var(--lime)",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                    ⭐ Thông tin hội viên mới
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      style={{ border: "1.5px solid var(--border)", borderRadius: "0.5rem", padding: "7px 10px", fontSize: 13, fontFamily: "var(--font-base)" }}
                      placeholder="Họ và tên *" value={newName}
                      onChange={e => setNewName(e.target.value)} autoFocus />
                    <input
                      style={{ border: "1.5px solid var(--border)", borderRadius: "0.5rem", padding: "7px 10px", fontSize: 13, fontFamily: "var(--font-base)" }}
                      placeholder="Số điện thoại *" value={newPhone}
                      onChange={e => setNewPhone(e.target.value)} type="tel" />
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button className="btn btn--ghost btn--sm" style={{ flex: 1 }}
                        onClick={() => setRegisterMode(false)}>Hủy</button>
                      <button className="btn btn--lime btn--sm" style={{ flex: 2 }}
                        disabled={!newName.trim() || !newPhone.trim() || isRegistering}
                        onClick={handleQuickRegister}>
                        {isRegistering ? "⏳ Đang đăng ký..." : "✓ Đăng ký & Chọn"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Danh sách khách hàng */}
          {displayList.map((c) => {
            const isSelected = selectedId === c.id;
            return (
              <div key={c.id}
                className={`cust-item${isSelected ? " cust-item--selected" : ""}`}
                onClick={() => handleSelect(c)}>
                <div className="cust-item__av" style={{ background: c.color }}>{c.initial}</div>
                <div className="cust-item__info">
                  <div className="cust-item__name">{c.name}</div>
                  <div className="cust-item__sub">
                    {c.phone} · {Number(c.points ?? 0).toLocaleString("vi-VN")} điểm
                    {c.tier && c.tier !== "—" ? ` · Hạng ${c.tier}` : ""}
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

          {/* End of list — chỉ hiện khi có kết quả thật */}
          {!isLoading && pagination.totalItem > 0 &&
           pagination.page >= pagination.totalPage && displayList.length > 0 && (
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