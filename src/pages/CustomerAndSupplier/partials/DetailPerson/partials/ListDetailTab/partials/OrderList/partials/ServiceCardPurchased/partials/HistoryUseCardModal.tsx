import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import { IInvoiceResponse } from "model/invoice/InvoiceResponse";
import { IHistoryUseCardModalProps } from "model/invoice/PropsModel";
import ModalReceipt, { ModalBodyReceipt, ModalFooterReceipt } from "components/modalReceipt/modalReceipt";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import Badge from "components/badge/badge";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import { HISTORY_USE_CARD_SERVICE } from "utils/constant";
import InvoiceService from "services/InvoiceService";
import NoCreditCard from "assets/images/no-credit-card.png";
import "./HistoryUseCardModal.scss";

export default function HistoryUseCardModal(props: IHistoryUseCardModalProps) {
  const { onShow, onHide, id, infoCard } = props;

  const componentRef = useRef(null);

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getHistoryUseCard = async (id: number) => {
    setIsLoading(true);

    const response = await InvoiceService.historyUseCard(id);

    if (response.code === 0) {
      const result = response.result;
      setData(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && id) {
      getHistoryUseCard(id);
    }
  }, [onShow, id]);

  const titles = ["STT", "Mã hóa đơn", "Ngày bán", "Tổng tiền", "VAT", "Giảm giá", "Đã thanh toán", "Trả từ thẻ", "Công nợ", "Trạng thái hóa đơn"];

  const dataFormat = ["text-center", "", "", "text-right", "text-right", "text-right", "text-right", "text-right", "text-right", "text-center"];

  const dataMappingArray = (item: IInvoiceResponse, index: number) => [
    index + 1,
    item.invoiceCode,
    moment(item.receiptDate).format("DD/MM/YYYY"),
    formatCurrency(item.fee),
    "0",
    formatCurrency(item.discount ? item.discount : "0"),
    formatCurrency(item.paid),
    formatCurrency(item.amountCard ? item.amountCard : "0"),
    formatCurrency(item.debt),
    <Badge
      key={item.id}
      text={item.status === 1 ? "Hoàn thành" : item.status === 2 ? "Chưa hoàn thành" : "Đã hủy"}
      variant={item.status === 1 ? "success" : item.status === 2 ? "warning" : "error"}
    />,
  ];

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide();
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <ModalReceipt isOpen={onShow} isFade={true} staticBackdrop={true} isCentered={true} toggle={() => onHide()} className="modal-history__card">
        {!isLoading && infoCard ? (
          <div ref={componentRef}>
            <ModalBodyReceipt
              type={HISTORY_USE_CARD_SERVICE}
              name="Danh sách hóa đơn tiêu dùng"
              nameCard={infoCard.name}
              code={infoCard.cardNumber}
              style={{
                marginTop: "2rem",
              }}
              valueCard={infoCard.cash}
              pocketMoney={+infoCard.cash - infoCard.remaining}
              remainingMoney={infoCard.remaining}
            >
              {data.length > 0 ? (
                <BoxTable
                  name="Danh sách hóa đơn"
                  titles={titles}
                  items={data}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                />
              ) : (
                <div className="notification__no--card">
                  <div className="avatar">
                    <img src={NoCreditCard} alt="Chưa sử dụng thẻ dịch vụ" />
                  </div>
                  <h2 className="dept-notify">Hiện tại thẻ {infoCard?.name.toLowerCase()} chưa được tiêu dùng</h2>
                </div>
              )}
            </ModalBodyReceipt>
          </div>
        ) : (
          <Loading />
        )}
        <ModalFooterReceipt actions={actions} />
      </ModalReceipt>
    </Fragment>
  );
}
