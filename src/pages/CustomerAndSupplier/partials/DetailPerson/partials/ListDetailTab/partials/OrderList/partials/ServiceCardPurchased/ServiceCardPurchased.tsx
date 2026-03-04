import React, { Fragment, useEffect, useState } from "react";
import moment from "moment";
import { useParams } from "react-router-dom";
import { formatCurrency, getPageOffset } from "reborn-util";
import { IAction } from "model/OtherModel";
import { IServiceCardPurchasedProps } from "model/customer/PropsModel";
import { IBoughtCardFilterRequest } from "model/boughtCard/BoughtCardRequestModel";
import { ICardInvoiceServiceResponse } from "model/invoice/InvoiceResponse";
import ImageThirdGender from "assets/images/third-gender.png";
import BoughtCardService from "services/BoughtCardService";
import { showToast } from "utils/common";
import Image from "components/image";
import Icon from "components/icon";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import BoxTable from "components/boxTable/boxTable";
import HistoryUseCardModal from "./partials/HistoryUseCardModal";
import "./ServiceCardPurchased.scss";

export default function ServiceCardPurchased(props: IServiceCardPurchasedProps) {
  const { tab } = props;

  const { id } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listServiceCardPurchased, setListServiceCardPurchased] = useState<ICardInvoiceServiceResponse[]>([]);
  const [params, setParams] = useState({ page: 1, limit: 10 });

  const getListServiceCardPurchased = async () => {
    setIsLoading(true);

    const param: IBoughtCardFilterRequest = {
      customerId: +id,
      checkAccount: 0,
    };

    const response = await BoughtCardService.list(param);

    if (response.code === 0) {
      const result = response.result;
      setListServiceCardPurchased(result);

      if ((result || []).length == 0) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (tab == "tab_two" && id) {
      getListServiceCardPurchased();
    }
  }, [tab, id]);

  const titles = ["STT", "Loại thẻ", "Thông tin thẻ", "Mã thẻ", "Giá trị thẻ", "Giá bán"];

  const dataFormat = ["text-center", "text-center", "", "", "text-center", "text-right", "text-right"];

  const dataMappingArray = (item: ICardInvoiceServiceResponse, index: number) => [
    getPageOffset(params) + index + 1,
    <div key={item.id}>
      <span>{item.serviceId ? "Thẻ liệu trình" : "Thẻ đa năng"}</span> <br />
      <i>{`${item.invoiceCode || ""} - ${item.receiptDate ? moment(item.receiptDate).format("DD/MM/YYYY") : ""}`}</i>
    </div>,
    <div key={item.id} className="info__card">
      <div className="avatar__card">
        <Image key={item.id} src={item.avatar || ImageThirdGender} alt={item.name} width={"64rem"} />
      </div>
      <div className="content__card">
        <span>{item.name}</span>
        <div className="extra-information">
          {item.serviceId ? (
            <Fragment>
              <div className="info-service">
                <span>
                  <strong>Dịch vụ:</strong> {item.serviceName}
                </span>
                <span>
                  <strong>Gói:</strong> {JSON.parse(item.serviceCombo || "")?.name}
                </span>
              </div>
              <span>
                <strong>Số buổi còn lại:</strong> {item.treatmentNum - item.totalTreatment || 0}
              </span>
            </Fragment>
          ) : (
            <Fragment>
              <span>
                <strong>Tiền còn lại:</strong>
                {formatCurrency(item.remaining ? item.remaining : "0")}
              </span>
            </Fragment>
          )}
        </div>
      </div>
    </div>,
    item.cardNumber,
    formatCurrency(item.cash ? item.cash : "0"),
    formatCurrency(item.account ? item.account : "0"),
  ];

  const [showModalHistoryCard, setShowModalHistoryCard] = useState<boolean>(false);
  const [idCard, setIdCard] = useState<number>(null);
  const [infoCard, setInfoCard] = useState(null);

  const actionsTable = (item: ICardInvoiceServiceResponse): IAction[] => {
    return !item.serviceId
      ? [
          {
            title: "Xem chi tiết",
            icon: <Icon name="Eye" />,
            callback: () => {
              setInfoCard(item);
              setIdCard(item.id);
              setShowModalHistoryCard(true);
            },
          },
        ]
      : [];
  };

  return (
    <Fragment>
      {!isLoading && listServiceCardPurchased && listServiceCardPurchased.length > 0 ? (
        <BoxTable
          name="Thẻ dịch vụ đã mua"
          titles={titles}
          items={listServiceCardPurchased}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          striped={true}
          actions={actionsTable}
          actionType="inline"
          className="table__card"
        />
      ) : isLoading ? (
        <Loading />
      ) : (
        <Fragment>
          {isNoItem && (
            <SystemNotification
              description={
                <span>
                  Hiện tại khách chưa mua thẻ dịch vụ nào. <br />
                </span>
              }
              type="no-item"
            />
          )}
        </Fragment>
      )}
      <HistoryUseCardModal infoCard={infoCard} onShow={showModalHistoryCard} id={idCard} onHide={() => setShowModalHistoryCard(false)} />
    </Fragment>
  );
}
