import React, { Fragment, useEffect, useState } from "react";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { useParams } from "react-router-dom";
import { formatCurrency, getPageOffset } from "reborn-util";
import { IAction } from "model/OtherModel";
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

// ── Kiểu dữ liệu KPI bubble-up ────────────────────────────────────────────────

export interface InvoiceStats {
  totalSales:     number;
  paid:           number;
  debt:           number;
  invoiceCount:   number;
  completedCount: number;
  lastBoughtDate: string | null;
}

interface ListBillProps {
  tab: string;
  onStatsLoaded?: (stats: InvoiceStats) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ListBill({ tab, onStatsLoaded }: ListBillProps) {
  const { id } = useParams(); // customerId từ route /detail_person/customerId/:id

  const [isLoading, setIsLoading]         = useState<boolean>(true);
  const [listBill, setListBill]           = useState<any[]>([]);
  const [isNoItem, setIsNoItem]           = useState<boolean>(false);
  const [showModalBill, setShowModalBill] = useState<boolean>(false);
  const [idBill, setIdBill]               = useState<number>(null);
  const [showModalDebt, setShowModalDebt] = useState<boolean>(false);
  const [dataInvoice, setDataInvoice]     = useState<any>(null);
  const [idCustomer, setIdCustomer]       = useState<number>(null);

  const [params, setParams] = useState<IInvoiceFilterRequest>({
    invoiceTypes: JSON.stringify(["IV1", "IV3"]),
  });

  // Gán customerId khi route id sẵn sàng
  useEffect(() => {
    if (id) setParams((prev) => ({ ...prev, customerId: +id }));
  }, [id]);

  const getListBill = async (p: IInvoiceFilterRequest) => {
    setIsLoading(true);
    try {
      const response = await InvoiceService.list(p);
      if (response.code !== 0) {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        return;
      }

      // API /invoice/list/v2 trả nested structure:
      //   response.result.pagedLst.items[].invoice   → tài chính (invoiceCode, fee, paid, debt...)
      //   response.result.pagedLst.items[].invoiceId → ID record
      //   response.result.totalSales                 → SUM(fee) toàn bộ (all pages)
      //   response.result.totalRevenue               → SUM(paid) toàn bộ
      //   response.result.statusCounts               → { "1": n, "2": n, "3": n }
      const result   = response.result;
      const paged    = result?.pagedLst ?? {};
      const rawItems: any[] = paged.items ?? [];

      setListBill(rawItems);
      setIsNoItem(+paged.total === 0 && +paged.page === 1);

      // Bubble KPI lên DetailPersonList
      if (onStatsLoaded) {
        const sc = result?.statusCounts ?? {};

        // Aggregate debt từ trang hiện tại (API không có totalDebt riêng)
        let totalDebt = 0;
        rawItems.forEach((item: any) => {
          totalDebt += Number((item.invoice ?? item).debt ?? 0);
        });

        // items sort desc → items[0] = mới nhất
        const firstInv    = rawItems[0]?.invoice ?? rawItems[0] ?? null;
        const lastBought  = firstInv
          ? (firstInv.createdTime ?? firstInv.receiptDate ?? null)
          : null;

        onStatsLoaded({
          totalSales:     Number(result?.totalSales   ?? 0),
          paid:           Number(result?.totalRevenue ?? 0),
          debt:           totalDebt,
          invoiceCount:   +paged.total,
          completedCount: Number(sc[1] ?? 0),
          lastBoughtDate: lastBought,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "tab_one" && params?.customerId) {
      getListBill(params);
    }
  }, [tab, params]);

  // ── Cấu hình bảng ────────────────────────────────────────────────────────

  const titles = [
    "STT", "Mã hóa đơn", "Ngày bán",
    "Tổng tiền", "VAT", "Giảm giá",
    "Đã thanh toán", "Trả từ thẻ", "Công nợ", "Trạng thái",
  ];

  const dataFormat = [
    "text-center", "", "",
    "text-right", "text-right", "text-right",
    "text-right", "text-right", "text-right", "text-center",
  ];

  const dataMappingArray = (item: any, index: number) => {
    // item.invoice chứa tài chính; item.invoiceId là ID của record
    const inv = item.invoice ?? item;
    const iId = item.invoiceId ?? inv.id;

    return [
      getPageOffset(params) + index + 1,

      // Mã hóa đơn — click mở modal chi tiết
      <span
        key={`code-${iId}`}
        style={{ cursor: "pointer", color: "var(--primary-color-80)", fontWeight: 500 }}
        onClick={() => { setIdBill(iId); setShowModalBill(true); }}
      >
        {inv.invoiceCode || "—"}
      </span>,

      // Ngày bán
      inv.createdTime
        ? moment(inv.createdTime).format("DD/MM/YYYY")
        : inv.receiptDate
          ? moment(inv.receiptDate).format("DD/MM/YYYY")
          : "—",

      formatCurrency(inv.fee      ?? inv.amount ?? 0),
      formatCurrency(inv.vatAmount ?? 0),
      formatCurrency(inv.discount  ?? 0),
      formatCurrency(inv.paid      ?? 0),
      formatCurrency(inv.amountCard ?? 0),

      // Công nợ — click thu hồi nếu > 0
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
      ) : formatCurrency(0),

      <Badge
        key={`status-${iId}`}
        text={
          inv.status === 1 ? "Hoàn thành"
          : inv.status === 2 ? "Chưa hoàn thành"
          : "Đã hủy"
        }
        variant={inv.status === 1 ? "success" : inv.status === 2 ? "warning" : "error"}
      />,
    ];
  };

  const actionsTable = (item: any): IAction[] => {
    const inv = item.invoice ?? item;
    const iId = item.invoiceId ?? inv.id;
    return [{
      title: "Xem hóa đơn",
      icon: <Icon name="Eye" />,
      callback: () => { setIdBill(iId); setShowModalBill(true); },
    }];
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Fragment>
      {isLoading ? (
        <Loading />
      ) : listBill.length > 0 ? (
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
      ) : (
        isNoItem && (
          <SystemNotification
            description={<span>Hiện tại chưa có hoá đơn nào.</span>}
            type="no-item"
          />
        )
      )}

      <RecoverPublicDebts
        onShow={showModalDebt}
        idCustomer={idCustomer}
        dataInvoice={dataInvoice}
        onHide={(reload) => {
          if (reload) getListBill(params);
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