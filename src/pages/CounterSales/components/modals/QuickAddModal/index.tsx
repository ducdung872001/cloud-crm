import React, { useEffect, useRef, useState } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import { CartItem } from "../../../types";
import "./index.scss";

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, "qty">) => void;
}

const UNITS = ["Cái", "Chiếc", "Hộp", "Kg", "Gram", "Lít", "Bộ", "Dịch vụ", "Giờ", "Lần"];

const QuickAddModal: React.FC<QuickAddModalProps> = ({ open, onClose, onAddToCart }) => {
  const [name, setName]         = useState("");
  const [price, setPrice]       = useState("");
  const [unit, setUnit]         = useState("Cái");
  const [nameError, setNameError]   = useState("");
  const [priceError, setPriceError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  // Reset form mỗi lần mở
  useEffect(() => {
    if (open) {
      setName(""); setPrice(""); setUnit("Cái");
      setNameError(""); setPriceError("");
      setTimeout(() => nameRef.current?.focus(), 120);
    }
  }, [open]);

  const validate = (): boolean => {
    let ok = true;
    if (!name.trim()) {
      setNameError("Vui lòng nhập tên sản phẩm / dịch vụ");
      ok = false;
    } else {
      setNameError("");
    }
    const priceNum = Number(price.replace(/[^0-9]/g, ""));
    if (!price || priceNum <= 0) {
      setPriceError("Vui lòng nhập giá hợp lệ (> 0)");
      ok = false;
    } else {
      setPriceError("");
    }
    return ok;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const priceNum = Number(price.replace(/[^0-9]/g, ""));
    const quickItem: Omit<CartItem, "qty"> = {
      // Prefix "quick_" phân biệt với SP hệ thống → backend không trừ tồn kho
      id:        `quick_${Date.now()}`,
      variantId: `quick_v_${Date.now()}`,
      icon:      "⚡",
      name:      name.trim(),
      price:     priceNum,
      priceLabel: priceNum.toLocaleString("vi") + " ₫",
      unit,
      unitName:  unit,
    };
    onAddToCart(quickItem);
    onClose();
  };

  // Format giá VND khi gõ
  const handlePriceChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    if (!digits) { setPrice(""); return; }
    setPrice(Number(digits).toLocaleString("vi"));
  };

  const priceNum = Number(price.replace(/[^0-9]/g, ""));

  const actions: IActionModal = {
    actions_right: {
      buttons: [
        { title: "Hủy",             color: "primary", variant: "outline", callback: onClose },
        { title: "⚡ Thêm vào giỏ", color: "primary", callback: handleAdd },
      ],
    },
  };

  return (
    <Modal isFade isOpen={open} isCentered staticBackdrop toggle={onClose} className="quick-add-modal">
      <ModalHeader title="⚡ Thêm nhanh sản phẩm / dịch vụ" toggle={onClose} />

      <ModalBody>
        <p className="qam-hint">
          Dành cho mặt hàng chưa có trong danh mục — thêm thẳng vào giỏ, không ghi nhận tồn kho.
        </p>

        {/* Tên sản phẩm */}
        <div className={`qam-field${nameError ? " qam-field--error" : ""}`}>
          <label className="qam-label">
            Tên sản phẩm / dịch vụ <span className="qam-required">*</span>
          </label>
          <input
            ref={nameRef}
            className="qam-input"
            type="text"
            placeholder="VD: Phí lắp đặt, Cáp sạc iPhone 15..."
            value={name}
            onChange={(e) => { setName(e.target.value); if (nameError) setNameError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          />
          {nameError && <span className="qam-error">{nameError}</span>}
        </div>

        {/* Giá + Đơn vị */}
        <div className="qam-row">
          <div className={`qam-field qam-field--price${priceError ? " qam-field--error" : ""}`}>
            <label className="qam-label">
              Đơn giá (₫) <span className="qam-required">*</span>
            </label>
            <div className="qam-price-wrap">
              <input
                className="qam-input"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={price}
                onChange={(e) => { handlePriceChange(e.target.value); if (priceError) setPriceError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              />
              <span className="qam-currency">₫</span>
            </div>
            {priceError && <span className="qam-error">{priceError}</span>}
          </div>

          <div className="qam-field qam-field--unit">
            <label className="qam-label">Đơn vị tính</label>
            <select
              className="qam-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Preview card */}
        {name.trim() && priceNum > 0 && (
          <div className="qam-preview">
            <span className="qam-preview__icon">⚡</span>
            <span className="qam-preview__name">{name.trim()}</span>
            <span className="qam-preview__price">
              {priceNum.toLocaleString("vi")} ₫ / {unit}
            </span>
          </div>
        )}
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
};

export default QuickAddModal;
