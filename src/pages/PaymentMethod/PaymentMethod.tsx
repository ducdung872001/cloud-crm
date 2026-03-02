import React, { useState } from "react";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Icon from "components/icon";
import "./PaymentMethod.scss";
import ModalPaymentMethod from "./partials/ModalPaymentMethod";
import Button from "components/button/button";

export default function PaymentMethodList() {
  document.title = "Quản lý Phương thức Thanh toán";

  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  const [tab, setTab] = useState({
    name: "tab_one",
  });

  const listTabs = [
    {
      title: "Danh sách phương thức",
      is_active: "tab_one",
    },
  ];

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: "Tiền mặt", type: "Thủ công", icon: "Banknote", active: true },
    { id: 2, name: "Chuyển khoản Vietcombank", type: "Thủ công", icon: "CreditCard", active: true },
    { id: 3, name: "Ví điện tử MoMo", type: "Tự động", icon: "Wallet", active: false },
    { id: 4, name: "Thẻ tín dụng/Ghi nợ", type: "Tự động", icon: "CreditCard", active: true },
  ]);

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm mới",
        callback: () => {
          setSelectedData(null);
          setShowModal(true);
        },
      },
    ],
  };

  const actionsTable = (item: any) => [
    {
      title: "Sửa",
      icon: <Icon name="Pencil" />,
      callback: () => {
        setSelectedData(item);
        setShowModal(true);
      },
    },
    {
      title: "Xóa",
      icon: <Icon name="Trash" className="icon-error" />,
      // callback: () => showDialogConfirmDelete(item),
    },
  ];

  const toggleStatus = (id: number) => {
    setPaymentMethods((prev) => prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item)));
  };

  return (
    <div className="page-content page-payment-method">
      <TitleAction title="Phương thức thanh toán" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
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

        <div className="payment-grid-container">
          {paymentMethods.map((method) => (
            <div key={`payment-${method.id}`} className="payment-card-item">
              <div className="card-main-info">
                <div className="icon-box">
                  <Icon name={method.icon} />
                </div>
                <div className="info-text">
                  <span className="name">{method.name}</span>
                  <span className="type">Loại: {method.type}</span>
                </div>
              </div>

              <div className="card-actions">
                <div className="switch-wrapper">
                  <input type="checkbox" className="base-switch" checked={method.active} onChange={() => toggleStatus(method.id)} />
                </div>
                {/* <div className="btn-group">
                  <button
                    className="btn-action btn-edit"
                    title="Sửa"
                    onClick={() => {
                      setSelectedData(method);
                      setShowModal(true);
                    }}
                  >
                    <Icon name="Pencil" />
                  </button>
                  <button className="btn-action btn-delete" title="Xóa">
                    <Icon name="Trash" />
                  </button>
                </div> */}
                <div className="btn-group">
                  {actionsTable(method).map((action, index) => (
                    <Button
                      key={index}
                      type="button"
                      color="transparent" // Sử dụng màu transparent giống BoxTable
                      onlyIcon={true}
                      onClick={action.callback}
                      dataTip={action.title} // Tooltip khi hover
                    >
                      {action.icon}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ModalPaymentMethod onShow={showModal} data={selectedData} onHide={() => setShowModal(false)} />
    </div>
  );
}
