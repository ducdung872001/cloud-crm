import React, { Fragment, useState, useEffect, useRef, useMemo, useCallback, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Badge from "components/badge/badge";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { IInvoiceFilterRequest } from "model/invoice/InvoiceRequestModel";
import { IInvoiceResponse } from "model/invoice/InvoiceResponse";
import { showToast } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import { formatCurrency, isDifferenceObj, getPageOffset } from "reborn-util";
import InvoiceService from "services/InvoiceService";
import "./SaleInvoiceList.scss";
import OrderList from "@/pages/CounterSales/components/OrderList";
import { Order } from "@/pages/CounterSales/types";
import Button from "@/components/button/button";

export default function SaleInvoiceList() {
  document.title = "Danh sách đơn hàng";

  const checkUserRoot = localStorage.getItem("user.root");

  const { name, dataBranch } = useContext(UserContext) as ContextType;

  const navigate = useNavigate();

  const isMounted = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [listSaleInvoice, setListSaleInvoice] = useState<Order[]>([]);
  const [dataInvoice, setDataInvoice] = useState<IInvoiceResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalViewInvoice, setShowModalViewInvoice] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [idSaleInvoice, setIdSaleInvoice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalDebt, setShowModalDebt] = useState<boolean>(false);
  const [idCustomer, setIdCustomer] = useState<number>(null);

  const [params, setParams] = useState<IInvoiceFilterRequest>({
    invoiceCode: "",
    invoiceTypes: JSON.stringify(["IV1", "IV3"]),
    limit: 10,
    page: 1,
  });

  const customerFilterList = useMemo(
    () =>
      [
        // ...(+checkUserRoot == 1
        //   ? [
        //       {
        //         key: "branchId",
        //         name: "Chi nhánh",
        //         type: "select",
        //         is_featured: true,
        //         value: searchParams.get("branchId") ?? "",
        //       },
        //     ]
        //   : []),
        {
          key: "time_buy",
          name: "Khoảng thời gian",
          type: "date-two",
          param_name: ["fromDate", "toDate"],
          is_featured: true,
          value: searchParams.get("fromDate") ?? "",
          value_extra: searchParams.get("toDate") ?? "",
          is_fmt_text: true,
        },

        {
          key: "departmentId",
          name: "Phòng ban",
          type: "select",
          is_featured: true,
          value: searchParams.get("departmentId") ?? "",
        },
        {
          key: "customerId",
          name: "Khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("customerId") ?? "",
        },
        {
          key: "status",
          name: "Trạng thái hóa đơn",
          type: "select",
          is_featured: true,
          list: [
            {
              value: "-1",
              label: "Tất cả",
            },
            {
              value: "1",
              label: "Hoàn thành",
            },
            {
              value: "2",
              label: "Chưa hoàn thành",
            },
            {
              value: "3",
              label: "Đã hủy",
            },
          ],
          value: searchParams.get("status") ?? "",
        },
        {
          key: "keyword",
          name: "Tìm kiếm tên dịch vụ/sản phẩm",
          type: "input",
          is_featured: true,
          value: searchParams.get("keyword") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách hóa đơn bán hàng",
      is_active: true,
    },
  ]);

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

  const [dataTotal, setDataTotal] = useState({
    totalRevenue: 0,
    totalSales: 0,
  });

  const abortController = new AbortController();
  // export interface Order {
  //   id: string;
  //   code: string;
  //   source: "offline" | "shopee" | "tiktok" | "website";
  //   sourceLabel: string;
  //   status: "pending" | "shipping" | "delivered" | "cancelled";
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
      console.log("result", result);
      let listSaleInvoiceTemp: Order[] = result.pagedLst.items.map(
        (item) =>
          ({
            id: item.id.toString(),
            code: item.invoiceCode,
            source: "offline",
            sourceLabel: "🏪 Tại quầy",
            status: item.status === 1 ? "delivered" : item.status === 2 ? "pending" : "cancelled",
            statusLabel: item.status === 1 ? "✅ Đã giao" : item.status === 2 ? "⏳ Chờ xử lý" : "❌ Đã hủy",
            time: moment(item.receiptDate).format("DD/MM/YYYY · HH:mm"),
            customer: {
              id: item.customerId.toString(),
              name: item.customerName || "Khách lẻ",
              initial: item.customerName ? item.customerName.charAt(0).toUpperCase() : "K",
              phone: item.customerPhone || "0978 654 321",
              points: 0,
              tier: "",
              color: "#2563eb",
            },
            // items: `${item.invoiceDetails.length} sản phẩm · ${item.paid >= item.amount ? "Đã thanh toán" : "Chưa thanh toán"} ${
            //   item.invoiceDetails.some((detail) => detail.isCardPayment) ? "· Đã giao" : ""
            // }`,
            items: "3 sản phẩm · Đã thanh toán · Đã giao 20/10",
            total: item.amount,
          } as Order)
      );
      console.log("listSaleInvoiceTemp", listSaleInvoiceTemp);

      setListSaleInvoice(result.pagedLst.page == 1 ? listSaleInvoiceTemp : [...listSaleInvoice, ...listSaleInvoiceTemp]);
      setDataTotal({
        totalSales: result.totalSales || 0,
        totalRevenue: result.totalRevenue || 0,
      });

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

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);
  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả hóa đơn",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem} lịch sử phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, params]
  );

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Bán hàng",
        callback: () => {
          navigate("/create_sale_add");
        },
      },
    ],
    actions_extra: [
      {
        title: "Xuất danh sách",
        icon: <Icon name="Download" />,
        callback: () => {
          setOnShowModalExport(true);
        },
      },
    ],
  };

  const titles = ["STT", "Mã hóa đơn", "Ngày bán", "Tổng tiền", "VAT", "Giảm giá", "Đã thanh toán", "Trả từ thẻ", "Công nợ", "Trạng thái hóa đơn"];

  const dataFormat = ["text-center", "", "", "text-right", "text-right", "text-right", "text-right", "text-right", "text-right", "text-center"];

  const dataMappingArray = (item: IInvoiceResponse, index: number, type?: string) =>
    type !== "export"
      ? [
          getPageOffset(params) + index + 1,
          <span
            key={index}
            style={{ cursor: "pointer" }}
            onClick={() => {
              setIdSaleInvoice(item.id);
              setShowModalViewInvoice(true);
            }}
          >
            {item.invoiceCode}
          </span>,
          moment(item.receiptDate).format("DD/MM/YYYY"),
          formatCurrency(item.amount),
          "0",
          formatCurrency(item.discount ? item.discount : "0"),
          formatCurrency(item.paid),
          formatCurrency(item.amountCard ? item.amountCard : "0"),
          item.debt ? (
            <Tippy key={item.id} content="Click vào để thu hồi công nợ">
              <span
                className="d-flex align-items-center justify-content-end recover-public-debts"
                style={{ cursor: "pointer", color: "var(--warning-color)", fontWeight: "500" }}
                onClick={() => {
                  setIdCustomer(item.customerId);
                  setShowModalDebt(true);
                  setDataInvoice(item);
                }}
              >
                {formatCurrency(item.debt)} <Icon name="FingerTouch" />
              </span>
            </Tippy>
          ) : (
            formatCurrency("0")
          ),

          <Badge
            key={item.id}
            text={item.status === 1 ? "Hoàn thành" : item.status === 2 ? "Chưa hoàn thành" : "Đã hủy"}
            variant={item.status === 1 ? "success" : item.status === 2 ? "warning" : "error"}
          />,
        ]
      : [
          getPageOffset(params) + index + 1,
          item.invoiceCode,
          moment(item.receiptDate).format("DD/MM/YYYY"),
          item.amount || 0,
          0,
          item.discount || 0,
          item.paid || 0,
          item.amountCard || 0,
          item.debt || 0,
          item.status === 1 ? "Hoàn thành" : item.status === 2 ? "Chưa hoàn thành" : "Đã hủy",
        ];

  const formatExcel = ["center", "top", "center", "right", "right", "right", "right", "right", "right", "center"];

  const onDelete = async (id: number) => {
    const response = await InvoiceService.cancelInvoice(id);

    if (response.code === 0) {
      showToast("Hủy hóa đơn thành công", "success");
      getListSaleInvoice(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = async () => {
    const arrPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        InvoiceService.cancelInvoice(item).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      if (result.length > 0) {
        showToast("Hủy hóa đơn thành công", "success");
        getListSaleInvoice(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  /**
   *
   * @param item
   * @param type 1 - Hủy hóa đơn, 2 - xóa hóa đơn
   */
  const showDialogConfirmDelete = (item?: IInvoiceResponse, type?: number) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>{type == 1 ? "Hủy" : "Xóa"}...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn {type == 1 ? "hủy" : "xóa"} {item ? "hóa đơn " : `${listIdChecked.length} hóa đơn đã chọn`}
          {item ? <strong>{item.invoiceCode}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        if (listIdChecked.length > 0) {
          onDeleteAll();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Hủy hóa đơn",
      callback: () => showDialogConfirmDelete(),
    },
  ];
  const handleViewDetail = () => {};
  const handleConfirmOrder = () => {};
  const handleViewReceipt = () => {};
  console.log("listSaleInvoice", listSaleInvoice);

  return (
    <div className="counter-sales__screen">
      <OrderList onViewDetail={handleViewDetail} onViewReceipt={handleViewReceipt} onConfirm={handleConfirmOrder} listOrder={listSaleInvoice} />
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
    </div>
  );
}
