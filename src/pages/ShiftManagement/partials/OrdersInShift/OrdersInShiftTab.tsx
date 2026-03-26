import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IFilterItem, ISaveSearch } from "model/OtherModel";
import { getPageOffset } from "reborn-util";
import ShiftService from "services/ShiftService";
import ModalDetailSaleInvoice from "pages/ManagementSale/partials/ModalDetailSaleInvoice/ModalDetailSaleInvoice";
import { getActiveShiftId } from "utils/ShiftStorage";
import "./OrdersInShiftTab.scss";

// Map frontend filter values → API integer values
const STATUS_MAP: Record<string, number | undefined> = {
  done:      1,
  cancelled: 3,
};
const PAYMENT_MAP: Record<string, number | undefined> = {
  cash:     1,
  momo:     2,
  card:     3,
  transfer: 2,
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

type Props = { shiftId: number | null };

export default function OrdersInShiftTab({ shiftId: shiftIdProp }: Props) {
  const isMounted = useRef(false);

  // Lấy shiftId từ prop hoặc fallback localStorage
  const shiftId = shiftIdProp || getActiveShiftId();

  const [orders, setOrders]       = useState<OrderItem[]>([]);
  const [summary, setSummary]     = useState({ total: 0, revenue: 0, done: 0, cancelled: 0 });
  const [params, setParams]       = useState<Params>({ keyword: "", status: "", payment: "", page: 1, limit: 10 });
  const [isLoading, setIsLoading] = useState(false);
  const [isNoItem, setIsNoItem]   = useState(false);
  const [totalItem, setTotalItem] = useState(0);

  // Modal xem chi tiết đơn
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [showDetail, setShowDetail]               = useState(false);

  const fetchOrders = useCallback(() => {
    if (!shiftId) {
      setIsNoItem(true);
      return;
    }
    setIsLoading(true);

    ShiftService.getShiftOrders({
      shiftId,
      status:      STATUS_MAP[params.status],
      paymentType: PAYMENT_MAP[params.payment],
      keyword:     params.keyword || undefined,
      page:        params.page,
      size:        params.limit,
    })
      .then((res) => {
        const d = res?.result;
        if (!d) {
          setOrders([]);
          setIsNoItem(true);
          return;
        }

        const mapped: OrderItem[] = (d.orders ?? []).map((o: any) => ({
          id:       o.orderId ?? o.id,
          code:     o.orderCode ?? `#ĐH-${o.orderId}`,
          customer: o.customerName ?? "—",
          time:     o.orderTime   ?? "—",
          payment:  o.paymentMethod ?? "Khác",
          total:    o.totalAmount ?? 0,
          status:   o.status      ?? "—",
        }));

        setOrders(mapped);
        setSummary({
          total:     d.totalOrders     ?? mapped.length,
          revenue:   d.totalRevenue    ?? 0,
          done:      d.completedOrders ?? 0,
          cancelled: d.cancelledOrders ?? 0,
        });
        setTotalItem(d.totalOrders ?? mapped.length);
        setIsNoItem(mapped.length === 0 && !params.keyword && params.page === 1);
      })
      .catch(() => {
        setOrders([]);
        setIsNoItem(true);
      })
      .finally(() => setIsLoading(false));
  }, [shiftId, params]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Cập nhật pagination
  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Đơn hàng trong ca",
    isChooseSizeLimit: true,
    setPage:          (page)  => setParams((p) => ({ ...p, page })),
    chooseSizeLimit:  (limit) => setParams((p) => ({ ...p, limit, page: 1 })),
  });

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    setPagination((prev) => ({
      ...prev,
      page:      params.page,
      sizeLimit: params.limit,
      totalItem,
      totalPage: Math.ceil(totalItem / params.limit) || 1,
    }));
  }, [params.page, params.limit, totalItem]);

  // Filter lists
  const statusList  = useMemo(() => [
    { value: "",          label: "Tất cả trạng thái" },
    { value: "done",      label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ], []);

  const paymentList = useMemo(() => [
    { value: "",         label: "Tất cả thanh toán" },
    { value: "cash",     label: "Tiền mặt" },
    { value: "momo",     label: "QR/Momo" },
    { value: "card",     label: "Thẻ ngân hàng" },
    { value: "transfer", label: "Chuyển khoản" },
  ], []);

  const listFilterItem = useMemo(() => [
    { key: "status",  name: "Tất cả trạng thái", type: "select", is_featured: true, value: params.status  ?? "", list: statusList },
    { key: "payment", name: "Tất cả thanh toán", type: "select", is_featured: true, value: params.payment ?? "", list: paymentList },
  ] as IFilterItem[], [params.status, params.payment, statusList, paymentList]);

  const [listSaveSearch] = useState<ISaveSearch[]>([{ key: "all", name: "Đơn hàng trong ca", is_active: true }]);

  const titles    = ["STT", "Mã đơn", "Khách hàng", "Thời gian", "Thanh toán", "Tổng tiền", "Trạng thái", ""];
  const dataFormat = ["text-center", "", "", "text-center", "text-center", "text-right", "text-center", "text-center"];

  const handleViewDetail = (item: OrderItem) => {
    setSelectedInvoiceId(item.id);
    setShowDetail(true);
  };

  const dataMappingArray = (item: OrderItem, index: number) => [
    getPageOffset(params as any) + index + 1,
    <span className="order-code" key={`code-${item.id}`}>{item.code}</span>,
    item.customer,
    item.time,
    <span className={`pill pill-payment pill-${toPaymentKey(item.payment)}`} key={`pay-${item.id}`}>
      {item.payment}
    </span>,
    <strong key={`total-${item.id}`}>{item.total.toLocaleString()}đ</strong>,
    <span className={`pill pill-status pill-${toStatusKey(item.status)}`} key={`st-${item.id}`}>
      {item.status}
    </span>,
    <span
      className="link-view"
      key={`view-${item.id}`}
      role="button"
      onClick={() => handleViewDetail(item)}
    >
      Xem
    </span>,
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

        {/* Summary cards */}
        <div className="summary-grid">
          <div className="sum-card">
            <div className="label">TỔNG ĐƠN</div>
            <div className="value">{summary.total}</div>
          </div>
          <div className="sum-card">
            <div className="label">DOANH THU CA</div>
            <div className="value text-success">{formatVndCompact(summary.revenue)} VNĐ</div>
          </div>
          <div className="sum-card">
            <div className="label">ĐƠN HOÀN THÀNH</div>
            <div className="value">{summary.done}</div>
          </div>
          <div className="sum-card">
            <div className="label">ĐƠN HỦY</div>
            <div className="value text-danger">{summary.cancelled}</div>
          </div>
        </div>

        {/* Table */}
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
            {isNoItem ? (
              <SystemNotification
                type="no-item"
                description={<span>Chưa có đơn hàng nào trong ca này.<br />Hãy tạo đơn hàng đầu tiên!</span>}
              />
            ) : (
              <SystemNotification
                type="no-result"
                description={<span>Không có dữ liệu trùng khớp.<br />Hãy thay đổi tiêu chí lọc hoặc tìm kiếm.</span>}
              />
            )}
          </Fragment>
        )}
      </div>

      {/* Modal xem chi tiết đơn */}
      {selectedInvoiceId && (
        <ModalDetailSaleInvoice
          idInvoice={selectedInvoiceId}
          onShow={showDetail}
          onHide={() => {
            setShowDetail(false);
            setSelectedInvoiceId(null);
          }}
        />
      )}
    </div>
  );
}

function toStatusKey(status: string): string {
  if (status === "Hoàn thành") return "done";
  if (status === "Đã hủy")     return "cancelled";
  return "processing";
}
function toPaymentKey(payment: string): string {
  if (payment === "Tiền mặt")      return "cash";
  if (payment === "QR/Momo")       return "momo";
  if (payment === "Thẻ ngân hàng") return "card";
  return "transfer";
}
function formatVndCompact(v: number): string {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(1).replace(/\.0$/, "")     + "M";
  if (v >= 1_000)         return (v / 1_000).toFixed(1).replace(/\.0$/, "")          + "K";
  return String(v);
}