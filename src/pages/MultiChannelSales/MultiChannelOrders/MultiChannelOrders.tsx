import React, { useEffect, useRef, useState } from "react";
import cloneDeep from "lodash/cloneDeep";

import "./MultiChannelOrders.scss";
import BoxTable from "@/components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "@/components/pagination/pagination";
import Badge from "@/components/badge/badge";
import { BulkActionItemModel } from "@/components/bulkAction/bulkAction";
import { IAction } from "@/model/OtherModel";
import ModalDetailOrder from "./ModaDetailOrder/ModalDetailOrder";
import OrderRequestService from "@/services/OrderRequestService";
import { formatDateTime } from "utils/dateUtils";

import { showToast } from "@/utils/common";
import { useLocation, useNavigate } from "react-router-dom";

export default function MultiChannelOrders() {
  document.title = "Đơn hàng đa kênh";

  /**
   * status:
   * 1 - Chờ xử lý,
   * 2 - Đang giao,
   * 3 - Hoàn thành,
   * 4 - Đã huỷ
   */

  const [modalDetail, setModalDetail] = useState(false);
  const [dataOrder, setDataOrder] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const orderIdFromNotification = location.state?.orderRequestModalId;

  useEffect(() => {
    if (orderIdFromNotification) {
      const getDetailOrderRequest = async (id: number) => {
        try {
           setIsLoading(true);
          const response = await OrderRequestService.detail(id);
          if (response.code === 0) {
            setDataOrder(response.result);
            setModalDetail(true);
            navigate(location.pathname, { replace: true, state: {} });
          } else {
            showToast(response.message ?? "Có lỗi xảy ra", "error");
          }
        } catch (e) {
          showToast("Có lỗi xảy ra", "error");
        } finally {
            setIsLoading(false);
        }
      };
      
      getDetailOrderRequest(orderIdFromNotification);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromNotification]);

  const isMounted = useRef(false);
  const [, setIsNoItem] = useState<boolean>(false);
  const [, setIsPermissions] = useState<boolean>(false);
  const [, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [listOrder, setListOrder] = useState([]);

  const [activeTabId, setActiveTabId] = useState<number>(1);

  const [params, setParams] = useState<Record<string, unknown>>({
    name: "",
    limit: 10,
    page: 1,
  });
  useEffect(() => {
    const paramsTemp = cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //   const fetchData = async () => {
  //     OrderRequestService.list({
  //       limit: params.limit,
  //       page: params.page,
  //     }).then((res) => {
  //       if (res.code === 0) {
  //         console.log(res.result);

  //         setListOrder(res.result.items);
  //         setPagination((prev) => ({ ...prev, total: res.result.total }));
  //       }
  //     });
  //   };
  const abortController = new AbortController();
  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      // Không có filter trên trang này — xuất toàn bộ
      const res = await OrderRequestService.export({});
      if (!res || res.code !== 0) throw new Error(res?.message ?? "Xuất Excel thất bại");
      const base64 = res.result as string;
      const bin = atob(base64); const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `don_hang_da_kenh_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e: unknown) {
      console.error("Export failed", e);
      showToast(e?.message ?? "Xuất Excel thất bại. Vui lòng thử lại.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const fetchData = async (paramsSearch: Record<string, unknown>) => {
    //   setIsLoading(true);

    const response = await OrderRequestService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListOrder(result?.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +result.page === 1) {
        setIsNoItem(true);
      }
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      fetchData(params);
      const paramsTemp = cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }

    return () => {
      abortController.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "đơn hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const titles = ["Mã đơn", "Kênh", "Khách hàng", "Sản phẩm", "Giá trị", "Trạng thái", "Thời gian", ""];
  const dataFormat = ["", "", "t", "", "", "text-center", ""];

  const dataMappingArray = (item: Record<string, unknown>) => [
    // index + 1,
    <div
      key={`code-${item.id}`}
      style={{ width: "5rem", cursor: "pointer" }}
      onClick={() => {
        setModalDetail(true);
        setDataOrder(item);
      }}
    >
      {`#OD${item.id}`}
    </div>,
    item.src,
    <div key={`cust-${item.id}`} style={{ width: "15rem" }}>
      <span style={{ fontSize: 14, fontWeight: "600" }}>{JSON.parse(item.customerInfo).user.name}</span>
      <div>
        <span style={{ fontSize: 12, fontWeight: "400" }}>{JSON.parse(item.customerInfo).user.phone}</span>
      </div>
    </div>,
    <div key={`prod-${item.id}`} style={{ width: "15rem" }}>
      <a
        style={{ fontSize: 14, fontWeight: "600" }}
        onClick={() => {
          setModalDetail(true);
          setDataOrder(item);
        }}
      >
        {item.orderInfo && JSON.parse(item.orderInfo) ? JSON.parse(item.orderInfo).items.length + " sản phẩm" : ""}
      </a>
      <div>
        {/* Nếu dài quá thì hiển thị 50 ký tự + dấu "..." và khi hover vào thì hiển thị full tên sản phẩm (áp dụng cho cả trường hợp có 1 sản phẩm) */}
        <br />
        <span
          style={{
            fontSize: 12,
            fontWeight: "400",
            color: "#939393",
            width: "20rem",
            display: "inline-block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={
            item.orderInfo && JSON.parse(item.orderInfo)
              ? JSON.parse(item.orderInfo)
                  .items.map((i: Record<string, unknown>) => i.name)
                  .join(", ")
              : ""
          }
        >
          {item.orderInfo && JSON.parse(item.orderInfo)
            ? JSON.parse(item.orderInfo)
                .items.map((i: Record<string, unknown>) => i.name)
                .join(", ")
            : ""}
        </span>
      </div>
    </div>,
    item.orderInfo && JSON.parse(item.orderInfo)
      ? JSON.parse(item.orderInfo)
          .items.reduce((total: number, i: Record<string, unknown>) => total + i.price * i.qty, 0)
          .toLocaleString("vi-VN", { style: "currency", currency: "VND" })
      : 0,
    <Badge
      key={item.id}
      text={
        item?.status === "PENDING"
          ? "Chờ xử lý"
          : item?.status === "SHIPPING"
          ? "Đang giao"
          : item?.status === "COMPLETED"
          ? "Hoàn thành"
          : item?.status === "CONFIRMED"
          ? "Đã xác nhận"
          : item?.status === "CANCELED"
          ? "Đã huỷ"
          : ""
      }
      variant={
        item.status === "PENDING"
          ? "warning"
          : item.status === "SHIPPING"
          ? "primary"
          : item.status === "COMPLETED"
          ? "success"
          : item.status === "CONFIRMED"
          ? "success"
          : "error"
      }
    />,
    <div key={`time-${item.id}`} style={{ width: "10rem" }}>{formatDateTime(item.orderDate)}</div>,
    <div key={`act-${item.id}`} style={{ width: "10rem" }}>
      {item.status === "PENDING" ? (
        <div
          style={{
            backgroundColor: "#FF6633",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem",
            borderRadius: "10px",
          }}
        >
          <span
            style={{ fontSize: 12, fontWeight: "500", color: "white" }}
            onClick={() => {
              // handleConfirm(item);
              setModalDetail(true);
              setDataOrder(item);
            }}
          >
            Xác nhận
          </span>
        </div>
      ) : null}

      {item.status === "SHIPPING" ? (
        <div
          style={{
            backgroundColor: "green",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem",
            borderRadius: "10px",
          }}
          onClick={() => {
            setModalDetail(true);
            setDataOrder(item);
          }}
        >
          <span style={{ fontSize: 12, fontWeight: "500", color: "white" }}>Theo dõi</span>
        </div>
      ) : null}

      {item.status === "COMPLETED" ? (
        <div
          style={{
            backgroundColor: "green",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem",
            borderRadius: "10px",
          }}
          onClick={() => {
            setModalDetail(true);
            setDataOrder(item);
          }}
        >
          <span style={{ fontSize: 12, fontWeight: "500", color: "white" }}>Xem chi tiết</span>
        </div>
      ) : null}

      {item.status === "CANCELED" ? (
        <div
          style={{
            backgroundColor: "var(--extra-color-20)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem",
            borderRadius: "10px",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: "500" }}>Hoàn tiền</span>
        </div>
      ) : null}
    </div>,
  ];

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa hoá đơn",
      callback: () => { /* TODO: implement delete */ },
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const actionsTable = (item: Record<string, unknown>): IAction[] => {
    return [
      //   {
      //     title: "Xem chi tiết",
      //     icon: <Icon name="Eye" />,
      //     callback: () => {
      //     },
      //   },
      //   {
      //     title: "Xem chi tiết",
      //     icon: <Icon name="Checked" style={{width: 0}}/>,
      //     callback: () => {
      //     },
      //   },
    ];
  };

  const TAB_STATUS_MAP: Record<number, string | undefined> = {
    1: undefined,          // Tất cả — không filter
    2: "PENDING",
    3: "SHIPPING",
    4: "COMPLETED",
    5: "CANCELED",
  };

  const handleTabChange = (tabId: number) => {
    setActiveTabId(tabId);
    const status = TAB_STATUS_MAP[tabId];
    setParams((prev) => {
      const next = { ...prev, page: 1 };
      if (status) {
        next.status = status;
      } else {
        delete next.status;
      }
      return next;
    });
  };

  const listTabStatus = [
    {
      id: 1,
      lable: "Tất cả",
      color: "orange",
    },
    {
      id: 2,
      lable: "Chờ xử lý",
      color: "blue",
    },
    {
      id: 3,
      lable: "Đang giao",
      color: "orange",
    },
    {
      id: 4,
      lable: "Hoàn thành",
      color: "green",
    },
    {
      id: 5,
      lable: "Huỷ",
      color: "red",
    },
  ];

  return (
    <div className="multi-channel-orders-page">
      <div className="conatiner-header">
        <div>
          <span style={{ fontSize: 24, fontWeight: "700", color: "var(--text-primary-color)" }}>Đơn hàng đa kênh</span>
          <div>
            <span style={{ fontSize: 16, fontWeight: "500", color: "#939394", fontFamily: "none" }}>Tổng hợp đơn từ tất cả kênh bán hàng</span>
          </div>
        </div>

        <div className="conatiner-button">
          <div
            className="button-export"
            onClick={handleExportExcel}
            style={{ cursor: isExporting ? "not-allowed" : "pointer", opacity: isExporting ? 0.7 : 1 }}
          >
            <span style={{ fontSize: 14, fontWeight: "500" }}>
              {isExporting ? "Đang xuất..." : "Xuất Excel"}
            </span>
          </div>
        </div>
      </div>

      <div className="list-tab-status">
        {listTabStatus.map((item) => (
          <div
            key={item.id}
            className="item-tab-status"
            style={item.id === activeTabId ? { backgroundColor: "var(--primary-bg-color)", cursor: "pointer" } : { cursor: "pointer" }}
            onClick={() => handleTabChange(item.id)}
          >
            <span style={{ fontSize: 14, fontWeight: "600", color: item.id === activeTabId ? "white" : "" }}>{item.lable}</span>
          </div>
        ))}
      </div>

      <div className="table-order card-box">
        <BoxTable
          name="Đơn hàng đa kênh"
          titles={titles}
          items={listOrder}
          isPagination={true}
          dataPagination={pagination}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          striped={true}
          isBulkAction={false}
          bulkActionItems={bulkActionList}
          listIdChecked={listIdChecked}
          setListIdChecked={(listId) => setListIdChecked(listId)}
          actions={actionsTable}
          actionType="inline"
        />
      </div>

      <ModalDetailOrder
        onShow={modalDetail}
        onHide={() => {
          setDataOrder(null);
          fetchData(params);
          setModalDetail(false);
        }}
        dataOrder={dataOrder}
      />
    </div>
  );
}