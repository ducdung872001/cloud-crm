import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IAction } from "model/OtherModel";
import { formatCurrency } from "reborn-util";
import { IPurchasedServiceProps } from "model/customer/PropsModel";
import { IBoughtServiceResponse } from "model/boughtService/BoughtServiceResponseModel";
import ImageThirdGender from "assets/images/third-gender.png";
import BoughtServiceService from "services/BoughtServiceService";
import { showToast } from "utils/common";
import Image from "components/image";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import BoxTable from "components/boxTable/boxTable";
import moment from "moment";
import { getPageOffset } from 'reborn-util';

export default function PurchasedService(props: IPurchasedServiceProps) {
  const { tab } = props;

  const { id } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listPurchasedService, setListPurchasedService] = useState<IBoughtServiceResponse[]>([]);
  const [params, setParams] = useState({ page: 1, limit: 10 });

  const getListPurchasedService = async () => {
    setIsLoading(true);

    const response = await BoughtServiceService.getByCustomerId(+id);

    if (response.code === 0) {
      const result = response.result;
      setListPurchasedService(result);

      if ((result || []).length == 0) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (tab == "tab_four" && id) {
      getListPurchasedService();
    }
  }, [tab, id]);

  const titles = ["STT", "Ảnh dịch vụ", "Tên dịch vụ", "Mã dịch vụ", "Số lượng", "Giá bán", "Thành tiền"];

  const dataFormat = ["text-center", "text-center", "", "", "text-right", "text-right", "text-right"];

  const dataMappingArray = (item: IBoughtServiceResponse, index: number) => [
    getPageOffset(params) + index + 1,
    <Image key={item.id} src={item.serviceAvatar || ImageThirdGender} alt={item.serviceName} width={"64rem"} />,
    <div key={item.id}>
      <span>{item.serviceName}</span> <br />
      <i>{`${item.invoiceCode || ""} - ${item.receiptDate ? moment(item.receiptDate).format("DD/MM/YYYY") : ""}`}</i>
    </div>,
    item.serviceNumber,
    item.qty ? item.qty : 1,
    formatCurrency(item.priceDiscount || item.price ? item.priceDiscount || item.price : "0"),
    formatCurrency(item.fee ? item.fee : "0"),
  ];

  return (
    <Fragment>
      {!isLoading && listPurchasedService && listPurchasedService.length > 0 ? (
        <BoxTable
          name="Dịch vụ đã mua"
          titles={titles}
          items={listPurchasedService}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          striped={true}
          actionType="inline"
        />
      ) : isLoading ? (
        <Loading />
      ) : (
        <Fragment>
          {isNoItem && (
            <SystemNotification
              description={
                <span>
                  Hiện tại bạn chưa có dịch vụ đã mua nào. <br />
                </span>
              }
              type="no-item"
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
