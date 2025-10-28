import React, { Fragment, useState, useEffect, useRef, useMemo, useCallback, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import { ExportExcel } from "exports";
import Loading from "components/loading";
import Badge from "components/badge/badge";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import ExportModal from "components/exportModal/exportModal";
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
import ShowModalDetailSaleInvoice from "./partials/ShowModalDetailSaleInvoice";
import RecoverPublicDebts from "pages/Common/RecoverPublicDebts";
import "./SaleInvoiceList.scss";

export default function SaleInvoiceList() {
  document.title = "Hóa đơn bán hàng";

  const checkUserRoot = localStorage.getItem("user.root");

  const { name, dataBranch } = useContext(UserContext) as ContextType;

  const navigate = useNavigate();

  const isMounted = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [listSaleInvoice, setListSaleInvoice] = useState<IInvoiceResponse[]>([]);
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
    name: "Hóa đơn bán hàng",
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

  const getListSaleInvoice = async (paramsSearch: IInvoiceFilterRequest) => {
    setIsLoading(true);

    const response = await InvoiceService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListSaleInvoice(result.pagedLst.items);
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

  const exportCallback = useCallback(
    async (type, extension) => {
      const response = await InvoiceService.list({
        ...params,
        page: type === "current_page" ? 1 : params.page,
        limit: type === "all" || type === "current_search" ? 10000 : params.limit,
      });

      if (response.code === 0) {
        const result = response.result.pagedLst.items;

        const totalSummary = [
          "Tổng tiền",
          "",
          "",
          result.map((item) => item.amount).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
          0,
          result.map((item) => item.discount).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
          result.map((item) => item.paid).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
          result.map((item) => item.amountCard).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
          result.map((item) => item.debt).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
          "",
        ];

        if (extension === "excel") {
          ExportExcel({
            fileName: "HoaDonBanHang",
            title: "Hóa đơn bán hàng",
            header: titles,
            formatExcel: formatExcel,
            data: result.map((item, idx) => dataMappingArray(item, idx, "export")),
            info: { name },
            footer: totalSummary,
          });
        }
        showToast("Xuất file thành công", "success");
        setOnShowModalExport(false);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
        setOnShowModalExport(false);
      }
    },
    [params]
  );

  const actionsTable = (item: IInvoiceResponse): IAction[] => {
    return [
      {
        title: "Xem hóa đơn",
        icon: <Icon name="Eye" />,
        callback: () => {
          setIdSaleInvoice(item.id);
          setShowModalViewInvoice(true);
        },
      },
      ...(item.status !== 3
        ? [
            {
              title: "Khách trả hàng",
              icon: <Icon name="Returns" />,
              callback: () => {
                // setDataImportInvoice(item);
              },
            },
            {
              title: "Hủy hóa đơn",
              icon: <Icon name="TimesCircleFill" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item, 1);
              },
            },
          ]
        : [
            ...(checkUserRoot == "1"
              ? [
                  {
                    title: "Xóa hóa đơn",
                    icon: <Icon name="TimesCircleFill" className="icon-error" />,
                    callback: () => {
                      showDialogConfirmDelete(item, 2);
                    },
                  },
                ]
              : []),
          ]),
    ];
  };

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

  return (
    <div className={`page-content page__import--invoice${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Hóa đơn bán hàng" titleActions={titleActions} />
      <div className="card-box d-flex flex-column">
        <div className="total__summary">
          <div className="total__summary--sales">
            <span className="key">Tổng doanh số: </span>
            <span className="value">{formatCurrency(dataTotal.totalSales)}</span>
          </div>
          <div className="total__summary--revenue">
            <span className="key">Tổng doanh thu: </span>
            <span className="value">{formatCurrency(dataTotal.totalRevenue)}</span>
          </div>
        </div>
        <SearchBox
          name="Mã hóa đơn"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listSaleInvoice && listSaleInvoice.length > 0 ? (
          <BoxTable
            name="Danh sách hóa đơn"
            titles={titles}
            items={listSaleInvoice}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            isBulkAction={true}
            bulkActionItems={bulkActionList}
            listIdChecked={listIdChecked}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có hoá đơn bán hàng nào. <br />
                    Hãy thêm mới hoá đơn bán hàng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới hoá đơn bán hàng"
                action={() => {
                  navigate("/create_sale_add");
                }}
              />
            ) : (
              <SystemNotification
                description={
                  <span>
                    Không có dữ liệu trùng khớp. <br />
                    Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                  </span>
                }
                type="no-result"
              />
            )}
          </Fragment>
        )}
      </div>
      <RecoverPublicDebts
        onShow={showModalDebt}
        idCustomer={idCustomer}
        dataInvoice={dataInvoice}
        onHide={(reload) => {
          if (reload) {
            getListSaleInvoice(params);
          }
          setShowModalDebt(false);
        }}
      />
      <ExportModal
        name="Hóa đơn bán hàng"
        onShow={onShowModalExport}
        onHide={() => setOnShowModalExport(false)}
        options={optionsExport}
        callback={(type, extension) => exportCallback(type, extension)}
      />
      <ShowModalDetailSaleInvoice idInvoice={idSaleInvoice} onShow={showModalViewInvoice} onHide={() => setShowModalViewInvoice(false)} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
