import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IFilterItem, ISaveSearch } from "model/OtherModel";
import { getPageOffset } from "reborn-util";
import ShiftService from "services/ShiftService";
import "./OrdersInShiftTab.scss";

// Map frontend filter values → API integer values
const STATUS_MAP: Record<string, number | undefined> = {
  done: 1,
  processing: 2,
  cancelled: 3,
};
const PAYMENT_MAP: Record<string, number | undefined> = {
  cash: 1,
  momo: 2,
  card: 3,
  transfer: 2, // chuyển khoản cũng mapped về 2 (PAYMENT_TRANSFER)
};

type OrderItem = {
  id: number;
  code: string;
  customer: string;
  time: string;
  payment: "Tiền mặt" | "QR/Momo" | "Thẻ ngân hàng" | "Chuyển khoản";
  total: number;
  status: "Hoàn thành" | "Đang xử lý" | "Đã hủy";
};

type OrdersInShiftParams = {
  keyword: string;
  status: "" | "done" | "processing" | "cancelled";
  payment: "" | "cash" | "momo" | "card" | "transfer";
  page: number;
  limit: number;
};

// Mock data — giữ nguyên để hiển thị khi API chưa hoạt động
const MOCK_ORDERS: OrderItem[] = [
  { id: 8241, code: "#ĐH-8241", customer: "Nguyễn Thị Mai", time: "15:12", payment: "Tiền mặt", total: 185000, status: "Hoàn thành" },
  { id: 8242, code: "#ĐH-8242", customer: "Trần Văn Bình", time: "15:28", payment: "QR/Momo", total: 340000, status: "Hoàn thành" },
  { id: 8243, code: "#ĐH-8243", customer: "Lê Hoàng Nam", time: "15:44", payment: "Thẻ ngân hàng", total: 520000, status: "Hoàn thành" },
  { id: 8244, code: "#ĐH-8244", customer: "Phạm Thị Lan", time: "16:05", payment: "Tiền mặt", total: 95000, status: "Đã hủy" },
  { id: 8245, code: "#ĐH-8245", customer: "Vũ Minh Khoa", time: "16:22", payment: "Chuyển khoản", total: 1250000, status: "Hoàn thành" },
  { id: 8246, code: "#ĐH-8246", customer: "Đặng Thu Hà", time: "16:38", payment: "QR/Momo", total: 215000, status: "Hoàn thành" },
  { id: 8247, code: "#ĐH-8247", customer: "Hoàng Văn Đức", time: "16:55", payment: "Tiền mặt", total: 78000, status: "Đang xử lý" },
  { id: 8248, code: "#ĐH-8248", customer: "Bùi Thị Hương", time: "17:10", payment: "Thẻ ngân hàng", total: 460000, status: "Hoàn thành" },
  { id: 8249, code: "#ĐH-8249", customer: "Ngô Thành Long", time: "17:25", payment: "Tiền mặt", total: 325000, status: "Hoàn thành" },
  { id: 8250, code: "#ĐH-8250", customer: "Phan Thị Ngọc", time: "17:40", payment: "QR/Momo", total: 890000, status: "Hoàn thành" },
  { id: 8251, code: "#ĐH-8251", customer: "Đỗ Minh Anh", time: "17:55", payment: "Chuyển khoản", total: 150000, status: "Đang xử lý" },
  { id: 8252, code: "#ĐH-8252", customer: "Nguyễn Văn Tâm", time: "18:02", payment: "Tiền mặt", total: 99000, status: "Hoàn thành" },
];

type Props = { shiftId: number | null };

