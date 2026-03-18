import React, { useEffect, useState } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./ModalDetailOrder.scss";
import Button from "@/components/button/button";
import Icon from "@/components/icon";
import Badge from "@/components/badge/badge";
import { showToast } from "@/utils/common";
import OrderRequestService from "@/services/OrderRequestService";

export default function ModalDetailOrder(props: any) {
  const { onShow, onHide, dataOrder } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [listProduct, setListProduct] = useState([]);
  const [dataTotal, setDataTotal] = useState([]);
  const [infoUser, setInfoUser] = useState([
    {
      lable: "Người nhận",
      value: "Trần Văn Bình",
    },
    {
      lable: "Số điện thoại",
      value: "0912345678",
    },
    {
      lable: "Địa chỉ",
      value: "45 Lý Thường Kiệt, P.7, Q.10, TP.HCM",
    },
    {
      lable: "Đơn vị vận chuyển",
      value: "SPX Express",
    },
  ]);

  useEffect(() => {
    if (onShow && dataOrder) {
      setIsSubmit(false);
      let listProduct = [];
      try {
        listProduct = JSON.parse(dataOrder.orderInfo).items.map((item) => ({
          title: item.name,
          des: item.name.match(/\(([^)]+)\)/)?.[1] || "", //Lấy phần thông tin trong ngoặc đơn của item.name
          value: `${item.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`,
          price: item.price,
          quantity: item.qty,
        }));
      } catch (error) {
        console.error("Error parsing order info:", error);
      }
      setListProduct(listProduct);
      setDataTotal([
        {
          lable: "Tiền hàng",
          value: listProduct
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
        },
        {
          lable: "Phí vận chuyển",
          value: "30.000₫",
        },
        {
          lable: "Voucher Shopee",
          value: "-20.000₫",
          color: "green",
        },
        {
          lable: "Tổng thanh toán",
          value: listProduct
            .reduce((total, item) => total + item.price * item.quantity - 20000 + 30000, 0)
            .toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
          color: "#FF6633",
          fontSize: 16,
          fontWeight: "700",
        },
      ]);
      let customerInfo = {
        name: "",
        phone: "",
        address: "",
      };
      try {
        customerInfo = JSON.parse(dataOrder.customerInfo).user;
      } catch (error) {
        console.error("Error parsing customer info:", error);
      }
      setInfoUser([
        {
          lable: "Người nhận",
          value: customerInfo?.name || "",
        },
        {
          lable: "Số điện thoại",
          value: customerInfo?.phone || "",
        },
        {
          lable: "Địa chỉ",
          value: customerInfo?.address || "",
        },
        {
          lable: "Đơn vị vận chuyển",
          value: dataOrder?.shippingUnit || "SPX Express",
        },
      ]);
    }
  }, [onShow, dataOrder]);

  const dataStep = [
    {
      step: 1,
      lable: "Đặt hàng",
      checked: true,
    },
    {
      step: 2,
      lable: "Xác nhận",
      checked: false,
    },
    {
      step: 3,
      lable: "Đóng gói",
      checked: false,
    },
    {
      step: 4,
      lable: "Vận chuyển",
      checked: false,
    },
    {
      step: 5,
      lable: "Hoàn tất",
      checked: false,
    },
  ];
  //   CONFIRMED, // Xác nhận
  // SHIPPING,   // Đang giao
  // COMPLETED,      // Đã hoàn thành
  // CANCELED; // Hủy
  const handleConfirm = async (item: any) => {
    await OrderRequestService.confirm({
      status: "CONFIRMED",
      id: item.id,
    }).then((res) => {
      if (res.code === 0) {
        showToast("Xác nhận đơn hàng thành công", "success");
        // fetchData(params);
      } else {
        showToast(res.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    });
  };

  const onSubmit = async (e?) => {
    e?.preventDefault();
    handleConfirm(dataOrder);
    handleClear(true);
  };

  const actions: IActionModal = {
    actions_right: {
      buttons: [
        {
          title: "Từ chối",
          color: "primary",
          variant: "outline",
          disabled: isSubmit,
          callback: () => onHide(),
        },
        {
          title: "In biên lai",
          color: "primary",
          variant: "outline",
          disabled: isSubmit,
          callback: () => {},
        },
        {
          title: "Xác nhận đơn",
          type: "submit",
          color: "primary",
          disabled: isSubmit,
          is_loading: isSubmit,
          callback: () => {
            onSubmit();
            setIsSubmit(true);
          },
        },
      ],
    },
  };

  const handleClear = (acc) => {
    onHide(acc);
  };

  return (
    <Modal
      isOpen={onShow}
      className="modal-detail-order"
      isFade={true}
      staticBackdrop={true}
      toggle={() => !isSubmit && onHide()}
      isCentered={true}
      size="lg"
    >
      <form className="form-detail-order" onSubmit={(e) => onSubmit(e)}>
        {/* <ModalHeader title={dataOrder?.code || ''} toggle={() => !isSubmit && onHide()} /> */}
        <div className="container-header">
          <div className="box-title">
            <h4>{dataOrder?.code}</h4>
            <div>
              <span style={{ fontSize: 14, fontWeight: "400", color: "var(--extra-color-30)" }}>
                {dataOrder?.app} · {dataOrder?.time}
              </span>
            </div>
          </div>
          <div className="right-header">
            <div className="status">
              <Badge
                text={
                  dataOrder?.status === 1 ? "Chờ xử lý" : dataOrder?.status === 2 ? "Đang giao" : dataOrder?.status === 3 ? "Hoàn thành" : "Đã hủy"
                }
                variant={dataOrder?.status === 1 ? "warning" : dataOrder?.status === 2 ? "primary" : dataOrder?.status === 3 ? "success" : "error"}
              />
            </div>
            <Button onClick={() => !isSubmit && handleClear(false)} type="button" className="btn-close" color="transparent" onlyIcon={true}>
              <Icon name="Times" />
            </Button>
          </div>
        </div>
        <ModalBody>
          <div className="kanban-order">
            {dataStep.map((item, index) => (
              <div key={index}>
                <div className="item-kanban">
                  <div
                    className="step-kanban"
                    style={{ backgroundColor: item.step === 1 ? "green" : item.step === 2 ? "#FF6633" : "var(--extra-color-30)" }}
                  >
                    {item.step === 1 ? (
                      <Icon name="Checked" style={{ width: 15, fill: "white" }} />
                    ) : (
                      <span style={{ fontSize: 14, fontWeight: "600", color: "white" }}>{item.step}</span>
                    )}
                  </div>

                  {item.step === 5 ? null : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem 0", marginTop: "1.5rem" }}>
                      <div
                        style={{ width: "8rem", height: 2, backgroundColor: item.checked ? "green" : "var(--extra-color-20)", borderRadius: "10px" }}
                      />
                      <div
                        style={{
                          width: "8rem",
                          height: 2,
                          backgroundColor: item.checked ? "green" : "var(--extra-color-20)",
                          borderRadius: "10px",
                          marginLeft: "2rem",
                        }}
                      />
                    </div>
                  )}
                </div>
                <div style={{ marginLeft: "-1.1rem" }}>
                  <span style={{ fontSize: 12, fontWeight: "500" }}>{item.lable}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="product-order">
            <div>
              <span style={{ fontSize: 14, fontWeight: "500" }}>SẢN PHẨM ĐẶT MUA</span>
            </div>

            <div className="list-product">
              {listProduct.map((item, index) => (
                <div key={index} className="item-product">
                  <div className="body-product">
                    <span style={{ fontSize: 14, fontWeight: "500" }}>{item.title}</span>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: "400", color: "var(--extra-color-30)" }}>{item.des}</span>
                    </div>
                  </div>

                  <div className="box-value">
                    <span style={{ fontSize: 14, fontWeight: "500", color: "#FF6633" }}>{item.value}</span>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: "400", color: "var(--extra-color-30)" }}> x {item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="total-money">
              {dataTotal.map((item, index) => (
                <div key={index} className="item-money" style={index === dataTotal?.length - 1 ? { borderBottom: 0 } : {}}>
                  <span style={{ fontSize: 14, fontWeight: "500" }}>{item.lable}</span>

                  <div>
                    <span style={{ fontSize: item.fontSize || 14, fontWeight: item.fontWeight || "500", color: item.color }}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="info-user">
            <div>
              <span style={{ fontSize: 14, fontWeight: "500" }}>THÔNG TIN GIAO HÀNG</span>
            </div>

            <div>
              {infoUser.map((item, index) => (
                <div key={index} className="item-info" style={index === dataTotal?.length - 1 ? { borderBottom: 0 } : {}}>
                  <span style={{ fontSize: 14, fontWeight: "500" }}>{item.lable}</span>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: "600" }}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </form>
    </Modal>
  );
}
