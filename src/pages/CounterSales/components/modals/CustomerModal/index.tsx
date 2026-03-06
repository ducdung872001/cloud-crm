import React, { Fragment, useState, useMemo, useCallback } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { Customer } from "../../../types";
import "./index.scss";

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (customer: Customer) => void;
}

const CUSTOMERS: Customer[] = [
  { id: "1", name: "Nguyễn Thị Hoa", initial: "N", phone: "0901 234 567", points: 2450, tier: "Bạc", color: "#3b82f6" },
  { id: "2", name: "Trần Văn Bình", initial: "T", phone: "0912 456 789", points: 850, tier: "Đồng", color: "#059669" },
  { id: "3", name: "Lê Thị Minh", initial: "L", phone: "0978 654 321", points: 1200, tier: "Bạc", color: "#d97706" },
  { id: "4", name: "Phạm Quốc Huy", initial: "P", phone: "0965 111 222", points: 320, tier: "Đồng", color: "#7c3aed" },
  { id: "5", name: "Hoàng Thị Lan", initial: "H", phone: "0933 987 654", points: 5800, tier: "Vàng", color: "#dc2626" },
];

export default function CustomerModal({ open, onClose, onSelect }: CustomerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("1");

  const filtered = useMemo(() => CUSTOMERS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)), [search]);

  const handleSelect = useCallback(
    (c: Customer) => {
      setSelectedId(c.id);
      onSelect?.(c);
      onClose();
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
      <ModalHeader title="👤 Chọn khách hàng" toggle={onClose} />

      <ModalBody>
        {/* Search */}
        <div className="customer-modal__search">
          <span>🔍</span>
          <input type="text" placeholder="Tìm tên hoặc số điện thoại..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
        </div>

        {/* List */}
        <div className="customer-modal__list">
          {filtered.length === 0 && <div className="customer-modal__empty">Không tìm thấy khách hàng</div>}
          {filtered.map((c) => {
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
        </div>
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}