export default function OrdersInShiftTab({ shiftId }: Props) {
  const isMounted = useRef(false);

  const [orders, setOrders] = useState<OrderItem[]>(MOCK_ORDERS);
  const [summaryData, setSummaryData] = useState({
    total: MOCK_ORDERS.length,
    revenue: MOCK_ORDERS.filter((o) => o.status !== "Đã hủy").reduce((s, o) => s + o.total, 0),
    done: MOCK_ORDERS.filter((o) => o.status === "Hoàn thành").length,
    cancelled: MOCK_ORDERS.filter((o) => o.status === "Đã hủy").length,
  });

  const [params, setParams] = useState<OrdersInShiftParams>({
    keyword: "",
    status: "",
    payment: "",
    page: 1,
    limit: 10,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [totalItem, setTotalItem] = useState<number>(MOCK_ORDERS.length);

  // ── Fetch từ API khi có shiftId ──
  useEffect(() => {
    if (!shiftId) {
      // Chưa có shiftId → dùng mock data, filter phía client
      return;
    }

    setIsLoading(true);
    ShiftService.getShiftOrders({
      shiftId,
      status: STATUS_MAP[params.status],
      paymentType: PAYMENT_MAP[params.payment],
      keyword: params.keyword || undefined,
      page: params.page,
      size: params.limit,
    })
      .then((res) => {
        const d = res?.data;
        if (!d || !d.orders) {
          // API rỗng → giữ mock data nhưng filter phía client
          setIsLoading(false);
          return;
        }

        // Map API response → OrderItem
        const mapped: OrderItem[] = d.orders.map((o: any) => ({
          id: o.orderId ?? o.id,
          code: o.orderCode ?? `#ĐH-${o.orderId}`,
          customer: o.customerName ?? "--",
          time: o.orderTime ?? "",
          payment: o.paymentMethod ?? "Tiền mặt",
          total: o.totalAmount ?? 0,
          status: o.status ?? "Hoàn thành",
        }));

        setOrders(mapped);
        setSummaryData({
          total: d.totalOrders ?? mapped.length,
          revenue: d.totalRevenue ?? 0,
          done: d.completedOrders ?? 0,
          cancelled: d.cancelledOrders ?? 0,
        });
        setTotalItem(d.totalOrders ?? mapped.length);
        setIsNoItem(mapped.length === 0);
      })
      .catch(() => {
        // Lỗi mạng → giữ mock
      })
      .finally(() => setIsLoading(false));
  }, [shiftId, params.page, params.limit, params.keyword, params.status, params.payment]);

  // ── Filter phía client (chỉ dùng khi không có shiftId) ──
  const filteredOrders = useMemo(() => {
    if (shiftId) return orders; // API đã filter server-side
    const keyword = (params.keyword || "").trim().toLowerCase();
    return MOCK_ORDERS.filter((o) => {
      const matchKeyword = !keyword || o.code.toLowerCase().includes(keyword) || o.customer.toLowerCase().includes(keyword);
      const matchStatus =
        !params.status ||
        (params.status === "done" && o.status === "Hoàn thành") ||
        (params.status === "processing" && o.status === "Đang xử lý") ||
        (params.status === "cancelled" && o.status === "Đã hủy");
      const matchPayment =
        !params.payment ||
        (params.payment === "cash" && o.payment === "Tiền mặt") ||
        (params.payment === "momo" && o.payment === "QR/Momo") ||
        (params.payment === "card" && o.payment === "Thẻ ngân hàng") ||
        (params.payment === "transfer" && o.payment === "Chuyển khoản");
      return matchKeyword && matchStatus && matchPayment;
    });
  }, [shiftId, orders, params.keyword, params.status, params.payment]);

  const displayOrders = shiftId ? orders : filteredOrders;
  const displayTotal = shiftId ? totalItem : filteredOrders.length;

  const summary = shiftId
    ? summaryData
    : {
        total: filteredOrders.length,
        revenue: filteredOrders.filter((o) => o.status !== "Đã hủy").reduce((s, o) => s + o.total, 0),
        done: filteredOrders.filter((o) => o.status === "Hoàn thành").length,
        cancelled: filteredOrders.filter((o) => o.status === "Đã hủy").length,
      };

  const itemsPage = useMemo(() => {
    if (shiftId) return displayOrders; // server đã phân trang
    const start = (params.page - 1) * params.limit;
    return filteredOrders.slice(start, start + params.limit);
  }, [shiftId, displayOrders, filteredOrders, params.page, params.limit]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Đơn hàng trong ca",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit, page: 1 })),
  });

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    const total = displayTotal;
    setPagination((prev) => ({
      ...prev,
      page: params.page,
      sizeLimit: params.limit,
      totalItem: total,
      totalPage: Math.ceil(total / params.limit) || 1,
    }));
    setIsNoItem(total === 0 && !params.keyword && params.page === 1);
  }, [params.page, params.limit, params.keyword, params.status, params.payment, displayTotal]);

  const statusList = useMemo(() => [
    { value: "", label: "Tất cả trạng thái" },
    { value: "done", label: "Hoàn thành" },
    { value: "processing", label: "Đang xử lý" },
    { value: "cancelled", label: "Đã hủy" },
  ], []);

  const paymentList = useMemo(() => [
    { value: "", label: "Tất cả thanh toán" },
    { value: "cash", label: "Tiền mặt" },
    { value: "momo", label: "QR/Momo" },
    { value: "card", label: "Thẻ ngân hàng" },
    { value: "transfer", label: "Chuyển khoản" },
  ], []);

  const listFilterItem = useMemo(
    () => [
      { key: "status", name: "Tất cả trạng thái", type: "select", is_featured: true, value: params.status ?? "", list: statusList },
      { key: "payment", name: "Tất cả thanh toán", type: "select", is_featured: true, value: params.payment ?? "", list: paymentList },
    ] as IFilterItem[],
    [params.status, params.payment, statusList, paymentList]
  );

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
    <a className="link-view" key={`view-${item.id}`} onClick={() => console.log("Xem đơn", item)}>Xem</a>,
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
            const paramsTemp = _.cloneDeep(paramsNew);
            setParams({ ...paramsTemp, page: paramsTemp.page ?? 1 });
          }}
          placeholderSearch="Tìm theo mã đơn, khách hàng"
        />

        <div className="summary-grid">
          <div className="sum-card"><div className="label">TỔNG ĐƠN</div><div className="value">{summary.total}</div></div>
          <div className="sum-card"><div className="label">DOANH THU CA</div><div className="value text-success">{formatVndCompact(summary.revenue)} VNĐ</div></div>
          <div className="sum-card"><div className="label">ĐƠN HOÀN THÀNH</div><div className="value">{summary.done}</div></div>
          <div className="sum-card"><div className="label">ĐƠN HỦY</div><div className="value text-danger">{summary.cancelled}</div></div>
        </div>

        {!isLoading && itemsPage && itemsPage.length > 0 ? (
          <div className="table-card">
            <BoxTable
              name="đơn hàng"
              titles={titles}
              items={itemsPage}
              isPagination={true}
              dataPagination={pagination}
              dataMappingArray={(item, index) => dataMappingArray(item, index)}
              dataFormat={dataFormat}
              striped={true}
            />
          </div>
        ) : isLoading ? (
          <div className="p-24"><Loading /></div>
        ) : (
          <Fragment>
            {isNoItem ? (
              <SystemNotification type="no-item" description={<span>Hiện tại chưa có đơn hàng nào trong ca.<br />Hãy tạo đơn hàng đầu tiên nhé!</span>} />
            ) : (
              <SystemNotification type="no-result" description={<span>Không có dữ liệu trùng khớp.<br />Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!</span>} />
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
}

function toStatusKey(status: OrderItem["status"]) {
  if (status === "Hoàn thành") return "done";
  if (status === "Đang xử lý") return "processing";
  return "cancelled";
}
function toPaymentKey(payment: OrderItem["payment"]) {
  if (payment === "Tiền mặt") return "cash";
  if (payment === "QR/Momo") return "momo";
  if (payment === "Thẻ ngân hàng") return "card";
  return "transfer";
}
function formatVndCompact(v: number) {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(v);
}