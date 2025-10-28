import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import Badge from "components/badge/badge";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { IInvoiceFilterRequest } from "model/invoice/InvoiceRequestModel";
import { IInvoiceResponse } from "model/invoice/InvoiceResponse";
import { showToast } from "utils/common";
import { formatCurrency, isDifferenceObj, getPageOffset } from "reborn-util";
import InvoiceService from "services/InvoiceService";
import SeeReceipt from "./partials/SeeReceipt";
import "./importInvoiceList.scss";
import { ContextType, UserContext } from "contexts/userContext";

export default function ImportInvoiceList() {
  document.title = "Hóa đơn nhập hàng";

  const navigate = useNavigate();
  const checkUserRoot = localStorage.getItem("user.root");

  const isMounted = useRef(false);
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [searchParams, setSearchParams] = useSearchParams();
  const [listImportInvoice, setListImportInvoice] = useState<IInvoiceResponse[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalViewInvoice, setShowModalViewInvoice] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [idImportInvoice, setIdImportInvoice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const [params, setParams] = useState<IInvoiceFilterRequest>({
    invoiceCode: "",
    invoiceTypes: JSON.stringify(["IV4"]),
  });

  const customerFilterList = useMemo(
    () =>
      [
        // ...(+checkUserRoot == 1 ? [
        //     {
        //       key: "branchId",
        //       name: "Chi nhánh",
        //       type: "select",
        //       is_featured: true,
        //       value: searchParams.get("branchId") ?? "",
        //     },
        //   ] : []
        // ),
        {
          key: "time_buy",
          name: "Ngày nhập",
          type: "date-two",
          param_name: ["fromDate", "toDate"],
          is_featured: true,
          value: searchParams.get("fromDate") ?? "",
          value_extra: searchParams.get("toDate") ?? "",
          is_fmt_text: true,
        },
        {
          key: "employeeId",
          name: "Nhân viên",
          type: "select",
          is_featured: true,
          value: searchParams.get("employeeId") ?? "",
        },
        {
          key: "checkDebt",
          name: "Công nợ",
          type: "select",
          is_featured: true,
          list: [
            {
              value: "-1",
              label: "Tất cả",
            },
            {
              value: "1",
              label: "Còn nợ",
            },
            {
              value: "2",
              label: "Đã xong",
            },
          ],
          value: searchParams.get("checkDebt") ?? "",
        },
        {
          key: "status",
          name: "Trạng thái",
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
      name: "Danh sách hóa đơn nhập hàng",
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
    name: "Hóa đơn nhập hàng",
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

  const getListImportInvoice = async (paramsSearch: IInvoiceFilterRequest) => {
    setIsLoading(true);

    const response = await InvoiceService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListImportInvoice(result.pagedLst.items);

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

      if (+result.pagedLst.total === 0 && !params.invoiceCode && +result.pagedLst.page === 1) {
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
      getListImportInvoice(params);
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

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Nhập hàng",
        callback: () => {
          navigate("/create_invoice_add");
        },
      },
    ],
  };

  const titles = ["STT", "Mã hóa đơn", "Ngày nhập", "Tổng tiền", "VAT", "Giảm giá", "Đã thanh toán", "Công nợ", "Trạng thái"];

  const dataFormat = ["text-center", "", "", "text-right", "text-right", "text-right", "text-right", "text-right", "text-center"];

  const dataMappingArray = (item: IInvoiceResponse, index: number) => [
    getPageOffset(params) + index + 1,
    <span
      key={index}
      style={{ cursor: "pointer" }}
      onClick={() => {
        setIdImportInvoice(item.id);
        setShowModalViewInvoice(true);
      }}
    >
      {item.invoiceCode}
    </span>,
    item.receiptDate ? moment(item.receiptDate).format("DD/MM/YYYY") : "",
    formatCurrency(item.amount),
    "0",
    formatCurrency(item.discount ? item.discount : "0"),
    formatCurrency(item.paid),
    formatCurrency(item.debt ? item.debt : "0"),
    <Badge
      key={item.id}
      text={item.status === 1 ? "Hoàn thành" : item.status === 2 ? "Chưa hoàn thành" : "Đã hủy"}
      variant={item.status === 1 ? "success" : item.status === 2 ? "warning" : "error"}
    />,
  ];

  const actionsTable = (item: IInvoiceResponse): IAction[] => {
    return [
      {
        title: "Xem hóa đơn",
        icon: <Icon name="Eye" />,
        callback: () => {
          setIdImportInvoice(item.id);
          setShowModalViewInvoice(true);
        },
      },
      ...(item.status !== 3
        ? [
            {
              title: "Trả hàng NCC",
              icon: <Icon name="Returns" />,
              callback: () => {
                // setDataImportInvoice(item);
              },
            },
            {
              title: "Hủy hóa đơn",
              icon: <Icon name="TimesCircleFill" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ]
        : []),
    ];
  };

  const onDelete = async (id: number) => {
    const response = await InvoiceService.cancelInvoice(id);

    if (response.code === 0) {
      showToast("Hủy hóa đơn thành công", "success");
      getListImportInvoice(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IInvoiceResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Hủy...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn hủy {item ? "hóa đơn " : `${listIdChecked.length} hóa đơn đã chọn`}
          {item ? <strong>{item.invoiceCode}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => onDelete(item.id),
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
      <TitleAction title="Hóa đơn nhập hàng" titleActions={titleActions} />
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
        {!isLoading && listImportInvoice && listImportInvoice.length > 0 ? (
          <BoxTable
            name="Danh sách hóa đơn"
            titles={titles}
            items={listImportInvoice}
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
                    Hiện tại chưa có hoá đơn nhập hàng nào. <br />
                    Hãy thêm mới hoá đơn nhập hàng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới hoá đơn nhập hàng"
                action={() => {
                  navigate("/create_invoice_add");
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
      <SeeReceipt idInvoice={idImportInvoice} onShow={showModalViewInvoice} onHide={() => setShowModalViewInvoice(false)} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
