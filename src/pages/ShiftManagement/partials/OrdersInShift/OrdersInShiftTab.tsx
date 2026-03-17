import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IFilterItem, ISaveSearch } from "model/OtherModel";
import { getPageOffset } from "reborn-util";
import "./OrdersInShiftTab.scss";

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

export default function OrdersInShiftTab() {
  const isMounted = useRef(false);

  const allOrders: OrderItem[] = useMemo(
    () => [
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
    ],
    []
  );

  const [params, setParams] = useState<OrdersInShiftParams>({
    keyword: "",
    status: "",
    payment: "",
    page: 1,
    limit: 10,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const statusList = useMemo(
    () => [
      { value: "", label: "Tất cả trạng thái" },
      { value: "done", label: "Hoàn thành" },
      { value: "processing", label: "Đang xử lý" },
      { value: "cancelled", label: "Đã hủy" },
    ],
    []
  );

  const paymentList = useMemo(
    () => [
      { value: "", label: "Tất cả thanh toán" },
      { value: "cash", label: "Tiền mặt" },
      { value: "momo", label: "QR/Momo" },
      { value: "card", label: "Thẻ ngân hàng" },
      { value: "transfer", label: "Chuyển khoản" },
    ],
    []
  );

  const listFilterItem = useMemo(
    () =>
      [
        {
          key: "status",
          name: "Tất cả trạng thái",
          type: "select",
          is_featured: true,
          value: params.status ?? "",
          list: statusList,
        },
        {
          key: "payment",
          name: "Tất cả thanh toán",
          type: "select",
          is_featured: true,
          value: params.payment ?? "",
          list: paymentList,
        },
      ] as IFilterItem[],
    [params.status, params.payment, statusList, paymentList]
  );

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Đơn hàng trong ca",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Đơn hàng trong ca",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit, page: 1 })),
  });

  const filteredOrders = useMemo(() => {
    const keyword = (params.keyword || "").trim().toLowerCase();

    return allOrders.filter((o) => {
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
  }, [allOrders, params.keyword, params.status, params.payment]);

  const summary = useMemo(() => {
    const total = filteredOrders.length;
    const done = filteredOrders.filter((o) => o.status === "Hoàn thành").length;
    const cancelled = filteredOrders.filter((o) => o.status === "Đã hủy").length;
    const revenue = filteredOrders.filter((o) => o.status !== "Đã hủy").reduce((sum, o) => sum + o.total, 0);
    return { total, done, cancelled, revenue };
  }, [filteredOrders]);

  const itemsPage = useMemo(() => {
    const start = (params.page - 1) * params.limit;
    const end = start + params.limit;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, params.page, params.limit]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setIsLoading(true);
    const t = setTimeout(() => {
      const totalItem = filteredOrders.length;
      setPagination((prev) => ({
        ...prev,
        page: params.page,
        sizeLimit: params.limit,
        totalItem,
        totalPage: Math.ceil(totalItem / params.limit) || 1,
      }));
      setIsNoItem(totalItem === 0 && !params.keyword && params.page === 1);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(t);
  }, [params.page, params.limit, params.keyword, params.status, params.payment, filteredOrders.length]);

  const titles = ["STT", "Mã đơn", "Khách hàng", "Thời gian", "Thanh toán", "Tổng tiền", "Trạng thái", ""];
  const dataFormat = ["text-center", "", "", "text-center", "text-center", "text-right", "text-center", "text-center"];

  const dataMappingArray = (item: OrderItem, index: number) => [
    getPageOffset(params as any) + index + 1,
    <span className="order-code" key={`code-${item.id}`}>
      {item.code}
    </span>,
    item.customer,
    item.time,
    <span className={`pill pill-payment pill-${toPaymentKey(item.payment)}`} key={`pay-${item.id}`}>
      {item.payment}
    </span>,
    <strong key={`total-${item.id}`}>{item.total.toLocaleString()}đ</strong>,
    <span className={`pill pill-status pill-${toStatusKey(item.status)}`} key={`st-${item.id}`}>
      {item.status}
    </span>,
    <a className="link-view" key={`view-${item.id}`} onClick={() => console.log("Xem đơn", item)}>
      Xem
    </a>,
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
          <div className="p-24">
            <Loading />
          </div>
        ) : (
          <Fragment>
            {isNoItem ? (
              <SystemNotification
                type="no-item"
                description={
                  <span>
                    Hiện tại chưa có đơn hàng nào trong ca.
                    <br />
                    Hãy tạo đơn hàng đầu tiên nhé!
                  </span>
                }
              />
            ) : (
              <SystemNotification
                type="no-result"
                description={
                  <span>
                    Không có dữ liệu trùng khớp.
                    <br />
                    Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                  </span>
                }
              />
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
