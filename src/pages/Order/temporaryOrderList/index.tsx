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
import { IAction, IFilterItem, IOption, ISaveSearch } from "types/OtherModel";
import { IOrderResponseModel } from "types/order/orderResponseModel";
import { IOrderFilterRequest, IUpdateStatusOrder } from "types/order/orderRequestModel";
import { ContextType, UserContext } from "contexts/userContext";
import { getInfoLogin, showToast } from "utils/common";
import { formatCurrency, isDifferenceObj } from "utils/common";
import OrderService from "services/OrderService";
import ShowInvoiceOrder from "../orderInvoiceList/partials/showInvoiceOrder";

export default function TemporaryOrderList() {
  document.title = "Đơn đặt lưu tạm";

  const isMounted = useRef(false);
  const navigate = useNavigate();

  const checkPermission = getInfoLogin();

  const { name, product_store, permissions } = useContext(UserContext) as ContextType;

  const lstPermissionSales: string[] =
    (permissions &&
      permissions.length > 0 &&
      permissions.find((el) => el.path === "/order/list")["children"].find((ol) => ol.path === "/order/temp_order")["action"]) ||
    [];

  const isPermissionSales = (action: string) => {
    return lstPermissionSales.includes(action);
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [listTempInvoice, setListTempInvoice] = useState<IOrderResponseModel[]>([]);
  const [dataInvoice, setDataInvoice] = useState<IOrderResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [idTempInvoice, setIdTempInvoice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalDetail, setShowModalDetail] = useState<boolean>(false);

  const [params, setParams] = useState<IOrderFilterRequest>({
    keyword: searchParams.get("keyword") ?? "",
    status: "temp",
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
          key: "date",
          name: "Ngày nhận hàng mong muốn",
          type: "date",
          is_featured: true,
          value: searchParams.get("date") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách đơn đặt lưu tạm",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Hóa đơn lưu tạm",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, per_page: limit }));
    },
  });

  const getListTempInvoice = async (paramsSearch: IOrderFilterRequest) => {
    setIsLoading(true);

    const changeParams = {
      page: paramsSearch.page,
      from_date: paramsSearch.from_date,
      to_date: paramsSearch.to_date,
      keyword: paramsSearch.keyword,
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
        ...(paramsSearch.status
          ? [
            {
              name: "status",
              value: "temp",
              operation: "eq",
            },
          ]
          : []),
      ],
    };
    // return;
    const response = await OrderService.list(changeParams);

    if (response.code === 0) {
      const result = response.result;
      setListTempInvoice(result.items);

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
      getListTempInvoice(params);
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

      const response = await OrderService.list({
        ...changeParams,
        page_size: type === "all" ? 10000 : type === "current_page" ? 10 : params.page_size,
        type_export: type,
      });

      if (response.code === 0) {
        const result = response.result.items;

        if (extension === "excel") {
          ExportExcel({
            fileName: "DonDatLuuTam",
            title: "Đơn đặt lưu tạm",
            header: titles,
            formatExcel: formatExcel,
            data: result.map((item, idx) => dataMappingArray(item, idx, "export")),
            info: { name, product_store },
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

  const titleActions: ITitleActions = {
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

  const dataFormat = ["text-center", "", "text-center", "text-center", "", "text-right", "", "text-center"];

  const dataMappingArray = (item: IOrderResponseModel, index: number, type?: string) => [
    index + 1,
    item.orderCode,
    moment(item.order_date).format("DD/MM/YYYY"),
    moment(item.expected_date).format("DD/MM/YYYY"),
    name,
    formatCurrency(item.amount),
    item.note,
    ...(type !== "export" ? [<Badge key={index} text="Lưu tạm" variant="warning" />] : ["Lưu tạm"]),
  ];

  const showDialogConfirmDelete = (item?: IOrderResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isLoading: true,
      isCentered: true,
      title: "Xác nhận hủy hóa đơn",
      message: (
        <Fragment>
          Bạn có chắc chắn muốn hủy {item ? "hóa đơn " : `${listIdChecked.length} hóa đơn đã chọn`}
          {item ? <strong>{item.orderCode}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => handleCancelInvoice(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleCancelInvoice = async (id) => {
    setShowDialog(false);

    const body: IUpdateStatusOrder = {
      id: id,
      status: checkPermission === "GDP" ? "gdp_cancel" : "gpp_cancel",
    };
    return;

    // const response = await OrderService.changeStatus(body);
    if (response.code === 200) {
      showToast("Hủy đơn lưu tạm thành công", "success");
      getListTempInvoice(params);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setShowDialog(false);
  };

  const actionsTable = (item: IOrderResponseModel): IAction[] => {
    return [
      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" />,
        callback: () => {
          setIdTempInvoice(item.id);
          setDataInvoice(item);
          setShowModalDetail(true);
        },
      },

      {
        title: "Chỉnh sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          navigate(`/order?id=${item.id}&type=temp`);
        },
      },

      {
        title: "Hủy hóa đơn",
        icon: <Icon name="TimesCircleFill" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
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
      className={classNames("page-content page__order--temp", {
        "bg-white": isNoItem,
      })}
    >
      <TitleAction title="Đơn đặt lưu tạm" titleActions={titleActions} />
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
        {!isLoading && listTempInvoice && listTempInvoice.length > 0 ? (
          <BoxTable
            name="Danh sách hóa đơn"
            titles={titles}
            items={listTempInvoice}
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
              <SystemNotification description={<span>Hiện tại chưa có đơn đặt lưu tạm nào.</span>} type="no-item" />
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
      <ShowInvoiceOrder onShow={showModalDetail} onHide={() => setShowModalDetail(false)} id={idTempInvoice} data={dataInvoice} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
