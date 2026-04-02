import React, { Fragment, useEffect, useState } from "react";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { useParams } from "react-router-dom";
import { formatCurrency, getPageOffset } from "reborn-util";
import { IAction } from "model/OtherModel";
import { IListBillProps } from "model/customer/PropsModel";
import { IInvoiceFilterRequest } from "model/invoice/InvoiceRequestModel";
import Icon from "components/icon";
import Loading from "components/loading";
import Badge from "components/badge/badge";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { showToast } from "utils/common";
import InvoiceService from "services/InvoiceService";
import ShowModalDetailSaleInvoice from "pages/Sell/SaleInvoiceList/partials/ShowModalDetailSaleInvoice";
import RecoverPublicDebts from "pages/Common/RecoverPublicDebts";

export default function ListBill(props: IListBillProps) {
  const { tab } = props;

  const { id } = useParams();

  const [isLoading, setIsLoading]         = useState<boolean>(true);
  const [listBill, setListBill]           = useState<any[]>([]);
  const [isNoItem, setIsNoItem]           = useState<boolean>(false);
  const [showModalBill, setShowModalBill] = useState<boolean>(false);
  const [idBill, setIdBill]               = useState<number>(null);
  const [showModalDebt, setShowModalDebt] = useState<boolean>(false);
  const [dataInvoice, setDataInvoice]     = useState<any>(null);
  const [idCustomer, setIdCustomer]       = useState<number>(null);

  const [params, setParams] = useState<IInvoiceFilterRequest>({
    invoiceCode: "",
    invoiceTypes: JSON.stringify(["IV1", "IV3"]),
  });

  useEffect(() => {
    if (id || tab) {
      setParams((prev) => ({ ...prev, customerId: +id }));
    }
  }, [id, tab]);

  const getListBill = async (paramsSearch: IInvoiceFilterRequest) => {
    setIsLoading(true);

    const response = await InvoiceService.list(paramsSearch);

    if (response.code === 0) {
      const result    = response.result?.pagedLst;
      const rawItems: any[] = result?.items ?? [];
      setListBill(rawItems);

      if (+result.total === 0 && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (tab === "tab_one" && params?.customerId) {
      getListBill(params);
    }
  }, [tab, params]);

  const titles = ["STT", "Mã hóa đơn", "Ngày bán", "Tổng tiền", "VAT", "Giảm giá", "Đã thanh toán", "Trả từ thẻ", "Công nợ", "Trạng thái hóa đơn"];

  const dataFormat = ["text-center", "", "", "text-right", "text-right", "text-right", "text-right", "text-right", "text-right", "text-center"];

  const dataMappingArray = (item: any, index: number) => {
    // API /invoice/list/v2 trả nested: mỗi item có item.invoice (tài chính) + item.invoiceId (ID)
    // Dùng fallback (item.invoice ?? item) để tương thích cả cấu trúc cũ lẫn mới
    const inv = item.invoice ?? item;
    const iId = item.invoiceId ?? inv.id;

    return [
      getPageOffset(params) + index + 1,

      <span
        key={`code-${iId}`}
        style={{ cursor: "pointer", color: "var(--primary-color-80)", fontWeight: 500 }}
        onClick={(e) => {
          e && e.preventDefault();
          setIdBill(iId);
          setShowModalBill(true);
        }}
      >
        {inv.invoiceCode || "—"}
      </span>,

      inv.createdTime
        ? moment(inv.createdTime).format("DD/MM/YYYY")
        : inv.receiptDate
          ? moment(inv.receiptDate).format("DD/MM/YYYY")
          : "—",

      formatCurrency(inv.fee ?? inv.amount ?? 0),
      formatCurrency(inv.vatAmount ?? 0),
      formatCurrency(inv.discount ?? 0),
      formatCurrency(inv.paid ?? 0),
      formatCurrency(inv.amountCard ?? 0),

      (inv.debt ?? 0) > 0 ? (
        <Tippy key={`debt-${iId}`} content="Click để thu hồi công nợ">
          <span
            style={{ cursor: "pointer", color: "var(--error-color, #ef4444)", fontWeight: 600 }}
            onClick={() => {
              setIdCustomer(inv.customerId ?? +id);
              setDataInvoice({
                id:          iId,
                invoiceCode: inv.invoiceCode,
                amount:      inv.fee ?? inv.amount ?? 0,
                fee:         inv.fee ?? inv.amount ?? 0,
                debt:        inv.debt,
              });
              setShowModalDebt(true);
            }}
          >
            {formatCurrency(inv.debt)}
          </span>
        </Tippy>
      ) : (
        formatCurrency(0)
      ),

      <Badge
        key={`status-${iId}`}
        text={inv.status === 1 ? "Hoàn thành" : inv.status === 2 ? "Chưa hoàn thành" : "Đã hủy"}
        variant={inv.status === 1 ? "success" : inv.status === 2 ? "warning" : "error"}
      />,
    ];
  };

  const actionsTable = (item: any): IAction[] => {
    const inv = item.invoice ?? item;
    const iId = item.invoiceId ?? inv.id;
    return [
      {
        title: "Xem hóa đơn",
        icon: <Icon name="Eye" />,
        callback: () => {
          setIdBill(iId);
          setShowModalBill(true);
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

      <ShowModalDetailSaleInvoice
        onShow={showModalBill}
        idInvoice={idBill}
        onHide={() => setShowModalBill(false)}
      />
    </Fragment>
  );
}