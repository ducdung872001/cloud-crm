import React, { Fragment, useEffect, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { useParams } from "react-router-dom";
import { formatCurrency, getPageOffset } from "reborn-util";
import { IAction } from "model/OtherModel";
import { IListBillProps } from "model/customer/PropsModel";
import { IInvoiceResponse } from "model/invoice/InvoiceResponse";
import { IInvoiceFilterRequest } from "model/invoice/InvoiceRequestModel";
import Icon from "components/icon";
import Loading from "components/loading";
import Badge from "components/badge/badge";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { showToast } from "utils/common";
import InvoiceService from "services/InvoiceService";
import RecoverPublicDebts from "pages/Common/RecoverPublicDebts";

export default function ListBill(props: IListBillProps) {
  const { tab } = props;

  const { id } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listBill, setListBill] = useState<IInvoiceResponse[]>([]);
  const [dataInvoice, setDataInvoice] = useState<IInvoiceResponse>(null);
  const [idBill, setIdBill] = useState<number>(null);
  const [showModalBill, setShowModalViewBill] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalDebt, setShowModalDebt] = useState<boolean>(false);
  const [idCustomer, setIdCustomer] = useState<number>(null);

  const [params, setParams] = useState<IInvoiceFilterRequest>({
    invoiceCode: "",
    invoiceTypes: JSON.stringify(["IV1", "IV3"]),
  });

  useEffect(() => {
    if (id || tab) {
      setParams({ ...params, customerId: +id });
    }
  }, [id, tab]);

  const getListBill = async (paramsSearch: IInvoiceFilterRequest) => {
    setIsLoading(true);

    const response = await InvoiceService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result?.pagedLst;
      setListBill(result?.items);

      if (+result.total === 0 && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (tab == "tab_one" && params?.customerId) {
      getListBill(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
  }, [tab, params]);

  const titles = ["STT", "Mã hóa đơn", "Ngày bán", "Tổng tiền", "VAT", "Giảm giá", "Đã thanh toán", "Trả từ thẻ", "Công nợ", "Trạng thái hóa đơn"];

  const dataFormat = ["text-center", "", "", "text-right", "text-right", "text-right", "text-right", "text-right", "text-right", "text-center"];

  const dataMappingArray = (item: IInvoiceResponse, index: number) => [
    getPageOffset(params) + index + 1,
    <span
      key={index}
      style={{ cursor: "pointer", color: "var(--primary-color-80)", fontWeight: "500" }}
      onClick={(e) => {
        e && e.preventDefault();
        setIdBill(item.id);
        setShowModalViewBill(true);
      }}
    >
      {item.invoiceCode}
    </span>,
    moment(item.receiptDate).format("DD/MM/YYYY"),
    formatCurrency(item.amount),
    "0",
    formatCurrency(item.discount ? item.discount : "0"),
    formatCurrency(item.paid),
    formatCurrency(item.amountCard ? item.amountCard : "0"),
    item.debt ? (
      <Tippy key={item.id} content="Click vào để thu hồi công nợ">
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            setIdCustomer(item.customerId);
            setShowModalDebt(true);
            setDataInvoice(item);
          }}
        >
          {formatCurrency(item.debt)}
        </span>
      </Tippy>
    ) : (
      formatCurrency("0")
    ),
    <Badge
      key={item.id}
      text={item.status === 1 ? "Hoàn thành" : item.status === 2 ? "Chưa hoàn thành" : "Đã hủy"}
      variant={item.status === 1 ? "success" : item.status === 2 ? "warning" : "error"}
    />,
  ];

  const actionsTable = (item: IInvoiceResponse): IAction[] => {
    return [
      {
        title: "Xem hóa đơn",
        icon: <Icon name="Eye" />,
        callback: () => {
          setIdBill(item.id);
          setShowModalViewBill(true);
        },
      },
    ];
  };

  return (
    <Fragment>
      {!isLoading && listBill && listBill.length > 0 ? (
        <BoxTable
          name="Danh sách hóa đơn"
          titles={titles}
          items={listBill}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          striped={true}
          isBulkAction={true}
          actions={actionsTable}
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
                  Hiện tại bạn chưa có hoá đơn nào. <br />
                </span>
              }
              type="no-item"
            />
          )}
        </Fragment>
      )}
      <RecoverPublicDebts
        onShow={showModalDebt}
        idCustomer={idCustomer}
        dataInvoice={dataInvoice}
        onHide={(reload) => {
          if (reload) {
            getListBill(params);
          }
          setShowModalDebt(false);
        }}
      />
    </Fragment>
  );
}
