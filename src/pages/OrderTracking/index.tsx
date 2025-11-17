import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { IWorkTypeResponse } from "model/workType/WorkTypeResponseModel";
import { showToast } from "utils/common";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import "./index.scss";
import { useSearchParams } from "react-router-dom";
import OrderRequestService from "services/OrderRequestService";
import moment from "moment";
import ModalRequestDetail from "./partials/ModalRequestDetail";
import KanbanOrderTracking from "./partials/KanbanOrderTracking";
import SelectCustom from "components/selectCustom/selectCustom";
import BeautySalonService from "services/BeautySalonService";

const statusText = {
  PENDING: "Chờ xác nhận",
  COMPLETED: "Hoàn thành",
  PROCESSING: "Đang xử lý",
  RECOMMENDED: "Đã đề xuất lại",
  STORE_RECOMMENDED: "Cửa hàng đề xuất",
  CUSTOMER_CANCELED: "Đã huỷ",
  STORE_CANCELED: "Cửa hàng hủy",
};
const statusColor = {
  PENDING: "orange",
  COMPLETED: "green",
  PROCESSING: "blue",
  RECOMMENDED: "blue",
  STORE_RECOMMENDED: "purple",
  CUSTOMER_CANCELED: "red",
  STORE_CANCELED: "red",
};

