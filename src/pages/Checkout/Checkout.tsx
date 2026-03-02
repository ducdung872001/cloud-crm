import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import Icon from "components/icon";
import Button from "components/button/button";
import "./Checkout.scss";
import ModalCheckout from "./partials/ModalCheckout";

export default function Checkout() {
  document.title = "Bán hàng";

  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [paymentInfo] = useState({
    amount: "1,250,000 VND",
    content: "THANHTOAN_ORDER_XYZ",
  });

  const [tab, setTab] = useState({
    name: "tab_one",
  });

  const listTabs = [
    {
      title: "Chọn phương thức thanh toán",
      is_active: "tab_one",
    },
  ];

  const checkoutMethods = [
    { id: 1, name: "Chuyển khoản Vietcombank", type: "Thủ công", icon: "CreditCard", isQR: true },
    { id: 2, name: "Tiền mặt", type: "Thủ công", icon: "Banknote", isQR: false },
    { id: 3, name: "Momo", type: "Tích hợp", icon: "Wallet", isQR: true },
    { id: 4, name: "ZaloPay", type: "Tích hợp", icon: "Smartphone", isQR: true },
  ];

  return (
    <div className="page-content page-checkout">
      {" "}
      <TitleAction title="Bán hàng" />
      <div className="card-box d-flex flex-column">
        {" "}
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              {listTabs.map((item, idx) => (
                <li
                  key={idx}
                  className={item.is_active == tab.name ? "active" : ""}
                  onClick={(e) => {
                    e && e.preventDefault();
                    setTab({ name: item.is_active });
                  }}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="checkout-grid-container">
          {" "}
          {checkoutMethods.map((method) => (
            <div key={`checkout-${method.id}`} className="checkout-card-item">
              <div className="card-main-info">
                <div className="icon-box">
                  <Icon name={method.icon} />
                </div>
                <div className="info-text">
                  <span className="name">{method.name}</span>
                  <span className="type">Loại: {method.type}</span>
                </div>
              </div>

              <div className="card-actions justify-content-end">
                <Button color="primary" onClick={() => (method.isQR ? setShowQRModal(true) : console.log("Tiền mặt"))}>
                  Chọn
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ModalCheckout onShow={showQRModal} data={paymentInfo} onHide={() => setShowQRModal(false)} />
    </div>
  );
}
