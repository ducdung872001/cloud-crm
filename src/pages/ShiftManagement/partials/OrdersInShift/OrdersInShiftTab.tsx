import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IFilterItem, ISaveSearch } from "model/OtherModel";
import { getPageOffset, formatCurrency } from "reborn-util";
import ShiftService from "services/ShiftService";
import InvoiceService from "services/InvoiceService";
import { getActiveShiftId } from "utils/ShiftStorage";
import "./OrdersInShiftTab.scss";

const STATUS_MAP: Record<string, number | undefined> = {
  done: 1,
  cancelled: 3,
};
const PAYMENT_MAP: Record<string, number | undefined> = {
  cash: 1,
  momo: 2,
  card: 3,
  transfer: 2,
};
const PAYMENT_LABEL: Record<number, string> = {
  1: "Tiền mặt",
  2: "QR/Momo",
  3: "Thẻ ngân hàng",
};

type OrderItem = {
  id: number;
  code: string;
  customer: string;
  time: string;
  payment: string;
  total: number;
  status: string;
};

type Params = {
  keyword: string;
  status: string;
  payment: string;
  page: number;
  limit: number;
};

// ── InvoiceDetailModal inline ────────────────────────────────────────────────
function InvoiceDetailModal({ invoiceId, onClose }: { invoiceId: number; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    InvoiceService.listInvoiceDetail(invoiceId)
      .then((res: any) => {
        if (res?.code === 0) {
          const r = res.result;
          setDetail(r.invoice);
          // Gộp tất cả mặt hàng: products + services + boughtCards + boughtCardServices
          setItems([
            ...(r.products ?? []),
            ...(r.services ?? []),
            ...(r.boughtCards ?? []),
            ...(r.boughtCardServices ?? []),
          ]);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [invoiceId]);

  // Đóng khi click backdrop
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="shift-invoice-backdrop" onClick={handleBackdrop}>
      <div className="shift-invoice-modal">

        {/* Header */}
        <div className="sim-header">
          <div className="sim-title">
            Chi tiết hóa đơn
            {detail?.invoiceCode && <span className="sim-code"> — #{detail.invoiceCode}</span>}
          </div>
          <button className="sim-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="sim-loading"><Loading /></div>
        ) : !detail ? (
          <div className="sim-empty">Không thể tải thông tin hóa đơn.</div>
        ) : (
          <div className="sim-body">

            {/* Thông tin khách + thanh toán */}
            <div className="sim-info-grid">
              <div className="sim-info-block">
                <div className="sim-info-label">Khách hàng</div>
                <div className="sim-info-value">{detail.customerName || "—"}</div>
                {detail.customerPhone && <div className="sim-info-sub">{detail.customerPhone}</div>}
              </div>
              <div className="sim-info-block">
                <div className="sim-info-label">Thanh toán</div>
                <div className="sim-info-value">{PAYMENT_LABEL[detail.paymentType] ?? "Khác"}</div>
              </div>
              <div className="sim-info-block">
                <div className="sim-info-label">Ngày tạo</div>
                <div className="sim-info-value">
                  {detail.receiptDate
                    ? new Date(detail.receiptDate).toLocaleString("vi-VN")
                    : "—"}
                </div>
              </div>
            </div>

            {/* Danh sách mặt hàng */}
            {items.length > 0 && (
              <div className="sim-items">
                <div className="sim-items-header">
                  <span>Mặt hàng</span>
                  <span>SL</span>
                  <span className="text-right">Thành tiền</span>
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="sim-item-row">
                    <span className="sim-item-name">
                      {item.name || item.serviceName || item.productName || "—"}
                    </span>
                    <span className="sim-item-qty">{item.qty ?? item.quantity ?? 1}</span>
                    <span className="sim-item-total text-right">
                      {formatCurrency(item.fee ?? item.price ?? 0)}đ
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tổng kết */}
            <div className="sim-summary">
              <div className="sim-summary-row">
                <span>Tổng tiền hàng</span>
                <span>{formatCurrency(detail.amount ?? 0)}đ</span>
              </div>
              {(detail.discount ?? 0) > 0 && (
                <div className="sim-summary-row text-danger">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(detail.discount)}đ</span>
                </div>
              )}
              <div className="sim-summary-row sim-summary-total">
                <span>Tổng thanh toán</span>
                <span className="text-success">{formatCurrency(detail.fee ?? 0)}đ</span>
              </div>
              <div className="sim-summary-row">
                <span>Đã thanh toán</span>
                <span>{formatCurrency(detail.paid ?? 0)}đ</span>
              </div>
              {(detail.debt ?? 0) > 0 && (
                <div className="sim-summary-row text-danger">
                  <span>Còn nợ</span>
                  <span>{formatCurrency(detail.debt)}đ</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type Props = { shiftId: number | null };

export default function OrdersInShiftTab({ shiftId: shiftIdProp }: Props) {
  const isMounted = useRef(false);
  const shiftId = shiftIdProp || getActiveShiftId();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [summary, setSummary] = useState({ total: 0, revenue: 0, done: 0, cancelled: 0 });
  const [params, setParams] = useState<Params>({ keyword: "", status: "", payment: "", page: 1, limit: 10 });
  const [isLoading, setIsLoading] = useState(false);
  const [isNoItem, setIsNoItem] = useState(false);
  const [totalItem, setTotalItem] = useState(0);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

  const fetchOrders = useCallback(() => {
    if (!shiftId) { setIsNoItem(true); return; }
    setIsLoading(true);

    const cleanParams = Object.fromEntries(
      Object.entries({
        shiftId,
        status: STATUS_MAP[params.status],
        paymentType: PAYMENT_MAP[params.payment],
        keyword: params.keyword || undefined,
        page: params.page,
        size: params.limit,
      }).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );

    ShiftService.getShiftOrders(cleanParams as any)
      .then((res) => {
        const d = res?.result;
        if (!d) { setOrders([]); setIsNoItem(true); return; }

        const mapped: OrderItem[] = (d.orders ?? []).map((o: any) => ({
          id: o.orderId ?? o.id,
          code: o.orderCode ?? `#ĐH-${o.orderId}`,
          customer: o.customerName ?? "—",
          time: o.orderTime ?? "—",
          payment: o.paymentMethod ?? "Khác",
          total: o.totalAmount ?? 0,
          status: o.status ?? "—",
        }));

        setOrders(mapped);
        setSummary({
          total: d.totalOrders ?? mapped.length,
          revenue: d.totalRevenue ?? 0,
          done: d.completedOrders ?? 0,
          cancelled: d.cancelledOrders ?? 0,
        });
        setTotalItem(d.totalOrders ?? mapped.length);
        setIsNoItem(mapped.length === 0 && !params.keyword && params.page === 1);
      })
      .catch(() => { setOrders([]); setIsNoItem(true); })
      .finally(() => setIsLoading(false));
  }, [shiftId, params]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Đơn hàng trong ca",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((p) => ({ ...p, page })),
    chooseSizeLimit: (limit) => setParams((p) => ({ ...p, limit, page: 1 })),
  });

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    setPagination((prev) => ({
      ...prev,
      page: params.page, sizeLimit: params.limit,
      totalItem, totalPage: Math.ceil(totalItem / params.limit) || 1,
    }));
  }, [params.page, params.limit, totalItem]);

  const statusList = useMemo(() => [
    { value: "", label: "Tất cả trạng thái" },
    { value: "done", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ], []);

  const paymentList = useMemo(() => [
    { value: "", label: "Tất cả thanh toán" },
    { value: "cash", label: "Tiền mặt" },
    { value: "momo", label: "QR/Momo" },
    { value: "card", label: "Thẻ ngân hàng" },
    { value: "transfer", label: "Chuyển khoản" },
  ], []);

  const listFilterItem = useMemo(() => [
    { key: "status", name: "Tất cả trạng thái", type: "select", is_featured: true, value: params.status ?? "", list: statusList },
    { key: "payment", name: "Tất cả thanh toán", type: "select", is_featured: true, value: params.payment ?? "", list: paymentList },
  ] as IFilterItem[], [params.status, params.payment, statusList, paymentList]);

  const [listSaveSearch] = useState<ISaveSearch[]>([{ key: "all", name: "Đơn hàng trong ca", is_active: true }]);

  const titles = ["STT", "Mã đơn", "Khách hàng", "Thời gian", "Thanh toán", "Tổng tiền", "Trạng thái", ""];
  const dataFormat = ["text-center", "", "", "text-center", "text-center", "text-right", "text-center", "text-center"];

  const dataMappingArray = (item: OrderItem, index: number) => [
    getPageOffset(params as any) + index + 1,
    <span className="order-code" key={`code-${item.id}`}>{item.code}</span>,
    item.customer,
    item.time,
    <span className={`pill pill-payment pill-${toPaymentKey(item.payment)}`} key={`pay-${item.id}`}>{item.payment}</span>,
    <strong key={`total-${item.id}`}>{item.total.toLocaleString()}đ</strong>,
    <span className={`pill pill-status pill-${toStatusKey(item.status)}`} key={`st-${item.id}`}>{item.status}</span>,
    <span className="link-view" key={`view-${item.id}`} role="button"
      onClick={() => setSelectedInvoiceId(item.id)}>Xem</span>,
  ];

  return (
    <div className="orders-in-shift-tab">
      <div className="card-box d-flex flex-column orders-card">
        <SearchBox
          name="mã đơn, khách hàng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={listFilterItem}
          updateParams={(paramsNew) => {
            const p = _.cloneDeep(paramsNew);
            setParams({ ...p, page: p.page ?? 1 });
          }}
          placeholderSearch="Tìm theo mã đơn, khách hàng"
        />

        <div className="summary-grid">
          <div className="sum-card"><div className="label">TỔNG ĐƠN</div><div className="value">{summary.total}</div></div>
          <div className="sum-card"><div className="label">DOANH THU CA</div><div className="value text-success">{fmt(summary.revenue)} VNĐ</div></div>
          <div className="sum-card"><div className="label">ĐƠN HOÀN THÀNH</div><div className="value">{summary.done}</div></div>
          <div className="sum-card"><div className="label">ĐƠN HỦY</div><div className="value text-danger">{summary.cancelled}</div></div>
        </div>

        {isLoading ? (
          <div className="p-24"><Loading /></div>
        ) : orders.length > 0 ? (
          <div className="table-card">
            <BoxTable
              name="đơn hàng"
              titles={titles}
              items={orders}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              striped={true}
            />
          </div>
        ) : (
          <Fragment>
            {isNoItem
              ? <SystemNotification type="no-item" description={<span>Chưa có đơn hàng nào trong ca.<br />Hãy tạo đơn hàng đầu tiên!</span>} />
              : <SystemNotification type="no-result" description={<span>Không có kết quả.<br />Hãy thay đổi tiêu chí lọc hoặc tìm kiếm.</span>} />
            }
          </Fragment>
        )}
      </div>

      {/* Modal xem chi tiết — tự render, không phụ thuộc beautyBranch */}
      {selectedInvoiceId && (
        <InvoiceDetailModal
          invoiceId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  );
}

function toStatusKey(s: string) { if (s === "Hoàn thành") return "done"; if (s === "Đã hủy") return "cancelled"; return "processing"; }
function toPaymentKey(p: string) { if (p === "Tiền mặt") return "cash"; if (p === "QR/Momo") return "momo"; if (p === "Thẻ ngân hàng") return "card"; return "transfer"; }
function fmt(v: number): string {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(v);
}