export default function OrderTracking() {
  document.title = "Danh sách yêu cầu mua hàng";

  const isMounted = useRef(false);

  const [listOrderTracking, setListOrderTracking] = useState([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(false);

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch, setListSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách yêu cầu mua hàng",
      is_active: true,
    },
    // {
    //   key: "report",
    //   name: "Báo cáo yêu cầu đặt hàng",
    //   is_active: false,
    // },
  ]);
  const [tabActive, setTabActive] = useState("all");

  useEffect(() => {
    setListSaveSearch(
      listSaveSearch.map((item) => {
        return {
          ...item,
          is_active: item.key === tabActive,
        };
      })
    );
  }, [tabActive]);

  const beautySalonFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "bsnId",
        name: "Đại lý",
        type: "select",
        is_featured: true,
        value: searchParams.get("bsnId") ?? "",
      },
      // {
      //   key: "employeeId",
      //   name: "Nhân viên",
      //   type: "select",
      //   is_featured: true,
      //   value: searchParams.get("employeeId") ?? "",
      // },
    ],
    [searchParams]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "yêu cầu đặt hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListOrderTracking = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await OrderRequestService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListOrderTracking(result.items || []);

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
    const paramsTemp = _.cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListOrderTracking(params);
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

  const titleActions: ITitleActions = {
    actions: [
      ...(isRegimeKanban
        ? [
            {
              title: "Danh sách yêu cầu",
              callback: () => {
                // hiển thị chế độ kanban
                setIsRegimeKanban(!isRegimeKanban);
              },
            },
          ]
        : [
            {
              title: "Kanban",
              callback: () => {
                setIsRegimeKanban(true);
              },
            },
          ]),
    ],
  };

  const titles = ["STT", "Tên đại lý", "Tên khách hàng", "Sản phẩm", "Ngày đặt", "Nơi đặt", "Ghi chú", "Trạng thái"];

  const dataFormat = ["text-center", "", "", "", "text-center", "", "", "text-center"];

  const [showModalRequestDetail, setShowModalRequestDetail] = useState<boolean>(false);
  const [dataRequestDetail, setDataRequestDetail] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState<any>(null);

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item?.beautySalonName || item.bsnId,
    item?.customerInfo ? JSON.parse(item.customerInfo).name : "",
    <a
      onClick={(e) => {
        if (item?.orderInfo && JSON.parse(item?.orderInfo) && JSON.parse(item?.orderInfo)?.items?.length > 0) {
          setShowModalRequestDetail(true);
          setDataRequestDetail(JSON.parse(item.orderInfo).items);
          setCustomerInfo(item?.customerInfo ? JSON.parse(item.customerInfo) : null);
        }
      }}
    >
      {"Xem " + (item?.orderInfo ? JSON.parse(item.orderInfo)?.items?.length : "0") + " sản phẩm"}
    </a>,
    item?.createdAt ? moment(item.createdAt).format("DD/MM/YYYY") : "",
    item?.src || "",
    item?.note || "",
    <div
      className={`status-table status-${statusColor[item.status]}`}
      style={{
        fontWeight: 500,
        fontSize: 14,
        color: `${statusColor[item.status]}`,
        border: `1px solid ${statusColor[item.status]}`,
        padding: "4px 8px",
        borderRadius: "8px",
        // minWidth: "132px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {statusText[item.status]}
    </div>,
  ];

  const actionsTable = (item: IWorkTypeResponse): IAction[] => {
    return [
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await OrderRequestService.delete(id);

    if (response.code === 0) {
      showToast("Xóa loại yêu cầu đặt hàng thành công", "success");
      getListOrderTracking(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IWorkTypeResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "yêu cầu đặt hàng " : `${listIdChecked.length} yêu cầu đặt hàng đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa loại yêu cầu đặt hàng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const [valueBeautySalon, setValueBeautySalon] = useState(null);

  const loadOptionBeautySalon = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BeautySalonService.list(param);
    const optionProcess =
      page === 1
        ? [
            // {
            //   value: -1,
            //   label: "Tất cả quy trình",
            // },
          ]
        : [];

    if (response.code === 0) {
      const dataOption = response.result.items;

      if (dataOption.length > 0) {
        dataOption.map((item: any) => {
          optionProcess.push({
            value: item.id,
            label: item.name,
          });
        });
      }

      return {
        options: optionProcess,
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  useEffect(() => {
    loadOptionBeautySalon("", undefined, { page: 1 });
  }, []);

  const handleChangeValueBeautySalon = (e) => {
    setValueBeautySalon(e);
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListOrderTracking(params);

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

  return (
    <div className={`page-content page-order-tracking${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Danh sách yêu cầu mua hàng" titleActions={titleActions} />
      <div className={`${isRegimeKanban ? "d-none" : ""}`}>
        <div className="card-box d-flex flex-column">
          <SearchBox
            name="Tên yêu cầu đặt hàng"
            setTabActive={setTabActive}
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            isFilter={true}
            isHiddenSearch={tabActive == "all" ? false : true}
            listFilterItem={beautySalonFilterList}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
          {tabActive == "all" ? (
            <>
              {!isLoading && listOrderTracking && listOrderTracking.length > 0 ? (
                <BoxTable
                  name="Danh sách yêu cầu mua hàng"
                  titles={titles}
                  items={listOrderTracking}
                  isPagination={true}
                  dataPagination={pagination}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                  isBulkAction={true}
                  listIdChecked={listIdChecked}
                  bulkActionItems={bulkActionList}
                  striped={true}
                  setListIdChecked={(listId) => setListIdChecked(listId)}
                  actions={actionsTable}
                  actionType="inline"
                />
              ) : isLoading ? (
                <Loading />
              ) : (
                <Fragment>
                  {isPermissions ? (
                    <SystemNotification type="no-permission" />
                  ) : isNoItem ? (
                    <SystemNotification
                      description={
                        <span>
                          Hiện tại chưa có yêu cầu đặt hàng nào. <br />
                        </span>
                      }
                      type="no-item"
                      // titleButton="Thêm mới yêu cầu đặt hàng"
                      // action={() => {
                      // }}
                    />
                  ) : (
                    <SystemNotification
                      description={
                        <span>
                          Không có dữ liệu trùng khớp.
                          <br />
                          Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                        </span>
                      }
                      type="no-result"
                    />
                  )}
                </Fragment>
              )}
            </>
          ) : null}
        </div>
      </div>
      <div className={`${!isRegimeKanban ? "d-none" : ""}`}>
        <div
          style={{
            width: "100%",
            padding: "2rem",
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <div
            style={{
              width: "30%",
            }}
          >
            <SelectCustom
              id="bsnId"
              name="bsnId"
              fill={true}
              required={true}
              options={[]}
              value={valueBeautySalon}
              onChange={(e) => {
                if (e.value !== valueBeautySalon?.value) {
                  handleChangeValueBeautySalon(e);
                }
              }}
              isAsyncPaginate={true}
              placeholder="Chọn đại lý"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionBeautySalon}
            />
          </div>
        </div>
        <div>
          <KanbanOrderTracking
            beautySalonId={valueBeautySalon?.value}
            setShowModalRequestDetail={setShowModalRequestDetail}
            setDataRequestDetail={setDataRequestDetail}
            setCustomerInfo={setCustomerInfo}
          />
        </div>
      </div>

      <ModalRequestDetail
        onShow={showModalRequestDetail}
        data={dataRequestDetail}
        customerInfo={customerInfo}
        onHide={(reload) => {
          if (reload) {
          }
          setShowModalRequestDetail(false);
          setDataRequestDetail(null);
          setCustomerInfo(null);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
