import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import ImgQrBill from "assets/images/qr-bill.png";
import ImgBill from "assets/images/logo-print.png";
import { UserContext, ContextType } from "contexts/userContext";
// import PrintingSettingsService from "services/PrintingSettingsService";
import { formatCurrency } from "utils/common";

interface IPrintSmallProps {
  data: any;
  isPrint: boolean;
}

export default function PrintSmall(props: IPrintSmallProps) {
  const { data, isPrint } = props;

  const refPrintSmall = useRef(null);

  const { product_store, username } = useContext(UserContext) as ContextType;

  const [infoSettingPrint, setInfoSettingPrint] = useState(null);

  const getInfoSettingPrint = async () => {
    return;
    // const response = await PrintingSettingsService.infoPrintInvoice();

    if (response.code === 200) {
      const result = response.result;
      setInfoSettingPrint(result);
    }
  };

  useEffect(() => {
    if (isPrint) {
      getInfoSettingPrint();
    }
  }, [isPrint]);

  // thực hiện hành động in hóa đơn A4 / A5
  const handPrintInvoiceSmall = useReactToPrint({
    content: () => refPrintSmall.current,
  });

  useEffect(() => {
    if (isPrint && product_store && infoSettingPrint) {
      handPrintInvoiceSmall();
    }
  }, [isPrint, product_store, infoSettingPrint]);

  return (
    <div className="wrapper__print--small">
      <div className="box__print--small" ref={refPrintSmall}>
        <div className="info__header--print">
          <div className="header__print--top">
            <div className="logo-invoice">
              {infoSettingPrint && infoSettingPrint?.length > 0 && infoSettingPrint[2]["value"] ? (
                <img src={infoSettingPrint[2]["value"]} alt="logo hóa đơn" />
              ) : (
                <img src={ImgBill} alt="logo hóa đơn" />
              )}
            </div>
            <div className="info__product--store">
              <h3>{product_store?.name}</h3>

              <div className="dept__store">
                <span className="address">Địa chỉ: {product_store.address}</span>
                <span className="phone">Số điện thoại: {product_store.phone}</span>
              </div>
            </div>
          </div>
          {infoSettingPrint && infoSettingPrint?.length > 0 && infoSettingPrint[1]["value"] && (
            <div className="info__header__setting--print">{infoSettingPrint[1]["value"]}</div>
          )}

          <div className="seperate" />
        </div>

        {data && (
          <Fragment>
            <div className="info__body--print">
              <div className="body__print--top">
                <div className="title-invoice">
                  <h2>Hóa đơn bán hàng</h2>
                  <span className="date-shopping">
                    Ngày bán: {moment(data.receipt_date).format("DD/MM/YYYY")} - {moment(data.receipt_date).format("HH:mm")}
                  </span>
                </div>

                <div className="info__invoice">
                  <div className="info__invoice--left">
                    <div className="item-left">
                      <span className="value">Mã phiếu: {data.invoice_code}</span>
                    </div>
                    <div className="item-left">
                      <span className="value">Khách hàng: {data?.customer?.name || "Khách lẻ"}</span>
                    </div>
                    <div className="item-left">
                      <span className="value">Người bán: {data?.seller?.full_name}</span>
                    </div>
                  </div>
                  <div className="info__invoice--right">
                    <img src={ImgQrBill} alt="img-bill" />
                  </div>
                </div>
              </div>

              {data.combos && data.combos.length ? (
                <div className="body__print--combo">
                  <div className="thead">
                    <div className="th">Tên combo</div>
                    <div className="th">Giá liều</div>
                    <div className="th">Ghi chú</div>
                  </div>

                  {data.combos.map((item, idx) => {
                    return (
                      <div key={idx} className="tbody">
                        <div className="td">{item.name}</div>
                        <div className="td">{formatCurrency(item.price, ",", "")}</div>
                        <div className="td">{item.note}</div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {[...data.retails, ...(data.prescriptions.length > 0 ? data.prescriptions[0]["units"] : [])].length > 0 ? (
                <div className="body__print--bottom">
                  <div className="thead">
                    <div className="th">Mặt hàng</div>
                    <div className="th">Đơn vị</div>
                    <div className="th">Giá</div>
                    <div className="th">SL</div>
                    <div className="th">Thành tiền</div>
                  </div>

                  {[...data.retails, ...(data.prescriptions.length > 0 ? data.prescriptions[0]["units"] : [])].map((item, idx) => {
                    return (
                      <div key={idx} className="tbody">
                        <div className="td">{item.product?.name || item.product_name}</div>
                        <div className="td">{item.unit_name}</div>
                        <div className="td">{formatCurrency(item.cost, ",", "")}</div>
                        <div className="td">{item.quantity}</div>
                        <div className="td">{formatCurrency((item.quantity || 0) * (item.cost || 0), ",", "")}</div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <div className="seperate" />
            </div>

            <div className="info__bottom--print">
              <div className="summary__invoice">
                <div className="item-invoice">
                  <span className="key">Số lượng mặt hàng:</span>
                  <span className="value">
                    {[...data.retails, ...(data.prescriptions.length > 0 ? data.prescriptions[0]["units"] : []), ...data.combos].length}
                  </span>
                </div>
                <div className="item-invoice">
                  <span className="key">Tổng tiền (VNĐ):</span>
                  <span className="value">
                    <strong>{formatCurrency(+data.amount)}</strong>
                  </span>
                </div>
                <div className="item-invoice">
                  <span className="key">Giảm giá (VNĐ):</span>
                  <span className="value">
                    <strong>{formatCurrency(+data.discount || 0)}</strong>
                  </span>
                </div>
                <div className="item-invoice">
                  <span className="key">Đã thanh toán (VNĐ):</span>
                  <span className="value">
                    <strong>{formatCurrency(+data.pay_amount || 0)}</strong>
                  </span>
                </div>
                <div className="item-invoice">
                  <span className="key">Công nợ (VNĐ):</span>
                  <span className="value">
                    <strong>{formatCurrency(+data.amount - (+data.discount || 0) - (+data.pay_amount || 0))}</strong>
                  </span>
                </div>
              </div>
            </div>
          </Fragment>
        )}

        {infoSettingPrint && infoSettingPrint?.length > 0 && infoSettingPrint[0]["value"] && (
          <div className="info__bottom__setting--print">{infoSettingPrint[0]["value"]}</div>
        )}
      </div>
    </div>
  );
}
