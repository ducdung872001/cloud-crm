import React, { Fragment, useEffect, useState } from "react";
import _ from "lodash";
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

// ── Types ─────────────────────────────────────────────────────────────────────

interface ListBillProps {
  tab: string;
  /** Callback để truyền statusCounts lên DetailPersonList cập nhật KPI */
  onStatsLoaded?: (stats: { paid: number; debt: number; invoiceCount: number; lastBoughtDate: string | null; completedCount: number }) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ListBill({ tab, onStatsLoaded }: ListBillProps) {
  const { id } = useParams();

  const [isLoading, setIsLoading]           = useState<boolean>(true);
  const [listBill, setListBill]             = useState<any[]>([]);
  const [isNoItem, setIsNoItem]             = useState<boolean>(false);
  const [showModalBill, setShowModalBill]   = useState<boolean>(false);
  const [idBill, setIdBill]                 = useState<number>(null);
  const [showModalDebt, setShowModalDebt]   = useState<boolean>(false);
  const [dataInvoice, setDataInvoice]       = useState<any>(null);
  const [idCustomer, setIdCustomer]         = useState<number>(null);

  const [params, setParams] = useState<IInvoiceFilterRequest>({
    invoiceCode: "",
    invoiceTypes: JSON.stringify(["IV1", "IV3"]),
  });

  // Set customerId vào params khi có id từ URL
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
      setIsNoItem(+result.total === 0 && +result.page === 1);

      // ── Tính KPI từ response ─────────────────────────────────────────────
      if (onStatsLoaded) {
        const sc             = response.result?.statusCounts ?? {};
        const completedCount = Number(sc[1] ?? 0);          // status=1 Hoàn thành

        // Aggregate từ danh sách trang hiện tại (đại diện tốt nhất không cần API thêm)
        let totalPaid  = 0;
        let totalDebt  = 0;
        let latestDate: string | null = null;

        rawItems.forEach((item: any) => {
          const inv = item.invoice ?? item;
          totalPaid += Number(inv.paid ?? 0);
          totalDebt += Number(inv.debt ?? 0);
          const d = inv.createdTime ?? inv.receiptDate ?? null;
          if (d && (!latestDate || d > latestDate)) latestDate = d;
        });

        onStatsLoaded({
          paid:           totalPaid,
          debt:           totalDebt,
          invoiceCount:   +result.total,      // tổng số hóa đơn (all statuses)
          completedCount,                     // chỉ hoàn thành
          lastBoughtDate: latestDate,
        });
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

  // ── Table config ──────────────────────────────────────────────────────────

  const titles = [
    "STT", "Mã hóa đơn", "Ngày bán",
    "Tổng tiền", "VAT", "Giảm giá",
    "Đã thanh toán", "Trả từ thẻ", "Công nợ",
    "Trạng thái",
  ];

  const dataFormat = [
    "text-center", "", "",
    "text-right", "text-right", "text-right",
    "text-right", "text-right", "text-right",
    "text-center",
  ];

  const dataMappingArray = (item: any, index: number) => {
    // ── API trả nested: item.invoice chứa các trường tài chính ──────────────
    const inv  = item.invoice ?? item;          // fallback cho cấu trúc cũ
    const iId  = item.invoiceId ?? inv.id;      // ID record

    return [
      getPageOffset(params) + index + 1,

      // Mã hóa đơn — click để xem chi tiết
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

      formatCurrency(inv.fee   ?? inv.amount ?? 0),
      formatCurrency(inv.vatAmount ?? 0),
      formatCurrency(inv.discount ?? 0),
      formatCurrency(inv.paid  ?? 0),
      formatCurrency(inv.amountCard ?? 0),

      // Công nợ — click để thu hồi nếu > 0
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
    return [
      {
        title: "Xem hóa đơn",
        icon: <Icon name="Eye" />,
        callback: () => { setIdBill(iId); setShowModalBill(true); },
      },
    ];
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