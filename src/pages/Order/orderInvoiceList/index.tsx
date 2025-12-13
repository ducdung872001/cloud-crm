import React, { Fragment, useState, useEffect, useRef, useMemo, useCallback, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import classNames from "classnames";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ExportPdf } from "exports/pdf";
import { ExportExcel } from "exports/excel";
import TableDocDefinition from "exports/pdf/table";
import Icon from "components/icon";
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
import { statusOrder } from "types/DataInitialModel";
import { IAction, IFilterItem, IOption, ISaveSearch } from "types/OtherModel";
import { IOrderResponseModel } from "types/order/orderResponseModel";
import { IOrderFilterRequest, IUpdateStatusOrder } from "types/order/orderRequestModel";
import { ContextType, UserContext } from "contexts/userContext";
import { getInfoLogin, showToast } from "utils/common";
import { formatCurrency, isDifferenceObj } from "utils/common";
import OrderService from "services/OrderService";
import ShowInvoiceOrder from "./partials/showInvoiceOrder";

export default function OrderInvoiceList() {
  document.title = "Hóa đơn đặt hàng";

  const isMounted = useRef(false);

  const navigate = useNavigate();

  const checkPermission = getInfoLogin();

  const { name, product_store, permissions } = useContext(UserContext) as ContextType;

  const lstPermissionSales: string[] =
    (permissions &&
      permissions.length > 0 &&
      permissions.find((el) => el.path === "/order/list")["children"].find((ol) => ol.path === "/order/list")["action"]) ||
    [];

  const isPermissionSales = (action: string) => {
    return lstPermissionSales.includes(action);
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [listOrderInvoice, setListOrderInvoice] = useState<IOrderResponseModel[]>([]);
  const [dataInvoice, setDataInvoice] = useState<IOrderResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [idOrderInvoice, setIdOrderInvoice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalDetail, setShowModalDetail] = useState<boolean>(false);

  const [params, setParams] = useState<IOrderFilterRequest>({
    keyword: searchParams.get("keyword") ?? "",
  });

  const listFilter = useMemo(
    () =>
      [
        {
          key: "date",
          name: "Khoảng thời gian",
          type: "date-two",
          is_featured: true,
          value: searchParams.get("from_date") ?? "",
          value_extra: searchParams.get("to_date") ?? "",
        },
        {
          key: "received_date",
          name: "Ngày nhận hàng mong muốn",
          type: "date",
          is_featured: true,
          value: searchParams.get("received_date") ?? "",
        },
        {
          key: "status",
          name: "Trạng thái",
          type: "select",
          list: statusOrder,
          is_featured: true,
          value: searchParams.get("status") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách hóa đơn đặt hàng",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Hóa đơn đặt hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, per_page: limit }));
    },
  });

  const getListOrderInvoice = async (paramsSearch: IOrderFilterRequest) => {
    setIsLoading(true);

    const changeParams = {
      page: paramsSearch.page,
      from_date: paramsSearch.from_date,
      to_date: paramsSearch.to_date,
      keyword: paramsSearch.keyword,
      filters: [
        ...(paramsSearch.date
          ? [
              {
                name: "date",
                value: paramsSearch.date || "",
                operation: "eq",
              },
            ]
          : []),
        ...(paramsSearch.status
          ? [
              {
                name: "status",
                value: paramsSearch.status,
                operation: "eq",
              },
            ]
          : []),
      ],
    };
    // const response = dataInvoiceFake;
    const response = await OrderService.list(changeParams);

    if (response.code === 0) {
      const result = response.result;
      setListOrderInvoice(result.items);

      setPagination({
        ...pagination,
        page: +result.current_page || 1,
        sizeLimit: params.per_page ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.per_page ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0) {
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
      getListOrderInvoice(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.per_page === 10) {
        delete paramsTemp["per_page"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as unknown as Record<string, string | string[]>);
      }
    }
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
        label: `${pagination.totalItem} hóa đơn phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, params]
  );

  const formatExcel = ["center", "top", "top", "top", "top", "right", "top", "center"];

  const exportCallback = useCallback(
    async (type, extension) => {
      const changeParams = {
        page: params.page,
        from_date: params.from_date,
        to_date: params.to_date,
        keyword: params.keyword,
        filters: [
          ...(params.date
            ? [
                {
                  name: "date",
                  value: params.date || "",
                  operation: "eq",
                },
              ]
            : []),
          ...(params.status
            ? [
                {
                  name: "status",
                  value: params.status,
                  operation: "eq",
                },
              ]
            : []),
        ],
      };

      return;

      //   const response = await OrderService.list({
      //     ...changeParams,
      //     page_size: type === "all" ? 10000 : type === "current_page" ? 10 : params.page_size,
      //     type_export: type,
      //   });

      if (response.code === 200) {
        const result = response.result.data;

        if (extension === "excel") {
          ExportExcel({
            fileName: "HoaDonDatHang",
            title: "Hóa đơn đặt hàng",
            header: titles,
            formatExcel: formatExcel,
            data: result.map((item, idx) => dataMappingArray(item, idx, "export")),
            info: { name, product_store },
          });
        } else {
          ExportPdf(
            TableDocDefinition({
              info: { name, product_store },
              title: "Hóa đơn đặt hàng",
              header: titles,
              items: result.map((item, idx) => dataMappingArray(item, idx, "export")),
              customFooter: undefined,
              options: {
                smallTable: true,
              },
            }),
            "HoaDonDatHang"
          );
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

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Tạo đơn đặt hàng",
        callback: () => {
          navigate("/order");
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

  const titles = ["STT", "Mã hóa đơn", "Ngày đặt hàng", "Ngày nhận hàng mong muốn", "NV đặt hàng", "Tiền hàng tạm tính", "Ghi chú", "Trạng thái"];

  const dataFormat = ["text-center", "", "", "", "", "text-right", "", "text-center"];

  const dataMappingArray = (item: IOrderResponseModel, index: number, type?: string) => [
    index + 1,
    item.order_code,
    moment(item.order_date).format("DD/MM/YYYY"),
    item.expected_date ? moment(item.expected_date).format("DD/MM/YYYY") : "",
    name,
    formatCurrency(item.amount),
    item.note,
    ...(type !== "export"
      ? [
          <Badge
            key={index}
            text={
              item.status === "temp"
                ? "Lưu tạm"
                : item.status === "wait_gdp_confirm"
                ? "Đang đợi GDP phê duyệt"
                : item.status === "gpp_cancel"
                ? "GPP đã hủy"
                : item.status === "gdp_processing"
                ? "GDP đang xử lý"
                : item.status === "wait_gpp_confirm"
                ? "Đang đợi gpp xác nhận"
                : item.status === "gdp_cancel"
                ? "GDP đã hủy"
                : item.status === "gdp_confirm"
                ? "GDP đã phê duyệt"
                : "Hoàn thành"
            }
            variant={
              item.status === "wait_gdp_confirm" || item.status === "wait_gpp_confirm"
                ? "primary"
                : item.status === "gdp_processing" || item.status === "temp"
                ? "warning"
                : item.status === "gdp_cancel" || item.status === "gpp_cancel"
                ? "error"
                : "success"
            }
          />,
        ]
      : [
          item.status === "temp"
            ? "Lưu tạm"
            : item.status === "wait_gdp_confirm"
            ? "Đang đợi GDP phê duyệt"
            : item.status === "gpp_cancel"
            ? "Đã hủy"
            : item.status === "gdp_processing"
            ? "GDP đang xử lý"
            : item.status === "wait_gpp_confirm"
            ? "Đang đợi gpp xác nhận"
            : item.status === "gdp_cancel"
            ? "GDP đã hủy"
            : item.status === "gdp_confirm"
            ? "GDP đã phê duyệt"
            : "Hoàn thành",
        ]),
  ];

  const showDialogConfirmDelete = (item?: IOrderResponseModel, type?: "cancel" | "confirm" | "processing") => {
    const contentDialog: IContentDialog = {
      color: type === "cancel" ? "error" : "warning",
      className: type === "cancel" ? "dialog-delete" : "dialog-warning",
      isLoading: true,
      isCentered: true,
      title: `Xác nhận ${type === "cancel" ? "hủy hóa đơn" : type === "processing" ? "đang xử lý" : "phê duyệt"}`,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn {type === "cancel" ? "hủy" : type === "processing" ? "xử lý" : "phê duyệt"}{" "}
          {item ? "hóa đơn " : `${listIdChecked.length} hóa đơn đã chọn`}
          {item ? <strong>{item.order_code}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () =>
        type === "cancel" ? handleCancelInvoice(item.id) : type === "processing" ? handleProcessingInvoice(item.id) : handleConfirmInvoice(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleCancelInvoice = async (id) => {
    if (!id) return;

    const body: IUpdateStatusOrder = {
      id: id,
      status: checkPermission === "GDP" ? "gdp_cancel" : "gpp_cancel",
    };

    return;

    // const response = await OrderService.changeStatus(body);
    if (response.code === 200) {
      showToast("Hủy đơn hàng thành công", "success");
      getListOrderInvoice(params);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setShowDialog(false);
  };

  const handleProcessingInvoice = async (id) => {
    if (!id) return;

    const body: IUpdateStatusOrder = {
      id: id,
      status: "gdp_processing",
    };
    return;

    // const response = await OrderService.changeStatus(body);
    if (response.code === 200) {
      showToast("GDP xử lý đơn thành công", "success");
      getListOrderInvoice(params);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setShowDialog(false);
  };

  const handleConfirmInvoice = async (id: number) => {
    if (!id) return;

    const body: IUpdateStatusOrder = {
      id: id,
      status: checkPermission === "GDP" ? "gdp_confirm" : "done",
    };
    return;

    // const response = await OrderService.changeStatus(body);
    if (response.code === 200) {
      showToast("Phê duyệt đơn thành công", "success");
      getListOrderInvoice(params);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setShowDialog(false);
  };

  const actionsTable = (item: IOrderResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setIdOrderInvoice(item.id);
          setDataInvoice(item);
          setShowModalDetail(true);
          }
        },
      },
      {
        title: "Chỉnh sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          navigate(`/order?id=${item.id}&type=edit`);
          }
        },
      },
      {
        title: "Đang xử lý",
        icon: <Icon name="WarningCircle" className={isCheckedItem ?"icon-disabled": "icon-warning"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          showDialogConfirmDelete(item, "processing");
          }
        },
      },
      {
        title: "Duyệt hóa đơn",
        icon: <Icon name="FingerTouch" className={isCheckedItem ?"icon-disabled": "icon-warning"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          showDialogConfirmDelete(item, "confirm");
          }
        },
      },
      {
        title: "Hủy hóa đơn",
        icon: <Icon name="TimesCircleFill" className={isCheckedItem? "icon-disabled":"icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          showDialogConfirmDelete(item, "cancel");
          }
        },
      },
    ];
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Hủy hóa đơn",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div
      className={classNames("page-content page__order--list", {
        "bg-white": isNoItem,
      })}
    >
      <TitleAction title="Hóa đơn đặt hàng" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        <SearchBox
          name="mã hóa đơn"
          placeholderSearch="Tìm kiếm theo mã hóa đơn"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={listFilter}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listOrderInvoice && listOrderInvoice.length > 0 ? (
          <BoxTable
            name="Danh sách hóa đơn"
            titles={titles}
            items={listOrderInvoice}
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
                    Hiện tại chưa có hoá đơn đặt hàng nào. <br />
                    Hãy thêm mới hoá đơn đặt hàng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton={isPermissionSales("add") ? "Thêm mới hoá đơn đặt hàng" : ""}
                action={() => {
                  isPermissionSales("add") && navigate("/order/create_order");
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
      <ExportModal
        name="Hóa đơn đặt hàng"
        onShow={onShowModalExport}
        onHide={() => setOnShowModalExport(false)}
        options={optionsExport}
        callback={(type, extension) => exportCallback(type, extension)}
      />
      <ShowInvoiceOrder onShow={showModalDetail} onHide={() => setShowModalDetail(false)} id={idOrderInvoice} data={dataInvoice} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
