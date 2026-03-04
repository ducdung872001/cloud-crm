import React, { Fragment } from "react";
import { IAddCustomerViewerModalProps } from "model/customer/CustomerRequestModel";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import "./index.scss";
import Icon from "@/components/icon";

export default function ScoreHistoryModal(props: IAddCustomerViewerModalProps) {
  const { onShow, onHide, dataCustomer } = props;

  const handleClear = () => {
    onHide();
  };
  const listHistory = [
    {
      id: 1,
      time: "2024-06-01 10:00:00",
      change: "+10",
      type: "add",
      reason: "Mua hàng",
      invoiceCode: "HD001",
      iconType: "Cart",
    },
    {
      id: 2,
      time: "2024-06-02 14:30:00",
      change: "-5",
      type: "subtract",
      reason: "Hoàn trả hàng",
      invoiceCode: "HD002",
      iconType: "CashBook",
    },
    {
      id: 3,
      time: "2024-06-03 09:15:00",
      change: "+20",
      type: "add",
      reason: "Khuyến mãi",
      invoiceCode: "HD003",
      iconType: "Promotion",
    },
    {
      id: 4,
      time: "2024-06-04 16:45:00",
      change: "-10",
      type: "subtract",
      reason: "Sử dụng điểm để thanh toán",
      invoiceCode: "HD004",
      iconType: "Sell",
    },
    {
      id: 5,
      time: "2024-06-05 11:20:00",
      change: "+15",
      type: "add",
      reason: "Thưởng điểm",
      invoiceCode: "HD005",
      iconType: "Star",
    },
    {
      id: 6,
      time: "2024-06-06 13:50:00",
      change: "-8",
      type: "subtract",
      reason: "Điểm hết hạn",
      invoiceCode: "HD006",
      iconType: "CalendarTime",
    },
  ];
  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="sm"
        toggle={() => handleClear()}
        className="modal-score-history"
      >
        <div className="form__score--history">
          <ModalHeader title="Lịch sử điểm" toggle={() => handleClear()} />
          <ModalBody>
            <Fragment>
              {listHistory.map((item) => (
                <div key={item.id} className={`history-item ${item.type === "add" ? "add" : "subtract"}`}>
                  <div className={`history-icon ${item.iconType}`}>
                    <Icon name={item.iconType} color={item.type === "add" ? "#28a745" : "#dc3545"} />
                  </div>
                  <div className="">
                    <div className="history-top">
                      <div>
                        <div className="history-reason">{item.reason}</div>
                        <div className="history-time">{item.time}</div>
                      </div>
                      {/* <div className="history-invoice">
                        <div>Mã hóa đơn:</div>
                        <div className="invoice-code">{item.invoiceCode}</div>
                      </div> */}
                    </div>
                    <div className={`history-change ${item.type === "add" ? "add" : "subtract"}`}>{item.change}</div>
                  </div>
                </div>
              ))}
            </Fragment>
          </ModalBody>
          {/* <ModalFooter actions={actions} /> */}
        </div>
      </Modal>
    </Fragment>
  );
}
