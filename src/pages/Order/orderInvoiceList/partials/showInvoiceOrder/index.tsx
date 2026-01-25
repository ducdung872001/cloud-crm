import React, { Fragment, useState, useEffect, useMemo, useContext, useRef } from "react";
import moment from "moment";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "components/modal/modal";
import { IAction, IActionModal } from "types/OtherModel";
import Logo from "assets/images/logo-print.png";
import { ContextType, UserContext } from "contexts/userContext";
import { formatCurrency, showToast } from "utils/common";
import OrderService from "services/OrderService";
import ProductService from "services/ProductService";
import PrintSmall from "components/printSmall/printSmall";
import "./index.scss";
import EmployeeService from "services/EmployeeService";

interface IShowInvoiceOrderProps {
  onShow: boolean;
  onHide: () => void;
  id: number;
  data?: any;
  action?: "view" | "edit";
}

export default function ShowInvoiceOrder(props: IShowInvoiceOrderProps) {
  const { onShow, onHide, data, id, action } = props;

  const navigate = useNavigate();

  const refPrintInvoice = useRef(null);

  // const { product_store, username } = useContext(UserContext) as ContextType;

  const [infoInvoice, setInfoInvoice] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [infoPrintSmall, setInfoPrintSmall] = useState(null);
  const [isPrintSmall, setIsPrintSmall] = useState<boolean>(false);

  useEffect(() => {
    if (onShow && id) {
      setInfoInvoice(data);
      setInfoPrintSmall(data);

      // Gọi API để lấy chi tiết sản phẩm và gán vào orderDetails
      const fetchProductDetails = async () => {
        if (data?.orderDetails && data.orderDetails.length > 0) {
          try {
            const updatedOrderDetails = await Promise.all(
              data.orderDetails.map(async (item) => {
                if (item.objectId) {
                  try {
                    const response = await ProductService.detail(item.objectId);
                    if (response && response.result) {
                      return {
                        ...item,
                        code: response.result.code || item.code,
                        name: response.result.name || item.name,
                        unitName: response.result.unitName,
                      };
                    }
                  } catch (error) {
                  }
                }
                return item;
              })
            );
            setOrderDetails(updatedOrderDetails);
          } catch (error) {
            setOrderDetails(data.orderDetails);
          }
        } else {
          setOrderDetails(data?.orderDetails || []);
        }
      };

      //Gọi API lấy chi tiết nhân viên đặt hàng
      const fetchSaleDetails = async () => {
        if (!data?.saleId) return;

        try {
          const response = await EmployeeService.detail(data.saleId);
          if (response?.result) {
            setInfoInvoice((prev) => ({
              ...prev,
              sale: response.result.name, 
            }));
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchSaleDetails();
      fetchProductDetails();
    }
  }, [onShow, id, data]);

  const titles = ["Mã sản phẩm", "Tên sản phẩm", "Hạn dùng", "Đơn vị tính", "Giá bán", "Số lượng", "Thành tiền", "Ghi chú"];

  const dataFormat = ["", "", "", "text-right", "text-right", "text-right", "text-right", ""];

  const dataMappingArray = (item) => [
    item.code,
    item.name,
    moment(item.expiry_date).format("DD/MM/YYYY"),
    item.unitName,
    formatCurrency(+item.cost),
    +item.quantity,
    formatCurrency(+item.cost * +item.quantity),
    item.note,
  ];

  // thực hiện hành động in hóa đơn A4 / A5
  const handPrintInvoice = useReactToPrint({
    content: () => refPrintInvoice.current,
  });

  useEffect(() => {
    if (isPrintSmall) {
      setTimeout(() => {
        setIsPrintSmall(false);
      }, 500);
    }
  }, [isPrintSmall]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "In hóa đơn A4 / A5",
            variant: "outline",
            callback: () => {
              handPrintInvoice();
            },
          },
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              action === "edit" ? navigate("/order_invoice_list") : onHide();
            },
          },
        ],
      },
    }),
    [action]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => onHide()}
        className={classNames("modal__invoice--order")}
      >
        <div className="wrapper__info">
          <ModalHeader title={`Xem chi tiết hóa đơn - ${data?.orderCode || infoInvoice?.orderCode || ""}`} toggle={() => navigate("/order_invoice_list")} />
          <ModalBody>
            {infoInvoice?.id && (
              <div ref={refPrintInvoice} className="body--info">
                {/* <div className="info__product--store">
                  <div className="logo-store">
                    <img src={Logo} alt="logo" />
                  </div>
                  <div className="dept__store">
                    <h3 className="name-store">{product_store?.name}</h3>
                    <div className="address-store">
                      Địa chỉ: <strong>{product_store?.address || "Hà Nội"}</strong>
                    </div>
                    <div className="phone-store">
                      Số điện thoại: <strong>{product_store?.phone}</strong>
                    </div>
                  </div>
                </div> */}

                <div className="info__invoice">
                  <h2 className="title-invoice">Thông tin hóa đơn đặt hàng</h2>

                  <Fragment>
                    {infoInvoice?.id && (
                      <Fragment>
                        <div className="info__invoice--top">
                          <div className="item-top">
                            Mã hóa đơn: <strong className="ml-1">{infoInvoice?.orderCode}</strong>
                          </div>
                          <div className="item-top">
                            Ngày đặt hàng: <strong className="ml-1">{moment(infoInvoice?.orderDate).format("DD/MM/YYYY")}</strong>
                          </div>
                          <div className="item-top">
                            Ngày nhận hàng mong muốn: <strong className="ml-1">{moment(infoInvoice?.expectedDate).format("DD/MM/YYYY")}</strong>
                          </div>
                          <div className="item-top">
                            Hình thức thanh toán:
                            <strong className="ml-1">
                              {infoInvoice?.paymentMethod === "cash"
                                ? "Tiền mặt"
                                : infoInvoice?.paymentMethod === "banking"
                                ? "Chuyển khoản"
                                : "Hình thức khác"}
                            </strong>
                          </div>
                          <div className="item-top">
                            NV đặt hàng: <strong className="ml-1">{infoInvoice?.sale || ""}</strong>
                          </div>
                          <div className="item-top">
                            Ghi chú: <strong className="ml-1">{infoInvoice?.note}</strong>
                          </div>
                          <div className="item-top">
                            Trạng thái hóa đơn:
                            <strong className="ml-1">
                              {infoInvoice?.status === "done" || infoInvoice?.status === "gdp_confirm" ? (
                                <span style={{ color: "var(--success-darker-color)" }}>
                                  {infoInvoice?.status === "Done" ? "Hoàn thành" : "Đã phê duyệt"}
                                </span>
                              ) : infoInvoice?.status === "wait_gdp_processing" ||
                                infoInvoice?.status === "gdp_processing" ||
                                infoInvoice?.status === "temp" ? (
                                <span style={{ color: "var(--warning-darker-color)" }}>
                                  {infoInvoice?.status === "wait_gdp_processing"
                                    ? ""
                                    : infoInvoice?.status === "gdp_processing"
                                    ? "Đang xử lý"
                                    : "Lưu tạm"}
                                </span>
                              ) : infoInvoice?.status === "wait_gdp_confirm" || infoInvoice?.status === "wait_gpp_confirm" ? (
                                <span style={{ color: "var(--primary-color)" }}>
                                  {infoInvoice?.status === "wait_gdp_confirm" ? "Đang đợi phê duyệt" : "Đang đợi xác nhận"}
                                </span>
                              ) : (
                                <span style={{ color: "var(--error-darker-color)" }}>
                                  {infoInvoice?.status === "gdp_cancel" ? "Đã hủy" : "Đã hủy"}
                                </span>
                              )}
                            </strong>
                          </div>
                        </div>

                        {orderDetails && orderDetails.length > 0 && (
                          <div className="table__details">
                            <h3 className="title-detail">Thông tin sản phẩm (đơn vị tính: VNĐ)</h3>

                            <BoxTable
                              name="Danh sách sản phẩm bán lẻ"
                              titles={titles}
                              dataFormat={dataFormat}
                              items={orderDetails}
                              dataMappingArray={(item) => dataMappingArray(item)}
                              actionType="inline"
                            />
                          </div>
                        )}

                        <div className="info__summary">
                          <h3 className="title-summary">Thông tin thanh toán</h3>

                          <div className="lst__info--summary">
                            <div className="item-summary">
                              <span className="key">Số lượng mặt hàng:</span>
                              <span className="value">
                                <strong>{[...infoInvoice?.orderDetails].length}</strong>
                              </span>
                            </div>

                            <div className="item-summary">
                              <span className="key">Tổng tiền (vnđ):</span>
                              <span className="value">
                                <strong>{formatCurrency(+infoInvoice?.amount)}</strong>
                              </span>
                            </div>

                            <div className="item-summary">
                              <span className="key">Tổng tiền VAT (vnđ):</span>
                              <span className="value">
                                <strong>{formatCurrency(+infoInvoice?.vat_amount || 0)}</strong>
                              </span>
                            </div>

                            <div className="item-summary">
                              <span className="key">Giảm giá (vnđ):</span>
                              <span className="value">
                                <strong>{formatCurrency(+infoInvoice?.discount || 0)}</strong>
                              </span>
                            </div>

                            <div className="item-summary">
                              <span className="key">Số tiền phải trả (vnđ):</span>
                              <span className="value">
                                <strong>{formatCurrency(+infoInvoice?.amount - (+infoInvoice?.discount || 0))}</strong>
                              </span>
                            </div>

                            <div className="item-summary">
                              <span className="key">Số tiền đã trả (vnđ):</span>
                              <span className="value">
                                <strong>{formatCurrency(+infoInvoice?.pay_amount || 0)}</strong>
                              </span>
                            </div>

                            <div className="item-summary">
                              <span className="key">Công nợ (vnđ):</span>
                              <span className="value">
                                <strong>
                                  {formatCurrency(+infoInvoice?.amount - (+infoInvoice?.discount || 0) - (+infoInvoice?.pay_amount || 0))}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    )}
                  </Fragment>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
