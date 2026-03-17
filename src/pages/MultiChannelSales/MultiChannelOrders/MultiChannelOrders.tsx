import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import "./MultiChannelOrders.scss";
import BoxTable from "@/components/boxTable/boxTable";
import { DataPaginationDefault, PaginationProps } from "@/components/pagination/pagination";
import Badge from "@/components/badge/badge";
import { BulkActionItemModel } from "@/components/bulkAction/bulkAction";
import { IAction } from "@/model/OtherModel";
import Icon from "@/components/icon";
import ModalDetailOrder from "./ModaDetailOrder/ModalDetailOrder";
import OrderRequestService from "@/services/OrderRequestService";
import moment from "moment";
import { showToast } from "@/utils/common";

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
  const isMounted = useRef(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [listOrder, setListOrder] = useState([]);

  const [params, setParams] = useState({
    name: "",
    limit: 10,
    page: 1,
  });
  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
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
  const fetchData = async (paramsSearch: any) => {
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
      const paramsTemp = _.cloneDeep(params);
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

  const dataMappingArray = (item: any, index: number) => [
    // index + 1,
    <div
      style={{ width: "5rem", cursor: "pointer" }}
      onClick={() => {
        setModalDetail(true);
        setDataOrder(item);
      }}
    >
      {`#OD${item.id}`}
    </div>,
    item.src,
    <div style={{ width: "15rem" }}>
      <span style={{ fontSize: 14, fontWeight: "600" }}>{JSON.parse(item.customerInfo).user.name}</span>
      <div>
        <span style={{ fontSize: 12, fontWeight: "400" }}>{JSON.parse(item.customerInfo).user.phone}</span>
      </div>
    </div>,
    <div style={{ width: "15rem" }}>
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
                  .items.map((i: any) => i.name)
                  .join(", ")
              : ""
          }
        >
          {item.orderInfo && JSON.parse(item.orderInfo)
            ? JSON.parse(item.orderInfo)
                .items.map((i: any) => i.name)
                .join(", ")
            : ""}
        </span>
      </div>
    </div>,
    item.orderInfo && JSON.parse(item.orderInfo)
      ? JSON.parse(item.orderInfo)
          .items.reduce((total: number, i: any) => total + i.price * i.qty, 0)
          .toLocaleString("vi-VN", { style: "currency", currency: "VND" })
      : 0,
    <Badge
      key={item.id}
      text={
        item?.status === "PENDING"
          ? "Chờ xử lý"
          : item?.status === "PROCESSING"
          ? "Đang giao"
          : item?.status === "COMPLETED"
          ? "Hoàn thành"
          : item?.status === "REFUNDED"
          ? "Đã huỷ"
          : ""
      }
      variant={item.status === "PENDING" ? "warning" : item.status === "PROCESSING" ? "primary" : item.status === "COMPLETED" ? "success" : "error"}
    />,
    <div style={{ width: "10rem" }}>{moment(item.orderDate).format("DD/MM/YYYY HH:mm")}</div>,
    <div style={{ width: "10rem" }}>
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
          <span style={{ fontSize: 12, fontWeight: "500", color: "white" }}>Xác nhận</span>
        </div>
      ) : null}

      {item.status === "PROCESSING" ? (
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

      {item.status === "REFUNDED" ? (
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
      callback: () => {},
    },
  ];

  const actionsTable = (item: any): IAction[] => {
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

  const listTabStatus = [
    {
      id: 1,
      lable: "Tất cả",
      value: 184,
      color: "orange",
    },
    {
      id: 2,
      lable: "Chờ xử lý",
      value: 23,
      color: "blue",
    },
    {
      id: 3,
      lable: "Đang giao",
      value: 47,
      color: "orange",
    },
    {
      id: 4,
      lable: "Hoàn thành",
      value: 98,
      color: "green",
    },
    {
      id: 5,
      lable: "Huỷ",
      value: 16,
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
          <div className="button-export">
            <span style={{ fontSize: 14, fontWeight: "500" }}>Xuất Excel</span>
          </div>
        </div>
      </div>

      <div className="list-tab-status">
        {listTabStatus.map((item, index) => (
          <div key={index} className="item-tab-status" style={item.id === 1 ? { backgroundColor: "var(--primary-bg-color)" } : {}}>
            <span style={{ fontSize: 14, fontWeight: "600", color: item.id === 1 ? "white" : "" }}>{item.lable}</span>
            <div className="item-number" style={{ backgroundColor: item.color }}>
              <span style={{ fontSize: 12, fontWeight: "500", color: "white" }}>{item.value}</span>
            </div>
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

      <ModalDetailOrder onShow={modalDetail} onHide={() => setModalDetail(false)} dataOrder={dataOrder} />
    </div>
  );
}
