import React, { Fragment, useState, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import "./index.scss";

interface QrScanModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export default function QrScanModal({ open, onClose, onAdd }: QrScanModalProps) {
  const [barcode, setBarcode] = useState("8938507680019");
  const [found, setFound] = useState(true);

  const handleSearch = () => {
    setFound(barcode.trim().length > 0);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            callback: onClose,
          },
          {
            title: "+ Thêm vào giỏ hàng",
            color: "primary",
            disabled: !found,
            callback: onAdd,
          },
        ],
      },
    }),
    [found, onClose, onAdd]
  );

  return (
    <Modal isFade={true} isOpen={open} isCentered={true} staticBackdrop={true} toggle={onClose} className="qr-modal">
      <ModalHeader title="📷 Quét mã sản phẩm" toggle={onClose} />

      <ModalBody>
        {/* Scanner viewport */}
        <div className="qr-modal__viewport">
          <div className="qr-modal__frame">
            <div className="qr-modal__corner qr-modal__corner--tl" />
            <div className="qr-modal__corner qr-modal__corner--tr" />
            <div className="qr-modal__corner qr-modal__corner--bl" />
            <div className="qr-modal__corner qr-modal__corner--br" />
            <span className="qr-modal__camera-icon">📷</span>
            <div className="qr-modal__scan-line" />
          </div>
          <div className="qr-modal__hint">Đưa mã vạch / QR vào khung</div>
        </div>

        {/* Manual input */}
        <div className="qr-modal__input-row">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Nhập mã vạch thủ công..."
          />
          <button type="button" className="btn btn--lime btn--sm" onClick={handleSearch}>
            Tìm
          </button>
        </div>

        {/* Result */}
        {found && (
          <div className="qr-modal__result">
            <span className="qr-modal__result-icon">🥛</span>
            <div>
              <div className="qr-modal__result-name">Đã nhận diện: Sữa TH True Milk 1L</div>
              <div className="qr-modal__result-detail">32,000 ₫ / hộp · Tồn: 142</div>
            </div>
          </div>
        )}

        {!found && barcode && (
          <div className="qr-modal__not-found">
            ❌ Không tìm thấy sản phẩm với mã <b>{barcode}</b>
          </div>
        )}
      </ModalBody>

      <ModalFooter actions={actions} />
    </Modal>
  );
}
