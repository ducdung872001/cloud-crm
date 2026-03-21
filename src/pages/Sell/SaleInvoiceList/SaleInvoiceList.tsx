import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IInvoiceFilterRequest } from "model/invoice/InvoiceRequestModel";
import { showToast } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import { isDifferenceObj } from "reborn-util";
import InvoiceService from "services/InvoiceService";
import "./SaleInvoiceList.scss";
import OrderList from "@/pages/CounterSales/components/OrderList";
import { Order } from "@/pages/CounterSales/types";
import Button from "@/components/button/button";
import moment from "moment";
import ReceiptModal from "@/pages/CounterSales/components/modals/ReceiptModal";
import OrderDetailModal from "@/pages/CounterSales/components/modals/OrderDetailModal";

export default function SaleInvoiceList() {
  document.title = "Danh sách đơn hàng";

  const { dataBranch } = useContext(UserContext) as ContextType;

  const isMounted = useRef(false);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [listSaleInvoice, setListSaleInvoice] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const [params, setParams] = useState<IInvoiceFilterRequest>({
    invoiceCode: "",
    invoiceTypes: JSON.stringify(["IV1", "IV3"]),
    limit: 10,
    page: 1,
  });

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Danh sách đơn hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  // export interface Order {
  //   id: string;
  //   code: string;
  //   source: "offline" | "shopee" | "tiktok" | "website";
  //   sourceLabel: string;
  //   status: "pending" | "shipping" | "success" | "cancelled";
  //   statusLabel: string;
  //   time: string;
  //   customer: Customer;
  //   items: string;
  //   total: number;
  //   cancellationReason?: string;
  // }

  const getListSaleInvoice = async (paramsSearch: IInvoiceFilterRequest) => {
    setIsLoading(true);

    const response = await InvoiceService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      let listSaleInvoiceTemp: Order[] = result.pagedLst.items.map(
        (item) =>
          ({
            id: item.invoiceId,
            code: item.invoice.invoiceCode,
            source: "offline",
            sourceLabel: "Bán hàng tại quầy",
            status: item.invoice.status == 1 ? "success" : item.invoice.status == 2 ? "pending" : "cancelled",
            statusLabel: item.invoice.status === 1 ? "Hoàn thành" : item.invoice.status === 2 ? "Chưa hoàn thành" : "Đã hủy",
            time: item?.invoice?.createdTime ? moment(item.invoice.createdTime).format("DD/MM/YYYY · HH:mm") : "",
            customer: {
              id: item.customerId,
              name: item?.invoice?.customerName ? item.invoice.customerName : item?.invoice?.customerId ? "Khách vãng lai" : "Khách lẻ",
              phone: item.customerPhone ? item.customerPhone : item?.invoice?.customerId ? "" : "",
              initial: item?.invoice?.customerName ? item.invoice.customerName.charAt(0).toUpperCase() : "K",
              points: item.customerPoints ?? 0,
              tier: item.customerTier ?? "",
              color: "#2563eb",
            },
            items: [...(item.products || []), ...(item.services || [])].map((i) => {
                const productName = i.productName || i.name || "";
                const variantName = (i.name && i.name !== i.productName) ? i.name : "";
                return variantName ? `${productName} (${variantName})` : productName;
              }).filter(Boolean).join(", ") || "—",
            total: item.invoice.fee,
          } as Order)
      );

      setListSaleInvoice(result.pagedLst.page == 1 ? listSaleInvoiceTemp : [...listSaleInvoice, ...listSaleInvoiceTemp]);

      setPagination({
        ...pagination,
        page: +result.pagedLst.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.pagedLst.total,
        totalPage: Math.ceil(+result.pagedLst.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.pagedLst.total === 0 && !params?.invoiceCode && +result.pagedLst.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListSaleInvoice(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
    }
    return () => {
      abortController.abort();
    };
  }, [params]);

  const handleViewReceipt = useCallback(() => setReceiptModalOpen(true), []);
  const handleViewDetail = useCallback((invoiceId) => {
    setOrderDetailModalOpen(true);
    setInvoiceId(invoiceId);
  }, []);
  const handleConfirmOrder = useCallback(() => setOrderDetailModalOpen(false), []);

  return (
    <div className="sale-invoice-list">
      <OrderList
        onViewDetail={(invoiceId) => {
          handleViewDetail(invoiceId);
        }}
        onViewReceipt={handleViewReceipt}
        onConfirm={handleConfirmOrder}
        listOrder={listSaleInvoice}
      />
      Hiển thị {listSaleInvoice.length}/{pagination.totalItem} đơn hàng
      {pagination.page < pagination.totalPage && (
        <Button
          onClick={() => {
            getListSaleInvoice({
              ...params,
              page: pagination.page + 1,
            });
          }}
        >
          Tải thêm
        </Button>
      )}
      {/* <ReceiptModal
        open={receiptModalOpen}
        // cartItems={cartItems}
        // customerId={customer?.id ?? -1}
        // invoiceId={invoiceId ?? -1}
        // invoiceDraft={invoiceDraftToPaid}
        // method={method}
        // qrCodePro={qrCodePro}
        onClose={() => {
          // setCartItems([]);
          // setCustomer(null);
          // setInvoiceId(null);
          // setReceiptModalOpen(false);
          // setInvoiceDraftToPaid(null);
          // setQrCodePro(null);
          // setMethod("cash");
        }}
      /> */}
      <OrderDetailModal
        open={orderDetailModalOpen}
        onClose={() => {
          setInvoiceId(null);
          setOrderDetailModalOpen(false);
        }}
        onPrint={() => {
          setOrderDetailModalOpen(false);
          setReceiptModalOpen(true);
        }}
        invoiceId={invoiceId ?? -1}
        onConfirm={handleConfirmOrder}
      />
    </div>
  );
}