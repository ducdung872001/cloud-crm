import React, { Fragment, useEffect, useState } from "react";
import _ from "lodash";
import moment from "moment";
import { useParams } from "react-router-dom";
import { formatCurrency, getPageOffset } from "reborn-util";
import { IPurchasedProductProps } from "model/customer/PropsModel";
import { IBoughtProductFilterRequest } from "model/boughtProduct/BoughtProductRequestModel";
import { IBoughtProductResponse } from "model/boughtProduct/BoughtProductResponseModel";
import ImageThirdGender from "assets/images/third-gender.png";
import BoughtProductService from "services/BoughtProductService";
import { showToast } from "utils/common";
import Image from "components/image";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import BoxTable from "components/boxTable/boxTable";

export default function PurchasedProduct(props: IPurchasedProductProps) {
  const { tab } = props;

  const { id } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listPurchasedProduct, setListPurchasedProduct] = useState<IBoughtProductResponse[]>([]);
  const [params, setParams] = useState<IBoughtProductFilterRequest>({
    customerId: +id,
  });

  useEffect(() => {
    if (id) {
      setParams({ ...params, customerId: +id });
    }
  }, [id]);

  const getListPurchasedProduct = async (paramsSearch: IBoughtProductFilterRequest) => {
    setIsLoading(true);

    const response = await BoughtProductService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListPurchasedProduct(result.items);

      if (+result.total === 0 && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (tab == "tab_three") {
      getListPurchasedProduct(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
  }, [tab, params]);

  const titles = ["STT", "Ảnh sản phẩm", "Tên sản phẩm", "Số lô", "Đơn vị", "Số lượng", "Giá bán", "Thành tiền"];

  const dataFormat = ["text-center", "text-center", "", "", "text-center", "text-right", "text-right", "text-right"];

  const dataMappingArray = (item: IBoughtProductResponse, index: number) => [
    getPageOffset(params) + index + 1,
    <Image key={item.id} src={item.avatar || ImageThirdGender} alt={item.name} width={"64rem"} />,
    <div key={index}>
      <span>{item.name}</span> <br />
      <i>{`${item.invoiceCode || ""} - ${item.receiptDate ? moment(item.receiptDate).format("DD/MM/YYYY") : ""}`}</i>
    </div>,
    item.batchNo,
    item.unitName,
    item.qty,
    formatCurrency(item.priceDiscount || item.price ? item.priceDiscount || item.price : "0"),
    formatCurrency(item.fee ? item.fee : "0"),
  ];

  return (
    <Fragment>
      {!isLoading && listPurchasedProduct && listPurchasedProduct.length > 0 ? (
        <BoxTable
          name="Sản phẩm đã mua"
          titles={titles}
          items={listPurchasedProduct}
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
                  Hiện tại khách chưa mua sản phẩm nào. <br />
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
