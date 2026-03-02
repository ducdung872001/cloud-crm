import React from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";
import "./ModalCheckout.scss";

export default function ModalCheckout(props: any) {
  const { onShow, onHide, data } = props;

  const footerActions: IActionModal = {
    actions_right: {
      buttons: [
        {
          title: "Hoàn tất thanh toán",
          color: "primary",
          callback: () => onHide(),
        },
      ],
    },
  };

  return (
    <Modal isOpen={onShow} isCentered={true} toggle={onHide} isFade={true} staticBackdrop={true} className="modal-qr-payment">
      <div className="form-package-group">
        <ModalHeader title="Mã QR Thanh toán" toggle={onHide} />
        <ModalBody>
          <div className="qr-payment-container text-center p-24">
            <p className="mb-16 text-muted" style={{ fontSize: "1.4rem", color: "#666" }}>
              Vui lòng quét mã QR để hoàn tất giao dịch
            </p>

            <div className="qr-image-wrapper mb-24" style={{ display: "flex", justifyContent: "center" }}>
              <div
                className="qr-placeholder"
                style={{
                  width: "250px",
                  height: "250px",
                  border: "1px solid #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f9f9f9",
                }}
              >
                <span style={{ fontSize: "1.4rem", color: "#888" }}>Mã QR sẽ hiển thị ở đây</span>
              </div>
            </div>

            <div className="payment-details">
              <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
                Số tiền: <strong>{data?.amount || "0 VND"}</strong>
              </h3>
              <p style={{ fontSize: "1.4rem", color: "#444" }}>
                Nội dung: <strong>{data?.content || "THANHTOAN_ORDER"}</strong>
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter actions={footerActions} />
      </div>
    </Modal>
  );
}
